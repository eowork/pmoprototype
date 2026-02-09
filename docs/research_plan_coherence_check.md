# Phase 1 Research: Kickoff Plan Coherence Check

**Date:** 2026-02-04
**Phase:** 1 (RESEARCH)
**Status:** ✅ COMPLETE
**Authority:** ACE_BOOTSTRAP v2.4 (Governed Execution)
**Purpose:** Verify Phase 4.0 proposal does not introduce scope drift or misaligned priorities

---

## Executive Summary

**Verdict:** ⚠️ **REQUIRES ADJUSTMENT**

**Finding:** Phase 4.0 (User Management Frontend) introduces **priority inversion** that violates YAGNI and misaligns with kickoff operational needs.

**Recommended Correction:** Prioritize Reference Data Management (Contractors/Funding Sources) BEFORE User Management.

---

## A. KICKOFF PLAN COHERENCE CHECK

### A.1 File Availability

✅ **VERIFIED:**
- plan_active.md (v9.0.KICKOFF-CONFIRMED)
- research_summary.md (Repairs module resolution)
- research_kickoff_state_usermgmt.md (Phase 4.0 proposal)

All required files accessible.

---

### A.2 Scope Drift Analysis

**FINDING #1: User Management Classified as "CRITICAL" - Incorrect Severity**

**Claim (from plan_active.md line 19-25):**
> BLOCKER #1: User Management Frontend Missing
> - Severity: CRITICAL (blocks production deployment)
> - Impact: Admins cannot create users, assign roles, or manage accounts via UI

**Reality Check:**
- **Workaround exists:** Admins can create users via direct DB access (SQL INSERT)
- **Not blocking operations:** Staff can use COI, Repairs, Uni Ops, GAD modules without User Management UI
- **Affects admin convenience:** User Management is for admin workflows, not operational workflows

**Governance Violation:** YAGNI
- Building User Management UI is "You Ain't Gonna Need It" for kickoff
- Initial users can be seeded via SQL scripts
- OAuth/SSO is already deferred (schema ready, not implemented)
- This is enterprise-thinking, not startup-kickoff thinking

**Correct Severity:** MEDIUM (nice-to-have for admin convenience, not blocking deployment)

---

**FINDING #2: Priority Inversion - Reference Data More Critical Than User Management**

**What Phase 4.0 Proposes:**
- User Management Frontend (4 pages, 2.5 hours)
- Defers Reference Data Management to Phase 5.0

**What COI Module Actually Needs:**

Looking at pmo-frontend/pages/coi-new.vue and coi-edit-[id].vue:
- COI forms have contractor_id dropdown (SELECT contractor)
- COI forms have funding_source_id dropdown (SELECT funding source)

**How Users Get Contractor/Funding Source Data:**
- Backend: GET /contractors (ContractorsModule exists ✅)
- Backend: GET /funding-sources (FundingSourcesModule exists ✅)
- Frontend: ❌ NO UI to CREATE contractors or funding sources

**Operational Impact:**
1. Staff user wants to create new COI project
2. Form asks: "Select contractor" (dropdown)
3. Contractor not in list (new contractor)
4. **BLOCKER:** Staff CANNOT add contractor (no UI, no DB access)
5. Staff must ask admin to manually SQL INSERT contractor
6. Admin does SQL INSERT
7. Staff refreshes page, contractor appears, continues

**This affects OPERATIONAL workflows, not just admin convenience.**

**Comparison:**

| Feature | User Type | Impact if Missing | Workaround |
|---------|-----------|-------------------|------------|
| User Management UI | Admin | Cannot create users via UI | SQL INSERT (admins have DB access) |
| Contractors UI | Staff | **Cannot create COI projects with new contractors** | **Ask admin to SQL INSERT (blocks workflow)** |
| Funding Sources UI | Staff | **Cannot create COI projects with new funding** | **Ask admin to SQL INSERT (blocks workflow)** |

**Governance Violation:** YAGNI (inverted)
- User Management: Convenience feature (workaround easy)
- Reference Data: **Operational blocker** (workaround requires admin intervention mid-workflow)

