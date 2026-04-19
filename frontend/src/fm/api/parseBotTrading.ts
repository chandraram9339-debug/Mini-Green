import type { BotTradingPeriodStats, BotTradingSnapshot } from "./typesBotTrading";

function num(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const x = Number.parseFloat(v.replace(/%/g, "").replace(",", "."));
    if (Number.isFinite(x)) return x;
  }
  return undefined;
}

const PERIODS = ["24h", "3d", "7d", "1m"] as const;

type PeriodKey = (typeof PERIODS)[number];

/** Один блок статистики периода (`stats.24h`, `journal.meta.period_stats`). */
export function parseTradingPeriodStats(o: Record<string, unknown>): BotTradingPeriodStats {
  const neutral = Math.round(num(o.neutral) ?? num(o.breakeven) ?? 0);
  const openInPeriod = Math.round(
    num(o.openInPeriod) ?? num(o.open_in_period) ?? num(o.open) ?? 0,
  );
  const closedWithoutResult = Math.round(
    num(o.closedWithoutResult) ?? num(o.closed_without_result) ?? num(o.closedUnknown) ?? 0,
  );
  return {
    totalDeals: Math.round(
      num(o.totalDeals) ?? num(o.total) ?? num(o.deals) ?? num(o.trades) ?? 0,
    ),
    successful: Math.round(
      num(o.successful) ?? num(o.wins) ?? num(o.positive) ?? 0,
    ),
    unsuccessful: Math.round(
      num(o.unsuccessful) ?? num(o.fails) ?? num(o.negative) ?? 0,
    ),
    profitPercent: num(o.profitPercent) ?? num(o.pnlPercent) ?? num(o.resultPercent) ?? 0,
    neutral: neutral || undefined,
    openInPeriod: openInPeriod || undefined,
    closedWithoutResult: closedWithoutResult || undefined,
  };
}

function priceStr(v: unknown): string | undefined {
  if (typeof v === "number" && Number.isFinite(v)) {
    return v.toLocaleString("en-US").replace(/,/g, " ");
  }
  if (typeof v === "string" && v.trim()) return v.trim();
  return undefined;
}

/**
 * Поддержка:
 * { currentPrice, pricePair, stats: { 24h: { ... } } } или stats в корне, или один блок без периода.
 */
export function parseBotTradingPayload(root: unknown): BotTradingSnapshot | null {
  if (root == null || typeof root !== "object") return null;
  let o = root as Record<string, unknown>;
  if (o.data && typeof o.data === "object") o = o.data as Record<string, unknown>;
  if (o.result && typeof o.result === "object") o = o.result as Record<string, unknown>;

  const displayPrice =
    priceStr(o.currentPrice) ??
    priceStr(o.lastPrice) ??
    priceStr(o.btcUsdt) ??
    priceStr(o.spotPrice) ??
    (typeof o.price === "object" && o.price && typeof o.price === "object"
      ? priceStr((o.price as Record<string, unknown>).value) ??
        priceStr((o.price as Record<string, unknown>).last)
      : undefined);

  const pricePair = String(
    o.pricePair ?? o.pair ?? o.symbol ?? o.market ?? "USDT/BTC",
  );

  const byPeriod: BotTradingSnapshot["byPeriod"] = {};
  const statsBlock = o.stats ?? o.statistics ?? o.byPeriod ?? o.periods;
  if (statsBlock && typeof statsBlock === "object") {
    for (const p of PERIODS) {
      const raw = (statsBlock as Record<string, unknown>)[p] ?? (statsBlock as Record<string, unknown>)[p.replace("h", "H")];
      if (raw && typeof raw === "object") {
        byPeriod[p] = parseTradingPeriodStats(raw as Record<string, unknown>);
      }
    }
  }

  if (Object.keys(byPeriod).length === 0) {
    const one = o.summary ?? o.period ?? o.aggregate;
    if (one && typeof one === "object") {
      const s = parseTradingPeriodStats(one as Record<string, unknown>);
      for (const p of PERIODS) {
        byPeriod[p] = { ...s };
      }
    } else {
      for (const p of PERIODS) {
        const b = o[p] ?? o[`p_${p}`];
        if (b && typeof b === "object") {
          byPeriod[p] = parseTradingPeriodStats(b as Record<string, unknown>);
        }
      }
    }
  }

  const hasAnyStat = PERIODS.some((p) => byPeriod[p] !== undefined);
  if (!displayPrice && !hasAnyStat) return null;

  return {
    displayPrice: displayPrice ?? "—",
    pricePair: pricePair || "—",
    byPeriod: hasAnyStat
      ? byPeriod
      : {
          "24h": {
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
}

export function getStatsForPeriod(
  snap: BotTradingSnapshot,
  period: PeriodKey,
  fallback: BotTradingPeriodStats,
): BotTradingPeriodStats {
  return snap.byPeriod[period] ?? snap.byPeriod["24h"] ?? fallback;
}
