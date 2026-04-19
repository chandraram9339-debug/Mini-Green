/** Локальные файлы из MCP эталона `withdraw__full-screen__1-3808.tsx` → `/public/assets/withdraw/` */
import { appBarBackUrl, appBarCloseUrl, appBarLineUrl } from "../assets/appBarShared";

const b = "/assets/withdraw";

export const withdrawAssets = {
  close: appBarCloseUrl,
  back: appBarBackUrl,
  paste: `${b}/paste.svg`,
  tabHome: `${b}/tabHome.svg`,
  tabWallet: `${b}/tabWallet.svg`,
  tabBot: `${b}/tabBot.svg`,
  tabSupport: `${b}/tabSupport.svg`,
  lineAppBar: appBarLineUrl,
  networkSignalLight: `${b}/networkSignalLight.svg`,
  wifiSignalLight: `${b}/wifiSignalLight.svg`,
  batteryLight: `${b}/batteryLight.svg`,
  indicator: `${b}/indicator.svg`,
  time941: `${b}/time941.svg`,
  /** Иконка успеха — node `I1:3900;1:3277`, `withdraw-done__full-screen__1-3893.tsx` */
  doneCheck: `${b}/doneCheck.svg`,
} as const;
