# Plan: Phase 2.9 - Testing Infrastructure
**Status:** ACTIVE | Single Source of Truth
**Date:** 2026-01-19
**Reference:** `docs/research_summary.md` (Completed Phases 2.4–2.8)

---

## Completed Phases Summary

| Phase | Description | Status | Reference |
|-------|-------------|--------|-----------|
| 2.4 | Auth & RBAC | DONE | research_summary.md Section 1 |
| 2.5 | Domain APIs | DONE | research_summary.md Section 0 |
| 2.6 | File Uploads & Documents | DONE | research_summary.md Section 10 |
| 2.7 | Reference Data Management | DONE | research_summary.md Section 11-12 |
| 2.8 | Quality Assurance & API Documentation | DONE | research_summary.md Section 13 |

**Backend Maturity:** 17 modules, 129+ endpoints, 56 DTOs, 100% schema alignment, build passing.

---

## Phase 2.9: Testing Infrastructure

### Goal
Establish a minimal, working test framework that validates auth flow and one CRUD cycle.

### Action
Configure Jest with TypeScript support; write 2 focused test suites (auth, one domain).

### Output
- Working `npm run test` command
- Auth service test file (login success/failure)
- One domain E2E test (contractors CRUD cycle)

---

### Required Tasks

| # | Task | Verification | Pass Criteria |
|---|------|--------------|---------------|
| 2.9.0 | Install test dependencies | `npm ls @nestjs/testing jest supertest ts-jest` | All 4 packages listed, no errors |
| 2.9.1 | Create `jest.config.js` with ts-jest preset | `cat pmo-backend/jest.config.js` | File exists, contains `preset: 'ts-jest'` |
| 2.9.2 | Create `pmo-backend/test/jest-e2e.json` | `cat pmo-backend/test/jest-e2e.json` | File exists, valid JSON |
| 2.9.3 | Add test scripts to `package.json` | `npm run test --help` | Command recognized, no "missing script" error |
| 2.9.4 | Create `auth.service.spec.ts` | `npm run test -- --testPathPattern=auth` | Exit code 0, ≥1 test passes |
| 2.9.5 | Create `contractors.e2e-spec.ts` | `npm run test:e2e -- --testPathPattern=contractors` | Exit code 0, ≥1 test passes |
| 2.9.V | Full verification | `npm run build && npm run test` | Both commands exit code 0 |

---

### Test Database Strategy (KISS)

**Approach:** Use existing development database with deterministic test data.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Separate test DB | NO | Adds infrastructure complexity; dev DB sufficient for MVP |
| Transaction rollback | NO | Requires test harness changes; violates KISS |
| Test fixtures | YES | Create/delete test records within each test |
| Isolation | Per-test cleanup via `afterEach()` | Simple, no external dependencies |

**Test data pattern:**
```typescript
// Create test record with unique identifier
const testContractor = { name: `TEST_${Date.now()}`, ... };
// Cleanup in afterEach
await service.remove(testContractor.id);
```

---

### TypeScript/Jest Configuration (Explicit)

**jest.config.js:**
```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
};
```

**test/jest-e2e.json:**
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" }
}
```

---

### Constraints (Corrected)

| Principle | Application |
|-----------|-------------|
| **YAGNI** | 2 test files only (auth + 1 domain); no coverage thresholds |
| **KISS** | No test DB, no transactions, no mocking framework beyond Jest built-ins |
| **SOLID (SRP)** | One test file tests one service/controller |

---

### Definition of Done (Phase 2.9)

| # | Criterion | Command | Expected Output |
|---|-----------|---------|-----------------|
| 1 | Jest installed | `npm ls jest` | `jest@x.x.x` (no error) |
| 2 | ts-jest installed | `npm ls ts-jest` | `ts-jest@x.x.x` (no error) |
| 3 | Config exists | `test -f pmo-backend/jest.config.js && echo OK` | `OK` |
| 4 | Test script works | `npm run test 2>&1 \| head -1` | No "missing script" error |
| 5 | Auth tests pass | `npm run test -- --testPathPattern=auth --passWithNoTests` | Exit 0 |
| 6 | E2E tests pass | `npm run test:e2e -- --testPathPattern=contractors --passWithNoTests` | Exit 0 |
| 7 | Build still passes | `npm run build` | Exit 0 |

**All 7 criteria are binary (pass/fail) and verifiable via single commands.**

---

### Risks & Mitigations (Simplified)

| Risk | Mitigation |
|------|------------|
| Test data left in DB | Use timestamped unique names; cleanup in `afterEach` |
| Tests fail on CI (no DB) | Document: tests require local DB connection |
| Flaky tests | Avoid `setTimeout`; use deterministic assertions |

---

## Out of Scope (Deferred)

| Item | Phase | Reason |
|------|-------|--------|
| Separate test database | Future | KISS: dev DB sufficient for MVP |
| Coverage thresholds | Future | YAGNI: not required for MVP |
| Mocking frameworks (sinon, etc.) | Future | KISS: Jest built-ins sufficient |
| CI/CD integration | Phase 3.2 | Separate concern |
| Frontend integration | Phase 3.0 | Separate phase |
| Performance/load testing | Phase 3.x | Premature optimization |

---

## Phase Transition Gate (to Phase 3.0)

All 7 DoD commands must return expected output before advancing to Phase 3.0.

---

## Files Reference

| File | Purpose | Status |
|------|---------|--------|
| `docs/plan_active.md` | This plan | ACTIVE |
| `docs/research_summary.md` | Completed phases | REFERENCE |
| `pmo-backend/jest.config.js` | Jest config | PENDING |
| `pmo-backend/test/jest-e2e.json` | E2E Jest config | PENDING |
| `pmo-backend/src/auth/auth.service.spec.ts` | Auth unit tests | PENDING |
| `pmo-backend/test/contractors.e2e-spec.ts` | Contractors E2E | PENDING |
| `pmo-backend/package.json` | Test scripts | UPDATE PENDING |

---

## Package.json Scripts (Target State)

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

---

*ACE Framework — Phase 2.9 Plan (Revised)*
*Updated: 2026-01-19*
