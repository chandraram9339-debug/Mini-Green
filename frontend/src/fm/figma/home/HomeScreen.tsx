import "./homeScreen.css";

import { Link, useNavigate } from "react-router-dom";

import { useFmLocale } from "../../i18n/useFmLocale";
import { FigmaAppBar } from "../components/FigmaAppBar";
import { FigmaGraphic } from "../components/FigmaGraphic";
import { FigmaStatusBar } from "../components/FigmaStatusBar";
import { FigmaTabBar } from "../components/FigmaTabBar";
import type { StatusBarAssetUrls } from "../types/statusBarAssets";
import type { TabBarIconUrls } from "../types/tabBarIcons";
import {
  TELEGRAM_CHANNEL_URL,
  TELEGRAM_CHAT_URL,
  openTelegramOrExternal,
} from "../../config/links";
import { defaultAppBarAssetUrls } from "../assets/appBarShared";
import { routes } from "../routes";
import { useWalletDisplay } from "../useWalletDisplay";
import { getHomeChartMode } from "./homeChartMode";
import { homeAssets } from "./homeAssets";

const homeStatusAssets: StatusBarAssetUrls = {
  networkSignalLight: homeAssets.networkSignalLight,
  wifiSignalLight: homeAssets.wifiSignalLight,
  batteryLight: homeAssets.batteryLight,
  indicator: homeAssets.indicator,
  time941: homeAssets.time941,
};

const homeTabIcons: TabBarIconUrls = {
  home: homeAssets.group2,
  wallet: homeAssets.group3,
  bot: homeAssets.group4,
  support: homeAssets.group5,
};

/**
 * Экран «1 | Home» (node 1:3644).
 * Слои и отступы: `screen-home__assembly.json` + `home__full-screen__1-3644.tsx`.
 */
export default function HomeScreen() {
  const { t } = useFmLocale();
  const navigate = useNavigate();
  const { balanceUsdt, referralReceivedUsdt } = useWalletDisplay();
  const chartMode = getHomeChartMode(balanceUsdt);
  const balanceDisplay = balanceUsdt;
  const referralDisplay = referralReceivedUsdt;

  return (
    <main className="fm-home" data-node-id="1:3644" aria-label={t("home.title")}>
      <FigmaStatusBar assets={homeStatusAssets} />

      <FigmaAppBar
        assets={defaultAppBarAssetUrls}
        onBack={() => {
          if (window.history.length > 1) navigate(-1);
        }}
      />

      <section className="fm-abs fm-balance" aria-label={t("home.balances")}>
        <p className="fm-balance-title">{t("home.totalBalance")}</p>

        <div className="fm-balance-main-amt">
          <strong>{balanceDisplay.toFixed(2)}</strong>
          <span className="u">USDT</span>
        </div>

        <div className="fm-balance-divider">
          <img alt="" src={homeAssets.line1} />
        </div>

        <div className="fm-mini-col">
          <Link to={routes.depositTopUp} className="fm-mini-topup">
            <img alt="" src={homeAssets.group9} />
            <span>{t("home.topUp")}</span>
          </Link>
          <Link to={routes.withdraw} className="fm-mini-withdraw">
            <img alt="" src={homeAssets.group10} />
            <span>{t("home.withdraw")}</span>
          </Link>
        </div>

        {/*
         * div вместо <button>: в Telegram/iOS WebKit пустой button с transparent всё ещё часто рисует сист. серую плашку
         * на зоне hit-area. Ссылка <a> + display:contents в этом WebView тоже даёт «серый» — см. соседние ссылки.
         */}
        <div
          className="fm-referral-hit"
          role="button"
          tabIndex={0}
          aria-label={t("home.referralsAria", { amount: referralDisplay.toFixed(2) })}
          onClick={() => navigate(routes.balanceReferral)}
          onKeyDown={(e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.preventDefault();
            navigate(routes.balanceReferral);
          }}
        />
        <p className="fm-referral-caption">{t("home.referralsCaption")}</p>
        <div className="fm-referral-amt" aria-hidden="true">
          <span className="v">{referralDisplay.toFixed(2)}</span>
          <span className="u">USDT</span>
        </div>

        <Link to={routes.balanceDeposit} className="fm-btn-details-balance">
          <img alt="" src={homeAssets.group} />
          <span>{t("home.details")}</span>
        </Link>
      </section>

      <section
        className="fm-abs fm-graphic"
        data-home-chart={chartMode}
        aria-label={
          chartMode === "journal"
            ? t("home.chartJournalAria")
            : t("home.chartBalanceAria")
        }
      >
        <FigmaGraphic />

        <div className="fm-graphic-status">
          <p>{t("home.botStatus")}</p>
          <div className="fm-status-bot">
            <img alt="" className="fm-dot" src={homeAssets.dot} />
            <span>{t("home.active")}</span>
          </div>
        </div>

        <div className="fm-graphic-price">
          <p>{t("home.actualPrice")}</p>
          <div className="fm-price-amt">
            <span className="p">69 425.22</span>
            <span className="u">USDT/BTC</span>
          </div>
        </div>

        <Link to={routes.bot} className="fm-btn-details-chart">
          <img alt="" src={homeAssets.group8} />
          <span>{t("home.details")}</span>
        </Link>
      </section>

      <div className="fm-abs fm-social">
        <button
          type="button"
          className="fm-social-a"
          onClick={() => openTelegramOrExternal(TELEGRAM_CHANNEL_URL)}
          aria-label={t("home.channelAria")}
        >
          <img alt="" src={homeAssets.group6} />
          <span>{t("home.channel")}</span>
        </button>
        <button
          type="button"
          className="fm-social-b"
          onClick={() => openTelegramOrExternal(TELEGRAM_CHAT_URL)}
          aria-label={t("home.chatAria")}
        >
          <img alt="" src={homeAssets.group7} />
          <span>{t("home.chat")}</span>
        </button>
      </div>

      <FigmaTabBar icons={homeTabIcons} />
    </main>
  );
}
