import { apiFetch } from "./http";
import { parseBotTradingPayload } from "./parseBotTrading";
import type { BotTradingSnapshot } from "./typesBotTrading";

const EMPTY_PERIOD = {
  totalDeals: 0,
  successful: 0,
  unsuccessful: 0,
  profitPercent: 0,
  neutral: 0,
  openInPeriod: 0,
  closedWithoutResult: 0,
};

const STATIC_FALLBACK: BotTradingSnapshot = {
  displayPrice: "—",
  pricePair: "—",
  byPeriod: {
    "24h": { ...EMPTY_PERIOD },
    "3d":  { ...EMPTY_PERIOD },
    "7d":  { ...EMPTY_PERIOD },
    "1m":  { ...EMPTY_PERIOD },
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
