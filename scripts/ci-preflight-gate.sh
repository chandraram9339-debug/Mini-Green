#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
_REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
export CONTEXT_LABEL="ci"
export RUNNER_ID="${RUNNER_ID:-06}"
export ENV_SOURCE="${ENV_SOURCE:-${_REPO_ROOT}/backend/.env}"
export EXPECTED_ENV_SOURCE="${EXPECTED_ENV_SOURCE:-${_REPO_ROOT}/backend/.env}"
export COMPOSE_FILE="${COMPOSE_FILE:-${_REPO_ROOT}/docker-compose.yml}"
export PROFILE_ID="${PROFILE_ID:-db-runtime-v1}"

"${SCRIPT_DIR}/runtime-preflight-gate.sh"
