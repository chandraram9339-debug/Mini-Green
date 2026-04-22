import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

export default function WithdrawAmountScreenNew() {
  useWithdrawDraftGuard();
  const navigate = useNavigate();
  const snap = useWithdrawBalanceSnapshot();
  const draft = readWithdrawDraft();
  const [amountStr, setAmountStr] = useState(() => (draft ? String(draft.amountUsdt) : ""));
  const [error, setError] = useState<string | null>(null);

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
    <div className={s.screen} aria-label="Withdraw amount">
      <WithdrawAppBar
        title="Amount"
        onBack={() => navigate(routes.withdrawRecipient)}
        onClose={() => navigate(routes.home)}
      />

      <div className={s.body}>
        {/* "To:" label */}
        <p className={s.toLabel}>To: {draft ? formatShortAddress(draft.address) : ""}</p>

        {/* Amount input */}
        <div className={s.inputRow}>
          <input
            className={`${s.input} ${s.inputAmount}`}
            inputMode="decimal"
            placeholder="0"
            value={amountStr}
            aria-label="Withdrawal amount"
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
            <span>Current balance: </span>
            <span className={s.balanceStrong}>{snap.balanceUsdt.toFixed(2)} </span>
            <span className={s.balanceUnit}>USDT</span>
          </p>
          <p className={s.balanceLine}>
            <span>Available for withdrawal*: </span>
            <span className={s.balanceStrong}>{snap.availableWithdrawUsdt.toFixed(2)} </span>
            <span className={s.balanceUnit}>USDT</span>
          </p>
          <p className={s.balanceFootnote}>{formatWithdrawFeeFootnote(snap)}</p>
        </div>

        {error && <p className={s.validationMsg} role="alert">{error}</p>}
      </div>

      <div className={s.bottomArea}>
        <button type="button" className={s.ctaBtn} onClick={continueToConfirm}>
          Continue
        </button>
      </div>

      <WithdrawTabBar />
    </div>
  );
}
