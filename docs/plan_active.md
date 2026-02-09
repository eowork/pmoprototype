# PMO Dashboard: Active Development Plan

**Version:** 12.0.AUTH-USER-MGMT-SPRINT | **Updated:** 2026-02-05
**Status:** 🎯 AUTHENTICATION & USER MANAGEMENT SPRINT (FEB 2-27)
**Kickoff Target:** May 2026 | **Stakeholder Review:** March 18-20, 2026
**Authority:** ACE_BOOTSTRAP v2.4 - Auth/RBAC Sprint Planning

---

## 📍 CURRENT PHASE: AUTHENTICATION & USER MANAGEMENT SPRINT

**Sprint Duration:** Feb 2-27, 2026 (4 weeks)
**Focus:** User Management Frontend + Optional Security Enhancements
**Goal:** Production-ready admin user management for March review

---

## ✅ COMPLETED WORK (Feb 5, 2026)

### Authentication Core (100% Complete)

| Feature | Status | Verified |
|---------|--------|----------|
| Email Login | ✅ WORKING | User confirmed |
| Username Login | ✅ WORKING | User confirmed (proper column) |
| Account Lockout | ✅ WORKING | 5 attempts → 15 min |
| JWT Strategy | ✅ WORKING | Token generation + validation |
| RBAC Guards | ✅ WORKING | @Roles() decorator functional |
| Route Protection | ✅ WORKING | Backend + frontend middleware |

### User Management Backend (100% Complete)

| Endpoint | Status | Functionality |
|----------|--------|---------------|
| `GET /users` | ✅ WORKING | List users (paginated, searchable) |
| `GET /users/:id` | ✅ WORKING | Get user details |
| `POST /users` | ✅ WORKING | Create user |
| `PATCH /users/:id` | ✅ WORKING | Update user |
| `DELETE /users/:id` | ✅ WORKING | Soft delete |
| `GET /users/roles` | ✅ WORKING | Get available roles |
| `POST /users/:id/roles` | ✅ WORKING | Assign role |
| `DELETE /users/:id/roles/:roleId` | ✅ WORKING | Remove role |
| `POST /users/:id/unlock` | ✅ WORKING | Unlock account |
| `POST /users/:id/reset-password` | ✅ WORKING | Reset password |

---

## 🎯 ACTIVE SPRINT: USER MANAGEMENT FRONTEND

### Sprint 1: User Management UI (Feb 2-8) ← CURRENT

**Priority:** P0 (MUST COMPLETE)
**Effort:** 12-16 hours

#### Required Deliverables

**1. User List Page** (3-4 hours) ✅ COMPLETED
- [x] Create `pmo-frontend/pages/users.vue`
- [x] Table with columns: name, email, roles, status, last_login, actions
- [x] Search functionality (name, email, roles)
- [x] Filter by: active status
- [x] Actions: View, Edit, Delete
- [x] "Create User" button
- [x] Added to navigation under "ADMINISTRATION" section
- [x] Created user adapters in `utils/adapters.ts`

**2. User Detail Page** (1-2 hours)
- [ ] Create `pmo-frontend/pages/users-detail-[id].vue`
- [ ] Display user information
- [ ] Display assigned roles
- [ ] Display permissions (derived from roles)
- [ ] Display audit fields (created_at, last_login, etc.)
- [ ] Account status (active, locked)

**3. User Create/Edit Forms** (4-5 hours)
- [ ] Create `pmo-frontend/pages/users-new.vue`
- [ ] Create `pmo-frontend/pages/users-edit-[id].vue`
- [ ] Fields: email, username, first_name, last_name, phone, password (create only)
- [ ] Active status toggle
- [ ] Form validation
- [ ] Success/error toast notifications

**4. Role Assignment UI** (2-3 hours)
- [ ] Role selection interface (multi-select or checkboxes)
- [ ] Display current roles
- [ ] Assign new role action
- [ ] Remove role action
- [ ] SuperAdmin flag handling

