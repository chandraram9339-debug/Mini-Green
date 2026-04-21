import { applyTelegramThemeParams, subscribeTelegramThemeChanged } from "./applyTelegramTheme";

/** Подставляет реальную высоту миниаппа: 100dvh часто больше WebView → пустота под табом. */
function syncTelegramViewportHeightVar(): void {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;
  const px = tg.viewportStableHeight ?? tg.viewportHeight;
  if (typeof px !== "number" || !Number.isFinite(px) || px <= 0) return;
  document.documentElement.style.setProperty("--tg-viewport-stable-height", `${px}px`);
}

/** Mini App: развернуть на весь экран и сообщить клиенту, что UI готов. */
export function initTelegramWebApp(): void {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;
  tg.ready();
  tg.expand();
  tg.disableVerticalSwipes?.();
  syncTelegramViewportHeightVar();
  tg.onEvent?.("viewportChanged", syncTelegramViewportHeightVar);
  applyTelegramThemeParams();
  subscribeTelegramThemeChanged();
}
