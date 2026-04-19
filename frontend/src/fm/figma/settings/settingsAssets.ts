import { publicAsset } from "../../utils/publicAsset";

/** Файлы из `public/assets/settings/` — через `publicAsset` для верного base в проде. */
const b = (name: string) => publicAsset(`assets/settings/${name}`);

export const settingsAssets = {
  successMark: b("successMark.svg"),
  back: b("back.svg"),
  userPlus: b("userPlus.svg"),
  bell: b("bell.svg"),
  iconTranslate: b("iconTranslate.svg"),
  iconFile: b("iconFile.svg"),
  alertTriangle: b("alertTriangle.svg"),
  mobile: b("mobile.svg"),
  lineDivider: b("lineDivider.svg"),
  iconSupport: b("iconSupport.svg"),
  iconFaq: b("iconFaq.svg"),
  lineAppBar: b("lineAppBar.svg"),
  gear: b("gear.svg"),
  networkSignalLight: b("networkSignalLight.svg"),
  wifiSignalLight: b("wifiSignalLight.svg"),
  batteryLight: b("batteryLight.svg"),
  indicator: b("indicator.svg"),
  time941: b("time941.svg"),
} as const;
