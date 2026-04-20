import type { Database } from "better-sqlite3";
import type { AppConfig } from "../config.js";
import type { FeeSnapshot } from "../domain/effectiveConfig.js";

type PixelSource = "db" | "env" | "db+env";
type MetaEventName = "Subscribe" | "Purchase";
type MetaSkipReason = "no_pixels" | "below_threshold";

type Row = { label: string | null; pixel_id: string; access_token: string };

export type MetaPixelTarget = {
  pixel_id: string;
  source: PixelSource;
  label: string | null;
};

export type MetaDispatchResult = {
  pixel_id: string;
  source: PixelSource;
  status: "sent" | "failed";
  http_status?: number;
  response_preview?: string;
};

export type MetaDispatchSummary = {
  event_name: MetaEventName;
  event_id: string;
  external_id: string;
  configured: boolean;
  eligible: boolean;
  skipped_reason: MetaSkipReason | null;
  attempted_pixels: number;
  sent_pixels: number;
  failed_pixels: number;
  test_event_code_configured: boolean;
  threshold_usdt: number | null;
  value_usdt: number | null;
  results: MetaDispatchResult[];
};

export type MetaStatusReport = {
  enabled_meta_accounts_count: number;
  env_fallback_configured: boolean;
  test_event_code_configured: boolean;
  webhook_secret_configured: boolean;
  purchase_threshold_usdt: number;
  subscribe_ready: boolean;
  purchase_ready: boolean;
  pixels: MetaPixelTarget[];
  notes: string[];
};

type PixelTargetInternal = MetaPixelTarget & {
  access_token: string;
};

function logMeta(traceId: string, event: string, details: Record<string, unknown> = {}) {
  console.log(
    JSON.stringify({
      level: "info",
      trace_id: traceId,
      event,
      details,
      timestamp: new Date().toISOString()
    })
  );
}

function upsertPixel(
  map: Map<string, PixelTargetInternal>,
  next: { pixel_id: string; access_token: string; source: PixelSource; label: string | null }
) {
  const key = next.pixel_id.trim();
  if (!key || !next.access_token.trim()) return;
  const existing = map.get(key);
  if (!existing) {
    map.set(key, { ...next, pixel_id: key, access_token: next.access_token.trim() });
    return;
  }
  const source: PixelSource =
    existing.source === next.source ? existing.source : "db+env";
  map.set(key, {
    pixel_id: key,
    access_token: next.access_token.trim() || existing.access_token,
    source,
    label: existing.label ?? next.label
  });
}

function buildPixelTargets(db: Database, c: AppConfig): PixelTargetInternal[] {
  const rows = db
    .prepare("SELECT label, pixel_id, access_token FROM meta_ad_accounts WHERE is_enabled=1")
    .all() as Row[];
  const byPixel = new Map<string, PixelTargetInternal>();
  for (const r of rows) {
    upsertPixel(byPixel, {
      pixel_id: String(r.pixel_id ?? "").trim(),
      access_token: String(r.access_token ?? "").trim(),
      source: "db",
      label: r.label ?? null
    });
  }
  if (c.metaPixelId && c.metaAccessToken) {
    upsertPixel(byPixel, {
      pixel_id: c.metaPixelId.trim(),
      access_token: c.metaAccessToken.trim(),
      source: "env",
      label: "[env]"
    });
  }
  return [...byPixel.values()];
}

export function getMetaStatusReport(
  db: Database,
  c: AppConfig,
  fees?: Pick<FeeSnapshot, "metaPurchaseMinUsdt">
): MetaStatusReport {
  const pixels = buildPixelTargets(db, c).map(({ pixel_id, source, label }) => ({ pixel_id, source, label }));
  const threshold = fees?.metaPurchaseMinUsdt ?? 0;
  const notes: string[] = [];
  if (pixels.length === 0) {
    notes.push("No enabled Meta pixels configured via DB or env fallback.");
  }
  if (!c.telegramWebhookSecret.trim()) {
    notes.push("TELEGRAM_WEBHOOK_SECRET missing: production Subscribe via webhook is disabled.");
  }
  if (!c.metaTestEventCode.trim()) {
    notes.push("META_TEST_EVENT_CODE missing: test events will go to live pixel traffic instead of Test Events.");
  }
  if (threshold > 0) {
    notes.push(`Purchase is sent only for deposits with net >= ${threshold} USDT.`);
  }
  return {
    enabled_meta_accounts_count: pixels.filter((p) => p.source === "db" || p.source === "db+env").length,
    env_fallback_configured: Boolean(c.metaPixelId.trim() && c.metaAccessToken.trim()),
    test_event_code_configured: Boolean(c.metaTestEventCode.trim()),
    webhook_secret_configured: Boolean(c.telegramWebhookSecret.trim()),
    purchase_threshold_usdt: threshold,
    subscribe_ready: pixels.length > 0 && Boolean(c.telegramWebhookSecret.trim()),
    purchase_ready: pixels.length > 0,
    pixels,
    notes
  };
}

