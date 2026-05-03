import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

/** Vite `base`: always `/` or `/segment/…/` (trailing slash). */
function publicBase(viteAdminBase: string | undefined): string {
  const s = viteAdminBase?.trim();
  if (!s || s === "/") return "/";
  const head = s.startsWith("/") ? s : `/${s}`;
  return head.endsWith("/") ? head : `${head}/`;
}

/**
 * VITE_ADMIN_BASE — public path for static assets (e.g. `/admin-ui/` when UI is under a subpath).
 * VITE_API_BASE — optional; fetch prefix when API is on another origin (see src/api.ts).
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: publicBase(env.VITE_ADMIN_BASE),
    plugins: [react()],
    resolve: {
      alias: { "@": path.resolve(__dirname, "src") }
    },
    server: {
      port: 5180,
      strictPort: true,
      proxy: {
        "/admin": { target: "http://127.0.0.1:4000", changeOrigin: true },
        "/health": { target: "http://127.0.0.1:4000", changeOrigin: true }
      }
    },
    preview: {
      port: 5180,
      strictPort: true,
      proxy: {
        "/admin": { target: "http://127.0.0.1:4000", changeOrigin: true },
        "/health": { target: "http://127.0.0.1:4000", changeOrigin: true }
      }
    }
  };
});
