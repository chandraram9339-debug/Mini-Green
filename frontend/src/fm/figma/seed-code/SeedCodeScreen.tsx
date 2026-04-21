import "../home/homeScreen.css";
import "./seedCodeScreen.css";

import { FigmaAppBar } from "../components/FigmaAppBar";
import { FigmaStatusBar } from "../components/FigmaStatusBar";
import { FigmaTabBar } from "../components/FigmaTabBar";
import type { StatusBarAssetUrls } from "../types/statusBarAssets";
import type { TabBarIconUrls } from "../types/tabBarIcons";
import { useFmLocale } from "../../i18n/useFmLocale";
import { defaultAppBarAssetUrls } from "../assets/appBarShared";
import { routes } from "../routes";
import { faqAssets } from "../faq/faqAssets";
import { getSeedWords } from "./seedWords";
import { hapticSuccess, showMiniAppAlert } from "../../telegram/uiFeedback";

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

async function copySeedPhrase(words: readonly string[], copiedLabel: string): Promise<void> {
  const text = words.join(" ");
  try {
    await navigator.clipboard.writeText(text);
    hapticSuccess();
    showMiniAppAlert(copiedLabel);
  } catch {
    window.prompt("Copy:", text);
  }
}

export default function SeedCodeScreen() {
  const { t } = useFmLocale();
  const words = getSeedWords();

  return (
    <main className="fm-seed" data-screen="seed-code" aria-label={t("seed.title")}>
      <FigmaStatusBar assets={statusAssets} />

      <FigmaAppBar assets={defaultAppBarAssetUrls} backTo={routes.settings} title={t("seed.title")} />

      <div className="fm-abs fm-seed-body">
        <p className="fm-seed-lead">{t("seed.storeHint")}</p>
        <ul className="fm-seed-grid">
          {words.map((w, i) => (
            <li key={`${i}-${w}`} className="fm-seed-word">
              <span className="fm-seed-idx">{i + 1}</span>
              <span>{w}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="fm-seed-copy"
          onClick={() => void copySeedPhrase(words, t("seed.copied"))}
        >
          {t("seed.copy")}
        </button>
      </div>

      <FigmaTabBar icons={tabIcons} forceActiveTab="support" />
    </main>
  );
}
