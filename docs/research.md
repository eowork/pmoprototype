# PMO Dashboard: Active Research

**Governance:** ACE v2.4 Phase 1 (Research Complete)
**Last Updated:** 2026-04-30
**Status:** ✅ Section 2.122 Phase JI — MikroORM Migration System Adoption | Archive: `docs/research_Artifact_April_2026.md`
**Context:** `CLAUDE.md` (project root) | Archive: `docs/archive/`

---

## ARCHITECTURE REFERENCE

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS + MikroORM (hybrid) + PostgreSQL via `pg` driver |
| Frontend | Nuxt 3 + Vue 3 Composition API + Vuetify 3 + ApexCharts (`vue3-apexcharts`) |
| Auth | JWT + RBAC; Google OAuth; OpenLDAP (deployment-gated) |
| File Uploads | Multer via `FileInterceptor('file', { limits: { fileSize: 10MB } })` |
| MCP | Figma official server `https://mcp.figma.com/mcp` (assistive only) |

---

### MikroORM Hybrid Data Access Model (ENFORCED PATTERN)

The backend uses a **hybrid** data access model — NEVER introduce new `DatabaseService` usage.

| Use Case | Method |
|---|---|
| CRUD (create/update/delete/list) | `em.find()`, `em.findOne()`, `em.persistAndFlush()`, `em.flush()` |
| Analytics / complex joins / GROUP BY | `em.getConnection().execute(sql, params)` |
| Auth user lookups (bypass soft-delete) | `em.findOne(User, { email: { $ilike: email }, deletedAt: null }, { filters: false })` |
| Legacy health only | `DatabaseService` — retained ONLY in `health.service.ts`, NEVER extend |

**Raw SQL parameter binding:**
- Use `?` placeholders (NOT `$1`, `$2`) — MikroORM PostgreSQL driver maps `?` → `$N`
- Array parameters: `WHERE campus = ANY(?)` with params `[['MAIN', 'CABADBARAN']]` (array as single `?`)
- Never use string-interpolated SQL — always parameterized

**Paginated response:** `createPaginatedResponse(data, total, page, limit)` → `{ data: T[], meta: { total, page, limit, totalPages } }`
- ALL consumers must unwrap `.data` — never assume plain array from paginated endpoints

**Global soft-delete filter:** `@Filter({ name: 'notDeleted', cond: { deletedAt: null }, default: false })` on entities.
- Applied via `em.addFilter('notDeleted')` in `AppModule` scope
- NEVER use `default: true` — causes auth login 500 (Phase HT root cause)
- Auth lookups pass `{ filters: false }` to bypass

---

### Authentication Architecture

- **JWT flow:** `Authorization: Bearer <token>` → `JwtStrategy` validates → `@CurrentUser()` injects `JwtPayload { sub, email, role, campus }`
- **Guards:** `@UseGuards(JwtAuthGuard, RolesGuard)` at controller class level + `@Roles(...)` per route
- **Public routes:** `@Public()` decorator bypasses global guard
- **Google OAuth:** `GET /api/auth/google` → callback → JWT issued
- **OpenLDAP:** `ldap.strategy.ts` — deployment-gated; Phase JD fix applied — uses `em.findOne` (no DatabaseService)
- **Auth module:** Does NOT import `DatabaseModule` (Phase JD)

---

### RBAC Architecture

- Permission keys (immutable in `pmo-frontend/middleware/permission.ts`): `uo`, `coi`
- Roles: `SuperAdmin` → `Admin` → `Staff` → `Viewer`
- Campus scoping: non-admin users see own-campus records + all PUBLISHED + own-created/assigned
- Frontend composable: `usePermissions()` → `canAdd(module)`, `canEdit(module)`, `canDelete(module)`, `isAdmin`, `isStaff`, `isSuperAdmin`

---

### Frontend Coding Patterns

- **API calls:** `api.get<T>()`, `api.post()`, `api.patch()`, `api.del()` — NOT `api.delete()`
- **Tab content (Vuetify 3):** MUST use `<v-tabs v-model>` + `<v-window v-model>` + `<v-window-item value="">` pattern. Using raw `v-if` on template blocks causes Vuetify to set model to internal index instead of string value (Phase JF root cause fix).
- **ApexCharts typing:** `type: 'donut' as const`, `position: 'bottom' as const` — literal type assertions required to satisfy `ApexOptions`
- **Lazy tab fetch:** `watch(activeTab, (tab) => { if (tab === 'target' && !data.value) fetchData() })`
- **Error state:** Always track `error` ref alongside `loading` ref — show visible retry button, not silent fail
- **DELETE:** `api.del()` (not `api.delete()`) — established in CLAUDE.md Directive 81

---

### COI Module Architecture

See Section 2.115 below for full COI analysis. Summary:

| Component | Location | Status |
|-----------|----------|--------|
| Backend controller | `pmo-backend/src/construction-projects/construction-projects.controller.ts` | ✅ Full CRUD + workflow + analytics |
| Backend service | `pmo-backend/src/construction-projects/construction-projects.service.ts` | ✅ Includes analytics methods |
| Public controller | `pmo-backend/src/construction-projects/public-construction.controller.ts` | ✅ Unauthenticated PUBLISHED-only |
| Module | `pmo-backend/src/construction-projects/construction-projects.module.ts` | ✅ Registers both controllers |
| Admin index | `pmo-frontend/pages/coi/index.vue` | ✅ List + KPI + filter + analytics tab |
| Admin detail | `pmo-frontend/pages/coi/detail-[id].vue` | ✅ Full detail + gallery |
| Admin edit/new | `pmo-frontend/pages/coi/edit-[id].vue`, `new.vue` | ✅ Stable |
| Public index | `pmo-frontend/pages/coi/public/index.vue` | ✅ Public project cards |
| Public detail | `pmo-frontend/pages/coi/public/detail-[id].vue` | ✅ Read-only detail |
| Adapters | `pmo-frontend/utils/adapters.ts` | ✅ BackendMilestone, BackendFinancial, BackendGalleryItem corrected |

**COI entities (5):** `ConstructionProject`, `ConstructionMilestone`, `ConstructionProjectFinancial`, `ConstructionGallery`, `ConstructionSubcategory`

**COI publication workflow:** `DRAFT → PENDING_REVIEW → PUBLISHED / REJECTED`

