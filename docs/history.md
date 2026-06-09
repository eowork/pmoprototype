# PMO Dashboard — Completed Work History
> Permanent archive. Completed items only. Nothing active belongs here.

---

## Phase History — COI Module

### 2026-05 through 2026-06

| Date | Phase | Module | Task | Outcome |
|---|---|---|---|---|
| 2026-05-07 | JA–JR | COI | COI Phase 1: backend CRUD, public controller, gallery, analytics, profile redesign, attachment system, activity logging, assignment CRUD, MikroORM migration | ✅ Complete |
| 2026-05-13 | KA–KS | COI | COI Full System Alignment: milestone enhancement, POW module, progress display, DRY refactor | ✅ Complete |
| 2026-05-28 | FFF/GGG/HHH/III | COI | Enterprise Refactor: folder system, view modes, analytics, checklist, repository refactor | ✅ Complete |
| 2026-05-28 | MR-A | Docs | June 2026 Executive Management Report generated | ✅ Delivered |
| 2026-05-28 | LLL | COI | Template URLs seeded, index refactor, repository audit | ✅ Complete |
| 2026-05-28 | MMM | COI | Template path fix, gallery height, Key Docs persistence (immutable emitStaged), checklist UI grid+kebab, ECO_FORMS dedup | ✅ Complete |
| 2026-05-28 | NNN | COI | Checklist kebab Open/View actions, new.vue persistence guard (projectId fallback), backend restart (templates) | ✅ Complete |
| 2026-05-28 | OOO | COI | Submission versioning (auto-increment on folder upload), submission search, checklist auto-sync (onFolderUploaded) | ✅ Complete |
| 2026-05-28 | PPP | COI | Folder display bug (fetchFolders res.data unwrap), Project Profile dates (original/revised), milestone search/filter/sort, overview last-progress link | ✅ Complete |
| 2026-06-01 | QQQ | COI | SDG Goals field full-stack: migration, entity, DTO, service, coiHierarchies, CiBasicInfoForm, new.vue, edit-[id].vue, detail-[id].vue, overview latest WAR/MPR summary | ✅ Complete |
| 2026-06-01 | RRR | COI | Folder seeding race condition (folderSeedKey), Strategic Alignment 3-row container layout | ✅ Complete |
| 2026-06-01 | SSS | COI | Supporting Docs → CiRepositoryCard grid; CPES → CiRepositoryCard; Misc → single card; customSupportingSections backend (migration/entity/service/controller); seeding chain retired; checklist auto-sync | ✅ Complete |
| 2026-06-01 | TTT | COI | Upload persistence root cause fixed (uploadType stale in shared modal → reset on every open); Overview executive summary (Progress/Milestone/Recent); Progress tab analytics header + priority reorder | ✅ Complete |
| 2026-06-01 | UUU | COI | `/templates` Nuxt proxy, template 404 fix (43 templates discovered), CiFolderRepository response unwrap | ✅ Complete |
| 2026-06-01 | VVV | COI | GET /documents HTTP 500 fixed: `= ANY(?)` → `IN(?,…)` (Knex array binding); fetch error state + Retry | ✅ Complete |
| 2026-06-02 | WWW | COI | CiRepositoryCard progress bar removed; CPES/Misc → card; autosave (localStorage + beforeunload); modal guidance (dismissible); checklist master summary | ✅ Complete |
| 2026-06-02 | XXX | COI | Link submission in modal (new 'link' emit + onRepoLink); Misc folder workspace removed; autosave timestamp; gallery category filter; Project Profile section overline headers | ✅ Complete |
| 2026-06-02 | YYY | COI | Link DTO GDrive restriction removed (stale compiled DTO → backend restart); mimeType removed from payload; REVISED checklist status; em.fork() EM isolation fix | ✅ Complete |
| 2026-06-02 | ZZZ | COI | Checklist v-window-item `eager` mount; External Links section in modal (file/link split, copy URL); backend restart documentation | ✅ Complete |
| 2026-06-02 | AAA | COI | Team tab (read-only personnel cards + search); Others tab (6 expansion panels); Analytics health summary row | ✅ Complete |
| 2026-06-02 | BBB | COI | Strategic Alignment refactored (agency → Project Administration panel; full labels RDP/SEA/LIKHA/SDG); Financial Summary KPI cards; gallery carousel PROFILE-first | ✅ Complete |
| 2026-06-02 | CCC | COI | Expansion grid `align-items: flex-start`; Show More/Less for alignment chips+narrative; carousel fixed 280px; preview uploader+category; Cost This Period KPI | ✅ Complete |
| 2026-06-02 | DDD | COI | Location → Profile panel; Gallery prev/next modal nav; Milestone Summary chips removed; Analytics 4 KPI sections (STATUS/COST/DATES/SNAPSHOT); Milestone CRUD removed from edit page | ✅ Complete |
| 2026-06-03 | EEE | COI | Overview grid merged (8→5 single-row two-column panels, eliminates height-sync); SDG/RDP/SEA/LIKHA always-visible with empty placeholders; draft restore keeps unsaved flag + attachment note (new+edit); indicators as compact tag lists; timelogs WAR/MPR contextual banner + description field | ✅ Complete |
| 2026-06-03 | FFF | COI | **SDG adapter bug fix** (sdgGoals never mapped in adaptProjectDetail → SDG data now renders; removed 5 `as any` casts); panel section typography (subtitle-2 semibold headers + icons, body-2 labels, 2px column divider, pl-md-4); gallery timeline view (group by month, newest first); progress tab header standardization (detail matches edit, font-weight-semibold) | ✅ Complete |
| 2026-06-04 | EEE | COI | **Compliance scorecard + risk register fix + readiness docs layout + git governance**: EEE-A (compliance donut replaced by group-level scorecard showing each document category with progress bar + color-coded chip; overall % chip; uses existing checklist data grouped by `documentType.groupCode` — no backend change); EEE-B (backend KY-B1 filter fixed — `risk_register`, `escalation_records`, `status_updates`, `readiness_documents`, `signatories` now exempt from empty-array exclusion so users can clear all entries and have them persist); EEE-C (Readiness Documents layout balanced: Type/Status/Delete in one row with `sm="5/4/3"` split, Remarks on separate row — same fix in edit and new); EEE-D (git commit message standard documented in state.md). vue-tsc + tsc 0 new errors | ✅ Complete |
| 2026-06-04 | DDD | COI | **Analytics hierarchy + Others tab alignment + MOV UX**: DDD-A (Cost Utilization → compact KPI card md=4; Cost Incurred Progression → full-width md=8 with `v-alert` banner + data source; Physical Progress Trend header upgraded from plain `div` to `v-alert` banner with data source attribution; Financial Summary `v-alert` enriched with data source note); DDD-B (detail-[id].vue Others tab restructured to Section A=Governance / B=Admin / C=Knowledge Bank / D=Lessons Learned matching edit/new; guidance description paragraph added under all section headers in detail, edit, new pages); DDD-C (MOV section: `v-alert` banner with purpose description; upload+link side-by-side Row 1; success confirmation Row 2; repository destination chip Row 3). vue-tsc 0 new errors | ✅ Complete |
| 2026-06-04 | CCC | COI | **Cost data fix + Others tab UX + Timelog MOV integration**: CCC-A (definitive `costIncurredThisPeriod` fix — `findOne` returns MikroORM entities with camelCase `costIncurredThisPeriod`/`reportDate`, adapter was reading snake_case; now reads both); CCC-B (Others tab 4-section UX in edit and new: Section A Project Governance = Risk+Escalation equal 6/6 cols, Section B Administrative = Status/Readiness/Signatories 3-col grid, Section C Knowledge Bank = Data Banking full-width, Section D = Lessons Learned full-width); CCC-C (Timelog MOV integration: WAR/MPR form Section 8/9 has file upload + link field; on save MOV is auto-filed to SD_ECO_009/SD_ECO_010 repository; transient fields stripped from timelog payload). No migrations. vue-tsc 0 new errors | ✅ Complete |
| 2026-06-04 | BBB | COI | **Analytics accuracy + Others tab refinement + form parity + WAR/MAR financial**: BBB-A (removed permanently-empty FY bar/milestone charts; added Cost Incurred Progression area chart from progress_reports; milestone CRUD was removed per ADR-011 so charts were misleading); BBB-B (Others tab: Incident Log + Site Observation Log removed from all 3 pages; Section C is now Risk & Escalation only; Lessons Learned full-width always-visible card); BBB-C (WAR/MAR financial billing fields — 1 new migration `billing_amount_this_period` + `financial_accomplishment_percent`, entity, DTO, service, form inputs); BBB-D (new.vue Progress tab — compact Initial Snapshot card + post-save placeholder preview cards replacing the split Physical/Financial Status approach); BBB-E (CiProgressReportTab card view: 4 sectioned view with explicit "Report Date" label, Cost This Period + Cost To Date side-by-side in Section 2, all fields preserved). vue-tsc + tsc 0 new errors | ✅ Complete |
| 2026-06-04 | AAA | COI | **Page consistency + data accuracy + access control**: AAA-A (cost_incurred_this_period sourced from progress_reports[0] not project row — root-cause fix of persistent 0 bug, + source date metadata); AAA-B (Audit Log tab wired, admin-gated, legacy inline audit removed); AAA-C (Overview Expand/Collapse All toggle); AAA-D (FAB bottom 24→80px, no action-button overlap); AAA-E (new.vue Others synced: Data Banking + Lessons Learned + Site Observations + project_notes_banking payload + ScrollToTopFab); AAA-F (WAR physical accomplishment input); AAA-G (strategic alignment maxlength removed); AAA-H (FY totals KPI row + Governance & Compliance separator); AAA-I (guidance banners on Basic/Schedule/Documents tabs, both pages); AAA-J (**Physical Progress Trend** area+line chart from progress reports); AAA-K (**Milestone Health donut** + surfaced milestone progress bar); AAA-L (**Others tab IA**: Section B Institutional Knowledge side-by-side always-visible, Section C Risk & Incident Management, Section D Administrative Records). vue-tsc 0 new errors; no backend changes | ✅ Complete |
| 2026-06-04 | ZZZ | COI | **Analytics fixes** (ZZZ-A: contractAmount→totalContractAmount, financial gauge uses obligation ratio, costIncurredThisPeriod adapter mapping; ZZZ-B: 6-stat performance card + Financial Summary section); **Team tab** (ZZZ-C: removed JSONB personnel_groups cards, Institutional/External split from record_assignments + pagination + read-only notice); **Others tab** (ZZZ-D: always-visible Notes Banking 2-col grid + Add-Notes CTA, legacy panels conditional; ZZZ-D Ext: Lessons Learned + Site Observation Log in project_notes_banking JSONB, no migration); **WAR/MPR forms** (ZZZ-E/F: 8/9 titled sections + dismissible localStorage banner); **Project Concerns** (ZZZ-G: migration + entity concernsList + ConcernItemDto + service + structured list form + count badges); **CiBasicInfoForm HCI** (ZZZ-H: title promotion, subtitle-2 section headers, collapsible Strategic Framework Alignment panel + funding sub-form); **Progress tab UX** (ZZZ-I: milestone summary chips, section descriptions, empty-state alert, collapsible Timelogs). vue-tsc + tsc 0 new errors | ✅ Complete |
| 2026-06-03 | GGG | COI | "Variation Order" UI rename (display text only, DB keys unchanged); indicators readability (small wrapping chips); **Analytics executive rework** (snapshot row, dates+cost cols, physical/financial radial gauges, time-elapsed bar, cost utilization, purpose banners; removed Project Health + milestone metrics); Team tab two-column Internal/External; Others tab data-banking (migration + entity/DTO/adapter + read-only detail + edit forms); **WAR/MPR full schema** (2 migrations, entity, DTO, conditional modal forms with dynamic accomplishments/work-items + user-search signatories). vue-tsc + tsc 0 errors | ✅ Complete |
| 2026-06-08 | GGG (dashboard) | COI Dashboard | **Infrastructure Portfolio Dashboard modernization** — 8-card KPI row (added On Hold + Cost Utilized); Quick Actions strip (New Project, Review w/ badge, Analytics, Public View); Upcoming Completions + Slow-Moving Projects executive monitoring panels; Physical Progress Distribution bar chart + Funding Source donut in Analytics tab; label corrections (Budget Utilization→Cost Utilization, Obligation→Cost Incurred, removed duplicate Disbursement); click-to-filter drill-down on campus bars + status pips + ApexCharts dataPointSelection. commit `324f217` | ✅ Complete |
| 2026-06-08 | HHH | Core Dashboard + AdminKpiRow | **CSU CORE Executive Dashboard modernization** — AdminKpiRow rewritten (single `analytics/summary` call → 4 colored tiles: Infrastructure/Delayed/Pending Reviews/UO Compliance Rate); Infrastructure Portfolio mini-summary card (4 metrics + cost utilization bar + click-navigate); dismissible context banner (localStorage-persisted); section order restructured (Banner→AdminKpiRow→Infrastructure→UO→QuickActions→Modules); UO Summary always shown for non-contractors. commit `324f217` | ✅ Complete |
| 2026-06-08 | III | COI Dashboard | **COI Analytics Tier 2** — III-A: `getAnalyticsSummary()` extended with `by_funding_source[]` + `by_contractor[]` (2 GROUP BY SQL queries); III-B: Campus panel dual-bar (count + avg_progress, deep-purple); III-C: Avg Physical Progress by Campus horizontal bar chart (purple); III-D: Budget Concentration by Campus donut + Contract Value by Status donut (₱M/₱B tooltips); III-E: Projects by Contractor horizontal bar (top-10, sky-blue), fundingSourceChart upgraded to prefer backend `by_funding_source`; III-F: top-of-tab guidance banner + 4 section labels (Status/Campus, Physical, Campus Intelligence, Partnership). Zero new endpoints. `tsc + vue-tsc` 0 new errors. commit `0643c6c` | ✅ Complete |
| 2026-06-08 | JJJ | Core Dashboard | **CSU CORE Executive Dashboard Analytics** — JJJ-A: Q1–Q4 UO Accomplishment Trend area chart (`/analytics/quarterly-trend`, green); JJJ-B: Q1–Q4 Financial Utilization Trend area chart (`/analytics/financial-quarterly-trend`, purple); JJJ-C: fiscal year watcher triggers all 3 UO dataset reloads; JJJ-D: Quick Actions subtitle, Other Modules section heading. `vue-tsc` 0 new errors. commit `0643c6c` | ✅ Complete |

