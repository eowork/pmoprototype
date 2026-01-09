# Plan: Database Schema Enhancement - Complete System Coverage (Greenfield)

## Checklist with Verification

### Phase 1: Research & Verification (Completed)
- [x] **Step 1: UI Field Mapping**
  - Mapped University Ops, Construction (7 tabs), GAD, and Repairs.
- [x] **Step 2: Syntax Compliance**
  - Verified `PMODataFirebird_Enhanced_postgres.sql` uses strict PostgreSQL types (`TIMESTAMPTZ`, `UUID`, `JSONB`).
- [x] **Step 3: RBAC Design**
  - Selected "Option 1" (Separate Tables) over JSONB metadata.
- [x] **Step 4: Module Gap Analysis**
  - **Policies**: Defined need for `policies` table (Validity, Categories).
  - **Forms**: Defined need for `forms_inventory` table (Versioning).
  - **Facilities**: Verified `room_assessments` is structurally sufficient for MVP (Hybrid Schema).

### Phase 2: DDL Implementation (Greenfield / Edit-in-Place)

#### Priority 1: Security & Governance (Foundation)
- [ ] **Step 2.1: Refactor User Roles**
  - **Target**: `user_roles` (Line ~96)
  - **Action**: Redefine table to include `is_superadmin`, `assigned_by`, `assigned_at` directly in CREATE statement.
- [ ] **Step 2.2: Insert RBAC Tables (Option 1)**
  - **Target**: Insert after `user_roles`.
  - **Tables**: `user_page_permissions`, `university_operations_personnel`, `construction_project_assignments`.
  - **Functions**: `is_user_superadmin()`, `get_user_page_permission()`.
  - **Trigger**: `validate_permission_assignment` (Security Critical).
- [ ] **Step 2.3: Insert Governance Modules**
  - **Target**: Insert after `system_settings`.
  - **Tables**: `policies` (with validity/category), `forms_inventory` (with versioning).

#### Priority 2: Operational Core (Refactoring)
- [ ] **Step 2.4: Refactor Construction Core**
  - **Target**: `construction_projects` (Line ~258).
  - **Action**: Add columns `ideal_infrastructure_image`, `beneficiaries`, `objectives (JSONB)`, `key_features (JSONB)`, `original_contract_duration`.
- [ ] **Step 2.5: Refactor POW Items**
  - **Target**: `construction_pow_items` (Line ~380) and `repair_pow_items`.
  - **Action**: Add columns `estimated_material_cost`, `estimated_labor_cost`, `date_entry`, `status`, `remarks`, `is_unit_cost_overridden`.
- [ ] **Step 2.6: Refactor Media & Documents**
  - **Target**: `media` and `documents`.
  - **Action**: Add `project_type`, `version`, `category`, `thumbnail_url`, `dimensions`, `processed_at`.

#### Priority 3: Operational Details (New Insertions)
- [ ] **Step 2.7: Insert COI Detail Tables**
  - **Target**: Insert after `construction_projects`.
  - **Tables**: `construction_project_accomplishment_records`, `_actual_accomplishment_records`, `_progress_summaries`, `_financial_reports`, `_phases`, `_milestones`, `_team_members`.
- [ ] **Step 2.8: Insert Repairs Detail Tables**
  - **Target**: Insert after `repair_projects`.
  - **Tables**: `repair_project_financial_reports`, `_phases`, `_accomplishment_records`, `_actual_accomplishment_records`, `_progress_summaries`, `_milestones`, `_team_members`.
- [ ] **Step 2.9: Insert GAD Module**
  - **Target**: Insert after `university_operations`.
  - **Tables**: `gad_student_parity_data`, `gad_faculty_...`, `gad_staff_...`, `gad_pwd_...`, `gad_indigenous_...`, `gad_gpb_accomplishments`, `gad_budget_plans`.

## Status Log
- [x] Phase 1: Research Complete (Audited & Verified).
- [ ] Phase 2: DDL Implementation - **READY TO START**

## Implementation Strategy
**Target File:** `prototype/database draft/Latest db schema/2025-12-16/PMODataFirebird_Enhanced_postgres.sql`

**Methodology:**
* **Edit-in-Place**: Do not use `ALTER TABLE`. Modify the existing `CREATE TABLE` definitions.
* **Logical Ordering**: Insert new tables near their related core tables (e.g., COI details next to COI header).
* **Strict Typing**: Use `TIMESTAMPTZ` for all time fields. Use `UUID` for all IDs.
* **Greenfield**: Assume the database can be dropped and recreated (no data migration scripts needed yet).