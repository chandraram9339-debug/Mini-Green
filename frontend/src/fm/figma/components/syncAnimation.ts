export const FM_SYNC_PULSE_DURATION_MS = 5800;

export function getSynchronizedAnimationDelay(durationMs = FM_SYNC_PULSE_DURATION_MS): string {
  return `${-(Date.now() % durationMs)}ms`;
}
