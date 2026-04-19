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

export function getAvailableForWithdraw(
  db: Database,
  tg: string
): { ok: true; u: { id: number; balance_usdt_minor: number }; av: number } | { ok: false } {
  const u = getUserByTg(db, tg);
  if (!u) return { ok: false };
  return { ok: true, u, av: availableMinorDb(db, u) };
}

export function createWithdrawal(
  db: Database,
  c: AppConfig,
  tg: string,
  toAddress: string,
  amountMinor: number
) {
  if (!isValidTronTrc20Address(toAddress)) {
    return { ok: false, error: "invalid_tron_address" as const };
  }
  const u = getUserByTg(db, tg);
  if (!u) return { ok: false, error: "no_user" as const };
  const fees = getFeeSnapshot(db, c);
  if (amountMinor < c.minWithdrawMinor) {
    return { ok: false, error: "below_min" as const };
  }
  const feeMinor = applyFee2Part(
    amountMinor,
    fees.withdrawFeeFixedUsdt,
    fees.withdrawFeeBps
  );
  const need = amountMinor + feeMinor;
  const av = availableMinorDb(db, u);
  if (need > av) {
    return { ok: false, error: "insufficient" as const };
  }
  const id = `wd_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const ikey = `wdr:req:${id}`;

  if (getWithdrawAutoApprove(db, c)) {
    const tr = db.transaction(() => {
      db.prepare(
        "INSERT INTO withdrawals (id, user_id, to_address, amount_minor, fee_minor, status, idempotency_key, created_at) VALUES (?,?,?,?,?,?,?,?)"
      ).run(id, u.id, toAddress, amountMinor, feeMinor, "sent", ikey, now);
      addBalance(db, u.id, -need);
    });
    tr();
    insertUserNotification(db, {
      user_id: u.id,
      kind: "withdraw",
      variant: "success",
      message: `Withdrawal request for ${(amountMinor / 100).toFixed(2)} USDT created.`,
      source_id: id,
      created_at: now,
    });
    sibAfterWithdrawSent(db, u.id);
    fireSibJournalSyncHook(c, tg, "admin-auto");
    const trace = "admin-auto";
    logEvent(trace, "central.withdraw_sent", { id, to: toAddress, amount: amountMinor });
    logChain(db, u.id, "withdraw", JSON.stringify({ id, amount: amountMinor, to: toAddress, auto: true }));
    const ch = resolveChainLabels(c, db);
    if (c.liveTronSend && c.withdrawWalletPrivateKey && isValidTronTrc20Address(toAddress) && tryClaimIdempotency(db, `live_withdraw:${id}`)) {
      void sendUsdtTrc20(c, c.withdrawWalletPrivateKey, toAddress, amountMinor, trace);
    } else if (c.liveTronSend && c.withdrawWalletPrivateKey && isValidTronTrc20Address(toAddress)) {
      logEvent(trace, "chain.live.withdraw_idem_skip", { id });
    } else {
      stubWithdrawSend(ch.withdrawWallet, toAddress, amountMinor, trace);
    }
    return { ok: true as const, id, auto: true as const };
  }

  db.prepare(
    "INSERT INTO withdrawals (id, user_id, to_address, amount_minor, fee_minor, status, idempotency_key, created_at) VALUES (?,?,?,?,?,?,?,?)"
  ).run(id, u.id, toAddress, amountMinor, feeMinor, "pending_approval", ikey, now);
  insertUserNotification(db, {
    user_id: u.id,
    kind: "withdraw",
    variant: "success",
    message: `Withdrawal request for ${(amountMinor / 100).toFixed(2)} USDT created.`,
    source_id: id,
    created_at: now,
  });
  sibOnWithdrawRequest(db, u.id);
  return { ok: true as const, id, auto: false as const };
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

export function setWithdrawalSent(db: Database, c: AppConfig, wId: string) {
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
  const tr = db.transaction(() => {
    addBalance(db, w.user_id, -need);
    const now = new Date().toISOString();
    db.prepare("UPDATE withdrawals SET status=?, resolved_at=? WHERE id=?").run("sent", now, wId);
  });
  tr();
  sibAfterWithdrawSent(db, w.user_id);
  const trace = "admin-manual";
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
  if (amountMinor < c.minWithdrawMinor) {
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
