import type { Database } from "better-sqlite3";
import type { AppConfig } from "../config.js";
import { getDb } from "../db/connection.js";
import {
  getAlTradeFeedPollerStatus,
  isAlTradeFeedConfigured,
  listMirrorTargetTgIds,
} from "../services/alTradeFeedSync.js";
import {
  aggregateDealStatsForWindow,
  emptyDealStatsPayload,
  FIGMA_TRADING_PERIOD_SEC,
  type DealStatsPayload,
} from "./tradingPeriodStats.js";
import { getCurrentPositiveBalanceStartedAtMs } from "./positiveBalanceWindow.js";
import { buildSystemTradingChartPoints, resolveCanonicalTradeMirrorUserId } from "./systemTradingChart.js";

/** `user` — позиции и stats залогиненного пользователя; `system` — канонический mirror AL (вся торговая система на 3-м экране). */
export type TradingJournalFeedScope = "user" | "system";

/** Элементы `items` в ответе `/trading/journal`. */
export type TradingJournalItemPayload = {
  id: string;
  symbol: string;
  side: string;
  size_minor: number;
  opened_at: string;
  closed_at: string | null;
  status: "open" | "closed";
  entry_price: number | null;
  exit_price: number | null;
  result_percent: number | null;
  delta_minor: number | null;
};

export type TradingJournalMeta = {
  limit: number;
  returned: number;
  positions_total: number;
  positions_open: number;
  positions_closed: number;
  /**
   * Статистика за выбранный период — те же числа, что и в `/trading/summary` → `stats[period]`.
   * Инвариант: totalDeals = successful + unsuccessful + neutral + closedWithoutResult.
   */
  period_stats: DealStatsPayload;
  /** Фильтр журнала по вкладке Figma (24h | 3d | 7d | 1m). */
  period_filter: string | null;
  al_feed_configured: boolean;
  /** Этот Telegram user входит в AL_TRADE_FEED_SYNC_TG_IDS (зеркалирование с trade-feed). */
  al_sync_includes_user: boolean;
  al_last_ok_at: string | null;
  al_last_error: string | null;
  al_poller_runs: number;
};

function alSyncIncludesUser(db: Database | null, cfg: AppConfig, tgUserId: string): boolean {
  const target = String(tgUserId).trim();
  if (!db) {
    return cfg.alTradeFeedSyncTgIds.some((x) => String(x).trim() === target);
  }
  return listMirrorTargetTgIds(db, cfg).some((x) => x === target);
}

