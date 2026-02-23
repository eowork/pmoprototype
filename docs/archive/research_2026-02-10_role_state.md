# Research: Role State Desync, Sidebar Architecture, Permission UI

**Document Version:** 1.0
**Date:** 2026-02-10
**Authority:** ACE Framework v2.4 - Phase 1 Research (Return)
**Status:** COMPLETE - Ready for Phase 2 Plan Update

---

## 1. ROLE & PERMISSION STATE DESYNC ANALYSIS

### 1.1 Observed Symptom

**Scenario:**
```
User: test.admin (has SuperAdmin role)

Timeline:
1. User logs in via /login
2. Dashboard loads
3. Sidebar shows: Main modules + Reference Data
4. Sidebar does NOT show: User Management (Administration section)
5. User performs full browser refresh (F5)
6. Sidebar NOW shows: User Management (Administration section visible)
```

**Conclusion:** Role/permission state not fully resolved at login.

### 1.2 Data Flow Trace

**Login Flow (POST /api/auth/login):**
```
1. Frontend calls api.post('/api/auth/login', { identifier, password })
2. Backend AuthService.login() executes:
   - Validates credentials
   - Queries user_roles for roles and is_superadmin
   - Generates JWT with payload: { sub, email, roles, is_superadmin }
   - Returns:
     {
       access_token: "jwt_token",
       user: {
         id, email, first_name, last_name,
         roles: ["Admin"]  // Array of role names
       }
     }
3. Frontend authStore.login() stores:
   - token → localStorage
   - user → adaptUser(response.user)
4. adaptUser() transforms:
   - isSuperAdmin: backend.is_superadmin  ← MISSING FROM LOGIN RESPONSE
   - permissions: backend.permissions || []  ← MISSING FROM LOGIN RESPONSE
```

**Refresh Flow (GET /api/auth/me):**
```
1. Middleware detects token exists but user not loaded
2. Calls authStore.initialize() → authStore.fetchCurrentUser()
3. Backend AuthService.getProfile() executes:
   - Queries user data
   - Queries user_roles for roles and is_superadmin
   - Queries role_permissions for permissions
   - Returns:
     {
       id, email, username, first_name, last_name, avatar_url,
       roles: [{ id, name }],
       is_superadmin: true,  ← INCLUDED
       permissions: [{ id, name, resource, action }]  ← INCLUDED
     }
4. Frontend stores complete user data
5. usePermissions() composable detects isSuperAdmin correctly
6. Sidebar shows Administration section
```

### 1.3 Root Cause Identified

**Backend Code Analysis:**

File: `pmo-backend/src/auth/auth.service.ts`

**login() method (lines 84-135) - BEFORE FIX:**
```typescript
return {
  access_token: this.jwtService.sign(payload),
  user: {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    roles,  // Array of role names only
  },
};
```

**Missing fields:**
- `is_superadmin` (calculated at line 101, but NOT included in return)
- `permissions` (queried at lines 104-112, but NOT included in return)
- `role` object (for backward compatibility)

**getProfile() method (lines 138-177):**
```typescript
return {
  ...user,
  roles: rolesResult.rows.map((r) => ({ id: r.id, name: r.name })),
  is_superadmin: rolesResult.rows.some((r) => r.is_superadmin),  ← INCLUDED
  permissions: permsResult.rows.map((p) => p.name),  ← INCLUDED
};
```

**Contract Mismatch:** login() returns incomplete user object, getProfile() returns complete user object.

### 1.4 Frontend State Hydration

**File:** `pmo-frontend/stores/auth.ts`

**adaptUser() transformation:**
```typescript
export function adaptUser(backend: BackendUser): UIUser {
  return {
    id: backend.id,
    email: backend.email,
    firstName: backend.first_name,
    lastName: backend.last_name,
    fullName: `${backend.first_name} ${backend.last_name}`,
    isSuperAdmin: backend.is_superadmin,  ← undefined if missing
    permissions: backend.permissions || [],  ← empty array if missing
    roleName: backend.role?.name || '',
  }
}
```

**Impact:**
- `isSuperAdmin` is `undefined` after login
- `permissions` is `[]` (empty array) after login
- usePermissions() composable checks `authStore.user?.isSuperAdmin ?? false`
- Evaluates to `false` → SuperAdmin user treated as non-admin
- Administration section hidden

