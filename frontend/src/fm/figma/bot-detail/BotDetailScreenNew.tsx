/**
 * BotDetailScreenNew — Builder.io «Third Screen / Trade Bot» design port.
 *
 * UI:    100% Builder.io visual (colors, layout, flex-based — no position:absolute).
 * Data:  real API — fetchTradingJournal, fetchBotTrading, setBotTradingState, getStatsForPeriod.
 * Logic: 3-й экран — только торговая система (scope=system): вкладки 24h/7d/1m/all задают **одно**
 *        окно для графика, панели сделок/профита и ленты. Личный журнал пользователя сюда не подмешивается.
 * Adapt: height: 100dvh + flex layout, max-width 500px, no fixed pixels.
 */
import "../home/homeScreen.css";
import "./botDetailScreen.css";

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { hasApiBase } from "../../api/env";
import {
  fetchTradingJournal,
  type TradingJournalItem,
  type TradingJournalMeta,
} from "../../api/fetchTradingJournal";
import {
  fetchAlStateSnapshot,
  alStatePollIntervalMs,
  formatAlStateDisplayPrice,
  formatAlStatePricePair,
} from "../../api/fetchAlState";
import { fetchTradeFeedSnapshot, tradeFeedPollIntervalMs } from "../../api/fetchTradeFeed";
import { mergeTradeFeedPayloadToJournalItems } from "../../api/mergeAlTradeFeed";
import { botTradingStaticFallback, fetchBotTrading } from "../../api/fetchBotTrading";
import { getStatsForPeriod } from "../../api/parseBotTrading";
import { setBotTradingState } from "../../api/setBotTradingState";
import type { BotTradingSnapshot } from "../../api/typesBotTrading";
import {
  buildChartGeom,
  buildCompoundedChartPoints,
  CHART_VIEWBOX_HEIGHT,
  filterJournalRowsForBotChartPeriod,
  type GraphicPoint,
} from "../components/tradingChartPoints";
import { useFmLocale } from "../../i18n/useFmLocale";
import { routes } from "../routes";
import { consumePostOnboardingStartHighlight } from "../../onboarding-tour/onboardingStorage";
import { useAppSession } from "../../session/useAppSession";
import { useWalletDisplay } from "../useWalletDisplay";
import { appBarLogoUrl } from "../assets/appBarShared";
import { SkeletonChart, SkeletonFeedRows } from "../../components/Skeleton/SkeletonBlock";
import { BotJournalTradeCard } from "./BotJournalTradeCard";
import type { MessageKey } from "../../i18n/messages";

import s from "./botDetailScreenNew.module.css";

/* ── Types ──────────────────────────────────────────────────── */
type BotPeriod = "24h" | "7d" | "1m" | "all";
type TradeResultFilter = "all" | "positive" | "negative";

/* ── Refresh interval ────────────────────────────────────────── */
function botDetailRefreshMs(): number {
  const raw = import.meta.env.VITE_BOT_DETAIL_REFRESH_MS;
  if (raw == null || String(raw).trim() === "") return 5_000;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 2_000 ? n : 5_000;
}

/* ── Active-tab helper ───────────────────────────────────────── */
function useActiveNav() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/bot")) return "bot";
  if (pathname.startsWith("/balance") || pathname.startsWith("/deposit") || pathname.startsWith("/withdraw")) return "wallet";
  if (pathname.startsWith("/support") || pathname.startsWith("/faq")) return "support";
  return "home";
}

