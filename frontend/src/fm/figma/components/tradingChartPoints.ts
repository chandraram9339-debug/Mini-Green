import type { TradingJournalItem } from "../../api/fetchTradingJournal";

export type GraphicPoint = {
  occurred_at: string;
  value_pct: number;
};

/**
 * Тот же выбор, что на экране бота: системная серия из API, иначе компаунд % по журналу пользователя.
 */
export function chartPointsSystemOrUserFallback(
  systemChartPoints: GraphicPoint[],
  journalRows: TradingJournalItem[],
): GraphicPoint[] {
  if (systemChartPoints.length > 0) return systemChartPoints;
  return buildCompoundedChartPoints(journalRows);
}

/**
 * Баланс в USDT после каждого закрытия (ось Y = деньги).
 * Предпочтительно **delta_minor** из SIB (фактическое изменение баланса в центах USDT);
 * если у всех сделок в окне есть дельты — строим от текущего баланса назад/вперёд по сумме дельт.
 * Иначе — мультипликативная модель по `result_percent`, привязанная к текущему балансу
 * (корректно, если результат сделки считается как доля от всего баланса; при фиксированном номинале
 * позиции точнее дельты).
 */
export function buildPersonalBalanceChartPoints(
  rows: TradingJournalItem[],
  endBalanceUsdt: number,
  positiveBalanceStartedAt: string | null | undefined,
): GraphicPoint[] {
  const closed = rows
    .filter((row) => row.status === "closed" && row.closed_at)
    .sort((a, b) => Date.parse(String(a.closed_at)) - Date.parse(String(b.closed_at)));

  const startMs =
    positiveBalanceStartedAt != null && String(positiveBalanceStartedAt).trim() !== ""
      ? Date.parse(positiveBalanceStartedAt)
      : NaN;
  const filtered = Number.isFinite(startMs)
    ? closed.filter((r) => Date.parse(String(r.closed_at)) >= startMs)
    : closed;

  if (filtered.length === 0) return [];

  const endMinor = Math.round(endBalanceUsdt * 100);
  const deltas = filtered.map((r) =>
    r.delta_minor != null && Number.isFinite(r.delta_minor) ? Math.round(r.delta_minor) : null,
  );
  const allHaveDelta = deltas.every((d) => d != null);

  if (allHaveDelta) {
    const dArr = deltas as number[];
    const sumD = dArr.reduce((s, d) => s + d, 0);
    let b = endMinor - sumD;
    return filtered.map((r, i) => {
      b += dArr[i]!;
      return { occurred_at: String(r.closed_at), value_pct: b / 100 };
    });
  }

  const withPct = filtered.filter(
    (row) => row.result_percent != null && Number.isFinite(row.result_percent),
  );
  if (withPct.length === 0) return [];

  let totalC = 1;
  for (const r of withPct) {
    totalC *= 1 + Number(r.result_percent) / 100;
  }

  let running = 1;
  return withPct.map((r) => {
    running *= 1 + Number(r.result_percent) / 100;
    const balanceUsdt = (endBalanceUsdt * running) / totalC;
    return { occurred_at: String(r.closed_at), value_pct: balanceUsdt };
  });
}

/**
 * Шкала Y (USDT) для личного графика на Home: только две опоры — **x×0.97** и **z×1.03**.
 *
 * - **x** — сумма подтверждённых пополнений (стартовый депозит для шкалы).
 * - **z** — текущий баланс USDT с учётом торгов.
 * Если z ≪ x, границы переставляются через min/max, чтобы интервал оставался валидным.
 */
export function computeDepositBalanceYDomain(x: number, z: number): [number, number] {
  const zx = Math.max(0, z);
  if (!(x > 0)) {
    const hi = Math.max(zx, 1e-6) * 1.03;
    const pad = Math.max(hi * 0.06, 1e-6);
    return [0 - pad * 0.5, hi + pad];
  }
  const bandLow = x * 0.97;
  const bandHigh = zx * 1.03;
  let low = Math.min(bandLow, bandHigh);
  let high = Math.max(bandLow, bandHigh);
  if (high <= low) {
    const mid = (low + high) / 2;
    low = mid - 5e-5;
    high = mid + 5e-5;
  }
  /* Небольшой воздух по Y — линия и stroke не прижаты к краю шкалы и не режутся контейнером */
  const span = high - low;
  const pad = Math.max(span * 0.06, 1e-6);
  low -= pad;
  high += pad;
  return [low, high];
}

/**
 * Точка старта на уровне суммы депозитов (x) в момент positiveBalanceStartedAt — перед первой сделкой по времени.
 */
