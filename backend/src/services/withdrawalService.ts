import crypto from "node:crypto";
import type { Database } from "better-sqlite3";
import { applyFee2Part, usdtHumanToMinor } from "../domain/amounts.js";
import type { AppConfig } from "../config.js";
import { tryClaimIdempotency } from "../domain/idempotency.js";
import {
  getFeeSnapshot,
  getWithdrawAutoApprove,
  resolveChainLabels,
  type FeeSnapshot
} from "../domain/effectiveConfig.js";
import { isValidTronTrc20Address } from "../domain/deriveAddress.js";
import { insertUserNotification } from "../repos/notificationRepo.js";
import { getUserByTg, addBalance } from "../repos/userRepo.js";
import { logEvent } from "../httpEnvelope.js";
import { logChain } from "../integrations/opsLog.js";
import { stubWithdrawSend } from "../integrations/chainStubs.js";
import { sendUsdtTrc20 } from "../integrations/tronChainSend.js";
import { checkWithdrawWalletCapacity } from "../integrations/walletHealth.js";
import {
  sibAfterWithdrawRejected,
  sibAfterWithdrawSent,
  sibOnWithdrawRequest,
  fireSibJournalSyncHook
} from "./sibBalance.js";

function lockedForWithdraws(db: Database, userId: number) {
  const q = db
    .prepare(
      "SELECT coalesce(sum(amount_minor + fee_minor), 0) as s FROM withdrawals WHERE user_id = ? AND status IN ('pending_approval','approved')"
    )
    .get(userId) as { s: number };
  return q.s;
}

function availableMinorDb(db: Database, user: { id: number; balance_usdt_minor: number }) {
  return user.balance_usdt_minor - lockedForWithdraws(db, user.id);
}

function notifyWithdrawTemporarilyUnavailable(db: Database, userId: number, createdAt: string) {
  const message = "Withdrawal is temporarily unavailable. Please try again later.";
  const recent = db
    .prepare(
      `SELECT id
       FROM user_notifications
       WHERE user_id = ?
         AND kind = 'withdraw'
         AND variant = 'error'
         AND message = ?
         AND created_at >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-30 minutes')
       ORDER BY created_at DESC
       LIMIT 1`
    )
    .get(userId, message) as { id: string } | undefined;
  if (recent) return recent.id;
  return insertUserNotification(db, {
    user_id: userId,
    kind: "withdraw",
    variant: "error",
    message,
    created_at: createdAt,
  });
}

export function calculateWithdrawFeeMinor(amountMinor: number, fees: Pick<FeeSnapshot, "withdrawFeeFixedUsdt" | "withdrawFeeBps">) {
  return applyFee2Part(amountMinor, fees.withdrawFeeFixedUsdt, fees.withdrawFeeBps);
}

/**
 * Максимальная сумма, которую пользователь может ввести на вывод так, чтобы
 * `amount + fee(amount) <= availableMinor`.
 */
export function maxWithdrawAmountMinor(
  availableMinor: number,
  fees: Pick<FeeSnapshot, "withdrawFeeFixedUsdt" | "withdrawFeeBps">
) {
  const limit = Math.max(0, Math.floor(availableMinor));
  let lo = 0;
  let hi = limit;
  let best = 0;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const fee = calculateWithdrawFeeMinor(mid, fees);
    if (mid + fee <= limit) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}

export function getAvailableForWithdraw(
  db: Database,
  tg: string
): { ok: true; u: { id: number; balance_usdt_minor: number }; av: number } | { ok: false } {
  const u = getUserByTg(db, tg);
  if (!u) return { ok: false };
  return { ok: true, u, av: availableMinorDb(db, u) };
}

