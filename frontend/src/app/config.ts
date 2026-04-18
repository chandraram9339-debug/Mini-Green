const normalizeUrl = (value: string | undefined, fallback = "TODO"): string => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
};

export const CHANNEL_URL = normalizeUrl(import.meta.env.VITE_CHANNEL_URL);
export const CHAT_URL = normalizeUrl(import.meta.env.VITE_CHAT_URL);
export const YOUTUBE_URL = normalizeUrl(import.meta.env.VITE_YOUTUBE_URL);
export const SUPPORT_URL = normalizeUrl(import.meta.env.VITE_SUPPORT_URL);
export const REFERRAL_URL = normalizeUrl(import.meta.env.VITE_REFERRAL_URL);

export const DASHBOARD_EXTERNAL_LINKS = {
  channelUrl: CHANNEL_URL,
  chatUrl: CHAT_URL,
  youtubeUrl: YOUTUBE_URL,
  supportUrl: SUPPORT_URL,
  referralUrl: REFERRAL_URL,
} as const;

export const MISSING_EXTERNAL_LINK_ENV_KEYS = [
  CHANNEL_URL === "TODO" ? "VITE_CHANNEL_URL" : null,
  CHAT_URL === "TODO" ? "VITE_CHAT_URL" : null,
  YOUTUBE_URL === "TODO" ? "VITE_YOUTUBE_URL" : null,
  SUPPORT_URL === "TODO" ? "VITE_SUPPORT_URL" : null,
  REFERRAL_URL === "TODO" ? "VITE_REFERRAL_URL" : null,
].filter((key): key is string => key !== null);

if (import.meta.env.DEV && MISSING_EXTERNAL_LINK_ENV_KEYS.length > 0) {
  console.warn(
    `[miniapp] Missing external link env vars: ${MISSING_EXTERNAL_LINK_ENV_KEYS.join(", ")}. ` +
      "Using TODO placeholders until production URLs are provided.",
  );
}
