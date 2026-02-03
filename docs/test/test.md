# Phase 2.5 API Verification Harness
**Date:** 2026-01-14 (Updated: 2026-01-15)
**Protocol:** Governed AI Bootstrap v2.4
**Purpose:** Step-by-step testing instructions for Thunder Client / Postman

> **ENUM FIX (2026-01-15):** All enum values updated to match PostgreSQL schema.
> See `docs/research_summary.md` Section 9.8 for reference.

---

## 1. Environment Setup

### Variables
| Variable | Value | Description |
|----------|-------|-------------|
| `baseUrl` | `http://localhost:3000` | Backend server URL |
| `apiPrefix` | `/api` | Global API prefix |
| `accessToken` | `{{token}}` | JWT from login (set dynamically) |

### Headers (for all protected routes)
```
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

### Start Server
```bash
cd pmo-backend
npm run start:dev
```

Confirm server running: `GET http://localhost:3000/health` should return `200 OK`.

---

## 2. Authentication Setup

### 2.1 Login to Obtain Token

| Attribute | Value |
|-----------|-------|
| **Endpoint** | `POST /api/auth/login` |
| **Auth Required** | No (public) |
| **Rate Limit** | 5 requests/minute |

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "{{YOUR_PASSWORD}}"
}
```

**Expected Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": "Admin"
  }
}
```

**Thunder Client Setup:**
1. Create request `POST {{baseUrl}}/api/auth/login`
2. In Tests tab, add: `tc.setEnvVar("accessToken", tc.response.json.access_token)`
3. Run request, token auto-stored

**Postman Setup:**
1. Create request `POST {{baseUrl}}/api/auth/login`
2. In Tests tab, add: `pm.environment.set("accessToken", pm.response.json().access_token)`
3. Run request, token auto-stored

### 2.2 Verify Profile (Token Test)

| Attribute | Value |
|-----------|-------|
| **Endpoint** | `GET /api/auth/me` |
| **Auth Required** | Yes (JWT) |

**Expected Response (200):**
```json
{
  "id": "uuid",
  "email": "admin@example.com",
  "role": "Admin",
  "first_name": "...",
  "last_name": "..."
}
```

---

## 3. Auth Gate Tests (401/403)

### 3.1 Test 401 Unauthorized (No Token)
**Request:** `GET /api/projects` without Authorization header
**Expected:** `401 Unauthorized`

### 3.2 Test 401 Unauthorized (Invalid Token)
**Request:** `GET /api/projects` with `Authorization: Bearer invalid_token`
**Expected:** `401 Unauthorized`

### 3.3 Test 403 Forbidden (Wrong Role)
If testing with a non-Admin/Staff user:
**Request:** `GET /api/projects` with valid token for Viewer role
**Expected:** `403 Forbidden`

---

## 4. University Operations API

**Base Route:** `/api/university-operations`
**Auth:** JWT Required | Roles: `Admin`, `Staff`

### 4.1 List Operations

| Attribute | Value |
|-----------|-------|
| **Method** | `GET` |
| **URL** | `/api/university-operations` |
| **Status** | `200 OK` |

**Query Parameters:**
| Param | Type | Required | Default | Values |
|-------|------|----------|---------|--------|
| `page` | int | No | 1 | >= 1 |
| `limit` | int | No | 20 | 1-100 |
| `sort` | string | No | `created_at` | any column |
| `order` | string | No | `desc` | `asc`, `desc` |
| `operation_type` | enum | No | - | `HIGHER_EDUCATION`, `ADVANCED_EDUCATION`, `RESEARCH`, `TECHNICAL_ADVISORY` |
| `status` | enum | No | - | `PLANNING`, `ONGOING`, `COMPLETED`, `ON_HOLD`, `CANCELLED` |
| `campus` | enum | No | - | `MAIN`, `CABADBARAN`, `BOTH` |

**Expected Response Shape:**
```json
{
  "data": [...],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 20,
    "totalPages": 0
  }
}
```

### 4.2 Get Single Operation

| Attribute | Value |
|-----------|-------|
| **Method** | `GET` |
| **URL** | `/api/university-operations/:id` |
| **Status** | `200 OK` or `404 Not Found` |

### 4.3 Create Operation

