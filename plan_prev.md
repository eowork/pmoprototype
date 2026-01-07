# Plan: Database Schema Enhancement - PostgreSQL Compliance & Complete Field Capture

## Checklist with Verification
- Step 1: Research Phase - Complete field mapping from UI forms to database schema [Verification: research_latest.md contains complete field mapping tables for University Operations (Target vs Actual, Financial) and Construction Infrastructure] ✅
- Step 2: Research Phase - Verify PostgreSQL syntax compliance and identify missing attributes [Verification: research_latest.md documents PostgreSQL requirements, syntax compliance checklist, and missing attributes list] ✅
- Step 3: Plan Phase - Design schema enhancements following SOLID/DRY/YAGNI/KISS for RBAC and missing fields [Verification: plan_latest.md contains proposed DDL changes with rationale] ✅
- Step 4: Implementation Phase - Apply DDL updates to PostgreSQL schema file [Verification: SQL file updated; PostgreSQL syntax verified; all UI fields captured] ⏳ PENDING

## Status Log
- [x] Step 1: Complete field mapping from UI to database (Target vs Actual, Financial, Construction)
- [x] Step 2: PostgreSQL compliance verified; missing attributes identified
- [x] Step 3: Schema enhancement design (RBAC tables + missing fields + security enhancements)
- [ ] Step 4: DDL implementation - PENDING

## Notes
- **Database**: PostgreSQL only (strict compliance required) - ✅ Compliant with MIS policy
- **Technology Stack**: **MANDATORY** - Must use MIS-aligned technologies:
  - Front-End: NuxtJS (Vue 3) - NOT React
  - UI Components: shadcn-vue and/or Vuetify - NOT Radix UI
  - Package Manager: Yarn 1.22.x+ - NOT npm
  - Back-End: NestJS or Supabase (if approved)
  - Deployment: PM2 + Nginx + SSL/TLS
- **React Code Status**: React/Vite codebase is **Figma AI-generated reference code ONLY**. Must be reimplemented in Vue/NuxtJS. React components serve as UI/UX pattern reference, not production code.
- **Engineering Principles**: Apply ALL principles - SOLID (Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion), DRY (reuse patterns/components), YAGNI (only required features), KISS (simplest solution).
- **RBAC**: Simple junction tables with SuperAdmin privilege and selective admin page permissions
  - SuperAdmin: Full system access, can manage all admins
  - Admin: Higher authority personnel (Directors, Chiefs, VPs, President, etc.) with selective page access granted by superadmin
  - Staff/Editor: Operational personnel with assigned category/project permissions
  - Client: Read-only access
- **Fields**: All input fields from University Operations and Construction Infrastructure must be captured

## Proposed Schema Enhancements

### 1. RBAC Schema Enhancements (Priority: HIGH)

**Rationale**: Current schema lacks tables for page-level permissions, category assignments, and project assignments. UI expects these structures but they don't exist in database. Following SOLID principles (Single Responsibility - separate tables for different permission scopes), DRY (reusable permission structure), KISS (simple junction tables), and YAGNI (only required features).

#### 1.1 Enhanced `user_roles` Table
**File**: `prototype/database draft/Latest db schema/Dec 2025/PMODataFirebird_Enhanced_postgres.sql`
**Location**: After existing `user_roles` table definition (line 96)

```sql
-- Enhance existing user_roles table with superadmin flag and audit trail
ALTER TABLE IF EXISTS user_roles
  ADD COLUMN IF NOT EXISTS is_superadmin BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ DEFAULT NOW();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_is_superadmin ON user_roles(is_superadmin) WHERE is_superadmin = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_roles_assigned_by ON user_roles(assigned_by);
```

**Rationale**: 
- `is_superadmin`: Quick lookup flag for privilege checks (KISS - simple boolean)
- `assigned_by`/`assigned_at`: Audit trail for compliance (SOLID - Single Responsibility for audit)

#### 1.2 New `user_page_permissions` Table
**File**: `prototype/database draft/Latest db schema/Dec 2025/PMODataFirebird_Enhanced_postgres.sql`
**Location**: After `user_roles` table (after line 96)

```sql
-- Core permission table for page-level access control
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_page_permissions_user_id ON user_page_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_page_permissions_page_id ON user_page_permissions(page_id);
CREATE INDEX IF NOT EXISTS idx_user_page_permissions_assigned_by ON user_page_permissions(assigned_by);
CREATE INDEX IF NOT EXISTS idx_user_page_permissions_deleted_at ON user_page_permissions(deleted_at) WHERE deleted_at IS NULL;
```

