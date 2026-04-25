import type { WalletSnapshot } from "./types";

function pickStr(b?: string, a?: string): string | undefined {
  const x = b?.trim();
  if (x) return b;
  const y = a?.trim();
  if (y) return a;
  return b ?? a;
}

export function mergeWalletSnapshots(a?: WalletSnapshot, b?: WalletSnapshot): WalletSnapshot | undefined {
  if (!a && !b) return undefined;
  return {
    balanceUsdt: Math.max(0, b?.balanceUsdt ?? a?.balanceUsdt ?? 0),
    referralReceivedUsdt: Math.max(0, b?.referralReceivedUsdt ?? a?.referralReceivedUsdt ?? 0),
    depositAddress: b?.depositAddress ?? a?.depositAddress,
    availableWithdrawUsdt: b?.availableWithdrawUsdt ?? a?.availableWithdrawUsdt,
    withdrawFeeBps: b?.withdrawFeeBps ?? a?.withdrawFeeBps,
    withdrawFeeFixedUsdt: b?.withdrawFeeFixedUsdt ?? a?.withdrawFeeFixedUsdt,
    botTradingEnabled: b?.botTradingEnabled ?? a?.botTradingEnabled,
    referralLink: b?.referralLink ?? a?.referralLink,
    positiveBalanceStartedAt: b?.positiveBalanceStartedAt ?? a?.positiveBalanceStartedAt,
    cumulativeDepositsUsdt:
      b?.cumulativeDepositsUsdt ?? a?.cumulativeDepositsUsdt,
    chat_url: pickStr(b?.chat_url, a?.chat_url),
    support_url: pickStr(b?.support_url, a?.support_url),
    channel_url: pickStr(b?.channel_url, a?.channel_url),
    youtube_url: pickStr(b?.youtube_url, a?.youtube_url),
    public_telegram_bot_username: pickStr(b?.public_telegram_bot_username, a?.public_telegram_bot_username),
    miniapp_webapp_url: pickStr(b?.miniapp_webapp_url, a?.miniapp_webapp_url),
    faq_markdown: pickStr(b?.faq_markdown, a?.faq_markdown),
  };
}
