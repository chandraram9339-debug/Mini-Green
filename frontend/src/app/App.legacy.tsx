import React from "react";
import QRCode from "react-qr-code";
import {
  ApiError,
  confirmAction,
  createTopUp,
  createWithdraw,
  type AgreementPayload,
  type DashboardChartPoint,
  type DashboardPayload,
  fetchAgreement,
  fetchDashboard,
  fetchFaq,
  fetchMoneyDetails,
  fetchNotifications,
  fetchSettings,
  fetchTradingDetails,
  fetchWalletSeed,
  initSession,
  postRecoveryClaim,
  postTradingState,
  type MoneyDetailsPayload,
  type NotificationItemPayload,
  type SettingsPayload,
  resolveInitData,
  type SessionPayload,
  type TradingDetailsPayload,
  type TradingPeriodTab,
  type TradingPosition,
  type WalletSeedPayload,
} from "./api";
import {
  DASHBOARD_EXTERNAL_LINKS,
  MISSING_EXTERNAL_LINK_ENV_KEYS,
  MISSING_EXTERNAL_LINK_ENV_KEYS_EXCEPT_CHANNEL_CHAT,
} from "./config";
import { routeTitles, screenData, topLevelRoutes } from "./data";
import type { LoadState, RouteId } from "./types";
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
const DASHBOARD_MOCK_FALLBACK: DashboardPayload = {
  screen: "dashboard",
  wallet_minor: 0,
  referral_received_minor: 0,
  pnl_minor: 0,
  open_positions: 0,
  chart_points: [],
};

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

function formatMoneyOpDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function truncateMiddleAddr(s: string, left = 8, right = 6): string {
  const t = s.trim();
  if (t.length <= left + right + 3) return t;
  return `${t.slice(0, left)}…${t.slice(-right)}`;
}

function formatTradingStatsSource(source: TradingDetailsPayload["stats_source"] | undefined): string {
  if (source === "external-algo") return "External market feed";
  if (source === "trade-journal") return "Recorded positions (journal)";
  return "—";
}

function formatPositionSideLabel(side: string): string {
  const s = side.trim().toLowerCase();
  if (s === "long" || s === "short") return s[0]!.toUpperCase() + s.slice(1);
  return side.trim() || "—";
}

function partitionPositionSides(positions: TradingPosition[]): { long: number; short: number } {
  let long = 0;
  let short = 0;
  for (const p of positions) {
    const s = p.side.trim().toLowerCase();
    if (s === "short") short += 1;
    else long += 1;
  }
  return { long, short };
}

function formatNotificationTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const now = new Date();
    const dayStart = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    if (dayStart(now) === dayStart(d)) {
      return `Today · ${d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
    }
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

/** Y-axis ticks from actual chart range (USDT). */
function dashboardChartYAxisFromRange(minMinor: number, maxMinor: number): string[] {
  const lo = Math.min(minMinor, maxMinor);
  const hi = Math.max(maxMinor, lo + 1);
  return Array.from({ length: 7 }, (_, i) => {
    const t = i / 6;
    return formatMinor(Math.round(hi - t * (hi - lo)));
  });
}

function formatChartMonthDay(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

function dashboardChartXLabels(points: DashboardChartPoint[]): string[] {
  if (points.length < 2) {
    return ["—", "—", "—", "—", "—", "Now"];
  }
  const t0 = Date.parse(points[0]!.occurred_at);
  const t1 = Date.parse(points[points.length - 1]!.occurred_at);
  const span = Math.max(t1 - t0, 1);
  return Array.from({ length: 6 }, (_, i) =>
    formatChartMonthDay(new Date(t0 + (span * i) / 5).toISOString())
  );
}

function buildDashboardBalancePaths(points: DashboardChartPoint[]): {
  pathLine: string;
  pathArea: string;
  dots: [number, number][];
  minV: number;
  maxV: number;
  isEmpty: boolean;
} {
  if (points.length === 0) {
    return { pathLine: "", pathArea: "", dots: [], minV: 0, maxV: 0, isEmpty: true };
  }
  const vals = points.map((p) => p.wallet_minor);
  const ts = points.map((p) => Date.parse(p.occurred_at));
  const minV = Math.min(0, ...vals);
  const maxV = Math.max(minV + 1, ...vals);
  const t0 = ts[0]!;
  const t1 = ts[ts.length - 1]!;
  const spanT = Math.max(t1 - t0, 1);
  const plotLeft = 8;
  const plotRight = 292;
  const plotTop = 26;
  const plotBottom = 124;
  const coords: [number, number][] = points.map((p) => {
    const ti = Date.parse(p.occurred_at);
    const x = plotLeft + ((ti - t0) / spanT) * (plotRight - plotLeft);
    const norm = (p.wallet_minor - minV) / (maxV - minV);
    const y = plotBottom - norm * (plotBottom - plotTop);
    return [x, y];
  });
  let dLine = `M ${coords[0]![0].toFixed(2)} ${coords[0]![1].toFixed(2)}`;
  for (let i = 1; i < coords.length; i++) {
    dLine += ` L ${coords[i]![0].toFixed(2)} ${coords[i]![1].toFixed(2)}`;
  }
  const last = coords[coords.length - 1]!;
  const first = coords[0]!;
  const pathArea = `${dLine} L ${last[0].toFixed(2)} ${plotBottom} L ${first[0].toFixed(2)} ${plotBottom} Z`;
  return { pathLine: dLine, pathArea, dots: coords, minV, maxV, isEmpty: false };
}

function buildTradingExposureSpark(positions: TradingPosition[]): {
  pointsAttr: string;
  yTicks: string[];
  xLabels: string[];
} {
  const sorted = [...positions].sort((a, b) => {
    const ta = a.opened_at ? Date.parse(a.opened_at) : 0;
    const tb = b.opened_at ? Date.parse(b.opened_at) : 0;
    if (ta !== tb) return ta - tb;
    return a.symbol.localeCompare(b.symbol);
  });
  let acc = 0;
  const cum: number[] = [];
  for (const p of sorted) {
    acc += p.size_minor;
    cum.push(acc);
  }
  const maxV = Math.max(1, ...cum, 1);
  const yTicks = Array.from({ length: 5 }, (_, i) => formatMinor(Math.round((maxV * (4 - i)) / 4)));
  const n = cum.length;
  let pointsAttr = "";
  if (n === 0) {
    pointsAttr = "0,50 100,50";
  } else if (n === 1) {
    const y = 100 - (cum[0]! / maxV) * 100;
    pointsAttr = `0,${y} 100,${y}`;
  } else {
    pointsAttr = cum.map((v, i) => `${(i / (n - 1)) * 100},${100 - (v / maxV) * 100}`).join(" ");
  }
  const firstIso = sorted[0]?.opened_at;
  const lastIso = sorted[sorted.length - 1]?.opened_at;
  const xLabels =
    sorted.length === 0
      ? ["—", "—", "—", "—"]
      : [formatChartMonthDay(firstIso ?? ""), "·", "·", formatChartMonthDay(lastIso ?? "")];
  return { pointsAttr, yTicks, xLabels };
}

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

const TRADING_PERIOD_TABS = ["24h", "3d", "7d", "30d"] as const satisfies readonly TradingPeriodTab[];

const TRADING_TAB_LABELS: Record<TradingPeriodTab, string> = {
  "24h": "24h",
  "3d": "3d",
  "7d": "7d",
  "30d": "30d",
};

function formatApproxDuration(seconds: number): string {
  if (seconds <= 0) return "0";
  if (seconds < 3600) return `${Math.max(1, Math.round(seconds / 60))} min`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} h`;
  const d = Math.floor(seconds / 86400);
  const h = Math.round((seconds % 86400) / 3600);
  if (d >= 1 && h > 0) return `${d}d ${h}h`;
  return `${d}d`;
}