| Attribute | Value |
|-----------|-------|
| **Method** | `POST` |
| **URL** | `/api/university-operations` |
| **Status** | `201 Created` |

**Minimal Valid Body:**
```json
{
  "operation_type": "HIGHER_EDUCATION",
  "title": "Test Operation",
  "status": "PLANNING",
  "campus": "MAIN"
}
```

**Full Body Schema:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `operation_type` | enum | Yes | `HIGHER_EDUCATION`, `ADVANCED_EDUCATION`, `RESEARCH`, `TECHNICAL_ADVISORY` |
| `title` | string | Yes | non-empty |
| `description` | string | No | - |
| `code` | string | No | - |
| `start_date` | ISO8601 | No | valid date |
| `end_date` | ISO8601 | No | valid date |
| `status` | enum | Yes | `PLANNING`, `ONGOING`, `COMPLETED`, `ON_HOLD`, `CANCELLED` |
| `budget` | number | No | - |
| `campus` | enum | Yes | `MAIN`, `CABADBARAN`, `BOTH` |
| `coordinator_id` | UUID | No | valid UUID |
| `metadata` | object | No | - |

**Evidence to Verify (DB):**
```sql
SELECT id, title, submitted_by, created_at FROM university_operations
WHERE title = 'Test Operation' ORDER BY created_at DESC LIMIT 1;
-- submitted_by should match JWT user ID
```

### 4.4 Update Operation

| Attribute | Value |
|-----------|-------|
| **Method** | `PATCH` |
| **URL** | `/api/university-operations/:id` |
| **Status** | `200 OK` |

**Sample Body:**
```json
{
  "title": "Updated Operation Title",
  "status": "ONGOING"
}
```

**Evidence to Verify (DB):**
```sql
SELECT id, title, updated_by, updated_at FROM university_operations WHERE id = '{{id}}';
-- updated_by should match JWT user ID
```

### 4.5 Delete Operation (Soft Delete)

| Attribute | Value |
|-----------|-------|
| **Method** | `DELETE` |
| **URL** | `/api/university-operations/:id` |
| **Status** | `204 No Content` |

**Evidence to Verify (DB):**
```sql
SELECT id, deleted_at, deleted_by FROM university_operations WHERE id = '{{id}}';
-- deleted_at should be NOT NULL, deleted_by should match JWT user ID
```

### 4.6 Operation Indicators (Nested)

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/university-operations/:id/indicators` | `GET` | 200 |
| `/api/university-operations/:id/indicators?fiscal_year=2026` | `GET` | 200 |
| `/api/university-operations/:id/indicators` | `POST` | 201 |
| `/api/university-operations/:id/indicators/:indicatorId` | `PATCH` | 200 |
| `/api/university-operations/:id/indicators/:indicatorId` | `DELETE` | 204 |

**Create Indicator Body:**
```json
{
  "fiscal_year": 2026,
  "indicator_name": "Test Indicator",
  "target_value": 100,
  "actual_value": 50,
  "unit": "units"
}
```

### 4.7 Operation Financials (Nested)

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/university-operations/:id/financials` | `GET` | 200 |
| `/api/university-operations/:id/financials?fiscal_year=2026&quarter=Q1` | `GET` | 200 |
| `/api/university-operations/:id/financials` | `POST` | 201 |
| `/api/university-operations/:id/financials/:financialId` | `PATCH` | 200 |
| `/api/university-operations/:id/financials/:financialId` | `DELETE` | 204 |

**Create Financial Body:**
```json
{
  "fiscal_year": 2026,
  "quarter": "Q1",
  "allocated_budget": 100000,
  "actual_expenditure": 50000
}
```

---

## 5. Projects Core API

**Base Route:** `/api/projects`
**Auth:** JWT Required | Roles: `Admin`, `Staff`

### 5.1 List Projects

| Attribute | Value |
|-----------|-------|
| **Method** | `GET` |
| **URL** | `/api/projects` |
| **Status** | `200 OK` |

