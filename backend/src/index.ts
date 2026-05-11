import "dotenv/config";
import crypto from "node:crypto";
import http from "node:http";
import cors, { type CorsOptions } from "cors";
import express from "express";
import { assertWalletVaultEnv, config } from "./config.js";
import { getTraceId, logEvent, sendError } from "./httpEnvelope.js";
import { registerAdminApi } from "./admin/adminApi.js";
import { getDb, getDbPath } from "./db/connection.js";
import { registerLegacyApiV1 } from "./legacy/legacyApiV1.js";
import { registerMiniappContract } from "./miniapp/miniappRoutes.js";
import { runAutoPushesIfDue } from "./services/pushAutoService.js";
import { registerTelegramWebhook } from "./telegramWebhook.js";
import { registerTradingIngest } from "./tradingIngest.js";
import { scheduleAlTradeFeedPoller } from "./services/alTradeFeedSync.js";
import { scheduleTonDepositPoller } from "./services/tonDepositPoller.js";

const app = express();
const basePort = config.port;

/** В dev/test, если PORT занят — перебираем следующие (не затираем production с NODE_ENV=production). */
function allowDevPortFallback(): boolean {
  if (process.env.PORT_AUTO_FALLBACK === "0") return false;
  if (process.env.PORT_AUTO_FALLBACK === "1") return true;
  const n = process.env.NODE_ENV;
  return n !== "production";
}

function startHttpServer(tryPort: number, attemptsLeft: number): void {
  const server = http.createServer(app);
  server.once("listening", () => {
    const addr = server.address();
    const actual = typeof addr === "object" && addr ? addr.port : tryPort;
    console.log(`backend listening on http://localhost:${actual}`);
    if (actual !== basePort) {
      console.warn(
        `[boot] Port ${basePort} was busy — using ${actual}. Set backend PORT=${actual} and frontend VITE_API_BASE_URL=http://127.0.0.1:${actual} (or stop the other process on ${basePort}).`,
      );
    }
    if (config.jwtSecret === "dev-only-insecure-jwt-do-not-use-in-prod") {
      console.warn(
        "[boot] Using default JWT secret. Set JWT_SECRET in production; never commit real secrets.",
      );
    }
    scheduleAlTradeFeedPoller(db, config);
    scheduleTonDepositPoller(db, config);
    const tr = "push-auto-cron";
    setInterval(
      () => {
        runAutoPushesIfDue(getDb(), config, tr);
      },
      60 * 60 * 1000,
    );
  });
  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE" && allowDevPortFallback() && attemptsLeft > 0) {
      const next = tryPort + 1;
      console.warn(`[boot] Port ${tryPort} in use, trying ${next}`);
      server.close();
      startHttpServer(next, attemptsLeft - 1);
      return;
    }
    console.error(err);
    process.exit(1);
  });
  server.listen(tryPort);
}

const portFallbackRange = Math.max(0, Math.min(100, Number(process.env.PORT_FALLBACK_RANGE ?? "24")));
startHttpServer(basePort, portFallbackRange);

function corsMiddleware(): express.RequestHandler {
  const origins = config.corsOrigins;
  if (origins.length === 0) {
    if (config.authProviderMode === "telegram" || config.executionMode === "telegram") {
      console.warn(
        "[boot] CORS_ORIGINS is empty in telegram mode: using permissive CORS. Set CORS_ORIGINS to a comma-separated whitelist (miniapp origin + https://web.telegram.org) in production."
      );
    }
    return cors();
  }
  const opts: CorsOptions = {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (origins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    }
  };
  return cors(opts);
}

assertWalletVaultEnv(config);
const db = getDb();
console.log(`[boot] SQLite database file: ${getDbPath()} (persist this path on a mounted volume in Docker/K8s)`);
for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, () => {
    try {
      db.prepare("PRAGMA wal_checkpoint(FULL)").run();
      console.log(`[boot] WAL checkpoint done (${sig})`);
    } catch {
      /* ignore */
    }
    process.exit(0);
  });
}
app.use(corsMiddleware());
app.use(express.json());

app.use((req, res, next) => {
  const traceId = crypto.randomUUID();
  res.locals.traceId = traceId;
  res.setHeader("x-trace-id", traceId);
  next();
});

registerTelegramWebhook(app);
registerTradingIngest(app);

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "miniapp-backend",
    miniapp: "v1-telegram-jwt",
    timestamp: new Date().toISOString()
  });
});

/** Figma mini-app + `INTEGRATION.md` (Bearer + optional X-Telegram-Init-Data) */
registerMiniappContract(app);

/** Legacy `/api/v1/ui/*` and `/api/v1/auth/init` (initData in query/body) */
registerLegacyApiV1(app);

/** Статистика, выводы, рассылка, курсы/комиссии (X-Admin-Key) */
registerAdminApi(app);

app.use(
  (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const tid = res.locals?.traceId ? getTraceId(res) : crypto.randomUUID();
    logEvent(tid, "request.failed", {
      error: err instanceof Error ? err.message : String(err)
    });
    if (res.headersSent) return;
    sendError(res, 500, "INTERNAL_ERROR", "internal server error");
  }
);

