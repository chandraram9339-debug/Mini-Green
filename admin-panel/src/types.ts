export type StatsResponse = {
  unique_new_users: Record<"d1" | "d3" | "d7" | "d30" | "all", number>;
  users_blocked_bot: Record<"d1" | "d3" | "d7" | "d30" | "all", number>;
  users_made_deposit: Record<"d1" | "d3" | "d7" | "d30" | "all", number>;
  mau_dau_window: Record<"d1" | "d3" | "d7" | "d30", number>;
  deposit_count_total: number;
  sum_deposits_usd: string;
  sum_withdrawals_usd: string;
  avg_deposit_usd: string;
  avg_deposits_per_depositor: string;
  avg_withdraw_usd: string;
};

export type FeePolicy = {
  minDepositUsdt: number;
  depositFeeFixedUsdt: number;
  depositFeeBps: number;
  withdrawFeeFixedUsdt: number;
  withdrawFeeBps: number;
  referralPercentBps: number;
  referralDepositRule: string;
  metaPurchaseMinUsdt: number;
};

export type AdminConfigResponse = {
  policy: FeePolicy;
  app_config: Record<string, string>;
};

export type WalletHealthEntry = {
  key: "gas_bank" | "withdraw_wallet";
  label: string;
  address: string | null;
  address_source: "app_config" | "private_key" | "unresolved";
  trx_balance_sun: number | null;
  trx_balance_trx: number | null;
  usdt_balance_minor: number | null;
  usdt_balance_usdt: number | null;
  ok: boolean;
  alerts: string[];
};

export type WalletHealthResponse = {
  live_tron_send: boolean;
  checked_at: string;
  gas_bank: WalletHealthEntry;
  withdraw_wallet: WalletHealthEntry;
  alerts: string[];
};

export type DepositRow = {
  id: string;
  user_id: number;
  tg: string;
  gross_minor: number;
  fee_minor: number;
  net_minor: number;
  status: string;
  created_at: string;
  completed_at: string | null;
  source: string;
  idempotency_key: string | null;
};

export type WithdrawalRow = Record<string, unknown> & {
  id: string;
  status: string;
  tg: string;
  amount_minor?: number;
  fee_minor?: number;
  to_address?: string;
  created_at?: string;
};

export type MetaAccountRow = {
  id: string;
  label: string | null;
  pixel_id: string;
  is_enabled: number;
  created_at: string;
};

export type MetaStatusResponse = {
  enabled_meta_accounts_count: number;
  env_fallback_configured: boolean;
  test_event_code_configured: boolean;
  webhook_secret_configured: boolean;
  purchase_threshold_usdt: number;
  subscribe_ready: boolean;
  purchase_ready: boolean;
  pixels: Array<{
    pixel_id: string;
    source: "db" | "env" | "db+env";
    label: string | null;
  }>;
  notes: string[];
};

export type MetaDispatchSummary = {
  event_name: "Subscribe" | "Purchase";
  event_id: string;
  external_id: string;
  configured: boolean;
  eligible: boolean;
  skipped_reason: "no_pixels" | "below_threshold" | null;
  attempted_pixels: number;
  sent_pixels: number;
  failed_pixels: number;
  test_event_code_configured: boolean;
  threshold_usdt: number | null;
  value_usdt: number | null;
  results: Array<{
    pixel_id: string;
    source: "db" | "env" | "db+env";
    status: "sent" | "failed";
    http_status?: number;
    response_preview?: string;
  }>;
};

export type BroadcastRow = {
  id: number;
  segment: string;
  text_preview: string;
  sent_count: number;
  created_at: string;
};

export type ContentPayload = {
  channel_url: string;
  chat_url: string;
  support_url: string;
  youtube_url: string;
  public_telegram_bot_username: string;
  /** Direct link to open the Telegram Web App (e.g. https://t.me/BotName/shortName from BotFather). */
  miniapp_webapp_url: string;
  /** Plain text: ответ бота на /start (кнопки канал/чат/апп добавляются отдельно). */
  telegram_welcome_text: string;
  faq_markdown: string;
  user_agreement_markdown: string;
};

/** GET /admin/integrations/verify — mirrors backend `IntegrationsReport`. */
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
  trading: {
    engine_notify_url_configured: boolean;
    ingest_secret_configured: boolean;
  };
  meta: MetaStatusResponse;
  hints: string[];
};
