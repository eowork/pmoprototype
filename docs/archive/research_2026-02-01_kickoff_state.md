# Phase 1 Research: Kickoff State Confirmation & User Management Identification

**Date:** 2026-02-04
**Phase:** 1 (RESEARCH)
**Status:** ✅ COMPLETE
**Authority:** ACE_BOOTSTRAP v2.4 (Governed Execution)
**Purpose:** Confirm current kickoff readiness and identify next development phase

---

## Executive Summary

**Kickoff Status:** ✅ READY (4 core CRUD modules functional on frontend)
**Backend Status:** ✅ COMPLETE (17 modules, 129+ endpoints operational)
**Immediate Blocker:** ⚠️ Repairs module UPDATE endpoint (HTTP 500 - schema migration pending)
**Identified Next Phase:** 🎯 **USER MANAGEMENT FRONTEND** (backend exists, frontend missing)

---

## Part A: Current System State

### A.1 Backend Inventory (17 Modules)

| # | Module | Status | Endpoints | Purpose |
|---|--------|--------|-----------|---------|
| 1 | AuthModule | ✅ OPERATIONAL | Login, profile, logout | Authentication |
| 2 | HealthModule | ✅ OPERATIONAL | Health check | System monitoring |
| 3 | UniversityOperationsModule | ✅ OPERATIONAL | CRUD + indicators + financials | Academic operations tracking |
| 4 | ProjectsModule | ✅ OPERATIONAL | CRUD | Base projects table |
| 5 | ConstructionProjectsModule | ✅ OPERATIONAL | CRUD + milestones + financials | Infrastructure projects |
| 6 | RepairProjectsModule | ⚠️ PARTIAL | CRUD + phases + team | Maintenance projects (UPDATE blocked) |
| 7 | GadModule | ✅ OPERATIONAL | CRUD (8 sub-modules) | Gender parity reporting |
| 8 | **UsersModule** | ✅ **BACKEND ONLY** | CRUD + role mgmt | **User administration (NO FRONTEND)** |
| 9 | UploadsModule | ✅ OPERATIONAL | File upload | File handling |
| 10 | DocumentsModule | ✅ OPERATIONAL | Document CRUD | Document attachments |
| 11 | MediaModule | ✅ OPERATIONAL | Media CRUD | Media attachments |
| 12 | ContractorsModule | ✅ OPERATIONAL | CRUD | Contractors reference data |
| 13 | FundingSourcesModule | ✅ OPERATIONAL | CRUD | Funding sources reference |
| 14 | DepartmentsModule | ✅ OPERATIONAL | CRUD + user assignment | Departments reference |
| 15 | RepairTypesModule | ✅ OPERATIONAL | CRUD | Repair types reference |
| 16 | ConstructionSubcategoriesModule | ✅ OPERATIONAL | CRUD | Construction categories |
| 17 | SettingsModule | ✅ OPERATIONAL | CRUD + key-based access | System configuration |

**Backend Completion:** 100% (all modules implemented)
**Backend Verification:** 2.9.V - npm run build && npm run test passing (Jan 20, 2026)

---

### A.2 Frontend Inventory (Pages)

**Implemented Pages (16 total):**

| Module | Pages | Status |
|--------|-------|--------|
| Auth | login.vue, index.vue, dashboard.vue | ✅ COMPLETE |
| COI (Construction) | coi.vue, coi-new.vue, coi-edit-[id].vue, coi-detail-[id].vue | ✅ COMPLETE |
| Repairs | repairs.vue, repairs-new.vue, repairs-edit-[id].vue, repairs-detail-[id].vue | ⚠️ PARTIAL (UPDATE blocked) |
| University Operations | university-operations.vue, university-operations-new.vue, university-operations-edit-[id].vue, university-operations-detail-[id].vue | ✅ COMPLETE |
| GAD | gad.vue | ✅ COMPLETE |
| **Users** | ❌ **MISSING** | **NO PAGES** |

**Missing Frontend Pages for Users Module:**
- ❌ users.vue (list view)
- ❌ users-new.vue (create form)
- ❌ users-edit-[id].vue (edit form)
- ❌ users-detail-[id].vue (detail view)

