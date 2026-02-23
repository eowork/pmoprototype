# Authorization and UI Navigation Strategy - Comprehensive Research

**Date:** 2026-02-10
**Phase:** ACE Framework Phase 1 (Research)
**Authority:** Senior Software Architect and Access Control Specialist
**Status:** RESEARCH IN PROGRESS

---

## EXECUTIVE SUMMARY

This research defines a governed, kickoff-safe authorization and UI navigation strategy for the PMO Dashboard that provides granular access control without overengineering. The design leverages existing database schema (users, roles, permissions, user_page_permissions) and establishes clear permission boundaries suitable for government MIS deployment.

**Key Deliverables:**
1. Three-tier authorization model (Role → Page → Feature)
2. CRUD permission matrix with UI/Route/API enforcement points
3. Reference Data sidebar dropdown structure
4. User Management progress tracking artifact
5. Scope-controlled implementation roadmap

---

## 1. AUTHORIZATION MODEL DESIGN

### 1.1 Permission Hierarchy (User → Role → Permission)

**Hierarchy Flow:**
```
User
  └─> user_roles (many-to-many)
       └─> Role
            └─> role_permissions (many-to-many)
                 └─> Permission (resource + action)
  └─> user_page_permissions (direct override, many-to-many)
       └─> Page-specific CRUD flags
```

**Authorization Resolution Order:**

1. **SuperAdmin Check** - If `user_roles.is_superadmin = TRUE`, bypass all checks
2. **Direct User Permission** - Check `user_page_permissions` for user-specific overrides
3. **Role-Inherited Permission** - Check `role_permissions` via `user_roles`
4. **Default Deny** - If none of the above, deny access

**Table Participation:**

| Table | Role in Authorization | Example |
|-------|----------------------|---------|
| `users` | Identity anchor | user_id = "uuid-123" |
| `roles` | Permission grouping | role = "Admin", "Staff", "Viewer" |
| `user_roles` | User-to-role mapping + SuperAdmin flag | user "uuid-123" has role "Admin" |
| `permissions` | Action definitions | resource="coi", action="create" |
| `role_permissions` | Role-to-permission mapping | "Admin" role has "coi:create" permission |
| `user_page_permissions` | Per-user overrides for specific pages | user "uuid-456" can_add=TRUE on "repairs" |
| `user_departments` | Department-based scoping (DEFERRED) | user in "Engineering" dept sees only relevant projects |

---

### 1.2 Three-Tier Permission Model

**Tier 1: Role-Based Access (REQUIRED for Kickoff)**

Coarse-grained authorization based on role membership.

| Role | Description | Typical Use Case |
|------|-------------|------------------|
| SuperAdmin | Full system access, bypasses all checks | System administrator |
| Admin | Manage all modules, full CRUD | Department heads, PMO director |
| Staff | Limited to assigned modules, CRU only | Project coordinators, engineers |
| Viewer | Read-only access, no modifications | Auditors, external reviewers |

**Implementation:**
- Frontend: Check `user.roles` array on component mount
- Backend: Use `@Roles('Admin', 'SuperAdmin')` decorator

**Tier 2: Page-Level Permissions (SHOULD HAVE if Time)**

Granular control over which pages a user can access.

**Schema:** `user_page_permissions` table
```sql
user_id: UUID
page_id: VARCHAR(100)  -- e.g., "coi", "repairs", "users"
can_view: BOOLEAN      -- Can navigate to the page
can_add: BOOLEAN       -- Can create new records
can_edit: BOOLEAN      -- Can modify existing records
can_delete: BOOLEAN    -- Can remove records
can_approve: BOOLEAN   -- Can approve submissions (future)
can_assign_staff: BOOLEAN     -- Can assign users to items (future)
can_manage_permissions: BOOLEAN  -- Can modify permissions (future)
```

**Example Use Case:**
- User "Juan Dela Cruz" (Staff) can view COI but cannot delete projects
- User "Maria Santos" (Admin) has full access to Repairs but no access to User Management

**Implementation:**
- Frontend: Middleware checks `user_page_permissions` before route entry
- Backend: Guards check permissions before executing actions

**Tier 3: Feature-Level Permissions (DEFERRED)**

Highly granular control over specific features within a module.

**Examples:**
- Approve project budget (separate from general "edit")
- Export reports to Excel
- Assign contractors to projects
- Override financial calculations

