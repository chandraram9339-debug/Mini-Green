import { getEffectiveAvailableWithdrawUsdt, getEffectiveBalanceUsdt } from "../mockBalances";

export const WITHDRAW_FEE_RATE = 0.1;
export const WITHDRAW_MIN_USDT = 5;

const STORAGE_KEY = "fm_withdraw_draft_v1";
const DONE_STORAGE_KEY = "fm_withdraw_done_v1";

export type WithdrawDraft = {
  address: string;
  amountUsdt: number;
  requestKey?: string;
};

export type WithdrawDonePayload = {
  address: string;
  amountUsdt: number;
  feeUsdt: number;
};

export function readWithdrawDraft(): WithdrawDraft | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<WithdrawDraft>;
    if (typeof v.address !== "string" || typeof v.amountUsdt !== "number") return null;
    return {
      address: v.address,
      amountUsdt: v.amountUsdt,
      requestKey: typeof v.requestKey === "string" ? v.requestKey : undefined,
    };
  } catch {
    return null;
  }
}

export function writeWithdrawDraft(d: WithdrawDraft): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

export function clearWithdrawDraft(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function readWithdrawDonePayload(): WithdrawDonePayload | null {
  try {
    const raw = sessionStorage.getItem(DONE_STORAGE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<WithdrawDonePayload>;
    if (
      typeof v.address !== "string" ||
      typeof v.amountUsdt !== "number" ||
      typeof v.feeUsdt !== "number"
    ) {
      return null;
    }
    return { address: v.address, amountUsdt: v.amountUsdt, feeUsdt: v.feeUsdt };
  } catch {
    return null;
  }
}

export function writeWithdrawDonePayload(v: WithdrawDonePayload): void {
  sessionStorage.setItem(DONE_STORAGE_KEY, JSON.stringify(v));
}

export function clearWithdrawDonePayload(): void {
  sessionStorage.removeItem(DONE_STORAGE_KEY);
}

export function formatShortAddress(addr: string, head = 4, tail = 4): string {
  const s = addr.trim();
  if (s.length <= head + tail + 3) return s;
  return `${s.slice(0, head)}...${s.slice(-tail)}`;
}

/** Снимок баланса для валидации (из API / моков); без аргумента — прежнее поведение. */
export type WithdrawBalanceSnapshot = {
  balanceUsdt: number;
  availableWithdrawUsdt: number;
  withdrawFeeBps?: number;
  withdrawFeeFixedUsdt?: number;
};

function resolveWithdrawFeeRate(snapshot?: WithdrawBalanceSnapshot): number {
  const bps = snapshot?.withdrawFeeBps;
  if (typeof bps === "number" && Number.isFinite(bps) && bps >= 0) return bps / 10_000;
  return WITHDRAW_FEE_RATE;
}

function resolveWithdrawFeeFixed(snapshot?: WithdrawBalanceSnapshot): number {
  const fixed = snapshot?.withdrawFeeFixedUsdt;
  if (typeof fixed === "number" && Number.isFinite(fixed) && fixed >= 0) return fixed;
  return 0;
}

function humanUsdtToMinor(amount: number): number {
  return Math.max(0, Math.round(amount * 100));
}

function minorToHumanUsdt(minor: number): number {
  return Math.round((minor / 100) * 100) / 100;
}

export function commissionUsdt(amount: number, snapshot?: WithdrawBalanceSnapshot): number {
  const grossMinor = humanUsdtToMinor(amount);
  const fixedMinor = humanUsdtToMinor(resolveWithdrawFeeFixed(snapshot));
  const partMinor = Math.ceil(grossMinor * resolveWithdrawFeeRate(snapshot));
  return minorToHumanUsdt(Math.min(grossMinor, fixedMinor + partMinor));
}

function formatPercent(rate: number): string {
  const pct = Math.round(rate * 100 * 100) / 100;
  return Number.isInteger(pct) ? `${pct.toFixed(0)}%` : `${pct.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}%`;
}

export function formatWithdrawFeeFootnote(snapshot?: WithdrawBalanceSnapshot): string {
  const fixed = resolveWithdrawFeeFixed(snapshot);
  const rate = resolveWithdrawFeeRate(snapshot);
  const hasFixed = fixed > 0;
  const hasRate = rate > 0;
  if (hasFixed && hasRate) {
    return `*The commission is charged from the remaining balance. We charge a ${fixed.toFixed(2)} USDT + ${formatPercent(rate)} fee on withdrawals.`;
  }
  if (hasFixed) {
    return `*The commission is charged from the remaining balance. We charge a fixed ${fixed.toFixed(2)} USDT fee on withdrawals.`;
  }
  if (hasRate) {
    return `*The commission is charged from the remaining balance. We charge a ${formatPercent(rate)} fee on withdrawals.`;
  }
  return "*No withdrawal fee is charged.";
}

/** Сумма + комиссия не превышают доступный вывод и баланс. */
export function validateWithdrawAmount(amount: number, snapshot?: WithdrawBalanceSnapshot): string | null {
  if (!Number.isFinite(amount) || amount <= 0) return "Enter a valid amount.";
  if (amount < WITHDRAW_MIN_USDT) return `Minimum withdrawal is ${WITHDRAW_MIN_USDT} USDT.`;
  const fee = commissionUsdt(amount, snapshot);
  const bal = snapshot?.balanceUsdt ?? getEffectiveBalanceUsdt();
  const avail = snapshot?.availableWithdrawUsdt ?? getEffectiveAvailableWithdrawUsdt();
  if (amount + fee > bal) return "Amount and fee exceed your balance.";
  if (amount > avail) return "Amount exceeds available for withdrawal.";
  return null;
}
