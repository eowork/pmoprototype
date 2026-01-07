# Research: Database Schema Enhancement - University Operations & Construction Infrastructure

## Context and Definitions

**Database Target**: PostgreSQL (strict compliance required - all syntax must be PostgreSQL-native)

**Technology Stack Requirements** (MIS Policy Compliance):
- **MUST USE**: NuxtJS (Vue 3) for front-end framework
- **MUST USE**: Vuetify or shadcn-vue for UI components
- **MUST USE**: NestJS for back-end API (or Supabase if acceptable)
- **MUST USE**: Yarn package manager (version 1.22.x+)
- **MUST USE**: PM2 for deployment
- **MUST USE**: Nginx for production web server
- **MUST USE**: SSL/TLS for authentication
- **CAN USE**: PostgreSQL, MySQL, SQL Lite, Firebird (PostgreSQL chosen)

**Existing Codebase Status**:
- ⚠️ **React/Vite TypeScript code is REFERENCE ONLY** - Generated from Figma AI, used for UI pattern reference
- Current React components serve as design/UX reference for implementing in Vue/NuxtJS
- Database schema maintained in `prototype/database draft/Latest db schema/Dec 2025/PMODataFirebird_Enhanced_postgres.sql`
- RBAC patterns implemented via user_metadata (`role`, `department`, `allowedPages`) - patterns to be ported to Vue
- University Operations: 4 subcategories (Higher Education, Advanced Education, Research, Technical Advisory Extension)
- Construction Infrastructure: 3 funding types (GAA-Funded, Locally-Funded, Special Grants)

**Engineering Principles** (All Apply):
- **SOLID**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **DRY**: Don't Repeat Yourself - reuse components, utilities, and patterns
- **YAGNI**: You Aren't Gonna Need It - only implement what's explicitly required
- **KISS**: Keep It Simple, Stupid - simplest working solution

**Constraints**: 
- PostgreSQL syntax only (no Firebird/MySQL compatibility)
- All input fields from Target vs Actual and Financial tabs must be captured
- **MIS technology alignment is mandatory** - React code is reference only, not production stack

## Knowledge Graph

### University Operations Components (React - Reference Only)
**Note**: These React components are Figma AI-generated code for UI pattern reference. Must be reimplemented in Vue/NuxtJS with shadcn-vue or Vuetify.

- `prototype/Admin Side/src/components/university-operations/HigherEducationProgramPage.tsx` - Reference: Tab structure, form layouts, data visualization patterns
- `prototype/Admin Side/src/components/university-operations/AdvancedEducationProgramPage.tsx` - Reference: Quarterly assessment UI patterns
- `prototype/Admin Side/src/components/university-operations/ResearchProgramPage.tsx` - Reference: Research-specific form fields and data structures
- `prototype/Admin Side/src/components/university-operations/TechnicalAdvisoryExtensionProgramPage.tsx` - Reference: Extension program UI patterns
- `prototype/Admin Side/src/components/university-operations/shared/EditAssessmentModal.tsx` - Reference: Target vs Actual form structure, quarterly input fields
- `prototype/Admin Side/src/components/university-operations/shared/FinancialAccomplishmentTab.tsx` - Reference: Financial form structure, budget tracking UI
- `prototype/Admin Side/src/components/university-operations/types/QuarterlyAssessment.ts` - Reference: TypeScript type definitions to be ported to Vue TypeScript

### Construction Infrastructure Components (React - Reference Only)
**Note**: These React components are Figma AI-generated code for UI pattern reference. Must be reimplemented in Vue/NuxtJS with shadcn-vue or Vuetify.

- `prototype/Admin Side/src/components/construction-infrastructure/GAA-FundedProjectsPage.tsx` - Reference: Project listing, filtering, table layouts
- `prototype/Admin Side/src/components/construction-infrastructure/LocallyFundedProjectsPage.tsx` - Reference: Locally-funded specific UI patterns
- `prototype/Admin Side/src/components/construction-infrastructure/SpecialGrantsProjectsPage.tsx` - Reference: Special grants UI patterns
- `prototype/Admin Side/src/components/construction-infrastructure/ConstructionProjectDetail.tsx` - Reference: Project detail page structure, tab navigation, data display patterns
- `prototype/Admin Side/src/components/construction-infrastructure/ProjectFormDialog.tsx` - Reference: Form dialog structure, input field layouts
- `prototype/Admin Side/src/components/construction-infrastructure/types/ProjectTypes.ts` - Reference: TypeScript types to be ported to Vue
- `prototype/Admin Side/src/components/construction-infrastructure/types/ProjectDetailTypes.ts` - Reference: TypeScript types for project details

### RBAC Services (React - Reference Only)
**Note**: These services demonstrate RBAC patterns. Must be reimplemented in Vue/TypeScript following same logic.

- `prototype/Admin Side/src/components/university-operations/services/RBACService.ts` - Reference: Category-based personnel assignment patterns
- `prototype/Admin Side/src/components/construction-infrastructure/services/RBACService.ts` - Reference: Project-based assignment patterns
- `prototype/Admin Side/src/components/construction-infrastructure/services/EnhancedRBACService.ts` - Reference: Department + page permission patterns

### Database Schema
- `prototype/database draft/Latest db schema/Dec 2025/PMODataFirebird_Enhanced_postgres.sql` - Current PostgreSQL schema (797 lines)
- `prototype/database draft/Latest db schema/Dec 2025/UNIVERSITY_OPERATIONS_SCHEMA_ENHANCEMENTS.md` - Enhancement documentation

## Complete Field Mapping: UI → Database

### University Operations - Target vs Actual Tab

**Source**: `EditAssessmentModal.tsx`, `QuarterlyAssessment.ts`

| UI Field (TypeScript) | Current DB Column | Required? | Notes |
|----------------------|-------------------|-----------|-------|
| `particular` (string) | `operation_indicators.particular` | ✅ Yes | Indicator description |
| `uacsCode` (string) | `operation_indicators.uacs_code` | ⚠️ UI requires | UACS code |
| `physicalTarget.quarter1` (number\|null) | `operation_indicators.target_q1` | ✅ Yes | Q1 target (0-100%) |
| `physicalTarget.quarter2` (number\|null) | `operation_indicators.target_q2` | ✅ Yes | Q2 target (0-100%) |
| `physicalTarget.quarter3` (number\|null) | `operation_indicators.target_q3` | ✅ Yes | Q3 target (0-100%) |
| `physicalTarget.quarter4` (number\|null) | `operation_indicators.target_q4` | ✅ Yes | Q4 target (0-100%) |
| `physicalAccomplishment.quarter1` (number\|null) | `operation_indicators.accomplishment_q1` | ✅ Yes | Q1 accomplishment (0-100%) |
| `physicalAccomplishment.quarter2` (number\|null) | `operation_indicators.accomplishment_q2` | ✅ Yes | Q2 accomplishment (0-100%) |
| `physicalAccomplishment.quarter3` (number\|null) | `operation_indicators.accomplishment_q3` | ✅ Yes | Q3 accomplishment (0-100%) |
| `physicalAccomplishment.quarter4` (number\|null) | `operation_indicators.accomplishment_q4` | ✅ Yes | Q4 accomplishment (0-100%) |
| `accomplishmentScore.quarter1` (string) | `operation_indicators.score_q1` | ✅ Yes | Format: "148/200" or "N/A" |
| `accomplishmentScore.quarter2` (string) | `operation_indicators.score_q2` | ✅ Yes | Format: "148/200" or "N/A" |
| `accomplishmentScore.quarter3` (string) | `operation_indicators.score_q3` | ✅ Yes | Format: "148/200" or "N/A" |
| `accomplishmentScore.quarter4` (string) | `operation_indicators.score_q4` | ✅ Yes | Format: "148/200" or "N/A" |
| `varianceAsOf` (string, date) | `operation_indicators.variance_as_of` | ❌ Optional | Date when variance calculated |
| `variance` (number) | `operation_indicators.variance` | ❌ Optional | Calculated: accomplishment - target |
| `remarks` (string) | `operation_indicators.remarks` | ❌ Optional | Assessment remarks |
| `status` ('pending'\|'approved'\|'rejected') | `operation_indicators.status` | ✅ Yes | RBAC approval workflow (default: 'pending') |
| `budgetYear` (number) | `operation_indicators.fiscal_year` | ✅ Yes | Assessment year |
| `description` (string) | `operation_indicators.description` | ❌ Optional | Detailed description |

**Organizational Info** (from category pages):
| UI Field | Current DB Column | Required? |
|----------|-------------------|-----------|
| `department` (string) | `operation_organizational_info.department` | ❌ Optional |
| `agencyEntity` (string) | `operation_organizational_info.agency_entity` | ❌ Optional |
| `operatingUnit` (string) | `operation_organizational_info.operating_unit` | ❌ Optional |
| `organizationCode` (string) | `operation_organizational_info.organization_code` | ❌ Optional |

### University Operations - Financial Tab

**Source**: `FinancialAccomplishmentTab.tsx` (lines 69-94, 1218-1269)

| UI Field (TypeScript) | Current DB Column | Required? | Notes |
|----------------------|-------------------|-----------|-------|
| `operationsPrograms` (string) | `operation_financials.operations_programs` | ✅ Yes | Program name |
| `allotment` (number) | `operation_financials.allotment` | ❌ Optional | Budget allocation |
| `target` (number) | `operation_financials.target` | ❌ Optional | Target amount |
| `obligation` (number) | `operation_financials.obligation` | ✅ Yes | Defaults to 0 |
| `disbursement` (number) | `operation_financials.disbursement` | ✅ Yes | Defaults to 0 |
| `utilizationPerTarget` (number) | `operation_financials.utilization_per_target` | ❌ Optional | Calculated: (obligation/target)*100 |
| `utilizationPerApprovedBudget` (number) | `operation_financials.utilization_per_approved_budget` | ❌ Optional | Calculated: (obligation/allotment)*100 |
| `disbursementRate` (number) | `operation_financials.disbursement_rate` | ❌ Optional | Calculated: (disbursement/obligation)*100 |
| `quarter` ('Q1'\|'Q2'\|'Q3'\|'Q4') | `operation_financials.quarter` | ❌ Optional | Quarter identifier |
| `year` (number) | `operation_financials.fiscal_year` | ✅ Yes | Assessment year |
| `budgetSource` (string) | `operation_financials.budget_source` | ❌ Optional | e.g., 'Regular Agency Funds' |
| `department` (string) | `operation_financials.department` | ❌ Optional | Department name |
| `status` ('active'\|'completed'\|'pending'\|'cancelled') | `operation_financials.status` | ✅ Yes | Defaults to 'active' |
| `remarks` (string) | `operation_financials.remarks` | ❌ Optional | Financial remarks |
| `variance` (number) | `operation_financials.variance` | ❌ Optional | Calculated: target - obligation |
| `performanceIndicator` (string) | `operation_financials.performance_indicator` | ❌ Optional | Performance note |
| `projectCode` (string) | `operation_financials.metadata->>'projectCode'` | ❌ Optional | Store in JSONB metadata |

**Financial Subcategories** (from UI):
- Regular Agency Funds (Programs)
- Regular Agency Funds (Projects)
- Regular Agency Funds (Continuing Appropriations)
- Internally Generated Funds (Main Campus)
- Internally Generated Funds (Cabadbaran Campus)

**Note**: Subcategory filtering is UI-only; database stores via `budget_source` and `department` fields.

### Construction Infrastructure - Project Fields

**Source**: `ProjectTypes.ts`, `ConstructionProjectDetail.tsx`, `ProjectFormDialog.tsx`

