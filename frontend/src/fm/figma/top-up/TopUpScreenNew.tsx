import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useFmLocale } from "../../i18n/useFmLocale";
import { routes } from "../routes";
import { DEPOSIT_WALLET_ADDRESS } from "../../config/deposit";
import { useAppSession } from "../../session/useAppSession";
import { useWalletDisplay } from "../useWalletDisplay";
import { formatDepositFeeFootnote } from "../withdraw/withdrawDraft";
import {
  hapticError,
  hapticLight,
  hapticSuccess,
  showMiniAppAlert,
} from "../../telegram/uiFeedback";

import s from "./topUpScreenNew.module.css";

/* ── QR URL helper (same as old screen) ──────────────────────── */
function qrImageUrl(data: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
}

/* ── AppBar ──────────────────────────────────────────────────── */
function AppBar({ title, onBack, bellBadge }: { title: string; onBack: () => void; bellBadge?: number }) {
  return (
    <header className={s.appBar}>
      <div className={s.appBarRow}>
        <button type="button" className={`${s.appBarBack} fm-appbar-hit-dark`} onClick={onBack} aria-label="Back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 12.8H20.8V11.2H20V12V12.8ZM20 12V11.2H4V12V12.8H20V12Z" fill="#ffffff" />
            <path
              d="M10 18L4 12L10 6"
              stroke="#ffffff"
              strokeWidth="1.6"
              strokeLinecap="square"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <span className={s.appBarTitle}>{title}</span>

        <div className={s.appBarIcons}>
          <Link to={routes.notifications} className={`${s.appBarBell} fm-appbar-hit-dark`} aria-label="Notifications">
            <svg width="18" height="19" viewBox="0 0 18 19" fill="none">
              <path
                d="M2 15V7C2 5.143 2.738 3.363 4.05 2.05C5.363.738 7.143 0 9 0c1.857 0 3.637.738 4.95 2.05C15.263 3.363 16 5.143 16 7v8"
                stroke="#ffffff"
                strokeWidth="1.6"
                strokeLinecap="square"
                strokeLinejoin="round"
              />
              <path
                d="M0 15H18"
                stroke="#ffffff"
                strokeWidth="1.6"
                strokeLinecap="square"
                strokeLinejoin="round"
              />
              <path
                d="M7 19H11"
                stroke="#ffffff"
                strokeWidth="1.6"
                strokeLinecap="square"
                strokeLinejoin="round"
              />
            </svg>
            {bellBadge != null && bellBadge > 0 && (
              <span className={s.appBarBellBadge}>
                <span>{bellBadge > 99 ? "99" : bellBadge}</span>
              </span>
            )}
          </Link>
          <Link to={routes.settings} className={`${s.appBarGear} fm-appbar-hit-dark`} aria-label="Settings">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 5C5.895 5 5 5.895 5 7v1.172c0 .53-.211 1.04-.586 1.414l-1 1C2.633 11.367 2.633 12.633 3.414 13.414l1 1C4.789 14.789 5 15.298 5 15.828V17c0 1.105.895 2 2 2h1.172c.53 0 1.04.211 1.414.586l1 1C11.367 21.367 12.633 21.367 13.414 20.586l1-1C14.789 19.211 15.298 19 15.828 19H17c1.105 0 2-.895 2-2v-1.172c0-.53.211-1.04.586-1.414l1-1c.781-.781.781-2.047 0-2.828l-1-1A2 2 0 0 1 19 8.172V7c0-1.105-.895-2-2-2h-1.172c-.53 0-1.04-.211-1.414-.586l-1-1C12.633 2.633 11.367 2.633 10.586 3.414l-1 1A2 2 0 0 1 8.172 5H7Z"
                stroke="#ffffff"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                stroke="#ffffff"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
      <div className={s.appBarDivider} />
    </header>
  );
}

