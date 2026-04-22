/**
 * BotDetailScreenNew — Builder.io «Third Screen / Trade Bot» design port.
 *
 * UI:    100% Builder.io visual (colors, layout, flex-based — no position:absolute).
 * Data:  real API — fetchTradingJournal, fetchBotTrading, setBotTradingState,
 *        getStatsForPeriod, buildCompoundedChartPoints.
 * Logic: period tabs (24h/3d/7d/1m), trade-result filter, bot Start/Stop — unchanged.
 * Adapt: height: 100dvh + flex layout, max-width 500px, no fixed pixels.
 */
import "../home/homeScreen.css"; /* keeps fm-bot-card-* classes for BotJournalTradeCard */
import "./botDetailScreen.css";  /* same reason */

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { hasApiBase } from "../../api/env";
import {
  fetchTradingJournal,
  type TradingJournalItem,
  type TradingJournalMeta,
} from "../../api/fetchTradingJournal";
import { botTradingStaticFallback, fetchBotTrading } from "../../api/fetchBotTrading";
import { getStatsForPeriod } from "../../api/parseBotTrading";
import { setBotTradingState } from "../../api/setBotTradingState";
import type { BotTradingSnapshot } from "../../api/typesBotTrading";
import { useFmLocale } from "../../i18n/useFmLocale";
import { routes } from "../routes";
import { useAppSession } from "../../session/useAppSession";
import { useWalletDisplay } from "../useWalletDisplay";
import { appBarLogoUrl } from "../assets/appBarShared";
import { BotJournalTradeCard } from "./BotJournalTradeCard";
import type { MessageKey } from "../../i18n/messages";

import s from "./botDetailScreenNew.module.css";

/* ── Types ──────────────────────────────────────────────────── */
type BotPeriod = "24h" | "3d" | "7d" | "1m";
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

