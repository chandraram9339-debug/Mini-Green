/* Локальный CSS после homeScreen — переопределения `.fm-abs` для истории (left: 20px) должны побеждать */
import "../home/homeScreen.css";
import "./balanceDepositScreen.css";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { fetchWalletHistory } from "../../api/fetchWalletHistory";
import { hasApiBase } from "../../api/env";
import type { HistoryListRowUi, WalletHistoryBundle } from "../../api/typesHistory";
import { FigmaAppBar } from "../components/FigmaAppBar";
import { FigmaStatusBar } from "../components/FigmaStatusBar";
import { FigmaTabBar } from "../components/FigmaTabBar";
import type { StatusBarAssetUrls } from "../types/statusBarAssets";
import type { TabBarIconUrls } from "../types/tabBarIcons";
import { useFmLocale } from "../../i18n/useFmLocale";
import type { MessageKey } from "../../i18n/messages";
import { defaultAppBarAssetUrls } from "../assets/appBarShared";
import { routes } from "../routes";
import { useWalletDisplay } from "../useWalletDisplay";
import { formatShortAddress } from "../withdraw/withdrawDraft";
import { depositAssets } from "./depositAssets";

const depositStatusAssets: StatusBarAssetUrls = {
  networkSignalLight: depositAssets.networkSignalLight,
  wifiSignalLight: depositAssets.wifiSignalLight,
  batteryLight: depositAssets.batteryLight,
  indicator: depositAssets.indicator,
  time941: depositAssets.time941,
};

const depositTabIcons: TabBarIconUrls = {
  home: depositAssets.group4,
  wallet: depositAssets.group5,
  bot: depositAssets.group6,
  support: depositAssets.group7,
};

type HistoryTab = "deposit" | "withdraw" | "referral";

type DepositHistoryRow = {
  main: string;
  fee: string;
  id: string;
  date: string;
  titleKey: MessageKey;
};

const HISTORY_DEPOSIT: DepositHistoryRow[] = [
  {
    main: "+1200.00",
    fee: "-163.00",
    id: "TQBw8....SGTF",
    date: "20.06.2025 13:05",
    titleKey: "deposit.historyReplenishment",
  },
  {
    main: "+2340.00",
    fee: "-311.20",
    id: "TfcD....jbTa",
    date: "05.06.2025 15:10",
    titleKey: "deposit.historyReplenishment",
  },
  {
    main: "+1037.00",
    fee: "-141.81",
    id: "TNem....ZncP",
    date: "15.05.2025 14:52",
    titleKey: "deposit.historyReplenishment",
  },
  {
    main: "+560.00",
    fee: "-79.80",
    id: "TSd5f....x9bc",
    date: "14.05.2025 09:20",
    titleKey: "deposit.historyReplenishment",
  },
  {
    main: "+100.00",
    fee: "-20.00",
    id: "T7pZ....YicH",
    date: "10.05.2025 13:21",
    titleKey: "deposit.historyReplenishment",
  },
];

const HISTORY_WITHDRAW: DepositHistoryRow[] = [
  {
    main: "-500.00",
    fee: "-5.00",
    id: "TWdr....a9xK",
    date: "18.06.2025 11:00",
    titleKey: "deposit.historyWithdrawal",
  },
  {
    main: "-1200.00",
    fee: "-12.00",
    id: "TWdr....b2Lm",
    date: "12.06.2025 09:30",
    titleKey: "deposit.historyWithdrawal",
  },
  {
    main: "-750.50",
    fee: "-7.50",
    id: "TWdr....c3Np",
    date: "02.06.2025 16:45",
    titleKey: "deposit.historyWithdrawal",
  },
  {
    main: "-1800.98",
    fee: "-18.00",
    id: "TWdr....d4Qr",
    date: "28.05.2025 08:15",
    titleKey: "deposit.historyWithdrawal",
  },
];

const HISTORY_REFERRAL: DepositHistoryRow[] = [
  {
    main: "+45.00",
    fee: "—",
    id: "Ref....01",
    date: "19.06.2025 10:00",
    titleKey: "deposit.historyReferralBonus",
  },
  {
    main: "+120.50",
    fee: "—",
    id: "Ref....02",
    date: "10.06.2025 14:20",
    titleKey: "deposit.historyReferralBonus",
  },
  {
    main: "+33.12",
    fee: "—",
    id: "Ref....03",
    date: "01.06.2025 18:00",
    titleKey: "deposit.historyReferralBonus",
  },
];

function staticHistoryBundle(): WalletHistoryBundle {
  const fromDeposit = (rows: DepositHistoryRow[]): HistoryListRowUi[] =>
    rows.map((r) => ({
      main: r.main,
      fee: r.fee,
      id: r.id,
      date: r.date,
      title: "",
      i18nTitleKey: r.titleKey,
    }));
  return {
    deposit: { rows: fromDeposit(HISTORY_DEPOSIT), totalAmount: 5237, count: 5 },
    withdraw: { rows: fromDeposit(HISTORY_WITHDRAW), totalAmount: 4250.98, count: 4 },
    referral: { rows: fromDeposit(HISTORY_REFERRAL), totalAmount: 603.22, count: 8 },
  };
}

