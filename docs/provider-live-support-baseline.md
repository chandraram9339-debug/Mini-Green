# Provider Live Support Baseline

This document defines the infra/ops baseline for live provider confidence with `AUTH_PROVIDER_MODE=telegram`.

## Real Secret Wiring

- Workflow: `.github/workflows/provider-live-support.yml`
- Secret source: protected GitHub Actions environment secret `TELEGRAM_BOT_TOKEN`
- Expected environment: `staging-rc` by default, or another protected environment chosen at dispatch time
- Generated runtime env:
  - `AUTH_PROVIDER_MODE=telegram`
  - `TELEGRAM_BOT_TOKEN=<environment secret>`
  - `ENABLE_OPS_LOGS=true`
  - `ACTION_STORE_PATH=.tmp/provider-action-store.json`

## Readiness / Support Checks

- Validation script: `scripts/provider-verify-support-check.sh`
- Ready means:
  - secret exists and is not placeholder
  - env source is consistent
  - ops logging is enabled
  - action store path is writable

## Non-Local Observability Path

- Primary downstream path:
  - GitHub Actions workflow run URL
  - uploaded artifact `provider-live-support-<run_id>`
  - `GITHUB_STEP_SUMMARY` entry for the run
- Local temp sinks remain useful for script contracts, but production-like operator evidence should be taken from the workflow run + artifact, not only `/tmp/*.log`.

## Failure Ownership

- Infra/ops owner: `07_REPO_ARCH/Infra`
- QA verification consumer: `06_SECURITY_QA`

## Failure Signals

- Missing/placeholder secret -> `failure_hop=provider_config`, `first_failing_substep=provider_secret`
- Invalid env source -> `failure_hop=env_source`
- Missing observability -> `failure_hop=provider_observability`, `first_failing_substep=ops_logs`
- Unwritable durable action path -> `failure_hop=provider_storage`, `first_failing_substep=action_store_path`

## Residual Assumption

- This baseline proves live secret wiring and support readiness, not a full end-to-end Telegram provider transaction against external provider availability.
