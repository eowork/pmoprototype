## Section 2.128 — Phase JO: ON CONFLICT vs Partial Index, Validation Gating, Inline Uploads, Edit Alignment (2026-05-02)

**Status:** Phase 1 Research Complete
**Trigger:** RUN_ACE — post-JN regression: (C) `ON CONFLICT (project_code) DO NOTHING` now throws "no unique or exclusion constraint matching the ON CONFLICT specification" → 500. (A1) Tab checkmarks appear on schedule/progress/personnel even when fields are empty (per JN-C, was by design — operator now disagrees). (A2) Users can navigate between tabs and submit even with empty required fields. (A3) Upload functionality must be IN the Create/Edit tabs, not only post-create on detail page.
**Continuity:** Builds on Sections 2.127 (JN). The JN-A partial index migration is correct; the regression is in `service.ts:create()` which still uses bare `ON CONFLICT (project_code)` syntax. JN-D backend upload endpoint is correct and reusable; only the UX placement needs to shift.

---

### 2.128-A: STEP 4 — Backend Error Root Cause (`ON CONFLICT` ↔ Partial Index Mismatch)

**Live DB inspection post-JN:**
```
projects unique constraints:  (none — projects_project_code_key was dropped in JN-A)
projects unique indexes:
  projects_project_code_active_idx
  ON public.projects (project_code) WHERE (deleted_at IS NULL)   ← partial index
```

**Failing query (JL-1, lines 367–371 of `service.ts`):**
```sql
INSERT INTO projects (...)
VALUES (...)
ON CONFLICT (project_code) DO NOTHING
RETURNING id;
```

**Error:** `ERROR: there is no unique or exclusion constraint matching the ON CONFLICT specification`

**Root cause: PostgreSQL inference rules for `ON CONFLICT`.**

PostgreSQL requires `ON CONFLICT (column_list)` to **infer a unique index**. For a partial unique index (one with a `WHERE` predicate), the inference rules require the **same predicate** to be specified in the `ON CONFLICT` clause:

> "An index_predicate ... is used to allow inference of partial unique indexes."  
> *(PostgreSQL docs, INSERT statement)*

Bare `ON CONFLICT (project_code)` only matches an unrestricted unique index/constraint on `project_code`. Since JN-A dropped the unrestricted constraint and replaced it with a partial index `WHERE deleted_at IS NULL`, the bare ON CONFLICT cannot find any matching arbiter index → error.

**Fix (planned, not implemented):** add the partial-index predicate to the ON CONFLICT clause:
```sql
ON CONFLICT (project_code) WHERE (deleted_at IS NULL) DO NOTHING
```

This explicitly matches the partial index by predicate, restoring the atomic conflict-detection semantics from JL-1 while preserving JN-A's soft-delete behavior.

**Layer responsible: Service code (`service.ts:367–371`).** NOT the migration. NOT the entity. The migration is correct; the SQL needs to be updated to match the new index shape.

**Why this regressed:** JL-1 was written against the plain UNIQUE constraint; JN-A converted that constraint to a partial index without updating the SQL that depends on it. Cross-phase dependency missed.

---

### 2.128-B: STEP 1 — Tab Validation Root Cause (Semantic Mismatch in `tabCompletion`)

**Live code (`new.vue:96–102`):**
```typescript
const tabCompletion = computed(() => ({
  basic: !!(form.value.project_code && form.value.title && form.value.campus && form.value.status),
  contract: !!(form.value.funding_source_id),
  schedule: true,        // hardcoded
  progress: true,        // hardcoded
  personnel: true,       // hardcoded
}))
```

**Root cause: design decision in JJ-D conflicts with operator expectation.**

JJ-D treated tabs with no required fields as "always complete by definition" (zero of zero required = 100%). Operator expectation: "checkmark indicates user has FILLED the tab, not that the tab has zero requirements."

These are two valid interpretations of "completion":
1. **Validity completion**: required fields valid → tab is acceptable for submit (current JJ-D semantic)
2. **Engagement completion**: user has provided at least one value in this tab (operator expectation)

**Decision:** Adopt **engagement completion** for optional-only tabs, **validity completion** for required-field tabs:
- `basic` / `contract` (have required fields) → checkmark when all required fields valid (unchanged)
- `schedule` / `progress` / `personnel` (no required fields) → checkmark when at least one optional field has a value

This satisfies the operator's "checkmark must reflect actually filled tabs" requirement while preserving the existing required-field gate.

**Layer responsible: Frontend computed (`new.vue` script, single computed block).** No backend, no DTO change.

---

### 2.128-C: STEP 2 — Navigation Control Root Cause (Unguarded `nextTab()`)

**Live code (`new.vue:104–112`):**
```typescript
function nextTab() {
  const idx = tabOrder.indexOf(activeTab.value as typeof tabOrder[number])
  if (idx < tabOrder.length - 1) activeTab.value = tabOrder[idx + 1]
}
```

**Root cause: no validation gate before advancing.** `nextTab()` blindly increments index. The Submit button on the final tab also fires regardless of whether basic/contract required fields are valid — backend will reject, but the user wastes a round-trip and sees a generic toast.

**Required validation model:**

| Action | Gate | Fail behavior |
|---|------|--------------|
| `nextTab()` from tab N | `tabRequired(tabOrder[N])` must be true | Toast: "Please complete required fields in [N] before continuing" + scroll/focus first invalid field |
| Direct tab click (v-tabs) | None — allow free navigation backward and forward (UX) | n/a |
| Submit (final tab) | All `tabRequired` must be true | Toast: "Required fields incomplete in: [list]" + jump to first invalid tab |

`tabRequired` is a NEW computed separate from `tabCompletion`:
- `tabRequired.basic` = same as current `tabCompletion.basic` (4 required fields)
- `tabRequired.contract` = same as current `tabCompletion.contract` (1 required field)
- `tabRequired.schedule/progress/personnel` = `true` (no required fields)

This separation means: `tabCompletion` shows engagement (checkmark visibility), `tabRequired` shows validity (navigation gate). Two distinct concerns, two computeds.

**Layer responsible: Frontend logic (script + Submit handler in `new.vue`).**

---

### 2.128-D: STEP 3 — Inline Upload System on Create + Edit Forms

**Backend infrastructure (verified, JN-D):** ✅ ready.
- `POST /api/construction-projects/:id/documents` (multipart, 20MB)
- `POST /api/construction-projects/:id/gallery` (multipart, 10MB, images)
- Document entity polymorphic
- Drive link variant: JSON body with `externalLink`

**The challenge: Create form has NO project ID until after submit.** Two solutions:

| Option | Description | Complexity | Recommendation |
|---|---|---|---|
| **(a) Two-stage submit** | (1) submit project metadata → 201 with id; (2) loop staged files, POST each to `/:id/documents` and `/:id/gallery`; (3) redirect to detail | Medium — needs file staging in form state, sequential upload progress, error handling per file | ✅ **PREFERRED** |
| (b) Multipart create endpoint | Backend `POST /api/construction-projects` accepts `multipart/form-data` with files + JSON metadata in single request | High — significant backend refactor; conflicts with DTO validation pipeline | ❌ Reject |
| (c) Tab disabled until first save | Documents tab shows "Save first to upload files" | Low — but breaks unified-form UX operator wants | ❌ Reject |

**Decision: Option (a) — two-stage submit, fully transparent to user via progress dialog.**

**UX flow:**

1. Form gets a NEW 6th tab "Documents & Files" (added after Personnel)
2. Tab contains three pickers: file upload (≤20MB), image gallery upload (≤10MB), Drive link input (regex validated)
3. Files are staged in three reactive arrays: `pendingDocs[]`, `pendingImages[]`, `pendingLinks[]`
4. On submit: POST project metadata → get ID → if any pending uploads, show modal "Uploading files..." with progress (n of m); POST each upload sequentially to the new project ID; on completion, redirect to `/coi/detail-${id}`
5. Per-file failure: continue with remaining; show final summary (X succeeded, Y failed, retry from detail page)

**Edit form integration:**
- Same 6th tab present
- "Existing documents" list at top (fetched from `GET /:id/documents`); allow delete/preview
- "Existing gallery" list (fetched from `GET /:id/gallery`)
- "Add new" pickers below (same as create); upload immediately to existing project ID (no staging needed since ID exists)

**Tab structure update:**

| Old (5 tabs) | New (6 tabs) |
|---|---|
| basic | basic |
| contract | contract |
| schedule | schedule |
| progress | progress |
| personnel | personnel |
| — | **documents** ← NEW |

