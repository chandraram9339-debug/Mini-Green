import { apiFetch } from "./http";
import { parseBotTradingPayload } from "./parseBotTrading";
import type { BotTradingSnapshot } from "./typesBotTrading";

const STATIC_FALLBACK: BotTradingSnapshot = {
  displayPrice: "69 425.22",
  pricePair: "USDT/BTC",
  byPeriod: {
    "24h": {
      totalDeals: 78,
      successful: 39,
      unsuccessful: 39,
      profitPercent: -0.72,
      neutral: 0,
      openInPeriod: 0,
      closedWithoutResult: 0,
    },
    "3d": {
      totalDeals: 78,
      successful: 39,
      unsuccessful: 39,
      profitPercent: -0.72,
      neutral: 0,
      openInPeriod: 0,
      closedWithoutResult: 0,
    },
    "7d": {
      totalDeals: 78,
      successful: 39,
      unsuccessful: 39,
      profitPercent: -0.72,
      neutral: 0,
      openInPeriod: 0,
      closedWithoutResult: 0,
    },
    "1m": {
      totalDeals: 78,
      successful: 39,
      unsuccessful: 39,
      profitPercent: -0.72,
      neutral: 0,
      openInPeriod: 0,
      closedWithoutResult: 0,
    },
  },
};

/**
 * Торговля / цена / статистика. По умолчанию GET /trading/summary?period= (опционально).
 * Если ответ пустой — null (клиент использует макетные цифры).
 */
export async function fetchBotTrading(period: string): Promise<BotTradingSnapshot | null> {
  const pathTemplate = import.meta.env.VITE_API_TRADING_PATH ?? "/trading/summary";
  const sep = pathTemplate.includes("?") ? "&" : "?";
  const url = `${pathTemplate}${sep}period=${encodeURIComponent(period)}`;

  const res = await apiFetch(url, { method: "GET" });
  if (!res.ok) return null;
  const json: unknown = await res.json();
  const p = parseBotTradingPayload(json);
  if (p) return p;
  return null;
}

export { STATIC_FALLBACK as botTradingStaticFallback };
