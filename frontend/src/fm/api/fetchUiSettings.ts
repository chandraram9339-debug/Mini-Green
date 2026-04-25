import { apiFetch } from "./http";
import type { WalletSnapshot } from "./types";

export type UiSettings = {
  chat_url: string;
  support_url: string;
  channel_url: string;
  youtube_url: string;
  public_telegram_bot_username: string;
  miniapp_webapp_url: string;
  faq_markdown: string;
};

const UI_KEYS: (keyof UiSettings)[] = [
  "chat_url",
  "support_url",
  "channel_url",
  "youtube_url",
  "public_telegram_bot_username",
  "miniapp_webapp_url",
  "faq_markdown",
];

function parseUiPayload(o: Record<string, unknown>): UiSettings {
  return {
    chat_url: typeof o.chat_url === "string" ? o.chat_url : "",
    support_url: typeof o.support_url === "string" ? o.support_url : "",
    channel_url: typeof o.channel_url === "string" ? o.channel_url : "",
    youtube_url: typeof o.youtube_url === "string" ? o.youtube_url : "",
    public_telegram_bot_username:
      typeof o.public_telegram_bot_username === "string" ? o.public_telegram_bot_username : "",
    miniapp_webapp_url: typeof o.miniapp_webapp_url === "string" ? o.miniapp_webapp_url : "",
    faq_markdown: typeof o.faq_markdown === "string" ? o.faq_markdown : "",
  };
}

/**
 * Объединяет ответ /wallet/ui-settings с полями из GET /wallet (или auth wallet):
 * если отдельный эндпоинт не проксируется или вернул пусто, подставляем ссылки из кошелька.
 */
export function mergeUiSettingsFromWallet(
  fromApi: UiSettings | null,
  wallet: WalletSnapshot | undefined,
): UiSettings | undefined {
  const fromWal = wallet
    ? parseUiPayload({
        chat_url: wallet.chat_url,
        support_url: wallet.support_url,
        channel_url: wallet.channel_url,
        youtube_url: wallet.youtube_url,
        public_telegram_bot_username: wallet.public_telegram_bot_username,
        miniapp_webapp_url: wallet.miniapp_webapp_url,
        faq_markdown: wallet.faq_markdown,
      } as Record<string, unknown>)
    : null;

  if (!fromApi && !fromWal) return undefined;

  const api = fromApi ?? parseUiPayload({});
  const wal = fromWal ?? parseUiPayload({});
  const out = { ...api };
  for (const k of UI_KEYS) {
    const a = String(api[k] ?? "").trim();
    const b = String(wal[k] ?? "").trim();
    out[k] = a || b;
  }
  const any = UI_KEYS.some((k) => String(out[k]).trim());
  if (!any) return undefined;
  return out;
}

export async function fetchUiSettings(): Promise<UiSettings | null> {
  try {
    /** Same nginx rule as GET /wallet — /ui/* is often not proxied on production. */
    const res = await apiFetch("/wallet/ui-settings");
    if (!res.ok) return null;
    const json = (await res.json()) as unknown;
    if (!json || typeof json !== "object") return null;
    return parseUiPayload(json as Record<string, unknown>);
  } catch {
    return null;
  }
}
