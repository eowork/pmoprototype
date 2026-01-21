# ACE Framework: Auth Scope Expansion Research
**Version:** 2.5.0  
**Date:** 2026-01-21  
**Governance:** SOLID, DRY, YAGNI, KISS, TDA, MIS  
**Authority:** Senior PostgreSQL & Backend Architect  
**Status:** Phase 1 RESEARCH ✅ COMPLETE | Phase 2 PLAN UPDATE (in progress)

---

## Executive Summary

**Objective:** Expand authentication to support:
- ✅ Email + password (CURRENT - production-ready)
- ⏳ Username + password (NEW - requires schema migration)
- ⏳ Google OAuth (NEW - requires OAuth implementation)

**Governance Mode:** ACE Framework Phase 1 RESEARCH only (NO implementation)

**Key Findings:**
- Current schema (`pmo_schema_pg.sql` v2.3.0) does NOT include `username` column
- Backend auth logic hardcoded for email-only lookup  
- **6 BLOCKING gaps** identified for username support
- Schema drift detected between published schema and migrated state

**Deliverables:**
1. ✅ Canonical schema v2 design (`pmo_schema_pg_v2.sql`)
2. ✅ Incremental migration SQL (`pmo_schema_pg_insert_v2.sql`)
3. ✅ Backend alignment requirements (NO implementation)
4. ✅ MIS & software engineering compliance analysis
5. ⏳ Plan update (`plan_active.md`)

---

## Part A: Canonical Schema Completion Strategy

### Problem Statement

**Schema Drift Identified:**

| Schema Version | State | Includes `google_id` | Includes `username` |
|----------------|-------|----------------------|---------------------|
| `pmo_schema_pg.sql` v2.3.0 (published) | ❌ INCOMPLETE | NO | NO |
| Database (after migration) | ✅ ACTUAL | YES (via `pmo_migration_google_oauth.sql`) | NO |
| Required for auth expansion | 🎯 TARGET | YES | YES |

**MIS Concern:** Developers referencing `pmo_schema_pg.sql` see incomplete schema, leading to:
- Incorrect fresh database setups
- Documentation misalignment
- Review/audit confusion

### Solution: Canonical Reference Schema v2

**Purpose:** Create **pmo_schema_pg_v2.sql** as authoritative documentation:
- ✓ Contains ALL columns (original + `google_id` + `username`)
- ✓ Self-contained and complete
- ✓ Used for fresh installs, documentation, audits
- ✓ **FORMAL REFERENCE ONLY** (not for already-migrated databases)

### v2 Schema Changes (users table)

**Current Schema (pmo_schema_pg.sql v2.3.0 lines 54-74):**
```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,           -- ✓ EXISTS
  password_hash VARCHAR(255) NOT NULL,          -- ✓ EXISTS
  -- ... other fields ...
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

**v2 Schema (pmo_schema_pg_v2.sql) - ADD:**
```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(100) UNIQUE,                 -- ← NEW (line 57)
  password_hash VARCHAR(255) NOT NULL,
  google_id VARCHAR(255) UNIQUE,                -- ← NEW (from migration)
  -- ... other fields unchanged ...
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL;  -- ← NEW
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;  -- ← NEW
```

### File Location & Header

**Path:** `database/database draft/2026_01_21/pmo_schema_pg_v2.sql`

**Header:**
```sql
-- ============================================================
-- PMO Dashboard - PostgreSQL Schema (CANONICAL REFERENCE)
-- Version: 2.5.0
-- Date: 2026-01-21
-- Derived from: pmo_schema_pg.sql v2.3.0 + migrations
-- Authoritative: This file reflects COMPLETE schema state
-- Purpose: Documentation, reviews, fresh installs
-- ============================================================
-- ⚠️ DO NOT run this on an already-migrated database.
-- ⚠️ Use pmo_schema_pg_insert_v2.sql for incremental updates.
-- ============================================================
```

---

## Part B: Incremental Migration Strategy (Migrated Database)

### Rationale

**Problem:** Database already migrated with:
- ✅ `pmo_schema_pg.sql` v2.3.0 (initial schema)
- ✅ `pmo_migration_google_oauth.sql` v2.4.0 (`google_id` added)

**Cannot re-run full schema because:**
- Would drop existing data
- Would violate referential integrity
- Would disrupt live system

**Solution:** Incremental migration file for username column only.

### Migration SQL

**File:** `database/database draft/2026_01_21/pmo_schema_pg_insert_v2.sql`

```sql
-- ============================================================
-- PMO Dashboard - Migration: Add Username Support
-- Version: 2.5.0
-- Date: 2026-01-21
-- Execute AFTER pmo_schema_pg.sql and pmo_migration_google_oauth.sql
-- Purpose: Add username column for flexible authentication
-- ============================================================

