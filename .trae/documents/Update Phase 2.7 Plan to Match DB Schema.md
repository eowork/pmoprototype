## Goal
Make Phase 2.7 in docs/plan_active.md strictly reflect the authoritative PostgreSQL schema (pmo_schema_pg.sql) by tightening endpoint lists, DTO fields, enum values, and soft-delete/audit behavior.

## Scope (Locked)
- Edit only Phase 2.7 content in docs/plan_active.md.
- Use database/database draft/2026_01_12/pmo_schema_pg.sql as the single source of truth for tables/enums/nullable/unique constraints.
- No code changes; no new files.

## Research Inputs (Authoritative)
- Enums: contractor_status_enum, department_status_enum, setting_data_type_enum.
- Tables:
  - departments, user_departments
  - funding_sources
  - construction_subcategories
  - repair_types
  - contractors
  - system_settings
- Common columns across lookup tables: metadata, created_at, updated_at, deleted_at, deleted_by.
- Table-specific fields:
  - contractors.status is NOT NULL (no default)
  - departments.status has default 'ACTIVE'
  - user_departments has is_primary and created_by
  - system_settings has updated_by and is_public default false

## Planned Edits to Phase 2.7 Sections
1) Normalize endpoint notation
- Update each Phase 2.7 step to show full routes under the global API prefix (e.g., /api/contractors) and keep route naming consistent with existing modules (plural resources, REST CRUD).

2) Make each module contract schema-driven
For each Step 2.7.1–2.7.6, rewrite the “Endpoints” + “DTO Fields” sections to explicitly mirror schema:
- Mark required vs optional fields based on NOT NULL.
- Call out UNIQUE constraints (e.g., funding_sources.name, repair_types.name, construction_subcategories.name, departments.code, system_settings.setting_key).
- Specify enum value sets exactly as defined in schema.
- Specify soft-delete behavior based on deleted_at/deleted_by presence.
- Specify audit fields per table:
  - created_by exists on user_departments (so assignment endpoints must set created_by from JWT user id)
  - updated_by exists on system_settings (PATCH/POST should set updated_by)

3) Align query/filter/sort options to indices and columns
- For each list endpoint, constrain filter params to columns that exist (e.g., contractors: status, name; departments: status, parent_id; settings: setting_group, is_public).
- Add a small “Allowed sorts” list per resource using real columns (e.g., created_at, updated_at, name).

4) Tighten Phase 2.7 security section
- Clarify read vs write role policy consistently:
  - GET: Admin, Staff
  - POST/PATCH/DELETE: Admin
- Note that system_settings GET for Staff must be restricted to is_public=true (schema supports is_public).

5) Update DoD / Gate text to reflect the refined contracts
- If endpoint coverage changes (e.g., settings becomes full CRUD instead of PATCH-only), reflect that in the DoD criteria wording while staying within Phase 2.7.

6) Add schema-based verification snippets (within plan_active.md)
- For each module, add 1–2 minimal SQL “evidence” queries that confirm:
  - records created
  - soft delete applied (deleted_at set)
  - unique constraint behavior acknowledged (409 on duplicates)
  - updated_by/created_by set where applicable

## Output
- A revised Phase 2.7 section in docs/plan_active.md with endpoint tables and DTO fields that match the schema exactly.

## Acceptance Criteria
- Every Phase 2.7 endpoint list references only schema-real columns and enum values.
- No “phantom” fields (e.g., last_logout_at) are introduced into Phase 2.7 contracts.
- All Phase 2.7 resource routes are expressed consistently under /api.
- Soft delete + audit fields described match what exists per table.

Confirm to apply these edits to docs/plan_active.md.