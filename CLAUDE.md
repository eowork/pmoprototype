# PMO Dashboard — Project Context

> **Governance:** ACE Framework v2.4 (Operator LTS)
> **Last Updated:** 2026-04-13
> **Status:** Phase HE COMPLETE — UI/UX + Data Structure Enhancement (Physical & Financial)

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
├── database/migrations/  PostgreSQL migration files (001–036)
├── docs/
│   ├── plan.md           Execution contract (ACE Phase 2 artifact)
│   ├── research.md       Research findings (ACE Phase 1 artifact)
│   ├── guides/          AI engineering guides (ACE specs, governance, integration)
│   ├── references/      Domain references (DBM, BAR, policy, spreadsheets)
│   └── archive/         Archived completed phases (read-only)
└── CLAUDE.md             This file (project context — NOT an execution artifact)
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

97+ governance directives established across Phases H through HE.
Full table: `docs/plan.md` lines 9–111 (directives 1–97), plus Phase-specific directives (385–391 in Phase HE).

**Critical active rules:**
- Backend enforcement is authoritative; frontend is presentation only
- `validateOperationEditable()` must receive `quarter` parameter for publication lock
- `autoRevertQuarterlyReport()` must be called after every CUD operation
- Financial and Physical modules share `quarterly_reports` entity
- BAR1 indicator taxonomy (migration 019) is READONLY — never modify
- Override fields (`override_total_target`, `override_total_actual`) use `??` merge pattern in `computeIndicatorMetrics()` — effective values returned as `total_target`/`total_accomplishment`
- Narrative fields (`catch_up_plan`, `facilitating_factors`, `ways_forward`) rendered via expandable row only — never as direct table columns

---

## Deferred Items

| # | Item | Priority |
|---|------|----------|
| 66 | UO operation assignment CRUD endpoints | Backend required |
| 75 | Quarter-level submission (per-QN status) | Backend required |
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

---

## Coding Conventions

- Backend DTOs use class-validator decorators; computed fields are NEVER in DTOs
- Frontend uses Vue 3 `<script setup>` with Composition API
- Financial computed fields: `utilization_rate`, `disbursement_rate` — computed server-side in `computeFinancialMetrics()`
- Financial table shows Disbursement (not Balance) — Balance removed from table display in Phase HE
- DELETE requests use `api.del()` (not `api.delete()`)
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

- Windows 11, bash shell in Claude Code
- PowerShell 6+ (pwsh) is NOT available
- Builds/tests verified by operator manually, not automated
- Git remote: `https://github.com/eowork/pmoprototype.git`
- Active branches: `main`, `pmo-test1`, `refactor/page-structure-feb9`

---

## Stakeholder Timeline

| Date | Milestone |
|------|-----------|
| 2026-03-20 | Phase FB complete, artifacts optimized |
| 2026-03-21–25 | Testing, stabilization, edge cases |
| 2026-03-26–31 | Data population, stakeholder prep |
| **2026-04-06** | **Stakeholder feedback session (MIS/PMO Directors)** |
| 2026-04-08–13 | Post-feedback phases (GQ–HE): UI fixes, data population, override system, narrative fields |
