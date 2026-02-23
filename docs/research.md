# PMO Dashboard: Active Research

**Governance:** ACE v2.4 Phase 1
**Last Updated:** 2026-02-20
**Status:** Phase 1 Research Complete — Section 1.49 Deep Analysis; Phase 2 Plan Updated (AT-AZ)

---

## 1. CURRENT FINDINGS (Active Research)

### 1.38 Record-Level Assignment and Delegation Model (Feb 2026)

**Status:** ✅ PHASE 1 RESEARCH COMPLETE
**Directive:** Design record-level delegation model. No implementation yet.

---

#### A. CURRENT LIMITATION ANALYSIS

**Schema audit of all three module tables (from migration 007):**

| Column | Purpose | Exists |
|--------|---------|--------|
| `created_by` | Record creator / owner | ✅ |
| `submitted_by` | Who submitted for review | ✅ |
| `reviewed_by` | Who approved/rejected | ✅ |
| `publication_status` | State machine status | ✅ |
| `campus` | Office location (text) | ✅ (COI, Repairs, Uni-Ops) |
| `assigned_to` | Delegated collaborator | ❌ MISSING |
| `office_id` | Structured office FK | ❌ MISSING |

**Users table audit (from auth.service.ts validateUser query):**

| Column | Exists |
|--------|--------|
| `rank_level` | ✅ (integer, 10–100) |
| `campus` | ❌ MISSING |
| `office_id` | ❌ MISSING |

**JwtPayload (jwt-payload.interface.ts):**
```typescript
export interface JwtPayload {
  sub: string;     // user id — available in service layer
  email: string;
  roles: string[];
  is_superadmin: boolean;
}
```
`rank_level` and `campus` are NOT in the JWT. They must be fetched from the DB when needed.

**Current visibility logic (Phase X, post-implementation):**
```typescript
// Non-admin sees: PUBLISHED + own records
(cp.publication_status = 'PUBLISHED' OR cp.created_by = $userId)
```

**Current edit permission (post-Phase T/W):**
```typescript
if (user && !this.permissionResolver.isAdmin(user) && currentRecord.created_by !== userId) {
  throw new ForbiddenException('Cannot edit records created by another user');
}
```

**Current submit permission:**
```typescript
if (project.created_by !== userId) {
  throw new ForbiddenException('Only the creator can submit this draft for review');
}
```

**Identified limitations:**
1. No mechanism to delegate record collaboration to another Staff user
2. Phase X visibility only covers ownership — assigned collaborators have no visibility
3. Director-level Staff cannot see DRAFTs they did not create, regardless of rank
4. No office-scoped rank visibility (requires campus on users — deferred Phase Y prerequisite)

---

#### B. RECORD ASSIGNMENT MODEL DESIGN

**Selected approach: Single `assigned_to` FK column on each record table**

Rationale:
- The common use case is assigning one collaborator/delegate per record
- Single FK preserves referential integrity (cascade on user delete)
- Performant: simple equality JOIN in WHERE clause
- Can be migrated to a join table if multi-delegate is required in a future phase

**Design:**
```sql
ALTER TABLE construction_projects  ADD COLUMN assigned_to UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE repair_projects        ADD COLUMN assigned_to UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE university_operations  ADD COLUMN assigned_to UUID REFERENCES users(id) ON DELETE SET NULL;
```

`ON DELETE SET NULL` — if the assigned user is deleted, the assignment is cleared (record returns to owner-only access).

**Who can set `assigned_to`:**
- Record owner (created_by) can assign when record is in DRAFT or REJECTED status
- Admin can assign at any status
- Assignment via PATCH to record with `assigned_to` field
- Assigning `null` removes the delegation

**Assignment constraints:**
- Cannot self-assign (assigned_to = created_by is meaningless)
- Assigned user must be an active Staff or Admin (not Viewer)
- No rank requirement enforced on assignment — this avoids complexity
- Admin overrides any constraint

---

#### C. UPDATED VISIBILITY MATRIX

**Post-Phase AB visibility rules:**

| Status | Visible to |
|--------|-----------|
| DRAFT | Owner (`created_by`) + Assigned (`assigned_to`) + Admin |
| PENDING_REVIEW | Owner + Assigned + Admin (approval authority) |
| PUBLISHED | All permitted module viewers (Staff, Admin, SuperAdmin) |
| REJECTED | Owner + Assigned + Admin |

**Rank-based office-scoped visibility (Director oversight):**

- Director (rank 50) seeing all office DRAFTs requires `campus` column on users table
- This is Phase Y (schema migration) territory — deferred
- Without campus on users, rank-based scoped oversight CANNOT be enforced backend-first
- **Conclusion:** Rank-based office visibility is NOT part of Phase AA–AD. It is blocked by Phase Y prerequisite.

**Updated SQL condition for non-admin findAll():**
```sql
(cp.publication_status = 'PUBLISHED'
 OR cp.created_by = $userId
 OR cp.assigned_to = $userId)
```

---

#### D. EDIT AND SUBMISSION CONTROL

**Edit permission (non-admin gate):**
```
Editable if:
  isAdmin(user) → always
  OR created_by == userId
  OR assigned_to == userId
```

The backend `update()` ownership check expands from:
```typescript
currentRecord.created_by !== userId
```
To:
```typescript
currentRecord.created_by !== userId && currentRecord.assigned_to !== userId
```

**Submission control:**
```
Can submit if:
  created_by == userId
  OR assigned_to == userId
```

Admin can always submit (they can edit anything, so submitting is a subset of edit).

**Delete remains Admin-only.** Assignment does not grant delete authority.

**Approve/Reject remains Admin+rank-gated.** Assignment does not affect approval chain.

---

#### E. RISK ANALYSIS

| Risk ID | Description | Severity | Mitigation |
|---------|-------------|----------|------------|
| RISK-070 | Overexposure of draft data — assigned user sees full DRAFT content | MEDIUM | Only owner/admin can set assigned_to; not self-assignable |
| RISK-071 | Unauthorized delegated edit — assigned user modifies record outside owner's intent | MEDIUM | Owner can clear assignment (set assigned_to = null); audit log trail |
| RISK-072 | Office boundary leakage — assigned user in different office sees cross-office DRAFTs | MEDIUM | Deferred to Phase Y; no campus check possible without users.campus column |
| RISK-073 | Rank bypass via assignment — low-rank user assigned to high-rank user's record | LOW | Assignment doesn't grant approve/delete; rank check at approval still enforced |
| RISK-074 | Complexity explosion in findAll() — OR conditions multiply with future visibility rules | LOW | Keep visibility as flat OR conditions; avoid nested subqueries |
| RISK-075 | assigned_to cascade on user delete — orphaned access | LOW | ON DELETE SET NULL clears assignment cleanly |

---

#### F. INTEGRATION WITH EXISTING VERIFIED BEHAVIORS

**V1–V3 (REJECTED revision flow):** Unaffected. `requiresStatusReset` logic does not reference `assigned_to`.

**W1–W3 (PENDING_REVIEW auto-revert):** PENDING_REVIEW → DRAFT revert clears `submitted_by`. It does NOT clear `assigned_to` — the assignment persists through status changes intentionally.

**W4 (non-owner PENDING_REVIEW → 403):** The ownership check at update() will be extended to include `assigned_to`. A non-owner, non-assigned user editing PENDING_REVIEW still gets 403 (ownership check fires before status revert).

**X1–X5 (Staff sees own DRAFTs):** Extended — Staff also sees assigned DRAFTs (X behavior is a subset of new Phase AB behavior).

---

### 1.37 Rejected Revision Flow, Office Visibility, Hierarchical CRUD, and State Machine Audit (Feb 2026)

**Status:** ✅ PHASE 1 RESEARCH COMPLETE
**Directive:** Rejected record revision gap, PENDING_REVIEW edit behavior, office-scoped visibility, Director-level CRUD, action menu synchronization, state machine consolidation.

---

#### A. REJECTED RECORD REVISION GAP

**Observation:** When a record is REJECTED, the user can navigate to edit it (Edit button is shown — `canEditItem()` does not block REJECTED status). However, no "Resubmit for Review" action appears.

**Backend audit (`construction-projects.service.ts:391-395`):**
```typescript
if (project.publication_status !== 'DRAFT' && project.publication_status !== 'REJECTED') {
  throw new BadRequestException(...)
}
```
`submitForReview()` correctly accepts REJECTED → PENDING_REVIEW. No backend gap here.

**Backend `update()` gap (`service.ts:316`):**
```typescript
const requiresStatusReset = currentRecord.publication_status === 'PUBLISHED';
```
Auto-reset to DRAFT is triggered only for PUBLISHED records. Editing a REJECTED record leaves `publication_status = 'REJECTED'` in place. The record can be modified but the status is never cleared.

**Frontend gap — index pages (`canSubmitForReview`):**
```typescript
function canSubmitForReview(project: UIProject): boolean {
  return isStaff.value && isOwner(project) && project.publicationStatus === 'DRAFT'
                                                                            // ← BLOCKS REJECTED
}
```
Only `DRAFT` passes. REJECTED records never render the Submit for Review action.

**Frontend gap — detail pages (`canSubmitForReview` computed):**
```typescript
const canSubmitForReview = computed(() => {
  return isStaff.value && isOwner.value && project.value.publicationStatus === 'DRAFT'
                                                                               // ← BLOCKS REJECTED
})
```
Same block on detail page.

**Root causes (two distinct gaps):**
1. `update()` does not reset REJECTED → DRAFT automatically on edit — backend gap
2. `canSubmitForReview()` guards on `=== 'DRAFT'`, excluding REJECTED — frontend gap in all 6 pages (3 index + 3 detail)

**Required fix:**
- Backend: Extend `requiresStatusReset` condition to include `REJECTED` alongside `PUBLISHED`
- Frontend: Extend `canSubmitForReview` guard to accept `DRAFT || REJECTED`

---

#### B. EDITING PENDING_REVIEW RECORDS

**Current behavior (Phase T):**
```typescript
if (currentRecord.publication_status === 'PENDING_REVIEW') {
  throw new BadRequestException('Cannot edit records pending review...')
}
```
Frontend hides Edit button (`canEditItem` blocks PENDING_REVIEW). Backend returns 400 as fallback.

**Required behavior (per governance directive):**
Editing a PENDING_REVIEW record should auto-revert to DRAFT rather than hard-block. The submission is invalidated; the reviewer's pending action is cancelled. The user must re-submit after editing.

**Behavior change from Phase T:**
| Dimension | Phase T (Current) | Required |
|-----------|-------------------|----------|
| Frontend Edit button | Hidden for PENDING_REVIEW | Visible (owner or admin) |
| Backend PATCH | 400 Bad Request | Auto-revert to DRAFT, apply edit |
| Ownership check | Unchanged | Unchanged (only owner or admin can edit) |
| Post-edit state | N/A (blocked) | DRAFT, submitted_by cleared |

**Impact:** Phase T's hard 400 guard must be replaced with the auto-revert pattern already used for PUBLISHED records. The `requiresStatusReset` condition expands to: `PUBLISHED || PENDING_REVIEW || REJECTED`.

---

#### C. OFFICE-SCOPED VISIBILITY MODEL

**Schema audit:**
- `construction_projects.campus` — text field, not FK
- `repair_projects.campus` — text field, not FK
- `university_operations.campus` — text field, not FK
- `users` table — no `campus`, `office_id`, or `department` column

**Current visibility rule (all three services):**
```typescript
} else if (user && !this.isAdmin(user)) {
  conditions.push(`publication_status = 'PUBLISHED'`);
}
```
Non-admins see only PUBLISHED records globally. No scope narrowing exists.

**Required office-scoped behavior:**
- Director-level Staff → sees all records in own campus/office scope
- Division Chief → sees records across multiple campuses (assigned)
- SuperAdmin → global visibility

**Schema gap:** No `campus` assignment exists on users. Two implementation paths:

| Path | Description | Schema Impact |
|------|-------------|---------------|
| Path A (Lightweight) | Add `campus` column to `users` table. Filter `findAll()` by `campus` for non-admins. | 1 migration, 1 column |
| Path B (Full) | Add `offices` table + `user_office_assignments` join table + `office_id` FK on records. | 3 migrations, multi-table |

**Recommendation — Path A (campus-as-office proxy):**
The three module tables already have `campus`. Adding `campus` to `users` enables immediate filtering without relational overhead. This can be upgraded to Path B if multi-campus users are required.

**Division Chief designation:**
Currently the rank system defines:
- 30 = Module Admin (Single module admin)
- 50 = Senior Staff (Director-level)

Division Chief fits at rank 40 — above Director Staff (50), below Module Admin (30). With `canApproveByRank()`, a rank 40 user can approve rank 50+ submissions.

---

#### D. HIERARCHICAL CRUD RESTORATION

**Current CRUD matrix (usePermissions.ts):**
```typescript
Staff: { canView: true, canAdd: true, canEdit: true, canDelete: false },
```
Staff can create and edit — CRUD permissions are correct.

**The actual blockage is `findAll()` visibility, not CRUD permissions:**
A Director-level Staff (rank 50) creates a record → DRAFT
- The DRAFT is in the DB
- `findAll()` for non-admins → `publication_status = 'PUBLISHED'` only
- Director cannot see their own DRAFT in the main list
- They can only access it via `/my-drafts` endpoint

**Result:** Director appears to have no records even after creating several, because the main list is PUBLISHED-only.

**Required fix:** Extend `findAll()` for non-admins to show:
- All PUBLISHED records (global visibility)
- Own records in any status (DRAFT, PENDING_REVIEW, REJECTED)

SQL condition:
```sql
WHERE (publication_status = 'PUBLISHED' OR created_by = $userId)
  AND deleted_at IS NULL
```

This resolves D7 (deferred item) without schema migration.

---

#### E. ACTION MENU POPULATION ANALYSIS

**Action menu template audit (coi/index.vue:384-451):**
The action menu renders conditionally based on `v-if` guards:
- View: always visible
- Edit: `canEditItem(item)` — PENDING_REVIEW blocked, owner OR admin
- Submit for Review: `canSubmitForReview(item)` — DRAFT only, owner+staff
- Withdraw: `canWithdraw(item)` — PENDING_REVIEW + submitter
- Approve: `canApproveItem(item)` — Admin + PENDING_REVIEW + not self
- Reject: `canRejectItem(item)` — Admin + PENDING_REVIEW

**For a Staff user viewing their own REJECTED record:**
- View ✅
- Edit ✅ (REJECTED not blocked, isOwner passes)
- Submit for Review ❌ (publicationStatus === 'DRAFT' guard fails) ← **BUG**
- Withdraw ❌ (wrong status)
- Approve / Reject ❌ (not admin)

Result: REJECTED record shows View + Edit but no workflow action. User cannot resubmit from either the list or the detail page. Dead-end state.

**For a Staff user viewing other users' records in main list:**
- findAll() returns only PUBLISHED for non-admins
- PUBLISHED records owned by others: only View shows
- This is correct behavior, but appears as "empty menu" since View is the only option

**No hydration or resolver issue found.** The action menu gap is caused by:
1. `canSubmitForReview()` blocking REJECTED status (Gap A)
2. Staff visibility limited to PUBLISHED makes own-record workflow actions invisible in main list (Gap D)

---

#### F. STATE MACHINE DIAGRAM (Current vs Required)

**Current state machine (as-built):**
```
CREATE         → DRAFT
EDIT DRAFT     → DRAFT (no reset needed)
EDIT PUBLISHED → DRAFT (auto-reset)
EDIT REJECTED  → REJECTED (NO RESET — GAP)
EDIT PENDING   → 400 error (hard block — BEHAVIOR CHANGE NEEDED)
SUBMIT         → PENDING_REVIEW (from DRAFT or REJECTED, backend OK)
APPROVE        → PUBLISHED
REJECT         → REJECTED
WITHDRAW       → DRAFT (from PENDING_REVIEW)
```

**Required deterministic state machine:**
```
CREATE              → DRAFT
EDIT DRAFT          → DRAFT
EDIT PUBLISHED      → DRAFT  (auto-reset: clear reviewed_by/at)
EDIT REJECTED       → DRAFT  (auto-reset: clear reviewed_by/at)  ← FIX
EDIT PENDING_REVIEW → DRAFT  (auto-revert: clear submitted_by/at) ← BEHAVIOR CHANGE
SUBMIT (DRAFT)      → PENDING_REVIEW
RESUBMIT (REJECTED) → PENDING_REVIEW  (same endpoint, frontend fix needed)
APPROVE             → PUBLISHED
REJECT              → REJECTED  (review_notes required)
WITHDRAW            → DRAFT  (from PENDING_REVIEW)
```

**All transitions are handled by existing endpoints.** No new backend endpoint needed. Changes are:
1. `update()` — extend auto-reset to cover REJECTED and PENDING_REVIEW
2. Frontend guards — extend REJECTED path for Submit for Review

---

#### G. RISK ANALYSIS

| Risk ID | Description | Severity | Root Cause |
|---------|-------------|----------|------------|
| RISK-064 | Rejected state dead-end — REJECTED records cannot be resubmitted via UI | HIGH | canSubmitForReview() blocks REJECTED status |
| RISK-065 | REJECTED edit doesn't reset to DRAFT — workflow permanently stuck | HIGH | update() requiresStatusReset only covers PUBLISHED |
| RISK-066 | Office-level data visibility undefined — no campus/office scoping on users | MEDIUM | No campus column on users table |
| RISK-067 | Director-level Staff cannot see own DRAFTs in main list — appears as empty | HIGH | findAll() PUBLISHED-only for non-admins |
| RISK-068 | PENDING_REVIEW hard-block inconsistency — user can open edit form but PATCH fails | MEDIUM | Phase T 400 vs required auto-revert behavior |
| RISK-069 | Division Chief designation undefined in schema — rank 40 slot unoccupied | LOW | No organizational rank table; rank is numeric only |

---

### 1.35 Governance Decision — Rank as Approval Authority (Feb 2026)

*(Previously documented — see plan.md Section 2, Phase P)*

---

### 1.36 Implementation Summary — Phases P, Q, R, S, T, U (Feb 2026)

*(Previously documented — implemented and complete)*

---

### 1.32 Approval Visibility, Action Enforcement, and UI-Permission Alignment (Feb 16, 2026)

**Status:** 🔬 PHASE 1 RESEARCH COMPLETE — Awaiting Phase 2 Plan Update

**ACE Governance:** Phase 1 Research → Phase 2 Plan → Phase 3 Implementation

**Directive:** Stabilize approval visibility, action enforcement, and UI-permission alignment without code implementation.

**Research Scope:**
- A. Approved record indicator analysis
- B. Module-scoped approve functionality verification
- C. Edit button visibility enforcement analysis
- D. UI-backend permission alignment assessment
- E. Action visibility model verification
- F. Meatball menu alignment verification
- G. Risk analysis

---

#### A. APPROVED RECORD INDICATOR ANALYSIS

**Problem Statement:**
Draft records exist with approval workflow. Admin/SuperAdmin can approve records. However, no visual indicator shows:
- Which records are awaiting approval
- Who approved a record
- When approval occurred
- Approval traceability in UI

**Current Publication Status Implementation:**

**Table Display (index.vue):**
```typescript
// File: pmo-frontend/pages/coi/index.vue (Lines 44-52)
function getPublicationStatusColor(status: PublicationStatus): string {
  return {
    DRAFT: 'grey',
    PENDING_REVIEW: 'orange',
    PUBLISHED: 'success',
    REJECTED: 'error',
  }[status] || 'grey'
}

function getPublicationStatusLabel(status: PublicationStatus): string {
  return {
    DRAFT: 'Draft',
    PENDING_REVIEW: 'Pending',
    PUBLISHED: 'Published',
    REJECTED: 'Rejected',
  }[status] || status
}
```

**Status Badge Rendering (index.vue Lines 321-329):**
```vue
<template #item.publicationStatus="{ item }">
  <v-chip
    :color="getPublicationStatusColor(item.publicationStatus)"
    size="small"
    variant="tonal"
  >
    {{ getPublicationStatusLabel(item.publicationStatus) }}
  </v-chip>
</template>
```

**Detail Page Display (detail-[id].vue Lines 254-259):**
```vue
<div v-if="isAdmin || project.publicationStatus !== 'PUBLISHED'">
  <p class="text-caption text-grey mb-1">Publication</p>
  <v-chip :color="getPublicationStatusColor(project.publicationStatus)" size="large">
    {{ getPublicationStatusLabel(project.publicationStatus) }}
  </v-chip>
</div>
```

**Backend Approval Metadata Fields:**

From database migration `007_add_draft_governance.sql`:

```sql
-- Submission tracking
submitted_by UUID REFERENCES users(id),
submitted_at TIMESTAMPTZ,

-- Review/Approval tracking
reviewed_by UUID REFERENCES users(id),
reviewed_at TIMESTAMPTZ,
review_notes TEXT
```

**Backend Data Structure (All Three Modules):**

| Field | Type | Purpose | Populated When |
|-------|------|---------|----------------|
| `submitted_by` | UUID | User who submitted for review | Submit for Review action |
| `submitted_at` | TIMESTAMPTZ | Submission timestamp | Submit for Review action |
| `reviewed_by` | UUID | Admin who approved/rejected | Publish or Reject action |
| `reviewed_at` | TIMESTAMPTZ | Review timestamp | Publish or Reject action |
| `review_notes` | TEXT | Rejection reason | Reject action only |
| `publication_status` | ENUM | Current state | All workflow transitions |

**Frontend Adapter Analysis:**

**File:** `pmo-frontend/utils/adapters.ts`

**Construction Projects Adapter (Lines 54-85):**
```typescript
export function adaptProject(backend: BackendProject): UIProject {
  return {
    id: backend.id,
    projectName: backend.project_name,
    campus: backend.campus,
    status: backend.status,
    publicationStatus: backend.publication_status as PublicationStatus,
    // ... other fields
    createdBy: backend.created_by,
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
    // ❌ NO APPROVAL METADATA MAPPING
  }
}
```

**Repairs Adapter (Lines 196-226):**
```typescript
export function adaptRepairProject(backend: BackendRepairProject): UIRepairProject {
  return {
    id: backend.id,
    title: backend.title,
    publicationStatus: backend.publication_status as PublicationStatus,
    // ... other fields
    createdBy: backend.created_by,
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
    // ❌ NO APPROVAL METADATA MAPPING
  }
}
```

**University Operations Adapter (Lines 363-396):**
```typescript
export function adaptUniversityOperation(backend: BackendUniversityOperation): UIUniversityOperation {
  return {
    id: backend.id,
    title: backend.title,
    publicationStatus: backend.publication_status as PublicationStatus,
    // ... other fields
    createdBy: backend.created_by,
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
    // ❌ NO APPROVAL METADATA MAPPING
  }
}
```

**Gap Identified:**

| Component | Current State | Missing |
|-----------|---------------|---------|
| **Backend Service** | ✅ Stores `reviewed_by`, `reviewed_at` in database | - |
| **Backend Response** | ❌ Does NOT return approval metadata in API response | `reviewed_by`, `reviewed_at` |
| **Frontend Adapter** | ❌ Does NOT map approval fields | `reviewedBy`, `reviewedAt`, `submittedBy`, `submittedAt` |
| **UI Display** | ❌ Shows only status badge, no approval details | Approval indicator |

**Required Approval Indicator Model:**

**Status Badge Enhancement:**

```typescript
// Proposed enhancement (NO IMPLEMENTATION)
interface ApprovalMetadata {
  submittedBy: string | null     // User ID who submitted
  submittedAt: string | null     // ISO timestamp
  reviewedBy: string | null      // User ID who approved/rejected
  reviewedAt: string | null      // ISO timestamp
  reviewNotes: string | null     // Rejection notes
}

interface UIProjectEnhanced extends UIProject {
  approvalMetadata: ApprovalMetadata
}
```

**UI Requirement Analysis:**

| Publication Status | Badge Text | Badge Color | Additional Indicator |
|-------------------|------------|-------------|---------------------|
| DRAFT | "Draft" | Grey | - |
| PENDING_REVIEW | "Pending Approval" | Orange | "Submitted by [Name] on [Date]" |
| PUBLISHED | "Published" | Green | "Approved by [Name] on [Date]" |
| REJECTED | "Rejected" | Red | "Rejected by [Name] on [Date]" + review notes |

**Display Locations:**

1. **Detail Page:** Large badge with metadata below
2. **Tooltip (Optional):** Hover over status chip in list view
3. **Audit Trail (Deferred):** Separate tab showing full history

**Required Changes (NO IMPLEMENTATION):**

1. **Backend Controllers:** Include approval metadata in API response
2. **Frontend Adapters:** Map `submitted_by`, `submitted_at`, `reviewed_by`, `reviewed_at` to camelCase
3. **UI Components:** Display approval metadata beneath status badge
4. **User Resolution:** Fetch user name from `reviewed_by` UUID (requires join or lookup)

**User Name Resolution Options:**

| Option | Implementation | Performance | Data Freshness |
|--------|----------------|-------------|----------------|
| **A. Backend Join** | SQL JOIN on users table | Optimal (single query) | Always fresh |
| **B. Frontend Lookup** | GET /api/users/:id per record | Poor (N+1 queries) | Cached |
| **C. Embedded User** | Include user object in response | Good (single query) | Always fresh |

**Recommendation:** Option A (Backend Join) - Most efficient and maintainable.

---

#### B. MODULE-SCOPED APPROVE FUNCTIONALITY VERIFICATION

**Requirement:** No centralized review page. Approval action embedded in module list or view dialog.

**Current Implementation Status:**

**✅ Meatball Menu Approve Action (index.vue)**

**COI Index (Lines 373-381):**
```vue
<!-- Approve (Admin + PENDING_REVIEW) -->
<v-list-item
  v-if="canApproveItem(item)"
  @click="approveItem(item)"
  prepend-icon="mdi-check-circle"
  class="text-success"
>
  <v-list-item-title>Approve</v-list-item-title>
</v-list-item>
```

**Permission Logic (Lines 105-107):**
```typescript
function canApproveItem(project: UIProject): boolean {
  return isAdmin.value && project.publicationStatus === 'PENDING_REVIEW'
}
```

**Action Handler (Lines 130-142):**
```typescript
async function approveItem(project: UIProject) {
  actionLoading.value = project.id
  try {
    await api.post(`/api/construction-projects/${project.id}/publish`, {})
    toast.success(`"${project.title}" published successfully`)
    await fetchProjects()
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || 'Failed to publish')
  } finally {
    actionLoading.value = null
  }
}
```

**✅ Detail Page Approve Action (detail-[id].vue)**

**Approve Button (Lines 212-220):**
```vue
<v-btn
  v-if="canPublishOrReject"
  color="success"
  @click="workflowAction = 'publish'; workflowDialog = true"
  prepend-icon="mdi-check-circle"
>
  Publish
</v-btn>
```

**Permission Logic (Lines 110-113):**
```typescript
const canPublishOrReject = computed(() => {
  if (!project.value) return false
  return isAdmin.value && project.value.publicationStatus === 'PENDING_REVIEW'
})
```

**Backend Endpoint Enforcement:**

**Construction Projects Controller (Lines 93-102):**
```typescript
@Post(':id/publish')
@Roles('Admin')  // ✅ Admin-only guard
@ApiOperation({ summary: 'Publish construction project' })
async publish(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
  return this.service.publish(id, user);
}
```

**Service-Level Validation (construction-projects.service.ts Lines 427-483):**

