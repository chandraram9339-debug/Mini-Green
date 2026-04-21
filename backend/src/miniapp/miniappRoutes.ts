import type express from "express";
import { config } from "../config.js";
import { getDb } from "../db/connection.js";
import { logEvent } from "../httpEnvelope.js";
import { validateInitData } from "../initData.js";
import { ensureUser, getUserByTg, touchUserLastActiveByTg } from "../repos/userRepo.js";
import { buildTradingJournalEmptyPayload, buildTradingJournalPayload } from "./tradingJournalPayload.js";
import { runDepositOnPaid } from "../services/depositService.js";
import { createWithdrawal } from "../services/withdrawalService.js";
import { buildWalletHistoryForUser } from "./historyResponse.js";
import { buildNotificationsPayload } from "./notificationsPayload.js";
import { signAccessToken, requireMiniappAuth } from "./jwtAuth.js";
import { buildTradingSummaryForUser, isAllowedTradingPeriod } from "./tradingResponse.js";
import { buildWalletSeedPayload } from "./walletSeedPayload.js";
import { buildWalletForUser } from "./walletResponse.js";
import { markAllUserNotificationsRead } from "../repos/notificationRepo.js";
import { getBotTradingEnabled, setBotTradingEnabled } from "../repos/userRepo.js";
import { sibOnUserStart, sibOnUserStop } from "../services/sibBalance.js";
import { fireTradingEngineNotify } from "../services/tradingEngineNotify.js";

/**
 * Мини-апп (Figma): JWT + per-user TRC20 (HD / deterministic) + ввод/вывод по ТЗ.
 */
