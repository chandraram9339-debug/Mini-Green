import crypto from "node:crypto";
import type express from "express";
import { config } from "../config.js";
import { getDb } from "../db/connection.js";
import { getFeeSnapshot } from "../domain/effectiveConfig.js";
import { logEvent, sendError, sendSuccess } from "../httpEnvelope.js";
import { validateInitData } from "../initData.js";
import { parseFaqMarkdown } from "../domain/faqMarkdown.js";
import {
  getAccountSnapshot,
  getMoneyOperations,
  getMoneySummaryStats,
  getReferralReceivedMinor,
  getTradingDetailsForPeriod,
  getDashboardChartPoints,
  parseTradingPeriod,
  type MoneyOperationRecord
} from "../ledger.js";
import { buildMiniappSettings } from "../miniapp/uiSettings.js";
import { buildWalletSeedPayload } from "../miniapp/walletSeedPayload.js";
import {
  findUserIdByPlainRecoveryCode,
  issueOrDescribeRecovery,
  userHasLedgerActivity
} from "../domain/recoveryCode.js";
import { ensureUser, getUserById, setBotTradingEnabled } from "../repos/userRepo.js";
import { fireTradingEngineNotify } from "../services/tradingEngineNotify.js";
import { applyDepositNet } from "../services/depositService.js";
import { createWithdrawal } from "../services/withdrawalService.js";

type NotificationRecord = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  level: "info" | "warning" | "success";
};

function validateQueryInit(req: express.Request, res: express.Response) {
  const initData = typeof req.query.initData === "string" ? req.query.initData.trim() : "";
  if (!initData) {
    sendError(res, 400, "INIT_DATA_REQUIRED", "initData query param must be provided");
    return null;
  }
  const validation = validateInitData(initData);
  if (!validation.ok) {
    sendError(res, validation.status, validation.code, validation.reason);
    return null;
  }
  return validation;
}

function validateBodyInit(req: express.Request, res: express.Response) {
  const validation = validateInitData(req.body?.initData);
  if (!validation.ok) {
    sendError(res, validation.status, validation.code, validation.reason);
    return null;
  }
  return validation;
}

/**
 * Preserves the original `/api/v1/ui/...` contract (initData in query or body) for prior clients/QA.
 */
