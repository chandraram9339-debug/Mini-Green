import type { Database } from "better-sqlite3";
import type { AppConfig } from "../config.js";
import { logEvent } from "../httpEnvelope.js";
import { getUserByTg } from "../repos/userRepo.js";
import {
  insertAlTradeFeedSnapshot,
  pruneAlTradeFeedSnapshots,
} from "../repos/alTradeFeedSnapshotRepo.js";
import {
  deleteTradePositionsByIds,
  getTradePositionById,
  listTradePositionsByUserId,
  upsertTradePosition,
} from "../repos/tradePositionRepo.js";
import { sibApplyClosesFromIngest } from "./sibBalance.js";

export type AlTradeFeedJson = {
  opens?: Array<{
    tradeNumber?: number;
    pair?: string;
    entryPrice?: number;
    time?: string;
  }>;
  closes?: Array<{
    tradeNumber?: number;
    pair?: string;
    exitPrice?: number;
    result?: number;
    time?: string;
  }>;
};

export type AlPollStatus = {
  last_ok_at: string | null;
  last_error: string | null;
  runs: number;
};

let pollStatus: AlPollStatus = {
  last_ok_at: null,
  last_error: null,
  runs: 0
};
let pollInFlight = false;

export function listMirrorTargetTgIds(db: Database, c: AppConfig): string[] {
  const explicit = c.alTradeFeedSyncTgIds.map((x) => String(x).trim()).filter(Boolean);
  const dynamic = (
    db
      .prepare(
        `SELECT tg_user_id
         FROM users
         WHERE bot_trading_enabled = 1
            OR balance_usdt_minor > 0
            OR (last_active_at IS NOT NULL AND last_active_at > datetime('now', '-30 days'))`,
      )
      .all() as Array<{ tg_user_id: string }>
  )
    .map((row) => String(row.tg_user_id).trim())
    .filter(Boolean);
  return [...new Set([...explicit, ...dynamic])];
}

export function getAlTradeFeedPollerStatus(): AlPollStatus {
  return { ...pollStatus };
}

function positionId(userId: number, tradeNumber: number, openedAt: string): string {
  const ts = Date.parse(openedAt);
  const suffix = Number.isFinite(ts)
    ? String(ts)
    : openedAt.replace(/[^0-9A-Za-z]+/g, "_").replace(/^_+|_+$/g, "");
  return `al_u${userId}_t${tradeNumber}_o${suffix}`;
}

function purgeStaleMirroredPositions(db: Database, userId: number, keepIds: Set<string>): number {
  const staleIds = listTradePositionsByUserId(db, userId)
    .map((r) => r.id)
    .filter((id) => id.startsWith(`al_u${userId}_t`) && !keepIds.has(id));
  if (staleIds.length === 0) return 0;
  db.prepare(
    `DELETE FROM sib_adjustments
     WHERE user_id = ?
       AND position_id IN (${staleIds.map(() => "?").join(",")})`,
  ).run(userId, ...staleIds);
  return deleteTradePositionsByIds(db, staleIds);
}

function sortByTime<T extends { time?: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const ta = Date.parse(String(a.time ?? ""));
    const tb = Date.parse(String(b.time ?? ""));
    const xa = Number.isFinite(ta) ? ta : 0;
    const xb = Number.isFinite(tb) ? tb : 0;
    return xa - xb;
  });
}

/** True when AL env suggests polling should run (startup log / admin hints). */
export function isAlTradeFeedConfigured(c: AppConfig): boolean {
  return (
    c.alTradeFeedEnabled &&
    Boolean(c.alTradeFeedBaseUrl.trim()) &&
    Boolean(c.alTradeFeedHttpUser) &&
    Boolean(c.alTradeFeedHttpPassword)
  );
}

/**
 * Fetch AL `/api/trade-feed` and mirror opens/closes for each configured Telegram user.
 */
