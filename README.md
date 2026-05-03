# Telegram Mini App Scaffold

This repository is a bootstrap for a Telegram Mini App project.

## Fees and default FAQ text

- **Commissions and minimums (USDT TRC20 default policy, 7 + 9% / 7 + 19%):** see [`FAQ.md`](FAQ.md) at the top (callout) and the **Money and fees** / **Commissions: deposit and withdrawal (summary)** sections. Russian copy: [`FAQ.ru.md`](FAQ.ru.md). After editing `FAQ.md`, run `node scripts/sync-faq-md-to-backend.mjs` so the mini app and migration default string stay in sync (unless the operator overrides FAQ text in the admin **Content**).
- **Backend defaults / overrides:** `backend/.env.example` (`MIN_DEPOSIT_USDT`, `DEPOSIT_FEE_*`, `WITHDRAW_FEE_*`, `REFERRAL_*`); live production policy is often stored in the database `app_config` and the admin **Fees and limits** screen — see `ENV_SETUP.md` § *Комиссии*.

## Structure

- `frontend` - client app (React + Vite + TypeScript)
- `backend` - API service (Node.js + Express + TypeScript)
- `admin-panel` - web admin (React + Vite; прокси к API на порту бэкенда)
- `docker-compose.yml` - local Postgres and Redis (optional)
- `figma-miniapp-design-system/` — offline CSS/JSON токены (снимок из Figma MCP / экспорта)
- `figma-miniapp-spec/` — сборки экранов и codegen-фрагменты; `figma-miniapp-full-spec.json` — агрегированный JSON
- Повторно подтянуть артефакты из локальной папки vsix: `scripts/sync-figma-vsix-artifacts.sh` (или `FIGMA_VSIX_ROOT=… ./scripts/sync-figma-vsix-artifacts.sh`)

## Quick start

1. **Клонировать репозиторий** и перейти в корень проекта.

2. **Секреты не в git.** Скопировать примеры env и заполнить ключи локально:
   - `cp backend/.env.example backend/.env`
   - `cp frontend/.env.example frontend/.env`  
   Во фронте для работы с API укажите например `VITE_API_BASE_URL=http://127.0.0.1:4000` (порт как в `backend/.env`).

3. **Установить зависимости одной командой** (pnpm workspace):
   - `pnpm install`

4. **Поднять бэкенд + миниапп + админку вместе:**
   - `pnpm dev`  
   Только админка (порт **5180**, прокси `/admin` и `/health` → `localhost:4000`): `pnpm --filter admin-panel dev`

   Локальные адреса по умолчанию:

   | Сервис    | URL                        |
   |-----------|----------------------------|
   | API       | http://127.0.0.1:4000      |
   | Миниапп   | http://127.0.0.1:5173      |
   | Админка   | http://127.0.0.1:5180      |

5. Опционально инфраструктура из compose: `docker compose up -d`

6. Проверка API без браузера (после `pnpm --filter miniapp-backend build`): `pnpm smoke`

## Frontend external links

- Copy `frontend/.env.example` to `frontend/.env` and set production values for:
  - `VITE_CHANNEL_URL`
  - `VITE_CHAT_URL`
  - `VITE_YOUTUBE_URL`
  - `VITE_SUPPORT_URL`
  - `VITE_REFERRAL_URL`
- External links in UI are read from `frontend/src/app/config.ts` via these variables.
- Validate readiness before release:
  - `cd frontend && npm run check:external-links`
  - Command fails until all 5 link variables are present and not `TODO`.

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
  `AUTH_PROVIDER_MODE`, `DEMO_INIT_TOKENS`, `MOCK_INITDATA_SECRET`, `MOCK_INITDATA_MAX_AGE_SEC`,
  `TELEGRAM_BOT_TOKEN`, `ACTION_STORE_PATH`, `ENABLE_OPS_LOGS`.
- `AUTH_PROVIDER_MODE=mock` validates demo-safe tokens and signed mock payloads.
- `AUTH_PROVIDER_MODE=telegram` validates real Telegram-style `initData` against `TELEGRAM_BOT_TOKEN`
  without changing the API contract.
- Action flow confidence is backed by durable file state at `ACTION_STORE_PATH` (default:
  `backend/runtime/action-store.json`) for `top-up` / `withdraw` / `confirm`.

CI integration:
- Pull requests to `main`: smoke regression run + artifact upload
- Push/schedule on `main`: full regression run + artifact upload

## Release close gate

- Checklist: `docs/release-quality-gate-checklist.md`
- Dependency confidence map: `docs/production-dependency-confidence-map.md`
- Release close is blocked unless `Visual Fidelity PASS` is confirmed by `06_SECURITY_QA`.
- Temporary policy for external tooling blocker (`MCP quota`): use status `BLOCKED_WITH_EXTERNAL_DEPENDENCY` with `24h` TTL and mandatory visual auto-rerun after unblock.
- Deploy workflow: `.github/workflows/release-deploy.yml`
- Rollback quick-pass workflow: `.github/workflows/rollback-quick-pass.yml`
- Release ops alert rule: `scripts/alerts/release-operations-alert-rule.yml`
- Current RC baseline can resolve rollback from `rc-2026.04.16-01` to `rc-2026.04.15-01`.

## Real Dependency Confidence

- Auth/provider confidence is observed through release-close evidence and QA ownership rather than hidden bypass.
- Secret/runtime confidence is enforced through `runtime-preflight-gate`, `metadata-schema-validation`, and `runtime-drift-mismatch-v1`.
- Durable storage confidence is bounded by deterministic DB readiness checks and rollback target availability.
- Monitoring confidence is bounded by repository alert contracts plus whatever downstream sink wiring exists in the release environment.

## Provider-Like Verification Support

- QA support check: `scripts/provider-verify-support-check.sh`
- Alert rule: `scripts/alerts/provider-verification-alert-rule.yml`
- Live provider support baseline: `docs/provider-live-support-baseline.md`
- Live workflow: `.github/workflows/provider-live-support.yml`
- For `AUTH_PROVIDER_MODE=telegram`, QA support is considered wired only when:
  - `TELEGRAM_BOT_TOKEN` is injected from a real secret source
  - `ENABLE_OPS_LOGS=true`
  - `ACTION_STORE_PATH` is writable in the runtime environment
- Non-local downstream evidence for live support should come from the workflow run URL, uploaded artifact, and step summary, not only local temp logs.
- If provider wiring is unavailable or degraded, the support check emits structured failure fields:
  `owner-tag`, `runner_id`, `first_failing_substep`, `failure_hop`, `reason`.
