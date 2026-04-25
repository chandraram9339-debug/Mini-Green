import type { AppConfig } from "../config.js";
import { logEvent } from "../httpEnvelope.js";

function normalizeExternalUrl(raw: string | null | undefined): string | null {
  let u = String(raw ?? "").trim();
  if (!u) return null;
  if (u.startsWith("//")) u = `https:${u}`;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) {
    if (/^(?:www\.)?t\.me\//i.test(u)) u = `https://${u.replace(/^\/*/, "")}`;
    else if (/^(?:www\.)?telegram\.me\//i.test(u)) u = `https://${u.replace(/^\/*/, "")}`;
    else return null;
  }
  u = u.replace(/^http:\/\/(www\.)?t\.me\//i, "https://t.me/");
  u = u.replace(/^http:\/\/(www\.)?telegram\.me\//i, "https://telegram.me/");
  if (!/^https:\/\//i.test(u)) return null;
  return u;
}

export type TelegramStartWelcomeLinks = {
  webAppHttpsUrl: string | null;
  channelUrl: string | null;
  chatUrl: string | null;
  /** Текст из Admin → Контент (`content_telegram_welcome_text`), plain text */
  welcomeText: string | null;
};

export function notifyUserDeposit(c: AppConfig, tgUserId: string, amountText: string, trace: string) {
  if (!c.telegramBotToken) {
    return;
  }
  const text = `Balance topped up: ${amountText} USDT.`;
  const url = `https://api.telegram.org/bot${c.telegramBotToken}/sendMessage`;
  void (async () => {
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: Number(tgUserId), text })
      });
      if (!r.ok) {
        const t = await r.text();
        logEvent(trace, "telegram.push_failed", { status: r.status, t: t.slice(0, 200) });
      }
    } catch (e) {
      logEvent(trace, "telegram.push_error", { err: String(e) });
    }
  })();
}

export function sendTelegramText(c: AppConfig, chatId: number, text: string, trace: string) {
  if (!c.telegramBotToken) return;
  const url = `https://api.telegram.org/bot${c.telegramBotToken}/sendMessage`;
  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  })
    .then((r) => {
      if (!r.ok) logEvent(trace, "telegram.broadcast_row_fail", { status: r.status });
    })
    .catch((e) => logEvent(trace, "telegram.broadcast_row_err", { err: String(e) }));
}

/**
 * Ответ на /start: пользователь уже в БД (`ensureUser` из webhook), текст + inline-кнопки:
 * мини-апп (web_app), канал и чат из Admin → Контент.
 */
export function sendTelegramStartWelcome(
  c: AppConfig,
  chatId: number,
  links: TelegramStartWelcomeLinks,
  trace: string
) {
  if (!c.telegramBotToken) {
    logEvent(trace, "telegram.start_welcome_skipped_no_bot_token", { chat: String(chatId) });
    return;
  }

  const webRaw = String(links.webAppHttpsUrl ?? "").trim();
  const urlOk = Boolean(webRaw && /^https:\/\//i.test(webRaw));
  const channelU = normalizeExternalUrl(links.channelUrl);
  const chatU = normalizeExternalUrl(links.chatUrl);

  const customWelcome = String(links.welcomeText ?? "").trim();
  /** Дефолт, если в Admin → Контент пусто (`content_telegram_welcome_text`). Кнопки: App (Web App) + Channel + Chat. */
  const defaultLines = [
    "🔥 Welcome to PALLADIUM AI",
    "",
    "The next generation of AI-powered trading.",
    "",
    "Autonomous. Secure. AI-powered.",
    "",
    "Jump in here:",
    "📲 App",
    "📢 Channel",
    "💬 Chat",
    "",
    "Tap Launch and join the community"
  ];
  const hints: string[] = [];
  if (!urlOk) {
    hints.push(
      "",
      "To show the App button:",
      "• In @BotFather set Menu Button / Mini App to your mini app HTTPS URL,",
      "• In Admin → Content set the mini app launch URL (same HTTPS)."
    );
  }
  if (!channelU && !chatU) {
    hints.push("", "Set Channel and Chat links in Admin → Content.");
  }
  let text: string;
  if (customWelcome) {
    text = customWelcome + (hints.length ? `\n${hints.join("\n")}` : "");
  } else {
    text = [...defaultLines, ...hints].join("\n");
  }

  type IkBtn =
    | { text: string; url: string }
    | { text: string; web_app: { url: string } };
  const rows: IkBtn[][] = [];
  if (urlOk) {
    rows.push([{ text: "App", web_app: { url: webRaw } }]);
  }
  // Как в тексте: Channel, затем Chat (ссылки из Admin / миграции)
  const secondRow: IkBtn[] = [];
  if (channelU) secondRow.push({ text: "Channel", url: channelU });
  if (chatU) secondRow.push({ text: "Chat", url: chatU });
  if (secondRow.length) rows.push(secondRow);

  const payload: Record<string, unknown> = {
    chat_id: chatId,
    text,
    disable_web_page_preview: true
  };
  if (rows.length) {
    payload.reply_markup = { inline_keyboard: rows };
  }

  const apiUrl = `https://api.telegram.org/bot${c.telegramBotToken}/sendMessage`;
  void fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(async (r) => {
      if (!r.ok) {
        const t = await r.text();
        logEvent(trace, "telegram.start_welcome_fail", { status: r.status, body: t.slice(0, 400) });
      } else {
        logEvent(trace, "telegram.start_welcome_ok", { chat: String(chatId) });
      }
    })
    .catch((e) => logEvent(trace, "telegram.start_welcome_err", { err: String(e) }));
}
