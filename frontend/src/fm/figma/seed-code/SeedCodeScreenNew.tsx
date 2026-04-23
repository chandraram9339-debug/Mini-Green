import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { hasApiBase } from "../../api/env";
import { fetchWalletSeed } from "../../api/fetchWalletSeed";
import { useFmLocale } from "../../i18n/useFmLocale";
import { useAppSession } from "../../session/useAppSession";
import { hapticSuccess, showMiniAppAlert } from "../../telegram/uiFeedback";
import { routes } from "../routes";
import { getSeedWords } from "./seedWords";

import s from "./seedCodeScreenNew.module.css";

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

/* ── TabBar ─────────────────────────────────────────────────── */
function BottomTabBar() {
  const tabs = [
    {
      id: "home", to: routes.home, label: "Home",
      icon: (a: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M20 20H4V10L12 4L20 10V20Z" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 14V20" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: "wallet", to: routes.balanceDeposit, label: "Wallet",
      icon: (a: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 8H3V20H21V8Z" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 8V4H17V8" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 14H17" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: "bot", to: routes.bot, label: "Bot",
      icon: (a: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M4 4V20H20" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
          <path d="M9 13L13 9L16 12L20 8" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: "support", to: routes.support, label: "Support",
      icon: (a: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 4H21.8V3.2H21V4ZM3 4V3.2H2.2V4H3ZM3 21H2.2c0 .324.195.615.694.739.299.124.637.06.866-.169L3 21ZM6 18V17.2H5.669l-.235.235L6 18ZM21 18V18.8H21.8V18H21ZM21 4V3.2H3V4V4.8H21V4ZM3 4H2.2V21H3H3.8V4H3ZM3 21l.566.566 3-3L6 18l-.435-.435-3 3L3 21ZM6 18V18.8H21V18V17.2H6V18ZM21 18H21.8V4H21H20.2V18H21Z" fill={a ? "#fff" : "#55647B"}/>
          <path d="M8 11H8.01M12 11H12.01M16 11H16.01" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ] as const;

  return (
    <nav className={s.tabBar} aria-label="Primary navigation">
      <div className={s.tabBarInner}>
        {tabs.map(({ id, to, label, icon }) => (
          <Link key={id} to={to} className={s.tabItem} aria-label={label}>
            <div className={s.tabItemIcon}>
              {icon(false)}
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
}

/* ── Screen ─────────────────────────────────────────────────── */
export default function SeedCodeScreenNew() {
  const { t } = useFmLocale();
  const { phase } = useAppSession();
  // Start with empty words so we never flash fake default seed behind the blur overlay
  const [words, setWords] = useState<readonly string[]>([]);
  const [seedMode, setSeedMode] = useState<string | null>(
    // When no API is available, fall back to static env seed words
    hasApiBase() ? null : "legacy_env",
  );
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!hasApiBase()) {
      // No API — show env-based seed words as fallback
      setWords(getSeedWords());
      setSeedMode("legacy_env");
      return;
    }
    if (phase !== "ready") return;

    void fetchWalletSeed().then((payload) => {
      if (!payload) {
        setSeedMode("fetch_error");
        return;
      }
      setSeedMode(payload.mode);
      if (payload.words.length === 12 || payload.words.length === 24) {
        setWords(payload.words);
      }
    });
  }, [phase]);

  // null = still loading from API
  const isLoading = seedMode === null;
  const showDisabledNotice =
    seedMode === "disabled" ||
    seedMode === "custodial_pk" ||
    seedMode === "legacy" ||
    seedMode === "fetch_error";

  return (
    <div className={s.screen} aria-label={t("seed.title")}>

      {/* AppBar */}
      <header className={s.appBar}>
        <div className={s.appBarRow}>
          <Link to={routes.settings} className={s.appBarBack} aria-label={t("common.back")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 12.8H20.8V11.2H20V12V12.8ZM20 12V11.2H4V12V12.8H20V12Z" fill="#55647B"/>
              <path d="M10 18L4 12L10 6" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
            </svg>
          </Link>
          <span className={s.appBarTitle}>{t("seed.title")}</span>
          <span className={s.appBarPlaceholder} aria-hidden="true" />
        </div>
        <div className={s.appBarDivider} />
      </header>

      {/* Scrollable content */}
      <div className={s.body}>
        <p className={s.lead}>{t("seed.storeHint")}</p>

        {/* Loading state — show nothing until API responds */}
        {isLoading && (
          <p className={s.lead} style={{ opacity: 0.4 }}>Loading…</p>
        )}

        {/* No seed available for this account type */}
        {!isLoading && showDisabledNotice && (
          <p className={s.lead} style={{ opacity: 0.6 }}>
            {seedMode === "fetch_error"
              ? t("seed.fetchError")
              : seedMode === "custodial_pk"
                ? "This wallet uses a custodial private key. Seed phrase is not available."
                : seedMode === "legacy"
                  ? t("seed.legacyHint")
                  : "Seed phrase is not available for this account."}
          </p>
        )}

        {/* Real seed words — only shown after API confirms they exist */}
        {!isLoading && !showDisabledNotice && words.length > 0 && (
          <div className={s.gridWrap}>
            <ul className={s.grid} aria-label={t("seed.title")}>
              {words.map((w, i) => (
                <li key={`${i}-${w}`} className={s.word}>
                  <span className={s.wordIdx}>{i + 1}</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
            {!revealed && (
              <button
                type="button"
                className={s.gridBlurOverlay}
                onClick={() => setRevealed(true)}
                aria-label="Показать фразу"
              >
                <div className={s.revealIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 5C7 5 2.73 8.11 1 12C2.73 15.89 7 19 12 19C17 19 21.27 15.89 23 12C21.27 8.11 17 5 12 5Z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.6"/>
                  </svg>
                </div>
                <span className={s.revealHint}>Нажмите, чтобы показать</span>
              </button>
            )}
          </div>
        )}

        {!isLoading && !showDisabledNotice && words.length > 0 && (
          <button
            type="button"
            className={s.copyBtn}
            onClick={() => void copySeedPhrase(words, t("seed.copied"))}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M8 4H16C17.105 4 18 4.895 18 6V14" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 8H14C15.105 8 16 8.895 16 10V18C16 19.105 15.105 20 14 20H6C4.895 20 4 19.105 4 18V10C4 8.895 4.895 8 6 8Z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {t("seed.copy")}
          </button>
        )}
      </div>

      <BottomTabBar />
    </div>
  );
}
