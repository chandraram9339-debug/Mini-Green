/**
 * HomeScreenNew — точный перенос Figma-дизайна «Первый экран Home»
 * с полной логикой API/бэкенда.
 *
 * Структура:
 *   AppBar (back + logo + bell/gear)
 *   BalanceSection (баланс, Top Up, Withdraw, Details)
 *   BotStatusSection (chart, статус бота, цена, Details)
 *   ActionButtons (Social Media, Support)
 *   TabBar
 *
 * Данные: fetchTradingJournal, fetchBotTrading, useAppSession, useWalletDisplay
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useFmLocale } from "../../i18n/useFmLocale";

import { hasApiBase } from "../../api/env";
import { fetchTradingJournal, type TradingJournalItem } from "../../api/fetchTradingJournal";
import { fetchBotTrading } from "../../api/fetchBotTrading";
import {
  buildPersonalBalanceChartPoints,
  chartPointsSystemOrUserFallback,
  buildChartGeom,
  CHART_VIEWBOX_HEIGHT,
  computeDepositBalanceYDomain,
  prependDepositTotalAnchor,
  type GraphicPoint,
} from "../components/tradingChartPoints";
import { useAppSession } from "../../session/useAppSession";
import { useWalletDisplay } from "../useWalletDisplay";
import { routes } from "../routes";
import type { BotTradingSnapshot } from "../../api/typesBotTrading";
import { appBarLogoUrl } from "../assets/appBarShared";
import { TELEGRAM_CHAT_URL, openTelegramOrExternal } from "../../config/links";

import s from "./homeScreenNew.module.css";

/* ─── Хук активного таба ────────────────────────────────────── */
function useActiveTab() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/bot")) return "bot";
  if (pathname.startsWith("/balance") || pathname.startsWith("/deposit") || pathname.startsWith("/withdraw")) return "wallet";
  if (pathname.startsWith("/support") || pathname.startsWith("/faq")) return "support";
  return "home";
}

/* ─── AppBar ─────────────────────────────────────────────────── */
function AppBar({ bellBadge }: { bellBadge?: number }) {
  const navigate = useNavigate();
  return (
    <header className={s.appBar}>
      <div className={s.appBarRow}>
        <button
          className={s.appBarBack}
          onClick={() => { if (window.history.length > 1) navigate(-1); }}
          aria-label="Назад"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 12.8H20.8V11.2H20V12V12.8ZM20 12V11.2H4V12V12.8H20V12Z" fill="#55647B" />
            <path d="M10 18L4 12L10 6" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Логотип строго по центру */}
        <div className={s.appBarLogo} aria-label="Palladium">
          <img src={appBarLogoUrl} alt="Palladium" />
        </div>

        <div className={s.appBarIcons}>
          <Link to={routes.notifications} className={s.appBarBell} aria-label="Уведомления">
            <svg width="18" height="19" viewBox="0 0 18 19" fill="none">
              <path d="M2 15V7C2 5.14348 2.7375 3.36301 4.05025 2.05025C5.36301 0.737498 7.14348 0 9 0C10.8565 0 12.637 0.737498 13.9497 2.05025C15.2625 3.36301 16 5.14348 16 7V15" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
              <path d="M0 15H18" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
              <path d="M7 19H11" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
            </svg>
            {bellBadge != null && bellBadge > 0 && (
              <span className={s.bellBadge}><span>{bellBadge > 99 ? "99" : bellBadge}</span></span>
            )}
          </Link>
          <Link to={routes.settings} className={s.appBarGear} aria-label="Настройки">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7 5C5.89543 5 5 5.89543 5 7V8.17157C5 8.70201 4.78929 9.21071 4.41421 9.58579L3.41421 10.5858C2.63317 11.3668 2.63316 12.6332 3.41421 13.4142L4.41421 14.4142C4.78929 14.7893 5 15.298 5 15.8284V17C5 18.1046 5.89543 19 7 19H8.17157C8.70201 19 9.21071 19.2107 9.58579 19.5858L10.5858 20.5858C11.3668 21.3668 12.6332 21.3668 13.4142 20.5858L14.4142 19.5858C14.7893 19.2107 15.298 19 15.8284 19H17C18.1046 19 19 18.1046 19 17V15.8284C19 15.298 19.2107 14.7893 19.5858 14.4142L20.5858 13.4142C21.3668 12.6332 21.3668 11.3668 20.5858 10.5858L19.5858 9.58579C19.2107 9.21071 19 8.70201 19 8.17157V7C19 5.89543 18.1046 5 17 5H15.8284C15.298 5 14.7893 4.78929 14.4142 4.41421L13.4142 3.41421C12.6332 2.63317 11.3668 2.63316 10.5858 3.41421L9.58579 4.41421C9.21071 4.78929 8.70201 5 8.17157 5H7Z" stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
      <div className={s.appBarDivider} />
    </header>
  );
}

