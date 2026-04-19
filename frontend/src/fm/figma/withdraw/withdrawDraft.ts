import { getEffectiveAvailableWithdrawUsdt, getEffectiveBalanceUsdt } from "../mockBalances";

export const WITHDRAW_FEE_RATE = 0.1;
export const WITHDRAW_MIN_USDT = 5;

const STORAGE_KEY = "fm_withdraw_draft_v1";

export type WithdrawDraft = {
  address: string;
  amountUsdt: number;
};

export function readWithdrawDraft(): WithdrawDraft | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<WithdrawDraft>;
    if (typeof v.address !== "string" || typeof v.amountUsdt !== "number") return null;
    return { address: v.address, amountUsdt: v.amountUsdt };
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

export function commissionUsdt(amount: number): number {
  return Math.round(amount * WITHDRAW_FEE_RATE * 100) / 100;
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
};

/** Сумма + комиссия не превышают доступный вывод и баланс. */
export function validateWithdrawAmount(amount: number, snapshot?: WithdrawBalanceSnapshot): string | null {
  if (!Number.isFinite(amount) || amount <= 0) return "Enter a valid amount.";
  if (amount < WITHDRAW_MIN_USDT) return `Minimum withdrawal is ${WITHDRAW_MIN_USDT} USDT.`;
  const fee = commissionUsdt(amount);
  const bal = snapshot?.balanceUsdt ?? getEffectiveBalanceUsdt();
  const avail = snapshot?.availableWithdrawUsdt ?? getEffectiveAvailableWithdrawUsdt();
  if (amount + fee > bal) return "Amount and fee exceed your balance.";
  if (amount > avail) return "Amount exceeds available for withdrawal.";
  return null;
}
