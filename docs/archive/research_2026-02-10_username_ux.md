# Research: Username UX & Authorization Model

**Document Version:** 1.0
**Date:** 2026-02-10
**Authority:** ACE Framework v2.4 - Phase 1 Research
**Status:** COMPLETE - Ready for Phase 2 Planning

---

## 1. USERNAME UX PROBLEM ANALYSIS

### 1.1 Current Implementation State (LOCKED AS WORKING)

The username field implementation is FUNCTIONAL and CORRECT:
- Username persists to database correctly
- Duplicate username rejection works
- Database constraints enforced (NOT NULL, UNIQUE)
- Backend validation enforced
- Manual entry works
- Auto-generation works

### 1.2 Behavioral Analysis

**Observed Behavior:**
```
User Action Flow:
1. User enters First Name → Field loses focus → generateUsername() fires
2. User enters Last Name → Field loses focus → generateUsername() fires
3. Username field auto-populates with "firstname.lastname"
4. User can manually edit username if desired
5. User can click "Auto" button to re-trigger generation
```

**Code Evidence:**
```
Line 202: @blur="generateUsername"  (on first_name field)
Line 215: @blur="generateUsername"  (on last_name field)
Line 185: @click="generateUsername" (on "Auto" button)
```

**Actual Model:** Auto-generate with manual override capability

### 1.3 UX Confusion Points

**Problem 1: Ambiguous "Auto" Button**

The button labeled "Auto" creates expectation misalignment:
- User Expectation A: "Auto" is a toggle (turn auto-generation on/off)
- User Expectation B: "Auto" means field will fill itself automatically
- Actual Behavior: "Auto" is a manual trigger button (redundant with @blur)

Result: User clicks button expecting state change, but it's just a helper action.

**Problem 2: Required Field with Auto-Generation**

Username field shows:
- Required asterisk (*)
- Hint: "Lowercase, numbers, dots, dashes only"
- "Auto" button inside field

User mental model conflict:
- "If it's auto, why is it required?"
- "Do I need to fill this or will it fill itself?"
- "Is the Auto button required to make it work?"

**Problem 3: No Feedback on Auto-Generation**

When @blur triggers generateUsername():
- Field populates silently
- No visual indication that auto-generation occurred
- User unsure if they triggered it or if it's automatic
- No confirmation that the value is acceptable

### 1.4 Root Cause of Confusion

**Design Intent vs Implementation vs Communication:**

| Layer | State |
|-------|-------|
| **Design Intent** | Auto-generate with manual override |
| **Implementation** | CORRECT - @blur triggers generation, user can edit |
| **UI Communication** | AMBIGUOUS - "Auto" button suggests toggle/mode |
| **User Understanding** | CONFUSED - Is this auto or manual? |

**Gap:** The UI does not clearly communicate the intended behavior model.

---

## 2. RECOMMENDED USERNAME MODEL (KICKOFF-SAFE)

### 2.1 Chosen Model

**Model: Auto-Suggest with Manual Override**

Rationale:
- Aligns with current working implementation
- Reduces user effort for common case
- Provides escape hatch for edge cases
- Clear behavioral contract
- Minimal code change required

### 2.2 User-Facing Behavior Description

**How It Should Work (User Perspective):**

1. User fills in First Name and Last Name
2. Username field auto-populates when either field loses focus
3. Generated username follows pattern: firstname.lastname (lowercase)
4. User can manually edit the suggested username at any time
5. Duplicate username error surfaced on submit (backend validates)

**Key Principle:** The system SUGGESTS a username, user CONFIRMS or MODIFIES.

### 2.3 UI Communication Changes Required

**Change 1: Remove "Auto" Button**

Current:
```
[Username Field] [Auto]
```

Recommended:
```
[Username Field] [Regenerate Icon]
```

Rationale:
- "Auto" implies mode/toggle
- Small regenerate icon (circular arrow) implies action
- Reduces visual clutter
- Clarifies it's a helper, not a mode

**Change 2: Add Descriptive Hint**

Current hint:
```
"Lowercase, numbers, dots, dashes only"
```

