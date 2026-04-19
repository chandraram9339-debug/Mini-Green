import { createContext } from "react";

import type { MessageKey } from "./messages";

export type FmLocale = "en" | "es";

export const FM_LANG_STORAGE_KEY = "fm-settings-lang";

export type FmLocaleContextValue = {
  locale: FmLocale;
  setLocale: (next: FmLocale) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
};

export const FmLocaleContext = createContext<FmLocaleContextValue | null>(null);
