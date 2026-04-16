# Release Quality Gate Checklist

This checklist is mandatory for release close.

## Required Gates (hard block)

- [ ] Runtime preflight PASS
- [ ] Metadata schema validation PASS
- [ ] Backend regression/e2e PASS on `main`
- [ ] Backend init matrix PASS on `main`
- [ ] Deploy evidence uploaded (`release-deploy` workflow)
- [ ] Rollback quick-pass evidence uploaded (`rollback-quick-pass` workflow)
- [ ] **Visual Fidelity PASS from `06_SECURITY_QA` (mandatory)**

## Visual Gate Rule

- `Visual Fidelity PASS` is a release-close gate, not optional polish.
- If visual status is FAIL or missing evidence, release close remains blocked.
- Temporary external blocker policy:
  - If `visual_failure_reason=external_tooling_quota`, set release status to `BLOCKED_WITH_EXTERNAL_DEPENDENCY`.
  - This is not treated as product quality fail while blocker is external.
  - TTL for unblock window: `24h` (configurable via workflow input `external_unblock_ttl_hours`).
  - Escalation path: `06_SECURITY_QA -> 07_REPO_ARCH/Infra -> 00_MASTER`.
  - After external unblock, `Visual Acceptance` must be auto-rerun before release close.
- Required evidence fields:
  - `qa_owner_tag=06_SECURITY_QA`
  - `visual_evidence_ref` (report URL / run ID)
  - UTC timestamp from the release workflow run

## Technical Enforcement

- Workflow: `.github/workflows/release-deploy.yml`
- Workflow: `.github/workflows/rollback-quick-pass.yml`
- Gate step: `Enforce visual quality gate (06_SECURITY_QA)`
<<<<<<< HEAD
- Blocking behavior: run exits with non-zero status when `visual_fidelity_pass != true`.
=======
- Alert rules:
  - `scripts/alerts/runtime-drift-alert-rule.yml`
  - `scripts/alerts/release-operations-alert-rule.yml`
- Blocking behavior:
  - `visual_fidelity_pass != true` => run exits non-zero and release close blocked.
  - `visual_failure_reason=external_tooling_quota` => explicit status `BLOCKED_WITH_EXTERNAL_DEPENDENCY`.
  - Release remains blocked until unblock + rerun with `visual_fidelity_pass=true`.
- Rollback confidence rule:
  - each RC baseline must resolve a `rollback_candidate_tag` or explicitly record `UNAVAILABLE`
  - release readiness is stronger when `rollback-quick-pass` has a fresh PASS against the current target environment
>>>>>>> 240b7ae (chore(infra): productionize release ops baseline)
