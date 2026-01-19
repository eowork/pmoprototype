# DTO ↔ Schema Revision (Construction + University Operations)

## Status Log
- Status: Completed schema ↔ DTO verification for construction modules and university operations modules.
- Schema: `database\database draft\2026_01_12\pmo_schema_pg.sql`
- DTO Scope:
  - Construction Projects: `pmo-backend\src\construction-projects\dto\*`
  - Construction Subcategories: `pmo-backend\src\construction-subcategories\dto\*`
  - University Operations: `pmo-backend\src\university-operations\dto\*`
- Supporting Code Reviewed (for actual DB usage):
  - `pmo-backend\src\construction-projects\construction-projects.service.ts`
  - `pmo-backend\src\university-operations\university-operations.service.ts`
  - `pmo-backend\src\university-operations\university-operations.controller.ts`

## Summary Log (Optimized Outcome)
- Keep DB-managed fields out of Create DTOs: UUID defaults, BIGSERIAL, timestamps, soft-delete, created_by/updated_by.
- Construction Projects are mostly aligned, but:
  - `construction_gallery` is not aligned between schema and backend behavior (highest-priority mismatch).
  - Milestones have two schema table designs; backend currently uses the simpler one.
- University Operations are mostly aligned, but:
  - `operation_organizational_info` exists in schema and is read by service, but has no DTO/endpoint to write it.
  - `operation_indicators` has many schema columns not represented by DTO/service (they will remain NULL/default unless added).
  - `university_statistics` exists in schema but has no DTO/service support.
- Repairs are mostly aligned at the DTO level, but:
  - Repair Projects service joins do not match schema (`contractors.company_name`, `facilities.name`).
  - Several repair detail tables exist in schema without DTO/endpoint coverage (milestones, progress summaries, financial reports).
- GAD Parity is well aligned (schema ↔ DTO ↔ service), but:
  - `gad_yearly_profiles` exists in schema without DTO/service support.
  - `data_status` exists in GPB/Budget tables but is not used by the API (only `status` is filtered/updated).

---

## Summary Table (Category → Optimized Solution)

| Category | Primary Tables | Alignment | Key Gaps / Mismatches | Optimized Solution | Priority |
|---|---|---|---|---|---|
| Construction Projects | `construction_projects` | Partial | Progress/timeline/gallery fields not updatable via DTOs | Keep defaults on create; add dedicated update/progress endpoints if needed | Medium |
| Construction Gallery | `construction_gallery` | Mismatch | Schema is URL-based; backend is upload/file-metadata based; DTO `image_url` optional vs schema NOT NULL | Decide URL-based vs upload-based; align schema + service + DTO accordingly | High |
| Construction Milestones | `construction_milestones` / `construction_project_milestones` | Partial | Two milestone table designs; only one is implemented | Keep one table design; implement DTO/service for chosen table | High |
| Construction Subcategories | `construction_subcategories` | Aligned | None (DB-managed columns intentionally omitted) | No change needed | Low |
| University Operations | `university_operations` | Aligned | None (DB-managed columns intentionally omitted) | No change needed | Low |
| Operation Indicators | `operation_indicators` | Partial | Schema metrics not in DTO/service (scores/variance/averages/subcategory_data) | Keep lean DTO if computed later; otherwise add fields + validation | Medium |
| Operation Financials | `operation_financials` | Partial | Computed metrics not in DTO/service (utilization/balance/variance) | Keep lean DTO if computed later; otherwise add fields + validation | Medium |
| Operation Org Info | `operation_organizational_info` | Partial | Read path exists; no write DTO/endpoint | Add DTO + endpoints or remove from payload until supported | High |
| Repair Types | `repair_types` | Aligned | None (DB-managed columns intentionally omitted) | No change needed | Low |
| Repair Projects | `repair_projects` | Partial | Service expects `contractors.company_name` and `facilities.name` but schema differs | Align joins/selected columns to schema or update schema to match backend | High |
| Repair Details | `repair_pow_items`, `repair_project_phases`, `repair_project_team_members` | Partial | Several schema fields are not exposed (e.g., actual_* dates, status overrides) | Keep lean DTOs; add fields only if UI/logic needs them | Medium |
| Repair Reporting | milestones/progress/financial reports tables | Missing | Tables exist; no DTO/service/controller coverage | Add modules/endpoints or remove tables from schema draft | Medium |
| GAD Parity | `gad_*_parity_data` | Aligned | None (workflow handled via review endpoint) | No change needed | Low |
| GAD Planning | `gad_gpb_accomplishments`, `gad_budget_plans` | Partial | `data_status` not used by API; review fields exist but no review endpoints | Either adopt `data_status` workflow or remove it to reduce drift | Medium |
| GAD Profiles | `gad_yearly_profiles` | Missing | Table exists; no DTO/service/controller coverage | Add module/endpoints or remove table from schema draft | Low |

