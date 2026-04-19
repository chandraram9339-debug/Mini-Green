import "../home/homeScreen.css";
import "./withdrawScreen.css";
import "./withdraw-flow.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createWithdrawalRequest } from "../../api/createWithdrawal";
import { hasApiBase } from "../../api/env";
import { useAppSession } from "../../session/useAppSession";
import { FigmaStatusBar } from "../components/FigmaStatusBar";
import { FigmaTabBar } from "../components/FigmaTabBar";
import type { StatusBarAssetUrls } from "../types/statusBarAssets";
import type { TabBarIconUrls } from "../types/tabBarIcons";
import { routes } from "../routes";
import {
  clearWithdrawDraft,
  commissionUsdt,
  formatShortAddress,
  readWithdrawDraft,
} from "./withdrawDraft";
import { useWithdrawDraftGuard } from "./useWithdrawDraftGuard";
import { withdrawAssets as w } from "./withdrawAssets";

const withdrawStatusAssets: StatusBarAssetUrls = {
  networkSignalLight: w.networkSignalLight,
  wifiSignalLight: w.wifiSignalLight,
  batteryLight: w.batteryLight,
  indicator: w.indicator,
  time941: w.time941,
};

const withdrawTabIcons: TabBarIconUrls = {
  home: w.tabHome,
  wallet: w.tabWallet,
  bot: w.tabBot,
  support: w.tabSupport,
};

function withdrawNotify(message: string, then?: () => void): void {
  const tg = window.Telegram?.WebApp;
  if (tg?.showAlert) tg.showAlert(message, then);
  else {
    window.alert(message);
    then?.();
  }
}

/** «1| Confirm» — node 1:3883: адрес, сумма, комиссия; ТЗ — алерт и главная. */
export default function WithdrawConfirmScreen() {
  useWithdrawDraftGuard();
  const navigate = useNavigate();
  const { refreshWallet } = useAppSession();
  const [submitting, setSubmitting] = useState(false);
  const draft = readWithdrawDraft();

  const amount = draft?.amountUsdt ?? 0;
  const fee = commissionUsdt(amount);
  const short = draft ? formatShortAddress(draft.address, 6, 4) : "";

  async function handleConfirm(): Promise<void> {
    if (!draft) return;
    setSubmitting(true);
    try {
      if (!hasApiBase()) {
        clearWithdrawDraft();
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");
        withdrawNotify("Withdrawal request created.", () => navigate(routes.home));
        return;
      }

      const result = await createWithdrawalRequest({
        address: draft.address,
        amountUsdt: draft.amountUsdt,
      });

      if (!result.ok) {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("error");
        withdrawNotify(result.error ?? "Could not create withdrawal request.");
        return;
      }

      clearWithdrawDraft();
      await refreshWallet();
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");
      withdrawNotify("Withdrawal request created.", () => navigate(routes.home));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="fm-withdraw" data-node-id="1:3883" aria-label="Confirm withdrawal">
      <FigmaStatusBar assets={withdrawStatusAssets} />

      <header className="fm-abs fm-withdraw-appbar">
        <div className="fm-withdraw-appbar-line">
          <img alt="" src={w.lineAppBar} />
        </div>
        <p className="fm-withdraw-appbar-title">USDT Transfer</p>
        <button type="button" className="fm-withdraw-back" aria-label="Back" onClick={() => navigate(routes.withdrawAmount)}>
          <span className="fm-withdraw-icon-btn">
            <img alt="" src={w.back} />
          </span>
        </button>
        <button type="button" className="fm-withdraw-close" aria-label="Close" onClick={() => navigate(routes.home)}>
          <span className="fm-withdraw-icon-btn">
            <img alt="" src={w.close} />
          </span>
        </button>
      </header>

      <div className="fm-transfer-cheque">
        <div className="fm-transfer-row">
          <p className="fm-transfer-label">Recipient</p>
          <p className="fm-transfer-value">{short}</p>
        </div>
        <div className="fm-transfer-row">
          <p className="fm-transfer-label">Amount</p>
          <p className="fm-transfer-value">
            {amount.toFixed(2)} <span className="fm-transfer-value-unit">USDT</span>
          </p>
        </div>
        <div className="fm-transfer-row">
          <p className="fm-transfer-label">Commission</p>
          <p className="fm-transfer-value">
            {fee.toFixed(2)} <span className="fm-transfer-value-unit">USDT</span>
          </p>
        </div>
      </div>

      <p className="fm-transfer-footnote">
        *The commission is charged from the remaining balance. We charge a 10% fee on withdrawals.
      </p>

      <button
        type="button"
        className="fm-withdraw-cta"
        disabled={submitting}
        aria-busy={submitting}
        onClick={() => void handleConfirm()}
      >
        Confirm and Send
      </button>

      <FigmaTabBar icons={withdrawTabIcons} forceActiveTab="wallet" />
    </main>
  );
}
