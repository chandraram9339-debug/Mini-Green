import type { Database } from "better-sqlite3";
import type { AppConfig } from "../config.js";

export type MiniappSettingsPayload = {
  screen: "settings";
  theme: "light" | "black";
  push: boolean;
  vibration: boolean;
  support_url: string;
  channel_url: string;
  chat_url: string;
  youtube_url: string;
  faq_url: string;
  referral_link: string;
};

function cfg(db: Database, key: string): string {
  const row = db.prepare("SELECT value FROM app_config WHERE key = ?").get(key) as { value: string } | undefined;
  return String(row?.value ?? "").trim();
}

/**
 * Links for mini-app UI: mostly from admin content (`content_*`), referral from bot username + tg id.
 */
export function buildMiniappSettings(db: Database, c: AppConfig, tgUserId: string): MiniappSettingsPayload {
  const support = cfg(db, "content_support_url");
  const channel = cfg(db, "content_channel_url");
  const chat = cfg(db, "content_chat_url");
  const youtube = cfg(db, "content_youtube_url");
  const bot = (cfg(db, "public_telegram_bot_username") || c.publicTelegramBotUsername).replace(/^@/, "").trim();

  let referral = "";
  if (bot && tgUserId) {
    referral = `https://t.me/${bot}?start=ref_${encodeURIComponent(tgUserId)}`;
  }

  return {
    screen: "settings",
    theme: "black",
    push: true,
    vibration: true,
    support_url: support,
    channel_url: channel,
    chat_url: chat,
    youtube_url: youtube,
    faq_url: support || "",
    referral_link: referral
  };
}
