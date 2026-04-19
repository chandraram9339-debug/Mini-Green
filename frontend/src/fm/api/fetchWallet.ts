import { apiFetch } from "./http";
import { parseWalletPayload } from "./parseWallet";
import type { WalletSnapshot } from "./types";

/** GET кошелька после сессии. Путь: VITE_API_WALLET_PATH (по умолчанию /wallet). */
export async function fetchWalletSnapshot(): Promise<WalletSnapshot | undefined> {
  const path = import.meta.env.VITE_API_WALLET_PATH ?? "/wallet";
  const res = await apiFetch(path, { method: "GET" });
  if (!res.ok) return undefined;
  const json = (await res.json()) as unknown;
  return parseWalletPayload(json);
}
