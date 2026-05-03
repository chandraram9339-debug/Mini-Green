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
          <Link to={routes.settings} className={`${s.appBarBack} fm-appbar-hit-dark`} aria-label={t("common.back")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 12.8H20.8V11.2H20V12V12.8ZM20 12V11.2H4V12V12.8H20V12Z" fill="#ffffff"/>
              <path d="M10 18L4 12L10 6" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
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
    </div>
  );
}
