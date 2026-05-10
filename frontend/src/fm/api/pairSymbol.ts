/**
 * Пара в UI обычно "BASE/QUOTE" (как {@link formatAlStatePricePair}); Binance spot — "BASEQUOTE".
 */
export function pricePairToBinanceSymbol(pricePair: string): string | null {
  const s = pricePair.trim().toUpperCase();
  if (!s || s === "—") return null;
  if (s.includes("/")) {
    const parts = s.split("/").map((x) => x.trim()).filter(Boolean);
    if (parts.length === 2) return `${parts[0]}${parts[1]}`;
    return null;
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