| UI Field (TypeScript) | Current DB Column | Required? | Notes |
|----------------------|-------------------|-----------|-------|
| `projectTitle` (string) | `construction_projects.title` | ✅ Yes | Project name |
| `projectCode` (string) | `construction_projects.project_code` | ✅ Yes | Unique code |
| `dateStarted` (string, date) | `construction_projects.start_date` | ❌ Optional | Start date |
| `targetDateCompletion` (string, date) | `construction_projects.target_completion_date` | ❌ Optional | Target end date |
| `actualCompletionDate` (string, date) | `construction_projects.actual_completion_date` | ❌ Optional | Actual end date |
| `fundingSource` (string) | `construction_projects.funding_source_id` (FK) | ✅ Yes | References `funding_sources` |
| `approvedBudget` (number) | `construction_projects.contract_amount` | ❌ Optional | Contract amount |
| `appropriation` (number) | `construction_project_financials.appropriation` | ✅ Yes | Per fiscal year |
| `obligation` (number) | `construction_project_financials.obligation` | ✅ Yes | Per fiscal year |
| `disbursement` (number) | `construction_project_financials.disbursement` | ✅ Yes | Defaults to 0 |
| `status` (ProjectStatus enum) | `construction_projects.status` | ✅ Yes | project_status_enum |
| `contractorName` (string) | `construction_projects.contractor_id` (FK) | ❌ Optional | References `contractors` |
| `projectManager` (string) | `construction_projects.metadata->>'projectManager'` | ❌ Optional | Store in JSONB |
| `projectDescription` (string) | `construction_projects.description` | ❌ Optional | Description |
| `location` (string) | `construction_projects.location_coordinates` (POINT) | ❌ Optional | Or store as text in metadata |
| `projectDuration` (string) | `construction_projects.project_duration` | ❌ Optional | Duration string |
| `projectEngineer` (string) | `construction_projects.project_engineer` | ❌ Optional | Engineer name |
| `buildingType` (string) | `construction_projects.building_type` | ❌ Optional | Building type |
| `floorArea` (number) | `construction_projects.floor_area` | ❌ Optional | DECIMAL(10,2) |
| `numberOfFloors` (integer) | `construction_projects.number_of_floors` | ❌ Optional | Floor count |
| `subcategoryId` (UUID) | `construction_projects.subcategory_id` (FK) | ❌ Optional | References `construction_subcategories` |
| `campus` (campus_enum) | `construction_projects.campus` | ✅ Yes | 'MAIN'\|'CABADBARAN'\|'BOTH' |
| `remarks` (string) | `construction_projects.metadata->>'remarks'` | ❌ Optional | Store in JSONB |

**Locally-Funded Specific**:
| UI Field | Current DB Column | Required? |
|----------|-------------------|-----------|
| `localGovernmentUnit` (string) | `construction_projects.metadata->>'localGovernmentUnit'` | ❌ Optional |

**Special Grants Specific**:
| UI Field | Current DB Column | Required? |
|----------|-------------------|-----------|
| `grantType` ('Special Grant'\|'Partnership'\|'Income-Generating') | `construction_projects.metadata->>'grantType'` | ❌ Optional |
| `partnerOrganization` (string) | `construction_projects.metadata->>'partnerOrganization'` | ❌ Optional |
| `expectedRevenue` (number) | `construction_projects.metadata->>'expectedRevenue'` | ❌ Optional |

**Project Progress** (from `construction_project_progress`):
| UI Field | Current DB Column | Required? |
|----------|-------------------|-----------|
| `progressAccomplishment` (number) | `construction_project_progress.physical_progress_percentage` | ✅ Yes | 0-100% |
| `actualProgress` (number) | `construction_project_progress.physical_progress_percentage` | ✅ Yes | 0-100% |
| `targetProgress` (number) | Calculated from target date | ❌ Optional | UI-only |
| `reportDate` (date) | `construction_project_progress.report_date` | ✅ Yes | Progress report date |
| `financialProgressPercentage` (number) | `construction_project_progress.financial_progress_percentage` | ✅ Yes | 0-100% |
| `timeElapsedPercentage` (number) | `construction_project_progress.time_elapsed_percentage` | ✅ Yes | 0-100% |
| `slippagePercentage` (number) | `construction_project_progress.slippage_percentage` | ❌ Optional | Calculated |

**POW Items** (from `construction_pow_items`):
| UI Field | Current DB Column | Required? |
|----------|-------------------|-----------|
| `itemNumber` (string) | `construction_pow_items.item_number` | ✅ Yes |
| `description` (string) | `construction_pow_items.description` | ✅ Yes |
| `unit` (string) | `construction_pow_items.unit` | ✅ Yes |
| `quantity` (number) | `construction_pow_items.quantity` | ✅ Yes | DECIMAL(15,2) |
| `unitCost` (number) | `construction_pow_items.unit_cost` | ✅ Yes | DECIMAL(15,2) |
| `totalCost` (number) | `construction_pow_items.total_cost` | ✅ Yes | DECIMAL(15,2) |
| `category` (string) | `construction_pow_items.category` | ❌ Optional |
| `phase` (string) | `construction_pow_items.phase` | ❌ Optional |
| `isVariationOrder` (boolean) | `construction_pow_items.is_variation_order` | ✅ Yes | Defaults to FALSE |

## RBAC Requirements (KISS/YAGNI)

### Role Hierarchy (Simplified)

**Role Types** (from highest to lowest privilege):
1. **SuperAdmin** - Full system access, can manage all admins and permissions
2. **Admin** - Higher authority personnel (Directors, Chiefs, VPs, President, Chairperson, Dean, etc.) with selective page access
3. **Staff/Editor** - Operational personnel with assigned category/project permissions
4. **Client** - Read-only public access

### Key Requirements

**1. SuperAdmin Privilege**:
- Full access to all pages and data
- Can create, modify, and delete admin users
- Can assign page permissions to admins
- Can manage all RBAC assignments
- Only superadmin can modify other superadmins

**2. Admin Role with Selective Access**:
- **NOT all admins have access to all pages** - access is granted by superadmin
- Admin roles represent higher authority personnel:
  - Director (e.g., Director of ECO, Director of Research)
  - Chief (e.g., Chief of Division)
  - Vice President
  - University President
  - Chairperson
  - Dean
  - Other executive positions
- Each admin can have **varied permissions** across different pages/categories
- Example: Director of ECO can have:
  - Full access to Construction of Infrastructure (COI)
  - Access to other pages (e.g., University Operations, Repairs) if granted by superadmin
  - Different permission levels per category (canAdd, canEdit, canDelete, canApprove)

**3. Permission Granularity**:
- **Page-level**: Which pages/categories an admin can access
- **Action-level**: What actions they can perform (add, edit, delete, approve, assign staff)
- **Category-level**: Different permissions per category (e.g., full access to COI, read-only to University Operations)
- **Project-level**: For Staff/Editor roles, project-specific assignments

**4. Current UI Expectations**:
- User-level: `role`, `department`, `allowedPages` (array of page IDs or '*' for all)
- Category-level (University Operations): Personnel assignments per category with permissions
- Project-level (Construction): Staff assignments per project with permissions
- Department-based: Department-to-category/page mappings

### Engineering Principles Applied

**SOLID Principles**:
- **Single Responsibility**: Each table has one clear purpose (e.g., `user_page_permissions` only handles page-level access)
- **Open/Closed**: Schema extensible via JSONB `metadata` fields without modifying table structure
- **Liskov Substitution**: Role types (SuperAdmin, Admin, Staff) can be used interchangeably in permission checks
- **Interface Segregation**: Separate tables for different permission scopes (page, category, project) - clients only depend on what they need
- **Dependency Inversion**: Permission logic depends on abstractions (role enum, permission flags) not concrete implementations

**DRY Principle**:
- **Reusable permission structure**: Same `user_page_permissions` table pattern for all page types
- **Common audit fields**: `created_by`, `updated_by`, `created_at`, `updated_at` in all tables
- **Shared enums**: Reuse `project_status_enum`, `campus_enum` across multiple tables
- **JSONB metadata pattern**: Consistent `metadata` JSONB field for extensibility across all tables

**KISS Principle**:
- **Simple role enum**: SuperAdmin, Admin, Staff, Editor, Client (no complex hierarchy)
- **Page permissions table**: One table to rule them all - `user_page_permissions` with page IDs and action flags
- **No role inheritance**: Each user's permissions are explicit (no "Admin inherits Staff permissions")
- **Status-based approval**: Simple pending/approved/rejected workflow
- **Superadmin flag**: Single boolean or role check, not a separate permission system

**YAGNI Principle**:
- **No role hierarchy chains**: SuperAdmin > Admin > Staff - but permissions are explicit, not inherited
- **No time-based permissions**: No expiration dates or temporary access
- **No conditional permissions**: No "if user is Director AND department is ECO then..." rules
- **No permission templates**: No pre-defined permission sets (each assignment is custom)
- **No audit log table**: Use `created_by`, `updated_by`, `created_at`, `updated_at` fields

### Required RBAC Schema Design - Option 1 (IMPLEMENTED)

**Decision**: Option 1 (Separate Tables) is selected for clarity, queryability, performance, and auditability.

#### Complete DDL for RBAC Option 1 Schema

