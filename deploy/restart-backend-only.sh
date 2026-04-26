#!/usr/bin/env bash
# Быстрый выкат только бэкенда (например после hotfix в userRepo), без полной пересборки фронта.
set -euo pipefail
PROJECT_ROOT="${PROJECT_ROOT:-$HOME/miniapp}"
PM2_APP_NAME="${PM2_APP_NAME:-miniapp-backend}"

cd "$PROJECT_ROOT"
git fetch origin main
git pull --ff-only origin main
corepack enable >/dev/null 2>&1 || true
corepack prepare pnpm@10.33.0 --activate >/dev/null 2>&1 || true
pnpm install
pnpm --filter miniapp-backend build
pm2 restart "$PM2_APP_NAME" --update-env
sleep 1
curl -fsS --max-time 5 "http://127.0.0.1:4000/health" && echo " OK"