**Rationale for Deferral:** Not required for kickoff. Adds complexity without immediate business value.

---

### 1.3 Admin vs Staff vs SuperAdmin Boundaries

**SuperAdmin:**
- **Scope:** Unrestricted access to all modules, all actions
- **Bypass:** Skips all permission checks (database function `is_user_superadmin()`)
- **Use Case:** System administrators, IT support
- **UI Behavior:** All buttons visible, all routes accessible
- **Count:** 1-2 users maximum

**Admin:**
- **Scope:** Full CRUD access to all assigned modules
- **Restrictions:** Cannot access User Management unless explicitly granted
- **Use Case:** Department heads, PMO director, senior staff
- **UI Behavior:** Create/Edit/Delete buttons visible in assigned modules
- **Count:** 5-10 users

**Staff:**
- **Scope:** Create, Read, Update (no Delete) in assigned modules
- **Restrictions:** Cannot delete records, cannot access User Management
- **Use Case:** Project coordinators, engineers, data encoders
- **UI Behavior:** Create/Edit buttons visible, Delete button hidden
- **Count:** 20-50 users

**Viewer:**
- **Scope:** Read-only access to all modules
- **Restrictions:** Cannot create, edit, or delete any records
- **Use Case:** External auditors, stakeholders, reviewers
- **UI Behavior:** All action buttons hidden, view-only tables
- **Count:** 10-20 users

---

### 1.4 What is REQUIRED vs Optional for Kickoff

**REQUIRED (P0 - Blocking):**

1. **Role-Based UI Visibility (Tier 1)**
   - Hide/show Create button based on role
   - Hide/show Edit button based on role
   - Hide/show Delete button based on role
   - Hide User Management sidebar item for non-Admin roles

2. **Backend Role Guards**
   - Validate user role before executing CRUD operations
   - Return 403 Forbidden if role insufficient

3. **SuperAdmin Bypass**
   - SuperAdmin sees all buttons, accesses all routes
   - Implemented via `is_superadmin` flag in `user_roles`

**OPTIONAL (P1 - Should Have):**

1. **Page-Level Permissions (Tier 2)**
   - Check `user_page_permissions` before route entry
   - Allow per-user overrides (e.g., Staff user with Admin access to specific module)

2. **Breadcrumb Navigation**
   - Visual context indicator (Module > Page > Action)
   - Clickable navigation to parent levels

3. **Permission Audit Log**
   - Track when permissions are checked and decisions made
   - Useful for debugging access issues

**DEFERRED (P2 - Post-Kickoff):**

1. **Feature-Level Permissions (Tier 3)**
   - Granular control over specific actions (approve, export, assign)

2. **Permission Management UI**
   - Admin interface to assign/revoke user permissions
   - Currently managed via database

3. **Department-Based Filtering**
   - Filter projects by user's department membership

4. **Dynamic Role Creation**
   - UI to create custom roles beyond predefined set

---

## 2. CRUD PERMISSION MATRIX

### 2.1 CRUD Action Definitions

| Action | Definition | UI Element | Backend Method |
|--------|-----------|------------|----------------|
| **Create** | Add new record to system | "New" button | POST /api/module |
| **Read** | View existing records | List table, detail page | GET /api/module, GET /api/module/:id |
| **Update** | Modify existing record | "Edit" button, edit form | PATCH /api/module/:id |
| **Delete** | Remove record (soft delete) | "Delete" button/icon | DELETE /api/module/:id |

---

### 2.2 Permission-to-UI Mapping

**UI Enforcement Points:**

| Permission | UI Visibility | UI Interaction | Component |
|------------|---------------|----------------|-----------|
| `can_view` | Page accessible | Can navigate to module | Middleware, Sidebar |
| `can_add` | "New" button shown | Can open create form | List page action bar |
| `can_edit` | "Edit" button shown | Can open edit form | List page row actions, Detail page |
| `can_delete` | "Delete" button shown | Can trigger delete dialog | List page row actions |

**Example: COI List Page**

