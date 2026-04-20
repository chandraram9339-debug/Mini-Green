import { getAccountSnapshot, getReferralReceivedMinor } from "../ledger.js";
import { config } from "../config.js";
import { getDb } from "../db/connection.js";
import { resolveDeriveConfig } from "../domain/effectiveConfig.js";
import { getBotTradingEnabled, getUserByTg } from "../repos/userRepo.js";

const MINOR_PER_USDT = 100;

/** 100 minor = 1.00 USDT (aligned with minWithdrawMinor 500 = 5.00) */
function minorToUsdt(minor: number) {
  return Math.round((minor / MINOR_PER_USDT) * 1e4) / 1e4;
}

export function buildWalletForUser(userId: string) {
  const s = getAccountSnapshot(userId);
  const refMinor = getReferralReceivedMinor(userId);
  const db = getDb();
  const u = getUserByTg(db, userId);
  const c2 = resolveDeriveConfig(config, db);
  const addr = u?.deposit_tron_address?.trim() || c2.depositAddress || undefined;

  return {
    balanceUsdt: minorToUsdt(s.wallet_minor),
    referralReceivedUsdt: minorToUsdt(refMinor),
    depositAddress: addr,
    availableWithdrawUsdt: minorToUsdt(s.available_minor),
    botTradingEnabled: getBotTradingEnabled(db, userId),
  };
}