---

## Major Architectural Decisions (Approved)

| ID | Date | Decision | Reason |
|---|---|---|---|
| ADR-001 | 2026-05 | Timeline module removed | Consolidated into Timelogs/reporting |
| ADR-002 | 2026-05 | MikroORM migration system adopted | Replaces raw SQL migrations; ORM for CRUD, raw SQL for analytics |
| ADR-003 | 2026-05 | `detail-[id].vue` is READ-ONLY | Architecture separation — detail=monitoring, edit=data-entry |
| ADR-004 | 2026-05 | `api.del()` not `api.delete()` | Consistent with codebase pattern |
| ADR-005 | 2026-05 | Hybrid data access: ORM + raw SQL | ORM for CRUD; `em.getConnection().execute()` for analytics. No new DatabaseService. |
| ADR-006 | 2026-05 | `CiAttachmentHub` sole attachment renderer | Single source of truth for attachment sections |
| ADR-007 | 2026-05 | `adapters.ts` sole frontend type definition | Prevents scattered type duplication |
| ADR-008 | 2026-06-01 | `ActivityLogService` uses `em.fork()` | Fire-and-forget log writes must not share request EM (tx race condition) |
| ADR-009 | 2026-06-01 | Supporting Docs = CiRepositoryCard grid | Replaces CiFolderRepository accordion — consistent with Key Docs |
| ADR-010 | 2026-06-01 | Upload type reset per modal open | Shared modal instance stale uploadType caused mis-filing |
| ADR-011 | 2026-06-02 | Milestone CRUD removed from edit page | Consolidated into timelogs/reporting; backend + read-only preserved |
| ADR-012 | 2026-06-02 | `checklist v-window-item eager` | Ensures checklistRef never null; auto-sync always fires |
| ADR-013 | 2026-06-02 | SDG Goals stored as JSONB `sdg_goals` | Mirrors existing rdp_alignment / csu_likha_goals pattern |
| ADR-014 | 2026-06-02 | Gallery carousel: PROFILE-category images first | Project Cover Image concept; other categories accessible via Gallery tab only |
| ADR-015 | 2026-06-03 | Overview = one expansion panel per row with two internal columns | "Two independent panels per row" cannot guarantee equal height; single-container two-column layout eliminates sync issues permanently (R-013) |
| ADR-016 | 2026-06-03 | Timelog physical/financial % stays in Progress Reports module, NOT timelogs | Timeline-entries DTO has no financial columns; adding them duplicates the Progress Reports module. Timelogs = operational work logs (manpower/equipment/issues) |
| ADR-017 | 2026-06-03 | All alignment fields (RDP/SEA/LIKHA/SDG) must be mapped in adaptProjectDetail | SDG bug (R-017): a field present in DB + API but missing from the adapter renders as `undefined` forever. The `(x as any)` cast in templates hides this. Rule: every backend alignment field gets an explicit adapter mapping + typed interface entry |
| ADR-018 | 2026-06-03 | "Variation Order" is canonical UI label; DB keys stay `revision_order_*` | Renaming display text only avoids data-migration risk; documentType `revision_order_mov`, entity field `revisionType`, composable names unchanged |
| ADR-019 | 2026-06-03 | WAR/MPR data lives in construction_timeline_entries with type-specific columns | GGG-F: timeline entries hold both operational logs AND WAR/MPR report data via nullable type-specific columns + JSONB (accomplishments, work_items, signatories). Supersedes ADR-016 deferral. Signatories reference system users (no free text) |
| ADR-020 | 2026-06-04 | Team Tab source of truth = record_assignments only; personnel_groups JSONB removed from display | ZZZ-C research (R-031/R-032): JSONB non-system personnel has no edit UI (MJ cards removed by CiPersonnelAccessCard). Displaying unmanageable data is a governance violation. Team Tab now reflects only CiPersonnelAccessCard data, split into Institutional (non-EXTERNAL_CATEGORIES) and External (CONTRACTOR/CONSTRUCTOR/SUPPLIER/CONSULTANT/EXTERNAL_AUDITOR/EXTERNAL_PARTNER) |
| ADR-021 | 2026-06-04 | Others Tab Notes Banking always visible with 2-column grid; legacy panels conditional | ZZZ-D research (R-033): prior implementation gated entire Others tab behind hasOthersData; Notes Banking panels were individually hidden when empty; no CTA for empty state. Rule: the section for editable fields must always be visible even when empty, with CTA to edit page |
| ADR-022 | 2026-06-04 | ConcernItem per-item updatedBy/At deferred; use parent entry updatedAt | ZZZ-G: per-item update tracking requires array-diff logic on JSONB save — disproportionate complexity. createdBy+createdAt stamped on frontend add from authStore. Parent timeline entry's MikroORM updatedAt is the concern modification timestamp. |

