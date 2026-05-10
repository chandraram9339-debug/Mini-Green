import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { resolveFmMessage, type MessageKey } from "../../i18n/messages";
import { useFmLocale } from "../../i18n/useFmLocale";
import { useAppSession } from "../../session/useAppSession";
import { routes } from "../routes";
import { openTelegramReferralShare } from "../../config/links";
import { showMiniAppAlert } from "../../telegram/uiFeedback";
import {
  isPushEnabled,
  isVibrationEnabled,
  setPushEnabled,
  setVibrationEnabled,
} from "../../preferences/devicePreferences";
import { prepareGettingStartedReplay, prepareOnboardingReplay } from "../../onboarding-tour/onboardingStorage";

import s from "./settingsScreenNew.module.css";

/* ─────────────────────────── Icons ─────────────────────────── */

function TranslateIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M19.5 18L21 21M12.5 18H19.5H12.5ZM12.5 18L11 21L12.5 18ZM12.5 18L16 11L19.5 18H12.5Z" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
      <path d="M9 3V5" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
      <path d="M10.048 14.5C8.508 12.906 7.276 11.041 6.412 9" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
      <path d="M12.751 5C11.783 10.77 8.07 15.61 3 18.129" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
      <path d="M3 5H15" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
    </svg>
  );
}

function NotificationIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M5 18V10C5 8.143 5.737 6.363 7.05 5.05C8.363 3.737 10.143 3 12 3c1.857 0 3.637.737 4.95 2.05C18.263 6.363 19 8.143 19 10v8" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
      <path d="M3 18H21" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
      <path d="M10 22H14" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
    </svg>
  );
}

function VibrateIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M6 5H18V19H6V5Z" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 8V16" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M21 8V16" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

function SupportChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M21 4H21.8V3.2H21V4ZM3 4V3.2H2.2V4H3ZM3 21H2.2C2.2 21.3236 2.39491 21.6153 2.69385 21.7391C2.99279 21.8629 3.33689 21.7945 3.56569 21.5657L3 21ZM6 18V17.2H5.669l-.235.235L6 18ZM21 18V18.8H21.8V18H21ZM21 4V3.2H3V4V4.8H21V4ZM3 4H2.2V21H3H3.8V4H3ZM3 21l.566.566 3-3L6 18l-.435-.435-3 3L3 21ZM6 18V18.8H21V18V17.2H6V18ZM21 18H21.8V4H21H20.2V18H21Z" fill="#ffffff"/>
      <path d="M8 11H8.01M12 11H12.01M16 11H16.01" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M8 8C8 7.204 8.369 6.441 9.025 5.879C9.681 5.316 10.572 5 11.5 5H12.5C13.428 5 14.319 5.316 14.975 5.879C15.63 6.44 16 7.204 16 8C16.037 8.649 15.862 9.293 15.501 9.834C15.14 10.375 14.614 10.784 14 11C13.386 11.288 12.86 11.833 12.499 12.555C12.13 13.315 11.959 14.156 12 15" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 19V19.01" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function UserPlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M16 21V19C16 17.939 15.579 16.922 14.828 16.172C14.078 15.421 13.061 15 12 15H5C3.939 15 2.922 15.421 2.172 16.172C1.421 16.922 1 17.939 1 19V21" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.5 11C10.709 11 12.5 9.209 12.5 7C12.5 4.791 10.709 3 8.5 3C6.291 3 4.5 4.791 4.5 7C4.5 9.209 6.291 11 8.5 11Z" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 8V14M17 11H23" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M10.29 3.86L1.82 18C1.645 18.3 1.553 18.64 1.552 18.986C1.551 19.333 1.642 19.673 1.815 19.974C1.988 20.275 2.238 20.525 2.539 20.699C2.84 20.873 3.18 20.964 3.527 20.964H20.473C20.82 20.964 21.16 20.873 21.461 20.699C21.762 20.525 22.012 20.275 22.185 19.974C22.358 19.673 22.449 19.333 22.448 18.986C22.447 18.64 22.355 18.3 22.18 18L13.71 3.86C13.532 3.566 13.28 3.323 12.979 3.154C12.679 2.985 12.34 2.896 11.995 2.896C11.65 2.896 11.311 2.985 11.011 3.154C10.71 3.323 10.458 3.566 10.28 3.86H10.29Z" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 9V13M12 17V17.01" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 21V3H15L20 8V21H4Z" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 3V8H20" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function DemoTopUpIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3V21M12 3L8 7M12 3L16 7"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <path d="M5 13H19" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}

function OnboardingTourIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2L4 6V12C4 16.5 8 21 12 22C16 21 20 16.5 20 12V6L12 2Z"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 12L11 14L15 9" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M7 5L11 9L7 13" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="12" fill="#40FF96"/>
      <path d="M8 11.5L11 14.5L17 8.5" stroke="#000000" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
    </svg>
  );
}

