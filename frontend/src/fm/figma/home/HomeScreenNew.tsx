/**
 * HomeScreenNew — точный перенос Figma-дизайна «Первый экран Home»
 * с полной логикой API/бэкенда.
 *
 * Структура:
 *   AppBar (back + logo + bell/gear)
 *   BalanceSection (баланс, Top Up, Withdraw)
 *   BotStatusSection (chart, статус бота, цена)
 *   Bot action grid: Start / Stop, Channel / Chat
 *
 * Данные: fetchTradingJournal, fetchBotTrading, useAppSession, useWalletDisplay
 */
import { useEffect, useId, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFmLocale } from "../../i18n/useFmLocale";

import { hasApiBase } from "../../api/env";
import { fetchTradingJournal, type TradingJournalItem } from "../../api/fetchTradingJournal";
import { fetchTradeFeedSnapshot, tradeFeedPollIntervalMs } from "../../api/fetchTradeFeed";
import { mergeTradeFeedPayloadToJournalItems } from "../../api/mergeAlTradeFeed";
import { fetchBotTrading } from "../../api/fetchBotTrading";
import {
  buildPersonalBalanceChartPoints,
  buildCompoundedChartPoints,
  chartPointsSystemOrUserFallback,
  buildChartGeom,
  CHART_HOME_PLOT_INSET_BOTTOM,
  CHART_VIEWBOX_HEIGHT,
  computeDepositBalanceYDomain,
  prependDepositTotalAnchor,
  type GraphicPoint,
} from "../components/tradingChartPoints";
import { useApplyBotTradingState } from "../../hooks/useApplyBotTradingState";
import { useAppSession } from "../../session/useAppSession";
import { useWalletDisplay } from "../useWalletDisplay";
import { routes } from "../routes";
import type { BotTradingSnapshot } from "../../api/typesBotTrading";
import { appBarLogoUrl } from "../assets/appBarShared";
import { TELEGRAM_CHANNEL_URL, TELEGRAM_CHAT_URL, openTelegramOrExternal } from "../../config/links";

import s from "./homeScreenNew.module.css";

/* ─── AppBar ─────────────────────────────────────────────────── */
function AppBar({ bellBadge }: { bellBadge?: number }) {
  const navigate = useNavigate();
  const { t } = useFmLocale();
  return (
    <div className={s.appBar}>
      <div className={s.appBarRow}>
        <button
          type="button"
          className={`${s.appBarBack} fm-appbar-hit-green`}
          onClick={() => { if (window.history.length > 1) navigate(-1); }}
          aria-label={t("common.back")}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 12.8H20.8V11.2H20V12V12.8ZM20 12V11.2H4V12V12.8H20V12Z" fill="#0A0A0A" />
            <path d="M10 18L4 12L10 6" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Логотип строго по центру */}
        <div className={`${s.appBarLogo} app-bar-logo-shimmer app-bar-logo-wordmark`} aria-label="Palladium">
          <img src={appBarLogoUrl} alt="Palladium" />
        </div>

        <div className={s.appBarIcons}>
          <Link to={routes.notifications} className={`${s.appBarBell} fm-appbar-hit-green`} aria-label={t("notifications.title")}>
            <svg width="18" height="19" viewBox="0 0 18 19" fill="none">
              <path d="M2 15V7C2 5.14348 2.7375 3.36301 4.05025 2.05025C5.36301 0.737498 7.14348 0 9 0C10.8565 0 12.637 0.737498 13.9497 2.05025C15.2625 3.36301 16 5.14348 16 7V15" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
              <path d="M0 15H18" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
              <path d="M7 19H11" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
            </svg>
            {bellBadge != null && bellBadge > 0 && (
              <span className={s.bellBadge}><span>{bellBadge > 99 ? "99" : bellBadge}</span></span>
            )}
          </Link>
          <Link to={routes.settings} className={`${s.appBarGear} fm-appbar-hit-green`} aria-label={t("settings.title")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7 5C5.89543 5 5 5.89543 5 7V8.17157C5 8.70201 4.78929 9.21071 4.41421 9.58579L3.41421 10.5858C2.63317 11.3668 2.63316 12.6332 3.41421 13.4142L4.41421 14.4142C4.78929 14.7893 5 15.298 5 15.8284V17C5 18.1046 5.89543 19 7 19H8.17157C8.70201 19 9.21071 19.2107 9.58579 19.5858L10.5858 20.5858C11.3668 21.3668 12.6332 21.3668 13.4142 20.5858L14.4142 19.5858C14.7893 19.2107 15.298 19 15.8284 19H17C18.1046 19 19 18.1046 19 17V15.8284C19 15.298 19.2107 14.7893 19.5858 14.4142L20.5858 13.4142C21.3668 12.6332 21.3668 11.3668 20.5858 10.5858L19.5858 9.58579C19.2107 9.21071 19 8.70201 19 8.17157V7C19 5.89543 18.1046 5 17 5H15.8284C15.298 5 14.7893 4.78929 14.4142 4.41421L13.4142 3.41421C12.6332 2.63317 11.3668 2.63316 10.5858 3.41421L9.58579 4.41421C9.21071 4.78929 8.70201 5 8.17157 5H7Z" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── График производительности ─────────────────────────────── */
/** Как в старт/стоп: шкала слева + gap; подписи шире (homeScreenNew .chartScaleLabel), overlay left синхронизирован в CSS. */
function homeChartGridLineColor(tickIndex: number, tickCount: number): string {
  if (tickCount === 7) {
    return tickIndex === 3 || tickIndex === 4 || tickIndex === 5
      ? "rgba(255,255,255,0.25)"
      : "rgba(255,255,255,0.15)";
  }
  if (tickCount === 10) {
    return tickIndex >= 4 && tickIndex <= 6 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.15)";
  }
  const mid = Math.floor(tickCount / 2);
  return tickIndex >= mid - 1 && tickIndex <= mid + 1 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.15)";
}

