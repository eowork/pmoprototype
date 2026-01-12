-- ============================================================
-- PMO Dashboard - Seed Data Script
-- Version: 2.3.0
-- Date: 2026-01-12
-- Execute AFTER pmo_schema_pg.sql
-- ============================================================
-- EXECUTION ORDER:
-- 1. Run pmo_schema_pg.sql first (creates tables)
-- 2. Run this script (seeds reference data)
-- ============================================================

-- ==========================================
-- 1. ROLES (Required for RBAC)
-- ==========================================
INSERT INTO roles (id, name, description) VALUES
  (gen_random_uuid(), 'Admin', 'Full system access with permission management'),
  (gen_random_uuid(), 'Staff', 'Department-level access for data entry and reporting'),
  (gen_random_uuid(), 'Client', 'Read-only access to public dashboards')
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- 2. FUNDING SOURCES (Required for Construction Projects)
-- ==========================================
INSERT INTO funding_sources (id, name, description) VALUES
  (gen_random_uuid(), 'GAA', 'General Appropriations Act - National government funding'),
  (gen_random_uuid(), 'Local', 'Locally funded projects from university budget'),
  (gen_random_uuid(), 'Special Grants', 'External grants and special funding sources'),
  (gen_random_uuid(), 'CHED', 'Commission on Higher Education funded projects'),
  (gen_random_uuid(), 'DBM', 'Department of Budget and Management allocations')
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- 3. REPAIR TYPES (Required for Repair Projects)
-- ==========================================
INSERT INTO repair_types (id, name, description) VALUES
  (gen_random_uuid(), 'Electrical', 'Electrical system repairs and maintenance'),
  (gen_random_uuid(), 'Plumbing', 'Water and drainage system repairs'),
  (gen_random_uuid(), 'Structural', 'Building structure repairs (walls, floors, ceilings)'),
  (gen_random_uuid(), 'HVAC', 'Heating, ventilation, and air conditioning repairs'),
  (gen_random_uuid(), 'Roofing', 'Roof repairs and waterproofing'),
  (gen_random_uuid(), 'Painting', 'Interior and exterior painting works'),
  (gen_random_uuid(), 'Carpentry', 'Wood and furniture repairs'),
  (gen_random_uuid(), 'IT Infrastructure', 'Network and IT equipment repairs'),
  (gen_random_uuid(), 'General Maintenance', 'General facility maintenance tasks')
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- 4. CONSTRUCTION SUBCATEGORIES
-- ==========================================
INSERT INTO construction_subcategories (id, name, description) VALUES
  (gen_random_uuid(), 'Academic Buildings', 'Classrooms, laboratories, lecture halls'),
  (gen_random_uuid(), 'Administrative Buildings', 'Offices and administrative facilities'),
  (gen_random_uuid(), 'Student Facilities', 'Dormitories, canteens, student centers'),
  (gen_random_uuid(), 'Sports Facilities', 'Gymnasiums, courts, athletic facilities'),
  (gen_random_uuid(), 'Research Facilities', 'Research centers and innovation hubs'),
  (gen_random_uuid(), 'Infrastructure', 'Roads, utilities, landscaping'),
  (gen_random_uuid(), 'Library', 'Library buildings and archives')
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- 5. CONTRACTORS (Sample Data)
-- ==========================================
INSERT INTO contractors (id, name, contact_person, email, phone, status) VALUES
  (gen_random_uuid(), 'Prime Infrastructure Builders Inc.', 'Juan Dela Cruz', 'contact@primebuilders.ph', '+63 912 345 6789', 'ACTIVE'),
  (gen_random_uuid(), 'Metro Construction Corp.', 'Maria Santos', 'info@metroconstruction.ph', '+63 923 456 7890', 'ACTIVE'),
  (gen_random_uuid(), 'BuildRight Engineering', 'Pedro Reyes', 'buildright@email.com', '+63 934 567 8901', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 6. DEPARTMENTS (Sample Data)
-- ==========================================
INSERT INTO departments (id, name, code, status) VALUES
  (gen_random_uuid(), 'Project Management Office', 'PMO', 'ACTIVE'),
  (gen_random_uuid(), 'Physical Facilities', 'PF', 'ACTIVE'),
  (gen_random_uuid(), 'Finance Office', 'FO', 'ACTIVE'),
  (gen_random_uuid(), 'Academic Affairs', 'AA', 'ACTIVE'),
  (gen_random_uuid(), 'Research and Extension', 'RES', 'ACTIVE'),
  (gen_random_uuid(), 'Gender and Development', 'GAD', 'ACTIVE'),
  (gen_random_uuid(), 'Information Technology', 'IT', 'ACTIVE')
ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 7. SYSTEM SETTINGS (Defaults)
-- ==========================================
INSERT INTO system_settings (id, setting_key, setting_value, setting_group, data_type, is_public, description) VALUES
  (gen_random_uuid(), 'app.name', 'PMO Dashboard', 'application', 'STRING', true, 'Application display name'),
  (gen_random_uuid(), 'app.version', '2.3.0', 'application', 'STRING', true, 'Current application version'),
  (gen_random_uuid(), 'app.academic_year', '2025-2026', 'application', 'STRING', true, 'Current academic year'),
  (gen_random_uuid(), 'app.campus_default', 'MAIN', 'application', 'STRING', false, 'Default campus for new records'),
  (gen_random_uuid(), 'session.timeout_minutes', '30', 'security', 'NUMBER', false, 'Session timeout in minutes'),
  (gen_random_uuid(), 'upload.max_file_size_mb', '10', 'uploads', 'NUMBER', false, 'Maximum upload file size in MB')
ON CONFLICT (setting_key) DO NOTHING;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================
-- Run these to verify seed data:

-- SELECT 'roles' AS table_name, COUNT(*) AS row_count FROM roles
-- UNION ALL SELECT 'funding_sources', COUNT(*) FROM funding_sources
-- UNION ALL SELECT 'repair_types', COUNT(*) FROM repair_types
-- UNION ALL SELECT 'construction_subcategories', COUNT(*) FROM construction_subcategories
-- UNION ALL SELECT 'contractors', COUNT(*) FROM contractors
-- UNION ALL SELECT 'departments', COUNT(*) FROM departments
-- UNION ALL SELECT 'system_settings', COUNT(*) FROM system_settings;

-- Expected Results:
-- roles: 3
-- funding_sources: 5
-- repair_types: 9
-- construction_subcategories: 7
-- contractors: 3
-- departments: 7
-- system_settings: 6

-- ==========================================
-- SEED DATA COMPLETE
-- ==========================================