---

### A.3 Module Status Matrix

| Module | Backend | Frontend | CRUD Complete | Blockers |
|--------|---------|----------|---------------|----------|
| COI (Construction) | ✅ STABLE | ✅ STABLE | ✅ YES | None |
| Repairs | ✅ OPERATIONAL | ⚠️ PARTIAL | ❌ NO | UPDATE returns HTTP 500 (actual_cost column missing) |
| University Operations | ✅ OPERATIONAL | ✅ STABLE | ✅ YES | None |
| GAD Parity | ✅ OPERATIONAL | ✅ STABLE | ✅ YES | None |
| **Users** | ✅ **OPERATIONAL** | ❌ **MISSING** | ❌ **NO** | **No frontend UI** |

**Kick-off Ready Modules:** 3 out of 4 core operational modules (COI, University Ops, GAD)
**Incomplete Modules:** Repairs (UPDATE blocked), Users (no frontend)

---

## Part B: Repairs Module Blocker Analysis

### B.1 Current Repairs Status (from plan_active.md v8.2)

| Operation | Status | Notes |
|-----------|--------|-------|
| LIST | ✅ WORKING | Displays all repairs |
| CREATE | ✅ WORKING* | *actual_cost ignored (column missing) |
| READ (detail) | ⚠️ PARTIAL | Location fields hidden (adapter issue - FIX APPLIED) |
| UPDATE | ❌ BLOCKED | HTTP 500 - column "actual_cost" does not exist |
| DELETE | ✅ WORKING | Soft delete operational |

### B.2 Identified Fixes (Implementation Complete, Migration Pending)

**Fix #1: Detail View Adapter** ✅ COMPLETE
- Changed from `adaptRepairProject()` to `adaptRepairDetail()`
- File: `pmo-frontend/pages/repairs-detail-[id].vue`
- Status: Code changes applied

**Fix #2: Database Schema** ⏳ MIGRATION PENDING
- Migration file created: `database/migrations/003_add_actual_cost_column.sql`
- Service updated: `repair-projects.service.ts` INSERT statement includes actual_cost
- Status: Awaiting operator execution of migration

**Operator Action Required:**
```bash
psql -d pmo_database -f database/migrations/003_add_actual_cost_column.sql
```

**After Migration:** Repairs module will be fully operational (all CRUD operations working)

---

## Part C: User Management Gap Analysis

### C.1 Backend API (Fully Implemented)

**UsersController Endpoints:**

| Endpoint | Method | Purpose | Auth | Status |
|----------|--------|---------|------|--------|
| GET /users | GET | List all users (paginated) | Admin | ✅ COMPLETE |
| GET /users/roles | GET | Get available roles | Admin | ✅ COMPLETE |
| GET /users/:id | GET | Get single user | Admin | ✅ COMPLETE |
| POST /users | POST | Create new user | Admin | ✅ COMPLETE |
| PATCH /users/:id | PATCH | Update user | Admin | ✅ COMPLETE |
| DELETE /users/:id | DELETE | Soft delete user | Admin | ✅ COMPLETE |
| POST /users/:id/roles | POST | Assign role to user | Admin | ✅ COMPLETE |
| DELETE /users/:id/roles/:roleId | DELETE | Remove role from user | Admin | ✅ COMPLETE |
| POST /users/:id/unlock | POST | Unlock account | Admin | ✅ COMPLETE |
| POST /users/:id/reset-password | POST | Reset user password | Admin | ✅ COMPLETE |

**UsersService Features:**
- ✅ Pagination support (page, limit)
- ✅ Filtering (role, status)
- ✅ Soft delete (deleted_at)
- ✅ Audit fields (created_by, updated_by)
- ✅ Role assignment/removal
- ✅ Account management (unlock, password reset)

**All endpoints are Admin-only** (@Roles('Admin') guard applied)

---

### C.2 Frontend Gap (Completely Missing)

**What's Missing:**

