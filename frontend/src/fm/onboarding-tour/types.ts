/**
 * Types for the onboarding tour foundation (screens 1–3).
 */

import type { MessageKey } from "../i18n/messages";

/** Logical mini-app screen groups used by the tour plan */
export type OnboardingScreenId = "home" | "wallet" | "trading";

/**
 * Where the tooltip should prefer to appear relative to the target anchor.
 * The UI may fall back if there is not enough space (foundation uses placement for CSS only).
 */
export type TourTooltipPlacement = "top" | "bottom" | "left" | "right" | "center";

export interface OnboardingTourStep {
  /** Stable id for analytics / persistence keys later */
  id: string;
  screen: OnboardingScreenId;
  titleKey: MessageKey;
  descriptionKey: MessageKey;
  /**
   * Matches `data-tour-id` on the DOM node to highlight (when present).
   * Example: data-tour-id="home-balance"
   */
  targetId: string;
  /** Route pathname for this screen (for documentation & future navigation between steps) */
  route?: string;
  placement: TourTooltipPlacement;
  /** Lower runs earlier when sorting the full tour */
  priority: number;
}
