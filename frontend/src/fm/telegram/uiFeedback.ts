/** Короткий алерт в Mini App или fallback в браузере. */
export function showMiniAppAlert(message: string): void {
  const tg = window.Telegram?.WebApp;
  if (tg?.showAlert) tg.showAlert(message);
  else window.alert(message);
}

export function hapticLight(): void {
  window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");
}

export function hapticSuccess(): void {
  window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");
}