**After Refresh:**
- Middleware calls initialize() → fetchCurrentUser() → `/api/auth/me`
- Complete user data loaded
- `isSuperAdmin` is `true`
- Administration section visible

### 1.5 Why Refresh Fixes It

**Middleware behavior (pmo-frontend/middleware/auth.ts lines 4-8):**
```typescript
// Initialize auth store only on page refresh (token exists but user not loaded)
// Skip if user already loaded (e.g., after login which populates user directly)
if (authStore.token && !authStore.user) {
  await authStore.initialize()
}
```

**Sequence:**
1. After login: token exists, user exists (but incomplete)
2. Middleware skips initialize() because user exists
3. User data remains incomplete
4. After refresh: token exists, user is null (Pinia state not persisted)
5. Middleware calls initialize() → fetches complete user data
6. User data now complete

### 1.6 Resolution Status

**STATUS:** ✅ FIXED in Phase 2O implementation

**Fix Applied:**
- Modified `auth.service.ts` login() method to include is_superadmin, permissions, and role in response
- Now matches getProfile() contract
- Frontend receives complete user data at login
- No refresh required

---

## 2. SIDEBAR ARCHITECTURE ANALYSIS

### 2.1 Current Structure

**File:** `pmo-frontend/layouts/default.vue`

**Data Structure (lines 33-54):**
```typescript
const mainModules = [...]  // 5 items (flat array)
const referenceData = [...]  // 2 items (flat array)
const administration = computed(() => [...])  // 0-1 items (computed)
```

**Template Structure (lines 128-193) - AFTER Phase 2P:**
```html
<!-- Main Modules - Flat List -->
<v-list nav density="comfortable">
  <v-list-subheader>MODULES</v-list-subheader>
  <v-list-item v-for="item in mainModules" ... />
</v-list>

<!-- Reference Data - Collapsible Dropdown -->
<v-list nav density="comfortable">
  <v-list-group v-model="referenceDataOpen" value="referenceData">
    <template #activator="{ props }">
      <v-list-item v-bind="props" prepend-icon="mdi-database"
        title="Reference Data" color="primary" />
    </template>
    <v-list-item v-for="item in referenceData" :key="item.to" :to="item.to"
      :prepend-icon="item.icon" :title="item.title" color="primary"
      rounded="lg" class="mb-1 ml-2" />  ← PROBLEM: ml-2 class
  </v-list-group>
</v-list>

<!-- Administration - Collapsible Dropdown -->
<v-list nav density="comfortable" v-if="canAccessAdmin">
  <v-list-group v-model="administrationOpen" value="administration">
    <template #activator="{ props }">
      <v-list-item v-bind="props" prepend-icon="mdi-shield-account"
        title="Administration" color="primary" />
    </template>
    <v-list-item v-for="item in administration" :key="item.to" :to="item.to"
      :prepend-icon="item.icon" :title="item.title" color="primary"
      rounded="lg" class="mb-1 ml-2" />  ← PROBLEM: ml-2 class
  </v-list-group>
</v-list>
```

### 2.2 Dropdown UX Issues Identified

**Issue A: Unwanted Indentation**

**Root Cause:**
- Child items have `class="mb-1 ml-2"`
- `ml-2` adds left margin, creating excessive indentation
- v-list-group already provides built-in indentation
- Double indentation makes hierarchy unclear

**Visual Impact:**
```
Reference Data >
    Contractors      ← Too far indented
    Funding Sources  ← Too far indented

Expected:
Reference Data >
  Contractors        ← Natural indentation
  Funding Sources    ← Natural indentation
```

**Issue B: Font Size Inconsistency**

**Current State:**
- Main module items: default v-list-item font size
- Dropdown child items: same default font size
- No visual differentiation between parent and child

**Expected UX Pattern:**
- Parent items: bold or standard font
- Child items: slightly smaller or lighter font
- Clear visual hierarchy

**Vuetify v-list-group Default Behavior:**
- Automatically indents child items
- Child items should NOT have manual margin classes
- Font size should be differentiated via Vuetify density or custom classes

### 2.3 Responsiveness Analysis

**Current Implementation:**

```typescript
const drawer = ref(true)  // Always starts open
```

