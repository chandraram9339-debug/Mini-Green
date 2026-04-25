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
  supportUrl: string | null;
  /** Текст из Admin → Контент (`content_telegram_welcome_text`), plain text */
  welcomeText: string | null;
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

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
 * Ответ на /start: пользователь уже в БД (`ensureUser` из webhook).
 * Текст: кликабельные ссылки в теле сообщения (HTML).
 * Кнопки: одна `LAUNCH APP` (web_app) — без отдельных invite-кнопок Channel/Chat.
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
  const supportU = normalizeExternalUrl(links.supportUrl);

  const customWelcome = String(links.welcomeText ?? "").trim();
  /** Дефолт, если в Admin → Контент пусто (`content_telegram_welcome_text`). */
  const defaultTextHtml = [
    "🔥 Welcome to PALLADIUM AI",
    "",
    "The next generation of AI-powered trading.",
    "",
    "Autonomous. Secure. AI-powered.",
    "",
    "Jump in here:",
    urlOk ? `<a href="${escapeHtml(webRaw)}">📲 App</a>` : "📲 App",
    channelU ? `<a href="${escapeHtml(channelU)}">📢 Channel</a>` : "📢 Channel",
    chatU ? `<a href="${escapeHtml(chatU)}">💬 Chat</a>` : "💬 Chat",
    supportU ? `<a href="${escapeHtml(supportU)}">🛟 Support</a>` : "",
    "",
    "Tap Launch and join the community"
  ]
    .filter((l) => l !== "")
    .join("\n");

  let textHtml: string;
  if (!customWelcome) {
    textHtml = defaultTextHtml;
  } else {
    // Admin stores plain text. If it already contains the standard lines, convert them to HTML links in-place.
    const hasAppLine = /(^|\n)\s*📲\s*App\s*(\n|$)/.test(customWelcome);
    const hasChannelLine = /(^|\n)\s*📢\s*Channel\s*(\n|$)/.test(customWelcome);
    const hasChatLine = /(^|\n)\s*💬\s*Chat\s*(\n|$)/.test(customWelcome);
    const hasSupportLine = /(^|\n)\s*🛟\s*Support\s*(\n|$)/.test(customWelcome);

    let body = escapeHtml(customWelcome);
    if (hasAppLine && urlOk) {
      body = body.replace(/(^|\n)(\s*)📲\s*App(\s*)(?=\n|$)/g, (_m, p1, p2, p3) => {
        return `${p1}${p2}<a href="${escapeHtml(webRaw)}">📲 App</a>${p3}`;
      });
    }
    if (hasChannelLine && channelU) {
      body = body.replace(/(^|\n)(\s*)📢\s*Channel(\s*)(?=\n|$)/g, (_m, p1, p2, p3) => {
        return `${p1}${p2}<a href="${escapeHtml(channelU)}">📢 Channel</a>${p3}`;
      });
    }
    if (hasChatLine && chatU) {
      body = body.replace(/(^|\n)(\s*)💬\s*Chat(\s*)(?=\n|$)/g, (_m, p1, p2, p3) => {
        return `${p1}${p2}<a href="${escapeHtml(chatU)}">💬 Chat</a>${p3}`;
      });
    }
    if (hasSupportLine && supportU) {
      body = body.replace(/(^|\n)(\s*)🛟\s*Support(\s*)(?=\n|$)/g, (_m, p1, p2, p3) => {
        return `${p1}${p2}<a href="${escapeHtml(supportU)}">🛟 Support</a>${p3}`;
      });
    }

    const needAppend =
      (!hasAppLine && urlOk) ||
      (!hasChannelLine && Boolean(channelU)) ||
      (!hasChatLine && Boolean(chatU)) ||
      (!hasSupportLine && Boolean(supportU));

    const linkLines: string[] = [];
    if (needAppend) {
      if (!hasAppLine && urlOk) linkLines.push(`<a href="${escapeHtml(webRaw)}">📲 App</a>`);
      if (!hasChannelLine && channelU) linkLines.push(`<a href="${escapeHtml(channelU)}">📢 Channel</a>`);
      if (!hasChatLine && chatU) linkLines.push(`<a href="${escapeHtml(chatU)}">💬 Chat</a>`);
      if (!hasSupportLine && supportU) linkLines.push(`<a href="${escapeHtml(supportU)}">🛟 Support</a>`);
    }

    textHtml = body + (linkLines.length ? `\n${linkLines.join("\n")}` : "");
  }

  type IkBtn =
    | { text: string; url: string }
    | { text: string; web_app: { url: string } };
  // Only one "launch pad" button (web_app). Channel/Chat are clickable in text.
  const rows: IkBtn[][] = urlOk ? [[{ text: "LAUNCH APP", web_app: { url: webRaw } }]] : [];

  const payload: Record<string, unknown> = {
    chat_id: chatId,
    text: textHtml,
    parse_mode: "HTML",
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
