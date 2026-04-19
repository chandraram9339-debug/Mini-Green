import { config } from "../config.js";
import { getDb } from "../db/connection.js";
import { decryptUtf8 } from "../domain/walletCrypto.js";
import { getUserByTg } from "../repos/userRepo.js";

export type WalletSeedMode = "per_user" | "legacy" | "disabled" | "custodial_pk";

export function buildWalletSeedPayload(tgUserId: string): {
  screen: "wallet-seed";
  mode: WalletSeedMode;
  words: string[];
} {
  const db = getDb();
  const u = getUserByTg(db, tgUserId);
  if (!u) {
    return { screen: "wallet-seed", mode: "disabled", words: [] };
  }

  const pkVault = u.deposit_private_key_encrypted?.trim();
  if (pkVault && pkVault.length > 0) {
    return { screen: "wallet-seed", mode: "custodial_pk", words: [] };
  }

  if (!config.walletSeedPerUser) {
    return { screen: "wallet-seed", mode: "disabled", words: [] };
  }
  const enc = u.wallet_mnemonic_encrypted?.trim();
  const keyHex = config.userWalletEncryptionKeyHex.replace(/^0x/i, "").trim();
  if (!enc || keyHex.length !== 64) {
    return { screen: "wallet-seed", mode: "legacy", words: [] };
  }
  try {
    const mnemonic = decryptUtf8(enc, keyHex);
    const words = mnemonic.trim().split(/\s+/).filter(Boolean);
    return { screen: "wallet-seed", mode: "per_user", words };
  } catch {
    return { screen: "wallet-seed", mode: "legacy", words: [] };
  }
}
