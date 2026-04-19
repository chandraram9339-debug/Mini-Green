import { logEvent } from "../httpEnvelope.js";

export function stubGasToUser(gasBankRef: string, userTronAddress: string, trace: string) {
  logEvent(trace, "chain.stub.gaz_transfer", { to: userTronAddress, from: gasBankRef });
}

export function stubSweepToTopup(
  topupRef: string,
  _userTronAddress: string,
  grossMinor: number,
  trace: string
) {
  logEvent(trace, "chain.stub.sweep_to_topup", { to: topupRef, gross_minor: grossMinor });
}

export function stubWithdrawSend(
  withdrawWalletRef: string,
  toAddress: string,
  amountMinor: number,
  trace: string
) {
  logEvent(trace, "chain.stub.withdraw", { from: withdrawWalletRef, to: toAddress, amount_minor: amountMinor });
}
