# ACE v2.4 PHASE 2 PLAN: SUBMIT AUTHORIZATION & PROFILE PRIVILEGE FIXES
**Date:** 2026-02-23
**Governance:** Executable Implementation Contract
**Architect:** Senior Software Architect + Access Control Engineer
**Research Reference:** `phase_submit_profile_research_2026-02-23.md`

---

## EXECUTIVE SUMMARY

**Objective:** Fix submit authorization to use junction table assignments and add Admin/SuperAdmin profile edit capabilities.

**Scope:**
- CRITICAL: Submit authorization fix (all 3 modules)
- IMPORTANT: Username/email edit capability
- IMPORTANT: Audit logging enhancement

**Timeline:** 6-10 hours total

---

## PHASE STRUCTURE

### CRITICAL PATH (MUST COMPLETE)

| Phase | Description | Priority | Time | Blocking |
|-------|-------------|----------|------|----------|
| **BU** | Fix submit authorization (Construction) | P0 | 1h | ✅ YES |
| **BV** | Fix submit authorization (Repairs) | P0 | 30min | ✅ YES |
| **BW** | Fix submit authorization (University Ops) | P0 | 30min | ✅ YES |
| **BX** | Submit authorization regression testing | P0 | 1h | ✅ YES |

**Critical Path Total:** 3 hours

### HIGH PRIORITY (SHOULD COMPLETE)

| Phase | Description | Priority | Time | Blocking |
|-------|-------------|----------|------|----------|
| **BY** | Add username edit capability | P1 | 2h | ❌ NO |
| **BZ** | Add email edit capability | P1 | 2h | ❌ NO |
| **CA** | Enhanced audit logging | P1 | 1h | ❌ NO |

**High Priority Total:** 5 hours

**Combined Estimate:** 8 hours

---

## PHASE BU: FIX SUBMIT AUTHORIZATION (CONSTRUCTION) [CRITICAL]

**Status:** ⏳ PENDING
**Priority:** P0 — BLOCKS MULTI-USER ASSIGNMENT WORKFLOW
**Research Reference:** Section A, B
**Scope:** Backend — Authorization fix

### Problem Statement

Submit authorization checks deprecated `assigned_to` column instead of `record_assignments` junction table.

**Impact:** Users assigned via multi-select cannot submit records for review.

### Required Changes

**File:** `pmo-backend/src/construction-projects/construction-projects.service.ts`

**Location:** Line 485-499 (`submitForReview` method)

**Current Code:**
```typescript
// Phase AD: Creator OR assigned user can submit for review
const isOwner = project.created_by === userId;
const isAssigned = project.assigned_to === userId;  // ❌ DEPRECATED
if (!isOwner && !isAssigned) {
  throw new ForbiddenException('Only the creator or assigned user can submit this draft for review');
}
```

**Corrected Code:**
```typescript
// Phase BU: Creator OR assigned user (via junction table) can submit for review
const isOwner = project.created_by === userId;
const isAssigned = await this.isUserAssignedToRecord(id, userId);  // ✅ CORRECT
if (!isOwner && !isAssigned) {
  throw new ForbiddenException('Only the creator or assigned user can submit this draft for review');
}
```

**Note:** Helper method `isUserAssignedToRecord()` already exists at line 91-99.

### Verification

**Test Scenarios:**

| Test | Actor | Record State | Expected |
|------|-------|--------------|----------|
| BU1 | Creator | DRAFT | ✅ Submit succeeds |
| BU2 | Assigned user (junction) | DRAFT | ✅ Submit succeeds |
| BU3 | Assigned user (old column) | DRAFT | ❌ Submit fails (deprecated) |
| BU4 | Unassigned user | DRAFT | ❌ 403 Forbidden |
| BU5 | Creator | PENDING_REVIEW | ❌ 400 Bad Request |

