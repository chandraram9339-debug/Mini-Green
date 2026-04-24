import crypto from "node:crypto";
import type { Database } from "better-sqlite3";
import type { AppConfig } from "../config.js";
import { applyFee2Part, usdtHumanToMinor } from "../domain/amounts.js";
import type { FeeSnapshot } from "../domain/effectiveConfig.js";
import { isReferralDepositCovered } from "../domain/referralRule.js";
import { getFeeSnapshot } from "../domain/effectiveConfig.js";
import { logEvent } from "../httpEnvelope.js";
import { logChain } from "../integrations/opsLog.js";
import { isValidTronTrc20Address } from "../domain/deriveAddress.js";
import { resolveUserDepositPrivateKeyHex } from "../domain/userDepositKey.js";
import { tryClaimIdempotency } from "../domain/idempotency.js";
import { resolveChainLabels } from "../domain/effectiveConfig.js";
import { stubGasToUser, stubSweepToTopup } from "../integrations/chainStubs.js";
import { runLiveDepositSends } from "../integrations/tronChainSend.js";
import { notifyUserDeposit } from "../integrations/telegramBot.js";
import { sendPurchaseCapi } from "../integrations/metaCapi.js";
import { readChainGrossDelta, updateChainSnapshot } from "../integrations/tronUsdt.js";
import { insertUserNotification } from "../repos/notificationRepo.js";
import {
  addBalance,
  bumpDepositCount,
  getInviterId,
  getUserById,
  getUserByTg,
  setBotTradingEnabled,
} from "../repos/userRepo.js";
import { fireSibJournalSyncHook, sibReevaluateAfterDeposit } from "./sibBalance.js";
import { fireTradingEngineNotify } from "./tradingEngineNotify.js";

function refBps(fees: FeeSnapshot) {
  return Math.min(100_000, fees.referralPercentBps);
}

/**
 * Idempotent: same idempotency_key will not double-credit.
 */
export function applyDepositNet(
  db: Database,
  c: AppConfig,
  fees: FeeSnapshot,
  userId: number,
  tgUserId: string,
  grossMinor: number,
  idempotencyKey: string,
  source: "stub" | "chain" | "legacy_ui" | "admin_manual" | "admin_test",
  chainTx: string | null,
  trace: string
) {
  const minM = usdtHumanToMinor(fees.minDepositUsdt);
  if (grossMinor < minM) {
    return { ok: false as const, error: "below_min_deposit" };
  }
  const ex = db
    .prepare("SELECT id as id FROM deposits WHERE idempotency_key = ?")
    .get(idempotencyKey) as { id: string } | undefined;
  if (ex) {
    return { ok: true as const, dedup: true, depositId: ex.id };
  }
  const feeMinor = applyFee2Part(grossMinor, fees.depositFeeFixedUsdt, fees.depositFeeBps);
  const netMinor = grossMinor - feeMinor;
  if (netMinor <= 0) {
    return { ok: false as const, error: "fee_eats_deposit" };
  }
  const id = `dep_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO deposits (id, user_id, gross_minor, fee_minor, net_minor, status, idempotency_key, chain_tx_in, source, created_at, completed_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`
    ).run(
      id,
      userId,
      grossMinor,
      feeMinor,
      netMinor,
      "completed",
      idempotencyKey,
      chainTx,
      source,
      now,
      now
    );
    addBalance(db, userId, netMinor);
    bumpDepositCount(db, userId);
    const u2 = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(userId) as {
      id: number;
      inviter_tg_id: string | null;
      deposit_count: number;
    };
    if (u2.inviter_tg_id) {
      const n = u2.deposit_count;
      if (isReferralDepositCovered(n, fees.referralDepositRule)) {
        const invI = getInviterId(db, u2.inviter_tg_id);
        if (invI != null) {
          const pay = Math.floor((netMinor * refBps(fees)) / 10_000);
          if (pay > 0) {
            const exR = db
              .prepare("SELECT 1 as x FROM referral_payouts WHERE from_deposit_id = ?")
              .get(id) as { x: number } | undefined;
            if (!exR) {
              addBalance(db, invI, pay);
              db.prepare(
                "INSERT INTO referral_payouts (from_user_id, to_user_id, from_deposit_id, amount_usdt_minor, created_at) VALUES (?,?,?,?,?)"
              ).run(u2.id, invI, id, pay, now);
            }
          }
        }
      }
    }
  });
  try {
    tx();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("deposits.idempotency_key")) {
      const dup = db
        .prepare("SELECT id as id FROM deposits WHERE idempotency_key = ?")
        .get(idempotencyKey) as { id: string } | undefined;
      return { ok: true as const, dedup: true, depositId: dup?.id ?? null };
    }
    throw error;
  }
  const us = (netMinor / 100).toFixed(2);
  insertUserNotification(db, {
    user_id: userId,
    kind: "deposit",
    variant: "success",
    message: `Replenishment of ${us} USDT completed.`,
    source_id: id,
    created_at: now,
  });
  const uAfter = getUserById(db, userId);
  if (uAfter && uAfter.balance_usdt_minor > 0) {
    const flipped = setBotTradingEnabled(db, tgUserId, true);
    if (flipped) fireTradingEngineNotify(tgUserId, "start", trace);
  }
  sibReevaluateAfterDeposit(db, userId);
  fireSibJournalSyncHook(c, tgUserId, trace);
  const netUsdt = Number(us);
  logEvent(trace, "central.deposit_completed", {
    user: tgUserId,
    gross: grossMinor,
    net: netMinor,
    id,
    source
  });
  logChain(db, userId, "deposit", JSON.stringify({ id, gross: grossMinor, source }));
  if (source !== "admin_test") {
    const ur = getUserByTg(db, tgUserId);
    const ch = resolveChainLabels(c, db);
    if (ur?.deposit_tron_address) {
      const pkUser = ur ? resolveUserDepositPrivateKeyHex(db, c, ur) : null;
      if (
        source === "chain" &&
        c.liveTronSend &&
        c.gazBankPrivateKey &&
        pkUser &&
        isValidTronTrc20Address(ch.topupBank) &&
        tryClaimIdempotency(db, `live_deposit:${id}`)
      ) {
        void runLiveDepositSends(c, db, userId, ch.topupBank, ur.deposit_tron_address, pkUser, trace).catch(
          (e) => logEvent(trace, "chain.live.deposit_ex", { err: String(e) })
        );
      } else if (
        source === "chain" &&
        c.liveTronSend &&
        c.gazBankPrivateKey &&
        pkUser &&
        isValidTronTrc20Address(ch.topupBank)
      ) {
        logEvent(trace, "chain.live.deposit_idem_skip", { id });
      } else {
        stubGasToUser(ch.gazBank, ur.deposit_tron_address, trace);
        stubSweepToTopup(ch.topupBank, ur.deposit_tron_address, grossMinor, trace);
      }
    }
    notifyUserDeposit(c, tgUserId, us, trace);
    sendPurchaseCapi(db, c, tgUserId, netUsdt, fees, trace, `meta:purchase:${id}`);
  }
  return { ok: true as const, dedup: false, depositId: id, net_minor: netMinor, fee_minor: feeMinor };
}

