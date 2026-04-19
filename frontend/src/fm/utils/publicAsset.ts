/** Ссылки на файлы из `public/` с учётом `base` из Vite (деплой не в корень домена). */
export function publicAsset(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  const clean = path.startsWith("/") ? path.slice(1) : path;
  return `${base}${clean}`;
}