export async function syncAlTradeFeedOnce(db: Database, c: AppConfig, trace: string): Promise<void> {
  if (!isAlTradeFeedConfigured(c)) {
    return;
  }

  const base = c.alTradeFeedBaseUrl.trim().replace(/\/$/, "");
  const url = `${base}/api/trade-feed`;
  const auth = Buffer.from(`${c.alTradeFeedHttpUser}:${c.alTradeFeedHttpPassword}`, "utf8").toString(
    "base64"
  );

  const ac = new AbortController();
  const to = setTimeout(() => ac.abort(), 45_000);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json"
      },
      signal: ac.signal
    });
  } catch (e) {
    clearTimeout(to);
    const msg = e instanceof Error ? e.message : String(e);
    pollStatus.last_error = msg;
    logEvent(trace, "al_trade_feed.fetch_fail", { url, error: msg });
    throw e;
  } finally {
    clearTimeout(to);
  }

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    const msg = `http ${res.status}${t ? `: ${t.slice(0, 200)}` : ""}`;
    pollStatus.last_error = msg;
    logEvent(trace, "al_trade_feed.http_err", { url, status: res.status });
    throw new Error(msg);
  }

  const raw = (await res.json()) as AlTradeFeedJson;
  const opensRaw = Array.isArray(raw.opens) ? raw.opens : [];
  const closesRaw = Array.isArray(raw.closes) ? raw.closes : [];

  const opens = sortByTime(opensRaw).filter((o) => {
    const n = Number(o.tradeNumber);
    const tm = String(o.time ?? "").trim();
    const pair = String(o.pair ?? "").trim();
    return Number.isFinite(n) && tm.length > 0 && !Number.isNaN(Date.parse(tm)) && pair.length > 0;
  });

  const closes = sortByTime(closesRaw).filter((cl) => {
    const n = Number(cl.tradeNumber);
    const tm = String(cl.time ?? "").trim();
    const pair = String(cl.pair ?? "").trim();
    const rp = Number(cl.result);
    return (
      Number.isFinite(n) &&
      tm.length > 0 &&
      !Number.isNaN(Date.parse(tm)) &&
      pair.length > 0 &&
      Number.isFinite(rp)
    );
  });

  /* GET /trading/al-trade-feed читает только последний снимок из БД — без записи миниапп не получает ленту. */
  try {
    insertAlTradeFeedSnapshot(db, {
      fetched_at: new Date().toISOString(),
      opens_n: opensRaw.length,
      closes_n: closesRaw.length,
      payload_json: JSON.stringify(raw),
    });
    if (c.alTradeFeedStoreSnapshots) {
      pruneAlTradeFeedSnapshots(db, c.alTradeFeedSnapshotRetentionDays, c.alTradeFeedSnapshotMaxRows);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logEvent(trace, "al_trade_feed.snapshot_store_failed", { error: msg.slice(0, 400) });
  }

  const openMeta = new Map<number, { pair: string; opened_at: string }>();
  for (const o of opens) {
    const tn = Number(o.tradeNumber);
    const pair = String(o.pair).trim().toUpperCase();
    const opened_at = String(o.time).trim();
    openMeta.set(tn, { pair, opened_at });
  }

  const notion = c.alPositionNotionalMinor;

  const targetTgIds = listMirrorTargetTgIds(db, c);
  for (const tg of targetTgIds) {
    const u = getUserByTg(db, tg);
    if (!u) {
      logEvent(trace, "al_trade_feed.skip_user", { tg_user_id: tg, reason: "not_found" });
      continue;
    }

    try {
      const keepIds = new Set<string>();
      for (const o of opens) {
        const tn = Number(o.tradeNumber);
        const pair = String(o.pair).trim().toUpperCase();
        const opened_at = String(o.time).trim();
        const pid = positionId(u.id, tn, opened_at);
        keepIds.add(pid);
        const existingOpen = getTradePositionById(db, pid);
        const ep = Number(o.entryPrice);
        upsertTradePosition(db, {
          id: pid,
          user_id: u.id,
          symbol: pair,
          side: "long",
          size_minor: notion,
          opened_at,
          closed_at: null,
          entry_price: Number.isFinite(ep) ? ep : existingOpen?.entry_price ?? null,
          exit_price: existingOpen?.exit_price ?? null,
          close_result_percent: existingOpen?.close_result_percent ?? null,
        });
      }

      for (const cl of closes) {
        const tn = Number(cl.tradeNumber);
        const pair = String(cl.pair ?? "").trim().toUpperCase();
        const closed_at = String(cl.time ?? "").trim();
        const meta = openMeta.get(tn);
        const opened_at = meta?.opened_at ?? closed_at;
        const sym = meta?.pair ?? pair;
        const pid = positionId(u.id, tn, opened_at);
        keepIds.add(pid);
        const existingClose = getTradePositionById(db, pid);
        const exPrice = Number(cl.exitPrice);
        const resPct = Number(cl.result);

        upsertTradePosition(db, {
          id: pid,
          user_id: u.id,
          symbol: sym,
          side: "long",
          size_minor: notion,
          opened_at,
          closed_at,
          entry_price: existingClose?.entry_price ?? null,
          exit_price: Number.isFinite(exPrice) ? exPrice : existingClose?.exit_price ?? null,
          close_result_percent: Number.isFinite(resPct) ? resPct : existingClose?.close_result_percent ?? null,
        });

        try {
          sibApplyClosesFromIngest(db, u.id, tg, [{ id: pid, result: Number(cl.result) }], trace);
        } catch (sibErr) {
          const sibMsg = sibErr instanceof Error ? sibErr.message : String(sibErr);
          logEvent(trace, "al_trade_feed.sib_apply_failed", {
            tg_user_id: tg,
            position_id: pid,
            error: sibMsg.slice(0, 300)
          });
        }
      }
      const purged = purgeStaleMirroredPositions(db, u.id, keepIds);
      if (purged > 0) {
        logEvent(trace, "al_trade_feed.purged_stale_positions", {
          tg_user_id: tg,
          purged,
        });
      }
    } catch (mirrorErr) {
      const m = mirrorErr instanceof Error ? mirrorErr.message : String(mirrorErr);
      logEvent(trace, "al_trade_feed.mirror_positions_failed", {
        tg_user_id: tg,
        error: m.slice(0, 400)
      });
    }
  }

  pollStatus.last_ok_at = new Date().toISOString();
  pollStatus.last_error = null;
  pollStatus.runs += 1;
  logEvent(trace, "al_trade_feed.sync_ok", {
    opens: opens.length,
    closes: closes.length,
    opens_raw: opensRaw.length,
    closes_raw: closesRaw.length,
    targets: targetTgIds.length,
  });
}

