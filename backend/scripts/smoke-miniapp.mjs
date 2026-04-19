#!/usr/bin/env node
/**
 * Проверка ключевых контрактов миниаппа без браузера:
 * health → trading-state (ensure user) → ingest позиций → trading-details/money-details/dashboard.
 *
 * Запуск из каталога backend после сборки:
 *   pnpm run build && node scripts/smoke-miniapp.mjs
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
const distEntry = path.join(backendRoot, "dist", "index.js");

if (!fs.existsSync(distEntry)) {
  console.error("Сначала выполните: pnpm run build (нет dist/index.js)");
  process.exit(1);
}

const DB_PATH = path.join(backendRoot, `runtime/smoke-${Date.now()}.db`);
const PORT = String(14080 + Math.floor(Math.random() * 80));
const INGEST_SECRET = "smoke-ingest-secret";
const INIT = "demo-smoke-init";

const env = {
  ...process.env,
  PORT,
  DB_PATH,
  AUTH_PROVIDER_MODE: "mock",
  EXECUTION_MODE: "mock",
  TRADING_INGEST_SECRET: INGEST_SECRET,
  JWT_SECRET: process.env.JWT_SECRET || "smoke-jwt-test-only",
  ADMIN_API_KEY: process.env.ADMIN_API_KEY || "smoke-admin-key",
  SQLITE_SYNC: "NORMAL",
  ENABLE_OPS_LOGS: "false",
  AL_TRADE_FEED_ENABLED: "0"
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url, opts = {}) {
  const r = await fetch(url, opts);
  const text = await r.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!r.ok) {
    throw new Error(`${opts.method || "GET"} ${url} -> ${r.status}: ${typeof body === "string" ? body : JSON.stringify(body)}`);
  }
  return body;
}

async function waitForHealth(base) {
  for (let i = 0; i < 60; i++) {
    try {
      const j = await fetchJson(`${base}/health`);
      if (j?.ok) return;
    } catch {
      /* retry */
    }
    await sleep(150);
  }
  throw new Error("Timeout waiting for /health");
}

async function main() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  const proc = spawn(process.execPath, [distEntry], {
    cwd: backendRoot,
    env,
    stdio: ["ignore", "pipe", "pipe"]
  });

  let stderr = "";
  proc.stderr.on("data", (d) => {
    stderr += d.toString();
  });

  const base = `http://127.0.0.1:${PORT}`;

  try {
    await waitForHealth(base);
    console.log("[1/5] /health ok");

    const st = await fetchJson(`${base}/api/v1/ui/trading-state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: INIT, enabled: true })
    });
    if (!st?.data?.bot_trading_enabled) {
      throw new Error(`trading-state: ожидалось data.bot_trading_enabled, получено ${JSON.stringify(st)}`);
    }
    console.log("[2/5] trading-state (ensure user + bot on)");

    await fetchJson(`${base}/hooks/trading/v1/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Trading-Secret": INGEST_SECRET
      },
      body: JSON.stringify({
        tg_user_id: "10001",
        upsert_positions: [
          {
            id: "smoke_pos_1",
            symbol: "BTCUSDT",
            side: "long",
            size_minor: 150000,
            opened_at: new Date(Date.now() - 3600_000).toISOString(),
            closed_at: null
          }
        ]
      })
    });
    console.log("[3/5] ingest open position ok");

    const td = await fetchJson(
      `${base}/api/v1/ui/trading-details?initData=${encodeURIComponent(INIT)}&period=7d`
    );
    const payload = td.data;
    if (!payload) throw new Error("trading-details: нет data");
    const pos = payload.positions ?? [];
    if (!Array.isArray(pos) || pos.length < 1) {
      throw new Error(`Ожидалась ≥1 позиция в trading-details, получено: ${JSON.stringify(pos)}`);
    }
    console.log(`[4/5] trading-details: позиций в ответе: ${pos.length} (symbol=${pos[0]?.symbol})`);

    const md = await fetchJson(`${base}/api/v1/ui/money-details?initData=${encodeURIComponent(INIT)}`);
    const mdP = md.data;
    if (mdP?.screen !== "money-details") throw new Error("money-details unexpected shape");
    console.log(`[5/5] money-details ok (wallet_minor=${mdP.wallet_minor})`);

    const dash = await fetchJson(`${base}/api/v1/ui/dashboard?initData=${encodeURIComponent(INIT)}`);
    const dashP = dash.data;
    console.log(`      dashboard ok (open_positions=${dashP?.open_positions})`);

    console.log("\nВсе проверки smoke прошли успешно.");
  } catch (e) {
    console.error("\nОШИБКА:", e.message);
    if (stderr.trim()) console.error("\n--- stderr backend ---\n", stderr.slice(-4000));
    process.exitCode = 1;
  } finally {
    proc.kill("SIGTERM");
    await sleep(300);
    try {
      fs.unlinkSync(DB_PATH);
    } catch {
      /* ignore */
    }
  }
}

main();
