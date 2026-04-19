import { createContext } from "react";

import type { WalletSnapshot } from "../api/types";

export type AppSessionPhase = "idle" | "bootstrapping" | "ready" | "error";

export type AppSessionMode = "mock" | "live";

export type AppSessionState = {
  phase: AppSessionPhase;
  mode: AppSessionMode;
  wallet?: WalletSnapshot;
  errorMessage?: string;
  notificationUnreadCount: number;
};

export type AppSessionContextValue = AppSessionState & {
  refreshWallet: () => Promise<void>;
  confirmDepositPaid: () => Promise<boolean>;
  refreshNotifications: () => Promise<void>;
};

export const AppSessionContext = createContext<AppSessionContextValue | null>(null);
