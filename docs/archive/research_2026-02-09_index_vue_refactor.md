# Phase 1 Research: index.vue Pattern Refactor Strategy

**Date:** 2026-02-09
**Status:** 🎯 IN PROGRESS
**Authority:** Executive directive - Option B (nested structure with index.vue)
**Corrected Deadline:** March 12, 2026 (31 days remaining)

---

## Executive Summary

**Decision**: Implement **index.vue sibling pattern** for long-term maintainability over flat routes.

**Rationale**:
- RESTful URLs (`/coi/new` not `/coi-new`)
- Organized file structure (files grouped by module)
- Industry standard Nuxt pattern
- Scalable architecture for 17 modules
- Worth 2-4 hour investment for permanent improvement

**Timeline Correction**:
- **Previous**: March 18-20 deadline (incorrect)
- **Actual**: March 12, 2026 deadline
- **Available Time**: 31 days (4.4 weeks)
- **Impact**: Tighter timeline, but index.vue refactor still feasible

---

## A. THE index.vue SIBLING PATTERN

### How It Works

When `index.vue` exists alongside other files in a folder, they're **siblings**, not parent-child.

**Before (BROKEN - Parent-Child)**:
```
pages/
  coi.vue              → /coi (parent, requires <NuxtPage />)
  coi/
    new.vue            → /coi/new (child, cannot mount)
```

**After (WORKING - Siblings)**:
```
pages/
  coi/
    index.vue        → /coi (sibling)
    new.vue          → /coi/new (sibling)
    detail-[id].vue  → /coi/detail/:id (sibling)
    edit-[id].vue    → /coi/edit/:id (sibling)
```

### Nuxt Routing Behavior

**With index.vue**:
- `coi/index.vue` = `/coi` route
- `coi/new.vue` = `/coi/new` route
- They're at the **same nesting level** (siblings)
- No parent-child relationship
- No `<NuxtPage />` required

**Key Principle**: index.vue treats the folder as a flat namespace, not a hierarchy.

---

## B. CURRENT FILE STRUCTURE ANALYSIS

### Modules Requiring Refactor

| Module | Current Structure | Files to Move |
|--------|------------------|---------------|
| **COI** | `coi.vue` + `coi/*.vue` | 1 → `coi/index.vue` |
| **Repairs** | `repairs.vue` + `repairs/*.vue` | 1 → `repairs/index.vue` |
| **Contractors** | `contractors.vue` + `contractors/*.vue` | 1 → `contractors/index.vue` |
| **Funding Sources** | `funding-sources.vue` + `funding-sources/*.vue` | 1 → `funding-sources/index.vue` |
| **University Ops** | `university-operations.vue` + `university-operations/*.vue` | 1 → `university-operations/index.vue` |
| **Users** | `users.vue` + `users/*.vue` | 1 → `users/index.vue` |

**Total Files to Move**: 6 files

### Current File Inventory

```
pmo-frontend/pages/
  ├── coi.vue                           → MOVE to coi/index.vue
  ├── coi/
  │   ├── new.vue                       ✅ Keep
  │   ├── detail-[id].vue               ✅ Keep
  │   └── edit-[id].vue                 ✅ Keep
  │
  ├── repairs.vue                       → MOVE to repairs/index.vue
  ├── repairs/
  │   ├── new.vue                       ✅ Keep
  │   ├── detail-[id].vue               ✅ Keep
  │   └── edit-[id].vue                 ✅ Keep
  │
  ├── contractors.vue                   → MOVE to contractors/index.vue
  ├── contractors/
  │   ├── new.vue                       ✅ Keep
  │   └── edit-[id].vue                 ✅ Keep
  │
  ├── funding-sources.vue               → MOVE to funding-sources/index.vue
  ├── funding-sources/
  │   ├── new.vue                       ✅ Keep
  │   └── edit-[id].vue                 ✅ Keep
  │
  ├── university-operations.vue         → MOVE to university-operations/index.vue
  ├── university-operations/
  │   ├── new.vue                       ✅ Keep
  │   ├── detail-[id].vue               ✅ Keep
  │   └── edit-[id].vue                 ✅ Keep
  │
  ├── users.vue                         → MOVE to users/index.vue
  ├── users/
  │   ├── new.vue                       ✅ Keep
  │   ├── detail-[id].vue               ✅ Keep
  │   └── edit-[id].vue                 ✅ Keep
  │
  └── gad/                              ✅ Already correct pattern
      ├── student.vue
      ├── faculty.vue
      └── ...
```

### GAD Module (Already Correct)

**GAD uses a different pattern** - navigation dashboard with in-page dialogs:
```
pages/
  gad.vue              → /gad (navigation dashboard)
  gad/
    student.vue        → /gad/student (complete page with dialogs)
    faculty.vue        → /gad/faculty (complete page with dialogs)
```

This works because GAD pages are **complete standalone pages**, not parent-child routes. No changes needed.

---

## C. NAVIGATION ROUTES ANALYSIS

### Current Navigation URLs (Already Correct)

