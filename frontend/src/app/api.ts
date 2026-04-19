const DEFAULT_API_BASE_URL = "http://127.0.0.1:4000";
const FALLBACK_DEMO_INIT_DATA = "demo-smoke-init";

type ApiSuccess<T> = {
  ok: true;
  trace_id: string;
  data: T;
};

type ApiFailure = {
  ok: false;
  trace_id: string;
  error: {
    code: string;
    reason: string;
    status: number;
  };
};

type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export type InitSource = "telegram" | "query" | "demo-token";

export interface SessionPayload {
  api_version: string;
  mode: string;
  user: {
    id: string;
    role: string;
  };
  init_source: string;
  auth_provider_mode: string;
}

export interface DashboardChartPoint {
  occurred_at: string;
  wallet_minor: number;
}

export interface DashboardPayload {
  screen: "dashboard";
  wallet_minor: number;
  /** USDT minor total received from referral payouts (100 minor = 1 USDT). */
  referral_received_minor: number;
  pnl_minor: number;
  open_positions: number;
  /** Wallet balance over time (from deposits, withdrawals, referral payouts). */
  chart_points: DashboardChartPoint[];
}

export interface MoneyDetailsPayload {
  screen: "money-details";
  /** Total wallet balance (same as dashboard); 100 minor = 1 USDT. */
  wallet_minor: number;
  available_minor: number;
  locked_minor: number;
  deposit_total_minor: number;
  deposit_count: number;
  withdraw_total_minor: number;
  withdraw_count: number;
  referral_received_minor: number;
  invited_users_count: number;
  deposit_address: string | null;
  currency: string;
  operations?: Array<{
    id: string;
    kind: "deposit" | "withdraw" | "referral" | "sib_trade";
    status: "pending" | "confirmed";
    amount_minor: number;
    fee_minor: number | null;
    wallet_mask: string | null;
    occurred_at: string;
  }>;
}

export interface TradingPosition {
  symbol: string;
  side: string;
  size_minor: number;
  /** ISO time when the position opened (period filters use this). */
  opened_at?: string;
  /** ISO time when closed; absent while still open. */
  closed_at?: string | null;
}

/** Must match backend `TRADING_PERIOD_KEYS`. */
export type TradingPeriodTab = "24h" | "3d" | "7d" | "30d";

export interface TradingDetailsPayload {
  screen: "trading-details";
  period: TradingPeriodTab;
  /** Selected window length in seconds (24h → 86400). */
  period_seconds_requested: number;
  /** Actual overlap [max(now−period, trading_start), now] in seconds. */
  period_seconds_effective: number;
  /** Seconds since trading activity began (first deposit / account). */
  trading_history_seconds: number;
  /** True when account history is shorter than the requested period — stats cover all available time. */
  stats_capped_to_history: boolean;
  positions: TradingPosition[];
  stats_source: "external-algo" | "trade-journal";
  /** Wallet balance for Start gating (100 minor = 1 USDT). */
  wallet_minor: number;
  bot_trading_enabled: boolean;
  /** Present when backend polls external AL `/api/trade-feed` for this deployment / user. */
  al_trading_simulator?: {
    feed_configured: boolean;
    syncs_this_user: boolean;
  };
}

export interface TradingStatePayload {
  screen: "trading-state";
  bot_trading_enabled: boolean;
}

export interface AgreementPayload {
  screen: "agreement";
  title: string;
  content: string;
}

export interface FaqItemPayload {
  id: string;
  q: string;
  a: string;
}

export interface FaqPayload {
  screen: "faq";
  items: FaqItemPayload[];
}

export interface NotificationItemPayload {
  id: string;
  title: string;
  body: string;
  created_at: string;
  level: string;
}

export interface NotificationsPayload {
  screen: "notifications";
  items: NotificationItemPayload[];
}

/** GET /api/v1/ui/settings — links and referral URL from server (admin-managed content). */
export interface SettingsPayload {
  screen: "settings";
  theme: "light" | "black";
  push: boolean;
  vibration: boolean;
  support_url: string;
  channel_url: string;
  chat_url: string;
  youtube_url: string;
  faq_url: string;
  referral_link: string;
}

export type WalletSeedMode = "per_user" | "legacy" | "disabled" | "custodial_pk";

export interface AccountRecoveryPayload {
  enabled: boolean;
  code: string | null;
  state: "off" | "just_issued" | "previously_shown";
}

export interface WalletSeedPayload {
  screen: "seed";
  mode: WalletSeedMode;
  words: string[];
  account_recovery?: AccountRecoveryPayload;
}

export interface RecoveryClaimPayload {
  screen: "recovery-claim";
  status: "already_linked" | "linked";
  previous_telegram_cleared_user_id?: number;
}

export interface TopUpActionPayload {
  screen: "top-up";
  status: string;
  action_id: string;
  amount_minor: number;
}

export interface WithdrawActionPayload {
  screen: "withdraw";
  status: string;
  request_id: string;
  amount_minor: number;
}

export interface ConfirmActionPayload {
  screen: "confirm";
  action_id: string;
  status: string;
}

export class ApiError extends Error {
  code: string;
  status: number;
  traceId: string | null;

  constructor(message: string, code: string, status: number, traceId: string | null) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.traceId = traceId;
  }
}