Recommended hint:
```
"Auto-filled from name (editable)"
```

Rationale:
- Communicates auto-fill behavior
- Clarifies editability
- Reduces confusion about required field

**Change 3: Optional Visual Feedback**

When auto-generation occurs:
- Brief flash/highlight of username field
- Or: Toast message "Username suggested: john.doe"

Rationale:
- Confirms action occurred
- Informs user they can modify
- Optional (P2 priority)

### 2.4 Implementation Responsibility

| Layer | Responsibility |
|-------|----------------|
| **Frontend** | Trigger generation on @blur, allow manual edit, show UI feedback |
| **Backend** | Validate format, enforce uniqueness, return clear error on duplicate |
| **Database** | Enforce NOT NULL and UNIQUE constraints (already done) |

**Contract:** Frontend suggests, backend validates, database enforces.

---

## 3. AUTHORIZATION MODEL OVERVIEW

### 3.1 Current State Analysis

**Implemented (Tier 1 - Role-Based):**
- Role hierarchy: SuperAdmin > Admin > Staff > Viewer
- CRUD permission matrix by role
- Button visibility based on role (canAdd, canEdit, canDelete)
- Sidebar visibility (SuperAdmin-only for User Management)

**Not Implemented:**
- Page-level access control (user_page_permissions table exists but unused)
- CRUD enforcement at API level beyond role checks
- Permission assignment UI
- Granular user-specific overrides

### 3.2 Database Schema Available

**Tables:**
```
roles (Admin, Staff, Viewer)
  └─ role_permissions → permissions (resource + action)

user_roles (user ↔ role, with is_superadmin flag)

user_page_permissions (user ↔ page_id with CRUD flags)
  - can_view
  - can_add
  - can_edit
  - can_delete
  - can_approve
  - can_assign_staff
  - can_manage_permissions
```

**Observations:**
- Schema supports 2-tier authorization (role + user-specific override)
- user_page_permissions table well-designed
- No UI for assigning page permissions
- No backend enforcement of page permissions

### 3.3 Authorization Hierarchy Model

**Tier 1: Role-Based (IMPLEMENTED)**

```
SuperAdmin:
  - Full access to ALL modules
  - Bypasses all permission checks
  - Can assign SuperAdmin to others

Admin:
  - Full CRUD on assigned modules
  - Cannot access User Management by default
  - Cannot assign SuperAdmin

Staff:
  - CRU (no Delete) on assigned modules
  - Read-only on reference data

Viewer:
  - Read-only access to assigned modules
```

**Tier 2: Page-Level (NOT IMPLEMENTED)**

```
user_page_permissions overrides role permissions:
  - user_id + page_id → specific CRUD flags
  - Example: Staff user gets can_delete on specific page
  - Example: Admin loses can_add on specific page
```

**Tier 3: Record-Level (DEFERRED)**

```
Future: Approval workflows, project assignments
  - construction_project_assignments table exists
  - university_operations_personnel table exists
  - Not needed for kickoff
```

### 3.4 Page-Level Authorization Approach

**Recommended Implementation:**

**Frontend:**
1. Permission composable checks user_page_permissions FIRST
2. Falls back to role permissions if no page override
3. Button visibility based on effective permissions
4. Route guards redirect if no can_view permission

**Backend:**
1. Middleware checks user_page_permissions for route
2. Falls back to role permissions
3. Returns 403 if insufficient permission
4. Logs all authorization checks

**Permission Resolution Logic:**
```
function getEffectivePermission(userId, pageId, action):
  1. If user is SuperAdmin → ALLOW
  2. Check user_page_permissions(userId, pageId).action → Use if exists
  3. Else: Check role_permissions via user_roles → Use role default
  4. Else: DENY (safe default)
```

### 3.5 CRUD-Level Authorization Approach

**Recommended Implementation:**

CRUD operations map to permission flags:
```
CREATE → can_add
READ   → can_view
UPDATE → can_edit
DELETE → can_delete
```

