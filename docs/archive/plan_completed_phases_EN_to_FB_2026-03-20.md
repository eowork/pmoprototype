## PHASE DO — INDICATOR COMPUTATION & FISCAL YEAR MANAGEMENT

**Research:** `research.md` Section 1.71  
**Status:** Phase 1 COMPLETE → Phase 2 COMPLETE → Awaiting `EXECUTE_WITH_ACE`

### Summary of Findings

| # | Issue | Root Cause | Severity |
|---|-------|-----------|----------|
| 1 | Total computation uses AVG for PERCENTAGE | Backend/frontend branching by unit_type | CRITICAL |
| 2 | Fiscal year hardcoded in frontend | Client-side array generation, no backend API | CRITICAL |
| 3 | Variance/rate not displaying | Depends on SUM fix + data entry existence | IMPORTANT |
| 4 | Indicators empty for FY 2026 (Adv Ed, Research, Extension) | No data entered yet — taxonomy renders correctly | LOW (Not a bug) |
| 5 | Unit-type AVG branching in aggregation | Incorrect BAR1 interpretation | IMPORTANT |
| 6 | Frontend rendering lifecycle | STABLE after Phase DN-C fix | LOW (No fix needed) |

### CORRECTION NOTE — Phase DN-E Superseded

Phase DN-E aligned frontend `computedPreview` to backend's HYBRID aggregation (SUM for COUNT, AVG for PERCENTAGE). Per operator directive, BAR1 requires **SUM for ALL indicator types**. Phase DO-A will correct BOTH frontend and backend to use unconditional SUM.

---

### Step DO-A: Correct Total Computation to SUM for All Types (CRITICAL)

**Scope:** MUST  
**Files:**
- `pmo-backend/src/university-operations/university-operations.service.ts` — `computeIndicatorMetrics`
- `pmo-frontend/pages/university-operations/physical/index.vue` — `computedPreview`

**Action:**

1. **Backend** — Remove `useSum` conditional in `computeIndicatorMetrics`. Change:
   ```
   // BEFORE: useSum ? SUM : AVG based on unit_type
   // AFTER:  Always SUM
   const totalTarget = targets.reduce((a, b) => a + b, 0)
   const totalAccomplishment = actuals.reduce((a, b) => a + b, 0)
   ```

2. **Frontend** — Remove `useSum` conditional in `computedPreview`. Change:
   ```
   // BEFORE: useSum ? SUM : AVG based on unit_type
   // AFTER:  Always SUM
   const totalTarget = targets.reduce((a, b) => Number(a) + Number(b), 0)
   const totalActual = actuals.reduce((a, b) => Number(a) + Number(b), 0)
   ```

3. Update comments to reflect BAR1 SUM requirement.

**Verification:**
- [ ] Backend returns SUM for all indicator types regardless of unit_type
- [ ] Frontend preview shows SUM totals in quarterly data entry dialog
- [ ] Variance = Total Actual - Total Target (computed from SUM)
- [ ] Accomplishment Rate = (Total Actual / Total Target) × 100

---

### Step DO-B: Fiscal Year Configuration System — Database & Backend (CRITICAL)

**Scope:** MUST  
**Files:**
- New migration: `database/migrations/023_create_fiscal_years_table.sql`
- `pmo-backend/src/university-operations/university-operations.service.ts`
- `pmo-backend/src/university-operations/university-operations.controller.ts`
- New DTO files as needed

**Action:**

1. **Migration 023** — Create `fiscal_years` table:
   ```sql
   CREATE TABLE IF NOT EXISTS fiscal_years (
     year INTEGER PRIMARY KEY,
     is_active BOOLEAN NOT NULL DEFAULT true,
     label VARCHAR(50),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   -- Seed current + past 4 years
   INSERT INTO fiscal_years (year, is_active, label) VALUES
     (2022, true, 'FY 2022'),
     (2023, true, 'FY 2023'),
     (2024, true, 'FY 2024'),
     (2025, true, 'FY 2025'),
     (2026, true, 'FY 2026')
   ON CONFLICT (year) DO NOTHING;
   ```

2. **Backend endpoints:**
   - `GET /api/fiscal-years` — returns active fiscal years (all roles)
   - `POST /api/fiscal-years` — create new fiscal year (SuperAdmin only)
   - `PATCH /api/fiscal-years/:year` — activate/deactivate (SuperAdmin only)

3. **Service methods:**
   - `getActiveFiscalYears()` — `SELECT year, label FROM fiscal_years WHERE is_active = true ORDER BY year DESC`
   - `createFiscalYear(year, label?)` — insert with conflict check
   - `toggleFiscalYear(year, isActive)` — update `is_active`

4. **Guards:** SuperAdmin role guard on POST and PATCH endpoints.

**Verification:**
- [ ] `GET /api/fiscal-years` returns list of active fiscal years
- [ ] `POST /api/fiscal-years` creates new year (SuperAdmin only)
- [ ] `PATCH /api/fiscal-years/:year` toggles active status
- [ ] Non-SuperAdmin users receive 403 on POST/PATCH

---

### Step DO-C: Fiscal Year Configuration — Frontend Integration (CRITICAL)

**Scope:** MUST  
**Files:**
- `pmo-frontend/pages/university-operations/index.vue`
- `pmo-frontend/pages/university-operations/physical/index.vue`
- New settings component (SuperAdmin fiscal year management page)

**Action:**

1. **Replace hardcoded fiscal year options** in both pages:
   ```typescript
   // BEFORE:
   const fiscalYearOptions = computed(() => {
     const currentYear = new Date().getFullYear()
     return Array.from({ length: 5 }, (_, i) => currentYear - i)
   })

   // AFTER:
   const fiscalYearOptions = ref<number[]>([])
   const fetchFiscalYears = async () => {
     const { data } = await useApiFetch('/api/fiscal-years')
     fiscalYearOptions.value = data.value?.map(fy => fy.year) || []
     if (!selectedFiscalYear.value && fiscalYearOptions.value.length > 0) {
       selectedFiscalYear.value = fiscalYearOptions.value[0]
     }
   }
   ```

2. **SuperAdmin settings page** — Add fiscal year management UI:
   - Table showing all fiscal years with active toggle
   - "Add Fiscal Year" button with year input
   - Visible only to SuperAdmin role

**Verification:**
- [ ] Fiscal year dropdowns populate from API
- [ ] SuperAdmin can add new fiscal years
- [ ] SuperAdmin can activate/deactivate years
- [ ] Non-SuperAdmin users do not see management UI
- [ ] All modules use same fiscal year list

---

### Step DO-D: Variance and Rate Display Validation (IMPORTANT)

**Scope:** SHOULD  
**Files:**
- `pmo-frontend/pages/university-operations/physical/index.vue` — template

**Action:**

1. Verify that after DO-A (SUM fix), variance and rate display correctly when data exists
2. Add fallback display for null variance/rate:
   ```vue
   <!-- Show "—" when variance is null instead of empty -->
   {{ getIndicatorData(indicator.id)?.variance != null
       ? formatNumber(getIndicatorData(indicator.id)?.variance)
       : '—' }}
   ```
3. Ensure rate displays with `%` suffix consistently

**Verification:**
- [ ] Variance shows computed value when both target and actual exist
- [ ] Accomplishment rate shows percentage when target is non-zero
- [ ] Null values display as "—" instead of blank
- [ ] Values recalculate reactively on data entry save

---

### Step DO-E: Backend Computation Alignment Audit (IMPORTANT)

**Scope:** SHOULD  
**Files:**
- `pmo-backend/src/university-operations/university-operations.service.ts` — `computeIndicatorMetrics`, `getPillarSummary`

**Action:**

1. Verify `computeIndicatorMetrics` returns correct SUM after DO-A fix
2. Verify `getPillarSummary` aggregation also uses SUM
3. Ensure `average_target` / `average_accomplishment` backward-compatible aliases are updated to reflect SUM values (rename or document that they now contain SUM, not AVG)
4. Add comment: `// BAR1 Standard: All indicator types use SUM aggregation`

**Verification:**
- [ ] `getPillarSummary` returns correct totals
- [ ] No remaining AVG-based computation in indicator pipeline
- [ ] Backward-compatible field aliases documented

---

### Step DO-F: Regression Testing Matrix (CRITICAL)

**Scope:** MUST  
**Status:** Awaiting operator verification after implementation

**Test Matrix:**

| # | Test Case | Expected Result | Status |
|---|-----------|----------------|--------|
| 1 | Create quarterly entry (any pillar, any FY) | Entry saved successfully | [ ] |
| 2 | Update quarterly entry | Entry updated, no 404 error | [ ] |
| 3 | Total Target/Actual shows SUM of quarters | SUM computation, not AVG | [ ] |
| 4 | Variance displays after data entry | Actual - Target value shown | [ ] |
| 5 | Accomplishment rate displays | (Actual/Target)×100 shown | [ ] |
| 6 | Pillar stat cards show correct counts | completed ≤ total always | [ ] |
| 7 | Fiscal year dropdown populated from API | Lists all active fiscal years | [ ] |
| 8 | SuperAdmin adds new fiscal year | Year appears in all dropdowns | [ ] |
| 9 | Non-SuperAdmin cannot manage fiscal years | 403 on POST/PATCH | [ ] |
| 10 | Page refresh preserves session | No unexpected logout | [ ] |
| 11 | Pillar card navigation | Navigates to correct tab | [ ] |
| 12 | Rapid tab switching | No stale data displayed | [ ] |
| 13 | COI and Repairs modules unaffected | No regression | [ ] |

---


---

## [ARCHIVED] Completed Phases DO–EM (Mar 5 – Mar 12, 2026)

> **4,215 lines archived to:** `docs/archive/plan_completed_phases_DO_to_EM_2026-03-17.md`
>
> **Phases:** DO (Indicator SUM + FY Config), DP (superseded), DQ (Analytics Filtering), DR (Rate-Based Analytics), DS (Quarter Entry Dialog), DW (Fiscal Year Store), DX (Quarter Highlight), DY (Quarterly Data Model), DZ (Quarterly Reporting), EA (Physical & Analytics), EE (Analytics Filtering), EG (UI Cleanup), EH (UI Refinement), EI (Submission Workflow), EJ (Deferred), EK (Export), EL (Quarterly Lifecycle), EM (Quarterly Report Entity)
>
> **Status:** All ✅ IMPLEMENTED or superseded. Historical execution details preserved in archive.

---


## Phase EN — Quarterly Status Synchronization & Submit Button State

> **Prerequisite:** Phase EM ✅ (EM-A through EM-E IMPLEMENTED; EM-F/EM-G deferred)
> **Research Reference:** `research.md` Section 1.93
> **Trigger:** (A) Status indicator shows "Not Started" after submit; (B) Submit button reverts after page refresh with duplicate submission error on re-click.

### Context

Phase EN research revealed that Phase EM-B (backend quarterly-reports) was already implemented in a prior session — the prior session summary contained an incorrect claim. All 8 controller routes and 7 service methods are present and functional.

The remaining issues are:

1. **Migration 026 application** — `quarterly_reports` table may not exist in the running DB (no automated runner)
2. **`currentQuarterStatus` reads wrong source** — per-pillar `status_qN` field instead of `currentQuarterlyReport.publication_status`
3. **Submit button state model is incomplete** — missing PENDING_REVIEW disabled state (non-owners), PUBLISHED approved indicator, REJECTED "Resubmit" label
4. **Multi-select batch actions** in Pending Reviews (deferred from EM-F)

---

### Phase EN Steps

#### EN-A: Apply Migration 026 to Running Database (CRITICAL — Prerequisite)

**Problem:** Migration 026 (`quarterly_reports` table) may not exist in the running PostgreSQL database. No automated runner. All quarterly-reports API calls will fail with DB errors if the table is absent, silently setting `currentQuarterlyReport.value = null` on every page load.

**Action:** Apply `database/migrations/026_create_quarterly_reports.sql` directly to the running database via psql or DB client.

**Command:**
```bash
psql -U postgres -d pmo_dashboard -f database/migrations/026_create_quarterly_reports.sql
```

**Verification criteria:**
- `SELECT * FROM quarterly_reports LIMIT 1` — returns empty result (no error = table exists)
- `GET /api/university-operations/quarterly-reports?fiscal_year=2026&quarter=Q1` returns `[]` (not a 500 error)
- Browser console shows `[Physical] fetchQuarterlyReport: { found: false }` (not an error)

---

#### EN-B: Fix `currentQuarterStatus` to Read from Quarterly Report (CRITICAL)

**Problem:** `currentQuarterStatus` computed (line 172–176) reads `currentOperation.value[status_q{N}]` — the per-pillar field from `university_operations` table. After quarterly submission, this field is never updated, so the hero bar always shows "Not Started" or "Draft".

**File:** `pmo-frontend/pages/university-operations/physical/index.vue`

**Change:** Replace the computed to derive from `currentQuarterlyReport.value?.publication_status`:

```js
// Phase EN-B: Read quarterly report status — not per-pillar status_qN field
const currentQuarterStatus = computed(() => {
  return currentQuarterlyReport.value?.publication_status ?? 'NOT_STARTED'
})
```

**Note:** The per-pillar `status_q1..q4` fields on `university_operations` were introduced by Phase DY-D but are NOT updated by the quarterly-reports workflow. They remain orphaned. The canonical quarterly status lives in `quarterly_reports.publication_status`.

**Verification criteria:**
- Submit a quarterly report → hero bar status chip changes to "Pending Review"
- Refresh page → hero bar still shows "Pending Review"
- Admin approves → hero bar shows "Approved"

---

#### EN-C: Enhance Submit Button State Model (HIGH)

**Problem:** Three gaps in header button rendering (Finding EN-5):
1. PENDING_REVIEW (non-owner): No feedback — button disappears with no explanation
2. PUBLISHED: No "Approved" visual indicator in header
3. REJECTED: Button label still reads "Submit for Review" — should read "Resubmit"

**File:** `pmo-frontend/pages/university-operations/physical/index.vue` (lines 1049–1076)

**Changes required:**

1. Add disabled "Pending Review" button when quarterly report is PENDING_REVIEW and user cannot withdraw:
```html
<v-btn
  v-else-if="currentQuarterlyReport && currentQuarterlyReport.publication_status === 'PENDING_REVIEW' && !canWithdrawAllPillars()"
  color="primary"
  variant="tonal"
  density="compact"
  prepend-icon="mdi-clock-outline"
  disabled
  class="flex-sm-0-0-auto"
>
  <span class="d-none d-sm-inline">Pending Review</span>
</v-btn>
```

2. Add "Approved" chip when quarterly report is PUBLISHED:
```html
<v-chip
  v-else-if="currentQuarterlyReport && currentQuarterlyReport.publication_status === 'PUBLISHED'"
  color="success"
  variant="tonal"
  size="small"
  prepend-icon="mdi-check-circle"
  class="flex-sm-0-0-auto"
>
  Approved
</v-chip>
```

3. Change "Submit for Review" label to "Resubmit" when quarterly report is REJECTED:
```html
<v-btn
  v-if="canSubmitAllPillars()"
  ...
>
  <span class="d-none d-sm-inline">
    {{ currentQuarterlyReport?.publication_status === 'REJECTED' ? 'Resubmit' : 'Submit for Review' }}
  </span>
</v-btn>
```

**Verification criteria:**
- DRAFT state: "Submit for Review" button visible, enabled
- After submit (PENDING_REVIEW, user is submitter): "Withdraw Submission" button visible
- After submit (PENDING_REVIEW, other non-admin user): Disabled "Pending Review" button visible
- After admin approve (PUBLISHED): "Approved" chip visible, no submit button
- After admin reject (REJECTED): "Resubmit" button visible, enabled

