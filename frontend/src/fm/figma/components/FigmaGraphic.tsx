import { useEffect, useState, type CSSProperties } from "react";

import { homeAssets } from "../home/homeAssets";
import type { GraphicPoint } from "./tradingChartPoints";
import { getSynchronizedAnimationDelay } from "./syncAnimation";

export type GraphicChartAssets = {
  vector25: string;
  line: string;
};

type FigmaGraphicProps = {
  chart?: GraphicChartAssets;
  points?: GraphicPoint[];
  animate?: boolean;
};

const CHART_SCALES = [
  "7.00%",
  "6.00%",
  "5.00%",
  "4.00%",
  "3.00%",
  "2.00%",
  "1.00%",
  "0.00%",
  "-1.00%",
  "-2.00%",
];

/**
 * Performance chart — узел 1:3505 из эталона `home__full-screen__1-3644.tsx`.
 * Разметка: шкала absolute left-0 top-0; линия графика absolute left-[25px] top-[42px] поверх сетки.
 *
 * Прим.: графику на экранах не дорабатываем до отдельной задачи «полная реализация графики» — только связанный с этим блоком рефакторинг/правки верстки вне графика.
 */
function formatScaleLabel(v: number): string {
  return `${v.toFixed(2)}%`;
}

function buildPercentChartGeom(points: GraphicPoint[]) {
  const plotLeft = 0;
  const plotRight = 325;
  const plotTop = 0;
  const plotBottom = 123;

  if (points.length === 0) {
    return {
      isEmpty: true,
      pathLine: "",
      pathArea: "",
      dots: [] as Array<[number, number]>,
      yLabels: CHART_SCALES,
    };
  }

  const sorted = [...points].sort((a, b) => Date.parse(a.occurred_at) - Date.parse(b.occurred_at));
  const vals = sorted.map((p) => p.value_pct);
  const ts = sorted.map((p) => Date.parse(p.occurred_at));
  const minV0 = Math.min(0, ...vals);
  const maxV0 = Math.max(0, ...vals);
  const spanV = Math.max(0.5, maxV0 - minV0);
  const padV = spanV * 0.18;
  const minV = minV0 - padV;
  const maxV = maxV0 + padV;
  const t0 = ts[0]!;
  const t1 = ts[ts.length - 1]!;
  const spanT = Math.max(t1 - t0, 1);

  const coords: Array<[number, number]> = sorted.map((p, i) => {
    const ti = ts[i]!;
    const x = plotLeft + ((ti - t0) / spanT) * (plotRight - plotLeft);
    const norm = (p.value_pct - minV) / Math.max(maxV - minV, 0.0001);
    const y = plotBottom - norm * (plotBottom - plotTop);
    return [x, y];
  });

  if (coords.length === 1) {
    coords.push([plotRight, coords[0]![1]]);
  }

  let pathLine = `M ${coords[0]![0].toFixed(2)} ${coords[0]![1].toFixed(2)}`;
  for (let i = 1; i < coords.length; i += 1) {
    pathLine += ` L ${coords[i]![0].toFixed(2)} ${coords[i]![1].toFixed(2)}`;
  }
  const first = coords[0]!;
  const last = coords[coords.length - 1]!;
  const pathArea = `${pathLine} L ${last[0].toFixed(2)} ${plotBottom} L ${first[0].toFixed(2)} ${plotBottom} Z`;

  const yLabels = Array.from({ length: 10 }, (_, i) => {
    const v = maxV - (i * (maxV - minV)) / 9;
    return formatScaleLabel(v);
  });

  return {
    isEmpty: false,
    pathLine,
    pathArea,
    dots: coords,
    yLabels,
  };
}

export function FigmaGraphic({ chart, points, animate = false }: FigmaGraphicProps) {
  const assets = chart ?? {
    vector25: homeAssets.vector25,
    line: homeAssets.line,
  };
  const geom = buildPercentChartGeom(points ?? []);
  const useDynamicLine = Array.isArray(points) && points.length > 0 && !geom.isEmpty;
  const [syncDelay, setSyncDelay] = useState(() => getSynchronizedAnimationDelay());

  useEffect(() => {
    if (!animate) return;
    setSyncDelay(getSynchronizedAnimationDelay());
  }, [animate]);

  const chartAnimationStyle = {
    "--fm-sync-delay": syncDelay,
  } as CSSProperties;

  return (
    <div
      className={`fm-chart${animate ? " fm-chart--animated" : ""}`}
      data-node-id="1:3505"
      data-name="Graphic"
      data-chart-animated={animate ? "true" : "false"}
      style={chartAnimationStyle}
    >
      <div className="fm-chart-scale">
        {(useDynamicLine ? geom.yLabels : CHART_SCALES).map((label) => (
          <div key={label} className="fm-scale-row">
            <p className="fm-scale-label">{label}</p>
            <div className="fm-scale-line">
              <div className="fm-scale-line-imgwrap">
                <img alt="" src={assets.vector25} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="fm-chart-line">
        {useDynamicLine ? (
          <svg className="fm-chart-line-svg" viewBox="0 0 325 123" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="fm-chart-area-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop className="fm-chart-area-stop fm-chart-area-stop--top" offset="0%" stopColor="#2d6e93" stopOpacity="0.26" />
                <stop className="fm-chart-area-stop fm-chart-area-stop--mid" offset="60%" stopColor="#759ac6" stopOpacity="0.12" />
                <stop className="fm-chart-area-stop fm-chart-area-stop--bottom" offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className="fm-chart-area-glow" d={geom.pathArea} fill="url(#fm-chart-area-gradient)" />
            <path className="fm-chart-area-fill" d={geom.pathArea} fill="url(#fm-chart-area-gradient)" />
            <path
              className="fm-chart-line-path"
              d={geom.pathLine}
              fill="none"
              stroke="#55647b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {geom.dots.map(([cx, cy], i) => (
              <circle key={`${cx}-${cy}-${i}`} cx={cx} cy={cy} r="1.25" fill="#2d6e93" />
            ))}
          </svg>
        ) : (
          <div className="fm-chart-line-imgwrap">
            <img alt="" src={assets.line} />
          </div>
        )}
      </div>
    </div>
  );
}