1. **List View (users.vue):**
   - User table with columns: email, name, role, status, actions
   - Pagination controls
   - Search/filter by role, status
   - Create button
   - Edit/Delete action buttons

2. **Create Form (users-new.vue):**
   - Email input (required, validated)
   - First name (required)
   - Last name (required)
   - Password (required, min length validation)
   - Role selection dropdown (from GET /users/roles)
   - Department assignment (optional)
   - Submit button with loading state
   - Toast notification on success/error

3. **Edit Form (users-edit-[id].vue):**
   - Pre-populated form fields (from GET /users/:id)
   - Email (readonly - cannot change)
   - First/last name (editable)
   - Role reassignment dropdown
   - Department reassignment
   - Account actions: Unlock account, Reset password
   - Save button with loading state
   - Toast notification on success/error

4. **Detail View (users-detail-[id].vue):**
   - User information display
   - Role(s) display
   - Department display
   - Account status (active, locked)
   - Created/updated audit info
   - Edit/Delete action buttons

**Frontend Pattern to Follow:** COI module (coi.vue, coi-new.vue, coi-edit-[id].vue, coi-detail-[id].vue)

---

### C.3 User Management Workflow Requirements

**Admin Workflows (Must Support):**

1. **User Onboarding:**
   - Admin creates user account (email, name, password)
   - Admin assigns role (Admin, Staff, GeneralUser)
   - Admin assigns department (optional)
   - User receives credentials (email notification - future enhancement)

2. **Role-Based Access Control:**
   - Admin can view all users
   - Admin can assign/remove roles
   - Admin can view user permissions
   - Staff/GeneralUser cannot access user management

3. **Account Management:**
   - Admin can unlock locked accounts (after failed login attempts)
   - Admin can reset user passwords
   - Admin can deactivate users (soft delete)

4. **User Boundaries:**
   - **Admin:** Full system access, user management, reference data management
   - **Staff:** Module CRUD (COI, Repairs, Uni Ops, GAD), no admin functions
   - **GeneralUser:** Read-only access (view-only dashboards, reports)

**Current Authentication Status:** ✅ WORKING
- Login flow functional (login.vue → /api/auth/login → JWT token)
- Token storage (localStorage - ACE-R2 research confirms this is acceptable for startup)
- JWT guard applied globally (all routes protected by default)
- Role guard functional (@Roles decorator enforced)

---

## Part D: Authentication Lifecycle Review

### D.1 Current Implementation

**Login Flow:**
1. User enters email/password in login.vue
2. POST /api/auth/login
3. Backend validates credentials (bcrypt password hash)
4. Backend returns JWT token + user profile
5. Frontend stores token in localStorage
6. Frontend redirects to dashboard

**Protected Routes:**
- Global JWT guard applied (all routes require authentication)
- Public routes marked with @Public() decorator (health check, login)

**Role-Based Access:**
- @Roles('Admin', 'Staff') decorator on controllers
- RolesGuard checks user.roles against required roles
- SuperAdmin bypass: is_superadmin=true bypasses all role checks

**Token Refresh:** ❌ NOT IMPLEMENTED (future enhancement)
- Current: Token expires, user must re-login
- Future: Refresh token flow (deferred - not blocking startup)

---

### D.2 Auth Hardening Status

**Implemented (ACE-AUTH research, Jan 21, 2026):**
- ✅ Password hashing (bcrypt, cost factor 10)
- ✅ Rate limiting (Throttler module: 3 req/sec, 20 req/10s, 100 req/min)
- ✅ PII redaction in logs (passwords never logged)
- ✅ Generic auth error messages (prevents username enumeration)
- ✅ Failed login tracking (locked after 5 failed attempts)

**Deferred (Future Enhancement):**
- ⏳ OAuth integration (Google SSO - schema ready, not implemented)
- ⏳ Two-factor authentication (2FA)
- ⏳ Session timeout warnings
- ⏳ Password complexity requirements (currently: min 8 chars)

**Verdict:** Authentication is **production-ready for startup launch** (basic security in place, OAuth deferred)

---

## Part E: Next Phase Identification

### E.1 Recommendation: User Management Frontend (Phase 4.0)