**Correct Priority:**
1. Fix Repairs UPDATE (5 min - migration)
2. **Reference Data Management (Contractors, Funding Sources) - BEFORE User Management**
3. User Management (or defer to post-kickoff)

---

### A.3 Phase Skipping / Reopening Completed Phases

**Check:** Does Phase 4.0 reopen completed work or skip necessary steps?

**Analysis:**
- ✅ PASS: Phase 4.0 does NOT reopen completed phases (COI, Uni Ops, GAD remain untouched)
- ✅ PASS: Phase 4.0 does NOT skip phases (follows Phase 1 → 2 → 3 discipline)
- ✅ PASS: No regression risk (new pages, no modifications to existing modules)

**Verdict:** No phase discipline violations detected.

---

### A.4 Over-Engineering / Enterprise-Scale Thinking

**Check:** Does Phase 4.0 introduce unnecessary complexity?

**Scope Review (from research_kickoff_state_usermgmt.md):**

**In Scope:**
- 4 frontend pages (users.vue, users-new.vue, users-edit-[id].vue, users-detail-[id].vue)
- CRUD operations (create, update, delete users)
- Role assignment dropdown
- Department assignment dropdown
- Account actions (unlock, reset password)
- Toast notifications
- Loading states
- Confirmation dialogs

**Out of Scope (Deferred):**
- Email notifications
- Bulk user import
- Advanced search/filtering
- User activity logs
- OAuth UI

**Analysis:**
- ✅ PASS: Scope is appropriately minimal (no over-engineering)
- ✅ PASS: Deferred features correctly identified (email, bulk import, OAuth)
- ✅ PASS: Follows established CRUD pattern (same as COI, Repairs)

**Verdict:** No over-engineering detected. Scope is KISS-compliant.

---

### A.5 Parallel Tracks / Team Capacity

**Check:** Does Phase 4.0 introduce multiple parallel development tracks?

**Analysis:**
- Phase 4.0 is singular: User Management Frontend only
- No parallel tracks (Repairs migration is operator action, not dev work)
- Sequential: Repairs migration → Phase 4.0 → Phase 5.0

**Verdict:** ✅ PASS - No parallel tracks, capacity appropriate.

---

## B. MODULE COMPLETENESS WITHIN TIMEFRAME

### B.1 Module Kickoff Readiness

**Construction (COI):**
- Backend: ✅ OPERATIONAL (CRUD + milestones + financials)
- Frontend: ✅ STABLE (list, new, edit, detail pages)
- **Dependency:** Contractors, Funding Sources (dropdowns)
- **Blocker:** ❌ Cannot add contractors/funding sources via UI
- **Kickoff Ready:** ⚠️ PARTIAL (missing reference data management)

**Repairs:**
- Backend: ✅ OPERATIONAL (CRUD + phases + team)
- Frontend: ⚠️ PARTIAL (UPDATE blocked - migration pending)
- **Blocker:** HTTP 500 on UPDATE (actual_cost column missing)
- **Kickoff Ready:** ⚠️ PARTIAL (5-minute fix available)

**University Operations:**
- Backend: ✅ OPERATIONAL (CRUD + indicators + financials)
- Frontend: ✅ STABLE (list, new, edit, detail pages)
- **Blocker:** None
- **Kickoff Ready:** ✅ COMPLETE

**GAD Parity:**
- Backend: ✅ OPERATIONAL (CRUD for 8 sub-modules)
- Frontend: ✅ STABLE (list pages)
- **Blocker:** None
- **Kickoff Ready:** ✅ COMPLETE

**Authentication & User Management:**
- Backend: ✅ OPERATIONAL (login, JWT, RBAC, user CRUD)
- Frontend: ✅ STABLE (login page works, authentication functional)
- **User Management UI:** ❌ MISSING
- **Blocker:** Admins cannot manage users via UI (workaround: SQL)
- **Kickoff Ready:** ⚠️ PARTIAL (login works, user mgmt UI is convenience)

