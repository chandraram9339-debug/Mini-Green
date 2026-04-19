/** Контракт минимально нужный миниаппу; бэкенд может расширять поля — парсим только нужное. */

export type WalletSnapshot = {
  balanceUsdt: number;
  referralReceivedUsdt: number;
  /** Адрес пополнения с бэкенда (TRON Base58); если нет — fallback на env. */
  depositAddress?: string;
  /** Доступно к выводу; если нет — считаем от баланса как раньше. */
  availableWithdrawUsdt?: number;
};
