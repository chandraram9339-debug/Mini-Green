import { apiUrl, setStoredAccessToken } from "./http";
import { parseWalletPayload } from "./parseWallet";
import type { WalletSnapshot } from "./types";

export type AuthTelegramResult = {
  accessToken: string;
  wallet?: WalletSnapshot;
};

function pickToken(json: Record<string, unknown>): string | undefined {
  const t = json.accessToken ?? json.access_token ?? json.token;
  return typeof t === "string" && t.length > 0 ? t : undefined;
}

/**
 * POST сырого initData на бэкенд. Путь задаётся VITE_API_AUTH_PATH (по умолчанию /auth/telegram).
 * Ожидаем JSON: { accessToken, wallet? } или { access_token, user: { wallet } } — см. разбор ниже.
 */
export async function authTelegramWithInitData(initData: string): Promise<AuthTelegramResult> {
  const path = import.meta.env.VITE_API_AUTH_PATH ?? "/auth/telegram";
  const res = await fetch(apiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Auth failed: ${res.status}`);
  }

  const json = (await res.json()) as unknown;
  if (!json || typeof json !== "object") throw new Error("Invalid auth JSON");

  const root = json as Record<string, unknown>;
  const token = pickToken(root);
  if (!token) throw new Error("Auth response missing accessToken");

  setStoredAccessToken(token);

  let wallet = parseWalletPayload(root.wallet ?? root.data);
  if (!wallet) wallet = parseWalletPayload(root);

  const userObj = root.user;
  if (userObj && typeof userObj === "object") {
    const w = parseWalletPayload((userObj as Record<string, unknown>).wallet ?? userObj);
    if (w) wallet = { ...w, ...wallet };
  }

  return { accessToken: token, wallet };
}
