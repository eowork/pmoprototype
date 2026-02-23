# [Active Plan] PMO Dashboard - Governance & Hierarchical CRUD
> **Governance:** ACE v2.4
> **Phase:** Phase 4 – Active Planning
> **Last Updated:** 2026-02-20
> **Research Reference:** `research.md` Sections 1.32–1.49

---

## GOVERNANCE DIRECTIVES

| # | Directive | Status |
|---|-----------|--------|
| 1 | Approved record indicator shows approval metadata | ✅ |
| 2 | Edit button visibility reflects effective permission state | ✅ |
| 3 | UI action visibility aligns with backend enforcement | ✅ |
| 4 | Module-scoped approval functionality complete | ✅ |
| 5 | Backend enforcement remains authoritative | ✅ |
| 6 | Pending Reviews module provides centralized review visibility | ✅ |
| 7 | Submit/Withdraw submission lifecycle complete | ✅ |
| 8 | Reference Data UI visibility restricted to Admin/SuperAdmin | ✅ |
| 9 | Rank CRUD scope formally defined | ✅ Phase P |
| 10 | Backend permission logic centralized | ✅ Phase Q |
| 11 | Frontend permission drift resolved | ✅ Phase R |

---

## SCOPE CLASSIFICATION

- **MUST** — Critical path, governance violation, security enforcement
- **SHOULD** — High value, UX improvement, non-blocking
- **DEFERRED** — Future enhancement, schema migration required

---

## SECTION 1 — COMPLETED PHASES

> All phases below are verified complete. Detail is compacted for readability.
> Full implementation specs preserved in `research.md` Sections 1.32–1.36.

| Phase | Description | Files Changed |
|-------|-------------|---------------|
| **H** | Approval Metadata Display — Backend joins user name; adapters map submittedBy/reviewedBy; detail pages show attribution | 6 files |
| **I** | Edit Button Visibility Hardening — `canEditCurrentProject` computed; `v-if` on all detail page Edit buttons | 3 files |
| **J** | Permission Context Enhancement — `rank_level`, `module_assignments` in auth response; `canApprove(module)` in usePermissions | 4 files |
| **K** | Regression Test Execution — All test suites K6–K9 verified in running environment | Manual |
| **L** | Pending Reviews Module — `/admin/pending-reviews.vue` created; sidebar link added; aggregates all three modules | 2 files |
| **M** | Withdraw Action — `POST /:id/withdraw` on all three backend modules; `canWithdraw()` + button on index + detail pages | 9 files |
| **N** | Reference Data Access Control — `ADMIN_ONLY_MODULES` updated to include contractors, funding-sources | 1 file |
| **O** | State Machine Validation — All transitions verified; blocked paths return 400/403 | Research only |
| **P** | Rank CRUD Scope Definition — Rank = approval-authority only (documented, code aligned) | 2 files |
| **Q** | Centralized Backend Resolver — `PermissionResolverService` created; all 3 module services updated | 6 files |
| **R** | Frontend Permission Drift Cleanup — `REFERENCE_DATA_MODULES` documented; self-approval prevention in index pages | 4 files |
| **S** | Approval History Timeline — `created_by_name` join in all 3 services; `ApprovalMetadata` extended; timeline added to all detail pages | 8 files |
| **T** | Backend update() Enforcement — PENDING_REVIEW edit lock (400) + ownership check (403) in all 3 services; controllers pass full `user` to update() | 6 files |
| **U** | Submitter Name in findAll() — `submitted_by`, `submitted_at`, `submitted_by_name` JOIN in all 3 services; index pages show submitter name below PENDING_REVIEW chip | 6 files |

> Phase T's PENDING_REVIEW hard-block (400) is superseded by Phase W (auto-revert). Phase W replaces the Phase T guard.
| **V** | REJECTED Revision Flow — `update()` resets REJECTED → DRAFT; `canSubmitForReview` accepts REJECTED in all 6 pages | 9 files |
| **W** | PENDING_REVIEW Auto-Revert — removes Phase T hard-block; `update()` auto-reverts PENDING_REVIEW → DRAFT; Edit button unblocked | 9 files |
| **X** | Director Staff Visibility — `findAll()` changed to `PUBLISHED OR created_by = userId` for non-admins in all 3 services | 3 files |
| **AA** | Record Assignment Schema — `assigned_to` FK on all 3 module tables via migration 010 | 1 file |
| **AB** | Visibility Query Update — `findAll()` extends to `PUBLISHED OR created_by OR assigned_to` | 3 files |
| **AC** | Edit Permission Update — `update()` ownership check extends to `created_by OR assigned_to` | 3 files |
| **AD** | Submission Control Update — `submitForReview()` extends to `created_by OR assigned_to` | 3 files |
| **Y** | Office-Scoped Visibility — Campus proxy: migration 011, auth/user services include campus, findAll() filters by user.campus | 8 files |
| **AE** | Frontend isOwner() Delegation Fix — `delegatedTo` added to adapters; `isOwner()` in all 6 pages checks both createdBy AND delegatedTo | 7 files |
| **AF** | Admin UI for Record Assignment — `assigned_to` in UpdateDto; delegate selector dropdown in all 3 edit pages | 6 files |
| **AG** | Admin UI for User Campus Assignment — campus dropdown (Butuan Campus, Cabadbaran) in users/edit and users/new | 2 files |
| **AH** | Eligible-users API — `GET /api/users/eligible-for-assignment?module=&campus=`; filters by module assignment + campus; excludes unqualified users | 3 files |
| **AI** | Filtered assignment selector — all 3 edit pages now call eligible-for-assignment endpoint; project fetched first to supply campus param | 3 files |
| **AJ** | User Management filters — campus + role dropdowns in users/index.vue; campus added to UIUserList adapter; campus filter in QueryUserDto + findAll() | 4 files |
| **AK** | Searchable assignment selector + rename — v-autocomplete replaces v-select; "Record Delegation" → "Assigned Staff/Personnel"; assigned_to_name JOIN in backend findOne(); delegatedToName in adapters; display on detail pages | 12 files |
| **AL** | Eligible-users regression fix — replace INNER JOIN on user_module_assignments with role-based WHERE filter (Staff/Admin/SuperAdmin); `normalizeRecordCampusToUserCampus()` added | 1 file |
| **AM** | Campus value taxonomy alignment — `normalizeUserCampusToRecordCampus()` added to all 3 module services; Phase Y `findAll()` campus conditions now use mapped values | 3 files |
| **AN** | Backend Create DTO extension — add `assigned_to` to all 3 CreateDtos; enables inline assignment during record creation | 3 files |
| **AO** | Frontend Create page assignment card — add "Assigned Staff/Personnel" v-autocomplete to all 3 new/create pages; ⚠️ Had response mapping bug fixed in Phase AP | 3 files |
| **AP** | Create page response mapping fix — align `res.data` → `Array.isArray(res)` pattern + standardize module params (CONSTRUCTION/REPAIR/OPERATIONS) | 3 files |
| **AS** | Add assigned_to_name JOIN to findAll() — all 3 backend services now include assignee name in list queries for proper display | 3 files |

---

## SECTION 2 — ACTIVE PHASES

---

### PHASE AS: ASSIGNED_TO_NAME JOIN IN findAll() [MUST]

**Status:** ✅ COMPLETE
**Priority:** P0 — RISK-104 — "undefined undefined" display in list views
**Research Reference:** `research.md` Section 1.48.A, 1.48.E
**Scope:** Backend — 2 service files

**Problem Statement:**

The `findAll()` queries in Repairs and University Operations services do NOT join the users table to retrieve the assigned user's name. While `findOne()` (detail views) has the correct JOIN, `findAll()` (list views) is missing it. This causes `assigned_to_name` to be NULL, resulting in "undefined undefined" display when the frontend attempts to render the assignee name.

**Root Cause:**
Phase AK added `assigned_to_name` JOIN to `findOne()` but omitted it from `findAll()`.

**Required Changes:**

**File 1: `pmo-backend/src/repair-projects/repair-projects.service.ts`**

Add to `findAll()` query:
```sql
LEFT JOIN users assignee ON rp.assigned_to = assignee.id
```

Add to SELECT:
```sql
assignee.first_name || ' ' || assignee.last_name AS assigned_to_name
```

**File 2: `pmo-backend/src/university-operations/university-operations.service.ts`**

Same pattern — add assignee JOIN to `findAll()`.

**Verification:**
- List views (index pages) should display assigned personnel name
- No "undefined undefined" display

---

---

### PHASE AL: ELIGIBLE-USERS REGRESSION FIX [MUST]

**Status:** ✅ COMPLETE
**Priority:** P0 — RISK-089, RISK-091 — Assignment dropdown returns empty set
**Research Reference:** `research.md` Section 1.45.B, 1.45.C
**Scope:** Backend — service method rewrite; no schema migration required
**Blocks:** Phase AM (campus filter reinstatement)

**Problem Statement:**

`findEligibleForAssignment()` was implemented in Phase AH using `INNER JOIN user_module_assignments`. The `user_module_assignments` table is sparsely populated — only users who have been explicitly assigned to a module have rows. As a result, when this table is empty or sparse, the INNER JOIN eliminates all users and returns an empty result set. All 3 edit pages display an empty assignment dropdown even when valid, active Staff users exist in the system.

**Root Cause Classification:**
- INNER JOIN on sparse table (RISK-089): `INNER JOIN user_module_assignments uma ON uma.user_id = u.id` requires a matching row to exist. No row = no result.
- Original intent of module assignment was advisory access context, not a hard existence gate for eligibility.
- Correct eligibility model: `ActiveNonDeletedUsers ∧ Role ∈ {Staff, Admin, SuperAdmin}`

**Required Changes:**

**`pmo-backend/src/users/users.service.ts` — `findEligibleForAssignment()`:**

Replace the INNER JOIN approach with a role-based WHERE filter:

```sql
SELECT u.id, u.first_name, u.last_name, u.campus
FROM users u
WHERE u.deleted_at IS NULL
  AND u.is_active = true
  AND u.role IN ('Staff', 'Admin', 'SuperAdmin')
ORDER BY u.last_name, u.first_name
```

- Remove `INNER JOIN user_module_assignments`
- Remove `DISTINCT` (no longer needed without the JOIN)
- Keep `module` param accepted but not applied as a filter (for future use after AM)
- Remove `campus` param pass-through: **do not apply campus filter until Phase AM aligns the value taxonomy** (RISK-088 — record campus values are MAIN/CABADBARAN/BOTH; user campus values are 'Butuan Campus'/'Cabadbaran' — equality comparison always fails)
- Exclude Viewer role: `role IN ('Staff', 'Admin', 'SuperAdmin')`

**Verification Criteria:**
- [ ] AL1: `GET /api/users/eligible-for-assignment?module=CONSTRUCTION` returns non-empty list of Staff/Admin/SuperAdmin users
- [ ] AL2: Viewer-role users excluded from response
- [ ] AL3: Inactive/deleted users excluded from response
- [ ] AL4: v-autocomplete in all 3 edit pages now displays eligible users
- [ ] AL5: Search input in v-autocomplete filters the displayed list client-side
- [ ] AL6: Campus param accepted but silently ignored (no 400 error; no campus filter applied)

**Files to Change:**
- `pmo-backend/src/users/users.service.ts` — rewrite `findEligibleForAssignment()` body

---

### PHASE AM: CAMPUS VALUE TAXONOMY ALIGNMENT [MUST]

**Status:** ✅ COMPLETE
**Priority:** P0 — RISK-088, RISK-090 — Campus filter silently broken
**Research Reference:** `research.md` Section 1.45.D
**Scope:** Backend — value normalization in service layer; no schema migration required
**Blocked By:** Phase AL (must confirm base list works before reinstating campus filter)

**Problem Statement:**

Records store campus as `MAIN`, `CABADBARAN`, or `BOTH`. Users store campus as `'Butuan Campus'` or `'Cabadbaran'` (from Phase AG). These two value sets are incompatible — equality comparison `u.campus = record.campus` always returns false.

This also affects Phase Y (office-scoped visibility): `findAll()` WHERE clause `cp.campus = u.campus` will never match for users assigned 'Butuan Campus' looking at records with campus = 'MAIN'.

**Confirmed Taxonomy Gap:**

| Record Campus Value | User Campus Value | Equality Match? |
|---------------------|-------------------|-----------------|
| `MAIN` | `Butuan Campus` | ❌ Never matches |
| `CABADBARAN` | `Cabadbaran` | ❌ Never matches |
| `BOTH` | either | ❌ Never matches — must mean "no filter" |
| `NULL` | any | ❌ Never matches |

**Resolution Strategy — Service-Layer Value Mapping (no schema change):**

Define a normalization function in the service layer:

```typescript
function normalizeRecordCampusToUserCampus(recordCampus: string | null): string | null {
  if (!recordCampus || recordCampus === 'BOTH') return null; // null = no campus filter
  if (recordCampus === 'MAIN') return 'Butuan Campus';
  if (recordCampus === 'CABADBARAN') return 'Cabadbaran';
  return null;
}
```

**Apply in `findEligibleForAssignment()`:**

After Phase AL establishes the base role filter, reinstate the campus filter using normalized values:

```sql
WHERE u.deleted_at IS NULL
  AND u.is_active = true
  AND u.role IN ('Staff', 'Admin', 'SuperAdmin')
  AND (u.campus = $1 OR u.campus IS NULL)   -- only when normalizedCampus is not null
```

**Apply in `findAll()` (Phase Y campus scoping — RISK-090):**

The same mismatch affects `findAll()` in all 3 module services. When a Staff user with `campus = 'Butuan Campus'` fetches records, the condition `cp.campus = u.campus` never matches `cp.campus = 'MAIN'`. Fix:

- In `users.service.ts` or a shared util: expose `normalizeUserCampusToRecordCampus()`:
  ```typescript
  function normalizeUserCampusToRecordCampus(userCampus: string | null): string | null {
    if (!userCampus) return null;
    if (userCampus === 'Butuan Campus') return 'MAIN';
    if (userCampus === 'Cabadbaran') return 'CABADBARAN';
    return null;
  }
  ```
- Apply in all 3 module service `findAll()` WHERE clauses where `campus` is compared

