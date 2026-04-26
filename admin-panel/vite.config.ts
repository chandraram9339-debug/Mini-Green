import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") }
  },
  // Production hardening: serve admin static via nginx and add a tight Content-Security-Policy
  // (default-src 'self'; script-src 'self'; connect-src 'self' <api origin>) — Vite dev needs relaxed rules here.
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
});
