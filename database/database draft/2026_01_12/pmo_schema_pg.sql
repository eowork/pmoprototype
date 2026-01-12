-- ============================================================
-- PMO Dashboard - PostgreSQL Schema (Normalized for pgAdmin 4)
-- Version: 2.3.0
-- Date: 2026-01-12
-- Derived from: PMO_DBLATEST.sql (2026-01-09)
-- Fixes Applied: 12 critical issues from research_summary.md
-- ============================================================
-- EXECUTION: Run this entire script in pgAdmin 4 Query Tool
-- DATABASE: Create 'pmo_dashboard' database first
-- ============================================================

-- ==========================================
-- 0. EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. ENUM TYPES
-- ==========================================
DO $$ BEGIN CREATE TYPE campus_enum AS ENUM ('MAIN', 'CABADBARAN', 'BOTH'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE project_status_enum AS ENUM ('PLANNING', 'ONGOING', 'COMPLETED', 'ON_HOLD', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE repair_status_enum AS ENUM ('REPORTED', 'INSPECTED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE urgency_level_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE building_type_enum AS ENUM ('ACADEMIC', 'ADMINISTRATIVE', 'RESIDENTIAL', 'OTHER'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE building_status_enum AS ENUM ('OPERATIONAL', 'UNDER_CONSTRUCTION', 'RENOVATION', 'CLOSED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE room_type_enum AS ENUM ('CLASSROOM', 'LABORATORY', 'OFFICE', 'CONFERENCE', 'AUDITORIUM', 'OTHER'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE room_status_enum AS ENUM ('AVAILABLE', 'OCCUPIED', 'UNDER_MAINTENANCE', 'UNAVAILABLE'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE semester_enum AS ENUM ('FIRST', 'SECOND', 'SUMMER'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE condition_enum AS ENUM ('POOR', 'FAIR', 'GOOD', 'VERY_GOOD', 'EXCELLENT'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE operation_type_enum AS ENUM ('HIGHER_EDUCATION', 'ADVANCED_EDUCATION', 'RESEARCH', 'TECHNICAL_ADVISORY'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE project_type_enum AS ENUM ('CONSTRUCTION', 'REPAIR', 'RESEARCH', 'EXTENSION', 'TRAINING', 'OTHER'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE contractor_status_enum AS ENUM ('ACTIVE', 'SUSPENDED', 'BLACKLISTED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE media_type_enum AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT', 'OTHER'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE department_status_enum AS ENUM ('ACTIVE', 'INACTIVE'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE setting_data_type_enum AS ENUM ('STRING','NUMBER','BOOLEAN','JSON','DATE','DATETIME'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==========================================
-- 2. FOUNDATION TABLES (Auth & RBAC Core)
-- ==========================================

-- 2.1 roles
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- 2.2 users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  avatar_url VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  last_password_change_at TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2.3 permissions
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource);

-- 2.4 role_permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id),
  permission_id UUID NOT NULL REFERENCES permissions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  PRIMARY KEY (role_id, permission_id)
);

-- 2.5 user_roles
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  is_superadmin BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  PRIMARY KEY (user_id, role_id)
);
CREATE INDEX IF NOT EXISTS idx_user_roles_is_superadmin ON user_roles(is_superadmin) WHERE is_superadmin = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_roles_assigned_by ON user_roles(assigned_by);

-- ==========================================
-- 3. RBAC MODULE (Granular Permissions)
-- ==========================================

-- 3.1 user_page_permissions
CREATE TABLE IF NOT EXISTS user_page_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  page_id VARCHAR(100) NOT NULL,
  can_view BOOLEAN NOT NULL DEFAULT TRUE,
  can_add BOOLEAN NOT NULL DEFAULT FALSE,
  can_edit BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete BOOLEAN NOT NULL DEFAULT FALSE,
  can_approve BOOLEAN NOT NULL DEFAULT FALSE,
  can_assign_staff BOOLEAN NOT NULL DEFAULT FALSE,
  can_manage_permissions BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_by UUID NOT NULL REFERENCES users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id),
  CONSTRAINT unique_user_page_permission UNIQUE (user_id, page_id)
);
CREATE INDEX IF NOT EXISTS idx_upp_user ON user_page_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_upp_page ON user_page_permissions(page_id);

-- 3.2 university_operations_personnel
CREATE TABLE IF NOT EXISTS university_operations_personnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  can_add BOOLEAN NOT NULL DEFAULT FALSE,
  can_edit BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete BOOLEAN NOT NULL DEFAULT FALSE,
  can_approve BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_by UUID NOT NULL REFERENCES users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id),
  CONSTRAINT unique_univ_ops_personnel UNIQUE (user_id, category)
);
CREATE INDEX IF NOT EXISTS idx_uop_user ON university_operations_personnel(user_id);
CREATE INDEX IF NOT EXISTS idx_uop_category ON university_operations_personnel(category);

-- 3.3 construction_project_assignments (FK added after construction_projects)
CREATE TABLE IF NOT EXISTS construction_project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL,
  can_edit BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete BOOLEAN NOT NULL DEFAULT FALSE,
  can_view_documents BOOLEAN NOT NULL DEFAULT TRUE,
  can_upload_documents BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_by UUID NOT NULL REFERENCES users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id),
  CONSTRAINT unique_const_proj_assignment UNIQUE (user_id, project_id)
);
CREATE INDEX IF NOT EXISTS idx_cpa_user ON construction_project_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_cpa_project ON construction_project_assignments(project_id);

-- ==========================================
-- 4. RBAC FUNCTIONS & TRIGGERS
-- ==========================================

-- 4.1 Function: Check if user is SuperAdmin
CREATE OR REPLACE FUNCTION is_user_superadmin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = p_user_id
      AND is_superadmin = TRUE
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- 4.2 Function: Get Page Permission
CREATE OR REPLACE FUNCTION get_user_page_permission(
  p_user_id UUID,
  p_page_id VARCHAR(100),
  p_action VARCHAR(50)
)
RETURNS BOOLEAN AS $$
DECLARE
  v_permission RECORD;
BEGIN
  IF is_user_superadmin(p_user_id) THEN RETURN TRUE; END IF;
  SELECT * INTO v_permission FROM user_page_permissions
  WHERE user_id = p_user_id AND page_id = p_page_id AND deleted_at IS NULL;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  CASE p_action
    WHEN 'view' THEN RETURN v_permission.can_view;
    WHEN 'add' THEN RETURN v_permission.can_add;
    WHEN 'edit' THEN RETURN v_permission.can_edit;
    WHEN 'delete' THEN RETURN v_permission.can_delete;
    WHEN 'approve' THEN RETURN v_permission.can_approve;
    WHEN 'assign_staff' THEN RETURN v_permission.can_assign_staff;
    WHEN 'manage_permissions' THEN RETURN v_permission.can_manage_permissions;
    ELSE RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql STABLE;

-- 4.3 Security Trigger: Only SuperAdmins can assign permissions
CREATE OR REPLACE FUNCTION validate_permission_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT is_user_superadmin(NEW.assigned_by) THEN
    RAISE EXCEPTION 'Security Violation: Only SuperAdmin can assign permissions. User % is not authorized.', NEW.assigned_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_upp_assignment ON user_page_permissions;
CREATE TRIGGER trg_validate_upp_assignment
  BEFORE INSERT OR UPDATE ON user_page_permissions
  FOR EACH ROW EXECUTE FUNCTION validate_permission_assignment();

-- ==========================================
-- 5. ORGANIZATIONAL TABLES
-- ==========================================

-- 5.1 departments
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES departments(id),
  head_id UUID REFERENCES users(id),
  email VARCHAR(255),
  phone VARCHAR(20),
  status department_status_enum NOT NULL DEFAULT 'ACTIVE',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);
CREATE INDEX IF NOT EXISTS idx_departments_status ON departments(status);
CREATE INDEX IF NOT EXISTS idx_departments_parent ON departments(parent_id);
CREATE INDEX IF NOT EXISTS idx_departments_head ON departments(head_id);

-- 5.2 user_departments
CREATE TABLE IF NOT EXISTS user_departments (
  user_id UUID NOT NULL REFERENCES users(id),
  department_id UUID NOT NULL REFERENCES departments(id),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  PRIMARY KEY (user_id, department_id)
);

-- ==========================================
-- 6. LOOKUP TABLES
-- ==========================================

-- 6.1 funding_sources
CREATE TABLE IF NOT EXISTS funding_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- 6.2 construction_subcategories
CREATE TABLE IF NOT EXISTS construction_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- 6.3 repair_types
CREATE TABLE IF NOT EXISTS repair_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- 6.4 contractors
CREATE TABLE IF NOT EXISTS contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  tin_number VARCHAR(50),
  registration_number VARCHAR(100),
  validity_date DATE,
  status contractor_status_enum NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);
