import { Link } from "react-router-dom";

import { useAppSession } from "../../session/useAppSession";
import { appBarLogoUrl } from "../assets/appBarShared";
import type { AppBarAssetUrls } from "../types/appBarAssets";
import { routes } from "../routes";

import s from "./figmaAppBar.module.css";

type FigmaAppBarProps = {
  assets: AppBarAssetUrls;
  backTo?: string;
  /** Если без backTo — вызывается по нажатию Back (например navigate(-1) на Home) */
  onBack?: () => void;
  /** Центральный заголовок (узкие экраны вроде Social Media node 1:3734). */
  title?: string;
  /** Число на бейдже колокольчика (экран Notification — «3»). По умолчанию 25. */
  bellBadge?: string | number | null;
  /** На экране уведомлений колокольчик в макете без ссылки — декоративный. */
  bellStatic?: boolean;
  /** На экране Settings иконка шестерёнки справа без ссылки (node 1:3805). */
  settingsStatic?: boolean;
  /** Логотип в центре только на первых ключевых экранах. */
  showLogo?: boolean;
};

/** Title bar с Back / колокольчик / шестерёнка — сетка как на *ScreenNew (токены --fm-appbar-*). */
export function FigmaAppBar({
  assets,
  backTo,
  onBack,
  title,
  bellBadge,
  bellStatic = false,
  settingsStatic = false,
  showLogo = false,
}: FigmaAppBarProps) {
  const { notificationUnreadCount } = useAppSession();
  const resolvedBellBadge =
    bellBadge != null
      ? String(bellBadge)
      : notificationUnreadCount > 0
        ? String(notificationUnreadCount)
        : null;

  const backInner = (
    <span className={s.backInner}>
      <img alt="" src={assets.backIcon} />
    </span>
  );

  const bellInner = (
    <>
      <img alt="" src={assets.bellIcon} className="fm-bell-img" />
      {resolvedBellBadge ? <span className={s.notifyBadge}>{resolvedBellBadge}</span> : null}
    </>
  );

  const settingsImg = <img alt="" src={assets.settingsIcon} />;

  const center =
    showLogo ? (
      <div
        className={`${s.center} ${s.brand} app-bar-logo-shimmer app-bar-logo-wordmark`}
        aria-label="Palladium"
      >
        <img alt="Palladium" src={appBarLogoUrl} />
      </div>
    ) : title ? (
      <p className={`${s.center} ${s.title}`}>{title}</p>
    ) : null;

  return (
    <header className="fm-abs fm-appbar">
      <div className={s.shell}>
        <div className={s.row}>
          <div className={s.leading}>
            {backTo ? (
              <Link to={backTo} className={`${s.backBtn} fm-appbar-hit-dark`} aria-label="Back">
                {backInner}
              </Link>
            ) : onBack ? (
              <button type="button" className={`${s.backBtn} fm-appbar-hit-dark`} aria-label="Back" onClick={onBack}>
                {backInner}
              </button>
            ) : (
              <button type="button" className={`${s.backBtn} fm-appbar-hit-dark`} aria-label="Back">
                {backInner}
              </button>
            )}
          </div>

          {center}

          <div className={s.trailing}>
            {bellStatic ? (
              <span className={`${s.iconSlot} ${s.iconSlotStatic} fm-appbar-hit-static`} aria-hidden="true">
                {bellInner}
              </span>
            ) : (
              <Link to={routes.notifications} className={`${s.iconSlot} fm-appbar-hit-dark`} aria-label="Notifications">
                {bellInner}
              </Link>
            )}

            {settingsStatic ? (
              <span className={`${s.iconSlot} ${s.iconSlotStatic} fm-appbar-hit-static`} aria-hidden="true">
                {settingsImg}
              </span>
            ) : (
              <Link to={routes.settings} className={`${s.iconSlot} fm-appbar-hit-dark`} aria-label="Settings">
                {settingsImg}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className={s.line}>
        <img alt="" src={assets.dividerLine} />
      </div>
    </header>
  );
}
