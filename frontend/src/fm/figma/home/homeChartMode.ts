import { getEffectiveBalanceUsdt } from "../mockBalances";

export type HomeChartMode = "journal" | "balance";

/**
 * ТЗ: баланс 0 → доходность бота (журнал, 3M); баланс > 0 → график баланса.
 * Передай `balanceForChart` с Home (с учётом API), иначе — только мок/QA из storage.
 */
export function getHomeChartMode(balanceForChart?: number): HomeChartMode {
  const forced = import.meta.env.VITE_FORCE_HOME_CHART_MODE?.trim();
  if (forced === "journal" || forced === "balance") return forced;
  const b = balanceForChart !== undefined ? balanceForChart : getEffectiveBalanceUsdt();
  return b > 0 ? "balance" : "journal";
}
