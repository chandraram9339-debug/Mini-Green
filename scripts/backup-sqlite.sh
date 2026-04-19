#!/usr/bin/env bash
# Копия файла SQLite (и -wal / -shm рядом). Каталог out/ не в git. Ключи: зашифрованные сиды в БД; TronGrid API key в .env, не в БД.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_ROOT="$(cd "$SCRIPT_DIR/../backend" && pwd)"
if [[ -f "$BACKEND_ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$BACKEND_ROOT/.env"
  set +a
fi
cd "$BACKEND_ROOT"
DB_FILE="$(node -e "
const path = require('path');
const root = process.argv[1];
const raw = (process.env.DB_PATH || '').trim();
const f = raw.length > 0 ? path.resolve(root, raw) : path.join(root, 'runtime', 'miniapp.db');
console.log(f);
" "$BACKEND_ROOT")"

if [[ ! -f "$DB_FILE" ]]; then
  echo "База не найдена: $DB_FILE" >&2
  exit 1
fi

OUT_DIR="${1:-$SCRIPT_DIR/../backup-sqlite}"
mkdir -p "$OUT_DIR"
TS="$(date +%Y%m%d_%H%M%S)"
BASE="$(basename "$DB_FILE")"
SNAP="$OUT_DIR/${BASE}.${TS}.bak"

cp -p "$DB_FILE" "$SNAP"
for ext in -wal -shm; do
  sidecar="${DB_FILE}${ext}"
  if [[ -f "$sidecar" ]]; then
    cp -p "$sidecar" "${SNAP}${ext}"
  fi
done

echo "OK: $SNAP (и -wal / -shm рядом, если были)"
ls -la "$SNAP" "${SNAP}-wal" 2>/dev/null || true
