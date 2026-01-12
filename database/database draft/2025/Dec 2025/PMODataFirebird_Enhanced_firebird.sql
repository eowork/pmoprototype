-- PMO Monitoring & Evaluation - Enhanced Schema (Firebird SQL)
-- Source: PMODataFirebird_Enhanced.dbml
-- Firebird-compatible: domains for enums, UUID as CHAR(36), JSON/TEXT as BLOB TEXT,
-- POINT replaced by latitude/longitude. Strict creation order.

SET SQL DIALECT 3;

-- ==========================================
-- DOMAINS (ENUMS, UUID, TEXT/JSON)
-- ==========================================
CREATE DOMAIN UUID_STR AS CHAR(36);
CREATE DOMAIN TEXT_BLOB AS BLOB SUB_TYPE TEXT;
CREATE DOMAIN JSON_TEXT AS BLOB SUB_TYPE TEXT;

CREATE DOMAIN CAMPUS_ENUM AS VARCHAR(12)
  CHECK (VALUE IN ('MAIN','CABADBARAN','BOTH'));
CREATE DOMAIN PROJECT_STATUS_ENUM AS VARCHAR(12)
  CHECK (VALUE IN ('PLANNING','ONGOING','COMPLETED','ON_HOLD','CANCELLED'));
CREATE DOMAIN REPAIR_STATUS_ENUM AS VARCHAR(12)
  CHECK (VALUE IN ('REPORTED','INSPECTED','APPROVED','IN_PROGRESS','COMPLETED','CANCELLED'));
CREATE DOMAIN URGENCY_LEVEL_ENUM AS VARCHAR(10)
  CHECK (VALUE IN ('LOW','MEDIUM','HIGH','CRITICAL'));
CREATE DOMAIN BUILDING_TYPE_ENUM AS VARCHAR(16)
  CHECK (VALUE IN ('ACADEMIC','ADMINISTRATIVE','RESIDENTIAL','OTHER'));
CREATE DOMAIN BUILDING_STATUS_ENUM AS VARCHAR(20)
  CHECK (VALUE IN ('OPERATIONAL','UNDER_CONSTRUCTION','RENOVATION','CLOSED'));
CREATE DOMAIN ROOM_TYPE_ENUM AS VARCHAR(12)
  CHECK (VALUE IN ('CLASSROOM','LABORATORY','OFFICE','CONFERENCE','AUDITORIUM','OTHER'));
CREATE DOMAIN ROOM_STATUS_ENUM AS VARCHAR(20)
  CHECK (VALUE IN ('AVAILABLE','OCCUPIED','UNDER_MAINTENANCE','UNAVAILABLE'));
CREATE DOMAIN SEMESTER_ENUM AS VARCHAR(8)
  CHECK (VALUE IN ('FIRST','SECOND','SUMMER'));
CREATE DOMAIN CONDITION_ENUM AS VARCHAR(12)
  CHECK (VALUE IN ('POOR','FAIR','GOOD','VERY_GOOD','EXCELLENT'));
CREATE DOMAIN OPERATION_TYPE_ENUM AS VARCHAR(24)
  CHECK (VALUE IN ('HIGHER_EDUCATION','ADVANCED_EDUCATION','RESEARCH','TECHNICAL_ADVISORY'));
CREATE DOMAIN PROJECT_TYPE_ENUM AS VARCHAR(16)
  CHECK (VALUE IN ('CONSTRUCTION','REPAIR','RESEARCH','EXTENSION','TRAINING','OTHER'));
CREATE DOMAIN CONTRACTOR_STATUS_ENUM AS VARCHAR(16)
  CHECK (VALUE IN ('ACTIVE','SUSPENDED','BLACKLISTED'));
CREATE DOMAIN MEDIA_TYPE_ENUM AS VARCHAR(12)
  CHECK (VALUE IN ('IMAGE','VIDEO','DOCUMENT','OTHER'));
CREATE DOMAIN DEPARTMENT_STATUS_ENUM AS VARCHAR(10)
  CHECK (VALUE IN ('ACTIVE','INACTIVE'));
CREATE DOMAIN SETTING_DATA_TYPE_ENUM AS VARCHAR(10)
  CHECK (VALUE IN ('STRING','NUMBER','BOOLEAN','JSON','DATE','DATETIME'));

-- ==========================================
-- TABLES (STRICT CREATION ORDER)
-- ==========================================