CREATE INDEX IF NOT EXISTS idx_contractors_name ON contractors(name);
CREATE INDEX IF NOT EXISTS idx_contractors_status ON contractors(status);

-- ==========================================
-- 7. FACILITIES & BUILDINGS
-- ==========================================

-- 7.1 buildings
CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  code VARCHAR(50) UNIQUE,
  campus campus_enum NOT NULL,
  building_type building_type_enum NOT NULL,
  year_built INTEGER,
  total_floors INTEGER,
  total_area DECIMAL(10,2),
  status building_status_enum NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);
CREATE INDEX IF NOT EXISTS idx_buildings_name ON buildings(name);
CREATE INDEX IF NOT EXISTS idx_buildings_campus ON buildings(campus);
CREATE INDEX IF NOT EXISTS idx_buildings_type ON buildings(building_type);
CREATE INDEX IF NOT EXISTS idx_buildings_status ON buildings(status);

-- 7.2 rooms
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES buildings(id),
  room_number VARCHAR(20) NOT NULL,
  floor_number INTEGER NOT NULL,
  room_type room_type_enum NOT NULL,
  capacity INTEGER,
  area DECIMAL(10,2),
  status room_status_enum NOT NULL,
  is_airconditioned BOOLEAN DEFAULT FALSE,
  has_projector BOOLEAN DEFAULT FALSE,
  has_whiteboard BOOLEAN DEFAULT TRUE,
  is_wheelchair_accessible BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);
