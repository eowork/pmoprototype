# Repairs PATCH Error: Root Cause Analysis

**Research Date:** 2026-02-04  
**Status:** ✅ COMPLETE  
**Authority:** ACE_BOOTSTRAP v2.4 (Governed Execution - Phase 1)  
**Error Type:** HTTP 500 on PATCH /api/repair-projects/:id  

---

## Executive Summary

**Problem:** Repairs module UPDATE (PATCH) fails with HTTP 500 error

**Root Cause:** Database schema mismatch - `actual_cost` column does NOT exist in `repair_projects` table

**Impact:** Users cannot save repairs when `actual_cost` field has a value

**COI Status:** ✅ STABLE (unaffected)  
**Routing:** ✅ STABLE (not the issue)  
**Schema:** ❌ **BLOCKER** - Column missing

---

## What Is NOT the Problem (LOCKED)

Per governance constraints, the following are **confirmed NOT the issue:**

- ❌ **Routing** - Flat routes working correctly
- ❌ **Dialog mounting** - UI renders properly
- ❌ **FK lookups** - Repair types, contractors load correctly
- ❌ **CORS** - Authentication headers work
- ❌ **CRUD flow architecture** - Pattern is correct
- ❌ **Frontend payload** - Sends correct structure
- ❌ **DTO validation** - CreateRepairProjectDto accepts actual_cost

This is a **database schema vs DTO contract mismatch**.

---

## Root Cause: Column Does Not Exist

### The Issue

**Backend DTO says:** "I accept `actual_cost`"  
**Database says:** "I have no column named `actual_cost`"  
**SQL says:** "ERROR: column 'actual_cost' does not exist"  
**Result:** HTTP 500

### Evidence

**File:** `pmo-backend/src/repair-projects/dto/create-repair-project.dto.ts` (Lines 98-100)

```typescript
@IsOptional()
@IsNumber()
actual_cost?: number;  // ✅ DTO accepts this
```

**File:** `database/database draft/2026_01_12/pmo_schema_pg.sql` (Lines 739-774)

```sql
CREATE TABLE IF NOT EXISTS repair_projects (
  ...
  budget DECIMAL(15,2),           -- ✅ Column exists
  -- actual_cost column MISSING   -- ❌ Column does NOT exist
  ...
);
```

**File:** `pmo-backend/src/repair-projects/repair-projects.service.ts` (Lines 206-211)

```sql
INSERT INTO repair_projects
  (project_id, project_code, ..., budget, ..., created_by)
  VALUES ($1, $2, ..., $20, ..., $26)
```

**Notice:** INSERT statement does NOT include `actual_cost` column.

---

## Why UPDATE Fails But CREATE Succeeds