**Query Parameters:**
| Param | Type | Values |
|-------|------|--------|
| `page` | int | >= 1 |
| `limit` | int | 1-100 |
| `type` | enum | `CONSTRUCTION`, `REPAIR`, `RESEARCH`, `EXTENSION`, `TRAINING`, `OTHER` |
| `status` | enum | `PLANNING`, `ONGOING`, `COMPLETED`, `ON_HOLD`, `CANCELLED` |
| `campus` | enum | `MAIN`, `CABADBARAN`, `BOTH` |

### 5.2 CRUD Endpoints

| Endpoint | Method | Status | Body Required |
|----------|--------|--------|---------------|
| `/api/projects` | `GET` | 200 | No |
| `/api/projects/:id` | `GET` | 200/404 | No |
| `/api/projects` | `POST` | 201 | Yes |
| `/api/projects/:id` | `PATCH` | 200 | Yes |
| `/api/projects/:id` | `DELETE` | 204 | No |

**Create Project Body:**
```json
{
  "project_code": "PRJ-2026-001",
  "title": "Test Project",
  "project_type": "CONSTRUCTION",
  "status": "PLANNING",
  "campus": "MAIN"
}
```

---

## 6. Construction Projects API

**Base Route:** `/api/construction-projects`
**Auth:** JWT Required | Roles: `Admin`, `Staff`

### 6.1 CRUD Endpoints

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/construction-projects` | `GET` | 200 |
| `/api/construction-projects/:id` | `GET` | 200/404 |
| `/api/construction-projects` | `POST` | 201 |
| `/api/construction-projects/:id` | `PATCH` | 200 |
| `/api/construction-projects/:id` | `DELETE` | 204 |

**Query Parameters:**
| Param | Type | Values |
|-------|------|--------|
| `page` | int | >= 1 |
| `limit` | int | 1-100 |
| `status` | enum | `PLANNING`, `ONGOING`, `COMPLETED`, `ON_HOLD`, `CANCELLED` |
| `campus` | enum | `MAIN`, `CABADBARAN`, `BOTH` |

**Create Construction Project Body (Minimal):**
```json
{
  "project_id": "{{existing_project_uuid}}",
  "project_code": "CON-2026-001",
  "title": "New Building Construction",
  "funding_source_id": "{{existing_funding_source_uuid}}",
  "campus": "MAIN",
  "status": "PLANNING"
}
```

### 6.2 Milestones (Nested)

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/construction-projects/:id/milestones` | `GET` | 200 |
| `/api/construction-projects/:id/milestones` | `POST` | 201 |
| `/api/construction-projects/:id/milestones/:milestoneId` | `PATCH` | 200 |
| `/api/construction-projects/:id/milestones/:milestoneId` | `DELETE` | 204 |

**Create Milestone Body:**
```json
{
  "milestone_name": "Foundation Complete",
  "target_date": "2026-03-15",
  "completion_percentage": 0
}
```

### 6.3 Financials (Nested)

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/construction-projects/:id/financials` | `GET` | 200 |
| `/api/construction-projects/:id/financials?fiscal_year=2026` | `GET` | 200 |
| `/api/construction-projects/:id/financials` | `POST` | 201 |
| `/api/construction-projects/:id/financials/:financialId` | `PATCH` | 200 |
| `/api/construction-projects/:id/financials/:financialId` | `DELETE` | 204 |

---

## 7. Repair Projects API

**Base Route:** `/api/repair-projects`
**Auth:** JWT Required | Roles: `Admin`, `Staff`

### 7.1 CRUD Endpoints

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/repair-projects` | `GET` | 200 |
| `/api/repair-projects/:id` | `GET` | 200/404 |
| `/api/repair-projects` | `POST` | 201 |
| `/api/repair-projects/:id` | `PATCH` | 200 |
| `/api/repair-projects/:id` | `DELETE` | 204 |

