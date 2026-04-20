import "../home/homeScreen.css";
import "./withdrawScreen.css";
import "./withdraw-flow.css";

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { FigmaStatusBar } from "../components/FigmaStatusBar";
import { FigmaTabBar } from "../components/FigmaTabBar";
import type { StatusBarAssetUrls } from "../types/statusBarAssets";
import type { TabBarIconUrls } from "../types/tabBarIcons";
import { routes } from "../routes";
import { formatShortAddress, readWithdrawDonePayload } from "./withdrawDraft";
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

/** «1 | Done» — node 1:3893, `withdraw-done__full-screen__1-3893.tsx`. */
export default function WithdrawDoneScreen() {
  const navigate = useNavigate();
  const done = readWithdrawDonePayload();

  useEffect(() => {
    if (!done) navigate(routes.withdraw, { replace: true });
  }, [done, navigate]);

  const short = done ? formatShortAddress(done.address, 6, 4) : "";
  const amount = done?.amountUsdt ?? 0;
  const fee = done?.feeUsdt ?? 0;

  return (
    <main className="fm-withdraw" data-node-id="1:3893" aria-label="Withdrawal done">
      <FigmaStatusBar assets={withdrawStatusAssets} />

      <header className="fm-abs fm-withdraw-appbar">
        <div className="fm-withdraw-appbar-line">
          <img alt="" src={w.lineAppBar} />
        </div>
        <p className="fm-withdraw-appbar-title">USDT Transfer</p>
        <Link to={routes.home} className="fm-withdraw-back" aria-label="Back">
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

      <div className="fm-transfer-cheque">
        <div className="fm-transfer-row">
          <p className="fm-transfer-label">Recipient</p>
          <p className="fm-transfer-value">{short}</p>
        </div>
        <div className="fm-transfer-row">
          <p className="fm-transfer-label">Amount</p>
          <p className="fm-transfer-value">
            {amount.toFixed(2)} <span className="fm-transfer-value-unit">USDT</span>
          </p>
        </div>
        <div className="fm-transfer-row">
          <p className="fm-transfer-label">Commission</p>
          <p className="fm-transfer-value">
            {fee.toFixed(2)} <span className="fm-transfer-value-unit">USDT</span>
          </p>
        </div>
      </div>

      <div className="fm-withdraw-done-hero">
        <div className="fm-withdraw-done-icon-wrap">
          <img alt="" src={w.doneCheck} />
        </div>
        <p className="fm-withdraw-done-label">Done!</p>
      </div>

      <FigmaTabBar icons={withdrawTabIcons} forceActiveTab="wallet" />
    </main>
  );
}
