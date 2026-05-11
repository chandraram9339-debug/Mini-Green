import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Пути бэкенда (Express), не фронтовые ассеты — всё уходит на VITE_DEV_API_TARGET. */
const BACKEND_PROXY_PREFIXES = [
  "/auth",
  "/wallet",
  "/ui",
  "/notifications",
  "/trading",
  "/withdrawals",
  "/health",
  "/hooks",
  "/admin",
  "/api",
] as const;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  /** Задаётся только `scripts/run-dev-miniapp.mjs` — свободный порт + strictPort, без угадывания. */
  const fromLauncher = Number(process.env.MINIAPP_VITE_PORT);
  const devPort =
    Number.isFinite(fromLauncher) && fromLauncher > 0 ? fromLauncher : 47400;
  const strictDevPort = Number.isFinite(fromLauncher) && fromLauncher > 0;

  /** Лаунчер задаёт `VITE_DEV_API_TARGET` в process.env, чтобы совпадал с реальным PORT бэкенда (иначе прокси на 4000, а API на 4002 → «чёрный экран»). */
  const devApiTarget =
    (process.env.VITE_DEV_API_TARGET ?? "").trim() || env.VITE_DEV_API_TARGET || "http://127.0.0.1:4000";
  const target = devApiTarget.replace(/\/$/, "");
  const apiBaseEmpty = !env.VITE_API_BASE_URL?.trim();
  /** Пустой `VITE_API_BASE_URL` в dev → запросы на тот же origin, Vite проксирует на `target`. Отключить: `VITE_DEV_USE_VITE_PROXY=false`. */
  const useDevProxy =
    mode === "development" && apiBaseEmpty && env.VITE_DEV_USE_VITE_PROXY !== "false";

  const proxy: Record<string, { target: string; changeOrigin: boolean }> = {};
  if (useDevProxy) {
    for (const p of BACKEND_PROXY_PREFIXES) {
      proxy[p] = { target, changeOrigin: true };
    }
  }

  return {
    define: {
      global: "globalThis",
    },
    resolve: {
      alias: {
        buffer: "buffer",
      },
    },
    optimizeDeps: {
      include: ["buffer"],
      esbuildOptions: {
        define: {
          global: "globalThis",
        },
      },
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    plugins: [
      nodePolyfills({
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
        protocolImports: true,
      }),
      react(),
    ],
    server: {
      host: "127.0.0.1",
      port: devPort,
      strictPort: strictDevPort,
      open: "/balance/deposit",
      proxy: useDevProxy ? proxy : undefined,
    },
    preview: {
      host: "127.0.0.1",
      port: devPort,
      strictPort: strictDevPort,
      proxy: useDevProxy ? proxy : undefined,
    },
  };
});