function positionCounts(db: Database, internalUserId: number): {
  total: number;
  open: number;
  closed: number;
} {
  const r = db
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM trade_positions WHERE user_id = ?) AS total,
        (SELECT COUNT(*) FROM trade_positions WHERE user_id = ? AND closed_at IS NOT NULL AND length(trim(closed_at)) > 0) AS closed_n`,
    )
    .get(internalUserId, internalUserId) as { total: number; closed_n: number };
  const total = Number(r.total) || 0;
  const closed = Number(r.closed_n) || 0;
  const open = Math.max(0, total - closed);
  return { total, open, closed };
}

/** Ответ без пользователя в БД — только мета для отладки связки. */
export type TradingJournalChartPoint = { occurred_at: string; value_pct: number };

export function buildTradingJournalEmptyPayload(
  limit: number,
  tgUserId: string,
  cfg: AppConfig,
  period: string | null,
): { items: TradingJournalItemPayload[]; meta: TradingJournalMeta; system_chart: TradingJournalChartPoint[] } {
  const poll = getAlTradeFeedPollerStatus();
  const db = getDb();
  const nowMs = Date.now();
  const p = period ?? "24h";
  const fromMs = p === "all" ? 0 : nowMs - (FIGMA_TRADING_PERIOD_SEC[p] ?? FIGMA_TRADING_PERIOD_SEC["24h"]) * 1000;
  const fromIso = new Date(fromMs).toISOString();
  const toIso = new Date(nowMs).toISOString();
  const system_chart = buildSystemTradingChartPoints(db, cfg, fromIso, toIso);

  return {
    items: [],
    meta: {
      limit,
      returned: 0,
      positions_total: 0,
      positions_open: 0,
      positions_closed: 0,
      period_stats: emptyDealStatsPayload(),
      period_filter: period,
      al_feed_configured: isAlTradeFeedConfigured(cfg),
      al_sync_includes_user: alSyncIncludesUser(null, cfg, tgUserId),
      al_last_ok_at: poll.last_ok_at,
      al_last_error: poll.last_error ? String(poll.last_error).slice(0, 300) : null,
      al_poller_runs: poll.runs,
    },
    system_chart,
  };
}

/**
 * Журнал сделок для мини-аппа: позиции + SIB (фактический % и дельта баланса после закрытия).
 * `meta` — счётчики и статус поллера торговой системы (AL trade-feed).
 */
export function buildTradingJournalPayload(
  db: Database,
  internalUserId: number,
  tgUserId: string,
  limit: number,
  cfg: AppConfig,
  period: string,
  feedScope: TradingJournalFeedScope = "user",
): { items: TradingJournalItemPayload[]; meta: TradingJournalMeta; system_chart: TradingJournalChartPoint[] } {
  const nowMs = Date.now();
  const fromMs =
    period === "all" ? 0 : nowMs - (FIGMA_TRADING_PERIOD_SEC[period] ?? FIGMA_TRADING_PERIOD_SEC["24h"]) * 1000;
  const isSystemFeed = feedScope === "system";
  const feedUserId = isSystemFeed ? resolveCanonicalTradeMirrorUserId(db, cfg) : internalUserId;
  const positiveBalanceStartedAtMs =
    isSystemFeed ? null : getCurrentPositiveBalanceStartedAtMs(db, internalUserId);
  // Use the full period window for chart/list data so different periods always show distinct data.
  // The positiveBalanceStartedAtMs clamping is only used for stats (profit % calculation).
  const fromIso = new Date(fromMs).toISOString();
  const toIso = new Date(nowMs).toISOString();

  const period_stats =
    feedUserId != null
      ? aggregateDealStatsForWindow(db, feedUserId, fromMs, nowMs, positiveBalanceStartedAtMs)
      : emptyDealStatsPayload();

  const rows =
    feedUserId == null
      ? []
      : (db
    .prepare(
      `SELECT tp.id, tp.symbol, tp.side, tp.size_minor, tp.opened_at, tp.closed_at,
              tp.entry_price, tp.exit_price, tp.close_result_percent,
              sa.result_percent AS sib_result_percent,
              sa.delta_minor AS sib_delta_minor
       FROM trade_positions tp
       LEFT JOIN sib_adjustments sa ON sa.position_id = tp.id AND sa.user_id = tp.user_id
       WHERE tp.user_id = ?
         AND (
           (tp.closed_at IS NOT NULL AND length(trim(tp.closed_at)) > 0 AND tp.closed_at >= ? AND tp.closed_at <= ?)
           OR
           ((tp.closed_at IS NULL OR length(trim(tp.closed_at)) = 0) AND tp.opened_at >= ? AND tp.opened_at <= ?)
         )
       ORDER BY COALESCE(NULLIF(trim(tp.closed_at), ''), tp.opened_at) DESC, tp.id DESC
       LIMIT ?`,
        )
          .all(feedUserId, fromIso, toIso, fromIso, toIso, limit) as Array<{
      id: string;
      symbol: string;
      side: string;
      size_minor: number;
      opened_at: string;
      closed_at: string | null;
      entry_price: number | null;
      exit_price: number | null;
      close_result_percent: number | null;
      sib_result_percent: number | null;
      sib_delta_minor: number | null;
        }>);

  const items = mapRowsToItems(rows);
  const counts =
    feedUserId != null ? positionCounts(db, feedUserId) : { total: 0, open: 0, closed: 0 };
  const poll = getAlTradeFeedPollerStatus();
  const system_chartRaw = buildSystemTradingChartPoints(db, cfg, fromIso, toIso);
  /**
   * Только при `scope=system`: последняя точка = `period_stats.profitPercent` (панель и конец кривой совпадают).
   * Для `user` stats — по залогиненному юзеру, а system_chart — по mirror; не смешивать.
   */
  const system_chart =
    isSystemFeed &&
    system_chartRaw.length > 0 &&
    Number.isFinite(period_stats.profitPercent)
      ? (() => {
          const i = system_chartRaw.length - 1;
          const copy = system_chartRaw.slice();
          copy[i] = { occurred_at: copy[i]!.occurred_at, value_pct: period_stats.profitPercent };
          return copy;
        })()
      : system_chartRaw;

  return {
    items,
    meta: {
      limit,
      returned: items.length,
      positions_total: counts.total,
      positions_open: counts.open,
      positions_closed: counts.closed,
      period_stats,
      period_filter: period,
      al_feed_configured: isAlTradeFeedConfigured(cfg),
      al_sync_includes_user: alSyncIncludesUser(db, cfg, tgUserId),
      al_last_ok_at: poll.last_ok_at,
      al_last_error: poll.last_error ? String(poll.last_error).slice(0, 300) : null,
      al_poller_runs: poll.runs,
    },
    system_chart,
  };
}

function mapRowsToItems(
  rows: Array<{
    id: string;
    symbol: string;
    side: string;
    size_minor: number;
    opened_at: string;
    closed_at: string | null;
    entry_price: number | null;
    exit_price: number | null;
    close_result_percent: number | null;
    sib_result_percent: number | null;
    sib_delta_minor: number | null;
  }>,
): TradingJournalItemPayload[] {
  return rows.map((r) => {
    const open = r.closed_at == null || String(r.closed_at).trim() === "";
    const rpSib =
      r.sib_result_percent != null && Number.isFinite(r.sib_result_percent)
        ? r.sib_result_percent
        : null;
    const rpClose =
      r.close_result_percent != null && Number.isFinite(r.close_result_percent)
        ? r.close_result_percent
        : null;
    const result_percent = open ? null : rpSib ?? rpClose;
    return {
      id: r.id,
      symbol: r.symbol,
      side: r.side,
      size_minor: r.size_minor,
      opened_at: r.opened_at,
      closed_at: r.closed_at,
      status: open ? ("open" as const) : ("closed" as const),
      entry_price: r.entry_price,
      exit_price: r.exit_price,
      result_percent,
      delta_minor: open ? null : r.sib_delta_minor,
    };
  });
}
