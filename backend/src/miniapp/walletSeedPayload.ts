import { config } from "../config.js";
import { getDb } from "../db/connection.js";
import { decryptUtf8 } from "../domain/walletCrypto.js";
import { getUserByTg } from "../repos/userRepo.js";

export type WalletSeedMode = "per_user" | "legacy" | "disabled" | "custodial_pk";

/** Почему сид на экране не показан (для i18n / поддержки). */
export type SeedUnavailableReason =
  | "user_missing"
  | "custodial_private_key"
  | "feature_off"
  | "legacy_no_mnemonic"
  | "key_missing_or_invalid"
  | "decrypt_failed";

export function buildWalletSeedPayload(tgUserId: string): {
  screen: "wallet-seed";
  mode: WalletSeedMode;
  words: string[];
  reason?: SeedUnavailableReason;
} {
  const db = getDb();
  const u = getUserByTg(db, tgUserId);
  if (!u) {
    return { screen: "wallet-seed", mode: "disabled", words: [], reason: "user_missing" };
  }

  const pkVault = u.deposit_private_key_encrypted?.trim();
  if (pkVault && pkVault.length > 0) {
    return { screen: "wallet-seed", mode: "custodial_pk", words: [], reason: "custodial_private_key" };
  }

  if (!config.walletSeedPerUser) {
    return { screen: "wallet-seed", mode: "disabled", words: [], reason: "feature_off" };
  }
  const enc = u.wallet_mnemonic_encrypted?.trim();
  const keyHex = config.userWalletEncryptionKeyHex.replace(/^0x/i, "").trim();
  if (!enc) {
    return { screen: "wallet-seed", mode: "legacy", words: [], reason: "legacy_no_mnemonic" };
  }
  if (keyHex.length !== 64) {
    return { screen: "wallet-seed", mode: "legacy", words: [], reason: "key_missing_or_invalid" };
  }
  try {
    const mnemonic = decryptUtf8(enc, keyHex);
    const words = mnemonic.trim().split(/\s+/).filter(Boolean);
    return { screen: "wallet-seed", mode: "per_user", words };
  } catch {
    return { screen: "wallet-seed", mode: "legacy", words: [], reason: "decrypt_failed" };
  }
}

/** Метаданные для GET /wallet (без слов мнемоники). */
export function buildWalletSeedMeta(tgUserId: string): {
  mode: WalletSeedMode;
  reason?: SeedUnavailableReason;
} {
  const p = buildWalletSeedPayload(tgUserId);
  return p.reason != null ? { mode: p.mode, reason: p.reason } : { mode: p.mode };
}