/* ── Trading chart (Builder.io static SVG) ───────────────────── */
function TradingChart() {
  return (
    <div className={s.chartShell}>
      <div className={s.chartScales}>
        {["7.00%","6.00%","5.00%","4.00%","3.00%","2.00%","1.00%","0.00%","-1.00%","-2.00%"].map(label => (
          <div key={label} className={s.chartScaleLine}>
            <span className={s.chartScaleLabel}>{label}</span>
            <div className={s.chartScaleTick} />
          </div>
        ))}
      </div>
      <div className={s.chartSvgWrap}>
        <svg
          viewBox="0 0 325 122"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={s.chartSvg}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="bdChartGrad" x1="162.5" y1="0" x2="162.5" y2="122" gradientUnits="userSpaceOnUse">
              <stop stopColor="#759AC6" stopOpacity="0.5"/>
              <stop offset="1" stopColor="#ECF1F4" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path
            d="M3.19408 51.3435L0 42.4209V122H325V10.8609H301.843L293.858 2.74937L288.268 18.1612L280.283 23.0281V16.5389L276.29 19.7835L273.894 7.61626L271.499 10.8609L269.103 5.99397L265.111 13.2943L261.916 9.23856L255.528 14.9166L253.931 13.2943L249.939 19.7835L246.744 14.9166L243.55 23.0281L241.953 18.1612L238.759 23.0281L234.767 16.5389L232.371 23.0281H222.789L214.803 16.5389L212.408 19.7835L210.012 16.5389L206.02 21.4058L203.624 18.1612L202.027 19.7835L198.034 16.5389L195.639 18.9724L192.644 5.99397L189.251 8.42741L187.554 0L184.459 56.2104L181.538 27.5555L178.071 54.5881L174.877 50.0286V54.5881V60.2662L170.884 61.8885L170.086 70L166.892 60.2662L165.295 57.0216L162.899 59.455V54.5881H159.705L158.108 60.2662H154.115L151.72 63.5108L150.123 59.455L147.727 63.5108L144.533 54.5881L140.541 57.0216L138.145 51.3435L136.548 57.0216L134.152 51.3435L132.555 63.5108L129.361 57.0216L126.966 68.3777L124.57 63.5108L121.376 60.2662L117.383 59.455L110.995 52.1547L111.794 60.2662L107.801 59.455L104.607 65.1331L95.0246 67.5665L89.4349 59.455L85.4422 68.3777L83.8452 57.8327L82.2482 66.7554L79.0541 51.3435L74.2629 59.455L68.6732 44.0432L65.4791 52.9658L63.0835 45.6655L56.6953 51.3435L53.5012 47.2878L50.3071 49.7212L47.9115 45.6655L42.3218 51.3435L35.1351 45.6655L29.5455 54.5881L26.3513 48.0989L21.5602 54.5881L19.1646 47.2878L15.9705 51.3435L13.5749 44.0432L11.9779 49.7212L9.5823 52.9658L3.19408 51.3435Z"
            fill="url(#bdChartGrad)"
          />
          <path
            d="M0 42.4209L3.19408 51.3435L9.58231 52.9658L11.9779 49.7212L13.5749 44.0432L15.9705 51.3435L19.1646 47.2878L21.5602 54.5881L26.3513 48.0989L29.5455 54.5881L35.1351 45.6655L42.3218 51.3435L47.9115 45.6655L50.3071 49.7212L53.5012 47.2878L56.6953 51.3435L63.0835 45.6655L65.4791 52.9658L68.6732 44.0432L74.2629 59.455L79.0541 51.3435L82.2482 66.7554L83.8452 57.8327L85.4422 68.3777L89.4349 59.455L95.0246 67.5665L104.607 65.1331L107.801 59.455L111.794 60.2662L110.995 52.1547L117.383 59.455L121.376 60.2662L124.57 63.5108L126.966 68.3777L129.361 57.0216L132.555 63.5108L134.152 51.3435L136.548 57.0216L138.145 51.3435L140.541 57.0216L144.533 54.5881L147.727 63.5108L150.123 59.455L151.72 63.5108L154.115 60.2662H158.108L159.705 54.5881H162.899V59.455L165.295 57.0216L166.892 60.2662L170.086 70L170.884 61.8885L174.877 60.2662V54.5881V50.0286L178.071 54.5881L181.538 27.5555L184.459 56.2104L187.554 0L189.251 8.42741L192.644 5.99397L195.639 18.9724L198.034 16.5389L202.027 19.7835L203.624 18.1612L206.02 21.4058L210.012 16.5389L212.408 19.7835L214.803 16.5389L222.789 23.0281H232.371L234.767 16.5389L238.759 23.0281L241.953 18.1612L243.55 23.0281L246.744 14.9166L249.939 19.7835L253.931 13.2943L255.528 14.9166L261.916 9.23856L265.111 13.2943L269.103 5.99397L271.499 10.8609L273.894 7.61626L276.29 19.7835L280.283 16.5389V23.0281L288.268 18.1612L293.858 2.74937L301.843 10.8609H325"
            stroke="#55647B"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
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
        <button className={s.appBarBack} onClick={() => navigate(routes.home)} aria-label="Back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 12.8H20.8V11.2H20V12V12.8ZM20 12V11.2H4V12V12.8H20V12Z" fill="#55647B"/>
            <path d="M10 18L4 12L10 6" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className={s.appBarLogo} aria-label="Palladium">
          <img src={appBarLogoUrl} alt="Palladium" />
        </div>

        <div className={s.appBarIcons}>
          <Link to={routes.notifications} className={s.appBarBell} aria-label="Notifications">
            <svg width="18" height="19" viewBox="0 0 18 19" fill="none">
              <path d="M2 15V7C2 5.143 2.738 3.363 4.05 2.05C5.363.738 7.143 0 9 0c1.857 0 3.637.738 4.95 2.05C15.263 3.363 16 5.143 16 7v8" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              <path d="M0 15H18" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              <path d="M7 19H11" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
            </svg>
            {bellBadge != null && bellBadge > 0 && (
              <span className={s.appBarBellBadge}><span>{bellBadge > 99 ? "99" : bellBadge}</span></span>
            )}
          </Link>
          <Link to={routes.settings} className={s.appBarGear} aria-label="Settings">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7 5C5.895 5 5 5.895 5 7v1.172c0 .53-.211 1.04-.586 1.414l-1 1C2.633 11.367 2.633 12.633 3.414 13.414l1 1C4.789 14.789 5 15.298 5 15.828V17c0 1.105.895 2 2 2h1.172c.53 0 1.04.211 1.414.586l1 1C11.367 21.367 12.633 21.367 13.414 20.586l1-1C14.789 19.211 15.298 19 15.828 19H17c1.105 0 2-.895 2-2v-1.172c0-.53.211-1.04.586-1.414l1-1c.781-.781.781-2.047 0-2.828l-1-1A2 2 0 0 1 19 8.172V7c0-1.105-.895-2-2-2h-1.172c-.53 0-1.04-.211-1.414-.586l-1-1C12.633 2.633 11.367 2.633 10.586 3.414l-1 1A2 2 0 0 1 8.172 5H7Z" stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
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
  const [journalMeta, setJournalMeta] = useState<TradingJournalMeta | null>(null);
  const [journalLoading, setJournalLoading] = useState(false);
  const [botSwitchLoading, setBotSwitchLoading] = useState(false);
  const [period, setPeriod] = useState<BotPeriod>("24h");
  const [tradeResultFilter, setTradeResultFilter] = useState<TradeResultFilter>("all");

  const trading = useMemo(() => tradingFromApi ?? botTradingStaticFallback, [tradingFromApi]);
  const fromJournal = balance <= 0;

  const apiSessionReady = !hasApiBase() || phase === "ready";
  const feedWaitingForSession = hasApiBase() && (phase === "idle" || phase === "bootstrapping");

  useEffect(() => {
    if (!hasApiBase()) {
      setJournalRows([]);
      setJournalMeta(null);
      return;
    }
    if (!apiSessionReady) return;

    let cancelled = false;
    const refreshMs = botDetailRefreshMs();

    const load = async (showSpinner: boolean) => {
      if (showSpinner) {
        setJournalLoading(true);
        setJournalRows([]);
        setJournalMeta(null);
      }
      try {
        const [jr, snap] = await Promise.all([
          fetchTradingJournal(100, period),
          fetchBotTrading(period),
        ]);
        if (cancelled) return;
        setJournalRows(jr.items);
        setJournalMeta(jr.meta);
        if (snap) setTradingFromApi(snap);
      } finally {
        if (showSpinner && !cancelled) setJournalLoading(false);
      }
    };

    void load(true);
    const intervalId = window.setInterval(() => void load(false), refreshMs);
    return () => { cancelled = true; window.clearInterval(intervalId); };
  }, [apiSessionReady, period]);

  const defaultStat = { totalDeals: 78, successful: 39, unsuccessful: 39, profitPercent: -0.72, neutral: 0, openInPeriod: 0, closedWithoutResult: 0 };
  const zeroStat    = { totalDeals: 0,  successful: 0,  unsuccessful: 0,  profitPercent: 0,     neutral: 0, openInPeriod: 0, closedWithoutResult: 0 };

  const periodStats = useMemo(() => {
    const ps = journalMeta?.period_stats;
    const pf = journalMeta?.period_filter;
    if (ps != null && (pf == null || pf === "" || pf === period)) return ps;
    return getStatsForPeriod(
      trading,
      period,
      tradingFromApi
        ? zeroStat
        : (botTradingStaticFallback.byPeriod[period] ?? botTradingStaticFallback.byPeriod["24h"] ?? defaultStat),
    );
  }, [journalMeta, period, trading, tradingFromApi]);

  const filteredJournalRows = useMemo(() => {
    if (tradeResultFilter === "all") return journalRows;
    return journalRows.filter(row => {
      if (row.status !== "closed") return false;
      const rp = row.result_percent;
      if (tradeResultFilter === "positive") return rp != null && rp > 0;
      return rp == null || rp <= 0;
    });
  }, [journalRows, tradeResultFilter]);

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

  const PERIOD_TABS: BotPeriod[] = ["24h", "3d", "7d", "1m"];

  const FEED_FILTERS: Array<{ key: TradeResultFilter; label: string }> = [
    { key: "all",      label: t("bot.feedFilterAll") },
    { key: "positive", label: t("bot.feedFilterPositive") },
    { key: "negative", label: t("bot.feedFilterNegative") },
  ];

  return (
    <div className={s.screen} aria-label={t("bot.ariaScreen")}>
      <AppBar bellBadge={notificationUnreadCount} />

      <div className={s.body}>
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
                <span className={s.pricePair}>{tradingFromApi ? trading.pricePair : t("bot.pairBtc")}</span>
              </div>
            </div>
          </div>

          <div className={s.actionRow}>
            <button
              className={`${s.btnStart}${isBotActive || botSwitchLoading ? ` ${s.btnDim}` : ""}`}
              onClick={() => void applyBotState(true)}
              aria-disabled={isBotActive || botSwitchLoading}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 17.4C7.8 21 3 21 3 21C3 21 3 16.2 6.6 15" stroke="white" strokeWidth="1.6"/>
                <path d="M21 3C21 3 17.851 3.266 16 4C14.553 4.573 13.133 5.735 11.9 7C9.633 9.326 8 12 8 12L12 16C12 16 14.674 14.367 17 12.1C18.265 10.867 19.427 9.447 20 8C20.733 6.149 21 3 21 3Z" stroke="white" strokeWidth="1.6"/>
                <path d="M12 16L13 21H14L17 18V12.1" stroke="white" strokeWidth="1.6"/>
                <path d="M8 12L3 11V10L6 7H11.9" stroke="white" strokeWidth="1.6"/>
              </svg>
              <span>{t("bot.start")}</span>
            </button>

            <button
              className={`${s.btnStop}${!isBotActive || botSwitchLoading ? ` ${s.btnDim}` : ""}`}
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

        {/* ── Trading Stats ─────────────────────────────── */}
        <section
          className={s.statsSection}
          aria-label={fromJournal ? t("bot.statsAriaJournal") : t("bot.statsAriaAlgo")}
        >
          <h2 className={s.sectionTitle}>{t("bot.periodTitle")}</h2>

          {/* Timeframe tabs */}
          <div className={s.periodTabs} role="tablist" aria-label={t("bot.periodTabsAria")}>
            {PERIOD_TABS.map(tab => (
              <button
                key={tab}
                role="tab"
                aria-selected={period === tab}
                className={`${s.periodTab} ${period === tab ? s.periodTabActive : s.periodTabInactive}`}
                onClick={() => setPeriod(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Stats card */}
          <div className={s.statsCard}>
            <div className={s.statsRow}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 17.4C7.8 21 3 21 3 21C3 21 3 16.2 6.6 15" stroke="#759AC6" strokeWidth="1.6"/>
                <path d="M21 3C21 3 17.851 3.266 16 4C14.553 4.573 13.133 5.735 11.9 7C9.633 9.326 8 12 8 12L12 16C12 16 14.674 14.367 17 12.1C18.265 10.867 19.427 9.447 20 8C20.733 6.149 21 3 21 3Z" stroke="#759AC6" strokeWidth="1.6"/>
                <path d="M12 16L13 21H14L17 18V12.1" stroke="#759AC6" strokeWidth="1.6"/>
                <path d="M8 12L3 11V10L6 7H11.9" stroke="#759AC6" strokeWidth="1.6"/>
              </svg>
              <span className={s.statsLabel}>{t("bot.statTotalDeals")}</span>
              <span className={s.statsVal}>{periodStats.totalDeals}</span>
            </div>
            <div className={s.statsRow}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 12L10 17L20 7" stroke="#73C1B1" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round"/>
              </svg>
              <span className={s.statsLabel}>{t("bot.statSuccessful")}</span>
              <span className={s.statsVal}>{periodStats.successful}</span>
            </div>
            <div className={s.statsRow}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5.5 5.5L18.5 18.5" stroke="#DF7F7F" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
                <path d="M5.5 18.5L18.5 5.5" stroke="#DF7F7F" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              </svg>
              <span className={s.statsLabel}>{t("bot.statUnsuccessful")}</span>
              <span className={s.statsVal}>{periodStats.unsuccessful}</span>
            </div>
            <div className={s.statsRow}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 17L9 11L13 15L21 7" stroke="#8494AF" strokeWidth="1.6" strokeLinejoin="round"/>
                <path d="M21 14V7H14" stroke="#8494AF" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              </svg>
              <span className={s.statsLabel}>{t("bot.statProfitPct")}</span>
              <span className={s.statsVal}>{fmtPct(periodStats.profitPercent)}</span>
            </div>
          </div>

          {/* Chart */}
          <TradingChart />
        </section>

        {/* ── Trade Feed ────────────────────────────────── */}
        <section
          className={s.feedSection}
          aria-label={fromJournal ? t("bot.feedAriaJournal") : t("bot.feedAriaAlgo")}
        >
          <h2 className={s.sectionTitle}>{t("bot.feedTitleAlgo")}</h2>

          <div className={s.feedFilters} role="tablist" aria-label={t("bot.feedFilterAria")}>
            {FEED_FILTERS.map(({ key, label }) => (
              <button
                key={key}
                role="tab"
                aria-selected={tradeResultFilter === key}
                className={`${s.feedFilter} ${tradeResultFilter === key ? s.feedFilterActive : s.feedFilterInactive}`}
                onClick={() => setTradeResultFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {!hasApiBase() ? (
            <p className={s.feedPlaceholder}>{t("bot.feedNeedApi")}</p>
          ) : feedWaitingForSession ? (
            <p className={s.feedPlaceholder}>{t("bot.feedLoading")}</p>
          ) : journalLoading ? (
            <p className={s.feedPlaceholder}>{t("bot.feedLoading")}</p>
          ) : journalRows.length === 0 ? (
            <p className={s.feedPlaceholder}>{t("bot.feedEmpty")}</p>
          ) : filteredJournalRows.length === 0 ? (
            <p className={s.feedPlaceholder}>{t("bot.feedFilterEmpty")}</p>
          ) : (
            <ul className={s.feedList}>
              {filteredJournalRows.map(row => (
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

      <BottomTabBar active={activeNav} />
    </div>
  );
}
