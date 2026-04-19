/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API (Figma front) */
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_AUTH_PATH?: string;
  readonly VITE_API_WALLET_PATH?: string;
  readonly VITE_API_DEPOSIT_CONFIRM_PATH?: string;
  readonly VITE_API_WITHDRAW_CREATE_PATH?: string;
  readonly VITE_API_WALLET_HISTORY_PATH?: string;
  readonly VITE_API_TRADING_PATH?: string;
  readonly VITE_API_TRADING_JOURNAL_PATH?: string;
  readonly VITE_DEV_ALLOW_NO_TELEGRAM?: string;
  readonly VITE_DEV_BEARER_TOKEN?: string;
  readonly VITE_API_AUTH_FALLBACK_MOCK?: string;
  readonly VITE_TELEGRAM_REFERRAL_LINK?: string;
  readonly VITE_TELEGRAM_CHANNEL_URL?: string;
  readonly VITE_TELEGRAM_CHAT_URL?: string;
  readonly VITE_SUPPORT_TELEGRAM_URL?: string;
  readonly VITE_SUPPORT_EMAIL?: string;
  readonly VITE_USER_AGREEMENT_URL?: string;
  readonly VITE_SEED_WORDS?: string;
  readonly VITE_FORCE_HOME_CHART_MODE?: string;
  readonly VITE_DEPOSIT_ADDRESS?: string;
  readonly VITE_DEPOSIT_PAID_FAIL?: string;
  /** Legacy miniapp external links */
  readonly VITE_CHANNEL_URL?: string;
  readonly VITE_CHAT_URL?: string;
  readonly VITE_YOUTUBE_URL?: string;
  readonly VITE_SUPPORT_URL?: string;
  readonly VITE_REFERRAL_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
