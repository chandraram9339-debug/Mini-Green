#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "==> backend: tsc"
(cd "$ROOT/backend" && pnpm run build)
echo "==> admin-panel: typecheck + vite build"
(cd "$ROOT/admin-panel" && pnpm run build)
echo "Done."
echo "  Backend:  $ROOT/backend/dist   → run: cd backend && node dist/index.js (after pnpm install --prod)"
echo "  Admin UI: $ROOT/admin-panel/dist → static files (nginx/caddy) or: cd admin-panel && pnpm preview"
