import type { ReactNode } from "react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

function defaultManifestUrl(): string {
  const fromEnv = import.meta.env.VITE_TONCONNECT_MANIFEST_URL?.trim();
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return `${window.location.origin}/tonconnect-manifest.json`;
  return "/tonconnect-manifest.json";
}

/** Wraps the mini-app so TON Connect modals work on top-up screens. */
export function TonConnectAppRoot({ children }: { children: ReactNode }) {
  return <TonConnectUIProvider manifestUrl={defaultManifestUrl()}>{children}</TonConnectUIProvider>;
}
