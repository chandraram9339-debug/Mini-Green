import "../home/homeScreen.css";
import "./settingsScreen.css";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { FigmaAppBar } from "../components/FigmaAppBar";
import { FigmaStatusBar } from "../components/FigmaStatusBar";
import { FigmaTabBar } from "../components/FigmaTabBar";
import type { StatusBarAssetUrls } from "../types/statusBarAssets";
import type { TabBarIconUrls } from "../types/tabBarIcons";
import type { AppBarAssetUrls } from "../types/appBarAssets";
import { useFmLocale } from "../../i18n/useFmLocale";
import { homeAssets } from "../home/homeAssets";
import { routes } from "../routes";
import { settingsAssets as s } from "./settingsAssets";
import { openTelegramReferralShare } from "../../config/links";
import { logGreySurfaces } from "../../debug/logGreySurfaces";

const PUSH_KEY = "fm-push";
const VIB_KEY = "fm-vibration";

function readToggleLocal(key: string, defaultOn: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return defaultOn;
    return v !== "0";
  } catch {
    return defaultOn;
  }
}

const settingsTabIcons: TabBarIconUrls = {
  home: homeAssets.group2,
  wallet: homeAssets.group3,
  bot: homeAssets.group4,
  support: homeAssets.group5,
};

const settingsAppBarAssets: AppBarAssetUrls = {
  backIcon: s.back,
  dividerLine: s.lineAppBar,
  bellIcon: s.bell,
  settingsIcon: s.gear,
};

function SettingsToggle({
  pressed,
  onToggle,
  ariaLabel,
}: {
  pressed: boolean;
  onToggle: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      className={`fm-settings-toggle ${pressed ? "fm-settings-toggle--on" : ""}`}
      aria-label={ariaLabel}
      title={ariaLabel}
      aria-pressed={pressed}
      onClick={onToggle}
    >
      <span className="fm-settings-toggle-track" aria-hidden="true" />
      <span className="fm-settings-toggle-knob" aria-hidden="true" />
    </button>
  );
}

