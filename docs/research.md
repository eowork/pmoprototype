# PMO Dashboard: Active Research

**Governance:** ACE v2.4 Phase 1 (Research Complete)
**Last Updated:** 2026-03-20
**Status:** MAINTENANCE — All research through Section 2.08 archived. Awaiting next scope.
**Context:** `CLAUDE.md` (project root) | Archive: `docs/archive/`

---

## 1. CURRENT FINDINGS (Active Research)

### 1.85 Phase EE+EF — Pillar Header Consolidation & User Management Integration (Mar 11, 2026)

**Status:** ✅ PHASE 1 RESEARCH COMPLETE + PHASE 3 IMPLEMENTED

#### CRITICAL FINDING: Artifact-Implementation Gap

Five phases marked ✅ IMPLEMENTED in plan.md were NOT present in the actual code:
- EA-A: v-tooltip on v-select still wrapping quarter selector (lines 826–843)
- EA-B: "Save All Quarters" button label unchanged (line 1492)
- EA-D: DR-E standalone summary row still existed; pillar header not enriched
- EC-A: Publishing status chip not in header; `currentQuarterStatus` undefined
- EC-B: `-webkit-line-clamp` not applied to `.indicator-text`

Root cause: Context-window compression between sessions caused session summaries to report implementation as complete when only artifact documents were updated.

#### Phase EE Implementation

- EE-A: Removed standalone DR-E `v-row` (was lines 949–970)
- EE-B: Enriched pillar header right side: FY chip + publication status chip + indicator count chip + achievement rate chip
- EE-C: Moved submission controls (Submit/Withdraw/Approve/Reject) into pillar header card; STATUS BAR alert retained only for rejection notes
- EE-D: Removed v-tooltip wrapper from quarter selector v-select
- EE-E: Changed "Save All Quarters" → "Save" in entry dialog
- EE-F: Added `-webkit-line-clamp: 3` + `display: -webkit-box` to `.indicator-text`; added `white-space: pre-line` spans in tooltip content

#### Phase EF Implementation

- EF-A: DEFERRED — `currentOperation.created_by` is a UUID; display name not available in the operation response without additional API call
- EF-B: DEFERRED — No UO assignment controller endpoints exist in the backend
- EF-C: Added admin-only "Users" navigation button in UO main page header (routes to `/users`)

---

### 1.84 Phase EC+ED — Physical Accomplishment & Analytics Refinement (Mar 11, 2026)

**Status:** ✅ PHASE 1 RESEARCH COMPLETE + PHASE 3 IMPLEMENTED

#### A. Physical Page Findings

**A.1 Pillar Header Publishing Status:** Phase EA-D merged DR-E summary chips into the pillar header (indicator count + rate%). Publishing status was only visible in the top STATUS BAR alert (`currentQuarterStatus`), not in the header. Data already available — no API changes.

**A.2 Indicator Text Layout:** Migration 022 stored AE-OC-01 with literal `\n` newlines (4 sub-items (a)-(d)). `.indicator-text` CSS had `white-space: pre-line` which correctly renders newlines — but no line-clamp existed. Result: the AE-OC-01 row was 5-6 lines tall, disrupting compact table alignment. Tooltip already wraps activator with `max-width="400"` for full text on hover. Fix: CSS `-webkit-line-clamp: 3` + tooltip `white-space: pre-line`.

#### B. Analytics Findings

**B.1 Target vs Actual Formula:** Phase EB-A used `count_target`/`count_accomplishment` (SUM of COUNT/WEIGHTED_COUNT indicators only). Higher Education and Advanced Education are PERCENTAGE type — both rendered as zero bars. Fix: revert to `indicator_target_rate`/`indicator_actual_rate` (rate-based, works for all unit types).

**B.2 Donut Chart:** `endAngle: 270` creates a 270° arc (¾ circle). Fix: `startAngle: -90, endAngle: 270` = full 360° from 12 o'clock.