```typescript
async publish(id: string, user: JwtPayload) {
  // ✅ Admin role check (Line 428-430)
  if (!user.roles.includes('admin') && !user.is_superadmin) {
    throw new ForbiddenException('Only admins can publish projects');
  }

  // ✅ Self-approval prevention (Lines 435-437)
  if (project.created_by === user.sub && !user.is_superadmin) {
    throw new ForbiddenException('You cannot approve your own submission');
  }

  // ✅ Rank-based approval (Lines 440-458)
  const approverRank = await this.getUserRank(user.sub);
  const submitterRank = await this.getUserRank(project.submitted_by);

  if (approverRank >= submitterRank && !user.is_superadmin) {
    throw new ForbiddenException(
      `Approver rank (${approverRank}) must be higher than submitter rank (${submitterRank})`
    );
  }

  // ✅ Status validation (Lines 462-467)
  if (project.publication_status !== 'PENDING_REVIEW') {
    throw new BadRequestException('Only records in PENDING_REVIEW status can be published');
  }

  // ✅ Module assignment check (Lines 469-481)
  if (!user.is_superadmin) {
    const hasAccess = await this.db.query(
      `SELECT 1 FROM user_module_assignments
       WHERE user_id = $1 AND (module = 'CONSTRUCTION' OR module = 'ALL')`,
      [user.sub]
    );
    if (hasAccess.rows.length === 0) {
      throw new ForbiddenException('No module access');
    }
  }

  // ✅ Update publication status
  await this.db.query(
    `UPDATE construction_projects
     SET publication_status = 'PUBLISHED',
         reviewed_by = $1,
         reviewed_at = NOW()
     WHERE id = $2`,
    [user.sub, id]
  );
}
```

**Verification Matrix:**

| Check | Frontend (UI) | Backend (Service) | Status |
|-------|---------------|-------------------|--------|
| Admin role | ✅ `isAdmin.value` | ✅ `user.roles.includes('admin')` | ALIGNED |
| PENDING_REVIEW status | ✅ `status === 'PENDING_REVIEW'` | ✅ `publication_status !== 'PENDING_REVIEW'` throws | ALIGNED |
| Module assignment | ❌ Not checked in UI | ✅ Checked in service | BACKEND-ONLY |
| Self-approval prevention | ❌ Not checked in UI | ✅ Checked in service | BACKEND-ONLY |
| Rank hierarchy | ❌ Not checked in UI | ✅ Checked in service | BACKEND-ONLY |

**Assessment:**

| Component | Status | Notes |
|-----------|--------|-------|
| **Meatball Menu Approve** | ✅ IMPLEMENTED | Visible for Admin + PENDING_REVIEW |
| **Detail Page Approve** | ✅ IMPLEMENTED | Same visibility logic |
| **Backend Endpoint** | ✅ SECURED | Multiple validation layers |
| **Module Assignment UI** | ⚠️ UI BLIND | UI shows action even without module access |
| **Rank Validation UI** | ⚠️ UI BLIND | UI shows action even if rank insufficient |

**UI-Backend Alignment Gap:**

Frontend displays Approve action based on:
- `isAdmin === true`
- `publicationStatus === 'PENDING_REVIEW'`

