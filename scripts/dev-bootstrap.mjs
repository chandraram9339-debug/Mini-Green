#!/usr/bin/env node
/**
 * Перед dev: .env из примеров (если нет) + правка frontend/.env под Vite-прокси без ручных правок.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function copyEnvIfMissing(relDir) {
  const dir = path.join(root, relDir);
  const envPath = path.join(dir, ".env");
  const examplePath = path.join(dir, ".env.example");
  if (fs.existsSync(envPath) || !fs.existsSync(examplePath)) return;
  fs.copyFileSync(examplePath, envPath);
  console.log(`[dev-bootstrap] created ${relDir}/.env from .env.example`);
}

/** Порт из backend/.env (PORT=), иначе 4000. */
function readBackendListenPort() {
  const p = path.join(root, "backend", ".env");
  if (!fs.existsSync(p)) return "4000";
  const text = fs.readFileSync(p, "utf8");
  const m = text.match(/^\s*PORT=(\d+)\s*$/m);
  return m && m[1] ? m[1] : "4000";
}

/**
 * Миграция: VITE_API_BASE_URL=http://127.0.0.1:4000 | http://localhost:4000
 * → пустой base + VITE_DEV_API_TARGET (Vite proxy в vite.config.ts).
 * Добавляет VITE_DEV_API_TARGET, если его нет и API не указывает на «чужой» хост.
 */
function patchFrontendEnv() {
  const envPath = path.join(root, "frontend", ".env");
  if (!fs.existsSync(envPath)) return;

  const backendPort = readBackendListenPort();
  const defaultTarget = `http://127.0.0.1:${backendPort}`;

  let s = fs.readFileSync(envPath, "utf8");
  const original = s;

  const hadLocalApiBase =
    /^\s*VITE_API_BASE_URL=\s*https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\/?\s*$/m.test(s);

  if (hadLocalApiBase) {
    s = s.replace(/^\s*VITE_DEV_API_TARGET=.*\r?\n?/gm, "");
  }

  s = s.replace(
    /^(\s*)VITE_API_BASE_URL=\s*(https?:\/\/(?:127\.0\.0\.1|localhost)(?::(\d+))?)\/?\s*$/gim,
    (_, indent, _full, port) => {
      const p = port && /^\d+$/.test(String(port)) ? String(port) : backendPort;
      return `${indent}VITE_API_BASE_URL=\n${indent}VITE_DEV_API_TARGET=http://127.0.0.1:${p}`;
    },
  );

  const hasRemoteApiBase =
    /^\s*VITE_API_BASE_URL=\s*https?:\/\//m.test(s) &&
    !/^\s*VITE_API_BASE_URL=\s*https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\/?\s*$/m.test(s);

  if (!/^\s*VITE_DEV_API_TARGET=/m.test(s) && !hasRemoteApiBase) {
    s = s.replace(/\s+$/, "");
    s += `\n\n# dev-bootstrap: Vite → backend (см. frontend/vite.config.ts)\nVITE_DEV_API_TARGET=${defaultTarget}\n`;
  }

  const tm = s.match(/^\s*VITE_DEV_API_TARGET=http:\/\/127\.0\.0\.1:(\d+)\s*$/m);
  if (tm && tm[1] !== backendPort) {
    s = s.replace(/^(\s*VITE_DEV_API_TARGET=).+$/m, `$1http://127.0.0.1:${backendPort}`);
  }

  if (s !== original) {
    fs.writeFileSync(envPath, s, "utf8");
    console.log("[dev-bootstrap] updated frontend/.env (Vite proxy / VITE_DEV_API_TARGET)");
  }
}

copyEnvIfMissing("backend");
copyEnvIfMissing("frontend");
patchFrontendEnv();
