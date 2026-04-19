import { apiFetch } from "./http";
import { parseWalletPayload } from "./parseWallet";

/**
 * После нажатия Paid: триггер проверки депозита на стороне TronGrid/API.
 * VITE_API_DEPOSIT_CONFIRM_PATH по умолчанию POST /wallet/deposit/confirm (пустое тело).
 */
export async function confirmDepositPaidRequest(): Promise<{ ok: boolean; walletUpdated?: ReturnType<typeof parseWalletPayload> }> {
  const path = import.meta.env.VITE_API_DEPOSIT_CONFIRM_PATH ?? "/wallet/deposit/confirm";
  const res = await apiFetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  if (!res.ok) return { ok: false };

  if (res.status === 204) return { ok: true };

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return { ok: true };
  }
  if (json && typeof json === "object" && "ok" in json && (json as { ok: unknown }).ok === false) {
    return { ok: false, walletUpdated: parseWalletPayload(json) };
  }

  const walletUpdated = parseWalletPayload(json);
  return { ok: true, walletUpdated };
}
