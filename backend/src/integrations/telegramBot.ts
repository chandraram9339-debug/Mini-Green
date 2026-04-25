import type { AppConfig } from "../config.js";
import { logEvent } from "../httpEnvelope.js";

/** href в Telegram HTML: & и кавычки */
function escapeHtmlAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function escapeHtmlText(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

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
  if (!c.telegramBotToken) return;

  const webRaw = String(links.webAppHttpsUrl ?? "").trim();
  const urlOk = Boolean(webRaw && /^https:\/\//i.test(webRaw));
  const channelU = normalizeExternalUrl(links.channelUrl);
  const chatU = normalizeExternalUrl(links.chatUrl);

  const customWelcome = String(links.welcomeText ?? "").trim();

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

  type ParseMode = "HTML" | undefined;
  let parseMode: ParseMode;
  let text: string;
  if (customWelcome) {
    parseMode = undefined;
    text = customWelcome + (hints.length ? `\n${hints.join("\n")}` : "");
  } else {
    /** Дефолт: ссылки <a> (те же URL, что в inline-кнопках и в Admin / миграциях). */
    parseMode = "HTML";
    const line = (label: string, u: string | null): string => {
      if (u) return `<a href="${escapeHtmlAttr(u)}">${label}</a>`;
      return label;
    };
    const appLine = line("📲 App", urlOk ? webRaw : null);
    const chLine = line("📢 Channel", channelU);
    const chtLine = line("💬 Chat", chatU);
    const cta = urlOk
      ? `<a href="${escapeHtmlAttr(webRaw)}">Tap Launch and join the community</a>`
      : "Tap Launch and join the community";
    const body = [
      "🔥 Welcome to PALLADIUM AI",
      "",
      "The next generation of AI-powered trading.",
      "",
      "Autonomous. Secure. AI-powered.",
      "",
      "Jump in here:",
      appLine,
      chLine,
      chtLine,
      "",
      cta
    ];
    const hintSuffix = hints.length
      ? "\n" + hints.map((h) => (h.length ? escapeHtmlText(h) : "")).join("\n")
      : "";
    text = body.join("\n") + hintSuffix;
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
  if (parseMode) payload.parse_mode = parseMode;
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
      }
    })
    .catch((e) => logEvent(trace, "telegram.start_welcome_err", { err: String(e) }));
}
