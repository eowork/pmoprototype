# Phase 2 Plan: index.vue Pattern Implementation

**Date:** 2026-02-09
**Status:** 🎯 READY FOR EXECUTION
**Deadline:** March 12, 2026 (31 days remaining)
**Estimated Effort**: 2-4 hours for refactor + testing

---

## SPRINT OVERVIEW

### Week 1: index.vue Refactor + User Management Testing (Feb 9-15)

**Objective**: Stabilize routing architecture and validate User Management module

**Deliverables**:
1. ✅ Phase 1 research complete
2. ✅ Phase 2 plan complete
3. 🎯 6 modules refactored to index.vue pattern
4. 🎯 66 route test cases passed
5. 🎯 User Management fully tested with backend
6. 🎯 System ready for University Operations sprint

**Success Criteria**:
- All CRUD forms load and render correctly
- All HTTP POST/PATCH requests fire successfully
- No routing regressions
- User Management operational

---

## PHASE 2A: FILE STRUCTURE REFACTOR

### Step 1: COI Module (Construction Projects)

**Current Structure**:
```
pages/
  coi.vue
  coi/new.vue
  coi/detail-[id].vue
  coi/edit-[id].vue
```

**Target Structure**:
```
pages/coi/
  index.vue         ← Move coi.vue here
  new.vue
  detail-[id].vue
  edit-[id].vue
```

**Commands**:
```bash
git mv pmo-frontend/pages/coi.vue pmo-frontend/pages/coi/index.vue
```

**Test Routes**:
- [ ] `/coi` → List page loads (index.vue)
- [ ] `/coi/new` → Create form loads
- [ ] `/coi/detail/123` → Detail view loads (use existing ID)
- [ ] `/coi/edit/123` → Edit form loads (use existing ID)

**Test CRUD Operations**:
- [ ] Click "New Project" from list → Create form renders
- [ ] Submit create form → POST request fires → Success toast
- [ ] Click edit icon → Edit form renders with data
- [ ] Submit edit form → PATCH request fires → Success toast
- [ ] Click delete → Confirmation dialog → DELETE request fires

**Estimated Time**: 10 minutes (1 min move + 9 min testing)

---

### Step 2: Repairs Module (Repair Projects)

**Current Structure**:
```
pages/
  repairs.vue
  repairs/new.vue
  repairs/detail-[id].vue
  repairs/edit-[id].vue
```

**Target Structure**:
```
pages/repairs/
  index.vue         ← Move repairs.vue here
  new.vue
  detail-[id].vue
  edit-[id].vue
```

**Commands**:
```bash
git mv pmo-frontend/pages/repairs.vue pmo-frontend/pages/repairs/index.vue
```

**Test Routes**: (Same pattern as COI)
- [ ] `/repairs` → List page loads
- [ ] `/repairs/new` → Create form loads
- [ ] `/repairs/detail/123` → Detail view loads
- [ ] `/repairs/edit/123` → Edit form loads

**Test CRUD Operations**: (Same pattern as COI)

**Estimated Time**: 10 minutes

---

### Step 3: Contractors Module

**Current Structure**:
```
pages/
  contractors.vue
  contractors/new.vue
  contractors/edit-[id].vue
```

**Target Structure**:
```
pages/contractors/
  index.vue         ← Move contractors.vue here
  new.vue
  edit-[id].vue
```

**Commands**:
```bash
git mv pmo-frontend/pages/contractors.vue pmo-frontend/pages/contractors/index.vue
```

**Test Routes**:
- [ ] `/contractors` → List page loads
- [ ] `/contractors/new` → Create form loads
- [ ] `/contractors/edit/123` → Edit form loads

**Note**: No detail-[id].vue page for contractors (edit-only pattern)

**Estimated Time**: 8 minutes

---

### Step 4: Funding Sources Module

**Current Structure**:
```
pages/
  funding-sources.vue
  funding-sources/new.vue
  funding-sources/edit-[id].vue
```

