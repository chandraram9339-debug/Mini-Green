import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useFmLocale } from "../../i18n/useFmLocale";
import { routes } from "../routes";
import { loadAgreementTextFromUrl } from "./loadAgreementText";

import s from "./userAgreementScreenNew.module.css";

const AGREEMENT_FALLBACK = `User Agreement

By using this application you confirm that you understand the risks associated with digital assets and automated trading.

Configure VITE_USER_AGREEMENT_URL to load this text from your CMS.`;

const AGREEMENT_URL = import.meta.env.VITE_USER_AGREEMENT_URL?.trim();

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
            <div className={`${s.tabItemIcon}${id === "support" ? ` ${s.tabItemIconActive}` : ""}`}>
              {icon(id === "support")}
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
}

/* ── Screen ─────────────────────────────────────────────────── */
export default function UserAgreementScreenNew() {
  const { t } = useFmLocale();
  const [text, setText] = useState(AGREEMENT_FALLBACK);
  const [status, setStatus] = useState<"idle" | "loading" | "error">(() =>
    AGREEMENT_URL ? "loading" : "idle",
  );

  useEffect(() => {
    if (!AGREEMENT_URL) return;
    loadAgreementTextFromUrl(AGREEMENT_URL)
      .then((loaded) => {
        const trimmed = loaded.trim();
        if (trimmed) setText(trimmed);
        setStatus("idle");
      })
      .catch(() => {
        setText(AGREEMENT_FALLBACK);
        setStatus("error");
      });
  }, []);

  return (
    <div className={s.screen} aria-label={t("agreement.title")}>

      {/* AppBar */}
      <header className={s.appBar}>
        <div className={s.appBarRow}>
          <Link to={routes.settings} className={s.appBarBack} aria-label={t("common.back")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 12.8H20.8V11.2H20V12V12.8ZM20 12V11.2H4V12V12.8H20V12Z" fill="#55647B"/>
              <path d="M10 18L4 12L10 6" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
            </svg>
          </Link>
          <span className={s.appBarTitle}>{t("agreement.title")}</span>
          <span className={s.appBarPlaceholder} aria-hidden="true" />
        </div>
        <div className={s.appBarDivider} />
      </header>

      {/* Scrollable body */}
      <div className={s.body}>
        <div className={s.card}>
          {status === "loading" ? (
            <p className={s.textMuted}>{t("common.loading")}</p>
          ) : (
            <>
              {status === "error" && (
                <p className={s.textMuted} role="alert">
                  {t("common.agreementLoadError")}
                </p>
              )}
              <pre className={s.text}>{text}</pre>
            </>
          )}
        </div>
      </div>

      <BottomTabBar />
    </div>
  );
}