---

## Completed Bug Fixes

| Date | Bug | Fix |
|---|---|---|
| 2026-05 | `full_name` column missing (III-A) | `COALESCE(display_name, first_name \|\| last_name, email)` |
| 2026-05 | Folder display always empty (PPP-A) | `fetchFolders()` was checking `Array.isArray(res)` — API returns `{data:[]}` |
| 2026-06-01 | GET /documents HTTP 500 | `WHERE id = ANY(?)` Knex binding → `WHERE id IN (?,?)` |
| 2026-06-01 | Upload files invisible after upload | Shared `CiRepositoryModal` had stale `uploadType` — reset on every modal open |
| 2026-06-01 | PATCH project → 500 tx race | `ActivityLogService` used shared EM — fixed with `em.fork()` |
| 2026-06-02 | Link DTO 400 "externalLink must be GDrive URL" | Old compiled DTO — restart activates updated DTO without `@Matches` |
| 2026-06-02 | Checklist not updating after upload | `v-window-item` without `eager` → component unmounted → checklistRef null |

---

## Completed Infrastructure

| Item | Status |
|---|---|
| 15 template .docx files in `/public/templates/` | ✅ Copied (MMM-A) |
| SDG Goals migration (20260602000000) | ✅ Created (QQQ-A) |
| Custom Supporting Sections migration (20260603000000) | ✅ Created (SSS-B) |
| Template URL seeding migration (20260601010000) | ✅ Created (LLL-E) |
| `em.fork()` in ActivityLogService | ✅ Applied |
| Nuxt `/templates` devProxy | ✅ Applied (UUU-A) |

