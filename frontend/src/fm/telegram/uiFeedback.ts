import { isPushEnabled, isVibrationEnabled } from "../preferences/devicePreferences";

/** Короткий алерт в Mini App или fallback в браузере. */
export function showMiniAppAlert(message: string, options?: { force?: boolean; onClose?: () => void }): boolean {
  if (!options?.force && !isPushEnabled()) return false;

  const tg = window.Telegram?.WebApp;
  if (tg?.showAlert) tg.showAlert(message, options?.onClose);
  else {
    window.alert(message);
    options?.onClose?.();
  }

  return true;
}

export function hapticLight(): void {
  if (!isVibrationEnabled()) return;
  window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");
}

export function hapticSuccess(): void {
  if (!isVibrationEnabled()) return;
  window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");
}

export function hapticError(): void {
  if (!isVibrationEnabled()) return;
  window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("error");
}
