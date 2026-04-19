import type { Database } from "better-sqlite3";
import type { AppConfig } from "../../config.js";

const M1 = `
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tg_user_id TEXT NOT NULL UNIQUE,
  inviter_tg_id TEXT,
  balance_usdt_minor INTEGER NOT NULL DEFAULT 0,
  has_deposited INTEGER NOT NULL DEFAULT 0,
  deposit_count INTEGER NOT NULL DEFAULT 0,
  deposit_path_index INTEGER,
  deposit_tron_address TEXT,
  last_chain_usdt_balance_minor INTEGER,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS deposits (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  gross_minor INTEGER NOT NULL,
  fee_minor INTEGER NOT NULL,
  net_minor INTEGER NOT NULL,
  status TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  chain_tx_in TEXT,
  source TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS withdrawals (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  to_address TEXT NOT NULL,
  amount_minor INTEGER NOT NULL,
  fee_minor INTEGER NOT NULL,
  status TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  created_at TEXT NOT NULL,
  resolved_at TEXT,
  fail_reason TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS referral_payouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_user_id INTEGER NOT NULL,
  to_user_id INTEGER NOT NULL,
  from_deposit_id TEXT NOT NULL,
  amount_usdt_minor INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chain_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  kind TEXT NOT NULL,
  detail TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals (user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_user ON deposits (user_id);
CREATE TABLE IF NOT EXISTS _migrations (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
`;

function seedAppConfigIfEmpty(db: Database, appConfig: AppConfig, now: string) {
  const c = db.prepare("SELECT count(*) as n FROM app_config").get() as { n: number };
  if (c.n > 0) return;
  const ins = db.prepare("INSERT INTO app_config (key, value, updated_at) VALUES (?,?,?)");
  const rows: [string, string][] = [
    ["min_deposit_usdt", String(appConfig.minDepositUsdtHuman)],
    ["deposit_fee_fixed_usdt", String(appConfig.depositFeeFixedUsdtHuman)],
    ["deposit_fee_bps", String(appConfig.depositFeeBps)],
    ["withdraw_fee_fixed_usdt", String(appConfig.withdrawFeeFixedUsdtHuman)],
    ["withdraw_fee_bps", String(appConfig.withdrawFeeBps)],
    ["referral_percent_bps", String(appConfig.referralPercentBps)]
  ];
  for (const [k, v] of rows) {
    ins.run(k, v, now);
  }
}

export function runMigrations(_db: Database, appConfig: AppConfig) {
  const db = _db;
  db.exec(M1);
  const row = db
    .prepare("SELECT 1 as ok FROM _migrations WHERE id=1")
    .get() as { ok: number } | undefined;
  if (!row) {
    db.prepare("INSERT INTO _migrations (id, name) VALUES (1, '001_initial')").run();
  }
  const now = new Date().toISOString();
  seedAppConfigIfEmpty(db, appConfig, now);
  runMigration002UsersAndMeta(db, appConfig, now);
  runMigration003Idempotency(db);
  runMigration004AdminBroadcastContent(db, now);
  runMigration005UserMnemonicVault(db);
  runMigration006DepositPrivateKeyEncrypted(db);
  runMigration007AppConfigDefaults(db, now);
  runMigration008UserAgreement(db, now);
  runMigration009TradePositions(db);
  runMigration010TradePositionsClosedAt(db);
  runMigration011BotTradingEnabled(db);
  runMigration012AccountRecoveryCode(db);
  runMigration013SibBalanceEngine(db);
  runMigration014TradePositionFeedMeta(db);
  runMigration015TradePositionsCloseResultRepair(db);
  runMigration016AlTradeFeedSnapshots(db);
  runMigration017UserNotifications(db);
}

function tableHasColumn(db: Database, table: string, column: string) {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  return rows.some((r) => r.name === column);
}

function setConfigIfMissing(db: Database, key: string, value: string, now: string) {
  const ex = db
    .prepare("SELECT 1 as x FROM app_config WHERE key = ?")
    .get(key) as { x: number } | undefined;
  if (ex) return;
  db.prepare("INSERT INTO app_config (key, value, updated_at) VALUES (?,?,?)").run(key, value, now);
}

const M2_META = `
CREATE TABLE IF NOT EXISTS meta_ad_accounts (
  id TEXT PRIMARY KEY,
  label TEXT,
  pixel_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  is_enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
`;