```html
<v-app-bar color="primary" elevation="2">
  <v-app-bar-nav-icon @click="drawer = !drawer" />
  ...
</v-app-bar>

<v-navigation-drawer v-model="drawer" elevation="1">
  ...
</v-navigation-drawer>
```

**Gaps Identified:**

1. **No Mobile-First Behavior:**
   - Drawer starts `true` on all screen sizes
   - Mobile users see drawer covering content by default
   - Should start `false` on mobile, `true` on desktop

2. **No Persistent Preference:**
   - Drawer state not saved to localStorage
   - User must re-collapse on every page load
   - Inconsistent with dropdown states (which ARE persisted)

3. **No Breakpoint Detection:**
   - No logic to detect screen size
   - Should use Vuetify's `$vuetify.display` or `mobile` prop
   - Should auto-collapse on `< md` breakpoint

**Recommended Pattern:**
```typescript
const { mdAndUp } = useDisplay()
const drawer = ref(mdAndUp.value)  // Open on desktop, closed on mobile

onMounted(() => {
  if (import.meta.client) {
    const saved = localStorage.getItem('sidebar_drawer')
    if (saved !== null) {
      drawer.value = saved === 'true'
    }
  }
})

watch(drawer, (val) => {
  if (import.meta.client) {
    localStorage.setItem('sidebar_drawer', String(val))
  }
})
```

---

## 3. AUTHORIZATION ENFORCEMENT SURVEY

### 3.1 Backend API Authorization

**Current Implementation:**

**File:** `pmo-backend/src/users/users.controller.ts`
```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')  ← Controller-level role requirement
export class UsersController {
  @Get()      // Requires Admin
  @Post()     // Requires Admin
  @Patch()    // Requires Admin
  @Delete()   // Requires Admin
}
```

**File:** `pmo-backend/src/construction-projects/construction-projects.controller.ts`
```typescript
@Controller('construction-projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin', 'Staff')  ← Admin OR Staff
export class ConstructionProjectsController {
  @Get()      // Admin or Staff
  @Post()     // Admin or Staff
  @Patch()    // Admin or Staff
  @Delete()   // Admin or Staff  ← PROBLEM: Staff should NOT delete
}
```

**Gaps Identified:**

1. **No CRUD-Level Differentiation:**
   - All endpoints in a controller have same role requirement
   - No per-endpoint permission checks
   - DELETE should require higher privilege than GET

2. **Too Restrictive for Reads:**
   - UsersController GET endpoints require Admin
   - Staff and Viewer cannot even VIEW user list
   - Should allow read access to lower roles

3. **Too Permissive for Writes:**
   - ConstructionProjectsController allows Staff to DELETE
   - Should restrict DELETE to Admin only
   - No approval workflow enforcement

4. **No Page-Level Permissions:**
   - user_page_permissions table exists but unused
   - No check for can_view, can_add, can_edit, can_delete flags
   - Cannot grant exceptions or overrides

**Required Pattern:**
```typescript
@Roles('Admin', 'Staff', 'Viewer')  // Allow all to access controller
export class ConstructionProjectsController {

  @Get()  // All roles can view
  @Roles('Admin', 'Staff', 'Viewer')
  findAll() { ... }

  @Post()  // Only Admin and Staff can create
  @Roles('Admin', 'Staff')
  create() { ... }

  @Delete()  // Only Admin can delete
  @Roles('Admin')
  remove() { ... }
}
```

**Better Pattern (with page permissions):**
```typescript
@Post()
@UseGuards(JwtAuthGuard, PagePermissionGuard)
@RequirePermission('coi', 'can_add')  // Check page-level permission
create() { ... }
```

### 3.2 Frontend Route Authorization

**Current Implementation:**

**File:** `pmo-frontend/middleware/auth.ts`
```typescript
export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  // Check authentication only
  if (!authStore.isAuthenticated) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }

  // NO authorization checks
  // NO role checks
  // NO page permission checks
})
```

**File:** `pmo-frontend/pages/users/new.vue`
```typescript
definePageMeta({
  middleware: 'auth',  // Only checks authentication
})
// NO role check - any authenticated user can access
```

**Gaps Identified:**

1. **No Role-Based Route Guards:**
   - /users/new should require SuperAdmin or Admin role
   - Currently any authenticated user can access
   - Frontend allows access, backend blocks API call (poor UX)

