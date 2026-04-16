export type RouteId =
  | "dashboard"
  | "money"
  | "trading"
  | "faq"
  | "topup"
  | "withdraw"
  | "confirm";

export type LoadState = "loading" | "ready" | "empty" | "error";

export interface ScreenData {
  title: string;
  description: string;
  primaryCta?: {
    label: string;
    action: "navigate" | "confirm-submit";
    target?: RouteId;
  };
  secondaryCta?: {
    label: string;
    target: RouteId;
  };
}

export interface NavItem {
  label: string;
  route: RouteId;
}
