# Telegram Mini App Scaffold

This repository is a bootstrap for a Telegram Mini App project.

## Structure

- `frontend` - client app (React + Vite + TypeScript)
- `backend` - API service (Node.js + Express + TypeScript)
- `docker-compose.yml` - local Postgres and Redis

## Quick start

1. Install dependencies:
   - `cd backend && pnpm install`
   - `cd ../frontend && pnpm install`
2. Start infrastructure:
   - `docker compose up -d`
3. Run backend:
   - `cd backend && pnpm dev`
4. Run frontend:
   - `cd frontend && pnpm dev`

## Runtime preflight gate

- Runner preflight: `scripts/runner06-preflight.sh`
- CI preflight: `scripts/ci-preflight-gate.sh`

Both paths use the same deterministic gate and emit:
- `runner_id`
- `profile_id`
- `env_source`
- `dsn_redacted`

## Merge enforcement checks

- Required check 1: `preflight` (runtime preflight gate)
- Required check 2: `metadata-schema-validation` (runtime metadata schema gate)
- Required check 3: `regression-smoke-pr` (backend regression/e2e smoke on PR)
- Required check 4-6: `init-matrix` cases (backend init matrix on PR)

## Runtime drift guard contract

- Contract file: `scripts/runtime-drift-contract.env`
- Drift keys (hard-fail on mismatch): `env_source`, `profile_id`, `dsn_hash`
- Alert rule: `scripts/alerts/runtime-drift-alert-rule.yml`

## Backend regression/e2e autoscript

- Local one-command run: `scripts/regression-e2e-auth-ui.sh`
- Direct backend run: `pnpm --dir backend regression:e2e`
- Artifact path: `backend/reports/regression-e2e-auth-ui.json`
- Artifact includes deterministic checks for critical auth/init and UI paths:
  `status`, `code`, `reason`, `trace_id`, and final `PASS`/`FAIL`.
- Production-like init knobs live in `backend/.env.example`:
  `DEMO_INIT_TOKENS`, `MOCK_INITDATA_SECRET`, `MOCK_INITDATA_MAX_AGE_SEC`, `ENABLE_OPS_LOGS`.

CI integration:
- Pull requests to `main`: smoke regression run + artifact upload
- Push/schedule on `main`: full regression run + artifact upload

## Release close gate

- Checklist: `docs/release-quality-gate-checklist.md`
- Release close is blocked unless `Visual Fidelity PASS` is confirmed by `06_SECURITY_QA`.
- Temporary policy for external tooling blocker (`MCP quota`): use status `BLOCKED_WITH_EXTERNAL_DEPENDENCY` with `24h` TTL and mandatory visual auto-rerun after unblock.
- Deploy workflow: `.github/workflows/release-deploy.yml`
- Rollback quick-pass workflow: `.github/workflows/rollback-quick-pass.yml`
- Release ops alert rule: `scripts/alerts/release-operations-alert-rule.yml`
- Current RC baseline can resolve rollback from `rc-2026.04.16-01` to `rc-2026.04.15-01`.
