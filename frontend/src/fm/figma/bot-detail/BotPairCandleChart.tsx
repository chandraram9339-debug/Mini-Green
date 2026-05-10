import { useEffect, useMemo, useRef, useState } from "react";
import { ColorType, createChart, type IChartApi, type ISeriesApi, type SeriesMarker, type UTCTimestamp } from "lightweight-charts";

import type { TradingJournalItem } from "../../api/fetchTradingJournal";
import { fetchBinanceCandles, type BinanceKlineInterval } from "../../api/fetchBinanceKlines";
import { journalSymbolToBinanceSymbol } from "../../api/pairSymbol";
import { useFmLocale } from "../../i18n/useFmLocale";

import s from "./botPairCandleChart.module.css";

function timeFromIso(iso: string): UTCTimestamp {
  const ms = Date.parse(iso);
  return (Number.isFinite(ms) ? Math.floor(ms / 1000) : 0) as UTCTimestamp;
}

function buildTradeMarkers(trades: TradingJournalItem[], binanceSymbol: string): SeriesMarker<UTCTimestamp>[] {
  const sym = binanceSymbol.trim().toUpperCase();
  const markers: SeriesMarker<UTCTimestamp>[] = [];

  for (const row of trades) {
    if (journalSymbolToBinanceSymbol(row.symbol) !== sym) continue;

    const entry = row.entry_price;
    if (entry != null && row.opened_at) {
      const side = row.side?.toLowerCase() ?? "";
      const below = side.includes("sell") || side.includes("short");
      markers.push({
        time: timeFromIso(row.opened_at),
        position: below ? "aboveBar" : "belowBar",
        color: "#40FF96",
        shape: below ? "arrowDown" : "arrowUp",
        text: entry.toLocaleString("en-US", { maximumFractionDigits: 2 }),
      });
    }

    if (row.status === "closed" && row.closed_at && row.exit_price != null) {
      const rp = row.result_percent;
      const pnl = rp == null ? "" : `${rp >= 0 ? "+" : ""}${rp.toFixed(2)}%`;
      markers.push({
        time: timeFromIso(row.closed_at),
        position: "aboveBar",
        color: rp != null && rp >= 0 ? "#40FF96" : "#ff4444",
        shape: "arrowDown",
        text: `${row.exit_price.toLocaleString("en-US", { maximumFractionDigits: 2 })}${pnl ? ` ${pnl}` : ""}`,
      });
    }
  }

  markers.sort((a, b) => (a.time as number) - (b.time as number));
  return markers;
}

export type BotPairCandleChartProps = {
  binanceSymbol: string;
  trades: TradingJournalItem[];
  interval: BinanceKlineInterval;
};

export function BotPairCandleChart({ binanceSymbol, trades, interval }: BotPairCandleChartProps) {
  const { t } = useFmLocale();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const markers = useMemo(() => buildTradeMarkers(trades, binanceSymbol), [trades, binanceSymbol]);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: "#0a0a0a" },
        textColor: "rgba(255,255,255,0.7)",
        fontFamily: '"Outfit", system-ui, sans-serif',
        /** Скрыть логотип TradingView на холсте (атрибуция по лицензии — см. https://www.tradingview.com/lightweight-charts/). */
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.07)" },
        horzLines: { color: "rgba(255,255,255,0.07)" },
      },
      width: el.clientWidth,
      height: Math.max(120, el.clientHeight),
      timeScale: {
        timeVisible: interval === "15m",
        secondsVisible: false,
        borderColor: "rgba(255,255,255,0.12)",
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.12)",
      },
      crosshair: {
        vertLine: { color: "rgba(255,255,255,0.2)" },
        horzLine: { color: "rgba(255,255,255,0.2)" },
      },
    });

    const series = chart.addCandlestickSeries({
      upColor: "#2EDD7D",
      downColor: "#E85D5D",
      borderVisible: false,
      wickUpColor: "#2EDD7D",
      wickDownColor: "#E85D5D",
    });

    chartRef.current = chart;
    seriesRef.current = series;

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
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [interval]);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const data = await fetchBinanceCandles(binanceSymbol, interval);
        if (cancelled) return;
        series.setData(data);
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

  return (
    <div className={s.wrap}>
      <div className={s.pairLabel} aria-hidden>
        {binanceSymbol.replace(/USDT$/i, "")}/USDT
      </div>
      <div className={s.host} ref={hostRef} data-tour-id="bot-pair-candles" />
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
