/** Открытая позиция из AL GET /api/trade-feed (поле opens). */
export type TradeFeedOpen = {
  tradeNumber: number;
  pair: string;
  entryPrice: number;
  time: string;
};

/** Закрытая сделка из AL GET /api/trade-feed (поле closes). */
export type TradeFeedClose = {
  tradeNumber: number;
  pair: string;
  exitPrice: number;
  result: number;
  time: string;
};

export type TradeFeedPayload = {
  opens: TradeFeedOpen[];
  closes: TradeFeedClose[];
  /** ISO время последнего успешного poll на бэкенде (если есть снимок). */
  fetched_at: string | null;
  /** На бэкенде заданы AL_TRADE_FEED_* для pull к симулятору. */
  configured: boolean;
};

/** Объединённая сущность после слияния open/close по tradeNumber (для отладки / расширений). */
export type UnifiedTradeFeedItem =
  | { kind: "open"; tradeNumber: number; pair: string; entryPrice: number; time: string }
  | {
      kind: "closed";
      tradeNumber: number;
      pair: string;
      entryPrice: number | null;
      exitPrice: number;
      result: number;
      openedAt: string;
      closedAt: string;
    };