**API Enforcement:**
```
POST   /api/users → Check can_add('users')
GET    /api/users → Check can_view('users')
PATCH  /api/users/:id → Check can_edit('users')
DELETE /api/users/:id → Check can_delete('users')
```

**Controller Pattern:**
```
@Post()
@UseGuards(PermissionGuard('users', 'can_add'))
async create(@Body() dto: CreateUserDto) {
  // Implementation
}
```

### 3.6 Role Differentiation Matrix

| Module | SuperAdmin | Admin | Staff | Viewer |
|--------|------------|-------|-------|--------|
| **User Management** | Full CRUD | No Access | No Access | No Access |
| **COI Projects** | Full CRUD | Full CRUD | CRU only | Read only |
| **Repairs** | Full CRUD | Full CRUD | CRU only | Read only |
| **Contractors** | Full CRUD | Full CRUD | Read only | Read only |
| **Funding Sources** | Full CRUD | Full CRUD | Read only | Read only |
| **University Ops** | Full CRUD | Full CRUD | CRU only | Read only |

**Override via user_page_permissions:**
- Any user can get explicit permission grant/revoke on specific pages
- Example: Staff user gets can_delete on COI module only
- Example: Admin loses can_add on Funding Sources

---

## 4. SCOPE CONTROL

### 4.1 MUST FIX Before Kickoff (P0)

| Item | Effort | Priority | Rationale |
|------|--------|----------|-----------|
| Replace "Auto" button with regenerate icon | 30 min | P0 | Critical UX clarity |
| Update username hint text | 5 min | P0 | Communicates behavior |
| Backend CRUD permission guards | 4-6 hrs | P0 | Security requirement |
| Page-level route guards (frontend) | 2-3 hrs | P0 | Prevent unauthorized access |

**Total P0 Effort:** 7-10 hours

### 4.2 SHOULD FIX If Time Allows (P1)

| Item | Effort | Priority | Rationale |
|------|--------|----------|-----------|
| Username generation visual feedback | 1 hr | P1 | Improves clarity |
| user_page_permissions UI | 6-8 hrs | P1 | Enable granular control |
| Permission assignment interface | 4-6 hrs | P1 | Admin needs to assign |
| Audit log for permission checks | 2 hrs | P1 | Compliance |

**Total P1 Effort:** 13-17 hours

### 4.3 DEFERRED Post-Kickoff (P2)

| Item | Priority | Rationale |
|------|----------|-----------|
| Record-level permissions | P2 | Not blocking |
| Approval workflow integration | P2 | Future enhancement |
| Permission templates | P3 | UX convenience |
| Bulk permission assignment | P3 | Scaling feature |

### 4.4 Governance Constraints

**What Must NOT Change:**
- Existing role hierarchy (SuperAdmin > Admin > Staff > Viewer)
- Current working username auto-generation logic
- Database schema for permissions
- SuperAdmin bypass behavior

**What Must Be Preserved:**
- User Management SuperAdmin-only access
- Reference data Staff restrictions
- Audit trail for all permission checks

---

## 5. IMPLEMENTATION PHASES

### 5.1 Phase 1: Username UX Fix (P0 - 45 minutes)

1. Replace "Auto" button with small regenerate icon
2. Update hint text to "Auto-filled from name (editable)"
3. Test user flow for clarity

### 5.2 Phase 2: API Permission Guards (P0 - 4-6 hours)

1. Create PermissionGuard decorator for NestJS
2. Apply guards to all CRUD endpoints
3. Implement permission check logic with fallback
4. Test all API endpoints with different roles

### 5.3 Phase 3: Frontend Route Guards (P0 - 2-3 hours)

1. Add permission check to middleware
2. Redirect to /unauthorized if insufficient permission
3. Hide navigation items user cannot access
4. Test with different role users

### 5.4 Phase 4: Page Permission UI (P1 - 6-8 hours)

1. Create page permission assignment interface
2. Add to User detail page
3. Allow SuperAdmin to grant/revoke page permissions
4. Show effective permissions (role + override)

---

## 6. AUTHORIZATION FLOW DIAGRAMS