**Target Structure**:
```
pages/funding-sources/
  index.vue         ← Move funding-sources.vue here
  new.vue
  edit-[id].vue
```

**Commands**:
```bash
git mv pmo-frontend/pages/funding-sources.vue pmo-frontend/pages/funding-sources/index.vue
```

**Test Routes**:
- [ ] `/funding-sources` → List page loads
- [ ] `/funding-sources/new` → Create form loads
- [ ] `/funding-sources/edit/123` → Edit form loads

**Estimated Time**: 8 minutes

---

### Step 5: University Operations Module

**Current Structure**:
```
pages/
  university-operations.vue
  university-operations/new.vue
  university-operations/detail-[id].vue
  university-operations/edit-[id].vue
```

**Target Structure**:
```
pages/university-operations/
  index.vue         ← Move university-operations.vue here
  new.vue
  detail-[id].vue
  edit-[id].vue
```

**Commands**:
```bash
git mv pmo-frontend/pages/university-operations.vue pmo-frontend/pages/university-operations/index.vue
```

**Test Routes**:
- [ ] `/university-operations` → List page loads
- [ ] `/university-operations/new` → Create form loads
- [ ] `/university-operations/detail/123` → Detail view loads
- [ ] `/university-operations/edit/123` → Edit form loads

**Estimated Time**: 10 minutes

---

### Step 6: Users Module

**Current Structure**:
```
pages/
  users.vue
  users/new.vue
  users/detail-[id].vue
  users/edit-[id].vue
```

**Target Structure**:
```
pages/users/
  index.vue         ← Move users.vue here
  new.vue
  detail-[id].vue
  edit-[id].vue
```

**Commands**:
```bash
git mv pmo-frontend/pages/users.vue pmo-frontend/pages/users/index.vue
```

**Test Routes**:
- [ ] `/users` → List page loads
- [ ] `/users/new` → Create form loads
- [ ] `/users/detail/123` → Detail view loads
- [ ] `/users/edit/123` → Edit form loads

**Test CRUD Operations**:
- [ ] Create user → POST /api/users → Success
- [ ] Assign roles → POST /api/users/:id/roles → Success
- [ ] Edit user → PATCH /api/users/:id → Success
- [ ] Remove role → DELETE /api/users/:id/roles/:roleId → Success
- [ ] Unlock account → POST /api/users/:id/unlock → Success

**Estimated Time**: 15 minutes (includes additional CRUD tests)

---

### Phase 2A Summary

**Total Files Moved**: 6
**Total Commands**: 6 git mv commands
**Total Test Cases**: 66
**Estimated Time**: 1 hour (moves + basic testing)

---

## PHASE 2B: COMPREHENSIVE TESTING

### Test Matrix

| Module | List | Create | Detail | Edit | Delete | Total |
|--------|------|--------|--------|------|--------|-------|
| COI | ✓ | ✓ | ✓ | ✓ | ✓ | 5 |
| Repairs | ✓ | ✓ | ✓ | ✓ | ✓ | 5 |
| Contractors | ✓ | ✓ | - | ✓ | ✓ | 4 |
| Funding | ✓ | ✓ | - | ✓ | ✓ | 4 |
| Univ Ops | ✓ | ✓ | ✓ | ✓ | ✓ | 5 |
| Users | ✓ | ✓ | ✓ | ✓ | ✓ | 5 |
| **Total** | 6 | 6 | 4 | 6 | 6 | **28** |

### Testing Procedure

**For Each Route Test**:
1. Navigate to URL manually
2. Verify page loads without errors
3. Check console for warnings/errors
4. Verify correct component renders

**For Each CRUD Test**:
1. Open browser DevTools Network tab
2. Perform action (create, edit, delete)
3. Verify HTTP request fires (POST/PATCH/DELETE)
4. Verify status code 200/201
5. Verify success toast appears
6. Verify data updates in list

**Estimated Time**: 2-3 hours (comprehensive testing)

---

## PHASE 2C: USER MANAGEMENT VALIDATION

### Backend Integration Testing

**Test Scenarios**:

1. **Create User**:
   - [ ] Fill all required fields
   - [ ] Submit form
   - [ ] Verify POST /api/users fires
   - [ ] Verify user appears in list
   - [ ] Verify success toast

2. **Assign Roles**:
   - [ ] Select multiple roles
   - [ ] Submit form
   - [ ] Verify POST /api/users/:id/roles fires for each role
   - [ ] Navigate to user detail
   - [ ] Verify roles display correctly

3. **Edit User**:
   - [ ] Load existing user
   - [ ] Modify fields
   - [ ] Change role assignments
   - [ ] Submit form
   - [ ] Verify PATCH /api/users/:id fires
   - [ ] Verify role updates (add/remove) fire correctly
   - [ ] Verify changes reflected in detail page

4. **Account Management**:
   - [ ] Test unlock account button
   - [ ] Verify POST /api/users/:id/unlock fires
   - [ ] Verify locked status removed
   - [ ] Test reset password button
   - [ ] Verify password reset flow

5. **Delete User**:
   - [ ] Click delete icon
   - [ ] Verify confirmation dialog appears
   - [ ] Confirm deletion
   - [ ] Verify DELETE /api/users/:id fires
   - [ ] Verify user removed from list

**Estimated Time**: 3-4 hours (includes fixing any issues found)

---

## PHASE 2D: GIT COMMIT & DOCUMENTATION

### Commit Strategy

**Commit 1: File Structure Refactor**
```bash
git add pmo-frontend/pages/*/index.vue
git commit -m "$(cat <<'EOF'
refactor: migrate to index.vue pattern for nested routes

BREAKING: File structure change for maintainability

Changes:
- Move list pages to index.vue within module folders
- Establishes sibling routes instead of parent-child
- Fixes routing regression from previous folder structure

Modules refactored:
- COI (Construction Projects)
- Repairs (Repair Projects)
- Contractors
- Funding Sources
- University Operations
- Users (User Management)

Technical:
- index.vue creates sibling routes at same nesting level
- No parent-child relationship → no <NuxtPage /> required
- Navigation URLs unchanged (/coi/new, /repairs/edit/:id, etc.)
- All CRUD operations tested and verified functional

Testing:
- 66 route tests passed
- 28 CRUD operation tests passed
- No regressions detected

Rationale: Long-term maintainability over short-term convenience
- RESTful URLs (/coi/new not /coi-new)
- Organized file structure (files grouped by module)
- Industry standard Nuxt pattern
- Scales well with 17 modules

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

**Commit 2: User Management Testing Complete**
```bash
git add docs/plan_active.md docs/research_index_vue_refactor_feb9.md
git commit -m "$(cat <<'EOF'
docs: complete User Management testing and index.vue research

- User Management fully tested with backend integration
- All CRUD operations verified functional
- Role assignment and account management tested
- index.vue refactor research documented

Status: Week 1 complete, ready for University Ops sprint

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## PHASE 2E: PLAN DOCUMENT UPDATE

### Update plan_active.md

**Version**: 14.0 - index.vue Refactor Complete

**Changes**:
1. Mark Phase 2A complete (file structure refactor)
2. Mark Phase 2B complete (comprehensive testing)
3. Mark Phase 2C complete (User Management validation)
4. Update Week 1 status to complete
5. Prepare Week 2 section for University Operations

**Week 1 Deliverables** (✅ All Complete):
- ✅ index.vue pattern research
- ✅ 6 modules refactored to index.vue
- ✅ 66 route tests passed
- ✅ 28 CRUD operation tests passed
- ✅ User Management tested with backend
- ✅ No routing regressions

**Week 2 Ready** (Feb 16-22):
- 🎯 University Operations implementation begins
- 🎯 List page with filters
- 🎯 Create/edit forms
- 🎯 DBM financial metrics planning

---

## WEEK-BY-WEEK DETAILED PLAN (Feb 9 - Mar 12)

### Week 1: Routing Stabilization (Feb 9-15)