**Rationale**:
- **SOLID**: Single Responsibility - one table for page-level permissions
- **DRY**: Reusable structure for all page types
- **KISS**: Simple boolean flags, no complex hierarchies
- **YAGNI**: Only required actions (view, add, edit, delete, approve, assign_staff, manage_permissions)

#### 1.3 New `university_operations_personnel` Table
**File**: `prototype/database draft/Latest db schema/Dec 2025/PMODataFirebird_Enhanced_postgres.sql`
**Location**: After `operation_organizational_info` table (find location in schema)

```sql
-- Category-level assignments for University Operations (Staff/Editor roles)
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
  CONSTRAINT unique_user_category_assignment UNIQUE (user_id, category)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_university_operations_personnel_user_id ON university_operations_personnel(user_id);
CREATE INDEX IF NOT EXISTS idx_university_operations_personnel_category ON university_operations_personnel(category);
CREATE INDEX IF NOT EXISTS idx_university_operations_personnel_assigned_by ON university_operations_personnel(assigned_by);
CREATE INDEX IF NOT EXISTS idx_university_operations_personnel_deleted_at ON university_operations_personnel(deleted_at) WHERE deleted_at IS NULL;
```

**Rationale**:
- **SOLID**: Interface Segregation - separate from page permissions (different scope)
- **KISS**: Simple category-level assignments
- **YAGNI**: Only category-specific actions needed

#### 1.4 New `construction_project_assignments` Table
**File**: `prototype/database draft/Latest db schema/Dec 2025/PMODataFirebird_Enhanced_postgres.sql`
**Location**: After `construction_projects` table (find location in schema)

```sql
-- Project-level assignments for Construction Infrastructure (Staff/Editor roles)
CREATE TABLE IF NOT EXISTS construction_project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
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
  CONSTRAINT unique_user_project_assignment UNIQUE (user_id, project_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_construction_project_assignments_user_id ON construction_project_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_construction_project_assignments_project_id ON construction_project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_construction_project_assignments_assigned_by ON construction_project_assignments(assigned_by);
CREATE INDEX IF NOT EXISTS idx_construction_project_assignments_deleted_at ON construction_project_assignments(deleted_at) WHERE deleted_at IS NULL;
```

**Rationale**:
- **SOLID**: Interface Segregation - project-level scope separate from page/category
- **KISS**: Simple project assignments
- **YAGNI**: Only project-specific actions (edit, delete, document access)

#### 1.5 Helper Functions for Permission Checks
**File**: `prototype/database draft/Latest db schema/Dec 2025/PMODataFirebird_Enhanced_postgres.sql`
**Location**: After all RBAC tables

```sql
-- Helper function: Check if user is superadmin
CREATE OR REPLACE FUNCTION is_user_superadmin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = p_user_id
      AND is_superadmin = TRUE
      AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Helper function: Get user page permission
CREATE OR REPLACE FUNCTION get_user_page_permission(
  p_user_id UUID,
  p_page_id VARCHAR(100),
  p_action VARCHAR(50)
)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_superadmin BOOLEAN;
  v_permission RECORD;
BEGIN
  -- Check if superadmin (bypass all checks)
  SELECT is_user_superadmin(p_user_id) INTO v_is_superadmin;
  IF v_is_superadmin THEN
    RETURN TRUE;
  END IF;

  -- Get page permission
  SELECT * INTO v_permission
  FROM user_page_permissions
  WHERE user_id = p_user_id
    AND page_id = p_page_id
    AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Check action-specific flag
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
```

**Rationale**:
- **DRY**: Centralized permission check logic (reusable)
- **SOLID**: Dependency Inversion - application depends on abstraction (function), not table structure
- **KISS**: Simple function interface

### 2. Security Enhancements (Priority: HIGH)

**Rationale**: Research identified 10 security vulnerabilities. These enhancements address HIGH priority risks: permission assignment validation, RLS policies, and audit logging.

#### 2.1 Permission Assignment Validation Trigger
**File**: `prototype/database draft/Latest db schema/Dec 2025/PMODataFirebird_Enhanced_postgres.sql`
**Location**: After helper functions

