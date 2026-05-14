/**
 * Shared layout components for the Withdraw flow.
 * All 5 screens (Withdraw, Recipient, Amount, Confirm, Done) import from here.
 */
import { FmSharedPillTabBar } from "../layout/FmSharedPillTabBar";
import s from "./withdrawFlowNew.module.css";

/* ── Withdraw-specific AppBar (back ← title close ×) ─────────── */
export function WithdrawAppBar({
  title,
  onBack,
  onClose,
  theme = "light",
}: {
  title: string;
  onBack?: () => void;
  onClose?: () => void;
  theme?: "light" | "dark";
}) {
  const icon = theme === "dark" ? "#ffffff" : "#55647B";
  return (
    <header className={s.appBar}>
      <div className={s.appBarRow}>
        {onBack ? (
          <button
            type="button"
            className={`${s.appBarIconBtn} ${theme === "dark" ? "fm-appbar-hit-dark" : "fm-appbar-hit-green"}`}
            onClick={onBack}
            aria-label="Back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 12.8H20.8V11.2H20V12V12.8ZM20 12V11.2H4V12V12.8H20V12Z" fill={icon}/>
              <path d="M10 18L4 12L10 6" stroke={icon} strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
            </svg>
          </button>
        ) : (
          <span className={s.appBarIconSpacer} aria-hidden="true" />
        )}

        <span className={s.appBarTitle}>{title}</span>

        {onClose ? (
          <button
            type="button"
            className={`${s.appBarIconBtn} ${theme === "dark" ? "fm-appbar-hit-dark" : "fm-appbar-hit-green"}`}
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5.5 5.5L18.5 18.5" stroke={icon} strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              <path d="M5.5 18.5L18.5 5.5" stroke={icon} strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
            </svg>
          </button>
        ) : (
          <span className={s.appBarIconSpacer} aria-hidden="true" />
        )}
      </div>
      <div className={s.appBarDivider} />
    </header>
  );
}

/**
 * Нижняя навигация как в `FmMainLayout` (`FmSharedPillTabBar`), те же отступы и ширина колонки.
 * Маршруты /withdraw* вне основного layout — док фиксируем к низу вручную.
 */
export function WithdrawFlowBottomNav() {
  return (
    <div className={s.withdrawFlowBottomDock}>
      <div className={s.withdrawFlowBottomDockInner}>
        <FmSharedPillTabBar />
      </div>
    </div>
  );
}

/* ── Receipt card (shared by Confirm + Done) ─────────────────── */
export function ReceiptCard({
  recipient,
  amount,
  fee,
}: {
  recipient: string;
  amount: number;
  fee: number;
}) {
  return (
    <div className={s.receiptCard}>
      <div className={s.receiptRow}>
        <p className={s.receiptLabel}>Recipient</p>
        <p className={s.receiptValue}>{recipient}</p>
      </div>
      <div className={s.receiptRowDivider} />
      <div className={s.receiptRow}>
        <p className={s.receiptLabel}>Amount</p>
        <p className={s.receiptValue}>
          {amount.toFixed(2)} <span className={s.receiptValueUnit}>USDT</span>
        </p>
      </div>
      <div className={s.receiptRowDivider} />
      <div className={s.receiptRow}>
        <p className={s.receiptLabel}>Commission</p>
        <p className={s.receiptValue}>
          {fee.toFixed(2)} <span className={s.receiptValueUnit}>USDT</span>
        </p>
      </div>
    </div>
  );
}
