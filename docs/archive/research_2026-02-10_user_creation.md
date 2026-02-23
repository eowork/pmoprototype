# Research: User Creation Failure - Root Cause Analysis

**Document Version:** 1.0
**Date:** 2026-02-10
**Authority:** ACE Framework v2.4 - Phase 1 Research
**Status:** COMPLETE - Ready for Phase 2 Planning

---

## 1. ROOT CAUSE ANALYSIS

### 1.1 Confirmed Error State

**Error:** `null value in column "username" of relation "users" violates not-null constraint`
**Endpoint:** `POST /api/users`
**HTTP Status:** 500 Internal Server Error

### 1.2 Data Flow Breakdown

The failure occurs due to a **contract breach** between four system layers:

```
LAYER 1: DATABASE SCHEMA
├── Migration 005 added: username VARCHAR(100) NOT NULL
├── Constraint: users_username_unique UNIQUE
└── Index: idx_users_username, idx_users_username_lower

LAYER 2: BACKEND DTO (create-user.dto.ts)
├── email: string (required)
├── password: string (required)
├── first_name: string (required)
├── last_name: string (required)
├── phone?: string (optional)
├── avatar_url?: string (optional)
├── is_active?: boolean (optional)
├── metadata?: object (optional)
└── username: NOT DEFINED  ← CONTRACT BREACH

LAYER 3: BACKEND SERVICE (users.service.ts:131-134)
├── INSERT INTO users (email, password_hash, first_name, last_name, phone, avatar_url, is_active, metadata)
└── username: NOT INCLUDED  ← CONTRACT BREACH

LAYER 4: FRONTEND PAYLOAD (users/new.vue:89-96)
├── email: form.value.email
├── first_name: form.value.first_name
├── last_name: form.value.last_name
├── phone: form.value.phone || undefined
├── password: form.value.password
├── is_active: form.value.is_active
└── username: NOT INCLUDED  ← CONTRACT BREACH
```

### 1.3 Root Cause Determination

**Primary Cause:** Frontend payload omission (line 89-96 in `users/new.vue`)

The frontend form collects username (line 18) and has auto-generation logic (lines 44-51), but the `handleSubmit()` function explicitly excludes `username` from the payload object.

**Secondary Cause:** Backend DTO/Service not updated after Migration 005

Migration 005 (`005_add_username_column.sql`) added the `username` column with `NOT NULL` constraint, but:
- `CreateUserDto` was not updated to include username field
- `UsersService.create()` INSERT query was not updated to include username column

**Tertiary Cause:** No integration test coverage for user creation flow

The gap between database schema and application code went undetected due to lack of end-to-end testing.

### 1.4 Governance Violation

**Violated Principle:** Schema-Code Synchronization

When database migrations add required columns, corresponding application code (DTOs, services, frontend) must be updated atomically. This was not enforced.

**ACE Framework Gap:** No formal checkpoint requiring schema-code alignment verification after migrations.

---

## 2. USER CREATION GOVERNANCE FIX

### 2.1 Conceptual Fix Strategy

**Option A: Frontend Sends Username (RECOMMENDED)**
- Add `username` to frontend payload
- Add `username` to backend DTO with validation
- Add `username` to backend INSERT query
- Leverage existing auto-generation UI

**Option B: Backend Auto-Generates Username**
- Remove username from frontend form
- Backend generates from first_name.last_name
- Handle duplicates with numeric suffix
- Simpler UX but less control

**Recommendation:** Option A

Rationale:
- UI already has username field and auto-generation
- User can customize before submission
- Aligns with existing UI design intent
- Provides visibility of what username will be assigned

### 2.2 Validation Responsibility

| Layer | Responsibility |
|-------|----------------|
| Frontend | Required field validation, format validation (lowercase, alphanumeric, dots, dashes) |
| Backend DTO | @IsString, @IsNotEmpty, @Matches for format, @MaxLength(100) |
| Backend Service | Duplicate check before INSERT, sanitization |
| Database | NOT NULL, UNIQUE constraint as final safety net |

**Defense in Depth:** All four layers must validate. Frontend for UX, backend for security, database for integrity.

### 2.3 Kickoff-Safe Approach

**Phase 1: Immediate Fix (1-2 hours)**
1. Add `username` field to `CreateUserDto` with validation decorators
2. Add `username` to `UsersService.create()` INSERT query
3. Add `username` to frontend payload in `handleSubmit()`
4. Add duplicate username check in service (like email check)

**Phase 2: Verification (30 minutes)**
1. Test user creation via UI
2. Verify username in database
3. Test login with username
4. Test duplicate username rejection

---

## 3. SUPERADMIN GOVERNANCE MODEL

### 3.1 Current Implementation Analysis

**Schema:** `user_roles.is_superadmin BOOLEAN NOT NULL DEFAULT FALSE`

