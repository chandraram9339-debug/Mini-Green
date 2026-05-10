import type { CandlestickData, UTCTimestamp } from "lightweight-charts";

export type BinanceKlineInterval = "15m" | "1h" | "4h" | "1d";

const DEFAULT_BASE = "https://api.binance.com/api/v3";

/**
 * Публичные свечи Binance (без ключа). При другом окружении можно задать
 * `VITE_BINANCE_API_BASE` (прокси), если прямой запрос с клиента недоступен.
 */
export async function fetchBinanceCandles(
  symbol: string,
  interval: BinanceKlineInterval,
  limit = 500,
): Promise<CandlestickData[]> {
  const base = (import.meta.env.VITE_BINANCE_API_BASE ?? DEFAULT_BASE).replace(/\/$/, "");
  const sym = symbol.trim().toUpperCase();
  const url = `${base}/klines?symbol=${encodeURIComponent(sym)}&interval=${encodeURIComponent(interval)}&limit=${encodeURIComponent(String(Math.min(1000, Math.max(50, limit))))}`;

  const res = await fetch(url);
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Binance ${res.status}${t ? `: ${t.slice(0, 120)}` : ""}`);
  }
  const raw: unknown = await res.json();
  if (!Array.isArray(raw)) throw new Error("invalid_binance_json");

  const out: CandlestickData[] = [];
  for (const row of raw) {
    if (!Array.isArray(row) || row.length < 6) continue;
    const openT = Number(row[0]);
    const open = Number(row[1]);
    const high = Number(row[2]);
    const low = Number(row[3]);
    const close = Number(row[4]);
    if (!Number.isFinite(openT) || !Number.isFinite(open) || !Number.isFinite(high) || !Number.isFinite(low) || !Number.isFinite(close)) {
      continue;
    }
    out.push({
      time: Math.floor(openT / 1000) as UTCTimestamp,
      open,
      high,
      low,
      close,
    });
  }
  return out;
}