export function prependDepositTotalAnchor(
  tradePoints: GraphicPoint[],
  depositUsdt: number,
  anchorIso: string | null | undefined,
): GraphicPoint[] {
  if (!anchorIso?.trim() || !(depositUsdt > 0) || tradePoints.length === 0) return tradePoints;
  const anchorMs = Date.parse(anchorIso);
  if (!Number.isFinite(anchorMs)) return tradePoints;
  const sorted = [...tradePoints].sort((a, b) => Date.parse(a.occurred_at) - Date.parse(b.occurred_at));
  const firstMs = Date.parse(sorted[0]!.occurred_at);
  if (anchorMs > firstMs) return sorted;
  if (anchorMs === firstMs && Math.abs(sorted[0]!.value_pct - depositUsdt) < 1e-6) return sorted;
  return [
    { occurred_at: new Date(anchorMs).toISOString(), value_pct: depositUsdt },
    ...sorted,
  ];
}

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

export type ChartDot = {
  x: number;
  y: number;
  /** cumulative compounded % at this deal */
  value_pct: number;
  /** individual deal result % — positive = profit, negative = loss, null = open */
  deal_pct: number | null;
};

export type ChartGeom = {
  isEmpty: boolean;
  pathLine: string;
  pathArea: string;
  yLabels: string[];
  /** Подписи Y с y в user space SVG — та же система, что у линии графика (viewBox height). */
  yTicks: Array<{ label: string; ySvg: number }>;
  dots: ChartDot[];
};

export type BuildChartGeomOptions = {
  /** Фиксированный диапазон по Y (например личный график USDT: от x×0.9 до z×1.1). */
  fixedYDomain?: [number, number];
  /**
   * Нижний inset в user space viewBox (0…H). По умолчанию `CHART_PLOT_INSET_BOTTOM` (экран бота / макет).
   * Главная может передать меньшее значение — плотнее к контенту под графиком, без изменения третьего экрана.
   */
  plotInsetBottom?: number;
};

const STATIC_Y_LABELS = ["7.00%","6.00%","5.00%","4.00%","3.00%","2.00%","1.00%","0.00%","-1.00%","-2.00%"];

/** Высота по Y в `viewBox="0 0 325 …"` — для позиционирования подписей рядом с SVG. */
export const CHART_VIEWBOX_HEIGHT = 122;

/**
 * Внутренний plot по Y (user space): крайние тики не в y=0 / y=H, чтобы подписи с `translateY(-50%)`
 * не обрезались. Низ не слишком большой — иначе линия визуально «уезжает вниз» и пустая полоса под графиком.
 */
export const CHART_PLOT_INSET_TOP = 4;
export const CHART_PLOT_INSET_BOTTOM = 8;

/** Нижний inset только для графика на главной (Home); бот и остальные — `CHART_PLOT_INSET_BOTTOM`. */
export const CHART_HOME_PLOT_INSET_BOTTOM = 2;

function resolvePlotInsetBottom(raw: number | undefined): number {
  if (typeof raw !== "number" || !Number.isFinite(raw)) return CHART_PLOT_INSET_BOTTOM;
  const top = CHART_PLOT_INSET_TOP;
  const maxBottom = CHART_VIEWBOX_HEIGHT - top - 1;
  return Math.min(Math.max(0, raw), maxBottom);
}

function chartPlotVerticalRange(plotInsetBottom: number): { plotTop: number; plotBottom: number; plotH: number } {
  const H = CHART_VIEWBOX_HEIGHT;
  const plotTop = CHART_PLOT_INSET_TOP;
  const plotBottom = H - plotInsetBottom;
  const plotH = Math.max(plotBottom - plotTop, 1);
  return { plotTop, plotBottom, plotH };
}

function buildStaticYTicks(plotInsetBottom: number): Array<{ label: string; ySvg: number }> {
  const emptyMin = -2;
  const emptyMax = 7;
  const range = emptyMax - emptyMin;
  const { plotBottom, plotH } = chartPlotVerticalRange(plotInsetBottom);
  return Array.from({ length: 10 }, (_, i) => {
    const v = emptyMax - (i * range) / 9;
    const norm = (v - emptyMin) / range;
    const ySvg = plotBottom - norm * plotH;
    return { label: STATIC_Y_LABELS[i]!, ySvg };
  });
}