**SQL Verification:**
```sql
-- Verify junction table has assignment
SELECT * FROM record_assignments
WHERE module = 'CONSTRUCTION' AND record_id = '{test_record_id}' AND user_id = '{test_user_id}';
```

### Acceptance Criteria

- ✅ Submit succeeds for users in `record_assignments` table
- ✅ Submit fails for users NOT in `record_assignments` table
- ✅ State machine validation preserved (DRAFT/REJECTED only)
- ✅ Error messages remain clear
- ✅ No regression in creator submission

---

## PHASE BV: FIX SUBMIT AUTHORIZATION (REPAIRS) [CRITICAL]

**Status:** ⏳ PENDING
**Priority:** P0 — CROSS-MODULE CONSISTENCY
**Research Reference:** Section F.1
**Scope:** Backend — Identical fix to BU

### Problem Statement

Same bug as Construction module.

### Required Changes

**File:** `pmo-backend/src/repair-projects/repair-projects.service.ts`

**Location:** Line 470-484 (`submitForReview` method)

**Apply identical fix as Phase BU:**
Replace `project.assigned_to === userId` with `await this.isUserAssignedToRecord(id, userId)`

**Note:** Repair module uses different module constant in helper: `'REPAIRS'` instead of `'CONSTRUCTION'`.

### Verification

Same test matrix as BU1-BU5 but for Repairs module.

### Acceptance Criteria

- ✅ Identical behavior to Construction module
- ✅ Uses correct module constant ('REPAIRS')
- ✅ All BU acceptance criteria met

---

## PHASE BW: FIX SUBMIT AUTHORIZATION (UNIVERSITY OPS) [CRITICAL]

**Status:** ⏳ PENDING
**Priority:** P0 — CROSS-MODULE CONSISTENCY
**Research Reference:** Section F.1
**Scope:** Backend — Identical fix to BU

### Problem Statement

Same bug as Construction and Repairs modules.

### Required Changes

**File:** `pmo-backend/src/university-operations/university-operations.service.ts`

**Location:** Line 389-403 (`submitForReview` method)

**Apply identical fix as Phase BU:**
Replace `operation.assigned_to === userId` with `await this.isUserAssignedToRecord(id, userId)`

**Note:** University Ops uses module constant `'UNIVERSITY_OPERATIONS'`.

### Verification

Same test matrix as BU1-BU5 but for University Operations module.

### Acceptance Criteria

- ✅ Identical behavior to Construction and Repairs modules
- ✅ Uses correct module constant ('UNIVERSITY_OPERATIONS')
- ✅ All BU acceptance criteria met

---

## PHASE BX: SUBMIT AUTHORIZATION REGRESSION TESTING [CRITICAL]

**Status:** ⏳ PENDING
**Priority:** P0 — VALIDATION
**Research Reference:** Section E, F
**Scope:** Full-stack — Comprehensive validation

### Objective

Verify submit authorization works correctly across all modules with no regressions.

### Test Matrix

**Cross-Module Consistency:**

| Test | Module | Actor | Assignment Method | Status | Expected |
|------|--------|-------|-------------------|--------|----------|
| BX1 | COI | Creator | N/A | DRAFT | ✅ Submit |
| BX2 | COI | Multi-assigned user | Junction table | DRAFT | ✅ Submit |
| BX3 | COI | Unassigned user | N/A | DRAFT | ❌ 403 |
| BX4 | Repairs | Creator | N/A | DRAFT | ✅ Submit |
| BX5 | Repairs | Multi-assigned user | Junction table | DRAFT | ✅ Submit |
| BX6 | Repairs | Unassigned user | N/A | DRAFT | ❌ 403 |
| BX7 | Univ Ops | Creator | N/A | DRAFT | ✅ Submit |
| BX8 | Univ Ops | Multi-assigned user | Junction table | DRAFT | ✅ Submit |
| BX9 | Univ Ops | Unassigned user | N/A | DRAFT | ❌ 403 |

**State Machine Validation:**

