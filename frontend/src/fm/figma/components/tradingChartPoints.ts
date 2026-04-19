import type { TradingJournalItem } from "../../api/fetchTradingJournal";

export type GraphicPoint = {
  occurred_at: string;
  value_pct: number;
};

export function buildCompoundedChartPoints(rows: TradingJournalItem[]): GraphicPoint[] {
  const closed = rows
    .filter(
      (row) =>
        row.status === "closed" &&
        row.closed_at &&
        row.result_percent != null &&
        Number.isFinite(row.result_percent),
    )
    .sort((a, b) => Date.parse(String(a.closed_at)) - Date.parse(String(b.closed_at)));

  if (closed.length === 0) return [];

  let compounded = 1;
  return closed.map((row) => {
    compounded *= 1 + Number(row.result_percent) / 100;
    return {
      occurred_at: String(row.closed_at),
      value_pct: (compounded - 1) * 100,
    };
  });
}