**Query Parameters:**
| Param | Type | Values |
|-------|------|--------|
| `page` | int | >= 1 |
| `limit` | int | 1-100 |
| `status` | enum | `REPORTED`, `INSPECTED`, `APPROVED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| `urgency` | enum | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `campus` | enum | `MAIN`, `CABADBARAN`, `BOTH` |

**Create Repair Project Body (Minimal):**
```json
{
  "project_id": "{{existing_project_uuid}}",
  "project_code": "REP-2026-001",
  "title": "AC Unit Repair",
  "building_name": "Admin Building",
  "repair_type_id": "{{existing_repair_type_uuid}}",
  "urgency_level": "MEDIUM",
  "campus": "MAIN",
  "status": "REPORTED"
}
```

### 7.2 POW Items (Nested)

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/repair-projects/:id/pow-items` | `GET` | 200 |
| `/api/repair-projects/:id/pow-items?category=MATERIALS&phase=1` | `GET` | 200 |
| `/api/repair-projects/:id/pow-items` | `POST` | 201 |
| `/api/repair-projects/:id/pow-items/:itemId` | `PATCH` | 200 |
| `/api/repair-projects/:id/pow-items/:itemId` | `DELETE` | 204 |

**Create POW Item Body:**
```json
{
  "item_name": "Concrete Mix",
  "category": "MATERIALS",
  "unit": "bags",
  "quantity": 50,
  "unit_cost": 250,
  "phase": 1
}
```

### 7.3 Phases (Nested)

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/repair-projects/:id/phases` | `GET` | 200 |
| `/api/repair-projects/:id/phases` | `POST` | 201 |
| `/api/repair-projects/:id/phases/:phaseId` | `PATCH` | 200 |

**Create Phase Body:**
```json
{
  "phase_number": 1,
  "phase_name": "Site Preparation",
  "start_date": "2026-02-01",
  "target_end_date": "2026-02-15"
}
```

### 7.4 Team Members (Nested)

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/repair-projects/:id/team-members` | `GET` | 200 |
| `/api/repair-projects/:id/team-members` | `POST` | 201 |
| `/api/repair-projects/:id/team-members/:memberId` | `DELETE` | 204 |

**Create Team Member Body:**
```json
{
  "user_id": "{{existing_user_uuid}}",
  "role": "Project Engineer"
}
```

---

## 8. GAD Parity Reports API

**Base Route:** `/api/gad`
**Auth:** JWT Required | Roles: `Admin`, `Staff`

### 8.1 Student Parity

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/gad/student-parity` | `GET` | 200 |
| `/api/gad/student-parity` | `POST` | 201 |
| `/api/gad/student-parity/:id` | `PATCH` | 200 |
| `/api/gad/student-parity/:id` | `DELETE` | 204 |
| `/api/gad/student-parity/:id/review` | `PATCH` | 200 |

**Query Parameters (GET):**
| Param | Type | Values |
|-------|------|--------|
| `page` | int | >= 1 |
| `limit` | int | 1-100 |
| `academic_year` | string | e.g., "2025-2026" |
| `status` | enum | `pending`, `approved`, `rejected` |

**Create Student Parity Body:**
```json
{
  "academic_year": "2025-2026",
  "program": "BSIT",
  "admission_male": 120,
  "admission_female": 80,
  "graduation_male": 100,
  "graduation_female": 75
}
```

**Review Parity Body:**
```json
{
  "status": "approved"
}
```

### 8.2 Faculty Parity

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/gad/faculty-parity` | `GET` | 200 |
| `/api/gad/faculty-parity` | `POST` | 201 |
| `/api/gad/faculty-parity/:id` | `PATCH` | 200 |
| `/api/gad/faculty-parity/:id` | `DELETE` | 204 |
| `/api/gad/faculty-parity/:id/review` | `PATCH` | 200 |

**Create Faculty Parity Body:**
```json
{
  "academic_year": "2025-2026",
  "college": "College of Engineering",
  "category": "Regular",
  "total_faculty": 50,
  "male_count": 30,
  "female_count": 20,
  "gender_balance": "Male-dominated"
}
```

### 8.3 Staff Parity

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/gad/staff-parity` | `GET` | 200 |
| `/api/gad/staff-parity` | `POST` | 201 |
| `/api/gad/staff-parity/:id` | `PATCH` | 200 |
| `/api/gad/staff-parity/:id` | `DELETE` | 204 |
| `/api/gad/staff-parity/:id/review` | `PATCH` | 200 |

**Create Staff Parity Body:**
```json
{
  "academic_year": "2025-2026",
  "department": "Human Resources",
  "staff_category": "Administrative",
  "total_staff": 25,
  "male_count": 10,
  "female_count": 15,
  "gender_balance": "Balanced"
}
```

### 8.4 PWD Parity

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/gad/pwd-parity` | `GET` | 200 |
| `/api/gad/pwd-parity` | `POST` | 201 |
| `/api/gad/pwd-parity/:id` | `PATCH` | 200 |
| `/api/gad/pwd-parity/:id` | `DELETE` | 204 |
| `/api/gad/pwd-parity/:id/review` | `PATCH` | 200 |

