import type express from "express";
import { config } from "./config.js";

export function logEvent(traceId: string, event: string, details: Record<string, unknown> = {}) {
  if (!config.enableOpsLogs) return;
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

export function getTraceId(res: express.Response) {
  const traceCandidate = (res.locals as { traceId?: unknown } | undefined)?.traceId;
  return typeof traceCandidate === "string" && traceCandidate ? traceCandidate : "trace_unavailable";
}

export function sendError(res: express.Response, status: number, code: string, reason: string) {
  res.status(status).json({
    ok: false,
    trace_id: getTraceId(res),
    error: { code, reason, status }
  });
}

export function sendSuccess(res: express.Response, data: Record<string, unknown>) {
  res.json({
    ok: true,
    trace_id: getTraceId(res),
    data
  });
}
