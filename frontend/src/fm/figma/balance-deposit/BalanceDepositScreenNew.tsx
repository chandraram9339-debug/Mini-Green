/**
 * BalanceDepositScreenNew — Builder.io «Wallet / History» design port.
 *
 * UI:    100% Builder.io visual (colors, layout, card structure).
 * Data:  real API — fetchWalletHistory + useWalletDisplay.
 * Logic: useState tabs, useMemo bundle — unchanged from original.
 * Adapt: flex layout, max-width 500px, no position:absolute, safe-area TabBar.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { fetchWalletHistory } from "../../api/fetchWalletHistory";
import { hasApiBase } from "../../api/env";
import type { HistoryListRowUi, WalletHistoryBundle } from "../../api/typesHistory";
import { useWalletDisplay } from "../useWalletDisplay";
import { formatShortAddress } from "../withdraw/withdrawDraft";
import { useFmLocale } from "../../i18n/useFmLocale";
import { useAppSession } from "../../session/useAppSession";
import type { MessageKey } from "../../i18n/messages";
import { routes } from "../routes";
import { appBarLogoUrl } from "../assets/appBarShared";
import { SkeletonWalletHistoryRows } from "../../components/Skeleton/SkeletonBlock";

import s from "./balanceDepositScreenNew.module.css";

/* ── Static fallback history (same as original) ─────────────── */
type HistoryTab = "deposit" | "withdraw" | "referral";

type StaticRow = { main: string; fee: string; id: string; date: string; titleKey: MessageKey };

const HISTORY_DEPOSIT: StaticRow[] = [
  { main: "+1200.00", fee: "-163.00", id: "TR5m2....SGTF", date: "20.06.2025 13:05", titleKey: "deposit.historyReplenishment" },
  { main: "+2340.00", fee: "-311.20", id: "TC8p4....jbTa", date: "05.06.2025 15:10", titleKey: "deposit.historyReplenishment" },
  { main: "+1037.00", fee: "-141.81", id: "TA1x7....ZncP", date: "15.05.2025 14:52", titleKey: "deposit.historyReplenishment" },
  { main: "+560.00",  fee: "-79.80",  id: "TY6d3....x9bc", date: "14.05.2025 09:20", titleKey: "deposit.historyReplenishment" },
  { main: "+100.00",  fee: "-20.00",  id: "TH2q9....YicH", date: "10.05.2025 13:21", titleKey: "deposit.historyReplenishment" },
];

const HISTORY_WITHDRAW: StaticRow[] = [
  { main: "-500.00",  fee: "-5.00",  id: "TR7a8....9xK2", date: "18.06.2025 11:00", titleKey: "deposit.historyWithdrawal" },
  { main: "-1200.00", fee: "-12.00", id: "TA9m4....2Lm8", date: "12.06.2025 09:30", titleKey: "deposit.historyWithdrawal" },
  { main: "-750.50",  fee: "-7.50",  id: "TX4p1....3Np6", date: "02.06.2025 16:45", titleKey: "deposit.historyWithdrawal" },
  { main: "-1800.98", fee: "-18.00", id: "TD2k6....4Qr1", date: "28.05.2025 08:15", titleKey: "deposit.historyWithdrawal" },
];

const HISTORY_REFERRAL: StaticRow[] = [
  { main: "+45.00",  fee: "—", id: "User ID 1234...789", date: "19.06.2025 10:00", titleKey: "deposit.historyReferralBonus" },
  { main: "+120.50", fee: "—", id: "User ID 4567...123", date: "10.06.2025 14:20", titleKey: "deposit.historyReferralBonus" },
  { main: "+33.12",  fee: "—", id: "User ID 9087...654", date: "01.06.2025 18:00", titleKey: "deposit.historyReferralBonus" },
];

function staticBundle(): WalletHistoryBundle {
  const toRows = (rows: StaticRow[]): HistoryListRowUi[] =>
    rows.map((r) => ({ main: r.main, fee: r.fee, id: r.id, date: r.date, title: "", i18nTitleKey: r.titleKey }));
  return {
    deposit:  { rows: toRows(HISTORY_DEPOSIT),  totalAmount: 5237,   count: 5 },
    withdraw: { rows: toRows(HISTORY_WITHDRAW), totalAmount: 4250.98, count: 4 },
    referral: { rows: toRows(HISTORY_REFERRAL), totalAmount: 603.22,  count: 8 },
  };
}

/* Empty bundle — shown while the API request is in flight */
function emptyBundle(): WalletHistoryBundle {
  return {
    deposit:  { rows: [], totalAmount: 0, count: 0 },
    withdraw: { rows: [], totalAmount: 0, count: 0 },
    referral: { rows: [], totalAmount: 0, count: 0 },
  };
}

