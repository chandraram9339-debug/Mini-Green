const base = () => import.meta.env.VITE_API_BASE ?? "";

export function getAdminKey() {
  return sessionStorage.getItem("adminKey") ?? "";
}

export function setAdminKey(k: string) {
  sessionStorage.setItem("adminKey", k);
}

export function clearAdminKey() {
  sessionStorage.removeItem("adminKey");
}

export async function api(path: string, init: RequestInit = {}) {
  const key = getAdminKey();
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (key) headers.set("X-Admin-Key", key);
  const r = await fetch(`${base()}${path}`, { ...init, headers });
  return r;
}

export async function apiJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const r = await api(path, init);
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || r.statusText);
  }
  return r.json() as Promise<T>;
}
