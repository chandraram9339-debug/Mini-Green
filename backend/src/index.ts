import "dotenv/config";
import cors from "cors";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const executionMode = process.env.EXECUTION_MODE ?? "mock";
const authProviderMode = process.env.AUTH_PROVIDER_MODE ?? executionMode;
const telegramBotToken = String(process.env.TELEGRAM_BOT_TOKEN ?? "");
const initSignatureSecret = String(
  process.env.MOCK_INITDATA_SECRET ?? "mock-init-secret-v1"
);
const initSignatureMaxAgeSec = Number(
  process.env.MOCK_INITDATA_MAX_AGE_SEC ?? 86400
);
const allowedDemoTokens = new Set(
  String(process.env.DEMO_INIT_TOKENS ?? "demo-smoke-init,demo-smoke-init-2")
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean)
);
const demoUserId = String(process.env.DEMO_INIT_USER_ID ?? "10001");
const actionStorePath = path.resolve(
  process.env.ACTION_STORE_PATH ?? path.join(process.cwd(), "runtime", "action-store.json")
);
const enableOpsLogs = String(process.env.ENABLE_OPS_LOGS ?? "true") === "true";
const withdrawFeeBps = Number(process.env.WITHDRAW_FEE_BPS ?? 1000); // 10%
const minWithdrawMinor = Number(process.env.MIN_WITHDRAW_MINOR ?? 500); // 5.00

app.use(cors());
app.use(express.json());

type InitValidation =
  | { ok: true; userId: string; source: "demo-token" | "signed-payload" | "telegram" }
  | { ok: false; status: 400 | 401 | 500; code: string; reason: string };
type ActionKind = "top-up" | "withdraw";
type ActionStatus = "accepted" | "on_hold" | "confirmed";

type ActionRecord = {
  action_id: string;
  user_id: string;
  kind: ActionKind;
  status: ActionStatus;
  amount_minor: number;
  fee_minor: number;
  created_at: string;
};

type MoneyOperationKind = "deposit" | "withdraw" | "referral";
type MoneyOperationStatus = "pending" | "confirmed";

type MoneyOperationRecord = {
  id: string;
  kind: MoneyOperationKind;
  status: MoneyOperationStatus;
  amount_minor: number;
  fee_minor: number | null;
  wallet_mask: string | null;
  occurred_at: string;
};

type NotificationRecord = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  level: "info" | "warning" | "success";
};

type SettingsRecord = {
  theme: "light" | "black";
  push: boolean;
  vibration: boolean;
  support_url: string;
  faq_url: string;
  referral_link: string;
};

