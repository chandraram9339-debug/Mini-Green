import { useWalletDisplay } from "../useWalletDisplay";
import type { WithdrawBalanceSnapshot } from "./withdrawDraft";

/** Единые цифры для экранов вывода: QA URL → API wallet → моки. */
export function useWithdrawBalanceSnapshot(): WithdrawBalanceSnapshot {
  const { balanceUsdt, availableWithdrawUsdt, withdrawFeeBps, withdrawFeeFixedUsdt } = useWalletDisplay();
  return { balanceUsdt, availableWithdrawUsdt, withdrawFeeBps, withdrawFeeFixedUsdt };
}
