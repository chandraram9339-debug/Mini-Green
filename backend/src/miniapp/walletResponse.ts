import type { Database } from "better-sqlite3";
import { getAccountSnapshot, getReferralReceivedMinor } from "../ledger.js";
import { config } from "../config.js";
import { getDb } from "../db/connection.js";
import { getFeeSnapshot, resolveDeriveConfig } from "../domain/effectiveConfig.js";
import { getBotTradingEnabled, getUserByTg } from "../repos/userRepo.js";
import { getCurrentPositiveBalanceStartedAtMs } from "./positiveBalanceWindow.js";
import { maxWithdrawAmountMinor } from "../services/withdrawalService.js";

const MINOR_PER_USDT = 100;

/** 100 minor = 1.00 USDT (aligned with minWithdrawMinor 500 = 5.00) */
function minorToUsdt(minor: number) {
  return Math.round((minor / MINOR_PER_USDT) * 1e4) / 1e4;
}

export function buildReferralLink(userId: string, db?: Database): string | null {
  // Приоритет: app_config (заполняется из админки) → env (.env файл)
  const fromDb = db
    ? (db.prepare("SELECT value FROM app_config WHERE key=?").get("public_telegram_bot_username") as { value: string } | undefined)?.value?.replace(/^@/, "").trim()
    : undefined;
  const botUsername = (fromDb || config.publicTelegramBotUsername?.trim()) ?? "";
  if (!botUsername) return null;
  return `https://t.me/${botUsername}?start=ref${userId}`;
}

export function buildWalletForUser(userId: string) {
  const s = getAccountSnapshot(userId);
  const refMinor = getReferralReceivedMinor(userId);
  const db = getDb();
  const u = getUserByTg(db, userId);
  const c2 = resolveDeriveConfig(config, db);
  const fees = getFeeSnapshot(db, config);
  const addr = u?.deposit_tron_address?.trim() || c2.depositAddress || undefined;
  const availableAfterFeeMinor = maxWithdrawAmountMinor(s.available_minor, fees);
  const posMs = u ? getCurrentPositiveBalanceStartedAtMs(db, u.id) : null;

  return {
    balanceUsdt: minorToUsdt(s.wallet_minor),
    referralReceivedUsdt: minorToUsdt(refMinor),
    depositAddress: addr,
    availableWithdrawUsdt: minorToUsdt(availableAfterFeeMinor),
    withdrawFeeBps: fees.withdrawFeeBps,
    withdrawFeeFixedUsdt: fees.withdrawFeeFixedUsdt,
    botTradingEnabled: getBotTradingEnabled(db, userId),
    referralLink: buildReferralLink(userId, db),
    positiveBalanceStartedAt: posMs != null ? new Date(posMs).toISOString() : null,
  };
}
