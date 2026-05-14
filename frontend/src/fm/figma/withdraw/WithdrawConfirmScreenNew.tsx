import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createWithdrawalRequest } from "../../api/createWithdrawal";
import { hasApiBase } from "../../api/env";
import { useAppSession } from "../../session/useAppSession";
import { hapticError, hapticSuccess, showMiniAppAlert } from "../../telegram/uiFeedback";
import { routes } from "../routes";
import {
  clearWithdrawDraft,
  commissionUsdt,
  clearWithdrawDonePayload,
  formatWithdrawFeeFootnote,
  formatShortAddress,
  readWithdrawDraft,
  writeWithdrawDonePayload,
} from "./withdrawDraft";
import { useWithdrawBalanceSnapshot } from "./useWithdrawBalanceSnapshot";
import { useWithdrawDraftGuard } from "./useWithdrawDraftGuard";

import { WithdrawAppBar, WithdrawFlowBottomNav, ReceiptCard } from "./withdrawFlowShared";
import s from "./withdrawFlowNew.module.css";

export default function WithdrawConfirmScreenNew() {
  useWithdrawDraftGuard();
  const navigate = useNavigate();
  const { refreshNotifications, refreshWallet } = useAppSession();
  const [submitting, setSubmitting] = useState(false);
  const draft = readWithdrawDraft();
  const snap = useWithdrawBalanceSnapshot();

  const amount = draft?.amountUsdt ?? 0;
  const fee = commissionUsdt(amount, snap);
  const short = draft ? formatShortAddress(draft.address, 6, 4) : "";

  async function handleConfirm(): Promise<void> {
    if (!draft || submitting) return;
    setSubmitting(true);
    try {
      if (!hasApiBase()) {
        clearWithdrawDonePayload();
        writeWithdrawDonePayload({ address: draft.address, amountUsdt: draft.amountUsdt, feeUsdt: fee });
        clearWithdrawDraft();
        hapticSuccess();
        navigate(routes.withdrawDone);
        return;
      }

      const result = await createWithdrawalRequest({
        address: draft.address,
        amountUsdt: draft.amountUsdt,
        requestKey: draft.requestKey,
      });

      if (!result.ok) {
        await refreshNotifications();
        hapticError();
        showMiniAppAlert(result.error ?? "Could not create withdrawal request.", { force: true });
        return;
      }

      clearWithdrawDonePayload();
      writeWithdrawDonePayload({ address: draft.address, amountUsdt: draft.amountUsdt, feeUsdt: fee });
      clearWithdrawDraft();
      await refreshWallet();
      await refreshNotifications();
      hapticSuccess();
      navigate(routes.withdrawDone);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`${s.screen} ${s.screenTransferDark}`} aria-label="Confirm withdrawal">
      <WithdrawAppBar
        title="USDT Transfer"
        theme="dark"
        onBack={() => navigate(routes.withdraw)}
        onClose={() => navigate(routes.home)}
      />

      <div className={s.body}>
        <ReceiptCard recipient={short} amount={amount} fee={fee} />

        <p className={s.balanceFootnote} style={{ alignSelf: "flex-end" }}>
          {formatWithdrawFeeFootnote(snap)}
        </p>
      </div>

      <div className={s.bottomArea}>
        <button
          type="button"
          className={s.ctaBtn}
          disabled={submitting}
          aria-busy={submitting}
          onClick={() => void handleConfirm()}
        >
          Confirm and Send
        </button>
      </div>

      <WithdrawFlowBottomNav />
    </div>
  );
}
