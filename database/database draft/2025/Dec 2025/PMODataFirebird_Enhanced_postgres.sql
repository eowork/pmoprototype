-- PMO Monitoring & Evaluation - Enhanced Schema (PostgreSQL, Dec 2025)
-- Revised: timestamptz, soft-delete, JSONB metadata, audit-ready fields.
-- Use transactional DDL; in production, create indexes CONCURRENTLY for zero downtime.

-- ==========================================
-- ENUM TYPES
-- ==========================================
CREATE TYPE IF NOT EXISTS campus_enum AS ENUM ('MAIN', 'CABADBARAN', 'BOTH');
CREATE TYPE IF NOT EXISTS project_status_enum AS ENUM ('PLANNING', 'ONGOING', 'COMPLETED', 'ON_HOLD', 'CANCELLED');
CREATE TYPE IF NOT EXISTS repair_status_enum AS ENUM ('REPORTED', 'INSPECTED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE IF NOT EXISTS urgency_level_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE IF NOT EXISTS building_type_enum AS ENUM ('ACADEMIC', 'ADMINISTRATIVE', 'RESIDENTIAL', 'OTHER');
CREATE TYPE IF NOT EXISTS building_status_enum AS ENUM ('OPERATIONAL', 'UNDER_CONSTRUCTION', 'RENOVATION', 'CLOSED');
CREATE TYPE IF NOT EXISTS room_type_enum AS ENUM ('CLASSROOM', 'LABORATORY', 'OFFICE', 'CONFERENCE', 'AUDITORIUM', 'OTHER');
CREATE TYPE IF NOT EXISTS room_status_enum AS ENUM ('AVAILABLE', 'OCCUPIED', 'UNDER_MAINTENANCE', 'UNAVAILABLE');
CREATE TYPE IF NOT EXISTS semester_enum AS ENUM ('FIRST', 'SECOND', 'SUMMER');
CREATE TYPE IF NOT EXISTS condition_enum AS ENUM ('POOR', 'FAIR', 'GOOD', 'VERY_GOOD', 'EXCELLENT');
CREATE TYPE IF NOT EXISTS operation_type_enum AS ENUM ('HIGHER_EDUCATION', 'ADVANCED_EDUCATION', 'RESEARCH', 'TECHNICAL_ADVISORY');
CREATE TYPE IF NOT EXISTS project_type_enum AS ENUM ('CONSTRUCTION', 'REPAIR', 'RESEARCH', 'EXTENSION', 'TRAINING', 'OTHER');
CREATE TYPE IF NOT EXISTS contractor_status_enum AS ENUM ('ACTIVE', 'SUSPENDED', 'BLACKLISTED');
CREATE TYPE IF NOT EXISTS media_type_enum AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT', 'OTHER');
CREATE TYPE IF NOT EXISTS department_status_enum AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE IF NOT EXISTS setting_data_type_enum AS ENUM ('STRING','NUMBER','BOOLEAN','JSON','DATE','DATETIME');

-- ==========================================
-- TABLES (STRICT CREATION ORDER)
-- ==========================================

-- 1) roles
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- 2) users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
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

-- 3) permissions
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY,
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

-- 4) role_permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id),
  permission_id UUID NOT NULL REFERENCES permissions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  PRIMARY KEY (role_id, permission_id)
);

-- 5) user_roles
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID NOT NULL REFERENCES users(id),
  role_id UUID NOT NULL REFERENCES roles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  PRIMARY KEY (user_id, role_id)
);

-- 6) departments
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY,
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

-- 7) user_departments
CREATE TABLE IF NOT EXISTS user_departments (
  user_id UUID NOT NULL REFERENCES users(id),
  department_id UUID NOT NULL REFERENCES departments(id),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  PRIMARY KEY (user_id, department_id)
);

-- 8) funding_sources
CREATE TABLE IF NOT EXISTS funding_sources (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- 9) construction_subcategories
CREATE TABLE IF NOT EXISTS construction_subcategories (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- 10) repair_types
CREATE TABLE IF NOT EXISTS repair_types (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- 11) contractors
CREATE TABLE IF NOT EXISTS contractors (
  id UUID PRIMARY KEY,
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

-- 12) buildings
CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY,
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

-- 13) rooms
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY,
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

-- 14) projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY,
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

