import { useEffect, useMemo, useState, type CSSProperties } from "react";

import { appBarLogoUrl } from "../figma/assets/appBarShared";

type SplashScreenProps = {
  durationMs: number;
};

function resolveSplashScheme(): "light" | "dark" {
  if (window.Telegram?.WebApp) return "light";
  return document.documentElement.dataset.fmTheme === "dark" ? "dark" : "light";
}

/** В TG WebView (Android/iOS) filter на <img> внутри 3D rotateY даёт почти чёрный логотип; в браузере оставляем img+filter. */
function isTelegramMiniAppWebView(): boolean {
  return typeof window !== "undefined" && Boolean(window.Telegram?.WebApp);
}

function SplashLogoGlyph({ labelled }: { labelled: boolean }) {
  if (isTelegramMiniAppWebView()) {
    return (
      <div
        className="fm-splash-logo-mark"
        role={labelled ? "img" : undefined}
        aria-label={labelled ? "Palladium" : undefined}
        aria-hidden={labelled ? undefined : true}
      />
    );
  }
  return (
    <img
      className="fm-splash-logo-image"
      alt={labelled ? "Palladium" : ""}
      src={appBarLogoUrl}
      aria-hidden={labelled ? undefined : true}
    />
  );
}

export function SplashScreen({ durationMs }: SplashScreenProps) {
  const [scheme, setScheme] = useState<"light" | "dark">(() => resolveSplashScheme());
  const [spinProgress, setSpinProgress] = useState(0);

  useEffect(() => {
    const syncScheme = () => setScheme(resolveSplashScheme());
    const tg = window.Telegram?.WebApp;
    syncScheme();
    tg?.onEvent?.("themeChanged", syncScheme);
    return () => tg?.offEvent?.("themeChanged", syncScheme);
  }, []);

  useEffect(() => {
    let frameId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      setSpinProgress(progress);
      if (progress < 1) frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [durationMs]);

  const orbitStyle = useMemo(() => {
    const eased = 1 - Math.pow(1 - spinProgress, 4.5);
    const angle = -1620 * eased;
    const scale = 0.96 + 0.04 * (1 - Math.pow(1 - Math.min(spinProgress * 1.8, 1), 3));
    return {
      transform: `translateZ(0) rotateY(${angle}deg) scale(${scale})`,
    } as CSSProperties;
  }, [spinProgress]);

  const animationStyle = {
    "--fm-splash-duration": `${durationMs}ms`,
  } as CSSProperties;

  const tgMini = isTelegramMiniAppWebView();

  return (
    <div
      className={`fm-splash fm-splash--${scheme}${tgMini ? " fm-splash--tg-miniapp" : ""}`}
      style={animationStyle}
      role="status"
      aria-label="Loading"
    >
      <div className="fm-splash-shell">
        <div className="fm-splash-logo-wrap">
          <div className="fm-splash-logo-stage">
            <div className="fm-splash-logo-orbit" style={orbitStyle}>
              <div className="fm-splash-logo-face fm-splash-logo-face--front">
                <SplashLogoGlyph labelled />
                <span className="fm-splash-logo-shimmer" aria-hidden="true" />
              </div>
              <div className="fm-splash-logo-face fm-splash-logo-face--back" aria-hidden="true">
                <SplashLogoGlyph labelled={false} />
                <span className="fm-splash-logo-shimmer" aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="fm-splash-pulse-lane" aria-hidden="true">
            <span className="fm-splash-pulse-core" />
          </div>
        </div>
      </div>
    </div>
  );
}