**COI RBAC:** Permission key `coi`. Admin = full control. Staff = own/assigned records. Viewer = read-only (PUBLISHED only for non-admin).

---

### Figma MCP Status

| Client | Config | Status |
|--------|--------|--------|
| Claude Code CLI | `.mcp.json` → `https://mcp.figma.com/mcp` | ✅ Connected + authenticated |
| VS Code Copilot | `.vscode/mcp.json` → `https://mcp.figma.com/mcp` | ✅ Connected + authenticated |

- Both files are gitignored — no key exposure
- Official server supports `figma.com/make/{id}` URLs (confirmed by Figma docs)
- Role: **STRICTLY ASSISTIVE** — design reference only. NOT authoritative over implementation decisions.
- Figma Make admin URL: `https://www.figma.com/make/rslJrHybEabnxHhW1M3mEo/Admin-Side-PMO-Dashboard-V1-Caution`
- Figma Make client URL: `https://www.figma.com/make/BLrO1i29yyTrkkg4iyVR5V/Client-Side-PMO-Dashboard-V1`

---

### OpenLDAP Status

⏸ **Deployment-gated.** Not activated during development. Activates when operator provisions LDAP server at first deployment (~1–2 day scope).
- `ldap.strategy.ts` ready (Phase JD fix: uses `em.findOne`, no DatabaseService)
- All other auth paths (JWT, Google OAuth) are production-grade and fully operational

---

### University Operations Module (Reference Pattern)

The UO module is the architectural reference for all data-entry modules:
- Physical Accomplishment: `pages/university-operations/physical/index.vue`
- Financial Accomplishment: `pages/university-operations/financial/index.vue`
- Analytics Dashboard: `pages/university-operations/index.vue`
- Backend: `pmo-backend/src/university-operations/university-operations.service.ts`
- Analytics: 91 raw SQL CTEs via `em.getConnection().execute()` — intentional per BAR reports requirement
- 8 EntityRepositories: UO, Indicator, Financial, QR, QRS, FY, Taxonomy, OrgInfo

---

## Section 2.122 — Phase JI: MikroORM Migration System Adoption (2026-04-30)

**Status:** Phase 1 Research Complete
**Trigger:** RUN_ACE — operator authorizes Path B (MikroORM migration system adoption as dedicated infrastructure phase). The 43-migration manual `psql` SQL regime is replaced with MikroORM TypeScript migration classes going forward. No COI schema changes in this phase.

---

### 2.122-A: Current State Audit

**Migration infrastructure status:**

| Component | State |
|---|---|
| `@mikro-orm/migrations` (v6.6.13) | ✅ Installed in `dependencies` |
| `@mikro-orm/cli` | ❌ NOT in `devDependencies` — CLI commands unavailable |
| `mikro-orm.config.ts` `migrations` block | ✅ Configured — `path: './src/database/mikro-migrations'`, `tableName: 'mikro_orm_migrations'` |
| `src/database/mikro-migrations/` directory | ❌ Does NOT exist |
| npm migration scripts | ❌ ABSENT from `package.json` |
| `dotenv/config` import in `mikro-orm.config.ts` | ❌ ABSENT — CLI cannot load `.env` without it |
| `mikro-orm.configPaths` in `package.json` | ❌ ABSENT — CLI cannot discover config at non-default path |
| `database/migrations/` (001–043) | ✅ Applied via manual `psql -f` — historical archive only going forward |

**43 manual SQL migrations (001–043) are the applied DB baseline.** All tables, columns, indexes, and seed data they created are in the database. All 44 entities in `src/database/entities/**/*.entity.ts` are synchronized with the DB.

---

### 2.122-B: CLI Config Discovery Issue

The MikroORM config lives at `pmo-backend/src/database/mikro-orm.config.ts` — NOT the default location (`pmo-backend/mikro-orm.config.ts`). The CLI will fail to auto-discover config without explicit path registration.

**Fix (chosen):** Add `mikro-orm.configPaths` to `pmo-backend/package.json` at root level:

```json
"mikro-orm": {
  "configPaths": [
    "./src/database/mikro-orm.config.ts",
    "./dist/database/mikro-orm.config.js"
  ]
}
```

This is the official MikroORM mechanism. The alternative (passing `--config` flag to every CLI invocation) is fragile and error-prone — rejected.

---

### 2.122-C: dotenv Gap

`mikro-orm.config.ts` reads database credentials from `process.env.DATABASE_*`. In the NestJS runtime, `@nestjs/config` loads `.env` before MikroORM initializes. In CLI context (`npm run migration:up`), `ts-node` executes the config file directly — `.env` is NOT loaded unless explicitly imported.

**Fix:** Add `import 'dotenv/config'` as the FIRST line of `mikro-orm.config.ts`. `dotenv` is already available as a transitive dependency of `@nestjs/config` in `node_modules`. If `.env` is absent, dotenv silently no-ops and the config falls back to defaults (`localhost`, `postgres`/`postgres`).

---

### 2.122-D: Baseline Migration Strategy

**Problem:** MikroORM tracks applied migrations in `mikro_orm_migrations` table. Going forward, every new `.ts` migration must be applied via `npm run migration:up`. The 43 historical SQL files are NOT tracked by MikroORM — only new `.ts` migrations will be.

**Chosen approach: Empty baseline migration anchor**

1. Create `Migration20260430000000_Baseline.ts` with empty `up()` and `down()` methods
2. Run `npm run migration:up` once → MikroORM auto-creates `mikro_orm_migrations` table + inserts baseline row
3. After this, `npm run migration:list` shows baseline as applied; any future `.ts` migration appears as pending
4. DB state is unchanged (empty `up()` cannot mutate schema)

**Why not write full DDL in `up()`?**
- 43 migrations = ~1,000+ lines of DDL that would need to exactly match current DB state including indexes, constraints, seeds
- Any drift between written DDL and actual DB causes migration failures on future installs
- The empty `up()` is the correct convention for "DB is already bootstrapped via other means"

**Historical SQL files preserved:** `database/migrations/001–043` remain in the repo as a READ-ONLY historical record. They document how the schema evolved. They are NOT deleted, NOT re-run via MikroORM.

---

### 2.122-E: Going-Forward Convention

After JI is complete, the workflow for all schema changes is:

