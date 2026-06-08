# PMO Dashboard — Project State
> **Last Updated:** 2026-06-08 | **Branch:** `pmo-coi` | **Governance:** ACE v2.4

---

## Current Phase

**Phase GGG + HHH** — ✅ Phase 3 complete (not yet committed). vue-tsc + tsc 0 new errors. No migrations. No backend changes.

**GGG delivered:** COI Infrastructure Portfolio Dashboard — 8-card KPI row (added On Hold + Cost Utilized); Quick Actions strip; Executive Monitoring panel (Upcoming Completions + Slow-Moving Projects); Physical Progress Distribution bar chart + Funding Source donut chart in Analytics tab; label corrections (Budget Utilization→Cost Utilization, Obligation→Cost Incurred, removed duplicate Disbursement card); interactive chart drill-down (click campus bar/status chip → auto-filter Projects tab).

**HHH delivered:** CSU CORE Executive Dashboard — AdminKpiRow refactored to single analytics/summary call (Infrastructure total, Delayed, Pending Reviews, UO Compliance); Infrastructure Portfolio mini-summary card on dashboard (4 metrics + cost utilization bar, click-to-navigate); dismissible context banner; restructured page sections (Banner → AdminKpiRow → Infrastructure → UO → Quick Actions → Modules); UO Summary always visible for non-contractors; Infrastructure removed from redundant module cards row.

---

## Archived Previous Phase

**Phase DDD** — ✅ Phase 3 complete (not yet committed). vue-tsc 0 new errors. No migrations.

**DDD delivered:** Analytics hierarchy (Cost Utilization compact KPI; Cost Incurred Progression full-width with banner; Physical Progress Trend upgraded banner; data source attribution on all visualizations); Others tab detail-[id].vue restructured to match edit/new 4-section IA (A=Governance, B=Admin, C=Knowledge Bank, D=Lessons) with guidance banners on all 3 pages; MOV section layout refinement (v-alert banner, upload+link side-by-side, confirmation alert, repository destination chip).

---

## Archived Previous Phase

**Phase CCC** — ✅ Phase 3 complete (not yet committed). vue-tsc 0 new errors. No migrations.

**Previous:** DDD ✅ committed (`36b53bc`); EEE/FFF/GGG/ZZZ/AAA/BBB ✅.

**CCC delivered:** costIncurredThisPeriod camelCase fix (definitive root cause resolved); Others tab 4-section UX restructure (edit + new); Timelog MOV auto-file to SD_ECO_009/010 repositories.

---

## Archived Current Phase

**Phase BBB** — ✅ Phase 3 complete (not yet committed). vue-tsc + tsc 0 new errors. 1 new backend migration.

**Previous:** DDD ✅ committed (`36b53bc`); EEE ✅; FFF ✅; GGG ✅; ZZZ ✅; AAA ✅.

**AAA delivered (AAA-A→L):** cost_incurred_this_period root-cause fix (sourced from progress_reports[0]); Audit Log tab wired (admin-gated); Overview Expand/Collapse All; FAB overlap fix; new.vue Others fully synced with edit (Data Banking + Lessons Learned + Site Observations + FAB); WAR physical accomplishment input; strategic alignment maxlength removed; analytics FY totals + Governance separator; guidance banners (Basic/Schedule/Documents); **Physical Progress Trend chart**; **Milestone Health donut**; **Others tab IA restructure** (Section B/C/D).

**ZZZ (prior):** analytics data fixes + 6-stat + Financial Summary; Team Institutional/External split (ADR-020); Notes Banking grid + Lessons Learned + Site Observations; WAR/MPR sections + banner; Project Concerns (1 migration); CiBasicInfoForm HCI; Progress tab UX.

**⚠️ Still requires 1 new migration** (`Migration20260604000000_AddConcernsListToTimelineEntries`) **plus the 5 still-pending earlier migrations** to run before use (see Blockers).

**Deferred:** Candidate 3 (per-repo RBAC); Candidate 5 (rate limiting); Candidate 6 (server-side MIME validation).

---

## Active Modules

| Module | Completion | Status |
|---|---|---|
| COI — Construction of Infrastructure | ~88% | Active development |
| University Operations | ~92% | Stable |
| Authentication / User Management | 95% | Stable |
| Shared Services | 88% | Stable |

---

## Current Priorities

1. **Commit GGG + HHH** — commit dashboard changes to `pmo-coi` and push
2. **Run pending DB migrations** — 7 migrations (sdg_goals, custom_supporting_sections, war fields, mpr fields, notes_banking, concerns_list, billing fields)
3. **Backend restart** — activates `/templates/SD_ECO_*.docx` static serving
4. **Implement Phase FFF** — DTO persistence fix + compliance donut (already planned, pending Phase 3 auth)

---

## Current Blockers

