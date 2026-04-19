/** 1 USDT = 100 “minor” (0.01 precision), aligned with existing mini-app. */

export function usdtHumanToMinor(h: number) {
  return Math.max(0, Math.round(h * 100));
}

export function usdtMinorToHuman(minor: number) {
  return Math.round((minor / 100) * 1e4) / 1e4;
}

/** TRC20 USDT has 6 on-chain decimals */
export function usdt6ToMinor(amt6: bigint) {
  return Math.round((Number(amt6) * 100) / 1_000_000);
}

/** Deposit/withdraw total fee: fixed(USDT) * 100 + bps of gross in minor. */
export function applyFee2Part(grossMinor: number, fixedUsdt: number, bps: number) {
  const fixedM = usdtHumanToMinor(fixedUsdt);
  const part = Math.ceil((grossMinor * bps) / 10000);
  const total = Math.min(fixedM + part, grossMinor);
  return total;
}

export const MINOR_PER_USDT = 100;
