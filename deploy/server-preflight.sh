#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="${PROJECT_ROOT:-$HOME/miniapp}"
BACKEND_ENV="$PROJECT_ROOT/backend/.env"
FRONTEND_ENV="$PROJECT_ROOT/frontend/.env.production"
BACKEND_DIST="$PROJECT_ROOT/backend/dist/index.js"
FRONTEND_DIST="$PROJECT_ROOT/frontend/dist/index.html"
BACKEND_PORT="${BACKEND_PORT:-4000}"

echo "== Project root =="
echo "$PROJECT_ROOT"

echo
echo "== Required files =="
for path in "$BACKEND_ENV" "$FRONTEND_ENV" "$BACKEND_DIST" "$FRONTEND_DIST"; do
  if [[ -f "$path" ]]; then
    echo "OK  $path"
  else
    echo "MISS $path"
  fi
done

echo
echo "== backend/.env keys =="
for key in DB_PATH AUTH_PROVIDER_MODE TELEGRAM_BOT_TOKEN TRON_API_KEY LIVE_TRON LIVE_TRON_SEND ADMIN_API_KEY; do
  if rg -n "^${key}=" "$BACKEND_ENV" >/dev/null 2>&1; then
    echo "OK  $key"
  else
    echo "MISS $key"
  fi
done

echo
echo "== frontend/.env.production keys =="
for key in VITE_API_BASE_URL VITE_CHANNEL_URL VITE_CHAT_URL VITE_YOUTUBE_URL VITE_SUPPORT_URL VITE_REFERRAL_URL; do
  if rg -n "^${key}=" "$FRONTEND_ENV" >/dev/null 2>&1; then
    echo "OK  $key"
  else
    echo "MISS $key"
  fi
done

echo
echo "== Certs =="
if [[ -d /etc/letsencrypt/live ]]; then
  ls -1 /etc/letsencrypt/live || true
else
  echo "/etc/letsencrypt/live not found"
fi

echo
echo "== PM2 =="
if command -v pm2 >/dev/null 2>&1; then
  pm2 status || true
else
  echo "pm2 not installed"
fi

echo
echo "== Backend health =="
curl -fsS "http://127.0.0.1:${BACKEND_PORT}/health" || echo "health check failed"

echo
echo "== Nginx references to vite dev ports =="
rg -n "5173|5174" /etc/nginx/sites-available /etc/nginx/sites-enabled || true
