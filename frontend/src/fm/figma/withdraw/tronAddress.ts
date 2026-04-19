/** USDT TRC20 — TRON base58, 34 символа, префикс T. */
const TRON_RE = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;

const INVIS_OR_SPACE = /[\s\u200B-\u200D\uFEFF\u00A0]/g;

/**
 * Подготовка вставки: пробелы/невидимые символы убираем, первая буква T часто вставляется в нижнем регистре.
 */
export function normalizeTronAddressInput(raw: string): string {
  const collapsed = raw.replace(INVIS_OR_SPACE, "").trim();
  if (collapsed.length > 0 && collapsed[0] === "t") {
    return `T${collapsed.slice(1)}`;
  }
  return collapsed;
}

export function isValidTronAddress(raw: string): boolean {
  const s = normalizeTronAddressInput(raw);
  return TRON_RE.test(s);
}
