/** Форматирование полей карточки сделки (без UI). */
export function formatSymbolLabel(symbol: string): string {
  const u = symbol.toUpperCase().replace(/\s+/g, "");
  if (u.endsWith("USDT") && u.length > 4) {
    const base = u.slice(0, -4);
    return `${base} / USDT`;
  }
  return symbol.trim() || "—";
}

export function formatUnitLabel(symbol: string): string {
  const u = symbol.toUpperCase().replace(/\s+/g, "");
  if (u.endsWith("USDT") && u.length > 4) {
    const base = u.slice(0, -4);
    return `USDT/${base}`;
  }
  return "USDT/BTC";
}

export function fmtPriceQuote(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1000) {
    return n
      .toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      .replace(/,/g, " ");
  }
  return n.toFixed(n >= 1 ? 4 : 6);
}

export function fmtPctAbs(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${Math.abs(n).toFixed(2)} %`;
}

export function formatJournalIso(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${dd}.${mm}.${yyyy} ${hh}:${mi}`;
  } catch {
    return iso;
  }
}
