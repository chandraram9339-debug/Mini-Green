import type { Database } from "better-sqlite3";

export type TradePositionRow = {
  id: string;
  user_id: number;
  symbol: string;
  side: string;
  size_minor: number;
  opened_at: string;
  created_at: string;
  /** ISO time when position is closed; null = still open. */
  closed_at: string | null;
  /** Цена входа (торговая система), optional. */
  entry_price: number | null;
  /** Цена выхода (закрытие), optional. */
  exit_price: number | null;
  /** % результата с AL/инжеста до SIB, optional. */
  close_result_percent: number | null;
};

const SELECT_ROW = `SELECT id, user_id, symbol, side, size_minor, opened_at, created_at, closed_at,
  entry_price, exit_price, close_result_percent`;

/** All positions (open + closed) for history / period charts. */
export function listTradePositionsByUserId(db: Database, userId: number): TradePositionRow[] {
  return db
    .prepare(`${SELECT_ROW} FROM trade_positions WHERE user_id = ? ORDER BY opened_at ASC, id ASC`)
    .all(userId) as TradePositionRow[];
}

export function getTradePositionById(db: Database, id: string): TradePositionRow | undefined {
  return db
    .prepare(`${SELECT_ROW} FROM trade_positions WHERE id = ?`)
    .get(id) as TradePositionRow | undefined;
}

/** Latest position by `opened_at` (journal “last entry”). */
export function getLatestTradePositionByUserId(db: Database, userId: number): TradePositionRow | undefined {
  return db
    .prepare(
      `${SELECT_ROW} FROM trade_positions WHERE user_id = ? ORDER BY opened_at DESC, id DESC LIMIT 1`
    )
    .get(userId) as TradePositionRow | undefined;
}

/** Only currently open positions (dashboard count, wallet snapshot). */
export function listOpenTradePositionsByUserId(db: Database, userId: number): TradePositionRow[] {
  return db
    .prepare(
      `${SELECT_ROW} FROM trade_positions WHERE user_id = ? AND closed_at IS NULL ORDER BY opened_at ASC, id ASC`
    )
    .all(userId) as TradePositionRow[];
}

export function insertTradePosition(
  db: Database,
  row: Omit<TradePositionRow, "created_at" | "closed_at"> &
    Partial<Pick<TradePositionRow, "closed_at">> & { created_at?: string }
): void {
  const createdAt = row.created_at ?? new Date().toISOString();
  const closedAt = row.closed_at ?? null;
  db.prepare(
    `INSERT INTO trade_positions (
      id, user_id, symbol, side, size_minor, opened_at, created_at, closed_at,
      entry_price, exit_price, close_result_percent)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    row.id,
    row.user_id,
    row.symbol,
    row.side,
    row.size_minor,
    row.opened_at,
    createdAt,
    closedAt,
    row.entry_price ?? null,
    row.exit_price ?? null,
    row.close_result_percent ?? null,
  );
}

/** Upsert by `id` (stable id from external trading engine). */
export function upsertTradePosition(
  db: Database,
  row: Omit<TradePositionRow, "created_at" | "closed_at"> &
    Partial<Pick<TradePositionRow, "closed_at">> & { created_at?: string }
): void {
  const createdAt = row.created_at ?? new Date().toISOString();
  const closedAt = row.closed_at ?? null;
  db.prepare(
    `INSERT INTO trade_positions (
      id, user_id, symbol, side, size_minor, opened_at, created_at, closed_at,
      entry_price, exit_price, close_result_percent)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET
       user_id = excluded.user_id,
       symbol = excluded.symbol,
       side = excluded.side,
       size_minor = excluded.size_minor,
       opened_at = excluded.opened_at,
       closed_at = excluded.closed_at,
       entry_price = excluded.entry_price,
       exit_price = excluded.exit_price,
       close_result_percent = excluded.close_result_percent,
       created_at = trade_positions.created_at`,
  ).run(
    row.id,
    row.user_id,
    row.symbol,
    row.side,
    row.size_minor,
    row.opened_at,
    createdAt,
    closedAt,
    row.entry_price ?? null,
    row.exit_price ?? null,
    row.close_result_percent ?? null,
  );
}

/** Mark position closed at `closed_at` (default now). Returns false if not found or already closed. */
export function closeTradePositionAt(
  db: Database,
  id: string,
  closedAtIso?: string
): boolean {
  const closed = closedAtIso ?? new Date().toISOString();
  const r = db
    .prepare(
      `UPDATE trade_positions SET closed_at = ? WHERE id = ? AND closed_at IS NULL`
    )
    .run(closed, id);
  return r.changes > 0;
}

/** Hard delete (admin purge). Prefer close for normal lifecycle. */
export function deleteTradePositionById(db: Database, id: string): boolean {
  const r = db.prepare("DELETE FROM trade_positions WHERE id = ?").run(id);
  return r.changes > 0;
}

/**
 * AL mirror rows are a snapshot of the external feed, not an append-only history.
 * Remove mirrored positions that disappeared from the latest feed payload.
 */
export function deleteTradePositionsByIds(db: Database, ids: string[]): number {
  if (ids.length === 0) return 0;
  const q = ids.map(() => "?").join(",");
  const r = db.prepare(`DELETE FROM trade_positions WHERE id IN (${q})`).run(...ids);
  return r.changes;
}
