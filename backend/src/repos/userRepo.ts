import * as bip39 from "bip39";
import type { Database } from "better-sqlite3";
import type { AppConfig } from "../config.js";
import { tronAddressForUser, tronAddressFromMnemonic } from "../domain/deriveAddress.js";
import { resolveDeriveConfig } from "../domain/effectiveConfig.js";
import { provisionTronDepositWallet } from "../integrations/depositWalletProvision.js";
import { encryptUtf8 } from "../domain/walletCrypto.js";

export type UserRow = {
  id: number;
  tg_user_id: string;
  inviter_tg_id: string | null;
  /** 1 = user pressed Start / engine enabled; trading algo may run when balance allows. */
  bot_trading_enabled?: number;
  balance_usdt_minor: number;
  has_deposited: number;
  deposit_count: number;
  deposit_path_index: number | null;
  deposit_tron_address: string | null;
  last_chain_usdt_balance_minor: number | null;
  last_active_at: string | null;
  blocked_bot_at: string | null;
  created_at: string;
  /** AES-GCM blob; при WALLET_SEED_PER_USER — уникальная BIP39 пользователя */
  wallet_mnemonic_encrypted?: string | null;
  /** AES-GCM hex приватника (режим WALLET_STORE_ENCRYPTED_PK) */
  deposit_private_key_encrypted?: string | null;
  /** sha256(pepper:code) for app account recovery; plain code shown only once (GET /seed) */
  recovery_code_hash?: string | null;
  recovery_code_issued_at?: string | null;
  /** SIB: 1 = balance may be adjusted from closed-trade %; see `sib_need_activation_close`. */
  sib_active?: number;
  sib_need_activation_close?: number;
};

export function getUserByTg(db: Database, tg: string): UserRow | undefined {
  return db
    .prepare("SELECT * FROM users WHERE tg_user_id = ?")
    .get(tg) as UserRow | undefined;
}

export function getUserById(db: Database, id: number): UserRow | undefined {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
}

function nextPathIndex(db: Database) {
  const m = db
    .prepare("SELECT coalesce(max(deposit_path_index), -1) as m FROM users")
    .get() as { m: number };
  return m.m + 1;
}

export async function createUser(
  db: Database,
  c: AppConfig,
  tg: string,
  inviterTg: string | null
): Promise<UserRow> {
  const now = new Date().toISOString();

  if (c.walletStoreEncryptedPk) {
    const keyHex = c.userWalletEncryptionKeyHex.replace(/^0x/i, "").trim();
    if (keyHex.length !== 64) {
      throw new Error("USER_WALLET_ENCRYPTION_KEY invalid");
    }
    const { addressBase58, privateKeyHex } = await provisionTronDepositWallet(c, tg);
    const encPk = encryptUtf8(privateKeyHex, keyHex);
    const ins = db.prepare(
      `INSERT INTO users (tg_user_id, inviter_tg_id, balance_usdt_minor, has_deposited, deposit_count, deposit_path_index, deposit_tron_address, wallet_mnemonic_encrypted, deposit_private_key_encrypted, last_chain_usdt_balance_minor, last_active_at, blocked_bot_at, created_at)
       VALUES (?,?,0,0,0,NULL,?,NULL,?,NULL,?,?,?)`
    );
    ins.run(tg, inviterTg, addressBase58, encPk, now, null, now);
    const u = getUserByTg(db, tg);
    if (!u) throw new Error("user insert failed");
    return u;
  }

  if (c.walletSeedPerUser) {
    const keyHex = c.userWalletEncryptionKeyHex.replace(/^0x/i, "").trim();
    if (keyHex.length !== 64) {
      throw new Error("USER_WALLET_ENCRYPTION_KEY invalid");
    }
    const mnemonic = bip39.generateMnemonic(128);
    const encrypted = encryptUtf8(mnemonic, keyHex);
    const address = tronAddressFromMnemonic(mnemonic, 0);
    const ins = db.prepare(
      `INSERT INTO users (tg_user_id, inviter_tg_id, balance_usdt_minor, has_deposited, deposit_count, deposit_path_index, deposit_tron_address, wallet_mnemonic_encrypted, deposit_private_key_encrypted, last_chain_usdt_balance_minor, last_active_at, blocked_bot_at, created_at)
       VALUES (?,?,0,0,0,NULL,?,?,NULL,NULL,NULL,?,?,?)`
    );
    ins.run(tg, inviterTg, address, encrypted, now, null, now);
    const u = getUserByTg(db, tg);
    if (!u) throw new Error("user insert failed");
    return u;
  }

  const idx = nextPathIndex(db);
  const c2 = resolveDeriveConfig(c, db);
  const address = tronAddressForUser(c2, idx, tg);
  const ins = db.prepare(
    `INSERT INTO users (tg_user_id, inviter_tg_id, balance_usdt_minor, has_deposited, deposit_count, deposit_path_index, deposit_tron_address, wallet_mnemonic_encrypted, deposit_private_key_encrypted, last_chain_usdt_balance_minor, last_active_at, blocked_bot_at, created_at)
     VALUES (?,?,0,0,0,?,?,NULL,NULL,NULL,?,?,?)`
  );
  ins.run(tg, inviterTg, idx, address, now, null, now);
  const u = getUserByTg(db, tg);
  if (!u) throw new Error("user insert failed");
  return u;
}

