#!/usr/bin/env bash
# Pull Figma offline bundles from a local vsix/export tree into this repo (variant A — single project).
# Default source: ~/Загрузки/vsix  |  override: FIGMA_VSIX_ROOT=/path/to/vsix
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="${FIGMA_VSIX_ROOT:-$HOME/Загрузки/vsix}"
for d in figma-miniapp-design-system figma-miniapp-spec; do
  if [[ ! -d "$SRC/$d" ]]; then
    echo "error: missing $SRC/$d" >&2
    exit 1
  fi
done
rsync -a --delete "$SRC/figma-miniapp-design-system/" "$ROOT/figma-miniapp-design-system/"
rsync -a --delete "$SRC/figma-miniapp-spec/" "$ROOT/figma-miniapp-spec/"
cp -f "$SRC/figma-miniapp-full-spec.json" "$ROOT/figma-miniapp-full-spec.json"
echo "Synced figma-miniapp-* from $SRC → $ROOT"
