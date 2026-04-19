/** Заглушка без API: вернёт false если `VITE_DEPOSIT_PAID_FAIL=true`. */
export async function verifyDepositPaidMock(): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 500));
  return import.meta.env.VITE_DEPOSIT_PAID_FAIL !== "true";
}
