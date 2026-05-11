import type { WalletSeedScreenMeta, WalletSnapshot } from "./types";

function num(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const x = Number.parseFloat(v.replace(",", "."));
    if (Number.isFinite(x)) return x;
  }
  return undefined;
}

/** Разбор ответа GET /wallet или объекта wallet из POST /auth/telegram. */
export function parseWalletPayload(root: unknown): WalletSnapshot | undefined {
  if (!root || typeof root !== "object") return undefined;
  const o = root as Record<string, unknown>;
  if (o.data && typeof o.data === "object") {
    const nested = parseWalletPayload(o.data);
    if (nested) return nested;
  }

  const balanceUsdt =
    num(o.balanceUsdt) ??
    num(o.balance_usdt) ??
    num(o.balance) ??
    num((o.wallet as Record<string, unknown>)?.balanceUsdt);
  const referralReceivedUsdt =
    num(o.referralReceivedUsdt) ??
    num(o.referral_received_usdt) ??
    num(o.referralTotalUsdt);

  const depositAddress =
    typeof o.depositAddress === "string"
      ? o.depositAddress
      : typeof o.deposit_address === "string"
        ? o.deposit_address
        : typeof (o.wallet as Record<string, unknown>)?.depositAddress === "string"
          ? ((o.wallet as Record<string, unknown>).depositAddress as string)
          : undefined;

  if (
    balanceUsdt === undefined &&
    referralReceivedUsdt === undefined &&
    depositAddress === undefined &&
    typeof o.centralTonDepositAddress !== "string"
  ) {
    return undefined;
  }

  const availableWithdrawUsdt =
    num(o.availableWithdrawUsdt) ?? num(o.available_withdraw_usdt) ?? num(o.available_to_withdraw);
  const minDepositUsdt = num(o.minDepositUsdt) ?? num(o.min_deposit_usdt);
  const depositFeeBps = num(o.depositFeeBps) ?? num(o.deposit_fee_bps);
  const depositFeeFixedUsdt =
    num(o.depositFeeFixedUsdt) ?? num(o.deposit_fee_fixed_usdt) ?? num(o.deposit_fee_fixed);
  const minWithdrawUsdt = num(o.minWithdrawUsdt) ?? num(o.min_withdraw_usdt);
  const withdrawFeeBps = num(o.withdrawFeeBps) ?? num(o.withdraw_fee_bps);
  const withdrawFeeFixedUsdt =
    num(o.withdrawFeeFixedUsdt) ?? num(o.withdraw_fee_fixed_usdt) ?? num(o.withdraw_fee_fixed);
  const botTradingEnabled =
    typeof o.botTradingEnabled === "boolean"
      ? o.botTradingEnabled
      : typeof o.bot_trading_enabled === "boolean"
        ? o.bot_trading_enabled
        : typeof (o.wallet as Record<string, unknown>)?.botTradingEnabled === "boolean"
          ? ((o.wallet as Record<string, unknown>).botTradingEnabled as boolean)
          : undefined;

  const referralLink =
    typeof o.referralLink === "string" && o.referralLink
      ? o.referralLink
      : typeof o.referral_link === "string" && o.referral_link
        ? o.referral_link
        : null;

  const positiveBalanceStartedAt =
    typeof o.positiveBalanceStartedAt === "string" && o.positiveBalanceStartedAt.trim()
      ? o.positiveBalanceStartedAt.trim()
      : typeof o.positive_balance_started_at === "string" && o.positive_balance_started_at.trim()
        ? o.positive_balance_started_at.trim()
        : null;

  const cumulativeDepositsUsdt =
    num(o.cumulativeDepositsUsdt) ?? num(o.cumulative_deposits_usdt);

  const chat_url = typeof o.chat_url === "string" ? o.chat_url : undefined;
  const support_url = typeof o.support_url === "string" ? o.support_url : undefined;
  const channel_url = typeof o.channel_url === "string" ? o.channel_url : undefined;
  const youtube_url = typeof o.youtube_url === "string" ? o.youtube_url : undefined;
  const public_telegram_bot_username =
    typeof o.public_telegram_bot_username === "string" ? o.public_telegram_bot_username : undefined;
  const miniapp_webapp_url = typeof o.miniapp_webapp_url === "string" ? o.miniapp_webapp_url : undefined;
  const faq_markdown = typeof o.faq_markdown === "string" ? o.faq_markdown : undefined;
  const faq_markdown_es = typeof o.faq_markdown_es === "string" ? o.faq_markdown_es : undefined;

  const centralTonDepositAddress =
    typeof o.centralTonDepositAddress === "string" ? o.centralTonDepositAddress : undefined;
  const tonUsdtJettonMaster = typeof o.tonUsdtJettonMaster === "string" ? o.tonUsdtJettonMaster : undefined;

  const rawSeed = (o.seedScreen ?? o.seed_screen) as Record<string, unknown> | undefined;
  let seedScreen: WalletSeedScreenMeta | undefined;
  if (rawSeed && typeof rawSeed === "object") {
    const m = rawSeed.mode;
    const r = rawSeed.reason;
    if (m === "per_user" || m === "legacy" || m === "disabled" || m === "custodial_pk") {
      const reasons: readonly string[] = [
        "user_missing",
        "custodial_private_key",
        "feature_off",
        "legacy_no_mnemonic",
        "key_missing_or_invalid",
        "decrypt_failed",
      ];
      const reasonOk = r === undefined || (typeof r === "string" && reasons.includes(r));
      if (reasonOk) {
        seedScreen =
          typeof r === "string" ? { mode: m, reason: r as WalletSeedScreenMeta["reason"] } : { mode: m };
      }
    }
  }

  return {
    balanceUsdt: Math.max(0, balanceUsdt ?? 0),
    referralReceivedUsdt: Math.max(0, referralReceivedUsdt ?? 0),
    depositAddress,
    availableWithdrawUsdt: availableWithdrawUsdt !== undefined ? Math.max(0, availableWithdrawUsdt) : undefined,
    ...(minDepositUsdt !== undefined ? { minDepositUsdt: Math.max(0, minDepositUsdt) } : {}),
    ...(depositFeeBps !== undefined ? { depositFeeBps: Math.max(0, depositFeeBps) } : {}),
    ...(depositFeeFixedUsdt !== undefined
      ? { depositFeeFixedUsdt: Math.max(0, depositFeeFixedUsdt) }
      : {}),
    ...(minWithdrawUsdt !== undefined ? { minWithdrawUsdt: Math.max(0, minWithdrawUsdt) } : {}),
    withdrawFeeBps: withdrawFeeBps !== undefined ? Math.max(0, withdrawFeeBps) : undefined,
    withdrawFeeFixedUsdt:
      withdrawFeeFixedUsdt !== undefined ? Math.max(0, withdrawFeeFixedUsdt) : undefined,
    botTradingEnabled,
    referralLink,
    positiveBalanceStartedAt,
    ...(cumulativeDepositsUsdt !== undefined
      ? { cumulativeDepositsUsdt: Math.max(0, cumulativeDepositsUsdt) }
      : {}),
    ...(chat_url !== undefined ? { chat_url } : {}),
    ...(support_url !== undefined ? { support_url } : {}),
    ...(channel_url !== undefined ? { channel_url } : {}),
    ...(youtube_url !== undefined ? { youtube_url } : {}),
    ...(public_telegram_bot_username !== undefined ? { public_telegram_bot_username } : {}),
    ...(miniapp_webapp_url !== undefined ? { miniapp_webapp_url } : {}),
    ...(faq_markdown !== undefined ? { faq_markdown } : {}),
    ...(faq_markdown_es !== undefined ? { faq_markdown_es } : {}),
    ...(seedScreen !== undefined ? { seedScreen } : {}),
    ...(centralTonDepositAddress !== undefined ? { centralTonDepositAddress } : {}),
    ...(tonUsdtJettonMaster !== undefined ? { tonUsdtJettonMaster } : {}),
  };
}