| Task | Command |
|---|---|
| Create new migration | `cd pmo-backend && npm run migration:create -- --name=<DescriptiveName>` |
| Apply pending migrations | `npm run migration:up` |
| Rollback last migration | `npm run migration:down` |
| List migration status | `npm run migration:list` |
| Check for pending (CI) | `npm run migration:check` |

**NEVER** add new `.sql` files to `database/migrations/`. That directory is frozen at migration 043. All future schema changes are `.ts` migration classes in `src/database/mikro-migrations/`.

When deploying to a NEW environment (fresh DB): run 43 SQL files first (`psql -f` each), then `npm run migration:up` to register the baseline. Future rollouts after JI: only `npm run migration:up` needed.

---

### 2.122-F: Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| `@mikro-orm/cli` version mismatch | LOW | Pinned to `^6.6.13` to match `@mikro-orm/core` |
| Baseline migration changes DB state | NONE | Empty `up()`/`down()` — zero DDL |
| `.env` not found during CLI run | LOW | dotenv silently no-ops; fallback defaults only affect local overrides |
| CLI config discovery fails | HIGH → MITIGATED | `mikro-orm.configPaths` in `package.json` eliminates this |
| Developer adds `.sql` to `database/migrations/` | MEDIUM | Convention documented here + in plan.md directive JI-D2 |
| Fresh DB install complexity increases (run SQL + migration:up) | LOW | Document in VERSION CONTROL instructions |

---

### 2.122-G: Entity Registry — 44 Entities (Already Aligned)

All entities in `src/database/entities/index.ts` are fully defined and match DB schema post-migration-043. No entity changes in Phase JI.

Entity count by module:
- **Auth/RBAC (10):** User, Role, Permission, UserRole, RolePermission, UserPermissionOverride, UserModuleAssignment, UserPillarAssignment, PasswordResetRequest, UserDepartment
- **COI (5):** ConstructionProject, ConstructionMilestone, ConstructionProjectFinancial, ConstructionGallery, ConstructionSubcategory
- **University Operations (8):** UniversityOperation, OperationIndicator, OperationFinancial, QuarterlyReport, QuarterlyReportSubmission, FiscalYear, PillarIndicatorTaxonomy, OperationOrganizationalInfo
- **Supporting (21):** Department, Contractor, FundingSource, Project, RecordAssignment, RepairProject, RepairPowItem, RepairProjectPhase, RepairProjectTeamMember, RepairType, GAD series (7), Document, Media, SystemSetting

---

## Section 2.121 — Phase JH: COI Schema Expansion — Gap Re-audit (2026-04-30)

**Status:** Phase 1 Research Complete
**Trigger:** RUN_ACE — operator challenged YAGNI deferral in Section 2.120-D. Re-audit current `ConstructionProject` entity against Figma fields to determine actual schema gaps and define Phase JH scope.

---

### 2.121-A: Critical Correction — Entity Already Contains Most Figma Fields

Re-reading `pmo-backend/src/database/entities/construction-project.entity.ts` revealed that Section 2.120-D was **wrong** about several "missing" fields. The entity is significantly richer than initially audited.

**Fields originally classified as "missing" but ACTUALLY PRESENT in entity:**

| Field | Entity Column | Type | DTO Status | Frontend Status |
|-------|--------------|------|------------|-----------------|
| `originalContractDuration` | `original_contract_duration` | varchar(100) | ✅ DTO has `original_contract_duration` | ❌ NOT in any form |
| `physicalProgress` (actual) | `physical_progress` | decimal(5,2) | ✅ DTO accepts it | ✅ In `edit-[id].vue` only |
| `financialProgress` | `financial_progress` | decimal(5,2) | ❌ NOT in DTO | ❌ NOT in forms |
| Free-form metadata | `metadata` | jsonb | ✅ DTO accepts | ❌ Not exposed |
| Timeline records | `timeline_data` | jsonb | ❌ NOT in DTO | ❌ Not exposed |
| Inline gallery store | `gallery_images` | jsonb | ❌ NOT in DTO | ❌ Not exposed (separate gallery table used instead) |
| `objectives` | `objectives` | jsonb | ✅ DTO `string[]` | ❌ Not exposed |
| `key_features` | `key_features` | jsonb | ✅ DTO `string[]` | ❌ Not exposed |

**Lesson:** Always read the entity file first. The DTO is a partial projection — the entity is authoritative.

---

### 2.121-B: Genuinely Missing Schema Elements

Only these are TRULY missing from the schema:

| # | Missing | Type | Justification |
|---|---------|------|---------------|
| 1 | `target_physical_progress` | column | Figma shows target % alongside actual %. Currently only `physical_progress` (actual) exists. Variance ("On Track" / "Behind Schedule") cannot be computed without target. |
| 2 | `target_financial_progress` | column | Same rationale for financial side. |
| 3 | Accomplishment records | new table | Figma Section A (planned) and Section B (actual) display multiple time-stamped records per project (`asOf`, `dateEntry`, `comments`, `remarks`). Single-row columns on project insufficient. |
| 4 | Project phases | new table | Figma shows 4 phase cards per project, each with target/actual progress, target/actual dates, status. Cannot model with single-row columns. |
| 5 | `total_labor_cost` | column | Figma form field. Could go on project OR financial entity. |
| 6 | `total_project_cost` | column | Same — distinct from `contract_amount` (Figma uses both). |

---

### 2.121-C: Migration Sequence

**Current last migration:** `042_add_missing_user_columns.sql`
**Next available number:** `043`

No previous COI-specific migration files exist (gallery/milestones/financials were created via earlier consolidated migrations or seed scripts). Phase JH migrations will be the first dedicated COI schema migrations since Phase JB.

---

### 2.121-D: Recommended Phase JH Scope (3 sub-phases — JH-A only is in scope for current authorization)

**JH-A — Quick Wins (HIGH value, LOW risk) ← Phase JH scope**

Goal: Expose existing entity columns and add 2 simple target-progress columns. No new tables.

1. **Migration `043_add_target_progress_to_construction_projects.sql`** — adds:
   - `target_physical_progress DECIMAL(5,2) DEFAULT 100`
   - `target_financial_progress DECIMAL(5,2) DEFAULT 100`
