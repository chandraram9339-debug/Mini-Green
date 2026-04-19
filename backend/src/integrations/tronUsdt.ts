import { usdt6ToMinor } from "../domain/amounts.js";
import type { AppConfig } from "../config.js";
import type { Database } from "better-sqlite3";
import type { UserRow } from "../repos/userRepo.js";
import { setLastChainBalance } from "../repos/userRepo.js";

/**
 * TRC20 USDT balance (6 dec on-chain) → app minor(2 dec).
 */
export async function getTrc20UsdtBalanceReadonly(
  c: AppConfig,
  tronBase58: string
): Promise<number> {
  const url = `${c.tronFullHost.replace(/\/$/, "")}/v1/accounts/${tronBase58}/tokens?only_trc20=true&limit=200`;
  const h: Record<string, string> = { accept: "application/json" };
  if (c.tronApiKey) h["TRON-PRO-API-KEY"] = c.tronApiKey;
  const r = await fetch(url, { headers: h });
  if (!r.ok) return 0;
  const j = (await r.json()) as { data?: { tokenId?: string; token_id?: string; balance?: string; token_address?: string }[] };
  const usdt = c.usdtTrc20;
  for (const row of j.data ?? []) {
    const id = row.tokenId ?? row.token_id ?? row.token_address;
    if (id && id.toLowerCase() === usdt.toLowerCase()) {
      return usdt6ToMinor(BigInt(String(row.balance ?? 0)));
    }
  }
  return 0;
}

/**
 * Compare current TRC20 balance with last stored snapshot. Does **not** update DB; caller does after a successful credit.
 */
export async function readChainGrossDelta(
  c: AppConfig,
  u: UserRow,
  _db: Database
): Promise<{ grossDeltaMinor: number; currentSnapshot: number }> {
  if (!u.deposit_tron_address) {
    return { grossDeltaMinor: 0, currentSnapshot: 0 };
  }
  const cur = await getTrc20UsdtBalanceReadonly(c, u.deposit_tron_address);
  const last = u.last_chain_usdt_balance_minor ?? 0;
  const d = Math.max(0, cur - last);
  return { grossDeltaMinor: d, currentSnapshot: cur };
}

export function updateChainSnapshot(db: Database, userId: number, currentSnapshot: number) {
  setLastChainBalance(db, userId, currentSnapshot);
}
