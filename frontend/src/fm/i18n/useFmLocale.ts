import { useContext } from "react";

import { FmLocaleContext, type FmLocaleContextValue } from "./fmLocaleContext";

export function useFmLocale(): FmLocaleContextValue {
  const ctx = useContext(FmLocaleContext);
  if (!ctx) {
    throw new Error("useFmLocale must be used within FmLocaleProvider");
  }
  return ctx;
}
