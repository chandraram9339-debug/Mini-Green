import path from "node:path";

const demoList = String(process.env.DEMO_INIT_TOKENS ?? "demo-smoke-init,demo-smoke-init-2")
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean);

/**
 * All runtime configuration. Fee fields in human USDT (e.g. 0.5) and bps (100 = 1%).
 * Internal ledger uses 2-decimal “minor” (1 USDT = 100).
 */
export type AppConfig = {
  port: number;
  executionMode: string;
  authProviderMode: string;
  telegramBotToken: string;
  initSignatureSecret: string;
  initSignatureMaxAgeSec: number;
  allowedDemoTokens: Set<string>;
  demoUserId: string;
  actionStorePath: string;
  enableOpsLogs: boolean;
  /** Min withdraw: minor (100 = 1.00 USDT) */
  minWithdrawMinor: number;
  /** Legacy % fee on withdraw */
  withdrawFeeBps: number;
  /** Fixed part of withdraw fee, USDT (human) */
  withdrawFeeFixedUsdtHuman: number;
  /** Fixed + % for deposit (input) */
  depositFeeFixedUsdtHuman: number;
  depositFeeBps: number;
  /** Min deposit to accept pipeline (X in ТЗ) */
  minDepositUsdtHuman: number;
  /** Referral % in bps (e.g. 800 = 8%) */
  referralPercentBps: number;
  /** "all" or "1,2,3" — which deposit numbers pay referral (1st, 2nd, …) */
  referralDepositRule: string;
  jwtSecret: string;
  jwtAccessTtlSec: number;
  /** Fallback if HD not used (degraded) */
  depositAddress: string;
  /** BIP39 mnemonic for per-user TRC20 addresses; prefer secret manager in prod */
  hdWalletMnemonic: string;
  /**
   * If set (hex 32+ bytes), use deterministic TRON key from HMAC(salt, tg) when mnemonic is empty.
   * Otherwise require HD mnemonic for unique addresses.
   */
  deterministicDeriveKeyHex: string;
  liveTron: boolean;
  tronFullHost: string;
  tronApiKey: string;
  usdtTrc20: string;
  /**
   * When 1, attempt real TRX (gas) and USDT sweep / withdraw (requires private keys; failures are logged).
   */
  liveTronSend: boolean;
  /** Hex 64, TRX for sendTrx to user deposit (gas) */
  gazBankPrivateKey: string;
  /** Hex 64, hot wallet: USDT TRC20 to end users for withdrawals */
  withdrawWalletPrivateKey: string;
  /** TRX amount (sun) sent to user for energy/bandwidth before TRC20 sweep, default ~2 TRX */
  gasTrxToUserSun: number;
  /** TRC20 fee limit (sun) for one contract call (default 80 TRX cap) */
  tronFeeLimitSun: number;
  /** Stub: gross USDT credited per successful PAID when `liveTron` is false (dev) */
  stubDepositGrossUsdt: number;
  adminApiKey: string;
  /** `POST /hooks/telegram?secret=...` — my_chat_member / optional activity */
  telegramWebhookSecret: string;
  /** Fallback for referral deep links if not set in admin (`public_telegram_bot_username`). No @ prefix. */
  publicTelegramBotUsername: string;
  withdrawAutoApprove: boolean;
  /** Meta CAPI (optional) */
  metaPixelId: string;
  metaAccessToken: string;
  metaTestEventCode: string;
  /** Log-only bank labels (Tron send is separate op; keys stay off hot path) */
  gasBankLabel: string;
  topupBankLabel: string;
  withdrawWalletLabel: string;
  /**
   * Новые пользователи получают свою BIP39-фразу (хранится зашифрованной в `users.wallet_mnemonic_encrypted`).
   * Требует `USER_WALLET_ENCRYPTION_KEY` (64 hex).
   */
  walletSeedPerUser: boolean;
  /**
   * Депозитный кошелёк: генерируется локально или через HTTP (`TRON_DEPOSIT_WALLET_CREATE_URL`),
   * приватный ключ хранится зашифрованным в `users.deposit_private_key_encrypted`.
   * Имеет приоритет над `WALLET_SEED_PER_USER`, если оба включены.
   */
  walletStoreEncryptedPk: boolean;
  /** POST JSON → `{ address, privateKey }`; пусто = генерация через tronweb локально */
  tronDepositWalletCreateUrl: string;
  /** Заголовок Authorization (полная строка или без префикса Bearer) */
  tronDepositWalletCreateAuth: string;
  tronDepositWalletCreateTimeoutMs: number;
  /** AES-256-GCM key, 64 hex chars */
  userWalletEncryptionKeyHex: string;
  /**
   * Pepper for hashing app account recovery codes (`/api/v1/ui/seed`, `/api/v1/ui/recovery-claim`).
   * Empty = recovery UI and claim endpoint disabled for account linking.
   */
  recoveryCodePepper: string;
  /** Shared secret for `POST /hooks/trading/v1/ingest` (X-Trading-Secret). Empty = hook disabled (401). */
  tradingIngestSecret: string;
  /** When set, Start/Stop in miniapp POSTs here: JSON `{ tg_user_id, action: "start"|"stop" }`. */
  tradingEngineNotifyUrl: string;
  tradingEngineNotifyTimeoutMs: number;
  /**
   * Optional: after deposit / withdraw settlement, POST JSON `{ "tg_user_id" }` so an external
   * service can push the trading journal to `POST /hooks/trading/v1/ingest` (SIB).
   */
  sibJournalSyncUrl: string;
  /**
   * External AL simulator: poll `GET /api/trade-feed` (HTTP Basic) and mirror opens/closes into
   * `trade_positions` + SIB for configured Telegram user IDs.
   */
  alTradeFeedEnabled: boolean;
  alTradeFeedBaseUrl: string;
  alTradeFeedHttpUser: string;
  alTradeFeedHttpPassword: string;
  alTradeFeedPollIntervalMs: number;
  /** Comma-separated Telegram numeric IDs — same journal is mirrored to each user. */
  alTradeFeedSyncTgIds: string[];
  /** Notional position size (minor USDT) when mapping AL opens (price is informational). */
  alPositionNotionalMinor: number;
  /** Persist full JSON from GET /api/trade-feed into `al_trade_feed_snapshots` on each successful pull. */
  alTradeFeedStoreSnapshots: boolean;
  /** Drop snapshots older than this many days (after each successful sync). */
  alTradeFeedSnapshotRetentionDays: number;
  /** Cap table size: after retention prune, delete oldest rows until count ≤ this. */
  alTradeFeedSnapshotMaxRows: number;
};

