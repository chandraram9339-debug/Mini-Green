import { apiFetch } from "./http";

export type UiSettings = {
  chat_url: string;
  support_url: string;
  channel_url: string;
  youtube_url: string;
  public_telegram_bot_username: string;
  miniapp_webapp_url: string;
};

export async function fetchUiSettings(): Promise<UiSettings | null> {
  try {
    /** Same nginx rule as GET /wallet — /ui/* is often not proxied on production. */
    const res = await apiFetch("/wallet/ui-settings");
    if (!res.ok) return null;
    const json = (await res.json()) as unknown;
    if (!json || typeof json !== "object") return null;
    const o = json as Record<string, unknown>;
    return {
      chat_url: typeof o.chat_url === "string" ? o.chat_url : "",
      support_url: typeof o.support_url === "string" ? o.support_url : "",
      channel_url: typeof o.channel_url === "string" ? o.channel_url : "",
      youtube_url: typeof o.youtube_url === "string" ? o.youtube_url : "",
      public_telegram_bot_username:
        typeof o.public_telegram_bot_username === "string" ? o.public_telegram_bot_username : "",
      miniapp_webapp_url: typeof o.miniapp_webapp_url === "string" ? o.miniapp_webapp_url : ""
    };
  } catch {
    return null;
  }
}
