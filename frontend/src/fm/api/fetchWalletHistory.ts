import { apiFetch } from "./http";
import { parseWalletHistoryPayload } from "./parseWalletHistory";
import type { WalletHistoryBundle } from "./typesHistory";

/**
 * История кошелька: депозиты, выводы, рефералки.
 * VITE_API_WALLET_HISTORY_PATH — по умолчанию `GET /wallet/history`.
 */
export async function fetchWalletHistory(): Promise<WalletHistoryBundle | null> {
  const path = import.meta.env.VITE_API_WALLET_HISTORY_PATH ?? "/wallet/history";
  const res = await apiFetch(path, { method: "GET" });
  if (!res.ok) return null;
  const json: unknown = await res.json();
  return parseWalletHistoryPayload(json);
}
