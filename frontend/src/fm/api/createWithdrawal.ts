import { apiFetch } from "./http";

export type CreateWithdrawalInput = {
  address: string;
  amountUsdt: number;
};

/**
 * Создание заявки на вывод. Тело по умолчанию `{ address, amountUsdt }`.
 * Путь: VITE_API_WITHDRAW_CREATE_PATH (дефолт `/withdrawals`).
 */
export async function createWithdrawalRequest(input: CreateWithdrawalInput): Promise<{ ok: boolean; error?: string }> {
  const path = import.meta.env.VITE_API_WITHDRAW_CREATE_PATH ?? "/withdrawals";
  const res = await apiFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      address: input.address,
      recipientAddress: input.address,
      amountUsdt: input.amountUsdt,
      amount_usdt: input.amountUsdt,
    }),
  });

  if (res.ok) return { ok: true };

  let error = `HTTP ${res.status}`;
  try {
    const text = await res.text();
    if (text) {
      try {
        const j = JSON.parse(text) as Record<string, unknown>;
        const msg =
          (typeof j.message === "string" && j.message) ||
          (typeof j.error === "string" && j.error) ||
          (typeof j.detail === "string" && j.detail);
        if (msg) error = msg;
        else error = text.slice(0, 200);
      } catch {
        error = text.slice(0, 200);
      }
    }
  } catch {
    /* keep error */
  }

  return { ok: false, error };
}