CREATE INDEX IF NOT EXISTS idx_rooms_building ON rooms(building_id);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);

-- 7.3 facilities (Lean Strategy)
CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_name VARCHAR(100) NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  facility_type VARCHAR(50) DEFAULT 'Classroom',
  campus campus_enum DEFAULT 'MAIN',
  capacity INTEGER,
  floor_area_sqm DECIMAL(10,2),
  condition_rating condition_enum DEFAULT 'GOOD',
  features_list JSONB DEFAULT '[]'::jsonb,
  is_operational BOOLEAN DEFAULT TRUE,
  last_inspected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7.4 room_assessments
CREATE TABLE IF NOT EXISTS room_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id),
  assessment_date DATE NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  semester semester_enum NOT NULL,
  subject_code VARCHAR(50),
  subject_description VARCHAR(255),
  number_of_students INTEGER,
  class_schedule TEXT,
  functionality_score INTEGER,
  utility_systems_score INTEGER,
  sanitation_score INTEGER,
  equipment_score INTEGER,
  furniture_score INTEGER,
  space_management_score INTEGER,
  safety_score INTEGER,
  overall_score DECIMAL(5,2),
  overall_condition condition_enum,
  functionality_details JSON,
  utility_systems_details JSON,
  sanitation_details JSON,
  equipment_details JSON,
  furniture_details JSON,
  space_management_details JSON,
  safety_details JSON,
  assessor_id UUID NOT NULL REFERENCES users(id),
  assessor_position VARCHAR(100),
  remarks TEXT,
  recommended_actions TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);
CREATE INDEX IF NOT EXISTS idx_rass_room ON room_assessments(room_id);
CREATE INDEX IF NOT EXISTS idx_rass_date ON room_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_rass_ay ON room_assessments(academic_year);
CREATE INDEX IF NOT EXISTS idx_rass_sem ON room_assessments(semester);
CREATE INDEX IF NOT EXISTS idx_rass_assessor ON room_assessments(assessor_id);

-- ==========================================
-- 8. PROJECTS (Core)
-- ==========================================

-- 8.1 projects (Base)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  project_type project_type_enum NOT NULL,
  start_date DATE,
  end_date DATE,
  status project_status_enum NOT NULL,
  budget DECIMAL(15,2),
  campus campus_enum NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_campus ON projects(campus);

-- 8.2 construction_projects
CREATE TABLE IF NOT EXISTS construction_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  infra_project_uid BIGSERIAL UNIQUE,
  project_id UUID NOT NULL UNIQUE REFERENCES projects(id),
  project_code VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  ideal_infrastructure_image VARCHAR(255),
  beneficiaries VARCHAR(255),
  objectives JSONB,
  key_features JSONB,
  original_contract_duration VARCHAR(100),
  contract_number VARCHAR(50),
  contractor_id UUID REFERENCES contractors(id),
  contract_amount DECIMAL(15,2),
  start_date DATE,
  target_completion_date DATE,
  actual_completion_date DATE,
  project_duration VARCHAR(100),
  project_engineer VARCHAR(255),
  project_manager VARCHAR(255),
  location_coordinates POINT,
  building_type VARCHAR(100),
  floor_area DECIMAL(10,2),
  number_of_floors INTEGER,
  funding_source_id UUID NOT NULL REFERENCES funding_sources(id),
  subcategory_id UUID REFERENCES construction_subcategories(id),
  campus campus_enum NOT NULL,
  status project_status_enum NOT NULL,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  physical_progress DECIMAL(5,2) DEFAULT 0.00,
  financial_progress DECIMAL(5,2) DEFAULT 0.00,
  timeline_data JSONB DEFAULT '[]'::jsonb,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_conproj_project_id ON construction_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_conproj_code ON construction_projects(project_code);
