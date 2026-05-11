import type { Database } from "better-sqlite3";
import type { AppConfig } from "../config.js";
import { config } from "../config.js";
import { logChain } from "../integrations/opsLog.js";
import { logEvent } from "../httpEnvelope.js";
import { addBalance, getUserById } from "../repos/userRepo.js";
import { getLatestTradePositionByUserId } from "../repos/tradePositionRepo.js";

export function hasPendingWithdrawApproval(db: Database, userId: number): boolean {
  const r = db
    .prepare(
      "SELECT 1 as x FROM withdrawals WHERE user_id = ? AND status = 'pending_approval' LIMIT 1"
    )
    .get(userId) as { x: number } | undefined;
  return Boolean(r);
}

function setSibFlags(db: Database, userId: number, active: boolean, needActivationClose: boolean) {
  db.prepare("UPDATE users SET sib_active = ?, sib_need_activation_close = ? WHERE id = ?").run(
    active ? 1 : 0,
    needActivationClose ? 1 : 0,
    userId
  );
}

function markCloseSkipped(db: Database, userId: number, positionId: string, reason: string) {
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO sib_skipped_closes (user_id, position_id, reason, created_at)
     VALUES (?,?,?,?)
     ON CONFLICT(user_id, position_id) DO UPDATE SET
       reason = excluded.reason,
       created_at = excluded.created_at`,
  ).run(userId, positionId, reason, now);
}

/** Call when balance hits zero (withdraw / admin). */
export function sibOnBalanceZero(db: Database, userId: number) {
  setSibFlags(db, userId, false, false);
}

/** User pressed Stop: keep journal sync, but disable all future balance accruals until Start. */
export function sibOnUserStop(db: Database, userId: number) {
  setSibFlags(db, userId, false, false);
}

/** User pressed Start: if balance positive, resume accrual from the next eligible close only. */
export function sibOnUserStart(db: Database, userId: number) {
  sibReevaluateAfterDeposit(db, userId);
}

/**
 * After deposit / manual credit: if balance positive, align SIB with trade journal (last entry open vs closed).
 */
export function sibReevaluateAfterDeposit(db: Database, userId: number) {
  const u = getUserById(db, userId);
  if (!u) return;
  if (u.balance_usdt_minor <= 0) {
    sibOnBalanceZero(db, userId);
    return;
  }
  const latest = getLatestTradePositionByUserId(db, userId);
  if (!latest) {
    setSibFlags(db, userId, false, true);
    return;
  }
  const open = latest.closed_at == null || String(latest.closed_at).trim() === "";
  if (open) {
    setSibFlags(db, userId, false, true);
  } else {
    setSibFlags(db, userId, true, false);
  }
}

/** Withdraw request entered admin queue — SIB becomes inactive (no % until resolved). */
export function sibOnWithdrawRequest(db: Database, userId: number) {
  const u = getUserById(db, userId);
  if (!u) return;
  setSibFlags(db, userId, false, false);
}

/** After withdrawal sent or auto-approved: wait for next closed trade if balance remains. */
export function sibAfterWithdrawSent(db: Database, userId: number) {
  const u = getUserById(db, userId);
  if (!u) return;
  if (u.balance_usdt_minor <= 0) {
    sibOnBalanceZero(db, userId);
  } else {
    setSibFlags(db, userId, false, true);
  }
}

export function sibAfterWithdrawRejected(db: Database, userId: number) {
  sibReevaluateAfterDeposit(db, userId);
}

export type SibCloseRow = { id?: string; result?: number };

/**
 * B_new = round(B_current × (1 + r/100)) in USDT minor units (integer).
 * Implemented as round(B × (100 + r) / 100) — same in ℝ, but avoids float error from `(1 + r/100)` (e.g. 60 @ 2.5%).
 */
export function sibNextBalanceMinor(balanceBeforeMinor: number, resultPercent: number): number {
  return Math.round((balanceBeforeMinor * (100 + resultPercent)) / 100);
}

/**
 * Apply `closes[].result` as percent of current balance for each closed trade (idempotent per position).
 * Per deal: **B_new = B_current × (1 + r/100)** with `r` = trade result %; balance is integer USDT minor →
 * `B_new = round(B_current × (1 + r/100))`, `delta = B_new - B_current`.
 * Skips entirely while a withdrawal waits for admin approval.
 */
export function sibApplyClosesFromIngest(
  db: Database,
  userId: number,
  tgUserId: string,
  closes: SibCloseRow[],
  trace: string
): { applied: number; skipped: number } {
  if (!closes.length) return { applied: 0, skipped: 0 };
  if (hasPendingWithdrawApproval(db, userId)) {
    logEvent(trace, "sib.ingest.skip", { tg_user_id: tgUserId, reason: "withdraw_pending_approval" });
    return { applied: 0, skipped: closes.length };
  }

  let applied = 0;
  let skipped = 0;

  const existsStmt = db.prepare(
    "SELECT 1 as x FROM sib_adjustments WHERE user_id = ? AND position_id = ? LIMIT 1"
  );
  const skippedStmt = db.prepare(
    "SELECT 1 as x FROM sib_skipped_closes WHERE user_id = ? AND position_id = ? LIMIT 1"
  );

  for (const row of closes) {
    const positionId = String(row.id ?? "").trim();
    if (!positionId) {
      skipped += 1;
      continue;
    }
    const rp = Number(row.result);
    if (!Number.isFinite(rp)) {
      skipped += 1;
      continue;
    }

    const already = existsStmt.get(userId, positionId) as { x: number } | undefined;
    if (already) {
      skipped += 1;
      continue;
    }
    const skippedBefore = skippedStmt.get(userId, positionId) as { x: number } | undefined;
    if (skippedBefore) {
      skipped += 1;
      continue;
    }

    const user = getUserById(db, userId);
    if (!user) {
      skipped += 1;
      continue;
    }
    if (Number(user.bot_trading_enabled ?? 0) !== 1) {
      markCloseSkipped(db, userId, positionId, "bot_stopped");
      skipped += 1;
      continue;
    }
    if (user.balance_usdt_minor <= 0) {
      markCloseSkipped(db, userId, positionId, "no_balance");
      skipped += 1;
      continue;
    }

    const tr = db.transaction(() => {
      const u0 = getUserById(db, userId);
      if (!u0 || u0.balance_usdt_minor <= 0) {
        throw new Error("no_balance");
      }

      let u = u0;
      const active0 = Number(u.sib_active ?? 0) === 1;
      const need0 = Number(u.sib_need_activation_close ?? 0) === 1;

      if (!active0 && !need0) {
        throw new Error("inactive_gate");
      }

      if (!active0 && need0) {
        setSibFlags(db, userId, true, false);
      }

      u = getUserById(db, userId)!;
      const balanceBefore = u.balance_usdt_minor;
      const balanceAfterRounded = sibNextBalanceMinor(balanceBefore, rp);
      const deltaMinor = balanceAfterRounded - balanceBefore;
      addBalance(db, userId, deltaMinor);

      const u1 = getUserById(db, userId)!;
      const balAfter = u1.balance_usdt_minor;
      const adjId = `sib_adj_${positionId}`;
      const now = new Date().toISOString();
      db.prepare(
        `INSERT INTO sib_adjustments (id, user_id, position_id, result_percent, delta_minor, balance_after_minor, created_at)
         VALUES (?,?,?,?,?,?,?)`
      ).run(adjId, userId, positionId, rp, deltaMinor, balAfter, now);

      logChain(
        db,
        userId,
        "sib_close",
        JSON.stringify({ position_id: positionId, result_percent: rp, delta_minor: deltaMinor })
      );
      /** Иначе при sync AL в консоль летят сотни/тысячи строк на одного пользователя. */
      if (process.env.LOG_EACH_SIB_ADJUST === "1") {
        logEvent(trace, "sib.adjust", {
          tg_user_id: tgUserId,
          position_id: positionId,
          result_percent: rp,
          delta_minor: deltaMinor,
          balance_after_minor: balAfter,
        });
      }

      if (balAfter <= 0) {
        sibOnBalanceZero(db, userId);
      }
    });

    try {
      tr();
      applied += 1;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === "inactive_gate" || msg === "no_balance") {
        markCloseSkipped(db, userId, positionId, msg);
        skipped += 1;
      } else {
        throw e;
      }
    }
  }

  return { applied, skipped };
}

/** Optional outbound ping so an external engine pushes/freshens the trading journal. */
export function fireSibJournalSyncHook(c: AppConfig, tgUserId: string, trace: string): void {
  const url = c.sibJournalSyncUrl.trim();
  if (!url) return;
  const payload = JSON.stringify({ tg_user_id: tgUserId });
  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    signal: AbortSignal.timeout(8000)
  })
    .then(() => logEvent(trace, "sib.journal_hook.ok", { tg_user_id: tgUserId }))
    .catch((e: unknown) =>
      logEvent(trace, "sib.journal_hook.fail", {
        tg_user_id: tgUserId,
        error: e instanceof Error ? e.message : String(e)
      })
    );
}

/** Used when module loads without passing config (tests). */
export function fireSibJournalSyncForUser(tgUserId: string, trace: string): void {
  fireSibJournalSyncHook(config, tgUserId, trace);
}
