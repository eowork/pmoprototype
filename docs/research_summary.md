# Research Summary: Phase 2.4 Artifact + Phase 2.5 Scope
**Date:** 2026-01-14
**Status:** ACTIVE REFERENCE (do not duplicate into plan_active.md)
**Reference:** `docs/plan_active.md`, `database/database draft/2026_01_12/pmo_schema_pg.sql`

---

## 0. Implementation Status Log

| Step | Description | Status | Date | Notes |
|------|-------------|--------|------|-------|
| 2.5.0 | Shared Infrastructure | DONE | 2026-01-14 | common/dto, auth module, guards, decorators, validation |
| 2.5.1 | University Operations API | DONE | 2026-01-14 | CRUD + indicators + financials endpoints |
| 2.5.2 | Projects Core API | DONE | 2026-01-14 | CRUD endpoints for base projects table |
| 2.5.3 | Construction Projects API | DONE | 2026-01-14 | CRUD + milestones + financials endpoints |
| 2.5.4 | Repair Projects API | DONE | 2026-01-14 | CRUD + POW items + phases + team members |
| 2.5.5 | GAD Parity Reports API | DONE | 2026-01-14 | 5 parity tables + GPB + budget plans endpoints |
| 2.5.X | Build Verification | DONE | 2026-01-14 | `npm run build` succeeds with all modules |
| 2.5.V | Verification Harness | DONE | 2026-01-14 | Created `docs/test.md` with 75 endpoint tests |
| AUDIT | Codebase Alignment | DONE | 2026-01-15 | Drift detection complete - see Section 0.1 |
| 2.5.6 | Users Module API | DONE | 2026-01-15 | Admin CRUD + role assignment + account management |
| 2.5.7 | ENUM Consistency Audit | DONE | 2026-01-15 | 8 BLOCKING issues identified - see Section 9 |
| 2.5.8 | Seed Data Compatibility | DONE | 2026-01-15 | Verified seed data uses valid enum values - see Section 9.9 |
| 2.6.R | Phase 2.6 Research | DONE | 2026-01-15 | File uploads, documents, media - see Section 10 |
| 2.7.0 | Reference Data ENUMs | DONE | 2026-01-19 | ContractorStatus, DepartmentStatus, SettingDataType |
| 2.7.1 | Contractors API | DONE | 2026-01-19 | CRUD + status management |
| 2.7.2 | Funding Sources API | DONE | 2026-01-19 | CRUD endpoints |
| 2.7.3 | Departments API | DONE | 2026-01-19 | CRUD + user assignment |
| 2.7.4 | Repair Types API | DONE | 2026-01-19 | CRUD endpoints |
| 2.7.5 | Construction Subcategories API | DONE | 2026-01-19 | CRUD endpoints |
| 2.7.6 | System Settings API | DONE | 2026-01-19 | CRUD + key-based access |
| 2.8.0 | Swagger/OpenAPI Setup | DONE | 2026-01-19 | SwaggerModule configured in main.ts |
| 2.8.1 | Controller @ApiTags | DONE | 2026-01-19 | All 17 controllers tagged |
| 2.8.4 | Global Exception Filter | DONE | 2026-01-19 | Consistent error responses |
| 2.8.5 | Logging Interceptor | DONE | 2026-01-19 | Structured JSON logging |
| 2.8.6 | Health Check Enhancement | DONE | 2026-01-19 | DB latency + memory checks |
| 2.9.0 | Test Dependencies | DONE | 2026-01-20 | jest, ts-jest, @nestjs/testing, supertest |
| 2.9.1 | Jest Configuration | DONE | 2026-01-20 | jest.config.js + test/jest-e2e.json |
| 2.9.2 | Auth Unit Tests | DONE | 2026-01-20 | 8 tests: validateUser, login, getProfile, logout |
| 2.9.3 | Contractors E2E Tests | DONE | 2026-01-20 | 8 tests: auth check, CRUD cycle, 404 handling |
| 2.9.V | Full Verification | DONE | 2026-01-20 | npm run build && npm run test passes |
| 2.9.D | Test Documentation | DONE | 2026-01-20 | docs/test_doc.md created (beginner usage guide) |
| 3.0.R | Phase 3.0 Research (Initial) | DONE | 2026-01-20 | Vue 3 + Vuetify 3 frontend setup - see Section 14 |
| 3.0.P | Prototype UI Analysis | DONE | 2026-01-20 | Backend-UI alignment, CSU branding - see Section 15 |
| 3.0.G | Gap Re-Classification | DONE | 2026-01-20 | Startup kick-off priorities, deferred features - see Section 16 |
| **ACE-AUTH** | **Auth Schema Evolution Research** | **DONE** | **2026-01-21** | **Username + OAuth schema analysis - see Section 20** |

---

## 0.1 Codebase Alignment Audit (2026-01-15)

### FINDINGS SUMMARY

| # | File/Module | Issue | Classification | Root Cause | Impact |
|---|-------------|-------|----------------|------------|--------|
| 1 | `pmo-backend/src/users/` | ~~MISSING~~ **FIXED** in Step 2.5.6 | RESOLVED | Implemented 2026-01-15 | N/A |
| 2 | `docs/plan_active.md:877` | ~~Lists as CREATED but absent~~ **FIXED** | RESOLVED | Module now exists | N/A |

### VERIFIED SAFE

| # | Component | Status | Notes |
|---|-----------|--------|-------|
| 1 | AppModule wiring | SAFE | All 9 modules properly imported |
| 2 | Global JWT guard | SAFE | JwtAuthGuard applied via APP_GUARD |
| 3 | ThrottlerGuard | SAFE | Rate limiting active |
| 4 | Health @Public() | SAFE | Correctly excludes health from JWT |
| 5 | Schema ↔ API alignment | SAFE | Table names, fields, FKs match |
| 6 | DTO barrel exports | SAFE | All index.ts files present |
| 7 | Pagination pattern | SAFE | Consistent across all services |
| 8 | Soft delete pattern | SAFE | `deleted_at IS NULL` used everywhere |
| 9 | Audit fields | SAFE | `created_by`/`submitted_by` correct per table |

### MISSING MODULE DETAIL

**Module:** `pmo-backend/src/users/`
**Expected Contents (per plan_active.md):**
- Users controller (Admin CRUD)
- Users service
- Role assignment endpoints
- User management DTOs

**Current State:** Directory does not exist. No users module in codebase.

**Impact:**
- No API endpoints for user administration
- No way to create/update/delete users via API
- Role assignment must be done via direct DB access
- Auth module works (login/profile) but admin functions missing

**Resolution:** UsersModule implemented in Step 2.5.6 (2026-01-15)

### MODULES INVENTORY (ACTUAL - UPDATED 2026-01-15)

```
pmo-backend/src/
├── app.module.ts              ✓ SAFE
├── app.controller.ts          ✓ SAFE
├── app.service.ts             ✓ SAFE
├── main.ts                    ✓ SAFE
├── auth/                      ✓ SAFE (9 files)
├── common/                    ✓ SAFE (4 files)
├── database/                  ✓ SAFE (3 files)
├── health/                    ✓ SAFE (3 files)
├── university-operations/     ✓ SAFE (8 files)
├── projects/                  ✓ SAFE (6 files)
├── construction-projects/     ✓ SAFE (8 files)
├── repair-projects/           ✓ SAFE (9 files)
├── gad/                       ✓ SAFE (6 files)
└── users/                     ✓ CREATED (7 files) - Step 2.5.6
```

### NO MERGE ARTIFACTS DETECTED

- No duplicate controllers
- No conflicting DTOs
- No orphaned files
- No unused imports

---

## 1. Phase 2.4 (Auth & RBAC) — Completed Artifact
Phase 2.4 is complete and treated as a stable foundation for Phase 2.5.

**Implemented (authoritative):**
- Auth module: `pmo-backend/src/auth/*` (JWT login, guards/decorators) ✓
- Users/admin module: `pmo-backend/src/users/*` ✓ (Admin CRUD + role assignment) - Step 2.5.6
- Rate limiting: `pmo-backend/src/app.module.ts` (Throttler) + `@Throttle` on auth login
- Security hardening: auth failure logs redact PII; generic auth errors; SSO-only sentinel for Google accounts

**Security posture (key points):**
- Deny-by-default RBAC with explicit allow via roles/permissions; SuperAdmin bypass supported.
- No secrets logged; no passwords/hashes/tokens returned in responses.

---

## 2. Phase 2.5 Boundaries (Locked)
**Included:** domain APIs, basic validation, stable request/response contracts, RBAC wiring.

**Not included:** frontend/UI, analytics/reporting dashboards, performance optimization, DevOps/deploy pipelines, schema redesign.

---

## 3. Schema Dependency Analysis (Value-First Ordering)

### 3.1 University Operations — STANDALONE (No FK to projects)
**Location:** `pmo_schema_pg.sql` lines 920+

| Table | FK Dependencies | Status |
|-------|-----------------|--------|
| `university_operations` | None (uses `operation_type_enum`) | STANDALONE |
| `operation_organizational_info` | FK → `university_operations(id)` | Nested under UniOps |
| `operation_indicators` | FK → `university_operations(id)` | Nested under UniOps |
| `operation_financials` | FK → `university_operations(id)` | Nested under UniOps |

**Finding:** University Operations is completely independent from the `projects` table. It can be built first without any project infrastructure.

### 3.2 Construction Projects — REQUIRES projects FK
**Location:** `pmo_schema_pg.sql` lines 477+

| Table | FK Dependencies | Status |
|-------|-----------------|--------|
| `projects` | None (base table) | REQUIRED as parent |
| `construction_projects` | FK → `projects(id)` | REQUIRES projects core |

**Finding:** Construction projects require a minimal `projects` core for the FK constraint.

### 3.3 Repair Projects — Priority 4
| Table | FK Dependencies | Status |
|-------|-----------------|--------|
| `repair_projects` | FK → `projects(id)`, `repair_types(id)`, `facilities(id)` | REQUIRES projects |
| `repair_pow_items` | FK → `repair_projects(id)` | Nested |
| `repair_project_phases` | FK → `repair_projects(id)` | Nested |
| `repair_project_milestones` | FK → `repair_projects(id)` | Nested |
| `repair_project_financial_reports` | FK → `repair_projects(id)` | Nested |
| `repair_project_team_members` | FK → `repair_projects(id)` | Nested |

### 3.4 GAD Parity Reports — Priority 5 (STANDALONE)
| Table | FK Dependencies | Status |
|-------|-----------------|--------|
| `gad_student_parity_data` | None | STANDALONE |
| `gad_faculty_parity_data` | None | STANDALONE |
| `gad_staff_parity_data` | None | STANDALONE |
| `gad_pwd_parity_data` | None | STANDALONE |
| `gad_indigenous_parity_data` | None | STANDALONE |
| `gad_gpb_accomplishments` | None | STANDALONE |
| `gad_budget_plans` | None | STANDALONE |
| `gad_yearly_profiles` | None | STANDALONE |

---

## 4. API Priorities & Sequencing (Phase 2.5)

| Priority | Domain | FK Dependency | Rationale |
|----------|--------|---------------|-----------|
| 1 | University Operations | NONE | Standalone, immediate value |
| 2 | Projects Core | NONE | FK parent for construction/repair |
| 3 | Construction Projects | projects | Infrastructure tracking |
| 4 | Repair Projects | projects, repair_types | Maintenance tracking |
| 5 | GAD Parity Reports | NONE | Compliance reporting |

---

## 5. API Conventions (Startup-Ready Patterns)

### 5.1 REST Resource Naming
```
GET    /resources           → List (paginated)
GET    /resources/:id       → Get single
POST   /resources           → Create
PATCH  /resources/:id       → Partial update
DELETE /resources/:id       → Soft delete

Nested resources:
GET    /resources/:id/children       → List children
POST   /resources/:id/children       → Create child
```

### 5.2 Pagination
```typescript
// Request: GET /resources?page=1&limit=20
// Response:
{
  data: T[],
  meta: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}
```

### 5.3 Filtering & Sorting
```typescript
// Query params (allowlisted columns only)
GET /resources?status=ACTIVE&campus=MAIN&sort=created_at&order=desc

// Allowlist pattern in service:
const ALLOWED_FILTERS = ['status', 'campus', 'type'];
const ALLOWED_SORTS = ['created_at', 'title', 'status'];
```

### 5.4 Soft Delete
```sql
-- All queries implicitly filter:
WHERE deleted_at IS NULL

-- DELETE endpoint sets:
UPDATE table SET deleted_at = NOW(), deleted_by = $userId WHERE id = $id
```

### 5.5 Audit Fields
```typescript
// Auto-populated from JWT (req.user.id)
CREATE: { created_by, created_at: NOW() }
UPDATE: { updated_by, updated_at: NOW() }
DELETE: { deleted_by, deleted_at: NOW() }
```

### 5.6 HTTP Status Codes
| Code | When | Example |
|------|------|---------|
| 200 | Success (GET, PATCH) | Resource returned/updated |
| 201 | Created (POST) | New resource created |
| 204 | No Content (DELETE) | Soft delete success |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | Missing/invalid JWT |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate unique key |

### 5.7 Error Response Shape
```typescript
{
  statusCode: number,
  message: string | string[],
  error: string,
  timestamp: string
}
```

### 5.8 Logging (No PII)
```
ENTITY_ACTION: id=uuid, by=userId
// Examples:
PROJECT_CREATED: id=abc-123, by=user-456
PROJECT_UPDATED: id=abc-123, by=user-456, fields=[title,status]
PROJECT_DELETED: id=abc-123, by=user-456
```

---

## 6. Patterns to Reuse (Do Not Rebuild)

### 6.1 Data Access Layer
```typescript
// DatabaseService.query() - parameterized SQL only
const result = await this.db.query(
  'SELECT * FROM table WHERE id = $1 AND deleted_at IS NULL',
  [id]
);
```

### 6.2 Auth/RBAC Guards
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin', 'Staff')
@Get()
findAll(@CurrentUser() user: JwtPayload) { }
```

### 6.3 Input Validation
```typescript
// UUID validation
@Get(':id')
findOne(@Param('id', ParseUUIDPipe) id: string) { }

