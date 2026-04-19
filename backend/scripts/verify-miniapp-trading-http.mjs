#!/usr/bin/env node
/**
 * Локальная проверка без браузера: поднять backend → Bearer JWT → GET trading routes.
 * Использует тот же JWT_SECRET и DB_PATH, что и процесс сервера.
 *
 *   node scripts/verify-miniapp-trading-http.mjs
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { SignJWT } from "jose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
const dbPath = path.join(backendRoot, "runtime", "miniapp.db");
const port = String(process.env.PORT ?? 40190 + Math.floor(Math.random() * 80));
const jwtSecret =
  process.env.JWT_SECRET?.trim() || "dev-only-insecure-jwt-do-not-use-in-prod";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitHealth(base, tries = 100) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(`${base}/health`);
      const j = await r.json();
      if (j?.ok) return;
    } catch {
      /* retry */
    }
    await sleep(120);
  }
  throw new Error(`Timeout waiting for ${base}/health`);
}

async function signToken(sub) {
  const key = new TextEncoder().encode(jwtSecret);
  return await new SignJWT({ v: 1 })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(String(sub))
    .setIssuedAt()
    .setExpirationTime("7200s")
    .sign(key);
}

async function main() {
  const db = new Database(dbPath);
  const row = db.prepare("SELECT tg_user_id FROM users LIMIT 1").get();
  db.close();
  if (!row?.tg_user_id) {
    throw new Error(`No users in ${dbPath}`);
  }
  const token = await signToken(row.tg_user_id);

  const env = {
    ...process.env,
    PORT: port,
    DB_PATH: dbPath,
    JWT_SECRET: jwtSecret,
  };

  const proc = spawn(process.execPath, ["--import", "tsx", "src/index.ts"], {
    cwd: backendRoot,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  proc.stderr.on("data", (c) => process.stderr.write(c));

  const base = `http://127.0.0.1:${port}`;
  try {
    await waitHealth(base);
    const headers = { Authorization: `Bearer ${token}` };

    const rSum = await fetch(`${base}/trading/summary?period=24h`, { headers });
    const rJour = await fetch(`${base}/trading/journal?limit=5`, { headers });

    const sumText = await rSum.text();
    const jourText = await rJour.text();
    let sumJson;
    let jourJson;
    try {
      sumJson = JSON.parse(sumText);
    } catch {
      sumJson = sumText;
    }
    try {
      jourJson = JSON.parse(jourText);
    } catch {
      jourJson = jourText;
    }

    console.log("[verify] GET /trading/summary ->", rSum.status);
    console.log("[verify] GET /trading/journal ->", rJour.status);
    if (rSum.ok && sumJson?.stats?.["24h"]) {
      console.log("[verify] stats.24h:", sumJson.stats["24h"]);
    }
    if (rJour.ok && Array.isArray(jourJson?.items)) {
      console.log("[verify] journal items:", jourJson.items.length);
    }
    if (!rSum.ok) console.error("[verify] summary body:", sumJson);
    if (!rJour.ok) console.error("[verify] journal body:", jourJson);

    if (!rSum.ok || !rJour.ok) process.exitCode = 1;
  } finally {
    proc.kill("SIGTERM");
    await sleep(400);
    try {
      proc.kill("SIGKILL");
    } catch {
      /* ignore */
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
