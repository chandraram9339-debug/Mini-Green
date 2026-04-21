#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="${PROJECT_ROOT:-$HOME/miniapp}"
BRANCH="${BRANCH:-$(git -C "$PROJECT_ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo main)}"
PM2_APP_NAME="${PM2_APP_NAME:-miniapp-backend}"

echo "== Update server =="
echo "project_root=$PROJECT_ROOT"
echo "branch=$BRANCH"
echo "pm2_app=$PM2_APP_NAME"

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
  echo
  echo "== Frontend dist (index.html) =="
  ls -la "$PROJECT_ROOT/frontend/dist/index.html" || true
else
  echo "Workspace package.json not found, using per-package install/build"
  (cd backend && npm install && npm run build)
  (cd frontend && npm install && npm run build)
fi

echo
echo "== Restart backend =="
pm2 restart "$PM2_APP_NAME"
pm2 save

echo
echo "== Reload nginx =="
nginx -t
systemctl reload nginx

echo
echo "== Health =="
curl -fsS http://127.0.0.1:4000/health
echo
echo "Update completed successfully."
