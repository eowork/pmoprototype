# Plan: Phase 2.5 - Domain API Development
**Status:** ACTIVE | Single Source of Truth
**Date:** 2026-01-13
**Reference:** `docs/research_summary.md`

## Status Log
- [x] Phase 2.2: Database Configuration — DONE
- [x] Phase 2.3: Backend Initialization — DONE
- [x] Phase 2.4: Auth & RBAC — DONE
- [x] Phase 2.5: Domain API Development — DONE

## Phase 2.5 Plan (VALUE-FIRST Ordering)

**Sequencing:** University Operations → Projects Core → Construction → Repairs → GAD

---

### Step 2.5.0: Shared Infrastructure (Do First)
| Task | Module | Status |
|------|--------|--------|
| Create pagination DTO + response helper | `src/common/dto/pagination.dto.ts` | DONE |
| Create base query params DTO | `src/common/dto/query.dto.ts` | DONE |
| Create response wrapper interceptor | `src/common/interceptors/` | SKIPPED (inline in services) |

**Pagination Response Shape:**
```typescript
interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number; }
}
```

---

### Step 2.5.1: University Operations API
| Attribute | Value |
|-----------|-------|
| **Status** | DONE |
| **Module** | `pmo-backend/src/university-operations/` |
| **Tables** | `university_operations`, `operation_organizational_info`, `operation_indicators`, `operation_financials` |

**Endpoints:**
```
GET    /university-operations              → List (paginated)
GET    /university-operations/:id          → Get with nested data
POST   /university-operations              → Create
PATCH  /university-operations/:id          → Update
DELETE /university-operations/:id          → Soft delete

GET    /university-operations/:id/indicators      → List indicators
POST   /university-operations/:id/indicators      → Add indicator
PATCH  /university-operations/:id/indicators/:iid → Update indicator
DELETE /university-operations/:id/indicators/:iid → Remove indicator

GET    /university-operations/:id/financials      → List financials
POST   /university-operations/:id/financials      → Add financial record
PATCH  /university-operations/:id/financials/:fid → Update financial
DELETE /university-operations/:id/financials/:fid → Remove financial
```

**Filters:** `?type=INSTRUCTION&status=IN_PROGRESS&campus=MAIN&fiscal_year=2026`

---

### Step 2.5.2: Projects Core API
| Attribute | Value |
|-----------|-------|
| **Status** | DONE |
| **Module** | `pmo-backend/src/projects/` |
| **Tables** | `projects` |

**Endpoints:**
```
GET    /projects           → List (paginated)
GET    /projects/:id       → Get single
POST   /projects           → Create (409 if project_code exists)
PATCH  /projects/:id       → Update
DELETE /projects/:id       → Soft delete
```

**Filters:** `?type=CONSTRUCTION&status=ACTIVE&campus=MAIN`

---

### Step 2.5.3: Construction Projects API
| Attribute | Value |
|-----------|-------|
| **Status** | DONE |
| **Module** | `pmo-backend/src/construction-projects/` |
| **Tables** | `construction_projects`, `construction_milestones`, `construction_gallery`, `construction_project_financials` |

**Endpoints:**
```
GET    /construction-projects              → List (paginated)
GET    /construction-projects/:id          → Get with project + contractor info
POST   /construction-projects              → Create (requires project_id)
PATCH  /construction-projects/:id          → Update
DELETE /construction-projects/:id          → Soft delete

GET    /construction-projects/:id/milestones      → List milestones
POST   /construction-projects/:id/milestones      → Add milestone
PATCH  /construction-projects/:id/milestones/:mid → Update
DELETE /construction-projects/:id/milestones/:mid → Remove

GET    /construction-projects/:id/financials      → List financials
POST   /construction-projects/:id/financials      → Add financial record
```

**Filters:** `?status=IN_PROGRESS&campus=MAIN&contractor_id=uuid&funding_source_id=uuid`

---

### Step 2.5.4: Repair Projects API
| Attribute | Value |
|-----------|-------|
| **Status** | DONE |
| **Module** | `pmo-backend/src/repair-projects/` |
| **Tables** | `repair_projects`, `repair_pow_items`, `repair_project_phases`, `repair_project_milestones`, `repair_project_team_members` |

