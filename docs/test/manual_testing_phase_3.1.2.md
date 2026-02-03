# Manual Testing Guide: Phase 3.1.2 - Progress Tracking

**Date:** 2026-01-29
**Phase:** 3.1.2 - Full Migration Support (Option C)
**Research:** ACE-R9 (docs/research_summary.md Section 28)

---

## Prerequisites

1. **Database Migration:** Execute the migration first:
   ```bash
   psql -U postgres -d pmo_db -f "database/migrations/002_add_repair_progress_fields.sql"
   ```

2. **Start Backend:**
   ```bash
   cd pmo-backend && npm run start:dev
   ```

3. **Start Frontend:**
   ```bash
   cd pmo-frontend && npm run dev
   ```

4. **Login:** Use admin credentials to get auth token

---

## Test Suite 1: Construction Project Progress Update

### Test 1.1: Create Construction Project
**Endpoint:** `POST /api/construction-projects`

**Payload:**
```json
{
  "project_code": "TEST_CONST_PROGRESS_001",
  "title": "Test Construction Progress Tracking",
  "campus": "MAIN",
  "status": "PLANNING",
  "funding_source_id": "<valid-funding-source-id>"
}
```

**Expected:**
- Status: 201 Created
- Response includes `physical_progress: 0.00` (or null)
- Response includes `financial_progress: 0.00` (or null)

**Record the project ID:** `<construction-project-id>`

---

### Test 1.2: Update Physical Progress to 45%
**Endpoint:** `PATCH /api/construction-projects/<construction-project-id>`

**Payload:**
```json
{
  "physical_progress": 45
}
```

**Expected:**
- Status: 200 OK
- Response: `physical_progress: 45.00`

---

### Test 1.3: Update Financial Progress to 75%
**Endpoint:** `PATCH /api/construction-projects/<construction-project-id>`

**Payload:**
```json
{
  "financial_progress": 75
}
```

**Expected:**
- Status: 200 OK
- Response: `financial_progress: 75.00`

---

### Test 1.4: Verify Persisted Progress
**Endpoint:** `GET /api/construction-projects/<construction-project-id>`

**Expected:**
- Status: 200 OK
- Response: `physical_progress: 45.00`
- Response: `financial_progress: 75.00`

---

### Test 1.5: Frontend Display Verification
**URL:** `http://localhost:3001/projects/<construction-project-id>`

**Expected:**
- Detail page shows progress bar at 45%
- Visual representation matches backend data

---

## Test Suite 2: Repair Project Progress Update

### Test 2.1: Create Repair Project
**Endpoint:** `POST /api/repair-projects`

**Payload:**
```json
{
  "project_code": "TEST_REPAIR_PROGRESS_001",
  "title": "Test Repair Progress Tracking",
  "building_name": "Test Building",
  "campus": "MAIN",
  "status": "REPORTED",
  "urgency_level": "HIGH",
  "repair_type_id": "<valid-repair-type-id>"
}
```

**Expected:**
- Status: 201 Created
- Response includes `physical_progress: 0.00` (or null)
- Response includes `financial_progress: 0.00` (or null)

**Record the repair ID:** `<repair-project-id>`

---

### Test 2.2: Update Physical Progress to 60%
**Endpoint:** `PATCH /api/repair-projects/<repair-project-id>`

**Payload:**
```json
{
  "physical_progress": 60
}
```

**Expected:**
- Status: 200 OK
- Response: `physical_progress: 60.00`

---

### Test 2.3: Update Financial Progress to 80%
**Endpoint:** `PATCH /api/repair-projects/<repair-project-id>`

**Payload:**
```json
{
  "financial_progress": 80
}
```

**Expected:**
- Status: 200 OK
- Response: `financial_progress: 80.00`

---

### Test 2.4: Verify Persisted Progress
**Endpoint:** `GET /api/repair-projects/<repair-project-id>`

**Expected:**
- Status: 200 OK
- Response: `physical_progress: 60.00`
- Response: `financial_progress: 80.00`

---

## Test Suite 3: Validation Tests