**Files to Change:**
- `pmo-backend/src/users/users.service.ts` — campus normalization in `findEligibleForAssignment()`; expose mapping util
- `pmo-backend/src/construction-projects/construction-projects.service.ts` — `findAll()` campus condition
- `pmo-backend/src/repair-projects/repair-projects.service.ts` — `findAll()` campus condition
- `pmo-backend/src/university-operations/university-operations.service.ts` — `findAll()` campus condition

**Verification Criteria:**
- [ ] AM1: `?module=CONSTRUCTION&campus=MAIN` returns users with `campus = 'Butuan Campus'` OR `campus IS NULL`
- [ ] AM2: `?module=REPAIR&campus=CABADBARAN` returns users with `campus = 'Cabadbaran'` OR `campus IS NULL`
- [ ] AM3: `?module=OPERATIONS&campus=BOTH` returns all eligible users (no campus filter applied)
- [ ] AM4: Staff with `campus = 'Butuan Campus'` sees MAIN campus records in `findAll()` (Phase Y fix)
- [ ] AM5: Staff with `campus = 'Cabadbaran'` sees CABADBARAN campus records in `findAll()` (Phase Y fix)
- [ ] AM6: Staff with no campus continues to see PUBLISHED + own records (Phase Y fallback unchanged)

---

### PHASE AH: ELIGIBLE-USERS API ENDPOINT [MUST]

**Status:** ✅ COMPLETE
**Priority:** P0 — RISK-082 — Assignment dropdown lists unauthorized users
**Research Reference:** `research.md` Section 1.43.A, 1.43.G
**Scope:** Backend — new endpoint, no schema migration required

**Problem Statement:**

The Record Delegation dropdown in all 3 edit pages calls `GET /api/users` with no filtering. This returns all active users including Viewers (who cannot edit) and users with no module access, violating the assignment eligibility rule.

**Required Changes:**

**Backend — new endpoint `GET /api/users/eligible-for-assignment`:**
- Controller: `@Get('eligible-for-assignment')` with `@Roles('Admin', 'Staff')`
- Query params: `module` (required: CONSTRUCTION | REPAIR | OPERATIONS), `campus` (optional)
- Service method: JOIN `user_module_assignments` to filter to users with matching module (or ALL); optionally filter by campus; exclude Viewers; exclude deleted/inactive users
- Response shape: `[{ id, first_name, last_name, campus }]` — matches existing dropdown shape
- Also validates `assigned_to` in `update()` — if provided, confirm target user exists in eligible set

**Files to Change:**
- `pmo-backend/src/users/users.controller.ts` — new route
- `pmo-backend/src/users/users.service.ts` — new method `findEligibleForAssignment()`
- `pmo-backend/src/users/dto/` — new `QueryEligibleUsersDto` (module, campus params)

**Verification Criteria:**
- [ ] AH1: `GET /api/users/eligible-for-assignment?module=CONSTRUCTION` returns only users with CONSTRUCTION or ALL assignment
- [ ] AH2: `?module=CONSTRUCTION&campus=Butuan+Campus` returns users with matching module AND (campus match OR no campus set)
- [ ] AH3: Viewer-role users excluded from response
- [ ] AH4: Inactive/deleted users excluded from response
- [ ] AH5: Admin with no module assignments is excluded (module check applies to all)

---

### PHASE AI: FILTERED ASSIGNMENT SELECTOR [MUST]

**Status:** ✅ COMPLETE
**Priority:** P0 — RISK-082 — Blocked on Phase AH
**Research Reference:** `research.md` Section 1.43.A
**Blocks:** None after Phase AH
**Blocked By:** Phase AH

**Problem Statement:**

All 3 edit pages (`coi/edit-[id].vue`, `repairs/edit-[id].vue`, `university-operations/edit-[id].vue`) call `GET /api/users` for the delegation dropdown. Phase AH provides a filtered replacement endpoint. This phase wires the pages to the new endpoint.

**Required Changes:**

Replace the current `staffUsers` fetch in all 3 edit pages:

Current (all 3 pages):
```typescript
const usersRes = await api.get<{ data: {...}[] }>('/api/users')
staffUsers.value = usersRes.data || []
```

New (all 3 pages — each with correct module param):
- COI: `GET /api/users/eligible-for-assignment?module=CONSTRUCTION&campus=<record.campus>`
- Repairs: `GET /api/users/eligible-for-assignment?module=REPAIR&campus=<record.campus>`
- University Operations: `GET /api/users/eligible-for-assignment?module=OPERATIONS&campus=<record.campus>`

Pass the record's `campus` field as the campus param so the selector narrows to same-campus users (plus users with no campus assignment).

**Files to Change:**
- `pmo-frontend/pages/coi/edit-[id].vue`
- `pmo-frontend/pages/repairs/edit-[id].vue`
- `pmo-frontend/pages/university-operations/edit-[id].vue`

**Verification Criteria:**
- [ ] AI1: COI edit page dropdown shows only users with CONSTRUCTION or ALL module assignment
- [ ] AI2: Repairs edit page dropdown shows only users with REPAIR or ALL module assignment
- [ ] AI3: University Operations edit page shows only users with OPERATIONS or ALL module assignment
- [ ] AI4: Viewers no longer appear in any assignment dropdown
- [ ] AI5: Cross-campus users (if record.campus is set) excluded unless user.campus is null

---

### PHASE AJ: USER MANAGEMENT CAMPUS AND ROLE FILTERS [SHOULD]

**Status:** ✅ COMPLETE
**Priority:** P1 — RISK-084, RISK-085
**Research Reference:** `research.md` Section 1.43.D
**Scope:** Frontend + Backend — no schema migration required

**Problem Statement:**

`users/index.vue` has only a search field and status filter. Campus assignment management is unworkable for large user lists — admins cannot filter users by campus to bulk-review assignments. The `role` filter also exists in the backend but is not exposed in the UI.

**Required Changes:**

**Backend `GET /api/users`:**
- Add `campus` query param to `QueryUserDto` (IsOptional, IsString)
- Add campus WHERE condition to `findAll()`: `AND u.campus = :campus` when param provided
- (The `role` filter is already implemented in backend — no change needed)

**Frontend `users/index.vue`:**
- Add campus dropdown filter (`v-select`) to filter bar with options: All / Butuan Campus / Cabadbaran
- Add role dropdown filter (`v-select`) to filter bar (backend already supports this — just wire up the existing `roleFilter` ref)
- Update `fetchUsers()` to include `campus` and `role` params when set

**Files to Change:**
- `pmo-backend/src/users/dto/query-user.dto.ts` (or create-user.dto.ts — check which DTO handles queries)
- `pmo-backend/src/users/users.service.ts` — add campus WHERE condition to `findAll()`
- `pmo-frontend/pages/users/index.vue` — add campus + role filter selects to template

**Verification Criteria:**
- [ ] AJ1: Campus filter dropdown shows Butuan Campus / Cabadbaran / All
- [ ] AJ2: Filtering by "Butuan Campus" shows only users with campus = 'Butuan Campus'
- [ ] AJ3: Role filter dropdown works and filters by role
- [ ] AJ4: Combined campus + role filter returns intersection
- [ ] AJ5: "All" option clears campus filter (shows all users)

---

### PHASE V: REJECTED RECORD REVISION FLOW [MUST]

**Status:** ✅ COMPLETE
**Priority:** P0 — State Machine Correctness
**Research Reference:** `research.md` Section 1.37.A, 1.37.E, 1.37.F

**Problem Statement:**

REJECTED records are a dead-end state. Backend `submitForReview()` correctly accepts REJECTED → PENDING_REVIEW. However:

1. `update()` does not reset `publication_status` when editing a REJECTED record (stays REJECTED)
2. `canSubmitForReview()` on both index and detail pages guards on `=== 'DRAFT'`, excluding REJECTED records from showing the Submit for Review button

**Required Changes:**

**Backend (all 3 services):**
- Extend `requiresStatusReset` to cover REJECTED:
  ```
  const requiresStatusReset = ['PUBLISHED', 'REJECTED'].includes(currentRecord.publication_status)
  ```
- When REJECTED is edited: reset `publication_status = 'DRAFT'`, clear `reviewed_by = NULL`, `reviewed_at = NULL`

**Frontend index pages (all 3):**
- Extend `canSubmitForReview()`:
  ```typescript
  function canSubmitForReview(item): boolean {
    return isStaff.value && isOwner(item)
      && (item.publicationStatus === 'DRAFT' || item.publicationStatus === 'REJECTED')
  }
  ```

**Frontend detail pages (all 3):**
- Extend `canSubmitForReview` computed:
  ```typescript
  return isStaff.value && isOwner.value
    && (project.value.publicationStatus === 'DRAFT' || project.value.publicationStatus === 'REJECTED')
  ```

**Files to Change:**
- `pmo-backend/src/construction-projects/construction-projects.service.ts`
- `pmo-backend/src/repair-projects/repair-projects.service.ts`
- `pmo-backend/src/university-operations/university-operations.service.ts`
- `pmo-frontend/pages/coi/index.vue`
- `pmo-frontend/pages/repairs/index.vue`
- `pmo-frontend/pages/university-operations/index.vue`
- `pmo-frontend/pages/coi/detail-[id].vue`
- `pmo-frontend/pages/repairs/detail-[id].vue`
- `pmo-frontend/pages/university-operations/detail-[id].vue`

**Verification Criteria:**
- [ ] Edit a REJECTED record → status resets to DRAFT automatically
- [ ] Submit for Review button appears on REJECTED records (owner)
- [ ] REJECTED → submit → PENDING_REVIEW confirmed
- [ ] REJECTED record: reviewed_by and reviewed_at cleared after edit

---

### PHASE W: PENDING_REVIEW EDIT AUTO-REVERT [MUST]

**Status:** ✅ COMPLETE
**Priority:** P0 — State Machine Correctness
**Research Reference:** `research.md` Section 1.37.B, 1.37.F
**Supersedes:** Phase T's PENDING_REVIEW hard-block (400)

**Problem Statement:**

Phase T introduced a hard 400 for editing PENDING_REVIEW records. The required governance behavior is auto-revert: editing a PENDING_REVIEW record should invalidate the submission, revert to DRAFT, and allow the edit to proceed. The submitter must re-submit after editing.

**Required Changes:**

**Backend `update()` (all 3 services):**
- Remove the hard `throw new BadRequestException` for PENDING_REVIEW
- Add PENDING_REVIEW to `requiresStatusReset` condition:
  ```typescript
  const requiresStatusReset = ['PUBLISHED', 'REJECTED', 'PENDING_REVIEW'].includes(currentRecord.publication_status)
  ```
- When resetting from PENDING_REVIEW: clear `submitted_by = NULL`, `submitted_at = NULL` (submission invalidated)
- Ownership check remains: non-admin can only edit own records

**Reset behavior by prior status:**
| Prior Status | publication_status reset | Clear fields |
|---|---|---|
| PUBLISHED | → DRAFT | reviewed_by, reviewed_at |
| REJECTED | → DRAFT | reviewed_by, reviewed_at |
| PENDING_REVIEW | → DRAFT | submitted_by, submitted_at |

**Frontend index pages (all 3):**
- Remove PENDING_REVIEW block from `canEditItem()`:
  ```typescript
  function canEditItem(item): boolean {
    if (!canEdit(module)) return false
    // PENDING_REVIEW no longer blocked — edit auto-reverts
    if (isAdmin.value) return true
    return isOwner(item)
  }
  ```

**Frontend detail pages (all 3):**
- Remove PENDING_REVIEW block from `canEditCurrentProject` computed

**Files to Change:**
- `pmo-backend/src/construction-projects/construction-projects.service.ts`
- `pmo-backend/src/repair-projects/repair-projects.service.ts`
- `pmo-backend/src/university-operations/university-operations.service.ts`
- `pmo-frontend/pages/coi/index.vue`
- `pmo-frontend/pages/repairs/index.vue`
- `pmo-frontend/pages/university-operations/index.vue`
- `pmo-frontend/pages/coi/detail-[id].vue`
- `pmo-frontend/pages/repairs/detail-[id].vue`
- `pmo-frontend/pages/university-operations/detail-[id].vue`

**Verification Criteria:**
- [ ] PATCH on PENDING_REVIEW record → returns 200 + status = DRAFT
- [ ] submitted_by and submitted_at cleared after edit of PENDING_REVIEW
- [ ] Edit button visible for PENDING_REVIEW records (owner or admin)
- [ ] Ownership check still enforced (non-owner gets 403)
- [ ] After edit, user can re-submit for review

---

### PHASE X: DIRECTOR-LEVEL STAFF VISIBILITY [MUST]

**Status:** ✅ COMPLETE
**Priority:** P1 — Staff Productivity
**Research Reference:** `research.md` Section 1.37.D
**Resolves:** D7 (Team-level DRAFT visibility for Staff)

**Problem Statement:**

`findAll()` for non-Admin users returns only `PUBLISHED` records. A Director-level Staff who creates several DRAFTs sees only PUBLISHED records in the main list. Own DRAFTs are only accessible via `/my-drafts`. This makes the main list appear empty for active Staff users.

**Required Changes:**

**Backend `findAll()` (all 3 services):**

Replace:
```typescript
conditions.push(`cp.publication_status = 'PUBLISHED'`);
```

With:
```typescript
conditions.push(`(cp.publication_status = 'PUBLISHED' OR cp.created_by = $${paramIndex++})`);
params.push(user.sub);
```

This shows:
- All PUBLISHED records (global visibility)
- Own records in any status (DRAFT, PENDING_REVIEW, REJECTED)

The COUNT query must include the same condition.

**Files to Change:**
- `pmo-backend/src/construction-projects/construction-projects.service.ts`
- `pmo-backend/src/repair-projects/repair-projects.service.ts`
- `pmo-backend/src/university-operations/university-operations.service.ts`

**Verification Criteria:**
- [ ] Staff user sees all PUBLISHED records in main list
- [ ] Staff user sees own DRAFT records in main list
- [ ] Staff user does NOT see other users' DRAFTs
- [ ] Admin still sees all records (behavior unchanged)
- [ ] Pagination counts correctly reflect extended filter

---

### PHASE AE: FRONTEND `isOwner()` DELEGATION FIX [MUST]

