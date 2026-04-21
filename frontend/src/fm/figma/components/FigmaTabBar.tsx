import { NavLink, useLocation } from "react-router-dom";

import { useFmLocale } from "../../i18n/useFmLocale";
import { routes } from "../routes";
import type { TabBarIconUrls } from "../types/tabBarIcons";
import { type TabBarActive, getTabBarActive } from "./tabBarActive";
import { sharedTabBarIcons } from "./sharedTabBarIcons";

export type FigmaTabBarForcedTab = TabBarActive;

/**
 * Нижняя навигация (Figma node 1:3688 / 1:3702 / 1:3735 / 1:3752).
 * Иконки задаются экраном (`icons`), т.к. в MCP у разных фреймов разные file hashes.
 * Подсветка активной вкладки синхронизируется со всем стеком маршрутов кошелька и Support.
 * `forceActiveTab` — если подсветка не совпадает с URL (напр. Social Media → Home).
 */
export function FigmaTabBar({
  icons: _icons,
  forceActiveTab,
}: {
  icons: TabBarIconUrls;
  forceActiveTab?: FigmaTabBarForcedTab;
}) {
  const { pathname } = useLocation();
  const { t } = useFmLocale();
  const active = forceActiveTab ?? getTabBarActive(pathname);
  const icons = sharedTabBarIcons;

  return (
    <nav className="fm-abs fm-tabbar" aria-label="Primary" data-active-tab={active ?? undefined}>
      <div className="fm-tabbar-nav">
        <NavLink
          to={routes.home}
          end
          className={() => `fm-tab${active === "home" ? " fm-tab--active" : ""}`}
          aria-current={active === "home" ? "page" : undefined}
          aria-label={t("tab.home")}
        >
          <span className="fm-tab-icon fm-tab-icon--home" aria-hidden="true">
            <img alt="" src={icons.home} />
          </span>
        </NavLink>
        <NavLink
          to={routes.balanceDeposit}
          className={() => `fm-tab${active === "wallet" ? " fm-tab--active" : ""}`}
          aria-current={active === "wallet" ? "page" : undefined}
          aria-label={t("tab.wallet")}
        >
          <span className="fm-tab-icon fm-tab-icon--wallet" aria-hidden="true">
            <img alt="" src={icons.wallet} />
          </span>
        </NavLink>
        <NavLink
          to={routes.bot}
          className={() => `fm-tab${active === "bot" ? " fm-tab--active" : ""}`}
          aria-current={active === "bot" ? "page" : undefined}
          aria-label={t("tab.bot")}
        >
          <span className="fm-tab-icon fm-tab-icon--bot" aria-hidden="true">
            <img alt="" src={icons.bot} />
          </span>
        </NavLink>
        <NavLink
          to={routes.support}
          className={() => `fm-tab${active === "support" ? " fm-tab--active" : ""}`}
          aria-current={active === "support" ? "page" : undefined}
          aria-label={t("tab.support")}
        >
          <span className="fm-tab-icon fm-tab-icon--support" aria-hidden="true">
            <img alt="" src={icons.support} />
          </span>
        </NavLink>
      </div>
    </nav>
  );
}
