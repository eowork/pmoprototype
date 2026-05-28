## VALIDATION GATE (CURRENT)

### ⚠️ REQUIRED BEFORE PHASE JG PROCEEDS

All items below must be verified by operator before next development phase is authorized.

---

#### Gate 1 — Phase JF Analytics (Backend + Browser)

| Check | Verification | Status |
|-------|-------------|--------|
| JF-V1 | `GET /api/construction-projects/analytics/summary` → 200 with `by_status[]`, `by_campus[]` | ⏸ |
| JF-V2 | `GET /api/construction-projects/analytics/financial-summary` → 200 with `utilization_rate` | ⏸ |
| JF-V3 | Analytics tab renders — no blank tab (v-window fix applied 2026-04-29) | ⏸ |
| JF-V4 | Status donut chart shows counts | ⏸ |
| JF-V5 | Campus bar chart shows per-campus data | ⏸ |
| JF-V6 | Financial hero cards show aggregated values | ⏸ |
| JF-V7 | Switching between Projects ↔ Analytics tab does not break either view | ⏸ |

**Fix applied:** Backend must be restarted for analytics endpoints to be active (methods added during JF implementation).

---

#### Gate 2 — Phase JE Gallery Shape (Browser + Postman)

| Check | Verification | Status |
|-------|-------------|--------|
| JE-V1 | `pages/coi/detail-[id].vue` gallery renders images for project with gallery items | ⏸ |
| JE-V2 | `pages/coi/public/detail-[id].vue` gallery renders images | ⏸ |
| JE-V3 | Postman 20-C and 21-C pass with `body.data` array assertion | ⏸ |

---

#### Gate 3 — Phase JB COI Runtime (Browser)

| Check | Verification | Status |
|-------|-------------|--------|
| JB-V2b | Project with milestones → milestones table renders correctly | ⏸ |
| JB-V2d | Project with financials → financials table renders correctly | ⏸ |
| JB-V4f | `GET /api/public/construction-projects` returns 200 (PUBLISHED only) | ⏸ |
| JB-V6a | `GET /api/construction-projects` authenticated regression — still works | ⏸ |
| JB-V6b | Admin detail page Edit/Publish/Reject actions work | ⏸ |
| JB-V6c | Gallery upload from authenticated detail page works | ⏸ |

---

#### Gate 4 — Phase JD LDAP (Deployment-Gated)

| Check | Verification | Status |
|-------|-------------|--------|
| JD-V5 | `POST /api/auth/login` runtime LDAP check | ⏸ DEPLOYMENT-GATED |

---

## DECISION TREE — NEXT PHASE

```
ALL Gate 1/2/3 checks PASS?
├── YES → Proceed to Phase JG (COI Figma-Guided Refinement)
└── NO  → Diagnose failing check(s) → fix → re-verify → re-run gate

Gate 4 (LDAP)?
└── DEPLOYMENT-GATED → activates at first deployment (~1–2 days when LDAP server provisioned)
    └── Does NOT block COI development
```

---

## COI PHASE 1 — COMPLETED SUMMARY (Phases JA–JF)

### What Was Built

| Phase | Scope | Status |
|-------|-------|--------|
| JA | Pre-infra stabilization, `pmo-test1` backup, Figma MCP evaluation | ✅ |
| JB | Adapter fixes (milestones/financials/gallery), detail page fix, KPI panel, filter bar, public controller + pages | ✅ |
| JC | Claude Code + VS Code Figma MCP configuration (official server, OAuth) | ✅ |
| JD | `ldap.strategy.ts` ORM migration (last DatabaseService usage removed from active modules) | ✅ |
| JE | Gallery paginated response shape fix — consumers now unwrap `res.data` | ✅ |
| JF | COI Analytics Dashboard — backend analytics endpoints + Analytics tab with charts | ✅ |

### Entity Model (No Changes Needed for Phase 1)

| Entity | Table | Key Fields |
|--------|-------|-----------|
| `ConstructionProject` | `construction_projects` | `id, title, campus, status, contractAmount, physicalProgress, publicationStatus, ...` |
| `ConstructionMilestone` | `construction_milestones` | `id, projectId, title, targetDate, actualDate, status, remarks` |
| `ConstructionProjectFinancial` | `construction_project_financials` | `id, projectId, fiscalYear, appropriation, obligation, disbursement` |
| `ConstructionGallery` | `construction_gallery` | `id, projectId, imageUrl, caption, category, isFeatured` |

### Module Structure (Stable)

```
pmo-backend/src/construction-projects/
├── construction-projects.controller.ts   (CRUD + workflow + analytics routes)
├── construction-projects.service.ts      (business logic + raw SQL analytics)
├── construction-projects.module.ts       (registers both controllers)
├── public-construction.controller.ts     (public read-only, no guards)
└── dto/                                   (CreateDto, UpdateDto, QueryDto, etc.)

pmo-frontend/pages/coi/
├── index.vue                              (admin list + KPI + filters + analytics tab)
├── new.vue                                (create form)
├── edit-[id].vue                          (edit form)
├── detail-[id].vue                        (detail + milestones + financials + gallery)
└── public/
    ├── index.vue                          (public listing, no auth)
    └── detail-[id].vue                    (public detail, no auth)
```

---

## PHASE JG — COI FIGMA-GUIDED REFINEMENT

> **Status:** ⬜ PENDING OPERATOR AUTHORIZATION
> **Prerequisite:** Validation Gate (Gates 1/2/3) PASSED
> **Research Reference:** `research.md` Section 2.120 (Gate 2 diagnostic + Figma analysis)
> **Priority:** 🔴 CRITICAL — Gate 2 has 3 confirmed bugs blocking gallery upload and form completeness

---

### Objective

Fix 3 confirmed Gate 2 bugs (gallery upload, geotag fields, missing date field) and add `ideal_infrastructure_image` URL field to Create/Edit forms — all frontend-only, no backend or schema changes required.

---

### Governance Directives (Phase JG)

| # | Directive |
|---|-----------|
| JG-D1 | Figma MCP output is REFERENCE only. Code adapted to Vuetify 3 + project conventions. |
| JG-D2 | No backend changes, no database migrations in Phase JG. All 5 steps are frontend-only. |
| JG-D3 | Changes affect only: `coi/detail-[id].vue`, `coi/new.vue`, `coi/edit-[id].vue`. No other files. |
| JG-D4 | CSU branding preserved: emerald primary, `bg-primary text-white` table headers, `text-h4 font-weight-bold` titles. |
| JG-D5 | `actual_completion_date` fix in `new.vue` must match `edit-[id].vue` implementation exactly — same field label, same type="date", same payload key. |
| JG-D6 | Gallery upload fix: change ONLY the single `api.post()` call at line ~243. Do not touch surrounding error handling or form logic. |
| JG-D7 | Geotag fields (`latitude`, `longitude`) are optional number inputs — NOT required, NOT validated as coordinates. Type `number`, step `any`. |

---

### Phase JG Implementation Steps

#### Step JG-1 — Fix Gallery Upload (`detail-[id].vue`)

**File:** `pmo-frontend/pages/coi/detail-[id].vue`

Find the `uploadGalleryItem()` function. Change one line:

```diff
- await api.post(`/api/construction-projects/${projectId}/gallery`, formData)
+ await api.upload(`/api/construction-projects/${projectId}/gallery`, formData)
```

No other changes. `api.upload()` already exists in `useApi.ts` — sends raw FormData with correct multipart Content-Type.

**Verification:** JG-V1

---

#### Step JG-2 — Add Geotag Fields to Create Form (`new.vue`)

**File:** `pmo-frontend/pages/coi/new.vue`

**2a. Form state** — add alongside `floor_area` / `number_of_floors`:
```typescript
latitude: null as number | null,
longitude: null as number | null,
```

**2b. Payload** — add inside `handleSubmit`:
```typescript
latitude: form.value.latitude || undefined,
longitude: form.value.longitude || undefined,
```

**2c. Template** — add to Building Details card (after `number_of_floors` field):
```html
<v-text-field
  v-model.number="form.latitude"
  label="Latitude"
  type="number"
  step="any"
  placeholder="e.g., 9.0820"
  variant="outlined"
  density="comfortable"
  class="mb-3"
/>
<v-text-field
  v-model.number="form.longitude"
  label="Longitude"
  type="number"
  step="any"
  placeholder="e.g., 125.5735"
  variant="outlined"
  density="comfortable"
/>
```

**Verification:** JG-V2

---

#### Step JG-3 — Add Geotag Fields to Edit Form (`edit-[id].vue`)

**File:** `pmo-frontend/pages/coi/edit-[id].vue`

Same pattern as JG-2. Ensure form state pre-populates from fetched project: `latitude: project.latitude ?? null, longitude: project.longitude ?? null`.

**Verification:** JG-V3

---

#### Step JG-4 — Add `actual_completion_date` to Create Form (`new.vue`)

**File:** `pmo-frontend/pages/coi/new.vue`

**4a. Form state** — add alongside `target_completion_date`:
```typescript
actual_completion_date: '',
```

**4b. Payload** — add inside `handleSubmit`:
```typescript
actual_completion_date: form.value.actual_completion_date || undefined,
```

**4c. Template** — add to Schedule card after `target_completion_date` field:
```html
<v-col cols="12" sm="6">
  <v-text-field
    v-model="form.actual_completion_date"
    label="Actual Completion Date"
    type="date"
    hint="Date project was actually completed"
    persistent-hint
    variant="outlined"
    density="comfortable"
  />
</v-col>
```

**Verification:** JG-V4

---

#### Step JG-5 — Add `ideal_infrastructure_image` to Create + Edit Forms

**Files:** `pmo-frontend/pages/coi/new.vue` AND `pmo-frontend/pages/coi/edit-[id].vue`

**5a. Form state** (both files) — add alongside `description`:
```typescript
ideal_infrastructure_image: '',
```

**5b. Payload** (both files) — add inside submit handler:
```typescript
ideal_infrastructure_image: form.value.ideal_infrastructure_image || undefined,
```

**5c. Template** (both files) — add to Basic Information card after Description textarea:
```html
<v-col cols="12">
  <v-text-field
    v-model="form.ideal_infrastructure_image"
    label="Ideal/Proposed Infrastructure Image URL"
    placeholder="https://example.com/image.jpg"
    hint="Link to rendering or proposed design image"
    persistent-hint
    variant="outlined"
    density="comfortable"
  />
</v-col>
```

**5d. `edit-[id].vue` pre-populate** — add to data fetch mapping:
```typescript
ideal_infrastructure_image: project.ideal_infrastructure_image || '',
```

**Verification:** JG-V5

---

### Verification Checklist (Phase JG)

| ID | Check | Status |
|----|-------|--------|
| JG-V1 | Gallery upload from `detail-[id].vue` succeeds — image appears in gallery grid after upload, no 400/500 error | ⬜ |
| JG-V2 | `new.vue` shows Latitude + Longitude fields; submitting saves values (verify in detail page or DB) | ⬜ |
| JG-V3 | `edit-[id].vue` shows Latitude + Longitude fields pre-populated from existing project data | ⬜ |
| JG-V4 | `new.vue` shows Actual Completion Date field; matches pattern of `edit-[id].vue` | ⬜ |
| JG-V5 | Both `new.vue` and `edit-[id].vue` show Ideal/Proposed Infrastructure Image URL field | ⬜ |
| JG-V6 | No TypeScript errors introduced (`vue-tsc --noEmit`) | ⬜ |
| JG-V7 | No regression: existing form fields and submit still work | ⬜ |

---

## PHASE JH — COI SCHEMA EXPANSION (JH-A: QUICK WINS)

> **Status:** ⬜ PENDING OPERATOR AUTHORIZATION
> **Prerequisite:** Phase JG runtime verified (Gate 2 closed)
> **Research Reference:** `research.md` Section 2.121
> **Priority:** 🟡 MEDIUM — closes Figma alignment gap; non-blocking

---

### Objective

Expose existing entity columns missing from DTOs/forms (`original_contract_duration`, `financial_progress`, `objectives`, `key_features`, `metadata`) AND add 2 new target-progress columns (`target_physical_progress`, `target_financial_progress`) to enable variance tracking. No new tables in JH-A.

---

### Governance Directives (Phase JH)

| # | Directive |
|---|-----------|
| JH-D1 | JH-A scope ONLY. JH-B (accomplishment records) and JH-C (project phases) are explicitly deferred. |
| JH-D2 | Migration `043` adds 2 nullable columns with `DEFAULT 100`. Additive only — no destructive ALTERs. |
| JH-D3 | All new DTO fields are `@IsOptional()` — backward compatible with existing API consumers. |
| JH-D4 | Service raw SQL must add new columns to BOTH `INSERT` column list AND `VALUES` parameter list — and increment `?` count consistently. |
| JH-D5 | Frontend `BackendProjectDetail` interface extension is additive. |
| JH-D6 | `objectives` and `key_features` use newline-separated `<v-textarea>` input → `.split('\n').filter(Boolean)` on submit → `string[]`. |
| JH-D7 | Variance display in `detail-[id].vue`: `target_physical_progress - physical_progress`. Color: green if ≤ 0 (on/ahead), amber if > 0 (behind). |
| JH-D8 | Operator must run migration `043` BEFORE restarting backend. Backend won't fail without it (columns nullable, INSERT will fail with column-not-exist) — flag this clearly. |

---

### Phase JH Implementation Steps

#### Step JH-1 — Migration `043_add_target_progress_to_construction_projects.sql`

**File:** `database/migrations/043_add_target_progress_to_construction_projects.sql`

```sql
-- Phase JH-A: Add target progress columns to support variance tracking
ALTER TABLE construction_projects
  ADD COLUMN IF NOT EXISTS target_physical_progress DECIMAL(5,2) DEFAULT 100,
  ADD COLUMN IF NOT EXISTS target_financial_progress DECIMAL(5,2) DEFAULT 100;
```

**Verification:** JH-V1

---

#### Step JH-2 — Update `ConstructionProject` entity

**File:** `pmo-backend/src/database/entities/construction-project.entity.ts`

Add after `financialProgress`:
```typescript
@Property({ columnType: 'decimal(5,2)', default: 100 })
targetPhysicalProgress: string = '100.00';

@Property({ columnType: 'decimal(5,2)', default: 100 })
targetFinancialProgress: string = '100.00';
```

**Verification:** JH-V2

---

#### Step JH-3 — Update Create + Update DTOs

**Files:**
- `pmo-backend/src/construction-projects/dto/create-construction-project.dto.ts`
- `pmo-backend/src/construction-projects/dto/update-construction-project.dto.ts`

Add to `CreateConstructionProjectDto` (and confirm in Update DTO via `PartialType`):
```typescript
@IsOptional()
@IsNumber()
target_physical_progress?: number;

@IsOptional()
@IsNumber()
target_financial_progress?: number;

@IsOptional()
@IsNumber()
financial_progress?: number;

@IsOptional()
@IsNumber()
physical_progress?: number;  // confirm not already present
```

Verify `objectives?: string[]`, `key_features?: string[]`, `metadata?` are present (they are per current DTO).

**Verification:** JH-V3

---

#### Step JH-4 — Update service `create()` and `update()` raw SQL

**File:** `pmo-backend/src/construction-projects/construction-projects.service.ts`

In the `create()` INSERT statement, add to column list and VALUES (matching position):
- `target_physical_progress`, `target_financial_progress`, `financial_progress`, `physical_progress` (if not already there)

Add to `update()` SET clause similarly.

**CRITICAL:** When adding columns, add to BOTH the column list AND the params array, in matching order. Increment the `?` count consistently.

**Verification:** JH-V4

---

#### Step JH-5 — Update `BackendProjectDetail` frontend interface

**File:** `pmo-frontend/utils/adapters.ts`