| Test | Status | Action | Expected |
|------|--------|--------|----------|
| BX10 | DRAFT | Submit | ✅ → PENDING_REVIEW |
| BX11 | REJECTED | Submit (resubmit) | ✅ → PENDING_REVIEW |
| BX12 | PENDING_REVIEW | Submit | ❌ 400 Bad Request |
| BX13 | PUBLISHED | Submit | ❌ 400 Bad Request |

**Frontend-Backend Consistency:**

| Test | Description | Expected |
|------|-------------|----------|
| BX14 | Frontend shows "Submit" button | Backend allows action |
| BX15 | Frontend hides "Submit" button | Backend denies action |

### Verification Method

**Automated Testing:**
Create test script: `pmo-backend/scripts/test-submit-authorization.js`

**Manual Testing:**
- Login as creator
- Login as assigned user
- Login as unassigned user
- Test all three modules

### Acceptance Criteria

- ✅ All 15 tests pass
- ✅ Zero regressions from previous behavior
- ✅ Frontend-backend consistency verified
- ✅ State machine integrity preserved

---

## PHASE BY: ADD USERNAME EDIT CAPABILITY [HIGH PRIORITY]

**Status:** ⏳ PENDING
**Priority:** P1 — ADMIN PROFILE MANAGEMENT
**Research Reference:** Section C, D.1
**Scope:** Backend — DTO + Service update

### Problem Statement

Username cannot be updated by Admin/SuperAdmin, requiring manual database edits for corrections.

### Required Changes

**File 1:** `pmo-backend/src/users/dto/update-user.dto.ts`

**Add username field with validation:**
```typescript
@IsOptional()
@IsString()
@MinLength(3)
@MaxLength(100)
@Matches(/^[a-z0-9._-]+$/, {
  message: 'Username must be lowercase and contain only letters, numbers, dots, underscores, or dashes',
})
username?: string;
```

**File 2:** `pmo-backend/src/users/users.service.ts`

**Location:** `update()` method (line 297-350)

**Add after other field updates (line ~316):**
```typescript
if (dto.username !== undefined) {
  // Check uniqueness
  const usernameCheck = await this.db.query(
    'SELECT id FROM users WHERE username = $1 AND id != $2 AND deleted_at IS NULL',
    [dto.username, id],
  );
  if (usernameCheck.rowCount > 0) {
    throw new ConflictException('Username already exists');
  }

  updates.push(`username = $${paramIndex++}`);
  values.push(dto.username);

  this.logger.log(`USER_USERNAME_CHANGED: id=${id}, old=${existing.rows[0].username}, new=${dto.username}, by=${adminId}`);
}
```

**File 3:** Enhance query at line 280 to fetch current username for logging:
```typescript
const existing = await this.db.query(
  `SELECT id, rank_level, username FROM users WHERE id = $1 AND deleted_at IS NULL`,
  [id],
);
```

### Security Validation

**Rank-Based Permission:**
- ✅ Already enforced via `canModifyUser()` check (line 291-295)
- Admin cannot modify equal/higher rank users
- SuperAdmin can modify any user

**Uniqueness Enforcement:**
- ✅ Query checks for conflicts before update
- ✅ Database constraint prevents duplicates

### Verification

**Test Scenarios:**

| Test | Actor | Target | Action | Expected |
|------|-------|--------|--------|----------|
| BY1 | SuperAdmin | Any user | Change username | ✅ Success |
| BY2 | Admin | Lower rank | Change username | ✅ Success |
| BY3 | Admin | Equal rank | Change username | ❌ 403 Forbidden |
| BY4 | Admin | Any user | Duplicate username | ❌ 409 Conflict |
| BY5 | User | Self | Change username | ❌ Field ignored (not self-editable) |

**Audit Verification:**
```bash
# Check logs for username change
grep "USER_USERNAME_CHANGED" logs/application.log
```

### Acceptance Criteria

