import { getAccountSnapshot } from "../ledger.js";
import { getDb } from "../db/connection.js";
import { config } from "../config.js";
import { getUserByTg } from "../repos/userRepo.js";
import { emptyDealStatsPayload, tradingStatsForAllFigmaPeriods } from "./tradingPeriodStats.js";
import { fetchAlLiveTradingPrice, hasAlStateHttpConfig } from "../services/alStatePrice.js";
import { getCurrentPositiveBalanceStartedAtMs } from "./positiveBalanceWindow.js";

const PERIODS = ["24h", "3d", "7d", "1m"] as const;

/**
 * Shapes a payload compatible with `parseBotTrading` in the Figma app.
 * Period stats: события из зеркала торговой системы (`trade_positions` + SIB) за окно вкладки.
 */
export async function buildTradingSummaryForUser(userId: string) {
  const s = getAccountSnapshot(userId);
  const sumNotional = s.positions.reduce((acc, p) => acc + p.size_minor, 0);
  const tick = sumNotional + s.wallet_minor + (userId.length << 8);
  const last = 50_000 + (Math.abs(tick) % 8000);
  const current = last + (Math.abs(tick) % 23) - 11;

  const db = getDb();
  const u = getUserByTg(db, userId);
  const positiveBalanceStartedAtMs = u
    ? getCurrentPositiveBalanceStartedAtMs(db, u.id)
    : null;
  const stats = u
    ? tradingStatsForAllFigmaPeriods(db, u.id, Date.now(), positiveBalanceStartedAtMs)
    : Object.fromEntries(PERIODS.map((p) => [p, emptyDealStatsPayload()]));
  const livePrice = await fetchAlLiveTradingPrice(config);
  const liveMode = hasAlStateHttpConfig(config);

  return {
    currentPrice: livePrice?.currentPrice ?? (liveMode ? undefined : current),
    lastPrice: liveMode ? undefined : last,
    pricePair: livePrice?.pricePair ?? (liveMode ? "—" : "USDT/BTC"),
    stats
  };
}

export function isAllowedTradingPeriod(period: string) {
  return (PERIODS as readonly string[]).includes(period);
}

export { PERIODS };