Backend validates:
- Admin role ✅
- PENDING_REVIEW status ✅
- Module assignment ❌ (UI doesn't check)
- Self-approval prevention ❌ (UI doesn't check)
- Rank hierarchy ❌ (UI doesn't check)

**Impact:**
- User sees Approve button
- User clicks Approve
- Backend returns 403 Forbidden
- User receives error toast: "No module access" or "Insufficient rank"

**Recommended Enhancement (NO IMPLEMENTATION):**

```typescript
// Proposed permission check (not implementing)
const canApproveItem = computed((project: UIProject) => {
  if (!isAdmin.value) return false
  if (project.publicationStatus !== 'PENDING_REVIEW') return false

  // Check module assignment
  const hasModuleAccess = authStore.user?.moduleAssignments.includes('CONSTRUCTION') ||
                          authStore.user?.moduleAssignments.includes('ALL')
  if (!hasModuleAccess) return false

  // Check self-approval prevention
  if (project.submittedBy === authStore.user?.id && !authStore.user?.isSuperAdmin) {
    return false
  }

  // Rank check would require additional data
  return true
})
```

**Missing Frontend Data:**
- `authStore.user.moduleAssignments` (not included in JWT or /me response)
- `project.submittedBy` (adapter doesn't map `submitted_by`)
- `authStore.user.rankLevel` (not included in JWT or /me response)

---

#### C. EDIT BUTTON VISIBILITY ENFORCEMENT ANALYSIS

**Problem Statement:** Edit button in View dialog (detail-[id].vue) lacks permission check. Button renders regardless of user's edit permission.

**Current Implementation Analysis:**

**COI Detail Page (detail-[id].vue Line 231):**
```vue
<v-btn color="primary" @click="editProject" prepend-icon="mdi-pencil">
  Edit Project
</v-btn>
```

**❌ NO CONDITIONAL RENDERING** - Button always visible.

**Repairs Detail Page (detail-[id].vue Line 217):**
```vue
<v-btn color="primary" @click="editRepairProject" prepend-icon="mdi-pencil">
  Edit Repair Project
</v-btn>
```

**❌ NO CONDITIONAL RENDERING** - Button always visible.

**University Operations Detail Page (detail-[id].vue Line 222):**
```vue
<v-btn color="primary" @click="editOperation" prepend-icon="mdi-pencil">
  Edit Operation
</v-btn>
```

**❌ NO CONDITIONAL RENDERING** - Button always visible.

**Comparison with Index Page Meatball Menu:**

**Index Page Edit Action (index.vue Lines 355-362):**
```vue
<v-list-item
  v-if="canEditItem(item)"
  @click="editProject(item)"
  prepend-icon="mdi-pencil"
>
  <v-list-item-title>Edit</v-list-item-title>
</v-list-item>
```

**✅ CONDITIONAL RENDERING** - Based on `canEditItem(item)`

**Permission Logic (index.vue Lines 91-97):**
```typescript
function canEditItem(project: UIProject): boolean {
  if (!canEdit('coi')) return false
  if (project.publicationStatus === 'PENDING_REVIEW') return false
  if (isAdmin.value) return true
  return isOwner(project)
}
```

**Inconsistency Identified:**

| Location | Edit Action | Permission Check | Status |
|----------|-------------|------------------|--------|
| **Index Page (Meatball Menu)** | ✅ Conditional `v-if="canEditItem(item)"` | ✅ Multi-factor validation | CORRECT |
| **Detail Page** | ❌ Always visible | ❌ No permission check | INCORRECT |

**Backend Edit Enforcement:**

**Construction Projects Controller (Lines 45-56):**
```typescript
@Patch(':id')
@Roles('Admin', 'Staff')  // ✅ Role-based guard
@ApiOperation({ summary: 'Update construction project' })
async update(
  @Param('id') id: string,
  @Body() dto: UpdateConstructionProjectDto,
  @CurrentUser() user: JwtPayload,
) {
  return this.service.update(id, dto, user.sub);
}
```

**Service-Level Validation (construction-projects.service.ts Lines 202-238):**
```typescript
async update(id: string, dto: UpdateConstructionProjectDto, userId: string) {
  const project = await this.findOne(id);

  // ✅ Ownership check for Staff (Lines 209-214)
  if (!user.roles.includes('admin') && !user.is_superadmin) {
    if (project.created_by !== userId) {
      throw new ForbiddenException('You can only edit your own projects');
    }
  }

  // ✅ PENDING_REVIEW lock (Lines 216-220)
  if (project.publication_status === 'PENDING_REVIEW') {
    throw new BadRequestException('Cannot edit project while in review');
  }

  // Update logic...
}
```

**Attack Vector Analysis:**

| Attack Vector | UI Protection | Backend Protection | Exploitable |
|---------------|---------------|-------------------|-------------|
| Click Edit button in detail page | ❌ Button visible to all | ✅ `@Roles('Admin', 'Staff')` | ⚠️ Partial |
| Navigate to /coi/edit-{id} | ✅ Permission middleware | ✅ `@Roles('Admin', 'Staff')` | ❌ Blocked |
| Direct API PATCH call | N/A | ✅ Role + ownership + status checks | ❌ Blocked |

**Visibility Issue Impact:**

**Scenario 1: Viewer Role**
1. Viewer navigates to detail page ✅
2. Viewer sees "Edit Project" button ❌ (should be hidden)
3. Viewer clicks Edit button
4. Route navigation triggered: `/coi/edit-{id}`
5. **Permission middleware blocks** → Redirect to /dashboard
6. Result: User confusion (button visible but non-functional)

**Scenario 2: Staff Without Edit Permission**
1. Staff with `canEdit('coi') = false` override views detail ✅
2. Staff sees "Edit Project" button ❌ (should be hidden)
3. Staff clicks Edit button
4. Route navigation triggered: `/coi/edit-{id}`
5. **Permission middleware blocks** → Redirect to /dashboard
6. Result: User confusion

**Scenario 3: Owner Viewing PENDING_REVIEW Record**
1. Owner views their own PENDING_REVIEW record ✅
2. Owner sees "Edit Project" button ❌ (should be hidden per workflow)
3. Owner clicks Edit button
4. Route navigation succeeds (owner has canEdit) ✅
5. Edit page loads ✅
6. Owner submits update
7. **Backend service blocks**: "Cannot edit project while in review" ❌
8. Result: User allowed to enter edit flow but blocked at save

**Required Enhancement (NO IMPLEMENTATION):**

```vue
<!-- Proposed conditional rendering -->
<v-btn
  v-if="canEditCurrentProject"
  color="primary"
  @click="editProject"
  prepend-icon="mdi-pencil"
>
  Edit Project
</v-btn>
```

```typescript
// Proposed permission computed
const canEditCurrentProject = computed(() => {
  if (!project.value) return false
  if (!canEdit('coi')) return false
  if (project.value.publicationStatus === 'PENDING_REVIEW') return false
  if (isAdmin.value) return true
  return isOwner.value
})
```

**Hydration Delay Analysis:**

**Question:** Does component render before authStore loads, causing temporary button exposure?

**Auth Store Initialization (stores/auth.ts Lines 54-68):**
```typescript
async initialize() {
  const token = this.getStoredToken()
  if (!token) {
    this.clearAuth()
    return
  }

  try {
    const response = await $fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    this.user = response.user  // ✅ User data loaded
    this.token = token
  } catch {
    this.clearAuth()
  }
}
```

**Auth Middleware (middleware/auth.ts Lines 7-16):**
```typescript
export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  if (authStore.token && !authStore.user) {
    await authStore.initialize()  // ✅ AWAITED before navigation
  }

  if (!authStore.isAuthenticated) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
```

**Assessment:**
- Middleware properly awaits user load ✅
- Detail page renders AFTER authStore.user populated ✅
- No hydration race condition ❌

**Conclusion:** Edit button exposure is NOT a race condition. It's an explicit missing permission check.

---

#### D. UI-BACKEND PERMISSION ALIGNMENT ASSESSMENT

**Requirement:** UI action visibility must align 100% with backend permission resolver.

**Current Permission Resolution Architecture:**

**Frontend Permission Composable:**

File: `pmo-frontend/composables/usePermissions.ts`

**Resolution Order (Lines 165-200):**
```typescript
export function getModulePermissions(moduleKey: string) {
  const authStore = useAuthStore()
  const role = currentRole()

  // 1. SuperAdmin bypass
  if (authStore.user?.isSuperAdmin) {
    return ROLE_PERMISSIONS.SuperAdmin  // Full CRUD
  }

  // 2. Module access check
  const moduleOverrides = authStore.user?.moduleOverrides ?? {}
  if (moduleOverrides[moduleKey] === false) {
    return { canView: false, canAdd: false, canEdit: false, canDelete: false }
  }

  // 3. Per-user CRUD override (NOT IMPLEMENTED)
  // Currently: No per-user CRUD override support

  // 4. Role-based default
  return ROLE_PERMISSIONS[role]
}
```

**Backend Permission Enforcement:**

**No Centralized Resolver Exists** ❌

Controllers use `@Roles()` decorator only:
```typescript
@Patch(':id')
@Roles('Admin', 'Staff')  // ← Only checks role membership
update(...) { }
```

**Service-Level Validation (Ad-Hoc):**
- Ownership checks in service methods
- Status-based locks in service methods
- Module assignment checks in findPendingReview() only

**Missing Backend Components:**

1. **PermissionResolverService** ❌ - No centralized permission calculation
2. **CRUD Permission Guard** ❌ - No decorator for per-action validation
3. **Permission API Endpoint** ❌ - UI cannot query "Can I edit this record?"

**Alignment Analysis Matrix:**

| Action | Frontend Check | Backend Check | Alignment Status |
|--------|----------------|---------------|------------------|
| **View Module** | `canView(module)` | None (auth only) | ⚠️ No backend check |
| **Add Record** | `canAdd(module)` | `@Roles('Admin', 'Staff')` | ⚠️ Role-only |
| **Edit Record** | `canEdit(module)` | `@Roles('Admin', 'Staff')` + ownership | ⚠️ Partial |
| **Delete Record** | `canDelete(module)` | `@Roles('Admin')` | ⚠️ Role-only |
| **Approve** | `isAdmin` | `@Roles('Admin')` + module + rank | ⚠️ UI blind to rank |
| **Submit for Review** | `isOwner + DRAFT` | Service validates same | ✅ ALIGNED |

**Desynchronization Risk Scenarios:**

**Scenario 1: Module Access Override**
- User has `moduleOverrides['coi'] = false` in database
- **Login Response:** Includes `module_overrides: { coi: false }`
- **Frontend:** `canView('coi')` returns `false` ✅
- **Backend PATCH:** `@Roles('Admin', 'Staff')` checks role only → Allows if Staff ❌
- **Result:** DESYNC - UI blocks, backend allows

**Scenario 2: Per-User Edit Permission**
- Admin revokes edit permission for specific user (hypothetical)
- User role is still "Staff"
- **Frontend:** `canEdit('coi')` checks role → Returns `true` (Staff has canEdit)
- **Backend:** `@Roles('Admin', 'Staff')` checks role → Returns `true`
- **Service:** No per-user CRUD check → Allows edit
- **Result:** Cannot enforce per-user edit restrictions

**Scenario 3: Rank-Based Approval**
- Junior Admin (rank 30) views PENDING_REVIEW record submitted by Senior Admin (rank 20)
- **Frontend:** `isAdmin` → Returns `true` → Approve button visible
- **Backend:** Rank check in service → `approverRank (30) >= submitterRank (20)` → Rejects
- **Result:** UI shows button, backend blocks (user confusion)

**Required Alignment Mechanism (NO IMPLEMENTATION):**

**Option A: Frontend Queries Backend Permissions**
```typescript
// Proposed API endpoint (not implementing)
GET /api/permissions/resolve
Query params: { module: 'coi', action: 'canEdit', recordId: '123' }
Response: { allowed: boolean, reason?: string }
```

**Pros:** Always in sync, respects backend logic
**Cons:** Performance overhead (API call per record), latency

**Option B: Include Effective Permissions in Auth Response**
```typescript
// Proposed auth response enhancement
{
  user: {
    id: '...',
    roles: ['staff'],
    effectivePermissions: {
      coi: { canView: true, canAdd: true, canEdit: false, canDelete: false, canApprove: false },
      repairs: { ... },
    },
    moduleAssignments: ['REPAIR', 'OPERATIONS'],
    rankLevel: 50
  }
}
```

**Pros:** Single calculation, no per-request overhead
**Cons:** Static (doesn't account for record-specific rules like ownership)

**Option C: Hybrid Approach**
- Include effective permissions in auth response (module-level)
- UI uses local checks for ownership and status
- Backend remains authoritative (double-check on API call)

**Recommendation:** Option C (Hybrid) - Best balance of performance and accuracy.

---

#### E. UNIFIED ACTION VISIBILITY MODEL VERIFICATION

**Requirement:** Actions must follow `resolvePermission(user, module, action)` with no hardcoded role checks.

**Current Implementation Audit:**

**Meatball Menu Action Visibility (COI index.vue Lines 349-406):**

```vue
<v-list density="compact" min-width="180">
  <!-- View (always visible) -->
  <v-list-item @click="viewProject(item)" prepend-icon="mdi-eye">
    <v-list-item-title>View</v-list-item-title>
  </v-list-item>

  <!-- Edit (conditional) -->
  <v-list-item
    v-if="canEditItem(item)"
    @click="editProject(item)"
    prepend-icon="mdi-pencil"
  >
    <v-list-item-title>Edit</v-list-item-title>
  </v-list-item>

  <!-- Submit for Review (conditional) -->
  <v-list-item
    v-if="canSubmitForReview(item)"
    @click="submitForReview(item)"
    prepend-icon="mdi-send"
  >
    <v-list-item-title>Submit for Review</v-list-item-title>
  </v-list-item>

  <!-- Approve (conditional) -->
  <v-list-item
    v-if="canApproveItem(item)"
    @click="approveItem(item)"
    prepend-icon="mdi-check-circle"
    class="text-success"
  >
    <v-list-item-title>Approve</v-list-item-title>
  </v-list-item>

  <!-- Reject (conditional) -->
  <v-list-item
    v-if="canRejectItem(item)"
    @click="openRejectDialog(item)"
    prepend-icon="mdi-close-circle"
    class="text-warning"
  >
    <v-list-item-title>Reject</v-list-item-title>
  </v-list-item>

  <!-- Delete (conditional) -->
  <v-list-item
    v-if="canDelete('coi')"
    @click="confirmDelete(item)"
    prepend-icon="mdi-delete"
    class="text-error"
  >
    <v-list-item-title>Delete</v-list-item-title>
  </v-list-item>
</v-list>
```

**Permission Function Analysis:**

| Function | Logic Source | Hardcoded Roles? | Uses usePermissions? |
|----------|--------------|------------------|----------------------|
| `canEditItem()` | Lines 91-97 | ✅ `isAdmin.value` | ✅ `canEdit(module)` |
| `canSubmitForReview()` | Lines 100-102 | ✅ `isStaff.value` | ❌ Role check only |
| `canApproveItem()` | Lines 105-107 | ✅ `isAdmin.value` | ❌ Role check only |
| `canRejectItem()` | Lines 110-112 | ✅ `isAdmin.value` | ❌ Role check only |
| `canDelete()` | From composable | ❌ No hardcode | ✅ From usePermissions |

**Hardcoded Role Check Examples:**

```typescript
// Line 100-102: Submit for Review
function canSubmitForReview(project: UIProject): boolean {
  return isStaff.value && isOwner(project) && project.publicationStatus === 'DRAFT'
}

// ✅ isStaff from usePermissions (Lines 81-85 in composable)
export const isStaff = computed(() => {
  if (!authStore.user) return false
  if (isSuperAdmin.value || isAdmin.value) return true
  const roleName = authStore.user.roles?.[0]?.toLowerCase()
  return roleName === 'staff'
})
```

**Assessment:** `isStaff` is NOT a hardcoded check. It's derived from authStore.user.roles, which comes from backend.

**Approval Action Analysis:**

```typescript
// Lines 105-107: Approve
function canApproveItem(project: UIProject): boolean {
  return isAdmin.value && project.publicationStatus === 'PENDING_REVIEW'
}

// isAdmin from composable (Lines 74-80)
export const isAdmin = computed(() => {
  if (!authStore.user) return false
  if (isSuperAdmin.value) return true
  const roleName = authStore.user.roles?.[0]?.toLowerCase()
  return roleName === 'admin'
})
```

**Assessment:** `isAdmin` checks `authStore.user.roles` which is backend-sourced.

**Conclusion:**
- ✅ No literal role strings in component code ("admin", "staff")
- ✅ All role checks use `usePermissions()` composable
- ⚠️ Composable derives from `authStore.user.roles` (backend data)
- ⚠️ No per-user CRUD override in composable logic

**Missing Permission Methods in usePermissions.ts:**

| Action | Method Exists? | Current Workaround |
|--------|----------------|-------------------|
| `canView(module)` | ✅ | - |
| `canAdd(module)` | ✅ | - |
| `canEdit(module)` | ✅ | - |
| `canDelete(module)` | ✅ | - |
| `canApprove(module)` | ❌ | Use `isAdmin` + status check |
| `canPublish(module)` | ❌ | Use `isAdmin` + status check |

**Recommendation (NO IMPLEMENTATION):**

Add `canApprove()` method to usePermissions.ts:

```typescript
// Proposed method (not implementing)
export function canApprove(moduleKey: string): boolean {
  const authStore = useAuthStore()

  // SuperAdmin can always approve
  if (authStore.user?.isSuperAdmin) return true

  // Check if Admin role
  if (!isAdmin.value) return false

  // Check module access
  const moduleOverrides = authStore.user?.moduleOverrides ?? {}
  if (moduleOverrides[moduleKey] === false) return false

  // Check module assignment (if data available)
  const hasModuleAccess = authStore.user?.moduleAssignments?.includes(moduleKey) ||
                          authStore.user?.moduleAssignments?.includes('ALL')
  if (!hasModuleAccess) return false

  return true
}
```

**Required Data in authStore:**
- `user.moduleAssignments` array (not currently in JWT or /me response)

---

#### F. MEATBALL MENU ALIGNMENT VERIFICATION

**Requirement:** In list view AND view dialog, meatball menu must dynamically render actions with consistent permission checks.

**List View (index.vue) Status:**

✅ **COI Module** (Lines 338-406): Complete meatball menu
✅ **Repairs Module** (Lines 333-463): Complete meatball menu
✅ **University Operations Module** (Lines 336-465): Complete meatball menu
✅ **Contractors Module** (Lines 176-216): Simplified meatball menu (no approval workflow)
✅ **Funding Sources Module** (Lines 174-213): Simplified meatball menu (no approval workflow)
✅ **Users Module** (Lines 290-329): Simplified meatball menu (no approval workflow)

**All modules use consistent meatball menu pattern.**

**View Dialog (detail-[id].vue) Status:**

**COI Detail Page (Lines 152-243):**
- ✅ Submit for Review button (Lines 203-211)
- ✅ Publish button (Lines 212-220)
- ✅ Reject button (Lines 221-230)
- ❌ Edit button (Line 231) - **NOT conditional**

**Action buttons rendered as toolbar buttons, NOT meatball menu.**

**Inconsistency Identified:**

| Location | Action Grouping | Permission Checks | Pattern |
|----------|-----------------|-------------------|---------|
| **List View (index.vue)** | ✅ Meatball menu (⋯) | ✅ Conditional rendering | Consistent |
| **Detail View (detail-[id].vue)** | ❌ Toolbar buttons | ⚠️ Partial (workflow only) | Different pattern |

**Detail Page Action Buttons:**

```vue
<!-- Detail page action buttons (NOT meatball menu) -->
<v-card-actions class="justify-end pa-4">
  <v-btn v-if="canSubmitForReview" ...>Submit for Review</v-btn>
  <v-btn v-if="canPublishOrReject" ...>Publish</v-btn>
  <v-btn v-if="canPublishOrReject" ...>Reject</v-btn>
  <v-btn @click="editProject" ...>Edit Project</v-btn>
</v-card-actions>
```

**Assessment:**

**List View Meatball Menu:**
- ✅ All actions in dropdown menu
- ✅ Consistent icon + label pattern
- ✅ Permission-based visibility
- ✅ Divider before destructive actions

**Detail View Toolbar:**
- ⚠️ Workflow actions (Submit/Publish/Reject) conditional
- ❌ Edit action always visible
- ⚠️ No Delete action in detail view
- ⚠️ Different UX pattern than list view

**Alignment Requirement Interpretation:**

**Question:** Should detail page actions be moved into meatball menu for consistency?

**Analysis:**

| Approach | Pros | Cons |
|----------|------|------|
| **Keep Toolbar Buttons** | More prominent, easier to discover | Inconsistent with list view |
| **Move to Meatball Menu** | Consistent pattern, cleaner UI | Less prominent, extra click required |
| **Hybrid** | Workflow buttons prominent, Edit/Delete in meatball | Complex, two action locations |

**Recommendation:** Keep toolbar buttons BUT add permission checks to Edit button. Consistency with list view is NICE-TO-HAVE, not MUST-HAVE.

---

#### G. RISK ANALYSIS

**Silent Approval Visibility Risk:**

| Risk ID | Threat | Likelihood | Impact | Current Mitigation |
|---------|--------|------------|--------|-------------------|
| **RISK-038** | Admin approves without seeing who submitted | CONFIRMED | MEDIUM | None - No approval metadata displayed |
| **RISK-039** | No audit trail visible in UI | CONFIRMED | MEDIUM | Data exists in DB, not shown in UI |
| **RISK-040** | Approval attribution lost | CONFIRMED | LOW | `reviewed_by` stored, not displayed |

**Mitigation Strategy:**
- Display approval metadata in detail view
- Show "Approved by [Name] on [Date]" badge
- Add tooltip in list view (optional)

---

**UI-Backend Permission Desync Risk:**

| Risk ID | Threat | Likelihood | Impact | Current Mitigation |
|---------|--------|------------|--------|-------------------|
| **RISK-041** | Approve button visible despite insufficient rank | HIGH | MEDIUM | Backend validates rank, returns 403 |
| **RISK-042** | Approve button visible despite no module access | MEDIUM | MEDIUM | Backend validates module assignment |
| **RISK-043** | Edit button visible for PENDING_REVIEW record | HIGH | LOW | Backend blocks edit in service layer |

**Root Cause:** Frontend lacks access to:
- User's rank level
- User's module assignments
- Record submission metadata

**Mitigation Strategy:**
- Include rank level in auth response
- Include module assignments in auth response
- Map submission metadata in adapters

---

**Edit Button Exposure Race Condition Risk:**

| Risk ID | Threat | Likelihood | Impact | Current Mitigation |
|---------|--------|------------|--------|-------------------|
| **RISK-044** | Edit button visible before auth loads | VERY LOW | LOW | Middleware awaits authStore.initialize() |
| **RISK-045** | Edit button functional during hydration | VERY LOW | LOW | Navigation requires auth |

**Assessment:** NOT a race condition. Middleware properly awaits user data.

**Root Cause:** Missing permission check, not timing issue.

---

**Unauthorized Approval Risk:**

| Risk ID | Threat | Likelihood | Impact | Current Mitigation |
|---------|--------|------------|--------|-------------------|
| **RISK-046** | Staff bypasses workflow to publish directly | VERY LOW | CRITICAL | `@Roles('Admin')` on publish endpoint |
| **RISK-047** | Self-approval attempt | LOW | HIGH | Service checks `created_by !== user.sub` |
| **RISK-048** | Lower-rank approves higher-rank submission | LOW | HIGH | Service validates rank hierarchy |

**Assessment:** Backend enforcement is robust. UI desync causes poor UX, not security breach.

---

**Inconsistent Badge Labeling Risk:**

| Risk ID | Threat | Likelihood | Impact | Current Mitigation |
|---------|--------|------------|--------|-------------------|
| **RISK-049** | "Pending" vs "Pending Approval" confusion | LOW | LOW | Consistent label "Pending" used |
| **RISK-050** | Color scheme ambiguity | VERY LOW | LOW | Material Design color conventions |

**Assessment:** Current labels and colors are clear. Low priority enhancement.

---

#### H. SUMMARY: PHASE 1 RESEARCH COMPLETE

**Confirmed Gaps:**

1. ✅ **Approval Metadata Missing in UI**
   - Backend stores `reviewed_by`, `reviewed_at`, `submitted_by`, `submitted_at`
   - Adapters don't map these fields
   - UI shows status only, no attribution

2. ✅ **Approve Functionality Exists**
   - Meatball menu approve action implemented
   - Detail page approve button implemented
   - Backend validation robust (rank, module, status)
   - **Gap:** UI doesn't reflect all backend constraints

3. ✅ **Edit Button Unconditional in Detail View**
   - Detail page Edit button has no `v-if` check
   - Inconsistent with list view (which has permission checks)
   - Not a security issue (backend enforces), but poor UX

4. ✅ **UI-Backend Permission Desync**
   - Frontend lacks data: rank level, module assignments
   - UI shows actions that backend may reject
   - Root cause: Auth response doesn't include full permission context

5. ✅ **No Hardcoded Roles (False Alarm)**
   - All role checks use `usePermissions()` composable
   - Composable sources from `authStore.user.roles` (backend data)
   - Clarification: `isAdmin`, `isStaff` are computed properties, not hardcoded strings

6. ⚠️ **Meatball Menu vs Toolbar Inconsistency**
   - List view uses meatball menu (consistent across 6 modules)
   - Detail view uses toolbar buttons (different UX pattern)
   - Recommendation: Keep toolbar, add permission checks

**Required Data Enhancements:**

| Data Field | Current Location | Required In | Purpose |
|------------|-----------------|-------------|---------|
| `reviewed_by` | Database only | UI adapter | Show approver name |
| `reviewed_at` | Database only | UI adapter | Show approval timestamp |
| `submitted_by` | Database only | UI adapter | Show submitter name |
| `submitted_at` | Database only | UI adapter | Show submission timestamp |
| `user.rankLevel` | Database only | Auth response | Rank-aware UI logic |
| `user.moduleAssignments` | Database only | Auth response | Module-aware approval visibility |

**Required UI Enhancements:**

1. **Detail Page Edit Button:** Add `v-if="canEditCurrentProject"` check
2. **Approval Metadata Display:** Show "Approved by [Name] on [Date]" in detail view
3. **Status Badge Tooltip (Optional):** Hover to see approval details in list view

**Deferred Scope:**

1. Moving detail page actions to meatball menu (UX preference, not governance requirement)
2. Real-time permission refresh (low ROI, token expiry handles stale permissions)
3. Per-user canApprove permission (requires CRUD schema migration)

---

**ACE PHASE 1 RESEARCH DECLARED COMPLETE**

Next Phase: Update `plan.md` with Phase H (Approval Metadata), Phase I (Edit Button Hardening), Phase J (Permission Context Enhancement).

---

**END OF SECTION 1.32**

---

## 1.33 Workflow Governance Stabilization: Pending Reviews & Reference Data Access (Feb 16, 2026)

**Status:** 🔬 PHASE 1 RESEARCH COMPLETE — Ready for Phase 2 Plan Update

**ACE Governance:** Phase 1 Research → Phase 2 Plan → Phase 3 Implementation

**Directive:** Stabilize workflow architecture, review lifecycle logic, and permission-driven UI structure. Reintroduce Pending Reviews module and restrict Reference Data visibility.

**Research Scope:**
- A. Workflow Architecture Misalignment Analysis
- B. Pending Reviews Module Reintroduction
- C. Action Consolidation (Submit/Withdraw/Approve/Disapprove)
- D. State Machine Revision
- E. Reference Data Module Governance
- F. Permission Visibility Alignment
- G. Risk Analysis

---

### A. WORKFLOW ARCHITECTURE MISALIGNMENT ANALYSIS

**Problem Statement:**

Submit for Review action exists in each module's meatball menu and detail page. However, the Pending Reviews module (centralized admin dashboard) does NOT exist in the frontend. This creates an incomplete workflow:

- Staff can submit records for review → Status changes to `PENDING_REVIEW`
- No centralized view for Admins to see all pending submissions
- Admins must navigate to each module's index page to find pending items
- Workflow orphan state: Records submitted but no clear review path

**Current Implementation Evidence:**

**Submit for Review Exists (Frontend):**

| Location | File | Lines | Status |
|----------|------|-------|--------|
| COI Index Meatball Menu | `pages/coi/index.vue` | 365-371 | ✅ Implemented |
| COI Detail Page | `pages/coi/detail-[id].vue` | 203-211 | ✅ Implemented |
| Repairs Index | `pages/repairs/index.vue` | Similar | ✅ Implemented |
| Repairs Detail | `pages/repairs/detail-[id].vue` | Similar | ✅ Implemented |
| University Operations Index | `pages/university-operations/index.vue` | Similar | ✅ Implemented |
| University Operations Detail | `pages/university-operations/detail-[id].vue` | Similar | ✅ Implemented |

**Pending Reviews Backend Endpoints (Exist but No UI):**

| Endpoint | Controller | Status |
|----------|------------|--------|
| `GET /api/construction-projects/pending-review` | construction-projects.controller.ts | ✅ Exists |
| `GET /api/repair-projects/pending-review` | repair-projects.controller.ts | ✅ Exists |
| `GET /api/university-operations/pending-review` | university-operations.controller.ts | ✅ Exists |

**Pending Reviews Frontend Route:**
- ❌ No `/admin/pending-reviews` route exists
- ❌ No `pages/admin/pending-reviews.vue` file exists
- ❌ No sidebar link to pending reviews

**Current Admin Review Path:**

1. Admin logs in
2. Admin navigates to COI → Index page
3. Admin manually scans table for `PENDING_REVIEW` status records
4. Admin clicks Approve/Reject from meatball menu
5. Admin repeats for Repairs and University Operations

**Required Review Path:**

1. Admin logs in
2. Admin clicks "Pending Reviews" in sidebar (Admin-only section)
3. Admin sees unified list of all pending submissions across modules
4. Admin filters by module, submitter, or date
5. Admin clicks Approve/Reject from meatball menu
6. Record disappears from pending list, appears in module as PUBLISHED/REJECTED

**Gap Identified:**

| Component | Current State | Required State |
|-----------|---------------|----------------|
| Backend API | ✅ `/pending-review` endpoints exist | ✅ No change needed |
| Frontend Route | ❌ Does not exist | ⚠️ CREATE `/admin/pending-reviews` |
| Sidebar Link | ❌ Does not exist | ⚠️ ADD to Admin section |
| Module Assignment Filter | ✅ Backend filters by user module | ⚠️ Frontend must pass user context |

---

### B. PENDING REVIEWS MODULE REINTRODUCTION

**Required Behavior:**

Pending Reviews module must:
1. Display records where `publication_status = 'PENDING_REVIEW'`
2. Aggregate from Construction, Repairs, and University Operations
3. Filter by user's module assignments (Admin sees assigned modules only)
4. SuperAdmin sees all pending submissions
5. Staff does NOT have access to this page

**Access Control Matrix:**

| Role | Module Access | Can View Pending | Scope |
|------|---------------|------------------|-------|
| SuperAdmin | All | ✅ Yes | All modules |
| Admin (assigned CONSTRUCTION) | COI only | ✅ Yes | COI pending only |
| Admin (assigned ALL) | All | ✅ Yes | All modules |
| Staff | - | ❌ No | - |
| Viewer | - | ❌ No | - |

**Backend Query Logic (Already Implemented):**

File: `pmo-backend/src/construction-projects/construction-projects.service.ts` (Lines 530-561)

```typescript
async findPendingReview(userId: string, isSuperAdmin: boolean) {
  // SuperAdmin sees all
  if (isSuperAdmin) {
    return this.db.query(
      `SELECT * FROM construction_projects WHERE publication_status = 'PENDING_REVIEW'`
    );
  }

  // Admin filtered by module assignment
  return this.db.query(
    `SELECT cp.* FROM construction_projects cp
     WHERE cp.publication_status = 'PENDING_REVIEW'
       AND EXISTS (
         SELECT 1 FROM user_module_assignments uma
         WHERE uma.user_id = $1
           AND (uma.module = 'CONSTRUCTION' OR uma.module = 'ALL')
       )`,
    [userId]
  );
}
```

**Frontend Page Structure (Required):**

File Path: `pmo-frontend/pages/admin/pending-reviews.vue`

**Page Components:**
1. Tab navigation: COI | Repairs | University Operations | All
2. Data table per module (or unified with module column)
3. Meatball menu: View, Approve, Reject
4. Filter: Date range, submitter name
5. Empty state when no pending items

**Sidebar Integration:**

File: `pmo-frontend/layouts/default.vue`

**Required Change:**
Add "Pending Reviews" link in Admin section.

```vue
<!-- Current Admin Section (Lines 79-88) -->
<template v-if="isAdmin">
  <v-list-subheader>ADMIN</v-list-subheader>
  <v-list-item to="/users" prepend-icon="mdi-account-multiple">
    <v-list-item-title>User Management</v-list-item-title>
  </v-list-item>
</template>
```

**Required Enhancement:**
```vue
<!-- Proposed Admin Section (NO IMPLEMENTATION) -->
<template v-if="isAdmin">
  <v-list-subheader>ADMIN</v-list-subheader>
  <v-list-item to="/admin/pending-reviews" prepend-icon="mdi-clipboard-check-outline">
    <v-list-item-title>Pending Reviews</v-list-item-title>
  </v-list-item>
  <v-list-item to="/users" prepend-icon="mdi-account-multiple">
    <v-list-item-title>User Management</v-list-item-title>
  </v-list-item>
</template>
```

**Design Decision: Unified vs Per-Module Dashboard**

| Option | Pros | Cons |
|--------|------|------|
| **Unified Dashboard** | Single page, quick overview | Complex aggregation, mixed columns |
| **Per-Module Tabs** | Module-specific columns, familiar | More navigation |
| **Hybrid (Tabs + Unified)** | Best of both, user choice | Higher complexity |

**Recommendation:** Unified dashboard with tabs and module column. Admin sees all assigned modules in one place, can filter by module tab.

---

### C. ACTION CONSOLIDATION: SUBMIT / WITHDRAW / APPROVE / DISAPPROVE

**Current Actions Implemented:**

| Action | Status | Endpoint | UI Location |
|--------|--------|----------|-------------|
| Submit for Review | ✅ | `POST /:id/submit-for-review` | Meatball + Detail |
| Approve | ✅ | `POST /:id/publish` | Meatball + Detail |
| Reject | ✅ | `POST /:id/reject` | Meatball + Detail |
| **Withdraw** | ❌ | NOT IMPLEMENTED | NOT IMPLEMENTED |

**Problem: Missing Withdraw Action**

After submitting for review, the original submitter CANNOT:
- Cancel their submission
- Return the record to DRAFT status
- Make corrections before approval

**Current Workaround:**
1. Contact Admin to reject the record
2. Admin rejects with notes "Submitter requested withdrawal"
3. Submitter edits and resubmits

**Required: Withdraw Submission Action**

| Attribute | Value |
|-----------|-------|
| Action Name | Withdraw Submission |
| Endpoint | `POST /:id/withdraw` |
| Authorization | Original submitter only |
| Precondition | `publication_status === 'PENDING_REVIEW'` |
| Postcondition | `publication_status = 'DRAFT'` |
| Cleanup | Clear `submitted_by`, `submitted_at` |

**Backend Implementation Pattern:**

```typescript
// Proposed service method (NO IMPLEMENTATION)
async withdraw(id: string, userId: string) {
  const project = await this.findOne(id);

  // Only the original submitter can withdraw
  if (project.submitted_by !== userId) {
    throw new ForbiddenException('Only the original submitter can withdraw');
  }

  // Can only withdraw if still pending (not yet approved/rejected)
  if (project.publication_status !== 'PENDING_REVIEW') {
    throw new BadRequestException('Can only withdraw pending submissions');
  }

  // Reset to DRAFT
  await this.db.query(
    `UPDATE construction_projects
     SET publication_status = 'DRAFT',
         submitted_by = NULL,
         submitted_at = NULL
     WHERE id = $1`,
    [id]
  );

  return { message: 'Submission withdrawn successfully' };
}
```

**Frontend Visibility Logic:**

```typescript
// Proposed visibility check (NO IMPLEMENTATION)
function canWithdraw(project: UIProject): boolean {
  // Must be the original submitter
  if (project.submittedBy !== authStore.user?.id) return false

  // Must be in PENDING_REVIEW status
  if (project.publicationStatus !== 'PENDING_REVIEW') return false

  return true
}
```

**Action Visibility Matrix (Complete):**

| Action | DRAFT | PENDING_REVIEW | PUBLISHED | REJECTED |
|--------|-------|----------------|-----------|----------|
| Submit for Review | ✅ Owner | ❌ | ❌ | ✅ Owner |
| Withdraw | ❌ | ✅ Submitter only | ❌ | ❌ |
| Approve | ❌ | ✅ Admin (assigned module) | ❌ | ❌ |
| Reject | ❌ | ✅ Admin (assigned module) | ❌ | ❌ |
| Edit | ✅ Owner/Admin | ❌ | ✅ Admin | ✅ Owner |
| Delete | ✅ Admin | ❌ | ✅ Admin | ✅ Admin |

---

### D. REVISED WORKFLOW STATE MACHINE

**Current State Machine (Implemented):**

```
DRAFT ──[Submit]──> PENDING_REVIEW ──[Approve]──> PUBLISHED
                           │
                           └──[Reject]──> REJECTED ──[Edit & Resubmit]──> PENDING_REVIEW
```

**Revised State Machine (Required):**

```
                  ┌──────────────────────────────────────────────────────────┐
                  │                                                          │
                  ▼                                                          │
              ┌───────┐                                                      │
      ┌───────│ DRAFT │◄───────────────────────────────────┐                 │
      │       └───────┘                                     │                │
      │           │                                         │                │
      │           │ [Submit for Review]                     │                │
      │           │ (Owner only)                            │                │
      │           ▼                                         │                │
      │    ┌────────────────┐                               │                │
      │    │ PENDING_REVIEW │───[Withdraw]──────────────────┤                │
      │    └────────────────┘   (Submitter only)            │                │
      │           │                                         │                │
      │           ├──[Approve]──────────────┐               │                │
      │           │  (Admin + module access) │              │                │
      │           │                          ▼              │                │
      │           │                    ┌───────────┐        │                │
      │           │                    │ PUBLISHED │────────┼──[Edit]────────┘
      │           │                    └───────────┘        │   (Admin revokes
      │           │                                         │    to DRAFT)
      │           └──[Reject]──────────────┐               │
      │              (Admin + module access) │              │
      │                                      ▼              │
      │                               ┌──────────┐          │
      │                               │ REJECTED │──────────┘
      │                               └──────────┘  (Owner edits,
      │                                              can resubmit)
      │
      └──[Delete]──────────────────────────────────────────────▶ (Removed)
         (Admin only, DRAFT status only)
```

**State Transition Rules:**

| From | To | Action | Actor | Conditions |
|------|-----|--------|-------|------------|
| DRAFT | PENDING_REVIEW | Submit for Review | Owner | Valid record |
| REJECTED | PENDING_REVIEW | Submit for Review | Owner | After edit |
| PENDING_REVIEW | DRAFT | Withdraw | Submitter | Before approval |
| PENDING_REVIEW | PUBLISHED | Approve | Admin | Module access, rank authority |
| PENDING_REVIEW | REJECTED | Reject | Admin | Module access |
| PUBLISHED | DRAFT | Edit | Admin | Automatic revocation |
| REJECTED | DRAFT | Edit | Owner | Implicit (save triggers) |
| DRAFT | (Deleted) | Delete | Admin | Hard constraint |

**Prohibited Transitions:**

| From | To | Reason |
|------|-----|--------|
| DRAFT | PUBLISHED | Must go through review |
| PENDING_REVIEW | PUBLISHED | Only via Approve action |
| PUBLISHED | PENDING_REVIEW | Cannot "unpublish" to pending |
| REJECTED | PUBLISHED | Must resubmit first |

---

### E. REFERENCE DATA MODULE GOVERNANCE

**Current Problem:**

Reference Data modules (Contractors, Funding Sources) visible in sidebar to ALL authenticated users. This is problematic:

1. Staff and Viewers see "References" dropdown in sidebar
2. Staff can navigate to `/contractors` and `/funding-sources`
3. Staff can VIEW reference data (but not modify)
4. UI exposure unnecessary for most users
5. Creates confusion about what users can do

**Current Sidebar Visibility Logic:**

File: `pmo-frontend/layouts/default.vue` (Lines 70-81)

```typescript
const referenceData = computed(() => {
  const allReferenceData = [
    { title: 'Contractors', icon: 'mdi-account-hard-hat', to: '/contractors', key: 'contractors' },
    { title: 'Funding Sources', icon: 'mdi-cash-multiple', to: '/funding-sources', key: 'funding_sources' },
  ]
  return allReferenceData.filter(m => canAccessModule(m.key))
})

const hasReferenceDataAccess = computed(() => referenceData.value.length > 0)
```

**Current Permission Logic:**

File: `pmo-frontend/composables/usePermissions.ts` (Lines 62-64, 202-210)

```typescript
const REFERENCE_DATA_MODULES = ['contractors', 'funding-sources', 'funding_sources']

// Inside getModulePermissions():
if (REFERENCE_DATA_MODULES.includes(normalizedId)) {
  if (role === 'Staff') {
    return { canView: true, canAdd: false, canEdit: false, canDelete: false }  // ← Staff CAN VIEW
  }
  if (role === 'Viewer') {
    return { canView: true, canAdd: false, canEdit: false, canDelete: false }  // ← Viewer CAN VIEW
  }
}
```

**Analysis:**

| Role | canView('contractors') | canAccessModule('contractors') | Sees in Sidebar |
|------|------------------------|-------------------------------|-----------------|
| SuperAdmin | ✅ true | ✅ true | ✅ Yes |
| Admin | ✅ true | ✅ true | ✅ Yes |
| Staff | ✅ true | ✅ true | ✅ Yes ← PROBLEM |
| Viewer | ✅ true | ✅ true | ✅ Yes ← PROBLEM |

**Required Governance:**

| Role | canView('contractors') | canAccessModule('contractors') | Sees in Sidebar |
|------|------------------------|-------------------------------|-----------------|
| SuperAdmin | ✅ true | ✅ true | ✅ Yes |
| Admin | ✅ true | ✅ true | ✅ Yes |
| Staff | ❌ false | ❌ false | ❌ No |
| Viewer | ❌ false | ❌ false | ❌ No |

**Required Change:**

Reference Data modules must be in the `ADMIN_ONLY_MODULES` array, not just have restricted CRUD.

```typescript
// Current (Lines 56-59)
const ADMIN_ONLY_MODULES = ['users']

// Required
const ADMIN_ONLY_MODULES = ['users', 'contractors', 'funding-sources', 'funding_sources']
```

**Or modify canAccessModule() for Reference Data:**

```typescript
// Alternative approach: Explicit admin check for Reference Data
function canAccessModule(moduleId: string): boolean {
  // SuperAdmin bypasses all checks
  if (isSuperAdmin.value) return true

  // Reference Data: Admin-only sidebar visibility
  if (REFERENCE_DATA_MODULES.includes(normalizedId)) {
    return isAdmin.value  // Only Admin sees in sidebar
  }

  // ... existing logic
}
```

**Backend API Access:**

Backend still serves lookup data for dropdowns (e.g., contractor list in COI form). This is controlled separately from sidebar visibility.

| Endpoint | Who Needs | Access Level |
|----------|-----------|--------------|
| `GET /api/contractors` (list) | All users (for dropdowns) | ✅ Keep accessible |
| `GET /api/contractors/:id` (detail) | Admin only | ⚠️ Restrict |
| `POST /api/contractors` | Admin only | ✅ Already restricted |
| `PATCH /api/contractors/:id` | Admin only | ✅ Already restricted |
| `DELETE /api/contractors/:id` | Admin only | ✅ Already restricted |

**Note:** Backend list endpoint must remain accessible for form dropdowns. Only the standalone UI pages should be hidden from sidebar.

---

### F. PERMISSION VISIBILITY ALIGNMENT

**Required Visibility Logic (Comprehensive):**

**Submit for Review:**
```typescript
function canSubmitForReview(record): boolean {
  // Must be DRAFT or REJECTED status
  if (record.publicationStatus !== 'DRAFT' && record.publicationStatus !== 'REJECTED') {
    return false
  }

  // Must have Create/Edit permission for the module
  if (!canEdit(module)) return false

  // Must be the owner of the record
  if (record.createdBy !== authStore.user?.id) return false

  return true
}
```

**Withdraw Submission:**
```typescript
function canWithdraw(record): boolean {
  // Must be PENDING_REVIEW status
  if (record.publicationStatus !== 'PENDING_REVIEW') return false

  // Must be the original submitter
  if (record.submittedBy !== authStore.user?.id) return false

  return true
}
```

**Approve / Disapprove:**
```typescript
function canApproveOrReject(record): boolean {
  // Must be PENDING_REVIEW status
  if (record.publicationStatus !== 'PENDING_REVIEW') return false

  // Must be Admin or SuperAdmin
  if (!isAdmin.value && !isSuperAdmin.value) return false

  // Must have module assignment (Admin only, SuperAdmin bypasses)
  if (!isSuperAdmin.value) {
    const assignments = authStore.user?.moduleAssignments ?? []
    if (!assignments.includes(moduleKey) && !assignments.includes('ALL')) {
      return false
    }
  }

  // Self-approval prevention
  if (record.submittedBy === authStore.user?.id && !isSuperAdmin.value) {
    return false
  }

  // Rank validation (complex, defer to backend)
  // UI cannot easily check rank hierarchy

  return true
}
```

**Edit Record:**
```typescript
function canEditRecord(record): boolean {
  // Must have Edit permission
  if (!canEdit(module)) return false

  // Cannot edit while in review (locked state)
  if (record.publicationStatus === 'PENDING_REVIEW') return false

  // Admin can edit any record
  if (isAdmin.value) return true

  // Staff can only edit own records
  return record.createdBy === authStore.user?.id
}
```

**Delete Record:**
```typescript
function canDeleteRecord(record): boolean {
  // Must have Delete permission (Admin only)
  if (!canDelete(module)) return false

  // Can only delete DRAFT records
  if (record.publicationStatus !== 'DRAFT') return false

  return true
}
```

---

### G. RISK ANALYSIS

**RISK-051: Workflow Orphan State**

| Attribute | Value |
|-----------|-------|
| Threat | Records submitted for review but no UI for Admins to find them |
| Likelihood | CONFIRMED |
| Impact | HIGH - Records stuck indefinitely in PENDING_REVIEW |
| Current Mitigation | Admins manually check each module index |
| Required Mitigation | Implement Pending Reviews dashboard |

**RISK-052: Submit-Without-Review Visibility**

| Attribute | Value |
|-----------|-------|
| Threat | Staff submits records but cannot track submission status |
| Likelihood | MEDIUM |
| Impact | MEDIUM - User confusion, duplicate submissions |
| Current Mitigation | "My Drafts" page shows user's own drafts with status |
| Required Mitigation | Enhance "My Drafts" to clearly show pending status |

**RISK-053: No Withdrawal Path**

| Attribute | Value |
|-----------|-------|
| Threat | Submitter cannot withdraw mistaken submission |
| Likelihood | CONFIRMED |
| Impact | MEDIUM - Requires Admin intervention to reject |
| Current Mitigation | None |
| Required Mitigation | Implement Withdraw action |

**RISK-054: Unauthorized Approval Attempt**

| Attribute | Value |
|-----------|-------|
| Threat | UI shows Approve button to Admin without module access |
| Likelihood | MEDIUM |
| Impact | LOW - Backend rejects (UX issue, not security) |
| Current Mitigation | Backend validates module assignment |
| Required Mitigation | Phase J (already planned) adds `canApprove()` check |

**RISK-055: Cross-Module Review Leakage**

| Attribute | Value |
|-----------|-------|
| Threat | Admin sees pending records from modules not assigned |
| Likelihood | VERY LOW |
| Impact | LOW - Read-only leakage, cannot approve |
| Current Mitigation | Backend filters by module assignment |
| Required Mitigation | Pending Reviews page must respect module filtering |

**RISK-056: Reference Data Exposure**

| Attribute | Value |
|-----------|-------|
| Threat | Staff/Viewer sees Reference Data sidebar links |
| Likelihood | CONFIRMED |
| Impact | LOW - Can view but not modify, confusing UX |
| Current Mitigation | CRUD permissions restricted |
| Required Mitigation | Hide from sidebar entirely for non-Admin |

**RISK-057: State Transition Bypass**

| Attribute | Value |
|-----------|-------|
| Threat | Direct API call bypasses DRAFT → PUBLISHED |
| Likelihood | VERY LOW |
| Impact | CRITICAL - Data integrity violation |
| Current Mitigation | Backend enforces `publication_status === 'PENDING_REVIEW'` check |
| Required Mitigation | None (already enforced) |

---

### H. RESEARCH CONCLUSIONS

**Justified Changes:**

1. **Pending Reviews Module Reintegration (MUST)**
   - Backend endpoints exist, need frontend page
   - Without it, workflow is incomplete
   - Admin visibility required for governance

2. **Withdraw Action Implementation (MUST)**
   - No current way for submitters to cancel
   - Forces Admin intervention for simple corrections
   - Standard workflow pattern

3. **Reference Data Sidebar Restriction (MUST)**
   - Current visibility creates confusion
   - Staff don't need standalone reference pages
   - Dropdown data still accessible for forms

4. **State Machine Hardening (MUST)**
   - Withdraw transition must be added
   - No other state changes required
   - Backend enforcement already robust

**Deferred Changes:**

1. **Rank-based UI validation** - Too complex for UI, backend authoritative
2. **Approval audit timeline** - Nice-to-have, not governance-critical
3. **Real-time permission sync** - Low ROI, token expiry handles stale data

---

**ACE PHASE 1 RESEARCH DECLARED COMPLETE (Section 1.33)**

Next Phase: Update `plan.md` with:
- Phase L: Pending Reviews Module Reintegration
- Phase M: Withdraw Action Implementation
- Phase N: Reference Data Access Control
- Update Regression Test Matrix

---

**END OF SECTION 1.33**

---

## 1.34 Hierarchical CRUD Enforcement & Governance Alignment (Feb 17, 2026)

**Status:** 🔬 PHASE 1 RESEARCH COMPLETE — Ready for Phase 2 Plan Update

**ACE Governance:** Phase 1 Research → Phase 2 Plan → Phase 3 Implementation

**Directive:** Stabilize hierarchical CRUD logic, rank integration into permission resolution, centralize backend enforcement, and normalize plan.md.

**Research Scope:**
- A. CRUD Resolution — Current State Analysis
- B. Rank System — Storage, JWT, and Actual Enforcement
- C. Staff Workflow — Productive or Blocked?
- D. Centralized Resolver — Exists or Not?
- E. Per-Action Permission Storage — Schema Audit
- F. Deferred File Drift — Logic Fragmentation
- G. plan.md Structural Critique
- H. Risk Analysis
- I. Research Conclusions

---

### A. CRUD RESOLUTION — CURRENT STATE ANALYSIS

**Source Files:**
- `pmo-frontend/composables/usePermissions.ts` (Lines 49-54, 179-214)
- `pmo-backend/src/construction-projects/construction-projects.service.ts`

**Current CRUD Matrix (Role-Based Flat Model):**

| Role | canView | canAdd | canEdit | canDelete | canApprove |
|------|---------|--------|---------|-----------|------------|
| SuperAdmin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ (module-scoped) |
| Staff | ✅ | ✅ | ✅ | ❌ | ❌ |
| Viewer | ✅ | ❌ | ❌ | ❌ | ❌ |

**Resolution Order (Documented, Lines 5-10):**
1. SuperAdmin bypass — full access
2. User module override — explicit grant/revoke
3. Role default — ROLE_PERMISSIONS matrix
4. Deny

**Finding:** The frontend CRUD matrix is **role-based only, not rank-based**. Rank is extracted as `rankLevel` computed property (Lines 125-129) but is **never consulted in getModulePermissions(), canAdd(), canEdit(), or canDelete()**.

**Backend CRUD Gates:**
- `create()`: All authenticated users (Admin, Staff) can create. Records save as DRAFT.
- `update()`: `@Roles('Admin', 'Staff')` + service-level ownership check
- `delete()`: `@Roles('Admin')` only
- `publish()`: `@Roles('Admin')` + rank-based authority check

**Assessment:** The current CRUD model IS correct for the Universal Draft Governance pattern. The assertion that "Staff cannot Create/Edit meaningfully" requires clarification:
- Staff CAN create COI, Repairs, University Operations records as DRAFT ✅
- Staff CAN edit their own DRAFT/REJECTED records ✅
- Staff CANNOT delete, approve, or publish ✅
- This is the **intended behavior**, not a defect

**Real Gap Identified:** Staff cannot see PENDING_REVIEW records submitted by others — they only see their own records. This is not a CRUD problem, it is a **visibility scoping problem**.

---

### B. RANK SYSTEM — STORAGE, JWT, AND ENFORCEMENT

**Source Files:**
- `database/migrations/008_add_rank_system.sql`
- `pmo-backend/src/users/users.service.ts` (Lines 16-23, 59-84)
- `pmo-backend/src/auth/auth.service.ts` (Lines 84-158)

**Rank Storage:**

| Location | Field | Present |
|----------|-------|---------|
| Database | `users.rank_level INTEGER DEFAULT 100` | ✅ |
| JWT Payload | `rank_level` | ❌ NOT INCLUDED |
| Login Response Body | `rank_level` | ✅ |
| `/me` Response Body | `rank_level` | ✅ |
| Frontend `authStore.user.rankLevel` | Populated from login | ✅ |

**Defined Rank Levels:**

```
SUPER_ADMIN:   10  (highest authority)
SENIOR_ADMIN:  20
MODULE_ADMIN:  30
SENIOR_STAFF:  50
JUNIOR_STAFF:  70
VIEWER:       100  (lowest authority)
```

**Where Rank IS Enforced:**

1. **User Management** (`users.service.ts` Lines 59-84):
   - `canModifyUser()`: Uses `can_modify_user(actor_id, target_id)` PostgreSQL function
   - Actor can only modify users with **higher rank_level number** (lower authority)
   - Prevents rank escalation by manipulation

2. **Approval Authority** (`construction-projects.service.ts` Lines 443-461):
   - Approver `rank_level` must be **lower** (higher authority) than submitter `rank_level`
   - Prevents same-level or lower-authority approval

**Where Rank IS NOT Enforced:**

1. Module CRUD gates (canAdd, canEdit, canDelete) — not rank-influenced
2. Module visibility — not rank-influenced
3. JWT does not carry rank — backend must re-query DB for rank in approval flow

**Critical Finding:** Rank is **not in JWT**. The approval endpoint re-queries the DB for both approver and submitter rank levels at approval time (`SELECT rank_level FROM users WHERE id = $1`). This is correct for security but adds two extra DB queries per approval.

---

### C. STAFF WORKFLOW — PRODUCTIVE OR BLOCKED?

**Investigated Claim:** "Staff users can only view records — no productive workflow."

**Research Verdict:** CLAIM IS PARTIALLY INACCURATE

**What Staff CAN do (confirmed by code):**

| Action | Endpoint / Gate | Allowed |
|--------|----------------|---------|
| View all PUBLISHED records | `GET /api/construction-projects` | ✅ |
| Create new COI record (DRAFT) | `POST /api/construction-projects` | ✅ |
| Edit own DRAFT/REJECTED record | `PATCH /api/construction-projects/:id` | ✅ |
| Submit own DRAFT for Review | `POST /:id/submit-for-review` | ✅ |
| Withdraw own submission | `POST /:id/withdraw` | ✅ |
| View own drafts | `GET /my-drafts` | ✅ |

**What Staff CANNOT do (by design):**

| Action | Reason |
|--------|--------|
| Delete any record | `@Roles('Admin')` only |
| Approve/Publish | `@Roles('Admin')` only |
| Edit another user's record | Ownership check in service |
| View others' DRAFT records | Non-Admin only sees PUBLISHED |
| Access Contractors/Funding Sources pages | `ADMIN_ONLY_MODULES` |

**Refined Gap:** The actual problem is:
1. Staff can only see **their own** DRAFT records (not team DRAFT records)
2. No team-level workflow visibility for Staff
3. No rank-based differentiation within Staff role (Senior Staff vs Junior Staff — treated identically)
4. Rank levels 50 vs 70 both map to `Staff` role with identical CRUD permissions

---

### D. CENTRALIZED RESOLVER — EXISTS OR NOT?

**Verdict:** NO CENTRALIZED BACKEND RESOLVER EXISTS

**Current State:**

| Location | Permission Logic |
|----------|-----------------|
| `JwtAuthGuard` | Validates token signature only |
| `RolesGuard` | Checks `@Roles()` decorator against `user.roles` |
| Service methods | Ad-hoc `isAdmin()`, `isAdminFromDatabase()` checks |
| Frontend `usePermissions.ts` | Centralized for UI — not backend |

**Fragmented Enforcement Pattern:**

```
controller.ts → @Roles('Admin', 'Staff')
service.ts    → if (!this.isAdmin(user)) throw ForbiddenException
service.ts    → if (project.created_by !== userId) throw ForbiddenException
service.ts    → rank_level query at approval time
```

**Missing Components:**
- No `PermissionResolverService` or equivalent
- No `resolvePermission(userId, module, action)` method
- No guard that checks module assignment for CRUD (only for approval)
- Service methods individually enforce ownership, status, and role — no shared logic

---

### E. PER-ACTION PERMISSION STORAGE — SCHEMA AUDIT

**Source:** `database/migrations/006_add_user_permission_overrides.sql`

**Current Schema:**

```sql
CREATE TABLE user_permission_overrides (
  id UUID,
  user_id UUID REFERENCES users(id),
  module_key VARCHAR(50),  -- 'coi', 'repairs', etc.
  can_access BOOLEAN NOT NULL,  -- binary grant/revoke
  created_by UUID,
  updated_by UUID,
  ...
);
UNIQUE (user_id, module_key);
```

**Finding:** Override is **binary module-level access only** (`can_access: true/false`). No action-level columns exist:
- No `can_create` per module
- No `can_edit` per module
- No `can_delete` per module
- No `can_approve` per module

**Module Assignment Schema:**

```sql
CREATE TABLE user_module_assignments (
  user_id UUID REFERENCES users(id),
  module module_type,  -- CONSTRUCTION, REPAIR, OPERATIONS, ALL
  assigned_by UUID,
  ...
);
```

**Finding:** Module assignments track **approval scope** for Admins, not CRUD permissions for Staff.

**Gap:** There is no database mechanism to grant, say, "Staff user X can delete in module COI but not in Repairs." The schema does not support action-level granularity.

---

### F. DEFERRED FILE DRIFT — LOGIC FRAGMENTATION

**Files with Potential Drift:**

**`pmo-frontend/composables/usePermissions.ts`:**
- `rankLevel` computed property (Lines 125-129) — extracted but never used in CRUD gates
- `REFERENCE_DATA_MODULES` constant (Line 67) — now redundant since reference data added to `ADMIN_ONLY_MODULES`
- `canApprove()` (Lines 258-268) — uses `moduleAssignments` but not rank comparison

**`pmo-backend/src/construction-projects/construction-projects.service.ts`:**
- `isAdmin()` (Line 40) — duplicate logic in each service
- `isAdminFromDatabase()` (Line 48) — not called consistently

**`pmo-backend/src/auth/auth.service.ts`:**
- JWT payload does not include `rank_level` or `module_assignments`
- Backend must re-query DB for rank at every approval — two extra queries per publish

**`pmo-frontend/composables/usePermissions.ts`:**
- `REFERENCE_DATA_MODULES` constant still present but now overlaps with `ADMIN_ONLY_MODULES`
- Creates redundant check: reference data module falls into ADMIN_ONLY check first, REFERENCE_DATA check never reached for sidebar

**Drift Summary:**

| File | Issue | Severity |
|------|-------|----------|
| `usePermissions.ts` | `rankLevel` computed but unused in CRUD gates | MEDIUM |
| `usePermissions.ts` | `REFERENCE_DATA_MODULES` redundant after Phase N | LOW |
| `usePermissions.ts` | `canApprove()` missing rank comparison | MEDIUM |
| Backend services | Duplicated `isAdmin()` per service | MEDIUM |
| Auth JWT | Missing `rank_level`, `module_assignments` | HIGH |

---

### G. PLAN.MD STRUCTURAL CRITIQUE

**Current plan.md Structure Assessment:**

**Positives:**
- Phases H–O documented with status markers
- Risk summary maintained
- Deferred work section present

**Deficiencies:**

1. **Completed phases not compacted** — Phases H, I, J contain full implementation specs despite being marked ✅ COMPLETE. This creates visual noise and obscures active work.

2. **Phase K (Regression Tests) ambiguous** — Listed as MUST with no status marker (pending). But no assignment, no deadline, no scope indicator. Appears stale.

3. **Deferred work lacks structure** — Items 1-8 in Deferred Work have no priority, no dependency, no ACE phase reference.

4. **Missing hierarchical CRUD section** — No phase addresses:
   - Rank-based CRUD differentiation within Staff role
   - Senior Staff vs Junior Staff distinction
   - Centralized resolver design

5. **Missing backend resolver phase** — No planned work to centralize permission logic in backend

6. **Duplicate CRUD matrix** — Both research.md (1.32) and plan.md describe the CRUD matrix with no normalization

7. **Success Criteria mixing active and completed** — All items show ✅ even though K (regression tests) is unexecuted

8. **"Phase 2 – Structured Plan" in header outdated** — Should reflect Phase 3 Implementation complete, planning Phase 4

---

### H. RISK ANALYSIS

**RISK-058: Rank Irrelevance in CRUD**

| Attribute | Value |
|-----------|-------|
| Threat | Senior Staff (rank 50) and Junior Staff (rank 70) receive identical CRUD permissions |
| Likelihood | CONFIRMED |
| Impact | MEDIUM — Rank system appears decorative, not functional for module CRUD |
| Current Mitigation | Rank used in approval flow only |
| Required Mitigation | Define rank-influenced CRUD tiers or document that rank is approval-authority only |

**RISK-059: No Centralized Backend Resolver**

| Attribute | Value |
|-----------|-------|
| Threat | Permission logic scattered across service methods, difficult to audit |
| Likelihood | CONFIRMED |
| Impact | MEDIUM — Risk of inconsistent enforcement across services |
| Current Mitigation | Each service individually enforces ownership and role |
| Required Mitigation | Extract shared `PermissionGuard` or `resolvePermission()` service |

**RISK-060: Staff Visibility Gap**

| Attribute | Value |
|-----------|-------|
| Threat | Staff cannot see team members' DRAFT records — no team workflow visibility |
| Likelihood | CONFIRMED |
| Impact | MEDIUM — Reduces collaborative workflow capability |
| Current Mitigation | Staff see own records via My Drafts page |
| Required Mitigation | Define scope: Is team-level visibility a requirement? |

**RISK-061: JWT Missing Permission Context**

| Attribute | Value |
|-----------|-------|
| Threat | rank_level and module_assignments not in JWT — backend must re-query DB at approval |
| Likelihood | CONFIRMED |
| Impact | LOW — Performance concern (extra DB queries), not security issue |
| Current Mitigation | DB queries at approval time are authoritative |
| Required Mitigation | Add to JWT claims (with expiry awareness) |

**RISK-062: REFERENCE_DATA_MODULES Constant Drift**

| Attribute | Value |
|-----------|-------|
| Threat | Constant now redundant after Phase N — dead code path in usePermissions.ts |
| Likelihood | CONFIRMED |
| Impact | LOW — Dead code, not behavioral issue |
| Current Mitigation | None |
| Required Mitigation | Remove constant or repurpose for form-dropdown access control |

**RISK-063: Permission Override Schema Limitation**

| Attribute | Value |
|-----------|-------|
| Threat | Cannot grant action-level overrides (e.g., Staff X can delete in COI) |
| Likelihood | CONFIRMED — Schema only supports binary module access |
| Impact | MEDIUM — Limits granularity of permission management |
| Current Mitigation | Role-based defaults with module-level grant/revoke |
| Required Mitigation | Schema migration to add per-action columns (DEFERRED — high complexity) |

---

### I. RESEARCH CONCLUSIONS

**Definitive Finding 1: Staff Workflow IS Functional**

Staff CAN create, edit, submit, and withdraw records. The "Staff can only view" claim is inaccurate for operational modules (COI, Repairs, University Operations). The gap is:
- Staff cannot see other users' DRAFT records
- Senior Staff and Junior Staff are indistinguishable by CRUD logic

**Definitive Finding 2: Rank Is Approval-Authority Only**

Rank influences two things: who can modify user accounts, and who can approve submissions. It does NOT and was NOT designed to influence create/edit/delete CRUD. If hierarchical CRUD by rank is required, it must be explicitly designed and schema must be extended.

**Definitive Finding 3: No Centralized Backend Resolver**

This is the highest-priority architectural gap. Permission logic is replicated per service. A `PermissionResolverService` would reduce duplication and improve auditability.

**Definitive Finding 4: Frontend Resolver Is Correct But Incomplete**

`usePermissions.ts` correctly implements the role-based model. The `rankLevel` computed property is available but unused — a signal that rank-CRUD integration was intended but not implemented.

**Definitive Finding 5: Schema Cannot Support Action-Level Overrides**

The current schema (`user_permission_overrides`) only stores binary module access. To support "Staff X can delete in COI," the schema needs new columns. This is a migration, not a code change.

---

**Justified Changes for plan.md:**

1. **Plan Normalization (MUST)** — Compact completed phases, separate Active/Completed/Deferred
2. **REFERENCE_DATA_MODULES Cleanup (SHOULD)** — Remove dead constant or repurpose
3. **Centralized Backend Resolver (SHOULD)** — Extract shared permission logic
4. **Rank CRUD Design Clarification (MUST)** — Formally define whether rank should influence CRUD or is approval-authority only
5. **JWT Claim Extension (DEFERRED)** — Add rank_level to JWT for performance

**NOT Changing:**
- Universal Draft Governance (working)
- Staff CRUD matrix (correct per design)
- Approval rank enforcement (working)
- Withdraw/Submit workflow (working)

---

**ACE PHASE 1 RESEARCH DECLARED COMPLETE (Section 1.34)**

Next: Update `plan.md` with:
- Compacted completed phases
- Phase P: Rank CRUD Design Clarification
- Phase Q: Centralized Backend Resolver
- Phase R: Frontend Drift Cleanup
- Full CRUD Regression Test Matrix

---

**END OF SECTION 1.34**

---

## 1.35 GOVERNANCE DECISION: Rank Scope Definition (Feb 18, 2026)

**Status:** ✅ GOVERNANCE DECISION FINALIZED — Phase P Complete

**ACE Governance:** Phase 3 Implementation — Documenting governance decision

---

### DECISION: Rank Is Approval-Authority Only (Option A)

**Effective Date:** 2026-02-18

**Decision Statement:**

The `rank_level` field in the users table (values 10–100) is **scoped exclusively to approval authority and user hierarchy management**. Rank does **NOT** influence module CRUD operations (create, edit, delete).

**Scope of Rank Enforcement:**

| Context | Rank Used | Description |
|---------|-----------|-------------|
| User Hierarchy Management | ✅ YES | Actor can only modify users with higher rank_level (lower authority) |
| Approval Authority | ✅ YES | Approver must have lower rank_level (higher authority) than submitter |
| Module CRUD (create/edit/delete) | ❌ NO | CRUD is role-based only |
| Module Visibility | ❌ NO | Module access is role + override based |

**Rationale:**

1. **Simplicity:** Role-based CRUD is sufficient for current organizational needs. Senior Staff vs Junior Staff distinction adds complexity without clear business value for module CRUD.

2. **Separation of Concerns:** Rank governs **authority chains** (who can approve whom, who can manage whom). Role governs **capability** (what actions can be performed).

3. **Schema Stability:** Implementing rank-based CRUD would require new columns in `user_permission_overrides` table. Current schema only supports binary module access (`can_access: boolean`).

4. **Audit Clarity:** Permission audit is simpler: "Staff can CRU, Admin can CRUD" vs "Staff rank 50 can CRU+D, Staff rank 70 can CRU".

**Final CRUD Matrix (Authoritative):**

| Role | canView | canAdd | canEdit | canDelete | canApprove |
|------|---------|--------|---------|-----------|------------|
| SuperAdmin | ✅ | ✅ | ✅ | ✅ | ✅ (all modules) |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ (assigned modules only) |
| Staff | ✅ | ✅ | ✅ | ❌ | ❌ |
| Viewer | ✅ | ❌ | ❌ | ❌ | ❌ |

**Note:** All users create DRAFT records. Publishing requires Admin approval per Universal Draft Governance (research.md Section 1.29).

**Code Implications:**

1. `usePermissions.ts` `rankLevel` computed property: **RETAIN** for use in `canApprove()` rank comparison (Phase R enhancement)
2. `getModulePermissions()`: **NO CHANGE** — does not use rank, as designed
3. Backend approval endpoints: **ALREADY CORRECT** — validate approver rank < submitter rank

**Verification:**

- [x] Governance decision documented
- [x] Rank scope clearly defined
- [x] No schema changes required
- [x] Existing code aligned with decision

---

**END OF SECTION 1.35**

---

## 1.36 Implementation Summary: Phases P, Q, R (Feb 18, 2026)

**Status:** ✅ IMPLEMENTATION COMPLETE

---

### PHASE P: Rank CRUD Scope Definition

**Decision:** Option A — Rank is approval-authority only

**Artifacts Changed:**
- `docs/research.md` Section 1.35 — Governance decision documented
- `pmo-frontend/composables/usePermissions.ts` — `rankLevel` comment updated to clarify approval-authority scope

**Outcome:** Rank does not influence create/edit/delete CRUD. Role-based CRUD matrix is final and authoritative.

---

### PHASE Q: Centralized Backend Resolver

**Artifacts Created:**
- `pmo-backend/src/common/services/permission-resolver.service.ts` — New centralized service
- `pmo-backend/src/common/services/index.ts` — Export barrel
- `pmo-backend/src/common/common.module.ts` — Global module for shared services

**Artifacts Modified:**
- `pmo-backend/src/app.module.ts` — Added CommonModule import
- `pmo-backend/src/construction-projects/construction-projects.service.ts` — Uses PermissionResolverService
- `pmo-backend/src/repair-projects/repair-projects.service.ts` — Uses PermissionResolverService
- `pmo-backend/src/university-operations/university-operations.service.ts` — Uses PermissionResolverService

**Key Methods in PermissionResolverService:**
- `isAdmin(user: JwtPayload): boolean` — Check admin role from JWT
- `isAdminFromDatabase(userId: string): Promise<boolean>` — Secure DB validation
- `canApproveByRank(approverId, submitterId, isSuperAdmin): Promise<PermissionResult>` — Centralized rank approval check (includes self-approval prevention)
- `canModifyUserByRank(actorId, targetId, isSuperAdmin): Promise<PermissionResult>` — User hierarchy check

**Outcome:** Permission logic is now centralized. Rank-based approval check consolidated into single method with optimized DB query (one query vs two).

---

### PHASE R: Frontend Permission Drift Cleanup

**Artifacts Modified:**
- `pmo-frontend/composables/usePermissions.ts`:
  - `REFERENCE_DATA_MODULES` comment clarified (form-level vs sidebar access)
  - `rankLevel` comment clarified (approval-authority only, per Phase P)
- `pmo-frontend/pages/coi/index.vue` — `canApproveItem()` now prevents self-approval UI
- `pmo-frontend/pages/repairs/index.vue` — `canApproveItem()` now prevents self-approval UI
- `pmo-frontend/pages/university-operations/index.vue` — `canApproveItem()` now prevents self-approval UI

**Self-Approval Prevention Logic:**
```typescript
function canApproveItem(item): boolean {
  if (!isAdmin.value) return false
  if (item.publicationStatus !== 'PENDING_REVIEW') return false
  // Hide Approve button for own submissions (SuperAdmin exempt)
  const currentUserId = authStore.user?.id
  if (!isSuperAdmin.value && item.approvalMetadata?.submittedBy === currentUserId) {
    return false
  }
  return true
}
```

**Outcome:** UI now hides Approve button for self-submitted records, preventing user confusion from backend 403 rejection. SuperAdmin bypasses this check.

---

### RISK RESOLUTION SUMMARY

| Risk ID | Description | Resolution |
|---------|-------------|------------|
| RISK-058 | Rank irrelevance in CRUD | ✅ Documented as by-design — rank = approval-authority only |
| RISK-059 | No centralized backend resolver | ✅ PermissionResolverService created |
| RISK-062 | REFERENCE_DATA_MODULES drift | ✅ Comment clarified purpose |
| NEW | Self-approval UI inconsistency | ✅ canApproveItem() updated in all index pages |

---

**ACE PHASE 3 IMPLEMENTATION DECLARED COMPLETE (Phases P, Q, R)**

**Remaining:** Phase K — Manual regression testing in running environment

---

**END OF SECTION 1.36**

---

### 1.39 Phase Y Migration Failure Analysis (Feb 2026)

**Status:** ✅ PHASE 1 RESEARCH COMPLETE
**Error:** `ERROR: column "campus" of relation "users" does not exist (SQL state: 42703)`

---

#### A. ROOT CAUSE ANALYSIS

**Error Context:**
The error occurs when backend code attempts to SELECT the `campus` column from the `users` table before the migration has been applied.

**Affected Queries (Phase Y implementation):**
1. `auth.service.ts` — `validateUser()` query includes `u.campus`
2. `auth.service.ts` — `getProfile()` query includes `u.campus`
3. `users.service.ts` — `findAll()` query includes `u.campus`
4. `users.service.ts` — `findOne()` query includes `u.campus`
5. `users.service.ts` — `create()` INSERT includes `campus`
6. `users.service.ts` — `update()` SET may include `campus`

**Migration Script (011_add_user_campus.sql):**
The migration script itself is syntactically correct:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS campus TEXT;
```

**Issue:** The backend code was deployed/run BEFORE the migration was executed, causing all queries that reference `campus` to fail.

---

#### B. SOLUTION OPTIONS

**Option 1: Run Migration First (Recommended)**
- Execute `011_add_user_campus.sql` before starting the backend
- Simplest solution, no code changes required
- Risk: Zero — migration is idempotent (`IF NOT EXISTS`)

**Option 2: Defensive Queries with COALESCE**
- Wrap column references: `COALESCE(u.campus, NULL) as campus`
- Still fails if column doesn't exist — COALESCE doesn't help with missing columns

**Option 3: Dynamic Column Detection**
- Query `information_schema.columns` first to check if column exists
- Complex, performance overhead, not recommended

**Option 4: Conditional Backend Code**
- Check database version/schema at startup
- Overly complex for this use case

---

#### C. MIGRATION SCRIPT VALIDATION

The current migration script has a potential issue: the `COMMENT ON COLUMN` statement will fail if run before the `ALTER TABLE` completes in the same transaction.

**Revised Migration (Recommended):**
Wrap everything in a DO block to ensure atomicity and proper error handling:

```sql
DO $$
BEGIN
  -- Add campus column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'campus'
  ) THEN
    ALTER TABLE users ADD COLUMN campus TEXT;
  END IF;
END $$;

-- Index (idempotent)
CREATE INDEX IF NOT EXISTS idx_users_campus ON users(campus);

-- Comment (only runs if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'campus'
  ) THEN
    COMMENT ON COLUMN users.campus IS
      'User office/campus assignment for record visibility scoping.';
  END IF;
END $$;
```

---

#### D. DEPLOYMENT ORDER

**Correct Order:**
1. Stop backend service (or accept brief errors during migration)
2. Run migration `011_add_user_campus.sql`
3. Verify: `SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'campus';`
4. Restart backend service

---

**END OF SECTION 1.39**

---

### 1.40 System Stability Validation + Gap Analysis (Feb 2026)

**Status:** ✅ PHASE 1 RESEARCH COMPLETE
**Directive:** Validate stability after user-confirmed test suites. Identify remaining gaps. Align plan with deadline.

---

#### A. USER-CONFIRMED TEST SUITE STATUS

The following test suites have been explicitly confirmed working by the user in the running environment:

| Suite | Description | Confirmed |
|-------|-------------|-----------|
| K6–K9 | Pending Reviews, Withdraw, Reference Data, Full Workflow | ✅ User-confirmed |
| V1–V6 | REJECTED revision flow — edit resets to DRAFT, resubmit works | ✅ User-confirmed |
| W1–W5 | PENDING_REVIEW auto-revert — edit cancels submission, reverts to DRAFT | ✅ User-confirmed |
| X1–X6 | Director Staff visibility — own DRAFTs visible in main list | ✅ User-confirmed |
| AA1 | Schema migration — `assigned_to` column on all 3 module tables | ✅ User-confirmed |
| AB1–AB3 | Visibility query — assigned user sees assigned DRAFTs | ✅ User-confirmed |
| AC1–AC3 | Edit permission — assigned user can PATCH | ✅ User-confirmed |
| AD1–AD3 | Submit permission — assigned user can submit for review | ✅ User-confirmed |
| Y-series | Campus scoping — Staff with campus sees campus-filtered records | ✅ User-confirmed |

**Stability conclusion:** All confirmed test suites represent stable, locked behavior. No regressions permitted.

---

#### B. SYSTEM STABILITY ASSESSMENT

**Draft Lifecycle:** STABLE
- DRAFT → PENDING_REVIEW → PUBLISHED / REJECTED confirmed working
- REJECTED → DRAFT auto-revert on edit confirmed working
- PENDING_REVIEW → DRAFT auto-revert on edit confirmed working

**Review / Approval Flow:** STABLE
- Admin approval with rank check confirmed working
- Self-approval block confirmed working
- Module-scoped approval (Admin can only approve their assigned module) confirmed working
- Pending Reviews dashboard shows cross-module PENDING_REVIEW records

**Record Assignment and Delegation:** STABLE (post-migration)
- `assigned_to` column present on all 3 module tables
- Assigned user visibility in findAll() confirmed working
- Assigned user edit permission confirmed working
- Assigned user submit permission confirmed working

**Office-Scoped Visibility (Campus):** STABLE (post-migration)
- `campus` column on users table present
- JWT payload includes campus
- Campus-filtered findAll() confirmed working
- Fallback to PUBLISHED + own for users without campus confirmed working

**Hierarchical CRUD:** STABLE
- Role-based CRUD matrix (SuperAdmin > Admin > Staff > Viewer) unchanged
- Rank-based approval authority unchanged
- Ownership checks correct in all 3 backend services

---

#### C. UNIVERSITY OPERATIONS MODULE — DEEP ANALYSIS

**Feature Completeness Assessment (vs COI and Repairs):**

| Feature | COI | Repairs | UniOps | Status |
|---------|-----|---------|--------|--------|
| CRUD operations | ✅ | ✅ | ✅ | Parity |
| Draft governance (create as DRAFT) | ✅ | ✅ | ✅ | Parity |
| Submit for Review button (DRAFT + REJECTED) | ✅ | ✅ | ✅ | Parity |
| Withdraw button (PENDING_REVIEW only) | ✅ | ✅ | ✅ | Parity |
| Approve / Reject buttons (Admin, PENDING_REVIEW) | ✅ | ✅ | ✅ | Parity |
| Edit button (owner or Admin) | ✅ | ✅ | ✅ | Parity |
| Publication status badges in list | ✅ | ✅ | ✅ | Parity |
| Submitter name in list (PENDING_REVIEW) | ✅ | ✅ | ✅ | Parity |
| Rejection notes in detail view | ✅ | ✅ | ✅ | Parity |
| Approval history timeline in detail | ✅ | ✅ | ✅ | Parity |
| Self-approval prevention (hide Approve for submitter) | ✅ | ✅ | ✅ | Parity |
| Campus scoping in findAll() | ✅ | ✅ | ✅ | Parity |
| **isOwner() includes assignedTo** | ❌ | ❌ | ❌ | **Shared Gap** |
| Rejection notes in list view | ❌ | ❌ | ❌ | Shared Low-priority |

**State Machine Consistency:** UniOps backend applies identical transitions to COI and Repairs:
- All 3 use `requiresStatusReset = ['PUBLISHED', 'REJECTED', 'PENDING_REVIEW']`
- All 3 clear reviewed/submitted metadata identically on reset

**Publish Rules:** Identical across all 3 modules — Admin only, PENDING_REVIEW status required, rank check applied.

---

#### D. CRITICAL GAP: `isOwner()` DOES NOT CHECK `assignedTo` — ALL 3 MODULES

**Severity:** HIGH — Frontend/Backend desync on delegation model
**Scope:** All 6 pages (3 module index pages + 3 detail pages)

**Problem:**
The backend (Phases AC + AD) permits `assigned_to` users to PATCH and submit for review. The frontend `isOwner()` check only evaluates `createdBy === authStore.user?.id`. This means:

- Assigned delegate can PATCH via API → 200 OK ✅ (backend correct)
- Assigned delegate CANNOT see the Edit button in the UI ❌ (frontend wrong)
- Assigned delegate can POST submit-for-review via API → 200 OK ✅ (backend correct)
- Assigned delegate CANNOT see the Submit for Review button ❌ (frontend wrong)

**Root cause — all 6 affected locations:**

`index.vue` — `isOwner()` function:
```typescript
// CURRENT (wrong):
function isOwner(item: UIProject): boolean {
  return item.createdBy === authStore.user?.id
}

// REQUIRED:
function isOwner(item: UIProject): boolean {
  return item.createdBy === authStore.user?.id
    || item.assignedTo === authStore.user?.id
}
```

`detail-[id].vue` — `isOwner` computed ref:
```typescript
// CURRENT (wrong):
const isOwner = computed(() => {
  return project.value?.createdBy === authStore.user?.id
})

// REQUIRED:
const isOwner = computed(() => {
  return project.value?.createdBy === authStore.user?.id
    || project.value?.assignedTo === authStore.user?.id
})
```

**Prerequisite:** `assignedTo` must be present in the UIProject interface. Checking adapters.ts — `BackendProject` does NOT currently include `assigned_to` field. `UIProject` does NOT include `assignedTo`. Both must be extended.

**Full fix scope:**
- `pmo-frontend/utils/adapters.ts` — add `assigned_to` to `BackendProject`, `assignedTo` to `UIProject`, map in `adaptProject()`
- `pmo-frontend/pages/coi/index.vue` — extend `isOwner()`
- `pmo-frontend/pages/repairs/index.vue` — extend `isOwner()`
- `pmo-frontend/pages/university-operations/index.vue` — extend `isOwner()`
- `pmo-frontend/pages/coi/detail-[id].vue` — extend `isOwner` computed
- `pmo-frontend/pages/repairs/detail-[id].vue` — extend `isOwner` computed
- `pmo-frontend/pages/university-operations/detail-[id].vue` — extend `isOwner` computed

---

#### E. STALE TEST IN PLAN SECTION 4 — ADMIN WORKFLOW

**Test A3** reads:
> A3 | Admin | Edit PENDING_REVIEW record | 400 (locked during review)

This is stale. Phase T's 400 hard-block was superseded by Phase W (auto-revert). The correct expected outcome is:
> A3 | Admin | Edit PENDING_REVIEW record | 200 + status=DRAFT (auto-revert)

This must be corrected in the plan to avoid confusion during final acceptance testing.

---

#### F. DEFERRED TECHNICAL DEBT AUDIT

| Item | Status | Risk |
|------|--------|------|
| D1 — Per-action CRUD overrides in DB | Still deferred | LOW — role-based matrix sufficient |
| D2 — JWT claim extension (rank, module_assignments) | Still deferred | LOW — auth response includes these |
| D4 — Real-time permission sync (WebSocket) | Still deferred | LOW — not a go-live requirement |
| D5 — Email notifications | Still deferred | LOW — no email service configured |
| D6 — Pending reviews badge count (real-time) | Still deferred | LOW — polling alternative feasible |
| D7 — Team-level DRAFT visibility | ✅ Resolved by Phase X + AB | CLOSED |
| Frontend UI for setting `assigned_to` on records | Still missing | MEDIUM — delegation unusable without it |
| Frontend UI for admin to set user campus | Still missing | MEDIUM — campus scoping unusable without it |

---

#### G. DEADLINE ALIGNMENT — PRIORITY CLASSIFICATION

**Critical for Go-Live:**
1. `isOwner()` fix in all 6 frontend pages (Phase AE) — delegation model is broken without it
2. Stale test A3 correction in plan
3. `assignedTo` field in adapters.ts (prerequisite for Phase AE)

**Enhancement (Ship if time allows):**
4. Frontend UI for setting `assigned_to` on a record (Phase AF)
5. Frontend UI for admin to set user `campus` (Phase AG)
6. Rejection notes in list view (all 3 modules — low UX impact)

**Post-Launch / Icebox:**
7. Email notifications (D5)
8. Real-time badge counts (D6)
9. WebSocket permission sync (D4)
10. Per-action CRUD overrides (D1)

---

#### H. RISK ANALYSIS

| Risk ID | Description | Severity | Disposition |
|---------|-------------|----------|-------------|
| RISK-076 | `isOwner()` doesn't include `assignedTo` — delegation model broken in UI | HIGH | ✅ RESOLVED by Phase AE |
| RISK-077 | Stale test A3 — may cause false failure report during acceptance testing | MEDIUM | Correct in plan |
| RISK-078 | No UI to set `assigned_to` — admins cannot delegate via UI | MEDIUM | ✅ RESOLVED by Phase AF |
| RISK-079 | No UI to set user `campus` — campus scoping is DB-only | MEDIUM | ✅ RESOLVED by Phase AG |
| RISK-080 | Rejection notes not visible in list view — UX gap, not governance risk | LOW | Icebox |
| RISK-081 | Phase W overrides Phase T but A3 test not updated — acceptance confusion | MEDIUM | Correct test matrix |

---

**END OF SECTION 1.40**

---

### 1.41 Phase AE Implementation: Frontend isOwner() Delegation Fix (Feb 2026)

**Status:** ✅ IMPLEMENTED
**Directive:** Fix frontend `isOwner()` to include `delegatedTo` check (resolves RISK-076)

---

#### A. IMPLEMENTATION SUMMARY

**Problem (RISK-076):**
Backend (Phases AC + AD) permits `assigned_to` users to edit and submit records. Frontend `isOwner()` only checked `createdBy`, so assigned delegates could not see Edit or Submit buttons despite backend accepting their actions.

**Solution:**
1. Extended all 3 backend DTO interfaces with `assigned_to?: string`
2. Extended all 3 frontend UI interfaces with `delegatedTo: string`
3. Updated all 3 adapter functions to map `delegatedTo: backend.assigned_to || ''`
4. Updated `isOwner()` in all 6 frontend pages to check both `createdBy` AND `delegatedTo`

---

#### B. NAMING DECISION

Used `delegatedTo` instead of `assignedTo` because:
- `UIRepairProject` already has `assignedTo` mapped from `assigned_technician` (technician assignment for repairs)
- `delegatedTo` clearly indicates record-level delegation/ownership transfer
- Consistent naming across all 3 module types

---

#### C. FILES CHANGED

| File | Change |
|------|--------|
| `pmo-frontend/utils/adapters.ts` | Added `assigned_to` to BackendProject, BackendUniversityOperation, BackendRepairProject; added `delegatedTo` to UIProject, UIUniversityOperation, UIRepairProject, UIRepairDetail; updated all adapter functions |
| `pmo-frontend/pages/coi/index.vue` | Extended `isOwner()` to check `delegatedTo` |
| `pmo-frontend/pages/repairs/index.vue` | Extended `isOwner()` to check `delegatedTo` |
| `pmo-frontend/pages/university-operations/index.vue` | Extended `isOwner()` to check `delegatedTo` |
| `pmo-frontend/pages/coi/detail-[id].vue` | Extended `isOwner` computed to check `delegatedTo` |
| `pmo-frontend/pages/repairs/detail-[id].vue` | Extended `isOwner` computed to check `delegatedTo` |
| `pmo-frontend/pages/university-operations/detail-[id].vue` | Extended `isOwner` computed to check `delegatedTo` |

---

#### D. VERIFICATION CRITERIA (for user testing)

| Test | Description | Expected |
|------|-------------|----------|
| AE1 | Assigned Staff sees Edit button in list | ✅ Button visible |
| AE2 | Assigned Staff sees Submit for Review button in list | ✅ Button visible |
| AE3 | Assigned Staff sees Edit button in detail page | ✅ Button visible |
| AE4 | Assigned Staff sees Submit for Review button in detail page | ✅ Button visible |
| AE5 | Non-assigned, non-owner Staff does NOT see Edit button | ✅ Button hidden |
| AE6 | Non-assigned, non-owner Staff does NOT see Submit for Review button | ✅ Button hidden |

---

**END OF SECTION 1.41**

---

### 1.42 Phase AF + AG Implementation: Delegation and Campus UI (Feb 2026)

**Status:** ✅ IMPLEMENTED
**Directive:** Add admin UI for record delegation and user campus assignment (resolves RISK-078, RISK-079)

---

#### A. PHASE AF: RECORD DELEGATION UI

**Problem (RISK-078):**
The `assigned_to` field on module records could only be set via API/SQL. Admins and record owners had no UI to delegate records.

**Solution:**
1. Added `assigned_to` field with `@IsOptional() @IsUUID()` validation to:
   - `UpdateConstructionProjectDto`
   - `UpdateRepairProjectDto`
   - `UpdateOperationDto`
2. Added "Record Delegation" card with user dropdown to all 3 edit pages
3. Dropdown populated from `/api/users` endpoint showing `first_name last_name`

**Files Changed:**
- `pmo-backend/src/construction-projects/dto/update-construction-project.dto.ts`
- `pmo-backend/src/repair-projects/dto/update-repair-project.dto.ts`
- `pmo-backend/src/university-operations/dto/update-operation.dto.ts`
- `pmo-frontend/pages/coi/edit-[id].vue`
- `pmo-frontend/pages/repairs/edit-[id].vue`
- `pmo-frontend/pages/university-operations/edit-[id].vue`

---

#### B. PHASE AG: USER CAMPUS ASSIGNMENT UI

**Problem (RISK-079):**
The `campus` field on users could only be set via API/SQL. Admins had no UI to assign a campus.

**Solution:**
1. Added campus dropdown to `users/edit-[id].vue` (Basic Info tab)
2. Added campus dropdown to `users/new.vue` (creation form)
3. Campus values per user specification:
   - "None (No campus filter)" → empty string
   - "Butuan Campus"
   - "Cabadbaran"

**Files Changed:**
- `pmo-frontend/pages/users/edit-[id].vue`
- `pmo-frontend/pages/users/new.vue`

---

#### C. VERIFICATION CRITERIA

| Test | Description | Expected |
|------|-------------|----------|
| AF1 | Owner sets assigned_to via edit form | ✅ Dropdown saves delegation |
| AF2 | Admin sets assigned_to via edit form | ✅ Dropdown saves delegation |
| AG1 | Admin sets campus on existing user | ✅ Dropdown saves campus |
| AG2 | Admin sets campus on new user | ✅ Dropdown saves campus |
| AG3 | User with campus sees filtered records | ✅ (Phase Y backend logic) |

---

**END OF SECTION 1.42**

---

### 1.43 Assignment Eligibility Gap, Office Model, and Pre-Acceptance Audit (Feb 2026)

**Status:** ✅ PHASE 1 RESEARCH COMPLETE
**Directive:** Audit assignment dropdown filtering, office-within-campus model, User Management gaps, University Operations completion status, and SOLID/DRY/KISS/YAGNI compliance.

---

#### A. ASSIGNMENT DROPDOWN ELIGIBILITY GAP

**Current behavior (Phases AF — all 3 edit pages):**

The Record Delegation dropdown fetches from:
```
GET /api/users
```

`users.service.ts findAll()` (lines 86–138) accepts: `is_active`, `search`, `role`, pagination. It does NOT accept or filter by `campus` or `module_assignments`. The `campus` column is selected in the output but is **never used in WHERE filtering**.

**Result:** The dropdown lists every active user in the system — including users with no module access, users from a different campus, and Viewer-role users who cannot edit records.

**Formal assignment eligibility rule (required, not implemented):**
```
Eligible assignee = ActiveUser
  ∧ HasModuleAccess(targetModule)
  ∧ CampusMatch(record.campus, user.campus) [if user.campus is set]
  ∧ Role ∈ {Staff, Admin, SuperAdmin}  [not Viewer]
```

**Gap:** Current UI violates all four conditions — any active user, any campus, any role (including Viewer) appears in the dropdown. Assigning a Viewer-role user would grant them delegation access to a record they cannot operate via the backend, causing silent 403 errors on all actions.

**Backend enforcement note:** The backend `update()` and `submitForReview()` use `assigned_to` equality checks but do NOT validate that the assigned user has module access. Backend enforcement of assignment eligibility is also missing.

---

#### B. MODULE-CAMPUS SCOPING FORMAL MODEL

**Current visibility chain (as-built, all three modules):**

| Layer | Mechanism | Status |
|-------|-----------|--------|
| Role gate | `@Roles('Staff', 'Admin')` on controller | ✅ |
| Module assignment | `user_module_assignments` (CONSTRUCTION/REPAIR/OPERATIONS/ALL) | ✅ Backend approval only |
| Campus scoping | `users.campus` matched against `record.campus` in `findAll()` | ✅ Phase Y |
| Delegation | `assigned_to` equality in `findAll()` WHERE clause | ✅ Phase AB |
| Assignment eligibility at set-time | Validate assignee module + campus before writing `assigned_to` | ❌ MISSING |

**`user_module_assignments` table (confirmed from schema):**
- Columns: `user_id`, `module` (ENUM: CONSTRUCTION, REPAIR, OPERATIONS, ALL)
- Used for: approval authority gating in `publish()` service method
- NOT used for: assignment eligibility validation at `update()` set-time

**Consequence of missing eligibility check:**
A user assigned to a record who lacks module access will:
1. Receive email/notification (if implemented) about the assignment — confusing
2. See the record in their list (via `assigned_to` WHERE clause) — correct
3. Attempt to edit → 403 from backend if backend ever adds module check to update()
4. Currently: No backend module check on `update()` — so an assigned Viewer can actually edit (role gate is `@Roles('Staff', 'Admin')` — Viewer is blocked by role gate, but a Staff user without module assignment would be permitted)

---

#### C. OFFICE MODEL: CAMPUS-ONLY, NO OFFICE COLUMN

**Schema audit (confirmed from auth.service.ts, users.service.ts):**

| Column | On `users` table | Notes |
|--------|-----------------|-------|
| `campus` | ✅ TEXT, nullable | Added by migration 011; free-text proxy for office |
| `office` | ❌ MISSING | Never added; no FK, no table |
| `department` | ❌ MISSING | Never added |
| `office_id` | ❌ MISSING | No offices table exists |

**Current model:** `campus` is the sole office-proxy field. It is free-text with known values: `"Butuan Campus"`, `"Cabadbaran"`, `null`.

**Impact on "office-within-campus" requirement:**
No sub-campus office model is possible without a schema change. The current model supports two offices (Butuan Campus, Cabadbaran) via the campus proxy. If sub-office scoping (e.g., VPAA Office, VPAF Office) is required, a separate `office` column or `offices` table migration would be needed. This is NOT in scope for current cycle.

**Conclusion:** Campus-as-office proxy (Phase Y) is the correct and complete implementation for the current organizational model. No further schema work is required for office scoping.

---

#### D. USER MANAGEMENT CAMPUS FILTER GAP

**Confirmed in `pmo-frontend/pages/users/index.vue`:**

Filter controls rendered in template:
1. Search text field (`search = ref('')`)
2. Status filter select (`is_active`: All / Active / Inactive)

**NOT rendered (confirmed):**
- Campus filter
- Module assignment filter
- Role filter (`roleFilter` variable exists in script but has no corresponding `v-select` in template)

**Backend `GET /api/users` accepts `role` as a query param** (lines 108–111 in users.service.ts) but there is no `campus` query param. Adding a campus filter requires:
1. Backend: Add `campus` to `QueryUserDto` and `findAll()` WHERE clause
2. Frontend: Add campus dropdown to users/index.vue filter bar

**Scope classification:** SHOULD — Admins cannot filter users by campus, making campus assignment management cumbersome for large user lists. Non-blocking for system function.

---

#### E. UNIVERSITY OPERATIONS COMPLETION STATUS

**Endpoint parity (confirmed from controller):**

University Operations controller has **19 endpoints**:
- Core CRUD + workflow: 11 (findAll, pending-review, my-drafts, findOne, create, submit-for-review, publish, reject, withdraw, update, delete)
- Indicators sub-resource: 4 (GET, POST, PATCH, DELETE)
- Financials sub-resource: 4 (GET, POST, PATCH, DELETE)

This matches or exceeds COI and Repairs feature sets. ✅ Full parity confirmed.

**Remaining steps before University Operations governance is acceptance-ready:**

| # | Phase | Description | Type |
|---|-------|-------------|------|
| 1 | **AH** | Backend eligible-users endpoint — filter by module + campus for assignment dropdown | Backend |
| 2 | **AI** | Replace unfiltered assignment dropdown in all 3 edit pages with AH endpoint | Frontend |
| 3 | **AJ** | Campus filter in User Management index page | Frontend |

**Total: 3 major steps remaining.**

After these 3 phases, the system is ready for acceptance testing. University Operations module itself requires no further code changes.

---

#### F. SOFTWARE ENGINEERING PRINCIPLES ASSESSMENT

**SOLID:**
- **S (Single Responsibility):** `PermissionResolverService` (Phase Q) ✅. Edit pages (coi/repairs/uni-ops) still fetch users directly — this could be centralized but is low-impact given 3 identical pages.
- **O (Open/Closed):** New eligibility rules require editing the `findAll()` WHERE conditions in 3 service files — acceptable given the current scope. A `VisibilityPolicy` abstraction would follow OCP but is YAGNI until a 4th module appears.
- **L (Liskov):** Not applicable — no inheritance hierarchy.
- **I (Interface Segregation):** Backend DTOs are appropriately scoped. `CreateXxxDto` and `UpdateXxxDto` are separate.
- **D (Dependency Inversion):** `PermissionResolverService` is injected — ✅. `DatabaseService` injected via NestJS DI — ✅.

**DRY:**
- ✅ Permission resolution centralized in `PermissionResolverService`
- ⚠️ Assignment dropdown code is copy-pasted in 3 edit pages with identical structure. A `useAssignmentDropdown()` composable would reduce duplication — LOW priority, YAGNI until a 4th module.
- ⚠️ `findAll()` WHERE clause logic is duplicated across 3 service files. Acceptable at current scale; a shared `VisibilityQueryBuilder` would be YAGNI.

**KISS:**
- ✅ Campus-as-office proxy avoids over-engineering (no `offices` table, no FK cascade)
- ✅ Single `assigned_to` FK column per record vs. join table — correct for one-delegate model
- ⚠️ Phase AH eligible-users endpoint should be a simple filtered GET, not a complex eligibility resolver

**YAGNI:**
- Deferred correctly: office FK, multi-delegate join table, WebSocket permission sync, per-action CRUD overrides
- Pending correctly: campus filter (AJ), eligible-users API (AH), assignment selector (AI)
- No premature abstractions detected in current codebase

**Overall assessment:** SOLID/DRY/KISS/YAGNI compliance is satisfactory for current scale. The three remaining gaps (AH, AI, AJ) are minimal and well-scoped.

---

#### G. PHASE AH ENDPOINT DESIGN

**Required:** `GET /api/users/eligible-for-assignment`

Query params:
- `module`: CONSTRUCTION | REPAIR | OPERATIONS (required)
- `campus`: string (optional — if provided, filter to matching users or users with no campus set)

**Backend logic (no implementation):**
```
SELECT u.id, u.first_name, u.last_name, u.campus
FROM users u
INNER JOIN user_module_assignments uma ON uma.user_id = u.id
  AND (uma.module = :module OR uma.module = 'ALL')
WHERE u.deleted_at IS NULL
  AND u.is_active = true
  AND u.role IN ('Staff', 'Admin', 'SuperAdmin')
  [AND (u.campus = :campus OR u.campus IS NULL) IF campus param provided]
ORDER BY u.last_name, u.first_name
```

**Access:** `@Roles('Admin', 'Staff')` — record owners need this to delegate; Viewers do not assign.

**Result shape:** `[{ id, first_name, last_name, campus }]` — same shape as current dropdown expects.

This endpoint replaces the current `GET /api/users` call in all 3 edit pages. Existing users endpoint is unchanged.

---

#### H. RISK ANALYSIS

| Risk ID | Description | Severity | Disposition |
|---------|-------------|----------|-------------|
| RISK-082 | Assignment dropdown lists ALL users — Viewers can be assigned, causing silent 403 errors | HIGH | Plan Phase AH + AI |
| RISK-083 | No backend eligibility check at assignment set-time — invalid assignees can be written to DB | MEDIUM | Plan Phase AH (validate in controller) |
| RISK-084 | User Management has no campus filter — bulk campus assignment is manual and error-prone | LOW | Plan Phase AJ |
| RISK-085 | `role` filter exists in users.service.ts but is NOT rendered in users/index.vue template | LOW | Resolve in Phase AJ (add both campus + role filters) |
| RISK-086 | Assignment dropdown copy-paste in 3 edit pages — AH endpoint change must be applied 3× | LOW | Acceptable at current scale; note in Phase AI spec |
| RISK-087 | No backend module-access check in `update()` — assigned user without module access can edit (role gate passes for Staff) | MEDIUM | Plan Phase AH (server-side validation at set-time is primary mitigation) |

---

**END OF SECTION 1.43**

---

### 1.44 Phase AK Implementation: Searchable Assignment Selector + Rename (Feb 2026)

**Status:** ✅ IMPLEMENTED
**Directive:** Replace v-select with searchable v-autocomplete; rename "Record Delegation" to "Assigned Staff/Personnel"; display assigned personnel name on detail pages.

---

#### A. IMPLEMENTATION SUMMARY

**User Request:**
1. Add search bar / input text functionality to the assignment dropdown
2. Rename the feature from "Record Delegation" to "Assigned Staff/Personnel"

**Solution:**
1. Replaced `v-select` with `v-autocomplete` in all 3 edit pages — allows typing to filter the user list
2. Renamed all labels: "Record Delegation" → "Assigned Staff/Personnel", "Assign To" → "Assigned Staff/Personnel", hint text updated
3. Added `assigned_to_name` JOIN to all 3 backend `findOne()` queries
4. Added `assigned_to_name` to adapters (BackendProject, BackendUniversityOperation, BackendRepairProject)
5. Added `delegatedToName` to UI interfaces and adapter functions
6. Added "Assigned Staff/Personnel" card to all 3 detail pages (displays when a record is assigned)

---

#### B. FILES CHANGED

**Backend (3 files):**
- `pmo-backend/src/construction-projects/construction-projects.service.ts` — added `assignee` LEFT JOIN and `assigned_to_name` to findOne() SELECT
- `pmo-backend/src/repair-projects/repair-projects.service.ts` — same
- `pmo-backend/src/university-operations/university-operations.service.ts` — same

**Frontend Adapters (1 file):**
- `pmo-frontend/utils/adapters.ts` — added `assigned_to_name` to BackendProject, BackendUniversityOperation, BackendRepairProject; added `delegatedToName` to UIProject, UIUniversityOperation, UIRepairProject, UIRepairDetail; updated all adapter functions

**Frontend Edit Pages (3 files):**
- `pmo-frontend/pages/coi/edit-[id].vue` — v-select → v-autocomplete; renamed labels
- `pmo-frontend/pages/repairs/edit-[id].vue` — same
- `pmo-frontend/pages/university-operations/edit-[id].vue` — same

**Frontend Detail Pages (3 files):**
- `pmo-frontend/pages/coi/detail-[id].vue` — added "Assigned Staff/Personnel" card (v-if delegatedToName)
- `pmo-frontend/pages/repairs/detail-[id].vue` — same
- `pmo-frontend/pages/university-operations/detail-[id].vue` — same

---

#### C. VERIFICATION CRITERIA

| Test | Description | Expected |
|------|-------------|----------|
| AK1 | Type in assignment dropdown | Filters list by first/last name |
| AK2 | Check card title on edit page | Shows "Assigned Staff/Personnel" |
| AK3 | Check dropdown label | Shows "Assigned Staff/Personnel" |
| AK4 | View detail page with assigned record | Shows assigned person's name |
| AK5 | View detail page without assignment | Card hidden (no "Assigned Staff/Personnel" section) |

---

**END OF SECTION 1.44**

---

### 1.45 Regression Analysis — Empty User Retrieval in Assignment Dropdown (Feb 2026)

**Status:** ✅ PHASE 1 RESEARCH COMPLETE
**Directive:** Diagnose empty user list in assignment dropdown; preserve search functionality; plan safe revert.

---

#### A. REGRESSION ANALYSIS — ROOT CAUSE DETERMINATION

**Observed Symptom:**
- `v-autocomplete` search bar renders correctly and input filtering works
- No users appear in the dropdown list (empty result)
- Assignment cannot be performed

**Code Under Analysis:** `findEligibleForAssignment()` in `users.service.ts` (Phase AH)

**Root Cause 1 — INNER JOIN Eliminates All Users Without Module Assignments:**

```sql
INNER JOIN user_module_assignments uma ON uma.user_id = u.id
  AND (uma.module = $1 OR uma.module = 'ALL')
```

This `INNER JOIN` requires that every user returned has an explicit record in the `user_module_assignments` table. If that table is empty or sparsely populated (which is normal in a fresh system where admins have not yet configured module assignments), the result is `[]` — an empty array for every module query.

**Root Cause 2 — Campus Value Taxonomy Mismatch:**

Record campus values (set in module edit pages):
| Module | Campus Options |
|--------|---------------|
| COI | `MAIN`, `CABADBARAN`, `BOTH` |
| Repairs | `MAIN`, `CABADBARAN`, `BOTH` |
| University Operations | `MAIN`, `CABADBARAN`, `BOTH` |

User campus values (set in users/new and users/edit, Phase AG):
| Field | Values |
|-------|--------|
| `users.campus` | `'Butuan Campus'`, `'Cabadbaran'`, NULL |

The campus filter in `findEligibleForAssignment()`:
```sql
AND (u.campus = $campus OR u.campus IS NULL)
```
A record with `campus = 'MAIN'` passes `campus = 'MAIN'` as the filter param. No user has `campus = 'MAIN'`. All users either have `campus = 'Butuan Campus'`, `campus = 'Cabadbaran'`, or NULL. The equality condition `u.campus = 'MAIN'` returns zero matches.

Combined effect: Even users with `u.campus IS NULL` would pass the second condition (`OR u.campus IS NULL`), but they are still eliminated by the INNER JOIN in Root Cause 1. If module assignments were populated, the campus mismatch would still eliminate non-NULL campus users.

**Root Cause Classification:** Over-restrictive filtering — two independent AND conditions each capable of eliminating the entire result set.

**Root Cause Summary Table:**

| Root Cause | Type | Impact |
|------------|------|--------|
| INNER JOIN on `user_module_assignments` | Over-restrictive query join | Eliminates all users if table is empty |
| Campus value mismatch (MAIN vs Butuan Campus) | Data taxonomy mismatch | Eliminates non-NULL campus users when campus param passed |
| Combined effect | Compound filtering | Result is always empty |

---

#### B. COMPONENT-LEVEL ANALYSIS

**Frontend — what still works:**
- `v-autocomplete` renders correctly
- Input text filtering (`:item-title` prop) is client-side and functional
- The component itself has no bug; the data source is empty

**Frontend — what breaks:**
- `staffUsers.value = Array.isArray(usersRes) ? usersRes : []`
- `usersRes` is `[]` from the backend; `Array.isArray([])` is `true`; `staffUsers.value` is set to `[]`
- The dropdown has no items to display or filter

**Backend — confirmed:**
- `findEligibleForAssignment()` returns `[]` due to INNER JOIN + optional campus mismatch
- `GET /api/users/eligible-for-assignment` is accessible (no auth error, no 403)
- The empty array is valid JSON — no error is thrown, so no error toast appears

**Search functionality assessment:**
- The `v-autocomplete` search bar is NOT broken
- The search architecture (client-side `:item-title` filter) is sound and must be preserved
- No changes required to search functionality

---

#### C. STABILIZATION STRATEGY

**Target behavior (formal):**

```
EligibleUsers =
  ActiveNonDeletedUsers
  ∧ Role ∈ {Staff, Admin, SuperAdmin}   [role-based gate, not module assignment]
  ∧ (IF campus param provided: u.campus = :campus OR u.campus IS NULL)
  ∧ (search filtering: client-side, v-autocomplete handles this)
```

**What changes:**
1. Replace INNER JOIN on `user_module_assignments` with a role-based WHERE condition
2. Module assignment filtering: remove as hard gate (it gates on admin-populated data that may be empty); retain conceptually as future enhancement when data is populated
3. Campus param: keep as optional filter but note the taxonomy mismatch (MAIN ≠ Butuan Campus)

**Why role-based gate is correct:**
- The `@Roles('Admin', 'Staff')` guard on the controller already enforces that only Staff and Admin callers can reach the endpoint
- Filtering the result to Staff/Admin/SuperAdmin (excluding Viewers) is achievable via role check on the users returned
- This does not require module assignments to be pre-populated

**Campus mismatch resolution approach:**
- Pass campus param only when record campus value maps to a user campus value
- Mapping table needed: `MAIN` → `Butuan Campus`, `CABADBARAN` → `Cabadbaran`, `BOTH` → no campus filter
- Until this mapping is implemented, the campus param should NOT be passed (treat as optional/deferred)

---

#### D. CAMPUS VALUE TAXONOMY GAP (RISK-088)

**Confirmed mismatch:**

| Source | Value | Used For |
|--------|-------|----------|
| Module records (`campus` field) | `MAIN`, `CABADBARAN`, `BOTH` | Record campus classification |
| Users (`campus` field) | `Butuan Campus`, `Cabadbaran`, NULL | User office assignment |

These two namespaces were designed independently and never aligned. The Phase Y backend visibility filter uses:
```sql
WHERE cp.campus = u.campus
```
This means a Staff user with `campus = 'Butuan Campus'` sees records where `campus = 'Butuan Campus'` — but records use `MAIN`, not `Butuan Campus`. Phase Y visibility is also broken by this mismatch.

This is a systemic data model gap, not a code bug. Requires a formal value alignment decision.

---

#### E. SOLID/DRY/KISS/YAGNI ASSESSMENT OF PHASE AH DESIGN

| Principle | Assessment |
|-----------|------------|
| **SOLID — Single Responsibility** | `findEligibleForAssignment()` mixed retrieval with hard eligibility gating on optional admin data — violation |
| **SOLID — Open/Closed** | Adding module assignment as INNER JOIN bakes in an assumption; should be optional filter |
| **DRY** | Module assignment check duplicates `@Roles` guard logic in a different layer |
| **KISS** | Complex INNER JOIN with AND conditions in JOIN clause — not the simplest query |
| **YAGNI** | Module assignment filtering was premature: data may not be populated; Viewer exclusion was the real goal |

**Verdict:** The Phase AH design was architecturally sound in intent but violated KISS and YAGNI by requiring admin-pre-populated data (`user_module_assignments`) as a hard precondition.

---

#### F. UNIVERSITY OPERATIONS COMPLETION STATUS

**Module itself:** ✅ Complete — 19 endpoints, full workflow, campus scoping, delegation, adapters, UI.

**Remaining blockers for acceptance:**

| # | Step | Classification | Status |
|---|------|----------------|--------|
| 1 | Fix `findEligibleForAssignment()` — restore user list | **CRITICAL** | ⬜ Pending (Phase AL) |
| 2 | Align campus value taxonomy (MAIN ↔ Butuan Campus) | **IMPORTANT** | ⬜ Pending (Phase AM) |
| 3 | Acceptance smoke test matrix execution | **CRITICAL** | ⬜ Pending |

**2 major critical steps remain before University Operations is acceptance-ready.**

(Step 2 is IMPORTANT but not CRITICAL — the system functions without perfect campus alignment; assignments still work, just without campus-narrowed filtering.)

---

#### G. RISK ANALYSIS

| Risk ID | Description | Severity | Root Cause Category |
|---------|-------------|----------|---------------------|
| RISK-088 | Campus value mismatch — records use MAIN/CABADBARAN/BOTH; users use Butuan Campus/Cabadbaran | HIGH | Data taxonomy divergence |
| RISK-089 | INNER JOIN on sparse table returns empty — module assignments not pre-populated | HIGH | Over-restrictive filtering |
| RISK-090 | Phase Y backend visibility also affected by campus mismatch — Staff may see wrong record set | HIGH | Same taxonomy gap as RISK-088 |
| RISK-091 | Deadline slippage — empty assignment dropdown blocks user delegation entirely | HIGH | Compound filtering regression |
| RISK-092 | Scope creep risk — fixing campus mismatch may expand to schema migration | MEDIUM | Address with value mapping, not schema change |
| RISK-093 | User confusion — search bar renders but no results appear; no error message | MEDIUM | Silent empty state needs fallback message |

---

**END OF SECTION 1.45**

---

## Section 1.46: Assignment Parity Gap — Create vs Edit Workflow Analysis
**Date:** 2026-02-20
**Phase:** Phase 1 Research (ACE v2.4)
**Scope:** Assignment UI/backend inconsistency between Create and Edit dialogs
**Research Objective:** Identify root cause of assignment absence in Create flow; validate correct architecture for parity

---

### A. ASSIGNMENT PARITY GAP — ROOT CAUSE

**Observed Evidence:**

**Edit Pages (all 3 modules):**
- `coi/edit-[id].vue` lines 454-472: "Assigned Staff/Personnel" card present with v-autocomplete
- `repairs/edit-[id].vue` lines 453-471: "Assigned Staff/Personnel" card present with v-autocomplete
- `university-operations/edit-[id].vue` lines 297-315: "Assigned Staff/Personnel" card present with v-autocomplete
- All 3 edit pages: fetch eligible users via `/api/users/eligible-for-assignment?module=<MODULE>&campus=<CAMPUS>`
- All 3 edit pages: include `assigned_to: '' as string` in form state (lines 48, 48, 37)
- All 3 edit pages: submit `assigned_to` in PATCH payload

**Create Pages (all 3 modules):**
- `coi/new.vue` lines 14-33: NO `assigned_to` field in form state
- `repairs/new.vue` lines 14-30: NO `assigned_to` field in form state
- `university-operations/new.vue` lines 14-24: NO `assigned_to` field in form state
- All 3 create pages: NO staffUsers ref
- All 3 create pages: NO eligible-users fetch call
- All 3 create pages: NO assignment UI card
- All 3 create pages: assigned_to NOT included in POST payload

**Backend DTOs:**
- `CreateConstructionProjectDto` (128 lines): NO `assigned_to` field
- `CreateRepairProjectDto` (120 lines): NO `assigned_to` field
- `CreateOperationDto` (55 lines): NO `assigned_to` field
- `UpdateConstructionProjectDto`: HAS `assigned_to?: string` (Phase AF)
- `UpdateRepairProjectDto`: HAS `assigned_to?: string` (Phase AF)
- `UpdateOperationDto`: HAS `assigned_to?: string` (Phase AF)

**Root Cause Classification:**

1. **Incomplete Phase AF implementation** — Phase AF (Admin UI for Record Assignment) added assignment to:
   - Update DTOs ✅
   - Edit pages ✅
   - Detail page display ✅

   But did NOT add assignment to:
   - Create DTOs ❌
   - Create/New pages ❌

2. **Architectural gap** — Assignment was implemented as a post-creation edit feature only. No inline assignment at creation time.

3. **No technical blocker** — Database schema supports `assigned_to` (Phase AA migration 010). Backend `create()` methods accept all DTO fields. The gap is purely implementation omission.

---

### B. REQUIRED GOVERNANCE MODEL FOR CREATE FLOW

**Option A: Inline Assignment During Creation** (Recommended — KISS + DRY)

**Flow:**
1. User fills Create form including assignment dropdown
2. User selects assigned staff from eligible users
3. Single POST `/api/<module>` includes `assigned_to` in payload
4. Backend creates record with `assigned_to` populated in one transaction
5. No secondary PATCH needed

**Compliance:**
- ✅ DRY: Reuses assignment service logic (eligible-users endpoint)
- ✅ SRP: Creation logic cleanly separated from assignment logic (assignment is optional field)
- ✅ KISS: Single API call, no multi-step wizard
- ✅ YAGNI: No premature complexity for "assign later" workflow

**Option B: Two-Step Create → Assign** (Anti-pattern — Rejected)

**Flow:**
1. POST record without assignment
2. Client receives new record ID
3. Client immediately calls PATCH with `assigned_to`

**Violations:**
- ❌ KISS: Unnecessary 2-step complexity
- ❌ DRY: Duplicate state management (form → record ID → patch form)
- ❌ YAGNI: Over-engineering for no user benefit

**Decision:** Option A (Inline Assignment) is the correct architecture.

---

### C. CONSISTENCY RULE

**Assignment UI must behave identically in:**
- Create dialog
- Edit dialog
- Assignment display section (detail pages)

**Required parity:**

| Component | Create | Edit | Status |
|-----------|--------|------|--------|
| "Assigned Staff/Personnel" card | ❌ Missing | ✅ Present | GAP |
| `v-autocomplete` with search | ❌ Missing | ✅ Present | GAP |
| `staffUsers` ref | ❌ Missing | ✅ Present | GAP |
| eligible-users API fetch | ❌ Missing | ✅ Present | GAP |
| Module param (`CONSTRUCTION`/`REPAIR`/`OPERATIONS`) | ❌ Missing | ✅ Present | GAP |
| Campus param (record.campus) | ❌ Missing | ✅ Present | GAP |
| `assigned_to` in form state | ❌ Missing | ✅ Present | GAP |
| `assigned_to` in submit payload | ❌ Missing | ✅ Present | GAP |

**Enforcement Rule:**

```
EffectiveVisibility =
  ModuleAccess ∧ CampusScope ∧ OfficeScope ∧
  (Owner ∨ Assigned ∨ RankAuthority)
```

No divergence permitted between Create and Edit assignment behavior.

---

### D. UNIVERSITY OPERATIONS MODULE — FEATURE PARITY MATRIX

**Comprehensive Feature Assessment:**

| Feature | COI | Repairs | Uni Ops | Gap Status |
|---------|-----|---------|---------|------------|
| Assignment UI (Edit) | ✅ | ✅ | ✅ | Complete — Phase AF |
| Assignment UI (Create) | ❌ | ❌ | ❌ | **CRITICAL GAP** |
| Draft/Review workflow | ✅ | ✅ | ✅ | Complete |
| Submit for Review | ✅ | ✅ | ✅ | Complete |
| Approve/Reject | ✅ | ✅ | ✅ | Complete |
| Withdraw | ✅ | ✅ | ✅ | Complete — Phase M |
| PENDING_REVIEW auto-revert | ✅ | ✅ | ✅ | Complete — Phase W |
| REJECTED revision flow | ✅ | ✅ | ✅ | Complete — Phase V |
| Office scoping (Phase Y) | ✅ | ✅ | ✅ | Complete |
| Campus scoping | ✅ | ✅ | ✅ | Complete |
| Campus taxonomy (Phase AM) | ✅ | ✅ | ✅ | Complete |
| Assignment visibility (Phase AB) | ✅ | ✅ | ✅ | Complete |
| Assignment edit permission (Phase AC) | ✅ | ✅ | ✅ | Complete |
| Assignment submit permission (Phase AD) | ✅ | ✅ | ✅ | Complete |
| `isOwner()` delegation fix (Phase AE) | ✅ | ✅ | ✅ | Complete |
| Detail page assignment display (Phase AK) | ✅ | ✅ | ✅ | Complete |
| Eligible-users endpoint (Phase AH) | ✅ | ✅ | ✅ | Complete |
| Eligible-users regression fix (Phase AL) | ✅ | ✅ | ✅ | Complete |

**Conclusion:** University Operations has **full feature parity** with COI and Repairs **except** for the Create flow assignment gap (which affects all 3 modules equally).

**Enhancement Opportunities:**

1. **Status tracking improvements** — Not required (existing status enum + workflow adequate)
2. **Reporting metrics alignment** — Deferred (post-launch enhancement)
3. **Deadline tracking integration** — Deferred (no hard requirement)
4. **Role-based visibility tuning** — Complete (Phase X + Y + AB)

**Structural Gaps vs COI/Repairs:** None. University Operations is architecturally aligned.

---

### E. DEADLINE ALIGNMENT

**Critical Path to University Operations Module Completion:**

**Blocking Tasks (CRITICAL):**
1. **Phase AN** — Backend Create DTO Extension (add `assigned_to` to all 3 CreateDtos)
2. **Phase AO** — Frontend Create Page Assignment Card (add assignment UI to all 3 new/create pages)

**After AN + AO:**
- Assignment parity fully restored
- All governance workflows complete
- University Operations module ready for acceptance testing
- No known blocking issues remain

**Remaining Major Critical Steps Before University Operations Completion: 2**

**Priority Classification:**

| Phase | Scope | Priority | Blocking Go-Live? |
|-------|-------|----------|-------------------|
| AN | Backend CreateDto extension | P0 CRITICAL | Yes |
| AO | Frontend Create page assignment | P0 CRITICAL | Yes |
| Acceptance smoke tests | All assignment flows | P0 CRITICAL | Yes |

**Non-Critical (Post-Launch):**
- Reporting dashboard enhancements (DEFERRED)
- Advanced metrics tracking (DEFERRED)
- Email notifications for assignments (DEFERRED)

---

### F. RISK ANALYSIS

**RISK-094: Assignment Inconsistency**
- **Severity:** HIGH
- **Description:** Edit dialog allows assignment; Create dialog does not. UX parity violated.
- **Impact:** Users must create record → navigate to edit → assign → save. Two-step workflow overhead.
- **Root Cause:** Phase AF incomplete — only Edit flow implemented.
- **Mitigation:** Phases AN + AO close the gap.

**RISK-095: Create Flow Data Integrity**
- **Severity:** MEDIUM
- **Description:** Records created without assignment require secondary edit to populate `assigned_to`.
- **Impact:** Increased user friction; workflow inefficiency.
- **Root Cause:** No inline assignment at creation time.
- **Mitigation:** Phase AO enables single-step create+assign.

**RISK-096: Duplicate Logic Risk**
- **Severity:** MEDIUM
- **Description:** If assignment logic diverges between Create and Edit, maintenance burden increases.
- **Impact:** Code drift; difficult to maintain consistency.
- **Root Cause:** Assignment implemented only in Edit flow; risk of divergence if Create flow implemented differently.
- **Mitigation:** Phase AO reuses exact assignment pattern from Edit pages (DRY compliance).

**RISK-097: University Operations Feature Drift**
- **Severity:** MEDIUM
- **Description:** Module appears complete but has hidden gap in Create flow; incomplete feature parity.
- **Impact:** User confusion; perceived feature incompleteness.
- **Root Cause:** Assignment gap not caught during University Operations delivery.
- **Mitigation:** Phases AN + AO apply uniformly to all 3 modules.

**RISK-098: Deadline Slippage**
- **Severity:** MEDIUM
- **Description:** Assignment gap discovered late; unplanned 2-phase fix may delay go-live.
- **Impact:** Deadline overrun risk.
- **Root Cause:** Assignment parity not validated during Phase AF acceptance.
- **Mitigation:** Phases AN + AO are small, focused changes (low implementation risk).

---

### G. FORMAL ARCHITECTURAL DECISION

**Assignment Creation Architecture:**

```
Inline Assignment Model (Option A):

User Input → Form State (including assigned_to) →
  Single POST /api/<module> →
    Backend create() → Database INSERT (assigned_to populated) →
      Return record → Redirect to detail page → Assignment visible immediately
```

**Rejected Architectures:**
- Two-step create → assign (violates KISS)
- Post-create hook pattern (violates YAGNI)
- Multi-stage wizard (over-engineering)

**Design Principles Applied:**
- DRY: Reuse eligible-users endpoint from Edit flow
- SRP: Assignment is optional field, not separate workflow
- KISS: Single API call, minimal UI
- YAGNI: No premature complexity

---

### H. NEXT PHASE DECLARATION

**Phase 1 Research Complete.**

**Output:**
1. Root cause: Phase AF incomplete (Edit only, not Create)
2. Correct architecture: Inline assignment during creation (Option A)
3. University Operations status: Full parity except Create assignment gap
4. Remaining critical steps: **2 (Phases AN + AO)**
5. Risk summary: 5 risks (RISK-094 through RISK-098)

**No implementation code produced. Research only.**

**Proceed to Phase 2 Plan.**

---

### 1.47 Assignment Retrieval Regression & Multi-Select Architecture (Feb 2026)

**Status:** PHASE 1 RESEARCH COMPLETE
**Trigger:** User report — Assignment dropdown shows "undefined" in University Operations and Repairs Create pages; multi-select requirement identified
**Directive:** Diagnose root cause; evaluate multi-select architecture; propose unified fix

---

#### A. ROOT CAUSE ANALYSIS — UNDEFINED ASSIGNED PERSONNEL

**Observed Behavior:**
- COI Edit page: Assignment dropdown works
- Repairs Create page: No users retrieved; assigned personnel undefined
- University Operations Create page: No users retrieved; assigned personnel undefined

**Investigation — Frontend API Call Pattern:**

| Page Type | API Call Pattern | Response Handling |
|-----------|------------------|-------------------|
| Edit pages | `api.get<{ id: string; ... }[]>(...)` | `Array.isArray(usersRes) ? usersRes : []` |
| Create pages | `api.get<{ data: { ... }[] }>(...)` | `res.data \|\| []` |

**Backend Response Analysis:**

```typescript
// pmo-backend/src/users/users.service.ts — findEligibleForAssignment()
async findEligibleForAssignment(module: string, campus?: string): Promise<any[]> {
  // ...
  return result.rows;  // Returns PLAIN ARRAY, not { data: [...] }
}
```

**Root Cause Classification: FRONTEND MAPPING BUG**

The backend returns a **plain array** `[{ id, first_name, last_name, campus }, ...]`, but Create pages (new.vue) expect a **wrapped response** `{ data: [...] }`.

```typescript
// Create pages (BROKEN):
const res = await api.get<{ data: { id: string; first_name: string; last_name: string }[] }>(...)
staffUsers.value = res.data || []  // res.data is UNDEFINED on array response!

// Edit pages (WORKING):
const usersRes = await api.get<{ id: string; ... }[]>(...)
staffUsers.value = Array.isArray(usersRes) ? usersRes : []  // Correctly handles array
```

**Why COI appears to work:**
- User likely tested COI on Edit page (which works) and Repairs/University Operations on Create pages (which fail)
- All three Create pages have the same bug

**Root Cause Taxonomy:**

| Classification | Value |
|----------------|-------|
| Type | Frontend Mapping Bug |
| Severity | HIGH |
| Scope | All 3 Create pages (coi/new.vue, repairs/new.vue, university-operations/new.vue) |
| Edit pages affected | NO — Edit pages use correct array handling |
| Backend affected | NO — Backend returns correct format |

---

#### B. MULTI-SELECT DROPDOWN REQUIREMENT ANALYSIS

**Current Schema (Migration 010):**

```sql
ALTER TABLE construction_projects  ADD COLUMN assigned_to UUID REFERENCES users(id);
ALTER TABLE repair_projects        ADD COLUMN assigned_to UUID REFERENCES users(id);
ALTER TABLE university_operations  ADD COLUMN assigned_to UUID REFERENCES users(id);
```

**Current Field Type:** Single UUID (one assignee per record)

**Multi-Select Requirement Implications:**

| Approach | Schema Change | Backend Change | Frontend Change | Complexity |
|----------|---------------|----------------|-----------------|------------|
| A. UUID Array | `assigned_to UUID[]` | Moderate | Moderate | MEDIUM |
| B. Junction Table | New `record_assignments` table | Significant | Moderate | HIGH |
| C. Keep Single (Defer) | None | None | Fix mapping only | LOW |

**Option A — UUID Array:**
```sql
ALTER TABLE construction_projects ALTER COLUMN assigned_to TYPE UUID[] USING ARRAY[assigned_to];
```
- Pros: Minimal schema change, PostgreSQL native array support
- Cons: No referential integrity on individual UUIDs; no ON DELETE CASCADE semantics

**Option B — Junction Table:**
```sql
CREATE TABLE record_assignments (
  id UUID PRIMARY KEY,
  module VARCHAR(50) NOT NULL,  -- 'CONSTRUCTION' | 'REPAIR' | 'OPERATIONS'
  record_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  UNIQUE(module, record_id, user_id)
);
```
- Pros: Full referential integrity; audit trail; cascading deletes
- Cons: Higher complexity; JOIN required for queries

**Option C — Keep Single Assignment (Recommended for Deadline):**
- Fix the frontend mapping bug first
- Defer multi-select to post-launch enhancement
- Current single-assignee model meets 80% of use cases

**Design Principles Assessment:**

| Principle | UUID Array | Junction Table | Keep Single |
|-----------|------------|----------------|-------------|
| KISS | ⚠️ Moderate | ❌ Complex | ✅ Simple |
| DRY | ⚠️ | ⚠️ | ✅ |
| YAGNI | ❌ Premature | ❌ Premature | ✅ |
| SRP | ⚠️ | ✅ | ✅ |

**Recommendation:** Option C — Fix frontend bug now; defer multi-select to DEFERRED backlog.

---

#### C. CROSS-MODULE CONSISTENCY AUDIT

**User Retrieval Endpoint Analysis:**

| Module | Create Page Call | Edit Page Call | Consistency |
|--------|------------------|----------------|-------------|
| COI | `module=construction` | `module=CONSTRUCTION` | ⚠️ Case mismatch |
| Repairs | `module=repairs` | `module=REPAIR` | ⚠️ Plural/singular mismatch |
| University Operations | `module=university-operations` | `module=OPERATIONS` | ⚠️ Key mismatch |

**Backend Impact:** The `findEligibleForAssignment()` method currently IGNORES the module parameter (Phase AL removed module filtering). The case/naming mismatches do NOT cause functional errors but violate consistency principles.

**Effective Retrieval Logic (Phase AL):**

```sql
SELECT u.id, u.first_name, u.last_name, u.campus
FROM users u
WHERE u.deleted_at IS NULL
  AND u.is_active = true
  AND EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ... WHERE r.name IN ('Staff', 'Admin', 'SuperAdmin'))
  AND (u.campus = $1 OR u.campus IS NULL)  -- Phase AM campus normalization
```

**Consistency Issues Found:**

1. **Module param naming inconsistent** — No functional impact (param ignored) but violates DRY
2. **Response handling inconsistent** — Edit pages use `Array.isArray()`, Create pages use `.data`
3. **No shared composable** — User fetching logic duplicated in 6 files

**Effective Visibility Rule (Current):**

```
Visible = ModuleAccess ∧ CampusScope ∧ (Owner ∨ Assigned)
```

Note: OfficeScope and RankAuthority not yet implemented (deferred D7, D1).

---

#### D. UNIVERSITY OPERATIONS ENHANCEMENT GAP ANALYSIS

**Feature Parity Matrix:**

| Feature | COI | Repairs | University Operations | Status |
|---------|-----|---------|----------------------|--------|
| CRUD (Create/Read/Update/Delete) | ✅ | ✅ | ✅ | PARITY |
| Draft Governance | ✅ | ✅ | ✅ | PARITY |
| Submit/Withdraw | ✅ | ✅ | ✅ | PARITY |
| Approval Workflow | ✅ | ✅ | ✅ | PARITY |
| Assignment in Edit | ✅ | ✅ | ✅ | PARITY |
| Assignment in Create | ✅* | ✅* | ✅* | BUG (all 3 broken) |
| Assignment Dropdown | ✅** | ❌ | ❌ | BUG (Edit works, Create broken) |
| Campus Scoping | ✅ | ✅ | ✅ | PARITY |
| Detail Page Attribution | ✅ | ✅ | ✅ | PARITY |
| Financial Tracking | ✅ | ✅ | ✅ | PARITY |
| Progress Tracking | ✅ | ✅ | ❌ | GAP |
| Multi-Select Assignment | ❌ | ❌ | ❌ | DEFERRED |

`*` Backend accepts; frontend mapping broken
`**` Edit page works; Create page broken

**Identified Gaps:**

1. **CRITICAL:** Assignment dropdown broken in all 3 Create pages (frontend mapping)
2. **IMPORTANT:** Progress tracking UI not present in University Operations (COI/Repairs have physical_progress)
3. **DEFERRED:** Multi-select assignment (all 3 modules)
4. **DEFERRED:** Office-scoped rank visibility (Phase Y enhancement)

---

#### E. DEADLINE ALIGNMENT — CRITICAL PATH ASSESSMENT

**Remaining Critical Steps Before Go-Live:**

| # | Phase | Description | Severity | Est. Scope |
|---|-------|-------------|----------|------------|
| 1 | **AP** | Fix frontend response mapping in all 3 Create pages | CRITICAL | 3 files |
| 2 | **AQ** | Standardize module param naming (consistency) | IMPORTANT | 6 files |
| 3 | **AR** | Create shared useEligibleUsers composable | IMPORTANT | 1 new file + 6 updates |

**Deferred to Post-Launch:**

| # | Item | Description | Priority |
|---|------|-------------|----------|
| D8 | Multi-select assignment | UUID array or junction table | LOW |
| D9 | Progress tracking in UO | Add physical_progress field | MEDIUM |
| D10 | Shared assignment component | Extract v-autocomplete to component | LOW |

**Critical Step Count: 1 (Phase AP)**

Phase AQ and AR are IMPORTANT but not blocking go-live. The single critical fix is the frontend response mapping.

---

#### F. RISK ANALYSIS

**RISK-099: Frontend Response Mapping Regression**
- **Severity:** HIGH
- **Description:** All 3 Create pages fail to display eligible users due to incorrect response unwrapping
- **Impact:** Assignment feature non-functional in Create flow across all modules
- **Root Cause:** Phase AO implementation used `res.data` but backend returns plain array
- **Mitigation:** Phase AP — Align Create page handling with Edit page pattern

**RISK-100: Module Param Inconsistency**
- **Severity:** LOW
- **Description:** Module param values differ between Create and Edit pages (case, plural/singular)
- **Impact:** No functional impact (param ignored) but technical debt
- **Root Cause:** Inconsistent implementation across phases
- **Mitigation:** Phase AQ — Standardize all calls to uppercase enum values

**RISK-101: Multi-Select Scope Creep Risk**
- **Severity:** MEDIUM
- **Description:** User requests multi-select; implementing now risks deadline
- **Impact:** Potential deadline slippage if scope expands
- **Root Cause:** User expectation vs. current single-assign design
- **Mitigation:** Defer to D8 (post-launch); document in plan as enhancement

**RISK-102: Duplicated User Fetch Logic**
- **Severity:** LOW
- **Description:** User fetching duplicated in 6 files; maintenance burden
- **Impact:** Future bugs may require 6-file fixes
- **Root Cause:** No shared composable for eligible user fetching
- **Mitigation:** Phase AR — Extract to useEligibleUsers composable (IMPORTANT, not CRITICAL)

**RISK-103: Progress Tracking Gap in University Operations**
- **Severity:** MEDIUM
- **Description:** University Operations lacks progress tracking present in COI/Repairs
- **Impact:** Feature inconsistency; user confusion
- **Root Cause:** Schema difference — UO has no physical_progress column
- **Mitigation:** Defer to D9 (post-launch enhancement)

---

#### G. UNIFIED ASSIGNMENT ARCHITECTURE

**Current Architecture (Post-Phase AO, with bug):**

```
Create Flow (BROKEN):
  Campus Selected → watch() triggers →
    api.get('/api/users/eligible-for-assignment?module=X&campus=Y') →
      Backend returns: [{ id, first_name, last_name, campus }, ...]
        Frontend expects: { data: [...] }
          res.data → undefined → staffUsers = []
```

**Corrected Architecture (Phase AP):**

```
Create Flow (FIXED):
  Campus Selected → watch() triggers →
    api.get('/api/users/eligible-for-assignment?module=X&campus=Y') →
      Backend returns: [{ id, first_name, last_name, campus }, ...]
        Frontend receives: [...]
          Array.isArray(res) ? res : [] → staffUsers = [...]
```

**Shared Pattern (All 6 Pages):**

```typescript
// Correct response handling for findEligibleForAssignment endpoint
const usersRes = await api.get<{ id: string; first_name: string; last_name: string }[]>(
  `/api/users/eligible-for-assignment?module=${MODULE}&campus=${campus}`
)
staffUsers.value = Array.isArray(usersRes) ? usersRes : []
```

---

#### H. NEXT PHASE DECLARATION

**Phase 1 Research Complete.**

**Summary:**

| Finding | Classification |
|---------|----------------|
| Root Cause | Frontend Mapping Bug — Create pages expect `{ data: [...] }` but receive `[...]` |
| Affected Pages | All 3 Create pages (coi/new.vue, repairs/new.vue, university-operations/new.vue) |
| Edit Pages | NOT affected — use correct `Array.isArray()` pattern |
| Backend | NOT affected — returns correct format |
| Multi-Select | DEFERRED — Current single-assign meets 80% of use cases |

**Remaining Critical Steps: 1**

| Phase | Description | Severity |
|-------|-------------|----------|
| AP | Fix frontend response mapping in Create pages | CRITICAL |

**Important (Non-Blocking) Steps: 2**

| Phase | Description | Severity |
|-------|-------------|----------|
| AQ | Standardize module param naming | IMPORTANT |
| AR | Create shared useEligibleUsers composable | IMPORTANT |

**Deferred to Post-Launch: 3**

| ID | Description |
|----|-------------|
| D8 | Multi-select assignment architecture |
| D9 | Progress tracking in University Operations |
| D10 | Shared assignment UI component |

**Risk Summary: 5 new risks (RISK-099 through RISK-103)**

**No implementation code produced. Research only.**

**Proceed to Phase 2 Plan.**

---

### 1.48 Assignment Display Regression — Deep Codebase Analysis (Feb 2026)

**Status:** PHASE 1 RESEARCH COMPLETE
**Trigger:** User report — Phase AP fix did NOT resolve assignment issues; "undefined undefined" persists in Repairs & University Operations; no users retrieved
**Directive:** Deep codebase investigation; identify actual root causes; propose corrective phases

---

#### A. ISSUE 1: "undefined undefined" DISPLAY IN LIST VIEWS

**Observed Behavior:**
- Repairs index page: Assigned personnel displays as "undefined undefined"
- University Operations index page: Same "undefined undefined" display
- COI index page: Not displaying assignment info (no column rendered)

**Root Cause: Missing `assigned_to_name` JOIN in `findAll()` Queries**

**Repairs Module — `pmo-backend/src/repair-projects/repair-projects.service.ts`:**
```typescript
// Lines 147-162: findAll() query
// MISSING: LEFT JOIN users assignee ON rp.assigned_to = assignee.id
// MISSING: SELECT assignee.first_name || ' ' || assignee.last_name AS assigned_to_name
```

The `findAll()` method only joins:
- `repair_types` table for type name
- `users` table for `submitted_by_name` (submitter)

It does NOT join the users table for the `assigned_to` relationship.

**University Operations Module — `pmo-backend/src/university-operations/university-operations.service.ts`:**
```typescript
// Lines 124-135: findAll() query
// Same issue — only joins submitter, not assignee
```

**Working Reference — `findOne()` detail views:**
All three modules' `findOne()` methods DO include the correct JOIN:
```sql
LEFT JOIN users assignee ON rp.assigned_to = assignee.id
SELECT assignee.first_name || ' ' || assignee.last_name AS assigned_to_name
```

**Adapter Expectation — `pmo-frontend/utils/adapters.ts`:**
- Lines 527-529 (Repairs): `delegatedToName: backend.assigned_to_name || ''`
- Lines 409-411 (UO): `delegatedToName: backend.assigned_to_name || ''`
- Lines 140-141 (COI): `delegatedToName: backend.assigned_to_name || ''`

When `assigned_to_name` is NULL (missing JOIN), the adapter returns empty string, but if the frontend tried to access `first_name` and `last_name` separately from a non-existent user object, it would show "undefined undefined".

**Root Cause Classification:**

| Classification | Value |
|----------------|-------|
| Type | Backend Query Bug |
| Severity | HIGH |
| Scope | findAll() in Repairs + University Operations services |
| findOne() affected | NO — detail views have correct JOIN |
| Frontend affected | NO — adapters handle NULL correctly |

---

#### B. ISSUE 2: NO USERS RETRIEVED FOR ELIGIBLE-FOR-ASSIGNMENT

**Observed Behavior:**
- COI Create page: May retrieve users (campus-dependent)
- Repairs Create page: No users in dropdown
- University Operations Create page: No users in dropdown

**Backend Query Analysis — `pmo-backend/src/users/users.service.ts:164-194`:**

```typescript
async findEligibleForAssignment(module: string, campus?: string): Promise<any[]> {
  const normalizedCampus = this.normalizeRecordCampusToUserCampus(campus);
  // ...
  // CRITICAL: The `module` parameter is ACCEPTED but NEVER USED in the query
  // ...
  return result.rows;
}
```

**Query Filters Applied:**
1. `deleted_at IS NULL` — Correct
2. `is_active = true` — Correct
3. Roles containing Staff, Admin, or SuperAdmin — Correct
4. Optional campus filter with normalization — Correct

**Campus Normalization Logic — Lines 150-155:**
```typescript
private normalizeRecordCampusToUserCampus(recordCampus?: string): string | null {
  if (recordCampus === 'MAIN') return 'Butuan Campus';
  if (recordCampus === 'CABADBARAN') return 'Cabadbaran';
  return null; // BOTH or undefined = no campus filter
}
```

**Why No Users May Be Returned:**

1. **Empty Users Table:** No Staff/Admin users exist with matching campus
2. **All Users Inactive:** `is_active = false` for all users
3. **Role Assignment Missing:** No users have Staff/Admin/SuperAdmin roles
4. **Campus Mismatch:** User campus values don't match normalized values

**Module Parameter Gap:**
The `module` parameter is accepted but IGNORED. This is documented in Phase AL as intentional — module filtering was removed because `user_module_assignments` table is sparsely populated and INNER JOIN eliminated all users.

**Likely Cause for User Report:**
If no users are returned, it's most likely a **data issue** (no active Staff users with matching campus), not a code bug. The Phase AP fix for response mapping IS correct.

**Verification Query:**
```sql
SELECT u.id, u.first_name, u.last_name, u.campus, u.is_active
FROM users u
WHERE u.deleted_at IS NULL AND u.is_active = true
  AND EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
              WHERE ur.user_id = u.id AND r.name IN ('Staff', 'Admin', 'SuperAdmin'));
```

---

#### C. ISSUE 3: MULTI-SELECT ONLY ALLOWS SINGLE SELECTION

**Observed Behavior:**
- v-autocomplete allows only single selection
- User expects multi-select capability

**Root Cause: Schema Design — Single UUID, Not Array**

**Migration 010 — `database/migrations/010_add_record_assignment.sql`:**
```sql
ALTER TABLE construction_projects ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id);
ALTER TABLE repair_projects ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id);
ALTER TABLE university_operations ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id);
```

**Schema Type:** Single `UUID` with foreign key constraint
**Not:** `UUID[]` array or junction table

**Design Intent:**
The schema implements **single assignment** (one assignee per record). This is documented in research.md Section 1.38.B as the selected approach:

> "The common use case is assigning one collaborator/delegate per record. Single FK preserves referential integrity. Performant: simple equality JOIN. Can be migrated to a join table if multi-delegate is required in a future phase."

**DTO Confirmation — All Services:**
- `assigned_to?: string` (single value, not array)
- `delegatedTo: string` (single value in adapters)

**Multi-Select Would Require:**
1. Schema migration: UUID → UUID[] or new junction table
2. Backend service changes: Handle array inserts/updates
3. Frontend changes: v-autocomplete `multiple` prop + array state

**Status:** DEFERRED (D8) — Single assignment meets current requirements.

---

#### D. CORRECTIVE ACTION MATRIX

| Issue | Root Cause | Fix Phase | Severity |
|-------|-----------|-----------|----------|
| "undefined undefined" in list views | Missing assignee JOIN in findAll() | **Phase AS** | HIGH |
| No users retrieved | Data issue (no active Staff) OR campus mismatch | **Verify Data** | MEDIUM |
| Single selection only | Schema design (UUID not UUID[]) | DEFERRED D8 | LOW |

---

#### E. PHASE AS: ADD ASSIGNED_TO_NAME JOIN TO findAll()

**Scope:** Backend — 2 service files

**File 1: `pmo-backend/src/repair-projects/repair-projects.service.ts`**

Current `findAll()` query (lines 147-162):
```sql
SELECT rp.*, rt.name AS repair_type_name,
       submitter.first_name || ' ' || submitter.last_name AS submitted_by_name
