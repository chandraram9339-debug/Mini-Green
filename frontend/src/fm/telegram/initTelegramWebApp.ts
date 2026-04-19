import { applyTelegramThemeParams, subscribeTelegramThemeChanged } from "./applyTelegramTheme";

/** Mini App: развернуть на весь экран и сообщить клиенту, что UI готов. */
export function initTelegramWebApp(): void {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;
  tg.ready();
  tg.expand();
  tg.disableVerticalSwipes?.();
  applyTelegramThemeParams();
  subscribeTelegramThemeChanged();
}
