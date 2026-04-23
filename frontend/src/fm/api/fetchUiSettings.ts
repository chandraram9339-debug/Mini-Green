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
    const res = await apiFetch("/api/v1/ui/settings");
    if (!res.ok) return null;
    return (await res.json()) as UiSettings;
  } catch {
    return null;
  }
}
