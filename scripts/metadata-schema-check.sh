#!/usr/bin/env bash
set -euo pipefail

RUNNER_ID="${RUNNER_ID:-06}"
PROFILE_ID="${PROFILE_ID:-}"
ENV_SOURCE="${ENV_SOURCE:-/home/ramos/Документы/miniapp/backend/.env}"
EXPECTED_ENV_SOURCE="${EXPECTED_ENV_SOURCE:-$ENV_SOURCE}"
TS_UTC="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

fail() {
  local message="$1"
  echo "metadata_schema=FAIL"
  echo "error=${message}"
  exit 1
}

if [[ ! -f "${ENV_SOURCE}" ]]; then
  fail "env source missing: ${ENV_SOURCE}"
fi

if [[ "${ENV_SOURCE}" != "${EXPECTED_ENV_SOURCE}" ]]; then
  fail "env source mismatch: actual=${ENV_SOURCE} expected=${EXPECTED_ENV_SOURCE}"
fi

set -a
source "${ENV_SOURCE}"
set +a

DB_PROFILE_ACTUAL="${DB_RUNTIME_PROFILE_ID:-}"
DATABASE_URL_ACTUAL="${DATABASE_URL:-}"
DSN_REDACTED="$(echo "${DATABASE_URL_ACTUAL}" | sed -E 's#://([^:]+):[^@]+@#://\1:***@#')"

echo "runner_id=${RUNNER_ID}"
echo "utc=${TS_UTC}"
echo "profile_id=${DB_PROFILE_ACTUAL:-missing}"
echo "env_source=${ENV_SOURCE}"
echo "dsn_redacted=${DSN_REDACTED:-missing}"

[[ -n "${DB_PROFILE_ACTUAL}" ]] || fail "DB_RUNTIME_PROFILE_ID is missing"
[[ -n "${PROFILE_ID}" ]] || fail "PROFILE_ID input is missing"
[[ "${DB_PROFILE_ACTUAL}" == "${PROFILE_ID}" ]] || fail "profile mismatch: actual=${DB_PROFILE_ACTUAL} expected=${PROFILE_ID}"
[[ -n "${DATABASE_URL_ACTUAL}" ]] || fail "DATABASE_URL is missing"
[[ "${DATABASE_URL_ACTUAL}" =~ ^postgresql://[^:]+:[^@]+@[^:/]+:[0-9]+/[^?[:space:]]+$ ]] || fail "DATABASE_URL format is invalid for canonical DSN"

echo "metadata_schema=PASS"