/* ── SVG icons (inlined from Builder.io) ────────────────────── */
function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 8L12 8" stroke="#131413" strokeLinecap="square" strokeLinejoin="round" />
      <path d="M8 12L8 4" stroke="#131413" strokeLinecap="square" strokeLinejoin="round" />
    </svg>
  );
}
function IconMinus() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 8H12" stroke="#131413" strokeLinecap="square" strokeLinejoin="round" />
    </svg>
  );
}
function IconReferral() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M7.99967 10.6663C9.47243 10.6663 10.6663 9.47243 10.6663 7.99967C10.6663 6.52692 9.47243 5.33301 7.99967 5.33301C6.52692 5.33301 5.33301 6.52692 5.33301 7.99967C5.33301 9.47243 6.52692 10.6663 7.99967 10.6663Z"
        stroke="#131413"
        strokeWidth="1.06667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.6667 5.99982V7.99982C10.6667 9.47315 11.4133 10.6665 12.3333 10.6665C13.2533 10.6665 14 9.47315 14 7.99982C13.9998 6.69525 13.5743 5.4263 12.7882 4.38522C12.002 3.34415 10.8979 2.58766 9.64323 2.23038C8.38854 1.8731 7.05159 1.93448 5.83491 2.40523C4.61824 2.87599 3.58814 3.73046 2.90068 4.83919C2.21322 5.94793 1.90585 7.25052 2.02514 8.54963C2.14444 9.84873 2.68389 11.0736 3.56177 12.0386C4.43966 13.0036 5.60814 13.6561 6.8902 13.8974C8.17226 14.1387 9.49803 13.9556 10.6667 13.3758"
        stroke="#131413"
        strokeWidth="1.06667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ArrowUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M7.5 13.333V13.833H8.5V13.333H8H7.5ZM8 13.333H8.5V2.667H8H7.5L7.5 13.333H8Z" fill="white" />
      <path d="M4 6.667L8 2.667L12 6.667" stroke="white" strokeLinecap="square" strokeLinejoin="round" />
    </svg>
  );
}
function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8.5 2.667V2.167H7.5V2.667H8H8.5ZM8 2.667H7.5L7.5 13.333H8H8.5L8.5 2.667H8Z" fill="white" />
      <path d="M12 9.333L8 13.333L4 9.333" stroke="white" strokeLinecap="square" strokeLinejoin="round" />
    </svg>
  );
}

/* ── AppBar ──────────────────────────────────────────────────── */
function AppBar({ bellBadge }: { bellBadge?: number }) {
  const navigate = useNavigate();
  return (
    <header className={s.appBar}>
      <div className={s.appBarRow}>
        <button type="button" className={`${s.appBarBack} fm-appbar-hit-green`} onClick={() => navigate(routes.home)} aria-label="Back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 12.8H20.8V11.2H20V12V12.8ZM20 12V11.2H4V12V12.8H20V12Z" fill="#0A0A0A" />
            <path d="M10 18L4 12L10 6" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
          </svg>
        </button>

        <div className={`${s.appBarLogo} app-bar-logo-shimmer app-bar-logo-wordmark`} aria-label="Palladium">
          <img src={appBarLogoUrl} alt="Palladium" />
        </div>

        <div className={s.appBarIcons}>
          <Link to={routes.notifications} className={`${s.appBarBell} fm-appbar-hit-green`} aria-label="Notifications">
            <svg width="18" height="19" viewBox="0 0 18 19" fill="none">
              <path d="M2 15V7C2 5.143 2.738 3.363 4.05 2.05C5.363.738 7.143 0 9 0c1.857 0 3.637.738 4.95 2.05C15.263 3.363 16 5.143 16 7v8" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
              <path d="M0 15H18" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
              <path d="M7 19H11" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
            </svg>
            {bellBadge != null && bellBadge > 0 && (
              <span className={s.appBarBellBadge}><span>{bellBadge > 99 ? "99" : bellBadge}</span></span>
            )}
          </Link>
          <Link to={routes.settings} className={`${s.appBarGear} fm-appbar-hit-green`} aria-label="Settings">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7 5C5.895 5 5 5.895 5 7v1.172c0 .53-.211 1.04-.586 1.414l-1 1C2.633 11.367 2.633 12.633 3.414 13.414l1 1C4.789 14.789 5 15.298 5 15.828V17c0 1.105.895 2 2 2h1.172c.53 0 1.04.211 1.414.586l1 1C11.367 21.367 12.633 21.367 13.414 20.586l1-1C14.789 19.211 15.298 19 15.828 19H17c1.105 0 2-.895 2-2v-1.172c0-.53.211-1.04.586-1.414l1-1c.781-.781.781-2.047 0-2.828l-1-1A2 2 0 0 1 19 8.172V7c0-1.105-.895-2-2-2h-1.172c-.53 0-1.04-.211-1.414-.586l-1-1C12.633 2.633 11.367 2.633 10.586 3.414l-1 1A2 2 0 0 1 8.172 5H7Z" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
      <div className={s.appBarDivider} />
    </header>
  );
}