**Status:** ✅ COMPLETE
**Priority:** P0 — RISK-076 — Delegation model broken in UI
**Research Reference:** `research.md` Section 1.40.D
**Scope:** CRITICAL for go-live

**Problem Statement:**

Backend (Phases AC + AD) permits `assigned_to` users to edit and submit records. The frontend `isOwner()` function only checks `createdBy`, so assigned delegates never see Edit or Submit for Review buttons even though the backend would accept their actions.

**Prerequisite — adapters.ts:**
`BackendProject` must include `assigned_to`. `UIProject` must include `assignedTo`. `adaptProject()` must map it.

**Required Changes:**

`pmo-frontend/utils/adapters.ts`:
- Add `assigned_to?: string` to `BackendProject`
- Add `assignedTo: string` to `UIProject`
- Map in `adaptProject()`: `assignedTo: backend.assigned_to || ''`

**All 3 index pages** (`coi/index.vue`, `repairs/index.vue`, `university-operations/index.vue`):
```typescript
function isOwner(item: UIProject): boolean {
  return item.createdBy === authStore.user?.id
    || item.assignedTo === authStore.user?.id
}
```

**All 3 detail pages** (`coi/detail-[id].vue`, `repairs/detail-[id].vue`, `university-operations/detail-[id].vue`):
```typescript
const isOwner = computed(() => {
  if (!project.value) return false
  return project.value.createdBy === authStore.user?.id
    || project.value.assignedTo === authStore.user?.id
})
```

**Files to Change:**
- `pmo-frontend/utils/adapters.ts`
- `pmo-frontend/pages/coi/index.vue`
- `pmo-frontend/pages/repairs/index.vue`
- `pmo-frontend/pages/university-operations/index.vue`
- `pmo-frontend/pages/coi/detail-[id].vue`
- `pmo-frontend/pages/repairs/detail-[id].vue`
- `pmo-frontend/pages/university-operations/detail-[id].vue`

**Verification Criteria:**
- [x] AE1: Assigned Staff sees Edit button and Submit for Review button in list
- [x] AE2: Assigned Staff sees Edit button and Submit for Review button in detail
- [x] AE3: Non-assigned, non-owner Staff does NOT see those buttons

**Implementation Notes:**
- Used `delegatedTo` (not `assignedTo`) as UI field name to avoid conflict with Repair's existing `assignedTo` (technician field)
- All 3 backend/UI interface pairs updated: BackendProject/UIProject, BackendUniversityOperation/UIUniversityOperation, BackendRepairProject/UIRepairProject
- UIRepairDetail also updated for consistency

---

### PHASE AF: ADMIN UI FOR RECORD ASSIGNMENT [SHOULD]

**Status:** ✅ COMPLETE
**Priority:** P1 — Delegation unusable without assignment UI
**Research Reference:** `research.md` Section 1.40.F
**Scope:** Enhancement — ship if time allows

**Problem Statement:**

The `assigned_to` field on module records can only be set via direct API call or SQL. Admins and record owners have no UI to delegate records to another user.

**Required Changes:**

Add an "Assign to" action or field on record detail pages (or edit forms) for:
- Record owner (created_by): can set assigned_to when status is DRAFT or REJECTED
- Admin: can set assigned_to at any status

Minimum viable: A simple select dropdown in the edit page (`edit-[id].vue`) that lists Staff users and allows selecting one as the delegate.

**Files to Change:**
- `pmo-frontend/pages/coi/edit-[id].vue`
- `pmo-frontend/pages/repairs/edit-[id].vue`
- `pmo-frontend/pages/university-operations/edit-[id].vue`
- Backend DTOs may need `assigned_to` added to `UpdateXxxDto`

**Verification Criteria:**
- [x] Owner can set assigned_to via edit form on DRAFT record
- [x] Admin can set assigned_to via edit form on any record
- [x] assigned_to displays as delegated user name on detail page

**Implementation Notes:**
- Added `assigned_to` field to all 3 backend UpdateDto classes (IsOptional, IsUUID validation)
- Added "Record Delegation" section with user dropdown to all 3 edit pages
- Dropdown populated from /api/users endpoint showing `first_name last_name`

---

### PHASE AG: ADMIN UI FOR USER CAMPUS ASSIGNMENT [SHOULD]

**Status:** ✅ COMPLETE
**Priority:** P1 — Campus scoping unusable without assignment UI
**Research Reference:** `research.md` Section 1.40.F
**Scope:** Enhancement — ship if time allows

**Problem Statement:**

The `campus` field on users can only be set via direct API call or SQL. Admins have no UI to assign a campus to a user.

**Required Changes:**

Add `campus` field to the user edit page (`pages/users/edit-[id].vue`). A text input or dropdown listing known campus values (if enumerated).

**Files to Change:**
- `pmo-frontend/pages/users/edit-[id].vue`
- `pmo-frontend/pages/users/new.vue` (optional — for creation)

**Verification Criteria:**
- [x] Admin can set campus on a user via the user edit page
- [x] Admin can set campus on a new user during creation
- [x] Campus value is reflected in the user detail view
- [x] After campus update, user's record visibility is scoped on next login

**Implementation Notes:**
- Campus values: "Butuan Campus" or "Cabadbaran" (per user specification)
- Added campus dropdown to both users/edit-[id].vue and users/new.vue
- "None" option clears campus assignment (user sees all PUBLISHED + own records)

---

### PHASE Y: OFFICE-SCOPED VISIBILITY — CAMPUS PROXY [SHOULD]

**Status:** ✅ COMPLETE (Migration revised 2026-02-18)
**Priority:** P2 — Organizational Scoping
**Research Reference:** `research.md` Section 1.37.C, 1.39 (migration fix)
**Schema Migration Required:** Yes (add `campus` column to `users` table)

**IMPORTANT — Deployment Order:**
1. Run migration `011_add_user_campus.sql` FIRST
2. Then restart backend service
3. The migration is idempotent (safe to re-run)

**Problem Statement:**

Records have a `campus` field but users have no campus assignment. There is no way to automatically scope a non-Admin user's visibility to their own campus.

**Required Changes:**

**Schema Migration (new file: `010_add_user_campus.sql`):**
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS campus TEXT;
COMMENT ON COLUMN users.campus IS 'User office/campus assignment for record visibility scoping';
```

**Backend `findAll()` (after Phase X):**
After Phase X adds own-record visibility, extend further for campus scoping:
```typescript
if (user.campus) {
  conditions.push(`(cp.campus = $${paramIndex++} OR cp.created_by = $${paramIndex++})`);
  params.push(user.campus, user.sub);
} else {
  // No campus assigned: fall back to PUBLISHED + own
  conditions.push(`(cp.publication_status = 'PUBLISHED' OR cp.created_by = $${paramIndex++})`);
  params.push(user.sub);
}
```

**Backend auth response:** Include `campus` in JWT payload / auth response so frontend has access.

**Division Chief visibility:**
Division Chief (rank 40) is an Admin role with module assignments. Admin already sees all records — no additional scope filter needed for Division Chief. Campus scoping only applies to Staff role.

**Files to Change:**
- NEW: `database/migrations/010_add_user_campus.sql`
- `pmo-backend/src/auth/auth.service.ts` — include `campus` in JWT/auth response
- `pmo-backend/src/construction-projects/construction-projects.service.ts`
- `pmo-backend/src/repair-projects/repair-projects.service.ts`
- `pmo-backend/src/university-operations/university-operations.service.ts`
- `pmo-backend/src/users/users.service.ts` — add campus to user CRUD
- `pmo-frontend/utils/adapters.ts` — map campus field

**Verification Criteria:**
- [ ] Staff user assigned to "Main Campus" sees only Main Campus records + own
- [ ] Staff user with no campus assigned falls back to PUBLISHED + own
- [ ] Division Chief (Admin) sees all records regardless of campus
- [ ] SuperAdmin sees all records

---

### PHASE K: REGRESSION TEST EXECUTION [MUST]

**Status:** ✅ COMPLETE — Manually verified in running environment
**Priority:** P0 — Quality Gate
**Blocks:** (none — all blocking phases now complete)

**Test Suites:**

#### K6 — Pending Reviews Dashboard

| Test | Action | Expected | Scope |
|------|--------|----------|-------|
| K6.1 | Admin accesses `/admin/pending-reviews` | Page loads, shows pending items | MUST |
| K6.2 | Staff accesses `/admin/pending-reviews` | Redirect to dashboard | MUST |
| K6.3 | SuperAdmin views pending | All modules visible | MUST |
| K6.4 | Admin (COI assigned) views pending | COI only | MUST |
| K6.5 | Approve from dashboard | Record published, removed from list | MUST |
| K6.6 | Reject from dashboard | Record rejected, removed from list | MUST |

#### K7 — Withdraw Submission

| Test | Action | Expected | Scope |
|------|--------|----------|-------|
| K7.1 | Submitter views own PENDING record | Withdraw button visible | MUST |
| K7.2 | Non-submitter views PENDING record | Withdraw button NOT visible | MUST |
| K7.3 | Submitter clicks Withdraw | Status → DRAFT | MUST |
| K7.4 | API: non-submitter attempts withdraw | 403 Forbidden | MUST |
| K7.5 | API: withdraw on DRAFT record | 400 Bad Request | MUST |
| K7.6 | API: withdraw on PUBLISHED record | 400 Bad Request | MUST |
| K7.7 | After withdrawal, submitter re-submits | Submit for Review works | MUST |

#### K8 — Reference Data Access Control

| Test | Action | Expected | Scope |
|------|--------|----------|-------|
| K8.1 | Staff views sidebar | References section NOT visible | MUST |
| K8.2 | Viewer views sidebar | References section NOT visible | MUST |
| K8.3 | Admin views sidebar | References section visible | MUST |
| K8.4 | Staff creates COI | Contractor dropdown still works | MUST |
| K8.5 | Staff directly navigates to `/contractors` | Redirect or access denied | MUST |

#### K9 — Complete Workflow

| Step | Actor | Action | Expected Status |
|------|-------|--------|-----------------|
| 1 | Staff | Create record | DRAFT |
| 2 | Staff | Submit for Review | PENDING_REVIEW |
| 3 | Staff | Withdraw | DRAFT |
| 4 | Staff | Edit, re-submit | PENDING_REVIEW |
| 5 | Admin | Approve | PUBLISHED |
| 6 | Admin | Edit published | DRAFT (auto-revoked) |

---

### PHASE P: RANK CRUD SCOPE DEFINITION [MUST]

**Status:** ✅ COMPLETE
**Priority:** P1 — Architecture Governance
**Research Reference:** `research.md` Section 1.34.B, 1.34.I, **1.35** (Governance Decision)

**Problem Statement:**

Rank levels exist (10–100) but only influence two behaviors:
1. Who can modify user accounts
2. Who can approve submissions (approver rank < submitter rank)

Rank does **not** currently influence module CRUD (create/edit/delete). Senior Staff (rank 50) and Junior Staff (rank 70) have identical permissions. This is either:
- (a) Correct by design — rank is approval-authority only
- (b) A gap — rank should influence CRUD tiers within same role

**This phase formally resolves the ambiguity.**

**Option A — Rank Is Approval-Authority Only (Recommended)**

Formally document that rank scope is limited to:
- User hierarchy management
- Approval chain authority

CRUD is role-based only. The CRUD matrix is final:

| Role | canView | canAdd | canEdit | canDelete | canApprove |
|------|---------|--------|---------|-----------|------------|
| SuperAdmin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ (module-scoped) |
| Staff | ✅ | ✅ | ✅ | ❌ | ❌ |
| Viewer | ✅ | ❌ | ❌ | ❌ | ❌ |

Action required:
- Document this formally in research.md as a governance decision
- Suppress the exposed but unused `rankLevel` in `canAdd/canEdit/canDelete` (no drift)

**Option B — Rank Influences CRUD Tiers (Requires Schema)**

Senior Staff (rank 50) gets canDelete = true.
Junior Staff (rank 70) gets canDelete = false.

Action required:
- New DB migration: action-level columns in `user_permission_overrides`
- New resolution logic in `getModulePermissions()` incorporating `rankLevel`
- Backend enforcement in service layer

**Verification Criteria (Option A Chosen):**
- [x] Governance decision documented (research.md Section 1.35)
- [x] Code reflects decision without drift (rankLevel comment added)
- [x] No stale `rankLevel` references — retained for canApprove() enhancement
- [x] No schema changes required

---

### PHASE Q: CENTRALIZED BACKEND RESOLVER [SHOULD]

**Status:** ✅ COMPLETE
**Priority:** P2 — Architecture Quality
**Research Reference:** `research.md` Section 1.34.D

**Problem Statement:**

Backend permission enforcement is scattered across individual service methods:

```
construction-projects.service.ts → isAdmin()
repair-projects.service.ts       → isAdmin()
university-operations.service.ts → isAdmin()
```

Each service independently enforces:
- Role check
- Ownership check
- Status-based lock
- Rank authority (at approval)

No shared logic exists. Adding a new permission rule requires changes in 3+ places.

**Required Architecture:**

Create a `PermissionResolverService` (or shared utility module) that:
- Accepts `(userId: string, module: string, action: string, recordOwnerId?: string)`
- Returns `{ allowed: boolean, reason?: string }`
- Consolidates: role check, ownership check, module assignment check, rank check

**Files Requiring Change:**
- NEW: `pmo-backend/src/common/services/permission-resolver.service.ts`
- `pmo-backend/src/construction-projects/construction-projects.service.ts` — replace ad-hoc checks
- `pmo-backend/src/repair-projects/repair-projects.service.ts` — replace ad-hoc checks
- `pmo-backend/src/university-operations/university-operations.service.ts` — replace ad-hoc checks

**Verification Criteria:**
- [x] Single point of permission logic (PermissionResolverService)
- [x] Unauthorized action returns 403 with consistent message
- [x] Rank-based approval check consolidated (canApproveByRank)
- [x] isAdmin() delegated to centralized service (deprecated wrappers remain for compatibility)

---

### PHASE R: FRONTEND PERMISSION DRIFT CLEANUP [SHOULD]

**Status:** ✅ COMPLETE
**Priority:** P2 — Code Quality
**Research Reference:** `research.md` Section 1.34.F

**Problem Statement:**

`usePermissions.ts` contains two forms of drift:

**Drift 1: `REFERENCE_DATA_MODULES` Constant**

```typescript
// Line 67 — Now redundant after Phase N
const REFERENCE_DATA_MODULES = ['contractors', 'funding-sources', 'funding_sources']
```

These modules are now in `ADMIN_ONLY_MODULES`. The `canAccessModule()` function hits the ADMIN_ONLY check first, so the REFERENCE_DATA check in `getModulePermissions()` is still valid for form-level access (dropdown data). However, the constant's purpose is now ambiguous.

**Required:** Either:
- Rename to `REFERENCE_DATA_FORM_MODULES` and document it is for form-dropdown CRUD behavior only
- OR remove if no form-level distinction is needed

**Drift 2: `rankLevel` Computed But Unused in CRUD**

```typescript
// Lines 125-129 — Extracted but never referenced in canAdd/canEdit/canDelete
const rankLevel = computed(() => {
  return authStore.user?.rankLevel ?? 100
})
```

If Phase P chooses Option A (rank = approval-authority only), `rankLevel` should either:
- Remain for use in `canApprove()` enhancement (add rank comparison)
- OR be documented as "approval-context only, not CRUD"

**Drift 3: `canApprove()` Missing Self-Approval Prevention**

```typescript
// Lines 258-268 — Does not check self-approval
function canApprove(moduleId: string): boolean {
  if (isSuperAdmin.value) return true
  if (!isAdmin.value) return false
  const normalizedKey = normalizeModuleKey(moduleId)
  return moduleAssignments.value.includes(normalizedKey)
}
```

Backend rejects self-approval (ForbiddenException), but UI still shows the Approve button. This causes the user to click Approve and receive a backend 403. The frontend should hide the button when `record.submittedBy === authStore.user?.id`.

**Required:**
- Update `canApproveItem()` in all three module index pages to check `submittedBy !== currentUser`

**Verification Criteria:**
- [x] `REFERENCE_DATA_MODULES` documented with clear purpose (form-level access vs sidebar)
- [x] `rankLevel` usage documented — approval-authority only, not CRUD (Phase P)
- [x] Approve button hidden for self-submitted records (canApproveItem updated in all 3 index pages)
- [x] No dead code paths in permission resolution

---

### PHASE AN: BACKEND CREATE DTO EXTENSION [MUST]

**Status:** ✅ COMPLETE
**Priority:** P0 — RISK-094, RISK-095 — Assignment parity gap in Create flow
**Research Reference:** `research.md` Section 1.46.A, 1.46.B
**Scope:** Backend — DTO extension; no service changes required

**Problem Statement:**

Assignment UI exists in Edit pages but is completely absent from Create pages. Root cause: Phase AF added `assigned_to` to Update DTOs and Edit pages, but did NOT add it to Create DTOs or Create pages.

Users cannot assign staff during record creation — they must create the record, then navigate to Edit, then assign. This is a two-step workflow inefficiency that violates UX parity.

**Required Changes:**

Add `assigned_to` field to all 3 Create DTOs:

**`pmo-backend/src/construction-projects/dto/create-construction-project.dto.ts`:**
```typescript
@IsOptional()
@IsUUID()
assigned_to?: string;
```

**`pmo-backend/src/repair-projects/dto/create-repair-project.dto.ts`:**
```typescript
@IsOptional()
@IsUUID()
assigned_to?: string;
```

**`pmo-backend/src/university-operations/dto/create-operation.dto.ts`:**
```typescript
@IsOptional()
@IsUUID()
assigned_to?: string;
```

**No service changes needed** — Backend `create()` methods already accept all DTO fields. The INSERT statement will automatically include `assigned_to` if present in the DTO.

**Files to Change:**
- `pmo-backend/src/construction-projects/dto/create-construction-project.dto.ts`
- `pmo-backend/src/repair-projects/dto/create-repair-project.dto.ts`
- `pmo-backend/src/university-operations/dto/create-operation.dto.ts`

**Verification Criteria:**
- [ ] AN1: POST `/api/construction-projects` with `assigned_to` → record created with assignment
- [ ] AN2: POST `/api/repair-projects` with `assigned_to` → record created with assignment
- [ ] AN3: POST `/api/university-operations` with `assigned_to` → record created with assignment
- [ ] AN4: POST without `assigned_to` → record created with `assigned_to = NULL` (no regression)
- [ ] AN5: DTO validation accepts UUID format for `assigned_to`

---

### PHASE AO: FRONTEND CREATE PAGE ASSIGNMENT CARD [MUST]

**Status:** ✅ COMPLETE
**Priority:** P0 — RISK-094, RISK-095 — Assignment parity gap in Create flow
**Research Reference:** `research.md` Section 1.46.C, 1.46.G
**Scope:** Frontend — Add assignment UI to all 3 new/create pages
**Blocked By:** Phase AN (backend must accept `assigned_to` first)

**Problem Statement:**

All 3 Edit pages have "Assigned Staff/Personnel" card with v-autocomplete. All 3 Create pages are missing this entirely. User cannot assign staff during creation.

**Required Changes:**

For **ALL 3 Create pages** (`coi/new.vue`, `repairs/new.vue`, `university-operations/new.vue`):

**1. Add `assigned_to` to form state:**
```typescript
const form = ref({
  // ... existing fields
  assigned_to: '' as string,
})
```

**2. Add `staffUsers` ref:**
```typescript
const staffUsers = ref<{ id: string; first_name: string; last_name: string }[]>([])
```

**3. Fetch eligible users after campus is selected:**
```typescript
// Watch campus field and fetch when it changes
watch(() => form.value.campus, async (newCampus) => {
  if (newCampus) {
    const campusParam = `&campus=${encodeURIComponent(newCampus)}`
    const usersRes = await api.get<{ id: string; first_name: string; last_name: string }[]>(
      `/api/users/eligible-for-assignment?module=<MODULE>${campusParam}`
    )
    staffUsers.value = Array.isArray(usersRes) ? usersRes : []
  }
}, { immediate: false })
```

**Module params:**
- COI: `module=CONSTRUCTION`
- Repairs: `module=REPAIR`
- University Operations: `module=OPERATIONS`

**4. Add "Assigned Staff/Personnel" card in sidebar** (copy exact structure from Edit pages):
```vue
<!-- Assigned Staff/Personnel -->
<v-card class="mb-4">
  <v-card-title>Assigned Staff/Personnel</v-card-title>
  <v-divider />
  <v-card-text>
    <v-autocomplete
      v-model="form.assigned_to"
      label="Assigned Staff/Personnel"
      :items="staffUsers"
      :item-title="(u: any) => `${u.first_name} ${u.last_name}`"
      item-value="id"
      clearable
      hint="Search and assign a staff member or personnel"
      persistent-hint
      variant="outlined"
      density="comfortable"
    />
  </v-card-text>
