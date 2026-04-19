import type { StatusBarAssetUrls } from "../types/statusBarAssets";

/** iOS-style status bar (узлы Status Bar из эталонов MCP, 390×44). */
export function FigmaStatusBar({ assets }: { assets: StatusBarAssetUrls }) {
  return (
    <div className="fm-abs fm-status">
      <div className="fm-status-notch" aria-hidden="true" />
      <div className="fm-status-icons">
        <img alt="" className="fm-net" src={assets.networkSignalLight} />
        <img alt="" className="fm-wifi" src={assets.wifiSignalLight} />
        <img alt="" className="fm-battery" src={assets.batteryLight} />
      </div>
      <img alt="" className="fm-indicator" src={assets.indicator} />
      <div className="fm-time">
        <div className="fm-time-inner">
          <img alt="" src={assets.time941} />
        </div>
      </div>
    </div>
  );
}