```sql
-- Trigger function: Validate that only SuperAdmin can assign permissions
CREATE OR REPLACE FUNCTION validate_permission_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only SuperAdmin can assign page permissions
  IF NOT is_user_superadmin(NEW.assigned_by) THEN
    RAISE EXCEPTION 'Only SuperAdmin can assign page permissions. User % is not a SuperAdmin.', NEW.assigned_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to user_page_permissions
CREATE TRIGGER user_page_permissions_assignment_check
  BEFORE INSERT OR UPDATE ON user_page_permissions
  FOR EACH ROW
  EXECUTE FUNCTION validate_permission_assignment();
```

**Rationale**:
- **Security**: Prevents privilege escalation at database level
- **SOLID**: Single Responsibility - validation logic in one place
- **Defense in Depth**: Database-level enforcement even if application logic is bypassed

#### 2.2 Row Level Security (RLS) Policies
**File**: `prototype/database draft/Latest db schema/Dec 2025/PMODataFirebird_Enhanced_postgres.sql`
**Location**: After triggers

```sql
-- Enable RLS on all RBAC tables
ALTER TABLE user_page_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_operations_personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_project_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own permissions
CREATE POLICY user_page_permissions_select_own
  ON user_page_permissions
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', TRUE)::UUID);

-- Policy: Only SuperAdmin can modify permissions
CREATE POLICY user_page_permissions_superadmin_only
  ON user_page_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = current_setting('app.current_user_id', TRUE)::UUID
        AND is_superadmin = TRUE
        AND deleted_at IS NULL
    )
  );

-- Similar policies for university_operations_personnel and construction_project_assignments
-- (Apply same pattern)
```

**Rationale**:
- **Security**: Prevents information disclosure and unauthorized modifications
- **SOLID**: Open/Closed - policies can be extended without modifying table structure
- **Defense in Depth**: Database-level access control

#### 2.3 Permission Audit Log Table
**File**: `prototype/database draft/Latest db schema/Dec 2025/PMODataFirebird_Enhanced_postgres.sql`
**Location**: After RLS policies

```sql
-- Audit log for permission changes
CREATE TABLE IF NOT EXISTS permission_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(50) NOT NULL, -- 'GRANT', 'REVOKE', 'MODIFY'
  permission_type VARCHAR(50) NOT NULL, -- 'PAGE', 'CATEGORY', 'PROJECT'
  permission_id UUID,
  changed_by UUID NOT NULL REFERENCES users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  old_values JSONB,
  new_values JSONB
);

CREATE INDEX IF NOT EXISTS idx_permission_audit_log_user_id ON permission_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_changed_at ON permission_audit_log(changed_at);
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_permission_type ON permission_audit_log(permission_type);
```

**Rationale**:
- **Compliance**: Audit trail for accountability
- **SOLID**: Single Responsibility - dedicated table for audit
- **Security**: Track all permission changes for forensics

### 3. Missing Field Enhancements (Priority: MEDIUM)

**Rationale**: Research identified missing fields in existing tables. These are optional enhancements for better data capture.

#### 3.1 University Operations - Missing UACS Code
**File**: `prototype/database draft/Latest db schema/Dec 2025/PMODataFirebird_Enhanced_postgres.sql`
**Location**: In `operation_indicators` table (find location)

```sql
-- Add UACS code field if missing
ALTER TABLE IF EXISTS operation_indicators
  ADD COLUMN IF NOT EXISTS uacs_code VARCHAR(50);
```

**Rationale**: UI requires UACS code field (see research field mapping)

#### 3.2 Construction Projects - Missing Fields
**File**: `prototype/database draft/Latest db schema/Dec 2025/PMODataFirebird_Enhanced_postgres.sql`
**Location**: In `construction_projects` table (find location)

**Note**: Most fields already exist. Check if these are in `metadata` JSONB or need separate columns:
- `project_manager` (may be in metadata)
- `local_government_unit` (for locally-funded projects - may be in metadata)
- `grant_type` (for special grants - may be in metadata)