### 6.1 Permission Check Flow

```
User requests page/action
  ↓
Is user SuperAdmin?
  ├─ YES → ALLOW
  └─ NO
      ↓
Check user_page_permissions(user_id, page_id)
  ├─ EXISTS → Use specific permission
  └─ NOT EXISTS
      ↓
Check role_permissions via user_roles
  ├─ ROLE HAS PERMISSION → ALLOW
  └─ ROLE LACKS PERMISSION → DENY
```

### 6.2 Frontend Permission Resolution

```
Component needs to show/hide button
  ↓
Call canAdd('coi') from usePermissions()
  ↓
Check authStore.user.isSuperAdmin
  ├─ TRUE → return true
  └─ FALSE
      ↓
Get currentRole (Admin/Staff/Viewer)
  ↓
Check ADMIN_ONLY_MODULES
  ├─ YES and role !== Admin → return false
  └─ NO → continue
      ↓
Check REFERENCE_DATA_MODULES and role === Staff
  ├─ YES → return false for canAdd/canEdit/canDelete
  └─ NO → return ROLE_PERMISSIONS[role].canAdd
```

### 6.3 Backend Permission Resolution

```
API endpoint called
  ↓
PermissionGuard executes
  ↓
Extract user from JWT
  ↓
Check if SuperAdmin
  ├─ YES → continue to handler
  └─ NO
      ↓
Query user_page_permissions
  ├─ EXISTS → Check specific flag → ALLOW or DENY
  └─ NOT EXISTS
      ↓
Query role_permissions
  ├─ HAS PERMISSION → ALLOW
  └─ NO PERMISSION → DENY (throw 403)
```

---

## 7. TESTING REQUIREMENTS

### 7.1 Username UX Testing

**Test Cases:**
1. Fill first name → blur → verify username auto-fills
2. Fill last name → blur → verify username updates
3. Manually edit username → verify edit persists
4. Click regenerate icon → verify username regenerates
5. Submit with auto-generated username → verify success
6. Submit with manual username → verify success
7. Submit duplicate username → verify error message clear

### 7.2 Authorization Testing

**Test Matrix:**

| Role | Module | Action | Expected Result |
|------|--------|--------|-----------------|
| SuperAdmin | Users | Create | ALLOW |
| Admin | Users | Create | DENY (403) |
| Staff | COI | Create | ALLOW |
| Staff | COI | Delete | DENY |
| Viewer | COI | View | ALLOW |
| Viewer | COI | Edit | DENY |

**API Test Cases:**
```
POST   /api/users (as Admin) → 403
POST   /api/coi (as Staff) → 200
DELETE /api/coi/:id (as Staff) → 403
GET    /api/coi (as Viewer) → 200
```

**UI Test Cases:**
- Staff user: "Delete" button hidden on COI page
- Viewer user: "New Project" button hidden
- Admin user: User Management link not visible in sidebar
- SuperAdmin: All buttons visible, all links visible

---

## 8. SUMMARY

### 8.1 Key Findings

**Username UX:**
- Current behavior is CORRECT (auto-suggest with override)
- UI communication is AMBIGUOUS ("Auto" button misleading)
- Fix: Replace button, update hint, add feedback (45 min)

**Authorization:**
- Tier 1 (role-based) implemented
- Tier 2 (page-level) schema exists but not enforced
- API enforcement missing (P0 blocker)
- Frontend route guards missing (P0 blocker)

### 8.2 Immediate Actions Required

1. **Username UX Fix** (45 minutes) - Clarity
2. **API Permission Guards** (4-6 hours) - Security
3. **Frontend Route Guards** (2-3 hours) - UX
4. **Testing** (2 hours) - Verification

**Total P0 Effort:** 9-12 hours

### 8.3 Compliance Notes

- Authorization model aligns with government MIS least-privilege
- Audit trail for permission checks required
- SuperAdmin governance already implemented
- Page-level permissions support granular delegation

---

**END OF RESEARCH DOCUMENT**

*Next Step: Proceed to Phase 2 (Plan) with implementation tasks based on this analysis.*
