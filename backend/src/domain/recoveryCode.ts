import crypto from "node:crypto";
import type { Database } from "better-sqlite3";
import type { AppConfig } from "../config.js";
import { getUserByTg } from "../repos/userRepo.js";

export type AccountRecoveryPublic = {
  enabled: boolean;
  /** Plain code; only returned on first successful GET /api/v1/ui/seed when a new code is minted. */
  code: string | null;
  /** `just_issued` = first time this session minted the code (store it now). `previously_shown` = code was already minted earlier. `off` = RECOVERY_CODE_PEPPER not set. */
  state: "off" | "just_issued" | "previously_shown";
};

export function hashRecoveryCode(plain: string, pepper: string): string {
  return crypto.createHash("sha256").update(`${pepper}:${plain.trim()}`, "utf8").digest("hex");
}

function generatePlainRecoveryCode(): string {
  const a = crypto.randomBytes(18);
  return a
    .toString("base64")
    .replace(/\+/g, "x")
    .replace(/\//g, "y")
    .replace(/=/g, "")
    .slice(0, 32);
}

/**
 * On first GET /seed: mint a random code, store only its hash; return plaintext once.
 * Later GETs: hash exists → previously_shown, no plaintext.
 */
export function issueOrDescribeRecovery(db: Database, c: AppConfig, tgUserId: string): AccountRecoveryPublic {
  const pepper = c.recoveryCodePepper.trim();
  if (!pepper) {
    return { enabled: false, code: null, state: "off" };
  }
  const u = getUserByTg(db, tgUserId);
  if (!u) {
    return { enabled: true, code: null, state: "previously_shown" };
  }
  const existing = (u as { recovery_code_hash?: string | null }).recovery_code_hash?.trim() ?? "";
  if (existing.length > 0) {
    return { enabled: true, code: null, state: "previously_shown" };
  }

  const plain = generatePlainRecoveryCode();
  const h = hashRecoveryCode(plain, pepper);
  const now = new Date().toISOString();
  const r = db
    .prepare("UPDATE users SET recovery_code_hash = ?, recovery_code_issued_at = ? WHERE id = ? AND recovery_code_hash IS NULL")
    .run(h, now, u.id);
  if (r.changes === 0) {
    return { enabled: true, code: null, state: "previously_shown" };
  }
  return { enabled: true, code: plain, state: "just_issued" };
}

export function findUserIdByPlainRecoveryCode(
  db: Database,
  plain: string,
  pepper: string
): number | null {
  const p = plain.trim();
  if (p.length < 8) return null;
  const h = hashRecoveryCode(p, pepper);
  const row = db.prepare("SELECT id FROM users WHERE recovery_code_hash = ?").get(h) as { id: number } | undefined;
  return row?.id ?? null;
}

/** Whether `userId` row has balance/history blocking silent merge delete. */
export function userHasLedgerActivity(db: Database, userId: number): boolean {
  const u = db.prepare("SELECT balance_usdt_minor, deposit_count FROM users WHERE id = ?").get(userId) as
    | { balance_usdt_minor: number; deposit_count: number }
    | undefined;
  if (!u) return false;
  if ((u.balance_usdt_minor ?? 0) !== 0) return true;
  if ((u.deposit_count ?? 0) !== 0) return true;
  const wd = db.prepare("SELECT count(*) as n FROM withdrawals WHERE user_id = ?").get(userId) as { n: number };
  return wd.n > 0;
}
