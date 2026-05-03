import type { Database } from "better-sqlite3";

export type AlTradeFeedSnapshotRow = {
  id: number;
  fetched_at: string;
  opens_n: number;
  closes_n: number;
  payload_json: string;
};

export function insertAlTradeFeedSnapshot(
  db: Database,
  row: Omit<AlTradeFeedSnapshotRow, "id">
): number {
  const r = db
    .prepare(
      `INSERT INTO al_trade_feed_snapshots (fetched_at, opens_n, closes_n, payload_json)
       VALUES (?,?,?,?)`,
    )
    .run(row.fetched_at, row.opens_n, row.closes_n, row.payload_json);
  return Number(r.lastInsertRowid);
}

/** Удалить старые снимки: по возрасту и по лимиту строк (оставляем самые свежие). */
export function pruneAlTradeFeedSnapshots(
  db: Database,
  retentionDays: number,
  maxRows: number,
): void {
  const days = Math.max(1, retentionDays);
  const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();
  db.prepare(`DELETE FROM al_trade_feed_snapshots WHERE fetched_at < ?`).run(cutoff);

  const cap = Math.max(100, maxRows);
  const row = db.prepare(`SELECT COUNT(*) as n FROM al_trade_feed_snapshots`).get() as { n: number };
  const excess = row.n - cap;
  if (excess <= 0) return;
  db.prepare(
    `DELETE FROM al_trade_feed_snapshots WHERE id IN (
       SELECT id FROM al_trade_feed_snapshots ORDER BY fetched_at ASC LIMIT ?
     )`,
  ).run(excess);
}

export function countAlTradeFeedSnapshots(db: Database): number {
  const r = db.prepare(`SELECT COUNT(*) as n FROM al_trade_feed_snapshots`).get() as { n: number };
  return r.n;
}

/** Последний сохранённый JSON ответа GET /api/trade-feed (после успешного poll). */
export function getLatestAlTradeFeedSnapshot(db: Database): AlTradeFeedSnapshotRow | null {
  const row = db
    .prepare(
      `SELECT id, fetched_at, opens_n, closes_n, payload_json
       FROM al_trade_feed_snapshots
       ORDER BY fetched_at DESC
       LIMIT 1`,
    )
    .get() as AlTradeFeedSnapshotRow | undefined;
  return row ?? null;
}
