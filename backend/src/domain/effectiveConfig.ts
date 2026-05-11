import type { Database } from "better-sqlite3";
import { type AppConfig } from "../config.js";

export type FeeSnapshot = {
  minDepositUsdt: number;
  depositFeeFixedUsdt: number;
  depositFeeBps: number;
  /** Мин. сумма вывода (USDT), из app_config `min_withdraw_usdt` или env `MIN_WITHDRAW_MINOR`. */
  minWithdrawUsdt: number;
  withdrawFeeFixedUsdt: number;
  withdrawFeeBps: number;
  referralPercentBps: number;
  /** "all" | "1" | "1,2" — from app_config, falls back to env in AppConfig */
  referralDepositRule: string;
  /** If > 0, Meta CAPI purchase fires only for net deposit >= this (USDT) */
  metaPurchaseMinUsdt: number;
};

function str(s: string | undefined, d: string) {
  if (s === undefined || s === null || s === "") return d;
  return String(s);
}

function num(s: string | undefined, d: number) {
  if (s === undefined || s === null) return d;
  const n = Number(s);
  return Number.isFinite(n) ? n : d;
}

function getG(db: Database) {
  return (k: string) =>
    (db.prepare("SELECT value FROM app_config WHERE key=?").get(k) as { value: string } | undefined)
      ?.value;
}

export function getFeeSnapshot(db: Database, c: AppConfig): FeeSnapshot {
  const g = getG(db);
  const minWdUsdt = num(g("min_withdraw_usdt"), c.minWithdrawMinor / 100);
  return {
    minDepositUsdt: num(g("min_deposit_usdt"), c.minDepositUsdtHuman),
    depositFeeFixedUsdt: num(g("deposit_fee_fixed_usdt"), c.depositFeeFixedUsdtHuman),
    depositFeeBps: num(g("deposit_fee_bps"), c.depositFeeBps),
    minWithdrawUsdt: minWdUsdt,
    withdrawFeeFixedUsdt: num(g("withdraw_fee_fixed_usdt"), c.withdrawFeeFixedUsdtHuman),
    withdrawFeeBps: num(g("withdraw_fee_bps"), c.withdrawFeeBps),
    referralPercentBps: num(g("referral_percent_bps"), c.referralPercentBps),
    referralDepositRule: str(g("referral_deposit_rule"), c.referralDepositRule),
    metaPurchaseMinUsdt: num(g("meta_purchase_min_usdt"), 0)
  };
}

/**
 * HD / addresses: admin `app_config` overrides env (empty string in DB = use env).
 */
export function resolveDeriveConfig(base: AppConfig, db: Database): AppConfig {
  const g = getG(db);
  return {
    ...base,
    hdWalletMnemonic: (g("hd_wallet_mnemonic")?.trim() || base.hdWalletMnemonic) as string,
    deterministicDeriveKeyHex: (g("deterministic_derive_key")?.trim() ||
      base.deterministicDeriveKeyHex) as string,
    depositAddress: (g("treasury_deposit_tron")?.trim() || base.depositAddress) as string
  };
}

export function resolveChainLabels(base: AppConfig, db: Database) {
  const g = getG(db);
  return {
    gazBank: (g("gaz_bank_tron")?.trim() || base.gasBankLabel) as string,
    topupBank: (g("topup_bank_tron")?.trim() || base.topupBankLabel) as string,
    withdrawWallet: (g("withdraw_wallet_tron")?.trim() || base.withdrawWalletLabel) as string
  };
}

/** Central TON treasury (jetton + native); `app_config.central_ton_deposit_address` overrides env. */
export function getCentralTonDepositAddress(db: Database, c: AppConfig): string {
  const g = getG(db);
  const dbVal = (g("central_ton_deposit_address") ?? "").trim();
  if (dbVal) return dbVal;
  return (c.centralTonDepositAddress ?? "").trim();
}

export function setAppConfigValue(db: Database, key: string, value: string) {
  db.prepare(
    "INSERT INTO app_config (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at"
  ).run(key, value, new Date().toISOString());
}

/** DB `withdraw_auto_approve` overrides env when set to "0" or "1"; otherwise uses env default. */
export function getWithdrawAutoApprove(db: Database, c: AppConfig): boolean {
  const g = getG(db);
  const v = g("withdraw_auto_approve");
  if (v === "1" || v === "true") return true;
  if (v === "0" || v === "false") return false;
  return c.withdrawAutoApprove;
}
