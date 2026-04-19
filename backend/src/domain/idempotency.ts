import type { Database } from "better-sqlite3";

/**
 * Unique op keys (e.g. `live_deposit:dep_...`, `capi_subscribe:12345`).
 * `INSERT OR IGNORE` — return true if this is the first claim.
 */
export function tryClaimIdempotency(db: Database, opKey: string) {
  const now = new Date().toISOString();
  const r = db
    .prepare("INSERT OR IGNORE INTO idempotency_keys (op_key, created_at) VALUES (?, ?)")
    .run(opKey, now);
  return (r as { changes: number }).changes === 1;
}

/**
 * For operator retry after a failed on-chain leg. May allow duplicate network sends if the first tx actually confirmed.
 */
export function releaseIdempotency(db: Database, opKey: string) {
  db.prepare("DELETE FROM idempotency_keys WHERE op_key = ?").run(opKey);
}
