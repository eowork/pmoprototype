-- ============================================================
-- PMO Dashboard - Bootstrap Script: Staff Test User
-- Version: 1.0.0
-- Date: 2026-02-13
-- Authority: ACE Framework v2.4 - Phase 5 Implementation
-- ============================================================
--
-- Purpose: Create a Staff role user for testing draft workflow
-- Usage: Run ONCE during development/testing
--
-- IMPORTANT:
--   1. This creates a test user with password 'staff123'
--   2. Password hash generated using bcrypt (10 rounds)
--   3. User will have rank_level 80 (Clerk/Staff)
--   4. Script is idempotent (safe to run multiple times)
-- ============================================================

BEGIN;

DO $$
DECLARE
  v_user_id UUID;
  v_staff_role_id UUID;
  v_existing_user UUID;
  -- Password hash for 'staff123' using bcrypt 10 rounds
  -- Generated via: bcrypt.hashSync('staff123', 10)
  v_password_hash TEXT := '$2b$10$IdLA9jADe3jxxSVefteZRecEmJuodAatqK.XYmn.IhtmdaJGvy4Da';
BEGIN
  -- Check if Staff test user already exists
  SELECT id INTO v_existing_user
  FROM users
  WHERE username = 'staff_test'
    AND deleted_at IS NULL;

  IF v_existing_user IS NOT NULL THEN
    RAISE NOTICE 'Staff test user already exists (id: %). Skipping creation.', v_existing_user;

    -- Ensure Staff role is assigned
    SELECT id INTO v_staff_role_id
    FROM roles
    WHERE name = 'Staff'
      AND deleted_at IS NULL;

    IF v_staff_role_id IS NOT NULL THEN
      INSERT INTO user_roles (user_id, role_id, is_superadmin, assigned_by, created_by)
      VALUES (v_existing_user, v_staff_role_id, FALSE, v_existing_user, v_existing_user)
      ON CONFLICT (user_id, role_id) DO NOTHING;

      -- Ensure rank_level is set correctly
      UPDATE users SET rank_level = 80 WHERE id = v_existing_user AND rank_level IS NULL;
    END IF;

    RETURN;
  END IF;

  -- Generate new user ID
  v_user_id := gen_random_uuid();

  -- Get Staff role
  SELECT id INTO v_staff_role_id
  FROM roles
  WHERE name = 'Staff'
    AND deleted_at IS NULL;

  IF v_staff_role_id IS NULL THEN
    RAISE EXCEPTION 'Staff role not found. Please ensure roles are seeded.';
  END IF;

  -- Create Staff test user
  -- NOTE: For actual deployment, generate a proper bcrypt hash
  -- The hash below is a placeholder - replace before running
  INSERT INTO users (
    id,
    username,
    email,
    password_hash,
    first_name,
    last_name,
    rank_level,
    is_active,
    created_at
  ) VALUES (
    v_user_id,
    'staff_test',
    'staff_test@carsu.edu.ph',
    -- Bcrypt hash for 'staff123' (10 rounds)
    '$2b$10$IdLA9jADe3jxxSVefteZRecEmJuodAatqK.XYmn.IhtmdaJGvy4Da',
    'Test',
    'Staff',
    80,  -- Clerk/Staff rank
    TRUE,
    NOW()
  );

  -- Assign Staff role
  INSERT INTO user_roles (user_id, role_id, is_superadmin, assigned_by, created_by)
  VALUES (v_user_id, v_staff_role_id, FALSE, v_user_id, v_user_id);

  RAISE NOTICE 'Staff test user created successfully:';
  RAISE NOTICE '  ID: %', v_user_id;
  RAISE NOTICE '  Username: staff_test';
  RAISE NOTICE '  Email: staff_test@carsu.edu.ph';
  RAISE NOTICE '  Password: staff123 (update hash before use)';
  RAISE NOTICE '  Rank Level: 80 (Clerk/Staff)';
END $$;

-- Verification query
SELECT
  u.id,
  u.username,
  u.email,
  u.first_name || ' ' || u.last_name AS full_name,
  u.rank_level,
  r.name AS role_name,
  ur.is_superadmin
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.username = 'staff_test';

COMMIT;

-- ============================================================
-- GENERATING PASSWORD HASH
-- ============================================================
-- To generate a proper bcrypt hash for 'staff123':
--
-- Option 1: Node.js (in backend directory)
--   const bcrypt = require('bcrypt');
--   console.log(bcrypt.hashSync('staff123', 10));
--
-- Option 2: Online bcrypt generator (for testing only)
--   Use a bcrypt generator with 10 rounds
--
-- Option 3: Create user via API (recommended)
--   POST /api/users with role assignment
-- ============================================================