---

#### EN-D: Multi-Select Batch Actions in Pending Reviews (LOW)

**Problem:** `pending-reviews.vue` only supports single-item approve/reject via meatball menu. User requires:
- Select All / Deselect All / per-row checkbox
- Batch "Approve Selected" and "Reject Selected" actions

**File:** `pmo-frontend/pages/admin/pending-reviews.vue`

**Changes required:**

1. Add `selectedItems` ref and wire to `v-data-table`:
```js
const selectedItems = ref<PendingItem[]>([])
```

2. Add `show-select` + `v-model:selected` to `v-data-table`:
```html
<v-data-table
  v-model:selected="selectedItems"
  show-select
  ...
>
```

3. Add batch action toolbar above table (shown when `selectedItems.length > 0`):
```html
<v-toolbar v-if="selectedItems.length > 0" density="compact" color="primary" class="mb-2">
  <span class="ml-3 text-body-2">{{ selectedItems.length }} selected</span>
  <v-spacer />
  <v-btn variant="text" @click="approveSelected" :loading="batchLoading === 'approve'">
    Approve Selected
  </v-btn>
  <v-btn variant="text" color="error" @click="openBatchRejectDialog" :loading="batchLoading === 'reject'">
    Reject Selected
  </v-btn>
</v-toolbar>
```

4. Add `batchLoading` ref and `approveSelected()` / `openBatchRejectDialog()` functions:
- `approveSelected()` calls approve endpoint for each selected item serially
- Batch reject opens the reject notes dialog, applies to all selected after confirm

**Verification criteria:**
- Checkbox column appears in table
- "Approve Selected" / "Reject Selected" toolbar appears when rows selected
- Batch approve processes all selected rows
- Batch reject prompts for notes, applies to all selected rows
- Selected items cleared after batch action completes

---

### Phase EN Governance Directives

| # | Directive | Phase |
|---|-----------|-------|
| 76 | **`quarterly_reports` table must exist in running DB before quarterly workflow functions** | Phase EN-A |
| 77 | **`currentQuarterStatus` must derive from `quarterly_reports.publication_status`** | Phase EN-B |
| 78 | **Submit button must show PENDING_REVIEW disabled state for all users** | Phase EN-C |
| 79 | **PUBLISHED quarterly report must show Approved indicator in header** | Phase EN-C |
| 80 | **Rejected quarterly report submit button must read "Resubmit"** | Phase EN-C |
| 81 | **Pending Reviews must support multi-select batch approve/reject** | Phase EN-D |

---

### Phase EN Execution Priority

| Priority | Step | Severity | Scope | Key Risk | Status |
|----------|------|----------|-------|----------|--------|
| 1 | EN-A: Apply migration 026 to DB | CRITICAL | DB (manual) | Table absence silently breaks entire workflow | ✅ DONE (file exists; user applies manually) |
| 2 | EN-B: Fix `currentQuarterStatus` computed | CRITICAL | Frontend | 1-line change; no side effects | ✅ DONE |
| 3 | EN-C: Submit button state model | HIGH | Frontend | Additive template changes only | ✅ DONE |
| 4 | EN-D: Multi-select Pending Reviews | LOW | Frontend | Independent; no backend changes | ✅ DONE |

**EN-A is a manual DB operation and must be performed before EN-B verification.**
**EN-B, EN-C, EN-D are frontend-only changes.**

---

## Phase EO — Dual Workflow Removal, Hero Bar Cleanup & Header Reorder

> **Prerequisite:** Phase EN ✅ (EN-A through EN-D IMPLEMENTED)
> **Research Reference:** `research.md` Section 1.94
> **Trigger:** (A) Approval status not reflecting — page still shows "Submit for Review" / "Not Started" after Pending Review approval; (B) Redundant and inconsistent status indicators; (C) Header button order incorrect (Submit before Export).

### Context

Phase EO research revealed a **dual workflow conflict** as the primary root cause. Two submission workflows coexist on the Physical Accomplishment page:

- **Workflow A (Quarterly Report)** — header Submit button, updates `quarterly_reports` table ✅ correct
- **Workflow B (Pillar-Level)** — pillar header card Submit/Approve/Reject buttons, updates `university_operations.publication_status` ← legacy, never updated by quarterly workflow

Because Workflow B never updates when Workflow A submits/approves, the pillar header and hero bar always show "Draft" / "Not Started" even after quarterly submission and approval. The two status chips in the hero bar (pillar-level left, quarterly right) directly contradict each other.

The plan for Phase EO is **minimal surgical removal** of the legacy Workflow B UI elements — no new features required.

---

### Phase EO Steps

#### EO-A: Remove Pillar-Level Action Buttons from Pillar Header Card (CRITICAL)

**Problem:** The pillar header card (lines 1261–1332) contains two groups of action buttons from the old per-pillar workflow that conflict with the quarterly report workflow:
- Group 1 (lines 1261–1306): Submit for Review / Withdraw / Approve / Reject (pillar-level, calls `university_operations` endpoints)
- Group 2 (lines 1308–1332): "Approve Q1" / "Reject Q1" (calls wrong `approve-quarter` endpoint — updates wrong table)

**Action:** Remove both `div` groups from the pillar header card template.

**Rationale:**
- Workflow A (quarterly report, header row) handles all user-facing submission
- Admin quarterly approval happens in Pending Reviews, not inline on the Physical Accomplishment page
- Per-pillar `university_operations.publication_status` is no longer the canonical submission status

**Functions that become dead code after this removal:**
`canSubmitForReview()`, `canWithdraw()`, `canApprove()`, `canReject()`, `submitForReview()`, `withdrawSubmission()`, `approveEntry()`, `canApproveQuarter()`, `canRejectQuarter()`, `approveQuarterEntry()`, `openRejectQuarterDialog()`

These functions should also be **removed from the script** to keep the codebase clean.

**Verification criteria:**
- No Submit / Approve / Reject buttons appear inside the pillar header card
- The pillar header card shows: pillar name, UACS code, FY chip, indicator metrics only
- Quarterly report submission is exclusively through the page header Submit button

---

#### EO-B: Consolidate Hero Bar — Remove Redundant Pillar Status Chip (HIGH)

**Problem:** The hero bar (lines 1136–1166) renders two status chips:
- Left: Pillar name + `currentOperation.publication_status` chip (always "Draft" — stale Workflow B data)
- Right: Quarter chip + `currentQuarterStatus` chip (correct, from quarterly report)

The left-side chip always contradicts the right-side chip, misleading users.

**Action:** Remove the left-side pillar publication status chip from the hero bar. Keep:
- Pillar icon + name (identity)
- Quarter chip (right side)
- Quarterly status chip (right side, from `currentQuarterStatus`)

The hero bar should communicate: "You are viewing [Pillar Name] | [Quarter] → [Quarterly Report Status]"

**Verification criteria:**
- Hero bar shows pillar name and quarterly status only
- After quarterly submission → quarterly status shows "Pending Review"
- After quarterly approval → quarterly status shows "Published"
- No contradictory "Draft" chip visible

---

#### EO-C: Fix Hero Bar "Not Started" Chip — Remove Pillar Operation Fallback (HIGH)

**Problem:** Hero bar left side renders:
```html
<v-chip v-else color="grey" size="x-small" variant="tonal">Not Started</v-chip>
```
when `currentOperation` is null (shown as fallback when pillar has no operation record).

After EO-B removes the pillar status chip entirely, this fallback is also removed automatically. However if EO-B keeps any pillar context display, this fallback must not show the misleading "Not Started" for Workflow B's state.

**Action:** Confirm this chip is removed as part of EO-B's cleanup of the hero bar left side.

---

#### EO-D: Remove Pillar Header Card Status Chip (MEDIUM)

**Problem:** The pillar header card (lines 1229–1242) contains:
```html
<v-chip v-if="currentOperation" :color="getPublicationStatusColor(currentOperation.publication_status)">
  {{ getPublicationStatusLabel(currentOperation.publication_status) }}
```
Shows `university_operations.publication_status` — always "Draft" after quarterly submission. This is the second location of the stale pillar-level status.

**Action:** Remove this chip from the pillar header card's right column (Row 1). Retain FY chip and indicator/achievement rate chips.

**Verification criteria:**
- Pillar header card shows: FY chip + Indicators chip + Achievement rate chip
- No publication status chip in pillar header card

---

#### EO-E: Fix v-alert Rejection Banner (MEDIUM)

**Problem:** The v-alert rejection banner (lines 1168–1179) checks:
```html
v-if="currentOperation && currentOperation.publication_status === 'REJECTED'"
```
This is pillar-level rejection (Workflow B) — never triggered by quarterly rejection.

**Action:** Change condition to check quarterly report rejection:
```html
v-if="currentQuarterlyReport && currentQuarterlyReport.publication_status === 'REJECTED'"
```
Also update the alert text to describe quarterly rejection, not pillar rejection.

**Verification criteria:**
- Alert shows when quarterly report is REJECTED
- Alert disappears when user resubmits (quarterly report moves to PENDING_REVIEW)
- Alert does NOT appear for pillar-level "REJECTED" status

---

#### EO-F: Reorder Header Controls — Export Before Submit (LOW)

**Problem:** Current header control order: Reporting Period → Fiscal Year → Submit → Export
**Required order:** Reporting Period → Fiscal Year → Export → Submit

**Action:** Move the Export `v-menu` block (lines 1100–1131) to appear BEFORE the Submit/status buttons block (lines 1047–1098) in the template.

**Verification criteria:**
- Header order: Reporting Period selector | Fiscal Year selector | Export button | Submit/status button
- Visual hierarchy: data selectors left, actions right, export logically precedes submission

---

### Phase EO Dead Code Cleanup

After EO-A removes the pillar-level action buttons from the template, these script functions are no longer called and should be removed:

| Function | Line (approx) | Reason for removal |
|---|---|---|
| `canSubmitForReview()` | 469 | Only guarded pillar header Submit button |
| `canWithdraw()` | 481 | Only guarded pillar header Withdraw button |
| `canApprove()` | 487 | Only guarded pillar header Approve button |
| `canReject()` | 498 | Only guarded pillar header Reject button |
| `canApproveQuarter()` | 503 | Only guarded "Approve Q1" button |
| `canRejectQuarter()` | 511 | Only guarded "Reject Q1" button |
| `submitForReview()` | 802 | Pillar-level submit action |
| `withdrawSubmission()` | 816 | Pillar-level withdraw action |
| `approveEntry()` | 830 | Pillar-level approve action |
| `approveQuarterEntry()` | 866 | Per-quarter approve action (wrong endpoint) |
| `openRejectQuarterDialog()` | ~875 | Per-quarter reject dialog |
| `rejectQuarterDialog` ref | ~151 | Per-quarter reject dialog state |
| `rejectQuarterNotes` ref | ~152 | Per-quarter reject dialog state |

**Retained functions (still needed):**
- `canSubmitAllPillars()` ✅ — guards header Submit
- `canWithdrawAllPillars()` ✅ — guards header Withdraw
- `submitAllPillarsForReview()` ✅ — header submit action
- `withdrawAllPillarsSubmission()` ✅ — header withdraw action
- `canEditData()` ✅ — data entry guard

---

### Phase EO Governance Directives

| # | Directive | Phase |
|---|-----------|-------|
| 82 | **Pillar-level submission workflow buttons must be removed from Physical Accomplishment page** | Phase EO-A |
| 83 | **Hero bar must show only quarterly report status, not per-pillar publication_status** | Phase EO-B |
| 84 | **Pillar header card must not show publication_status chip** | Phase EO-D |
| 85 | **Rejection banner must reflect quarterly report REJECTED state** | Phase EO-E |
| 86 | **Header control order: Reporting Period → Fiscal Year → Export → Submit** | Phase EO-F |

---

### Phase EO Execution Priority

| Priority | Step | Severity | Scope | Key Risk | Status |
|----------|------|----------|-------|----------|--------|
| 1 | EO-A: Remove pillar-level action buttons + dead code | CRITICAL | Frontend | Removes 13 functions — must not break remaining workflow | ✅ DONE |
| 2 | EO-B/C: Consolidate hero bar (remove stale pillar chip) | HIGH | Frontend | Template-only change | ✅ DONE |
| 3 | EO-D: Remove pillar header status chip | MEDIUM | Frontend | Template-only change | ✅ DONE |
| 4 | EO-E: Fix rejection banner source | MEDIUM | Frontend | 1-line condition change | ✅ DONE |
| 5 | EO-F: Reorder Export before Submit in header | LOW | Frontend | Template reorder only | ✅ DONE |

**All EO steps are frontend-only. EO-A must be done first as it removes dead code referenced in EO-B/C/D.**

---

## Phase EP — Quarterly Report Status Retrieval Failure & UI State Persistence Fix

> **Prerequisite:** Phase EO ✅ (all EO steps DONE)
> **Research Reference:** `research.md` Section 1.95
> **Trigger:** (A) Submit button shows persistently after hard refresh despite PUBLISHED record in DB; (B) "Submit for Review" briefly flashes during page load even for approved reports; (C) Clicking Submit on already-approved quarter produces backend error "Only DRAFT or REJECTED reports can be submitted. Current status: PUBLISHED"

### Context

Phase EP research identified a **race condition in page initialization** as the primary root cause. The `watch(selectedFiscalYear)` fires when `fetchFiscalYears()` auto-corrects the fiscal year (e.g., 2026 → 2025), triggering a duplicate call to `fetchQuarterlyReport()` that runs **concurrently** with `onMounted`'s own `fetchQuarterlyReport()` call. The last call to resolve wins. If the watch-triggered call completes after `onMounted`'s call and encounters any error, it resets `currentQuarterlyReport.value = null` — overwriting the correct PUBLISHED status.

Additionally, `canSubmitAllPillars()` has a fallback path that returns `true` during the brief window between `fetchAllPillarOperations()` completing and `fetchQuarterlyReport()` resolving — causing the Submit button to flash prematurely.

---

### Phase EP Steps

#### EP-A: Add `isInitializing` Guard to Prevent Watch From Running During onMounted

**Problem:** `watch(selectedFiscalYear)` fires during `onMounted` when `fetchFiscalYears()` changes the year, creating a race with `onMounted`'s own `fetchQuarterlyReport()` call (Finding EP-1, EP-5, EP-6).

**Action:** Add a boolean `isInitializing` flag that prevents the watch from executing during `onMounted`:

```js
// Add near top of script (after ref declarations):
let isInitializing = true

// In watch(selectedFiscalYear) — add guard at top:
watch(selectedFiscalYear, async (newYear) => {
  if (isInitializing) return             // ← NEW: Skip during onMounted
  if (!newYear || newYear < 2020) return
  ...
  await fetchQuarterlyReport()
})

// In onMounted — set flag to false AFTER all fetches:
onMounted(async () => {
  await fiscalYearStore.fetchFiscalYears()
  await fetchPillarData()
  await fetchAllPillarOperations()
  await fetchQuarterlyReport()
  isInitializing = false                 // ← NEW: Watch can now fire for manual changes
})
```

**Result:** During `onMounted`, the watch is suppressed — only `onMounted` calls `fetchQuarterlyReport()`. After `onMounted` completes, user-driven FY changes trigger the watch normally.

**Scope:** `index.vue` — script section (2 new lines + 1 guard)
**Risk:** Minimal — only suppresses the watch during initial page load, not during user interactions.

---

#### EP-B: Add `isLoadingQuarterlyReport` Ref to Guard Submit Button During Load

**Problem:** `canSubmitAllPillars()` fallback path returns `true` when `currentQuarterlyReport.value = null` AND `allPillarOperations.length > 0` — causing the Submit button to flash before `fetchQuarterlyReport()` resolves (Finding EP-2, EP-3).

