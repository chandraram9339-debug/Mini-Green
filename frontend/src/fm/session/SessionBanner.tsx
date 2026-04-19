import { useAppSession } from "./useAppSession";

/** Мини-статус сессии API (ошибка / загрузка). Не затрагивает разметку Figma под ним. */
export function SessionBanner() {
  const { phase, errorMessage } = useAppSession();

  if (phase === "bootstrapping") {
    return (
      <div className="fm-session-banner" role="status">
        Connecting to server…
      </div>
    );
  }

  if (phase === "error" && errorMessage) {
    return (
      <div className="fm-session-banner fm-session-banner--error" role="alert">
        {errorMessage}
      </div>
    );
  }

  return null;
}
