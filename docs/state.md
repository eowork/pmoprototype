# PMO Dashboard — Project State
> **Last Updated:** 2026-06-09 | **Branch:** `pmo-coi` | **Governance:** ACE v2.4

---

## Current Phase

**Phase PPP** — ✅ Phase 3 complete (2026-06-09). vue-tsc: 0 new errors (16 pre-existing, all unrelated). Committed + pushed to `pmo-coi`.
- **Priority 1 (UO):** ✅ PPP-A1 "Pillar"→"Program" terminology; PPP-A2 quarterly trend fix (now plots `accomplishment_rate_pct`, 0–120% axis + 100% reference line); PPP-A3 section labels + skeleton loaders
- **Priority 2 (COI):** ✅ PPP-B1 view switcher overflow fix; PPP-B2 remove duplicate New Project; PPP-B3 table card styling; PPP-B4 filter spacing; PPP-B5 missing section labels
- **Research:** R-126–R-135 (research.md) | **Plan:** Phase PPP (plan.md)

---

## Previous Phase

**Phase OOO** — ✅ Phase 3 complete (UI/UX Refinement Sprint). vue-tsc 0 new errors; **the 2 pre-existing COI ApexOptions TS2322 are now FIXED** (OOO-C). No migrations. No backend changes. Frontend only.

**OOO delivered (UI/UX Refinement Sprint — `coi/index.vue`, `coi/detail-[id].vue`, UO pages, shared utils):**
- OOO-A: **Shared status-color utility** — new `utils/status-colors.ts` (`getStatusColor`, `getPublicationStatusColor`, `STATUS_HEX`); replaced 7 duplicate inline definitions across coi/index, coi/detail, repairs/detail, UO physical, UO financial
- OOO-B: Strategic Alignment labels fixed — `text-weight-bold` (non-existent Vuetify class) → `font-weight-bold` (4 alignment labels + 2 timeline headers in detail-[id].vue now render bold)
- OOO-C: **ApexCharts axis fix** — `campusProgressChart` + `contractorChart` horizontal bars moved `categories` from `yaxis` → `xaxis`; resolves both standing TS2322 errors and renders axis labels correctly
- OOO-D: **Active filter chips** — `activeFilterChips` computed + `removeFilterChip()`; removable chip row replaces the old `(filtered)` text; per-chip close + Clear all
- OOO-E: View switcher relocated from filter bar → Project List section header (right-aligned, associated with table not filtering)
- OOO-F: **Responsive KPI grid** — `v-row`/`v-col` (xs 2 / sm 3 / lg 5 per row); Total → `blue-lighten-1`, Published → `green-lighten-1` (lighter, cleaner)
- OOO-G: **Table usability** — `fixed-header` + `height="560"`, sticky Project Name column (`fixed: true`), page-size selector (10/25/50/All), sort + page-size persisted to localStorage
- OOO-H: Analytics + KPI skeleton loaders replace spinners (reduced layout shift)
- OOO-I: **Accessible tooltips** — `open-on-focus` + `tabindex="0"` + `role="img"` + `aria-label` on COI KPI cards and AdminKpiRow tiles (keyboard reachable)
- OOO-J: **Chart empty states** — new `components/coi/CiChartEmpty.vue` (icon + title + description); applied to all 8 analytics charts
- OOO-K: **Relative dates** — new `utils/date-utils.ts` (`formatDate`, `formatRelativeDate`); COI table Created/Updated columns show "3d ago" with absolute date in tooltip
- OOO-L: UO visual consistency — top-level analytics + pillar/campus section cards → `elevation="1" rounded="lg"` (UO index ×3, financial ×2)

---

## Previous Phase

**Phase NNN** — ✅ Phase 3 complete. vue-tsc + tsc 0 new errors. No migrations. **Backend restart required** (new auth endpoints + MMM-A analytics fix).