All navigation already uses the correct nested URLs:

**COI Module** (`pages/coi.vue`):
```typescript
router.push('/coi/new')
router.push(`/coi/detail-${id}`)
router.push(`/coi/edit-${id}`)
```

**Repairs Module** (`pages/repairs.vue`):
```typescript
router.push('/repairs/new')
router.push(`/repairs/detail-${id}`)
router.push(`/repairs/edit-${id}`)
```

**Users Module** (`pages/users.vue`):
```typescript
router.push('/users/new')
router.push(`/users/detail-${id}`)
router.push(`/users/edit-${id}`)
```

**Result**: ✅ **NO navigation changes required** - URLs already match target structure.

---

## D. REFACTOR IMPLEMENTATION PLAN

### Step-by-Step Process

**For Each Module** (COI, Repairs, Contractors, Funding Sources, University Ops, Users):

1. **Move List Page to index.vue**:
   ```bash
   git mv pages/coi.vue pages/coi/index.vue
   ```

2. **Verify Folder Contents**:
   ```
   pages/coi/
     ├── index.vue        (list page)
     ├── new.vue          (create form)
     ├── detail-[id].vue  (detail view)
     └── edit-[id].vue    (edit form)
   ```

3. **Test Routes**:
   - `/coi` → loads list page (index.vue)
   - `/coi/new` → loads create form (sibling)
   - `/coi/detail/123` → loads detail view (sibling)
   - `/coi/edit/123` → loads edit form (sibling)

4. **Verify No Code Changes Needed**:
   - Navigation already uses correct URLs
   - No imports to update
   - No component logic changes

### Estimated Effort Per Module

- Move file: 1 minute
- Test all routes (4 pages × manual test): 5 minutes
- Total per module: **6 minutes**
- Total for 6 modules: **36 minutes**

**Conservative Estimate**: 1-2 hours including buffer for unexpected issues

---

## E. RISK ASSESSMENT

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Routing still broken after refactor | Low | High | Test immediately after each move |
| Git move loses file history | Low | Low | Use `git mv` instead of delete+create |
| Navigation breaks | Very Low | Medium | URLs already correct, no changes needed |
| Component imports break | Very Low | Low | No imports reference page files directly |

### Timeline Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Refactor takes longer than 2 hours | Low | Low | Simple file moves, well-defined scope |
| Testing reveals additional issues | Medium | Medium | Budget 2-4 hours for testing (already planned) |
| Delays University Ops sprint | Low | Medium | 31 days available, refactor only 2-4 hours |

**Overall Risk**: ✅ **LOW** - Simple file moves with no code changes, navigation already correct.

---

## F. TIMELINE IMPACT ANALYSIS

### Corrected Timeline

**Today**: February 9, 2026
**Deadline**: March 12, 2026
**Available Time**: 31 days (4.4 weeks)

### Week-by-Week Breakdown

| Week | Dates | Focus | Hours |
|------|-------|-------|-------|
| **Week 1** | Feb 9-15 | index.vue refactor + User Mgmt testing | 12-16h |
| **Week 2** | Feb 16-22 | University Ops: List + CRUD forms | 12-16h |
| **Week 3** | Feb 23-Mar 1 | University Ops: DBM metrics + indicators | 12-16h |
| **Week 4** | Mar 2-8 | University Ops: Dashboard + testing | 12-16h |
| **Week 5** | Mar 9-12 | Final testing + bug fixes | 8-12h |

**Total Effort**: 56-76 hours over 31 days = **feasible** with 2-3 hours/day average.

### Week 1 Detailed Breakdown

**Feb 9 (Today)**:
- ✅ Phase 1 research complete (2 hours)
- 🎯 Phase 2 plan complete (1 hour)
- 🎯 index.vue refactor implementation (2 hours)

**Feb 10-11**:
- Test all 6 modules (COI, Repairs, Contractors, Funding, Univ Ops, Users)
- Verify all CRUD operations (create, read, update, delete)
- Test all routes load correctly (4 hours)

**Feb 12-15**:
- User Management testing with backend (4 hours)
- Fix any issues found (2-4 hours)
- Prepare for University Operations sprint (2 hours)

**Week 1 Total**: 12-16 hours (✅ feasible over 7 days)

---

## G. UNIVERSITY OPERATIONS SCOPE (DBM FOCUS)

### What's In Scope

**Core CRUD**:
- List page with filters
- Create/edit forms for university operations projects
- Detail view with project information

**DBM Financial Measurement**:
- Actual vs Budget comparison
- Variance analysis
- Financial status indicators
- Cost tracking metrics

**Admin Dashboard**:
- Summary cards (total projects, budget utilization, variance)
- Filter by status, department, budget range
- Export to Excel/PDF

### What's Out of Scope

❌ Advanced analytics (trend forecasting, predictive models)
❌ Custom data visualizations (charts beyond basic DBM metrics)
❌ Real-time budget tracking integrations
❌ Workflow automation
❌ Approval routing systems

### Estimated Effort