Add to `BackendProjectDetail`:
```typescript
target_physical_progress?: number
target_financial_progress?: number
financial_progress?: number
physical_progress?: number
original_contract_duration?: string
objectives?: string[]
key_features?: string[]
```

(Some may already exist — check before adding to avoid duplicates.)

**Verification:** JH-V5

---

#### Step JH-6 — Update `new.vue` form

**File:** `pmo-frontend/pages/coi/new.vue`

Add to form state:
```typescript
original_contract_duration: '',
target_physical_progress: 100 as number,
target_financial_progress: 100 as number,
financial_progress: null as number | null,
objectives: '',  // textarea — split on submit
key_features: '',
```

Add to payload:
```typescript
original_contract_duration: form.value.original_contract_duration || undefined,
target_physical_progress: form.value.target_physical_progress ?? undefined,
target_financial_progress: form.value.target_financial_progress ?? undefined,
financial_progress: form.value.financial_progress ?? undefined,
objectives: form.value.objectives ? form.value.objectives.split('\n').map(s => s.trim()).filter(Boolean) : undefined,
key_features: form.value.key_features ? form.value.key_features.split('\n').map(s => s.trim()).filter(Boolean) : undefined,
```

Add template fields:
- `original_contract_duration` text field (alongside `project_duration` in Schedule card)
- `target_physical_progress` + `target_financial_progress` number fields with `suffix="%"` (new "Progress Targets" card or in existing Status section)
- `objectives` textarea (Basic Info card, after description)
- `key_features` textarea (Basic Info card)

**Verification:** JH-V6

---

#### Step JH-7 — Update `edit-[id].vue` form

**File:** `pmo-frontend/pages/coi/edit-[id].vue`

Same fields as JH-6 PLUS pre-populate from fetched project:
```typescript
original_contract_duration: p.original_contract_duration || '',
target_physical_progress: p.target_physical_progress ?? 100,
target_financial_progress: p.target_financial_progress ?? 100,
financial_progress: p.financial_progress ?? null,
objectives: Array.isArray(p.objectives) ? p.objectives.join('\n') : '',
key_features: Array.isArray(p.key_features) ? p.key_features.join('\n') : '',
```

Also add `financial_progress` field (edit only — not in `new.vue`).

**Verification:** JH-V7

---

#### Step JH-8 — Update `detail-[id].vue` variance display

**File:** `pmo-frontend/pages/coi/detail-[id].vue`

In the existing physical/financial progress section, add a variance row:
```html
<v-chip
  :color="(target_physical_progress - physical_progress) <= 0 ? 'success' : 'warning'"
  size="small"
>
  {{ (target_physical_progress - physical_progress) <= 0 ? 'On Track' : `${(target_physical_progress - physical_progress).toFixed(1)}% behind` }}
</v-chip>
```

Display `original_contract_duration`, `objectives`, `key_features` in the project info card (existing card — add new rows).

**Verification:** JH-V8

---

### Verification Checklist (Phase JH)

| ID | Check | Status |
|----|-------|--------|
| JH-V1 | Migration `043` runs successfully — `\d construction_projects` shows 2 new columns | ⬜ |
| JH-V2 | Entity TypeScript compiles (`tsc --noEmit` in backend) | ⬜ |
| JH-V3 | DTO accepts new fields; ValidationPipe passes when fields present and absent | ⬜ |
| JH-V4 | Create + Update endpoints return 200 with new field values persisted | ⬜ |
| JH-V5 | Frontend interface has new fields; no TS errors | ⬜ |
| JH-V6 | `new.vue` shows all 6 new fields; submit creates project with all values | ⬜ |
| JH-V7 | `edit-[id].vue` pre-populates 6 new fields; save persists changes | ⬜ |
| JH-V8 | `detail-[id].vue` shows variance chip + objectives/key_features rendered as bullet list | ⬜ |
| JH-V9 | No regression: existing fields and operations unchanged | ⬜ |
| JH-V10 | `vue-tsc --noEmit` and backend `tsc --noEmit` both pass | ⬜ |

---

### Phase JH-B + JH-C (DEFERRED)

| Phase | Scope | Reason for deferral |
|-------|-------|---------------------|
| JH-B | New `construction_accomplishment_records` table + CRUD + frontend list/form | ~3x scope of JH-A; needs JH-A verified first |
| JH-C | New `construction_project_phases` table + CRUD + 4-phase tracker UI | Largest scope; needs JH-B baseline patterns established |

These phases will be re-researched in their own ACE Phase 1 cycles — not pre-planned here.

---

## VERSION CONTROL INSTRUCTIONS

```bash
# Current working branch
git status                         # verify clean or expected changes
git log --oneline -5               # review recent commits

# Before starting Phase JG
git checkout refactor/page-structure-feb9
git pull origin refactor/page-structure-feb9   # sync if needed

# Safety: pmo-test1 is the backup branch
# Restore from backup: git checkout pmo-test1 -- <file>
```

---

## LESSONS LEARNED

1. **Phase DL Failure (Mar 4, 2026):** Forward-scanning for "suspicious code" found the wrong root cause. Reverse-tracing from the exact error found the true cause. **Lesson: Always trace backward from the error.**
2. **Governance Violation (Mar 4, 2026):** Jumped to Phase 3 without authorization. Fix did not resolve the issue. **Lesson: Never skip phases. Research → Plan → Implement is non-negotiable.**
3. **Plan.md Bloat (Mar 4–5, 2026):** 12,500+ lines accumulated from never compacting completed phases. **Lesson: Compact completed phases immediately. Archive, never delete.**
4. **Vuetify Tab Bug (Apr 29, 2026):** `v-if` on template blocks inside `v-tabs` causes silent rendering failure — Vuetify sets model to index not string value. **Lesson: Always use `v-window` + `v-window-item` for tab content.**
5. **Paginated Wrapper (Apr 29, 2026):** `createPaginatedResponse` wraps array in `{data, meta}` — all consumers must unwrap `.data`. **Lesson: Test API shape before building frontend consumer.**

---

## PHASE JI — MIKROORM MIGRATION SYSTEM ADOPTION

> **Status:** ⬜ PENDING OPERATOR AUTHORIZATION
> **Prerequisite:** Independent of JH-A runtime smoke — infrastructure phase, no schema changes
> **Research Reference:** `research.md` Section 2.122
> **Priority:** 🟡 MEDIUM — removes manual `psql` migration regime; required foundation for all future schema expansion phases (JH-B, JH-C, etc.)
> **Scope:** 6 code changes + 3 operator actions. Zero schema changes. Zero entity changes. Zero frontend changes.

---

### Objective

Activate MikroORM's native TypeScript migration system. After JI is complete:
- New schema changes use `npm run migration:create` (TypeScript migration classes)
- `npm run migration:up` is the sole migration execution command — no more `psql -f`
- `database/migrations/` becomes a READ-ONLY historical archive (frozen at migration 043)
- Baseline anchors all 43 prior SQL migrations as the pre-JI DB state

---

### Governance Directives (Phase JI)

| # | Directive |
|---|-----------|
| JI-D1 | No schema changes in Phase JI. Infrastructure setup only — no DDL. |
| JI-D2 | `database/migrations/` is READ-ONLY from JI onward. Never add new `.sql` files. All new schema changes use MikroORM TypeScript migration classes. |
| JI-D3 | The baseline migration (`Migration20260430000000_Baseline.ts`) MUST have empty `up()` and `down()` methods. No DDL allowed inside. |
| JI-D4 | `@mikro-orm/cli` pinned to `^6.6.13` to match installed `@mikro-orm/core` version. |
| JI-D5 | `import 'dotenv/config'` MUST be the FIRST line of `mikro-orm.config.ts` (before all other imports). |
| JI-D6 | `mikro-orm.configPaths` added as a root-level key in `package.json` (peer to `scripts`, `dependencies`). |
| JI-D7 | Operator MUST confirm migration 043 has been applied via `psql` before running `npm run migration:up`. |
| JI-D8 | Fresh environment install: run SQL files 001–043 first, then `npm run migration:up` once. Future deploys: `migration:up` only. |

---

### Phase JI Implementation Steps

#### Step JI-1 — Add `@mikro-orm/cli` to `devDependencies` + `configPaths` to `package.json`

**File:** `pmo-backend/package.json`

**1a.** Add to `devDependencies` section:
```json
"@mikro-orm/cli": "^6.6.13"
```

**1b.** Add as a new root-level key (alongside `name`, `scripts`, `dependencies`):
```json
"mikro-orm": {
  "configPaths": [
    "./src/database/mikro-orm.config.ts",
    "./dist/database/mikro-orm.config.js"
  ]
}
```

**Verification:** JI-V1

---

#### Step JI-2 — Add `dotenv/config` import to `mikro-orm.config.ts`

**File:** `pmo-backend/src/database/mikro-orm.config.ts`

Add as the FIRST line (before all existing imports):
```typescript
import 'dotenv/config';
```

This ensures `.env` is loaded when the CLI invokes the config via `ts-node`. `dotenv` is a transitive dependency of `@nestjs/config` — already in `node_modules`.

**Verification:** JI-V2

---

#### Step JI-3 — Add migration scripts to `package.json`

**File:** `pmo-backend/package.json`

Add to the `scripts` section:
```json
"migration:create": "mikro-orm migration:create",
"migration:up": "mikro-orm migration:up",
"migration:down": "mikro-orm migration:down",
"migration:list": "mikro-orm migration:list",
"migration:check": "mikro-orm migration:check"
```

**Verification:** JI-V3

---

#### Step JI-4 — Create `mikro-migrations/` directory

**File to create:** `pmo-backend/src/database/mikro-migrations/.gitkeep`

Create an empty `.gitkeep` file so git tracks the directory before the first migration is committed.

**Verification:** JI-V4

---

#### Step JI-5 — Create baseline migration

**File:** `pmo-backend/src/database/mikro-migrations/Migration20260430000000_Baseline.ts`

```typescript
import { Migration } from '@mikro-orm/migrations';

/**
 * Phase JI Baseline Migration
 *
 * This migration represents the DB state AFTER all 43 manually-applied SQL
 * migrations (001–043 in `database/migrations/`). The schema was built
 * incrementally via `psql -f` from project start through Phase JH-A.
 *
 * up() and down() are intentionally empty — the DB is already correct.
 * This entry exists solely to anchor MikroORM's migration tracking table.
 *
 * Going forward: ALL schema changes use MikroORM TypeScript migration classes.
 * NEVER add new files to `database/migrations/`.
 */
export class Migration20260430000000_Baseline extends Migration {
  async up(): Promise<void> {
    // No-op. DB schema is already at baseline state (post-migration-043).
  }

  async down(): Promise<void> {
    // No-op. Rollback of the pre-MikroORM baseline is not supported.
  }
}
```

**Verification:** JI-V5

---

### Operator Actions (Post-Implementation)

#### Step JI-6 — Install `@mikro-orm/cli`

```bash
cd pmo-backend
npm install
```

Installs `@mikro-orm/cli` and any updated packages.

**Verification:** JI-V6

---

#### Step JI-7 — Confirm migration 043 applied + run baseline

**Prerequisites before running:**
1. ✅ Confirm `043_add_target_progress_to_construction_projects.sql` has been applied (`\d construction_projects` shows `target_physical_progress` and `target_financial_progress` columns)
2. ✅ `pmo-backend/.env` has correct `DATABASE_*` credentials

```bash
cd pmo-backend
npm run migration:up
```

Expected output:
```
Processing 'Migration20260430000000_Baseline'
[DONE] Migration20260430000000_Baseline
```

This creates the `mikro_orm_migrations` table on first run and inserts the baseline row.

**Verification:** JI-V7

---

#### Step JI-8 — Verify migration list

```bash
npm run migration:list
```

Expected: baseline shows as applied (`[*]`). No pending migrations.

**Verification:** JI-V8

---

### Going-Forward Developer Workflow

```bash
# From pmo-backend/

# Create new migration (auto-generates TypeScript class from entity diff)
npm run migration:create -- --name=AddAccomplishmentRecordsTable

# Review generated file in src/database/mikro-migrations/
# Edit up()/down() methods as needed, then:

npm run migration:up        # apply all pending migrations
npm run migration:down      # rollback last applied migration
npm run migration:list      # show all migrations + applied status
npm run migration:check     # exit 1 if any pending (useful for CI)
```

**NEVER** create `.sql` files in `database/migrations/` for new schema changes. Files 001–043 are frozen historical record.

---

### Verification Checklist (Phase JI)

| ID | Check | Status |
|----|-------|--------|
| JI-V1 | `package.json` has `@mikro-orm/cli@^6.6.13` in `devDependencies` AND `mikro-orm.configPaths` root key | ⬜ |
| JI-V2 | `mikro-orm.config.ts` first line is `import 'dotenv/config'` | ⬜ |
| JI-V3 | `package.json` `scripts` section has all 5 migration commands | ⬜ |
| JI-V4 | `pmo-backend/src/database/mikro-migrations/.gitkeep` exists | ⬜ |
| JI-V5 | `Migration20260430000000_Baseline.ts` exists with empty `up()`/`down()` methods | ⬜ |
| JI-V6 | `npm install` completes without error | ⬜ |
| JI-V7 | `npm run migration:up` runs without error; output shows baseline `[DONE]` | ⬜ |
| JI-V8 | `npm run migration:list` shows baseline as applied; no pending migrations | ⬜ |
| JI-V9 | NestJS application starts normally after changes (`npm run start:dev`) | ⬜ |
| JI-V10 | Backend TypeScript compiles clean (`tsc --noEmit` in `pmo-backend/`) | ⬜ |

---

## PHASE JJ — COI CORE UX RESTRUCTURE + BACKEND ERROR FIX

> **Status:** ⬜ PENDING OPERATOR AUTHORIZATION
> **Prerequisite:** JI code changes complete (JI-V1–V5 met); operator has run npm install + migration:up
> **Research Reference:** `research.md` Section 2.123
> **Priority:** 🔴 CRITICAL — backend duplicate key blocks project creation; tabbed form is a major UX improvement

---

### Objective

Four sequential sub-phases executed in dependency order:
- **JJ-A** — Backend: Fix duplicate key on `projects_project_code_key` (creation blocker)
- **JJ-B** — Frontend: Add row-click navigation to COI index (2-line quick win)
- **JJ-C** — Frontend: Map raw API errors to user-friendly messages in Create and Edit forms
- **JJ-D** — Frontend: Restructure COI create form from 7 scrolling cards → 5 tabs with completion indicator

---

### Governance Directives (Phase JJ)

| # | Directive |
|---|-----------|
| JJ-D1 | JJ-A (backend fix) must be implemented and verified BEFORE JJ-B/C/D. Backend creation failure invalidates all frontend testing. |
| JJ-D2 | No schema changes in Phase JJ. The `projects` table uniqueness fix is service-layer only. |
| JJ-D3 | Tab pattern in JJ-D MUST use `v-tabs + v-window + v-window-item` (NOT raw `v-if`/`v-show` toggling) — per established Phase JF directive. |
| JJ-D4 | Error mapping in JJ-C wraps the EXISTING `toast.error()` call — does not replace the error boundary, does not suppress console.error. |
| JJ-D5 | Financial fields (appropriation, obligation, disbursement, budget) from Figma are OUT OF SCOPE for JJ — they belong to JH-B financial records entity. |
| JJ-D6 | Accomplishment fields (accomplishmentAsOf, comments, remarks) from Figma are OUT OF SCOPE for JJ — they belong to JH-B accomplishment records entity. |
| JJ-D7 | Row-click in JJ-B must not conflict with meatball menu clicks — use `@click:row` on the data table, not `@click` on each `<tr>`. |
| JJ-D8 | The 5 tabs in JJ-D must cover ALL existing form fields — no field may be dropped during restructure. |

---

### Sub-Phase JJ-A: Backend Fix — Duplicate Key Prevention