- ✅ Username can be updated via PATCH /users/:id
- ✅ Rank-based permission enforced
- ✅ Uniqueness constraint enforced
- ✅ Format validation enforced
- ✅ Audit log generated with old and new values

---

## PHASE BZ: ADD EMAIL EDIT CAPABILITY [HIGH PRIORITY]

**Status:** ⏳ PENDING
**Priority:** P1 — ADMIN PROFILE MANAGEMENT
**Research Reference:** Section C, D.2
**Scope:** Backend — DTO + Service update

### Problem Statement

Email cannot be updated by Admin/SuperAdmin, requiring manual database edits for corrections.

### Required Changes

**File 1:** `pmo-backend/src/users/dto/update-user.dto.ts`

**Remove email from OmitType exclusion:**

**Current (Line 5):**
```typescript
export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['email', 'password'])) {
```

**Updated:**
```typescript
export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password'])) {
```

**Result:** Email field now available with CreateUserDto validation:
- `@IsEmail()`
- `@IsNotEmpty()`

**File 2:** `pmo-backend/src/users/users.service.ts`

**Location:** `update()` method (after username update from Phase BY)

**Add email update logic:**
```typescript
if (dto.email !== undefined) {
  // Check uniqueness
  const emailCheck = await this.db.query(
    'SELECT id FROM users WHERE email = $1 AND id != $2 AND deleted_at IS NULL',
    [dto.email, id],
  );
  if (emailCheck.rowCount > 0) {
    throw new ConflictException('Email already exists');
  }

  updates.push(`email = $${paramIndex++}`);
  values.push(dto.email);

  this.logger.log(`USER_EMAIL_CHANGED: id=${id}, old=${existing.rows[0].email}, new=${dto.email}, by=${adminId}`);
}
```

**File 3:** Enhance query at line 280 to fetch current email for logging:
```typescript
const existing = await this.db.query(
  `SELECT id, rank_level, username, email FROM users WHERE id = $1 AND deleted_at IS NULL`,
  [id],
);
```

### Security Validation

**Rank-Based Permission:**
- ✅ Same as username (enforced via `canModifyUser()`)

**Uniqueness Enforcement:**
- ✅ Query checks for conflicts
- ✅ Database constraint prevents duplicates

### Verification

Same test matrix as BY1-BY5 but for email field.

### Acceptance Criteria

- ✅ Email can be updated via PATCH /users/:id
- ✅ Rank-based permission enforced
- ✅ Uniqueness constraint enforced
- ✅ Email format validation enforced
- ✅ Audit log generated with old and new values

---

## PHASE CA: ENHANCED AUDIT LOGGING [HIGH PRIORITY]

**Status:** ⏳ PENDING
**Priority:** P1 — SECURITY GOVERNANCE
**Research Reference:** Section E.1, E.2
**Scope:** Backend — Logging enhancement

### Problem Statement

Current audit logging is basic console output with inconsistent format. Critical actions need structured logging for security audit.

### Required Enhancements

**Structured Log Format:**

```typescript
// OLD (inconsistent)
this.logger.log(`USER_PASSWORD_RESET: id=${userId}, by=${adminId}`);

// NEW (structured)
this.logger.log({
  action: 'USER_PASSWORD_RESET',
  userId: userId,
  actorId: adminId,
  timestamp: new Date().toISOString(),
  metadata: { bypass_used: true }
});
```

### Target Actions

**File:** `pmo-backend/src/users/users.service.ts`

| Action | Line | Current Log | Enhanced Log |
|--------|------|-------------|--------------|
| Password reset | 543 | Basic | Add bypass_used flag |
| Username change | NEW | N/A | Add old/new values |
| Email change | NEW | N/A | Add old/new values |
| Rank change | ~337 | Basic | Add old/new rank |

### Implementation

**Create logger utility:**