-- 1) roles
CREATE TABLE roles (
  id UUID_STR PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT_BLOB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2) users
CREATE TABLE users (
  id UUID_STR PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  avatar_url VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_password_change_at TIMESTAMP,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMP
);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_email ON users(email);

-- 3) permissions
CREATE TABLE permissions (
  id UUID_STR PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT_BLOB,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_permissions_name ON permissions(name);
CREATE INDEX idx_permissions_resource ON permissions(resource);

-- 4) projects
CREATE TABLE projects (
  id UUID_STR PRIMARY KEY,
  project_code VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT_BLOB,
  project_type PROJECT_TYPE_ENUM NOT NULL,
  start_date DATE,
  end_date DATE,
  status PROJECT_STATUS_ENUM NOT NULL,
  budget DECIMAL(15,2),
  campus CAMPUS_ENUM NOT NULL,
  created_by UUID_STR NOT NULL REFERENCES users(id),
  updated_by UUID_STR REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_projects_type ON projects(project_type);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_campus ON projects(campus);

-- 5) contractors
CREATE TABLE contractors (
  id UUID_STR PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT_BLOB,
  tin_number VARCHAR(50),
  registration_number VARCHAR(100),
  validity_date DATE,
  status CONTRACTOR_STATUS_ENUM NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_contractors_name ON contractors(name);
CREATE INDEX idx_contractors_status ON contractors(status);

-- 6) funding_sources
CREATE TABLE funding_sources (
  id UUID_STR PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT_BLOB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7) construction_subcategories
CREATE TABLE construction_subcategories (
  id UUID_STR PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT_BLOB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8) repair_types
CREATE TABLE repair_types (
  id UUID_STR PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT_BLOB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9) buildings
CREATE TABLE buildings (
  id UUID_STR PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  code VARCHAR(50),
  campus CAMPUS_ENUM NOT NULL,
  building_type BUILDING_TYPE_ENUM NOT NULL,
  year_built INTEGER,
  total_floors INTEGER,
  total_area DECIMAL(10,2),
  status BUILDING_STATUS_ENUM NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_buildings_name ON buildings(name);
CREATE UNIQUE INDEX idx_buildings_code ON buildings(code);
CREATE INDEX idx_buildings_campus ON buildings(campus);
CREATE INDEX idx_buildings_type ON buildings(building_type);
CREATE INDEX idx_buildings_status ON buildings(status);

-- 10) departments
CREATE TABLE departments (
  id UUID_STR PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  description TEXT_BLOB,
  parent_id UUID_STR,
  head_id UUID_STR,
  email VARCHAR(255),
  phone VARCHAR(20),
  status DEPARTMENT_STATUS_ENUM NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_dept_parent FOREIGN KEY (parent_id) REFERENCES departments(id),
  CONSTRAINT fk_dept_head FOREIGN KEY (head_id) REFERENCES users(id)
);
CREATE UNIQUE INDEX idx_dept_code ON departments(code);
CREATE INDEX idx_dept_name ON departments(name);
CREATE INDEX idx_dept_status ON departments(status);
CREATE INDEX idx_dept_parent ON departments(parent_id);
CREATE INDEX idx_dept_head ON departments(head_id);