# A) Construction Modules

## A1) construction_projects ↔ CreateConstructionProjectDto / UpdateConstructionProjectDto / QueryConstructionProjectDto

### Schema columns that are correctly omitted in Create DTO (DB/server-managed)
- `id` (UUID default), `infra_project_uid` (BIGSERIAL)
- `created_by`, `updated_by` (server-managed from auth context)
- `created_at`, `updated_at`, `deleted_at`, `deleted_by` (DB/system-managed)

### Schema columns omitted in Create DTO by design (defaults / should not be client-authored)
- `physical_progress` DEFAULT 0.00
- `financial_progress` DEFAULT 0.00
- `timeline_data` JSONB DEFAULT []
- `gallery_images` JSONB DEFAULT []

### Optimized finding
- The omissions above are acceptable and safer if progress/timeline/gallery are meant to be derived from other endpoints or workflows.
- If you want those columns to be user-editable later, `UpdateConstructionProjectDto` cannot update them because it is `PartialType(CreateConstructionProjectDto)`.

### Schema/API mismatch to resolve
- Schema includes `location_coordinates POINT` while DTO exposes `latitude` and `longitude`.
  - Current DTO/service set does not map lat/long into POINT. Keep either:
    - lat/long only (remove POINT from schema), or
    - POINT only (add DTO mapping + service logic).

## A2) construction_project_financials ↔ CreateConstructionFinancialDto

### Coverage
- DTO includes: `fiscal_year`, `appropriation`, `obligation`, optional `disbursement`, optional `metadata`.
- Schema requires: `project_id` (FK) plus audit fields.

### Why some schema columns are not in DTO
- `project_id` is correctly handled as a route context value (not payload).
- `id`, timestamps, and soft-delete fields are DB/system-managed.

## A3) construction_milestones / construction_project_milestones ↔ CreateMilestoneDto

### Schema situation
- `construction_milestones` (simple model) exists and matches the current CreateMilestoneDto shape.
- `construction_project_milestones` (detailed model) also exists, but is not represented by the current DTO/service flow.

### Optimized finding
- Current milestone DTO is appropriate if the system is using `construction_milestones`.
- If the detailed table is the intended final design, add a separate DTO/service flow for `construction_project_milestones` and remove/retire the simple table to avoid duplicate concepts.

## A4) construction_gallery ↔ CreateGalleryDto / QueryGalleryDto

### High-priority mismatch (schema vs backend behavior)
- Schema defines: `image_url NOT NULL`, `caption`, `category`, `is_featured`, `uploaded_at`.
- Backend implementation pattern uses file uploads and expects columns like `file_name`, `file_path`, `file_size`, `mime_type`, etc. (not present in the schema definition).

### DTO correctness relative to schema
- `image_url` is optional in DTO but `NOT NULL` in schema (inconsistent if schema is source of truth).

### Optimized solution
- Choose one source of truth and align both ends:
  - If you want upload-backed gallery (recommended given uploads module pattern): update the schema table definition to include file metadata fields used by the backend.
  - If you want URL-backed gallery: change backend service insert/select to use `image_url/caption/is_featured/uploaded_at` and make `image_url` required in DTO.

---

# B) Construction Subcategories

## B1) construction_subcategories ↔ CreateConstructionSubcategoryDto / UpdateConstructionSubcategoryDto / QueryConstructionSubcategoryDto

### Coverage
- DTOs cover the editable fields: `name`, optional `description`, optional `metadata`.
- Query DTO supports paging/sorting plus optional `name` filter.

### Why some schema columns are not in DTO
- `id`, timestamps, and soft-delete fields are DB/system-managed.

---

# C) University Operations Modules

## C1) university_operations ↔ CreateOperationDto / UpdateOperationDto / QueryOperationDto

### Coverage
- DTO covers: `operation_type`, `title`, `description?`, `code?`, `start_date?`, `end_date?`, `status`, `budget?`, `campus`, `coordinator_id?`, `metadata?`.
- Service inserts `created_by` from auth context and updates `updated_by` on update.

### Why some schema columns are not in DTO
- `id` is DB-generated.
- `created_by`, `updated_by` are server-managed.
- `created_at`, `updated_at`, `deleted_at`, `deleted_by` are DB/system-managed.

### Optimized finding
- Current Create/Update/Query DTOs are appropriately scoped for the `university_operations` table.
- Code uniqueness is enforced at both schema (UNIQUE) and service (pre-check for conflicts when `code` is provided).