2. **Entity update** — add `targetPhysicalProgress` and `targetFinancialProgress` properties
3. **DTO update** — add `target_physical_progress?`, `target_financial_progress?`, `financial_progress?`, `objectives?`, `key_features?`, `metadata?` to `CreateConstructionProjectDto` and `UpdateConstructionProjectDto`
4. **Service update** — INSERT and UPDATE statements include new columns
5. **Frontend `BackendProjectDetail` interface** — add `target_physical_progress`, `target_financial_progress`, `financial_progress`, `original_contract_duration`
6. **Frontend `new.vue` + `edit-[id].vue`** — expose:
   - `original_contract_duration` (text field — Figma label: "Original Contract Duration")
   - `target_physical_progress` (number 0–100, suffix %)
   - `target_financial_progress` (number 0–100, suffix %)
   - `financial_progress` (number 0–100, suffix %, edit only)
   - `objectives` (textarea — newline-separated input → split into `string[]` on submit)
   - `key_features` (textarea — same pattern)
7. **Detail page** — display target vs actual variance for both physical and financial progress

**JH-B — Accomplishment Records (DEFERRED to next phase)**
- New table `construction_accomplishment_records`
- Columns: id, project_id, record_type (PLANNED/ACTUAL), record_date, as_of_description, comments, remarks, audit
- Requires: new entity, new module sub-dir, CRUD endpoints, RBAC, frontend list/form components
- ~3x the scope of JH-A. Defer until JH-A verified.

**JH-C — Project Phases (DEFERRED to later phase)**
- New table `construction_project_phases`
- Same pattern as accomplishment records but with phase-specific columns
- Defer until JH-B complete and stable.

---

### 2.121-E: Out-of-Scope Decisions

**`total_labor_cost` and `total_project_cost`:** Defer indefinitely. The existing `ConstructionProjectFinancial` entity captures `appropriation`, `obligation`, `disbursement` per fiscal year. Adding labor/total cost to either project or financial entity duplicates existing data without clear consumer requirement. Reopen if PMO stakeholders explicitly request.

**`approvedBudget`:** Maps to existing `contract_amount` semantically. No new column needed.

**`location` (free-text from Figma):** Backend uses `campus` enum + optional `latitude`/`longitude`. Free-text location adds fragility (search/filter inconsistency). Keep current schema.

**`actualProgress` / `progressAccomplishment` (Figma):** Both map to existing `physical_progress` (current actual %). No duplication.

---

### 2.121-F: Risk Assessment for JH-A

| Risk | Severity | Mitigation |
|------|----------|------------|
| Migration breaks existing rows | LOW | Both new columns nullable + `DEFAULT 100` — safe additive |
| DTO changes break existing API consumers | LOW | All new fields `@IsOptional()` — backward compatible |
| Frontend type errors | LOW | `BackendProjectDetail` extension is additive |
| Existing `physical_progress` semantics change | NONE | No change to existing column |
| Service INSERT/UPDATE breaks | MEDIUM | Test create + update flows after column position changes in raw SQL |

---

### 2.121-G: JH-A Implementation Order (for Phase 2 Plan)

1. Write migration `043` (file only — operator runs)
2. Update entity (add 2 properties)
3. Update Create + Update DTOs (add 6 fields with `@IsOptional()`)
4. Update service `create()` and `update()` raw SQL (insert columns + params)
5. Update `BackendProjectDetail` frontend interface
6. Update `new.vue` form state + payload + template (6 new fields)
7. Update `edit-[id].vue` form state + payload + pre-populate + template
8. Update `detail-[id].vue` to display target vs actual variance
9. Run `vue-tsc --noEmit` to verify
10. Document for operator: migration must run before backend restart

---

## Section 2.120 — Phase JG: Gate 2 Failure Diagnostic + Figma COI Analysis (2026-04-30)

**Status:** Phase 1 Research Complete
**Trigger:** RUN_ACE — diagnose Gate 2 failures (gallery upload, missing geotag, missing date), then extract Figma MCP design context for COI module UI alignment.

---

### 2.120-A: Gate 2 Root Causes (All 3 Confirmed via Code Reading)

**Bug 1 — Gallery upload fails silently**

| Item | Value |
|------|-------|
| File | `pmo-frontend/pages/coi/detail-[id].vue` |
| Line | ~243 (inside `uploadGalleryItem()`) |
| Bug | `await api.post('/api/construction-projects/${projectId}/gallery', formData)` |
| Root cause | `api.post()` calls `JSON.stringify(data)` → converts FormData to `"{}"` and sets `Content-Type: application/json`. Multer receives no file field, upload silently fails. |
| Fix | Change to `await api.upload('/api/construction-projects/${projectId}/gallery', formData)` — `upload()` sends raw FormData body; browser sets correct `multipart/form-data; boundary=...` Content-Type. |

**Bug 2 — Geotag fields absent from Create and Edit forms**

| Item | Value |
|------|-------|
| File | `pmo-frontend/pages/coi/new.vue` AND `pmo-frontend/pages/coi/edit-[id].vue` |
| Bug | `latitude`, `longitude` NOT in form state, NOT in template, NOT in payload |
| Backend DTO | `latitude?: @IsNumber()`, `longitude?: @IsNumber()` — both optional, present in DTO |
| Fix | Add to form state (`latitude: null as number | null`, `longitude: null as number | null`), add two `v-text-field type="number"` in the Location / Building Details card, include in payload as `latitude: form.value.latitude || undefined` |

**Bug 3 — `actual_completion_date` missing from Create form only**

| Item | Value |
|------|-------|
| File | `pmo-frontend/pages/coi/new.vue` |
| Bug | `actual_completion_date` absent from form state and template (it IS present in `edit-[id].vue`) |
| Backend DTO | `actual_completion_date?: @IsDateString()` — optional, present in DTO |
| Fix | Add `actual_completion_date: ''` to `new.vue` form state; add `v-text-field type="date"` in the Schedule card alongside `target_completion_date`; include in payload as `actual_completion_date: form.value.actual_completion_date || undefined` |

---

### 2.120-B: Figma Admin MCP Analysis — `rslJrHybEabnxHhW1M3mEo`

**Source files read:** `ProjectFormDialog.tsx`, `ConstructionProjectDetail.tsx` (main tab component)

#### Project Form Dialog — 6 Sections