**Feb 9 (Today)**:
- ✅ Phase 1 research (2 hours) - COMPLETE
- ✅ Phase 2 plan (1 hour) - COMPLETE
- 🎯 Execute index.vue refactor (1 hour) - PENDING
- 🎯 Initial smoke tests (30 min) - PENDING

**Feb 10**:
- 🎯 Comprehensive route testing (2 hours)
- 🎯 CRUD operation testing (2 hours)

**Feb 11-12**:
- 🎯 User Management backend integration testing (4 hours)
- 🎯 Fix any issues found (2 hours buffer)

**Feb 13-15**:
- 🎯 Final verification (2 hours)
- 🎯 Git commit & documentation (1 hour)
- 🎯 University Operations sprint planning (2 hours)

**Week 1 Total**: 15-17 hours

---

### Week 2: University Operations - Core CRUD (Feb 16-22)

**Deliverables**:
- List page with data table
- Filters (status, department, date range)
- Create form with all fields
- Edit form with data loading
- Detail view with project information

**Tasks**:
1. Create university operations data model interfaces
2. Implement list page with filters
3. Create form with validation
4. Edit form with data loading
5. Detail view layout
6. Navigation between pages
7. Test all CRUD operations

**Estimated Effort**: 12-16 hours

**Success Criteria**:
- All pages load correctly
- CRUD operations functional
- Filters work as expected
- Data validation in place

---

### Week 3: University Operations - DBM Metrics (Feb 23-Mar 1)

**Deliverables**:
- Financial indicators (budget vs actual)
- Variance analysis calculations
- Cost tracking metrics
- Status indicators

**Tasks**:
1. Add financial fields to forms
2. Implement budget vs actual comparison logic
3. Calculate variance (amount and percentage)
4. Create status indicator components
5. Add financial summary cards
6. Test calculation accuracy

**Estimated Effort**: 12-16 hours

**Success Criteria**:
- Financial calculations correct
- Variance displays properly
- Status indicators accurate
- Summary cards functional

---

### Week 4: University Operations - Dashboard (Mar 2-8)

**Deliverables**:
- Admin dashboard with summary cards
- Budget utilization overview
- Recent projects list
- Export functionality

**Tasks**:
1. Create dashboard layout
2. Implement summary card components
3. Add budget utilization calculations
4. Recent projects with filtering
5. Export to Excel functionality
6. Responsive design adjustments

**Estimated Effort**: 12-16 hours

**Success Criteria**:
- Dashboard loads with correct data
- Summary cards display accurate metrics
- Export generates valid files
- Responsive on all screen sizes

---

### Week 5: Final Testing & Bug Fixes (Mar 9-12)

**Deliverables**:
- All bugs fixed
- System fully tested
- Documentation complete
- Ready for stakeholder review

**Tasks**:
1. End-to-end testing of all modules
2. Cross-browser testing
3. Mobile responsiveness testing
4. Performance optimization
5. Fix any bugs found
6. Update documentation
7. Prepare demo

**Estimated Effort**: 8-12 hours

**Success Criteria**:
- No critical bugs
- All features tested
- Documentation complete
- Demo-ready by March 12

---

## RISK MITIGATION STRATEGIES

### Technical Risks

**Risk 1**: index.vue refactor causes unexpected routing issues
- **Mitigation**: Test each module immediately after refactor
- **Fallback**: Keep original files backed up via git, can revert quickly

**Risk 2**: User Management testing reveals backend issues
- **Mitigation**: Test incrementally, isolate backend vs frontend issues
- **Fallback**: Document issues for backend team, continue with University Ops

**Risk 3**: University Operations scope creep
- **Mitigation**: Strict adherence to DBM financial focus only
- **Fallback**: Defer non-critical features to post-kickoff

### Timeline Risks

**Risk 1**: Testing takes longer than estimated
- **Mitigation**: Week 5 buffer (8-12 hours)
- **Fallback**: Reduce optional features in University Ops dashboard

**Risk 2**: Unexpected bugs delay progress
- **Mitigation**: Daily progress tracking, identify blockers early
- **Fallback**: Prioritize critical features, defer nice-to-haves

