# Phase 1 Research: Nuxt Routing Regression Analysis

**Date:** 2026-02-09
**Status:** ✅ COMPLETE
**Authority:** Executive directive + Nuxt documentation
**Result:** ROLLBACK REQUIRED

---

## Executive Summary

File structure reorganization (commit 479ab4c) caused **routing regression** due to Nuxt's automatic parent-child route interpretation.

**Problem:** Folder structure creates nested routes without proper parent rendering components.

**Solution:** Rollback to flat sibling routes (Feb 3 state).

**Impact:** Week 1 Sprint realigned to rollback + testing instead of new features.

---

## A. NUXT FILE STRUCTURE & ROUTING BEHAVIOR

### How Nuxt Interprets Files

Nuxt uses **automatic file-based routing**:

1. Every `.vue` file in `pages/` becomes a route
2. Folder structure creates parent-child relationships
3. Parent routes MUST have `<NuxtPage />` to render children

### The Problem

**Current Structure (BROKEN):**
```
pages/
  coi.vue              ← Parent route (list page, NO <NuxtPage />)
  coi/
    new.vue            ← CHILD route (expects parent to render it)
    detail-[id].vue    ← CHILD route (cannot mount)
    edit-[id].vue      ← CHILD route (cannot mount)
```

**How Nuxt Interprets This:**
- `coi.vue` = Parent component
- `coi/new.vue` = Child component
- Nuxt generates route: `/coi/new` with `coi.vue` as wrapper
- **BUT** `coi.vue` has no `<NuxtPage />` → child cannot render

**Result:**
- Navigate to `/coi/new` → `coi.vue` loads → no child slot → blank page
- Form components never mount → no lifecycle hooks → no API calls → CRUD fails

### Why GAD Works

**GAD Structure (WORKING):**
```
pages/
  gad.vue              ← Dashboard/navigation page
  gad/
    student.vue        ← Complete standalone page (list + dialog)
    faculty.vue        ← Complete standalone page (list + dialog)
```

**Key Difference:**
- `gad.vue` is a **navigation dashboard**, not a list page
- Each `gad/*.vue` is a **complete CRUD page** (list + forms + dialogs)
- They're semantically child pages (navigation hierarchy), but technically standalone

### Previous Working Structure

**Flat Sibling Routes (STABLE):**
```
pages/
  coi.vue                  → /coi
  coi-new.vue              → /coi-new (SIBLING, not child)
  coi-detail-[id].vue      → /coi-detail/:id (SIBLING)
  coi-edit-[id].vue        → /coi-edit/:id (SIBLING)
```

**Why It Worked:**
- All routes at same folder level = siblings
- No parent-child relationship
- No `<NuxtPage />` required

---

## B. ROLLBACK STRATEGY

### Why Rollback is Necessary

1. **CRUD Broken** - Forms don't render, HTTP methods don't fire
2. **Testing Impossible** - Can't validate features if pages don't load
3. **Regression Risk** - Building on broken foundation compounds issues
4. **Timeline Impact** - Must stabilize before University Operations sprint

### Rollback Actions

**Files to Restore (Flat Routes):**
- `coi-new.vue`, `coi-detail-[id].vue`, `coi-edit-[id].vue`
- `repairs-new.vue`, `repairs-detail-[id].vue`, `repairs-edit-[id].vue`
- `contractors-new.vue`, `contractors-edit-[id].vue`
- `funding-sources-new.vue`, `funding-sources-edit-[id].vue`
- `university-operations-new.vue`, `university-operations-detail-[id].vue`, `university-operations-edit-[id].vue`

**Folders to Delete:**
- `pages/coi/`, `pages/repairs/`, `pages/contractors/`, `pages/funding-sources/`, `pages/university-operations/`

**Navigation to Update:**
```
/coi-new (not /coi/new)
/coi-detail-:id (not /coi/detail/:id)
/coi-edit-:id (not /coi/edit/:id)
```

**Users Module Exception:**
- Keep `pages/users/*` structure
- Test thoroughly before assuming it works
- May need same rollback if issues found

### Conditions Before Next Restructure

1. ✅ All CRUD operations verified working
2. ✅ Understand Nuxt parent-child vs sibling routing
3. ✅ Clear requirement: Don't use folders unless parent has `<NuxtPage />`
4. ✅ Or accept flat structure as permanent solution

---

## C. OPTIMIZED STRUCTURE ANALYSIS

### Option 1: Flat Structure (RECOMMENDED)

**Pattern:**
```
pages/
  coi.vue
  coi-new.vue
  coi-detail-[id].vue
  coi-edit-[id].vue
```

| Factor | Assessment |
|--------|------------|
| Routing | ✅ Simple, predictable |
| Maintenance | 🟡 Scales to ~50 files |
| URLs | ❌ `/coi-edit-123` (not RESTful) |
| Risk | ✅ Zero regression risk |
| Effort | ✅ Already working |

**Verdict:** ✅ **RECOMMENDED** - Defer restructuring to post-kickoff

### Option 2: True Nested (NOT VIABLE)

**Pattern:**
```
pages/
  coi.vue (with <NuxtPage />)
  coi/
    index.vue  → /coi
    new.vue    → /coi/new
```

