export const PUSH_PREFERENCE_KEY = "fm-push";
export const VIBRATION_PREFERENCE_KEY = "fm-vibration";

function readBooleanPreference(key: string, defaultOn: boolean): boolean {
  try {
    const value = window.localStorage.getItem(key);
    if (value === null) return defaultOn;
    return value !== "0";
  } catch {
    return defaultOn;
  }
}

function writeBooleanPreference(key: string, enabled: boolean): void {
  try {
    window.localStorage.setItem(key, enabled ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function isPushEnabled(): boolean {
  return readBooleanPreference(PUSH_PREFERENCE_KEY, true);
}

export function setPushEnabled(enabled: boolean): void {
  writeBooleanPreference(PUSH_PREFERENCE_KEY, enabled);
}

export function isVibrationEnabled(): boolean {
  return readBooleanPreference(VIBRATION_PREFERENCE_KEY, true);
}

export function setVibrationEnabled(enabled: boolean): void {
  writeBooleanPreference(VIBRATION_PREFERENCE_KEY, enabled);
}
