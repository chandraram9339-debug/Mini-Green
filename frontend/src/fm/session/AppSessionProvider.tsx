import { useCallback, useEffect, useMemo, useState } from "react";

import { authTelegramWithInitData } from "../api/authTelegram";
import { confirmDepositPaidRequest } from "../api/confirmDeposit";
import { hasApiBase } from "../api/env";
import { fetchNotifications } from "../api/fetchNotifications";
import { fetchUiSettings } from "../api/fetchUiSettings";
import { fetchWalletSnapshot } from "../api/fetchWallet";
import { setStoredAccessToken } from "../api/http";
import { mergeWalletSnapshots } from "../api/mergeWallets";
import {
  AppSessionContext,
  type AppSessionContextValue,
  type AppSessionState,
} from "./appSessionContext";

function allowDevWithoutTelegram(): boolean {
  return import.meta.env.VITE_DEV_ALLOW_NO_TELEGRAM === "true";
}

function devBearerFallback(): string | undefined {
  const t = import.meta.env.VITE_DEV_BEARER_TOKEN?.trim();
  return t || undefined;
}

/** StrictMode-safe: один bootstrap на вкладку. */
let appSessionBootStarted = false;
const BOT_RUNNING_STORAGE_KEY = "fm.botRunning";

function readInitialBotRunning(): boolean {
  try {
    return window.localStorage.getItem(BOT_RUNNING_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function AppSessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppSessionState>({
    phase: "idle",
    mode: "mock",
    notificationUnreadCount: 0,
    botRunning: readInitialBotRunning(),
  });

  const refreshWallet = useCallback(async () => {
    if (!hasApiBase()) return;
    const initData = window.Telegram?.WebApp?.initData ?? "";
    if (!initData) {
      const bearer = devBearerFallback();
      if (bearer) setStoredAccessToken(bearer);
      else return;
    }
    try {
      const w = await fetchWalletSnapshot();
      if (w) {
        setState((s) => ({
          ...s,
          wallet: mergeWalletSnapshots(s.wallet, w) ?? s.wallet,
        }));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!hasApiBase()) {
      setState((s) => ({ ...s, notificationUnreadCount: 0 }));
      return;
    }
    const initData = window.Telegram?.WebApp?.initData ?? "";
    if (!initData) {
      const bearer = devBearerFallback();
      if (bearer) setStoredAccessToken(bearer);
      else return;
    }
    try {
      const payload = await fetchNotifications(1);
      setState((s) => ({
        ...s,
        notificationUnreadCount: payload?.unreadCount ?? 0,
      }));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(BOT_RUNNING_STORAGE_KEY, state.botRunning ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [state.botRunning]);

  useEffect(() => {
    if (state.mode === "mock") return;          // mock balance is synthetic — don't reset
    if ((state.wallet?.balanceUsdt ?? 0) > 0) return;
    if (!state.botRunning) return;
    setState((s) => ({ ...s, botRunning: false }));
  }, [state.botRunning, state.wallet?.balanceUsdt, state.mode]);

  useEffect(() => {
    const enabled = state.wallet?.botTradingEnabled;
    if (typeof enabled !== "boolean") return;
    if (state.botRunning === enabled) return;
    setState((s) => ({ ...s, botRunning: enabled }));
  }, [state.botRunning, state.wallet?.botTradingEnabled]);

  useEffect(() => {
    if (appSessionBootStarted) return;
    appSessionBootStarted = true;

    void (async () => {
      if (!hasApiBase()) {
        setState((s) => ({ ...s, phase: "ready", mode: "mock", notificationUnreadCount: 0 }));
        return;
      }

      const initData = window.Telegram?.WebApp?.initData ?? "";

      if (!initData) {
        const bearer = devBearerFallback();
        if (allowDevWithoutTelegram() && bearer) {
          setStoredAccessToken(bearer);
          setState((s) => ({ ...s, phase: "bootstrapping", mode: "live", notificationUnreadCount: 0 }));
          try {
            const [w, settings] = await Promise.all([fetchWalletSnapshot(), fetchUiSettings()]);
            setState((s) => ({ ...s, phase: "ready", mode: "live", wallet: w, uiSettings: settings ?? undefined, notificationUnreadCount: 0 }));
          } catch (e) {
            // Backend unreachable in dev mode → fall back to mock so UI stays functional
            console.warn("[AppSession] Backend unreachable, switching to mock mode:", e);
            setStoredAccessToken(null);
            setState((s) => ({ ...s, phase: "ready", mode: "mock", notificationUnreadCount: 0 }));
          }
          return;
        }
        if (allowDevWithoutTelegram()) {
          console.warn("[AppSession] No Telegram initData — mock mode (dev).");
          setState((s) => ({ ...s, phase: "ready", mode: "mock", notificationUnreadCount: 0 }));
          return;
        }
        setState({
          phase: "error",
          mode: "live",
          errorMessage: "Откройте мини-приложение из Telegram (нет initData).",
          notificationUnreadCount: 0,
          botRunning: false,
        });
        return;
      }

      setState((s) => ({ ...s, phase: "bootstrapping", mode: "live", notificationUnreadCount: 0 }));
      try {
        const { wallet: wAuth } = await authTelegramWithInitData(initData);
        const [wFetch, settings] = await Promise.all([fetchWalletSnapshot(), fetchUiSettings()]);
        const merged = mergeWalletSnapshots(wAuth, wFetch);
        setState((s) => ({ ...s, phase: "ready", mode: "live", wallet: merged, uiSettings: settings ?? undefined, notificationUnreadCount: 0 }));
      } catch (e) {
        const fallbackMock = import.meta.env.VITE_API_AUTH_FALLBACK_MOCK === "true";
        if (fallbackMock) {
          console.warn("[AppSession] Auth failed, fallback mock:", e);
          setStoredAccessToken(null);
          setState((s) => ({ ...s, phase: "ready", mode: "mock", notificationUnreadCount: 0 }));
          return;
        }
        setState({
          phase: "error",
          mode: "live",
          errorMessage: e instanceof Error ? e.message : "Auth failed",
          notificationUnreadCount: 0,
          botRunning: false,
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (!hasApiBase()) return;
    if (state.phase !== "ready") return;
    void refreshNotifications();
    const intervalId = window.setInterval(() => void refreshNotifications(), 5_000);
    return () => window.clearInterval(intervalId);
  }, [state.phase, refreshNotifications]);

  const confirmDepositPaid = useCallback(async (): Promise<boolean> => {
    if (!hasApiBase()) {
      const { verifyDepositPaidMock } = await import("../figma/top-up/verifyDepositPaidMock");
      return verifyDepositPaidMock();
    }
    const result = await confirmDepositPaidRequest();
    if (result.ok && result.walletUpdated) {
      setState((s) => {
        const next = mergeWalletSnapshots(s.wallet, result.walletUpdated);
        return {
          ...s,
          wallet: next ?? s.wallet,
        };
      });
    } else if (result.ok) {
      await refreshWallet();
    }
    if (result.ok) {
      await refreshNotifications();
    }
    return result.ok;
  }, [refreshNotifications, refreshWallet]);

  const value = useMemo<AppSessionContextValue>(
    () => ({
      ...state,
      refreshWallet,
      confirmDepositPaid,
      refreshNotifications,
      setBotRunning: (next) => setState((s) => ({ ...s, botRunning: next })),
    }),
    [state, refreshWallet, confirmDepositPaid, refreshNotifications],
  );

  return <AppSessionContext.Provider value={value}>{children}</AppSessionContext.Provider>;
}
