import type express from "express";
import { config } from "./config.js";
import { getDb } from "./db/connection.js";
import { logEvent, sendError, sendSuccess } from "./httpEnvelope.js";
import { getUserByTg, setBotTradingEnabled } from "./repos/userRepo.js";
import { getTradePositionById, upsertTradePosition } from "./repos/tradePositionRepo.js";
import { sibApplyClosesFromIngest } from "./services/sibBalance.js";

/**
 * Incoming sync from external trading engine (your other service).
 *
 * POST /hooks/trading/v1/ingest
 * Header: X-Trading-Secret (must match TRADING_INGEST_SECRET)
 *
 * Body JSON:
 * {
 *   "tg_user_id": "123456789",
 *   "bot_trading_enabled": true,
 *   "upsert_positions": [
 *     {
 *       "id": "engine-trade-uuid",
 *       "symbol": "ETHUSDT",
 *       "side": "long",
 *       "size_minor": 250000,
 *       "opened_at": "2026-04-16T12:00:00.000Z",
 *       "closed_at": null
 *     }
 *   ],
 *   "closes": [ { "id": "engine-trade-uuid", "result": 1.5 } ]
 * }
 *
 * SIB: `closes[].result` — процент к балансу на момент применения: `round(balance * result / 100)`.
 */
export function registerTradingIngest(app: express.Express) {
  app.post("/hooks/trading/v1/ingest", (req, res) => {
    const secret = String(req.headers["x-trading-secret"] ?? "");
    if (!config.tradingIngestSecret || secret !== config.tradingIngestSecret) {
      sendError(res, 401, "UNAUTHORIZED", "Invalid or missing X-Trading-Secret");
      return;
    }

    const tr = String(res.locals.traceId ?? "trading-ingest");
    const body = req.body as {
      tg_user_id?: string;
      bot_trading_enabled?: boolean;
      upsert_positions?: Array<{
        id?: string;
        symbol?: string;
        side?: string;
        size_minor?: number;
        opened_at?: string;
        closed_at?: string | null;
      }>;
      closes?: Array<{ id?: string; result?: number }>;
    };

    const tg = String(body.tg_user_id ?? "").trim();
    if (!tg) {
      sendError(res, 400, "TG_REQUIRED", "tg_user_id is required");
      return;
    }

    const db = getDb();
    const u = getUserByTg(db, tg);
    if (!u) {
      sendError(res, 404, "USER_NOT_FOUND", "User not found (must exist in DB)");
      return;
    }

    if (typeof body.bot_trading_enabled === "boolean") {
      setBotTradingEnabled(db, tg, body.bot_trading_enabled);
    }

    let applied = 0;
    const list = body.upsert_positions;
    if (Array.isArray(list)) {
      for (const p of list) {
        const id = String(p.id ?? "").trim();
        const sym = String(p.symbol ?? "").trim().toUpperCase();
        const sideRaw = String(p.side ?? "").toLowerCase();
        const side = sideRaw === "short" ? "short" : "long";
        const sm = Math.round(Number(p.size_minor));
        const oa = String(p.opened_at ?? "").trim();
        if (!id || !sym || !Number.isFinite(sm) || sm <= 0 || !oa || Number.isNaN(Date.parse(oa))) {
          logEvent(tr, "trading.ingest.skip", { id, reason: "invalid_row" });
          continue;
        }
        let closedAt: string | null = null;
        if (p.closed_at != null && String(p.closed_at).trim() !== "") {
          const c = String(p.closed_at);
          if (Number.isNaN(Date.parse(c))) {
            logEvent(tr, "trading.ingest.skip", { id, reason: "bad_closed_at" });
            continue;
          }
          closedAt = c;
        }
        const existing = getTradePositionById(db, id);
        upsertTradePosition(db, {
          id,
          user_id: u.id,
          symbol: sym,
          side,
          size_minor: sm,
          opened_at: oa,
          closed_at: closedAt,
          entry_price: existing?.entry_price ?? null,
          exit_price: existing?.exit_price ?? null,
          close_result_percent: existing?.close_result_percent ?? null,
        });
        applied += 1;
      }
    }

    let sibApplied = 0;
    let sibSkipped = 0;
    const closes = body.closes;
    if (Array.isArray(closes) && closes.length > 0) {
      const r = sibApplyClosesFromIngest(db, u.id, tg, closes, tr);
      sibApplied = r.applied;
      sibSkipped = r.skipped;
    }

    logEvent(tr, "trading.ingest.ok", {
      tg_user_id: tg,
      applied,
      sib_applied: sibApplied,
      sib_skipped: sibSkipped
    });
    sendSuccess(res, { ok: true, applied, sib_applied: sibApplied, sib_skipped: sibSkipped });
  });
}
