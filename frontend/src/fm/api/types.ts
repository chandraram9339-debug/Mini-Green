/** Контракт минимально нужный миниаппу; бэкенд может расширять поля — парсим только нужное. */

/** Ссылки из админки; дублируются в GET /wallet рядом с /wallet/ui-settings. */
export type WalletMiniappUiFields = {
  chat_url?: string;
  support_url?: string;
  channel_url?: string;
  youtube_url?: string;
  public_telegram_bot_username?: string;
  miniapp_webapp_url?: string;
};

export type WalletSnapshot = {
  balanceUsdt: number;
  referralReceivedUsdt: number;
  /** Адрес пополнения с бэкенда (TRON Base58); если нет — fallback на env. */
  depositAddress?: string;
  /** Доступно к выводу; если нет — считаем от баланса как раньше. */
  availableWithdrawUsdt?: number;
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
} & WalletMiniappUiFields;
