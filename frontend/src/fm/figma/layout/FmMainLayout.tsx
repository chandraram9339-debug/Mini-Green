import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";

import { FmSharedPillTabBar } from "./FmSharedPillTabBar";

import s from "./fmMainLayout.module.css";

/**
 * Unified shell: centered column (max 500px) + scroll + bottom tab in one width context.
 */
export function FmMainLayout() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      setShowTop(el.scrollTop > 400);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={s.root}>
      <div className={s.column}>
        <div ref={scrollRef} className={`${s.scroll} fm-layout-scroll`}>
          <Outlet />
        </div>
        {showTop ? (
          <button
            type="button"
            className={s.scrollTop}
            aria-label="Scroll to top"
            onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          >
            ↑
          </button>
        ) : null}
        <div className={s.bottomNavArea}>
          <FmSharedPillTabBar />
        </div>
      </div>
    </div>
  );
}