**Action:** Add a dedicated loading ref that blocks the Submit button while `fetchQuarterlyReport()` is in flight:

```js
// Add ref (near other loading refs):
const isLoadingQuarterlyReport = ref(true)   // pessimistic start — hide Submit until loaded

// In fetchQuarterlyReport() — wrap with loading state:
async function fetchQuarterlyReport() {
  isLoadingQuarterlyReport.value = true
  if (!selectedFiscalYear.value || selectedFiscalYear.value < 2020) {
    currentQuarterlyReport.value = null
    isLoadingQuarterlyReport.value = false
    return
  }
  try {
    ...
    currentQuarterlyReport.value = reports.length > 0 ? reports[0] : null
  } catch (err) {
    console.error('[Physical] fetchQuarterlyReport: Error:', err)
    currentQuarterlyReport.value = null
  } finally {
    isLoadingQuarterlyReport.value = false   // ← always clears loading
  }
}

// In canSubmitAllPillars() — add loading guard:
function canSubmitAllPillars(): boolean {
  if (isLoadingQuarterlyReport.value) return false   // ← NEW: Block during load
  ...
}
```

**In template:** The submit button `v-if="canSubmitAllPillars()"` automatically becomes false during loading — no template changes needed.

**Result:** Submit button never flashes during page load. It only appears after `fetchQuarterlyReport()` completes AND status is DRAFT/REJECTED.

**Scope:** `index.vue` — 1 new ref + `fetchQuarterlyReport()` `finally` block + 1-line guard in `canSubmitAllPillars()`
**Risk:** None — purely additive; pessimistic default (true) means Submit hidden until data loaded.

---

#### EP-C: Add Defensive State Re-Fetch in `submitAllPillarsForReview()`

**Problem:** If `currentQuarterlyReport.value` is null when the user clicks Submit (e.g., race condition escaped the EP-A/EP-B guards), the function calls CREATE → backend returns existing PUBLISHED record → SUBMIT fails with "Current status: PUBLISHED" (Finding EP-4).

**Action:** Add a defensive `fetchQuarterlyReport()` call at the START of `submitAllPillarsForReview()` to ensure the latest state is loaded before proceeding:

```js
async function submitAllPillarsForReview() {
  actionLoading.value = true
  try {
    // EP-C: Defensive re-fetch to ensure latest status before submitting
    await fetchQuarterlyReport()

    // Guard: if after re-fetch the status is not submittable, abort
    if (currentQuarterlyReport.value &&
        currentQuarterlyReport.value.publication_status !== 'DRAFT' &&
        currentQuarterlyReport.value.publication_status !== 'REJECTED') {
      toast.warning(`This quarter is already ${currentQuarterlyReport.value.publication_status.toLowerCase().replace('_', ' ')}`)
      return
    }

    let report = currentQuarterlyReport.value
    if (!report) {
      report = await api.post<any>('/api/university-operations/quarterly-reports', {...})
      currentQuarterlyReport.value = report
    }
    await api.post(`/api/university-operations/quarterly-reports/${report.id}/submit`, {})
    toast.success(`${selectedQuarter.value} submitted for review`)
    await fetchQuarterlyReport()
    await findCurrentOperation()
  } catch (err: any) {
    ...
  } finally {
    actionLoading.value = false
  }
}
```

**Result:** Even if UI state is stale, clicking Submit re-validates current DB state before proceeding. If the record is PUBLISHED, user sees a clear warning instead of a cryptic backend error.

**Scope:** `index.vue` — `submitAllPillarsForReview()` function only
**Risk:** Adds one extra API call per submit click — acceptable given the critical nature of the guard.

---

### Phase EP Governance Directives

| # | Directive | Phase |
|---|-----------|-------|
| 87 | **`watch(selectedFiscalYear)` must not call `fetchQuarterlyReport()` during `onMounted` initialization** | Phase EP-A |
| 88 | **Submit button must be hidden while `fetchQuarterlyReport()` is in flight** | Phase EP-B |
| 89 | **`canSubmitAllPillars()` must return false during quarterly report loading state** | Phase EP-B |
| 90 | **`submitAllPillarsForReview()` must re-validate current status before proceeding** | Phase EP-C |
| 91 | **UI must never show Submit for a PUBLISHED or PENDING_REVIEW quarterly report** | Phase EP-B/C |

---

### Phase EP Execution Priority

| Priority | Step | Severity | Scope | Key Risk | Status |
|----------|------|----------|-------|----------|--------|
| 1 | EP-A: Add `isInitializing` guard to watch | CRITICAL | Frontend | 2-line change; blocks the race condition source | ✅ DONE |
| 2 | EP-B: Add `isLoadingQuarterlyReport` ref + guard in `canSubmitAllPillars()` | CRITICAL | Frontend | Pessimistic init prevents Submit flash entirely | ✅ DONE |
| 3 | EP-C: Defensive re-fetch in `submitAllPillarsForReview()` | HIGH | Frontend | Safety net for any residual null-state escape | ✅ DONE |

**All EP steps are frontend-only and confined to `index.vue`. EP-A and EP-B are independent and can be implemented simultaneously. EP-C depends on neither but references the same function.**

---

## Phase EQ — NestJS Route Order Fix: Quarterly Reports GET Endpoints Unreachable

> **Prerequisite:** Phase EP ✅
> **Research Reference:** `research.md` Section 1.96
> **Trigger:** `GET /api/university-operations/quarterly-reports?fiscal_year=2025&quarter=Q1` returns HTTP 400 "Validation failed (uuid is expected)" — frontend enters FETCH_ERROR state on every page load.

### Context

`@Get(':id')` at line 164 of `university-operations.controller.ts` intercepts all GET requests whose path segment matches before any literal string route declared later. The quarterly-reports routes were appended at lines 421–491 (after line 164), violating the NestJS route-order rule documented by Phase DP-A at line 138. The fix is a single block move — no logic changes required.

---

### Phase EQ Steps

#### EQ-A: Move Quarterly Reports Block Before `@Get(':id')` `[CRITICAL]`

**Action:** Move the entire `// ─── Phase EM-B: Quarterly Reports ─────` block (lines 421–491) to immediately after `@Get('config/fiscal-years')` (line ~162) and BEFORE `@Get(':id')` (line 164).

**Required declaration order after fix:**
```
@Get('config/fiscal-years')          ← stays (already before :id)
[QUARTERLY REPORTS BLOCK INSERTED HERE]
@Get(':id')                          ← stays at current position
```

**Internal order of moved block (must be preserved):**
1. `@Post('quarterly-reports')` — create
2. `@Get('quarterly-reports')` — list (fiscal_year + quarter query)
3. `@Get('quarterly-reports/pending-review')` — admin pending (literal before /:id)
4. `@Get('quarterly-reports/:id')` — single by UUID
5. `@Post('quarterly-reports/:id/submit')` — submit
6. `@Post('quarterly-reports/:id/approve')` — approve
7. `@Post('quarterly-reports/:id/reject')` — reject
8. `@Post('quarterly-reports/:id/withdraw')` — withdraw

**Verification criteria:**
- `GET /api/university-operations/quarterly-reports?fiscal_year=2025&quarter=Q1` returns `[]` or a record (HTTP 200)
- Browser console shows `[Physical] fetchQuarterlyReport: { found: true/false }` (no error)
- `FETCH_ERROR` state is NOT triggered on page load
- Quarterly report submission, withdrawal, pending-review list all functional

---

### Phase EQ Governance Directives

| # | Directive | Phase |
|---|-----------|-------|
| 92 | **All literal-string GET routes must be declared before `@Get(':id')` in the controller** | Phase EQ-A |
| 93 | **`@Get('quarterly-reports')` must be reachable without UUID validation** | Phase EQ-A |

---

### Phase EQ Execution Priority

| Priority | Step | Severity | Scope | Key Risk | Status |
|----------|------|----------|-------|----------|--------|
| 1 | EQ-A: Move quarterly-reports block before `@Get(':id')` | CRITICAL | Backend controller | Single block move — no logic changes | ✅ DONE |

**Backend-only change. One move operation. No DTO, service, or frontend changes required.**

---

---

## Phase ER — Post-Publication Edit Control and Authorization Governance Refinement

**Research Reference:** Section 1.97
**Date:** 2026-03-12
**Priority:** HIGH — Published quarterly reports are not actually edit-locked; non-admin users can modify indicator/financial data after quarterly approval.

---

### Phase ER Problem Statement

The quarterly report approval workflow (`quarterly_reports.publication_status = 'PUBLISHED'`) does not propagate any write-lock to the underlying `university_operations` records. Both the frontend guard (`canEditData()`) and backend enforcement (`validateOperationEditable()`) check only `university_operations.publication_status`, which remains `DRAFT` permanently after quarterly approval. Result: data integrity is unprotected post-publication.

---

### Phase ER Steps

#### ER-A: Fix Frontend `canEditData()` — Add Quarterly Report Published Check

**File:** `pmo-frontend/pages/university-operations/physical/index.vue`
**Current (lines 472–477):**
```typescript
function canEditData(): boolean {
  if (!currentOperation.value) return canAdd('operations')
  if (isAdmin.value) return true
  if (currentOperation.value.publication_status === 'PUBLISHED') return false
  return isOwnerOrAssigned(currentOperation.value)
}
```

**Required change:** After the Admin short-circuit, add a check on `currentQuarterlyReport.value?.publication_status`:

```typescript
function canEditData(): boolean {
  if (!currentOperation.value) return canAdd('operations')
  if (isAdmin.value) return true
  if (currentOperation.value.publication_status === 'PUBLISHED') return false
  if (currentQuarterlyReport.value?.publication_status === 'PUBLISHED') return false
  return isOwnerOrAssigned(currentOperation.value)
}
```

**Scope:** One line addition. No state changes. Admin bypass preserved. `currentQuarterlyReport` is already a ref populated by `fetchQuarterlyReport()`.

---

#### ER-B: Fix Backend `validateOperationEditable()` — Add Quarterly Report JOIN

**File:** `pmo-backend/src/university-operations/university-operations.service.ts`
**Current (lines 129–144):**
```typescript
private async validateOperationEditable(operationId: string): Promise<void> {
  const result = await this.db.query(
    `SELECT publication_status FROM university_operations WHERE id = $1 AND deleted_at IS NULL`,
    [operationId],
  );
  if (result.rows[0].publication_status === 'PUBLISHED') {
    throw new ForbiddenException(
      'Cannot modify indicators/financials on published operations. Withdraw to draft status first.',
    );
  }
}
```

**Required change:** Extend the query to LEFT JOIN `quarterly_reports` on matching `fiscal_year` + `quarter`, then also reject if `qr.publication_status = 'PUBLISHED'`:

```typescript
private async validateOperationEditable(operationId: string): Promise<void> {
  const result = await this.db.query(
    `SELECT uo.publication_status, qr.publication_status AS quarterly_status
     FROM university_operations uo
     LEFT JOIN quarterly_reports qr
       ON qr.fiscal_year = uo.fiscal_year AND qr.quarter = uo.quarter
     WHERE uo.id = $1 AND uo.deleted_at IS NULL`,
    [operationId],
  );
  const row = result.rows[0];
  if (row.publication_status === 'PUBLISHED') {
    throw new ForbiddenException(
      'Cannot modify indicators/financials on published operations. Withdraw to draft status first.',
    );
  }
  if (row.quarterly_status === 'PUBLISHED') {
    throw new ForbiddenException(
      'Cannot modify indicators/financials: the quarterly report for this period has been published.',
    );
  }
}
```

**Scope:** SQL query extended, one additional check added. No change to function signature or callers.

---

#### ER-C: Add UI Read-Only Advisory Banner for Published Quarter

**File:** `pmo-frontend/pages/university-operations/physical/index.vue`

When `currentQuarterlyReport.value?.publication_status === 'PUBLISHED'` and the user is not Admin, show an advisory v-alert explaining the data is read-only for the current quarter.

**Placement:** Above the pillar data entry section, below the hero bar. Use `v-alert` type `info` variant `tonal`.

**Text:** "This quarter's report has been published. Data entry is locked. Contact an Administrator to request changes."

**Condition:** `!isAdmin && currentQuarterlyReport?.publication_status === 'PUBLISHED'`

---

#### ER-D: Artifact Cleanup — Commit Staged Reference Document Deletions

**Scope:** Git commit only.

10 reference summary files in `docs/References/` are already deleted from disk and staged (`D` status in git). These are superseded by the ACE plan and research artifacts:
- `approval_visibility_risk_summary_2026-02-16.txt`
- `assignment_delegation_risk_summary_2026-02-18.txt`
- `backend_repair_risk_summary_2026-02-15.txt`
- `edit_to_draft_reset_risk_summary_2026-02-16.txt`
- `governance_refinement_risk_summary_2026-02-16.txt`
- `hierarchical_crud_implementation_risk_summary_2026-02-18.txt`
- `scope_control_summary_2026-02-11.txt`
- `security_audit_risk_summary_2026-02-13.txt`
- `state_machine_governance_risk_summary_2026-02-18.txt`
- `universal_draft_governance_risk_summary_2026-02-15.txt`

**Action:** Commit these 10 staged deletions as a clean-up commit. Untracked files (`docs/References/univ_op/`, new archive docs, new migration files) are NOT included in this cleanup commit — they are separate concerns.

---

### Phase ER Feasibility Assessment

**Deadline:** March 24, 2026 (12 days from today).

| Step | Effort | Risk | Feasibility |
|------|--------|------|-------------|
| ER-A: Frontend canEditData() | Trivial (1 line) | None | ✅ Confirmed feasible |
| ER-B: Backend validateOperationEditable() | Low (SQL extension) | Low — LEFT JOIN is safe | ✅ Confirmed feasible |
| ER-C: UI advisory banner | Low (v-alert) | None | ✅ Confirmed feasible |
| ER-D: Artifact cleanup commit | Trivial | None | ✅ Confirmed feasible |

**Total: All steps feasible well before March 24 deadline.**

---

### Phase ER Governance Directives

| # | Directive | Phase |
|---|-----------|-------|
| 94 | **Published quarterly report status must lock indicator/financial edits for non-admin users** | Phase ER-A/ER-B |
| 95 | **Backend edit enforcement must be authoritative regardless of frontend state** | Phase ER-B |
| 96 | **UI must communicate read-only state clearly when quarterly report is published** | Phase ER-C |

---

### Phase ER Execution Priority

| Priority | Step | Severity | Scope | Key Risk | Status |
|----------|------|----------|-------|----------|--------|
| 1 | ER-A: Fix `canEditData()` quarterly status check | HIGH | Frontend (1 line) | None — additive | ✅ DONE |
| 2 | ER-B: Fix `validateOperationEditable()` JOIN | HIGH | Backend service (SQL) | LEFT JOIN null safety | ✅ DONE |
| 3 | ER-C: Add read-only advisory banner | MEDIUM | Frontend (v-alert) | None | ✅ DONE |
| 4 | ER-D: Commit staged reference doc deletions | LOW | Git only | None | ⬜ PENDING (user commit) |

---

---

## Phase ES — Quarterly Report Governance: Revision Authorization Workflow and Edit Control for Published Reports

**Research Reference:** Section 1.98
**Date:** 2026-03-13
**Priority:** VERIFICATION — All requirements already implemented; this phase is a verification audit.

---

### Phase ES Problem Statement

The user requires that published quarterly reports be protected from direct modification via a revision request workflow with admin authorization. Investigation reveals that this entire governance model — edit locking, revision request UI, admin approval/denial, RBAC enforcement, auto-revert, audit logging — is **already fully implemented** in the codebase via the GOV-A through GOV-D phases.

