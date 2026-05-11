#!/usr/bin/env node
/**
 * Пересборка better-sqlite3 строго под **тот же** Node, что запускает этот скрипт:
 * - npm_config_build_from_source — без чужих prebuild-бинарников (108 vs 109 и т.д.);
 * - npm_config_nodedir — заголовки именно этого Node (иначе gyp иногда собирает «не тот» ABI);
 * - удаляем каталог build, чтобы не подхватить старый .node из кэша/pnpm.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { execPath, versions } from "node:process";

/** Cursor/VS Code часто запускают lifecycle через встроенный Node (другой ABI), чем `pnpm dev` в обычном терминале. */
function isLikelyIdeBundledNode(p = execPath) {
  const n = (p || "").replace(/\\/g, "/");
  const l = n.toLowerCase();
  return (
    l.includes("/cursor/resources/") ||
    l.includes("/cursor/resources/app/") ||
    (l.includes("code") && l.includes("/resources/app/") && l.includes("helpers/node"))
  );
}

const isPostinstall = process.env.npm_lifecycle_event === "postinstall";
if (isPostinstall && isLikelyIdeBundledNode()) {
  console.warn(
    "[rebuild-sqlite] postinstall пропущен: обнаружен Node из IDE (другой NODE_MODULE_VERSION, чем у системного терминала).",
  );
  console.warn(
    "[rebuild-sqlite] Один раз в обычном терминале (где `pnpm dev:miniapp`):  pnpm rebuild:backend-native",
  );
  process.exit(0);
}

/** Чтобы node-gyp / make вызывали тот же `node`, что и этот скрипт (иначе другой ABI). */
function pathWithPreferredNodeBin() {
  const nodeBin = path.dirname(execPath);
  const pathEnv = process.env.PATH ?? "";
  const prefix = `${nodeBin}${path.delimiter}`;
  if (pathEnv.startsWith(prefix)) return pathEnv;
  return prefix + pathEnv;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

/** Каталог установки Node с include/node/node_version.h (nvm, tarball, многие Linux/macOS). */
function resolveNodedir() {
  const binDir = path.dirname(execPath);
  const candidates = [path.dirname(binDir), binDir];
  for (const c of candidates) {
    const h = path.join(c, "include/node/node_version.h");
    if (fs.existsSync(h)) return c;
  }
  return "";
}

function sqlitePackageRoot() {
  const req = createRequire(path.join(root, "backend/package.json"));
  return path.dirname(req.resolve("better-sqlite3/package.json"));
}

const sqliteRoot = sqlitePackageRoot();
const buildDir = path.join(sqliteRoot, "build");
if (fs.existsSync(buildDir)) {
  fs.rmSync(buildDir, { recursive: true, force: true });
  console.log("[rebuild-sqlite] removed", buildDir);
}

const nodedir = resolveNodedir();
/** На проде без `build-essential` нужен prebuild-бинарник, а не сборка из исходников. Сборка из исходников — только с `FORCE_SQLITE_FROM_SOURCE=1` (или уже выставленным npm_config). */
const forceFromSource =
  process.env.FORCE_SQLITE_FROM_SOURCE === "1" ||
  process.env.npm_config_build_from_source === "true";

console.log(
  `[rebuild-sqlite] Node ${versions.node} NODE_MODULE_VERSION=${versions.modules} execPath=${execPath}`,
);
console.log(`[rebuild-sqlite] npm_config_nodedir=${nodedir || "(не задан — node-gyp по умолчанию)"}`);
console.log(
  forceFromSource
    ? "[rebuild-sqlite] режим: сборка из исходников (FORCE_SQLITE_FROM_SOURCE / npm_config_build_from_source)"
    : "[rebuild-sqlite] режим: prebuild (без make); для from-source: FORCE_SQLITE_FROM_SOURCE=1 pnpm rebuild better-sqlite3 --filter miniapp-backend",
);

const env = {
  ...process.env,
  PATH: pathWithPreferredNodeBin(),
};
if (forceFromSource) {
  env.npm_config_build_from_source = "true";
}
if (nodedir) env.npm_config_nodedir = nodedir;

const r = spawnSync(
  "pnpm",
  ["rebuild", "better-sqlite3", "--filter", "miniapp-backend"],
  {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
    env,
  },
);

if (r.error) {
  console.error(r.error);
  process.exit(1);
}
process.exit(r.status === 0 ? 0 : (r.status ?? 1));
