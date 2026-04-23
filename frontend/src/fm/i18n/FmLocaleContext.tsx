import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { FmLocaleContext, type FmLocale, type FmLocaleContextValue, FM_LANG_STORAGE_KEY } from "./fmLocaleContext";
import {
  type MessageKey,
  messagesEn,
  messagesEs,
  resolveFmMessage,
} from "./messages";

function readStoredLocale(): FmLocale {
  try {
    return localStorage.getItem(FM_LANG_STORAGE_KEY) === "es" ? "es" : "en";
  } catch {
    return "en";
  }
}

export function FmLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<FmLocale>(() => readStoredLocale());

  useEffect(() => {
    document.documentElement.lang = locale === "es" ? "es" : "en";
  }, [locale]);

  const setLocale = useCallback((next: FmLocale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(FM_LANG_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) =>
      resolveFmMessage(locale, key, vars),
    [locale],
  );

  const value = useMemo<FmLocaleContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return <FmLocaleContext.Provider value={value}>{children}</FmLocaleContext.Provider>;
}

export type { FmLocale, FmLocaleContextValue } from "./fmLocaleContext";
export { FM_LANG_STORAGE_KEY } from "./fmLocaleContext";
