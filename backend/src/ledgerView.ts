import crypto from "node:crypto";
import type { Database } from "better-sqlite3";
import { config } from "./config.js";
import { getBotTradingEnabled, getUserByTg, type UserRow } from "./repos/userRepo.js";
import { isAlTradeFeedConfigured } from "./services/alTradeFeedSync.js";
import {
  listOpenTradePositionsByUserId,
  listTradePositionsByUserId,
  type TradePositionRow
} from "./repos/tradePositionRepo.js";
import { getAvailableForWithdraw, lockedForWithdraws } from "./services/withdrawalService.js";
import { getDb } from "./db/connection.js";
import type { MoneyOperationRecord } from "./ledgerTypes.js";
import { getCurrentPositiveBalanceStartedAtMs } from "./miniapp/positiveBalanceWindow.js";

export type { MoneyOperationRecord } from "./ledgerTypes.js";

export type TradingPositionTimed = {
  symbol: string;
  side: "long" | "short";
  size_minor: number;
  opened_at: string;
  /** Set when position is closed; omitted or null = still open. */
  closed_at?: string | null;
};

function accountSeed(userId: string) {
  return crypto.createHash("sha256").update(userId).digest().readUInt32BE(0);
}

function normalizeSide(raw: string): "long" | "short" {
  return String(raw).toLowerCase() === "short" ? "short" : "long";
}

function rowsToTimed(rows: TradePositionRow[]): TradingPositionTimed[] {
  return rows.map((r) => ({
    symbol: String(r.symbol).trim(),
    side: normalizeSide(r.side),
    size_minor: r.size_minor,
    opened_at: r.opened_at,
    ...(r.closed_at != null && String(r.closed_at).trim() !== ""
      ? { closed_at: r.closed_at }
      : {})
  }));
}

function rowsToSnapshotPositions(rows: TradePositionRow[]): {
  symbol: string;
  side: "long" | "short";
  size_minor: number;
}[] {
  return rows.map((r) => ({
    symbol: String(r.symbol).trim(),
    side: normalizeSide(r.side),
    size_minor: r.size_minor
  }));
}

export const TRADING_PERIOD_KEYS = ["24h", "3d", "7d", "30d"] as const;
export type TradingPeriodKey = (typeof TRADING_PERIOD_KEYS)[number];

const PERIOD_SECONDS: Record<TradingPeriodKey, number> = {
  "24h": 86400,
  "3d": 3 * 86400,
  "7d": 7 * 86400,
  "30d": 30 * 86400
};

export function parseTradingPeriod(raw: unknown): TradingPeriodKey {
  const s = typeof raw === "string" ? raw.trim() : "";
  if ((TRADING_PERIOD_KEYS as readonly string[]).includes(s)) return s as TradingPeriodKey;
  return "7d";
}

function getTradingActivityStartedAtMs(db: Database, tg: string, seedFallback: number): number {
  const now = Date.now();
  const u = getUserByTg(db, tg);
  if (!u) {
    const days = 5 + (seedFallback % 60);
    return now - days * 86400000;
  }
  let startMs = new Date(u.created_at).getTime();
  if (Number.isNaN(startMs)) startMs = now - 86400000;
  const row = db
    .prepare(
      "SELECT MIN(completed_at) as m FROM deposits WHERE user_id = ? AND status = 'completed' AND completed_at IS NOT NULL AND trim(completed_at) != ''"
    )
    .get(u.id) as { m: string | null };
  if (row?.m) {
    const dm = new Date(row.m).getTime();
    if (!Number.isNaN(dm)) startMs = Math.min(startMs, dm);
  }
  return startMs;
}

