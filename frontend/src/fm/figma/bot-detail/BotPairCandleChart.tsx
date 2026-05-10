import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ColorType,
  CrosshairMode,
  LineType,
  createChart,
  type CandlestickData,
  type ISeriesApi,
  type LineData,
  type MouseEventParams,
  type SeriesMarker,
  type UTCTimestamp,
} from "lightweight-charts";

import type { TradingJournalItem } from "../../api/fetchTradingJournal";
import { fetchBinanceCandles, type BinanceKlineInterval } from "../../api/fetchBinanceKlines";
import { journalSymbolToBinanceSymbol } from "../../api/pairSymbol";
import { useFmLocale } from "../../i18n/useFmLocale";

import s from "./botPairCandleChart.module.css";

const LONG_COLOR = "#2EDD7D";
const SHORT_COLOR = "#E85D5D";

function timeFromIso(iso: string): UTCTimestamp {
  const ms = Date.parse(iso);
  return (Number.isFinite(ms) ? Math.floor(ms / 1000) : 0) as UTCTimestamp;
}

/** Сторона позиции из API (long/short, buy/sell, в т.ч. верхний регистр). */
function isShortSide(side: string | undefined): boolean {
  const x = side?.trim().toLowerCase() ?? "";
  if (x.includes("short") || x.includes("sell")) return true;
  if (x.includes("long") || x.includes("buy")) return false;
  return false;
}

const MARKER_ENTRY_SUFFIX = "::e";
const MARKER_EXIT_SUFFIX = "::x";

function tradeIdFromHoveredMarkerId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  if (raw.endsWith(MARKER_ENTRY_SUFFIX)) return raw.slice(0, -MARKER_ENTRY_SUFFIX.length);
  if (raw.endsWith(MARKER_EXIT_SUFFIX)) return raw.slice(0, -MARKER_EXIT_SUFFIX.length);
  return raw;
}

/** Вход (стрелка), выход (круг) — без текста; id с суффиксом для клика. */
function buildPairTradeMarkers(trades: TradingJournalItem[], binanceSymbol: string): SeriesMarker<UTCTimestamp>[] {
  const sym = binanceSymbol.trim().toUpperCase();
  const markers: SeriesMarker<UTCTimestamp>[] = [];

  for (const row of trades) {
    if (journalSymbolToBinanceSymbol(row.symbol) !== sym) continue;
    if (!row.opened_at) continue;

    const short = isShortSide(row.side);
    const col = short ? SHORT_COLOR : LONG_COLOR;

    markers.push({
      time: timeFromIso(row.opened_at),
      position: short ? "aboveBar" : "belowBar",
      color: col,
      shape: short ? "arrowDown" : "arrowUp",
      id: `${row.id}${MARKER_ENTRY_SUFFIX}`,
      size: 1,
    });

    if (row.status === "closed" && row.closed_at) {
      markers.push({
        time: timeFromIso(row.closed_at),
        position: "inBar",
        color: col,
        shape: "circle",
        id: `${row.id}${MARKER_EXIT_SUFFIX}`,
        size: 1,
      });
    }
  }

  markers.sort((a, b) => (a.time as number) - (b.time as number));
  return markers;
}

type ConnectorSpec = { data: LineData<UTCTimestamp>[]; color: string };

function buildTradeConnectorSpecs(trades: TradingJournalItem[], binanceSymbol: string): ConnectorSpec[] {
  const sym = binanceSymbol.trim().toUpperCase();
  const out: ConnectorSpec[] = [];

  for (const row of trades) {
    if (journalSymbolToBinanceSymbol(row.symbol) !== sym) continue;
    if (row.status !== "closed" || !row.closed_at || !row.opened_at) continue;
    if (row.entry_price == null || row.exit_price == null) continue;

    const tOpen = timeFromIso(row.opened_at);
    const tClose = timeFromIso(row.closed_at);
    if ((tClose as number) <= (tOpen as number)) continue;

    const short = isShortSide(row.side);
    const col = short ? "rgba(232, 93, 93, 0.42)" : "rgba(46, 221, 125, 0.42)";
    out.push({
      color: col,
      data: [
        { time: tOpen, value: row.entry_price },
        { time: tClose, value: row.exit_price },
      ],
    });
  }

  return out;
}

function candlesToLinePoints(candles: CandlestickData[]): LineData[] {
  return candles.map((c) => ({ time: c.time, value: c.close }));
}

function formatDurationMs(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h < 48) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh > 0 ? `${d}d ${rh}h` : `${d}d`;
}

export type BotPairCandleChartProps = {
  binanceSymbol: string;
  trades: TradingJournalItem[];
  interval: BinanceKlineInterval;
};

