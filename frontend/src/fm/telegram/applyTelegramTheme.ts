import { applyFmTheme } from "../theme/fmTheme";

/** Как зелёный блок шапки в Figma (`#2edd7d`) — шапка миниаппа, system bar, meta theme-color в браузере. */
export const FM_BRAND_CHROME_HEADER_HEX = "#2edd7d";
/** Под WebView / нижняя панель — как фон body миниаппа. */
export const FM_BRAND_WEBVIEW_BG_HEX = "#0a0a0a";

/** @deprecated Используйте FM_BRAND_CHROME_HEADER_HEX; оставлено на время внешних ссылок. */
export const FM_BRAND_THEME_BG_HEX = FM_BRAND_CHROME_HEADER_HEX;

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
}

/**
 * Цвет вкладки / address bar в мобильном браузере (`theme-color`) и оболочка Telegram Mini App.
 * Вызывать из `main` после `initTelegramWebApp()` (там уже `ready()`), чтобы `setHeaderColor` работал в Telegram.
 */
export function applyShellChromeColors(): void {
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", FM_BRAND_CHROME_HEADER_HEX);

  let colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
  if (!colorSchemeMeta) {
    colorSchemeMeta = document.createElement("meta");
    colorSchemeMeta.setAttribute("name", "color-scheme");
    document.head.appendChild(colorSchemeMeta);
  }
  /* Как раньше и как в :root / html.fm-brand-lock — не ставить dark: ломает паритет с CSS и даёт «белый экран» в некоторых браузерах */
  colorSchemeMeta.setAttribute("content", "light");

  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  tg.setHeaderColor?.(FM_BRAND_CHROME_HEADER_HEX);
  tg.setBackgroundColor?.(FM_BRAND_WEBVIEW_BG_HEX);
  tg.setBottomBarColor?.(FM_BRAND_WEBVIEW_BG_HEX);
}

export function subscribeTelegramThemeChanged(): void {
  const tg = window.Telegram?.WebApp;
  tg?.onEvent?.("themeChanged", () => {
    applyTelegramThemeParams();
    applyShellChromeColors();
  });
}
