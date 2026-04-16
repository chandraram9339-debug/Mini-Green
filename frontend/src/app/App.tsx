import React from "react";
import {
  ApiError,
  confirmAction,
  createTopUp,
  createWithdraw,
  type DashboardPayload,
  fetchDashboard,
  fetchFaq,
  fetchMoneyDetails,
  fetchTradingDetails,
  initSession,
  type MoneyDetailsPayload,
  resolveInitData,
  type SessionPayload,
} from "./api";
import { routeTitles, screenData, topLevelRoutes } from "./data";
import type { LoadState, RouteId } from "./types";
import topupQrAsset from "./assets/topup-qr-1-5256.svg";
import topBarBackIcon from "./assets/topbar-back-1-6437.svg";
import topBarNotifyIcon from "./assets/topbar-notify-1-6436.svg";
import topBarSettingsIcon from "./assets/topbar-settings-1-6435.svg";

const fallbackRoute: RouteId = "dashboard";
const uiStorageKey = "miniapp-frontend-ui-state";
const DEFAULT_ACTION_AMOUNT_MINOR = 60000;
const DEFAULT_ACTION_FEE_LABEL = "10%";
const DEFAULT_TOPUP_ADDRESS = "TD7WuK8xQY2mN4pL6vR3tZ9aBcDeF1gH2JkLm";

/** Figma-only fields: no backend read path in current scope; kept localized for 1:1 visuals. */
const FIGMA_VISUAL_STUBS = {
  referralAmount: "425.22",
  tradingPriceLine: "69 425.22",
  performancePeriod: "7D",
  performanceLegendPrimary: "Bot yield",
  performanceLegendSecondary: "Benchmark",
} as const;

const LOCAL_FAQ_ENTRIES: Array<{ id: string; title: string; body: string }> = [
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

interface PendingAction {
  actionId: string;
  kind: "top-up" | "withdraw";
  amountMinor: number;
  status: string;
  traceId: string;
  recipientLabel: string;
}

function formatMinor(minor: number): string {
  return (minor / 100).toFixed(2);
}

function mergeFaqEntries(remoteEntries: Array<{ id: string; q: string; a: string }>) {
  const merged = new Map(LOCAL_FAQ_ENTRIES.map((entry) => [entry.id, entry]));
  remoteEntries.forEach((entry) => {
    merged.set(entry.id, {
      id: entry.id,
      title: entry.q,
      body: entry.a,
    });
  });
  return Array.from(merged.values());
}

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

function readUiStorage() {
  try {
    const raw = window.sessionStorage.getItem(uiStorageKey);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<{
      moneyFilter: "all" | "in" | "out";
      tradingRange: "1d" | "7d" | "30d" | "All";
      withdrawAddress: string;
    }>;
  } catch {
    return {};
  }
}

function readForcedState(route: RouteId): Exclude<LoadState, "ready"> | null {
  const params = new URLSearchParams(window.location.search);
  const state = params.get(`${route}State`);
  if (state === "loading" || state === "empty" || state === "error") {
    return state;
  }
  return null;
}

interface StateViewProps {
  state: LoadState;
  onRetry: () => void;
  children: React.ReactNode;
}

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
    route === "confirm"
  );
}

