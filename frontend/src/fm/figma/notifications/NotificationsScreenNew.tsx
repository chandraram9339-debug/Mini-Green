import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  fetchNotifications,
  markNotificationsReadAll,
  type AppNotificationItem,
} from "../../api/fetchNotifications";
import { hasApiBase } from "../../api/env";
import { useFmLocale } from "../../i18n/useFmLocale";
import { useAppSession } from "../../session/useAppSession";
import { routes } from "../routes";
import { MOCK_NOTIFICATIONS } from "./notificationsMock";

import s from "./notificationsScreenNew.module.css";

/* ── Mock items — same mapping as old screen ─────────────────── */
const notificationMockItems: AppNotificationItem[] = MOCK_NOTIFICATIONS.map((item) => ({
  ...item,
  kind: item.variant === "error" ? "withdraw" : "deposit",
}));

/* ── Notification card ───────────────────────────────────────── */
function NotificationCard({
  variant,
  message,
  date,
}: {
  variant: "success" | "error";
  message: string;
  date: string;
}) {
  const { t } = useFmLocale();
  const isSuccess = variant === "success";

  return (
    <article className={s.card}>
      {/* Title row */}
      <div className={s.titleRow}>
        {isSuccess ? (
          <div className={s.badgeSuccess} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3.5 8L6.5 11L12.5 5" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
            </svg>
          </div>
        ) : (
          <div className={s.badgeError} aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3L11 11M3 11L11 3" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
        <p className={s.typeLabel}>
          {isSuccess ? t("notifications.successful") : t("notifications.unsuccessful")}
        </p>
        <p className={s.dateLabel}>{date}</p>
      </div>

      {/* Description row */}
      <div className={s.descRow}>
        {/* Wallet icon — aligned under badge */}
        <div className={s.walletIconWrap} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M12.25 4.667H1.75V11.667H12.25V4.667Z" stroke="#8494AF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M1.75 4.667V2.333H9.917V4.667" stroke="#8494AF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.333 8.167H10.5" stroke="#8494AF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className={s.descText}>{message}</p>
      </div>
    </article>
  );
}

/* ── AppBar ──────────────────────────────────────────────────── */
function AppBar({ title }: { title: string }) {
  const navigate = useNavigate();
  const { t } = useFmLocale();
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
          {/* Bell is static on the notifications screen itself (current route) */}
          <div
            className={`${s.appBarBellStatic} fm-appbar-hit-static`}
            role="img"
            aria-label={t("notifications.appBarTitle")}
          >
            <svg width="18" height="19" viewBox="0 0 18 19" fill="none" aria-hidden="true">
              <path d="M2 15V7C2 5.143 2.738 3.363 4.05 2.05C5.363.738 7.143 0 9 0c1.857 0 3.637.738 4.95 2.05C15.263 3.363 16 5.143 16 7v8" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              <path d="M0 15H18" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              <path d="M7 19H11" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
            </svg>
          </div>
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

/* ── Main Screen ─────────────────────────────────────────────── */
export default function NotificationsScreenNew() {
  const { t } = useFmLocale();
  const { phase, refreshNotifications } = useAppSession();

  // Start empty (not mock) so there's no flash of fake data while API loads
  const [items, setItems] = useState<AppNotificationItem[]>(
    hasApiBase() ? [] : notificationMockItems,
  );
  const [loading, setLoading] = useState(hasApiBase());

  /* Same fetch logic as old NotificationsScreen */
  useEffect(() => {
    if (!hasApiBase()) {
      setItems(notificationMockItems);
      setLoading(false);
      return;
    }
    if (phase !== "ready") return;

    let cancelled = false;
    const load = async () => {
      const payload = await fetchNotifications(50);
      if (!cancelled) {
        setItems(payload ? payload.items : []);
        setLoading(false);
      }
    };

    void load();
    void markNotificationsReadAll().then(() => refreshNotifications());
    const intervalId = window.setInterval(() => void load(), 5_000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [phase, refreshNotifications]);

  /* Split into two groups at index 3 — same as old design */
  const group1 = items.slice(0, 3);
  const group2 = items.slice(3);

  return (
    <div className={s.screen} aria-label={t("notifications.title")}>
      <AppBar title={t("notifications.appBarTitle")} />

      <div className={s.body}>
        {/* While loading from API — show nothing to avoid fake-data flash */}
        {!loading && items.length === 0 && (
          <p className={s.emptyText}>No notifications</p>
        )}

        {/* Group 1 */}
        {!loading && group1.length > 0 && (
          <div className={s.group}>
            {group1.map((item) => (
              <NotificationCard
                key={item.id}
                variant={item.variant}
                message={item.message}
                date={item.date}
              />
            ))}
          </div>
        )}

        {/* Divider between groups */}
        {!loading && group1.length > 0 && group2.length > 0 && (
          <div className={s.divider} aria-hidden="true" />
        )}

        {/* Group 2 */}
        {!loading && group2.length > 0 && (
          <div className={s.group}>
            {group2.map((item) => (
              <NotificationCard
                key={item.id}
                variant={item.variant}
                message={item.message}
                date={item.date}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
