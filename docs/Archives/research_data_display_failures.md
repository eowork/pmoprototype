# Phase 1 Research: Data Display Failures & Type Mismatches

**Date:** 2026-02-03 (07:47)  
**Phase:** 1 (Research - No Implementation)  
**Status:** 🔴 CRITICAL BLOCKERS IDENTIFIED  
**Authority:** User-reported persistent data display failures

---

## Executive Summary

### Critical Findings

**Status:** 🔴 **MULTIPLE BLOCKERS FOUND**

**User Report CONFIRMED:** Data exists in database but **does NOT display** in frontend form fields despite recent refinements.

**Root Causes Identified:**

1. **Type Mismatch (Campus Field):** Backend returns `campus` as string enum ('MAIN'), frontend tries to handle it as object (`campus?.name`)
2. **Backend JOIN Missing:** `construction_projects.findOne()` does NOT JOIN with contractors/funding_sources to return nested objects
3. **Backend Returns Flat Names:** Query returns `contractor_name`, `funding_source_name` as strings, NOT nested objects like `{ id, name }`
4. **Adapter Expectation Mismatch:** Frontend expects `p.fund_source?.id` but backend returns `p.funding_source_id` (flat)

---

## Part A: Data Display Failures (ROOT CAUSES)

### Issue 1: COI Edit Form — Funding Source & Contractor Not Displaying

**User Report:**
> "COI page: funding source, contractor data exists but select fields remain blank"

**Root Cause:**  
**Backend does NOT return nested objects for contractors/funding sources**

#### Backend Query Analysis

**File:** `pmo-backend/src/construction-projects/construction-projects.service.ts:84-95`

**Current Query:**
```sql
SELECT cp.*,
       p.title as project_title, p.project_type,
       c.name as contractor_name,              -- ❌ Returns STRING, not object
       fs.name as funding_source_name          -- ❌ Returns STRING, not object
FROM construction_projects cp
LEFT JOIN projects p ON cp.project_id = p.id
LEFT JOIN contractors c ON cp.contractor_id = c.id
LEFT JOIN funding_sources fs ON cp.funding_source_id = fs.id
WHERE cp.id = $1 AND cp.deleted_at IS NULL
```

**What Backend Actually Returns:**
```json
{
  "id": "uuid",
  "contractor_id": "contractor-uuid",
  "contractor_name": "ABC Construction",        // ❌ Flat string
  "funding_source_id": "funding-uuid",
  "funding_source_name": "National Budget",     // ❌ Flat string
  "campus": "MAIN"                               // ✅ Enum string (correct)
}
```

**What Frontend EXPECTS (Line 111-112 in coi-edit-[id].vue):**
```typescript
funding_source_id: p.fund_source?.id || '',  // ❌ Expects nested object
contractor_id: p.contractor?.id || '',        // ❌ Expects nested object
```

**Why This Fails:**
- Frontend code: `p.fund_source?.id` → `undefined` (because backend returns `p.funding_source_id` directly)
- Frontend sets: `form.funding_source_id = ''` (empty string)
- v-select with empty string → No selection visible

**Verdict:**  
✅ **CONFIRMED BLOCKER** — Backend query shape does NOT match frontend expectations

---

### Issue 2: COI Edit Form — Campus Field Type Mismatch

**User Report:**
> "TypeScript error: Type 'string | { name: string; }' is not assignable to type 'string'"

**Root Cause:**  
**Frontend code attempts to handle campus as both string AND object**

#### Code Analysis

**File:** `pmo-frontend/pages/coi-edit-[id].vue:109`

**Problem Line:**
```typescript
campus: p.campus?.name || p.campus || '',
//      ^^^^^^^^^^^^ Treats campus as object with .name property
//                   ^^^^^^^^ Fallback: treats campus as string
```

**What This Means:**
- TypeScript sees: `campus` could be `{ name: string }` OR `string`
- Form field type: `campus: string` (line 30)
- Mismatch: Trying to assign mixed type to strict string type

**What Backend Actually Returns:**
- `campus: 'MAIN'` (ENUM string, NOT an object)

**Why Code Was Written This Way:**
- Developer assumed campus might be returned as nested object (like `{ name: 'MAIN' }`)
- But database stores campus as ENUM directly
- Backend returns it as plain string

**Correct Code Should Be:**
```typescript
campus: p.campus || '',  // Campus is already a string enum
```