/**
 * last_active / blocked bot, Meta accounts table, default push + policy keys in app_config.
 */
function runMigration002UsersAndMeta(db: Database, appConfig: AppConfig, now: string) {
  const m2 = db
    .prepare("SELECT 1 as ok FROM _migrations WHERE id=2")
    .get() as { ok: number } | undefined;
  if (m2) {
    return;
  }
  db.exec(M2_META);
  if (!tableHasColumn(db, "users", "last_active_at")) {
    db.exec("ALTER TABLE users ADD COLUMN last_active_at TEXT");
  }
  if (!tableHasColumn(db, "users", "blocked_bot_at")) {
    db.exec("ALTER TABLE users ADD COLUMN blocked_bot_at TEXT");
  }
  db.prepare("UPDATE users SET last_active_at = created_at WHERE last_active_at IS NULL").run();
  setConfigIfMissing(db, "referral_deposit_rule", appConfig.referralDepositRule, now);
  setConfigIfMissing(db, "meta_purchase_min_usdt", "0", now);
  setConfigIfMissing(db, "treasury_deposit_tron", appConfig.depositAddress ?? "", now);
  setConfigIfMissing(db, "gaz_bank_tron", "", now);
  setConfigIfMissing(db, "topup_bank_tron", "", now);
  setConfigIfMissing(db, "withdraw_wallet_tron", "", now);
  setConfigIfMissing(db, "hd_wallet_mnemonic", "", now);
  setConfigIfMissing(db, "deterministic_derive_key", "", now);
  setConfigIfMissing(db, "push_auto_no_deposit_enabled", "0", now);
  setConfigIfMissing(db, "push_auto_deposited_enabled", "0", now);
  setConfigIfMissing(db, "push_auto_all_enabled", "0", now);
  setConfigIfMissing(db, "push_auto_cooldown_hours", "24", now);
  setConfigIfMissing(db, "push_auto_text_no_deposit", "", now);
  setConfigIfMissing(db, "push_auto_text_deposited", "", now);
  setConfigIfMissing(db, "push_auto_text_all", "", now);
  db.prepare("INSERT INTO _migrations (id, name) VALUES (2, '002_meta_push_activity')").run();
}

const M3_IDEM = `
CREATE TABLE IF NOT EXISTS idempotency_keys (
  op_key TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_idempotency_created ON idempotency_keys (created_at);
`;

function runMigration003Idempotency(db: Database) {
  const m3 = db
    .prepare("SELECT 1 as ok FROM _migrations WHERE id=3")
    .get() as { ok: number } | undefined;
  if (m3) {
    return;
  }
  db.exec(M3_IDEM);
  db.prepare("INSERT INTO _migrations (id, name) VALUES (3, '003_idempotency_onchain_capi')").run();
}

const M4_BROADCAST = `
CREATE TABLE IF NOT EXISTS admin_broadcast_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  segment TEXT NOT NULL,
  text_preview TEXT NOT NULL,
  sent_count INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_broadcast_created ON admin_broadcast_log (created_at DESC);
`;

function runMigration004AdminBroadcastContent(db: Database, now: string) {
  const m4 = db
    .prepare("SELECT 1 as ok FROM _migrations WHERE id=4")
    .get() as { ok: number } | undefined;
  if (m4) {
    return;
  }
  db.exec(M4_BROADCAST);
  setConfigIfMissing(db, "content_channel_url", "", now);
  setConfigIfMissing(db, "content_chat_url", "", now);
  setConfigIfMissing(db, "content_support_url", "", now);
  setConfigIfMissing(db, "content_faq_markdown", "", now);
  db.prepare("INSERT INTO _migrations (id, name) VALUES (4, '004_broadcast_content')").run();
}

/** Зашифрованная пер-пользовательская BIP39 для custodial режима WALLET_SEED_PER_USER */
function runMigration005UserMnemonicVault(db: Database) {
  const m = db.prepare("SELECT 1 as ok FROM _migrations WHERE id=5").get() as { ok: number } | undefined;
  if (m) return;
  if (!tableHasColumn(db, "users", "wallet_mnemonic_encrypted")) {
    db.exec("ALTER TABLE users ADD COLUMN wallet_mnemonic_encrypted TEXT");
  }
  db.prepare("INSERT INTO _migrations (id, name) VALUES (5, '005_user_wallet_mnemonic_encrypted')").run();
}