-- Step 1: Add username column for username + password authentication
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;

-- Step 2: Create partial index for username lookups (NULL-safe)
CREATE INDEX IF NOT EXISTS idx_users_username 
  ON users(username) 
  WHERE username IS NOT NULL;

-- Step 3: Add constraint check: username follows naming convention
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS chk_username_format 
  CHECK (username IS NULL OR username ~ '^[a-z0-9_]{3,100}$');

-- Step 4: Verify column added
SELECT column_name, data_type, is_nullable, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'username';

-- Expected result:
-- column_name | data_type         | is_nullable | character_maximum_length
-- username    | character varying | YES         | 100
```

### Execution Sequence

**For FRESH installs:**
```bash
psql -d pmo_dashboard -f "database/database draft/2026_01_21/pmo_schema_pg_v2.sql"
```

**For ALREADY-MIGRATED databases:**
```bash
psql -d pmo_dashboard -f "database/database draft/2026_01_21/pmo_schema_pg_insert_v2.sql"
```

---

## Part C: Backend Alignment Requirements (NO IMPLEMENTATION)

### Current State Analysis

#### 1. LoginDto (auth/dto/login.dto.ts)

**Current:**
```typescript
export class LoginDto {
  @IsEmail()           // ← HARDCODED EMAIL VALIDATION
  @IsNotEmpty()
  email: string;       // ← HARDCODED FIELD NAME

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
```

**Required Change:**
```typescript
export class LoginDto {
  @IsString()          // ← FLEXIBLE (email OR username)
  @IsNotEmpty()
  identifier: string;  // ← RENAMED from 'email'

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
```

#### 2. AuthService (auth/auth.service.ts)

**Current Method (lines 21-29):**
```typescript
async validateUser(email: string, password: string): Promise<any> {
  const result = await this.db.query(
    `SELECT u.id, u.email, u.password_hash, u.is_active, u.google_id,
            u.failed_login_attempts, u.account_locked_until,
            u.first_name, u.last_name
     FROM users u
     WHERE u.email = $1 AND u.deleted_at IS NULL`,  // ← EMAIL-ONLY
    [email],
  );
  // ...
}
```

**Required Method:**
```typescript
async validateUser(identifier: string, password: string): Promise<any> {
  // Detect if input is email or username
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  
  // Use allowlist to prevent SQL injection
  const allowedFields = { email: 'email', username: 'username' };
  const field = allowedFields[isEmail ? 'email' : 'username'];
  
  const result = await this.db.query(
    `SELECT u.id, u.email, u.username, u.password_hash, u.is_active, u.google_id,
            u.failed_login_attempts, u.account_locked_until,
            u.first_name, u.last_name
     FROM users u
     WHERE u.${field} = $1 AND u.deleted_at IS NULL`,  // ← CONDITIONAL
    [identifier],
  );
  // ... rest unchanged
}
```

**⚠️ SQL Injection Risk Mitigation:**
- **NEVER** use string interpolation for field names
- **ALWAYS** use allowlist pattern as shown above
- Field name comes from trusted source (code), not user input

#### 3. CreateUserDto (users/dto/create-user.dto.ts)

**Add Field:**
```typescript
@IsOptional()
@IsString()
@MinLength(3)
@MaxLength(100)
@Matches(/^[a-z0-9_]+$/, {
  message: 'Username must contain only lowercase letters, numbers, and underscores',
})
username?: string;  // ← OPTIONAL (backward compatibility)
```

#### 4. Seed Data (database/database draft/2026_01_12/pmo_seed_data.sql)

**Add usernames to test users:**
```sql
-- Assign usernames to existing users
UPDATE users SET username = 'admin' WHERE email = 'admin@test.com';
UPDATE users SET username = 'staff' WHERE email = 'staff@test.com';
UPDATE users SET username = 'pmo_user' WHERE email = 'user@test.com';
```

### Gap Summary

| Component | Current State | Required Change | Blocking |
|-----------|---------------|-----------------|----------|
| **Schema** | No `username` column | `ALTER TABLE` migration | ✅ YES |
| **Schema** | No `idx_users_username` | Create partial index | ✅ YES |
| **DTO** | `email: string` with `@IsEmail()` | `identifier: string` flexible | ✅ YES |
| **Service** | `WHERE u.email = $1` | Conditional field lookup | ✅ YES |
| **Validation** | Email format enforced | Email OR username accepted | ✅ YES |
| **Seed Data** | Users have emails only | Assign usernames | ✅ YES |

**Total:** 6 BLOCKING changes required

---

## Part D: MIS & Software Engineering Compliance

### SOLID Principles

| Principle | Application | Compliance |
|-----------|-------------|------------|
| **S** (Single Responsibility) | Auth service handles authentication only; user service handles CRUD | ✅ PASS |
| **O** (Open/Closed) | Flexible identifier lookup extends auth without modifying core logic | ✅ PASS |
| **L** (Liskov Substitution) | Email and username identifiers interchangeable in `validateUser()` | ✅ PASS |
| **I** (Interface Segregation) | `LoginDto` accepts either identifier type via single field | ✅ PASS |
| **D** (Dependency Inversion) | Auth logic depends on identifier abstraction, not concrete email type | ✅ PASS |

### DRY (Don't Repeat Yourself)

**Anti-Pattern (AVOID):**
```typescript
// ❌ BAD: Duplicate lookup logic
if (isEmail) {
  const user = await this.db.query('WHERE u.email = $1', [identifier]);
} else {
  const user = await this.db.query('WHERE u.username = $1', [identifier]);
}
```

**DRY Pattern (CORRECT):**
```typescript
// ✅ GOOD: Single query with conditional field
const field = isEmail ? 'email' : 'username';
const user = await this.db.query(`WHERE u.${field} = $1`, [identifier]);
```

### YAGNI (You Aren't Gonna Need It)

**Avoid Over-Engineering:**
- ❌ DO NOT implement: Phone number login, multiple OAuth providers, MFA (yet)
- ✅ DO implement: Username + password (explicitly requested)

### KISS (Keep It Simple, Stupid)

**Simplicity Checks:**
- ✅ Username is optional (backward compatible)
- ✅ Single identifier field (not separate email + username inputs)
- ✅ Conditional lookup (not complex OR queries with multiple indexes)
- ✅ Partial index on username (no NULL overhead)

### TDA (Tell, Don't Ask)

**Application:**
- ✅ Auth service **tells** database: "Find user by this identifier"
- ❌ NOT: Auth service **asks** database: "Is this email? Is this username?"

### MIS (Management Information Systems)

**Institutional Compliance:**

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| Schema auditability | Canonical v2 schema for documentation | ✅ |
| Zero downtime migrations | Incremental SQL for live systems | ✅ |
| Backward compatibility | Username optional, existing users unaffected | ✅ |
| No breaking changes | Existing email login continues to work | ✅ |
| Audit logging preserved | No PII in logs | ✅ |
| Beginner maintainability | Clear documentation, simple patterns | ✅ |

---

## Part E: Exclusive Summary Logs

### DONE (Phase 1 Research Complete)

| # | Task | Status | Date | Output |
|---|------|--------|------|--------|
| 1 | Schema analysis (current state) | ✅ DONE | 2026-01-21 | users table: NO username column |
| 2 | Backend auth logic analysis | ✅ DONE | 2026-01-21 | Email-only lookup hardcoded |
| 3 | DTO structure analysis | ✅ DONE | 2026-01-21 | `@IsEmail()` enforced |
| 4 | Gap identification | ✅ DONE | 2026-01-21 | 6 BLOCKING issues identified |
| 5 | Canonical schema v2 design | ✅ DONE | 2026-01-21 | `pmo_schema_pg_v2.sql` specified |
| 6 | Incremental migration SQL design | ✅ DONE | 2026-01-21 | `pmo_schema_pg_insert_v2.sql` specified |
| 7 | Backend alignment requirements | ✅ DONE | 2026-01-21 | DTO + service + validation changes |
| 8 | MIS & engineering compliance | ✅ DONE | 2026-01-21 | SOLID, DRY, YAGNI, KISS, TDA, MIS |
| 9 | Documentation (this file) | ✅ DONE | 2026-01-21 | `research_auth_expansion.md` |

### ACCEPTED AS DEFERRED

| # | Feature | Rationale | Target Phase |
|---|---------|-----------|--------------|
| 1 | Google OAuth | Requires OAuth setup + strategy implementation | Phase 3.3 |
| 2 | Multi-factor authentication (MFA) | Not startup-critical | Phase 4+ |
| 3 | Phone number login | YAGNI (not requested) | Backlog |
| 4 | Multiple OAuth providers | Over-engineering | Backlog |

### NEXT REQUIRED (Phase 2 Plan Update Only)

| # | Task | Type | Blocker | Estimated Effort |
|---|------|------|---------|------------------|
| 1 | Create `pmo_schema_pg_v2.sql` (canonical) | SQL | None | 10 minutes (copy + add 3 lines) |
| 2 | Create `pmo_schema_pg_insert_v2.sql` (migration) | SQL | None | 5 minutes (4 statements) |
| 3 | Update `plan_active.md` Phase 3.2 section | Planning | None | 5 minutes |
| 4 | Verify SQL syntax (dry run) | Validation | Task #2 | 5 minutes |

**TOTAL PHASE 2 EFFORT:** ~25 minutes (planning + SQL creation only)

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Username conflicts with existing emails | LOW | MEDIUM | Enforce different format (lowercase, no @) |
| SQL injection via dynamic field name | MEDIUM | **CRITICAL** | Use allowlist pattern (shown above) |
| Backward compatibility breaks | LOW | HIGH | Make username optional |
| Index overhead on NULL usernames | LOW | LOW | Use partial index (`WHERE username IS NOT NULL`) |
| User confusion between email/username | MEDIUM | LOW | Clear UI labels + validation messages |

---

## Testing Strategy (Phase 3.2 Implementation)

### Unit Tests Required

| Test Case | Input | Expected Output | Purpose |
|-----------|-------|-----------------|---------|
| Login with email | `admin@test.com` + password | JWT token | Backward compatibility |
| Login with username | `admin` + password | JWT token | New feature |
| Login with invalid identifier | `invalid` + password | 401 Unauthorized | Security |
| Login with wrong password | `admin` + wrong password | 401 Unauthorized | Security |
| Create user with username | CreateUserDto with username | User created | CRUD |
| Create user without username | CreateUserDto without username | User created | Backward compatibility |
| Duplicate username | Existing username | 409 Conflict | Uniqueness constraint |

### E2E Tests Required

| Test Case | Endpoint | Method | Expected Status |
|-----------|----------|--------|-----------------|
| Email login flow | `/api/auth/login` | POST | 200 OK |
| Username login flow | `/api/auth/login` | POST | 200 OK |
| Mixed login attempts | `/api/auth/login` | POST | 200 OK (both work) |
| Username in user creation | `/api/users` | POST | 201 Created |
| Username uniqueness | `/api/users` | POST | 409 Conflict |

---

## File Inventory

### To Be Created (Phase 2 - Planning Only)

| File | Purpose | Size | Status |
|------|---------|------|--------|
| `database/database draft/2026_01_21/pmo_schema_pg_v2.sql` | Canonical reference (complete) | ~55 KB | ⏳ NEXT |
| `database/database draft/2026_01_21/pmo_schema_pg_insert_v2.sql` | Incremental migration | ~500 bytes | ⏳ NEXT |

### Existing Files (NO CHANGES in Phase 2)

| File | Current State | Phase 3.2 Changes |
|------|---------------|-------------------|
| `pmo-backend/src/auth/dto/login.dto.ts` | Email-only | Add `identifier` field |
| `pmo-backend/src/auth/auth.service.ts` | Email lookup | Add conditional lookup |
| `pmo-backend/src/users/dto/create-user.dto.ts` | No username field | Add `username` field |
| `database/database draft/2026_01_12/pmo_seed_data.sql` | No usernames | Add username assignments |

---

## Governance Checkpoint

**ACE Framework Status:** ✅ Phase 1 RESEARCH COMPLETE | ⏳ Phase 2 PLAN UPDATE (in progress)

**Artifacts Produced:**
- ✅ Canonical schema design (`pmo_schema_pg_v2.sql` specification)
- ✅ Incremental migration design (`pmo_schema_pg_insert_v2.sql` specification)
- ✅ Backend alignment requirements (DTO + service + validation changes)
- ✅ MIS compliance analysis (SOLID, DRY, YAGNI, KISS, TDA, MIS verified)
- ✅ Risk assessment
- ✅ Testing strategy

**Blocking Questions Resolved:**
- ✅ Should we modify existing schema or create new version? **→ Both (v2 canonical + incremental migration)**
- ✅ Is username required or optional? **→ Optional (backward compatibility)**
- ✅ How to detect email vs username? **→ Regex pattern matching**
- ✅ Should we support phone login? **→ No (YAGNI)**
- ✅ Should we implement OAuth now? **→ No (deferred to Phase 3.3)**

**Next Action:** Update `plan_active.md` with Phase 3.2 details (NO IMPLEMENTATION YET)

---

*ACE Framework — Phase 1 RESEARCH Complete*  
*Operator: Senior PostgreSQL & Backend Architect*  
*Governance: SOLID, DRY, YAGNI, KISS, TDA, MIS*  
*Authority: docs/research_auth_expansion.md*  
*Next: Phase 2 PLAN update (plan_active.md) + SQL file creation*
