import type { Database } from "better-sqlite3";
import { Address } from "@ton/core";
import type { AppConfig } from "../config.js";
import { tryClaimIdempotency } from "../domain/idempotency.js";
import {
  getFeeSnapshot,
  getCentralTonDepositAddress,
  setAppConfigValue
} from "../domain/effectiveConfig.js";
import { logEvent } from "../httpEnvelope.js";
import { tonApiGetJson } from "../integrations/tonClient.js";
import { getUserByTg } from "../repos/userRepo.js";
import { applyDepositNet } from "./depositService.js";

type TonApiEvent = {
  event_id?: string;
  /** Unix seconds (TonAPI). */
  timestamp?: number;
  actions?: Array<Record<string, unknown>>;
};

function addrFrom(v: unknown): string | null {
  if (typeof v === "string" && v.trim()) return v.trim();
  if (v && typeof v === "object" && "address" in v) return addrFrom((v as { address: unknown }).address);
  return null;
}

function matchesCentral(central: Address, addr: string | null): boolean {
  if (!addr) return false;
  try {
    return Address.parse(addr).equals(central);
  } catch {
    return false;
  }
}

/** Detect TonTransfer / JettonTransfer crediting the treasury with optional text memo. */
function extractIncomingTonDeposit(
  central: Address,
  action: Record<string, unknown>
): { comment: string | null } | null {
  if (action.status === "failed" || action.status === "Failed") return null;
  const typ = String(action.type ?? "");
  if (typ === "TonTransfer") {
    const p = action.TonTransfer as Record<string, unknown> | undefined;
    if (!p) return null;
    const recipient = addrFrom(p.recipient);
    const sender = addrFrom(p.sender);
    if (!recipient || !matchesCentral(central, recipient)) return null;
    if (sender && matchesCentral(central, sender)) return null;
    const comment = typeof p.comment === "string" ? p.comment : null;
    return { comment };
  }
  if (typ === "JettonTransfer") {
    const p = action.JettonTransfer as Record<string, unknown> | undefined;
    if (!p) return null;
    const recipient = addrFrom(p.recipient);
    if (!recipient || !matchesCentral(central, recipient)) return null;
    const sender = addrFrom(p.sender);
    if (sender && matchesCentral(central, sender)) return null;
    const comment = typeof p.comment === "string" ? p.comment : null;
    return { comment };
  }
  return null;
}

/**
 * Poll TonAPI for new account events; **stub bridge**: log + credit fixed gross (ledger USDT) when comment matches `tg_user_id`.
 * Idempotent per `event_id` via `applyDepositNet` idempotency_key `ton_evt:<event_id>`.
 */
export async function ingestTonCentralDepositsOnce(db: Database, c: AppConfig, trace: string): Promise<void> {
  const rawAddr = getCentralTonDepositAddress(db, c).trim();
  if (!rawAddr) return;

  let central: Address;
  try {
    central = Address.parse(rawAddr);
  } catch (e) {
    logEvent(trace, "ton.ingest.bad_central_address", { err: String(e) });
    return;
  }

  const rowW = db
    .prepare("SELECT value FROM app_config WHERE key = ?")
    .get("ton_ingest_waterline_ts") as { value: string } | undefined;
  let waterline = Math.max(0, Math.floor(Number(rowW?.value ?? "0") || 0));
  const nowSec = Math.floor(Date.now() / 1000);
  if (waterline <= 0) waterline = Math.max(0, nowSec - 7200);

  const path = `/v2/accounts/${encodeURIComponent(rawAddr)}/events?limit=40&start_date=${waterline}`;
  let data: { events?: TonApiEvent[] };
  try {
    data = (await tonApiGetJson(c, path)) as { events?: TonApiEvent[] };
  } catch (e) {
    logEvent(trace, "ton.ingest.fetch_failed", { err: String(e) });
    return;
  }

  const events = Array.isArray(data.events) ? [...data.events].reverse() : [];

  let maxSeenTs = waterline;
  for (const ev of events) {
    const ts = Number(ev.timestamp ?? 0);
    if (Number.isFinite(ts) && ts > maxSeenTs) maxSeenTs = ts;
  }

  for (const ev of events) {
    const eid = String(ev.event_id ?? "").trim();
    if (!eid) continue;

    const actions = Array.isArray(ev.actions) ? ev.actions : [];

    for (const act of actions) {
      const rec = extractIncomingTonDeposit(central, act as Record<string, unknown>);
      if (!rec) continue;

      const comment = rec.comment?.trim() ?? "";
      if (!comment) {
        if (tryClaimIdempotency(db, `ton_skip_nocomment:${eid}`)) {
          logEvent(trace, "ton.ingest.skip_no_comment", { event_id: eid });
        }
        break;
      }
      if (!/^\d{1,32}$/.test(comment)) {
        if (tryClaimIdempotency(db, `ton_skip_badcomment:${eid}`)) {
          logEvent(trace, "ton.ingest.skip_bad_comment", { event_id: eid, comment });
        }
        break;
      }

      const u = getUserByTg(db, comment);
      if (!u) {
        if (tryClaimIdempotency(db, `ton_skip_nouser:${eid}`)) {
          logEvent(trace, "ton.ingest.skip_user_not_found", { event_id: eid, tg_user_id: comment });
        }
        break;
      }

      const fees = getFeeSnapshot(db, c);
      const grossMinor = Math.max(0, c.tonIngestStubGrossMinor);
      const idem = `ton_evt:${eid}`;

      logEvent(trace, "ton.ingest.stub_bridge", {
        event_id: eid,
        tg_user_id: comment,
        gross_minor: grossMinor,
        note: "Replace with real bridge settlement; ledger credit is stubbed",
      });

      const r = applyDepositNet(
        db,
        c,
        fees,
        u.id,
        u.tg_user_id,
        grossMinor,
        idem,
        "ton_ingest_stub",
        eid,
        trace
      );

      if (!r.ok) {
        logEvent(trace, "ton.ingest.apply_failed", { event_id: eid, error: r.error });
      }

      break;
    }

  }

  if (maxSeenTs > waterline) {
    setAppConfigValue(db, "ton_ingest_waterline_ts", String(maxSeenTs));
  }
}
