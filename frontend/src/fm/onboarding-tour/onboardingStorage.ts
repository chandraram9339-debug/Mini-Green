/**
 * localStorage helpers for onboarding completion flags (Quick Tour + Getting Started).
 * Safe when storage is unavailable (SSR, private mode quirks, blocked APIs).
 */

const STORAGE_KEY_LEGACY_COMPLETED = "fm.onboarding.tour.v1.completed";
const STORAGE_KEY_QUICK_COMPLETED = "fm.onboarding.quickTour.v1.completed";
const STORAGE_KEY_GETTING_STARTED_COMPLETED = "fm.onboarding.gettingStarted.v1.completed";
const STORAGE_KEY_GETTING_STARTED_SKIPPED = "fm.onboarding.gettingStarted.v1.skipped";

/** Same value as documented — full replay from Quick Tour. */
export const FORCE_ONBOARDING_STORAGE_KEY = "forceOnboarding";

/** Replay only the Getting Started guide (after Quick Tour was already done). */
export const FORCE_GETTING_STARTED_STORAGE_KEY = "forceGettingStarted";

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Users who only had the legacy single flag should not see onboarding again.
 */
function migrateLegacyOnboardingIfNeeded(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    if (
      storage.getItem(STORAGE_KEY_LEGACY_COMPLETED) === "1" &&
      storage.getItem(STORAGE_KEY_QUICK_COMPLETED) !== "1"
    ) {
      storage.setItem(STORAGE_KEY_QUICK_COMPLETED, "1");
      storage.setItem(STORAGE_KEY_GETTING_STARTED_COMPLETED, "1");
      storage.setItem(STORAGE_KEY_GETTING_STARTED_SKIPPED, "1");
    }
  } catch {
    /* ignore */
  }
}

export function isQuickTourCompleted(): boolean {
  migrateLegacyOnboardingIfNeeded();
  const storage = getStorage();
  if (!storage) return false;
  try {
    return storage.getItem(STORAGE_KEY_QUICK_COMPLETED) === "1";
  } catch {
    return false;
  }
}

export function isGettingStartedCompleted(): boolean {
  migrateLegacyOnboardingIfNeeded();
  const storage = getStorage();
  if (!storage) return false;
  try {
    return storage.getItem(STORAGE_KEY_GETTING_STARTED_COMPLETED) === "1";
  } catch {
    return false;
  }
}

export function isGettingStartedSkipped(): boolean {
  migrateLegacyOnboardingIfNeeded();
  const storage = getStorage();
  if (!storage) return false;
  try {
    return storage.getItem(STORAGE_KEY_GETTING_STARTED_SKIPPED) === "1";
  } catch {
    return false;
  }
}

/**
 * Entire onboarding flow finished or dismissed (Quick + Getting Started path resolved).
 * Backward-compatible with legacy `fm.onboarding.tour.v1.completed`.
 */
export function isOnboardingCompleted(): boolean {
  migrateLegacyOnboardingIfNeeded();
  const storage = getStorage();
  if (!storage) return false;
  try {
    if (storage.getItem(STORAGE_KEY_LEGACY_COMPLETED) === "1") return true;
    return (
      isQuickTourCompleted() &&
      (isGettingStartedCompleted() || isGettingStartedSkipped())
    );
  } catch {
    return false;
  }
}

export function markQuickTourCompleted(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY_QUICK_COMPLETED, "1");
  } catch {
    /* ignore */
  }
}

export function markGettingStartedCompleted(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY_GETTING_STARTED_COMPLETED, "1");
    storage.setItem(STORAGE_KEY_LEGACY_COMPLETED, "1");
  } catch {
    /* ignore */
  }
}

/** User chose Skip on transition or skipped the action guide — no further prompts. */
export function markGettingStartedSkipped(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY_GETTING_STARTED_SKIPPED, "1");
    storage.setItem(STORAGE_KEY_LEGACY_COMPLETED, "1");
  } catch {
    /* ignore */
  }
}

/** Persist legacy flag only (after Quick skip — user exits all onboarding). */
export function markLegacyOnboardingComplete(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY_LEGACY_COMPLETED, "1");
  } catch {
    /* ignore */
  }
}

/** @deprecated Use specific mark* functions; clears all onboarding keys. */
export function markOnboardingCompleted(): void {
  markGettingStartedCompleted();
}

/** Clear all onboarding flags (testing / “replay full tour”). */
export function resetOnboarding(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY_LEGACY_COMPLETED);
    storage.removeItem(STORAGE_KEY_QUICK_COMPLETED);
    storage.removeItem(STORAGE_KEY_GETTING_STARTED_COMPLETED);
    storage.removeItem(STORAGE_KEY_GETTING_STARTED_SKIPPED);
  } catch {
    /* ignore */
  }
}

export function readForceOnboarding(): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    return storage.getItem(FORCE_ONBOARDING_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearForceOnboarding(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(FORCE_ONBOARDING_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function readForceGettingStarted(): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    return storage.getItem(FORCE_GETTING_STARTED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearForceGettingStarted(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(FORCE_GETTING_STARTED_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Clears all flags and forces full onboarding (Quick Tour) on next load.
 */
export function prepareOnboardingReplay(): void {
  resetOnboarding();
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(FORCE_GETTING_STARTED_STORAGE_KEY);
    storage.setItem(FORCE_ONBOARDING_STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}

/**
 * Clears Getting Started completion/skipped flags and forces that flow on next load.
 * Quick Tour must already be completed (typical: user replays from Settings).
 */
export function prepareGettingStartedReplay(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY_GETTING_STARTED_COMPLETED);
    storage.removeItem(STORAGE_KEY_GETTING_STARTED_SKIPPED);
    storage.removeItem(STORAGE_KEY_LEGACY_COMPLETED);
    storage.setItem(FORCE_GETTING_STARTED_STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** Session-only: highlight Trading Start button once after completion modal → Start bot. */
const SESSION_HIGHLIGHT_START_KEY = "fm.onboarding.highlightStartOnce";

export function requestPostOnboardingStartHighlight(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SESSION_HIGHLIGHT_START_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** Returns true once per flag set, then clears the flag (single-use). */
export function consumePostOnboardingStartHighlight(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.sessionStorage.getItem(SESSION_HIGHLIGHT_START_KEY) !== "1") return false;
    window.sessionStorage.removeItem(SESSION_HIGHLIGHT_START_KEY);
    return true;
  } catch {
    return false;
  }
}
