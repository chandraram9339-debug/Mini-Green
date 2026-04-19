export type FmTheme = "light" | "dark";

const STORAGE_KEY = "fm-theme";

export function getStoredFmTheme(): FmTheme {
  if (typeof localStorage === "undefined") return "light";
  return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
}

export function applyFmTheme(theme: FmTheme): void {
  document.documentElement.dataset.fmTheme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore quota / private mode */
  }
}

export function initFmThemeFromStorage(): void {
  applyFmTheme(getStoredFmTheme());
}