/** Зашифрованный hex приватного ключа депозитного адреса (режим WALLET_STORE_ENCRYPTED_PK) */
function runMigration006DepositPrivateKeyEncrypted(db: Database) {
  const m = db.prepare("SELECT 1 as ok FROM _migrations WHERE id=6").get() as { ok: number } | undefined;
  if (m) return;
  if (!tableHasColumn(db, "users", "deposit_private_key_encrypted")) {
    db.exec("ALTER TABLE users ADD COLUMN deposit_private_key_encrypted TEXT");
  }
  db.prepare("INSERT INTO _migrations (id, name) VALUES (6, '006_deposit_private_key_encrypted')").run();
}

function runMigration007AppConfigDefaults(db: Database, now: string) {
  const m = db.prepare("SELECT 1 as ok FROM _migrations WHERE id=7").get() as { ok: number } | undefined;
  if (m) return;
  setConfigIfMissing(db, "content_youtube_url", "", now);
  setConfigIfMissing(db, "public_telegram_bot_username", "", now);
  setConfigIfMissing(db, "withdraw_auto_approve", "", now);
  db.prepare("INSERT INTO _migrations (id, name) VALUES (7, '007_miniapp_links_withdraw_auto')").run();
}

function runMigration008UserAgreement(db: Database, now: string) {
  const m = db.prepare("SELECT 1 as ok FROM _migrations WHERE id=8").get() as { ok: number } | undefined;
  if (m) return;
  setConfigIfMissing(db, "content_user_agreement_markdown", "", now);
  db.prepare("INSERT INTO _migrations (id, name) VALUES (8, '008_user_agreement_content')").run();
}

const M9_TRADE_POSITIONS = `
CREATE TABLE IF NOT EXISTS trade_positions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  size_minor INTEGER NOT NULL,
  opened_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_trade_positions_user ON trade_positions (user_id);
CREATE INDEX IF NOT EXISTS idx_trade_positions_user_opened ON trade_positions (user_id, opened_at);
`;

function runMigration009TradePositions(db: Database) {
  const m = db.prepare("SELECT 1 as ok FROM _migrations WHERE id=9").get() as { ok: number } | undefined;
  if (m) return;
  db.exec(M9_TRADE_POSITIONS);
  db.prepare("INSERT INTO _migrations (id, name) VALUES (9, '009_trade_positions')").run();
}

/** Lets closed positions stay in DB so period filters (7d / 30d) still show history. */
function runMigration010TradePositionsClosedAt(db: Database) {
  const m = db.prepare("SELECT 1 as ok FROM _migrations WHERE id=10").get() as { ok: number } | undefined;
  if (m) return;
  if (!tableHasColumn(db, "trade_positions", "closed_at")) {
    db.exec("ALTER TABLE trade_positions ADD COLUMN closed_at TEXT");
  }
  db.prepare("INSERT INTO _migrations (id, name) VALUES (10, '010_trade_positions_closed_at')").run();
}

function runMigration011BotTradingEnabled(db: Database) {
  const m = db.prepare("SELECT 1 as ok FROM _migrations WHERE id=11").get() as { ok: number } | undefined;
  if (m) return;
  if (!tableHasColumn(db, "users", "bot_trading_enabled")) {
    db.exec("ALTER TABLE users ADD COLUMN bot_trading_enabled INTEGER NOT NULL DEFAULT 0");
  }
  db.prepare("INSERT INTO _migrations (id, name) VALUES (11, '011_bot_trading_enabled')").run();
}

/** App account recovery (not blockchain keys); plain code shown once, only hash stored. */
function runMigration012AccountRecoveryCode(db: Database) {
  const m = db.prepare("SELECT 1 as ok FROM _migrations WHERE id=12").get() as { ok: number } | undefined;
  if (m) return;
  if (!tableHasColumn(db, "users", "recovery_code_hash")) {
    db.exec("ALTER TABLE users ADD COLUMN recovery_code_hash TEXT");
  }
  if (!tableHasColumn(db, "users", "recovery_code_issued_at")) {
    db.exec("ALTER TABLE users ADD COLUMN recovery_code_issued_at TEXT");
  }
  db.exec("CREATE INDEX IF NOT EXISTS idx_users_recovery_code_hash ON users (recovery_code_hash)");
  db.prepare("INSERT INTO _migrations (id, name) VALUES (12, '012_account_recovery_code')").run();
}

