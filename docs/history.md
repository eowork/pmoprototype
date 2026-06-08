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