**Rationale:**

1. **Backend Complete, Frontend Missing:**
   - UsersModule fully implemented (Jan 15, 2026 - Step 2.5.6)
   - 10 endpoints operational (CRUD + role mgmt + account mgmt)
   - NO frontend UI for user management

2. **Essential for Operational Workflows:**
   - Currently, user creation requires direct database access
   - Admin cannot assign roles via UI
   - No way to unlock accounts or reset passwords
   - No visibility into user list, roles, or status

3. **Follows Established CRUD Pattern:**
   - COI, Repairs, Uni Ops all have list/new/edit/detail pages
   - User Management can follow same pattern (4 pages, ~2-3 hours effort)
   - Reuse existing adapters, toast notifications, modal patterns

4. **Blocks Production Readiness:**
   - Cannot deploy without admin user management capability
   - Security requirement: Admins must be able to manage access
   - Compliance: Audit trail requires UI-driven user actions (not SQL edits)

---

### E.2 Alternative Phases (Considered and Deferred)

**Option 2: Complete Repairs Module (Fix remaining blockers)**
- **Status:** Migration already created, just needs execution
- **Effort:** 5 minutes (operator runs migration script)
- **Verdict:** Lower priority than User Management (Repairs is usable, just missing UPDATE)

**Option 3: Reference Data Management (Contractors, Funding Sources)**
- **Status:** Backend complete, frontend missing
- **Rationale for Deferral:** Less critical than user management (admins can manage via DB temporarily)
- **Verdict:** Defer to Phase 5.0 (after User Management)

**Option 4: Advanced Features (Analytics, Reporting, Dashboards)**
- **Status:** Not in scope for kickoff (deferred - ACE-R3 research)
- **Rationale:** YAGNI - Get core CRUD stable first, iterate based on user feedback
- **Verdict:** Defer to post-launch (Phase 6.0+)

---

### E.3 User Management Implementation Scope (Phase 4.0)

**In Scope:**

1. **Frontend Pages (4 pages):**
   - users.vue (list view with table, pagination, search)
   - users-new.vue (create form)
   - users-edit-[id].vue (edit form + account actions)
   - users-detail-[id].vue (detail view)

2. **Frontend Features:**
   - User CRUD operations (create, read, update, delete)
   - Role assignment dropdown (fetch from GET /users/roles)
   - Department assignment dropdown (fetch from GET /departments)
   - Account actions: Unlock, Reset password
   - Toast notifications (success/error feedback)
   - Loading states (buttons, spinners)
   - Confirmation dialogs (delete user)

3. **Data Adapters:**
   - BackendUser interface (adapters.ts already has this - line 27-35)
   - UIUser interface (adapters.ts already has this - line 53-62)
   - adaptUser function (adapters.ts already has this - line 94-105)
   - reverseAdaptUser function (NEW - for POST/PATCH)

4. **Navigation:**
   - Add "Users" link to sidebar navigation
   - Admin-only (v-if="user.isSuperAdmin || user.roleName === 'Admin'")

**Out of Scope (Deferred):**
- ❌ Email notifications (user creation, password reset)
- ❌ Bulk user import (CSV upload)
- ❌ Advanced search/filtering (full-text search)
- ❌ User activity logs (audit trail dashboard)
- ❌ OAuth UI (Google login button)

---

### E.4 Estimated Effort (Phase 4.0)

| Task | Time | Complexity | Risk |
|------|------|------------|------|
| Create users.vue (list view) | 30 min | LOW | LOW |
| Create users-new.vue (form) | 30 min | LOW | LOW |
| Create users-edit-[id].vue (form + actions) | 45 min | MEDIUM | LOW |
| Create users-detail-[id].vue (read-only) | 20 min | LOW | LOW |
| Add reverseAdaptUser function | 10 min | LOW | LOW |
| Update navigation (sidebar link) | 5 min | LOW | LOW |
| Testing (CRUD cycle, role assignment) | 20 min | N/A | N/A |
| **TOTAL** | **~2.5 hours** | **LOW-MEDIUM** | **LOW** |

