import type { Database } from "better-sqlite3";
import type { AppConfig } from "../config.js";
import { resolveDeriveConfig } from "../domain/effectiveConfig.js";
import { decryptUtf8 } from "../domain/walletCrypto.js";
import {
  tronPrivateKeyHexFromMnemonic,
  tronUserPrivateKeyHexForUser
} from "../domain/deriveAddress.js";
import type { UserRow } from "../repos/userRepo.js";

/**
 * Приватный ключ депозитного адреса: либо из пер-пользовательской мнемоники (custodial),
 * либо из общего HD/deterministic/mode как раньше.
 */
export function resolveUserDepositPrivateKeyHex(db: Database, c: AppConfig, u: UserRow): string | null {
  const pkEnc = u.deposit_private_key_encrypted?.trim();
  const keyHex = c.userWalletEncryptionKeyHex?.replace(/^0x/i, "").trim();
  if (pkEnc && keyHex && keyHex.length === 64) {
    try {
      const hex = decryptUtf8(pkEnc, keyHex)
        .replace(/^0x/i, "")
        .trim()
        .toLowerCase();
      if (/^[0-9a-f]{64}$/.test(hex)) return hex;
    } catch {
      /* fall through */
    }
  }

  const enc = u.wallet_mnemonic_encrypted?.trim();
  if (enc && keyHex && keyHex.length === 64) {
    try {
      const mnemonic = decryptUtf8(enc, keyHex);
      return tronPrivateKeyHexFromMnemonic(mnemonic, 0);
    } catch {
      return null;
    }
  }
  if (u.deposit_path_index != null) {
    const c2 = resolveDeriveConfig(c, db);
    return tronUserPrivateKeyHexForUser(c2, u.deposit_path_index, u.tg_user_id);
  }
  return null;
}