**NNN delivered (Visual Intelligence Platform):**
- NNN-A: **VERIFY_STEP** — sidebar logo restored to 44×44 (MMM-D overshoot corrected per Section C1); horizontal gap kept at `me-1` (~50% reduction); `py-2` height preserved
- NNN-B: `<v-main class="bg-grey-lighten-5">` — subtle grey dashboard background so white cards float
- NNN-C: dashboard.vue section labels (Infrastructure Portfolio / University Operations / Operational Insights) + Infrastructure & UO & Quick Actions cards → `elevation="1" rounded="lg"`; **fixed MMM-B regression** (`v-expansion-panels` needs `multiple` for the `number[]` model — trend charts now actually mount on expand)
- NNN-D: AdminKpiRow — `v-tooltip` (formula + source) on all 4 tiles + cursor:help + hover-lift
- NNN-E: sidebar Administration split → **Operations & Monitoring** (`v-list-subheader`, Admin+SA: Pending Reviews, Activity Logs) + **System Administration** (SA: User Management); removed collapsible `v-list-group` + orphaned `administrationOpen`
- NNN-F: avatar surfaced — `BackendUser`/`UIUser`/`adaptUser` gain `avatarUrl`+profile fields; `authStore.userAvatarUrl` + `patchUser()`; app-bar avatar renders image when present
- NNN-G: **backend** `POST /api/auth/change-password` — JWT-gated, bcrypt verify, SSO-guard, throttled 3/10min, sets `lastPasswordChangeAt`
- NNN-H: **backend** `PATCH /api/auth/me` — updates displayName+phone; `getProfile()` enriched (phone, display_name, last_login_at, last_password_change_at, is_sso)
- NNN-I: **new** `pages/profile.vue` — Account Overview (read-only identity + editable displayName/phone) + Security (change password w/ strength meter, SSO-aware)
- NNN-J: COI executive + filter cards → `elevation="1" rounded="lg"`; Portfolio Summary + Project List section labels upgraded to icon+divider style

---

## Archived Previous Phase

**Phase MMM** — ✅ Phase 3 complete. vue-tsc + tsc 0 new errors. No migrations. Backend + frontend.

**MMM delivered (Dashboard Platform Modernization):**
- MMM-A: **Analytics 500 root-cause fix** — `getAnalyticsSummary()` `funding_source_name` (non-existent column) → `LEFT JOIN funding_sources fs`; `contractor_name` → `contractor`. `Promise.all` no longer rejects → AdminKpiRow + dashboard mini-summary + COI KPIs now return real data
- MMM-B: UO trend charts mount-on-expand (`trendsExpanded` ref + `v-if`) so ApexCharts sizes correctly out of collapsed panel
- MMM-C: Sidebar nav reordered — Dashboard → University Operations → Infrastructure → Repair → GAD
- MMM-D: Sidebar header compacted ~50% (`py-2`→`py-1`, logo 44→40, `me-2`→`me-1`, removed stray `text-align-right`)
- MMM-E: User menu — My Profile / Account Settings / Change Password items (non-contractor) + error-colored Logout
- MMM-F: `/coi/activity-logs` frontend route guard added to `permission.ts` (Admin/SuperAdmin only — backend already gated)
- MMM-G: COI "Review Projects" button removed; action strip restructured (primary left, nav right via `v-spacer`)
- MMM-H: COI filter instructional banner (dismissible, `coi_filter_banner_dismissed` localStorage)
- MMM-I: 3 new optional columns (Revised Start, Duration, Updated) — **list endpoint + adapter extended** to return `project_duration`, `updated_at`, joined `funding_sources`/`contractors`; KPI cards → data-driven `kpiCards` loop with `v-tooltip` + hover-lift styling

**Previous:** Phase KKK + LLL — ✅ Phase 3 complete (committed; not yet pushed). Vue-tsc 0 new errors.

