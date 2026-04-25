import type express from "express";
import { config } from "./config.js";
import { tryClaimIdempotency } from "./domain/idempotency.js";
import { parseInviterTgFromStartMessage } from "./domain/telegramStartPayload.js";
import { getDb } from "./db/connection.js";
import { logEvent } from "./httpEnvelope.js";
import { sendSubscribeCapi } from "./integrations/metaCapi.js";
import { sendTelegramStartWelcome } from "./integrations/telegramBot.js";
import { ensureUser, setUserBotBlockedByTg, touchUserLastActiveByTg } from "./repos/userRepo.js";

/**
 * Telegram bot updates: `my_chat_member` (user blocked / re-opened private chat) and any `message` for DAU/MAU touch.
 */
export function registerTelegramWebhook(app: express.Express) {
  app.post("/hooks/telegram", async (req, res) => {
    const tr = String((res as { locals: { traceId?: string } }).locals?.traceId ?? "tg");
    if (!config.telegramWebhookSecret) {
      logEvent(tr, "telegram.webhook_secret_missing_503", {});
      res.status(503).json({ error: "TELEGRAM_WEBHOOK_SECRET not set" });
      return;
    }
    const s = String(req.query.secret ?? "");
    if (s !== config.telegramWebhookSecret) {
      logEvent(tr, "telegram.webhook_unauthorized_401", {
        hasQuerySecret: s.length > 0
      });
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    const db = getDb();
    const j = req.body as {
      message?: { from?: { id?: number }; chat?: { id?: number; type?: string }; text?: string };
      my_chat_member?: {
        chat?: { id?: number; type?: string };
        new_chat_member?: { status?: string };
        old_chat_member?: { status?: string };
      };
    };
    if (j?.message?.from?.id != null) {
      const uid = String(j.message.from.id);
      const t = (j.message.text ?? "").trim();
      const tNorm = t.toLowerCase();
      const isStart = tNorm === "/start" || tNorm.startsWith("/start ");
      if (isStart) {
        const inviter = parseInviterTgFromStartMessage(t);
        try {
          await ensureUser(db, config, uid, inviter);
          logEvent(tr, "telegram.start.user_ensured", { tg: uid, ref: inviter ?? "" });
        } catch (e) {
          logEvent(tr, "telegram.start.ensure_user_fail", {
            tg: uid,
            err: e instanceof Error ? e.message : String(e)
          });
        }
        touchUserLastActiveByTg(db, uid);
        const subscribeKey = `capi_subscribe:${uid}`;
        if (tryClaimIdempotency(db, subscribeKey)) {
          sendSubscribeCapi(db, config, uid, tr, subscribeKey);
        }
        const cfg = db
          .prepare(
            `SELECT key, value FROM app_config WHERE key IN ('content_miniapp_webapp_url','content_channel_url','content_chat_url','content_telegram_welcome_text')`
          )
          .all() as { key: string; value: string }[];
        const map = Object.fromEntries(cfg.map((r) => [r.key, r.value]));
        const webAppUrl = String(map["content_miniapp_webapp_url"] ?? "").trim() || null;
        const channelUrl = String(map["content_channel_url"] ?? "").trim() || null;
        const chatUrl = String(map["content_chat_url"] ?? "").trim() || null;
        const welcomeText = String(map["content_telegram_welcome_text"] ?? "").trim() || null;
        const fromId = j.message!.from!.id!;
        const chatRaw = j.message?.chat?.id;
        const chatId =
          chatRaw != null && !Number.isNaN(Number(chatRaw)) ? Number(chatRaw) : fromId;
        sendTelegramStartWelcome(config, chatId, {
          webAppHttpsUrl: webAppUrl,
          channelUrl,
          chatUrl,
          welcomeText
        }, tr);
      } else {
        touchUserLastActiveByTg(db, uid);
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
        const subscribeKey = `capi_subscribe:${tg}`;
        if (oldS === "" && tryClaimIdempotency(db, subscribeKey)) {
          sendSubscribeCapi(db, config, tg, tr, subscribeKey);
        }
      } else if (oldS === "member" && (newS === "left" || newS === "kicked")) {
        setUserBotBlockedByTg(db, tg, true);
        logEvent(tr, "telegram.bot_blocked", { tg });
      }
    }
    res.json({ ok: true });
  });
}