**Endpoints:**
```
GET    /repair-projects              → List (paginated)
GET    /repair-projects/:id          → Get with nested data
POST   /repair-projects              → Create (requires project_id)
PATCH  /repair-projects/:id          → Update
DELETE /repair-projects/:id          → Soft delete

GET    /repair-projects/:id/pow-items       → List POW items
POST   /repair-projects/:id/pow-items       → Add POW item
PATCH  /repair-projects/:id/pow-items/:pid  → Update
DELETE /repair-projects/:id/pow-items/:pid  → Remove

GET    /repair-projects/:id/phases          → List phases
POST   /repair-projects/:id/phases          → Add phase
PATCH  /repair-projects/:id/phases/:phid    → Update

GET    /repair-projects/:id/team-members    → List team
POST   /repair-projects/:id/team-members    → Add member
DELETE /repair-projects/:id/team-members/:tid → Remove
```

**Filters:** `?status=PENDING&urgency=HIGH&is_emergency=true&campus=MAIN&repair_type_id=uuid`

---

### Step 2.5.5: GAD Parity Reports API
| Attribute | Value |
|-----------|-------|
| **Status** | DONE |
| **Module** | `pmo-backend/src/gad/` |
| **Tables** | `gad_student_parity_data`, `gad_faculty_parity_data`, `gad_staff_parity_data`, `gad_pwd_parity_data`, `gad_indigenous_parity_data`, `gad_gpb_accomplishments`, `gad_budget_plans` |

**Endpoints:**
```
--- Parity Data (5 tables, same pattern) ---
GET    /gad/student-parity     → List
POST   /gad/student-parity     → Create
PATCH  /gad/student-parity/:id → Update
DELETE /gad/student-parity/:id → Remove
PATCH  /gad/student-parity/:id/review → Approve/Reject

GET    /gad/faculty-parity     → List
POST   /gad/faculty-parity     → Create
...

GET    /gad/staff-parity       → List
GET    /gad/pwd-parity         → List
GET    /gad/indigenous-parity  → List

--- Planning & Accomplishments ---
GET    /gad/gpb-accomplishments     → List
POST   /gad/gpb-accomplishments     → Create
PATCH  /gad/gpb-accomplishments/:id → Update

GET    /gad/budget-plans            → List
POST   /gad/budget-plans            → Create
PATCH  /gad/budget-plans/:id        → Update
```

**Filters:** `?academic_year=2025-2026&status=pending&category=TRAINING`

---

### API Security (All Endpoints)

| Decorator | Purpose |
|-----------|---------|
| `@UseGuards(JwtAuthGuard)` | Require valid JWT (global) |
| `@UseGuards(RolesGuard)` | Check role permissions |
| `@Roles('Admin', 'Staff')` | Allowed roles |
| `@CurrentUser()` | Extract user from JWT |
| `@Public()` | Skip auth (health only) |

---

### Definition of Done (Phase 2.5)

| # | Criterion | Status |
|---|-----------|--------|
| 1 | University Operations CRUD works | DONE |
| 2 | Projects Core CRUD works | DONE |
| 3 | Construction Projects CRUD works | DONE |
| 4 | Repair Projects CRUD works | DONE |
| 5 | GAD Parity CRUD works | DONE |
| 6 | All routes require JWT (401 without) | DONE |
| 7 | Role checks work (403 if denied) | DONE |
| 8 | Pagination returns correct shape | DONE |
| 9 | Soft delete sets deleted_at/by | DONE |
| 10 | Audit fields populated from JWT | DONE |
| 11 | `npm run build` succeeds | DONE |

## Out Of Scope
- UI/frontend, analytics/reporting, optimization, DevOps/deployment.

---

## Prerequisites

- [x] PostgreSQL installed (pgAdmin 4 accessible)
- [x] Node.js 18+ installed
- [x] Phase transition research complete (`docs/research_summary.md`)
- [x] Backend DB/RBAC patterns captured (`pmo-backend/src/database/research.md`)
- [x] Normalized schema produced (`database/database draft/2026_01_12/pmo_schema_pg.sql`)
- [x] Reference data seed script available (`database/database draft/2026_01_12/pmo_seed_data.sql`)
- [x] NestJS backend connected to PostgreSQL
- [x] Health endpoint verified

---

## Codebase Directory Map

| Directory | Purpose | Phase 2.4 Relevance |
|----------|---------|---------------------|
| `docs/` | Execution (planning artifacts) | Source of Truth plan + research inputs; contracts recorded in `plan_active.md` |
| `pmo-backend/` | Execution (backend code) | Target for future AuthN/AuthZ implementation under `src/`; reuses `DatabaseModule`/`DatabaseService` |
| `database/database draft/2026_01_12/` | Execution inputs (authoritative SQL) | Actual location of `pmo_schema_pg.sql` and `pmo_seed_data.sql` used for Auth/RBAC tables |
| `database/database draft/` | Reference only (historical drafts) | Prior schemas for comparison only; not execution inputs |
| `prototype/` | Reference only (UI/behavior reference) | UX expectations only; no execution, no modifications |

