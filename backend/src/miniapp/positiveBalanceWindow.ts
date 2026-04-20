import type { Database } from "better-sqlite3";

type BalanceEvent = {
  at: string;
  deltaMinor: number;
};

function toMs(iso: string): number | null {
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : null;
}

/**
 * Returns the start of the user's current positive-balance interval.
 * If the user is not positive right now, returns null.
 */
export function getCurrentPositiveBalanceStartedAtMs(
  db: Database,
  internalUserId: number,
): number | null {
  const user = db
    .prepare("SELECT balance_usdt_minor, created_at FROM users WHERE id = ?")
    .get(internalUserId) as { balance_usdt_minor: number; created_at: string } | undefined;

  if (!user || Number(user.balance_usdt_minor) <= 0) return null;

  const events: BalanceEvent[] = [];

  const deposits = db
    .prepare(
      `SELECT COALESCE(NULLIF(trim(completed_at), ''), created_at) AS at, net_minor AS delta_minor
       FROM deposits
       WHERE user_id = ? AND status = 'completed'
       ORDER BY at ASC`,
    )
    .all(internalUserId) as Array<{ at: string; delta_minor: number }>;

  for (const row of deposits) {
    events.push({ at: row.at, deltaMinor: Number(row.delta_minor) || 0 });
  }

  const referrals = db
    .prepare(
      `SELECT created_at AS at, amount_usdt_minor AS delta_minor
       FROM referral_payouts
       WHERE to_user_id = ?
       ORDER BY created_at ASC`,
    )
    .all(internalUserId) as Array<{ at: string; delta_minor: number }>;

  for (const row of referrals) {
    events.push({ at: row.at, deltaMinor: Number(row.delta_minor) || 0 });
  }

  const withdrawals = db
    .prepare(
      `SELECT created_at AS at, -(amount_minor + fee_minor) AS delta_minor
       FROM withdrawals
       WHERE user_id = ? AND status = 'sent'
       ORDER BY created_at ASC`,
    )
    .all(internalUserId) as Array<{ at: string; delta_minor: number }>;

  for (const row of withdrawals) {
    events.push({ at: row.at, deltaMinor: Number(row.delta_minor) || 0 });
  }

  const sibAdjustments = db
    .prepare(
      `SELECT created_at AS at, delta_minor
       FROM sib_adjustments
       WHERE user_id = ?
       ORDER BY created_at ASC`,
    )
    .all(internalUserId) as Array<{ at: string; delta_minor: number }>;

  for (const row of sibAdjustments) {
    events.push({ at: row.at, deltaMinor: Number(row.delta_minor) || 0 });
  }

  events.sort((a, b) => {
    const aMs = toMs(a.at) ?? 0;
    const bMs = toMs(b.at) ?? 0;
    return aMs - bMs;
  });

  let balanceMinor = 0;
  let latestPositiveStartMs: number | null = null;

  for (const event of events) {
    const eventMs = toMs(event.at);
    if (eventMs == null) continue;
    const nextBalanceMinor = balanceMinor + event.deltaMinor;
    if (balanceMinor <= 0 && nextBalanceMinor > 0) {
      latestPositiveStartMs = eventMs;
    }
    balanceMinor = nextBalanceMinor;
  }

  if (latestPositiveStartMs != null) return latestPositiveStartMs;

  const createdAtMs = toMs(user.created_at);
  return createdAtMs ?? Date.now();
}