`tabOrder`, `tabCompletion`, `tabRequired` all gain a new `documents` key.

**Layer responsible: Frontend (new.vue + edit-[id].vue) + minor: backend list/delete document endpoints (only if not present).**

Backend GET `/:id/documents` exists (JN-D). Need to verify DELETE document endpoint exists; if not, add it.

---

### 2.128-E: STEP 5 — Edit Form Alignment with Create Form

**Audit needed:** does `edit-[id].vue` use the new tabbed structure (post-JJ-D) or the legacy card-section layout?

Per recall from JJ-D plan, the restructure was applied to `new.vue` only. `edit-[id].vue` retains its older card-section layout.

**Required alignment:**
1. Same 6 tabs (basic/contract/schedule/progress/personnel/documents)
2. Same step progress bar (JN-B style)
3. Same checkmark logic (tabCompletion)
4. Same navigation gating (tabRequired) — but note: edit usually doesn't need re-validation (existing data already passes; gate only blocks if user CLEARS a required field)
5. Same `mapApiError()` handler (JJ-C, already present in edit)
6. Pre-fill from `BackendProjectDetail` adapter (already done — verified Section 2.123)
7. Documents tab: pre-loaded existing files + add new

**Layer responsible: Frontend (`edit-[id].vue` template + script).**

---

### 2.128-F: STEP 6 — Resolution Strategy (Plan, no implementation)

**Sub-phase JO-A — Backend ON CONFLICT Fix [BLOCKER]**

Single SQL change in `service.ts:367–371`:
```diff
- ON CONFLICT (project_code) DO NOTHING
+ ON CONFLICT (project_code) WHERE (deleted_at IS NULL) DO NOTHING
```

Add a comment explaining the predicate must mirror the partial index from migration `Migration20260502071146_PartialUniqueProjectCode`.

**Sub-phase JO-B — Tab Completion Semantic Update**

Replace hardcoded `true` for schedule/progress/personnel in `tabCompletion`:
```typescript
const tabCompletion = computed(() => ({
  basic: !!(form.value.project_code && form.value.title && form.value.campus && form.value.status),
  contract: !!(form.value.funding_source_id),
  schedule: !!(form.value.start_date || form.value.target_completion_date || form.value.actual_completion_date || form.value.project_duration || form.value.original_contract_duration),
  progress: !!(form.value.target_physical_progress !== 100 || form.value.target_financial_progress !== 100 || form.value.building_type || form.value.floor_area || form.value.number_of_floors || form.value.latitude || form.value.longitude),
  personnel: !!(form.value.project_engineer || form.value.project_manager || (form.value.assigned_user_ids && form.value.assigned_user_ids.length > 0)),
}))
```

Add NEW `tabRequired` computed for navigation gating (only basic + contract have requirements; rest always pass):
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

**Sub-phase JO-C — Navigation Gating**

Update `nextTab()` to check `tabRequired[currentTab]` before advancing:
```typescript
function nextTab() {
  const cur = activeTab.value as typeof tabOrder[number]
  if (!tabRequired.value[cur]) {
    toast.error(`Please complete required fields in "${cur}" before continuing`)
    return
  }
  // ... advance ...
}
```

Update `handleSubmit()` to check ALL `tabRequired` values; if any false, jump to first failing tab + toast.

**Sub-phase JO-D — Documents Tab on Create Form (Two-Stage Submit)**

| Step | Action |
|---|---|
| D1 | Add `pendingDocs`, `pendingImages`, `pendingLinks` reactive arrays + 6th tab `documents` in `new.vue` template |
| D2 | Add `tabOrder` includes `'documents'`; checkmark/required entries added |
| D3 | `handleSubmit()` two-stage: POST project → loop pendingDocs (`POST /:id/documents` multipart) → loop pendingImages (`POST /:id/gallery` multipart) → loop pendingLinks (`POST /:id/documents` JSON body) → progress dialog → redirect |
| D4 | Per-file error: continue, accumulate failures, show summary toast at end |

**Sub-phase JO-E — Edit Form Alignment + Inline Uploads**

| Step | Action |
|---|---|
| E1 | Restructure `edit-[id].vue` template to mirror `new.vue` 6-tab layout |
| E2 | Reuse `tabCompletion`, `tabRequired`, `nextTab`, `prevTab`, `mapApiError` patterns |
| E3 | Documents tab pre-loads existing docs + gallery via `GET /:id/documents` and `GET /:id/gallery` |
| E4 | Inline upload directly to existing project ID (no staging) |
| E5 | Add DELETE document endpoint if absent (`DELETE /api/construction-projects/:id/documents/:docId`) |

---

### 2.128-G: STEP 7 — Priority Decision

**Decision: JO-A → JO-B + JO-C → JO-D → JO-E (strict)**

| Order | Sub-phase | Justification |
|-------|-----------|--------------|
| 1 | **JO-A** | HARD BLOCKER — every COI create currently 500s. One-line SQL fix. Must restart backend. |
| 2 | **JO-B + JO-C** | Validation correctness — prevents users from being misled by false checkmarks and from skipping required fields. Quick frontend changes. Both touch `new.vue` script; logical to bundle. |
| 3 | **JO-D** | Inline documents tab on create form — feature addition, two-stage submit complexity. Build on top of stable validation. |
| 4 | **JO-E** | Edit form alignment + inline uploads — largest scope (full restructure of edit-[id].vue). Build last so JO-D patterns can be replicated. |

**Risk constraint:** JO-A MUST be deployed (backend restart) before any UI testing of JO-B/C/D/E — without JO-A, no project can be created at all, so no UI flow can be exercised end-to-end.

---

## Section 2.127 — Phase JN: Soft-Delete Constraint, Step Progress, Tab Checkmarks, Upload System (2026-05-02)

**Status:** Phase 1 Research Complete
**Trigger:** RUN_ACE — post-JM, COI Create works for fresh codes but four defects remain: (A) historical codes still 409 even after soft-delete; (B) no step progress indicator; (C) tab checkmarks inconsistent; (D) MOV/attachment/Google Drive upload incomplete.
**Continuity:** Builds directly on Sections 2.123–2.126. The JL-1 ON CONFLICT logic remains correct. The constraint-design issue uncovered here was previously masked by the orphan symptom — after JM-B soft-deleted the orphans, the deeper defect surfaced.

---

### 2.127-A: STEP 1 — Duplicate Project Code Root Cause (DEFINITIVE)

**Live DB inspection (2026-05-02 post-JM):**

```
projects table (incl. soft-deleted):
| project_code | project_type   | deleted_at                    | created_at                    |
| CP-2026-051  | CONSTRUCTION   | 2026-05-02T06:39:37.833Z      | 2026-05-02T01:01:11.042Z      |
| CP-2026-052  | CONSTRUCTION   | 2026-05-02T06:39:37.833Z      | 2026-05-02T05:03:38.300Z      |

construction_projects: (empty)

Constraint: projects_project_code_key  →  UNIQUE (project_code)
```

**Root cause: schema design defect.** The `projects.project_code` UNIQUE constraint is a **plain unique constraint** — NOT a partial unique index that excludes soft-deleted rows. PostgreSQL UNIQUE constraints enforce uniqueness across **every** row in the table, including rows where `deleted_at IS NOT NULL`.

**Why CP-2026-053 works but CP-2026-051/052 do not:**
- CP-2026-053 has no historical row at all → unique slot is genuinely free → INSERT succeeds
- CP-2026-051/052 have soft-deleted rows still occupying their unique slots → ON CONFLICT (project_code) DO NOTHING fires → 0 rows returned → JL-1 correctly throws 409

**The 409 is technically correct given the current constraint, but operationally wrong** — the application's soft-delete contract implies "deleted rows free up the unique slot for re-use", but the DB schema does NOT honor that contract.

**Layer responsible: Database schema (DDL).** Not code. Not validation. Not caching. The JL-1 ON CONFLICT check is doing exactly what it was designed to do.

**Why frontend caching / backend state are NOT the cause:**
- No backend in-memory cache of project codes exists (verified by reading `service.ts`)
- Frontend does not pre-cache validation; each submit hits POST `/api/construction-projects`
- The check that fires is the DB constraint itself, not an application-level memo

**Fix strategy (planned, not implemented):**
- Drop the plain UNIQUE constraint
- Add a **partial unique index**: `CREATE UNIQUE INDEX projects_project_code_active_idx ON projects (project_code) WHERE deleted_at IS NULL`
- Apply via MikroORM migration class (per JI-D2 directive — no new files in `database/migrations/`)
- After migration: soft-deleted rows free up their codes for re-use; live rows still enforce uniqueness

