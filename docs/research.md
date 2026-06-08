# PMO Dashboard — Research Repository
> Research findings only. Not plans, not decisions, not history.
> **Last Updated:** 2026-06-08 | **Governance:** ACE v2.4
> **New entries:** R-088–R-103 (KKK/LLL executive dashboard refactor — 2026-06-08)

---

## COI Module Research

### R-001: Document Retrieval Array Binding (Knex)

**Topic:** Raw SQL array binding with MikroORM conn.execute()

**Finding:** MikroORM `conn.execute()` uses Knex positional `?` placeholders which FLATTEN array bindings. `WHERE id = ANY(?)` with a JS array param expands to `ANY($1, $2, …)` — invalid SQL → HTTP 500.

**Reference:** `university-operations.service.ts:2634` documents this identical bug (Phase II fix note).

**Correct pattern:**
```typescript
const ph = ids.map(() => '?').join(', ')
conn.execute(`WHERE id IN (${ph})`, ids)
```

**Recommendation:** Audit all raw SQL for `ANY(?)` before adding new raw queries.

---

### R-002: ActivityLog Transaction Race Condition

**Topic:** Fire-and-forget log writes sharing request-scoped EntityManager

**Finding:** `ActivityLogService.logAction()` using `this.em.persistAndFlush()` on the shared request EM races with the caller's subsequent queries (e.g., `findOne()` after `update()`). The log's implicit flush transaction completes, leaving the caller's in-flight queries against a completed transaction → `DriverException: Transaction query already complete`.

**Fix:** `const em = this.em.fork()` — isolated UoW and connection per log write.

**Recommendation:** All fire-and-forget async operations that write to the DB should use `em.fork()`.

---

### R-003: Shared CiRepositoryModal — Stale uploadType

**Topic:** Shared modal instance retaining documentType from previously-opened repository

**Finding:** `CiRepositoryModal` is a single shared component instance in `CiAttachmentHub`. The `uploadType` ref initializes from `typeCodes[0]` once. The watch on `modelValue` used `if (!uploadType.value) uploadType.value = ...` — only reset when falsy. After the first repository is opened, `uploadType` retains that repo's typeCode permanently.

**Consequence:** All subsequent uploads file documents under the FIRST repository's typeCode, making them invisible in their intended repository (but findable in the first repo or "Miscellaneous").

**Fix:** Reset `uploadType` unconditionally on every modal open + add `watch(typeCodes)` resync.

**Recommendation:** Any shared component instance that derives behavior from props must fully reset all internal state on each "open" event, not just when state is falsy.

---

### R-004: CiFolderRepository Response Shape

**Topic:** API wraps folder tree in `{data: []}` but component expected bare array

**Finding:** `GET /api/construction-projects/:id/document-folders` returns `{ data: FolderNode[] }`. `CiFolderRepository.fetchFolders()` was checking `Array.isArray(res)` → always false → `folders.value = []` on every call. Folders existed in DB but never rendered.

**Fix:** `const res = await api.get<{ data: FolderNode[] }>(...)` then `res.data ?? []`.

**Recommendation:** All API responses in this codebase use the `{ data: T }` wrapper pattern. Always type the response as `{ data: T }` and unwrap.

---

### R-005: Checklist Auto-Sync and v-window-item Lazy Mounting

**Topic:** `checklistRef.value?.refresh()` silently no-ops when Compliance Checklist tab unvisited

**Finding:** Vuetify `v-window-item` without `eager` prop uses lazy rendering — content only mounts when that tab is first activated. `CiDocumentChecklist` ref is null until visited → `checklistRef.value?.refresh()` does nothing → uploads don't auto-update the checklist.

**Fix:** `<v-window-item value="checklist" eager>` — component always mounted when `hasProject`.

**Recommendation:** Any component that must be reactive regardless of tab visibility (especially those that expose methods via template ref) should use `eager` or an alternative always-mounted approach.

---

### R-006: Gallery Carousel Architecture

**Topic:** Gallery images appearing in Project Overview carousel

**Finding:** `carouselImages = computed(() => gallery.value.length ? gallery.value : profileImages.value)` — the PROFILE filter was ignored whenever ANY gallery image existed. All uploaded images auto-appeared in the overview carousel.

**Correct behavior:** `profileImages.value.length ? profileImages.value : gallery.value` — PROFILE-tagged images are the "cover images"; all others accessible only via Gallery tab.

**Recommendation:** Default gallery behavior should be opt-in to featured display, not opt-out.

---

### R-007: CSS Flexbox Panel Stretching

**Topic:** Adjacent expansion panels stretch to match expanded sibling height

**Finding:** `.overview-grid { display: flex; flex-wrap: wrap; }` — default `align-items: stretch` forces all flex items in a row to match the tallest sibling. When Panel A expands, Panel B stretches to match Panel A's height — creating empty white space.

**Fix:** `align-items: flex-start` — each panel takes only its own natural height.

**Recommendation:** Flex containers used for independent-height cards should always specify `align-items: flex-start` or `flex-start` unless synchronized height is intentional.

---

### R-008: Template File Static Serving

**Topic:** `/templates/SD_ECO_001.docx` returns 404

**Finding:** NestJS `useStaticAssets()` is registered at bootstrap. The 15 `[SHAREABLE]` `.docx` files were in nested subdirectories (`SHAREABLE SUPPORT DOCUMENTS-.../ORDERS/[SHAREABLE]...docx`) but the seeded `template_url` values used flat paths (`/templates/SD_ECO_001.docx`).

**Fix:** Copy files to flat names in `public/templates/`. Backend restart required to activate static middleware.

**Template inventory:** 15 SHAREABLE files (SD_ECO_001–004, 008–018). DRAFT files (005–007) intentionally excluded.

---

### R-009: Gallery Metadata Research

**Topic:** Gallery module purpose for construction infrastructure monitoring

**Findings:**
- Gallery already stores: `caption`, `category`, `image_taken_date`, `is_featured`, `created_by`
- Categories (IN_PROGRESS, COMPLETED, INSPECTION, PROFILE) support construction documentation use case
- Missing: timeline grouping by month, "missing documentation" alerts, category filter in modal

**Recommendations:**
- Group gallery modal images by month for timeline view
- Add "N photos this month" analytics stat
- Category filter chips in modal (implemented XXX-E)
- Regular photo documentation guidance alert in Hub gallery section

---

### R-010: Timelogs WAR/MPR Field Mapping

**Topic:** Reference document field analysis for Timelogs enhancement

**Reference docs:** `SD-ECO-ECO-009_Weekly Accomplishment Report.docx`, `SD-ECO-ECO-010_Monthly Progress Report.docx`

**WAR fields (weekly):** Report number, period start/end, physical accomplishment %, planned %, slippage, accomplishment narrative, issues/concerns, corrective actions, next week targets, manpower on-site.

**MPR fields (monthly):** Report number, month/year, physical progress, financial progress, cost incurred this period, cost to date, remaining balance, accomplishment summary, problems encountered, recommendations.

**Current CiTimelogsContainer coverage:**
- ✅ entry_type (WEEKLY/MONTHLY), report_number, percentage_completion, planned_accomplishment, slippage
- ✅ cost_incurred_to_date, cost_incurred_this_period, narrative_items, issues_items, mitigation_items
- ✅ year/quarter/month filters, card/list/table views

**Gap assessment:** Data model is adequate. Primary gap is visual consistency with `CiProgressReportTab` header/filter/view-toggle pattern (template-level improvement only).

---

### R-011: Supporting Documents Architecture

**Topic:** Repository architecture for supporting documents

**Finding:** `CiFolderRepository` (accordion/tree) was mismatched against `CiRepositoryCard` (card/modal) used by Key Documents. The two sections had fundamentally different UX patterns, inconsistent upload flows, and the folder path (`folder_id`-based document filtering) was fragile compared to typeCode-based filtering.

**Decision:** Supporting Documents converted to `CiRepositoryCard` grid — one card per seeded `construction_document_type` typeCode. All uploads route through the proven typeCode-based `persistDoc()` path (same as Key Documents), inheriting its persistence, search, filter, pagination, and audit behaviors.

**Template source:** 15 SHAREABLE files in `pmo-backend/public/templates/SHAREABLE SUPPORT DOCUMENTS.../`, mapped to `SD_ECO_001–018` type codes.

---

### R-013: Overview Grid Layout — Architectural Problem

**Topic:** Two independent expansion panels per row create height-sync issues

**Finding:** The current `.overview-grid` uses `display: flex; flex-wrap: wrap; align-items: flex-start` with 8 independent panels at `flex: 1 1 calc(50% - 12px)`. Even with `align-items: flex-start`, when one panel has significantly more content than its row partner, the visual rows appear uneven because the panels ARE independent — one takes 300px, its partner takes 800px, creating jagged row boundaries.

**Root cause:** The "two panels per row" pattern cannot guarantee visual alignment because panels are independent flex items with independent content heights.

**Architectural solution:** Replace "two independent panels per row" with "one panel per row containing a two-column internal layout." This eliminates height synchronization entirely. The single panel's height is determined by whichever column has more content, and both columns sit at the same level within that one container.

**Recommendation:** Merge each panel pair into a single `v-expansion-panel` with `<v-row>` inside: left `v-col` for section A, right `v-col` for section B. The `overview-grid` becomes a simple list of full-width panels.

### R-014: SDG Data Visibility

**Topic:** SDG chips showing `(project as any).sdgGoals?.length` — only visible if `sdgGoals` is populated

**Finding:** SDGs are implemented (BBB-A, QQQ) and the labelForSdg function works. The chips only render if `sdgGoals` is non-empty. If the operator hasn't selected SDGs for existing projects, the section appears empty. NOT a code bug — it's a data-entry gap. The code is correct.

**Recommendation:** Add a "No SDGs selected" placeholder when `sdgGoals` is empty, alongside a note to select them in the edit page. This makes the section always visible (not conditionally hidden).

### R-015: Draft Restore — Scope Assessment

**Topic:** "Unsaved draft found" snackbar exists but has functional limitations

**Finding (new.vue):** `saveDraft()` serializes `form.value` to localStorage with 2s debounce. Restore snackbar appears on mount if draft < 24h old. `clearDraft()` fires on successful save. **What's NOT persisted:** pendingDocs (File objects — not serializable), pendingImages, pendingLinks (staging queue). The restore only restores form field values, not staged attachments.

**Additional gap:** The `hasUnsavedChanges` ref resets to `false` after `saveDraft()` fires even though the user hasn't explicitly saved to the server (only to localStorage). This means the "Unsaved changes" chip disappears after the draft auto-save — misleading the user into thinking the data is server-saved.

**Recommendations:**
1. `hasUnsavedChanges` should only clear on `clearDraft()` (successful server save), not on `saveDraft()` (localStorage only)
2. Add a visible "Last auto-saved" timestamp near the form
3. Note in the snackbar that attachments (files) cannot be restored from draft

### R-016: Timelogs WAR/MPR Field Analysis

**Reference documents:** `SD-ECO-ECO-009_Weekly Accomplishment Report.docx`, `SD-ECO-ECO-010_Monthly Progress Report.docx`

**WAR (Weekly) required fields:**
- Report header: project name, week number, period (from–to dates), report date, contractor
- Physical accomplishment: this week %, cumulative %, target %, variance/slippage %
- Works accomplished this week (narrative)
- Problems/issues encountered
- Corrective measures taken
- Works planned for next week
- Manpower deployment: skilled, unskilled, total
- Equipment on-site

**MPR (Monthly) required fields:**
- Report header: project name, month/year, report date, contractor
- Physical accomplishment: this month %, cumulative %, target %, variance/slippage %
- Financial accomplishment: billings, payments, % paid
- Work accomplishments this month (narrative by work item)
- Problems and issues
- Corrective actions
- Work program for next month
- Photo documentation reference

**Gap vs current CiTimelogsContainer:** Current form captures `percentage_completion`, `planned_accomplishment`, `slippage`, `narrative_items`, `issues_items`, `mitigation_items`, `cost_incurred_this_period`. Missing: manpower data (WAR), equipment list (WAR), billing/payment (MPR), photo reference, work program for next period. The two forms should be separate modals since WAR has manpower/equipment fields that MPR doesn't need, and MPR has financial billing fields WAR doesn't need.

**Recommendation:** Separate WAR modal and MPR modal. Add missing fields to each. Leverage existing form infrastructure — only add new fields, don't rewrite.

### R-019: Phase GGG — Pre-Implementation Survey

**Topic:** What's genuinely new vs already done from the latest prompt

| Requirement | Status |
|---|---|
| Panel height-sync | ✅ EEE-A — one panel per row with two-column layout |
| Gallery fixed height + prev/next + close/caption | ✅ CCC-C + DDD-B |
| Location in Project Profile | ✅ DDD-A |
| SDG rendering | ✅ FFF-A |
| Panel typography clarity | ✅ FFF-B |
| Team tab read-only personnel | ✅ AAA-A — cards for assigned users, CSU, contractor, others |
| Others tab 6 panels | ✅ AAA-B — statusUpdates, readiness, signatories, incidents, risks, escalation |
| Analytics 4 KPI sections | ✅ DDD-D |

**Genuinely new:**
1. "Revision Order" → "Variation Order" global label rename (UI only — DB column names stay)
2. Project Indicators font increase (EEE-E made them x-small chips — need to reverse to larger)
3. Analytics executive rework: remove AAA-C "Project Health" card + milestone metrics; replace with ApexCharts gauges for physical%/financial% + time/cost visualizations + purpose banners
4. Team tab: two-column layout (Internal Personnel LEFT / External Personnel RIGHT) with search+filter across both
5. Others tab: add data-banking fields (notes, references, special instructions, historical references, custom metadata) — editable in edit page; read-only in detail
6. WAR/MPR Timelogs: full schema mapping from extracted attributes — separate modals, new backend columns, signatory user-search

### R-020: Analytics Tab — Architecture Decision

**Current state:** `CiProjectAnalyticsTab.vue` contains:
- DDD-D: 4 KPI rows (PROJECT STATUS, PROJECT COST, PROJECT DATES, PROJECT SNAPSHOT) + v-divider
- AAA-C: "Project Health" summary card (physical%, status chip, days remaining, schedule extension)
- Existing KE-E radial bar gauges (FY utilization, milestone completion rate) and histogram

**Prompt wants:**
- ROW 1: Project Snapshot (Status, Physical%, Financial%, Original Cost, Cost Incurred, Days Elapsed, Days Remaining) with purpose banner
- ROW 2: Project Dates + Project Cost cards with purpose banners
- Executive visuals: Physical Progress Gauge, Financial Utilization Gauge, Time Elapsed vs Remaining, Cost Utilization
- REMOVE: Project Health container, Avg Physical Progress, Milestone Completion/Progress/Slippage

**Decision (D-GGG-1):** Replace the entire analytics template section. Retain the ApexCharts radial-bar option infrastructure but reconfigure series data. The `milestoneCompletionRate` computed can be retained in script but hidden from template. `daysRemaining`, `isDelayed`, `scheduleVarianceDays` computeds stay (used in new snapshot row).

### R-021: WAR/MPR Database Schema Gap

**Current `construction_timeline_entries` columns:** `entry_type, entry_date, period_label, title, description, weather, manpower_count, equipment_used, work_accomplished, issues_encountered, reporter_type`

**WAR gap vs extracted attributes:**
- Missing: `war_number`, `reporting_period_start`, `reporting_period_end`, `accomplishments` (JSONB array), `personnel_equipment_constraints`, `mitigation_measures`, `look_ahead_activities`, `signatories` (JSONB), `photos_reference` (JSON link to gallery)
- `work_accomplished` → maps to accomplishment narrative (existing, adequate)
- `issues_encountered` → maps to `issuesRisks` (existing, adequate)

**MPR gap:**
- Missing: `mpr_number`, `reporting_period_month`, `original_contract_amount`, `revised_contract_amount`, `percent_time_elapsed`, `work_items` (JSONB), `accomplishment_summary_percent`, signatories JSONB

**Decision (D-GGG-2):** Two new MikroORM migrations:
1. `Migration20260603100000_AddWarFieldsToTimelineEntries` — adds `war_number`, `reporting_period_start`, `reporting_period_end`, `personnel_equipment_constraints`, `mitigation_measures`, `look_ahead_activities`, `signatories` (JSONB), `accomplishments` (JSONB)
2. `Migration20260603200000_AddMprFieldsToTimelineEntries` — adds `mpr_number`, `reporting_period_month`, `work_items` (JSONB), `accomplishment_summary_percent`, `percent_time_elapsed`, `original_contract_amount`, `revised_contract_amount`

**Signatory user-search:** Add `signatories` JSONB column storing `[{userId, userName, position, role, date}]`. The frontend uses a user-search autocomplete fed from `/api/users?search=` (existing endpoint). No free-text names.

### R-022: Others Tab Data-Banking Fields

**Current AAA-B implementation:** 6 expansion panels for JSONB fields already in the project entity (statusUpdates, readinessDocuments, signatories, incidentLog, riskRegister, escalationRecords). Read-only in detail, editable in edit.

**New fields needed:** Additional Notes (free text), Project References (URL/doc links), Special Instructions (structured notes), Historical References (text + dates), Custom Metadata (key-value pairs).

**Decision (D-GGG-3):** Add these as a new JSONB column `project_notes_banking` on `construction_projects` containing `{additionalNotes, projectReferences[], specialInstructions, historicalReferences[], customMetadata{}}`. One migration. The edit page gets input forms; detail page shows read-only expansion panels alongside the existing AAA-B panels.

### R-017: SDG Goals Never Mapped in Adapter — Root Cause (CRITICAL BUG)

**Topic:** `(project as any).sdgGoals` always `undefined` even when `sdg_goals` has data in DB

**Finding:** `UIProjectDetail` interface (adapters.ts:428) has `rdpAlignment`, `socioeconomicAgenda`, `csuLikhaGoals` but **no `sdgGoals`**. `adaptProjectDetail()` (line 538–540) maps the other three but omits `sdg_goals`. The template uses `(project as any).sdgGoals?.length` — TypeScript cast silences errors but the value is always `undefined`. The data exists in DB and is returned by the API as `sdg_goals` (snake_case).

**Fix (3 files):**
1. `adapters.ts`: add `sdgGoals: string[]` to `UIProjectDetail`; add `sdgGoals: backend.sdg_goals || []` to `adaptProjectDetail()`
2. `detail-[id].vue`: replace all `(project as any).sdgGoals` → `project.sdgGoals`

### R-018: Panel Section Visual Distinction

**Topic:** Two-column merged panels need stronger visual separation between left/right sections

**Finding:** Current separator is `class="border-md-s"` — a thin 1px left border on the right column. The overline label is `text-overline text-medium-emphasis` (small, muted). For a stakeholder-facing UI, the section distinction needs more weight.

**Recommended pattern:**
- Section headers: `text-subtitle-2 font-weight-semibold` (larger + heavier than `text-overline`)
- Add `v-icon` before each section header
- Right column: `border-md-s pl-md-4` (add left padding + border, not just border)
- Font size increase: bump body content from `text-caption` (12px) to `text-body-2` (14px) for field labels in the merged panels

### R-012: Financial Summary Data Sources

**Topic:** Financial data availability on project entity vs separate table

**Finding:** Per-fiscal-year financial records are in `construction_project_financials` (separate table, `project.financials`). Many projects have `project.financials = []` (no FY records). However, the main project entity always has: `contractAmount` (contract cost), `financialProgress` (%), `costIncurredToDate`.

**Recommendation:** Financial Summary panel should always show contract-level KPIs (dashFinancials.appropriation, costIncurredToDate, financialProgress) and treat FY-level breakdown as supplemental. Never show "No financial records" as the only content.

---

### R-023: Analytics `contractAmount` Field Name Mismatch — Root Cause (CRITICAL BUG)

**Topic:** `originalCost` and `revisedCost` fallback always 0 in analytics

**Finding:**
- `CiProjectAnalyticsTab.vue` line 55: `originalCost = Number((props.project as any).contractAmount || 0)`
- `UIProjectDetail` inherits from `UIProject` which has field `totalContractAmount` (set in `adaptProject()` line 173 from `backend.contract_amount`)
- The field `contractAmount` does NOT exist anywhere in `UIProject` or `UIProjectDetail`
- TypeScript cast `as any` silences the error but returns `undefined` → 0 at runtime
- Same bug on `revisedCost` fallback line 53: `Number((props.project as any).contractAmount || 0)`

