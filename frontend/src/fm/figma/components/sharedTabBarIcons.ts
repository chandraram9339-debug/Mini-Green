import { homeAssets } from "../home/homeAssets";
import type { TabBarIconUrls } from "../types/tabBarIcons";

/** Канонический набор иконок нижнего бара из Home Figma node 1:3644. */
export const sharedTabBarIcons: TabBarIconUrls = {
  home: homeAssets.group2,
  wallet: homeAssets.group3,
  bot: homeAssets.group4,
  support: homeAssets.group5,
};