**Side-effect audit (extension tables):**

| Table | Has `project_code` UNIQUE? | Action |
|---|---|---|
| `construction_projects.project_code` | ✅ UNIQUE constraint exists (entity line 16) | Same fix needed — partial index for consistency |
| `projects.project_code` | ✅ UNIQUE constraint | Primary fix |

Both tables need the partial-index treatment to fully honor soft-delete semantics.

---

### 2.127-B: STEP 2 — Step Progress System Analysis (Missing UI Component)

**Current state (`pmo-frontend/pages/coi/new.vue`):**
- 5 v-tabs: basic / contract / schedule / progress / personnel
- v-window switches content
- Prev/Next buttons advance through tabs
- **No visual indicator of "step X of Y"**
- **No completion-percentage progress bar**

**Required step model:**

| Step | Tab | Required Fields | Optional Fields |
|------|-----|----------------|----------------|
| 1 | basic | project_code, title, campus, status | description, ideal_image, objectives, key_features, beneficiaries |
| 2 | contract | funding_source_id | contractor_id, contract_number, contract_amount |
| 3 | schedule | (none) | all 5 date/duration fields |
| 4 | progress | (none — defaults provided) | target_physical/financial_progress, building_type, floor_area, lat/lng |
| 5 | personnel | (none) | engineer, manager, assigned_user_ids |

**Logical model:**
- Total required fields across all tabs: **5** (project_code, title, campus, status, funding_source_id)
- Per-tab "required complete" boolean: already in `tabCompletion` computed
- Overall progress %: count of completed tabs / total tabs (5) — gives rough sense of progress
- Step indicator: current step index + 1 of 5

**Dependencies between steps:** None hard. User can submit from step 5 even if intermediate optional fields are blank. Required fields (basic + contract) MUST be filled before submit succeeds — backend rejects otherwise.

**Recommended UI: v-progress-linear above tabs + step counter chip.** No need for full v-stepper (heavyweight component; tabs already serve navigation).

---

### 2.127-C: STEP 3 — Tab Completion Checkmark Inconsistency

**Live code (`new.vue` lines 96–102 + 238–259):**

`tabCompletion` computed:
```typescript
const tabCompletion = computed(() => ({
  basic: !!(form.value.project_code && form.value.title && form.value.campus && form.value.status),
  contract: !!(form.value.funding_source_id),
  schedule: true,        // hardcoded — no required fields
  progress: true,
  personnel: true,
}))
```

v-tab templates (only basic + contract have the checkmark icon):
```html
<v-tab value="basic">
  <v-icon v-if="tabCompletion.basic" end color="success" size="small">mdi-check-circle</v-icon>
</v-tab>
<v-tab value="contract">
  <v-icon v-if="tabCompletion.contract" end color="success" size="small">mdi-check-circle</v-icon>
</v-tab>
<v-tab value="schedule"> <!-- NO checkmark icon defined here --> </v-tab>
<v-tab value="progress"> <!-- NO checkmark icon defined here --> </v-tab>
<v-tab value="personnel"> <!-- NO checkmark icon defined here --> </v-tab>
```

**Root cause:** Two distinct issues conflated:
1. The CHECKMARK ICON ELEMENT is missing from the schedule/progress/personnel `<v-tab>` templates (template defect)
2. The COMPLETION SEMANTIC for "tabs with no required fields" is ambiguous — should they auto-show "complete" (always green check), or should they reflect "visited" state, or something else?

**Decision (per Figma + Vuetify convention):** Tabs with no required fields should be shown as "optional → considered complete by default." Adding a checkmark to schedule/progress/personnel tabs is consistent with their `tabCompletion = true` value.

**Alternative considered:** Track "visited" tabs separately. REJECTED — overcomplicates state, and the existing `true` values already imply completeness.

**Layer responsible: Frontend template (3 missing icon elements).** Not state, not logic — pure markup gap.

---

### 2.127-D: STEP 4 — Upload System Architecture Audit

**Current backend infrastructure (verified):**

| Component | Path | Status |
|---|---|---|
| `Document` entity | `entities/document.entity.ts` | ✅ Polymorphic (documentableType + documentableId), supports metadata jsonb, status field |
| `ConstructionGallery` entity | `entities/construction-gallery.entity.ts` | ✅ Used by JE gallery upload |
| `UploadsService` | `uploads/uploads.service.ts` | ✅ Generic file upload (10MB limit) |
| `UploadsController` | `POST /api/uploads` | ✅ Generic upload endpoint, stores raw file via storage adapter |
| Gallery upload | `POST /api/construction-projects/:id/gallery` | ✅ Working (Phase JE) |
| Document upload to project | `POST /api/construction-projects/:id/documents` | ❌ **DOES NOT EXIST** |
| External link (Google Drive) document | (no DTO field) | ❌ **DOES NOT EXIST** |

**Required architecture:**

| Upload Type | Method | Storage | Size Limit | Backend Endpoint |
|---|---|---|---|---|
| Document (PDF, DOCX, XLSX) | multipart/form-data | Local filesystem via UploadsService | 20 MB | NEW: `POST /api/construction-projects/:id/documents` |
| Image (gallery) | multipart/form-data | Local filesystem | 10 MB | EXISTING: `POST /api/construction-projects/:id/gallery` |
| External link (Google Drive, large files) | application/json | Document row with `documentType='link'`, `filePath=URL`, `fileSize=0` | Unlimited | NEW endpoint accepts `{ external_link: string, title: string }` body variant |

**DTO design:**
```typescript
class UploadDocumentDto {
  documentType: string;     // 'attachment' | 'mov' | 'link' | 'specification' | etc.
  description?: string;
  category?: string;
  externalLink?: string;    // populated if document is a Google Drive URL (no file body)
}
```

**Constraints:**
- File size cap (per backend): currently 10 MB for general uploads. Per requirement: docs up to 20 MB. Need: increase `FileInterceptor` limit on the new endpoint to 20 MB.
- Google Drive URL validation: regex `^https?:\/\/(drive|docs)\.google\.com\/`
- Polymorphic association: `documentableType = 'CONSTRUCTION_PROJECT'`, `documentableId = projectId`
- Authorization: same as existing project edit guard (Admin/Staff with project ownership)

**UX placement:**
- Upload functionality ON THE NEW.VUE TAB (during create) is anti-pattern — uploads need a project ID which doesn't exist until after save
- Correct UX: post-create redirect to `detail-[id].vue` with a new "Documents" section alongside the existing Gallery section
- New.vue can show an optional "Documents" tab that DEFERS (queues) uploads in the form state, then submits them after the create succeeds (multi-stage submit)
- **Recommended path: post-create uploads in detail view** (simpler, reuses existing patterns from gallery)

---

### 2.127-E: STEP 5 — Resolution Strategy (Plan, no implementation)

**Sub-phase JN-A — Schema Fix (Soft-Delete-Aware Unique Index)** [BLOCKER]

| Step | Action |
|---|---|
| A1 | Create MikroORM migration class `Migration<TS>_PartialUniqueProjectCode.ts` |
| A2 | In `up()`: `DROP CONSTRAINT projects_project_code_key`, `CREATE UNIQUE INDEX projects_project_code_active_idx ON projects (project_code) WHERE deleted_at IS NULL`. Same for `construction_projects` |
| A3 | In `down()`: reverse — drop partial index, restore plain unique constraint |
| A4 | Run `npm run migration:up`; confirm via `\d projects` and `\d construction_projects` |
| A5 | Verify: re-creating CP-2026-051 / CP-2026-052 → 201 (codes freed by soft-delete) |

**Sub-phase JN-B — Step Progress System** [UX]

| Step | Action |
|---|---|
| B1 | Add `currentStepIndex` computed: `tabOrder.indexOf(activeTab.value)` |
| B2 | Add `completionPercentage` computed: `Object.values(tabCompletion).filter(Boolean).length / tabOrder.length * 100` |
| B3 | Insert above v-tabs: a v-progress-linear bound to `completionPercentage` + a chip showing `Step {{ currentStepIndex + 1 }} of {{ tabOrder.length }}` |

**Sub-phase JN-C — Tab Checkmark Consistency** [TEMPLATE]

| Step | Action |
|---|---|
| C1 | Add `<v-icon v-if="tabCompletion.schedule" end color="success" size="small">mdi-check-circle</v-icon>` to schedule v-tab |
| C2 | Same for progress v-tab |
| C3 | Same for personnel v-tab |

**Sub-phase JN-D — Document/Attachment/Drive-Link Upload** [BACKEND + FRONTEND]