---

## Phase 2.4 Overview (AuthN / AuthZ / Admin User Management)

**Objective Summary:**
- **AuthN:** Establish user identity via login and JWT issuance.
- **AuthZ:** Enforce access with RBAC guards/decorators aligned to existing RBAC tables.
- **User Management:** Define Admin-only contracts to manage users and role assignment.

**Entry Criteria (Must Be True Before Phase 2.4 Execution):**
- [x] `DatabaseModule` provides a singleton `pg.Pool` via NestJS DI
- [x] `DatabaseService` provides parameterized SQL access (`query()`) and health helpers
- [x] `/health` verifies DB connectivity and basic metadata
- [x] RBAC foundation exists in DB schema (`users`, `roles`, `user_roles`, `permissions`, `role_permissions`)
- [x] Granular permission tables exist (`user_page_permissions`, `university_operations_personnel`, `construction_project_assignments`)
- [x] Roles are seeded (at minimum: `Admin`, `Staff`, `Client`)

**DO NOT DO YET (Strict Constraints for Phase 2.4):**

-   **Frontend UI:** Do not build Login forms or Dashboards in React yet. Test with Postman/cURL only.
-   **Business Logic:** Do not build APIs for Projects, Repairs, or GAD Reports.
-   **File Uploads:** Do not implement Multer/S3/Disk storage yet.
-   **Advanced Reporting:** Do not build analytics or aggregation queries.
-   **Email/Notifications:** Do not integrate SMTP or email services yet.

---

## Security Findings & Auth Scope (Resolved)
- Status: Phase 2.4 UNBLOCKED (all gate conditions met).
- Logging Policy: [DONE] Emails redacted in failure logs; success logs use user_id only.
- Auth Scope: Login-only; admin-provisioned users; Google SSO (allowed domains); Google accounts have no password.

Gate Conditions (Exit Criteria - ALL MET)
- [x] Logging sanitized (no PII in failures; user_id-only on success).
- [x] Hashing consistency: sentinel/guard for Google accounts to avoid password login and compare errors.
- [x] Abuse protection: lockout verified; rate limiting on auth endpoints (5 req/min); generic error responses.
- [ ] Contracts & Tests: OpenAPI for auth; unit/integration tests (deferred to Phase 2.5 prep).

Implementation Summary:
- auth.service.ts: Generic INVALID_CREDENTIALS response for all auth failures
- auth.service.ts: SSO-only sentinel (blocks password login for Google-provisioned accounts)
- auth.controller.ts: @Throttle decorator (5 attempts/minute on /auth/login)
- app.module.ts: ThrottlerModule configured (short/medium/long rate limits)

---

## Step 2.3.1: Database Materialization

| Attribute | Value |
|-----------|-------|
| **Objective** | Execute normalized schema in PostgreSQL |
| **Status** | DONE |
| **Input** | `database/database draft/2026_01_12/pmo_schema_pg.sql` |
| **Output** | 53 tables, 16 ENUMs, 3 functions, 1 trigger |

**Actions:**
1. [x] Open pgAdmin 4
2. [x] Create database: `pmo_dashboard`
3. [x] Execute `pmo_schema_pg.sql` in Query Tool
4. [x] Verify zero errors in Messages tab

**Verification:**
```sql
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
-- Evidence (fill): <actual_count>
```

**Notes:**
- Schema includes `pgcrypto` extension for UUID generation
- All 12 blocking issues from original schema resolved
- Table order corrected for FK dependencies
 - Evidence (fill): <pgAdmin execution timestamp / screenshot reference>

**Risks:**
| Risk | Mitigation |
|------|------------|
| pgAdmin version mismatch | Use PostgreSQL 14+ |
| Extension not enabled | `CREATE EXTENSION pgcrypto` runs first |

---

## Step 2.3.2: Seed Reference Data

| Attribute | Value |
|-----------|-------|
| **Objective** | Populate lookup tables for FK constraints |
| **Status** | DONE |
| **Input** | `database/database draft/2026_01_12/pmo_seed_data.sql` (or equivalent INSERTs) |
| **Output** | Populated `roles`, `funding_sources`, `repair_types`, `construction_subcategories` |

**Actions:**
1. [x] Insert roles: `Admin`, `Staff`, `Client`
2. [x] Insert funding sources (GAA, Local, Special Grants)
3. [x] Insert repair types (Electrical, Plumbing, Structural, etc.)
4. [x] Insert construction subcategories

**Verification:**
```sql
SELECT 'roles' AS tbl, COUNT(*) FROM roles
UNION ALL SELECT 'funding_sources', COUNT(*) FROM funding_sources
UNION ALL SELECT 'repair_types', COUNT(*) FROM repair_types;
-- Evidence (fill): <counts>
```