## C2) operation_indicators ↔ CreateIndicatorDto

### Coverage (what the API actually writes)
- Service insert writes: `particular`, `description`, `indicator_code`, `uacs_code`, `fiscal_year`,
  quarterly `target_*`, quarterly `accomplishment_*`, `remarks`, `metadata`, `created_by`, plus `operation_id` via route.

### Schema columns not represented by DTO/service (will remain NULL/default)
- `score_q1/score_q2/score_q3/score_q4`
- `variance_as_of`, `variance`
- `average_target`, `average_accomplishment`
- `subcategory_data`
- `status` (schema default is `pending`, so omission is safe if you want default behavior)

### Optimized finding
- The omissions are acceptable if those columns are computed/derived later or intentionally not client-writable.
- If those values are meant to be provided by the client at creation time, DTO/service must be expanded to accept them.

### DTO cleanup opportunity
- `IndicatorStatus` enum exists in the DTO file but no `status` field uses it.
  - Either add an optional `status: IndicatorStatus` with validation, or remove the unused enum to keep the DTO minimal.

## C3) operation_financials ↔ CreateFinancialDto

### Coverage (what the API actually writes)
- Service insert writes: `fiscal_year`, `quarter?`, `operations_programs`, `department?`, `budget_source?`,
  `allotment?`, `target?`, `obligation?`, `disbursement?`, `performance_indicator?`, `remarks?`, `metadata?`, `created_by`, plus `operation_id` via route.

### Schema columns not represented by DTO/service (will remain NULL/default)
- `utilization_per_target`, `utilization_per_approved_budget`, `disbursement_rate`
- `balance`, `variance`
- `status` (schema default is `active`, so omission is safe if you want default behavior)

### Optimized finding
- This is a good “lean create” DTO if those omitted metrics are computed server-side or derived in reporting.
- If quarter must always be present, make `quarter` required in DTO; schema currently allows NULL quarter.

## C4) operation_organizational_info (schema) has no DTO write path

### Current behavior
- Service `findOne()` reads `operation_organizational_info` and returns it as `organizational_info`.
- There is no DTO or controller/service method to create/update organizational info.

### Optimized solution
- Either:
  - Add DTO + endpoints to create/update `operation_organizational_info`, or
  - Remove it from the returned payload until write support exists (to avoid a “read-only orphan” table).

## C5) university_statistics (schema) has no DTO/service support

### Optimized finding
- Table exists and is independent of university_operations CRUD, but there is no backend DTO/service/controller coverage.
- If it is part of the product scope, add a dedicated module (DTO + service + endpoints). If not, remove it from the schema draft to keep schema lean and implementation-aligned.

---

# D) Repair Modules

## D1) repair_types ↔ CreateRepairTypeDto / UpdateRepairTypeDto / QueryRepairTypeDto

### Coverage
- DTOs cover editable fields: `name`, optional `description`, optional `metadata`.
- Service writes `created_by` and updates `updated_by` (server-managed), matching the schema’s audit columns.

### Why some schema columns are not in DTO
- `id` is DB-generated.
- `created_by`, `updated_by`, timestamps, soft-delete columns are DB/server-managed.

### Optimized finding
- Repair Types are appropriately configured (DTO + controller + service match the `repair_types` table intent).

## D2) repair_projects ↔ CreateRepairProjectDto / UpdateRepairProjectDto / QueryRepairProjectDto

### Coverage
- DTO covers the main create fields for `repair_projects` (project linkage, building/location, repair_type, urgency/status, dates, budget, assignments, metadata).
- Service correctly treats `created_by/updated_by/deleted_by` as server-managed and enforces `project_code` uniqueness at the API level.

### Why some schema columns are not in DTO
- `id`, timestamps, soft-delete fields are DB/system-managed.
- `reported_date` has a schema default and is not client-authored at create time.
- `completion_date` exists in schema but is not exposed by Create/Update DTOs, so it cannot be set via current API surface.

### High-priority mismatches (schema vs service joins/selected columns)
- Contractors join mismatch:
  - Service selects `c.company_name` but schema contractors table uses `name` (no `company_name`).
- Facilities join mismatch:
  - Service selects `f.name` but schema facilities table uses fields like `building_name`, `room_number`, `facility_type` (no `name`).

### Optimized solution
- Align either:
  - Backend queries to schema: select `contractors.name` and construct a facility label from `facilities.building_name/room_number/facility_type`, or
  - Schema to backend: add/rename the expected columns (not recommended unless the backend column naming is standardized everywhere).
