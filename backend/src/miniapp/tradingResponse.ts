import {
  getAccountSnapshot,
  getTradingDetailsForPeriod,
  type TradingPeriodKey
} from "../ledger.js";

const PERIODS = ["24h", "3d", "7d", "1m"] as const;

/** Legacy Figma periods use `1m`; ledger windows use `30d`. */
function legacyPeriodToLedgerKey(p: string): TradingPeriodKey {
  if (p === "1m") return "30d";
  if (p === "24h" || p === "3d" || p === "7d") return p;
  return "7d";
}

function statsFromPositions(positions: { side: string }[]): {
  totalDeals: number;
  successful: number;
  unsuccessful: number;
  profitPercent: number;
} {
  let long = 0;
  let short = 0;
  for (const x of positions) {
    if (String(x.side).toLowerCase() === "short") short += 1;
    else long += 1;
  }
  const totalDeals = positions.length;
  return {
    totalDeals,
    successful: long,
    unsuccessful: short,
    profitPercent: 0
  };
}

/**
 * Shapes a payload compatible with `parseBotTrading` in the Figma app.
 * Period stats reflect open positions in `trade_positions` whose `opened_at` falls in each window.
 * Price fields are a deterministic display scalar (no live market feed in-repo).
 */
export function buildTradingSummaryForUser(userId: string) {
  const s = getAccountSnapshot(userId);
  const sumNotional = s.positions.reduce((acc, p) => acc + p.size_minor, 0);
  const tick = sumNotional + s.wallet_minor + (userId.length << 8);
  const last = 50_000 + (Math.abs(tick) % 8000);
  const current = last + (Math.abs(tick) % 23) - 11;

  const stats: Record<string, ReturnType<typeof statsFromPositions>> = {};
  for (const p of PERIODS) {
    const details = getTradingDetailsForPeriod(userId, legacyPeriodToLedgerKey(p));
    stats[p] = statsFromPositions(details.positions);
  }
  return {
    currentPrice: current,
    lastPrice: last,
    pricePair: "USDT/BTC",
    stats
  };
}

export function isAllowedTradingPeriod(period: string) {
  return (PERIODS as readonly string[]).includes(period);
}

export { PERIODS };