export function registerLegacyApiV1(app: express.Express) {
  app.post("/api/v1/auth/init", (req, res) => {
    const validation = validateInitData(req.body?.initData);
    if (!validation.ok) {
      logEvent(String(res.locals.traceId ?? "no-trace"), "auth.init.rejected", { code: validation.code });
      sendError(res, validation.status, validation.code, validation.reason);
      return;
    }
    logEvent(String(res.locals.traceId ?? "no-trace"), "auth.init.accepted", {
      user_id: validation.userId,
      source: validation.source,
      provider_mode: config.authProviderMode
    });
    sendSuccess(res, {
      api_version: "v1",
      mode: config.executionMode,
      user: {
        id: validation.userId,
        role: "demo"
      },
      init_source: validation.source,
      auth_provider_mode: config.authProviderMode
    });
  });

  app.get("/api/v1/ui/dashboard", (req, res) => {
    const validation = validateQueryInit(req, res);
    if (!validation) return;
    const snapshot = getAccountSnapshot(validation.userId);
    const referral_received_minor = getReferralReceivedMinor(validation.userId);
    sendSuccess(res, {
      screen: "dashboard",
      wallet_minor: snapshot.wallet_minor,
      referral_received_minor,
      pnl_minor: snapshot.pnl_minor,
      open_positions: snapshot.positions.length,
      chart_points: getDashboardChartPoints(validation.userId)
    });
  });

  app.get("/api/v1/ui/money-details", (req, res) => {
    const validation = validateQueryInit(req, res);
    if (!validation) return;
    const snapshot = getAccountSnapshot(validation.userId);
    const stats = getMoneySummaryStats(validation.userId);
    const operations = getMoneyOperations(validation.userId);
    sendSuccess(res, {
      screen: "money-details",
      wallet_minor: stats.wallet_minor,
      available_minor: snapshot.available_minor,
      locked_minor: snapshot.locked_minor,
      deposit_total_minor: stats.deposit_total_gross_minor,
      deposit_count: stats.deposit_count,
      withdraw_total_minor: stats.withdraw_sent_amount_minor,
      withdraw_count: stats.withdraw_sent_count,
      referral_received_minor: stats.referral_received_minor,
      invited_users_count: stats.invited_users_count,
      deposit_address: stats.deposit_address,
      currency: "USD",
      operations
    });
  });

  app.get("/api/v1/ui/trading-details", (req, res) => {
    const validation = validateQueryInit(req, res);
    if (!validation) return;
    const period = parseTradingPeriod(req.query.period);
    sendSuccess(res, getTradingDetailsForPeriod(validation.userId, period));
  });

  /** Start / Stop bot flag for user (miniapp Bot screen). Optional notify to TRADING_ENGINE_NOTIFY_URL. */
  app.post("/api/v1/ui/trading-state", async (req, res) => {
    const validation = validateBodyInit(req, res);
    if (!validation) return;
    const raw = (req.body as { enabled?: unknown }).enabled;
    const enabled = raw === true || raw === "true" || raw === 1 || raw === "1";
    const db = getDb();
    try {
      await ensureUser(db, config, validation.userId, null);
    } catch (e) {
      sendError(res, 500, "USER_BOOT", e instanceof Error ? e.message : "user bootstrap");
      return;
    }
    const ok = setBotTradingEnabled(db, validation.userId, enabled);
    if (!ok) {
      sendError(res, 404, "USER_NOT_FOUND", "User not found");
      return;
    }
    const trace = String(res.locals.traceId ?? "no-trace");
    fireTradingEngineNotify(validation.userId, enabled ? "start" : "stop", trace);
    sendSuccess(res, {
      screen: "trading-state",
      bot_trading_enabled: enabled
    });
  });

  app.get("/api/v1/ui/faq", (req, res) => {
    const validation = validateQueryInit(req, res);
    if (!validation) return;
    const db = getDb();
    const mdRaw = db.prepare("SELECT value FROM app_config WHERE key = ?").get("content_faq_markdown") as
      | { value: string }
      | undefined;
    const md = String(mdRaw?.value ?? "");
    const parsed = parseFaqMarkdown(md);
    const fallback = [
      {
        id: "withdraw",
        q: "How to withdraw money?",
        a: "Open Withdraw screen, fill TRON wallet and amount, then confirm."
      },
      {
        id: "timing",
        q: "How long does withdrawal take?",
        a: "Usually 10 minutes to 3 hours. In edge cases up to 7 days."
      }
    ];
    const items = parsed.length > 0 ? parsed.map((p) => ({ id: p.id, q: p.q, a: p.a })) : fallback;
    sendSuccess(res, {
      screen: "faq",
      items
    });
  });

  app.get("/api/v1/ui/notifications", (req, res) => {
    const validation = validateQueryInit(req, res);
    if (!validation) return;
    const usd = (minor: number) => (minor / 100).toFixed(2);
    const ops: MoneyOperationRecord[] = getMoneyOperations(validation.userId).slice(0, 15);
    const records: NotificationRecord[] = ops.map((o) => ({
      id: `n_${o.id}`,
      title:
        o.kind === "withdraw"
          ? o.status === "pending"
            ? "Withdrawal pending"
            : "Withdrawal"
          : o.kind === "referral"
            ? "Referral reward"
            : "Deposit",
      body:
        o.kind === "deposit"
          ? `+${usd(o.amount_minor)} USDT · ${o.wallet_mask ?? "deposit"}`
          : o.kind === "referral"
            ? `+${usd(o.amount_minor)} USDT referral bonus`
            : o.kind === "withdraw"
              ? o.status === "pending"
                ? `${usd(o.amount_minor)} USDT · ${o.wallet_mask ?? "pending"}`
                : `−${usd(o.amount_minor)} USDT sent · ${o.wallet_mask ?? ""}`
              : `${o.kind} · ${o.wallet_mask ?? "—"}`,
      created_at: o.occurred_at,
      level: o.status === "pending" ? "info" : "success"
    }));
    sendSuccess(res, {
      screen: "notifications",
      items: records
    });
  });

  app.get("/api/v1/ui/settings", (req, res) => {
    const validation = validateQueryInit(req, res);
    if (!validation) return;
    const db = getDb();
    const payload = buildMiniappSettings(db, config, validation.userId);
    sendSuccess(res, payload);
  });

  app.get("/api/v1/ui/seed", async (req, res) => {
    const validation = validateQueryInit(req, res);
    if (!validation) return;
    const db = getDb();
    try {
      await ensureUser(db, config, validation.userId, null);
    } catch (e) {
      sendError(res, 500, "USER_BOOT", e instanceof Error ? e.message : "user bootstrap");
      return;
    }
    const accountRecovery = issueOrDescribeRecovery(db, config, validation.userId);
    const p = buildWalletSeedPayload(validation.userId);
    sendSuccess(res, {
      screen: "seed",
      mode: p.mode,
      words: p.words,
      account_recovery: accountRecovery
    });
  });

  /** Link current Telegram identity to an existing account using the one-time recovery code from Seed screen. */
  app.post("/api/v1/ui/recovery-claim", async (req, res) => {
    const validation = validateBodyInit(req, res);
    if (!validation) return;
    const pepper = config.recoveryCodePepper.trim();
    if (!pepper) {
      sendError(res, 503, "RECOVERY_DISABLED", "Account recovery is not configured");
      return;
    }
    const code = String((req.body as { recovery_code?: string })?.recovery_code ?? "").trim();
    if (code.length < 8) {
      sendError(res, 400, "RECOVERY_CODE_INVALID", "recovery_code must be at least 8 characters");
      return;
    }
    const db = getDb();
    let nu;
    try {
      nu = await ensureUser(db, config, validation.userId, null);
    } catch (e) {
      sendError(res, 500, "USER_BOOT", e instanceof Error ? e.message : "user bootstrap");
      return;
    }
    const targetId = findUserIdByPlainRecoveryCode(db, code, pepper);
    if (targetId == null) {
      sendError(res, 404, "RECOVERY_NOT_FOUND", "Invalid recovery code");
      return;
    }
    const target = getUserById(db, targetId);
    if (!target) {
      sendError(res, 404, "RECOVERY_NOT_FOUND", "Invalid recovery code");
      return;
    }
    if (target.tg_user_id === validation.userId) {
      sendSuccess(res, { screen: "recovery-claim", status: "already_linked" });
      return;
    }
    if (target.id === nu.id) {
      sendSuccess(res, { screen: "recovery-claim", status: "already_linked" });
      return;
    }
    if (userHasLedgerActivity(db, nu.id)) {
      sendError(
        res,
        409,
        "RECOVERY_CONFLICT",
        "This Telegram profile already has balance or activity; contact support to merge accounts."
      );
      return;
    }
    const tr = String(res.locals.traceId ?? "recovery");
    try {
      db.transaction(() => {
        db.prepare("DELETE FROM users WHERE id = ?").run(nu.id);
        db.prepare("UPDATE users SET tg_user_id = ? WHERE id = ?").run(validation.userId, target.id);
      })();
      logEvent(tr, "recovery.claim.ok", {
        target_user_id: target.id,
        dropped_empty_user_id: nu.id,
        new_tg: validation.userId
      });
    } catch (e) {
      sendError(res, 500, "RECOVERY_MERGE_FAILED", e instanceof Error ? e.message : "merge failed");
      return;
    }
    sendSuccess(res, {
      screen: "recovery-claim",
      status: "linked",
      previous_telegram_cleared_user_id: nu.id
    });
  });

  app.get("/api/v1/ui/agreement", (req, res) => {
    const validation = validateQueryInit(req, res);
    if (!validation) return;
    const db = getDb();
    const raw =
      (db.prepare("SELECT value FROM app_config WHERE key = ?").get("content_user_agreement_markdown") as
        | { value: string }
        | undefined)?.value?.trim() ?? "";
    const defaultBody =
      "This mini app provides informational and execution support. No investment guarantees are provided.\n\n" +
      "Blockchain operations are final. Keep your recovery phrase private and never share private keys.";
    sendSuccess(res, {
      screen: "agreement",
      title: "User Agreement",
      content: raw.length > 0 ? raw : defaultBody
    });
  });

  app.post("/api/v1/ui/top-up", async (req, res) => {
    const validation = validateBodyInit(req, res);
    if (!validation) return;
    const amountMinor = req.body?.amount_minor;
    if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
      sendError(res, 400, "AMOUNT_MINOR_INVALID", "amount_minor must be a positive integer");
      return;
    }
    const db = getDb();
    const actionId = `tu_${crypto.randomUUID()}`;
    let u2: { id: number } | null = null;
    try {
      u2 = await ensureUser(db, config, validation.userId, null);
      const now = new Date().toISOString();
      db.prepare(
        `INSERT INTO deposits (id, user_id, gross_minor, fee_minor, net_minor, status, idempotency_key, source, created_at)
         VALUES (?, ?, ?, 0, 0, 'awaiting_paid', ?, 'legacy_ui', ?)`
      ).run(actionId, u2.id, amountMinor, `intent:${actionId}`, now);
    } catch (e) {
      sendError(
        res,
        500,
        "USER_BOOT",
        e instanceof Error ? e.message : "user bootstrap"
      );
      return;
    }
    sendSuccess(res, {
      screen: "top-up",
      status: "accepted",
      action_id: actionId,
      amount_minor: amountMinor
    });
  });

  app.post("/api/v1/ui/withdraw", async (req, res) => {
    const validation = validateBodyInit(req, res);
    if (!validation) return;
    const amountMinor = req.body?.amount_minor;
    if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
      sendError(res, 400, "AMOUNT_MINOR_INVALID", "amount_minor must be a positive integer");
      return;
    }
    const toAddr =
      typeof req.body?.to_address === "string"
        ? req.body.to_address.trim()
        : typeof req.body?.address === "string"
          ? req.body.address.trim()
          : "";
    if (!toAddr) {
      sendError(res, 400, "TO_ADDRESS_REQUIRED", "to_address (TRC20) is required for withdrawal");
      return;
    }
    const db = getDb();
    let cr: { ok: true; id: string; auto: boolean } | { ok: false; error: string } | null = null;
    try {
      await ensureUser(db, config, validation.userId, null);
      cr = createWithdrawal(getDb(), config, validation.userId, toAddr, amountMinor) as
        | { ok: true; id: string; auto: boolean }
        | { ok: false; error: string };
    } catch (e) {
      sendError(res, 500, "USER_BOOT", e instanceof Error ? e.message : "user bootstrap");
      return;
    }
    if (cr == null) {
      sendError(res, 500, "INTERNAL", "create withdrawal");
      return;
    }
    if (!cr.ok) {
      if (cr.error === "insufficient")
        sendError(
          res,
          409,
          "INSUFFICIENT_AVAILABLE_FUNDS",
          "available balance is insufficient for withdraw"
        );
      else
        sendError(
          res,
          400,
          "WITHDRAW_REJECT",
          cr.error === "invalid_tron_address" ? "Invalid TRON address" : "Withdrawal rejected"
        );
      return;
    }
    sendSuccess(res, {
      screen: "withdraw",
      status: cr.auto ? "sent" : "on_hold",
      request_id: cr.id,
      amount_minor: amountMinor
    });
  });

  app.post("/api/v1/ui/confirm", async (req, res) => {
    const validation = validateBodyInit(req, res);
    if (!validation) return;
    const actionId = typeof req.body?.action_id === "string" ? req.body.action_id.trim() : "";
    if (!actionId) {
      sendError(res, 400, "ACTION_ID_REQUIRED", "action_id must be a non-empty string");
      return;
    }
    const db = getDb();
    let u: { id: number; tg_user_id: string } | null = null;
    try {
      u = await ensureUser(db, config, validation.userId, null);
    } catch (e) {
      sendError(res, 500, "USER_BOOT", e instanceof Error ? e.message : "user bootstrap");
      return;
    }
    const row = db
      .prepare("SELECT * FROM deposits WHERE id = ? AND user_id = ? AND status = 'awaiting_paid'")
      .get(actionId, u!.id) as { id: string; gross_minor: number; user_id: number } | undefined;
    if (!row) {
      sendError(res, 404, "ACTION_NOT_FOUND", "action_id was not found");
      return;
    }
    const fees = getFeeSnapshot(db, config);
    const r = applyDepositNet(
      db,
      config,
      fees,
      u!.id,
      validation.userId,
      row.gross_minor,
      `legacy:commit:${row.id}`,
      "legacy_ui",
      null,
      String(res.locals.traceId ?? "legacy")
    );
    if (!r.ok) {
      sendError(res, 400, "DEPOSIT_NOT_COMPLETE", "Cannot confirm deposit: " + r.error);
      return;
    }
    db.prepare("DELETE FROM deposits WHERE id = ? AND status = 'awaiting_paid'").run(actionId);
    sendSuccess(res, {
      screen: "confirm",
      action_id: actionId,
      status: "confirmed"
    });
  });
}
