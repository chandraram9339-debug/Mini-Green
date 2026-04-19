import type express from "express";
import { config } from "./config.js";
import { tryClaimIdempotency } from "./domain/idempotency.js";
import { getDb } from "./db/connection.js";
import { logEvent } from "./httpEnvelope.js";
import { sendSubscribeCapi } from "./integrations/metaCapi.js";
import { sendTelegramStartWelcome } from "./integrations/telegramBot.js";
import { setUserBotBlockedByTg, touchUserLastActiveByTg } from "./repos/userRepo.js";

/**
 * Telegram bot updates: `my_chat_member` (user blocked / re-opened private chat) and any `message` for DAU/MAU touch.
 */
export function registerTelegramWebhook(app: express.Express) {
  app.post("/hooks/telegram", (req, res) => {
    if (!config.telegramWebhookSecret) {
      res.status(503).json({ error: "TELEGRAM_WEBHOOK_SECRET not set" });
      return;
    }
    const s = String(req.query.secret ?? "");
    if (s !== config.telegramWebhookSecret) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    const tr = String(res.locals.traceId ?? "tg");
    const db = getDb();
    const j = req.body as {
      message?: { from?: { id?: number }; text?: string };
      my_chat_member?: {
        chat?: { id?: number; type?: string };
        new_chat_member?: { status?: string };
        old_chat_member?: { status?: string };
      };
    };
    if (j?.message?.from?.id != null) {
      const uid = String(j.message.from.id);
      touchUserLastActiveByTg(db, uid);
      const t = (j.message.text ?? "").trim();
      if (t === "/start" || t.startsWith("/start ")) {
        if (tryClaimIdempotency(db, `capi_subscribe:${uid}`)) {
          sendSubscribeCapi(db, config, uid, tr);
        }
        const webAppRow = db
          .prepare("SELECT value FROM app_config WHERE key = ?")
          .get("content_miniapp_webapp_url") as { value: string } | undefined;
        const webAppUrl = String(webAppRow?.value ?? "").trim() || null;
        const chatId = j.message!.from!.id!;
        sendTelegramStartWelcome(config, chatId, webAppUrl, tr);
      }
    }
    const m = j?.my_chat_member;
    if (m?.chat?.type === "private" && m.chat.id != null) {
      const tg = String(m.chat.id);
      const newS = m.new_chat_member?.status ?? "";
      const oldS = m.old_chat_member?.status ?? "";
      if (newS === "member" && (oldS === "left" || oldS === "kicked" || oldS === "")) {
        setUserBotBlockedByTg(db, tg, false);
        if (oldS === "left" || oldS === "kicked") {
          logEvent(tr, "telegram.chat_reopened", { tg });
        }
        if (oldS === "" && tryClaimIdempotency(db, `capi_subscribe:${tg}`)) {
          sendSubscribeCapi(db, config, tg, tr);
        }
      } else if (oldS === "member" && (newS === "left" || newS === "kicked")) {
        setUserBotBlockedByTg(db, tg, true);
        logEvent(tr, "telegram.bot_blocked", { tg });
      }
    }
    res.json({ ok: true });
  });
}
