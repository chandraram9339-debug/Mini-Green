import type { Database } from "better-sqlite3";

/** Периоды вкладок Figma (1m → 30 суток; all → полное окно ~50 лет для «всё время»). */
export const FIGMA_TRADING_PERIOD_SEC: Record<string, number> = {
  "24h": 86400,
  "3d": 3 * 86400,
  "7d": 7 * 86400,
  "1m": 30 * 86400,
  all: 50 * 365 * 86400,
};

export type DealStatsPayload = {
  totalDeals: number;
  successful: number;
  unsuccessful: number;
  profitPercent: number;
  /** Закрыто в 0% (не в плюс и не в минус). */
  neutral: number;
  /** Ещё открытые позиции, попавшие в окно периода. */
  openInPeriod: number;
  /** Закрыты без процента результата (нет данных SIB / feed). */
  closedWithoutResult: number;
};

export function emptyDealStatsPayload(): DealStatsPayload {
  return {
    totalDeals: 0,
    successful: 0,
    unsuccessful: 0,
    profitPercent: 0,
    neutral: 0,
    openInPeriod: 0,
    closedWithoutResult: 0,
  };
}

function mergedResultPercent(row: {
  closed_at: string | null;
  close_result_percent: number | null;
  sib_result_percent: number | null;
}): number | null {
  const open = row.closed_at == null || String(row.closed_at).trim() === "";
  if (open) return null;
  const rpSib =
    row.sib_result_percent != null && Number.isFinite(row.sib_result_percent)
      ? row.sib_result_percent
      : null;
  const rpClose =
    row.close_result_percent != null && Number.isFinite(row.close_result_percent)
      ? row.close_result_percent
      : null;
  return rpSib ?? rpClose;
}

/**
 * Статистика результата торговли для окна:
 * - `totalDeals` = только завершённые сделки (закрытия),
 * - открытые позиции считаем отдельно в `openInPeriod`.
 */
export function aggregateDealStatsForWindow(
  db: Database,
  internalUserId: number,
  fromMs: number,
  toMs: number,
  minStartedAtMs?: number | null,
): DealStatsPayload {
  const effectiveFromMs =
    minStartedAtMs != null ? Math.max(fromMs, minStartedAtMs) : fromMs;
  if (effectiveFromMs > toMs) return emptyDealStatsPayload();

  const fromIso = new Date(effectiveFromMs).toISOString();
  const toIso = new Date(toMs).toISOString();

  const rows = db
    .prepare(
      `SELECT tp.closed_at, tp.close_result_percent,
              sa.result_percent AS sib_result_percent
       FROM trade_positions tp
       LEFT JOIN sib_adjustments sa ON sa.position_id = tp.id AND sa.user_id = tp.user_id
       WHERE tp.user_id = ?
         AND (
           (tp.closed_at IS NOT NULL AND length(trim(tp.closed_at)) > 0 AND tp.closed_at >= ? AND tp.closed_at <= ?)
           OR
           ((tp.closed_at IS NULL OR length(trim(tp.closed_at)) = 0) AND tp.opened_at >= ? AND tp.opened_at <= ?)
         )
       ORDER BY COALESCE(NULLIF(trim(tp.closed_at), ''), tp.opened_at) ASC, tp.id ASC`,
    )
    .all(internalUserId, fromIso, toIso, fromIso, toIso) as Array<{
      closed_at: string | null;
      close_result_percent: number | null;
      sib_result_percent: number | null;
    }>;

  let successful = 0;
  let unsuccessful = 0;
  let neutral = 0;
  let openInPeriod = 0;
  let closedWithoutResult = 0;
  const closedResults: number[] = [];

  for (const r of rows) {
    const isOpen = r.closed_at == null || String(r.closed_at).trim() === "";
    if (isOpen) {
      openInPeriod += 1;
      continue;
    }
    const rp = mergedResultPercent(r);
    if (rp == null) {
      closedWithoutResult += 1;
      continue;
    }
    closedResults.push(rp);
    if (rp > 0) successful += 1;
    else if (rp < 0) unsuccessful += 1;
    else neutral += 1;
  }

  const totalDeals = successful + unsuccessful + neutral + closedWithoutResult;
  let profitPercent = 0;
  if (closedResults.length > 0) {
    const compoundFactor = closedResults.reduce((acc, rp) => acc * (1 + rp / 100), 1);
    profitPercent = (compoundFactor - 1) * 100;
  }

  return {
    totalDeals,
    successful,
    unsuccessful,
    profitPercent,
    neutral,
    openInPeriod,
    closedWithoutResult,
  };
}

export function tradingStatsForAllFigmaPeriods(
  db: Database,
  internalUserId: number,
  nowMs = Date.now(),
  minStartedAtMs?: number | null,
): Record<string, DealStatsPayload> {
  const periods = ["24h", "3d", "7d", "1m", "all"] as const;
  const out: Record<string, DealStatsPayload> = {};
  for (const p of periods) {
    const sec = FIGMA_TRADING_PERIOD_SEC[p] ?? FIGMA_TRADING_PERIOD_SEC["24h"];
    out[p] = aggregateDealStatsForWindow(
      db,
      internalUserId,
      nowMs - sec * 1000,
      nowMs,
      minStartedAtMs,
    );
  }
  return out;
}