| Step | Action |
|---|---|
| D1 | Backend DTO: `CreateDocumentDto` with `documentType`, `description`, `category`, `externalLink` fields |
| D2 | Backend controller: `POST /api/construction-projects/:id/documents` — accepts multipart (file + DTO) OR JSON (DTO with externalLink) |
| D3 | Backend service: `addDocumentToProject(projectId, file or externalLink, dto, userId)` — creates `Document` row with polymorphic FK |
| D4 | Backend listing: `GET /api/construction-projects/:id/documents` |
| D5 | Backend size limit: 20 MB on FileInterceptor for this endpoint |
| D6 | Frontend: add "Documents" section in `detail-[id].vue` with three actions: Upload File / Upload Image (existing gallery) / Add Drive Link |
| D7 | Frontend: post-create success in new.vue → toast + redirect to `detail-${id}` with `?tab=documents` query to focus the section |
| D8 | Frontend Drive link validation: regex `^https?:\/\/(drive|docs)\.google\.com\/` before submit |

---

### 2.127-F: STEP 6 — Priority Decision

**Decision: JN-A → JN-C → JN-B → JN-D (strict order)**

**Justification:**

1. **System correctness (highest):** JN-A is a HARD blocker — the duplicate-code 409 is operationally wrong (violates the soft-delete contract). Until fixed, every soft-deleted code is permanently burned. Scales linearly with user error.
2. **UX trust (second):** JN-C (tab checkmarks) is a 3-line template fix that takes 5 minutes and dramatically improves user confidence ("I see I'm done with this tab"). Quick win, low risk.
3. **UX richness (third):** JN-B (step progress) is a moderate addition (computed + 2 template additions) that enhances orientation but is not blocking.
4. **Feature completion (fourth):** JN-D is the largest scope (backend endpoint + DTO + service method + frontend section). Worth doing but should not block the simpler fixes.
5. **Dependency chain:** JN-D depends on a stable create flow → JN-A must complete first. JN-C and JN-B are independent of JN-D.
6. **Cost asymmetry:** JN-A is one MikroORM migration (~15 min including test). JN-C is 3 lines. JN-B is ~10 lines. JN-D is multi-file (~100 lines).

---

## Section 2.126 — Phase JM: Schema Sync, Data Cleanup, Figma UI Alignment (2026-05-02)

**Status:** Phase 1 Research Complete
**Trigger:** RUN_ACE — JL-1 atomic ON CONFLICT fix is now active (post-restart). Two new failure modes surfaced: (1) `column "target_physical_progress" does not exist` on `construction_projects` INSERT; (2) confusion about 409 even when `construction_projects` is empty for that code. UI gap vs Figma is requested as part of stabilization checkpoint.
**Continuity:** Builds directly on Sections 2.122–2.125. Does not invalidate prior findings. The JL-1 ON CONFLICT logic IS working correctly — Issue A below explains why what looks like a bug is actually correct behavior on stale data.

---

### 2.126-A: STEP 1 — Backend Root Cause Analysis (Two Distinct Issues)

#### Issue A: 409 Conflict When `construction_projects` Has No Matching Record (NOT a bug — correct cross-module collision detection)

**Symptom (operator description):**
- `cpRepo.findOne` against `construction_projects` returns no record for the code
- INSERT uses `ON CONFLICT (project_code) DO NOTHING RETURNING id` and returns no rows
- ConflictException 409 is thrown
- Operator concludes: "validation says no record but insert conflicts — looks broken"

**Root cause: Stale `projects` row that does NOT have a matching `construction_projects` extension.**

The two-table design (per Section 2.124-C) intentionally enforces global uniqueness on `projects.project_code`. The pre-check (`cpRepo.findOne`) only inspects the **extension** table (`construction_projects`). When a `projects` row exists alone (no extension), the pre-check passes but the atomic INSERT detects the existing parent and correctly returns 0 rows. The 409 is the **correct** response — that `project_code` is taken at the global level, even if no COI extension was ever attached to it.

**How the orphan parent row got there (most likely → least likely):**

| # | Origin | Evidence |
|---|--------|----------|
| 1 | Pre-JL transactions where the `projects` INSERT succeeded but `construction_projects` INSERT failed BEFORE the rollback closed cleanly (e.g., process crash between the two statements) | Logs show prior 500s on `construction_projects` insert (Issue B below) |
| 2 | UO module created the `projects` row (project_code is shared namespace) | Confirm via `SELECT project_type FROM projects WHERE project_code = 'CP-2026-051'` — if `project_type != 'CONSTRUCTION'` → owned by other module |
| 3 | Manual psql test insert | Operator-only; check shell history |
| 4 | Seed data | Inspect seed scripts in `database/migrations/` |

**The fix is NOT code:** the JL-1 logic is correct. The fix is **data cleanup** — operator must inspect `projects` for the orphan and either delete it (if truly orphan) or use a different `project_code`.

**Why ON CONFLICT + RETURNING returns 0 rows:** PostgreSQL semantics — `ON CONFLICT (project_code) DO NOTHING` skips the INSERT silently when the unique key collides. Skipped rows are NOT returned by `RETURNING`. Zero returned rows is the documented signal for conflict-skip. Our code correctly interprets this as ConflictException.

**Why `rollback` appears in the log even when no error occurred at the SQL level:** Because the ConflictException is thrown inside the `em.transactional()` callback, MikroORM rolls back the transaction. This is correct — we don't want a half-completed write. The rollback log line is expected, NOT a bug.

---

#### Issue B: `column "target_physical_progress" does not exist` (REAL bug — schema drift)

**Source-vs-DB divergence:**

| Layer | State |
|---|---|
| `construction-project.entity.ts` | ✅ Has `targetPhysicalProgress` and `targetFinancialProgress` properties (added in JH-A) |
| `construction-projects.service.ts` INSERT (lines 402–453) | ✅ Includes both columns in the INSERT |
| `database/migrations/043_add_target_progress_to_construction_projects.sql` | ✅ EXISTS in repo (since JH-A) — uses `ADD COLUMN IF NOT EXISTS DECIMAL(5,2) DEFAULT 100` |
| Runtime PostgreSQL `construction_projects` table | ❌ Columns DO NOT exist (per the runtime error) |
| `mikro_orm_migrations` table | ✅ Contains `Migration20260430000000_Baseline` (per JI-V7) |

**Root cause: Migration 043 was never applied to this database.** The Phase JI baseline migration explicitly assumes "all 43 manually-applied SQL migrations" have already been applied. JI-D7 directive: "Operator MUST confirm migration 043 has been applied via psql before running npm run migration:up". The operator either skipped this confirmation or applied baseline against a DB that was never migrated past 042.

**Layer responsible: Database (deployment/migration step), NOT code.**

**Why insert references column even though DB schema doesn't have it:**
- The TypeScript code has been correct since JH-A (entity + DTO + service all aligned)
- The DDL change required to support that code was never applied to this specific DB instance
- Going-forward MikroORM migration system was activated in JI BEFORE the legacy SQL file 043 was applied — created a gap

**Why rollback occurs:** PostgreSQL detects the non-existent column at SQL parse time, returns `42703` undefined_column error, transaction aborts, `em.transactional` rolls back. Standard behavior.

**Two valid resolution paths:**

| Path | Steps | Aligns with JI Directive? |
|---|-------|--------------------------|
| Path 1: Apply 043 manually via psql once | `psql -f database/migrations/043_add_target_progress_to_construction_projects.sql` | ⚠️ Permitted (one-time gap fix); JI-D2 forbids NEW SQL files but 043 already exists |
| Path 2: Convert 043 into a MikroORM migration class | Create `Migration20260502000000_AddTargetProgressColumns.ts`, run `npm run migration:up` | ✅ Aligns with JI-D2 going-forward direction |

**Recommended: Path 1 first** (immediate unblock, ~1 minute), then optionally Path 2 (proper alignment for future schema changes). Path 2 alone has a wrinkle: the file 043 is idempotent (`IF NOT EXISTS`) but a MikroORM migration cannot be "applied retroactively" to a DB where the columns might already exist on some installs. Path 1 + reset migration tracking is operationally cleanest.

---

### 2.126-B: STEP 2 — Figma UI Comparison (Admin Side, COI Main Module)

**Reference:** Figma Make file `rslJrHybEabnxHhW1M3mEo` — components `CategoryOverview.tsx`, `GenericFundedProjectsPage.tsx`, `ProjectFormDialog.tsx` (already analyzed in Section 2.123-D).