/** Экран «1 | Settings» — node 1:3783 + нижний Tab Bar. */
export default function SettingsScreen() {
  const { locale, setLocale, t } = useFmLocale();
  const [langOpen, setLangOpen] = useState(false);
  const langWrapRef = useRef<HTMLDivElement>(null);
  const [pushOn, setPushOn] = useState(() => readToggleLocal(PUSH_KEY, true));
  const [vibrationOn, setVibrationOn] = useState(() => readToggleLocal(VIB_KEY, true));

  useEffect(() => {
    if (!langOpen) return;
    const onDown = (e: MouseEvent) => {
      if (langWrapRef.current && !langWrapRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [langOpen]);

  // #region agent log (debug a5e1ad — grey surfaces)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      logGreySurfaces("settings", ".fm-settings");
    });
    return () => cancelAnimationFrame(id);
  }, []);
  // #endregion

  const togglePush = useCallback(() => {
    setPushOn((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(PUSH_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const toggleVibration = useCallback(() => {
    setVibrationOn((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(VIB_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const langLabel =
    locale === "es" ? t("settings.langSpanish") : t("settings.langEnglish");

  return (
    <main className="fm-settings" data-node-id="1:3783" aria-label={t("settings.title")}>
      <FigmaStatusBar assets={settingsStatusAssets} />

      <FigmaAppBar
        assets={settingsAppBarAssets}
        backTo={routes.home}
        title={t("settings.title")}
        settingsStatic
      />

      <div className="fm-settings-body">
        <section className="fm-settings-section" aria-label={t("settings.language")}>
          <div className="fm-settings-lang-wrap" ref={langWrapRef}>
            <button
              type="button"
              className="fm-settings-row fm-settings-row--simple fm-settings-row--lang-trigger"
              aria-expanded={langOpen}
              aria-haspopup="listbox"
              aria-label={t("settings.language")}
              onClick={() => setLangOpen((o) => !o)}
            >
              <span className="fm-settings-lead-icon">
                <img alt="" src={s.iconTranslate} />
              </span>
              <span className="fm-settings-row-label">{t("settings.language")}</span>
              <span className="fm-settings-lang-trigger-right">
                <span className="fm-settings-lang-current">{langLabel}</span>
                <span
                  className={`fm-settings-lang-chevron${langOpen ? " fm-settings-lang-chevron--open" : ""}`}
                  aria-hidden
                />
              </span>
            </button>

            {langOpen ? (
              <div className="fm-settings-lang-dropdown" role="listbox" aria-label={t("settings.language")}>
                <button
                  type="button"
                  role="option"
                  aria-selected={locale === "en"}
                  className="fm-settings-lang-option"
                  onClick={() => {
                    setLocale("en");
                    setLangOpen(false);
                  }}
                >
                  <span
                    className={`fm-settings-mini-check${locale === "en" ? " fm-settings-mini-check--selected" : ""}`}
                    aria-hidden="true"
                  >
                    {locale === "en" ? (
                      <img alt="" src={s.successMark} />
                    ) : (
                      <span className="fm-settings-mini-check-placeholder" />
                    )}
                  </span>
                  <span className="fm-settings-lang-option-label">{t("settings.langEnglish")}</span>
                </button>
                <button
                  type="button"
                  role="option"
                  aria-selected={locale === "es"}
                  className="fm-settings-lang-option fm-settings-lang-option--last"
                  onClick={() => {
                    setLocale("es");
                    setLangOpen(false);
                  }}
                >
                  <span
                    className={`fm-settings-mini-check${locale === "es" ? " fm-settings-mini-check--selected" : ""}`}
                    aria-hidden="true"
                  >
                    {locale === "es" ? (
                      <img alt="" src={s.successMark} />
                    ) : (
                      <span className="fm-settings-mini-check-placeholder" />
                    )}
                  </span>
                  <span className="fm-settings-lang-option-label">{t("settings.langSpanish")}</span>
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <div className="fm-settings-divider">
          <img alt="" src={s.lineDivider} />
        </div>

        <section className="fm-settings-section" aria-label={t("settings.push")}>
          <div className="fm-settings-row fm-settings-row--simple fm-settings-row--toggle-row">
            <span className="fm-settings-lead-icon fm-settings-lead-icon--push">
              <img alt="" src={s.bell} />
            </span>
            <span className="fm-settings-row-label">{t("settings.push")}</span>
            <SettingsToggle pressed={pushOn} onToggle={togglePush} ariaLabel={t("settings.push")} />
          </div>

          <div className="fm-settings-row fm-settings-row--simple fm-settings-row--toggle-row">
            <span className="fm-settings-lead-icon fm-settings-lead-icon--vibrate">
              <img alt="" src={s.mobile} />
            </span>
            <span className="fm-settings-row-label">{t("settings.vibration")}</span>
            <SettingsToggle
              pressed={vibrationOn}
              onToggle={toggleVibration}
              ariaLabel={t("settings.vibration")}
            />
          </div>
        </section>

        <div className="fm-settings-divider">
          <img alt="" src={s.lineDivider} />
        </div>

        <section className="fm-settings-section" aria-label={t("settings.support")}>
          <Link to={routes.support} className="fm-settings-row fm-settings-row--simple fm-settings-row--link">
            <span className="fm-settings-lead-icon fm-settings-lead-icon--support">
              <img alt="" src={s.iconSupport} />
            </span>
            <span className="fm-settings-row-label">{t("settings.support")}</span>
          </Link>

          <Link to={routes.faq} className="fm-settings-row fm-settings-row--simple fm-settings-row--link">
            <span className="fm-settings-lead-icon fm-settings-lead-icon--faq">
              <img alt="" src={s.iconFaq} />
            </span>
            <span className="fm-settings-row-label">{t("settings.faq")}</span>
          </Link>

          <button
            type="button"
            className="fm-settings-row fm-settings-row--simple fm-settings-row--link fm-settings-row--button"
            onClick={openTelegramReferralShare}
          >
            <span className="fm-settings-lead-icon fm-settings-lead-icon--referral">
              <img alt="" src={s.userPlus} />
            </span>
            <span className="fm-settings-row-label">{t("settings.referralLink")}</span>
          </button>

          <Link to={routes.seedCode} className="fm-settings-row fm-settings-row--simple fm-settings-row--link">
            <span className="fm-settings-lead-icon fm-settings-lead-icon--seed">
              <img alt="" src={s.alertTriangle} />
            </span>
            <span className="fm-settings-row-label">{t("settings.seedCode")}</span>
          </Link>
        </section>

        <div className="fm-settings-divider">
          <img alt="" src={s.lineDivider} />
        </div>

        <Link to={routes.userAgreement} className="fm-settings-row fm-settings-row--simple fm-settings-row--link">
          <span className="fm-settings-lead-icon fm-settings-lead-icon--file">
            <img alt="" src={s.iconFile} />
          </span>
          <span className="fm-settings-row-label">{t("settings.userAgreement")}</span>
        </Link>
      </div>

      <FigmaTabBar icons={settingsTabIcons} />
    </main>
  );
}

const settingsStatusAssets: StatusBarAssetUrls = {
  networkSignalLight: s.networkSignalLight,
  wifiSignalLight: s.wifiSignalLight,
  batteryLight: s.batteryLight,
  indicator: s.indicator,
  time941: s.time941,
};