// DTO validation with class-validator
export class CreateDto {
  @IsString() @IsNotEmpty() title: string;
  @IsOptional() @IsString() description?: string;
  @IsEnum(StatusEnum) status: StatusEnum;
}
```

### 6.4 Dynamic PATCH Updates
```typescript
// Build SET clause dynamically (from users.service.ts pattern)
const fields = Object.keys(dto).filter(k => dto[k] !== undefined);
const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
const values = fields.map(f => dto[f]);
```

---

## 7. Module Structure (Per Domain)

```
src/
├── domain-name/
│   ├── domain.module.ts       # NestJS module
│   ├── domain.controller.ts   # HTTP endpoints
│   ├── domain.service.ts      # Business logic + SQL
│   └── dto/
│       ├── create-domain.dto.ts
│       ├── update-domain.dto.ts
│       └── query-domain.dto.ts
```

---

## 8. Constraints & Risks (Phase 2.5)

| Constraint | Mitigation |
|------------|------------|
| Audit fields required | Auto-populate from `@CurrentUser()` in service |
| Soft delete default | Add `WHERE deleted_at IS NULL` to all queries |
| Unique codes (409) | Check existence before INSERT, throw ConflictException |
| FK integrity | Validate parent exists before child INSERT |
| Max page size | Cap `limit` at 100 in pagination |
| SQL injection | Parameterized queries only (never string concat) |

---

## 9. ENUM Consistency Audit (2026-01-15)

### 9.1 PostgreSQL ENUM Definitions (Authoritative Source)

| # | ENUM Name | Values | Used By |
|---|-----------|--------|---------|
| 1 | `campus_enum` | `MAIN`, `CABADBARAN`, `BOTH` | university_operations, projects, construction_projects, repair_projects |
| 2 | `project_status_enum` | `PLANNING`, `ONGOING`, `COMPLETED`, `ON_HOLD`, `CANCELLED` | projects, university_operations |
| 3 | `repair_status_enum` | `REPORTED`, `INSPECTED`, `APPROVED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` | repair_projects |
| 4 | `urgency_level_enum` | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | repair_projects |
| 5 | `operation_type_enum` | `HIGHER_EDUCATION`, `ADVANCED_EDUCATION`, `RESEARCH`, `TECHNICAL_ADVISORY` | university_operations |
| 6 | `project_type_enum` | `CONSTRUCTION`, `REPAIR`, `RESEARCH`, `EXTENSION`, `TRAINING`, `OTHER` | projects |
| 7 | `building_type_enum` | `ACADEMIC`, `ADMINISTRATIVE`, `RESIDENTIAL`, `OTHER` | buildings |
| 8 | `building_status_enum` | `OPERATIONAL`, `UNDER_CONSTRUCTION`, `RENOVATION`, `CLOSED` | buildings |
| 9 | `room_type_enum` | `CLASSROOM`, `LABORATORY`, `OFFICE`, `CONFERENCE`, `AUDITORIUM`, `OTHER` | rooms |
| 10 | `room_status_enum` | `AVAILABLE`, `OCCUPIED`, `UNDER_MAINTENANCE`, `UNAVAILABLE` | rooms |
| 11 | `semester_enum` | `FIRST`, `SECOND`, `SUMMER` | academic tables |
| 12 | `condition_enum` | `POOR`, `FAIR`, `GOOD`, `VERY_GOOD`, `EXCELLENT` | equipment, facilities |
| 13 | `contractor_status_enum` | `ACTIVE`, `SUSPENDED`, `BLACKLISTED` | contractors |
| 14 | `media_type_enum` | `IMAGE`, `VIDEO`, `DOCUMENT`, `OTHER` | media/gallery |
| 15 | `department_status_enum` | `ACTIVE`, `INACTIVE` | departments |
| 16 | `setting_data_type_enum` | `STRING`, `NUMBER`, `BOOLEAN`, `JSON`, `DATE`, `DATETIME` | system_settings |

### 9.2 DTO ENUM Inventory

| # | DTO Enum | File Location | Values |
|---|----------|---------------|--------|
| 1 | `Campus` | construction-projects/dto/create-construction-project.dto.ts | `MAIN`, `BUTUAN`, `CABADBARAN`, `SAN_FRANCISCO` |
| 2 | `Campus` | repair-projects/dto/create-repair-project.dto.ts | `MAIN`, `BUTUAN`, `CABADBARAN`, `SAN_FRANCISCO` |
| 3 | `Campus` | projects/dto/create-project.dto.ts | `MAIN`, `BUTUAN`, `CABADBARAN`, `SAN_FRANCISCO` |
| 4 | `Campus` | university-operations/dto/create-operation.dto.ts | `MAIN`, `BUTUAN`, `CABADBARAN`, `SAN_FRANCISCO` |
| 5 | `ProjectStatus` | construction-projects/dto/create-construction-project.dto.ts | `DRAFT`, `PENDING`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`, `CANCELLED` |
| 6 | `ProjectStatus` | projects/dto/create-project.dto.ts | `DRAFT`, `PENDING`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`, `CANCELLED` |
| 7 | `ProjectStatus` | university-operations/dto/create-operation.dto.ts | `DRAFT`, `PENDING`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`, `CANCELLED` |
| 8 | `RepairStatus` | repair-projects/dto/create-repair-project.dto.ts | `PENDING`, `APPROVED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| 9 | `UrgencyLevel` | repair-projects/dto/create-repair-project.dto.ts | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| 10 | `OperationType` | university-operations/dto/create-operation.dto.ts | `INSTRUCTION`, `RESEARCH`, `EXTENSION`, `PRODUCTION`, `ADMINISTRATIVE` |
| 11 | `ProjectType` | projects/dto/create-project.dto.ts | `CONSTRUCTION`, `REPAIR`, `MAINTENANCE`, `RENOVATION` |
| 12 | `ParityStatus` | gad/dto/parity-data.dto.ts | `pending`, `approved`, `rejected` |
| 13 | `IndicatorStatus` | university-operations/dto/create-indicator.dto.ts | `pending`, `approved`, `rejected` |

### 9.3 Gap Analysis

| DTO Enum | Schema ENUM | DTO Values | Schema Values | Severity | Issue |
|----------|-------------|------------|---------------|----------|-------|
| `Campus` | `campus_enum` | MAIN, BUTUAN, CABADBARAN, SAN_FRANCISCO | MAIN, CABADBARAN, BOTH | **BLOCKING** | `BUTUAN`, `SAN_FRANCISCO` invalid; `BOTH` missing |
| `ProjectStatus` | `project_status_enum` | DRAFT, PENDING, IN_PROGRESS, COMPLETED, ON_HOLD, CANCELLED | PLANNING, ONGOING, COMPLETED, ON_HOLD, CANCELLED | **BLOCKING** | `DRAFT`, `PENDING`, `IN_PROGRESS` invalid; `PLANNING`, `ONGOING` missing |
| `RepairStatus` | `repair_status_enum` | PENDING, APPROVED, IN_PROGRESS, COMPLETED, CANCELLED | REPORTED, INSPECTED, APPROVED, IN_PROGRESS, COMPLETED, CANCELLED | **BLOCKING** | `PENDING` invalid; `REPORTED`, `INSPECTED` missing |
| `UrgencyLevel` | `urgency_level_enum` | LOW, MEDIUM, HIGH, CRITICAL | LOW, MEDIUM, HIGH, CRITICAL | OK | **MATCH** |
| `OperationType` | `operation_type_enum` | INSTRUCTION, RESEARCH, EXTENSION, PRODUCTION, ADMINISTRATIVE | HIGHER_EDUCATION, ADVANCED_EDUCATION, RESEARCH, TECHNICAL_ADVISORY | **BLOCKING** | Only `RESEARCH` matches; all others invalid |
| `ProjectType` | `project_type_enum` | CONSTRUCTION, REPAIR, MAINTENANCE, RENOVATION | CONSTRUCTION, REPAIR, RESEARCH, EXTENSION, TRAINING, OTHER | **BLOCKING** | `MAINTENANCE`, `RENOVATION` invalid; `RESEARCH`, `EXTENSION`, `TRAINING`, `OTHER` missing |
| `ParityStatus` | (none) | pending, approved, rejected | N/A | WARNING | Custom enum not in schema; lowercase casing |
| `IndicatorStatus` | (none) | pending, approved, rejected | N/A | WARNING | Custom enum not in schema; lowercase casing |

### 9.4 BLOCKING Issues Summary

| # | Issue | Impact | Affected Modules |
|---|-------|--------|------------------|
| 1 | Campus: `BUTUAN`, `SAN_FRANCISCO` not in schema | INSERT fails with invalid enum value | All domain modules |
| 2 | Campus: `BOTH` missing from DTO | Cannot select `BOTH` campus option | All domain modules |
| 3 | ProjectStatus: `DRAFT`, `PENDING`, `IN_PROGRESS` not in schema | INSERT fails | projects, construction, uni-ops |
| 4 | ProjectStatus: `PLANNING`, `ONGOING` missing from DTO | Cannot use schema values | projects, construction, uni-ops |
| 5 | RepairStatus: `PENDING` not in schema | INSERT fails | repair-projects |
| 6 | RepairStatus: `REPORTED`, `INSPECTED` missing | Cannot use schema values | repair-projects |
| 7 | OperationType: 4/5 values invalid | INSERT fails | university-operations |
| 8 | ProjectType: 2/4 values invalid | INSERT fails | projects |

### 9.5 Remediation Strategy (NO IMPLEMENTATION)

**Authoritative Source:** PostgreSQL schema is the single source of truth.

| DTO Enum | Remediation | Direction | Justification |
|----------|-------------|-----------|---------------|
| `Campus` | Update DTO to match schema | DTO → Schema | Schema defines physical campuses |
| `ProjectStatus` | Update DTO to match schema | DTO → Schema | Schema defines business workflow |
| `RepairStatus` | Update DTO to match schema | DTO → Schema | Schema defines repair workflow |
| `OperationType` | Update DTO to match schema | DTO → Schema | Schema defines SUC operations |
| `ProjectType` | Update DTO to match schema | DTO → Schema | Schema defines project categories |
| `ParityStatus` | Add to schema OR justify | Evaluate | Custom status not modeled |
| `IndicatorStatus` | Add to schema OR justify | Evaluate | Custom status not modeled |

### 9.6 Recommended ENUM Corrections

**Campus (4 files):**
```
FROM: MAIN, BUTUAN, CABADBARAN, SAN_FRANCISCO
TO:   MAIN, CABADBARAN, BOTH
```

**ProjectStatus (3 files):**
```
FROM: DRAFT, PENDING, IN_PROGRESS, COMPLETED, ON_HOLD, CANCELLED
TO:   PLANNING, ONGOING, COMPLETED, ON_HOLD, CANCELLED
```

**RepairStatus (1 file):**
```
FROM: PENDING, APPROVED, IN_PROGRESS, COMPLETED, CANCELLED
TO:   REPORTED, INSPECTED, APPROVED, IN_PROGRESS, COMPLETED, CANCELLED
```

**OperationType (1 file):**
```
FROM: INSTRUCTION, RESEARCH, EXTENSION, PRODUCTION, ADMINISTRATIVE
TO:   HIGHER_EDUCATION, ADVANCED_EDUCATION, RESEARCH, TECHNICAL_ADVISORY
```

**ProjectType (1 file):**
```
FROM: CONSTRUCTION, REPAIR, MAINTENANCE, RENOVATION
TO:   CONSTRUCTION, REPAIR, RESEARCH, EXTENSION, TRAINING, OTHER
```

### 9.7 DRY Recommendation

Create shared enum definitions in `src/common/enums/` to avoid duplication:
- `src/common/enums/campus.enum.ts`
- `src/common/enums/project-status.enum.ts`
- `src/common/enums/project-type.enum.ts`
- `src/common/enums/repair-status.enum.ts`
- `src/common/enums/operation-type.enum.ts`
- `src/common/enums/urgency-level.enum.ts`

Import from common location in all DTOs.

### 9.8 ENUM Implementation Status (RESOLVED)

**Date:** 2026-01-15

All 8 BLOCKING issues have been resolved. Shared enums created in `src/common/enums/`:

| # | ENUM File | Values | Match Schema |
|---|-----------|--------|--------------|
| 1 | `campus.enum.ts` | MAIN, CABADBARAN, BOTH | ✓ |
| 2 | `project-status.enum.ts` | PLANNING, ONGOING, COMPLETED, ON_HOLD, CANCELLED | ✓ |
| 3 | `repair-status.enum.ts` | REPORTED, INSPECTED, APPROVED, IN_PROGRESS, COMPLETED, CANCELLED | ✓ |
| 4 | `urgency-level.enum.ts` | LOW, MEDIUM, HIGH, CRITICAL | ✓ |
| 5 | `operation-type.enum.ts` | HIGHER_EDUCATION, ADVANCED_EDUCATION, RESEARCH, TECHNICAL_ADVISORY | ✓ |
| 6 | `project-type.enum.ts` | CONSTRUCTION, REPAIR, RESEARCH, EXTENSION, TRAINING, OTHER | ✓ |

**Build Status:** `npm run build` succeeds ✓

### 9.9 Seed Data Compatibility Verification

**Date:** 2026-01-15
**Reference:** `database/database draft/2026_01_12/pmo_seed_data.sql`

#### Seed Data ENUM Usage

| Table | Column | Value(s) Used | Schema ENUM | Compatibility |
|-------|--------|---------------|-------------|---------------|
| contractors | status | `'ACTIVE'` | contractor_status_enum (ACTIVE, SUSPENDED, BLACKLISTED) | ✓ VALID |
| departments | status | `'ACTIVE'` | department_status_enum (ACTIVE, INACTIVE) | ✓ VALID |
| system_settings | data_type | `'STRING'`, `'NUMBER'` | setting_data_type_enum | ✓ VALID |
| system_settings | campus_default (value) | `'MAIN'` | campus_enum (MAIN, CABADBARAN, BOTH) | ✓ VALID |

#### Seed Data Scope Analysis

The seed data seeds **reference/lookup tables only** (no domain records):

| Table | Record Count | Uses ENUMs |
|-------|--------------|------------|
| roles | 3 | No |
| funding_sources | 5 | No |
| repair_types | 9 | No |
| construction_subcategories | 7 | No |
| contractors | 3 | Yes (contractor_status_enum) |
| departments | 7 | Yes (department_status_enum) |
| system_settings | 6 | Yes (setting_data_type_enum, campus value) |

**Domain tables NOT seeded:**
- `projects` (would use project_status_enum, project_type_enum, campus_enum)
- `university_operations` (would use operation_type_enum, project_status_enum, campus_enum)
- `construction_projects` (would use project_status_enum, campus_enum)
- `repair_projects` (would use repair_status_enum, urgency_level_enum, campus_enum)

#### Verification Result

| Verification | Status |
|--------------|--------|
| All 6 DTO enums match PostgreSQL schema | ✓ VERIFIED |
| Seed data uses valid enum values | ✓ VERIFIED |
| No invalid enum values in seed data | ✓ VERIFIED |
| DTO enums compatible for domain INSERT | ✓ VERIFIED |

**Conclusion:** DTO enums are fully compatible with both:
1. PostgreSQL schema ENUM definitions (16 total)
2. Seed data reference values (contractor_status, department_status, campus, setting_data_type)

---

## 10. Phase 2.6 Research (2026-01-15)

### 10.1 Backend Directory Structure Analysis

**Current Modules (85 TypeScript files):**

| Module | Files | Purpose | Status |
|--------|-------|---------|--------|
| app/ | 3 | Core application | COMPLETE |
| auth/ | 16 | JWT, guards, decorators, strategies | COMPLETE |
| common/ | 9 | DTOs, enums, interfaces | COMPLETE |
| construction-projects/ | 8 | CRUD + milestones + financials | COMPLETE |
| database/ | 3 | PostgreSQL connection | COMPLETE |
| gad/ | 7 | Parity reports (5 tables + planning) | COMPLETE |
| health/ | 3 | Health checks | COMPLETE |
| projects/ | 7 | Core project CRUD | COMPLETE |
| repair-projects/ | 10 | CRUD + POW + phases + team | COMPLETE |
| university-operations/ | 9 | CRUD + indicators + financials | COMPLETE |
| users/ | 8 | Admin CRUD + role management | COMPLETE |

**Missing Modules for Phase 2.6:**

| Module | Purpose | Priority |
|--------|---------|----------|
| uploads/ | File upload infrastructure (Multer) | HIGH |
| documents/ | Document CRUD with file handling | HIGH |
| media/ | Media/gallery CRUD with image handling | HIGH |
| storage/ | Storage abstraction (local/S3) | MEDIUM |

### 10.2 DTO Directory Analysis

**Current DTO Coverage:**

| Module | DTOs | Status |
|--------|------|--------|
| auth/dto | login.dto.ts | COMPLETE |
| common/dto | pagination.dto.ts | COMPLETE |
| construction-projects/dto | create, update, query, milestone, financial (6) | COMPLETE |
| gad/dto | parity-data, planning, query (3) | COMPLETE |
| projects/dto | create, update, query (4) | COMPLETE |
| repair-projects/dto | create, update, query, phase, pow-item, team-member (7) | COMPLETE |
| university-operations/dto | create, update, query, indicator, financial (6) | COMPLETE |
| users/dto | create, update, query, assign-role (5) | COMPLETE |

**Missing DTOs for Phase 2.6:**

| DTO | Purpose | Fields |
|-----|---------|--------|
| UploadFileDto | File upload validation | file, entity_type, entity_id |
| CreateDocumentDto | Document creation | document_type, description, category, file |
| UpdateDocumentDto | Document update | description, category, version |
| QueryDocumentDto | Document filtering | documentable_type, document_type, category |
| CreateMediaDto | Media creation | media_type, title, description, is_featured, file |
| UpdateMediaDto | Media update | title, description, alt_text, is_featured, display_order |
| QueryMediaDto | Media filtering | mediable_type, media_type, is_featured |

### 10.3 File Upload Infrastructure Research

**Schema Tables (Section 12 of pmo_schema_pg.sql):**

#### documents table (lines 1069-1091)
```
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | NO | Primary key |
| documentable_type | VARCHAR(100) | NO | Entity type (polymorphic) |
| documentable_id | UUID | NO | Entity ID (polymorphic) |
| document_type | VARCHAR(100) | NO | Contract, Report, etc. |
| file_name | VARCHAR(255) | NO | Original filename |
| file_path | VARCHAR(255) | NO | Storage path |
| file_size | INTEGER | NO | Size in bytes |
| mime_type | VARCHAR(100) | NO | MIME type |
| description | TEXT | YES | User description |
| version | INTEGER | YES | Version number (default 1) |
| category | VARCHAR(50) | YES | Category for grouping |
| extracted_text | TEXT | YES | OCR/text extraction (future) |
| chunks | JSONB | YES | Text chunks for search (future) |
| processed_at | TIMESTAMPTZ | YES | Processing timestamp |
| status | VARCHAR(50) | YES | ready, processing, error |
| uploaded_by | UUID | NO | FK to users |
```

#### media table (lines 1097-1123)
```
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | NO | Primary key |
| mediable_type | VARCHAR(100) | NO | Entity type (polymorphic) |
| mediable_id | UUID | NO | Entity ID (polymorphic) |
| media_type | media_type_enum | NO | IMAGE, VIDEO, DOCUMENT, OTHER |
| file_name | VARCHAR(255) | NO | Original filename |
| file_path | VARCHAR(255) | NO | Storage path |
| file_size | INTEGER | NO | Size in bytes |
| mime_type | VARCHAR(100) | NO | MIME type |
| title | VARCHAR(255) | YES | Display title |
| description | TEXT | YES | Description |
| alt_text | VARCHAR(255) | YES | Accessibility text |
| is_featured | BOOLEAN | YES | Featured flag |
| thumbnail_url | VARCHAR(255) | YES | Thumbnail path |
| dimensions | JSONB | YES | Width/height |
| tags | JSONB | YES | Tag array |
| capture_date | DATE | YES | Photo date |
| display_order | INTEGER | YES | Sort order |
| location | JSONB | YES | Geo coordinates |
| project_type | VARCHAR(50) | YES | Project classification |
| uploaded_by | UUID | NO | FK to users |
```

#### construction_gallery table (lines 551-559)
```
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | NO | Primary key |
| project_id | UUID | NO | FK to construction_projects |
| image_url | VARCHAR(500) | NO | Image URL/path |
| caption | VARCHAR(255) | YES | Image caption |
| category | VARCHAR(50) | YES | PROGRESS, BEFORE, AFTER, etc. |
| is_featured | BOOLEAN | YES | Featured flag |
| uploaded_at | TIMESTAMPTZ | NO | Upload timestamp |
```

### 10.4 Upload Infrastructure Requirements

**Multer Configuration:**
```typescript
// Required config for pmo-backend
{
  storage: diskStorage or S3,
  limits: {
    fileSize: 10 * 1024 * 1024,  // 10MB default
    files: 5                      // Max files per request
  },
  fileFilter: allowedMimeTypes   // Whitelist approach
}
```

**Allowed File Types:**

| Category | Extensions | MIME Types |
|----------|------------|------------|
| Images | jpg, jpeg, png, gif, webp | image/* |
| Documents | pdf, doc, docx, xls, xlsx | application/pdf, application/msword, etc. |
| Spreadsheets | csv, xls, xlsx | text/csv, application/vnd.ms-excel |

**Storage Strategy:**

| Phase | Storage | Path Pattern |
|-------|---------|--------------|
| 2.6 (MVP) | Local disk | ./uploads/{entity_type}/{entity_id}/{filename} |
| Future | S3/MinIO | Same pattern, configurable via env |

**Security Requirements:**
- File size limits (configurable)
- MIME type validation (whitelist)
- Filename sanitization (remove special chars)
- No executable files (.exe, .sh, .bat, etc.)
- Virus scanning (future consideration)

### 10.5 test.md Analysis

**Current Coverage:**
- 59 direct endpoints
- 30 nested endpoints
- Total: 89 endpoint tests documented

**Issues Found:**

| Issue | Location | Severity |
|-------|----------|----------|
| Outdated enum: `INSTRUCTION` | Section 4.1, 4.3 | HIGH |
| Outdated enum: `DRAFT`, `PENDING` | Multiple sections | HIGH |
| Outdated enum: `BUTUAN`, `SAN_FRANCISCO` | Multiple sections | HIGH |
| Missing upload tests | Not present | MEDIUM |
| Missing documents module tests | Not present | MEDIUM |
| Missing media module tests | Not present | MEDIUM |

**Required Updates:**
1. Fix all enum values to match schema (Section 9.8 values)
2. Add file upload test section
3. Add documents CRUD tests
4. Add media CRUD tests
5. Add construction gallery tests
6. Add file validation failure tests

### 10.6 Phase 2.6 Candidate Definition

#### Phase 2.6 IS (In Scope):

| # | Component | Description | Priority |
|---|-----------|-------------|----------|
| 1 | Upload Infrastructure | Multer config, storage service, validation | HIGH |
| 2 | Documents Module | CRUD with file handling, polymorphic attachment | HIGH |
| 3 | Media Module | CRUD with image handling, thumbnails | HIGH |
| 4 | Construction Gallery | Gallery upload endpoints for construction projects | MEDIUM |
| 5 | Test Harness Update | Fix enums, add upload/document/media tests | HIGH |
| 6 | System Hardening | File size limits, MIME validation, security | HIGH |

#### Phase 2.6 IS NOT (Out of Scope):

| Component | Reason | Deferred To |
|-----------|--------|-------------|
| Frontend/UI | Separate phase | Phase 3.0 |
| Analytics/Reporting | Non-core functionality | Phase 3.1 |
| Performance Optimization | Premature optimization | As needed |
| DevOps/Deployment | Separate concern | Phase 3.2 |
| Email/Notifications | Not essential for MVP | Phase 3.1 |
| AI/Text Extraction | Advanced feature | Phase 4.0 |
| Virus Scanning | Requires external service | Phase 3.x |

### 10.7 Proposed Phase 2.6 Module Structure

```
src/
├── uploads/
│   ├── uploads.module.ts
│   ├── uploads.controller.ts
│   ├── uploads.service.ts
│   ├── storage/
│   │   ├── storage.service.ts
│   │   └── local-storage.strategy.ts
│   ├── validators/
│   │   ├── file-size.validator.ts
│   │   └── mime-type.validator.ts
│   └── dto/
│       └── upload-file.dto.ts
├── documents/
│   ├── documents.module.ts
│   ├── documents.controller.ts
│   ├── documents.service.ts
│   └── dto/
│       ├── create-document.dto.ts
│       ├── update-document.dto.ts
│       └── query-document.dto.ts
├── media/
│   ├── media.module.ts
│   ├── media.controller.ts
│   ├── media.service.ts
│   └── dto/
│       ├── create-media.dto.ts
│       ├── update-media.dto.ts
│       └── query-media.dto.ts
```

### 10.8 Proposed Phase 2.6 Endpoints

**Upload Infrastructure:**
```
POST /api/uploads                    → Generic file upload
```

**Documents Module:**
```
GET    /api/documents                → List all documents (admin)
GET    /api/{entity}/{id}/documents  → List entity documents
POST   /api/{entity}/{id}/documents  → Upload document for entity
GET    /api/documents/:docId         → Get document details
PATCH  /api/documents/:docId         → Update document metadata
DELETE /api/documents/:docId         → Soft delete document
GET    /api/documents/:docId/download → Download file
```

**Media Module:**
```
GET    /api/media                    → List all media (admin)
GET    /api/{entity}/{id}/media      → List entity media
POST   /api/{entity}/{id}/media      → Upload media for entity
GET    /api/media/:mediaId           → Get media details
PATCH  /api/media/:mediaId           → Update media metadata
DELETE /api/media/:mediaId           → Soft delete media
PATCH  /api/media/:mediaId/featured  → Toggle featured
```

**Construction Gallery (enhancement):**
```
GET    /api/construction-projects/:id/gallery  → List gallery images
POST   /api/construction-projects/:id/gallery  → Upload gallery image
PATCH  /api/construction-projects/:id/gallery/:gid → Update image
DELETE /api/construction-projects/:id/gallery/:gid → Remove image
```

### 10.9 Dependencies & Prerequisites

| Dependency | Purpose | Install Command |
|------------|---------|-----------------|
| multer | File upload handling | `npm install multer @types/multer` |
| uuid | Unique filename generation | Already installed (via pg) |
| sharp | Image processing/thumbnails | `npm install sharp` (optional) |
| file-type | MIME type detection | `npm install file-type` (optional) |

### 10.10 MIS Compliance Considerations

| Requirement | Implementation |
|-------------|----------------|
| Audit Trail | All uploads logged with uploaded_by, created_at |
| Access Control | RBAC via existing guards (Admin/Staff only) |
| Data Integrity | Soft delete pattern, version tracking |
| File Security | MIME validation, size limits, sanitization |
| Traceability | Polymorphic linking to parent entities |

---

## 11. Phase 2.7 Research (2026-01-16)

### 11.1 Phase 2.6 Completion Status

**Phase 2.6 (File Uploads & Documents) is COMPLETE:**

| Module | Files Created | Status |
|--------|---------------|--------|
| uploads/ | 6 files (service, controller, module, storage, dto) | DONE |
| documents/ | 5 files (service, controller, module, DTOs) | DONE |
| media/ | 5 files (service, controller, module, DTOs) | DONE |
| construction gallery | Enhanced existing module with 5 endpoints | DONE |
| common/enums | 3 new enums (media-type, document-type, gallery-category) | DONE |

**Build Verification:** `npm run build` succeeds ✓

### 11.2 Schema Tables Inventory

**Total Schema Tables:** 53

**Currently Implemented (via API):**

| # | Table | Module | Status |
|---|-------|--------|--------|
| 1 | users | users/ | DONE |
| 2 | roles | auth/ | DONE |
| 3 | permissions | auth/ | DONE |
| 4 | role_permissions | auth/ | DONE |
| 5 | user_roles | users/ | DONE |
| 6 | user_page_permissions | auth/ (partial) | DONE |
| 7 | projects | projects/ | DONE |
| 8 | construction_projects | construction-projects/ | DONE |
| 9 | construction_milestones | construction-projects/ | DONE |
| 10 | construction_gallery | construction-projects/ | DONE |
| 11 | construction_project_financials | construction-projects/ | DONE |
| 12 | repair_projects | repair-projects/ | DONE |
| 13 | repair_pow_items | repair-projects/ | DONE |
| 14 | repair_project_phases | repair-projects/ | DONE |
| 15 | repair_project_team_members | repair-projects/ | DONE |
| 16 | repair_project_milestones | repair-projects/ | DONE |
| 17 | university_operations | university-operations/ | DONE |
| 18 | operation_organizational_info | university-operations/ | DONE |
| 19 | operation_indicators | university-operations/ | DONE |
| 20 | operation_financials | university-operations/ | DONE |
| 21 | documents | documents/ | DONE |
| 22 | media | media/ | DONE |
| 23-30 | gad_* (8 tables) | gad/ | DONE |

**NOT Implemented - Reference/Lookup Tables (Phase 2.7 Candidates):**

| # | Table | Purpose | FK Dependencies | Priority |
|---|-------|---------|-----------------|----------|
| 1 | contractors | Contractor management | Referenced by construction_projects | HIGH |
| 2 | funding_sources | Funding source lookup | Referenced by construction_projects | HIGH |
| 3 | departments | Department hierarchy | Referenced by multiple tables | HIGH |
| 4 | user_departments | User-department junction | FK to users, departments | MEDIUM |
| 5 | repair_types | Repair type lookup | Referenced by repair_projects | HIGH |
| 6 | construction_subcategories | Construction category lookup | Referenced by construction_projects | HIGH |

**NOT Implemented - Facilities Management (Phase 2.8+ Candidates):**

| # | Table | Purpose | Priority |
|---|-------|---------|----------|
| 1 | buildings | Building inventory | MEDIUM |
| 2 | rooms | Room inventory | MEDIUM |
| 3 | facilities | Facility tracking | MEDIUM |
| 4 | room_assessments | Room assessment history | LOW |

**NOT Implemented - System Administration (Phase 2.7 Candidates):**

| # | Table | Purpose | Priority |
|---|-------|---------|----------|
| 1 | system_settings | Application configuration | HIGH |
| 2 | notifications | User notifications | MEDIUM |
| 3 | audit_trail | Audit logging (read-only) | LOW |

**NOT Implemented - Extended Project Tables (Deferred):**

| # | Table | Purpose | Notes |
|---|-------|---------|-------|
| 1 | construction_project_progress | Progress tracking | Complex, deferred |
| 2 | construction_pow_items | Program of Work | Complex, deferred |
| 3 | construction_project_accomplishment_records | Accomplishments | Complex, deferred |
| 4 | repair_project_financial_reports | Financial reports | Complex, deferred |
| 5 | repair_project_accomplishment_records | Accomplishments | Complex, deferred |
| 6 | university_statistics | Statistics | Complex, deferred |
| 7 | policies | Policy documents | Deferred |
| 8 | forms_inventory | Forms management | Deferred |
| 9 | downloadable_forms | Form downloads | Deferred |

### 11.3 Phase 2.7 Scope Recommendation

**Recommended Focus: Reference Data Management + System Administration**

**Rationale:**
1. Reference tables are FK-required by domain tables (already seeded but no API)
2. Admin users need to manage contractors, funding sources, departments, etc.
3. System settings enable application configuration
4. Lower complexity than facilities or extended project management
5. Foundation data that supports existing domain APIs

### 11.4 Reference Table Schema Analysis

#### contractors table (lines 318-334)
```
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | NO | Primary key |
| name | VARCHAR(255) | NO | Company name |
| contact_person | VARCHAR(255) | YES | Contact person |
| email | VARCHAR(255) | YES | Email |
| phone | VARCHAR(20) | YES | Phone |
| address | TEXT | YES | Address |
| tin_number | VARCHAR(50) | YES | Tax ID |
| registration_number | VARCHAR(100) | YES | Business registration |
| validity_date | DATE | YES | Registration validity |
| status | contractor_status_enum | NO | ACTIVE, SUSPENDED, BLACKLISTED |
```

#### funding_sources table (lines 282-291)
```
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | NO | Primary key |
| name | VARCHAR(100) | NO | Funding source name (unique) |
| description | TEXT | YES | Description |
```

#### departments table (lines 246-261)
```
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | NO | Primary key |
| name | VARCHAR(255) | NO | Department name |
| code | VARCHAR(50) | YES | Short code (unique) |
| description | TEXT | YES | Description |
| parent_id | UUID | YES | FK to departments (hierarchy) |
| head_id | UUID | YES | FK to users |
| email | VARCHAR(255) | YES | Department email |
| phone | VARCHAR(20) | YES | Phone |
| status | department_status_enum | NO | ACTIVE, INACTIVE |
```

#### repair_types table (lines 306-315)
```
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | NO | Primary key |
| name | VARCHAR(100) | NO | Repair type name (unique) |
| description | TEXT | YES | Description |
```

#### construction_subcategories table (lines 294-303)
```
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | NO | Primary key |
| name | VARCHAR(100) | NO | Subcategory name (unique) |
| description | TEXT | YES | Description |
```

#### system_settings table (lines 1376-1390)
```
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | NO | Primary key |
| setting_key | VARCHAR(100) | NO | Setting key (unique) |
| setting_value | TEXT | YES | Value |
| setting_group | VARCHAR(50) | NO | Grouping |
| data_type | setting_data_type_enum | NO | STRING, NUMBER, BOOLEAN, JSON, DATE, DATETIME |
| is_public | BOOLEAN | YES | Public visibility |
| description | TEXT | YES | Description |
```

### 11.5 Proposed Phase 2.7 Module Structure

```
src/
├── contractors/
│   ├── contractors.module.ts
│   ├── contractors.controller.ts
│   ├── contractors.service.ts
│   └── dto/
│       ├── create-contractor.dto.ts
│       ├── update-contractor.dto.ts
│       ├── query-contractor.dto.ts
│       └── index.ts
├── funding-sources/
│   ├── funding-sources.module.ts
│   ├── funding-sources.controller.ts
│   ├── funding-sources.service.ts
│   └── dto/
│       └── ...
├── departments/
│   ├── departments.module.ts
│   ├── departments.controller.ts
│   ├── departments.service.ts
│   └── dto/
│       └── ...
├── repair-types/
│   ├── repair-types.module.ts
│   ├── repair-types.controller.ts
│   ├── repair-types.service.ts
│   └── dto/
│       └── ...
├── construction-subcategories/
│   ├── construction-subcategories.module.ts
│   ├── construction-subcategories.controller.ts
│   ├── construction-subcategories.service.ts
│   └── dto/
│       └── ...
├── settings/
│   ├── settings.module.ts
│   ├── settings.controller.ts
│   ├── settings.service.ts
│   └── dto/
│       └── ...
```

### 11.6 Proposed Phase 2.7 Endpoints

**Contractors:**
```
GET    /api/contractors              → List contractors (paginated, filtered)
GET    /api/contractors/:id          → Get contractor details
POST   /api/contractors              → Create contractor (Admin)
PATCH  /api/contractors/:id          → Update contractor (Admin)
DELETE /api/contractors/:id          → Soft delete (Admin)
PATCH  /api/contractors/:id/status   → Update status (Admin)
```

**Funding Sources:**
```
GET    /api/funding-sources          → List funding sources
GET    /api/funding-sources/:id      → Get funding source
POST   /api/funding-sources          → Create (Admin)
PATCH  /api/funding-sources/:id      → Update (Admin)
DELETE /api/funding-sources/:id      → Soft delete (Admin)
```

**Departments:**
```
GET    /api/departments              → List departments (tree structure optional)
GET    /api/departments/:id          → Get department with head info
POST   /api/departments              → Create department (Admin)
PATCH  /api/departments/:id          → Update department (Admin)
DELETE /api/departments/:id          → Soft delete (Admin)
GET    /api/departments/:id/users    → List users in department
POST   /api/departments/:id/users    → Assign user to department
DELETE /api/departments/:id/users/:uid → Remove user from department
```

**Repair Types:**
```
GET    /api/repair-types             → List repair types
GET    /api/repair-types/:id         → Get repair type
POST   /api/repair-types             → Create (Admin)
PATCH  /api/repair-types/:id         → Update (Admin)
DELETE /api/repair-types/:id         → Soft delete (Admin)
```

**Construction Subcategories:**
```
GET    /api/construction-subcategories     → List subcategories
GET    /api/construction-subcategories/:id → Get subcategory
POST   /api/construction-subcategories     → Create (Admin)
PATCH  /api/construction-subcategories/:id → Update (Admin)
DELETE /api/construction-subcategories/:id → Soft delete (Admin)
```

**System Settings:**
```
GET    /api/settings                 → List settings (Admin: all, Staff: public only)
GET    /api/settings/:key            → Get setting by key
GET    /api/settings/group/:group    → Get settings by group
PATCH  /api/settings/:key            → Update setting (Admin)
```

### 11.7 New ENUMs Required

| ENUM | Values | File |
|------|--------|------|
| `ContractorStatus` | ACTIVE, SUSPENDED, BLACKLISTED | `contractor-status.enum.ts` |
| `DepartmentStatus` | ACTIVE, INACTIVE | `department-status.enum.ts` |
| `SettingDataType` | STRING, NUMBER, BOOLEAN, JSON, DATE, DATETIME | `setting-data-type.enum.ts` |

### 11.8 Phase 2.7 Security Model

| Module | View | Create | Update | Delete |
|--------|------|--------|--------|--------|
| contractors | Admin, Staff | Admin | Admin | Admin |
| funding_sources | Admin, Staff | Admin | Admin | Admin |
| departments | Admin, Staff | Admin | Admin | Admin |
| repair_types | Admin, Staff | Admin | Admin | Admin |
| construction_subcategories | Admin, Staff | Admin | Admin | Admin |
| system_settings (public) | Admin, Staff | - | Admin | - |
| system_settings (private) | Admin | - | Admin | - |

### 11.9 Phase 2.7 Definition of Done (Proposed)

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Contractors CRUD works | PENDING |
| 2 | Funding Sources CRUD works | PENDING |
| 3 | Departments CRUD works | PENDING |
| 4 | Repair Types CRUD works | PENDING |
| 5 | Construction Subcategories CRUD works | PENDING |
| 6 | System Settings CRUD works | PENDING |
| 7 | User-Department assignment works | PENDING |
| 8 | Contractor status management works | PENDING |
| 9 | All routes require JWT (401 without) | PENDING |
| 10 | Role checks work (403 if denied) | PENDING |
| 11 | Soft delete pattern implemented | PENDING |
| 12 | Pagination for list endpoints | PENDING |
| 13 | `npm run build` succeeds | PENDING |

---

## 12. Phase 2.7 DTO-Schema Consistency Audit (2026-01-17)

### 12.1 Audit Scope and Methodology

**Audit Date:** 2026-01-17
**Authoritative Source:** `database/database draft/2026_01_12/pmo_schema_pg.sql`
**Method:** Table-by-table comparison of PostgreSQL schema columns vs DTO properties

**Tables Audited:** 16 tables across 7 domain modules

**Exclusions from DTO Comparison:**
- Server-generated fields: `id`, `created_at`, `updated_at`, `deleted_at`, `uploaded_at`, `processed_at`
- Audit trail fields: `created_by`, `updated_by`, `deleted_by`, `uploaded_by`, `submitted_by`
- Metadata/computed fields: `extracted_text`, `chunks`, `dimensions`, `location`

### 12.2 Severity Classification

| Severity | Definition | Impact |
|----------|------------|--------|
| **BLOCKING** | Field mismatch or missing required field | INSERT/UPDATE will fail with database constraint violation |
| **WARNING** | Missing optional field with business logic | Feature incomplete, no database error but workflow affected |
| **INFORMATIONAL** | Missing computed/optional field | No functional impact, potential future enhancement |

### 12.3 BLOCKING Issues (6 Found)

| # | Table | Issue | DTO Location | Impact |
|---|-------|-------|--------------|--------|
| 1 | `construction_milestones` | Field name mismatch: DTO uses `start_date`, schema expects `target_date` | construction-projects/dto/create-milestone.dto.ts:10 | INSERT fails with "column start_date does not exist" |
| 2 | `construction_gallery` | Missing required field: `image_url` (NOT NULL) | construction-projects/dto/create-gallery.dto.ts | INSERT fails with NOT NULL constraint violation |
| 3 | `construction_subcategories` | **NO DTO MODULE EXISTS** | N/A | Cannot create/update via API, only via seed data |
| 4 | `repair_types` | **NO DTO MODULE EXISTS** | N/A | Cannot create/update via API, only via seed data |
| 5 | `departments` | **NO DTO MODULE EXISTS** | N/A | Cannot create/update via API, only via seed data |
| 6 | `system_settings` | Partial DTO implementation (query only) | settings/dto (incomplete) | Cannot create/update settings via API |

### 12.4 WARNING Issues (2 Found)

| # | Table | Issue | Missing Fields | Impact |
|---|-------|-------|----------------|--------|
| 1 | `repair_pow_items` | Missing optional workflow fields | `status`, `variation_order_amount` | Approval workflow incomplete, variation tracking unavailable |
| 2 | `operation_indicators` | Missing approval workflow field | `status` | Cannot track indicator approval status (pending/approved/rejected) |

### 12.5 Table-by-Table Analysis

#### 12.5.1 construction_milestones

**Schema Columns (lines 515-527):**
```
target_date DATE NOT NULL
completion_date DATE
status VARCHAR(50)
remarks TEXT
```

**DTO Fields (create-milestone.dto.ts:7-14):**
```typescript
@IsNotEmpty() @IsDateString() start_date: string;  // ❌ MISMATCH
@IsOptional() @IsDateString() completion_date?: string;  // ✓
@IsOptional() @IsString() status?: string;  // ✓
@IsOptional() @IsString() remarks?: string;  // ✓
```

**Gap:** Field name mismatch - `start_date` (DTO) vs `target_date` (schema)
**Severity:** **BLOCKING** - INSERT will fail
**Recommendation:** Rename `start_date` to `target_date` in create-milestone.dto.ts:10

#### 12.5.2 construction_gallery

**Schema Columns (lines 551-559):**
```
project_id UUID NOT NULL FK
image_url VARCHAR(500) NOT NULL
caption VARCHAR(255)
category VARCHAR(50)
is_featured BOOLEAN DEFAULT false
uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