**Fix:** Change all `.contractAmount` references in analytics to `.totalContractAmount` (correct interface field).

---

### R-024: Financial Gauge Uses Wrong Data Source — `financialProgress` vs `financialUtilization`

**Topic:** "Financial Utilization" radial gauge shows `financialProgress` (manually set) instead of computed obligation/appropriation ratio

**Finding:**
- `financialGauge` (line 110): `series: [Number(props.project.financialProgress || 0)]`
- `financialUtilization` (line 119–125): computed from `project.financials[].obligation / appropriation` — the accurate obligation rate
- These measure **different things**. `financialProgress` is a manually-set percentage on the project entity, often 0/default for new projects. `financialUtilization` is derived from actual FY financial records.
- The gauge labelled "Financial Utilization" SHOULD use `financialUtilization.value` (obligation rate), not `financialProgress`

**Fix:** `financialGauge.series = [Number((financialUtilization.value ?? props.project.financialProgress ?? 0).toFixed(1))]`

**Fallback rule:** If `financialUtilization` is null (no financials array), fall back to `financialProgress`.

---

### R-025: `costIncurredThisPeriod` Missing from `UIProjectDetail` Interface

**Topic:** Analytics "Cost This Period" always 0 due to missing type declaration

**Finding:**
- `CiProjectAnalyticsTab.vue` line 430: `(props.project as any).costIncurredThisPeriod || 0`
- `UIProjectDetail` interface (adapters.ts ~line 404): only defines `costIncurredToDate: number | null`, NOT `costIncurredThisPeriod`
- `adaptProjectDetail()` maps `backend.cost_incurred_to_date` but NOT `backend.cost_incurred_this_period`
- The service at line 2876 uses `costIncurredThisPeriod` on the entity but never computes/joins it into `findOne` response for the project

**Fix:** 1) Add `costIncurredThisPeriod: number | null` to `UIProjectDetail` in adapters.ts; 2) Add `costIncurredThisPeriod: backend.cost_incurred_this_period ?? null` to `adaptProjectDetail()`.

---

### R-026: Team Tab — CSU/Contractor/Others Use Inconsistent `v-list-item` Pattern

**Topic:** Visual misalignment between Assigned Personnel cards and CSU/Contractor/Others personnel

**Finding:**
- "Assigned Personnel" section (lines 1987–2006): renders each person as `v-card variant="tonal" color="primary"` with avatar + name + role chips — modern card style
- "CSU Personnel", "Contractor Personnel", "Other Personnel" sections (lines 2018–2078): use `v-list density="compact"` with `v-list-item` — plain list style
- Result: the first group looks polished (card with avatar + chips); the other three look like basic lists — visually mismatched to any user opening the tab

**Fix:** Refactor CSU, Contractor, and Others group bodies to use the same `v-card variant="tonal"` pattern with initials avatar (`getInitials()` helper already exists at line ~485).

---

### R-027: Others Tab — Notes Banking Always Shows Empty State; No CTA

**Topic:** `Others` tab shows empty state even when `projectNotesBanking` is supposed to be editable

**Finding:**
- `hasOthersData` (line 596) gates ALL Others content: returns true only if legacy JSONB arrays have items OR `hasNotesBanking` is true
- `projectNotesBanking` is null until: (a) OPS-1 migrations run AND (b) user saves notes in edit page
- Empty state (line 2097) shows icon + "No supplementary project data recorded." — no call to action, no link to add notes
- Users cannot discover that this tab supports Additional Notes, Project References, Special Instructions

**Fix:** Always render the `projectNotesBanking` panel even when null. Show "No notes yet" inside the panel with a "Add Notes via Edit Project" link/button. Do NOT gate the entire tab behind `hasOthersData` — show the notes panel unconditionally.

---

### R-028: WAR/MPR Form Section Hierarchy is Flat — Missing Structured Sections

**Topic:** Data entry form for timelogs lacks section hierarchy, guidance, and structured Project Concerns

**Finding (WAR):**
- Current sections use `text-caption text-grey font-weight-medium text-uppercase` (12px, muted) — visually weak
- Missing sections: Physical Accomplishment header, Financial Accomplishment header, Work Activities section, Recommendations/Actions Taken section
- "Project Concerns" = two `v-textarea` fields (`personnel_equipment_constraints`, `mitigation_measures`). No structured list, no severity/status/responsible party tracking

**Finding (MPR):**
- Missing sections: Financial Accomplishment Summary header, Forecast/Next Month Activities section header
- Same flat Project Concerns problem

**Finding (Guidance banners):**
- Existing banner (line 675): `v-alert variant="tonal"` with compact `text-caption` — functional but understated
- Needs: larger informative banner, collapsible, CSU-consistent color (blue for WAR, green for MPR), descriptive paragraph

---

### R-029: Project Concerns Needs List-Based JSONB Storage — New Migration Required

**Topic:** List-based Project Concerns entry requires a new `concerns_list` column on `construction_timeline_entries`

**Finding:**
- Current storage: `personnel_equipment_constraints TEXT` + `mitigation_measures TEXT` (from WAR migration `Migration20260603100000`)
- These are flat text fields; a list-based system requires an array with per-item fields
- Required fields per concern: `title`, `description`, `severity` (CRITICAL/HIGH/MEDIUM/LOW), `status` (OPEN/IN_PROGRESS/RESOLVED), `responsibleParty`, `resolutionTargetDate`
- This requires a new JSONB column: `concerns_list JSONB DEFAULT '[]'`

**New migration:** `Migration20260604000000_AddConcernsListToTimelineEntries`
```sql
ALTER TABLE construction_timeline_entries
  ADD COLUMN IF NOT EXISTS concerns_list JSONB DEFAULT '[]';
COMMENT ON COLUMN construction_timeline_entries.concerns_list IS
  'ZZZ-G: [{title, description, severity, status, responsibleParty, resolutionTargetDate}]';
```

**DTO update:** `CreateTimelineEntryDto` / `PatchTimelineEntryDto` — add `@IsOptional() @IsArray() concerns_list?: ConcernItemDto[]`

**Preserve existing fields:** `personnel_equipment_constraints` and `mitigation_measures` remain as legacy fields; new concerns_list is additive.

---

### R-030: VER Items and OPS Blockers — Status

**Topic:** Pending verifications and operational blockers as of 2026-06-03

| Item | Root Cause | Required Action | Code Change? |
|---|---|---|---|
| VER-1 (Gallery carousel) | Fixed in phase BBB/DDD (profileImages.first fallback) | Operator browser test only | None |
| VER-2 (SDG Goals) | `sdg_goals` migration NOT run (OPS-1 pending) | Run `npx mikro-orm migration:up` | None |
| VER-3 (Supporting Docs cards) | `custom_supporting_sections` migration NOT run (OPS-1 pending) | Run OPS-1 | None |
| Template 404 (`/templates/*.docx`) | NestJS ServeStaticModule only activates after `npm run start:dev` restart | Run OPS-2 | None |
| 6 pending migrations | Not yet applied to DB | Run OPS-1 | None |

**All VER-1 through VER-3 are unblocked by running OPS-1 + OPS-2. Zero code changes required.**

---

### R-031: Team Tab Dual-Source Personnel Architecture — Root Cause of "Joko Saco / Meo" Issue

**Topic:** Team Tab renders data from two structurally separate personnel systems, causing display confusion and potential data orphaning.

**System 1 — System User Assignments (`record_assignments` table):**
- Joined into project `findOne` + `findAll` via raw SQL (`WHERE ra.module = 'CONSTRUCTION' AND ra.record_id = cp.id`)
- Returned as `assigned_users[]` in API response → adapted as `project.assignedUsers` in `adapters.ts`
- Managed by `CiPersonnelAccessCard` in edit page Personnel Tab
- Has two sub-categories:
  - **Institutional**: IMPLEMENTING, OVERSIGHT, MONITORING_OFFICER, FOCAL_POINT, etc.
  - **External**: CONTRACTOR, CONSTRUCTOR, SUPPLIER, CONSULTANT, EXTERNAL_AUDITOR, EXTERNAL_PARTNER
- `CiPersonnelAccessCard` already computes `institutionalDraft` + `externalDraft` as separate groups

**System 2 — Non-System JSONB Personnel (`personnel_groups` JSONB on `construction_projects`):**
- Stored in `personnel_groups` column, adapted as `project.personnelGroups.{csu, contractor, others}`
- Hydrated in `edit-[id].vue` as `csuPersonnelRows`, `contractorPersonnelRows`, `othersPersonnelRows`
- Included in save payload under `personnel_groups` key
- **CRITICAL: No edit form UI exists for these rows.** The MJ cards that managed them were removed/replaced by `CiPersonnelAccessCard`. The refs are declared and hydrated but there are no `v-for` add/remove form rows in the Personnel tab template.
- Any data in this JSONB column is from before `CiPersonnelAccessCard` was built (legacy) and is unmanageable from the current UI.

**Why do "Joko Saco" and "Meo" appear?**
- If they appear under "Assigned Personnel" → they are system users in `record_assignments` (correctly managed via CiPersonnelAccessCard)
- If they appear under "CSU Personnel", "Contractor Personnel", or "Other Personnel" → they are legacy JSONB entries from before `CiPersonnelAccessCard` and there is no current edit interface to remove or update them

**Dead code:** `groupedPersonnel` computed in `detail-[id].vue` line 382 groups `assignedUsers` by PERSONNEL_GROUPS category. It is never referenced in the Team Tab template (template uses `filteredAssignedUsers` directly). This is dead code.

---

### R-032: Team Tab Revised Architecture — What Team Tab Should Reflect

**Topic:** Correct Team Tab data model after removing JSONB legacy containers.

**Finding:** The Personnel Tab edit interface (`CiPersonnelAccessCard`) manages only System 1 (`record_assignments`). System 2 (JSONB `personnel_groups`) has no management UI. Displaying orphaned data that cannot be edited is a governance violation.

**Correct model:** Team Tab = read-only reflection of `record_assignments` only. Split by personnel category:
- **Institutional Personnel** (left column): users where `personnelCategory` is NOT in `EXTERNAL_CATEGORIES` set
- **External Personnel** (right column): users where `personnelCategory` IS in `EXTERNAL_CATEGORIES` set

**`EXTERNAL_CATEGORIES` set** (from `CiPersonnelAccessCard`):  
`CONTRACTOR, CONSTRUCTOR, SUPPLIER, CONSULTANT, EXTERNAL_AUDITOR, EXTERNAL_PARTNER`

**Institutional category labels** (from `PERSONNEL_GROUPS` in `coiFormState.ts`):
Use `PERSONNEL_GROUPS.find(g => g.code === u.personnelCategory)?.label` to get display labels.

**Implementation change to ZZZ-C:**
- Remove: CSU Personnel card, Contractor Personnel card, Other Personnel cards (all JSONB-sourced)
- Split `filteredAssignedUsers` into `filteredInstitutional` + `filteredExternal` computed properties
- Each card renders the existing `v-card variant="tonal"` pattern (already built for "Assigned Personnel")
- Remove dead `groupedPersonnel` computed
- Add pagination: `institutionalPage`, `externalPage` page refs + `paginatedInstitutional`, `paginatedExternal` computed (PAGE_SIZE = 12)
- Add read-only info `v-alert` at top of tab

---

### R-033: Others Tab — Structural Mismatch Between Detail and Edit

**Topic:** Detail page Others tab does not consistently reflect editable fields; Notes Banking is gated behind data presence.

**Edit page (`edit-[id].vue`) Others Tab structure (KW-F4):**
- LEFT column: Incidents / Special Concerns (prominent, add/remove rows)
- LEFT column: Risk Register (prominent, add/remove rows)
- RIGHT column: Escalation Records (prominent, add/remove rows)
- RIGHT column: Administrative Records (collapsed expansion — statusUpdates, readinessDocuments, signatories)
- RIGHT column: Data Banking card (additionalNotes, specialInstructions, projectReferences, historicalReferences, customMetadata)

**Detail page (`detail-[id].vue`) Others Tab structure:**
- `hasOthersData` gates the ENTIRE tab (returns false if all arrays empty AND `hasNotesBanking` false)
- When gated: shows "No supplementary project data recorded." with no CTA
- When open: renders 6 expansion panels (statusUpdates, readinessDocuments, signatories, incidentLog, riskRegister, escalationRecords) + 5 separate conditional Data Banking expansion panels

**Inconsistencies:**
1. Data Banking panels are conditional on content (`v-if="notesBanking?.additionalNotes"`) — all hidden when empty even though these fields exist in edit
2. All Data Banking fields are separate expansion panels in detail but a single card in edit
3. `hasOthersData` includes `hasNotesBanking` — if any notes banking field exists, tab shows. But if Notes Banking is empty (but edit has a form for it), the tab shows empty state
4. No CTA to go to edit page when Others tab is empty

**Correct fix for ZZZ-D:**
1. Remove `v-if="!hasOthersData"` top-level gate; always render the Notes Banking section
2. Notes Banking always-visible using a 2-column grid card (not expansion panels):
   - Row 1: Additional Notes + Special Instructions (full-width textareas, read-only styled)
   - Row 2: Project References (table) + Historical References (timeline)
   - Row 3: Custom Metadata (key-value table, if any entries)
3. When `projectNotesBanking` is null or all fields empty: show placeholder text + "Add Notes in Edit Project" button
4. The button must navigate to `edit-${projectId}?tab=others`
5. Keep legacy expansion panels but gate them individually (already done) — wrap in `v-expansion-panels` only when at least one has data
6. Update `hasOthersData` to gate only the legacy expansion panels block, not the Notes Banking section

---

### R-034: Project Concerns Model — Expanded Fields and Audit Approach

**Topic:** User requires expanded `ConcernItem` model with category, resolution, and audit fields. ZZZ-G plan needs DTO update.

**Current ZZZ-G plan `ConcernItemDto` fields:**
`title, description, severity (CRITICAL/HIGH/MEDIUM/LOW), status (OPEN/IN_PROGRESS/RESOLVED), responsibleParty, resolutionTargetDate`

**User's required model adds:**
`category, actualResolutionDate, mitigationAction, createdBy, createdAt, updatedBy, updatedAt`

**Architecture decision for audit fields:**
- `createdBy` + `createdAt`: Can be stamped by frontend when user clicks "Add Concern" (using `authStore.userId` + current date). Simple and correct.
- `updatedBy` + `updatedAt` per concern item: Requires backend diff of the JSONB array to detect which items changed. This is disproportionate complexity for JSONB storage.
- **Decision (D-ZZZ-G-1):** Include `createdBy` + `createdAt` in the concern schema. Omit per-item `updatedBy`/`updatedAt` — use the parent timeline entry's `updatedAt` (auto-managed by MikroORM `onUpdate`) as the modification timestamp for the concern block. This satisfies "auditable" without requiring array-diff.

**Reusability:** `concerns_list` JSONB column on `construction_timeline_entries` is shared by ALL entry types (WEEKLY WAR, MONTHLY MPR, general timelogs). One column, one schema, one form component. Already correct in ZZZ-G plan.

**Revised `ConcernItemDto`:**
```typescript
class ConcernItemDto {
  @IsString() @IsOptional() title?: string
  @IsString() @IsOptional() description?: string
  @IsString() @IsOptional() category?: string   // NEW: SAFETY, SCHEDULE, FINANCIAL, ENVIRONMENTAL, OTHER
  @IsIn(['CRITICAL','HIGH','MEDIUM','LOW']) @IsOptional() severity?: string
  @IsIn(['OPEN','IN_PROGRESS','RESOLVED']) @IsOptional() status?: string
  @IsString() @IsOptional() responsibleParty?: string
  @IsString() @IsOptional() resolutionTargetDate?: string
  @IsString() @IsOptional() actualResolutionDate?: string  // NEW
  @IsString() @IsOptional() mitigationAction?: string      // NEW (replaces mitigation_measures)
  @IsString() @IsOptional() createdBy?: string             // NEW: user ID, stamped on frontend add
  @IsString() @IsOptional() createdAt?: string             // NEW: ISO date, stamped on frontend add
}
```

**Category options:** SAFETY, SCHEDULE, FINANCIAL, ENVIRONMENTAL, QUALITY, OTHER

---

### R-067: Administrative Management [[],[]] — Root Cause Analysis

**Topic:** Administrative Management data (Status Updates, Readiness Documents, Signatories) persists as `[[],[]]` in the database instead of structured records. Full end-to-end trace.

**Root Cause 1 (CONFIRMED): `readiness_docs` field name typo in new.vue**

`new.vue` line 503:
```typescript
readiness_docs: readinessDocRows.value.length > 0 ? readinessDocRows.value : undefined,
```
The backend DTO uses `readiness_documents`. With `forbidNonWhitelisted: true`, sending `readiness_docs` causes a **400 Bad Request** when a user tries to create a project WITH readiness document rows added. Creating WITHOUT readiness documents works fine (field is `undefined`, not sent).

**Root Cause 2 (CONFIRMED): CREATE SQL does not include Others-tab JSONB columns**

The `INSERT INTO construction_projects` statement in the service (line 687-769) does NOT include:
- `status_updates`
- `readiness_documents`
- `signatories`
- `risk_register`
- `escalation_records`

These columns are only populated via PATCH (UPDATE). During project creation, they default to `null` regardless of what the frontend sends. New projects always start with `null` for these fields.

**Root Cause 3 (HISTORICAL): `[[],[]]` data origin**

The `[[],[]]` pattern in the database is historical data from a previous code state. Current code (after EEE-B fix) correctly handles empty arrays. The `monNorm` function in `edit-[id].vue` correctly normalizes `[[],[]]` to `[{},{}]` during hydration (`!Array.isArray(r)` filter), and re-saving transforms them to proper objects.

**Root Cause 4 (CONFIRMED): Administrative Management NOT rendered in detail page**

`detail-[id].vue` Others tab (DDD-B implementation) is missing Section B (Administrative Management). After line 2031 (`<v-window-item value="others">`), the tab goes directly to Section C (Project Knowledge Bank) and Section D (Lessons Learned). Status Updates, Readiness Documents, and Signatories are stored in JSONB columns but have no read-only rendering in the detail page.

**Data flow validated:**
- `status_updates` column EXISTS in `construction_projects` table (confirmed in `jsonFields` array at line 942 and entity `statusUpdates` field)
- `adaptProjectDetail()` correctly maps `backend.status_updates` → `project.statusUpdates`
- `project.statusUpdates` is available in the detail page component — just not rendered in the Others tab

---

### R-068: Compliance Visualization — Accuracy and Restore Request

**Topic:** Compliance scorecard (EEE-A) does not auto-refresh; user requests pie chart restored alongside scorecard.

**Finding 1 — No auto-refresh:**
`CiProjectAnalyticsTab.vue` calls `fetchChecklist()` in `onMounted()` only. When users upload documents in the Attachments tab (which auto-links to checklist via YYY-C backend logic), the analytics tab's compliance display is stale until the page is re-visited or hard-refreshed.

**Finding 2 — Restore pie chart:**
The previous compliance donut (status breakdown: NOT_SUBMITTED / SUBMITTED / APPROVED / REJECTED) was replaced entirely by EEE-A scorecard. The user wants BOTH:
- Left: Scorecard (group-level completion bars — keeps EEE-A work)
- Right: Pie/Donut chart showing submitted vs missing vs pending counts (restored)

**Finding 3 — `documentType.groupLabel` validated:**
`ConstructionDocumentType.groupLabel` is a populated entity field (confirmed in entity file). The scorecard's fallback `code.replace(/_/g, ' ')` only triggers when `documentType` is null, which shouldn't happen after lazy initialization.

**Data source confirmed:**
`GET /api/construction-projects/:id/document-checklist` returns `ConstructionDocumentChecklist[]` each with `submissionStatus` + `documentType.groupCode` + `documentType.groupLabel`. This is the correct source for both visualizations.

---

### R-069: detail-[id].vue Others Tab — Missing Sections