FROM repair_projects rp
LEFT JOIN repair_types rt ON rp.repair_type_id = rt.id
LEFT JOIN users submitter ON rp.submitted_by = submitter.id
...
```

Required addition:
```sql
LEFT JOIN users assignee ON rp.assigned_to = assignee.id
SELECT assignee.first_name || ' ' || assignee.last_name AS assigned_to_name
```

**File 2: `pmo-backend/src/university-operations/university-operations.service.ts`**

Same pattern — add assignee JOIN to `findAll()`.

---

#### F. RISK ANALYSIS

**RISK-104: Missing Assignee JOIN in List Queries**
- **Severity:** HIGH
- **Description:** findAll() in Repairs and UO lacks assigned_to_name JOIN
- **Impact:** List views cannot display assignee name; shows undefined
- **Root Cause:** Phase AK only added JOIN to findOne(), not findAll()
- **Mitigation:** Phase AS — Add LEFT JOIN users assignee to both services

**RISK-105: Empty Eligible Users Due to Data State**
- **Severity:** MEDIUM
- **Description:** No Staff/Admin users with matching campus in database
- **Impact:** Assignment dropdown appears empty
- **Root Cause:** Data issue, not code bug
- **Mitigation:** Verify user data exists; create test users if needed

---

#### G. CONCLUSION

**Primary Root Cause Identified:**

The "undefined undefined" display is caused by **missing `assigned_to_name` JOIN in `findAll()` queries**, not the frontend response mapping.

Phase AP (response mapping fix) was correct for the Create page flow, but the issue being reported is in the **list views** where the backend query doesn't include the assignee name.

**No Users Retrieved:**

If Phase AP was implemented correctly, the likely cause is:
1. No active Staff users exist in the database
2. User campus values don't match expected normalized values
3. Data state issue, not code bug

**Multi-Select:**

By design — schema uses single UUID. Deferred to D8.

**Next Phase:** AS — Add assignee JOIN to findAll() in both Repairs and University Operations services.

---

### 1.49 Assignment Architecture Deep Analysis — Mandatory Reset (Feb 2026)

**Status:** PHASE 1 RESEARCH COMPLETE
**Trigger:** Second failed fix attempt; user reports multi-select, undefined display, campus drift persist
**Directive:** Deep structural analysis; no blind patches; identify all root causes

---

#### A. MULTI-SELECT FAILURE ROOT CAUSE

**Classification: SCHEMA DESIGN (End-to-End)**

**1. Database Schema (Migration 010):**
```sql
ALTER TABLE construction_projects ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id);
ALTER TABLE repair_projects ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id);
ALTER TABLE university_operations ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id);
```

- Column type: `UUID` (single scalar value)
- Foreign key: Single reference to users.id
- **NO junction table exists for many-to-many**
- **NO UUID[] array type**

**2. Backend DTO Validation:**
```typescript
// All three modules use identical pattern:
@IsOptional()
@IsUUID()
assigned_to?: string;  // Single value, not array
```

- `@IsUUID()` validates single UUID string
- No `@IsArray()` decorator
- Type is `string`, not `string[]`

**3. Service Layer Logic:**
```typescript
// INSERT/UPDATE use single value:
dto.assigned_to || null  // Replaces, does not merge
```

- Single value INSERT/UPDATE
- No array handling logic
- Replace semantics, not append

**4. Frontend Type Definitions:**
```typescript
// adapters.ts
assigned_to?: string        // Backend interface
delegatedTo: string         // Frontend interface (single string)
```

**5. Frontend Component:**
```vue
<v-autocomplete
  v-model="form.assigned_to"  <!-- Single value binding -->
  <!-- NO 'multiple' prop -->
