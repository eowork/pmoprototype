# Phase 1 Research: Repairs Module Failures

**Date:** 2026-02-04 (Updated)
**Phase:** 1 (Research)
**Status:** ✅ COMPLETE - 3 CRITICAL BLOCKERS IDENTIFIED
**Context:** COI module works correctly; Repairs module has data display and validation failures
**Authority:** ACE_BOOTSTRAP v2.4 (Governed Execution)

---

## Executive Summary

**COI Status:** STABLE (working correctly after recent fixes)
**Repairs Status:** BROKEN (multiple blockers identified)
**Root Cause:** DTO/Field naming mismatches between frontend, backend DTO, and database

---

## Part A: Data Display Failures

### Issue: Fields Not Displaying Despite Database Data

**Affected Fields:**
- repair_code (shows empty)
- repair_type (dropdown empty)
- assigned_technician (shows empty)
- estimated budget (shows empty)
- actual_cost (shows empty)

### Root Cause: Field Naming Mismatch

**Database Column vs Interface vs Adapter:**

| Database Column | Backend DTO | Frontend Interface | Adapter Reads |
|-----------------|-------------|-------------------|---------------|
| `project_code` | `project_code` | `repair_code` | `backend.repair_code` |
| `budget` | `budget` | `estimated_cost` | `backend.estimated_cost` |
| `assigned_technician` | `assigned_technician` | `assigned_to` | `backend.assigned_to` |

**Why This Causes Empty Fields:**

1. Backend SELECT returns `rp.*` which includes `project_code` column
2. Frontend adapter reads `backend.repair_code` (undefined - column doesn't exist)
3. Result: `project_code: undefined || '' = ''` (empty string)
4. Same pattern for other mismatched fields

**BackendRepairProject Interface (INCORRECT):**
```
repair_code: string        // ❌ Should be: project_code
estimated_cost?: number    // ❌ Should be: budget
assigned_to?: string       // ❌ Should be: assigned_technician
```

---

## Part B: Validation Errors

### Error 1: "property actual_cost should not exist"

**Cause:**
- Frontend form includes `actual_cost` field
- Frontend submits `actual_cost` in PATCH request payload
- Backend CreateRepairProjectDto does NOT define `actual_cost`
- UpdateRepairProjectDto extends CreateRepairProjectDto (inherits all fields)
- class-validator rejects unknown properties

**Evidence:**
- CreateRepairProjectDto has `budget?: number` (line 96)
- CreateRepairProjectDto does NOT have `actual_cost`
- Frontend repairs-edit-[id].vue sends `actual_cost` (line 160)

**Fix Required:** Add `actual_cost` field to CreateRepairProjectDto

### Error 2: "project_code should not be empty"

**Cause:**
- Adapter reads: `project_code: backend.repair_code || ''`
- Backend returns: `project_code` (not `repair_code`)
- Adapter gets `undefined` for `repair_code`, defaults to empty string
- Frontend submits empty `project_code`
- Backend DTO requires non-empty `project_code`

**Fix Required:** Correct adapter to read `backend.project_code`

---

## Part C: Why COI Works But Repairs Fails

### COI (Working)

| Aspect | Status |
|--------|--------|
| Interface field names | Match database columns |
| DTO field names | Match database columns |
| Adapter field mappings | Correct |
| All required fields in DTO | Present |

### Repairs (Broken)

| Aspect | Status |
|--------|--------|
| Interface field names | MISMATCH (repair_code vs project_code) |
| DTO field names | Correct |
| Adapter field mappings | INCORRECT (reads wrong field names) |
| Required fields in DTO | MISSING (actual_cost) |

**Key Difference:**
COI interfaces and adapters were updated to match backend reality.
Repairs interfaces and adapters still use incorrect field names.

---

## Part D: FK Handling Comparison

### COI FK Fields

| Frontend Field | Backend Returns | Adapter Reads |
|----------------|-----------------|---------------|
| `funding_source_id` | `funding_source_id` | `p.funding_source_id` |
| `contractor_id` | `contractor_id` | `p.contractor_id` |

### Repairs FK Fields

| Frontend Field | Backend Returns | Adapter Reads |
|----------------|-----------------|---------------|
| `repair_type_id` | `repair_type_id` | `backend.repair_type_id` |
| `contractor_id` | `contractor_id` | Not mapped in form |
| `funding_source_id` | Not in repairs table | N/A |

**Observation:** Repairs module doesn't have funding_source or contractor in the form UI, but the DTO accepts `contractor_id`. This is not a blocker, just a feature gap.

---

## Part E: Complete Field Mapping Analysis

### Frontend Form Fields vs Backend

| Frontend Field | Backend DTO Field | Backend DB Column | Match? |
|----------------|-------------------|-------------------|--------|
| `project_code` | `project_code` | `project_code` | ✅ |
| `title` | `title` | `title` | ✅ |
| `description` | `description` | `description` | ✅ |
| `building_name` | `building_name` | `building_name` | ✅ |
| `repair_type_id` | `repair_type_id` | `repair_type_id` | ✅ |
| `urgency_level` | `urgency_level` | `urgency_level` | ✅ |
| `campus` | `campus` | `campus` | ✅ |
| `status` | `status` | `status` | ✅ |
| `budget` | `budget` | `budget` | ✅ |
| `actual_cost` | ❌ NOT IN DTO | ❌ Unknown | ❌ |
| `assigned_technician` | `assigned_technician` | `assigned_technician` | ✅ |

### Adapter Field Mappings (ERRORS)

| Adapter Line | Reads | Should Read |
|--------------|-------|-------------|
| `project_code: backend.repair_code` | `repair_code` | `project_code` |
| `budget: backend.estimated_cost` | `estimated_cost` | `budget` |
| `assigned_technician: backend.assigned_to` | `assigned_to` | `assigned_technician` |

---

## Summary: Blockers Identified

### BLOCKER #1: Adapter Field Name Mismatches
- **Severity:** CRITICAL
- **Impact:** Data not displaying in edit forms
- **Location:** `utils/adapters.ts` - BackendRepairProject interface and adaptRepairDetail function

### BLOCKER #2: Missing `actual_cost` in DTO
- **Severity:** CRITICAL
- **Impact:** Validation error on save ("property actual_cost should not exist")
- **Location:** `repair-projects/dto/create-repair-project.dto.ts`

### BLOCKER #3: Interface Type Definitions Wrong
- **Severity:** MEDIUM
- **Impact:** TypeScript may not catch runtime errors
- **Location:** `utils/adapters.ts` - BackendRepairProject interface

---

## Non-Goals (Locked)

- ❌ Do NOT modify COI (working correctly)
- ❌ Do NOT change routing (stable)
- ❌ Do NOT change database schema
- ❌ Do NOT refactor backend query structure

---

## Recommended Fixes (Phase 2 Plan)

1. **Fix Adapter Field Names** (Frontend only)
   - Update BackendRepairProject interface to use correct field names
   - Update adaptRepairDetail function to read correct fields

2. **Add actual_cost to DTO** (Backend)
   - Add `@IsOptional() @IsNumber() actual_cost?: number` to CreateRepairProjectDto
   - No change needed to UpdateRepairProjectDto (inherits via PartialType)

3. **Verify Database Schema**
   - Confirm `actual_cost` column exists in repair_projects table
   - If not, add migration or remove from frontend

---

**Research Complete:** 2026-02-03
**Phase 1 Status:** COMPLETE
**Blockers:** 3 identified
**Ready for:** Phase 2 Planning
