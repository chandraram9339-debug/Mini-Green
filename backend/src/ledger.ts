/**
 * Public balance/history (SQLite). Open positions: `trade_positions` (Admin API); UI reads via ledger snapshots.
 */
export {
  getAccountSnapshot,
  getMoneyOperations,
  getReferralReceivedMinor,
  getMoneySummaryStats,
  getTradingDetailsForPeriod,
  getDashboardChartPoints,
  parseTradingPeriod,
  TRADING_PERIOD_KEYS
} from "./ledgerView.js";
export type {
  MoneySummaryStats,
  TradingPeriodKey,
  TradingPositionTimed,
  DashboardChartPoint
} from "./ledgerView.js";
export type { MoneyOperationRecord, MoneyOperationKind, MoneyOperationStatus } from "./ledgerTypes.js";
export type { ActionRecord, ActionKind, ActionStatus } from "./ledgerTypes.js";

/** @deprecated no longer used; empty map for any stale import. */
import type { ActionRecord } from "./ledgerTypes.js";
export const actionStore = new Map<string, ActionRecord>();
export function persistActionStore() {
  /* no-op */
}