**Rationale**: UI shows these fields. If in metadata, no change needed (YAGNI - don't add columns if JSONB works).

## Implementation Order

1. **RBAC Tables** (HIGH Priority):
   - Enhanced `user_roles`
   - `user_page_permissions`
   - `university_operations_personnel`
   - `construction_project_assignments`
   - Helper functions

2. **Security Enhancements** (HIGH Priority):
   - Permission assignment validation trigger
   - RLS policies
   - Audit log table

3. **Missing Fields** (MEDIUM Priority):
   - UACS code field
   - Verify metadata fields

## Verification Checklist

After implementation, verify:
- [ ] All RBAC tables created with proper indexes
- [ ] Helper functions work correctly
- [ ] Triggers prevent unauthorized permission assignments
- [ ] RLS policies prevent information disclosure
- [ ] Audit log captures permission changes
- [ ] All UI fields are captured (either in columns or metadata JSONB)
- [ ] PostgreSQL syntax is correct (no Firebird/MySQL compatibility)
- [ ] Foreign key constraints are properly set
- [ ] Soft delete support (`deleted_at`) is consistent across all tables

## Migration & Greenfield Strategy

### Target SQL File

- **Active migration target**: `prototype/database draft/Latest db schema/2025-12-16/PMODataFirebird_Enhanced_postgres.sql`
- **Reason**: Dated copy created from Dec 2025 schema to preserve original; all new DDL will be applied to this dated file.

### Migration Order (PostgreSQL/pgAdmin)

Plan DDL so it can be run in this order:
- **1. ENUM Types**: `CREATE TYPE IF NOT EXISTS ...`
- **2. Tables**: `CREATE TABLE IF NOT EXISTS ...`
- **3. Indexes**: `CREATE INDEX IF NOT EXISTS ...`
- **4. Functions**: `CREATE OR REPLACE FUNCTION ...`
- **5. Triggers**: `CREATE TRIGGER IF NOT EXISTS ...` (or existence-checked)
- **6. RLS Policies**: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` + `CREATE POLICY ...`

### Sequences

- Use PostgreSQL-native `BIGSERIAL` (already in `construction_projects.infra_project_uid`) – this auto-creates sequences.
- No explicit `CREATE SEQUENCE` needed; migrations remain simple and idempotent.

### 4. Phase 2 Plan: Schema Enhancements for COI, GAD Parity, and Repairs

This section defines what DDL we will add (and where) in the main PostgreSQL schema file to support the Construction of Infrastructure (COI) detail pages, GAD Parity module, and Repairs module, following KISS/YAGNI and the greenfield strategy above.

#### 4.1 Target SQL File and Ordering

- **Primary target**: `prototype/database draft/Latest db schema/2025-12-16/PMODataFirebird_Enhanced_postgres.sql`
- **Execution order for new work** (consistent with migration strategy):
  - 1) New ENUM types (`CREATE TYPE IF NOT EXISTS ...`)
  - 2) New tables (`CREATE TABLE IF NOT EXISTS ...`)
  - 3) Table alterations (`ALTER TABLE IF EXISTS ... ADD COLUMN IF NOT EXISTS ...`)
  - 4) Indexes (`CREATE INDEX IF NOT EXISTS ...`)
  - 5) Functions / triggers (only if security‑critical)

---

#### 4.2 COI (Construction of Infrastructure) – Schema Enhancement Plan

**Goal**: Support all 7 tabs on the COI project detail page (Overview, Timeline, Individual POW, Data Analytics, Gallery, Documents, Team) while reusing existing tables where possible.

- **Existing COI tables already present** (no recreation, only possible alterations):
  - `construction_projects`
  - `construction_project_financials`
  - `construction_project_progress`
  - `construction_pow_items`
  - Polymorphic `media` and `documents`

- **New COI tables to add** (all with `id UUID PK`, `project_id UUID FK → construction_projects(id)`, `metadata JSONB`, soft delete, timestamps):
  - `construction_project_accomplishment_records`
    - Section A: `date_entry`, `comments`, `remarks_comments`.
  - `construction_project_actual_accomplishment_records`
    - Section B: `date_entry`, `progress_accomplishment`, `actual_percent`, `target_percent`.
  - `construction_project_progress_summaries`
    - Summary by period: `period`, `physical_progress`, `financial_progress`, `issues`, `recommendations`.
  - `construction_project_financial_reports`
    - Overview financial reports: `report_title`, `report_date`, `target_budget`, `actual_spent`, `status`, `remarks`.
  - `construction_project_phases`
    - Phase tracking: `phase_name`, `phase_description`, `target_progress`, `actual_progress`, `status`, target/actual dates, `remarks`.
  - `construction_project_milestones`
    - Timeline tab milestones: fields matching `TimelineMilestone` (planned/actual dates, status, progress, duration/variance days).
  - `construction_project_team_members`
    - Team tab: link to `users` where applicable; fields for `role`, `department`, `responsibilities`, `status`.

- **Planned ALTERs for existing COI‑related tables**:
  - `construction_projects`
    - `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...` for:
      - `ideal_infrastructure_image VARCHAR(255)`
      - `beneficiaries VARCHAR(255)`
      - `objectives JSONB` (array of strings)
      - `key_features JSONB` (array of strings)
      - `original_contract_duration VARCHAR(100)`
  - `construction_pow_items`
    - Add COI‑specific fields not yet in schema:
      - `estimated_material_cost DECIMAL(15,2)`
      - `estimated_labor_cost DECIMAL(15,2)`
      - `date_entry DATE`
      - `status VARCHAR(50)` (simple status; full ENUM can come later if needed)
      - `remarks TEXT`
      - `is_unit_cost_overridden BOOLEAN NOT NULL DEFAULT FALSE`
  - `media`
    - Add gallery‑oriented fields (reused for both COI and Repairs):
      - `thumbnail_url VARCHAR(255)`
      - `dimensions JSONB`
      - `tags JSONB` (or `TEXT[]`)
      - `capture_date DATE`
      - `display_order INTEGER`
      - `location JSONB`
  - `documents`
    - Add document‑management fields:
      - `version INTEGER`
      - `category VARCHAR(50)` (e.g., 'contract', 'permit', 'technical', etc.)
      - `extracted_text TEXT`
      - `chunks JSONB`
      - `processed_at TIMESTAMPTZ`
      - `status VARCHAR(50)` (e.g., 'uploading', 'processing', 'ready', 'error')

- **Indexes for COI additions** (minimal, startup‑friendly):
  - For each new table: index on `project_id` and optionally on `report_date` / `period` / `status`.
  - For altered tables: add partial index on `status` or `display_order` only if used in frequent filters/sorts.

---

#### 4.3 GAD Parity Report – Schema Enhancement Plan

**Goal**: Introduce dedicated tables for all GAD parity entities and GAD budget/accomplishments, with a consistent approval workflow and soft‑delete pattern.

- **New GAD tables to add** (all with `id UUID`, soft delete, `created_at`/`updated_at`, approval fields):
  - `gad_student_parity_data`
    - Core fields: `academic_year`, `program`, `admission_male/female`, `graduation_male/female`, optional totals.
  - `gad_faculty_parity_data`
    - `academic_year`, `college`, `category`, `total_faculty`, `male_count`, `female_count`, `gender_balance`.
  - `gad_staff_parity_data`
    - `academic_year`, `department`, `staff_category`, `total_staff`, `male_count`, `female_count`, `gender_balance`.
  - `gad_pwd_parity_data`
    - `academic_year`, `pwd_category`, `subcategory`, `total_beneficiaries`, `male_count`, `female_count`.
  - `gad_indigenous_parity_data`
    - `academic_year`, `indigenous_category`, `subcategory`, `total_participants`, `male_count`, `female_count`.
  - `gad_gpb_accomplishments`
    - `title`, `description`, `category`, `priority`, `status`, `target_beneficiaries`, `actual_beneficiaries`, budget fields, `year`.
  - `gad_budget_plans`
    - `title`, `description`, `category`, `priority`, `status`, `budget_allocated`, `budget_utilized`, beneficiaries, date range, `year`.

- **Shared approval/audit pattern for all 7 tables**:
  - `status` / `data_status` (`pending` / `approved` / `rejected` as `VARCHAR` or ENUM if needed later).
  - `submitted_by UUID REFERENCES users(id)`
  - `reviewed_by UUID REFERENCES users(id)`
  - `reviewed_at TIMESTAMPTZ`

- **Indexes for GAD**:
  - Composite or single‑column indexes on:
    - `academic_year` or `year`
    - Main dimension field (`program`, `college`, `department`, `category`)
    - `status` / `data_status`

---

#### 4.4 Repairs Module – Schema Enhancement Plan

**Goal**: Align existing `repair_projects` / `repair_pow_items` and new repair‑specific tables with the Repairs UI (Overview, Timeline, POW, Data Analytics, Gallery, Documents, Team), leveraging patterns reused from COI.

- **Existing repairs tables already present**:
  - `repair_projects`
    - Already covers core fields: codes, building/location, repair_type, urgency, emergency flag, campus, dates, budget, manager/contractor, status.
  - `repair_pow_items`
    - Already has: item details, quantity, estimated costs, unit cost, total cost, date, category, phase.

- **ALTER plan for `repair_pow_items`** (to match UI):
  - Add:
    - `status VARCHAR(50)` (e.g., 'Active', 'Completed', 'Pending', 'Cancelled')
    - `remarks TEXT`
    - `is_unit_cost_overridden BOOLEAN NOT NULL DEFAULT FALSE`

- **New repairs tables to add** (mirroring COI patterns, with `repair_project_id UUID FK → repair_projects(id)`):
  - `repair_project_financial_reports`
    - `report_title`, `report_date`, `target_budget`, `actual_spent`, `status`, `remarks`.
  - `repair_project_phases`
    - Phase tracking: `phase_name`, `phase_description`, `target_progress`, `actual_progress`, `status`, target/actual dates, `remarks`.
  - `repair_project_accomplishment_records`
  - `repair_project_actual_accomplishment_records`
  - `repair_project_progress_summaries`
    - Same shapes as their COI counterparts; only FK and table names differ.
  - `repair_project_milestones`
    - Same shape as `construction_project_milestones`, with `repair_project_id`.
  - `repair_project_team_members`
    - Same concept as `construction_project_team_members`, but targeting `repair_projects`.

- **Media/Documents reuse for repairs**:
  - Continue to use polymorphic `media` and `documents` tables:
    - For repairs, set `mediable_type` / `documentable_type` to a stable discriminator (e.g., `'REPAIR_PROJECT'`) and `mediable_id` / `documentable_id` to `repair_projects.id`.
  - No extra repair‑specific media/doc tables—only the shared ALTERs already described in 4.2.

- **Indexes for repairs**:
  - For each new table: index on `repair_project_id`, plus `report_date` / `status` where frequently filtered.
  - For `repair_projects`: existing indexes on building, type, status, campus, emergency remain; no new indexes unless query patterns demand.

---

#### 4.5 Phase 2 Exit Criteria

Before moving to implementation (DDL edits in the SQL file), confirm:

- **Design completeness**
  - [ ] Every UI entity identified in `research_latest.md` (COI, GAD, Repairs) maps to either:
    - A new table listed above, or
    - An ALTER on an existing table, or
    - A computed/app‑only field (explicitly left out of schema).
- **PostgreSQL & migration readiness**
  - [ ] All planned changes use PostgreSQL‑native types and `IF NOT EXISTS` / `CREATE OR REPLACE` patterns.
  - [ ] New tables follow the common pattern: UUID PK, timestamps, soft delete, `metadata JSONB`.
  - [ ] Indexes are limited to FK and key filter fields, deferring everything else per greenfield strategy.

### Index Strategy for Greenfield/Startup

- **KEEP (Essential Indexes)**:
  - Foreign key columns (`user_id`, `project_id`, `operation_id`, etc.)
  - Unique constraints (`email`, `project_code`, etc.)
  - Key filters (`status`, `campus`, `fiscal_year`)
  - Soft-delete filters (`deleted_at` partial indexes where used)
- **DEFER (Non-essential / Premature)**:
  - Low-cardinality Boolean indexes (`is_active`, `is_featured`) unless proven hot in queries
  - GIN indexes on JSONB (`subcategory_data`) until actual JSONB queries exist
  - Extra per-table indexes (e.g., multiple date indexes) until query plans show need
- **Verification**:
  - Use `EXPLAIN ANALYZE` and `pg_stat_user_indexes` after go-live to add/remove indexes based on real usage.

### Trigger Strategy for Greenfield/Startup

- **Implement Now (Security-Critical)**:
  - `validate_permission_assignment()` + `user_page_permissions_assignment_check` trigger to enforce that only SuperAdmin can assign permissions.
- **Defer for Later (YAGNI)**:
  - Audit-log triggers that populate `permission_audit_log` (start with app-level logging).
  - Calculated-field triggers for financial/utilization fields (start with app-level calculation).

### Backward Compatibility & Data Migration

- **Backward Compatibility**:
  - All new tables and indexes use `IF NOT EXISTS` to be safely re-runnable.
  - New functions use `CREATE OR REPLACE FUNCTION` for idempotency.
- **Data Migration**:
  - Migrate existing `user_metadata.allowedPages` into `user_page_permissions` once tables exist.
  - Default-new users: no page/category/project permissions until explicitly granted (secure by default).
  - First SuperAdmin created via seed script or manual SQL, then uses UI to assign permissions.