| Blocker | Resolution |
|---|---|
| Uncommitted GGG + HHH dashboard work | `git add ... && git commit && git push origin pmo-coi` |
| 7 pending migrations | `npx mikro-orm migration:up` — sdg_goals, custom_supporting_sections, **GGG: project_notes_banking, war fields, mpr fields**, **ZZZ: concerns_list** |
| `/templates/*.docx` 404 | Backend hard restart (`Ctrl+C` → `npm run start:dev`) |
| Backend restart required for GGG | New DTO fields (war/mpr/notes_banking) need recompiled DTO or `forbidNonWhitelisted` rejects them |
| Pre-existing ApexOptions TS2322 | Deferred — not introduced by recent work |

---

## Recently Approved Decisions (Last 30 Days)

| ID | Decision |
|---|---|
| D-VVV-1 | GET /documents HTTP 500 fixed: `= ANY(?)` → `IN(?,…)` (Knex positional binding fix) |
| D-SSS-2 | Supporting Docs → CiRepositoryCard grid (CiFolderRepository removed from supporting section) |
| D-SSS-4 | Custom supporting folders mirror customKeySections via `customSupportingSections` |
| D-TTT-1 | Upload persistence root cause: shared modal stale `uploadType` — reset on every open |
| D-ZZZ-1 | Checklist `v-window-item` uses `eager` — checklistRef always non-null |
| D-BBB-1 | Strategic Alignment panel: agency fields → new "Project Administration" panel |
| D-BBB-3 | Gallery carousel: `profileImages.first` → falls back to all gallery |
| D-CCC-1 | `.overview-grid { align-items: flex-start }` — prevents sibling panel stretch |
| D-DDD-6 | Milestone CRUD removed from edit-[id].vue — backend endpoints and read-only display preserved |
| D-DDD-5 | Analytics tab: 4 KPI sections prepended (STATUS/COST/DATES/SNAPSHOT) |

---

## Deployment Readiness

| Area | Status |
|---|---|
| University Operations pilot | ✅ Ready |
| COI admin interface | ⚠️ Needs smoke test |
| COI public portal | ✅ Ready |
| Authentication | ✅ Ready |
| File upload persistence | ✅ Fixed (VVV) |
| Document repository | ✅ Repository-card architecture complete |
| Supporting Documents | ✅ Card-grid architecture (SSS) |
| Gallery | ✅ PROFILE-first carousel, fixed height, prev/next modal |
| Compliance Checklist | ✅ Eager mount, auto-sync, REVISED status |
| Audit logs | ✅ em.fork() isolation fix (no more tx race) |

---

## Security Status

| Control | Status |
|---|---|
| JWT + RBAC guards (server-side) | ✅ |
| Role-based route protection (frontend) | ✅ |
| Activity logging (UPLOAD/DOWNLOAD/REMOVE/FOLDER) | ✅ |
| `em.fork()` in ActivityLogService | ✅ Fixed |
| File upload MIME validation (server-side) | ⚠️ Pending |
| Rate limiting | ⚠️ Not implemented |
| Section-level permission enforcement | ⚠️ Design only |

---

## Git Commit Message Standard (EEE-D)

Use Conventional Commits format with `(coi)` scope. Describe WHAT changed, not the phase code.

| Format | When |
|---|---|
| `feat(coi): <description>` | New features |
| `fix(coi): <description>` | Bug fixes |
| `refactor(coi): <description>` | Restructure without behaviour change |
| `style(coi): <description>` | UI/CSS only |

**Avoid:** `feat: COI Phase AAA` — meaningless in git history.
**Use:** `feat(coi): add physical progress trend chart and compact cost KPI`

---

## Architecture Constraints (Non-negotiable)

1. `detail-[id].vue` — READ-ONLY. No CRUD regardless of role.
2. `/api/construction-projects` route — IMMUTABLE.
3. `~/utils/adapters.ts` — ONLY place for frontend type interfaces.
4. `api.del()` not `api.delete()` for DELETE calls.
5. `em.fork()` required in `ActivityLogService.logAction`.
6. `CiAttachmentHub` is the ONLY attachment renderer.
7. `CiRepositoryModal.vue` shared instance — `uploadType` resets on every open (TTT-A).
8. Seeded `construction_document_types` taxonomy — READONLY, never mutate.
9. Gallery carousel: PROFILE-category images first.
10. Milestone CRUD removed from edit page — backend + read-only display preserved.

---

## File Map (Frequently Modified)

| Purpose | File |
|---|---|
| Project detail page | `pmo-frontend/pages/coi/detail-[id].vue` |
| New project page | `pmo-frontend/pages/coi/new.vue` |
| Edit project page | `pmo-frontend/pages/coi/edit-[id].vue` |
| Attachment hub | `pmo-frontend/components/coi/CiAttachmentHub.vue` |
| Repository modal | `pmo-frontend/components/coi/CiRepositoryModal.vue` |
| Repository card | `pmo-frontend/components/coi/CiRepositoryCard.vue` |
| Analytics tab | `pmo-frontend/components/coi/CiProjectAnalyticsTab.vue` |
| Type adapters | `pmo-frontend/utils/adapters.ts` |
| Hierarchy data | `pmo-frontend/utils/coiHierarchies.ts` |
| COI service | `pmo-backend/src/construction-projects/construction-projects.service.ts` |
| Activity log service | `pmo-backend/src/activity-logs/activity-log.service.ts` |
