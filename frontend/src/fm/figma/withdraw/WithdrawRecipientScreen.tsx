import "../home/homeScreen.css";
import "./withdrawScreen.css";
import "./withdraw-flow.css";

import { Link } from "react-router-dom";

import { appBarLogoUrl } from "../assets/appBarShared";
import { FigmaStatusBar } from "../components/FigmaStatusBar";
import { FigmaTabBar } from "../components/FigmaTabBar";
import type { StatusBarAssetUrls } from "../types/statusBarAssets";
import type { TabBarIconUrls } from "../types/tabBarIcons";
import { routes } from "../routes";
import { readWithdrawDraft, formatShortAddress } from "./withdrawDraft";
import { useWithdrawDraftGuard } from "./useWithdrawDraftGuard";
import { withdrawAssets as w } from "./withdrawAssets";

const withdrawStatusAssets: StatusBarAssetUrls = {
  networkSignalLight: w.networkSignalLight,
  wifiSignalLight: w.wifiSignalLight,
  batteryLight: w.batteryLight,
  indicator: w.indicator,
  time941: w.time941,
};

const withdrawTabIcons: TabBarIconUrls = {
  home: w.tabHome,
  wallet: w.tabWallet,
  bot: w.tabBot,
  support: w.tabSupport,
};

/** «1| Recipient» — node 1:3860: подтверждение адреса перед суммой. */
export default function WithdrawRecipientScreen() {
  useWithdrawDraftGuard();
  const draft = readWithdrawDraft();

  return (
    <main className="fm-withdraw" data-node-id="1:3860" aria-label="Recipient">
      <FigmaStatusBar assets={withdrawStatusAssets} />

      <header className="fm-abs fm-withdraw-appbar">
        <div className="fm-withdraw-appbar-line">
          <img alt="" src={w.lineAppBar} />
        </div>
        <div className="fm-withdraw-appbar-brand" aria-label="Recipient">
          <img alt="Palladium" src={appBarLogoUrl} />
        </div>
        <Link to={routes.withdraw} className="fm-withdraw-back" aria-label="Back">
          <span className="fm-withdraw-icon-btn">
            <img alt="" src={w.back} />
          </span>
        </Link>
        <Link to={routes.home} className="fm-withdraw-close" aria-label="Close">
          <span className="fm-withdraw-icon-btn">
            <img alt="" src={w.close} />
          </span>
        </Link>
      </header>

      <div className="fm-withdraw-field fm-withdraw-field--recipient-step">
        <p className="fm-withdraw-recipient-value">{draft ? formatShortAddress(draft.address) : ""}</p>
      </div>

      <p className="fm-withdraw-note fm-withdraw-note--recipient">
        The withdrawal process is automatic. Usually, it takes anywhere from 10 minutes to 2-3 hours. However, as a
        maximum, it can take up to 7 days. The bot needs to close all active trades in order to withdraw the money.
      </p>

      <Link to={routes.withdrawAmount} className="fm-withdraw-cta">
        Continue
      </Link>

      <FigmaTabBar icons={withdrawTabIcons} forceActiveTab="wallet" />
    </main>
  );
}
