import type { NavItem, RouteId, ScreenData } from "./types";

export const topLevelRoutes: NavItem[] = [
  { label: "Dashboard", route: "dashboard" },
  { label: "Money", route: "money" },
  { label: "Trading", route: "trading" },
  { label: "FAQ", route: "faq" },
];

export const routeTitles: Record<RouteId, string> = {
  dashboard: "Dashboard",
  money: "Money Details",
  trading: "Trading Details",
  faq: "FAQ",
  topup: "Deposit",
  withdraw: "Withdraw",
  confirm: "Confirm",
};

export const screenData: Record<RouteId, ScreenData> = {
  dashboard: {
    title: "Portfolio Overview",
    description: "Track balances, recent activity, and entry points for money flows.",
    primaryCta: { label: "Top Up", action: "navigate", target: "topup" },
    secondaryCta: { label: "Withdraw", target: "withdraw" },
  },
  money: {
    title: "Money Details",
    description: "Review available funds, reserved amounts, and recent money operations.",
    primaryCta: { label: "Withdraw", action: "navigate", target: "withdraw" },
    secondaryCta: { label: "Back to Dashboard", target: "dashboard" },
  },
  trading: {
    title: "Trading Details",
    description: "Read-only summary of strategy and order execution status from backend.",
    primaryCta: { label: "Open Confirm", action: "navigate", target: "confirm" },
    secondaryCta: { label: "Back to Dashboard", target: "dashboard" },
  },
  faq: {
    title: "FAQ",
    description: "Get guidance for top up, withdraw, and transaction confirmations.",
    primaryCta: { label: "Go to Money", action: "navigate", target: "money" },
    secondaryCta: { label: "Back to Dashboard", target: "dashboard" },
  },
  topup: {
    title: "Deposit",
    description: "Choose a funding method and continue to confirmation.",
    primaryCta: { label: "Continue to Confirm", action: "navigate", target: "confirm" },
    secondaryCta: { label: "Back to Dashboard", target: "dashboard" },
  },
  withdraw: {
    title: "Withdraw",
    description: "Review withdraw details and continue when validation passes.",
    primaryCta: { label: "Continue to Confirm", action: "navigate", target: "confirm" },
    secondaryCta: { label: "Back to Money", target: "money" },
  },
  confirm: {
    title: "Confirm",
    description: "Final review screen before operation completion.",
    primaryCta: { label: "Confirm and Send", action: "confirm-submit" },
    secondaryCta: { label: "Back to Withdraw", target: "withdraw" },
  },
};