**Verdict:**  
✅ **CONFIRMED BLOCKER** — Type assumption incorrect, causes TypeScript error and potential runtime issues

---

### Issue 3: Repairs Edit Form — Data Not Displaying

**User Report:**
> "Repairs page: repair_code, repair_type, assigned technician, estimated budget, actual cost not displaying"

**Analysis:**

#### What Adapter Expects

**File:** `pmo-frontend/utils/adapters.ts:448`

```typescript
export function adaptRepairDetail(backend: BackendRepairProjectDetail): UIRepairDetail {
  return {
    repair_type_id: backend.repair_type?.id || '',  // Expects nested object
    budget: backend.estimated_cost || null,
    actual_cost: backend.actual_cost || null,
    assigned_technician: backend.assigned_to || '',
  }
}
```

#### What Backend Returns

**File:** `pmo-backend/src/repair-projects/repair-projects.service.ts:108-120`

```sql
SELECT rp.*,
       p.title as project_title,
       rt.name as repair_type_name,           -- ❌ Returns STRING
       c.name as contractor_name,             -- ❌ Returns STRING
       f.building_name as facility_name       -- ❌ Returns STRING
FROM repair_projects rp
LEFT JOIN projects p ON rp.project_id = p.id
LEFT JOIN repair_types rt ON rp.repair_type_id = rt.id
LEFT JOIN contractors c ON rp.contractor_id = c.id
LEFT JOIN facilities f ON rp.facility_id = f.id
WHERE rp.id = $1 AND rp.deleted_at IS NULL
```

**Backend Returns:**
```json
{
  "id": "uuid",
  "repair_type_id": "type-uuid",
  "repair_type_name": "Electrical",  // ❌ Flat string, not { id, name }
  "estimated_cost": 50000,            // ✅ Correct
  "actual_cost": 48000,               // ✅ Correct
  "assigned_to": "John Doe"           // ✅ Correct (but field name mismatch)
}
```

**What Adapter Receives:**
```typescript
backend.repair_type?.id  
// backend.repair_type is undefined (only repair_type_name exists)
// Results in: repair_type_id = ''
```

**Verdict:**  
✅ **CONFIRMED BLOCKER** — Backend does NOT return nested `repair_type` object, only flat `repair_type_name`

**Why repair_type_id Might Still Work Sometimes:**
- Backend ALSO returns `rp.*` which includes `rp.repair_type_id`
- So `backend.repair_type_id` exists as flat field
- But adapter tries to access `backend.repair_type?.id` (nested) which doesn't exist

---

## Part B: FK & Lookup Data — How It SHOULD vs HOW IT IS

### How FK Data SHOULD Work

```
┌─────────────────────────────────────────────────────────────┐
│ IDEAL FLOW (What Frontend Expects)                          │
├─────────────────────────────────────────────────────────────┤
│ 1. Backend Query JOINs related tables                       │
│ 2. Backend returns NESTED OBJECTS:                          │
│    {                                                         │
│      contractor_id: "uuid",                                  │
│      contractor: { id: "uuid", name: "ABC" }  ← Object      │
│    }                                                         │
│ 3. Frontend extracts ID: contractor_id = obj.contractor?.id │
│ 4. v-select binds to extracted ID                           │
│ 5. Dropdown displays correctly                              │
└─────────────────────────────────────────────────────────────┘
```

### How FK Data CURRENTLY WORKS (BROKEN)

```
┌─────────────────────────────────────────────────────────────┐
│ ACTUAL FLOW (Current Implementation)                        │
├─────────────────────────────────────────────────────────────┤
│ 1. Backend Query JOINs related tables                       │
│ 2. Backend returns FLAT FIELDS:                             │
│    {                                                         │
│      contractor_id: "uuid",        ← Already has ID         │
│      contractor_name: "ABC"        ← Flat string, NOT object│
│    }                                                         │
│ 3. Frontend tries: obj.contractor?.id → undefined ❌        │
│ 4. Frontend sets: contractor_id = '' (empty)                │
│ 5. v-select with '' → No visible selection ❌               │
└─────────────────────────────────────────────────────────────┘
```

### Why FK Data "Exists But Doesn't Show"

**Simple Explanation:**