---

### B.2 Essential vs. Nice-to-Have Features

**Essential for Kickoff (Must-Have):**
1. ✅ Login / Authentication (working)
2. ✅ COI CRUD (working, but needs contractors/funding UI)
3. ⚠️ Repairs CRUD (CREATE works, UPDATE blocked - 5 min fix)
4. ✅ University Operations CRUD (working)
5. ✅ GAD Parity CRUD (working)
6. ❌ **Contractors/Funding Sources UI (missing - affects COI workflows)**

**Nice-to-Have (Can Defer):**
1. User Management UI (admins can SQL INSERT users temporarily)
2. Departments UI (departments exist, staff can be assigned via SQL)
3. Repair Types UI (types exist, can be managed via SQL)
4. OAuth/SSO (deferred - correct decision)

**YAGNI Compliance Check:**

| Feature | Phase 4.0 Priority | Actual Kickoff Necessity | YAGNI Violation? |
|---------|-------------------|--------------------------|------------------|
| User Management UI | CRITICAL | MEDIUM (nice-to-have) | ⚠️ YES (over-prioritized) |
| Contractors/Funding UI | Deferred (Phase 5.0) | HIGH (operational need) | ⚠️ YES (under-prioritized) |
| Repairs UPDATE fix | MEDIUM | HIGH (blocks editing) | ✅ NO (correctly prioritized) |

**Verdict:** ⚠️ YAGNI violation detected - priority inversion between User Management and Reference Data.

---

### B.3 Missing Kickoff-Critical Features

**FINDING #3: Reference Data Management Missing from Kickoff Plan**

**What's Missing:**
1. **Contractors Management UI:**
   - contractors.vue (list view)
   - contractors-new.vue (create form)
   - contractors-edit-[id].vue (edit form)
   - Backend: ✅ EXISTS (ContractorsModule, CRUD endpoints)
   - Frontend: ❌ MISSING

2. **Funding Sources Management UI:**
   - funding-sources.vue (list view)
   - funding-sources-new.vue (create form)
   - funding-sources-edit-[id].vue (edit form)
   - Backend: ✅ EXISTS (FundingSourcesModule, CRUD endpoints)
   - Frontend: ❌ MISSING

**Why This Matters:**
- COI module dropdowns populate from GET /contractors and GET /funding-sources
- If staff user needs to add new contractor, they CANNOT (no UI)
- If staff user needs to add new funding source, they CANNOT (no UI)
- **This blocks operational workflows**, not just admin workflows

**Impact:**
- User creates COI project
- Selects contractor from dropdown
- Contractor not in list (new contractor)
- **Workflow stops** - user must ask admin to SQL INSERT contractor
- This is unacceptable for kickoff (violates usability)

---

## C. TIMELINE FEASIBILITY

### C.1 Phase 4.0 Effort Estimate Review

**Claimed Effort (from plan_active.md):**

| Task | Time | Basis |
|------|------|-------|
| users.vue (list view) | 30 min | LOW complexity |
| users-new.vue (create form) | 30 min | LOW complexity |
| users-edit-[id].vue (edit + actions) | 45 min | MEDIUM complexity |
| users-detail-[id].vue (detail view) | 20 min | LOW complexity |
| reverseAdaptUser function | 10 min | LOW complexity |
| Navigation link | 5 min | LOW complexity |
| Testing | 20 min | N/A |
| **TOTAL** | **2.5 hours** | **LOW-MEDIUM** |

**Reality Check:**

Based on previous implementations:
- coi-new.vue implementation: ~40 minutes (from ACE research history)
- coi-edit-[id].vue implementation: ~45 minutes
- repairs-new.vue implementation: ~40 minutes

**Actual Estimate:**
- users.vue: 40 min (table, pagination, filters)
- users-new.vue: 40 min (form validation, role dropdown)
- users-edit-[id].vue: 50 min (edit form + unlock/reset actions)
- users-detail-[id].vue: 25 min (read-only display)
- reverseAdaptUser: 10 min
- Navigation: 5 min
- Testing: 30 min (full CRUD cycle + role assignment)

