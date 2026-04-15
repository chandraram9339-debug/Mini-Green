#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export CONTEXT_LABEL="runner-06"
export RUNNER_ID="${RUNNER_ID:-06}"
export ENV_SOURCE="${ENV_SOURCE:-/home/ramos/Документы/miniapp/backend/.env}"
export EXPECTED_ENV_SOURCE="${EXPECTED_ENV_SOURCE:-/home/ramos/Документы/miniapp/backend/.env}"
export COMPOSE_FILE="${COMPOSE_FILE:-/home/ramos/Документы/miniapp/docker-compose.yml}"
export PROFILE_ID="${PROFILE_ID:-db-runtime-v1}"

"${SCRIPT_DIR}/runtime-preflight-gate.sh"