-- 15) construction_projects
CREATE TABLE IF NOT EXISTS construction_projects (
  id UUID PRIMARY KEY,
  infra_project_uid BIGSERIAL UNIQUE,
  project_id UUID NOT NULL UNIQUE REFERENCES projects(id),
  project_code VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
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
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);
CREATE INDEX IF NOT EXISTS idx_conproj_project_id ON construction_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_conproj_code ON construction_projects(project_code);
CREATE INDEX IF NOT EXISTS idx_conproj_contractor ON construction_projects(contractor_id);
CREATE INDEX IF NOT EXISTS idx_conproj_status ON construction_projects(status);
CREATE INDEX IF NOT EXISTS idx_conproj_start_date ON construction_projects(start_date);
CREATE INDEX IF NOT EXISTS idx_conproj_target_date ON construction_projects(target_completion_date);
CREATE INDEX IF NOT EXISTS idx_conproj_campus ON construction_projects(campus);

-- 16) repair_projects
CREATE TABLE IF NOT EXISTS repair_projects (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL UNIQUE REFERENCES projects(id),
  project_code VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  building_name VARCHAR(255) NOT NULL,
  floor_number VARCHAR(20),
  room_number VARCHAR(20),
  specific_location VARCHAR(255),
  repair_type_id UUID NOT NULL REFERENCES repair_types(id),
  urgency_level urgency_level_enum NOT NULL,
  is_emergency BOOLEAN NOT NULL DEFAULT FALSE,
  campus campus_enum NOT NULL,
  reported_by VARCHAR(255),
  reported_date DATE,
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

-- 17) construction_project_financials
CREATE TABLE IF NOT EXISTS construction_project_financials (
  id UUID PRIMARY KEY,
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

-- 18) construction_project_progress
CREATE TABLE IF NOT EXISTS construction_project_progress (
  id UUID PRIMARY KEY,
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

-- 19) construction_pow_items
CREATE TABLE IF NOT EXISTS construction_pow_items (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES construction_projects(id),
  item_number VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  unit VARCHAR(20) NOT NULL,
  quantity DECIMAL(15,2) NOT NULL,
  unit_cost DECIMAL(15,2) NOT NULL,
  total_cost DECIMAL(15,2) NOT NULL,
  category VARCHAR(100),
  phase VARCHAR(100),
  is_variation_order BOOLEAN NOT NULL DEFAULT FALSE,
  parent_item_id UUID REFERENCES construction_pow_items(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);
CREATE INDEX IF NOT EXISTS idx_cpi_project ON construction_pow_items(project_id);
CREATE INDEX IF NOT EXISTS idx_cpi_category ON construction_pow_items(category);
CREATE INDEX IF NOT EXISTS idx_cpi_phase ON construction_pow_items(phase);
CREATE INDEX IF NOT EXISTS idx_cpi_isvo ON construction_pow_items(is_variation_order);

-- 20) repair_pow_items
CREATE TABLE IF NOT EXISTS repair_pow_items (
  id UUID PRIMARY KEY,
  repair_project_id UUID NOT NULL REFERENCES repair_projects(id),
  item_number VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  unit VARCHAR(20) NOT NULL,
  quantity DECIMAL(15,2) NOT NULL,
  estimated_material_cost DECIMAL(15,2) NOT NULL,
  estimated_labor_cost DECIMAL(15,2) NOT NULL,
  estimated_project_cost DECIMAL(15,2) NOT NULL,
  unit_cost DECIMAL(15,2) NOT NULL,
  date_entry DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  phase VARCHAR(100) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);
CREATE INDEX IF NOT EXISTS idx_rpi_project ON repair_pow_items(repair_project_id);
CREATE INDEX IF NOT EXISTS idx_rpi_category ON repair_pow_items(category);
CREATE INDEX IF NOT EXISTS idx_rpi_phase ON repair_pow_items(phase);
CREATE INDEX IF NOT EXISTS idx_rpi_date ON repair_pow_items(date_entry);

-- 21) documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY,
  documentable_type VARCHAR(100) NOT NULL,
  documentable_id UUID NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  description TEXT,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);
CREATE INDEX IF NOT EXISTS idx_documents_docpair ON documents(documentable_type, documentable_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_uploader ON documents(uploaded_by);

-- 22) media
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY,
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
  uploaded_by UUID NOT NULL REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);
