import { config, type AppConfig } from "../config.js";
import { getDb } from "../db/connection.js";

export type IntegrationsReport = {
  telegram: {
    configured: boolean;
    ok: boolean;
    http_status?: number;
    bot_username?: string;
    error?: string;
  };
  tron: {
    full_host: string;
    has_api_key: boolean;
    ok: boolean;
    http_status?: number;
    block_id_prefix?: string;
    error?: string;
  };
  /** Deposit wallet modes + on-chain flags (no secrets). */
  wallets: {
    wallet_seed_per_user: boolean;
    wallet_store_encrypted_pk: boolean;
    user_wallet_encryption_key_configured: boolean;
    tron_deposit_wallet_create_url_configured: boolean;
    hd_wallet_mnemonic_configured: boolean;
    deterministic_derive_key_configured: boolean;
    live_tron: boolean;
    live_tron_send: boolean;
    gaz_bank_private_key_configured: boolean;
    withdraw_wallet_private_key_configured: boolean;
  };
  mode: {
    auth_provider: string;
    live_tron: boolean;
    live_tron_send: boolean;
  };
  /** Outbound Start/Stop notify + inbound position ingest (no secret values). */
  trading: {
    engine_notify_url_configured: boolean;
    ingest_secret_configured: boolean;
  };
  hints: string[];
};

/**
 * Проверка `TELEGRAM_BOT_TOKEN` (getMe) и Tron full node (getnowblock + TRON-PRO-API-KEY). Секреты в ответ не попадают.
 */