/** Экран «Detail Balance | Deposit» — node 1:3675, см. `screen-detail-balance-deposit__assembly.json`. */
export default function BalanceDepositScreen() {
  const { t } = useFmLocale();
  const { balanceUsdt, depositAddress } = useWalletDisplay();
  const [tab, setTab] = useState<HistoryTab>("deposit");
  const [apiHistory, setApiHistory] = useState<WalletHistoryBundle | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!hasApiBase()) return;
    let cancelled = false;
    void (async () => {
      setHistoryLoading(true);
      try {
        const h = await fetchWalletHistory();
        if (!cancelled && h) setApiHistory(h);
      } catch {
        /* keep static */
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const bundle = useMemo(() => apiHistory ?? staticHistoryBundle(), [apiHistory]);

  const tabBundle = useMemo(() => {
    if (tab === "withdraw") return bundle.withdraw;
    if (tab === "referral") return bundle.referral;
    return bundle.deposit;
  }, [tab, bundle]);

  const rows = tabBundle.rows;

  const metaLabel =
    tab === "deposit" || tab === "withdraw" ? t("deposit.metaCommission") : t("deposit.metaBonus");

  const historyRowIcon =
    tab === "withdraw"
      ? depositAssets.rowIconMinus
      : tab === "referral"
        ? depositAssets.rowIconAt
        : depositAssets.rowIconPlus;

  const historyRowIconMod =
    tab === "withdraw"
      ? "fm-deposit-row-icon--withdraw"
      : tab === "referral"
        ? "fm-deposit-row-icon--referral"
        : "fm-deposit-row-icon--deposit";

  return (
    <main className="fm-deposit" data-node-id="1:3675" aria-label={t("deposit.ariaScreen")}>
      <FigmaStatusBar assets={depositStatusAssets} />

      <FigmaAppBar assets={defaultAppBarAssetUrls} backTo={routes.home} />

      {/* Status 44px + App bar 56px — абсолютные слои не участвуют в потоке; якорь для отступов как в макете (y 130). */}
      <div className="fm-deposit-chrome-spacer" aria-hidden="true" />

      <section className="fm-deposit-balance" aria-label={t("deposit.balanceAria")}>
        <div className="fm-deposit-balance-copy">
          <p className="fm-deposit-balance-title">{t("wallet.currentBalance")}</p>
          <div className="fm-deposit-balance-amt">
            <strong>{balanceUsdt.toFixed(2)}</strong>
            <span className="fm-deposit-u">USDT</span>
          </div>
          <p className="fm-deposit-balance-addr">{formatShortAddress(depositAddress, 6, 6)}</p>
        </div>

        <Link to={routes.depositTopUp} className="fm-deposit-act fm-deposit-act--topup">
          <span className="fm-deposit-act-icon-wrap">
            <img alt="" src={depositAssets.group11} />
          </span>
          {t("home.topUp")}
        </Link>

        <Link to={routes.withdraw} className="fm-deposit-act fm-deposit-act--withdraw">
          <span className="fm-deposit-act-icon-wrap">
            <img alt="" src={depositAssets.group10} />
          </span>
          {t("home.withdraw")}
        </Link>
      </section>

      <section className="fm-deposit-history" aria-label={t("deposit.historyAria")}>
        <div className="fm-deposit-history-tabs" role="tablist" aria-label={t("deposit.historyTabsAria")}>
          <article
            role="tab"
            aria-selected={tab === "deposit"}
            tabIndex={0}
            className={`fm-deposit-tab${tab === "deposit" ? " fm-deposit-tab--active" : " fm-deposit-tab--muted"}`}
            onClick={() => setTab("deposit")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setTab("deposit");
              }
            }}
          >
            <p className={`fm-deposit-tab-label${tab === "deposit" ? " fm-deposit-tab-label--deposit" : ""}`}>
              {t("deposit.tab")}
            </p>
            <div className="fm-deposit-tab-block fm-deposit-tab-block--total">
              <p className="fm-deposit-tab-caption">{t("deposit.totalDeposited")}</p>
              <div className="fm-deposit-tab-amt">
                <span className="fm-deposit-tab-num">{bundle.deposit.totalAmount.toFixed(2)}</span>
                <span className="fm-deposit-tab-unit">USDT</span>
              </div>
            </div>
            <div className="fm-deposit-tab-block fm-deposit-tab-block--count">
              <p className="fm-deposit-tab-caption fm-deposit-tab-caption--tight">{t("deposit.numDeposits")}</p>
              <div className="fm-deposit-tab-count">
                <span>{bundle.deposit.count}</span>
                <span className="fm-deposit-tab-times">{t("common.times")}</span>
              </div>
            </div>
            <Link
              to={routes.depositTopUp}
              className={`fm-deposit-tab-chevron${tab === "deposit" ? " fm-deposit-tab-chevron--active" : ""}`}
              aria-label={t("deposit.depositChevronAria")}
              onClick={(e) => e.stopPropagation()}
            >
              <img alt="" src={depositAssets.tabChevron} />
            </Link>
          </article>

          <article
            role="tab"
            aria-selected={tab === "withdraw"}
            tabIndex={0}
            className={`fm-deposit-tab${tab === "withdraw" ? " fm-deposit-tab--active" : " fm-deposit-tab--muted"}`}
            onClick={() => setTab("withdraw")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setTab("withdraw");
              }
            }}
          >
            <p className="fm-deposit-tab-label">{t("withdraw.tab")}</p>
            <div className="fm-deposit-tab-block fm-deposit-tab-block--total">
              <p className="fm-deposit-tab-caption">{t("withdraw.totalWithdrawn")}</p>
              <div className="fm-deposit-tab-amt">
                <span className="fm-deposit-tab-num">{bundle.withdraw.totalAmount.toFixed(2)}</span>
                <span className="fm-deposit-tab-unit">USDT</span>
              </div>
            </div>
            <div className="fm-deposit-tab-block fm-deposit-tab-block--count">
              <p className="fm-deposit-tab-caption fm-deposit-tab-caption--tight">{t("withdraw.numWithdrawals")}</p>
              <div className="fm-deposit-tab-count">
                <span>{bundle.withdraw.count}</span>
                <span className="fm-deposit-tab-times">{t("common.times")}</span>
              </div>
            </div>
            <Link
              to={routes.withdraw}
              className={`fm-deposit-tab-chevron${tab === "withdraw" ? " fm-deposit-tab-chevron--active" : ""}`}
              aria-label={t("deposit.withdrawChevronAria")}
              onClick={(e) => e.stopPropagation()}
            >
              <img alt="" src={depositAssets.tabChevron} />
            </Link>
          </article>

          <article
            role="tab"
            aria-selected={tab === "referral"}
            tabIndex={0}
            className={`fm-deposit-tab${tab === "referral" ? " fm-deposit-tab--active" : " fm-deposit-tab--muted"}`}
            onClick={() => setTab("referral")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setTab("referral");
              }
            }}
          >
            <p className="fm-deposit-tab-label">{t("referral.tab")}</p>
            <div className="fm-deposit-tab-block fm-deposit-tab-block--total">
              <p className="fm-deposit-tab-caption">{t("referral.bonusesFrom")}</p>
              <div className="fm-deposit-tab-amt">
                <span className="fm-deposit-tab-num">{bundle.referral.totalAmount.toFixed(2)}</span>
                <span className="fm-deposit-tab-unit">USDT</span>
              </div>
            </div>
            <div className="fm-deposit-tab-block fm-deposit-tab-block--count">
              <p className="fm-deposit-tab-caption fm-deposit-tab-caption--tight">{t("referral.invitedCount")}</p>
              <div className="fm-deposit-tab-count">
                <span>{bundle.referral.count}</span>
                <span className="fm-deposit-tab-times">{t("common.people")}</span>
              </div>
            </div>
            <Link
              to={routes.balanceReferral}
              className={`fm-deposit-tab-chevron${tab === "referral" ? " fm-deposit-tab-chevron--active" : ""}`}
              aria-label={t("deposit.referralChevronAria")}
              onClick={(e) => e.stopPropagation()}
            >
              <img alt="" src={depositAssets.tabChevron} />
            </Link>
          </article>
        </div>

        <div className="fm-deposit-list-scroll">
          {historyLoading && hasApiBase() && !apiHistory ? (
            <p className="fm-deposit-loading" style={{ padding: "12px 20px", margin: 0, fontSize: 14, opacity: 0.7 }}>
              {t("common.loading")}
            </p>
          ) : null}
          <ul className="fm-deposit-list">
            {rows.map((row, i) => (
              <li
                key={`${row.date}-${row.id}-${i}`}
                className={`fm-deposit-row${tab === "referral" ? " fm-deposit-row--referral" : ""}`}
              >
                <div className="fm-deposit-row-icon-wrap">
                  <span className={`fm-deposit-row-icon ${historyRowIconMod}`}>
                    <img alt="" src={historyRowIcon} />
                  </span>
                </div>
                <div className="fm-deposit-row-text">
                  <p className="fm-deposit-row-title">
                    {row.i18nTitleKey ? t(row.i18nTitleKey as MessageKey) : row.title}
                  </p>
                  <p className="fm-deposit-row-meta">{metaLabel}</p>
                  <p className="fm-deposit-row-meta">{row.id}</p>
                </div>
                <div className="fm-deposit-row-side">
                  <div className="fm-deposit-row-amt">
                    <span>{row.main}</span>
                    <span className="fm-deposit-row-unit">USDT</span>
                  </div>
                  <div className="fm-deposit-row-fee">
                    <span>{row.fee}</span>
                    {row.fee !== "—" ? <span className="fm-deposit-row-unit">USDT</span> : null}
                  </div>
                  <p className="fm-deposit-row-date">{row.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FigmaTabBar icons={depositTabIcons} />
    </main>
  );
}
