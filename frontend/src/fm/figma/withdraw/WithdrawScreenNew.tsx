import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useFmLocale } from "../../i18n/useFmLocale";
import { routes } from "../routes";
import {
  validateWithdrawAmount,
  writeWithdrawDraft,
  WITHDRAW_MIN_USDT,
  formatWithdrawFeeFootnote,
} from "./withdrawDraft";
import { useWithdrawBalanceSnapshot } from "./useWithdrawBalanceSnapshot";
import { isValidTronAddress, normalizeTronAddressInput } from "./tronAddress";
import type { MessageKey } from "../../i18n/messages";

import { WithdrawAppBar, WithdrawTabBar } from "./withdrawFlowShared";
import s from "./withdrawFlowNew.module.css";

function nextWithdrawRequestKey(): string {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function parseAmountInput(str: string): number | null {
  const n = Number.parseFloat(str.replace(",", ".").trim());
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

export default function WithdrawScreenNew() {
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
    <div className={s.screen} aria-label={t("withdraw.ariaScreen")}>
      <WithdrawAppBar
        title={t("withdraw.title")}
        onBack={() => navigate(routes.home)}
        onClose={() => navigate(routes.home)}
      />

      <div className={s.body}>
        {/* Address input */}
        <div className={s.inputRow}>
          <input
            className={s.input}
            placeholder={t("withdraw.placeholderTron")}
            value={address}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => {
              setAddress(e.target.value);
              setError(null);
            }}
          />
          {/* Scan icon */}
          <button className={s.appBarIconBtn} type="button" aria-label="Scan QR">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 16V20H21V16" stroke="#759AC6" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round"/>
              <path d="M3 8V4H21V8" stroke="#759AC6" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round"/>
              <path d="M3 12H21" stroke="#759AC6" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className={s.inputBtnText} type="button" onClick={() => void pasteAddress()}>
            {t("common.paste")}
          </button>
        </div>

        {/* Note */}
        <p className={s.note}>{t("withdraw.noteProcess")}</p>

        {/* Amount input */}
        <div className={s.inputRow}>
          <input
            className={`${s.input} ${s.inputAmount}`}
            inputMode="decimal"
            placeholder="0"
            value={amountStr}
            aria-label={t("withdraw.amountAria")}
            onChange={(e) => {
              setAmountStr(e.target.value);
              setError(null);
            }}
          />
          <span className={s.inputUnit}>USDT</span>
        </div>

        {/* Balance info */}
        <div className={s.balanceBlock}>
          <p className={s.balanceLine}>
            <span>{t("withdraw.currentBalance")} </span>
            <span className={s.balanceStrong}>{snap.balanceUsdt.toFixed(2)} </span>
            <span className={s.balanceUnit}>USDT</span>
          </p>
          <p className={s.balanceLine}>
            <span>{t("withdraw.availableForWithdrawal")}</span>
            <span className={s.balanceStrong}>{snap.availableWithdrawUsdt.toFixed(2)} </span>
            <span className={s.balanceUnit}>USDT</span>
          </p>
          <p className={s.balanceFootnote}>{formatWithdrawFeeFootnote(snap)}</p>
        </div>

        {/* Validation error */}
        {error && (
          <p className={s.validationMsg} role="alert">{error}</p>
        )}
      </div>

      {/* Continue button */}
      <div className={s.bottomArea}>
        <button type="button" className={s.ctaBtn} onClick={continueFromForm}>
          {t("common.continue")}
        </button>
      </div>

      <WithdrawTabBar />
    </div>
  );
}