**Notes:**
- Use `gen_random_uuid()` for IDs or let DB generate
- Minimum 3 roles required for RBAC to function

**Risks:**
| Risk | Mitigation |
|------|------------|
| FK violation on insert | Seed lookup tables before business tables |

---

## Step 2.3.3: NestJS Project Setup

| Attribute | Value |
|-----------|-------|
| **Objective** | Initialize backend project structure |
| **Status** | DONE |
| **Input** | NestJS CLI |
| **Output** | `/pmo-backend` directory with health endpoint |

**Actions:**
1. [x] Run: `nest new pmo-backend`
2. [x] Install: `npm install @nestjs/config pg`
3. [x] Create `.env` with `DATABASE_URL`
4. [x] Verify: `npm run start:dev` succeeds

**Verification:**
```bash
curl http://localhost:3000
# Expected: Hello World or health response
# Evidence (fill): <response>
```

**Notes:**
- Use `pmo-backend` as directory name (not nested in prototype)
- Skip Drizzle ORM for now (defer to Step 2.3.5)

**Risks:**
| Risk | Mitigation |
|------|------------|
| Port conflict | Use port 3001 if 3000 occupied |
| npm install fails | Clear npm cache, use Node 18 LTS |

---

## Step 2.3.4: Database Connection Module

| Attribute | Value |
|-----------|-------|
| **Objective** | Establish PostgreSQL connection from NestJS |
| **Status** | DONE |
| **Input** | `.env` DATABASE_URL |
| **Output** | Database module with connection pool |

**Actions:**
1. [x] Create `src/database/database.module.ts`
2. [x] Configure `pg` Pool with connection string
3. [x] Export pool for dependency injection
4. [x] Confirm successful connection in startup logs

**Verification:**
```
[Nest] LOG Database connected successfully
Evidence (fill): <log excerpt>
```

**Notes:**
- Use raw `pg` driver (SQL-first approach)
- Pool size: 5-10 connections for dev
- Connection timeout: 5000ms

**Risks:**
| Risk | Mitigation |
|------|------------|
| Connection refused | Verify PostgreSQL is running |
| Auth failure | Check DATABASE_URL credentials |

---

## Phase 2.2–2.3 Artifacts (Completed)
- See docs/research_summary.md → Completed Artifacts (Phase 2.2–2.3)

---

## Step 2.4.1: Auth Architecture Decision Checkpoint

| Attribute | Value |
|-----------|-------|
| **Objective** | Lock AuthN/AuthZ primitives and enforcement boundaries |
| **Status** | DONE |
| **Input** | `docs/research_summary.md`, `pmo-backend/src/database/research.md`, RBAC schema tables |
| **Output** | Documented architecture decisions inside this plan |

**Target Directories:** `docs/` (planning), `pmo-backend/` (future implementation target)

**Target Files (Known/TBD):**
- Plan artifact: `docs/plan_active.md`
- Future implementation: TBD within `pmo-backend/src/auth/`, `pmo-backend/src/users/`, `pmo-backend/src/iam/`

**Actions:**
1. [x] Confirm JWT-based authentication (stateless) as baseline.
2. [x] Define which routes are public (e.g., `/health`, login) vs protected.
3. [x] Define guard layering: JWT guard first, RBAC guard second.
4. [x] Define which RBAC sources are authoritative for checks (roles vs per-user page permissions).

**Decisions:**
```
AUTH_STRATEGY: JWT (stateless, Passport-JWT), Bearer header, 8h lifetime
PUBLIC_ROUTES: GET /health, POST /auth/login
PROTECTED_ROUTES: GET /auth/me, ALL /admin/*, ALL /users/*
GUARD_LAYERING: JwtAuthGuard → RolesGuard → PermissionsGuard
RBAC_PRECEDENCE:
  1. SuperAdmin (is_superadmin=TRUE) → ALLOW ALL
  2. Role-based (role_permissions)
  3. Page-based (user_page_permissions)
DEFAULT_STANCE: DENY unless explicitly allowed
```

**Verification:**
- This step is complete when the Phase 2.4 steps 2.4.3 and 2.4.4 are fully specified and reviewed.

**Notes:**
- Align with existing NestJS DI patterns: guards/services must reuse `DatabaseService`/`pg.Pool`.

**Risks:**
| Risk | Mitigation |
|------|------------|
| Ambiguous authorization sources | Specify precedence rules in Step 2.4.4 |

---

## Step 2.4.2: Environment & Config Prerequisites Definition

