import { Link, useNavigate } from "react-router-dom";

import { routes } from "../routes";
import { readWithdrawDraft, formatShortAddress } from "./withdrawDraft";
import { useWithdrawDraftGuard } from "./useWithdrawDraftGuard";

import { WithdrawAppBar, WithdrawFlowBottomNav } from "./withdrawFlowShared";
import s from "./withdrawFlowNew.module.css";

export default function WithdrawRecipientScreenNew() {
  useWithdrawDraftGuard();
  const navigate = useNavigate();
  const draft = readWithdrawDraft();

  return (
    <div className={s.screen} aria-label="Recipient">
      <WithdrawAppBar
        title="Recipient"
        onBack={() => navigate(routes.withdraw)}
        onClose={() => navigate(routes.home)}
      />

      <div className={s.body}>
        {/* Recipient address display */}
        <div className={s.recipientValue}>
          {draft ? formatShortAddress(draft.address) : ""}
        </div>

        {/* Note */}
        <p className={s.note}>
          The withdrawal process is automatic. Usually, it takes anywhere from 10 minutes to
          2-3 hours. However, as a maximum, it can take up to 7 days. The bot needs to close
          all active trades in order to withdraw the money.
        </p>
      </div>

      {/* Continue button */}
      <div className={s.bottomArea}>
        <Link to={routes.withdrawAmount} className={s.ctaBtn}>
          Continue
        </Link>
      </div>

      <WithdrawFlowBottomNav />
    </div>
  );
}