| Factor | Assessment |
|--------|------------|
| Routing | ❌ Complex refactoring needed |
| Maintenance | ✅ Clean organization |
| URLs | ✅ RESTful |
| Risk | 🔴 HIGH - List pages can't be layouts |
| Effort | 🔴 HIGH - Rewrite all list pages |

**Verdict:** ❌ **NOT VIABLE** - List pages need data tables, not `<NuxtPage />`

### Option 3: Hybrid Grouping (NOT RECOMMENDED)

**Pattern:**
```
pages/
  coi.vue                    → /coi
  coi-pages/
    new.vue                  → /coi-pages/new
```

| Factor | Assessment |
|--------|------------|
| Routing | ✅ No parent-child issues |
| Maintenance | 🟡 Organized but confusing |
| URLs | ❌ `/coi` vs `/coi-pages/new` inconsistent |
| Risk | 🟡 MEDIUM - Different convention |

**Verdict:** 🟡 **NOT RECOMMENDED** - Adds complexity without clear benefit

---

## D. TIMELINE FEASIBILITY - USER MANAGEMENT

### Status: ✅ COMPLETE (Feb 9, 2026)

**Deliverables Completed:**
- ✅ User list page (2 hours)
- ✅ User detail page (2 hours)
- ✅ Create/edit forms (4 hours)
- ✅ Role assignment UI (2 hours)
- ✅ Account management actions (2 hours)

**Total Effort:** 12 hours (within estimate)

**Testing Required:**
- Manual testing with backend (all CRUD operations)
- Verify `users/*` route structure works correctly
- May need rollback if same routing issues found

---

## E. TIMELINE FEASIBILITY - UNIVERSITY OPERATIONS

### Assessment: ✅ FEASIBLE in 3 weeks (Feb 16 - Mar 13)

**Scope:** DBM Financial Measurement ONLY

**Deliverables:**
1. **Week 1 (Feb 16-22)**: List page + Create/Edit forms (8-12 hrs)
2. **Week 2 (Feb 23-Mar 1)**: Financial indicators + DBM metrics (12-16 hrs)
3. **Week 3 (Mar 2-8)**: Dashboard + Testing (8-12 hrs)
4. **Week 4 (Mar 9-13)**: Buffer + Final testing (4-8 hrs)

**Total Effort:** 32-48 hours over 4 weeks = feasible

**Critical Constraints:**
- ❌ NO advanced analytics
- ❌ NO custom visualizations beyond DBM metrics
- ❌ NO optional enhancements
- ✅ Admin-focused interface only
- ✅ Reuse existing CRUD patterns

**Risks:**
- 🟡 Scope creep (mitigated by strict scope limit)
- 🟡 Unforeseen DBM requirements (mitigated by stakeholder alignment)
- ✅ Technical feasibility (CRUD pattern proven)

**Verdict:** ✅ FEASIBLE if scope strictly controlled

---

## F. UPDATED DEVELOPMENT PRIORITIES

### Sprint Sequence (Executive Directive)

**Priority Order:**
1. ✅ User Management (COMPLETE - needs testing)
2. 🎯 University Operations (DBM Financial Focus) - **IN SCOPE**
3. ⏸️ COI Enhancements - **DEFERRED**

### Week-by-Week Plan

| Week | Focus | Deliverables |
|------|-------|--------------|
| Feb 9-15 | Rollback + Testing | Flat routes restored, User Mgmt verified |
| Feb 16-22 | Univ Ops Sprint 1 | List page, CRUD forms |
| Feb 23-Mar 1 | Univ Ops Sprint 2 | Financial indicators, DBM metrics |
| Mar 2-8 | Univ Ops Sprint 3 | Dashboard, testing |
| Mar 9-13 | Final Testing | Bug fixes, prep for review |
| Mar 18-20 | **STAKEHOLDER REVIEW** | Demo ready |

---

## RECOMMENDATIONS

### Immediate Actions (Week 1)

1. **Rollback File Structure**
   - Revert commits: 479ab4c (structure), c750f5b (user mgmt)
   - Restore flat sibling routes
   - Update all navigation to old URLs

2. **Test User Management**
   - Verify all CRUD operations with backend
   - Test `users/*` routes work correctly
   - Fix any routing issues found

3. **Prepare for University Operations**
   - Review existing CRUD patterns
   - Clarify DBM financial requirements
   - Confirm scope limits with stakeholders

### Long-Term Strategy

1. **Accept Flat Structure** - Defer restructuring to post-kickoff (May+)
2. **Focus on Functionality** - RESTful URLs are aesthetic, CRUD functionality is critical
3. **Document Lessons** - Nuxt routing behavior understood, won't repeat mistake

---

## CONCLUSION

**Nuxt Routing Lesson:**
- Folders create parent-child routes
- Parents need `<NuxtPage />` to render children
- List pages can't be layouts
- **Solution:** Flat sibling routes or accept folder conventions

**Executive Alignment:**
- User Management complete (needs testing)
- University Operations prioritized
- COI enhancements deferred

**Timeline Impact:**
- Week 1: Rollback + Testing (unplanned)
- Weeks 2-4: University Operations (on track for March review)

**Status:** Plan updated, rollback required, sprint realigned

---

**Next Steps:** Execute rollback, test User Management, begin University Operations sprint.
