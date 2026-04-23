import type { HistoryListRowUi, TabHistoryBundle, WalletHistoryBundle } from "./typesHistory";

function num(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const x = Number.parseFloat(v.replace(",", "."));
    if (Number.isFinite(x)) return x;
  }
  return undefined;
}

function formatMain(tab: "deposit" | "withdraw" | "referral", value: number): string {
  const a = Math.abs(value);
  const s = a.toFixed(2);
  if (tab === "withdraw") return `-${s}`;
  if (value < 0) return `-${a.toFixed(2)}`;
  return `+${s}`;
}

function formatFee(fee: number | undefined): string {
  if (fee === undefined || !Number.isFinite(fee) || fee === 0) return "—";
  if (fee < 0) return fee.toFixed(2);
  return `-${Math.abs(fee).toFixed(2)}`;
}

function parseItem(
  o: Record<string, unknown>,
  tab: "deposit" | "withdraw" | "referral",
  defaultTitle: string,
): HistoryListRowUi | null {
  const mainRaw =
    num(o.amount) ??
    num(o.amountUsdt) ??
    num(o.amount_usdt) ??
    num((o as { value?: unknown }).value);
  if (mainRaw === undefined) return null;
  const feeN = num(o.fee) ?? num(o.commission) ?? 0;
  const id = String(
    o.id ?? o.txId ?? o.tx_id ?? o.txHash ?? o.externalId ?? o.reference ?? "—",
  );
  const dateRaw = String(
    o.date ?? o.createdAt ?? o.created_at ?? o.time ?? o.timestamp ?? "",
  ).replace("T", " ");
  const dateSafe = (dateRaw.split(".")[0] || dateRaw) || "—";
  const title = String(o.title ?? o.type ?? o.label ?? defaultTitle);

  return {
    main: formatMain(tab, mainRaw),
    fee: formatFee(feeN),
    id: id.length > 32 ? `${id.slice(0, 16)}...` : id,
    date: dateSafe,
    title,
    i18nTitleKey: undefined,
  };
}

function parseItemArray(
  items: unknown,
  tab: "deposit" | "withdraw" | "referral",
  defaultTitle: string,
): HistoryListRowUi[] {
  if (!Array.isArray(items)) return [];
  const out: HistoryListRowUi[] = [];
  for (const it of items) {
    if (!it || typeof it !== "object") continue;
    const row = parseItem(it as Record<string, unknown>, tab, defaultTitle);
    if (row) out.push(row);
  }
  return out;
}

function sumMainsFromRows(tab: "deposit" | "withdraw" | "referral", rows: HistoryListRowUi[]): number {
  let sum = 0;
  for (const r of rows) {
    const n = Number.parseFloat(r.main.replace(/^[+−\-]/, ""));
    if (!Number.isFinite(n)) continue;
    const amount = Math.abs(n);
    if (tab === "deposit") {
      // Show net credited amount: deposit minus commission
      const feeRaw = r.fee === "—" ? "0" : r.fee.replace(/^[+−\-]/, "");
      const feeN = Number.parseFloat(feeRaw);
      const fee = Number.isFinite(feeN) ? feeN : 0;
      sum += Math.max(0, amount - fee);
    } else {
      sum += amount;
    }
  }
  return sum;
}

function buildTab(
  block: unknown,
  tab: "deposit" | "withdraw" | "referral",
  defaultTitle: string,
): TabHistoryBundle {
  if (!block || typeof block !== "object") {
    return { rows: [], totalAmount: 0, count: 0 };
  }
  const b = block as Record<string, unknown>;
  const items = b.items ?? b.rows ?? b.operations ?? b.list ?? b.data;
  const rows = parseItemArray(items, tab, defaultTitle);
  const count = Number(b.count ?? b.totalCount) || rows.length;
  const explicit = num(b.total) ?? num(b.totalAmount) ?? num(b.total_usdt) ?? num(b.sum);
  const totalFromRows = rows.length > 0 ? sumMainsFromRows(tab, rows) : 0;
  const totalAmount = explicit !== undefined && explicit > 0 ? Math.abs(explicit) : totalFromRows;
  return { rows, totalAmount, count: Math.max(count, rows.length) };
}

function pick(obj: Record<string, unknown>, ...candidates: string[]): unknown {
  for (const c of candidates) {
    if (c in obj && obj[c] !== undefined) return obj[c];
  }
  return undefined;
}

/** Плоский список с type/kind. */
function parseFlatItems(arr: unknown[]): WalletHistoryBundle | null {
  const d: HistoryListRowUi[] = [];
  const w: HistoryListRowUi[] = [];
  const r: HistoryListRowUi[] = [];
  for (const it of arr) {
    if (!it || typeof it !== "object") continue;
    const rec = it as Record<string, unknown>;
    const t = String(rec.type ?? rec.kind ?? "").toLowerCase();
    if (t.includes("with")) {
      const row = parseItem(rec, "withdraw", "Withdrawal");
      if (row) w.push(row);
    } else if (t.includes("referr")) {
      const row2 = parseItem(rec, "referral", "Referral bonus");
      if (row2) r.push(row2);
    } else {
      const row3 = parseItem(rec, "deposit", "Replenishment");
      if (row3) d.push(row3);
    }
  }
  if (d.length === 0 && w.length === 0 && r.length === 0) return null;
  return {
    deposit: {
      rows: d,
      totalAmount: d.length ? sumMainsFromRows("deposit", d) : 0,
      count: d.length,
    },
    withdraw: {
      rows: w,
      totalAmount: w.length ? sumMainsFromRows("withdraw", w) : 0,
      count: w.length,
    },
    referral: {
      rows: r,
      totalAmount: r.length ? sumMainsFromRows("referral", r) : 0,
      count: r.length,
    },
  };
}

/** Разбор ответа: сгруппированные поля или плоский список. */
export function parseWalletHistoryPayload(root: unknown): WalletHistoryBundle | null {
  if (root == null) return null;
  let o: Record<string, unknown>;
  if (Array.isArray(root)) {
    return parseFlatItems(root);
  }
  if (typeof root === "object") o = root as Record<string, unknown>;
  else return null;
  if (o.data && typeof o.data === "object") o = o.data as Record<string, unknown>;
  if (o.result && typeof o.result === "object") o = o.result as Record<string, unknown>;

  if (Array.isArray(o as unknown)) {
    return parseFlatItems(o as unknown as unknown[]);
  }

  const d = pick(o, "deposit", "deposits", "depositsHistory", "deposits_history");
  const w = pick(o, "withdraw", "withdraws", "withdrawals", "withdrawsHistory");
  const re = pick(o, "referral", "referrals", "referralHistory");

  if (d === undefined && w === undefined && re === undefined) return null;

  const dep = buildTab(d, "deposit", "Replenishment");
  const wit = buildTab(w, "withdraw", "Withdrawal");
  const ref = buildTab(re, "referral", "Referral bonus");

  return { deposit: dep, withdraw: wit, referral: ref };
}
