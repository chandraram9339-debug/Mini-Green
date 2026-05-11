/** Контракт минимально нужный миниаппу; бэкенд может расширять поля — парсим только нужное. */

/** Ссылки из админки; дублируются в GET /wallet рядом с /wallet/ui-settings. */
export type WalletMiniappUiFields = {
  chat_url?: string;
  support_url?: string;
  channel_url?: string;
  youtube_url?: string;
  public_telegram_bot_username?: string;
  miniapp_webapp_url?: string;
  /** HTML-free Markdown FAQ: ## вопрос + ответ; опционально # секция (admin). */
  faq_markdown?: string;
  /** Markdown FAQ (es); si vacío en API, la miniapp usa el bundle `FAQ.es.md`. */
  faq_markdown_es?: string;
};

export type WalletSeedScreenMeta = {
  mode: "per_user" | "legacy" | "disabled" | "custodial_pk";
  reason?:
    | "user_missing"
    | "custodial_private_key"
    | "feature_off"
    | "legacy_no_mnemonic"
    | "key_missing_or_invalid"
    | "decrypt_failed";
};

export type WalletSnapshot = {
  balanceUsdt: number;
  referralReceivedUsdt: number;
  /** Адрес пополнения с бэкенда (TRON Base58); если нет — fallback на env. */
  depositAddress?: string;
  /** Доступно к выводу; если нет — считаем от баланса как раньше. */
  availableWithdrawUsdt?: number;
  minDepositUsdt?: number;
  depositFeeBps?: number;
  depositFeeFixedUsdt?: number;
  minWithdrawUsdt?: number;
  /** Процент комиссии на вывод в basis points (1000 = 10%). */
  withdrawFeeBps?: number;
  /** Фиксированная комиссия на вывод в USDT. */
  withdrawFeeFixedUsdt?: number;
  /** Участвует ли пользователь в начислении результата сделок. */
  botTradingEnabled?: boolean;
  /** Персональная реферальная ссылка пользователя (https://t.me/BOT?start=refID). */
  referralLink?: string | null;
  /** ISO: начало текущего интервала положительного баланса (после пополнения). */
  positiveBalanceStartedAt?: string | null;
  /** Сумма подтверждённых депозитов (нетто), USDT — для шкалы графика «x». */
  cumulativeDepositsUsdt?: number;
  /** Соответствует buildWalletSeedMeta на бэке: показывать/скрывать сид. */
  seedScreen?: WalletSeedScreenMeta;
  /** Центральный TON-адрес для пополнения (админка / env). */
  centralTonDepositAddress?: string;
  /** USDT jetton master на TON (сеть mainnet в проде) — для jetton-транзакции. */
  tonUsdtJettonMaster?: string;
} & WalletMiniappUiFields;
