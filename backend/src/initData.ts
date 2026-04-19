import crypto from "node:crypto";
import { config } from "./config.js";

export type InitSource = "demo-token" | "signed-payload" | "telegram";
export type InitValidation =
  | { ok: true; userId: string; source: InitSource }
  | { ok: false; status: 400 | 401 | 500; code: string; reason: string };

function sha256Hex(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function validateInitData(initDataRaw: unknown): InitValidation {
  if (typeof initDataRaw !== "string" || !initDataRaw.trim()) {
    return {
      ok: false,
      status: 400,
      code: "INIT_DATA_REQUIRED",
      reason: "initData must be a non-empty string"
    };
  }
  const initData = initDataRaw.trim();
  const { authProviderMode, telegramBotToken, initSignatureMaxAgeSec, initSignatureSecret } = config;
  const { allowedDemoTokens, demoUserId } = config;

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
