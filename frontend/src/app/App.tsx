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
import { DASHBOARD_EXTERNAL_LINKS, MISSING_EXTERNAL_LINK_ENV_KEYS } from "./config";
import { routeTitles, screenData, topLevelRoutes } from "./data";
import type { LoadState, RouteId } from "./types";
import topupQrAsset from "./assets/topup-qr-1-5256.svg";
import dashboardGraphicGridline from "./assets/dashboard-graphic-gridline.svg";
import dashboardGraphicLine from "./assets/dashboard-graphic-line.svg";
import topBarBackIcon from "./assets/topbar-back-1-6437.svg";
import topBarNotifyIcon from "./assets/topbar-notify-1-6436.svg";
import topBarSettingsIcon from "./assets/topbar-settings-1-6435.svg";

const fallbackRoute: RouteId = "dashboard";
const uiStorageKey = "miniapp-frontend-ui-state";
const postNavBannerStorageKey = "miniapp-frontend-post-nav-banner";
const doneReceiptStorageKey = "miniapp-frontend-done-receipt";
const DEFAULT_ACTION_AMOUNT_MINOR = 60000;
const MIN_WITHDRAW_AMOUNT_MINOR = 500;
const WITHDRAW_FEE_BPS = 1000;
const DEFAULT_TOPUP_ADDRESS = "TD7WuK8xQY2mN4pL6vR3tZ9aBcDeF1gH2JkLm";
const DEFAULT_SEED_WORDS = [
  "apple",
  "carpet",
  "vapor",
  "harbor",
  "engine",
  "fabric",
  "silver",
  "orchid",
  "planet",
  "yellow",
  "socket",
  "mango",
] as const;
const DASHBOARD_MOCK_FALLBACK: DashboardPayload = {
  screen: "dashboard",
  wallet_minor: 0,
  pnl_minor: 0,
  open_positions: 0,
};

/** Figma-only fields: no backend read path in current scope; kept localized for 1:1 visuals. */
const FIGMA_VISUAL_STUBS = {
  referralAmount: "425.22",
  tradingPriceLine: "69 425.22",
  performancePeriod: "7D",
  performanceLegendPrimary: "Bot yield",
  performanceLegendSecondary: "Benchmark",
} as const;

interface PendingAction {
  actionId: string;
  kind: "withdraw";
  amountMinor: number;
  feeMinor: number;
  status: string;
  traceId: string;
  recipientLabel: string;
  recipientAddress?: string;
}

interface DoneReceipt {
  traceId: string;
  amountMinor: number;
  feeMinor: number;
  recipientAddress: string;
}

function formatMinor(minor: number): string {
  return (minor / 100).toFixed(2);
}

/** Y-axis tick labels (USDT) when Home chart shows balance history (funded wallet). */
function dashboardFundedYAxisLabels(walletMinor: number): string[] {
  if (walletMinor <= 0) {
    return Array.from({ length: 7 }, () => "0.00");
  }
  const top = Math.max(Math.ceil((walletMinor * 1.2) / 100) * 100, 100);
  const bottom = Math.floor((walletMinor * 0.78) / 100) * 100;
  const span = Math.max(top - bottom, 100);
  const step = span / 6;
  return Array.from({ length: 7 }, (_, i) => formatMinor(Math.round(top - i * step)));
}

/** Figma Ready `1 | Home` → Graphic `1:3658` — Y scale ticks (Outfit 6px, #8494AF). */
const DASHBOARD_PERF_EMPTY_Y_AXIS = [
  "7.00%",
  "6.00%",
  "5.00%",
  "4.00%",
  "3.00%",
  "2.00%",
  "1.00%",
  "0.00%",
  "−1.00%",
  "−2.00%",
] as const;
const DASHBOARD_PERF_FUNDED_X_AXIS = ["−25d", "−20d", "−15d", "−10d", "−5d", "Now"] as const;
const DASHBOARD_PERF_EMPTY_X_AXIS = ["W1", "W2", "W3", "W4", "W5", "W6"] as const;

function parseAmountMinor(raw: string): number | null {
  const normalized = raw.trim().replace(",", ".");
  if (!normalized || !/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100);
}

function isBasicTronAddress(address: string): boolean {
  return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address.trim());
}

type TradingRange = "24h" | "7d" | "1m" | "3m";

function moneyFilterToPath(filter: "deposit" | "withdraw" | "referral"): string {
  switch (filter) {
    case "deposit":
      return "/balance/deposit";
    case "withdraw":
      return "/balance/withdraw";
    case "referral":
      return "/balance/referral";
  }
}

function routeToPath(route: RouteId): string {
  switch (route) {
    case "dashboard":
      return "/home";
    case "money":
      return "/balance/deposit";
    case "trading":
      return "/bot/detail";
    case "done":
      return "/done";
    case "support":
      return "/support";
    case "social":
      return "/social";
    default:
      return `/${route}`;
  }
}

function pathToRoute(pathname: string): RouteId {
  const key = pathname.replace(/^\/+/, "").toLowerCase();
  if (key === "" || key === "home" || key === "dashboard") return "dashboard";
  if (
    key === "money" ||
    key === "balance" ||
    key === "balance/deposit" ||
    key === "balance/withdraw" ||
    key === "balance/referral"
  ) {
    return "money";
  }
  if (key === "trading" || key === "bot/detail") return "trading";
  if (key === "faq") return "faq";
  if (key === "notifications" || key === "notification") return "notifications";
  if (key === "settings") return "settings";
  if (key === "support") return "support";
  if (key === "social" || key === "social-media") return "social";
  if (key === "seed") return "seed";
  if (key === "agreement") return "agreement";
  if (key === "topup" || key === "top-up") return "topup";
  if (key === "withdraw") return "withdraw";
  if (key === "confirm") return "confirm";
  if (key === "done") return "done";
  return fallbackRoute;
}

function readUiStorage() {
  try {
    const raw = window.sessionStorage.getItem(uiStorageKey);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<{
      moneyFilter: "deposit" | "withdraw" | "referral" | "all" | "in" | "out";
      tradingRange: TradingRange | "1d" | "30d" | "All";
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
  messages?: Partial<Record<Exclude<LoadState, "ready">, string>>;
}

function topupAddressTwoLines(full: string): readonly [string, string] {
  if (full.length <= 22) return [full, ""] as const;
  const mid = Math.ceil(full.length / 2);
  return [full.slice(0, mid), full.slice(mid)] as const;
}

function TopUpQrVisual() {
  return (
    <div className="topup-qr-shell" aria-hidden="true">
      <img className="topup-qr-svg" src={topupQrAsset} alt="Deposit QR code" />
    </div>
  );
}

function TopupAddressPanel({ address }: { address: string }) {
  const [first, second] = topupAddressTwoLines(address);
  return (
    <article className="topup-address-panel">
      <div className="topup-address-panel-head">
        <p className="metric-label topup-address-panel-title">Deposit address</p>
        <span className="topup-network-chip">TRC20</span>
      </div>
      <div className="topup-address-lines" aria-label="Deposit address">
        <p className="topup-address-line">{first}</p>
        {second ? <p className="topup-address-line">{second}</p> : null}
      </div>
    </article>
  );
}

function StateView({ state, onRetry, children, messages }: StateViewProps) {
  const loadingText = messages?.loading ?? "Loading screen data...";
  const emptyText = messages?.empty ?? "No data to show yet.";
  const errorText = messages?.error ?? "Unable to load this screen.";
  if (state === "loading") {
    return (
      <div className="state-box">
        <div className="spinner" aria-hidden="true" />
        <p className="state-text">{loadingText}</p>
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="state-box">
        <p className="state-text">{emptyText}</p>
        <button onClick={onRetry}>Reload</button>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="state-box">
        <p className="state-text">{errorText}</p>
        <button onClick={onRetry}>Retry</button>
      </div>
    );
  }

  return <>{children}</>;
}

const bottomNavCaption: Partial<Record<RouteId, string>> = {
  dashboard: "Home",
  money: "Balance",
  trading: "Bot",
  faq: "FAQ",
};

function getBottomTabRoute(route: RouteId): RouteId {
  if (route === "money" || route === "topup" || route === "withdraw" || route === "confirm" || route === "done") {
    return "money";
  }
  if (route === "trading") return "trading";
  if (route === "faq" || route === "notifications" || route === "settings" || route === "support" || route === "social") {
    return "faq";
  }
  if (route === "seed" || route === "agreement") return "faq";
  return "dashboard";
}

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

/**
 * Performance chart from Figma node `1:3658` (component Graphic).
 * Exported SVGs from MCP assets — stable in repo (see `assets/dashboard-graphic-*.svg`).
 */
function DashboardFigmaPerformanceGraphic() {
  const ticks = DASHBOARD_PERF_EMPTY_Y_AXIS;
  return (
    <div className="dashboard-figma-graphic" aria-hidden="true">
      <div className="dashboard-figma-graphic__scales">
        {ticks.map((label) => (
          <div key={label} className="dashboard-figma-graphic__row">
            <span className="dashboard-figma-graphic__tick">{label}</span>
            <div className="dashboard-figma-graphic__gridcell">
              <img className="dashboard-figma-graphic__gridline" src={dashboardGraphicGridline} alt="" />
            </div>
          </div>
        ))}
      </div>
      <div className="dashboard-figma-graphic__plot">
        <img className="dashboard-figma-graphic__line" src={dashboardGraphicLine} alt="" />
      </div>
    </div>
  );
}

/** Balance / performance chart — funded wallet uses programmatic history plot. */
function DashboardHomeBalanceChart({ funded }: { funded: boolean }) {
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const gradArea = `dash-area-${uid}`;

  if (!funded) {
    return (
      <svg
        className="dashboard-perf-svg dashboard-perf-svg--empty"
        viewBox="0 0 300 96"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <path
          d="M 14 72 C 72 70 110 38 150 36 S 236 22 286 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="7 6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      className="dashboard-perf-svg dashboard-perf-svg--funded"
      viewBox="0 0 300 148"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradArea} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2d6e93" stopOpacity="0.24" />
          <stop offset="55%" stopColor="#73c1b1" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[20, 42, 64, 86, 108, 130].map((y) => (
        <line key={y} x1="4" y1={y} x2="296" y2={y} className="dashboard-perf-svg-gridline" />
      ))}
      <path
        d="M 8 118 C 36 118 52 104 78 96 S 120 86 146 74 S 188 52 234 38 S 268 30 292 26 L 292 142 L 8 142 Z"
        fill={`url(#${gradArea})`}
      />
      <path
        d="M 8 124 C 40 122 64 114 92 108 S 148 90 176 84 S 228 70 292 54"
        fill="none"
        stroke="#73c1b1"
        strokeWidth="1.75"
        strokeDasharray="5 5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M 8 118 C 36 118 52 104 78 96 S 120 86 146 74 S 188 52 234 38 S 268 30 292 26"
        fill="none"
        stroke="#2d6e93"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {(
        [
          [8, 118],
          [58, 102],
          [108, 88],
          [158, 64],
          [208, 48],
          [292, 26],
        ] as const
      ).map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" className="dashboard-perf-svg-dot" />
      ))}
    </svg>
  );
}