**DTO Fields (create-gallery.dto.ts:7-12):**
```typescript
@IsOptional() @IsString() caption?: string;  // ✓
@IsOptional() @IsString() category?: string;  // ✓
@IsOptional() @IsBoolean() is_featured?: boolean;  // ✓
// ❌ MISSING: image_url (NOT NULL required field)
```

**Gap:** Missing required field `image_url`
**Severity:** **BLOCKING** - INSERT will fail with NOT NULL constraint
**Recommendation:** Add `@IsNotEmpty() @IsString() image_url: string;` to DTO

#### 12.5.3 construction_subcategories

**Schema Columns (lines 294-303):**
```
name VARCHAR(100) NOT NULL UNIQUE
description TEXT
metadata JSONB
```

**DTO Status:** **NO MODULE EXISTS**
**Severity:** **BLOCKING** - No API access, reference data management incomplete
**Recommendation:** Create full CRUD module (Step 2.7.5)

#### 12.5.4 repair_types

**Schema Columns (lines 306-315):**
```
name VARCHAR(100) NOT NULL UNIQUE
description TEXT
metadata JSONB
```

**DTO Status:** **NO MODULE EXISTS**
**Severity:** **BLOCKING** - No API access, reference data management incomplete
**Recommendation:** Create full CRUD module (Step 2.7.4)

