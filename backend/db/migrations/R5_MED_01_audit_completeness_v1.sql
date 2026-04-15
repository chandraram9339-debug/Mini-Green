BEGIN;

-- R5-MED-01: additive/backward-compatible audit completeness support.
-- No API drift: only schema extensions and read-model artifacts.
-- PostgreSQL 16.x compatibility: no ADD CONSTRAINT IF NOT EXISTS syntax.

-- 0) Bootstrap precondition: audit_events must exist before R5 migration.
DO $$
BEGIN
  IF to_regclass('public.audit_events') IS NULL THEN
    RAISE EXCEPTION
      USING
        MESSAGE = 'R5_MED_01 precondition failed: table public.audit_events does not exist',
        HINT = 'Apply bootstrap/base audit migration before R5_MED_01_audit_completeness_v1.sql.';
  END IF;
END
$$;

-- 1) Add completeness fields to audit_events (nullable for phased rollout).
ALTER TABLE IF EXISTS audit_events
  ADD COLUMN IF NOT EXISTS policy_version TEXT,
  ADD COLUMN IF NOT EXISTS precedence_source TEXT,
  ADD COLUMN IF NOT EXISTS reason_code TEXT,
  ADD COLUMN IF NOT EXISTS correlation_id TEXT,
  ADD COLUMN IF NOT EXISTS causation_id TEXT,
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- 2) Add soft validation constraints (NOT VALID keeps migration safe on existing rows).
-- Strict frozen v1 lists are enforced on new writes after validation/cutover.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    WHERE c.conname = 'audit_events_event_type_v1_chk'
      AND c.conrelid = 'public.audit_events'::regclass
  ) THEN
    ALTER TABLE audit_events
      ADD CONSTRAINT audit_events_event_type_v1_chk
      CHECK (
        event_type IN (
          'policy.create',
          'policy.update',
          'policy.reject',
          'policy.replay'
        )
      ) NOT VALID;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    WHERE c.conname = 'audit_events_reason_code_v1_chk'
      AND c.conrelid = 'public.audit_events'::regclass
  ) THEN
    ALTER TABLE audit_events
      ADD CONSTRAINT audit_events_reason_code_v1_chk
      CHECK (
        reason_code IS NULL OR reason_code IN (
          'LIMIT_MIN',
          'LIMIT_MAX',
          'FEE_APPLIED',
          'ROUNDING_APPLIED',
          'HOLD_TRIGGERED',
          'HOLD_RELEASED',
          'PRECEDENCE_OVERRIDE',
          'REPLAY_IDEMPOTENT'
        )
      ) NOT VALID;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    WHERE c.conname = 'audit_events_precedence_source_v1_chk'
      AND c.conrelid = 'public.audit_events'::regclass
  ) THEN
    ALTER TABLE audit_events
      ADD CONSTRAINT audit_events_precedence_source_v1_chk
      CHECK (
        precedence_source IS NULL OR precedence_source IN (
          'request',
          'admin_config',
          'system_default',
          'risk_override'
        )
      ) NOT VALID;
  END IF;
END
$$;

-- 3) Indexes for policy-sensitive investigations and coverage scans.
CREATE INDEX IF NOT EXISTS idx_audit_events_event_type_created_at
  ON audit_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_events_correlation_id
  ON audit_events (correlation_id);

CREATE INDEX IF NOT EXISTS idx_audit_events_policy_version
  ON audit_events (policy_version);

-- 4) Completeness evidence view for QA and rerun gate.
CREATE OR REPLACE VIEW audit_policy_completeness_v1 AS
SELECT
  ae.id,
  ae.created_at,
  ae.event_type,
  ae.reason_code,
  ae.policy_version,
  ae.precedence_source,
  ae.correlation_id,
  ae.causation_id,
  ae.idempotency_key,
  (ae.event_type IN ('policy.create', 'policy.update', 'policy.reject', 'policy.replay')) AS in_strict_scope,
  (
    ae.event_type IN ('policy.create', 'policy.update', 'policy.reject', 'policy.replay')
    AND ae.policy_version IS NOT NULL
    AND ae.precedence_source IS NOT NULL
    AND ae.reason_code IS NOT NULL
    AND ae.correlation_id IS NOT NULL
    AND ae.idempotency_key IS NOT NULL
  ) AS mandatory_fields_complete
FROM audit_events ae;

COMMIT;