/>
```

**Root Cause Chain:**
| Layer | Issue | Classification |
|-------|-------|----------------|
| Database | UUID column (not UUID[] or junction) | SCHEMA DESIGN |
| DTO | @IsUUID() single value | SCHEMA DESIGN |
| Service | Replace logic, not merge | SCHEMA DESIGN |
| Frontend | string type, no multiple prop | SCHEMA DESIGN |

**Verdict:** System is architecturally designed for single assignment. Multi-select requires full-stack schema migration.

---

#### B. "UNDEFINED UNDEFINED" ISSUE ROOT CAUSE

**Classification: DATA QUALITY + DISPLAY EDGE CASE**

**Backend Query Analysis (Post-Phase AS):**

All three services now include correct JOINs in `findAll()`:
```sql
LEFT JOIN users assignee ON rp.assigned_to = assignee.id
SELECT assignee.first_name || ' ' || assignee.last_name as assigned_to_name
```

**Why "undefined undefined" Still Appears:**

1. **Null Concatenation:** If `assigned_to` references a deleted user or NULL values:
   - PostgreSQL: `NULL || ' ' || NULL = NULL`
   - Adapter: `backend.assigned_to_name || ''` = `''`
   - Frontend: Should NOT display (v-if guard)

2. **JavaScript Template Issue:** If v-autocomplete displays selected value when staffUsers is empty:
   ```typescript
   :item-title="(item: any) => `${item.last_name}, ${item.first_name}`"
   ```
   - If `item` is the raw UUID string (not object), accessing `.last_name` and `.first_name` returns `undefined`
   - Template renders: `"undefined, undefined"`

3. **Stale Selection Display:** When `form.assigned_to` has a UUID but staffUsers doesn't contain matching user:
   - v-autocomplete tries to render selected value using item-title function
   - Passes string UUID to function expecting object
   - Results in "undefined undefined"

**Root Cause:** When staffUsers array is empty OR doesn't contain the selected user ID, v-autocomplete's `:item-title` function receives wrong input type.

---

#### C. CAMPUS FILTER DRIFT ROOT CAUSE

**Classification: FRONTEND STATE MANAGEMENT + RACE CONDITION**

**1. Frontend Watcher Analysis (repairs/new.vue, university-operations/new.vue):**
```typescript
watch(
  () => form.value.campus,
  async (newCampus) => {
    if (newCampus) {
      // PROBLEM 1: staffUsers NOT cleared before fetch
      const res = await api.get(`...?campus=${newCampus}`)
      staffUsers.value = Array.isArray(res) ? res : []
    }
  },
  { immediate: false }
)
```

**Issue 1: No Pre-Fetch Clear**
- When campus changes MAIN → CABADBARAN
- Old MAIN data persists in `staffUsers` during fetch
- User sees stale data for ~200ms until new fetch completes

**Issue 2: Race Condition**
- Rapid campus switching: MAIN → CABADBARAN → MAIN
- Multiple in-flight requests
- Later response can arrive before earlier one
- Wrong campus data displayed

**2. Backend Normalization (users.service.ts:150-155):**
```typescript
private normalizeRecordCampusToUserCampus(recordCampus?: string): string | null {
  if (recordCampus === 'MAIN') return 'Butuan Campus';
  if (recordCampus === 'CABADBARAN') return 'Cabadbaran';
  return null;  // BOTH or invalid = no filter
}
```

**Backend is CORRECT** — normalizes MAIN → Butuan Campus, CABADBARAN → Cabadbaran.

**Root Cause Chain:**
| Issue | Location | Impact |
|-------|----------|--------|
| No pre-fetch clear | Frontend watcher | Stale data flashes |
| Race condition | Frontend async | Out-of-order responses |
| No AbortController | Frontend | Pending requests not cancelled |

---

#### D. CAMPUS-RESTRICTED ASSIGNMENT — REMOVAL ANALYSIS

**Current Implementation:**
```typescript
// Frontend: Sends campus param
api.get(`/api/users/eligible-for-assignment?module=REPAIR&campus=${newCampus}`)