---

## Phase III + JJJ — Completed (2026-06-08, commit `0643c6c`)

### Phase III: COI Analytics Tier 2

| Step | Deliverable |
|---|---|
| III-A | `getAnalyticsSummary()` extended — 2 new GROUP BY queries: `by_funding_source` + `by_contractor` (top-10 LIMIT) |
| III-B | Campus bars: dual-bar template — count bar (primary) + avg_progress bar (deep-purple) |
| III-C | Avg Progress by Campus: horizontal bar chart (purple) |
| III-D | Budget by Campus: donut chart; Contract by Status: donut chart |
| III-E | Contractor chart: horizontal bar (top-10, sky-blue); `fundingSourceChart` prefers backend data |
| III-F | Analytics tab: top guidance banner + 4 section labels (Status & Campus, Financial Overview, Progress Analysis, Contractor & Funding) |

### Phase JJJ: CSU CORE Executive Charts

| Step | Deliverable |
|---|---|
| JJJ-A | `uoTrendChart` — Q1-Q4 UO Accomplishment Trend area chart (green, `#059669`) in UO Summary card |
| JJJ-B | `uoFinancialTrendChart` — Q1-Q4 Financial Utilization Trend area chart (purple, `#7c3aed`) in UO Summary card |
| JJJ-C | `watch(selectedFiscalYear)` — reloads all 3 UO datasets simultaneously via `Promise.allSettled` |
| JJJ-D | Quick Actions subtitle caption; Other Modules section heading |

