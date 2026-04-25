/** Deep link для шаринга реферала (бот + start payload). Env: VITE_TELEGRAM_REFERRAL_LINK */
export const TELEGRAM_REFERRAL_LINK =
  import.meta.env.VITE_TELEGRAM_REFERRAL_LINK ?? "https://t.me/";

/** Инвайты сообщества (fallback, если в API / админке пусто) */
export const TELEGRAM_CHANNEL_URL =
  import.meta.env.VITE_TELEGRAM_CHANNEL_URL ?? "https://t.me/+yX2EPnQ5rHxkMmM0";

export const TELEGRAM_CHAT_URL =
  import.meta.env.VITE_TELEGRAM_CHAT_URL ?? "https://t.me/+AlYHO2dN2-MyZWE0";

/** FAQ и Support — контакты саппорта (fallback, если в админке / wallet пусто) */
export const SUPPORT_TELEGRAM_URL =
  import.meta.env.VITE_SUPPORT_TELEGRAM_URL ?? "https://t.me/palladium_trade_support";

export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL ?? "support@example.com";

/** Открытие без Instant View — иначе часть ссылок в миниапе «молчит» или ведёт себя странно. */
const TG_OPEN_OPTS = { try_instant_view: false } as const;

/**
 * Приводит ссылку из админки/окружения к виду, который понимают Telegram WebApp API.
 * Без схемы `t.me/...` иначе уходит в openLink как относительный URL и не открывается.
 */
export function normalizeMiniappOpenUrl(raw: string): string {
  let u = raw.trim();
  if (!u) return "";
  if (u.startsWith("//")) u = `https:${u}`;
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(u);
  if (!hasScheme) {
    if (/^(?:www\.)?t\.me\//i.test(u)) u = `https://${u}`;
    else if (/^(?:www\.)?telegram\.me\//i.test(u)) u = `https://${u}`;
  }
  u = u.replace(/^http:\/\/(www\.)?t\.me\//i, "https://t.me/");
  u = u.replace(/^http:\/\/(www\.)?telegram\.me\//i, "https://telegram.me/");
  return u;
}

function isTelegramHostOpenUrl(url: string): boolean {
  return /^https:\/\/(t\.me|telegram\.me)\//i.test(url);
}

/** Приватные инвайты `t.me/+…` — `openTelegramLink` в клиентах часто их не открывает; нужен `openLink`. */
function isTelegramPrivateInviteUrl(url: string): boolean {
  return /^https:\/\/(t\.me|telegram\.me)\/\+/i.test(url);
}

/**
 * Открыть реферальную ссылку. Приоритет:
 * 1. Ссылка из wallet (personalLink), сгенерированная бэкендом
 * 2. Собрать из `publicBotUsername` (админка / ui-settings) или VITE_TELEGRAM_BOT_USERNAME + tg user id
 * 3. Статический VITE_TELEGRAM_REFERRAL_LINK (если задан осмысленный URL)
 *
 * @returns false если открыть нечего — вызовите алерт в UI
 */
export function openTelegramReferralShare(
  personalLink?: string | null,
  publicBotUsername?: string | null,
): boolean {
  const tg = window.Telegram?.WebApp;

  let url = personalLink?.trim() || null;

  if (!url) {
    const userId = tg?.initDataUnsafe?.user?.id;
    const bot =
      publicBotUsername?.replace(/^@/, "").trim() ||
      import.meta.env.VITE_TELEGRAM_BOT_USERNAME?.replace(/^@/, "").trim();
    if (bot && userId) {
      url = `https://t.me/${bot}?start=ref_${userId}`;
    }
  }

  if (!url) {
    const fb = TELEGRAM_REFERRAL_LINK.trim();
    if (fb && fb !== "https://t.me/" && fb !== "https://t.me") {
      url = fb;
    }
  }

  if (!url || url === "https://t.me/" || url === "https://t.me") {
    return false;
  }

  const shareText =
    (import.meta.env.VITE_REFERRAL_SHARE_MESSAGE as string | undefined)?.trim() ||
    "💰 Palladium trade bot!";
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`;
  openTelegramOrExternal(shareUrl);
  return true;
}

/** t.me / telegram.me → openTelegramLink; иначе openLink / window */
export function openTelegramOrExternal(url: string): void {
  const normalized = normalizeMiniappOpenUrl(url);
  if (!normalized) return;
  const tg = window.Telegram?.WebApp;
  if (normalized.startsWith("mailto:")) {
    if (tg?.openLink) tg.openLink(normalized, TG_OPEN_OPTS);
    else window.location.href = normalized;
    return;
  }
  if (isTelegramPrivateInviteUrl(normalized) && tg?.openLink) {
    tg.openLink(normalized, TG_OPEN_OPTS);
    return;
  }
  if (isTelegramHostOpenUrl(normalized) && tg?.openTelegramLink) {
    tg.openTelegramLink(normalized, TG_OPEN_OPTS);
  } else if (tg?.openLink) {
    tg.openLink(normalized, TG_OPEN_OPTS);
  } else {
    window.open(normalized, "_blank", "noopener,noreferrer");
  }
}
