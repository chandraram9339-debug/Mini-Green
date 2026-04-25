import crypto from "node:crypto";
import type express from "express";
import { config } from "../config.js";
import { getDb } from "../db/connection.js";
import { getFeeSnapshot, setAppConfigValue } from "../domain/effectiveConfig.js";
import { logEvent } from "../httpEnvelope.js";
import { usdtHumanToMinor } from "../domain/amounts.js";
import { releaseIdempotency } from "../domain/idempotency.js";
import { getUserByTg, setUserBotBlockedByTg } from "../repos/userRepo.js";
import {
  closeTradePositionAt,
  deleteTradePositionById,
  insertTradePosition,
  listTradePositionsByUserId
} from "../repos/tradePositionRepo.js";
import {
  adminAttachReferrals,
  adminManualDeposit,
  adminManualWithdraw,
  adminReferralCredit,
  adminResetBalance,
  adminTestDeposit,
  adminTestReferrals,
  adminUserExtendedStats,
  adminWipeUser,
  parseGrossMinorFromBody
} from "./adminUserActions.js";
import { runIntegrationsVerify } from "./integrationsVerify.js";
import {
  applyTestWithdrawalSent,
  listWithdrawals,
  rejectWithdrawal,
  setWithdrawalSent
} from "../services/withdrawalService.js";
import { countAlTradeFeedSnapshots } from "../repos/alTradeFeedSnapshotRepo.js";
import {
  getAlTradeFeedPollerStatus,
  isAlTradeFeedConfigured,
  syncAlTradeFeedOnce
} from "../services/alTradeFeedSync.js";
import { sendTelegramText } from "../integrations/telegramBot.js";
import { insertUserNotification } from "../repos/notificationRepo.js";
import {
  getMetaStatusReport,
  triggerTestPurchaseCapi,
  triggerTestSubscribeCapi
} from "../integrations/metaCapi.js";
import { getWalletHealthReport } from "../integrations/walletHealth.js";

function timingSafeAdminKey(headerVal: unknown, secret: string): boolean {
  if (typeof headerVal !== "string" || !secret) return false;
  try {
    const ah = crypto.createHash("sha256").update(headerVal).digest();
    const bh = crypto.createHash("sha256").update(secret).digest();
    return crypto.timingSafeEqual(ah, bh);
  } catch {
    return false;
  }
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!config.adminApiKey) {
    res.status(503).json({ error: "ADMIN_API_KEY not configured" });
    return;
  }
  if (!timingSafeAdminKey(req.headers["x-admin-key"], config.adminApiKey)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
}