1. **Database has the data** ✅ (UUIDs stored in FK columns)
2. **Backend JOINs correctly** ✅ (SQL query includes LEFT JOIN)
3. **Backend returns WRONG SHAPE** ❌ (flat strings instead of nested objects)
4. **Frontend expects nested objects** ✅ (code written for `obj.field?.id` pattern)
5. **Mismatch causes fields to be empty** ❌ (undefined → '' → blank display)

**Technical Explanation:**

The backend query uses PostgreSQL's default behavior:
- `SELECT cp.*, c.name as contractor_name` returns flat result
- Each column becomes a property: `{ contractor_id: '...', contractor_name: '...' }`
- This is NOT the same as: `{ contractor: { id: '...', name: '...' } }`

The frontend code was written expecting ORM-style nested objects:
- ORMs like TypeORM, Prisma automatically nest joined tables
- Raw SQL requires manual object construction

**Result:** Shape mismatch between what's sent and what's expected

---

## Part C: TypeScript Error Analysis

### Error Message

```
Type 'string | { name: string; }' is not assignable to type 'string'.
Property 'id' does not exist on type '{ name: string; }'.
```

**File:** `pmo-frontend/pages/coi-edit-[id].vue:109`

### What This Implies

1. **Mixed Response Shape Assumption**
   - Developer thought backend might return campus as object OR string
   - Code: `p.campus?.name || p.campus`
   - TypeScript infers: campus is `string | { name: string }`

2. **Inconsistent Typing**
   - Form model: `campus: string` (line 30)
   - Assignment: tries to use both `.name` and direct value
   - TypeScript catches the contradiction

3. **Why This Causes Rendering Failure**
   - If backend returns `campus: 'MAIN'`
   - Code tries: `p.campus?.name` → `undefined`
   - Fallback: `p.campus` → `'MAIN'` ✅
   - Works at runtime BUT type system is violated
   - May cause issues with strict type checking

4. **Root of Confusion**
   - Some fields (campus) are stored as ENUM strings
   - Other fields (contractor, funding_source) were expected as nested objects
   - Inconsistent handling across the codebase

### Verdict

✅ **Type error is symptom of deeper issue:** Backend response shape not documented/understood

---

## Part D: Frontend File Structure Risk Review

### Current State

```
pmo-frontend/pages/
  ├── coi.vue                    (Flat)
  ├── coi-new.vue                (Flat)
  ├── coi-detail-[id].vue        (Flat)
  ├── coi-edit-[id].vue          (Flat)
  ├── coi/                       (Old nested — NOT DELETED ❌)
  │   ├── new.vue                (Old file, unused)
  │   ├── [id].vue               (Old file, unused)
  │   └── [id]/edit.vue          (Old file, unused)
  ├── repairs.vue                (Flat)
  ├── repairs-new.vue            (Flat)
  ├── repairs-detail-[id].vue    (Flat)
  ├── repairs-edit-[id].vue      (Flat)
  ├── repairs/                   (Old nested — NOT DELETED ❌)
  │   └── ...                    (Old files, unused)
  ├── university-operations.vue
  └── ...
```

### Issues Identified

1. **Old Nested Files Still Present**
   - After route flattening, old nested directories were NOT deleted
   - Risk of confusion: Which files are active?
   - Risk of accidental editing of wrong file

2. **No Admin/Staff Separation**
   - All pages mixed together
   - Not a blocker for current phase (YAGNI applies)
   - Defer until 10+ modules exist

### Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| **Old files confuse developers** | 🟡 MEDIUM | Delete old nested directories |
| **Accidental edit of wrong file** | 🟡 MEDIUM | Delete old nested directories |
| **Routing regression** | 🟢 LOW | Flat routes stable, just cleanup needed |
| **Admin/Staff separation needed** | 🟢 LOW | Defer (YAGNI) |

### Recommendation

**SAFE CLEANUP (Low Risk):**
- ✅ Delete old nested directories: `coi/`, `repairs/`, `university-operations/` subdirectories
- ✅ Verify flat routes still work after deletion
- ✅ Low risk because flat routes don't reference nested files

**DEFER (Not Needed Now):**
- ❌ Reorganize by user role (admin vs staff vs user)
- ❌ Create new directory structure
- ❌ Move working flat files

### Verdict

✅ **Cleanup old files: SAFE and RECOMMENDED**  
❌ **Reorganize structure: HIGH RISK, defer indefinitely**

---

## Part E: Prior Knowledge Constraints (LOCKED)

### What Must NOT Be Revisited

