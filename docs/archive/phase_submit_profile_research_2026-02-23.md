# ACE v2.4 PHASE 1 RESEARCH: SUBMIT AUTHORIZATION & PROFILE PRIVILEGE
**Date:** 2026-02-23
**Governance:** Strict Research → Plan Separation
**Architect:** Senior Software Architect + Access Control Engineer + Governance Workflow Architect

---

## EXECUTIVE SUMMARY

**Critical Issue Identified:** Submit-for-Review authorization uses deprecated single-assignment column instead of current junction table, causing permission denial for users assigned via multi-select system.

**Secondary Issue Identified:** Username and email cannot be modified by Admin/SuperAdmin. Password reset bypasses validation but lacks structured governance.

**Impact:** BLOCKS multi-user assignment workflow functionality.

**Priority:** P0 CRITICAL (breaks core feature)

---

## SECTION A: SUBMIT AUTHORIZATION ROOT CAUSE ANALYSIS

### A.1 Current Implementation

**Backend Authorization Logic:**

All three modules (Construction, Repairs, University Operations) use identical flawed logic:

**File:** `pmo-backend/src/construction-projects/construction-projects.service.ts:485-499`
```typescript
async submitForReview(id: string, userId: string): Promise<any> {
  const project = await this.findOne(id);

  // State machine validation (CORRECT)
  if (project.publication_status !== 'DRAFT' && project.publication_status !== 'REJECTED') {
    throw new BadRequestException(
      `Only DRAFT or REJECTED records can be submitted for review. Current status: ${project.publication_status}`,
    );
  }

  // Authorization check (INCORRECT)
  const isOwner = project.created_by === userId;
  const isAssigned = project.assigned_to === userId;  // ❌ DEPRECATED COLUMN
  if (!isOwner && !isAssigned) {
    throw new ForbiddenException('Only the creator or assigned user can submit this draft for review');
  }

  // ... state transition logic
}
```

**Cross-Module Consistency:**
- `pmo-backend/src/repair-projects/repair-projects.service.ts:470-484` — Identical bug
- `pmo-backend/src/university-operations/university-operations.service.ts:389-403` — Identical bug

### A.2 Architecture Mismatch

**System Has TWO Assignment Models:**

1. **DEPRECATED (Phase AN):** Single assignment via `assigned_to` UUID column
   - `CreateConstructionProjectDto.assigned_to?: string`
   - Comment: "DEPRECATED - use assigned_user_ids"

2. **CURRENT (Phase AT):** Multi-select assignment via `record_assignments` junction table
   - `CreateConstructionProjectDto.assigned_user_ids?: string[]`
   - Table: `record_assignments(module, record_id, user_id)`

**The Bug:**
Submit authorization checks `assigned_to` (deprecated) instead of querying `record_assignments` (current).

### A.3 Existing Correct Pattern

**The service already has the correct helper method:**

**File:** `pmo-backend/src/construction-projects/construction-projects.service.ts:91-99`
```typescript
private async isUserAssignedToRecord(recordId: string, userId: string): Promise<boolean> {
  const result = await this.db.query(
    `SELECT 1 FROM record_assignments WHERE module = 'CONSTRUCTION' AND record_id = $1 AND user_id = $2`,
    [recordId, userId],
  );
  return result.rows.length > 0;
}
```

**This method is used correctly in visibility filtering (line 131, 136) but NOT in submit authorization.**

### A.4 Frontend vs Backend Inconsistency

**Frontend (CORRECT):**

**File:** `pmo-frontend/pages/coi/detail-[id].vue:110-118`
```typescript
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

Where `isOwnerOrAssigned` checks:
- `created_by === userId`
- `delegatedTo === userId`
- `assignedUsers?.some(u => u.id === userId)` ✅ Correct multi-select check

**Backend (INCORRECT):**
Only checks `assigned_to` column (deprecated).

**Result:** Frontend shows "Submit for Review" button, but backend returns 403 Forbidden.

---

## SECTION B: CORRECTED SUBMISSION GOVERNANCE MODEL

### B.1 Required Authorization Rules

**User can SUBMIT if:**

```
HasModuleAccess
∧ status ∈ {DRAFT, REJECTED}
∧ (
     IsCreator
  ∨ IsAssignedViaJunctionTable
  ∨ (HasRankAuthority ∧ SameCampus)  // OPTIONAL ENHANCEMENT
  )
