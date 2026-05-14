import "../home/homeScreen.css";
import "./topUpScreen.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FigmaAppBar } from "../components/FigmaAppBar";
import { FigmaStatusBar } from "../components/FigmaStatusBar";
import { FigmaTabBar } from "../components/FigmaTabBar";
import type { StatusBarAssetUrls } from "../types/statusBarAssets";
import type { TabBarIconUrls } from "../types/tabBarIcons";
import { useFmLocale } from "../../i18n/useFmLocale";
import { routes } from "../routes";
import { DEPOSIT_WALLET_ADDRESS } from "../../config/deposit";
import { useAppSession } from "../../session/useAppSession";
import { copyTextToClipboard } from "../../lib/copyTextToClipboard";
import { hapticError, hapticLight, hapticSuccess, showMiniAppAlert } from "../../telegram/uiFeedback";
import { defaultAppBarAssetUrls } from "../assets/appBarShared";
import { depositAssets } from "../balance-deposit/depositAssets";
import { topUpAssets } from "./topUpAssets";

const topUpStatusAssets: StatusBarAssetUrls = {
  networkSignalLight: depositAssets.networkSignalLight,
  wifiSignalLight: depositAssets.wifiSignalLight,
  batteryLight: depositAssets.batteryLight,
  indicator: depositAssets.indicator,
  time941: depositAssets.time941,
};

const topUpTabIcons: TabBarIconUrls = {
  home: depositAssets.group4,
  wallet: depositAssets.group5,
  bot: depositAssets.group6,
  support: depositAssets.group7,
};

function qrImageUrl(data: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
}

function depositNotify(message: string, onOk?: () => void): void {
  showMiniAppAlert(message, { force: true, onClose: onOk });
}

/** Экран «1| Top up» — node 1:3904, `screen-top-up__assembly.json`. App Bar как `top-up__app-bar-deposit__1-4877.tsx`. */
export default function TopUpScreen() {
  const navigate = useNavigate();
  const { t } = useFmLocale();
  const { wallet, confirmDepositPaid } = useAppSession();
  const depositAddress = wallet?.depositAddress ?? DEPOSIT_WALLET_ADDRESS;
  const [qrOk, setQrOk] = useState(true);
  const [paidBusy, setPaidBusy] = useState(false);
  const [paidSuccessVisible, setPaidSuccessVisible] = useState(false);

  useEffect(() => {
    if (!paidSuccessVisible) return;
    const timeoutId = window.setTimeout(() => setPaidSuccessVisible(false), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [paidSuccessVisible]);

  async function copyAddress(): Promise<void> {
    const ok = await copyTextToClipboard(depositAddress);
    if (ok) {
      hapticLight();
      showMiniAppAlert(t("seed.copied"));
    } else {
      depositNotify(t("topup.alertCopyFail"));
    }
  }

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
        depositNotify(t("topup.alertPaidFail"));
      }
    } finally {
      setPaidBusy(false);
    }
  }

  return (
    <main className="fm-topup" data-node-id="1:3904" aria-label={t("topup.ariaScreen")}>
      <FigmaStatusBar assets={topUpStatusAssets} />

      <FigmaAppBar
        assets={defaultAppBarAssetUrls}
        backTo={routes.balanceDeposit}
        title={t("deposit.title")}
      />

      <section className="fm-topup-card" aria-label={t("topup.sectionAria")}>
        {/* В Figma в заголовке опечатка «Recieve» — в UI исправлено на Receive */}
        <h1 className="fm-topup-title">{t("topup.title")}</h1>
        <div className="fm-topup-qr" aria-hidden={qrOk ? undefined : true}>
          {qrOk ? (
            <img
              className="fm-topup-qr-img"
              src={qrImageUrl(depositAddress)}
              width={200}
              height={200}
              alt=""
              decoding="async"
              onError={() => setQrOk(false)}
            />
          ) : null}
        </div>
        <p className="fm-topup-address">{depositAddress}</p>
        <button type="button" className="fm-topup-btn fm-topup-btn--copy" onClick={() => void copyAddress()}>
          <img alt="" src={topUpAssets.copy} />
          {t("seed.copy")}
        </button>
        <button
          type="button"
          className="fm-topup-btn fm-topup-btn--paid"
          disabled={paidBusy}
          aria-busy={paidBusy}
          onClick={() => void handlePaid()}
        >
          <img alt="" src={topUpAssets.paid} />
          {t("topup.paid")}
        </button>
      </section>

      {paidSuccessVisible ? (
        <div className="fm-topup-paid-toast" aria-live="polite" aria-label={t("topup.alertPaidOk")}>
          <span className="fm-topup-paid-toast-icon" aria-hidden="true">
            &#10003;
          </span>
        </div>
      ) : null}

      <FigmaTabBar icons={topUpTabIcons} />
    </main>
  );
}