```sql
-- ==========================================
-- RBAC ENHANCEMENT: Role Enum Type
-- ==========================================
CREATE TYPE IF NOT EXISTS role_type_enum AS ENUM (
  'SUPERADMIN',
  'ADMIN',
  'STAFF',
  'EDITOR',
  'CLIENT'
);

-- ==========================================
-- RBAC ENHANCEMENT: Enhanced user_roles table
-- ==========================================
-- Note: Existing user_roles table has (user_id, role_id) composite PK
-- We enhance it with superadmin flag and assignment tracking

ALTER TABLE IF EXISTS user_roles
  ADD COLUMN IF NOT EXISTS is_superadmin BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ DEFAULT NOW();

-- Add constraint: Only superadmin can assign admin roles
-- (Enforced via application logic or trigger - see Security Analysis)

-- Index for quick superadmin lookup
CREATE INDEX IF NOT EXISTS idx_user_roles_is_superadmin ON user_roles(is_superadmin) WHERE is_superadmin = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_roles_assigned_by ON user_roles(assigned_by);

-- ==========================================
-- RBAC ENHANCEMENT: user_page_permissions table
-- ==========================================
CREATE TABLE IF NOT EXISTS user_page_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  page_id VARCHAR(100) NOT NULL, -- e.g., 'construction-of-infrastructure', 'university-operations', 'higher-education-program'
  can_view BOOLEAN NOT NULL DEFAULT TRUE,
  can_add BOOLEAN NOT NULL DEFAULT FALSE,
  can_edit BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete BOOLEAN NOT NULL DEFAULT FALSE,
  can_approve BOOLEAN NOT NULL DEFAULT FALSE,
  can_assign_staff BOOLEAN NOT NULL DEFAULT FALSE,
  can_manage_permissions BOOLEAN NOT NULL DEFAULT FALSE, -- Superadmin only
  assigned_by UUID NOT NULL REFERENCES users(id), -- Must be superadmin (enforced in app logic)
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id),
  CONSTRAINT unique_user_page_permission UNIQUE (user_id, page_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_page_permissions_user_id ON user_page_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_page_permissions_page_id ON user_page_permissions(page_id);
CREATE INDEX IF NOT EXISTS idx_user_page_permissions_assigned_by ON user_page_permissions(assigned_by);
CREATE INDEX IF NOT EXISTS idx_user_page_permissions_deleted_at ON user_page_permissions(deleted_at) WHERE deleted_at IS NULL;

-- ==========================================
-- RBAC ENHANCEMENT: university_operations_personnel table
-- ==========================================
CREATE TABLE IF NOT EXISTS university_operations_personnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL, -- e.g., 'higher-education-program', 'research-program', 'advanced-education-program', 'technical-advisory-extension-program'
  can_add BOOLEAN NOT NULL DEFAULT FALSE,
  can_edit BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete BOOLEAN NOT NULL DEFAULT FALSE,
  can_approve BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_by UUID NOT NULL REFERENCES users(id), -- Admin or superadmin
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id),
  CONSTRAINT unique_user_category_assignment UNIQUE (user_id, category)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_university_operations_personnel_user_id ON university_operations_personnel(user_id);
CREATE INDEX IF NOT EXISTS idx_university_operations_personnel_category ON university_operations_personnel(category);
CREATE INDEX IF NOT EXISTS idx_university_operations_personnel_assigned_by ON university_operations_personnel(assigned_by);
CREATE INDEX IF NOT EXISTS idx_university_operations_personnel_deleted_at ON university_operations_personnel(deleted_at) WHERE deleted_at IS NULL;

-- ==========================================
-- RBAC ENHANCEMENT: construction_project_assignments table
-- ==========================================
CREATE TABLE IF NOT EXISTS construction_project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
  can_edit BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete BOOLEAN NOT NULL DEFAULT FALSE,
  can_view_documents BOOLEAN NOT NULL DEFAULT TRUE,
  can_upload_documents BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_by UUID NOT NULL REFERENCES users(id), -- Admin or superadmin
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id),
  CONSTRAINT unique_user_project_assignment UNIQUE (user_id, project_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_construction_project_assignments_user_id ON construction_project_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_construction_project_assignments_project_id ON construction_project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_construction_project_assignments_assigned_by ON construction_project_assignments(assigned_by);
CREATE INDEX IF NOT EXISTS idx_construction_project_assignments_deleted_at ON construction_project_assignments(deleted_at) WHERE deleted_at IS NULL;

-- ==========================================
-- RBAC ENHANCEMENT: Helper function to check if user is superadmin
-- ==========================================
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

-- ==========================================
-- RBAC ENHANCEMENT: Helper function to get user page permissions
-- ==========================================
CREATE OR REPLACE FUNCTION get_user_page_permission(
  p_user_id UUID,
  p_page_id VARCHAR(100),
  p_action VARCHAR(50) -- 'view', 'add', 'edit', 'delete', 'approve', 'assign_staff', 'manage_permissions'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_superadmin BOOLEAN;
  v_permission RECORD;
BEGIN
  -- Check if user is superadmin (bypass all checks)
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

  -- If no permission record exists, deny access
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

#### Schema Design Rationale

1. **`user_roles` Enhancement**:
   - Adds `is_superadmin` flag for quick privilege checks
   - Adds `assigned_by` and `assigned_at` for audit trail
   - Maintains existing composite primary key structure

2. **`user_page_permissions`**:
   - Core table for page-level access control
   - Granular action flags (can_view, can_add, can_edit, can_delete, can_approve, can_assign_staff, can_manage_permissions)
   - UNIQUE constraint prevents duplicate permissions per user per page
   - Soft delete support via `deleted_at`

3. **`university_operations_personnel`**:
   - Category-level assignments for Staff/Editor roles
   - Separate from page permissions (allows Staff to have different permissions per category)
   - UNIQUE constraint prevents duplicate assignments

4. **`construction_project_assignments`**:
   - Project-level assignments for Staff/Editor roles
   - Document-specific permissions (can_view_documents, can_upload_documents)
   - UNIQUE constraint prevents duplicate assignments

5. **Helper Functions**:
   - `is_user_superadmin()`: Quick superadmin check
   - `get_user_page_permission()`: Centralized permission check logic

**Option 2: JSONB Metadata (Rejected - Not Recommended)**

Store in `users.metadata` JSONB:
```sql
users.metadata = {
  "role": "ADMIN",
  "isSuperAdmin": false,
  "allowedPages": [
    {
      "pageId": "construction-of-infrastructure",
      "canView": true,
      "canAdd": true,
      "canEdit": true,
      "canDelete": true,
      "canApprove": true,
      "canAssignStaff": true
    }
  ]
}
```

**Why Option 2 is Rejected**:
- ❌ Poor queryability (requires JSONB path queries, slower)
- ❌ No foreign key constraints (data integrity risk)
- ❌ Difficult to audit (permissions buried in JSONB)
- ❌ No indexes on permission flags (performance issues)
- ❌ Harder to implement row-level security policies
- ❌ Violates DRY principle (permission logic duplicated in JSONB structure)

**Option 1 Selected**: Separate tables provide better queryability, performance, auditability, and maintainability while still being simple (KISS principle).

### Permission Check Logic (Pseudocode)

```typescript
function canAccessPage(userId, pageId, action) {
  // 1. Check if superadmin
  if (user.is_superadmin) return true;
  
  // 2. Check user_page_permissions for this page
  const permission = getUserPagePermission(userId, pageId);
  if (!permission) return false;
  
  // 3. Check action-specific flag
  switch(action) {
    case 'view': return permission.can_view;
    case 'add': return permission.can_add;
    case 'edit': return permission.can_edit;
    case 'delete': return permission.can_delete;
    case 'approve': return permission.can_approve;
    case 'assign_staff': return permission.can_assign_staff;
  }
  
  return false;
}
```

### Example Scenarios

**Scenario 1: Director of ECO**
- Role: Admin
- Department: Engineering and Construction Office (ECO)
- Page Permissions:
  - `construction-of-infrastructure`: Full access (canAdd, canEdit, canDelete, canApprove, canAssignStaff)
  - `university-operations`: Read-only (canView only) - granted by superadmin
  - `repairs-category`: Read-only (canView only) - granted by superadmin

**Scenario 2: University President**
- Role: Admin
- Department: Office of the President
- Page Permissions:
  - All pages: Full access (granted by superadmin)
  - Can approve all records
  - Can assign staff to any category

**Scenario 3: Research Director**
- Role: Admin
- Department: Research Office
- Page Permissions:
  - `university-operations` > `research-program`: Full access
  - `university-operations` > `higher-education-program`: Read-only
  - `construction-of-infrastructure`: No access (not granted by superadmin)

## PostgreSQL Syntax Compliance

**Current Schema Issues**:
1. ✅ Uses `TIMESTAMPTZ` (correct)
2. ✅ Uses `UUID` with `gen_random_uuid()` (correct)
3. ✅ Uses `JSONB` for flexible data (correct)
4. ✅ Uses `ENUM` types (correct)
5. ✅ Uses `DECIMAL` for monetary values (correct)
6. ⚠️ Check: `POINT` type for coordinates (PostgreSQL native)
7. ⚠️ Check: `BIGSERIAL` for `infra_project_uid` (PostgreSQL native)

**Required PostgreSQL Features**:
- `CREATE TYPE ... AS ENUM` ✅
- `CREATE TABLE IF NOT EXISTS` ✅
- `REFERENCES` foreign keys ✅
- `GIN` indexes for JSONB ✅
- `CHECK` constraints ✅
- `UNIQUE` constraints ✅
- `PRIMARY KEY` constraints ✅

**No Firebird/MySQL Syntax**:
- ❌ No `AUTOINCREMENT` (use `SERIAL`/`BIGSERIAL` or `gen_random_uuid()`)
- ❌ No `TIMESTAMP` without timezone (use `TIMESTAMPTZ`)
- ❌ No `VARCHAR` without length (always specify length)

## Missing Attributes Analysis

### University Operations
1. ✅ All Target vs Actual fields mapped
2. ✅ All Financial fields mapped
3. ⚠️ `indicator_code` in DB but not in UI forms (used for reference only)
4. ⚠️ `subcategory_data` JSONB exists but UI forms don't show Research/Extension-specific fields in EditAssessmentModal (may be in separate forms)

### Construction Infrastructure
1. ✅ Core project fields mapped
2. ✅ Financial fields mapped (via `construction_project_financials`)
3. ✅ Progress fields mapped (via `construction_project_progress`)
4. ✅ POW items mapped (via `construction_pow_items`)
5. ⚠️ Missing: Project team assignments (UI shows team tab but no DB table)
6. ⚠️ Missing: Document metadata (UI shows documents tab but only `media` table exists)
7. ⚠️ Missing: Gallery images metadata (UI shows gallery tab but only `media` table exists)

## MIS Office Policy Analysis

**Source**: `docs/Web Development Policy (For Board Approval).docx.pdf`

### MIS Preferred Technology Stack

**Front-End**:
- **Vuetify** - Preferred UI framework
- **NuxtJS** - Preferred front-end application framework
- **JavaScript/ECMAScript** - Language

**Back-End**:
- **NestJS** - Preferred back-end API framework
- **Node.js LTS** - Minimum version 20.x
- **Yarn Package Manager** - Version 1.22.x and above

**Deployment & Infrastructure**:
- **PM2** - Process manager for deployment
- **Nginx 1.x** - Web server (Linux)
- **SSL/TLS** - Required for authentication and secure connections
- **Open LDAP** - Lightweight Directory Access Protocol for authentication

**Database** (Acceptable):
- PostgreSQL ✅ (Current choice - acceptable)
- MySQL ✅
- SQL Lite ✅
- Firebird ✅

**Security Requirements**:
- HTTPS required for login screens (no plain text passwords)
- Security scanning required (WebInspect, AppScan, or open-source utilities)
- Dev/test environment isolation before production
- Periodic re-scanning of production applications

**Browser Support**:
- Mozilla Firefox 17+
- Microsoft Edge
- Safari 5+
- Adherence to W3C web standards

### Current Technology Stack vs MIS Policy

| Technology Area | MIS Preferred | Current Stack | Status |
|----------------|---------------|---------------|--------|
| **Front-End Framework** | NuxtJS (Vue.js) | React + Vite | ❌ **MISMATCH** |
| **UI Framework** | Vuetify | Radix UI (React) | ❌ **MISMATCH** |
| **Back-End Framework** | NestJS | Supabase (BaaS) | ⚠️ **PARTIAL** (Supabase provides backend, but not NestJS) |
| **Package Manager** | Yarn 1.22.x+ | npm | ❌ **MISMATCH** |
| **Deployment** | PM2 | Not configured | ❌ **MISSING** |
| **Web Server** | Nginx 1.x | Vite dev server | ⚠️ **DEV ONLY** (Production needs Nginx) |
| **Database** | PostgreSQL/MySQL/SQLite/Firebird | PostgreSQL | ✅ **COMPLIANT** |
| **Node.js Version** | LTS 20.x+ | Node.js 20.10.0 (from package.json) | ✅ **COMPLIANT** |
| **SSL/TLS** | Required | Not configured | ❌ **MISSING** |
| **LDAP Authentication** | Supported | Supabase Auth | ⚠️ **DIFFERENT** (Supabase auth, not LDAP) |

### shadcn Components Compatibility Analysis

**shadcn-vue Integration** (MIS-Compliant UI Framework):
- ✅ **Compatible with Vue 3** - Full support for Composition API
- ✅ **Compatible with NuxtJS** - Works seamlessly with Nuxt 3
- ✅ **Uses Tailwind CSS** - Same styling approach as shadcn/ui (React)
- ✅ **Component Library** - Pre-built, accessible, customizable components
- ✅ **Installation**: `npx shadcn-vue init` and `npx shadcn-vue add [component]`
- ✅ **Vuetify Compatibility**: Can be used alongside Vuetify (shadcn-vue for base components, Vuetify for Material Design components)

**Vuetify + shadcn-vue Hybrid Approach**:
- **Vuetify**: Material Design components, data tables, forms, navigation
- **shadcn-vue**: Base UI primitives (buttons, dialogs, tabs, cards) with Tailwind styling
- **Compatibility**: Both work with Vue 3/NuxtJS, can be used together
- **Recommendation**: Use shadcn-vue for core UI components, Vuetify for complex data tables and Material Design elements

**Current React Components (Reference Only)**:
- Using **Radix UI** (React) - Reference for UI patterns, not production code
- Using **Tailwind CSS** - Compatible with shadcn-vue (same styling system)
- Using **lucide-react** - Replace with `lucide-vue-next` for Vue
- **Figma AI Code**: React components are design reference, must be reimplemented in Vue

**Migration Path for MIS Compliance**:
1. **Front-End**: Migrate from React/Vite to NuxtJS (Vue 3)
2. **UI Components**: Replace Radix UI with shadcn-vue (or Vuetify)
3. **Icons**: Replace lucide-react with lucide-vue-next
4. **Package Manager**: Switch from npm to Yarn 1.22.x+
5. **Deployment**: Configure PM2 and Nginx
6. **Security**: Implement SSL/TLS certificates
7. **Reference Code**: Use React components as UI/UX pattern reference only

### Technology Stack Recommendations

**Option 1: Full MIS Compliance (MANDATORY - Recommended)**
- ✅ Migrate to **NuxtJS** (Vue 3) for front-end
- ✅ Use **shadcn-vue** for base UI components (buttons, dialogs, tabs, cards)
- ✅ Use **Vuetify** for complex components (data tables, forms, navigation)
- ✅ Use **NestJS** for back-end API (or keep Supabase if MIS approves)
- ✅ Switch to **Yarn** package manager (version 1.22.x+)
- ✅ Configure **PM2** for deployment
- ✅ Set up **Nginx** for production web server
- ✅ Implement **SSL/TLS** certificates
- ✅ Consider **LDAP** integration for authentication
- ✅ Use React code as **reference only** for UI patterns and data structures

**Implementation Strategy**:
1. **Phase 1**: Set up NuxtJS project with Yarn, shadcn-vue, Vuetify
2. **Phase 2**: Port database schema (PostgreSQL - already compliant)
3. **Phase 3**: Reimplement UI components from React reference code
4. **Phase 4**: Port RBAC services to Vue/TypeScript
5. **Phase 5**: Configure PM2, Nginx, SSL/TLS for production

**shadcn-vue + Vuetify Integration**:
- **shadcn-vue**: Base components (Button, Card, Dialog, Tabs, Badge, Input, Select, etc.)
- **Vuetify**: Advanced components (DataTable, Form validation, Navigation drawer, Date pickers)
- **Compatibility**: Both use Vue 3 Composition API, can coexist in same project
- **Styling**: shadcn-vue uses Tailwind CSS, Vuetify uses Material Design - can be configured to work together

**React Code Reference Usage**:
- Extract UI patterns (form layouts, table structures, navigation flows)
- Extract data structures (TypeScript interfaces, type definitions)
- Extract business logic patterns (RBAC checks, data validation, state management)
- **DO NOT** copy React code directly - reimplement in Vue following same patterns

**Example: Converting React Component to Vue/NuxtJS**:
```typescript
// React Reference (prototype/Admin Side/src/components/university-operations/HigherEducationProgramPage.tsx)
// Extract: Form structure, quarterly input fields, data table layout

