#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="${PROJECT_ROOT:-$HOME/miniapp}"
BRANCH="${BRANCH:-$(git -C "$PROJECT_ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo main)}"
PM2_APP_NAME="${PM2_APP_NAME:-miniapp-backend}"
# Рабочая production-схема: nginx отдаёт фронт из /var/www/palladium-miniapp.
# При необходимости путь можно переопределить через окружение.
#   FRONTEND_PUBLISH_DIR=/custom/path ./deploy/update-server.sh
FRONTEND_PUBLISH_DIR="${FRONTEND_PUBLISH_DIR:-/var/www/palladium-miniapp}"
# Админ-панель публикуется в /var/www/miniapp-admin по умолчанию.
# Чтобы отключить деплой админки: ADMIN_PUBLISH_DIR="" ./deploy/update-server.sh
ADMIN_PUBLISH_DIR="${ADMIN_PUBLISH_DIR:-/var/www/miniapp-admin}"

echo "== Update server =="
echo "project_root=$PROJECT_ROOT"
echo "branch=$BRANCH"
echo "pm2_app=$PM2_APP_NAME"
if [[ -n "$FRONTEND_PUBLISH_DIR" ]]; then
  echo "frontend_publish_dir=$FRONTEND_PUBLISH_DIR"
fi
if [[ -n "$ADMIN_PUBLISH_DIR" ]]; then
  echo "admin_publish_dir=$ADMIN_PUBLISH_DIR"
fi

cd "$PROJECT_ROOT"

echo
echo "== Git pull =="
git fetch origin "$BRANCH"
git pull --ff-only origin "$BRANCH"
echo "commit=$(git rev-parse HEAD)"

echo
echo "== Build backend =="
if [[ -f "$PROJECT_ROOT/package.json" ]]; then
  corepack enable >/dev/null 2>&1 || true
  corepack prepare pnpm@10.33.0 --activate >/dev/null 2>&1 || true
  pnpm install
  pnpm --filter miniapp-backend build
  pnpm --filter miniapp-frontend build
  pnpm --filter admin-panel build
  echo
  echo "== Frontend dist (index.html) =="
  ls -la "$PROJECT_ROOT/frontend/dist/index.html" || true
  echo "== Admin-panel dist (index.html) =="
  ls -la "$PROJECT_ROOT/admin-panel/dist/index.html" || true
else
  echo "Workspace package.json not found, using per-package install/build"
  (cd backend && npm install && npm run build)
  (cd frontend && npm install && npm run build)
  (cd admin-panel && npm install && npm run build)
fi

if [[ -n "$FRONTEND_PUBLISH_DIR" ]]; then
  echo
  echo "== Publish frontend -> $FRONTEND_PUBLISH_DIR =="
  mkdir -p "$FRONTEND_PUBLISH_DIR"
  rsync -a --delete "$PROJECT_ROOT/frontend/dist/" "$FRONTEND_PUBLISH_DIR/"
  echo "rsync: OK ($PROJECT_ROOT/frontend/dist/ -> $FRONTEND_PUBLISH_DIR/)"
fi

if [[ -n "$ADMIN_PUBLISH_DIR" ]]; then
  echo
  echo "== Publish admin-panel -> $ADMIN_PUBLISH_DIR =="
  mkdir -p "$ADMIN_PUBLISH_DIR"
  rsync -a --delete "$PROJECT_ROOT/admin-panel/dist/" "$ADMIN_PUBLISH_DIR/"
  echo "rsync: OK ($PROJECT_ROOT/admin-panel/dist/ -> $ADMIN_PUBLISH_DIR/)"
fi

echo
echo "== Restart backend =="
pm2 restart "$PM2_APP_NAME"
pm2 save

echo
echo "== Patch nginx: ensure index.html is never cached =="
NGINX_CONF="/etc/nginx/sites-enabled/miniapp"
if [[ -f "$NGINX_CONF" ]] && ! grep -q 'location = /index.html' "$NGINX_CONF"; then
  sed -i 's|  location / {|  location = /index.html {\n    expires -1;\n    add_header Cache-Control "no-store, no-cache, must-revalidate";\n    try_files /index.html =404;\n  }\n\n  location / {|' "$NGINX_CONF"
  echo "nginx: index.html no-cache block added"
else
  echo "nginx: index.html no-cache already present"
fi

echo
echo "== Reload nginx =="
nginx -t
systemctl reload nginx
echo "nginx: reload OK"

echo
echo "== Frontend on disk (должно совпадать с root в nginx) =="
echo "dist=$PROJECT_ROOT/frontend/dist"
ls -la "$PROJECT_ROOT/frontend/dist/index.html" 2>/dev/null || true
echo "bundles referenced in index.html:"
grep -oE 'assets/[^"]+\.(js|css)' "$PROJECT_ROOT/frontend/dist/index.html" 2>/dev/null | sort -u || true

echo
echo "== Admin-panel on disk =="
echo "dist=$PROJECT_ROOT/admin-panel/dist"
ls -la "$PROJECT_ROOT/admin-panel/dist/index.html" 2>/dev/null || true
echo "bundles referenced in admin index.html:"
grep -oE 'assets/[^"]+\.(js|css)' "$PROJECT_ROOT/admin-panel/dist/index.html" 2>/dev/null | sort -u || true

echo
echo "nginx root lines (sites-enabled):"
grep -R "root \|alias " /etc/nginx/sites-enabled/ 2>/dev/null | grep -v '#' || true

echo
echo "== Backend health (не валит деплой, если порт другой или сервис ещё поднимается) =="
if sleep 2 && curl -fsS --max-time 5 http://127.0.0.1:4000/health; then
  echo "health: OK"
else
  echo "WARN: curl http://127.0.0.1:4000/health failed — проверь PORT в backend/.env и pm2 logs $PM2_APP_NAME"
fi

echo
echo "Update completed (сборка и nginx reload сделаны)."
echo "  mini app:   $FRONTEND_PUBLISH_DIR"
echo "  admin panel: $ADMIN_PUBLISH_DIR"
echo "Если в браузере старое — см. deploy/PRODUCTION_SERVER_SETUP.md §6 и §10."