**5. Account Management Actions** (2-3 hours)
- [ ] Unlock account button (if locked)
- [ ] Reset password dialog
- [ ] Activate/deactivate user toggle
- [ ] Confirmation dialogs for destructive actions

**Success Criteria:**
- ✅ Admin can list all users
- ✅ Admin can create new users
- ✅ Admin can edit user information
- ✅ Admin can assign/remove roles
- ✅ Admin can unlock accounts
- ✅ Admin can reset passwords
- ✅ All actions have proper authorization (Admin role only)

---

## 🔐 AUTHENTICATION FEATURE ROADMAP

### Phase 1: Core Authentication (COMPLETE ✅)

| Feature | Status | Completed |
|---------|--------|-----------|
| Email + Password Login | ✅ COMPLETE | Feb 5 |
| Username + Password Login | ✅ COMPLETE | Feb 5 |
| JWT Token Generation | ✅ COMPLETE | Jan 2026 |
| Account Lockout | ✅ COMPLETE | Jan 2026 |
| RBAC Guards | ✅ COMPLETE | Jan 2026 |
| Route Protection | ✅ COMPLETE | Jan 2026 |

### Phase 2: User Management (IN PROGRESS ⏳)

| Feature | Status | Target |
|---------|--------|--------|
| User Management Backend API | ✅ COMPLETE | Jan 2026 |
| **User Management Frontend UI** | ⏳ **IN PROGRESS** | **Feb 8** |

### Phase 3: Google OAuth (DEFERRED ⏸️)

| Feature | Status | Target |
|---------|--------|--------|
| Google OAuth Backend Strategy | ⏸️ DEFERRED | Post-March |
| OAuth Endpoints | ⏸️ DEFERRED | Post-March |
| "Sign in with Google" Button | ⏸️ DEFERRED | Post-March |
| Google Cloud Console Setup | ⏸️ DEFERRED | Post-March |

**Google OAuth Details:**

**Current State:**
- Migration file exists: `database/migrations/pmo_migration_google_oauth.sql`
- Backend has google_id detection logic
- Frontend has NO OAuth UI

**Deferred Rationale:**
- External dependency (Google Cloud Console approval)
- 6-10 hours effort
- Not blocking March stakeholder review
- Email/username login sufficient for internal use
- User Management UI higher priority

**Implementation Plan (Post-March):**
1. Week 1: Google Cloud Console setup (external approval)
2. Week 1: Execute google_id migration
3. Week 1: Install OAuth packages (`@nestjs/passport`, `passport-google-oauth20`)
4. Week 2: Implement OAuth strategy and endpoints
5. Week 2: Add "Sign in with Google" button to login page
6. Week 2: Testing and debugging

**Estimated Effort:** 6-10 hours + external dependency time
**Risk:** MEDIUM (external approval delays)
**Timeline:** March/April 2026 (after stakeholder review)

### Phase 4: Security Enhancements (OPTIONAL ⏸️)

| Feature | Status | Target |
|---------|--------|--------|
| Token Refresh Strategy | ⏸️ OPTIONAL | Feb 9-15 |
| Enhanced Audit Logging | ⏸️ OPTIONAL | Feb 9-15 |
| CSRF Hardening | ⏸️ OPTIONAL | Feb 9-15 |
| Session Management | ⏸️ OPTIONAL | Post-March |

---

## 📅 FEBRUARY SPRINT TIMELINE (4 WEEKS)

### Week 1 (Feb 2-8): User Management UI

| Day | Tasks | Hours | Status |
|-----|-------|-------|--------|
| Mon-Tue | User list page + detail page | 4-6 hrs | ⏳ TODO |
| Wed-Thu | Create/edit forms | 4-5 hrs | ⏳ TODO |
| Fri | Role assignment UI | 2-3 hrs | ⏳ TODO |
| Sat | Account management actions | 2-3 hrs | ⏳ TODO |
| Sun | Testing + bug fixes | 2 hrs | ⏳ TODO |

**Target:** User Management UI complete by Feb 8

---