// Vue/NuxtJS Implementation (to be created)
// Use shadcn-vue Button, Card, Input, Select components
// Use Vuetify VDataTable for complex tables
// Use Vue 3 Composition API (ref, computed, watch)
// Port TypeScript interfaces to Vue TypeScript
```

**shadcn-vue + Vuetify Integration Pattern**:
```vue
<!-- Example: Combining shadcn-vue and Vuetify -->
<template>
  <div>
    <!-- shadcn-vue components for base UI -->
    <Button variant="default">Save</Button>
    <Card>
      <CardHeader>
        <CardTitle>Project Details</CardTitle>
      </CardHeader>
      <CardContent>
        <!-- Vuetify components for complex data -->
        <VDataTable
          :headers="headers"
          :items="projects"
          :items-per-page="10"
        />
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
// Vue 3 Composition API
import { ref } from 'vue'
import { Button } from '@/components/ui/button' // shadcn-vue
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card' // shadcn-vue
// Vuetify components auto-imported in NuxtJS with Vuetify module
</script>
```

### Key Policy Constraints

1. **Open-Source Only**: All technologies must be open-source (current stack: ✅ compliant)
2. **Consultation Required**: Technologies not listed must be approved by MIS before development
3. **Security Scanning**: Applications must pass security scans before production
4. **Browser Compatibility**: Must support Firefox 17+, Edge, Safari 5+
5. **SSL Required**: All authentication must use HTTPS
6. **LDAP Support**: Authentication mechanisms may use campus LDAP server

### Database Compliance

**PostgreSQL** is fully acceptable per MIS policy:
- Listed as preferred database platform
- Current schema uses PostgreSQL-native syntax ✅
- No migration needed for database layer

## RBAC Security Analysis

### Current Security Vulnerabilities and Gaps

**1. Client-Side Permission Checks Only**
- **Risk**: Current React code (reference) relies on `user_metadata.allowedPages` array stored in Supabase user metadata
- **Vulnerability**: Client-side checks can be bypassed by manipulating browser state or API calls
- **Location**: `prototype/Admin Side/src/App.tsx` lines 343-384 - `hasAccessToPage()` function
- **Severity**: 🔴 **HIGH** - No server-side validation
- **Mitigation**: Implement server-side permission checks using `user_page_permissions` table. Never trust client-side permission data.

**2. No SuperAdmin Protection**
- **Risk**: Current code checks `userRole === 'Admin'` but doesn't distinguish SuperAdmin from regular Admin
- **Vulnerability**: Any Admin can potentially modify permissions if client-side checks are bypassed
- **Location**: Multiple RBAC services check `userRole === 'Admin'` without SuperAdmin distinction
- **Severity**: 🔴 **HIGH** - Privilege escalation risk
- **Mitigation**: Use `is_user_superadmin()` function and `is_superadmin` flag. Only SuperAdmin can assign page permissions to Admins.

**3. Missing Server-Side Validation**
- **Risk**: Permission checks in `RBACService.ts` files are client-side only (localStorage, in-memory Maps)
- **Vulnerability**: Data stored in `localStorage` can be manipulated by users
- **Location**: `prototype/Admin Side/src/components/construction-infrastructure/services/EnhancedRBACService.ts` lines 84-124
- **Severity**: 🔴 **HIGH** - No persistence or server validation
- **Mitigation**: All permission checks must query database tables. Remove localStorage-based permission storage.

**4. No Audit Trail for Permission Changes**
- **Risk**: Current schema lacks `assigned_by` tracking in some tables
- **Vulnerability**: Cannot track who granted permissions or when
- **Severity**: 🟡 **MEDIUM** - Compliance and accountability issue
- **Mitigation**: ✅ **FIXED** - All RBAC tables include `assigned_by` and `assigned_at` fields

**5. Permission Escalation via Metadata Manipulation**
- **Risk**: `user_metadata.allowedPages` can be modified if Supabase RLS policies are misconfigured
- **Vulnerability**: Users could modify their own `allowedPages` array
- **Severity**: 🔴 **HIGH** - Direct privilege escalation
- **Mitigation**: 
  - Never allow users to modify their own `user_metadata.allowedPages`
  - Use database tables (`user_page_permissions`) as source of truth
  - Implement Row Level Security (RLS) policies in Supabase/PostgreSQL

**6. Missing Foreign Key Constraints on Assignment Tables**
- **Risk**: `assigned_by` field in permission tables doesn't enforce that assigner is SuperAdmin
- **Vulnerability**: Regular Admin could assign permissions if application logic is bypassed
- **Severity**: 🟡 **MEDIUM** - Data integrity risk
- **Mitigation**: 
  - Add CHECK constraint or trigger to validate `assigned_by` is SuperAdmin
  - Enforce in application layer with explicit SuperAdmin checks

**7. No Rate Limiting on Permission Checks**
- **Risk**: Permission check functions could be called excessively (DoS)
- **Vulnerability**: Database performance degradation
- **Severity**: 🟡 **MEDIUM** - Performance and availability risk
- **Mitigation**: Implement caching layer (Redis) for permission checks, add rate limiting

**8. Soft Delete Bypass**
- **Risk**: If `deleted_at` is not checked in all queries, deleted permissions could still grant access
- **Vulnerability**: Permissions marked as deleted could still be active
- **Severity**: 🟡 **MEDIUM** - Access control bypass
- **Mitigation**: Always include `WHERE deleted_at IS NULL` in permission queries. Use helper functions.

**9. SQL Injection Risk in Permission Queries**
- **Risk**: If `page_id` or `category` values are constructed from user input without sanitization
- **Vulnerability**: SQL injection attacks
- **Severity**: 🔴 **HIGH** - Data breach risk
- **Mitigation**: 
  - Use parameterized queries (Supabase client handles this)
  - Validate `page_id` against whitelist of valid page identifiers
  - Use ENUM types where possible

**10. Missing Row Level Security (RLS) Policies**
- **Risk**: Without RLS, users could query permission tables directly via API
- **Vulnerability**: Information disclosure (users could see other users' permissions)
- **Severity**: 🟡 **MEDIUM** - Privacy and security risk
- **Mitigation**: Implement PostgreSQL RLS policies:
  ```sql
  -- Example RLS policy for user_page_permissions
  ALTER TABLE user_page_permissions ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY user_page_permissions_select_own
    ON user_page_permissions
    FOR SELECT
    USING (user_id = current_setting('app.current_user_id')::UUID);
  
  CREATE POLICY user_page_permissions_admin_only
    ON user_page_permissions
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = current_setting('app.current_user_id')::UUID
          AND is_superadmin = TRUE
      )
    );
  ```

### Security Best Practices for RBAC Implementation

**1. Defense in Depth**:
- ✅ Client-side checks (UI hiding/showing) - User experience only
- ✅ Server-side permission checks (API endpoints) - Security enforcement
- ✅ Database-level constraints (RLS, triggers) - Final security layer

**2. Principle of Least Privilege**:
- ✅ Default all permissions to FALSE
- ✅ Grant only necessary permissions per role
- ✅ Regular audits of permission assignments

**3. Audit and Monitoring**:
- ✅ Log all permission changes (who, what, when)
- ✅ Monitor failed permission checks (potential attack attempts)
- ✅ Alert on privilege escalation attempts

**4. Secure Defaults**:
- ✅ New users have no permissions by default
- ✅ SuperAdmin must explicitly grant permissions
- ✅ Deleted users' permissions are automatically revoked (CASCADE)

**5. Input Validation**:
- ✅ Whitelist valid `page_id` values
- ✅ Validate UUIDs before database queries
- ✅ Sanitize all user inputs

### Limitations of Current RBAC Design

**1. No Time-Based Permissions**:
- **Limitation**: Cannot set expiration dates on permissions
- **Impact**: Permissions must be manually revoked
- **Workaround**: Scheduled job to review and revoke stale permissions

**2. No Conditional Permissions**:
- **Limitation**: Cannot implement "if user is Director AND department is ECO then grant access"
- **Impact**: Must create separate permission records for each combination
- **Workaround**: Use `user_departments` table join in permission checks

**3. No Permission Templates**:
- **Limitation**: Cannot create reusable permission sets
- **Impact**: Must assign permissions individually for each user
- **Workaround**: Application layer can provide permission templates that create multiple records

**4. No Hierarchical Permissions**:
- **Limitation**: Cannot inherit permissions from parent pages/categories
- **Impact**: Must grant permissions for each page explicitly
- **Workaround**: Application layer can implement permission inheritance logic

**5. No Delegation**:
- **Limitation**: Admins cannot delegate their permissions to others temporarily
- **Impact**: Only SuperAdmin can grant permissions
- **Workaround**: SuperAdmin must grant permissions directly

### Recommended Security Enhancements

**1. Implement RLS Policies** (Priority: HIGH):
```sql
-- Enable RLS on all RBAC tables
ALTER TABLE user_page_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_operations_personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_project_assignments ENABLE ROW LEVEL SECURITY;
```

**2. Add Permission Assignment Validation Trigger** (Priority: HIGH):
```sql
CREATE OR REPLACE FUNCTION validate_permission_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only SuperAdmin can assign permissions
  IF NOT is_user_superadmin(NEW.assigned_by) THEN
    RAISE EXCEPTION 'Only SuperAdmin can assign permissions';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_page_permissions_assignment_check
  BEFORE INSERT OR UPDATE ON user_page_permissions
  FOR EACH ROW
  EXECUTE FUNCTION validate_permission_assignment();
