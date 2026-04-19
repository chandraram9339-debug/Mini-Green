import { useCallback, useEffect, useMemo, useState } from "react";

import { authTelegramWithInitData } from "../api/authTelegram";
import { confirmDepositPaidRequest } from "../api/confirmDeposit";
import { hasApiBase } from "../api/env";
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

export function AppSessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppSessionState>({
    phase: "idle",
    mode: "mock",
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

  useEffect(() => {
    if (appSessionBootStarted) return;
    appSessionBootStarted = true;

    void (async () => {
      if (!hasApiBase()) {
        setState({ phase: "ready", mode: "mock" });
        return;
      }

      const initData = window.Telegram?.WebApp?.initData ?? "";

      if (!initData) {
        const bearer = devBearerFallback();
        if (allowDevWithoutTelegram() && bearer) {
          setStoredAccessToken(bearer);
          setState({ phase: "bootstrapping", mode: "live" });
          try {
            const w = await fetchWalletSnapshot();
            setState({ phase: "ready", mode: "live", wallet: w });
          } catch (e) {
            setState({
              phase: "error",
              mode: "live",
              errorMessage: e instanceof Error ? e.message : "Wallet fetch failed",
            });
          }
          return;
        }
        if (allowDevWithoutTelegram()) {
          console.warn("[AppSession] No Telegram initData — mock mode (dev).");
          setState({ phase: "ready", mode: "mock" });
          return;
        }
        setState({
          phase: "error",
          mode: "live",
          errorMessage: "Откройте мини-приложение из Telegram (нет initData).",
        });
        return;
      }

      setState({ phase: "bootstrapping", mode: "live" });
      try {
        const { wallet: wAuth } = await authTelegramWithInitData(initData);
        const wFetch = await fetchWalletSnapshot();
        const merged = mergeWalletSnapshots(wAuth, wFetch);
        setState({ phase: "ready", mode: "live", wallet: merged });
      } catch (e) {
        const fallbackMock = import.meta.env.VITE_API_AUTH_FALLBACK_MOCK === "true";
        if (fallbackMock) {
          console.warn("[AppSession] Auth failed, fallback mock:", e);
          setStoredAccessToken(null);
          setState({ phase: "ready", mode: "mock" });
          return;
        }
        setState({
          phase: "error",
          mode: "live",
          errorMessage: e instanceof Error ? e.message : "Auth failed",
        });
      }
    })();
  }, []);

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
    return result.ok;
  }, [refreshWallet]);

  const value = useMemo<AppSessionContextValue>(
    () => ({
      ...state,
      refreshWallet,
      confirmDepositPaid,
    }),
    [state, refreshWallet, confirmDepositPaid],
  );

  return <AppSessionContext.Provider value={value}>{children}</AppSessionContext.Provider>;
}