function apiBaseUrl() {
  const raw =
    typeof import.meta.env.VITE_API_BASE_URL === "string"
      ? import.meta.env.VITE_API_BASE_URL.trim()
      : "";
  return (raw || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}

export function resolveInitData(): { value: string; source: InitSource } {
  const params = new URLSearchParams(window.location.search);
  const queryInitData = params.get("initData")?.trim();
  if (queryInitData) {
    return { value: queryInitData, source: "query" };
  }

  const telegramInitData = window.Telegram?.WebApp?.initData?.trim();
  if (telegramInitData) {
    return { value: telegramInitData, source: "telegram" };
  }

  return { value: FALLBACK_DEMO_INIT_DATA, source: "demo-token" };
}

async function requestJson<T>(
  path: string,
  init: RequestInit,
  parse: (data: unknown) => T
): Promise<{ data: T; traceId: string }> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const payload = (await response.json()) as ApiEnvelope<unknown>;
  if (!response.ok || !payload.ok) {
    const traceId = "trace_id" in payload ? payload.trace_id : null;
    const code = !payload.ok ? payload.error.code : "HTTP_ERROR";
    const status = !payload.ok ? payload.error.status : response.status;
    const reason = !payload.ok ? payload.error.reason : `HTTP ${response.status}`;
    throw new ApiError(reason, code, status, traceId);
  }

  return {
    data: parse(payload.data),
    traceId: payload.trace_id,
  };
}

function withInitData(path: string, initData: string) {
  const params = new URLSearchParams({ initData });
  return `${path}?${params.toString()}`;
}

function withInitDataAndPeriod(path: string, initData: string, period: TradingPeriodTab) {
  const params = new URLSearchParams({ initData, period });
  return `${path}?${params.toString()}`;
}

export function initSession(initData: string, signal?: AbortSignal) {
  return requestJson<SessionPayload>(
    "/api/v1/auth/init",
    {
      method: "POST",
      body: JSON.stringify({ initData }),
      signal,
    },
    (data) => data as SessionPayload
  );
}

export function fetchDashboard(initData: string, signal?: AbortSignal) {
  return requestJson<DashboardPayload>(
    withInitData("/api/v1/ui/dashboard", initData),
    { method: "GET", signal },
    (data) => data as DashboardPayload
  );
}

export function fetchMoneyDetails(initData: string, signal?: AbortSignal) {
  return requestJson<MoneyDetailsPayload>(
    withInitData("/api/v1/ui/money-details", initData),
    { method: "GET", signal },
    (data) => data as MoneyDetailsPayload
  );
}

export function fetchTradingDetails(
  initData: string,
  signal: AbortSignal | undefined,
  period: TradingPeriodTab
) {
  return requestJson<TradingDetailsPayload>(
    withInitDataAndPeriod("/api/v1/ui/trading-details", initData, period),
    { method: "GET", signal },
    (data) => data as TradingDetailsPayload
  );
}

export function postTradingState(initData: string, enabled: boolean) {
  return requestJson<TradingStatePayload>(
    "/api/v1/ui/trading-state",
    {
      method: "POST",
      body: JSON.stringify({ initData, enabled }),
    },
    (data) => data as TradingStatePayload
  );
}

export function fetchFaq(initData: string, signal?: AbortSignal) {
  return requestJson<FaqPayload>(
    withInitData("/api/v1/ui/faq", initData),
    { method: "GET", signal },
    (data) => data as FaqPayload
  );
}

export function fetchAgreement(initData: string, signal?: AbortSignal) {
  return requestJson<AgreementPayload>(
    withInitData("/api/v1/ui/agreement", initData),
    { method: "GET", signal },
    (data) => data as AgreementPayload
  );
}

export function fetchNotifications(initData: string, signal?: AbortSignal) {
  return requestJson<NotificationsPayload>(
    withInitData("/api/v1/ui/notifications", initData),
    { method: "GET", signal },
    (data) => data as NotificationsPayload
  );
}

export function fetchSettings(initData: string, signal?: AbortSignal) {
  return requestJson<SettingsPayload>(
    withInitData("/api/v1/ui/settings", initData),
    { method: "GET", signal },
    (data) => data as SettingsPayload
  );
}

export function fetchWalletSeed(initData: string, signal?: AbortSignal) {
  return requestJson<WalletSeedPayload>(
    withInitData("/api/v1/ui/seed", initData),
    { method: "GET", signal },
    (data) => data as WalletSeedPayload
  );
}

export function postRecoveryClaim(initData: string, recoveryCode: string) {
  return requestJson<RecoveryClaimPayload>(
    "/api/v1/ui/recovery-claim",
    {
      method: "POST",
      body: JSON.stringify({ initData, recovery_code: recoveryCode }),
    },
    (data) => data as RecoveryClaimPayload
  );
}

export function createTopUp(initData: string, amountMinor: number) {
  return requestJson<TopUpActionPayload>(
    "/api/v1/ui/top-up",
    {
      method: "POST",
      body: JSON.stringify({
        initData,
        amount_minor: amountMinor,
      }),
    },
    (data) => data as TopUpActionPayload
  );
}

export function createWithdraw(initData: string, amountMinor: number) {
  return requestJson<WithdrawActionPayload>(
    "/api/v1/ui/withdraw",
    {
      method: "POST",
      body: JSON.stringify({
        initData,
        amount_minor: amountMinor,
      }),
    },
    (data) => data as WithdrawActionPayload
  );
}

export function confirmAction(initData: string, actionId: string) {
  return requestJson<ConfirmActionPayload>(
    "/api/v1/ui/confirm",
    {
      method: "POST",
      body: JSON.stringify({
        initData,
        action_id: actionId,
      }),
    },
    (data) => data as ConfirmActionPayload
  );
}
