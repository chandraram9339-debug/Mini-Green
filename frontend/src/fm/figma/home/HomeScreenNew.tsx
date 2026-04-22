/**
 * HomeScreenNew — Builder.io design port.
 *
 * Visual: 100% matches Builder.io layout (colors, fonts, sizes, HEX codes).
 * Data:   real API data — balance, referrals, bot status, price, chart points.
 * Layout: flex-column, width: 100%, no horizontal scroll, touch-action: pan-y.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { hasApiBase } from "../../api/env";
import { fetchTradingJournal, type TradingJournalItem } from "../../api/fetchTradingJournal";
import { fetchBotTrading } from "../../api/fetchBotTrading";
import {
  buildCompoundedChartPoints,
  buildChartGeom,
  type GraphicPoint,
} from "../components/tradingChartPoints";
import { useAppSession } from "../../session/useAppSession";
import { useWalletDisplay } from "../useWalletDisplay";
import { routes } from "../routes";
import type { BotTradingSnapshot } from "../../api/typesBotTrading";
import { appBarLogoUrl } from "../assets/appBarShared";

import s from "./homeScreenNew.module.css";


/* ── Tab routing helper ──────────────────────────────────────── */
function useActiveTab() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/bot")) return "bot";
  if (pathname.startsWith("/balance") || pathname.startsWith("/deposit") || pathname.startsWith("/withdraw")) return "wallet";
  if (pathname.startsWith("/support") || pathname.startsWith("/faq")) return "support";
  return "home";
}