/* ── Main Screen ─────────────────────────────────────────────── */
export default function TopUpScreenNew() {
  const navigate = useNavigate();
  const { t } = useFmLocale();
  const { wallet, confirmDepositPaid, notificationUnreadCount } = useAppSession();
  const { minDepositUsdt, depositFeeBps, depositFeeFixedUsdt } = useWalletDisplay();

  const depositAddress = wallet?.depositAddress ?? DEPOSIT_WALLET_ADDRESS;
  const depositFeeNote = formatDepositFeeFootnote({
    minDepositUsdt,
    depositFeeBps,
    depositFeeFixedUsdt,
  });

  /* QR image error fallback */
  const [qrOk, setQrOk] = useState(true);

  /* "I Paid" button loading & success states — same as old screen */
  const [paidBusy, setPaidBusy] = useState(false);
  const [paidSuccessVisible, setPaidSuccessVisible] = useState(false);

  /* Auto-hide success toast after 3 s */
  useEffect(() => {
    if (!paidSuccessVisible) return;
    const id = window.setTimeout(() => setPaidSuccessVisible(false), 3000);
    return () => window.clearTimeout(id);
  }, [paidSuccessVisible]);

  /* Copy address to clipboard */
  async function copyAddress(): Promise<void> {
    try {
      await navigator.clipboard.writeText(depositAddress);
      hapticLight();
      showMiniAppAlert(t("seed.copied"));
    } catch {
      showMiniAppAlert(t("topup.alertCopyFail"), { force: true });
    }
  }

  /* "I Paid" flow */
  async function handlePaid(): Promise<void> {
    if (paidBusy) return;
    setPaidBusy(true);
    try {
      const ok = await confirmDepositPaid();
      if (ok) {
        hapticSuccess();
        setPaidSuccessVisible(true);
      } else {
        hapticError();
        showMiniAppAlert(t("topup.alertPaidFail"), { force: true });
      }
    } finally {
      setPaidBusy(false);
    }
  }

  return (
    <div className={s.screen} aria-label={t("topup.ariaScreen")}>
      <AppBar title={t("deposit.title")} onBack={() => navigate(routes.balanceDeposit)} bellBadge={notificationUnreadCount} />

      <div className={s.body}>
        {/* Title */}
        <h1 className={s.receiveTitle}>{t("topup.title")}</h1>

        <div className={s.depositAddressTourWrap} data-tour-id="deposit-address-block">
          {/* QR Code */}
          <div className={s.qrWrap}>
            {qrOk && (
              <img
                className={s.qrImg}
                src={qrImageUrl(depositAddress)}
                width={200}
                height={200}
                alt=""
                decoding="async"
                onError={() => setQrOk(false)}
              />
            )}
          </div>

          {/* Wallet address card */}
          <div className={s.addressCard}>
            <p className={s.addressText}>{depositAddress}</p>
          </div>
        </div>

        <p className={s.feeNote} data-tour-id="deposit-fee-note">
          {depositFeeNote}
        </p>

        {/* Copy button */}
        <button
          type="button"
          className={`${s.btn} ${s.btnCopy}`}
          onClick={() => void copyAddress()}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 8H16V21H3V8Z"
              stroke="#8C8C8C"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 8V3H21V16H16"
              stroke="#8C8C8C"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{t("seed.copy")}</span>
        </button>

        {/* Paid button */}
        <button
          type="button"
          className={`${s.btn} ${s.btnPaid}`}
          disabled={paidBusy}
          aria-busy={paidBusy}
          data-tour-id="deposit-paid-button"
          onClick={() => void handlePaid()}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12L10 17L20 7"
              stroke="#191919"
              strokeWidth="2"
              strokeLinecap="square"
              strokeLinejoin="round"
            />
          </svg>
          <span>{t("topup.paid")}</span>
        </button>
      </div>

      {/* Success toast overlay */}
      {paidSuccessVisible && (
        <div className={s.successToast} aria-live="polite" aria-label={t("topup.alertPaidOk")}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M7 16L13 22L25 10"
              stroke="#0a0a0a"
              strokeWidth="2.5"
              strokeLinecap="square"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
