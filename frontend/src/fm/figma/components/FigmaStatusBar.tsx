import type { StatusBarAssetUrls } from "../types/statusBarAssets";

/** В Telegram Mini App системный статус-бар рисует сам клиент; в DOM не дублируем. */
export function FigmaStatusBar({ assets: _assets }: { assets: StatusBarAssetUrls }) {
  return null;
}