---

### Phase ES Assessment: ALREADY IMPLEMENTED

#### Requirement 1: Hide Edit Buttons When Published — ✅ DONE

`canEditData()` (lines 479–492) returns `false` for:
- Staff/User when `currentQuarterlyReport.publication_status === 'PUBLISHED'`
- Admin when PUBLISHED unless `unlocked_by` is set

All edit controls are gated by `canEditData()`:
- Outcome Indicators: action column (line 1294), row click (line 1308), pencil button (line 1375)
- Output Indicators: action column (line 1411), row click (line 1425), pencil button (line 1492)

Backend enforcement via `validateOperationEditable()` (lines 132–188) provides authoritative protection regardless of frontend state.

#### Requirement 2: Show "Request Revision" Button — ✅ DONE

"Request Update" button (lines 1152–1161) replaces edit controls when report is PUBLISHED. Visible only when no pending unlock request exists. Triggers unlock request dialog (lines 1726–1761) requiring a reason.

#### Requirement 3: Revision Request Workflow — ✅ DONE

1. User clicks "Request Update" → dialog appears → submits reason
2. Backend `requestQuarterlyReportUnlock()` (lines 2527–2565) stores request
3. Request appears in Pending Reviews (`source: 'unlock_request'`)
4. Admin evaluates: Approve Unlock / Deny Unlock
5. Approval: `unlockQuarterlyReport()` → `PUBLISHED → DRAFT`, `unlocked_by` set
6. Denial: `denyQuarterlyReportUnlock()` → request cleared, remains PUBLISHED
7. After unlock: edit buttons visible again (`canEditData()` checks `unlocked_by`)

#### Requirement 4: Pending Reviews Integration — ✅ DONE

- Unlock requests fetched from `/quarterly-reports/pending-unlock` endpoint
- Displayed with `🔓` icon and requester's reason
- Admin action menu: "Approve Unlock" (green), "Deny Unlock" (red)
- Excluded from batch operations with warning message

#### Requirement 5: RBAC Enforcement — ✅ DONE

| Role | Direct Edit | Request Unlock | Approve/Deny | Override |
|------|-------------|---------------|--------------|----------|
| Staff/User | BLOCKED | YES | NO | NO |
| Admin | ONLY IF unlocked | YES | YES | NO |
| SuperAdmin | YES (with warning) | N/A | YES | FULL |

#### Requirement 6: Non-Disruptive — ✅ DONE

- Submit/Approve/Reject/Withdraw workflow unchanged
- Archive tracking via `snapshotSubmissionHistory()` records UNLOCKED events
- Auto-revert (`autoRevertQuarterlyReport()`) ensures any edit forces re-submission
- Multi-module Pending Reviews system unchanged (COI, Repairs unaffected)

---

### Phase ES Execution Plan: Operational Verification Only

No new code is required. The remaining action items are operational:

| Priority | Step | Scope | Status |
|----------|------|-------|--------|
| 1 | ES-A: Restart backend server to load GOV-phase code changes | Operations | ⬜ PENDING (user action) |
| 2 | ES-B: End-to-end verification — Staff submits, Admin approves, report locks, Staff requests unlock, Admin approves unlock, Staff edits | Testing | ⬜ PENDING |
| 3 | ES-C: Verify Pending Reviews shows unlock requests with approve/deny actions | Testing | ⬜ PENDING |
| 4 | ES-D: Verify Submission History records UNLOCKED events | Testing | ⬜ PENDING |

---

### Phase ES Feasibility Assessment

| Question | Answer |
|----------|--------|
| Is the task feasible? | **YES — it is already implemented** |
| Is the task realistic? | **YES — zero new code required; operational verification only** |
| Does it resolve the persistent issue? | **YES — once the backend is restarted**, edit controls will be hidden for published reports and the revision request workflow will be enforced end-to-end |
| Root cause of "persistent issue" | Backend server was not restarted after GOV-phase code changes were written. The code exists but was not executing because the running process still had the old code loaded. |

---

### Phase ES Governance Directives

| # | Directive | Phase |
|---|-----------|-------|
| 97 | **Published quarterly reports require revision authorization before editing (already enforced)** | Phase ES (VERIFIED) |
| 98 | **Backend server must be restarted after code changes for governance rules to take effect** | Phase ES (OPERATIONAL) |

---

---

## Phase ET — Financial Accomplishments Page (BAR No. 2)

**Research Reference:** Section 1.99
**Date:** 2026-03-17
**Priority:** HIGH — BAR No. 2 Financial Accomplishments is the second core module of University Operations, currently deferred with "Coming Soon" placeholder.

---

### Phase ET Problem Statement

The University Operations module tracks two BAR reports: Physical (BAR No. 1, implemented) and Financial (BAR No. 2, not implemented). The Financial Accomplishments page must follow the same structural pattern as the Physical page (fiscal year, quarter, pillar tabs, quarterly report governance) but display financial data organized by expense class (PS, MOOE, CO) with Appropriation, Obligations, and % Utilization columns, matching the Continuing Appropriations Excel structure.

The backend CRUD for `operation_financials` already exists. The primary work is: (1) add `expense_class` column, (2) build the frontend page, (3) enable the landing page card.

---

### Phase ET Terminology Reference (from Continuing Appropriations.xlsx)

| Term | Abbreviation | DB Column | Description |
|------|-------------|-----------|-------------|
| Appropriation | — | `allotment` | Total budget allocation for the period |
| Obligations | — | `obligation` | Actual obligations incurred against appropriation |
| % Utilization | — | Computed: `(obligation / allotment) × 100` | Budget utilization rate |
| Personal Services | PS | `expense_class = 'PS'` | Salaries, wages, personnel benefits |
| Maintenance & Other Operating Expenses | MOOE | `expense_class = 'MOOE'` | Supplies, utilities, operating costs |
| Capital Outlay | CO | `expense_class = 'CO'` | Equipment, buildings, infrastructure |
| Regular Agency Fund | RAF | `fund_type` enum | Government-appropriated funds |
| Internally Generated Fund | IGF | `fund_type` enum | University self-generated revenue |
| MFO | Major Final Output | — | Maps to 4 pillars (MFO1–MFO4) |
| Variance | — | Computed: `allotment - obligation` | Unobligated balance |
| Disbursement Rate | — | Computed: `(disbursement / obligation) × 100` | Cash outflow rate |

---

### Phase ET Steps

#### ET-A: Database Migration — Add `expense_class` Column

**File:** `database/migrations/029_add_expense_class_column.sql`

```sql
ALTER TABLE operation_financials
  ADD COLUMN IF NOT EXISTS expense_class VARCHAR(4)
  CHECK (expense_class IN ('PS', 'MOOE', 'CO'));

CREATE INDEX IF NOT EXISTS idx_of_expense_class
  ON operation_financials(expense_class);
```

**Scope:** One column addition with CHECK constraint. Nullable — existing records unaffected.

---

#### ET-B: Update DTO — Add `expense_class` to `CreateFinancialDto`

**File:** `pmo-backend/src/university-operations/dto/create-financial.dto.ts`

Add:

```typescript
@IsOptional()
@IsIn(['PS', 'MOOE', 'CO'])
expense_class?: string;
```

Update the service `createFinancial()` and `updateFinancial()` to include `expense_class` in INSERT/UPDATE queries.

---

#### ET-C: Create Financial Accomplishments Page

**File:** `pmo-frontend/pages/university-operations/financial/index.vue`

**Structure mirrors Physical page:**

1. **Header row:** Fiscal Year selector (from store) + Quarter selector + Export button + Submit/Status controls
2. **Hero bar:** Quarterly report status (reads `currentQuarterlyReport` — same entity as Physical)
3. **Lock advisory / Request Update:** Same governance banners as Physical page
4. **Pillar tabs:** Same 4 pillars (Higher Education, Advanced Education, Research, Extension) mapped to MFO1–MFO4
5. **Per-pillar financial table:**
   - **Grouped by campus** (Main Campus, Cabadbaran Campus) using `department` field
   - **Per campus, grouped by expense class** (PS, MOOE, CO) using `expense_class` field
   - **Columns:** Line Item (`operations_programs`), Appropriation (`allotment`), Obligations (`obligation`), % Utilization (computed), Variance (computed), Balance (computed)
   - **Subtotals:** Per expense class, per campus, and per pillar total — computed on the frontend
6. **Data entry dialog:** Form to add/edit financial line items with: operations_programs, expense_class (PS/MOOE/CO select), campus (department), allotment, obligation, disbursement, remarks
7. **Published edit warning dialog:** Same governance caution as Physical
8. **Unlock request dialog:** Same as Physical

**Key differences from Physical page:**
- No indicator taxonomy (pillar_indicator_taxonomy) — financial items are free-form line items
- No outcome/output distinction — financial items are categorized by expense class instead
- Subtotal computation is hierarchical: expense class → campus → pillar total
- Currency formatting throughout (PHP ₱ prefix, 2 decimal places, thousands separator)

---

#### ET-D: Enable Landing Page Financial Card

**File:** `pmo-frontend/pages/university-operations/index.vue`

1. Remove `disabled` from Financial card (line 560)
2. Update `navigateToFinancial()` to route to `/university-operations/financial`
3. Update card color from `grey` to active color (e.g., `success` or `teal`)
4. Remove "Coming Soon" chip, replace with navigation arrow

---

#### ET-E: Financial Page — Quarterly Report Integration

The Financial page shares the quarterly report entity with the Physical page. Both pages read/write to the same `quarterly_reports` record for a given `(fiscal_year, quarter)`.

**Implications:**
- Submit/Approve/Reject/Publish applies to both Physical AND Financial data simultaneously
- The `canEditData()` guard applies identically
- If a quarterly report is PUBLISHED, both Physical and Financial data are locked
- Unlock request from either page unlocks both

**No new quarterly report endpoints needed.** The Financial page calls the same endpoints:
- `GET /quarterly-reports?fiscal_year=X&quarter=Q1` — fetch status
- `POST /quarterly-reports/:id/submit` — submit for review
- `POST /quarterly-reports/:id/request-unlock` — request edit access

---

#### ET-F: Financial Export — Excel Generation

**Scope:** Export current pillar's financial data as Excel file matching the Continuing Appropriations format.

**Columns:** Line Item | Expense Class | Campus | Appropriation | Obligations | % Utilization | Variance | Balance

**Grouping:** By campus → by expense class, with subtotals.

**Library:** Same export mechanism as Physical page (likely `xlsx` or `file-saver`).

---

### Phase ET Governance Directives

| # | Directive | Phase |
|---|-----------|-------|
| 99 | **Financial records must be categorized by expense class (PS, MOOE, CO)** | Phase ET-A |
| 100 | **Financial page shares quarterly report governance with Physical page** | Phase ET-E |
| 101 | **Appropriation, Obligations, and % Utilization are the authoritative BAR No. 2 columns** | Phase ET-C |
| 102 | **Currency values display as PHP with ₱ prefix, 2 decimal places, thousands separator** | Phase ET-C |
| 103 | **Subtotals are computed frontend-side — no backend aggregation endpoint** | Phase ET-C |

---

### Phase ET Execution Priority

| Priority | Step | Severity | Scope | Key Risk | Status |
|----------|------|----------|-------|----------|--------|
| 1 | ET-A: Add `expense_class` column migration | HIGH | DB migration | None — nullable, additive | ⬜ PENDING |
| 2 | ET-B: Update DTO + service for `expense_class` | HIGH | Backend | Ensure INSERT/UPDATE include new field | ⬜ PENDING |
| 3 | ET-C: Create Financial Accomplishments page | HIGH | Frontend (new file) | Largest scope — follow Physical patterns | ⬜ PENDING |
| 4 | ET-D: Enable landing page Financial card | LOW | Frontend (edit) | Trivial — remove disabled + update nav | ⬜ PENDING |
| 5 | ET-E: Verify quarterly report integration | MEDIUM | Integration | Shared entity — verify no conflicts | ⬜ PENDING |
| 6 | ET-F: Financial Excel export | LOW | Frontend | Follow existing export pattern | ⬜ PENDING |

---

### Phase ET Feasibility Assessment

| Factor | Assessment |
|--------|------------|
| Backend CRUD | **Already exists** — `findFinancials()`, `createFinancial()`, `updateFinancial()`, `removeFinancial()` |
| Computed metrics | **Already exists** — `computeFinancialMetrics()` with variance, utilization_rate, balance, disbursement_rate |
| Publication governance | **Already exists** — `validateOperationEditable()` with quarterly JOIN, `canEditData()` |
| Quarterly report entity | **Already exists** — shared with Physical page |
| Unlock workflow | **Already exists** — request/approve/deny cycle |
| DB schema | **Mostly exists** — only `expense_class` column missing |
| Frontend page | **Does not exist** — must be created, but Physical page provides complete structural template |

**Estimated scope:** ET-A and ET-B are trivial. ET-C is the bulk of work (new 800–1200 line page file) but follows an established pattern. ET-D is trivial. ET-E is verification only. ET-F is low priority.

**Feasible:** YES — backend is ready; frontend is the primary deliverable.

---

---

## Phase EV — Financial Accomplishment Module: Data Retrieval Fix, UI Enhancement, and DBM-Aligned Pillar-Based Architecture

**Research Reference:** Section 2.02
**Date:** 2026-03-19
**Status:** ✅ PHASE 3 COMPLETE — EV-A through EV-F IMPLEMENTED (2026-03-19)
**Priority:** P0 — Critical bugs block Financial module usability. Stakeholder milestone: April 6, 2026.
**Prerequisite:** Phase ET complete ✅ (Financial page created, expense_class column added)

---

### Phase EV Problem Statement

The Financial Accomplishments page (Phase ET) was successfully created but has three confirmed bugs that prevent correct operation: (1) `api.delete()` call crashes at runtime because `useApi` exports `del`, not `delete`; (2) % Utilization column always shows "—" because the template reads `utilization_per_approved_budget` (DB column, never computed) instead of `utilization_rate` (computed by `computeFinancialMetrics()`); (3) Balance formula differs between backend (`allotment - disbursement`) and frontend subtotals (`allotment - obligation`), misaligning with DBM standard "Unobligated Balance" = Appropriation − Obligations. Additionally, the page lacks a data entry guide, has a generic hero section, and doesn't distinguish Financial submissions from Physical in the workflow labels.

---

### Phase EV Steps

#### EV-A: Fix `api.delete` → `api.del` Runtime Error [CRITICAL]

**Scope:** Frontend — single line fix
**File:** `pmo-frontend/pages/university-operations/financial/index.vue` line 528
**Research:** EV-2

**Problem:** `await api.delete(...)` throws `TypeError: api.delete is not a function` at runtime. The `useApi` composable exports `del`, not `delete`. Every other module in the codebase correctly uses `api.del()`.

**Change:**
```typescript
// Current (line 528):
await api.delete(`/api/university-operations/${currentOperation.value.id}/financials/${record.id}`)

// Fixed:
await api.del(`/api/university-operations/${currentOperation.value.id}/financials/${record.id}`)
```

**Verification:**
- [ ] EV-A1: Deleting a financial record succeeds without TypeError
- [ ] EV-A2: Record is removed from UI after delete
- [ ] EV-A3: Record is soft-deleted in database (deleted_at set)

---

#### EV-B: Fix `utilization_per_approved_budget` → `utilization_rate` Field Name Mismatch [CRITICAL]

**Scope:** Frontend — template field references
**File:** `pmo-frontend/pages/university-operations/financial/index.vue` lines 900-933
**Research:** EV-3

