/** Fallback: replace YOUR_BOT_USERNAME / YOUR_MINI_APP with real paths or set VITE_TRAFIK_APP_URL. */
const FALLBACK_TRAFIK_APP_URL = "https://t.me/YOUR_BOT_USERNAME/YOUR_MINI_APP";

export function getTrafikAppUrl(): string {
  const raw = import.meta.env.VITE_TRAFIK_APP_URL?.trim();
  return raw && raw.length > 0 ? raw : FALLBACK_TRAFIK_APP_URL;
}