-- 11) university_operations
CREATE TABLE university_operations (
  id UUID_STR PRIMARY KEY,
  operation_type OPERATION_TYPE_ENUM NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT_BLOB,
  code VARCHAR(50),
  start_date DATE,
  end_date DATE,
  status PROJECT_STATUS_ENUM NOT NULL,
  budget DECIMAL(15,2),
  campus CAMPUS_ENUM NOT NULL,
  coordinator_id UUID_STR REFERENCES users(id),
  created_by UUID_STR NOT NULL REFERENCES users(id),
  updated_by UUID_STR REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX idx_univops_code ON university_operations(code);
CREATE INDEX idx_univops_type ON university_operations(operation_type);
CREATE INDEX idx_univops_status ON university_operations(status);
CREATE INDEX idx_univops_campus ON university_operations(campus);
CREATE INDEX idx_univops_coord ON university_operations(coordinator_id);

-- 12) documents
CREATE TABLE documents (
  id UUID_STR PRIMARY KEY,
  documentable_type VARCHAR(100) NOT NULL,
  documentable_id UUID_STR NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  description TEXT_BLOB,
  uploaded_by UUID_STR NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_docs_pair ON documents(documentable_type, documentable_id);
CREATE INDEX idx_docs_type ON documents(document_type);
CREATE INDEX idx_docs_uploader ON documents(uploaded_by);

-- 13) media
CREATE TABLE media (
  id UUID_STR PRIMARY KEY,
  mediable_type VARCHAR(100) NOT NULL,
  mediable_id UUID_STR NOT NULL,
  media_type MEDIA_TYPE_ENUM NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  title VARCHAR(255),
  description TEXT_BLOB,
  alt_text VARCHAR(255),
  is_featured BOOLEAN DEFAULT FALSE,
  uploaded_by UUID_STR NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_media_pair ON media(mediable_type, mediable_id);
CREATE INDEX idx_media_type ON media(media_type);
CREATE INDEX idx_media_feat ON media(is_featured);
CREATE INDEX idx_media_uploader ON media(uploaded_by);

-- 14) system_settings
CREATE TABLE system_settings (
  id UUID_STR PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT_BLOB,
  setting_group VARCHAR(50) NOT NULL,
  data_type SETTING_DATA_TYPE_ENUM NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  description TEXT_BLOB,
  updated_by UUID_STR REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_sys_settings_key ON system_settings(setting_key);
CREATE INDEX idx_sys_settings_group ON system_settings(setting_group);

-- 15) notifications
CREATE TABLE notifications (
  id UUID_STR PRIMARY KEY,
  user_id UUID_STR NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT_BLOB NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  action_url VARCHAR(255),
  related_entity_type VARCHAR(100),
  related_entity_id UUID_STR,
  created_by UUID_STR REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_related ON notifications(related_entity_type, related_entity_id);

-- 16) audit_trail
CREATE TABLE audit_trail (
  id UUID_STR PRIMARY KEY,
  user_id UUID_STR REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID_STR,
  old_values JSON_TEXT,
  new_values JSON_TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT_BLOB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_user ON audit_trail(user_id);
CREATE INDEX idx_audit_etype ON audit_trail(entity_type);
CREATE INDEX idx_audit_created ON audit_trail(created_at);

-- 17) rooms
CREATE TABLE rooms (
  id UUID_STR PRIMARY KEY,
  building_id UUID_STR NOT NULL REFERENCES buildings(id),
  room_number VARCHAR(20) NOT NULL,
  floor_number INTEGER NOT NULL,
  room_type ROOM_TYPE_ENUM NOT NULL,
  capacity INTEGER,
  area DECIMAL(10,2),
  status ROOM_STATUS_ENUM NOT NULL,
  is_airconditioned BOOLEAN DEFAULT FALSE,
  has_projector BOOLEAN DEFAULT FALSE,
  has_whiteboard BOOLEAN DEFAULT TRUE,
  is_wheelchair_accessible BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_rooms_building ON rooms(building_id);
CREATE INDEX idx_rooms_room_number ON rooms(room_number);
CREATE INDEX idx_rooms_type ON rooms(room_type);
CREATE INDEX idx_rooms_status ON rooms(status);

-- 18) construction_projects
CREATE TABLE construction_projects (
  id UUID_STR PRIMARY KEY,
  project_id UUID_STR NOT NULL UNIQUE REFERENCES projects(id),
  project_code VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT_BLOB,
  contract_number VARCHAR(50),
  contractor_id UUID_STR REFERENCES contractors(id),
  contract_amount DECIMAL(15,2),
  start_date DATE,
  target_completion_date DATE,
  actual_completion_date DATE,
  project_duration VARCHAR(100),
  project_engineer VARCHAR(255),
  project_manager VARCHAR(255),
  -- Replace POINT with latitude/longitude for Firebird
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  building_type VARCHAR(100),
  floor_area DECIMAL(10,2),
  number_of_floors INTEGER,
  funding_source_id UUID_STR NOT NULL REFERENCES funding_sources(id),
  subcategory_id UUID_STR REFERENCES construction_subcategories(id),
  campus CAMPUS_ENUM NOT NULL,
  status PROJECT_STATUS_ENUM NOT NULL,
  created_by UUID_STR NOT NULL REFERENCES users(id),
  updated_by UUID_STR REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_conproj_pid ON construction_projects(project_id);
CREATE INDEX idx_conproj_code ON construction_projects(project_code);
CREATE INDEX idx_conproj_contractor ON construction_projects(contractor_id);
CREATE INDEX idx_conproj_status ON construction_projects(status);
CREATE INDEX idx_conproj_start ON construction_projects(start_date);
CREATE INDEX idx_conproj_target ON construction_projects(target_completion_date);
CREATE INDEX idx_conproj_campus ON construction_projects(campus);

-- 19) repair_projects
CREATE TABLE repair_projects (
  id UUID_STR PRIMARY KEY,
  project_id UUID_STR NOT NULL UNIQUE REFERENCES projects(id),
  project_code VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT_BLOB,
  building_name VARCHAR(255) NOT NULL,
  floor_number VARCHAR(20),
  room_number VARCHAR(20),
  specific_location VARCHAR(255),
  repair_type_id UUID_STR NOT NULL REFERENCES repair_types(id),
  urgency_level URGENCY_LEVEL_ENUM NOT NULL,
  is_emergency BOOLEAN NOT NULL DEFAULT FALSE,
  campus CAMPUS_ENUM NOT NULL,
  reported_by VARCHAR(255),
  reported_date DATE,
  inspection_date DATE,
  inspector_id UUID_STR REFERENCES users(id),
  inspection_findings TEXT_BLOB,
  status REPAIR_STATUS_ENUM NOT NULL,
  start_date DATE,
  end_date DATE,
  budget DECIMAL(15,2),
  project_manager_id UUID_STR REFERENCES users(id),
  contractor_id UUID_STR REFERENCES contractors(id),
  completion_date DATE,
  created_by UUID_STR NOT NULL REFERENCES users(id),
  updated_by UUID_STR REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_repair_project_id ON repair_projects(project_id);
CREATE INDEX idx_repair_building ON repair_projects(building_name);
CREATE INDEX idx_repair_type ON repair_projects(repair_type_id);
CREATE INDEX idx_repair_status ON repair_projects(status);
CREATE INDEX idx_repair_campus ON repair_projects(campus);
CREATE INDEX idx_repair_emerg ON repair_projects(is_emergency);

-- 20) user_roles
CREATE TABLE user_roles (
  user_id UUID_STR NOT NULL REFERENCES users(id),
  role_id UUID_STR NOT NULL REFERENCES roles(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role_id)
);