### Week 2 (Feb 9-15): Security Enhancements (OPTIONAL)

**IF Week 1 completes early, proceed with optional enhancements:**

| Enhancement | Priority | Effort | Value |
|-------------|----------|--------|-------|
| Token Refresh | P2 | 8-10 hrs | HIGH - Better UX |
| Enhanced Audit Log | P2 | 4-6 hrs | MEDIUM - Compliance |
| CSP Headers | P3 | 2 hrs | MEDIUM - Security |

**OR fallback to:**
- Additional testing
- Documentation
- Bug fixes
- Early start on integration testing

---

### Week 3 (Feb 16-22): Integration Testing

| Task | Effort | Priority |
|------|--------|----------|
| End-to-end auth flow testing | 3 hrs | P0 |
| RBAC testing (all roles) | 2 hrs | P0 |
| User management workflow testing | 2 hrs | P0 |
| Bug fixes | 3 hrs | P0 |
| Regression testing | 2 hrs | P1 |

**Target:** All critical bugs fixed by Feb 22

---

### Week 4 (Feb 23-27): Stabilization

| Task | Effort | Priority |
|------|--------|----------|
| Final testing | 4 hrs | P0 |
| Documentation update | 2 hrs | P0 |
| Stakeholder demo prep | 2 hrs | P0 |
| Buffer for issues | 4 hrs | - |

**Target:** Production-ready by Feb 27

---

## 🚫 DEFERRED TO POST-MARCH

### University Operations Redesign

**Status:** ⏸️ DEFERRED until after March 18-20 stakeholder review

**Issue:** Current implementation (individual CRUD) does NOT match prototype intent (dashboard/indicators)

**Redesign Effort:** 40-60 hours

**Plan:**
1. March 18-20: Present current implementation to stakeholders
2. March 21-27: Gather feedback on University Operations approach
3. April: Redesign University Operations based on stakeholder direction

**Documentation:** See `docs/research_ace_scope_freeze.md` for detailed analysis

---

### Google OAuth Implementation

**Status:** ⏸️ DEFERRED until March/April 2026

**Rationale:**
- User Management UI higher priority (internal admin workflows)
- External dependency (Google Cloud Console)
- Email/username login sufficient for March review

**Plan:**
1. March: Request Google Cloud Console access
2. March/April: Implement OAuth strategy
3. April: Add "Sign in with Google" button
4. April: Testing

**Effort:** 6-10 hours + external dependency time

---

## 📊 SUCCESS CRITERIA FOR MARCH REVIEW

### Authentication & User Management

**MUST HAVE (Blocking):**
- ✅ Email login working
- ✅ Username login working
- ✅ Admin can manage users via UI
- ✅ Role assignment working
- ✅ Account management (unlock, reset) working

**NICE TO HAVE (Optional):**
- ⏸️ Google OAuth (deferred)
- ⏸️ Token refresh (optional)
- ⏸️ Enhanced audit log (optional)

### Modules for Demo

**PRIMARY (Must Demo):**
- COI (Construction of Infrastructure) - CRUD functional
- Authentication & User Management

**SECONDARY (Demo if time):**
- University Operations (current CRUD implementation with disclaimer)
- Repairs (CRUD functional)
- GAD Parity (CRUD functional)

---

## 🔧 DEVELOPMENT GUIDELINES

### User Management UI Guidelines

**Design Patterns:**
- Follow existing CRUD patterns from COI/Repairs
- Use Vuetify components consistently
- Implement toast notifications for all actions
- Add confirmation dialogs for destructive actions

**Code Structure:**
```
pmo-frontend/pages/
├── users.vue                    # List page
├── users-detail-[id].vue       # Detail page
├── users-new.vue               # Create form
└── users-edit-[id].vue         # Edit form
```

**API Integration:**
```
pmo-frontend/utils/adapters.ts
├── BackendUser interface
├── UIUser interface
├── adaptUser() function
└── reverseAdaptUser() function
```

**Navigation:**
- Add "User Management" link to sidebar (Admin only)
- Protect with auth middleware + role check

