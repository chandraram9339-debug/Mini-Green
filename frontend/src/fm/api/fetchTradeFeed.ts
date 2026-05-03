import { apiFetch } from "./http";
import type { TradeFeedPayload } from "./tradeFeedTypes";

function parsePayload(json: unknown): TradeFeedPayload | null {
  if (!json || typeof json !== "object") return null;
  const r = json as Record<string, unknown>;
  const opensRaw = r.opens;
  const closesRaw = r.closes;
  const opens: TradeFeedPayload["opens"] = [];
  const closes: TradeFeedPayload["closes"] = [];

  if (Array.isArray(opensRaw)) {
    for (const x of opensRaw) {
      if (!x || typeof x !== "object") continue;
      const o = x as Record<string, unknown>;
      const tn = Number(o.tradeNumber);
      const pair = String(o.pair ?? "").trim();
      const ep = Number(o.entryPrice);
      const time = String(o.time ?? "").trim();
      if (!Number.isFinite(tn) || !pair || !Number.isFinite(ep) || Number.isNaN(Date.parse(time))) continue;
      opens.push({ tradeNumber: tn, pair, entryPrice: ep, time });
    }
  }

  if (Array.isArray(closesRaw)) {
    for (const x of closesRaw) {
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
      closes.push({ tradeNumber: tn, pair, exitPrice: xp, result: res, time });
    }
  }

  const fetched_at =
    r.fetched_at == null || r.fetched_at === "" ? null : String(r.fetched_at);
  const configured = typeof r.configured === "boolean" ? r.configured : false;

  return { opens, closes, fetched_at, configured };
}

export type FetchTradeFeedResult =
  | { ok: true; data: TradeFeedPayload }
  | { ok: false; error: string };

/** Интервал опроса снимка trade-feed на фронте (мс). По умолчанию 5 с, мин 3 с, макс 30 с. */
export function tradeFeedPollIntervalMs(): number {
  const raw = import.meta.env.VITE_AL_TRADE_FEED_POLL_MS;
  if (raw == null || String(raw).trim() === "") return 5000;
  const n = Number(raw);
  if (!Number.isFinite(n)) return 5000;
  return Math.min(30_000, Math.max(3000, Math.floor(n)));
}

/**
 * Санитизированный trade-feed через бэкенд (Bearer). Путь задаётся env.
 * Учётные данные AL не используются на клиенте.
 */
export async function fetchTradeFeedSnapshot(): Promise<FetchTradeFeedResult> {
  const pathTemplate = import.meta.env.VITE_API_TRADE_FEED_PATH ?? "/trading/al-trade-feed";
  try {
    const res = await apiFetch(pathTemplate, { method: "GET" });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return { ok: false, error: `HTTP ${res.status}${t ? `: ${t.slice(0, 200)}` : ""}` };
    }
    const json: unknown = await res.json();
    const data = parsePayload(json);
    if (!data) return { ok: false, error: "invalid_json" };
    return { ok: true, data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