```

**3. Add Permission Audit Log Table** (Priority: MEDIUM):
```sql
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
```

**4. Implement Permission Caching** (Priority: MEDIUM):
- Use Redis to cache permission checks
- Cache TTL: 5 minutes
- Invalidate cache on permission changes

**5. Add Rate Limiting** (Priority: MEDIUM):
- Limit permission check API calls to 100/minute per user
- Implement exponential backoff for failed checks

## Migration Readiness & Greenfield Appropriateness Assessment

### SQL File Versioning

**Action Taken**: Created dated directory `prototype/database draft/Latest db schema/2025-12-16/` and duplicated `PMODataFirebird_Enhanced_postgres.sql` for version control.

**Naming Convention**: `YYYY-MM-DD` format (e.g., `2025-12-16`) for chronological sorting and easy identification.

**Rationale**: Allows tracking schema evolution, enables rollback capability, and maintains version history per ACE framework.

### Sequence Migration Assessment

**Current State**: Schema uses `BIGSERIAL` for `infra_project_uid` (line 260 in `construction_projects` table).

**PostgreSQL Behavior**: `BIGSERIAL` automatically creates a sequence `construction_projects_infra_project_uid_seq`. No explicit `CREATE SEQUENCE` statement needed.

**Migration Readiness**: ✅ **READY**
- Uses `IF NOT EXISTS` pattern (idempotent)
- Sequences are auto-created on table creation
- PostgreSQL/pgAdmin handles this seamlessly
- No manual sequence management required

**Recommendation**: Keep `BIGSERIAL` - it's PostgreSQL-native, migration-friendly, and follows best practices.

### Trigger Migration Readiness

**Current State**: Schema has **NO triggers** yet. Planned triggers from RBAC security enhancements:
- `validate_permission_assignment()` - Permission assignment validation trigger

**Migration Best Practices**:
1. **Function First**: Create function BEFORE trigger (order matters)
2. **Idempotency**: Use `CREATE OR REPLACE FUNCTION` for trigger functions
3. **Existence Check**: Use `CREATE TRIGGER IF NOT EXISTS` (PostgreSQL 9.5+) or manual existence check
4. **Rollback**: Use `DROP TRIGGER IF EXISTS` for safe rollback
5. **Testing**: Test triggers in transaction blocks before commit

**Migration Order**:
```
1. CREATE OR REPLACE FUNCTION validate_permission_assignment() ...
2. CREATE TRIGGER IF NOT EXISTS user_page_permissions_assignment_check ...
```

**Recommendation**: Triggers are appropriate for security-critical operations (permission validation) but should be minimal for startup/MVP (YAGNI principle).

### Index Appropriateness for Greenfield/Startup

**Current State**: Schema has **86 indexes** across 30 tables.

**Index Analysis**:

**Essential Indexes (KEEP)** ✅:
- Foreign keys: `user_id`, `project_id`, `operation_id`, `contractor_id`, etc.
- Unique constraints: `email`, `project_code`, `name` (where UNIQUE)
- Frequently queried filters: `status`, `campus`, `fiscal_year`, `is_active`
- Soft delete filters: `deleted_at` (partial indexes: `WHERE deleted_at IS NULL`)
- Composite indexes: `(documentable_type, documentable_id)`, `(mediable_type, mediable_id)`

**Questionable Indexes (REVIEW)** ⚠️:
- Low-cardinality fields: `is_active`, `is_featured` (boolean fields with few distinct values)
- Multiple indexes on same table: `construction_projects` has 7 indexes (may be over-indexed)
- GIN indexes on JSONB: `subcategory_data` GIN index (may be premature optimization)
- Date indexes: Some date indexes may not be needed if queries don't filter by date

**YAGNI Assessment**:
- **For Greenfield/Startup**: Start with minimal indexes (FKs, unique constraints, essential filters)
- **Add Performance Indexes**: AFTER measuring actual query patterns and identifying bottlenecks
- **Current Schema**: Over-indexed for MVP - many indexes may never be used

**Recommendation**:
- **Keep**: Foreign keys, unique constraints, status/campus filters, soft delete filters
- **Defer**: Low-cardinality indexes, GIN indexes on JSONB, multiple indexes on same table
- **Production**: Use `CREATE INDEX CONCURRENTLY` for zero-downtime index creation

**Index Count Reduction Strategy**:
- Start with ~40-50 essential indexes (reduce from 86)
- Monitor query performance in production
- Add indexes based on `EXPLAIN ANALYZE` results
- Use PostgreSQL's `pg_stat_user_indexes` to identify unused indexes

### Trigger Appropriateness for Greenfield/Startup

**Planned Triggers**:

1. **Permission Assignment Validation** (Security-Critical)
   - **Purpose**: Prevent privilege escalation at database level
   - **YAGNI Assessment**: ✅ **APPROPRIATE**
   - **Rationale**: Security-critical operation, database-level enforcement (defense in depth), prevents unauthorized permission assignments
   - **Recommendation**: **IMPLEMENT** - This is essential for RBAC security

2. **Audit Log Triggers** (Compliance)
   - **Purpose**: Automatically log permission changes to `permission_audit_log` table
   - **YAGNI Assessment**: ⚠️ **DEFER**
   - **Rationale**: Can use application-level logging initially, add database triggers when compliance requirements emerge
   - **Recommendation**: **DEFER** - Implement in application layer first, add triggers later if needed

3. **Calculated Field Triggers** (Performance)
   - **Purpose**: Auto-calculate `utilization_per_target`, `variance`, `disbursement_rate` in `operation_financials`
   - **YAGNI Assessment**: ⚠️ **DEFER**
   - **Rationale**: Calculate in application layer initially, add triggers when performance becomes issue
   - **Recommendation**: **DEFER** - Calculate in application code, add triggers only if performance profiling shows need

**Summary**:
- **Implement**: Security triggers (permission validation) - essential for RBAC
- **Defer**: Audit triggers, calculated field triggers - add when actual need demonstrated (YAGNI principle)

### Migration Sequence Best Practices

**Correct Migration Order** (PostgreSQL/pgAdmin):

```
1. ENUM Types          → CREATE TYPE IF NOT EXISTS ...
2. Tables              → CREATE TABLE IF NOT EXISTS ...
3. Indexes             → CREATE INDEX IF NOT EXISTS ...
4. Functions           → CREATE OR REPLACE FUNCTION ...
5. Triggers            → CREATE TRIGGER IF NOT EXISTS ...
6. RLS Policies        → ALTER TABLE ... ENABLE ROW LEVEL SECURITY; CREATE POLICY ...
```

**Key Principles**:
1. **Idempotency**: Use `IF NOT EXISTS` for tables/indexes/types, `CREATE OR REPLACE` for functions
2. **Transactions**: Wrap migrations in transactions for rollback capability
3. **Sequences**: `BIGSERIAL`/`SERIAL` auto-create sequences - no explicit `CREATE SEQUENCE` needed
4. **Concurrent Indexes**: Use `CREATE INDEX CONCURRENTLY` in production (cannot be in transaction)
5. **Dependencies**: Functions depend on tables, triggers depend on functions - order accordingly

**Current Schema Assessment**:
- ✅ Follows correct order: ENUMs → Tables → Indexes
- ✅ Uses `IF NOT EXISTS` pattern (idempotent)
- ✅ No explicit sequences (uses `BIGSERIAL` auto-sequence)
- ✅ Ready for migration

**Migration Readiness**: ✅ **READY** - Schema is migration-ready with proper ordering and idempotency.

### Greenfield/Startup Recommendations Summary

**Indexes**:
- **Start Minimal**: Keep ~40-50 essential indexes (FKs, unique, status filters)
- **Add Later**: Add performance indexes after query profiling
- **Monitor**: Use `pg_stat_user_indexes` to identify unused indexes

**Triggers**:
- **Implement**: Security triggers (permission validation) - essential
- **Defer**: Audit triggers, calculated field triggers - add when needed

**Sequences**:
- **Keep**: `BIGSERIAL` auto-sequence pattern - migration-friendly

**Migration**:
- **Order**: ENUMs → Tables → Indexes → Functions → Triggers → RLS
- **Idempotency**: Use `IF NOT EXISTS` and `CREATE OR REPLACE`
- **Transactions**: Wrap in transactions for rollback capability

## Construction Infrastructure (COI) Database Integration Analysis

### Overview
This section analyzes the Construction Infrastructure project detail page components (`prototype/Admin Side/src/components/construction-infrastructure`) to identify all data structures, modals, and attributes that require database integration. The project detail page contains **7 tabs** with varied data requirements.

### Component Structure Analysis

#### 1. Overview Tab (`OverviewTab.tsx`)
**Location**: `project-detail/tabs/OverviewTab.tsx`

**Section A: General**
- **Project Description** (TEXT): Detailed project description
- **Ideal Infrastructure Image** (TEXT/VARCHAR): URL or file path to ideal/proposed infrastructure image
- **Accomplishment Records** (REPEATING TABLE): 
  - `date_entry` (DATE)
  - `comments` (TEXT)
  - `remarks_comments` (TEXT)

**Section B: Actual Accomplishment & Key Info**
- **Actual Accomplishment Records** (REPEATING TABLE):
  - `date_entry` (DATE)
  - `progress_accomplishment` (DECIMAL 0-100)
  - `actual_percent` (DECIMAL 0-100)
  - `target_percent` (DECIMAL 0-100)
- **Progress Summary Records** (REPEATING TABLE):
  - `period` (VARCHAR) - e.g., "Q1 2024", "January 2024"
  - `physical_progress` (DECIMAL 0-100)
  - `financial_progress` (DECIMAL 0-100)
  - `issues` (TEXT)
  - `recommendations` (TEXT)
- **Project Status Fields**:
  - `date_started` (DATE)
  - `target_date_completion` (DATE)
  - `original_contract_duration` (VARCHAR) - e.g., "365 days"
  - `contractor_name` (VARCHAR)

**Financial Accomplishment Reports** (from `ConstructionProjectDetail.tsx` Overview Tab):
- `report_title` (VARCHAR) - e.g., "Q4 2024 Financial Report"
- `report_date` (DATE) - e.g., "As of December 31, 2024"
- `target_budget` (DECIMAL)
- `actual_spent` (DECIMAL)
- `variance` (DECIMAL) - calculated: target_budget - actual_spent
- `utilization` (DECIMAL 0-100) - calculated: (actual_spent / target_budget) * 100
- `status` (ENUM: 'Active' | 'Historical')
- `remarks` (TEXT)

**Physical Accomplishment by Phase** (from `ConstructionProjectDetail.tsx` Overview Tab):
- `phase_name` (VARCHAR) - e.g., "Phase 1: Preparatory Work"
- `phase_description` (TEXT)
- `target_progress` (DECIMAL 0-100)
- `actual_progress` (DECIMAL 0-100)
- `variance` (DECIMAL) - calculated: actual_progress - target_progress
- `status` (ENUM: 'Complete' | 'In Progress' | 'Pending' | 'Scheduled')
- `target_start_date` (DATE)
- `target_end_date` (DATE)
- `actual_start_date` (DATE, nullable)
- `actual_end_date` (DATE, nullable)
- `remarks` (TEXT)

**Project Information Dialog** (from `OverviewCRUDDialogs.tsx`):
- `project_name` (VARCHAR)
- `location` (VARCHAR)
- `funding_source` (VARCHAR)
- `contract_duration` (VARCHAR)
- `project_status` (ENUM: 'Planning' | 'Ongoing' | 'Completed' | 'Delayed' | 'Suspended')
- `contractor` (VARCHAR)
- `description` (TEXT)
- `total_budget` (DECIMAL)
- `beneficiaries` (VARCHAR) - e.g., "5,000+ students and staff"
- `start_date` (DATE)
- `target_end_date` (DATE)
- `objectives` (TEXT[] or JSONB) - Array of objective strings
- `key_features` (TEXT[] or JSONB) - Array of key feature strings

#### 2. Timeline Tab (`TimelineTabEnhanced.tsx`)
**Location**: `project-detail/tabs/TimelineTabEnhanced.tsx`

**Milestones** (from `TimelineDialogs.tsx`):
- `id` (VARCHAR) - e.g., "MS-001"
- `title` (VARCHAR)
- `description` (TEXT)
- `start_date` (DATE)
- `end_date` (DATE)
- `actual_start_date` (DATE, nullable)
- `actual_end_date` (DATE, nullable)
- `status` (ENUM: 'Pending' | 'In Progress' | 'Completed' | 'Delayed')
- `progress` (DECIMAL 0-100)
- `duration_days` (INTEGER) - calculated from start/end dates
- `variance_days` (INTEGER, nullable) - calculated: planned_duration - actual_duration

#### 3. Individual POW Tab (`IndividualPOWTabEnhanced.tsx`)
**Location**: `project-detail/tabs/IndividualPOWTabEnhanced.tsx`

**POW Items** (from `POWDialogs.tsx`):
- `id` (VARCHAR) - e.g., "POW-001"
- `description` (TEXT)
- `quantity` (DECIMAL)
- `unit` (VARCHAR) - e.g., "cubic meters", "tons", "square meters", "lot"
- `estimated_material_cost` (DECIMAL)
- `estimated_labor_cost` (DECIMAL)
- `estimated_project_cost` (DECIMAL) - calculated: material + labor (can be overridden)
- `unit_cost` (DECIMAL) - calculated: project_cost / quantity (can be overridden)
- `date_of_entry` (DATE)
- `status` (ENUM: 'Active' | 'Completed' | 'Pending' | 'Cancelled')
- `remarks` (TEXT, nullable)
- `is_unit_cost_overridden` (BOOLEAN) - flag if unit cost was manually edited

**Note**: Current schema has `construction_pow_items` table but missing:
- `estimated_material_cost` (separate from total_cost)
- `estimated_labor_cost` (separate from total_cost)
- `date_of_entry` (DATE)
- `status` (ENUM)
- `remarks` (TEXT)
- `is_unit_cost_overridden` (BOOLEAN)

#### 4. Data Analytics Tab (`DataAnalyticsTab.tsx`)
**Location**: `project-detail/tabs/DataAnalyticsTab.tsx`

**Data Source**: Uses POW items data for analytics. No new fields required - aggregates from POW items.

#### 5. Gallery Tab (`GalleryTab.tsx`)
**Location**: `project-detail/tabs/GalleryTab.tsx`

**Gallery Items** (from `GalleryTypes.ts`):
- `id` (UUID)
- `project_id` (UUID) - FK to construction_projects
- `filename` (VARCHAR)
- `original_name` (VARCHAR)
- `type` (ENUM: 'image' | 'video' | 'document')
- `mime_type` (VARCHAR)
- `url` (VARCHAR)
- `thumbnail_url` (VARCHAR, nullable)
- `size` (BIGINT) - file size in bytes
- `dimensions` (JSONB, nullable) - {width: INTEGER, height: INTEGER}
- `alt_text` (VARCHAR)
- `category` (ENUM: 'progress' | 'equipment' | 'materials' | 'safety' | 'completed' | 'other')
- `tags` (TEXT[] or JSONB)
- `capture_date` (DATE, nullable) - when photo was taken
- `upload_date` (DATE)
- `uploaded_by` (UUID) - FK to users
- `order` (INTEGER) - for sorting/ordering
- `location` (JSONB, nullable) - {latitude: DECIMAL, longitude: DECIMAL, description: VARCHAR}
- `metadata` (JSONB) - {camera: VARCHAR, settings: JSONB, description: TEXT}
- `status` (ENUM: 'uploading' | 'processing' | 'ready' | 'error')

**Note**: Current schema has `media` table (polymorphic) but missing:
- `thumbnail_url`
- `dimensions` (JSONB)
- `category` (ENUM specific to gallery)
- `tags` (array)
- `capture_date`
- `order` (for sorting)
- `location` (JSONB with GPS coordinates)

#### 6. Documents Tab (`DocumentsTab.tsx`)
**Location**: `project-detail/tabs/DocumentsTab.tsx`

**Document Items** (from `DocumentTypes.ts`):
- `id` (UUID)
- `project_id` (UUID) - FK to construction_projects
- `filename` (VARCHAR)
- `original_name` (VARCHAR)
- `type` (VARCHAR) - MIME type
- `size` (BIGINT) - file size in bytes
- `url` (VARCHAR)
- `upload_date` (DATE)
- `version` (INTEGER)
- `category` (ENUM: 'contract' | 'permit' | 'technical' | 'financial' | 'legal' | 'other')
- `metadata` (JSONB) - {description: TEXT, tags: TEXT[], uploaded_by: UUID, checksumMD5: VARCHAR}
- `extracted_text` (TEXT, nullable) - for full-text search
- `chunks` (JSONB, nullable) - for document chunking
- `processed_at` (TIMESTAMPTZ, nullable)
- `status` (ENUM: 'uploading' | 'processing' | 'ready' | 'error')

**Note**: Current schema has `documents` table (polymorphic) but missing:
- `version` (INTEGER)
- `category` (ENUM specific to documents)
- `extracted_text` (TEXT)
- `chunks` (JSONB)
- `processed_at` (TIMESTAMPTZ)
- `status` (ENUM)

#### 7. Team Tab (`TeamTab.tsx`)
**Location**: `project-detail/tabs/TeamTab.tsx`

**Team Members** (from `TeamTypes.ts`):
- `id` (UUID)
- `project_id` (UUID) - FK to construction_projects
- `name` (VARCHAR)
- `email` (VARCHAR)
- `phone` (VARCHAR, nullable)
- `role` (ENUM: 'project-manager' | 'engineer' | 'foreman' | 'supervisor' | 'contractor' | 'consultant' | 'other')
- `department` (VARCHAR, nullable)
- `company` (VARCHAR, nullable)
- `responsibilities` (TEXT[] or JSONB)
- `start_date` (DATE)
- `end_date` (DATE, nullable)
- `status` (ENUM: 'active' | 'inactive' | 'on-leave')
- `avatar` (VARCHAR, nullable) - URL
- `skills` (TEXT[] or JSONB)
- `certifications` (TEXT[] or JSONB)
- `emergency_contact` (JSONB, nullable) - {name: VARCHAR, phone: VARCHAR, relationship: VARCHAR}
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Note**: Current schema does NOT have a dedicated team members table. Need to create `construction_project_team_members` table.

### Database Schema Gap Analysis

#### Missing Tables (7)

1. **`construction_project_accomplishment_records`** (Section A)
   - Stores repeating accomplishment records with date_entry, comments, remarks_comments

2. **`construction_project_actual_accomplishment_records`** (Section B)
   - Stores repeating actual accomplishment records with progress percentages

3. **`construction_project_progress_summaries`** (Section B)
   - Stores repeating progress summary records by period

4. **`construction_project_financial_reports`** (Overview Tab)
   - Stores financial accomplishment reports by period

5. **`construction_project_phases`** (Overview Tab)
   - Stores project phases with progress tracking

6. **`construction_project_milestones`** (Timeline Tab)
   - Stores project milestones/timeline events

7. **`construction_project_team_members`** (Team Tab)
   - Stores team member assignments to projects

#### Tables Needing Enhancement (4)

1. **`construction_projects`**
   - Add: `ideal_infrastructure_image` (VARCHAR)
   - Add: `beneficiaries` (VARCHAR)
   - Add: `objectives` (JSONB or TEXT[])
   - Add: `key_features` (JSONB or TEXT[])
   - Add: `original_contract_duration` (VARCHAR)

2. **`construction_pow_items`**
   - Add: `estimated_material_cost` (DECIMAL) - separate from total_cost
   - Add: `estimated_labor_cost` (DECIMAL) - separate from total_cost
   - Add: `date_of_entry` (DATE)
   - Add: `status` (ENUM: 'Active' | 'Completed' | 'Pending' | 'Cancelled')
   - Add: `remarks` (TEXT)
   - Add: `is_unit_cost_overridden` (BOOLEAN)

3. **`media`** (for Gallery)
   - Add: `thumbnail_url` (VARCHAR)
   - Add: `dimensions` (JSONB)
   - Add: `category` (ENUM: 'progress' | 'equipment' | 'materials' | 'safety' | 'completed' | 'other')
   - Add: `tags` (TEXT[] or JSONB)
   - Add: `capture_date` (DATE)
   - Add: `order` (INTEGER)
   - Add: `location` (JSONB)

4. **`documents`** (for Documents Tab)
   - Add: `version` (INTEGER)
   - Add: `category` (ENUM: 'contract' | 'permit' | 'technical' | 'financial' | 'legal' | 'other')
   - Add: `extracted_text` (TEXT)
   - Add: `chunks` (JSONB)
   - Add: `processed_at` (TIMESTAMPTZ)
   - Add: `status` (ENUM: 'uploading' | 'processing' | 'ready' | 'error')

### Complete Field Mapping: COI Project Detail → Database

**See detailed field mapping tables in the research document above** (too extensive to duplicate here - see sections for each tab).

### Summary: Required Database Enhancements

#### New Tables Required: **7**
1. `construction_project_accomplishment_records`
2. `construction_project_actual_accomplishment_records`
3. `construction_project_progress_summaries`
4. `construction_project_financial_reports`
5. `construction_project_phases`
6. `construction_project_milestones`
7. `construction_project_team_members`

#### Tables Needing Enhancement: **4**
1. `construction_projects` - Add 5 new fields
2. `construction_pow_items` - Add 6 new fields
3. `media` - Add 7 new fields for gallery
4. `documents` - Add 5 new fields for document management

#### Total New Fields Required: **~50+ fields** across 11 tables

**Next Steps**: Create DDL for all new tables and field enhancements following PostgreSQL syntax, SOLID/DRY/KISS/YAGNI principles, and migration-ready patterns (IF NOT EXISTS, proper indexes, soft delete support).

## Lessons Learned (Compaction Log)

2025-12-10 - Repository holds multiple frontend bundles plus database drafts; ACE artifacts will live at repo root with latest/prev pairing to avoid context drift.

2025-12-10 - RBAC in UI expects user-level `role`, `department`, and `allowedPages` plus per-category/project assignments; current SQL schema only captures roles/permissions mappings and generic user metadata—no tables for page-level allowances, departmental mappings, or personnel assignments used by University Operations and Construction UI.

2025-12-10 - **CRITICAL**: Database must be PostgreSQL-only. All syntax must use PostgreSQL native types (`TIMESTAMPTZ`, `UUID`, `JSONB`, `ENUM`, `DECIMAL`, `SERIAL`). No Firebird/MySQL compatibility needed.

2025-12-10 - **REQUIREMENT**: All input fields from University Operations (Target vs Actual and Financial tabs) and Construction Infrastructure forms must be captured in database schema. Field mapping completed above.

2025-12-10 - **RBAC PRINCIPLE**: Apply KISS/YAGNI - simple junction tables for assignments, status-based approval workflow, no role hierarchies or time-based permissions. Consider storing assignments in `users.metadata` JSONB for maximum simplicity.

2025-12-10 - **MISSING TABLES**: Need RBAC assignment tables (`user_page_permissions`, `university_operations_personnel`, `construction_project_assignments`) OR use JSONB metadata approach for simplicity.

2025-12-10 - **RBAC ENHANCEMENT**: Must include SuperAdmin privilege (full system access, can manage all admins). Admin roles (Directors, Chiefs, VPs, President, Chairperson, Dean, etc.) do NOT automatically get all page access - permissions are granted selectively by superadmin. Each admin can have varied permissions across different pages/categories. Example: Director of ECO can have full access to Construction of Infrastructure plus selective access to other pages (e.g., University Operations) if granted by superadmin. Use `user_page_permissions` table with action flags (can_view, can_add, can_edit, can_delete, can_approve, can_assign_staff, can_manage_permissions) for granular control while maintaining KISS/YAGNI principles.

2025-12-10 - **MIS POLICY ANALYSIS**: Current stack (React/Vite, npm, Supabase) does NOT align with MIS preferred stack (NuxtJS/Vuetify, Yarn, NestJS). PostgreSQL database is compliant. shadcn-vue is compatible with Vue 3/NuxtJS but requires migration from React. Options: (1) Full migration to MIS stack, (2) Hybrid approach with minimal changes, (3) Request MIS exception. Policy requires consultation with MIS before using non-listed technologies. Security scanning, SSL/TLS, and Nginx deployment are required for production.

2025-12-10 - **CRITICAL CLARIFICATION**: React/Vite codebase is Figma AI-generated reference code ONLY. Must be reimplemented in Vue/NuxtJS with shadcn-vue and/or Vuetify to comply with MIS policy. React components serve as UI/UX pattern reference, not production code. All engineering principles apply: SOLID (Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion), DRY (reuse patterns/components), YAGNI (only required features), KISS (simplest solution). shadcn-vue and Vuetify can be used together in NuxtJS project.

2025-12-10 - **RBAC SCHEMA IMPLEMENTATION**: Option 1 (Separate Tables) selected and fully designed with complete DDL. Includes: enhanced `user_roles` table with `is_superadmin` flag, `user_page_permissions` table for page-level access, `university_operations_personnel` for category assignments, `construction_project_assignments` for project assignments. Helper functions `is_user_superadmin()` and `get_user_page_permission()` provided for centralized permission checks. All tables include soft delete support, audit fields, and proper indexes.

2025-12-10 - **PLAN BACKUP CYCLE FIXED**: `plan_prev.md` now properly backs up `plan_latest.md` before modifications, following same pattern as `research_prev.md` and `research_latest.md`. Backup cycle ensures version history is maintained per ACE framework.

2025-12-16 - **SQL FILE VERSIONING**: Created dated directory `prototype/database draft/Latest db schema/2025-12-16/` and duplicated `PMODataFirebird_Enhanced_postgres.sql` for version control. Naming convention: `YYYY-MM-DD` format for chronological sorting. This allows tracking schema evolution and rollback capability.

2025-12-16 - **SEQUENCE MIGRATION ASSESSMENT**: Current schema uses `BIGSERIAL` for `infra_project_uid` (line 260), which automatically creates a sequence `construction_projects_infra_project_uid_seq`. PostgreSQL/pgAdmin handles this seamlessly - no explicit sequence creation needed. Migration is safe: `IF NOT EXISTS` pattern used, sequences are auto-created on table creation. **Recommendation**: Keep `BIGSERIAL` - it's PostgreSQL-native and migration-friendly.

2025-12-16 - **TRIGGER MIGRATION READINESS**: Current schema has NO triggers yet (planned triggers from RBAC security enhancements). Planned triggers: `validate_permission_assignment()` for permission assignment validation. **Migration Best Practices**: (1) Use `CREATE OR REPLACE FUNCTION` for trigger functions (idempotent), (2) Use `CREATE TRIGGER IF NOT EXISTS` (PostgreSQL 9.5+) or manual existence check, (3) Order matters: create function BEFORE trigger, (4) Use `DROP TRIGGER IF EXISTS` for rollback, (5) Test triggers in transaction blocks before commit. **Recommendation**: Triggers are appropriate for security-critical operations (permission validation) but should be minimal for startup/MVP (YAGNI principle).

2025-12-16 - **INDEX APPROPRIATENESS FOR GREENFIELD/STARTUP**: Current schema has 86 indexes across 30 tables. **Analysis**: (1) **Essential Indexes** (KEEP): Foreign keys (`user_id`, `project_id`, `operation_id`), unique constraints (`email`, `project_code`), frequently queried fields (`status`, `campus`, `fiscal_year`), soft delete filters (`deleted_at`). (2) **Questionable Indexes** (REVIEW): Some indexes on low-cardinality fields (`is_active`, `is_featured`), multiple indexes on same table (`construction_projects` has 7 indexes), GIN indexes on JSONB (`subcategory_data`) - may be premature optimization. **YAGNI Assessment**: For greenfield/startup, start with minimal indexes (FKs, unique constraints, status/campus filters). Add performance indexes AFTER measuring actual query patterns. Current schema is over-indexed for MVP. **Recommendation**: Keep essential indexes (FKs, unique, status filters), defer others until performance profiling shows need. Use `CREATE INDEX CONCURRENTLY` in production for zero-downtime.

2025-12-16 - **TRIGGER APPROPRIATENESS FOR GREENFIELD/STARTUP**: Planned triggers: (1) Permission assignment validation (security-critical), (2) Audit log triggers (compliance), (3) Calculated field triggers (utilization rates, variance). **YAGNI Assessment**: (1) **Security triggers**: APPROPRIATE - prevents privilege escalation, database-level enforcement (defense in depth). (2) **Audit triggers**: DEFER - can use application-level logging initially, add database triggers when compliance requirements emerge. (3) **Calculated field triggers**: DEFER - calculate in application layer initially, add triggers when performance becomes issue. **Recommendation**: Implement security triggers (permission validation) only. Defer audit and calculated field triggers until actual need demonstrated (YAGNI principle).

2025-12-16 - **MIGRATION SEQUENCE BEST PRACTICES**: For PostgreSQL/pgAdmin migrations: (1) **Order Matters**: ENUMs → Tables → Indexes → Functions → Triggers → RLS Policies, (2) **Idempotency**: Use `IF NOT EXISTS` for tables/indexes/types, `CREATE OR REPLACE` for functions, (3) **Transactions**: Wrap migrations in transactions for rollback capability, (4) **Sequences**: `BIGSERIAL`/`SERIAL` auto-create sequences - no explicit `CREATE SEQUENCE` needed, (5) **Concurrent Indexes**: Use `CREATE INDEX CONCURRENTLY` in production (cannot be in transaction), (6) **Dependencies**: Functions depend on tables, triggers depend on functions - order accordingly. **Current Schema**: Follows correct order (ENUMs → Tables → Indexes), uses `IF NOT EXISTS` pattern. **Ready for Migration**: ✅ Yes - schema is migration-ready with proper ordering and idempotency.

2025-12-16 - **COI DATABASE INTEGRATION ANALYSIS COMPLETE**: Analyzed all 7 tabs of Construction Infrastructure project detail page (`ConstructionProjectDetail.tsx`). Identified **7 new tables** required (accomplishment records, actual accomplishment records, progress summaries, financial reports, phases, milestones, team members) and **4 tables needing enhancement** (`construction_projects`, `construction_pow_items`, `media`, `documents`). Total **~50+ new fields** needed across 11 tables. All modals, dialogs, and data structures from Overview, Timeline, Individual POW, Data Analytics, Gallery, Documents, and Team tabs mapped to database schema requirements. Field mapping tables created for each tab. Ready for DDL implementation following PostgreSQL syntax, SOLID/DRY/KISS/YAGNI principles, and migration-ready patterns.

2025-12-16 - **GAD PARITY REPORT & REPAIRS CATEGORY ANALYSIS COMPLETE**: Analyzed GAD Parity Report module (Gender Parity Report with 5 tabs: Students, Faculty, Staff, PWD, Indigenous; GPB Accomplishments; GAD Budget Plans) and Repairs Category module (Project Creation Form, Project Detail Page with 7 tabs: Overview, Timeline, Individual POW, Data Analytics, Gallery, Documents, Team). Identified **16 new tables** required (7 for GAD: student/faculty/staff/pwd/indigenous parity data, GPB accomplishments, budget plans; 9 for Repairs: repair_projects, financial reports, phases, accomplishment records, actual accomplishment records, progress summaries, milestones, POW items, team members). Total **~180+ new fields** needed across 16 tables. All modals, dialogs, and data structures mapped to database schema requirements. Following KISS/YAGNI principles: separate tables for clarity (can refactor later), reuse `media`/`documents` tables with `project_type` discriminator, defer computed field triggers, minimal indexes. Ready for DDL implementation.

---

## GAD Parity Report & Repairs Category - Database Integration Analysis

### Overview

This section analyzes the **Gender and Development (GAD) Parity Report** and **Repairs Category** components to identify necessary database attributes for integration. Following KISS/YAGNI principles, only main and necessary attributes are captured.

---

### 1. GAD Parity Report Module

#### 1.1 Module Structure

The GAD Parity Report module consists of three main pages:
1. **Gender Parity Report** (`GenderParityReportPage.tsx`) - 5 tabs: Students, Faculty, Staff, PWD, Indigenous
2. **GPB Accomplishments** (`GPBAccomplishmentsPage.tsx`) - Gender and Development Plan Budget accomplishments
3. **GAD Budget Plans** (`GADBudgetPlansPage.tsx`) - Budget planning and management

#### 1.2 Gender Parity Report - Data Structures

**1.2.1 Student Parity Data** (`StudentParityDataManager.tsx`)
- **Table**: `gad_student_parity_data`
- **Fields**:
  - `id` (UUID, PK)
  - `academic_year` (VARCHAR, e.g., '2023-2024')
  - `program` (VARCHAR) - CAA, CED, CCIS, CMNS, CHASS, CEGS
  - `admission_male` (INTEGER)
  - `admission_female` (INTEGER)
  - `admission_total` (INTEGER, computed: male + female)
  - `graduation_male` (INTEGER)
  - `graduation_female` (INTEGER)
  - `graduation_total` (INTEGER, computed: male + female)
  - `status` (ENUM: 'pending' | 'approved' | 'rejected')
  - `submitted_by` (UUID, FK → users)
  - `reviewed_by` (UUID, FK → users, nullable)
  - `reviewed_at` (TIMESTAMPTZ, nullable)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)
  - `deleted_at` (TIMESTAMPTZ, nullable, soft delete)

**1.2.2 Faculty Parity Data** (`FacultyParityDataManager.tsx`)
- **Table**: `gad_faculty_parity_data`
- **Fields**:
  - `id` (UUID, PK)
  - `academic_year` (VARCHAR)
  - `college` (VARCHAR) - 6 Undergraduate + 2 Professional schools
  - `category` (ENUM: 'undergraduate' | 'professional')
  - `total_faculty` (INTEGER)
  - `male_count` (INTEGER)
  - `female_count` (INTEGER)
  - `male_percentage` (DECIMAL(5,2), computed)
  - `female_percentage` (DECIMAL(5,2), computed)
  - `gender_balance` (ENUM: 'Good' | 'Balanced' | 'Improving' | 'Needs Attention')
  - `status` (ENUM: 'pending' | 'approved' | 'rejected')
  - `submitted_by` (UUID, FK → users)
  - `reviewed_by` (UUID, FK → users, nullable)
  - `reviewed_at` (TIMESTAMPTZ, nullable)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)
  - `deleted_at` (TIMESTAMPTZ, nullable)

**1.2.3 Staff Parity Data** (`StaffParityDataManager.tsx`)
- **Table**: `gad_staff_parity_data`
- **Fields**:
  - `id` (UUID, PK)
  - `academic_year` (VARCHAR)
  - `department` (VARCHAR)
  - `staff_category` (ENUM: 'administrative' | 'support')
  - `total_staff` (INTEGER)
  - `male_count` (INTEGER)
  - `female_count` (INTEGER)
  - `male_percentage` (DECIMAL(5,2), computed)
  - `female_percentage` (DECIMAL(5,2), computed)
  - `gender_balance` (ENUM: 'Good' | 'Balanced' | 'Improving' | 'Needs Attention')
  - `status` (ENUM: 'pending' | 'approved' | 'rejected')
  - `submitted_by` (UUID, FK → users)
  - `reviewed_by` (UUID, FK → users, nullable)
  - `reviewed_at` (TIMESTAMPTZ, nullable)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)
  - `deleted_at` (TIMESTAMPTZ, nullable)

**1.2.4 PWD Parity Data** (`PWDParityDataManager.tsx`)
- **Table**: `gad_pwd_parity_data`
- **Fields**:
  - `id` (UUID, PK)
  - `academic_year` (VARCHAR)
  - `pwd_category` (ENUM: 'population' | 'support')
  - `subcategory` (VARCHAR) - For population: Students, Faculty, Staff; For support: Accessibility Support, Scholarship, etc.
  - `total_beneficiaries` (INTEGER)
  - `male_count` (INTEGER)
  - `female_count` (INTEGER)
  - `male_percentage` (DECIMAL(5,2), computed)
  - `female_percentage` (DECIMAL(5,2), computed)
  - `status` (ENUM: 'pending' | 'approved' | 'rejected')
  - `submitted_by` (UUID, FK → users)
  - `reviewed_by` (UUID, FK → users, nullable)
  - `reviewed_at` (TIMESTAMPTZ, nullable)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)
  - `deleted_at` (TIMESTAMPTZ, nullable)

**1.2.5 Indigenous Parity Data** (`IndigenousParityDataManager.tsx`)
- **Table**: `gad_indigenous_parity_data`
- **Fields**:
  - `id` (UUID, PK)
  - `academic_year` (VARCHAR)
  - `indigenous_category` (ENUM: 'community' | 'program')
  - `subcategory` (VARCHAR) - For community: Students, Faculty, Staff; For program: Scholarship, Cultural Programs, etc.
  - `total_participants` (INTEGER)
  - `male_count` (INTEGER)
  - `female_count` (INTEGER)
  - `male_percentage` (DECIMAL(5,2), computed)
  - `female_percentage` (DECIMAL(5,2), computed)
  - `status` (ENUM: 'pending' | 'approved' | 'rejected')
  - `submitted_by` (UUID, FK → users)
  - `reviewed_by` (UUID, FK → users, nullable)
  - `reviewed_at` (TIMESTAMPTZ, nullable)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)
  - `deleted_at` (TIMESTAMPTZ, nullable)

#### 1.3 GPB Accomplishments (`GPBAccomplishmentsManager.tsx`)

- **Table**: `gad_gpb_accomplishments`
- **Fields**:
  - `id` (UUID, PK)
  - `title` (VARCHAR)
  - `description` (TEXT)
  - `category` (VARCHAR) - Capacity Building, Leadership Development, Policy Implementation, Research Support, Work-Life Balance, Data Management, Student Support
  - `priority` (ENUM: 'high' | 'medium' | 'low')
  - `status` (ENUM: 'Completed' | 'Ongoing' | 'Planned')
  - `target_beneficiaries` (INTEGER)
  - `actual_beneficiaries` (INTEGER)
  - `target_budget` (DECIMAL(12,2))
  - `actual_budget` (DECIMAL(12,2))
  - `target_percentage` (DECIMAL(5,2))
  - `actual_percentage` (DECIMAL(5,2))
  - `completion_date` (DATE, nullable)
  - `responsible` (VARCHAR) - Department/Office responsible
  - `achievement_rate` (DECIMAL(5,2), computed: (actual/target) * 100)
  - `year` (VARCHAR) - Fiscal year
  - `data_status` (ENUM: 'pending' | 'approved' | 'rejected')
  - `submitted_by` (UUID, FK → users)
  - `reviewed_by` (UUID, FK → users, nullable)
  - `reviewed_at` (TIMESTAMPTZ, nullable)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)
  - `deleted_at` (TIMESTAMPTZ, nullable)

#### 1.4 GAD Budget Plans (`GADBudgetPlansManager.tsx`)

- **Table**: `gad_budget_plans`
- **Fields**:
  - `id` (UUID, PK)
  - `title` (VARCHAR)
  - `description` (TEXT)
  - `category` (VARCHAR) - Capacity Building, Empowerment Programs, Research & Development, Support Services, Policy Implementation, Data Management, Student Support
  - `priority` (ENUM: 'high' | 'medium' | 'low')
  - `status` (ENUM: 'planned' | 'ongoing' | 'completed')
  - `budget_allocated` (DECIMAL(12,2))
  - `budget_utilized` (DECIMAL(12,2))
  - `target_beneficiaries` (INTEGER)
  - `actual_beneficiaries` (INTEGER)
  - `target_percentage` (DECIMAL(5,2))
  - `actual_percentage` (DECIMAL(5,2))
  - `start_date` (DATE)
  - `end_date` (DATE)
  - `responsible` (VARCHAR) - Department/Office responsible
  - `year` (VARCHAR) - Fiscal year
  - `data_status` (ENUM: 'pending' | 'approved' | 'rejected')
  - `submitted_by` (UUID, FK → users)
  - `reviewed_by` (UUID, FK → users, nullable)
  - `reviewed_at` (TIMESTAMPTZ, nullable)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)
  - `deleted_at` (TIMESTAMPTZ, nullable)

#### 1.5 GAD Parity Report - Summary

**New Tables Required: 7**
1. `gad_student_parity_data`
2. `gad_faculty_parity_data`
3. `gad_staff_parity_data`
4. `gad_pwd_parity_data`
5. `gad_indigenous_parity_data`
6. `gad_gpb_accomplishments`
7. `gad_budget_plans`

**Common Patterns**:
- All tables use approval workflow (`status`: pending → approved/rejected)
- All tables track `submitted_by`, `reviewed_by`, `reviewed_at` for audit trail
- All tables use soft delete (`deleted_at`)
- All tables use `academic_year` or `year` for temporal filtering
- Computed fields (percentages, totals) can be calculated in application layer or via triggers (YAGNI: defer triggers initially)

---

### 2. Repairs Category Module

#### 2.1 Module Structure

The Repairs Category module consists of:
1. **Project Creation Form** (`RepairProjectFormDialog.tsx`) - Modal for creating/editing repair projects
2. **Project Detail Page** (`RepairProjectDetail.tsx`) - 7 tabs: Overview, Timeline, Individual POW, Data Analytics, Gallery, Documents, Team
3. **Category Pages** - MainCampusRepairsPage, CabadbaranCampusRepairsPage, ClassroomsRepairsPage, AdministrativeOfficesRepairsPage

#### 2.2 Repair Project - Core Data Structure

**2.2.1 Repair Project** (`RepairTypes.ts` → `RepairProject`)
- **Table**: `repair_projects` (NEW TABLE)
- **Fields**:
  - `id` (UUID, PK)
  - `title` (VARCHAR)
  - `description` (TEXT)
  - `campus` (ENUM: 'Main Campus' | 'Cabadbaran Campus' | 'CSU Main' | 'CSU CC')
  - `building` (VARCHAR)
  - `location` (VARCHAR) - Specific location (e.g., "3rd Floor, Room 301")
  - `repair_type` (ENUM: 'Structural' | 'Electrical' | 'Plumbing' | 'HVAC' | 'Roofing' | 'Painting' | 'Flooring' | 'Safety' | 'Security' | 'Other')
  - `priority` (ENUM: 'Low' | 'Medium' | 'High' | 'Critical')
  - `status` (ENUM: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | 'On Hold' | 'Overdue')
  - `start_date` (DATE)
  - `end_date` (DATE)
  - `estimated_duration` (INTEGER, days, nullable)
  - `actual_duration` (INTEGER, days, nullable)
  - `budget` (DECIMAL(12,2))
  - `spent` (DECIMAL(12,2))
  - `contractor` (VARCHAR, nullable)
  - `project_manager` (VARCHAR)
  - `emergency_repair` (BOOLEAN, default false)
  - `warranty_period` (INTEGER, months, nullable)
  - `completed_at` (TIMESTAMPTZ, nullable)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)
  - `deleted_at` (TIMESTAMPTZ, nullable)

**Note**: Similar structure to `construction_projects` but for repair/maintenance work. Consider if these should share a common `projects` table with a `project_type` discriminator, or remain separate (YAGNI: keep separate for now, can refactor later if needed).

#### 2.3 Repair Project Detail - Overview Tab

**2.3.1 Financial Performance** (`RepairOverviewCRUDDialogs.tsx` → `FinancialPerformanceDialog`)
- Uses same structure as COI: `total_budget`, `actual_spent`, `utilization` (computed)
- **Reuse**: Can use `construction_project_financials` table OR create `repair_project_financials` (YAGNI: create separate table for clarity, can consolidate later)

**2.3.2 Physical Performance** (`RepairOverviewCRUDDialogs.tsx` → `PhysicalPerformanceDialog`)
- Uses same structure as COI: `target_progress`, `actual_progress`, `phases_done`, `total_phases`, `status`
- **Reuse**: Can use `construction_project_progress` table OR create `repair_project_progress` (YAGNI: create separate table)

**2.3.3 Project Health** (`RepairOverviewCRUDDialogs.tsx` → `ProjectHealthDialog`)
- Uses same structure as COI: `budget_health`, `physical_health`, `schedule_health`, `quality_health` (each with `value` and `status`), `target_completion`, `days_remaining`
- **Reuse**: Can use `construction_project_health` table OR create `repair_project_health` (YAGNI: create separate table)

**2.3.4 Project Information** (`RepairOverviewCRUDDialogs.tsx` → `ProjectInformationDialog`)
- Fields: `project_name`, `location`, `funding_source`, `contract_duration`, `project_status`, `contractor`, `description`, `total_budget`, `beneficiaries`, `start_date`, `target_end_date`, `objectives` (array), `key_features` (array)
- **Storage**: Most fields in `repair_projects` table, `objectives` and `key_features` as JSONB arrays

**2.3.5 Financial Reports** (`RepairOverviewCRUDDialogs.tsx` → `AddFinancialReportDialog`)
- **Table**: `repair_project_financial_reports` (NEW TABLE)
- **Fields**:
  - `id` (UUID, PK)
  - `repair_project_id` (UUID, FK → repair_projects)
  - `report_title` (VARCHAR)
  - `report_date` (DATE)
  - `target_budget` (DECIMAL(12,2))
  - `actual_spent` (DECIMAL(12,2))
  - `status` (VARCHAR)
  - `remarks` (TEXT, nullable)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)
  - `deleted_at` (TIMESTAMPTZ, nullable)

**2.3.6 Project Phases** (`RepairOverviewCRUDDialogs.tsx` → `AddPhaseDialog`)
- **Table**: `repair_project_phases` (NEW TABLE)
- **Fields**:
  - `id` (UUID, PK)
  - `repair_project_id` (UUID, FK → repair_projects)
  - `phase_name` (VARCHAR)
  - `phase_description` (TEXT, nullable)
  - `target_progress` (DECIMAL(5,2))
  - `actual_progress` (DECIMAL(5,2))
  - `status` (VARCHAR)
  - `target_start_date` (DATE)
  - `target_end_date` (DATE)
  - `actual_start_date` (DATE, nullable)
  - `actual_end_date` (DATE, nullable)
  - `remarks` (TEXT, nullable)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)
  - `deleted_at` (TIMESTAMPTZ, nullable)

**2.3.7 Accomplishment Records** (Similar to COI)
- **Table**: `repair_project_accomplishment_records` (NEW TABLE)
- **Fields**: Same as `construction_project_accomplishment_records` (see COI analysis)
- **Table**: `repair_project_actual_accomplishment_records` (NEW TABLE)
- **Fields**: Same as `construction_project_actual_accomplishment_records`
- **Table**: `repair_project_progress_summaries` (NEW TABLE)
- **Fields**: Same as `construction_project_progress_summaries`

#### 2.4 Repair Project Detail - Timeline Tab

**2.4.1 Milestones** (`RepairTimelineDialogs.tsx`)
- **Table**: `repair_project_milestones` (NEW TABLE)
- **Fields**: Same as `construction_project_milestones` (see COI analysis)
  - `id` (UUID, PK)
  - `repair_project_id` (UUID, FK → repair_projects)
  - `title` (VARCHAR)
  - `description` (TEXT, nullable)
  - `start_date` (DATE)
  - `end_date` (DATE)
  - `actual_start_date` (DATE, nullable)
  - `actual_end_date` (DATE, nullable)
  - `status` (ENUM: 'Pending' | 'In Progress' | 'Completed' | 'Delayed')
  - `progress` (DECIMAL(5,2))
  - `duration_days` (INTEGER, computed)
  - `variance_days` (INTEGER, computed, nullable)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)
  - `deleted_at` (TIMESTAMPTZ, nullable)

#### 2.5 Repair Project Detail - Individual POW Tab

**2.5.1 POW Items** (`RepairPOWDialogs.tsx` → `RepairPOWItem`)
- **Table**: `repair_pow_items` (NEW TABLE)
- **Fields**: Same as `construction_pow_items` (see COI analysis)
  - `id` (UUID, PK)
  - `repair_project_id` (UUID, FK → repair_projects)
  - `description` (TEXT)
  - `quantity` (DECIMAL(10,2))
  - `unit` (VARCHAR)
  - `estimated_material_cost` (DECIMAL(12,2))
  - `estimated_labor_cost` (DECIMAL(12,2))
  - `estimated_project_cost` (DECIMAL(12,2), computed: material + labor)
  - `unit_cost` (DECIMAL(12,2), computed: project_cost / quantity)
  - `date_of_entry` (DATE)
  - `status` (ENUM: 'Active' | 'Completed' | 'Pending' | 'Cancelled', nullable)
  - `remarks` (TEXT, nullable)
  - `is_unit_cost_overridden` (BOOLEAN, default false)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)
  - `deleted_at` (TIMESTAMPTZ, nullable)

#### 2.6 Repair Project Detail - Gallery, Documents, Team Tabs

**2.6.1 Gallery** (`RepairGalleryTab.tsx`)
- **Reuse**: Can use existing `media` table with `project_type` discriminator OR create `repair_project_media` junction table
- **YAGNI Recommendation**: Use existing `media` table with `project_type` = 'repair' and `project_id` = `repair_projects.id`

**2.6.2 Documents** (`RepairDocumentsTab.tsx`)
- **Reuse**: Can use existing `documents` table with `project_type` discriminator OR create `repair_project_documents` junction table
- **YAGNI Recommendation**: Use existing `documents` table with `project_type` = 'repair' and `project_id` = `repair_projects.id`

**2.6.3 Team** (`RepairTeamTab.tsx`)
- **Reuse**: Can use existing `construction_project_team_members` table OR create `repair_project_team_members` (YAGNI: create separate table for clarity)

**Table**: `repair_project_team_members` (NEW TABLE)
- **Fields**: Same as `construction_project_team_members` (see COI analysis)
  - `id` (UUID, PK)
  - `repair_project_id` (UUID, FK → repair_projects)
  - `user_id` (UUID, FK → users)
  - `role` (VARCHAR)
  - `department` (VARCHAR, nullable)
  - `assigned_date` (DATE)
  - `status` (ENUM: 'active' | 'inactive', default 'active')
  - `responsibilities` (JSONB, array of strings, nullable)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)
  - `deleted_at` (TIMESTAMPTZ, nullable)

#### 2.7 Repair Project - Summary

**New Tables Required: 9**
1. `repair_projects` (core table)
2. `repair_project_financial_reports`
3. `repair_project_phases`
4. `repair_project_accomplishment_records`
5. `repair_project_actual_accomplishment_records`
6. `repair_project_progress_summaries`
7. `repair_project_milestones`
8. `repair_pow_items`
9. `repair_project_team_members`

**Tables to Enhance: 2**
1. `media` - Add `project_type` ENUM discriminator ('construction' | 'repair' | 'other') if not already present
2. `documents` - Add `project_type` ENUM discriminator if not already present

**Total New Fields**: ~80+ fields across 11 tables (including shared patterns with COI)

---

### 3. Complete Summary: GAD & Repairs Database Requirements

#### 3.1 GAD Parity Report Module
- **New Tables**: 7 tables
- **Total Fields**: ~100+ fields
- **Key Features**: Approval workflow, academic year filtering, gender parity metrics

#### 3.2 Repairs Category Module
- **New Tables**: 9 tables
- **Total Fields**: ~80+ fields
- **Key Features**: Similar structure to COI but for repair/maintenance projects, campus-based filtering

#### 3.3 Shared Patterns
- Both modules use approval workflow (`status`: pending → approved/rejected)
- Both modules track audit trail (`submitted_by`, `reviewed_by`, `reviewed_at`)
- Both modules use soft delete (`deleted_at`)
- Both modules can reuse `media` and `documents` tables with `project_type` discriminator

#### 3.4 Database Schema Recommendations

**Following KISS/YAGNI Principles**:
1. **Separate Tables**: Keep GAD and Repairs tables separate from Construction tables for clarity (can refactor later if needed)
2. **Reuse Media/Documents**: Use existing `media` and `documents` tables with `project_type` discriminator instead of creating duplicate tables
3. **Computed Fields**: Calculate percentages, totals, variances in application layer initially (defer triggers until performance requires)
4. **Indexes**: Only essential indexes (FKs, unique constraints, status filters) - defer performance indexes until profiling shows need
5. **Triggers**: Defer all triggers except security-critical ones (permission validation)

**Next Steps**: Create DDL for all new tables and field enhancements following PostgreSQL syntax, SOLID/DRY/KISS/YAGNI principles, and migration-ready patterns (IF NOT EXISTS, proper indexes, soft delete support).

---

## Lessons Learned (Compaction Log)