| Attribute | Value |
|-----------|-------|
| **Objective** | Define required configuration keys without exposing secrets |
| **Status** | DONE |
| **Input** | Existing `.env` usage (`DATABASE_URL`) and backend module patterns |
| **Output** | A validated config key set for AuthN/AuthZ work |

**Target Directories:** `docs/` (planning), `pmo-backend/` (future implementation target)

**Target Files (Known):**
- Backend env template: `pmo-backend/.env.example`
- Backend config consumption (current): `pmo-backend/src/database/database.module.ts`

**Actions:**
1. [x] Confirm current DB config keys consumed by backend: `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`.
2. [x] Note: `DATABASE_URL` exists as an *optional* env pattern in `.env.example`, but is not currently consumed by `DatabaseModule`.
3. [x] Define JWT config placeholders (names only): `AUTH_JWT_SECRET`, `AUTH_JWT_EXPIRES_IN`.
4. [x] Define password hashing policy placeholder (name only): `PASSWORD_HASH_ALGO`.
5. [x] Define logging/audit toggles if needed (names only): `LOG_LEVEL`.
6. [x] Define Google OAuth placeholders (names only): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `GOOGLE_ALLOWED_DOMAINS`.

**Config Keys Definition:**
```
EXISTING (DatabaseModule):
  DATABASE_HOST     → database.module.ts
  DATABASE_PORT     → database.module.ts
  DATABASE_NAME     → database.module.ts
  DATABASE_USER     → database.module.ts
  DATABASE_PASSWORD → database.module.ts

NEW (AuthModule):
  AUTH_JWT_SECRET     → auth.module.ts (required, min 32 chars)
  AUTH_JWT_EXPIRES_IN → auth.module.ts (default: "8h")
  PASSWORD_HASH_ROUNDS → auth.service.ts (default: 10, bcrypt)

OPTIONAL:
  LOG_LEVEL → main.ts (default: "info")
```

**Verification:**
- The plan lists the final key names and indicates where they are consumed (module/service level), without storing values.

**Notes:**
- No secrets should ever be committed to Git; only placeholders belong in `.env.example` (future phase).

**Risks:**
| Risk | Mitigation |
|------|------------|
| Secret leakage via docs/logs | Explicitly forbid writing real secrets in plan/code examples |

---

## Step 2.4.3: Authentication API Contract Definition (No Implementation)

| Attribute | Value |
|-----------|-------|
| **Objective** | Define minimal AuthN routes and payload shapes for Phase 2.4 |
| **Status** | DONE |
| **Input** | `users` table (email, password_hash, is_active, lock fields) and existing `/health` pattern |
| **Output** | Auth API contract (routes + request/response shapes) recorded in this plan |

**Target Directories:** `docs/` (contract in plan), `pmo-backend/` (future implementation target)

**Target Files (Known/TBD):**
- Plan artifact: `docs/plan_active.md`
- Future implementation: TBD within `pmo-backend/src/auth/` (controllers/services/guards)

**Actions:**
1. [x] Define `POST /auth/login` request/response shape (email/password -> JWT + basic user profile).
2. [x] Define `GET /auth/me` response shape (derived from JWT identity).
3. [x] Define authentication error cases (invalid credentials, inactive user, locked user).

**API Contract:**
```
POST /auth/login
  Request:  { email: string, password: string }
  Response: {
    access_token: string,
    user: { id, email, first_name, last_name, roles: string[] }
  }
  Errors:
    401 INVALID_CREDENTIALS  - Email/password mismatch
    401 ACCOUNT_INACTIVE     - is_active = false
    423 ACCOUNT_LOCKED       - account_locked_until > NOW()

GET /auth/me (Protected)
  Headers:  Authorization: Bearer <token>
  Response: {
    id, email, first_name, last_name, avatar_url,
    roles: [{ id, name }],
    is_superadmin: boolean,
    permissions: string[]
  }
  Errors:
    401 UNAUTHORIZED - Invalid/expired token
```

**Verification:**
- Contract includes route list, required fields, and error codes/messages at a high level.

**Notes:**
- Keep contracts consistent with MIS auditability: responses must be safe (never return `password_hash`).

**Risks:**
| Risk | Mitigation |
|------|------------|
| Contract drift later | Treat this contract as the baseline for Phase 2.5 APIs |

---

## Step 2.4.4: RBAC Enforcement Model Definition (No Implementation)

| Attribute | Value |
|-----------|-------|
| **Objective** | Define how RBAC decisions are computed from existing schema tables |
| **Status** | DONE |
| **Input** | `user_roles`, `roles`, `permissions`, `role_permissions`, `user_page_permissions` |
| **Output** | RBAC decision rules and precedence documented in this plan |