/* ── Toggle ──────────────────────────────────────────────────── */
function Toggle({
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
      role="switch"
      aria-checked={pressed}
      aria-label={ariaLabel}
      className={s.toggle}
      onClick={onToggle}
    >
      <span className={s.toggleTrack} aria-hidden="true" />
      <span
        className={`${s.toggleThumb} ${pressed ? s.toggleThumbOn : s.toggleThumbOff}`}
        aria-hidden="true"
      />
    </button>
  );
}

/* ── AppBar ──────────────────────────────────────────────────── */
function AppBar({ title, bellBadge }: { title: string; bellBadge?: number }) {
  const navigate = useNavigate();
  const { t } = useFmLocale();
  return (
    <header className={s.appBar}>
      <div className={s.appBarRow}>
        <button
          type="button"
          className={`${s.appBarBack} fm-appbar-hit-dark`}
          onClick={() => navigate(routes.home)}
          aria-label={t("common.back")}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 12.8H20.8V11.2H20V12V12.8ZM20 12V11.2H4V12V12.8H20V12Z" fill="#ffffff"/>
            <path d="M10 18L4 12L10 6" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
          </svg>
        </button>

        <span className={s.appBarTitle}>{title}</span>

        <div className={s.appBarIcons}>
          <Link to={routes.notifications} className={`${s.appBarBell} fm-appbar-hit-dark`} aria-label={t("notifications.title")}>
            <svg width="18" height="19" viewBox="0 0 18 19" fill="none">
              <path d="M2 15V7C2 5.143 2.738 3.363 4.05 2.05C5.363.738 7.143 0 9 0c1.857 0 3.637.738 4.95 2.05C15.263 3.363 16 5.143 16 7v8" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              <path d="M0 15H18" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              <path d="M7 19H11" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
            </svg>
            {bellBadge != null && bellBadge > 0 && (
              <span className={s.appBarBellBadge}><span>{bellBadge > 99 ? "99" : bellBadge}</span></span>
            )}
          </Link>
          <span className={`${s.appBarGear} ${s.appBarGearDecoration} fm-appbar-hit-static`} aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7 5C5.895 5 5 5.895 5 7v1.172c0 .53-.211 1.04-.586 1.414l-1 1C2.633 11.367 2.633 12.633 3.414 13.414l1 1C4.789 14.789 5 15.298 5 15.828V17c0 1.105.895 2 2 2h1.172c.53 0 1.04.211 1.414.586l1 1C11.367 21.367 12.633 21.367 13.414 20.586l1-1C14.789 19.211 15.298 19 15.828 19H17c1.105 0 2-.895 2-2v-1.172c0-.53.211-1.04.586-1.414l1-1c.781-.781.781-2.047 0-2.828l-1-1A2 2 0 0 1 19 8.172V7c0-1.105-.895-2-2-2h-1.172c-.53 0-1.04-.211-1.414-.586l-1-1C12.633 2.633 11.367 2.633 10.586 3.414l-1 1A2 2 0 0 1 8.172 5H7Z" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
      </div>
      <div className={s.appBarDivider} />
    </header>
  );
}

