/** Статистика бота за один период (совпадает с `/trading/summary` и `journal.meta.period_stats`). */
export type BotTradingPeriodStats = {
  totalDeals: number;
  successful: number;
  unsuccessful: number;
  /** Можно форматировать как -0.72% */
  profitPercent: number;
  neutral?: number;
  openInPeriod?: number;
  closedWithoutResult?: number;
};

export type BotTradingSnapshot = {
  /** Отображаемая цена (как в макете, с пробелами или без) */
  displayPrice: string;
  pricePair: string;
  byPeriod: Partial<Record<"24h" | "3d" | "7d" | "1m", BotTradingPeriodStats>>;
};
