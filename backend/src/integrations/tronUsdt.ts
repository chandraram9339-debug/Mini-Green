import { usdt6ToMinor } from "../domain/amounts.js";
import type { AppConfig } from "../config.js";
import type { Database } from "better-sqlite3";
import type { UserRow } from "../repos/userRepo.js";
import { setLastChainBalance } from "../repos/userRepo.js";

type TronTokenBalanceRow = {
  tokenId?: string;
  token_id?: string;
  token_address?: string;
  balance?: string | number;
};

function readUsdtBalanceFromRows(
  rows: TronTokenBalanceRow[] | undefined,
  usdtContract: string
): number | null {
  for (const row of rows ?? []) {
    const id = row.tokenId ?? row.token_id ?? row.token_address;
    if (id && id.toLowerCase() === usdtContract.toLowerCase()) {
      return usdt6ToMinor(BigInt(String(row.balance ?? 0)));
    }
  }
  return null;
}

async function getTronScanUsdtBalanceReadonly(c: AppConfig, tronBase58: string): Promise<number | null> {
  const url = `https://apilist.tronscanapi.com/api/account?address=${encodeURIComponent(tronBase58)}`;
  const r = await fetch(url, { headers: { accept: "application/json" } });
  if (!r.ok) return null;
  const j = (await r.json()) as {
    trc20token_balances?: TronTokenBalanceRow[];
    tokens?: TronTokenBalanceRow[];
  };
  return (
    readUsdtBalanceFromRows(j.trc20token_balances, c.usdtTrc20) ??
    readUsdtBalanceFromRows(j.tokens, c.usdtTrc20) ??
    0
  );
}

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
  try {
    const r = await fetch(url, { headers: h });
    if (r.ok) {
      const j = (await r.json()) as { data?: TronTokenBalanceRow[] };
      const tronGridBalance = readUsdtBalanceFromRows(j.data, c.usdtTrc20) ?? 0;
      if (tronGridBalance > 0) return tronGridBalance;
    }
  } catch {
    /* fall through to TronScan fallback */
  }
  return (await getTronScanUsdtBalanceReadonly(c, tronBase58)) ?? 0;
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
