/** Dev-only: снимок непрозрачных фонов + тема Telegram → debug ingest (сессия a5e1ad). */
const INGEST =
  "http://127.0.0.1:7306/ingest/c9b53847-7d67-4641-abe0-3b14ec4bc84c";
const SESSION = "a5e1ad";

export function logGreySurfaces(screen: string, scopeSelector: string): void {
  if (!import.meta.env.DEV) return;
  const scope = document.querySelector(scopeSelector);
  if (!scope) return;

  const rootStyle = getComputedStyle(document.documentElement);
  const rows: Array<Record<string, string | number>> = [];

  scope.querySelectorAll("*").forEach((el) => {
    const bg = getComputedStyle(el).backgroundColor;
    if (bg === "rgba(0, 0, 0, 0)" || bg === "transparent") return;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    rows.push({
      tag: el.tagName,
      cls: String(el.className || "").slice(0, 160),
      bg,
      w: Math.round(r.width),
      h: Math.round(r.height),
      top: Math.round(r.top),
      left: Math.round(r.left),
    });
  });

  const payload = {
    screen,
    pathname: window.location.pathname,
    theme: {
      tgBg: rootStyle.getPropertyValue("--tg-theme-bg-color").trim(),
      tgSecondary: rootStyle.getPropertyValue("--tg-theme-secondary-bg-color").trim(),
      fmPageBg: rootStyle.getPropertyValue("--fm-page-bg").trim(),
      colorBg: rootStyle.getPropertyValue("--color-bg").trim(),
    },
    opaqueCount: rows.length,
    rows,
  };

  fetch(INGEST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": SESSION,
    },
    body: JSON.stringify({
      sessionId: SESSION,
      location: `logGreySurfaces:${screen}`,
      message: "opaque-bg-survey",
      hypothesisId: "H-runtime",
      data: payload,
      timestamp: Date.now(),
      runId: "grey-survey",
    }),
  }).catch(() => {});

  // eslint-disable-next-line no-console
  console.debug("[debug-grey]", screen, payload);
}
