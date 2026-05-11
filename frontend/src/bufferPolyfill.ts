/**
 * @ton/core и часть TonConnect ожидают Node-глобалы в браузере.
 * Подключается из index.html ПЕРЕД main.tsx (порядок module-скриптов в DOM).
 */
import { Buffer } from "buffer";

const w = globalThis as typeof globalThis & { Buffer?: typeof Buffer };

if (typeof w.Buffer === "undefined") {
  w.Buffer = Buffer;
}
if (typeof window !== "undefined" && typeof (window as unknown as { Buffer?: typeof Buffer }).Buffer === "undefined") {
  (window as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;
}

const gl = globalThis as unknown as Record<string, unknown>;
if (typeof gl.process === "undefined") {
  gl.process = { env: {} as Record<string, string | undefined> };
}