export function BotPairCandleChart({ binanceSymbol, trades, interval }: BotPairCandleChartProps) {
  const { t } = useFmLocale();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const tradesByIdRef = useRef<Map<string, TradingJournalItem>>(new Map());

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tip, setTip] = useState<{
    trade: TradingJournalItem;
    x: number;
    y: number;
  } | null>(null);

  const markers = useMemo(() => buildPairTradeMarkers(trades, binanceSymbol), [trades, binanceSymbol]);
  const connectorSpecs = useMemo(() => buildTradeConnectorSpecs(trades, binanceSymbol), [trades, binanceSymbol]);

  useEffect(() => {
    const sym = binanceSymbol.trim().toUpperCase();
    const m = new Map<string, TradingJournalItem>();
    for (const row of trades) {
      if (journalSymbolToBinanceSymbol(row.symbol) !== sym) continue;
      m.set(row.id, row);
    }
    tradesByIdRef.current = m;
  }, [trades, binanceSymbol]);

  const onChartClick = useCallback((param: MouseEventParams) => {
    if (!param.point) {
      setTip(null);
      return;
    }
    const tradeId = tradeIdFromHoveredMarkerId(param.hoveredObjectId);
    if (tradeId) {
      const tr = tradesByIdRef.current.get(tradeId);
      if (tr) {
        setTip({ trade: tr, x: param.point.x, y: param.point.y });
        return;
      }
    }
    setTip(null);
  }, []);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: "#08090c" },
        textColor: "rgba(255,255,255,0.55)",
        fontFamily: '"Outfit", system-ui, sans-serif',
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      width: el.clientWidth,
      height: Math.max(120, el.clientHeight),
      timeScale: {
        timeVisible: interval === "15m",
        secondsVisible: false,
        borderColor: "rgba(255,255,255,0.08)",
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.08)",
        scaleMargins: { top: 0.12, bottom: 0.1 },
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: { color: "rgba(94, 224, 168, 0.25)", width: 1, style: 2 },
        horzLine: { color: "rgba(94, 224, 168, 0.2)", width: 1, style: 2 },
      },
    });

    for (const spec of connectorSpecs) {
      const conn = chart.addLineSeries({
        color: spec.color,
        lineWidth: 1,
        lineType: LineType.Simple,
        lastValueVisible: false,
        priceLineVisible: false,
        crosshairMarkerVisible: false,
      });
      conn.setData(spec.data);
    }

    const series = chart.addLineSeries({
      color: "rgba(94, 234, 184, 0.92)",
      lineWidth: 1,
      lineType: LineType.Curved,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    seriesRef.current = series;
    series.setMarkers(markers as SeriesMarker<never>[]);
    chart.subscribeClick(onChartClick);

    const ro = new ResizeObserver(() => {
      const host = hostRef.current;
      if (!host) return;
      const { clientWidth, clientHeight } = host;
      chart.applyOptions({
        width: clientWidth,
        height: Math.max(120, clientHeight),
      });
    });
    ro.observe(el);

    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const candles = await fetchBinanceCandles(binanceSymbol, interval);
        if (cancelled) return;
        series.setData(candlesToLinePoints(candles));
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        series.setData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      ro.disconnect();
      chart.unsubscribeClick(onChartClick);
      chart.remove();
      seriesRef.current = null;
    };
  }, [interval, onChartClick, binanceSymbol, connectorSpecs, markers]);

  const tipContent = useMemo(() => {
    if (!tip) return null;
    const row = tip.trade;
    const sideLabel = isShortSide(row.side) ? t("bot.journalSideShort") : t("bot.journalSideLong");
    const entry = row.entry_price;
    const exit = row.exit_price;
    const entryStr =
      entry == null ? "—" : entry.toLocaleString("en-US", { maximumFractionDigits: entry < 1 ? 6 : 2 });
    const exitStr = exit == null ? "—" : exit.toLocaleString("en-US", { maximumFractionDigits: exit < 1 ? 6 : 2 });
    const rp = row.result_percent;
    let pnlStr = "—";
    if (rp != null) {
      pnlStr = `${rp >= 0 ? "+" : ""}${rp.toFixed(2)}%`;
    } else if (row.status === "open") {
      pnlStr = t("bot.pairTradePnlOpen");
    }
    let dur = "—";
    if (row.opened_at) {
      const o = Date.parse(row.opened_at);
      if (row.closed_at) {
        const c = Date.parse(row.closed_at);
        if (Number.isFinite(o) && Number.isFinite(c)) dur = formatDurationMs(c - o);
      } else if (Number.isFinite(o)) {
        dur = formatDurationMs(Date.now() - o);
      }
    }

    return { sideLabel, entryStr, exitStr, pnlStr, dur };
  }, [tip, t]);

  return (
    <div className={s.wrap}>
      <div className={s.pairLabel} aria-hidden>
        {binanceSymbol.replace(/USDT$/i, "")}/USDT
      </div>
      <div className={s.host} ref={hostRef} data-tour-id="bot-pair-candles" />
      {tip && tipContent ? (
        <div
          className={s.tradeTip}
          style={{
            left: tip.x,
            top: tip.y,
          }}
          role="dialog"
          aria-label={t("bot.pairTradeTipAria")}
        >
          <div className={s.tradeTipHeader}>
            <span className={isShortSide(tip.trade.side) ? s.tradeTipSideShort : s.tradeTipSideLong}>
              {tipContent.sideLabel}
            </span>
          </div>
          <dl className={s.tradeTipRows}>
            <div className={s.tradeTipRow}>
              <dt>{t("bot.pairTradeEntry")}</dt>
              <dd>{tipContent.entryStr}</dd>
            </div>
            <div className={s.tradeTipRow}>
              <dt>{t("bot.pairTradeExit")}</dt>
              <dd>{tipContent.exitStr}</dd>
            </div>
            <div className={s.tradeTipRow}>
              <dt>{t("bot.pairTradePnl")}</dt>
              <dd className={tip.trade.result_percent != null && tip.trade.result_percent < 0 ? s.tradeTipNeg : s.tradeTipPos}>
                {tipContent.pnlStr}
              </dd>
            </div>
            <div className={s.tradeTipRow}>
              <dt>{t("bot.pairTradeDuration")}</dt>
              <dd>{tipContent.dur}</dd>
            </div>
          </dl>
        </div>
      ) : null}
      {loading ? (
        <div className={s.status} role="status">
          {t("bot.pairChartLoading")}
        </div>
      ) : null}
      {error && !loading ? (
        <div className={s.error} role="alert">
          {t("bot.pairChartError")}
          <span className={s.errorDetail}>{error}</span>
        </div>
      ) : null}
    </div>
  );
}