/**
 * Converts GraphicPoints into SVG path strings, Y-axis labels and trade deal dots.
 * viewBox: "0 0 325 122"
 *
 * Оси: **X** — время `occurred_at`, равномерно от первой точки до последней (0…325). **Y** — `value_pct`:
 * в режиме `percent` это кумулятивный compound-% (как отдаёт API `system_chart`); масштаб min…max по
 * данным с паддингом, верх экрана = больший %, низ = меньший. По **Y** линия и тики внутри
 * `[CHART_PLOT_INSET_TOP, H − CHART_PLOT_INSET_BOTTOM]`, чтобы подписи не резались краями viewBox.
 *
 * @param yAxis `percent` — value_pct is %; `usdt` — value_pct holds USDT (личный баланс на Home).
 */
export function buildChartGeom(
  points: GraphicPoint[],
  yAxis: "percent" | "usdt" = "percent",
  options?: BuildChartGeomOptions,
): ChartGeom {
  const W = 325;
  const plotInsetBottom = resolvePlotInsetBottom(options?.plotInsetBottom);
  const { plotBottom, plotH } = chartPlotVerticalRange(plotInsetBottom);

  if (points.length === 0) {
    return {
      isEmpty: true,
      pathLine: "",
      pathArea: "",
      yLabels: [...STATIC_Y_LABELS],
      yTicks: buildStaticYTicks(plotInsetBottom),
      dots: [],
    };
  }

  const sorted = [...points].sort((a, b) => Date.parse(a.occurred_at) - Date.parse(b.occurred_at));
  const vals = sorted.map((p) => p.value_pct);
  const ts   = sorted.map((p) => Date.parse(p.occurred_at));

  let minV: number;
  let maxV: number;
  const fixed = options?.fixedYDomain;
  if (fixed && Number.isFinite(fixed[0]) && Number.isFinite(fixed[1])) {
    minV = Math.min(fixed[0], fixed[1]);
    maxV = Math.max(fixed[0], fixed[1]);
    if (maxV - minV < 1e-9) {
      const mid = (minV + maxV) / 2;
      minV = mid - 5e-5;
      maxV = mid + 5e-5;
    }
  } else {
    const minV0 = Math.min(0, ...vals);
    const maxV0 = Math.max(0, ...vals);
    const spanV = Math.max(0.5, maxV0 - minV0);
    const padV  = spanV * 0.18;
    minV = minV0 - padV;
    maxV = maxV0 + padV;
  }

  const t0    = ts[0]!;
  const t1    = ts[ts.length - 1]!;
  const spanT = Math.max(t1 - t0, 1);

  const coords: Array<[number, number]> = sorted.map((p, i) => {
    const x   = ((ts[i]! - t0) / spanT) * W;
    const norm = (p.value_pct - minV) / Math.max(maxV - minV, 0.0001);
    const y   = plotBottom - norm * plotH;
    return [x, y];
  });

  if (coords.length === 1) coords.push([W, coords[0]![1]]);

  const pts  = coords.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`);
  const pathLine = `M ${pts[0]}` + pts.slice(1).map((p) => ` L ${p}`).join("");
  const first = coords[0]!;
  const last  = coords[coords.length - 1]!;
  const pathArea = `${pathLine} L ${last[0].toFixed(2)} ${plotBottom} L ${first[0].toFixed(2)} ${plotBottom} Z`;

  const rangeV = Math.max(maxV - minV, 0.0001);
  const yTicks = Array.from({ length: 10 }, (_, i) => {
    const v = maxV - (i * (maxV - minV)) / 9;
    const norm = (v - minV) / rangeV;
    const ySvg = plotBottom - norm * plotH;
    const label = yAxis === "usdt" ? `${v.toFixed(2)}` : `${v.toFixed(2)}%`;
    return { label, ySvg };
  });
  const yLabels = yTicks.map((t) => t.label);

  // Dots: one per deal, colour indicates profit/loss of that individual trade
  const dots: ChartDot[] = sorted.map((p, i) => {
    const [x, y] = coords[i]!;
    let deal_pct: number | null = null;
    if (yAxis === "usdt") {
      if (i > 0) {
        const prevBal = sorted[i - 1]!.value_pct;
        deal_pct = prevBal > 1e-9 ? (p.value_pct / prevBal - 1) * 100 : null;
      }
    } else if (i === 0) {
      deal_pct = p.value_pct;
    } else {
      const prevCpd = 1 + (sorted[i - 1]!.value_pct / 100);
      const curCpd  = 1 + (p.value_pct / 100);
      deal_pct = prevCpd > 0 ? (curCpd / prevCpd - 1) * 100 : null;
    }
    return { x, y, value_pct: p.value_pct, deal_pct };
  });

  return { isEmpty: false, pathLine, pathArea, yLabels, yTicks, dots };
}