export async function runIntegrationsVerify(c: AppConfig = config): Promise<IntegrationsReport> {
  const hints: string[] = [];
  if (c.authProviderMode === "mock") {
    hints.push("For production WebApp: set AUTH_PROVIDER_MODE=telegram and valid TELEGRAM_BOT_TOKEN");
  }
  if (!c.tronApiKey) {
    hints.push("TronGrid may rate-limit; set TRON_API_KEY from https://www.trongrid.io/");
  }
  if (c.liveTron && !c.tronApiKey) {
    hints.push("LIVE_TRON=1 without TRON_API_KEY: on-chain reads may be unreliable on public limits");
  }
  if (c.tronApiKey && !c.liveTron) {
    hints.push(
      "TRON_API_KEY is set but LIVE_TRON=0: user USDT balance is not read from chain; deposit test flow uses STUB_DEPOSIT_GROSS_USDT on PAID. Set LIVE_TRON=1 to credit from on-chain USDT (TronGrid)."
    );
  }
  if (!c.recoveryCodePepper) {
    hints.push("Set RECOVERY_CODE_PEPPER to enable app account recovery (Seed screen + /api/v1/ui/recovery-claim).");
  }
  if (!c.tradingEngineNotifyUrl.trim()) {
    hints.push(
      "TRADING_ENGINE_NOTIFY_URL empty: Start/Stop in the miniapp only updates bot_trading_enabled in the database; no outbound POST to an external engine."
    );
  }
  if (!c.tradingIngestSecret) {
    hints.push(
      "TRADING_INGEST_SECRET empty: POST /hooks/trading/v1/ingest is disabled (401) — position sync from the engine will not apply."
    );
  }
  if (!c.sibJournalSyncUrl.trim()) {
    hints.push(
      "SIB_JOURNAL_SYNC_URL empty: after deposit/withdraw the backend will not request the engine to push the journal; SIB still works if the engine ingests on its own."
    );
  }
  if (c.alTradeFeedEnabled) {
    if (!c.alTradeFeedBaseUrl.trim()) {
      hints.push("AL_TRADE_FEED_ENABLED=1 but AL_TRADE_FEED_BASE_URL is empty.");
    }
    if (!c.alTradeFeedHttpUser || !c.alTradeFeedHttpPassword) {
      hints.push("AL trade feed: set AL_TRADE_FEED_HTTP_USER and AL_TRADE_FEED_HTTP_PASSWORD (HTTP Basic to the AL host).");
    }
    if (c.alTradeFeedSyncTgIds.length === 0) {
      hints.push("AL_TRADE_FEED_SYNC_TG_IDS empty: no Telegram users will receive mirrored opens/closes from GET /api/trade-feed.");
    }
  }
  if (c.walletStoreEncryptedPk && c.tronDepositWalletCreateUrl.trim().length === 0) {
    hints.push(
      "WALLET_STORE_ENCRYPTED_PK=1 with empty TRON_DEPOSIT_WALLET_CREATE_URL: new users get locally generated TRON keys via TronWeb (fine for prod if you accept random keys per user)."
    );
  }
  if (c.liveTronSend && (!c.gazBankPrivateKey || !c.withdrawWalletPrivateKey)) {
    hints.push(
      "LIVE_TRON_SEND=1 expects GAZ_BANK_PRIVATE_KEY and WITHDRAW_WALLET_PRIVATE_KEY for gas + sweep; missing keys stay log-only."
    );
  }

  try {
    const db = getDb();
    const row = db
      .prepare("SELECT value FROM app_config WHERE key = ?")
      .get("content_miniapp_webapp_url") as { value: string } | undefined;
    if (!String(row?.value ?? "").trim()) {
      hints.push(
        "Admin → Content: set «Ссылка для запуска мини-аппа» (t.me/… from BotFather) to open the Web App from the admin panel."
      );
    }
  } catch {
    /* DB unavailable during some tests */
  }

  let telegram: IntegrationsReport["telegram"] = { configured: false, ok: false };
  if (c.telegramBotToken) {
    try {
      const r = await fetch(`https://api.telegram.org/bot${c.telegramBotToken}/getMe`);
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; result?: { username?: string } };
      const ok = r.ok && j.ok === true;
      telegram = {
        configured: true,
        ok,
        http_status: r.status,
        bot_username: j.result?.username,
        error: ok ? undefined : "getMe failed (revoked or invalid token?)"
      };
    } catch (e) {
      telegram = { configured: true, ok: false, error: String(e) };
    }
  } else {
    telegram = { configured: false, ok: false, error: "TELEGRAM_BOT_TOKEN empty" };
  }

  const h = c.tronFullHost.replace(/\/$/, "");
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (c.tronApiKey) {
    headers["TRON-PRO-API-KEY"] = c.tronApiKey;
  }
  let tron: IntegrationsReport["tron"] = {
    full_host: h,
    has_api_key: Boolean(c.tronApiKey),
    ok: false
  };
  try {
    const r = await fetch(`${h}/wallet/getnowblock`, {
      method: "POST",
      headers,
      body: "{}"
    });
    const j = (await r.json().catch(() => ({}))) as { blockID?: string; Error?: string };
    const id = j.blockID;
    tron = {
      full_host: h,
      has_api_key: Boolean(c.tronApiKey),
      ok: r.ok,
      http_status: r.status,
      block_id_prefix: typeof id === "string" ? id.slice(0, 20) : undefined,
      error: r.ok
        ? undefined
        : (j as { Error?: string })?.Error ?? `http ${r.status} (host or API key?)`
    };
  } catch (e) {
    tron = { ...tron, error: String(e) };
  }

  const trading = {
    engine_notify_url_configured: Boolean(c.tradingEngineNotifyUrl.trim()),
    ingest_secret_configured: Boolean(c.tradingIngestSecret)
  };

  const wallets = {
    wallet_seed_per_user: c.walletSeedPerUser,
    wallet_store_encrypted_pk: c.walletStoreEncryptedPk,
    user_wallet_encryption_key_configured: Boolean(
      c.userWalletEncryptionKeyHex && /^[0-9a-fA-F]{64}$/.test(c.userWalletEncryptionKeyHex)
    ),
    tron_deposit_wallet_create_url_configured: Boolean(c.tronDepositWalletCreateUrl.trim().length > 0),
    hd_wallet_mnemonic_configured: Boolean(c.hdWalletMnemonic.trim().length > 0),
    deterministic_derive_key_configured: Boolean(c.deterministicDeriveKeyHex.replace(/^0x/i, "").trim().length >= 64),
    live_tron: c.liveTron,
    live_tron_send: c.liveTronSend,
    gaz_bank_private_key_configured: Boolean(c.gazBankPrivateKey.replace(/^0x/i, "").trim().length === 64),
    withdraw_wallet_private_key_configured: Boolean(c.withdrawWalletPrivateKey.replace(/^0x/i, "").trim().length === 64)
  };

  return {
    telegram,
    tron,
    wallets,
    trading,
    mode: {
      auth_provider: c.authProviderMode,
      live_tron: c.liveTron,
      live_tron_send: c.liveTronSend
    },
    hints
  };
}
