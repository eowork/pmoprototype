# PMO Dashboard — Research Repository
> Research findings only. Not plans, not decisions, not history.
> **Last Updated:** 2026-06-02 | **Governance:** ACE v2.4

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

### R-012: Financial Summary Data Sources

**Topic:** Financial data availability on project entity vs separate table

**Finding:** Per-fiscal-year financial records are in `construction_project_financials` (separate table, `project.financials`). Many projects have `project.financials = []` (no FY records). However, the main project entity always has: `contractAmount` (contract cost), `financialProgress` (%), `costIncurredToDate`.

**Recommendation:** Financial Summary panel should always show contract-level KPIs (dashFinancials.appropriation, costIncurredToDate, financialProgress) and treat FY-level breakdown as supplemental. Never show "No financial records" as the only content.
