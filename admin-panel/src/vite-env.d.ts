/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  /** Build-time only; sets Vite `base` (see vite.config.ts). */
  readonly VITE_ADMIN_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
