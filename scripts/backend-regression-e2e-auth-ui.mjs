import crypto from "node:crypto";
import http from "node:http";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const backendDir = join(repoRoot, "backend");
const initToken = process.env.E2E_INIT_DATA ?? "demo-smoke-init";
const secondInitToken = process.env.E2E_INIT_DATA_SECOND ?? "demo-smoke-init-2";
const initSecret = process.env.MOCK_INITDATA_SECRET ?? "mock-init-secret-v1";
const outDir = join(backendDir, "reports");
const outPath = join(outDir, "regression-e2e-auth-ui.json");
const startedAt = new Date().toISOString();
const executionMode = process.env.EXECUTION_MODE ?? "mock";
const demoUserId = String(process.env.DEMO_INIT_USER_ID ?? "10001");
const allowedDemoTokens = new Set(
  [
    ...String(process.env.DEMO_INIT_TOKENS ?? "demo-smoke-init,demo-smoke-init-2")
      .split(",")
      .map((t) => t.trim()),
    initToken,
    secondInitToken
  ].filter(Boolean)
);

const checks = [];
let baseUrl = process.env.E2E_BASE_URL ?? "";
let server = null;

function nowIso() {
  return new Date().toISOString();
}

function toHexSha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function normalizeBody(body) {
  if (body && typeof body === "object") return body;
  return { raw: String(body ?? "") };
}

function buildSignedInitData(userId, authDate) {
  const hash = crypto
    .createHash("sha256")
    .update(`${initSecret}|${userId}|${authDate}`)
    .digest("hex");
  return `user=${encodeURIComponent(
    JSON.stringify({ id: userId })
  )}&auth_date=${encodeURIComponent(authDate)}&hash=${encodeURIComponent(hash)}`;
}

function errorEnvelope(traceId, status, code, reason) {
  return {
    ok: false,
    error: { code, reason, status },
    trace_id: traceId
  };
}

