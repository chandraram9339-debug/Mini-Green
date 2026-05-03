import { routes } from "../routes";

export type TabBarActive = "home" | "wallet" | "bot" | "support";

/** Какая вкладка нижней навигации должна быть подсвечена для текущего URL. */
export function getTabBarActive(pathname: string): TabBarActive {
  if (pathname === routes.home || pathname === "/") return "home";

  if (
    pathname.startsWith("/balance") ||
    pathname.startsWith("/deposit") ||
    pathname.startsWith("/withdraw")
  )
    return "wallet";

  if (pathname.startsWith("/bot")) return "bot";

  if (
    pathname.startsWith("/support") ||
    pathname.startsWith("/faq") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/settings")
  )
    return "support";

  /* e.g. /social — keep pill consistent; highlight Home */
  return "home";
}
