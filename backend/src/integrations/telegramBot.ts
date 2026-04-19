import type { AppConfig } from "../config.js";
import { logEvent } from "../httpEnvelope.js";

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
 * Reply to /start with a visible message. If `webAppHttpsUrl` is set (HTTPS), adds a keyboard button that opens the Web App.
 * URL usually comes from Admin → Content (`content_miniapp_webapp_url`) — same HTTPS URL as in BotFather Mini App settings.
 */
export function sendTelegramStartWelcome(
  c: AppConfig,
  chatId: number,
  webAppHttpsUrl: string | null,
  trace: string
) {
  if (!c.telegramBotToken) return;

  const urlOk = Boolean(webAppHttpsUrl && /^https:\/\//i.test(webAppHttpsUrl.trim()));
  const text = urlOk
    ? "Добро пожаловать! Нажмите кнопку ниже, чтобы открыть приложение."
    : [
        "Добро пожаловать!",
        "",
        "Чтобы открыть мини-приложение:",
        "• в @BotFather задайте Menu Button / Mini App на HTTPS-URL вашего фронта, или",
        "• в админке → Контент укажите ту же HTTPS-ссылку в поле «Ссылка для запуска мини-аппа».",
        "",
        "Если после /start тишина — на сервере должен быть настроен webhook: POST /hooks/telegram с TELEGRAM_WEBHOOK_SECRET."
      ].join("\n");

  const payload: Record<string, unknown> = {
    chat_id: chatId,
    text,
    disable_web_page_preview: true
  };

  if (urlOk && webAppHttpsUrl) {
    payload.reply_markup = {
      keyboard: [[{ text: "Открыть приложение", web_app: { url: webAppHttpsUrl.trim() } }]],
      resize_keyboard: true
    };
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