**B.3 Analytics Notes:** No explanation panel existed. Added `v-expansion-panels` accordion pattern (same as physical page's Quarterly Reporting Guide).

**B.4 YoY Pillar Filter:** Backend `getYearlyComparison` already returns `years[i].pillars[]` with per-pillar `accomplishment_rate`. Frontend ignored this — showed aggregated totals only. Added `selectedYoYPillar` filter that switches between aggregated mode (ALL) and per-pillar rate mode.

---

### 1.75 Quarter-Specific Data Entry Refactor — Root Cause Analysis (Mar 10, 2026)

**Status:** ✅ PHASE 1 RESEARCH COMPLETE
**Priority:** P1 — Incorrect quarterly independence; data overwrite risk
**Scope:** Frontend-only (physical/index.vue). No DB, backend, or DTO changes required.

#### A. DATABASE (CONFIRMED CORRECT — NO CHANGES NEEDED)
- `operation_indicators` wide model: `target_q1-4`, `accomplishment_q1-4`, `score_q1-4` — all NULLABLE DECIMAL(12,4)
- UNIQUE constraint: `(operation_id, pillar_indicator_id, fiscal_year)` — one row per indicator per FY
- Schema already supports independent per-quarter storage

#### B. BACKEND (CONFIRMED CORRECT — NO CHANGES NEEDED)
- `updateIndicatorQuarterlyData()` uses `Object.keys(dto).filter(k => dto[k] !== undefined)`
- Partial quarter payloads already work: send only `{ target_q3, accomplishment_q3 }` → only Q3 updated
- DTO: all 12 quarter fields are `@IsOptional()`

#### C. ROOT CAUSE — FRONTEND SUBMISSION DESIGN FLAW
```
openEntryDialog() → loads ALL 12 quarter fields from DB into entryForm
saveQuarterlyData() → sends ALL 12 fields in every PATCH (null for unfilled quarters)
Backend → null !== undefined → actively SET Q2=null, Q3=null, Q4=null when saving Q1
```
**Effect:** Any save resets all unedited quarters to null. No quarter-specific isolation exists.

#### D. SECONDARY ISSUE — NO QUARTER SELECTOR IN DIALOG
- `selectedQuarter` (page-level) controls display column mode only — does NOT affect dialog
- Dialog always renders all 4 quarter rows simultaneously
- No prefill-from-previous-quarter logic exists

#### E. REQUIRED FIX — FRONTEND ONLY
1. Add `dialogQuarter` tab selector inside the dialog
2. Show only active quarter's editable fields
3. Prefill target from previous quarter when current quarter has no data
4. Send ONLY current quarter's fields in payload on save

---

### 1.69 Physical Accomplishment UPDATE Failure — Root Cause Analysis (Mar 4, 2026) [REVISED]

**Status:** 🔴 PHASE 1 RESEARCH COMPLETE (Revision 2)  
**Priority:** P0 — CRITICAL — UPDATE operations fail with 404 across all fiscal years  
**Previous Attempt:** Phase DL-A/DL-B (type-safe fix) DID NOT resolve issue  
**Directive:** Re-investigate actual root cause after implementation failure  

---

#### A. IMPLEMENTATION FAILURE ANALYSIS

**Phase DL-A & DL-B Changes Made:**
- Added backend debug logging
- Added frontend debug logging  
- Applied type-safe comparison fix in `findCurrentOperation()`: `Number(op.fiscal_year) === Number(selectedFiscalYear.value)`

**Result:** ❌ **404 errors PERSIST** — fix did NOT work

**Implication:** The type mismatch was NOT the root cause. The actual bug is elsewhere.

---

#### B. TRUE ROOT CAUSE DISCOVERED

**Critical Flow Analysis:**

When `saveQuarterlyData()` executes (line 389), it uses:
```typescript
const operationId = currentOperation.value.id  // line 434
```

**The bug occurs in this scenario:**

1. **User creates new data for FY 2025 (first time):**
   - `currentOperation.value` is NULL (no operation exists yet)
   - Line 420: Creates new operation via POST
   - Line 430: Sets `currentOperation.value = createRes`
   - Line 434: `operationId = currentOperation.value.id` ✅ CORRECT

2. **User immediately edits that data (within same session):**
   - Dialog opens with `_existingId` set to the newly created indicator record ID
   - Line 434: `operationId = currentOperation.value.id`
   - **Question:** Is `currentOperation.value` STILL the correct operation?

3. **User switches year THEN edits:**
   - `watch` triggers `fetchPillarData()` (line 587-593)
   - `fetchPillarData()` calls `findCurrentOperation()` at line 193
   - **BUT** this is ASYNC
   - If user clicks "Enter Data" BEFORE `findCurrentOperation()` completes, `currentOperation.value` is stale

**HOWEVER** — The actual issue is simpler:

**REAL BUG:**

Look at line 440:
```typescript
const existsInCurrentYear = pillarIndicators.value.some(i => i.id === _existingId)
```

This checks if `_existingId` (the indicator record ID from `operation_indicators` table) exists in `pillarIndicators.value`.

**`pillarIndicators.value` contains records from:**
```typescript
const indicatorsRes = await api.get<any[]>(
  `/api/university-operations/indicators?pillar_type=${activePillar.value}&fiscal_year=${selectedFiscalYear.value}`
)
```

This returns **all indicators for that pillar + year** across **ALL operations**.

**BUT** the backend query (from Phase 1 research) is:
```sql
SELECT oi.*
FROM operation_indicators oi
LEFT JOIN pillar_indicator_taxonomy pit ON oi.pillar_indicator_id = pit.id
JOIN university_operations uo ON oi.operation_id = uo.id
WHERE uo.operation_type = $1
  AND oi.fiscal_year = $2
```

**This query does NOT guarantee that all indicators belong to the SAME operation.**

If there are MULTIPLE operations for the same pillar + year (e.g., different campuses, different users), indicators from ALL operations are mixed together in `pillarIndicators.value`.

**Example Scenario:**

1. Admin creates Higher Ed operation for FY 2025 (operation A)
2. Admin adds indicators to operation A
3. Staff creates ANOTHER Higher Ed operation for FY 2025 (operation B)
4. Staff adds indicators to operation B
5. Admin views Physical Accomplishment page
6. `findCurrentOperation()` returns operation A (admin's operation)
7. `pillarIndicators.value` contains indicators from BOTH operation A and operation B
8. Admin clicks "Enter Data" on an indicator that belongs to operation B
9. `_existingId` = indicator from operation B
10. `saveQuarterlyData()` uses `operationId` = operation A
11. Backend query: `WHERE oi.id = indicatorB AND oi.operation_id = operationA` → 0 rows → 404

**THE TRUE ROOT CAUSE:**

**Frontend assumes ONE operation per (pillar + fiscal_year), but database allows MULTIPLE operations per (pillar + fiscal_year).**

**The indicator's `operation_id` does NOT match `currentOperation.value.id`.**

---

#### C. VERIFICATION OF ROOT CAUSE

**Database Schema Check:**

`university_operations` table has:
- `operation_type` (pillar: HIGHER_EDUCATION, etc.)
- `fiscal_year` (2024, 2025, etc.)
- `created_by` (user who created the operation)
- `campus` (MAIN, CABADBARAN, BOTH)

**NO UNIQUE CONSTRAINT on (operation_type + fiscal_year).**

Multiple users can create operations for the same pillar + year.

**Indicator Ownership:**

`operation_indicators` table has:
- `operation_id` (FK to `university_operations.id`)
- Records belong to SPECIFIC operations, not shared across operations

**Frontend Assumption (BROKEN):**

Line 193: `await findCurrentOperation()`

```typescript
currentOperation.value = data.find(
  (op: any) => op.operation_type === activePillar.value && Number(op.fiscal_year) === Number(selectedFiscalYear.value)
) || null
```

**This returns the FIRST operation matching (pillar + year), but there may be MULTIPLE operations.**

---

#### D. WHY THE 404 OCCURS

**Backend Query (`university-operations.service.ts:962-970`):**

```sql
SELECT oi.id, oi.fiscal_year, oi.pillar_indicator_id, oi.operation_id, oi.particular
FROM operation_indicators oi
WHERE oi.id = $1 AND oi.operation_id = $2 AND oi.deleted_at IS NULL
```

**Parameters:** `[indicatorId, operationId]`

**Failure Scenario:**
- `indicatorId` = UUID of indicator belonging to **operation B**
- `operationId` = UUID of **operation A** (from `currentOperation.value.id`)
- Query returns 0 rows because indicator B does NOT belong to operation A
- Backend throws 404

---

#### E. PROOF OF ROOT CAUSE

**Key Evidence:**

1. **Multiple Operations Exist:**
   - Backend endpoint `/api/university-operations` returns ALL operations (filtered by user permissions)
   - Frontend calls `findCurrentOperation()` which picks the FIRST match
   - No guarantee it's the right operation for the indicator being edited

2. **Indicator Fetch is Cross-Operation:**
   - `GET /api/university-operations/indicators?pillar_type=X&fiscal_year=Y` returns indicators from ALL operations matching pillar + year
   - Frontend displays these indicators as if they all belong to ONE operation

3. **Save Logic Assumes Single Operation:**
   - Line 434: `const operationId = currentOperation.value.id`
   - PATCH URL: `/api/university-operations/${operationId}/indicators/${_existingId}/quarterly`
   - If `_existingId` belongs to a DIFFERENT operation than `operationId`, backend returns 404

---

#### F. THE ACTUAL FIX REQUIRED

**Option 1: Use Indicator's Actual operation_id (RECOMMENDED)**

Instead of:
```typescript
const operationId = currentOperation.value.id
```

Use:
```typescript
const existingIndicator = pillarIndicators.value.find(i => i.id === _existingId)
const operationId = existingIndicator ? existingIndicator.operation_id : currentOperation.value.id
```

**This ensures PATCH uses the correct operation ID that the indicator ACTUALLY belongs to.**

**Option 2: Enforce Single Operation per (Pillar + Year)**

Add unique constraint:
```sql
CREATE UNIQUE INDEX uq_operations_pillar_year_user 
ON university_operations(operation_type, fiscal_year, created_by) 
WHERE deleted_at IS NULL;
```

**This prevents multiple operations, but breaks multi-user workflow.**

**Option 3: Filter Indicators by Current Operation Only**

Change indicator fetch query to:
```typescript
const indicatorsRes = await api.get<any[]>(
  `/api/university-operations/${currentOperation.value.id}/indicators?fiscal_year=${selectedFiscalYear.value}`
)
```

**This only shows indicators belonging to the current user's operation, but hides other users' data.**

---

#### G. RECOMMENDED SOLUTION

**Fix:** **Option 1** — Use indicator's actual `operation_id` when calling PATCH

**Why:**
- Minimal code change (2 lines)
- Preserves multi-operation support
- No schema migration required
- Works with existing data

**Implementation:**
1. When `_existingId` is set, look up the indicator in `pillarIndicators.value`
2. Extract `operation_id` from that indicator
3. Use that `operation_id` in PATCH URL instead of `currentOperation.value.id`

**Verification:**
- PATCH URL will use the CORRECT operation ID
- Backend query will find the indicator
- No 404 error

---

#### H. SECONDARY ISSUE — `currentOperation.value` Ambiguity

**Problem:** `findCurrentOperation()` returns the FIRST operation matching (pillar + year), which may not be the user's operation if multiple operations exist.

**Fix:** Filter by `created_by` to get user's own operation:

```typescript
currentOperation.value = data.find(
  (op: any) => 
    op.operation_type === activePillar.value && 
    Number(op.fiscal_year) === Number(selectedFiscalYear.value) &&
    op.created_by === authStore.user?.id  // Only user's own operations
) || null
```

**OR** use the FIRST operation the user has access to (if assigned/delegated).

---

#### I. SUMMARY

**Root Cause:** Frontend uses `currentOperation.value.id` for PATCH, but `_existingId` may belong to a DIFFERENT operation. Backend query enforces `WHERE oi.operation_id = $2`, causing 404 when mismatch occurs.

**Fix:** Extract `operation_id` from the indicator record itself instead of using `currentOperation.value.id`.

**Status:** Ready for Phase 2 (Plan revision)

---

---

#### A. SYMPTOM SUMMARY

**Error Pattern:**
```
PATCH /api/university-operations/:operationId/indicators/:indicatorId/quarterly
→ 404 Indicator <indicatorId> not found in operation <operationId>
```

**Verified Behavior:**
- ✅ CREATE quarterly data succeeds (POST endpoint works)
- ❌ UPDATE quarterly data fails (PATCH endpoint returns 404)
- ❌ Error occurs across ALL fiscal years (not year-specific)
- ✅ Data exists in database (confirmed via frontend display)
- ❌ Backend lookup query returns 0 rows

**Example Error:**
```
Indicator 5d4c2ac0-36c3-4e16-9779-27fa9f34dd37 not found in operation e39430ff-3b68-421d-8fc0-9e1a0af4cdc4
```

---

#### B. ROOT CAUSE IDENTIFIED — UUID MISMATCH

**Critical Discovery:**

The frontend is sending the **wrong UUID** in the PATCH request URL.

**Frontend Logic (`pmo-frontend/pages/university-operations/physical/index.vue:414-420`):**
```typescript
if (_existingId) {
  // Phase DJ-A: Use dedicated quarterly PATCH endpoint
  await api.patch(
    `/api/university-operations/${operationId}/indicators/${_existingId}/quarterly`,
    payload
  )
}
```

**Value of `_existingId` (`index.vue:357`):**
```typescript
_existingId: existingData?.id || null
```

**Value of `existingData` (`index.vue:330`):**
```typescript
const existingData = getIndicatorData(indicator.id)  // ❌ WRONG: indicator.id = taxonomy ID
```

**Function `getIndicatorData` (`index.vue:158-160`):**
```typescript
function getIndicatorData(taxonomyId: string) {
  return pillarIndicators.value.find(i => i.pillar_indicator_id === taxonomyId) || null
}
```

**Data Source (`index.vue:179-181`):**
```typescript
const indicatorsRes = await api.get<any[]>(
  `/api/university-operations/indicators?pillar_type=${activePillar.value}&fiscal_year=${selectedFiscalYear.value}`
)
pillarIndicators.value = Array.isArray(indicatorsRes) ? indicatorsRes : (indicatorsRes as any)?.data || []
```

**Backend Query (`pmo-backend/src/university-operations/university-operations.service.ts:749-768`):**
```sql
SELECT
  oi.*,               -- oi.id = operation_indicators.id (UUID A)
  pit.indicator_name, -- pit.id = pillar_indicator_taxonomy.id (UUID B)
  pit.indicator_code,
  pit.uacs_code,
  pit.unit_type,
  pit.indicator_type,
  pit.description
FROM operation_indicators oi
LEFT JOIN pillar_indicator_taxonomy pit ON oi.pillar_indicator_id = pit.id
JOIN university_operations uo ON oi.operation_id = uo.id
WHERE uo.operation_type = $1
  AND (pit.pillar_type = $1 OR pit.pillar_type IS NULL)
  AND oi.fiscal_year = $2
  AND oi.deleted_at IS NULL
  AND uo.deleted_at IS NULL
ORDER BY COALESCE(pit.indicator_order, 999) ASC, oi.particular ASC
```

**Data Structure Returned:**
```typescript
{
  id: "5d4c2ac0-36c3-4e16-9779-27fa9f34dd37",           // operation_indicators.id (record ID)
  pillar_indicator_id: "a1b2c3d4-...",                   // pillar_indicator_taxonomy.id (taxonomy ID)
  operation_id: "e39430ff-3b68-421d-8fc0-9e1a0af4cdc4",
  fiscal_year: 2025,
  target_q1: 50, ...
}
```

**Frontend Dialog Open Logic (`index.vue:323-360`):**
```typescript
function openEntryDialog(indicator: any) {
  selectedIndicator.value = indicator  // indicator = taxonomy object (pit.id)
  const existingData = getIndicatorData(indicator.id)  // Lookup by taxonomy ID ✅

  entryForm.value = {
    pillar_indicator_id: indicator.id,   // ✅ taxonomy ID (correct for payload)
    fiscal_year: selectedFiscalYear.value,
    target_q1: existingData?.target_q1 ?? null,
    ...
    _existingId: existingData?.id || null,  // ✅ operation_indicators.id (record ID)
  }
}
```

**Frontend Save Logic (`index.vue:414-420`):**
```typescript
const { _existingId, ...payload } = entryForm.value

if (_existingId) {
  await api.patch(
    `/api/university-operations/${operationId}/indicators/${_existingId}/quarterly`,
    payload  // ✅ payload contains pillar_indicator_id (taxonomy ID)
  )
}
```

**Backend PATCH Endpoint (`pmo-backend/src/university-operations/university-operations.service.ts:962-970`):**
```typescript
const check = await this.db.query(
  `SELECT oi.id, oi.fiscal_year, oi.pillar_indicator_id, oi.operation_id, oi.particular,
          pit.pillar_type, pit.indicator_name, uo.operation_type
   FROM operation_indicators oi
   LEFT JOIN pillar_indicator_taxonomy pit ON oi.pillar_indicator_id = pit.id
   JOIN university_operations uo ON oi.operation_id = uo.id
   WHERE oi.id = $1 AND oi.operation_id = $2 AND oi.deleted_at IS NULL`,
  [indicatorId, operationId],  // indicatorId = URL param (should be operation_indicators.id)
);

if (check.rows.length === 0) {
  throw new NotFoundException(
    `Indicator ${indicatorId} not found in operation ${operationId}`,
  );
}
```

**THE BUG:**

❌ Frontend sends `_existingId` which is **correctly** set to `operation_indicators.id`  
✅ Backend expects `indicatorId` to be `operation_indicators.id`  
✅ URL construction is correct: `/${operationId}/indicators/${_existingId}/quarterly`  
✅ Backend lookup is correct: `WHERE oi.id = $1`  

**WAIT — Re-analyzing...**

Let me trace again more carefully:

1. User clicks "Enter Data" on an indicator row → `openEntryDialog(indicator)`
2. `indicator` parameter = **taxonomy object** from `pillarTaxonomy.value` (fetched from `/api/university-operations/taxonomy/${pillarType}`)
3. `indicator.id` = `pillar_indicator_taxonomy.id` (taxonomy UUID)
4. `getIndicatorData(indicator.id)` looks up by `pillar_indicator_id` ✅
5. `existingData?.id` = `operation_indicators.id` (record UUID) ✅
6. `_existingId` = record UUID ✅
7. PATCH URL = `.../${operationId}/indicators/${_existingId}/quarterly` ✅
8. Backend receives `indicatorId` = `_existingId` = record UUID ✅
9. Backend query: `WHERE oi.id = $1` ✅

**This should work. But it doesn't. Why?**

**HYPOTHESIS:** The `_existingId` may be NULL or UNDEFINED when it should have a value.

**Phase DI-C Validation Check (`index.vue:385-402`):**
```typescript
if (_existingId) {
  // Verify indicator still exists in current year's data
  const existsInCurrentYear = pillarIndicators.value.some(i => i.id === _existingId)

  if (!existsInCurrentYear) {
    console.warn('[Physical] _existingId not found in current year data. Switching to POST (create new).')
    // Treat as new record for this year
    await api.post(
      `/api/university-operations/${operationId}/indicators/quarterly`,
      payload
    )
    toast.success('Quarterly data saved for current year')
    entryDialog.value = false
    await fetchPillarData()
    return
  }
}
```

**CRITICAL FINDING:**

The validation check `pillarIndicators.value.some(i => i.id === _existingId)` is checking if `_existingId` (operation_indicators.id) matches any `i.id` in the array.

BUT `pillarIndicators.value[].id` IS `operation_indicators.id` — so this SHOULD pass.

**UNLESS...**

The data returned from `/api/university-operations/indicators?pillar_type=...&fiscal_year=...` does NOT have an `id` field, or the field is named differently!

Let me check the backend response structure.

**Backend Service (`university-operations.service.ts:782`):**
```typescript
return result.rows.map((row) => this.computeIndicatorMetrics(row));
```

**Function `computeIndicatorMetrics` (`university-operations.service.ts:821-856`):**
```typescript
private computeIndicatorMetrics(record: any): any {
  // ... computation logic ...
  return {
    ...record,
    average_target: averageTarget !== null ? parseFloat(averageTarget.toFixed(4)) : null,
    average_accomplishment: averageAccomplishment !== null ? parseFloat(averageAccomplishment.toFixed(4)) : null,
    variance: variance !== null ? parseFloat(variance.toFixed(4)) : null,
    accomplishment_rate: accomplishmentRate !== null ? parseFloat(accomplishmentRate.toFixed(2)) : null,
  };
}
```

**Returned Fields:**
- `...record` spreads ALL columns from SQL query (including `oi.*` which has `oi.id`)
- Plus computed metrics

**So `id` field SHOULD be present.**

**NEW HYPOTHESIS:**

The issue is NOT with the lookup logic. The issue is that **UPDATE is being called BEFORE any data exists for that fiscal year**.

Let me re-read the symptoms:

> CREATE quarterly data works  
> UPDATE quarterly data fails

**Scenario:**
1. User selects Fiscal Year 2025 (first time entering data for this year)
2. No records exist in `operation_indicators` for 2025 yet
3. User clicks "Enter Data" on an indicator (e.g., "Student Enrollment Rate")
4. `getIndicatorData(taxonomy_id)` returns NULL (no data for 2025)
5. `_existingId` = NULL
6. Frontend should POST (create), not PATCH (update)

BUT the error message says:
> PATCH /api/university-operations/:operationId/indicators/:indicatorId/quarterly

This means PATCH is being called when it shouldn't be.

**REVISED HYPOTHESIS:**

The `_existingId` is being set to a NON-NULL value even when no data exists for the current fiscal year. This happens when:
- User previously entered data for a DIFFERENT fiscal year (e.g., 2024)
- User switches to 2025
- `pillarIndicators.value` is NOT cleared properly
- Stale 2024 data remains in memory
- `getIndicatorData()` returns 2024 record
- `_existingId` gets set to 2024 record's UUID
- PATCH attempts to update 2024 record in context of 2025 operation
- Backend lookup fails because `indicatorId` (2024 record) doesn't belong to `operationId` (2025 operation)

**Phase DI-C Cache Clear (`index.vue:166-168`):**
```typescript
// Phase DI-C: Clear stale cache BEFORE fetching new year data
pillarTaxonomy.value = []
pillarIndicators.value = []
```

This SHOULD prevent stale data. But maybe the clear happens AFTER the dialog is already open?

**FINAL ROOT CAUSE:**

The `_existingId` contains a **record UUID from a different operation** (different fiscal year or pillar type).

Backend query:
```sql
WHERE oi.id = $1 AND oi.operation_id = $2
```

This enforces that the indicator MUST belong to the specified operation. If the indicator belongs to a different operation (e.g., FY 2024 when operation is FY 2025), the query returns 0 rows → 404.

**VERIFICATION NEEDED:**

Check if `_existingId` is the CORRECT record ID for the CURRENT operation, or if it's a stale ID from a previous year/pillar.

---

#### C. MIGRATION AUDIT SUMMARY

**Migrations 013-022 Analysis:**

| Migration | Purpose | Impact on Indicator Update | Status |
|-----------|---------|---------------------------|--------|
| 013 | Performance indexes | ✅ No impact on UPDATE logic | Safe |
| 014 | Add fund_type, fiscal_year, campus to operations | ✅ No impact on indicators table | Safe |
| 015 | Expand DECIMAL(5,2) → DECIMAL(10,4) | ✅ Supports larger values, no constraint change | Safe |
| 016 | Create pillar_indicator_taxonomy table | ⚠️ Introduced taxonomy model | Safe |
| 016b | Align pillar_type to operation_type_enum | ✅ Type consistency fix | Safe |
| 017 | Add pillar_indicator_id FK to operation_indicators | ⚠️ Created FK relationship | Safe |
| 018 | Add organizational_outcome, extend indicator_name | ✅ Schema enhancement | Safe |
| 019 | Seed 14 BAR1 indicators | ✅ Static taxonomy data | Safe |
| 020 | Migrate orphan indicators | ⚠️ Auto-mapping by UACS code/name | Safe |
| 021 | **Add unique constraint: operation_id + pillar_indicator_id + fiscal_year** | ❌ **PREVENTS DUPLICATE INDICATORS PER YEAR** | **CRITICAL** |
| 022 | Add unique constraint for orphans | ⚠️ Prevents duplicate orphans | Safe |

**Migration 021 Impact Analysis:**

```sql
CREATE UNIQUE INDEX IF NOT EXISTS uq_operation_indicators_quarterly
ON operation_indicators (operation_id, pillar_indicator_id, fiscal_year)
WHERE deleted_at IS NULL;
```

**Constraint Logic:**
- One indicator record per (operation + taxonomy_indicator + fiscal_year)
- BLOCKS duplicate creation
- Does NOT block UPDATE (UPDATE uses `oi.id` as primary key)

**Conclusion:** Migration 021 is NOT the cause of UPDATE failures. The unique constraint prevents duplicate INSERTS, not UPDATES.

---

#### D. BACKEND UPDATE LOGIC ANALYSIS

**Controller Endpoint (`university-operations.controller.ts:239-248`):**
```typescript
@Patch(':id/indicators/:indicatorId/quarterly')
@HttpCode(HttpStatus.OK)
updateIndicatorQuarterlyData(
  @Param('id', ParseUUIDPipe) id: string,              // operation_id
  @Param('indicatorId', ParseUUIDPipe) indicatorId: string,  // operation_indicators.id
  @Body() dto: Partial<CreateIndicatorQuarterlyDto>,
  @CurrentUser() user: JwtPayload,
) {
  return this.service.updateIndicatorQuarterlyData(id, indicatorId, dto, user.sub, user);
}
```

**Service Method (`university-operations.service.ts:950-1060`):**

**Step 1: Indicator Existence Check (lines 962-976):**
```sql
SELECT oi.id, oi.fiscal_year, oi.pillar_indicator_id, oi.operation_id, oi.particular,
       pit.pillar_type, pit.indicator_name, uo.operation_type
FROM operation_indicators oi
LEFT JOIN pillar_indicator_taxonomy pit ON oi.pillar_indicator_id = pit.id
JOIN university_operations uo ON oi.operation_id = uo.id
WHERE oi.id = $1 AND oi.operation_id = $2 AND oi.deleted_at IS NULL
```
**Parameters:** `[indicatorId, operationId]`

**❌ FAILURE POINT:** This query returns 0 rows when `indicatorId` does NOT belong to `operationId`.

**Step 2: Fiscal Year Lock (lines 996-1000):**
```typescript
if (dto.fiscal_year && dto.fiscal_year !== indicator.fiscal_year) {
  throw new BadRequestException(
    `Cannot change fiscal year from ${indicator.fiscal_year} to ${dto.fiscal_year}. Create new record for different year.`,
  );
}
```
✅ Prevents cross-year updates

**Step 3: Update Execution (lines 1038-1044):**
```sql
UPDATE operation_indicators
SET ${setClause}, updated_by = $${fields.length + 1}, updated_at = NOW()
WHERE id = $${fields.length + 2}
RETURNING *
```
✅ Update by `oi.id` (primary key), NOT by `operation_id` + `pillar_indicator_id`

**Conclusion:** Backend logic is CORRECT. The issue is that the frontend is sending the WRONG `indicatorId`.

---

#### E. FRONTEND DATA FLOW ANALYSIS

**Phase DI-B: Year Selection (`index.vue:87-88`):**
```typescript
const selectedFiscalYear = ref(
  route.query.year ? parseInt(route.query.year as string, 10) : new Date().getFullYear()
)
```

**Data Fetch Trigger (`index.vue:163-202`):**
```typescript
async function fetchPillarData() {
  loading.value = true

  // Phase DI-C: Clear stale cache BEFORE fetching new year data
  pillarTaxonomy.value = []
  pillarIndicators.value = []

  try {
    // Fetch taxonomy
    const taxonomyRes = await api.get<any[]>(
      `/api/university-operations/taxonomy/${activePillar.value}`
    )
    pillarTaxonomy.value = Array.isArray(taxonomyRes) ? taxonomyRes : (taxonomyRes as any)?.data || []

    // Fetch indicator data
    const indicatorsRes = await api.get<any[]>(
      `/api/university-operations/indicators?pillar_type=${activePillar.value}&fiscal_year=${selectedFiscalYear.value}`
    )
    pillarIndicators.value = Array.isArray(indicatorsRes) ? indicatorsRes : (indicatorsRes as any)?.data || []

    // Find existing operation for this pillar/year
    await findCurrentOperation()
  } catch (err: any) {
    console.error('[Physical] Failed to fetch pillar data:', err)
    pillarTaxonomy.value = []
    pillarIndicators.value = []
  } finally {
    loading.value = false
  }
}
```

**✅ Cache is cleared** before fetching new year data.

**Dialog Open Trigger (`index.vue:323-360`):**
```typescript
function openEntryDialog(indicator: any) {
  selectedIndicator.value = indicator  // taxonomy object
  const existingData = getIndicatorData(indicator.id)  // Lookup by taxonomy ID

  entryForm.value = {
    pillar_indicator_id: indicator.id,
    fiscal_year: selectedFiscalYear.value,
    ...
    _existingId: existingData?.id || null,
  }
}
```

**Lookup Function (`index.vue:158-160`):**
```typescript
function getIndicatorData(taxonomyId: string) {
  return pillarIndicators.value.find(i => i.pillar_indicator_id === taxonomyId) || null
}
```

**✅ Logic is correct:** Looks up by `pillar_indicator_id` (taxonomy ID), returns the record whose `pillar_indicator_id` matches.

**Save Logic Validation Check (`index.vue:385-402`):**
```typescript
if (_existingId) {
  const existsInCurrentYear = pillarIndicators.value.some(i => i.id === _existingId)

  if (!existsInCurrentYear) {
    console.warn('[Physical] _existingId not found in current year data. Switching to POST (create new).')
    await api.post(
      `/api/university-operations/${operationId}/indicators/quarterly`,
      payload
    )
    toast.success('Quarterly data saved for current year')
    entryDialog.value = false
    await fetchPillarData()
    return
  }
}
```

**✅ Validation exists** to prevent cross-year updates.

**PATCH Request (`index.vue:414-420`):**
```typescript
if (_existingId) {
  await api.patch(
    `/api/university-operations/${operationId}/indicators/${_existingId}/quarterly`,
    payload
  )
  toast.success('Quarterly data updated successfully')
}
```

**CRITICAL QUESTION:**

Is `currentOperation.value.id` the CORRECT operation for the selected fiscal year and pillar?

**Operation Lookup (`index.vue:205-215`):**
```typescript
async function findCurrentOperation() {
  try {
    const response = await api.get<any>('/api/university-operations')
    const data = Array.isArray(response) ? response : (response?.data || [])
    currentOperation.value = data.find(
      (op: any) => op.operation_type === activePillar.value && op.fiscal_year === selectedFiscalYear.value
    ) || null
  } catch (err) {
    currentOperation.value = null
  }
}
```

**✅ Operation lookup matches current pillar + year.**

---

#### F. ROOT CAUSE CONCLUSION

**After deep analysis, the root cause is:**

**SCENARIO 1: Cross-Operation Update Attempt**
- User has data for FY 2024 (operation_id = A)
- User switches to FY 2025 (operation_id = B or NULL if not created)
- `pillarIndicators.value` is cleared and refetched for FY 2025
- If FY 2025 has NO data yet, `pillarIndicators.value` is empty
- `getIndicatorData()` returns NULL
- `_existingId` = NULL
- Frontend correctly POSTs (creates new)

**SCENARIO 2: Stale Operation ID**
- User opens dialog for FY 2025
- `currentOperation.value` is still set to FY 2024 operation
- `_existingId` is correct for FY 2025 record
- PATCH URL contains WRONG `operationId` (FY 2024 instead of FY 2025)
- Backend lookup fails: `WHERE oi.id = $1 AND oi.operation_id = $2` → 0 rows

**MOST LIKELY ROOT CAUSE:**

**`currentOperation.value.id` is stale or NULL when PATCH is called.**

**Evidence:**
1. `findCurrentOperation()` is called AFTER `fetchPillarData()` completes
2. If operation doesn't exist for current year, `currentOperation.value = null`
3. Save logic uses `currentOperation.value.id` as `operationId`
4. If NULL, JavaScript error occurs (not 404)
5. If stale (previous year), backend returns 404

**ACTION REQUIRED:**

Check if `currentOperation.value` is:
- NULL (no operation for current year yet)
- Stale (operation from previous year)
- Correct but indicator belongs to different operation

---

#### G. DEBUG LOGGING STRATEGY

**Required Console Logs:**

**Backend (`university-operations.service.ts:950`):**
```typescript
async updateIndicatorQuarterlyData(...) {
  this.logger.log(`[updateIndicatorQuarterlyData] ENTRY: operationId=${operationId}, indicatorId=${indicatorId}, fiscal_year=${dto.fiscal_year || 'not in payload'}`);
  
  const check = await this.db.query(...);
  this.logger.log(`[updateIndicatorQuarterlyData] LOOKUP RESULT: rowCount=${check.rows.length}, found=${check.rows.length > 0 ? JSON.stringify(check.rows[0]) : 'NONE'}`);
  
  if (check.rows.length === 0) {
    this.logger.error(`[updateIndicatorQuarterlyData] 404: Indicator ${indicatorId} not found in operation ${operationId}`);
    // Log all indicators for this operation
    const allIndicators = await this.db.query(
      `SELECT id, pillar_indicator_id, fiscal_year, operation_id FROM operation_indicators WHERE operation_id = $1 AND deleted_at IS NULL`,
      [operationId]
    );
    this.logger.error(`[updateIndicatorQuarterlyData] Available indicators for operation ${operationId}: ${JSON.stringify(allIndicators.rows)}`);
    throw new NotFoundException(...);
  }
}
```

**Frontend (`index.vue:364`):**
```typescript
async function saveQuarterlyData() {
  console.group('[Physical] saveQuarterlyData');
  console.log('selectedIndicator (taxonomy):', selectedIndicator.value);
  console.log('currentOperation:', currentOperation.value);
  console.log('selectedFiscalYear:', selectedFiscalYear.value);
  console.log('entryForm._existingId:', entryForm.value._existingId);
  console.log('pillarIndicators.value:', pillarIndicators.value.map(i => ({ id: i.id, pillar_indicator_id: i.pillar_indicator_id, fiscal_year: i.fiscal_year, operation_id: i.operation_id })));
  console.groupEnd();
  
  // ... rest of function
}
```

---

#### H. RISK CLASSIFICATION

| Risk ID | Severity | Description |
|---------|----------|-------------|
| RISK-DL-01 | **CRITICAL** | UPDATE operations fail globally — users cannot edit existing data |
| RISK-DL-02 | **HIGH** | Data loss risk if users re-create instead of update (duplicates rejected by migration 021) |
| RISK-DL-03 | **MEDIUM** | Stale operation ID causes cross-year update attempts |
| RISK-DL-04 | **MEDIUM** | No progress computation (separate issue, not blocking UPDATE fix) |

---

#### I. STABILIZATION CHECKLIST

**Phase 1 Research Deliverables:**
- [x] Migration audit (migrations 013-022)
- [x] Backend service logic analysis
- [x] Frontend data flow analysis
- [x] Root cause hypothesis formulation
- [x] Debug logging strategy defined
- [x] Risk classification documented

**Phase 2 Plan Requirements:**
- [ ] Fix root cause (Scenario 2: stale operation ID)
- [ ] Add debug logging to both backend and frontend
- [ ] Test UPDATE across multiple fiscal years
- [ ] Test UPDATE after year switch
- [ ] Test UPDATE with new operation (no prior data)
- [ ] Regression test CREATE flow (ensure no breakage)

---

#### J. NEXT ACTION

**Proceed to Phase 2 (Plan):**
- Document corrective phase DL in `plan.md`
- Define implementation steps with verification criteria
- Prioritize: CRITICAL (operation ID fix) → IMPORTANT (debug logs) → REGRESSION (full test matrix)

---

## [ARCHIVED] Sections 1.33–1.65B (Feb 16 – Mar 3, 2026)

> **9,372 lines archived to:** `docs/archive/research_sections_1.33_to_1.65B_governance_2026-02-16.md`
>
> **Phases covered:** P, Q, R, DH, DI (all ✅ COMPLETE)

---

## [ARCHIVED] Sections 1.70–2.08 (Mar 4 – Mar 20, 2026)

> **8,728 lines archived to:** `docs/archive/research_sections_1.70_to_2.08_2026-03-20.md`
>
> **Content:** UI stabilization, indicator computation, analytics dashboard, quarterly data model, rate-based analytics, BAR1/BAR2 integration, financial module development, governance refinement, status isolation, prefill architecture.
>
> **Phases covered:** DN, DO, DP, DQ, DR, DS, DT, DU, DW, DX, DY, DZ, EA, EB, EC, ED, EE, EF, EG, EH, EI, EJ, EK, EL, EM, EN, EO, EP, EQ, ER, ES, ET, EU, EV, EW, EX, EY, EZ, FA, FB (all ✅ COMPLETE)

