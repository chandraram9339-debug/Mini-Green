import { DEPOSIT_WALLET_ADDRESS } from "../config/deposit";
import { useAppSession } from "../session/useAppSession";
import { pickDisplayAvailableWithdrawUsdt, pickDisplayBalanceUsdt, pickDisplayReferralUsdt } from "./mockBalances";

/** Баланс / реферал / «доступно к выводу» / адрес пополнения: API + QA-URL → мок. */
export function useWalletDisplay() {
  const { wallet } = useAppSession();
  const balanceUsdt = pickDisplayBalanceUsdt(wallet?.balanceUsdt);
  const referralReceivedUsdt = pickDisplayReferralUsdt(wallet?.referralReceivedUsdt);
  const availableWithdrawUsdt = pickDisplayAvailableWithdrawUsdt(balanceUsdt, wallet?.availableWithdrawUsdt);
  const depositAddress = (wallet?.depositAddress?.trim() && wallet.depositAddress) || DEPOSIT_WALLET_ADDRESS;
  return {
    balanceUsdt,
    referralReceivedUsdt,
    availableWithdrawUsdt,
    depositAddress,
    withdrawFeeBps: wallet?.withdrawFeeBps,
    withdrawFeeFixedUsdt: wallet?.withdrawFeeFixedUsdt,
    positiveBalanceStartedAt: wallet?.positiveBalanceStartedAt ?? null,
  };
}
