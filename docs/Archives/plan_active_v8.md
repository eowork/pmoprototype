# PMO Dashboard: Active Development Plan

**Version:** 8.0.REPAIRS-SCHEMA-FIX | **Updated:** 2026-02-04  
**Status:** 🔴 BLOCKED - Database Schema Missing actual_cost Column  
**Authority:** ACE_BOOTSTRAP v2.4 - Phase 1 Research Complete  

---

## 🚨 CURRENT STATUS (Read This First)

### Active Blocker

**BLOCKER:** Database schema missing `actual_cost` column  
**Impact:** Repairs UPDATE (PATCH) fails with HTTP 500  
**Root Cause:** DTO accepts `actual_cost` but database has no column  
**Severity:** CRITICAL  

### What's Happening Right Now

**Phase:** Stabilization & Integration Correctness  
**Current Task:** Awaiting schema migration execution  
**Blocked Since:** 2026-02-04  

**User Experience:**
- ✅ Can CREATE repairs (actual_cost silently ignored)
- ❌ CANNOT UPDATE repairs (500 error if actual_cost present)
- ✅ Can view repairs (read operations work)
- ✅ Can delete repairs (delete operations work)

### Research Complete

**Research Status:** ✅ COMPLETE  
**Document:** `docs/research_repairs_patch_error_feb2026.md`  

**Finding:** 
- DTO has `actual_cost` field
- Database does NOT have `actual_cost` column
- CREATE uses hardcoded INSERT (ignores extra fields)
- UPDATE uses dynamic SQL (includes ALL DTO fields → ERROR)

### Next Action Required

**Phase 2:** Plan schema migration  
**Phase 3:** Execute migration + update INSERT statement  
**Estimated Time:** 15 minutes  
**Risk:** LOW (standard ALTER TABLE)  

---

## 📊 Module Status Quick Reference

| Module | Status | Last Verified |
|--------|--------|---------------|
| COI (Construction) | ✅ STABLE | 2026-02-04 |
| Repairs (READ) | ✅ WORKING | 2026-02-04 |
| Repairs (CREATE) | ✅ WORKING* | 2026-02-04 |
| Repairs (UPDATE) | ❌ BLOCKED | 2026-02-04 |
| Repairs (DELETE) | ✅ WORKING | 2026-02-04 |
| Routing | ✅ STABLE | 2026-02-04 |
| Authentication | ✅ STABLE | 2026-02-04 |

*actual_cost silently ignored on CREATE

---

## 🎯 Active Phase: Stabilization & Integration Correctness

### Phase 2 Purpose

**Goal:** Ensure backend DTO contracts match database schema  
**Scope:** Repairs module actual_cost field  
**Non-Goal:** Feature additions, UI changes, refactoring  

### Governance

- ✅ **SOLID:** Single Responsibility - one migration, one column
- ✅ **DRY:** Follow existing migration pattern (002)
- ✅ **KISS:** Simple ALTER TABLE ADD COLUMN
- ✅ **YAGNI:** Only add actual_cost, nothing else
- ✅ **TDA:** Database schema drives service layer
- ✅ **MIS:** Minimal change, isolated to repairs

### What Will NOT Change

- ❌ COI module (working correctly)
- ❌ Frontend code (already correct)
- ❌ DTOs (already correct)
- ❌ Routing (stable)
- ❌ CRUD architecture (correct pattern)

### What WILL Change

- ✅ Database schema (add actual_cost column)
- ✅ Service INSERT statement (include actual_cost)
- ✅ Verification testing

---

## 📋 Execution Checklist (Phase 2 → Phase 3)

### Phase 2: Planning (PENDING)
- [ ] Define migration 003_add_actual_cost.sql
- [ ] Specify column type (DECIMAL(15,2))
- [ ] Define rollback script
- [ ] Update service INSERT statement plan

