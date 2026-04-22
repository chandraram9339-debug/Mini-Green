import { apiFetch } from "./http";

export type WalletSeedMode = "per_user" | "legacy" | "disabled" | "custodial_pk";

export type WalletSeedPayload = {
  screen: "wallet-seed";
  mode: WalletSeedMode;
  words: string[];
};

/** GET /wallet/seed — возвращает мнемонику пользователя. */
export async function fetchWalletSeed(): Promise<WalletSeedPayload | null> {
  try {
    const res = await apiFetch("/wallet/seed");
    if (!res.ok) return null;
    const json = (await res.json()) as unknown;
    if (!json || typeof json !== "object") return null;
    const root = json as Record<string, unknown>;
    if (root.screen !== "wallet-seed") return null;
    return {
      screen: "wallet-seed",
      mode: (root.mode as WalletSeedMode) ?? "disabled",
      words: Array.isArray(root.words)
        ? (root.words as unknown[]).filter((w): w is string => typeof w === "string")
        : [],
    };
  } catch {
    return null;
  }
}
