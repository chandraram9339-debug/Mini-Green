import "../home/homeScreen.css";
import "./withdrawScreen.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { FigmaStatusBar } from "../components/FigmaStatusBar";
import { FigmaTabBar } from "../components/FigmaTabBar";
import type { StatusBarAssetUrls } from "../types/statusBarAssets";
import type { TabBarIconUrls } from "../types/tabBarIcons";
import { useFmLocale } from "../../i18n/useFmLocale";
import type { MessageKey } from "../../i18n/messages";
import { routes } from "../routes";
import {
  validateWithdrawAmount,
  writeWithdrawDraft,
  WITHDRAW_MIN_USDT,
  formatWithdrawFeeFootnote,
} from "./withdrawDraft";
import { useWithdrawBalanceSnapshot } from "./useWithdrawBalanceSnapshot";
import { isValidTronAddress, normalizeTronAddressInput } from "./tronAddress";
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

function nextWithdrawRequestKey(): string {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function parseAmountInput(s: string): number | null {
  const n = Number.parseFloat(s.replace(",", ".").trim());
  return Number.isFinite(n) ? n : null;
}

function mapWithdrawValidationMessage(
  err: string | null,
  tr: (key: MessageKey, vars?: Record<string, string | number>) => string
): string | null {
  if (!err) return null;
  if (err === "Enter a valid amount.") return tr("withdraw.errInvalidAmountValue");
  if (err.startsWith("Minimum withdrawal")) {
    const m = err.match(/Minimum withdrawal is ([\d.]+) USDT/);
    return tr("withdraw.errMinimum", { min: m ? m[1] : WITHDRAW_MIN_USDT });
  }
  if (err === "Amount and fee exceed your balance.") return tr("withdraw.errExceedBalance");
  if (err === "Amount exceeds available for withdrawal.") return tr("withdraw.errExceedAvailable");
  return err;
}

/** Экран «1| Withdraw» — node 1:3808: адрес TRON + сумма, затем сразу «USDT Transfer». */
export default function WithdrawScreen() {
  const navigate = useNavigate();
  const { t } = useFmLocale();
  const snap = useWithdrawBalanceSnapshot();
  const [address, setAddress] = useState("");
  const [amountStr, setAmountStr] = useState("150");
  const [error, setError] = useState<string | null>(null);

  async function pasteAddress(): Promise<void> {
    try {
      const clip = await navigator.clipboard.readText();
      setAddress(normalizeTronAddressInput(clip));
      setError(null);
    } catch {
      setError(t("withdraw.errClipboard"));
    }
  }

  function continueFromForm(): void {
    setError(null);
    const trimmed = normalizeTronAddressInput(address);
    if (!isValidTronAddress(trimmed)) {
      setError(t("withdraw.errInvalidAddress"));
      return;
    }
    const amt = parseAmountInput(amountStr);
    if (amt === null) {
      setError(t("withdraw.errInvalidAmount"));
      return;
    }
    const amtErr = validateWithdrawAmount(amt, snap);
    if (amtErr) {
      setError(mapWithdrawValidationMessage(amtErr, t) ?? amtErr);
      return;
    }
    writeWithdrawDraft({ address: trimmed, amountUsdt: amt, requestKey: nextWithdrawRequestKey() });
    navigate(routes.withdrawConfirm);
  }

  return (
    <main className="fm-withdraw" data-node-id="1:3808" aria-label={t("withdraw.ariaScreen")}>
      <FigmaStatusBar assets={withdrawStatusAssets} />

      <header className="fm-abs fm-withdraw-appbar">
        <div className="fm-withdraw-appbar-line">
          <img alt="" src={w.lineAppBar} />
        </div>
        <p className="fm-withdraw-appbar-title">{t("withdraw.title")}</p>
        <button type="button" className="fm-withdraw-back" aria-label={t("common.back")} onClick={() => navigate(routes.home)}>
          <span className="fm-withdraw-icon-btn">
            <img alt="" src={w.back} />
          </span>
        </button>
        <button type="button" className="fm-withdraw-close" aria-label={t("common.close")} onClick={() => navigate(routes.home)}>
          <span className="fm-withdraw-icon-btn">
            <img alt="" src={w.close} />
          </span>
        </button>
      </header>

      <div className="fm-withdraw-field fm-withdraw-field--address">
        <input
          className="fm-withdraw-input fm-withdraw-placeholder"
          placeholder={t("withdraw.placeholderTron")}
          value={address}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => {
            setAddress(e.target.value);
            setError(null);
          }}
        />
        <button type="button" className="fm-withdraw-paste fm-withdraw-paste-btn" onClick={() => void pasteAddress()}>
          {t("common.paste")}
        </button>
        <span className="fm-withdraw-field-icon">
          <img alt="" src={w.paste} />
        </span>
      </div>

      <p className="fm-withdraw-note">{t("withdraw.noteProcess")}</p>

      <div className="fm-withdraw-field fm-withdraw-field--amount">
        <input
          className="fm-withdraw-amt-main fm-withdraw-input-amount"
          inputMode="decimal"
          placeholder="0"
          value={amountStr}
          aria-label={t("withdraw.amountAria")}
          onChange={(e) => {
            setAmountStr(e.target.value);
            setError(null);
          }}
        />
        <span className="fm-withdraw-amt-unit">USDT</span>
      </div>

      <div className="fm-withdraw-info">
        <p className="fm-withdraw-info-line">
          <span className="fm-withdraw-info-muted">{t("withdraw.currentBalance")} </span>
          <span className="fm-withdraw-info-strong">{snap.balanceUsdt.toFixed(2)} </span>
          <span className="fm-withdraw-info-unit">USDT</span>
        </p>
        <p className="fm-withdraw-info-line">
          <span className="fm-withdraw-info-muted">{t("withdraw.availableForWithdrawal")}</span>
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

      <button type="button" className="fm-withdraw-cta" onClick={continueFromForm}>
        {t("common.continue")}
      </button>

      <FigmaTabBar icons={withdrawTabIcons} />
    </main>
  );
}