**Current implementation: `pmo-frontend/pages/coi/index.vue`** has:
- v-tabs (Projects / Analytics)
- 6 KPI stat cards (basic v-card, no icons)
- Filter bar (status + campus)
- v-data-table with 7 columns (after JJ-B row-click added)
- Meatball menu actions per row

**Figma patterns NOT present in current implementation:**

| # | Figma Pattern | Current State | Gap Severity |
|---|---|---|---|
| 1 | Funding-source category tabs (`GAA-Funded`, `Locally Funded`, `Special Grants`) above the table | Single combined table | 🟡 MEDIUM — categorization is part of the COI domain model |
| 2 | Stat cards with leading icon + colored gradient background | Plain v-card with caption + h4 | 🟢 LOW — cosmetic |
| 3 | Inline progress bar visualization in table row (linear progress) | Numeric chip only | 🟡 MEDIUM — visual progress is core to PMO UX |
| 4 | Empty state component with illustration + CTA when 0 results | Empty table body | 🟢 LOW — only triggers in edge case |
| 5 | Search input with leading magnifier icon, sticky on scroll | Plain v-text-field search | 🟢 LOW |
| 6 | "View" / "Edit" / "Delete" inline icon buttons (Figma) vs meatball menu (current) | Meatball menu | 🟢 LOW — both are valid UX patterns; meatball reduces row clutter |
| 7 | Project status badges with colored dots (Figma) vs solid chip (current) | Solid v-chip | 🟢 LOW — current is acceptable Vuetify idiom |

**Critical observation:** The current implementation aligns well with the Figma's structural intent. The most meaningful gap is #1 (funding-source category tabs) — but this is a scope expansion, not a defect. The Figma's table design implicitly groups projects by funding type at the navigation level.

**Decision: Treat Figma alignment as enhancement (deferable), NOT as blocker.** Schema sync and data cleanup must precede any UI work — broken creation cannot be polished.

---

### 2.126-C: STEP 3 — System Architecture Validation

**Re-affirms Section 2.124-C findings.** No new architectural risks; all current risks were already documented.

**Dual-write pattern (correct):**
1. INSERT into `projects` (parent — global) using `ON CONFLICT DO NOTHING RETURNING id`
2. If 0 rows returned → ConflictException (atomic detection)
3. INSERT into `construction_projects` (child — module-specific)
4. Both wrapped in `em.transactional()` → atomic at DB level

**`project_code` global uniqueness (correct):**
The unique constraint on `projects.project_code` is intentional and required for cross-module identification. Removing or scoping it would break referential clarity in quarterly reports, assignments, and audit trails.

**Insertion order (correct):**
Parent (`projects`) MUST insert before child (`construction_projects`). The child has no FK reference to parent today, but conceptually parent represents project identity.

**New risk surfaced by Issue B (orphan rows from earlier failed transactions):**

| Risk | Mitigation |
|---|---|
| Orphan `projects` rows accumulate when prior bugs allowed parent insert without child | One-time data cleanup query (operator action); JL-1 prevents future orphans because failed `construction_projects` INSERT now correctly rolls back the parent (atomic transaction) |

---

### 2.126-D: STEP 4 — Resolution Strategy (Plan, no implementation)

**Sub-phase JM-A — Schema Synchronization (BLOCKER)**

Apply migration 043 to runtime DB. Two-step:
- A1: Operator runs `psql -U postgres -d pmo_dashboard -f database/migrations/043_add_target_progress_to_construction_projects.sql` — idempotent (`IF NOT EXISTS`), zero risk
- A2: Verify columns exist: `\d construction_projects` shows `target_physical_progress`, `target_financial_progress`
- A3: Restart backend (NOT required — DDL changes do not require code restart, but recommended for clean MikroORM metadata refresh)

**Sub-phase JM-B — Orphan `projects` Data Cleanup**

Operator-only diagnostic + cleanup:
- B1: Inspect: `SELECT id, project_code, project_type, deleted_at, created_at, created_by FROM projects WHERE project_code = 'CP-2026-051';`
- B2: If row exists with `project_type = 'CONSTRUCTION'` AND no matching `construction_projects` row → orphan from prior failed transaction → safe to soft-delete: `UPDATE projects SET deleted_at = NOW() WHERE project_code = 'CP-2026-051' AND id NOT IN (SELECT project_id FROM construction_projects);`
- B3: If row exists with `project_type != 'CONSTRUCTION'` → owned by another module → operator must use a different code for COI

**Sub-phase JM-C — UI Refinement (DEFERRABLE — only if JM-A + JM-B pass)**

Figma alignment, ordered by impact:
- C1: Inline linear progress bar in table row (replaces current numeric-only display)
- C2: Stat card icon + tonal background variant (cosmetic upgrade)
- C3: Empty state component (covers 0-results edge case)
- C4 (deferred / scope-expansion): Funding-source category tabs (GAA / Locally / Special) — requires backend filter parameter or frontend `computed` filter; defer until stakeholder confirmation

---

### 2.126-E: STEP 5 — Priority Decision

**Decision: JM-A → JM-B → JM-C (strict order)**

**Justification:**

1. **System stability (highest weight):** Issue B (`target_physical_progress does not exist`) is a HARD blocker — no project can be created at all, regardless of `project_code`. Until JM-A applies, the entire COI write path is broken.
2. **Data integrity (second weight):** JM-B (orphan cleanup) only blocks reuse of specific historical codes. Users can work around by choosing new codes (e.g., `CP-2026-100+`). Not a hard blocker but creates user confusion.
3. **Cosmetic refinement (lowest weight):** JM-C (UI polish) has zero functional impact — defer until stable creation is verified.
4. **Dependency chain:** UI smoke test requires successful create + navigate flow. Without JM-A, UI cannot be exercised. Without JM-B, demo-ready test data is hard to assemble. JM-C is the natural last step.
5. **Cost asymmetry:** JM-A is one psql command (~30 seconds). JM-B is two SQL queries. JM-C is multi-file frontend work. Match cost to dependency order.

---

## Section 2.125 — Phase JL: Definitive Duplicate-Key Fix Strategy (2026-05-02)

**Status:** Phase 1 Research Complete
**Trigger:** RUN_ACE — duplicate-key 500 persists across two separate error logs (10:04 AM, 12:01 PM) both showing PID `23824`. JJ-A fix confirmed in source (`service.ts` lines 358–366 and 373–492) but NOT executing at runtime. Operator restart attempts have not changed the running PID.

---

### 2.125-A: Root Cause Confirmation (Three-Layer Analysis)

**Layer 1 — Runtime: `nest start --watch` did not recompile after JJ-A edits**

