-- R5-MED-01 QA query pack
-- Scope: strict policy-sensitive transitions from frozen MASTER v1.

-- 1) Missing-field detector by event.
SELECT
  id,
  created_at,
  event_type,
  policy_version,
  precedence_source,
  reason_code,
  correlation_id,
  causation_id,
  idempotency_key
FROM audit_policy_completeness_v1
WHERE in_strict_scope = TRUE
  AND mandatory_fields_complete = FALSE
ORDER BY created_at DESC;

-- 2) Coverage % by event_type in strict scope.
SELECT
  event_type,
  COUNT(*) AS total_events,
  COUNT(*) FILTER (WHERE mandatory_fields_complete) AS complete_events,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE mandatory_fields_complete) / NULLIF(COUNT(*), 0),
    2
  ) AS completeness_pct
FROM audit_policy_completeness_v1
WHERE in_strict_scope = TRUE
GROUP BY event_type
ORDER BY event_type;

-- 3) Coverage % overall strict scope.
SELECT
  COUNT(*) AS total_events,
  COUNT(*) FILTER (WHERE mandatory_fields_complete) AS complete_events,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE mandatory_fields_complete) / NULLIF(COUNT(*), 0),
    2
  ) AS completeness_pct
FROM audit_policy_completeness_v1
WHERE in_strict_scope = TRUE;

-- 4) Chain proof for create/update/reject/replay with correlation linkage.
SELECT
  correlation_id,
  ARRAY_AGG(event_type ORDER BY created_at ASC) AS event_chain,
  BOOL_AND(mandatory_fields_complete) AS chain_is_complete,
  MIN(created_at) AS chain_started_at,
  MAX(created_at) AS chain_finished_at
FROM audit_policy_completeness_v1
WHERE in_strict_scope = TRUE
GROUP BY correlation_id
ORDER BY chain_finished_at DESC;
