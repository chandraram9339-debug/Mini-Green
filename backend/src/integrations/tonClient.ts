import { Address } from "@ton/core";
import type { AppConfig } from "../config.js";

/** Normalizes any supported TON address form for comparisons. */
export function tonAddressesEqual(a: string, b: string): boolean {
  try {
    return Address.parse(a.trim()).equals(Address.parse(b.trim()));
  } catch {
    return false;
  }
}

export function assertParsableTonAddress(raw: string): string {
  return Address.parse(raw.trim()).toString({ urlSafe: true, bounceable: false });
}

function tonHeaders(c: AppConfig): Record<string, string> {
  const h: Record<string, string> = { accept: "application/json" };
  if (c.tonApiKey.trim()) h.Authorization = `Bearer ${c.tonApiKey.trim()}`;
  return h;
}

export async function tonApiGetJson(c: AppConfig, path: string): Promise<unknown> {
  const base = c.tonApiBaseUrl.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  const url = `${base}${p}`;
  const r = await fetch(url, { headers: tonHeaders(c) });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`TonAPI ${r.status} ${t.slice(0, 400)}`);
  }
  return r.json();
}

export type CentralTonBalances = {
  tonNano: bigint | null;
  tonHuman: number | null;
  /** USDT jetton from configured master, human (6 decimals on-chain → float). */
  usdtJettonHuman: number | null;
};

function parseBigIntLoose(v: unknown): bigint | null {
  if (v === undefined || v === null) return null;
  try {
    return BigInt(String(v));
  } catch {
    return null;
  }
}

/**
 * Reads native TON balance + USDT (jetton) balance for a treasury address via TonAPI v2.
 */
export async function fetchCentralTonWalletBalances(
  c: AppConfig,
  addressFriendly: string
): Promise<CentralTonBalances> {
  const acc = (await tonApiGetJson(c, `/v2/accounts/${encodeURIComponent(addressFriendly)}`)) as {
    balance?: unknown;
  };
  const nano = parseBigIntLoose(acc.balance);
  const tonHuman = nano == null ? null : Number(nano) / 1e9;

  let usdtJettonHuman: number | null = null;
  try {
    const jet = (await tonApiGetJson(
      c,
      `/v2/accounts/${encodeURIComponent(addressFriendly)}/jettons`
    )) as {
      balances?: Array<{ balance?: unknown; jetton?: { address?: string } }>;
    };
    const master = Address.parse(c.tonUsdtJettonMaster.trim());
    for (const row of jet.balances ?? []) {
      const ja = row.jetton?.address;
      if (!ja) continue;
      try {
        if (!Address.parse(ja).equals(master)) continue;
      } catch {
        continue;
      }
      const b = parseBigIntLoose(row.balance);
      if (b != null) usdtJettonHuman = Number(b) / 1e6;
      break;
    }
  } catch {
    /* jettons endpoint can fail for empty accounts — leave null */
  }

  return { tonNano: nano, tonHuman, usdtJettonHuman };
}

type JettonsListJson = {
  balances?: Array<{ jetton?: { address?: string }; wallet_address?: { address?: string } | string }>;
};

/**
 * Resolves the user's jetton **wallet contract** (where transfer opcode is sent) for a given jetton master.
 */
export async function findJettonWalletForOwner(
  c: AppConfig,
  ownerFriendly: string,
  jettonMasterFriendly: string
): Promise<string | null> {
  const j = (await tonApiGetJson(
    c,
    `/v2/accounts/${encodeURIComponent(ownerFriendly)}/jettons`
  )) as JettonsListJson;
  const master = Address.parse(jettonMasterFriendly.trim());
  for (const row of j.balances ?? []) {
    const ja = row.jetton?.address;
    if (!ja) continue;
    try {
      if (!Address.parse(ja).equals(master)) continue;
    } catch {
      continue;
    }
    const w = row.wallet_address;
    if (typeof w === "string" && w.trim()) return w.trim();
    if (w && typeof w === "object" && typeof (w as { address?: string }).address === "string") {
      return String((w as { address: string }).address).trim();
    }
  }
  return null;
}
