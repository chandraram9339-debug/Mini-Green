/** Есть ли базовый URL API (режим live vs полностью mock). */
export function hasApiBase(): boolean {
  return Boolean(import.meta.env.VITE_API_BASE_URL?.trim());
}