export async function ensureUser(
  db: Database,
  c: AppConfig,
  tg: string,
  inviterTg: string | null
): Promise<UserRow> {
  const ex = getUserByTg(db, tg);
  if (ex) {
    if (inviterTg && ex.inviter_tg_id == null && inviterTg !== tg) {
      db.prepare("UPDATE users SET inviter_tg_id = ? WHERE id = ?").run(inviterTg, ex.id);
      return getUserByTg(db, tg)!;
    }
    return ex;
  }
  if (inviterTg && inviterTg === tg) {
    return createUser(db, c, tg, null);
  }
  return createUser(db, c, tg, inviterTg);
}

export function setLastChainBalance(db: Database, userId: number, minor: number) {
  db.prepare("UPDATE users SET last_chain_usdt_balance_minor = ? WHERE id = ?").run(minor, userId);
}

export function addBalance(db: Database, userId: number, deltaMinor: number) {
  db.prepare("UPDATE users SET balance_usdt_minor = balance_usdt_minor + ? WHERE id = ?").run(
    deltaMinor,
    userId
  );
}

export function bumpDepositCount(db: Database, userId: number) {
  db.prepare(
    "UPDATE users SET deposit_count = deposit_count + 1, has_deposited = 1 WHERE id = ?"
  ).run(userId);
}

export function getInviterId(db: Database, inviterTg: string): number | null {
  const u = getUserByTg(db, inviterTg);
  return u ? u.id : null;
}

export function touchUserLastActiveByTg(db: Database, tg: string) {
  const now = new Date().toISOString();
  db.prepare("UPDATE users SET last_active_at = ? WHERE tg_user_id = ?").run(now, tg);
}

/**
 * @param block — true when user blocked / left chat; false when re-enabled
 */
export function setUserBotBlockedByTg(db: Database, tg: string, block: boolean) {
  const now = new Date().toISOString();
  if (block) {
    db.prepare("UPDATE users SET blocked_bot_at = ? WHERE tg_user_id = ?").run(now, tg);
  } else {
    db.prepare("UPDATE users SET blocked_bot_at = NULL WHERE tg_user_id = ?").run(tg);
  }
}

export function setBotTradingEnabled(db: Database, tg: string, enabled: boolean): boolean {
  const r = db.prepare("UPDATE users SET bot_trading_enabled = ? WHERE tg_user_id = ?").run(enabled ? 1 : 0, tg);
  return r.changes > 0;
}

export function getBotTradingEnabled(db: Database, tg: string): boolean {
  const u = getUserByTg(db, tg);
  if (!u) return false;
  return Number(u.bot_trading_enabled ?? 0) === 1;
}