**Topic:** Section B1 confirmed as intentional removal. Section B (Administrative Management) is the remaining gap.

**B1 — Project Governance (Risk + Escalation): INTENTIONALLY REMOVED** ✅
Confirmed not in detail page. No orphaned refs or broken rendering. No action needed.

**Section B — Administrative Management: NOT RENDERED IN DETAIL PAGE**
`status_updates`, `readiness_documents`, `signatories` are populated via PATCH from edit page but have no read-only display in the detail page. The data exists in `project.statusUpdates`, `project.readinessDocuments`, `project.signatories` (correctly mapped in adapter) but the detail page Others tab doesn't render them.

This should be added between the (removed) governance section and the Project Knowledge Bank section.

---

### R-035: Others Tab — Functional Scope for Infrastructure Projects

**Topic:** What belongs in the Others Tab beyond Notes Banking, from a Site Engineer and PMO perspective.

**Governance boundary:** Others Tab = information that is useful but does NOT belong in:
- **Progress Reports tab**: formal progress capture (CiProgressReportTab, Timelogs, WAR/MPR, Variation Orders)
- **Documents tab**: formal file attachments (CiAttachmentHub, CiRepositoryCard)
- **Analytics tab**: computed KPIs and charts (CiProjectAnalyticsTab)
- **Team tab**: personnel records
- **Overview tab**: project identity, profile, strategic alignment

**Validated use cases for construction projects:**

| Category | Value | Example Content | Duplicates Existing? |
|---|---|---|---|
| Notes Banking | Administrative supplement | Additional notes, project references, special instructions, historical refs | No — GGG-E |
| Lessons Learned | Institutional knowledge | What worked on this project, what didn't, recommendations for future | No — new |
| Site Observation Log | Field intelligence | Quick observer notes that don't rise to formal WAR entry level | Partial — timelogs cover formal WAR/MPR; site observations are informal |
| Stakeholder Communication Notes | Non-formal records | Verbal agreement notes, phone call summaries, meeting action items | No |
| Incidents / Special Concerns | Safety & issues | Already in KW-F4 (edit) + Others expansion panel (detail) | Yes — already built |
| Risk Register | Risk tracking | Already in KW-F4 | Yes — already built |
| Escalation Records | Issue escalation | Already in KW-F4 | Yes — already built |

**Net new categories justified by research (lightweight, no DB redesign):**
1. **Lessons Learned** — Structured entries: `{ phase, observation, recommendation, addedBy, addedAt }`. Stored as JSONB array. Editable in edit page Others tab. Read-only in detail page Others tab.
2. **Site Observation Log** — Lightweight entries: `{ date, observer, observation, location, actionRequired: boolean }`. Stored as JSONB array. Useful for field engineers recording informal site conditions not covered by formal WAR.

**Fields that DON'T belong:**
- Formal progress percentages → Progress Reports
- Document checklists → Documents tab  
- Personnel notes → Team tab + Personnel tab
- Milestone updates → tracked in milestones

**Revised Others Tab structure (detail page):**
1. Always-visible Notes Banking card (ZZZ-D — grid layout)
2. Lessons Learned expansion panel (when data exists OR always-visible with CTA)
3. Site Observation Log expansion panel (when data exists OR always-visible with CTA)
4. Legacy panels: incidents, risks, escalations, status updates, readiness docs, signatories (conditional on data)

**DB impact:** Two new JSONB fields on `construction_projects`:
- `lessons_learned JSONB DEFAULT '[]'` (array of lesson objects)
- `site_observations JSONB DEFAULT '[]'` (array of observation objects)

OR: keep them inside `project_notes_banking` as sub-keys (`lessonsLearned`, `siteObservations`) — no new migration required, just extend the existing GGG-E JSONB schema.

**Recommendation:** Extend `project_notes_banking` JSONB to include `lessonsLearned[]` and `siteObservations[]`. This requires:
- DTO: extend `project_notes_banking` type to include the arrays (already `Record<string, any>` — permissive)
- Entity: already `jsonb nullable` — no migration needed
- Frontend: add input forms in edit page; add read-only sections in detail page
- No migration file required

---

### R-036: CiBasicInfoForm — HCI/UX Assessment

**Topic:** Human-Computer Interaction evaluation of the project data entry form used in new.vue and edit-[id].vue.

**Form Structure (7 row sections):**
```
Row A: Project Identity card (code, campus, status, title in 4 equal cols; description full-width)
Row B: Location card + Implementation Agencies card (50/50)
Row C: Funding & Cost card + Other Attributes card (50/50)
Row D: Project Objectives card + Beneficiary Groups card (50/50) [CiBulletListInput]
Row E: Strategic Alignment Narrative card (full-width)
Row E2: SDG card + RDP card (50/50) [CiHierarchicalSelectorTrigger]
Row E3: Socio-Economic Agenda card + CSU LIKHA card (50/50) [CiHierarchicalSelectorTrigger]
Row G: Output Indicators card + Outcome Indicators card (50/50) [CiBulletListInput]
```

**HCI Dimension Scores:**

| Dimension | Score | Finding |
|---|---|---|
| Information Hierarchy | 6/10 | Title field receives same visual weight as Code/Campus/Status (all equal columns). Title is the most critical identifier but is last in the row and same size. |
| Visual Density | 6/10 | `density="compact"` everywhere is correct for admin forms; however Strategic Alignment section (5 consecutive full/half-width cards for narrative + 4 alignment selectors) creates a visually heavy optional section that dwarfs required fields. |
| Cognitive Load | 5/10 | 8 distinct card groups render simultaneously. No progressive disclosure. Strategic Alignment section renders 4 large selector cards that are mostly empty for new projects — high friction for fields rarely filled in during initial data entry. |
| Data Entry Flow | 7/10 | Top-to-bottom section order is logical. However, Objectives (Row D) appearing before Strategic Alignment (Row E) but after Funding (Row C) breaks natural workflow: engineers typically fill Identity → Location → Funding → Objectives → Alignment. |
| Readability | 7/10 | Card subtitles are helpful and accurately describe each section. Field placeholders provide good examples. |
| Scannability | 5/10 | Section overline headers (`text-overline text-grey-darken-1`) are 10px, muted grey — hard to scan quickly. Users cannot instantly identify which section they are in. |

**Total average: 6/10**

**Specific HCI Defects:**

1. **Title field underweighted** (Row A): `project_code (3) | campus (3) | status (3) | title (3)` — all equal. Project Title is the primary human-readable identifier; it should visually dominate the row. Recommended: `title (6) | project_code (2) | campus (2) | status (2)` with title on top row.

2. **Strategic Alignment section cognitive overload**: Five consecutive cards (Narrative + SDG + RDP + SEA + LIKHA) for data that is entirely optional and infrequently filled during initial project creation. This section should be visually collapsed by default (v-expansion-panel) or reorganized to reduce empty-state bulk.

3. **Section overline headers too muted**: `text-overline text-grey-darken-1` at 10px does not provide strong enough visual anchoring between sections. Should be `text-subtitle-2 font-weight-semibold` with a distinct icon.

4. **"Add Custom Funding Source" sub-form is embedded in the Funding card body**: A divider + mini-form inside the card body increases density. Could be made collapsible with a toggle button.

5. **No visual completion indicator**: Users cannot see which sections have been filled. Tab completion indicators exist in the parent page but within the form itself there's no progress feedback.

**What must NOT change:**
- All field bindings and model refs (data model is correct)
- Strategic Alignment selectors (SDG/RDP/SEA/LIKHA) — ADR-017 locks these in
- CiBulletListInput usage (Objectives, Beneficiaries, Indicators)
- Card grid layout (Row A through Row G structure)
- `readOnly` prop behavior

**Recommended HCI changes (cosmetic/layout only):**
1. Reorder Row A: put `title` in a top full-width row; put `project_code`, `campus`, `status` in the second row within the same card
2. Upgrade section overline headers to `text-subtitle-2 font-weight-semibold text-grey-darken-2` with icon
3. Wrap the 4 Strategic Alignment selector cards (SDG/RDP/SEA/LIKHA) in a `v-expansion-panel` with title "Strategic Framework Alignment" — collapsed by default, opens to reveal the 2x2 grid. Narrative stays outside as full-width card.
4. Make "Add Custom Funding Source" inside Row C collapsible (default hidden, show via `v-btn` "Add another source")

---

### R-037: Progress & Milestones Tab — UX Assessment

**Topic:** HCI evaluation of the `value="progress"` tab in `detail-[id].vue`.

**Tab content (in order):**
1. Analytics header strip: physical%, financial%, milestones completed/total, latest report date — `v-card variant="tonal" color="primary"`
2. "Progress Reports" section header + `CiProgressReportTab` (read-only)
3. Divider
4. "Timelogs" section header + `CiTimelogsContainer` (read-only)
5. Divider
6. "Variation Orders" section header + `CiRevisionOrdersTable` (read-only)

**Critical finding — Tab name vs content mismatch:**
- Tab label: "Progress & Milestones" (`mdi-chart-line`)
- Actual milestone list: in the **Overview tab** (expansion panels), NOT here
- `filteredMilestones` computed, `milestoneSearch`, `milestoneStatusFilter` are defined in script and used in Overview panels
- The analytics strip shows `milestoneSummary.completed/total` but no milestone list appears
- **Users who click "Progress & Milestones" expecting to find the milestone list will not find it**

**UX Dimension Scores:**

| Dimension | Score | Finding |
|---|---|---|
| Readability | 7/10 | Section headers clear; analytics strip readable; typography consistent |
| Learnability | 4/10 | Tab name promises "Milestones" but milestones are in Overview. No guidance text for new users. No empty state for when all three sections are empty. |
| Accessibility | 6/10 | Color-only status in timelogs; analytics strip primary tonal may have contrast issues on projectors |
| Information Hierarchy | 5/10 | Progress Reports, Timelogs, and Variation Orders have equal visual prominence — no hierarchy. All three are section-headers + components. Priority is not communicated. |
| Visual Consistency | 7/10 | Section headers consistent across all three sections; analytics strip styled differently (tonal card) but that's intentional |

**Total average: 5.8/10**

**Key UX defects:**

1. **Discoverability failure (CRITICAL)**: Tab named "Progress & Milestones" but milestone list is in Overview tab. Users cannot find milestones here. Fix: either add a read-only milestone summary (count + latest milestone status chips) at top of this tab, or rename tab to "Progress Reports".

2. **No empty state guidance**: When CiProgressReportTab, CiTimelogsContainer, and CiRevisionOrdersTable all return no data, three empty component areas stack vertically with no guidance. Users cannot discover what data entry path to follow.

3. **Equal visual weight across all three sections**: Progress Reports is the primary formal record; Timelogs is supplementary operational detail; Variation Orders is administrative amendment history. Their visual hierarchy should reflect this importance ordering. Current: all three use identical section headers.

4. **Analytics strip is disconnected from milestones**: Shows `milestoneSummary.completed/total` in the strip, but no milestone detail is accessible from this tab. The number sits without context or drilldown.

**Recommended improvements (no data model changes):**
1. Add a compact "Milestone Summary" row below the analytics strip — status chip counts (Completed/In Progress/Delayed/Pending) + link to "View all milestones" that scrolls to the Overview expansion panel
2. Add `v-alert` guidance text when all three sections are empty: "No progress records yet. Use Edit Project → Progress tab to add WAR/MPR timelogs and progress reports."
3. Make Timelogs section collapsible by default (it is supplementary to formal Progress Reports)
4. Rename tab to "Progress Reports" to resolve the discoverability gap, OR keep tab name but add the milestone summary row

---

### R-038: Analytics "Cost This Period = 0" — Root Cause (CRITICAL BUG, Persistent)

**Topic:** `costIncurredThisPeriod` in the analytics component always renders 0, despite ZZZ-A adding the adapter mapping.

**Finding — Entity architecture:**
- `costIncurredThisPeriod` is a column on `construction_progress_reports` table (`ConstructionProgressReport.costIncurredThisPeriod`)
- It is NOT a column on `construction_projects` table (`ConstructionProject` has NO `costIncurredThisPeriod` property)
- The `findOne` service method returns: `{ ...project, milestones, progress_reports: progressReports }` — the progress reports are an array nested under `progress_reports`, sorted `reportDate DESC`
- The project root object itself has NO `cost_incurred_this_period` field

**Finding — Adapter (ZZZ-A residual bug):**
- ZZZ-A added `costIncurredThisPeriod: backend.cost_incurred_this_period ?? null` to `adaptProjectDetail()`
- `backend` = the project root object → `backend.cost_incurred_this_period` is ALWAYS `undefined`
- Therefore `costIncurredThisPeriod` remains `null` → analytics shows 0
- The ZZZ-A fix was correct in type-declaration but mapped the wrong source

**Correct source:**
```typescript
// backend.progress_reports is sorted DESC → [0] = latest report
const latestReport = (backend.progress_reports as any[])?.[0]
costIncurredThisPeriod: latestReport?.cost_incurred_this_period
  ? Number(latestReport.cost_incurred_this_period)
  : null
```

**Also validate `costIncurredToDate`:**
- `construction_projects.cost_incurred_to_date` DOES exist on the project entity (field `costIncurredToDate`) — this one is correctly sourced
- But the latest progress report's `costIncurredToDate` is the more current value (updated each report)
- Recommendation: Show BOTH — project entity value as "as-of" baseline; progress report value as "latest report" reference

**Analytics UI enhancement (source reference):**
- "Cost This Period" card should show: amount + `from [Report # / Date]` as supporting metadata
- When null/0: display "—" with note "No progress report filed"

---

### R-039: Audit Log Tab — Partially Built, Not Wired

**Topic:** `CiAuditLogPanel` component exists and is imported in detail-[id].vue, but no tab exposes it.

**Finding:**
- `CiAuditLogPanel.vue` is a complete, functional, filterable paginated audit table
- Imported in `detail-[id].vue` (`import CiAuditLogPanel from '~/components/coi/CiAuditLogPanel.vue'`)
- `loadAuditTrail()` function, `auditLogs`, `auditTotal`, `auditLoading`, `auditLoaded` refs all exist in script
- BUT: `DETAIL_TAB_ORDER = ['overview', 'progress', 'analytics', 'documents', 'team', 'others']` — 'audit' is absent
- No `v-tab` or `v-window-item` for audit exists in the template

**The component already handles:**
- Filterable by action (UPLOAD, CREATE, UPDATE, DELETE, SUBMIT, etc.)
- Paginated (props: `projectId`, `initialLimit`)
- Correct endpoint: `/api/activity-logs/CONSTRUCTION_PROJECT/${projectId}`

**Access control finding:**
- `isAdmin` computed exists in detail-[id].vue
- The audit tab should be gated by `isAdmin` (not DETAIL_TAB_PERM_MAP, which handles contractor-level permissions)
- Audit data is privileged — admin/superadmin access only

**Implementation gap (zero new code needed):**
1. Add `'audit'` to `DETAIL_TAB_ORDER` — but gate it separately from the tab loop
2. Add `v-tab` with `v-if="isAdmin"` and value `"audit"`
3. Add `v-window-item value="audit"` with `CiAuditLogPanel` inside (using existing props)
4. Remove `loadAuditTrail()` logic (legacy) — `CiAuditLogPanel` handles its own fetch

---

### R-040: Overview Tab — Expand/Collapse All Toggle

**Topic:** All 8 overview panels are open by default; no single-action toggle exists.

**Finding:**
- `overviewPanels = ref([0, 1, 2, 3, 4, 5, 6, 7])` — all panels open
- `v-expansion-panels v-model="overviewPanels" multiple` — index-based binding
- 8 panel groups exist in the overview (EEE-A architecture: one two-column panel per row)
- Toggle is trivial: `overviewPanels.value = allExpanded ? [] : [0,1,2,3,4,5,6,7]`

**Best placement:** Adjacent to the KI-A publication status strip (line ~1131), aligned right within the `d-flex` container. A small icon button (`mdi-expand-all` / `mdi-collapse-all`) is sufficient — no label needed for power users.

**Accessibility:** Use `aria-label="Expand all panels"` / `aria-label="Collapse all panels"` dynamically.

---

### R-041: CiScrollToTopFab — Overlap with Action Buttons

**Topic:** The FAB at `bottom: 24px; right: 24px` overlaps the "Next" and "Save Changes" buttons on edit and new pages.

**Finding:**
- `CiScrollToTopFab.vue`: fixed, bottom 24px, right 24px, z-index 1100
- Edit page action footer (line ~2640): `d-flex align-center justify-space-between` with "Save Changes" button at bottom-right
- New page also has [Previous] / [Next] / [Create] button row at bottom
- Both action footers are inside a scrollable `v-form`, NOT fixed — so they scroll away. The FAB appears on top of them during scroll when the footer is in view.
- The "Next" button on new.vue is at the bottom of the form body (not fixed) — after scrolling down, the FAB may overlap it if the footer is at viewport bottom
- HOWEVER: In practice, the action footer scrolls with content. Only when the form is short enough that the footer stays in view while FAB is visible does true overlap occur.

**Simplest fix (YAGNI):** Change FAB position from `bottom: 24px` to `bottom: 72px` — this clears the standard bottom action row height (~48px) with margin. No conditional logic needed.

**Alternative (better UX on mobile):** Move FAB to `left: 24px, bottom: 24px` (bottom-left) — avoids all button conflicts since action buttons are right-aligned. Consistent with Material Design guidance.

---

### R-042: new.vue vs edit-[id].vue — Synchronization Gaps

**Topic:** Post-ZZZ, new.vue has diverged from edit-[id].vue. Missing sections identified.

**What new.vue LACKS compared to edit-[id].vue:**

| Feature | edit-[id].vue | new.vue |
|---|---|---|
| Data Banking (notes fields) | ✅ GGG-E | ❌ Not present |
| Lessons Learned | ✅ ZZZ-D Ext | ❌ Not present |
| Site Observation Log | ✅ ZZZ-D Ext | ❌ Not present |
| `CiScrollToTopFab` | ✅ | ❌ Not present |
| Section guidance banners (per-tab) | ✅ some tabs | ❌ none in Others tab |

**What new.vue HAS that edit-[id].vue lacks:**
- `CiProjectGuideCard` at top (step indicator + completion %) — edit page has no equivalent
- Step progress bar (currentStepIndex, completionPercentage) — edit lacks this

**Others tab refs in new.vue that ARE present:** `statusUpdateRows`, `readinessDocRows`, `signatoryRows`, `incidentLogRows`, `riskRegisterRows`, `escalationRows` — same as edit. However `notesAdditional`, `notesSpecial`, `notesReferences`, `notesHistorical`, `notesMetadataRows`, `lessonsLearned`, `siteObservations` are not declared or used.

**Data Banking save payload in new.vue:** Line ~483: `project_notes_banking` is NOT included in the new project creation payload. The `status_updates` and `incident_log` are included but notes banking is absent.

---

### R-043: WAR/MPR Physical/Financial Fields — Status

**Topic:** Validate whether WAR/MPR can capture period-specific physical/financial accomplishment without violating ADR-019 or requiring a new migration.

**Finding:**
- `accomplishmentSummaryPercent` (entity) / `accomplishment_summary_percent` (DTO) already exists — added in GGG-F MPR migration (`Migration20260603200000_AddMprFieldsToTimelineEntries`)
- The entity column is nullable and label-neutral (not restricted to MPR)
- The DTO field has no WEEKLY/MONTHLY restriction
- Currently: WAR form shows Section 3 Physical Accomplishment as an info-only banner (no input)
- MPR form already has `accomplishment_summary_percent` input in Section 3

**For WAR (WEEKLY):** Add `accomplishment_summary_percent` input to WAR Section 3 Physical Accomplishment — label as "Physical Accomplishment This Week (%)". No migration needed, no DTO change needed, entity already has the column.

**For financial accomplishment:**
- WAR: No financial billing field makes domain sense for a weekly log (billing cycles are monthly/quarterly)
- MPR: Already has `original_contract_amount` and `revised_contract_amount`; could add `cost_incurred_this_period` directly from the MikroORM entity (but this is on progress_reports, not timeline entries)
- Recommendation: WAR financial → keep as info-only (not per-week billing). MPR financial → the existing fields cover it.

