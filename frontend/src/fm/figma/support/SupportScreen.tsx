import "../home/homeScreen.css";
import "./supportScreen.css";

import { Link } from "react-router-dom";

import { FigmaAppBar } from "../components/FigmaAppBar";
import { FigmaStatusBar } from "../components/FigmaStatusBar";
import { FigmaTabBar } from "../components/FigmaTabBar";
import type { StatusBarAssetUrls } from "../types/statusBarAssets";
import type { TabBarIconUrls } from "../types/tabBarIcons";
import { useFmLocale } from "../../i18n/useFmLocale";
import { SUPPORT_TELEGRAM_URL } from "../../config/links";
import { defaultAppBarAssetUrls } from "../assets/appBarShared";
import { routes } from "../routes";
import { supportAssets } from "./supportAssets";

const supportStatusAssets: StatusBarAssetUrls = {
  networkSignalLight: supportAssets.networkSignalLight,
  wifiSignalLight: supportAssets.wifiSignalLight,
  batteryLight: supportAssets.batteryLight,
  indicator: supportAssets.indicator,
  time941: supportAssets.time941,
};

const supportTabIcons: TabBarIconUrls = {
  home: supportAssets.tabHome,
  wallet: supportAssets.tabWallet,
  bot: supportAssets.tabBot,
  support: supportAssets.tabSupport,
};

/** Экран «1 | Support» — node 1:3751, `support__full-screen__1-3751.tsx`. */
export default function SupportScreen() {
  const { t } = useFmLocale();
  return (
    <main className="fm-support" data-node-id="1:3751" aria-label={t("support.title")}>
      <FigmaStatusBar assets={supportStatusAssets} />

      <FigmaAppBar assets={defaultAppBarAssetUrls} backTo={routes.home} title={t("support.title")} />

      <div className="fm-abs fm-support-list">
        <a
          href={SUPPORT_TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="fm-support-row fm-support-row--link"
        >
          <span className="fm-support-row-icon-wrap">
            <img
              className="fm-support-row-icon-img fm-support-row-icon-img--support"
              alt=""
              src={supportAssets.listSupportChat}
            />
          </span>
          <p className="fm-support-row-title">{t("support.chat")}</p>
        </a>

        <Link to={routes.faq} className="fm-support-row fm-support-row--link">
          <span className="fm-support-row-icon-wrap">
            <img
              className="fm-support-row-icon-img fm-support-row-icon-img--faq"
              alt=""
              src={supportAssets.listFaq}
            />
          </span>
          <p className="fm-support-row-title">{t("faq.title")}</p>
        </Link>
      </div>

      <FigmaTabBar icons={supportTabIcons} />
    </main>
  );
}