| Section | Fields |
|---------|--------|
| Basic Project Info | `projectTitle*`, `dateStarted*`, `targetDateCompletion`, `projectDuration`, `originalContractDuration`, `fundingSource*` (GAA/Locally Funded/Special Grants/Other), `status*` (Planning/Ongoing/Completed/Delayed/Suspended/On Hold), `location` (text), `description` (brief), `projectDescription` (detailed), `idealProposedImage` (URL) |
| Financial Info | `approvedBudget*`, `appropriation*`, `obligation (Contract Cost)*`, `disbursement`, `totalLaborCost`, `totalProjectCost` — live summary: utilization %, remaining budget |
| Contractor Info | `contractor` (company), `contractorName` (contact person) |
| Progress Info | `progressAccomplishment` (0–100%), `actualProgress` (0–100%), `targetProgress` (0–100%), `projectStatus` (text narrative) — live variance indicator: On Track / Behind Schedule |
| Accomplishment Info | `accomplishmentAsOf` (text), `accomplishmentDateEntry` (date), `accomplishmentComments`, `accomplishmentRemarks` |
| Actual Status | `actualAccomplishmentAsOf` (text), `actualDateEntry` (date), `remarks` |

#### Project Detail Tabs (7)

| Tab | Key Content |
|-----|-------------|
| Overview | Gallery preview (latest 2 photos + "View All"), Progress overview card (financial % + physical % + phase tracker), Project Information (description, objectives, key features, 9-field grid), Financial Accomplishment (quarterly period cards × 4, color-coded), Physical Accomplishment by Phase (phase cards × 4 with target/actual/variance, progress bar) |
| Timeline | Milestone list with CRUD, filter, pagination |
| Individual POW | Program of Works line items table |
| Data Analytics | M&E Dashboard (connected to POW items via shared state) |
| Gallery | Photo grid with category filter, upload dialog, delete |
| Documents | Document list with version, category, upload/delete |
| Team | Personnel cards with add/edit/remove |

#### Section A Data (Accomplishment Record)
Fields: `projectDescription`, `idealInfrastructureImage`, `accomplishmentAsOf`, `dateEntry`, `comments`, `remarks`

#### Section B Data (Actual Accomplishment)
Fields: `actualAccomplishmentAsOf`, `actualDateEntry`, `progressAccomplishmentPercent`, `projectStatusActual`, `projectStatusTarget`, `dateStarted`, `targetDateCompletion`, `originalContractDuration`, `contractorName`

#### Key Observations
- Figma uses free-text `location` field, NOT a campus enum dropdown
- Latitude/longitude NOT present in Figma form — geotag is backend-only metadata
- `idealProposedImage` maps to backend `ideal_infrastructure_image` — URL input only (not file upload)
- Financial Accomplishment is displayed as period-based card logs (quarterly), linked to `ConstructionProjectFinancial` entity
- Physical Accomplishment is phase-based (4 phases), not a single flat progress %
- Overview tab shows gallery inline (latest 2 photos with "View All" → Gallery tab)

---

### 2.120-C: Figma Client MCP Analysis — `BLrO1i29yyTrkkg4iyVR5V`

**Source files read:** `ConstructionInfrastructurePage.tsx` (public list), `ProjectDetailPageRestored.tsx` (public detail)

#### Public Listing Page — `ConstructionInfrastructurePage.tsx`

- Category tabs: All / GAA-Funded / Locally-Funded / Special Grants
- Filter controls: Search (text), Status filter (All/Ongoing/Completed/Planned), Year filter
- Project cards (two layouts): card view and list/table view toggle
- Project card fields: title, category badge, status badge, progress bar (physical), financialProgress bar, location, startDate, targetEndDate, budget (string)
- View mode toggle: card grid ↔ list/table

#### Public Detail Page — `ProjectDetailPageRestored.tsx`

- Same 7-tab structure as admin detail BUT all read-only (no CRUD buttons for non-auth)
- Has `ClientNavbar` instead of admin sidebar
- Accessibility features: `FloatingAccessibilityButton`, font size controls
- Uses breadcrumb navigation: Home → Construction Infrastructure → Category → Project Title
- Same Section A/B display structure (read-only mode)

---

### 2.120-D: Gap Matrix — Figma Design vs. Current Implementation

| Feature | Figma Admin | Current Admin | Gap |
|---------|-------------|---------------|-----|
| Gallery upload method | FormData | `api.post()` (BUG) | **Gate 2 Bug 1** |
| Geotag fields in form | Not shown (backend-only) | Absent | **Gate 2 Bug 2** |
| `actual_completion_date` in create | Not shown | Absent from `new.vue` | **Gate 2 Bug 3** |
| `ideal_infrastructure_image` in form | URL input ✅ | Absent from both forms | Add to `new.vue` + `edit-[id].vue` |
| Overview gallery preview | Latest 2 photos inline | Not implemented | Phase JG enhancement |
| Financial Accomplishment cards | Quarterly period logs | Flat table | Enhancement (no schema change) |
| Physical Accomplishment phases | Phase-based cards | Flat progress bar | Enhancement (no schema change) |
| Project Information grid | 9-field grid + objectives/features | Card with basic fields | Enhancement |
| Tab count (admin detail) | 7 tabs | ~4 visible tabs | Enhancement |
| Public listing category tabs | GAA / Locally / Special / All | Single list | Enhancement |
| Public listing view toggle | Card ↔ List | Card only | Enhancement |

**Fields in Figma form absent from current backend schema (requires migration — deferred YAGNI):**
- `originalContractDuration` (Figma) vs `project_duration` (backend) — same concept, rename deferred
- `approvedBudget` / `totalLaborCost` / `totalProjectCost` — not in project entity (in financial sub-entity)
- `progressAccomplishment` / `actualProgress` / `targetProgress` — only `physicalProgress` exists
- `accomplishmentAsOf`, `accomplishmentComments`, `accomplishmentRemarks` — not in schema
- `actualAccomplishmentAsOf`, `actualDateEntry`, `remarks` — not in schema

**Phase JG scope decision: Fix Gate 2 bugs + add `ideal_infrastructure_image` to forms. Defer all schema-requiring enhancements.**

---

### 2.120-E: Implementation Strategy for Phase JG

**Priority 1 — Gate 2 Bug Fixes (no backend changes)**
1. `detail-[id].vue`: Change `api.post → api.upload` for gallery upload
2. `new.vue`: Add latitude/longitude fields (form state + template + payload)
3. `edit-[id].vue`: Add latitude/longitude fields (form state + template + payload)
4. `new.vue`: Add actual_completion_date field

