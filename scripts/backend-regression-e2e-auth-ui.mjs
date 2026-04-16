import { spawn } from "node:child_process";
import crypto from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const backendDir = join(repoRoot, "backend");
const baseUrl = process.env.E2E_BASE_URL ?? "http://127.0.0.1:4000";
const initToken = process.env.E2E_INIT_DATA ?? "demo-smoke-init";
const secondInitToken = process.env.E2E_INIT_DATA_SECOND ?? "demo-smoke-init-2";
const initSecret = process.env.MOCK_INITDATA_SECRET ?? "mock-init-secret-v1";
const outDir = join(backendDir, "reports");
const outPath = join(outDir, "regression-e2e-auth-ui.json");
const startedAt = new Date().toISOString();

const checks = [];

function nowIso() {
  return new Date().toISOString();
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

async function waitForHealth(maxMs = 15000) {
  const started = Date.now();
  while (Date.now() - started < maxMs) {
    try {
      const res = await fetch(`${baseUrl}/health`);
      if (res.ok) return true;
    } catch {
      // wait and retry
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

const backendProc = spawn("pnpm", ["--dir", "backend", "dev"], {
  cwd: repoRoot,
  stdio: "ignore",
  env: {
    ...process.env,
    EXECUTION_MODE: process.env.EXECUTION_MODE ?? "mock"
  }
});

let pass = false;
let fatal = null;

try {
  const healthy = await waitForHealth();
  if (!healthy) {
    throw new Error("backend did not become healthy in time");
  }

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
    if (backendProc.pid) {
      backendProc.kill("SIGTERM");
    }
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
