/** Ответ GET /trading/al-state (прокси AL /api/state). */
export type AlStateActiveTrade = {
  tradeNumber: number;
  pair: string;
  entryPrice: number;
  currentPrice: number;
  currentChangePercent: number;
  openTime: string;
  expiresAt: string | null;
};

export type AlStatePayload = {
  configured: boolean;
  fetched_at: string | null;
  isRunning: boolean | null;
  activeTrade: AlStateActiveTrade | null;
};