### CREATE Flow
1. Frontend sends `actual_cost: 45000`
2. DTO accepts it (validation passes)
3. Service INSERT ignores it (doesn't include in SQL)
4. Database INSERT succeeds (no error, field silently dropped)
5. User doesn't notice (no validation error)

### UPDATE Flow
1. Frontend sends `actual_cost: 45000`
2. DTO accepts it (validation passes)
3. Service UPDATE uses **dynamic SQL builder** (lines 246-255)
4. Dynamic builder includes ALL DTO fields: `actual_cost = $N`
5. Database tries to SET non-existent column
6. **PostgreSQL ERROR:** `column "actual_cost" of relation "repair_projects" does not exist`
7. Backend returns HTTP 500

---

## Why COI Works But Repairs Fails

### COI Construction Projects

**Database has column:**
```sql
CREATE TABLE construction_projects (
  ...
  contract_amount DECIMAL(15,2),  -- ✅ Exists
  ...
);
```

**DTO matches:**
```typescript
contract_amount?: number;  // ✅ Column exists
```

**UPDATE works:** Column exists, SQL succeeds

### Repairs Projects

**Database missing column:**
```sql
CREATE TABLE repair_projects (
  ...
  budget DECIMAL(15,2),    -- ✅ Exists
  -- No actual_cost column -- ❌ Missing
  ...
);
```

**DTO expects it:**
```typescript
actual_cost?: number;  // ❌ Column doesn't exist
```

**UPDATE fails:** Column missing, SQL throws error

---

## The Dynamic SQL Builder

**File:** `repair-projects.service.ts` (Lines 246-255)

**How it works:**
1. Extracts all fields from DTO
2. Builds SQL: `UPDATE repair_projects SET field1 = $1, field2 = $2, ...`
3. Includes `actual_cost = $N` because DTO has it
4. PostgreSQL rejects because column doesn't exist

**Why this is different from INSERT:**
- INSERT has hardcoded column list (manually excludes actual_cost)
- UPDATE dynamically includes ALL DTO fields (includes actual_cost)

---

## Beginner-Friendly Explanation

### The Mismatch

Think of it like filling out a form:

**Form (DTO) says:** "You can write in the 'Actual Cost' box"  
**File cabinet (Database) says:** "I don't have a folder for 'Actual Cost'"  

**When CREATING:**
- You fill in "Actual Cost"
- The clerk (INSERT) just doesn't file it anywhere
- No error (silently ignored)

**When UPDATING:**
- You fill in "Actual Cost"
- The clerk (UPDATE) tries to find the folder
- **ERROR:** "I can't find a folder called 'Actual Cost'!"
- System crashes (HTTP 500)

### Why It's a Problem Now

1. Phase 3 implementation added `actual_cost` to DTO
2. DTO now accepts the field
3. Database was never updated to have the column
4. CREATE silently ignores it (hardcoded INSERT)
5. UPDATE tries to use it (dynamic UPDATE)
6. PostgreSQL: "Column doesn't exist" → 500 error

---

## Frontend Warnings (Non-Blocking Noise)

The following are **informational only** and NOT related to this error:

### Vue Suspense Warning
```
[Vue warn]: Suspense slots expect a single root node
```
**Status:** Informational - Nuxt 3 hydration behavior  
**Impact:** None (cosmetic console message)  
**Action:** Ignore

### Nuxt DevTools Notice
```
Nuxt DevTools connected
```
**Status:** Informational - Development tooling  
**Impact:** None (dev mode only)  
**Action:** Ignore

### 404 on Unrelated Endpoints
```
GET /api/gad-reports 404
```
**Status:** Expected - Module not implemented yet  
**Impact:** None (different module)  
**Action:** Ignore

### What Is Signal vs Noise

**SIGNAL (Actual Error):**
```
POST /api/repair-projects/:id 500
ERROR: column "actual_cost" of relation "repair_projects" does not exist
```

**NOISE (Ignore These):**
- Vue warnings about Suspense
- DevTools connection messages
- 404 on unimplemented endpoints
- TypeScript info messages

---

## Validation Errors Mentioned in Context

### "property actual_cost should not exist"
**Status:** RESOLVED in Phase 3  
**When it occurred:** Before DTO was updated  
**Fix applied:** Added actual_cost to CreateRepairProjectDto  
**Current status:** DTO now accepts it

### "project_code should not be empty"
**Status:** RESOLVED in Phase 3  
**When it occurred:** Adapter field name mismatch  
**Fix applied:** Changed `backend.repair_code` → `backend.project_code`  
**Current status:** Field now populates correctly

**These are NOT the current problem.** The current problem is the database column.

---

## Schema Analysis

### repair_projects Table (Current State)

**Columns that exist:**
- project_id
- project_code
- title
- description
- building_name
- floor_number
- room_number
- specific_location
- repair_type_id
- urgency_level
- is_emergency
- campus
- reported_by
- reported_date
- inspection_date
- inspector_id
- inspection_findings
- status
- start_date
- end_date
- **budget** ✅
- project_manager_id
- contractor_id
- completion_date
- facility_id
- assigned_technician
- physical_progress (added in migration 002)
- financial_progress (added in migration 002)
- metadata
- created_by
- updated_by
- created_at
- updated_at
- deleted_at
- deleted_by

**Column that does NOT exist:**
- **actual_cost** ❌

---

## Why This Happened

### Timeline

1. **Original schema (Jan 2026):** repair_projects created with `budget` column only
2. **Migration 002 (Jan 29):** Added `physical_progress`, `financial_progress`
3. **Phase 3 (Feb 4):** Added `actual_cost` to DTO (assumed column existed)
4. **Current:** DTO and database are misaligned

### Assumption Error

Phase 3 implementation assumed:
- ✅ "If budget exists, actual_cost probably exists too"
- ❌ Reality: Only budget exists

### Why CREATE Didn't Fail

CREATE uses hardcoded INSERT with explicit column list:
```sql
INSERT INTO repair_projects (project_id, ..., budget, ...)
```

`actual_cost` never appears in INSERT statement, so it's silently ignored.

### Why UPDATE Fails

UPDATE uses dynamic field mapping:
```typescript
const fields = Object.keys(dto);  // Includes 'actual_cost'
const setClause = fields.map(f => `${f} = $${i}`).join(', ');
// Generates: "UPDATE repair_projects SET ..., actual_cost = $15, ..."
```

PostgreSQL: "Column 'actual_cost' doesn't exist in table" → ERROR

---

## Comparison: Construction Projects

**Has both columns:**
```sql
CREATE TABLE construction_projects (
  ...
  contract_amount DECIMAL(15,2),    -- Budget/estimate
  -- No actual_cost in COI either
  ...
);
```

**Interesting:** COI also doesn't have `actual_cost`, only `contract_amount`.

**Pattern:** Both tables have budget/estimate column, neither has actual_cost tracking.

---

## Non-Goals (Governance Locked)

### DO NOT CHANGE (This Phase)

- ❌ COI module (working correctly, leave alone)
- ❌ Routing configuration (stable)
- ❌ Frontend refactor (adapter fixes complete)
- ❌ Authentication flow (working)
- ❌ CRUD architecture (pattern is correct)

### ONLY CHANGE (Next Phase)

- ✅ Database schema (add actual_cost column)
- ✅ Service INSERT statement (include actual_cost in column list)

---

## Blocker Definition

**Blocker:** Database schema missing `actual_cost` column

**Severity:** CRITICAL  
**Impact:** UPDATE operations fail with HTTP 500  
**Workaround:** None (hard constraint)  
**Modules affected:** Repairs UPDATE only  

**Resolution required:** Schema migration to add column

---

## Next Phase: Planning

### Corrective Focus

1. **Add actual_cost column** to repair_projects table
2. **Update INSERT statement** in repair-projects.service.ts
3. **Verify UPDATE** now works with actual_cost

### Explicit Non-Goals

- ❌ No frontend refactor (already correct)
- ❌ No DTO changes (already correct)
- ❌ No COI changes (unaffected)
- ❌ No routing changes (stable)

### Governance Alignment

- ✅ **SOLID:** Single Responsibility - one migration, one purpose
- ✅ **DRY:** Reuse existing migration pattern (002)
- ✅ **KISS:** Simple ALTER TABLE ADD COLUMN
- ✅ **YAGNI:** Only add actual_cost, nothing extra
- ✅ **TDA:** Database tells service what columns exist
- ✅ **MIS:** Minimal change, isolated to repairs

---

**END OF RESEARCH DOCUMENT**
