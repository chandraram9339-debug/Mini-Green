import "../home/homeScreen.css";
import "./userAgreementScreen.css";

import { useEffect, useState } from "react";

import { FigmaAppBar } from "../components/FigmaAppBar";
import { FigmaStatusBar } from "../components/FigmaStatusBar";
import { FigmaTabBar } from "../components/FigmaTabBar";
import type { StatusBarAssetUrls } from "../types/statusBarAssets";
import type { TabBarIconUrls } from "../types/tabBarIcons";
import { useFmLocale } from "../../i18n/useFmLocale";
import { defaultAppBarAssetUrls } from "../assets/appBarShared";
import { routes } from "../routes";
import { faqAssets } from "../faq/faqAssets";
import { loadAgreementTextFromUrl } from "./loadAgreementText";

const statusAssets: StatusBarAssetUrls = {
  networkSignalLight: faqAssets.networkSignalLight,
  wifiSignalLight: faqAssets.wifiSignalLight,
  batteryLight: faqAssets.batteryLight,
  indicator: faqAssets.indicator,
  time941: faqAssets.time941,
};

const tabIcons: TabBarIconUrls = {
  home: faqAssets.tabHome,
  wallet: faqAssets.tabWallet,
  bot: faqAssets.tabBot,
  support: faqAssets.tabSupport,
};

const AGREEMENT_FALLBACK = `User Agreement

By using this application you confirm that you understand the risks associated with digital assets and automated trading.

Configure VITE_USER_AGREEMENT_URL to load this text from your CMS.`;

const AGREEMENT_URL = import.meta.env.VITE_USER_AGREEMENT_URL?.trim();

export default function UserAgreementScreen() {
  const { t } = useFmLocale();
  const [text, setText] = useState(AGREEMENT_FALLBACK);
  const [status, setStatus] = useState<"idle" | "loading" | "error">(() =>
    AGREEMENT_URL ? "loading" : "idle",
  );

  useEffect(() => {
    if (!AGREEMENT_URL) return;
    loadAgreementTextFromUrl(AGREEMENT_URL)
      .then((t) => {
        const trimmed = t.trim();
        if (trimmed) setText(trimmed);
        setStatus("idle");
      })
      .catch(() => {
        setText(AGREEMENT_FALLBACK);
        setStatus("error");
      });
  }, []);

  return (
    <main className="fm-agreement" data-screen="user-agreement" aria-label={t("agreement.title")}>
      <FigmaStatusBar assets={statusAssets} />

      <FigmaAppBar assets={defaultAppBarAssetUrls} backTo={routes.settings} title={t("agreement.title")} />

      <article className="fm-abs fm-agreement-scroll">
        {status === "loading" ? (
          <p className="fm-agreement-text fm-agreement-text--muted">{t("common.loading")}</p>
        ) : (
          <>
            {status === "error" ? (
              <p className="fm-agreement-text fm-agreement-text--muted" role="alert">
                {t("common.agreementLoadError")}
              </p>
            ) : null}
            <pre className="fm-agreement-text">{text}</pre>
          </>
        )}
      </article>

      <FigmaTabBar icons={tabIcons} forceActiveTab="support" />
    </main>
  );
}
