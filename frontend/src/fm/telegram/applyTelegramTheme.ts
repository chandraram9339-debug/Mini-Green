/** Подставляет themeParams Telegram в `--tg-theme-*` для превью и после смены темы. */
const THEME_PARAM_MAP = [
  ["bg_color", "--tg-theme-bg-color"],
  ["text_color", "--tg-theme-text-color"],
  ["hint_color", "--tg-theme-hint-color"],
  ["link_color", "--tg-theme-link-color"],
  ["button_color", "--tg-theme-button-color"],
  ["button_text_color", "--tg-theme-button-text-color"],
  ["secondary_bg_color", "--tg-theme-secondary-bg-color"],
] as const;

function normalizeHex(raw: string): string {
  const s = raw.trim();
  return s.startsWith("#") ? s : `#${s}`;
}

export function applyTelegramThemeParams(): void {
  const tp = window.Telegram?.WebApp?.themeParams as Record<string, string | undefined> | undefined;
  if (!tp) return;
  const root = document.documentElement;
  for (const [key, cssVar] of THEME_PARAM_MAP) {
    const raw = tp[key];
    if (!raw) continue;
    root.style.setProperty(cssVar, normalizeHex(raw));
  }
  const bg = tp.bg_color ? normalizeHex(tp.bg_color) : null;
  if (bg) {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", bg);
  }
}

export function subscribeTelegramThemeChanged(): void {
  const tg = window.Telegram?.WebApp;
  tg?.onEvent?.("themeChanged", () => {
    applyTelegramThemeParams();
  });
}
