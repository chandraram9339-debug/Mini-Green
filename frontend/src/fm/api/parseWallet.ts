import type { WalletSnapshot } from "./types";

function num(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const x = Number.parseFloat(v.replace(",", "."));
    if (Number.isFinite(x)) return x;
  }
  return undefined;
}

/** Разбор ответа GET /wallet или объекта wallet из POST /auth/telegram. */
export function parseWalletPayload(root: unknown): WalletSnapshot | undefined {
  if (!root || typeof root !== "object") return undefined;
  const o = root as Record<string, unknown>;
  if (o.data && typeof o.data === "object") {
    const nested = parseWalletPayload(o.data);
    if (nested) return nested;
  }

  const balanceUsdt =
    num(o.balanceUsdt) ??
    num(o.balance_usdt) ??
    num(o.balance) ??
    num((o.wallet as Record<string, unknown>)?.balanceUsdt);
  const referralReceivedUsdt =
    num(o.referralReceivedUsdt) ??
    num(o.referral_received_usdt) ??
    num(o.referralTotalUsdt);

  const depositAddress =
    typeof o.depositAddress === "string"
      ? o.depositAddress
      : typeof o.deposit_address === "string"
        ? o.deposit_address
        : typeof (o.wallet as Record<string, unknown>)?.depositAddress === "string"
          ? ((o.wallet as Record<string, unknown>).depositAddress as string)
          : undefined;

  if (
    balanceUsdt === undefined &&
    referralReceivedUsdt === undefined &&
    depositAddress === undefined
  ) {
    return undefined;
  }

  const availableWithdrawUsdt =
    num(o.availableWithdrawUsdt) ?? num(o.available_withdraw_usdt) ?? num(o.available_to_withdraw);

  return {
    balanceUsdt: Math.max(0, balanceUsdt ?? 0),
    referralReceivedUsdt: Math.max(0, referralReceivedUsdt ?? 0),
    depositAddress,
    availableWithdrawUsdt: availableWithdrawUsdt !== undefined ? Math.max(0, availableWithdrawUsdt) : undefined,
  };
}
