import { Link } from "react-router-dom";

import { useAppSession } from "../../session/useAppSession";
import type { AppBarAssetUrls } from "../types/appBarAssets";
import { routes } from "../routes";

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
};

/** Title bar с Back / колокольчик / шестерёнка — эталоны разных экранов задают разные SVG. */
export function FigmaAppBar({
  assets,
  backTo,
  onBack,
  title,
  bellBadge,
  bellStatic = false,
  settingsStatic = false,
}: FigmaAppBarProps) {
  const { notificationUnreadCount } = useAppSession();
  const resolvedBellBadge =
    bellBadge != null
      ? String(bellBadge)
      : notificationUnreadCount > 0
        ? String(notificationUnreadCount)
        : null;

  const backInner = (
    <span className="fm-back-inner">
      <img alt="" src={assets.backIcon} />
    </span>
  );

  const bellInner = (
    <>
      <img alt="" src={assets.bellIcon} className="fm-bell-img" />
      {resolvedBellBadge ? <span className="fm-notify-badge">{resolvedBellBadge}</span> : null}
    </>
  );

  const settingsImg = <img alt="" src={assets.settingsIcon} />;

  return (
    <header className="fm-abs fm-appbar">
      {settingsStatic ? (
        <span className="fm-appbar-settings fm-appbar-settings--static" aria-hidden="true">
          {settingsImg}
        </span>
      ) : (
        <Link to={routes.settings} className="fm-appbar-settings" aria-label="Settings">
          {settingsImg}
        </Link>
      )}

      {bellStatic ? (
        <span className="fm-appbar-bell-wrap fm-appbar-bell-wrap--static" aria-hidden="true">
          {bellInner}
        </span>
      ) : (
        <Link to={routes.notifications} className="fm-appbar-bell-wrap" aria-label="Notifications">
          {bellInner}
        </Link>
      )}

      <div className="fm-appbar-line">
        <img alt="" src={assets.dividerLine} />
      </div>

      {title ? (
        <p className="fm-appbar-title">{title}</p>
      ) : null}

      <div className="fm-back-wrap">
        {backTo ? (
          <Link to={backTo} className="fm-back-btn" aria-label="Back">
            {backInner}
          </Link>
        ) : onBack ? (
          <button type="button" className="fm-back-btn" aria-label="Back" onClick={onBack}>
            {backInner}
          </button>
        ) : (
          <button type="button" className="fm-back-btn" aria-label="Back">
            {backInner}
          </button>
        )}
      </div>
    </header>
  );
}