**Target Directories:** `docs/` (policy in plan), `pmo-backend/` (future enforcement)

**Target Files (Known/TBD):**
- Plan artifact: `docs/plan_active.md`
- Schema input: `database/database draft/2026_01_12/pmo_schema_pg.sql` (tables/functions)
- Backend enforcement (future): TBD within `pmo-backend/src/iam/` or `pmo-backend/src/auth/`

**Actions:**
1. [x] Define SuperAdmin behavior (`user_roles.is_superadmin = true` bypass).
2. [x] Define role-based permission checks (via `role_permissions`).
3. [x] Define per-user page permissions checks (`user_page_permissions`).
4. [x] Define precedence and default stance (recommendation: deny-by-default unless explicitly allowed).

**RBAC Enforcement Model:**
```
DECISION_FLOW (evaluated in order):
  1. IF is_user_superadmin(user_id) = TRUE → ALLOW (bypass all checks)
  2. IF @Roles() decorator present:
     - Query: SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
              WHERE ur.user_id = $1 AND r.name = ANY($2)
     - IF found → ALLOW, ELSE → DENY
  3. IF @Permissions() decorator present:
     - Query: SELECT 1 FROM role_permissions rp
              JOIN permissions p ON rp.permission_id = p.id
              JOIN user_roles ur ON rp.role_id = ur.role_id
              WHERE ur.user_id = $1 AND p.name = $2
     - IF found → ALLOW, ELSE → DENY
  4. IF @PagePermission() decorator present:
     - Use get_user_page_permission(user_id, page_id, action)
     - IF TRUE → ALLOW, ELSE → DENY

DEFAULT_STANCE: DENY
  - All protected routes require explicit permission grant
  - No implicit inheritance between permission types
```

**Verification:**
- The plan contains explicit precedence rules and a deny/allow default stance.

**Notes:**
- This must be compatible with the existing DB-first approach: checks are performed via parameterized SQL through `DatabaseService`.

**Risks:**
| Risk | Mitigation |
|------|------------|
| Mixing role and page models incorrectly | Document precedence explicitly and keep enforcement consistent |

---

## Step 2.4.5: Admin User & Role Management Contract Definition (No Implementation)

| Attribute | Value |
|-----------|-------|
| **Objective** | Define Admin-only contracts for managing users and role assignment |
| **Status** | DONE |
| **Input** | `users`, `roles`, `user_roles` tables and audit fields |
| **Output** | Admin API contract (routes + payload shapes) recorded in this plan |

**Target Directories:** `docs/` (contract in plan), `pmo-backend/` (future implementation target)

**Target Files (Known/TBD):**
- Plan artifact: `docs/plan_active.md`
- Future implementation: TBD within `pmo-backend/src/users/` and `pmo-backend/src/iam/`

**Actions:**
1. [x] Define user CRUD boundaries (create, activate/deactivate, lock/unlock policy visibility).
2. [x] Define role assignment endpoints (assign/remove roles for a user).
3. [x] Define minimum audit fields required on mutations (actor id, timestamp).

**Admin API Contract:**
```
USER MANAGEMENT (Requires: @Roles('Admin'))
  GET    /admin/users              → List users (paginated)
  GET    /admin/users/:id          → Get user details
  POST   /admin/users              → Create user { email, password, first_name, last_name }
  PATCH  /admin/users/:id          → Update user { first_name, last_name, phone }
  PATCH  /admin/users/:id/status   → Toggle is_active
  PATCH  /admin/users/:id/unlock   → Clear account_locked_until
  DELETE /admin/users/:id          → Soft delete (sets deleted_at, deleted_by)

ROLE MANAGEMENT (Requires: @Roles('Admin'))
  GET    /admin/roles              → List all roles
  POST   /admin/users/:id/roles    → Assign role { role_id }
  DELETE /admin/users/:id/roles/:roleId → Remove role

AUDIT FIELDS (auto-populated):
  - created_by: req.user.id (from JWT)
  - assigned_by: req.user.id
  - deleted_by: req.user.id
  - timestamps: created_at, updated_at, deleted_at
```

**Verification:**
- Contract includes route list, required fields, and security constraints (Admin-only).

**Notes:**
- Keep scope limited to identity and authorization management, not domain entities.

**Risks:**
| Risk | Mitigation |
|------|------------|
| Over-permissioned admin endpoints | Require RBAC guard checks by default |

---

## Step 2.4.6: Audit & Logging Compliance Checklist (No Tooling Changes)