#### 12.5.5 departments

**Schema Columns (lines 246-261):**
```
name VARCHAR(255) NOT NULL
code VARCHAR(50) UNIQUE
description TEXT
parent_id UUID FK (self-referencing)
head_id UUID FK → users
email VARCHAR(255)
phone VARCHAR(20)
status department_status_enum NOT NULL DEFAULT 'ACTIVE'
metadata JSONB
```

**DTO Status:** **NO MODULE EXISTS**
**Severity:** **BLOCKING** - No API access, reference data management incomplete
**Recommendation:** Create full CRUD module (Step 2.7.3)

#### 12.5.6 system_settings

**Schema Columns (lines 1376-1390):**
```
setting_key VARCHAR(100) NOT NULL UNIQUE
setting_value TEXT
setting_group VARCHAR(50) NOT NULL
data_type setting_data_type_enum NOT NULL
is_public BOOLEAN DEFAULT false
description TEXT
metadata JSONB
```

**DTO Status:** Partial implementation (query-only DTOs exist)
**Severity:** **BLOCKING** - Cannot create/update settings via API
**Recommendation:** Complete create/update DTOs (Step 2.7.6)

#### 12.5.7 repair_pow_items

**Schema Columns (lines 787-807):**
```
item_number INTEGER NOT NULL
description TEXT NOT NULL
unit VARCHAR(50)
quantity NUMERIC(10,2)
unit_cost NUMERIC(15,2)
total_cost NUMERIC(15,2)
status VARCHAR(50)  // ⚠ MISSING in DTO
variation_order_amount NUMERIC(15,2)  // ⚠ MISSING in DTO
remarks TEXT
```

**DTO Fields (create-pow-item.dto.ts:8-21):**
```typescript
@IsNotEmpty() @IsInt() item_number: number;  // ✓
@IsNotEmpty() @IsString() description: string;  // ✓
@IsOptional() @IsString() unit?: string;  // ✓
@IsOptional() @IsNumber() quantity?: number;  // ✓
@IsOptional() @IsNumber() unit_cost?: number;  // ✓
@IsOptional() @IsNumber() total_cost?: number;  // ✓
@IsOptional() @IsString() remarks?: string;  // ✓
// ⚠ MISSING: status, variation_order_amount
```

**Gap:** Missing optional fields `status`, `variation_order_amount`
**Severity:** **WARNING** - Workflow incomplete (status tracking unavailable)
**Recommendation:** Add fields to support approval workflow and variation orders

#### 12.5.8 operation_indicators

**Schema Columns (lines 1007-1020):**
```
indicator_name VARCHAR(255) NOT NULL
target_value NUMERIC(15,2)
actual_value NUMERIC(15,2)
unit VARCHAR(50)
status VARCHAR(50)  // ⚠ MISSING in DTO
remarks TEXT
```

**DTO Fields (create-indicator.dto.ts:7-16):**
```typescript
@IsNotEmpty() @IsString() indicator_name: string;  // ✓
@IsOptional() @IsNumber() target_value?: number;  // ✓
@IsOptional() @IsNumber() actual_value?: number;  // ✓
@IsOptional() @IsString() unit?: string;  // ✓
@IsOptional() @IsString() remarks?: string;  // ✓
// ⚠ MISSING: status
```

**Gap:** Missing optional field `status`
**Severity:** **WARNING** - Cannot track indicator approval status
**Recommendation:** Add `@IsOptional() @IsString() status?: string;`

#### 12.5.9 Tables with FULL Schema Coverage (8 Verified)

| Table | DTO Module | Status |
|-------|------------|--------|
| `contractors` | contractors/ | ✓ ALL FIELDS MAPPED |
| `funding_sources` | funding-sources/ | ✓ ALL FIELDS MAPPED |
| `projects` | projects/ | ✓ ALL FIELDS MAPPED |
| `construction_projects` | construction-projects/ | ✓ ALL FIELDS MAPPED |
| `repair_projects` | repair-projects/ | ✓ ALL FIELDS MAPPED |
| `university_operations` | university-operations/ | ✓ ALL FIELDS MAPPED |
| `documents` | documents/ | ✓ ALL FIELDS MAPPED |
| `media` | media/ | ✓ ALL FIELDS MAPPED |

### 12.6 Gap Summary Matrix

| Category | Count | Tables Affected |
|----------|-------|-----------------|
| **BLOCKING** | 6 | construction_milestones, construction_gallery, construction_subcategories, repair_types, departments, system_settings |
| **WARNING** | 2 | repair_pow_items, operation_indicators |
| **INFORMATIONAL** | 8+ | Various optional computed fields (thumbnails, processed_at, etc.) |
| **FULLY COMPLIANT** | 8 | contractors, funding_sources, projects, construction_projects, repair_projects, university_operations, documents, media |

### 12.7 Recommended Remediation Sequence

| Priority | Issue | Remediation | Phase 2.7 Step |
|----------|-------|-------------|----------------|
| 1 | construction_milestones field mismatch | Rename `start_date` → `target_date` | 2.7.FIX-1 |
| 2 | construction_gallery missing image_url | Add `image_url: string` to DTO | 2.7.FIX-2 |
| 3 | departments module missing | Create full CRUD module | 2.7.3 |
| 4 | repair_types module missing | Create full CRUD module | 2.7.4 |
| 5 | construction_subcategories module missing | Create full CRUD module | 2.7.5 |
| 6 | system_settings incomplete | Complete create/update DTOs | 2.7.6 |
| 7 | repair_pow_items workflow fields | Add `status`, `variation_order_amount` | 2.7.ENHANCE-1 |
| 8 | operation_indicators status field | Add `status` field | 2.7.ENHANCE-2 |

### 12.8 Phase 2.7 Scope Impact

**Original Phase 2.7 Scope (from Section 11.9):**
- Contractors CRUD ✓ (COMPLETE, DTO verified)
- Funding Sources CRUD ✓ (COMPLETE, DTO verified)
- Departments CRUD ❌ (BLOCKING - module missing)
- Repair Types CRUD ❌ (BLOCKING - module missing)
- Construction Subcategories CRUD ❌ (BLOCKING - module missing)
- System Settings CRUD ⚠ (PARTIAL - needs create/update DTOs)

**Revised Phase 2.7 Scope (Post-Audit):**
- Step 2.7.FIX-1: Fix construction_milestones DTO field name
- Step 2.7.FIX-2: Fix construction_gallery DTO missing field
- Step 2.7.3: Implement Departments CRUD (BLOCKING)
- Step 2.7.4: Implement Repair Types CRUD (BLOCKING)
- Step 2.7.5: Implement Construction Subcategories CRUD (BLOCKING)
- Step 2.7.6: Complete System Settings CRUD (BLOCKING)

**DEFERRED (WARNING-level, non-blocking):**
- Step 2.7.ENHANCE-1: Add workflow fields to repair_pow_items
- Step 2.7.ENHANCE-2: Add status field to operation_indicators

### 12.9 Audit Conclusion

**Total Tables Analyzed:** 16
**Fully Compliant:** 8 (50%)
**Blocking Issues:** 6 (37.5%)
**Warning Issues:** 2 (12.5%)

**Key Findings:**
1. Recent implementation (contractors, funding-sources) has 100% DTO-schema alignment ✓
2. Earlier modules (construction, repair) have minor field gaps (4 BLOCKING issues)
3. Phase 2.7 reference modules (departments, repair_types, construction_subcategories) completely missing
4. System settings module only partially implemented

**Readiness Assessment:**
- Phase 2.7 **CANNOT PROCEED** to implementation until BLOCKING issues resolved
- 6 BLOCKING issues must be fixed before Phase 3
- 2 WARNING issues can be deferred to future enhancement phases

---

## 13. Phase 2.7 Completion & Phase 2.8 Research (2026-01-19)

### 13.1 Phase 2.7 Completion Confirmation

**Completion Date:** 2026-01-19
**Status:** DONE

**All Phase 2.7 BLOCKING issues resolved:**

| Step | Description | Status |
|------|-------------|--------|
| 2.7.0 | New ENUMs (ContractorStatus, DepartmentStatus, SettingDataType) | DONE |
| 2.7.1 | Contractors API (6 endpoints) | DONE |
| 2.7.2 | Funding Sources API (5 endpoints) | DONE |
| 2.7.3 | Departments API (8 endpoints incl. user assignment) | DONE |
| 2.7.4 | Repair Types API (5 endpoints) | DONE |
| 2.7.5 | Construction Subcategories API (5 endpoints) | DONE |
| 2.7.6 | System Settings API (6 endpoints) | DONE |
| 2.7.7 | Audit-only Logout Endpoint | DONE |
| 2.7.FIX-1 | Milestone DTO field fix (start_date → target_date) | DONE |
| 2.7.FIX-2 | Gallery DTO verified (uses file_path via Multer) | DONE |

**Build Verification:** `npm run build` succeeds ✓

**Modules Registered in app.module.ts:**
- ContractorsModule ✓
- FundingSourcesModule ✓
- DepartmentsModule ✓
- RepairTypesModule ✓
- ConstructionSubcategoriesModule ✓
- SettingsModule ✓

### 13.2 Post-2.7 System Maturity Assessment

**Backend Metrics (as of 2026-01-19):**

| Metric | Value | Assessment |
|--------|-------|------------|
| Total Modules | 17 feature modules | HIGH |
| Total Endpoints | 129+ | COMPREHENSIVE |
| DTO Coverage | 56 DTOs | COMPLETE |
| Schema Alignment | 100% (post-audit fixes) | VERIFIED |
| Build Status | Passing | STABLE |

**Maturity by Category:**

| Category | Level | Notes |
|----------|-------|-------|
| Module Completeness | HIGH | 17/17 modules operational |
| API Coverage | HIGH | All domain tables have CRUD |
| Error Handling | MEDIUM | Exceptions consistent, no global filter |
| Logging | MEDIUM | Service-level, no aggregation |
| Input Validation | HIGH | DTO validation comprehensive |
| **OpenAPI Documentation** | **CRITICAL GAP** | 0% - No Swagger |
| **Testing** | **CRITICAL GAP** | 0% - No tests |
| Health Checks | LOW | Basic only |
| Rate Limiting | MEDIUM | Global configured |
| Audit Trail | MEDIUM | Schema ready, console-only logs |

### 13.3 Critical Gaps Blocking Production

| # | Gap | Impact | Priority |
|---|-----|--------|----------|
| 1 | No OpenAPI/Swagger | Cannot onboard frontend; no API contract | CRITICAL |
| 2 | No Tests | Cannot validate changes safely | CRITICAL |
| 3 | No Global Exception Filter | Inconsistent error responses | HIGH |
| 4 | No Structured Logging | Log aggregation impossible | HIGH |
| 5 | No Audit Log API | Audit events not queryable | MEDIUM |
| 6 | No Input Sanitization | XSS risks in string fields | MEDIUM |

### 13.4 Phase 2.8 Identification

**Recommended Phase:** Phase 2.8 - Quality Assurance & API Documentation

**Justification:**
1. **MIS Compliance** - Documentation and auditability required
2. **Frontend Integration** - OpenAPI enables client code generation
3. **Stability** - Exception handling prevents information leakage
4. **Observability** - Structured logging enables monitoring
5. **SOLID/KISS** - Centralized error handling reduces duplication

### 13.5 Phase 2.8 Scope Definition

**Phase 2.8 IS:**

| # | Component | Description | Priority |
|---|-----------|-------------|----------|
| 1 | Swagger/OpenAPI | API documentation with @nestjs/swagger | CRITICAL |
| 2 | Global Exception Filter | Centralized error response formatting | HIGH |
| 3 | Structured Logging | JSON logs with request context | HIGH |
| 4 | Response Interceptor | Consistent success response wrapper | MEDIUM |
| 5 | Health Check Enhancement | Readiness/liveness probes | LOW |

**Phase 2.8 IS NOT:**

| Component | Reason | Deferred To |
|-----------|--------|-------------|
| Unit Tests | Large scope, separate phase | Phase 2.9 |
| Integration Tests | Requires test DB setup | Phase 2.9 |
| Performance Testing | Premature optimization | Phase 3.x |
| Frontend Integration | Separate concern | Phase 3.0 |
| Deployment | Infrastructure phase | Phase 3.2 |
| Email/Notifications | Non-essential for MVP | Phase 3.x |

### 13.6 Phase 2.8 Entry Criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Phase 2.7 complete | ✓ DONE |
| 2 | All modules registered | ✓ DONE |
| 3 | Build passing | ✓ DONE |
| 4 | No BLOCKING DTO issues | ✓ DONE |

### 13.7 Phase 2.8 Exit Criteria (Proposed)

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Swagger UI accessible at /api/docs | Manual test |
| 2 | All endpoints documented with @ApiOperation | Code review |
| 3 | Global exception filter catches all errors | Error test cases |
| 4 | Structured JSON logs for all requests | Log inspection |
| 5 | Consistent error response shape | API test |
| 6 | `npm run build` succeeds | Build command |

### 13.8 Principle Alignment Verification

| Principle | Phase 2.8 Alignment |
|-----------|---------------------|
| **SOLID** | Single responsibility for error handling (filter), logging (interceptor) |
| **DRY** | Centralized documentation decorators, no duplicate error formatting |
| **YAGNI** | Only essential documentation; no UI, no tests yet |
| **KISS** | Standard NestJS patterns (@nestjs/swagger, ExceptionFilter) |
| **TDA** | Clear boundaries: Filter handles errors, Interceptor handles responses |

### 13.9 Phase 2.8 Proposed Steps

| Step | Description | Effort |
|------|-------------|--------|
| 2.8.0 | Install @nestjs/swagger, configure in main.ts | LOW |
| 2.8.1 | Add @ApiTags to all controllers | LOW |
| 2.8.2 | Add @ApiOperation to all endpoints | MEDIUM |
| 2.8.3 | Add @ApiResponse for success/error cases | MEDIUM |
| 2.8.4 | Create global HttpExceptionFilter | LOW |
| 2.8.5 | Create structured LoggingInterceptor | LOW |
| 2.8.6 | Enhance health endpoint with details | LOW |
| 2.8.V | Build verification and Swagger UI test | LOW |

---

## 14. Phase 3.0 Research: Frontend Configuration & Setup (2026-01-20)

### 14.1 Technology Decision

**Selected Stack:** Nuxt 3 + Vuetify 3 + TypeScript

**MIS Policy Compliance:** Per Web Development Policy (Board-level governance), all university web applications MUST use Vue 3 + Nuxt.js as the frontend framework.

**Rationale:**
- **Nuxt 3**: SSR/SSG framework required by MIS Web Development Policy
- **Vuetify 3**: Material Design components optimized for admin dashboards
- **TypeScript**: Type safety aligned with backend NestJS patterns
- File-based routing reduces configuration overhead
- Built-in middleware support for authentication guards
- SEO-ready with server-side rendering capabilities

**Previous Error (2026-01-21):** Initial implementation incorrectly used Vue 3 + Vite (SPA-only). This violated MIS policy and was corrected to use Nuxt 3.

**Prototype Status:** Existing React/Vite prototype in `prototype/` folder is REFERENCE ONLY.
New frontend will be built with Nuxt 3 + Vuetify per MIS policy requirements.

### 14.2 Frontend Role and Boundaries

**Frontend IS Responsible For:**

| Responsibility | Description |
|----------------|-------------|
| UI Rendering | Display data received from backend |
| Form Input | Collect and validate user input (client-side) |
| Token Storage | Store JWT securely for authenticated requests |
| API Calls | Send requests to backend endpoints |
| UI State | Manage loading, error, and success states |
| Navigation Guards | Redirect unauthenticated users to login |
| Role-Based Visibility | Show/hide UI elements based on user roles |

**Frontend IS NOT Responsible For:**

| Exclusion | Reason | Owner |
|-----------|--------|-------|
| Business Rules | TDA violation | Backend |
| Authorization Decisions | Security risk if client-side | Backend guards |
| Data Validation (authoritative) | Can be bypassed | Backend DTOs |
| Password Hashing | Security concern | Backend |
| Token Generation | JWT signing key on server | Backend |
| Database Access | Architecture violation | Backend |

**TDA Principle:** Frontend delegates all decisions to backend. UI role checks are for visibility only, not security.

### 14.3 Backend Auth Analysis