function App() {
  const storedUiState = React.useMemo(() => readUiStorage(), []);
  const resolvedInitIdentity = React.useMemo(() => resolveInitData(), []);
  const [initState, setInitState] = React.useState<"loading" | "error" | "ready">("loading");
  const [initToken, setInitToken] = React.useState(0);
  const [route, setRoute] = React.useState<RouteId>(pathToRoute(window.location.pathname));
  const [expandedFaqId, setExpandedFaqId] = React.useState<string | null>(null);
  const [moneyFilter, setMoneyFilter] = React.useState<"deposit" | "withdraw" | "referral">(() => {
    const path = typeof window !== "undefined" ? window.location.pathname.replace(/^\/+/, "").toLowerCase() : "";
    if (path === "balance/referral") return "referral";
    if (path === "balance/withdraw") return "withdraw";
    if (path === "balance/deposit" || path === "balance" || path === "money") return "deposit";
    if (storedUiState.moneyFilter === "deposit" || storedUiState.moneyFilter === "withdraw" || storedUiState.moneyFilter === "referral") {
      return storedUiState.moneyFilter;
    }
    if (storedUiState.moneyFilter === "in") return "deposit";
    if (storedUiState.moneyFilter === "out") return "withdraw";
    return "deposit";
  });
  const [tradingRange, setTradingRange] = React.useState<TradingRange>(() => {
    if (
      storedUiState.tradingRange === "24h" ||
      storedUiState.tradingRange === "7d" ||
      storedUiState.tradingRange === "1m" ||
      storedUiState.tradingRange === "3m"
    ) {
      return storedUiState.tradingRange;
    }
    if (storedUiState.tradingRange === "1d") return "24h";
    if (storedUiState.tradingRange === "30d") return "1m";
    if (storedUiState.tradingRange === "All") return "3m";
    return "7d";
  });
  const [withdrawAddress, setWithdrawAddress] = React.useState(storedUiState.withdrawAddress ?? "");
  const [withdrawAmount, setWithdrawAmount] = React.useState("");
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
  const [dashboardUsesFallback, setDashboardUsesFallback] = React.useState(false);
  const [moneyData, setMoneyData] = React.useState<MoneyDetailsPayload | null>(null);
  const [tradingOpenOrders, setTradingOpenOrders] = React.useState(0);
  const [faqEntries, setFaqEntries] = React.useState<Array<{ id: string; title: string; body: string }>>([]);
  const [pendingAction, setPendingAction] = React.useState<PendingAction | null>(null);
  const [doneReceipt, setDoneReceipt] = React.useState<DoneReceipt | null>(null);
  const [actionState, setActionState] = React.useState<"idle" | "submitting">("idle");
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const hasPendingExternalLinks = MISSING_EXTERNAL_LINK_ENV_KEYS.length > 0;
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

  const openExternalLink = React.useCallback((url: string, label: string) => {
    setActionMessage(null);
    if (!url || url === "TODO") {
      const missingKeysHint =
        MISSING_EXTERNAL_LINK_ENV_KEYS.length > 0
          ? ` Missing env: ${MISSING_EXTERNAL_LINK_ENV_KEYS.join(", ")}.`
          : "";
      setActionMessage(`${label} link will be added soon.${missingKeysHint}`);
      return;
    }
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) {
      window.location.assign(url);
    }
  }, []);

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
    if (route !== "money") return;
    const path = window.location.pathname.replace(/^\/+/, "").toLowerCase();
    if (path === "balance/referral" && moneyFilter !== "referral") {
      setMoneyFilter("referral");
      return;
    }
    if (path === "balance/withdraw" && moneyFilter !== "withdraw") {
      setMoneyFilter("withdraw");
      return;
    }
    if (path === "balance/deposit" && moneyFilter !== "deposit") {
      setMoneyFilter("deposit");
      return;
    }
    if ((path === "balance" || path === "money") && moneyFilter !== "deposit") {
      setMoneyFilter("deposit");
    }
  }, [moneyFilter, route]);

  React.useEffect(() => {
    if (route !== "confirm") {
      setConfirmStep("review");
    }
  }, [route]);

  React.useEffect(() => {
    setActionMessage(null);
  }, [route]);

  React.useEffect(() => {
    if (route !== "done") return;
    try {
      const raw = window.sessionStorage.getItem(doneReceiptStorageKey);
      if (!raw) {
        setDoneReceipt(null);
        return;
      }
      const parsed = JSON.parse(raw) as Partial<DoneReceipt>;
      if (
        typeof parsed.traceId === "string" &&
        typeof parsed.amountMinor === "number" &&
        typeof parsed.feeMinor === "number" &&
        typeof parsed.recipientAddress === "string"
      ) {
        setDoneReceipt({
          traceId: parsed.traceId,
          amountMinor: parsed.amountMinor,
          feeMinor: parsed.feeMinor,
          recipientAddress: parsed.recipientAddress,
        });
      } else {
        setDoneReceipt(null);
      }
      window.sessionStorage.removeItem(doneReceiptStorageKey);
    } catch {
      setDoneReceipt(null);
    }
  }, [route]);

  React.useEffect(() => {
    if (route !== "dashboard") return;
    try {
      const pendingBanner = window.sessionStorage.getItem(postNavBannerStorageKey);
      if (!pendingBanner) return;
      setActionMessage(pendingBanner);
      window.sessionStorage.removeItem(postNavBannerStorageKey);
    } catch {
      /* session storage may be unavailable */
    }
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

    if (
      route === "topup" ||
      route === "withdraw" ||
      route === "confirm" ||
      route === "done" ||
      route === "notifications" ||
      route === "settings" ||
      route === "support" ||
      route === "social" ||
      route === "seed" ||
      route === "agreement"
    ) {
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
          setDashboardUsesFallback(false);
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
          const { data } = await fetchTradingDetails(session.initData, abortController.signal);
          setTradingOpenOrders(data.positions.length);
          setScreenState("ready");
          return;
        }

        if (route === "faq") {
          const { data } = await fetchFaq(session.initData, abortController.signal);
          setFaqEntries(data.items.map((entry) => ({ id: entry.id, title: entry.q, body: entry.a })));
          setScreenState(data.items.length === 0 ? "empty" : "ready");
        }
      } catch {
        if (!abortController.signal.aborted) {
          if (route === "dashboard") {
            setDashboardData(DASHBOARD_MOCK_FALLBACK);
            setDashboardUsesFallback(true);
            setScreenState("ready");
            return;
          }
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

  const navigateMoneyFilter = React.useCallback(
    (filter: "deposit" | "withdraw" | "referral") => {
      if (isBusy) return;
      setMoneyFilter(filter);
      const nextUrl = `${moneyFilterToPath(filter)}${window.location.search}`;
      window.history.replaceState({ route: "money" }, "", nextUrl);
      setRoute("money");
    },
    [isBusy]
  );

  const greenHeader = isGreenHeaderRoute(route);
  const activeBottomTab = getBottomTabRoute(route);
  const moneyRouteVariant =
    moneyFilter === "referral" ? "Referral" : moneyFilter === "withdraw" ? "Withdraw" : "Deposit";
  const moneyRows = React.useMemo(
    () =>
      [
        {
          kind: "deposit" as const,
          title: "Replenishment",
          walletMask: "UQBw8....SGTF",
          dateTimeText: "31.12.2024 00:00",
          amount: "+42.10 USDT",
          fee: "10.00 USDT",
          tone: "in" as const,
        },
        {
          kind: "referral" as const,
          title: "Referral reward",
          walletMask: "TG referral",
          dateTimeText: "30.12.2024 09:10",
          amount: "+18.00 USDT",
          fee: null,
          tone: "in" as const,
        },
        {
          kind: "withdraw" as const,
          title: "Withdrawal",
          walletMask: "TQx4d....91AF",
          dateTimeText: "29.12.2024 12:05",
          amount: "−600.00 USDT",
          fee: "1.20 USDT",
          tone: "pending" as const,
        },
        {
          kind: "withdraw" as const,
          title: "Withdrawal",
          walletMask: "TQx4d....91AF",
          dateTimeText: "28.12.2024 16:47",
          amount: "−120.00 USDT",
          fee: "0.24 USDT",
          tone: "out" as const,
        },
        {
          kind: "deposit" as const,
          title: "Replenishment",
          walletMask: "UQBw8....SGTF",
          dateTimeText: "27.12.2024 11:05",
          amount: "+200.00 USDT",
          fee: null,
          tone: "in" as const,
        },
      ] as const,
    []
  );
  const filteredMoneyRows = React.useMemo(() => {
    return moneyRows.filter((row) => row.kind === moneyFilter);
  }, [moneyFilter, moneyRows]);

  const handleTopUpContinue = React.useCallback(async () => {
    if (!session || isBusy) return;
    setActionState("submitting");
    setActionMessage(null);
    try {
      const { data } = await createTopUp(session.initData, DEFAULT_ACTION_AMOUNT_MINOR);
      if (data.status.toLowerCase() === "failed") {
        setActionMessage("Payment was not detected yet. Please complete transfer and tap Paid again.");
        return;
      }
      try {
        window.sessionStorage.setItem(
          postNavBannerStorageKey,
          "Top up request accepted. Balance update may take a moment."
        );
      } catch {
        /* session storage may be unavailable */
      }
      navigate("dashboard");
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
    const compactAddress = withdrawAddress.trim();
    const amountMinor = parseAmountMinor(withdrawAmount);
    const feeMinor = amountMinor == null ? 0 : Math.ceil((amountMinor * WITHDRAW_FEE_BPS) / 10000);
    const availableMinor = moneyData?.available_minor ?? 0;
    if (!isBasicTronAddress(compactAddress)) {
      setActionMessage("Enter a valid TRON (TRC20) address.");
      return;
    }
    if (amountMinor == null) {
      setActionMessage("Enter a valid withdrawal amount greater than 0.");
      return;
    }
    if (amountMinor < MIN_WITHDRAW_AMOUNT_MINOR) {
      setActionMessage(`Minimum withdrawal amount is ${formatMinor(MIN_WITHDRAW_AMOUNT_MINOR)} USDT.`);
      return;
    }
    if (amountMinor + feeMinor > availableMinor) {
      setActionMessage("Amount exceeds available balance after fee.");
      return;
    }
    setActionState("submitting");
    setActionMessage(null);
    try {
      const { data, traceId } = await createWithdraw(session.initData, amountMinor);
      if (data.status.toLowerCase() === "failed") {
        setActionMessage("Withdrawal request was rejected. Please verify data and try again.");
        return;
      }
      setPendingAction({
        actionId: data.request_id,
        kind: "withdraw",
        amountMinor,
        feeMinor,
        status: data.status,
        traceId,
        recipientLabel: `TRC20 · wallet ending …${compactAddress.slice(-4).toUpperCase()}`,
        recipientAddress: compactAddress,
      });
      navigate("confirm");
    } catch (error) {
      setActionMessage(
        error instanceof ApiError ? error.message : "Unable to create withdraw request right now."
      );
    } finally {
      setActionState("idle");
    }
  }, [isBusy, moneyData?.available_minor, navigate, session, withdrawAddress, withdrawAmount]);

  const handleConfirmSend = React.useCallback(async () => {
    if (!session || !pendingAction || isBusy || confirmStep !== "review") return;
    setConfirmStep("submitting");
    setActionMessage(null);
    try {
      const { data, traceId } = await confirmAction(session.initData, pendingAction.actionId);
      if (data.status.toLowerCase() === "failed") {
        setConfirmStep("review");
        setActionMessage("Confirmation failed. Please retry in a moment.");
        return;
      }
      try {
        window.sessionStorage.setItem(
          doneReceiptStorageKey,
          JSON.stringify({
            traceId,
            amountMinor: pendingAction.amountMinor,
            feeMinor: pendingAction.feeMinor,
            recipientAddress: pendingAction.recipientAddress ?? "",
          } satisfies DoneReceipt)
        );
      } catch {
        /* session storage may be unavailable */
      }
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
      setWithdrawAmount("");
      setPendingAction(null);
      navigate("done");
    } catch (error) {
      setConfirmStep("review");
      setActionMessage(
        error instanceof ApiError ? error.message : "Unable to confirm this action right now."
      );
    }
  }, [confirmStep, isBusy, pendingAction, session]);

  const dashboardSnapshot = dashboardData ?? DASHBOARD_MOCK_FALLBACK;
  const dashboardHasBalance = dashboardSnapshot.wallet_minor > 0;
  const dashboardMode = dashboardHasBalance ? "funded" : "empty";
  const dashboardBalance = formatMinor(dashboardSnapshot.wallet_minor);
  const dashboardGraphTitle = dashboardMode === "funded" ? "Balance history" : "% Performance (3M)";
  const dashboardGraphLegendPrimary =
    dashboardMode === "funded" ? "Wallet balance" : FIGMA_VISUAL_STUBS.performanceLegendPrimary;
  const dashboardGraphLegendSecondary =
    dashboardMode === "funded" ? "Net cashflow" : "Trade journal";
  const dashboardPriceLine = dashboardMode === "funded" ? FIGMA_VISUAL_STUBS.tradingPriceLine : "Awaiting top up";
  const dashboardChartPeriod = dashboardHasBalance ? "30D" : FIGMA_VISUAL_STUBS.performancePeriod;
  const dashboardYAxisLabels = dashboardHasBalance
    ? dashboardFundedYAxisLabels(dashboardSnapshot.wallet_minor)
    : [...DASHBOARD_PERF_EMPTY_Y_AXIS];
  const dashboardXAxisLabels = dashboardHasBalance ? [...DASHBOARD_PERF_FUNDED_X_AXIS] : [...DASHBOARD_PERF_EMPTY_X_AXIS];
  const moneyAvailable = moneyData ? formatMinor(moneyData.available_minor) : "0.00";
  const moneyLockedDisplay = moneyData ? formatMinor(moneyData.locked_minor) : "0.00";
  const showMoneyLocked = Boolean(moneyData && moneyData.locked_minor > 0);
  const withdrawAvailable = moneyData ? formatMinor(moneyData.available_minor) : "0.00";
  const confirmAmount = pendingAction ? formatMinor(pendingAction.amountMinor) : formatMinor(DEFAULT_ACTION_AMOUNT_MINOR);
  const confirmFeeMinor =
    pendingAction?.feeMinor ??
    Math.ceil((Math.round(DEFAULT_ACTION_AMOUNT_MINOR) * WITHDRAW_FEE_BPS) / 10000);
  const confirmFeeAmount = formatMinor(confirmFeeMinor);
  const withdrawAmountMinor = parseAmountMinor(withdrawAmount);
  const withdrawFeeMinor =
    withdrawAmountMinor == null ? null : Math.ceil((withdrawAmountMinor * WITHDRAW_FEE_BPS) / 10000);
  const withdrawMaxMinor = moneyData ? Math.floor(moneyData.available_minor / (1 + WITHDRAW_FEE_BPS / 10000)) : 0;
  const withdrawValidationMessage =
    !withdrawAddress.trim() || !withdrawAmount.trim()
      ? null
      : !isBasicTronAddress(withdrawAddress)
        ? "TRON address format looks invalid."
        : withdrawAmountMinor == null
          ? "Amount must be numeric and greater than 0."
        : withdrawAmountMinor < MIN_WITHDRAW_AMOUNT_MINOR
          ? `Minimum withdrawal amount is ${formatMinor(MIN_WITHDRAW_AMOUNT_MINOR)} USDT.`
          : withdrawAmountMinor + (withdrawFeeMinor ?? 0) > (moneyData?.available_minor ?? 0)
            ? "Amount + fee exceeds available balance."
            : null;
  const isWithdrawReady =
    Boolean(withdrawAddress.trim()) &&
    withdrawAmountMinor != null &&
    withdrawAmountMinor >= MIN_WITHDRAW_AMOUNT_MINOR &&
    isBasicTronAddress(withdrawAddress) &&
    withdrawAmountMinor + (withdrawFeeMinor ?? 0) <= (moneyData?.available_minor ?? 0);
  const confirmTrace = pendingAction?.traceId ?? session?.traceId ?? "trace_unavailable";
  const tradingStats = React.useMemo(() => {
    const sourceLabel = dashboardHasBalance ? "Algorithm system data" : "Trade journal data";
    const byRange: Record<TradingRange, { total: number; positive: number; negative: number; result: string }> =
      dashboardHasBalance
        ? {
            "24h": { total: 8, positive: 6, negative: 2, result: "+1.2%" },
            "7d": { total: 29, positive: 21, negative: 8, result: "+4.6%" },
            "1m": { total: 94, positive: 69, negative: 25, result: "+12.1%" },
            "3m": { total: 254, positive: 184, negative: 70, result: "+28.4%" },
          }
        : {
            "24h": { total: 5, positive: 3, negative: 2, result: "+0.7%" },
            "7d": { total: 17, positive: 11, negative: 6, result: "+2.9%" },
            "1m": { total: 68, positive: 44, negative: 24, result: "+9.3%" },
            "3m": { total: 201, positive: 132, negative: 69, result: "+24.8%" },
          };
    return { sourceLabel, ...byRange[tradingRange] };
  }, [dashboardHasBalance, tradingRange]);
  const tradingTotalLabel = tradingOpenOrders > 0 ? String(tradingOpenOrders) : String(tradingStats.total);

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
    <main
      className={`app${isDashboard ? " app--dashboard-merge" : ""}`}
      aria-label={isDashboard ? "Home" : undefined}
    >
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
          {!isDashboard ? <h1 className="top-title">{routeTitles[route]}</h1> : null}
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
                  aria-label="Open notifications"
                  onClick={() => navigate("notifications")}
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
                  aria-label="Open settings"
                  onClick={() => navigate("settings")}
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
              <div className="dashboard-balance-stack">
                <p className="dashboard-balance-value">
                  <span className="dashboard-balance-amount">{dashboardBalance}</span>
                  <span className="dashboard-balance-currency">USDT</span>
                </p>
                <div className="dashboard-balance-rule" aria-hidden="true" />
                <p className="dashboard-referral-amount">
                  <span className="dashboard-referral-figure">{FIGMA_VISUAL_STUBS.referralAmount}</span>
                  <span className="dashboard-referral-unit">USDT</span>
                </p>
                <p className="dashboard-referral-kicker">Received by referrals</p>
              </div>
              <div className="dashboard-actions">
                <button
                  className="dashboard-pill dashboard-pill-main"
                  onClick={() => navigate("topup")}
                  disabled={isBusy}
                >
                  <svg className="dashboard-pill-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <path
                      d="M12 5v14M5 12h14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Top up
                </button>
                <button
                  className="dashboard-pill dashboard-pill-muted"
                  onClick={() => navigate("withdraw")}
                  disabled={isBusy}
                >
                  <svg className="dashboard-pill-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <path
                      d="M12 5v10M8 15l4 4 4-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Withdraw
                </button>
              </div>
            </div>
            <button
              className="dashboard-details-btn"
              onClick={() => navigate("money")}
              disabled={isBusy}
              aria-label="Money details"
            >
              <svg className="dashboard-details-icon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                <path
                  d="M5 7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 10h10M9 14h4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
              Details
            </button>
          </div>
        ) : null}
        <StateView
          state={screenState}
          onRetry={retry}
          messages={
            route === "dashboard"
              ? {
                  loading: "Loading home data...",
                  empty: "Home is empty. Top up to start tracking activity.",
                  error: "Home is temporarily unavailable.",
                }
              : route === "money"
                ? {
                    loading: "Loading money operations...",
                    empty: "No money operations for this filter yet.",
                    error: "Detail Balance is temporarily unavailable.",
                  }
                : route === "trading"
                  ? {
                      loading: "Loading trading metrics...",
                      empty: "Trading metrics are empty for this period.",
                      error: "Detail Bot is temporarily unavailable.",
                    }
                  : route === "faq"
                    ? {
                        loading: "Loading FAQ entries...",
                        empty: "No FAQ entries published yet.",
                        error: "FAQ is temporarily unavailable.",
                      }
                    : undefined
          }
        >
          {isDashboard ? (
            <div className="dashboard-body">
              {dashboardUsesFallback ? (
                <p className="dashboard-inline-alert" role="status">
                  Live dashboard data is unavailable. Showing fallback preview values.
                </p>
              ) : null}
              <section className="dashboard-block dashboard-block--graphic" aria-label="Performance chart">
                <div className="dashboard-perf">
                  <div className="dashboard-perf-head">
                    <span className="dashboard-perf-title">{dashboardGraphTitle}</span>
                    <span className="dashboard-perf-period">{dashboardChartPeriod}</span>
                  </div>
                  <div
                    className={`dashboard-perf-chart${dashboardHasBalance ? "" : " dashboard-perf-chart--figma-performance"}`}
                  >
                    {dashboardHasBalance ? (
                      <>
                        <div className="dashboard-perf-y-axis">
                          {dashboardYAxisLabels.map((label, idx) => (
                            <span key={`y-${idx}`}>{label}</span>
                          ))}
                        </div>
                        <div className="dashboard-perf-plot dashboard-perf-plot--funded">
                          <DashboardHomeBalanceChart funded />
                        </div>
                      </>
                    ) : (
                      <div className="dashboard-perf-plot dashboard-perf-plot--figma-performance">
                        <DashboardFigmaPerformanceGraphic />
                        <div className="dashboard-perf-empty dashboard-perf-empty--on-figma">
                          <p className="dashboard-perf-empty-title">Balance is 0 USDT</p>
                          <p className="dashboard-perf-empty-body">
                            Top up to unlock balance history and cashflow tracking.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="dashboard-perf-x-axis" aria-hidden="true">
                    {dashboardXAxisLabels.map((label, idx) => (
                      <span key={`x-${idx}`}>{label}</span>
                    ))}
                  </div>
                  <div className="dashboard-perf-legend">
                    <span className="dashboard-perf-legend-item">
                      <span className="dashboard-perf-swatch dashboard-perf-swatch--primary" />
                      {dashboardGraphLegendPrimary}
                    </span>
                    <span className="dashboard-perf-legend-item">
                      <span className="dashboard-perf-swatch dashboard-perf-swatch--muted" />
                      {dashboardGraphLegendSecondary}
                    </span>
                  </div>
                </div>
              </section>
              <section
                className="dashboard-block dashboard-block--status"
                aria-label="Bot status and market price"
              >
                <div className={`dashboard-status-card${dashboardHasBalance ? "" : " dashboard-status-card--muted"}`}>
                  <div className="dashboard-status">
                    <div className="dashboard-status-row">
                      <span className="dashboard-status-kicker">Bot status</span>
                      <span
                        className={`dashboard-status-value${dashboardHasBalance ? " dashboard-status-value--live" : ""}`}
                      >
                        <span className="dashboard-status-dot" aria-hidden="true" />
                        {dashboardHasBalance ? "Active" : "Awaiting funds"}
                      </span>
                    </div>
                    <div className="dashboard-status-row">
                      <span className="dashboard-status-kicker">Actual price</span>
                      <span className="dashboard-price-figure">
                        <strong className="dashboard-price-strong">{dashboardPriceLine}</strong>
                        <span className="dashboard-price-unit">USDT/BTC</span>
                      </span>
                    </div>
                  </div>
                </div>
              </section>
              <div className="dashboard-block dashboard-block--cta" role="group" aria-label="Home actions">
                <div className="dashboard-cta-stack">
                  <button
                    className="dashboard-details-btn dashboard-details-btn--bot"
                    onClick={() => navigate("trading")}
                    disabled={isBusy}
                    aria-label="Trading details"
                  >
                    <svg className="dashboard-details-icon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                      <path
                        d="M4 19h16M6 16V8m6 8V5m6 11v-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Details
                  </button>
                  <div className="dashboard-support-row">
                    <button
                      className="dashboard-secondary-btn dashboard-secondary-btn--social"
                      onClick={() => navigate("social")}
                      disabled={isBusy}
                    >
                      <span className="dashboard-action-main">
                        <span className="dashboard-action-icon" aria-hidden="true">
                          <svg
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 10v4a2 2 0 0 0 2 2h2l4 3v-14l-4 3H5a2 2 0 0 0-2 2z" />
                            <path d="M16 8a4 4 0 0 1 0 8" />
                          </svg>
                        </span>
                        Social Media
                      </span>
                    </button>
                    <button
                      className="dashboard-secondary-btn dashboard-secondary-btn--support"
                      onClick={() => navigate("support")}
                      disabled={isBusy}
                    >
                      <span className="dashboard-action-main">
                        <span className="dashboard-action-icon" aria-hidden="true">
                          <svg
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                          </svg>
                        </span>
                        Support
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`screen-template template-${route}`}>
              {route === "trading" && (
                <header className="internal-hero internal-hero-trading">
                  <h2 className="internal-hero-title">{routeTitles.trading}</h2>
                  <p className="internal-hero-label">Detail Bot statistics for the period:</p>
                </header>
              )}
              {route === "faq" && (
                <header className="internal-hero internal-hero-faq">
                  <h2 className="internal-hero-title">{routeTitles.faq}</h2>
                  <p className="internal-hero-label">{screenData.faq.description}</p>
                </header>
              )}
              {route === "withdraw" && (
                <header className="internal-hero internal-hero-withdraw">
                  <h2 className="internal-hero-title">{screenData.withdraw.title}</h2>
                  <p className="internal-hero-label">{screenData.withdraw.description}</p>
                </header>
              )}
              {route === "confirm" && (
                <header className="internal-hero internal-hero-confirm">
                  <h2 className="internal-hero-title">{screenData.confirm.title}</h2>
                  <p className="internal-hero-label">
                    *Fee is charged from the remaining balance. A 10% withdrawal fee applies.
                  </p>
                </header>
              )}
              {route === "money" ? (
                <div className="money-page">
                  <header className="internal-hero internal-hero-money">
                    <h2 className="internal-hero-title">
                      {routeTitles.money} | {moneyRouteVariant}
                    </h2>
                    <p className="internal-hero-label">{screenData.money.description}</p>
                  </header>
                  <section className="money-current-balance" aria-label="Current balance">
                    <p className="money-current-kicker">Current balance</p>
                    <p className="money-current-value">
                      {moneyAvailable}
                      <span className="money-current-unit">USDT</span>
                    </p>
                    <p className="money-current-wallet">TQBw8SGT......6I48HPv4iB</p>
                    <div className="money-quick-actions">
                      <button type="button" className="money-quick-btn money-quick-btn--topup" onClick={() => navigate("topup")} disabled={isBusy}>
                        <svg className="action-btn-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                          <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span className="money-quick-btn-label">Top up</span>
                        <span className="money-quick-btn-chevron" aria-hidden="true">
                          ›
                        </span>
                      </button>
                      <button type="button" className="money-quick-btn money-quick-btn--withdraw" onClick={() => navigate("withdraw")} disabled={isBusy}>
                        <svg className="action-btn-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                          <path
                            d="M12 5v10M8 11l4-4 4 4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="money-quick-btn-label">Withdraw</span>
                        <span className="money-quick-btn-chevron" aria-hidden="true">
                          ›
                        </span>
                      </button>
                    </div>
                    {showMoneyLocked ? (
                      <p className="money-current-locked">
                        Reserved: {moneyLockedDisplay} <span>USDT</span>
                      </p>
                    ) : null}
                  </section>
                  <div className="money-activity-head">
                    <h3 className="money-activity-title" id="money-activity-heading">
                      Actions history
                    </h3>
                  </div>
                  <div className="money-summary-cards" aria-label="Balance summary — tap a category to view its history">
                    <button
                      type="button"
                      className={`money-summary-card${moneyFilter === "deposit" ? " money-summary-card--active" : ""}`}
                      aria-pressed={moneyFilter === "deposit"}
                      disabled={isBusy}
                      onClick={() => navigateMoneyFilter("deposit")}
                    >
                      <span className="money-summary-title">Deposit</span>
                      <span className="money-summary-label">Total deposited amount:</span>
                      <span className="money-summary-value">
                        5237.00 <span>USDT</span>
                      </span>
                      <span className="money-summary-label">Number of deposits made:</span>
                      <span className="money-summary-meta">5 TIMES</span>
                    </button>
                    <button
                      type="button"
                      className={`money-summary-card${moneyFilter === "withdraw" ? " money-summary-card--active" : ""}`}
                      aria-pressed={moneyFilter === "withdraw"}
                      disabled={isBusy}
                      onClick={() => navigateMoneyFilter("withdraw")}
                    >
                      <span className="money-summary-title">Withdraw</span>
                      <span className="money-summary-label">Total withdrawal amount:</span>
                      <span className="money-summary-value">
                        4250.98 <span>USDT</span>
                      </span>
                      <span className="money-summary-label">Number of withdrawals:</span>
                      <span className="money-summary-meta">4 TIMES</span>
                    </button>
                    <button
                      type="button"
                      className={`money-summary-card${moneyFilter === "referral" ? " money-summary-card--active" : ""}`}
                      aria-pressed={moneyFilter === "referral"}
                      disabled={isBusy}
                      onClick={() => navigateMoneyFilter("referral")}
                    >
                      <span className="money-summary-title">Referral</span>
                      <span className="money-summary-label">Bonuses received from:</span>
                      <span className="money-summary-value">
                        603.22 <span>USDT</span>
                      </span>
                      <span className="money-summary-label">Total number of invited users:</span>
                      <span className="money-summary-meta">8 PEOPLE</span>
                    </button>
                  </div>
                  <div
                    className="money-history-feed"
                    id="money-history-feed"
                    role="region"
                    aria-labelledby="money-activity-heading"
                  >
                    {filteredMoneyRows.length > 0 ? (
                      filteredMoneyRows.map((row, idx) => (
                        <article
                          key={`${row.kind}-${row.dateTimeText}-${idx}`}
                          className={`money-feed-row money-feed-row--${row.tone}`}
                          role="listitem"
                        >
                          <div className="money-feed-icon" aria-hidden="true" />
                          <div className="money-feed-main">
                            <p className="money-feed-title">{row.title}</p>
                            <p className="money-feed-meta">{row.fee ? "Commission" : "No commission"}</p>
                            <p className="money-feed-wallet">{row.walletMask}</p>
                          </div>
                          <div className="money-feed-side">
                            <p className="money-feed-amount">{row.amount}</p>
                            {row.fee ? <p className="money-feed-fee">-{row.fee.replace("-", "")}</p> : null}
                            <p className="money-feed-date">{row.dateTimeText}</p>
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className="money-feed-empty" role="status">
                        <p className="money-feed-empty-title">No operations in this section yet</p>
                        <p className="money-feed-empty-body">Pick another category above or wait for new transactions.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {route === "trading" && (
                <>
                  <section className="trading-hero" aria-label="Detail Bot status">
                    <div className="trading-hero-main">
                      <p className="trading-hero-label">Bot status</p>
                      <p className="trading-hero-value">
                        <span className="trading-hero-dot" aria-hidden="true" /> Active
                      </p>
                    </div>
                    <div className="trading-hero-meta-block">
                      <p className="trading-hero-meta-label">Actual price</p>
                      <p className="trading-hero-meta-value">
                        {FIGMA_VISUAL_STUBS.tradingPriceLine} <span className="trading-hero-meta-unit">USDT/BTC</span>
                      </p>
                    </div>
                    <div className="trading-action-row">
                      <button
                        type="button"
                        className="trading-action-btn trading-action-btn--start"
                        onClick={() => setActionMessage("Bot is already active.")}
                        disabled={isBusy}
                      >
                        <span className="trading-action-main">
                          <svg className="action-btn-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                            <path
                              d="M5 19l3.5-3.5 3 3L19 11M15 11h4v4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.9"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span>Start</span>
                        </span>
                        <span className="trading-action-chevron" aria-hidden="true">
                          ›
                        </span>
                      </button>
                      <button
                        type="button"
                        className="trading-action-btn trading-action-btn--stop"
                        onClick={() => setActionMessage("Stop action is not enabled in this wave.")}
                        disabled={isBusy}
                      >
                        <span className="trading-action-main">
                          <svg className="action-btn-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                            <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                          <span>Stop</span>
                        </span>
                        <span className="trading-action-chevron" aria-hidden="true">
                          ›
                        </span>
                      </button>
                    </div>
                  </section>
                  <div className="trading-stack">
                    <div className="trading-stack-head">
                      <p className="trading-section-title">Detail Bot statistics for the period:</p>
                      <div className="stats-tabs" role="tablist" aria-label="Period">
                        {(["24h", "7d", "1m", "3m"] as const).map((label) => (
                          <button
                            key={label}
                            type="button"
                            role="tab"
                            aria-selected={tradingRange === label}
                            className={tradingRange === label ? "stat-pill stat-pill-active" : "stat-pill"}
                            disabled={isBusy}
                            onClick={() => setTradingRange(label)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="trading-graph" aria-hidden="true">
                      <div className="trading-graph-y-axis">
                        <span>+8%</span>
                        <span>+4%</span>
                        <span>0%</span>
                        <span>-4%</span>
                      </div>
                      <div className="trading-graph-line" />
                      <div className="trading-graph-points">
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                      </div>
                      <div className="trading-graph-legend">
                        <span className="trading-graph-legend-item">
                          <span className="trading-graph-legend-dot trading-graph-legend-dot--bot" />
                          Bot yield
                        </span>
                        <span className="trading-graph-legend-item">
                          <span className="trading-graph-legend-dot trading-graph-legend-dot--market" />
                          Market baseline
                        </span>
                      </div>
                      <div className="trading-graph-x-axis">
                        <span>Week 1</span>
                        <span>Week 2</span>
                        <span>Week 3</span>
                        <span>Week 4</span>
                      </div>
                    </div>
                    <div className="trading-kpi-row" aria-label="Trading summary">
                      <article className="trading-stats-card">
                        <div className="trading-stats-row">
                          <span className="trading-stats-icon trading-stats-icon--total" aria-hidden="true" />
                          <p className="trading-stats-label">Total deals:</p>
                          <p className="trading-stats-value">{tradingTotalLabel}</p>
                        </div>
                        <div className="trading-stats-row">
                          <span className="trading-stats-icon trading-stats-icon--up" aria-hidden="true" />
                          <p className="trading-stats-label">Successful:</p>
                          <p className="trading-stats-value">{tradingStats.positive}</p>
                        </div>
                        <div className="trading-stats-row">
                          <span className="trading-stats-icon trading-stats-icon--down" aria-hidden="true" />
                          <p className="trading-stats-label">Unsuccessful:</p>
                          <p className="trading-stats-value">{tradingStats.negative}</p>
                        </div>
                        <div className="trading-stats-row">
                          <span className="trading-stats-icon trading-stats-icon--result" aria-hidden="true" />
                          <p className="trading-stats-label">Percentage of profit:</p>
                          <p className="trading-stats-value trading-stats-value--result">{tradingStats.result}</p>
                        </div>
                      </article>
                    </div>
                    <p className="trading-list-kicker">trading:</p>
                    {[
                      {
                        tone: "success",
                        title: "Prediction was successful!",
                        priceLabel: "Price is DOWN",
                        amountLabel: "to 69569.32",
                        resultLabel: "Profit of trade is:",
                        resultValue: "0.13 %",
                      },
                      {
                        tone: "danger",
                        title: "Prediction was unsuccessful!",
                        priceLabel: "Price is UP",
                        amountLabel: "to 69569.32",
                        resultLabel: "Loss of trade is:",
                        resultValue: "0.16 %",
                      },
                      {
                        tone: "new",
                        title: "Opening new trade...",
                        priceLabel: "Actual price:",
                        amountLabel: "69 425.22",
                        resultLabel: "Source:",
                        resultValue: tradingStats.sourceLabel,
                      },
                    ].map((item) => (
                      <article key={item.title} className={`metric-card trading-list-row trading-list-row--${item.tone}`}>
                        <div className="trading-list-line">
                          <span className="trading-list-dot" aria-hidden="true" />
                          <p className="trading-list-title">{item.title}</p>
                        </div>
                        <div className="trading-list-line">
                          <span className="trading-list-arrow" aria-hidden="true" />
                          <p className="trading-list-body">{item.priceLabel}</p>
                          <p className="trading-list-amount">{item.amountLabel}</p>
                          <p className="trading-list-unit">USDT/BTC</p>
                        </div>
                        <div className="trading-list-line">
                          <span className="trading-list-wave" aria-hidden="true" />
                          <p className="trading-list-body">{item.resultLabel}</p>
                          <p className="trading-list-result">{item.resultValue}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}

              {route === "faq" && (
                <div className="faq-list" role="list">
                  <article className="faq-support-card">
                    <p className="faq-support-title">Need more help?</p>
                    <div className="faq-support-actions">
                      <button type="button" className="faq-support-btn" onClick={() => navigate("support")} disabled={isBusy}>
                        Support
                      </button>
                      <button type="button" className="faq-support-btn faq-support-btn--alt" onClick={() => navigate("social")} disabled={isBusy}>
                        Social Media
                      </button>
                    </div>
                  </article>
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

              {route === "notifications" && (
                <div className="notifications-page">
                  <header className="internal-hero internal-hero-notifications">
                    <h2 className="internal-hero-title">{screenData.notifications.title}</h2>
                    <p className="internal-hero-label">{screenData.notifications.description}</p>
                  </header>
                  <div className="notifications-list" role="list">
                    <p className="notification-group-title">New</p>
                    {[
                      ["Top up confirmed", "A 42.10 USDT deposit was credited.", "Today · 14:32"],
                      ["Withdrawal queued", "Your withdrawal is being processed.", "Today · 12:05"],
                      ["Bot status update", "Detail Bot switched to active mode.", "Today · 09:42"],
                    ].map(([title, body, meta], idx) => (
                      <article
                        key={`${title}-${idx}`}
                        className={`notification-row${idx === 0 ? " notification-row--new" : ""}`}
                        role="listitem"
                      >
                        <p className="notification-title">{title}</p>
                        <p className="notification-body">{body}</p>
                        <p className="notification-meta">{meta}</p>
                      </article>
                    ))}
                    <div className="notification-divider" aria-hidden="true" />
                    <p className="notification-group-title">Earlier</p>
                    {[
                      ["Referral bonus", "A referral bonus operation was added.", "Yesterday · 18:10"],
                      ["Status note", "No additional actions required right now.", "Yesterday · 11:20"],
                    ].map(([title, body, meta], idx) => (
                      <article key={`${title}-${idx}`} className="notification-row" role="listitem">
                        <p className="notification-title">{title}</p>
                        <p className="notification-body">{body}</p>
                        <p className="notification-meta">{meta}</p>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {route === "settings" && (
                <div className="settings-page">
                  <header className="internal-hero internal-hero-settings">
                    <h2 className="internal-hero-title">{screenData.settings.title}</h2>
                    <p className="internal-hero-label">{screenData.settings.description}</p>
                    {hasPendingExternalLinks && (
                      <p className="settings-pending-note">External production links will be finalized at release step.</p>
                    )}
                  </header>
                  <div className="settings-stack">
                    <article className="metric-card settings-card settings-links">
                      <p className="settings-group-title">Language</p>
                      <button type="button" className="settings-link-btn">
                        English
                      </button>
                      <button type="button" className="settings-link-btn">
                        Spanish
                      </button>
                      <div className="settings-divider" aria-hidden="true" />
                      <p className="settings-group-title">Preferences</p>
                      <button type="button" className="settings-link-btn">
                        Push: Enabled
                      </button>
                      <button type="button" className="settings-link-btn">
                        Vibration: Enabled
                      </button>
                      <button type="button" className="settings-link-btn" onClick={() => navigate("faq")} disabled={isBusy}>
                        <span className="settings-link-main">
                          <span className="settings-link-icon" aria-hidden="true">
                            i
                          </span>
                          FAQ
                        </span>
                        <span className="settings-link-chevron" aria-hidden="true">
                          ›
                        </span>
                      </button>
                      <button
                        type="button"
                        className="settings-link-btn"
                        onClick={() => openExternalLink(DASHBOARD_EXTERNAL_LINKS.supportUrl, "Support")}
                        disabled={isBusy}
                      >
                        <span className="settings-link-main">
                          <span className="settings-link-icon" aria-hidden="true">
                            ?
                          </span>
                          Support
                        </span>
                        <span className="settings-link-chevron" aria-hidden="true">
                          ›
                        </span>
                      </button>
                      <button
                        type="button"
                        className="settings-link-btn"
                        onClick={() => navigate("support")}
                        disabled={isBusy}
                      >
                        <span className="settings-link-main">
                          <span className="settings-link-icon" aria-hidden="true">
                            S
                          </span>
                          Open Support
                        </span>
                        <span className="settings-link-chevron" aria-hidden="true">
                          ›
                        </span>
                      </button>
                      <button
                        type="button"
                        className="settings-link-btn"
                        onClick={() => navigate("social")}
                        disabled={isBusy}
                      >
                        <span className="settings-link-main">
                          <span className="settings-link-icon" aria-hidden="true">
                            C
                          </span>
                          Social Media
                        </span>
                        <span className="settings-link-chevron" aria-hidden="true">
                          ›
                        </span>
                      </button>
                      <button
                        type="button"
                        className="settings-link-btn"
                        onClick={() => openExternalLink(DASHBOARD_EXTERNAL_LINKS.referralUrl, "Referral")}
                        disabled={isBusy}
                      >
                        <span className="settings-link-main">
                          <span className="settings-link-icon" aria-hidden="true">
                            R
                          </span>
                          Referral link
                        </span>
                        <span className="settings-link-chevron" aria-hidden="true">
                          ›
                        </span>
                      </button>
                      <div className="settings-divider" aria-hidden="true" />
                      <p className="settings-group-title">Account</p>
                      <button type="button" className="settings-link-btn" onClick={() => navigate("seed")} disabled={isBusy}>
                        <span className="settings-link-main">
                          <span className="settings-link-icon" aria-hidden="true">
                            #
                          </span>
                          Seed
                        </span>
                        <span className="settings-link-chevron" aria-hidden="true">
                          ›
                        </span>
                      </button>
                      <button
                        type="button"
                        className="settings-link-btn"
                        onClick={() => navigate("agreement")}
                        disabled={isBusy}
                      >
                        <span className="settings-link-main">
                          <span className="settings-link-icon" aria-hidden="true">
                            U
                          </span>
                          User Agreement
                        </span>
                        <span className="settings-link-chevron" aria-hidden="true">
                          ›
                        </span>
                      </button>
                    </article>
                  </div>
                </div>
              )}

              {route === "support" && (
                <div className="settings-page">
                  <header className="internal-hero internal-hero-settings">
                    <h2 className="internal-hero-title">{screenData.support.title}</h2>
                    <p className="internal-hero-label">{screenData.support.description}</p>
                    {hasPendingExternalLinks && (
                      <p className="settings-pending-note">External production links will be finalized at release step.</p>
                    )}
                  </header>
                  <div className="settings-stack">
                    <article className="metric-card settings-card settings-links support-list-card">
                      <div className="settings-context-note">
                        <p className="settings-context-title">Response time</p>
                        <p className="settings-context-body">Average support reply within 15-30 minutes during active hours.</p>
                      </div>
                      <p className="settings-group-title">Contacts</p>
                      <button
                        type="button"
                        className="settings-link-btn"
                        onClick={() => openExternalLink(DASHBOARD_EXTERNAL_LINKS.supportUrl, "Support")}
                        disabled={isBusy}
                      >
                        <span className="settings-link-main">
                          <span className="settings-link-icon" aria-hidden="true">
                            ?
                          </span>
                          Telegram Support
                        </span>
                        <span className="settings-link-chevron" aria-hidden="true">
                          ›
                        </span>
                      </button>
                      <button type="button" className="settings-link-btn" onClick={() => navigate("faq")} disabled={isBusy}>
                        <span className="settings-link-main">
                          <span className="settings-link-icon" aria-hidden="true">
                            i
                          </span>
                          FAQ
                        </span>
                        <span className="settings-link-chevron" aria-hidden="true">
                          ›
                        </span>
                      </button>
                      <button type="button" className="settings-link-btn" onClick={() => navigate("notifications")} disabled={isBusy}>
                        <span className="settings-link-main">
                          <span className="settings-link-icon" aria-hidden="true">
                            !
                          </span>
                          Notification
                        </span>
                        <span className="settings-link-chevron" aria-hidden="true">
                          ›
                        </span>
                      </button>
                      <div className="settings-divider" aria-hidden="true" />
                      <p className="settings-group-title">Navigation</p>
                      <button type="button" className="settings-link-btn" onClick={() => navigate("settings")} disabled={isBusy}>
                        <span className="settings-link-main">
                          <span className="settings-link-icon" aria-hidden="true">
                            *
                          </span>
                          Settings
                        </span>
                        <span className="settings-link-chevron" aria-hidden="true">
                          ›
                        </span>
                      </button>
                      <button type="button" className="settings-link-btn" onClick={() => navigate("dashboard")} disabled={isBusy}>
                        <span className="settings-link-main">
                          <span className="settings-link-icon" aria-hidden="true">
                            H
                          </span>
                          Home
                        </span>
                        <span className="settings-link-chevron" aria-hidden="true">
                          ›
                        </span>
                      </button>
                    </article>
                    <article className="metric-card support-info-card">
                      <p className="support-info-title">Before contacting support</p>
                      <ul className="support-info-list">
                        <li>Prepare transaction hash, amount and wallet address.</li>
                        <li>For top up issues, attach payment proof screenshot.</li>
                        <li>Use FAQ first for common onboarding questions.</li>
                      </ul>
                    </article>
                  </div>
                </div>
              )}

              {route === "social" && (
                <div className="settings-page">
                  <header className="internal-hero internal-hero-settings">
                    <h2 className="internal-hero-title">{screenData.social.title}</h2>
                    <p className="internal-hero-label">{screenData.social.description}</p>
                    {hasPendingExternalLinks && (
                      <p className="settings-pending-note">External production links will be finalized at release step.</p>
                    )}
                  </header>
                  <div className="settings-stack">
                    <article className="metric-card settings-card settings-links social-list-card">
                      <div className="settings-context-note">
                        <p className="settings-context-title">Official community links</p>
                        <p className="settings-context-body">Follow updates, release notes and market announcements.</p>
                      </div>
                      <p className="settings-group-title">Channels</p>
                      <button
                        type="button"
                        className="settings-link-btn"
                        onClick={() => openExternalLink(DASHBOARD_EXTERNAL_LINKS.channelUrl, "Channel")}
                        disabled={isBusy}
                      >
                        <span className="settings-link-main">
                          <span className="settings-link-icon" aria-hidden="true">
                            C
                          </span>
                          Channel
                        </span>
                        <span className="settings-link-chevron" aria-hidden="true">
                          ›
                        </span>
                      </button>
                      <button
                        type="button"
                        className="settings-link-btn"
                        onClick={() => openExternalLink(DASHBOARD_EXTERNAL_LINKS.chatUrl, "Chat")}
                        disabled={isBusy}
                      >
                        <span className="settings-link-main">
                          <span className="settings-link-icon" aria-hidden="true">
                            @
                          </span>
                          Chat
                        </span>
                        <span className="settings-link-chevron" aria-hidden="true">
                          ›
                        </span>
                      </button>
                      <button
                        type="button"
                        className="settings-link-btn"
                        onClick={() => openExternalLink(DASHBOARD_EXTERNAL_LINKS.youtubeUrl, "Youtube")}
                        disabled={isBusy}
                      >
                        <span className="settings-link-main">
                          <span className="settings-link-icon" aria-hidden="true">
                            Y
                          </span>
                          Youtube
                        </span>
                        <span className="settings-link-chevron" aria-hidden="true">
                          ›
                        </span>
                      </button>
                      <div className="settings-divider" aria-hidden="true" />
                      <p className="settings-group-title">More</p>
                      <button type="button" className="settings-link-btn" onClick={() => navigate("support")} disabled={isBusy}>
                        <span className="settings-link-main">
                          <span className="settings-link-icon" aria-hidden="true">
                            ?
                          </span>
                          Support
                        </span>
                        <span className="settings-link-chevron" aria-hidden="true">
                          ›
                        </span>
                      </button>
                    </article>
                    <article className="metric-card social-guidelines-card">
                      <p className="support-info-title">Community guidelines</p>
                      <ul className="support-info-list">
                        <li>Use official channels only; avoid unknown direct messages.</li>
                        <li>Admins never request seed phrase or private keys.</li>
                        <li>Report suspicious links directly via Support.</li>
                      </ul>
                    </article>
                  </div>
                </div>
              )}

              {route === "seed" && (
                <div className="seed-page">
                  <header className="internal-hero internal-hero-seed">
                    <h2 className="internal-hero-title">{screenData.seed.title}</h2>
                    <p className="internal-hero-label">{screenData.seed.description}</p>
                  </header>
                  <article className="metric-card seed-card">
                    <ol className="seed-grid" aria-label="Recovery words">
                      {DEFAULT_SEED_WORDS.map((word, index) => (
                        <li key={word} className="seed-item">
                          <span className="seed-index">{index + 1}.</span>
                          <span className="seed-word">{word}</span>
                        </li>
                      ))}
                    </ol>
                    <button
                      type="button"
                      className="seed-copy-btn"
                      onClick={async () => navigator.clipboard.writeText(DEFAULT_SEED_WORDS.join(" "))}
                      disabled={isBusy}
                    >
                      Copy
                    </button>
                  </article>
                </div>
              )}

              {route === "agreement" && (
                <div className="agreement-page">
                  <header className="internal-hero internal-hero-agreement">
                    <h2 className="internal-hero-title">{screenData.agreement.title}</h2>
                    <p className="internal-hero-label">{screenData.agreement.description}</p>
                  </header>
                  <article className="metric-card agreement-card">
                    <p>
                      By using this mini app you agree that blockchain operations are final and account access is your
                      responsibility.
                    </p>
                    <p>Keep your recovery phrase private and do not share private keys with third parties.</p>
                    <p>Continued usage confirms acceptance of updated terms published in the app.</p>
                  </article>
                </div>
              )}

              {route === "topup" && (
                <div className="topup-page">
                  <header className="internal-hero internal-hero-topup">
                    <h2 className="internal-hero-title">{screenData.topup.title}</h2>
                    <p className="internal-hero-label">{screenData.topup.description}</p>
                  </header>
                  <div className="topup-frame">
                    <article className="topup-payment-card">
                      <p className="topup-payment-title">Receive USDT</p>
                      <TopUpQrVisual />
                      <p className="topup-qr-hint">Scan the QR or copy the address below</p>
                      <TopupAddressPanel address={DEFAULT_TOPUP_ADDRESS} />
                      <button
                        type="button"
                        className="topup-copy-row"
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
                        <span className="topup-copy-row-icon" aria-hidden="true">
                          <svg className="topup-copy-svg" viewBox="0 0 24 24" width="20" height="20" fill="none">
                            <path
                              d="M16 4h2a2 2 0 012 2v11a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2h2"
                              stroke="currentColor"
                              strokeWidth="1.75"
                              strokeLinejoin="round"
                            />
                            <rect
                              x="4"
                              y="8"
                              width="12"
                              height="12"
                              rx="2"
                              stroke="currentColor"
                              strokeWidth="1.75"
                            />
                          </svg>
                        </span>
                        {topupCopyState === "success"
                          ? "Copied"
                          : topupCopyState === "error"
                            ? "Copy unavailable"
                            : "Copy"}
                      </button>
                    </article>
                  </div>
                </div>
              )}

              {route === "withdraw" && (
                <div className="withdraw-block">
                  <article className="metric-card withdraw-overview-card">
                    <div className="withdraw-overview-row">
                      <span className="withdraw-overview-label">Recipient</span>
                      <span className="withdraw-overview-value">
                        {withdrawAddress.trim() ? withdrawAddress.trim() : "Paste TRC20 address"}
                      </span>
                    </div>
                    <div className="withdraw-overview-row">
                      <span className="withdraw-overview-label">Amount</span>
                      <span className="withdraw-overview-value">
                        {withdrawAmount.trim() ? withdrawAmount.trim() : "0.00"} USDT
                      </span>
                    </div>
                    <div className="withdraw-overview-row">
                      <span className="withdraw-overview-label">Estimated fee</span>
                      <span className="withdraw-overview-value">
                        {withdrawFeeMinor != null ? formatMinor(withdrawFeeMinor) : "0.00"} USDT
                      </span>
                    </div>
                  </article>
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
                    <div className="withdraw-field-wrap">
                      <input
                        type="text"
                        className="withdraw-field"
                        aria-label="Withdrawal amount"
                        placeholder="Amount (USDT)"
                        autoComplete="off"
                        spellCheck={false}
                        inputMode="decimal"
                        value={withdrawAmount}
                        onChange={(event) => setWithdrawAmount(event.target.value)}
                        disabled={isBusy}
                      />
                    </div>
                    <p className="withdraw-field-hint">
                      USDT on TRC20 only. Sending on the wrong network may result in permanent loss.
                    </p>
                    {withdrawValidationMessage ? (
                      <p className="withdraw-validation-message" role="alert">
                        {withdrawValidationMessage}
                      </p>
                    ) : null}
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
                      <p className="withdraw-fee-strip-text">
                        Max amount considering fee: <strong>{formatMinor(withdrawMaxMinor)} USDT</strong>
                      </p>
                    </div>
                  </article>
                </div>
              )}

              {route === "confirm" && (
                <div className="confirm-block">
                  {!pendingAction ? (
                    <article className="metric-card confirm-cheque-card" aria-live="polite">
                      <header className="confirm-cheque-head">
                        <div>
                          <p className="confirm-cheque-kicker">Cheque</p>
                          <h3 className="confirm-cheque-title">No pending withdrawal request</h3>
                        </div>
                      </header>
                      <div className="confirm-cheque-body">
                        <p className="confirm-cheque-subline">
                          Start from <strong>Withdraw</strong>, enter address and amount, then continue here.
                        </p>
                      </div>
                    </article>
                  ) : confirmStep === "success" ? (
                    <article className="metric-card confirm-result-card" aria-live="polite">
                      <div className="confirm-result-mark" aria-hidden="true">
                        ✓
                      </div>
                      <p className="confirm-result-kicker">Transfer status</p>
                      <h3 className="confirm-result-title">Transfer queued successfully</h3>
                      <p className="confirm-result-body">
                        Your transfer request was accepted. You can continue from Home or review activity on
                        Detail Balance.
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
                          <p className="confirm-cheque-kicker">Cheque</p>
                          <h3 className="confirm-cheque-title">Confirm withdrawal</h3>
                        </div>
                        <span className="confirm-cheque-ref" title="Trace reference">
                          {confirmTrace}
                        </span>
                      </header>
                      <div className="confirm-cheque-body">
                        <div className="confirm-cheque-row">
                          <span className="confirm-cheque-label">Address</span>
                          <span className="confirm-cheque-value">
                            {pendingAction?.recipientAddress ?? pendingAction?.recipientLabel ?? "TRC20 · —"}
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
                          <span className="confirm-cheque-label">Fee</span>
                          <span className="confirm-cheque-fee">{confirmFeeAmount} USDT</span>
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

              {route === "done" && (
                <div className="confirm-block">
                  {doneReceipt ? (
                    <article className="metric-card confirm-result-card" aria-live="polite">
                      <div className="confirm-result-mark" aria-hidden="true">
                        ✓
                      </div>
                      <p className="confirm-result-kicker">Done</p>
                      <h3 className="confirm-result-title">Withdrawal submitted</h3>
                      <p className="confirm-result-body">
                        Request accepted. Processing time is usually 10 minutes to 3 hours.
                      </p>
                      <div className="confirm-result-meta">
                        <span className="confirm-result-meta-label">Address</span>
                        <span className="confirm-result-meta-value">{doneReceipt.recipientAddress || "TRC20 wallet"}</span>
                      </div>
                      <div className="confirm-result-meta">
                        <span className="confirm-result-meta-label">Amount</span>
                        <span className="confirm-result-meta-value">{formatMinor(doneReceipt.amountMinor)} USDT</span>
                      </div>
                      <div className="confirm-result-meta">
                        <span className="confirm-result-meta-label">Fee</span>
                        <span className="confirm-result-meta-value">{formatMinor(doneReceipt.feeMinor)} USDT</span>
                      </div>
                      <div className="confirm-result-meta">
                        <span className="confirm-result-meta-label">Trace</span>
                        <span className="confirm-result-meta-value">{doneReceipt.traceId}</span>
                      </div>
                      <div className="done-pill" role="status" aria-live="polite">
                        Done!
                      </div>
                    </article>
                  ) : (
                    <article className="metric-card confirm-cheque-card" aria-live="polite">
                      <header className="confirm-cheque-head">
                        <div>
                          <p className="confirm-cheque-kicker">Done</p>
                          <h3 className="confirm-cheque-title">No confirmed withdrawal found</h3>
                        </div>
                      </header>
                      <div className="confirm-cheque-body">
                        <p className="confirm-cheque-subline">
                          Open this screen through the withdraw flow after tapping <strong>Confirm and Send</strong>.
                        </p>
                      </div>
                    </article>
                  )}
                </div>
              )}

              {actionMessage ? <p className="action-banner" role="alert">{actionMessage}</p> : null}

              <div className="cta-row">
                {primaryCta ? (
                  <button
                    type="button"
                    className={`btn-main${route === "topup" ? " btn-main--topup-paid" : ""}`}
                    onClick={
                      route === "topup"
                        ? handleTopUpContinue
                        : route === "withdraw"
                          ? handleWithdrawContinue
                          : primaryCta.action === "confirm-submit"
                            ? handleConfirmSend
                            : () => navigate(primaryCta.target ?? "dashboard")
                    }
                    disabled={
                      isBusy || (route === "confirm" && !pendingAction) || (route === "withdraw" && !isWithdrawReady)
                    }
                  >
                    {route === "topup" && actionState === "submitting" ? (
                      "Creating..."
                    ) : route === "withdraw" && actionState === "submitting" ? (
                      "Creating..."
                    ) : route === "confirm" && confirmStep === "submitting" ? (
                      "Sending..."
                    ) : route === "topup" ? (
                      <>
                        <span className="btn-main-paid-glyph" aria-hidden="true">
                          <svg className="btn-main-paid-svg" viewBox="0 0 24 24" width="15" height="15" fill="none">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
                            <path
                              d="M8 12.5 L11 15.5 L17 9"
                              stroke="currentColor"
                              strokeWidth="1.85"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            />
                          </svg>
                        </span>
                        Paid
                      </>
                    ) : (
                      primaryCta.label
                    )}
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
                    {route === "confirm" && confirmStep === "success" ? "Back to Home" : secondaryCta.label}
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
            aria-current={activeBottomTab === item.route ? "page" : undefined}
            className={`tab${activeBottomTab === item.route ? " tab-active" : ""}`}
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