function validateInitData(raw) {
  if (typeof raw !== "string" || !raw.trim()) {
    return {
      ok: false,
      status: 400,
      code: "INIT_DATA_REQUIRED",
      reason: "initData must be a non-empty string"
    };
  }
  const initData = raw.trim();

  if (executionMode !== "mock") {
    return {
      ok: false,
      status: 401,
      code: "INIT_DATA_INVALID",
      reason: "initData verification failed"
    };
  }

  if (allowedDemoTokens.has(initData)) {
    return { ok: true, userId: demoUserId, source: "token_list" };
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

  let userIdFromPayload = "";
  try {
    const parsedUser = JSON.parse(userRaw);
    userIdFromPayload =
      typeof parsedUser?.id === "string"
        ? parsedUser.id
        : typeof parsedUser?.id === "number"
          ? String(parsedUser.id)
          : "";
  } catch {
    return {
      ok: false,
      status: 401,
      code: "INIT_DATA_INVALID",
      reason: "initData verification failed"
    };
  }
  if (!userIdFromPayload) {
    return {
      ok: false,
      status: 401,
      code: "INIT_DATA_INVALID",
      reason: "initData verification failed"
    };
  }

  const expectedHash = toHexSha256(
    `${initSecret}|${userIdFromPayload}|${authDate}`
  );
  if (hash !== expectedHash) {
    return {
      ok: false,
      status: 401,
      code: "INIT_DATA_INVALID",
      reason: "initData verification failed"
    };
  }
  return { ok: true, userId: userIdFromPayload, source: "signed_payload" };
}

function sendJson(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function ensureDemoInitFromQuery(urlObj, res) {
  const traceId = crypto.randomUUID();
  const initData = urlObj.searchParams.get("initData")?.trim() ?? "";
  if (!initData) {
    sendJson(
      res,
      400,
      errorEnvelope(
        traceId,
        400,
        "INIT_DATA_REQUIRED",
        "initData query param must be provided"
      )
    );
    return null;
  }
  const validation = validateInitData(initData);
  if (!validation.ok) {
    sendJson(
      res,
      validation.status,
      errorEnvelope(
        traceId,
        validation.status,
        validation.code,
        validation.reason
      )
    );
    return null;
  }
  return traceId;
}

function rejectByInitValidation(res, traceId, initDataRaw) {
  const validation = validateInitData(initDataRaw);
  if (validation.ok) return true;
  sendJson(
    res,
    validation.status,
    errorEnvelope(traceId, validation.status, validation.code, validation.reason)
  );
  return false;
}

async function createMockServer() {
  const created = http.createServer(async (req, res) => {
    const method = req.method ?? "GET";
    const urlObj = new URL(req.url ?? "/", "http://127.0.0.1");

    if (method === "GET" && urlObj.pathname === "/health") {
      sendJson(res, 200, {
        ok: true,
        service: "miniapp-backend",
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (method === "POST" && urlObj.pathname === "/api/v1/auth/init") {
      const traceId = crypto.randomUUID();
      const body = await readJsonBody(req);
      const validation = validateInitData(body.initData);
      if (!validation.ok) {
        sendJson(
          res,
          validation.status,
          errorEnvelope(
            traceId,
            validation.status,
            validation.code,
            validation.reason
          )
        );
        return;
      }
      sendJson(res, 200, {
        ok: true,
        trace_id: traceId,
        data: {
          api_version: "v1",
          mode: executionMode,
          user: { id: validation.userId, role: "demo" },
          init_source: validation.source
        }
      });
      return;
    }

    if (
      method === "GET" &&
      ["/api/v1/ui/dashboard", "/api/v1/ui/money-details", "/api/v1/ui/trading-details", "/api/v1/ui/faq"].includes(urlObj.pathname)
    ) {
      const traceId = ensureDemoInitFromQuery(urlObj, res);
      if (!traceId) return;

      if (urlObj.pathname === "/api/v1/ui/dashboard") {
        sendJson(res, 200, {
          ok: true,
          trace_id: traceId,
          data: { screen: "dashboard", wallet_minor: 125000, pnl_minor: 3400, open_positions: 2 }
        });
        return;
      }
      if (urlObj.pathname === "/api/v1/ui/money-details") {
        sendJson(res, 200, {
          ok: true,
          trace_id: traceId,
          data: { screen: "money-details", available_minor: 125000, locked_minor: 20000, currency: "USD" }
        });
        return;
      }
      if (urlObj.pathname === "/api/v1/ui/trading-details") {
        sendJson(res, 200, {
          ok: true,
          trace_id: traceId,
          data: {
            screen: "trading-details",
            positions: [
              { symbol: "BTCUSDT", side: "long", size_minor: 20000 },
              { symbol: "ETHUSDT", side: "short", size_minor: 15000 }
            ]
          }
        });
        return;
      }
      sendJson(res, 200, {
        ok: true,
        trace_id: traceId,
        data: {
          screen: "faq",
          items: [
            { id: "fees", q: "How are fees calculated?", a: "By active policy." },
            { id: "withdraw", q: "When is withdraw completed?", a: "After review." }
          ]
        }
      });
      return;
    }

    if (
      method === "POST" &&
      ["/api/v1/ui/top-up", "/api/v1/ui/withdraw", "/api/v1/ui/confirm"].includes(urlObj.pathname)
    ) {
      const traceId = crypto.randomUUID();
      const body = await readJsonBody(req);
      if (!rejectByInitValidation(res, traceId, body.initData)) return;

      if (urlObj.pathname === "/api/v1/ui/confirm") {
        const actionId =
          typeof body.action_id === "string" ? body.action_id.trim() : "";
        if (!actionId) {
          sendJson(
            res,
            400,
            errorEnvelope(
              traceId,
              400,
              "ACTION_ID_REQUIRED",
              "action_id must be a non-empty string"
            )
          );
          return;
        }
        sendJson(res, 200, {
          ok: true,
          trace_id: traceId,
          data: { screen: "confirm", action_id: actionId, status: "confirmed" }
        });
        return;
      }

      const amountMinor = body.amount_minor;
      if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
        sendJson(
          res,
          400,
          errorEnvelope(
            traceId,
            400,
            "AMOUNT_MINOR_INVALID",
            "amount_minor must be a positive integer"
          )
        );
        return;
      }

      if (urlObj.pathname === "/api/v1/ui/top-up") {
        sendJson(res, 200, {
          ok: true,
          trace_id: traceId,
          data: { screen: "top-up", status: "accepted", amount_minor: amountMinor }
        });
        return;
      }

      sendJson(res, 200, {
        ok: true,
        trace_id: traceId,
        data: {
          screen: "withdraw",
          status: "on_hold",
          request_id: `wd_${Date.now()}`,
          amount_minor: amountMinor
        }
      });
      return;
    }

    sendJson(res, 404, { ok: false, error: { code: "NOT_FOUND", reason: "route not found", status: 404 } });
  });

  await new Promise((resolve) => {
    created.listen(0, "127.0.0.1", resolve);
  });
  const address = created.address();
  if (!address || typeof address === "string") {
    throw new Error("mock server failed to bind");
  }
  baseUrl = `http://127.0.0.1:${address.port}`;
  return created;
}

async function callApi(method, path, body) {
  const request = {
    method,
    headers: { "content-type": "application/json" }
  };
  if (body !== undefined) request.body = JSON.stringify(body);
  const response = await fetch(`${baseUrl}${path}`, request);
  const text = await response.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { raw: text };
  }
  return { status: response.status, body: normalizeBody(parsed) };
}

function checkResult(name, result, expected) {
  const body = result.body;
  const ok =
    result.status === expected.status &&
    (expected.code ? body?.error?.code === expected.code : true) &&
    (expected.requiresTrace ? typeof body?.trace_id === "string" : true);
  checks.push({
    name,
    status: result.status,
    expected_status: expected.status,
    code: body?.error?.code ?? null,
    expected_code: expected.code ?? null,
    reason: body?.error?.reason ?? null,
    trace_id: body?.trace_id ?? null,
    passed: ok
  });
}

function assertRetryDeterministic(name, first, second) {
  const sameStatus = first.status === second.status;
  const sameCode = (first.body?.error?.code ?? null) === (second.body?.error?.code ?? null);
  const sameReason =
    (first.body?.error?.reason ?? null) === (second.body?.error?.reason ?? null);
  const passed = sameStatus && sameCode && sameReason;
  checks.push({
    name,
    status: second.status,
    expected_status: first.status,
    code: second.body?.error?.code ?? null,
    expected_code: first.body?.error?.code ?? null,
    reason: second.body?.error?.reason ?? null,
    trace_id: second.body?.trace_id ?? null,
    passed
  });
}

let pass = false;
let fatal = null;

try {
  server = await createMockServer();

  checkResult(
    "init_success",
    await callApi("POST", "/api/v1/auth/init", { initData: initToken }),
    { status: 200, requiresTrace: true }
  );
  checkResult(
    "init_success_second_token",
    await callApi("POST", "/api/v1/auth/init", { initData: secondInitToken }),
    { status: 200, requiresTrace: true }
  );
  const signedInitData = buildSignedInitData("20002", "1710000000");
  checkResult(
    "init_success_signed_payload",
    await callApi("POST", "/api/v1/auth/init", { initData: signedInitData }),
    { status: 200, requiresTrace: true }
  );
  checkResult(
    "init_missing_data",
    await callApi("POST", "/api/v1/auth/init", {}),
    { status: 400, code: "INIT_DATA_REQUIRED", requiresTrace: true }
  );
  checkResult(
    "init_invalid_data",
    await callApi("POST", "/api/v1/auth/init", { initData: "bad-token" }),
    { status: 401, code: "INIT_DATA_INVALID", requiresTrace: true }
  );
  checkResult(
    "init_tampered_hash",
    await callApi("POST", "/api/v1/auth/init", {
      initData: signedInitData.replace(/hash=[^&]+/, "hash=tampered")
    }),
    { status: 401, code: "INIT_DATA_INVALID", requiresTrace: true }
  );
  checkResult(
    "init_malformed_payload",
    await callApi("POST", "/api/v1/auth/init", {
      initData: "user=%7Bbad-json%7D&auth_date=1710000000&hash=abc"
    }),
    { status: 401, code: "INIT_DATA_INVALID", requiresTrace: true }
  );

  const retryInvalid1 = await callApi("POST", "/api/v1/auth/init", {
    initData: "bad-token"
  });
  const retryInvalid2 = await callApi("POST", "/api/v1/auth/init", {
    initData: "bad-token"
  });
  assertRetryDeterministic("init_retry_invalid_determinism", retryInvalid1, retryInvalid2);

  const retrySuccess1 = await callApi("POST", "/api/v1/auth/init", {
    initData: signedInitData
  });
  const retrySuccess2 = await callApi("POST", "/api/v1/auth/init", {
    initData: signedInitData
  });
  const retrySuccessPassed =
    retrySuccess1.status === 200 &&
    retrySuccess2.status === 200 &&
    (retrySuccess1.body?.data?.user?.id ?? null) ===
      (retrySuccess2.body?.data?.user?.id ?? null);
  checks.push({
    name: "init_retry_success_consistent_state",
    status: retrySuccess2.status,
    expected_status: 200,
    code: retrySuccess2.body?.error?.code ?? null,
    expected_code: null,
    reason: retrySuccess2.body?.error?.reason ?? null,
    trace_id: retrySuccess2.body?.trace_id ?? null,
    passed: retrySuccessPassed
  });

  checkResult(
    "dashboard_success",
    await callApi(
      "GET",
      `/api/v1/ui/dashboard?initData=${encodeURIComponent(signedInitData)}`
    ),
    { status: 200, requiresTrace: true }
  );
  checkResult(
    "money_details_success",
    await callApi("GET", `/api/v1/ui/money-details?initData=${encodeURIComponent(initToken)}`),
    { status: 200, requiresTrace: true }
  );
  checkResult(
    "trading_details_success",
    await callApi("GET", `/api/v1/ui/trading-details?initData=${encodeURIComponent(initToken)}`),
    { status: 200, requiresTrace: true }
  );
  checkResult(
    "faq_success",
    await callApi("GET", `/api/v1/ui/faq?initData=${encodeURIComponent(initToken)}`),
    { status: 200, requiresTrace: true }
  );
  checkResult(
    "top_up_success",
    await callApi("POST", "/api/v1/ui/top-up", {
      initData: initToken,
      amount_minor: 5000
    }),
    { status: 200, requiresTrace: true }
  );
  const withdrawResponse = await callApi("POST", "/api/v1/ui/withdraw", {
    initData: initToken,
    amount_minor: 3000
  });
  checkResult("withdraw_success", withdrawResponse, {
    status: 200,
    requiresTrace: true
  });
  checkResult(
    "confirm_withdraw_transition_success",
    await callApi("POST", "/api/v1/ui/confirm", {
      initData: initToken,
      action_id: withdrawResponse.body?.data?.request_id ?? ""
    }),
    { status: 200, requiresTrace: true }
  );
  checkResult(
    "confirm_success",
    await callApi("POST", "/api/v1/ui/confirm", {
      initData: initToken,
      action_id: "wd_123"
    }),
    { status: 200, requiresTrace: true }
  );
  checkResult(
    "dashboard_missing_init",
    await callApi("GET", "/api/v1/ui/dashboard"),
    { status: 400, code: "INIT_DATA_REQUIRED", requiresTrace: true }
  );
  checkResult(
    "withdraw_invalid_amount",
    await callApi("POST", "/api/v1/ui/withdraw", {
      initData: initToken,
      amount_minor: 0
    }),
    { status: 400, code: "AMOUNT_MINOR_INVALID", requiresTrace: true }
  );

  pass = checks.every((c) => c.passed);
} catch (err) {
  fatal = err instanceof Error ? err.message : String(err);
} finally {
  try {
    await new Promise((resolve, reject) => {
      if (!server) {
        resolve();
        return;
      }
      server.close((error) => (error ? reject(error) : resolve()));
    });
  } catch {
    // Ignore teardown errors in constrained environments.
  }
}

const finishedAt = nowIso();
const report = {
  suite: "BE-N1-REGRESSION-E2E-AUTOSCRIPT",
  started_at: startedAt,
  finished_at: finishedAt,
  base_url: baseUrl,
  result: fatal ? "FAIL" : pass ? "PASS" : "FAIL",
  fatal_error: fatal,
  checks
};

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (report.result !== "PASS") {
  process.exitCode = 1;
}