**Assignment Path:**
```
UsersService.assignRole(userId, { role_id, is_superadmin: true }, adminId)
  → INSERT INTO user_roles (user_id, role_id, is_superadmin, assigned_by, created_by)
```

**Current Behavior:**
- SuperAdmin is a flag on user_role assignment, not a standalone role
- Any admin with role assignment permission can set `is_superadmin: true`
- No explicit restriction on self-assignment (governance gap)

### 3.2 Bootstrap Scenario (First SuperAdmin)

**Current State:** No bootstrap mechanism exists.

**Problem:** If no SuperAdmin exists, no one can assign SuperAdmin.

**Required Solution:** Database-level bootstrap script

```sql
-- Bootstrap first SuperAdmin (run once during initial deployment)
INSERT INTO user_roles (user_id, role_id, is_superadmin, assigned_by, created_by)
SELECT
  u.id,
  r.id,
  TRUE,
  u.id,  -- Self-assigned (bootstrap only)
  u.id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'admin@carsu.edu.ph'  -- Designated bootstrap admin
AND r.name = 'Admin'
AND NOT EXISTS (
  SELECT 1 FROM user_roles WHERE is_superadmin = TRUE
);
```

### 3.3 Governance Rules (RECOMMENDED)

**Rule 1: SuperAdmin Assignment Requires Existing SuperAdmin**
- Only a user with `is_superadmin = TRUE` can assign `is_superadmin` to others
- Exception: Bootstrap scenario (first user, scripted)

**Rule 2: No Self-Assignment**
- A user cannot assign `is_superadmin` to themselves
- Backend must validate: `assigningUserId !== targetUserId` when `is_superadmin = TRUE`

**Rule 3: Audit Trail**
- All SuperAdmin assignments must be logged with timestamp, assigner, and target
- Current implementation logs via `this.logger.log()` - sufficient for now

**Rule 4: Minimum SuperAdmin Count**
- System should have at least one SuperAdmin at all times
- Prevent removal of last SuperAdmin (add check in `removeRole`)

### 3.4 Implementation Priority

| Task | Priority | Effort |
|------|----------|--------|
| Bootstrap script for first SuperAdmin | MUST FIX | 30 min |
| Prevent self-assignment of SuperAdmin | SHOULD FIX | 1 hour |
| Prevent removal of last SuperAdmin | SHOULD FIX | 1 hour |
| SuperAdmin-only restriction for is_superadmin assignment | SHOULD FIX | 1 hour |

---

## 4. USER PROFILE DATA MODEL RECOMMENDATION

### 4.1 Requested Fields Analysis

| Field | Required for Kickoff | Location | Security | Effort |
|-------|---------------------|----------|----------|--------|
| ID Number | NO | users table | MEDIUM - PII | 1 hour |
| Biometric Number | NO | users table | HIGH - Sensitive PII | 2 hours |
| Birthdate | NO | users table | MEDIUM - PII | 30 min |
| Position/Rank | YES | users table | LOW | 30 min |
| Profile Photo | NO | users table (URL) + file storage | LOW | 4-6 hours |

### 4.2 Field Recommendations

**4.2.1 Position/Rank (SHOULD FIX for Kickoff)**

**Rationale:** Required for audit trail clarity and role context in government MIS.

**Schema:**
```sql
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS position VARCHAR(100),
  ADD COLUMN IF NOT EXISTS department VARCHAR(100);
```

**UI:** Add to user create/edit forms.

**4.2.2 ID Number (DEFERRED)**

**Rationale:** Not required for core functionality. Can be added post-kickoff.

**Schema:** `employee_id VARCHAR(50)` in users table.

**Security:** Must be masked in API responses except for authorized viewers.

**4.2.3 Biometric Number (DEFERRED)**

**Rationale:** High sensitivity, requires compliance review.

**Schema:** Should be in separate table with encryption.

```sql
CREATE TABLE user_biometrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  biometric_type VARCHAR(50),  -- 'fingerprint', 'facial', etc.
  biometric_hash BYTEA,  -- Encrypted, never store raw
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP
);
```

**Security Requirements:**
- Never expose raw biometric data via API
- Hash with strong algorithm (bcrypt or argon2)
- UI toggle: show/hide (shows masked value, e.g., "****1234")
- Audit all access to biometric data

**4.2.4 Birthdate (DEFERRED)**

**Rationale:** Not required for core functionality.

**Schema:** `birthdate DATE` in users table.

**UI:** Date picker in profile.

**4.2.5 Profile Photo (DEFERRED)**

**Rationale:** Requires file upload infrastructure.

**Current State:** `avatar_url` field exists but no upload mechanism.

**Requirements:**
- File storage (local or S3-compatible)
- Image processing (resize, format validation)
- URL generation
- File size limits (recommend 2MB max)

**Effort:** 4-6 hours including backend, frontend, and storage integration.

