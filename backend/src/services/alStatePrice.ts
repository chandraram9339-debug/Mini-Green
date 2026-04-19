import type { AppConfig } from "../config.js";

type AlStateResponse = {
  activeTrade?: {
    pair?: unknown;
    currentPrice?: unknown;
  } | null;
};

export type LiveTradingPrice = {
  currentPrice: number;
  pricePair: string;
};

function normalizeUiPair(pair: string): string {
  const upper = pair.trim().toUpperCase();
  if (!upper) return "USDT/BTC";
  if (upper.includes("/")) return upper;

  const quoteCandidates = ["USDT", "USDC", "BUSD", "BTC", "ETH", "BNB"] as const;
  for (const quote of quoteCandidates) {
    if (!upper.endsWith(quote) || upper.length <= quote.length) continue;
    const base = upper.slice(0, -quote.length);
    return `${quote}/${base}`;
  }
  return upper;
}

function readFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.trim());
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function hasAlStateHttpConfig(c: AppConfig): boolean {
  return (
    Boolean(c.alTradeFeedBaseUrl.trim()) &&
    Boolean(c.alTradeFeedHttpUser.trim()) &&
    Boolean(c.alTradeFeedHttpPassword)
  );
}

let cachedLivePrice: LiveTradingPrice | null = null;
let cacheExpiresAt = 0;
let inFlight: Promise<LiveTradingPrice | null> | null = null;

/**
 * Reads live `activeTrade.currentPrice` from AL `/api/state`.
 * Returns null when config is incomplete, request fails, or there is no open trade.
 */
export async function fetchAlLiveTradingPrice(c: AppConfig): Promise<LiveTradingPrice | null> {
  const now = Date.now();
  if (cachedLivePrice && now < cacheExpiresAt) return cachedLivePrice;
  if (inFlight) return inFlight;
  if (!hasAlStateHttpConfig(c)) return null;

  inFlight = (async () => {
    const base = c.alTradeFeedBaseUrl.trim().replace(/\/$/, "");
    const url = `${base}/api/state`;
    const auth = Buffer.from(`${c.alTradeFeedHttpUser}:${c.alTradeFeedHttpPassword}`, "utf8").toString(
      "base64",
    );

    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), 12_000);
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
          "User-Agent": "curl/8.0",
        },
        signal: ac.signal,
      });
      if (!res.ok) return null;

      const json = (await res.json()) as AlStateResponse;
      const activeTrade =
        json && typeof json === "object" && "activeTrade" in json ? json.activeTrade : null;
      if (!activeTrade || typeof activeTrade !== "object") {
        cachedLivePrice = null;
        cacheExpiresAt = now + 3_000;
        return null;
      }

      const currentPrice = readFiniteNumber(activeTrade.currentPrice);
      if (currentPrice == null) {
        cachedLivePrice = null;
        cacheExpiresAt = now + 3_000;
        return null;
      }

      const pairRaw = typeof activeTrade.pair === "string" ? activeTrade.pair : "BTCUSDT";
      const livePrice = {
        currentPrice,
        pricePair: normalizeUiPair(pairRaw),
      };
      cachedLivePrice = livePrice;
      cacheExpiresAt = now + 3_000;
      return livePrice;
    } catch {
      return null;
    } finally {
      clearTimeout(to);
      inFlight = null;
    }
  })();

  return inFlight;
}
