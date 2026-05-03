import { apiFetch } from "./http";
import type { AlStatePayload } from "./alStateTypes";

function readFinite(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const x = Number.parseFloat(value.trim().replace(/%/g, ""));
    if (Number.isFinite(x)) return x;
  }
  return null;
}

function readBool(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1" || value === "true") return true;
  if (value === 0 || value === "0" || value === "false") return false;
  return null;
}

function readActiveTrade(raw: unknown): AlStatePayload["activeTrade"] {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const tn = readFinite(o.tradeNumber ?? o.trade_number);
  const pair = typeof o.pair === "string" ? o.pair.trim() : "";
  const entryPrice = readFinite(o.entryPrice ?? o.entry_price);
  const currentPrice = readFinite(o.currentPrice ?? o.current_price);
  const currentChangePercent =
    readFinite(o.currentChangePercent ?? o.current_change_percent ?? o.changePercent) ?? 0;
  const openTime = String(o.openTime ?? o.open_time ?? o.time ?? "").trim();
  const exp = o.expiresAt ?? o.expires_at;
  let expiresAt: string | null = null;
  if (exp != null && exp !== "") {
    const es = typeof exp === "string" ? exp.trim() : String(exp);
    if (es && !Number.isNaN(Date.parse(es))) expiresAt = es;
  }

  if (
    tn == null ||
    !pair ||
    entryPrice == null ||
    currentPrice == null ||
    !openTime ||
    Number.isNaN(Date.parse(openTime))
  ) {
    return null;
  }

  return {
    tradeNumber: Math.round(tn),
    pair,
    entryPrice,
    currentPrice,
    currentChangePercent,
    openTime,
    expiresAt,
  };
}

function parseAlState(json: unknown): AlStatePayload | null {
  if (!json || typeof json !== "object") return null;
  const r = json as Record<string, unknown>;
  const configured = typeof r.configured === "boolean" ? r.configured : false;
  const fetched_at =
    r.fetched_at == null || r.fetched_at === "" ? null : String(r.fetched_at);
  const isRunning = readBool(r.isRunning ?? r.is_running ?? r.botRunning);
  const activeTrade = readActiveTrade(r.activeTrade ?? r.active_trade);

  return {
    configured,
    fetched_at,
    isRunning,
    activeTrade,
  };
}

export type FetchAlStateResult = { ok: true; data: AlStatePayload } | { ok: false; error: string };

/** Интервал опроса GET /trading/al-state (мс): по умолчанию 5000, 3000–30000. */
export function alStatePollIntervalMs(): number {
  const raw = import.meta.env.VITE_AL_STATE_POLL_MS;
  if (raw == null || String(raw).trim() === "") return 5000;
  const n = Number(raw);
  if (!Number.isFinite(n)) return 5000;
  return Math.min(30_000, Math.max(3000, Math.floor(n)));
}

export function formatAlStateDisplayPrice(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).replace(/,/g, " ");
}

/** Как на бэкенде `normalizeUiPair` — для подписи к цене. */
export function formatAlStatePricePair(pair: string): string {
  const upper = pair.trim().toUpperCase();
  if (!upper) return "USDT/BTC";
  if (upper.includes("/")) return upper;
  const quotes = ["USDT", "USDC", "BUSD", "BTC", "ETH", "BNB"] as const;
  for (const q of quotes) {
    if (upper.endsWith(q) && upper.length > q.length) {
      return `${q}/${upper.slice(0, -q.length)}`;
    }
  }
  return upper;
}

export async function fetchAlStateSnapshot(): Promise<FetchAlStateResult> {
  const path = import.meta.env.VITE_API_AL_STATE_PATH ?? "/trading/al-state";
  try {
    const res = await apiFetch(path, { method: "GET" });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return { ok: false, error: `HTTP ${res.status}${t ? `: ${t.slice(0, 200)}` : ""}` };
    }
    const json: unknown = await res.json();
    const data = parseAlState(json);
    if (!data) return { ok: false, error: "invalid_json" };
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
