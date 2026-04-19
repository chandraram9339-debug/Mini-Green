import crypto from "node:crypto";
import { BIP32Factory } from "bip32";
import * as bip39 from "bip39";
import * as ecc from "tiny-secp256k1";
import TronWeb from "tronweb";
import type { AppConfig } from "../config.js";

const bip32 = BIP32Factory(ecc);
const { fromPrivateKey, isAddress: tronIsAddress } = TronWeb.utils.address;

function userRawPrivateKey32(config: AppConfig, pathIndex: number, tgUserId: string) {
  if (config.hdWalletMnemonic) {
    if (!bip39.validateMnemonic(config.hdWalletMnemonic)) {
      throw new Error("HD_WALLET_MNEMONIC is not valid BIP39");
    }
    const seed = bip39.mnemonicToSeedSync(config.hdWalletMnemonic);
    const root = bip32.fromSeed(seed);
    const child = root.derivePath(`m/44'/195'/0'/0/${pathIndex}`);
    if (!child.privateKey) throw new Error("HD derive failed");
    return child.privateKey;
  }
  if (config.deterministicDeriveKeyHex.length >= 32) {
    const m = Buffer.from(
      config.deterministicDeriveKeyHex.length % 2 === 0
        ? config.deterministicDeriveKeyHex
        : `0${config.deterministicDeriveKeyHex}`,
      "hex"
    );
    return crypto.createHmac("sha256", m).update(`tron:${pathIndex}:${tgUserId}`).digest().subarray(0, 32);
  }
  if (config.authProviderMode === "mock" || config.executionMode === "mock") {
    return crypto
      .createHash("sha256")
      .update(`mock:tron:addr|${pathIndex}|${tgUserId}`)
      .digest();
  }
  throw new Error("Set HD_WALLET_MNEMONIC or a 32+ byte DETERMINISTIC_DERIVE_KEY (hex) in production");
}

/**
 * 64-char hex, same material as the deposit address. For signing USDT sweep.
 */
export function tronUserPrivateKeyHexForUser(
  config: AppConfig,
  pathIndex: number,
  tgUserId: string
) {
  const raw = userRawPrivateKey32(config, pathIndex, tgUserId);
  return Buffer.from(raw).toString("hex");
}

/**
 * Один депозитный аккаунт TRON из пользовательской BIP39-фразы (путь TRON BIP44).
 */
export function tronPrivateKeyHexFromMnemonic(mnemonic: string, addressIndex = 0) {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error("invalid BIP39 mnemonic");
  }
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed);
  const child = root.derivePath(`m/44'/195'/0'/0/${addressIndex}`);
  if (!child.privateKey) throw new Error("HD derive failed for user mnemonic");
  return Buffer.from(child.privateKey).toString("hex");
}

export function tronAddressFromMnemonic(mnemonic: string, addressIndex = 0) {
  const h = tronPrivateKeyHexFromMnemonic(mnemonic, addressIndex);
  const a = fromPrivateKey(h);
  if (typeof a !== "string" || !a) throw new Error("TRON address derive failed from mnemonic");
  return a;
}

/**
 * TRC20 receive address: BIP44 `m/44'/195'/0'/0/{index}` when mnemonic is set;
 * else HMAC-based private key from `DETERMINISTIC_DERIVE_KEY` + `tguser`.
 */
export function tronAddressForUser(config: AppConfig, pathIndex: number, tgUserId: string) {
  const h = tronUserPrivateKeyHexForUser(config, pathIndex, tgUserId);
  const a = fromPrivateKey(h);
  if (typeof a !== "string" || !a) throw new Error("TRON address derive failed");
  return a;
}

export function isValidTronTrc20Address(addr: string) {
  return tronIsAddress(addr);
}
