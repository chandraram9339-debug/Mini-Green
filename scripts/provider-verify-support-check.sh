#!/usr/bin/env bash
set -euo pipefail

RUNNER_ID="${RUNNER_ID:-06}"
ENV_SOURCE="${ENV_SOURCE:-/home/ramos/Документы/miniapp/backend/.env}"
EXPECTED_ENV_SOURCE="${EXPECTED_ENV_SOURCE:-$ENV_SOURCE}"
OWNER_TAG="${OWNER_TAG:-07_REPO_ARCH/Infra}"
ALERT_LOG_PATH="${ALERT_LOG_PATH:-/tmp/provider-verification-alerts.log}"
TS_UTC="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
STEP="bootstrap"

emit_alert() {
  local reason="$1"
  local hop="$2"
  printf '{"utc_timestamp":"%s","owner-tag":"%s","runner_id":"%s","first_failing_substep":"%s","failure_hop":"%s","reason":"%s"}\n' \
    "${TS_UTC}" "${OWNER_TAG}" "${RUNNER_ID}" "${STEP}" "${hop}" "${reason}" >> "${ALERT_LOG_PATH}"
}

fail() {
  local reason="$1"
  local hop="${2:-provider_verify_support}"
  echo "utc_timestamp=${TS_UTC}"
  echo "owner-tag=${OWNER_TAG}"
  echo "runner_id=${RUNNER_ID}"
  echo "status=FAIL"
  echo "first_failing_substep=${STEP}"
  echo "failure_hop=${hop}"
  echo "error=${reason}"
  emit_alert "${reason}" "${hop}"
  exit 1
}

if [[ ! -f "${ENV_SOURCE}" ]]; then
  fail "env source missing: ${ENV_SOURCE}" "env_source"
fi

if [[ "${ENV_SOURCE}" != "${EXPECTED_ENV_SOURCE}" ]]; then
  fail "env source mismatch: actual=${ENV_SOURCE} expected=${EXPECTED_ENV_SOURCE}" "env_source"
fi

set -a
source "${ENV_SOURCE}"
set +a

AUTH_PROVIDER_MODE_ACTUAL="${AUTH_PROVIDER_MODE:-mock}"
TELEGRAM_BOT_TOKEN_ACTUAL="${TELEGRAM_BOT_TOKEN:-}"
ACTION_STORE_PATH_ACTUAL="${ACTION_STORE_PATH:-./runtime/action-store.json}"
ENABLE_OPS_LOGS_ACTUAL="${ENABLE_OPS_LOGS:-false}"
ACTION_STORE_DIR="$(dirname "${ACTION_STORE_PATH_ACTUAL}")"

echo "status=START"
echo "utc_timestamp=${TS_UTC}"
echo "owner-tag=${OWNER_TAG}"
echo "runner_id=${RUNNER_ID}"
echo "env_source=${ENV_SOURCE}"
echo "auth_provider_mode=${AUTH_PROVIDER_MODE_ACTUAL}"
echo "action_store_path=${ACTION_STORE_PATH_ACTUAL}"
echo "ops_logs_enabled=${ENABLE_OPS_LOGS_ACTUAL}"

STEP="provider_mode"
if [[ "${AUTH_PROVIDER_MODE_ACTUAL}" != "telegram" ]]; then
  fail "AUTH_PROVIDER_MODE must be telegram for provider-like verification" "auth_provider"
fi
echo "step=provider_mode status=PASS"

STEP="provider_secret"
if [[ -z "${TELEGRAM_BOT_TOKEN_ACTUAL}" || "${TELEGRAM_BOT_TOKEN_ACTUAL}" == "replace-me" ]]; then
  fail "TELEGRAM_BOT_TOKEN missing or placeholder for telegram provider mode" "provider_config"
fi
echo "telegram_bot_token_configured=true"
echo "step=provider_secret status=PASS"

STEP="ops_logs"
if [[ "${ENABLE_OPS_LOGS_ACTUAL}" != "true" ]]; then
  fail "ENABLE_OPS_LOGS must be true for provider degradation observability" "provider_observability"
fi
echo "step=ops_logs status=PASS"

STEP="action_store_path"
mkdir -p "${ACTION_STORE_DIR}"
touch "${ACTION_STORE_PATH_ACTUAL}" || fail "ACTION_STORE_PATH is not writable: ${ACTION_STORE_PATH_ACTUAL}" "provider_storage"
echo "step=action_store_path status=PASS"

echo "provider_like_verification=READY"
echo "status=PASS"