**Why Low Risk:**
- Backend endpoints already tested (Step 2.9.3 - Contractors E2E tests pattern)
- Frontend pattern well-established (COI, Repairs, Uni Ops all working)
- Adapters already exist for User type
- No new infrastructure needed

---

## Part F: Kickoff State Confirmation

### F.1 Definition of "Kickoff Ready"

**Criteria:**

1. ✅ **Backend Operational:** 17 modules, 129+ endpoints functional
2. ✅ **Authentication Working:** Login flow, JWT guards, role-based access
3. ⚠️ **Core CRUD Modules:** 3 of 4 fully functional (COI, Uni Ops, GAD)
4. ❌ **Admin Capabilities:** User management missing (blocker)
5. ⚠️ **Data Integrity:** Repairs UPDATE blocked (schema migration pending)

**Overall Verdict:** **80% Ready** (blocker: User Management frontend missing)

---

### F.2 Blockers to Full Kickoff

**BLOCKER #1: User Management Frontend Missing**
- **Severity:** CRITICAL (cannot deploy without admin user management)
- **Impact:** Admins cannot create users, assign roles, or manage accounts
- **Resolution:** Implement Phase 4.0 (User Management Frontend)
- **Effort:** ~2.5 hours

**BLOCKER #2: Repairs UPDATE Endpoint**
- **Severity:** MEDIUM (Repairs is usable, just missing UPDATE)
- **Impact:** Cannot edit actual_cost field on existing repairs
- **Resolution:** Execute migration script (5 minutes)
- **Effort:** Operator action (psql command)

---

### F.3 Post-Kickoff Priorities

**Immediate (Week 1-2):**
1. ✅ Execute Repairs migration (5 min)
2. 🎯 Implement User Management frontend (2.5 hours) **← PHASE 4.0**
3. ✅ Verify all CRUD operations working
4. ✅ User acceptance testing (UAT)

**Short-Term (Week 3-4):**
- Reference Data Management (Contractors, Funding Sources, Departments)
- Enhanced dashboard (project stats, charts)
- Report generation (PDF exports)

**Medium-Term (Month 2-3):**
- OAuth integration (Google SSO)
- Advanced search/filtering
- Bulk operations (import/export)
- Audit trail dashboard

---

## Part G: Governance Compliance Check

### G.1 SOLID Principles

| Principle | Compliance | Notes |
|-----------|------------|-------|
| **Single Responsibility** | ✅ PASS | Each module handles one domain (Users, Repairs, COI, etc.) |
| **Open/Closed** | ✅ PASS | New modules added without modifying existing (17 modules coexist) |
| **Liskov Substitution** | ✅ PASS | DTOs extend base types correctly (UpdateDto extends PartialType) |
| **Interface Segregation** | ✅ PASS | Role-specific endpoints (Admin-only for user mgmt) |
| **Dependency Inversion** | ✅ PASS | Services inject DatabaseService, not direct DB access |

---

### G.2 DRY, KISS, YAGNI, TDA, MIS