| Attribute | Value |
|-----------|-------|
| **Objective** | Define what must be auditable for MIS compliance before business APIs exist |
| **Status** | DONE |
| **Input** | Existing audit columns in schema (`created_at`, `updated_at`, `deleted_at`, `created_by`, `deleted_by`) |
| **Output** | A checklist of required audit/log events recorded in this plan |

**Target Directories:** `docs/` (checklist in plan), `pmo-backend/` (future implementation target)

**Target Files (Known/TBD):**
- Plan artifact: `docs/plan_active.md`
- Backend modules (future): TBD within `pmo-backend/src/auth/`, `pmo-backend/src/users/`, `pmo-backend/src/iam/`

**Actions:**
1. [x] Define audit events for AuthN (login success/failure, account locked/unlocked).
2. [x] Define audit events for AuthZ admin actions (role assignment, permission changes).
3. [x] Define logging red-lines (never log passwords, hashes, secrets, raw tokens).

**Audit Checklist:**
```
AUTHN EVENTS (log to console, future: audit_logs table):
  [x] LOGIN_SUCCESS   - user_id, email, ip, timestamp
  [x] LOGIN_FAILURE   - email, ip, reason, timestamp
  [x] ACCOUNT_LOCKED  - user_id, locked_until, triggered_by
  [x] ACCOUNT_UNLOCKED - user_id, unlocked_by, timestamp

AUTHZ ADMIN EVENTS:
  [x] USER_CREATED    - user_id, created_by, timestamp
  [x] USER_UPDATED    - user_id, fields_changed, updated_by
  [x] USER_DEACTIVATED - user_id, deactivated_by
  [x] USER_DELETED    - user_id, deleted_by
  [x] ROLE_ASSIGNED   - user_id, role_id, assigned_by
  [x] ROLE_REMOVED    - user_id, role_id, removed_by

LOGGING RED-LINES (NEVER LOG):
  [!] password (plaintext)
  [!] password_hash
  [!] JWT tokens (full)
  [!] AUTH_JWT_SECRET
  [!] DATABASE_PASSWORD
```

**Verification:**
- Checklist exists with clear items that can be validated during implementation later.

**Notes:**
- This step is documentation-only; do not add log tooling or pipelines in this phase plan.

**Risks:**
| Risk | Mitigation |
|------|------------|
| Incomplete audit trail | Use this checklist as a gate before starting Phase 2.5 business APIs |

---

## Step 2.4.7: SSO — Google OAuth (edu domain-only)

| Attribute | Value |
|-----------|-------|
| **Objective** | Provide optional Google SSO with strict edu-domain acceptance |
| **Status** | DONE |
| **Input** | `docs/research_summary.md`, Google OAuth config placeholders |
| **Output** | Documented SSO flow and domain policy within this plan |

**Target Directories:** `docs/` (policy in plan), `pmo-backend/` (future implementation)

**Target Files (Known/TBD):**
- Plan artifact: `docs/plan_active.md`
- Backend: `pmo-backend/src/auth/strategies/google.strategy.ts`
- Backend: `pmo-backend/src/auth/auth.controller.ts` (Google routes)

**Actions:**
1. [x] Define backend callback flow: verify `id_token`, enforce `email_verified` and allowed domain.
2. [x] Specify behavior for non‑edu Gmail: reject OAuth; guide to local registration with default `Client` role.
3. [x] Record audit events for SSO login outcomes.

**Google OAuth SSO Policy:**
```
FLOW:
  1. GET /auth/google         → Redirect to Google consent
  2. GET /auth/google/callback → Google redirects back with code
  3. Backend validates id_token:
     - MUST have email_verified = true
     - Email domain MUST match GOOGLE_ALLOWED_DOMAINS (e.g., "carsu.edu.ph")
  4. IF domain allowed:
     - Find or create user with google_id
     - Assign default role (Staff for edu, Client otherwise)
     - Issue JWT, redirect to frontend
  5. IF domain NOT allowed:
     - Return 403 GOOGLE_DOMAIN_NOT_ALLOWED
     - Message: "Only institutional accounts accepted. Use local registration."

DOMAIN ENFORCEMENT:
  - GOOGLE_ALLOWED_DOMAINS = "carsu.edu.ph" (comma-separated for multiple)
  - Reject @gmail.com, @yahoo.com, etc.
  - Only accept verified institutional emails

USER PROVISIONING (auto-create on first SSO login):
  - email: from Google id_token
  - first_name, last_name: from Google profile
  - google_id: sub claim from id_token
  - password_hash: NULL (SSO-only user)
  - is_active: TRUE
  - Default role: Staff (for edu domain users)

AUDIT EVENTS:
  [x] GOOGLE_SSO_SUCCESS   - user_id, email, domain, timestamp
  [x] GOOGLE_SSO_REJECTED  - email, domain, reason, timestamp
  [x] GOOGLE_USER_CREATED  - user_id, email, created_via=google
```

