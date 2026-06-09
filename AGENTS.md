# PMO Dashboard — Project Context

> **Governance:** ACE Framework v2.4 (Operator LTS)
> **Last Updated:** 2026-06-02
> **Status:** Phase DDD ✅ COMPLETE — COI Phase 3 sprint; docs refactored to 5-artifact AI-first structure

## Documentation Structure (AI-First, 2026-06-02)
```
docs/state.md        ← READ FIRST — current project state, blockers, constraints
docs/plan.md         ← Active work only — pending tasks, smoke tests, candidates
docs/research.md     ← Research findings only (R-001 through R-012)
docs/history.md      ← Completed work archive, approved decisions, bug fixes
docs/architecture.md ← Technical reference — stack, patterns, conventions
```
**AI Onboarding:** Read `docs/state.md` + `docs/plan.md` for implementation work. Others only when needed.

---

## ACE Framework v2.4 — Enforcement Rules

This project operates under the ACE (Analyze → Contextualize → Execute) governance model.
Full specification: `docs/guides/VERSION 2.4 PROMPT AND RULE GOVERNANCE AI ENGINEERING.txt`
Integration guide: `docs/guides/ACE_CLAUDE_MD_INTEGRATION_GUIDE.txt`

**Phase-Locked Execution (NON-NEGOTIABLE):**
1. **Phase 1 — Research:** Read code, analyze, write findings to `docs/research.md`
2. **Phase 2 — Plan:** Write ordered implementation steps to `docs/plan.md`
3. **Phase 3 — Implement:** Execute ONLY approved plan steps. Plan is FROZEN.

**Authorization Gates:**
- `RUN_ACE` or `EXECUTE_WITH_ACE` → activates ACE Framework
- `META_DISCUSSION` → explanatory only, NO mutations
- No implementation without explicit operator authorization
- No phase skipping. No plan mutation during Phase 3.

**Operator Commands:** `PAUSE_STATE`, `RESET_SCOPE`, `ADVANCE_STEP`, `ADVANCE_TO_STEP <n>`, `VERIFY_STEP`, `SET_VERBOSITY <SUMMARY|VERBOSE>`

---

## Project Structure

```
pmo-dash/
├── pmo-backend/          NestJS + PostgreSQL backend
│   └── src/university-operations/   Main module (CRUD, financials, indicators, quarterly reports)
├── pmo-frontend/         Nuxt 3 + Vue 3 + Vuetify frontend
│   └── pages/university-operations/
│       ├── index.vue              Landing page + analytics dashboard
│       ├── physical/index.vue     Physical Accomplishment (BAR No. 1)
│       └── financial/index.vue    Financial Accomplishment (BAR No. 2)
├── database/migrations/  PostgreSQL migration files (001–047+)
├── docs/
│   ├── plan.md           Execution contract (ACE Phase 2 artifact)
│   ├── research.md       Research findings (ACE Phase 1 artifact)
│   ├── guides/          AI engineering guides (ACE specs, governance, integration)
│   ├── references/      Domain references (DBM, BAR, policy, spreadsheets)
│   └── archive/         Archived completed phases (read-only)
└── AGENTS.md             This file (project context — NOT an execution artifact)
```

---

## Tech Stack

- **Backend:** NestJS, TypeScript, PostgreSQL (raw SQL via `pg`), class-validator DTOs, ValidationPipe
- **Frontend:** Nuxt 3, Vue 3 Composition API, Vuetify 3, Pinia stores, ApexCharts
- **Auth:** JWT with role-based access (SuperAdmin, Admin, Staff)
- **Deployment:** Manual (no CI/CD configured)

---

## Key Domain Concepts

- **BAR No. 1 (Physical):** Target vs Actual accomplishments per indicator per quarter per pillar
- **BAR No. 2 (Financial):** Appropriation, Obligations, Disbursement, Utilization Rate per quarter
- **Quarterly Report Lifecycle:** DRAFT → PENDING_REVIEW → PUBLISHED (with REJECTED, UNLOCKED, REVERTED states)
- **Pillars:** GOVERNANCE, ADMINISTRATION, QASS, EXTERNAL_LINKAGES (taxonomy seeded in migration 019 — NEVER modify)
- **Fiscal Year:** Configurable by SuperAdmin, stored in `fiscal_years` table

---

## Active Governance Directives (Summary)

122 UO directives (1–122, Phases D–HI) + 14 COI directives (JB-D1–JB-D14) — full tables in `docs/plan.md` header section.

**Critical active rules — University Operations:**
- Backend enforcement is authoritative; frontend is presentation only
- `validateOperationEditable()` must receive `quarter` parameter for publication lock
- `autoRevertQuarterlyReport()` must be called after every CUD operation
- Financial and Physical modules share `quarterly_reports` entity
- BAR1 indicator taxonomy (migration 019) is READONLY — never modify
- Override fields (`override_total_target`, `override_total_actual`) use `??` merge pattern in `computeIndicatorMetrics()`
- Narrative fields (`catch_up_plan`, `facilitating_factors`, `ways_forward`) rendered via expandable row only