function moneyFilterToPath(filter: "deposit" | "withdraw" | "referral" | "trading"): string {
  switch (filter) {
    case "deposit":
      return "/balance/deposit";
    case "withdraw":
      return "/balance/withdraw";
    case "referral":
      return "/balance/referral";
    case "trading":
      return "/balance/trading";
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
    key === "balance/referral" ||
    key === "balance/trading"
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
      moneyFilter: "deposit" | "withdraw" | "referral" | "trading" | "all" | "in" | "out";
      tradingRange: TradingPeriodTab | "1d" | "30d" | "All" | "1m" | "3m";
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

function TopUpQrVisual({ value }: { value: string }) {
  const payload = value.trim().length > 0 ? value.trim() : DEFAULT_TOPUP_ADDRESS;
  return (
    <div className="topup-qr-shell">
      <QRCode
        value={payload}
        size={200}
        level="M"
        className="topup-qr-svg"
        fgColor="#0a0a0a"
        bgColor="#ffffff"
        aria-label="Deposit address QR code"
      />
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

/** Home balance chart — same SVG shell as before; paths from ledger `chart_points`. */
function DashboardHomeBalanceChart({ chartPoints }: { chartPoints: DashboardChartPoint[] }) {
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const gradArea = `dash-area-${uid}`;
  const geom = React.useMemo(() => buildDashboardBalancePaths(chartPoints), [chartPoints]);

  if (geom.isEmpty || chartPoints.length === 0) {
    return (
      <svg
        className="dashboard-perf-svg dashboard-perf-svg--funded"
        viewBox="0 0 300 148"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {[20, 42, 64, 86, 108, 130].map((y) => (
          <line key={y} x1="4" y1={y} x2="296" y2={y} className="dashboard-perf-svg-gridline" />
        ))}
        <path
          d="M 8 96 L 292 96"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="6 5"
          opacity={0.35}
        />
      </svg>
    );
  }

  const plotTop = 26;
  const plotBottom = 124;
  const zeroY =
    geom.maxV > geom.minV
      ? plotBottom - ((0 - geom.minV) / (geom.maxV - geom.minV)) * (plotBottom - plotTop)
      : null;
  const showZeroGuide =
    zeroY != null && Number.isFinite(zeroY) && zeroY >= plotTop && zeroY <= plotBottom && geom.minV < geom.maxV;

  const dotStride = Math.max(1, Math.ceil(geom.dots.length / 8));
  const dotsToShow = geom.dots.filter((_, i) => i % dotStride === 0 || i === geom.dots.length - 1);

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
      {showZeroGuide ? (
        <path
          d={`M 8 ${zeroY!.toFixed(2)} L 292 ${zeroY!.toFixed(2)}`}
          fill="none"
          stroke="#73c1b1"
          strokeWidth="1.75"
          strokeDasharray="5 5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity={0.55}
        />
      ) : null}
      <path d={geom.pathArea} fill={`url(#${gradArea})`} />
      <path
        d={geom.pathLine}
        fill="none"
        stroke="#2d6e93"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {dotsToShow.map(([cx, cy], i) => (
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
  const [moneyFilter, setMoneyFilter] = React.useState<"deposit" | "withdraw" | "referral" | "trading">(() => {
    const path = typeof window !== "undefined" ? window.location.pathname.replace(/^\/+/, "").toLowerCase() : "";
    if (path === "balance/referral") return "referral";
    if (path === "balance/withdraw") return "withdraw";
    if (path === "balance/trading") return "trading";
    if (path === "balance/deposit" || path === "balance" || path === "money") return "deposit";
    if (
      storedUiState.moneyFilter === "deposit" ||
      storedUiState.moneyFilter === "withdraw" ||
      storedUiState.moneyFilter === "referral" ||
      storedUiState.moneyFilter === "trading"
    ) {
      return storedUiState.moneyFilter;
    }
    if (storedUiState.moneyFilter === "in") return "deposit";
    if (storedUiState.moneyFilter === "out") return "withdraw";
    return "deposit";
  });
  const [tradingRange, setTradingRange] = React.useState<TradingPeriodTab>(() => {
    const x = storedUiState.tradingRange;
    if (x === "24h" || x === "3d" || x === "7d" || x === "30d") return x;
    if (x === "1m" || x === "3m" || x === "All") return "30d";
    if (x === "1d") return "24h";
    if (x === "30d") return "30d";
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
  const [tradingDetails, setTradingDetails] = React.useState<TradingDetailsPayload | null>(null);
  const [agreementData, setAgreementData] = React.useState<AgreementPayload | null>(null);
  const [faqEntries, setFaqEntries] = React.useState<Array<{ id: string; title: string; body: string }>>([]);
  const [notificationItems, setNotificationItems] = React.useState<NotificationItemPayload[]>([]);
  const [serverSettings, setServerSettings] = React.useState<SettingsPayload | null>(null);
  const [pendingAction, setPendingAction] = React.useState<PendingAction | null>(null);
  const [doneReceipt, setDoneReceipt] = React.useState<DoneReceipt | null>(null);
  const [actionState, setActionState] = React.useState<"idle" | "submitting">("idle");
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [tradingUiBusy, setTradingUiBusy] = React.useState(false);
  const [seedFetchState, setSeedFetchState] = React.useState<"idle" | "loading" | "ready" | "error">("idle");
  const [seedRemote, setSeedRemote] = React.useState<WalletSeedPayload | null>(null);
  const [seedRetryToken, setSeedRetryToken] = React.useState(0);
  const [recoveryClaimInput, setRecoveryClaimInput] = React.useState("");
  const [recoveryClaimBusy, setRecoveryClaimBusy] = React.useState(false);
  const hasPendingExternalLinks = MISSING_EXTERNAL_LINK_ENV_KEYS_EXCEPT_CHANNEL_CHAT.length > 0;

  const handleRecoveryClaim = React.useCallback(async () => {
    if (!session?.initData || recoveryClaimBusy) return;
    const code = recoveryClaimInput.trim();
    if (code.length < 8) {
      setActionMessage("Paste the full recovery code (at least 8 characters).");
      return;
    }
    setRecoveryClaimBusy(true);
    setActionMessage(null);
    try {
      await postRecoveryClaim(session.initData, code);
      setRecoveryClaimInput("");
      setSeedRetryToken((x) => x + 1);
      setScreenReloadToken((x) => x + 1);
      setActionMessage("Account linked to this Telegram profile. Refreshing…");
    } catch (e) {
      setActionMessage(e instanceof ApiError ? e.message : "Could not link account.");
    } finally {
      setRecoveryClaimBusy(false);
    }
  }, [session?.initData, recoveryClaimBusy, recoveryClaimInput]);

  const externalLinks = React.useMemo(() => {
    const s = serverSettings;
    if (!s) return DASHBOARD_EXTERNAL_LINKS;
    const pick = (remote: string | undefined, fallback: string) => {
      const t = remote?.trim();
      return t && t.length > 0 ? t : fallback;
    };
    return {
      channelUrl: pick(s.channel_url, DASHBOARD_EXTERNAL_LINKS.channelUrl),
      chatUrl: pick(s.chat_url, DASHBOARD_EXTERNAL_LINKS.chatUrl),
      youtubeUrl: pick(s.youtube_url, DASHBOARD_EXTERNAL_LINKS.youtubeUrl),
      supportUrl: pick(s.support_url, DASHBOARD_EXTERNAL_LINKS.supportUrl),
      referralUrl: pick(s.referral_link, DASHBOARD_EXTERNAL_LINKS.referralUrl),
    };
  }, [serverSettings]);

  React.useEffect(() => {
    if (initState !== "ready" || !session?.initData) return;
    const ac = new AbortController();
    fetchSettings(session.initData, ac.signal)
      .then(({ data }) => setServerSettings(data))
      .catch(() => setServerSettings(null));
    return () => ac.abort();
  }, [initState, session?.initData]);

  /** Prefetch notifications for header badge (same endpoint as Notifications screen). */
  React.useEffect(() => {
    if (initState !== "ready" || !session?.initData) return;
    const ac = new AbortController();
    fetchNotifications(session.initData, ac.signal)
      .then(({ data }) => setNotificationItems(data.items))
      .catch(() => {
        /* badge stays empty until user opens Notifications */
      });
    return () => ac.abort();
  }, [initState, session?.initData]);

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
        MISSING_EXTERNAL_LINK_ENV_KEYS_EXCEPT_CHANNEL_CHAT.length > 0
          ? ` Missing env: ${MISSING_EXTERNAL_LINK_ENV_KEYS_EXCEPT_CHANNEL_CHAT.join(", ")}.`
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
    if (path === "balance/trading" && moneyFilter !== "trading") {
      setMoneyFilter("trading");
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
    if (route !== "seed" || initState !== "ready" || !session?.initData) {
      if (route !== "seed") {
        setSeedFetchState("idle");
        setSeedRemote(null);
      }
      return;
    }
    const ac = new AbortController();
    setSeedFetchState("loading");
    fetchWalletSeed(session.initData, ac.signal)
      .then(({ data }) => {
        setSeedRemote(data);
        setSeedFetchState("ready");
      })
      .catch(() => {
        if (!ac.signal.aborted) {
          setSeedFetchState("error");
        }
      });
    return () => ac.abort();
  }, [route, initState, session?.initData, seedRetryToken]);

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
      route === "withdraw" ||
      route === "confirm" ||
      route === "done" ||
      route === "settings" ||
      route === "support" ||
      route === "social" ||
      route === "seed"
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

        if (route === "money" || route === "topup") {
          const { data } = await fetchMoneyDetails(session.initData, abortController.signal);
          setMoneyData(data);
          setScreenState("ready");
          return;
        }

        if (route === "trading") {
          const { data } = await fetchTradingDetails(session.initData, abortController.signal, tradingRange);
          setTradingDetails(data);
          setScreenState("ready");
          return;
        }

        if (route === "agreement") {
          const { data } = await fetchAgreement(session.initData, abortController.signal);
          setAgreementData(data);
          setScreenState("ready");
          return;
        }

        if (route === "faq") {
          const { data } = await fetchFaq(session.initData, abortController.signal);
          setFaqEntries(data.items.map((entry) => ({ id: entry.id, title: entry.q, body: entry.a })));
          setScreenState(data.items.length === 0 ? "empty" : "ready");
          return;
        }

        if (route === "notifications") {
          const { data } = await fetchNotifications(session.initData, abortController.signal);
          setNotificationItems(data.items);
          setScreenState(data.items.length === 0 ? "empty" : "ready");
          return;
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
  }, [initState, route, screenReloadToken, session, tradingRange]);

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
    (filter: "deposit" | "withdraw" | "referral" | "trading") => {
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
    moneyFilter === "referral"
      ? "Referral"
      : moneyFilter === "withdraw"
        ? "Withdraw"
        : moneyFilter === "trading"
          ? "Trading (SIB)"
          : "Deposit";

  const sibHistoryStats = React.useMemo(() => {
    const ops = moneyData?.operations ?? [];
    let net = 0;
    let n = 0;
    for (const o of ops) {
      if (o.kind !== "sib_trade") continue;
      net += o.amount_minor;
      n += 1;
    }
    return { net_minor: net, count: n };
  }, [moneyData?.operations]);
  const moneyRowsFromApi = React.useMemo(() => {
    const ops = moneyData?.operations;
    if (!ops?.length) return [];
    return ops.map((o) => {
      const dateTimeText = formatMoneyOpDate(o.occurred_at);
      if (o.kind === "deposit") {
        return {
          kind: "deposit" as const,
          title: "Replenishment",
          walletMask: o.wallet_mask ?? "—",
          dateTimeText,
          amount: `+${formatMinor(o.amount_minor)} USDT`,
          fee:
            o.fee_minor != null && o.fee_minor > 0 ? `${formatMinor(o.fee_minor)} USDT` : null,
          tone: "in" as const,
        };
      }
      if (o.kind === "referral") {
        return {
          kind: "referral" as const,
          title: "Referral reward",
          walletMask: o.wallet_mask ?? "—",
          dateTimeText,
          amount: `+${formatMinor(o.amount_minor)} USDT`,
          fee: null,
          tone: "in" as const,
        };
      }
      if (o.kind === "sib_trade") {
        const d = o.amount_minor;
        const up = d >= 0;
        return {
          kind: "sib_trade" as const,
          title: "Trading result (SIB)",
          walletMask: o.wallet_mask ?? "—",
          dateTimeText,
          amount: `${up ? "+" : "−"}${formatMinor(Math.abs(d))} USDT`,
          fee: null,
          tone: up ? ("in" as const) : ("out" as const),
        };
      }
      const tone = o.status === "pending" ? ("pending" as const) : ("out" as const);
      return {
        kind: "withdraw" as const,
        title: "Withdrawal",
        walletMask: o.wallet_mask ?? "—",
        dateTimeText,
        amount: `−${formatMinor(o.amount_minor)} USDT`,
        fee: o.fee_minor != null && o.fee_minor > 0 ? `${formatMinor(o.fee_minor)} USDT` : null,
        tone,
      };
    });
  }, [moneyData?.operations]);
  const filteredMoneyRows = React.useMemo(() => {
    return moneyRowsFromApi.filter((row) =>
      moneyFilter === "trading" ? row.kind === "sib_trade" : row.kind === moneyFilter
    );
  }, [moneyFilter, moneyRowsFromApi]);

  const { notificationToday, notificationEarlier } = React.useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const todayMs = start.getTime();
    const today: NotificationItemPayload[] = [];
    const earlier: NotificationItemPayload[] = [];
    for (const n of notificationItems) {
      const t = new Date(n.created_at).getTime();
      if (!Number.isNaN(t) && t >= todayMs) today.push(n);
      else earlier.push(n);
    }
    return { notificationToday: today, notificationEarlier: earlier };
  }, [notificationItems]);

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
  const dashboardChartPoints = dashboardSnapshot.chart_points ?? [];
  const dashboardChartGeom = React.useMemo(
    () => buildDashboardBalancePaths(dashboardChartPoints),
    [dashboardChartPoints]
  );
  const dashboardHasBalance = dashboardSnapshot.wallet_minor > 0;
  const dashboardBalance = formatMinor(dashboardSnapshot.wallet_minor);
  const dashboardReferralMinor = dashboardSnapshot.referral_received_minor ?? 0;
  const dashboardReferralDisplay = formatMinor(dashboardReferralMinor);
  const dashboardGraphTitle = "Balance history";
  const dashboardGraphLegendPrimary = "Wallet balance";
  const dashboardGraphLegendSecondary = "Zero reference";
  const dashboardChartPeriod =
    dashboardChartPoints.length >= 2
      ? `${formatChartMonthDay(dashboardChartPoints[0]!.occurred_at)}–${formatChartMonthDay(
          dashboardChartPoints[dashboardChartPoints.length - 1]!.occurred_at
        )}`
      : "—";
  const dashboardYAxisLabels =
    dashboardChartGeom.isEmpty || dashboardChartPoints.length === 0
      ? Array.from({ length: 7 }, () => formatMinor(0))
      : dashboardChartYAxisFromRange(dashboardChartGeom.minV, dashboardChartGeom.maxV);
  const dashboardXAxisLabels = dashboardChartXLabels(dashboardChartPoints);
  const dashboardShowZeroBalanceHint =
    !dashboardHasBalance && dashboardChartPoints.length <= 2;
  const moneyWalletMinor =
    moneyData?.wallet_minor ??
    (moneyData ? moneyData.available_minor + moneyData.locked_minor : 0);
  const moneyBalanceDisplay = formatMinor(moneyWalletMinor);
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

  const topupDepositAddress = React.useMemo(() => {
    const fromApi = moneyData?.deposit_address?.trim();
    return fromApi && fromApi.length > 0 ? fromApi : DEFAULT_TOPUP_ADDRESS;
  }, [moneyData?.deposit_address]);
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
  const tradingPositionCount = tradingDetails?.positions?.length ?? 0;
  const tradingStats = React.useMemo(() => {
    const positions = tradingDetails?.positions ?? [];
    const sourceLabel = formatTradingStatsSource(tradingDetails?.stats_source);
    if (positions.length === 0) {
      return {
        sourceLabel,
        total: 0,
        longCount: 0,
        shortCount: 0,
        notionalLabel: "—",
      };
    }
    const { long, short } = partitionPositionSides(positions);
    const sumMinor = positions.reduce((acc, p) => acc + p.size_minor, 0);
    return {
      sourceLabel,
      total: positions.length,
      longCount: long,
      shortCount: short,
      notionalLabel: `${formatMinor(sumMinor)} USDT`,
    };
  }, [tradingDetails]);
  const tradingExposureSpark = React.useMemo(
    () => buildTradingExposureSpark(tradingDetails?.positions ?? []),
    [tradingDetails?.positions]
  );
  const tradingTotalLabel = String(tradingStats.total);

  const tradingWalletMinor = tradingDetails?.wallet_minor ?? 0;
  const botTradingEnabled = tradingDetails?.bot_trading_enabled ?? false;
  const tradingBlocked = isBusy || tradingUiBusy;

  const handleTradingStart = React.useCallback(async () => {
    if (!session?.initData || tradingBlocked) return;
    if (tradingWalletMinor <= 0) {
      navigate("topup");
      return;
    }
    if (botTradingEnabled) {
      setActionMessage("Trading is already running.");
      return;
    }
    setTradingUiBusy(true);
    setActionMessage(null);
    try {
      await postTradingState(session.initData, true);
      setScreenReloadToken((x) => x + 1);
    } catch (e) {
      setActionMessage(e instanceof ApiError ? e.message : "Could not start trading.");
    } finally {
      setTradingUiBusy(false);
    }
  }, [session?.initData, tradingWalletMinor, botTradingEnabled, tradingBlocked, navigate]);

  const handleTradingStop = React.useCallback(async () => {
    if (!session?.initData || tradingBlocked) return;
    if (!botTradingEnabled) {
      setActionMessage("Trading is already stopped.");
      return;
    }
    setTradingUiBusy(true);
    setActionMessage(null);
    try {
      await postTradingState(session.initData, false);
      setScreenReloadToken((x) => x + 1);
    } catch (e) {
      setActionMessage(e instanceof ApiError ? e.message : "Could not stop trading.");
    } finally {
      setTradingUiBusy(false);
    }
  }, [session?.initData, botTradingEnabled, tradingBlocked]);

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
                  aria-label={
                    notificationItems.length > 0
                      ? `Open notifications, ${notificationItems.length} items`
                      : "Open notifications"
                  }
                  onClick={() => navigate("notifications")}
                >
                  <img
                    className="top-bar-icon top-bar-icon--notify"
                    src={topBarNotifyIcon}
                    alt=""
                    aria-hidden="true"
                  />
                  {notificationItems.length > 0 ? (
                    <span className="top-bar-badge" aria-hidden="true">
                      {notificationItems.length > 99 ? "99+" : notificationItems.length}
                    </span>
                  ) : null}
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
                  <span className="dashboard-referral-figure">{dashboardReferralDisplay}</span>
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
                    : route === "notifications"
                      ? {
                          loading: "Loading notifications...",
                          empty: "No notifications yet.",
                          error: "Notifications are temporarily unavailable.",
                        }
                      : route === "topup"
                        ? {
                            loading: "Loading deposit details...",
                            empty: "No deposit address assigned yet.",
                            error: "Could not load deposit details.",
                          }
                        : route === "agreement"
                          ? {
                              loading: "Loading agreement...",
                              empty: "Agreement text is not available.",
                              error: "Could not load the agreement.",
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
                  <div className="dashboard-perf-chart">
                    <div className="dashboard-perf-y-axis">
                      {dashboardYAxisLabels.map((label, idx) => (
                        <span key={`y-${idx}`}>{label}</span>
                      ))}
                    </div>
                    <div className="dashboard-perf-plot dashboard-perf-plot--funded">
                      <DashboardHomeBalanceChart chartPoints={dashboardChartPoints} />
                      {dashboardShowZeroBalanceHint ? (
                        <div className="dashboard-perf-empty dashboard-perf-empty--on-figma">
                          <p className="dashboard-perf-empty-title">Balance is 0 USDT</p>
                          <p className="dashboard-perf-empty-body">
                            Top up to unlock balance history and cashflow tracking.
                          </p>
                        </div>
                      ) : null}
                    </div>
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
              <section className="dashboard-block dashboard-block--status" aria-label="Bot status and session metrics">
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
                      <span className="dashboard-status-kicker">Open positions</span>
                      <span className="dashboard-status-value">{dashboardSnapshot.open_positions}</span>
                    </div>
                    <div className="dashboard-status-row">
                      <span className="dashboard-status-kicker">Session PnL</span>
                      <span className="dashboard-price-figure">
                        <strong className="dashboard-price-strong">{formatMinor(dashboardSnapshot.pnl_minor)}</strong>
                        <span className="dashboard-price-unit">USDT</span>
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
                      {moneyBalanceDisplay}
                      <span className="money-current-unit">USDT</span>
                    </p>
                    <p className="money-current-wallet">
                      {moneyData?.deposit_address ? truncateMiddleAddr(moneyData.deposit_address) : "—"}
                    </p>
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
                        {formatMinor(moneyData?.deposit_total_minor ?? 0)} <span>USDT</span>
                      </span>
                      <span className="money-summary-label">Number of deposits made:</span>
                      <span className="money-summary-meta">{moneyData?.deposit_count ?? 0} TIMES</span>
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
                        {formatMinor(moneyData?.withdraw_total_minor ?? 0)} <span>USDT</span>
                      </span>
                      <span className="money-summary-label">Number of withdrawals:</span>
                      <span className="money-summary-meta">{moneyData?.withdraw_count ?? 0} TIMES</span>
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
                        {formatMinor(moneyData?.referral_received_minor ?? 0)} <span>USDT</span>
                      </span>
                      <span className="money-summary-label">Total number of invited users:</span>
                      <span className="money-summary-meta">{moneyData?.invited_users_count ?? 0} PEOPLE</span>
                    </button>
                    <button
                      type="button"
                      className={`money-summary-card${moneyFilter === "trading" ? " money-summary-card--active" : ""}`}
                      aria-pressed={moneyFilter === "trading"}
                      disabled={isBusy}
                      onClick={() => navigateMoneyFilter("trading")}
                    >
                      <span className="money-summary-title">Trading (SIB)</span>
                      <span className="money-summary-label">Net trading result:</span>
                      <span className="money-summary-value">
                        {sibHistoryStats.net_minor >= 0 ? "+" : "−"}
                        {formatMinor(Math.abs(sibHistoryStats.net_minor))} <span>USDT</span>
                      </span>
                      <span className="money-summary-label">Applied closes:</span>
                      <span className="money-summary-meta">{sibHistoryStats.count} TIMES</span>
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
                        <span className="trading-hero-dot" aria-hidden="true" />{" "}
                        {botTradingEnabled ? "Active" : "Stopped"}
                      </p>
                    </div>
                    <div className="trading-hero-meta-block">
                      <p className="trading-hero-meta-label">Data source</p>
                      <p className="trading-hero-meta-value">
                        {formatTradingStatsSource(tradingDetails?.stats_source)}
                        <span className="trading-hero-meta-unit"> · {tradingPositionCount} open</span>
                      </p>
                    </div>
                    <div className="trading-action-row">
                      <button
                        type="button"
                        className="trading-action-btn trading-action-btn--start"
                        onClick={() => void handleTradingStart()}
                        disabled={tradingBlocked}
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
                        onClick={() => void handleTradingStop()}
                        disabled={tradingBlocked}
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
                  {tradingDetails?.al_trading_simulator?.syncs_this_user ? (
                    <p className="trading-period-hint" role="note" style={{ marginBottom: "0.65rem" }}>
                      Trade feed is synced from the AL simulator (backend polls GET /api/trade-feed).
                    </p>
                  ) : null}
                  <div className="trading-stack">
                    <div className="trading-stack-head">
                      <p className="trading-section-title">Detail Bot statistics for the period:</p>
                      <div className="stats-tabs" role="tablist" aria-label="Statistics period">
                        {TRADING_PERIOD_TABS.map((tab) => (
                          <button
                            key={tab}
                            type="button"
                            role="tab"
                            aria-selected={tradingRange === tab}
                            className={tradingRange === tab ? "stat-pill stat-pill-active" : "stat-pill"}
                            disabled={isBusy}
                            onClick={() => setTradingRange(tab)}
                          >
                            {TRADING_TAB_LABELS[tab]}
                          </button>
                        ))}
                      </div>
                    </div>
                    {tradingDetails?.stats_capped_to_history ? (
                      <p className="trading-period-hint" role="status">
                        Showing {formatApproxDuration(tradingDetails.period_seconds_effective)} of activity — your history is
                        shorter than the selected window ({TRADING_TAB_LABELS[tradingDetails.period]}). Totals include all
                        activity in the available span.
                      </p>
                    ) : null}
                    <div className="trading-graph" aria-hidden="true">
                      <div className="trading-graph-y-axis">
                        {tradingExposureSpark.yTicks.map((label, idx) => (
                          <span key={`ty-${idx}`}>{label}</span>
                        ))}
                      </div>
                      {tradingPositionCount === 0 ? <div className="trading-graph-line" /> : null}
                      <div className="trading-graph-points">
                        <svg
                          className="trading-graph-series-svg"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                        >
                          <polyline
                            fill="none"
                            stroke="#2d6e93"
                            strokeWidth="1.5"
                            vectorEffect="nonScalingStroke"
                            points={tradingExposureSpark.pointsAttr}
                          />
                        </svg>
                      </div>
                      <div className="trading-graph-legend">
                        <span className="trading-graph-legend-item">
                          <span className="trading-graph-legend-dot trading-graph-legend-dot--bot" />
                          Cumulative open notional (USDT)
                        </span>
                      </div>
                      <div className="trading-graph-x-axis">
                        {tradingExposureSpark.xLabels.map((label, idx) => (
                          <span key={`tx-${idx}`}>{label}</span>
                        ))}
                      </div>
                    </div>
                    <p className="trading-graph-note" role="note">
                      Step curve adds each open position by time (sorted by opened_at); axis shows cumulative size.
                    </p>
                    <div className="trading-kpi-row" aria-label="Trading summary">
                      <article className="trading-stats-card">
                        <div className="trading-stats-row">
                          <span className="trading-stats-icon trading-stats-icon--total" aria-hidden="true" />
                          <p className="trading-stats-label">Open positions:</p>
                          <p className="trading-stats-value">{tradingTotalLabel}</p>
                        </div>
                        <div className="trading-stats-row">
                          <span className="trading-stats-icon trading-stats-icon--up" aria-hidden="true" />
                          <p className="trading-stats-label">Long:</p>
                          <p className="trading-stats-value">{tradingStats.longCount}</p>
                        </div>
                        <div className="trading-stats-row">
                          <span className="trading-stats-icon trading-stats-icon--down" aria-hidden="true" />
                          <p className="trading-stats-label">Short:</p>
                          <p className="trading-stats-value">{tradingStats.shortCount}</p>
                        </div>
                        <div className="trading-stats-row">
                          <span className="trading-stats-icon trading-stats-icon--result" aria-hidden="true" />
                          <p className="trading-stats-label">Notional exposure:</p>
                          <p className="trading-stats-value trading-stats-value--result">{tradingStats.notionalLabel}</p>
                        </div>
                      </article>
                    </div>
                    <p className="trading-list-kicker">Positions:</p>
                    {(tradingDetails?.positions?.length ?? 0) === 0 ? (
                      <article className="metric-card trading-list-row trading-list-row--new">
                        <div className="trading-list-line">
                          <span className="trading-list-dot" aria-hidden="true" />
                          <p className="trading-list-title">No trades in this period</p>
                        </div>
                        <div className="trading-list-line">
                          <p className="trading-list-body">
                            Try a longer range or wait for new fills from your trading engine.
                          </p>
                        </div>
                      </article>
                    ) : (
                      (tradingDetails?.positions ?? []).map((pos, idx) => {
                        const tone =
                          pos.side.trim().toLowerCase() === "short"
                            ? "danger"
                            : pos.side.trim().toLowerCase() === "long"
                              ? "success"
                              : "new";
                        const openedLabel = pos.opened_at ? formatChartMonthDay(pos.opened_at) : "—";
                        const closedLabel =
                          pos.closed_at != null && String(pos.closed_at).trim() !== ""
                            ? formatChartMonthDay(pos.closed_at)
                            : null;
                        return (
                          <article
                            key={`${pos.symbol}-${pos.opened_at}-${idx}-${closedLabel ?? "o"}`}
                            className={`metric-card trading-list-row trading-list-row--${tone}`}
                          >
                            <div className="trading-list-line">
                              <span className="trading-list-dot" aria-hidden="true" />
                              <p className="trading-list-title">
                                {pos.symbol} · {formatPositionSideLabel(pos.side)}
                                {closedLabel ? (
                                  <span className="trading-list-closed-badge" aria-label="Closed position">
                                    {" "}
                                    · Closed
                                  </span>
                                ) : null}
                              </p>
                            </div>
                            <div className="trading-list-line">
                              <span className="trading-list-wave" aria-hidden="true" />
                              <p className="trading-list-body">
                                Opened {openedLabel}
                                {closedLabel ? ` · Closed ${closedLabel}` : ""}
                              </p>
                            </div>
                            <div className="trading-list-line">
                              <span className="trading-list-arrow" aria-hidden="true" />
                              <p className="trading-list-body">Position size</p>
                              <p className="trading-list-amount">{formatMinor(pos.size_minor)}</p>
                              <p className="trading-list-unit">USDT</p>
                            </div>
                            <div className="trading-list-line">
                              <span className="trading-list-wave" aria-hidden="true" />
                              <p className="trading-list-body">Data source</p>
                              <p className="trading-list-result">{tradingStats.sourceLabel}</p>
                            </div>
                          </article>
                        );
                      })
                    )}
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
                    {notificationToday.length > 0 ? (
                      notificationToday.map((item, idx) => (
                        <article
                          key={item.id}
                          className={`notification-row${idx === 0 ? " notification-row--new" : ""}`}
                          role="listitem"
                        >
                          <p className="notification-title">{item.title}</p>
                          <p className="notification-body">{item.body}</p>
                          <p className="notification-meta">{formatNotificationTime(item.created_at)}</p>
                        </article>
                      ))
                    ) : (
                      <p className="notification-body" role="status">
                        No notifications from today yet.
                      </p>
                    )}
                    <div className="notification-divider" aria-hidden="true" />
                    <p className="notification-group-title">Earlier</p>
                    {notificationEarlier.length > 0 ? (
                      notificationEarlier.map((item) => (
                        <article key={item.id} className="notification-row" role="listitem">
                          <p className="notification-title">{item.title}</p>
                          <p className="notification-body">{item.body}</p>
                          <p className="notification-meta">{formatNotificationTime(item.created_at)}</p>
                        </article>
                      ))
                    ) : (
                      <p className="notification-body" role="status">
                        No earlier notifications.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {route === "settings" && (
                <div className="settings-page">
                  <header className="internal-hero internal-hero-settings">
                    <h2 className="internal-hero-title">{screenData.settings.title}</h2>
                    <p className="internal-hero-label">{screenData.settings.description}</p>
                    {hasPendingExternalLinks && (
                      <p className="settings-pending-note">
                        Some links still use env placeholders (channel & chat can be added later).
                      </p>
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
                      <button type="button" className="settings-link-btn" disabled aria-disabled="true">
                        <span className="settings-link-main">
                          Theme:{" "}
                          {serverSettings ? (serverSettings.theme === "black" ? "Dark" : "Light") : "…"}
                        </span>
                      </button>
                      <button type="button" className="settings-link-btn" disabled aria-disabled="true">
                        <span className="settings-link-main">
                          Push: {serverSettings ? (serverSettings.push ? "On" : "Off") : "…"}
                        </span>
                      </button>
                      <button type="button" className="settings-link-btn" disabled aria-disabled="true">
                        <span className="settings-link-main">
                          Vibration: {serverSettings ? (serverSettings.vibration ? "On" : "Off") : "…"}
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
                      <button
                        type="button"
                        className="settings-link-btn"
                        onClick={() => openExternalLink(externalLinks.supportUrl, "Support")}
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
                        onClick={() => openExternalLink(externalLinks.referralUrl, "Referral")}
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
                        onClick={() => openExternalLink(externalLinks.supportUrl, "Support")}
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
                        onClick={() => openExternalLink(externalLinks.channelUrl, "Channel")}
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
                        onClick={() => openExternalLink(externalLinks.chatUrl, "Chat")}
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
                        onClick={() => openExternalLink(externalLinks.youtubeUrl, "Youtube")}
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
                    {seedFetchState === "ready" &&
                    seedRemote?.account_recovery?.enabled &&
                    seedRemote.account_recovery.state !== "off" ? (
                      <div className="seed-recovery-section" style={{ marginBottom: "1.35rem" }}>
                        <p className="settings-group-title">App account recovery</p>
                        <p className="seed-status-msg" style={{ marginBottom: "0.75rem" }}>
                          Save this code in a safe place. It lets you restore your <strong>balance and history</strong> in
                          this app if you change Telegram account or reinstall — or give it to an admin if needed.
                        </p>
                        {seedRemote.account_recovery.code ? (
                          <>
                            <p className="seed-status-msg" style={{ fontWeight: 600, color: "var(--figma-warning, #c96)" }}>
                              Copy now — this text is shown only once.
                            </p>
                            <pre
                              style={{
                                padding: "0.75rem",
                                borderRadius: 8,
                                background: "rgba(0,0,0,0.06)",
                                wordBreak: "break-all",
                                fontSize: 14,
                                margin: "0.5rem 0",
                              }}
                            >
                              {seedRemote.account_recovery.code}
                            </pre>
                            <button
                              type="button"
                              className="seed-copy-btn"
                              onClick={() =>
                                void navigator.clipboard.writeText(seedRemote.account_recovery!.code!)
                              }
                              disabled={isBusy}
                            >
                              Copy recovery code
                            </button>
                          </>
                        ) : (
                          <p className="seed-status-msg">
                            {seedRemote.account_recovery.state === "previously_shown"
                              ? "Your recovery code was already displayed on your first visit. If you lost it, contact support."
                              : null}
                          </p>
                        )}
                        <div style={{ margin: "1.1rem 0", borderTop: "1px solid rgba(0,0,0,0.08)" }} />
                        <p className="settings-group-title">Link this Telegram to a saved code</p>
                        <p className="seed-status-msg" style={{ marginBottom: "0.5rem" }}>
                          Use when you open the app with a <strong>new</strong> Telegram account but still have your
                          recovery code. The empty new profile will be discarded; your old account moves to this
                          Telegram. If this profile already has deposits, linking is blocked — use support.
                        </p>
                        <input
                          type="text"
                          value={recoveryClaimInput}
                          onChange={(e) => setRecoveryClaimInput(e.target.value)}
                          placeholder="Paste recovery code"
                          className="seed-recovery-input"
                          style={{
                            width: "100%",
                            padding: "0.6rem 0.75rem",
                            borderRadius: 8,
                            border: "1px solid rgba(0,0,0,0.15)",
                            marginBottom: "0.5rem",
                          }}
                          autoComplete="off"
                          disabled={recoveryClaimBusy}
                        />
                        <button
                          type="button"
                          className="seed-copy-btn"
                          onClick={() => void handleRecoveryClaim()}
                          disabled={isBusy || recoveryClaimBusy}
                        >
                          {recoveryClaimBusy ? "Linking…" : "Link account"}
                        </button>
                      </div>
                    ) : null}
                    {seedFetchState === "loading" || seedFetchState === "idle" ? (
                      <p className="seed-status-msg">Loading recovery phrase…</p>
                    ) : seedFetchState === "error" ? (
                      <div className="seed-status-box">
                        <p className="seed-status-msg">Could not load recovery phrase.</p>
                        <button type="button" className="seed-copy-btn" onClick={() => setSeedRetryToken((t) => t + 1)}>
                          Retry
                        </button>
                      </div>
                    ) : seedRemote?.mode === "per_user" && seedRemote.words.length > 0 ? (
                      <>
                        <ol className="seed-grid" aria-label="Recovery words">
                          {seedRemote.words.map((word, index) => (
                            <li key={`${index}-${word}`} className="seed-item">
                              <span className="seed-index">{index + 1}.</span>
                              <span className="seed-word">{word}</span>
                            </li>
                          ))}
                        </ol>
                        <button
                          type="button"
                          className="seed-copy-btn"
                          onClick={async () => navigator.clipboard.writeText(seedRemote.words.join(" "))}
                          disabled={isBusy}
                        >
                          Copy
                        </button>
                      </>
                    ) : seedRemote?.mode === "custodial_pk" ? (
                      <p className="seed-status-msg">
                        This account uses a custodial deposit wallet: the key is encrypted in our database (no BIP39 seed is
                        shown here). Use Top Up for your deposit address.
                      </p>
                    ) : seedRemote?.mode === "legacy" ? (
                      <p className="seed-status-msg">
                        This account uses a legacy shared deposit scheme. No personal phrase is stored in the app —
                        contact support if you need help with your deposit address.
                      </p>
                    ) : (
                      <p className="seed-status-msg">
                        Personal recovery phrases are disabled on this deployment. Your deposit address is still shown on
                        the Top Up screen.
                      </p>
                    )}
                  </article>
                </div>
              )}

              {route === "agreement" && (
                <div className="agreement-page">
                  <header className="internal-hero internal-hero-agreement">
                    <h2 className="internal-hero-title">{agreementData?.title ?? screenData.agreement.title}</h2>
                    <p className="internal-hero-label">{screenData.agreement.description}</p>
                  </header>
                  <article className="metric-card agreement-card">
                    <div style={{ whiteSpace: "pre-wrap" }}>{agreementData?.content ?? ""}</div>
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
                      <TopUpQrVisual value={topupDepositAddress} />
                      <p className="topup-qr-hint">Scan the QR or copy the address below</p>
                      <TopupAddressPanel address={topupDepositAddress} />
                      <button
                        type="button"
                        className="topup-copy-row"
                        disabled={isBusy}
                        onClick={async () => {
                          if (isBusy) return;
                          try {
                            await navigator.clipboard.writeText(topupDepositAddress);
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