> **Scope:** `construction-projects.service.ts` only. No DTO changes, no entity changes, no migration.

#### Step JJ-A-1 — Add `projects` table uniqueness check before INSERT

**File:** `pmo-backend/src/construction-projects/construction-projects.service.ts`

**Location:** Inside `create()` method, immediately after the existing `cpRepo.findOne` check (line ~356), before the `transactional` block.

**Add:**
```typescript
// Check projects table (shared across modules) for code collision
const projectsCheck = await this.em.getConnection().execute(
  `SELECT id FROM projects WHERE project_code = ? AND deleted_at IS NULL`,
  [dto.project_code],
);
if (projectsCheck.length > 0) {
  throw new ConflictException(
    `Project code ${dto.project_code} already exists`,
  );
}
```

This catches cross-module collisions (UO module records) before the transaction begins.

**Verification:** JJ-V1

---

#### Step JJ-A-2 — Wrap transactional block in try/catch for race condition handling

**File:** `pmo-backend/src/construction-projects/construction-projects.service.ts`

Wrap the `return await this.em.transactional(...)` call:

```typescript
try {
  return await this.em.transactional(async (em) => {
    // ... existing transactional code unchanged ...
  });
} catch (err: any) {
  if (err?.code === '23505' && err?.constraint === 'projects_project_code_key') {
    throw new ConflictException(
      `Project code ${dto.project_code} is already in use`,
    );
  }
  throw err;
}
```

This catches race conditions (two simultaneous requests that both pass the pre-insert check).

**Verification:** JJ-V2

---

### Sub-Phase JJ-B: Frontend — Row-Click Navigation on COI Index

> **Scope:** `pmo-frontend/pages/coi/index.vue` only. Template change only.

#### Step JJ-B-1 — Add `@click:row` to v-data-table

**File:** `pmo-frontend/pages/coi/index.vue`

Find the `<v-data-table>` element. Add two attributes:

```diff
  <v-data-table
    :headers="headers"
    :items="filteredProjects"
    ...
+   @click:row="(_event: Event, row: { item: UIProject }) => viewProject(row.item)"
+   :row-props="() => ({ style: { cursor: 'pointer' } })"
  >
```

`viewProject()` already exists and calls `router.push('/coi/detail-${project.id}')`. No new logic needed.

**Verification:** JJ-V3

---

### Sub-Phase JJ-C: Frontend — User-Friendly Validation Error Messages

> **Scope:** `pmo-frontend/pages/coi/new.vue` and `pmo-frontend/pages/coi/edit-[id].vue`

#### Step JJ-C-1 — Add error mapping utility function

**File:** `pmo-frontend/pages/coi/new.vue`

Add above `handleSubmit()`:

```typescript
function mapApiError(err: unknown): string {
  const msg: string = (err as { message?: string })?.message ?? ''
  if (/duplicate key|already exists|project_code/i.test(msg)) {
    return 'This project code is already in use. Please choose a different code.'
  }
  if (/validation failed|bad request/i.test(msg)) {
    return 'Some fields have invalid values. Please check the form and try again.'
  }
  if (/unauthorized|forbidden/i.test(msg)) {
    return 'You do not have permission to perform this action.'
  }
  if (/network|failed to fetch|econnrefused/i.test(msg)) {
    return 'Cannot reach the server. Please check your connection and try again.'
  }
  return 'Something went wrong. Please try again or contact support.'
}
```

Replace in `handleSubmit()` catch block:
```diff
- toast.error(apiError.message || 'Failed to create project')
+ toast.error(mapApiError(err))
```

**Verification:** JJ-V4

---

#### Step JJ-C-2 — Apply same mapping to `edit-[id].vue`

**File:** `pmo-frontend/pages/coi/edit-[id].vue`

Apply the same `mapApiError()` function and replace the equivalent `toast.error()` call in the edit submit handler.

**Verification:** JJ-V5

---

### Sub-Phase JJ-D: Frontend — Create Form Tab Restructure

> **Scope:** `pmo-frontend/pages/coi/new.vue` only. No backend changes, no DTO changes. All existing fields preserved — only grouping and layout changes.

#### Tab Structure

| Tab | Value | Fields |
|-----|-------|--------|
| 1. Basic Info | `basic` | project_code, title, campus, status, description, beneficiaries |
| 2. Contract | `contract` | funding_source_id, contractor_id, contract_number, contract_amount, ideal_infrastructure_image, objectives, key_features |
| 3. Schedule | `schedule` | start_date, target_completion_date, actual_completion_date, project_duration, original_contract_duration |
| 4. Progress & Details | `progress` | target_physical_progress, target_financial_progress, building_type, floor_area, number_of_floors, latitude, longitude |
| 5. Personnel & Assignment | `personnel` | project_engineer, project_manager, assigned_user_ids |

#### Step JJ-D-1 — Add tab state and completion tracking refs

**File:** `pmo-frontend/pages/coi/new.vue`

Add in `<script setup>`:
```typescript
const activeTab = ref('basic')

const tabCompletion = computed(() => ({
  basic: !!(form.value.project_code && form.value.title && form.value.campus && form.value.status),
  contract: !!(form.value.funding_source_id),
  schedule: true,  // all optional
  progress: true,  // all optional with defaults
  personnel: true, // all optional
}))
```

**Verification:** JJ-V6

---

#### Step JJ-D-2 — Replace card layout with tabbed layout

**File:** `pmo-frontend/pages/coi/new.vue`

Replace the `<v-form>` template body (all 7 `<v-card>` sections) with:

```html
<v-form @submit.prevent="handleSubmit">
  <!-- Tab headers -->
  <v-tabs v-model="activeTab" color="primary" class="mb-4">
    <v-tab value="basic">
      <v-icon start>mdi-information-outline</v-icon>
      Basic Info
      <v-icon v-if="tabCompletion.basic" end color="success" size="small">mdi-check-circle</v-icon>
    </v-tab>
    <v-tab value="contract">
      <v-icon start>mdi-file-document-outline</v-icon>
      Contract
      <v-icon v-if="tabCompletion.contract" end color="success" size="small">mdi-check-circle</v-icon>
    </v-tab>
    <v-tab value="schedule">
      <v-icon start>mdi-calendar-range</v-icon>
      Schedule
    </v-tab>
    <v-tab value="progress">
      <v-icon start>mdi-trending-up</v-icon>
      Progress
    </v-tab>
    <v-tab value="personnel">
      <v-icon start>mdi-account-group</v-icon>
      Personnel
    </v-tab>
  </v-tabs>

  <!-- Tab content -->
  <v-window v-model="activeTab">
    <!-- Tab 1: Basic Info -->
    <v-window-item value="basic">
      <v-card class="mb-4">
        <v-card-title>Basic Information</v-card-title>
        <v-divider />
        <v-card-text>
          <!-- project_code, campus, title, description, status, beneficiaries fields here -->
        </v-card-text>
      </v-card>
    </v-window-item>

    <!-- Tab 2: Contract -->
    <v-window-item value="contract">
      <v-card class="mb-4">
        <v-card-title>Contract Details</v-card-title>
        <v-divider />
        <v-card-text>
          <!-- funding_source_id, contractor_id, contract_number, contract_amount, ideal_infrastructure_image, objectives, key_features -->
        </v-card-text>
      </v-card>
    </v-window-item>

    <!-- Tab 3: Schedule -->
    <v-window-item value="schedule">
      <v-card class="mb-4">
        <v-card-title>Schedule</v-card-title>
        <v-divider />
        <v-card-text>
          <!-- start_date, target_completion_date, actual_completion_date, project_duration, original_contract_duration -->
        </v-card-text>
      </v-card>
    </v-window-item>

    <!-- Tab 4: Progress & Details -->
    <v-window-item value="progress">
      <v-card class="mb-4">
        <v-card-title>Progress & Physical Details</v-card-title>
        <v-divider />
        <v-card-text>
          <!-- target_physical_progress, target_financial_progress, building_type, floor_area, number_of_floors, latitude, longitude -->
        </v-card-text>
      </v-card>
    </v-window-item>

    <!-- Tab 5: Personnel & Assignment -->
    <v-window-item value="personnel">
      <v-card class="mb-4">
        <v-card-title>Personnel & Assignment</v-card-title>
        <v-divider />
        <v-card-text>
          <!-- project_engineer, project_manager, assigned_user_ids -->
        </v-card-text>
      </v-card>

      <!-- Submit here on final tab -->
      <div class="d-flex ga-3 justify-end mt-4">
        <v-btn variant="outlined" @click="goBack">Cancel</v-btn>
        <v-btn type="submit" color="primary" :loading="submitting">Create Project</v-btn>
      </div>
    </v-window-item>
  </v-window>

  <!-- Tab navigation buttons (prev/next) -->
  <div class="d-flex justify-space-between mt-2" v-if="activeTab !== 'personnel'">
    <v-btn v-if="activeTab !== 'basic'" variant="text" @click="prevTab">
      <v-icon start>mdi-arrow-left</v-icon> Previous
    </v-btn>
    <v-spacer />
    <v-btn color="primary" variant="tonal" @click="nextTab">
      Next <v-icon end>mdi-arrow-right</v-icon>
    </v-btn>
  </div>
</v-form>
```

**Note:** During implementation, move each field into its appropriate tab window-item. The field markup is unchanged — only their containing structure changes.

**Verification:** JJ-V7

---

#### Step JJ-D-3 — Add tab navigation helper functions

**File:** `pmo-frontend/pages/coi/new.vue`

```typescript
const tabOrder = ['basic', 'contract', 'schedule', 'progress', 'personnel']

function nextTab() {
  const idx = tabOrder.indexOf(activeTab.value)
  if (idx < tabOrder.length - 1) activeTab.value = tabOrder[idx + 1]
}

function prevTab() {
  const idx = tabOrder.indexOf(activeTab.value)
  if (idx > 0) activeTab.value = tabOrder[idx - 1]
}
```

**Verification:** JJ-V8

---

### Verification Checklist (Phase JJ)

| ID | Check | Status |
|----|-------|--------|
| JJ-V1 | `POST /api/construction-projects` with a `project_code` that already exists in `projects` table → 409 ConflictException (not 500) | ⬜ |
| JJ-V2 | Race condition: two simultaneous create requests with same code → one 201, one 409 (not 500) | ⬜ |
| JJ-V3 | COI index page: clicking any data row navigates to `/coi/detail-${id}` | ⬜ |
| JJ-V4 | Create form: submitting with duplicate project_code shows human-readable toast (not raw DB message) | ⬜ |
| JJ-V5 | Edit form: save error shows human-readable toast | ⬜ |
| JJ-V6 | Create form tabs render; Basic Info tab shows green check icon when project_code + title + campus + status filled | ⬜ |
| JJ-V7 | All 5 tabs display correct fields; no field is missing from the restructured form | ⬜ |
| JJ-V8 | Next/Previous buttons advance and retreat through tabs; Submit only on tab 5 | ⬜ |
| JJ-V9 | Backend starts clean after service.ts changes; TypeScript compiles without error | ⬜ |
| JJ-V10 | Successful project creation still works end-to-end (not broken by new try/catch) | ⬜ |

---

## PHASE JK — COI STABILIZATION GATE (POST-JJ DEFECT RESOLUTION)

> **Status:** ⬜ PENDING OPERATOR AUTHORIZATION
> **Prerequisite:** JJ code changes shipped to source (✅ confirmed in Section 2.124-A "source state" table); operator restart pending
> **Research Reference:** `research.md` Section 2.124
> **Priority:** 🔴 CRITICAL — Two confirmed post-JJ defects: (1) duplicate-insert 500 still occurring (runtime stale, not source bug); (2) "Average Progress" stat card displays NaN
> **Scope:** Operator runtime restart + verification (JK-A) → frontend NaN fix (JK-B) → optional defense-in-depth (JK-C)

---

### Objective

Close the post-JJ defect gap WITHOUT introducing new features:
- **JK-A** — Operator-only: stop stale runtime, restart backend, prove JJ-A code is loaded by reading the SQL log
- **JK-B** — Frontend: coerce DECIMAL strings to numbers in list adapter; add display/computation guards against future NaN
- **JK-C** — Optional: convert two-step check+insert to single `INSERT...ON CONFLICT` for atomic race safety (deferrable)

**Goal NOT changed:** COI module continuity. JK closes a runtime/cosmetic defect window before further feature expansion (which remains JJ-D ergonomics polish, JH-B accomplishment records, JH-C project phases).

---

### Governance Directives (Phase JK)

| # | Directive |
|---|-----------|
| JK-D1 | NO source changes to `service.ts` in JK-A. The defect is runtime-stale, not source-bug. Verify code first; only re-edit if A4 reveals a divergence. |
| JK-D2 | NO `pg` driver type-parser changes (e.g., `types.setTypeParser(1700, parseFloat)`). High blast-radius — silently rewrites all DECIMAL handling across UO, Financial, Physical modules. Coercion stays at the adapter boundary. |
| JK-D3 | JK-B fix touches `pmo-frontend/utils/adapters.ts` (lines 125, 600) and `pmo-frontend/pages/coi/index.vue` (lines 281, 434) ONLY. No other files. |
| JK-D4 | JK-C is OPTIONAL and gated on JK-A revealing a race condition. Do NOT implement JK-C unless JK-A passes A1–A3 but JK-V2 (race condition test) still fails. |
| JK-D5 | NO regression to existing modules. The `Number()` coercion is purely additive — converts string to number; numbers pass through unchanged. |
| JK-D6 | The two-table architecture (`projects` + `construction_projects`) is INTENTIONAL and CORRECT. No schema refactor in JK. |

---

### Sub-Phase JK-A: Runtime Stabilization (Operator Action)

> **Scope:** Zero code. Operator-only. Verifies JJ-A code is actually executing.

#### Step JK-A-1 — Stop all stale `pmo-backend` Node processes

**Operator runs (PowerShell):**
```powershell
# Find any node process listening on 3000 (or backend port)
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }

# Verify nothing remains on the port
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
```

Expected: Second command returns nothing.

**Verification:** JK-V0

---

#### Step JK-A-2 — Clean dist/ and restart in dev mode

**Operator runs:**
```powershell
cd D:\Programming\pmo-dash\pmo-backend
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
npm run start:dev
```

**Wait for:** `[Nest] ... LOG [NestApplication] Nest application successfully started`

**Verification:** JK-V0

---

#### Step JK-A-3 — Trigger a duplicate-code create and inspect log

**Operator action:** From the COI Create form, submit any project using a `project_code` known to exist in the `projects` table (e.g., `CP-2026-051` from the failure log).

**Expected backend log sequence:**
```
[query] select "c0".* from "construction_projects" as "c0" where "c0"."project_code" = 'CP-2026-051' limit 1
[query] select id from projects where project_code = 'CP-2026-051' and deleted_at is null
[Nest] ERROR [HTTP] POST /api/construction-projects - 409 - <ms> [User: ...]
```

Two SELECT lines, NO `begin` / `INSERT INTO projects` / `rollback`. HTTP status 409 (not 500).

**Verification:** JK-V1

---

#### Step JK-A-4 — Source-level audit (only if JK-A-3 still shows missing second SELECT)

If A-3 still shows the same single-SELECT log: the running code does not match source. Re-read `pmo-backend/src/construction-projects/construction-projects.service.ts` lines 343–493 and confirm:
- Lines 358–366: `projectsCheck` query exists
- Line 373: `try {` opens before `return await this.em.transactional(...)`
- Lines 482–492: `} catch (err: any)` closes with `23505` constraint handler

If any of these are missing → a merge or revert occurred → re-apply the JJ-A patch verbatim (see plan Phase JJ-A-1, JJ-A-2 steps).

**Verification:** JK-V1 (re-test after re-apply)

---

### Sub-Phase JK-B: Frontend NaN Fix