```javascript
// Conceptual - not implementation
<template>
  <v-btn v-if="permissions.can_add" @click="createNew">
    New Project
  </v-btn>

  <v-data-table>
    <template v-slot:item.actions="{ item }">
      <v-btn v-if="permissions.can_edit" @click="editItem(item)">Edit</v-btn>
      <v-btn v-if="permissions.can_delete" @click="deleteItem(item)">Delete</v-btn>
    </template>
  </v-data-table>
</template>

<script>
const permissions = computed(() => {
  if (user.isSuperAdmin) return { can_add: true, can_edit: true, can_delete: true }
  if (user.role === 'Admin') return { can_add: true, can_edit: true, can_delete: true }
  if (user.role === 'Staff') return { can_add: true, can_edit: true, can_delete: false }
  if (user.role === 'Viewer') return { can_add: false, can_edit: false, can_delete: false }
  return { can_add: false, can_edit: false, can_delete: false }
})
</script>
```

---

### 2.3 Permission-to-Route Mapping

**Route Guard Enforcement:**

| Route Pattern | Required Permission | Redirect on Fail |
|---------------|---------------------|------------------|
| `/module` | `can_view` | `/unauthorized` |
| `/module/new` | `can_view` + `can_add` | `/module` |
| `/module/edit-:id` | `can_view` + `can_edit` | `/module` |
| `/module/detail-:id` | `can_view` | `/unauthorized` |

**Example: Middleware Check (Conceptual)**

```javascript
// File: middleware/permission.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()
  const user = authStore.user

  // Extract module from route
  const module = to.path.split('/')[1] // e.g., "coi" from "/coi/new"

  // SuperAdmin bypass
  if (user.isSuperAdmin) return

  // Check page-level permission
  const permission = await getPagePermission(user.id, module)

  if (!permission.can_view) {
    return navigateTo('/unauthorized')
  }

  // Check action-specific permission
  if (to.path.includes('/new') && !permission.can_add) {
    return navigateTo(`/${module}`)
  }

  if (to.path.includes('/edit') && !permission.can_edit) {
    return navigateTo(`/${module}`)
  }
})
```

---

### 2.4 Permission-to-API Mapping

**Backend Enforcement:**

| HTTP Method | Action | Backend Decorator | Response on Fail |
|-------------|--------|-------------------|------------------|
| GET /module | Read | `@Roles('Admin', 'Staff', 'Viewer')` | 403 Forbidden |
| POST /module | Create | `@Roles('Admin', 'Staff')` | 403 Forbidden |
| PATCH /module/:id | Update | `@Roles('Admin', 'Staff')` | 403 Forbidden |
| DELETE /module/:id | Delete | `@Roles('Admin')` | 403 Forbidden |

**Example: Backend Controller**

```typescript
// File: construction-projects.controller.ts
@Controller('construction-projects')
@UseGuards(AuthGuard, RolesGuard)
export class ConstructionProjectsController {

  @Get()
  @Roles('Admin', 'Staff', 'Viewer')
  findAll() {
    // All authenticated users with any role can view
  }

  @Post()
  @Roles('Admin', 'Staff')
  create() {
    // Only Admin and Staff can create
  }

  @Patch(':id')
  @Roles('Admin', 'Staff')
  update() {
    // Only Admin and Staff can update
  }

  @Delete(':id')
  @Roles('Admin')
  delete() {
    // Only Admin can delete
  }
}
```

---

### 2.5 Complete Permission Matrix

**Kickoff Model (Role-Based):**

| Module | SuperAdmin | Admin | Staff | Viewer |
|--------|------------|-------|-------|--------|
| Dashboard | CRUD | CRUD | CRUD | R |
| COI | CRUD | CRUD | CRU | R |
| Repairs | CRUD | CRUD | CRU | R |
| University Ops | CRUD | CRUD | CRU | R |
| Contractors | CRUD | CRUD | R | R |
| Funding Sources | CRUD | CRUD | R | R |
| Users | CRUD | - | - | - |
| GAD Parity | CRUD | CRUD | CRU | R |

**Legend:**
- C = Create (can_add)
- R = Read (can_view)
- U = Update (can_edit)
- D = Delete (can_delete)
- `-` = No access

**Special Cases:**

1. **User Management:**
   - Only SuperAdmin has full access
   - Admin has no access by default (security)
   - Staff/Viewer have no access

2. **Reference Data (Contractors, Funding Sources):**
   - Staff can only view (reference data should be stable)
   - Only Admin can modify reference data

---

## 3. SIDEBAR DROPDOWN STRATEGY

### 3.1 Current Sidebar Structure (Flat)

**Existing Implementation:**
```
Dashboard
Construction of Infrastructure (COI)
Repairs
University Operations
Contractors
Funding Sources
User Management
GAD Parity
```