**Priority 2 — Quick UI Add (no backend changes, already in DTO)**
5. `new.vue` + `edit-[id].vue`: Add `ideal_infrastructure_image` URL field

**Priority 3 — Deferred (schema changes required, YAGNI until operator authorizes)**
- All Figma progress/accomplishment/financial form fields that don't map to current schema
- Gallery inline preview on overview tab
- 7-tab detail page expansion

---

## Section 2.119 — Phase JF: COI Analytics Dashboard (2026-04-29)

**Status:** Phase 1 Research Complete
**Trigger:** JB + JE complete, smoke tests verified. Next plan assessment.
**Objective:** Identify the next highest-value implementable phase.

---

### JF-A: Post-JB Gap Inventory

| Area | Status | Notes |
|---|---|---|
| COI admin CRUD + workflow | ✅ Complete | |
| COI public read-only pages | ✅ Complete | |
| COI gallery / MOV | ✅ Complete | |
| COI milestone display | ✅ Complete | |
| COI financial display | ✅ Complete | |
| COI KPI panel (index) | ✅ Complete | Client-side computed from list response |
| COI filter bar (index) | ✅ Complete | Status + campus + search |
| COI analytics charts | ❌ ABSENT | No backend endpoints, no visualizations |
| COI map / geo display | ❌ Deferred | YAGNI — per JB-J |
| COI status history table | ❌ Deferred | YAGNI — per JB-J |
| Phase HL @Filter fix | ❌ Deferred | Low priority — milestones/gallery use hard delete |

**Next priority: COI Analytics Dashboard.** All other gaps are YAGNI or deployment-gated.

---

### JF-B: Existing Analytics Patterns (Reference — UO Module)

The UO module (`/api/university-operations/analytics/`) has:
- `pillar-summary?fiscal_year=` → per-pillar indicator counts + accomplishment rate
- `quarterly-trend?fiscal_year=` → Q1/Q2/Q3/Q4 target vs actual rate
- `yearly-comparison?years=` → multi-year target vs actual
- `financial-pillar-summary`, `financial-quarterly-trend`, `financial-yearly-comparison`

All implemented as raw SQL in `UniversityOperationsService`.
Frontend: `pages/university-operations/index.vue` renders charts via ApexCharts.

COI analytics follows the same backend pattern (raw SQL via `em.getConnection().execute()`) and frontend pattern (ApexCharts in `coi/index.vue` analytics tab).

---

### JF-C: COI Analytics — Required Endpoints

| Endpoint | Returns | Chart |
|---|---|---|
| `GET /api/construction-projects/analytics/summary` | total, by_status, by_campus, by_publication_status, total_contract_value, avg_progress | Hero KPIs |
| `GET /api/construction-projects/analytics/financial-summary` | total_appropriation, total_obligation, total_disbursement, utilization_rate, disbursement_rate | Financial hero stats |

All endpoints: no query param required (all projects, all time). Auth required (Admin/Staff/Viewer).

---

### JF-D: Frontend Analytics Layout

**Location:** "Analytics" tab on `pages/coi/index.vue` (tab toggle: "Projects" | "Analytics").

**Analytics tab contents (top-to-bottom):**
1. **Financial Hero Row** — 4 stat cards: Total Appropriation, Total Obligation, Total Disbursement, Utilization Rate
2. **Status Distribution Donut** (left, md=5) + **Campus Breakdown Bar** (right, md=7)
3. **Publication Status Breakdown** — chips for DRAFT/PENDING_REVIEW/PUBLISHED/REJECTED counts

**Tab implementation:** `<v-tabs v-model>` + `<v-window>` + `<v-window-item>` (v-if approach breaks Vuetify model binding)

---

### JF-E: Implementation Status

- ✅ `getAnalyticsSummary()` added to service
- ✅ `getFinancialSummary()` added to service
- ✅ `GET analytics/summary` and `GET analytics/financial-summary` added to controller (before `:id` route)
- ✅ Analytics tab added to `coi/index.vue` with v-window pattern, error state, retry button

---

## Section 2.118 — Phase JE: Gallery Response Shape Fix (2026-04-29)

**Status:** Phase 1 Research Complete
**Trigger:** Operator smoke-test of JB Postman gate revealed 20-C and 21-C returning `{data:[], meta:{...}}` instead of plain array.

### Root Cause

`ConstructionProjectsService.findGallery()` returns `PaginatedResponse<ConstructionGallery>` = `createPaginatedResponse(items, total, page, limit)` = `{data: [...], meta: {...}}`.

Three consumers assumed plain array — all fixed (Option B: fix consumers, preserve service shape):
1. `pages/coi/detail-[id].vue` `fetchGallery()` — unwraps `res.data || []`
2. `pages/coi/public/detail-[id].vue` `fetchGallery()` — unwraps `res.data || []`
3. Postman 20-C — asserts `body.data` is array + `body.meta.total` exists
4. Postman 21-C — same

**20-D clarification:** 404 for nil UUID is CORRECT expected behavior — not an error.

---

## Section 2.117 — Phase JD: ORM Migration Completion — Active Modules (2026-04-28)

**Status:** Phase 1 Research Complete

| Module | DatabaseService | ORM Status |
|---|---|---|
| `AuthService` | ❌ None | ✅ Complete |
| `UsersService` | ❌ None | ✅ Complete (hybrid) |
| `UniversityOperationsService` | ❌ None | ✅ Complete (hybrid — 91 raw SQL CTEs intentional) |
| `LdapStrategy` | ❌ Fixed (Phase JD) | ✅ Uses `em.findOne(User, { email: { $ilike: email }, deletedAt: null }, { filters: false })` |
| `auth.module.ts` | Removed `DatabaseModule` import | ✅ Clean |

**Migration gap resolved.** Only remaining `DatabaseService` is `health.service.ts` (permanent keeper).

---

## Section 2.116 — Phase JC: Claude Code Figma MCP Setup (2026-04-28)

**Status:** Complete
**Scope:** Add Figma MCP server to Claude Code CLI config (`.mcp.json`).

**Finding:** Framelink/`figma-developer-mcp` (third-party, REST API-based) does NOT support `figma.com/make` URLs — returns HTTP 400. The official Figma MCP server at `https://mcp.figma.com/mcp` supports Make files per Figma's documentation.

