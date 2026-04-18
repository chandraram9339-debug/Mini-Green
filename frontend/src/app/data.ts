import type { NavItem, RouteId, ScreenData } from "./types";

export const topLevelRoutes: NavItem[] = [
  { label: "Home", route: "dashboard" },
  { label: "Balance", route: "money" },
  { label: "Bot", route: "trading" },
  { label: "FAQ", route: "faq" },
];

export const routeTitles: Record<RouteId, string> = {
  dashboard: "Home",
  money: "Detail Balance",
  trading: "Detail Bot",
  faq: "FAQ",
  notifications: "Notification",
  settings: "Settings",
  support: "Support",
  social: "Social Media",
  seed: "Seed Phrase",
  agreement: "User Agreement",
  topup: "Top up",
  withdraw: "Withdraw",
  confirm: "Confirm",
  done: "Done",
};

export const screenData: Record<RouteId, ScreenData> = {
  dashboard: {
    title: "Home",
    description: "Total balance, status, chart and quick actions.",
    primaryCta: { label: "Top up", action: "navigate", target: "topup" },
    secondaryCta: { label: "Withdraw", target: "withdraw" },
  },
  money: {
    title: "Detail Balance",
    description: "Current balance, quick actions, summary cards and actions history.",
    primaryCta: { label: "Withdraw", action: "navigate", target: "withdraw" },
    secondaryCta: { label: "Back to Home", target: "dashboard" },
  },
  trading: {
    title: "Detail Bot",
    description: "Bot status, price, period stats and trading list.",
    primaryCta: { label: "Open Detail Balance", action: "navigate", target: "money" },
    secondaryCta: { label: "Back to Home", target: "dashboard" },
  },
  faq: {
    title: "FAQ",
    description: "Questions and answers for app flows.",
    primaryCta: { label: "Go to Detail Balance", action: "navigate", target: "money" },
    secondaryCta: { label: "Back to Home", target: "dashboard" },
  },
  notifications: {
    title: "Notification",
    description: "Notification list and updates.",
    primaryCta: { label: "Open Settings", action: "navigate", target: "settings" },
    secondaryCta: { label: "Back to Home", target: "dashboard" },
  },
  settings: {
    title: "Settings",
    description: "Language, links and support options.",
    primaryCta: { label: "Open Seed Phrase", action: "navigate", target: "seed" },
    secondaryCta: { label: "Open Agreement", target: "agreement" },
  },
  support: {
    title: "Support",
    description: "Reach support channels and contact options.",
    primaryCta: { label: "Open FAQ", action: "navigate", target: "faq" },
    secondaryCta: { label: "Back to Settings", target: "settings" },
  },
  social: {
    title: "Social Media",
    description: "Official channels and community links.",
    primaryCta: { label: "Open Support", action: "navigate", target: "support" },
    secondaryCta: { label: "Back to Home", target: "dashboard" },
  },
  seed: {
    title: "Seed Phrase",
    description: "Your recovery phrase. Keep it private and secure.",
    primaryCta: { label: "Back to Settings", action: "navigate", target: "settings" },
    secondaryCta: { label: "Back to Settings", target: "settings" },
  },
  agreement: {
    title: "User Agreement",
    description: "Agreement text.",
    primaryCta: { label: "Back to Settings", action: "navigate", target: "settings" },
    secondaryCta: { label: "Back to Home", target: "dashboard" },
  },
  topup: {
    title: "Top up",
    description: "Receive USDT (TRC20 only).",
    primaryCta: { label: "Continue to Confirm", action: "navigate", target: "confirm" },
    secondaryCta: { label: "Back to Home", target: "dashboard" },
  },
  withdraw: {
    title: "Withdraw",
    description: "Review withdraw details and continue when validation passes.",
    primaryCta: { label: "Continue to Confirm", action: "navigate", target: "confirm" },
    secondaryCta: { label: "Back to Detail Balance", target: "money" },
  },
  confirm: {
    title: "Confirm",
    description: "Cheque review before sending.",
    primaryCta: { label: "Confirm and Send", action: "confirm-submit" },
    secondaryCta: { label: "Back to Withdraw", target: "withdraw" },
  },
  done: {
    title: "Done",
    description: "Withdrawal flow completed successfully.",
    primaryCta: { label: "Back to Home", action: "navigate", target: "dashboard" },
    secondaryCta: { label: "Open Detail Balance", target: "money" },
  },
};