-- 21) role_permissions
CREATE TABLE role_permissions (
  role_id UUID_STR NOT NULL REFERENCES roles(id),
  permission_id UUID_STR NOT NULL REFERENCES permissions(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_role_permissions PRIMARY KEY (role_id, permission_id)
);

-- 22) user_departments
CREATE TABLE user_departments (
  user_id UUID_STR NOT NULL REFERENCES users(id),
  department_id UUID_STR NOT NULL REFERENCES departments(id),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_user_departments PRIMARY KEY (user_id, department_id)
);

-- 23) room_assessments
CREATE TABLE room_assessments (
  id UUID_STR PRIMARY KEY,
  room_id UUID_STR NOT NULL REFERENCES rooms(id),
  assessment_date DATE NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  semester SEMESTER_ENUM NOT NULL,
  subject_code VARCHAR(50),
  subject_description VARCHAR(255),
  number_of_students INTEGER,
  class_schedule TEXT_BLOB,
  functionality_score INTEGER,
  utility_systems_score INTEGER,
  sanitation_score INTEGER,
  equipment_score INTEGER,
  furniture_score INTEGER,
  space_management_score INTEGER,
  safety_score INTEGER,
  overall_score DECIMAL(5,2),
  overall_condition CONDITION_ENUM,
  functionality_details JSON_TEXT,
  utility_systems_details JSON_TEXT,
  sanitation_details JSON_TEXT,
  equipment_details JSON_TEXT,
  furniture_details JSON_TEXT,
  space_management_details JSON_TEXT,
  safety_details JSON_TEXT,
  assessor_id UUID_STR NOT NULL REFERENCES users(id),
  assessor_position VARCHAR(100),
  remarks TEXT_BLOB,
  recommended_actions TEXT_BLOB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_rass_room ON room_assessments(room_id);
CREATE INDEX idx_rass_date ON room_assessments(assessment_date);
CREATE INDEX idx_rass_ay ON room_assessments(academic_year);
CREATE INDEX idx_rass_sem ON room_assessments(semester);
CREATE INDEX idx_rass_assessor ON room_assessments(assessor_id);

-- 24) construction_project_financials
CREATE TABLE construction_project_financials (
  id UUID_STR PRIMARY KEY,
  project_id UUID_STR NOT NULL REFERENCES construction_projects(id),
  fiscal_year INTEGER NOT NULL,
  appropriation DECIMAL(15,2) NOT NULL,
  obligation DECIMAL(15,2) NOT NULL,
  disbursement DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_cpf_project ON construction_project_financials(project_id);
CREATE INDEX idx_cpf_year ON construction_project_financials(fiscal_year);

-- 25) construction_project_progress
CREATE TABLE construction_project_progress (
  id UUID_STR PRIMARY KEY,
  project_id UUID_STR NOT NULL REFERENCES construction_projects(id),
  report_date DATE NOT NULL,
  physical_progress_percentage DECIMAL(5,2) NOT NULL,
  financial_progress_percentage DECIMAL(5,2) NOT NULL,
  time_elapsed_percentage DECIMAL(5,2) NOT NULL,
  slippage_percentage DECIMAL(5,2),
  remarks TEXT_BLOB,
  reported_by UUID_STR NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_cpp_project ON construction_project_progress(project_id);
CREATE INDEX idx_cpp_date ON construction_project_progress(report_date);

-- 26) construction_pow_items
CREATE TABLE construction_pow_items (
  id UUID_STR PRIMARY KEY,
  project_id UUID_STR NOT NULL REFERENCES construction_projects(id),
  item_number VARCHAR(50) NOT NULL,
  description TEXT_BLOB NOT NULL,
  unit VARCHAR(20) NOT NULL,
  quantity DECIMAL(15,2) NOT NULL,
  unit_cost DECIMAL(15,2) NOT NULL,
  total_cost DECIMAL(15,2) NOT NULL,
  category VARCHAR(100),
  phase VARCHAR(100),
  is_variation_order BOOLEAN NOT NULL DEFAULT FALSE,
  parent_item_id UUID_STR REFERENCES construction_pow_items(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_cpi_project ON construction_pow_items(project_id);
CREATE INDEX idx_cpi_cat ON construction_pow_items(category);
CREATE INDEX idx_cpi_phase ON construction_pow_items(phase);
CREATE INDEX idx_cpi_isvo ON construction_pow_items(is_variation_order);

-- 27) repair_pow_items
CREATE TABLE repair_pow_items (
  id UUID_STR PRIMARY KEY,
  repair_project_id UUID_STR NOT NULL REFERENCES repair_projects(id),
  item_number VARCHAR(50) NOT NULL,
  description TEXT_BLOB NOT NULL,
  unit VARCHAR(20) NOT NULL,
  quantity DECIMAL(15,2) NOT NULL,
  estimated_material_cost DECIMAL(15,2) NOT NULL,
  estimated_labor_cost DECIMAL(15,2) NOT NULL,
  estimated_project_cost DECIMAL(15,2) NOT NULL,
  unit_cost DECIMAL(15,2) NOT NULL,
  date_entry DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  phase VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_rpi_project ON repair_pow_items(repair_project_id);
CREATE INDEX idx_rpi_cat ON repair_pow_items(category);
CREATE INDEX idx_rpi_phase ON repair_pow_items(phase);
CREATE INDEX idx_rpi_date ON repair_pow_items(date_entry);

-- 28) operation_indicators
CREATE TABLE operation_indicators (
  id UUID_STR PRIMARY KEY,
  operation_id UUID_STR NOT NULL REFERENCES university_operations(id),
  indicator_type VARCHAR(100) NOT NULL,
  fiscal_year INTEGER NOT NULL,
  target_value DECIMAL(15,2),
  actual_value DECIMAL(15,2),
  achievement_percentage DECIMAL(5,2),
  remarks TEXT_BLOB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_oi_operation ON operation_indicators(operation_id);
CREATE INDEX idx_oi_type ON operation_indicators(indicator_type);
CREATE INDEX idx_oi_year ON operation_indicators(fiscal_year);

-- 29) operation_financials
CREATE TABLE operation_financials (
  id UUID_STR PRIMARY KEY,
  operation_id UUID_STR NOT NULL REFERENCES university_operations(id),
  fiscal_year INTEGER NOT NULL,
  budget_allocation DECIMAL(15,2) NOT NULL,
  obligation DECIMAL(15,2) DEFAULT 0,
  disbursement DECIMAL(15,2) DEFAULT 0,
  balance DECIMAL(15,2) NOT NULL,
  remarks TEXT_BLOB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_of_operation ON operation_financials(operation_id);
CREATE INDEX idx_of_year ON operation_financials(fiscal_year);

-- 30) role_permissions already created at step 21 (kept order note for clarity)

-- END