**Config applied:**
- `.mcp.json` (Claude Code): `{ "mcpServers": { "figma": { "type": "http", "url": "https://mcp.figma.com/mcp" } } }`
- `.vscode/mcp.json` (VS Code): `{ "servers": { "Figma": { "type": "http", "url": "https://mcp.figma.com/mcp" } } }`
- Both gitignored ✅
- Auth: OAuth (not PAT) — each client authenticates independently via browser flow

---

## Section 2.115 — Phase JB: COI Module Initiation — Figma-Driven Analysis + System Alignment (2026-04-27)

**Status:** Phase 1 Research Complete
**Trigger:** Operator instruction: analyze COI module for Phase 1 development.
**Objective:** Decompose COI requirements, audit existing infrastructure, identify gaps, define data model.

---

### JB-A: Figma MCP Access Status

**Admin Figma link:** `https://www.figma.com/make/rslJrHybEabnxHhW1M3mEo/Admin-Side-PMO-Dashboard-V1-Caution`
**Client Figma link:** `https://www.figma.com/make/BLrO1i29yyTrkkg4iyVR5V/Client-Side-PMO-Dashboard-V1`

**Status:** Official MCP server (`mcp.figma.com/mcp`) is now connected and authenticated. Make files ARE supported per Figma documentation. Design data is accessible for future Figma-guided UI phases.

---

### JB-B: Existing COI Infrastructure Inventory

**Backend module:** `pmo-backend/src/construction-projects/`

**Backend entities (5):**

| Entity | Table | Key Fields |
|--------|-------|-----------|
| `ConstructionProject` | `construction_projects` | `id, projectCode, title, description, campus, status, fundingSourceId, contractorId, contractAmount, contractNumber, startDate, targetCompletionDate, actualCompletionDate, physicalProgress, publicationStatus, latitude, longitude, objectives(jsonb), keyFeatures(jsonb)` |
| `ConstructionMilestone` | `construction_milestones` | `id, projectId, title, description, targetDate, actualDate, status, remarks` |
| `ConstructionProjectFinancial` | `construction_project_financials` | `id, projectId, fiscalYear, appropriation, obligation, disbursement` |
| `ConstructionGallery` | `construction_gallery` | `id, projectId, imageUrl, caption, category, isFeatured, uploadedAt` |
| `ConstructionSubcategory` | `construction_subcategories` | Separate module, stable |

**Backend API endpoints:**

| Endpoint | Method | Access |
|----------|--------|--------|
| `/api/construction-projects` | GET | Admin, Staff, Viewer |
| `/api/construction-projects/analytics/summary` | GET | Admin, Staff, Viewer |
| `/api/construction-projects/analytics/financial-summary` | GET | Admin, Staff, Viewer |
| `/api/construction-projects` | POST | Admin, Staff |
| `/api/construction-projects/:id` | GET, PATCH, DELETE | Roles per HTTP method |
| `/api/construction-projects/:id/submit-for-review` | POST | Admin, Staff |
| `/api/construction-projects/:id/publish` | POST | Admin |
| `/api/construction-projects/:id/reject` | POST | Admin |
| `/api/construction-projects/:id/withdraw` | POST | Admin, Staff |
| `/api/construction-projects/:id/milestones` | GET, POST | GET: all; POST: Admin, Staff |
| `/api/construction-projects/:id/financials` | GET, POST | GET: all; POST: Admin, Staff |
| `/api/construction-projects/:id/gallery` | GET, POST | GET: all; POST: Admin, Staff |
| `/api/public/construction-projects` | GET | Public (no auth) |
| `/api/public/construction-projects/:id` | GET | Public (no auth) |
| `/api/public/construction-projects/:id/gallery` | GET | Public (no auth) |

**RBAC:** Permission key `coi` (immutable). Admin: full control. Staff: own/assigned. Viewer: PUBLISHED only.

---

### JB-C: Design Decomposition (Admin Side)

#### JB-C-1: Dashboard Overview — KPI Panel (Phase JB COMPLETE)

KPI stats panel added to `coi/index.vue`: total projects, completed, ongoing, avg progress (client-side from list response).

#### JB-C-2: Project Listing / Table (Phase JB COMPLETE)

Filter bar added: status filter, campus dropdown, search field. Columns: `Project Name, Campus, Status, Publication, Contract Amount, Progress, Actions`.

#### JB-C-3: Project Details View (Phase JB COMPLETE)

Fixed: milestone table (uses `title`, no weight/progress), financial display (appropriation/obligation/disbursement/utilization), gallery section (image grid + upload dialog + delete).

#### JB-C-4: Financial Tracking (FIXED in JB)

`ConstructionProjectFinancial` entity: `appropriation`, `obligation`, `disbursement`, `fiscal_year`.
Adapter rebuilt from scratch — old adapter (`description`, `amount`, `financial_type`) was a complete structural mismatch.

#### JB-C-5: Milestone Tracking (FIXED in JB)

`ConstructionMilestone` entity: `title`, `description`, `targetDate`, `actualDate`, `status`, `remarks`.
Old adapter used `milestone_name`, `weight_percentage`, `progress_percentage` — none of these exist in the entity.

#### JB-C-6: Gallery / MOV (COMPLETE in JB)

Backend: `POST /:id/gallery` multipart upload (10MB limit), `GET /:id/gallery` paginated list.
Frontend: Gallery section in detail page — `v-img` grid + upload dialog + delete per item.

---

### JB-D: Design Decomposition (Client Side — New Feature, COMPLETE in JB)

- Unauthenticated read-only view of PUBLISHED projects
- `/coi/public/index.vue` — no auth middleware, project cards grid
- `/coi/public/detail-[id].vue` — read-only detail (info, milestones, financials, gallery)
- Public controller: `/api/public/construction-projects` via `PublicConstructionController` (no guards)
- Separate controller at `public-construction.controller.ts` registered in `ConstructionProjectsModule`

---

### JB-E: Data Model Analysis

No new entities required. All required data covered by existing schema.

**Frontend adapter mismatch summary (ALL FIXED in JB/Phase JB-0 through JB-2):**

| Interface | Was wrong | Now correct |
|-----------|-----------|-------------|
| `BackendMilestone` | `milestone_name`, `weight_percentage`, `progress_percentage` | `title`, `description`, `targetDate`, `actualDate`, `status`, `remarks` |
| `BackendFinancial` | `description`, `amount`, `financial_type`, `date_recorded` | `fiscalYear`, `appropriation`, `obligation`, `disbursement` |
| `UIProjectDetail.gallery` | absent | `UIGalleryItem[]` added |