**Constraint preserved:** Progress Reports remain the official source of truth. WAR/MPR `accomplishmentSummaryPercent` is supplemental operational data, not the governance record.

---

### R-044: Strategic Alignment Narrative — maxlength Constraint

**Topic:** CiBasicInfoForm restricts `strategic_alignment` to 2000 characters.

**Finding:**
- `CiBasicInfoForm.vue` line 588-589: `counter` + `maxlength="2000"` on the strategic alignment textarea
- Database column: `@Property({ nullable: true, columnType: 'text' })` — PostgreSQL `TEXT` is unlimited
- Backend DTO: `@IsOptional() @IsString() strategic_alignment?: string` — no MaxLength validator
- The 2000-character limit is a UI-only constraint with no backend enforcement
- For a university infrastructure project strategic narrative, 2000 characters is often insufficient (policy language, multi-pillar alignment narratives)

**Fix:** Remove `maxlength="2000"` and `counter`; let `auto-grow` handle height. If a limit is desired for UX, increase to `maxlength="10000"` with counter as guidance only.

---

### R-045: Financial Summary — Analytics Tab Redesign

**Topic:** Current "Financial Summary by Fiscal Year" bar chart provides limited insight for PMO evaluators.

**Data available (validated):**
- `project.financials[]`: `fiscalYear`, `appropriation`, `obligation`, `disbursement`, `utilizationRate`, `disbursementRate`
- `project.totalContractAmount`: original contract cost
- `project.fundSource`: funding agency name
- Progress reports: `costIncurredToDate`, `costIncurredThisPeriod` (once R-038 fix applied)

**What PMO evaluators actually need:**
1. Utilization rate trend (obligation/appropriation by year) → bar chart is correct but needs labels
2. Disbursement rate (disbursement/obligation) → currently charted but missing summary total
3. Total appropriation vs. total obligation (quick health check) — missing from current view
4. Year-over-year movement (any variance) — not shown

**Enhancement (no backend changes):**
- Add a 3-card summary row above the bar chart: Total Appropriation | Total Obligation | Utilization Rate
- Rename "Financial Summary by Fiscal Year" to "FY Appropriation & Obligation Trend"
- Add disbursement rate to the bar chart series (currently may only show appropriation + obligation)
- Check `financialChart.series` in the component to see what's already charted

---

### R-046: Document Compliance Status — Analytics Tab Placement

**Topic:** Document compliance donut chart in analytics tab mixes compliance governance with financial analytics.

**Finding:**
- Analytics tab currently ends with: Cost Utilization bar → FY Bar Chart → Document Compliance Donut
- Document compliance measures whether required document types have been submitted/approved
- This is a governance/process metric, not a financial metric
- For a PMO Director viewing the analytics tab, mixing financial metrics (cost, utilization) with document compliance creates information hierarchy confusion

**Recommendation (scope-limited):**
- Do NOT remove the document compliance section from analytics entirely (it is useful for a single-view summary)
- Add a clear visual separator with a new section header: "Governance & Compliance" with `mdi-shield-check-outline` icon
- This separates the financial analytics from compliance metrics without code surgery

**No backend changes required.**

---

### R-047: Tab Navigation — Timeline-Driven Onboarding in new.vue (Research Only)

**Topic:** User requests research on a Vuetify Timeline component for step-based onboarding in new.vue.

**Current state:** new.vue already has a step progress system:
- `CiProjectGuideCard` at top (guide card with step count + completion %)
- Linear progress bar (`completionPercentage`)
- `currentStepIndex` computed
- `tabCompletion` computed tracking per-tab completion

**What's missing from the current system:**
- No visual representation of which tabs are completed vs remaining
- The progress bar only shows a percentage — no step labels
- Users cannot see "Project Profile ✅ → Schedule ✅ → Progress ⬜ → Personnel ⬜ → Documents ⬜ → Others ⬜" at a glance

**Vuetify `v-timeline` assessment:**
- `v-timeline` with `density="compact"` can show horizontal step indicators
- However, a horizontal stepper (`v-stepper`) is more semantically appropriate for sequential tab completion
- Vuetify 3 has `v-stepper` component — cleaner alternative to `v-timeline`
- Implementation: A compact `v-stepper` header (non-editable, display-only) above or replacing the tab headers in new.vue would show step completion status

**Finding:** The `v-stepper` approach would require replacing the `v-tabs + v-window` pattern in new.vue with `v-stepper-window` — significant refactor. Risk: edit-[id].vue uses the same tab structure and would drift further. YAGNI concern.

**Pragmatic recommendation:** Replace the `v-progress-linear` + `v-chip` in `CiProjectGuideCard` with a compact horizontal step indicator using `v-chip` chips with icons per tab (✅/⬜). Minimal change; no component swap.

---

### R-048: Guidance Banners — Standardization Audit

**Topic:** Per-tab guidance banners are inconsistent across pages.

**Finding by tab/page:**

| Tab | new.vue | edit-[id].vue |
|---|---|---|
| Basic Info | `CiProjectGuideCard` (list) | ❌ None |
| Schedule | ❌ None | ❌ None |
| Progress | ✅ Info alert (timelogs note) | ✅ 3 section descriptions + timelogs note |
| Personnel | ✅ Some (save awareness) | ✅ Alert on save flow |
| Documents | ❌ None | ❌ None |
| Others | ✅ "Milestones after save" alert | ❌ None |

**Recommendation:** Add concise `v-alert variant="tonal" density="compact"` guidance banner to each tab in both pages explaining purpose + expected actions. Short (2-3 bullet points max). The WAR/MPR banners already set the pattern (ZZZ-E/F). No backend changes.

---

### R-049: Analytics Tab — Stakeholder Intelligence Dashboard Evaluation

**Topic:** Validated visualization assessment. What is justified, what is not, and why.

**Data inventory (validated, actually available):**

| Data Source | Available In Component | Key Fields |
|---|---|---|
| `props.project.milestones[]` | ✅ Always | `name/title`, `status`, `progress`, `targetDate`, `actualDate` |
| `props.project.financials[]` | ✅ Always | `fiscalYear`, `appropriation`, `obligation`, `disbursement`, `utilizationRate` |
| `props.project.totalContractAmount` | ✅ | Contract value |
| `props.project.physicalProgress` | ✅ | Current % |
| `props.project.financialProgress` | ✅ | Financial % |
| `props.project.startDate`, `targetCompletionDate`, etc. | ✅ | Schedule dates |
| `(props.project as any).progress_reports[]` | ✅ via cast | `reportDate`, `percentageCompletion`, `plannedAccomplishment`, `slippage`, `costIncurredToDate`, `costIncurredThisPeriod`, `percentTimeElapsed` |
| Checklist data | ✅ via `/document-checklist` API | `submissionStatus` per document |

**Role-based stakeholder needs analysis:**

| Role | Primary Need | Currently Covered? |
|---|---|---|
| University President | Project status at a glance, schedule risk, budget exposure | ✅ ROW 1 stat cards (Physical%, Financial%, Days Remaining) |
| VP / PMO Directors | Progress trajectory, is the project accelerating or stalling? | ❌ Only snapshot, no trend |
| Infrastructure Managers | FY budget execution, milestone delivery rate | ✅ Partial (FY chart, milestone chart) |
| Project Engineers | Planned vs actual gap, period-by-period performance | ❌ Missing trend chart |
| Auditors | Cost incurred vs budget, document compliance | ✅ Cost utilization + compliance donut |

**Visualization-by-visualization assessment:**

**A. Donut Charts — Justified:**
1. **Milestone Completion Donut** ✅ JUSTIFIED
   - Source: `props.project.milestones[].status` (COMPLETED / IN_PROGRESS / DELAYED / PENDING)
   - Purpose: Proportion of milestones by health status — the spatial encoding of a donut conveys proportion faster than 4 separate numbers
   - Why better than stat card: 4-slice donut conveys the ratio of problems (delayed + pending) vs completed in a single glance
   - Why better than table: No detail needed at this level; the count and proportion matter, not individual names
   - Stakeholder value: President/Director sees "3 delayed out of 10" spatially in 2 seconds
   - Note: The existing `milestoneChart` (horizontal bar showing individual %) serves a different purpose (detail view); the donut is the summary view. Keep both.

2. **Physical Completion Donut** ❌ NOT JUSTIFIED
   - `physicalGauge` (radialBar) already exists and shows this. A separate donut would be redundant.

3. **Document Compliance %** ✅ ALREADY IMPLEMENTED (existing donut)
   - `complianceDonutChart` is correct and justified.

**B. Horizontal Bar Charts — Partially Justified:**
1. **Milestone Progress Bar** ✅ ALREADY IMPLEMENTED (`milestoneChart`)
   - Shows individual milestone progress %. Correct format. No change needed.
2. **Budget Breakdown** ❌ NOT JUSTIFIED
   - Only one contract amount per project; no budget line breakdown data exists.

**C. Stacked Bar Charts — Conditionally Justified:**
1. **Planned vs Actual Physical Accomplishment per Report Period** ✅ JUSTIFIED (NEW)
   - Source: `progress_reports[].reportDate` + `percentageCompletion` + `plannedAccomplishment`
   - Format: Grouped bar chart (not stacked) — actual vs planned per reporting period
   - Why better than table: The divergence gap is immediately visible; a table requires mental subtraction
   - Why better than stat card: Trend over time cannot be shown in a single stat
   - Stakeholder: PMO Directors identify when slippage began. Engineers identify which period caused the problem.
   - Condition: Only render when ≥ 2 progress reports exist with plannedAccomplishment values

