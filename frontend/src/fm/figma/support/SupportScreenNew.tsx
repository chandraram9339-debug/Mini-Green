import "../home/homeScreen.css";

import { Link, useNavigate } from "react-router-dom";

import { useFmLocale } from "../../i18n/useFmLocale";
import { useAppSession } from "../../session/useAppSession";
import { SUPPORT_TELEGRAM_URL, openTelegramOrExternal } from "../../config/links";
import { routes } from "../routes";

import s from "./supportScreenNew.module.css";

/* ── AppBar ──────────────────────────────────────────────────── */
function AppBar({ title, bellCount }: { title: string; bellCount: number }) {
  const navigate = useNavigate();
  return (
    <header className={s.appBar}>
      <div className={s.appBarRow}>
        <button
          type="button"
          className={`${s.appBarBack} fm-appbar-hit-dark`}
          onClick={() => navigate(routes.home)}
          aria-label="Back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 12.8H20.8V11.2H20V12V12.8ZM20 12V11.2H4V12V12.8H20V12Z" fill="#ffffff"/>
            <path d="M10 18L4 12L10 6" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
          </svg>
        </button>

        <span className={s.appBarTitle}>{title}</span>

        <div className={s.appBarIcons}>
          <Link to={routes.notifications} className={`${s.appBarBell} fm-appbar-hit-dark`} aria-label="Notifications">
            <svg width="18" height="19" viewBox="0 0 18 19" fill="none">
              <path d="M2 15V7C2 5.143 2.738 3.363 4.05 2.05C5.363.738 7.143 0 9 0c1.857 0 3.637.738 4.95 2.05C15.263 3.363 16 5.143 16 7v8" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              <path d="M0 15H18" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              <path d="M7 19H11" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
            </svg>
            {bellCount > 0 && (
              <span className={s.appBarBellBadge}><span>{bellCount > 99 ? "99+" : bellCount}</span></span>
            )}
          </Link>
          <Link to={routes.settings} className={`${s.appBarGear} fm-appbar-hit-dark`} aria-label="Settings">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7 5C5.895 5 5 5.895 5 7v1.172c0 .53-.211 1.04-.586 1.414l-1 1C2.633 11.367 2.633 12.633 3.414 13.414l1 1C4.789 14.789 5 15.298 5 15.828V17c0 1.105.895 2 2 2h1.172c.53 0 1.04.211 1.414.586l1 1C11.367 21.367 12.633 21.367 13.414 20.586l1-1C14.789 19.211 15.298 19 15.828 19H17c1.105 0 2-.895 2-2v-1.172c0-.53.211-1.04.586-1.414l1-1c.781-.781.781-2.047 0-2.828l-1-1A2 2 0 0 1 19 8.172V7c0-1.105-.895-2-2-2h-1.172c-.53 0-1.04-.211-1.414-.586l-1-1C12.633 2.633 11.367 2.633 10.586 3.414l-1 1A2 2 0 0 1 8.172 5H7Z" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
      <div className={s.appBarDivider} />
    </header>
  );
}

/* ── Support Chat icon ───────────────────────────────────────── */
function SupportChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M21 4H21.8V3.2H21V4ZM3 4V3.2H2.2V4H3ZM3 21H2.2C2.2 21.3236 2.39491 21.6153 2.69385 21.7391C2.99279 21.8629 3.33689 21.7945 3.56569 21.5657L3 21ZM6 18V17.2H5.66863L5.43431 17.4343L6 18ZM21 18V18.8H21.8V18H21ZM21 4V3.2H3V4V4.8H21V4ZM3 4H2.2V21H3H3.8V4H3ZM3 21L3.56569 21.5657L6.56569 18.5657L6 18L5.43431 17.4343L2.43431 20.4343L3 21ZM6 18V18.8H21V18V17.2H6V18ZM21 18H21.8V4H21H20.2V18H21Z" fill="#ffffff"/>
      <path d="M8 11H8.01" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 11H12.01" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 11H16.01" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ── FAQ icon ────────────────────────────────────────────────── */
function FAQIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M8 8C8 7.204 8.369 6.441 9.025 5.879C9.681 5.316 10.572 5 11.5 5H12.5C13.428 5 14.319 5.316 14.975 5.879C15.63 6.44 16 7.204 16 8C16.0368 8.64925 15.8617 9.2929 15.501 9.83398C15.1402 10.3751 14.6135 10.7843 14 11C13.386 11.288 12.86 11.833 12.499 12.555C12.1303 13.3153 11.9588 14.1561 12 15" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 19V19.01" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ── Main Screen ─────────────────────────────────────────────── */
export default function SupportScreenNew() {
  const { t } = useFmLocale();
  const { notificationUnreadCount, uiSettings, wallet } = useAppSession();
  const supportHref =
    (uiSettings?.support_url ?? wallet?.support_url ?? "").trim() || SUPPORT_TELEGRAM_URL;

  return (
    <div className={s.screen} aria-label={t("support.title")}>
      <AppBar title={t("support.title")} bellCount={notificationUnreadCount} />

      <div className={s.body}>
        <div className={s.listSection}>
          {/* Support Chat */}
          <a
            href={supportHref}
            className={s.listItem}
            onClick={(e) => {
              e.preventDefault();
              openTelegramOrExternal(supportHref);
            }}
          >
            <SupportChatIcon />
            <span className={s.listItemLabel}>{t("support.chat")}</span>
          </a>

          {/* FAQ */}
          <Link to={routes.faq} className={`${s.listItem} ${s.listItemDimmed}`}>
            <FAQIcon />
            <span className={s.listItemLabel}>{t("faq.title")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