CREATE INDEX IF NOT EXISTS idx_conproj_contractor ON construction_projects(contractor_id);
CREATE INDEX IF NOT EXISTS idx_conproj_status ON construction_projects(status);
CREATE INDEX IF NOT EXISTS idx_conproj_start_date ON construction_projects(start_date);
CREATE INDEX IF NOT EXISTS idx_conproj_target_date ON construction_projects(target_completion_date);
CREATE INDEX IF NOT EXISTS idx_conproj_campus ON construction_projects(campus);

-- Add FK constraint for construction_project_assignments
ALTER TABLE construction_project_assignments
  ADD CONSTRAINT fk_cpa_project
  FOREIGN KEY (project_id) REFERENCES construction_projects(id) ON DELETE CASCADE;

-- ==========================================
-- 9. CONSTRUCTION DETAIL TABLES
-- ==========================================

-- 9.1 construction_milestones (Single Definition)
CREATE TABLE IF NOT EXISTS construction_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_date DATE,
  actual_date DATE,
  status VARCHAR(50) DEFAULT 'PENDING',
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9.2 construction_gallery (Single Definition)
CREATE TABLE IF NOT EXISTS construction_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  caption VARCHAR(255),
  category VARCHAR(50) DEFAULT 'PROGRESS',
  is_featured BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9.3 construction_project_financials
CREATE TABLE IF NOT EXISTS construction_project_financials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES construction_projects(id),
  fiscal_year INTEGER NOT NULL,
  appropriation DECIMAL(15,2) NOT NULL,
  obligation DECIMAL(15,2) NOT NULL,
  disbursement DECIMAL(15,2) DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);
CREATE INDEX IF NOT EXISTS idx_cpf_project ON construction_project_financials(project_id);
CREATE INDEX IF NOT EXISTS idx_cpf_year ON construction_project_financials(fiscal_year);

-- 9.4 construction_project_progress
CREATE TABLE IF NOT EXISTS construction_project_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES construction_projects(id),
  report_date DATE NOT NULL,
  physical_progress_percentage DECIMAL(5,2) NOT NULL,
  financial_progress_percentage DECIMAL(5,2) NOT NULL,
  time_elapsed_percentage DECIMAL(5,2) NOT NULL,
  slippage_percentage DECIMAL(5,2),
  remarks TEXT,
  reported_by UUID NOT NULL REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);
CREATE INDEX IF NOT EXISTS idx_cpp_project ON construction_project_progress(project_id);
CREATE INDEX IF NOT EXISTS idx_cpp_date ON construction_project_progress(report_date);

