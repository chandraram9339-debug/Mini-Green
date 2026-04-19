export type HistoryListRowUi = {
  main: string;
  fee: string;
  id: string;
  date: string;
  /** Текст с бэка; если пусто — смотри `i18nTitleKey`. */
  title: string;
  /** Ключ i18n для мок-строк (вместо `title`). */
  i18nTitleKey?: string;
};

export type TabHistoryBundle = {
  rows: HistoryListRowUi[];
  totalAmount: number;
  count: number;
};

export type WalletHistoryBundle = {
  deposit: TabHistoryBundle;
  withdraw: TabHistoryBundle;
  referral: TabHistoryBundle;
};
