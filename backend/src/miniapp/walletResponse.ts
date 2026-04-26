import type { Database } from "better-sqlite3";
import { getAccountSnapshot, getMoneySummaryStats, getReferralReceivedMinor } from "../ledger.js";
import { config } from "../config.js";
import { getDb } from "../db/connection.js";
import { getFeeSnapshot, resolveDeriveConfig } from "../domain/effectiveConfig.js";
import { getBotTradingEnabled, getUserByTg } from "../repos/userRepo.js";
import { getCurrentPositiveBalanceStartedAtMs } from "./positiveBalanceWindow.js";
import { maxWithdrawAmountMinor } from "../services/withdrawalService.js";
import { buildMiniappUiLinks } from "./uiSettings.js";
import { buildWalletSeedMeta } from "./walletSeedPayload.js";

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
  const ui = buildMiniappUiLinks(db, config, userId);
  const moneyStats = getMoneySummaryStats(userId);

  return {
    balanceUsdt: minorToUsdt(s.wallet_minor),
    referralReceivedUsdt: minorToUsdt(refMinor),
    /**
     * Сумма всех подтверждённых пополнений (нетто, USDT), накопительно за всё время в ledger —
     * опорная «x» для шкалы личного графика в миниаппе (не сброс по «окну» после депозита).
     */
    cumulativeDepositsUsdt: minorToUsdt(moneyStats.deposit_total_net_minor),
    depositAddress: addr,
    availableWithdrawUsdt: minorToUsdt(availableAfterFeeMinor),
    minDepositUsdt: fees.minDepositUsdt,
    depositFeeBps: fees.depositFeeBps,
    depositFeeFixedUsdt: fees.depositFeeFixedUsdt,
    minWithdrawUsdt: fees.minWithdrawUsdt,
    withdrawFeeBps: fees.withdrawFeeBps,
    withdrawFeeFixedUsdt: fees.withdrawFeeFixedUsdt,
    botTradingEnabled: getBotTradingEnabled(db, userId),
    referralLink: buildReferralLink(userId, db),
    positiveBalanceStartedAt: posMs != null ? new Date(posMs).toISOString() : null,
    /** Дублируем ссылки из админки: тот же путь, что /wallet/ui-settings (на части деплоев отдельный URL не проксируется). */
    chat_url: ui.chat_url,
    support_url: ui.support_url,
    channel_url: ui.channel_url,
    youtube_url: ui.youtube_url,
    public_telegram_bot_username: ui.public_telegram_bot_username,
    miniapp_webapp_url: ui.miniapp_webapp_url,
    /** Дублирование /wallet ↔ ui-settings (FAQ из админки). */
    faq_markdown: ui.faq_markdown,
    faq_markdown_es: ui.faq_markdown_es,
    /** Режим экрана сида: без мнемоники (см. mode/reason; слова — только GET /wallet/seed). */
    seedScreen: buildWalletSeedMeta(userId),
  };
}
