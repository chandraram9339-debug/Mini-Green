import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 4297,
    /** Если порт занят (например старым Vite от Cursor), берём следующий свободный. */
    strictPort: false,
    open: "/balance/deposit"
  }
});