### 4.3 Implementation Phases

**Phase 1 (Kickoff - MUST FIX):**
- Position/Rank field (schema + UI)
- Department field (schema + UI)

**Phase 2 (Post-Kickoff - SHOULD FIX):**
- Employee ID field
- Birthdate field
- Profile photo upload

**Phase 3 (Future - DEFERRED):**
- Biometric data (requires security review)
- Full profile management page

---

## 5. DUMMY USER STRATEGY

### 5.1 Purpose

Dummy/test users required for:
- Permission testing (different roles)
- CRUD operation testing
- UI state testing (locked accounts, inactive users)

### 5.2 Creation Method

**Recommended: Database Seeder Script (Admin-only)**

```sql
-- Create test users for permission testing
-- Run ONLY in development/staging environments

INSERT INTO users (email, username, password_hash, first_name, last_name, is_active)
VALUES
  ('test.viewer@example.com', 'test.viewer', '$2b$12$...', 'Test', 'Viewer', TRUE),
  ('test.staff@example.com', 'test.staff', '$2b$12$...', 'Test', 'Staff', TRUE),
  ('test.admin@example.com', 'test.admin', '$2b$12$...', 'Test', 'Admin', TRUE),
  ('test.locked@example.com', 'test.locked', '$2b$12$...', 'Test', 'Locked', FALSE)
ON CONFLICT (email) DO NOTHING;

-- Assign roles
INSERT INTO user_roles (user_id, role_id, is_superadmin)
SELECT u.id, r.id, FALSE
FROM users u, roles r
WHERE u.email = 'test.viewer@example.com' AND r.name = 'Viewer'
ON CONFLICT DO NOTHING;
-- (repeat for other test users)
```

### 5.3 Labeling and Restrictions

**Naming Convention:**
- Email: `test.*@example.com`
- Username: `test.*`
- First Name: `Test`
- Last Name: Role name

**Restrictions:**
- Flag in metadata: `{ "is_test_user": true }`
- Exclude from production user counts
- Prevent in production via environment check
- Auto-cleanup script for staging reset

### 5.4 UI-Driven Creation (Alternative)

**Pros:**
- Uses actual UI flow, catches UI bugs
- No script maintenance

**Cons:**
- Manual, time-consuming
- Inconsistent data

**Recommendation:** Seeder script for repeatable baseline, UI for edge case testing.

---

## 6. SCOPE CONTROL

### 6.1 MUST FIX Before Kickoff (P0)

| Item | Effort | Owner |
|------|--------|-------|
| Fix username omission in frontend payload | 15 min | Frontend |
| Add username to CreateUserDto | 30 min | Backend |
| Add username to UsersService.create() INSERT | 15 min | Backend |
| Add duplicate username check | 15 min | Backend |
| Bootstrap script for first SuperAdmin | 30 min | DevOps |
| Test user creation end-to-end | 30 min | QA |

**Total P0 Effort:** 2-3 hours

### 6.2 SHOULD FIX If Time Allows (P1)

| Item | Effort | Owner |
|------|--------|-------|
| Position/Department fields in users table | 1 hour | Backend |
| Position/Department in UI forms | 1 hour | Frontend |
| Prevent SuperAdmin self-assignment | 1 hour | Backend |
| Prevent removal of last SuperAdmin | 1 hour | Backend |
| SuperAdmin-only restriction for is_superadmin assignment | 1 hour | Backend |
| Dummy user seeder script | 1 hour | DevOps |

**Total P1 Effort:** 6-7 hours

### 6.3 DEFERRED Post-Kickoff (P2+)

| Item | Priority | Rationale |
|------|----------|-----------|
| Employee ID field | P2 | Not blocking |
| Birthdate field | P2 | Not blocking |
| Profile photo upload | P2 | Requires file storage setup |
| Biometric data | P3 | Requires security review |
| Full profile management page | P3 | UX enhancement |

---

## 7. SUMMARY

### 7.1 Immediate Actions Required

1. **Fix Username Bug** - Frontend payload must include `username`
2. **Update Backend DTO** - Add `username` with validation
3. **Update Backend Service** - Add `username` to INSERT query
4. **Create Bootstrap Script** - First SuperAdmin assignment

### 7.2 Key Findings

- Root cause: Frontend payload omission (line 89-96 in new.vue)
- Secondary cause: Backend DTO/Service not synchronized with Migration 005
- Governance gap: No schema-code sync verification process
- Bootstrap gap: No mechanism for first SuperAdmin

### 7.3 Compliance Notes

- Username is required for authentication (login by email OR username)
- SuperAdmin governance aligns with government least-privilege requirements
- Biometric data handling requires future security review
- All changes must maintain audit trail integrity

---

**END OF RESEARCH DOCUMENT**

*Next Step: Proceed to Phase 2 (Plan) with implementation tasks based on this analysis.*
