import type { RequestHandler } from "express";
import * as jose from "jose";
import { config } from "../config.js";
import { getDb } from "../db/connection.js";
import { validateInitData } from "../initData.js";
import { touchUserLastActiveByTg } from "../repos/userRepo.js";

const getKey = () => new TextEncoder().encode(config.jwtSecret);

export async function signAccessToken(userId: string): Promise<string> {
  return new jose
    .SignJWT({ v: 1 })
    .setSubject(userId)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${config.jwtAccessTtlSec}s`)
    .sign(getKey());
}

/**
 * Verifies HS256 access token, optionally cross-checks `X-Telegram-Init-Data` with `sub`.
 * Wrapped for Express (async) compatibility.
 */
export const requireMiniappAuth: RequestHandler = (req, res, next) => {
  void (async () => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      res.status(401).json({ message: "Missing or invalid Authorization header" });
      return;
    }
    const token = auth.slice("Bearer ".length).trim();
    if (!token) {
      res.status(401).json({ message: "Empty bearer token" });
      return;
    }
    let sub: string;
    try {
      const { payload } = await jose.jwtVerify(token, getKey(), { algorithms: ["HS256"] });
      if (!payload.sub || typeof payload.sub !== "string") {
        res.status(401).json({ message: "Invalid token" });
        return;
      }
      sub = payload.sub;
    } catch {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }
    const initH = req.headers["x-telegram-init-data"];
    if (typeof initH === "string" && initH.length > 0) {
      const v = validateInitData(initH);
      if (v.ok && v.userId !== sub) {
        res.status(403).json({ message: "initData user does not match token" });
        return;
      }
      if (!v.ok) {
        res.status(401).json({ message: "Invalid X-Telegram-Init-Data" });
        return;
      }
    }
    req.userId = sub;
    touchUserLastActiveByTg(getDb(), sub);
    next();
  })().catch(next);
};
