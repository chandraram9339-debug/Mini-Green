/** Заглушка до API: один источник для проверок вывода и логики Trading Details. */
export const MOCK_CURRENT_BALANCE_USDT = 725.62;

/** Лимит «доступно к выводу» как в макете (учёт резервов/комиссий). */
export const MOCK_AVAILABLE_WITHDRAW_USDT = 653.06;

/** Строка «Received by referrals» на Home. */
export const MOCK_REFERRAL_RECEIVED_USDT = 425.22;

const STORAGE_BALANCE = "fm_mock_balance_usdt";
const STORAGE_AVAILABLE = "fm_mock_available_usdt";

/**
 * Применить один раз при старте: `?fm_balance=0` / `?fm_available=100` / `?fm_clear_mock=1`
 * Сохраняет в sessionStorage и убирает параметры из URL.
 */
export function applyBalanceQueryFromUrl(): void {
  if (typeof window === "undefined") return;
  try {
    const qs = new URLSearchParams(window.location.search);
    if (!qs.has("fm_balance") && !qs.has("fm_available") && !qs.has("fm_clear_mock")) return;

    if (qs.get("fm_clear_mock") === "1") {
      sessionStorage.removeItem(STORAGE_BALANCE);
      sessionStorage.removeItem(STORAGE_AVAILABLE);
    }

    const b = qs.get("fm_balance");
    if (b !== null) {
      const n = Number.parseFloat(b.replace(",", "."));
      if (Number.isFinite(n)) sessionStorage.setItem(STORAGE_BALANCE, String(n));
    }

    const a = qs.get("fm_available");
    if (a !== null) {
      const n = Number.parseFloat(a.replace(",", "."));
      if (Number.isFinite(n)) sessionStorage.setItem(STORAGE_AVAILABLE, String(n));
    }

    qs.delete("fm_balance");
    qs.delete("fm_available");
    qs.delete("fm_clear_mock");

    const rest = qs.toString();
    const next = `${window.location.pathname}${rest ? `?${rest}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", next);
  } catch {
    /* ignore storage / history */
  }
}

/** При живом API: QA-override из URL/sessionStorage побеждает, иначе баланс с сервера. */
export function pickDisplayBalanceUsdt(apiBalance?: number): number {
  try {
    const raw = sessionStorage.getItem(STORAGE_BALANCE);
    if (raw !== null) {
      const n = Number.parseFloat(raw);
      if (Number.isFinite(n)) return Math.max(0, n);
    }
  } catch {
    /* ignore */
  }
  if (apiBalance !== undefined && Number.isFinite(apiBalance)) return Math.max(0, apiBalance);
  return MOCK_CURRENT_BALANCE_USDT;
}

/** Учитывает sessionStorage после `applyBalanceQueryFromUrl` (без значения API). */
export function getEffectiveBalanceUsdt(): number {
  return pickDisplayBalanceUsdt(undefined);
}

/**
 * Явный override или пропорция от баланса (при балансе 0 → 0).
 */
export function getEffectiveAvailableWithdrawUsdt(): number {
  try {
    const raw = sessionStorage.getItem(STORAGE_AVAILABLE);
    if (raw !== null) {
      const n = Number.parseFloat(raw);
      if (Number.isFinite(n)) return Math.max(0, n);
    }
  } catch {
    /* ignore */
  }
  const bal = getEffectiveBalanceUsdt();
  if (bal <= 0) return 0;
  const ratio = MOCK_AVAILABLE_WITHDRAW_USDT / MOCK_CURRENT_BALANCE_USDT;
  return Math.round(bal * ratio * 100) / 100;
}

/** Рефералы на главной: API приоритетнее мока. */
export function pickDisplayReferralUsdt(apiReferral?: number): number {
  if (apiReferral !== undefined && Number.isFinite(apiReferral)) return Math.max(0, apiReferral);
  return MOCK_REFERRAL_RECEIVED_USDT;
}

/** Доступно к выводу: QA storage → API → доля от переданного баланса. */
export function pickDisplayAvailableWithdrawUsdt(balance: number, apiAvailable?: number): number {
  try {
    const raw = sessionStorage.getItem(STORAGE_AVAILABLE);
    if (raw !== null) {
      const n = Number.parseFloat(raw);
      if (Number.isFinite(n)) return Math.max(0, n);
    }
  } catch {
    /* ignore */
  }
  if (apiAvailable !== undefined && Number.isFinite(apiAvailable)) return Math.max(0, apiAvailable);
  const bal = balance;
  if (bal <= 0) return 0;
  const ratio = MOCK_AVAILABLE_WITHDRAW_USDT / MOCK_CURRENT_BALANCE_USDT;
  return Math.round(bal * ratio * 100) / 100;
}