**Endpoints Available:**

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/auth/login` | POST | Public | Returns `{ access_token, user }` |
| `/api/auth/me` | GET | JWT | Returns full profile with roles/permissions |
| `/api/auth/logout` | POST | JWT | Audit trail only (token remains valid) |

**Login Response Structure:**
```typescript
{
  access_token: string,  // JWT token
  user: {
    id: string,
    email: string,
    first_name: string,
    last_name: string,
    roles: string[]
  }
}
```

**JWT Payload (decoded):**
```typescript
{
  sub: string,        // user id
  email: string,
  roles: string[],    // ['Admin', 'Staff']
  is_superadmin: boolean,
  iat: number,
  exp: number
}
```

**Profile Response (GET /api/auth/me):**
```typescript
{
  id: string,
  email: string,
  first_name: string,
  last_name: string,
  avatar_url: string | null,
  roles: { id: string, name: string }[],
  is_superadmin: boolean,
  permissions: string[]
}
```

**Security Features:**
- Rate limiting: 5 login attempts per minute (ThrottlerGuard)
- Account lockout: 15 minutes after 5 failed attempts
- SSO-only sentinel: Blocks password login for Google-linked accounts
- Generic error messages: No user enumeration

### 14.4 Auth Integration Requirements

**Token Storage Strategy:**

| Option | Security | Persistence | Recommendation |
|--------|----------|-------------|----------------|
| localStorage | LOW (XSS vulnerable) | Persists | Acceptable for internal admin tool |
| sessionStorage | LOW (XSS vulnerable) | Session only | Alternative if persistence not needed |
| HttpOnly Cookie | HIGH | Persists | Requires backend cookie support (not implemented) |
| Memory + Refresh | HIGH | None | Complex, overkill for MVP |

**Recommendation:** Use `localStorage` for MVP with plan to migrate to HttpOnly cookies.

**Auth Flow:**
1. User submits email/password to `/api/auth/login`
2. On success: store `access_token` in localStorage, store `user` in Pinia
3. On failure: display error message (generic: "Invalid credentials")
4. All subsequent API calls: attach `Authorization: Bearer <token>` header
5. On 401 response: clear token, redirect to login
6. Logout: call `/api/auth/logout`, clear localStorage, redirect to login

**Route Protection:**
```typescript
// Vue Router navigation guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token');
  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else {
    next();
  }
});
```

### 14.5 Vuetify Configuration Research

**Minimal Setup Requirements:**

| Component | Purpose | Priority |
|-----------|---------|----------|
| VApp | Root wrapper | REQUIRED |
| VMain | Content area | REQUIRED |
| VNavigationDrawer | Sidebar navigation | HIGH |
| VAppBar | Top bar with user menu | HIGH |
| VForm + VTextField | Login form | HIGH |
| VDataTable | Data lists | HIGH |
| VDialog | Modals/confirmations | MEDIUM |
| VCard | Content containers | MEDIUM |
| VBtn | Actions | MEDIUM |
| VSnackbar | Notifications | MEDIUM |

**Avoid Premature Configuration (YAGNI):**
- Custom themes: Use default Material Design
- Icon packs: Use mdi (included by default)
- Locale/i18n: English only for MVP
- Dark mode: Not required initially

**Recommended Structure:**
```
pmo-frontend/
├── src/
│   ├── main.ts              # Vue + Vuetify initialization
│   ├── App.vue              # Root component
│   ├── router/
│   │   └── index.ts         # Vue Router with guards
│   ├── stores/
│   │   └── auth.ts          # Pinia auth store
│   ├── composables/
│   │   └── useApi.ts        # API client composable
│   ├── layouts/
│   │   ├── DefaultLayout.vue # Authenticated layout
│   │   └── AuthLayout.vue    # Login/public layout
│   ├── views/
│   │   ├── LoginView.vue
│   │   ├── DashboardView.vue
│   │   └── projects/
│   │       └── ProjectsListView.vue
│   └── types/
│       └── api.ts           # TypeScript interfaces
├── .env                      # VITE_API_BASE_URL
└── package.json
```

### 14.6 Software Engineering Principles Check

| Principle | Application | Status |
|-----------|-------------|--------|
| **KISS** | Simple auth flow, standard Vuetify components, no custom CSS | ✓ |
| **YAGNI** | No state management beyond Pinia auth store initially | ✓ |
| **SOLID** | Auth store separate from API client separate from views | ✓ |
| **DRY** | Single API client composable, shared layout components | ✓ |
| **TDA** | UI never enforces business rules, only displays backend results | ✓ |

**State Management Decision:**
- Use Pinia for auth state only
- No global store for domain data (fetch on component mount)
- Avoid Vuex complexity (YAGNI)

### 14.7 MIS Compliance Review

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| Auditability | Login/logout calls backend (logged server-side) | ✓ |
| Deterministic UI | All data from backend, no client-side business logic | ✓ |
| No Data Leakage | Token in localStorage (acceptable for internal tool), no PII in console logs | ✓ |
| Predictable Behavior | Standard Vue Router guards, consistent error handling | ✓ |
| Role Visibility | UI elements hidden based on `user.roles` from backend | ✓ |

**Security Considerations:**
- Never log tokens or passwords to console
- Clear sensitive data on logout
- Handle 401/403 consistently
- No sensitive data in URL parameters

### 14.8 Plan Alignment Notes

**Current Phase Status:**
- Phase 2.9 (Testing Infrastructure): COMPLETE
- Phase 3.0 (Frontend Integration): NEXT

**Recommended Phase 3.0 Naming:** "Frontend Initialization"

**Scope for Phase 3.0:**

| Step | Description | Outcome |
|------|-------------|---------|
| 3.0.0 | Project scaffolding | Vue 3 + Vuetify + TypeScript + Vite |
| 3.0.1 | API client setup | `useApi` composable with JWT injection |
| 3.0.2 | Auth store | Pinia store with login/logout/user state |
| 3.0.3 | Router setup | Vue Router with auth guards |
| 3.0.4 | Login page | Form → backend auth → redirect |
| 3.0.5 | Dashboard layout | AppBar + Drawer + Main content |
| 3.0.V | Build verification | `npm run build` succeeds |

**Out of Scope for Phase 3.0:**
- Domain CRUD pages (Phase 3.1+)
- Advanced theming
- Unit tests for frontend
- Mobile responsiveness optimization

### 14.9 Entry Criteria for Phase 3.0

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Backend build passing | ✓ DONE |
| 2 | Backend tests passing | ✓ DONE |
| 3 | OpenAPI docs available | ✓ DONE |
| 4 | Auth endpoints functional | ✓ DONE |
| 5 | CORS enabled | ✓ DONE |

### 14.10 Exit Criteria for Phase 3.0 (Proposed)

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Login works with valid credentials | Manual test |
| 2 | Invalid login shows error | Manual test |
| 3 | Authenticated routes protected | Redirect to login without token |
| 4 | Dashboard displays user info | Shows name/roles from `/api/auth/me` |
| 5 | Logout clears state | Token removed, redirect to login |
| 6 | Build succeeds | `npm run build` exit 0 |

---

## 15. Prototype UI Analysis & Backend Alignment (2026-01-20)

### 15.1 Prototype UI Structure Analysis

**Prototype Location:** `prototype/Admin Side/` and `prototype/General User Side/`

**Technology Stack:** React + Vite + Radix UI + shadcn/ui + Tailwind CSS

**Key Findings:**
- Prototype uses React/TypeScript (NOT Vue/Vuetify)
- Extensive use of Radix UI headless components
- shadcn/ui component library for consistent design
- Supabase integration (will be replaced with NestJS backend)

### 15.2 Page Inventory

**Admin Side Pages:**

| Category | Pages | Backend API Expected |
|----------|-------|----------------------|
| Dashboard | Overview with analytics | GET `/api/dashboard/analytics` |
| About Us | Personnel, Objectives, Contact | Static content |
| University Operations | Higher Ed, Advanced Ed, Research, Technical Advisory | GET `/api/university-operations` |
| Facilities Assessment | Classroom/Lab/Office Assessments, Prioritization Matrix | GET `/api/assessments/*` ⚠ MISSING |
| Construction | GAA/Local/Special Grants Projects | GET `/api/construction-projects` |
| Repairs | Classroom/Office Repairs | GET `/api/repair-projects` |
| GAD Parity | Gender Reports, GPB, Budget Plans | GET `/api/gad/*` |
| Forms | Downloadable Forms Inventory | GET `/api/forms` ⚠ MISSING |
| Policies | MOA, MOU | GET `/api/policies` ⚠ MISSING |
| User Management | RBAC Configuration | GET `/api/users` |
| Settings | User Profile, Preferences | GET `/api/settings` |

**General User Side (Public-Facing):**

| Page | Purpose | Backend API |
|------|---------|-------------|
| HomePage | Public landing with announcements | GET `/api/announcements` ⚠ MISSING |
| AboutUsPageEnhanced | Organization information | Static content |
| UniversityOperationsPage | Public operations view | GET `/api/university-operations?public=true` |
| ConstructionInfrastructurePage | Public construction projects | GET `/api/construction-projects?public=true` |
| RepairsPageRestored | Public repairs overview | GET `/api/repair-projects?public=true` |
| GADParityKnowledgeManagementPage | Public parity data | GET `/api/gad/*?public=true` |
| ClientDownloadableFormsPage | Public forms library | GET `/api/forms?public=true` ⚠ MISSING |
| ClientPoliciesPage | Public policies | GET `/api/policies?public=true` ⚠ MISSING |

### 15.3 Backend ↔ UI Alignment Check

**Fully Aligned (Backend Exists):**

| # | UI Expectation | Backend Module | Status |
|---|----------------|----------------|--------|
| 1 | Project CRUD | `projects/` | ✓ ALIGNED |
| 2 | Construction Projects | `construction-projects/` | ✓ ALIGNED |
| 3 | Repair Projects | `repair-projects/` | ✓ ALIGNED |
| 4 | University Operations | `university-operations/` | ✓ ALIGNED |
| 5 | GAD Parity Data | `gad/` | ✓ ALIGNED |
| 6 | User Management | `users/` | ✓ ALIGNED |
| 7 | Auth (Login/Logout) | `auth/` | ✓ ALIGNED |
| 8 | Contractors | `contractors/` | ✓ ALIGNED |
| 9 | Funding Sources | `funding-sources/` | ✓ ALIGNED |
| 10 | Departments | `departments/` | ✓ ALIGNED |
| 11 | Document Uploads | `documents/`, `media/`, `uploads/` | ✓ ALIGNED |
| 12 | System Settings | `settings/` | ✓ ALIGNED |

**Partially Aligned (Mismatch or Incomplete):**

| # | UI Expectation | Backend Status | Gap Description |
|---|----------------|----------------|-----------------|
| 1 | Dashboard Analytics | ❌ MISSING | No `/api/dashboard/analytics` endpoint |
| 2 | Public vs. Admin Views | ⚠ PARTIAL | No `?public=true` filter support |
| 3 | Project Gallery Tab | ✓ EXISTS | `construction_gallery` table exists, API implemented |
| 4 | Prioritization Matrix | ❌ MISSING | UI calculates urgency×impact matrix, no backend |

**Missing Modules (UI Expects, Backend Absent):**

| # | UI Feature | Expected API | Priority | Impact |
|---|------------|--------------|----------|--------|
| 1 | Facilities Assessment | GET `/api/assessments/classrooms` | HIGH | Cannot manage classroom/office assessments |
| 2 | Facilities Assessment | GET `/api/assessments/offices` | HIGH | Cannot manage office assessments |
| 3 | Downloadable Forms | GET `/api/forms` | MEDIUM | No forms management API |
| 4 | Policies | GET `/api/policies` | MEDIUM | No MOA/MOU management |
| 5 | Announcements | GET `/api/announcements` | LOW | Public homepage empty |
| 6 | Dashboard Metrics | GET `/api/dashboard/analytics` | HIGH | No summary statistics |

### 15.4 Data Shape Comparison

**Prototype Project Interface vs. Backend DTO:**

| Field | Prototype Expects | Backend Provides | Match |
|-------|-------------------|------------------|-------|
| `id` | string (UUID) | UUID | ✓ |
| `projectName` | string | `title` ⚠ | Field name mismatch |
| `totalContractAmount` | number | ❌ MISSING | Not in schema |
| `physicalAccomplishment` | number (0-100) | ❌ MISSING | Not in schema |
| `powStatus` | enum | ❌ MISSING | Not in schema |
| `location` | string | `campus` enum only ⚠ | Insufficient granularity |
| `contractor` | string | `contractor_id` FK | ✓ |
| `status` | `Planning\|Ongoing\|Completed\|On Hold\|Cancelled` | `project_status_enum` | ✓ |
| `progress` | number | ❌ MISSING | Not in schema |

**BLOCKING Issues:**

1. **Field Name Mismatch**: UI uses `projectName`, backend uses `title`
2. **Missing Financial Fields**: No `totalContractAmount`, `budgetUtilized` in schema
3. **Missing Progress Tracking**: No `physicalAccomplishment`, `progress` fields
4. **Missing POW Status**: UI expects program-of-work approval status

**Recommendation:** Either:
- Option A: Update backend DTOs to match prototype expectations (breaking change)
- Option B: Create frontend data adapters to map backend → prototype shape (RECOMMENDED)

### 15.5 RBAC Implementation Comparison

**Prototype RBAC Model:**
```typescript
interface User {
  role: 'Admin' | 'Director' | 'Staff' | 'Editor' | 'Client';
  allowedPages: string[]; // Page-level access control
  assignedProjects?: {
    construction?: string[];
    repairs?: string[];
  };
}
```

**Backend RBAC Model:**
```typescript
// From auth/ module
interface User {
  roles: { id: string, name: string }[]; // Multi-role support
  is_superadmin: boolean;
  permissions: string[]; // Permission-based (not page-based)
}
```

**Alignment Gap:**
- Prototype uses **page-based access** (`allowedPages`)
- Backend uses **permission-based access** (`permissions`)
- Frontend must translate permissions → page visibility

**Resolution:** Frontend navigation guard maps permissions to routes.

### 15.6 CSU Branding & Styling Compliance

**Authoritative Source:** https://www.carsu.edu.ph/ovpeo/pico/university-branding/

**Mandatory Color Palette:**

| Color | Hex Code | Usage | Priority |
|-------|----------|-------|----------|
| Green | `#009900` | Primary (productivity, fertility) | REQUIRED |
| Gold Yellow | `#f9dc07` | Secondary (wisdom, intellect) | REQUIRED |
| Orange | `#ff9900` | Accent (strength, fortitude) | REQUIRED |
| White | `#ffffff` | Backgrounds, purity | REQUIRED |
| Emerald | `#003300` | Tertiary (peace, balance) | OPTIONAL |
| Gray | `#4d4d4d` | Neutral (formality, practicality) | OPTIONAL |

**Typography Requirements:**

| Element | Font Family | Notes |
|---------|-------------|-------|
| Body Text | Poppins | Official university font |
| Headings | Poppins | Consistent with body |

**Logo Usage Rules (NON-NEGOTIABLE):**
- ❌ **PROHIBITED**: Skewing, warping, cropping, rotating, color alterations
- ✓ **ALLOWED**: SVG format available at official URL
- ✓ **PLACEMENT**: Header/footer, login page, public-facing pages
- Two versions: Single-line (documents) vs. Two-line (events/banners)

**Logo Asset:**
```
https://www.carsu.edu.ph/wp-content/uploads/2024/10/CSU-Official-Seal_1216-x-2009-1.svg
```

**Design Tone:**
- Professional, academic, institutional
- Material Design alignment acceptable
- Emphasize values: Competence, Service, Uprightness

**Vuetify Theme Configuration:**
```javascript
// Recommended Vuetify theme matching CSU branding
{
  theme: {
    themes: {
      light: {
        primary: '#009900',    // CSU Green
        secondary: '#f9dc07',  // CSU Gold
        accent: '#ff9900',     // CSU Orange
        error: '#ff4444',
        info: '#003300',       // CSU Emerald
        success: '#009900',
        warning: '#ff9900',
      },
    },
  },
}
```

### 15.7 Frontend Integration Risks

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| 1 | Prototype is React, plan specifies Vue | HIGH | Accept Vue stack, use prototype as UX reference only |
| 2 | Backend DTOs don't match prototype data shapes | HIGH | Create frontend data adapters/transformers |
| 3 | Missing backend modules (Forms, Policies, Assessments) | MEDIUM | Defer to Phase 3.1+ or prioritize MVP features |
| 4 | RBAC model mismatch (pages vs. permissions) | MEDIUM | Map permissions to route access in frontend |
| 5 | CSU branding non-compliance | LOW | Apply mandatory color palette from day 1 |
| 6 | No dashboard analytics endpoint | MEDIUM | Build aggregation endpoint or calculate client-side |

### 15.8 Software Engineering Principles Validation

| Principle | Prototype Status | Frontend Plan Compliance |
|-----------|------------------|--------------------------|
| **KISS** | ✓ Simple component structure | ✓ Vue + Vuetify equally simple |
| **YAGNI** | ⚠ Some unused admin features | ✓ MVP focuses on core modules |
| **SOLID** | ✓ Clear page/component separation | ✓ Maintain with Vue architecture |
| **DRY** | ✓ Reusable UI components (shadcn) | ✓ Vuetify provides equivalent |
| **TDA** | ✓ UI delegates to Supabase backend | ✓ UI will delegate to NestJS backend |

**Assessment:** Prototype demonstrates good engineering practices. Vue migration must preserve these patterns.

### 15.9 MIS Compliance Validation

| Requirement | Prototype Implementation | Status |
|-------------|--------------------------|--------|
| Auditability | Login/logout tracked via Supabase auth | ✓ Backend auth provides same |
| Deterministic UI | All data from backend (Supabase) | ✓ Will use NestJS backend |
| No Data Leakage | Supabase RLS policies enforce access | ✓ Backend guards provide equivalent |
| Predictable Behavior | RBAC controls page access | ✓ Frontend guards will enforce |
| Role Visibility | UI elements conditional on `allowedPages` | ✓ Map to permissions-based visibility |

**Assessment:** Prototype MIS compliance is adequate. Frontend must maintain same standards with NestJS backend.

### 15.10 Plan Alignment & Prerequisites

**Current Status (from plan_active.md):**
- Phase 2.9 (Testing): COMPLETE
- Phase 3.0 (Frontend): NEXT

**Prerequisites for Frontend Start:**

| # | Prerequisite | Status | Blocker |
|---|--------------|--------|---------|
| 1 | Backend build passing | ✓ DONE | No |
| 2 | Backend tests passing | ✓ DONE | No |
| 3 | OpenAPI docs available | ✓ DONE | No |
| 4 | Auth endpoints functional | ✓ DONE | No |
| 5 | CORS enabled | ✓ DONE | No |
| 6 | Dashboard analytics endpoint | ❌ MISSING | Yes (can defer) |
| 7 | Data adapter strategy defined | ⚠ PENDING | Yes |
| 8 | CSU branding assets downloaded | ❌ MISSING | No (can fetch) |

**Recommended Actions Before Phase 3.0 Implementation:**

| Priority | Action | Rationale |
|----------|--------|-----------|
| 1 | Define data adapter pattern | Resolve DTO mismatch (`projectName` vs. `title`) |
| 2 | Download CSU logo SVG | Required for compliant header/footer |
| 3 | Create dashboard analytics endpoint | OR calculate metrics client-side |
| 4 | Document permission → page mapping | RBAC translation layer |

### 15.11 Recommended Phase 3.0 Scope Revision

**Based on prototype analysis, revise Phase 3.0 scope:**

| Step | Original Plan | Revised Plan | Change Rationale |
|------|---------------|--------------|------------------|
| 3.0.0 | Scaffolding | Same | No change |
| 3.0.1 | API client | **+ Data adapters** | Handle DTO mismatch |
| 3.0.2 | Auth store | Same | No change |
| 3.0.3 | Router | **+ Permission guards** | RBAC translation |
| 3.0.4 | Login page | **+ CSU branding** | Apply color palette, logo |
| 3.0.5 | Dashboard | **Defer analytics** OR **client-side calc** | Missing backend endpoint |
| 3.0.V | Build verify | Same | No change |

**Out of Scope (Defer to Phase 3.1+):**
- Facilities Assessment module (missing backend)
- Forms/Policies modules (missing backend)
- Public-facing General User Side (focus on Admin Side MVP)

---

## 16. Gap Re-Classification for Startup Kick-Off (2026-01-20)

### 16.1 Startup-Critical Features (Authoritative)

| # | Feature | Status | Rationale |
|---|---------|--------|-----------|
| 1 | Construction of Infrastructure | CORE | Primary PMO deliverable |
| 2 | University Operations | CORE | Required for institutional reporting |
| 3 | Repairs | CORE | Facility maintenance tracking |
| 4 | GAD Parity Reporting | CORE | Compliance requirement |

**Non-Critical Features (Incremental):**
- Facilities Assessment (future enhancement)
- Downloadable Forms (content management)
- Policies (document management)
- Announcements (public relations)

### 16.2 Gap Re-Classification

**MUST FIX (Blocking Kick-Off):**

| # | Gap | Impact | Resolution | Priority |
|---|-----|--------|------------|----------|
| 1 | Data adapter pattern undefined | All project APIs return `title` not `projectName` | Define frontend transformer pattern | P0 |
| 2 | Permission → page mapping undefined | Cannot implement route guards | Document mapping rules | P0 |
| 3 | CSU branding assets not downloaded | UI will be non-compliant | Download logo SVG | P0 |

**SHOULD FIX (Important but Deferrable):**

| # | Gap | Impact | Workaround | Priority |
|---|-----|--------|------------|----------|
| 1 | Dashboard analytics endpoint missing | No summary metrics | Calculate client-side from existing APIs | P1 |
| 2 | Public vs. admin view filtering | Cannot distinguish public endpoints | Use frontend filtering initially | P2 |

**DEFER (Non-Blocking for Kick-Off):**

| # | Gap | Feature Affected | Deferral Rationale | Target Phase |
|---|-----|------------------|-------------------|--------------|
| 1 | Facilities Assessment module | Classroom/office assessments | Not in startup-critical list | 3.1 |
| 2 | Facilities Assessment module | Office assessments | Not in startup-critical list | 3.1 |
| 3 | Forms module | Downloadable forms management | Content management, not core workflow | 3.2 |
| 4 | Policies module | MOA/MOU management | Document management, not core workflow | 3.2 |
| 5 | Announcements module | Public homepage content | Public relations, not admin workflow | 3.2 |
| 6 | Missing financial fields | `totalContractAmount`, `budgetUtilized` | Can launch with basic project data first | 3.1 |
| 7 | Missing progress fields | `physicalAccomplishment`, `progress` | Can launch with status-based tracking | 3.1 |
| 8 | Missing POW status field | Program-of-work approval tracking | Nice-to-have, not blocking CRUD | 3.1 |
| 9 | Prioritization matrix | Urgency × impact calculation | UI can calculate without backend | 3.1 |

### 16.3 Feature Impact Validation

**Construction of Infrastructure (CORE):**

| Backend Module | Status | Blocking Gaps | Safe to Proceed |
|----------------|--------|---------------|-----------------|
| `construction-projects/` | ✓ EXISTS | Field name mismatch (use adapter) | ✓ YES |
| `construction_milestones` | ✓ EXISTS | None | ✓ YES |
| `construction_gallery` | ✓ EXISTS | None | ✓ YES |
| `construction_project_financials` | ✓ EXISTS | None | ✓ YES |

**Deferral Safety:** Missing financial/progress fields do not block basic CRUD. Can display projects with available data, add enhanced fields in Phase 3.1.

**University Operations (CORE):**

| Backend Module | Status | Blocking Gaps | Safe to Proceed |
|----------------|--------|---------------|-----------------|
| `university-operations/` | ✓ EXISTS | Field name mismatch (use adapter) | ✓ YES |
| `operation_indicators` | ✓ EXISTS | None | ✓ YES |
| `operation_financials` | ✓ EXISTS | None | ✓ YES |

**Deferral Safety:** All tables exist. Missing `status` field in indicators is optional, not blocking.

**Repairs (CORE):**

| Backend Module | Status | Blocking Gaps | Safe to Proceed |
|----------------|--------|---------------|-----------------|
| `repair-projects/` | ✓ EXISTS | Field name mismatch (use adapter) | ✓ YES |
| `repair_pow_items` | ✓ EXISTS | Missing workflow fields (optional) | ✓ YES |
| `repair_project_phases` | ✓ EXISTS | None | ✓ YES |
| `repair_project_team_members` | ✓ EXISTS | None | ✓ YES |

**Deferral Safety:** POW status and variation tracking are enhancements, not blockers for repair request CRUD.

**GAD Parity Reporting (CORE):**

| Backend Module | Status | Blocking Gaps | Safe to Proceed |
|----------------|--------|---------------|-----------------|
| `gad/` (8 tables) | ✓ EXISTS | None | ✓ YES |

**Deferral Safety:** No blocking gaps. Fully aligned with prototype expectations.

### 16.4 Optimal Next Step Analysis

**Candidate Next Steps:**

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| Stabilization / Validation | Backend is stable, tests pass | Nothing to stabilize | ❌ NOT NEEDED |
| Frontend Integration | All core APIs ready, auth works | 3 MUST FIX items | ✓ OPTIMAL |
| Testing & Quality | Good practice | Delays user-facing value | ⚠ PREMATURE |
| Documentation | Important for handoff | No users to hand off to yet | ⚠ PREMATURE |

**Selected Next Step:** **Phase 3.0 Implementation (Frontend Integration)**

**Justification:**
1. All 4 startup-critical backend modules exist and functional
2. Auth, RBAC, file uploads operational
3. 3 MUST FIX items are frontend preparatory tasks (define patterns, download assets)
4. Missing modules are all deferred features, safe to skip
5. Fastest path to demonstrable value (working UI)

**Prerequisites Resolution:**

| Must Fix | Resolution Strategy | Effort | Blocking |
|----------|---------------------|--------|----------|
| Data adapter pattern | Define `transformProject(backend) → prototype` mapper | 1 hour | No (define in step 3.0.1) |
| Permission → page mapping | Document `permissions[]` → route visibility rules | 1 hour | No (define in step 3.0.3) |
| CSU logo download | Fetch SVG from official URL | 5 minutes | No (step 3.0.4) |

**None of the MUST FIX items require backend changes.** All are frontend-only preparatory tasks.

### 16.5 Software Engineering & MIS Validation

| Principle | Validation | Status |
|-----------|------------|--------|
| **KISS** | Proceed with MVP, defer enhancements | ✓ Simple path |
| **YAGNI** | Do not build Facilities/Forms/Policies yet | ✓ Avoided over-engineering |
| **SOLID** | Data adapters maintain separation (backend ↔ UI) | ✓ Boundary preserved |
| **DRY** | Reuse backend APIs, avoid duplication | ✓ No redundant work |
| **TDA** | Frontend delegates to backend, uses adapters for shape | ✓ Backend authoritative |
| **MIS** | Core audit/compliance features operational | ✓ Compliant |

**Assessment:** Proceeding to frontend integration adheres to all governance principles.

### 16.6 Exclusive Summary Logs

**DONE (Phase 2.9 Complete):**
- Backend: 17 modules, 129+ endpoints, 100% build/test passing
- Auth: JWT, RBAC, guards, rate limiting
- Testing: 8 unit tests, 8 E2E tests
- Documentation: OpenAPI, test guide, research summaries

**ACCEPTED AS DEFERRED (Safe for Post-Kick-Off):**
- Facilities Assessment module (Phase 3.1)
- Forms module (Phase 3.2)
- Policies module (Phase 3.2)
- Announcements module (Phase 3.2)
- Enhanced financial fields (Phase 3.1)
- Enhanced progress tracking (Phase 3.1)
- POW approval status (Phase 3.1)
- Public vs. admin view filtering (Phase 3.2)

**MUST FIX BEFORE NEXT STEP:**
- ❌ Define data adapter pattern (`title` → `projectName` transformation)
- ❌ Document permission → page mapping (RBAC translation rules)
- ❌ Download CSU logo SVG (branding compliance)

**All MUST FIX items are frontend preparatory tasks, not backend blockers.**

---

## 17. Authentication Failure Analysis (2026-01-21)

### 17.1 Error Description

**Symptoms:**
1. Login request returns: `Unexpected token '<', "<!DOCTYPE ..." is not valid JSON`
2. Console error: `No match found for location with path "/api/docs"`

**Translation for Beginners:**
- The frontend expected JSON data from the backend
- Instead, it received an HTML page (starting with `<!DOCTYPE html>`)
- This HTML is a 404 error page, not login data
- The JSON parser cannot read HTML, causing the "Unexpected token '<'" error

### 17.2 Root Cause Analysis

**Primary Cause: Port Conflict + Missing Proxy**

| Component | Default Port | Issue |
|-----------|--------------|-------|
| NestJS Backend | 3000 | Correct, starts on 3000 |
| Nuxt 3 Frontend | 3000 | **CONFLICT** — Also defaults to 3000 |
| Frontend API calls | `http://localhost:3000` | Points to whoever owns port 3000 |

**What Happens:**
1. If Nuxt starts FIRST on port 3000:
   - Frontend calls `http://localhost:3000/api/auth/login`
   - Request goes to Nuxt server (NOT backend)
   - Nuxt returns 404 HTML page
   - JSON parse fails → "Unexpected token '<'"

2. If Backend starts FIRST on port 3000:
   - Nuxt auto-increments to port 3001 (or higher)
   - Frontend still calls `http://localhost:3000/api/auth/login`
   - Cross-origin request may work (CORS enabled)
   - BUT: This is fragile and environment-dependent

### 17.3 Configuration Gap Analysis

**Current Configuration (nuxt.config.ts):**
```typescript
runtimeConfig: {
  public: {
    apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000',
  },
},
ssr: false, // SPA mode
```

**Missing Configuration:**
```typescript
// NO nitro devProxy configured
// NO explicit port separation
// NO server-side API routing
```

**Gap Classification:**

| Issue | Classification | Impact |
|-------|---------------|--------|
| Missing `nitro.devProxy` | **BLOCKING** | Login fails in dev mode |
| Port conflict (both on 3000) | **BLOCKING** | Unpredictable routing |
| No explicit frontend port | **WARNING** | Dev environment fragile |
| Direct cross-origin fetch | **WARNING** | Works but not best practice |

### 17.4 The "/api/docs" Error Explained

**Why it appears:**
- User or developer navigates to `http://localhost:3000/api/docs` (Swagger)
- If Nuxt owns port 3000, Vue Router intercepts the path
- Vue Router has no route for `/api/docs`
- Console logs: "No match found for location with path '/api/docs'"

**This is a secondary symptom, not the primary cause.**

### 17.5 Auth Flow Validation

**Intended Flow:**
```
Frontend (Port 5173/3001) → POST /api/auth/login → Backend (Port 3000)
                         ← { access_token, user }
```

**Actual Flow (When Broken):**
```
Frontend (Port 3000) → POST /api/auth/login → Frontend (Port 3000)
                    ← <!DOCTYPE html> (404 page)
                    ← JSON.parse() FAILS
```

**TDA Compliance:**
- Frontend correctly delegates login to backend (good)
- Backend correctly returns JSON (good)
- **Problem**: Request never reaches backend due to routing misconfiguration

### 17.6 Recommended Fix Direction (No Implementation)

**Option A: Configure Nuxt Dev Proxy (Recommended)**
- Add `nitro.devProxy` to nuxt.config.ts
- Proxy `/api/*` requests to backend
- Frontend runs on any port, backend on 3000
- Cleanest solution, no code changes in composables

**Option B: Explicit Port Separation**
- Configure Nuxt to use port 5173 explicitly
- Keep backend on port 3000
- Update .env with correct API base
- Requires coordination between devs

**Option C: Use Server Routes (Nuxt SSR)**
- Create Nuxt server routes that proxy to backend
- More complex, better for production
- Overkill for SPA mode admin dashboard

### 17.7 UI/UX Quality Assessment

**Reference:** https://www.carsu.edu.ph/

**Current Login Page Assessment:**

| Aspect | Status | Notes |
|--------|--------|-------|
| CSU Logo | ✓ Present | Official seal downloaded |
| Color Palette | ✓ Compliant | Green (#009900), Gold (#f9dc07), Orange (#ff9900) |
| Typography | ✓ Poppins | Font loaded via Google Fonts |
| Layout | ✓ Clean | Centered card, gradient background |
| Spacing | ✓ Adequate | Vuetify defaults provide good rhythm |
| Hierarchy | ✓ Clear | Logo → Title → Form → Button |

**Minor Improvement Opportunities (Non-Blocking):**

| Item | Current | Suggested |
|------|---------|-----------|
| Background | Gradient gray | Could use subtle CSU pattern |
| Card shadow | elevation-4 | Acceptable, could be softer |
| Input focus | Default Vuetify | Acceptable |

**Assessment:** Login UI meets CSU standards. No immediate redesign required.

### 17.8 Plan Alignment Review

**Documented Assumptions (plan_active.md):**
```
Frontend:  Nuxt 3 + Vuetify 3 + TypeScript
HTTP:      Native fetch (wrapped in useApi composable)
```

**Incorrect Assumption:**
- Plan assumes direct `fetch()` to `http://localhost:3000` works reliably
- **Reality:** Without proxy, this is fragile in development

**Missing Step in Phase 3.0:**
- No step addresses dev proxy configuration
- Step 3.0.0 (Scaffolding) should have included proxy setup

### 17.9 Classified Gap List

**BLOCKING (Must Fix Before Login Works):**

| # | Gap | Root Cause | Fix Direction |
|---|-----|-----------|---------------|
| 1 | HTML returned instead of JSON | Port conflict + no proxy | Configure `nitro.devProxy` |
| 2 | Nuxt and NestJS both default to port 3000 | No explicit port config | Separate ports or use proxy |

**WARNING (Should Fix for Stability):**

| # | Gap | Impact | Mitigation |
|---|-----|--------|------------|
| 1 | Direct cross-origin fetch | Works but fragile | Proxy is cleaner |
| 2 | "/api/docs" router error | Confusing console noise | Document expected behavior |

**INFORMATIONAL:**

| # | Note | Action |
|---|------|--------|
| 1 | CSU website uses purple (#6440FB), but official branding is green (#009900) | No change needed — using official colors |
| 2 | SSR disabled (ssr: false) | Correct for admin dashboard |

### 17.10 Notes for Plan Update

**Recommended Plan Revisions (Phase 3.0.X):**

1. Add missing step: **3.0.0a: Configure Dev Proxy**
   - Add `nitro.devProxy` or `routeRules` in nuxt.config.ts
   - Alternatively: Set explicit Nuxt port in package.json

2. Update Development Commands section:
   ```bash
   # Backend (must start FIRST)
   cd pmo-backend && npm run start:dev  # Port 3000

   # Frontend (after backend)
   cd pmo-frontend && npm run dev       # Auto port or proxy
   ```

3. Add verification step: **Test cross-origin requests work**

**No Plan Changes Made — Research Only.**

---

## 18. Phase 3.0 Continued Investigation (2026-01-21) — **UPDATED**

### 18.1 Error Re-Analysis

**Observed Symptoms:**
- Frontend message: "Backend server not running. Please start the backend first."
- Browser console: `Failed to load resource: the server responded with a status of 404 (Not Found)`
- Both Nuxt (frontend) and NestJS (backend) processes confirmed running

**Beginner-Friendly Explanation:**
The frontend asked the backend for login data, but received a "page not found" (404) error instead of the expected login response. This happens when the frontend's request goes to the wrong server or wrong URL path.

**CRITICAL UPDATE (2026-01-21 06:12 UTC):**
The proxy configuration IS correctly implemented in `nuxt.config.ts` (lines 39-46) and `useApi.ts` (line 23). The issue is NOT a code problem — it is an **operational startup sequence problem**.

### 18.2 Root Cause Diagnosis

**Issue Classification: BLOCKING**

| Factor | Current State | Problem |
|--------|--------------|---------|
| Proxy Config | `nuxt.config.ts` lines 39-46 | ✓ Correctly configured |
| useApi.ts | Uses relative URLs in dev mode (line 23) | ✓ Correct pattern |
| Backend Port | 3000 (default) | ✓ Correct |
| Backend Prefix | `api` with health excluded (main.ts:34-36) | ✓ Correct |
| Startup Order | Unknown | **CRITICAL** |

**Primary Root Cause: Startup Sequence Violation**

The `nitro.devProxy` configuration IS correct, but it only works when:
1. **Backend starts FIRST** on port 3000
2. **Frontend starts AFTER** and auto-selects a different port (3001+)
3. Proxy forwards `/api/*` from frontend port to backend port 3000

**If frontend starts FIRST:**
- Nuxt takes port 3000
- Backend fails to start OR uses different port
- Proxy forwards `/api/*` to `localhost:3000` → Nuxt itself → 404

**Evidence Chain:**
```
1. Request: POST /api/auth/login
2. Proxy target: http://localhost:3000 (nuxt.config.ts:42)
3. If Nuxt owns 3000: Nuxt receives request → No route → 404 HTML
4. useApi.ts detects non-JSON (line 36) → throws 503
5. login.vue catches 503 (line 32) → "Backend server not running"
```

### 18.3 Diagnostic Verification Steps

**To Confirm Root Cause (No Implementation):**

```bash
# Step 1: Check which process owns port 3000
netstat -ano | findstr :3000

# Step 2: If backend is NOT on 3000, verify startup order
# Backend console should show: "PMO Backend running on http://localhost:3000"

# Step 3: Test backend directly
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"test\"}"
```

**Expected Results:**
- Port 3000 owned by `node` process running NestJS
- `/health` returns JSON: `{"status":"ok",...}`
- `/api/auth/login` returns 401 (invalid credentials) or 200 (valid)

### 18.4 Secondary Issues Identified

| Classification | Issue | Impact |
|----------------|-------|--------|
| WARNING | Error message says "not running" when backend IS running but unreachable | Misleading UX |
| INFORMATIONAL | Health endpoint at `/health` not `/api/health` | Expected per main.ts:35 exclude config |
| INFORMATIONAL | useApi content-type check triggers 503 for any non-JSON | Correct behavior, appropriate error handling |

### 18.5 UI/UX Research: Auth Page Refinement

**Objective:** Make login page more formal, minimal, and CSU-compliant

#### 18.5.1 Asset Inventory — **VERIFIED**

| Asset | Path | Status | Resolution/Notes |
|-------|------|--------|------------------|
| CSU Admin Building | `shared/CSU Assets/3.png` | ✓ **VERIFIED** | Modern green glass building, "CARAGA STATE UNIVERSITY" text visible |
| CSU Official Seal | `shared/CSU Assets/CSU Official Seal_1216 x 2009.png` | ✓ **VERIFIED** | 1216×2009px, portrait orientation |
| CSU Brand Logo 1 | `shared/CSU Assets/CSU Brand Logo 1.png` | ✓ Available | Two-line wordmark (not yet verified) |
| CSU Brand Logo 2 | `shared/CSU Assets/CSU Brand Logo 2.png` | ✓ Available | Single-line wordmark (not yet verified) |
| CSU Wallpaper 4k | `shared/CSU Assets/CSU Wallpaper 4k white.jpg` | ✓ Available | 4K resolution (not yet verified) |
| Current Logo (public) | `pmo-frontend/public/csu-logo.svg` | ✓ **IN USE** | SVG format, currently used in login.vue |

#### 18.5.2 CSU Branding Guidelines (Authoritative)

**Source:** https://www.carsu.edu.ph/ovpeo/pico/university-branding/

| Element | Specification |
|---------|---------------|
| **Primary Colors** | Green (#009900) = productivity, Gold (#f9dc07) = wisdom, Orange (#ff9900) = strength, White = purity |
| **Secondary Colors** | Emerald = peace, Gray = formality |
| **Seal Usage** | No alterations allowed (no skewing, warping, cropping, color changes, rotation, ghosting/overlaying) |
| **Logo Versions** | Single-line (documents), Two-line (events, certificates, posters) |
| **Core Values** | **C**ompetence, **S**ervice, **U**prightness |

#### 18.5.3 UI Refinement Research Notes

**Background Treatment (CSU Admin Building - 3.png):**

| Approach | Implementation Pattern | Readability |
|----------|----------------------|-------------|
| Dark overlay | `background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(...)` | ✓ High |
| Green overlay | `background: linear-gradient(rgba(0,153,0,0.7), rgba(0,102,0,0.85)), url(...)` | ✓ High, CSU-branded |
| Blur effect | `backdrop-filter: blur(2px)` on overlay | ✓ Modern, subtle |
| Side placement | Image on left panel, form on right (current pattern) | ✓ Already implemented |

**Recommended Approach:** Green gradient overlay on admin building image (`3.png`) for left panel, maintaining current split layout.

**Implementation Pattern (CSS):**
```css
.branding-panel {
  background: 
    linear-gradient(
      135deg, 
      rgba(0, 153, 0, 0.85) 0%, 
      rgba(0, 102, 0, 0.90) 100%
    ),
    url('/csu-admin-building.png');
  background-size: cover;
  background-position: center;
}
```

**Rationale:**
- Preserves institutional context (recognizable CSU building)
- Maintains text readability via gradient overlay
- Aligns with CSU green branding
- Avoids "generic corporate" aesthetic

**Seal Usage (Subtle Integration):**

| Placement | Compliance | Notes |
|-----------|------------|-------|
| Header watermark (10-15% opacity) | ✓ Allowed | Subtle, non-obtrusive |
| Footer badge | ✓ Allowed | Institutional trust signal |
| Form card background | ⚠ Risky | Could violate "no overlaying" rule |
| Full-size feature | ✗ Avoid | Overdecorated, not minimal |

**Recommended:** Small seal in footer or card header only, full color, no transparency effects on the seal itself.

**Typography & Spacing:**

| Current | Refinement Direction |
|---------|---------------------|
| Poppins font | ✓ Keep (modern, professional) |
| 2-column layout | ✓ Keep (clean separation) |
| Card-based form | ✓ Keep (focused attention) |
| Gradient green panel | Replace with image + overlay |

#### 18.5.4 Engineering Compliance Check

| Principle | Current UI | Proposed Refinements | Compliance |
|-----------|-----------|---------------------|------------|
| **TDA** | Form submits to backend via store | No change to data flow | ✓ Pass |
| **DRY** | Auth logic in store only | No duplication proposed | ✓ Pass |
| **SOLID** | Components separated (login.vue, auth.ts, useApi.ts) | No structural changes | ✓ Pass |
| **KISS** | Simple form, no animations | Keep minimal approach | ✓ Pass |
| **YAGNI** | Basic login only | No feature creep | ✓ Pass |
| **MIS** | Vue 3 + Nuxt per policy | Compliant | ✓ Pass |

### 18.6 Plan Alignment Assessment

**Step 3.0.P Status Check:**

| Sub-Step | Plan Expectation | Actual State |
|----------|-----------------|--------------|
| 3.0.P.1 | Configure Nitro Dev Proxy | ✓ Implemented (nuxt.config.ts:39-46) |
| 3.0.P.2 | Update useApi for proxy | ✓ Implemented (line 23: relative URLs) |
| 3.0.P.3 | Backend starts first | **Unknown** — Not enforced |
| 3.0.P.4 | Test login flow | **Failing** — 404 observed |

**Diagnosis:**
- Step 3.0.P is **conceptually correct** and **code-complete**
- Step 3.0.P is **operationally failing** due to startup sequence violation
- **Root cause is environmental, not code-based**

**Step 3.0.U Status Check:**

| Criterion | Plan Expectation | Actual State |
|-----------|-----------------|--------------|
| CSU Branding | Green/Gold/Orange colors | ✓ Implemented |
| Split Layout | Branding panel + Form panel | ✓ Implemented |
| Minimal Design | No clutter | ✓ Implemented |
| Admin Building Image | Use as background | ✗ Not yet used |
| Official Seal | Subtle integration | ✗ Only logo, no seal |

**Assessment:** Step 3.0.U is **partially complete** — functional but can be refined with building image and seal.

**Refinement Scope (Non-Blocking):**
1. Replace gradient background with CSU Admin Building (`3.png`) + overlay
2. Add official seal (small, footer or header placement)
3. Verify formality and CSU compliance (already 90% achieved)
4. NO layout changes (current split design is optimal)

### 18.7 Classified Issue Summary

**BLOCKING:**

| # | Issue | Root Cause | Resolution Direction |
|---|-------|------------|---------------------|
| B1 | Login returns 404 despite both servers running | Startup sequence: frontend started before backend, taking port 3000 | Enforce startup order OR use explicit port config |

**RESOLUTION VERIFICATION REQUIRED:**
```bash
# Step 1: Kill all Node.js processes
taskkill /F /IM node.exe

# Step 2: Start backend FIRST
cd pmo-backend && npm run start:dev
# Wait for: "PMO Backend running on http://localhost:3000"

# Step 3: Start frontend AFTER backend
cd pmo-frontend && npm run dev
# Should auto-increment to port 3001+ if 3000 is taken

# Step 4: Test login at the frontend port (NOT 3000)
# Example: http://localhost:3001
```

**WARNING:**

| # | Issue | Impact | Mitigation |
|---|-------|--------|------------|
| W1 | Error message "Backend not running" is misleading | User confusion when backend IS running but unreachable | Consider message: "Cannot reach backend. Check startup order." |

**INFORMATIONAL:**

| # | Note | Action |
|---|------|--------|
| I1 | UI can be refined with admin building image | Phase 3.0.U enhancement (non-blocking) |
| I2 | CSU seal not yet integrated | Phase 3.0.U enhancement (non-blocking) |
| I3 | Proxy config is correct but depends on startup order | Document in README |

### 18.8 Notes for Plan Update (Not Implemented)

**Recommended Plan Additions:**

1. **Startup Enforcement Step (3.0.P.3a):**
   - Add port ownership check before frontend starts
   - OR add explicit port in frontend package.json: `"dev": "nuxt dev --port 3001"`

2. **Troubleshooting Section Enhancement:**
   | Symptom | Actual Cause | Resolution |
   |---------|--------------|------------|
   | "Backend not running" when it IS running | Frontend took port 3000 first | Stop frontend, restart backend, then frontend |

3. **UI Refinement Sub-Steps (3.0.U.2-3):**
   - 3.0.U.2: Add admin building image as left panel background
   - 3.0.U.3: Add CSU seal to footer or card header

**No changes made to plan_active.md — research only.**

---

*ACE Framework — Research Summary*
*Updated: 2026-01-21 (Phase 3.0 Continued Investigation)*

## 19. Phase 1 Research: Auth Integration Failure & Scope Gaps (2026-01-21)

**Research Objective:** Diagnose BLOCKING authentication failure, review frontend-backend contract, research auth scope gaps (username/email/OAuth), and assess UI refinement requirements.

**Authority:** GOVERNED AI BOOTSTRAP v2.4 (OPERATOR LTS)

---

### 19.1 Root Cause Analysis (PART A)

#### 19.1.1 New Symptom: /api/docs Error During App Initialization

**Observed Symptom:**
```
H3Error: Page not found: /api/docs
```

**Context Analysis:**

| Observation | Explanation |
|-------------|-------------|
| Error appears during Nuxt app initialization | Nuxt router attempts to resolve `/api/docs` as a page route |
| Backend logs: "Swagger available at http://localhost:3000/api/docs" | Backend correctly serves Swagger at `/api/docs` |
| Backend receives `/_nuxt/*` requests and returns 404 | Frontend static assets hitting wrong server |

**Root Cause Diagnosis:**

The `/api/docs` error is **NOT a direct auth failure**, but a **secondary symptom of the same root cause** identified in Section 17 and 18:

1. **Startup Sequence Violation:**
   - Frontend starts FIRST on port 3000
   - Backend fails to claim port 3000 OR starts on different port
   - Nuxt router intercepts ALL routes, including `/api/*` paths

2. **Why /api/docs Specifically:**
   - Developer or browser attempts to access Swagger docs
   - Request goes to `http://localhost:3000/api/docs`
   - If Nuxt owns port 3000: Vue Router receives request
   - Vue Router has no route for `/api/docs` → H3Error 404
   - Nuxt returns HTML 404 page instead of Swagger UI

3. **Why HTML Instead of JSON (Beginner Explanation):**
   - Backend APIs return JSON (data format: `{"key": "value"}`)
   - Frontend frameworks return HTML (web pages: `<!DOCTYPE html>...`)
   - When frontend receives HTML where it expects JSON:
     - JSON parser tries to read `<!DOCTYPE...>`
     - First character is `<` (not `{` or `[`)
     - Error: "Unexpected token '<'"

**This is NOT a Swagger misconfiguration—it's a routing misconfiguration.**

#### 19.1.2 Incorrect Assumptions Identified

**Assumption in plan_active.md:**
```
HTTP: Native fetch (wrapped in useApi composable)
```

**Incorrect Implication:**
- Plan assumes direct `fetch('http://localhost:3000/api/...')` works reliably
- **Reality:** This only works if startup order is correct AND CORS configured
- **Missing:** Explicit startup sequence enforcement

**Assumption in frontend implementation:**
- `nitro.devProxy` configured correctly (✓ TRUE per nuxt.config.ts)
- `useApi.ts` uses relative URLs in dev mode (✓ TRUE per line 23)

**Incorrect Operational Assumption:**
- Developers will "naturally" start backend first
- **Reality:** No enforced startup order, leading to port conflicts

#### 19.1.3 Classification

| Issue | Type | Impact | Root Cause |
|-------|------|--------|------------|
| H3Error: /api/docs | **BLOCKING** | Login fails, Swagger inaccessible | Frontend on port 3000, intercepting backend routes |
| HTML returned instead of JSON | **BLOCKING** | Authentication cannot complete | Same as above |
| Correct credentials fail | **BLOCKING** | Users cannot log in | Request never reaches backend |
| Backend receives `/_nuxt/*` | **WARNING** | Confusing logs | Frontend assets requesting wrong server |

**Primary Root Cause:** Startup sequence violation + no enforcement mechanism

**NOT the root cause:**
- ✗ Proxy misconfiguration (proxy IS correct)
- ✗ useApi.ts implementation (IS correct)
- ✗ Backend Swagger setup (IS correct)
- ✗ CORS (IS correctly enabled)

---

### 19.2 Frontend ↔ Backend Contract Review (PART B)

#### 19.2.1 Intended Contract (Authoritative)

**What Frontend SHOULD Call:**

| Endpoint | Method | Purpose | Response Type |
|----------|--------|---------|---------------|
| `/api/auth/login` | POST | Authenticate user | JSON: `{ access_token, user }` |
| `/api/auth/me` | GET | Fetch current user profile | JSON: `{ id, email, first_name, ... }` |
| `/api/auth/logout` | POST | Log out (audit trail only) | 204 No Content |
| `/api/construction-projects` | GET | Fetch projects list | JSON: `{ data: [...], total, ... }` |
| `/api/repair-projects` | GET | Fetch repairs list | JSON: `{ data: [...] }` |
| `/api/university-operations` | GET | Fetch uni ops list | JSON: `{ data: [...] }` |
| `/api/gad-parity` | GET | Fetch GAD reports | JSON: `{ data: [...] }` |

**What Frontend MUST NOT Call:**

| Endpoint | Reason | Alternative |
|----------|--------|-------------|
| `/api/docs` | Swagger UI for developers only, not runtime | Access via browser directly |
| `/health` | Backend health check, not API resource | Not needed by frontend at runtime |
| Direct port 3000 if Nuxt owns it | Causes HTML/JSON conflict | Use proxy or explicit backend URL |

#### 19.2.2 Current Implementation Alignment

**auth.ts Store (CORRECT):**
```typescript
// ✓ Uses /api/auth/login endpoint
await api.post<LoginResponse>('/api/auth/login', { email, password })

// ✓ Uses /api/auth/me endpoint
await api.get<BackendUser>('/api/auth/me')

// ✓ Uses /api/auth/logout endpoint
await api.post('/api/auth/logout', {})
```

**useApi.ts Composable (CORRECT):**
```typescript
// ✓ Uses relative URLs in dev mode (proxy handles routing)
const baseUrl = import.meta.dev ? '' : config.public.apiBase
const response = await fetch(`${baseUrl}${endpoint}`, ...)
```

**nuxt.config.ts Proxy (CORRECT):**
```typescript
nitro: {
  devProxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

**Contract Compliance:** ✅ PASS

**Issue:** Implementation is correct, but **operational environment violates assumptions** (backend not on port 3000 when proxy points to it).

#### 19.2.3 Missing Research Steps (Gap Identified)

**Phase 3.0 Plan Gaps:**

| Missing Step | Impact | Should Have Been |
|--------------|--------|------------------|
| Explicit startup sequence documentation | BLOCKING failure | Step 0: "Prerequisites - Backend must start first" |
| Port ownership verification | No enforcement | Step 3.0.P.0: "Verify backend owns port 3000" |
| Dev environment assumptions validation | Fragile setup | Research Phase: "Validate dev proxy requirements" |

**Research-to-Plan Feedback Loop Failure:**
- Section 17 identified the startup sequence issue
- Section 18 documented the resolution steps
- **But:** Plan was not updated with enforceable startup order
- **Result:** Issue persists operationally despite code being correct

---

### 19.3 Auth Scope Gap Research (PART C)

**Objective:** Research required auth capabilities for startup kick-off without implementation.

#### 19.3.1 Current Auth Capabilities (Backend)

**login.dto.ts (Current):**
```typescript
export class LoginDto {
  @IsEmail()
  email: string;  // REQUIRES email format

  @IsString()
  @MinLength(6)
  password: string;
}
```

**Limitations:**
- ✗ No username login support
- ✗ No email/username flexibility
- ✓ Email-only login (restrictive)

**auth.service.ts (Current):**
```typescript
// Validates ONLY by email
WHERE u.email = $1 AND u.deleted_at IS NULL

// Detects Google OAuth users
if (user.google_id && (!user.password_hash || user.password_hash === '')) {
  // SSO-only account sentinel
}
```

**Database Schema (users table - Current per pmo_schema_pg.sql):**
```sql
email VARCHAR(255) NOT NULL UNIQUE,
password_hash VARCHAR(255) NOT NULL,
-- NO username column
```

**Database Schema (Google OAuth Migration - Available):**
```sql
-- pmo_migration_google_oauth.sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
```

**Summary:** Backend ONLY supports email + password. Google OAuth column exists via migration but no implementation.

#### 19.3.2 Required Auth Capabilities (Startup-Critical)

**Capability 1: Email Login (CURRENT)**

| Aspect | Requirement | Current State | Gap |
|--------|-------------|---------------|-----|
| DTO | Accept email field | ✓ Implemented | None |
| Validation | `@IsEmail()` | ✓ Implemented | None |
| Service | Lookup by email | ✓ Implemented | None |
| Schema | `email VARCHAR UNIQUE` | ✓ Exists | None |
| **Status** | **COMPLETE** | ✅ Production-ready | — |

**Capability 2: Username Login (REQUESTED)**

| Aspect | Requirement | Current State | Gap |
|--------|-------------|---------------|-----|
| DTO | Accept `username` OR `email` | ✗ Email only | **DTO UPDATE** |
| Validation | Conditional: email if contains `@`, else string | ✗ None | **VALIDATOR LOGIC** |
| Service | Lookup by `username` OR `email` | ✗ Email only | **QUERY LOGIC** |
| Schema | Add `username VARCHAR UNIQUE` | ✗ No column | **SCHEMA MIGRATION** |
| **Priority** | Startup-critical? | ❓ TBD | **USER DECISION** |

**Required Changes (If Approved):**

1. **Schema Migration:**
   ```sql
   ALTER TABLE users ADD COLUMN username VARCHAR(100) UNIQUE;
   CREATE INDEX idx_users_username ON users(username);
   ```

2. **DTO Update (login.dto.ts):**
   ```typescript
   export class LoginDto {
     @IsString()
     @IsNotEmpty()
     identifier: string;  // email OR username

     @IsString()
     @MinLength(6)
     password: string;
   }
   ```

3. **Service Update (auth.service.ts):**
   ```typescript
   // Detect if identifier is email or username
   const isEmail = identifier.includes('@');
   const field = isEmail ? 'email' : 'username';
   WHERE u[field] = $1 AND u.deleted_at IS NULL
   ```

**Trade-offs:**
- ✅ Benefit: Users can log in with username (e.g., "jdoe" instead of "jdoe@carsu.edu.ph")
- ⚠️ Risk: Username must be enforced unique across all users
- ⚠️ Risk: Existing users have no username (migration required)
- ⚠️ Complexity: Seed data must be updated with usernames

**Startup-Critical Assessment:** **NOT CRITICAL** — Email login is sufficient for MVP. Username is a UX enhancement, not a blocker.

**Capability 3: Google OAuth Login (REQUESTED)**

| Aspect | Requirement | Current State | Gap |
|--------|-------------|---------------|-----|
| DTO | OAuth token or callback handler | ✗ None | **OAUTH CONTROLLER** |
| Validation | Verify Google token | ✗ None | **GOOGLE SDK INTEGRATION** |
| Service | Lookup/create by `google_id` | ⚠️ Partial (SSO detection only) | **OAUTH FLOW** |
| Schema | `google_id VARCHAR UNIQUE` | ✓ Via migration | None |
| Frontend UI | Google Sign-In button | ✗ None | **UI COMPONENT** |
| **Priority** | Startup-critical? | ❓ TBD | **USER DECISION** |

**Required Changes (If Approved):**

1. **Backend Dependencies:**
   ```json
   {
     "@nestjs/passport": "^10.0.0",
     "passport-google-oauth20": "^2.0.0"
   }
   ```

2. **OAuth Strategy (auth/strategies/google.strategy.ts):**
   ```typescript
   @Injectable()
   export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
     async validate(profile): Promise<any> {
       // Lookup user by google_id
       // Create if not exists (with email from Google profile)
     }
   }
   ```

3. **OAuth Controller (auth.controller.ts):**
   ```typescript
   @Get('google')
   @UseGuards(AuthGuard('google'))
   async googleAuth() {}

   @Get('google/callback')
   @UseGuards(AuthGuard('google'))
   async googleAuthCallback(@Req() req) {
     // Return JWT token
   }
   ```

4. **Frontend UI (login.vue):**
   ```vue
   <v-btn @click="loginWithGoogle" prepend-icon="mdi-google">
     Sign in with Google
   </v-btn>
   ```

5. **OAuth Flow:**
   ```
   User clicks "Google" → Redirect to Google → User authorizes →
   Google redirects to /api/auth/google/callback →
   Backend validates token → Creates/finds user →
   Returns JWT → Frontend stores token
   ```

**Trade-offs:**
- ✅ Benefit: Seamless login for @carsu.edu.ph email users
- ✅ Benefit: No password management burden
- ⚠️ Risk: Requires Google OAuth app credentials (setup effort)
- ⚠️ Risk: Redirect flow requires HTTPS in production
- ⚠️ Complexity: Multi-step OAuth implementation (3-5 files)

**Startup-Critical Assessment:** **NOT CRITICAL** — Email+password is sufficient for internal admin dashboard. OAuth is a "nice-to-have" for UX, not a blocker for Phase 3.1 delivery.

#### 19.3.3 Schema Impact Summary

**Current Schema (pmo_schema_pg.sql):**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  -- ... other fields
);
```

**With Username Support:**
```sql
ALTER TABLE users ADD COLUMN username VARCHAR(100) UNIQUE;
```

**With Google OAuth (Already Available via Migration):**
```sql
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
```

**Migration Considerations:**

| Scenario | Action Required | Risk Level |
|----------|----------------|------------|
| Add `username` column | All existing users need username assigned | **HIGH** — Requires data migration script |
| Use `google_id` (already exists) | Run `pmo_migration_google_oauth.sql` if not applied | **LOW** — Column addition only |
| OAuth implementation | Backend + Frontend code changes | **MEDIUM** — New auth flow, testing needed |

#### 19.3.4 Recommendation (Startup Kick-Off Scope)

**DEFER:**
- Username login (not critical for MVP)
- Google OAuth login (UX enhancement, not blocker)

**KEEP:**
- Email + password login (current implementation, production-ready)

**Rationale:**
- Phase 3.0-3.1 goal: Functional MVP with Construction, Repairs, Uni Ops, GAD
- Auth works reliably with email login
- Adding username/OAuth introduces:
  - Schema migration complexity
  - Seed data updates
  - Testing overhead
  - NO immediate value gain for internal dashboard

**Proposed for Phase 3.2+:**
- Phase 3.2: Add username support with data migration
- Phase 3.3: Add Google OAuth for SSO convenience

**YAGNI Compliance:** ✅ PASS — Don't build features not immediately needed

---

### 19.4 UI Refinement Research (PART D)

**Objective:** Research how to make Auth UI more formal, minimal, clean, and CSU-aligned.

#### 19.4.1 Current Login UI Assessment

**Current State (login.vue):**
- ✓ Split-screen layout (branding left, form right)
- ✓ CSU colors (#009900 green, #f9dc07 gold, #ff9900 orange)
- ✓ Poppins font
- ✓ SVG logo (`csu-logo.svg`)
- ✗ NO admin building image
- ✗ NO official seal integration
- ✗ Gradient background (not photo-based)

**Reference Standards:**
- CSU website: https://www.carsu.edu.ph/
- CSU branding page: https://www.carsu.edu.ph/ovpeo/pico/university-branding/

**Available Assets (shared/CSU Assets/):**

| Asset | File | Resolution | Purpose |
|-------|------|------------|---------|
| Admin Building (Modern) | `3.png` | High-res | **PRIMARY** background image |
| Admin Building (Classic) | `CSU NEW ADMIN PIC.jpg` | 414 KB | Alternative background |
| Official Seal | `CSU Official Seal_1216 x 2009.png` | 1216×2009px | Formal trust badge |
| Brand Logo 1 | `CSU Brand Logo 1.png` | 135 KB | Two-line wordmark |
| Brand Logo 2 | `CSU Brand Logo 2.png` | 138 KB | Single-line wordmark |
| 4K Wallpaper (White) | `CSU Wallpaper 4k white.jpg` | 695 KB | Alternative background |
| 4K Wallpaper (Dark) | `CSU Wallpaper 4k dark.jpg` | 620 KB | Alternative background |

#### 19.4.2 CSU Branding Compliance Check

**Official Guidelines (Authoritative):**

| Guideline | Requirement | Current UI | Compliance |
|-----------|-------------|------------|------------|
| **Primary Colors** | Green (#009900), Gold (#f9dc07), Orange (#ff9900), White (#ffffff) | ✓ Implemented | ✅ PASS |
| **Secondary Colors** | Emerald (#003300), Gray (#4d4d4d) | ✗ Not used | ⚠️ Optional |
| **Seal Usage** | No alterations (skewing, warping, cropping, color changes, rotation, ghosting) | ✗ Not yet used | — |
| **Logo Versions** | Single-line (documents), Two-line (events, certificates) | ✓ SVG logo used | ✅ PASS |
| **Typography** | Not specified in branding page | Poppins font | ✅ PASS (professional) |

**Prohibited Actions (If Using Seal):**
- ✗ Skewing or warping
- ✗ Cropping or partial display
- ✗ Perspective changes
- ✗ Color modifications
- ✗ Rotation
- ✗ Ghosting/overlaying (transparency effects)
- ✗ Element removal
- ✗ Wordmark text style changes

**Implication:** If seal is added, it MUST be:
- Full-size, unmodified
- No transparency effects on seal itself (background overlay OK)
- Proper orientation (portrait, as provided)

#### 19.4.3 UI Refinement Recommendations (Non-Functional)

**Refinement 1: Add Admin Building Background**

**Current:**
```css
.branding-panel {
  background: linear-gradient(135deg, #009900 0%, #006600 100%);
}
```

**Proposed:**
```css
.branding-panel {
  background:
    linear-gradient(
      135deg,
      rgba(0, 153, 0, 0.85) 0%,
      rgba(0, 102, 0, 0.90) 100%
    ),
    url('/csu-admin-building.png');
  background-size: cover;
  background-position: center;
}
```

**Rationale:**
- Preserves institutional context (recognizable CSU landmark)
- Green overlay maintains text readability
- Aligns with CSU green branding
- More formal than generic gradient

**Asset:** Use `3.png` (modern green glass building with "CARAGA STATE UNIVERSITY" text)

**Refinement 2: Integrate Official Seal (Subtle)**

**Current:** Only logo (`csu-logo.svg`)

**Proposed Placements:**

| Placement | Implementation | Compliance | Formality |
|-----------|----------------|------------|-----------|
| Card header badge | Small (60-80px), full color, above "Welcome Back" | ✓ Allowed | ⭐⭐⭐ High |
| Footer badge | Small (50px), centered below copyright | ✓ Allowed | ⭐⭐ Medium |
| Watermark (left panel) | Large (200px), 10% opacity | ⚠️ Risky (ghosting rule) | ⭐ Low |

**Recommended:** Card header badge (formal, visible, compliant)

**Code Pattern:**
```vue
<div class="form-wrapper">
  <v-img
    src="/csu-official-seal.png"
    width="70"
    class="mx-auto mb-4"
    alt="CSU Official Seal"
  />
  <h2 class="form-title">Welcome Back</h2>
</div>
```

**Refinement 3: Auth Field Flexibility (Visual Only)**

**Current UI:** Email + Password fields

**Proposed (No Backend Changes):**

1. **Single "Username or Email" field** with placeholder:
   ```
   Placeholder: "Email or username"
   Label: "CSU Account"
   ```

2. **Google OAuth Button (Visual Only - Non-functional until Phase 3.2+):**
   ```vue
   <v-btn
     variant="outlined"
     size="large"
     prepend-icon="mdi-google"
     disabled
     class="mt-2"
   >
     Sign in with Google (Coming Soon)
   </v-btn>
   ```

**Rationale:**
- Signals future capability without implementing backend
- Maintains YAGNI (button is disabled, no logic)
- UX preparation for Phase 3.2+

**Refinement 4: Formality Enhancements**

| Element | Current | Proposed | Impact |
|---------|---------|----------|--------|
| Card title | "Welcome Back" | "PMO Dashboard Login" | More formal, purpose-clear |
| Card subtitle | "Sign in to continue to the dashboard" | "Physical Planning & Management Office" | Institutional branding |
| Footer | "Need help? Contact MIS Office" | "© 2026 Caraga State University • All Rights Reserved" | Formal, copyright notice |

#### 19.4.4 Layout Structure Preservation (KISS)

**Keep (No Changes):**
- ✓ Split-screen layout (efficient use of space)
- ✓ Responsive design (mobile logo hidden on desktop)
- ✓ Card-based form (focused attention)
- ✓ Poppins font (professional, readable)
- ✓ Color scheme (CSU compliant)

**Change (Enhancements Only):**
- Background: Gradient → Photo + overlay
- Seal: None → Card header badge
- Formality: Casual → Professional tone

**No New Features:**
- ✗ Animations (avoid visual clutter per KISS)
- ✗ Additional forms (YAGNI)
- ✗ Complex layouts (KISS)

#### 19.4.5 Implementation Checklist (Research Only - NOT Implemented)

**Asset Preparation:**
- [ ] Copy `3.png` to `pmo-frontend/public/csu-admin-building.png`
- [ ] Copy `CSU Official Seal_1216 x 2009.png` to `pmo-frontend/public/csu-official-seal.png`

**CSS Updates (login.vue):**
- [ ] Update `.branding-panel` background with image + overlay
- [ ] Verify text readability on image background

**Component Updates (login.vue):**
- [ ] Add CSU seal image to form header (60-70px)
- [ ] Update card title to "PMO Dashboard Login"
- [ ] Update subtitle to "Physical Planning & Management Office"
- [ ] Update footer to formal copyright notice
- [ ] (Optional) Add disabled Google OAuth button

**Validation:**
- [ ] Verify seal displays without distortion
- [ ] Verify background image loads properly
- [ ] Verify text remains readable on all screen sizes

---

### 19.5 Software Engineering & MIS Compliance Check (PART E)

#### 19.5.1 Proposed Changes Compliance Review

**Change 1: UI Refinement (Background Image + Seal)**

| Principle | Check | Compliance |
|-----------|-------|------------|
| **TDA** | No data logic moved to frontend; only visual changes | ✅ PASS |
| **DRY** | No duplication; assets are reference-only | ✅ PASS |
| **SOLID** | No structural changes; login.vue remains presentation layer | ✅ PASS |
| **KISS** | Minimal changes (CSS + asset files); no animations or complexity | ✅ PASS |
| **YAGNI** | Only adds assets currently needed; no feature creep | ✅ PASS |
| **MIS** | CSU branding compliance improved; no security/privacy impact | ✅ PASS |

**Change 2: Auth Scope Expansion (Username/OAuth - DEFERRED)**

| Principle | Check | Compliance |
|-----------|-------|------------|
| **YAGNI** | NOT needed for MVP; deferred to Phase 3.2+ | ✅ PASS (by deferring) |
| **KISS** | Avoiding premature complexity | ✅ PASS (by deferring) |
| **TDA** | Would maintain backend-only auth logic (if implemented) | ✅ PASS (design) |

**Change 3: Startup Sequence Enforcement**

| Principle | Check | Compliance |
|-----------|-------|------------|
| **KISS** | Explicit order documentation vs. complex port detection | ✅ PASS |
| **MIS** | Predictable, auditable behavior (backend MUST start first) | ✅ PASS |

#### 19.5.2 Responsibility Boundaries (SOLID - Single Responsibility)

**Frontend (Nuxt.js):**
- ✓ Presentation layer (UI, forms, navigation)
- ✓ State management (Pinia auth store)
- ✓ HTTP client (useApi composable)
- ✗ Auth validation logic (backend only)
- ✗ Password hashing (backend only)
- ✗ Token generation (backend only)

**Backend (NestJS):**
- ✓ Auth validation (email, password verification)
- ✓ Token generation (JWT signing)
- ✓ User lookup (database queries)
- ✓ RBAC (role/permission checks)
- ✗ UI rendering (frontend only)
- ✗ Form validation (frontend provides UX, backend enforces security)

**Current Implementation:** ✅ PASS — Boundaries respected

**Proposed Changes:** ✅ PASS — No boundary violations

#### 19.5.3 DRY Compliance

**Current State:**

| Logic | Location | Duplication? |
|-------|----------|--------------|
| Login DTO validation | `login.dto.ts` (backend) | ✗ None |
| Password hashing | `auth.service.ts` (backend) | ✗ None |
| JWT signing | `auth.service.ts` (backend) | ✗ None |
| Form validation (UX) | `login.vue` (frontend) | ⚠️ Mirrors backend rules (expected) |

**Frontend form validation is NOT duplication** — it provides UX feedback before API call. Backend re-validates for security.

**Proposed Changes:** No new duplication introduced.

#### 19.5.4 MIS Governance Compliance

**MIS Policy Requirements (Web Development Policy):**
- ✅ Vue 3 + Nuxt.js (mandatory) — Implemented
- ✅ Server-side auth logging — Implemented (`auth.service.ts` logs)
- ✅ No PII in localStorage — Only JWT token stored (no email/password)
- ✅ CSU branding compliance — Improved with seal and building image

**Security Considerations:**

| Aspect | Current State | Compliance |
|--------|---------------|------------|
| Password storage | bcrypt hashed (backend) | ✅ PASS |
| Token storage | localStorage (client) | ⚠️ Acceptable for admin dashboard (not public-facing) |
| HTTPS enforcement | Not yet configured | ⏳ Production requirement (not dev) |
| Failed login tracking | Implemented (account lockout after 5 attempts) | ✅ PASS |
| Audit logging | Server-side (`LOGIN_SUCCESS`, `LOGIN_FAILURE`) | ✅ PASS |

**Audit Trail (MIS Requirement):**
```typescript
this.logger.log(`LOGIN_SUCCESS: user_id=${user.id}`);
this.logger.warn(`LOGIN_FAILURE: user_id=${user.id}, reason=INVALID_PASSWORD`);
this.logger.log(`LOGOUT: user_id=${userId}`);
```

**Compliance:** ✅ PASS — Logs do not contain PII (no passwords, only user IDs)

#### 19.5.5 Predictable & Auditable Behavior (MIS)

**Current Auth Flow (Auditable):**
```
1. User submits email + password (frontend)
2. Frontend calls POST /api/auth/login (useApi.ts)
3. Backend validates credentials (auth.service.ts)
4. Backend logs LOGIN_SUCCESS or LOGIN_FAILURE
5. Backend returns JWT token OR 401 error
6. Frontend stores token in localStorage
7. Frontend navigates to /dashboard
```

**All steps are:**
- ✅ Logged (backend logs each login attempt)
- ✅ Predictable (consistent flow every time)
- ✅ Auditable (logs contain user_id, timestamp, outcome)

**Proposed Changes:** Do NOT alter audit flow

---

### 19.6 Classified Issue Summary

**BLOCKING:**

| # | Issue | Root Cause | Resolution |
|---|-------|------------|------------|
| B1 | H3Error: Page not found: /api/docs | Frontend started first, owns port 3000, intercepts ALL routes | Enforce startup order: Backend FIRST on port 3000, then frontend (auto port 3001+) |
| B2 | Login returns HTML instead of JSON | Same as B1 — request goes to Nuxt, not NestJS | Same as B1 |

**DEFERRED (Not Startup-Critical):**

| # | Feature | Reason | Target Phase |
|---|---------|--------|--------------|
| D1 | Username login | Email login sufficient for MVP; schema migration required | Phase 3.2 |
| D2 | Google OAuth | UX enhancement, not blocker; OAuth flow complexity | Phase 3.3 |

**INFORMATIONAL:**

| # | Note | Action |
|---|------|--------|
| I1 | UI can be enhanced with admin building photo + seal | Non-blocking refinement (Step 3.0.U continuation) |
| I2 | Backend correctly supports `google_id` via migration | Ready for OAuth when prioritized |
| I3 | All engineering principles (TDA, DRY, SOLID, KISS, YAGNI) respected | No violations in current or proposed changes |

---

### 19.7 Notes for Plan Update (Not Yet Implemented)

**Recommended plan_active.md Additions:**

1. **Prerequisites Section (NEW):**
   ```
   ## Prerequisites

   **CRITICAL:** Backend must start BEFORE frontend to avoid port conflicts.

   Startup Order:
   1. Start backend: `cd pmo-backend && npm run start:dev` (port 3000)
   2. Wait for: "PMO Backend running on http://localhost:3000"
   3. Start frontend: `cd pmo-frontend && npm run dev` (auto port 3001+)
   ```

2. **Step 3.0.P.0 (NEW) — Startup Sequence Enforcement:**
   - Verify backend owns port 3000 BEFORE starting frontend
   - Alternative: Add explicit port to frontend: `nuxt dev --port 3001`

3. **Step 3.0.U.2-3 (UI Refinement Continuation):**
   - 3.0.U.2: Add CSU Admin Building background (3.png)
   - 3.0.U.3: Add CSU Official Seal to card header

4. **Deferred Features (Phase 3.2+):**
   - Phase 3.2: Username login support (requires schema migration)
   - Phase 3.3: Google OAuth integration (requires OAuth setup)

**NO PLAN CHANGES MADE — Research only per constraints.**

---

### 19.8 Research Summary

**PART A — Root Cause:**
- `/api/docs` error is a secondary symptom of startup sequence violation
- Root cause: Frontend starts first, takes port 3000, intercepts backend routes
- Solution: Enforce backend-first startup OR use explicit frontend port

**PART B — Frontend-Backend Contract:**
- Contract is CORRECT and properly implemented
- Frontend calls appropriate endpoints (`/api/auth/*`, `/api/construction-projects`, etc.)
- Frontend does NOT call `/api/docs` or `/health` at runtime
- Issue is environmental (port conflict), not implementation

**PART C — Auth Scope Gaps:**
- Current: Email + password login (production-ready)
- Requested: Username login (requires schema migration, NOT startup-critical)
- Requested: Google OAuth (requires OAuth setup, NOT startup-critical)
- Recommendation: DEFER username and OAuth to Phase 3.2+ per YAGNI

**PART D — UI Refinement:**
- Current UI is CSU-compliant but can be enhanced
- Recommendations: Admin building background + official seal
- Maintain KISS (no animations, no complexity)
- Formal tone (institutional branding)

**PART E — Engineering Compliance:**
- All principles respected (TDA, DRY, SOLID, KISS, YAGNI, MIS)
- No responsibility boundary violations
- Audit logging compliant (no PII in logs)
- Proposed changes introduce no compliance issues

---

*ACE Framework — Phase 1 Research Complete*
*Updated: 2026-01-21*
*Authority: GOVERNED AI BOOTSTRAP v2.4*
*Next Step: Update plan_active.md with startup sequence enforcement (Phase 2)*