**Problem:** Backend `computeFinancialMetrics()` returns `utilization_rate` (computed: `(obligation / allotment) × 100`). Frontend template reads `rec.utilization_per_approved_budget` — a raw DB column that is never populated during INSERT. Result: % Utilization column always shows "—".

**Change:** Replace ALL references to `utilization_per_approved_budget` with `utilization_rate` in the template section:

```html
<!-- Current: -->
<v-chip v-if="rec.utilization_per_approved_budget !== null && rec.utilization_per_approved_budget !== undefined">
  {{ formatPercent(rec.utilization_per_approved_budget) }}
</v-chip>

<!-- Fixed: -->
<v-chip v-if="rec.utilization_rate !== null && rec.utilization_rate !== undefined">
  {{ formatPercent(rec.utilization_rate) }}
</v-chip>
```

**Also fix in `campusSubtotals` computed property** (if it references `utilization_per_approved_budget`): replace with computation from subtotal values: `(totalObligations / totalAllotment) × 100`.

**Verification:**
- [ ] EV-B1: % Utilization column shows computed percentage when allotment and obligation are non-zero
- [ ] EV-B2: % Utilization shows "—" only when allotment is zero or null
- [ ] EV-B3: Subtotal rows show correct aggregated utilization rate

---

#### EV-C: Align Balance Formula with DBM Standard [MUST]

**Scope:** Frontend — computed property + Backend — `computeFinancialMetrics()`
**Files:** `financial/index.vue` (campusSubtotals), `university-operations.service.ts` (computeFinancialMetrics)
**Research:** EV-4

**Problem:** Backend computes `balance = allotment - disbursement` ("Undisbursed Allotment"). Frontend subtotals compute `balance = allotment - obligation` ("Unobligated Balance"). DBM BAR No. 2 standard defines "Unobligated Balance" = Appropriation − Obligations.

**Change — Backend `computeFinancialMetrics()`:**
```typescript
// Current (service.ts ~line 212):
balance: allotment !== null && disbursement !== null
  ? parseFloat((allotment - disbursement).toFixed(2))
  : null,

// Fixed — align with DBM "Unobligated Balance":
balance: allotment !== null && obligation !== null
  ? parseFloat((allotment - obligation).toFixed(2))
  : null,
```

**Frontend subtotals:** Already use `allotment - obligation` — no change needed after backend alignment.

**Note:** If `disbursement`-based balance is needed elsewhere, add a separate `undisbursed_allotment` computed field. But per DBM BAR No. 2 and the Continuing Appropriations Excel, "balance" = Unobligated Balance.

**Verification:**
- [ ] EV-C1: Individual record `balance` = `allotment - obligation`
- [ ] EV-C2: Subtotal `balance` = sum(allotment) - sum(obligation) per campus/expense class
- [ ] EV-C3: Backend and frontend balance values match for the same record

---

#### EV-D: Add Collapsible Data Entry Guide [SHOULD]

**Scope:** Frontend — new section in template
**File:** `pmo-frontend/pages/university-operations/financial/index.vue`
**Research:** EV-8

