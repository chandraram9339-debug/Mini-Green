/**
 * "all" | "1" | "1,2" | "1,2,3" — with which user deposit the referrer is paid.
 */
export function isReferralDepositCovered(ordinal: number, rule: string) {
  const r = String(rule).trim().toLowerCase();
  if (r === "all" || r === "" || r === "*") return true;
  for (const part of r.split(/[,\s]+/)) {
    if (!part) continue;
    if (part === "all") return true;
    if (Number(part) === ordinal) return true;
  }
  return false;
}
