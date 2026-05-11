/** Numeric Telegram id for on-chain memo (TON comment). */
export function readTgUserIdForMemo(): string {
  const u = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const raw = u?.id as unknown;
  if (typeof raw === "number" && Number.isFinite(raw)) return String(Math.trunc(raw));
  if (typeof raw === "string" && /^\d+$/.test(raw.trim())) return raw.trim();
  const dev = import.meta.env.VITE_DEV_TON_DEPOSIT_COMMENT;
  const ds = typeof dev === "string" ? dev.trim() : "";
  if (ds && /^\d+$/.test(ds)) return ds;
  return "0";
}