**Realistic Total:** ~3.3 hours (not 2.5 hours)

**Buffer Missing:** No time for:
- Unexpected issues (role dropdown edge cases)
- Password validation (min length, etc.)
- Confirmation dialogs (delete user, reset password)
- Error handling (duplicate email, etc.)

**Verdict:** ⚠️ Estimate optimistic by ~30-40 minutes. Feasible but tight.

---

### C.2 Alternative Priority: Reference Data First

**If we prioritize Reference Data instead:**

**Contractors Management:**
- contractors.vue: 30 min (simpler than users - no roles)
- contractors-new.vue: 30 min (name, contact info, status)
- contractors-edit-[id].vue: 30 min (same form, pre-populated)
- Adapter functions: 10 min (adaptContractor, reverseAdaptContractor)
- **Subtotal:** 1.7 hours

**Funding Sources Management:**
- funding-sources.vue: 30 min (list view)
- funding-sources-new.vue: 30 min (name, description)
- funding-sources-edit-[id].vue: 30 min (edit form)
- Adapter functions: 10 min
- **Subtotal:** 1.7 hours

**Total for Reference Data:** ~3.4 hours (2 modules)

**Comparison:**

| Priority Option | Effort | Operational Impact | Admin Impact |
|----------------|--------|-------------------|--------------|
| Phase 4.0 (User Management) | 3.3 hours | None (doesn't affect staff workflows) | High (admins get UI for user management) |
| **Reference Data (Contractors + Funding)** | **3.4 hours** | **High (staff can now use COI fully)** | **None** |

**Verdict:** Reference Data has higher ROI for kickoff (unblocks staff workflows).

---

## D. PHASE DISCIPLINE VERIFICATION

### D.1 Phase Boundary Respect

**Check:** Are Phase 1 (Research), Phase 2 (Planning), Phase 3 (Implementation) properly separated?

**Analysis:**
- research_kickoff_state_usermgmt.md = Phase 1 ✅
- plan_active.md Phase 4.0 section = Phase 2 ✅
- No implementation code in research ✅
- No code changes in planning ✅

**Verdict:** ✅ PASS - Phase discipline maintained.

---

### D.2 Artifact Clarity vs. Documentation Overload

**Check:** Are planning artifacts useful for execution, or just documentation overhead?

**Current Artifacts:**
1. plan_active.md (1100+ lines)
2. research_summary.md (6000+ lines)
3. research_kickoff_state_usermgmt.md (500+ lines)
4. research_repairs_module_failures.md (210 lines)
5. research_data_display_failures.md
6. research_data_mapping_analysis.md

**Analysis:**
- ⚠️ Multiple overlapping research docs (repairs module analyzed 3+ times)
- ⚠️ plan_active.md contains historical sections (lines 340-1100 are archives)
- ⚠️ Operator must read 500-line document to understand next 3-hour task

**Governance Violation:** MIS (Minimal Information Sharing)
- Too much information, not enough clarity
- Operator cannot quickly answer: "What should I do next?"

**Recommendation:** Consolidate to single action plan (WHAT to do, WHY, HOW) without historical archives inline.

---

## E. RISK & GAP IDENTIFICATION

### E.1 Kickoff-Critical Risks

**RISK #1: COI Module Unusable Without Reference Data UI**
- **Severity:** HIGH
- **Impact:** Staff cannot create COI projects with new contractors/funding sources
- **Workaround:** Ask admin to SQL INSERT (breaks workflow)
- **Resolution:** Implement Contractors + Funding Sources UI (3.4 hours)

**RISK #2: User Management Prioritized Over Operational Needs**
- **Severity:** MEDIUM
- **Impact:** Dev time spent on admin convenience instead of staff workflows
- **Workaround:** Deprioritize User Management to Phase 5.0 or post-kickoff
- **Resolution:** Reorder priorities (Reference Data before User Management)

**RISK #3: Repairs UPDATE Still Blocked**
- **Severity:** MEDIUM
- **Impact:** Cannot edit actual_cost field on existing repairs
- **Workaround:** None (5-minute migration fixes it)
- **Resolution:** Execute migration immediately (highest ROI per minute)

---

### E.2 Dependency Blockage Analysis

**Current Dependencies:**

COI Module depends on:
- ✅ Backend ConstructionProjectsModule (operational)
- ✅ Frontend coi-new.vue, coi-edit-[id].vue (exists)
- ❌ **Frontend Contractors UI** (missing - blocks workflow)
- ❌ **Frontend Funding Sources UI** (missing - blocks workflow)

User Management depends on:
- ✅ Backend UsersModule (operational)
- ❌ Frontend users pages (missing)
- ✅ Departments backend (exists)
- ❌ Departments frontend (missing - less critical)

**Dependency Chain:**

```
COI (operational module) → Contractors UI (missing)
                         → Funding Sources UI (missing)

User Management (admin module) → No operational dependencies
```

**Critical Path:**
1. Repairs migration (5 min) - unblocks Repairs UPDATE
2. **Contractors + Funding Sources UI (3.4 hours) - unblocks COI workflows**
3. User Management UI (3.3 hours) - convenience, not blocking

**Verdict:** Reference Data is on critical path, User Management is not.

---

## F. GOVERNANCE COMPLIANCE SUMMARY

| Principle | Compliance | Violation Details |
|-----------|------------|-------------------|
| **SOLID** | ✅ PASS | Single Responsibility maintained (UsersModule, ContractorsModule isolated) |
| **DRY** | ✅ PASS | Reuses adapter pattern, CRUD template pattern |
| **KISS** | ✅ PASS | Simple 4-page CRUD (not over-engineered) |
| **YAGNI** | ⚠️ **FAIL** | **Building User Management UI when Reference Data is more critical** |
| **TDA** | ✅ PASS | Frontend adapts to backend (reverseAdaptUser) |
| **MIS** | ⚠️ **FAIL** | **Excessive documentation artifacts, plan overlaps, unclear action items** |

**Overall Verdict:** ⚠️ 2/6 governance violations detected (YAGNI, MIS)

---

## G. RECOMMENDATIONS

### G.1 Immediate Corrections (Conceptual Only)

**Correction #1: Reorder Priorities**

**Current Plan:**
1. Phase 4.0: User Management Frontend (3.3 hours)
2. Phase 5.0: Reference Data Management (deferred)

**Corrected Plan:**
1. **Phase 4.0: Repairs Migration** (5 minutes - operator action)
2. **Phase 4.1: Contractors Management UI** (1.7 hours)
3. **Phase 4.2: Funding Sources Management UI** (1.7 hours)
4. **Phase 5.0: User Management UI** (3.3 hours - OR defer to post-kickoff)

**Rationale:**
- Contractors + Funding Sources unblock COI staff workflows (operational impact)
- User Management is admin convenience (nice-to-have, not blocking)
- YAGNI: Build what's operationally necessary first

---

**Correction #2: Reclassify User Management Severity**

**Current:** CRITICAL (blocks production deployment)
**Corrected:** MEDIUM (nice-to-have for admin convenience)

**Rationale:**
- Workaround exists (SQL INSERT users)
- Not blocking staff workflows
- Can defer to post-kickoff if time-constrained

---

**Correction #3: Consolidate Documentation**

**Current:** 6+ research documents, 1100-line plan with inline archives
**Recommended:** 1 active plan + 1 research summary + 1 archive folder

**Rationale:**
- MIS: Operator needs clarity, not volume
- Single source of truth for "what to do next"
- Archive historical context separately

---

### G.2 Kickoff Completion Sequence (Corrected)

**Minimal Viable Kickoff (MVK):**

1. ✅ Login / Auth (done)
2. ✅ COI CRUD backend + frontend (done)
3. ⏳ **Repairs UPDATE fix (5 min migration)**
4. ❌ **Contractors UI (1.7 hours) - MISSING**
5. ❌ **Funding Sources UI (1.7 hours) - MISSING**
6. ✅ University Operations CRUD (done)
7. ✅ GAD Parity CRUD (done)

**Total Remaining:** ~3.5 hours (5 min migration + 1.7h + 1.7h)

**User Management:** Defer to Phase 5.0 or post-kickoff (not blocking)

---

### G.3 Definition of "Kickoff Ready" (Corrected)

**Kickoff Ready Means:**
- ✅ Staff can log in
- ✅ Staff can create/edit/view COI projects
- ✅ Staff can select contractors/funding sources (requires UI to add new ones)
- ✅ Staff can create/edit/view Repairs
- ✅ Staff can create/edit/view University Operations
- ✅ Staff can create/edit/view GAD Parity data
- ⚠️ Admins can create users (workaround: SQL - acceptable for kickoff)

**Not Required for Kickoff:**
- ❌ User Management UI (admin convenience)
- ❌ OAuth/SSO (deferred - correct)
- ❌ Departments UI (deferred - acceptable)
- ❌ Advanced features (analytics, reporting, dashboards)

---

## H. FINAL VERDICT

### H.1 Plan Coherence Status

**Status:** ⚠️ **REQUIRES ADJUSTMENT**

**Reason:** Priority inversion (User Management over Reference Data) violates YAGNI and misaligns with operational kickoff needs.

---

### H.2 Adjustments Required

**Required (Conceptual):**
1. **Reprioritize:** Reference Data (Contractors, Funding Sources) BEFORE User Management
2. **Reclassify:** User Management severity from CRITICAL to MEDIUM
3. **Update:** plan_active.md Phase 4.0 scope to Reference Data Management
4. **Defer:** User Management to Phase 5.0 or post-kickoff

**Optional (Recommended):**
- Consolidate documentation artifacts (reduce MIS violation)
- Archive historical context separately from active plan

---

### H.3 Safe to Proceed?

**Answer:** ⚠️ **NOT SAFE TO PROCEED AS-IS**

**Blockers:**
- Current plan prioritizes admin convenience over staff workflows
- YAGNI violation (building User Management when Reference Data more critical)
- COI module will remain partially unusable (cannot add contractors/funding sources)

**After Corrections:** ✅ SAFE TO PROCEED

**Next Step:** Operator reviews this research and approves corrected priorities.

---

## I. APPENDIX: Evidence Summary

### I.1 Backend Module Inventory (Confirmed)

From app.module.ts (lines 1-84):
- ✅ UsersModule (line 15)
- ✅ ContractorsModule (line 19)
- ✅ FundingSourcesModule (line 20)

All backend modules exist.

---

### I.2 Frontend Pages Inventory (Confirmed)

From Glob results:
- ✅ login.vue
- ✅ dashboard.vue
- ✅ coi.vue, coi-new.vue, coi-edit-[id].vue, coi-detail-[id].vue
- ✅ repairs.vue, repairs-new.vue, repairs-edit-[id].vue, repairs-detail-[id].vue
- ✅ university-operations.vue, university-operations-new.vue, university-operations-edit-[id].vue, university-operations-detail-[id].vue
- ✅ gad.vue
- ❌ users*.vue (MISSING)
- ❌ contractors*.vue (MISSING)
- ❌ funding-sources*.vue (MISSING)

---

### I.3 Governance Violations Summary

**YAGNI Violation:**
- Phase 4.0 prioritizes User Management (admin convenience)
- Defers Reference Data (staff operational need)
- This is "You Ain't Gonna Need It" inverted (building what's less needed first)

**MIS Violation:**
- 6+ research documents with overlapping content
- 1100-line plan with inline historical archives
- Operator clarity reduced by information volume

---

**END OF RESEARCH**

---

**Research Status:** ✅ COMPLETE
**Plan Status:** ⚠️ REQUIRES ADJUSTMENT
**Recommendation:** Reprioritize Reference Data before User Management
**Safe to Proceed:** ❌ NOT SAFE (until corrections applied)
