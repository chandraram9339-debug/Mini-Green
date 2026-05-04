import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import { hasApiBase } from "../api/env";
import { setBotTradingState } from "../api/setBotTradingState";
import { routes } from "../figma/routes";
import { useAppSession } from "../session/useAppSession";
import { useWalletDisplay } from "../figma/useWalletDisplay";

/**
 * Start/Stop бота — единая логика с {@link BotDetailScreenNew} (депозит при нуле, mock/API, refresh кошелька).
 */
export function useApplyBotTradingState() {
  const navigate = useNavigate();
  const { mode, setBotRunning, refreshWallet } = useAppSession();
  const { balanceUsdt: balance } = useWalletDisplay();
  const [botSwitchLoading, setBotSwitchLoading] = useState(false);

  const applyBotState = useCallback(
    async (enabled: boolean) => {
      if (botSwitchLoading) return;
      if (balance <= 0 && enabled) {
        navigate(routes.depositTopUp);
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
    [balance, botSwitchLoading, mode, navigate, refreshWallet, setBotRunning],
  );

  return { applyBotState, botSwitchLoading };
}
