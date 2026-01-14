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

---

## 1. Phase 2.4 (Auth & RBAC) — Completed Artifact
Phase 2.4 is complete and treated as a stable foundation for Phase 2.5.

**Implemented (authoritative):**
- Auth module: `pmo-backend/src/auth/*` (JWT login, Google OAuth, guards/decorators)
- Users/admin module: `pmo-backend/src/users/*` (Admin CRUD + role assignment)
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

*ACE Framework — Research Summary*
*Updated: 2026-01-14*