**Create PWD Parity Body:**
```json
{
  "academic_year": "2025-2026",
  "pwd_category": "Students",
  "subcategory": "Visual Impairment",
  "total_beneficiaries": 15,
  "male_count": 8,
  "female_count": 7
}
```

### 8.5 Indigenous Parity

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/gad/indigenous-parity` | `GET` | 200 |
| `/api/gad/indigenous-parity` | `POST` | 201 |
| `/api/gad/indigenous-parity/:id` | `PATCH` | 200 |
| `/api/gad/indigenous-parity/:id` | `DELETE` | 204 |
| `/api/gad/indigenous-parity/:id/review` | `PATCH` | 200 |

**Create Indigenous Parity Body:**
```json
{
  "academic_year": "2025-2026",
  "indigenous_category": "Scholarship Recipients",
  "subcategory": "Mamanwa",
  "total_participants": 25,
  "male_count": 12,
  "female_count": 13
}
```

### 8.6 GPB Accomplishments

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/gad/gpb-accomplishments` | `GET` | 200 |
| `/api/gad/gpb-accomplishments` | `POST` | 201 |
| `/api/gad/gpb-accomplishments/:id` | `PATCH` | 200 |

**Query Parameters:**
| Param | Type | Values |
|-------|------|--------|
| `fiscal_year` | int | e.g., 2026 |

**Create GPB Accomplishment Body:**
```json
{
  "fiscal_year": 2026,
  "activity_name": "Gender Sensitivity Training",
  "target_beneficiaries": 200,
  "actual_beneficiaries": 180,
  "budget_allocated": 50000,
  "budget_utilized": 45000
}
```

### 8.7 Budget Plans

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/gad/budget-plans` | `GET` | 200 |
| `/api/gad/budget-plans` | `POST` | 201 |
| `/api/gad/budget-plans/:id` | `PATCH` | 200 |

**Create Budget Plan Body:**
```json
{
  "fiscal_year": 2026,
  "category": "Training and Development",
  "planned_amount": 100000,
  "approved_amount": 95000
}
```

---

## 9. Users API (Admin Only)

**Base Route:** `/api/users`
**Auth:** JWT Required | Roles: `Admin` only

### 9.1 CRUD Endpoints

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/users` | `GET` | 200 |
| `/api/users/roles` | `GET` | 200 |
| `/api/users/:id` | `GET` | 200/404 |
| `/api/users` | `POST` | 201 |
| `/api/users/:id` | `PATCH` | 200 |
| `/api/users/:id` | `DELETE` | 204 |

**Query Parameters (GET /users):**
| Param | Type | Values |
|-------|------|--------|
| `page` | int | >= 1 |
| `limit` | int | 1-100 |
| `is_active` | boolean | true/false |
| `search` | string | email/name search |
| `role` | string | role name filter |

**Create User Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+639171234567",
  "is_active": true
}
```

### 9.2 Role Management

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/users/:id/roles` | `POST` | 200 |
| `/api/users/:id/roles/:roleId` | `DELETE` | 200 |

**Assign Role Body:**
```json
{
  "role_id": "{{existing_role_uuid}}",
  "is_superadmin": false
}
```

