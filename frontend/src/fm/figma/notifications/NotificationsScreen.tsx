import "../home/homeScreen.css";
import "./notificationsScreen.css";

import { useEffect, useState } from "react";

import { fetchNotifications, markNotificationsReadAll, type AppNotificationItem } from "../../api/fetchNotifications";
import { hasApiBase } from "../../api/env";
import { useFmLocale } from "../../i18n/useFmLocale";
import { FigmaAppBar } from "../components/FigmaAppBar";
import { FigmaStatusBar } from "../components/FigmaStatusBar";
import { FigmaTabBar } from "../components/FigmaTabBar";
import type { AppBarAssetUrls } from "../types/appBarAssets";
import type { StatusBarAssetUrls } from "../types/statusBarAssets";
import type { TabBarIconUrls } from "../types/tabBarIcons";
import { routes } from "../routes";
import { MOCK_NOTIFICATIONS } from "./notificationsMock";
import { notificationAssets as n } from "./notificationAssets";
import { useAppSession } from "../../session/useAppSession";

const notificationStatusAssets: StatusBarAssetUrls = {
  networkSignalLight: n.networkSignalLight,
  wifiSignalLight: n.wifiSignalLight,
  batteryLight: n.batteryLight,
  indicator: n.indicator,
  time941: n.time941,
};

const notificationTabIcons: TabBarIconUrls = {
  home: n.tabHome,
  wallet: n.tabWallet,
  bot: n.tabBot,
  support: n.tabSupport,
};

const notificationAppBarAssets: AppBarAssetUrls = {
  backIcon: n.group1,
  dividerLine: n.lineAppBar,
  settingsIcon: n.settingsIcon,
  bellIcon: n.bellIcon,
};

const notificationMockItems: AppNotificationItem[] = MOCK_NOTIFICATIONS.map((item) => ({
  ...item,
  kind: item.variant === "error" ? "withdraw" : "deposit",
}));

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
  const err = variant === "error";
  return (
    <article className="fm-notify-card">
      <div className="fm-notify-title-row">
        <span className={err ? "fm-notify-type-badge fm-notify-type-badge--err" : "fm-notify-type-badge fm-notify-type-badge--ok"}>
          <img alt="" src={err ? n.errorMark : n.successMark} />
        </span>
        <p className="fm-notify-type-label">{err ? t("notifications.unsuccessful") : t("notifications.successful")}</p>
      </div>
      <div className="fm-notify-desc-row">
        <span className="fm-notify-wallet-icon">
          <img alt="" src={n.wallet} />
        </span>
        <p className="fm-notify-desc-text">{message}</p>
      </div>
      <p className="fm-notify-date">{date}</p>
    </article>
  );
}

/** Экран «1 | Notification» — node 1:3770, `notifications__full-screen__1-3770.tsx`. */
export default function NotificationsScreen() {
  const { t } = useFmLocale();
  const { phase, refreshNotifications } = useAppSession();
  const [items, setItems] = useState<AppNotificationItem[]>(notificationMockItems);

  useEffect(() => {
    if (!hasApiBase()) {
      setItems(notificationMockItems);
      return;
    }
    if (phase !== "ready") return;

    let cancelled = false;
    const load = async () => {
      const payload = await fetchNotifications(50);
      if (!cancelled && payload) {
        setItems(payload.items);
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

  return (
    <main className="fm-notifications" data-node-id="1:3770" aria-label={t("notifications.title")}>
      <FigmaStatusBar assets={notificationStatusAssets} />

      <FigmaAppBar
        assets={notificationAppBarAssets}
        backTo={routes.home}
        title={t("notifications.appBarTitle")}
        bellStatic
      />

      <div className="fm-abs fm-notify-stack">
        <div className="fm-notify-group">
          {items.slice(0, 3).map((item) => (
            <NotificationCard key={item.id} variant={item.variant} message={item.message} date={item.date} />
          ))}
        </div>

        <div className="fm-notify-divider">
          <img alt="" src={n.lineDivider} />
        </div>

        <div className="fm-notify-group">
          {items.slice(3).map((item) => (
            <NotificationCard key={item.id} variant={item.variant} message={item.message} date={item.date} />
          ))}
        </div>
      </div>

      <FigmaTabBar icons={notificationTabIcons} />
    </main>
  );
}