/* ── Main Screen ─────────────────────────────────────────────── */
export default function SettingsScreenNew() {
  const { locale, setLocale } = useFmLocale();
  const { notificationUnreadCount, wallet, uiSettings } = useAppSession();

  /* Language dropdown */
  const [langOpen, setLangOpen] = useState(false);
  const langWrapRef = useRef<HTMLDivElement>(null);

  /* Device preferences — same logic as old SettingsScreen */
  const [pushOn, setPushOn] = useState(() => isPushEnabled());
  const [vibrationOn, setVibrationOn] = useState(() => isVibrationEnabled());

  /* Click-outside close for language dropdown */
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

  const togglePush = useCallback(() => {
    setPushOn((prev) => {
      const next = !prev;
      setPushEnabled(next);
      return next;
    });
  }, []);

  const toggleVibration = useCallback(() => {
    setVibrationOn((prev) => {
      const next = !prev;
      setVibrationEnabled(next);
      return next;
    });
  }, []);

  const langLabel =
    locale === "es"
      ? resolveFmMessage(locale, "settings.langSpanish")
      : resolveFmMessage(locale, "settings.langEnglish");
  const tx = (key: MessageKey) => resolveFmMessage(locale, key);

  return (
    <div className={s.screen} key={locale} aria-label={tx("settings.title")}>
      <AppBar title={tx("settings.title")} bellBadge={notificationUnreadCount} />

      <div className={s.body}>

        {/* ── Language section ─────────────────────────────── */}
        <div className={`${s.section} ${s.sectionLang}`} ref={langWrapRef}>
          <button
            type="button"
            className={s.row}
            aria-expanded={langOpen}
            aria-haspopup="listbox"
            aria-label={tx("settings.language")}
            onClick={() => setLangOpen((o) => !o)}
          >
            <span className={s.rowIcon}><TranslateIcon /></span>
            <span className={s.rowLabel} key={`${locale}-settings-language`}>{tx("settings.language")}</span>
            <span className={s.rowRight}>
              <span className={s.rowRightLabel}>{langLabel}</span>
            </span>
          </button>

          {langOpen && (
            <div className={s.langDropdown} role="listbox" aria-label={tx("settings.language")}>
              {(["en", "es"] as const).map((code) => {
                const label =
                  code === "en"
                    ? resolveFmMessage(locale, "settings.langEnglish")
                    : resolveFmMessage(locale, "settings.langSpanish");
                const selected = locale === code;
                return (
                  <button
                    key={code}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={s.langOption}
                    onClick={() => {
                      setLocale(code);
                      setLangOpen(false);
                    }}
                  >
                    {selected ? (
                      <span className={s.langOptionCheck}><CheckCircleIcon /></span>
                    ) : (
                      <span className={s.langOptionCheckEmpty} />
                    )}
                    <span className={s.langOptionLabel}>{label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className={s.divider} />

        {/* ── Notifications section ────────────────────────── */}
        <div className={s.section}>
          <div className={s.row} style={{ cursor: "default" }}>
            <span className={s.rowIcon}><NotificationIcon /></span>
            <span className={s.rowLabel} key={`${locale}-settings-push`}>{tx("settings.push")}</span>
            <Toggle pressed={pushOn} onToggle={togglePush} ariaLabel={tx("settings.push")} />
          </div>

          <div className={s.row} style={{ cursor: "default" }}>
            <span className={s.rowIcon}><VibrateIcon /></span>
            <span className={s.rowLabel} key={`${locale}-settings-vibration`}>{tx("settings.vibration")}</span>
            <Toggle pressed={vibrationOn} onToggle={toggleVibration} ariaLabel={tx("settings.vibration")} />
          </div>
        </div>

        <div className={s.divider} />

        <div className={s.section}>
          <Link to={routes.demoTopUp} className={s.row}>
            <span className={s.rowIcon}>
              <DemoTopUpIcon />
            </span>
            <span className={s.rowLabel} key={`${locale}-settings-demo-topup`}>
              {tx("demo.settingsTopUp")}
            </span>
            <span className={s.rowChevron}>
              <ChevronRightIcon />
            </span>
          </Link>
        </div>

        <div className={s.divider} />

        {/* ── Support / FAQ / Referral / Seed section ─────── */}
        <div className={s.section}>
          <Link to={routes.support} className={s.row}>
            <span className={s.rowIcon}><SupportChatIcon /></span>
            <span className={s.rowLabel} key={`${locale}-settings-support`}>{tx("settings.support")}</span>
            <span className={s.rowChevron}><ChevronRightIcon /></span>
          </Link>

          <Link to={routes.faq} className={s.row}>
            <span className={s.rowIcon}><QuestionIcon /></span>
            <span className={s.rowLabel} key={`${locale}-settings-faq`}>{tx("settings.faq")}</span>
            <span className={s.rowChevron}><ChevronRightIcon /></span>
          </Link>

          <button
            type="button"
            className={s.row}
            onClick={() => {
              prepareOnboardingReplay();
              window.location.reload();
            }}
          >
            <span className={s.rowIcon}>
              <OnboardingTourIcon />
            </span>
            <span className={s.rowLabel} key={`${locale}-settings-replay-tour`}>
              {tx("settings.replayOnboardingTour")}
            </span>
            <span className={s.rowChevron}>
              <ChevronRightIcon />
            </span>
          </button>

          <button
            type="button"
            className={s.row}
            onClick={() => {
              prepareGettingStartedReplay();
              window.location.reload();
            }}
          >
            <span className={s.rowIcon}>
              <OnboardingTourIcon />
            </span>
            <span className={s.rowLabel} key={`${locale}-settings-replay-getting-started`}>
              {tx("settings.replayGettingStarted")}
            </span>
            <span className={s.rowChevron}>
              <ChevronRightIcon />
            </span>
          </button>

          <button
            type="button"
            className={s.row}
            onClick={() => {
              const ok = openTelegramReferralShare(
                wallet?.referralLink,
                uiSettings?.public_telegram_bot_username,
              );
              if (!ok) showMiniAppAlert(resolveFmMessage(locale, "settings.referralLinkMissing"), { force: true });
            }}
          >
            <span className={s.rowIcon}><UserPlusIcon /></span>
            <span className={s.rowLabel} key={`${locale}-settings-referral`}>{tx("settings.referralLink")}</span>
            <span className={s.rowChevron}><ChevronRightIcon /></span>
          </button>

          <Link to={routes.seedCode} className={s.row}>
            <span className={s.rowIcon}><AlertTriangleIcon /></span>
            <span className={s.rowLabel} key={`${locale}-settings-seed`}>{tx("settings.seedCode")}</span>
            <span className={s.rowChevron}><ChevronRightIcon /></span>
          </Link>
        </div>

        <div className={s.divider} />

        {/* ── User Agreement ───────────────────────────────── */}
        <div className={s.section}>
          <Link to={routes.userAgreement} className={s.row}>
            <span className={s.rowIcon}><FileIcon /></span>
            <span className={s.rowLabel} key={`${locale}-settings-agreement`}>{tx("settings.userAgreement")}</span>
            <span className={s.rowChevron}><ChevronRightIcon /></span>
          </Link>
        </div>

      </div>
    </div>
  );
}