**File:** `pmo-backend/src/common/utils/audit-logger.ts` (NEW)
```typescript
export class AuditLogger {
  static logProfileChange(
    action: string,
    userId: string,
    actorId: string,
    oldValue: any,
    newValue: any,
    metadata?: Record<string, any>
  ) {
    return {
      action,
      userId,
      actorId,
      timestamp: new Date().toISOString(),
      oldValue,
      newValue,
      ...metadata
    };
  }
}
```

**Update users.service.ts:**
```typescript
import { AuditLogger } from '../common/utils/audit-logger';

// In update() method
if (dto.username !== undefined) {
  // ... validation ...
  this.logger.log(AuditLogger.logProfileChange(
    'USER_USERNAME_CHANGED',
    id,
    adminId,
    existing.rows[0].username,
    dto.username
  ));
}
```

### Verification

**Log Output Validation:**
```bash
# Check structured logs
cat logs/application.log | grep "USER_USERNAME_CHANGED"
# Should show JSON with all required fields
```

**Security Audit:**
```bash
# Verify all critical actions logged
grep -E "USER_(USERNAME|EMAIL|RANK)_CHANGED|PASSWORD_RESET" logs/application.log
```

### Acceptance Criteria

- ✅ All profile changes logged with structured format
- ✅ Old and new values captured
- ✅ Actor ID captured
- ✅ Timestamp in ISO format
- ✅ Logs are parseable as JSON (optional but recommended)

---

## REGRESSION TEST MATRIX

### Submit Authorization Tests

| ID | Module | Scenario | Expected | Status |
|----|--------|----------|----------|--------|
| R1 | COI | Creator submits DRAFT | ✅ 200 OK | ⬜ |
| R2 | COI | Assigned user (junction) submits | ✅ 200 OK | ⬜ |
| R3 | COI | Unassigned user submits | ❌ 403 | ⬜ |
| R4 | Repairs | Creator submits DRAFT | ✅ 200 OK | ⬜ |
| R5 | Repairs | Assigned user (junction) submits | ✅ 200 OK | ⬜ |
| R6 | Univ Ops | Creator submits DRAFT | ✅ 200 OK | ⬜ |
| R7 | Univ Ops | Assigned user (junction) submits | ✅ 200 OK | ⬜ |
| R8 | All | Submit PENDING_REVIEW | ❌ 400 | ⬜ |
| R9 | All | Submit PUBLISHED | ❌ 400 | ⬜ |

### Profile Edit Tests

| ID | Action | Actor | Target | Expected | Status |
|----|--------|-------|--------|----------|--------|
| R10 | Update username | SuperAdmin | Any | ✅ 200 OK | ⬜ |
| R11 | Update username | Admin | Lower rank | ✅ 200 OK | ⬜ |
| R12 | Update username | Admin | Equal rank | ❌ 403 | ⬜ |
| R13 | Update username (duplicate) | SuperAdmin | Any | ❌ 409 | ⬜ |
| R14 | Update email | SuperAdmin | Any | ✅ 200 OK | ⬜ |
| R15 | Update email | Admin | Lower rank | ✅ 200 OK | ⬜ |
| R16 | Update email (duplicate) | SuperAdmin | Any | ❌ 409 | ⬜ |

### State Machine Integrity

| ID | Transition | Method | Expected | Status |
|----|------------|--------|----------|--------|
| R17 | DRAFT → PENDING_REVIEW | Submit | ✅ Valid | ⬜ |
| R18 | REJECTED → PENDING_REVIEW | Resubmit | ✅ Valid | ⬜ |
| R19 | PENDING_REVIEW → PUBLISHED | Publish (Admin) | ✅ Valid | ⬜ |
| R20 | PENDING_REVIEW → REJECTED | Reject (Admin) | ✅ Valid | ⬜ |
| R21 | PENDING_REVIEW → DRAFT | Withdraw | ✅ Valid | ⬜ |

---

## SECURITY HARDENING CHECKLIST

### Authorization

