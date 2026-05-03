import type { TradingJournalItem } from "./fetchTradingJournal";
import type { TradeFeedClose, TradeFeedOpen, UnifiedTradeFeedItem } from "./tradeFeedTypes";

function normalizeSymbol(pair: string): string {
  return String(pair).trim().toUpperCase().replace(/[/\s]+/g, "");
}

/** Оставить последнюю по времени запись на каждый tradeNumber (дедуп по типу). */
function dedupeOpensByTradeNumber(opens: TradeFeedOpen[]): TradeFeedOpen[] {
  const byNum = new Map<number, TradeFeedOpen>();
  for (const o of opens) {
    const prev = byNum.get(o.tradeNumber);
    if (!prev || Date.parse(o.time) >= Date.parse(prev.time)) byNum.set(o.tradeNumber, o);
  }
  return [...byNum.values()];
}

function dedupeClosesByTradeNumber(closes: TradeFeedClose[]): TradeFeedClose[] {
  const byNum = new Map<number, TradeFeedClose>();
  for (const c of closes) {
    const prev = byNum.get(c.tradeNumber);
    if (!prev || Date.parse(c.time) >= Date.parse(prev.time)) byNum.set(c.tradeNumber, c);
  }
  return [...byNum.values()];
}

/** Слияние opens/closes с дедупом по tradeNumber внутри каждого массива. */
export function mergeTradeFeedToUnifiedItems(opens: TradeFeedOpen[], closes: TradeFeedClose[]): UnifiedTradeFeedItem[] {
  const oDedup = dedupeOpensByTradeNumber(opens);
  const cDedup = dedupeClosesByTradeNumber(closes);
  const openByNum = new Map<number, TradeFeedOpen>();
  for (const o of oDedup) openByNum.set(o.tradeNumber, o);

  const items: UnifiedTradeFeedItem[] = [];

  for (const cl of cDedup) {
    const op = openByNum.get(cl.tradeNumber);
    items.push({
      kind: "closed",
      tradeNumber: cl.tradeNumber,
      pair: normalizeSymbol(cl.pair || op?.pair || ""),
      entryPrice: op != null && Number.isFinite(op.entryPrice) ? op.entryPrice : null,
      exitPrice: cl.exitPrice,
      result: cl.result,
      openedAt: op?.time ?? cl.time,
      closedAt: cl.time,
    });
  }

  for (const o of oDedup) {
    if (cDedup.some((c) => c.tradeNumber === o.tradeNumber)) continue;
    items.push({
      kind: "open",
      tradeNumber: o.tradeNumber,
      pair: normalizeSymbol(o.pair),
      entryPrice: o.entryPrice,
      time: o.time,
    });
  }

  items.sort((a, b) => {
    const ta = Date.parse(a.kind === "closed" ? a.closedAt : a.time);
    const tb = Date.parse(b.kind === "closed" ? b.closedAt : b.time);
    return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
  });

  return items;
}

/** Карточки ленты бота: те же поля, что ожидает `BotJournalTradeCard`. */
export function unifiedTradeFeedToJournalItems(items: UnifiedTradeFeedItem[]): TradingJournalItem[] {
  const out: TradingJournalItem[] = [];
  for (const it of items) {
    if (it.kind === "open") {
      out.push({
        id: `al-feed-open-${it.tradeNumber}-${it.time}`,
        symbol: it.pair,
        side: "long",
        size_minor: 0,
        opened_at: it.time,
        closed_at: null,
        status: "open",
        entry_price: it.entryPrice,
        exit_price: null,
        result_percent: null,
        delta_minor: null,
      });
    } else {
      out.push({
        id: `al-feed-closed-${it.tradeNumber}-${it.closedAt}`,
        symbol: it.pair,
        side: "long",
        size_minor: 0,
        opened_at: it.openedAt,
        closed_at: it.closedAt,
        status: "closed",
        entry_price: it.entryPrice,
        exit_price: it.exitPrice,
        result_percent: it.result,
        delta_minor: null,
      });
    }
  }
  return out;
}

export function mergeTradeFeedPayloadToJournalItems(
  opens: TradeFeedOpen[],
  closes: TradeFeedClose[],
): TradingJournalItem[] {
  return unifiedTradeFeedToJournalItems(mergeTradeFeedToUnifiedItems(opens, closes));
}