function PerformanceChart({
  points,
  yAxis,
  fixedYDomain,
}: {
  points: GraphicPoint[];
  yAxis: "percent" | "usdt";
  fixedYDomain?: [number, number];
}) {
  const gradId = useId().replace(/:/g, "");
  const geom = buildChartGeom(points, yAxis, {
    plotInsetBottom: CHART_HOME_PLOT_INSET_BOTTOM,
    ...(fixedYDomain ? { fixedYDomain } : {}),
  });
  const yPct = 100 / CHART_VIEWBOX_HEIGHT;
  const nTicks = geom.yTicks.length;

  return (
    <div className={s.chartWrap}>
      <div className={s.chartFrame}>
        <div className={s.chartGridLayer} aria-hidden>
          {geom.yTicks.map((t, i) => (
            <div
              key={i}
              className={s.chartGridRow}
              style={{ top: `${t.ySvg * yPct}%` }}
            >
              <span className={s.chartScaleLabel}>{t.label}</span>
              <div
                className={s.chartGridLine}
                style={{
                  borderColor: homeChartGridLineColor(i, nTicks),
                }}
              />
            </div>
          ))}
        </div>
        <div className={s.chartSvgOverlay}>
          <svg
            viewBox="0 0 325 122"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={s.chartSvg}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id={gradId}
                x1="162.5"
                y1="0"
                x2="162.5"
                y2="122"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#24F180" stopOpacity="0.35" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
            {geom.isEmpty ? null : (
              <>
                <path d={geom.pathArea} fill={`url(#${gradId})`} />
                <path
                  d={geom.pathLine}
                  stroke="#40FF96"
                  strokeWidth="2.35"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ─── Главный экран ──────────────────────────────────────────── */
export default function HomeScreenNew() {
  const { t } = useFmLocale();
  const { phase, botRunning, notificationUnreadCount, uiSettings } = useAppSession();
  const { applyBotState, botSwitchLoading } = useApplyBotTradingState();
  const { balanceUsdt, referralReceivedUsdt, positiveBalanceStartedAt, cumulativeDepositsUsdt } =
    useWalletDisplay();

  const apiSessionReady = !hasApiBase() || phase === "ready";
  const isBotActive = balanceUsdt > 0 && botRunning;

  const [chartRows, setChartRows] = useState<TradingJournalItem[]>([]);
  const [systemChartPoints, setSystemChartPoints] = useState<GraphicPoint[]>([]);
  /** Системная лента AL с бэкенда — те же closes/opens, что на экране бота; для графика «%» на главной при !isBotActive. */
  const [alFeedJournalRows, setAlFeedJournalRows] = useState<TradingJournalItem[]>([]);
  const [tradingFromApi, setTradingFromApi] = useState<BotTradingSnapshot | null>(null);

  useEffect(() => {
    if (!hasApiBase()) {
      setChartRows([]);
      setSystemChartPoints([]);
      setTradingFromApi(null);
      return;
    }
    if (!apiSessionReady) return;

    let cancelled = false;
    const load = async () => {
      /** Всегда «all»: на главной в ритейле — та же системная серия, что на экране бота за весь период; в личном режиме — все закрытые сделки после окна баланса. */
      const period = "all";
      const [jr, snap] = await Promise.all([
        fetchTradingJournal(100, period),
        fetchBotTrading(period),
      ]);
      if (cancelled) return;
      setChartRows(jr.items);
      setSystemChartPoints(jr.system_chart.map((p) => ({ occurred_at: p.occurred_at, value_pct: p.value_pct })));
      if (snap) setTradingFromApi(snap);
    };

    void load();
    const id = window.setInterval(() => void load(), 5_000);
    return () => { cancelled = true; window.clearInterval(id); };
  }, [apiSessionReady]);

  useEffect(() => {
    if (!hasApiBase() || !apiSessionReady) {
      setAlFeedJournalRows([]);
      return;
    }
    let cancelled = false;
    let intervalId = 0;
    let inFlight = false;
    const pollMs = tradeFeedPollIntervalMs();

    const tick = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const r = await fetchTradeFeedSnapshot();
        if (cancelled) return;
        if (!r.ok) {
          if (import.meta.env.DEV) console.debug("[Home][al-trade-feed]", { ok: false, error: r.error });
          setAlFeedJournalRows([]);
          return;
        }
        const merged = mergeTradeFeedPayloadToJournalItems(r.data.opens, r.data.closes);
        if (import.meta.env.DEV) {
          console.debug("[Home][al-trade-feed]", {
            configured: r.data.configured,
            fetched_at: r.data.fetched_at,
            opens: r.data.opens.length,
            closes: r.data.closes.length,
            mergedRows: merged.length,
          });
        }
        setAlFeedJournalRows(merged);
      } finally {
        inFlight = false;
      }
    };

    void tick();
    intervalId = window.setInterval(() => void tick(), pollMs);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [apiSessionReady]);

  /** x: сумма всех подтверждённых пополнений (API); до выката — fallback на баланс. z: balanceUsdt. */
  const depositTotalUsdt = useMemo(() => {
    if (cumulativeDepositsUsdt != null && cumulativeDepositsUsdt > 0) return cumulativeDepositsUsdt;
    return balanceUsdt;
  }, [cumulativeDepositsUsdt, balanceUsdt]);

  const personalTradePoints = useMemo(
    () =>
      isBotActive
        ? buildPersonalBalanceChartPoints(chartRows, balanceUsdt, positiveBalanceStartedAt)
        : [],
    [isBotActive, chartRows, balanceUsdt, positiveBalanceStartedAt],
  );

  const chartPoints = useMemo(() => {
    if (!isBotActive) {
      if (alFeedJournalRows.length > 0) {
        const alPts = buildCompoundedChartPoints(alFeedJournalRows);
        if (alPts.length > 0) return alPts;
      }
      return chartPointsSystemOrUserFallback(systemChartPoints, chartRows);
    }
    if (personalTradePoints.length === 0) return [];
    return prependDepositTotalAnchor(personalTradePoints, depositTotalUsdt, positiveBalanceStartedAt);
  }, [
    isBotActive,
    alFeedJournalRows,
    systemChartPoints,
    chartRows,
    personalTradePoints,
    depositTotalUsdt,
    positiveBalanceStartedAt,
  ]);

  const fixedYDomain = useMemo((): [number, number] | undefined => {
    if (!isBotActive || chartPoints.length < 2) return undefined;
    return computeDepositBalanceYDomain(depositTotalUsdt, balanceUsdt);
  }, [isBotActive, chartPoints.length, depositTotalUsdt, balanceUsdt]);

  const priceDisplay = tradingFromApi?.displayPrice ?? "69 425.22";
  const pricePair = tradingFromApi?.pricePair ?? "USDT/BTC";
  return (
    <div className={s.screen}>
      <div className={s.container}>
        <header className={s.header}>
          <div className={s.headerBlobs} aria-hidden="true">
            <div className={s.headerBlurLeft} />
            <div className={s.headerBlurRight} />
          </div>

          <AppBar bellBadge={notificationUnreadCount} />

          <section className={s.balanceSection} aria-label={t("home.balances")} data-tour-id="home-balance">
            <div className={s.balanceRow}>
              <div className={s.balanceLeft}>
                <div className={s.balanceTitle}>{t("home.totalBalance")}</div>
                <div className={s.balanceAmount}>
                  <span className={s.balanceValue}>{balanceUsdt.toFixed(2)}</span>
                  <span className={s.balanceCurrency}>USDT</span>
                </div>
                <div className={s.referralBlock}>
                  <div className={s.referralAmount}>
                    <span className={s.referralValue}>{referralReceivedUsdt.toFixed(2)}</span>
                    <span className={s.referralCurrency}>USDT</span>
                  </div>
                  <div className={s.referralCaption}>{t("home.referralsCaption")}</div>
                </div>
              </div>

              <div className={s.balanceActions}>
                <Link to={routes.depositTopUp} className={`${s.btnTopUp} fm-interactive-pill`} aria-label={t("home.topUp")}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M10 5V15" stroke="black" strokeWidth="1.3" strokeLinecap="square" strokeLinejoin="round" />
                    <path d="M5 10H15" stroke="black" strokeWidth="1.3" strokeLinecap="square" strokeLinejoin="round" />
                  </svg>
                  <span>{t("home.topUp")}</span>
                </Link>

                <Link to={routes.withdraw} className={`${s.btnWithdraw} fm-interactive-pill`} aria-label={t("home.withdraw")}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M10 15V5" stroke="white" strokeWidth="1.3" strokeLinecap="square" strokeLinejoin="round" />
                    <path d="M6.25 8.75L10 5L13.75 8.75" stroke="white" strokeWidth="1.3" strokeLinecap="square" strokeLinejoin="round" />
                  </svg>
                  <span>{t("home.withdraw")}</span>
                </Link>
              </div>
            </div>
          </section>
        </header>

        <main className={s.body}>
          <div className={s.bodyStack}>
            <section className={s.chartSection} aria-label={t("home.chartBalanceAria")} data-tour-id="home-chart">
            <div className={s.chartWrapper}>
              <PerformanceChart
                points={chartPoints}
                yAxis={isBotActive ? "usdt" : "percent"}
                fixedYDomain={fixedYDomain}
              />
            </div>
          </section>

          <section className={s.statusPriceSection} aria-label={t("home.botStatus")} data-tour-id="home-bot-status">
            <div className={s.statusRow}>
              <span className={s.statusLabel}>{t("home.botStatus")}</span>
              <div className={s.statusActive}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <circle cx="5" cy="5" r="5" fill="white" />
                </svg>
                <span className={s.statusText}>{isBotActive ? t("home.active") : t("home.inactive")}</span>
              </div>
            </div>

            <div className={s.priceRow}>
              <span className={s.priceLabel}>{t("home.actualPrice")}</span>
              <div className={s.priceAmount}>
                <span className={s.priceValue}>{priceDisplay}</span>
                <span className={s.priceCurrency}>{pricePair}</span>
              </div>
            </div>
          </section>

          <div className={s.botActionGrid} aria-label={t("home.botActionsAria")}>
            <div className={s.botActionRow}>
              <button
                type="button"
                className={`${s.btnStartHome} fm-interactive-pill${isBotActive || botSwitchLoading ? ` ${s.btnHomeDim}` : ""}`}
                data-tour-id="home-start-button"
                onClick={() => void applyBotState(true)}
                aria-disabled={isBotActive || botSwitchLoading}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 17.4C7.8 21 3 21 3 21C3 21 3 16.2 6.6 15" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M21 3C21 3 17.851 3.266 16 4C14.553 4.573 13.133 5.735 11.9 7C9.633 9.326 8 12 8 12L12 16C12 16 14.674 14.367 17 12.1C18.265 10.867 19.427 9.447 20 8C20.733 6.149 21 3 21 3Z" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M12 16L13 21H14L17 18V12.1" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M8 12L3 11V10L6 7H11.9" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                <span>{t("bot.start")}</span>
              </button>

              <button
                type="button"
                className={`${s.btnStopHome} fm-interactive-pill${!isBotActive || botSwitchLoading ? ` ${s.btnHomeDim}` : ""}`}
                data-tour-id="home-stop-button"
                onClick={() => void applyBotState(false)}
                aria-disabled={!isBotActive || botSwitchLoading}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5.5 5.5L18.5 18.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
                  <path d="M5.5 18.5L18.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
                </svg>
                <span>{t("bot.stop")}</span>
              </button>
            </div>

            <div className={s.botActionRow}>
              <button
                type="button"
                className={`${s.btnNeutralHome} fm-interactive-pill`}
                aria-label={t("home.channelAria")}
                onClick={() =>
                  openTelegramOrExternal((uiSettings?.channel_url ?? "").trim() || TELEGRAM_CHANNEL_URL)
                }
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M21 4H21.8V3.2H21V4ZM3 4V3.2H2.2V4H3ZM3 21H2.2C2.2 21.3236 2.39491 21.6153 2.69385 21.7391C2.99279 21.8629 3.33689 21.7945 3.56569 21.5657L3 21ZM6 18V17.2H5.66863L5.43431 17.4343L6 18ZM21 18V18.8H21.8V18H21ZM21 4V3.2H3V4V4.8H21V4ZM3 4H2.2V21H3H3.8V4H3ZM3 21L3.56569 21.5657L6.56569 18.5657L6 18L5.43431 17.4343L2.43431 20.4343L3 21ZM6 18V18.8H21V18V17.2H6V18ZM21 18H21.8V4H21H20.2V18H21Z"
                    fill="currentColor"
                    fillOpacity="0.45"
                  />
                  <path d="M8 11H8.01" stroke="currentColor" strokeOpacity="0.75" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 11H12.01" stroke="currentColor" strokeOpacity="0.75" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 11H16.01" stroke="currentColor" strokeOpacity="0.75" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{t("home.channel")}</span>
              </button>

              <button
                type="button"
                className={`${s.btnNeutralHome} fm-interactive-pill`}
                aria-label={t("home.chatAria")}
                onClick={() =>
                  openTelegramOrExternal((uiSettings?.chat_url ?? "").trim() || TELEGRAM_CHAT_URL)
                }
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 8H3V14H12L18 19V4L12 8Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 8V14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 14V20H10V14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path
                    d="M18 14C18.394 14 18.7841 13.9224 19.1481 13.7716C19.512 13.6209 19.8427 13.3999 20.1213 13.1213C20.3999 12.8427 20.6209 12.512 20.7716 12.1481C20.9224 11.7841 21 11.394 21 11C21 10.606 20.9224 10.2159 20.7716 9.85195C20.6209 9.48797 20.3999 9.15726 20.1213 8.87868C19.8427 8.6001 19.512 8.37913 19.1481 8.22836C18.7841 8.0776 18.394 8 18 8"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{t("home.chat")}</span>
              </button>
            </div>
          </div>
          </div>

          {/*
            FmMainLayout: .scroll всегда на всю высоту viewport → под коротким контентом виден «пол» скролла.
            Хвост забирает лишнюю высоту под #0a0a0a, не трогая gap между ценой и кнопками (только Home).
          */}
          <div className={s.scrollTail} aria-hidden="true" />
        </main>

      </div>
    </div>
  );
}
