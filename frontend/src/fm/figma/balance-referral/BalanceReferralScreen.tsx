/* Локальный CSS после deposit — высота фрейма 915px и таб-бар top 843px */
import "../home/homeScreen.css";
import "../balance-deposit/balanceDepositScreen.css";
import "./balanceReferralScreen.css";

import { Link } from "react-router-dom";

import { FigmaAppBar } from "../components/FigmaAppBar";
import { FigmaStatusBar } from "../components/FigmaStatusBar";
import { FigmaTabBar } from "../components/FigmaTabBar";
import type { StatusBarAssetUrls } from "../types/statusBarAssets";
import type { TabBarIconUrls } from "../types/tabBarIcons";
import { defaultAppBarAssetUrls } from "../assets/appBarShared";
import { useFmLocale } from "../../i18n/useFmLocale";
import { routes } from "../routes";
import { useWalletDisplay } from "../useWalletDisplay";
import { formatShortAddress } from "../withdraw/withdrawDraft";
import { depositAssets } from "../balance-deposit/depositAssets";

const referralStatusAssets: StatusBarAssetUrls = {
  networkSignalLight: depositAssets.networkSignalLight,
  wifiSignalLight: depositAssets.wifiSignalLight,
  batteryLight: depositAssets.batteryLight,
  indicator: depositAssets.indicator,
  time941: depositAssets.time941,
};

const referralTabIcons: TabBarIconUrls = {
  home: depositAssets.group4,
  wallet: depositAssets.group5,
  bot: depositAssets.group6,
  support: depositAssets.group7,
};

const INVITE_ROWS = [
  { user: "@Anna_", amt: "+5.22" },
  { user: "@Maksim_254", amt: "+20.22" },
  { user: "@AlexV", amt: "+5.00" },
  { user: "@bingo765", amt: "+700.00" },
  { user: "@Max", amt: "+11.10" },
] as const;

/** Экран «Detail Balance | Referral» — node 1:3687, `detail-balance-referral__full-screen__1-3687.tsx`. */
export default function BalanceReferralScreen() {
  const { t } = useFmLocale();
  const { balanceUsdt, depositAddress } = useWalletDisplay();

  return (
    <main
      className="fm-deposit fm-referral"
      data-node-id="1:3687"
      aria-label="Detail Balance Referral"
    >
      <FigmaStatusBar assets={referralStatusAssets} />

      <FigmaAppBar assets={defaultAppBarAssetUrls} backTo={routes.home} title={t("referral.tab")} />

      <div className="fm-deposit-chrome-spacer" aria-hidden="true" />

      <section className="fm-deposit-balance" aria-label="Current balance">
        <div className="fm-deposit-balance-copy">
          <p className="fm-deposit-balance-title">Current balance</p>
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
          Top up
        </Link>

        <Link to={routes.withdraw} className="fm-deposit-act fm-deposit-act--withdraw">
          <span className="fm-deposit-act-icon-wrap">
            <img alt="" src={depositAssets.group10} />
          </span>
          Withdraw
        </Link>
      </section>

      <section className="fm-deposit-history" aria-label="Referral activity">
        <p className="fm-referral-date-marker fm-referral-date-marker--a">31.12.2024 00:00</p>
        <p className="fm-referral-date-marker fm-referral-date-marker--b">31.12.2024 00:00</p>

        <div className="fm-deposit-history-tabs">
          <Link to={routes.balanceDeposit} className="fm-deposit-tab fm-deposit-tab--muted fm-deposit-tab--as-link">
            <p className="fm-deposit-tab-label fm-deposit-tab-label--deposit">Deposit</p>
            <div className="fm-deposit-tab-block fm-deposit-tab-block--total">
              <p className="fm-deposit-tab-caption">Total deposited amount:</p>
              <div className="fm-deposit-tab-amt">
                <span className="fm-deposit-tab-num">725.22</span>
                <span className="fm-deposit-tab-unit">USDT</span>
              </div>
            </div>
            <div className="fm-deposit-tab-block fm-deposit-tab-block--count">
              <p className="fm-deposit-tab-caption fm-deposit-tab-caption--tight">Number of deposits made:</p>
              <div className="fm-deposit-tab-count">
                <span>28</span>
                <span className="fm-deposit-tab-times">Times</span>
              </div>
            </div>
            <span className="fm-deposit-tab-chevron" aria-hidden="true">
              <img alt="" src={depositAssets.tabChevron} />
            </span>
          </Link>

          <Link to={routes.balanceDeposit} className="fm-deposit-tab fm-deposit-tab--muted fm-deposit-tab--as-link">
            <p className="fm-deposit-tab-label">Withdraw</p>
            <div className="fm-deposit-tab-block fm-deposit-tab-block--total">
              <p className="fm-deposit-tab-caption">Total withdraw amount</p>
              <div className="fm-deposit-tab-amt">
                <span className="fm-deposit-tab-num">4250.98</span>
                <span className="fm-deposit-tab-unit">USDT</span>
              </div>
            </div>
            <div className="fm-deposit-tab-block fm-deposit-tab-block--count">
              <p className="fm-deposit-tab-caption fm-deposit-tab-caption--tight">Number of deposits made:</p>
              <div className="fm-deposit-tab-count">
                <span>534</span>
                <span className="fm-deposit-tab-times">Times</span>
              </div>
            </div>
            <span className="fm-deposit-tab-chevron" aria-hidden="true">
              <img alt="" src={depositAssets.tabChevron} />
            </span>
          </Link>

          <article className="fm-deposit-tab fm-deposit-tab--active">
            <p className="fm-deposit-tab-label fm-referral-tab-label-active">Referral</p>
            <div className="fm-deposit-tab-block fm-deposit-tab-block--total">
              <p className="fm-deposit-tab-caption">Bonuses received from:</p>
              <div className="fm-deposit-tab-amt">
                <span className="fm-deposit-tab-num">25.22</span>
                <span className="fm-deposit-tab-unit">USDT</span>
              </div>
            </div>
            <div className="fm-deposit-tab-block fm-deposit-tab-block--count">
              <p className="fm-deposit-tab-caption fm-deposit-tab-caption--tight">Total number of invited users:</p>
              <div className="fm-deposit-tab-count">
                <span>25</span>
                <span className="fm-deposit-tab-times">People</span>
              </div>
            </div>
            <span className="fm-deposit-tab-chevron fm-deposit-tab-chevron--active" aria-hidden="true">
              <img alt="" src={depositAssets.tabChevron} />
            </span>
          </article>
        </div>

        <ul className="fm-deposit-list">
          {INVITE_ROWS.map((row) => (
            <li key={row.user} className="fm-deposit-row fm-referral-invite-row">
              <div className="fm-deposit-row-icon-wrap">
                <span className="fm-deposit-row-icon fm-deposit-row-icon--referral">
                  <img alt="" src={depositAssets.rowIconAt} />
                </span>
              </div>
              <p className="fm-referral-user">{row.user}</p>
              <div className="fm-deposit-row-side fm-referral-invite-side">
                <div className="fm-deposit-row-amt">
                  <span>{row.amt}</span>
                  <span className="fm-deposit-row-unit">USDT</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <FigmaTabBar icons={referralTabIcons} />
    </main>
  );
}
