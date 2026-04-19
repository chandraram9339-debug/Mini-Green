import type { AppBarAssetUrls } from "../types/appBarAssets";

/**
 * Единый эталон App Bar из Figma (узлы вида `App Bar`: 1:3673, 1:3685, … fileKey `BBrbpnfGElX0afHLm7ccxP`):
 * back / line / gear / bell — размер контейнеров иконок 24×24, колокольчик левее шестерёнки.
 * SVG в `/public/assets/app-bar/` сняты через MCP get_design_context.
 */
const b = "/assets/app-bar";

/** Иконка Close (withdraw flow, node 1:3819 и др.) — только там, где нет bell/settings */
export const appBarCloseUrl = `${b}/close.svg` as const;

/** Алиасы для экранов с кастомным header (withdraw), без дубля строк */
export const appBarBackUrl = `${b}/back.svg` as const;
export const appBarLineUrl = `${b}/line.svg` as const;

/** Один набор для `FigmaAppBar` на всех экранах со стандартной шапкой */
export const defaultAppBarAssetUrls = {
  backIcon: appBarBackUrl,
  dividerLine: appBarLineUrl,
  settingsIcon: `${b}/settings.svg`,
  bellIcon: `${b}/bell.svg`,
} as const satisfies AppBarAssetUrls;
