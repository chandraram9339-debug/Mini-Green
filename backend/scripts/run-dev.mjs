#!/usr/bin/env node
/**
 * Запуск dev с тем же node, что и этот процесс: в PATH первым стоит каталог execPath.
 * Иначе tsx/node-gyp могут видеть другой Node (например /usr/bin/node ABI 108 при nvm 109).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { execPath, versions } from "node:process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(__dirname, "..");
const nodeBin = path.dirname(execPath);

const req = createRequire(path.join(backendRoot, "package.json"));
const tsxRoot = path.dirname(req.resolve("tsx/package.json"));
const cliCandidates = [
  path.join(tsxRoot, "dist", "cli.mjs"),
  path.join(tsxRoot, "dist", "cli.cjs"),
  path.join(tsxRoot, "dist", "cli.js"),
];
const tsxCli = cliCandidates.find((p) => fs.existsSync(p));
if (!tsxCli) {
  console.error("[run-dev] tsx CLI not found under", tsxRoot);
  process.exit(1);
}

/** Ранний dlopen: иначе tsx падает с длинным стеком; часто после `pnpm install` из Cursor (Node 22) vs терминал (Node 18). */
try {
  createRequire(path.join(backendRoot, "package.json"))("better-sqlite3");
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  const code = typeof e === "object" && e !== null && "code" in e ? String(/** @type {{ code?: unknown }} */ (e).code) : "";
  if (code === "ERR_DLOPEN_FAILED" || msg.includes("NODE_MODULE_VERSION")) {
    console.error(`
[run-dev] better-sqlite3 не подходит к этому Node: ${versions.node} (NODE_MODULE_VERSION=${versions.modules})
execPath: ${execPath}

Чаще всего: \`pnpm install\` из Cursor пересобрал нативный модуль под Node IDE, а здесь — системный/nvm Node.

Исправление (в том же терминале, откуда запускаете dev — проверьте \`which node\`):
  cd "${path.join(backendRoot, "..")}"
  pnpm rebuild:backend-native
`);
    process.exit(1);
  }
  throw e;
}

const pathEnv = process.env.PATH ?? "";
const prefix = `${nodeBin}${path.delimiter}`;
const env = {
  ...process.env,
  PATH: pathEnv.startsWith(prefix) ? pathEnv : prefix + pathEnv,
};

const r = spawnSync(execPath, [tsxCli, "watch", "src/index.ts"], {
  cwd: backendRoot,
  stdio: "inherit",
  env,
});

process.exit(r.status === 0 ? 0 : (r.status ?? 1));