### 9.3 Account Management

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/users/:id/unlock` | `POST` | 200 |
| `/api/users/:id/reset-password` | `POST` | 204 |

**Reset Password Body:**
```json
{
  "password": "NewSecurePass123"
}
```

---

## 10. Validation Failure Tests (400)

Test validation by sending invalid data:

### 10.1 Missing Required Field
**Request:** `POST /api/projects`
```json
{
  "title": "Test Project"
}
```
**Expected:** `400 Bad Request` with validation errors for `project_code`, `project_type`, `status`, `campus`

### 10.2 Invalid Enum Value
**Request:** `POST /api/projects`
```json
{
  "project_code": "TEST-001",
  "title": "Test Project",
  "project_type": "INVALID_TYPE",
  "status": "DRAFT",
  "campus": "MAIN"
}
```
**Expected:** `400 Bad Request` with enum validation error

### 10.3 Invalid UUID Format
**Request:** `GET /api/projects/not-a-uuid`
**Expected:** `400 Bad Request` with UUID validation error

### 10.4 Pagination Out of Range
**Request:** `GET /api/projects?limit=500`
**Expected:** `400 Bad Request` (limit max is 100)

---

## 11. Soft Delete & Audit Field Verification

### 11.1 Soft Delete Evidence Check

After deleting a record, verify in database:

```sql
-- Replace {{table}} and {{id}} with actual values
SELECT id, deleted_at, deleted_by
FROM {{table}}
WHERE id = '{{id}}';

-- Expected: deleted_at IS NOT NULL, deleted_by = JWT user ID
```

### 11.2 Record Not Returned in List After Delete

After soft delete, verify record is excluded from list:
```sql
-- API Query
GET /api/{{resource}}