Evidence: Both error logs carry PID `23824`. Process IDs are assigned at process creation. Same PID = same process = same compiled code. The `nest start --watch` file watcher on Windows failed to detect the programmatic file edit made by Claude Code tools (Write/Edit tool uses OS-level file API; Nest's watcher uses `chokidar` which can miss inotify/FSEvents-triggered changes on Windows NTFS under certain conditions).

Neither the `projectsCheck` SQL (`SELECT id FROM projects WHERE...`) nor the `try { ... } catch` wrapper appear in the log — both are JJ-A additions. The log shows exactly the pre-JJ-A execution path.

**Layer 2 — Code: The JJ-A pre-check approach has a structural risk even when loaded**

The current JJ-A approach in source is:
```
1. cpRepo.findOne against construction_projects  (ORM SELECT)
2. em.getConnection().execute against projects   (raw SQL SELECT)
3. try { em.transactional { INSERT projects + INSERT construction_projects } }
    catch { handle 23505 }
```

Steps 1 and 2 run outside the transaction. Between step 2 and step 3 there is a **time window** where another request can insert the same `project_code` into `projects`. In that race, step 3's INSERT fails, and the catch handler converts it to a 409 — which is correct. However, this is still a two-roundtrip approach with a race window.

**Layer 3 — Definitive fix: Atomic ON CONFLICT eliminates all layers simultaneously**

Replace the `INSERT INTO projects` statement (inside the transaction) with an atomic `INSERT ... ON CONFLICT (project_code) DO NOTHING RETURNING id`. If the code already exists (from any source — UO module, prior failed attempt, race condition), the INSERT is silently skipped and `RETURNING id` returns zero rows. We detect this and throw `ConflictException` immediately.

Benefits:
- **No race window** — the conflict is handled atomically at the DB level
- **No pre-check SQL needed** — the ON CONFLICT makes step 2 (`projectsCheck`) redundant
- **No try/catch for 23505 needed** — the ON CONFLICT prevents the constraint violation from ever firing
- **One less round-trip** — pre-check SQL removed; total DB writes: 1 (was 3: check, check, insert)
- **Runtime-change-proof** — once the operator does a clean restart (required after any code change), this approach is simpler and more robust than the current JJ-A patch

**Why the 409 logic did not stop execution in both logs:** The running binary is the pre-JJ-A version. The 409 logic literally does not exist in the byte code being executed by PID 23824.

---

### 2.125-B: Why `nest start --watch` May Not Detect Claude Code Edits on Windows

`nest start --watch` uses NestJS CLI which internally calls `tsc-watch` or `ts-node-dev` with `chokidar` for file watching. On Windows NTFS, `chokidar` can use either native ReadDirectoryChangesW or fall back to polling. When files are modified by a process that does NOT flush the Windows file change notification queue promptly (as some programmatic editors and tool APIs do), the watcher may not receive the `change` event.

**This is a known Windows development environment issue.** The fix is a hard restart (kill process, wipe dist, re-launch) rather than relying on watch-mode auto-reload for programmatic edits.

---

### 2.125-C: Final Architecture Decision

| Approach | Race-safe | Pre-check required | Round-trips | Complexity |
|---|---|---|---|---|
| Original (pre-JJ-A) | ❌ No | cpRepo only | 3 | Low |
| JJ-A patch | ✅ Yes (catch) | projects SELECT | 3 | Medium |
| **JL ON CONFLICT (new)** | ✅ **Yes (atomic)** | **None** | **2** | **Low** |

**Decision: Replace the INSERT with ON CONFLICT. Remove the `projectsCheck` pre-check. Keep the `cpRepo.findOne` check (fast path for same-module duplicates, returns clear error message before the transaction opens). Keep the try/catch but broaden to catch any unexpected errors.**

---

## Section 2.124 — Phase JK: COI Stabilization Diagnostic (2026-05-02)

**Status:** Phase 1 Research Complete
**Trigger:** RUN_ACE — operator reports two post-JJ defects: (1) duplicate-key 500 still occurs despite JJ-A fix being in source; (2) "Average Progress" stat card displays `NaN%`. This is a stabilization gate before any further COI feature work.
**Continuity:** Extends Section 2.123 — does not invalidate it. The JJ-A code in `service.ts` IS correct in source; the runtime evidence shows it is NOT being executed.

---

### 2.124-A: STEP 1 — Backend Inconsistency Root Cause (Duplicate Insert)

**Operator-supplied runtime log (verbatim, post-JJ-A deploy):**

```
[query] select "c0".* from "construction_projects" as "c0"
        where "c0"."project_code" = 'CP-2026-051' limit 1   [0 results]
[query] begin
[query] INSERT INTO projects (id, project_code, title, ...)
        VALUES ('7ee009c3-...', 'CP-2026-051', ...)         [21 ms]
[query] rollback
ERROR: duplicate key value violates unique constraint "projects_project_code_key"
HTTP 500
```

**Critical observation: The `SELECT id FROM projects WHERE project_code = ?` query (added in JJ-A-1) is ABSENT from the log.**

**Source-vs-runtime divergence — verified:**

| Layer | State |
|---|---|
| `construction-projects.service.ts` lines 358–366 | ✅ Contains the `projects` table check (raw SQL, awaited, throws ConflictException) |
| `construction-projects.service.ts` lines 373, 482–492 | ✅ Contains `try { ... } catch (err: any) { if 23505 + projects_project_code_key → ConflictException }` |
| Runtime SQL log | ❌ Only the original `cpRepo.findOne` SELECT runs; no second SELECT against `projects` |
| Error path | Goes to `GlobalExceptionFilter` as raw DB error, not as `ConflictException` |

**Layer responsible: Runtime/deploy — not service code.**

The fix in source IS structurally correct:
1. Pre-insert SELECT against `projects` (catches cross-module collisions)
2. Try/catch wrapping the `transactional()` block (catches race conditions, wraps `23505` constraint errors as `ConflictException`)

But neither code path executes. Both are unconditional — there is no `if` guarding them. The only explanation: **the running Node process is executing a stale compiled bundle that predates the JJ-A edits.**

**Why this happens (most likely → least likely):**

1. **Backend not restarted after JJ-A code save.** `npm run start:dev` uses `nest start --watch`, which rebuilds on file change in most cases — but if the watch was started before the file edits, OR if the process was paused, OR if the file was edited via a path that watch did not observe, the running process retains the old compiled output.
2. **Stale `dist/` artifact.** If the operator manually ran `npm run build` then started via `npm run start:prod` (which serves `dist/main`), and `dist/` was not rebuilt after JJ-A edits, the old code runs.
3. **Multiple Node processes.** If a prior `start:dev` was not killed before launching a new one, two processes may compete on the same port; the surviving process may be the old one.

**Why duplication is not prevented before INSERT (in the running runtime, not in source):**

The running runtime has only the ORIGINAL pre-insert check (`cpRepo.findOne` against `construction_projects`). For project code `CP-2026-051`:
- `construction_projects.project_code = 'CP-2026-051'` → 0 rows (the CP record was never created — prior failed transaction left only a `projects` row, OR the code came from another module). Check passes.
- INSERT into `projects` fires. Constraint `projects_project_code_key` violates. Rollback. 500 returned.

**The original (Section 2.123-B) root-cause analysis remains valid:** the legacy validation queries the wrong table. The JJ-A patch addresses it correctly in source. The remaining work is operational: ensure the patched code is the code that runs.

**Why the 409 logic does not stop execution (runtime, not logic):** Because the 409 logic for the `projects` table is not loaded into the running V8 context. The function bytes executing in production are those compiled from the pre-JJ-A version of `service.ts`.

**No change to the architectural diagnosis:** the dual-table design (`projects` base + `construction_projects` extension) is intentional; the unique constraint on `projects.project_code` enforces global cross-module uniqueness; the pre-insert validation must therefore consult `projects`, not `construction_projects`.

---

### 2.124-B: STEP 2 — Stat Card NaN Root Cause

**Symptom:** `coi/index.vue` "Average Progress" stat card renders `NaN%`.

**Code paths inspected:**

`pmo-frontend/utils/adapters.ts` line 125 (UIProject — list view):
```typescript
physicalAccomplishment: backend.physical_progress || 0,
```

`pmo-frontend/utils/adapters.ts` line 343 (UIProjectDetail — single record):
```typescript
physicalProgress: typeof backend.physical_progress === 'number'
  ? backend.physical_progress
  : Number(backend.physical_progress || 0),
```

`pmo-frontend/pages/coi/index.vue` lines 280–282:
```typescript
stats.value.avgProgress = projectList.length > 0
  ? projectList.reduce((sum, p) => sum + (p.physicalAccomplishment || 0), 0) / projectList.length
  : 0
```

`pmo-frontend/pages/coi/index.vue` line 434:
```html
<p class="text-h4 font-weight-bold">{{ stats.avgProgress.toFixed(1) }}%</p>
```

**Root cause: type coercion gap in the list adapter.**

PostgreSQL `DECIMAL(5,2)` columns are returned by the `pg` driver as **strings** (e.g., `"0.00"`, `"45.50"`) — NOT JavaScript numbers. The list adapter (line 125) uses `backend.physical_progress || 0` with no `Number()` coercion. Because non-empty strings are truthy in JavaScript, `"0.00" || 0` evaluates to `"0.00"` — a string.

In the reduce on line 281:
- Iteration 1: `0 + "0.00"` → `"00.00"` (string concatenation, not addition)
- Iteration 2: `"00.00" + "45.50"` → `"00.0045.50"`
- Final: `"<concatenated string>" / length` → `NaN`

The `|| 0` short-circuit does NOT rescue this case because the string is truthy; `||` only catches falsy values (`null`, `undefined`, `0`, `""`, `false`, `NaN`).

**Comparison with detail adapter (line 343) — already correct:** uses explicit `Number()` coercion guarded by `typeof === 'number'`. The list adapter was missed when the detail adapter was hardened.

**Backend vs Frontend responsibility:** Both layers are involved.
- Backend returns DECIMAL as string — this is `pg` driver default behavior, NOT a bug. Changing it project-wide is high risk (would silently change every DECIMAL field across UO, Financial, Physical modules — see CLAUDE.md "Backend enforcement is authoritative").
- Frontend adapter is the correct fix point — same as the detail adapter pattern.

**Affected layer: Frontend adapter (single line in `adapters.ts`)** plus a defensive guard in the reduce.

**Other DECIMAL fields with the same coercion gap (audit):**

| Field | Adapter Line | Coerced? |
|---|---|---|
| `physical_progress` → `physicalAccomplishment` (UIProject) | 125 | ❌ NO |
| `physical_progress` → `physicalProgress` (UIProjectDetail) | 343 | ✅ YES |
| `target_physical_progress` → `targetPhysicalProgress` (UIProjectDetail) | 345 | ✅ YES |
| `physical_progress` → `physicalProgress` (BackendProjectListItem variant, line 600) | 600 | ❌ NO |

Lines 125 and 600 both need the same `Number()` coercion treatment.

---

### 2.124-C: STEP 3 — COI Architecture Validation

**Two-table design audit:**

| Table | Role | Unique Constraint | Owned By |
|---|---|---|---|
| `projects` | Base / shared parent | `project_code` (global) | Cross-module (UO, COI, future) |
| `construction_projects` | COI-specific extension | None on `project_code` (column is duplicated for query performance) | COI module only |

**Is the separation intentional?** YES. The original design separates a generic project record (visible to all modules, used for cross-module aggregation, assignment, audit) from module-specific extensions. This is a "joined inheritance" / "table-per-class" pattern. The `projects` table is the source of truth for project identity; `construction_projects` extends it with COI-specific columns (contractor, building type, milestones, etc.).

**Should uniqueness be global or module-specific?** **GLOBAL.** Project codes function as cross-module identifiers (e.g., a quarterly report references a project_code without knowing the module). Module-scoped uniqueness would allow `CP-2026-051` to exist independently in COI and UO, breaking referential clarity. The current `projects.project_code` UNIQUE constraint is correct.

**Risks in current structure:**

| # | Risk | Severity | Status |
|---|------|----------|--------|
| R1 | Pre-insert validation queries the extension table, not the base table — duplicates leak through to DB | 🔴 HIGH | Source fixed (JJ-A); runtime verification pending |
| R2 | Two writes per create (`projects` + `construction_projects`) — partial failure leaves orphan `projects` row IF transactional boundary is broken | 🟡 MEDIUM | Currently inside `em.transactional()` — safe |
| R3 | `project_code` duplicated across both tables — drift possible if either table is mutated independently (e.g., direct SQL update) | 🟡 MEDIUM | Mitigation: never UPDATE `project_code` after create |
| R4 | DTO/entity alignment: DTO uses `project_code` (snake_case), entity uses `projectCode` (camelCase) — already correctly mapped via `cpRepo.findOne({ projectCode: dto.project_code })` | 🟢 LOW | OK |
| R5 | Frontend list adapter does not coerce DECIMAL strings → NaN propagation | 🟡 MEDIUM | Diagnosed in 2.124-B; fix planned |

**Architectural assessment:** The two-table design is sound. The bugs are at boundary layers (validation logic, type coercion), not in the schema.

---

### 2.124-D: STEP 4 — Resolution Strategy (Plan, no implementation)

**A. Duplicate Insert Issue (runtime, not logic)**

| # | Action | Owner | Verification |
|---|--------|-------|-------------|
| A1 | Operator: kill all Node processes for `pmo-backend`, then restart `npm run start:dev` | Operator | Process list shows single new PID |
| A2 | Operator: confirm runtime log on next create attempt shows BOTH SELECT queries (`construction_projects` AND `projects`) before any INSERT | Operator | Log line `select "c0".*` followed by raw `SELECT id FROM projects WHERE project_code = ...` |
| A3 | If A2 still missing the second SELECT: delete `pmo-backend/dist/` and re-run `npm run build && npm run start:dev` | Operator | Same as A2 |
| A4 | If A3 still fails: source-level audit — re-read `service.ts` lines 343–493 to confirm no merge conflict / accidental revert | Engineer | Code matches Section 2.124-A "✅ source state" table |
| A5 | Defense-in-depth (low-risk, deferrable): convert the two-step check + insert into a single `INSERT ... ON CONFLICT (project_code) DO NOTHING RETURNING id` against `projects`, then check returned row count | Engineer | One round-trip; eliminates race window entirely |

**B. NaN Issue (frontend adapter)**

| # | Action | File | Verification |
|---|--------|------|-------------|
| B1 | Add `Number()` coercion to `adapters.ts:125` (UIProject `physicalAccomplishment`) | `pmo-frontend/utils/adapters.ts` | "Average Progress" card shows `0.0%` (or actual avg), never `NaN%` |
| B2 | Add `Number()` coercion to `adapters.ts:600` (BackendProjectListItem variant) | Same file | Other consumers of that adapter no longer NaN |
| B3 | Defensive guard in `coi/index.vue:281` reduce — wrap with `Number(p.physicalAccomplishment) || 0` so future adapter regressions cannot reintroduce NaN | `pmo-frontend/pages/coi/index.vue` | Stat card stable even if adapter regresses |
| B4 | Display guard at line 434: `{{ Number.isFinite(stats.avgProgress) ? stats.avgProgress.toFixed(1) : '0.0' }}%` | Same file | Final-line safety; never display NaN to user |

**C. System Consistency**

| # | Action | Notes |
|---|--------|-------|
| C1 | Document the two-table contract in `CLAUDE.md` "Coding Conventions": "When inserting/updating a record that has a `projects` parent row, validate `project_code` against `projects` (not the extension table). Prefer single-statement INSERT...ON CONFLICT for race safety." | Living doc update — out of JK scope, defer to operator request |
| C2 | Audit all other extension tables (UO, future modules) for the same validation pattern | Out of JK scope; one-line check per service `create()` method |
| C3 | DTO + entity remain unchanged. Validation logic location remains the service layer. No new DatabaseService usage. | Preserves hybrid-ORM directive |

---

### 2.124-E: STEP 5 — First Priority Decision

**Decision: Verify A1–A3 (runtime restart + log proof) BEFORE B1–B4 (NaN fix) BEFORE A5/C (defense-in-depth + docs).**

**Justification:**

1. **System stability:** The duplicate-insert 500 is a creation blocker — the entire COI module's primary write path is broken. Until it is verified working at runtime, every other test is uncertain. NaN is cosmetic (display issue), not a write blocker.
2. **Risk propagation:** Continuing UI feature work on top of a broken create path means every new feature has a hidden dependency on a broken endpoint — defects compound. NaN does not propagate beyond the stat card.
3. **Dependency chain:** A1–A3 unblocks JJ-V1, JJ-V2, JJ-V10 verification (which is currently blocked). B1–B4 unblocks visual polish. A5/C are durability improvements.
4. **Cost asymmetry:** A1–A3 is operator-only (no code change); validation cost is one create attempt + log inspection. B1–B4 is 4 small edits. A5 is a structural refactor — defer until A1–A3 confirms no other surprises.

**Ordered execution:**
1. **JK-A** — Operator runtime stabilization (restart + log verification, no code)
2. **JK-B** — Frontend NaN fix (4 edits in 2 files)
3. **JK-C** — Defense-in-depth: INSERT...ON CONFLICT refactor (deferrable; only if JK-A reveals race conditions)

---

## Section 2.123 — Phase JJ: COI Core UX Restructure + Backend Error Analysis (2026-05-02)

**Status:** Phase 1 Research Complete
**Trigger:** RUN_ACE — operator authorizes Phase 1 + Phase 2 for COI module core development. Scope covers: (A) Create form UX restructure, (B) Main page project list improvements, (C) Backend duplicate key root cause analysis, (D) Figma Admin Side analysis, (E) UI improvement strategy, (F) First step determination.

---

### 2.123-A: COI Create Form — Current State Audit

**File:** `pmo-frontend/pages/coi/new.vue`

**Current structure:** 7 v-card sections in a single scrolling page (no tabs, no stepper):
1. Basic Information (project_code, campus, title, description, ideal_infrastructure_image, objectives, key_features, status, beneficiaries)
2. Contract Details (funding_source_id, contractor_id, contract_number, contract_amount)
3. Schedule (start_date, target_completion_date, actual_completion_date, project_duration, original_contract_duration)
4. Progress Targets (target_physical_progress, target_financial_progress)
5. Personnel (project_engineer, project_manager)
6. Physical Details (building_type, floor_area, number_of_floors, latitude, longitude)
7. Assignment (assigned_user_ids multi-select)

**Identified UX gaps:**
- No visual grouping of related sections into steps — user cannot track form completion
- No step progress indicator — long form feels overwhelming
- Technical backend errors exposed directly to user via `toast.error(apiError.message)` — exposes DTO field names
- `project_code` must be manually typed in format `CP-YYYY-NNN`; no auto-suggestion; uniqueness failure is a raw `ConflictException` message
- Form validation is Vuetify-native per-field only; no cross-field or pre-submit completeness check

---

### 2.123-B: Backend Duplicate Key Error — Root Cause Analysis

**Error:** `duplicate key value violates unique constraint "projects_project_code_key"` — transaction rollback occurs after INSERT attempt.

**Root cause: Layer — Service (pre-insert uniqueness check queries wrong table)**

**Code location:** `pmo-backend/src/construction-projects/construction-projects.service.ts:348–356`

```typescript
const existing = await this.cpRepo.findOne(
  { projectCode: dto.project_code },  // queries construction_projects.project_code
  { filters: false },
);
if (existing) {
  throw new ConflictException(`Project code ${dto.project_code} already exists`);
}
```

The check queries `construction_projects` (via `cpRepo = EntityRepository<ConstructionProject>`). However, the INSERT target for the constraint violation is the `projects` table:

```sql
INSERT INTO projects (id, project_code, title, ...)  -- unique constraint is here
VALUES (?, ?, ?, ...)
```

**Failure modes:**

| # | Mode | Trigger | Who catches it |
|---|------|---------|---------------|
| 1 | Cross-module collision | A project code already in `projects` table (UO module or any other module) but not in `construction_projects`. Check passes. INSERT fails with DB constraint error. | Nobody — reaches DB |
| 2 | Race condition | Two simultaneous create requests both pass the check before either has inserted. One succeeds; the other hits DB constraint. | Nobody — reaches DB |
| 3 | Same-module collision | Same project code in `construction_projects` (deleted record with soft-delete). `filters: false` bypasses soft-delete — this IS caught. | Service check catches it |

**Why duplication is not prevented before INSERT:** The service's pre-insert query (`cpRepo.findOne`) is scoped to `ConstructionProject` entity → `construction_projects` table. The unique constraint `projects_project_code_key` is on the `projects` table, which is shared across all modules. The service does not query `projects` before inserting.

**Fix strategy (plan only — no implementation here):**
- **Preferred fix:** Add a pre-insert existence check against the `projects` table using `em.getConnection().execute('SELECT id FROM projects WHERE project_code = ? AND deleted_at IS NULL', [dto.project_code])`. If any row returned → throw ConflictException.
- **Secondary:** Frontend — add a debounced `GET /api/construction-projects/check-code?code=CP-XXXX` endpoint returning `{ exists: boolean }` for real-time feedback before submit.
- **Tertiary:** Handle the DB `23505` error code in the service and re-throw as user-friendly ConflictException in a try/catch around the transactional block.

---

### 2.123-C: COI Main Page — Current State Audit

**File:** `pmo-frontend/pages/coi/index.vue`

**Current state:** Functional but interaction-limited.

| Feature | Status |
|---------|--------|
| v-data-table with 7 columns | ✅ Working |
| Filter by status + campus | ✅ Working |
| KPI stat cards (total, ongoing, completed, pending, contract value) | ✅ Working |
| Analytics tab (Phase JF) | ✅ Working |
| Meatball menu per row (View, Edit, Submit, Approve, Reject, Delete) | ✅ Working |
| Row click → navigate to detail | ❌ **MISSING** — rows are not clickable |
| Project code visible in table | ❌ **MISSING** — not a column |
| Progress bar visual (physical %) | ❌ **MISSING** — only number shown |

**Gap:** Users cannot navigate to project detail by clicking a row. The only path is meatball menu → View — which is a UX friction point. All comparable Figma designs use row-click navigation.

---

### 2.123-D: Figma Admin Side Analysis (rslJrHybEabnxHhW1M3mEo)

**Files analyzed:** `ProjectFormDialog.tsx`, `GAA-FundedProjectsPage.tsx`, `CategoryOverview.tsx` (preview), `ConstructionProjectDetail.tsx` (preview).

**D.1 — Form structure (Figma: ProjectFormDialog.tsx)**

The Figma design uses a Dialog-based form with 6 scrollable sections. Key observations:

| Section | Figma Fields | Current Form |
|---------|-------------|-------------|
| Basic Info | title, start date, target completion, duration, original duration, funding source, status, location, description, detailed description, ideal image | ✅ All present (location = lat/lng in current) |
| Financial | budget, appropriation, obligation, disbursement, labor cost, total project cost | ❌ None in create form |
| Contractor | contractor name, contact person | ✅ contractor_id select (partial) |
| Progress | progress accomplishment %, actual %, target % | ✅ target progress present; actual from JH-A |
| Accomplishment | accomplishment as of, date entry, comments, remarks | ❌ Not in form (JH-B scope) |
| Actual Status | actual accomplishment as of, date entry, general remarks | ❌ Not in form (JH-B scope) |

**D.2 — Key field gaps requiring plan decisions:**

| Figma Field | Status | Decision |
|---|---|---|
| `approvedBudget` | Not in DTO | **OUT OF SCOPE for JJ** — maps to financial records (JH-B), not project base record |
| `appropriation`, `obligation`, `disbursement` | Not in base DTO | **OUT OF SCOPE for JJ** — financial records entity |
| `totalLaborCost`, `totalProjectCost` | Not in any entity | **OUT OF SCOPE for JJ** — JH-B/JH-C |
| `accomplishmentAsOf`, comments, remarks | Not in form | **OUT OF SCOPE for JJ** — JH-B accomplishment records |
| `location` (text) | Has lat/lng fields | **DEFERRED** — lat/lng is more precise; text location is cosmetic |

**D.3 — UI pattern from Figma:**
- Section dividers with icon + heading (FileText, DollarSign, Calendar, TrendingUp, MessageSquare icons)
- Computed summary widget below financial fields (shows utilization rate + remaining budget)
- Progress variance summary widget (shows variance % + "On Track" / "Behind Schedule" label)
- Dialog form vs current dedicated page — current dedicated page is CORRECT for data entry; keep as page

**D.4 — Tab pattern reference (classroom-administrative-offices/components/FormStepper.tsx exists)**
The Figma Make has a `FormStepper` component used for classroom assessment. This confirms the stepper pattern is the intended UI for multi-section forms. The COI create form should adopt the same step-based navigation.

---

### 2.123-E: UI Improvement Strategy

Based on A–D findings, the following improvements are scoped for Phase JJ:

**E.1 — Create form (new.vue) → Tabbed step form**
- Replace 7 scrolling cards with `v-tabs + v-window + v-window-item` (established pattern from Phase JF research, directive in research.md)
- Tabs: (1) Basic Info, (2) Contract & Schedule, (3) Progress, (4) Personnel & Location, (5) Assignment
- Each tab shows a completion indicator (count of filled required fields / total required)
- Submit button only on final tab; previous tabs have "Next" navigation
- No schema changes required — same fields, regrouped

**E.2 — Validation error mapping**
- Wrap `toast.error(apiError.message)` with a mapping function
- Map known error patterns to human-readable messages:
  - `duplicate key.*projects_project_code_key` → "This project code is already in use. Please choose a unique code."
  - `ConflictException: Project code.*already exists` → "Project code already taken. Try a different one."
  - `400 Bad Request.*project_code` → "Project code format is invalid. Use CP-YYYY-NNN (e.g., CP-2026-001)."
  - Fallback: "Something went wrong. Please try again or contact support."

**E.3 — Index page row interaction**
- Add `@click:row` handler to `v-data-table` → `router.push('/coi/detail-${row.item.id}')`
- Cursor pointer on row hover via `:style="{ cursor: 'pointer' }"`

---

### 2.123-F: First Step Determination — Justified Decision

**Decision: Fix backend duplicate key error FIRST (before any UI restructure)**

**Justification:**
1. The duplicate key error is a **system-level creation blocker** — if a project code collides with any existing `projects` record (UO module, prior failed inserts), creation fails entirely with a raw DB error.
2. UI restructure (tabbed form) improves ergonomics but does not unblock creation — users can still fail even after a beautiful form.
3. The `project_code` uniqueness gap affects ALL users immediately; the UI issue affects usability.
4. Backend fix is small (2 SQL lines + 1 try/catch) vs UI restructure which is a full form rewrite.

**Ordered implementation:**
1. JJ-A — Backend: fix duplicate key (uniqueness check against `projects` table)
2. JJ-B — Frontend: add row-click to COI index (quick win, 2 lines)
3. JJ-C — Frontend: user-friendly validation error mapping in new.vue + edit-[id].vue
4. JJ-D — Frontend: COI create form tab restructure (new.vue → 5 tabs)

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
| `router.back()` in Nuxt 3 SPA mode may not remount a destination page component — use `router.push()` for deterministic navigation from edit/create back to detail | JT | Always use `router.push('/target-path')` in cancel/back handlers, not `router.back()` |

---