2. **No Page-Level Access Control:**
   - No check for can_view permission
   - User can navigate to page, then get 403 error
   - Should prevent navigation entirely

3. **No Permission-Aware Navigation:**
   - Sidebar hides items based on permissions (good)
   - But direct URL navigation bypasses this
   - Should have consistent enforcement

**Required Pattern:**
```typescript
// middleware/permission.ts
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  const { canManageUsers } = usePermissions()

  if (to.path.startsWith('/users') && !canManageUsers.value) {
    return navigateTo('/dashboard')
  }
})
```

```typescript
// pages/users/new.vue
definePageMeta({
  middleware: ['auth', 'permission'],
})
```

---

## 4. PERMISSION UI GAP ANALYSIS

### 4.1 Database Schema Analysis

**Available Tables:**

**Table: user_page_permissions**
```sql
CREATE TABLE user_page_permissions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  page_id VARCHAR(100),  -- e.g., 'coi', 'repairs', 'users'
  can_view BOOLEAN DEFAULT TRUE,
  can_add BOOLEAN DEFAULT FALSE,
  can_edit BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  can_approve BOOLEAN DEFAULT FALSE,
  can_assign_staff BOOLEAN DEFAULT FALSE,
  can_manage_permissions BOOLEAN DEFAULT FALSE,
  assigned_by UUID,
  assigned_at TIMESTAMPTZ,
  ...
)
```

**Table: role_permissions**
```sql
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id),
  permission_id UUID REFERENCES permissions(id),
  PRIMARY KEY (role_id, permission_id)
)
```

**Table: permissions**
```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  name VARCHAR(100),  -- e.g., 'user.create', 'coi.delete'
  resource VARCHAR(100),  -- e.g., 'users', 'coi'
  action VARCHAR(50),  -- e.g., 'create', 'delete'
  ...
)
```

### 4.2 Current UI Implementation

**File:** `pmo-frontend/pages/users/detail-[id].vue`

**Lines 284-322: Roles & Permissions Card**
```html
<v-card>
  <v-card-title>Roles & Permissions</v-card-title>
  <v-card-text>
    <!-- READ-ONLY Display -->
    <div class="mb-4">
      <div class="text-caption">Assigned Roles</div>
      <v-chip v-for="role in user.roles" :key="role.id">
        {{ role.name }}
      </v-chip>
    </div>

    <div>
      <div class="text-caption">Permissions (via Roles)</div>
      <v-chip v-for="permission in user.permissions" :key="permission.id">
        {{ permission.resource }}: {{ permission.action }}
      </v-chip>
    </div>
  </v-card-text>
</v-card>
```

**What EXISTS:**
- Read-only display of assigned roles
- Read-only display of permissions (via roles)
- Shows permission resource and action

**What's MISSING:**
- ❌ No UI to assign/revoke page-level permissions
- ❌ No UI to set can_view, can_add, can_edit, can_delete flags
- ❌ No UI to override role defaults
- ❌ No effective permission calculator (role + override)
- ❌ No permission history or audit trail view

### 4.3 Required UI Components

**Component 1: Page Permission Manager (SuperAdmin only)**

**Location:** User detail page, new card section

**Required Features:**
```
┌─ Page Permissions ─────────────────────────────────────┐
│                                                         │
│  Module: Construction Projects (coi)                   │
│  ┌───────────────────────────────────────────────┐    │
│  │ □ Can View    □ Can Add                       │    │
│  │ □ Can Edit    □ Can Delete                    │    │
│  │ □ Can Approve □ Can Assign Staff              │    │
│  └───────────────────────────────────────────────┘    │
│  Default (via role): ✓ View, ✓ Add, ✓ Edit            │
│  Override: ✓ Delete (custom grant)                    │
│                                                         │
│  Module: Repair Projects (repairs)                     │
│  ...                                                    │
│                                                         │
│  [Save Changes]                                        │
└─────────────────────────────────────────────────────────┘
```

**Implementation Requirements:**
- List all available modules/pages
- Show checkboxes for each permission type
- Indicate role defaults vs overrides (different colors)
- Save to user_page_permissions table
- Require SuperAdmin permission

**Component 2: Effective Permissions Viewer**

