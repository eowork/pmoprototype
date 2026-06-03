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
