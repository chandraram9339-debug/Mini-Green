import { applyFmTheme } from "../theme/fmTheme";

/** Сбрасываем возможные inline-значения с прошлых версий (когда подмешивали Telegram). */
const TELEGRAM_THEME_CSS_VARS = [
  "--tg-theme-bg-color",
  "--tg-theme-text-color",
  "--tg-theme-hint-color",
  "--tg-theme-link-color",
  "--tg-theme-button-color",
  "--tg-theme-button-text-color",
  "--tg-theme-secondary-bg-color",
] as const;

/** Фон экрана из Figma Ready (`--color-bg`), без привязки к теме клиента Telegram. */
const BRAND_THEME_COLOR_HEX = "#ecf1f4";

/**
 * В Mini App не используем светлую/тёмную палитру Telegram — только фирменные цвета.
 * При смене темы в Telegram пересобираем то же самое (на случай смены viewport и т.п.).
 */
export function applyTelegramThemeParams(): void {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  const root = document.documentElement;
  for (const key of TELEGRAM_THEME_CSS_VARS) {
    root.style.removeProperty(key);
  }

  applyFmTheme("light");

  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", BRAND_THEME_COLOR_HEX);
}

export function subscribeTelegramThemeChanged(): void {
  const tg = window.Telegram?.WebApp;
  tg?.onEvent?.("themeChanged", () => {
    applyTelegramThemeParams();
  });
}
