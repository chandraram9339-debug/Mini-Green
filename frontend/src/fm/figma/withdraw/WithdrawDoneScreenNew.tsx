import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { routes } from "../routes";
import { formatShortAddress, readWithdrawDonePayload } from "./withdrawDraft";

import { WithdrawAppBar, WithdrawFlowBottomNav, ReceiptCard } from "./withdrawFlowShared";
import s from "./withdrawFlowNew.module.css";

export default function WithdrawDoneScreenNew() {
  const navigate = useNavigate();
  const done = readWithdrawDonePayload();

  useEffect(() => {
    if (!done) navigate(routes.withdraw, { replace: true });
  }, [done, navigate]);

  const short = done ? formatShortAddress(done.address, 6, 4) : "";
  const amount = done?.amountUsdt ?? 0;
  const fee = done?.feeUsdt ?? 0;

  return (
    <div className={`${s.screen} ${s.screenDoneDark}`} aria-label="Withdrawal done">
      <WithdrawAppBar
        title="USDT Transfer"
        theme="dark"
        onBack={() => navigate(routes.home)}
        onClose={() => navigate(routes.home)}
      />

      {/* Content: receipt at top, Done! pushed to bottom */}
      <div className={s.doneBody}>
        <ReceiptCard recipient={short} amount={amount} fee={fee} />

        {/* Flex spacer pushes Done! status to bottom */}
        <div className={s.doneSpacer} />

        <div className={s.doneStatusWrap}>
          <div className={s.doneStatus}>
            {/* 52×52 mint circle with checkmark (Figma: bg-app-green) */}
            <div className={s.doneIconWrap}>
              <svg
                width="34"
                height="34"
                viewBox="0 0 52 52"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M17.334 24.9165L23.834 31.4165L36.834 18.4165"
                  stroke="white"
                  strokeWidth="3.46667"
                  strokeLinecap="square"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className={s.doneLabel}>Done!</p>
          </div>
        </div>
      </div>

      <WithdrawFlowBottomNav />
    </div>
  );
}
