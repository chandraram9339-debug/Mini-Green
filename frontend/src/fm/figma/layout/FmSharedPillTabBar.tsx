import { Link, useLocation } from "react-router-dom";

import { useFmLocale } from "../../i18n/useFmLocale";
import { routes } from "../routes";
import { getTabBarActive } from "../components/tabBarActive";

import s from "./fmSharedPillTabBar.module.css";

/**
 * One pill tab bar for the whole main stack — in-flow under scroll; same width as shell (FmMainLayout).
 */
export function FmSharedPillTabBar() {
  const { pathname } = useLocation();
  const { t } = useFmLocale();
  const active = getTabBarActive(pathname);

  const tabs = [
    {
      id: "home" as const,
      to: routes.home,
      label: t("tab.home"),
      tour: "home-tab-bar" as const,
      icon: (isActive: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M20 20H4V10L12 4L20 10V20Z"
            stroke={isActive ? "#191919" : "#ffffff"}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 14V20"
            stroke={isActive ? "#191919" : "#ffffff"}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "wallet" as const,
      to: routes.balanceDeposit,
      label: t("tab.wallet"),
      tour: "getting-started-tab-wallet" as const,
      icon: (isActive: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M21 8H3V20H21V8Z"
            stroke={isActive ? "#191919" : "#ffffff"}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 8V4H17V8"
            stroke={isActive ? "#191919" : "#ffffff"}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 14H17"
            stroke={isActive ? "#191919" : "#ffffff"}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "bot" as const,
      to: routes.bot,
      label: t("tab.bot"),
      tour: "getting-started-tab-bot" as const,
      icon: (isActive: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 4V20H20"
            stroke={isActive ? "#191919" : "#ffffff"}
            strokeWidth="1.6"
            strokeLinecap="square"
            strokeLinejoin="round"
          />
          <path
            d="M9 13L13 9L16 12L20 8"
            stroke={isActive ? "#191919" : "#ffffff"}
            strokeWidth="1.6"
            strokeLinecap="square"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "support" as const,
      to: routes.support,
      label: t("tab.support"),
      tour: undefined,
      icon: (isActive: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M21 4H21.8V3.2H21V4ZM3 4V3.2H2.2V4H3ZM3 21H2.2c0 .324.195.615.694.739.299.124.637.06.866-.169L3 21ZM6 18V17.2H5.669l-.235.235L6 18ZM21 18V18.8H21.8V18H21ZM21 4V3.2H3V4V4.8H21V4ZM3 4H2.2V21H3H3.8V4H3ZM3 21l.566.566 3-3L6 18l-.435-.435-3 3L3 21ZM6 18V18.8H21V18V17.2H6V18ZM21 18H21.8V4H21H20.2V18H21Z"
            fill={isActive ? "#191919" : "#ffffff"}
          />
          <path
            d="M8 11H8.01M12 11H12.01M16 11H16.01"
            stroke={isActive ? "#191919" : "#ffffff"}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ] as const;

  return (
    <div className={s.tabDock} data-fm-main-tab-dock>
      <div className={s.tabGlowOuter} aria-hidden />
      <div className={s.tabGlowInner} aria-hidden />
      <nav className={s.tabBar} aria-label={t("common.primaryNav")} data-tour-id="home-tab-bar">
        <div className={s.tabBarInner} data-tour-id="trading-tab-bar">
          {tabs.map(({ id, to, label, tour, icon }) => {
            const isActive = active === id;
            return (
              <Link
                key={id}
                to={to}
                className={s.tabItem}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
                {...(tour ? { "data-tour-id": tour } : {})}
              >
                <div className={`${s.tabItemIcon}${isActive ? ` ${s.tabItemIconActive}` : ""}`}>{icon(isActive)}</div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