-- DB Query (what API should filter)
SELECT * FROM {{table}} WHERE deleted_at IS NULL;
```

### 11.3 Audit Fields Evidence

**On Create:**
```sql
SELECT id, submitted_by, created_at FROM {{table}} WHERE id = '{{id}}';
-- submitted_by should match JWT sub claim
```

**On Update:**
```sql
SELECT id, updated_by, updated_at FROM {{table}} WHERE id = '{{id}}';
-- updated_by should match JWT sub claim, updated_at should be recent
```

**On Delete:**
```sql
SELECT id, deleted_by, deleted_at FROM {{table}} WHERE id = '{{id}}';
-- deleted_by should match JWT sub claim, deleted_at should be recent
```

---

## 12. Build Verification

```bash
cd pmo-backend
npm run build
```

**Expected:** Exit code 0, no TypeScript compilation errors.

---

## 13. Endpoint Summary Count

| Module | Endpoints | Nested Resources |
|--------|-----------|------------------|
| Auth | 2 | - |
| University Operations | 5 | indicators (4), financials (4) |
| Projects Core | 5 | - |
| Construction Projects | 5 | milestones (4), financials (4) |
| Repair Projects | 5 | pow-items (4), phases (3), team-members (3) |
| GAD | 27 | - |
| Users | 10 | roles (2), account (2) |
| **Total** | **59** | **30 nested** |

---

## 14. Mismatch Log

Use this section to document any plan vs implementation differences found during testing:

| # | Endpoint | Expected | Actual | Severity | Notes |
|---|----------|----------|--------|----------|-------|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |

**Severity Levels:** CRITICAL (blocks deployment), HIGH (must fix), MEDIUM (should fix), LOW (nice to have)

---

## 15. Test Execution Checklist

- [ ] Server starts successfully (`npm run start:dev`)
- [ ] Health endpoint returns 200 (`GET /health`)
- [ ] Login returns access_token (`POST /api/auth/login`)
- [ ] Profile returns user data (`GET /api/auth/me`)
- [ ] 401 returned without token
- [ ] 401 returned with invalid token
- [ ] University Operations CRUD works
- [ ] University Operations nested (indicators, financials) works
- [ ] Projects Core CRUD works
- [ ] Construction Projects CRUD works
- [ ] Construction Projects nested (milestones, financials) works
- [ ] Repair Projects CRUD works
- [ ] Repair Projects nested (pow-items, phases, team-members) works
- [ ] GAD Student Parity CRUD + review works
- [ ] GAD Faculty Parity CRUD + review works
- [ ] GAD Staff Parity CRUD + review works
- [ ] GAD PWD Parity CRUD + review works
- [ ] GAD Indigenous Parity CRUD + review works
- [ ] GAD GPB Accomplishments works
- [ ] GAD Budget Plans works
- [ ] Users CRUD works (Admin only)
- [ ] Users role assignment works
- [ ] Users account unlock works
- [ ] Users password reset works
- [ ] 403 returned for non-Admin accessing /users
- [ ] Pagination returns correct shape
- [ ] Validation failures return 400
- [ ] Soft delete sets deleted_at/deleted_by
- [ ] Soft-deleted records excluded from lists
- [ ] Audit fields populated from JWT
- [ ] `npm run build` succeeds

---

## 16. Phase 2.6 Test Preparation (File Uploads)

> **Status:** PENDING IMPLEMENTATION
> These tests will be enabled after Phase 2.6 modules are implemented.

### 16.1 Upload Infrastructure Tests

| Test | Endpoint | Expected |
|------|----------|----------|
| Upload image file | `POST /api/uploads` | 201 + file metadata |
| Upload document file | `POST /api/uploads` | 201 + file metadata |
| Upload exceeds size limit | `POST /api/uploads` | 400 (file too large) |
| Upload invalid MIME type | `POST /api/uploads` | 400 (invalid file type) |
| Upload without file | `POST /api/uploads` | 400 (no file provided) |
| Upload without auth | `POST /api/uploads` | 401 Unauthorized |

### 16.2 Documents Module Tests

| Test | Endpoint | Expected |
|------|----------|----------|
| List all documents | `GET /api/documents` | 200 + paginated |
| List entity documents | `GET /api/projects/:id/documents` | 200 |
| Upload document for entity | `POST /api/projects/:id/documents` | 201 |
| Get document details | `GET /api/documents/:docId` | 200 |
| Update document metadata | `PATCH /api/documents/:docId` | 200 |
| Delete document | `DELETE /api/documents/:docId` | 204 |
| Download document | `GET /api/documents/:docId/download` | 200 + file |
| Document not found | `GET /api/documents/:invalid` | 404 |
| Attach to invalid entity | `POST /api/invalid/:id/documents` | 400/404 |

### 16.3 Media Module Tests

| Test | Endpoint | Expected |
|------|----------|----------|
| List all media | `GET /api/media` | 200 + paginated |
| List entity media | `GET /api/projects/:id/media` | 200 |
| Upload media for entity | `POST /api/projects/:id/media` | 201 |
| Get media details | `GET /api/media/:mediaId` | 200 |
| Update media metadata | `PATCH /api/media/:mediaId` | 200 |
| Delete media | `DELETE /api/media/:mediaId` | 204 |
| Toggle featured | `PATCH /api/media/:mediaId/featured` | 200 |
| Media not found | `GET /api/media/:invalid` | 404 |

### 16.4 Construction Gallery Tests

| Test | Endpoint | Expected |
|------|----------|----------|
| List gallery images | `GET /api/construction-projects/:id/gallery` | 200 |
| Upload gallery image | `POST /api/construction-projects/:id/gallery` | 201 |
| Update gallery image | `PATCH /api/construction-projects/:id/gallery/:gid` | 200 |
| Delete gallery image | `DELETE /api/construction-projects/:id/gallery/:gid` | 204 |
| Gallery for invalid project | `GET /api/construction-projects/:invalid/gallery` | 404 |

### 16.5 File Validation Tests

| Test | File Type | Size | Expected |
|------|-----------|------|----------|
| Valid JPEG | image/jpeg | 2MB | 201 |
| Valid PNG | image/png | 3MB | 201 |
| Valid PDF | application/pdf | 5MB | 201 |
| Valid DOCX | application/vnd...docx | 4MB | 201 |
| Oversized file | any | 15MB | 400 |
| Executable file | .exe | 1MB | 400 |
| Script file | .sh/.bat | 1KB | 400 |
| Invalid extension | .xyz | 1KB | 400 |

### 16.6 Phase 2.6 Test Checklist

- [ ] Multer dependency installed (`npm install multer @types/multer`)
- [ ] Upload infrastructure endpoint works
- [ ] Documents CRUD works
- [ ] Media CRUD works
- [ ] Construction gallery works
- [ ] File size limits enforced
- [ ] MIME type validation works
- [ ] Filename sanitization works
- [ ] Soft delete for documents/media works
- [ ] Audit fields populated (uploaded_by, created_at)
- [ ] RBAC enforced (Admin/Staff only)
- [ ] 401 returned without token
- [ ] 403 returned for wrong role
- [ ] `npm run build` succeeds

---

*ACE Framework - Phase 2.5 Verification Harness*
*Governed AI Bootstrap v2.4*
*Updated: 2026-01-15*
