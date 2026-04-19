import crypto from "node:crypto";
import type { Database } from "better-sqlite3";
import type { AppConfig } from "../config.js";
import { getFeeSnapshot } from "../domain/effectiveConfig.js";
import { usdtHumanToMinor } from "../domain/amounts.js";
import { isValidTronTrc20Address } from "../domain/deriveAddress.js";
import { logEvent } from "../httpEnvelope.js";
import { addBalance, getUserByTg } from "../repos/userRepo.js";
import { applyDepositNet } from "../services/depositService.js";
import { sibOnBalanceZero } from "../services/sibBalance.js";
import { createWithdrawal } from "../services/withdrawalService.js";

export function adminResetBalance(db: Database, tg: string) {
  const u = getUserByTg(db, tg);
  if (!u) throw new Error("not_found");
  db.prepare("UPDATE users SET balance_usdt_minor = 0 WHERE id = ?").run(u.id);
  sibOnBalanceZero(db, u.id);
}

/** Полное удаление пользователя и связанных строк (CASCADE). */
export function adminWipeUser(db: Database, tg: string) {
  const r = db.prepare("DELETE FROM users WHERE tg_user_id = ?").run(tg);
  if (r.changes === 0) throw new Error("not_found");
}

export function adminManualDeposit(
  db: Database,
  c: AppConfig,
  tg: string,
  grossMinor: number,
  trace: string
) {
  if (!Number.isFinite(grossMinor) || grossMinor <= 0) {
    throw new Error("gross_minor_invalid");
  }
  const u = getUserByTg(db, tg);
  if (!u) throw new Error("not_found");
  const fees = getFeeSnapshot(db, c);
  const idem = `admin:manual_deposit:${tg}:${crypto.randomUUID()}`;
  const r = applyDepositNet(db, c, fees, u.id, tg, grossMinor, idem, "admin_manual", null, trace);
  if (!r.ok) throw new Error(String(r.error));
  return r;
}

/**
 * SIB debug: same fee net as real deposit; `from_wallet` is stored in `deposits.chain_tx_in` (mini-app money history).
 * No Telegram / Meta / on-chain gas; SIB + balance + DB row.
 */
export function adminTestDeposit(
  db: Database,
  c: AppConfig,
  tg: string,
  grossMinor: number,
  fromWallet: string,
  trace: string
) {
  if (!Number.isFinite(grossMinor) || grossMinor <= 0) {
    throw new Error("gross_minor_invalid");
  }
  const w = String(fromWallet).trim();
  if (!w || !isValidTronTrc20Address(w)) {
    throw new Error("invalid_from_wallet");
  }
  const u = getUserByTg(db, tg);
  if (!u) throw new Error("not_found");
  const fees = getFeeSnapshot(db, c);
  const idem = `admin:test_deposit:${tg}:${crypto.randomUUID()}`;
  const r = applyDepositNet(db, c, fees, u.id, tg, grossMinor, idem, "admin_test", w, trace);
  if (!r.ok) throw new Error(String(r.error));
  return r;
}

export function adminManualWithdraw(
  db: Database,
  c: AppConfig,
  tg: string,
  toAddress: string,
  amountMinor: number
) {
  const r = createWithdrawal(db, c, tg, toAddress, amountMinor);
  if (!r.ok) throw new Error(r.error);
  return r;
}

/** Привязать рефералов: проставить inviter_tg_id = inviterTg для каждого child (если ещё пусто). */
export function adminAttachReferrals(
  db: Database,
  inviterTg: string,
  childTgs: string[],
  force: boolean
) {
  const inv = getUserByTg(db, inviterTg);
  if (!inv) throw new Error("inviter_not_found");
  let n = 0;
  for (const ct of childTgs) {
    const id = String(ct).trim();
    if (!id || id === inviterTg) continue;
    const ch = getUserByTg(db, id);
    if (!ch) continue;
    if (ch.inviter_tg_id != null && ch.inviter_tg_id !== inviterTg && !force) continue;
    db.prepare("UPDATE users SET inviter_tg_id = ? WHERE id = ?").run(inviterTg, ch.id);
    n += 1;
  }
  return { attached: n };
}

/**
 * Зачислить пользователю targetTg «реферальное» вознаграждение от имени реферера referrerTg (без реального депозита).
 */
export function adminReferralCredit(
  db: Database,
  targetTg: string,
  referrerTg: string,
  amountMinor: number,
  trace: string
) {
  if (!Number.isFinite(amountMinor) || amountMinor <= 0) throw new Error("amount_invalid");
  const toU = getUserByTg(db, targetTg);
  const fromU = getUserByTg(db, referrerTg);
  if (!toU || !fromU) throw new Error("user_not_found");
  const depId = `admin_ref_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const tx = db.transaction(() => {
    db
      .prepare(
        "INSERT INTO referral_payouts (from_user_id, to_user_id, from_deposit_id, amount_usdt_minor, created_at) VALUES (?,?,?,?,?)"
      )
      .run(fromU.id, toU.id, depId, amountMinor, now);
    addBalance(db, toU.id, amountMinor);
  });
  tx();
  logEvent(trace, "admin.referral_credit", {
    target: targetTg,
    referrer: referrerTg,
    amount_minor: amountMinor
  });
  return { ok: true as const, from_deposit_id: depId };
}

export function adminUserExtendedStats(db: Database, tg: string) {
  const u = getUserByTg(db, tg);
  if (!u) return null;
  const uid = u.id;
  const sumDep = (
    db.prepare("SELECT coalesce(sum(gross_minor),0) as s FROM deposits WHERE user_id=? AND status='completed'").get(
      uid
    ) as { s: number }
  ).s;
  const sumWd = (
    db
      .prepare(
        "SELECT coalesce(sum(amount_minor+fee_minor),0) as s FROM withdrawals WHERE user_id=? AND status='sent'"
      )
      .get(uid) as { s: number }
  ).s;
  const refIn = (
    db
      .prepare("SELECT coalesce(sum(amount_usdt_minor),0) as s FROM referral_payouts WHERE to_user_id=?")
      .get(uid) as { s: number }
  ).s;
  const invited = (
    db.prepare("SELECT count(*) as n FROM users WHERE inviter_tg_id = ?").get(tg) as { n: number }
  ).n;
  return {
    tg_user_id: tg,
    balance_usdt_minor: u.balance_usdt_minor,
    sum_deposits_gross_minor: sumDep,
    sum_withdrawals_minor: sumWd,
    referral_received_minor: refIn,
    invited_users_count: invited
  };
}

export function parseGrossMinorFromBody(body: { gross_minor?: unknown; gross_usdt?: unknown }) {
  if (body.gross_minor != null && body.gross_minor !== "") {
    const n = Number(body.gross_minor);
    if (Number.isFinite(n) && n > 0) return Math.round(n);
  }
  if (body.gross_usdt != null && body.gross_usdt !== "") {
    const n = Number(body.gross_usdt);
    if (Number.isFinite(n) && n > 0) return usdtHumanToMinor(n);
  }
  return null;
}
