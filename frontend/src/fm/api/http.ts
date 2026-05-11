import { useDemoStore } from "../stores/demoStore";

const STORAGE_TOKEN_KEY = "fm_api_access_token";

export function getStoredAccessToken(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredAccessToken(token: string | null): void {
  try {
    if (token) sessionStorage.setItem(STORAGE_TOKEN_KEY, token);
    else sessionStorage.removeItem(STORAGE_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function apiUrl(path: string): string {
  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (base) return `${base}${normalized}`;
  if (import.meta.env.DEV && import.meta.env.VITE_DEV_USE_VITE_PROXY !== "false") {
    return normalized;
  }
  return normalized;
}

/** Запрос к вашему API: Bearer после логина + заголовок initData для совместимости с валидацией Telegram. */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getStoredAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const initData = window.Telegram?.WebApp?.initData;
  if (initData) headers.set("X-Telegram-Init-Data", initData);
  /** Сервер может отдавать журнал/ленту для paper-аккаунта при том же JWT. */
  if (useDemoStore.getState().isDemoMode) {
    headers.set("X-FM-Paper-Trading", "1");
  }

  return fetch(apiUrl(path), {
    ...init,
    headers,
  });
}
