import type { Database } from "better-sqlite3";
import type { AppConfig } from "../config.js";
import { getUserByTg } from "../repos/userRepo.js";
import { listMirrorTargetTgIds } from "../services/alTradeFeedSync.js";
import type { TradingJournalItemPayload } from "./tradingJournalPayload.js";

/**
 * Один «канонический» пользователь с зеркалом AL trade-feed — чтобы график «всей системы»
 * не дублировал одни и те же закрытия для каждого tg_id в списке синка.
 */
export function resolveCanonicalTradeMirrorUserId(db: Database, cfg: AppConfig): number | null {
  for (const tg of listMirrorTargetTgIds(db, cfg)) {
    const u = getUserByTg(db, tg);
    if (u) return u.id;
  }
  const r = db
    .prepare(
      `SELECT user_id FROM trade_positions
       WHERE closed_at IS NOT NULL AND length(trim(closed_at)) > 0
       GROUP BY user_id
       ORDER BY COUNT(*) DESC
       LIMIT 1`,
    )
    .get() as { user_id: number } | undefined;
  return r ? Number(r.user_id) : null;
}

function mapRowsToJournalItems(
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
      status: open ? "open" : "closed",
      entry_price: r.entry_price,
      exit_price: r.exit_price,
      result_percent,
      delta_minor: open ? null : r.sib_delta_minor,
    };
  });
}

/** Закрытые сделки за окно (как журнал), для построения компаунд-кривой. */
export function queryJournalRowsForUserWindow(
  db: Database,
  internalUserId: number,
  fromIso: string,
  toIso: string,
  limit: number,
) {
  return db
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
    .all(internalUserId, fromIso, toIso, fromIso, toIso, limit) as Array<{
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
  }>;
}

export function journalItemsToCompoundedPctPoints(
  items: TradingJournalItemPayload[],
): Array<{ occurred_at: string; value_pct: number }> {
  const closed = items
    .filter(
      (row) =>
        row.status === "closed" &&
        row.closed_at &&
        row.result_percent != null &&
        Number.isFinite(row.result_percent),
    )
    .sort((a, b) => Date.parse(String(a.closed_at)) - Date.parse(String(b.closed_at)));

  if (closed.length === 0) return [];

  let compounded = 1;
  return closed.map((row) => {
    compounded *= 1 + Number(row.result_percent) / 100;
    return {
      occurred_at: String(row.closed_at),
      value_pct: (compounded - 1) * 100,
    };
  });
}

export function buildSystemTradingChartPoints(
  db: Database,
  cfg: AppConfig,
  fromIso: string,
  toIso: string,
): Array<{ occurred_at: string; value_pct: number }> {
  const uid = resolveCanonicalTradeMirrorUserId(db, cfg);
  if (uid == null) return [];
  const rows = queryJournalRowsForUserWindow(db, uid, fromIso, toIso, 2000);
  const items = mapRowsToJournalItems(rows);
  return journalItemsToCompoundedPctPoints(items);
}
