import { DEPOSIT_WALLET_ADDRESS } from "../config/deposit";
import { hasApiBase } from "../api/env";
import { useAppSession } from "../session/useAppSession";
import { pickDisplayAvailableWithdrawUsdt, pickDisplayBalanceUsdt, pickDisplayReferralUsdt } from "./mockBalances";

/** Баланс / реферал / «доступно к выводу» / адрес пополнения: API + QA-URL → мок. */
export function useWalletDisplay() {
  const { wallet, phase, mode } = useAppSession();
  /** Не подставлять цифры из Figma, если API настроен, а кошелёк не пришёл (ошибка auth / bootstrap). */
  const liveWithoutWallet =
    hasApiBase() &&
    mode === "live" &&
    (phase === "error" || phase === "bootstrapping" || (phase === "ready" && wallet == null));

  const balanceUsdt = liveWithoutWallet ? 0 : pickDisplayBalanceUsdt(wallet?.balanceUsdt);
  const referralReceivedUsdt = liveWithoutWallet ? 0 : pickDisplayReferralUsdt(wallet?.referralReceivedUsdt);
  const availableWithdrawUsdt = liveWithoutWallet
    ? 0
    : pickDisplayAvailableWithdrawUsdt(balanceUsdt, wallet?.availableWithdrawUsdt);
  const depositAddress = (wallet?.depositAddress?.trim() && wallet.depositAddress) || DEPOSIT_WALLET_ADDRESS;
  return {
    balanceUsdt,
    referralReceivedUsdt,
    availableWithdrawUsdt,
    depositAddress,
    minDepositUsdt: wallet?.minDepositUsdt,
    depositFeeBps: wallet?.depositFeeBps,
    depositFeeFixedUsdt: wallet?.depositFeeFixedUsdt,
    minWithdrawUsdt: wallet?.minWithdrawUsdt,
    withdrawFeeBps: wallet?.withdrawFeeBps,
    withdrawFeeFixedUsdt: wallet?.withdrawFeeFixedUsdt,
    positiveBalanceStartedAt: wallet?.positiveBalanceStartedAt ?? null,
    cumulativeDepositsUsdt: wallet?.cumulativeDepositsUsdt,
  };
}