**Location:** User detail page, below roles card

**Required Features:**
```
┌─ Effective Permissions ───────────────────────────────┐
│                                                         │
│  These are the ACTUAL permissions this user has,       │
│  computed from their role + any custom overrides.      │
│                                                         │
│  Construction Projects:                                │
│    ✓ View (role: Admin)                               │
│    ✓ Add (role: Admin)                                │
│    ✓ Edit (role: Admin)                               │
│    ✓ Delete (override: custom grant)                  │
│                                                         │
│  Repair Projects:                                      │
│    ✓ View (role: Admin)                               │
│    ✗ Delete (role default: no access)                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 5. SCOPE CONTROL

### 5.1 MUST FIX Before Kickoff (P0)

| Item | Effort | Status | Rationale |
|------|--------|--------|-----------|
| Fix login response to include is_superadmin and permissions | 30 min | ✅ DONE | Fixes role desync |
| Implement sidebar dropdown for Reference Data | 2 hrs | ✅ DONE | UX clarity |
| **FIX sidebar dropdown indentation (remove ml-2)** | **15 min** | **❌ TODO** | **UX consistency** |
| **FIX sidebar responsiveness (mobile-first)** | **1 hr** | **❌ TODO** | **Mobile UX** |
| **Add backend API CRUD permission guards** | **4-6 hrs** | **❌ TODO** | **Security requirement** |
| **Add frontend route permission guards** | **2-3 hrs** | **❌ TODO** | **UX consistency** |

**Total P0 Remaining:** 8-11 hours

### 5.2 SHOULD FIX If Time Allows (P1)

| Item | Effort | Priority | Rationale |
|------|--------|----------|-----------|
| Permission assignment UI | 6-8 hrs | P1 | Enables granular control |
| Effective permission viewer | 2 hrs | P1 | Transparency |
| Username UX clarity (Auto → icon) | 30 min | ✅ DONE | Clarity |
| Sidebar state persistence | 1 hr | P1 | UX convenience |

**Total P1 Effort:** 9-11 hours

### 5.3 DEFERRED Post-Kickoff (P2)

| Item | Priority | Rationale |
|------|----------|-----------|
| Role permission templates | P2 | Convenience |
| Audit log for permission changes | P2 | Compliance (nice-to-have) |
| Bulk permission assignment | P3 | Scaling feature |
| Approval workflow enforcement | P2 | Process automation |

---

## 6. INTEGRATION WITH PRIOR RESEARCH

### 6.1 Reconciliation with Previous Findings

**Previous Research (research_username_ux_authorization_feb10.md):**
- Identified need for API permission guards
- Identified need for page-level authorization
- Did NOT identify role state desync issue
- Did NOT identify sidebar UX issues

**New Findings:**
- Role state desync at login (FIXED in Phase 2O)
- Sidebar dropdown UX issues (NEW - indentation, font size)
- Sidebar responsiveness gaps (NEW - mobile behavior)
- Permission UI gap (previously identified, now detailed)
- Authorization enforcement gaps (NEW - specific controller analysis)

**Unified Position:**
- API permission guards remain P0
- Sidebar dropdown UX fix is NEW P0 item (quick fix, high impact)
- Sidebar responsiveness is NEW P0 item (mobile users)
- Frontend route guards are NEW P0 item (UX consistency)
- Permission UI remains P1 (not blocking kickoff)

### 6.2 Updated Priority Matrix

| Finding | Previous Priority | New Priority | Change Reason |
|---------|-------------------|--------------|---------------|
| API Permission Guards | P0 | P0 | No change |
| Username UX | P0 | ✅ DONE | Completed Phase 2K |
| Role State Desync | Not identified | ✅ DONE | Completed Phase 2O |
| Sidebar Dropdown Structure | Not identified | ✅ DONE | Completed Phase 2P |
| **Sidebar Dropdown UX** | **Not identified** | **P0** | **NEW - indentation fix** |
| **Sidebar Responsiveness** | **Not identified** | **P0** | **NEW - mobile UX** |
| **Frontend Route Guards** | **Not identified** | **P0** | **NEW - consistency** |
| Permission UI | P1 | P1 | No change |

---

## 7. VERIFICATION METHODS

### 7.1 Sidebar Dropdown UX Verification

**Test Steps:**
1. Login as Admin user
2. Navigate to dashboard
3. Expand Reference Data dropdown
4. Measure indentation of child items
5. Compare font size of parent vs child
6. Verify visual hierarchy is clear

**Expected Result:**
- Child items indented naturally (no ml-2)
- Font size consistent with Vuetify defaults
- Clear visual hierarchy

### 7.2 Sidebar Responsiveness Verification

**Test Steps:**
1. Open app on mobile device (< 768px width)
2. Verify drawer starts closed
3. Tap hamburger menu
4. Verify drawer opens over content
5. Close drawer, navigate to another page
6. Verify drawer state persists
7. Resize to desktop (> 960px)
8. Verify drawer opens automatically

**Expected Result:**
- Mobile: drawer closed by default
- Desktop: drawer open by default
- State persists across navigation
- Smooth transitions

### 7.3 API Permission Guard Verification

**Test Cases:**

| Endpoint | User Role | Expected |
|----------|-----------|----------|
| GET /api/users | Staff | 200 Success |
| POST /api/users | Staff | 403 Forbidden |
| POST /api/users | SuperAdmin | 200 Success |
| DELETE /api/construction-projects/:id | Staff | 403 Forbidden |
| DELETE /api/construction-projects/:id | Admin | 200 Success |
| GET /api/construction-projects | Viewer | 200 Success |
| POST /api/construction-projects | Viewer | 403 Forbidden |

### 7.4 Frontend Route Guard Verification

**Test Cases:**

| Route | User Role | Expected |
|-------|-----------|----------|
| /users | Staff | Redirect to /dashboard |
| /users | SuperAdmin | Load page |
| /users/new | Admin | Redirect to /dashboard |
| /users/new | SuperAdmin | Load page |
| /coi | Viewer | Load page (read-only UI) |
| /coi/new | Viewer | Redirect to /dashboard |

---

## 8. SUMMARY

### 8.1 Key Findings

**A. Sidebar Dropdown UX Issues (NEW):**
- Root Cause: Child items have `class="ml-2"` causing double indentation
- Impact: Unclear visual hierarchy, inconsistent with UX patterns
- Fix: Remove ml-2 class from child items (15 min)

**B. Sidebar Responsiveness Gaps (NEW):**
- Root Cause: Drawer defaults to `true` on all screen sizes, no persistence
- Impact: Mobile users see drawer covering content by default
- Fix: Implement mobile-first behavior with localStorage persistence (1 hr)

**C. User Management Authorization UI (CONFIRMED):**
- Root Cause: No UI to manage page-level permissions despite database tables existing
- Impact: Cannot assign granular permissions, only role-based access
- Fix: Build page permission manager UI (6-8 hrs) - DEFERRED to P1

**D. Authorization Enforcement Gaps (NEW):**
- Root Cause: No CRUD-level differentiation in API guards, no frontend route guards
- Impact: Security gaps (Staff can delete), poor UX (access then 403)
- Fix: Add per-endpoint role decorators (4-6 hrs) + frontend permission middleware (2-3 hrs)

### 8.2 Immediate Actions Required (P0)

1. **Fix sidebar dropdown indentation** (15 minutes)
   - Remove `class="ml-2"` from v-list-group child items
   - Verify natural indentation from v-list-group

2. **Implement sidebar responsiveness** (1 hour)
   - Use `useDisplay()` to detect mobile
   - Implement localStorage persistence for drawer state
   - Default closed on mobile, open on desktop

3. **Add backend API CRUD guards** (4-6 hours)
   - Per-endpoint @Roles decorators
   - Differentiate GET/POST/PATCH/DELETE permissions
   - Test with multiple roles

4. **Add frontend route permission guards** (2-3 hours)
   - Create permission middleware
   - Add to protected routes (users, etc.)
   - Consistent with sidebar visibility

**Total P0 Effort:** 8-11 hours

### 8.3 Governance Alignment

- SuperAdmin governance already implemented (prevent self-assignment, last admin removal)
- API guards align with government MIS least-privilege principle
- Permission tables support future granular delegation
- Audit trail exists for all critical operations
- Mobile responsiveness aligns with accessibility requirements

---

**END OF RESEARCH DOCUMENT**

*Next Step: Update Phase 2 Plan with optimized, integrated solution set.*