/* ─── График производительности ─────────────────────────────── */

function PerformanceChart({
  points,
  yAxis,
  fixedYDomain,
}: {
  points: GraphicPoint[];
  yAxis: "percent" | "usdt";
  fixedYDomain?: [number, number];
}) {
  const geom = buildChartGeom(points, yAxis, fixedYDomain ? { fixedYDomain } : undefined);
  const yPct = 100 / CHART_VIEWBOX_HEIGHT;

  return (
    <div className={s.chartWrap}>
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
              <linearGradient id="hnGrad" x1="162.5" y1="0" x2="162.5" y2="122" gradientUnits="userSpaceOnUse">
                <stop stopColor="#759AC6" stopOpacity="0.5" />
                <stop offset="1" stopColor="#ECF1F4" stopOpacity="0" />
              </linearGradient>
            </defs>
            {geom.yTicks.map((t, i) => (
              <line
                key={`grid-${i}`}
                x1="0"
                y1={t.ySvg}
                x2="325"
                y2={t.ySvg}
                stroke="#D3DAE5"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {geom.isEmpty ? null : (
              <>
                <path d={geom.pathArea} fill="url(#hnGrad)" />
                <path d={geom.pathLine} stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ─── TabBar ─────────────────────────────────────────────────── */
function TabBar({ active }: { active: string }) {
  const tabs = [
    {
      id: "home", to: routes.home,
      icon: (a: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M20 20H4V10L12 4L20 10V20Z" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 14V20" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "wallet", to: routes.balanceDeposit,
      icon: (a: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 8H3V20H21V8Z" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 8V4H17V8" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 14H17" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "bot", to: routes.bot,
      icon: (a: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M4 4V20H20" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
          <path d="M9 13L13 9L16 12L20 8" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "support", to: routes.support,
      icon: (a: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 4H21.8V3.2H21V4ZM3 4V3.2H2.2V4H3ZM3 21H2.2c0 .324.195.615.694.739.299.124.637.06.866-.169L3 21ZM6 18V17.2H5.669l-.235.235L6 18ZM21 18V18.8H21.8V18H21ZM21 4V3.2H3V4V4.8H21V4ZM3 4H2.2V21H3H3.8V4H3ZM3 21l.566.566 3-3L6 18l-.435-.435-3 3L3 21ZM6 18V18.8H21V18V17.2H6V18ZM21 18H21.8V4H21H20.2V18H21Z" fill={a ? "#fff" : "#55647B"} />
          <path d="M8 11H8.01M12 11H12.01M16 11H16.01" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ] as const;

  return (
    <nav className={s.tabBar} aria-label="Навигация">
      <div className={s.tabBarInner}>
        {tabs.map(({ id, to, icon }) => {
          const isActive = active === id;
          return (
            <Link
              key={id}
              to={to}
              className={`${s.tabItem}${isActive ? ` ${s.tabItemActive}` : ""}`}
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

/* ─── Главный экран ──────────────────────────────────────────── */
export default function HomeScreenNew() {
  const activeTab = useActiveTab();
  const { t } = useFmLocale();
  const { phase, botRunning, notificationUnreadCount, uiSettings } = useAppSession();
  const { balanceUsdt, referralReceivedUsdt, positiveBalanceStartedAt, cumulativeDepositsUsdt } =
    useWalletDisplay();

  const apiSessionReady = !hasApiBase() || phase === "ready";
  const isBotActive = balanceUsdt > 0 && botRunning;

  const [chartRows, setChartRows] = useState<TradingJournalItem[]>([]);
  const [systemChartPoints, setSystemChartPoints] = useState<GraphicPoint[]>([]);
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
    if (!isBotActive) return chartPointsSystemOrUserFallback(systemChartPoints, chartRows);
    if (personalTradePoints.length === 0) return [];
    return prependDepositTotalAnchor(personalTradePoints, depositTotalUsdt, positiveBalanceStartedAt);
  }, [
    isBotActive,
    systemChartPoints,
    chartRows,
    personalTradePoints,
    depositTotalUsdt,
    positiveBalanceStartedAt,
  ]);

  const fixedYDomain = useMemo((): [number, number] | undefined => {
    if (!isBotActive || chartPoints.length === 0) return undefined;
    return computeDepositBalanceYDomain(depositTotalUsdt, balanceUsdt);
  }, [isBotActive, chartPoints.length, depositTotalUsdt, balanceUsdt]);

  /**
   * Личный режим: график скрыт, пока нет закрытых сделок после подтверждённого депозита на бэкенде
   * (окно от positiveBalanceStartedAt; до первой точки по сделкам — пусто).
   */
  const showPerformanceChart = !isBotActive || chartPoints.length > 0;
  const priceDisplay = tradingFromApi?.displayPrice ?? "69 425.22";
  const pricePair = tradingFromApi?.pricePair ?? "USDT/BTC";
  return (
    <div className={s.screen}>
      <AppBar bellBadge={notificationUnreadCount} />

      <main className={s.body}>
        {/* ── Секция баланса ───────────────────────────── */}
        <section className={s.balanceSection}>
          <div className={s.balanceRow}>
            {/* Левая колонка: баланс + рефералы */}
            <div className={s.balanceLeft}>
              <span className={s.balanceTitle}>{t("home.totalBalance")}</span>

              <div className={s.balanceAmount}>
                <span className={s.balanceValue}>{balanceUsdt.toFixed(2)}</span>
                <span className={s.balanceCurrency}>USDT</span>
              </div>

              <div className={s.balanceDivider} />

              <div className={s.referralBlock}>
                <div className={s.referralAmount}>
                  <span className={s.referralValue}>{referralReceivedUsdt.toFixed(2)}</span>
                  <span className={s.referralCurrency}>USDT</span>
                </div>
                <span className={s.referralCaption}>{t("home.referralsCaption")}</span>
              </div>
            </div>

            {/* Правая колонка: Top Up + Withdraw */}
            <div className={s.balanceActions}>
              <Link to={routes.depositTopUp} className={s.btnTopUp}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 5V15" stroke="white" strokeWidth="1.3" strokeLinecap="square" />
                  <path d="M5 10H15" stroke="white" strokeWidth="1.3" strokeLinecap="square" />
                </svg>
                <span>{t("home.topUp")}</span>
              </Link>
              <Link to={routes.withdraw} className={s.btnWithdraw}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M9.35 15V15.65H10.65V15H10H9.35ZM10 15H10.65V5H10H9.35V15H10Z" fill="white" />
                  <path d="M6.25 8.75L10 5L13.75 8.75" stroke="white" strokeWidth="1.3" strokeLinecap="square" />
                </svg>
                <span>{t("home.withdraw")}</span>
              </Link>
            </div>
          </div>

          <Link to={routes.balanceDeposit} className={s.btnDetails}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 8H3V20H21V8Z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 8V4H17V8" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 14H17" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{t("home.details")}</span>
          </Link>
        </section>

        {/* ── Секция бота ──────────────────────────────── */}
        <section className={s.botSection}>
          {showPerformanceChart ? (
            <PerformanceChart
              points={chartPoints}
              yAxis={isBotActive ? "usdt" : "percent"}
              fixedYDomain={fixedYDomain}
            />
          ) : null}

          <div className={s.botInfoGroup}>
            <div className={s.botStatusRow}>
              <span className={s.botInfoLabel}>{t("home.botStatus")}</span>
              <div className={s.botStatusValue}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <circle cx="5" cy="5" r="5" fill={isBotActive ? "#73C1B1" : "#8494AF"} />
                </svg>
                <span className={isBotActive ? s.botStatusActive : s.botStatusInactive}>
                  {isBotActive ? t("home.active") : t("home.inactive")}
                </span>
              </div>
            </div>

            <div className={s.priceRow}>
              <span className={s.botInfoLabel}>{t("home.actualPrice")}</span>
              <div className={s.priceValueBlock}>
                <span className={s.priceValue}>{priceDisplay}</span>
                <span className={s.priceCurrency}>{pricePair}</span>
              </div>
            </div>
          </div>

          <Link to={routes.bot} className={s.btnDetails}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 4V20H20" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
              <path d="M9 13L13 9L16 12L20 8" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
            </svg>
            <span>{t("home.details")}</span>
          </Link>
        </section>

        {/* ── Кнопки Social + Support ───────────────────── */}
        <div className={s.actionRow}>
          <button
            type="button"
            className={s.btnSocial}
            aria-label="Chat"
            onClick={() =>
              openTelegramOrExternal((uiSettings?.chat_url ?? "").trim() || TELEGRAM_CHAT_URL)
            }
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path d="M12 8H3V14H12L18 19V4L12 8Z" stroke="#192B48" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 8V14" stroke="#192B48" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 14V20H10V14" stroke="#192B48" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18 14C18.394 14 18.7841 13.9224 19.1481 13.7716C19.512 13.6209 19.8427 13.3999 20.1213 13.1213C20.3999 12.8427 20.6209 12.512 20.7716 12.1481C20.9224 11.7841 21 11.394 21 11C21 10.606 20.9224 10.2159 20.7716 9.85195C20.6209 9.48797 20.3999 9.15726 20.1213 8.87868C19.8427 8.6001 19.512 8.37913 19.1481 8.22836C18.7841 8.0776 18.394 8 18 8" stroke="#192B48" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={s.actionLabel}>{t("home.chat")}</span>
          </button>

          {(uiSettings?.support_url ?? "").trim() ? (
            <button
              type="button"
              className={s.btnSupport}
              aria-label={t("home.supportAria")}
              onClick={() => openTelegramOrExternal((uiSettings?.support_url ?? "").trim())}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path d="M21 4H21.8V3.2H21V4ZM3 4V3.2H2.2V4H3ZM3 21H2.2C2.2 21.3236 2.39491 21.6153 2.69385 21.7391C2.99279 21.8629 3.33689 21.7945 3.56569 21.5657L3 21ZM6 18V17.2H5.66863L5.43431 17.4343L6 18ZM21 18V18.8H21.8V18H21ZM21 4V3.2H3V4V4.8H21V4ZM3 4H2.2V21H3H3.8V4H3ZM3 21L3.56569 21.5657L6.56569 18.5657L6 18L5.43431 17.4343L2.43431 20.4343L3 21ZM6 18V18.8H21V18V17.2H6V18ZM21 18H21.8V4H21H20.2V18H21Z" fill="#192B48" />
                <path d="M8 11H8.01M12 11H12.01M16 11H16.01" stroke="#192B48" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className={s.actionLabel}>{t("support.title")}</span>
            </button>
          ) : (
            <Link to={routes.support} className={s.btnSupport} aria-label={t("home.supportAria")}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path d="M21 4H21.8V3.2H21V4ZM3 4V3.2H2.2V4H3ZM3 21H2.2C2.2 21.3236 2.39491 21.6153 2.69385 21.7391C2.99279 21.8629 3.33689 21.7945 3.56569 21.5657L3 21ZM6 18V17.2H5.66863L5.43431 17.4343L6 18ZM21 18V18.8H21.8V18H21ZM21 4V3.2H3V4V4.8H21V4ZM3 4H2.2V21H3H3.8V4H3ZM3 21L3.56569 21.5657L6.56569 18.5657L6 18L5.43431 17.4343L2.43431 20.4343L3 21ZM6 18V18.8H21V18V17.2H6V18ZM21 18H21.8V4H21H20.2V18H21Z" fill="#192B48" />
                <path d="M8 11H8.01M12 11H12.01M16 11H16.01" stroke="#192B48" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className={s.actionLabel}>{t("support.title")}</span>
            </Link>
          )}
        </div>
      </main>

      <TabBar active={activeTab} />
    </div>
  );
}