- [ ] Submit authorization uses junction table (not deprecated column)
- [ ] Rank-based permission enforced for profile edits
- [ ] No privilege escalation possible
- [ ] State machine transitions validated

### Data Integrity

- [ ] Username uniqueness enforced
- [ ] Email uniqueness enforced
- [ ] Format validation applied
- [ ] No SQL injection vulnerabilities

### Audit & Compliance

- [ ] Username changes logged
- [ ] Email changes logged
- [ ] Password resets logged
- [ ] Actor ID captured in all logs
- [ ] Timestamp captured in all logs

### Regression Prevention

- [ ] Existing submit functionality preserved
- [ ] Creator submission works
- [ ] State machine integrity maintained
- [ ] Frontend-backend consistency verified

---

## EXECUTION ORDER

### Critical Path (Day 1)

1. **Phase BU** → Fix Construction submit authorization (1 hour)
2. **Phase BV** → Fix Repairs submit authorization (30 min)
3. **Phase BW** → Fix University Ops submit authorization (30 min)
4. **Phase BX** → Regression testing (1 hour)

**Day 1 Total:** 3 hours

### High Priority (Day 2)

5. **Phase BY** → Add username edit capability (2 hours)
6. **Phase BZ** → Add email edit capability (2 hours)
7. **Phase CA** → Enhanced audit logging (1 hour)

**Day 2 Total:** 5 hours

**Combined Total:** 8 hours

---

## DEFERRED ENHANCEMENTS

**Not in Immediate Scope (Post-March):**

1. **Rank-Based Submit Authority**
   - Allow Directors to submit drafts in their office without assignment
   - Requires office hierarchy data model
   - Effort: 8-12 hours

2. **Database Audit Table**
   - Persistent audit_log table for compliance
   - Queryable history of all profile changes
   - Effort: 4-6 hours

3. **Email Verification Workflow**
   - Send verification email on email change
   - Token-based confirmation
   - Effort: 6-8 hours

4. **Self-Service Password Reset**
   - Allow users to reset own password via email
   - Requires email infrastructure
   - Effort: 8-10 hours

---

## SUCCESS CRITERIA

### Minimum Viable Fix (Critical Path Only)

- ✅ Submit authorization works for junction-table-assigned users
- ✅ All three modules behave identically
- ✅ Zero regressions in state machine
- ✅ All BX tests pass

**Production Ready:** YES (after critical path)

### Recommended Production Deployment

- ✅ Critical path complete (BU-BX)
- ✅ Profile edits functional (BY-BZ)
- ✅ Audit logging enhanced (CA)

**Production Ready:** YES (after all phases)

---

## RISK MITIGATION

| Risk | Mitigation | Verification |
|------|------------|--------------|
| Break existing submit | Phase BX regression tests | All R1-R9 pass |
| Privilege escalation | Rank-based permission check | R12 test |
| Username/email conflicts | Uniqueness validation | R13, R16 tests |
| State machine bypass | Existing validation preserved | R17-R21 tests |
| Audit trail gaps | Enhanced logging | Log output review |

---

## NEXT STEPS AFTER PLAN APPROVAL

1. User reviews and approves this plan
2. Execute Phase 3 Implementation (BU-CA)
3. Run regression test matrix
4. Deploy to staging
5. Manual acceptance testing
6. Production deployment

---

## ACE ENFORCEMENT ✅

- ✅ Research → Plan separation maintained
- ✅ No implementation code in research document
- ✅ Deterministic reasoning applied
- ✅ Backend-first enforcement
- ✅ State machine integrity preserved
- ✅ Security hardening included
- ✅ Cross-module consistency enforced

---

## END OF PHASE 2 PLAN

**Status:** READY FOR APPROVAL

**Estimated Effort:** 8 hours (3 critical + 5 high priority)

**Blocking:** NO (can proceed in parallel with manual testing from previous phases)

**Next Phase:** Phase 3 Implementation (awaiting user approval)

