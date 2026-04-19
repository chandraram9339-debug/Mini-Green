import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { config } from "../config.js";
import { runMigrations } from "./migrations/migrate.js";

const rawDbPath = process.env.DB_PATH?.trim();
const dbPath = path.resolve(
  rawDbPath && rawDbPath.length > 0 ? rawDbPath : path.join(process.cwd(), "runtime", "miniapp.db")
);

let _db: Database.Database | null = null;

export function getDbPath() {
  return dbPath;
}

export function getDb(): Database.Database {
  if (_db) return _db;
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  /** Дождаться блокировки записи (мс), чтобы не терять транзакции при конкуренции */
  db.pragma("busy_timeout = 8000");
  const syncRaw = process.env.SQLITE_SYNC?.trim().toUpperCase();
  const sync =
    syncRaw === "EXTRA" ? "EXTRA" : syncRaw === "FULL" ? "FULL" : syncRaw === "NORMAL" ? "NORMAL" : "FULL";
  db.pragma(`synchronous = ${sync}`);
  runMigrations(db, config);
  _db = db;
  return db;
}

export function requireDb() {
  return getDb();
}