/**
 * Непрерывный опрос AL: следующий запрос через `interval` **после завершения** предыдущего
 * (не теряем тики, если синк дольше интервала). Цикл не останавливается, пока жив процесс.
 */
export function scheduleAlTradeFeedPoller(db: Database, c: AppConfig): void {
  const probe = {
    AL_TRADE_FEED_ENABLED: c.alTradeFeedEnabled,
    base_url_set: Boolean(c.alTradeFeedBaseUrl.trim()),
    http_user_set: Boolean(c.alTradeFeedHttpUser.trim()),
    http_password_set: Boolean(c.alTradeFeedHttpPassword?.length),
    store_snapshots_flag: c.alTradeFeedStoreSnapshots,
    poll_interval_ms: c.alTradeFeedPollIntervalMs,
    explicit_sync_tg_ids_count: c.alTradeFeedSyncTgIds.length,
  };
  console.log("[al-trade-feed] boot probe:", JSON.stringify(probe));

  if (!isAlTradeFeedConfigured(c)) {
    console.log(
      "[al-trade-feed] poller NOT started: need AL_TRADE_FEED_ENABLED=1 and AL_TRADE_FEED_BASE_URL, AL_TRADE_FEED_HTTP_USER, AL_TRADE_FEED_HTTP_PASSWORD (AL_TRADE_FEED_SYNC_TG_IDS only affects mirroring to users, not polling)",
    );
    return;
  }

  if (!c.alTradeFeedStoreSnapshots) {
    console.warn(
      "[al-trade-feed] AL_TRADE_FEED_STORE_SNAPSHOTS=0: retention pruning disabled; snapshots are still written so GET /trading/al-trade-feed works.",
    );
  }

  const ms = c.alTradeFeedPollIntervalMs;
  console.log(
    `[al-trade-feed] poller started: ${c.alTradeFeedBaseUrl}/api/trade-feed; interval ${ms}ms after each sync; explicit tg ids: ${c.alTradeFeedSyncTgIds.join(", ") || "(none — mirror targets may still come from DB)"}`,
  );

  const scheduleNext = (delay: number) => {
    setTimeout(() => {
      if (pollInFlight) {
        scheduleNext(250);
        return;
      }
      pollInFlight = true;
      const tr = `al-feed:${Date.now()}`;
      void syncAlTradeFeedOnce(db, c, tr)
        .catch(() => {
          /* logged */
        })
        .finally(() => {
          pollInFlight = false;
          scheduleNext(ms);
        });
    }, delay);
  };

  scheduleNext(0);
}