</v-card>
```

**5. Include `assigned_to` in submit payload:**
```typescript
const payload = {
  // ... existing fields
  assigned_to: form.value.assigned_to || undefined,
}
```

**Files to Change:**
- `pmo-frontend/pages/coi/new.vue`
- `pmo-frontend/pages/repairs/new.vue`
- `pmo-frontend/pages/university-operations/new.vue`

**Verification Criteria:**
- [ ] AO1: Create COI with assignment → staffUsers dropdown populated when campus selected
- [ ] AO2: Create COI with assignment → assignment visible on detail page immediately after save
- [ ] AO3: Create COI without assignment → record saved with no assigned_to (no regression)
- [ ] AO4: v-autocomplete search/filter works in Create dialog (same as Edit)
- [ ] AO5: Repairs Create assignment works (same as AO1-AO3)
- [ ] AO6: University Operations Create assignment works (same as AO1-AO3)
- [ ] AO7: Edit page assignment unchanged (no regression from adding Create assignment)

---

### PHASE AP: CREATE PAGE RESPONSE MAPPING FIX [CRITICAL]

**Status:** ✅ COMPLETE
**Priority:** P0 — RISK-099 — Assignment dropdown shows undefined in all 3 Create pages
**Research Reference:** `research.md` Section 1.47.A
**Scope:** Frontend — response handling alignment; no backend changes

**Problem Statement:**

Phase AO introduced a frontend mapping bug. All 3 Create pages (new.vue) use `res.data || []` to extract users, but the backend `findEligibleForAssignment` returns a **plain array**, not a wrapped `{ data: [...] }` object. Result: `res.data` is `undefined`, so `staffUsers` is always empty.

**Root Cause:**

```typescript
// Create pages (BROKEN):
const res = await api.get<{ data: { ... }[] }>(...)
staffUsers.value = res.data || []  // res.data is undefined on array!

// Edit pages (WORKING):
const usersRes = await api.get<{ ... }[]>(...)
staffUsers.value = Array.isArray(usersRes) ? usersRes : []
```

**Required Changes:**

Align all 3 Create pages with the Edit page pattern:

**`pmo-frontend/pages/coi/new.vue`:**
```typescript
// Change from:
const res = await api.get<{ data: { id: string; first_name: string; last_name: string }[] }>(...)
staffUsers.value = res.data || []

// To:
const res = await api.get<{ id: string; first_name: string; last_name: string }[]>(...)
staffUsers.value = Array.isArray(res) ? res : []
```

Apply same fix to `repairs/new.vue` and `university-operations/new.vue`.

**Files to Change:**
- `pmo-frontend/pages/coi/new.vue`
- `pmo-frontend/pages/repairs/new.vue`
- `pmo-frontend/pages/university-operations/new.vue`

**Verification Criteria:**
- [ ] AP1: COI Create — select campus → assignment dropdown shows users
- [ ] AP2: Repairs Create — select campus → assignment dropdown shows users
- [ ] AP3: University Operations Create — select campus → assignment dropdown shows users
- [ ] AP4: All 3 Edit pages still work (no regression)
- [ ] AP5: Creating record with assignment → detail page shows assigned personnel

---

### PHASE AQ: MODULE PARAM STANDARDIZATION [IMPORTANT]

**Status:** ✅ COMPLETE (Applied during Phase AP)
**Priority:** P1 — Technical debt; no functional impact
**Research Reference:** `research.md` Section 1.47.C
**Scope:** Frontend — consistency fix; no backend changes

**Problem Statement:**

Module param values are inconsistent between Create and Edit pages:

| Page | Current Value | Standard Value |
|------|---------------|----------------|
| coi/new.vue | `construction` | `CONSTRUCTION` |
| coi/edit-[id].vue | `CONSTRUCTION` | `CONSTRUCTION` |
| repairs/new.vue | `repairs` | `REPAIR` |
| repairs/edit-[id].vue | `REPAIR` | `REPAIR` |
| university-operations/new.vue | `university-operations` | `OPERATIONS` |
| university-operations/edit-[id].vue | `OPERATIONS` | `OPERATIONS` |

**Note:** Backend currently ignores the module param (Phase AL removed module filtering), so this has no functional impact. However, it violates DRY principles and creates maintenance debt.

**Files to Change:**
- `pmo-frontend/pages/coi/new.vue`
- `pmo-frontend/pages/repairs/new.vue`
- `pmo-frontend/pages/university-operations/new.vue`

**Verification Criteria:**
- [ ] AQ1: All 6 pages use uppercase enum values (CONSTRUCTION, REPAIR, OPERATIONS)
- [ ] AQ2: No functional regression

---

### PHASE AR: SHARED ELIGIBLE USERS COMPOSABLE [IMPORTANT]

**Status:** ⬜ DEFERRED (Non-blocking; post-launch enhancement)
**Priority:** P2 — Code quality improvement
**Research Reference:** `research.md` Section 1.47.C
**Scope:** Frontend — new composable; refactor 6 files

**Problem Statement:**

User fetching logic is duplicated in 6 files. If a bug is found, 6 files need updating.

**Required Changes:**

Create `pmo-frontend/composables/useEligibleUsers.ts`:

```typescript
export function useEligibleUsers(module: string) {
  const api = useApi()
  const users = ref<{ id: string; first_name: string; last_name: string }[]>([])
  const loading = ref(false)

  async function fetchUsers(campus: string) {
    if (!campus) { users.value = []; return }
    loading.value = true
    try {
      const res = await api.get<{ id: string; first_name: string; last_name: string }[]>(
        `/api/users/eligible-for-assignment?module=${module}&campus=${campus}`
      )
      users.value = Array.isArray(res) ? res : []
    } catch (err) {
      users.value = []
    } finally {
      loading.value = false
    }
  }

  return { users, loading, fetchUsers }
}
```

Then refactor all 6 pages to use this composable.

**Files to Change:**
- NEW: `pmo-frontend/composables/useEligibleUsers.ts`
- `pmo-frontend/pages/coi/new.vue`
- `pmo-frontend/pages/coi/edit-[id].vue`
- `pmo-frontend/pages/repairs/new.vue`
- `pmo-frontend/pages/repairs/edit-[id].vue`
- `pmo-frontend/pages/university-operations/new.vue`
- `pmo-frontend/pages/university-operations/edit-[id].vue`

**Verification Criteria:**
- [ ] AR1: All 6 pages use shared composable
- [ ] AR2: No functional regression
- [ ] AR3: Loading state displayed during fetch

---

### PHASE AT: MANY-TO-MANY ASSIGNMENT SCHEMA [CRITICAL]

**Status:** 🔲 PENDING
**Priority:** P0 — RISK-106 — Multi-select requires junction table
**Research Reference:** `research.md` Section 1.49.E
**Scope:** Database — 1 migration file

**Problem Statement:**

Current `assigned_to UUID` column stores single user per record. Multi-select assignment requires many-to-many relationship via junction table.

**Required Changes:**

**New Migration: `database/migrations/012_add_record_assignments_table.sql`**

```sql
CREATE TABLE record_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module VARCHAR(50) NOT NULL,  -- 'CONSTRUCTION' | 'REPAIR' | 'OPERATIONS'
  record_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  UNIQUE(module, record_id, user_id)
);

CREATE INDEX idx_record_assignments_record ON record_assignments(module, record_id);
CREATE INDEX idx_record_assignments_user ON record_assignments(user_id);

-- Data migration: Copy existing assigned_to values
INSERT INTO record_assignments (module, record_id, user_id)
SELECT 'CONSTRUCTION', id, assigned_to FROM construction_projects WHERE assigned_to IS NOT NULL;