**Verification:** vue-tsc 0 new errors; tsc 0 new errors. No migrations required.

---

## Phase KKK + LLL — Executive Dashboard Refactor ✅ Complete (2026-06-08)

Phase 1 (Research R-088–R-103) + Phase 2 (Plan) + Phase 3 (Implementation) complete. vue-tsc 0 new errors (2 pre-existing ApexOptions TS2322 remain). Frontend-only, no migrations.

| Phase | Scope | Delivered |
|---|---|---|
| KKK | CSU CORE Dashboard (`dashboard.vue` + `AdminKpiRow.vue`) | AdminKpiRow Delayed→Published (text-subtitle-1, avatar 36); Infrastructure stat Delayed→Completed (text-h6); UO Summary 4 dual-stat cards + collapsible trend panel; Quick Actions compact v-list nav; removed GAD/Repair/UO stat cards + full-list fetches; welcome text-h5; banner text |
| LLL | COI Dashboard (`coi/index.vue`) | KPI 8→5 compact (removed Delayed + On Hold, added Published/Pending Review, text-h6/icon 20); table +Project Code/Fund Source/Orig.End; Column Manager (v-menu checkboxes, localStorage `coi_hidden_columns`, horizontal scroll); Recent Activity admin-only collapsible + lazy fetch; 3-tier filter (primary + simplified advanced + Full Search dialog); Portfolio Summary + Project List banners; removed Needs Attention/Slow-Moving/hero strip |