function windowStart(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Статистика, выводы, рассылка, Meta, пуш-настройки, кошельки/комиссии (X-Admin-Key).
 */
export function registerAdminApi(app: express.Express) {
  app.get("/admin/health", requireAdmin, (_req, res) => {
    res.json({ ok: true, admin: "v2" });
  });

  app.get("/admin/integrations/verify", requireAdmin, (req, res) => {
    const tr = String(res.locals.traceId ?? "admin");
    void runIntegrationsVerify()
      .then((r) => res.json(r))
      .catch((e) => {
        res.status(500).json({ error: String(e), trace: tr });
      });
  });

  /** External AL simulator poll status (GET /api/trade-feed mirror). No secrets returned. */
  app.get("/admin/al-trade-feed/status", requireAdmin, (_req, res) => {
    let snapshot_rows = 0;
    try {
      snapshot_rows = countAlTradeFeedSnapshots(getDb());
    } catch {
      snapshot_rows = 0;
    }
    res.json({
      configured: isAlTradeFeedConfigured(config),
      enabled_flag: config.alTradeFeedEnabled,
      base_url: config.alTradeFeedBaseUrl,
      interval_ms: config.alTradeFeedPollIntervalMs,
      sync_tg_ids: config.alTradeFeedSyncTgIds,
      position_notional_minor: config.alPositionNotionalMinor,
      store_snapshots: config.alTradeFeedStoreSnapshots,
      snapshot_retention_days: config.alTradeFeedSnapshotRetentionDays,
      snapshot_max_rows: config.alTradeFeedSnapshotMaxRows,
      snapshot_rows,
      poll: getAlTradeFeedPollerStatus()
    });
  });

  app.post("/admin/al-trade-feed/sync-now", requireAdmin, (req, res) => {
    const tr = String(res.locals.traceId ?? "admin");
    if (!isAlTradeFeedConfigured(config)) {
      res.status(400).json({ error: "al_trade_feed not fully configured" });
      return;
    }
    void syncAlTradeFeedOnce(getDb(), config, tr)
      .then(() => res.json({ ok: true, poll: getAlTradeFeedPollerStatus() }))
      .catch((e: unknown) => res.status(500).json({ error: String(e), poll: getAlTradeFeedPollerStatus() }));
  });

  /** Lookup user by Telegram ID for test deposit / withdraw (SIB debugging). */
  app.get("/admin/test-transactions/user/:tgId", requireAdmin, (req, res) => {
    const tg = String(req.params.tgId).trim();
    const u = getUserByTg(getDb(), tg);
    if (!u) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({
      tg_user_id: u.tg_user_id,
      balance_usdt_minor: u.balance_usdt_minor,
      deposit_tron_address: u.deposit_tron_address?.trim() ?? null
    });
  });

  /** Test deposit: full `deposits` row + fees + `chain_tx_in` = sender wallet; SIB evaluated; no Telegram/on-chain. */
  app.post("/admin/test-transactions/deposit", requireAdmin, (req, res) => {
    const tr = String(res.locals.traceId ?? "admin");
    const b = req.body as { tg_user_id?: string; from_wallet?: string; gross_minor?: unknown; gross_usdt?: unknown };
    const tg = String(b.tg_user_id ?? "").trim();
    const fromW = String(b.from_wallet ?? "").trim();
    const gross = parseGrossMinorFromBody({ gross_minor: b.gross_minor, gross_usdt: b.gross_usdt });
    if (!tg || !fromW || gross == null) {
      res.status(400).json({ error: "tg_user_id, from_wallet, gross_usdt or gross_minor required" });
      return;
    }
    try {
      const r = adminTestDeposit(getDb(), config, tg, gross, fromW, tr);
      res.json({ ok: true, deposit_id: r.depositId, net_minor: r.net_minor, fee_minor: r.fee_minor });
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      res.status(m === "not_found" ? 404 : 400).json({ error: m });
    }
  });

  /** Test referrals: inserts N referral_payouts rows + credits balance; no real inviter needed. */
  app.post("/admin/test-transactions/referral", requireAdmin, (req, res) => {
    const tr = String(res.locals.traceId ?? "admin");
    const b = req.body as { tg_user_id?: string; count?: unknown; amount_per_referral_usdt?: unknown; amount_per_referral_minor?: unknown };
    const tg = String(b.tg_user_id ?? "").trim();
    const count = Math.round(Number(b.count ?? 1));
    let minor: number | null = null;
    if (b.amount_per_referral_minor != null && b.amount_per_referral_minor !== "") {
      const n = Number(b.amount_per_referral_minor);
      if (Number.isFinite(n) && n > 0) minor = Math.round(n);
    } else if (b.amount_per_referral_usdt != null && b.amount_per_referral_usdt !== "") {
      const n = Number(b.amount_per_referral_usdt);
      if (Number.isFinite(n) && n > 0) minor = usdtHumanToMinor(n);
    }
    if (!tg || minor == null) {
      res.status(400).json({ error: "tg_user_id and amount_per_referral_usdt required" });
      return;
    }
    try {
      const r = adminTestReferrals(getDb(), tg, count, minor, tr);
      res.json(r);
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      res.status(m === "not_found" ? 404 : 400).json({ error: m });
    }
  });

  /** Test withdraw: `sent` row, balance debited with fees, SIB; no admin approval, no TRON send. */
  app.post("/admin/test-transactions/withdraw", requireAdmin, (req, res) => {
    const tr = String(res.locals.traceId ?? "admin");
    const b = req.body as { tg_user_id?: string; to_address?: string; amount_minor?: unknown; amount_usdt?: unknown };
    const tg = String(b.tg_user_id ?? "").trim();
    const to = String(b.to_address ?? "").trim();
    let amountMinor: number | null = null;
    if (b.amount_minor != null && b.amount_minor !== "") {
      const n = Number(b.amount_minor);
      if (Number.isFinite(n) && n > 0) amountMinor = Math.round(n);
    } else if (b.amount_usdt != null && b.amount_usdt !== "") {
      const n = Number(b.amount_usdt);
      if (Number.isFinite(n) && n > 0) amountMinor = usdtHumanToMinor(n);
    }
    if (!tg || !to || amountMinor == null) {
      res.status(400).json({ error: "tg_user_id, to_address, amount_usdt or amount_minor required" });
      return;
    }
    const r = applyTestWithdrawalSent(getDb(), config, tg, to, amountMinor, tr);
    if (!r.ok) {
      res.status(400).json({ error: r.error });
      return;
    }
    res.json({ ok: true, withdrawal_id: r.id });
  });

  /** Снять idempotency (on-chain / CAPI) для ручного retry. Body: `{ "op_key": "live_deposit:…" }` */
  app.post("/admin/idempotency/release", requireAdmin, (req, res) => {
    const k = String((req.body as { op_key?: string })?.op_key ?? "");
    if (!k || k.length > 400) {
      res.status(400).json({ error: "op_key required" });
      return;
    }
    releaseIdempotency(getDb(), k);
    res.json({ ok: true, released: k });
  });

  app.get("/admin/config", requireAdmin, (_req, res) => {
    const db = getDb();
    const policy = getFeeSnapshot(db, config);
    const rows = db.prepare("SELECT key, value FROM app_config ORDER BY key").all() as { key: string; value: string }[];
    const map: Record<string, string> = {};
    for (const r of rows) {
      if (r.key === "hd_wallet_mnemonic" && r.value && r.value.length > 0) {
        map[r.key] = "[set]";
      } else {
        map[r.key] = r.value;
      }
    }
    res.json({ policy, app_config: map });
  });

  app.get("/admin/wallet-health", requireAdmin, async (_req, res) => {
    try {
      res.json(await getWalletHealthReport(getDb(), config));
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.get("/admin/stats", requireAdmin, (_req, res) => {
    const db = getDb();
    const d1 = windowStart(1);
    const d3 = windowStart(3);
    const d7 = windowStart(7);
    const d30 = windowStart(30);

    const newUsers = (s: string) =>
      (db.prepare("SELECT count(*) as n FROM users WHERE created_at >= ?").get(s) as { n: number }).n;
    const unique_users = { d1: newUsers(d1), d3: newUsers(d3), d7: newUsers(d7), d30: newUsers(d30), all: (db.prepare("SELECT count(*) as n FROM users").get() as { n: number }).n };

    const blocked = (s: string) =>
      (db
        .prepare("SELECT count(*) as n FROM users WHERE blocked_bot_at IS NOT NULL AND blocked_bot_at >= ?")
        .get(s) as { n: number }).n;
    const users_blocked_bot = { d1: blocked(d1), d3: blocked(d3), d7: blocked(d7), d30: blocked(d30), all: (db.prepare("SELECT count(*) as n FROM users WHERE blocked_bot_at IS NOT NULL").get() as { n: number }).n };

    const depInWindow = (s: string) =>
      (db
        .prepare(
          "SELECT count(DISTINCT user_id) as n FROM deposits WHERE status = 'completed' AND completed_at >= ?"
        )
        .get(s) as { n: number }).n;
    const users_made_deposit = {
      d1: depInWindow(d1),
      d3: depInWindow(d3),
      d7: depInWindow(d7),
      d30: depInWindow(d30),
      all: (db
        .prepare("SELECT count(*) as n FROM users WHERE has_deposited = 1")
        .get() as { n: number }).n
    };

    const active = (s: string) =>
      (db
        .prepare("SELECT count(*) as n FROM users WHERE last_active_at IS NOT NULL AND last_active_at >= ?")
        .get(s) as { n: number }).n;
    const mau_dau_window = { d1: active(d1), d3: active(d3), d7: active(d7), d30: active(d30) };

    const depAll = (db.prepare("SELECT count(*) as n FROM deposits WHERE status = 'completed'").get() as { n: number })
      .n;
    const sumIn = (db
      .prepare("SELECT coalesce(sum(gross_minor),0) as s FROM deposits WHERE status = 'completed'")
      .get() as { s: number }).s;
    const sumOut = (db
      .prepare("SELECT coalesce(sum(amount_minor + fee_minor),0) as s FROM withdrawals WHERE status = 'sent'")
      .get() as { s: number }).s;
    const withDep = (db
      .prepare("SELECT count(*) as n FROM users WHERE has_deposited = 1")
      .get() as { n: number }).n;
    const depUsers = (db
      .prepare("SELECT count(DISTINCT user_id) as n FROM deposits WHERE status = 'completed'")
      .get() as { n: number }).n;
    const avgIn = withDep > 0 ? (sumIn / 100) / withDep : 0;
    const wUsers = (db
      .prepare("SELECT count(DISTINCT user_id) as n FROM withdrawals WHERE status = 'sent'")
      .get() as { n: number }).n;
    const avgW = wUsers > 0 ? (sumOut / 100) / wUsers : 0;
    const perDep = depUsers > 0 ? depAll / depUsers : 0;

    res.json({
      unique_new_users: unique_users,
      users_blocked_bot,
      users_made_deposit,
      mau_dau_window,
      deposit_count_total: depAll,
      sum_deposits_usd: (sumIn / 100).toFixed(2),
      sum_withdrawals_usd: (sumOut / 100).toFixed(2),
      avg_deposit_usd: avgIn.toFixed(2),
      avg_deposits_per_depositor: perDep.toFixed(2),
      avg_withdraw_usd: avgW.toFixed(2)
    });
  });

  app.get("/admin/meta-accounts", requireAdmin, (_req, res) => {
    const db = getDb();
    const items = db
      .prepare("SELECT id, label, pixel_id, is_enabled, created_at FROM meta_ad_accounts ORDER BY created_at DESC")
      .all() as { id: string; label: string | null; pixel_id: string; is_enabled: number; created_at: string }[];
    res.json({ items });
  });

  app.get("/admin/meta/status", requireAdmin, (_req, res) => {
    const db = getDb();
    const fees = getFeeSnapshot(db, config);
    res.json(getMetaStatusReport(db, config, fees));
  });

  app.post("/admin/meta-accounts", requireAdmin, (req, res) => {
    const b = req.body as { label?: string; pixel_id?: string; access_token?: string; is_enabled?: number };
    const pixel_id = String(b.pixel_id ?? "").trim();
    const access_token = String(b.access_token ?? "").trim();
    if (!pixel_id || !access_token) {
      res.status(400).json({ error: "pixel_id and access_token required" });
      return;
    }
    const id = `m_${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const enRaw = b.is_enabled as unknown;
    const en = enRaw === 0 || enRaw === "0" || enRaw === false ? 0 : 1;
    getDb()
      .prepare(
        "INSERT INTO meta_ad_accounts (id, label, pixel_id, access_token, is_enabled, created_at) VALUES (?,?,?,?,?,?)"
      )
      .run(id, b.label ? String(b.label) : null, pixel_id, access_token, en, now);
    res.json({ ok: true, id });
  });

  app.delete("/admin/meta-accounts/:id", requireAdmin, (req, res) => {
    const id = String(req.params.id);
    getDb().prepare("DELETE FROM meta_ad_accounts WHERE id = ?").run(id);
    res.json({ ok: true });
  });

  app.post("/admin/meta/test/subscribe", requireAdmin, (req, res) => {
    const db = getDb();
    const tr = String(res.locals.traceId ?? "admin");
    const tg = String((req.body as { tg_user_id?: string })?.tg_user_id ?? "").trim();
    if (!tg) {
      res.status(400).json({ error: "tg_user_id required" });
      return;
    }
    void triggerTestSubscribeCapi(db, config, tg, tr)
      .then((summary) => res.json({ ok: true, summary }))
      .catch((e) => res.status(500).json({ error: String(e) }));
  });

  app.post("/admin/meta/test/purchase", requireAdmin, (req, res) => {
    const db = getDb();
    const tr = String(res.locals.traceId ?? "admin");
    const b = req.body as { tg_user_id?: string; net_usdt?: unknown };
    const tg = String(b.tg_user_id ?? "").trim();
    const netUsdt = Number(b.net_usdt);
    if (!tg || !Number.isFinite(netUsdt) || netUsdt <= 0) {
      res.status(400).json({ error: "tg_user_id and positive net_usdt required" });
      return;
    }
    const fees = getFeeSnapshot(db, config);
    void triggerTestPurchaseCapi(db, config, tg, netUsdt, fees, tr)
      .then((summary) => res.json({ ok: true, summary }))
      .catch((e) => res.status(500).json({ error: String(e) }));
  });

  app.post("/admin/users/:tgId/bot-blocked", requireAdmin, (req, res) => {
    const tg = String(req.params.tgId);
    const block = Boolean(req.body?.block);
    setUserBotBlockedByTg(getDb(), tg, block);
    res.json({ ok: true, blocked: block });
  });

  app.get("/admin/withdrawals", requireAdmin, (req, res) => {
    const st = typeof req.query.status === "string" ? req.query.status : undefined;
    res.json({ items: listWithdrawals(getDb(), st) });
  });

  app.post("/admin/withdrawals/:id/approve", requireAdmin, async (req, res) => {
    const id = String(req.params.id);
    const r = await setWithdrawalSent(getDb(), config, id, String(res.locals.traceId ?? "admin-approve"));
    if (!r.ok) {
      const status =
        r.error === "not_found"
          ? 404
          : r.error === "insufficient" || r.error === "withdraw_temporarily_unavailable"
            ? 409
            : 400;
      res.status(status).json(r);
      return;
    }
    res.json({ ok: true });
  });

  app.post("/admin/withdrawals/:id/reject", requireAdmin, (req, res) => {
    const id = String(req.params.id);
    const reason = String(req.body?.reason ?? "rejected");
    const r = rejectWithdrawal(getDb(), id, reason);
    if (!r.ok) {
      res.status(400).json(r);
      return;
    }
    res.json({ ok: true });
  });

  app.post("/admin/notify", requireAdmin, (req, res) => {
    const segment = String(req.body?.segment ?? "all");
    const text = String(req.body?.text ?? "");
    if (!text) {
      res.status(400).json({ error: "text required" });
      return;
    }
    if (segment !== "all" && segment !== "deposited" && segment !== "no_deposit") {
      res.status(400).json({ error: "bad segment" });
      return;
    }
    const db = getDb();
    const rows = db
      .prepare("SELECT tg_user_id, has_deposited FROM users WHERE blocked_bot_at IS NULL")
      .all() as { tg_user_id: string; has_deposited: number }[];
    const tr = String(res.locals.traceId ?? "admin");
    let n = 0;
    for (const u of rows) {
      if (segment === "deposited" && u.has_deposited !== 1) continue;
      if (segment === "no_deposit" && u.has_deposited === 1) continue;
      const chat = Number(u.tg_user_id);
      if (Number.isFinite(chat)) {
        sendTelegramText(config, chat, text, tr);
        n += 1;
      }
    }
    logEvent(tr, "admin.notify", { segment, n });
    const prev = String(text).slice(0, 500);
    db.prepare(
      "INSERT INTO admin_broadcast_log (segment, text_preview, sent_count, created_at) VALUES (?,?,?,?)"
    ).run(segment, prev, n, new Date().toISOString());
    res.json({ ok: true, sent: n });
  });

  app.get("/admin/deposits", requireAdmin, (req, res) => {
    const limit = Math.min(200, Math.max(1, Number(req.query.limit ?? 50)));
    const offset = Math.max(0, Number(req.query.offset ?? 0));
    const db = getDb();
    const rows = db
      .prepare(
        `SELECT d.id, d.user_id, u.tg_user_id as tg, d.gross_minor, d.fee_minor, d.net_minor, d.status,
                d.created_at, d.completed_at, d.source, d.idempotency_key
         FROM deposits d JOIN users u ON d.user_id = u.id
         ORDER BY d.created_at DESC LIMIT ? OFFSET ?`
      )
      .all(limit, offset) as Record<string, unknown>[];
    const total = (db.prepare("SELECT count(*) as n FROM deposits").get() as { n: number }).n;
    res.json({ items: rows, total, limit, offset });
  });

  app.get("/admin/broadcasts", requireAdmin, (req, res) => {
    const limit = Math.min(200, Math.max(1, Number(req.query.limit ?? 50)));
    const offset = Math.max(0, Number(req.query.offset ?? 0));
    const db = getDb();
    const items = db
      .prepare(
        "SELECT id, segment, text_preview, sent_count, created_at FROM admin_broadcast_log ORDER BY created_at DESC LIMIT ? OFFSET ?"
      )
      .all(limit, offset);
    const total = (db.prepare("SELECT count(*) as n FROM admin_broadcast_log").get() as { n: number }).n;
    res.json({ items, total, limit, offset });
  });

  app.get("/admin/content", requireAdmin, (_req, res) => {
    const db = getDb();
    const g = (k: string) =>
      (db.prepare("SELECT value FROM app_config WHERE key=?").get(k) as { value: string } | undefined)?.value ??
      "";
    res.json({
      channel_url: g("content_channel_url"),
      chat_url: g("content_chat_url"),
      support_url: g("content_support_url"),
      youtube_url: g("content_youtube_url"),
      public_telegram_bot_username: g("public_telegram_bot_username"),
      miniapp_webapp_url: g("content_miniapp_webapp_url"),
      telegram_welcome_text: g("content_telegram_welcome_text"),
      faq_markdown: g("content_faq_markdown"),
      user_agreement_markdown: g("content_user_agreement_markdown")
    });
  });

  app.patch("/admin/content", requireAdmin, (req, res) => {
    const b = req.body as Record<string, string | undefined>;
    const db = getDb();
    const now = new Date().toISOString();
    const ins = db.prepare(
      "INSERT INTO app_config (key, value, updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at"
    );
    if (b.channel_url != null) ins.run("content_channel_url", String(b.channel_url), now);
    if (b.chat_url != null) ins.run("content_chat_url", String(b.chat_url), now);
    if (b.support_url != null) ins.run("content_support_url", String(b.support_url), now);
    if (b.youtube_url != null) ins.run("content_youtube_url", String(b.youtube_url), now);
    if (b.public_telegram_bot_username != null)
      ins.run("public_telegram_bot_username", String(b.public_telegram_bot_username).replace(/^@/, "").trim(), now);
    if (b.miniapp_webapp_url != null) ins.run("content_miniapp_webapp_url", String(b.miniapp_webapp_url).trim(), now);
    if (b.telegram_welcome_text != null)
      ins.run("content_telegram_welcome_text", String(b.telegram_welcome_text), now);
    if (b.faq_markdown != null) ins.run("content_faq_markdown", String(b.faq_markdown), now);
    if (b.user_agreement_markdown != null)
      ins.run("content_user_agreement_markdown", String(b.user_agreement_markdown), now);
    const g = (k: string) =>
      (db.prepare("SELECT value FROM app_config WHERE key=?").get(k) as { value: string } | undefined)?.value ??
      "";
    res.json({
      channel_url: g("content_channel_url"),
      chat_url: g("content_chat_url"),
      support_url: g("content_support_url"),
      youtube_url: g("content_youtube_url"),
      public_telegram_bot_username: g("public_telegram_bot_username"),
      miniapp_webapp_url: g("content_miniapp_webapp_url"),
      telegram_welcome_text: g("content_telegram_welcome_text"),
      faq_markdown: g("content_faq_markdown"),
      user_agreement_markdown: g("content_user_agreement_markdown")
    });
  });

  app.get("/admin/users/:tgId/summary", requireAdmin, (req, res) => {
    const tg = String(req.params.tgId).trim();
    const db = getDb();
    const u = db.prepare("SELECT * FROM users WHERE tg_user_id = ?").get(tg) as Record<string, unknown> | undefined;
    if (!u) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    if ("wallet_mnemonic_encrypted" in u) {
      u.wallet_mnemonic_encrypted = u.wallet_mnemonic_encrypted ? "[encrypted]" : null;
    }
    if ("deposit_private_key_encrypted" in u) {
      u.deposit_private_key_encrypted = u.deposit_private_key_encrypted ? "[encrypted]" : null;
    }
    const uid = u.id as number;
    const depN = (db.prepare("SELECT count(*) as n FROM deposits WHERE user_id=?").get(uid) as { n: number }).n;
    const wdN = (db.prepare("SELECT count(*) as n FROM withdrawals WHERE user_id=?").get(uid) as { n: number }).n;
    res.json({ user: u, deposits_count: depN, withdrawals_count: wdN });
  });

  app.post("/admin/users/:tgId/notifications/support", requireAdmin, (req, res) => {
    const tg = String(req.params.tgId).trim();
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    if (!message) {
      res.status(400).json({ error: "message required" });
      return;
    }
    const db = getDb();
    const u = getUserByTg(db, tg);
    if (!u) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const id = insertUserNotification(db, {
      user_id: u.id,
      kind: "support",
      variant: "success",
      message,
    });
    res.status(201).json({ ok: true, id });
  });

  app.get("/admin/users/:tgId/stats-detail", requireAdmin, (req, res) => {
    const tg = String(req.params.tgId).trim();
    const s = adminUserExtendedStats(getDb(), tg);
    if (!s) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json(s);
  });

  app.post("/admin/users/:tgId/reset-balance", requireAdmin, (req, res) => {
    const tg = String(req.params.tgId).trim();
    const tr = String(res.locals.traceId ?? "admin");
    try {
      adminResetBalance(getDb(), tg);
      logEvent(tr, "admin.user.reset_balance", { tg });
      res.json({ ok: true });
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      res.status(m === "not_found" ? 404 : 400).json({ error: m });
    }
  });

  /** Clears hashed app recovery code — user gets a new code on next GET /api/v1/ui/seed (requires RECOVERY_CODE_PEPPER). */
  app.post("/admin/users/:tgId/reset-recovery-code", requireAdmin, (req, res) => {
    const tg = String(req.params.tgId).trim();
    const db = getDb();
    const tr = String(res.locals.traceId ?? "admin");
    const r = db.prepare("UPDATE users SET recovery_code_hash = NULL, recovery_code_issued_at = NULL WHERE tg_user_id = ?").run(tg);
    if (r.changes === 0) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    logEvent(tr, "admin.user.reset_recovery_code", { tg });
    res.json({ ok: true });
  });

  app.post("/admin/users/:tgId/wipe", requireAdmin, (req, res) => {
    const tg = String(req.params.tgId).trim();
    const confirm = String((req.body as { confirm?: string })?.confirm ?? "");
    if (confirm !== "DELETE_USER") {
      res.status(400).json({ error: "confirm must be DELETE_USER" });
      return;
    }
    const tr = String(res.locals.traceId ?? "admin");
    try {
      adminWipeUser(getDb(), tg);
      logEvent(tr, "admin.user.wipe", { tg });
      res.json({ ok: true });
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      res.status(m === "not_found" ? 404 : 400).json({ error: m });
    }
  });

  app.post("/admin/users/:tgId/manual-deposit", requireAdmin, (req, res) => {
    const tg = String(req.params.tgId).trim();
    const gross = parseGrossMinorFromBody(req.body as { gross_minor?: unknown; gross_usdt?: unknown });
    if (gross == null) {
      res.status(400).json({ error: "gross_usdt or gross_minor required" });
      return;
    }
    const tr = String(res.locals.traceId ?? "admin");
    try {
      const r = adminManualDeposit(getDb(), config, tg, gross, tr);
      res.json({ ok: true, result: r });
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      res.status(m === "not_found" ? 404 : 400).json({ error: m });
    }
  });

  app.post("/admin/users/:tgId/manual-withdraw", requireAdmin, async (req, res) => {
    const tg = String(req.params.tgId).trim();
    const b = req.body as { to_address?: string; amount_minor?: unknown; amount_usdt?: unknown };
    const to = String(b.to_address ?? "").trim();
    let amountMinor: number | null = null;
    if (b.amount_minor != null && b.amount_minor !== "") {
      const n = Number(b.amount_minor);
      if (Number.isFinite(n) && n > 0) amountMinor = Math.round(n);
    } else if (b.amount_usdt != null && b.amount_usdt !== "") {
      const n = Number(b.amount_usdt);
      if (Number.isFinite(n) && n > 0) amountMinor = usdtHumanToMinor(n);
    }
    if (!to || amountMinor == null) {
      res.status(400).json({ error: "to_address and amount_usdt or amount_minor required" });
      return;
    }
    try {
      const r = await adminManualWithdraw(
        getDb(),
        config,
        tg,
        to,
        amountMinor,
        String(res.locals.traceId ?? "admin-manual-user")
      );
      res.json({ ok: true, result: r });
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      res.status(m === "withdraw_temporarily_unavailable" || m === "insufficient" ? 409 : 400).json({ error: m });
    }
  });

  app.post("/admin/users/:tgId/attach-referrals", requireAdmin, (req, res) => {
    const tg = String(req.params.tgId).trim();
    const b = req.body as { child_tg_ids?: unknown; force?: unknown };
    const raw = b.child_tg_ids;
    const children = Array.isArray(raw) ? raw.map((x) => String(x).trim()).filter(Boolean) : [];
    const force = Boolean(b.force);
    try {
      const r = adminAttachReferrals(getDb(), tg, children, force);
      res.json({ ok: true, ...r });
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      res.status(m === "inviter_not_found" ? 404 : 400).json({ error: m });
    }
  });

  app.post("/admin/users/:tgId/referral-credit", requireAdmin, (req, res) => {
    const tg = String(req.params.tgId).trim();
    const b = req.body as { referrer_tg_id?: string; amount_usdt_minor?: unknown; amount_usdt?: unknown };
    const refTg = String(b.referrer_tg_id ?? "").trim();
    let minor: number | null = null;
    if (b.amount_usdt_minor != null && b.amount_usdt_minor !== "") {
      const n = Number(b.amount_usdt_minor);
      if (Number.isFinite(n) && n > 0) minor = Math.round(n);
    } else if (b.amount_usdt != null && b.amount_usdt !== "") {
      const n = Number(b.amount_usdt);
      if (Number.isFinite(n) && n > 0) minor = usdtHumanToMinor(n);
    }
    if (!refTg || minor == null) {
      res.status(400).json({ error: "referrer_tg_id and amount_usdt_minor or amount_usdt required" });
      return;
    }
    const tr = String(res.locals.traceId ?? "admin");
    try {
      const r = adminReferralCredit(getDb(), tg, refTg, minor, tr);
      res.json(r);
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      res.status(m === "user_not_found" ? 404 : 400).json({ error: m });
    }
  });

  app.patch("/admin/config", requireAdmin, (req, res) => {
    const b = req.body as Record<string, string | number | boolean | null | undefined>;
    const db = getDb();
    const setS = (k: string, v: unknown) => {
      if (v != null) setAppConfigValue(db, k, String(v));
    };
    if (b.min_deposit_usdt != null) setS("min_deposit_usdt", b.min_deposit_usdt);
    if (b.deposit_fee_fixed_usdt != null) setS("deposit_fee_fixed_usdt", b.deposit_fee_fixed_usdt);
    if (b.deposit_fee_bps != null) setS("deposit_fee_bps", b.deposit_fee_bps);
    if (b.min_withdraw_usdt != null) setS("min_withdraw_usdt", b.min_withdraw_usdt);
    if (b.withdraw_fee_fixed_usdt != null) setS("withdraw_fee_fixed_usdt", b.withdraw_fee_fixed_usdt);
    if (b.withdraw_fee_bps != null) setS("withdraw_fee_bps", b.withdraw_fee_bps);
    if (b.referral_percent_bps != null) setS("referral_percent_bps", b.referral_percent_bps);
    if (b.referral_deposit_rule != null) setS("referral_deposit_rule", b.referral_deposit_rule);
    if (b.meta_purchase_min_usdt != null) setS("meta_purchase_min_usdt", b.meta_purchase_min_usdt);
    if (b.gaz_bank_tron != null) setS("gaz_bank_tron", b.gaz_bank_tron);
    if (b.topup_bank_tron != null) setS("topup_bank_tron", b.topup_bank_tron);
    if (b.withdraw_wallet_tron != null) setS("withdraw_wallet_tron", b.withdraw_wallet_tron);
    if (b.treasury_deposit_tron != null) setS("treasury_deposit_tron", b.treasury_deposit_tron);
    if (b.deterministic_derive_key != null) setS("deterministic_derive_key", b.deterministic_derive_key);
    if (b.hd_wallet_mnemonic != null) {
      setS("hd_wallet_mnemonic", b.hd_wallet_mnemonic);
    }
    const as01 = (v: unknown) => (v === true || v === 1 || v === "1" || v === "true" ? "1" : "0");
    if (b.withdraw_auto_approve != null) {
      setAppConfigValue(db, "withdraw_auto_approve", as01(b.withdraw_auto_approve));
    }
    if (b.push_auto_no_deposit_enabled != null) {
      setAppConfigValue(db, "push_auto_no_deposit_enabled", as01(b.push_auto_no_deposit_enabled));
    }
    if (b.push_auto_deposited_enabled != null) {
      setAppConfigValue(db, "push_auto_deposited_enabled", as01(b.push_auto_deposited_enabled));
    }
    if (b.push_auto_all_enabled != null) {
      setAppConfigValue(db, "push_auto_all_enabled", as01(b.push_auto_all_enabled));
    }
    if (b.push_auto_cooldown_hours != null) setS("push_auto_cooldown_hours", b.push_auto_cooldown_hours);
    if (b.push_auto_text_no_deposit != null) setS("push_auto_text_no_deposit", b.push_auto_text_no_deposit);
    if (b.push_auto_text_deposited != null) setS("push_auto_text_deposited", b.push_auto_text_deposited);
    if (b.push_auto_text_all != null) setS("push_auto_text_all", b.push_auto_text_all);
    // #region agent log
    fetch("http://127.0.0.1:7557/ingest/485fc05c-6ee8-41f5-ad61-28b0be9e281f", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "9e63b5" },
      body: JSON.stringify({
        sessionId: "9e63b5",
        runId: "core-repro",
        hypothesisId: "H5",
        location: "backend/src/admin/adminApi.ts:720",
        message: "admin config patched",
        data: {
          minDepositUsdt: b.min_deposit_usdt ?? null,
          depositFeeBps: b.deposit_fee_bps ?? null,
          withdrawFeeBps: b.withdraw_fee_bps ?? null,
          withdrawAutoApprove: b.withdraw_auto_approve ?? null,
          topupBank: b.topup_bank_tron != null ? Boolean(String(b.topup_bank_tron).trim()) : null,
          withdrawWallet: b.withdraw_wallet_tron != null ? Boolean(String(b.withdraw_wallet_tron).trim()) : null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    res.json({ ok: true, current: getFeeSnapshot(db, config) });
  });

  /** Open bot positions mirrored to miniapp Trading screen (SQLite; no exchange yet). */
  app.get("/admin/users/:tgId/trade-positions", requireAdmin, (req, res) => {
    const tg = String(req.params.tgId).trim();
    const db = getDb();
    const u = getUserByTg(db, tg);
    if (!u) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({ items: listTradePositionsByUserId(db, u.id) });
  });

  app.post("/admin/users/:tgId/trade-positions", requireAdmin, (req, res) => {
    const tg = String(req.params.tgId).trim();
    const db = getDb();
    const u = getUserByTg(db, tg);
    if (!u) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const b = req.body as { symbol?: string; side?: string; size_minor?: unknown; opened_at?: string };
    const symbol = String(b.symbol ?? "").trim().toUpperCase();
    if (!symbol || symbol.length > 64) {
      res.status(400).json({ error: "symbol required" });
      return;
    }
    const sideRaw = String(b.side ?? "").toLowerCase();
    if (sideRaw !== "long" && sideRaw !== "short") {
      res.status(400).json({ error: "side must be long or short" });
      return;
    }
    const size_minor = Math.round(Number(b.size_minor));
    if (!Number.isFinite(size_minor) || size_minor <= 0) {
      res.status(400).json({ error: "size_minor must be a positive integer" });
      return;
    }
    const opened_at =
      b.opened_at != null && String(b.opened_at).trim() ? String(b.opened_at) : new Date().toISOString();
    if (Number.isNaN(Date.parse(opened_at))) {
      res.status(400).json({ error: "opened_at must be ISO date" });
      return;
    }
    const id = `tp_${crypto.randomUUID()}`;
    insertTradePosition(db, {
      id,
      user_id: u.id,
      symbol,
      side: sideRaw,
      size_minor,
      opened_at,
      closed_at: null,
      entry_price: null,
      exit_price: null,
      close_result_percent: null,
    });
    res.json({ ok: true, id });
  });

  /** Soft-close: row stays for 7d/30d history tabs. Body: `{ "closed_at": "<ISO optional>" }`. */
  app.post("/admin/trade-positions/:id/close", requireAdmin, (req, res) => {
    const id = String(req.params.id);
    const raw = (req.body as { closed_at?: string })?.closed_at;
    const iso = raw != null && String(raw).trim() ? String(raw).trim() : undefined;
    if (iso != null && Number.isNaN(Date.parse(iso))) {
      res.status(400).json({ error: "closed_at must be ISO date" });
      return;
    }
    const ok = closeTradePositionAt(getDb(), id, iso);
    if (!ok) {
      res.status(404).json({ error: "not_found_or_already_closed" });
      return;
    }
    res.json({ ok: true });
  });

  app.delete("/admin/trade-positions/:id", requireAdmin, (req, res) => {
    const id = String(req.params.id);
    const ok = deleteTradePositionById(getDb(), id);
    if (!ok) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({ ok: true });
  });
}