function logEvent(traceId: string, event: string, details: Record<string, unknown> = {}) {
  if (!enableOpsLogs) return;
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

function getTraceId(res: express.Response) {
  const traceCandidate = (res.locals as { traceId?: unknown } | undefined)?.traceId;
  return typeof traceCandidate === "string" && traceCandidate ? traceCandidate : "trace_unavailable";
}

function sendError(res: express.Response, status: number, code: string, reason: string) {
  res.status(status).json({
    ok: false,
    trace_id: getTraceId(res),
    error: { code, reason, status }
  });
}

function sendSuccess(res: express.Response, data: Record<string, unknown>) {
  res.json({
    ok: true,
    trace_id: getTraceId(res),
    data
  });
}

function sha256Hex(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function ensureStoreDir() {
  fs.mkdirSync(path.dirname(actionStorePath), { recursive: true });
}

function loadActionStore() {
  try {
    ensureStoreDir();
    if (!fs.existsSync(actionStorePath)) return new Map<string, ActionRecord>();
    const parsed = JSON.parse(fs.readFileSync(actionStorePath, "utf8")) as ActionRecord[];
    return new Map(parsed.map((item) => [item.action_id, item]));
  } catch {
    return new Map<string, ActionRecord>();
  }
}

const actionStore = loadActionStore();

function persistActionStore() {
  ensureStoreDir();
  fs.writeFileSync(
    actionStorePath,
    `${JSON.stringify(Array.from(actionStore.values()), null, 2)}\n`,
    "utf8"
  );
}

function validateInitData(initDataRaw: unknown): InitValidation {
  if (typeof initDataRaw !== "string" || !initDataRaw.trim()) {
    return {
      ok: false,
      status: 400,
      code: "INIT_DATA_REQUIRED",
      reason: "initData must be a non-empty string"
    };
  }
  const initData = initDataRaw.trim();

  if (authProviderMode === "telegram") {
    if (!telegramBotToken) {
      return {
        ok: false,
        status: 500,
        code: "AUTH_PROVIDER_UNAVAILABLE",
        reason: "auth provider is not configured"
      };
    }
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    const authDate = params.get("auth_date");
    const userRaw = params.get("user");
    if (!hash || !authDate || !userRaw) {
      return {
        ok: false,
        status: 401,
        code: "INIT_DATA_INVALID",
        reason: "initData verification failed"
      };
    }
    const authDateSec = Number(authDate);
    const nowSec = Math.floor(Date.now() / 1000);
    if (!Number.isInteger(authDateSec) || Math.abs(nowSec - authDateSec) > initSignatureMaxAgeSec) {
      return {
        ok: false,
        status: 401,
        code: "INIT_DATA_INVALID",
        reason: "initData verification failed"
      };
    }
    const dataCheckString = Array.from(params.entries())
      .filter(([key]) => key !== "hash")
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");
    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(telegramBotToken)
      .digest();
    const expectedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");
    if (hash !== expectedHash) {
      return {
        ok: false,
        status: 401,
        code: "INIT_DATA_INVALID",
        reason: "initData verification failed"
      };
    }
    try {
      const userObj = JSON.parse(userRaw) as { id?: unknown };
      const userId =
        typeof userObj.id === "string"
          ? userObj.id
          : typeof userObj.id === "number"
            ? String(userObj.id)
            : "";
      if (!userId) throw new Error("user id missing");
      return { ok: true, userId, source: "telegram" };
    } catch {
      return {
        ok: false,
        status: 401,
        code: "INIT_DATA_INVALID",
        reason: "initData verification failed"
      };
    }
  }

  if (authProviderMode !== "mock") {
    return {
      ok: false,
      status: 500,
      code: "AUTH_PROVIDER_UNAVAILABLE",
      reason: "auth provider is not configured"
    };
  }

  if (allowedDemoTokens.has(initData)) {
    return { ok: true, userId: demoUserId, source: "demo-token" };
  }

  const params = new URLSearchParams(initData);
  const userRaw = params.get("user");
  const authDate = params.get("auth_date");
  const hash = params.get("hash");
  if (!userRaw || !authDate || !hash) {
    return {
      ok: false,
      status: 401,
      code: "INIT_DATA_INVALID",
      reason: "initData verification failed"
    };
  }
  const authDateSec = Number(authDate);
  const nowSec = Math.floor(Date.now() / 1000);
  if (!Number.isInteger(authDateSec) || Math.abs(nowSec - authDateSec) > initSignatureMaxAgeSec) {
    return {
      ok: false,
      status: 401,
      code: "INIT_DATA_INVALID",
      reason: "initData verification failed"
    };
  }
  try {
    const userObj = JSON.parse(userRaw) as { id?: unknown };
    const userId =
      typeof userObj.id === "string"
        ? userObj.id
        : typeof userObj.id === "number"
          ? String(userObj.id)
          : "";
    if (!userId) throw new Error("user id missing");
    const expectedHash = sha256Hex(`${initSignatureSecret}|${userId}|${authDate}`);
    if (hash !== expectedHash) {
      return {
        ok: false,
        status: 401,
        code: "INIT_DATA_INVALID",
        reason: "initData verification failed"
      };
    }
    return { ok: true, userId, source: "signed-payload" };
  } catch {
    return {
      ok: false,
      status: 401,
      code: "INIT_DATA_INVALID",
      reason: "initData verification failed"
    };
  }
}

function accountSeed(userId: string) {
  return crypto.createHash("sha256").update(userId).digest().readUInt32BE(0);
}

function getAccountSnapshot(userId: string) {
  const seed = accountSeed(userId);
  const baseAvailable = 100000 + (seed % 50000);
  const basePnl = (seed % 9000) - 3000;
  const positions = [
    {
      symbol: "BTCUSDT",
      side: seed % 2 === 0 ? "long" : "short",
      size_minor: 14000 + (seed % 9000)
    },
    {
      symbol: "ETHUSDT",
      side: seed % 2 === 0 ? "short" : "long",
      size_minor: 9000 + ((seed >> 4) % 7000)
    }
  ];
  const actions = Array.from(actionStore.values()).filter((action) => action.user_id === userId);
  const topupConfirmed = actions
    .filter((action) => action.kind === "top-up" && action.status === "confirmed")
    .reduce((sum, action) => sum + action.amount_minor, 0);
  const withdrawConfirmed = actions
    .filter((action) => action.kind === "withdraw" && action.status === "confirmed")
    .reduce((sum, action) => sum + action.amount_minor, 0);
  const withdrawOnHold = actions
    .filter((action) => action.kind === "withdraw" && action.status === "on_hold")
    .reduce((sum, action) => sum + action.amount_minor + action.fee_minor, 0);

  const availableMinor = baseAvailable + topupConfirmed - withdrawConfirmed - withdrawOnHold;
  return {
    available_minor: Math.max(0, availableMinor),
    locked_minor: withdrawOnHold,
    wallet_minor: Math.max(0, availableMinor + withdrawOnHold),
    pnl_minor: basePnl,
    positions,
    stats_source: availableMinor > 0 ? "algorithm-system" : "trade-journal"
  };
}

function getMoneyOperations(userId: string): MoneyOperationRecord[] {
  const actionOps: MoneyOperationRecord[] = Array.from(actionStore.values())
    .filter((action) => action.user_id === userId)
    .map((action) => ({
      id: `op_${action.action_id}`,
      kind: action.kind === "top-up" ? "deposit" : "withdraw",
      status: action.status === "confirmed" ? "confirmed" : "pending",
      amount_minor: action.amount_minor,
      fee_minor: action.kind === "withdraw" ? action.fee_minor : null,
      wallet_mask:
        action.kind === "withdraw"
          ? "TRC20 · wallet ending …91AF"
          : "USDT deposit channel",
      occurred_at: action.created_at
    }));

  // Deterministic referral entries keep UI feed populated even before referral backend is finalized.
  const referralOps: MoneyOperationRecord[] = [
    {
      id: `op_ref_${userId}_1`,
      kind: "referral",
      status: "confirmed",
      amount_minor: 1800,
      fee_minor: null,
      wallet_mask: null,
      occurred_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: `op_ref_${userId}_2`,
      kind: "referral",
      status: "confirmed",
      amount_minor: 900,
      fee_minor: null,
      wallet_mask: null,
      occurred_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  return [...actionOps, ...referralOps]
    .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
    .slice(0, 25);
}

function validateQueryInit(req: express.Request, res: express.Response) {
  const initData = typeof req.query.initData === "string" ? req.query.initData.trim() : "";
  if (!initData) {
    sendError(res, 400, "INIT_DATA_REQUIRED", "initData query param must be provided");
    return null;
  }
  const validation = validateInitData(initData);
  if (!validation.ok) {
    sendError(res, validation.status, validation.code, validation.reason);
    return null;
  }
  return validation;
}

function validateBodyInit(req: express.Request, res: express.Response) {
  const validation = validateInitData(req.body?.initData);
  if (!validation.ok) {
    sendError(res, validation.status, validation.code, validation.reason);
    return null;
  }
  return validation;
}

app.use((req, res, next) => {
  const traceId = crypto.randomUUID();
  res.locals.traceId = traceId;
  res.setHeader("x-trace-id", traceId);
  next();
});

app.get("/health", (_req, res) => {
  sendSuccess(res, {
    service: "miniapp-backend",
    timestamp: new Date().toISOString()
  });
});

app.post("/api/v1/auth/init", (req, res) => {
  const validation = validateInitData(req.body?.initData);
  if (!validation.ok) {
    logEvent(res.locals.traceId, "auth.init.rejected", { code: validation.code });
    sendError(res, validation.status, validation.code, validation.reason);
    return;
  }
  logEvent(res.locals.traceId, "auth.init.accepted", {
    user_id: validation.userId,
    source: validation.source,
    provider_mode: authProviderMode
  });
  sendSuccess(res, {
    api_version: "v1",
    mode: executionMode,
    user: {
      id: validation.userId,
      role: "demo"
    },
    init_source: validation.source,
    auth_provider_mode: authProviderMode
  });
});

app.get("/api/v1/ui/dashboard", (req, res) => {
  const validation = validateQueryInit(req, res);
  if (!validation) return;
  const snapshot = getAccountSnapshot(validation.userId);
  sendSuccess(res, {
    screen: "dashboard",
    wallet_minor: snapshot.wallet_minor,
    pnl_minor: snapshot.pnl_minor,
    open_positions: snapshot.positions.length
  });
});

app.get("/api/v1/ui/money-details", (req, res) => {
  const validation = validateQueryInit(req, res);
  if (!validation) return;
  const snapshot = getAccountSnapshot(validation.userId);
  const operations = getMoneyOperations(validation.userId);
  sendSuccess(res, {
    screen: "money-details",
    available_minor: snapshot.available_minor,
    locked_minor: snapshot.locked_minor,
    currency: "USD",
    operations
  });
});

app.get("/api/v1/ui/trading-details", (req, res) => {
  const validation = validateQueryInit(req, res);
  if (!validation) return;
  const snapshot = getAccountSnapshot(validation.userId);
  sendSuccess(res, {
    screen: "trading-details",
    positions: snapshot.positions,
    stats_source: snapshot.stats_source
  });
});

app.get("/api/v1/ui/faq", (req, res) => {
  const validation = validateQueryInit(req, res);
  if (!validation) return;
  sendSuccess(res, {
    screen: "faq",
    items: [
      {
        id: "withdraw",
        q: "How to withdraw money?",
        a: "Open Withdraw screen, fill TRON wallet and amount, then confirm."
      },
      {
        id: "timing",
        q: "How long does withdrawal take?",
        a: "Usually 10 minutes to 3 hours. In edge cases up to 7 days."
      }
    ]
  });
});

app.get("/api/v1/ui/notifications", (req, res) => {
  const validation = validateQueryInit(req, res);
  if (!validation) return;
  const records: NotificationRecord[] = Array.from(actionStore.values())
    .filter((action) => action.user_id === validation.userId)
    .slice(-15)
    .reverse()
    .map((action) => ({
      id: `notif_${action.action_id}`,
      title:
        action.kind === "withdraw"
          ? action.status === "confirmed"
            ? "Withdrawal completed"
            : "Withdrawal pending"
          : action.status === "confirmed"
            ? "Top up confirmed"
            : "Top up created",
      body: `${action.kind} ${action.amount_minor} minor`,
      created_at: action.created_at,
      level: action.status === "confirmed" ? "success" : "info"
    }));
  sendSuccess(res, {
    screen: "notifications",
    items: records
  });
});

app.get("/api/v1/ui/settings", (req, res) => {
  const validation = validateQueryInit(req, res);
  if (!validation) return;
  const settings: SettingsRecord = {
    theme: "black",
    push: true,
    vibration: true,
    support_url: "https://t.me/support",
    faq_url: "https://t.me/faq",
    referral_link: `https://t.me/miniapp?start=${validation.userId}`
  };
  sendSuccess(res, {
    screen: "settings",
    ...settings
  });
});

app.get("/api/v1/ui/seed", (req, res) => {
  const validation = validateQueryInit(req, res);
  if (!validation) return;
  const seedWords = [
    "bridge",
    "core",
    "limit",
    "query",
    "fiber",
    "window",
    "quantum",
    "garden",
    "switch",
    "ember",
    "vault",
    "origin"
  ];
  sendSuccess(res, {
    screen: "seed",
    words: seedWords
  });
});

app.get("/api/v1/ui/agreement", (req, res) => {
  const validation = validateQueryInit(req, res);
  if (!validation) return;
  sendSuccess(res, {
    screen: "agreement",
    title: "User Agreement",
    content:
      "This mini app provides informational and execution support. No investment guarantees are provided."
  });
});

app.post("/api/v1/ui/top-up", (req, res) => {
  const validation = validateBodyInit(req, res);
  if (!validation) return;
  const amountMinor = req.body?.amount_minor;
  if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
    sendError(res, 400, "AMOUNT_MINOR_INVALID", "amount_minor must be a positive integer");
    return;
  }
  const actionId = `tu_${crypto.randomUUID()}`;
  actionStore.set(actionId, {
    action_id: actionId,
    user_id: validation.userId,
    kind: "top-up",
    status: "accepted",
    amount_minor: amountMinor,
    fee_minor: 0,
    created_at: new Date().toISOString()
  });
  persistActionStore();
  sendSuccess(res, {
    screen: "top-up",
    status: "accepted",
    action_id: actionId,
    amount_minor: amountMinor
  });
});

app.post("/api/v1/ui/withdraw", (req, res) => {
  const validation = validateBodyInit(req, res);
  if (!validation) return;
  const amountMinor = req.body?.amount_minor;
  if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
    sendError(res, 400, "AMOUNT_MINOR_INVALID", "amount_minor must be a positive integer");
    return;
  }
  if (amountMinor < minWithdrawMinor) {
    sendError(res, 400, "WITHDRAW_MIN_AMOUNT", "withdraw amount below configured minimum");
    return;
  }
  const feeMinor = Math.ceil((amountMinor * withdrawFeeBps) / 10000);
  const snapshot = getAccountSnapshot(validation.userId);
  if (amountMinor + feeMinor > snapshot.available_minor) {
    sendError(
      res,
      409,
      "INSUFFICIENT_AVAILABLE_FUNDS",
      "available balance is insufficient for withdraw"
    );
    return;
  }
  const requestId = `wd_${crypto.randomUUID()}`;
  actionStore.set(requestId, {
    action_id: requestId,
    user_id: validation.userId,
    kind: "withdraw",
    status: "on_hold",
    amount_minor: amountMinor,
    fee_minor: feeMinor,
    created_at: new Date().toISOString()
  });
  persistActionStore();
  sendSuccess(res, {
    screen: "withdraw",
    status: "on_hold",
    request_id: requestId,
    amount_minor: amountMinor
  });
});

app.post("/api/v1/ui/confirm", (req, res) => {
  const validation = validateBodyInit(req, res);
  if (!validation) return;
  const actionId = typeof req.body?.action_id === "string" ? req.body.action_id.trim() : "";
  if (!actionId) {
    sendError(res, 400, "ACTION_ID_REQUIRED", "action_id must be a non-empty string");
    return;
  }
  const action = actionStore.get(actionId);
  if (!action || action.user_id !== validation.userId) {
    sendError(res, 404, "ACTION_NOT_FOUND", "action_id was not found");
    return;
  }
  if (action.status === "confirmed") {
    sendError(res, 409, "ACTION_ALREADY_CONFIRMED", "action_id is already confirmed");
    return;
  }
  action.status = "confirmed";
  persistActionStore();
  sendSuccess(res, {
    screen: "confirm",
    action_id: actionId,
    status: "confirmed"
  });
});

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    logEvent(res.locals.traceId ?? crypto.randomUUID(), "request.failed", {
      error: err instanceof Error ? err.message : String(err)
    });
    if (res.headersSent) return;
    sendError(res, 500, "INTERNAL_ERROR", "internal server error");
  }
);

app.listen(port, () => {
  console.log(`backend listening on http://localhost:${port}`);
});
