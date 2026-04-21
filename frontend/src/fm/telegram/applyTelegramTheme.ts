import { applyFmTheme } from "../theme/fmTheme";

/** Фон экрана из Figma Ready (`--color-bg`), без привязки к теме клиента Telegram. */
export const FM_BRAND_THEME_BG_HEX = "#ecf1f4";

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

/**
 * В Mini App не используем светлую/тёмную палитру Telegram — только фирменные цвета.
 * При смене темы в Telegram пересобираем то же самое (на случай смены viewport и т.п.).
 */
export function applyTelegramThemeParams(): void {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  const root = document.documentElement;
  root.classList.add("fm-brand-lock");
  for (const key of TELEGRAM_THEME_CSS_VARS) {
    root.style.removeProperty(key);
  }

  applyFmTheme("light");

  /* Оболочка миниаппа (шапка / фон вокруг WebView) иначе остаётся в цветах тёмной темы Telegram. */
  tg.setHeaderColor?.(FM_BRAND_THEME_BG_HEX);
  tg.setBackgroundColor?.(FM_BRAND_THEME_BG_HEX);
  tg.setBottomBarColor?.(FM_BRAND_THEME_BG_HEX);

  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", FM_BRAND_THEME_BG_HEX);

  let colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
  if (!colorSchemeMeta) {
    colorSchemeMeta = document.createElement("meta");
    colorSchemeMeta.setAttribute("name", "color-scheme");
    document.head.appendChild(colorSchemeMeta);
  }
  colorSchemeMeta.setAttribute("content", "light");
}

export function subscribeTelegramThemeChanged(): void {
  const tg = window.Telegram?.WebApp;
  tg?.onEvent?.("themeChanged", () => {
    applyTelegramThemeParams();
  });
}
