export function usdFromMinor(m: number | undefined | null) {
  if (m == null || Number.isNaN(m)) return "—";
  return (Number(m) / 100).toFixed(2);
}

/** USDT human → minor (100 minor = 1 USDT). */
export function usdToMinor(usd: number): number {
  return Math.round(Number(usd) * 100);
}

export function fmtIso(s: string | undefined) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString();
  } catch {
    return s;
  }
}

const WITHDRAWAL_STATUS_RU: Record<string, string> = {
  pending_approval: "Ожидают решения",
  approved: "Одобрено",
  sent: "Отправлено",
  rejected: "Отклонено"
};

export function withdrawalStatusRu(code: string): string {
  return WITHDRAWAL_STATUS_RU[code] ?? code;
}

const DEPOSIT_STATUS_RU: Record<string, string> = {
  completed: "Завершён",
  awaiting_paid: "Ожидает оплаты"
};

export function depositStatusRu(code: string): string {
  return DEPOSIT_STATUS_RU[code] ?? code;
}
