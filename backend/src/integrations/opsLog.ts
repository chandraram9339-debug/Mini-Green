import type { Database } from "better-sqlite3";

export function logChain(db: Database, userId: number, kind: string, detail: string) {
  const now = new Date().toISOString();
  db.prepare("INSERT INTO chain_events (user_id, kind, detail, created_at) VALUES (?,?,?,?)").run(
    userId,
    kind,
    detail,
    now
  );
}
