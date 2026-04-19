import "../home/homeScreen.css";
import "./topUpScreen.css";

import { useState } from "react";
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
import { hapticLight, showMiniAppAlert } from "../../telegram/uiFeedback";
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
  const tg = window.Telegram?.WebApp;
  if (tg?.showAlert) tg.showAlert(message, onOk);
  else {
    window.alert(message);
    onOk?.();
  }
}

/** Экран «1| Top up» — node 1:3904, `screen-top-up__assembly.json`. App Bar как `top-up__app-bar-deposit__1-4877.tsx`. */
export default function TopUpScreen() {
  const navigate = useNavigate();
  const { t } = useFmLocale();
  const { wallet, confirmDepositPaid } = useAppSession();
  const depositAddress = wallet?.depositAddress ?? DEPOSIT_WALLET_ADDRESS;
  const [qrOk, setQrOk] = useState(true);
  const [paidBusy, setPaidBusy] = useState(false);

  async function copyAddress(): Promise<void> {
    try {
      await navigator.clipboard.writeText(depositAddress);
      hapticLight();
      showMiniAppAlert(t("seed.copied"));
    } catch {
      depositNotify(t("topup.alertCopyFail"));
    }
  }

  async function handlePaid(): Promise<void> {
    setPaidBusy(true);
    try {
      const ok = await confirmDepositPaid();
      if (ok) {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");
        depositNotify(t("topup.alertPaidOk"), () => navigate(routes.home));
      } else {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("error");
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
        bellBadge="3"
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

      <FigmaTabBar icons={topUpTabIcons} />
    </main>
  );
}