**Issues:**
- No logical grouping
- Reference data mixed with operational modules
- Scales poorly (17 modules planned)

---

### 3.2 Proposed Sidebar Structure (Grouped)

**Hierarchical Organization:**

```
Dashboard

Projects (dropdown)
├─ Construction of Infrastructure
├─ Repairs
└─ University Operations

Reference Data (dropdown)
├─ Contractors
├─ Funding Sources
├─ Construction Subcategories (future)
├─ Repair Types (future)
└─ Departments (future)

GAD Parity (dropdown)
├─ Student Parity
├─ Faculty Parity
├─ Staff Parity
├─ PWD Parity
├─ Indigenous Parity
├─ GPB Accomplishments
└─ Budget Plans

Administration (dropdown)
├─ User Management
├─ Roles & Permissions (future)
└─ System Settings (future)
```

---

### 3.3 Permission-Based Visibility Rules

**Group-Level Visibility:**

| Sidebar Group | Visible to Roles |
|---------------|------------------|
| Dashboard | All |
| Projects | All (individual modules may be restricted) |
| Reference Data | All (individual modules may be restricted) |
| GAD Parity | All |
| Administration | Admin, SuperAdmin only |

**Module-Level Visibility (within group):**

```javascript
// Conceptual - not implementation
const sidebarItems = computed(() => {
  const user = authStore.user

  return [
    { label: 'Dashboard', to: '/dashboard', visible: true },
    {
      label: 'Projects',
      children: [
        { label: 'COI', to: '/coi', visible: hasPermission(user, 'coi', 'view') },
        { label: 'Repairs', to: '/repairs', visible: hasPermission(user, 'repairs', 'view') },
        { label: 'University Ops', to: '/university-operations', visible: hasPermission(user, 'university-operations', 'view') },
      ],
    },
    {
      label: 'Reference Data',
      children: [
        { label: 'Contractors', to: '/contractors', visible: hasPermission(user, 'contractors', 'view') },
        { label: 'Funding Sources', to: '/funding-sources', visible: hasPermission(user, 'funding-sources', 'view') },
      ],
    },
    {
      label: 'Administration',
      visible: ['Admin', 'SuperAdmin'].includes(user.role),
      children: [
        { label: 'User Management', to: '/users', visible: user.isSuperAdmin },
      ],
    },
  ]
})
```

---

### 3.4 UX Rationale for Grouping

**Benefits:**

1. **Reduced Cognitive Load:** 4 groups vs 10+ flat items
2. **Logical Categorization:** Projects vs Reference Data vs Admin
3. **Scalability:** Can add modules without sidebar bloat
4. **Permission Clarity:** Groups signal access level (Admin section visible only to admins)
5. **Industry Standard:** Common pattern in enterprise systems

**Comparison:**

| Pattern | Item Count (Current) | Item Count (17 modules) | Visual Scan Time |
|---------|---------------------|------------------------|------------------|
| Flat | 8 items | 17 items | High |
| Grouped | 4 groups | 4 groups | Low |

---

## 4. UI/UX ALIGNMENT NOTES

### 4.1 Reference Site Analysis

