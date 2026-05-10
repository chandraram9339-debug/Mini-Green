import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import { hasApiBase } from "../api/env";
import { setBotTradingState } from "../api/setBotTradingState";
import { routes } from "../figma/routes";
import { useAppSession } from "../session/useAppSession";
import { useEffectiveWalletDisplay } from "./useEffectiveWalletDisplay";

/**
 * Start/Stop бота — единая логика с {@link BotDetailScreenNew}.
 * В демо-режиме переключение только локальное (без API), баланс берётся из paper store.
 */
export function useApplyBotTradingState() {
  const navigate = useNavigate();
  const { mode, setBotRunning, refreshWallet } = useAppSession();
  const { balanceUsdt: balance, isDemoMode } = useEffectiveWalletDisplay();
  const [botSwitchLoading, setBotSwitchLoading] = useState(false);

  const applyBotState = useCallback(
    async (enabled: boolean) => {
      if (botSwitchLoading) return;
      if (balance <= 0 && enabled) {
        navigate(isDemoMode ? routes.demoTopUp : routes.depositTopUp);
        return;
      }

      if (isDemoMode) {
        setBotRunning(enabled);
        return;
      }

      if (!hasApiBase() || mode === "mock") {
        setBotRunning(enabled);
        return;
      }
      setBotSwitchLoading(true);
      try {
        const result = await setBotTradingState(enabled);
        if (!result.ok) {
          setBotRunning(enabled);
          return;
        }
        setBotRunning(result.botTradingEnabled ?? enabled);
        await refreshWallet();
      } catch {
        setBotRunning(enabled);
      } finally {
        setBotSwitchLoading(false);
      }
    },
    [balance, botSwitchLoading, isDemoMode, mode, navigate, refreshWallet, setBotRunning],
  );

  return { applyBotState, botSwitchLoading };
}
