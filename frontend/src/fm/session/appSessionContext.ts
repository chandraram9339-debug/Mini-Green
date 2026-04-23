import { createContext } from "react";

import type { WalletSnapshot } from "../api/types";
import type { UiSettings } from "../api/fetchUiSettings";

export type AppSessionPhase = "idle" | "bootstrapping" | "ready" | "error";

export type AppSessionMode = "mock" | "live";

export type AppSessionState = {
  phase: AppSessionPhase;
  mode: AppSessionMode;
  wallet?: WalletSnapshot;
  uiSettings?: UiSettings;
  errorMessage?: string;
  notificationUnreadCount: number;
  botRunning: boolean;
};

export type AppSessionContextValue = AppSessionState & {
  refreshWallet: () => Promise<void>;
  confirmDepositPaid: () => Promise<boolean>;
  refreshNotifications: () => Promise<void>;
  setBotRunning: (next: boolean) => void;
};

export const AppSessionContext = createContext<AppSessionContextValue | null>(null);