**Note:** The reference site (https://mywork.carsu.edu.ph/profile) could not be accessed during research. The following are general government MIS UI/UX principles that should be applied:

**Principle 1: Context Awareness**
- User always knows "where they are" in the system
- Implementation: Breadcrumb navigation, page titles with module context

**Principle 2: Role Visibility**
- User can see their own role and permissions
- Implementation: Profile dropdown shows role badge, permission indicators

**Principle 3: Action Feedback**
- Clear indication when actions succeed or fail
- Implementation: Toast notifications, loading states, confirmation dialogs

**Principle 4: Consistent Navigation**
- Same navigation pattern across all modules
- Implementation: Standardized back buttons, breadcrumbs, sidebar structure

**Principle 5: Permission Transparency**
- If action is disabled, user knows why
- Implementation: Tooltips on disabled buttons ("Requires Admin role")

---

### 4.2 Profile Page Requirements

**User Profile Should Display:**

1. **Identity Information:**
   - Full name
   - Email
   - Avatar (if available)
   - Employee/User ID

2. **Role & Permission Summary:**
   - Current role(s) displayed as chips
   - SuperAdmin badge (if applicable)
   - Department membership (if implemented)

3. **Access Summary:**
   - List of accessible modules
   - Permission level for each module (View, Edit, Admin)
   - Last login timestamp

4. **Quick Actions:**
   - Change password
   - Update profile information
   - View audit log (own actions)

**Example Layout:**

```
┌─────────────────────────────────────────┐
│  [Avatar]  Juan Dela Cruz               │
│            juan.delacruz@carsu.edu.ph   │
│            [Admin] [Engineering Dept]   │
├─────────────────────────────────────────┤
│  Role: Admin                            │
│  Department: Engineering                │
│  Last Login: Feb 10, 2026 10:30 AM     │
├─────────────────────────────────────────┤
│  Accessible Modules:                    │
│  • COI (Admin)                          │
│  • Repairs (Admin)                      │
│  • Contractors (View)                   │
├─────────────────────────────────────────┤
│  [Change Password] [Edit Profile]      │
└─────────────────────────────────────────┘
```

---

### 4.3 Navigation Context Indicators

**Breadcrumb Pattern:**

```
Home > Projects > Construction of Infrastructure > Project Details > Edit Project
```

**Benefits:**
- User knows exact location in hierarchy
- Can click any level to navigate back
- Provides visual context

**Implementation:**
- Component: `components/Breadcrumb.vue`
- Placed below header, above page content
- Dynamically generated from route path

**Page Title Pattern:**

```
[Module Icon] Module Name / Page Type
              Project Code (if detail/edit page)
```

**Example:**
```
🏗️ Construction of Infrastructure / Edit Project
   CP-2026-001 - New Library Building
```

---

## 5. USER MANAGEMENT PROGRESS TRACKING

### 5.1 Progress Tracking Approach

**Artifact-Based Tracking (RECOMMENDED):**

Maintain a structured document that tracks implementation status of User Management features.

**Location:** `docs/user_management_progress.md`

**Structure:**
```markdown
# User Management Implementation Progress

Last Updated: 2026-02-10

## Backend API

| Endpoint | Status | Tested | Notes |
|----------|--------|--------|-------|
| GET /users | Complete | Yes | Pagination working |
| POST /users | Complete | Yes | Role assignment included |
| PATCH /users/:id | Complete | Yes | Email change restricted |
| DELETE /users/:id | Complete | Yes | Soft delete |
| POST /users/:id/unlock | Complete | Yes | Resets lockout |
| POST /users/:id/reset-password | Complete | Yes | Admin-initiated |
| GET /users/roles | Complete | Yes | Returns available roles |

## Frontend Pages

| Page | Status | Route | Notes |
|------|--------|-------|-------|
| List | Complete | /users | Search/filter working |
| Detail | Complete | /users/detail-:id | All fields displayed |
| Create | Complete | /users/new | Form validation complete |
| Edit | Complete | /users/edit-:id | Role assignment UI done |

## Features

| Feature | Status | Priority | Target |
|---------|--------|----------|--------|
| Role assignment | Complete | P0 | Week 1 |
| Account unlock | Complete | P0 | Week 1 |
| Password reset | Complete | P0 | Week 1 |
| Permission management UI | Missing | P2 | Post-kickoff |
| Department assignment | Missing | P2 | Post-kickoff |
| Audit log UI | Missing | P2 | Post-kickoff |
```

---

### 5.2 Status Definitions

| Status | Definition | Visual Indicator |
|--------|-----------|------------------|
| Complete | Implemented, tested, working | Green checkmark |
| In Progress | Currently being developed | Yellow in-progress |
| Missing | Not yet started | Red X |
| Deferred | Intentionally postponed | Gray strike-through |
| Blocked | Waiting on dependency | Red exclamation |

---

### 5.3 Update Cadence

**When to Update:**
- After completing any user management feature
- Before/after sprint planning meetings
- When status changes (e.g., In Progress → Complete)

**Who Updates:**
- Developer implementing the feature
- Architect during sprint reviews

**Review Frequency:**
- Weekly during active development
- Monthly during maintenance

---

## 6. SCOPE CONTROL

### 6.1 MUST IMPLEMENT Before Kickoff (P0)

**Critical Path Items:**

| Item | Effort | Rationale |
|------|--------|-----------|
| Fix COI/Repairs goBack() routes | 10 min | Blocking bug (404 errors) |
| Role-based button visibility | 4-6 hrs | Security requirement |
| Backend role guards validation | 2 hrs | Prevent unauthorized API access |
| SuperAdmin bypass implementation | 1 hr | Administrative necessity |
| Sidebar "Administration" group | 1 hr | Restrict User Management access |

**Total Effort:** 8-10 hours

**Target:** Week 1 (Feb 11-12, 2026)

---

### 6.2 SHOULD IMPLEMENT If Time Allows (P1)

**High-Value Enhancements:**

| Item | Effort | Rationale |
|------|--------|-----------|
| Breadcrumb navigation component | 2-3 hrs | Improves context awareness |
| "Save & Return to List" button | 1-2 hrs | Reduces navigation friction |
| Page-level permission checks | 4-6 hrs | Enhanced security beyond roles |
| Sidebar Reference Data dropdown | 2-3 hrs | Improves scalability |
| Profile page role display | 1-2 hrs | Permission transparency |

**Total Effort:** 10-16 hours

**Target:** Week 2 (Feb 16-22, 2026)

---

### 6.3 DEFERRED Post-Kickoff (P2)

**Future Enhancements:**

| Item | Effort | Rationale for Deferral |
|------|--------|------------------------|
| Permission management UI | 20-30 hrs | Admin can manage via database initially |
| Feature-level permissions (Tier 3) | 15-20 hrs | Not required for basic operations |
| Department-based filtering | 10-15 hrs | All users see all records initially |
| Dynamic role creation UI | 10-15 hrs | Static roles sufficient for kickoff |
| Approval workflow system | 30-40 hrs | Business process not yet defined |
| Permission audit trail UI | 10-15 hrs | Database captures data, UI not urgent |

**Total Effort:** 95-135 hours

**Target:** Post-May 2026

---

## 7. IMPLEMENTATION ROADMAP

### Week 1 (Feb 11-12): Critical Fixes

**Day 1 (Feb 11):**
- Fix COI goBack() route (5 min)
- Fix Repairs goBack() route (5 min)
- Implement role-based button visibility for "New" button (2 hrs)
- Implement role-based button visibility for "Edit" button (1 hr)

**Day 2 (Feb 12):**
- Implement role-based button visibility for "Delete" button (1 hr)
- Add SuperAdmin bypass logic (1 hr)
- Hide User Management sidebar item for non-Admin (1 hr)
- Test all permission scenarios (2 hrs)

**Deliverable:** Basic role-based authorization working

---

### Week 2 (Feb 16-22): Enhancements (If Time)

**Tasks:**
- Create Breadcrumb component (2-3 hrs)
- Apply breadcrumb to COI, Repairs, Users modules (1-2 hrs)
- Add "Save & Return to List" button variant (1-2 hrs)
- Implement Reference Data sidebar dropdown (2-3 hrs)
- Add role badge to profile page (1-2 hrs)

**Deliverable:** Enhanced UX with better navigation context

---

### Post-Kickoff: Advanced Features

**Tasks:**
- Build permission management UI
- Implement page-level permission middleware
- Add department-based filtering
- Create approval workflow system
- Build permission audit log UI

**Deliverable:** Enterprise-grade authorization system

---

## 8. SUMMARY OF RECOMMENDATIONS

### Authorization Model

**Tier 1 (REQUIRED):** Role-based access (SuperAdmin, Admin, Staff, Viewer)
**Tier 2 (OPTIONAL):** Page-level permissions via user_page_permissions
**Tier 3 (DEFERRED):** Feature-level permissions for granular control

### CRUD Permissions

**Enforcement at 3 Levels:**
1. UI - Hide/disable buttons based on role
2. Route - Middleware checks before navigation
3. API - Backend guards validate before execution

### Sidebar Organization

**4 Main Groups:**
1. Dashboard (always visible)
2. Projects (COI, Repairs, University Ops)
3. Reference Data (Contractors, Funding Sources)
4. Administration (User Management, settings)

### Progress Tracking

**Artifact:** `docs/user_management_progress.md`
**Update Cadence:** Weekly during development
**Status Types:** Complete, In Progress, Missing, Deferred, Blocked

### Scope Control

**MUST FIX (P0):** 8-10 hours, Week 1
**SHOULD FIX (P1):** 10-16 hours, Week 2
**DEFERRED (P2):** 95-135 hours, Post-kickoff

---

**Status:** Phase 1 Research Complete
**Next:** Update plan_active.md with implementation roadmap
**Authority:** ACE Framework Phase 2 (Plan) ready for approval