**Decisions during implementation:**
- D-LLL-1: COI status taxonomy is PROPOSAL/ONGOING/COMPLETE/ON_HOLD/CANCELLED — plan's "Under Construction" mapped to domain-accurate "Ongoing"; plan's "Fiscal Year" advanced filter replaced with start-date range (COI has no fiscal_year field — avoids a non-data-backed control).
- D-LLL-2: Column Manager defaults — brief-required columns (incl. Project Code, Fund Source, Orig. End) visible by default; supplementary optionals (Original Start, Revised End, Contractor, Created) default-hidden via `DEFAULT_HIDDEN`, all toggleable.
- D-KKK-1: Repair/UO module cards eliminated (not just GAD) — both relocated as Quick Actions nav items (no count fetch), per R-099.

---

## Phase MMM — Dashboard Platform Modernization ✅ Complete (2026-06-08)

Phase 1 (Research R-104–R-113) + Phase 2 (Plan) + Phase 3 (Implementation) complete. vue-tsc + tsc 0 new errors (2 pre-existing ApexOptions TS2322 remain). No migrations. **Backend restart required** for MMM-A.

| Step | Scope | Delivered |
|---|---|---|
| MMM-A | Analytics 500 root cause | `getAnalyticsSummary()` referenced non-existent columns `funding_source_name` + `contractor_name` → `Promise.all` rejected → endpoint 500 → AdminKpiRow/dashboard/COI KPIs all zeroed. Fixed: `LEFT JOIN funding_sources fs` for the name; `contractor_name`→`contractor`. |
| MMM-B | UO trend charts | Charts mount only when expansion panel open (`trendsExpanded` ref + `v-if`) so ApexCharts measures non-zero dimensions instead of rendering 0-height inside a collapsed panel. |
| MMM-C | Sidebar order | Reordered `mainModules`: Dashboard → University Operations → Infrastructure → Repair → GAD. |
| MMM-D | Sidebar header | Compacted ~50%: `py-2`→`py-1`, logo 44→40, `me-2`→`me-1`, removed stray `text-align-right` class. |
| MMM-E | User menu | Added My Profile / Account Settings / Change Password (non-contractor, route to `/profile?tab=…`) + error-colored Logout. |
| MMM-F | Activity Logs RBAC | `/coi/activity-logs` frontend guard added to `permission.ts` (Admin/SuperAdmin only). Backend already gated via `@Roles`. |
| MMM-G | COI action strip | Removed redundant "Review Projects" button; restructured strip (primary action left, navigation right via `v-spacer`). |
| MMM-H | COI filter banner | Dismissible instructional `v-alert` above filter bar, persisted via `coi_filter_banner_dismissed`. |
| MMM-I | Columns + tooltips | 3 new optional columns (Revised Start, Duration, Updated); KPI cards → data-driven `kpiCards` loop with `v-tooltip` + hover-lift. |