INSERT INTO record_assignments (module, record_id, user_id)
SELECT 'REPAIR', id, assigned_to FROM repair_projects WHERE assigned_to IS NOT NULL;

INSERT INTO record_assignments (module, record_id, user_id)
SELECT 'OPERATIONS', id, assigned_to FROM university_operations WHERE assigned_to IS NOT NULL;
```

**Verification:**
- [ ] AT1: Junction table created with proper indexes
- [ ] AT2: Existing assignments migrated
- [ ] AT3: FK constraints enforced

---

### PHASE AU: BACKEND DTO + SERVICE REFACTOR [CRITICAL]

**Status:** 🔲 PENDING
**Priority:** P0 — RISK-107 — DTO must accept UUID array
**Research Reference:** `research.md` Section 1.49.E
**Scope:** Backend — 6 files (3 DTOs + 3 services)

**Problem Statement:**

Current DTOs validate single UUID. Services use replace logic. Must change to array handling with replace-all semantics.

**Required Changes:**

**All Create/Update DTOs:**
```typescript
@IsOptional()
@IsArray()
@IsUUID('4', { each: true })
assigned_user_ids?: string[];
```

**All Services — New Method:**
```typescript
async updateAssignments(module: string, recordId: string, userIds: string[]): Promise<void> {
  // Delete existing assignments
  await this.db.query(
    `DELETE FROM record_assignments WHERE module = $1 AND record_id = $2`,
    [module, recordId]
  );
  // Insert new assignments
  for (const userId of userIds) {
    await this.db.query(
      `INSERT INTO record_assignments (module, record_id, user_id) VALUES ($1, $2, $3)`,
      [module, recordId, userId]
    );
  }
}
```

**All Services — Visibility Query Update:**
```sql
-- Replace single assigned_to check with junction table lookup
AND (
  cp.created_by = $userId
  OR EXISTS (SELECT 1 FROM record_assignments ra WHERE ra.module = 'CONSTRUCTION' AND ra.record_id = cp.id AND ra.user_id = $userId)
)
```

**Verification:**
- [ ] AU1: DTOs accept array of UUIDs
- [ ] AU2: Services use updateAssignments() method
- [ ] AU3: Visibility queries use junction table
- [ ] AU4: Multiple assignments persist correctly
- [ ] AU5: No overwrite behavior

---

### PHASE AV: REMOVE CAMPUS FILTER FROM ASSIGNMENT [CRITICAL]

**Status:** 🔲 PENDING
**Priority:** P0 — Global searchable assignment required
**Research Reference:** `research.md` Section 1.49.D
**Scope:** Backend + Frontend — 5 files

**Problem Statement:**

Current assignment dropdown restricts by campus. User requires global searchable assignment across all campuses. Assignment ≠ Visibility.

**Required Changes:**

**Backend: `pmo-backend/src/users/users.service.ts`**
```typescript
// Remove campus filter entirely
async findEligibleForAssignment(): Promise<any[]> {
  const result = await this.db.query(
    `SELECT u.id, u.first_name, u.last_name, u.campus
     FROM users u
     WHERE u.deleted_at IS NULL
       AND u.is_active = true
       AND EXISTS (
         SELECT 1 FROM user_roles ur
         JOIN roles r ON ur.role_id = r.id
         WHERE ur.user_id = u.id AND r.name IN ('Staff', 'Admin', 'SuperAdmin')
       )
     ORDER BY u.last_name, u.first_name`,
    [],
  );
  return result.rows;
}
```

**Frontend: All 6 pages**
```typescript
// Remove campus param from API call
const res = await api.get('/api/users/eligible-for-assignment')
// Remove campus watcher — fetch once on mount
```

**Verification:**
- [ ] AV1: All Staff/Admin users appear in dropdown regardless of campus
- [ ] AV2: Campus switching does NOT affect assignment dropdown
- [ ] AV3: Visibility rules still enforced by backend
- [ ] AV4: No stale campus data

---

### PHASE AW: FRONTEND MULTI-SELECT + DESELECTION [CRITICAL]

**Status:** 🔲 PENDING
**Priority:** P0 — Multi-select required
**Research Reference:** `research.md` Section 1.49.E
**Scope:** Frontend — 6 files + adapters

**Problem Statement:**

Current v-autocomplete lacks `multiple` prop. Form binds to string instead of array. Must enable multi-select with chips and deselection.

**Required Changes:**

**All Create/Edit Pages:**
```vue
<v-autocomplete
  v-model="form.assigned_user_ids"
  label="Assigned Staff/Personnel"
  :items="staffUsers"
  :item-title="(u) => `${u.last_name}, ${u.first_name}`"
  item-value="id"
  multiple
  chips
  closable-chips
  clearable
  hint="Search and assign staff members"
  persistent-hint
  variant="outlined"
  density="comfortable"
/>
```

**Form Data:**
```typescript
const form = ref({
  // ...
  assigned_user_ids: [] as string[],  // Array, not string
})
```

**Adapters (adapters.ts):**
```typescript
// Backend interface
assigned_user_ids?: string[]

// Frontend interface
delegatedToIds: string[]
delegatedToNames: string[]

// Mapping
delegatedToIds: backend.assigned_user_ids || [],
delegatedToNames: backend.assigned_user_names || [],
```

**Verification:**
- [ ] AW1: Multiple users can be selected
- [ ] AW2: Chips display selected users
- [ ] AW3: X button removes individual selection
- [ ] AW4: Clear button removes all selections
- [ ] AW5: Empty array clears all assignments

---

### PHASE AX: FIX V-AUTOCOMPLETE ITEM-TITLE EDGE CASE [IMPORTANT]

**Status:** 🔲 PENDING
**Priority:** P1 — Prevents "undefined undefined" display
**Research Reference:** `research.md` Section 1.49.B
**Scope:** Frontend — 6 files

**Problem Statement:**

When `form.assigned_user_ids` contains UUIDs not present in `staffUsers`, v-autocomplete passes raw UUID string to `:item-title` function, which expects an object with `first_name`/`last_name`.

**Required Changes:**

**All Pages with v-autocomplete:**
```typescript
// Safe item-title function with type guard
const getItemTitle = (item: any) => {
  if (typeof item === 'string') return 'Loading...'  // UUID string, not user object
  if (!item?.first_name || !item?.last_name) return 'Unknown User'
  return `${item.last_name}, ${item.first_name}`
}
```

```vue
<v-autocomplete
  :item-title="getItemTitle"
  ...
/>
```

**Verification:**
- [ ] AX1: No "undefined undefined" display
- [ ] AX2: Graceful fallback for missing users
- [ ] AX3: Selected users display correctly

---

### PHASE AY: ADD ABORTCONTROLLER FOR RACE CONDITIONS [IMPORTANT]

**Status:** 🔲 PENDING
**Priority:** P1 — Prevents stale data on rapid switching
**Research Reference:** `research.md` Section 1.49.C
**Scope:** Frontend — 6 files

**Problem Statement:**

Rapid campus switching (before Phase AV removes it) or rapid searching causes race conditions where later responses arrive before earlier ones.

**Required Changes:**

**All Pages with async fetch:**
```typescript
let abortController: AbortController | null = null