/* ── Summary Tab Card ────────────────────────────────────────── */
type TabConfig = {
  id: HistoryTab;
  title: string;
  totalLabel: string;
  countLabel: string;
  countUnit: string;
};

const TAB_META: TabConfig[] = [
  { id: "deposit",  title: "Deposit",  totalLabel: "Total deposited amount:",   countLabel: "Number of deposits made:",       countUnit: "Times" },
  { id: "withdraw", title: "Withdraw", totalLabel: "Total withdrawal amount:",  countLabel: "Number of withdrawals:",          countUnit: "Times" },
  { id: "referral", title: "Referral", totalLabel: "Bonuses received from:",   countLabel: "Total number of invited users:",  countUnit: "People" },
];

interface TabCardProps {
  meta: TabConfig;
  totalAmount: number;
  count: number;
  isActive: boolean;
  onSelect: () => void;
}

function TabCard({ meta, totalAmount, count, isActive, onSelect }: TabCardProps) {
  return (
    <button
      className={`${s.tabCard} ${isActive ? s.tabCardActive : s.tabCardInactive} fm-interactive-pill`}
      onClick={onSelect}
      aria-pressed={isActive}
    >
      <div className={s.tabCardTop}>
        <span className={`${s.tabCardTitle} ${isActive ? s.tabCardTitleActive : s.tabCardTitleInactive}`}>
          {meta.title}
        </span>
        <div className={s.tabCardTotalBlock}>
          <span className={s.tabCardCaption}>{meta.totalLabel}</span>
          <div className={s.tabCardAmtRow}>
            <span className={s.tabCardAmt}>{totalAmount.toFixed(2)}</span>
            <span className={s.tabCardAmtUnit}>USDT</span>
          </div>
        </div>
      </div>

      <div className={s.tabCardBottom}>
        <div className={s.tabCardCountBlock}>
          <span className={s.tabCardCountCaption}>{meta.countLabel}</span>
          <div className={s.tabCardCountRow}>
            <span className={s.tabCardCountNum}>{count}</span>
            <span className={s.tabCardCountUnit}>{meta.countUnit}</span>
          </div>
        </div>

        <span
          className={`${s.tabCardArrow} ${isActive ? s.tabCardArrowActive : s.tabCardArrowInactive}`}
          aria-hidden="true"
        >
          {isActive ? <ArrowUpIcon /> : <ArrowRightIcon />}
        </span>
      </div>
    </button>
  );
}

/* ── Transaction Row ─────────────────────────────────────────── */
interface RowProps {
  row: HistoryListRowUi;
  tab: HistoryTab;
  t: (key: MessageKey) => string;
  metaLabel: string;
}

function TransactionRow({ row, tab, t, metaLabel }: RowProps) {
  const iconClass = tab === "deposit" ? s.rowIconDeposit : tab === "withdraw" ? s.rowIconWithdraw : s.rowIconReferral;
  return (
    <li className={`${s.listItem} ${tab === "referral" ? s.listItemReferral : ""}`}>
      <div className={`${s.rowIcon} ${iconClass}`}>
        {tab === "deposit" ? <IconPlus /> : tab === "withdraw" ? <IconMinus /> : <IconReferral />}
      </div>

      <div className={s.rowText}>
        <span className={s.rowTitle}>
          {row.i18nTitleKey ? t(row.i18nTitleKey as MessageKey) : row.title}
        </span>
        <p className={s.rowMeta}>{metaLabel}</p>
        <p className={s.rowMeta}>{row.id}</p>
      </div>

      <div className={s.rowSide}>
        <div className={s.rowAmtRow}>
          <span className={s.rowAmt}>{row.main}</span>
          <span className={s.rowUnit}>USDT</span>
        </div>
        {row.fee !== "—" ? (
          <div className={s.rowAmtRow}>
            <span className={s.rowFee}>{row.fee}</span>
            <span className={s.rowUnit}>USDT</span>
          </div>
        ) : (
          <span className={s.rowFee}>{row.fee}</span>
        )}
        <p className={s.rowDate}>{row.date}</p>
      </div>
    </li>
  );
}

