# [Active Plan] PMO Dashboard — COI Module Development
> **Governance:** ACE v2.4
> **Phase:** JA ✅ | JB ✅ (⏸ runtime smoke) | JC ✅ | JD ✅ (⏸ JD-V5 deploy-gated) | JE ✅ (⏸ runtime smoke) | JF ✅ (⏸ runtime smoke) | JG ✅ (⏸ runtime smoke) | JH-A ✅ IMPLEMENTED (⏸ migration + runtime smoke) | **JI ✅ CODE CHANGES DONE (⏸ npm install + migration:up)**
> **Last Updated:** 2026-04-30
> **Archive:** `docs/plan_Artifact_April_2026.md` (full history) | `docs/archive/` (pre-JA phases)
> **Research Reference:** `research.md` Architecture Reference + Sections 2.115–2.122

---

## GOVERNANCE DIRECTIVES

All 122 directives (1–122) established across Phases D–HI are **✅ COMPLETE** — see archive.

**COI-specific directives (Phase JB):**

| # | Directive | Status |
|---|-----------|--------|
| JB-D1 | Backend route `/api/construction-projects` is IMMUTABLE. Public endpoint uses NEW path `/api/public/construction-projects` via separate controller. | ✅ |
| JB-D2 | Display label "Infrastructure Projects" preserved. Frontend heading text unchanged. | ✅ |
| JB-D3 | `pmo-frontend/utils/adapters.ts` is the ONLY place frontend type interfaces are defined. | ✅ |
| JB-D4 | `ConstructionProjectFinancial` entity columns (`appropriation`, `obligation`, `disbursement`, `fiscal_year`) are the authoritative schema. | ✅ |
| JB-D5 | `ConstructionMilestone.title` maps to frontend. Fields `weight_percentage` and `progress_percentage` do NOT exist — removed from adapter. | ✅ |
| JB-D6 | Gallery data fetched separately via `GET /api/construction-projects/:id/gallery` — NOT embedded in `findOne`. | ✅ |
| JB-D7 | Public controller at `public-construction.controller.ts`, registered in `ConstructionProjectsModule`. No separate module. | ✅ |
| JB-D8 | Public endpoint uses `@Public()` decorator — no `JwtAuthGuard` or `RolesGuard`. | ✅ |
| JB-D9 | KPI stats computed client-side from `findAll` list response (count + reduce). | ✅ |
| JB-D10 | No new database migrations in JB. All required columns exist. | ✅ |
| JB-D11 | No new database migrations in JB. | ✅ |
| JB-D12 | Public pages at `/coi/public/` have NO `auth` middleware. `definePageMeta({})` only. | ✅ |
| JB-D13 | Financial display: `utilization_rate = (obligation / appropriation) * 100`. Computed frontend. | ✅ |
| JB-D14 | Gallery upload: `Content-Type: multipart/form-data`, field name `file`, max 10MB. | ✅ |

---

## ACE ENFORCEMENT RULES

1. **Phase-Locked Execution:** Research → Plan → Implement (strict sequence, no skipping)
2. **Authorization Gates:** `RUN_ACE` or `EXECUTE_WITH_ACE` → activates. `META_DISCUSSION` → no mutations.
3. **Phase 3 Authorization:** Implementation requires explicit operator authorization before first line of code
4. **No Plan Mutation During Phase 3:** Plan frozen once implementation begins
5. **Step Verification:** Each step marked `[x]` with verification before advancing
6. **Error Handling:** If implementation fails → STOP → update plan → await operator
7. **Two Living Documents Only:** `plan.md` (execution contract) + `research.md` (research findings)
8. **Backend-First Integrity:** Data integrity enforced at backend/database. Frontend is presentation only.

---

## CONSTRAINTS

- **YAGNI:** No speculative features. Only implement what is specified.
- **KISS:** Simplest implementation path.
- **SOLID:** Single Responsibility, Open/Closed.
- **DRY:** Extract shared utilities when pattern repeats ≥ 3 times.
- **Archive, Never Delete:** Historical content moves to `docs/archive/`, never removed.
- **Hybrid ORM Enforced:** ORM for CRUD, `em.getConnection().execute()` for analytics. No new `DatabaseService` usage.
- **MCP Assistive Only:** Figma MCP = design reference, NOT implementation authority.
- **CLAUDE.md = Context Preload Only:** Not an execution contract.

---

## ENVIRONMENT CONSTRAINTS

- Windows 11, bash shell in Claude Code
- PowerShell 6+ (pwsh) NOT available — shell tool calls fail
- Builds/tests verified by operator manually, not automated
- Git remote: `https://github.com/eowork/pmoprototype.git`
- Active branches: `main`, `pmo-test1`, `refactor/page-structure-feb9`

---

## KEY FILES REFERENCE

| File | Purpose |
|------|---------|
| `pmo-backend/src/construction-projects/construction-projects.controller.ts` | COI controller — CRUD + workflow + analytics routes |
| `pmo-backend/src/construction-projects/construction-projects.service.ts` | COI service — business logic + raw SQL analytics |
| `pmo-backend/src/construction-projects/public-construction.controller.ts` | COI public controller — no auth, PUBLISHED only |
| `pmo-backend/src/construction-projects/construction-projects.module.ts` | COI module — registers both controllers |
| `pmo-frontend/pages/coi/index.vue` | COI admin index — list + KPI + filter + analytics tab |
| `pmo-frontend/pages/coi/detail-[id].vue` | COI admin detail — full detail + gallery |
| `pmo-frontend/pages/coi/public/index.vue` | COI public listing — no auth |
| `pmo-frontend/pages/coi/public/detail-[id].vue` | COI public detail — no auth |
| `pmo-frontend/utils/adapters.ts` | Frontend type adapters — single source of truth for BackendMilestone, BackendFinancial, BackendGalleryItem |
| `pmo-backend/src/auth/strategies/ldap.strategy.ts` | LDAP strategy — deployment-gated, Phase JD fix applied |
| `docs/references/postman-jb-smoke-gate.json` | JB Postman smoke gate collection |

---

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