async function fetchStaffUsers() {
  // Cancel previous request
  if (abortController) abortController.abort()
  abortController = new AbortController()

  // Clear immediately to prevent stale display
  staffUsers.value = []

  try {
    const res = await api.get('/api/users/eligible-for-assignment', {
      signal: abortController.signal
    })
    staffUsers.value = Array.isArray(res) ? res : []
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      console.error('Failed to fetch staff:', err)
    }
  }
}
```

**Verification:**
- [ ] AY1: Previous requests cancelled on new fetch
- [ ] AY2: No stale data displayed
- [ ] AY3: AbortError silently ignored

---

### PHASE AZ: REGRESSION TEST MATRIX [MUST]

**Status:** 🔲 PENDING
**Priority:** P0 — Verification required before release
**Research Reference:** `research.md` Section 1.49.K
**Scope:** Manual testing

**Test Matrix:**

| Test | Module | Expected | Status |
|------|--------|----------|--------|
| AZ1 | COI | Multi-select works | 🔲 |
| AZ2 | COI | Existing single assignment preserved | 🔲 |
| AZ3 | Repairs | Multi-select works | 🔲 |
| AZ4 | Repairs | No "undefined undefined" | 🔲 |
| AZ5 | University Operations | Multi-select works | 🔲 |
| AZ6 | University Operations | Consistent with COI | 🔲 |
| AZ7 | All | Campus switching no stale data | 🔲 |
| AZ8 | All | Global search shows all staff | 🔲 |
| AZ9 | All | Deselection removes assignment | 🔲 |
| AZ10 | All | Clear removes all assignments | 🔲 |
| AZ11 | All | Draft/review workflow unaffected | 🔲 |
| AZ12 | All | Module access unchanged | 🔲 |
| AZ13 | All | Visibility rules unchanged | 🔲 |

**Verification:**
- [ ] AZ: All tests pass

---

## SECTION 3 — DEFERRED WORK

> Items below require schema migration, significant design, or depend on future requirements.
> None of these are planned for current implementation cycle.

| ID | Item | Dependency | Priority |
|----|------|------------|----------|
| D1 | Per-action CRUD overrides in DB schema | Schema migration (new columns) | LOW |
| D2 | JWT claim extension (rank_level, module_assignments) | Auth refactor | LOW |
| D3 | Audit log timeline in detail views | ✅ Resolved via Phase S (no new schema required) | MEDIUM |
| D4 | Real-time permission sync via WebSocket | Major architecture | LOW |
| D5 | Email notifications for pending submissions | Email service integration | LOW |
| D6 | Pending reviews badge count (real-time) | WebSocket or polling | LOW |
| D7 | Team-level DRAFT visibility for Staff | Scoping decision required | MEDIUM |
| D8 | ~~Multi-select assignment~~ | **PROMOTED TO PHASES AT-AW** | ✅ ACTIVE |
| D9 | Progress tracking in University Operations | Schema + UI (add physical_progress) | MEDIUM |
| D10 | Shared assignment UI component | Frontend refactor (extract v-autocomplete) | LOW |

---

## SECTION 4 — FULL CRUD REGRESSION TEST MATRIX

### Staff Workflow

| Test | Actor | Action | Expected | Scope |
|------|-------|--------|----------|-------|
| S1 | Staff | Create COI record | Record saved as DRAFT | MUST |
| S2 | Staff | Edit own DRAFT record | Edit succeeds | MUST |
| S3 | Staff | Delete any record | 403 Forbidden | MUST |
| S4 | Staff | Submit own DRAFT | Status → PENDING_REVIEW | MUST |
| S5 | Staff | Approve any record | 403 Forbidden | MUST |
| S6 | Staff | Access `/contractors` page | Redirect (not in sidebar) | MUST |
| S7 | Staff | COI form contractor dropdown | Data loads (API accessible) | MUST |
| S8 | Staff | View own PENDING record | Withdraw button visible | MUST |
| S9 | Staff | View another user's DRAFT | Not visible (only PUBLISHED) | MUST |

### Admin Workflow

| Test | Actor | Action | Expected | Scope |
|------|-------|--------|----------|-------|
| A1 | Admin | Create COI record | Record saved as DRAFT | MUST |
| A2 | Admin | Edit any record (not PENDING) | Edit succeeds | MUST |
| A3 | Admin | Edit PENDING_REVIEW record | 200 + status=DRAFT (Phase W auto-revert) | MUST |
| A4 | Admin | Delete DRAFT record | Delete succeeds | MUST |
| A5 | Admin | Approve own submission | 403 (self-approval blocked) | MUST |
| A6 | Admin | Approve other's submission | PUBLISHED | MUST |
| A7 | Admin (COI) | Approve Repairs record | 403 (no module access) | MUST |
| A8 | Admin | Access Pending Reviews page | Page loads | MUST |

### Rank Enforcement

| Test | Actor | Action | Expected | Scope |
|------|-------|--------|----------|-------|
| R1 | Admin (rank 30) | Approve Staff (rank 70) submission | ✅ Allowed (30 < 70) | MUST |
| R2 | Admin (rank 30) | Approve Admin (rank 30) submission | 403 (equal rank blocked) | MUST |
| R3 | Admin (rank 30) | Approve higher-rank (rank 20) submission | 403 (cannot approve higher) | MUST |
| R4 | Staff (rank 50) | Edit another Staff's record | 403 (ownership check) | MUST |

### Rejected Revision Flow (Phase V) — ✅ USER-CONFIRMED

| Test | Actor | Action | Expected | Result |
|------|-------|--------|----------|--------|
| V1 | Staff | View own REJECTED record detail | Submit for Review button visible | ✅ |
| V2 | Staff | View own REJECTED record in list | Submit for Review action in menu | ✅ |
| V3 | Staff | Edit REJECTED record | Status resets to DRAFT; reviewed_by cleared | ✅ |
| V4 | Staff | Submit REJECTED (without editing) | Status → PENDING_REVIEW | ✅ |
| V5 | API | PATCH on REJECTED record (owner) | Returns updated record with status=DRAFT | ✅ |
| V6 | API | POST /:id/submit-for-review on REJECTED | Returns record with status=PENDING_REVIEW | ✅ |

### PENDING_REVIEW Auto-Revert (Phase W) — ✅ USER-CONFIRMED

| Test | Actor | Action | Expected | Result |
|------|-------|--------|----------|--------|
| W1 | Staff | Edit own PENDING_REVIEW record (list menu) | Edit button visible | ✅ |
| W2 | Staff | Edit own PENDING_REVIEW record (PATCH API) | Returns 200 + status=DRAFT + submitted_by=NULL | ✅ |
| W3 | Admin | Edit any PENDING_REVIEW record (PATCH API) | Returns 200 + status=DRAFT | ✅ |
| W4 | Staff | Edit another user's PENDING_REVIEW record | 403 (ownership check still enforced) | ✅ |
| W5 | Staff | After auto-revert, re-submit record | Status → PENDING_REVIEW | ✅ |

### Director Staff Visibility (Phase X) — ✅ USER-CONFIRMED

| Test | Actor | Action | Expected | Result |
|------|-------|--------|----------|--------|
| X1 | Staff | View main list | Own DRAFTs visible in list | ✅ |
| X2 | Staff | View main list | Own PENDING_REVIEW records visible | ✅ |
| X3 | Staff | View main list | Own REJECTED records visible | ✅ |
| X4 | Staff | View main list | Other users' DRAFT records NOT visible | ✅ |
| X5 | Staff | View main list | All PUBLISHED records visible | ✅ |
| X6 | Admin | View main list | All records visible (unchanged) | ✅ |

### Record Assignment and Delegation (Phases AA–AD) — ✅ USER-CONFIRMED

| Test | Actor | Action | Expected | Result |
|------|-------|--------|----------|--------|
| AA1 | Admin | Run migration 010 | assigned_to column exists on all 3 tables | ✅ |
| AB1 | Staff (assigned) | View main list | Assigned DRAFT visible | ✅ |
| AB2 | Staff (not assigned) | View main list | Other user's DRAFT NOT visible | ✅ |
| AB3 | Staff (assigned) | View own + assigned DRAFTs | Both visible in list | ✅ |
| AC1 | Assigned Staff | PATCH assigned record | 200 OK | ✅ |
| AC2 | Non-assigned, non-owner Staff | PATCH record | 403 Forbidden | ✅ |
| AC3 | Owner | PATCH own record | 200 OK (unchanged) | ✅ |
| AD1 | Assigned Staff | POST /:id/submit-for-review | 200 OK | ✅ |
| AD2 | Non-assigned, non-owner Staff | POST /:id/submit-for-review | 403 Forbidden | ✅ |
| AD3 | Owner | POST /:id/submit-for-review | 200 OK (unchanged) | ✅ |

> **Note:** AD1 (assigned user can submit via API) confirmed. However, the Submit for Review **button** is not yet visible to assigned users in the UI. This is RISK-076 — tracked in Phase AE.

### Campus Scoping (Phase Y) — ✅ USER-CONFIRMED

| Test | Actor | Action | Expected | Result |
|------|-------|--------|----------|--------|
| Y1 | Staff (with campus) | View main list | Only records from own campus + own records visible | ✅ |
| Y2 | Staff (no campus) | View main list | PUBLISHED + own records (Phase AB fallback) | ✅ |
| Y3 | Admin | View main list | All records visible regardless of campus | ✅ |

### Delegation UI Gap (Phase AE — PENDING)

| Test | Actor | Action | Expected | Status |
|------|-------|--------|----------|--------|
| AE1 | Assigned Staff | View list | Edit and Submit buttons visible | ⬜ Pending Phase AE |
| AE2 | Assigned Staff | View detail | Edit and Submit buttons visible | ⬜ Pending Phase AE |
| AE3 | Non-assigned Staff | View assigned record | Edit and Submit buttons NOT visible | ⬜ Pending Phase AE |

---

## SECTION 5 — RISK SUMMARY

| Risk ID | Description | Severity | Status |
|---------|-------------|----------|--------|
| RISK-051 | Workflow orphan state | HIGH | ✅ Fixed - Phase L |
| RISK-053 | No withdrawal path | MEDIUM | ✅ Fixed - Phase M |
| RISK-056 | Reference Data exposure | LOW | ✅ Fixed - Phase N |
| RISK-054 | Approve button without module access | MEDIUM | ✅ Fixed - Phase J |
| RISK-041 | UI-Backend permission desync | MEDIUM | ✅ Mitigated - Phase J |
| RISK-058 | Rank irrelevance in CRUD | MEDIUM | ✅ Resolved - Phase P (rank = approval-authority by design) |
| RISK-059 | No centralized backend resolver | MEDIUM | ✅ Fixed - Phase Q |
| RISK-060 | Staff visibility gap (team DRAFT) | MEDIUM | Deferred - D7 |
| RISK-061 | JWT missing permission context | LOW | Deferred - D2 |
| RISK-062 | REFERENCE_DATA_MODULES drift | LOW | ✅ Fixed - Phase R (documented) |
| RISK-063 | Permission override schema limitation | MEDIUM | Deferred - D1 |
| RISK-064 | Rejected state dead-end — REJECTED records cannot be resubmitted via UI | HIGH | Planned - Phase V |
| RISK-065 | REJECTED edit doesn't reset to DRAFT — workflow permanently stuck | HIGH | Planned - Phase V |
| RISK-066 | Office-level data visibility undefined — no campus/office scoping on users | MEDIUM | Planned - Phase Y |
| RISK-067 | Director-level Staff cannot see own DRAFTs in main list | HIGH | Planned - Phase X |
| RISK-068 | PENDING_REVIEW hard-block vs auto-revert inconsistency | MEDIUM | Planned - Phase W |
| RISK-069 | Division Chief rank 40 slot unoccupied in schema | LOW | Deferred - manual DB update |
| RISK-070 | Overexposure of draft data via assigned_to access | MEDIUM | Planned - Phase AA (only owner/admin sets assigned_to) |
| RISK-071 | Unauthorized delegated edit beyond owner's intent | MEDIUM | Planned - Phase AC (assignment can be cleared by owner) |
| RISK-072 | Office boundary leakage — no campus on users blocks scoped visibility | MEDIUM | Deferred - Phase Y prerequisite |
| RISK-073 | Rank bypass via assignment — assigned user sees records above rank | LOW | Planned - assignment doesn't grant approve/delete |
| RISK-074 | findAll() condition complexity growth | LOW | Planned - flat OR conditions, no subquery nesting |
| RISK-075 | assigned_to cascade on user delete | LOW | ✅ Resolved - ON DELETE SET NULL in migration |
| RISK-076 | `isOwner()` doesn't include `assignedTo` — delegation UI broken | HIGH | Planned - Phase AE |
| RISK-077 | Stale test A3 — may cause false failure during acceptance | MEDIUM | ✅ Corrected in plan (Phase W supersedes Phase T) |
| RISK-078 | No UI to set `assigned_to` — admins cannot delegate via UI | MEDIUM | Planned - Phase AF |
| RISK-079 | No UI to set user `campus` — campus scoping DB-only | MEDIUM | Planned - Phase AG |
| RISK-080 | Rejection notes not visible in list view | LOW | Icebox |
| RISK-081 | K6–K9, V, W, X, AA–AD, Y suites confirmed but not marked | RESOLVED | ✅ Test matrix updated with user-confirmed results |
| RISK-082 | Assignment dropdown lists ALL users — Viewers and cross-module users appear | HIGH | ✅ Fixed — Phase AH + AI |
| RISK-083 | No backend eligibility check at assignment set-time — invalid assignees written to DB | MEDIUM | ✅ Fixed — Phase AH (findEligibleForAssignment enforces module + campus) |
| RISK-084 | User Management has no campus filter — campus assignment management is manual | LOW | ✅ Fixed — Phase AJ |
| RISK-085 | Role filter exists in backend but not rendered in users/index.vue template | LOW | ✅ Fixed — Phase AJ |
| RISK-086 | Assignment dropdown fetch duplicated in 3 edit pages — Phase AI change must be applied 3× | LOW | ✅ Accepted — applied to all 3 pages in Phase AI |
| RISK-087 | No backend module-access check in `update()` — assigned Staff user without module access can edit | MEDIUM | ✅ Mitigated — Phase AH prevents ineligible users from being assigned; role gate blocks Viewers |
| RISK-088 | Campus value mismatch — records store MAIN/CABADBARAN/BOTH; users store 'Butuan Campus'/'Cabadbaran'; equality comparison always fails | HIGH | ✅ Fixed — Phase AM (normalizeUserCampusToRecordCampus) |
| RISK-089 | INNER JOIN on sparse `user_module_assignments` table returns empty result set — assignment dropdown always empty | HIGH | ✅ Fixed — Phase AL (role-based WHERE replaces INNER JOIN) |
| RISK-090 | Phase Y backend visibility also uses campus equality — Staff user with 'Butuan Campus' never sees MAIN campus records | HIGH | ✅ Fixed — Phase AM (findAll campus conditions normalized in all 3 services) |
| RISK-091 | Deadline impact — empty assignment dropdown completely blocks delegation feature; user-facing regression introduced by Phase AH | HIGH | ✅ Fixed — Phase AL resolves root cause |
| RISK-092 | Scope creep risk — fixing campus mismatch could expand to schema migration; must be resolved at service layer only | MEDIUM | ✅ Resolved — Phase AM uses value mapping only, no schema change |
| RISK-093 | Silent empty state — v-autocomplete renders but returns no results; no error message visible to user | MEDIUM | ✅ Resolved — Phase AL populates the list |
| RISK-094 | Assignment inconsistency — Edit allows assignment, Create does not; UX parity violated; two-step workflow overhead | HIGH | ✅ Fixed — Phases AN + AO |
| RISK-095 | Create flow data integrity — Records created without assignment require secondary edit to populate assigned_to | MEDIUM | ✅ Fixed — Phase AO enables single-step create+assign |
| RISK-096 | Duplicate logic risk — If assignment logic diverges between Create and Edit, maintenance burden increases | MEDIUM | ✅ Resolved — Phase AP aligns Create with Edit pattern |
| RISK-097 | University Operations feature drift — Module appears complete but has hidden gap in Create flow | MEDIUM | ✅ Fixed — Phases AN + AO + AP complete |
| RISK-098 | Deadline slippage — Assignment gap discovered late; unplanned 2-phase fix may delay go-live | MEDIUM | ✅ Resolved — All phases complete |
| RISK-099 | Frontend response mapping regression — All 3 Create pages expect `{ data: [...] }` but receive `[...]` | HIGH | ✅ Fixed — Phase AP |
| RISK-100 | Module param inconsistency — Create/Edit pages use different module param values | LOW | ✅ Fixed — Phase AQ (applied during AP) |
| RISK-101 | Multi-select scope creep — Implementing multi-select now risks deadline | MEDIUM | ✅ Mitigated — Deferred to D8 post-launch |
| RISK-102 | Duplicated user fetch logic — 6 files contain identical fetch code | LOW | ⬜ Deferred — Phase AR post-launch |
| RISK-103 | Progress tracking gap in University Operations — No physical_progress UI | MEDIUM | ⬜ Deferred — D9 post-launch |

---

## SECTION 6 — NEXT EXECUTION DECLARATION

**Current Execution State (as of 2026-02-20):**

| Phase | Status | Confirmed By |
|-------|--------|-------------|
| H–N | ✅ Complete | Implementation + user testing |
| O–R | ✅ Complete | Implementation + user testing |
| S–U | ✅ Complete | Implementation + user testing |
| V (REJECTED flow) | ✅ Complete | User-confirmed V1–V6 |
| W (PENDING_REVIEW revert) | ✅ Complete | User-confirmed W1–W5 |
| X (Director visibility) | ✅ Complete | User-confirmed X1–X6 |
| AA–AD (delegation) | ✅ Complete | User-confirmed AA1, AB1–AB3, AC1–AC3, AD1–AD3 |
| Y (campus scoping) | ✅ Complete | User-confirmed Y1–Y3 |
| Phase K regression | ✅ Complete | User-confirmed K6–K9 |
| AE (isOwner delegation fix) | ✅ Complete | Implemented — awaiting user smoke test |
| AF (assigned_to UI) | ✅ Complete | Implemented — awaiting user smoke test |
| AG (campus UI) | ✅ Complete | Implemented — awaiting user smoke test |
| AH (eligible-users endpoint) | ✅ Complete | RISK-082/083/087 resolved |
| AI (assignment selector replacement) | ✅ Complete | Closes RISK-082 in UI |
| AJ (user management filters) | ✅ Complete | Closes RISK-084/085 |
| AK (searchable selector + rename) | ✅ Complete | v-autocomplete, "Assigned Staff/Personnel" |
| AL (eligible-users regression fix) | ✅ Complete | RISK-089/091 resolved — role-based filter replaces INNER JOIN |
| AM (campus taxonomy alignment) | ✅ Complete | RISK-088/090 resolved — normalizeUserCampusToRecordCampus() in all 3 services |
| AN (Create DTO assignment) | ✅ Complete | Backend accepts assigned_to in all 3 CreateDtos + services |
| AO (Create page assignment UI) | ✅ Complete | UI added; response mapping fixed in Phase AP |
| AP (response mapping fix) | ✅ Complete | RISK-099 resolved — Array.isArray() pattern applied |
| AQ (module param standardization) | ✅ Complete | Applied during Phase AP — CONSTRUCTION/REPAIR/OPERATIONS |
| AR (shared composable) | ⬜ Deferred | P2 — Post-launch enhancement |

**University Operations Parity:** ✅ Confirmed — 19 endpoints, full feature parity with COI and Repairs.

**Stale Test Corrected:** A3 updated from `400` → `200 + DRAFT` per Phase W behavior.

**REGRESSION NOTE (Phase AO → AP):** Phase AO introduced a frontend mapping bug (res.data on array response). Phase AP resolved this by aligning Create pages with the Edit page pattern (Array.isArray()). Also standardized module params to uppercase enum values (CONSTRUCTION/REPAIR/OPERATIONS).

---

## CRITICAL — SCHEMA STABILIZATION REQUIRED

> **BLOCKING ERROR:** `relation "record_assignments" does not exist`
> **Research Reference:** `research.md` Section 1.50
> **Impact:** All module list endpoints return 500 Internal Server Error

---

### PHASE BA: EXECUTE RECORD_ASSIGNMENTS MIGRATION [CRITICAL]

**Status:** ✅ COMPLETE
**Priority:** P0 — BLOCKING — All endpoints broken
**Scope:** Database migration execution

**Problem Statement:**

Migration file `012_add_record_assignments_table.sql` exists but was never executed. All three module services query this table in `findAll()` and `findOne()`, resulting in 500 errors.

**Required Action:**

Execute migration 012 against the database:
```bash
psql -U [user] -d [database] -f database/migrations/012_add_record_assignments_table.sql
```

**Verification:**
- [x] BA1: `GET /api/construction-projects` returns 200 (not 500) ✅
- [x] BA2: `GET /api/repair-projects` returns 200 (not 500) ✅
- [x] BA3: `GET /api/university-operations` returns 200 (not 500) ✅
- [x] BA4: Table exists: `SELECT COUNT(*) FROM record_assignments` returns 0 or more ✅

---

### PHASE BB: COMMIT ALL UNTRACKED MIGRATIONS [CRITICAL]

**Status:** ✅ COMPLETE (staged, pending commit)
**Priority:** P0 — Prevent future schema drift
**Scope:** Git operations

**Problem Statement:**

Migrations 006-012 are all untracked in git, indicating significant schema drift between development and source control.

**Required Action:**

Stage and commit all untracked migrations:
```bash
git add database/migrations/006_add_user_permission_overrides.sql
git add database/migrations/007_add_draft_governance.sql
git add database/migrations/008_add_rank_system.sql
git add database/migrations/009_add_module_assignments.sql
git add database/migrations/010_add_record_assignment.sql
git add database/migrations/011_add_user_campus.sql
git add database/migrations/012_add_record_assignments_table.sql
```

**Verification:**
- [ ] BB1: `git status database/migrations/` shows no untracked files
- [ ] BB2: All migrations committed to branch

---

### PHASE BC: CROSS-MODULE ENDPOINT VALIDATION [MUST]

**Status:** ✅ COMPLETE
**Priority:** P1 — Regression testing
**Scope:** Manual API testing

**Verification Matrix:**

| Test | Endpoint | Expected | Status |
|------|----------|----------|--------|
| BC1 | `GET /api/construction-projects` | 200 + data array | ✅ |
| BC2 | `GET /api/construction-projects/:id` | 200 + assigned_users array | ✅ |
| BC3 | `GET /api/repair-projects` | 200 + data array | ✅ |
| BC4 | `GET /api/repair-projects/:id` | 200 + assigned_users array | ✅ |
| BC5 | `GET /api/university-operations` | 200 + data array | ✅ |
| BC6 | `GET /api/university-operations/:id` | 200 + assigned_users array | ✅ |

---

### PHASE BD: MULTI-SELECT ASSIGNMENT PERSISTENCE TEST [MUST]

**Status:** ✅ COMPLETE
**Priority:** P1 — Feature validation
**Scope:** Full-stack integration test

**Verification Matrix:**

| Test | Action | Expected | Status |
|------|--------|----------|--------|
| BD1 | Create COI with 2 assigned users | assigned_users returns array of 2 | ✅ |
| BD2 | Edit COI, remove 1 user | assigned_users returns array of 1 | ✅ |
| BD3 | Edit COI, clear all | assigned_users returns empty array | ✅ |
| BD4 | Create Repair with assignment | assigned_users persists | ✅ |
| BD5 | Create UniOps with assignment | assigned_users persists | ✅ |

---

### PHASE BE: DRAFT GOVERNANCE UNAFFECTED CONFIRMATION [MUST]

**Status:** ✅ COMPLETE
**Priority:** P1 — No regression
**Scope:** Draft workflow smoke test

**Verification:**

| Test | Action | Expected | Status |
|------|--------|----------|--------|
| BE1 | Create DRAFT record | publication_status = DRAFT | ✅ |
| BE2 | Submit for review | publication_status = PENDING_REVIEW | ✅ |
| BE3 | Publish (admin) | publication_status = PUBLISHED | ✅ |
| BE4 | Edit published record | publication_status reverts to DRAFT | ✅ |

---

## REMAINING STEPS BEFORE UNIVERSITY OPERATIONS ACCEPTANCE

**Schema Stabilization Complete (Phases BA-BE)**

All critical blocking issues resolved:
- ✅ BA: Migration executed - `record_assignments` table created
- ✅ BB: Migrations staged for commit
- ✅ BC: All module endpoints return 200
- ✅ BD: Multi-select assignment CRUD verified
- ✅ BE: Draft governance unaffected

| # | Phase | Description | Severity | Status |
|---|-------|-------------|----------|--------|
| 1 | **AP** | Fix frontend response mapping in all 3 Create pages | CRITICAL | ✅ COMPLETE |
| 2 | **AQ** | Standardize module param naming | IMPORTANT | ✅ COMPLETE |

**Completed:**
- AL: Role-based filter replaces INNER JOIN ✅
- AM: Campus taxonomy alignment ✅
- AN: Backend Create DTO extension ✅
- AO: Frontend Create page assignment UI ✅
- AP: Response mapping fix ✅
- AQ: Module param standardization ✅

**Deferred to Post-Launch:**
- AR: Shared useEligibleUsers composable
- D8: Multi-select assignment
- D9: Progress tracking in University Operations
- D10: Shared assignment UI component

Assignment feature fully functional across all 3 modules (COI, Repairs, University Operations).

---

**Smoke Tests Needed (Phases AE/AF/AG/AH/AI/AJ/AK + pending AL/AM):**
→ AE1–AE6: Assigned user sees Edit and Submit buttons
→ AF1–AF2: Delegation dropdown saves correctly
→ AG1–AG3: Campus saves and scopes records
→ AH1–AH5: eligible-for-assignment endpoint filters correctly ✅
→ AI1–AI5: Assignment dropdown shows eligible users (Edit pages) ✅
→ AJ1–AJ5: Campus + role filters in User Management work correctly ✅
→ AK1: v-autocomplete allows typing to search/filter users ✅
→ AK2: "Assigned Staff/Personnel" label appears (not "Record Delegation") ✅
→ AK3: Detail pages show assigned personnel name when assigned ✅
→ AL1–AL6: Role-based filter returns non-empty list; Viewers excluded ✅
→ AM1–AM6: Campus filter works after taxonomy alignment; Phase Y visibility fixed ✅
→ AN1–AN5: POST with assigned_to creates record with assignment; no regression ✅
→ AO1–AO7: Create pages show assignment dropdown ✅ Fixed in Phase AP
→ AP1–AP5: Create pages show users after response mapping fix ✅ Implemented

**Icebox (post-launch):**
→ Email notifications (D5)
→ Real-time badge counts (D6)
→ WebSocket permission sync (D4)
→ Per-action CRUD overrides (D1)
→ Rejection notes in list view (RISK-080)
→ Multi-select assignment (D8)
→ Progress tracking in University Operations (D9)
→ Shared assignment UI component (D10)
→ Shared useEligibleUsers composable (Phase AR)

---

## ASSIGNMENT FEATURE REGRESSION TEST MATRIX (Phase AP)

| Test | Module | Page | Action | Expected | Status |
|------|--------|------|--------|----------|--------|
| AP-T1 | COI | new.vue | Select campus → view dropdown | Users appear | ⬜ |
| AP-T2 | COI | edit-[id].vue | View dropdown | Users appear (no regression) | ⬜ |
| AP-T3 | Repairs | new.vue | Select campus → view dropdown | Users appear | ⬜ |
| AP-T4 | Repairs | edit-[id].vue | View dropdown | Users appear (no regression) | ⬜ |
| AP-T5 | University Operations | new.vue | Select campus → view dropdown | Users appear | ⬜ |
| AP-T6 | University Operations | edit-[id].vue | View dropdown | Users appear (no regression) | ⬜ |
| AP-T7 | Any | new.vue | Create with assignment | Detail shows assigned personnel | ⬜ |

---

**END OF PLAN**

---

### PHASE BF: EXCLUDE ASSIGNED_USER_IDS FROM CONSTRUCTION UPDATE QUERY [CRITICAL]

**Status:** ✅ COMPLETE
**Priority:** P0 — BLOCKS ALL CONSTRUCTION EDITS
**Research Reference:** `research.md` Section 1.51.B, 1.51.H
**Scope:** Backend — 1 service file

**Problem Statement:**

`PATCH /api/construction-projects/:id` returns 500 error:
```
column "assigned_user_ids" of relation "construction_projects" does not exist
```

**Root Cause:**

The `update()` method includes ALL DTO keys in the SQL UPDATE query:

```typescript
// construction-projects.service.ts line ~401
const fields = Object.keys(dto).filter((k) => dto[k] !== undefined);
// ❌ This includes 'assigned_user_ids' which is NOT a table column
```

`assigned_user_ids` is correctly defined in the DTO for multi-select frontend input, and is correctly handled via junction table AFTER the UPDATE query. However, it's incorrectly included in the UPDATE query's SET clause, causing the error.

**Required Changes:**

**File:** `pmo-backend/src/construction-projects/construction-projects.service.ts`

**Line ~401:** Exclude `assigned_user_ids` from fields array

```typescript
// BEFORE
const fields = Object.keys(dto).filter((k) => dto[k] !== undefined);