**Critical active rules — COI Module:**
- Backend route `/api/construction-projects` is IMMUTABLE; public endpoint is `/api/public/construction-projects`
- `pmo-frontend/utils/adapters.ts` is the ONLY place frontend type interfaces are defined
- Gallery fetched separately via `GET /api/construction-projects/:id/gallery` — NOT embedded in `findOne`
- Public pages at `/coi/public/` use `@Public()` decorator — no JWT guard
- `api.del()` not `api.delete()` for all DELETE calls
- Figma MCP = design reference ONLY; never implementation authority

---

## Deferred Items

| # | Item | Priority |
|---|------|----------|
| 66 | UO operation assignment CRUD endpoints | ✅ Built in Phase IJ |
| 75 | Quarter-level submission (per-QN status) | ✅ Built in Phase DY-D — stale entry |
| 87 | Cross-module analytics preparation | YAGNI |
| 96 | Financial analytics endpoints | YAGNI (until data entry stable) |
| 148 | Prior-quarter prefill for Physical Accomplishment page | ✅ Phase FJ |

---

## Completed Milestones

- **Physical Accomplishment Module:** Stable (declared Phase EU-A, 2026-03-17); remarks column + APR/UPR narrative fields added (Phase HE, 2026-04-13)
- **Financial Accomplishment Module:** Data entry + governance + analytics implemented (Phases ET–FB); Balance→Disbursement swap + hero stat cards + chip enhancement (Phase HE)
- **User Management Module:** Complete (commit `315152f`)
- **Quarterly Report Governance:** Full lifecycle (submit, approve, reject, unlock, revert)
- **Override System:** Per-quarter overrides (Phase GZ) + override-effective merge in metrics (Phase HD)
- **UI Theme Fix:** Vuetify primary color `##` → `#` bug fixed (Phase GQ)
- **Data Population:** FY 2022–2025 financial data seeded from Continuing Appropriations + BAR1 Analytics
- **COI Module Phase 1 (JA–JR):** Backend + frontend CRUD, public controller, gallery, analytics tab, profile tab redesign (6-tab structure), attachment system, activity logging infrastructure, assignment CRUD, MikroORM migration adoption (2026-04-13 – 2026-05-07)

---

## Coding Conventions

- Backend DTOs use class-validator decorators; computed fields are NEVER in DTOs
- Frontend uses Vue 3 `<script setup>` with Composition API
- Financial computed fields: `utilization_rate`, `disbursement_rate` — computed server-side in `computeFinancialMetrics()`
- Financial table shows Disbursement (not Balance) — Balance removed from table display in Phase HE
- DELETE requests use `api.del()` (not `api.delete()`)
- Backend uses a **hybrid data access model**: ORM (`em.find`, `em.persist`) for CRUD; raw SQL (`em.getConnection().execute`) for complex analytics; legacy `DatabaseService` retained for health + auth strategies only — never introduce new `DatabaseService` usage.
- Quarterly data uses `reported_quarter` column for quarter-specific isolation
- Watchers that switch context must synchronously clear stale state BEFORE async calls

---

## Constraints

- **YAGNI:** No speculative features
- **KISS:** Simplest implementation path
- **SOLID:** Single Responsibility, Open/Closed
- **DRY:** Extract shared utilities when pattern repeats ≥ 3 times
- **Two Living Documents:** `plan.md` + `research.md` only. No proliferating standalone files.
- **Archive, Never Delete:** Historical content moves to `docs/archive/`, never removed

---

## Environment

- Windows 11, bash shell in Codex
- PowerShell 6+ (pwsh) is NOT available
- Builds/tests verified by operator manually, not automated
- Git remote: `https://github.com/eowork/pmoprototype.git`
- Active branches: `main`, `pmo-test1`, `pmo-coi`

---

## Stakeholder Timeline

| Date | Milestone |
|------|-----------|
| 2026-03-20 | Phase FB complete, artifacts optimized |
| 2026-03-21–25 | Testing, stabilization, edge cases |
| 2026-03-26–31 | Data population, stakeholder prep |
| **2026-04-06** | **Stakeholder feedback session (MIS/PMO Directors)** |
| 2026-04-08–13 | Post-feedback phases (GQ–HE): UI fixes, data population, override system, narrative fields |
| 2026-04-13 – 2026-05-07 | COI Module Phase 1 (JA–JR): full CRUD, public surface, gallery, analytics, profile redesign |
| **2026-05-13** | **Artifact remediation (Phase KL) — 18 phases pending Phase 3 authorization** |