### Test 3.1: Reject Negative Progress
**Endpoint:** `PATCH /api/construction-projects/<construction-project-id>`

**Payload:**
```json
{
  "physical_progress": -5
}
```

**Expected:**
- Status: 400 Bad Request
- Error message: "physical_progress must not be less than 0"

---

### Test 3.2: Reject Progress > 100
**Endpoint:** `PATCH /api/construction-projects/<construction-project-id>`

**Payload:**
```json
{
  "physical_progress": 120
}
```

**Expected:**
- Status: 400 Bad Request
- Error message: "physical_progress must not be greater than 100"

---

### Test 3.3: Reject Non-Numeric Progress
**Endpoint:** `PATCH /api/construction-projects/<construction-project-id>`

**Payload:**
```json
{
  "physical_progress": "abc"
}
```

**Expected:**
- Status: 400 Bad Request
- Error message: "physical_progress must be a number"

---

## Test Suite 4: Database Integrity

### Test 4.1: Verify Progress Defaults
**Query:**
```sql
SELECT id, physical_progress, financial_progress
FROM repair_projects
LIMIT 5;
```

**Expected:**
- All records have `physical_progress = 0.00`
- All records have `financial_progress = 0.00`
- No NULL values (fields should default to 0.00)

---

### Test 4.2: Verify FK Constraint Exists
**Query:**
```sql
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE conname = 'fk_deleted_by_user';
```

**Expected:**
- Constraint exists
- References `users(id)` table

---

### Test 4.3: Test FK Constraint Enforcement
**Query:**
```sql
-- This should FAIL with FK violation
UPDATE repair_projects
SET deleted_by = '00000000-0000-0000-0000-000000000000'
WHERE id = '<repair-project-id>';
```

**Expected:**
- Error: Foreign key violation
- Error: Key is not present in table "users"

---

## Test Suite 5: Sorting by Progress

### Test 5.1: Sort Construction Projects by Progress
**Endpoint:** `GET /api/construction-projects?sort=physical_progress&order=desc`

**Expected:**
- Status: 200 OK
- Results sorted by `physical_progress` descending
- Highest progress first

---

### Test 5.2: Sort Repair Projects by Progress
**Endpoint:** `GET /api/repair-projects?sort=physical_progress&order=asc`

**Expected:**
- Status: 200 OK
- Results sorted by `physical_progress` ascending
- Lowest progress first

---

## Test Results Checklist

### Schema Migration
- [ ] Migration executed successfully
- [ ] `repair_projects` table has `physical_progress` column
- [ ] `repair_projects` table has `financial_progress` column
- [ ] FK constraint `fk_deleted_by_user` exists

### Backend API
- [ ] Construction progress update works (Test 1.2, 1.3)
- [ ] Repair progress update works (Test 2.2, 2.3)
- [ ] Progress validation works (Test 3.1, 3.2, 3.3)
- [ ] Progress persists correctly (Test 1.4, 2.4)
- [ ] Sorting by progress works (Test 5.1, 5.2)

### Frontend Integration
- [ ] Progress bar displays correctly (Test 1.5)
- [ ] Frontend build succeeds
- [ ] No TypeScript errors

### Database Integrity
- [ ] Defaults are 0.00 (Test 4.1)
- [ ] FK constraint enforced (Test 4.3)

### Build Verification
- [ ] Backend build: ✅ Success
- [ ] Frontend build: ✅ Success
- [ ] E2E tests pass: Run `npm run test:e2e` in backend

---

## Notes

1. **Migration Required:** User must execute migration SQL before testing
2. **Valid IDs:** Replace `<valid-funding-source-id>` and `<valid-repair-type-id>` with actual IDs from database
3. **Auth Token:** All API requests require `Authorization: Bearer <token>` header
4. **Decimal Format:** Progress values may return as "45.00" (string) or 45 (number) depending on database driver

---

**Phase 3.1.2 Manual Testing Guide**
**Status:** Ready for execution after migration
**Next:** User performs manual tests and verifies all checkboxes