export async function createWithdrawal(
  db: Database,
  c: AppConfig,
  tg: string,
  toAddress: string,
  amountMinor: number,
  requestKey?: string | null,
  trace = "withdraw",
) {
  if (!isValidTronTrc20Address(toAddress)) {
    return { ok: false, error: "invalid_tron_address" as const };
  }
  const normalizedAddress = toAddress.trim();
  const normalizedRequestKey =
    typeof requestKey === "string" && requestKey.trim() ? requestKey.trim().slice(0, 120) : "";
  const u = getUserByTg(db, tg);
  if (!u) return { ok: false, error: "no_user" as const };
  const fees = getFeeSnapshot(db, c);
  const minWd = usdtHumanToMinor(fees.minWithdrawUsdt);
  if (amountMinor < minWd) {
    return { ok: false, error: "below_min" as const };
  }
  const feeMinor = calculateWithdrawFeeMinor(amountMinor, fees);
  const need = amountMinor + feeMinor;
  const id = `wd_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const ikey = normalizedRequestKey
    ? `wdr:req:${u.id}:${normalizedRequestKey}`
    : `wdr:req:${id}`;
  const existing = db
    .prepare("SELECT id, status FROM withdrawals WHERE idempotency_key = ?")
    .get(ikey) as { id: string; status: string } | undefined;
  if (existing) {
    return {
      ok: true as const,
      id: existing.id,
      auto: existing.status === "sent",
      dedup: true as const,
    };
  }
  const av = availableMinorDb(db, u);
  // #region agent log
  fetch("http://127.0.0.1:7557/ingest/485fc05c-6ee8-41f5-ad61-28b0be9e281f", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "9e63b5" },
    body: JSON.stringify({
      sessionId: "9e63b5",
      runId: "core-repro",
      hypothesisId: "H3",
      location: "backend/src/services/withdrawalService.ts:116",
      message: "withdrawal request evaluated",
      data: {
        tg,
        amountMinor,
        feeMinor,
        need,
        availableMinor: av,
        autoApprove: getWithdrawAutoApprove(db, c),
        liveTronSend: c.liveTronSend,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  if (need > av) {
    return { ok: false, error: "insufficient" as const };
  }

  const walletCapacity = await checkWithdrawWalletCapacity(db, c, amountMinor);
  if (!walletCapacity.ok) {
    notifyWithdrawTemporarilyUnavailable(db, u.id, now);
    logEvent(trace, "withdraw.capacity_blocked", {
      tg,
      reason: walletCapacity.reason,
      address: walletCapacity.address,
      required_minor: amountMinor,
      trx_balance_sun: walletCapacity.trx_balance_sun,
      usdt_balance_minor: walletCapacity.usdt_balance_minor,
    });
    return { ok: false, error: "withdraw_temporarily_unavailable" as const };
  }

  if (getWithdrawAutoApprove(db, c)) {
    const tr = db.transaction(() => {
      const dup = db
        .prepare("SELECT id, status FROM withdrawals WHERE idempotency_key = ?")
        .get(ikey) as { id: string; status: string } | undefined;
      if (dup) {
        return {
          ok: true as const,
          dedup: true as const,
          id: dup.id,
          auto: dup.status === "sent",
        };
      }
      const fresh = getUserByTg(db, tg);
      if (!fresh) return { ok: false as const, error: "no_user" as const };
      const freshAvailable = availableMinorDb(db, fresh);
      if (need > freshAvailable) {
        return { ok: false as const, error: "insufficient" as const };
      }
      db.prepare(
        "INSERT INTO withdrawals (id, user_id, to_address, amount_minor, fee_minor, status, idempotency_key, created_at) VALUES (?,?,?,?,?,?,?,?)"
      ).run(id, fresh.id, normalizedAddress, amountMinor, feeMinor, "sent", ikey, now);
      addBalance(db, fresh.id, -need);
      return { ok: true as const, userId: fresh.id, dedup: false as const, id, auto: true as const };
    });
    let trResult:
      | { ok: true; userId?: number; dedup: boolean; id: string; auto: boolean }
      | { ok: false; error: "no_user" | "insufficient" };
    try {
      trResult = tr();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("withdrawals.idempotency_key")) {
        const dup = db
          .prepare("SELECT id, status FROM withdrawals WHERE idempotency_key = ?")
          .get(ikey) as { id: string; status: string } | undefined;
        if (dup) {
          return {
            ok: true as const,
            id: dup.id,
            auto: dup.status === "sent",
            dedup: true as const,
          };
        }
      }
      throw error;
    }
    if (!trResult.ok) {
      return { ok: false as const, error: trResult.error };
    }
    if (trResult.dedup) {
      return { ok: true as const, id: trResult.id, auto: trResult.auto, dedup: true as const };
    }
    insertUserNotification(db, {
      user_id: trResult.userId!,
      kind: "withdraw",
      variant: "success",
      message: `Withdrawal request for ${(amountMinor / 100).toFixed(2)} USDT created.`,
      source_id: id,
      created_at: now,
    });
    sibAfterWithdrawSent(db, trResult.userId!);
    fireSibJournalSyncHook(c, tg, "admin-auto");
    const trace = "admin-auto";
    logEvent(trace, "central.withdraw_sent", { id, to: normalizedAddress, amount: amountMinor });
    logChain(db, trResult.userId!, "withdraw", JSON.stringify({ id, amount: amountMinor, to: normalizedAddress, auto: true }));
    const ch = resolveChainLabels(c, db);
    if (c.liveTronSend && c.withdrawWalletPrivateKey && isValidTronTrc20Address(normalizedAddress) && tryClaimIdempotency(db, `live_withdraw:${id}`)) {
      void sendUsdtTrc20(c, c.withdrawWalletPrivateKey, normalizedAddress, amountMinor, trace);
    } else if (c.liveTronSend && c.withdrawWalletPrivateKey && isValidTronTrc20Address(normalizedAddress)) {
      logEvent(trace, "chain.live.withdraw_idem_skip", { id });
    } else {
      stubWithdrawSend(ch.withdrawWallet, normalizedAddress, amountMinor, trace);
    }
    return { ok: true as const, id, auto: true as const, dedup: false as const };
  }

  const tr = db.transaction(() => {
    const dup = db
      .prepare("SELECT id, status FROM withdrawals WHERE idempotency_key = ?")
      .get(ikey) as { id: string; status: string } | undefined;
    if (dup) {
      return {
        ok: true as const,
        dedup: true as const,
        id: dup.id,
        auto: dup.status === "sent",
      };
    }
    const fresh = getUserByTg(db, tg);
    if (!fresh) return { ok: false as const, error: "no_user" as const };
    const freshAvailable = availableMinorDb(db, fresh);
    if (need > freshAvailable) {
      return { ok: false as const, error: "insufficient" as const };
    }
    db.prepare(
      "INSERT INTO withdrawals (id, user_id, to_address, amount_minor, fee_minor, status, idempotency_key, created_at) VALUES (?,?,?,?,?,?,?,?)"
    ).run(id, fresh.id, normalizedAddress, amountMinor, feeMinor, "pending_approval", ikey, now);
    return { ok: true as const, userId: fresh.id, dedup: false as const, id, auto: false as const };
  });
  let trResult:
    | { ok: true; userId?: number; dedup: boolean; id: string; auto: boolean }
    | { ok: false; error: "no_user" | "insufficient" };
  try {
    trResult = tr();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("withdrawals.idempotency_key")) {
      const dup = db
        .prepare("SELECT id, status FROM withdrawals WHERE idempotency_key = ?")
        .get(ikey) as { id: string; status: string } | undefined;
      if (dup) {
        return {
          ok: true as const,
          id: dup.id,
          auto: dup.status === "sent",
          dedup: true as const,
        };
      }
    }
    throw error;
  }
  if (!trResult.ok) {
    return { ok: false as const, error: trResult.error };
  }
  if (trResult.dedup) {
    return { ok: true as const, id: trResult.id, auto: trResult.auto, dedup: true as const };
  }
  insertUserNotification(db, {
    user_id: trResult.userId!,
    kind: "withdraw",
    variant: "success",
    message: `Withdrawal request for ${(amountMinor / 100).toFixed(2)} USDT created.`,
    source_id: id,
    created_at: now,
  });
  sibOnWithdrawRequest(db, trResult.userId!);
  return { ok: true as const, id, auto: false as const, dedup: false as const };
}

export function listWithdrawals(db: Database, st?: string) {
  if (st) {
    return db
      .prepare("SELECT w.*, u.tg_user_id as tg FROM withdrawals w JOIN users u ON w.user_id=u.id WHERE w.status = ? ORDER BY w.created_at DESC")
      .all(st);
  }
  return db
    .prepare("SELECT w.*, u.tg_user_id as tg FROM withdrawals w JOIN users u ON w.user_id=u.id ORDER BY w.created_at DESC")
    .all();
}

export async function setWithdrawalSent(db: Database, c: AppConfig, wId: string, trace = "admin-manual") {
  const w = db.prepare("SELECT * FROM withdrawals WHERE id = ?").get(wId) as {
    id: string;
    user_id: number;
    amount_minor: number;
    fee_minor: number;
    status: string;
  } | null;
  if (!w) return { ok: false, error: "not_found" };
  if (w.status !== "pending_approval" && w.status !== "approved") {
    return { ok: false, error: "bad_state" };
  }
  const need = w.amount_minor + w.fee_minor;
  const u = db.prepare("SELECT * FROM users WHERE id = ?").get(w.user_id) as { balance_usdt_minor: number };
  if (u.balance_usdt_minor < need) return { ok: false, error: "insufficient" };
  const walletCapacity = await checkWithdrawWalletCapacity(db, c, w.amount_minor);
  if (!walletCapacity.ok) {
    notifyWithdrawTemporarilyUnavailable(db, w.user_id, new Date().toISOString());
    logEvent(trace, "withdraw.capacity_blocked", {
      withdrawal_id: wId,
      user_id: w.user_id,
      reason: walletCapacity.reason,
      address: walletCapacity.address,
      required_minor: w.amount_minor,
      trx_balance_sun: walletCapacity.trx_balance_sun,
      usdt_balance_minor: walletCapacity.usdt_balance_minor,
    });
    return { ok: false, error: "withdraw_temporarily_unavailable" as const };
  }
  const tr = db.transaction(() => {
    addBalance(db, w.user_id, -need);
    const now = new Date().toISOString();
    db.prepare("UPDATE withdrawals SET status=?, resolved_at=? WHERE id=?").run("sent", now, wId);
  });
  tr();
  sibAfterWithdrawSent(db, w.user_id);
  const row = db.prepare("SELECT w.*, u.tg_user_id as tg FROM withdrawals w JOIN users u ON w.user_id=u.id WHERE w.id = ?").get(wId) as { to_address: string; amount_minor: number; tg: string; user_id: number } | null;
  if (row) {
    fireSibJournalSyncHook(c, row.tg, trace);
    logEvent(trace, "central.withdraw_sent", { id: wId, to: row.to_address, amount: row.amount_minor, tg: row.tg });
    logChain(db, w.user_id, "withdraw", JSON.stringify({ id: wId, amount: w.amount_minor }));
    const ch = resolveChainLabels(c, db);
    if (
      c.liveTronSend &&
      c.withdrawWalletPrivateKey &&
      isValidTronTrc20Address(row.to_address) &&
      tryClaimIdempotency(db, `live_withdraw:${wId}`)
    ) {
      void sendUsdtTrc20(c, c.withdrawWalletPrivateKey, row.to_address, row.amount_minor, trace);
    } else if (c.liveTronSend && c.withdrawWalletPrivateKey && isValidTronTrc20Address(row.to_address)) {
      logEvent(trace, "chain.live.withdraw_idem_skip", { id: wId });
    } else {
      stubWithdrawSend(ch.withdrawWallet, row.to_address, row.amount_minor, trace);
    }
  }
  return { ok: true };
}

export function rejectWithdrawal(db: Database, wId: string, reason: string) {
  const w = db.prepare("SELECT * FROM withdrawals WHERE id = ?").get(wId) as {
    id: string;
    status: string;
    user_id: number;
  } | null;
  if (!w) return { ok: false, error: "not_found" };
  if (w.status !== "pending_approval" && w.status !== "approved") {
    return { ok: false, error: "bad_state" };
  }
  const now = new Date().toISOString();
  db.prepare("UPDATE withdrawals SET status=?, resolved_at=?, fail_reason=? WHERE id=?").run(
    "rejected",
    now,
    reason,
    wId
  );
  sibAfterWithdrawRejected(db, w.user_id);
  return { ok: true };
}

/**
 * Record-only withdrawal (status `sent`), fees from policy, no approval chain and no TRON send.
 * For admin “test transactions” / SIB debugging.
 */
export function applyTestWithdrawalSent(
  db: Database,
  c: AppConfig,
  tg: string,
  toAddress: string,
  amountMinor: number,
  trace: string
): { ok: true; id: string } | { ok: false; error: string } {
  if (!isValidTronTrc20Address(toAddress)) {
    return { ok: false, error: "invalid_tron_address" };
  }
  const u = getUserByTg(db, tg);
  if (!u) return { ok: false, error: "no_user" };
  const fees = getFeeSnapshot(db, c);
  const minWd = usdtHumanToMinor(fees.minWithdrawUsdt);
  if (amountMinor < minWd) {
    return { ok: false, error: "below_min" };
  }
  const feeMinor = applyFee2Part(amountMinor, fees.withdrawFeeFixedUsdt, fees.withdrawFeeBps);
  const need = amountMinor + feeMinor;
  const av = availableMinorDb(db, u);
  if (need > av) {
    return { ok: false, error: "insufficient" };
  }

  const id = `wd_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const ikey = `wdr:test_sent:${id}`;

  const tr = db.transaction(() => {
    db.prepare(
      `INSERT INTO withdrawals (id, user_id, to_address, amount_minor, fee_minor, status, idempotency_key, created_at, resolved_at)
       VALUES (?,?,?,?,?,?,?,?,?)`
    ).run(id, u.id, toAddress, amountMinor, feeMinor, "sent", ikey, now, now);
    addBalance(db, u.id, -need);
  });
  tr();

  sibAfterWithdrawSent(db, u.id);
  fireSibJournalSyncHook(c, tg, trace);

  logEvent(trace, "admin.test_withdraw_sent", { id, tg_user_id: tg, to: toAddress, amount_minor: amountMinor });
  logChain(db, u.id, "withdraw", JSON.stringify({ id, amount: amountMinor, to: toAddress, test: true }));

  return { ok: true, id };
}

export { availableMinorDb, lockedForWithdraws };
