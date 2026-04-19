import type { Database } from "better-sqlite3";
import type { AppConfig } from "../config.js";
import type { FeeSnapshot } from "../domain/effectiveConfig.js";
import { logEvent } from "../httpEnvelope.js";

type Row = { pixel_id: string; access_token: string };

function buildPixelMap(db: Database, c: AppConfig) {
  const rows = db
    .prepare("SELECT pixel_id, access_token FROM meta_ad_accounts WHERE is_enabled=1")
    .all() as Row[];
  const byPixel = new Map<string, Row>();
  for (const r of rows) {
    if (r.pixel_id && r.access_token) {
      byPixel.set(r.pixel_id, r);
    }
  }
  if (c.metaPixelId && c.metaAccessToken) {
    byPixel.set(c.metaPixelId, { pixel_id: c.metaPixelId, access_token: c.metaAccessToken });
  }
  return byPixel;
}

/**
 * CAPI "Subscribe" — бот/подписка на чат. Same пиксели, что и Purchase.
 */
export function sendSubscribeCapi(
  db: Database,
  c: AppConfig,
  tgUserId: string,
  trace: string
) {
  const byPixel = buildPixelMap(db, c);
  if (byPixel.size === 0) {
    return;
  }
  for (const { pixel_id, access_token } of byPixel.values()) {
    const dataBody = {
      data: [
        {
          event_name: "Subscribe",
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website" as const,
          user_data: {
            external_id: [String(tgUserId).slice(0, 64)]
          }
        }
      ],
      access_token,
      ...(c.metaTestEventCode ? { test_event_code: c.metaTestEventCode } : {})
    };
    const url = `https://graph.facebook.com/v20.0/${encodeURIComponent(pixel_id)}/events`;
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataBody)
    })
      .then((r) => {
        if (!r.ok) {
          return r
            .text()
            .then((t) =>
              logEvent(trace, "meta.capi_subscribe_fail", { pixel: pixel_id, status: r.status, t: t.slice(0, 200) })
            );
        }
        return logEvent(trace, "meta.capi_subscribe_ok", { pixel: pixel_id });
      })
      .catch((e) => logEvent(trace, "meta.capi_subscribe_err", { pixel: pixel_id, err: String(e) }));
  }
}

/**
 * CAPI "Purchase" (депозит), порог `meta_purchase_min_usdt` в fees.
 */
export function sendPurchaseCapi(
  db: Database,
  c: AppConfig,
  tgUserId: string,
  netUsdt: number,
  fees: FeeSnapshot,
  trace: string
) {
  if (fees.metaPurchaseMinUsdt > 0 && netUsdt < fees.metaPurchaseMinUsdt) {
    logEvent(trace, "meta.capi_skipped_min", { netUsdt, min: fees.metaPurchaseMinUsdt });
    return;
  }
  const byPixel = buildPixelMap(db, c);
  if (byPixel.size === 0) {
    return;
  }
  for (const { pixel_id, access_token } of byPixel.values()) {
    const dataBody = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website" as const,
          user_data: {
            external_id: [String(tgUserId).slice(0, 64)]
          },
          custom_data: { value: netUsdt, currency: "USD" }
        }
      ],
      access_token,
      ...(c.metaTestEventCode ? { test_event_code: c.metaTestEventCode } : {})
    };
    const url = `https://graph.facebook.com/v20.0/${encodeURIComponent(pixel_id)}/events`;
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataBody)
    })
      .then((r) => {
        if (!r.ok) {
          return r
            .text()
            .then((t) =>
              logEvent(trace, "meta.capi_fail", { pixel: pixel_id, status: r.status, t: t.slice(0, 200) })
            );
        }
        return logEvent(trace, "meta.capi_ok", { pixel: pixel_id });
      })
      .catch((e) => logEvent(trace, "meta.capi_err", { pixel: pixel_id, err: String(e) }));
  }
}