```

**Definitions:**
- **IsCreator:** `record.created_by === userId`
- **IsAssignedViaJunctionTable:** `EXISTS (SELECT 1 FROM record_assignments WHERE module = ? AND record_id = ? AND user_id = ?)`
- **HasRankAuthority:** `user.rank_level >= threshold AND user.role IN ('Admin', 'Staff')` (DEFERRED)
- **SameCampus:** `record.campus === user.campus` (DEFERRED)

**Immediate Scope (CRITICAL):**
Fix assignment check to use junction table.

**Deferred Scope (OPTIONAL):**
Add rank-based authority for Directors/Division Chiefs.

### B.2 State Machine Validation (Already Correct)

**Valid Transitions:**
- `DRAFT → PENDING_REVIEW` ✅
- `REJECTED → PENDING_REVIEW` ✅

**Blocked Transitions:**
- `PENDING_REVIEW → PENDING_REVIEW` ❌
- `PUBLISHED → PENDING_REVIEW` ❌

Current validation is correct and must be preserved.

### B.3 Cross-Module Consistency Requirements

**All three modules must use identical logic:**
- Construction Projects
- Repair Projects
- University Operations

**Pattern:**
Extract shared authorization method to common service or use same helper pattern in each service.

---

## SECTION C: PROFILE PRIVILEGE GOVERNANCE ANALYSIS

### C.1 Current Profile Edit Capabilities

**Endpoint:** `PATCH /users/:id`
**Guard:** `@Roles()` — SuperAdmin only

**UpdateUserDto Capabilities:**

**File:** `pmo-backend/src/users/dto/update-user.dto.ts`
```typescript
export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['email', 'password'])) {
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase, one lowercase, and one number',
  })
  password?: string;
}
```

**Fields Available for Update:**
- ✅ first_name
- ✅ last_name
- ✅ phone
- ✅ avatar_url
- ✅ is_active
- ✅ rank_level (with validation)
- ✅ campus
- ✅ metadata
- ✅ password (WITH complexity validation)

**Fields NOT Available for Update:**
- ❌ email (excluded via OmitType)
- ❌ username (not in update method)

### C.2 Password Reset Endpoint

**Endpoint:** `POST /users/:id/reset-password`
**Guard:** `@Roles()` — SuperAdmin only

**File:** `pmo-backend/src/users/users.service.ts:529-544`
```typescript
async resetPassword(userId: string, newPassword: string, adminId: string): Promise<void> {
  const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

  const result = await this.db.query(
    `UPDATE users SET password_hash = $1, last_password_change_at = NOW(),
     failed_login_attempts = 0, account_locked_until = NULL, updated_at = NOW()
     WHERE id = $2 AND deleted_at IS NULL`,
    [passwordHash, userId],
  );

  if (result.rowCount === 0) {
    throw new NotFoundException(`User with ID ${userId} not found`);
  }

  this.logger.log(`USER_PASSWORD_RESET: id=${userId}, by=${adminId}`);
}
```

**Behavior:**
- ✅ Accepts ANY password (no validation on parameter)
- ✅ Hashes correctly with bcrypt
- ✅ Logs action
- ❌ No length/complexity enforcement

**Audit Trail:**
- Basic logging to console
- No database audit table

### C.3 Rank-Based Edit Permission

**File:** `pmo-backend/src/users/users.service.ts:277-295`
```typescript
async update(id: string, dto: UpdateUserDto, adminId: string): Promise<any> {
  // Verify user exists
  const existing = await this.db.query(
    `SELECT id, rank_level FROM users WHERE id = $1 AND deleted_at IS NULL`,
    [id],
  );

  if (existing.rows.length === 0) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }

  // Rank-Based Permission: Check if actor can modify this user
  // Skip check if updating own profile (users can always update their own basic info)
  if (id !== adminId) {
    const canModify = await this.canModifyUser(adminId, id);
    if (!canModify) {
      throw new ForbiddenException('Cannot modify a user with equal or higher authority');
    }
  }

  // ... build UPDATE query
}
```

**Authorization Logic:**
- Self-edit: Always allowed (basic info)
- Other user: Delegates to PostgreSQL function `can_modify_user(actorId, targetId)`
- Function created in migration 008

**Current Behavior:**
- SuperAdmin can edit any user
- Admin can edit users with lower rank
- Users can edit own basic info

---

## SECTION D: REQUIRED PROFILE PRIVILEGE ENHANCEMENTS

### D.1 Username Edit Capability

**Current State:** Cannot be updated

**Required Functionality:**
- Admin: Can change username for lower-rank users
- SuperAdmin: Can change username for any user
- Validation: Unique constraint must be enforced

**Constraints:**
- Username format: `/^[a-z0-9._-]+$/` (lowercase, alphanumeric, dots, underscores, dashes)
- Length: 3-100 characters
- Uniqueness: Must check for conflicts

**Security:**
- Must not allow privilege escalation
- Must log username changes
- Old username should be preserved in audit trail

### D.2 Email Edit Capability

**Current State:** Cannot be updated (excluded from UpdateUserDto)

**Required Functionality:**
- Admin: Can change email for lower-rank users
- SuperAdmin: Can change email for any user
- Validation: Email format + uniqueness

**Constraints:**
- Email format: Valid email regex
- Uniqueness: Must check for conflicts
- Verification: Consider email verification workflow (DEFERRED)

**Security:**
- Must log email changes
- Consider notification to old email (DEFERRED)

### D.3 SuperAdmin Password Bypass

**Current State:** `resetPassword()` accepts any password, no validation

**Required Behavior:**
- SuperAdmin: Can set password bypassing complexity rules
- Minimum length: Still enforce 8 characters (security baseline)
- Complexity: Bypass uppercase/lowercase/number requirement
- Hashing: Must still use bcrypt

**Rationale:**
- Emergency account recovery
- Testing/troubleshooting
- Legacy account migration

**Audit:**
- Log when bypass is used
- Record actor ID

### D.4 Admin vs SuperAdmin Matrix

| Action | Self | Admin → Lower Rank | Admin → Equal/Higher | SuperAdmin → Any |
|--------|------|-------------------|---------------------|------------------|
| Update basic info (name, phone) | ✅ | ✅ | ❌ | ✅ |
| Update username | ❌ MISSING | ❌ MISSING | ❌ | ❌ MISSING |
| Update email | ❌ MISSING | ❌ MISSING | ❌ | ❌ MISSING |
| Update rank | ❌ | ✅ (to lower) | ❌ | ✅ |
| Change password (validated) | ✅ | ✅ | ❌ | ✅ |
| Reset password (bypass) | ❌ | ❌ | ❌ | ✅ EXISTING |

**Gap Summary:**
- Username edit: Not implemented
- Email edit: Not implemented
- Both need to respect rank-based permission

---

## SECTION E: SECURITY & AUDIT REQUIREMENTS

### E.1 Required Audit Trail

**Actions Requiring Audit Logging:**

| Action | Log Level | Required Data |
|--------|-----------|---------------|
| Username change | HIGH | old_username, new_username, actor_id, timestamp |
| Email change | HIGH | old_email, new_email, actor_id, timestamp |
| Password reset (bypass) | CRITICAL | target_user_id, actor_id, bypass_used, timestamp |
| Rank change | HIGH | old_rank, new_rank, actor_id, timestamp |

**Implementation Options:**

1. **Console Logging (Current):** Minimal, not persistent
2. **Database Audit Table (Recommended):** Persistent, queryable
3. **External Audit Service (Future):** Compliance-grade

**Immediate Scope:**
Enhanced console logging with structured format.

**Deferred Scope:**
Database audit table.

### E.2 Privilege Escalation Prevention

**Attack Vectors:**

1. **Self-Elevation:**
   - User edits own rank to SuperAdmin
   - **Mitigation:** `canModifyUser()` prevents self-edit of rank

2. **Lateral Admin Override:**
   - Admin A edits Admin B's username
   - **Mitigation:** Rank-based permission check

3. **Email/Username Takeover:**
   - Change username to impersonate another user
   - **Mitigation:** Uniqueness constraint + audit log

**Required Validations:**
- Rank-based permission check for username/email updates
- Uniqueness constraint enforcement
- Audit logging before and after values

### E.3 Credential Takeover Risk

**Scenario:**
Compromised Admin account changes SuperAdmin email/username to lock them out.

**Mitigation:**
- Rank-based permission: Admin cannot modify SuperAdmin
- Audit trail: Changes are logged
- Recovery: SuperAdmin can reset via database access (DEFERRED: Add recovery mechanism)

---

## SECTION F: CROSS-MODULE CONSISTENCY VERIFICATION

### F.1 Submit Authorization Consistency

**All modules must be updated identically:**

| Module | File | Line | Status |
|--------|------|------|--------|
| Construction | construction-projects.service.ts | 496 | ❌ Uses deprecated `assigned_to` |
| Repairs | repair-projects.service.ts | 481 | ❌ Uses deprecated `assigned_to` |
| University Ops | university-operations.service.ts | 400 | ❌ Uses deprecated `assigned_to` |

**Required Fix:**
Replace `project.assigned_to === userId` with `await this.isUserAssignedToRecord(id, userId)` in all three services.

### F.2 Profile Edit Centralization

**Current State:**
Profile editing is centralized in Users module (users.service.ts).

**Consistency:**
- ✅ Single source of truth for user updates
- ✅ Rank-based permission enforced in one place
- ✅ No risk of inconsistent behavior across modules

---

## SECTION G: RISK ASSESSMENT

### G.1 Submit Authorization Bug

| Risk Factor | Severity | Likelihood | Impact |
|-------------|----------|------------|--------|
| **Business Impact** | CRITICAL | HIGH | Multi-user assignment workflow broken |
| **User Frustration** | HIGH | HIGH | Button shown but action fails (403) |
| **Data Integrity** | LOW | LOW | State machine prevents invalid transitions |
| **Security** | MEDIUM | LOW | Could block legitimate submissions |

**Overall Risk:** **CRITICAL**
**User Impact:** Immediate (affects current workflows)
**Workaround:** Use deprecated single-assignment field (not viable long-term)

### G.2 Profile Edit Missing Features

| Risk Factor | Severity | Likelihood | Impact |
|-------------|----------|------------|--------|
| **Business Impact** | MEDIUM | MEDIUM | Cannot fix typos in username/email |
| **Security** | LOW | LOW | No credential takeover risk (features don't exist) |
| **User Frustration** | MEDIUM | MEDIUM | Requires database-level edits for corrections |
| **Compliance** | LOW | LOW | May affect GDPR right-to-rectification (DEFERRED) |

**Overall Risk:** **MEDIUM**
**User Impact:** Infrequent (only when corrections needed)
**Workaround:** Manual database updates by DBA

### G.3 Deadline Impact Assessment

**Timeline Context:**
- Sprint Deadline: March 12, 2026
- University Operations Completion: March 8, 2026

**Submit Bug:**
- **Impact if not fixed:** BLOCKS core functionality
- **Effort:** 2-4 hours (all modules)
- **Priority:** Must fix before University Operations go-live

**Profile Enhancements:**
- **Impact if not added:** Inconvenience, not blocker
- **Effort:** 4-6 hours (username + email edit)
- **Priority:** Should fix, but can defer to post-March

**Recommendation:**
- Fix submit authorization immediately (P0)
- Add profile enhancements as P1 (before March 12 if possible)

---

## SECTION H: DEFERRED RESEARCH TOPICS

### H.1 Rank-Based Submit Authority

**Question:** Should Directors be able to submit drafts in their office even if not assigned?

**Current Answer:** NO — only creator or explicitly assigned users can submit.

**Rationale for Deferral:**
- Requires office/department hierarchy data model
- Requires campus-scoped authority rules
- Adds complexity to permission resolution
- Can be added post-March as enhancement

**Condition to Resume:**
Post-kickoff when office hierarchy is formalized.

### H.2 Email Verification Workflow

**Question:** Should email changes trigger verification emails?

**Rationale for Deferral:**
- Requires email sending infrastructure
- Requires verification token system
- Security best practice but not immediate blocker

**Condition to Resume:**
When email infrastructure is in place.

### H.3 Database Audit Table

**Question:** Should we create a persistent audit_log table?

**Rationale for Deferral:**
- Enhanced logging sufficient for immediate needs
- Audit table design requires careful schema planning
- Can be backfilled from logs if needed

**Condition to Resume:**
Post-March when compliance requirements are formalized.

---

## SECTION I: RESEARCH CONCLUSIONS

### I.1 Root Cause Classification

**Submit Authorization Issue:**
- **Category:** Architecture mismatch
- **Type:** Implementation bug (uses deprecated field)
- **Scope:** All three record modules
- **Severity:** Critical (breaks core feature)
- **Fix Complexity:** Low (pattern already exists)

**Profile Edit Limitations:**
- **Category:** Missing feature
- **Type:** Incomplete implementation
- **Scope:** Users module only
- **Severity:** Medium (workaround available)
- **Fix Complexity:** Medium (requires DTO + validation changes)

### I.2 Recommended Prioritization

**Phase 3 Implementation Order:**

1. **CRITICAL (Must Complete Before March 8):**
   - Fix submit authorization in all three modules
   - Verify state machine integrity preserved
   - Test assignment-based submission

2. **IMPORTANT (Should Complete Before March 12):**
   - Add username edit capability
   - Add email edit capability
   - Add enhanced audit logging

3. **DEFERRED (Post-March):**
   - Database audit table
   - Email verification workflow
   - Rank-based submit authority for Directors

### I.3 No Code Implementation in Research

**Compliance:** ✅ STRICT
This research contains ZERO implementation code, only analysis and specification.

Implementation will be provided in Phase 2 Plan and executed in Phase 3.

---

## END OF PHASE 1 RESEARCH

**Next Phase:** Phase 2 Plan (Corrective Action Blueprint)

**Approval Required:** User must approve proceeding to Phase 2

