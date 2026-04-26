#!/usr/bin/env node
/**
 * Сброс **только пользовательских** данных в SQLite для повторного QA с теми же tg_user_id.
 *
 * Удаляет: chain_events, idempotency_keys, всех users (CASCADE: deposits, withdrawals,
 * referral_payouts, trade_positions, sib_*, notifications и т.д. по схеме миграций).
 *
 * **Не трогает:** app_config, meta_ad_accounts, admin_broadcast_log, al_trade_feed_snapshots,
 * _migrations — настройки админки и история широковещаний остаются.
 *
 * Перед запуском остановите backend (pm2 stop …), иначе возможен SQLITE_BUSY / гонки.
 *
 *   cd backend
 *   source .env   # или export DB_PATH=…
 *   RESET_QA_CONFIRM=RESET_ALL_USER_DATA node scripts/reset-qa-user-data.mjs
 *
 * Опционально очистить снимки trade-feed (для чистой отладки ingest):
 *   CLEAR_AL_TRADE_FEED_SNAPSHOTS=1 RESET_QA_CONFIRM=RESET_ALL_USER_DATA node scripts/reset-qa-user-data.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import Database from "better-sqlite3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(backendRoot, ".env") });

const raw = process.env.DB_PATH?.trim();
const dbPath = path.resolve(raw && raw.length > 0 ? raw : path.join(backendRoot, "runtime", "miniapp.db"));

if (process.env.RESET_QA_CONFIRM !== "RESET_ALL_USER_DATA") {
  console.error(
    "Отказ: задайте RESET_QA_CONFIRM=RESET_ALL_USER_DATA (осознанное подтверждение полного удаления пользователей).",
  );
  process.exit(1);
}

if (!fs.existsSync(dbPath)) {
  console.error("Файл БД не найден:", dbPath);
  process.exit(1);
}

function tableExists(db, name) {
  const r = db.prepare("SELECT 1 AS x FROM sqlite_master WHERE type = 'table' AND name = ?").get(name);
  return Boolean(r);
}

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

const clearFeed = process.env.CLEAR_AL_TRADE_FEED_SNAPSHOTS === "1";

const run = db.transaction(() => {
  if (tableExists(db, "chain_events")) db.exec("DELETE FROM chain_events");
  if (tableExists(db, "idempotency_keys")) db.exec("DELETE FROM idempotency_keys");
  if (clearFeed && tableExists(db, "al_trade_feed_snapshots")) {
    db.exec("DELETE FROM al_trade_feed_snapshots");
  }
  if (tableExists(db, "users")) db.exec("DELETE FROM users");
});

run();

const usersLeft = /** @type {{ n: number }} */ (db.prepare("SELECT count(*) AS n FROM users").get());
console.log("Готово:", dbPath);
console.log("  users:", usersLeft.n);
if (clearFeed) console.log("  al_trade_feed_snapshots: очищены");
console.log("Те же Telegram-аккаунты при следующем входе создадут **новых** пользователей в БД.");

db.close();
