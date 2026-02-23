-- ============================================================
-- PMO Dashboard - Bootstrap Script: First SuperAdmin
-- Version: 1.0.0
-- Date: 2026-02-10
-- Authority: ACE Framework v2.4 - Phase 3 Implementation
-- ============================================================
--
-- Purpose: Assign SuperAdmin role to initial administrator
-- Usage: Run ONCE during initial deployment
--
-- IMPORTANT:
--   1. Replace 'admin@carsu.edu.ph' with actual admin email
--   2. This script is idempotent (safe to run multiple times)
--   3. Only creates SuperAdmin if none exists
-- ============================================================

BEGIN;

-- Step 1: Verify target user exists
DO $$
DECLARE
  v_user_id UUID;
  v_admin_role_id UUID;
  v_existing_superadmin INTEGER;
BEGIN
  -- Check if any SuperAdmin already exists
  SELECT COUNT(*) INTO v_existing_superadmin
  FROM user_roles
  WHERE is_superadmin = TRUE;

  IF v_existing_superadmin > 0 THEN
    RAISE NOTICE 'SuperAdmin already exists. Skipping bootstrap.';
    RETURN;
  END IF;

  -- Get the designated admin user
  -- IMPORTANT: Update this email to match your initial admin
  SELECT id INTO v_user_id
  FROM users
  WHERE email = 'admin@carsu.edu.ph'
    AND deleted_at IS NULL;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Bootstrap user not found. Please create user with email admin@carsu.edu.ph first.';
  END IF;

  -- Get Admin role
  SELECT id INTO v_admin_role_id
  FROM roles
  WHERE name = 'Admin'
    AND deleted_at IS NULL;

  IF v_admin_role_id IS NULL THEN
    RAISE EXCEPTION 'Admin role not found. Please ensure roles are seeded.';
  END IF;

  -- Assign SuperAdmin
  INSERT INTO user_roles (user_id, role_id, is_superadmin, assigned_by, created_by)
  VALUES (v_user_id, v_admin_role_id, TRUE, v_user_id, v_user_id)
  ON CONFLICT (user_id, role_id)
  DO UPDATE SET is_superadmin = TRUE;

  RAISE NOTICE 'SuperAdmin assigned successfully to user: %', v_user_id;
END $$;

-- Step 2: Verification query
SELECT
  u.id,
  u.email,
  u.username,
  u.first_name || ' ' || u.last_name AS full_name,
  r.name AS role_name,
  ur.is_superadmin
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE ur.is_superadmin = TRUE;

COMMIT;

-- ============================================================
-- Alternative: Bootstrap with specific user ID
-- ============================================================
-- If you know the user ID, use this instead:
--
-- INSERT INTO user_roles (user_id, role_id, is_superadmin, assigned_by, created_by)
-- SELECT
--   'your-user-uuid-here'::UUID,
--   r.id,
--   TRUE,
--   'your-user-uuid-here'::UUID,
--   'your-user-uuid-here'::UUID
-- FROM roles r
-- WHERE r.name = 'Admin'
-- ON CONFLICT (user_id, role_id)
-- DO UPDATE SET is_superadmin = TRUE;
-- ============================================================