/** `/api/v1/ui/trading-details` — window filter; if history is shorter than requested, return maximum available. */
export function getTradingDetailsForPeriod(userId: string, period: TradingPeriodKey) {
  const db = getDb();
  const seed = accountSeed(userId);
  const nowMs = Date.now();
  const requestedSec = PERIOD_SECONDS[period];

  const u = getUserByTg(db, userId);
  const alSimBase = () => ({
    feed_configured: isAlTradeFeedConfigured(config),
    syncs_this_user:
      isAlTradeFeedConfigured(config) &&
      config.alTradeFeedSyncTgIds.some((x) => String(x).trim() === String(userId).trim())
  });
  if (!u) {
    return {
      screen: "trading-details" as const,
      period,
      period_seconds_requested: requestedSec,
      period_seconds_effective: 0,
      trading_history_seconds: 0,
      stats_capped_to_history: false,
      positions: [] as TradingPositionTimed[],
      stats_source: "trade-journal" as const,
      wallet_minor: 0,
      bot_trading_enabled: false,
      al_trading_simulator: alSimBase()
    };
  }

  const activityStartMs = getTradingActivityStartedAtMs(db, userId, seed);
  const positiveBalanceStartedAtMs = getCurrentPositiveBalanceStartedAtMs(db, u.id);
  const requestedStartMs = nowMs - requestedSec * 1000;

  const allTimed = rowsToTimed(listTradePositionsByUserId(db, u.id));
  /** Earliest open time among journal rows (ingest may report opens slightly before `users.created_at`). */
  let earliestOpenMs = Number.POSITIVE_INFINITY;
  for (const p of allTimed) {
    const t = new Date(p.opened_at).getTime();
    if (!Number.isNaN(t)) earliestOpenMs = Math.min(earliestOpenMs, t);
  }
  const periodFloorMs =
    positiveBalanceStartedAtMs != null
      ? positiveBalanceStartedAtMs
      : Number.isFinite(earliestOpenMs) && allTimed.length > 0
        ? Math.min(activityStartMs, earliestOpenMs)
        : activityStartMs;

  const effectiveStartMs = Math.max(requestedStartMs, periodFloorMs);
  const effectiveEndMs = nowMs;
  const period_seconds_effective = Math.max(0, Math.floor((effectiveEndMs - effectiveStartMs) / 1000));
  const trading_history_seconds = Math.max(0, Math.floor((nowMs - periodFloorMs) / 1000));
  const stats_capped_to_history = periodFloorMs > requestedStartMs;

  const filtered = allTimed.filter((p) => {
    const t = new Date(p.opened_at).getTime();
    return t >= effectiveStartMs && t <= effectiveEndMs;
  });

  const snapshot = getAccountSnapshot(userId);

  return {
    screen: "trading-details" as const,
    period,
    period_seconds_requested: requestedSec,
    period_seconds_effective,
    trading_history_seconds,
    stats_capped_to_history,
    positions: filtered,
    stats_source: snapshot.stats_source,
    wallet_minor: snapshot.wallet_minor,
    bot_trading_enabled: getBotTradingEnabled(db, userId),
    al_trading_simulator: alSimBase()
  };
}

export function getAccountSnapshot(
  userId: string
): {
  available_minor: number;
  locked_minor: number;
  wallet_minor: number;
  pnl_minor: number;
  positions: { symbol: string; side: "long" | "short"; size_minor: number }[];
  stats_source: "external-algo" | "trade-journal";
} {
  const db = getDb();
  const u = getUserByTg(db, userId);
  if (!u) {
    return {
      available_minor: 0,
      locked_minor: 0,
      wallet_minor: 0,
      pnl_minor: 0,
      positions: [],
      stats_source: "trade-journal"
    };
  }
  const a = getAvailableForWithdraw(db, userId);
  if (!a.ok) {
    return { available_minor: 0, locked_minor: 0, wallet_minor: 0, pnl_minor: 0, positions: [], stats_source: "trade-journal" };
  }
  const locked = lockedForWithdraws(db, u.id);
  const posRows = listOpenTradePositionsByUserId(db, u.id);
  const positions = rowsToSnapshotPositions(posRows);
  const stats_source: "external-algo" | "trade-journal" =
    positions.length > 0 && a.av > 0 ? "external-algo" : "trade-journal";
  return {
    available_minor: a.av,
    locked_minor: locked,
    wallet_minor: a.u.balance_usdt_minor,
    pnl_minor: 0,
    positions,
    stats_source
  };
}

