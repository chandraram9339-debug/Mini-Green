import type { Database } from "better-sqlite3";
import type { AppConfig } from "../config.js";
import { sendTelegramText } from "../integrations/telegramBot.js";
import { logEvent } from "../httpEnvelope.js";

function gval(db: Database, k: string) {
  return (db.prepare("SELECT value FROM app_config WHERE key=?").get(k) as { value: string } | undefined)
    ?.value;
}

function num(s: string | undefined, d: number) {
  if (s === undefined || s === null || s === "") return d;
  const n = Number(s);
  return Number.isFinite(n) ? n : d;
}

function parseIso(s: string | undefined): number | null {
  if (!s) return null;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : null;
}

/**
 * Hourly tick: run auto push modules if enabled, text non-empty, cooldown elapsed. Skips blocked users.
 */
export function runAutoPushesIfDue(db: Database, c: AppConfig, trace: string) {
  if (!c.telegramBotToken) {
    return;
  }
  const now = Date.now();
  const coolH = num(gval(db, "push_auto_cooldown_hours"), 24);
  const coolMs = Math.max(1, coolH) * 60 * 60 * 1000;

  const trySend = (kind: "no_deposit" | "deposited" | "all", enabledKey: string, textKey: string, lastKey: string) => {
    if (gval(db, enabledKey) !== "1") {
      return;
    }
    const text = (gval(db, textKey) ?? "").trim();
    if (!text) {
      return;
    }
    const lastRaw = gval(db, lastKey);
    if (lastRaw == null || String(lastRaw).trim() === "") {
      const iso = new Date().toISOString();
      db.prepare(
        "INSERT INTO app_config (key, value, updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at"
      ).run(lastKey, iso, iso);
      return;
    }
    const lastT = parseIso(String(lastRaw));
    if (lastT != null && now - lastT < coolMs) {
      return;
    }
    const rows = db
      .prepare("SELECT tg_user_id, has_deposited FROM users WHERE blocked_bot_at IS NULL")
      .all() as { tg_user_id: string; has_deposited: number }[];
    let n = 0;
    for (const u of rows) {
      if (kind === "deposited" && u.has_deposited !== 1) continue;
      if (kind === "no_deposit" && u.has_deposited === 1) continue;
      const chat = Number(u.tg_user_id);
      if (Number.isFinite(chat)) {
        sendTelegramText(c, chat, text, trace);
        n += 1;
      }
    }
    const iso = new Date().toISOString();
    db.prepare("INSERT INTO app_config (key, value, updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at").run(
      lastKey,
      iso,
      iso
    );
    logEvent(trace, "push.auto.sent", { kind, n });
  };

  trySend("no_deposit", "push_auto_no_deposit_enabled", "push_auto_text_no_deposit", "push_last_at_no_deposit");
  trySend("deposited", "push_auto_deposited_enabled", "push_auto_text_deposited", "push_last_at_deposited");
  trySend("all", "push_auto_all_enabled", "push_auto_text_all", "push_last_at_all");
}
