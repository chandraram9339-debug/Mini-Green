import "../home/homeScreen.css";
import "./withdrawScreen.css";
import "./withdraw-flow.css";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { FigmaStatusBar } from "../components/FigmaStatusBar";
import { FigmaTabBar } from "../components/FigmaTabBar";
import type { StatusBarAssetUrls } from "../types/statusBarAssets";
import type { TabBarIconUrls } from "../types/tabBarIcons";
import { routes } from "../routes";
import {
  readWithdrawDraft,
  validateWithdrawAmount,
  writeWithdrawDraft,
  formatShortAddress,
  formatWithdrawFeeFootnote,
} from "./withdrawDraft";
import { useWithdrawDraftGuard } from "./useWithdrawDraftGuard";
import { useWithdrawBalanceSnapshot } from "./useWithdrawBalanceSnapshot";
import { withdrawAssets as w } from "./withdrawAssets";

function nextWithdrawRequestKey(): string {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

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

/** «1 | Amount» — node 1:3867: сумма и проверка перед подтверждением. */
export default function WithdrawAmountScreen() {
  useWithdrawDraftGuard();
  const navigate = useNavigate();
  const snap = useWithdrawBalanceSnapshot();
  const draft = readWithdrawDraft();
  const [amountStr, setAmountStr] = useState(() => (draft ? String(draft.amountUsdt) : ""));
  const [error, setError] = useState<string | null>(null);

  function parseAmountInput(s: string): number | null {
    const n = Number.parseFloat(s.replace(",", ".").trim());
    return Number.isFinite(n) ? n : null;
  }

  function continueToConfirm(): void {
    setError(null);
    if (!draft) return;
    const amt = parseAmountInput(amountStr);
    if (amt === null) {
      setError("Enter withdrawal amount.");
      return;
    }
    const err = validateWithdrawAmount(amt, snap);
    if (err) {
      setError(err);
      return;
    }
    writeWithdrawDraft({ ...draft, amountUsdt: amt, requestKey: nextWithdrawRequestKey() });
    navigate(routes.withdrawConfirm);
  }

  return (
    <main className="fm-withdraw" data-node-id="1:3867" aria-label="Withdraw amount">
      <FigmaStatusBar assets={withdrawStatusAssets} />

      <header className="fm-abs fm-withdraw-appbar">
        <div className="fm-withdraw-appbar-line">
          <img alt="" src={w.lineAppBar} />
        </div>
        <p className="fm-withdraw-appbar-title">Amount</p>
        <Link to={routes.withdrawRecipient} className="fm-withdraw-back" aria-label="Back">
          <span className="fm-withdraw-icon-btn">
            <img alt="" src={w.back} />
          </span>
        </Link>
        <Link to={routes.home} className="fm-withdraw-close" aria-label="Close">
          <span className="fm-withdraw-icon-btn">
            <img alt="" src={w.close} />
          </span>
        </Link>
      </header>

      <p className="fm-withdraw-amount-to">
        To: {draft ? formatShortAddress(draft.address) : ""}
      </p>

      <div className="fm-withdraw-field fm-withdraw-field--amount fm-withdraw-field--amount-step">
        <input
          className="fm-withdraw-amt-main fm-withdraw-input-amount"
          inputMode="decimal"
          value={amountStr}
          aria-label="Withdrawal amount"
          onChange={(e) => {
            setAmountStr(e.target.value);
            setError(null);
          }}
        />
        <span className="fm-withdraw-amt-unit">USDT</span>
      </div>

      <div className="fm-withdraw-info fm-withdraw-info--amount-step">
        <p className="fm-withdraw-info-line">
          <span className="fm-withdraw-info-muted">Current balance: </span>
          <span className="fm-withdraw-info-strong">{snap.balanceUsdt.toFixed(2)} </span>
          <span className="fm-withdraw-info-unit">USDT</span>
        </p>
        <p className="fm-withdraw-info-line">
          <span className="fm-withdraw-info-muted">Available for withdrawal*: </span>
          <span className="fm-withdraw-info-strong">{snap.availableWithdrawUsdt.toFixed(2)} </span>
          <span className="fm-withdraw-info-unit">USDT</span>
        </p>
        <p className="fm-withdraw-info-footnote">{formatWithdrawFeeFootnote(snap)}</p>
      </div>

      {error ? (
        <p className="fm-withdraw-validation-msg" role="alert">
          {error}
        </p>
      ) : null}

      <button type="button" className="fm-withdraw-cta" onClick={continueToConfirm}>
        Continue
      </button>

      <FigmaTabBar icons={withdrawTabIcons} forceActiveTab="wallet" />
    </main>
  );
}
