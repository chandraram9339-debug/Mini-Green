/** Deep link для шаринга реферала (бот + start payload). Env: VITE_TELEGRAM_REFERRAL_LINK */
export const TELEGRAM_REFERRAL_LINK =
  import.meta.env.VITE_TELEGRAM_REFERRAL_LINK ?? "https://t.me/";

/** ТЗ экран 1 — Channel / Chat на дашборде */
export const TELEGRAM_CHANNEL_URL =
  import.meta.env.VITE_TELEGRAM_CHANNEL_URL ?? "https://t.me/telegram";

export const TELEGRAM_CHAT_URL =
  import.meta.env.VITE_TELEGRAM_CHAT_URL ?? "https://t.me/telegram";

/** FAQ и Support — контакты саппорта */
export const SUPPORT_TELEGRAM_URL =
  import.meta.env.VITE_SUPPORT_TELEGRAM_URL ?? "https://t.me/";

export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL ?? "support@example.com";

/**
 * Открыть реферальную ссылку. Приоритет:
 * 1. Ссылка из wallet (personalLink), сгенерированная бэкендом
 * 2. Собрать из publicTelegramBotUsername + tg user id (если есть в WebApp)
 * 3. Статический VITE_TELEGRAM_REFERRAL_LINK
 */
export function openTelegramReferralShare(personalLink?: string | null): void {
  const tg = window.Telegram?.WebApp;

  let url = personalLink ?? null;

  if (!url) {
    const userId = tg?.initDataUnsafe?.user?.id;
    const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME?.trim();
    if (botUsername && userId) {
      url = `https://t.me/${botUsername}?start=ref${userId}`;
    }
  }

  if (!url) {
    url = TELEGRAM_REFERRAL_LINK;
  }

  if (!url || url === "https://t.me/") return;

  if (tg?.openTelegramLink) tg.openTelegramLink(url);
  else window.open(url, "_blank", "noopener,noreferrer");
}

/** t.me → openTelegramLink; иначе openLink / window */
export function openTelegramOrExternal(url: string): void {
  if (!url) return;
  const tg = window.Telegram?.WebApp;
  if (url.startsWith("mailto:")) {
    if (tg?.openLink) tg.openLink(url);
    else window.location.href = url;
    return;
  }
  const isTme = /^https:\/\/t\.me\//i.test(url);
  if (isTme && tg?.openTelegramLink) tg.openTelegramLink(url);
  else if (tg?.openLink) tg.openLink(url);
  else window.open(url, "_blank", "noopener,noreferrer");
}