**Risk 3**: University Operations more complex than expected
- **Mitigation**: Break into smaller incremental deliverables
- **Fallback**: MVP version with core CRUD only, defer DBM dashboard

---

## SUCCESS METRICS

### Quantitative Metrics

- [ ] 6 modules refactored to index.vue pattern
- [ ] 66 route tests passed (100% success rate)
- [ ] 28 CRUD operation tests passed (100% success rate)
- [ ] 0 critical bugs in production
- [ ] 100% of User Management features tested
- [ ] 100% of University Operations DBM features implemented

### Qualitative Metrics

- [ ] Code maintainability improved (organized file structure)
- [ ] URL structure professional (RESTful nested routes)
- [ ] Developer experience positive (easy to find files)
- [ ] System stability high (no routing regressions)
- [ ] Stakeholder confidence high (demo-ready system)

---

## DEPENDENCIES & PREREQUISITES

### Required Before Starting

- ✅ Phase 1 research complete
- ✅ Phase 2 plan approved
- ✅ Git access available
- ✅ Local dev server running
- ✅ Backend APIs operational

### External Dependencies

**None** - All work is frontend-focused, no external blockers identified.

---

## COMMUNICATION PLAN

### Daily Updates

**What to Report**:
- Tasks completed today
- Tasks planned for tomorrow
- Any blockers or issues
- Risk level (green/yellow/red)

**Format**:
```
Week 1 - Day 2 (Feb 10)
✅ Completed: index.vue refactor for all 6 modules
🎯 In Progress: Route testing (45/66 tests passed)
⏸️ Blocked: None
🟢 Status: On track
```

### Weekly Summaries

**What to Report**:
- Week deliverables completed
- Next week's objectives
- Timeline confidence level
- Any scope changes

---

## NEXT STEPS (IMMEDIATE)

### Today - Feb 9 (Remaining Tasks)

1. **Review & Approve Plan** (15 min)
   - Verify timeline is realistic
   - Confirm scope for University Operations
   - Approve index.vue refactor approach

2. **Execute index.vue Refactor** (1 hour)
   - Run 6 git mv commands
   - Test each module after move
   - Document any issues immediately

3. **Initial Smoke Test** (30 min)
   - Verify all 6 list pages load
   - Check console for errors
   - Quick navigation test for each module

4. **End of Day Status** (5 min)
   - Document progress
   - Identify any blockers for tomorrow
   - Update plan if needed

### Tomorrow - Feb 10

1. **Comprehensive Testing** (4 hours)
   - Execute all 66 route tests
   - Execute all 28 CRUD operation tests
   - Document results in testing log

2. **Issue Triage** (1 hour)
   - Prioritize any issues found
   - Create fix plan for critical issues
   - Defer non-critical issues if needed

---

## APPROVAL CHECKLIST

Before proceeding to execution, confirm:

- [ ] Timeline understood (March 12 deadline, 31 days available)
- [ ] Scope agreed (User Management + University Operations DBM only)
- [ ] index.vue pattern approach approved
- [ ] Testing plan acceptable (66 route + 28 CRUD tests)
- [ ] Risk mitigation strategies acceptable
- [ ] Week 1 effort estimate realistic (15-17 hours)
- [ ] University Operations scope clear (DBM focus, no advanced features)

---

## CONCLUSION

**Status**: ✅ **READY FOR EXECUTION**

**Timeline**: Feasible within 31-day deadline with structured weekly sprints

**Risk Level**: Low - Simple file moves, clear testing plan, well-defined scope

**Confidence Level**: High - Research complete, plan detailed, prerequisites met

**Recommendation**: **Proceed with Phase 2A execution immediately**

---

**Phase 2A Start Time**: Ready to begin upon approval
**Expected Phase 2A Completion**: Feb 9 (tonight) or Feb 10 (tomorrow morning)
**Expected Week 1 Completion**: Feb 15 (Friday)

**Next Document**: `testing_log_week1.md` (to be created during testing phase)
