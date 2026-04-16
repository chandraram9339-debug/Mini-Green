import React from "react";
import { routeTitles, screenData, topLevelRoutes } from "./data";
import type { LoadState, RouteId } from "./types";
import topupQrAsset from "./assets/topup-qr-1-5256.svg";
import topBarBackIcon from "./assets/topbar-back-1-6437.svg";
import topBarNotifyIcon from "./assets/topbar-notify-1-6436.svg";
import topBarSettingsIcon from "./assets/topbar-settings-1-6435.svg";

const fallbackRoute: RouteId = "dashboard";
const delayMs = 300;

const FAQ_ENTRIES: Array<{ id: string; title: string; body: string }> = [
  {
    id: "topup",
    title: "How to top up balance?",
    body: "Use Dashboard → Top Up, choose USDT TRC20, copy the deposit address or scan the QR code, then send funds from your external wallet. Deposits are credited after network confirmation.",
  },
  {
    id: "withdraw",
    title: "How to withdraw money?",
    body: 'To withdraw money, go to the menu section "My account" - "Withdrawal of funds" - "Withdrawal request" enter the required available amount and the USDT TRC20 wallet. The withdrawal process is automatic and takes from 10 minutes to 2-3 hours. The maximum withdrawal time is up to 7 days. During the consideration, trading for your account will be stopped. Attention! Replenishment is realized only to the USDT TRC20 wallet! The minimum amount is 5 USDT!',
  },
  {
    id: "timing",
    title: "How long does withdrawal take?",
    body: "Usually from 10 minutes to 2–3 hours. In edge cases processing can take up to 7 days while the system finalizes open operations. You will see status updates on the Withdraw and Confirm screens.",
  },
  {
    id: "support",
    title: "Where to find support?",
    body: "Open Support from the bottom navigation or use in-app FAQ. For account-specific issues, include your trace reference from the Confirm screen when contacting support.",
  },
];

function routeToPath(route: RouteId): string {
  return route === "dashboard" ? "/" : `/${route}`;
}

function pathToRoute(pathname: string): RouteId {
  const key = pathname.replace(/^\/+/, "").toLowerCase();
  if (
    key === "dashboard" ||
    key === "money" ||
    key === "trading" ||
    key === "faq" ||
    key === "topup" ||
    key === "withdraw" ||
    key === "confirm"
  ) {
    return key;
  }
  return fallbackRoute;
}

function readForcedState(route: RouteId): Exclude<LoadState, "ready"> | null {
  const params = new URLSearchParams(window.location.search);
  const state = params.get(`${route}State`);
  if (state === "loading" || state === "empty" || state === "error") {
    return state;
  }
  return null;
}

function useScreenState(route: RouteId) {
  const [state, setState] = React.useState<LoadState>("loading");
  const [token, setToken] = React.useState(0);

  React.useEffect(() => {
    setState("loading");
    const forcedState = readForcedState(route);
    const timer = window.setTimeout(() => {
      setState(forcedState ?? "ready");
    }, delayMs);
    return () => window.clearTimeout(timer);
  }, [route, token]);

  return {
    state,
    retry: () => setToken((current) => current + 1),
  };
}

interface StateViewProps {
  state: LoadState;
  onRetry: () => void;
  children: React.ReactNode;
}

/** Demo deposit address (visual only; no API). */
const TOPUP_DEPOSIT_ADDRESS = "TD7WuK8xQY2mN4pL6vR3tZ9aBcDeF1gH2JkLm";

function topupAddressDisplay(full: string): string {
  if (full.length <= 18) return full;
  return `${full.slice(0, 8)}…${full.slice(-6)}`;
}

function TopUpQrVisual() {
  return (
    <div className="topup-qr-shell" aria-hidden="true">
      <img className="topup-qr-svg" src={topupQrAsset} alt="Deposit QR code" />
    </div>
  );
}

function StateView({ state, onRetry, children }: StateViewProps) {
  if (state === "loading") {
    return (
      <div className="state-box">
        <div className="spinner" aria-hidden="true" />
        <p className="state-text">Loading screen data...</p>
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="state-box">
        <p className="state-text">No data to show yet.</p>
        <button onClick={onRetry}>Reload</button>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="state-box">
        <p className="state-text">Unable to load this screen.</p>
        <button onClick={onRetry}>Retry</button>
      </div>
    );
  }

  return <>{children}</>;
}