**KKK delivered (CSU CORE Dashboard executive refactor — `pages/dashboard.vue` + `components/AdminKpiRow.vue`):**
- KKK-A: AdminKpiRow "Delayed Projects" → "Published Projects" (success, mdi-check-decagram, from `by_publication_status[PUBLISHED]`); tile values text-h5 → text-subtitle-1; avatar 44 → 36
- KKK-B: Infrastructure mini-summary stat 3 "Delayed" → "Completed" (success, from `by_status[COMPLETE/COMPLETED]`); all 4 stats text-h5 → text-h6
- KKK-C: UO Summary — 8 pillar cards → 4 compact dual-stat cards (`compactPillarData` zips physical+financial by pillar); trend charts moved to collapsible `v-expansion-panels` (default collapsed)
- KKK-D: Quick Actions — large block buttons → compact `v-list` nav (icon + title + subtitle + chevron)
- KKK-E: Other Modules stat cards removed entirely (GAD/Repair/UO); removed `stats`/`loading`/`statCards` + full-list API calls; Repair + UO now nav items in Quick Actions
- KKK-F: Welcome heading text-h4 → text-h5
- KKK-G: Context banner text updated to executive framing

**LLL delivered (COI Dashboard executive refactor — `pages/coi/index.vue`):**
- LLL-A: KPI 8 → 5 compact cards (Total, Published, Ongoing, Completed, Pending Review); removed Delayed + On Hold negative cards; text-h4 → text-h6; icon 32 → 20; added `publishedCount` computed
- LLL-B: Table default columns added Project Code, Fund Source, Orig. End
- LLL-C: Column Manager — `ALL_COLUMNS` + `hiddenColumns` Set + `v-menu` checkboxes; localStorage `coi_hidden_columns`; default-hidden supplementary optionals; horizontal scroll wrapper; item slots for new columns
- LLL-D: Recent Activity → admin-only `v-expansion-panels` (default collapsed); lazy-fetch on first expand (removed from `onMounted`)
- LLL-E: Filter bar 3-tier — primary (search/status/campus) + simplified advanced (project code + start range) + Full Search dialog (all 9 original date-range fields)
- LLL-F: Section banners — "Portfolio Summary" above KPIs, "Project List" + dynamic count above table
- LLL-G: Removed "Needs Attention" + "Slow-Moving Projects" negative panels (and `attentionItems`/`slowMovingProjects`/`statusPips` computeds)
- LLL-H: Removed hero analytics strip (duplicated KPI/analytics data)

---

## Archived Previous Phase

**Phase III + JJJ** — ✅ Phase 3 complete. Committed `0643c6c`. vue-tsc + tsc 0 new errors. No migrations.

**III delivered:** `getAnalyticsSummary()` extended with `by_funding_source` + `by_contractor` GROUP BY queries; campus panel dual-bar (count + avg_progress); Avg Progress by Campus horizontal bar chart (purple); Budget by Campus donut + Contract by Status donut; Contractor horizontal bar (top-10, sky-blue); fundingSourceChart upgraded to prefer backend data; top-of-tab guidance banner + 4 section labels.

**JJJ delivered:** Q1–Q4 UO Accomplishment Trend area chart (green); Q1–Q4 Financial Utilization Trend area chart (purple); fiscal year watcher reloads all 3 UO datasets; Quick Actions subtitle; Other Modules section heading.

---

## Archived Previous Phase

**Phase GGG + HHH** — ✅ Phase 3 complete. Committed `324f217`. Pushed to `pmo-coi`.

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

1. **Backend restart (required)** — activates NNN-G/H auth endpoints (`/auth/change-password`, `PATCH /auth/me`) + MMM-A analytics SQL fix: `Ctrl+C` → `npm run start:dev`
2. **Operator smoke test (NNN)** — see plan.md NNN verification checklist (grey background + floating cards, section labels, sidebar two-group admin, avatar render, change-password, profile page)
3. **Commit + push** Phases KKK + LLL + MMM + NNN to `pmo-coi`
4. **Run pending DB migrations** — 7 migrations: `npx mikro-orm migration:up`

---

## Current Blockers

| Blocker | Resolution |
|---|---|
| 7 pending migrations | `npx mikro-orm migration:up` — sdg_goals, custom_supporting_sections, **GGG: project_notes_banking, war fields, mpr fields**, **ZZZ: concerns_list** |
| `/templates/*.docx` 404 | Backend hard restart (`Ctrl+C` → `npm run start:dev`) |
| Backend restart required | New analytics fields (`by_funding_source`, `by_contractor`) require restart to take effect |
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