**Decisions during implementation:**
- D-MMM-1: MMM-I exposed a latent LLL gap — the COI list endpoint never selected `project_duration`/`updated_at` and never joined `funding_sources`/`contractors`, so the Fund Source + Contractor columns added in LLL rendered empty. Extended the list SELECT (`cp.updated_at`, `cp.project_duration`, `fs.name as funding_source_name`, `COALESCE(c.name, cp.contractor) as contractor_name`) + adapter (`projectDuration`) rather than ship empty columns. The `/api/construction-projects` route path is unchanged — IMMUTABLE-route constraint preserved (the constraint governs the route, not the query columns).
- D-MMM-2: Profile page (`/profile`) referenced by MMM-E menu items does not yet exist — items create the navigation affordance now; page build deferred to a future phase (404 acceptable interim).
- Out of scope (unchanged): the 2 pre-existing ApexOptions TS2322 errors (`yaxis.categories` on campus/contractor horizontal bar charts at `coi/index.vue`) remain — not in MMM plan; logged as a standing blocker.

---

## Phase NNN — Visual Intelligence Platform Modernization ✅ Complete (2026-06-08)

Phase 1 (Research R-114–R-125) + Phase 2 (Plan) + Phase 3 (Implementation) complete. vue-tsc + tsc 0 new errors (2 pre-existing ApexOptions TS2322 remain). No migrations. **Backend restart required** (NNN-G/H auth endpoints).

