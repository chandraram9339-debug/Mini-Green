import { utils } from "tronweb";
import type { AppConfig } from "../config.js";

function parseProviderBody(j: unknown): { addressBase58: string; privateKeyHex: string } {
  const o = j && typeof j === "object" ? (j as Record<string, unknown>) : {};
  const nested =
    o.data && typeof o.data === "object" ? (o.data as Record<string, unknown>) : undefined;
  const addr = nested?.address ?? o.address ?? nested?.base58 ?? o.base58;
  let pkRaw = nested?.privateKey ?? nested?.private_key ?? o.privateKey ?? o.private_key;
  const addressBase58 = String(addr ?? "").trim();
  let privateKeyHex = String(pkRaw ?? "")
    .replace(/^0x/i, "")
    .trim()
    .toLowerCase();
  if (!/^([0-9a-f]{64})$/.test(privateKeyHex)) {
    throw new Error("wallet_create_provider: invalid or missing privateKey (expect 64 hex chars)");
  }
  if (!addressBase58.length) {
    throw new Error("wallet_create_provider: invalid or missing address");
  }
  return { addressBase58, privateKeyHex };
}

/**
 * Провайдер депозитного TRON-кошелька на пользователя.
 *
 * Официальный **TronGrid не создаёт кошельки** и не возвращает privateKey — это узел RPC.
 * Если у вас свой микросервис поверх TronGrid или другая интеграция, задайте
 * `TRON_DEPOSIT_WALLET_CREATE_URL`: POST JSON `{ tg_user_id }` (Telegram user id строкой).
 * Ответ: `{ address, privateKey }` — 64 hex без 0x (или те же поля внутри `data`).
 *
 * Если URL не задан — ключ и адрес генерируются локально через `tronweb.utils.accounts.generateAccount()`
 * (случайный кошелёк; `tg_user_id` игнорируется).
 */
export async function provisionTronDepositWallet(
  c: AppConfig,
  tgUserId: string
): Promise<{ addressBase58: string; privateKeyHex: string }> {
  const tg = String(tgUserId ?? "").trim();
  const url = c.tronDepositWalletCreateUrl.trim();
  if (url.length && !tg) {
    throw new Error("wallet_create_provider: tg_user_id required for external TRON_DEPOSIT_WALLET_CREATE_URL");
  }
  if (!url.length) {
    const acc = utils.accounts.generateAccount();
    return {
      addressBase58: acc.address.base58,
      privateKeyHex: String(acc.privateKey).replace(/^0x/i, "").trim().toLowerCase()
    };
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json"
  };
  const auth = c.tronDepositWalletCreateAuth.trim();
  if (auth.length > 0) {
    headers.Authorization = auth.startsWith("Bearer ") ? auth : `Bearer ${auth}`;
  }

  const ctrl = AbortSignal.timeout(Math.max(1000, Math.min(c.tronDepositWalletCreateTimeoutMs, 120_000)));
  const r = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ tg_user_id: tgUserId }),
    signal: ctrl
  });

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`wallet_create_provider HTTP ${r.status}: ${t.slice(0, 200)}`);
  }
  const json: unknown = await r.json().catch(() => null);
  return parseProviderBody(json);
}
