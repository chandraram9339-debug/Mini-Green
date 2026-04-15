# Release Quality Gate Checklist

This checklist is mandatory for release close.

## Required Gates (hard block)

- [ ] Runtime preflight PASS
- [ ] Metadata schema validation PASS
- [ ] Deploy evidence uploaded (`release-deploy` workflow)
- [ ] **Visual Fidelity PASS from `06_SECURITY_QA` (mandatory)**

## Visual Gate Rule

- `Visual Fidelity PASS` is a release-close gate, not optional polish.
- If visual status is FAIL or missing evidence, release close remains blocked.
- Required evidence fields:
  - `qa_owner_tag=06_SECURITY_QA`
  - `visual_evidence_ref` (report URL / run ID)
  - UTC timestamp from the release workflow run

## Technical Enforcement

- Workflow: `.github/workflows/release-deploy.yml`
- Gate step: `Enforce visual quality gate (06_SECURITY_QA)`
- Blocking behavior: run exits with non-zero status when `visual_fidelity_pass != true`.
