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

export interface DashboardPayload {
  screen: "dashboard";
  wallet_minor: number;
  pnl_minor: number;
  open_positions: number;
}

export interface MoneyDetailsPayload {
  screen: "money-details";
  available_minor: number;
  locked_minor: number;
  currency: string;
}

export interface TradingPosition {
  symbol: string;
  side: string;
  size_minor: number;
}

export interface TradingDetailsPayload {
  screen: "trading-details";
  positions: TradingPosition[];
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

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
      };
    };
  }
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

export function fetchTradingDetails(initData: string, signal?: AbortSignal) {
  return requestJson<TradingDetailsPayload>(
    withInitData("/api/v1/ui/trading-details", initData),
    { method: "GET", signal },
    (data) => data as TradingDetailsPayload
  );
}

export function fetchFaq(initData: string, signal?: AbortSignal) {
  return requestJson<FaqPayload>(
    withInitData("/api/v1/ui/faq", initData),
    { method: "GET", signal },
    (data) => data as FaqPayload
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
