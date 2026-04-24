/**
 * Параметр deep link после `/start` в личке бота: `ref_<tg_id>` или `ref<tg_id>` (как в мини-апп auth).
 */
export function parseInviterTgFromStartMessage(messageText: string): string | null {
  const trimmed = messageText.trim();
  const m = trimmed.match(/^\/start(?:\s+(\S+))?$/i);
  if (!m?.[1]) return null;
  const arg = m[1].trim();
  const ref = arg.match(/^ref_?(\d+)$/i);
  return ref ? ref[1]! : null;
}