export function registerMiniappContract(app: express.Express) {
  app.post("/auth/telegram", async (req, res) => {
    const v = validateInitData(req.body?.initData);
    if (!v.ok) {
      res.status(v.status).json({ message: v.reason, code: v.code });
      return;
    }
    const ref =
      typeof req.body?.referralInviterTgId === "string" || typeof req.body?.referralInviterTgId === "number"
        ? String(req.body.referralInviterTgId).trim() || null
        : null;
    const db = getDb();
    try {
      await ensureUser(db, config, v.userId, ref);
      touchUserLastActiveByTg(db, v.userId);
    } catch (e) {
      res.status(500).json({ message: e instanceof Error ? e.message : "user_bootstrap" });
      return;
    }
    const accessToken = await signAccessToken(v.userId);
    const wallet = buildWalletForUser(v.userId);
    // #region agent log
    fetch("http://127.0.0.1:7557/ingest/485fc05c-6ee8-41f5-ad61-28b0be9e281f", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "9e63b5" },
      body: JSON.stringify({
        sessionId: "9e63b5",
        runId: "core-repro",
        hypothesisId: "H1",
        location: "backend/src/miniapp/miniappRoutes.ts:44",
        message: "auth wallet snapshot",
        data: {
          userId: v.userId,
          source: v.source,
          balanceUsdt: wallet.balanceUsdt,
          availableWithdrawUsdt: wallet.availableWithdrawUsdt,
          hasDepositAddress: Boolean(wallet.depositAddress),
          botTradingEnabled: wallet.botTradingEnabled,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    logEvent(String(res.locals.traceId ?? "no-trace"), "miniapp.auth.telegram", {
      user_id: v.userId,
      source: v.source
    });
    res.json({ accessToken, wallet });
  });

  app.get("/wallet", requireMiniappAuth, (req, res) => {
    res.json(buildWalletForUser(req.userId!));
  });

  app.get("/wallet/seed", requireMiniappAuth, async (req, res) => {
    const db = getDb();
    await ensureUser(db, config, req.userId!, null);
    res.json(buildWalletSeedPayload(req.userId!));
  });

  app.post("/wallet/deposit/confirm", requireMiniappAuth, (req, res) => {
    const trace = String(res.locals.traceId ?? "no-trace");
    const db = getDb();
    void (async () => {
      const out = await runDepositOnPaid(db, config, req.userId!, trace);
      // #region agent log
      fetch("http://127.0.0.1:7557/ingest/485fc05c-6ee8-41f5-ad61-28b0be9e281f", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "9e63b5" },
        body: JSON.stringify({
          sessionId: "9e63b5",
          runId: "core-repro",
          hypothesisId: "H2",
          location: "backend/src/miniapp/miniappRoutes.ts:67",
          message: "deposit confirm outcome",
          data: {
            userId: req.userId,
            type: out.type,
            status: out.status,
            error: "error" in out ? out.error : null,
            note: "note" in out ? out.note : null,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      if (out.type === "error") {
        res.status(out.status).json({ message: out.error });
        return;
      }
      if (out.type === "no_op") {
        res.status(204).end();
        return;
      }
      res.json({ ...buildWalletForUser(req.userId!) });
    })().catch((e) => {
      if (!res.headersSent) {
        res.status(500).json({ message: e instanceof Error ? e.message : "confirm failed" });
      }
    });
  });

  app.get("/wallet/history", requireMiniappAuth, (req, res) => {
    res.json(buildWalletHistoryForUser(req.userId!));
  });

  app.get("/notifications", requireMiniappAuth, (req, res) => {
    const db = getDb();
    const rawLimit = Number(req.query.limit);
    const limit = Number.isFinite(rawLimit) ? rawLimit : 20;
    const u = getUserByTg(db, req.userId!);
    if (!u) {
      res.json({ items: [], unreadCount: 0 });
      return;
    }
    res.json(buildNotificationsPayload(db, u.id, limit));
  });

  app.post("/notifications/read-all", requireMiniappAuth, (req, res) => {
    const db = getDb();
    const u = getUserByTg(db, req.userId!);
    if (!u) {
      res.json({ ok: true, unreadCount: 0 });
      return;
    }
    markAllUserNotificationsRead(db, u.id);
    res.json({ ok: true, unreadCount: 0 });
  });

  app.get("/trading/state", requireMiniappAuth, (req, res) => {
    const db = getDb();
    res.json({ botTradingEnabled: getBotTradingEnabled(db, req.userId!) });
  });

  app.post("/trading/state", requireMiniappAuth, (req, res) => {
    const enabled = req.body?.enabled === true;
    const db = getDb();
    const u = getUserByTg(db, req.userId!);
    if (!u) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    if (enabled && u.balance_usdt_minor <= 0) {
      res.status(409).json({ message: "Positive balance required to start accrual" });
      return;
    }
    setBotTradingEnabled(db, req.userId!, enabled);
    if (enabled) sibOnUserStart(db, u.id);
    else sibOnUserStop(db, u.id);
    fireTradingEngineNotify(req.userId!, enabled ? "start" : "stop", String(res.locals.traceId ?? "no-trace"));
    // #region agent log
    fetch("http://127.0.0.1:7557/ingest/485fc05c-6ee8-41f5-ad61-28b0be9e281f", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "9e63b5" },
      body: JSON.stringify({
        sessionId: "9e63b5",
        runId: "core-repro",
        hypothesisId: "H4",
        location: "backend/src/miniapp/miniappRoutes.ts:130",
        message: "trading state updated",
        data: {
          userId: req.userId,
          enabled,
          balanceMinor: u.balance_usdt_minor,
          hadPositiveBalance: u.balance_usdt_minor > 0,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    res.json({ ok: true, botTradingEnabled: enabled });
  });

  app.get("/trading/summary", requireMiniappAuth, async (req, res) => {
    const period = String(req.query.period ?? "24h");
    if (!isAllowedTradingPeriod(period)) {
      res.status(400).json({ message: "Invalid period" });
      return;
    }
    try {
      res.json(await buildTradingSummaryForUser(req.userId!));
    } catch (e) {
      res.status(500).json({ message: e instanceof Error ? e.message : "summary failed" });
    }
  });

  /** Журнал сделок: торговая система + SIB (результат % / дельта при закрытии). */
  app.get("/trading/journal", requireMiniappAuth, (req, res) => {
    const db = getDb();
    const rawLimit = Number(req.query.limit);
    const limit = Number.isFinite(rawLimit) ? Math.min(100, Math.max(1, Math.floor(rawLimit))) : 30;
    const period = String(req.query.period ?? "24h");
    if (!isAllowedTradingPeriod(period)) {
      res.status(400).json({ message: "Invalid period" });
      return;
    }
    const u = getUserByTg(db, req.userId!);
    try {
      const payload = !u
        ? buildTradingJournalEmptyPayload(limit, req.userId!, config, period)
        : buildTradingJournalPayload(db, u.id, req.userId!, limit, config, period);
      res.json(payload);
    } catch (e) {
      res.status(500).json({ message: e instanceof Error ? e.message : "journal failed" });
    }
  });

  app.post("/withdrawals", requireMiniappAuth, async (req, res) => {
    const address =
      typeof req.body?.address === "string"
        ? req.body.address.trim()
        : typeof req.body?.recipientAddress === "string"
          ? req.body.recipientAddress.trim()
          : "";
    const amountUsdt = Number(
      req.body?.amountUsdt ?? req.body?.amount_usdt ?? req.body?.amount
    );
    if (!address) {
      res.status(400).json({ message: "address is required" });
      return;
    }
    if (!Number.isFinite(amountUsdt) || amountUsdt <= 0) {
      res.status(400).json({ message: "amountUsdt must be a positive number" });
      return;
    }
    const amountMinor = Math.max(0, Math.round(amountUsdt * 100));
    const requestKey =
      typeof req.body?.requestKey === "string"
        ? req.body.requestKey.trim()
        : typeof req.body?.request_key === "string"
          ? req.body.request_key.trim()
          : "";
    if (amountMinor <= 0) {
      res.status(400).json({ message: "amount too small" });
      return;
    }
    const r = await createWithdrawal(
      getDb(),
      config,
      req.userId!,
      address,
      amountMinor,
      requestKey,
      String(res.locals.traceId ?? "miniapp-withdraw")
    );
    if (!r.ok) {
      const m =
        r.error === "invalid_tron_address"
          ? "Invalid TRON address"
          : r.error === "insufficient"
            ? "Insufficient available balance"
            : r.error === "withdraw_temporarily_unavailable"
              ? "Withdrawal is temporarily unavailable. Please try again later."
            : r.error === "below_min"
              ? "Amount below minimum"
              : "Cannot create withdrawal";
      res.status(r.error === "insufficient" || r.error === "withdraw_temporarily_unavailable" ? 409 : 400).json({ message: m });
      return;
    }
    logEvent(String(res.locals.traceId ?? "no-trace"), "miniapp.withdraw.create", {
      user_id: req.userId,
      request_id: r.id
    });
    res.status(r.dedup ? 200 : 201).json({ ok: true, id: r.id, dedup: r.dedup === true });
  });
}