export function getMoneyOperations(tg: string, dbOr?: Database): MoneyOperationRecord[] {
  const db = dbOr ?? getDb();
  const u = getUserByTg(db, tg) as (UserRow & { id: number }) | undefined;
  if (!u) return [];
  const depositsRows = db
    .prepare(
      "SELECT id, gross_minor, fee_minor, status, created_at, chain_tx_in FROM deposits WHERE user_id = ? AND status = 'completed' ORDER BY created_at DESC LIMIT 50"
    )
    .all(u.id) as { id: string; gross_minor: number; fee_minor: number; status: string; created_at: string; chain_tx_in: string | null }[];
  const wds = db
    .prepare("SELECT * FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC LIMIT 50")
    .all(u.id) as { id: string; amount_minor: number; fee_minor: number; status: string; created_at: string }[];
  const ref = db
    .prepare(
      "SELECT * FROM referral_payouts WHERE to_user_id = ? ORDER BY id DESC LIMIT 20"
    )
    .all(u.id) as { from_deposit_id: string; amount_usdt_minor: number; created_at: string; from_user_id: number; to_user_id: number }[];

  const toOp: MoneyOperationRecord[] = [];
  for (const d of depositsRows) {
    toOp.push({
      id: d.id,
      kind: "deposit",
      status: "confirmed",
      amount_minor: d.gross_minor,
      fee_minor: d.fee_minor,
      wallet_mask: d.chain_tx_in ?? "USDT TRC20",
      occurred_at: d.created_at
    });
  }
  for (const w of wds) {
    toOp.push({
      id: w.id,
      kind: "withdraw",
      status: w.status === "sent" || w.status === "rejected" ? "confirmed" : "pending",
      amount_minor: w.amount_minor,
      fee_minor: w.fee_minor,
      wallet_mask: w.status,
      occurred_at: w.created_at
    });
  }
  for (const r of ref) {
    toOp.push({
      id: `refpay_${r.from_deposit_id}`,
      kind: "referral",
      status: "confirmed",
      amount_minor: r.amount_usdt_minor,
      fee_minor: null,
      wallet_mask: "Referral",
      occurred_at: r.created_at
    });
  }

  const sibRows = db
    .prepare(
      `SELECT id, delta_minor, result_percent, position_id, created_at FROM sib_adjustments WHERE user_id = ? ORDER BY created_at DESC LIMIT 25`
    )
    .all(u.id) as {
      id: string;
      delta_minor: number;
      result_percent: number;
      position_id: string;
      created_at: string;
    }[];

  for (const s of sibRows) {
    toOp.push({
      id: s.id,
      kind: "sib_trade",
      status: "confirmed",
      /** Signed delta (minor); UI shows +/−. */
      amount_minor: s.delta_minor,
      fee_minor: null,
      wallet_mask: `SIB ${s.result_percent}% · ${s.position_id.slice(0, 12)}`,
      occurred_at: s.created_at
    });
  }

  toOp.sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
  return toOp.slice(0, 25);
}

/** Total USDT minor credited to this user as referral rewards (all time). */
export type DashboardChartPoint = { occurred_at: string; wallet_minor: number };

function dedupeChartPoints(points: DashboardChartPoint[]): DashboardChartPoint[] {
  const out: DashboardChartPoint[] = [];
  for (const p of points) {
    const prev = out[out.length - 1];
    if (prev && prev.occurred_at === p.occurred_at && prev.wallet_minor === p.wallet_minor) continue;
    out.push(p);
  }
  return out;
}

function downsampleDashboardChartPoints(points: DashboardChartPoint[], maxN: number): DashboardChartPoint[] {
  if (points.length <= maxN) return dedupeChartPoints(points);
  const out: DashboardChartPoint[] = [];
  const lastIdx = points.length - 1;
  out.push(points[0]!);
  const innerSlots = maxN - 2;
  for (let i = 1; i <= innerSlots; i++) {
    const idx = Math.min(lastIdx, Math.round((i / (innerSlots + 1)) * lastIdx));
    out.push(points[idx]!);
  }
  out.push(points[lastIdx]!);
  return dedupeChartPoints(out);
}

/**
 * Reconstructs wallet balance over time from ledger events (deposits, withdrawals, referral credits).
 * Last point is aligned to the current `users.balance` snapshot.
 */
