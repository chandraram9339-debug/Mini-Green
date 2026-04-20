import { apiFetch } from "./http";

export async function setBotTradingState(enabled: boolean): Promise<{ ok: boolean; botTradingEnabled?: boolean; error?: string }> {
  const res = await apiFetch("/trading/state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  });

  if (res.ok) {
    try {
      const json = (await res.json()) as { botTradingEnabled?: boolean };
      return { ok: true, botTradingEnabled: json.botTradingEnabled };
    } catch {
      return { ok: true, botTradingEnabled: enabled };
    }
  }

  let error = `HTTP ${res.status}`;
  try {
    const text = await res.text();
    if (text) error = text.slice(0, 200);
  } catch {
    /* keep default */
  }
  return { ok: false, error };
}
