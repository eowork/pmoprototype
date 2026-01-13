# Plan: Phase 2.4 — Backend Core (Authentication & RBAC)
**Status:** DRAFT | Owner: Backend Team Lead  
**Reference:** docs/plan_active.md, docs/research_summary.md, src/database/research.md

## Goal
Prepare and verify a minimal, secure AuthN/AuthZ surface to enable Phase 2.5 (Business APIs) with minimal risk.

## Constraints (verbatim)
- "DO NOT implement frontend, file uploads, advanced analytics, or full reporting in this phase."
- "DO NOT expose endpoints publicly; use local/dev environment only."

## Checklist (atomic steps — SRP aligned)

1. [ ] Confirm environment & secrets
   - Action: Verify .env values (PORT, DATABASE_URL, JWT_SECRET, JWT_EXP)
   - Owner: DevOps / Backend Developer
   - Verification: cat .env | findstr JWT_SECRET
   - Exit: JWT_SECRET present and secret rotation policy documented

2. [ ] Finalize password hashing strategy
   - Action: Choose bcrypt OR argon2 and document (avoid pgcrypto crypt() if Node uses bcrypt)
   - Owner: Backend Architect
   - Verification: Inspect src/auth/auth.service.ts for compare/hash functions
   - Command: grep -n "bcrypt\|argon2" -R src/auth || echo "not found"
   - Exit: Strategy documented and agreed

2.a [NEW] Harden auth logging & audit (security-critical)
   - Action: Remove PII from runtime logs; log generic failure reasons; log only user_id on success; add authenticated-events audit table (login_attempts) with controlled retention.
   - Owner: Security Lead / Backend Developer
   - Verification (manual):
     - Run login failure and search logs: grep -n "LOGIN_FAILURE" logs/*.log || journalctl -u pmo-backend | grep LOGIN_FAILURE
     - Ensure no "email=" substring present in failure logs: grep -R "LOGIN_FAILURE" | grep -E "email=" && echo "PII FOUND" || echo "OK"
     - Confirm success logs contain user_id only: grep -R "LOGIN_SUCCESS" | grep -E "user_id=" && ! grep -R "LOGIN_SUCCESS" | grep -E "email="
   - Exit: Failure logs do not include email/PII; audit table records attempt metadata (timestamp, ip_hash, outcome); logging access policy enforced.

3. [ ] Confirm roles & seed data
   - Action: Ensure roles table has Admin/Staff/Client and seed script exists
   - Owner: Backend Developer / DBA
   - Verification SQL: psql $DATABASE_URL -c "SELECT name FROM roles;"
   - Exit: Roles present OR seed script ready

4. [ ] Design API contract for Auth (OpenAPI)
   - Action: Draft OpenAPI paths: POST /auth/register, POST /auth/login, GET /auth/me, POST /auth/refresh
   - Owner: Backend Architect
   - Verification: docs/openapi-auth.yaml present
   - Command: grep -n "paths:" docs/openapi-auth.yaml || echo "missing"
   - Exit: OpenAPI draft approved

4.a [NEW] Confirm registration flow (register endpoint present or documented)
   - Action: Inspect controllers; if no /auth/register, document admin-only registration flow and add plan to implement register endpoint if self-registration required.
   - Owner: Backend Architect / Product Owner
   - Verification:
     - Inspect file: grep -n "@Controller('auth')" -R src/auth && sed -n '1,200p' src/auth/auth.controller.ts
     - Confirm POST /auth/register exists or documented alternative in docs/plan_active.md
   - Exit: Either register endpoint implemented OR registration flow documented and seed workflow validated.

5. [ ] Implement Auth endpoints and DTOs (code task)
   - Action: Implement register/login/me endpoints using chosen hash + JWT
   - Owner: Backend Developer
   - Verification: curl -s -X POST http://localhost:3000/auth/login -d '{"email":"x","password":"y"}' -H 'Content-Type:application/json'
   - Exit: Login returns access_token on valid creds

6. [ ] Implement RBAC guards & decorators
   - Action: Implement RolesGuard and @Roles() decorator; integrate with controllers
   - Owner: Backend Developer
   - Verification: Call an admin-only route with non-admin token => 403
   - Command: curl -I -H "Authorization: Bearer <user-token>" http://localhost:3000/admin/users
   - Exit: Non-admin receives 403; admin receives 200

7. [ ] Seed test Admin and verify end-to-end
   - Action: Create test admin via seed SQL OR POST /auth/register then assign role
   - Owner: QA / Developer
   - Verification SQL: psql $DATABASE_URL -c "SELECT id,email FROM users WHERE email='test.admin@example.edu';"
   - Command: curl -X POST http://localhost:3000/auth/login -d '{"email":"test.admin@example.edu","password":"P@ssw0rd"}' -H 'Content-Type:application/json'
   - Exit: Token obtained and /auth/me returns admin roles

8. [ ] Add OpenAPI docs exposure & contract test
   - Action: Enable Swagger/Redoc and write a basic contract test asserting /auth/login response schema
   - Owner: Backend Developer / QA
   - Verification: curl -s http://localhost:3000/api-docs | head -n 1
   - Exit: Contract test passes (npm run test:contract)

9. [ ] Unit tests for auth & RBAC logic
   - Action: Add unit tests for AuthService (hash/compare) and RolesGuard
   - Owner: Developer / QA
   - Verification: npm test -- tests/auth
   - Exit: 90%+ pass on auth-related tests

10. [ ] Migration & rollback validation
    - Action: Document and run migration/seed, then test rollback
    - Owner: DBA / DevOps
    - Verification: run migration: npm run migrate && npm run migrate:down
    - Exit: Migration applied and rolled back successfully in dev

11. [ ] Security review & gating
    - Action: Conduct brief security checklist (JWT secret length, HTTPS in prod, CORS)
    - Owner: Security Lead
    - Verification: checklist signed-off
    - Exit: Security issues logged/resolved or accepted risk documented

## Verification quick commands (examples)
- Health: curl -s http://localhost:3000/health
- Check roles: psql $DATABASE_URL -c "SELECT name FROM roles;"
- Login test: curl -s -X POST http://localhost:3000/auth/login -H "Content-Type:application/json" -d '{"email":"test.admin@example.edu","password":"P@ssw0rd"}'
- Confirm no PII in failure logs:
  - grep -R "LOGIN_FAILURE" /var/log/pmo-backend | xargs grep -E "email=" && echo "PII FOUND" || echo "OK"
- Contract lint: npx openapi-cli validate docs/openapi-auth.yaml

## File pointers (implementation locations)
- Auth controllers/services: pmo-backend/src/auth/{auth.controller.ts,auth.service.ts}
- Users: pmo-backend/src/users/{users.controller.ts,users.service.ts}
- JWT strategy & guards: pmo-backend/src/auth/strategies/jwt.strategy.ts, pmo-backend/src/auth/guards/roles.guard.ts
- DB service: pmo-backend/src/database/database.service.ts
- Research reference: pmo-backend/src/database/research.md
- Global plan: docs/plan_active.md

## Exit Criteria for Phase 2.4
- Auth endpoints respond with valid JWT for seeded test admin
- Roles/permissions enforced by guards on admin routes
- OpenAPI contract for Auth exists and basic contract tests pass
- Unit tests for Auth/RBAC pass locally
- Migration + rollback validated in dev
- Logging hardening: failure logs contain no PII; audit trail for auth events exists and is access-controlled

## DO NOT DO YET (restate)
- Implement frontend login UI, file uploads, analytics, or public deployment.

# End of file