/** SIB: state on `users` + applied % from trading `closes[].result`. */
function runMigration013SibBalanceEngine(db: Database) {
  const m = db.prepare("SELECT 1 as ok FROM _migrations WHERE id=13").get() as { ok: number } | undefined;
  if (m) return;
  if (!tableHasColumn(db, "users", "sib_active")) {
    db.exec("ALTER TABLE users ADD COLUMN sib_active INTEGER NOT NULL DEFAULT 0");
  }
  if (!tableHasColumn(db, "users", "sib_need_activation_close")) {
    db.exec("ALTER TABLE users ADD COLUMN sib_need_activation_close INTEGER NOT NULL DEFAULT 0");
  }
  db.exec(`
CREATE TABLE IF NOT EXISTS sib_adjustments (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  position_id TEXT NOT NULL,
  result_percent REAL NOT NULL,
  delta_minor INTEGER NOT NULL,
  balance_after_minor INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (user_id, position_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_sib_adj_user_created ON sib_adjustments (user_id, created_at DESC);
`);
  db.prepare("INSERT INTO _migrations (id, name) VALUES (13, '013_sib_balance_engine')").run();
}

/** Цены входа/выхода и % результата с торговой системы (AL trade-feed / ingest). */
function runMigration014TradePositionFeedMeta(db: Database) {
  const m = db.prepare("SELECT 1 as ok FROM _migrations WHERE id=14").get() as { ok: number } | undefined;
  if (m) return;
  if (!tableHasColumn(db, "trade_positions", "entry_price")) {
    db.exec("ALTER TABLE trade_positions ADD COLUMN entry_price REAL");
  }
  if (!tableHasColumn(db, "trade_positions", "exit_price")) {
    db.exec("ALTER TABLE trade_positions ADD COLUMN exit_price REAL");
  }
  if (!tableHasColumn(db, "trade_positions", "close_result_percent")) {
    db.exec("ALTER TABLE trade_positions ADD COLUMN close_result_percent REAL");
  }
  db.prepare("INSERT INTO _migrations (id, name) VALUES (14, '014_trade_positions_feed_meta')").run();
}

/**
 * Базы, где id=14 уже записан старым релизом без `close_result_percent`
 * (остался только legacy `pnl_percent`) — добавляем колонку и переносим значения.
 */
function runMigration015TradePositionsCloseResultRepair(db: Database) {
  const m = db.prepare("SELECT 1 as ok FROM _migrations WHERE id=15").get() as { ok: number } | undefined;
  if (m) return;
  if (!tableHasColumn(db, "trade_positions", "close_result_percent")) {
    db.exec("ALTER TABLE trade_positions ADD COLUMN close_result_percent REAL");
  }
  if (tableHasColumn(db, "trade_positions", "pnl_percent")) {
    db.exec(
      `UPDATE trade_positions
       SET close_result_percent = pnl_percent
       WHERE close_result_percent IS NULL AND pnl_percent IS NOT NULL`,
    );
  }
  db.prepare("INSERT INTO _migrations (id, name) VALUES (15, '015_trade_positions_close_result_repair')").run();
}

/** Полный ответ GET /api/trade-feed (JSON) при каждом успешном pull — для аудита и отладки. */
function runMigration016AlTradeFeedSnapshots(db: Database) {
  const m = db.prepare("SELECT 1 as ok FROM _migrations WHERE id=16").get() as { ok: number } | undefined;
  if (m) return;
  db.exec(`
CREATE TABLE IF NOT EXISTS al_trade_feed_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fetched_at TEXT NOT NULL,
  opens_n INTEGER NOT NULL,
  closes_n INTEGER NOT NULL,
  payload_json TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_al_tf_snap_fetched ON al_trade_feed_snapshots (fetched_at DESC);
`);
  db.prepare("INSERT INTO _migrations (id, name) VALUES (16, '016_al_trade_feed_snapshots')").run();
}

function runMigration017UserNotifications(db: Database) {
  const m = db.prepare("SELECT 1 as ok FROM _migrations WHERE id=17").get() as { ok: number } | undefined;
  if (m) return;
  db.exec(`
CREATE TABLE IF NOT EXISTS user_notifications (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  kind TEXT NOT NULL,
  variant TEXT NOT NULL,
  message TEXT NOT NULL,
  source_id TEXT,
  unread INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_created
  ON user_notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_unread
  ON user_notifications (user_id, unread, created_at DESC);
`);
  db.prepare("INSERT INTO _migrations (id, name) VALUES (17, '017_user_notifications')").run();
}
