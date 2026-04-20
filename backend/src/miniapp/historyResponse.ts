import { getMoneyOperations, getMoneySummaryStats } from "../ledger.js";
import { getDb } from "../db/connection.js";
import { getUserByTg } from "../repos/userRepo.js";

const MINOR_PER_USDT = 100;

function minorToUsdt(minor: number) {
  return Math.round((minor / MINOR_PER_USDT) * 1e4) / 1e4;
}

function formatDate(iso: string) {
  return new Date(iso).toISOString().replace("T", " ").split(".")[0] ?? "—";
}

function formatReferralUserLabel(tgUserId: string | null | undefined) {
  const value = String(tgUserId ?? "").trim();
  if (!value) return "User ID —";
  if (value.length <= 7) return `User ID ${value}`;
  return `User ID ${value.slice(0, 4)}...${value.slice(-3)}`;
}

function formatWalletMask(address: string | null | undefined, head = 5, tail = 4) {
  const value = String(address ?? "").trim();
  if (!value) return "—";
  if (value.length <= head + tail + 4) return value;
  return `${value.slice(0, head)}....${value.slice(-tail)}`;
}

function toLedgerRow(
  amountMinor: number,
  feeMinor: number | null | undefined,
  id: string,
  occurredAt: string,
  defaultTitle: string,
) {
  const mainAmount = minorToUsdt(amountMinor);
  return {
    amount: mainAmount,
    amountUsdt: mainAmount,
    id,
    date: formatDate(occurredAt),
    title: defaultTitle,
    fee: feeMinor != null ? minorToUsdt(feeMinor) : 0,
  };
}

/**
 * Grouped format expected by `parseWalletHistory` on the Figma mini-app.
 */
export function buildWalletHistoryForUser(userId: string) {
  const db = getDb();
  const summary = getMoneySummaryStats(userId);
  const u = getUserByTg(db, userId);

  const depItems = u
    ? (
        db
          .prepare(
            `SELECT id, chain_tx_in, gross_minor, fee_minor, created_at
             FROM deposits
             WHERE user_id = ? AND status = 'completed'
             ORDER BY created_at DESC
             LIMIT 50`,
          )
          .all(u.id) as Array<{
            id: string;
            chain_tx_in: string | null;
            gross_minor: number;
            fee_minor: number;
            created_at: string;
          }>
      ).map((row) =>
        toLedgerRow(
          row.gross_minor,
          row.fee_minor,
          row.chain_tx_in ? formatWalletMask(row.chain_tx_in) : "USDT TRC20",
          row.created_at,
          "Replenishment",
        ),
      )
    : [];

  const witItems = u
    ? (
        db
          .prepare(
            `SELECT id, to_address, amount_minor, fee_minor, created_at
             FROM withdrawals
             WHERE user_id = ? AND status = 'sent'
             ORDER BY created_at DESC
             LIMIT 50`,
          )
          .all(u.id) as Array<{
            id: string;
            to_address: string | null;
            amount_minor: number;
            fee_minor: number;
            created_at: string;
          }>
      ).map((row) =>
        toLedgerRow(
          row.amount_minor,
          row.fee_minor,
          formatWalletMask(row.to_address),
          row.created_at,
          "Withdrawal",
        ),
      )
    : [];

  const refItems = u
    ? (
        db
          .prepare(
            `SELECT rp.from_deposit_id, rp.amount_usdt_minor, rp.created_at, fu.tg_user_id AS from_tg_user_id
             FROM referral_payouts rp
             JOIN users fu ON fu.id = rp.from_user_id
             WHERE rp.to_user_id = ?
             ORDER BY rp.created_at DESC
             LIMIT 50`,
          )
          .all(u.id) as Array<{
            from_deposit_id: string;
            amount_usdt_minor: number;
            created_at: string;
            from_tg_user_id: string | null;
          }>
      ).map((row) =>
        toLedgerRow(
          row.amount_usdt_minor,
          null,
          formatReferralUserLabel(row.from_tg_user_id),
          row.created_at,
          "Referral bonus",
        ),
      )
    : [];

  const sibItems = getMoneyOperations(userId)
    .filter((o) => o.kind === "sib_trade")
    .map((o) => {
      const row = toLedgerRow(o.amount_minor, o.fee_minor, o.id, o.occurred_at, "Trading result (SIB)");
      const signed = minorToUsdt(o.amount_minor);
      return { ...row, amount: signed, amountUsdt: signed };
    });

  const sumMains = (items: { amount: number }[]) => items.reduce((a, b) => a + Math.abs(b.amount), 0);

  return {
    deposit: {
      items: depItems,
      rows: depItems,
      count: summary.deposit_count,
      total: minorToUsdt(summary.deposit_total_gross_minor),
      totalAmount: minorToUsdt(summary.deposit_total_gross_minor)
    },
    withdraw: {
      items: witItems,
      rows: witItems,
      count: summary.withdraw_sent_count,
      total: minorToUsdt(summary.withdraw_sent_amount_minor),
      totalAmount: minorToUsdt(summary.withdraw_sent_amount_minor)
    },
    referral: {
      items: refItems,
      rows: refItems,
      count: summary.invited_users_count,
      total: minorToUsdt(summary.referral_received_minor),
      totalAmount: minorToUsdt(summary.referral_received_minor)
    },
    trading: {
      items: sibItems,
      rows: sibItems,
      count: sibItems.length,
      total: sumMains(sibItems),
      totalAmount: sibItems.reduce((a, b) => a + b.amount, 0)
    }
  };
}