> **Scope:** `pmo-frontend/utils/adapters.ts` + `pmo-frontend/pages/coi/index.vue`. Two-line + two-line + two-line + one-line edits.

#### Step JK-B-1 — Coerce DECIMAL string in list adapter (line 125)

**File:** `pmo-frontend/utils/adapters.ts`

```diff
-    physicalAccomplishment: backend.physical_progress || 0,
+    physicalAccomplishment: Number(backend.physical_progress) || 0,
```

`Number(null) → 0`, `Number(undefined) → NaN`, `Number("0.00") → 0`, `Number(45.5) → 45.5`. The `|| 0` rescue still catches `NaN` (NaN is falsy).

**Verification:** JK-V2

---

#### Step JK-B-2 — Coerce DECIMAL string in alternate list adapter (line 600)

**File:** `pmo-frontend/utils/adapters.ts`

```diff
-    physicalProgress: backend.physical_progress || 0,
+    physicalProgress: Number(backend.physical_progress) || 0,
```

Same rationale; this variant is used by the public COI list view. Audit first that line 600 is the right line by grepping `physicalProgress: backend.physical_progress \|\| 0`.

**Verification:** JK-V3

---

#### Step JK-B-3 — Defensive guard in stat reduce

**File:** `pmo-frontend/pages/coi/index.vue` (line 281)

```diff
   stats.value.avgProgress = projectList.length > 0
-    ? projectList.reduce((sum, p) => sum + (p.physicalAccomplishment || 0), 0) / projectList.length
+    ? projectList.reduce((sum, p) => sum + (Number(p.physicalAccomplishment) || 0), 0) / projectList.length
     : 0
```

Belt-and-suspenders: even if a future adapter regression reintroduces a string, the reduce stays numeric.

**Verification:** JK-V2

---

#### Step JK-B-4 — Display safety guard

**File:** `pmo-frontend/pages/coi/index.vue` (line 434)

```diff
-          <p class="text-h4 font-weight-bold">{{ stats.avgProgress.toFixed(1) }}%</p>
+          <p class="text-h4 font-weight-bold">{{ Number.isFinite(stats.avgProgress) ? stats.avgProgress.toFixed(1) : '0.0' }}%</p>
```

Final-line safety; never render `NaN%` to the user under any circumstance.

**Verification:** JK-V2

---

### Sub-Phase JK-C: Defense-in-Depth (CONDITIONAL — DO NOT IMPLEMENT UNLESS A1–A3 PROVE INSUFFICIENT)

> **Scope:** ONLY execute if JK-V1 passes (single create blocked) but JK-V4 (race condition test) fails. Otherwise skip — JJ-A's pre-insert check + try/catch is sufficient.

#### Step JK-C-1 (conditional) — Convert to atomic INSERT...ON CONFLICT

**File:** `pmo-backend/src/construction-projects/construction-projects.service.ts`

Replace the two-stage check + INSERT for the `projects` row inside the transactional block with:

```typescript
const insertedProjects = await conn.execute(
  `INSERT INTO projects (id, project_code, title, description, project_type, start_date, end_date, status, budget, campus, created_by)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
   ON CONFLICT (project_code) DO NOTHING
   RETURNING id`,
  [projectId, dto.project_code, dto.title, dto.description || null, 'CONSTRUCTION',
   dto.start_date || null, dto.target_completion_date || null, dto.status,
   dto.contract_amount || null, dto.campus, userId],
);
if (insertedProjects.length === 0) {
  throw new ConflictException(`Project code ${dto.project_code} is already in use`);
}
```

Eliminates the race window entirely (single round-trip, atomic at the DB level).

**Verification:** JK-V4

---

### Verification Checklist (Phase JK)