- If completion tracking is required, add `completion_date` to update DTO/service or store it in a dedicated “progress/milestone” workflow.

## D3) repair_pow_items ↔ CreatePowItemDto

### Coverage
- DTO matches required schema inputs: `item_number`, `description`, `unit`, `quantity`, `estimated_*`, `unit_cost`, `date_entry`, `category`, `phase`.

### Why some schema columns are not in DTO
- `status` has a schema default (`Active`) and is safe to omit for lean create.
- `is_unit_cost_overridden` is a server/business-rule flag; safe to omit unless UI needs it.
- Audit columns are DB/system-managed.

### Optimized finding
- DTO is appropriately lean; expand only if you need to allow status overrides or unit-cost override toggles.

## D4) repair_project_phases ↔ CreatePhaseDto

### Coverage
- DTO supports planning fields (`target_*` dates/progress, optional status, remarks).

### Schema columns not represented by DTO/service
- `actual_start_date`, `actual_end_date` exist in schema but are not accepted by CreatePhaseDto and are not written by the service.

### Optimized finding
- Acceptable if actual dates are updated by a separate progress workflow. Otherwise add actual_* fields to DTO + update endpoints.

## D5) repair_project_team_members ↔ CreateTeamMemberDto

### Coverage
- DTO supports `user_id?`, `name`, `role`, optional `department/responsibilities/status`.
- Schema has similar columns with server-managed timestamps.

### Optimized finding
- Appropriately aligned.

## D6) Repair reporting tables exist without API coverage

### Present in schema but missing in repair-projects module DTO/service/controller
- `repair_project_financial_reports`
- `repair_project_progress_summaries`
- `repair_project_milestones`
- accomplishment tables

### Optimized solution
- Either add endpoints/DTOs for these tables, or remove them from the schema draft to avoid “schema drift” and dead tables.

---

# E) GAD Module

## E1) GAD parity tables ↔ parity DTOs + review DTO

### Schema coverage
- Parity tables include: `status`, `submitted_by`, `reviewed_by`, `reviewed_at`, timestamps, `deleted_at`.

### DTO/service coverage
- Create DTOs supply only the parity payload columns (e.g., `academic_year`, counts).
- Service sets `submitted_by` from auth context; review endpoint sets `status/reviewed_by/reviewed_at`.

### Optimized finding
- GAD Parity is aligned and follows a clean workflow separation:
  - create = payload only
  - review = status transition

## E2) gad_gpb_accomplishments / gad_budget_plans ↔ planning DTOs

### Schema columns not represented by DTO/service
- `data_status` exists in schema (default `pending`) but API filters/updates mainly use `status`.
- Review columns exist (`reviewed_by/reviewed_at`) but there is no explicit review endpoint in the current controller.

### Optimized solution
- Decide whether `data_status` is needed:
  - If yes, add DTO fields + endpoints for review/workflow transitions.
  - If no, remove `data_status` from schema to keep a single status source of truth.

## E3) gad_yearly_profiles exists without API coverage

### Optimized finding
- Table exists in schema but there is no DTO/service/controller support.
- Either add a module to manage yearly profiles or remove the table from schema draft.

---

## Research Log (Files Compared)
- Schema:
  - `database\database draft\2026_01_12\pmo_schema_pg.sql` (University Operations section around 11.* tables)
- University Operations DTOs:
  - `pmo-backend\src\university-operations\dto\create-operation.dto.ts`
  - `pmo-backend\src\university-operations\dto\update-operation.dto.ts`
  - `pmo-backend\src\university-operations\dto\query-operation.dto.ts`
  - `pmo-backend\src\university-operations\dto\create-indicator.dto.ts`
  - `pmo-backend\src\university-operations\dto\create-financial.dto.ts`
  - `pmo-backend\src\university-operations\dto\index.ts`
- University Operations implementation:
  - `pmo-backend\src\university-operations\university-operations.service.ts`
  - `pmo-backend\src\university-operations\university-operations.controller.ts`
- Repair Types DTOs + implementation:
  - `pmo-backend\src\repair-types\dto\*`
  - `pmo-backend\src\repair-types\repair-types.service.ts`
  - `pmo-backend\src\repair-types\repair-types.controller.ts`
- Repair Projects DTOs + implementation:
  - `pmo-backend\src\repair-projects\dto\*`
  - `pmo-backend\src\repair-projects\repair-projects.service.ts`
  - `pmo-backend\src\repair-projects\repair-projects.controller.ts`
- GAD DTOs + implementation:
  - `pmo-backend\src\gad\dto\*`
  - `pmo-backend\src\gad\gad.service.ts`
  - `pmo-backend\src\gad\gad.controller.ts`
