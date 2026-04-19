import type { Database } from "better-sqlite3";
import type { AppConfig } from "../config.js";
import { logEvent } from "../httpEnvelope.js";
import { getUserByTg } from "../repos/userRepo.js";
import { getTradePositionById, upsertTradePosition } from "../repos/tradePositionRepo.js";
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

export function getAlTradeFeedPollerStatus(): AlPollStatus {
  return { ...pollStatus };
}

function positionId(userId: number, tradeNumber: number): string {
  return `al_u${userId}_t${tradeNumber}`;
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
    Boolean(c.alTradeFeedHttpPassword) &&
    c.alTradeFeedSyncTgIds.length > 0
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

  const openMeta = new Map<number, { pair: string; opened_at: string }>();
  for (const o of opens) {
    const tn = Number(o.tradeNumber);
    const pair = String(o.pair).trim().toUpperCase();
    const opened_at = String(o.time).trim();
    openMeta.set(tn, { pair, opened_at });
  }

  const notion = c.alPositionNotionalMinor;

  for (const tg of c.alTradeFeedSyncTgIds) {
    const u = getUserByTg(db, tg);
    if (!u) {
      logEvent(trace, "al_trade_feed.skip_user", { tg_user_id: tg, reason: "not_found" });
      continue;
    }

    for (const o of opens) {
      const tn = Number(o.tradeNumber);
      const pair = String(o.pair).trim().toUpperCase();
      const opened_at = String(o.time).trim();
      const pid = positionId(u.id, tn);
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
      const pid = positionId(u.id, tn);
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

      sibApplyClosesFromIngest(db, u.id, tg, [{ id: pid, result: Number(cl.result) }], trace);
    }
  }

  pollStatus.last_ok_at = new Date().toISOString();
  pollStatus.last_error = null;
  pollStatus.runs += 1;
  logEvent(trace, "al_trade_feed.sync_ok", {
    opens: opens.length,
    closes: closes.length,
    targets: c.alTradeFeedSyncTgIds.length
  });
}

export function scheduleAlTradeFeedPoller(db: Database, c: AppConfig): void {
  if (!isAlTradeFeedConfigured(c)) {
    console.log(
      "[al-trade-feed] disabled or incomplete env (need AL_TRADE_FEED_ENABLED=1, URL, HTTP user/pass, AL_TRADE_FEED_SYNC_TG_IDS)"
    );
    return;
  }

  const ms = c.alTradeFeedPollIntervalMs;
  console.log(
    `[al-trade-feed] polling ${c.alTradeFeedBaseUrl}/api/trade-feed every ${ms}ms for tg ids: ${c.alTradeFeedSyncTgIds.join(", ")}`
  );

  const tick = () => {
    if (pollInFlight) return;
    pollInFlight = true;
    const tr = `al-feed:${Date.now()}`;
    void syncAlTradeFeedOnce(db, c, tr)
      .catch(() => {
        /* logged */
      })
      .finally(() => {
        pollInFlight = false;
      });
  };

  tick();
  setInterval(tick, ms);
}