-- 9.5 construction_pow_items
CREATE TABLE IF NOT EXISTS construction_pow_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES construction_projects(id),
  item_number VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  unit VARCHAR(20) NOT NULL,
  quantity DECIMAL(15,2) NOT NULL,
  estimated_material_cost DECIMAL(15,2),
  estimated_labor_cost DECIMAL(15,2),
  unit_cost DECIMAL(15,2) NOT NULL,
  total_cost DECIMAL(15,2) NOT NULL,
  is_unit_cost_overridden BOOLEAN DEFAULT FALSE,
  date_entry DATE,
  status VARCHAR(50) DEFAULT 'Active',
  remarks TEXT,
  category VARCHAR(100),
  phase VARCHAR(100),
  is_variation_order BOOLEAN NOT NULL DEFAULT FALSE,
  parent_item_id UUID REFERENCES construction_pow_items(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_cpi_project ON construction_pow_items(project_id);
CREATE INDEX IF NOT EXISTS idx_cpi_category ON construction_pow_items(category);
CREATE INDEX IF NOT EXISTS idx_cpi_phase ON construction_pow_items(phase);
CREATE INDEX IF NOT EXISTS idx_cpi_isvo ON construction_pow_items(is_variation_order);

-- 9.6 construction_project_accomplishment_records
CREATE TABLE IF NOT EXISTS construction_project_accomplishment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES construction_projects(id),
  date_entry DATE NOT NULL,
  comments TEXT,
  remarks_comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 9.7 construction_project_actual_accomplishment_records
CREATE TABLE IF NOT EXISTS construction_project_actual_accomplishment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES construction_projects(id),
  date_entry DATE NOT NULL,
  progress_accomplishment DECIMAL(5,2),
  actual_percent DECIMAL(5,2),
  target_percent DECIMAL(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 9.8 construction_project_progress_summaries
CREATE TABLE IF NOT EXISTS construction_project_progress_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES construction_projects(id),
  period VARCHAR(50) NOT NULL,
  physical_progress DECIMAL(5,2),
  financial_progress DECIMAL(5,2),
  issues TEXT,
  recommendations TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 9.9 construction_project_financial_reports
CREATE TABLE IF NOT EXISTS construction_project_financial_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES construction_projects(id),
  report_title VARCHAR(255) NOT NULL,
  report_date DATE NOT NULL,
  target_budget DECIMAL(15,2),
  actual_spent DECIMAL(15,2),
  status VARCHAR(50),
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 9.10 construction_project_phases
CREATE TABLE IF NOT EXISTS construction_project_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES construction_projects(id),
  phase_name VARCHAR(100) NOT NULL,
  phase_description TEXT,
  target_progress DECIMAL(5,2),
  actual_progress DECIMAL(5,2),
  status VARCHAR(50),
  target_start_date DATE,
  target_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 9.11 construction_project_milestones (detailed version)
CREATE TABLE IF NOT EXISTS construction_project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES construction_projects(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  status VARCHAR(50),
  progress DECIMAL(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 9.12 construction_project_team_members
CREATE TABLE IF NOT EXISTS construction_project_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES construction_projects(id),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  responsibilities TEXT,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ==========================================
-- 10. REPAIR PROJECTS
-- ==========================================

-- 10.1 repair_projects (Fixed: removed duplicate columns)
CREATE TABLE IF NOT EXISTS repair_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES projects(id),
  project_code VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  building_name VARCHAR(255) NOT NULL,
  floor_number VARCHAR(20),
  room_number VARCHAR(20),
  specific_location VARCHAR(255),
  repair_type_id UUID NOT NULL REFERENCES repair_types(id),
  urgency_level urgency_level_enum NOT NULL DEFAULT 'LOW',
  is_emergency BOOLEAN NOT NULL DEFAULT FALSE,
  campus campus_enum NOT NULL,
  reported_by VARCHAR(255),
  reported_date TIMESTAMPTZ DEFAULT NOW(),
  inspection_date DATE,
  inspector_id UUID REFERENCES users(id),
  inspection_findings TEXT,
  status repair_status_enum NOT NULL,
  start_date DATE,
  end_date DATE,
  budget DECIMAL(15,2),
  project_manager_id UUID REFERENCES users(id),
  contractor_id UUID REFERENCES contractors(id),
  completion_date DATE,
  facility_id UUID REFERENCES facilities(id),
  assigned_technician VARCHAR(255),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);
CREATE INDEX IF NOT EXISTS idx_repairs_building ON repair_projects(building_name);
CREATE INDEX IF NOT EXISTS idx_repairs_type ON repair_projects(repair_type_id);
CREATE INDEX IF NOT EXISTS idx_repairs_status ON repair_projects(status);
CREATE INDEX IF NOT EXISTS idx_repairs_campus ON repair_projects(campus);
CREATE INDEX IF NOT EXISTS idx_repairs_emergency ON repair_projects(is_emergency);

-- 10.2 repair_pow_items
CREATE TABLE IF NOT EXISTS repair_pow_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_project_id UUID NOT NULL REFERENCES repair_projects(id),
  item_number VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  unit VARCHAR(20) NOT NULL,
  quantity DECIMAL(15,2) NOT NULL,
  estimated_material_cost DECIMAL(15,2) NOT NULL,
  estimated_labor_cost DECIMAL(15,2) NOT NULL,
  estimated_project_cost DECIMAL(15,2) NOT NULL,
  unit_cost DECIMAL(15,2) NOT NULL,
  is_unit_cost_overridden BOOLEAN DEFAULT FALSE,
  date_entry DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'Active',
  remarks TEXT,
  category VARCHAR(100) NOT NULL,
  phase VARCHAR(100) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_rpi_project ON repair_pow_items(repair_project_id);
CREATE INDEX IF NOT EXISTS idx_rpi_category ON repair_pow_items(category);
CREATE INDEX IF NOT EXISTS idx_rpi_phase ON repair_pow_items(phase);
CREATE INDEX IF NOT EXISTS idx_rpi_date ON repair_pow_items(date_entry);

-- 10.3 repair_project_financial_reports
CREATE TABLE IF NOT EXISTS repair_project_financial_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_project_id UUID NOT NULL REFERENCES repair_projects(id),
  report_title VARCHAR(255) NOT NULL,
  report_date DATE NOT NULL,
  target_budget DECIMAL(15,2),
  actual_spent DECIMAL(15,2),
  status VARCHAR(50),
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 10.4 repair_project_phases
CREATE TABLE IF NOT EXISTS repair_project_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_project_id UUID NOT NULL REFERENCES repair_projects(id),
  phase_name VARCHAR(100) NOT NULL,
  phase_description TEXT,
  target_progress DECIMAL(5,2),
  actual_progress DECIMAL(5,2),
  status VARCHAR(50),
  target_start_date DATE,
  target_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 10.5 repair_project_accomplishment_records
CREATE TABLE IF NOT EXISTS repair_project_accomplishment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_project_id UUID NOT NULL REFERENCES repair_projects(id),
  date_entry DATE NOT NULL,
  comments TEXT,
  remarks_comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 10.6 repair_project_actual_accomplishment_records
CREATE TABLE IF NOT EXISTS repair_project_actual_accomplishment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_project_id UUID NOT NULL REFERENCES repair_projects(id),
  date_entry DATE NOT NULL,
  progress_accomplishment DECIMAL(5,2),
  actual_percent DECIMAL(5,2),
  target_percent DECIMAL(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 10.7 repair_project_progress_summaries
CREATE TABLE IF NOT EXISTS repair_project_progress_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_project_id UUID NOT NULL REFERENCES repair_projects(id),
  period VARCHAR(50) NOT NULL,
  physical_progress DECIMAL(5,2),
  financial_progress DECIMAL(5,2),
  issues TEXT,
  recommendations TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 10.8 repair_project_milestones
CREATE TABLE IF NOT EXISTS repair_project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_project_id UUID NOT NULL REFERENCES repair_projects(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  status VARCHAR(50),
  progress DECIMAL(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 10.9 repair_project_team_members
CREATE TABLE IF NOT EXISTS repair_project_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_project_id UUID NOT NULL REFERENCES repair_projects(id),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  responsibilities TEXT,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ==========================================
-- 11. UNIVERSITY OPERATIONS (Moved before dependent tables)
-- ==========================================

-- 11.1 university_operations
CREATE TABLE IF NOT EXISTS university_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type operation_type_enum NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  code VARCHAR(50) UNIQUE,
  start_date DATE,
  end_date DATE,
  status project_status_enum NOT NULL,
  budget DECIMAL(15,2),
  campus campus_enum NOT NULL,
  coordinator_id UUID REFERENCES users(id),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);
CREATE INDEX IF NOT EXISTS idx_univ_ops_type ON university_operations(operation_type);
CREATE INDEX IF NOT EXISTS idx_univ_ops_status ON university_operations(status);
CREATE INDEX IF NOT EXISTS idx_univ_ops_campus ON university_operations(campus);
CREATE INDEX IF NOT EXISTS idx_univ_ops_coordinator ON university_operations(coordinator_id);

-- 11.2 university_statistics (Single Definition)
CREATE TABLE IF NOT EXISTS university_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year INTEGER NOT NULL,
  enrolled_students INTEGER DEFAULT 0,
  graduates_count INTEGER DEFAULT 0,
  research_projects_count INTEGER DEFAULT 0,
  extension_beneficiaries INTEGER DEFAULT 0,
  programs_offered INTEGER DEFAULT 0,
  research_projects_active INTEGER DEFAULT 0,
  research_publications INTEGER DEFAULT 0,
  research_budget_utilized DECIMAL(15,2),
  total_research_budget DECIMAL(15,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uniq_academic_year UNIQUE (academic_year)
);

-- 11.3 operation_organizational_info
CREATE TABLE IF NOT EXISTS operation_organizational_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id UUID NOT NULL UNIQUE REFERENCES university_operations(id),
  department VARCHAR(255),
  agency_entity VARCHAR(255),
  operating_unit VARCHAR(255),
  organization_code VARCHAR(100),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);
CREATE INDEX IF NOT EXISTS idx_ooi_operation ON operation_organizational_info(operation_id);
CREATE INDEX IF NOT EXISTS idx_ooi_department ON operation_organizational_info(department);
CREATE INDEX IF NOT EXISTS idx_ooi_org_code ON operation_organizational_info(organization_code);

-- 11.4 operation_indicators
CREATE TABLE IF NOT EXISTS operation_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id UUID NOT NULL REFERENCES university_operations(id),
  particular VARCHAR(500) NOT NULL,
  description TEXT,
  indicator_code VARCHAR(100),
  uacs_code VARCHAR(50),
  fiscal_year INTEGER NOT NULL,
  target_q1 DECIMAL(5,2),
  target_q2 DECIMAL(5,2),
  target_q3 DECIMAL(5,2),
  target_q4 DECIMAL(5,2),
  accomplishment_q1 DECIMAL(5,2),
  accomplishment_q2 DECIMAL(5,2),
  accomplishment_q3 DECIMAL(5,2),
  accomplishment_q4 DECIMAL(5,2),
  score_q1 VARCHAR(50),
  score_q2 VARCHAR(50),
  score_q3 VARCHAR(50),
  score_q4 VARCHAR(50),
  variance_as_of DATE,
  variance DECIMAL(5,2),
  average_target DECIMAL(5,2),
  average_accomplishment DECIMAL(5,2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  remarks TEXT,
  subcategory_data JSONB,
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);
CREATE INDEX IF NOT EXISTS idx_oi_operation ON operation_indicators(operation_id);
CREATE INDEX IF NOT EXISTS idx_oi_code ON operation_indicators(indicator_code);
CREATE INDEX IF NOT EXISTS idx_oi_uacs ON operation_indicators(uacs_code);
CREATE INDEX IF NOT EXISTS idx_oi_year ON operation_indicators(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_oi_status ON operation_indicators(status);
CREATE INDEX IF NOT EXISTS idx_oi_created_by ON operation_indicators(created_by);
CREATE INDEX IF NOT EXISTS idx_oi_subcategory_data ON operation_indicators USING GIN(subcategory_data);

-- 11.5 operation_financials
CREATE TABLE IF NOT EXISTS operation_financials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id UUID NOT NULL REFERENCES university_operations(id),
  fiscal_year INTEGER NOT NULL,
  quarter VARCHAR(2) CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
  operations_programs VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  budget_source VARCHAR(100),
  allotment DECIMAL(15,2),
  target DECIMAL(15,2),
  obligation DECIMAL(15,2) DEFAULT 0,
  disbursement DECIMAL(15,2) DEFAULT 0,
  utilization_per_target DECIMAL(5,2),
  utilization_per_approved_budget DECIMAL(5,2),
  disbursement_rate DECIMAL(5,2),
  balance DECIMAL(15,2),
  variance DECIMAL(15,2),
  performance_indicator VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'pending', 'cancelled')),
  remarks TEXT,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  UNIQUE(operation_id, fiscal_year, quarter, operations_programs)
);
CREATE INDEX IF NOT EXISTS idx_of_operation ON operation_financials(operation_id);
CREATE INDEX IF NOT EXISTS idx_of_year ON operation_financials(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_of_quarter ON operation_financials(quarter);
CREATE INDEX IF NOT EXISTS idx_of_program ON operation_financials(operations_programs);
CREATE INDEX IF NOT EXISTS idx_of_department ON operation_financials(department);
CREATE INDEX IF NOT EXISTS idx_of_status ON operation_financials(status);

-- ==========================================
-- 12. DOCUMENTS & MEDIA
-- ==========================================

-- 12.1 documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  documentable_type VARCHAR(100) NOT NULL,
  documentable_id UUID NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  description TEXT,
  version INTEGER DEFAULT 1,
  category VARCHAR(50),
  extracted_text TEXT,
  chunks JSONB,
  processed_at TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'ready',
  uploaded_by UUID NOT NULL REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_documents_docpair ON documents(documentable_type, documentable_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_uploader ON documents(uploaded_by);

-- 12.2 media
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mediable_type VARCHAR(100) NOT NULL,
  mediable_id UUID NOT NULL,
  media_type media_type_enum NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  alt_text VARCHAR(255),
  is_featured BOOLEAN DEFAULT FALSE,
  thumbnail_url VARCHAR(255),
  dimensions JSONB,
  tags JSONB,
  capture_date DATE,
  display_order INTEGER DEFAULT 0,
  location JSONB,
  project_type VARCHAR(50),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_media_pair ON media(mediable_type, mediable_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(media_type);
CREATE INDEX IF NOT EXISTS idx_media_featured ON media(is_featured);
CREATE INDEX IF NOT EXISTS idx_media_uploader ON media(uploaded_by);

-- ==========================================
-- 13. GOVERNANCE MODULE
-- ==========================================

-- 13.1 policies (Single Definition - Full)
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  policy_number VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  valid_from DATE NOT NULL,
  valid_until DATE,
  issuing_authority VARCHAR(255),
  version_number VARCHAR(20),
  effective_date DATE,
  file_url VARCHAR(500),
  document_id UUID REFERENCES documents(id),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);
CREATE INDEX IF NOT EXISTS idx_policies_validity ON policies(valid_from, valid_until);

-- 13.2 forms_inventory
CREATE TABLE IF NOT EXISTS forms_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  form_code VARCHAR(100) UNIQUE,
  description TEXT,
  category VARCHAR(100),
  revision_number VARCHAR(20) DEFAULT '1.0',
  is_active BOOLEAN DEFAULT TRUE,
  document_id UUID REFERENCES documents(id),
  owning_department_id UUID REFERENCES departments(id),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_forms_code ON forms_inventory(form_code);
CREATE INDEX IF NOT EXISTS idx_forms_dept ON forms_inventory(owning_department_id);

-- 13.3 downloadable_forms
CREATE TABLE IF NOT EXISTS downloadable_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_title VARCHAR(255) NOT NULL,
  department_owner VARCHAR(100),
  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(10),
  file_size_display VARCHAR(20),
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 14. GAD PARITY MODULE
-- ==========================================

-- 14.1 gad_student_parity_data
CREATE TABLE IF NOT EXISTS gad_student_parity_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year VARCHAR(20) NOT NULL,
  program VARCHAR(100) NOT NULL,
  admission_male INTEGER DEFAULT 0,
  admission_female INTEGER DEFAULT 0,
  graduation_male INTEGER DEFAULT 0,
  graduation_female INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  submitted_by UUID REFERENCES users(id),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 14.2 gad_faculty_parity_data
CREATE TABLE IF NOT EXISTS gad_faculty_parity_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year VARCHAR(20) NOT NULL,
  college VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  total_faculty INTEGER DEFAULT 0,
  male_count INTEGER DEFAULT 0,
  female_count INTEGER DEFAULT 0,
  gender_balance VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  submitted_by UUID REFERENCES users(id),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 14.3 gad_staff_parity_data
CREATE TABLE IF NOT EXISTS gad_staff_parity_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year VARCHAR(20) NOT NULL,
  department VARCHAR(100) NOT NULL,
  staff_category VARCHAR(50) NOT NULL,
  total_staff INTEGER DEFAULT 0,
  male_count INTEGER DEFAULT 0,
  female_count INTEGER DEFAULT 0,
  gender_balance VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  submitted_by UUID REFERENCES users(id),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 14.4 gad_pwd_parity_data
CREATE TABLE IF NOT EXISTS gad_pwd_parity_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year VARCHAR(20) NOT NULL,
  pwd_category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(100),
  total_beneficiaries INTEGER DEFAULT 0,
  male_count INTEGER DEFAULT 0,
  female_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  submitted_by UUID REFERENCES users(id),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 14.5 gad_indigenous_parity_data
CREATE TABLE IF NOT EXISTS gad_indigenous_parity_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year VARCHAR(20) NOT NULL,
  indigenous_category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(100),
  total_participants INTEGER DEFAULT 0,
  male_count INTEGER DEFAULT 0,
  female_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  submitted_by UUID REFERENCES users(id),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 14.6 gad_gpb_accomplishments
CREATE TABLE IF NOT EXISTS gad_gpb_accomplishments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  priority VARCHAR(20),
  status VARCHAR(50),
  target_beneficiaries INTEGER,
  actual_beneficiaries INTEGER,
  target_budget DECIMAL(12,2),
  actual_budget DECIMAL(12,2),
  year VARCHAR(4),
  responsible VARCHAR(255),
  data_status VARCHAR(50) DEFAULT 'pending',
  submitted_by UUID REFERENCES users(id),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 14.7 gad_budget_plans
CREATE TABLE IF NOT EXISTS gad_budget_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  priority VARCHAR(20),
  status VARCHAR(50),
  budget_allocated DECIMAL(12,2),
  budget_utilized DECIMAL(12,2),
  target_beneficiaries INTEGER,
  start_date DATE,
  end_date DATE,
  year VARCHAR(4),
  responsible VARCHAR(255),
  data_status VARCHAR(50) DEFAULT 'pending',
  submitted_by UUID REFERENCES users(id),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 14.8 gad_yearly_profiles
CREATE TABLE IF NOT EXISTS gad_yearly_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year INTEGER NOT NULL UNIQUE,
  student_statistics JSONB DEFAULT '{}'::jsonb,
  faculty_statistics JSONB DEFAULT '{}'::jsonb,
  staff_statistics JSONB DEFAULT '{}'::jsonb,
  key_insights JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 15. SYSTEM TABLES
-- ==========================================

-- 15.1 notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  action_url VARCHAR(255),
  related_entity_type VARCHAR(100),
  related_entity_id UUID,
  created_by UUID REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON notifications(related_entity_type, related_entity_id);

-- 15.2 system_settings
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  setting_group VARCHAR(50) NOT NULL,
  data_type setting_data_type_enum NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  description TEXT,
  updated_by UUID REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);
CREATE INDEX IF NOT EXISTS idx_sys_settings_group ON system_settings(setting_group);

-- 15.3 audit_trail
CREATE TABLE IF NOT EXISTS audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_id UUID REFERENCES users(id),
  actor_department_id UUID REFERENCES departments(id),
  actor_position VARCHAR(100),
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  action_type VARCHAR(50) NOT NULL,
  delta JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  correlation_id UUID,
  metadata JSONB
);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_trail(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_trail(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_occurred ON audit_trail(occurred_at);
CREATE INDEX IF NOT EXISTS idx_audit_correlation ON audit_trail(correlation_id);

-- ==========================================
-- SCHEMA COMPLETE
-- ==========================================
-- Tables: 53
-- ENUMs: 16
-- Functions: 3
-- Triggers: 1
-- Indexes: 70+
-- ==========================================
