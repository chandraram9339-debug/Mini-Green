import { config } from "../config.js";
import { logEvent } from "../httpEnvelope.js";

/**
 * Optional bridge to your trading engine service (other PC).
 * Set TRADING_ENGINE_NOTIFY_URL — receives POST JSON `{ "tg_user_id", "action": "start"|"stop" }`.
 */
export function fireTradingEngineNotify(tgUserId: string, action: "start" | "stop", traceId: string): void {
  const url = config.tradingEngineNotifyUrl.trim();
  if (!url) return;
  const payload = JSON.stringify({ tg_user_id: tgUserId, action });
  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    signal: AbortSignal.timeout(Math.min(config.tradingEngineNotifyTimeoutMs, 30_000))
  })
    .then(() => {
      logEvent(traceId, "trading_engine.notify.ok", { tg_user_id: tgUserId, action });
    })
    .catch((e: unknown) => {
      logEvent(traceId, "trading_engine.notify.fail", {
        tg_user_id: tgUserId,
        action,
        error: e instanceof Error ? e.message : String(e)
      });
    });
}