### Phase 3: Implementation (PENDING)
- [ ] Create migration file
- [ ] Run migration on database
- [ ] Update repair-projects.service.ts INSERT
- [ ] Test CREATE with actual_cost
- [ ] Test UPDATE with actual_cost
- [ ] Verify data persists

### Phase 4: Verification (PENDING)
- [ ] Navigate to /repairs
- [ ] Create new repair with actual_cost
- [ ] Verify CREATE succeeds
- [ ] Edit repair, modify actual_cost
- [ ] Verify UPDATE succeeds
- [ ] Verify data persists in DB

---

## 🚫 Noise vs Signal

### Ignore These (Non-Blocking)

**Vue Suspense Warning:**
```
[Vue warn]: Suspense slots expect a single root node
```
**Status:** Informational - Nuxt 3 behavior  
**Action:** Ignore

**Nuxt DevTools:**
```
Nuxt DevTools connected
```
**Status:** Development tooling  
**Action:** Ignore

**404 on Unimplemented Endpoints:**
```
GET /api/gad-reports 404
```
**Status:** Expected - Module not built yet  
**Action:** Ignore

### Focus On This (Signal)

**HTTP 500 on Repairs UPDATE:**
```
PATCH /api/repair-projects/:id 500
ERROR: column "actual_cost" does not exist
```
**Status:** BLOCKER  
**Action:** Schema migration required

---

## 📚 Historical Context (Archived)

### Phase 1-3 Complete (Feb 4, 2026)

**What Was Fixed:**
1. ✅ Adapter field name mismatches (repair_code → project_code, etc.)
2. ✅ Added actual_cost to DTO
3. ✅ Updated TypeScript interfaces

**What Remains:**
- ❌ Database schema still missing actual_cost column

**Lesson Learned:** DTO changes must be paired with schema verification.

### Previous Blockers (RESOLVED)

**Blocker #1:** Adapter field names wrong  
**Status:** ✅ FIXED (Feb 4)  
**Document:** `docs/research_repairs_module_failures.md`

**Blocker #2:** DTO missing actual_cost  
**Status:** ✅ FIXED (Feb 4)  
**File:** `create-repair-project.dto.ts`

**Blocker #3:** TypeScript interfaces wrong  
**Status:** ✅ FIXED (Feb 4)  
**File:** `adapters.ts`

### System Architecture (Stable)

**Backend:** 17 modules, 129 endpoints ✅ OPERATIONAL  
**Database:** Schema migrated (pending 003) ✅ MOSTLY OPERATIONAL  
**Frontend:** Components built ✅ OPERATIONAL  
**Routing:** Flat routes ✅ STABLE  

---

## 📖 Documentation Index

### Active Documents

**Current Research:**
- `docs/research_repairs_patch_error_feb2026.md` (Phase 1 complete)

**Active Plan:**
- This file (plan_active.md)

### Historical Documents

**Previous Research:**
- `docs/research_repairs_module_failures.md` (Field name issues)
- `docs/research_summary_repairs_feb2026.md` (Beginner summary)

**Archived Plans:**
- Phase 1-3 artifacts moved to historical section (above)

---

## 🎯 Definition of Done (This Phase)

**Phase 2 Complete When:**
- [ ] Migration script defined
- [ ] Rollback script defined
- [ ] Service INSERT update planned
- [ ] Verification steps documented

**Phase 3 Complete When:**
- [ ] Migration executed successfully
- [ ] Column exists in database
- [ ] INSERT statement includes actual_cost
- [ ] CREATE operations save actual_cost
- [ ] UPDATE operations modify actual_cost
- [ ] No HTTP 500 errors
- [ ] Data persists correctly

**User Experience Fixed When:**
- [ ] User can enter actual_cost in create form
- [ ] User can edit actual_cost in update form
- [ ] Changes save without error
- [ ] Values display correctly after save

---

**END OF ACTIVE PLAN**

---

# ARCHIVE: Historical Implementation Details

*Previous phase details moved below for reference*

<rest of historical content follows...>
