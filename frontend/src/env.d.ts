/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHANNEL_URL?: string;
  readonly VITE_CHAT_URL?: string;
  readonly VITE_YOUTUBE_URL?: string;
  readonly VITE_SUPPORT_URL?: string;
  readonly VITE_REFERRAL_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