---

## 📋 TESTING CHECKLIST

### User Management Testing

**Create User:**
- [ ] Form validation works (required fields, email format)
- [ ] Password hashing works
- [ ] User appears in list after creation
- [ ] Toast notification displays
- [ ] Duplicate email is rejected

**Update User:**
- [ ] Form pre-populates with existing data
- [ ] Changes persist after save
- [ ] Toast notification displays
- [ ] Email uniqueness validated

**Delete User:**
- [ ] Confirmation dialog appears
- [ ] User removed from list (soft delete)
- [ ] User data still in database (deleted_at set)
- [ ] Toast notification displays

**Role Assignment:**
- [ ] Available roles displayed
- [ ] Current roles pre-selected
- [ ] Assign role works
- [ ] Remove role works
- [ ] SuperAdmin flag handled correctly

**Account Management:**
- [ ] Unlock account works (removes account_locked_until)
- [ ] Reset password works (new password hashed)
- [ ] Activate/deactivate works (is_active flag)
- [ ] Actions only visible to Admin

---

## 🎯 NEXT ACTIONS (IMMEDIATE)

### For Operator (This Week)

1. **Create User List Page** (Priority P0)
   - File: `pmo-frontend/pages/users.vue`
   - Reference: Copy structure from `university-operations.vue`
   - API: `GET /api/users`

2. **Create User Forms** (Priority P0)
   - Files: `users-new.vue`, `users-edit-[id].vue`
   - Reference: Copy structure from `university-operations-new.vue`
   - APIs: `POST /api/users`, `PATCH /api/users/:id`

3. **Add Navigation Link** (Priority P0)
   - File: `pmo-frontend/layouts/default.vue`
   - Add "User Management" to sidebar
   - Restrict to Admin role only

4. **Testing** (Priority P0)
   - Test all CRUD operations
   - Test role assignment
   - Test account management actions

---

## 📚 DOCUMENTATION REFERENCE

### Active Documents
- `docs/plan_active.md` - This file
- `docs/research_summary.md` - Authentication implementation details
- `docs/research_auth_strategy_comparison.md` - Username column analysis
- `docs/research_ace_scope_freeze.md` - University Operations mismatch

### API Documentation
- Backend: `http://localhost:3000/api/docs` (Swagger)
- Users endpoints: `pmo-backend/src/users/users.controller.ts`

### Code References
- Auth service: `pmo-backend/src/auth/auth.service.ts`
- Users service: `pmo-backend/src/users/users.service.ts`
- Auth store: `pmo-frontend/stores/auth.ts`

---

## 📊 FEATURE STATUS MATRIX

| Feature Category | Backend | Frontend | Status | Priority |
|------------------|---------|----------|--------|----------|
| **Email Login** | ✅ | ✅ | COMPLETE | P0 ✅ |
| **Username Login** | ✅ | ✅ | COMPLETE | P0 ✅ |
| **Account Lockout** | ✅ | ✅ | COMPLETE | P0 ✅ |
| **RBAC Guards** | ✅ | ✅ | COMPLETE | P0 ✅ |
| **User CRUD API** | ✅ | ❌ | BACKEND ONLY | P0 ⏳ |
| **Role Assignment API** | ✅ | ❌ | BACKEND ONLY | P0 ⏳ |
| **Account Mgmt API** | ✅ | ❌ | BACKEND ONLY | P0 ⏳ |
| **User Mgmt UI** | ✅ | ❌ | MISSING | **P0 ⏳** |
| **Google OAuth** | ⚠️ | ❌ | NOT IMPLEMENTED | P5 ⏸️ |
| **Token Refresh** | ❌ | ❌ | NOT IMPLEMENTED | P2 ⏸️ |

---

**END OF ACTIVE PLAN**

*Last Updated: 2026-02-05*
*Current Sprint: Auth & User Management (Feb 2-27)*
*Next Milestone: User Management UI complete by Feb 8*
*Stakeholder Review: March 18-20, 2026*

