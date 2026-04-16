-- Migration 035: Add override_total_target and override_total_actual to operation_indicators
-- Phase HA: Total Override Extension (Directives 367)
-- Date: 2026-04-10
--
-- Rationale:
--   Complements existing override_rate (migration 032) and override_variance (migration 034).
--   When published BAR1 Total Target or Total Actual differs from the auto-computed quarterly
--   sums, these overrides allow alignment without modifying stored quarterly values.
--   When set, effectiveTarget/effectiveActual feed into variance and rate computation.
--
--   Override priority chain:
--     effectiveTarget = override_total_target ?? SUM(target_q1..q4)
--     effectiveActual = override_total_actual ?? SUM(accomplishment_q1..q4)
--     variance        = override_variance ?? (effectiveActual - effectiveTarget)
--     rate            = override_rate ?? (effectiveActual / effectiveTarget × 100)

ALTER TABLE operation_indicators
  ADD COLUMN IF NOT EXISTS override_total_target DECIMAL(15,4) NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS override_total_actual DECIMAL(15,4) NULL DEFAULT NULL;

COMMENT ON COLUMN operation_indicators.override_total_target IS
  'Phase HA: Optional BAR1 alignment override for displayed Total Target. When set, replaces auto-sum of quarterly targets as base for variance/rate computation.';

COMMENT ON COLUMN operation_indicators.override_total_actual IS
  'Phase HA: Optional BAR1 alignment override for displayed Total Actual. When set, replaces auto-sum of quarterly actuals as base for variance/rate computation.';
