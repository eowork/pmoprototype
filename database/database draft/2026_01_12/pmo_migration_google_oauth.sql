-- ============================================================
-- PMO Dashboard - Migration: Add Google OAuth Support
-- Version: 2.4.0
-- Date: 2026-01-13
-- Execute AFTER pmo_schema_pg.sql and pmo_seed_data.sql
-- ============================================================

-- Add google_id column for Google OAuth SSO
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- Create index for google_id lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;

-- Verify column added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'google_id';