export async function runDepositOnPaid(
  db: Database,
  c: AppConfig,
  tgUserId: string,
  trace: string
) {
  const u = getUserByTg(db, tgUserId);
  if (!u) {
    return { type: "error" as const, status: 400, error: "no_user" };
  }
  const fees = getFeeSnapshot(db, c);
  if (!c.liveTron) {
    const k = `stub:paid:day:${tgUserId}:${new Date().toISOString().slice(0, 10)}`;
    const g = usdtHumanToMinor(c.stubDepositGrossUsdt);
    if (g <= 0) {
      return { type: "error" as const, status: 400, error: "stub_misconfig" };
    }
    const r = applyDepositNet(db, c, fees, u.id, u.tg_user_id, g, k, "stub", null, trace);
    if (!r.ok) return { type: "error" as const, status: 400, error: r.error };
    if (r.dedup) return { type: "no_op" as const, status: 204 };
    return { type: "ok" as const, status: 200, r };
  }
  const { grossDeltaMinor, currentSnapshot } = await readChainGrossDelta(c, u, db);
  const minM = usdtHumanToMinor(fees.minDepositUsdt);
  // #region agent log
  fetch("http://127.0.0.1:7557/ingest/485fc05c-6ee8-41f5-ad61-28b0be9e281f", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "9e63b5" },
    body: JSON.stringify({
      sessionId: "9e63b5",
      runId: "core-repro",
      hypothesisId: "H2",
      location: "backend/src/services/depositService.ts:197",
      message: "live deposit chain snapshot read",
      data: {
        tgUserId,
        grossDeltaMinor,
        currentSnapshot,
        lastSnapshot: u.last_chain_usdt_balance_minor ?? 0,
        minDepositMinor: minM,
        depositAddressPresent: Boolean(u.deposit_tron_address),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  if (grossDeltaMinor === 0) {
    updateChainSnapshot(db, u.id, currentSnapshot);
    return { type: "no_op" as const, status: 204 };
  }
  if (grossDeltaMinor < minM) {
    return { type: "no_op" as const, status: 204 as const, note: "below_min_deposit" as const };
  }
  const k = `chain:delta:${u.deposit_tron_address}:${grossDeltaMinor}:${u.last_chain_usdt_balance_minor ?? 0}`;
  const r2 = applyDepositNet(
    db,
    c,
    fees,
    u.id,
    u.tg_user_id,
    grossDeltaMinor,
    k,
    "chain",
    null,
    trace
  );
  if (!r2.ok) {
    return { type: "error" as const, status: 400, error: r2.error };
  }
  if (r2.dedup) {
    return { type: "no_op" as const, status: 204 };
  }
  updateChainSnapshot(db, u.id, currentSnapshot);
  return { type: "ok" as const, status: 200, r: r2 };
}
