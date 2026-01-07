-- PMO Monitoring & Evaluation - V1 Minimal Schema (PostgreSQL)
-- Generated from PMODataFirebird_v1_minimal.dbml
-- Strict creation order and enum definitions included

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

-- ==========================================
-- TABLES (ORDERED)
-- ==========================================

-- 1) roles
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
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
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_password_change_at TIMESTAMP,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- 3) projects
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
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_projects_project_type ON projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_campus ON projects(campus);

-- 4) contractors
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
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contractors_name ON contractors(name);
CREATE INDEX IF NOT EXISTS idx_contractors_status ON contractors(status);

-- 5) funding_sources
CREATE TABLE IF NOT EXISTS funding_sources (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 6) construction_subcategories
CREATE TABLE IF NOT EXISTS construction_subcategories (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 7) repair_types
CREATE TABLE IF NOT EXISTS repair_types (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 8) buildings
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
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_buildings_campus ON buildings(campus);
CREATE INDEX IF NOT EXISTS idx_buildings_building_type ON buildings(building_type);
CREATE INDEX IF NOT EXISTS idx_buildings_status ON buildings(status);

-- 9) departments
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
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);
CREATE INDEX IF NOT EXISTS idx_departments_status ON departments(status);
CREATE INDEX IF NOT EXISTS idx_departments_parent ON departments(parent_id);
CREATE INDEX IF NOT EXISTS idx_departments_head ON departments(head_id);

-- 10) university_operations
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
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_univ_ops_type ON university_operations(operation_type);
CREATE INDEX IF NOT EXISTS idx_univ_ops_status ON university_operations(status);
CREATE INDEX IF NOT EXISTS idx_univ_ops_campus ON university_operations(campus);
CREATE INDEX IF NOT EXISTS idx_univ_ops_coordinator ON university_operations(coordinator_id);

-- 11) documents
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
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_documents_docpair ON documents(documentable_type, documentable_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_uploader ON documents(uploaded_by);

-- 12) media
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
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_media_pair ON media(mediable_type, mediable_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(media_type);
CREATE INDEX IF NOT EXISTS idx_media_featured ON media(is_featured);
CREATE INDEX IF NOT EXISTS idx_media_uploader ON media(uploaded_by);

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
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rooms_building ON rooms(building_id);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);

-- 14) construction_projects
CREATE TABLE IF NOT EXISTS construction_projects (
  id UUID PRIMARY KEY,
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
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_conproj_project_id ON construction_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_conproj_code ON construction_projects(project_code);
CREATE INDEX IF NOT EXISTS idx_conproj_contractor ON construction_projects(contractor_id);
CREATE INDEX IF NOT EXISTS idx_conproj_status ON construction_projects(status);
CREATE INDEX IF NOT EXISTS idx_conproj_start_date ON construction_projects(start_date);
CREATE INDEX IF NOT EXISTS idx_conproj_target_date ON construction_projects(target_completion_date);
CREATE INDEX IF NOT EXISTS idx_conproj_campus ON construction_projects(campus);

-- 15) repair_projects
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
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_repairs_building ON repair_projects(building_name);
CREATE INDEX IF NOT EXISTS idx_repairs_type ON repair_projects(repair_type_id);
CREATE INDEX IF NOT EXISTS idx_repairs_status ON repair_projects(status);
CREATE INDEX IF NOT EXISTS idx_repairs_campus ON repair_projects(campus);
CREATE INDEX IF NOT EXISTS idx_repairs_emergency ON repair_projects(is_emergency);

-- 16) user_roles
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID NOT NULL REFERENCES users(id),
  role_id UUID NOT NULL REFERENCES roles(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- 17) user_departments
CREATE TABLE IF NOT EXISTS user_departments (
  user_id UUID NOT NULL REFERENCES users(id),
  department_id UUID NOT NULL REFERENCES departments(id),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, department_id)
);

-- 18) room_assessments
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
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rass_room ON room_assessments(room_id);
CREATE INDEX IF NOT EXISTS idx_rass_date ON room_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_rass_ay ON room_assessments(academic_year);
CREATE INDEX IF NOT EXISTS idx_rass_sem ON room_assessments(semester);
CREATE INDEX IF NOT EXISTS idx_rass_assessor ON room_assessments(assessor_id);

-- 19) construction_project_financials
CREATE TABLE IF NOT EXISTS construction_project_financials (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES construction_projects(id),
  fiscal_year INTEGER NOT NULL,
  appropriation DECIMAL(15,2) NOT NULL,
  obligation DECIMAL(15,2) NOT NULL,
  disbursement DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cpf_project ON construction_project_financials(project_id);
CREATE INDEX IF NOT EXISTS idx_cpf_year ON construction_project_financials(fiscal_year);

-- 20) construction_project_progress
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
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cpp_project ON construction_project_progress(project_id);
CREATE INDEX IF NOT EXISTS idx_cpp_date ON construction_project_progress(report_date);

-- 21) construction_pow_items
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
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cpi_project ON construction_pow_items(project_id);
CREATE INDEX IF NOT EXISTS idx_cpi_category ON construction_pow_items(category);
CREATE INDEX IF NOT EXISTS idx_cpi_phase ON construction_pow_items(phase);
CREATE INDEX IF NOT EXISTS idx_cpi_is_vo ON construction_pow_items(is_variation_order);

-- 22) repair_pow_items
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
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rpi_project ON repair_pow_items(repair_project_id);
CREATE INDEX IF NOT EXISTS idx_rpi_category ON repair_pow_items(category);
CREATE INDEX IF NOT EXISTS idx_rpi_phase ON repair_pow_items(phase);
CREATE INDEX IF NOT EXISTS idx_rpi_date ON repair_pow_items(date_entry);

-- 23) operation_indicators
CREATE TABLE IF NOT EXISTS operation_indicators (
  id UUID PRIMARY KEY,
  operation_id UUID NOT NULL REFERENCES university_operations(id),
  indicator_type VARCHAR(100) NOT NULL,
  fiscal_year INTEGER NOT NULL,
  target_value DECIMAL(15,2),
  actual_value DECIMAL(15,2),
  achievement_percentage DECIMAL(5,2),
  remarks TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_oi_operation ON operation_indicators(operation_id);
CREATE INDEX IF NOT EXISTS idx_oi_type ON operation_indicators(indicator_type);
CREATE INDEX IF NOT EXISTS idx_oi_year ON operation_indicators(fiscal_year);

-- 24) operation_financials
CREATE TABLE IF NOT EXISTS operation_financials (
  id UUID PRIMARY KEY,
  operation_id UUID NOT NULL REFERENCES university_operations(id),
  fiscal_year INTEGER NOT NULL,
  budget_allocation DECIMAL(15,2) NOT NULL,
  obligation DECIMAL(15,2) DEFAULT 0,
  disbursement DECIMAL(15,2) DEFAULT 0,
  balance DECIMAL(15,2) NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_of_operation ON operation_financials(operation_id);
CREATE INDEX IF NOT EXISTS idx_of_year ON operation_financials(fiscal_year);

-- 25) audit_trail
CREATE TABLE IF NOT EXISTS audit_trail (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity_type ON audit_trail(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_trail(created_at);

-- ==========================================
-- DONE
-- ==========================================
