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

function timeFromIso(iso: string): UTCTimestamp {
  const ms = Date.parse(iso);
  return (Number.isFinite(ms) ? Math.floor(ms / 1000) : 0) as UTCTimestamp;
}

function isShortSide(side: string | undefined): boolean {
  const s = side?.toLowerCase() ?? "";
  return s.includes("sell") || s.includes("short");
}

/** Entry markers only; no on-canvas text — details in click tooltip. */
function buildEntryMarkers(trades: TradingJournalItem[], binanceSymbol: string): SeriesMarker<UTCTimestamp>[] {
  const sym = binanceSymbol.trim().toUpperCase();
  const markers: SeriesMarker<UTCTimestamp>[] = [];

  for (const row of trades) {
    if (journalSymbolToBinanceSymbol(row.symbol) !== sym) continue;
    if (!row.opened_at) continue;

    const short = isShortSide(row.side);
    markers.push({
      time: timeFromIso(row.opened_at),
      position: short ? "aboveBar" : "belowBar",
      color: short ? "#E85D5D" : "#2EDD7D",
      shape: short ? "arrowDown" : "arrowUp",
      id: row.id,
      size: 1,
    });
  }

  markers.sort((a, b) => (a.time as number) - (b.time as number));
  return markers;
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

  const markers = useMemo(() => buildEntryMarkers(trades, binanceSymbol), [trades, binanceSymbol]);

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
    const id = param.hoveredObjectId;
    if (typeof id === "string") {
      const tr = tradesByIdRef.current.get(id);
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

    const series = chart.addLineSeries({
      color: "rgba(94, 234, 184, 0.92)",
      lineWidth: 1,
      lineType: LineType.Curved,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    seriesRef.current = series;
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

    return () => {
      ro.disconnect();
      chart.unsubscribeClick(onChartClick);
      chart.remove();
      seriesRef.current = null;
    };
  }, [interval, onChartClick]);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const candles = await fetchBinanceCandles(binanceSymbol, interval);
        if (cancelled) return;
        const line = candlesToLinePoints(candles);
        series.setData(line);
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
    };
  }, [binanceSymbol, interval]);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;
    series.setMarkers(markers as SeriesMarker<never>[]);
  }, [markers]);

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
