/** @deprecated Old file-store shape; kept for typing legacy routes during migration. */
export type ActionKind = "top-up" | "withdraw";
export type ActionStatus = "accepted" | "on_hold" | "confirmed";

export type ActionRecord = {
  action_id: string;
  user_id: string;
  kind: ActionKind;
  status: ActionStatus;
  amount_minor: number;
  fee_minor: number;
  created_at: string;
  to_address?: string;
};

export type MoneyOperationKind = "deposit" | "withdraw" | "referral" | "sib_trade";
export type MoneyOperationStatus = "pending" | "confirmed";

export type MoneyOperationRecord = {
  id: string;
  kind: MoneyOperationKind;
  status: MoneyOperationStatus;
  amount_minor: number;
  fee_minor: number | null;
  wallet_mask: string | null;
  occurred_at: string;
};
