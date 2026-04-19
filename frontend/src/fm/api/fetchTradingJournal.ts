import { apiFetch } from "./http";

export type TradingJournalMeta = {
  limit: number;
  returned: number;
  positions_total: number;
  positions_open: number;
  positions_closed: number;
  al_feed_configured: boolean;
  al_sync_includes_user: boolean;
  al_last_ok_at: string | null;
  al_last_error: string | null;
  al_poller_runs: number;
};

export type TradingJournalItem = {
  id: string;
  symbol: string;
  side: string;
  size_minor: number;
  opened_at: string;
  closed_at: string | null;
  status: "open" | "closed";
  entry_price: number | null;
  exit_price: number | null;
  result_percent: number | null;
  delta_minor: number | null;
};

export type TradingJournalResponse = {
  items: TradingJournalItem[];
  meta: TradingJournalMeta | null;
};

function parseMeta(raw: unknown): TradingJournalMeta | null {
  if (raw == null || typeof raw !== "object") return null;
  const m = raw as Record<string, unknown>;
  if (
    typeof m.limit !== "number" ||
    typeof m.returned !== "number" ||
    typeof m.positions_total !== "number" ||
    typeof m.positions_open !== "number" ||
    typeof m.positions_closed !== "number" ||
    typeof m.al_feed_configured !== "boolean" ||
    typeof m.al_sync_includes_user !== "boolean" ||
    typeof m.al_poller_runs !== "number"
  ) {
    return null;
  }
  return {
    limit: m.limit,
    returned: m.returned,
    positions_total: m.positions_total,
    positions_open: m.positions_open,
    positions_closed: m.positions_closed,
    al_feed_configured: m.al_feed_configured,
    al_sync_includes_user: m.al_sync_includes_user,
    al_last_ok_at: m.al_last_ok_at == null ? null : String(m.al_last_ok_at),
    al_last_error: m.al_last_error == null ? null : String(m.al_last_error),
    al_poller_runs: m.al_poller_runs,
  };
}

/** Журнал сделок (`trade_positions` + SIB). GET `/trading/journal` с полем `meta` для отладки связки. */
export async function fetchTradingJournal(limit = 30): Promise<TradingJournalResponse> {
  const pathTemplate = import.meta.env.VITE_API_TRADING_JOURNAL_PATH ?? "/trading/journal";
  const sep = pathTemplate.includes("?") ? "&" : "?";
  const url = `${pathTemplate}${sep}limit=${encodeURIComponent(String(limit))}`;
  const res = await apiFetch(url, { method: "GET" });
  if (!res.ok) return { items: [], meta: null };
  const json: unknown = await res.json();
  if (!json || typeof json !== "object") return { items: [], meta: null };
  const root = json as Record<string, unknown>;
  const items = root.items;
  const meta = parseMeta(root.meta);
  if (!Array.isArray(items)) return { items: [], meta };
  const out: TradingJournalItem[] = [];
  for (const x of items) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id : "";
    if (!id) continue;
    const rp = o.result_percent;
    const rpNum = typeof rp === "number" && Number.isFinite(rp) ? rp : null;
    const dm = o.delta_minor;
    const dmNum =
      dm != null && typeof dm === "number" && Number.isFinite(dm) ? Math.round(dm as number) : null;
    const ep = o.entry_price;
    const xp = o.exit_price;
    out.push({
      id,
      symbol: String(o.symbol ?? ""),
      side: String(o.side ?? ""),
      size_minor: Number(o.size_minor) || 0,
      opened_at: String(o.opened_at ?? ""),
      closed_at: o.closed_at != null && String(o.closed_at).trim() !== "" ? String(o.closed_at) : null,
      status: o.status === "closed" ? "closed" : "open",
      entry_price: ep != null && typeof ep === "number" && Number.isFinite(ep) ? ep : null,
      exit_price: xp != null && typeof xp === "number" && Number.isFinite(xp) ? xp : null,
      result_percent: rpNum,
      delta_minor: dmNum,
    });
  }
  return { items: out, meta };
}
