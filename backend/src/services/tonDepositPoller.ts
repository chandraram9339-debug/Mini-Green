import type { Database } from "better-sqlite3";
import type { AppConfig } from "../config.js";
import { getCentralTonDepositAddress } from "../domain/effectiveConfig.js";
import { ingestTonCentralDepositsOnce } from "./tonDepositIngest.js";

/**
 * Periodically scans TonAPI for inbound TON/jetton transfers to the central treasury (stub settlement).
 */
export function scheduleTonDepositPoller(db: Database, c: AppConfig): void {
  if (!c.tonIngestEnabled) return;
  const addr = getCentralTonDepositAddress(db, c).trim();
  if (!addr) {
    console.warn("[boot] TON_INGEST_ENABLED=1 but central TON deposit address is empty — poller idle");
    return;
  }
  const ms = Math.max(15_000, c.tonIngestPollSec * 1000);
  const tick = () => {
    const tr = `ton-poller:${Date.now()}`;
    void ingestTonCentralDepositsOnce(db, c, tr).catch((e) => console.error("[ton-ingest]", e));
  };
  tick();
  setInterval(tick, ms);
  console.log(`[boot] TON central ingest poller every ${ms}ms`);
}