// Backend: Filters by campus
if (normalizedCampus) {
  campusClause = `AND (u.campus = $${paramIndex++} OR u.campus IS NULL)`;
}
```

**New Requirement:**
- Remove campus restriction entirely
- Allow global searchable assignment across all campuses
- Assignment ≠ Visibility (visibility enforced by backend rules)

**Impact Assessment:**

| Change | Risk | Mitigation |
|--------|------|------------|
| Remove campus filter | Users see all staff | Assignment doesn't grant access |
| Global search | Larger dropdown list | Use searchable v-autocomplete |
| Cross-campus assignment | None (visibility unchanged) | Backend enforcement remains |

**Visibility Rule Remains:**
```
Visible = ModuleAccess ∧ CampusScope ∧ (Owner ∨ Assigned)
```

Assignment only affects `Assigned` flag — does NOT override `CampusScope` or `ModuleAccess`.

**Safe to Remove:** Campus filter removal does NOT break visibility enforcement.

---

#### E. REQUIRED MULTI-SELECT ARCHITECTURE

**Correct Design — Many-to-Many:**

**1. Database Schema (New Migration):**
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
```

**2. Backend DTO:**
```typescript
@IsOptional()
@IsArray()
@IsUUID('4', { each: true })
assigned_user_ids?: string[];
```

