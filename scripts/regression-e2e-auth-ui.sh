#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

OWNER_TAG="${OWNER_TAG:-07_REPO_ARCH/Infra}"
RUN_CONTEXT="${RUN_CONTEXT:-backend-regression-e2e}"
LOG_DIR="${LOG_DIR:-backend/reports/ci-logs}"
LOG_FILE="${LOG_DIR}/${RUN_CONTEXT}.log"

mkdir -p "$LOG_DIR"

if pnpm --dir backend regression:e2e 2>&1 | tee "$LOG_FILE"; then
  echo "owner-tag=${OWNER_TAG}"
  echo "run_context=${RUN_CONTEXT}"
  echo "result=PASS"
else
  echo "owner-tag=${OWNER_TAG}"
  echo "run_context=${RUN_CONTEXT}"
  echo "result=FAIL"
  echo "first_failing_substep=regression_e2e"
  echo "failure_hop=e2e_runtime"
  exit 1
fi

echo "artifact=backend/reports/regression-e2e-auth-ui.json"
echo "log_artifact=${LOG_FILE}"
