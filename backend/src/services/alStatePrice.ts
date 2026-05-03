import type { AppConfig } from "../config.js";

export type LiveTradingPrice = {
  currentPrice: number;
  pricePair: string;
};

/** Публичный снимок AL GET /api/state для миниаппа (без секретов). */
export type AlStateMiniappActiveTrade = {
  tradeNumber: number;
  pair: string;
  entryPrice: number;
  currentPrice: number;
  currentChangePercent: number;
  openTime: string;
  expiresAt: string | null;
};

export type AlStateMiniappPayload = {
  configured: boolean;
  fetched_at: string | null;
  isRunning: boolean | null;
  activeTrade: AlStateMiniappActiveTrade | null;
};

function unconfiguredPayload(): AlStateMiniappPayload {
  return { configured: false, fetched_at: null, isRunning: null, activeTrade: null };
}

export function normalizeUiPair(pair: string): string {
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
    const parsed = Number.parseFloat(value.trim().replace(/%/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function readBoolLoose(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1" || value === "true") return true;
  if (value === 0 || value === "0" || value === "false") return false;
  return null;
}

function readString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

function pick(obj: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    if (k in obj && obj[k] !== undefined) return obj[k];
  }
  return undefined;
}

function parseActiveTrade(raw: unknown): AlStateMiniappActiveTrade | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const tn = readFiniteNumber(pick(o, "tradeNumber", "trade_number"));
  const pairRaw = readString(pick(o, "pair", "symbol")) ?? "BTCUSDT";
  const entryPrice = readFiniteNumber(pick(o, "entryPrice", "entry_price"));
  const currentPrice = readFiniteNumber(pick(o, "currentPrice", "current_price"));
  const chPct =
    readFiniteNumber(pick(o, "currentChangePercent", "current_change_percent", "changePercent")) ?? 0;
  const openTime =
    readString(pick(o, "openTime", "open_time")) ??
    readString(pick(o, "time")) ??
    "";
  const expRaw = pick(o, "expiresAt", "expires_at");
  let expiresAt: string | null = null;
  if (expRaw !== null && expRaw !== undefined && expRaw !== "") {
    const es =
      readString(expRaw) ?? (typeof expRaw === "number" && Number.isFinite(expRaw) ? String(expRaw) : null);
    if (es && !Number.isNaN(Date.parse(es))) expiresAt = es;
  }

  if (tn == null || entryPrice == null || currentPrice == null) {
    return null;
  }
  if (!openTime || Number.isNaN(Date.parse(openTime))) {
    return null;
  }

  return {
    tradeNumber: Math.round(tn),
    pair: pairRaw,
    entryPrice,
    currentPrice,
    currentChangePercent: chPct,
    openTime,
    expiresAt,
  };
}

function parseAlStateResponse(json: unknown, fetchedAt: string): AlStateMiniappPayload {
  if (!json || typeof json !== "object") {
    return { configured: true, fetched_at: fetchedAt, isRunning: null, activeTrade: null };
  }
  const root = json as Record<string, unknown>;
  const isRunning = readBoolLoose(pick(root, "isRunning", "is_running", "botRunning", "running"));
  const atRaw = pick(root, "activeTrade", "active_trade");
  const activeTrade = parseActiveTrade(atRaw);
  return {
    configured: true,
    fetched_at: fetchedAt,
    isRunning,
    activeTrade,
  };
}

export function hasAlStateHttpConfig(c: AppConfig): boolean {
  return (
    Boolean(c.alTradeFeedBaseUrl.trim()) &&
    Boolean(c.alTradeFeedHttpUser.trim()) &&
    Boolean(c.alTradeFeedHttpPassword)
  );
}

const CACHE_TTL_MS = 3000;

let cachePayload: AlStateMiniappPayload | null = null;
let cacheExpiresAt = 0;
let inFlight: Promise<AlStateMiniappPayload> | null = null;

/**
 * Один запрос к AL /api/state на окно кэша; используется и для /trading/summary, и для GET /trading/al-state.
 */
export async function getAlStateMiniappPayload(c: AppConfig): Promise<AlStateMiniappPayload> {
  if (!hasAlStateHttpConfig(c)) {
    return unconfiguredPayload();
  }

  const now = Date.now();
  if (cachePayload && now < cacheExpiresAt) {
    return cachePayload;
  }

  if (inFlight) return inFlight;

  inFlight = (async () => {
    const base = c.alTradeFeedBaseUrl.trim().replace(/\/$/, "");
    const url = `${base}/api/state`;
    const auth = Buffer.from(`${c.alTradeFeedHttpUser}:${c.alTradeFeedHttpPassword}`, "utf8").toString(
      "base64",
    );

    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), 12_000);
    const fetchedAt = new Date().toISOString();

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
          "User-Agent": "miniapp-backend-al-state/1",
        },
        signal: ac.signal,
      });

      if (!res.ok) {
        const errPayload: AlStateMiniappPayload = {
          configured: true,
          fetched_at: fetchedAt,
          isRunning: null,
          activeTrade: null,
        };
        cachePayload = errPayload;
        cacheExpiresAt = Date.now() + CACHE_TTL_MS;
        return errPayload;
      }

      const json: unknown = await res.json();
      const payload = parseAlStateResponse(json, fetchedAt);
      cachePayload = payload;
      cacheExpiresAt = Date.now() + CACHE_TTL_MS;
      return payload;
    } catch {
      const errPayload: AlStateMiniappPayload = {
        configured: true,
        fetched_at: fetchedAt,
        isRunning: null,
        activeTrade: null,
      };
      cachePayload = errPayload;
      cacheExpiresAt = Date.now() + CACHE_TTL_MS;
      return errPayload;
    } finally {
      clearTimeout(to);
      inFlight = null;
    }
  })();

  return inFlight;
}

/**
 * Совместимость: цена для `buildTradingSummaryForUser` из того же снимка, что и /trading/al-state.
 */
export async function fetchAlLiveTradingPrice(c: AppConfig): Promise<LiveTradingPrice | null> {
  const p = await getAlStateMiniappPayload(c);
  const at = p.activeTrade;
  if (!at || !Number.isFinite(at.currentPrice)) return null;
  return {
    currentPrice: at.currentPrice,
    pricePair: normalizeUiPair(at.pair),
  };
}