CREATE INDEX IF NOT EXISTS idx_media_pair ON media(mediable_type, mediable_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(media_type);
CREATE INDEX IF NOT EXISTS idx_media_featured ON media(is_featured);
CREATE INDEX IF NOT EXISTS idx_media_uploader ON media(uploaded_by);

-- 23) room_assessments
CREATE TABLE IF NOT EXISTS room_assessments (
  id UUID PRIMARY KEY,
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
-- UNIVERSITY OPERATIONS ENHANCED TABLES
-- ==========================================
-- These tables support the 4 subcategories:
-- 1. Higher Education Program
-- 2. Advanced Education Program
-- 3. Research Program
-- 4. Technical Advisory Extension Program
-- Each subcategory tracks quarterly outcome indicators with
-- physical targets, accomplishments, scores, and variance analysis.

-- 24) operation_organizational_info
-- Stores organizational context for each university operation
-- NOTE: This is optional - can be added later after operation creation
-- Some operations may not have complete organizational info initially
CREATE TABLE IF NOT EXISTS operation_organizational_info (
  id UUID PRIMARY KEY,
  operation_id UUID NOT NULL UNIQUE REFERENCES university_operations(id),
  -- All fields are nullable to allow progressive data entry
  -- Users can fill in what they have, add more later
  department VARCHAR(255), -- e.g., 'Higher Education Office', 'Research Office'
  agency_entity VARCHAR(255), -- e.g., 'Caraga State University'
  operating_unit VARCHAR(255), -- e.g., 'Project Management Unit'
  organization_code VARCHAR(100), -- e.g., 'CSU-PMU-HEP-2024'
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

-- 25) operation_indicators (Enhanced with quarterly breakdown)
-- Supports quarterly tracking (Q1-Q4) for each outcome indicator
-- 
-- INDICATOR COUNTS BY SUBCATEGORY (Based on BAR 1 for SUC):
-- - Higher Education Program: 3 indicators (static, based on BAR 1)
-- - Advanced Education Program: 3 indicators (graduate-faculty-research, graduate-students-research, accredited-graduate-programs)
-- - Research Program: 3 indicators (res_001, res_002, res_003)
-- - Technical Advisory Extension Program: 3 indicators (ext_001, ext_002, ext_003)
--
-- DATA ENTRY FLEXIBILITY:
-- - Quarterly data can be entered progressively (Q1 first, then Q2, etc.)
-- - Not all quarters need data at once - NULL values are allowed
-- - Some indicators may only need certain fields filled
-- - Subcategory-specific fields only apply to relevant operation types
-- - UACS codes may be added later if not available initially
--
-- subcategory_data JSONB structure (optional, only for Research/Extension):
--   Research: { researchOutput, publications, patents, citations, collaborations, fundingSource, researchArea }
--   Extension: { beneficiaries, communityProjects, trainingsProvided, practitioners, impactScore, communityPartners, extensionArea, targetSector }
CREATE TABLE IF NOT EXISTS operation_indicators (
  id UUID PRIMARY KEY,
  operation_id UUID NOT NULL REFERENCES university_operations(id),
  -- Core identifier - required
  particular VARCHAR(500) NOT NULL, -- Indicator description/particular
  -- Optional descriptive fields
  description TEXT, -- Detailed description (optional, can be added later)
  indicator_code VARCHAR(100), -- e.g., 'graduate-faculty-research', 'res_001', 'ext_001' (optional, for reference)
  uacs_code VARCHAR(50), -- UACS code (nullable - may not be available initially)
  fiscal_year INTEGER NOT NULL, -- Assessment year (required)
  
  -- Quarterly Physical Target (percentage) - ALL NULLABLE
  -- Data entry is progressive - users enter Q1, then Q2, etc.
  -- Not all indicators require all quarters to be filled
  target_q1 DECIMAL(5,2), -- Q1 target (0-100% or NULL)
  target_q2 DECIMAL(5,2), -- Q2 target (0-100% or NULL)
  target_q3 DECIMAL(5,2), -- Q3 target (0-100% or NULL)
  target_q4 DECIMAL(5,2), -- Q4 target (0-100% or NULL)
  
  -- Quarterly Physical Accomplishment (percentage) - ALL NULLABLE
  -- Accomplishments entered as quarters complete
  accomplishment_q1 DECIMAL(5,2), -- Q1 accomplishment (0-100% or NULL)
  accomplishment_q2 DECIMAL(5,2), -- Q2 accomplishment (0-100% or NULL)
  accomplishment_q3 DECIMAL(5,2), -- Q3 accomplishment (0-100% or NULL)
  accomplishment_q4 DECIMAL(5,2), -- Q4 accomplishment (0-100% or NULL)
  
  -- Quarterly Accomplishment Score (numerator/denominator format) - ALL NULLABLE
  -- Format: "148/200" or "N/A" or NULL
  score_q1 VARCHAR(50), -- e.g., "148/200" or "N/A"
  score_q2 VARCHAR(50),
  score_q3 VARCHAR(50),
  score_q4 VARCHAR(50),
  
  -- Calculated fields (can be computed later, nullable)
  variance_as_of DATE, -- Date when variance was calculated
  variance DECIMAL(5,2), -- Calculated variance (accomplishment - target)
  average_target DECIMAL(5,2), -- Average of non-null quarterly targets
  average_accomplishment DECIMAL(5,2), -- Average of non-null quarterly accomplishments
  
  -- Status for RBAC approval workflow (defaults to pending)
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Optional remarks
  remarks TEXT, -- Additional notes (optional)
  
  -- Subcategory-specific fields stored in JSONB (OPTIONAL)
  -- Only Research and Extension programs use this field
  -- Higher Education and Advanced Education typically don't need this
  -- Research: { researchOutput, publications, patents, citations, collaborations, fundingSource, researchArea }
  -- Extension: { beneficiaries, communityProjects, trainingsProvided, practitioners, impactScore, communityPartners, extensionArea, targetSector }
  subcategory_data JSONB,
  
  -- Audit fields
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  metadata JSONB, -- For any additional flexible data
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

-- 26) operation_financials (Enhanced with quarterly breakdown)
-- Tracks financial performance per quarter (Q1-Q4) for each operation
-- 
-- DATA ENTRY FLEXIBILITY:
-- - Financial data can be entered progressively by quarter
-- - Not all fields required at once - users can start with basic info
-- - Calculated fields (utilization rates, variance) can be computed later
-- - Some operations may not have complete financial breakdown initially
--
-- Includes allotment, target, obligation, disbursement, utilization rates
CREATE TABLE IF NOT EXISTS operation_financials (
  id UUID PRIMARY KEY,
  operation_id UUID NOT NULL REFERENCES university_operations(id),
  fiscal_year INTEGER NOT NULL, -- Required: assessment year
  quarter VARCHAR(2) CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')), -- Which quarter (nullable - can add later)
  operations_programs VARCHAR(255) NOT NULL, -- Program name (required)
  
  -- Optional organizational context
  department VARCHAR(255), -- Department name (optional)
  budget_source VARCHAR(100), -- e.g., 'Regular Agency Funds', 'Internally Generated Funds' (optional)
  
  -- Budget allocation (nullable - may not be available initially)
  allotment DECIMAL(15,2), -- Budget allocation (nullable)
  target DECIMAL(15,2), -- Target amount (nullable)
  
  -- Financial execution (default to 0, can be updated later)
  obligation DECIMAL(15,2) DEFAULT 0, -- Committed funds
  disbursement DECIMAL(15,2) DEFAULT 0, -- Actual disbursed amount
  
  -- Calculated utilization rates (nullable - computed later)
  -- These can be calculated by application logic or database triggers
  utilization_per_target DECIMAL(5,2), -- (obligation / target) * 100 (nullable)
  utilization_per_approved_budget DECIMAL(5,2), -- (obligation / allotment) * 100 (nullable)
  disbursement_rate DECIMAL(5,2), -- (disbursement / obligation) * 100 (nullable)
  
  -- Balance and variance (nullable - computed later)
  balance DECIMAL(15,2), -- Remaining balance (nullable)
  variance DECIMAL(15,2), -- target - obligation (nullable, computed)
  performance_indicator VARCHAR(255), -- Optional performance note
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'pending', 'cancelled')),
  remarks TEXT, -- Optional remarks
  
  -- Audit fields
  created_by UUID REFERENCES users(id), -- Who created (nullable for system entries)
  updated_by UUID REFERENCES users(id),
  metadata JSONB, -- For additional flexible data
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  -- Unique constraint: one record per operation/year/quarter/program combination
  UNIQUE(operation_id, fiscal_year, quarter, operations_programs)
);
CREATE INDEX IF NOT EXISTS idx_of_operation ON operation_financials(operation_id);
CREATE INDEX IF NOT EXISTS idx_of_year ON operation_financials(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_of_quarter ON operation_financials(quarter);
CREATE INDEX IF NOT EXISTS idx_of_program ON operation_financials(operations_programs);
CREATE INDEX IF NOT EXISTS idx_of_department ON operation_financials(department);
CREATE INDEX IF NOT EXISTS idx_of_status ON operation_financials(status);

-- 27) university_operations
CREATE TABLE IF NOT EXISTS university_operations (
  id UUID PRIMARY KEY,
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

-- 28) notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY,
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

-- 29) system_settings
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY,
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

-- 30) audit_trail
CREATE TABLE IF NOT EXISTS audit_trail (
  id UUID PRIMARY KEY,
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
-- DONE
-- ==========================================

