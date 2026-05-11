#!/usr/bin/env node
/**
 * Один вход: bootstrap → свободный порт API + Vite → прокси и backend на одном порту → concurrently.
 */
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function portFree(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once("error", () => resolve(false));
    srv.listen(port, "127.0.0.1", () => {
      srv.close(() => resolve(true));
    });
  });
}

async function pickPort() {
  for (let p = 47400; p < 47650; p++) {
    if (await portFree(p)) return p;
  }
  throw new Error("Нет свободного TCP-порта 47400–47649 на 127.0.0.1");
}

/** Первый свободный порт для Express (иначе backend уезжает на 4002, а Vite остаётся на 4000 из .env). */
async function pickApiPort() {
  for (let p = 4000; p < 4060; p++) {
    if (await portFree(p)) return p;
  }
  throw new Error("Нет свободного TCP-порта 4000–4059 на 127.0.0.1");
}

function setFrontendDevApiTarget(apiPort) {
  const envPath = path.join(root, "frontend", ".env");
  if (!fs.existsSync(envPath)) return;
  let s = fs.readFileSync(envPath, "utf8");
  const line = `VITE_DEV_API_TARGET=http://127.0.0.1:${apiPort}`;
  if (/^\s*VITE_DEV_API_TARGET=/m.test(s)) {
    s = s.replace(/^\s*VITE_DEV_API_TARGET=.*$/m, line);
  } else {
    s = `${s.replace(/\s+$/, "")}\n\n# run-dev-miniapp: порт API = порт бэкенда в этой сессии\n${line}\n`;
  }
  fs.writeFileSync(envPath, s, "utf8");
}

function runBootstrap() {
  const r = spawnSync(process.execPath, [path.join(root, "scripts", "dev-bootstrap.mjs")], {
    cwd: root,
    stdio: "inherit",
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const concurrentlyBin = path.join(root, "node_modules", ".bin", "concurrently");

async function main() {
  runBootstrap();
  const apiPort = await pickApiPort();
  setFrontendDevApiTarget(apiPort);

  const port = await pickPort();
  process.env.MINIAPP_VITE_PORT = String(port);

  const base = `http://127.0.0.1:${port}`;
  const home = `${base}/home`;
  const topup = `${base}/deposit/top-up`;

  console.log("\n\x1b[32m╔══════════════════════════════════════════════════════════╗\x1b[0m");
  console.log("\x1b[32m║  ОТКРОЙТЕ В БРАУЗЕРЕ (скопируйте целиком):                  ║\x1b[0m");
  console.log("\x1b[32m╠══════════════════════════════════════════════════════════╣\x1b[0m");
  console.log(`\x1b[32m║\x1b[0m  ${home.padEnd(56)}\x1b[32m║\x1b[0m`);
  console.log("\x1b[32m╠══════════════════════════════════════════════════════════╣\x1b[0m");
  console.log(`\x1b[32m║\x1b[0m  пополнение: ${topup.padEnd(47)}\x1b[32m║\x1b[0m`);
  console.log("\x1b[32m╚══════════════════════════════════════════════════════════╝\x1b[0m");
  console.log(
    `\n\x1b[33mAPI (прокси Vite → backend): http://127.0.0.1:${apiPort}\x1b[0m (должен совпадать с «backend listening on …» ниже)`,
  );
  console.log(
    "\nСервер слушает только пока идёт этот процесс. Закрыли терминал — ссылка перестанет открываться (ERR_CONNECTION_REFUSED).",
  );
  console.log(
    "Открывайте только URL из рамки выше (с портом). `http://127.0.0.1/` без порта не работает.\n",
  );
  console.log(
    "Дождитесь в логе frontend строки вроде `Local: http://127.0.0.1:…` — потом обновите вкладку.\n",
  );

  if (process.platform === "linux" && process.env.MINIAPP_NO_OPEN !== "1") {
    setTimeout(() => {
      spawn("xdg-open", [home], { detached: true, stdio: "ignore" });
    }, 1200);
  }

  const child = spawn(
    concurrentlyBin,
    [
      "-k",
      "false",
      "-n",
      "backend,frontend",
      "-c",
      "blue,green",
      "pnpm --filter miniapp-backend dev",
      "pnpm --filter miniapp-frontend dev",
    ],
    {
      cwd: root,
      stdio: "inherit",
      env: {
        ...process.env,
        MINIAPP_VITE_PORT: String(port),
        PORT: String(apiPort),
        PORT_AUTO_FALLBACK: "0",
        VITE_DEV_API_TARGET: `http://127.0.0.1:${apiPort}`,
      },
    },
  );

  child.on("exit", (code) => process.exit(code ?? 0));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
