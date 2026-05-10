import { useWalletDisplay } from "../figma/useWalletDisplay";
import { useDemoStore } from "../stores/demoStore";

/**
 * Баланс и поля кошелька с учётом paper/demo режима.
 * В демо: вывод недоступен (availableWithdrawUsdt = 0), рефералки не показываем как отдельный поток — 0.
 */
export function useEffectiveWalletDisplay() {
  const wallet = useWalletDisplay();
  const isDemoMode = useDemoStore((s) => s.isDemoMode);
  const demoBalanceUsdt = useDemoStore((s) => s.demoBalanceUsdt);
  const demoPositiveBalanceStartedAt = useDemoStore((s) => s.demoPositiveBalanceStartedAt);

  if (!isDemoMode) {
    return {
      ...wallet,
      isDemoMode: false as const,
    };
  }

  const balanceUsdt = demoBalanceUsdt;
  return {
    ...wallet,
    isDemoMode: true as const,
    balanceUsdt,
    referralReceivedUsdt: 0,
    availableWithdrawUsdt: 0,
    cumulativeDepositsUsdt: demoBalanceUsdt > 0 ? demoBalanceUsdt : wallet.cumulativeDepositsUsdt,
    positiveBalanceStartedAt: demoBalanceUsdt > 0 ? demoPositiveBalanceStartedAt : null,
  };
}