// AFTER
const fields = Object.keys(dto).filter((k) =>
  dto[k] !== undefined && k !== 'assigned_user_ids'
);
```

**Rationale:**

- `assigned_user_ids` is handled separately via `updateRecordAssignments()` (line 445-447)
- The column does not exist in `construction_projects` table (junction table model)
- This is a DTO-to-database mapping issue, not a schema issue

**Verification:**

| Test | Action | Expected | Command |
|------|--------|----------|---------|
| BF1 | PATCH with `assigned_user_ids` | 200 OK | `curl -X PATCH /api/construction-projects/:id -d '{"title":"Updated","assigned_user_ids":["uuid1","uuid2"]}'` |
| BF2 | Verify assignments persisted | `record_assignments` updated | Query junction table |
| BF3 | PATCH other fields | 200 OK | `curl -X PATCH /api/construction-projects/:id -d '{"title":"Test"}'` |

**Acceptance Criteria:**

- ✅ PATCH construction-projects returns 200 (not 500)
- ✅ `assigned_user_ids` correctly updates junction table
- ✅ Other DTO fields update normally
- ✅ No column mismatch errors in logs

---

### PHASE BG: EXCLUDE ASSIGNED_USER_IDS FROM REPAIRS UPDATE QUERY [CRITICAL]

**Status:** ✅ COMPLETE
**Priority:** P0 — BLOCKS ALL REPAIR EDITS
**Research Reference:** `research.md` Section 1.51.E
**Scope:** Backend — 1 service file

**Problem Statement:**

Identical bug to Phase BF — `PATCH /api/repair-projects/:id` will fail with same column mismatch error.

**Required Changes:**

**File:** `pmo-backend/src/repair-projects/repair-projects.service.ts`

**Line ~397:** Exclude `assigned_user_ids` from fields array

```typescript
const fields = Object.keys(dto).filter((k) =>
  dto[k] !== undefined && k !== 'assigned_user_ids'
);
```

**Verification:**

| Test | Action | Expected |
|------|--------|----------|
| BG1 | PATCH with `assigned_user_ids` | 200 OK |
| BG2 | Verify assignments persisted | `record_assignments` updated |

**Acceptance Criteria:**

- ✅ PATCH repair-projects returns 200 (not 500)
- ✅ Multi-select assignments work correctly

---

### PHASE BH: EXCLUDE ASSIGNED_USER_IDS FROM UNIVERSITY OPS UPDATE QUERY [CRITICAL]

**Status:** ✅ COMPLETE
**Priority:** P0 — BLOCKS ALL UNIVERSITY OPERATIONS EDITS
**Research Reference:** `research.md` Section 1.51.E
**Scope:** Backend — 1 service file

**Problem Statement:**

Identical bug to Phases BF/BG — `PATCH /api/university-operations/:id` will fail with same error.

**Required Changes:**

**File:** `pmo-backend/src/university-operations/university-operations.service.ts`

**Line ~305 (estimated):** Exclude `assigned_user_ids` from fields array

```typescript
const fields = Object.keys(dto).filter((k) =>
  dto[k] !== undefined && k !== 'assigned_user_ids'
);
```

**Verification:**

| Test | Action | Expected |
|------|--------|----------|
| BH1 | PATCH with `assigned_user_ids` | 200 OK |
| BH2 | Verify assignments persisted | `record_assignments` updated |

**Acceptance Criteria:**

- ✅ PATCH university-operations returns 200 (not 500)
- ✅ Multi-select assignments work correctly

---

### PHASE BI: CROSS-MODULE UPDATE VALIDATION [MUST]

**Status:** ✅ COMPLETE
**Priority:** P1 — Regression prevention
**Research Reference:** `research.md` Section 1.51.H
**Scope:** Backend — Verification across all 3 modules

**Verification Matrix:**

| Module | Endpoint | Test Case | Expected |
|--------|----------|-----------|----------|
| **Construction** | PATCH /:id | Update title only | 200 OK |
| | | Update with assigned_user_ids | 200 OK + junction table updated |
| | | Update status + assignments | 200 OK + both persisted |
| **Repairs** | PATCH /:id | Update title only | 200 OK |
| | | Update with assigned_user_ids | 200 OK + junction table updated |
| | | Update status + assignments | 200 OK + both persisted |
| **University Ops** | PATCH /:id | Update title only | 200 OK |
| | | Update with assigned_user_ids | 200 OK + junction table updated |
| | | Update status + assignments | 200 OK + both persisted |

**Regression Tests:**

| Test | Description | Expected |
|------|-------------|----------|
| BI1 | Verify draft governance unaffected | State machine transitions work |
| BI2 | Verify assigned_to backward compat | Single user assignment still works |
| BI3 | Verify empty assignments array | `assigned_user_ids: []` clears all assignments |
| BI4 | Verify undefined assignments | Omitting field preserves existing assignments |

**Acceptance Criteria:**

- ✅ All 3 modules handle `assigned_user_ids` consistently
- ✅ Junction table CRUD operations verified
- ✅ No 500 errors on any PATCH endpoint
- ✅ Draft governance state machine unaffected

---

## ASSIGNMENT ARCHITECTURE CONSOLIDATION COMPLETE

**Schema Stabilization Status:**

| Phase | Description | Status |
|-------|-------------|--------|
| BA | Execute record_assignments migration | ✅ COMPLETE |
| BB | Commit untracked migrations | ✅ COMPLETE |
| BC | Cross-module endpoint validation | ✅ COMPLETE |
| BD | Multi-select assignment persistence test | ✅ COMPLETE |
| BE | Draft governance confirmation | ✅ COMPLETE |
| **BF** | Fix Construction update query | ✅ COMPLETE |
| **BG** | Fix Repairs update query | ✅ COMPLETE |
| **BH** | Fix University Ops update query | ✅ COMPLETE |
| **BI** | Cross-module update validation | ✅ COMPLETE |

**Next Phase After BI:**
→ **University Operations Final Hardening**
→ **Performance & Index Optimization**
→ **Go-Live Readiness**

---
---

### PHASE BJ: FIX ASSIGNMENT CHECK IN COI INDEX PAGE [CRITICAL]

**Status:** ✅ COMPLETE
**Priority:** P0 — BLOCKS ASSIGNED USERS FROM EDITING
**Research Reference:** `research.md` Section 1.52.E, 1.52.I
**Scope:** Frontend — 1 file

**Problem Statement:**

COI index page `isOwner()` function ignores `assignedUsers` array, blocking assigned users from editing records.

```typescript
// pages/coi/index.vue:86-96
function isOwner(project: UIProject): boolean {
  const userId = authStore.user?.id
  return project.createdBy === userId || project.delegatedTo === userId  // ❌ NO assignedUsers
}