| Principle | Compliance | Evidence |
|-----------|------------|----------|
| **DRY (Don't Repeat Yourself)** | ✅ PASS | Adapters reused (adaptProject, adaptUser), pagination pattern consistent |
| **KISS (Keep It Simple)** | ✅ PASS | Flat routes, no over-engineering, direct SQL queries (no ORM complexity) |
| **YAGNI (You Ain't Gonna Need It)** | ✅ PASS | OAuth deferred, bulk import deferred, only kickoff-required features built |
| **TDA (Tell, Don't Ask)** | ✅ PASS | DTOs define contracts, services enforce business logic |
| **MIS (Minimal Info Sharing)** | ✅ PASS | Modules isolated, no cross-domain dependencies (Repairs doesn't depend on COI) |

**Verdict:** ✅ All governance principles satisfied

---

## Part H: Recommended Next Actions

### H.1 Immediate (Operator Actions)

**Action 1: Execute Repairs Migration**
```bash
cd D:\Programming\pmo-dash
psql -d pmo_database -f database/migrations/003_add_actual_cost_column.sql
```
**Expected Output:**
```
ALTER TABLE
 total_repairs | with_actual_cost
---------------+------------------
             5 |                0
COMMIT
```

**Verification:**
1. Navigate to /repairs
2. Edit existing repair
3. Modify actual_cost field
4. Click "Save Changes"
5. Verify: No HTTP 500 error, success toast displays

---

### H.2 Phase 4.0 Planning

**Create Plan Document:** `docs/plan_phase4_usermgmt.md`

**Contents:**
1. **Scope Definition:**
   - 4 frontend pages (users.vue, users-new.vue, users-edit-[id].vue, users-detail-[id].vue)
   - reverseAdaptUser function
   - Navigation link
   - Testing checklist

2. **Implementation Steps:**
   - Step 1: Create users.vue (list view)
   - Step 2: Create users-new.vue (create form)
   - Step 3: Create users-edit-[id].vue (edit form)
   - Step 4: Create users-detail-[id].vue (detail view)
   - Step 5: Add reverseAdaptUser to adapters.ts
   - Step 6: Update navigation
   - Step 7: Verification testing

3. **Success Criteria:**
   - Admin can view all users
   - Admin can create new user
   - Admin can edit user (name, role, department)
   - Admin can delete user (soft delete)
   - Admin can unlock account
   - Admin can reset password
   - Toast notifications display correctly
   - All operations persist to database

4. **Out of Scope:**
   - Email notifications
   - Bulk import/export
   - OAuth UI
   - Advanced search

---

### H.3 Update Planning Artifacts

**File: docs/plan_active.md**

**Changes Required:**

1. **Update Module Status (line 40):**
   ```diff
   | Module/Feature | Status | Issue |
   |----------------|--------|-------|
   | COI (Construction) | ✅ STABLE | None |
   | Repairs LIST | ✅ WORKING | None |
   | Repairs CREATE | ✅ WORKING* | *actual_cost ignored |
   | Repairs DETAIL | ⚠️ PARTIAL | Location fields hidden |
   | Repairs EDIT | ✅ WORKING | None |
   | Repairs UPDATE | ❌ BLOCKED | HTTP 500 error |
   | Repairs DELETE | ✅ WORKING | None |
   + | **Users (Backend)** | ✅ **OPERATIONAL** | **None** |
   + | **Users (Frontend)** | ❌ **MISSING** | **No UI pages** |
   | Routing | ✅ STABLE | None |
   | Authentication | ✅ STABLE | None |
   ```

2. **Add Phase 4.0 Section:**
   ```markdown
   ## 🎯 Phase 4.0: User Management Frontend

   **Goal:** Implement admin user management UI to match backend API
   **Scope:** 4 pages (list, new, edit, detail)
   **Effort:** ~2.5 hours
   **Priority:** CRITICAL (blocks production deployment)
   **Status:** PENDING

   ### Blockers
   - ❌ No frontend UI for user management
   - ✅ Backend fully operational (10 endpoints)

   ### Implementation Plan
   See: docs/plan_phase4_usermgmt.md
   ```

---

## Part I: Non-Goals (Explicitly Out of Scope)

**Do NOT investigate or implement in Phase 4.0:**

- ❌ OAuth integration (Google SSO) - Deferred to Phase 6.0
- ❌ Two-factor authentication (2FA) - Deferred
- ❌ Email notifications (user creation, password reset) - Deferred
- ❌ Bulk user import/export (CSV) - Deferred
- ❌ Advanced search/filtering (full-text search) - Deferred
- ❌ User activity logs (audit trail dashboard) - Deferred
- ❌ Session timeout warnings - Deferred
- ❌ Password complexity requirements - Current is sufficient (min 8 chars)
- ❌ Token refresh flow - Deferred
- ❌ CAPTCHA on login - Not needed for internal system

**Rationale:** YAGNI - Build minimum viable feature set, iterate based on user feedback

---

## Part J: Research Conclusion

### J.1 Findings Summary

**Current State:**
- ✅ Backend: 100% complete (17 modules, 129+ endpoints)
- ✅ Frontend: 80% complete (3 of 4 core modules fully functional)
- ⚠️ Repairs: UPDATE blocked (migration pending execution)
- ❌ User Management: Backend complete, frontend missing

**Kickoff Ready:** 80% (blocker: User Management frontend)

**Identified Next Phase:** 🎯 **Phase 4.0 - User Management Frontend**

**Rationale:**
1. Backend complete, frontend missing (asymmetric gap)
2. Essential for admin workflows (cannot manage users without UI)
3. Blocks production deployment (security requirement)
4. Low effort (~2.5 hours), low risk (established pattern)
5. Follows CRUD pattern from COI, Repairs, Uni Ops modules

---

### J.2 Phase 4.0 Authorization

**Authority:** ACE_BOOTSTRAP v2.4 (Governed AI Execution)
**Phase 1 Status:** ✅ COMPLETE (Research)
**Ready for Phase 2:** ✅ YES (Planning)

**Next Steps:**
1. Update plan_active.md with Phase 4.0 section
2. Create plan_phase4_usermgmt.md (detailed implementation plan)
3. Await operator approval to proceed to Phase 3 (Implementation)

---

**END OF RESEARCH**

---

## Appendices

### Appendix A: Backend API Reference (UsersModule)

**Full endpoint list:** See pmo-backend/src/users/users.controller.ts

**Key DTOs:**
- CreateUserDto: email, password, first_name, last_name, role_id, department_id
- UpdateUserDto: PartialType(CreateUserDto)
- AssignRoleDto: role_id
- QueryUserDto: page, limit, role, status

**Service methods:** See pmo-backend/src/users/users.service.ts

---

### Appendix B: Frontend Adapter Reference

**Existing User Adapters (adapters.ts):**

```typescript
export interface BackendUser {
  id: string
  email: string
  first_name: string
  last_name: string
  is_superadmin: boolean
  permissions: string[]
  role?: { name: string }
}

export interface UIUser {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  isSuperAdmin: boolean
  permissions: string[]
  roleName: string
}

export function adaptUser(backend: BackendUser): UIUser {
  return {
    id: backend.id,
    email: backend.email,
    firstName: backend.first_name,
    lastName: backend.last_name,
    fullName: `${backend.first_name} ${backend.last_name}`,
    isSuperAdmin: backend.is_superadmin,
    permissions: backend.permissions || [],
    roleName: backend.role?.name || '',
  }
}
```

**Required Addition (Phase 4.0):**

```typescript
// NEW - Reverse adapter for POST/PATCH
export function reverseAdaptUser(ui: Partial<UIUser>): Partial<BackendUser> {
  const result: Partial<BackendUser> = {}

  if (ui.email !== undefined) result.email = ui.email
  if (ui.firstName !== undefined) result.first_name = ui.firstName
  if (ui.lastName !== undefined) result.last_name = ui.lastName

  return result
}
```

---

### Appendix C: Git Status (Current State)

**Modified files (unstaged):**
- docs/plan_active.md
- pmo-backend/src/construction-projects/dto/create-construction-project.dto.ts
- pmo-frontend/app.vue
- pmo-frontend/pages/coi-edit-[id].vue
- pmo-frontend/pages/coi-new.vue
- pmo-frontend/pages/repairs-edit-[id].vue
- pmo-frontend/pages/repairs-new.vue
- pmo-frontend/pages/university-operations-new.vue
- pmo-frontend/utils/adapters.ts

**Untracked files:**
- docs/Archives/
- docs/References/
- docs/implementation_phase3_refinements.md
- docs/research_data_display_failures.md
- docs/research_data_mapping_analysis.md
- docs/research_repairs_module_failures.md

**Recent commits:**
- 1fa7e2f - "finally basic crud functional on the frontend module"
- 73d81a2 - "Step 3.0.1 frontend integration with Auth"

**Branch:** pmo-test1
**Main branch:** main

---

**Research Document Version:** 1.0
**Author:** Claude Sonnet 4.5
**Date:** 2026-02-04
**Status:** ✅ COMPLETE - Ready for Phase 2 Planning
