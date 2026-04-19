const DEFAULT_SEED = [
  "orbit",
  "silver",
  "quantum",
  "harbor",
  "meadow",
  "cipher",
  "vector",
  "ledger",
  "pulse",
  "fusion",
  "anchor",
  "nova",
] as const;

/** `VITE_SEED_WORDS` — 12 слов через запятую или пробел; иначе дефолт. */
export function getSeedWords(): readonly string[] {
  const raw = import.meta.env.VITE_SEED_WORDS?.trim();
  if (!raw) return DEFAULT_SEED;
  const words = raw.split(/[\s,]+/).filter(Boolean);
  if (words.length === 12) return words;
  return DEFAULT_SEED;
}
