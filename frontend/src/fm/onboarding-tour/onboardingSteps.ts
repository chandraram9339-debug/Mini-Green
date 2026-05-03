import { routes } from "../figma/routes";

import type { OnboardingTourStep } from "./types";

/**
 * Quick Tour — UI overview across Home, Wallet, Trading (6 steps max).
 * Targets: existing `data-tour-id` attributes only.
 */
export const quickTourSteps: OnboardingTourStep[] = [
  {
    id: "home-balance",
    screen: "home",
    titleKey: "onboarding.tour.quick.homeBalance.title",
    descriptionKey: "onboarding.tour.quick.homeBalance.description",
    targetId: "home-balance",
    route: routes.home,
    placement: "bottom",
    priority: 10,
  },
  {
    id: "home-chart",
    screen: "home",
    titleKey: "onboarding.tour.quick.homeChart.title",
    descriptionKey: "onboarding.tour.quick.homeChart.description",
    targetId: "home-chart",
    route: routes.home,
    placement: "top",
    priority: 20,
  },
  {
    id: "wallet-top-up",
    screen: "wallet",
    titleKey: "onboarding.tour.quick.walletTopUp.title",
    descriptionKey: "onboarding.tour.quick.walletTopUp.description",
    targetId: "wallet-top-up",
    route: routes.balanceDeposit,
    placement: "bottom",
    priority: 30,
  },
  {
    id: "trading-chart",
    screen: "trading",
    titleKey: "onboarding.tour.quick.tradingChart.title",
    descriptionKey: "onboarding.tour.quick.tradingChart.description",
    targetId: "trading-chart",
    route: routes.bot,
    placement: "bottom",
    priority: 40,
  },
  {
    id: "bot-start-button",
    screen: "trading",
    titleKey: "onboarding.tour.quick.botStart.title",
    descriptionKey: "onboarding.tour.quick.botStart.description",
    targetId: "bot-start-button",
    route: routes.bot,
    placement: "bottom",
    priority: 50,
  },
  {
    id: "trading-tab-bar",
    screen: "trading",
    titleKey: "onboarding.tour.quick.tabBar.title",
    descriptionKey: "onboarding.tour.quick.tabBar.description",
    targetId: "trading-tab-bar",
    route: routes.bot,
    placement: "top",
    priority: 60,
  },
];

/**
 * Getting Started — funding flow through Start (copy: concise fintech tone).
 */
export const gettingStartedSteps: OnboardingTourStep[] = [
  {
    id: "gs-tab-wallet",
    screen: "home",
    titleKey: "onboarding.tour.gs.tabWallet.title",
    descriptionKey: "onboarding.tour.gs.tabWallet.description",
    targetId: "getting-started-tab-wallet",
    route: routes.home,
    placement: "top",
    priority: 10,
  },
  {
    id: "gs-top-up",
    screen: "wallet",
    titleKey: "onboarding.tour.gs.topUp.title",
    descriptionKey: "onboarding.tour.gs.topUp.description",
    targetId: "wallet-top-up",
    route: routes.balanceDeposit,
    placement: "bottom",
    priority: 20,
  },
  {
    id: "gs-deposit-address",
    screen: "wallet",
    titleKey: "onboarding.tour.gs.depositAddress.title",
    descriptionKey: "onboarding.tour.gs.depositAddress.description",
    targetId: "deposit-address-block",
    route: routes.depositTopUp,
    placement: "bottom",
    priority: 30,
  },
  {
    id: "gs-deposit-fee",
    screen: "wallet",
    titleKey: "onboarding.tour.gs.depositFee.title",
    descriptionKey: "onboarding.tour.gs.depositFee.description",
    targetId: "deposit-fee-note",
    route: routes.depositTopUp,
    placement: "top",
    priority: 40,
  },
  {
    id: "gs-deposit-paid",
    screen: "wallet",
    titleKey: "onboarding.tour.gs.depositPaid.title",
    descriptionKey: "onboarding.tour.gs.depositPaid.description",
    targetId: "deposit-paid-button",
    route: routes.depositTopUp,
    placement: "top",
    priority: 50,
  },
  {
    id: "gs-tab-bot",
    screen: "wallet",
    titleKey: "onboarding.tour.gs.tabBot.title",
    descriptionKey: "onboarding.tour.gs.tabBot.description",
    targetId: "getting-started-tab-bot",
    route: routes.depositTopUp,
    placement: "top",
    priority: 60,
  },
  {
    id: "gs-bot-start",
    screen: "trading",
    titleKey: "onboarding.tour.gs.botStart.title",
    descriptionKey: "onboarding.tour.gs.botStart.description",
    targetId: "bot-start-button",
    route: routes.bot,
    placement: "bottom",
    priority: 70,
  },
];

/** @deprecated Prefer {@link quickTourSteps} + {@link gettingStartedSteps}. */
export const onboardingSteps: OnboardingTourStep[] = [...quickTourSteps, ...gettingStartedSteps];

export function getSortedOnboardingSteps(steps: OnboardingTourStep[]): OnboardingTourStep[] {
  return [...steps].sort((a, b) => a.priority - b.priority);
}