/* ── AppBar ──────────────────────────────────────────────────── */
function AppBar({ bellBadge }: { bellBadge?: number }) {
  const navigate = useNavigate();
  return (
    <header className={s.appBar}>
      <div className={s.appBarRow}>
        {/* Back button */}
        <button
          className={s.appBarBackBtn}
          onClick={() => { if (window.history.length > 1) navigate(-1); }}
          aria-label="Back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ transform: "rotate(-90deg)" }}>
            <path d="M20 12.8H20.8V11.2H20V12V12.8ZM20 12V11.2H4V12V12.8H20V12Z" fill="#55647B" />
            <path d="M10 18L4 12L10 6" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Logo centered */}
        <div className={s.appBarLogo} aria-label="Palladium">
          <img src={appBarLogoUrl} alt="Palladium" />
        </div>

        {/* Right icons */}
        <div className={s.appBarIcons}>
          {/* Bell with badge */}
          <Link to={routes.notifications} className={s.appBarBellBtn} aria-label="Notifications">
            <svg width="18" height="19" viewBox="0 0 18 19" fill="none">
              <path d="M2 15V7C2 5.14348 2.7375 3.36301 4.05025 2.05025C5.36301 0.737498 7.14348 0 9 0C10.8565 0 12.637 0.737498 13.9497 2.05025C15.2625 3.36301 16 5.14348 16 7V15" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
              <path d="M0 15H18" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
              <path d="M7 19H11" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
            </svg>
            {bellBadge != null && bellBadge > 0 && (
              <span className={s.appBarBellBadge}>
                <span>{bellBadge > 99 ? "99" : bellBadge}</span>
              </span>
            )}
          </Link>

          {/* Settings gear */}
          <Link to={routes.settings} className={s.appBarGearBtn} aria-label="Settings">
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

/* ── Performance Chart — dynamic from API or static fallback ─── */
function PerformanceChart({ points }: { points: GraphicPoint[] }) {
  const geom = buildChartGeom(points);
  return (
    <div className={s.chartWrapper}>
      <div className={s.chartGrid}>
        {geom.yLabels.map((label) => (
          <div key={label} className={s.chartGridRow}>
            <span className={s.chartGridLabel}>{label}</span>
            <div className={s.chartGridLine} />
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
            <linearGradient id="hnChartGrad" x1="162.5" y1="0" x2="162.5" y2="122" gradientUnits="userSpaceOnUse">
              <stop stopColor="#759AC6" stopOpacity="0.5" />
              <stop offset="1" stopColor="#ECF1F4" stopOpacity="0" />
            </linearGradient>
          </defs>
          {geom.isEmpty ? (
            <>
              <path d="M3.19408 51.3435L0 42.4209V122H325V10.8609H301.843L293.858 2.74937L288.268 18.1612L280.283 23.0281V16.5389L276.29 19.7835L273.894 7.61626L271.499 10.8609L269.103 5.99397L265.111 13.2943L261.916 9.23856L255.528 14.9166L253.931 13.2943L249.939 19.7835L246.744 14.9166L243.55 23.0281L241.953 18.1612L238.759 23.0281L234.767 16.5389L232.371 23.0281H222.789L214.803 16.5389L212.408 19.7835L210.012 16.5389L206.02 21.4058L203.624 18.1612L202.027 19.7835L198.034 16.5389L195.639 18.9724L192.644 5.99397L189.251 8.42741L187.554 0L184.459 56.2104L181.538 27.5555L178.071 54.5881L174.877 50.0286V54.5881V60.2662L170.884 61.8885L170.086 70L166.892 60.2662L165.295 57.0216L162.899 59.455V54.5881H159.705L158.108 60.2662H154.115L151.72 63.5108L150.123 59.455L147.727 63.5108L144.533 54.5881L140.541 57.0216L138.145 51.3435L136.548 57.0216L134.152 51.3435L132.555 63.5108L129.361 57.0216L126.966 68.3777L124.57 63.5108L121.376 60.2662L117.383 59.455L110.995 52.1547L111.794 60.2662L107.801 59.455L104.607 65.1331L95.0246 67.5665L89.4349 59.455L85.4422 68.3777L83.8452 57.8327L82.2482 66.7554L79.0541 51.3435L74.2629 59.455L68.6732 44.0432L65.4791 52.9658L63.0835 45.6655L56.6953 51.3435L53.5012 47.2878L50.3071 49.7212L47.9115 45.6655L42.3218 51.3435L35.1351 45.6655L29.5455 54.5881L26.3513 48.0989L21.5602 54.5881L19.1646 47.2878L15.9705 51.3435L13.5749 44.0432L11.9779 49.7212L9.5823 52.9658L3.19408 51.3435Z" fill="url(#hnChartGrad)"/>
              <path d="M0 42.4209L3.19408 51.3435L9.58231 52.9658L11.9779 49.7212L13.5749 44.0432L15.9705 51.3435L19.1646 47.2878L21.5602 54.5881L26.3513 48.0989L29.5455 54.5881L35.1351 45.6655L42.3218 51.3435L47.9115 45.6655L50.3071 49.7212L53.5012 47.2878L56.6953 51.3435L63.0835 45.6655L65.4791 52.9658L68.6732 44.0432L74.2629 59.455L79.0541 51.3435L82.2482 66.7554L83.8452 57.8327L85.4422 68.3777L89.4349 59.455L95.0246 67.5665L104.607 65.1331L107.801 59.455L111.794 60.2662L110.995 52.1547L117.383 59.455L121.376 60.2662L124.57 63.5108L126.966 68.3777L129.361 57.0216L132.555 63.5108L134.152 51.3435L136.548 57.0216L138.145 51.3435L140.541 57.0216L144.533 54.5881L147.727 63.5108L150.123 59.455L151.72 63.5108L154.115 60.2662H158.108L159.705 54.5881H162.899V59.455L165.295 57.0216L166.892 60.2662L170.086 70L170.884 61.8885L174.877 60.2662V54.5881V50.0286L178.071 54.5881L181.538 27.5555L184.459 56.2104L187.554 0L189.251 8.42741L192.644 5.99397L195.639 18.9724L198.034 16.5389L202.027 19.7835L203.624 18.1612L206.02 21.4058L210.012 16.5389L212.408 19.7835L214.803 16.5389L222.789 23.0281H232.371L234.767 16.5389L238.759 23.0281L241.953 18.1612L243.55 23.0281L246.744 14.9166L249.939 19.7835L253.931 13.2943L255.528 14.9166L261.916 9.23856L265.111 13.2943L269.103 5.99397L271.499 10.8609L273.894 7.61626L276.29 19.7835L280.283 16.5389V23.0281L288.268 18.1612L293.858 2.74937L301.843 10.8609H325" stroke="#55647B" strokeWidth="1.6" strokeLinejoin="round"/>
            </>
          ) : (
            <>
              <path d={geom.pathArea} fill="url(#hnChartGrad)"/>
              <path d={geom.pathLine} stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </>
          )}
        </svg>
      </div>
    </div>
  );
}

/* ── Tab Bar ─────────────────────────────────────────────────── */
function TabBar({ activeTab }: { activeTab: string }) {
  const tabs = [
    {
      id: "home",
      to: routes.home,
      label: "Home",
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M20 20H4V10L12 4L20 10V20Z" stroke={active ? "#ffffff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 14V20" stroke={active ? "#ffffff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "wallet",
      to: routes.balanceDeposit,
      label: "Wallet",
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 8H3V20H21V8Z" stroke={active ? "#ffffff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 8V4H17V8" stroke={active ? "#ffffff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 14H17" stroke={active ? "#ffffff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "bot",
      to: routes.bot,
      label: "Bot",
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M4 4V20H20" stroke={active ? "#ffffff" : "#55647B"} strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
          <path d="M9 13L13 9L16 12L20 8" stroke={active ? "#ffffff" : "#55647B"} strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "support",
      to: routes.support,
      label: "Support",
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 4H21.8V3.2H21V4ZM3 4V3.2H2.2V4H3ZM3 21H2.2C2.2 21.3236 2.39491 21.6153 2.69385 21.7391C2.99279 21.8629 3.33689 21.7945 3.56569 21.5657L3 21ZM6 18V17.2H5.66863L5.43431 17.4343L6 18ZM21 18V18.8H21.8V18H21ZM21 4V3.2H3V4V4.8H21V4ZM3 4H2.2V21H3H3.8V4H3ZM3 21L3.56569 21.5657L6.56569 18.5657L6 18L5.43431 17.4343L2.43431 20.4343L3 21ZM6 18V18.8H21V18V17.2H6V18ZM21 18H21.8V4H21H20.2V18H21Z"
            fill={active ? "#ffffff" : "#55647B"}
          />
          <path d="M8 11H8.01" stroke={active ? "#ffffff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 11H12.01" stroke={active ? "#ffffff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 11H16.01" stroke={active ? "#ffffff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ] as const;

  return (
    <nav className={s.tabBar} aria-label="Primary navigation">
      <div className={s.tabBarInner}>
        {tabs.map(({ id, to, label, icon }) => {
          const isActive = activeTab === id;
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

/* ── Main HomeScreenNew component ───────────────────────────── */
export default function HomeScreenNew() {
  const navigate = useNavigate();
  const activeTab = useActiveTab();
  const { phase, botRunning, notificationUnreadCount } = useAppSession();
  const { balanceUsdt, referralReceivedUsdt } = useWalletDisplay();
  const apiSessionReady = !hasApiBase() || phase === "ready";

  const [chartRows, setChartRows] = useState<TradingJournalItem[]>([]);
  const [tradingFromApi, setTradingFromApi] = useState<BotTradingSnapshot | null>(null);

  useEffect(() => {
    if (!hasApiBase()) {
      setChartRows([]);
      setTradingFromApi(null);
      return;
    }
    if (!apiSessionReady) return;

    let cancelled = false;

    const load = async () => {
      const [jr, snap] = await Promise.all([
        fetchTradingJournal(100, "1m"),
        fetchBotTrading("1m"),
      ]);
      if (cancelled) return;
      setChartRows(jr.items);
      if (snap) setTradingFromApi(snap);
    };

    void load();
    const intervalId = window.setInterval(() => void load(), 5_000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [apiSessionReady]);

  const chartPoints = useMemo(() => buildCompoundedChartPoints(chartRows), [chartRows]);
  const priceDisplay = tradingFromApi?.displayPrice ?? "69 425.22";
  const pricePair = tradingFromApi?.pricePair ?? "USDT/BTC";
  const isBotActive = balanceUsdt > 0 && botRunning;

  return (
    <div className={s.screen}>
      {/* ── AppBar ── */}
      <AppBar bellBadge={notificationUnreadCount} />

      {/* ── Scrollable content ── */}
      <main className={s.scrollBody}>

        {/* Balance Section */}
        <section className={s.balanceSection}>
          <div className={s.balanceRow}>
            {/* Left: balance info */}
            <div className={s.balanceLeft}>
              <p className={s.balanceLabel}>Total Balance</p>

              <div className={s.balanceAmountRow}>
                <span className={s.balanceAmountValue}>{balanceUsdt.toFixed(2)}</span>
                <span className={s.balanceAmountUnit}>USDT</span>
              </div>

              <div className={s.balanceDivider} />

              <div className={s.referralBlock}>
                <div className={s.referralAmountRow}>
                  <span className={s.referralAmountValue}>{referralReceivedUsdt.toFixed(2)}</span>
                  <span className={s.referralAmountUnit}>USDT</span>
                </div>
                <p className={s.referralCaption}>Received by referrals</p>
              </div>
            </div>

            {/* Right: Top Up + Withdraw */}
            <div className={s.balanceRight}>
              <Link to={routes.depositTopUp} className={s.btnTopUp}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 5V15" stroke="white" strokeWidth="1.3" strokeLinecap="square" strokeLinejoin="round" />
                  <path d="M5 10H15" stroke="white" strokeWidth="1.3" strokeLinecap="square" strokeLinejoin="round" />
                </svg>
                <span className={s.btnTopUpLabel}>Top up</span>
              </Link>

              <Link to={routes.withdraw} className={s.btnWithdraw}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M9.35 15V15.65H10.65V15H10H9.35ZM10 15H10.65V5H10H9.35V15H10Z" fill="white" />
                  <path d="M6.25 8.75L10 5L13.75 8.75" stroke="white" strokeWidth="1.3" strokeLinecap="square" strokeLinejoin="round" />
                </svg>
                <span className={s.btnWithdrawLabel}>Withdraw</span>
              </Link>
            </div>
          </div>

          {/* Details button */}
          <Link to={routes.balanceDeposit} className={s.btnDetailsBalance}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 8H3V20H21V8Z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 8V4H17V8" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 14H17" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={s.btnDetailsLabel}>Details</span>
          </Link>
        </section>

        {/* Bot Status Section */}
        <section className={s.botSection}>
          <PerformanceChart points={chartPoints} />

          {/* Status + Price */}
          <div className={s.botInfoGroup}>
            <div className={s.botStatusRow}>
              <span className={s.botInfoLabel}>Bot status</span>
              <div className={s.botStatusValueRow}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <circle cx="5" cy="5" r="5" fill={isBotActive ? "#73C1B1" : "#8494AF"} />
                </svg>
                <span className={isBotActive ? s.botStatusActiveText : s.botStatusInactiveText}>
                  {isBotActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className={s.priceRow}>
              <span className={s.botInfoLabel}>Actual price</span>
              <div className={s.priceAmountBlock}>
                <span className={s.priceAmountValue}>{priceDisplay}</span>
                <span className={s.priceAmountUnit}>{pricePair}</span>
              </div>
            </div>
          </div>

          {/* Bot Details button */}
          <Link to={routes.bot} className={s.btnDetailsBot}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 4V20H20" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
              <path d="M9 13L13 9L16 12L20 8" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
            </svg>
            <span className={s.btnDetailsLabel}>Details</span>
          </Link>
        </section>

        {/* Social + Support */}
        <div className={s.actionButtons}>
          <Link to={routes.social} className={s.btnSocialMedia} aria-label="Social Media">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path d="M12 8H3V14H12L18 19V4L12 8Z" stroke="#192B48" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 8V14" stroke="#192B48" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 14V20H10V14" stroke="#192B48" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18 14C18.394 14 18.7841 13.9224 19.1481 13.7716C19.512 13.6209 19.8427 13.3999 20.1213 13.1213C20.3999 12.8427 20.6209 12.512 20.7716 12.1481C20.9224 11.7841 21 11.394 21 11C21 10.606 20.9224 10.2159 20.7716 9.85195C20.6209 9.48797 20.3999 9.15726 20.1213 8.87868C19.8427 8.6001 19.512 8.37913 19.1481 8.22836C18.7841 8.0776 18.394 8 18 8" stroke="#192B48" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={s.btnActionLabel}>Social Media</span>
          </Link>

          <Link to={routes.support} className={s.btnSupport} aria-label="Support">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path d="M21 4H21.8V3.2H21V4ZM3 4V3.2H2.2V4H3ZM3 21H2.2C2.2 21.3236 2.39491 21.6153 2.69385 21.7391C2.99279 21.8629 3.33689 21.7945 3.56569 21.5657L3 21ZM6 18V17.2H5.66863L5.43431 17.4343L6 18ZM21 18V18.8H21.8V18H21ZM21 4V3.2H3V4V4.8H21V4ZM3 4H2.2V21H3H3.8V4H3ZM3 21L3.56569 21.5657L6.56569 18.5657L6 18L5.43431 17.4343L2.43431 20.4343L3 21ZM6 18V18.8H21V18V17.2H6V18ZM21 18H21.8V4H21H20.2V18H21Z" fill="#192B48" />
              <path d="M8 11H8.01" stroke="#192B48" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 11H12.01" stroke="#192B48" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 11H16.01" stroke="#192B48" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={s.btnActionLabel}>Support</span>
          </Link>
        </div>
      </main>

      {/* ── Tab Bar ── */}
      <TabBar activeTab={activeTab} />
    </div>
  );
}