function App() {
  const storedUiState = React.useMemo(() => readUiStorage(), []);
  const resolvedInitIdentity = React.useMemo(() => resolveInitData(), []);
  const [initState, setInitState] = React.useState<"loading" | "error" | "ready">("loading");
  const [initToken, setInitToken] = React.useState(0);
  const [route, setRoute] = React.useState<RouteId>(pathToRoute(window.location.pathname));
  const [expandedFaqId, setExpandedFaqId] = React.useState<string | null>(null);
  const [moneyFilter, setMoneyFilter] = React.useState<"all" | "in" | "out">(storedUiState.moneyFilter ?? "all");
  const [tradingRange, setTradingRange] = React.useState<"1d" | "7d" | "30d" | "All">(
    storedUiState.tradingRange ?? "7d"
  );
  const [withdrawAddress, setWithdrawAddress] = React.useState(storedUiState.withdrawAddress ?? "");
  const [topupCopyState, setTopupCopyState] = React.useState<"idle" | "success" | "error">("idle");
  const [confirmStep, setConfirmStep] = React.useState<"review" | "submitting" | "success">("review");
  const [screenState, setScreenState] = React.useState<LoadState>("loading");
  const [screenReloadToken, setScreenReloadToken] = React.useState(0);
  const [session, setSession] = React.useState<
    | (SessionPayload & {
        traceId: string;
        initData: string;
        resolvedInitSource: string;
      })
    | null
  >(null);
  const [dashboardData, setDashboardData] = React.useState<DashboardPayload | null>(null);
  const [moneyData, setMoneyData] = React.useState<MoneyDetailsPayload | null>(null);
  const [faqEntries, setFaqEntries] = React.useState(LOCAL_FAQ_ENTRIES);
  const [pendingAction, setPendingAction] = React.useState<PendingAction | null>(null);
  const [actionState, setActionState] = React.useState<"idle" | "submitting">("idle");
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const topupCopyTimerRef = React.useRef<number | null>(null);

  const flashTopupCopied = React.useCallback(() => {
    if (topupCopyTimerRef.current != null) window.clearTimeout(topupCopyTimerRef.current);
    setTopupCopyState("success");
    topupCopyTimerRef.current = window.setTimeout(() => {
      setTopupCopyState("idle");
      topupCopyTimerRef.current = null;
    }, 2000);
  }, []);

  const flashTopupCopyError = React.useCallback(() => {
    if (topupCopyTimerRef.current != null) window.clearTimeout(topupCopyTimerRef.current);
    setTopupCopyState("error");
    topupCopyTimerRef.current = window.setTimeout(() => {
      setTopupCopyState("idle");
      topupCopyTimerRef.current = null;
    }, 2000);
  }, []);

  React.useEffect(() => {
    return () => {
      if (topupCopyTimerRef.current != null) window.clearTimeout(topupCopyTimerRef.current);
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
    try {
      window.sessionStorage.setItem(
        uiStorageKey,
        JSON.stringify({
          moneyFilter,
          tradingRange,
          withdrawAddress,
        })
      );
    } catch {
      /* session storage may be unavailable */
    }
  }, [moneyFilter, tradingRange, withdrawAddress]);

  React.useEffect(() => {
    if (route !== "confirm") {
      setConfirmStep("review");
    }
  }, [route]);

  React.useEffect(() => {
    setActionMessage(null);
  }, [route]);

  React.useEffect(() => {
    if (route !== "faq") {
      setExpandedFaqId(null);
      return;
    }
    const param = new URLSearchParams(window.location.search).get("faqExpand");
    if (param && faqEntries.some((e) => e.id === param)) {
      setExpandedFaqId(param);
    } else {
      setExpandedFaqId(null);
    }
  }, [faqEntries, route]);

  const startInit = React.useCallback(() => {
    setInitToken((current) => current + 1);
  }, []);

  React.useEffect(() => {
    setInitState("loading");
    setActionMessage(null);
    const params = new URLSearchParams(window.location.search);
    if (params.get("initFail") === "1") {
      setInitState("error");
      return;
    }

    const abortController = new AbortController();
    initSession(resolvedInitIdentity.value, abortController.signal)
      .then(({ data, traceId }) => {
        setSession({
          ...data,
          traceId,
          initData: resolvedInitIdentity.value,
          resolvedInitSource: resolvedInitIdentity.source,
        });
        setInitState("ready");
        navigate(pathToRoute(window.location.pathname), true);
      })
      .catch(() => {
        setInitState("error");
      });

    return () => abortController.abort();
  }, [initToken, navigate, resolvedInitIdentity]);

  React.useEffect(() => {
    if (initState !== "ready" || !session) {
      return;
    }

    const forcedState = readForcedState(route);
    if (forcedState) {
      setScreenState(forcedState);
      return;
    }

    if (route === "topup" || route === "withdraw" || route === "confirm") {
      setScreenState("ready");
      return;
    }

    const abortController = new AbortController();
    setScreenState("loading");

    const loadRoute = async () => {
      try {
        if (route === "dashboard") {
          const { data } = await fetchDashboard(session.initData, abortController.signal);
          setDashboardData(data);
          setScreenState("ready");
          return;
        }

        if (route === "money") {
          const { data } = await fetchMoneyDetails(session.initData, abortController.signal);
          setMoneyData(data);
          setScreenState("ready");
          return;
        }

        if (route === "trading") {
          await fetchTradingDetails(session.initData, abortController.signal);
          setScreenState("ready");
          return;
        }

        if (route === "faq") {
          const { data } = await fetchFaq(session.initData, abortController.signal);
          setFaqEntries(mergeFaqEntries(data.items));
          setScreenState(data.items.length === 0 ? "empty" : "ready");
        }
      } catch {
        if (!abortController.signal.aborted) {
          setScreenState("error");
        }
      }
    };

    void loadRoute();
    return () => abortController.abort();
  }, [initState, route, screenReloadToken, session]);

  const retry = React.useCallback(() => {
    setScreenReloadToken((current) => current + 1);
  }, []);

  const content = screenData[route];
  const primaryCta = content.primaryCta;
  const secondaryCta = content.secondaryCta;
  const isDashboard = route === "dashboard";
  const isBusy =
    screenState === "loading" || actionState === "submitting" || confirmStep === "submitting";

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

  const handleTopUpContinue = React.useCallback(async () => {
    if (!session || isBusy) return;
    setActionState("submitting");
    setActionMessage(null);
    try {
      const { data, traceId } = await createTopUp(session.initData, DEFAULT_ACTION_AMOUNT_MINOR);
      setPendingAction({
        actionId: data.action_id,
        kind: "top-up",
        amountMinor: data.amount_minor,
        status: data.status,
        traceId,
        recipientLabel: "TRC20 deposit wallet",
      });
      navigate("confirm");
    } catch (error) {
      setActionMessage(
        error instanceof ApiError ? error.message : "Unable to create top up action right now."
      );
    } finally {
      setActionState("idle");
    }
  }, [isBusy, navigate, session]);

  const handleWithdrawContinue = React.useCallback(async () => {
    if (!session || isBusy) return;
    if (!withdrawAddress.trim()) {
      setActionMessage("Paste a destination wallet address before continuing.");
      return;
    }
    setActionState("submitting");
    setActionMessage(null);
    try {
      const { data, traceId } = await createWithdraw(session.initData, DEFAULT_ACTION_AMOUNT_MINOR);
      const compactAddress = withdrawAddress.trim();
      setPendingAction({
        actionId: data.request_id,
        kind: "withdraw",
        amountMinor: data.amount_minor,
        status: data.status,
        traceId,
        recipientLabel: `TRC20 · wallet ending …${compactAddress.slice(-4).toUpperCase()}`,
      });
      navigate("confirm");
    } catch (error) {
      setActionMessage(
        error instanceof ApiError ? error.message : "Unable to create withdraw request right now."
      );
    } finally {
      setActionState("idle");
    }
  }, [isBusy, navigate, session, withdrawAddress]);

  const handleConfirmSend = React.useCallback(async () => {
    if (!session || !pendingAction || isBusy || confirmStep !== "review") return;
    setConfirmStep("submitting");
    setActionMessage(null);
    try {
      const { data, traceId } = await confirmAction(session.initData, pendingAction.actionId);
      setPendingAction((current) =>
        current
          ? {
              ...current,
              status: data.status,
              traceId,
            }
          : current
      );
      setConfirmStep("success");
    } catch (error) {
      setConfirmStep("review");
      setActionMessage(
        error instanceof ApiError ? error.message : "Unable to confirm this action right now."
      );
    }
  }, [confirmStep, isBusy, pendingAction, session]);

  const dashboardBalance = dashboardData ? formatMinor(dashboardData.wallet_minor) : "0.00";
  const moneyAvailable = moneyData ? formatMinor(moneyData.available_minor) : "0.00";
  const withdrawAvailable = moneyData ? formatMinor(moneyData.available_minor) : "0.00";
  const confirmAmount = pendingAction ? formatMinor(pendingAction.amountMinor) : formatMinor(DEFAULT_ACTION_AMOUNT_MINOR);
  const confirmTrace = pendingAction?.traceId ?? session?.traceId ?? "trace_unavailable";

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
          <div
            className="top-bar-accessories"
            role="toolbar"
            aria-label={route === "topup" ? "Close deposit" : "Quick actions"}
          >
            {route === "topup" ? (
              <button
                type="button"
                className="top-bar-chip top-bar-chip--close"
                disabled={isBusy}
                aria-label="Close"
                onClick={handleBack}
              >
                <span className="top-bar-close-glyph" aria-hidden="true">
                  ×
                </span>
              </button>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </header>

      <section className={`screen-card screen-${route}`}>
        {isDashboard ? (
          <div className="dashboard-top">
            <p className="dashboard-balance-label">Total Balance</p>
            <div className="dashboard-balance-row">
              <div>
                <p className="dashboard-balance-value">{dashboardBalance}</p>
                <p className="dashboard-referral-kicker">Received by referrals</p>
                <p className="dashboard-referral-amount">
                  {FIGMA_VISUAL_STUBS.referralAmount} <span className="dashboard-referral-unit">USDT</span>
                </p>
              </div>
              <div className="dashboard-actions">
                <button
                  className="dashboard-pill dashboard-pill-main"
                  onClick={() => navigate("topup")}
                  disabled={isBusy}
                >
                  Top up
                </button>
                <button
                  className="dashboard-pill dashboard-pill-muted"
                  onClick={() => navigate("withdraw")}
                  disabled={isBusy}
                >
                  Withdraw
                </button>
              </div>
            </div>
            <button className="dashboard-details-btn" onClick={() => navigate("money")} disabled={isBusy}>
              Details
            </button>
          </div>
        ) : null}
        <StateView state={screenState} onRetry={retry}>
          {isDashboard ? (
            <div className="dashboard-body">
              <section className="dashboard-block dashboard-block--graphic" aria-label="Performance chart">
                <div className="dashboard-perf">
                  <div className="dashboard-perf-head">
                    <span className="dashboard-perf-title">% Performance</span>
                    <span className="dashboard-perf-period">{FIGMA_VISUAL_STUBS.performancePeriod}</span>
                  </div>
                  <div className="dashboard-perf-chart" aria-hidden="true">
                    <div className="dashboard-perf-y-axis">
                      <span>+8%</span>
                      <span>+4%</span>
                      <span>0%</span>
                      <span>-4%</span>
                    </div>
                    <div className="dashboard-perf-plot">
                      <div className="dashboard-perf-grid" />
                      <div className="dashboard-perf-area" />
                      <div className="dashboard-perf-line" />
                    </div>
                  </div>
                  <div className="dashboard-perf-legend">
                    <span className="dashboard-perf-legend-item">
                      <span className="dashboard-perf-swatch dashboard-perf-swatch--primary" />
                      {FIGMA_VISUAL_STUBS.performanceLegendPrimary}
                    </span>
                    <span className="dashboard-perf-legend-item">
                      <span className="dashboard-perf-swatch dashboard-perf-swatch--muted" />
                      {FIGMA_VISUAL_STUBS.performanceLegendSecondary}
                    </span>
                  </div>
                </div>
              </section>
              <section
                className="dashboard-block dashboard-block--status"
                aria-label="Bot status and market price"
              >
                <div className="dashboard-status-card">
                  <div className="dashboard-status">
                    <p>
                      Bot status <strong>● Active</strong>
                    </p>
                    <p>
                      Actual price <strong>{FIGMA_VISUAL_STUBS.tradingPriceLine}</strong> <span>USDT/BTC</span>
                    </p>
                  </div>
                </div>
              </section>
              <div className="dashboard-block dashboard-block--cta" role="group" aria-label="Dashboard actions">
                <div className="dashboard-cta-stack">
                  <button className="dashboard-secondary-btn" onClick={() => navigate("money")} disabled={isBusy}>
                    Details
                  </button>
                  <div className="dashboard-support-row">
                    <button className="dashboard-secondary-btn" onClick={() => navigate("faq")} disabled={isBusy}>
                      Channel
                    </button>
                    <button className="dashboard-secondary-btn" onClick={() => openFaqEntry("support")} disabled={isBusy}>
                      Chat
                    </button>
                  </div>
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
                  <h2 className="internal-hero-title">{routeTitles.faq}</h2>
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
                        {moneyAvailable} <span className="money-overview-unit">USDT</span>
                      </p>
                    </div>
                    <div className="money-overview-side">
                      <div className="money-side-block">
                        <p className="money-side-label">Referral</p>
                        <p className="money-side-value">{FIGMA_VISUAL_STUBS.referralAmount}</p>
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
                  {faqEntries.map((entry) => {
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
                          <p className="topup-address-mono">{topupAddressDisplay(DEFAULT_TOPUP_ADDRESS)}</p>
                        </div>
                        <button
                          type="button"
                          className="topup-copy-cta"
                          disabled={isBusy}
                          onClick={async () => {
                            if (isBusy) return;
                            try {
                              await navigator.clipboard.writeText(DEFAULT_TOPUP_ADDRESS);
                              flashTopupCopied();
                            } catch {
                              flashTopupCopyError();
                            }
                          }}
                        >
                          {topupCopyState === "success"
                            ? "Copied"
                            : topupCopyState === "error"
                              ? "Copy unavailable"
                              : "Copy"}
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
                      <input
                        type="text"
                        className="withdraw-field"
                        aria-label="Wallet address"
                        placeholder="Paste"
                        autoComplete="off"
                        spellCheck={false}
                        inputMode="text"
                        value={withdrawAddress}
                        onChange={(event) => setWithdrawAddress(event.target.value)}
                        disabled={isBusy}
                      />
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
                        <p className="withdraw-balance-figure">{dashboardBalance} USDT</p>
                      </div>
                    </div>
                    <div className="withdraw-balance-divider" />
                    <div className="withdraw-available-block">
                      <p className="metric-label">Available for withdrawal*</p>
                      <p className="withdraw-available-figure">{withdrawAvailable} USDT</p>
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
                      <p className="confirm-result-kicker">Transfer status</p>
                      <h3 className="confirm-result-title">Transfer queued successfully</h3>
                      <p className="confirm-result-body">
                        Your transfer request was accepted. You can continue from the dashboard or review activity on
                        the Money screen.
                      </p>
                      <div className="confirm-result-meta">
                        <span className="confirm-result-meta-label">Trace</span>
                        <span className="confirm-result-meta-value">{confirmTrace}</span>
                      </div>
                    </article>
                  ) : (
                    <article className="metric-card confirm-cheque-card">
                      <header className="confirm-cheque-head">
                        <div>
                          <p className="confirm-cheque-kicker">Operation summary</p>
                          <h3 className="confirm-cheque-title">
                            {pendingAction?.kind === "top-up" ? "Confirm top up" : "Confirm withdrawal"}
                          </h3>
                        </div>
                        <span className="confirm-cheque-ref" title="Trace reference">
                          {confirmTrace}
                        </span>
                      </header>
                      <div className="confirm-cheque-body">
                        <div className="confirm-cheque-row">
                          <span className="confirm-cheque-label">Recipient</span>
                          <span className="confirm-cheque-value">
                            {pendingAction?.recipientLabel ?? "TRC20 · —"}
                          </span>
                        </div>
                        <div className="confirm-cheque-divider" />
                        <div className="confirm-cheque-row confirm-cheque-row--hero">
                          <span className="confirm-cheque-label">Amount</span>
                          <div className="confirm-cheque-amount-block">
                            <span className="confirm-cheque-amount">{confirmAmount}</span>
                            <span className="confirm-cheque-unit">USDT</span>
                          </div>
                        </div>
                        <div className="confirm-cheque-row confirm-cheque-row--fee">
                          <span className="confirm-cheque-label">Comission</span>
                          <span className="confirm-cheque-fee">{DEFAULT_ACTION_FEE_LABEL}</span>
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

              {actionMessage ? <p className="action-banner" role="alert">{actionMessage}</p> : null}

              <div className="cta-row">
                {primaryCta ? (
                  <button
                    className="btn-main"
                    onClick={
                      route === "topup"
                        ? handleTopUpContinue
                        : route === "withdraw"
                          ? handleWithdrawContinue
                          : primaryCta.action === "confirm-submit"
                            ? handleConfirmSend
                            : () => navigate(primaryCta.target ?? "dashboard")
                    }
                    disabled={isBusy || (route === "confirm" && !pendingAction)}
                  >
                    {route === "topup" && actionState === "submitting"
                      ? "Creating..."
                      : route === "withdraw" && actionState === "submitting"
                        ? "Creating..."
                        : route === "confirm" && confirmStep === "submitting"
                          ? "Sending..."
                          : primaryCta.label}
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
