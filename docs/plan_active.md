# Plan: Phase 2.3 - Backend Initialization
**Status:** ACTIVE | Single Source of Truth
**Date:** 2026-01-12
**Reference:** `docs/research_summary.md`

---

## Phase Context

| Phase | Description | Status |
|-------|-------------|--------|
| 2.1 | Environment Setup | DONE |
| 2.2 | Database Design | DONE |
| **2.3** | **Backend Initialization** | **IN_PROGRESS** |
| 2.4 | API Development | PENDING |

---

## Prerequisites

- [x] PostgreSQL installed (pgAdmin 4 accessible)
- [x] Node.js 18+ installed
- [x] Schema validated (`research_summary.md`)
- [x] Normalized schema produced (`pmo_schema_pg.sql`)

---

## Step 2.3.1: Database Materialization

| Attribute | Value |
|-----------|-------|
| **Objective** | Execute normalized schema in PostgreSQL |
| **Status** | PENDING |
| **Input** | `pmo_schema_pg.sql` |
| **Output** | 53 tables, 16 ENUMs, 3 functions, 1 trigger |

**Actions:**
1. [ ] Open pgAdmin 4
2. [ ] Create database: `pmo_dashboard`
3. [ ] Execute `pmo_schema_pg.sql` in Query Tool
4. [ ] Verify zero errors in Messages tab

**Verification:**
```sql
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
-- Expected: 53
```

**Notes:**
- Schema includes `pgcrypto` extension for UUID generation
- All 12 blocking issues from original schema resolved
- Table order corrected for FK dependencies

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
| **Status** | PENDING |
| **Input** | Manual INSERT statements |
| **Output** | Populated `roles`, `funding_sources`, `repair_types`, `construction_subcategories` |

**Actions:**
1. [ ] Insert roles: `Admin`, `Staff`, `Client`
2. [ ] Insert funding sources (GAA, Local, Special Grants)
3. [ ] Insert repair types (Electrical, Plumbing, Structural, etc.)
4. [ ] Insert construction subcategories

**Verification:**
```sql
SELECT 'roles' AS tbl, COUNT(*) FROM roles
UNION ALL SELECT 'funding_sources', COUNT(*) FROM funding_sources
UNION ALL SELECT 'repair_types', COUNT(*) FROM repair_types;
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
| **Status** | PENDING |
| **Input** | NestJS CLI |
| **Output** | `/pmo-backend` directory with health endpoint |

**Actions:**
1. [ ] Run: `nest new pmo-backend`
2. [ ] Install: `npm install @nestjs/config pg`
3. [ ] Create `.env` with `DATABASE_URL`
4. [ ] Verify: `npm run start:dev` succeeds

**Verification:**
```bash
curl http://localhost:3000
# Expected: Hello World or health response
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
| **Status** | PENDING |
| **Input** | `.env` DATABASE_URL |
| **Output** | Database module with connection pool |

**Actions:**
1. [ ] Create `src/database/database.module.ts`
2. [ ] Configure `pg` Pool with connection string
3. [ ] Export pool for dependency injection
4. [ ] Log "Database connected" on startup

**Verification:**
```
[Nest] LOG Database connected successfully
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

## Step 2.3.5: Validation Endpoint

| Attribute | Value |
|-----------|-------|
| **Objective** | Confirm backend can query database |
| **Status** | PENDING |
| **Input** | Database module |
| **Output** | `GET /health` with DB timestamp |

**Actions:**
1. [ ] Create health service with `SELECT NOW()`
2. [ ] Wire to `GET /health` endpoint
3. [ ] Return `{ status, database, serverTime }`

**Verification:**
```bash
curl http://localhost:3000/health
# Expected: {"status":"ok","database":"connected","serverTime":"2026-01-12T..."}
```

**Notes:**
- This confirms full stack connectivity
- No authentication required for health endpoint

**Risks:**
| Risk | Mitigation |
|------|------------|
| Query fails | Check pool connection, table permissions |

---

## Definition of Done (Phase 2.3)

| # | Criterion | Verification | Status |
|---|-----------|--------------|--------|
| 1 | Schema executed | Zero errors in pgAdmin 4 | PENDING |
| 2 | 53 tables exist | `information_schema.tables` count | PENDING |
| 3 | Reference data seeded | Count queries pass | PENDING |
| 4 | NestJS project created | `npm run start:dev` succeeds | PENDING |
| 5 | Database connected | Console log confirms | PENDING |
| 6 | Health endpoint works | Returns server time | PENDING |
| 7 | No frontend code | Backend directory only | PENDING |

---

## Status Log

| Date | Step | Status | Notes |
|------|------|--------|-------|
| 2026-01-12 | Phase 2.3 Plan | DONE | Plan created |
| 2026-01-12 | Schema normalized | DONE | `pmo_schema_pg.sql` produced |
| 2026-01-12 | Step 2.3.1 | PENDING | User: Execute in pgAdmin 4 |
| 2026-01-12 | Step 2.3.2 | DONE | `pmo_seed_data.sql` created |
| 2026-01-12 | Step 2.3.3 | DONE | `pmo-backend/` project created |
| 2026-01-12 | Step 2.3.4 | DONE | `database.module.ts` created |
| 2026-01-12 | Step 2.3.5 | DONE | `health/` module created |

---

## Out of Scope (Deferred to Phase 2.4+)

- [ ] API endpoint implementation
- [ ] Authentication/JWT
- [ ] RBAC middleware
- [ ] Frontend integration
- [ ] Deployment (PM2/Nginx)
- [ ] Schema migrations (Drizzle Kit)
- [ ] ORM setup (optional)

---

## Files

| File | Purpose | Status |
|------|---------|--------|
| `docs/plan_active.md` | This plan (source of truth) | ACTIVE |
| `docs/research_summary.md` | Schema validation report | COMPLETE |
| `pmo_schema_pg.sql` | Normalized PostgreSQL schema | READY |
| `pmo_seed_data.sql` | Reference data seed script | READY |
| `pmo-backend/` | NestJS backend project | READY |

---

*ACE Framework - Phase 2.3 Plan*
*Governed AI Bootstrap v2.4*