---

### JB-F: Workflow Analysis

**Publication workflow (confirmed):**
```
DRAFT ──(submit-for-review)──► PENDING_REVIEW ──(publish/approve)──► PUBLISHED
  ▲                                          │                         │
  └──────────────────(withdraw)──────────────┘   (reject)──► REJECTED ─┘
```
REJECTED → re-edit → re-submit. No separate withdraw from REJECTED needed.

---

### JB-G: RBAC and Access Control

- Permission key: `coi` (immutable)
- Campus values: `MAIN`, `CABADBARAN`, `BOTH`
- Client-side public view: No auth required — `PUBLISHED` records only

---

### JB-H: UI/UX Alignment

**CSU branding:**
- Primary color: emerald (`#059669` / Vuetify theme primary)
- `bg-primary text-white` on table headers
- `text-h4 font-weight-bold text-grey-darken-3` for page titles
- Gallery: `v-img` grid in `v-card`, upload via `v-file-input` in `v-dialog`

---

### JB-I: System Integration Status

| Integration | Status |
|-------------|--------|
| User Management (`/api/users/eligible-for-assignment`) | ✅ Integrated in new/edit forms |
| Funding Sources (`/api/funding-sources`) | ✅ Integrated |
| Contractors (`/api/contractors`) | ✅ Integrated |
| `record_assignments` table | ✅ Integrated (CONSTRUCTION module) |
| Pending reviews admin page | ✅ COI shows as "Infrastructure (COI)" |
| File uploads (UploadsService) | ✅ Gallery endpoint uses UploadsService |
| Analytics endpoints | ✅ Added in Phase JF |

---

### JB-J: Phase JB Scope (COMPLETE)

All 11 steps implemented:
1. ✅ Fix `BackendMilestone` interface + `adaptMilestone()` — adapters.ts
2. ✅ Rebuild `BackendFinancial` interface + `adaptFinancial()` — adapters.ts
3. ✅ Add `UIGalleryItem` + `BackendGalleryItem` + `adaptGalleryItem()` — adapters.ts
4. ✅ Fix detail page (milestones, financials, gallery section) — `coi/detail-[id].vue`
5. ✅ Add KPI panel + filter bar — `coi/index.vue`
6. ✅ Add `getStats()` method — service
7. ✅ Add `GET /stats` endpoint — controller
8. ✅ Create public controller — `public-construction.controller.ts`
9. ✅ Register public controller in module
10. ✅ Create `/coi/public/index.vue`
11. ✅ Create `/coi/public/detail-[id].vue`

**Deferred (YAGNI):** Status history table, map/geo display, Gantt chart, milestone weighting.

---

## Section 2.114 — Phase JA: Pre-Infra Stabilization (2026-04-27)

**Status:** Complete
**Scope:** Validate tooling, clean codebase, create safe `pmo-test1` git backup.

**Key findings:**
- Figma MCP: at that time, only Framelink (third-party) was configured — Make URLs returned 400 (resolved in JC/MCP swap)
- Git backup branch `pmo-test1` created as safety snapshot before COI development
- Cleanup: removed `docs/archive/` redundant files, confirmed `.gitignore` for MCP config, temp files
- Backend verification: all active modules stable (auth, UO, COI base CRUD)

---

## Section 2.113 — Phase IZ: Figma MCP Server Integration Feasibility (2026-04-23)

**Status:** Complete (findings updated by JC session — official server now in use)

**Key findings (now superseded by JC):**
- Original evaluation was for Framelink (`figma-developer-mcp`) which uses REST API and does NOT support Make files
- MCP is pure developer tooling — zero codebase changes, no disruption
- VS Code Copilot Chat (agent mode) is the primary consumer
- Figma Make files (`figma.com/make/{id}`) require the official Figma MCP server, not Framelink

**Superseded by JC:** Official Figma MCP server configured, authenticated on both clients.

---

## Section 2.111 — Phase IX: Post-MikroORM Stabilization Final Assessment (2026-04-23)

**Status:** Complete — system declared stable for feature development

**Key verdicts:**
- MikroORM migration: **terminal state** — all actionable modules complete
- IP smoke test: **PASSED** — operator confirmed all 14 sections
- OpenLDAP: reclassified from "BLOCKED" to **DEPLOYMENT-GATED** (not a development blocker)
- System risk level: 🟢 LOW across all categories
- Decision: **PATH 2 — Feature development track** (migration track formally closed)

**Critical pattern confirmed:** Hybrid model (ORM for CRUD + `em.getConnection()` for analytics) is production-accepted. 91 raw SQL CTEs in UO service are intentional, not technical debt.

---

## KEY LESSONS (Condensed from Phases HI–II)

| Lesson | Phase | Impact |
|--------|-------|--------|
| MikroORM `default: true` on soft-delete filter causes auth login 500 | HT | Never use `default: true` on notDeleted filter |
| Raw SQL must use `?` not `$1` in MikroORM PostgreSQL | IG | All new raw SQL must use `?` placeholders |
| `ANY(?)` array binding requires single `?` with array param | II | Don't expand arrays to `?,?,?` |
| Analytics CTEs with `$N` param counter must use `?` — counter bugs cause wrong param binding | IN | Raw SQL analytics — careful param ordering |
| `em.getConnection().execute()` is valid MikroORM API — not a hack | IQ | Hybrid model is architecturally sound |
| NestJS route order: static routes must precede `:id` param routes | JF | Always add static GET routes BEFORE `:id` in controller |
| Vuetify 3 tabs: `v-if` on template works in Vue but Vuetify binds model to index, not value string | JF | Always use `v-window` + `v-window-item` for tab content |
| Paginated response shape `{data, meta}`: ALL consumers must unwrap `.data` | JE | Never assume plain array from endpoints using `createPaginatedResponse` |
| `{ filters: false }` required on auth user lookups to bypass soft-delete filter | HT/JD | Auth lookups: always `{ filters: false }` |
| `api.del()` not `api.delete()` for DELETE requests | EV | Frontend HTTP delete calls |
| `api.post()` JSON-stringifies ALL args including FormData → `"{}"` with wrong Content-Type. Use `api.upload()` for multipart uploads | JG | Any file upload must use `api.upload()`, never `api.post()` |