**Verification:**
- Documented domain enforcement and fallback to local registration.
- Placeholders present in `.env.example`; no secrets committed.

**Risks:**
| Risk | Mitigation |
|------|------------|
| Misinterpreting Google domain hints | Validate against `id_token` claims and allowlist |

---

## Definition of Done (Phase 2.4)

| # | Criterion | Verification | Status |
|---|-----------|--------------|--------|
| 1 | Auth architecture locked | Step 2.4.1 decisions recorded | DONE |
| 2 | Config keys defined | Step 2.4.2 key set listed (no values) | DONE |
| 3 | Auth contract defined | Step 2.4.3 routes/payloads specified | DONE |
| 4 | RBAC model defined | Step 2.4.4 precedence and defaults specified | DONE |
| 5 | Admin user/role contracts defined | Step 2.4.5 routes/payloads specified | DONE |
| 6 | Audit checklist defined | Step 2.4.6 checklist completed | DONE |
| 7 | Scope discipline maintained | No frontend/business APIs added | DONE |
| 8 | Auth module implemented | `pmo-backend/src/auth/` created | DONE |
| 9 | Users module implemented | `pmo-backend/src/users/` created | DONE |
| 10 | Build verified | `npm run build` succeeds | DONE |
| 11 | SSO policy defined | Step 2.4.7 domain enforcement + local fallback | DONE |
| 12 | Google strategy implemented | `pmo-backend/src/auth/strategies/google.strategy.ts` | DONE |
| 13 | Migration script created | `pmo_migration_google_oauth.sql` (adds google_id) | DONE |
| 14 | Logging sanitized | No PII in failure logs; user_id only on success | DONE |
| 15 | SSO sentinel implemented | Block password login for Google-only accounts | DONE |
| 16 | Rate limiting enabled | ThrottlerModule + 5 req/min on /auth/login | DONE |
| 17 | Generic error responses | INVALID_CREDENTIALS for all auth failures | DONE |

---

## Phase Transition Gate (to 2.5)

All Phase 2.4 DoD items (1–17) VERIFIED. Phase 2.4 is DONE. Ready to advance to Phase 2.5 (API Development).

---

## Out of Scope (Deferred to Phase 2.6+)

- [ ] Business-domain API endpoint implementation (projects, repairs, reports)
- [ ] Frontend integration
- [ ] File uploads and media pipelines
- [ ] Email/notifications
- [ ] Advanced reporting/analytics
- [ ] Deployment (PM2/Nginx)
- [ ] Schema migrations tooling (Drizzle Kit) or ORM setup (optional)

---

## Files

| File | Purpose | Status |
|------|---------|--------|
| `docs/plan_active.md` | This plan (source of truth) | ACTIVE |
| `docs/research_summary.md` | Phase transition research | COMPLETE |
| `pmo-backend/src/database/research.md` | Backend DB/RBAC patterns | COMPLETE |
| `database/database draft/2026_01_12/pmo_schema_pg.sql` | Normalized PostgreSQL schema | READY |
| `database/database draft/2026_01_12/pmo_seed_data.sql` | Reference data seed script | READY |
| `pmo-backend/src/auth/` | Auth module (JWT, Google OAuth, guards, decorators) | CREATED |
| `pmo-backend/src/users/` | Users module (admin CRUD, roles) | CREATED |
| `database/.../pmo_migration_google_oauth.sql` | Migration: google_id column | CREATED |
| `pmo-backend/src/common/dto/` | Shared pagination, response helpers | CREATED |
| `pmo-backend/src/common/interfaces/` | Shared interfaces (JwtPayload) | CREATED |
| `pmo-backend/src/university-operations/` | University Operations module (CRUD + nested) | CREATED |
| `pmo-backend/src/projects/` | Projects Core module (base CRUD) | CREATED |
| `pmo-backend/src/construction-projects/` | Construction Projects module (CRUD + nested) | CREATED |
| `pmo-backend/src/repair-projects/` | Repair Projects module (CRUD + nested) | CREATED |
| `pmo-backend/src/gad/` | GAD Parity Reports module (5 parity + planning) | CREATED |

---

## Phase 2.5 Transition Gate (to Phase 2.6)

All Phase 2.5 DoD items (1–11) VERIFIED. Phase 2.5 is DONE. Ready to advance to Phase 2.6 (Frontend Integration / Testing).

---

*ACE Framework - Phase 2.5 Plan*
*Governed AI Bootstrap v2.4*
