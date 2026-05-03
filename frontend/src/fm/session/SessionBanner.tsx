import { useAppSession } from "./useAppSession";

/** Compact API session status (loading / error). Does not change Figma layout below. */
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