✅ **Route flattening is CORRECT** — Do not regress to nested routes  
✅ **CRUD routing works** — Do not reopen route configuration  
✅ **Authentication/authorization works** — Do not touch middleware  
✅ **Backend endpoints are correct** — Do not change API routes  

### What WAS Solved Previously

1. ✅ Nested routing incompatibility (fixed via route flattening)
2. ✅ Component mounting issues (fixed via flat routes)
3. ✅ Network request timing (CRUD operations now fire correctly)

### What IS NOT Solved (Current Blockers)

1. ❌ Backend response shape (returns flat fields, not nested objects)
2. ❌ Frontend expectations (expects nested objects for FK fields)
3. ❌ Type consistency (campus handled incorrectly)
4. ❌ Adapter assumptions (doesn't match backend reality)

---

## Part F: Plan Update Recommendation

### Current Blockers (CRITICAL)

**BLOCKER #1: Backend Response Shape Mismatch**
- **Severity:** 🔴 HIGH
- **Impact:** COI and Repairs edit forms show empty dropdowns despite data existing
- **Location:** `construction-projects.service.ts:findOne()`, `repair-projects.service.ts:findOne()`
- **Fix Required:** Backend must return nested objects OR frontend must adapt to flat shape

**BLOCKER #2: Campus Field Type Mismatch**
- **Severity:** 🟡 MEDIUM
- **Impact:** TypeScript error, potential runtime issues
- **Location:** `coi-edit-[id].vue:109`
- **Fix Required:** Remove `.name` accessor, use direct value

**BLOCKER #3: Adapter Mismatch**
- **Severity:** 🔴 HIGH
- **Impact:** Repairs edit form fields empty
- **Location:** `utils/adapters.ts:adaptRepairDetail()`
- **Fix Required:** Adapter must match actual backend response shape

### Recommended Corrective Actions (Phase 2 Planning)

**Option A: Fix Backend (Return Nested Objects)**
- Pros: Matches frontend expectations
- Cons: Requires backend refactoring, affects all endpoints
- Effort: ~2 hours
- Risk: MEDIUM (affects multiple modules)

**Option B: Fix Frontend (Adapt to Flat Shape)**
- Pros: No backend changes, faster
- Cons: Frontend already written for nested pattern
- Effort: ~30 minutes
- Risk: LOW (isolated to edit forms)

**RECOMMENDATION: Option B** (Fix frontend to match backend reality)

### Non-Goals (Explicitly Deferred)

❌ **Frontend directory reorganization** — Not needed, defer indefinitely  
❌ **User role-based page separation** — YAGNI, defer until 10+ modules  
❌ **Backend API restructuring** — Working correctly, don't touch  
❌ **ORM migration** — Out of scope, use raw SQL as-is  

---

## Summary for plan_active.md Update

### Status Log Update

```markdown
## 📊 Status Log

**Phase 1 Research:** ✅ COMPLETE (Data display failure analysis - Feb 3, 2026 07:47)  
**Phase 2 Planning:** 🔴 PENDING (Fix backend response shape mismatch)  
**Phase 3 Implementation:** ⏸️ BLOCKED (Awaits Phase 2 plan)

### Current Blockers

- [x] CRUD routing stabilized
- [x] Backend APIs operational
- [x] Database schema stable
- [x] Prior refinements complete
- [ ] **Backend response shape mismatch** 🔴 BLOCKER #1
- [ ] **Campus field type error** 🟡 BLOCKER #2
- [ ] **Adapter expectations mismatch** 🔴 BLOCKER #3

### Research Findings (Feb 3, 07:47)

**User Report CONFIRMED:**  
Data exists in database but does NOT display in edit forms.

**Root Causes:**
1. Backend returns FLAT fields (`contractor_name`) not NESTED objects (`contractor: { id, name }`)
2. Frontend expects nested objects: `p.fund_source?.id`
3. Mismatch results in empty form fields
4. TypeScript error in campus field (incorrect type handling)

**Recommended Fix:** Adapt frontend to match backend reality (30 min effort, low risk)

**See:** `docs/research_data_display_failures.md` for detailed analysis
```

---

**Research Complete:** 2026-02-03 07:47  
**Phase 1 Status:** ✅ COMPLETE  
**Blockers Identified:** 3 (HIGH severity)  
**Recommended Next:** Phase 2 plan to fix frontend adapter layer