**Problem:** The Physical page has a collapsible guidance panel (Phase DX, Directive #43). The Financial page lacks equivalent guidance, leaving users without context for BAR No. 2 data entry.

**Change:** Add a `v-expansion-panels` section below the hero bar (same pattern as Physical page's guidance panel):

**Content:**
- **Expense Classes:** PS (Personal Services — salaries, wages, benefits), MOOE (Maintenance & Operating Expenses — supplies, utilities), CO (Capital Outlay — equipment, infrastructure)
- **Key Terms:** Appropriation = Total budget allocation; Obligations = Amounts committed; % Utilization = (Obligations ÷ Appropriation) × 100
- **Data Entry:** Select the correct pillar tab (MFO1-4), choose campus and expense class, then enter Appropriation and Obligations amounts
- **Quarterly Reporting:** Each quarter is an independent submission. Submit via the pillar header when data entry is complete.

**Collapsed by default** (consistent with Directive #69).

**Verification:**
- [ ] EV-D1: Guide panel renders below hero section
- [ ] EV-D2: Guide is collapsed by default
- [ ] EV-D3: Expand/collapse toggles correctly

---

#### EV-E: Financial-Focused Hero Section [SHOULD]

**Scope:** Frontend — hero bar content update
**File:** `pmo-frontend/pages/university-operations/financial/index.vue`
**Research:** EV-8

**Problem:** Current hero section shows a generic "BAR No. 2 — Financial Accomplishments" label. It should provide at-a-glance budget utilization context for the active pillar.

**Change:** Update the hero bar to display:
- Title: "Financial Accomplishments — BAR No. 2"
- Subtitle: Active pillar name (e.g., "MFO1: Higher Education")
- Summary chips (computed from `financialRecords`):
  - Total Appropriation: `₱X,XXX,XXX.XX`
  - Total Obligations: `₱X,XXX,XXX.XX`
  - Overall Utilization: `XX.XX%`
  - Record Count: `N records`

**Implementation pattern:** Same as Physical page's pillar header chips (Phase EE-B). Compute from `financialRecords.value` filtered to active pillar.

**Verification:**
- [ ] EV-E1: Hero shows active pillar name
- [ ] EV-E2: Summary chips display correct aggregated values
- [ ] EV-E3: Chips update when switching pillars or quarters

---

#### EV-F: Submission Workflow Label Distinction [SHOULD]

**Scope:** Frontend — label text updates
**File:** `pmo-frontend/pages/university-operations/financial/index.vue`
**Research:** EV-8

**Problem:** Financial page submission dialogs/buttons use the same generic "Submit Q1" label as the Physical page. Since both share the same `quarterly_reports` entity, the user should clearly see which module's data they're submitting.

**Change:**
- Submit button label: "Submit Q1" → "Submit Financial Q1"
- Submit confirmation dialog text: Reference "Financial Quarterly Report" explicitly
- Status banner: "Q1 Status: PENDING_REVIEW" → "Financial Q1 Status: PENDING_REVIEW"

**Note:** This is a label-only change. The underlying `quarterly_reports` entity remains shared between Physical and Financial. Both modules submit/approve the same quarterly report. The label distinction prevents user confusion.

**Verification:**
- [ ] EV-F1: Submit button reads "Submit Financial Q1" (or active quarter)
- [ ] EV-F2: Status banner includes "Financial" qualifier
- [ ] EV-F3: Confirmation dialog references Financial data

---

#### EV-G: Cross-Module Analytics Preparation [DEFERRED — YAGNI]

**Scope:** Backend + Frontend — analytics endpoints + dashboard
**Research:** EV-7

**Problem:** No financial analytics endpoints exist. Physical analytics have pillar-summary, quarterly-trend, and yearly-comparison endpoints.

**Deferred because:**
1. Financial data entry is not yet stable (EV-A through EV-C must be fixed first)
2. No financial data exists in production to visualize
3. April 6 stakeholder milestone focuses on data entry capability, not analytics
4. YAGNI — build analytics when there's data to analyze

**Pre-conditions for future implementation:**
- EV-A through EV-F complete and verified
- At least one quarter of financial data entered across all pillars
- Stakeholder request for financial analytics specifically

**When implemented, will require:**
- `findFinancialPillarSummary()` — Appropriation vs Obligation per pillar
- `findFinancialQuarterlyTrend()` — Utilization rate trend Q1-Q4
- `findPhysicalVsFinancial()` — Side-by-side pillar comparison (Physical achievement rate vs Financial utilization rate)

---

### Phase EV Governance Directives

| # | Directive | Phase |
|---|-----------|-------|
| 81 | **`api.del()` must be used for DELETE requests (not `api.delete()`)** | Phase EV-A |
| 82 | **`utilization_rate` is the authoritative computed field name for % Utilization** | Phase EV-B |
| 83 | **Balance formula must use DBM-standard Unobligated Balance: Appropriation − Obligations** | Phase EV-C |
| 84 | **Financial page must include collapsible data entry guide** | Phase EV-D |
| 85 | **Financial hero section must display budget utilization summary** | Phase EV-E |
| 86 | **Submission workflow must distinguish Financial from Physical quarterly reports** | Phase EV-F |
| 87 | **Cross-module analytics preparation deferred until Financial data entry is stable** | Phase EV-G |

---

### Phase EV Execution Priority

| Priority | Step | Severity | Scope | Key Risk | Status |
|----------|------|----------|-------|----------|--------|
| 1 | EV-A: Fix `api.delete` → `api.del` | CRITICAL | Frontend (1 line) | None — trivial fix | ✅ IMPLEMENTED |
| 2 | EV-B: Fix `utilization_rate` field name | CRITICAL | Frontend (template) | Must find ALL references | ✅ IMPLEMENTED |
| 3 | EV-C: Align balance formula with DBM | HIGH | Backend + Frontend | Backend change requires restart | ✅ IMPLEMENTED |
| 4 | EV-D: Add collapsible data entry guide | MEDIUM | Frontend (template) | Follow Physical page pattern | ✅ IMPLEMENTED |
| 5 | EV-E: Financial-focused hero section | MEDIUM | Frontend (template + computed) | Compute from filtered records | ✅ IMPLEMENTED |
| 6 | EV-F: Submission workflow label distinction | LOW | Frontend (labels) | Label-only — no logic change | ✅ IMPLEMENTED |
| 7 | EV-G: Cross-module analytics | LOW | Backend + Frontend | DEFERRED — YAGNI | ⬜ DEFERRED |

---

### Phase EV Feasibility Assessment

| Factor | Assessment |
|--------|------------|
| Bug fixes (EV-A, EV-B) | **Trivial** — single-file, exact line numbers known |
| Balance alignment (EV-C) | **Low risk** — one line in backend, subtotals already correct in frontend |
| UI enhancements (EV-D, EV-E, EV-F) | **Moderate** — follow established Physical page patterns |
| Cross-module analytics (EV-G) | **Deferred** — no implementation needed until data entry is stable |
| Backend restart required | **Yes** — EV-C modifies `computeFinancialMetrics()` |
| Estimated implementation time | **1 session** — all changes are in 2 files (financial/index.vue + service.ts) |

---

### Phase EV Timeline

| Date | Milestone | Status |
|------|-----------|--------|
| 2026-03-19 | Phase EV: Research (Phase 1) + Plan (Phase 2) | ✅ COMPLETE |
| 2026-03-19–20 | Phase EV: Implementation (Phase 3) | ⬜ AWAITING AUTHORIZATION |
| 2026-03-21–25 | ET-E regression + Financial page testing | ⬜ PENDING |
| 2026-03-26–31 | Stabilization, edge cases, data population | ⬜ PENDING |
| 2026-04-01–04 | Stakeholder presentation prep | ⬜ PENDING |
| **2026-04-06** | **Stakeholder feedback session (MIS/PMO Directors)** | **⬜ TARGET** |

---

## Phase EW — Financial Accomplishment Module: Data Retrieval Failure Fix, DBM-Aligned Structure, and Pillar-Based UI Refactor

**Research Reference:** Section 2.03
**Date:** 2026-03-19
**Status:** ✅ PHASE 3 COMPLETE — EW-A and EW-B IMPLEMENTED (2026-03-19)
**Priority:** P0 — CRITICAL. Financial records exist in database but are invisible in UI. All Financial module functionality is blocked.
**Prerequisite:** Phase EV complete ✅ (bug fixes applied, but display failure persists)

---

### Phase EW Problem Statement

Financial records are successfully inserted into the `operation_financials` table (INSERT → SUCCESS), but the UI displays "No Financial Records" (DISPLAY → FAILURE). Root cause: the backend `findAll()` method in `university-operations.service.ts` uses an explicit SELECT column list that **omits `uo.fiscal_year`**. The column was added to the table in migration 014 and the WHERE clause was updated to filter by it, but the SELECT list was never updated.

The frontend `findCurrentOperation()` receives operation objects without `fiscal_year`, then tries `.find(op => ... && Number(op.fiscal_year) === Number(selectedYear))`. Since `op.fiscal_year` is `undefined`, `Number(undefined) = NaN`, and `NaN !== 2026` always evaluates to false. Result: `currentOperation = null` → financial data fetch is skipped → empty UI.

This same bug exists in the Physical page but is masked because Physical indicators are fetched via a separate endpoint that doesn't depend on `currentOperation`.

---

### Phase EW Steps

#### EW-A: Add `uo.fiscal_year` to `findAll()` SELECT [CRITICAL]

**Scope:** Backend — single column addition to SQL SELECT
**File:** `pmo-backend/src/university-operations/university-operations.service.ts` lines 300-303
**Research:** EW-1

**Problem:** The `findAll()` SELECT explicitly lists 23 columns but omits `uo.fiscal_year`. The column exists in the table (migration 014), is filtered in the WHERE clause (line 285), but is never returned in the response. This breaks the frontend `.find()` comparison that requires `fiscal_year` to match operations.

**Change:**
```sql
-- Current (line 300-303):
SELECT uo.id, uo.operation_type, uo.title, uo.description, uo.code, uo.start_date, uo.end_date,
       uo.status, uo.budget, uo.campus, uo.coordinator_id, uo.publication_status, uo.created_at, uo.updated_at,
       uo.submitted_by, uo.submitted_at, uo.created_by,
       uo.status_q1, uo.status_q2, uo.status_q3, uo.status_q4,

-- Fixed — add uo.fiscal_year:
SELECT uo.id, uo.operation_type, uo.title, uo.description, uo.code, uo.start_date, uo.end_date,
       uo.status, uo.budget, uo.campus, uo.coordinator_id, uo.publication_status, uo.created_at, uo.updated_at,
       uo.submitted_by, uo.submitted_at, uo.created_by,
       uo.status_q1, uo.status_q2, uo.status_q3, uo.status_q4,
       uo.fiscal_year,
```

**Impact:**
- Financial page: `findCurrentOperation()` will return the matching operation → `fetchFinancialData()` will fetch and display records
- Physical page: `findCurrentOperation()` will also start working correctly (was silently broken for governance controls)
- Landing page: Any code that reads `fiscal_year` from list responses will work

**Verification:**
- [ ] EW-A1: After save, financial records appear in the UI immediately
- [ ] EW-A2: Page refresh preserves displayed financial records
- [ ] EW-A3: Switching pillars loads correct financial records for each pillar
- [ ] EW-A4: Switching fiscal years loads correct financial records
- [ ] EW-A5: Switching quarters loads correct financial records
- [ ] EW-A6: Physical page submit/withdraw continues to work (confirm `currentOperation` is now found)

---

#### EW-B: Reword Hero Subtitle [SHOULD]

**Scope:** Frontend — label text update
**File:** `pmo-frontend/pages/university-operations/financial/index.vue` line 664
**Research:** EW-5

**Problem:** User requested removal of "irrelevant BAR No. 2 reference." However, BAR No. 2 is the official DBM designation. Solution: lead with functional description, keep BAR No. 2 as parenthetical.

**Change:**
```html
<!-- Current: -->
BAR No. 2 — Budget Utilization and Financial Performance

<!-- Fixed: -->
Budget Utilization and Financial Performance (BAR No. 2)
```

**Verification:**
- [ ] EW-B1: Subtitle reads "Budget Utilization and Financial Performance (BAR No. 2)"

---

### Phase EW Governance Directives

| # | Directive | Phase |
|---|-----------|-------|
| 88 | **`findAll()` SELECT must include `uo.fiscal_year` — root cause of Financial display failure** | Phase EW-A |
| 89 | **Hero subtitle must lead with functional description, keep BAR No. 2 as parenthetical** | Phase EW-B |

---

### Phase EW Execution Priority

| Priority | Step | Severity | Scope | Key Risk | Status |
|----------|------|----------|-------|----------|--------|
| 1 | EW-A: Add `uo.fiscal_year` to `findAll()` SELECT | **CRITICAL** | Backend (1 line) | None — additive column, no breaking change | ✅ IMPLEMENTED |
| 2 | EW-B: Reword hero subtitle | LOW | Frontend (1 line) | None — label only | ✅ IMPLEMENTED |

---

### Phase EW Feasibility Assessment

| Factor | Assessment |
|--------|------------|
| Root cause certainty | **HIGH** — code path traced end-to-end with proof |
| Fix complexity | **Trivial** — add one column to existing SELECT list |
| Risk of regression | **None** — additive change, no existing behavior altered |
| Backend restart required | **Yes** — service.ts modification |
| Estimated implementation time | **< 5 minutes** — 2 lines of code |
| Unblocks | All Phase EV fixes (EV-A through EV-F), data entry testing, deletion, financial analytics |

---

### Phase EW Impact Chain

```
EW-A fix (add fiscal_year to SELECT)
  ↓ Unblocks
findCurrentOperation() returns matching operation
  ↓ Unblocks
fetchFinancialData() fetches financial records via /${operationId}/financials
  ↓ Unblocks
financialRecords.value populated → UI renders records
  ↓ Unblocks
EV-A (delete), EV-B (utilization %), EV-C (balance), EV-D (guide), EV-E (hero chips), EV-F (labels)
  ↓ Unblocks
Data entry testing → Stakeholder demo readiness (April 6, 2026)
```

---

## Phase EX — Financial Accomplishment Module: UI Consistency, Action Controls, Data Semantics, and Analytics Integration

**Research Reference:** Section 2.04
**Date:** 2026-03-19
**Status:** ✅ PHASE 3 COMPLETE — EX-A through EX-F IMPLEMENTED (2026-03-19)
**Priority:** P1 — UI usability issues block efficient data entry and testing. Stakeholder milestone: April 6, 2026.
**Prerequisite:** Phase EW complete ✅ (data retrieval fixed)

---

### Phase EX Problem Statement

With data retrieval now working (Phase EW), several UI/UX issues prevent efficient Financial module use: (1) the Actions column shows only a Delete button (admin-only), with no visible Edit button — users must click the row to edit, but nothing communicates this; (2) the Disbursement field lacks context, leaving users uncertain whether it's required; (3) the top controls container is 200px narrower than Physical, creating visible whitespace; (4) pillar tabs use short names without background color, unlike Physical; (5) "BAR No. 2" references remain despite user request for removal; (6) financial analytics endpoints do not exist yet.

---

### Phase EX Steps

#### EX-A: Add Explicit Edit Button to Actions Column [HIGH]

**Scope:** Frontend — template modification
**File:** `pmo-frontend/pages/university-operations/financial/index.vue` lines 960-969, 987-996
**Research:** EX-1

**Problem:** Actions column only has a Delete button (admin-only). Edit requires clicking the entire row with no visual indicator. Physical page has an explicit pencil button per row.

**Change:** Add an edit (pencil) button before the delete button in both categorized and uncategorized record rows:

```html
<td v-if="canEditData()" class="text-center">
  <v-btn
    icon="mdi-pencil"
    size="x-small"
    variant="text"
    @click.stop="openEditDialog(rec)"
  />
  <v-btn
    v-if="isAdmin"
    icon="mdi-delete-outline"
    size="x-small"
    variant="text"
    color="error"
    @click.stop="confirmDelete(rec)"
  />
</td>
```

**Notes:**
- Edit button visible to ALL users with `canEditData()` permission (not just admins)
- Delete button remains admin-only (existing behavior)
- `@click.stop` prevents row click from also firing
- Apply to both categorized records (line 960) and uncategorized records (line 987)

**Verification:**
- [ ] EX-A1: Pencil icon visible in Actions column for users with edit permission
- [ ] EX-A2: Clicking pencil opens edit dialog pre-filled with record data
- [ ] EX-A3: Delete icon still visible only for admin users
- [ ] EX-A4: Row click still opens edit dialog (preserved behavior)

---

#### EX-B: Disbursement Field — Add Helper Text and "Optional" Label [MEDIUM]

**Scope:** Frontend — form field update
**File:** `pmo-frontend/pages/university-operations/financial/index.vue` lines 1128-1137
**Research:** EX-2

**Problem:** Disbursement field has no context. Users don't know if it's required, what it measures, or how it relates to other fields.

**Change:**
```html
<v-text-field
  v-model.number="entryForm.disbursement"
  label="Disbursement (Optional)"
  hint="Actual cash payments released. Used to compute Disbursement Rate."
  persistent-hint
  variant="outlined"
  density="compact"
  type="number"
  prefix="₱"
/>
```

**Verification:**
- [ ] EX-B1: Label reads "Disbursement (Optional)"
- [ ] EX-B2: Hint text visible below the field

---

#### EX-C: Data Entry Form — Add Helper Text to Key Fields [MEDIUM]

**Scope:** Frontend — form field hints
**File:** `pmo-frontend/pages/university-operations/financial/index.vue` lines 1108-1137
**Research:** EX-3

**Change:** Add `hint` and `persistent-hint` to the three financial amount fields:

- **Appropriation:** hint = "Total budget allocation for this line item"
- **Obligations:** hint = "Amounts committed against the appropriation"
- **Disbursement:** (covered in EX-B)

**Verification:**
- [ ] EX-C1: Appropriation field shows hint text
- [ ] EX-C2: Obligations field shows hint text

---

#### EX-D: Top Controls Container — Match Physical Page Width [MEDIUM]

**Scope:** Frontend — CSS style update
**File:** `pmo-frontend/pages/university-operations/financial/index.vue` line 685
**Research:** EX-4, EX-6

**Problem:** Financial uses `max-width: 560px`, Physical uses `max-width: 760px`. This creates a visible right-side whitespace gap.

**Change:**
```html
<!-- Current: -->
<div ... style="width: 100%; max-width: 560px">

<!-- Fixed: -->
<div ... style="width: 100%; max-width: 760px">
```

**Verification:**
- [ ] EX-D1: Top controls align with content area — no right whitespace gap
- [ ] EX-D2: Responsive behavior maintained on mobile

---

#### EX-E: Pillar Tabs — Match Physical Page Styling [MEDIUM]

**Scope:** Frontend — template update
**File:** `pmo-frontend/pages/university-operations/financial/index.vue` lines 747-756
**Research:** EX-4

**Problem:** Financial pillar tabs use short `pillar.name` and no background color. Physical tabs use `pillar.fullName` inside a `v-card` with `bg-color="primary"`.

**Change:** Wrap tabs in `v-card` and use `fullName`:
```html
<v-card class="mb-4">
  <v-tabs v-model="activePillar" bg-color="primary" show-arrows>
    <v-tab v-for="pillar in PILLARS" :key="pillar.id" :value="pillar.id">
      <v-icon start>{{ pillar.icon }}</v-icon>
      {{ pillar.fullName }}
    </v-tab>
  </v-tabs>
</v-card>
```

**Verification:**
- [ ] EX-E1: Pillar tabs have primary background color
- [ ] EX-E2: Tabs show full MFO names (e.g., "MFO1: Higher Education Services")
- [ ] EX-E3: Tabs are wrapped in a card consistent with Physical page

---

#### EX-F: Remove All User-Facing "BAR No. 2" References [LOW]

**Scope:** Frontend — label text updates
**Files:** `financial/index.vue` line 664, `index.vue` (landing) line 67
**Research:** EX-5

**Change 1 — Financial page subtitle:**
```
Current: "Budget Utilization and Financial Performance (BAR No. 2)"
Fixed:   "Budget Utilization and Financial Performance"
```

**Change 2 — Landing page reporting type selector:**
```
Current: "Financial Accomplishments (BAR No. 2)"
Fixed:   "Financial Accomplishments"
```

**Note:** Keep "BAR No. 2" in code comments only (for developer reference).

**Verification:**
- [ ] EX-F1: Financial page subtitle has no "BAR No. 2" reference
- [ ] EX-F2: Landing page dropdown has no "BAR No. 2" reference

---

#### EX-G: Financial Analytics Endpoints [DEFERRED — YAGNI]

**Scope:** Backend + Frontend
**Research:** EX-7

**Deferred because:**
1. Financial data entry is just now functional (Phase EW fix deployed today)
2. No meaningful financial data exists to visualize yet
3. April 6 stakeholder milestone focuses on data entry, not analytics
4. Landing page selector infrastructure already exists — endpoints can be plugged in later

**When implemented, will require:**
- `GET /analytics/financial-pillar-summary` — Appropriation vs Obligation per pillar
- `GET /analytics/financial-quarterly-trend` — Utilization rate trend Q1-Q4
- `GET /analytics/financial-yearly-comparison` — Budget utilization across FYs
- Update `fetchAnalytics()` in landing page to call financial endpoints when `selectedReportingType === 'FINANCIAL'`

---

### Phase EX Governance Directives

| # | Directive | Phase |
|---|-----------|-------|
| 90 | **Actions column must include explicit Edit button alongside Delete** | Phase EX-A |
| 91 | **Disbursement field is optional — must include helper text clarifying its role** | Phase EX-B |
| 92 | **Data entry form must include hint text on key financial fields** | Phase EX-C |
| 93 | **Financial top controls container must match Physical page width (760px)** | Phase EX-D |
| 94 | **Financial pillar tabs must use fullName and match Physical styling** | Phase EX-E |
| 95 | **All user-facing BAR No. 2 references must be removed** | Phase EX-F |
| 96 | **Financial analytics endpoints deferred until data entry is stable** | Phase EX-G |

---

### Phase EX Execution Priority

| Priority | Step | Severity | Scope | Key Risk | Status |
|----------|------|----------|-------|----------|--------|
| 1 | EX-A: Add Edit button to Actions column | HIGH | Frontend (template) | None — button addition | ✅ IMPLEMENTED |
| 2 | EX-D: Top controls max-width → 760px | MEDIUM | Frontend (CSS) | None — style change | ✅ IMPLEMENTED |
| 3 | EX-E: Pillar tabs match Physical styling | MEDIUM | Frontend (template) | None — template restructure | ✅ IMPLEMENTED |
| 4 | EX-B: Disbursement field helper text | MEDIUM | Frontend (form) | None — label + hint | ✅ IMPLEMENTED |
| 5 | EX-C: Financial field hints | MEDIUM | Frontend (form) | None — hints only | ✅ IMPLEMENTED |
| 6 | EX-F: Remove "BAR No. 2" references | LOW | Frontend (labels) | None — text only | ✅ IMPLEMENTED |
| 7 | EX-G: Financial analytics endpoints | LOW | Backend + Frontend | DEFERRED — YAGNI | ⬜ DEFERRED |

---

### Phase EX Feasibility Assessment

| Factor | Assessment |
|--------|------------|
| All changes frontend-only | **Yes** — EX-A through EX-F are template/style changes in 2 files |
| Backend changes | **None** — no service or controller modifications |
| Backend restart required | **No** |
| Risk of regression | **Minimal** — additive changes, no logic alteration |
| Estimated implementation time | **1 session** — all changes in `financial/index.vue` + `index.vue` |

---

## Phase EU — System Development Transition Review: Physical Accomplishment Stabilization, Artifact Optimization, and Preparation for Financial Accomplishment Module

**Research Reference:** Section 2.00
**Date:** 2026-03-17
**Priority:** HIGH — Pre-transition readiness assessment and artifact governance before Financial Module development. Stakeholder milestone: April 6, 2026.

---

### Phase EU Problem Statement

Before transitioning to the Financial Accomplishment module (Phase ET), the system requires: (1) formal verification that Physical Accomplishment has reached foundational stability, (2) artifact optimization to maintain development velocity, (3) Git repository governance to establish a safe baseline, and (4) timeline validation against the April 6 stakeholder milestone.

---

### Phase EU Steps

#### EU-A: Physical Accomplishment Module — Formal Readiness Declaration

**Status: ✅ CONFIRMED READY**

All 7 foundational components verified as fully implemented:

| # | Component | Frontend | Backend | DB | Verdict |
|---|-----------|----------|---------|-----|---------|
| 1 | Quarterly Reporting Lifecycle | fetchQuarterlyReport, submit, withdraw, currentQuarterlyReport | create, find, submit, approve, reject, withdraw endpoints | quarterly_reports table | ✅ COMPLETE |
| 2 | Submission & Approval Workflow | Submit/Withdraw buttons, status badges | 4 lifecycle endpoints with state machine validation | publication_status CHECK | ✅ COMPLETE |
| 3 | Revision Request Authorization | unlockRequestDialog, submitUnlockRequest | request-unlock, unlock, deny-unlock endpoints | unlock_requested_by, unlocked_by columns | ✅ COMPLETE |
| 4 | Archive Traceability | Submission History panel in Pending Reviews | snapshotSubmissionHistory called on 5 events | quarterly_report_submissions table | ✅ COMPLETE |
| 5 | RBAC Enforcement | canEditData() with role-based gates | @Roles decorators, validateOperationEditable with JOIN, rank-based approval | Role FK, RolesGuard | ✅ COMPLETE |
| 6 | UI Status Synchronization | isLoadingQuarterlyReport, isInitializing, hero bar, retry/rejection banners | Auto-refresh on operations | Status enums | ✅ COMPLETE |
| 7 | Data Entry Stability | openEntryDialog with auth guard, published edit warning | createIndicatorQuarterlyData, updateIndicatorQuarterlyData, autoRevert | validateOperationEditable | ✅ COMPLETE |

**Declaration:** The Physical Accomplishment module has achieved foundational system stability and is **READY FOR NEXT DEVELOPMENT PHASE**.

---

#### EU-B: Artifact Optimization — Archive Historical Content

**research.md optimization:**

| Action | Source | Target | Lines |
|--------|--------|--------|-------|
| Archive Sections 1.33–1.65B | research.md lines 3420–11500 | `docs/archive/research_sections_1.33_to_1.65B_governance_2026-02-16.md` | 8,080 |
| Keep active sections 1.70–1.99 + 2.00 | research.md | In place | ~5,000 |
| Replace archived range with summary pointer | research.md | In place | ~10 |

**Result:** research.md shrinks from ~17,800 to ~9,730 lines (45% reduction).

**plan.md optimization:**

| Action | Source | Target | Lines |
|--------|--------|--------|-------|
| Archive Phases DO–EE detailed steps | plan.md lines 799–3633 | `docs/archive/plan_completed_phases_DO_to_EE_2026-03-17.md` | 2,834 |
| Keep governance directives table | plan.md | In place | ~90 |
| Keep active phases EN–EU | plan.md | In place | ~1,100 |
| Replace archived range with summary table | plan.md | In place | ~30 |

**Result:** plan.md shrinks from ~6,100 to ~3,296 lines (46% reduction).

**Archival rule applied:** Historical content is NEVER deleted — only moved to `docs/archive/` with date-stamped filenames for traceability.

---

#### EU-C: Git Repository Governance — Commit, Tag, and Push

**Step 1: Stage the 10 deleted reference docs:**
```
git add docs/References/approval_visibility_risk_summary_2026-02-16.txt
... (10 files)
```

**Step 2: Stage critical untracked files:**
- 16 database migrations (013–028)
- New DTOs, stores, components, page directory
- Updated docs (research.md, plan.md)
- New archive files (from EU-B)

**Step 3: Create milestone commit:**
```
git commit -m "milestone: Physical Accomplishment Stabilization Phase — system ready for Financial Module"
```

**Step 4: Tag the milestone:**
```
git tag -a v1.0-physical-stable -m "Physical Accomplishment module: foundational stability achieved. All 7 components verified. Ready for Financial Accomplishment (BAR No. 2) development."
```

**Step 5: Push to GitHub:**
```
git push origin refactor/page-structure-feb9 --tags
```

---

#### EU-D: Transition Preparation for Financial Accomplishment Module

**Pre-conditions confirmed:**
- Phase ET plan written (research.md Section 1.99, plan.md Phase ET)
- Backend CRUD for `operation_financials` exists and is functional
- Only schema gap: `expense_class` column (one migration)
- Physical page provides structural template
- Quarterly report governance is shared (no duplication needed)

**Dependencies identified:**
- Financial page shares `quarterly_reports` entity with Physical page
- `canEditData()` logic applies identically
- Submission/approval/unlock workflow is already unified
- `validateOperationEditable()` already enforces across both modules

**Next phase after EU completes:** Phase ET implementation (Financial Accomplishments page).

---

#### EU-E: Timeline Validation

| Date | Milestone | Status |
|------|-----------|--------|
| 2026-03-17 | Phase EU: Transition Review | ⬜ IN PROGRESS |
| 2026-03-18 | EU-B/C: Artifact optimization + Git milestone | ⬜ PENDING |
| 2026-03-19–25 | Phase ET: Financial Accomplishments implementation | ⬜ PENDING |
| 2026-03-26–31 | Testing, stabilization, edge cases | ⬜ PENDING |
| 2026-04-01–04 | Stakeholder presentation prep | ⬜ PENDING |
| **2026-04-06** | **Stakeholder feedback session (MIS/PMO Directors)** | **⬜ TARGET** |

**Working days available:** ~14 (excluding weekends)
**Assessment:** Timeline is **achievable** with focused execution.

---

### Phase EU Governance Directives

| # | Directive | Phase |
|---|-----------|-------|
| 104 | **Physical Accomplishment module declared foundationally stable — all 7 components verified** | Phase EU-A |
| 105 | **Development artifacts must be optimized before transitioning to new module** | Phase EU-B |
| 106 | **Git milestone tag required before starting Financial module development** | Phase EU-C |
| 107 | **Historical content must be archived, never deleted** | Phase EU-B |

---

### Phase EU Execution Priority

| Priority | Step | Severity | Scope | Key Risk | Status |
|----------|------|----------|-------|----------|--------|
| 1 | EU-A: Formal readiness declaration | HIGH | Audit | None — already verified | ✅ CONFIRMED |
| 2 | EU-B: Archive historical content from research.md and plan.md | HIGH | Docs | Must preserve traceability | ⬜ PENDING |
| 3 | EU-C: Git commit + milestone tag + push | HIGH | Git | Large commit — review carefully | ⬜ PENDING |
| 4 | EU-D: Confirm transition readiness for Phase ET | MEDIUM | Planning | Dependencies verified | ✅ CONFIRMED |
| 5 | EU-E: Timeline validation against April 6 | MEDIUM | Schedule | 14 working days available | ✅ VALIDATED |

---

## Phase EZ — Data Entry Form Refinement, Submission Label Correction, and Analytics Integration

**Research Reference:** `research.md` Section 2.06
**Date:** 2026-03-19
**Scope:** 6 implementation steps across frontend form validation, backend DTO hardening, submission label accuracy, financial analytics endpoints, combined analytics, analytics guide, and filter labeling.

---

### EZ-A: Data Entry Form Validation Constraints

**Finding:** EZ-1
**Files:**
- `pmo-frontend/pages/university-operations/financial/index.vue` (lines 1123-1157)
- `pmo-backend/src/university-operations/dto/create-financial.dto.ts`

**Changes:**

1. **Frontend — HTML `min` attribute on all financial inputs:**
   - Add `min="0"` to `allotment`, `obligation`, `disbursement` `<v-text-field>` elements
   - This provides immediate browser-level prevention of negative values

2. **Frontend — Cross-field validation warnings:**
   - Below the live preview (line 1168), add a `v-alert type="warning"` that shows when:
     - `obligation > allotment` → "Obligations exceed Appropriation — balance will be negative"
     - `disbursement > obligation` → "Disbursement exceeds Obligations — verify data accuracy"
   - These are warnings only (soft validation) — user can still save. Hard rejection at this stage would block legitimate corrections.

3. **Backend — DTO `@Min(0)` decorators:**
   - Add `import { Min } from 'class-validator'`
   - Add `@Min(0)` to `allotment`, `obligation`, `disbursement` fields in `CreateFinancialDto`
   - This enforces server-side rejection of negative values via NestJS ValidationPipe

**Governance:** No negative financial values shall pass backend validation. Cross-field warnings are advisory only.

---

### EZ-B: Submission Label Correction (Dynamic Content Detection)

**Finding:** EZ-2
**Files:**
- `pmo-backend/src/university-operations/university-operations.service.ts` — `getPendingReviews()` method (~line 2228)
- `pmo-frontend/pages/admin/pending-reviews.vue` (lines 146-176)

**Changes:**

1. **Backend — Enrich pending review items with content module detection:**
   In `getPendingReviews()`, after fetching quarterly reports, for each report, run two existence checks:
   ```sql
   -- Check for Physical data (indicators with data for any operation in this FY)
   SELECT EXISTS(
     SELECT 1 FROM operation_indicators oi
     JOIN university_operations uo ON uo.id = oi.operation_id
     WHERE uo.fiscal_year = $1
       AND (oi.target_q1 IS NOT NULL OR oi.accomplishment_q1 IS NOT NULL
            OR oi.target_q2 IS NOT NULL OR oi.accomplishment_q2 IS NOT NULL
            OR oi.target_q3 IS NOT NULL OR oi.accomplishment_q3 IS NOT NULL
            OR oi.target_q4 IS NOT NULL OR oi.accomplishment_q4 IS NOT NULL)
       AND oi.deleted_at IS NULL
   ) as has_physical
   ```
   ```sql
   -- Check for Financial data
   SELECT EXISTS(
     SELECT 1 FROM operation_financials
     WHERE fiscal_year = $1 AND deleted_at IS NULL
   ) as has_financial
   ```
   Add `has_physical` and `has_financial` boolean fields to each returned quarterly report item.

   **Performance note:** These are existence checks (stop at first row) — negligible cost. Batch with a single query using lateral joins for efficiency.

2. **Frontend — Dynamic label based on content flags:**
   In `pending-reviews.vue`, replace the hardcoded `"(Physical & Financial)"` with:
   ```typescript
   function getModuleLabel(item: any): string {
     if (item.has_physical && item.has_financial) return '(Physical & Financial)'
     if (item.has_physical) return '(Physical)'
     if (item.has_financial) return '(Financial)'
     return '' // No data yet — shouldn't happen for submitted reports
   }
   ```
   Apply to lines 150, 157, and 175 title templates.

**Governance:** Submission labels must reflect actual data content. Never hardcode module assumptions.

---

### EZ-C: Financial Analytics Endpoints (Backend)

**Finding:** EZ-3
**Files:**
- `pmo-backend/src/university-operations/university-operations.controller.ts` (after line 134)
- `pmo-backend/src/university-operations/university-operations.service.ts` (after existing analytics methods)

**New endpoints:**

1. **`GET analytics/financial-pillar-summary?fiscal_year=2026`**
   - Returns per-pillar aggregation: `{ pillar_type, total_appropriation, total_obligations, total_disbursement, avg_utilization_rate, total_balance, record_count }`
   - Query: Joins `operation_financials` with `university_operations` on `operation_id`, groups by `uo.operation_type`

2. **`GET analytics/financial-quarterly-trend?fiscal_year=2026`**
   - Returns per-quarter aggregation: `{ quarter, total_appropriation, total_obligations, total_disbursement, avg_utilization_rate }`
   - Groups by `quarter`, ordered Q1-Q4

3. **`GET analytics/financial-yearly-comparison?years=2024,2025,2026`**
   - Returns per-year, per-pillar utilization rate for year-over-year comparison
   - Same structure as physical `getYearlyComparison()` but using financial metrics

4. **`GET analytics/financial-expense-breakdown?fiscal_year=2026`**
   - Returns per-expense-class aggregation: `{ expense_class, total_appropriation, total_obligations, pct_of_total }`
   - Groups by `expense_class`, used for pie/donut chart

**Governance:** All financial analytics endpoints follow the same pattern as Physical analytics — read-only, no side effects, filtered by fiscal_year.

---

### EZ-D: Financial Analytics Frontend (Landing Page)

**Finding:** EZ-3, EZ-4
**Files:**
- `pmo-frontend/pages/university-operations/index.vue` (lines 828-842 — replace placeholder)

**Changes:**

1. **Replace placeholder card** (lines 828-842) with actual charts:
   - **Financial Pillar Summary** — Radial bar chart showing utilization rate per pillar (mirrors Physical's pillar chart)
   - **Expense Class Breakdown** — Donut chart showing PS/MOOE/CO distribution of obligations
   - **Financial Quarterly Trend** — Line chart with appropriation, obligations, and utilization rate per quarter
   - **Financial Year-over-Year** — Grouped bar chart comparing utilization rate across years

2. **Add `fetchFinancialAnalytics()` function:**
   - Called when `selectedReportingType` changes to `'FINANCIAL'`
   - Calls the 4 new endpoints from EZ-C
   - Stores results in reactive refs

3. **Add chart configuration computed properties** for financial charts (ApexCharts options + series)

4. **Watch `selectedReportingType`** — when it changes, fetch the appropriate analytics data

**Governance:** Financial analytics charts must use the same visual language (colors, chart types) as Physical analytics for consistency.

---

### EZ-E: Analytics Guide Enhancement

**Finding:** EZ-5
**File:** `pmo-frontend/pages/university-operations/index.vue` (lines 636-654)

**Changes:**

Add new sections to the analytics guide expansion panel:

1. **"Financial Analytics" section** (shown when `selectedReportingType === 'FINANCIAL'`):
   - **Utilization Rate by Pillar:** "Shows the budget utilization rate (Obligations ÷ Appropriation × 100) for each pillar..."
   - **Expense Class Breakdown:** "Shows the distribution of obligations across PS, MOOE, and CO..."
   - **Financial Quarterly Trend:** "Tracks appropriation and obligation levels per quarter..."
   - **Financial Year-over-Year:** "Compares utilization rates across fiscal years..."

2. **Make guide content dynamic** — show Physical descriptions when Physical is selected, Financial when Financial is selected.

**Governance:** Analytics guide content must match the currently visible charts.

---

### EZ-F: Filter UI Labeling Improvements

**Finding:** EZ-6
**File:** `pmo-frontend/pages/university-operations/index.vue` (lines 597-613)

**Changes:**

1. Add `prepend-inner-icon="mdi-file-chart-outline"` to reporting type selector
2. Add `prepend-inner-icon="mdi-filter"` to global pillar filter
3. When `selectedReportingType === 'FINANCIAL'` and pillar filter is active, show a subtle `hint` or chip indicating "Filtering by operation pillar"

**Governance:** All filter controls must have visual affordance indicating their purpose.

---

### Phase EZ Execution Priority

| Priority | Step | Severity | Scope | Key Risk | Status |
|----------|------|----------|-------|----------|--------|
| 1 | EZ-A: Data entry form validation | HIGH | Frontend + Backend | Breaks existing entries if @Min too strict — use @IsOptional guard | ✅ DONE |
| 2 | EZ-B: Submission label correction | MEDIUM | Backend + Frontend | Existence query must handle edge cases (no operations yet) | ✅ DONE |
| 3 | EZ-C: Financial analytics endpoints | HIGH | Backend | Must follow same patterns as Physical analytics | ✅ DONE |
| 4 | EZ-D: Financial analytics frontend | HIGH | Frontend | Chart configs must match Physical visual language | ✅ DONE |
| 5 | EZ-E: Analytics guide enhancement | LOW | Frontend | Content must stay in sync with visible charts | ✅ DONE |
| 6 | EZ-F: Filter UI labeling | LOW | Frontend | Minimal risk — cosmetic changes only | ✅ DONE |

---

### Phase EZ Governance Directives

| # | Directive | Phase |
|---|-----------|-------|
| 108 | **Negative financial values must be rejected by backend DTO validation** | Phase EZ-A |
| 109 | **Cross-field validation (obligation ≤ appropriation) is advisory, not blocking** | Phase EZ-A |
| 110 | **Submission labels must reflect actual data content, not hardcoded assumptions** | Phase EZ-B |
| 111 | **Financial analytics endpoints must mirror Physical analytics patterns** | Phase EZ-C |
| 112 | **Analytics guide content must be dynamic — match currently visible charts** | Phase EZ-E |
| 113 | **All filter controls must have visual affordance (icon, label) indicating purpose** | Phase EZ-F |

---

## Phase FA — Quarter Status Isolation, Edit Governance Fix, and Empty-State UI Standardization

**Research Reference:** `research.md` Section 2.07
**Date:** 2026-03-19
**Scope:** 5 targeted fixes — frontend state staleness, backend governance gap (2 issues), empty-state UI, instructional guide.

---

### FA-A: Fix Quarter Status Staleness (Frontend)

**Finding:** FA-1
**File:** `pmo-frontend/pages/university-operations/financial/index.vue` — `fetchQuarterlyReport()` (line 247)

**Root cause:** `currentQuarterlyReport.value` is not reset to `null` at the start of `fetchQuarterlyReport()`. During the API call, stale Q1 PUBLISHED data persists and drives all status-dependent UI (banners, submit button, canEditData).

**Change:** Add a single line `currentQuarterlyReport.value = null` immediately after `isLoadingQuarterlyReport.value = true`, before any conditional or async work. This causes:
- Lock banners: immediately disappear when switching quarter (correct — no report = no lock)
- `canEditData()`: re-evaluates to allow editing (correct — no published lock on new quarter)
- `currentQuarterStatus`: immediately shows `'NOT_STARTED'` during load (correct visual state)

**Governance:** UI status must reflect only the data loaded for the current quarter/fiscal year selection. Stale state from prior selections must not persist.

---

### FA-B: Fix Edit Governance Bypass — Pass Quarter to validateOperationEditable (Backend)

**Finding:** FA-2
**File:** `pmo-backend/src/university-operations/university-operations.service.ts`
**Methods:** `createFinancial()`, `updateFinancial()`, `removeFinancial()`

**Root cause:** All three methods call `validateOperationEditable(operationId, undefined, user)`. The `undefined` quarter param causes the method to skip the `quarterly_reports.publication_status` check entirely.

**Changes:**

1. **`createFinancial()`** (line 1482):
   - Change to: `await this.validateOperationEditable(operationId, dto.quarter, user)`
   - `dto.quarter` is already available as part of `CreateFinancialDto`

2. **`updateFinancial()`** (line 1523):
   - The DTO is `Partial<CreateFinancialDto>` — `quarter` may not be in the update payload
   - Before calling `validateOperationEditable`, fetch the existing financial record to get its `quarter`:
     ```typescript
     const existing = await this.db.query(
       `SELECT fiscal_year, quarter FROM operation_financials WHERE id = $1 AND deleted_at IS NULL`,
       [financialId]
     )
     const recordQuarter = existing.rows[0]?.quarter
     ```
   - Change to: `await this.validateOperationEditable(operationId, recordQuarter, user)`

3. **`removeFinancial()`** (line 1560):
   - Same pattern as updateFinancial — fetch quarter from DB before calling validateOperationEditable
   - Change to: `await this.validateOperationEditable(operationId, recordQuarter, user)`

**Note on order of operations:** The existing record fetch can be combined with or placed before the existing ownership check — no extra round-trip needed since ownership check already exists.

**Governance:** Financial CRUD operations must enforce the same quarterly report publication lock as Physical indicator operations. Passing `undefined` quarter is a structural gap, not an intentional bypass.

---

### FA-C: Wire Up autoRevertQuarterlyReport for Financial CUD (Backend)

**Finding:** FA-3
**File:** `pmo-backend/src/university-operations/university-operations.service.ts`
**Methods:** `createFinancial()`, `updateFinancial()`, `removeFinancial()`

**Root cause:** `autoRevertQuarterlyReport()` is called for Physical indicator CUD but never for Financial CUD. Editing financial records on a Published quarterly report leaves it Published — a governance violation.

**Changes:**

1. **`createFinancial()`** — after successful INSERT:
   ```typescript
   await this.autoRevertQuarterlyReport(dto.fiscal_year, dto.quarter, userId);
   ```

2. **`updateFinancial()`** — after successful UPDATE (using the pre-fetched record from FA-B):
   ```typescript
   // Use fiscal_year from fetched record (or from dto if provided)
   const revertFiscalYear = dto.fiscal_year ?? existing.rows[0].fiscal_year;
   const revertQuarter = dto.quarter ?? existing.rows[0].quarter;
   await this.autoRevertQuarterlyReport(revertFiscalYear, revertQuarter, userId);
   ```

3. **`removeFinancial()`** — after soft-delete:
   - The pre-fetched record from FA-B provides fiscal_year and quarter
   - Call: `await this.autoRevertQuarterlyReport(record.fiscal_year, record.quarter, userId)`

**Important:** `autoRevertQuarterlyReport()` is a no-op if the quarterly report is already DRAFT — safe to call unconditionally. It only acts when status is non-DRAFT.

**Governance:** Any mutation to financial data (create, update, delete) must revert the associated quarterly report from Published/Pending to Draft. This forces re-review. This mirrors the Physical indicator lifecycle exactly.

---

### FA-D: Empty State — Show Table Structure with Header Row

**Finding:** FA-4
**File:** `pmo-frontend/pages/university-operations/financial/index.vue` (lines 894–910)

**Change:** Replace the icon/text/button empty-state card with a `v-table` that shows:
1. The complete column header row (Program / Line Item, Class, Appropriation, Obligations, % Utilization, Balance, Actions)
2. A single `<tr>` spanning all columns with centered, subdued empty-state text: `"No financial records for this quarter — click Add Financial Record to begin."`
3. Remove the standalone "Add First Record" button (the Add button is already in the pillar header above the table)

**Rationale:** Users need to see what data format is expected even before they enter anything. The DBM BAR No. 2 table structure should be visible upfront. This also prevents confusion about why no data appears after a quarter switch.

**Governance:** The financial table structure must remain visible at all times. Zero-record state must not hide the reporting format.

---

### FA-E: Instructional Guide Rename and Restructure

**Finding:** FA-5
**File:** `pmo-frontend/pages/university-operations/financial/index.vue` (lines 841–872)

**Changes:**

1. **Rename title:** `"Financial Data Entry Guide"` → `"How to Enter Financial Data"`

2. **Replace unstructured paragraphs with numbered steps:**
   - **Step 1 — Select the correct Pillar tab** (MFO1–MFO4) that corresponds to the budget you are reporting
   - **Step 2 — Click "Add Financial Record"** to open the data entry form
   - **Step 3 — Fill in the required fields:**
     - *Program / Line Item* — name of the budget line (e.g., "Salaries and Wages", "Office Supplies")
     - *Campus* — Main Campus or Cabadbaran Campus
     - *Expense Class* — PS (Personal Services), MOOE (Maintenance), or CO (Capital Outlay)
     - *Appropriation* — total approved budget for this line (e.g., ₱5,000,000.00)
     - *Obligations* — amount committed or obligated (e.g., ₱3,250,000.00)
     - *Disbursement (optional)* — actual cash released (e.g., ₱2,800,000.00)
   - **Step 4 — Submit for review** when all records are complete. Use the Submit button at the top of the pillar section.

3. **Add a definitions callout** for Unobligated Balance:
   - *Balance (Unobligated) = Appropriation − Obligations* (DBM BAR No. 2 standard)
   - *% Utilization = (Obligations ÷ Appropriation) × 100*

**Governance:** Instructional content must be action-oriented, use numbered steps, and include sample values to match PMO data entry expectations.

---

### Phase FA Execution Priority

| Priority | Step | Severity | Scope | Key Risk | Status |
|----------|------|----------|-------|----------|--------|
| 1 | FA-A: Reset stale quarterly report state | HIGH | Frontend (1 line) | None — safe, immediate | ✅ DONE |
| 2 | FA-B: Pass quarter to validateOperationEditable | CRITICAL | Backend (3 methods) | Must fetch record before validation in update/delete | ✅ DONE |
| 3 | FA-C: Wire autoRevertQuarterlyReport for financial CUD | CRITICAL | Backend (3 methods) | Uses same pre-fetched record as FA-B — can be done together | ✅ DONE |
| 4 | FA-D: Show table headers in empty state | MEDIUM | Frontend (replace empty state block) | None — pure UI change | ✅ DONE |
| 5 | FA-E: Rename and restructure instructional guide | LOW | Frontend (expansion panel content) | None — content only | ✅ DONE |

---

### Phase FA Governance Directives

| # | Directive | Phase |
|---|-----------|-------|
| 114 | **Frontend must reset stale quarterly report state immediately on quarter/FY switch** | Phase FA-A |
| 115 | **Financial CRUD must pass quarter to validateOperationEditable — no bypass via undefined** | Phase FA-B |
| 116 | **autoRevertQuarterlyReport must be called after every successful financial CUD operation** | Phase FA-C |
| 117 | **Table column structure must be visible even when zero records exist** | Phase FA-D |
| 118 | **Instructional UI must use numbered steps with sample values, not generic bullet paragraphs** | Phase FA-E |

---

## Phase FB — Critical Fix: Quarter Status Isolation Full Repair + Non-Persistent Prior-Quarter Data Prefill

**Research Reference:** `research.md` Section 2.08
**Date:** 2026-03-19
**Scope:** 2 implementation steps — (A) complete the status isolation fix in the watchers, (B) implement non-persistent prior-quarter prefill entirely on the frontend.

---

### FB-A: Complete Status Isolation Fix — Reset in Watchers, Not Only in fetchQuarterlyReport()

**Finding:** FB-1, FB-2
**File:** `pmo-frontend/pages/university-operations/financial/index.vue` — watchers section (lines 625–651)

**Problem recap:** FA-A added the null reset inside `fetchQuarterlyReport()`. But `fetchQuarterlyReport()` doesn't start until `fetchFinancialData()` completes (~300ms later). The Pillar Header Card and Lock Advisory Banners are unconditionally rendered — they read `currentQuarterlyReport` during this 300ms window and show the stale Q1 PUBLISHED state.

**Change:** Add `currentQuarterlyReport.value = null` as the **first line** inside both affected watchers, before any `await` call:

1. **`watch(selectedQuarter)`** (line 640):
   ```typescript
   watch(selectedQuarter, async () => {
     if (isInitializing) return
     currentQuarterlyReport.value = null   // ← ADD: instant clear at t=0
     await fetchFinancialData()
     await fetchQuarterlyReport()
   })
   ```

2. **`watch(selectedFiscalYear)`** (line 632):
   ```typescript
   watch(selectedFiscalYear, async (newYear) => {
     if (isInitializing) return
     if (!newYear || newYear < 2020) return
     currentQuarterlyReport.value = null   // ← ADD: instant clear at t=0
     router.replace({ query: { ...route.query, year: newYear.toString() } })
     await fetchFinancialData()
     await fetchQuarterlyReport()
   })
   ```

**Why NOT in `activePillar` watcher:** The quarterly report status is per FY+quarter, not per pillar. Switching pillars while staying in Q1 FY2026 should still show Q1's status. The `activePillar` watcher does not (and should not) call `fetchQuarterlyReport()` — no change needed there.

**Why NOT in `onMounted`:** `currentQuarterlyReport` is initialized as `null` (line 99). On mount it correctly starts null and is populated by `fetchQuarterlyReport()`. No issue on initial load.

**Result:** Status chip, lock banners, and submit buttons all immediately reflect "Not Started" (null state) the moment the user changes quarter or fiscal year — zero stale display window.

**Governance:** Status UI must be consistent with the selected FY+quarter at the instant of selection, not after two sequential API round-trips.

---

### FB-B: Non-Persistent Prior-Quarter Data Prefill

**Finding:** FB-3, FB-4, FB-5, FB-6
**File:** `pmo-frontend/pages/university-operations/financial/index.vue` — script and template sections

**This is a purely frontend change. Zero backend changes required.**

#### FB-B-1: New State Refs

Add four new refs in the State section (after line 101):

```typescript
// Phase FB-B: Prior-quarter prefill state (non-persistent)
const prefillRecords = ref<any[]>([])
const isPrefillMode = ref(false)
const prefillSourceQuarter = ref<string | null>(null)
const prefillLoading = ref(false)
```

#### FB-B-2: Prior Quarter Map and Fetch Function

Add a constant and async function in the Data Fetching section (after `fetchQuarterlyReport()`):

```typescript
// Phase FB-B: Prior quarter sequence (same FY, one step back)
const PRIOR_QUARTER_MAP: Record<string, string | null> = {
  Q1: null, Q2: 'Q1', Q3: 'Q2', Q4: 'Q3',
}

// Phase FB-B: Fetch prior quarter records as non-persistent reference
async function fetchPrefillData() {
  const priorQ = PRIOR_QUARTER_MAP[selectedQuarter.value]
  if (!priorQ || !currentOperation.value) {
    clearPrefill()
    return
  }
  prefillLoading.value = true
  try {
    const res = await api.get<any[]>(
      `/api/university-operations/${currentOperation.value.id}/financials`
      + `?fiscal_year=${selectedFiscalYear.value}&quarter=${priorQ}`
    )
    const records = Array.isArray(res) ? res : (res as any)?.data || []
    if (records.length > 0) {
      prefillRecords.value = records
      isPrefillMode.value = true
      prefillSourceQuarter.value = priorQ
    } else {
      clearPrefill()
    }
  } catch {
    clearPrefill()
  } finally {
    prefillLoading.value = false
  }
}

function clearPrefill() {
  prefillRecords.value = []
  isPrefillMode.value = false
  prefillSourceQuarter.value = null
}
```

#### FB-B-3: Trigger Prefill After fetchFinancialData()

In `fetchFinancialData()`, after `loading.value = false`, add the prefill trigger:

```typescript
// Phase FB-B: If current quarter is empty, attempt to load prior quarter as reference
if (financialRecords.value.length === 0) {
  await fetchPrefillData()
} else {
  clearPrefill()   // records exist → no prefill needed
}
```

**Important:** `clearPrefill()` must also be called whenever the context changes. Add `clearPrefill()` at the start of `fetchFinancialData()` (or in the watchers) so stale prefill data never carries over between quarter/pillar/FY switches.

#### FB-B-4: Watcher Updates for Prefill Clear

In both `watch(selectedQuarter)` and `watch(selectedFiscalYear)` (which already get the `currentQuarterlyReport.value = null` from FB-A), also add `clearPrefill()` at the top:

```typescript
watch(selectedQuarter, async () => {
  if (isInitializing) return
  currentQuarterlyReport.value = null   // FB-A
  clearPrefill()                        // FB-B
  await fetchFinancialData()
  await fetchQuarterlyReport()
})
```

(Same pattern for `selectedFiscalYear` and `activePillar` watchers.)

#### FB-B-5: Template — Prefill Banner and Table Rendering

**In the empty-state section and data section of the template:**

When `isPrefillMode === true`, replace (or augment) the empty-state table with a prefill view:

1. **Prefill banner** (above table, inside `<template v-else>` after Add button):
   ```html
   <v-alert v-if="isPrefillMode" type="info" variant="tonal" class="mb-3" closable
     @click:close="clearPrefill">
     <div class="d-flex align-center justify-space-between flex-wrap ga-2">
       <span>
         <v-icon start size="small">mdi-content-copy</v-icon>
         <strong>{{ prefillSourceQuarter }} reference loaded</strong> —
         {{ prefillRecords.length }} record(s) from {{ prefillSourceQuarter }} FY {{ selectedFiscalYear }}
         shown below. These are <strong>not saved</strong>. Click "Save as {{ selectedQuarter }}" to create records.
       </span>
       <div class="d-flex ga-2">
         <v-btn size="small" color="primary" variant="tonal"
           :loading="saving" @click="saveAllPrefillRecords">
           Save All as {{ selectedQuarter }}
         </v-btn>
         <v-btn size="small" variant="text" @click="clearPrefill">
           Use Empty Form
         </v-btn>
       </div>
     </div>
   </v-alert>
   ```

2. **Prefill table** (replace empty-state card when `isPrefillMode && financialRecords.length === 0`):
   - Render the prefill records in the same campus/expense-class grouped table structure
   - Each prefill row uses `bg-grey-lighten-5` background (or `class="prefill-row"`) to visually distinguish
   - Each row shows a `"From {{ prefillSourceQuarter }}"` chip in the Class column
   - Row action: single `"Save as {{ selectedQuarter }}"` button → calls `openPrefillSaveDialog(prefillRecord)`

3. **`openPrefillSaveDialog(record)`** function:
   - Sets `editingRecord.value = null` (it's a CREATE, not an edit of existing)
   - Populates `entryForm.value` from the prefill record (same fields, except `id`, `created_by`, etc.)
   - Opens `entryDialog.value = true`
   - On save success → removes the record from `prefillRecords`; if `prefillRecords.length === 0`, calls `clearPrefill()`

4. **`saveAllPrefillRecords()`** function:
   - Iterates through all `prefillRecords`
   - For each record, POST to `/{operationId}/financials` with current quarter and FY
   - On complete success → call `clearPrefill()`, re-fetch financial data (which will now show real records)
   - On partial failure → show toast error, keep failed records in `prefillRecords`

#### FB-B-6: Prefill Loading Spinner

When `prefillLoading === true` and `financialRecords.length === 0`, show a subtle loading indicator in the empty-state area instead of the empty table, so the user knows data is being fetched:

```html
<div v-if="prefillLoading" class="text-center py-4 text-grey">
  <v-progress-circular indeterminate size="24" class="mr-2" />
  Loading {{ PRIOR_QUARTER_MAP[selectedQuarter] }} reference data...
</div>
```

---

### Phase FB Execution Priority

| Priority | Step | Severity | Scope | Key Risk | Status |
|----------|------|----------|-------|----------|--------|
| 1 | FB-A: Add null reset in watchers (not just in fetchQuarterlyReport) | CRITICAL | Frontend (2 watcher additions) | None — safe synchronous assignment | ✅ DONE |
| 2 | FB-B: Prior-quarter prefill — state, fetch function, template | MEDIUM | Frontend only (no backend) | Must not auto-save; clear on any context switch | ✅ DONE |

---

### Phase FB Governance Directives

| # | Directive | Phase |
|---|-----------|-------|
| 119 | **`currentQuarterlyReport` must be set to null synchronously in the watcher, before any async fetch** | Phase FB-A |
| 120 | **Prior-quarter prefill records must never be auto-saved. Persistence only on explicit user action.** | Phase FB-B |
| 121 | **Prefill state (prefillRecords, isPrefillMode) must be cleared on every quarter, FY, or pillar switch** | Phase FB-B |
| 122 | **Prefill fetch uses the existing GET /financials?quarter endpoint — no new backend endpoint required** | Phase FB-B |
| 123 | **Prefill UI must visually distinguish reference rows from saved records at all times** | Phase FB-B |
| 124 | **"Save as Qx" on a prefill row must open the standard entry dialog — user must confirm before POST** | Phase FB-B |