async function dispatchMetaEvent(
  db: Database,
  c: AppConfig,
  {
    trace,
    eventName,
    externalId,
    eventId,
    valueUsdt,
    thresholdUsdt
  }: {
    trace: string;
    eventName: MetaEventName;
    externalId: string;
    eventId: string;
    valueUsdt?: number;
    thresholdUsdt?: number;
  }
): Promise<MetaDispatchSummary> {
  const pixels = buildPixelTargets(db, c);
  const normalizedExternalId = String(externalId).trim().slice(0, 64);
  const summary: MetaDispatchSummary = {
    event_name: eventName,
    event_id: eventId,
    external_id: normalizedExternalId,
    configured: pixels.length > 0,
    eligible: true,
    skipped_reason: null,
    attempted_pixels: 0,
    sent_pixels: 0,
    failed_pixels: 0,
    test_event_code_configured: Boolean(c.metaTestEventCode.trim()),
    threshold_usdt: thresholdUsdt ?? null,
    value_usdt: valueUsdt ?? null,
    results: []
  };

  if (eventName === "Purchase" && typeof valueUsdt === "number" && typeof thresholdUsdt === "number" && thresholdUsdt > 0 && valueUsdt < thresholdUsdt) {
    summary.eligible = false;
    summary.skipped_reason = "below_threshold";
    logMeta(trace, "meta.capi_skipped_min", {
      event_name: eventName,
      event_id: eventId,
      external_id: normalizedExternalId,
      value_usdt: valueUsdt,
      threshold_usdt: thresholdUsdt
    });
    return summary;
  }

  if (pixels.length === 0) {
    summary.eligible = false;
    summary.skipped_reason = "no_pixels";
    logMeta(trace, "meta.capi_skipped_no_pixels", {
      event_name: eventName,
      event_id: eventId,
      external_id: normalizedExternalId
    });
    return summary;
  }

  logMeta(trace, "meta.capi_dispatch_start", {
    event_name: eventName,
    event_id: eventId,
    external_id: normalizedExternalId,
    pixel_count: pixels.length,
    test_event_code_configured: summary.test_event_code_configured,
    value_usdt: valueUsdt ?? null
  });

  for (const { pixel_id, access_token, source } of pixels) {
    const dataBody = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website" as const,
          event_id: eventId,
          user_data: {
            external_id: [normalizedExternalId]
          },
          ...(typeof valueUsdt === "number"
            ? { custom_data: { value: valueUsdt, currency: "USD" } }
            : {})
        }
      ],
      access_token,
      ...(c.metaTestEventCode ? { test_event_code: c.metaTestEventCode } : {})
    };
    const url = `https://graph.facebook.com/v20.0/${encodeURIComponent(pixel_id)}/events`;
    try {
      summary.attempted_pixels += 1;
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataBody)
      });
      if (!r.ok) {
        const preview = (await r.text().catch(() => "")).slice(0, 300);
        summary.failed_pixels += 1;
        summary.results.push({
          pixel_id,
          source,
          status: "failed",
          http_status: r.status,
          response_preview: preview
        });
        logMeta(trace, "meta.capi_fail", {
          event_name: eventName,
          event_id: eventId,
          pixel: pixel_id,
          source,
          status: r.status,
          response_preview: preview
        });
        continue;
      }
      summary.sent_pixels += 1;
      summary.results.push({
        pixel_id,
        source,
        status: "sent",
        http_status: r.status
      });
      logMeta(trace, "meta.capi_ok", {
        event_name: eventName,
        event_id: eventId,
        pixel: pixel_id,
        source,
        status: r.status
      });
    } catch (e) {
      const preview = String(e).slice(0, 300);
      summary.failed_pixels += 1;
      summary.results.push({
        pixel_id,
        source,
        status: "failed",
        response_preview: preview
      });
      logMeta(trace, "meta.capi_err", {
        event_name: eventName,
        event_id: eventId,
        pixel: pixel_id,
        source,
        err: preview
      });
    }
  }

  logMeta(trace, "meta.capi_dispatch_done", {
    event_name: eventName,
    event_id: eventId,
    attempted_pixels: summary.attempted_pixels,
    sent_pixels: summary.sent_pixels,
    failed_pixels: summary.failed_pixels
  });
  return summary;
}

export async function triggerTestSubscribeCapi(
  db: Database,
  c: AppConfig,
  tgUserId: string,
  trace: string
): Promise<MetaDispatchSummary> {
  const externalId = String(tgUserId).trim();
  return dispatchMetaEvent(db, c, {
    trace,
    eventName: "Subscribe",
    externalId,
    eventId: `meta:test:subscribe:${externalId}:${Date.now()}`
  });
}

export async function triggerTestPurchaseCapi(
  db: Database,
  c: AppConfig,
  tgUserId: string,
  netUsdt: number,
  fees: FeeSnapshot,
  trace: string
): Promise<MetaDispatchSummary> {
  const externalId = String(tgUserId).trim();
  return dispatchMetaEvent(db, c, {
    trace,
    eventName: "Purchase",
    externalId,
    eventId: `meta:test:purchase:${externalId}:${Date.now()}`,
    valueUsdt: netUsdt,
    thresholdUsdt: fees.metaPurchaseMinUsdt
  });
}

/**
 * CAPI "Subscribe" — бот/подписка на чат. Same пиксели, что и Purchase.
 */
export function sendSubscribeCapi(
  db: Database,
  c: AppConfig,
  tgUserId: string,
  trace: string,
  eventId = `meta:subscribe:${String(tgUserId).trim()}`
) {
  void dispatchMetaEvent(db, c, {
    trace,
    eventName: "Subscribe",
    externalId: tgUserId,
    eventId
  }).catch((e) =>
    logMeta(trace, "meta.capi_unhandled", {
      event_name: "Subscribe",
      event_id: eventId,
      err: String(e).slice(0, 300)
    })
  );
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
  trace: string,
  eventId = `meta:purchase:${String(tgUserId).trim()}:${Date.now()}`
) {
  void dispatchMetaEvent(db, c, {
    trace,
    eventName: "Purchase",
    externalId: tgUserId,
    eventId,
    valueUsdt: netUsdt,
    thresholdUsdt: fees.metaPurchaseMinUsdt
  }).catch((e) =>
    logMeta(trace, "meta.capi_unhandled", {
      event_name: "Purchase",
      event_id: eventId,
      err: String(e).slice(0, 300)
    })
  );
}
