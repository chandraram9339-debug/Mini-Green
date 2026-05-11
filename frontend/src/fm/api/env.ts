/** Есть ли базовый URL API (режим live vs полностью mock). */
export function hasApiBase(): boolean {
  if (import.meta.env.VITE_API_BASE_URL?.trim()) return true;
  /** Dev + пустой base: Vite proxy (см. `vite.config.ts`). Выключить mock-only: `VITE_DEV_USE_VITE_PROXY=false`. */
  return Boolean(
    import.meta.env.DEV &&
      import.meta.env.VITE_DEV_USE_VITE_PROXY !== "false",
  );
}
