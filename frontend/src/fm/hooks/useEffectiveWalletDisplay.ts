import { useMemo } from "react";

import { computeDemoSimulatedBalanceUsdt } from "../figma/components/tradingChartPoints";
import { useWalletDisplay } from "../figma/useWalletDisplay";
import { useDemoStore } from "../stores/demoStore";

/**
 * Баланс и поля кошелька с учётом paper/demo режима.
 * Демо: виртуальный депозит × PnL системного зеркала (как «тестово-реальный» счёт без live-пополнения);
 * вывод недоступен (availableWithdrawUsdt = 0), рефералки не показываем как отдельный поток — 0.
 */
export function useEffectiveWalletDisplay() {
  const wallet = useWalletDisplay();
  const isDemoMode = useDemoStore((s) => s.isDemoMode);
  const demoTotalDepositedUsdt = useDemoStore((s) => s.demoTotalDepositedUsdt);
  const demoMirrorJournalRows = useDemoStore((s) => s.demoMirrorJournalRows);
  const demoPositiveBalanceStartedAt = useDemoStore((s) => s.demoPositiveBalanceStartedAt);

  const simulatedDemoBalance = useMemo(
    () =>
      computeDemoSimulatedBalanceUsdt(
        demoTotalDepositedUsdt,
        demoMirrorJournalRows,
        demoPositiveBalanceStartedAt,
      ),
    [demoTotalDepositedUsdt, demoMirrorJournalRows, demoPositiveBalanceStartedAt],
  );

  if (!isDemoMode) {
    return {
      ...wallet,
      isDemoMode: false as const,
    };
  }

  return {
    ...wallet,
    isDemoMode: true as const,
    balanceUsdt: simulatedDemoBalance,
    referralReceivedUsdt: 0,
    availableWithdrawUsdt: 0,
    cumulativeDepositsUsdt: demoTotalDepositedUsdt > 0 ? demoTotalDepositedUsdt : undefined,
    positiveBalanceStartedAt: demoTotalDepositedUsdt > 0 ? demoPositiveBalanceStartedAt : null,
  };
}

/** Только симулированный баланс демо (для AppSessionProvider и прочих мест без полного wallet). */
export function useDemoSimulatedBalanceUsdt(): number {
  const isDemoMode = useDemoStore((s) => s.isDemoMode);
  const demoTotalDepositedUsdt = useDemoStore((s) => s.demoTotalDepositedUsdt);
  const demoMirrorJournalRows = useDemoStore((s) => s.demoMirrorJournalRows);
  const demoPositiveBalanceStartedAt = useDemoStore((s) => s.demoPositiveBalanceStartedAt);

  return useMemo(() => {
    if (!isDemoMode) return 0;
    return computeDemoSimulatedBalanceUsdt(
      demoTotalDepositedUsdt,
      demoMirrorJournalRows,
      demoPositiveBalanceStartedAt,
    );
  }, [isDemoMode, demoTotalDepositedUsdt, demoMirrorJournalRows, demoPositiveBalanceStartedAt]);
}
