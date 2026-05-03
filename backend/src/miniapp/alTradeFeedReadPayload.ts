import type { Database } from "better-sqlite3";
import type { AppConfig } from "../config.js";
import { getLatestAlTradeFeedSnapshot } from "../repos/alTradeFeedSnapshotRepo.js";
import { isAlTradeFeedConfigured } from "../services/alTradeFeedSync.js";

/** Санитизированные строки для миниаппа (без секретов). */
export type TradeFeedOpenDto = {
  tradeNumber: number;
  pair: string;
  entryPrice: number;
  time: string;
};

export type TradeFeedCloseDto = {
  tradeNumber: number;
  pair: string;
  exitPrice: number;
  result: number;
  time: string;
};

function parseOpens(arr: unknown[]): TradeFeedOpenDto[] {
  const out: TradeFeedOpenDto[] = [];
  for (const x of arr) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    const tn = Number(o.tradeNumber);
    const pair = String(o.pair ?? "").trim();
    const ep = Number(o.entryPrice);
    const time = String(o.time ?? "").trim();
    if (!Number.isFinite(tn) || !pair || !Number.isFinite(ep) || Number.isNaN(Date.parse(time))) continue;
    out.push({ tradeNumber: tn, pair, entryPrice: ep, time });
  }
  return out;
}

function parseCloses(arr: unknown[]): TradeFeedCloseDto[] {
  const out: TradeFeedCloseDto[] = [];
  for (const x of arr) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    const tn = Number(o.tradeNumber);
    const pair = String(o.pair ?? "").trim();
    const xp = Number(o.exitPrice);
    const res = Number(o.result);
    const time = String(o.time ?? "").trim();
    if (
      !Number.isFinite(tn) ||
      !pair ||
      !Number.isFinite(xp) ||
      !Number.isFinite(res) ||
      Number.isNaN(Date.parse(time))
    ) {
      continue;
    }
    out.push({ tradeNumber: tn, pair, exitPrice: xp, result: res, time });
  }
  return out;
}

/**
 * Последний снимок trade-feed из БД (пишется поллером `syncAlTradeFeedOnce`).
 * Фронт не ходит на внешний AL с Basic Auth — только сюда.
 */
export function buildAlTradeFeedReadPayload(db: Database, cfg: AppConfig): {
  opens: TradeFeedOpenDto[];
  closes: TradeFeedCloseDto[];
  fetched_at: string | null;
  configured: boolean;
} {
  const configured = isAlTradeFeedConfigured(cfg);
  const snap = getLatestAlTradeFeedSnapshot(db);
  if (!snap?.payload_json?.trim()) {
    return { opens: [], closes: [], fetched_at: snap?.fetched_at ?? null, configured };
  }
  try {
    const raw = JSON.parse(snap.payload_json) as { opens?: unknown[]; closes?: unknown[] };
    const opens = parseOpens(Array.isArray(raw.opens) ? raw.opens : []);
    const closes = parseCloses(Array.isArray(raw.closes) ? raw.closes : []);
    return { opens, closes, fetched_at: snap.fetched_at, configured };
  } catch {
    return { opens: [], closes: [], fetched_at: snap.fetched_at, configured };
  }
}