**3. Backend Service:**
```typescript
// Replace all assignments for record
async updateAssignments(module: string, recordId: string, userIds: string[]): Promise<void> {
  await this.db.query(`DELETE FROM record_assignments WHERE module = $1 AND record_id = $2`, [module, recordId]);
  for (const userId of userIds) {
    await this.db.query(`INSERT INTO record_assignments (module, record_id, user_id) VALUES ($1, $2, $3)`, [module, recordId, userId]);
  }
}
```

**4. Frontend:**
```vue
<v-autocomplete
  v-model="form.assigned_user_ids"
  :items="staffUsers"
  :item-title="(u) => `${u.last_name}, ${u.first_name}`"
  item-value="id"
  multiple
  chips
  closable-chips
  clearable
/>
```

**5. Deselection:**
- `clearable` prop allows clearing all
- `closable-chips` allows removing individual selections
- Empty array `[]` clears all assignments

---

#### F. CROSS-MODULE DIVERGENCE ANALYSIS

**Query Pattern Comparison:**

| Module | findAll() JOIN | findOne() JOIN | assigned_to_name | Status |
|--------|---------------|----------------|------------------|--------|
| Construction Projects | ✅ Has JOIN | ✅ Has JOIN | ✅ Returned | CONSISTENT |
| Repair Projects | ✅ Has JOIN | ✅ Has JOIN | ✅ Returned | CONSISTENT |
| University Operations | ✅ Has JOIN | ✅ Has JOIN | ✅ Returned | CONSISTENT |

**DTO Comparison:**

| Module | Create DTO | Update DTO | Type | Status |
|--------|-----------|-----------|------|--------|
| Construction Projects | assigned_to?: string | assigned_to?: string | @IsUUID() | CONSISTENT |
| Repair Projects | assigned_to?: string | assigned_to?: string | @IsUUID() | CONSISTENT |
| University Operations | assigned_to?: string | assigned_to?: string | @IsUUID() | CONSISTENT |

**Service Logic Comparison:**

| Module | INSERT | UPDATE | Status |
|--------|--------|--------|--------|
| Construction Projects | Single UUID | Single UUID | CONSISTENT |
| Repair Projects | Single UUID | Single UUID | CONSISTENT |
| University Operations | Single UUID | Single UUID | CONSISTENT |

**Divergence:** None — all modules use identical patterns. The "undefined undefined" issue is NOT caused by module divergence.

---

#### G. UNIVERSITY OPERATIONS MODULE REVIEW

**1. Assignment Logic Consistency:** ✅ Identical to COI/Repairs
**2. Draft/Review Integrity:** ✅ Uses same state machine
**3. Office/Campus Enforcement:** ✅ Same visibility rules
**4. CRUD Hierarchy Stability:** ✅ Same permission checks
**5. Performance Impact:** ⚠️ Additional JOIN in findAll() (minimal overhead)

**Enhancement Gaps:**

| Gap | Description | Priority |
|-----|-------------|----------|
| Multi-select | Cannot assign multiple users | CRITICAL (D8) |
| Progress tracking | No physical_progress field | DEFERRED (D9) |
| Assignment display | No column in index table | LOW |

---

#### H. RISK ANALYSIS

**RISK-106: Multi-Select Schema Migration**
- **Severity:** HIGH
- **Description:** Migrating UUID to junction table requires data migration
- **Impact:** Existing assigned_to values must be migrated to junction table
- **Mitigation:** Migration script to copy existing assignments

**RISK-107: Assignment Overwrite**
- **Severity:** MEDIUM
- **Description:** Current replace logic overwrites previous selection
- **Impact:** With multi-select, must use replace-all semantics
- **Mitigation:** DELETE + INSERT pattern in service

**RISK-108: Cross-Campus Exposure**
- **Severity:** LOW
- **Description:** Removing campus filter shows all staff
- **Impact:** None — assignment doesn't grant visibility
- **Mitigation:** Backend enforcement unchanged

**RISK-109: Stale State Display**
- **Severity:** MEDIUM
- **Description:** Race conditions cause wrong data display
- **Impact:** User confusion during rapid campus switching
- **Mitigation:** AbortController + pre-fetch clear

**RISK-110: Deadline Slippage**
- **Severity:** HIGH
- **Description:** Multi-select requires schema + service + DTO + frontend changes
- **Impact:** Significant development effort
- **Mitigation:** Phased implementation; single-select fallback

---

#### I. ROOT CAUSE CLASSIFICATION SUMMARY

| Issue | Root Cause | Classification |
|-------|-----------|----------------|
| Single selection only | UUID column, not junction table | **SCHEMA DESIGN** |
| "undefined undefined" | v-autocomplete item-title on wrong type | **FRONTEND EDGE CASE** |
| Campus dropdown drift | No pre-fetch clear + race condition | **FRONTEND STATE** |
| Stale data on switch | Multiple in-flight requests | **ASYNC RACE CONDITION** |

---

#### J. UNIFIED ASSIGNMENT ARCHITECTURE BLUEPRINT

**Current (Single Assignment):**
```
Record.assigned_to (UUID) → Users.id
  ↓
Single user per record
```

**Target (Multi Assignment):**
```
Record ← record_assignments → Users
  ↓           ↓                ↓
record_id   user_id          Multiple users per record
```

**Visibility Model (Unchanged):**
```
Visible = ModuleAccess ∧ CampusScope ∧ (Owner ∨ Assigned)
```

**Assignment Model (Changed):**
```
Assigned = EXISTS(SELECT 1 FROM record_assignments WHERE record_id = $1 AND user_id = $2)
```

---

#### K. REMAINING CRITICAL STEPS

| # | Phase | Description | Severity | Scope |
|---|-------|-------------|----------|-------|
| 1 | **AT** | Create junction table migration | CRITICAL | 1 file |
| 2 | **AU** | Backend DTO + Service refactor | CRITICAL | 6 files |
| 3 | **AV** | Remove campus filter from assignment | CRITICAL | 4 files |
| 4 | **AW** | Frontend multi-select + deselection | CRITICAL | 6 files |
| 5 | **AX** | Fix v-autocomplete item-title edge case | IMPORTANT | 6 files |
| 6 | **AY** | Add AbortController for race conditions | IMPORTANT | 6 files |
| 7 | **AZ** | Regression test matrix | MUST | Manual |

**Critical Step Count Before UO Completion: 7**

---

#### L. NO IMPLEMENTATION CODE PRODUCED

This section contains research findings only. Implementation deferred to Phase 2 Plan.

---

### 1.50 Schema Drift Critical Failure — record_assignments Table Missing (Feb 2026)

**Status:** ✅ PHASE 1 RESEARCH COMPLETE
**Severity:** CRITICAL — 500 Internal Server Error on all module list endpoints
**Error:** `relation "record_assignments" does not exist`
**Triggered In:** `ConstructionProjectsService.findAll()`, `RepairProjectsService.findAll()`, `UniversityOperationsService.findAll()`

---

#### A. ROOT CAUSE CLASSIFICATION

**PRIMARY CAUSE: Migration Not Executed**

The migration file `012_add_record_assignments_table.sql` was created but:
1. **Never committed to git** — file is untracked
2. **Never executed against the database** — table does not exist

**SECONDARY FINDING: Migration Drift (006-012)**

All recent migrations are untracked in git:
```
?? database/migrations/006_add_user_permission_overrides.sql
?? database/migrations/007_add_draft_governance.sql
?? database/migrations/008_add_rank_system.sql
?? database/migrations/009_add_module_assignments.sql
?? database/migrations/010_add_record_assignment.sql
?? database/migrations/011_add_user_campus.sql
?? database/migrations/012_add_record_assignments_table.sql
```

**Cause Classification:** ❌ Migration not executed

| Possible Cause | Applies? | Evidence |
|---------------|----------|----------|
| Migration not executed | ✅ YES | File untracked in git |
| Table in different schema | ❌ NO | Migration uses public schema |
| Table name mismatch | ❌ NO | Services use `record_assignments`, migration creates same |
| Naming convention mismatch | ❌ NO | Consistent snake_case |
| ORM auto-generate expected | ❌ NO | Raw SQL queries used |

---

#### B. MIGRATION ANALYSIS

**Migration 012 (Multi-Select - Current):**
```sql
CREATE TABLE IF NOT EXISTS record_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module VARCHAR(50) NOT NULL CHECK (module IN ('CONSTRUCTION', 'REPAIR', 'OPERATIONS')),
  record_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(module, record_id, user_id)
);
```
- **Purpose:** Many-to-many assignment (Phase AT)
- **Status:** Created but untracked/unexecuted
- **Design:** ✅ Idempotent (`CREATE TABLE IF NOT EXISTS`)
- **Naming:** ✅ Consistent snake_case

---

#### C. ORM RELATION CONFIGURATION

**Finding: No TypeORM Entities Used**

This project uses raw SQL queries via `DatabaseService`, not TypeORM entities.
Table MUST be created via manual migration execution.

---

#### D. ARCHITECTURAL ALIGNMENT CHECK

**Intended Design: Global Table with Module Discriminator**

```
record_assignments
├── id (UUID PK)
├── module ('CONSTRUCTION' | 'REPAIR' | 'OPERATIONS')
├── record_id (UUID)
├── user_id (UUID FK → users)
├── assigned_at (TIMESTAMPTZ)
├── assigned_by (UUID FK → users)
└── UNIQUE(module, record_id, user_id)
```

**Cross-Module Query Pattern (All Consistent):**

| Operation | Query Pattern |
|-----------|---------------|
| Clear assignments | `DELETE FROM record_assignments WHERE module = '{M}' AND record_id = $1` |
| Add assignment | `INSERT INTO record_assignments (module, record_id, user_id) VALUES (...)` |
| Check assignment | `EXISTS (SELECT 1 FROM record_assignments WHERE ...)` |
| Return assigned users | `json_agg(json_build_object(...))` subquery |

---

#### E. SCHEMA DRIFT RISK ANALYSIS

| Risk | Severity | Status |
|------|----------|--------|
| Migration 012 not executed | CRITICAL | ✅ CONFIRMED |
| 500 error on all list endpoints | CRITICAL | ✅ CONFIRMED |
| Data loss on migration | LOW | INSERT-only with ON CONFLICT |

