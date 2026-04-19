#!/usr/bin/env node
/**
 * Снимок внешней торговой системы (AL): GET /api/trade-feed (HTTP Basic), как в alTradeFeedSync.
 * Фильтр по времени: события за последние N часов (по умолчанию 1).
 *
 *   node scripts/al-trade-feed-last-hour.mjs
 *   node scripts/al-trade-feed-last-hour.mjs --hours=2
 *
 * Переменные: AL_TRADE_FEED_BASE_URL, AL_TRADE_FEED_HTTP_USER, AL_TRADE_FEED_HTTP_PASSWORD
 * (загружаются из backend/.env при запуске из каталога backend)
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

function loadDotenv() {
  const p = path.join(backendRoot, ".env");
  if (!existsSync(p)) return;
  const raw = readFileSync(p, "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadDotenv();

function parseArgHours() {
  const a = process.argv.find((x) => x.startsWith("--hours="));
  if (!a) return null;
  const n = Number(a.slice("--hours=".length));
  return Number.isFinite(n) ? n : null;
}

const hoursArg = parseArgHours();
const hoursEnv =
  process.env.AL_SNAPSHOT_HOURS != null && process.env.AL_SNAPSHOT_HOURS !== ""
    ? Number(process.env.AL_SNAPSHOT_HOURS)
    : NaN;
const hours = Math.max(
  0.01,
  Number.isFinite(hoursArg)
    ? hoursArg
    : Number.isFinite(hoursEnv)
      ? hoursEnv
      : 1,
);

function sortByTime(rows) {
  return [...rows].sort((a, b) => {
    const ta = Date.parse(String(a.time ?? ""));
    const tb = Date.parse(String(b.time ?? ""));
    return ta - tb;
  });
}

async function main() {
  const base = String(process.env.AL_TRADE_FEED_BASE_URL ?? "")
    .trim()
    .replace(/\/$/, "");
  const user = String(process.env.AL_TRADE_FEED_HTTP_USER ?? "").trim();
  const pass = process.env.AL_TRADE_FEED_HTTP_PASSWORD ?? "";

  if (!base || !user) {
    console.error(
      "Задайте AL_TRADE_FEED_BASE_URL и AL_TRADE_FEED_HTTP_USER (и пароль) в backend/.env или в окружении.",
    );
    process.exit(1);
  }

  const url = `${base}/api/trade-feed`;
  const auth = Buffer.from(`${user}:${pass}`, "utf8").toString("base64");

  const ac = new AbortController();
  const to = setTimeout(() => ac.abort(), 45_000);

  let res;
  try {
    res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
      },
      signal: ac.signal,
    });
  } finally {
    clearTimeout(to);
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error(`HTTP ${res.status}`, txt.slice(0, 500));
    process.exit(1);
  }

  const raw = await res.json();
  const opensRaw = Array.isArray(raw.opens) ? raw.opens : [];
  const closesRaw = Array.isArray(raw.closes) ? raw.closes : [];

  const now = Date.now();
  const fromMs = now - hours * 3600 * 1000;

  /** @type {Array<{ kind: string; tradeNumber?: number; pair?: string; time?: string; extra?: Record<string, unknown> }>} */
  const events = [];

  for (const o of opensRaw) {
    const t = Date.parse(String(o.time ?? ""));
    if (!Number.isFinite(t) || t < fromMs || t > now) continue;
    events.push({
      kind: "open",
      tradeNumber: o.tradeNumber,
      pair: o.pair != null ? String(o.pair).trim().toUpperCase() : "",
      time: String(o.time ?? "").trim(),
      extra: {
        entryPrice: o.entryPrice,
      },
    });
  }

  for (const c of closesRaw) {
    const t = Date.parse(String(c.time ?? ""));
    if (!Number.isFinite(t) || t < fromMs || t > now) continue;
    events.push({
      kind: "close",
      tradeNumber: c.tradeNumber,
      pair: c.pair != null ? String(c.pair).trim().toUpperCase() : "",
      time: String(c.time ?? "").trim(),
      extra: {
        exitPrice: c.exitPrice,
        result: c.result,
      },
    });
  }

  const sorted = sortByTime(events);

  const pairs = new Set(sorted.map((e) => e.pair).filter(Boolean));
  const openN = sorted.filter((e) => e.kind === "open").length;
  const closeN = sorted.filter((e) => e.kind === "close").length;

  const out = {
    source: url,
    window: {
      hours,
      fromIso: new Date(fromMs).toISOString(),
      toIso: new Date(now).toISOString(),
    },
    summary: {
      eventsInWindow: sorted.length,
      opens: openN,
      closes: closeN,
      distinctPairs: [...pairs].sort(),
    },
    timeline: sorted.map((e) => ({
      kind: e.kind,
      time: e.time,
      timeIso: Number.isFinite(Date.parse(e.time)) ? new Date(Date.parse(e.time)).toISOString() : null,
      pair: e.pair || null,
      tradeNumber: e.tradeNumber ?? null,
      ...e.extra,
    })),
  };

  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
