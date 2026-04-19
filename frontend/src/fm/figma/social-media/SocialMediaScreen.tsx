import "../home/homeScreen.css";
import "./socialMediaScreen.css";

import { FigmaAppBar } from "../components/FigmaAppBar";
import { FigmaStatusBar } from "../components/FigmaStatusBar";
import { FigmaTabBar } from "../components/FigmaTabBar";
import type { StatusBarAssetUrls } from "../types/statusBarAssets";
import type { TabBarIconUrls } from "../types/tabBarIcons";
import {
  SUPPORT_TELEGRAM_URL,
  TELEGRAM_CHANNEL_URL,
  TELEGRAM_CHAT_URL,
  openTelegramOrExternal,
} from "../../config/links";
import { defaultAppBarAssetUrls } from "../assets/appBarShared";
import { routes } from "../routes";
import { socialMediaAssets } from "./socialMediaAssets";

const socialStatusAssets: StatusBarAssetUrls = {
  networkSignalLight: socialMediaAssets.networkSignalLight,
  wifiSignalLight: socialMediaAssets.wifiSignalLight,
  batteryLight: socialMediaAssets.batteryLight,
  indicator: socialMediaAssets.indicator,
  time941: socialMediaAssets.time941,
};

const socialTabIcons: TabBarIconUrls = {
  home: socialMediaAssets.tabHome,
  wallet: socialMediaAssets.tabWallet,
  bot: socialMediaAssets.tabBot,
  support: socialMediaAssets.tabSupport,
};

/** Экран «1 | Social Media» — node 1:3734, `social-media__full-screen__1-3734.tsx`. */
export default function SocialMediaScreen() {
  return (
    <main className="fm-social" data-node-id="1:3734" aria-label="Social Media">
      <FigmaStatusBar assets={socialStatusAssets} />

      <FigmaAppBar assets={defaultAppBarAssetUrls} backTo={routes.home} title="Social Media" />

      <div className="fm-abs fm-social-body">
        <section className="fm-social-channels" aria-label="Channels">
          <button
            type="button"
            className="fm-social-channel-card fm-social-channel-card--hit"
            onClick={() => openTelegramOrExternal(TELEGRAM_CHANNEL_URL)}
            aria-label="Project Telegram channel"
          >
            <span className="fm-social-avatar fm-social-avatar--blue">
              <img alt="" src={socialMediaAssets.frame2312} />
            </span>
          </button>
          <button
            type="button"
            className="fm-social-channel-card fm-social-channel-card--hit"
            onClick={() => openTelegramOrExternal(TELEGRAM_CHAT_URL)}
            aria-label="Project Telegram chat"
          >
            <span className="fm-social-avatar fm-social-avatar--green">
              <img alt="" src={socialMediaAssets.frame2313} />
            </span>
          </button>
          <button
            type="button"
            className="fm-social-channel-card fm-social-channel-card--hit"
            onClick={() => openTelegramOrExternal(SUPPORT_TELEGRAM_URL)}
            aria-label="Support on Telegram"
          >
            <span className="fm-social-avatar fm-social-avatar--blue-light">
              <img alt="" src={socialMediaAssets.frame2314} />
            </span>
          </button>
        </section>

        <section className="fm-social-yt-intro" aria-label="YouTube channels intro">
          <div className="fm-social-yt-row">
            <div className="fm-social-yt-brand" aria-hidden="true">
              <img className="fm-social-yt-vector" alt="" src={socialMediaAssets.vector} />
              <img className="fm-social-yt-play" alt="" src={socialMediaAssets.vector1} />
            </div>
            <p className="fm-social-yt-title">YouTube channels</p>
            <div className="fm-social-yt-actions">
              <span className="fm-social-yt-chevron-btn">
                <img alt="" src={socialMediaAssets.group7} />
              </span>
            </div>
          </div>
        </section>

        <section className="fm-social-yt-block" aria-label="YouTube channel list">
          <div className="fm-social-yt-row fm-social-yt-row--split">
            <div className="fm-social-yt-brand" aria-hidden="true">
              <img className="fm-social-yt-vector" alt="" src={socialMediaAssets.vector} />
              <img className="fm-social-yt-play" alt="" src={socialMediaAssets.vector1} />
            </div>
            <p className="fm-social-yt-title">YouTube channels</p>
            <div className="fm-social-yt-actions fm-social-yt-actions--dual">
              <span className="fm-social-yt-chevron-btn">
                <img alt="" src={socialMediaAssets.group7} />
              </span>
              <span className="fm-social-yt-expand-btn">
                <img alt="" src={socialMediaAssets.group8} />
              </span>
            </div>
          </div>

          <div className="fm-social-yt-nested">
            <div className="fm-social-channel-card">
              <span className="fm-social-avatar fm-social-avatar--green">
                <img alt="" src={socialMediaAssets.frame2313} />
              </span>
            </div>
            <div className="fm-social-channel-card">
              <span className="fm-social-avatar fm-social-avatar--blue-light">
                <img alt="" src={socialMediaAssets.frame2314} />
              </span>
            </div>
            <div className="fm-social-channel-card">
              <span className="fm-social-avatar fm-social-avatar--blue-light">
                <img alt="" src={socialMediaAssets.frame2314} />
              </span>
            </div>
          </div>
        </section>
      </div>

      <FigmaTabBar icons={socialTabIcons} forceActiveTab="home" />
    </main>
  );
}
