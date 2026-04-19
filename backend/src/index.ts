import "dotenv/config";
import crypto from "node:crypto";
import cors from "cors";
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

const app = express();
const port = config.port;

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
app.use(cors());
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

app.listen(port, () => {
  console.log(`backend listening on http://localhost:${port}`);
  if (config.jwtSecret === "dev-only-insecure-jwt-do-not-use-in-prod") {
    console.warn(
      "[boot] Using default JWT secret. Set JWT_SECRET in production; never commit real secrets."
    );
  }
  scheduleAlTradeFeedPoller(db, config);
  const tr = "push-auto-cron";
  setInterval(
    () => {
      runAutoPushesIfDue(getDb(), config, tr);
    },
    60 * 60 * 1000
  );
});