/* ── График: системная серия % за выбранный период вкладки (время → X, кумулятив → Y) ─ */
function TradingChart({ points }: { points: GraphicPoint[] }) {
  const geom = buildChartGeom(points, "percent");
  const yPct = 100 / CHART_VIEWBOX_HEIGHT;

  return (
    <div className={s.chartShell}>
      <div className={s.chartPlotRow}>
        <div className={s.chartYAxis} aria-hidden>
          {geom.yTicks.map((t, i) => (
            <span
              key={i}
              className={s.chartYAxisLabel}
              style={{ top: `${t.ySvg * yPct}%` }}
            >
              {t.label}
            </span>
          ))}
        </div>
        <div className={s.chartSvgCol}>
          <svg
            viewBox="0 0 325 122"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={s.chartSvg}
            preserveAspectRatio="none"
          >
            <defs>
              {/* Green → transparent only (no white stop — avoids a bright band / “second line” on large fills) */}
              <linearGradient id="bdChartGrad" x1="162.5" y1="0" x2="162.5" y2="122" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2EDD7D" stopOpacity="0.14" />
                <stop offset="1" stopColor="#2EDD7D" stopOpacity="0" />
              </linearGradient>
            </defs>
            {geom.yTicks.map((t, i) => (
              <line
                key={`grid-${i}`}
                x1="0"
                y1={t.ySvg}
                x2="325"
                y2={t.ySvg}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {geom.isEmpty ? null : (
              <>
                <path d={geom.pathArea} fill="url(#bdChartGrad)" />
                {/* Single series: one stroke only — deal markers omitted (white-ring dots looked like a second line when N is large) */}
                <path
                  d={geom.pathLine}
                  stroke="#2EDD7D"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
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

/* ── AppBar ──────────────────────────────────────────────────── */
function AppBar({ bellBadge }: { bellBadge?: number }) {
  const navigate = useNavigate();
  return (
    <header className={s.appBar}>
      <div className={s.appBarRow}>
        <button type="button" className={`${s.appBarBack} fm-appbar-hit-green`} onClick={() => navigate(routes.home)} aria-label="Back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 12.8H20.8V11.2H20V12V12.8ZM20 12V11.2H4V12V12.8H20V12Z" fill="#0A0A0A"/>
            <path d="M10 18L4 12L10 6" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className={`${s.appBarLogo} app-bar-logo-shimmer app-bar-logo-wordmark`} aria-label="Palladium">
          <img src={appBarLogoUrl} alt="Palladium" />
        </div>

        <div className={s.appBarIcons}>
          <Link to={routes.notifications} className={`${s.appBarBell} fm-appbar-hit-green`} aria-label="Notifications">
            <svg width="18" height="19" viewBox="0 0 18 19" fill="none">
              <path d="M2 15V7C2 5.143 2.738 3.363 4.05 2.05C5.363.738 7.143 0 9 0c1.857 0 3.637.738 4.95 2.05C15.263 3.363 16 5.143 16 7v8" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              <path d="M0 15H18" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              <path d="M7 19H11" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
            </svg>
            {bellBadge != null && bellBadge > 0 && (
              <span className={s.appBarBellBadge}><span>{bellBadge > 99 ? "99" : bellBadge}</span></span>
            )}
          </Link>
          <Link to={routes.settings} className={`${s.appBarGear} fm-appbar-hit-green`} aria-label="Settings">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7 5C5.895 5 5 5.895 5 7v1.172c0 .53-.211 1.04-.586 1.414l-1 1C2.633 11.367 2.633 12.633 3.414 13.414l1 1C4.789 14.789 5 15.298 5 15.828V17c0 1.105.895 2 2 2h1.172c.53 0 1.04.211 1.414.586l1 1C11.367 21.367 12.633 21.367 13.414 20.586l1-1C14.789 19.211 15.298 19 15.828 19H17c1.105 0 2-.895 2-2v-1.172c0-.53.211-1.04.586-1.414l1-1c.781-.781.781-2.047 0-2.828l-1-1A2 2 0 0 1 19 8.172V7c0-1.105-.895-2-2-2h-1.172c-.53 0-1.04-.211-1.414-.586l-1-1C12.633 2.633 11.367 2.633 10.586 3.414l-1 1A2 2 0 0 1 8.172 5H7Z" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
      <div className={s.appBarDivider} />
    </header>
  );
}

/* ── Bottom TabBar ───────────────────────────────────────────── */
function BottomTabBar({ active }: { active: string }) {
  const tabs = [
    {
      id: "home", to: routes.home, label: "Home",
      icon: (a: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M20 20H4V10L12 4L20 10V20Z" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 14V20" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: "wallet", to: routes.balanceDeposit, label: "Wallet",
      icon: (a: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 8H3V20H21V8Z" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 8V4H17V8" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 14H17" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: "bot", to: routes.bot, label: "Bot",
      icon: (a: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M4 4V20H20" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
          <path d="M9 13L13 9L16 12L20 8" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: "support", to: routes.support, label: "Support",
      icon: (a: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 4H21.8V3.2H21V4ZM3 4V3.2H2.2V4H3ZM3 21H2.2c0 .324.195.615.694.739.299.124.637.06.866-.169L3 21ZM6 18V17.2H5.669l-.235.235L6 18ZM21 18V18.8H21.8V18H21ZM21 4V3.2H3V4V4.8H21V4ZM3 4H2.2V21H3H3.8V4H3ZM3 21l.566.566 3-3L6 18l-.435-.435-3 3L3 21ZM6 18V18.8H21V18V17.2H6V18ZM21 18H21.8V4H21H20.2V18H21Z" fill={a ? "#fff" : "#55647B"}/>
          <path d="M8 11H8.01M12 11H12.01M16 11H16.01" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ] as const;

  return (
    <nav className={s.tabBar} aria-label="Primary navigation">
      <div className={s.tabBarInner}>
        {tabs.map(({ id, to, label, icon }) => {
          const isActive = active === id;
          return (
            <Link
              key={id}
              to={to}
              className={`${s.tabItem}${isActive ? ` ${s.tabItemActive}` : ""}`}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
            >
              {icon(isActive)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* ── Main Screen ─────────────────────────────────────────────── */
export default function BotDetailScreenNew() {
  const navigate = useNavigate();
  const { t } = useFmLocale();
  const { phase, mode, botRunning, refreshWallet, setBotRunning, notificationUnreadCount } = useAppSession();
  const { balanceUsdt: balance } = useWalletDisplay();
  const activeNav = useActiveNav();

  const [tradingFromApi, setTradingFromApi] = useState<BotTradingSnapshot | null>(null);
  const [journalRows, setJournalRows] = useState<TradingJournalItem[]>([]);
  /** `system_chart` с бэкенда для выбранной вкладки периода (тот же запрос, что лента и stats). */
  const [systemChartPoints, setSystemChartPoints] = useState<GraphicPoint[]>([]);
  const [journalMeta, setJournalMeta] = useState<TradingJournalMeta | null>(null);
  const [journalLoading, setJournalLoading] = useState(false);
  /** Снимок AL trade-feed с бэкенда (прокси); если непустой — показываем в ленте вместо journal-only. */
  const [alFeedJournalRows, setAlFeedJournalRows] = useState<TradingJournalItem[]>([]);
  const [botSwitchLoading, setBotSwitchLoading] = useState(false);
  const [period, setPeriod] = useState<BotPeriod>("24h");
  const [tradeResultFilter, setTradeResultFilter] = useState<TradeResultFilter>("all");
  /** Подмена «актуальная цена» из GET /trading/al-state; при ошибке/не настроено/нет сделки — сброс, дальше summary (`fetchBotTrading`). */
  const [alStatePriceOverlay, setAlStatePriceOverlay] = useState<{
    displayPrice: string;
    pricePair: string;
  } | null>(null);
  const [postOnboardingStartCue, setPostOnboardingStartCue] = useState(false);

  useEffect(() => {
    if (!consumePostOnboardingStartHighlight()) return;
    setPostOnboardingStartCue(true);
    const id = window.setTimeout(() => setPostOnboardingStartCue(false), 3200);
    return () => window.clearTimeout(id);
  }, []);

  const trading = useMemo(() => {
    const base = tradingFromApi ?? botTradingStaticFallback;
    if (!alStatePriceOverlay) return base;
    return {
      ...base,
      displayPrice: alStatePriceOverlay.displayPrice,
      pricePair: alStatePriceOverlay.pricePair,
    };
  }, [tradingFromApi, alStatePriceOverlay]);

  const hasLivePriceFromApiOrAl = tradingFromApi != null || alStatePriceOverlay != null;
  const fromJournal = balance <= 0;
  const chartPoints = useMemo(() => {
    if (alFeedJournalRows.length > 0) {
      const windowed = filterJournalRowsForBotChartPeriod(alFeedJournalRows, period);
      const alPts = buildCompoundedChartPoints(windowed);
      if (alPts.length > 0) return alPts;
    }
    return systemChartPoints;
  }, [alFeedJournalRows, systemChartPoints, period]);

  const apiSessionReady = !hasApiBase() || phase === "ready";
  const feedWaitingForSession = hasApiBase() && (phase === "idle" || phase === "bootstrapping");

  useEffect(() => {
    if (!hasApiBase()) {
      setJournalRows([]);
      setSystemChartPoints([]);
      setJournalMeta(null);
      return;
    }
    if (!apiSessionReady) return;

    let cancelled = false;
    const refreshMs = botDetailRefreshMs();
    const journalLoadInFlightRef = { current: false };

    const load = async (showSpinner: boolean) => {
      if (journalLoadInFlightRef.current) return;
      journalLoadInFlightRef.current = true;
      if (showSpinner) {
        setJournalLoading(true);
        // Keep previous rows visible while new period data loads to avoid static-chart flash
        setJournalMeta(null);
      }
      try {
        const [jr, snap] = await Promise.all([
          fetchTradingJournal(100, period, "system"),
          fetchBotTrading(period),
        ]);
        if (cancelled) return;
        setJournalRows(jr.items);
        setSystemChartPoints(jr.system_chart.map((p) => ({ occurred_at: p.occurred_at, value_pct: p.value_pct })));
        setJournalMeta(jr.meta);
        if (snap) setTradingFromApi(snap);
      } finally {
        journalLoadInFlightRef.current = false;
        if (showSpinner && !cancelled) setJournalLoading(false);
      }
    };

    void load(true);
    const intervalId = window.setInterval(() => void load(false), refreshMs);
    return () => { cancelled = true; window.clearInterval(intervalId); };
  }, [apiSessionReady, period]);

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
          if (import.meta.env.DEV) console.debug("[BotDetail][al-trade-feed]", { ok: false, error: r.error });
          setAlFeedJournalRows([]);
          return;
        }
        const merged = mergeTradeFeedPayloadToJournalItems(r.data.opens, r.data.closes);
        if (import.meta.env.DEV) {
          console.debug("[BotDetail][al-trade-feed]", {
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

  useEffect(() => {
    if (!hasApiBase() || !apiSessionReady) {
      setAlStatePriceOverlay(null);
      return;
    }
    let cancelled = false;
    let intervalId = 0;
    let inFlight = false;
    const pollMs = alStatePollIntervalMs();

    const tick = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const r = await fetchAlStateSnapshot();
        if (cancelled) return;
        if (!r.ok) {
          if (import.meta.env.DEV) console.debug("[BotDetail][al-state]", { ok: false, error: r.error });
          setAlStatePriceOverlay(null);
          return;
        }
        if (!r.data.configured) {
          if (import.meta.env.DEV) console.debug("[BotDetail][al-state]", { configured: false });
          setAlStatePriceOverlay(null);
          return;
        }
        const at = r.data.activeTrade;
        if (at == null || !Number.isFinite(at.currentPrice)) {
          setAlStatePriceOverlay(null);
          return;
        }
        setAlStatePriceOverlay({
          displayPrice: formatAlStateDisplayPrice(at.currentPrice),
          pricePair: formatAlStatePricePair(at.pair),
        });
        if (import.meta.env.DEV) {
          console.debug("[BotDetail][al-state]", {
            configured: r.data.configured,
            isRunning: r.data.isRunning,
            currentPrice: at.currentPrice,
            pair: at.pair,
          });
        }
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

  const feedRowsForList = useMemo(
    () => (alFeedJournalRows.length > 0 ? alFeedJournalRows : journalRows),
    [alFeedJournalRows, journalRows],
  );

  const defaultStat = { totalDeals: 0, successful: 0, unsuccessful: 0, profitPercent: 0, neutral: 0, openInPeriod: 0, closedWithoutResult: 0 };
  const zeroStat    = { totalDeals: 0,  successful: 0,  unsuccessful: 0,  profitPercent: 0,     neutral: 0, openInPeriod: 0, closedWithoutResult: 0 };

  const periodStats = useMemo(() => {
    const ps = journalMeta?.period_stats;
    const pf = journalMeta?.period_filter;
    const statsMatchPeriod = pf == null || pf === "" || pf === period;
    if (ps != null && statsMatchPeriod) return ps;
    return getStatsForPeriod(
      trading,
      period,
      tradingFromApi
        ? zeroStat
        : (botTradingStaticFallback.byPeriod[period] ??
            botTradingStaticFallback.byPeriod["24h"] ??
            defaultStat),
    );
  }, [journalMeta, period, trading, tradingFromApi]);

  const filteredJournalRows = useMemo(() => {
    if (tradeResultFilter === "all") return feedRowsForList;
    return feedRowsForList.filter(row => {
      if (row.status !== "closed") return false;
      const rp = row.result_percent;
      if (tradeResultFilter === "positive") return rp != null && rp > 0;
      return rp == null || rp <= 0;
    });
  }, [feedRowsForList, tradeResultFilter]);

  const isBotActive = balance > 0 && botRunning;
  const fmtPct = (n: number) => `${n.toFixed(2)} %`;

  async function applyBotState(enabled: boolean) {
    if (botSwitchLoading) return;                           // prevent double-click while API is in flight
    if (balance <= 0 && enabled) { navigate(routes.depositTopUp); return; }
    if (!hasApiBase() || mode === "mock") { setBotRunning(enabled); return; }
    setBotSwitchLoading(true);
    try {
      const result = await setBotTradingState(enabled);
      if (!result.ok) {
        // API returned an error — still toggle locally so user sees feedback
        setBotRunning(enabled);
        return;
      }
      setBotRunning(result.botTradingEnabled ?? enabled);
      await refreshWallet();
    } catch {
      // Network error (Failed to fetch) — toggle locally as fallback
      setBotRunning(enabled);
    } finally {
      setBotSwitchLoading(false);
    }
  }

  const PERIOD_TABS: BotPeriod[] = ["24h", "7d", "1m", "all"];

  function periodTabLabel(tab: BotPeriod): string {
    if (tab === "24h") return t("bot.period24h");
    if (tab === "7d") return t("bot.period7d");
    if (tab === "1m") return t("bot.period1m");
    return t("bot.periodAll");
  }

  const FEED_FILTERS: Array<{ key: TradeResultFilter; label: string }> = [
    { key: "all",      label: t("bot.feedFilterAll") },
    { key: "positive", label: t("bot.feedFilterPositive") },
    { key: "negative", label: t("bot.feedFilterNegative") },
  ];

  return (
    <div className={s.page} aria-label={t("bot.ariaScreen")}>
      <div className={s.container}>
        <header className={s.header}>
          <div className={s.headerBlobs} aria-hidden="true">
            <div className={s.blobTopLeft} />
            <div className={s.blobBottomRight} />
          </div>

          <AppBar bellBadge={notificationUnreadCount} />

          <div className={s.headerBody}>
        {/* ── Bot Status ───────────────────────────────────── */}
        <section className={s.statusSection} aria-label={t("bot.statusAria")}>
          <div className={s.statusRow}>
            <div className={s.statusLine}>
              <span className={s.statusCaption}>{t("bot.statusCaption")}</span>
              <div className={s.statusLiveRow}>
                <span className={`${s.statusDot} ${isBotActive ? s.statusDotActive : s.statusDotInactive}`} aria-hidden="true" />
                <span className={`${s.statusLabel} ${isBotActive ? s.statusLabelActive : s.statusLabelInactive}`}>
                  {isBotActive ? t("bot.active") : t("bot.inactive")}
                </span>
              </div>
            </div>

            <div className={s.priceLine}>
              <span className={s.priceCaption}>{t("bot.actualPriceCaption")}</span>
              <div className={s.priceGroup}>
                <span className={s.priceNum}>{trading.displayPrice}</span>
                <span className={s.pricePair}>
                  {hasLivePriceFromApiOrAl ? trading.pricePair : t("bot.pairBtc")}
                </span>
              </div>
            </div>
          </div>

          <div className={s.actionRow}>
            <button
              type="button"
              className={`${s.btnStart} fm-interactive-pill${isBotActive || botSwitchLoading ? ` ${s.btnDim}` : ""}${postOnboardingStartCue ? ` ${s.btnStartCue}` : ""}`}
              data-tour-id="bot-start-button"
              onClick={() => void applyBotState(true)}
              aria-disabled={isBotActive || botSwitchLoading}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 17.4C7.8 21 3 21 3 21C3 21 3 16.2 6.6 15" stroke="#191919" strokeWidth="1.6"/>
                <path d="M21 3C21 3 17.851 3.266 16 4C14.553 4.573 13.133 5.735 11.9 7C9.633 9.326 8 12 8 12L12 16C12 16 14.674 14.367 17 12.1C18.265 10.867 19.427 9.447 20 8C20.733 6.149 21 3 21 3Z" stroke="#191919" strokeWidth="1.6"/>
                <path d="M12 16L13 21H14L17 18V12.1" stroke="#191919" strokeWidth="1.6"/>
                <path d="M8 12L3 11V10L6 7H11.9" stroke="#191919" strokeWidth="1.6"/>
              </svg>
              <span>{t("bot.start")}</span>
            </button>

            <button
              className={`${s.btnStop} fm-interactive-pill${!isBotActive || botSwitchLoading ? ` ${s.btnDim}` : ""}`}
              onClick={() => void applyBotState(false)}
              aria-disabled={!isBotActive || botSwitchLoading}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5.5 5.5L18.5 18.5" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
                <path d="M5.5 18.5L18.5 5.5" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              </svg>
              <span>{t("bot.stop")}</span>
            </button>
          </div>
        </section>
          </div>
        </header>

        <div className={s.body}>
          <div className={s.bodyPreFeed}>

        {/* ── Trading Stats ─────────────────────────────── */}
        <section
          className={s.statsSection}
          aria-label={fromJournal ? t("bot.statsAriaJournal") : t("bot.statsAriaAlgo")}
        >
          <h2 className={s.sectionTitle}>{t("bot.periodTitle")}</h2>

          {/* Chart comes first — above the period tabs; dim + spinner while period data reloads */}
          <div className={s.chartAreaWrap} data-tour-id="trading-chart">
            <div className={journalLoading ? s.chartDimmed : undefined}>
              <TradingChart points={chartPoints} />
            </div>
            {journalLoading ? (
              <div
                className={s.chartSpinnerOverlay}
                role="status"
                aria-label={t("common.loading")}
              >
                <SkeletonChart variant="trading" plotAreaOnly />
              </div>
            ) : null}
          </div>

          {/* Timeframe tabs */}
          <div className={s.periodTabs} role="tablist" aria-label={t("bot.periodTabsAria")}>
            {PERIOD_TABS.map(tab => (
              <button
                key={tab}
                role="tab"
                aria-selected={period === tab}
                className={`${s.periodTab} ${period === tab ? s.periodTabActive : s.periodTabInactive} fm-interactive-chip`}
                onClick={() => setPeriod(tab)}
              >
                {periodTabLabel(tab)}
              </button>
            ))}
          </div>

          {/* Stats card */}
          <div className={s.statsCard}>
            <div className={s.statsRow}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 17.4C7.8 21 3 21 3 21C3 21 3 16.2 6.6 15" stroke="#FF7B2A" strokeWidth="1.6"/>
                <path d="M21 3C21 3 17.851 3.266 16 4C14.553 4.573 13.133 5.735 11.9 7C9.633 9.326 8 12 8 12L12 16C12 16 14.674 14.367 17 12.1C18.265 10.867 19.427 9.447 20 8C20.733 6.149 21 3 21 3Z" stroke="#FF7B2A" strokeWidth="1.6"/>
                <path d="M12 16L13 21H14L17 18V12.1" stroke="#FF7B2A" strokeWidth="1.6"/>
                <path d="M8 12L3 11V10L6 7H11.9" stroke="#FF7B2A" strokeWidth="1.6"/>
              </svg>
              <span className={s.statsLabel}>{t("bot.statTotalDeals")}</span>
              <span className={s.statsVal}>{periodStats.totalDeals}</span>
            </div>
            <div className={s.statsRow}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 12L10 17L20 7" stroke="#40FF96" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round"/>
              </svg>
              <span className={s.statsLabel}>{t("bot.statSuccessful")}</span>
              <span className={s.statsVal}>{periodStats.successful}</span>
            </div>
            <div className={s.statsRow}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5.5 5.5L18.5 18.5" stroke="#FF0000" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
                <path d="M5.5 18.5L18.5 5.5" stroke="#FF0000" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              </svg>
              <span className={s.statsLabel}>{t("bot.statUnsuccessful")}</span>
              <span className={s.statsVal}>{periodStats.unsuccessful}</span>
            </div>
            <div className={s.statsRow}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 17L9 11L13 15L21 7" stroke="#40FF96" strokeWidth="1.6" strokeLinejoin="round"/>
                <path d="M21 14V7H14" stroke="#40FF96" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              </svg>
              <span className={s.statsLabel}>{t("bot.statProfitPct")}</span>
              <span className={s.statsVal}>{fmtPct(periodStats.profitPercent)}</span>
            </div>
          </div>
        </section>
        </div>

        {/* Липко только ниже: до этого уезжает весь bodyPreFeed (период, график, статы) */}
        {/* ── Trade Feed: липкий блок заголовок+фильтры под app bar, список скроллится в том же .body ─ */}
        <section
          className={s.feedSection}
          aria-label={fromJournal ? t("bot.feedAriaJournal") : t("bot.feedAriaAlgo")}
        >
          <div className={s.feedSpacer} aria-hidden="true" />
          <div className={s.feedStickyHeader} data-tour-id="trading-open-trade">
            <h2 className={s.sectionTitle}>{t("bot.feedTitleAlgo")}</h2>
            <div className={s.feedFilters} role="tablist" aria-label={t("bot.feedFilterAria")}>
              {FEED_FILTERS.map(({ key, label }) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={tradeResultFilter === key}
                  className={`${s.feedFilter} ${tradeResultFilter === key ? s.feedFilterActive : s.feedFilterInactive} fm-interactive-chip`}
                  onClick={() => setTradeResultFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {!hasApiBase() ? (
            <p className={s.feedPlaceholder}>{t("bot.feedNeedApi")}</p>
          ) : feedWaitingForSession ? (
            <div className={s.feedLoadingBlock} role="status" aria-label={t("bot.feedLoading")}>
              <SkeletonFeedRows count={5} />
            </div>
          ) : journalLoading ? (
            <div className={s.feedLoadingBlock} role="status" aria-label={t("bot.feedLoading")}>
              <SkeletonFeedRows count={5} />
            </div>
          ) : feedRowsForList.length === 0 ? (
            <p className={s.feedPlaceholder}>
              {journalMeta?.al_feed_configured === false
                ? t("bot.feedEmpty")
                : !journalMeta?.al_sync_includes_user
                  ? t("bot.feedEmptyDeposit")
                  : t("bot.feedEmptyWaiting")}
            </p>
          ) : filteredJournalRows.length === 0 ? (
            <p className={s.feedPlaceholder}>{t("bot.feedFilterEmpty")}</p>
          ) : (
            <ul className={s.feedList} data-tour-id="trading-history-cards">
              {filteredJournalRows.map((row) => (
                <li key={row.id}>
                  <BotJournalTradeCard
                    row={row}
                    t={(key: MessageKey, vars?: Record<string, string | number>) => t(key, vars)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

        {/* Bottom glow decoration */}
        <div className={s.bottomGlow} aria-hidden="true" />
        <div className={s.bottomGlowSmall} aria-hidden="true" />

        {/* Bottom nav fixed inside container */}
        <div className={s.tabBarWrap} data-tour-id="trading-tab-bar">
          <BottomTabBar active={activeNav} />
        </div>
      </div>
    </div>
  );
}