/* ── Main Screen ─────────────────────────────────────────────── */
export default function BalanceDepositScreenNew() {
  const { t } = useFmLocale();
  const { notificationUnreadCount } = useAppSession();
  const { balanceUsdt, depositAddress } = useWalletDisplay();
  const [tab, setTab] = useState<HistoryTab>("deposit");
  const [apiHistory, setApiHistory] = useState<WalletHistoryBundle | null>(null);
  // Start in loading state when API is available — prevents flash of fake data
  const [historyLoading, setHistoryLoading] = useState(() => hasApiBase());

  useEffect(() => {
    if (!hasApiBase()) return;
    let cancelled = false;
    void (async () => {
      setHistoryLoading(true);
      try {
        const h = await fetchWalletHistory();
        if (!cancelled && h) setApiHistory(h);
      } catch { /* keep empty */ }
      finally { if (!cancelled) setHistoryLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const bundle = useMemo(() => {
    // While API request is in flight → show zeros (no fake mockup flash)
    if (historyLoading && apiHistory === null) return emptyBundle();
    // API returned data → use it
    if (apiHistory) return apiHistory;
    // No API (dev/mock mode) → show static demo data
    return staticBundle();
  }, [apiHistory, historyLoading]);
  const tabBundle = useMemo(() => {
    if (tab === "withdraw") return bundle.withdraw;
    if (tab === "referral") return bundle.referral;
    return bundle.deposit;
  }, [tab, bundle]);

  const metaLabel =
    tab === "referral" ? t("deposit.metaReferralUser") : t("deposit.metaCommission");

  return (
    <div className={s.page}>
      <div className={s.container}>
        <header className={s.header}>
          <div className={s.headerBlobs} aria-hidden="true">
            <div className={s.blobTopLeft} />
            <div className={s.blobBottomRight} />
          </div>

          {/* AppBar */}
          <AppBar bellBadge={notificationUnreadCount} />

          {/* Balance */}
          <section className={s.balanceSection} aria-label={t("deposit.balanceAria")}>
            <div className={s.balanceInfo} data-tour-id="wallet-total-balance">
              <p className={s.balanceTitle}>{t("wallet.currentBalance")}</p>
              <div className={s.balanceAmtRow}>
                <span className={s.balanceAmt}>{balanceUsdt.toFixed(2)}</span>
                <span className={s.balanceUnit}>USDT</span>
              </div>
              <p className={s.balanceAddr}>{formatShortAddress(depositAddress, 6, 6)}</p>
            </div>

            <div className={s.actionRow}>
              <Link to={routes.depositTopUp} className={`${s.btnTopUp} fm-interactive-pill`} data-tour-id="wallet-top-up">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 6V18" stroke="#191919" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
                  <path d="M6 12H18" stroke="#191919" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
                </svg>
                <span className={s.btnLabel}>{t("home.topUp")}</span>
              </Link>
              <Link
                to={routes.withdraw}
                className={`${s.btnWithdraw} fm-interactive-pill`}
                data-tour-id="wallet-withdraw"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M11.35 18V18.65H12.65V18H12H11.35ZM12 18H12.65V6H12H11.35V18H12Z" fill="white" />
                  <path d="M7.5 10.5L12 6L16.5 10.5" stroke="white" strokeWidth="1.3" strokeLinecap="square" strokeLinejoin="round" />
                </svg>
                <span className={s.btnLabel}>{t("home.withdraw")}</span>
              </Link>
            </div>
          </section>
        </header>

        {/* Scrollable content */}
        <div className={s.body}>
          {/* History: tabs + list */}
          <div className={s.historySection} aria-label={t("deposit.historyAria")} data-tour-id="wallet-details-history">
            {/* Summary tab cards */}
            <div className={s.tabsRow} role="tablist">
              {TAB_META.map((meta) => (
                <TabCard
                  key={meta.id}
                  meta={meta}
                  totalAmount={bundle[meta.id].totalAmount}
                  count={bundle[meta.id].count}
                  isActive={tab === meta.id}
                  onSelect={() => setTab(meta.id)}
                />
              ))}
            </div>

            {/* Transaction list */}
            {historyLoading && hasApiBase() && !apiHistory ? (
              <div className={s.historyLoadingBlock} role="status" aria-label={t("common.loading")}>
                <SkeletonWalletHistoryRows count={6} />
              </div>
            ) : null}

            <ul className={s.list} aria-label="Transaction history">
              {tabBundle.rows.map((row, i) => (
                <TransactionRow
                  key={`${row.date}-${row.id}-${i}`}
                  row={row}
                  tab={tab}
                  t={t}
                  metaLabel={metaLabel}
                />
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
