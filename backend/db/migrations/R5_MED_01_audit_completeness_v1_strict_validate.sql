BEGIN;

-- R5-MED-01 post-proof hardening step.
-- Execute only after QA/CI confirms stable 100% completeness in strict scope.
-- This validates previously added NOT VALID constraints without API changes.

ALTER TABLE IF EXISTS audit_events
  VALIDATE CONSTRAINT audit_events_event_type_v1_chk;

ALTER TABLE IF EXISTS audit_events
  VALIDATE CONSTRAINT audit_events_reason_code_v1_chk;

ALTER TABLE IF EXISTS audit_events
  VALIDATE CONSTRAINT audit_events_precedence_source_v1_chk;

COMMIT;