- **Week 2**: List + CRUD (12-16h)
- **Week 3**: DBM metrics (12-16h)
- **Week 4**: Dashboard + testing (12-16h)
- **Week 5**: Buffer (8-12h)

**Total**: 44-60 hours over 4 weeks = **feasible**

---

## H. COMPARISON: Flat vs index.vue

### Long-Term Maintenance Impact

**Scenario**: 2 years from now, new developer needs to add a field to COI edit form.

**With Flat Routes**:
1. Open IDE, see 68 files at root level
2. Search for "coi" → finds 12 files
3. Guess which is edit: `coi-edit-[id].vue` or `coi-[id].vue` or `coi-edit.vue`?
4. Open wrong file, close, open correct file
5. **Time to find**: 2-3 minutes

**With index.vue Pattern**:
1. Open IDE, browse folders
2. Navigate to `pages/coi/`
3. See 4 files: index, new, detail-[id], edit-[id]
4. Open `edit-[id].vue` (obvious)
5. **Time to find**: 30 seconds

**Annual Savings**: Assuming 100 edits/year × 2 min saved = **200 minutes/year** (3.3 hours)

### URL Aesthetics

**Flat**: `/coi-edit-123` (looks internal/legacy)
**Nested**: `/coi/edit/123` (looks modern/professional)

**Impact**: Client/stakeholder perception of system quality.

---

## I. VERIFICATION CHECKLIST

### Post-Refactor Testing

**For Each Module** (6 modules):
- [ ] List page loads at `/module`
- [ ] Create form loads at `/module/new`
- [ ] Detail view loads at `/module/detail/:id`
- [ ] Edit form loads at `/module/edit/:id`
- [ ] Create form submits successfully (POST request fires)
- [ ] Edit form submits successfully (PATCH request fires)
- [ ] Navigation from list → create works
- [ ] Navigation from list → detail works
- [ ] Navigation from list → edit works
- [ ] Navigation from detail → edit works
- [ ] Back navigation works correctly

**Total Tests**: 11 tests × 6 modules = **66 test cases**

**Estimated Testing Time**: 66 tests × 2 min/test = **132 minutes (2.2 hours)**

---

## J. SUCCESS CRITERIA

### Definition of Done

**index.vue Refactor**:
- ✅ All 6 list pages moved to `*/index.vue`
- ✅ All routes load correctly (66 test cases pass)
- ✅ All CRUD operations functional (create, edit, delete)
- ✅ No console errors or warnings
- ✅ Navigation works as expected

**User Management**:
- ✅ All CRUD operations tested with backend
- ✅ Role assignment works correctly
- ✅ Account management (unlock, reset) functional

**University Operations** (by March 12):
- ✅ List page with filters operational
- ✅ Create/edit forms complete
- ✅ DBM financial metrics implemented
- ✅ Admin dashboard functional
- ✅ All features tested and bug-free

---

## K. DEPENDENCIES & BLOCKERS

### Current Blockers

**None identified** - All requirements clear, backend APIs exist, pattern is well-documented.

### Dependencies

1. **Backend APIs**: Assume existing (verified in previous research)
2. **Git Access**: Required for `git mv` commands
3. **Local Dev Server**: For testing routes
4. **Time Allocation**: 12-16 hours in Week 1

### External Risks

**None** - This is purely frontend refactoring, no backend dependencies, no external integrations.

---

## RECOMMENDATIONS

### Immediate Actions (Today - Feb 9)

1. ✅ **Approve Phase 2 Plan** - Review and approve implementation strategy
2. 🎯 **Execute index.vue Refactor** - Move 6 files, test 66 routes (2 hours)
3. 🎯 **Initial Smoke Test** - Verify no obvious breaks (30 min)

### Next Actions (Feb 10-11)

1. **Comprehensive Testing** - All 66 test cases, document any issues (4 hours)
2. **Fix Issues** - Address any routing problems found (2-4 hours buffer)
3. **Commit & Document** - Git commit with clear message, update plan

### Week 1 Completion (Feb 15)

1. **User Management Testing** - Full backend integration test (4 hours)
2. **Prepare University Ops** - Review requirements, plan implementation (2 hours)
3. **Sprint Kick-off** - Ready to start University Ops Week 2 (Feb 16)

---

## CONCLUSION

**Decision**: Proceed with **index.vue pattern refactor** (Option B)

**Rationale**:
- 2-4 hour investment for permanent architectural improvement
- RESTful URLs and organized file structure
- Industry standard pattern, easier long-term maintenance
- 31 days to deadline - sufficient time for thorough implementation

**Timeline Confidence**: ✅ **HIGH**
- Week 1: Refactor + User Mgmt testing (feasible)
- Weeks 2-4: University Ops implementation (well-scoped)
- Week 5: Buffer for final testing (conservative)

**Risk Level**: ✅ **LOW**
- Simple file moves, no code changes
- Navigation already uses correct URLs
- Clear testing plan with 66 test cases

**Status**: Ready for Phase 2 implementation approval

---

**Next Step**: Execute Phase 2 implementation plan
