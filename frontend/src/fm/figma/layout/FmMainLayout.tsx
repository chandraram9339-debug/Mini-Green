import { Outlet } from "react-router-dom";

import { FmSharedPillTabBar } from "./FmSharedPillTabBar";

import s from "./fmMainLayout.module.css";

/**
 * Unified shell: centered column (max 500px) + scroll + bottom tab in one width context.
 */
export function FmMainLayout() {
  return (
    <div className={s.root}>
      <div className={s.column}>
        <div className={s.scroll}>
          <Outlet />
        </div>
        <div className={s.bottomNavArea}>
          <FmSharedPillTabBar />
        </div>
      </div>
    </div>
  );
}
