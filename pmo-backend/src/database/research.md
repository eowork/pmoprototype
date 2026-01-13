# Research: Backend Database Service & RBAC Implementation (Phase 1 follow-up)

## Context & Goal
- Purpose: Re-check repository artifacts against `docs/plan_active.md` (Phase 2.4) and document how to create & verify a test Admin account (Postman / curl / SQL) without implementing code.
- Files inspected (evidence):  
  - `pmo-backend/src/database/*` (database.module.ts, database.service.ts, research.md)  
  - `pmo-backend/src/auth/*` (auth.controller.ts, auth.service.ts, dto, guards, strategies)  
  - `pmo-backend/src/users/*` (users.controller.ts, users.service.ts, dto)

## Quick Findings — "What is going on?"
- Plan vs repo alignment:
  - Plan (`docs/plan_active.md`) prescribes Phase 2.4 (AuthN/AuthZ, Users). The codebase contains scaffolded modules matching that plan: `src/auth` and `src/users` folders with controllers, services, DTOs, guards, and JWT strategy present.
  - Database integration artifacts exist and align with plan: `DatabaseModule` + `DatabaseService` + `health` module present.
- Status summary:
  - Scaffolding: Completed (controllers/services/DTOs/guards present).
  - Contract readiness: API routes defined by controllers exist but need runtime verification (endpoints may be stubbed or implemented).
  - DB schema & seed data: Plan asserts schema/roles seeded; confirm with SQL queries before testing.

## File paths to verify / reuse
- Auth endpoints: `pmo-backend/src/auth/auth.controller.ts`
- Auth logic: `pmo-backend/src/auth/auth.service.ts`
- JWT strategy & guards: `pmo-backend/src/auth/strategies/jwt.strategy.ts`, `pmo-backend/src/auth/guards/jwt-auth.guard.ts`
- Users/Admin endpoints: `pmo-backend/src/users/users.controller.ts`, `pmo-backend/src/users/users.service.ts`
- DB access: `pmo-backend/src/database/database.service.ts`
- Health: `pmo-backend/src/health/health.controller.ts`

## Dependency graph (relevant)
- AppModule → imports DatabaseModule, AuthModule, UsersModule, HealthModule
- AuthService & UsersService → depend on DatabaseService for SQL queries
- Guards/Strategies → depend on AuthService / DatabaseService for token validation & RBAC checks

## How to create a test Admin (research-only, SQL + verification steps)

1) Preconditions
- PostgreSQL database accessible and running
- Backend running locally (default: http://localhost:3000) or confirm port in `src/main.ts` / env
- Confirm `roles` table contains 'Admin' (SELECT name FROM roles;)

2) SQL: create test user
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (id, email, password_hash, first_name, last_name, is_active, created_at)
VALUES (
  gen_random_uuid(),
  'test.admin@example.edu',
  crypt('P@ssw0rd', gen_salt('bf')),
  'Test',
  'Admin',
  true,
  now()
)
RETURNING id;
```

3) SQL: assign Admin role
```sql
WITH u AS (SELECT id FROM users WHERE email='test.admin@example.edu' LIMIT 1),
r AS (SELECT id FROM roles WHERE name='Admin' LIMIT 1)
INSERT INTO user_roles (user_id, role_id, is_superadmin, created_at)
SELECT u.id, r.id, false, now() FROM u, r
RETURNING user_id;
```

4) Verify rows
```sql
SELECT id,email,is_active FROM users WHERE email='test.admin@example.edu';
SELECT ur.user_id, r.name FROM user_roles ur JOIN roles r ON ur.role_id=r.id WHERE ur.user_id=(SELECT id FROM users WHERE email='test.admin@example.edu');
```

## Manual Authentication Test Plan (Phase 1 research — NO implementation)

Pre-checks (research-only)
- Inspect `auth.controller.ts` to confirm route paths: look for @Controller('auth') and methods (login/register/me).
- Inspect `auth.service.ts` to determine password hashing/compare method (bcrypt vs crypt()). If Node uses bcrypt, DO NOT use pgcrypto crypt() for DB seed — instead create password via bcrypt hash or use register endpoint.
- Confirm backend env (PORT, DB_URL) and run health endpoint: GET http://localhost:3000/health

Test steps (Thunder Client / Postman / curl)

A) Login (if login endpoint implemented)
- Endpoint: POST http://localhost:3000/auth/login
- Body (JSON):
  { "email":"test.admin@example.edu", "password":"P@ssw0rd" }

curl:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test.admin@example.edu","password":"P@ssw0rd"}'
```
- Expected: 200 with JSON { access_token: "...", user: { id,email,roles,... } } or error 401

B) Register (if register endpoint exists)
- Endpoint: POST http://localhost:3000/auth/register (check controller)
- Body: create-user DTO fields (email,password,first_name,last_name)
- Use Thunder Client: choose POST, set JSON body, send, expect 201 created + user id

C) Token verification
- Use returned token:
curl:
```bash
curl http://localhost:3000/auth/me -H "Authorization: Bearer <token>"
```
- Expected: 200 user profile including roles/is_superadmin

D) Admin-protected route check
- Call an admin endpoint (inspect controllers for exact path, e.g., GET /users or GET /admin/users)
- Expect 200 for admin, 403 for non-admin

Troubleshooting checklist
- 401 on login: inspect `auth.service.ts` password compare (bcrypt.compare vs crypt()); if mismatch, either seed using same algorithm or use register endpoint to create user.
- 404 on routes: confirm controller route decorators (`@Controller('auth')`, method names)
- 500: check backend logs/console for stack trace (inspect DatabaseService query errors)
- Token invalid: confirm JWT secret and expiry in env (.env) and that JWT strategy uses same secret

Verification SQL snippets
- Confirm token-related fields if stored (refresh tokens): SELECT * FROM auth_tokens WHERE user_id=...
- Confirm user role join: see earlier verify queries

Risks (research notes)
- Hash mismatch between DB seed and AuthService causes auth failures — verify algorithm before seeding.
- Route paths may differ from assumptions — open controller files to read exact paths.
- Do not modify code in this research step.

## Lessons Learned (Compaction)
- [2026-01-13]: Repo scaffolding exposes the expected endpoints surface. Manual testing sequence: (1) inspect controllers for exact routes and hashing algorithm, (2) seed user only with compatible hash or use register endpoint, (3) perform login, token verify, admin-route check via Thunder Client/Postman/curl, (4) troubleshoot via logs and DB queries.