| Step | Scope | Delivered |
|---|---|---|
| NNN-A | VERIFY_STEP | Sidebar logo restored 40→44 (MMM-D overcorrected branding proportions per Section C1); `me-1` horizontal gap + `py-2` height retained |
| NNN-B | App background | `<v-main class="bg-grey-lighten-5">` — subtle grey so white cards float |
| NNN-C | Dashboard sections | Icon+divider section labels (Infrastructure / University Operations / Operational Insights); Infrastructure + UO + Quick Actions cards → `elevation="1" rounded="lg"`; **fixed MMM-B regression** via `multiple` prop on trend `v-expansion-panels` |
| NNN-D | KPI tooltips | `v-tooltip` (formula + source) on all 4 AdminKpiRow tiles + cursor:help + hover-lift |
| NNN-E | Sidebar restructure | Administration split → "Operations & Monitoring" (`v-list-subheader`, Admin+SA) + "System Administration" (canManageUsers); removed `v-list-group` + orphaned `administrationOpen` ref/watch/init |
| NNN-F | Avatar surfacing | `BackendUser`/`UIUser`/`adaptUser` + `authStore.userAvatarUrl`/`patchUser`; app-bar avatar renders `v-img` when `avatarUrl` present, initials fallback |
| NNN-G | Backend change-password | `POST /api/auth/change-password` — JWT-gated, bcrypt verify, SSO-guard, throttle 3/10min, sets `lastPasswordChangeAt` + audit log |
| NNN-H | Backend profile update | `PATCH /api/auth/me` — displayName + phone; `getProfile()` enriched (phone, display_name, last_login_at, last_password_change_at, is_sso) |
| NNN-I | Profile page | New `pages/profile.vue` — identity card + Account Overview (editable displayName/phone via PATCH) + Security (change password, strength meter, SSO-aware); `?tab=security` deep-link from user menu |
| NNN-J | COI spacing | Executive + filter cards → `elevation="1" rounded="lg"`; Portfolio Summary + Project List labels → icon+divider style |

**Decisions during implementation:**
- D-NNN-1: MMM-B was a latent regression — `v-expansion-panels` without `multiple` uses a scalar model, so the `ref<number[]>` + `.includes(0)` guard never fired and trend charts never mounted. Fixed by adding `multiple`.
- D-NNN-2: "System Administration" sidebar group gated by `canManageUsers` (existing User Management gate) rather than raw `isSuperAdmin`, to avoid silently removing access from any Admin granted user-management.
- D-NNN-3: Avatar **upload** deferred (needs new file-handling endpoint) — Upload Photo button shown disabled with "coming soon" tooltip; avatar **display** from existing `avatarUrl` is live. Profile Activity tab also deferred.
- Backend restart required for NNN-G/H (and still-pending MMM-A analytics fix) to take effect.

