import { useWalletDisplay } from "../useWalletDisplay";
import type { WithdrawBalanceSnapshot } from "./withdrawDraft";

/** Единые цифры для экранов вывода: QA URL → API wallet → моки. */
export function useWithdrawBalanceSnapshot(): WithdrawBalanceSnapshot {
  const {
    balanceUsdt,
    availableWithdrawUsdt,
    minWithdrawUsdt,
    withdrawFeeBps,
    withdrawFeeFixedUsdt,
  } = useWalletDisplay();
  return { balanceUsdt, availableWithdrawUsdt, minWithdrawUsdt, withdrawFeeBps, withdrawFeeFixedUsdt };
}
