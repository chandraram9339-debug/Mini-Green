export {};

type TelegramWebApp = {
  /** Сырой query-string для валидации на сервере (Telegram Mini App). */
  initData?: string;
  ready: () => void;
  expand: () => void;
  themeParams?: Record<string, string | undefined>;
  onEvent?: (eventType: string, callback: () => void) => void;
  offEvent?: (eventType: string, callback: () => void) => void;
  disableVerticalSwipes?: () => void;
  enableVerticalSwipes?: () => void;
  openTelegramLink?: (url: string, options?: { try_instant_view?: boolean }) => void;
  openLink?: (url: string, options?: { try_instant_view?: boolean }) => void;
  showAlert?: (message: string, callback?: () => void) => void;
  showPopup?: (
    params: { message: string; buttons?: Array<{ id?: string; type?: string; text?: string }> },
    callback?: (buttonId: string) => void,
  ) => void;
  HapticFeedback?: {
    impactOccurred?: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notificationOccurred?: (type: "error" | "success" | "warning") => void;
  };
  colorScheme?: "light" | "dark";
};

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}