| ID | Check | Status |
|----|-------|--------|
| JK-V0 | After A1–A2: no stale Node process; backend boots cleanly with `Nest application successfully started` | ⬜ |
| JK-V1 | After A3: duplicate-code create produces TWO SELECTs (construction_projects + projects), NO INSERT, NO rollback, HTTP 409 with toast "This project code is already in use" | ⬜ |
| JK-V2 | After B-1 + B-3 + B-4: COI index "Average Progress" card displays a real number with `%` (e.g., `0.0%` or `45.5%`), NEVER `NaN%`, even when project list is empty or all progress values are null | ⬜ |
| JK-V3 | After B-2: COI public list view (`/coi/public/`) progress display is numeric, no NaN | ⬜ |
| JK-V4 | (Optional) Race condition: two concurrent create requests with same code → one 201, one 409. If JJ-A is sufficient, this passes; if it fails, authorize JK-C-1 | ⬜ |
| JK-V5 | Successful create with NEW unique code still works end-to-end (regression check) | ⬜ |
| JK-V6 | TypeScript compiles clean after JK-B edits (`npm run build` in `pmo-frontend/` AND `pmo-backend/`) | ⬜ |
| JK-V7 | No regression in UO / Financial / Physical modules (spot-check: open each module's index page, no console errors, data renders) | ⬜ |

---

## PHASE JL — DEFINITIVE DUPLICATE-KEY FIX + NaN FIX + HARD RESTART

> **Status:** ⬜ PENDING OPERATOR AUTHORIZATION
> **Supersedes:** JK-A (runtime stabilization) and JJ-A (pre-check approach) — both replaced by atomic ON CONFLICT
> **Research Reference:** `research.md` Section 2.125
> **Priority:** 🔴 CRITICAL — COI project creation is completely broken; every create attempt 500s
> **Scope:** 2 backend edits + 4 frontend edits + 1 operator hard restart. MUST restart backend after code changes.

---

### Objective

Three things in strict order:
1. **JL-1 (backend):** Replace the fragile two-step pre-check + INSERT with a single atomic `INSERT ... ON CONFLICT` — eliminates the duplicate-key 500 permanently regardless of race conditions or cross-module collisions
2. **JL-2 (frontend):** Fix `NaN%` on "Average Progress" stat card — 4 small edits in 2 files
3. **JL-3 (operator):** Hard restart backend — kill PID, wipe dist, fresh start

**Order matters:** JL-1 code must be written BEFORE JL-3 restart. JL-2 can be done in parallel with JL-1. JL-3 must follow JL-1.

---

### Governance Directives (Phase JL)

| # | Directive |
|---|-----------|
| JL-D1 | The `projectsCheck` raw SQL pre-check (JJ-A-1 addition, lines 358–366 of service.ts) MUST be REMOVED. It is superseded by ON CONFLICT. Keeping both creates redundant round-trips. |
| JL-D2 | The `cpRepo.findOne` check against `construction_projects` (lines 348–356) is KEPT — it gives a clear error message for same-module duplicates before the transaction opens. |
| JL-D3 | The try/catch wrapper (lines 373/482–492) is SIMPLIFIED — the `23505` specific check is removed (ON CONFLICT prevents that error from firing). The catch re-throws everything else unchanged. |
| JL-D4 | The `INSERT INTO projects` inside the transaction is REPLACED with the ON CONFLICT variant. Column list unchanged. |
| JL-D5 | Operator MUST hard-kill PID 23824 before any verification. Watch-mode did not pick up JJ-A. Wipe dist/ and do a clean start. |
| JL-D6 | Frontend NaN fix: NO `pg` driver type-parser changes. Number() coercion at adapter boundary only. |

---

### Step JL-1 — Backend: Atomic ON CONFLICT Replace

**File:** `pmo-backend/src/construction-projects/construction-projects.service.ts`

**Change A — Remove `projectsCheck` block (lines 358–366) and simplify try/catch:**

Replace the entire block from `const projectsCheck` through the end of `create()`:

```typescript
// REMOVE lines 358–366 (projectsCheck SQL + if block)

// KEEP: projectId, publicationStatus, submittedBy, submittedAt declarations

// CHANGE: wrap transactional in simplified try/catch
try {
  return await this.em.transactional(async (em) => {
    const conn = em.getConnection();

    if (!dto.project_id) {
      const inserted = await conn.execute(
        `INSERT INTO projects (id, project_code, title, description, project_type, start_date, end_date, status, budget, campus, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (project_code) DO NOTHING
         RETURNING id`,
        [
          projectId,
          dto.project_code,
          dto.title,
          dto.description || null,
          'CONSTRUCTION',
          dto.start_date || null,
          dto.target_completion_date || null,
          dto.status,
          dto.contract_amount || null,
          dto.campus,
          userId,
        ],
      );
      if (inserted.length === 0) {
        throw new ConflictException(
          `Project code ${dto.project_code} is already in use`,
        );
      }
    } else {
      const projectCheck = await this.projectRepo.findOne({ id: dto.project_id });
      if (!projectCheck) {
        throw new BadRequestException(`Project with ID ${dto.project_id} not found`);
      }
    }

    // ... rest of cpResult INSERT + record_assignments unchanged ...
  });
} catch (err: any) {
  if (err instanceof ConflictException || err instanceof BadRequestException) {
    throw err;
  }
  throw err;
}
```

**Verification:** JL-V1, JL-V2

---

### Step JL-2 — Frontend NaN Fix (4 edits, 2 files)

**JL-2a — `pmo-frontend/utils/adapters.ts` line ~125:**
```diff
-    physicalAccomplishment: backend.physical_progress || 0,
+    physicalAccomplishment: Number(backend.physical_progress) || 0,
```

**JL-2b — `pmo-frontend/utils/adapters.ts` line ~600:**
```diff
-    physicalProgress: backend.physical_progress || 0,
+    physicalProgress: Number(backend.physical_progress) || 0,
```

**JL-2c — `pmo-frontend/pages/coi/index.vue` reduce (line ~281):**
```diff
-    ? projectList.reduce((sum, p) => sum + (p.physicalAccomplishment || 0), 0) / projectList.length
+    ? projectList.reduce((sum, p) => sum + (Number(p.physicalAccomplishment) || 0), 0) / projectList.length
```

**JL-2d — `pmo-frontend/pages/coi/index.vue` display (line ~434):**
```diff
-          <p class="text-h4 font-weight-bold">{{ stats.avgProgress.toFixed(1) }}%</p>
+          <p class="text-h4 font-weight-bold">{{ Number.isFinite(stats.avgProgress) ? stats.avgProgress.toFixed(1) : '0.0' }}%</p>
```

**Verification:** JL-V3

---

### Step JL-3 — Operator Hard Restart (MANDATORY after JL-1)

**Run in PowerShell after JL-1 code is saved:**

```powershell
# 1. Kill the stale process on port 3001 (or 3000 — check which your backend uses)
Get-NetTCPConnection -LocalPort 3001,3000 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force }

# 2. Wipe stale compiled output
Remove-Item -Recurse -Force D:\Programming\pmo-dash\pmo-backend\dist -ErrorAction SilentlyContinue

# 3. Start fresh — watch new PID in output header
cd D:\Programming\pmo-dash\pmo-backend
npm run start:dev
```

**Expected new PID** — `[Nest] <NEW_PID>` (must be different from 23824).

**Verification:** JL-V4

---

### Verification Checklist (Phase JL)

| ID | Check | Status |
|----|-------|--------|
| JL-V1 | Backend log on duplicate-code create: shows `INSERT INTO projects ... ON CONFLICT ... DO NOTHING RETURNING id`, NO `rollback`, HTTP 409, toast "This project code is already in use" | ⬜ |
| JL-V2 | Backend log on NEW unique-code create: shows `INSERT INTO projects` with new PID, returns row, then `INSERT INTO construction_projects` succeeds, HTTP 201 | ⬜ |
| JL-V3 | COI index "Average Progress" card shows `0.0%` or real number — NEVER `NaN%` | ⬜ |
| JL-V4 | Backend restart shows new PID (not 23824) in `[Nest] <PID>` output header | ⬜ |
| JL-V5 | `POST /api/construction-projects` with genuinely new project_code → 201, project visible in list | ⬜ |
| JL-V6 | TypeScript compile: no errors on backend start | ⬜ |

---

## PHASE JM — SCHEMA SYNC + DATA CLEANUP + FIGMA UI ALIGNMENT

> **Status:** ⬜ PENDING OPERATOR AUTHORIZATION
> **Prerequisite:** JL-1 verified executing (409 from ON CONFLICT path = ✅ confirmed by operator log)
> **Research Reference:** `research.md` Section 2.126
> **Priority:** 🔴 CRITICAL (JM-A) → 🟡 MEDIUM (JM-B) → 🟢 LOW (JM-C deferable)
> **Scope:** 1 DB migration apply (JM-A) + 2 SQL diagnostics (JM-B) + 3 frontend refinements (JM-C, optional)

---

### Objective

Three sequential sub-phases:
- **JM-A** — Apply missing migration 043 to runtime DB (BLOCKER: every COI create fails with `column does not exist` until done)
- **JM-B** — Diagnose and clean orphan `projects` rows that block reuse of historical project codes
- **JM-C** — Frontend UI refinements aligned with Figma Admin Side (deferable polish)

---

### Governance Directives (Phase JM)

| # | Directive |
|---|-----------|
| JM-D1 | Migration 043 application (JM-A-1) is a one-time gap fix, NOT a violation of JI-D2. The file already exists in `database/migrations/` and was missed during operator's prior application sequence. No new SQL files are added. |
| JM-D2 | After JM-A-1, the JI baseline migration (`Migration20260430000000_Baseline`) tracking is correct — its assumed precondition (all 43 SQL migrations applied) is finally true. Do NOT re-create the baseline. |
| JM-D3 | JM-B orphan deletion uses SOFT-DELETE (`UPDATE projects SET deleted_at = NOW()`) — never `DELETE`. Preserves audit trail. |
| JM-D4 | JM-B orphan deletion is restricted to rows where `project_type = 'CONSTRUCTION'` AND `id NOT IN (SELECT project_id FROM construction_projects)`. Never delete UO module rows. |
| JM-D5 | JM-C is OPTIONAL and deferable. Authorize ONLY if JM-A and JM-B verifications pass and stakeholder confirms. |
| JM-D6 | No backend code changes in JM. Schema sync is pure DDL; orphan cleanup is data-only; UI refinement is frontend-only. |
| JM-D7 | UI refinement preserves: meatball menu pattern (existing UX), `v-tabs + v-window` Vuetify pattern (Phase JF directive), `bg-primary` table headers (CSU branding). |

---

### Sub-Phase JM-A: Schema Synchronization (BLOCKER — Operator Action)

#### Step JM-A-1 — Apply migration 043 via psql

**Operator runs (PowerShell, with `pmo-backend/.env` DATABASE_* values):**

```powershell
$env:PGPASSWORD = "<your DATABASE_PASSWORD>"
psql -h localhost -U postgres -d pmo_dashboard -f D:\Programming\pmo-dash\database\migrations\043_add_target_progress_to_construction_projects.sql
```

Expected output:
```
ALTER TABLE
```

The migration uses `ADD COLUMN IF NOT EXISTS`, so it is fully idempotent — safe to run even if columns partially exist.

**Verification:** JM-V1

---

#### Step JM-A-2 — Verify columns exist

**Operator runs:**

```powershell
psql -h localhost -U postgres -d pmo_dashboard -c "\d construction_projects" | Select-String "target_"
```

Expected: two lines — `target_physical_progress | numeric(5,2)` and `target_financial_progress | numeric(5,2)`.

**Verification:** JM-V1

---

### Sub-Phase JM-B: Orphan `projects` Data Cleanup

#### Step JM-B-1 — Diagnose specific code

**Operator runs (use the project code that gave the spurious 409 — e.g., `CP-2026-051`):**

```sql
SELECT
  p.id,
  p.project_code,
  p.project_type,
  p.deleted_at,
  p.created_at,
  p.created_by,
  cp.id AS construction_project_id
FROM projects p
LEFT JOIN construction_projects cp ON cp.project_id = p.id
WHERE p.project_code = 'CP-2026-051';
```

**Interpretation matrix:**

| Result | Meaning | Action |
|---|---|---|
| 0 rows | Code is genuinely free | Use it; if 409 still happens → re-investigate (no orphan possible) |
| 1 row, `cp.id IS NOT NULL` | A complete COI project exists | Reuse that project_code is impossible; choose a different code |
| 1 row, `cp.id IS NULL`, `project_type = 'CONSTRUCTION'` | **Orphan COI parent** — safe to soft-delete | Proceed to JM-B-2 |
| 1 row, `project_type != 'CONSTRUCTION'` | Owned by another module (e.g., UO) | DO NOT delete; choose a different COI code |

**Verification:** JM-V2

---

#### Step JM-B-2 — Soft-delete orphan (only if matrix says safe)

**Operator runs (substitute the actual code):**

```sql
UPDATE projects
SET deleted_at = NOW(), deleted_by = '<operator-user-uuid>'
WHERE project_code = 'CP-2026-051'
  AND project_type = 'CONSTRUCTION'
  AND id NOT IN (SELECT project_id FROM construction_projects);
```

Expected: `UPDATE 1`. If `UPDATE 0` returned → JM-D4 condition not satisfied → STOP, re-diagnose.

**Verification:** JM-V3

---

#### Step JM-B-3 — Sweep for ALL orphans (preventive cleanup)

**Operator runs (read-only first):**

```sql
SELECT p.id, p.project_code, p.created_at
FROM projects p
LEFT JOIN construction_projects cp ON cp.project_id = p.id
WHERE p.project_type = 'CONSTRUCTION'
  AND cp.id IS NULL
  AND p.deleted_at IS NULL;
```

If results returned → these are ALL the orphans accumulated from the pre-JL-1 era. Soft-delete in bulk:

```sql
UPDATE projects
SET deleted_at = NOW()
WHERE project_type = 'CONSTRUCTION'
  AND id NOT IN (SELECT project_id FROM construction_projects)
  AND deleted_at IS NULL;
```

**Verification:** JM-V4

---

### Sub-Phase JM-C: Figma UI Refinement (DEFERABLE)

> **Authorization gate:** Do NOT execute JM-C unless JM-V1, JM-V2, and JM-V5 all pass. Otherwise polish broken creation flow.

#### Step JM-C-1 — Inline progress bar in COI table row

**File:** `pmo-frontend/pages/coi/index.vue`

Replace the current progress column template:
```html
<template #item.physicalAccomplishment="{ item }">
  <div class="d-flex flex-column align-center" style="min-width: 120px;">
    <v-progress-linear
      :model-value="Number(item.physicalAccomplishment) || 0"
      :color="Number(item.physicalAccomplishment) >= 100 ? 'success' : 'primary'"
      height="8"
      rounded
      class="mb-1"
    />
    <span class="text-caption">{{ (Number(item.physicalAccomplishment) || 0).toFixed(1) }}%</span>
  </div>
</template>
```

**Verification:** JM-V6

---

#### Step JM-C-2 — Stat cards with leading icon + tonal background

**File:** `pmo-frontend/pages/coi/index.vue`

For each of the 6 stat cards, add `prepend-icon` slot or leading `<v-icon>`:
```html
<v-card color="primary" variant="tonal" class="pa-4 d-flex align-center ga-3">
  <v-icon icon="mdi-folder-multiple" size="36" />
  <div>
    <p class="text-caption">Total Projects</p>
    <p class="text-h4 font-weight-bold">{{ stats.total }}</p>
  </div>
</v-card>
```

Icon mapping:
| Stat | Icon |
|---|---|
| Total Projects | `mdi-folder-multiple` |
| Ongoing | `mdi-progress-clock` |
| Completed | `mdi-check-circle` |
| Pending Review | `mdi-clipboard-clock` |
| Total Contract Value | `mdi-cash-multiple` |
| Avg. Progress | `mdi-trending-up` |

**Verification:** JM-V7

---

#### Step JM-C-3 — Empty state component for 0-results

**File:** `pmo-frontend/pages/coi/index.vue`

Inside `<v-data-table>`, add:
```html
<template #no-data>
  <div class="text-center py-12">
    <v-icon icon="mdi-folder-open-outline" size="80" color="grey-lighten-1" />
    <p class="text-h6 text-grey-darken-1 mt-4">No projects found</p>
    <p class="text-body-2 text-grey">Try adjusting your filters or create a new project</p>
    <v-btn color="primary" class="mt-4" @click="createProject" v-if="canAdd('coi')">
      <v-icon start>mdi-plus</v-icon>
      New Project
    </v-btn>
  </div>
</template>
```

**Verification:** JM-V8

---

### Verification Checklist (Phase JM)

| ID | Check | Status |
|----|-------|--------|
| JM-V1 | After JM-A-1 + JM-A-2: `\d construction_projects` shows `target_physical_progress numeric(5,2)` AND `target_financial_progress numeric(5,2)` | ⬜ |
| JM-V2 | JM-B-1 SELECT returns expected interpretation row(s); operator decision matrix applied correctly | ⬜ |
| JM-V3 | JM-B-2 returns `UPDATE 1` for the diagnosed orphan; subsequent COI create with that code → 201 | ⬜ |
| JM-V4 | JM-B-3 sweep shows zero orphans remaining after cleanup | ⬜ |
| JM-V5 | After JM-A + JM-B: end-to-end create with NEW unique project_code → 201, project visible in COI list, no DB errors in log | ⬜ |
| JM-V6 | (JM-C-1) COI table progress column shows linear progress bar + percentage label, no NaN | ⬜ |
| JM-V7 | (JM-C-2) All 6 stat cards show leading icon | ⬜ |
| JM-V8 | (JM-C-3) Filter to a non-existent code → empty state with illustration + CTA renders | ⬜ |
| JM-V9 | No regression: UO / Financial / Physical modules still functional after schema apply (those modules don't use construction_projects so impact = none, but smoke check is cheap) | ⬜ |

---

## PHASE JN — SOFT-DELETE CONSTRAINT FIX + UX COMPLETION + UPLOAD SYSTEM

> **Status:** ⬜ PENDING OPERATOR AUTHORIZATION
> **Prerequisite:** JM-A applied (043 columns exist); JM-B orphans cleared
> **Research Reference:** `research.md` Section 2.127
> **Priority:** 🔴 CRITICAL (JN-A) → 🟢 LOW EFFORT/HIGH IMPACT (JN-C) → 🟡 UX (JN-B) → 🟡 FEATURE (JN-D)
> **Scope:** 1 MikroORM migration + 3 frontend lines + 10 frontend lines + (backend endpoint + controller + service + DTO + frontend Documents section)

---

### Objective

Four sub-phases, strict order:
- **JN-A** — Convert plain `UNIQUE (project_code)` to partial unique index excluding soft-deleted rows (BLOCKER)
- **JN-C** — Add missing checkmark icons to schedule/progress/personnel tabs (3 lines)
- **JN-B** — Add step-progress bar + step counter above tabs in new.vue
- **JN-D** — Document/Attachment/Google Drive upload system (backend endpoint + frontend Documents section in detail-[id].vue)

---

### Governance Directives (Phase JN)

| # | Directive |
|---|-----------|
| JN-D1 | JN-A migration is the FIRST MikroORM migration created post-baseline. Use `npm run migration:create` to generate proper TS class. Class name MUST match pattern `Migration<TIMESTAMP>_PartialUniqueProjectCode`. |
| JN-D2 | The partial index name follows convention: `<table>_<column>_active_idx`. Example: `projects_project_code_active_idx`. |
| JN-D3 | Both `projects` AND `construction_projects` get the partial-index treatment for consistency. Do NOT fix only one — operators will hit the same defect on the extension table next. |
| JN-D4 | JN-C tab checkmark template additions are PURE markup — no script changes. The `tabCompletion.{schedule,progress,personnel}` values are already `true` by design. |
| JN-D5 | JN-B step progress UI uses `v-progress-linear` (already a Vuetify built-in). NO new dependencies. |
| JN-D6 | JN-D uploads happen in `detail-[id].vue` AFTER project creation. The `new.vue` form does NOT defer-queue file uploads — adds complexity without value. Create flow: submit → 201 → toast → router.push to detail with `?focus=documents` query. |
| JN-D7 | JN-D Google Drive link validation: `^https?:\/\/(drive\|docs)\.google\.com\/`. Reject other URLs at frontend (helpful feedback) AND backend (defense in depth). |
| JN-D8 | JN-D backend file upload limit: 20 MB on the new endpoint (vs 10 MB on existing generic UploadsController). For files >20 MB, user MUST use Drive link path. |
| JN-D9 | NO breaking changes to existing gallery upload (`POST /api/construction-projects/:id/gallery`) — it remains the image-only path. |

---

### Sub-Phase JN-A: Soft-Delete-Aware Unique Index (BLOCKER)

#### Step JN-A-1 — Create MikroORM migration class

**Operator runs (PowerShell):**

```powershell
cd D:\Programming\pmo-dash\pmo-backend
npm run migration:create -- --name=PartialUniqueProjectCode
```

Expected: file generated at `src/database/mikro-migrations/Migration<timestamp>_PartialUniqueProjectCode.ts` (likely empty `up()`/`down()` since no entity diff).

**Verification:** JN-V0

---

#### Step JN-A-2 — Edit migration body

**File:** the generated migration file.

```typescript
import { Migration } from '@mikro-orm/migrations';

export class Migration<TIMESTAMP>_PartialUniqueProjectCode extends Migration {
  async up(): Promise<void> {
    // projects: replace plain UNIQUE with partial index
    this.addSql(`ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_project_code_key;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS projects_project_code_active_idx ON projects (project_code) WHERE deleted_at IS NULL;`);

    // construction_projects: same treatment for consistency
    this.addSql(`ALTER TABLE construction_projects DROP CONSTRAINT IF EXISTS construction_projects_project_code_key;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS construction_projects_project_code_active_idx ON construction_projects (project_code) WHERE deleted_at IS NULL;`);
  }

  async down(): Promise<void> {
    this.addSql(`DROP INDEX IF EXISTS projects_project_code_active_idx;`);
    this.addSql(`ALTER TABLE projects ADD CONSTRAINT projects_project_code_key UNIQUE (project_code);`);
    this.addSql(`DROP INDEX IF EXISTS construction_projects_project_code_active_idx;`);
    this.addSql(`ALTER TABLE construction_projects ADD CONSTRAINT construction_projects_project_code_key UNIQUE (project_code);`);
  }
}
```

**Verification:** JN-V1

---

#### Step JN-A-3 — Apply migration

**Operator runs:**
```powershell
npm run migration:up
npm run migration:list
```

Expected: new migration shown as applied (`[*]`).

**Verification:** JN-V1

---

#### Step JN-A-4 — Verify constraint replaced

**Operator runs (psql or check-codes script):**
```sql
SELECT conname FROM pg_constraint WHERE conrelid = 'projects'::regclass AND contype = 'u';
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'projects' AND indexname LIKE '%project_code%';
```

Expected:
- pg_constraint: ZERO rows for `projects_project_code_key` (constraint dropped)
- pg_indexes: `projects_project_code_active_idx` with `WHERE (deleted_at IS NULL)` clause

**Verification:** JN-V1

---

#### Step JN-A-5 — Functional verification

Re-attempt creating COI project with `project_code = 'CP-2026-051'`. Expected: **201 Created** (the soft-deleted row no longer blocks the unique slot).

**Verification:** JN-V2

---

### Sub-Phase JN-C: Tab Checkmark Consistency (3-line frontend fix)

#### Step JN-C-1 — Add checkmarks to schedule, progress, personnel tabs

**File:** `pmo-frontend/pages/coi/new.vue`

For each of the three v-tab elements (currently lines ~248, 252, 256), add a checkmark icon mirroring the basic/contract pattern:

```html
<v-tab value="schedule">
  <v-icon start>mdi-calendar-range</v-icon>
  Schedule
  <v-icon v-if="tabCompletion.schedule" end color="success" size="small">mdi-check-circle</v-icon>
</v-tab>
<v-tab value="progress">
  <v-icon start>mdi-trending-up</v-icon>
  Progress &amp; Details
  <v-icon v-if="tabCompletion.progress" end color="success" size="small">mdi-check-circle</v-icon>
</v-tab>
<v-tab value="personnel">
  <v-icon start>mdi-account-group</v-icon>
  Personnel
  <v-icon v-if="tabCompletion.personnel" end color="success" size="small">mdi-check-circle</v-icon>
</v-tab>
```

**Verification:** JN-V3

---

### Sub-Phase JN-B: Step Progress Bar + Counter Above Tabs

#### Step JN-B-1 — Add computed values

**File:** `pmo-frontend/pages/coi/new.vue` (after `tabCompletion`)

```typescript
const currentStepIndex = computed(() =>
  tabOrder.indexOf(activeTab.value as typeof tabOrder[number])
)
const completionPercentage = computed(() => {
  const completed = Object.values(tabCompletion.value).filter(Boolean).length
  return Math.round((completed / tabOrder.length) * 100)
})
```

**Verification:** JN-V4

---

#### Step JN-B-2 — Insert progress UI above v-tabs

**File:** `pmo-frontend/pages/coi/new.vue` (insert immediately before the `<v-card class="mb-4">` that contains v-tabs)

```html
<!-- JN-B: Step progress indicator -->
<v-card class="mb-2 pa-3">
  <div class="d-flex align-center justify-space-between mb-2">
    <span class="text-body-2 font-weight-medium">
      Step {{ currentStepIndex + 1 }} of {{ tabOrder.length }}
    </span>
    <v-chip size="small" :color="completionPercentage === 100 ? 'success' : 'primary'" variant="tonal">
      {{ completionPercentage }}% complete
    </v-chip>
  </div>
  <v-progress-linear
    :model-value="completionPercentage"
    :color="completionPercentage === 100 ? 'success' : 'primary'"
    height="6"
    rounded
  />
</v-card>
```

**Verification:** JN-V4

---

### Sub-Phase JN-D: Document / Attachment / Google Drive Upload System

#### Step JN-D-1 — Backend DTO

**File:** `pmo-backend/src/construction-projects/dto/upload-document.dto.ts` (NEW)

```typescript
import { IsOptional, IsString, IsUrl, MaxLength, Matches } from 'class-validator';

export class UploadDocumentDto {
  @IsString()
  @MaxLength(50)
  documentType!: string; // 'attachment' | 'mov' | 'link' | 'specification' | etc.

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @Matches(/^https?:\/\/(drive|docs)\.google\.com\//i, {
    message: 'externalLink must be a valid Google Drive URL',
  })
  externalLink?: string;
}
```

Export from `dto/index.ts`.

---

#### Step JN-D-2 — Backend service method

**File:** `construction-projects.service.ts`

```typescript
async addDocumentToProject(
  projectId: string,
  file: Express.Multer.File | undefined,
  dto: UploadDocumentDto,
  userId: string,
): Promise<Document> {
  // Validate project exists
  const project = await this.findOne(projectId);

  // Branch: file upload OR external link (mutually exclusive)
  if (!file && !dto.externalLink) {
    throw new BadRequestException('Either a file or an externalLink is required');
  }
  if (file && dto.externalLink) {
    throw new BadRequestException('Provide a file OR an externalLink, not both');
  }

  let filePath: string;
  let fileName: string;
  let fileSize: number;
  let mimeType: string;

  if (file) {
    const upload = await this.uploadsService.uploadFile(file, userId);
    filePath = upload.url;
    fileName = file.originalname;
    fileSize = file.size;
    mimeType = file.mimetype;
  } else {
    filePath = dto.externalLink!;
    fileName = dto.title || 'Google Drive Link';
    fileSize = 0;
    mimeType = 'application/x-google-drive-link';
  }

  const doc = this.em.create(Document, {
    documentableType: 'CONSTRUCTION_PROJECT',
    documentableId: projectId,
    documentType: dto.documentType,
    fileName,
    filePath,
    fileSize,
    mimeType,
    description: dto.description,
    category: dto.category,
    uploadedBy: userId,
    createdBy: userId,
  });
  await this.em.persistAndFlush(doc);
  return doc;
}

async listProjectDocuments(projectId: string): Promise<Document[]> {
  return this.em.find(Document, {
    documentableType: 'CONSTRUCTION_PROJECT',
    documentableId: projectId,
  }, { orderBy: { createdAt: 'desc' } });
}
```

Inject `Document` repository in constructor + import statements.

---

#### Step JN-D-3 — Backend controller routes

**File:** `construction-projects.controller.ts`

```typescript
@Post(':id/documents')
@Roles('Admin', 'Staff')
@UseInterceptors(
  FileInterceptor('file', { limits: { fileSize: 20 * 1024 * 1024 } }),
)
async uploadDocument(
  @Param('id') id: string,
  @UploadedFile() file: Express.Multer.File | undefined,
  @Body() dto: UploadDocumentDto,
  @CurrentUser() user: JwtPayload,
) {
  return this.service.addDocumentToProject(id, file, dto, user.sub);
}

@Get(':id/documents')
async listDocuments(@Param('id') id: string) {
  const data = await this.service.listProjectDocuments(id);
  return { data };
}
```

---

#### Step JN-D-4 — Frontend Documents section in detail-[id].vue

**File:** `pmo-frontend/pages/coi/detail-[id].vue`

Add a new section (after Gallery section) with three actions:
- "Upload File" button → file input → POST `/api/construction-projects/{id}/documents` (multipart, 20MB limit)
- "Add Drive Link" button → dialog with URL input + title + description → POST same endpoint (JSON, externalLink populated)
- Document list table: `fileName`, `documentType`, `description`, file size or "Drive link" badge, uploaded date, view/download action

Frontend Drive URL validation regex: `/^https?:\/\/(drive|docs)\.google\.com\//i` — reject before submit.

---

#### Step JN-D-5 — Post-create redirect with documents focus

**File:** `pmo-frontend/pages/coi/new.vue`

In `handleSubmit()` success path, change:
```diff
- router.push('/coi')
+ const created = await api.post<{ id: string }>('/api/construction-projects', payload)
+ router.push(`/coi/detail-${created.id}?focus=documents`)
```

(Use the returned project ID; if no ID returned, fall back to list.)

---

### Verification Checklist (Phase JN)

| ID | Check | Status |
|----|-------|--------|
| JN-V0 | `npm run migration:create -- --name=PartialUniqueProjectCode` generates a TS class file in `mikro-migrations/` | ⬜ |
| JN-V1 | After JN-A-3 + JN-A-4: `pg_constraint` no longer shows `projects_project_code_key`; `pg_indexes` shows `projects_project_code_active_idx` with `WHERE (deleted_at IS NULL)` predicate | ⬜ |
| JN-V2 | Re-create COI project with `project_code = 'CP-2026-051'` (soft-deleted) → 201 Created; project visible in list | ⬜ |
| JN-V3 | All 5 tabs in new.vue display green checkmark icon when their `tabCompletion` is true | ⬜ |
| JN-V4 | Step progress bar above tabs shows `Step X of 5` and percentage; bar fills as required fields are completed | ⬜ |
| JN-V5 | `POST /api/construction-projects/:id/documents` with file upload (≤20 MB) → 201, Document row created with `documentType`, `documentableType='CONSTRUCTION_PROJECT'` | ⬜ |
| JN-V6 | Same endpoint with JSON body containing valid Google Drive URL → 201, Document row with `mimeType='application/x-google-drive-link'`, `fileSize=0` | ⬜ |
| JN-V7 | Same endpoint with non-Drive URL → 400 BadRequest "externalLink must be a valid Google Drive URL" | ⬜ |
| JN-V8 | Same endpoint with file >20 MB → 413 Payload Too Large | ⬜ |
| JN-V9 | `GET /api/construction-projects/:id/documents` returns `{ data: Document[] }` ordered by createdAt desc | ⬜ |
| JN-V10 | Frontend: detail page Documents section renders both file rows and Drive link rows distinctly | ⬜ |
| JN-V11 | Frontend: post-create redirect lands on detail page with Documents section visible (scrolled or focused) | ⬜ |
| JN-V12 | No regression: existing gallery upload (`POST /api/construction-projects/:id/gallery`) still works | ⬜ |

---

## PHASE JO — ON CONFLICT REGRESSION FIX + TAB VALIDATION + INLINE UPLOADS + EDIT ALIGNMENT

> **Status:** ⬜ PENDING OPERATOR AUTHORIZATION
> **Prerequisite:** JN-A partial unique index applied (verified live)
> **Research Reference:** `research.md` Section 2.128
> **Priority:** 🔴 BLOCKER (JO-A) → 🟡 UX CORRECTNESS (JO-B+C) → 🟡 FEATURE (JO-D) → 🟡 ALIGNMENT (JO-E)

---

### Objective

Five sub-phases in dependency order:
- **JO-A** — Fix ON CONFLICT predicate to match JN-A partial index (one-line SQL change, BLOCKER)
- **JO-B** — Replace hardcoded tab completion with engagement-based logic
- **JO-C** — Gate `nextTab()` and Submit on `tabRequired` (new computed)
- **JO-D** — Add 6th "Documents" tab to Create form with two-stage submit (project create → upload pending files)
- **JO-E** — Restructure Edit form to mirror Create form (same 6 tabs, same validation, inline uploads)

---

### Governance Directives (Phase JO)

| # | Directive |
|---|-----------|
| JO-D1 | JO-A change is the ONLY backend code modification in JO. Single-line SQL alteration in `service.ts:create()`. Add inline comment referencing migration name. |
| JO-D2 | JO-B introduces `tabRequired` as a SEPARATE computed from `tabCompletion`. Do NOT merge — they represent distinct concerns (engagement vs validity). |
| JO-D3 | JO-C navigation guard applies to `nextTab()` only. Direct tab clicks (v-tabs binding) remain free for backward navigation UX. Submit guard is separate, jumps to first invalid tab. |
| JO-D4 | JO-D 6th tab `documents` is the LAST tab. `tabOrder = ['basic','contract','schedule','progress','personnel','documents']`. Submit button moves to documents tab. |
| JO-D5 | JO-D two-stage submit: project metadata POST first (must succeed); then loop pending files (best-effort, accumulate failures, never block redirect). |
| JO-D6 | JO-D file staging uses browser-only `File` objects in reactive arrays. NO file content sent until project ID is known. |
| JO-D7 | JO-E edit form reuses ALL JO-B/C/D logic — single source of truth via shared composable IF code duplication exceeds threshold. Otherwise inline-copy is acceptable for now. |
| JO-D8 | JO-E documents tab in edit form uses immediate upload (project ID exists), NOT staging. Existing gallery upload pattern from `detail-[id].vue` is the reference. |
| JO-D9 | NO new backend endpoints needed for JO. JN-D endpoints (`POST /:id/documents`, `GET /:id/documents`, `POST /:id/gallery`) are sufficient. DELETE endpoint will be added if and only if Edit form's "remove existing" UX requires it (defer to JO-E exec). |

---

### Sub-Phase JO-A: Backend ON CONFLICT Predicate Fix [BLOCKER]

#### Step JO-A-1 — Update SQL in `service.ts:create()`

**File:** `pmo-backend/src/construction-projects/construction-projects.service.ts`

**Lines ~367–371:** Add the partial-index predicate to ON CONFLICT.

```diff
  const inserted = await conn.execute(
    `INSERT INTO projects (id, project_code, title, description, project_type, start_date, end_date, status, budget, campus, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
-    ON CONFLICT (project_code) DO NOTHING
+    ON CONFLICT (project_code) WHERE (deleted_at IS NULL) DO NOTHING
     RETURNING id`,
```

Add a one-line comment above:
```typescript
// Partial-index inference: must match Migration20260502071146_PartialUniqueProjectCode predicate.
```

**Verification:** JO-V1

---

#### Step JO-A-2 — Backend restart (operator)

```powershell
Get-NetTCPConnection -LocalPort 3001,3000 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
cd D:\Programming\pmo-dash\pmo-backend
npm run start:dev
```

**Verification:** JO-V1 (manual create attempt with `CP-2026-051` — expect 201 since soft-deleted row no longer blocks)

---

### Sub-Phase JO-B: Engagement-Based Tab Completion

#### Step JO-B-1 — Replace `tabCompletion` computed in `new.vue`

**File:** `pmo-frontend/pages/coi/new.vue`

```typescript
const tabCompletion = computed(() => ({
  basic: !!(form.value.project_code && form.value.title && form.value.campus && form.value.status),
  contract: !!(form.value.funding_source_id),
  schedule: !!(
    form.value.start_date ||
    form.value.target_completion_date ||
    form.value.actual_completion_date ||
    form.value.project_duration ||
    form.value.original_contract_duration
  ),
  progress: !!(
    (form.value.target_physical_progress !== null && form.value.target_physical_progress !== 100) ||
    (form.value.target_financial_progress !== null && form.value.target_financial_progress !== 100) ||
    form.value.building_type ||
    form.value.floor_area ||
    form.value.number_of_floors ||
    form.value.latitude !== null ||
    form.value.longitude !== null
  ),
  personnel: !!(
    form.value.project_engineer ||
    form.value.project_manager ||
    (form.value.assigned_user_ids && form.value.assigned_user_ids.length > 0)
  ),
  documents: pendingDocs.value.length + pendingImages.value.length + pendingLinks.value.length > 0,
}))
```

**Verification:** JO-V2

---

#### Step JO-B-2 — Add `tabRequired` computed

```typescript
const tabRequired = computed(() => ({
  basic: !!(form.value.project_code && form.value.title && form.value.campus && form.value.status),
  contract: !!(form.value.funding_source_id),
  schedule: true,
  progress: true,
  personnel: true,
  documents: true,
}))
```

**Verification:** JO-V2

---

### Sub-Phase JO-C: Navigation + Submit Gating

#### Step JO-C-1 — Update `nextTab()` with guard

```typescript
function nextTab() {
  const cur = activeTab.value as typeof tabOrder[number]
  if (!tabRequired.value[cur]) {
    toast.error(`Please complete required fields in "${cur}" before continuing`)
    return
  }
  const idx = tabOrder.indexOf(cur)
  if (idx < tabOrder.length - 1) activeTab.value = tabOrder[idx + 1]
}
```

**Verification:** JO-V3

---

#### Step JO-C-2 — Update `handleSubmit()` with full-form gate

At the top of `handleSubmit()`:
```typescript
const incomplete = (Object.keys(tabRequired.value) as Array<keyof typeof tabRequired.value>)
  .filter(k => !tabRequired.value[k])
if (incomplete.length > 0) {
  activeTab.value = incomplete[0]  // jump to first invalid tab
  toast.error(`Required fields incomplete in: ${incomplete.join(', ')}`)
  return
}
```

**Verification:** JO-V3

---

### Sub-Phase JO-D: Inline Documents Tab on Create Form (Two-Stage Submit)

#### Step JO-D-1 — Add staging refs + tab definition

**File:** `new.vue` script:
```typescript
interface PendingLink { url: string; title: string; description: string }
const pendingDocs = ref<{ file: File; documentType: string; description: string }[]>([])
const pendingImages = ref<{ file: File; caption: string; category: string }[]>([])
const pendingLinks = ref<PendingLink[]>([])
```

Update `tabOrder`:
```typescript
const tabOrder = ['basic', 'contract', 'schedule', 'progress', 'personnel', 'documents'] as const
```

---

#### Step JO-D-2 — Add 6th `<v-tab value="documents">` to template

```html
<v-tab value="documents">
  <v-icon start>mdi-paperclip</v-icon>
  Documents
  <v-icon v-if="tabCompletion.documents" end color="success" size="small">mdi-check-circle</v-icon>
</v-tab>
```

---

#### Step JO-D-3 — Add `<v-window-item value="documents">` content

Three sections inside the window-item:
1. File picker → "Add" button → pushes to `pendingDocs`
2. Image picker → "Add" button → pushes to `pendingImages`
3. Drive URL input + "Add Link" button (regex-validated) → pushes to `pendingLinks`
4. List of staged uploads with remove buttons

Move Submit/Cancel buttons from personnel tab → documents tab.

---

#### Step JO-D-4 — Two-stage submit logic in `handleSubmit()`

```typescript
// Stage 1: create project
const created = await api.post<{ id: string }>('/api/construction-projects', payload)
if (!created?.id) {
  router.push('/coi')
  return
}

// Stage 2: upload pending files (best-effort)
const failures: string[] = []
const allUploads = [
  ...pendingDocs.value.map(d => async () => {
    const fd = new FormData()
    fd.append('file', d.file)
    fd.append('documentType', d.documentType)
    if (d.description) fd.append('description', d.description)
    return api.upload(`/api/construction-projects/${created.id}/documents`, fd)
  }),
  ...pendingImages.value.map(im => async () => {
    const fd = new FormData()
    fd.append('file', im.file)
    if (im.caption) fd.append('caption', im.caption)
    fd.append('category', im.category)
    return api.upload(`/api/construction-projects/${created.id}/gallery`, fd)
  }),
  ...pendingLinks.value.map(lk => async () => {
    return api.post(`/api/construction-projects/${created.id}/documents`, {
      documentType: 'link',
      externalLink: lk.url,
      title: lk.title || undefined,
      description: lk.description || undefined,
    })
  }),
]
for (let i = 0; i < allUploads.length; i++) {
  try { await allUploads[i]() } catch (e: any) { failures.push(`#${i+1}: ${e?.message || 'failed'}`) }
}
if (failures.length === 0) {
  toast.success(`Project created with ${allUploads.length} attachment(s)`)
} else {
  toast.warning(`Project created. ${failures.length} of ${allUploads.length} uploads failed (retry from detail page)`)
}
router.push(`/coi/detail-${created.id}`)
```

**Verification:** JO-V4, JO-V5

---

### Sub-Phase JO-E: Edit Form Alignment

#### Step JO-E-1 — Audit `edit-[id].vue` current structure

Confirm whether tabs already exist or only card-section layout. If card-only, full template restructure required (mirror `new.vue` pattern from JJ-D).

#### Step JO-E-2 — Apply same tab structure

Copy from `new.vue` template: 6 tabs (basic / contract / schedule / progress / personnel / documents), same step progress card, same v-window blocks, same prev/next nav.

#### Step JO-E-3 — Documents tab (edit variant)

- Pre-load existing files: `GET /api/construction-projects/${id}/documents`
- Pre-load existing images: `GET /api/construction-projects/${id}/gallery`
- Show in two lists at top of tab; each item has a "Remove" action (calls DELETE if added; defer)
- Below lists: same three pickers as create, but uploads are IMMEDIATE to existing project ID (no staging)

#### Step JO-E-4 — Reuse mapApiError + tabCompletion + tabRequired + nextTab logic

Inline-copy from `new.vue` is acceptable. If/when code dup exceeds 100 lines, extract to `composables/useProjectForm.ts`.

**Verification:** JO-V6, JO-V7

---

### Verification Checklist (Phase JO)

| ID | Check | Status |
|----|-------|--------|
| JO-V1 | After JO-A + restart: `POST /api/construction-projects` with `CP-2026-051` → 201 (soft-deleted row no longer blocks); log shows ON CONFLICT predicate matched, no constraint error | ⬜ |
| JO-V2 | `tabCompletion`: schedule/progress/personnel show NO checkmark when those tabs have no values; checkmark appears only when at least one optional field has a value | ⬜ |
| JO-V3 | `nextTab()` with empty basic/contract → toast error, no advance. `handleSubmit()` with empty required → jumps to first invalid tab + toast | ⬜ |
| JO-V4 | Create form Documents tab: file/image/link can be added; staged list visible; remove works | ⬜ |
| JO-V5 | Submit with 2 staged files + 1 Drive link → project created, all 3 uploads attempted, success toast, redirect to detail page showing all 3 attachments | ⬜ |
| JO-V6 | Edit form has same 6-tab structure as create form; pre-populated with existing project values | ⬜ |
| JO-V7 | Edit form Documents tab shows existing files + gallery + Drive links; new uploads work immediately to existing ID | ⬜ |
| JO-V8 | No regression: existing detail-page upload (JN-D) still works | ⬜ |
| JO-V9 | Backend `tsc --noEmit` clean; frontend dev server hot-reloads without errors | ⬜ |

---

## Phase JP — Deployment-Resilient Conflict Detection + Attachment UX + Edit Tab Restructure (2026-05-02)

**Source:** `docs/research.md` Section 2.129
**Status:** Phase 2 Plan
**Trigger:** RUN_ACE — JO-A `ON CONFLICT (col) WHERE (predicate)` SQL is correct in source but stale in compiled `dist/`. Third occurrence of source-vs-runtime divergence on Windows nest-watch. Eliminate inference dependency entirely; harden operator restart workflow; complete attachment UX guidance and Edit-form structural alignment.
**Continuity:** Builds on Phases JJ–JO. Does NOT invalidate JN-A partial unique index (still enforces uniqueness; we just stop relying on PostgreSQL's ON CONFLICT inference of it).

### Phase JP Implementation Steps

#### Sub-Phase JP-A — Deployment-Resilient Conflict Detection [BLOCKER]

##### Step JP-A-1 — Remove ON CONFLICT clause from projects insert

**File:** `pmo-backend/src/construction-projects/construction-projects.service.ts` (`create()`, lines 367–395)

Change SQL from:
```sql
INSERT INTO projects (...) VALUES (...)
ON CONFLICT (project_code) WHERE (deleted_at IS NULL) DO NOTHING
RETURNING id
```
to:
```sql
INSERT INTO projects (...) VALUES (...)
RETURNING id
```

##### Step JP-A-2 — Wrap insert in try/catch on `23505`

```typescript
try {
  const inserted = await conn.execute(`INSERT INTO projects ... RETURNING id`, [...]);
  // success — projectId is now committed inside the txn
} catch (err: any) {
  if (err?.code === '23505') {
    throw new ConflictException(
      `Project code ${dto.project_code} is already in use`,
    );
  }
  throw err;
}
```

The partial unique index `projects_project_code_active_idx` (Migration20260502071146) does the work; we translate the resulting `unique_violation` (PG SQLSTATE 23505) to a 409. Inference is no longer needed.

##### Step JP-A-3 — Mirror try/catch on construction_projects insert

The `construction_projects` table also has a partial unique index on `project_code`. Wrap the second `INSERT INTO construction_projects ... RETURNING *` in the same try/catch so a soft-delete collision at that level also returns 409 (not 500).

##### Step JP-A-4 — Operator clean rebuild

Operator MUST run (one time, after edits land):
```powershell
# kill nest dev server, then:
Remove-Item -Recurse -Force pmo-backend/dist
cd pmo-backend; npm run start:dev
```

**Verification:** JP-V1, JP-V2

---

#### Sub-Phase JP-B — Operator Build Hygiene

##### Step JP-B-1 — Add `start:fresh` npm script

**File:** `pmo-backend/package.json`

Add to `"scripts"`:
```json
"start:fresh": "rimraf dist && nest start --watch"
```

If `rimraf` is not already a devDependency, install it (`npm i -D rimraf`). Otherwise use the existing `del-cli` or `npx rimraf`.

##### Step JP-B-2 — Document in CLAUDE.md (defer)

Skip — CLAUDE.md is project-context, not workflow docs. Operator already knows the pattern.

**Verification:** JP-V3

---

#### Sub-Phase JP-C — Attachment UX Guidance

##### Step JP-C-1 — Header v-alert in `new.vue` Documents tab

Inside `<v-window-item value="documents">` at the top:
```html
<v-alert type="info" variant="tonal" density="comfortable" class="mb-4">
  <template #title>Attachment options</template>
  <div class="text-body-2">
    Choose any combination below — all are optional. Files upload after the project is created.
  </div>
  <ul class="text-caption mt-2 ml-4">
    <li><strong>Documents:</strong> PDF, DOCX, XLSX up to 20 MB each</li>
    <li><strong>Images:</strong> JPG, PNG, WEBP up to 10 MB each</li>
    <li><strong>External links:</strong> Google Drive / Docs URLs for files exceeding limits — set sharing to "Anyone with the link can view" before pasting</li>
  </ul>
</v-alert>
```

##### Step JP-C-2 — Section dividers between picker rows

Between each picker section in the documents tab, insert:
```html
<v-divider class="my-4"><v-icon icon="mdi-paperclip" size="small" /></v-divider>
```

Use `mdi-paperclip` for documents, `mdi-image` for images, `mdi-google-drive` for links.

##### Step JP-C-3 — Drive URL hint

On the Drive URL input add:
```html
:hint="'Must be a drive.google.com or docs.google.com URL. Set sharing to Anyone with the link can view.'"
persistent-hint
prepend-inner-icon="mdi-google-drive"
```

##### Step JP-C-4 — Mirror to `edit-[id].vue` Documents tab

After JP-D restructures the edit form into tabs, copy the same v-alert / dividers / Drive hint into the edit Documents tab.

**Verification:** JP-V4

---

#### Sub-Phase JP-D — Edit Form Tab Restructure (Mirror new.vue)

##### Step JP-D-1 — Add tab state + helpers to script

In `edit-[id].vue` `<script setup>` add:
```typescript
const tabOrder = ['basic', 'contract', 'schedule', 'progress', 'personnel', 'documents'] as const
type TabKey = typeof tabOrder[number]
const activeTab = ref<TabKey>('basic')

const tabRequired = computed(() => ({
  basic: !!(form.value.project_code && form.value.title && form.value.campus && form.value.status),
  contract: !!(form.value.funding_source_id),
  schedule: true, progress: true, personnel: true, documents: true,
}))
const tabCompletion = computed(() => ({
  basic: tabRequired.value.basic,
  contract: tabRequired.value.contract,
  schedule: !!(form.value.start_date || form.value.target_completion_date || form.value.actual_completion_date || form.value.original_contract_duration || form.value.project_duration),
  progress: !!((form.value.target_physical_progress !== null && form.value.target_physical_progress !== undefined && form.value.target_physical_progress !== 100) || (form.value.target_financial_progress !== null && form.value.target_financial_progress !== undefined && form.value.target_financial_progress !== 100) || form.value.physical_progress || form.value.financial_progress),
  personnel: !!(form.value.project_engineer || form.value.project_manager || form.value.contractor_id || form.value.assigned_to),
  documents: existingDocs.value.length + existingGallery.value.length > 0,
}))
const completionPercentage = computed(() => {
  const vals = Object.values(tabCompletion.value)
  return Math.round((vals.filter(Boolean).length / vals.length) * 100)
})
const currentStepIndex = computed(() => tabOrder.indexOf(activeTab.value))

function nextTab() {
  const idx = currentStepIndex.value
  if (!tabRequired.value[activeTab.value]) {
    toast.error(`Please complete required fields in ${activeTab.value} before continuing`)
    return
  }
  if (idx < tabOrder.length - 1) activeTab.value = tabOrder[idx + 1]
}
function prevTab() {
  const idx = currentStepIndex.value
  if (idx > 0) activeTab.value = tabOrder[idx - 1]
}
```

##### Step JP-D-2 — Replace template root with tab structure

Replace the existing `<v-row><v-col>...</v-col></v-row>` body with:
1. Step progress card (copy from `new.vue`)
2. `<v-tabs v-model="activeTab">` with 6 tabs (icons + completion checkmarks per JN-C/JO-B pattern)
3. `<v-window v-model="activeTab">` with 6 `<v-window-item>` blocks

Each existing `<v-card>` (Basic Info, Contract, Schedule, Progress, Personnel) moves into its corresponding `<v-window-item>`. Documents card (JO-E) moves into `<v-window-item value="documents">`.

##### Step JP-D-3 — Documents tab (edit variant)

Inside `<v-window-item value="documents">`:
1. JP-C v-alert (same content as new.vue)
2. Existing Documents list (`existingDocs.value`) with delete buttons
3. JP-C divider, then file upload picker (immediate upload to existing project ID — no staging)
4. Existing Gallery list (`existingGallery.value`) with delete buttons
5. JP-C divider, then image upload picker (immediate upload)
6. Existing Drive Links list, then JP-C divider, then Drive URL input + Add button (immediate POST)

Reuse the JN-D `addDocumentToProject()` controller — already wired.

##### Step JP-D-4 — Footer nav + Save button

At bottom of each `<v-window-item>` add:
```html
<div class="d-flex justify-space-between mt-4">
  <v-btn :disabled="currentStepIndex === 0" @click="prevTab">Back</v-btn>
  <v-btn v-if="currentStepIndex < tabOrder.length - 1" color="primary" @click="nextTab">Next</v-btn>
  <v-btn v-else color="primary" :loading="saving" @click="handleSubmit">Save Changes</v-btn>
</div>
```

##### Step JP-D-5 — Pre-fill tab state from loaded project

After `fetchProject()` resolves, the `form.value.*` assignments already cover the field pre-fill. `tabCompletion`/`tabRequired` recompute automatically. No additional state initialization needed.

**Verification:** JP-V5, JP-V6, JP-V7

---

### Verification Checklist (Phase JP)

| ID | Check | Status |
|----|-------|--------|
| JP-V1 | After clean rebuild: `POST /api/construction-projects` with NEW code → 201; with EXISTING active code → 409 with friendly message; with SOFT-DELETED code → 201 (re-use allowed) | ✅ |
| JP-V2 | Backend log shows no "ON CONFLICT" / "42P10" errors; only the 23505 path is exercised on duplicate attempts | ✅ |
| JP-V3 | `npm run start:fresh` from `pmo-backend/` deletes `dist/` and starts dev server with fresh compile | ✅ |
| JP-V4 | Documents tab on Create form shows blue info alert with 3-bullet upload guide; Drive URL input shows persistent hint with sharing instruction; section dividers visible between Documents/Images/Links | ✅ |
| JP-V5 | Edit form (`/coi/edit-{id}`) renders 6-tab structure identical to Create form; pre-populated with existing values; checkmarks reflect filled tabs | ✅ |
| JP-V6 | Edit form Documents tab shows existing files + gallery + Drive links at top; new uploads are immediate (no staging); same v-alert + hints as Create | ✅ |
| JP-V7 | Edit form prev/next buttons gate by `tabRequired`; Save Changes button only on Documents tab | ✅ |
| JP-V8 | Backend `tsc --noEmit` clean; frontend dev server hot-reloads without errors; no regression on UO/Physical/Financial modules | ⬜ |

---

## Phase JQ — Attachment System Refactor + Edit CRUD Completion + COI Table UI

**Status:** ⬜ PENDING
**Research Reference:** Section 2.130
**Baseline:** JP-V1–V7 operator-verified. Edit form 6-tab structure functional. `removeDocument()` service method and `DELETE :id/documents/:docId` endpoint do not yet exist.
**Sub-phases:** JQ-A → JQ-B → JQ-C → JQ-D (lowest risk → highest risk; backend before frontend in JQ-C)

---

### Governance Directives (Phase JQ)

| ID | Directive |
|----|-----------|
| JQ-D1 | Tab `value` key `'documents'` must NOT be renamed; it is referenced in `tabOrder`, `tabCompletion`, `tabRequired` in both `new.vue` and `edit-[id].vue`. Only the user-visible text label changes. |
| JQ-D2 | `removeDocument()` service method must resolve the `Document` entity from `documentRepo` using both `id` and `documentableId` before calling `em.removeAndFlush()` — never remove by id alone. |
| JQ-D3 | New `DELETE :id/documents/:docId` controller route must call `validateOperationEditable(projectId, quarter)` consistent with all other mutating routes — OR omit quarter check if document deletion is not quarter-scoped (confirm with operator). |
| JQ-D4 | Divider labels in `edit-[id].vue` must match `new.vue` exactly after JQ-B: `Documents` / `Images` / `External Links`. |
| JQ-D5 | Existing gallery images in `edit-[id].vue` must be fetched from `GET :id/gallery` into a separate `existingGallery` ref — never merged into `existingDocs`. |
| JQ-D6 | Files/Links overline group headers (JQ-B) are visual only — they do not change data model or upload logic. |
| JQ-D7 | `stats.pendingReview` is already computed in `computeStats()` (index.vue). JQ-D adds only a KPI card template block — no logic change to `computeStats()`. |
| JQ-D8 | `autoRevertQuarterlyReport()` is NOT applicable to COI module. Do not add it. |

---

### Sub-Phase JQ-A — Tab + Card Label Rename

**Scope:** `pmo-frontend/pages/coi/new.vue` and `pmo-frontend/pages/coi/edit-[id].vue`
**Risk:** Very Low — 2 text changes per file, no logic change

**File:** `new.vue`

**Step JQ-A-1:** Change tab visible label

```
Find (line ~473):    <v-tab value="documents">Documents</v-tab>
Replace with:        <v-tab value="documents">Attachments</v-tab>
```

**Step JQ-A-2:** Change card title

```
Find (line ~880):    Documents & Attachments
Replace with:        Attachments
```

**File:** `edit-[id].vue`

**Step JQ-A-3:** Change tab visible label

```
Find (line ~510):    <v-tab value="documents">Documents</v-tab>
Replace with:        <v-tab value="documents">Attachments</v-tab>
```

**Step JQ-A-4:** Change card title

```
Find (line ~942):    Documents & Attachments
Replace with:        Attachments
```

---

### Sub-Phase JQ-B — Divider Consistency + Files/Links Group Overlines

**Scope:** `edit-[id].vue` (divider normalization) + both files (overline grouping)
**Risk:** Low — template-only, no logic or data model change

**Step JQ-B-1:** Normalize `edit-[id].vue` divider labels to match `new.vue`

```
Find:   Upload Document   → Replace with: Documents
Find:   Upload Image      → Replace with: Images
Find:   Add External Link → Replace with: External Links
```

(Each divider is inside a `v-divider` + label pattern; replace text node only, preserve icon and surrounding markup.)

**Step JQ-B-2:** Add Files/Links overline section headers in `new.vue`

In the Documents `v-window-item`, add two `v-overline` (or `text-overline` class div) separators:
- **"FILES"** — above the Documents section divider
- **"LINKS"** — above the External Links section divider
- Images section sits visually within the FILES block (no separate overline needed)

```vue
<!-- Above Documents divider -->
<div class="text-overline text-medium-emphasis mb-1">FILES</div>

<!-- Above External Links divider -->
<div class="text-overline text-medium-emphasis mb-1 mt-4">LINKS</div>
```

**Step JQ-B-3:** Apply same overline headers to `edit-[id].vue` Documents tab at the same relative positions.

---

### Sub-Phase JQ-C — Document Delete (Backend + Frontend)

**Risk:** Medium — new service method + controller route + frontend reactive state additions. Follow backend-first pattern: implement and Postman-verify backend before touching frontend.

#### JQ-C-1: Backend — Service Method

**File:** `pmo-backend/src/construction-projects/construction-projects.service.ts`

Add after `listProjectDocuments()` (line ~1138):

```typescript
async removeDocument(projectId: string, docId: string): Promise<void> {
  const doc = await this.documentRepo.findOne({
    id: docId,
    documentableType: 'CONSTRUCTION_PROJECT',
    documentableId: projectId,
  });
  if (!doc) {
    throw new NotFoundException(`Document ${docId} not found for project ${projectId}`);
  }
  await this.em.removeAndFlush(doc);
}
```

#### JQ-C-2: Backend — Controller Route

**File:** `pmo-backend/src/construction-projects/construction-projects.controller.ts`

Add after the `POST :id/documents` route:

```typescript
@Delete(':id/documents/:docId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPERADMIN)
@HttpCode(204)
async removeDocument(
  @Param('id') id: string,
  @Param('docId') docId: string,
): Promise<void> {
  await this.constructionProjectsService.removeDocument(id, docId);
}
```

#### JQ-C-3: Backend — Postman Verification Gate

**VERIFY before proceeding to JQ-C-4:**
- `DELETE /api/construction-projects/:id/documents/:docId` with valid IDs → 204 No Content ✅
- Same call with wrong `docId` (not belonging to project) → 404 Not Found ✅
- Same call with non-existent `projectId` → 404 Not Found ✅

#### JQ-C-4: Frontend — Existing Gallery List in `edit-[id].vue`

Add `existingGallery` reactive state and `fetchGallery()` fetch alongside the existing `existingDocs` fetch:

```typescript
const existingGallery = ref<Array<{ id: string; url: string; caption?: string }>>([])

async function fetchGallery() {
  try {
    const res = await api.get(`/construction-projects/${projectId}/gallery`)
    existingGallery.value = res.data
  } catch {
    // non-fatal — gallery may be empty
  }
}
```

Call `fetchGallery()` inside `onMounted()` alongside the existing `fetchProject()` call.

In the Images section of the Documents tab, add a list of existing gallery items above the new-upload area:

```vue
<template v-if="existingGallery.length">
  <div class="text-overline text-medium-emphasis mb-1">Existing Gallery Images</div>
  <v-list density="compact">
    <v-list-item
      v-for="img in existingGallery"
      :key="img.id"
      :subtitle="img.caption || 'No caption'"
    >
      <template #prepend>
        <v-icon color="primary">mdi-image</v-icon>
      </template>
      <template #append>
        <v-btn
          icon="mdi-delete"
          size="small"
          variant="text"
          color="error"
          :loading="deletingGallery[img.id]"
          @click="deleteGalleryItem(img.id)"
        />
      </template>
    </v-list-item>
  </v-list>
  <v-divider class="my-2" />
</template>
```

Add `deletingGallery` ref and `deleteGalleryItem()` function:

```typescript
const deletingGallery = ref<Record<string, boolean>>({})

async function deleteGalleryItem(galleryId: string) {
  deletingGallery.value[galleryId] = true
  try {
    await api.del(`/construction-projects/${projectId}/gallery/${galleryId}`)
    existingGallery.value = existingGallery.value.filter(img => img.id !== galleryId)
  } catch {
    // show snackbar error if present
  } finally {
    deletingGallery.value[galleryId] = false
  }
}
```

#### JQ-C-5: Frontend — Document Delete Buttons in `edit-[id].vue`

In the existing `existingDocs` list (Documents section), add a delete button to each list item's `#append` slot. Distinguish documents from links by type field (documents have no `url` property starting with `http` or have `type: 'document'`; links are `type: 'link'`):

```vue
<template #append>
  <v-btn
    icon="mdi-delete"
    size="small"
    variant="text"
    color="error"
    :loading="deletingDoc[doc.id]"
    @click="deleteDocument(doc.id)"
  />
</template>
```

Add `deletingDoc` ref and `deleteDocument()` function:

```typescript
const deletingDoc = ref<Record<string, boolean>>({})

async function deleteDocument(docId: string) {
  deletingDoc.value[docId] = true
  try {
    await api.del(`/construction-projects/${projectId}/documents/${docId}`)
    existingDocs.value = existingDocs.value.filter(d => d.id !== docId)
  } catch {
    // show snackbar error if present
  } finally {
    deletingDoc.value[docId] = false
  }
}
```

---

### Sub-Phase JQ-D — Pending Review KPI Card (COI Index)

**Scope:** `pmo-frontend/pages/coi/index.vue`
**Risk:** Very Low — `stats.pendingReview` already computed; template-only addition

**Open Question (operator decision required before JQ-D implementation):**
> Should the new "Pending Review" KPI card **replace** the "Avg. Progress" card (keep 4 cards), or should it be **added** as a 5th card (requires reducing `v-col` widths from `cols="3"` to `cols` auto or custom breakpoints)?

**Step JQ-D-1 (after operator decision):**

Option A — Replace Avg. Progress (4 cards, no layout change):

```vue
<!-- Replace existing Avg. Progress card with: -->
<v-col cols="3">
  <v-card color="warning" variant="tonal" class="pa-4 d-flex align-center ga-3">
    <v-icon size="36" color="warning">mdi-clock-outline</v-icon>
    <div>
      <div class="text-caption text-medium-emphasis">Pending Review</div>
      <div class="text-h6 font-weight-bold">{{ stats.pendingReview }}</div>
    </div>
  </v-card>
</v-col>
```

Option B — Add 5th card (adjust column widths):

Change existing 4× `v-col cols="3"` to `v-col cols="12" sm="6" md=""` with appropriate breakpoints, then add the Pending Review card as a 5th entry.

---

### Phase JQ Verification Checklist

| ID | Test | Status |
|----|------|--------|
| JQ-V1 | Both Create and Edit forms show "Attachments" tab label; internal `value="documents"` unchanged; tab navigation still works | ⬜ |
| JQ-V2 | Edit form divider labels match Create form exactly: "Documents" / "Images" / "External Links"; overline "FILES" and "LINKS" labels visible in both forms | ⬜ |
| JQ-V3 | `DELETE /api/construction-projects/:id/documents/:docId` → 204 for valid doc; 404 for wrong projectId or docId (Postman verified) | ⬜ |
| JQ-V4 | Edit form shows existing gallery images list; clicking delete removes gallery item immediately from list; `DELETE :id/gallery/:galleryId` fires correctly | ⬜ |
| JQ-V5 | Edit form shows delete button on existing documents/links; clicking delete removes item immediately; `DELETE :id/documents/:docId` fires correctly | ⬜ |
| JQ-V6 | COI index shows Pending Review KPI card (warning/amber, `mdi-clipboard-clock`) with correct count; no regression on other 3 KPI cards or table display | ✅ |

---

## Phase JR — Profile Page Redesign + External Link Generalization + Create/Edit/Profile Consistency

**Status:** ⬜ PENDING
**Research Reference:** Section 2.131
**Baseline:** JQ-D ✅. JQ-A/JQ-B/JQ-C pending. Detail-[id].vue confirmed 1143-line flat layout. `DRIVE_URL_REGEX` restricts links to Google domains — must be generalized. Profile page `assignedUsers[]` not displayed.
**Sub-phases:** JR-A → JR-B → JR-C (ordered lowest risk → highest risk; JR-B depends on JQ-C backend endpoint)
**Execution order (full):** JQ-A → JQ-B → JR-A → JQ-C (backend + Postman) → JQ-C frontend → JR-B → JR-C

---

### Governance Directives (Phase JR)

| ID | Directive |
|----|-----------|
| JR-D1 | `detail-[id].vue` must NOT use `tabRequired` or navigation gating — profile tabs are read-only and freely navigable. |
| JR-D2 | External link regex replacement must be identical across all three files (`new.vue`, `edit-[id].vue`, `detail-[id].vue`) — no per-file divergence. |
| JR-D3 | Document delete on `detail-[id].vue` (JR-B) reuses the same `DELETE :id/documents/:docId` endpoint added in JQ-C. JR-B document delete MUST NOT proceed until JQ-C-3 (Postman gate) is verified. |
| JR-D4 | Assigned users display in JR-A must render `project.assignedUsers[]` (array from `adaptProjectDetail`). Show `delegatedToName` separately only if it differs from the assigned users list. Never hide the section if `assignedUsers` is populated. |
| JR-D5 | Gallery upload on `detail-[id].vue` remains in the Attachments tab after JR-B. Do not move upload logic — only restructure surrounding layout. |
| JR-D6 | Public profile page (`public/detail-[id].vue`) is out of JR scope — it uses different endpoints and access rules. Do not modify it. |
| JR-D7 | Card title icon pattern for JR-B: `<v-card-title class="d-flex align-center ga-2"><v-icon icon="mdi-..." size="small" />Title</v-card-title>` — consistent with existing `Approval History` card style. |

---

### Sub-Phase JR-A — Profile Page: Atomic Fixes (Rename + Link + Assigned Users)

**Scope:** `pmo-frontend/pages/coi/detail-[id].vue`
**Risk:** Low — targeted replacements, no structural change

#### JR-A-1: Rename "Documents & Attachments" → "Attachments"

```
Find (line ~747):    Documents &amp; Attachments
Replace with:        Attachments
```

#### JR-A-2: Rename "Add Google Drive Link" dialog → "Add External Link"

```
Find (line ~866):    Add Google Drive Link
Replace with:        Add External Link
```

#### JR-A-3: Update dialog description text

```
Find (line ~871):    For files larger than 20MB, paste a shareable Google Drive link here.
Replace with:        Add a link to any external resource (Google Drive, SharePoint, website, etc.)
```

#### JR-A-4: Update "Add Drive Link" button

```
Find (line ~764):    color="info"  ...  prepend-icon="mdi-google-drive"  ...  Add Drive Link
Replace:             color="secondary"  ...  prepend-icon="mdi-link"  ...  Add Link
```

#### JR-A-5: Replace DRIVE_URL_REGEX with general URL validation

```typescript
// Find (line ~293):
const DRIVE_URL_REGEX = /^https?:\/\/(drive|docs)\.google\.com\//i

// Replace with:
const EXTERNAL_URL_REGEX = /^https?:\/\/.+/i
```

Update all usages of `DRIVE_URL_REGEX` to `EXTERNAL_URL_REGEX`. Update error message:
```
Find:    'Must be a Google Drive URL'
Replace: 'Must be a valid URL starting with https://'
```

Update placeholder and hint:
```
Find:    placeholder="https://drive.google.com/file/d/..."
Replace: placeholder="https://..."

Find:    'Please enter a valid Google Drive URL (drive.google.com or docs.google.com)'
Replace: 'Please enter a valid URL (must start with https://)'
```

#### JR-A-6: Fix Assigned Staff/Personnel section

Current: shows `delegatedToName` only (card hidden if falsy). Target: show full `assignedUsers[]` list.

Replace the current assigned staff `v-card` block (lines ~976–988):

```vue
<v-card v-if="project.assignedUsers?.length || project.delegatedToName" class="mb-4">
  <v-card-title class="d-flex align-center ga-2">
    <v-icon icon="mdi-account-group" size="small" />
    Assigned Personnel
  </v-card-title>
  <v-divider />
  <v-list density="compact">
    <v-list-item
      v-for="user in project.assignedUsers"
      :key="user.id"
    >
      <template #prepend>
        <v-icon icon="mdi-account-check" />
      </template>
      <v-list-item-title>{{ user.name }}</v-list-item-title>
      <v-list-item-subtitle>Assigned Staff</v-list-item-subtitle>
    </v-list-item>
    <v-list-item v-if="project.delegatedToName">
      <template #prepend>
        <v-icon icon="mdi-account-arrow-right" />
      </template>
      <v-list-item-title>{{ project.delegatedToName }}</v-list-item-title>
      <v-list-item-subtitle>Delegated To</v-list-item-subtitle>
    </v-list-item>
  </v-list>
</v-card>
```

---

### Sub-Phase JR-B — Profile Page: Tab-Based Structural Redesign

**Scope:** `pmo-frontend/pages/coi/detail-[id].vue`
**Risk:** Medium-High — full template restructure (script logic preserved; only template reorganized into tabs)
**Dependency:** JR-A must be complete first. JQ-C-3 (Postman verified) required before adding document delete buttons here.

**Target tab structure (6 tabs, mirrors Create/Edit):**

| Tab Value | Label | Content |
|-----------|-------|---------|
| `overview` | Overview | Status/Progress header card + Project Information (desc, image, objectives, key features) + Financial Records sidebar + Approval History |
| `location` | Location & Physical | Campus, Geolocation, Building Details (type, floors, floor area, subcategory), Beneficiaries |
| `contractor` | Contractor & Funding | Contractor & Fund Source |
| `timeline` | Timeline & Milestones | Milestones `v-data-table` |
| `personnel` | Personnel & Scope | Assigned Personnel (JR-A-6 output) + Project Engineer + Project Manager |
| `attachments` | Attachments | Gallery section (with upload if canEdit) + FILES overline + documents list (with delete if canEdit) + LINKS overline + links list (with add/delete if canEdit) |

**Tab component pattern:**

```vue
<v-tabs v-model="activeTab" color="primary" class="mb-4">
  <v-tab value="overview">
    <v-icon start icon="mdi-information-outline" />Overview
  </v-tab>
  <v-tab value="location">
    <v-icon start icon="mdi-map-marker" />Location & Physical
  </v-tab>
  <v-tab value="contractor">
    <v-icon start icon="mdi-account-hard-hat" />Contractor & Funding
  </v-tab>
  <v-tab value="timeline">
    <v-icon start icon="mdi-calendar-clock" />Timeline
  </v-tab>
  <v-tab value="personnel">
    <v-icon start icon="mdi-account-group" />Personnel
  </v-tab>
  <v-tab value="attachments">
    <v-icon start icon="mdi-paperclip" />Attachments
  </v-tab>
</v-tabs>

<v-window v-model="activeTab">
  <v-window-item value="overview"> ... </v-window-item>
  <v-window-item value="location"> ... </v-window-item>
  <!-- etc. -->
</v-window>
```

Add `const activeTab = ref('overview')` in `<script setup>`.

**Document delete in Attachments tab (after JQ-C-3 Postman gate):**

Reuse same `deletingDoc` + `deleteDocument()` pattern from JQ-C-5. Delete button on each document list item in `#append` slot. Gallery delete reuses `deleteGalleryItem()` via existing `DELETE :id/gallery/:galleryId` (already exists).

---

### Sub-Phase JR-C — External Link Generalization: Create + Edit Forms

**Scope:** `pmo-frontend/pages/coi/new.vue` and `pmo-frontend/pages/coi/edit-[id].vue`
**Risk:** Low — same pattern as JR-A-2 through JR-A-5, applied to the other two files
**Dependency:** JR-A must be complete to confirm the general pattern works end-to-end before applying to Create/Edit

**Step JR-C-1 — `new.vue`:**
- Find Drive-specific hint text in the External Links section of the Documents tab
- Replace with: "Add a link to any external resource (Google Drive, SharePoint, website, etc.)"
- Replace Drive-specific URL validation with: `/^https?:\/\/.+/i`
- Update placeholder to `https://...`

**Step JR-C-2 — `edit-[id].vue`:**
- Same replacements as JR-C-1

---

### Phase JR Verification Checklist

| ID | Test | Status |
|----|------|--------|
| JR-V1 | Profile page card title shows "Attachments"; "Add Link" button uses `mdi-link` icon; Google Drive validation removed; any `https://` URL accepted | ⬜ |
| JR-V2 | Profile page Assigned Personnel card shows all `assignedUsers[]` entries; "Delegated To" entry shown only if present | ⬜ |
| JR-V3 | Profile page renders 6-tab structure: Overview / Location & Physical / Contractor & Funding / Timeline / Personnel / Attachments; tab switching works without page reload | ⬜ |
| JR-V4 | Attachments tab shows Gallery + FILES (documents with delete) + LINKS (links with add/delete); document delete fires `DELETE :id/documents/:docId` → item removed from list | ⬜ |
| JR-V5 | Create and Edit forms accept any `https://` URL in the External Links section; Drive-specific error messages replaced; no regression on file upload or form submission | ⬜ |

---