2. **Original vs Revised Schedule** ❌ NOT JUSTIFIED AS CHART
   - Only 4 date values (original start, original end, revised start, revised end)
   - Already shown as stat cards in ROW 2. A chart adds no information.
   - A Gantt chart would require a library not currently installed (ApexCharts doesn't support Gantt natively).

**D. Radar Charts — NOT JUSTIFIED:**
- A radar requires ≥ 5 comparable dimensions. Available: Physical%, Financial Utilization%, Milestone%, Document Compliance%, Time Elapsed%. Five dimensions qualifies.
- However: Three of those (Physical%, Financial Utilization%, Milestone%) are already shown as gauges and stat cards. A radar at this granularity would DUPLICATE existing information.
- Risk profile radar: Risk register is unstructured JSONB free-text. No severity/probability numeric data for radar. Cannot fabricate.
- **Decision:** Skip radar charts. Data doesn't support a non-redundant implementation.

**E. Timeline Visualization — NOT JUSTIFIED (simple form):**
- 4 date points (original start/end, revised start/end) are shown as stat cards (ROW 2). This is sufficient.
- A visual timeline would require a dedicated Gantt or timeline library. ApexCharts has `rangeBar` which can simulate Gantt, but for only 2 ranges (Original + Revised), it adds engineering effort without proportionate value.
- **Decision:** Defer to YAGNI. The 4 date cards are sufficient for the current data density.

**F. Trend Charts — JUSTIFIED (NEW):**
1. **Physical Progress Trend** ✅ JUSTIFIED (highest priority)
   - Source: `progress_reports[]` sorted by `reportDate ASC` → `percentageCompletion` + `plannedAccomplishment`
   - Format: Area/Line chart (dual series: "Actual %" in primary color, "Planned %" in grey dashed)
   - Condition: Render when ≥ 2 progress reports exist
   - Why better than stat card: A single current % doesn't reveal momentum, acceleration, or trajectory
   - Why better than table: The slope is the key insight, not individual values
   - Stakeholder: This is the single most valuable missing visualization. PMO Directors and VPs need to see if the project is progressing or stagnant.

2. **Cost Incurred Trend** — LOWER PRIORITY, CONDITIONALLY JUSTIFIED
   - Source: `progress_reports[].costIncurredToDate` over time
   - Format: Area chart
   - Condition: Only when `costIncurredToDate` values are non-zero across ≥ 2 reports
   - Why: A cost burn rate visualization helps Infrastructure Managers plan remaining disbursements
   - Decision: Defer to Phase BBB — the Physical Progress Trend is higher priority and requires the same data infrastructure. Adding both in Phase AAA risks scope creep.

**Summary — What to implement in Phase AAA:**
1. ✅ **Milestone Completion Donut** — source: milestones[] — no new data needed
2. ✅ **Physical Progress Trend** — source: progress_reports[] via composable — requires data pipeline
3. ✅ **FY Totals KPI row** — already planned in AAA-H
4. ✅ **Governance & Compliance section separator** — already planned in AAA-H

**Implementation constraint — progress_reports in analytics component:**
- `CiProjectAnalyticsTab.vue` currently accesses `(props.project as any).progress_reports` via cast
- For the trend chart, the component should use `useCoiProgressReports(computed(() => props.projectId))` directly — self-contained, avoids prop drilling
- The composable is already available (`~/composables/useCoiProgressReports`)
- The composable fetches from `/api/construction-projects/${projectId}/progress-reports` — same endpoint used by the detail page

---

### R-050: Others Tab — Information Architecture Assessment

**Topic:** Evaluate current Others Tab container set; propose structured IA; identify redundancies; validate sync requirements.

**Current containers (detail page, post-ZZZ):**
1. Notes Banking card (always-visible, 2-col grid) — `project_notes_banking` JSONB
2. Lessons Learned card (conditional) — `project_notes_banking.lessonsLearned[]`
3. Site Observation Log card (conditional) — `project_notes_banking.siteObservations[]`
4. Legacy expansion panels (conditional on hasLegacyOthersData):
   - Status Updates → `project.statusUpdates[]`
   - Readiness Documents → `project.readinessDocuments[]`
   - Signatories → `project.signatories[]`
   - Incident Log → `project.incidentLog[]`
   - Risk Register → `project.riskRegister[]`
   - Escalation Records → `project.escalationRecords[]`

**Value assessment of each container:**

| Container | Long-term Value | Duplicates? | Verdict |
|---|---|---|---|
| Notes Banking | HIGH — institutional memory, references, instructions | No | KEEP — Section A |
| Lessons Learned | HIGH — institutional knowledge, future project benefit | No | KEEP — Section B |
| Site Observation Log | MODERATE — informal field notes | Partially (WAR timelogs for formal logs) | KEEP — Section B (merge as "Operational Notes") |
| Status Updates | LOW-MODERATE — informal status history, often superseded by Progress Reports | Progress Reports (formal) | KEEP with lower prominence — Section E |
| Readiness Documents | HIGH — tracks prerequisite document readiness (permits, MOA, clearances) | No — Attachments tab has files; this has STATUS tracking | KEEP — Section D (governance) |
| Signatories | MODERATE — project-level signatory records | WAR/MPR signatories are per-report; this is project-level | KEEP — Section D |
| Incident Log | HIGH — critical project-level incident record | WAR/MPR Concerns (per-report); this is project-level | KEEP — Section C |
| Risk Register | HIGH — forward-looking risk management | No | KEEP — Section C |
| Escalation Records | HIGH — governance accountability trail | No | KEEP — Section C |

**Finding — No containers should be removed.** All 9 containers provide distinct value. The problem is not redundancy — it's **lack of grouping and visual hierarchy**.

**Root cause of the UX problem:**
- 9 containers at the same visual level create no information hierarchy
- Each expansion panel/card looks the same regardless of urgency or governance weight
- Users cannot quickly locate the most governance-critical information (Risk, Incidents, Escalations)

**Proposed Information Architecture:**

**Section A: Project Notes & References** (always-visible, 2-col grid — ALREADY IMPLEMENTED)
- Additional Notes, Special Instructions, Project References, Historical References, Custom Metadata
- Container: Full-width card with 2-column inner layout
- Status: ✅ Done (ZZZ-D)

**Section B: Institutional Knowledge** (always-visible with CTA if empty)
- Lessons Learned, Site Observation Log
- Container: Two side-by-side cards OR a single tabbed card
- Rationale: Both are "what we learned / observed" during the project. Grouping them as "Institutional Knowledge" differentiates from the administrative records.
- CTA when empty: "Document lessons from this project for future reference"

**Section C: Risk, Incidents & Escalations** (conditional on data)
- Risk Register, Incident Log, Escalation Records
- Container: `v-expansion-panels` with consistent header style; RED/WARNING color coding
- Header: "Risk & Incident Management" with `mdi-shield-alert-outline` icon
- Purpose: These are the highest-urgency governance records. Elevating them as a named group signals their priority.
- Empty state: Don't show section header if all three are empty

**Section D: Administrative Records** (conditional on data)
- Status Updates, Readiness Documents, Signatories
- Container: `v-expansion-panels` with blue/info color
- Header: "Administrative Records" with `mdi-folder-text-outline` icon
- Purpose: Process compliance and administrative tracking. Lower urgency than Section C.

**Grid layout approach:**
- Section A: Full-width always-visible card (2-col internal)
- Section B: Two `v-col cols="12" md="6"` side-by-side (Lessons Learned | Site Observations)
- Section C & D: Sequential full-width expansion panels, grouped under header

**Sync validation (across 3 pages):**

| Section | edit-[id].vue | new.vue | detail-[id].vue |
|---|---|---|---|
| A: Notes Banking | ✅ Data Banking card | ❌ (AAA-E fix) | ✅ ZZZ-D |
| B: Lessons Learned | ✅ ZZZ-D Ext | ❌ (AAA-E fix) | ✅ ZZZ-D Ext |
| B: Site Observations | ✅ ZZZ-D Ext | ❌ (AAA-E fix) | ✅ ZZZ-D Ext |
| C: Risk/Incidents | ✅ Risk Register, Incidents, Escalations cards | ✅ All 3 present | ✅ Expansion panels |
| D: Admin Records | ✅ Administrative Records (collapsed expansion) | ✅ Partial | ✅ Expansion panels |

**Key structural change needed:**
- Detail page: Group Section C cards under a named "Risk & Incident Management" header card
- Detail page: Group Section D cards under a named "Administrative Records" header card
- Section B: Convert from "two sequential full-width cards" to "two-column side-by-side layout"
- No data model changes; no backend changes; no adapter changes

**Empty state standard:**
- Section A (Notes Banking): Always visible — CTA to edit when empty (DONE, ZZZ-D)
- Section B (Institutional Knowledge): Show both cards always — each with its own "Add [type] via Edit Project →" CTA when empty
- Section C, D: Header + content only when at least one sub-section has data

---

### R-051: Analytics Tab — `project.financials[]` Always Empty (Root Cause)

**Topic:** FY Appropriation & Obligation Trend chart shows no data; `fyTotals` row always shows ₱0.

**Finding:**
- `ConstructionProjectFinancial` entity was archived NI (2026-05-21) — the comment in the service explicitly states: "ConstructionProjectFinancial removed; chronological history now lives in construction_progress_reports."
- `findOne()` returns `{ ...project, milestones, progress_reports: progressReports }` — no `financials` key.
- `adaptProjectDetail()` maps `backend.financials || []` → `[]` always.
- ALL computeds that depend on `project.financials[]` (`financialChart`, `fyTotals`, `fyObligationRate`, `fyUtilizationGauges`) always operate on an empty array → produce 0/empty output.

**Impact:**
- `FY Appropriation & Obligation Trend` chart is permanently empty. Cannot be fixed without a new financial table for COI, which contradicts the NI decision.
- `fyTotals` KPI row (AAA-H) always shows ₱0.
- `fyObligationRate` always shows "—".

**Validated data that IS available:**
- `progress_reports[]` sorted DESC: `reportDate`, `percentageCompletion`, `plannedAccomplishment`, `costIncurredToDate`, `costIncurredThisPeriod`, `percentTimeElapsed`, `slippage`
- `project.totalContractAmount`: contract value from project entity
- `project.costIncurredToDate`: project-level cumulative cost
- `project.financialProgress`: manually set % on project entity

**Correct fix:** Remove the `FY Appropriation & Obligation Trend` bar chart and the `fyTotals` KPI row. Replace with a **Cost Progression line chart** derived from `progress_reports[].costIncurredToDate` over time — data that actually exists and changes. This shows burn rate trend which is more useful than an always-empty FY breakdown.

---

### R-052: Analytics Tab — Milestone Charts Should Be Removed

**Topic:** User requires milestone charts removed from analytics tab.

**Finding:**
- Milestone CRUD was removed from the edit page (ADR-011, DDD-E). Milestones cannot be added or edited by users.
- `milestoneChart` (horizontal bar — per-milestone progress%) and `milestoneSlippageChart` (histogram) both depend on `project.milestones[]`.
- `milestoneDonutChart` (AAA-K, status proportions) also uses `project.milestones[]`.
- Since users cannot manage milestone data, displaying milestone analytics is misleading — it suggests actionable data when the underlying management is disabled.
- `hasMilestoneData` will typically be false for new projects; for older projects with legacy milestone data, the charts appear but users cannot correct them.

**Decision:** Remove all three milestone chart computeds and their template blocks from `CiProjectAnalyticsTab.vue`. Also remove `milestoneCompletionRate` computed if only used there.

---

### R-053: WAR/MAR Financial Accomplishment — New Migration Required

**Topic:** User requests WAR/MAR (timelogs) to capture financial billing/accomplishment per period. Currently no financial billing field exists on `construction_timeline_entries`.

**Entity audit:**
- `construction_timeline_entries` has: `accomplishmentSummaryPercent`, `originalContractAmount`, `revisedContractAmount`, `percentTimeElapsed` (MPR columns)
- No column for: `billing_amount_this_period`, `financial_accomplishment_percent`, `payment_amount`

**DTO audit:** No `billing_amount_this_period` or `financial_accomplishment_percent` field in `CreateTimelineEntryDto`.

**ADR history:** ADR-016 (timelog physical/financial % stays in Progress Reports) was superseded by ADR-019 (WAR/MPR data in timeline_entries). ADR-019 added physical fields but not financial billing. Phase AAA-F added `accomplishment_summary_percent` input for physical — but NO financial billing field was added.

**Required for WAR financial capture:**
- New migration: `billing_amount_this_period DECIMAL(15,2)` + `financial_accomplishment_percent DECIMAL(5,2)` on `construction_timeline_entries`
- Entity: two new properties
- DTO: two new optional fields
- Service: persist in create/update
- Frontend form: two new inputs in both WAR and MPR sections

**Governance preserved:** Progress Reports remain the official record. WAR/MAR `billing_amount_this_period` is an operational log for site-level tracking, not the governance source.

---

### R-054: new.vue vs edit-[id].vue — Structural Gap Assessment

**Topic:** Validate whether the Schedule and Progress tabs differ between new.vue and edit-[id].vue, and whether the difference is intentional or a defect.

**Schedule tab:**
- **new.vue**: Has Primary Dates + Revision Order date fields (original/revised start/end) + MOV upload staging. Does NOT have `CiRevisionOrdersTable`.
- **edit-[id].vue**: Has Primary Dates + Revision Order date fields + **`CiRevisionOrdersTable` component** with full CRUD.
- **Assessment**: The absence of `CiRevisionOrdersTable` in new.vue is ARCHITECTURALLY CORRECT. The table requires `projectId` to fetch from the API — a project that doesn't exist yet has no ID. The date fields (original/revised start/end) serve as the initial entry; after saving, users add formal Variation Order records in edit page. No change needed.

**Progress tab:**
- **new.vue**: Shows a simplified "initial snapshot" form — Physical Status card (physical_progress + as_of_date) + Financial Status card (cost_incurred_to_date, financial_progress, date_completed). This writes directly to `construction_projects` entity fields.
- **edit-[id].vue**: Shows `CiProgressReportTab` (full progress reports CRUD) + `CiTimelogsContainer` (full WAR/MPR CRUD).
- **Assessment**: This IS a genuine inconsistency. The new project page shows simplified snapshot fields; the edit page shows full report management. A user creating a project expects to see the same tab structure they will work with in edit. HOWEVER, `CiProgressReportTab` requires `projectId` to call `/api/construction-projects/${projectId}/progress-reports` — which doesn't exist during project creation.
- **Correct fix (YAGNI)**: Replace the simplified "initial snapshot" form in new.vue Progress tab with `CiProgressReportTab` showing an empty state + note: "Save the project first to add progress reports." Keep the physical_progress/financial_progress/cost_incurred_to_date initial fields in the **Basic Info** form or remove them. The actual progress data is tracked through progress reports post-creation.

**Others tab:**
- **new.vue**: Has Incidents, Risk Register, Escalations, Administrative Records (collapsed), Data Banking, Lessons Learned, Site Observations. Matches edit-[id].vue.
- **edit-[id].vue**: Same sections. ✅ Synchronized (AAA-E fixed this).

---

### R-055: Others Tab — Containers to Remove

**Topic:** Validate which Others tab containers should be removed per stakeholder requirement.

**User instruction:** Remove Site Observation Log and other non-essential records. Retain: Notes Banking, Risk Register, Escalation Records, Administrative Records, Lessons Learned, Project References, Historical References.

**Containers NOT in the retain list (candidates for removal):**
1. **Incident Log** (`project.incidentLog[]`): Not in retain list. Overlaps with WAR/MPR Project Concerns (ZZZ-G). Removing from Others tab detail view is correct; the edit form can also be removed.
2. **Site Observation Log** (`project_notes_banking.siteObservations[]`): Explicitly listed for removal.

**Containers retained:**
- Notes Banking (Section A) ✅
- Risk Register ✅
- Escalation Records ✅
- Administrative Records (Status Updates, Readiness Documents, Signatories) ✅
- Lessons Learned ✅
- Project References and Historical References (inside Notes Banking) ✅

**Database impact:**
- Removing Site Observations from the UI: zero DB change — data remains in `project_notes_banking.siteObservations` JSONB (no column drop). Just stop rendering/editing it.
- Removing Incident Log from the UI: zero DB change — `incident_log` JSONB remains on entity. Stop rendering/editing.

**Others tab revised IA (supersedes AAA-L partial implementation):**
- Section A: Project Notes & References (always visible)
- Section B: Institutional Knowledge — **Lessons Learned only** (single full-width card; Site Observations removed)
- Section C: Risk & Escalation Management — Risk Register + Escalation Records (remove Incident Log)
- Section D: Administrative Records — Status Updates + Readiness Documents + Signatories

---

### R-056: Cost This Period — Persistent Failure Root Cause (DEFINITIVE)

**Topic:** `costIncurredThisPeriod` in Analytics tab always renders 0 despite `cost_incurred_this_period` having valid data in the latest Progress Report. This persisted through AAA-A fix.

**Confirmed data flow:**

```
createProgressReport() → MikroORM entity (camelCase properties)
→ mirrorLatestReportToProject() updates construction_projects.cost_incurred_to_date
→ findOne() returns { ...rawSqlProject, milestones, progress_reports: ormEntities }
→ adaptProjectDetail() reads backend.progress_reports[0].cost_incurred_this_period
→ UNDEFINED because MikroORM entity uses camelCase: costIncurredThisPeriod
→ costIncurredThisPeriod = null → Analytics renders "—" or "₱0"
```

**Root cause confirmed:**
The `findOne` service constructs the return object by spreading a raw-SQL project object with ORM entity arrays:
```typescript
return { ...project, milestones, progress_reports: progressReports }
```
- `project` = raw SQL result → **snake_case** field names (e.g., `cost_incurred_to_date`)
- `progressReports` = MikroORM entities → **camelCase** property names (e.g., `costIncurredThisPeriod`, `reportDate`)

The adapter's `BackendProjectDetail.progress_reports` interface declares snake_case fields, but at runtime the objects have camelCase fields. Therefore:
- `backend.progress_reports[0].cost_incurred_this_period` → **always `undefined`**
- `backend.progress_reports[0].report_date` → **always `undefined`** (it's actually `reportDate`, a JavaScript `Date` object)

**Secondary finding — `costIncurredToDate` is correctly sourced:**
`mirrorLatestReportToProject()` updates `construction_projects.cost_incurred_to_date` from the latest report's `costIncurredToDate`. The project raw SQL returns this as `cost_incurred_to_date` (snake_case) → adapter correctly maps it to `costIncurredToDate`. So the Cost To Date card CAN be correct if `mirrorLatestReportToProject()` was called (it is called after every report create/update).

**Fix:** In `adaptProjectDetail()`, read both camelCase (runtime MikroORM) and snake_case (interface declaration fallback):
```typescript
// In costIncurredThisPeriod mapper:
const r0 = backend.progress_reports?.[0] as any
const val = r0?.costIncurredThisPeriod ?? r0?.cost_incurred_this_period
return val != null ? Number(val) : null

// In latestProgressReportDate mapper:
const d = r0?.reportDate ?? r0?.report_date
return d ? (d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10)) : null
```

**No backend change required.** Pure adapter fix.

---

### R-057: Others Tab — Current Structure Assessment

**Topic:** Others tab in edit-[id].vue current section layout and UX deficiencies.

**Current layout (edit-[id].vue):**
```
v-row
  LEFT col md=7:
    Risk Register card (with rows: likelihood/impact/status + description + mitigation)
  RIGHT col md=5:
    Escalation Records card
    Administrative Records (collapsed v-expansion-panel: status updates + readiness docs + signatories)
    Data Banking card (notesAdditional, notesSpecial, projectReferences, historicalReferences, customMetadata)

  RIGHT col (continued after Data Banking card):
    Lessons Learned card
```

**UX deficiencies identified:**
1. **No section headers** — Risk Register and Escalation Records appear as flat cards with no governance grouping header
2. **Asymmetric layout** — Left column (7 cols) shows only Risk Register; right column (5 cols) is overfull with 4 items
3. **Data Banking appears disconnected** — placed inside the right column after administrative records; no visual distinction from admin records
4. **Lessons Learned appended after Data Banking** — wrong placement; it should be distinct as institutional knowledge
5. **Administrative Records collapsed by default** — important governance data is hidden
6. **No equal-height containers** — sections grow independently; page looks unbalanced

**Required restructure:**
Per operator's IA (4 sections):
- Section A: Project Governance (Risk Register + Escalation Records)
- Section B: Administrative Management (Status Updates + Readiness Documents + Signatories)
- Section C: Project Knowledge Bank (Additional Notes + Special Instructions + Project References + Historical References + Custom Metadata)
- Section D: Lessons Learned

---

### R-058: Timelog MOV Integration — Feasibility Assessment

**Topic:** Validate whether WAR/MPR timelogs can automatically create repository documents in the Attachments tab.

**Available infrastructure (validated):**
- Repository type codes `SD_ECO_009` (Weekly Accomplishment Report) and `SD_ECO_010` (Monthly Progress Report) exist in `construction_document_types` — seeded in `Migration20260527020000_ExpandDocumentTypeTaxonomy`
- `CiAttachmentHub.persistDoc()` uploads to `/api/construction-projects/${projectId}/documents` with `documentType` parameter
- `CiAttachmentHub.submitLink()` posts to same endpoint with `externalLink` and `documentType: 'link'`... **wait**: the `documentType` for links is hardcoded as `'link'` — this means links don't associate with specific type codes in the current implementation. This is a gap that needs a backend fix.
- `CiTimelogsContainer` has access to `props.projectId`
- The `api` composable is available in `CiTimelogsContainer`

**Integration approach (frontend-only, no new backend endpoints):**
1. Add `movFile` (File | null) and `movLink` (string) to the timelog form `blank()` in `CiTimelogsContainer`
2. In the `save()` function, after the timelog PATCH/POST succeeds, if `movFile` or `movLink` is set:
   - For file: call `api.upload('/api/construction-projects/${props.projectId}/documents', formData)` with `documentType = form.entry_type === 'MONTHLY' ? 'SD_ECO_010' : 'SD_ECO_009'`, description = `${entry_type === 'MONTHLY' ? 'MPR' : 'WAR'} — ${form.war_number || form.mpr_number || form.title}`
   - For link: call `api.post('/api/construction-projects/${props.projectId}/documents', { documentType: 'SD_ECO_009' or 'SD_ECO_010', externalLink, title, description })`

**Backend gap for links:** The current link API uses `documentType: 'link'` hardcoded, ignoring the actual type code. This means external links can't be filed under `SD_ECO_009` / `SD_ECO_010` without a backend fix. The `documents` controller needs to accept `documentType` for external links (not hardcode 'link').

**Audit trail approach:**
- The document `description` field captures source: `"Submitted from WAR timelog — WAR-2026-003"`
- The existing activity log already tracks uploads per the `UPLOAD` action
- The `description` field provides the reference without any schema changes

**No new migration needed.** `SD_ECO_009` and `SD_ECO_010` type codes already exist.

**Backend change required (minimal):** The documents controller currently overwrites `documentType` with `'link'` for external links. It should use the provided `documentType` from the request body (or default to `'link'` if not provided). This is a 1-line service fix.

**Validated implementation:**
- `CiTimelogsContainer` can post directly to the document API after saving a timelog
- File uploads: no backend change needed
- External links: 1-line backend fix to respect the `documentType` from request
- Repository auto-population: immediate — documents with `SD_ECO_009`/`SD_ECO_010` typeCode appear in the WAR/MPR repository cards in the Supporting Documents tab

---

### R-059: Phase CCC Verification — What Was Delivered vs What Remains

**Topic:** Gap analysis of Phase CCC implementation against the approved plan.

**CCC-A (costIncurredThisPeriod adapter fix):** ✅ CORRECTLY IMPLEMENTED.
- Adapter reads `r0?.costIncurredThisPeriod ?? r0?.cost_incurred_this_period` — dual camelCase/snake_case
- `latestProgressReportDate` handles JS Date objects correctly
- No further changes needed

**CCC-B (Others tab 4-section UX):** ✅ IMPLEMENTED in edit-[id].vue and new.vue.
- Section A: Project Governance (Risk + Escalation) ✅
- Section B: Administrative Management (Status/Readiness/Signatories) ✅
- Section C: Project Knowledge Bank (Data Banking) ✅
- Section D: Lessons Learned ✅

**⚠️ GAP — detail-[id].vue Others tab NOT updated to match:**
- detail-[id].vue still uses the OLD AAA-L/BBB-B structure: Notes Banking first, then Lessons Learned, then "Risk & Escalation Management", then "Administrative Records"
- The section names, order, and banners don't match the CCC-B IA in edit/new
- No guidance banners with descriptive text in the detail page Others tab
- Risk Register is in "Risk & Escalation Management" (detail) vs "Project Governance" (edit)
- No section banners with purpose descriptions in either edit or new page

**CCC-C (Timelog MOV integration):** ✅ BACKEND LOGIC CORRECT. MINOR UX GAPS remain:
- Upload (sm=6) and link fields (separate row) are not side-by-side as planned
- No formal section banner (`v-alert` with description)
- No "Uploaded Evidence List" section (showing MOV docs already filed)
- No "Repository Reference Summary"
- Layout does not match the Row 1 / Row 2 / Row 3 plan specification

---

### R-060: Analytics Tab — Visualization Hierarchy Gaps

**Topic:** Current analytics tab treats Cost Utilization and Cost Incurred Progression equally (both `md="6"`). All visualizations lack section banners and data source labels.

**Current state:**
- `Cost Utilization`: `md="6"` half-width → a simple progress bar + spent/remaining text. No banner. No data source label.
- `Cost Incurred Progression`: `md="6"` half-width → area chart. No banner. No data source label.
- `Physical Progress Trend` (AAA-J): full `cols="12"` → area/line chart. Has a title div but no formal `v-alert` banner. No data source label.
- `Financial Summary` row (6 KPI cards): no section banner. No data source label.
- `Performance Indicators` section: has `v-alert` banner ✅
- `Project Snapshot` row: has `v-alert` banner ✅
- `Project Dates` + `Project Cost` rows: have `v-alert` banners ✅
- `Governance & Compliance`: has `v-alert` banner ✅

**Required hierarchy change:**
- Cost Utilization = a single ratio (%) → should be a compact KPI card or small radial gauge, NOT half the screen
- Cost Incurred Progression = financial trend data → should be full-width or ≥ 8/12 columns to communicate progression clearly
- ALL visualizations need: `v-alert` section banner + data source chip/label

**Data sources to label (validated):**
| Visualization | Validated Source |
|---|---|
| Physical Progress Trend | `construction_progress_reports.percentageCompletion` / `plannedAccomplishment` |
| Cost Incurred Progression | `construction_progress_reports.costIncurredToDate` |
| Financial Summary cards | `construction_projects.contract_amount`, `construction_progress_reports` (latest) |
| Performance Indicators (6-stat) | `construction_progress_reports` + project dates |
| Physical/Financial gauges | `construction_projects.physicalProgress`, `construction_progress_reports` |
| Document Compliance donut | `construction_document_checklist` (API endpoint) |
| Cost Utilization bar | `construction_projects.costIncurredToDate`, `contract_amount` |

---

### R-061: detail-[id].vue Others Tab — Structural Mismatch with Edit/New

**Topic:** The detail page Others tab uses different section structure than the CCC-B restructured edit/new pages.

**detail-[id].vue current structure (post-AAA-L/BBB-B):**
1. Notes Banking card (always visible, 2-col grid) — Section A
2. Lessons Learned card (full-width, always visible) — Section B Institutional Knowledge
3. "Risk & Escalation Management" header + expansion panels (Risk + Escalation) — Section C
4. "Administrative Records" header + expansion panels (Status/Readiness/Signatories) — Section D

**edit-[id].vue current structure (CCC-B):**
1. Section A: Project Governance header + Risk Register + Escalation (side-by-side cards)
2. Section B: Administrative Management header + Status/Readiness/Signatories (3-col)
3. Section C: Project Knowledge Bank header + Data Banking card
4. Section D: Lessons Learned header + Lessons card

**Structural mismatch:**
- Section A in detail = Notes Banking (Knowledge Bank equivalent)
- Section A in edit = Project Governance (Risk + Escalation)
- Section order is reversed between pages
- Guidance banners absent in BOTH pages (edit has section headers but no descriptive text/banners)
- detail-[id].vue expansion panels hide Risk/Escalation/Admin data by default (poor visibility)

**Required alignment:**
- detail-[id].vue must follow the SAME 4-section order as edit/new:
  1. Section A: Project Governance (Risk + Escalation) — expansion panels in detail (read-only)
  2. Section B: Administrative Management (Status/Readiness/Signatories) — expansion panels
  3. Section C: Project Knowledge Bank (Notes Banking 2-col read-only card)
  4. Section D: Lessons Learned (always visible read-only card)
- Add guidance banners to both edit/new (section description text under section headers)

---

### R-062: Timelog MOV Section — UX Layout Gaps

**Topic:** CCC-C MOV section is functional but has layout and UX gaps vs the planned Row 1 / Row 2 / Row 3 structure.

**Current state (implemented):**
```
Row: section header div + description paragraph
Row: v-col sm=6 → file-input
Row: v-row dense → v-col sm=7 link field | v-col sm=5 link title
Row: conditional "MOV will be filed" message
```

**Gaps vs plan:**
1. **No section banner** (`v-alert` with title + purpose description) — just a plain `div` header
2. **Upload and link are NOT side-by-side** — upload in its own col, link below
3. **No "Uploaded Evidence List"** — no display of MOV documents already filed for this project
4. **No "Repository Reference Summary"** — no note showing which repository the file goes to (dynamic: WAR→SD_ECO_009 / MPR→SD_ECO_010)
5. Missing formal Row 1 (upload + link side-by-side) / Row 2 (status feedback) / Row 3 (repository summary) structure

**Required layout:**
```
v-alert banner (icon + title + description)

Row 1: [Upload Files col-12 sm-6] [External Link + title col-12 sm-6]

Row 2: Status chip (when file/link selected)

Row 3: Repository Reference Summary card
  "Will be filed to: Supporting Documents → Reports & Monitoring → [WAR/MPR repo name]"
```

---

### R-063: Phase DDD Verification Report

**Topic:** Validation of Phase DDD implementation against approved plan.

| Step | Status | Finding |
|---|---|---|
| DDD-A: Cost Utilization compact KPI | ✅ Correct | `md="4"`, progress bar, spent/remaining, source note |
| DDD-A: Cost Incurred Progression full-width | ✅ Correct | `md="8"` with `v-alert` banner + data source chip |
| DDD-A: Physical Progress Trend upgraded banner | ✅ Correct | `v-alert` with description + data source |
| DDD-A: Financial Summary data source line | ✅ Correct | Source attribution line added |
| DDD-B: detail-[id].vue section reorder | ✅ Correct | A=Governance / B=Admin / C=Knowledge / D=Lessons |
| DDD-B: Guidance banners in all 3 pages | ✅ Correct | Description `<p>` added under all section headers |
| DDD-C: MOV section `v-alert` banner | ✅ Correct | `type="info"` banner with purpose + destination |
| DDD-C: Upload + link side-by-side Row 1 | ✅ Correct | Both `sm="6"` columns |
| DDD-C: Row 2 success confirmation | ✅ Correct | `v-alert type="success"` with file name |
| DDD-C: Row 3 repository destination | ✅ Correct | `v-card tonal` with destination chip |

**Phase DDD is fully implemented. No regressions detected.**

---

### R-064: Document Compliance Visualization — Stakeholder Value Gap

**Topic:** The current compliance donut chart groups all checklist items by `submissionStatus` without context. PMO stakeholders need group-level compliance insight.

**Current state:**
- Single donut chart with slices: NOT_SUBMITTED / SUBMITTED / UNDER_REVIEW / APPROVED / REJECTED
- Metric: `X of Y documents approved`
- Data source: `GET /api/construction-projects/:id/document-checklist`
- Checklist items include: `submissionStatus`, `documentType.groupCode`, `documentType.typeLabel`

**Available data in checklist response (validated):**
- `documentType.groupCode`: KEY_DOCS, SD_ORDERS, SD_REPORTS, SD_CERTS, ECO_FORMS, CPES_SD, etc.
- `documentType.typeLabel`: human-readable document name
- `submissionStatus`: NOT_SUBMITTED | SUBMITTED | UNDER_REVIEW | APPROVED | REJECTED

**What stakeholders actually need:**
1. **Overall compliance rate** (approved / total) → already shown as "X of Y approved"
2. **Which document GROUPS are complete vs incomplete** → NOT currently shown
3. **Which specific documents are missing** → NOT currently shown

**Better visualization — Compliance Scorecard (group-level bars):**
Replace the single donut with a compact scorecard grid. For each group:
- Group name chip (color-coded by group)
- Progress bar: `approved_in_group / total_in_group * 100`
- Count chip: `N/M approved`
- Color: green if 100%, warning if partial, error if 0%

This requires grouping the checklist array by `documentType.groupCode` on the frontend — **no backend change needed**.

**Keep existing compliance donut as a companion summary**, or replace entirely with the scorecard. Scorecard is more actionable for stakeholders because it identifies WHICH category is failing.

---

### R-065: Risk Register — Root Cause Analysis for Non-Rendering

**Topic:** Risk Register data reportedly fails to render after save operations.

**Backend KY-B1 filter finding (definitive root cause):**

In `construction-projects.service.ts`, the patch function at line 913-918:
```typescript
const fields = Object.keys(dto).filter(
  (k) =>
    dto[k] !== undefined &&
    !(Array.isArray(dto[k]) && (dto[k] as any[]).length === 0) &&  // ← PROBLEM
    k !== 'assigned_user_ids' &&
    k !== 'assignments',
)
```

**This filter EXCLUDES any empty array from the UPDATE SQL.**

The consequence:
- If `risk_register: []` (user cleared all entries) → field is excluded from UPDATE → old JSONB data persists in DB → after re-fetch, old entries reappear
- If `risk_register: [{ risk: '...', ... }]` (user added entries) → field IS included in UPDATE → data saves and renders correctly ✅

**This is the root cause of the non-rendering issue**: Users who add risk register entries and save will see them correctly. But users who try to DELETE all risk register entries and save will find entries persist (the update is silently dropped). This is confusing but differs from "newly added entries not rendering."

**If the operator reports newly-ADDED entries not rendering** — this is a separate issue: likely a page-cache problem where the detail page doesn't re-fetch after the edit page save. This is an SPA routing issue, not a data issue.

**Comment inconsistency (line 745 in edit-[id].vue):**
```typescript
// LD-A: send explicit arrays (including empty []) so clears propagate to DB
status_updates: statusUpdateRows.value,
```
This comment says "empty arrays should clear data" but the backend KY-B1 filter prevents this for ALL array fields including `risk_register`. The comment is outdated/incorrect.

**Fix options:**
1. **Frontend fix**: Before saving, if `riskRegisterRows.value` is empty AND backend has existing data, send `null` instead of `[]` (null is not excluded by KY-B1 filter). But `null` for a JSONB array is semantically different from `[]`.
2. **Backend fix**: Change the KY-B1 filter to NOT exclude empty arrays for the Others tab fields (status_updates, risk_register, escalation_records, readiness_documents, signatories). Allow `[]` to clear them explicitly.
3. **Backend fix** (safer): Add a separate field list for "fields that CAN be cleared to empty" and only apply KY-B1 to fields where `[[]]` double-wrapping is possible.

**Recommended fix**: Backend option 3. Remove the `risk_register`, `escalation_records`, `status_updates`, `readiness_documents`, `signatories` from the KY-B1 exclusion so empty arrays CAN clear these fields. These are simple scalar arrays that don't suffer from `[[]]` corruption (that bug was specific to nested document arrays).

---

### R-066: Others Tab — UI Polish Gaps Remaining Post-DDD

**Topic:** DDD-B restructured the Others tab sections but several micro-UX issues remain.

**Detail page gaps:**
1. **Empty state for Section A (Governance) and Section B (Admin):** When both Risk Register AND Escalation Records are empty, the detail page shows "No governance records." — a plain paragraph. This is visually minimal but acceptable for the detail page (read-only).
2. **Expansion panels in detail page are collapsed by default:** Data exists but is hidden. Users must click to expand each panel.

**Edit/New page gaps (Readiness Documents layout - B3):**
Current compact layout:
```
v-text-field (Type) → full row
v-row dense: [v-select Status col-9] [delete btn col-3]
v-text-field (Remarks) → full row
```
Problems:
- Status dropdown is `col-9` which makes it very wide for a 3-option select
- Delete button is `col-3` which is narrow and may appear disconnected
- The 3-field layout per entry is dense but not terrible

**Correction**: Better layout is a single row with all fields:
```
[Type col-12 sm-5] [Status col-6 sm-3] [delete btn col-2 sm-1] + separate Remarks row
```
This gives all fields equal visual weight.

**Edit/New page empty state quality:**
- Risk Register empty state: "No risks logged. Add project risks with likelihood and mitigation plan." — adequate ✅
- Escalation Records empty state: "No escalation records." — minimal, adequate ✅
- Data Banking: no empty state (auto-grow textareas are always visible) — correct ✅
- Lessons Learned empty state: "No lessons recorded..." — adequate ✅

---

## Dashboard Modernization Research (GGG / HHH)

### R-067: COI Index Dashboard — Current Implementation Audit

**Topic:** Full audit of `pmo-frontend/pages/coi/index.vue` against portfolio dashboard requirements

**Implemented (working):**
- 6 KPI stat cards: Completed, Ongoing, Delayed, Pending Review, Total Budget, Avg Progress
- Hero strip: portfolio budget headline + progress bar + status chips + attention count chip
- Budget Utilization progress bars (appropriation / obligation % / disbursement %)
- Projects by Campus progress bars
- Needs Attention list (delayed ONGOING + PENDING_REVIEW + REJECTED projects, max 5)
- Filter bar: search + status + campus + date range + advanced filters (project code, original/revised date ranges)
- 3 view modes: List, Card, Table with meatball menus and RBAC-gated actions
- Analytics tab: 4 financial KPI cards + Status Distribution donut + Projects by Campus bar + Publication Status chips
- Recent Activity (admin only, bottom of page)
- Analytics fetched on mount (`onMounted(() => { fetchProjects(); fetchRecentActivity(); fetchAnalytics() })`)

**Missing vs. portfolio dashboard requirements:**
- Section 1: No ON_HOLD (Suspended) stat card; no separate "Total Cost Utilized" KPI
- Section 2: No Physical Progress Distribution chart; no Funding Source Distribution; no contractor performance; no completion trend
- Section 3: No Upcoming Completions panel; no Budget Variance Alerts; Recent Activity hidden (admin-only, buried below table)
- Section 4: Quick Actions panel ENTIRELY ABSENT
- UX/HCI: "Projects" tab is a hybrid list+dashboard — analytics hero strip is conditional and easy to miss
- Label error: "Budget Utilization" bars use `total_obligation` which maps to `total_cost_incurred` (not true obligation) — semantically misleading

**Reference file:** `pmo-frontend/pages/coi/index.vue` (~1335 lines)

---

### R-068: COI Analytics Backend — Available Data Shapes

**Topic:** What the two analytics endpoints actually return (post-BBB-A ConstructionProjectFinancial removal)

**`GET /api/construction-projects/analytics/summary`** (service line ~519):
```json
{
  "total": 12,
  "total_contract_value": 45000000,
  "avg_progress": 38.5,
  "delayed_count": 3,
  "by_status": [{ "status": "ONGOING", "count": 5, "total_contract": 25000000 }],
  "by_campus": [{ "campus": "MAIN", "count": 8, "total_contract": 35000000, "avg_progress": 42.1 }],
  "by_publication_status": [{ "publication_status": "PUBLISHED", "count": 6 }]
}
```

**`GET /api/construction-projects/analytics/financial-summary`** (service line ~574):
```json
{
  "total_appropriation": 45000000,   // = SUM(contract_amount) — NOT true appropriation
  "total_obligation": 12000000,      // = SUM(latest cost_incurred_to_date) — NOT true obligation
  "total_disbursement": 12000000,    // = same as obligation (back-compat alias)
  "projects_with_financials": 7,
  "utilization_rate": 26.7,
  "disbursement_rate": 26.7
}
```

**Key constraints:**
- `total_obligation` and `total_disbursement` are identical — both = total cost incurred from latest progress reports
- Labels "obligation" and "disbursement" are semantic backcompat aliases, NOT distinct financial flows
- `by_status` does NOT include ON_HOLD; must add to SQL or compute client-side
- No fund_source aggregation in backend — must compute client-side from projects list
- No contractor_name aggregation — no contractor performance data available at index level

**Recommendation:** For new analytics, prefer client-side computation from the already-fetched `projects.value[]` list to avoid new backend endpoints. The projects list already contains: `status`, `campus`, `fund_source` (if mapped), `physical_accomplishment`, `totalContractAmount`, `revised_completion_date`.

---

### R-069: COI Project List — Available Fields for Client-Side Analytics

**Topic:** What `UIProject` fields are available for client-side dashboard computation

From `adaptProjects()` in `utils/adapters.ts`, each `UIProject` has:
- `id`, `projectName`, `projectCode`
- `status` (PROPOSAL / ONGOING / COMPLETE / ON_HOLD / CANCELLED)
- `campus` (MAIN / CABADBARAN / etc.)
- `publicationStatus` (DRAFT / PENDING_REVIEW / PUBLISHED / REJECTED)
- `physicalAccomplishment` (number, 0–100)
- `totalContractAmount` (number)
- `startDate`, `endDate` (ISO strings — original dates)
- `revisedStartDate`, `revisedCompletionDate` (ISO strings — revised dates; may be null)
- `fundSource` (string — fund source label; may be null)
- `createdBy`, `delegatedTo`, `assignedUsers[]`

**Client-side analytics possible from this data:**
1. **Physical Progress Distribution** — group by 0-25, 25-50, 50-75, 75-100 buckets
2. **Funding Source Distribution** — group by `fundSource` (donut)
3. **Upcoming Completions** — filter where `(revisedCompletionDate || endDate)` within next 30 days AND status = ONGOING
4. **Budget Variance Alert** — projects where `physicalAccomplishment < 30` AND `totalContractAmount > threshold` (proxy for slow-moving large projects)
5. **ON_HOLD count** — `status === 'ON_HOLD'`
6. **PROPOSAL count** — `status === 'PROPOSAL'`

**Limitation:** `financialProgress` (cost utilization %) is NOT reliably in `UIProject` (it maps to `physical_progress` at project level, not financial). True financial utilization requires analytics endpoint or individual project fetch.

---

### R-070: CSU CORE Dashboard — Current Implementation Audit

**Topic:** Full audit of `pmo-frontend/pages/dashboard.vue` against executive dashboard requirements

**Current structure (1→5 order):**
1. Welcome header ("Welcome, [name]" + "CSU CORE System Dashboard" subtitle)
2. `AdminKpiRow` component (non-contractor only): 4 tiles — Total Projects (COI list count), Pending Reviews (COI filter count), Active Contractors, Quarterly Compliance (UO pillar avg %)
3. Module count cards (4): Infrastructure, Repair, UO, GAD — each shows count of records
4. Quick Actions (4 buttons): View Infrastructure, View Repairs, Physical Accomplishments, Financial Accomplishments
5. UO Summary (conditional — only when data exists): fiscal year selector + physical pillar cards + financial pillar cards

**Critical issues:**
- AdminKpiRow fetches full `/api/construction-projects` list (all records) just to get a count — wasteful; should use analytics summary endpoint
- Module stat cards repeat the same full-list fetch — 3 parallel list fetches + 2 filter fetches for essentially the same data
- No COI portfolio analytics (no budget summary, no avg progress, no delayed count at dashboard level)
- No cross-module financial picture
- UO summary is conditionally hidden ("only when data exists") — appears and disappears based on data; inconsistent
- No pending approvals attention widget
- No risk/alert indicators
- No activity feed
- No executive analytics (trends, distributions)
- Quick Actions are non-contextual (no counts, no status indicators)

**AdminKpiRow component:** `pmo-frontend/components/AdminKpiRow.vue`
- Exists as standalone file with 4 tiles
- Fetches data independently from dashboard.vue
- Uses `figma-accent`, `figma-muted`, `figma-primary` CSS classes (Figma design token classes)

---

### R-071: HCI Evaluation — COI Dashboard

**Topic:** HCI and UX findings specific to `pmo-frontend/pages/coi/index.vue`

**Finding 1 — Hybrid page identity (critical):**
The page serves two incompatible roles: (a) project list manager (filter, sort, CRUD via meatball menus) and (b) portfolio analytics dashboard. Users must scroll past multiple analytics sections to reach the project table, OR must understand that "Projects" tab = list while "Analytics" tab = charts. Neither is intuitively discoverable.

**Finding 2 — Conditional analytics hero:**
The hero strip (portfolio budget, progress bar, status chips) only renders when `analyticsReady` is true — this creates layout shift and empty space while analytics load. KPI stat cards are always visible but the hero strip below them appears/disappears, making the layout unstable.

**Finding 3 — Cognitive overload on Projects tab:**
A single scroll on the Projects tab encounters: 6 KPI cards → hero strip → 3-column analytics mini-panel → filter bar → list/card/table → recent activity. This is 6 distinct UI zones with different mental models (analytics, filtering, data entry, activity log).

**Finding 4 — Analytics tab discoverability:**
The "Analytics" tab contains richer visualizations (status donut + campus bar + publication chips + 4 financial KPIs) but users who stay on the "Projects" tab see only the mini analytics hero. The separation reduces discoverability of portfolio data.

**Finding 5 — Misleading label:**
"Budget Utilization" section shows two bars labeled "Obligation" and "Disbursement" but both map to the same `total_cost_incurred` value. This is semantically incorrect and would confuse finance stakeholders.

**Finding 6 — Missing stakeholder decision-support:**
For an executive/administrator, the dashboard provides no: upcoming completion deadlines, budget variance alerts, slow-moving project identification, or summary of what requires their attention today.

**Recommendations:**
- Rename "Budget Utilization" labels to "Cost Utilization" with "Cost Incurred" instead of "Obligation/Disbursement"
- Add Quick Actions prominently above the KPI row
- Add Upcoming Completions panel to Executive Monitoring section
- Add Funding Source Distribution to Analytics tab
- Add Physical Progress Distribution to Analytics tab

---

### R-072: HCI Evaluation — CSU CORE Dashboard

**Topic:** HCI and UX findings specific to `pmo-frontend/pages/dashboard.vue`

**Finding 1 — Navigation hub vs. executive dashboard:**
The page currently functions as a navigation hub (links to modules + counts). It does not support executive decision-making. A CSU administrator seeing this page learns: there are N infrastructure projects. They do not learn: which ones are delayed, what the budget status is, what needs their attention today.

**Finding 2 — Data redundancy in API calls:**
AdminKpiRow + dashboard.vue both fetch `/api/construction-projects` for counts — 2 full list fetches that could be replaced by 1 analytics summary endpoint call.

**Finding 3 — UO Summary positioning:**
The UO summary is the most analytically rich section but appears last, below four navigation-style items. Executive priority should invert this order: show the summary data first.

**Finding 4 — No attention/alert indicators:**
No section tells the user "X projects need review" or "Y items are delayed" or "Z approvals are pending." The dashboard is passive (counts only) rather than active (alerts + decisions).

**Finding 5 — Contractor visibility:**
Contractors see only COI module card (correct RBAC). But they also see a welcome header + empty quick actions grid (missing buttons because they're hidden). The contractor view should have a dedicated compact layout.

**Recommendations:**
- Replace dual full-list fetches with COI analytics summary endpoint
- Add COI portfolio summary block (budget, avg progress, delayed count)
- Add "Requires Attention" widget (pending reviews + delayed projects)
- Restructure: University Snapshot → Cross-Module Analytics → Monitoring → Quick Actions
- UO summary should be first-class analytics, not a conditional afterthought

---

### R-073: Data Availability Assessment for Dashboard Analytics

**Topic:** What data is available for each planned visualization without new backend endpoints

| Visualization | Source | Notes |
|---|---|---|
| Physical Progress Distribution (histogram) | `projects.value[]` client-side | Bucket into 4 ranges: 0-25, 25-50, 50-75, 75-100 |
| Funding Source Distribution (donut) | `projects.value[]` client-side | Group by `fundSource` field; "Unknown" for null |
| Upcoming Completions list | `projects.value[]` + date math | `revisedCompletionDate || endDate` within 30 days, status=ONGOING |
| Budget Variance Alert | `projects.value[]` client-side | `physicalAccomplishment < 25` AND status=ONGOING as proxy |
| ON_HOLD count | `projects.value[]` client-side | `status === 'ON_HOLD'` filter |
| COI Total Portfolio Budget | `/analytics/financial-summary` | `total_appropriation` field |
| COI Cost Utilized | `/analytics/financial-summary` | `total_obligation` (= cost_incurred) |
| COI Utilization Rate | `/analytics/financial-summary` | `utilization_rate` |
| COI Avg Progress | `/analytics/summary` | `avg_progress` |
| COI Delayed Count | `/analytics/summary` | `delayed_count` |
| UO Physical Performance | `/analytics/pillar-summary` | Already implemented in dashboard.vue |
| UO Financial Performance | `/analytics/financial-pillar-summary` | Already implemented in dashboard.vue |
| Contractor Performance | None available | Skip — no index-level endpoint |
| Completion Trends (time-series) | Not available at index | Defer — requires new endpoint |

**Conclusion:** GGG and HHH can be fully implemented using existing API endpoints + client-side computation from already-fetched data. Zero new backend endpoints required.

---

### R-074: COI Analytics Tab — Existing Charts vs. Planned Additions

**Topic:** Inventory of current Analytics tab charts and what needs to be added

**Currently in Analytics tab:**
- 4 financial KPI hero cards: Total Appropriation, Total Obligation, Total Disbursement, Utilization Rate
- Status Distribution donut (`statusChartSeries` from `by_status`)
- Projects by Campus bar chart (`campusChartSeries` from `by_campus`)
- Publication Status chips (flat list from `by_publication_status`)

**Planned additions for GGG:**
1. **Physical Progress Distribution** — horizontal bar or column chart, 4 buckets (0-25%, 25-50%, 50-75%, 75-100%), computed client-side from `projects.value`
2. **Funding Source Distribution** — donut chart, computed from `projects.value[].fundSource`
3. **Cost Utilization KPI correction** — relabel "Obligation"/"Disbursement" to "Cost Incurred" throughout

**Label corrections needed:**
- "Total Obligation" → "Total Cost Incurred"
- "Total Disbursement" → "Total Cost Incurred" (duplicate of obligation — consider collapsing to one card)
- "Budget Utilization" section header → "Cost Utilization"
- Progress bars: "Obligation" → "Cost Incurred" / "Disbursement" → remove or note as same

**No chart should be removed** — only additions and label corrections.

---

### R-075: Interactive Chart Drill-down — Technical Feasibility

**Topic:** Click-on-chart-element → filter project list on Projects tab

**Requirement:** When a user clicks a campus bar (campus distribution), a status slice (status donut), or any analytics element, the app should: (1) set the matching filter value, (2) switch `activeTab` to `'projects'`, and (3) the project list then automatically renders filtered results.

**Existing infrastructure:**
- `filterCampus = ref('')` — accepts uppercase campus values (`'MAIN'`, `'CABADBARAN'`)
- `filterStatus = ref('')` — accepts uppercase status values (`'ONGOING'`, `'COMPLETE'`, `'ON_HOLD'`, etc.)
- `activeTab = ref('projects')` — switching to `'projects'` shows the list view
- `filteredProjects` computed already reacts to both `filterCampus` and `filterStatus` — no changes needed there

**Two surfaces to wire:**

**Surface A — Hero strip campus bars (`v-progress-linear` elements, lines ~707–713):**
These are not ApexCharts — they are plain `v-row`/`v-progress-linear` elements. Adding `@click` + `cursor-pointer` style is sufficient.

```html
<div v-for="campus in campusBars" :key="campus.campus" class="mb-2 cursor-pointer"
     @click="drillToCampus(campus.campus)">
```

**Surface B — Analytics tab ApexCharts (campus bar + status donut):**
ApexCharts exposes `chart.events.dataPointSelection` in the options object. The callback receives `(event, chartContext, config)` where `config.dataPointIndex` (for bar) and `config.seriesIndex` (for donut) identify the clicked element.

```typescript
// Campus bar chart options addition:
events: {
  dataPointSelection: (_e: any, _ctx: any, config: any) => {
    const campus = (analyticsSummary.value?.by_campus || [])[config.dataPointIndex]?.campus
    if (campus) drillToCampus(campus)
  }
}

// Status donut chart options addition:
events: {
  dataPointSelection: (_e: any, _ctx: any, config: any) => {
    const status = (analyticsSummary.value?.by_status || [])[config.dataPointIndex]?.status
    if (status) drillToStatus(status)
  }
}
```

**Drill functions:**
```typescript
function drillToCampus(campus: string) {
  filterCampus.value = campus?.toUpperCase() || ''
  activeTab.value = 'projects'
}
function drillToStatus(status: string) {
  filterStatus.value = status?.toUpperCase() || ''
  activeTab.value = 'projects'
}
```

**UX requirement:** Clickable elements must signal affordance visually — `cursor: pointer` on campus bars; ApexCharts handles cursor on chart elements automatically when events are set.

**Constraint:** `filterCampus` uses exact uppercase match against `p.campus.toUpperCase()`. The `by_campus` API response returns campus values from the DB (e.g., `'MAIN'`, `'CABADBARAN'`). These match — no transformation needed.

**CORE dashboard (HHH) drill-down:** The Infrastructure mini-summary "Total Projects" card and the "Delayed" card should navigate to `/coi` (and optionally pre-filter). Since CORE dashboard does not own the filter state of COI index, navigation via `router.push('/coi')` is sufficient — the COI page fetches fresh on mount.

---

### R-076: Git Commit Scope — Current Uncommitted Work

**Topic:** What needs to be committed before GGG/HHH implementation begins

**Current branch:** `pmo-coi`

**Uncommitted modified files (tracked):**
- `docs/` — history.md, plan.md, research.md, state.md (all docs)
- `pmo-backend/src/construction-projects/` — service, DTOs, entity, timeline-entry entity, migration snapshot
- `pmo-frontend/components/coi/` — CiBasicInfoForm, CiGalleryModal, CiProgressReportTab, CiProjectAnalyticsTab, CiRevisionOrdersTable, CiScrollToTopFab, CiTimelogsContainer
- `pmo-frontend/layouts/default.vue`
- `pmo-frontend/pages/coi/` — detail-[id].vue, edit-[id].vue, new.vue
- `pmo-frontend/pages/login.vue`
- `pmo-frontend/utils/adapters.ts`

**Commit strategy:** Single commit covering phases ZZZ→EEE that were implemented but never committed. Use descriptive conventional commit message per EEE-D standard — avoid generic phase codes.

**Untracked files to include:**
- New migration files: `Migration20260603100000_AddWarFieldsToTimelineEntries.ts`, `Migration20260603200000_AddMprFieldsToTimelineEntries.ts`, and subsequent migrations
- `docs/guides/Artifacts.txt` (new guide file)

**Recommendation:** Stage all modified tracked + relevant untracked files → single commit → push `pmo-coi`.

---

## Dashboard Modernization Research — Phase III/JJJ Brief (2026-06-08)

### R-077: COI Dashboard — Post-GGG Implementation Inventory

**Topic:** What GGG delivered vs what the Phase III/JJJ brief still requires

**Delivered by GGG (commit 324f217):**
- 8 KPI stat cards: Completed, Ongoing, Delayed, On Hold, Pending Review, Total Budget, Avg Progress, Cost Utilized — all sourced from `analytics/summary` + `analytics/financial-summary`
- Quick Actions strip (New Project, Review Projects w/ badge, Portfolio Analytics, Public View)
- Hero strip: Portfolio Budget, Overall Progress bar, status pips (clickable → filter)
- Cost Utilization panel: Appropriation + Cost Incurred progress bars
- Projects by Campus panel: clickable bars → drill to Projects tab with campus filter
- Needs Attention list (delayed + rejected + pending-review projects)
- Upcoming Completions panel (ONGOING within 30-day window)
- Slow-Moving Projects panel (ONGOING, <25%)
- Analytics tab: Financial hero (4 KPIs), Status donut (clickable), Campus bar chart (clickable + `dataPointSelection`), Physical Progress Distribution bar (4 buckets, client-side), Funding Source donut (client-side from `p.fundSource`), Publication Status chips

**Still absent (required by brief):**
- Per-campus average progress chart (backend field `by_campus[].avg_progress` available but unused)
- Per-campus contract value breakdown chart (`by_campus[].total_contract` available but unused)
- Per-status contract distribution chart (`by_status[].total_contract` available but unused)
- By-contractor analytics (NO backend endpoint — requires new endpoint)
- By-year analytics (NO backend endpoint — requires new backend)
- Completion forecast (predictive — NO backend logic)
- Milestone completion rates (milestone data not aggregated at index level)
- Section-level guidance banners in Analytics tab
- Financial Analytics section (dedicated section with area/trend chart)
- `projects_with_financials` data completeness indicator

**Conclusion:** Sections 1 (Snapshot) and 5 (Attention) are complete. Sections 2, 3, 4 partially done. Priority gaps: per-campus analytics from existing untapped backend fields.

---

### R-078: CSU CORE Dashboard — Post-HHH Implementation Inventory

**Topic:** What HHH delivered vs what the Phase III/JJJ brief still requires

**Delivered by HHH (commit 324f217):**
- Dismissible context banner (localStorage-persisted)
- AdminKpiRow: 4 colored tiles sourced from single `analytics/summary` call (Infrastructure total, Delayed, Pending Reviews, UO Compliance Rate)
- Infrastructure Portfolio mini-summary card: Total/Ongoing/Delayed/Avg Progress + cost utilization bar + click-navigate to /coi
- UO Summary: Physical + Financial pillar cards per fiscal year (already existing)
- Quick Actions section
- Module cards (Repair, UO, GAD)

**Still absent (required by brief):**
- Total Budget Portfolio in Executive Snapshot (value available from COI financial summary; already shown in Infrastructure card but not as standalone KPI)
- System Activity feed (activity log endpoint exists; not wired on dashboard)
- Cross-module analytics charts (no visualization layer — all numbers only)
- UO Quarterly Trend chart (`/analytics/quarterly-trend` endpoint EXISTS; not rendered)
- UO Financial Quarterly Trend chart (`/analytics/financial-quarterly-trend` EXISTS; not rendered)
- Portfolio Distribution donut (cross-module: COI / UO / Repairs / GAD) — Repairs/GAD have no analytics endpoints
- Campus Distribution chart for COI (backend data exists)
- Budget Utilization chart (COI + UO combined)
- Operational Intelligence section (deadline alerts, budget risks)
- Section-level guidance banners (only top banner exists; section cards have no description)
- Pending Reviews KPI shows in AdminKpiRow; no cross-module unified pending count

**Conclusion:** Dashboard is informational but not analytical. Missing charts make it a data display page rather than an executive decision-support system. Biggest win: UO Quarterly Trend chart — one API call, high executive value.

---

### R-079: COI Analytics/Summary — Untapped Response Fields

**Topic:** Which fields returned by `GET /api/construction-projects/analytics/summary` are currently unused in the frontend

**Full response shape (from `getAnalyticsSummary()` service method):**
```ts
{
  total: number,
  total_contract_value: number,
  avg_progress: number,
  delayed_count: number,
  by_status: Array<{
    status: string,
    count: number,
    total_contract: number,   // ← UNTAPPED — contract value by status
  }>,
  by_campus: Array<{
    campus: string,
    count: number,
    total_contract: number,   // ← UNTAPPED — contract value by campus
    avg_progress: number,     // ← UNTAPPED — avg physical progress per campus
  }>,
  by_publication_status: Array<{
    publication_status: string,
    count: number,
  }>,
}
```

**Currently used in frontend:**
- `total`, `avg_progress`, `delayed_count`, `total_contract_value` → KPI cards
- `by_status[].status`, `by_status[].count` → status donut chart + pips
- `by_campus[].campus`, `by_campus[].count` → campus bar chart + progress bars
- `by_publication_status[]` → publication chips

**Untapped (zero frontend usage):**
- `by_campus[].avg_progress` — authoritative per-campus average physical progress (DB aggregate)
- `by_campus[].total_contract` — total contract value per campus
- `by_status[].total_contract` — total contract value per status

**Opportunity:** All 3 untapped fields are already computed in a single existing DB query. Zero additional API calls needed. Enables: per-campus progress bars (showing % not just count), contract budget distribution by campus/status charts.

---

### R-080: UO Analytics Endpoints — Dashboard-Usable Data Map

**Topic:** Which existing UO analytics endpoints can be surfaced on the CSU CORE dashboard without new backend work

**Available endpoints (all working, all tested):**

| Endpoint | Response | Dashboard use |
|---|---|---|
| `GET /analytics/pillar-summary?fiscal_year=` | pillars[]: accomplishment_rate_pct per pillar | Already in HHH pillar cards |
| `GET /analytics/quarterly-trend?fiscal_year=` | quarters[]: {quarter, target_rate, actual_rate, accomplishment_rate_pct} | ✅ HIGH VALUE — Q1/Q2/Q3/Q4 trend line chart |
| `GET /analytics/financial-pillar-summary?fiscal_year=` | pillars[]: {total_appropriation, total_obligations, total_disbursement, avg_utilization_rate} | Already in HHH pillar cards |
| `GET /analytics/financial-quarterly-trend?fiscal_year=` | quarters[]: {quarter, total_appropriation, total_obligations, total_disbursement, utilization_rate} | ✅ HIGH VALUE — Q1–Q4 financial trend chart |
| `GET /analytics/yearly-comparison?years=` | Multi-year pillar comparison | Future use |
| `GET /analytics/financial-campus-breakdown?fiscal_year=` | Campus-level financial data | Future use |

**Quarterly trend response shape (key for JJJ-A):**
```ts
quarters: Array<{
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4',
  target_rate: number,
  actual_rate: number | null,
  accomplishment_rate_pct: number | null,  // (actual/target)*100
}>
```

**Financial quarterly trend response shape (for JJJ-B):**
```ts
quarters: Array<{
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4',
  total_appropriation: number,
  total_obligations: number,
  total_disbursement: number,
  utilization_rate: number,
}>
```

**Recommendation:** Surface both trend datasets as ApexCharts area/line charts on dashboard.vue. No new backend work. One API call each. High executive value — shows performance trajectory not just snapshot.

---

### R-081: Analytics Gaps Requiring New Backend Work

**Topic:** Features in the brief that CANNOT be built from existing endpoints

**Category A — Missing COI aggregations (new service method + controller route needed):**

| Feature | Missing endpoint | SQL feasibility |
|---|---|---|
| Projects by contractor | `GET /analytics/by-contractor` | Easy — GROUP BY contractor_name on construction_projects |
| Projects by year | `GET /analytics/by-year` | Easy — GROUP BY DATE_PART('year', start_date) |
| Progress trend over time | `GET /analytics/progress-trend` | Medium — aggregation over progress_reports by report_date |
| Milestone completion rate | `GET /analytics/milestone-summary` | Medium — GROUP BY project, milestone status |
| Funding source from backend | extend existing summary | Easy — add `by_funding_source` to `getAnalyticsSummary()` |

**Category B — Missing cross-module data (no path without major new work):**

| Feature | Gap | Effort |
|---|---|---|
| Active Personnel count | No personnel count endpoint | New endpoint needed |
| System-wide pending reviews | Three separate module endpoints | Aggregation needed or parallel calls |
| Repair module analytics | No `/api/repair-projects/analytics` endpoint | New module endpoint |
| GAD analytics | No analytics endpoint | New module endpoint |

**Category C — Out of scope / YAGNI:**
- Completion forecasts (predictive ML) — far future
- Budget risk scoring (requires definition) — far future

**Conclusion for Phase III/JJJ scope:** Limit to existing endpoints. New backend for `by_funding_source` extension to analytics/summary is the only single-method addition worth doing. All others deferred.

---

### R-082: HCI Assessment — Post-GGG/HHH Remaining Issues

**Topic:** Human-Computer Interaction gaps remaining after GGG/HHH implementations

**COI Dashboard (`pages/coi/index.vue`) — current HCI state:**

Strengths (GGG delivered):
- 8-card KPI row provides immediate portfolio snapshot
- Clickable campus bars + status pips create intuitive drill-down
- Executive Monitoring panels (Upcoming / Slow-Moving) surface operational risks
- Quick Actions strip reduces navigation friction

Remaining gaps:
1. **Analytics tab has no section headings or guidance banners.** User sees "Status Distribution" chart with no context on why it matters or what action to take.
2. **Per-campus analytics shows only count.** `by_campus[].avg_progress` is richer — showing both volume and progress per campus is more actionable.
3. **Financial analytics section is minimal.** One appropriation bar + one cost-incurred bar. No trend, no per-project breakdown, no variance indicator.
4. **Analytics tab chart sections are cramped** — charts displayed 5/7 col without breathing room; labels may be cut off at sm breakpoint.
5. **No cross-filtering between Analytics and Projects tabs beyond campus/status.** Clicking Funding Source donut has no drill-down action (tooltip only).
6. **Empty state for projects is text-only.** No visual differentiation between "zero projects exist" and "filtered to zero projects".

**CSU CORE Dashboard (`pages/dashboard.vue`) — current HCI state:**

Strengths (HHH delivered):
- Context banner orients new users
- AdminKpiRow gives 4 critical numbers immediately
- Infrastructure mini-summary card click-to-navigate is intuitive

Remaining gaps:
1. **No charts anywhere on the dashboard.** Entirely text/numbers — does not meet the executive analytics requirement.
2. **UO Summary is cards-only.** Q1–Q4 trend is invisible without the quarterly-trend chart.
3. **Quick Actions section is positioned below Analytics** — users need to scroll past UO summary (which is data-heavy) to reach Quick Actions.
4. **Module cards (Repair/UO/GAD) show counts only** — no status indication, no visual health indicator.
5. **No guidance banners on UO Summary, Infrastructure, or Module sections.**
6. **Section headers use h2 text but no visual separation** — information architecture is flat, no hierarchy between sections.

---

### R-083: Visualization Library Evaluation

**Topic:** Which chart library to use for new dashboard visualizations

**Existing implementation:** `vue3-apexcharts` (VueApexCharts) — already installed and used in `pages/coi/index.vue`, `CiProjectAnalyticsTab.vue`

**Evaluation:**

| Criterion | ApexCharts | ECharts | Chart.js |
|---|---|---|---|
| Already installed | ✅ Yes | ❌ No | ❌ No |
| Vue 3 wrapper | ✅ vue3-apexcharts | ✅ vue-echarts | ✅ vue-chartjs |
| Vuetify 3 style fit | ✅ Configurable | ✅ Configurable | ⚠️ Less flexible |
| Responsive | ✅ Built-in | ✅ Built-in | ⚠️ Manual |
| Interactive events | ✅ dataPointSelection | ✅ Events API | ⚠️ Limited |
| Animation | ✅ Smooth | ✅ Rich | ✅ Basic |
| Bundle size | Medium | Large | Small |
| SSR (Nuxt) | ⚠️ Client-only | ⚠️ Client-only | ⚠️ Client-only |

**Recommendation:** Continue with ApexCharts exclusively.
- Zero new dependencies
- Pattern already established in codebase
- `dataPointSelection` drill-down pattern already proven (GGG)
- Consistent rendering across COI + dashboard
- SSR: wrap all chart components in `<ClientOnly>` or use `import.meta.client` guard (existing pattern)

**Vuetify native components to prefer over charts:**
- Simple progress bars: `v-progress-linear` (already used)
- Status chips with counts: `v-chip` (already used)
- KPI numbers: `v-card` with `text-h4` (already used)
- Alert cards: `v-alert` (already used)

---

### R-084: Executive Dashboard KPI Taxonomy

**Topic:** Which KPIs are highest-value for each user type accessing the CSU CORE and COI dashboards

**Primary user types:**
1. **University President / VP** — cross-module institutional view
2. **PMO Director** — COI portfolio + budget oversight
3. **MIS Director** — system health, data quality
4. **Campus Administrator** — campus-scoped projects
5. **Project Manager / Staff** — own project list

**KPI value matrix:**

| KPI | President/VP | PMO Director | MIS | Campus Admin | PM/Staff |
|---|---|---|---|---|---|
| Total Infrastructure Projects | High | High | Med | Med | Low |
| Delayed Projects Count | High | High | Low | Med | High |
| Total Budget Portfolio | High | High | Low | Med | Low |
| Cost Utilization % | High | High | Low | Low | Low |
| Avg Physical Progress | High | High | Low | Med | Med |
| UO Accomplishment Rate | High | Low | Low | Low | Low |
| Pending Reviews | Med | High | Med | Low | High |
| Projects by Campus | High | Med | Low | High | Low |
| Quarterly Trend | High | Med | Low | Low | Low |

**Derived priorities for Phase III/JJJ:**
1. Cross-module KPIs (President level) → dashboard.vue
2. COI portfolio analytics (PMO level) → coi/index.vue Analytics tab
3. Campus-filtered view (Campus Admin) → coi/index.vue campus drill-down (already done in GGG)
4. Per-project drill-down (PM/Staff) → detail-[id].vue (already complete)

**Conclusion:** Phase III focuses on PMO Director analytics (per-campus progress + contract distribution). Phase JJJ focuses on President/VP level (quarterly trend chart + cross-module overview).

---

### R-085: COI Analytics Tab — Tier 2 Feasibility Matrix

**Topic:** What can be added to the COI Analytics tab using only existing data (no new backend work except one extension)

**Tier 1 (existing untapped backend fields — zero new endpoints):**

| Visualization | Data source | Type | Value |
|---|---|---|---|
| Per-campus avg progress bars | `by_campus[].avg_progress` (analytics/summary) | Horizontal bar | HIGH — shows which campuses are lagging |
| Budget by campus donut | `by_campus[].total_contract` (analytics/summary) | Donut | MED — shows budget concentration |
| Contract value by status | `by_status[].total_contract` (analytics/summary) | Stacked/grouped bar | MED — shows how much budget is in Ongoing vs Completed |
| Data completeness indicator | `projects_with_financials` (financial-summary) | Single KPI chip | MED — shows how many projects have progress report data |

**Tier 2 (client-side computed from project list — already loaded):**

| Visualization | Data source | Type | Value |
|---|---|---|---|
| Physical Progress Distribution | `p.physicalAccomplishment` | 4-bucket bar | HIGH — already implemented in GGG |
| Funding Source Distribution | `p.fundSource` | Donut | MED — already implemented in GGG |
| Contractor distribution | `p.contractor` | Horizontal bar | MED — client-side feasible |

**Tier 3 (requires new backend endpoint):**

| Visualization | New endpoint needed | Priority |
|---|---|---|
| Progress trend over time | `GET /analytics/progress-trend` | LOW (complex query) |
| Projects by year | `GET /analytics/by-year` | LOW |
| `by_funding_source` from DB | extend `getAnalyticsSummary()` | MED — add one GROUP BY |

**Recommendation for Phase III:** Implement Tier 1 (3 new charts from zero new API calls) + Tier 2 contractor bar (client-side). Add one Tier 3 extension: add `by_funding_source` to `getAnalyticsSummary()` to replace the client-side `p.fundSource` donut with backend-authoritative data. This is a 3-line SQL addition to an existing method.

---

### R-086: Dashboard Section Architecture — Information Hierarchy

**Topic:** Optimal page structure for both dashboards post-Phase III/JJJ

**CSU CORE Dashboard — recommended final architecture:**

```
1. [CONTEXT BANNER] — dismissible, role-aware
2. [EXECUTIVE SNAPSHOT] — AdminKpiRow (4 KPI tiles: Infrastructure / Delayed / Pending / UO Compliance)
3. [INFRASTRUCTURE PORTFOLIO] — mini-summary card + campus progress chart + cost utilization bar
4. [UO PERFORMANCE] — pillar cards + Q1-Q4 Accomplishment Trend chart + Financial Utilization chart
5. [QUICK ACTIONS] — 4 action buttons
6. [OTHER MODULES] — Repair / GAD lightweight cards
```

**COI Dashboard — recommended final architecture:**

```
1. [QUICK ACTIONS] — already implemented (GGG-B)
2. [PORTFOLIO SNAPSHOT] — 8 KPI cards + hero strip (already done GGG-A)
3. [CAMPUS INTELLIGENCE] — Campus count bars (clickable, GGG-E) + NEW: campus avg-progress bars
4. [FINANCIAL OVERVIEW] — Cost Utilization panel (GGG) + NEW: Budget by Campus donut + Contract by Status bar
5. [EXECUTIVE MONITORING] — Upcoming Completions + Slow-Moving (GGG-C)
6. [FILTER + PROJECT LIST] — existing, unchanged
--- Analytics Tab ---
7. [FINANCIAL HERO] — 4 KPI cards (GGG-D)
8. [STATUS & CAMPUS CHARTS] — Status donut + Campus bar (GGG-D)
9. [PROGRESS ANALYTICS] — Physical Progress Distribution + NEW: Per-campus avg progress
10. [FINANCIAL ANALYTICS] — NEW: Budget by campus + Contract by Status
11. [DISTRIBUTION] — Funding Source donut + NEW: Contractor distribution
12. [PUBLICATION STATUS] — existing chips
```

**HCI principle applied:** Each section has one purpose, one audience, one decision-support outcome. Guidance banners in the Analytics tab explain what each chart answers.

---

### R-087: Phase III/JJJ — Backend Extension Assessment

**Topic:** Minimum backend change to maximize dashboard analytics coverage

**Proposed extension to `getAnalyticsSummary()` (3 lines of SQL, zero new endpoint):**

Add to the existing `getAnalyticsSummary` method in `construction-projects.service.ts`:
```sql
SELECT funding_source_name, COUNT(*) as count, COALESCE(SUM(contract_amount),0) as total_contract
FROM construction_projects
WHERE deleted_at IS NULL
GROUP BY funding_source_name
ORDER BY count DESC
```

Returns `by_funding_source: Array<{funding_source_name, count, total_contract}>`.

This replaces the client-side `p.fundSource` grouping (which works but is less reliable than DB aggregation) with an authoritative backend count.

**Contractor distribution extension (similar):**
```sql
SELECT contractor_name, COUNT(*) as count, COALESCE(SUM(contract_amount),0) as total_contract
FROM construction_projects
WHERE deleted_at IS NULL AND contractor_name IS NOT NULL
GROUP BY contractor_name
ORDER BY count DESC LIMIT 10
```

Returns `by_contractor: Array<{contractor_name, count, total_contract}>`.

**Assessment:** Both extensions are additive to the existing `getAnalyticsSummary()` response. No DTO change (endpoint already returns `any`). No migration needed. Backend tsc passes because return type is `Promise<any>`. Estimated implementation: 15 minutes per extension.

**Recommendation for Phase III:** Add both extensions. Replace client-side groupings with authoritative DB aggregates. Frontend change: swap `fundingSourceChart` computed from `p.fundSource` grouping to `analyticsSummary.value?.by_funding_source`. Add new `contractorChart` computed from `analyticsSummary.value?.by_contractor`.


---

## Phase KKK / LLL — Executive Dashboard Refactor Research (2026-06-08)

> Research basis for Phase KKK (CSU CORE Dashboard) and Phase LLL (COI Dashboard) executive refactors.

---

### R-088: CSU CORE Dashboard — Current State Audit

**File:** `pmo-frontend/pages/dashboard.vue`, `pmo-frontend/components/AdminKpiRow.vue`

**AdminKpiRow issues:**
- Tile 2 = "Delayed Projects" — negative metric on executive landing page (violates executive dashboard principles)
- `text-h5 font-weight-bold` for tile values — oversized; executive benchmarks recommend `text-subtitle-1` or `text-h6`
- Avatar size 44px — too large for compact KPI tiles
- Tile colors primary/error/warning/success — error tile (Delayed) dominates visually

**Infrastructure mini-summary card issues:**
- "Delayed" is stat #3 of 4 — negative metric prominent above fold
- `text-h5 font-weight-bold` for all 4 stats — oversized for a secondary summary card
- No executive guidance subtitle

**UO Summary card issues:**
- 8 pillar cards (4 physical + 4 financial) expand to very long card requiring scroll
- Trend charts inline below pillar cards — no way to collapse
- "Q1-Q4" section labels use `text-uppercase font-weight-bold` — aggressive visual weight

**Quick Actions card issues:**
- 4 `size="large" block` buttons — uses ~200-280px vertical space for navigation only
- HCI violation: navigation links should not use primary action affordances (large buttons)
- Contractors see only 1 button — section looks broken for that role

**Other Modules section issues:**
- GAD Reports: hardcoded `gadReports: 0` (Directive 218: module does not exist)
- Repair + UO counts: fetched via full-list API — network-inefficient for a simple count
- `text-h5 font-weight-bold` module card values — oversized; GAD always shows 0

---

### R-089: COI Dashboard — Current State Audit

**File:** `pmo-frontend/pages/coi/index.vue`

**KPI row (8 cards) issues:**
- `text-h4 font-weight-bold` for numeric values — 4 typography levels too large for KPI card context
- Icon size 32px — appropriate for feature icons, not compact KPI rows
- 8 cards at `md="3"` creates 2 rows of 4 — high cognitive load, exceeds executive benchmark (<=5 primary KPIs)
- Card 3 = "Delayed" — negative metric as a primary, always-visible KPI
- Card 7 = "On Hold" — low signal value; rarely action-relevant

**Hero analytics strip (EEE-A) issues:**
- Duplicates data already shown in KPI row (budget, progress, status chips)
- Adds a third representation of status distribution (chips in hero + KPI count cards + status donut in analytics tab)

**Executive monitoring row issues:**
- "Needs Attention" panel (delayed + pending + rejected) = permanent negative metric surface
- "Slow-Moving Projects" panel (<25%) = permanent negative metric surface
- Both panels belong in analytics/drill-down views, not on the portfolio landing page

**Recent Activity:**
- Always rendered, always fetches on mount (admin-gated fetch but always-visible container)
- Positioned between analytics summary and filter bar — interrupts user flow to table

**Advanced filters:**
- Expanded state reveals 10+ date range fields simultaneously
- Cognitive overload; most users need search + status + campus only

---

### R-090: Typography Audit — COI Dashboard

| Element | Current | Executive Standard | Gap |
|---|---|---|---|
| KPI card values | `text-h4` | `text-h6` or `text-subtitle-1` | 2-3 sizes too large |
| KPI card icons | size=32 | size=20 or `size="small"` | Too large |
| KPI card labels | `text-body-2` | `text-caption` | 1 size too large |
| Hero budget stat | `text-h4` | `text-h4` | OK (hero stat) |
| Analytics chart labels | `text-body-1 font-weight-bold` | `text-subtitle-2 font-weight-bold` | 1 size too large |
| Filter bar | compact, density="compact" | OK | OK |
| Table header | v-data-table default | OK | OK |

---

### R-091: Typography Audit — CSU CORE Dashboard

| Element | Current | Executive Standard | Gap |
|---|---|---|---|
| AdminKpiRow values | `text-h5` | `text-subtitle-1` | 1-2 sizes too large |
| AdminKpiRow avatars | size=44 | size=36 | Slightly large |
| Welcome heading | `text-h4` | `text-h5` | 1 size too large |
| Infrastructure stats | `text-h5` | `text-h6` | 1 size too large |
| UO pillar values | `text-h6` | `text-h6` | OK |
| Quick Actions buttons | `size="large" block` | compact list items | Wrong component |
| Module card values | `text-h5` | `text-subtitle-1` | 1-2 sizes too large |

---

### R-092: Data Source Validation — CSU CORE Dashboard

| Data Point | Source | Status |
|---|---|---|
| Infrastructure total | `analytics/summary.total` | DB aggregate |
| Delayed count | `analytics/summary.delayed_count` | DB aggregate |
| Pending reviews | `analytics/summary.by_publication_status` | DB aggregate |
| UO Compliance Rate | `pillar-summary.pillars[].accomplishment_rate_pct` | DB aggregate |
| COI mini-summary | `analytics/summary` + `analytics/financial-summary` | DB aggregate |
| UO pillar physical | `analytics/pillar-summary` | DB aggregate |
| UO pillar financial | `analytics/financial-pillar-summary` | DB aggregate |
| Q1-Q4 trend charts | `quarterly-trend` + `financial-quarterly-trend` | DB aggregate |
| Repair count | `/api/repair-projects` (full list) | WARN — inefficient full-list fetch |
| UO count | `/api/university-operations` (full list) | WARN — inefficient full-list fetch |
| GAD Reports | Hardcoded `0` | FAIL — module non-existent (Directive 218) |

**Finding:** GAD Reports must be removed entirely. Repair/UO full-list fetches eliminated once "Other Modules" is refactored to navigation-only.

---

### R-093: Data Source Validation — COI Dashboard

| Data Point | Source | Status |
|---|---|---|
| Project list | `/api/construction-projects` (full list) | Required for table |
| KPI stats | `analytics/summary` via `syncStatsFromAnalytics()` | DB aggregate (authoritative) |
| Delayed count | `analytics/summary.delayed_count` | DB aggregate |
| Recent activity | `/api/activity-logs?entityType=CONSTRUCTION_PROJECT` | Backend paginated |
| Campus filter options | Hardcoded `["MAIN","CABADBARAN"]` | WARN — not DB-driven |
| Advanced date filters | Client-side filtering of loaded array | OK — data already loaded |
| Analytics summary | `analytics/summary` + `analytics/financial-summary` | DB aggregate |

**Finding:** Campus filter hardcoded — acceptable (campuses stable). Advanced date filters client-side — acceptable as data is already loaded.

---

### R-094: HCI Assessment — Executive Usability

**Violations against Nielsen Usability Heuristics:**

1. **Aesthetic and minimalist design (COI):** 8 KPI cards — each additional element competes for attention. Executive dashboards should surface 3-5 primary KPIs.
2. **Recognition vs recall (COI):** 8 cards + hero strip + campus panel + attention panel + upcoming completions panel — users must process 30+ data points before reaching the table. Exceeds working memory capacity (Miller Law: 7+-2 items).
3. **Consistency and standards (CORE + COI):** Navigation actions (Quick Actions) use `size="large" block` buttons — same affordance as primary form actions. Navigation should use text/tonal variants.
4. **Error prevention (COI filters):** Advanced filter with 10+ visible date range fields simultaneously increases user error likelihood.
5. **Help and documentation (both):** Section banners exist but inconsistently applied.

**HCI Recommendations:**
- COI KPI row: reduce to 5 cards maximum; downsize typography per R-090
- CORE Quick Actions: replace block buttons with compact icon-link list
- COI: move Needs Attention + Slow-Moving to analytics tab (drill-down)
- Both: negative metrics (Delayed, High Risk) only in drill-down views
- COI filter: primary = 3 fields; advanced = 3 additional fields max

---

### R-095: Negative Metric Policy — Current Violations

Per brief: Remove Delayed Projects, High Risk Warnings, Negative Status Projections from CSU CORE and COI landing pages.

**CORE violations:**
- AdminKpiRow tile 2: "Delayed Projects" (error color, always visible)
- Infrastructure mini-summary stat 3: "Delayed" (always visible)

**COI violations:**
- KPI card 3: "Delayed" (error color, always visible)
- Executive monitoring panel: "Needs Attention" (delayed + rejected + pending — negative framing)
- Executive monitoring panel: "Slow-Moving Projects" (<25% progress — negative framing)

**Permitted drill-down locations:**
- COI Analytics tab: Status Distribution donut shows delayed count — OK as drill-down
- COI project list: filter by Delayed status — OK as drill-down

**Replacement positive metrics:**
- CORE AdminKpiRow tile 2: "Published Projects" (from `by_publication_status`) or "Avg Portfolio Progress"
- CORE Infrastructure card stat 3: "Completed" (from `by_status.COMPLETE`)
- COI KPI card 3: "Pending Review" (actionable, not negative) or remove card entirely

---

### R-096: COI Project Table — Column Coverage vs Brief Requirements

**Brief-required default columns:** Project Code, Project Name, Campus, Status, Publication, Contract Amount, Original End Date, Fund Source, Physical Progress, Actions

**Current default headers (7):** Project Name, Campus, Status, Publication, Contract Amount, Progress, Actions

**Missing from current defaults:** Project Code, Original End Date, Fund Source

**UIProject interface coverage (all required columns already exist):**
- `projectCode` — mapped from `backend.project_code`
- `originalCompletionDate` — mapped from `backend.original_completion_date`
- `endDate` — mapped from `backend.end_date`
- `fundSource` — mapped from `backend.funding_source_name`

**Optional columns (UIProject coverage):**
- `revisedStartDate`, `revisedCompletionDate`, `contractor`, `createdAt`, `updatedAt` — all present
- Duration (days) — computed client-side from dates
- Financial Status, Last Progress Report — require UIProjectDetail; not in list endpoint; deferred

**Finding:** All required columns exist in UIProject. Only `headers` computed and Column Manager need updating.

---

### R-097: COI Recent Activity — Admin-Only Collapsible Assessment

**Current behavior:**
- `fetchRecentActivity()` called in `onMounted()` — always runs if `canViewActivity.value` is true
- Component renders regardless of fetch result (shows empty list when no data)
- Position: between analytics panels and filter bar — interrupts user flow to table

**Proposed collapsible design:**
- `v-expansion-panels` wrapping the activity section, default collapsed (`modelValue = []`)
- Header: "System Activity" with `mdi-history` icon + record count chip (loaded lazily)
- Gate: `v-if="canViewActivity"` — Staff/Contractor never see the section
- Fetch: trigger on first expand, not on mount (lazy fetch saves network on initial load)

**Finding:** Admin-only collapsible appropriate and feasible. Lazy fetch improves initial page load performance.

---

### R-098: COI Filter Complexity Analysis

**Current Advanced Filters (when expanded):**
- Project Code (1 text field)
- Original Start From/To (2 date fields), Original End From/To (2), Revised Start From/To (2), Revised End From/To (2)
= 9 fields in the advanced panel

**HCI principle:** Advanced panel should reveal at most 4-6 additional options. 9 fields simultaneously is excessive.

**Proposed 3-tier architecture:**
- **Primary (always visible):** Search + Status + Campus (3 fields, unchanged)
- **Advanced collapse panel:** Fiscal Year (v-select) + Date Range From/To (2 date pickers) = 3 additional fields
- **Full search dialog:** `v-dialog` triggered by secondary icon button — all 9 original advanced fields for power users

**Finding:** Progressive disclosure — casual users see 6 fields max; power users click through to dialog.

---

### R-099: CORE Dashboard — Module Cards Elimination

**Current Other Modules section:**
- Repair Projects card: count from `/api/repair-projects` (full list fetch for a single number)
- University Operations card: count from `/api/university-operations` (quarterly reports; count is meaningless)
- GAD Reports card: always shows 0

**Recommendation:** Eliminate stat cards entirely. Replace with navigation links inside Quick Actions or as compact link chips.

**Finding:** Remove `repairProjects`, `universityOperations`, `gadReports` refs and their API calls. "Other Modules" becomes navigation-only.

---

### R-100: Quick Actions — Optimal Pattern for CSU CORE

**Current:** 4 `size="large" block variant="outlined"` buttons in a 2-col grid

**Evaluated options:**
1. **Compact icon-link list** — `v-list` with `density="compact"`, icon + label + chevron-right. Space-efficient, familiar. Best for 4-8 actions.
2. **Speed Dial FAB** — hover-to-reveal. Inappropriate for desktop-primary app.
3. **Grouped Dropdown** — overkill for 4 items; adds click overhead.
4. **Icon button grid** — 2x2 grid of icon-only buttons. Loses label legibility.

**Recommendation:** Compact `v-list` layout with `prepend-icon`, `title`, optional `subtitle`, and `to` prop. 2-column layout on lg+.

---

### R-101: UO Summary — Information Architecture

**Current:** Single card with 8 pillar cards (4 physical + 4 financial) + 2 trend charts below

**Issues:**
- Physical + financial pillar cards visually identical — hard to distinguish at a glance
- Trend charts appended below — very long card; no collapse option
- Users who do not need trends must scroll past them

**Proposed pattern:**
- Replace 8 pillar cards with 4 compact dual-stat pillar cards (physical % + financial % per pillar side-by-side)
- Move trend charts into `v-expansion-panels` inside the UO card (default collapsed)
- Saves ~60% vertical space in collapsed state

---

### R-102: Column Manager Implementation Pattern

**Technology:** Vuetify `v-data-table` supports dynamic `:headers` prop natively.

**Pattern:**
- `ALL_COLUMNS` array with `optional: boolean` flag per column header object
- `hiddenColumns = ref<Set<string>>(new Set())` — keys of hidden optional columns
- `headers = computed(() => ALL_COLUMNS.filter(c => !c.optional || !hiddenColumns.value.has(c.key)))`
- Column selector: `v-menu` triggered by `mdi-table-column-plus-after` icon button; lists optional columns as `v-checkbox` items
- Horizontal scroll: wrap table in `<div style="overflow-x:auto">`
- localStorage persist: `watch(hiddenColumns, v => localStorage.setItem('coi_hidden_columns', JSON.stringify([...v])), { deep: true })`

**Toggleable optional columns (initial set):** Project Code, Original Start, Orig. Completion, Revised Completion, Contractor, Created Date

---

### R-103: Executive Dashboard Benchmark Summary

**Best practices (Nielsen Norman Group, Gartner EIS):**

1. **<=5 primary KPIs** on landing — more requires scanning, reduces decision speed
2. **Positive metrics first** — negative metrics in drill-down only
3. **Progressive disclosure** — summary then drill-down, not all data at once
4. **Consistent typography hierarchy** — 3 levels max: heading / value / label
5. **Navigation != primary action** — nav items use text/icon affordances, not CTA buttons
6. **Collapsible trend analytics** — executives who need trends find them; do not force scroll
7. **Table density** — `density="compact"` with fixed columns + horizontal scroll for optional columns
8. **Section guidance** — one-line subtitle per section

**Applied to CSU CORE:**
- 4 KPIs in AdminKpiRow — count is fine (<=5) but tile 2 must be positive, not "Delayed"
- Welcome header text-h4 — reduce to text-h5
- Quick Actions — compact list (navigation affordance, not CTA)
- UO trend charts — collapsible (default collapsed)

**Applied to COI:**
- 8 KPIs — reduce to 5 (remove Delayed; merge On Hold into status analytics)
- KPI value size text-h4 — reduce to text-h6 (2-level reduction)
- Negative panels — analytics tab only
- Filter bar — primary 3 fields + advanced 3 fields + full-search dialog

