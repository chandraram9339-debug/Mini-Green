import type { WalletSnapshot } from "./types";

export function mergeWalletSnapshots(a?: WalletSnapshot, b?: WalletSnapshot): WalletSnapshot | undefined {
  if (!a && !b) return undefined;
  return {
    balanceUsdt: Math.max(0, b?.balanceUsdt ?? a?.balanceUsdt ?? 0),
    referralReceivedUsdt: Math.max(0, b?.referralReceivedUsdt ?? a?.referralReceivedUsdt ?? 0),
    depositAddress: b?.depositAddress ?? a?.depositAddress,
    availableWithdrawUsdt: b?.availableWithdrawUsdt ?? a?.availableWithdrawUsdt,
  };
}