const bottomNavCaption: Partial<Record<RouteId, string>> = {
  dashboard: "Home",
  money: "Money",
  trading: "Trading",
  faq: "FAQ",
};

function TabGlyph({ route }: { route: RouteId }) {
  const c = "tab-svg";
  switch (route) {
    case "dashboard":
      return (
        <svg className={c} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      );
    case "money":
      return (
        <svg className={c} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21 7.28V5c0-1.1-.9-2-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-2.28c.6-.35 1-.98 1-1.72V9c0-.74-.4-1.38-1-1.72zM20 9v6h-7V9h7zM5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2H5z" />
          <path d="M16 12c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" />
        </svg>
      );
    case "trading":
      return (
        <svg className={c} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />
        </svg>
      );
    case "faq":
      return (
        <svg className={c} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      );
    default:
      return (
        <svg className={c} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
  }
}

function isGreenHeaderRoute(route: RouteId): boolean {
  return (
    route === "dashboard" ||
    route === "trading" ||
    route === "withdraw" ||
    route === "confirm" ||
    route === "topup"
  );
}

function App() {
  const [initState, setInitState] = React.useState<"idle" | "loading" | "error" | "ready">(
    "idle"
  );
  const [route, setRoute] = React.useState<RouteId>(pathToRoute(window.location.pathname));
  const [expandedFaqId, setExpandedFaqId] = React.useState<string | null>(null);
  const [moneyFilter, setMoneyFilter] = React.useState<"all" | "in" | "out">("all");
  const [tradingRange, setTradingRange] = React.useState<"1d" | "7d" | "30d" | "All">("7d");
  const [topupCopied, setTopupCopied] = React.useState(false);
  const [confirmStep, setConfirmStep] = React.useState<"review" | "submitting" | "success">("review");
  const confirmTimerRef = React.useRef<number | null>(null);
  const topupCopyTimerRef = React.useRef<number | null>(null);

  const flashTopupCopied = React.useCallback(() => {
    if (topupCopyTimerRef.current != null) window.clearTimeout(topupCopyTimerRef.current);
    setTopupCopied(true);
    topupCopyTimerRef.current = window.setTimeout(() => {
      setTopupCopied(false);
      topupCopyTimerRef.current = null;
    }, 2000);
  }, []);

  React.useEffect(() => {
    return () => {
      if (topupCopyTimerRef.current != null) window.clearTimeout(topupCopyTimerRef.current);
      if (confirmTimerRef.current != null) window.clearTimeout(confirmTimerRef.current);
    };
  }, []);

  const navigate = React.useCallback((nextRoute: RouteId, replace = false) => {
    const nextUrl = `${routeToPath(nextRoute)}${window.location.search}`;
    if (replace) {
      window.history.replaceState({ route: nextRoute }, "", nextUrl);
    } else {
      window.history.pushState({ route: nextRoute }, "", nextUrl);
    }
    setRoute(nextRoute);
  }, []);

  const navigateWithParams = React.useCallback(
    (nextRoute: RouteId, updates: Record<string, string | null>, replace = false) => {
      const params = new URLSearchParams(window.location.search);
      Object.entries(updates).forEach(([key, value]) => {
        if (value == null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      const query = params.toString();
      const nextUrl = `${routeToPath(nextRoute)}${query ? `?${query}` : ""}`;
      if (replace) {
        window.history.replaceState({ route: nextRoute }, "", nextUrl);
      } else {
        window.history.pushState({ route: nextRoute }, "", nextUrl);
      }
      setRoute(nextRoute);
    },
    []
  );

  const openFaqEntry = React.useCallback(
    (entryId: string) => {
      navigateWithParams("faq", { faqExpand: entryId });
      setExpandedFaqId(entryId);
    },
    [navigateWithParams]
  );

  const handleBack = React.useCallback(() => {
    if (route === "dashboard") {
      navigate("dashboard", true);
      return;
    }
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    navigate("dashboard", true);
  }, [navigate, route]);

  React.useEffect(() => {
    const onPopState = () => {
      setRoute(pathToRoute(window.location.pathname));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  React.useEffect(() => {
    if (route !== "confirm") {
      if (confirmTimerRef.current != null) {
        window.clearTimeout(confirmTimerRef.current);
        confirmTimerRef.current = null;
      }
      setConfirmStep("review");
    }
  }, [route]);

  React.useEffect(() => {
    if (route !== "faq") {
      setExpandedFaqId(null);
      return;
    }
    const param = new URLSearchParams(window.location.search).get("faqExpand");
    if (param && FAQ_ENTRIES.some((e) => e.id === param)) {
      setExpandedFaqId(param);
    } else {
      setExpandedFaqId(null);
    }
  }, [route]);

  const startInit = React.useCallback(() => {
    setInitState("loading");
    const forceFail = new URLSearchParams(window.location.search).get("initFail");
    window.setTimeout(() => {
      if (forceFail === "1") {
        setInitState("error");
        return;
      }
      setInitState("ready");
      navigate(pathToRoute(window.location.pathname), true);
    }, delayMs);
  }, [navigate]);

  React.useEffect(() => {
    if (initState === "idle" && window.location.pathname !== "/") {
      startInit();
    }
  }, [initState, startInit]);

  const { state, retry } = useScreenState(route);
  const content = screenData[route];
  const primaryCta = content.primaryCta;
  const secondaryCta = content.secondaryCta;
  const isDashboard = route === "dashboard";
  const isBusy = state === "loading";

  const greenHeader = isGreenHeaderRoute(route);
  const moneyRows = React.useMemo(
    () =>
      [
        {
          title: "Top up completed",
          meta: "Today · 14:32",
          amount: "+42.10 USDT",
          tone: "in" as const,
        },
        {
          title: "Referral reward",
          meta: "Yesterday · 09:10",
          amount: "+18.00 USDT",
          tone: "in" as const,
        },
        {
          title: "Withdrawal pending",
          meta: "Processing · est. 2h",
          amount: "−600.00 USDT",
          tone: "pending" as const,
        },
        {
          title: "Fee charge",
          meta: "Auto · network",
          amount: "−1.20 USDT",
          tone: "out" as const,
        },
        {
          title: "Top up completed",
          meta: "Mon · 11:05",
          amount: "+200.00 USDT",
          tone: "in" as const,
        },
      ] as const,
    []
  );
  const filteredMoneyRows = React.useMemo(() => {
    if (moneyFilter === "all") return moneyRows;
    if (moneyFilter === "in") return moneyRows.filter((row) => row.tone === "in");
    return moneyRows.filter((row) => row.tone === "out" || row.tone === "pending");
  }, [moneyFilter, moneyRows]);
  const handleConfirmSend = React.useCallback(() => {
    if (isBusy || confirmStep !== "review") return;
    setConfirmStep("submitting");
    if (confirmTimerRef.current != null) {
      window.clearTimeout(confirmTimerRef.current);
    }
    confirmTimerRef.current = window.setTimeout(() => {
      setConfirmStep("success");
      confirmTimerRef.current = null;
    }, 900);
  }, [confirmStep, isBusy]);

  if (initState === "idle") {
    return (
      <main className="app app-center">
        <h1>Mini App</h1>
        <p>Open app to start auth/init flow.</p>
        <button onClick={startInit}>Open app</button>
      </main>
    );
  }

  if (initState === "loading") {
    return (
      <main className="app app-center">
        <h1>Initializing</h1>
        <p>Checking auth/init status...</p>
      </main>
    );
  }

  if (initState === "error") {
    return (
      <main className="app app-center">
        <h1>Init failed</h1>
        <p>Session initialization failed.</p>
        <button onClick={startInit}>Retry init</button>
      </main>
    );
  }

  return (
    <main className={`app${isDashboard ? " app--dashboard-merge" : ""}`}>
      <header className={`top-bar ${greenHeader ? "top-bar-green" : "top-bar-dark"}`}>
        <div className="top-bar-start">
          <button
            type="button"
            className="ghost icon-btn top-bar-back"
            onClick={handleBack}
            disabled={isBusy}
            aria-label="Back"
          >
            <img className="top-bar-icon top-bar-icon--back" src={topBarBackIcon} alt="" aria-hidden="true" />
          </button>
        </div>
        <div className="top-bar-center">
          {isDashboard ? (
            <div className="top-bar-mark" aria-label="App home">
              dEP
            </div>
          ) : (
            <h1 className="top-title">{routeTitles[route]}</h1>
          )}
        </div>
        <div className="top-bar-end">
          <div className="top-bar-accessories" role="toolbar" aria-label="Quick actions">
            <button
              type="button"
              className="top-bar-chip top-bar-chip--notify"
              disabled={isBusy}
              aria-label="Open notifications help"
              onClick={() => openFaqEntry("timing")}
            >
              <img
                className="top-bar-icon top-bar-icon--notify"
                src={topBarNotifyIcon}
                alt=""
                aria-hidden="true"
              />
              <span className="top-bar-badge" aria-hidden="true">
                25
              </span>
            </button>
            <button
              type="button"
              className="top-bar-chip"
              disabled={isBusy}
              aria-label="Open support settings help"
              onClick={() => openFaqEntry("support")}
            >
              <img
                className="top-bar-icon top-bar-icon--settings"
                src={topBarSettingsIcon}
                alt=""
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </header>

      <section className={`screen-card screen-${route}`}>
        {isDashboard ? (
          <div className="dashboard-top">
            <p className="dashboard-balance-label">Total Balance</p>
            <div className="dashboard-balance-row">
              <div>
                <p className="dashboard-balance-value">725.62</p>
                <p className="dashboard-balance-sub">425.22 USDT</p>
              </div>
              <div className="dashboard-actions">
                <button
                  className="dashboard-pill dashboard-pill-main"
                  onClick={() => navigate("topup")}
                  disabled={isBusy}
                >
                  + Top up
                </button>
                <button
                  className="dashboard-pill dashboard-pill-muted"
                  onClick={() => navigate("withdraw")}
                  disabled={isBusy}
                >
                  ↑ Withdraw
                </button>
              </div>
            </div>
            <button className="dashboard-details-btn" onClick={() => navigate("money")} disabled={isBusy}>
              ◫ Details
            </button>
          </div>
        ) : null}
        <StateView state={state} onRetry={retry}>
          {isDashboard ? (
            <div className="dashboard-body">
              <section className="dashboard-chart-module" aria-label="Price chart preview">
                <div className="dashboard-chart-module-head">
                  <span className="dashboard-chart-title">BTC / USDT</span>
                  <span className="dashboard-chart-range">24h</span>
                </div>
                <div className="dashboard-chart" aria-hidden="true">
                  <div className="dashboard-chart-y-axis">
                    <span>70k</span>
                    <span>69k</span>
                    <span>68k</span>
                  </div>
                  <div className="dashboard-chart-plot">
                    <div className="dashboard-chart-grid" />
                    <div className="dashboard-chart-area" />
                    <div className="dashboard-chart-line" />
                  </div>
                </div>
              </section>
              <div className="dashboard-status-card">
                <div className="dashboard-status">
                  <p>
                    Bot status <strong>● Active</strong>
                  </p>
                  <p>
                    Actual price <strong>69 425.22</strong> <span>USDT/BTC</span>
                  </p>
                </div>
              </div>
              <div className="dashboard-cta-stack">
                <button className="dashboard-secondary-btn" onClick={() => navigate("money")} disabled={isBusy}>
                  Details
                </button>
                <div className="dashboard-support-row">
                  <button className="dashboard-secondary-btn" onClick={() => openFaqEntry("topup")} disabled={isBusy}>
                    Social Media
                  </button>
                  <button className="dashboard-secondary-btn" onClick={() => openFaqEntry("support")} disabled={isBusy}>
                    Support
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`screen-template template-${route}`}>
              {route === "money" && (
                <header className="internal-hero internal-hero-money">
                  <h2 className="internal-hero-title">Deposit</h2>
                  <p className="internal-hero-label">dep</p>
                </header>
              )}
              {route === "trading" && (
                <header className="internal-hero internal-hero-trading">
                  <h2 className="internal-hero-title">Trading</h2>
                  <p className="internal-hero-label">Trading bot statistics for the period:</p>
                </header>
              )}
              {route === "faq" && (
                <header className="internal-hero internal-hero-faq">
                  <h2 className="internal-hero-title">FAQ</h2>
                </header>
              )}
              {route === "topup" && (
                <header className="internal-hero internal-hero-topup">
                  <h2 className="internal-hero-title">Deposit</h2>
                  <p className="internal-hero-label">Recieve USDT</p>
                </header>
              )}
              {route === "withdraw" && (
                <header className="internal-hero internal-hero-withdraw">
                  <h2 className="internal-hero-title">Withdraw</h2>
                  <p className="internal-hero-label">Address name</p>
                </header>
              )}
              {route === "confirm" && (
                <header className="internal-hero internal-hero-confirm">
                  <h2 className="internal-hero-title">USDT Transfer</h2>
                  <p className="internal-hero-label">
                    *The commission is charged from the remaining balance. We charge a 10% fee on
                    withdrawals.
                  </p>
                </header>
              )}
              {route === "money" && (
                <>
                  <section className="money-overview" aria-label="Balance overview">
                    <div className="money-overview-primary">
                      <p className="money-overview-kicker">Available balance</p>
                      <p className="money-overview-figure">
                        725.62 <span className="money-overview-unit">USDT</span>
                      </p>
                    </div>
                    <div className="money-overview-side">
                      <div className="money-side-block">
                        <p className="money-side-label">Referral</p>
                        <p className="money-side-value">425.22</p>
                        <p className="money-side-unit">USDT</p>
                      </div>
                      <div className="money-side-block money-side-block--accent">
                        <p className="money-side-label">Bot</p>
                        <p className="money-side-status">Active</p>
                      </div>
                    </div>
                  </section>
                  <div className="money-activity-head">
                    <h3 className="money-activity-title">Recent activity</h3>
                    <div className="money-activity-tabs" role="tablist" aria-label="Activity filter">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={moneyFilter === "all"}
                        className={`money-activity-tab${moneyFilter === "all" ? " money-activity-tab--active" : ""}`}
                        disabled={isBusy}
                        onClick={() => setMoneyFilter("all")}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={moneyFilter === "in"}
                        className={`money-activity-tab${moneyFilter === "in" ? " money-activity-tab--active" : ""}`}
                        disabled={isBusy}
                        onClick={() => setMoneyFilter("in")}
                      >
                        In
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={moneyFilter === "out"}
                        className={`money-activity-tab${moneyFilter === "out" ? " money-activity-tab--active" : ""}`}
                        disabled={isBusy}
                        onClick={() => setMoneyFilter("out")}
                      >
                        Out
                      </button>
                    </div>
                  </div>
                  <div className="money-history-feed" role="list">
                    {filteredMoneyRows.map((row, idx) => (
                      <article
                        key={`${row.title}-${idx}`}
                        className={`money-feed-row money-feed-row--${row.tone}`}
                        role="listitem"
                      >
                        <div className="money-feed-icon" aria-hidden="true" />
                        <div className="money-feed-main">
                          <p className="money-feed-title">{row.title}</p>
                          <p className="money-feed-meta">{row.meta}</p>
                        </div>
                        <p className="money-feed-amount">{row.amount}</p>
                      </article>
                    ))}
                  </div>
                </>
              )}

              {route === "trading" && (
                <div className="trading-stack">
                  <div className="trading-stack-head">
                    <p className="trading-section-title">Trading bot statistics for the period:</p>
                    <div className="stats-tabs" role="tablist" aria-label="Period">
                      {["1d", "7d", "30d", "All"].map((label, i) => (
                        <button
                          key={label}
                          type="button"
                          role="tab"
                          aria-selected={tradingRange === label}
                          className={tradingRange === label ? "stat-pill stat-pill-active" : "stat-pill"}
                          disabled={isBusy}
                          onClick={() => setTradingRange(label as "1d" | "7d" | "30d" | "All")}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="trading-graph" aria-hidden="true">
                    <div className="trading-graph-line" />
                  </div>
                  <div className="trading-kpi-row" aria-label="Trading summary">
                    <div className="trading-kpi-cell">
                      <p className="trading-kpi-label">Strategy</p>
                      <p className="trading-kpi-value">Conservative</p>
                    </div>
                    <div className="trading-kpi-cell">
                      <p className="trading-kpi-label">Open orders</p>
                      <p className="trading-kpi-value">3</p>
                    </div>
                    <div className="trading-kpi-cell">
                      <p className="trading-kpi-label">Execution</p>
                      <p className="trading-kpi-value trading-kpi-value--muted">Read-only</p>
                    </div>
                  </div>
                  <article className="metric-card trading-stat-card">
                    <p className="metric-label">Performance</p>
                    <p className="metric-value metric-value-accent">+4.2%</p>
                    <p className="trading-card-caption">Read-only summary</p>
                  </article>
                  {[
                    ["Stats", "12 active operations"],
                    ["Successful", "9"],
                    ["Unsuccessful", "1"],
                    ["New trade", "2"],
                  ].map(([label, value]) => (
                    <article key={label} className="metric-card trading-list-row">
                      <p className="metric-label">{label}</p>
                      <p className="metric-value">{value}</p>
                    </article>
                  ))}
                  <p className="metric-label">trading:</p>
                </div>
              )}

              {route === "faq" && (
                <div className="faq-list" role="list">
                  {FAQ_ENTRIES.map((entry) => {
                    const isOpen = expandedFaqId === entry.id;
                    return (
                      <div
                        key={entry.id}
                        className={`faq-accordion-item${isOpen ? " faq-accordion-item--open" : ""}`}
                        role="listitem"
                      >
                        <button
                          type="button"
                          className="faq-item-trigger"
                          aria-expanded={isOpen}
                          aria-controls={`faq-panel-${entry.id}`}
                          id={`faq-trigger-${entry.id}`}
                          disabled={isBusy}
                          onClick={() => setExpandedFaqId(isOpen ? null : entry.id)}
                        >
                          <span className="faq-item-title">{entry.title}</span>
                          <span className="faq-chevron-wrap" aria-hidden="true">
                            <span className={`faq-chevron-icon${isOpen ? " faq-chevron-icon--open" : ""}`} />
                          </span>
                        </button>
                        {isOpen ? (
                          <div
                            className="faq-expanded"
                            id={`faq-panel-${entry.id}`}
                            role="region"
                            aria-labelledby={`faq-trigger-${entry.id}`}
                          >
                            <p className="faq-expanded-body">{entry.body}</p>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}

              {route === "topup" && (
                <div className="topup-block">
                  <h3 className="topup-title">Receive USDT</h3>
                  <TopUpQrVisual />
                  <p className="topup-qr-hint">Scan the code or copy the address below</p>
                  <div className="topup-deposit-stack">
                    <article className="metric-card topup-deposit-card">
                      <div className="topup-deposit-head">
                        <p className="metric-label">Network</p>
                        <p className="topup-network-pill">TRC20</p>
                      </div>
                      <div className="topup-wallet-copy-row">
                        <div className="topup-wallet-text-block">
                          <p className="metric-label">Deposit address</p>
                          <p className="topup-address-mono">{topupAddressDisplay(TOPUP_DEPOSIT_ADDRESS)}</p>
                        </div>
                        <button
                          type="button"
                          className="topup-copy-cta"
                          disabled={isBusy}
                          onClick={async () => {
                            if (isBusy) return;
                            try {
                              await navigator.clipboard.writeText(TOPUP_DEPOSIT_ADDRESS);
                              flashTopupCopied();
                            } catch {
                              /* clipboard may be unavailable */
                            }
                          }}
                        >
                          {topupCopied ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </article>
                  </div>
                </div>
              )}

              {route === "withdraw" && (
                <div className="withdraw-block">
                  <article className="metric-card withdraw-form-card">
                    <div className="withdraw-form-head">
                      <p className="metric-label">Destination</p>
                      <span className="withdraw-network-pill">TRC20</span>
                    </div>
                    <div className="withdraw-field-wrap">
                      <div
                        className="withdraw-field"
                        role="textbox"
                        aria-label="Wallet address (demo placeholder)"
                        aria-readonly="true"
                        tabIndex={0}
                      >
                        Paste
                      </div>
                    </div>
                    <p className="withdraw-field-hint">
                      USDT on TRC20 only. Sending on the wrong network may result in permanent loss.
                    </p>
                  </article>
                  <div className="withdraw-callout" role="note">
                    <span className="withdraw-callout-mark" aria-hidden="true">
                      ⏱
                    </span>
                    <p className="withdraw-callout-text">
                      Withdrawals are automatic. Typical completion: <strong>10 min – 3 h</strong> (up to 7 days in
                      edge cases).
                    </p>
                  </div>
                  <article className="metric-card withdraw-balance-panel">
                    <div className="withdraw-balance-head">
                      <p className="withdraw-balance-title">Balance</p>
                      <span className="withdraw-balance-badge">Live</span>
                    </div>
                    <div className="withdraw-balance-main">
                      <div>
                        <p className="metric-label">Current balance</p>
                        <p className="withdraw-balance-figure">725.62 USDT</p>
                      </div>
                    </div>
                    <div className="withdraw-balance-divider" />
                    <div className="withdraw-available-block">
                      <p className="metric-label">Available for withdrawal*</p>
                      <p className="withdraw-available-figure">653.06 USDT</p>
                    </div>
                    <div className="withdraw-fee-strip">
                      <p className="withdraw-fee-strip-text">
                        *Fee charged from remaining balance — <strong>10%</strong> withdrawal fee applies.
                      </p>
                    </div>
                  </article>
                </div>
              )}

              {route === "confirm" && (
                <div className="confirm-block">
                  {confirmStep === "success" ? (
                    <article className="metric-card confirm-result-card" aria-live="polite">
                      <div className="confirm-result-mark" aria-hidden="true">
                        ✓
                      </div>
                      <p className="confirm-result-kicker">Mocked completion</p>
                      <h3 className="confirm-result-title">Transfer queued successfully</h3>
                      <p className="confirm-result-body">
                        Your frontend flow completed and a mocked result was shown instead of redirecting silently.
                      </p>
                      <div className="confirm-result-meta">
                        <span className="confirm-result-meta-label">Trace</span>
                        <span className="confirm-result-meta-value">trace_02adf1</span>
                      </div>
                    </article>
                  ) : (
                    <article className="metric-card confirm-cheque-card">
                      <header className="confirm-cheque-head">
                        <div>
                          <p className="confirm-cheque-kicker">Operation summary</p>
                          <h3 className="confirm-cheque-title">Confirm withdrawal</h3>
                        </div>
                        <span className="confirm-cheque-ref" title="Trace reference">
                          trace_02adf1
                        </span>
                      </header>
                      <div className="confirm-cheque-body">
                        <div className="confirm-cheque-row">
                          <span className="confirm-cheque-label">Recipient</span>
                          <span className="confirm-cheque-value">TRC20 · wallet ending …8A2F</span>
                        </div>
                        <div className="confirm-cheque-divider" />
                        <div className="confirm-cheque-row confirm-cheque-row--hero">
                          <span className="confirm-cheque-label">Amount</span>
                          <div className="confirm-cheque-amount-block">
                            <span className="confirm-cheque-amount">600.00</span>
                            <span className="confirm-cheque-unit">USDT</span>
                          </div>
                        </div>
                        <div className="confirm-cheque-row confirm-cheque-row--fee">
                          <span className="confirm-cheque-label">Comission</span>
                          <span className="confirm-cheque-fee">10%</span>
                        </div>
                        <p className="confirm-cheque-subline">
                          Fee is withheld from your balance before the transfer is sent.
                        </p>
                      </div>
                      <footer className="confirm-cheque-foot">
                        <p className="confirm-cheque-disclaimer">
                          *Review all details. Blockchain transfers are <strong>irreversible</strong> after
                          submission.
                        </p>
                      </footer>
                    </article>
                  )}
                </div>
              )}

              <div className="cta-row">
                {primaryCta ? (
                  <button
                    className="btn-main"
                    onClick={
                      primaryCta.action === "confirm-submit"
                        ? handleConfirmSend
                        : () => navigate(primaryCta.target ?? "dashboard")
                    }
                    disabled={isBusy || (route === "confirm" && confirmStep === "submitting")}
                  >
                    {route === "confirm" && confirmStep === "submitting" ? "Sending..." : primaryCta.label}
                  </button>
                ) : null}
                {secondaryCta ? (
                  <button
                    className="ghost btn-secondary"
                    onClick={
                      route === "confirm" && confirmStep === "success"
                        ? () => navigate("dashboard")
                        : () => navigate(secondaryCta.target)
                    }
                    disabled={isBusy}
                  >
                    {route === "confirm" && confirmStep === "success" ? "Back to Dashboard" : secondaryCta.label}
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </StateView>
      </section>

      <nav className="bottom-bar" aria-label="Bottom navigation">
        {topLevelRoutes.map((item) => (
          <button
            key={item.route}
            type="button"
            onClick={() => navigate(item.route)}
            aria-current={route === item.route ? "page" : undefined}
            className={`tab${route === item.route ? " tab-active" : ""}`}
            disabled={isBusy}
          >
            <span className="tab-stack">
              <span className="tab-glyph" aria-hidden="true">
                <TabGlyph route={item.route} />
              </span>
              <span className="tab-label">{bottomNavCaption[item.route] ?? item.label}</span>
            </span>
          </button>
        ))}
      </nav>
    </main>
  );
}

export default App;