export function getDashboardChartPoints(tg: string): DashboardChartPoint[] {
  const db = getDb();
  const u = getUserByTg(db, tg);
  if (!u) {
    return [];
  }

  type Ev = { t: number; delta: number };
  const events: Ev[] = [];

  const deps = db
    .prepare(
      `SELECT COALESCE(completed_at, created_at) AS o, net_minor AS n FROM deposits WHERE user_id = ? AND status = 'completed' ORDER BY o ASC`
    )
    .all(u.id) as { o: string; n: number }[];

  for (const d of deps) {
    const t = Date.parse(d.o);
    if (!Number.isFinite(t)) continue;
    events.push({ t, delta: d.n });
  }

  const wds = db
    .prepare(
      `SELECT created_at AS o, amount_minor, fee_minor FROM withdrawals WHERE user_id = ? AND status = 'sent' ORDER BY created_at ASC`
    )
    .all(u.id) as { o: string; amount_minor: number; fee_minor: number }[];

  for (const w of wds) {
    const t = Date.parse(w.o);
    if (!Number.isFinite(t)) continue;
    events.push({ t, delta: -(w.amount_minor + w.fee_minor) });
  }

  const refs = db
    .prepare(
      `SELECT created_at AS o, amount_usdt_minor AS n FROM referral_payouts WHERE to_user_id = ? ORDER BY created_at ASC`
    )
    .all(u.id) as { o: string; n: number }[];

  for (const r of refs) {
    const t = Date.parse(r.o);
    if (!Number.isFinite(t)) continue;
    events.push({ t, delta: r.n });
  }

  const sibs = db
    .prepare(`SELECT created_at AS o, delta_minor AS d FROM sib_adjustments WHERE user_id = ? ORDER BY created_at ASC`)
    .all(u.id) as { o: string; d: number }[];

  for (const s of sibs) {
    const t = Date.parse(s.o);
    if (!Number.isFinite(t)) continue;
    events.push({ t, delta: s.d });
  }

  events.sort((a, b) => a.t - b.t);

  const createdMs = Date.parse(u.created_at);
  const startMs = Number.isFinite(createdMs) ? createdMs : Date.now();

  const points: DashboardChartPoint[] = [];
  points.push({ occurred_at: new Date(startMs).toISOString(), wallet_minor: 0 });

  let bal = 0;
  for (const e of events) {
    bal += e.delta;
    points.push({ occurred_at: new Date(e.t).toISOString(), wallet_minor: bal });
  }

  const snap = getAccountSnapshot(tg).wallet_minor;
  const nowIso = new Date().toISOString();
  if (points.length === 1) {
    points.push({ occurred_at: nowIso, wallet_minor: snap });
  } else {
    points[points.length - 1] = {
      occurred_at: nowIso,
      wallet_minor: snap
    };
  }

  return downsampleDashboardChartPoints(points, 72);
}

export function getReferralReceivedMinor(tg: string): number {
  const db = getDb();
  const u = getUserByTg(db, tg);
  if (!u) return 0;
  const row = db
    .prepare("SELECT coalesce(sum(amount_usdt_minor), 0) as s FROM referral_payouts WHERE to_user_id = ?")
    .get(u.id) as { s: number };
  return row.s;
}

export type MoneySummaryStats = {
  wallet_minor: number;
  deposit_total_gross_minor: number;
  deposit_total_net_minor: number;
  deposit_count: number;
  withdraw_sent_amount_minor: number;
  withdraw_sent_count: number;
  referral_received_minor: number;
  invited_users_count: number;
  deposit_address: string | null;
};

/** Lifetime aggregates for Money Details (not limited to the operations preview window). */
export function getMoneySummaryStats(tg: string): MoneySummaryStats {
  const db = getDb();
  const u = getUserByTg(db, tg);
  if (!u) {
    return {
      wallet_minor: 0,
      deposit_total_gross_minor: 0,
      deposit_total_net_minor: 0,
      deposit_count: 0,
      withdraw_sent_amount_minor: 0,
      withdraw_sent_count: 0,
      referral_received_minor: 0,
      invited_users_count: 0,
      deposit_address: null
    };
  }
  const dep = db
    .prepare(
      "SELECT count(*) as n, coalesce(sum(gross_minor), 0) as s, coalesce(sum(gross_minor - fee_minor), 0) as net FROM deposits WHERE user_id = ? AND status = 'completed'"
    )
    .get(u.id) as { n: number; s: number; net: number };
  const wd = db
    .prepare(
      "SELECT count(*) as n, coalesce(sum(amount_minor), 0) as s FROM withdrawals WHERE user_id = ? AND status = 'sent'"
    )
    .get(u.id) as { n: number; s: number };
  const invited = db
    .prepare("SELECT count(*) as n FROM users WHERE inviter_tg_id = ?")
    .get(u.tg_user_id) as { n: number };

  return {
    wallet_minor: u.balance_usdt_minor,
    deposit_total_gross_minor: dep.s,
    deposit_total_net_minor: dep.net,
    deposit_count: dep.n,
    withdraw_sent_amount_minor: wd.s,
    withdraw_sent_count: wd.n,
    referral_received_minor: getReferralReceivedMinor(tg),
    invited_users_count: invited.n,
    deposit_address: u.deposit_tron_address?.trim() || null
  };
}
