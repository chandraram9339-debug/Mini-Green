import type { MoneyOperationRecord } from "../ledger.js";
import { getMoneyOperations } from "../ledger.js";

const MINOR_PER_USDT = 100;

function minorToUsdt(minor: number) {
  return Math.round((minor / MINOR_PER_USDT) * 1e4) / 1e4;
}

function toRow(op: MoneyOperationRecord, defaultTitle: string) {
  const isWithdraw = op.kind === "withdraw";
  const mainAmount = minorToUsdt(op.amount_minor);
  const dateRaw = new Date(op.occurred_at).toISOString().replace("T", " ").split(".")[0] ?? "—";
  return {
    amount: mainAmount,
    amountUsdt: mainAmount,
    id: op.id,
    date: dateRaw,
    title: defaultTitle,
    fee: isWithdraw && op.fee_minor != null ? minorToUsdt(op.fee_minor) : 0
  };
}

/**
 * Grouped format expected by `parseWalletHistory` on the Figma mini-app.
 */
export function buildWalletHistoryForUser(userId: string) {
  const all = getMoneyOperations(userId);
  const depItems = all
    .filter((o) => o.kind === "deposit")
    .map((o) => toRow(o, "Replenishment"));
  const witItems = all
    .filter((o) => o.kind === "withdraw")
    .map((o) => toRow(o, "Withdrawal"));
  const refItems = all
    .filter((o) => o.kind === "referral")
    .map((o) => toRow(o, "Referral bonus"));
  const sibItems = all
    .filter((o) => o.kind === "sib_trade")
    .map((o) => {
      const row = toRow(o, "Trading result (SIB)");
      const signed = minorToUsdt(o.amount_minor);
      return { ...row, amount: signed, amountUsdt: signed };
    });

  const sumMains = (items: { amount: number }[]) => items.reduce((a, b) => a + Math.abs(b.amount), 0);

  return {
    deposit: {
      items: depItems,
      rows: depItems,
      count: depItems.length,
      total: sumMains(depItems),
      totalAmount: sumMains(depItems)
    },
    withdraw: {
      items: witItems,
      rows: witItems,
      count: witItems.length,
      total: sumMains(witItems),
      totalAmount: sumMains(witItems)
    },
    referral: {
      items: refItems,
      rows: refItems,
      count: refItems.length,
      total: sumMains(refItems),
      totalAmount: sumMains(refItems)
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