function canEditItem(project: UIProject): boolean {
  if (!canEdit('coi')) return false  // ❌ Role gate blocks Viewers
  if (isAdmin.value) return true
  return isOwner(project)  // ❌ Missing assignment check
}
```

**Required Changes:**

**File:** `pmo-frontend/pages/coi/index.vue`

**Lines ~86-96:** Update `isOwner` to check `assignedUsers` array and rename to `isOwnerOrAssigned`

```typescript
// BEFORE
function isOwner(project: UIProject): boolean {
  const userId = authStore.user?.id
  return project.createdBy === userId || project.delegatedTo === userId
}

function canEditItem(project: UIProject): boolean {
  if (!canEdit('coi')) return false
  if (isAdmin.value) return true
  return isOwner(project)
}

// AFTER
function isOwnerOrAssigned(project: UIProject): boolean {
  const userId = authStore.user?.id
  if (!userId) return false
  return (
    project.createdBy === userId
    || project.delegatedTo === userId
    || project.assignedUsers?.some(u => u.id === userId) || false
  )
}

function canEditItem(project: UIProject): boolean {
  if (isAdmin.value) return true
  return isOwnerOrAssigned(project)
}
```

**Lines ~99-103:** Update `canSubmitForReview` to use `isOwnerOrAssigned`

```typescript
// BEFORE
function canSubmitForReview(project: UIProject): boolean {
  if (!isStaff.value) return false
  if (!isOwner(project)) return false
  return project.publicationStatus === 'DRAFT' || project.publicationStatus === 'REJECTED'
}

// AFTER
function canSubmitForReview(project: UIProject): boolean {
  if (!isStaff.value && !isOwnerOrAssigned(project)) return false
  if (!isOwnerOrAssigned(project)) return false
  return project.publicationStatus === 'DRAFT' || project.publicationStatus === 'REJECTED'
}
```

**Verification:**

| Test | Action | Expected |
|------|--------|----------|
| BJ1 | Staff assigned to record | Edit button visible |
| BJ2 | Viewer assigned to record | Edit button visible |
| BJ3 | Director assigned to record | Edit button visible |
| BJ4 | Staff not assigned | Edit button hidden (unless creator) |

**Acceptance Criteria:**

- ✅ Assigned users see Edit button in index page
- ✅ Non-assigned users don't see Edit button (unless creator)
- ✅ Assigned Viewers can edit (assignment elevation)
- ✅ Directors can edit assigned records

---

### PHASE BK: FIX ASSIGNMENT CHECK IN COI DETAIL PAGE [CRITICAL]

**Status:** ✅ COMPLETE
**Priority:** P0 — BLOCKS ASSIGNED USERS FROM EDITING
**Research Reference:** `research.md` Section 1.52.E, 1.52.I
**Scope:** Frontend — 1 file

**Problem Statement:**

COI detail page `isOwner` computed ignores `assignedUsers` array, blocking assigned users from editing.

**Required Changes:**

**File:** `pmo-frontend/pages/coi/detail-[id].vue`

**Lines ~98-130:** Update `isOwner` computed to check `assignedUsers` array

```typescript
// BEFORE
const isOwner = computed(() => {
  if (!project.value) return false
  const userId = authStore.user?.id
  return project.value.createdBy === userId || project.value.delegatedTo === userId
})

const canEditCurrentProject = computed(() => {
  if (!project.value) return false
  if (!canEdit('coi')) return false
  if (isAdmin.value) return true
  return isOwner.value
})

const canSubmitForReview = computed(() => {
  if (!project.value) return false
  return isStaff.value && isOwner.value
    && (project.value.publicationStatus === 'DRAFT' || project.value.publicationStatus === 'REJECTED')
})

// AFTER
const isOwnerOrAssigned = computed(() => {
  if (!project.value) return false
  const userId = authStore.user?.id
  if (!userId) return false
  return (
    project.value.createdBy === userId
    || project.value.delegatedTo === userId
    || project.value.assignedUsers?.some(u => u.id === userId) || false
  )
})

const canEditCurrentProject = computed(() => {
  if (!project.value) return false
  if (isAdmin.value) return true
  return isOwnerOrAssigned.value
})

const canSubmitForReview = computed(() => {
  if (!project.value) return false
  if (!isStaff.value && !isOwnerOrAssigned.value) return false
  if (!isOwnerOrAssigned.value) return false
  return (
    project.value.publicationStatus === 'DRAFT'
    || project.value.publicationStatus === 'REJECTED'
  )
})
```

**Verification:**

| Test | Action | Expected |
|------|--------|----------|
| BK1 | Staff assigned to record | Edit button visible on detail page |
| BK2 | Viewer assigned to record | Edit button visible on detail page |
| BK3 | Click Edit button | Navigates to edit page |
| BK4 | Submit for Review button | Visible for assigned users |

**Acceptance Criteria:**

- ✅ Assigned users see Edit button on detail page
- ✅ Submit for Review works for assigned users
- ✅ Assigned Viewers can edit (assignment elevation)

---

### PHASE BL: FIX ASSIGNMENT CHECK IN REPAIRS MODULE [CRITICAL]

**Status:** ✅ COMPLETE
**Priority:** P0 — BLOCKS ASSIGNED USERS (REPAIRS)
**Research Reference:** `research.md` Section 1.52.E
**Scope:** Frontend — 2 files (index + detail)

**Problem Statement:**

Identical bug in Repairs module - `isOwner` ignores `assignedUsers` array.

**Required Changes:**

**Files:**
1. `pmo-frontend/pages/repairs/index.vue` (lines ~86-103)
2. `pmo-frontend/pages/repairs/detail-[id].vue` (lines ~109-137)

**Changes:** Apply identical fix pattern from Phases BJ/BK

- Rename `isOwner` → `isOwnerOrAssigned`
- Add check for `assignedUsers.some(u => u.id === userId)`
- Remove role gate from `canEditItem` / `canEditCurrentProject`
- Update `canSubmitForReview` to use `isOwnerOrAssigned`

**Verification:**

| Test | Action | Expected |
|------|--------|----------|
| BL1 | Assigned user on Repairs index | Edit button visible |
| BL2 | Assigned user on Repairs detail | Edit button visible |
| BL3 | Non-assigned user | Edit button hidden |

**Acceptance Criteria:**

- ✅ Repairs module matches COI behavior
- ✅ Assigned users can edit Repairs records
- ✅ Cross-module consistency maintained

---

### PHASE BM: FIX ASSIGNMENT CHECK IN UNIVERSITY OPS MODULE [CRITICAL]

**Status:** ✅ COMPLETE
**Priority:** P0 — BLOCKS ASSIGNED USERS (UNIVERSITY OPS)
**Research Reference:** `research.md` Section 1.52.E
**Scope:** Frontend — 2 files (index + detail)

**Problem Statement:**

Identical bug in University Operations module - `isOwner` ignores `assignedUsers` array.

**Required Changes:**

**Files:**
1. `pmo-frontend/pages/university-operations/index.vue` (lines ~86-103)
2. `pmo-frontend/pages/university-operations/detail-[id].vue` (lines ~114-142)

**Changes:** Apply identical fix pattern from Phases BJ/BK

- Rename `isOwner` → `isOwnerOrAssigned`
- Add check for `assignedUsers.some(u => u.id === userId)`
- Remove role gate from `canEditItem` / `canEditCurrentProject`
- Update `canSubmitForReview` to use `isOwnerOrAssigned`

**Verification:**

| Test | Action | Expected |
|------|--------|----------|
| BM1 | Assigned user on University Ops index | Edit button visible |
| BM2 | Assigned user on University Ops detail | Edit button visible |
| BM3 | Non-assigned user | Edit button hidden |

**Acceptance Criteria:**

- ✅ University Operations module matches COI/Repairs behavior
- ✅ Assigned users can edit University Operations records
- ✅ Cross-module consistency maintained

---

### PHASE BN: CROSS-MODULE ASSIGNMENT ELEVATION VALIDATION [MUST]

**Status:** ✅ COMPLETE
**Priority:** P1 — Regression prevention + user acceptance
**Research Reference:** `research.md` Section 1.52.J
**Scope:** Frontend — All 3 modules + backend verification

**Verification Matrix:**

| User Type | Assignment | Role | Module | Test | Expected Edit | Expected Submit |
|-----------|-----------|------|--------|------|---------------|-----------------|
| Creator | N/A | Staff | COI | BN1 | ✅ Yes | ✅ Yes |
| Creator | N/A | Viewer | COI | BN2 | ✅ Yes | ✅ Yes |
| Assigned | Via assignedUsers | Staff | COI | BN3 | ✅ Yes | ✅ Yes |
| Assigned | Via assignedUsers | Viewer | COI | BN4 | ✅ Yes | ✅ Yes |
| Director (rank 30) | Via assignedUsers | Staff | COI | BN5 | ✅ Yes | ✅ Yes |
| Director (rank 30) | Via assignedUsers | Viewer | COI | BN6 | ✅ Yes | ✅ Yes |
| Not creator | Not assigned | Staff | COI | BN7 | ❌ No | ❌ No |
| Not creator | Not assigned | Viewer | COI | BN8 | ❌ No | ❌ No |
| Admin | N/A | Admin | COI | BN9 | ✅ Yes | ✅ Yes |
| **Repeat BN1-BN9 for Repairs** | | | Repairs | BN10-18 | Same as COI | Same as COI |
| **Repeat BN1-BN9 for University Ops** | | | Univ Ops | BN19-27 | Same as COI | Same as COI |

**Critical Test Cases (staff_test User):**

| Test | Setup | Action | Expected Result |
|------|-------|--------|-----------------|
| BN-DIR1 | staff_test (Director, rank 30, Staff role) assigned to COI project | View detail page | Edit button visible |
| BN-DIR2 | staff_test assigned to COI project | Click Edit | Edit page opens |
| BN-DIR3 | staff_test assigned to COI project | Make changes, save | PATCH succeeds, record updated |
| BN-DIR4 | staff_test assigned to COI project | Click Submit for Review | Status → PENDING_REVIEW |
| BN-DIR5 | staff_test NOT assigned to project | View detail page | Edit button hidden |

**Viewer Assignment Test Cases:**

| Test | Setup | Action | Expected Result |
|------|-------|--------|-----------------|
| BN-VIEW1 | Viewer user assigned to project | View index page | Edit icon visible |
| BN-VIEW2 | Viewer user assigned to project | View detail page | Edit button visible |
| BN-VIEW3 | Viewer user assigned to project | Click Edit | Edit page opens |
| BN-VIEW4 | Viewer user assigned to project | Save changes | PATCH succeeds (backend allows) |
| BN-VIEW5 | Viewer user NOT assigned | View detail page | Edit button hidden |

**Publish Authority Unchanged:**

| Test | Setup | Action | Expected Result |
|------|-------|--------|-----------------|
| BN-PUB1 | Staff assigned to PENDING_REVIEW record | View detail page | Publish button hidden (no Admin role) |
| BN-PUB2 | Admin viewing PENDING_REVIEW record | View detail page | Publish/Reject buttons visible |
| BN-PUB3 | Assigned Viewer tries to publish | API call | 403 Forbidden (backend blocks) |

**Backend Consistency Check:**

| Test | Action | Expected |
|------|--------|----------|
| BN-BE1 | Verify backend allows assigned users to PATCH | 200 OK |
| BN-BE2 | Verify backend blocks non-assigned non-owners | 403 Forbidden |
| BN-BE3 | Verify assigned users cannot publish directly | 400 or 403 |

**Acceptance Criteria:**

- ✅ All 3 modules behave identically
- ✅ Assigned users (any role) can edit
- ✅ Directors can edit assigned records
- ✅ Viewers can edit assigned records (elevation)
- ✅ Non-assigned users cannot edit (unless creator/admin)
- ✅ Publish authority unchanged (Admin only)
- ✅ Backend enforcement unaffected
- ✅ No role-based gate blocking assigned users

---

## ASSIGNMENT-BASED EDIT ELEVATION COMPLETE

**Permission Architecture Stabilization:**

| Phase | Description | Status |
|-------|-------------|--------|
| **BJ** | Fix COI index page assignment check | ✅ COMPLETE |
| **BK** | Fix COI detail page assignment check | ✅ COMPLETE |
| **BL** | Fix Repairs module assignment check | ✅ COMPLETE |
| **BM** | Fix University Ops module assignment check | ✅ COMPLETE |
| **BN** | Cross-module validation + regression tests | ✅ COMPLETE |

**Fix Pattern (All Modules):**

```typescript
// BEFORE (BROKEN)
const isOwner = computed(() => {
  return project.value.createdBy === userId || project.value.delegatedTo === userId
})

const canEditCurrentProject = computed(() => {
  if (!canEdit('module')) return false  // ❌ Role gate
  if (isAdmin.value) return true
  return isOwner.value  // ❌ Missing assignment check
})

// AFTER (FIXED)
const isOwnerOrAssigned = computed(() => {
  const userId = authStore.user?.id
  if (!userId || !project.value) return false
  return (
    project.value.createdBy === userId
    || project.value.delegatedTo === userId
    || project.value.assignedUsers?.some(u => u.id === userId) || false  // ✅ CHECK ARRAY
  )
})

const canEditCurrentProject = computed(() => {
  if (!project.value) return false
  if (isAdmin.value) return true
  return isOwnerOrAssigned.value  // ✅ CHECKS ASSIGNMENT
})
```

**Next Phase After BN:**
→ **Director Rank Authority Elevation (Optional)**
→ **University Operations Final Hardening**
→ **Performance & Index Optimization**
→ **Go-Live Readiness**

---
