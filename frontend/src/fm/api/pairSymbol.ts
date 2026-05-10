/**
 * Пара в UI:
 * - отображение типа QUOTE/BASE (`formatAlStatePricePair`: BTCUSDT → USDT/BTC);
 * - или BASE/QUOTE (ETH/USDT);
 * - или уже склеено BTCUSDT.
 * Binance spot: всегда BASE+QUOTE, напр. BTCUSDT, ETHUSDT.
 */
const STABLE_QUOTES = new Set(["USDT", "USDC", "BUSD"]);

export function pricePairToBinanceSymbol(pricePair: string): string | null {
  const s = pricePair.trim().toUpperCase();
  if (!s || s === "—") return null;
  if (s.includes("/")) {
    const parts = s.split("/").map((x) => x.trim()).filter(Boolean);
    if (parts.length !== 2) return null;
    const [a, b] = parts;
    const aSt = STABLE_QUOTES.has(a);
    const bSt = STABLE_QUOTES.has(b);
    if (aSt && !bSt) return `${b}${a}`;
    if (bSt && !aSt) return `${a}${b}`;
    return `${a}${b}`;
  }
  if (/^[A-Z0-9]{6,24}$/.test(s)) return s;
  return null;
}

/** Как в {@link mergeAlTradeFeed} — символ журнала к виду Binance. */
export function journalSymbolToBinanceSymbol(symbol: string): string {
  return String(symbol).trim().toUpperCase().replace(/[/\s]+/g, "");
}

export function resolveBotBinanceSymbol(pricePair: string, journalRows: { symbol: string }[]): string {
  const fromPair = pricePairToBinanceSymbol(pricePair);
  if (fromPair) return fromPair;
  for (const r of journalRows) {
    const j = journalSymbolToBinanceSymbol(r.symbol);
    if (j.length >= 6) return j;
  }
  return "BTCUSDT";
}
