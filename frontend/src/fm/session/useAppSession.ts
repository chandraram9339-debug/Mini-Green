import { useContext } from "react";

import { AppSessionContext, type AppSessionContextValue } from "./appSessionContext";

export function useAppSession(): AppSessionContextValue {
  const ctx = useContext(AppSessionContext);
  if (!ctx) throw new Error("useAppSession must be used within AppSessionProvider");
  return ctx;
}
