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

export type ChartGeom = {
  isEmpty: boolean;
  pathLine: string;
  pathArea: string;
  yLabels: string[];
};

const STATIC_Y_LABELS = ["7.00%","6.00%","5.00%","4.00%","3.00%","2.00%","1.00%","0.00%","-1.00%","-2.00%"];

/**
 * Converts GraphicPoints into SVG path strings and Y-axis labels.
 * viewBox: "0 0 325 122"
 */
export function buildChartGeom(points: GraphicPoint[]): ChartGeom {
  const W = 325, H = 122;

  if (points.length === 0) {
    return { isEmpty: true, pathLine: "", pathArea: "", yLabels: STATIC_Y_LABELS };
  }

  const sorted = [...points].sort((a, b) => Date.parse(a.occurred_at) - Date.parse(b.occurred_at));
  const vals = sorted.map((p) => p.value_pct);
  const ts   = sorted.map((p) => Date.parse(p.occurred_at));

  const minV0 = Math.min(0, ...vals);
  const maxV0 = Math.max(0, ...vals);
  const spanV = Math.max(0.5, maxV0 - minV0);
  const padV  = spanV * 0.18;
  const minV  = minV0 - padV;
  const maxV  = maxV0 + padV;

  const t0    = ts[0]!;
  const t1    = ts[ts.length - 1]!;
  const spanT = Math.max(t1 - t0, 1);

  const coords: Array<[number, number]> = sorted.map((p, i) => {
    const x   = ((ts[i]! - t0) / spanT) * W;
    const norm = (p.value_pct - minV) / Math.max(maxV - minV, 0.0001);
    const y   = H - norm * H;
    return [x, y];
  });

  if (coords.length === 1) coords.push([W, coords[0]![1]]);

  const pts  = coords.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`);
  const pathLine = `M ${pts[0]}` + pts.slice(1).map((p) => ` L ${p}`).join("");
  const first = coords[0]!;
  const last  = coords[coords.length - 1]!;
  const pathArea = `${pathLine} L ${last[0].toFixed(2)} ${H} L ${first[0].toFixed(2)} ${H} Z`;

  const yLabels = Array.from({ length: 10 }, (_, i) => {
    const v = maxV - (i * (maxV - minV)) / 9;
    return `${v.toFixed(2)}%`;
  });

  return { isEmpty: false, pathLine, pathArea, yLabels };
}