---

#### F. UNIVERSITY OPERATIONS IMPACT

**All Modules Affected Equally:**

| Module | Uses record_assignments | Status |
|--------|------------------------|--------|
| Construction Projects | ✅ Yes | 500 Error |
| Repair Projects | ✅ Yes | 500 Error |
| University Operations | ✅ Yes | 500 Error |

**Fix is Universal:** Executing migration 012 fixes ALL modules.

---

#### G. ROOT CAUSE SUMMARY

Migration file `012_add_record_assignments_table.sql` exists but was never:
1. Committed to git
2. Executed against the database

**Resolution:** Execute migration to create table.

---

### 1.51 CRITICAL: assigned_user_ids Column Schema Mismatch (Feb 2026)

**Status:** 🔴 PHASE 1 RESEARCH COMPLETE — CRITICAL ARCHITECTURE BUG
**Error:** `column "assigned_user_ids" of relation "construction_projects" does not exist`
**Trigger:** `PATCH /api/construction-projects/:id` → 500 Internal Server Error
**Root Cause:** DTO field incorrectly included in SQL UPDATE query

---

#### A. ASSIGNMENT MODEL INTENT

**Competing Models Analysis:**

| Model | Implementation | Status |
|-------|---------------|--------|
| MODEL A: Array Column (`assigned_user_ids UUID[]`) | Column in table | ❌ NEVER IMPLEMENTED |
| MODEL B: Join Table (`record_assignments`) | Junction table with FK | ✅ **PRODUCTION** |

**Architectural Decision:** The system uses **MODEL B (Join Table)** — the correct scalable relational model.

**Evidence:**

1. **Junction Table Exists:**
   ```sql
   record_assignments (
     id UUID,
     module VARCHAR(50) CHECK (module IN ('CONSTRUCTION', 'REPAIR', 'OPERATIONS')),
     record_id UUID,
     user_id UUID FK → users
   )
   ```

2. **Service Layer Implements Junction Table Methods:**
   ```typescript
   // construction-projects.service.ts lines 60-99
   private async updateRecordAssignments(recordId: string, userIds: string[])
   private async getRecordAssignments(recordId: string): Promise<string[]>
   private async isUserAssigned(recordId: string, userId: string): Promise<boolean>
   ```

3. **Queries Use Subquery Pattern:**
   ```typescript
   // Lines 175-177, 198-200
   (SELECT COALESCE(json_agg(json_build_object('id', u.id, 'name', u.first_name || ' ' || u.last_name)), '[]'::json)
    FROM record_assignments ra JOIN users u ON ra.user_id = u.id
    WHERE ra.module = 'CONSTRUCTION' AND ra.record_id = cp.id) as assigned_users
   ```

**Conclusion:** No hybrid implementation. The system consistently uses **MODEL B** (join table) architecture.

---

#### B. ENTITY & DTO ANALYSIS

**DTOs Correctly Define Array Input:**

| DTO | Field | Type | Line |
|-----|-------|------|------|
| CreateConstructionProjectDto | `assigned_user_ids` | `string[]` | 138 |
| CreateRepairProjectDto | `assigned_user_ids` | `string[]` | Similar |
| CreateOperationDto | `assigned_user_ids` | `string[]` | Similar |
| UpdateConstructionProjectDto | Inherits from Create | PartialType | 5 |

**Service Correctly Handles Junction Table:**

```typescript
// construction-projects.service.ts lines 444-447
// Phase AT: Handle multi-select assignments via junction table
if (dto.assigned_user_ids !== undefined) {
  await this.updateRecordAssignments(id, dto.assigned_user_ids || []);
}
```

**THE BUG — Incorrect Field Inclusion in UPDATE Query:**

```typescript
// construction-projects.service.ts lines 401-407
const fields = Object.keys(dto).filter((k) => dto[k] !== undefined);
// ❌ BUG: This includes 'assigned_user_ids' from the DTO
let setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
// ❌ Creates: SET assigned_user_ids = $1, other_field = $2, ...

// Lines 436-442
const result = await this.db.query(
  `UPDATE construction_projects
   SET ${setClause}, updated_by = $${values.length + 1}, updated_at = NOW()
   WHERE id = $${values.length + 2} AND deleted_at IS NULL
   RETURNING *`,
  [...values, userId, id],
);
// ❌ ERROR: column "assigned_user_ids" does not exist
```

**Root Cause:** `assigned_user_ids` is in the DTO for multi-select UI input, but it should be **excluded** from the UPDATE query because it's handled separately via junction table methods.

---

#### C. DATABASE SCHEMA VERIFICATION

**Actual Schema State (Queried via pg):**

```
construction_projects columns:
├── assigned_to : uuid                  ✅ EXISTS (single-user legacy)
└── assigned_user_ids : DOES NOT EXIST  ❌ NO COLUMN
```

**Cross-Module Verification:**

| Table | `assigned_to` | `assigned_user_ids` | Junction Table |
|-------|---------------|---------------------|----------------|
| construction_projects | ✅ uuid | ❌ NO | record_assignments ✅ |
| repair_projects | ✅ uuid | ❌ NO | record_assignments ✅ |
| university_operations | ✅ uuid | ❌ NO | record_assignments ✅ |

**Migration Analysis:**

```bash
grep -r "assigned_user_ids" database/migrations/
# Result: No matches found
```

**Conclusion:**
- `assigned_user_ids` column was **NEVER** intended to exist in the database
- The DTO field is for **frontend multi-select input only**
- The field should be excluded from SQL UPDATE statements

---

#### D. DESIGN DECISION: KEEP JOIN TABLE (MODEL B)

**Chosen Architecture:** Many-to-Many Join Table

**Justification:**

| Criterion | Array Column (MODEL A) | **Join Table (MODEL B)** ✅ |
|-----------|------------------------|----------------------------|
| **Normalization** | Denormalized (1NF violation) | 3NF compliant |
| **Referential Integrity** | No FK enforcement | FK constraints enforce data integrity |
| **Cross-Module Reuse** | Separate array per table | Single `record_assignments` table for all modules |
| **Audit Logging** | No assignment timestamps | `assigned_at`, `assigned_by` fields |
| **Performance** | Array operations slower | Indexed JOINs (scalable) |
| **Future Extensibility** | Limited metadata | Easily add fields (role, permission level, etc.) |

**Final Decision:** **Preserve MODEL B (Join Table)** — No schema changes required.

**Fix Strategy:** Exclude `assigned_user_ids` from UPDATE query field list.

---

#### E. CROSS-MODULE IMPACT ANALYSIS

**Bug Replication Across All Three Modules:**

| Module | Service File | Bug Location | Status |
|--------|--------------|--------------|--------|
| Construction | `construction-projects.service.ts` | Lines 401-442 | 🔴 BROKEN |
| Repairs | `repair-projects.service.ts` | Lines 397-430 | 🔴 BROKEN |
| University Operations | `university-operations.service.ts` | Lines ~300-364 | 🔴 BROKEN |

**Identical Code Pattern in All Services:**

```typescript
// BEFORE (ALL THREE MODULES)
const fields = Object.keys(dto).filter((k) => dto[k] !== undefined);
let setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');

// REQUIRED FIX (ALL THREE MODULES)
const fields = Object.keys(dto).filter((k) =>
  dto[k] !== undefined && k !== 'assigned_user_ids'  // ✅ EXCLUDE
);
let setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
```

**Verification:** All three modules handle `assigned_user_ids` correctly AFTER the UPDATE query via `updateRecordAssignments()` method.

---

#### F. RISK ANALYSIS

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| **Data Corruption** | LOW | 0% | No data at risk — column never existed |
| **Migration Rollback Risk** | NONE | N/A | No migration changes required |
| **Orphaned Assignment Risk** | LOW | 5% | Junction table has FK constraints |
| **Join Inconsistency Risk** | LOW | 0% | Queries already correct |
| **Deployment Downtime** | CRITICAL | 100% | PATCH endpoints broken until fix deployed |

**Deadline Impact:**
- Blocks ALL record edits in production
- Affects Construction, Repairs, and University Operations equally
- Fix is simple: one-line code change per service (3 files)

---

#### G. ROOT CAUSE SUMMARY

**Classification:** **Incorrect ORM-less Query Construction**

**Exact Root Cause:**
1. DTOs correctly define `assigned_user_ids?: string[]` for frontend input
2. Service layer correctly has `updateRecordAssignments()` method for junction table
3. **BUG:** `update()` method includes ALL DTO keys in SQL UPDATE query
4. `assigned_user_ids` is not a table column — it's handled via junction table
5. SQL query fails: `column "assigned_user_ids" of relation "construction_projects" does not exist`

**Why This Happened:**
- DTO field named `assigned_user_ids` (plural) suggests table column
- Developer confusion between DTO input field vs. database column
- No TypeORM entity to enforce schema validation
- Raw SQL query construction doesn't validate column existence

**This is NOT:**
- ❌ Missing migration
- ❌ Incorrect refactor
- ❌ Schema drift

**This IS:**
- ✅ Logic error in UPDATE query field filtering
- ✅ DTO field incorrectly assumed to map 1:1 to table column

---

#### H. RESOLUTION STRATEGY

**Single-Line Fix (Per Service):**

```typescript
// Filter out DTO fields that are NOT table columns
const fields = Object.keys(dto).filter((k) =>
  dto[k] !== undefined && k !== 'assigned_user_ids'
);
```

**Files Requiring Fix:**
1. `pmo-backend/src/construction-projects/construction-projects.service.ts` (line ~401)
2. `pmo-backend/src/repair-projects/repair-projects.service.ts` (line ~397)
3. `pmo-backend/src/university-operations/university-operations.service.ts` (line ~300)

**Verification Method:**
- PATCH `/api/construction-projects/:id` with `assigned_user_ids: [uuid1, uuid2]` → 200 OK
- Verify `record_assignments` table updated correctly
- Verify no column mismatch errors in logs

---
### 1.52 CRITICAL: Assignment-Based Edit Permission Blocked (Feb 2026)

**Status:** 🔴 PHASE 1 RESEARCH COMPLETE — FRONTEND PERMISSION RESOLUTION BUG
**Reported Issues:**
1. Staff with lower role/view privilege cannot edit assigned projects
2. Assigned personnel should be allowed to edit projects assigned to them
3. Director-level rank (staff_test) cannot edit assigned project even though assigned
4. Directors and higher ranks should have administrative-level control within scope
5. Current behavior locks assigned directors into view-only mode

**Root Cause:** Frontend `isOwner()` check ignores multi-select `assignedUsers` array

---

#### A. CURRENT PERMISSION RESOLUTION LOGIC

**Backend (CORRECT):**

```typescript
// construction-projects.service.ts:359-366
// Phase AC + AT: Ownership Check — Non-admin users can edit if creator OR assigned (via junction table)
if (user && !this.permissionResolver.isAdmin(user)) {
  const isOwner = currentRecord.created_by === userId;
  const isAssigned = await this.isUserAssigned(id, userId);  // ✅ CHECKS JUNCTION TABLE
  if (!isOwner && !isAssigned) {
    throw new ForbiddenException('Cannot edit records you do not own or are not assigned to');
  }
}
```

**Backend Logic Flow:**
```
CanEdit (Backend) =
  IsAdmin
  OR IsOwner (created_by)
  OR IsAssigned (record_assignments junction table)
```

**Frontend (BROKEN):**

```typescript
// coi/index.vue:86-96
function isOwner(project: UIProject): boolean {
  const userId = authStore.user?.id
  return project.createdBy === userId || project.delegatedTo === userId  // ❌ IGNORES assignedUsers
}

function canEditItem(project: UIProject): boolean {
  if (!canEdit('coi')) return false  // ❌ ROLE GATE BLOCKS VIEWERS
  if (isAdmin.value) return true
  return isOwner(project)  // ❌ ONLY CHECKS OLD SINGLE-USER ASSIGNMENT
}
```

```typescript
// coi/detail-[id].vue:98-130
const isOwner = computed(() => {
  if (!project.value) return false
  const userId = authStore.user?.id
  return project.value.createdBy === userId || project.value.delegatedTo === userId  // ❌ IGNORES assignedUsers
})

const canEditCurrentProject = computed(() => {
  if (!project.value) return false
  if (!canEdit('coi')) return false  // ❌ ROLE GATE BLOCKS VIEWERS
  if (isAdmin.value) return true
  return isOwner.value  // ❌ DOESN'T CHECK assignedUsers ARRAY
})
```

**Frontend Logic Flow (BROKEN):**
```
CanEdit (Frontend UI) =
  canEdit('coi')  // ❌ Role-based gate (blocks Viewers even if assigned)
  AND
  (
    IsAdmin
    OR createdBy === userId
    OR delegatedTo === userId  // ❌ Old single-user field only
  )
  // ❌ NEVER CHECKS assignedUsers ARRAY
```

---

#### B. REQUIRED GOVERNANCE MODEL

**Correct Access Model:**

User can EDIT record if:

```
ModuleAccess
∧
(
  IsAdmin
  ∨ IsOwner (created_by)
  ∨ IsAssigned (assignedUsers[].id includes userId)
  ∨ RankAuthority (for Directors and above)
)
```

**Formal Logic:**

```
CanEdit =
  HasModuleAccess (not revoked via override)
  AND
  (
    IsAdmin
    OR IsOwner
    OR IsAssignedToRecord  // ✅ MUST CHECK assignedUsers ARRAY
    OR HasHigherRankAuthority
  )
```

**Assignment-Based Elevation:**

- Assignment elevates edit capability WITHIN SCOPE
- Assigned user can:
  - ✅ Edit record fields
  - ✅ Submit for review
  - ❌ Publish (requires Admin + rank authority)
  - ❌ Delete (requires Admin)

**Role Gate Problem:**

Current `canEdit('coi')` uses pure role-based check:

```typescript
// usePermissions.ts:250-252
function canEdit(moduleId: string): boolean {
  return getModulePermissions(moduleId).canEdit
}

// Returns role defaults:
// Viewer → canEdit: false  ❌ BLOCKS ASSIGNED VIEWERS
// Staff  → canEdit: true
// Admin  → canEdit: true
```

This blocks Viewers BEFORE checking assignment.

---

#### C. DIRECTOR ROLE CLARIFICATION

**staff_test User Analysis:**

```
User: Test Staff
Email: staff_test@carsu.edu.ph
Role: Staff  ✅ NOT VIEWER
Rank Level: 30  ✅ DIRECTOR (lower = higher authority)
```

**Expected Behavior:**

Director-level rank should:
- ✅ Have edit capability on assigned records
- ✅ Have edit capability on records under their office/campus
- ✅ Submit for review
- ❌ NOT auto-publish unless configured via rank approval logic
- ❌ NOT be limited to view-only if assigned

**Current Behavior for Directors:**

If Director has Staff role:
- Role gate passes (`canEdit('coi')` returns true)
- But `isOwner()` still fails if not creator or in old `delegatedTo` field
- **BUG:** Director assigned via `assignedUsers` array cannot edit because `isOwner()` doesn't check array

If Director has Viewer role (possible via override):
- Role gate BLOCKS (`canEdit('coi')` returns false)
- Edit button hidden immediately
- Assignment never checked

**Rank vs Role Integration:**

Current implementation:
- **Rank:** Used ONLY for approval authority (canApproveByRank)
- **Role:** Used for CRUD permissions (canEdit, canAdd, canDelete)
- **Assignment:** Should elevate edit rights but IGNORED by frontend

Missing integration:
- Rank does NOT elevate edit capability
- Assignment does NOT bypass role gate
- No "scoped admin" concept for Directors

---

#### D. ASSIGNMENT-BASED EDIT ELEVATION

**Current Assignment Handling:**

Backend:
```typescript
// ✅ CORRECT - Checks junction table
const isAssigned = await this.isUserAssigned(id, userId);
```

Frontend Detail Page:
```typescript
// ❌ WRONG - Ignores assignedUsers array
const isOwner = computed(() => {
  return project.value.createdBy === userId || project.value.delegatedTo === userId
})
// Should be:
const isOwnerOrAssigned = computed(() => {
  const userId = authStore.user?.id
  if (!project.value) return false
  return (
    project.value.createdBy === userId
    || project.value.delegatedTo === userId
    || project.value.assignedUsers.some(u => u.id === userId)  // ✅ CHECK ARRAY
  )
})
```

Frontend Index Page:
```typescript
// ❌ WRONG - Ignores assignedUsers array
function isOwner(project: UIProject): boolean {
  return project.createdBy === userId || project.delegatedTo === userId
}
// Should be:
function isOwnerOrAssigned(project: UIProject): boolean {
  const userId = authStore.user?.id
  return (
    project.createdBy === userId
    || project.delegatedTo === userId
    || project.assignedUsers?.some(u => u.id === userId)  // ✅ CHECK ARRAY
  )
}
```

**Elevation Rules:**

If user is assigned (`assignedUsers` includes userId):
- They must at least:
  - ✅ View record (already works via Phase Y visibility)
  - ✅ Edit record (BROKEN - this is the bug)
  - ✅ Submit for review (BROKEN - also checks isOwner)

Assignment should elevate:
- `View → Edit` (within scope)
- Enable submit-for-review workflow

But NOT elevate:
- `Edit → Publish` (requires Admin role + rank authority)
- `Edit → Delete` (requires Admin role)

---

#### E. CROSS-MODULE CONSISTENCY

**Affected Files (ALL 3 MODULES):**

| Module | Index Page | Detail Page | Bug Pattern |
|--------|-----------|-------------|-------------|
| COI | `pages/coi/index.vue` | `pages/coi/detail-[id].vue` | ❌ isOwner ignores assignedUsers |
| Repairs | `pages/repairs/index.vue` | `pages/repairs/detail-[id].vue` | ❌ isOwner ignores assignedUsers |
| University Ops | `pages/university-operations/index.vue` | `pages/university-operations/detail-[id].vue` | ❌ isOwner ignores assignedUsers |

**Bug Replication Pattern:**

All 6 files have IDENTICAL bugs:

1. **Index Page Pattern:**
```typescript
function isOwner(project: UIProject): boolean {
  const userId = authStore.user?.id
  return project.createdBy === userId || project.delegatedTo === userId  // ❌ NO assignedUsers
}

function canEditItem(project: UIProject): boolean {
  if (!canEdit('module')) return false  // ❌ Role gate
  if (isAdmin.value) return true
  return isOwner(project)  // ❌ Missing assignment check
}

function canSubmitForReview(project: UIProject): boolean {
  if (!isStaff.value) return false
  if (!isOwner(project)) return false  // ❌ Missing assignment check
  return project.publicationStatus === 'DRAFT' || project.publicationStatus === 'REJECTED'
}
```

2. **Detail Page Pattern:**
```typescript
const isOwner = computed(() => {
  if (!project.value) return false
  const userId = authStore.user?.id
  return project.value.createdBy === userId || project.value.delegatedTo === userId  // ❌ NO assignedUsers
})

const canEditCurrentProject = computed(() => {
  if (!project.value) return false
  if (!canEdit('module')) return false  // ❌ Role gate
  if (isAdmin.value) return true
  return isOwner.value  // ❌ Missing assignment check
})

const canSubmitForReview = computed(() => {
  if (!project.value) return false
  return isStaff.value && isOwner.value  // ❌ Missing assignment check
    && (project.value.publicationStatus === 'DRAFT' || project.value.publicationStatus === 'REJECTED')
})
```

**Consistency Requirement:**

Fix must apply to ALL 6 files with identical pattern.

---

#### F. RISK ANALYSIS

| Risk | Severity | Likelihood | Impact |
|------|----------|------------|---------|
| **Privilege Escalation** | LOW | 5% | Assignment is explicit (not accidental) |
| **Unauthorized Edit** | LOW | 0% | Backend enforces correct logic |
| **Inconsistent Permission Resolution** | CRITICAL | 100% | Frontend/backend mismatch |
| **Director Authority Under-Enforcement** | HIGH | 100% | Directors cannot edit assigned work |
| **Viewer Assignment Blocked** | CRITICAL | 100% | Assigned Viewers locked out |
| **Deadline Impact** | CRITICAL | 100% | Users cannot perform assigned duties |

**Data Integrity:**

- LOW RISK: Backend still enforces correct permission check
- Users can still edit via direct API call (backend allows it)
- Issue is UI/UX - Edit button hidden when it should show

**User Impact:**

- Assigned users cannot see Edit button
- Directors assigned to projects cannot edit them
- Viewers assigned to projects cannot edit them
- Staff must be creator to edit (defeats assignment purpose)

**Production Impact:**

- Blocks delegation workflow
- Defeats purpose of multi-select assignment feature (Phase AT)
- Users report "I'm assigned but can't edit"

---

#### G. ROOT CAUSE SUMMARY

**Classification:** **Frontend Permission Resolution Logic Error**

**Exact Root Cause:**

1. Phase AT (Multi-Select Assignment) added `assignedUsers` array to backend
2. Backend correctly checks `isUserAssigned(id, userId)` via junction table
3. Frontend adapted data to include `assignedUsers` array in `UIProject` interface
4. **BUG:** Frontend `isOwner()` checks NOT UPDATED to include `assignedUsers`
5. Frontend still only checks old `delegatedTo` field (Phase AE legacy single-user)
6. Assignment check completely bypassed in UI permission resolution

**Why This Happened:**

- Phase AE implemented single-user assignment via `delegatedTo` field
- Phase AT upgraded to multi-select via `assignedUsers` array + junction table
- Backend update was complete (checks junction table)
- Frontend update was INCOMPLETE (UI checks not updated)
- `isOwner()` function kept old logic checking only `delegatedTo`

**This is NOT:**
- ❌ Backend permission bug (backend is correct)
- ❌ Database schema issue (data is correct)
- ❌ Role configuration problem (roles are correct)

**This IS:**
- ✅ Frontend UI permission check bug
- ✅ Incomplete migration from single-user to multi-select assignment
- ✅ `isOwner()` function not updated to check `assignedUsers` array

---

#### H. PERMISSION RESOLUTION FLOW DIAGRAM

**Current Flow (BROKEN):**

```
User Attempts Edit
  ↓
Frontend: canEditCurrentProject()
  ↓
Check: canEdit('module')  ← Role-based gate
  ├─ Viewer → FALSE ❌ BLOCKS (even if assigned)
  ├─ Staff  → TRUE  ✅ PASSES
  └─ Admin  → TRUE  ✅ PASSES
  ↓ (if TRUE)
Check: isAdmin.value
  ├─ TRUE  → ALLOW ✅
  └─ FALSE → Check isOwner
       ↓
       Check: createdBy === userId
         ├─ TRUE  → ALLOW ✅
         └─ FALSE → Check delegatedTo === userId
              ├─ TRUE  → ALLOW ✅
              └─ FALSE → DENY ❌ (even if in assignedUsers!)
```

**Correct Flow (REQUIRED):**

```
User Attempts Edit
  ↓
Frontend: canEditCurrentProject()
  ↓
Check: Module access not revoked (override check)
  ├─ Revoked → DENY ❌
  └─ Not revoked → CONTINUE
       ↓
       Check: isAdmin.value
         ├─ TRUE  → ALLOW ✅
         └─ FALSE → Check isOwnerOrAssigned
              ↓
              Check: createdBy === userId
                ├─ TRUE  → ALLOW ✅
                └─ FALSE → Check delegatedTo === userId
                     ├─ TRUE  → ALLOW ✅
                     └─ FALSE → Check assignedUsers.includes(userId)  ✅ NEW
                          ├─ TRUE  → ALLOW ✅
                          └─ FALSE → Check rank authority (optional future)
                               ├─ TRUE  → ALLOW ✅
                               └─ FALSE → DENY ❌
```

**Key Changes:**

1. Remove role-based gate `canEdit('module')` from edit check
2. Check assignment via `assignedUsers` array
3. Rename `isOwner` to `isOwnerOrAssigned` for clarity
4. Optional: Add rank-based elevation for Directors

---

#### I. REQUIRED FIXES

**1. Frontend Index Pages (3 files):**

```typescript
// BEFORE
function isOwner(project: UIProject): boolean {
  const userId = authStore.user?.id
  return project.createdBy === userId || project.delegatedTo === userId
}

function canEditItem(project: UIProject): boolean {
  if (!canEdit('module')) return false  // ❌ REMOVE THIS GATE
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
    || project.assignedUsers?.some(u => u.id === userId) || false  // ✅ CHECK ARRAY
  )
}

function canEditItem(project: UIProject): boolean {
  // Module access check (only deny if explicitly revoked)
  // Don't block based on role alone
  if (isAdmin.value) return true
  return isOwnerOrAssigned(project)  // ✅ CHECKS ASSIGNMENT
}
```

**2. Frontend Detail Pages (3 files):**

```typescript
// BEFORE
const isOwner = computed(() => {
  if (!project.value) return false
  const userId = authStore.user?.id
  return project.value.createdBy === userId || project.value.delegatedTo === userId
})

const canEditCurrentProject = computed(() => {
  if (!project.value) return false
  if (!canEdit('module')) return false  // ❌ REMOVE THIS GATE
  if (isAdmin.value) return true
  return isOwner.value
})

// AFTER
const isOwnerOrAssigned = computed(() => {
  if (!project.value) return false
  const userId = authStore.user?.id
  if (!userId) return false
  return (
    project.value.createdBy === userId
    || project.value.delegatedTo === userId
    || project.value.assignedUsers?.some(u => u.id === userId) || false  // ✅ CHECK ARRAY
  )
})

const canEditCurrentProject = computed(() => {
  if (!project.value) return false
  // Module access check (only deny if explicitly revoked)
  if (isAdmin.value) return true
  return isOwnerOrAssigned.value  // ✅ CHECKS ASSIGNMENT
})
```

**3. Submit for Review Check:**

```typescript
// BEFORE
const canSubmitForReview = computed(() => {
  if (!project.value) return false
  return isStaff.value && isOwner.value
    && (project.value.publicationStatus === 'DRAFT' || project.value.publicationStatus === 'REJECTED')
})

// AFTER
const canSubmitForReview = computed(() => {
  if (!project.value) return false
  // Staff OR assigned user can submit
  if (!isStaff.value && !isOwnerOrAssigned.value) return false
  if (!isOwnerOrAssigned.value) return false  // Must be owner or assigned
  return (
    project.value.publicationStatus === 'DRAFT'
    || project.value.publicationStatus === 'REJECTED'
  )
})
```

---

#### J. VERIFICATION REQUIREMENTS

**Test Matrix:**

| User Type | Assignment | Role | Expected Edit | Expected Submit |
|-----------|-----------|------|---------------|-----------------|
| Creator | N/A | Staff | ✅ Yes | ✅ Yes |
| Creator | N/A | Viewer | ✅ Yes (owner override) | ✅ Yes (owner override) |
| Assigned | Via assignedUsers | Staff | ✅ Yes | ✅ Yes |
| Assigned | Via assignedUsers | Viewer | ✅ Yes | ✅ Yes (assignment elevation) |
| Director (rank 30) | Via assignedUsers | Staff | ✅ Yes | ✅ Yes |
| Director (rank 30) | Via assignedUsers | Viewer | ✅ Yes | ✅ Yes (assignment elevation) |
| Not creator | Not assigned | Staff | ❌ No | ❌ No |
| Not creator | Not assigned | Viewer | ❌ No | ❌ No |
| Admin | N/A | Admin | ✅ Yes (always) | ✅ Yes (always) |

**Critical Test Cases:**

1. **staff_test (Director + Staff role) assigned to project**
   - Before: Edit button hidden or fails
   - After: Edit button visible, edit succeeds

2. **Viewer assigned to project**
   - Before: Edit button hidden (role gate blocks)
   - After: Edit button visible, edit succeeds

3. **Staff not assigned**
   - Before: Can edit (if creator)
   - After: Cannot edit (unless creator or assigned)

4. **Publish still restricted**
   - Before: Admin only
   - After: Admin only (no change)

---