function numEnv(name: string, def: number) {
  const n = Number(process.env[name]);
  return Number.isFinite(n) ? n : def;
}

function strEnv(name: string, def: string) {
  const v = process.env[name];
  return v !== undefined && v !== null ? String(v) : def;
}

export const config: AppConfig = {
  port: numEnv("PORT", 4000),
  executionMode: strEnv("EXECUTION_MODE", "mock"),
  authProviderMode: strEnv("AUTH_PROVIDER_MODE", process.env.EXECUTION_MODE ?? "mock"),
  telegramBotToken: strEnv("TELEGRAM_BOT_TOKEN", ""),
  initSignatureSecret: strEnv("MOCK_INITDATA_SECRET", "mock-init-secret-v1"),
  initSignatureMaxAgeSec: numEnv("MOCK_INITDATA_MAX_AGE_SEC", 86400),
  allowedDemoTokens: new Set(demoList),
  demoUserId: strEnv("DEMO_INIT_USER_ID", "10001"),
  actionStorePath: path.resolve(
    strEnv("ACTION_STORE_PATH", path.join(process.cwd(), "runtime", "action-store.json"))
  ),
  enableOpsLogs: strEnv("ENABLE_OPS_LOGS", "true") === "true",
  minWithdrawMinor: numEnv("MIN_WITHDRAW_MINOR", 700),
  withdrawFeeBps: numEnv("WITHDRAW_FEE_BPS", 1900),
  withdrawFeeFixedUsdtHuman: numEnv("WITHDRAW_FEE_FIXED_USDT", 7),
  depositFeeFixedUsdtHuman: numEnv("DEPOSIT_FEE_FIXED_USDT", 7),
  depositFeeBps: numEnv("DEPOSIT_FEE_BPS", 900),
  minDepositUsdtHuman: numEnv("MIN_DEPOSIT_USDT", 7),
  referralPercentBps: numEnv("REFERRAL_PERCENT_BPS", 800),
  referralDepositRule: strEnv("REFERRAL_DEPOSIT_COUNTS", "all"),
  jwtSecret: strEnv("JWT_SECRET", "dev-only-insecure-jwt-do-not-use-in-prod"),
  jwtAccessTtlSec: numEnv("JWT_ACCESS_TTL_SEC", 7 * 24 * 60 * 60),
  depositAddress: (process.env.DEPOSIT_ADDRESS ?? process.env.TREASURY_USDT_TRC20 ?? "").trim(),
  hdWalletMnemonic: strEnv("HD_WALLET_MNEMONIC", "").trim(),
  deterministicDeriveKeyHex: strEnv("DETERMINISTIC_DERIVE_KEY", "").trim(),
  liveTron: strEnv("LIVE_TRON", "0") === "1",
  tronFullHost: strEnv("TRON_FULL_HOST", "https://api.trongrid.io"),
  tronApiKey: strEnv("TRON_API_KEY", ""),
  usdtTrc20: strEnv("USDT_TRC20_CONTRACT", "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"),
  liveTronSend: strEnv("LIVE_TRON_SEND", "0") === "1",
  gazBankPrivateKey: strEnv("GAZ_BANK_PRIVATE_KEY", "").replace(/^0x/i, "").trim(),
  withdrawWalletPrivateKey: strEnv("WITHDRAW_WALLET_PRIVATE_KEY", "")
    .replace(/^0x/i, "")
    .trim(),
  gasTrxToUserSun: numEnv("GAS_TRX_TO_USER_SUN", 2_000_000),
  tronFeeLimitSun: numEnv("TRON_FEE_LIMIT_SUN", 80_000_000),
  stubDepositGrossUsdt: numEnv("STUB_DEPOSIT_GROSS_USDT", 100),
  adminApiKey: strEnv("ADMIN_API_KEY", ""),
  telegramWebhookSecret: strEnv("TELEGRAM_WEBHOOK_SECRET", ""),
  publicTelegramBotUsername: strEnv("PUBLIC_TELEGRAM_BOT_USERNAME", "").replace(/^@/, "").trim(),
  withdrawAutoApprove: strEnv("WITHDRAW_AUTO_APPROVE", "0") === "1",
  metaPixelId: strEnv("META_PIXEL_ID", ""),
  metaAccessToken: strEnv("META_ACCESS_TOKEN", ""),
  metaTestEventCode: strEnv("META_TEST_EVENT_CODE", ""),
  gasBankLabel: strEnv("GAZ_BANK_ADDRESS", "GAZ_BANK"),
  topupBankLabel: strEnv("TOPUP_BANK_ADDRESS", "TOP_UP_BANK"),
  withdrawWalletLabel: strEnv("WITHDRAW_WALLET_ADDRESS", "WITHDRAW_WALLET"),
  walletSeedPerUser: strEnv("WALLET_SEED_PER_USER", "0") === "1",
  walletStoreEncryptedPk: strEnv("WALLET_STORE_ENCRYPTED_PK", "0") === "1",
  tronDepositWalletCreateUrl: strEnv("TRON_DEPOSIT_WALLET_CREATE_URL", "").trim(),
  tronDepositWalletCreateAuth: strEnv("TRON_DEPOSIT_WALLET_CREATE_AUTH", "").trim(),
  tronDepositWalletCreateTimeoutMs: numEnv("TRON_DEPOSIT_WALLET_CREATE_TIMEOUT_MS", 15_000),
  userWalletEncryptionKeyHex: strEnv("USER_WALLET_ENCRYPTION_KEY", "").replace(/^0x/i, "").trim(),
  recoveryCodePepper: strEnv("RECOVERY_CODE_PEPPER", "").trim(),
  tradingIngestSecret: strEnv("TRADING_INGEST_SECRET", "").trim(),
  tradingEngineNotifyUrl: strEnv("TRADING_ENGINE_NOTIFY_URL", "").trim(),
  tradingEngineNotifyTimeoutMs: numEnv("TRADING_ENGINE_NOTIFY_TIMEOUT_MS", 8_000),
  sibJournalSyncUrl: strEnv("SIB_JOURNAL_SYNC_URL", "").trim(),
  alTradeFeedEnabled: strEnv("AL_TRADE_FEED_ENABLED", "0") === "1",
  alTradeFeedBaseUrl: strEnv("AL_TRADE_FEED_BASE_URL", "").trim().replace(/\/$/, ""),
  alTradeFeedHttpUser: strEnv("AL_TRADE_FEED_HTTP_USER", "").trim(),
  alTradeFeedHttpPassword: strEnv("AL_TRADE_FEED_HTTP_PASSWORD", ""),
  /** Мин. 3 с; по умолчанию 8 с — чаще подтягиваем свежий trade-feed. */
  alTradeFeedPollIntervalMs: Math.max(
    3_000,
    numEnv("AL_TRADE_FEED_POLL_INTERVAL_SEC", 8) * 1000
  ),
  alTradeFeedSyncTgIds: strEnv("AL_TRADE_FEED_SYNC_TG_IDS", "")
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean),
  alPositionNotionalMinor: Math.max(100, numEnv("AL_POSITION_NOTIONAL_MINOR", 100_000)),
  alTradeFeedStoreSnapshots: strEnv("AL_TRADE_FEED_STORE_SNAPSHOTS", "1") === "1",
  alTradeFeedSnapshotRetentionDays: Math.max(1, numEnv("AL_TRADE_FEED_SNAPSHOT_RETENTION_DAYS", 7)),
  alTradeFeedSnapshotMaxRows: Math.max(100, numEnv("AL_TRADE_FEED_SNAPSHOT_MAX_ROWS", 2000))
};

export function assertWalletVaultEnv(c: AppConfig) {
  if (!c.walletSeedPerUser && !c.walletStoreEncryptedPk) return;
  const k = c.userWalletEncryptionKeyHex;
  if (!k || k.length !== 64 || !/^[0-9a-fA-F]+$/.test(k)) {
    throw new Error(
      "USER_WALLET_ENCRYPTION_KEY (64 hex characters) is required when WALLET_SEED_PER_USER=1 or WALLET_STORE_ENCRYPTED_PK=1."
    );
  }
  if (c.walletSeedPerUser && c.walletStoreEncryptedPk) {
    console.warn(
      "[boot] WALLET_STORE_ENCRYPTED_PK takes precedence over WALLET_SEED_PER_USER for new users."
    );
  }
}
