

---

## Phase ZW — DB Migration: Expand Document Type Taxonomy (ECO Forms + Supporting Documents)

**Research reference:** §2.248-A, §2.248-B
**File:** New MikroORM migration `Migration20260527020000_ExpandDocumentTypeTaxonomy.ts`
**Authorized:** ⬜ (awaiting Phase 3 RUN_ACE)

### Governance Directives (ZW)

| ID | Directive |
|----|-----------|
| ZW-D1 | All 25 new type codes use `is_required = FALSE`. These are evidence/submission types, not mandatory compliance items. |
| ZW-D2 | `KEY_DOC_TYPECODES` in `coiFormState.ts` is UNCHANGED. ECO Forms and SD types are separate repositories. |
| ZW-D3 | The existing GROUP_1–GROUP_6 rows must not be modified. Only the check constraint is altered. |
| ZW-D4 | Contractor-specific certificates (GYM/IEB x 4 contractors) are ad-hoc examples — NOT seeded as system type codes. |
| ZW-D5 | SD-ECO-ECO-019 assigned to "Mandatory Certification - LUDIP" (no official SD code in the image). |

### Steps

- [ ] ZW-1: Create `Migration20260527020000_ExpandDocumentTypeTaxonomy.ts` in `pmo-backend/src/database/mikro-migrations/`
- [ ] ZW-2: `up()` — ALTER check constraint:
  ```sql
  ALTER TABLE construction_document_types
    DROP CONSTRAINT IF EXISTS construction_document_types_group_code_check;
  ALTER TABLE construction_document_types
    ADD CONSTRAINT construction_document_types_group_code_check
    CHECK (group_code IN (
      'GROUP_1','GROUP_2','GROUP_3','GROUP_4','GROUP_5','GROUP_6',
      'ECO_FORMS','SD_ORDERS','SD_REPORTS','SD_CERTS'
    ));
  ```
- [ ] ZW-3: `up()` — INSERT ECO Forms (6 types):
  ```sql
  INSERT INTO construction_document_types
    (group_code, group_label, type_code, type_label, is_required, sort_order)
  VALUES
    ('ECO_FORMS','ECO Forms','F_ECO_001','Data Request Form',FALSE,1),
    ('ECO_FORMS','ECO Forms','F_ECO_002','Service Request Form',FALSE,2),
    ('ECO_FORMS','ECO Forms','F_ECO_003','Initial Project Proposal Form',FALSE,3),
    ('ECO_FORMS','ECO Forms','F_ECO_004','Concrete Pouring Record (CPR)',FALSE,4),
    ('ECO_FORMS','ECO Forms','F_ECO_005','Pre-Inspection Form',FALSE,5),
    ('ECO_FORMS','ECO Forms','F_ECO_006','Contract Time Extension Request',FALSE,6)
  ON CONFLICT (type_code) DO NOTHING;
  ```
- [ ] ZW-4: `up()` — INSERT SD Orders (7 types):
  ```sql
  INSERT INTO construction_document_types
    (group_code, group_label, type_code, type_label, is_required, sort_order)
  VALUES
    ('SD_ORDERS','Supporting Docs — Orders','SD_ECO_001','Variation Order',FALSE,1),
    ('SD_ORDERS','Supporting Docs — Orders','SD_ECO_002','Work Suspension Order',FALSE,2),
    ('SD_ORDERS','Supporting Docs — Orders','SD_ECO_003','Work Resumption Order',FALSE,3),
    ('SD_ORDERS','Supporting Docs — Orders','SD_ECO_004','Contract Time Extension Order',FALSE,4),
    ('SD_ORDERS','Supporting Docs — Orders','SD_ECO_005','Notice of Non-Compliance',FALSE,5),
    ('SD_ORDERS','Supporting Docs — Orders','SD_ECO_006','Show Cause Order',FALSE,6),
    ('SD_ORDERS','Supporting Docs — Orders','SD_ECO_007','Notice of Termination',FALSE,7)
  ON CONFLICT (type_code) DO NOTHING;
  ```
- [ ] ZW-5: `up()` — INSERT SD Reports & Monitoring (8 types):
  ```sql
  INSERT INTO construction_document_types
    (group_code, group_label, type_code, type_label, is_required, sort_order)
  VALUES
    ('SD_REPORTS','Supporting Docs — Reports & Monitoring','SD_ECO_008','Construction Logbook',FALSE,1),
    ('SD_REPORTS','Supporting Docs — Reports & Monitoring','SD_ECO_009','Weekly Accomplishment Report',FALSE,2),
    ('SD_REPORTS','Supporting Docs — Reports & Monitoring','SD_ECO_010','Monthly Progress Report',FALSE,3),
    ('SD_REPORTS','Supporting Docs — Reports & Monitoring','SD_ECO_011','Site Instruction',FALSE,4),
    ('SD_REPORTS','Supporting Docs — Reports & Monitoring','SD_ECO_012','Site Inspection Report',FALSE,5),
    ('SD_REPORTS','Supporting Docs — Reports & Monitoring','SD_ECO_013','Project Inspection Report',FALSE,6),
    ('SD_REPORTS','Supporting Docs — Reports & Monitoring','SD_ECO_014','Quality Assessment Report',FALSE,7),
    ('SD_REPORTS','Supporting Docs — Reports & Monitoring','SD_ECO_015','Safety Compliance Report',FALSE,8)
  ON CONFLICT (type_code) DO NOTHING;
  ```
- [ ] ZW-6: `up()` — INSERT SD Certifications (4 types):
  ```sql
  INSERT INTO construction_document_types
    (group_code, group_label, type_code, type_label, is_required, sort_order)
  VALUES
    ('SD_CERTS','Supporting Docs — Certifications','SD_ECO_016','Certificate of Site Inspection',FALSE,1),
    ('SD_CERTS','Supporting Docs — Certifications','SD_ECO_017','Certificate of Completion',FALSE,2),
    ('SD_CERTS','Supporting Docs — Certifications','SD_ECO_018','Certificate of Final Acceptance',FALSE,3),
    ('SD_CERTS','Supporting Docs — Certifications','SD_ECO_019','Mandatory Certification (LUDIP)',FALSE,4)
  ON CONFLICT (type_code) DO NOTHING;
  ```
- [ ] ZW-7: `down()` — Remove inserted rows + restore original constraint:
  ```sql
  DELETE FROM construction_document_types WHERE group_code IN ('ECO_FORMS','SD_ORDERS','SD_REPORTS','SD_CERTS');
  ALTER TABLE construction_document_types DROP CONSTRAINT IF EXISTS construction_document_types_group_code_check;
  ALTER TABLE construction_document_types
    ADD CONSTRAINT construction_document_types_group_code_check
    CHECK (group_code IN ('GROUP_1','GROUP_2','GROUP_3','GROUP_4','GROUP_5','GROUP_6'));
  ```
- [ ] ZW-8: **OPERATOR ACTION REQUIRED** — run `npx mikro-orm migration:up` from `pmo-backend/` (applies ZM + ZS + ZW in sequence if all pending)

*Phase ZW complete when: `construction_document_types` has 52 active rows (27 original + 25 new); `GET /api/construction-projects/document-types` returns all 52 grouped correctly.*

---

## Phase ZX — Backend: Grouped Document Types Endpoint + Bulk Template Status

**Research reference:** §2.248-H, §2.248-B
**Files:** `construction-projects.service.ts`, `construction-projects.controller.ts`
**Authorized:** ⬜ (awaiting Phase 3 RUN_ACE)

### Steps

- [ ] ZX-1: **Extend `findDocumentTypes()`** to return grouped structure accepted by the frontend hub:
  ```typescript
  async findDocumentTypesGrouped(): Promise<{ groupCode: string; groupLabel: string; types: ConstructionDocumentType[] }[]> {
    const all = await this.docTypeRepo.find({ isActive: true }, { orderBy: { groupCode: 'asc', sortOrder: 'asc' } })
    const groups = new Map<string, { groupCode: string; groupLabel: string; types: ConstructionDocumentType[] }>()
    for (const t of all) {
      if (!groups.has(t.groupCode)) groups.set(t.groupCode, { groupCode: t.groupCode, groupLabel: t.groupLabel, types: [] })
      groups.get(t.groupCode)!.types.push(t)
    }
    return Array.from(groups.values())
  }
  ```
  - Add new route `GET /document-types/grouped` alongside existing `GET /document-types`
  - Existing flat endpoint unchanged (backward compat)

- [ ] ZX-2: **Template bulk status endpoint** — `GET /document-types/template-status` returns a flat map `{ typeCode: string, templateUrl: string | null }[]` for all types. Used by the hub to show "template available" indicators without fetching the full type list again.
  - Implementation: SELECT id, type_code, template_url FROM construction_document_types WHERE is_active = true

- [ ] ZX-3: **Wire new controller routes** (must be ABOVE the `:id` route to avoid UUID collision):
  ```typescript
  @Get('document-types/grouped')
  @Roles('Admin', 'Staff', 'Viewer', 'Auditor')
  findDocumentTypesGrouped() { return this.service.findDocumentTypesGrouped() }

  @Get('document-types/template-status')
  @Roles('Admin', 'Staff', 'Viewer', 'Auditor')
  getDocumentTypeTemplateStatus() { return this.service.getDocumentTypeTemplateStatus() }
  ```

*Phase ZX complete when: `GET /document-types/grouped` returns ECO_FORMS, SD_ORDERS, SD_REPORTS, SD_CERTS groups alongside GROUP_1–6; `GET /document-types/template-status` returns templateUrl per typeCode.*

---

## Phase ZY — Frontend: Core Hub Infrastructure (Filter Composable + Repository Cards + Hub Sections 1, 2, 5, 6, 7)

**Research reference:** §2.248-F, §2.248-G, §2.248-H
**Files:** New `composables/useAttachmentFilter.ts`, new `components/coi/CiRepositoryCard.vue`, new `components/coi/CiRepositoryModal.vue`, new `components/coi/CiAttachmentHub.vue`
**Authorized:** ⬜ (awaiting Phase 3 RUN_ACE)

### Governance Directives (ZY)

| ID | Directive |
|----|-----------|
| ZY-D1 | `CiAttachmentHub.vue` is the ONLY place attachment sections are rendered going forward. detail/edit/new pages delegate entirely to this component. |
| ZY-D2 | The hub must be backward-compatible: existing `canUpload`, `canDelete`, `canEditRemarks` prop API unchanged. |
| ZY-D3 | Gallery data fetched via `GET /api/construction-projects/:id/gallery` within the hub (same as current detail-[id].vue). |
| ZY-D4 | `api.del()` not `api.delete()` — JB-D3 directive preserved. |
| ZY-D5 | Upload forms hidden by default; shown only when user clicks "Upload" button (progressive disclosure). |

### Steps

**ZY-1: `useAttachmentFilter` composable** (`pmo-frontend/composables/useAttachmentFilter.ts`)
- [ ] ZY-1a: Implement composable with `searchText`, `filterType`, `filterSection`, `filterDateFrom`, `filterDateTo`, `filterStatus` refs
- [ ] ZY-1b: `matchesDoc(doc)` — AND-evaluates all active filters against a document row
- [ ] ZY-1c: `matchesGallery(img)` — evaluates text + date filters against a gallery row
- [ ] ZY-1d: `activeCount` computed + `reset()` function
- [ ] ZY-1e: Filter UI sub-component: always-visible search bar + collapsible advanced panel showing active filter chips with `activeCount` badge

**ZY-2: `CiRepositoryCard.vue`** (`pmo-frontend/components/coi/CiRepositoryCard.vue`)
- [ ] ZY-2a: Props: `title`, `icon`, `color`, `docCount`, `completedCount`, `totalTypes`, `latestUpload`, `canUpload`, `loading`
- [ ] ZY-2b: Emits: `open` (full modal), `upload` (quick upload trigger)
- [ ] ZY-2c: Template: card with header (icon + title + count chip), completion progress bar, latest upload line, two action buttons ("Open Repository" + optional "↑ Upload")
- [ ] ZY-2d: Completion bar formula: `completedCount / totalTypes` (types with at least one submitted document)

**ZY-3: `CiRepositoryModal.vue`** (`pmo-frontend/components/coi/CiRepositoryModal.vue`)
- [ ] ZY-3a: Props: `title`, `icon`, `color`, `projectId`, `typeCodes: string[]`, `canUpload`, `canDelete`, `mode: 'view'|'edit'|'staging'`
- [ ] ZY-3b: Fetches documents filtered by `typeCodes` from parent's already-fetched `documents` prop (no extra API call)
- [ ] ZY-3c: Shows: grouped file list per typeCode, downloadable blank template chip per type (if `templateUrl`), upload form (if canUpload, hidden by default), submission history button per file
- [ ] ZY-3d: Filter bar inside modal using `useAttachmentFilter`
- [ ] ZY-3e: Staging mode: renders staged files list, "Add File" action queues to parent

**ZY-4: `CiAttachmentHub.vue` — core structure + Sections 1, 2, 5, 6, 7**
- [ ] ZY-4a: Props + emits interface (see §2.248-F)
- [ ] ZY-4b: `fetchDocuments()` — GET `/api/construction-projects/:id/documents`
- [ ] ZY-4c: `fetchGallery()` — GET `/api/construction-projects/:id/gallery`
- [ ] ZY-4d: `fetchDocTypes()` — GET `/document-types/grouped` (lazy, on mount)
- [ ] ZY-4e: Internal section navigation — horizontal `v-tabs` within the hub, collapsible to a select dropdown on mobile
- [ ] ZY-4f: **Section 1 — Key Documents**: preview card (5 items, overflow chip), fullscreen modal with `<CiRepositoryModal>` using `KEY_DOC_TYPECODES`, upload form gated by `canUpload`, drag-and-drop zone
- [ ] ZY-4g: **Section 2 — Gallery**: Profile/General inner tabs, 5-item grid preview, upload form (profile + general) gated by `canUpload`, fullscreen modal
- [ ] ZY-4h: **Section 5 — Compliance Checklist**: delegates to `<CiDocumentChecklist :can-edit="canUpload" :can-edit-remarks="canEditRemarks" :documents="documents" />`
- [ ] ZY-4i: **Section 6 — Other Attachments**: documents not in any known typeCode group + external links + MOV evidence read-only; upload form gated by `canUpload`
- [ ] ZY-4j: **Section 7 — Audit Log**: delegates to `<CiAuditLogPanel :project-id="projectId" />`

*Phase ZY complete when: `CiAttachmentHub` renders all five sections correctly in isolation; filter composable narrows all section lists simultaneously; repository cards show correct counts.*

---

## Phase ZZ-A — Frontend: Hub Sections 3 & 4 (ECO Forms + Supporting Documents Repositories)

**Research reference:** §2.248-A, §2.248-F, §2.248-H
**File:** `pmo-frontend/components/coi/CiAttachmentHub.vue` (extend)
**Authorized:** ⬜ (awaiting Phase 3 RUN_ACE)

### Steps

- [ ] ZZ-A-1: **Section 3 — ECO Forms**: dedicated section for `ECO_FORMS` group
  - Show each F-ECO type as a row: type label + "Download Blank Form" chip (if `templateUrl`) + Submit/Resubmit button (links to checklist submission via `CiDocumentChecklist` submit dialog)
  - Heading: "ECO Forms" with info tooltip explaining these are standard forms for download and submission
  - Read-only in `mode='view'`; submit button visible in `mode='edit'` for `canUpload`

- [ ] ZZ-A-2: **Section 4 — Supporting Documents**: three `<CiRepositoryCard>` instances in a grid:
  - **Orders card**: typeCodes `['SD_ECO_001'..'SD_ECO_007']`, icon `mdi-file-document-edit`, color `deep-orange`
  - **Reports & Monitoring card**: typeCodes `['SD_ECO_008'..'SD_ECO_015']`, icon `mdi-clipboard-text`, color `blue`
  - **Certifications card**: typeCodes `['SD_ECO_016'..'SD_ECO_019']`, icon `mdi-certificate`, color `green`

- [ ] ZZ-A-3: **Repository modal wiring**: each card's `open` emit opens a single shared `<CiRepositoryModal>` with the card's `typeCodes` + `title` + `color`; `upload` emit opens the modal with the upload form pre-expanded

- [ ] ZZ-A-4: **Completion stats computation** for each card:
  - `docCount`: `documents.value.filter(d => typeCodes.includes(d.documentType)).length`
  - `completedCount`: count of unique typeCodes that have at least one submitted document
  - `totalTypes`: `typeCodes.length`
  - `latestUpload`: max `createdAt` among filtered documents

- [ ] ZZ-A-5: **Staging mode for Section 4**: In `mode='staging'`, repository modal's upload form queues staged docs into `pendingDocs` with the appropriate `documentType`; no API calls

*Phase ZZ-A complete when: Section 3 shows all 6 ECO forms with template chips; Section 4 shows 3 repository cards with correct completion stats; clicking "Open Repository" shows the modal with all matching docs and blank form templates.*

---

## Phase ZZ-B — Frontend: Sync detail-[id].vue, edit-[id].vue, new.vue to Use CiAttachmentHub

**Research reference:** §2.248-E, §2.248-I
**Files:** `pmo-frontend/pages/coi/detail-[id].vue`, `pmo-frontend/pages/coi/edit-[id].vue`, `pmo-frontend/pages/coi/new.vue`
**Authorized:** ⬜ (awaiting Phase 3 RUN_ACE)

### Governance Directives (ZZ-B)

| ID | Directive |
|----|-----------|
| ZZ-B-D1 | The attachment window-item in all three pages is replaced with a single `<CiAttachmentHub>` call. All attachment state (documents, gallery, docTypes) moves into the hub. |
| ZZ-B-D2 | `detail-[id].vue`: `fetchDocuments()` and `fetchGallery()` calls stay on the page only if other parts of the page need them. If only the attachment tab uses them, move entirely into hub. |
| ZZ-B-D3 | `new.vue`: `pendingDocs`, `pendingImages`, `pendingLinks` are replaced by the hub's staging queue exposed via `@update:pending-queue`. The `handleCreate()` upload loop reads from `pendingQueue.value`. |
| ZZ-B-D4 | The fullscreen dialog refs (`keyDocsFullscreen`, `galleryFullscreen`, etc.) are removed from the page scope — they move into the hub. |
| ZZ-B-D5 | No regression: all existing functionality (upload, delete, filter, checklist, audit log) must work identically after this replacement. |

### Steps

**detail-[id].vue:**
- [ ] ZZ-B-1: Remove the entire documents window-item content (lines ~2971–3120 currently)
- [ ] ZZ-B-2: Replace with: `<CiAttachmentHub :project-id="projectId" mode="view" :can-upload="false" :can-delete="false" :can-edit-remarks="canEditCurrentProject" />`
- [ ] ZZ-B-3: Remove now-orphaned local refs: `attachmentFilter`, `attachmentMatches`, `documentFiles`, `documentLinks`, `documentsByType`, `docsWindowOpen`, `docsWindowSearch`, `docsWindowSort`, `filteredAllDocs`, `keyDocuments`, `generalGalleryImages`, `docsWindowCategories`
- [ ] ZZ-B-4: Retain `fetchDocuments()` and `fetchGallery()` calls in `onMounted` ONLY if used outside the attachment tab (e.g., overview tab shows profile gallery). Otherwise remove.

**edit-[id].vue:**
- [ ] ZZ-B-5: Remove the attachment window-item content (lines ~2539–2872 currently)
- [ ] ZZ-B-6: Replace with:
  ```html
  <CiAttachmentHub
    :project-id="projectId"
    mode="edit"
    :can-upload="canUploadDocuments"
    :can-delete="canDeleteResources"
    :can-edit-remarks="canEditCurrentProject"
  />
  ```
- [ ] ZZ-B-7: Remove now-orphaned refs: `attachmentFilter`, `filteredKeyDocs`, `filteredOtherDocs`, `filteredProfileGallery`, `filteredGeneralGallery`, `keyDocFile`, `keyDocType`, `keyDocTitle`, `keyDocUploading`, `keyDocsFullscreen`, `galleryFullscreen`, `checklistFullscreen`, `otherDocsFullscreen`, `handleKeyDocDrop`, `handleOtherDocDrop`, `uploadKeyDoc`
- [ ] ZZ-B-8: Retain `existingDocs` ref only if used elsewhere in the edit page (e.g., MOV section, document picker). If not, remove entirely.

**new.vue:**
- [ ] ZZ-B-9: Add `pendingQueue` ref: `const pendingQueue = ref<StagedQueue>({ docs: [], images: [], links: [] })`
- [ ] ZZ-B-10: Replace documents window-item content with:
  ```html
  <CiAttachmentHub
    mode="staging"
    :can-upload="true"
    :can-delete="true"
    :model-value="pendingQueue"
    @update:model-value="pendingQueue = $event"
  />
  ```
- [ ] ZZ-B-11: Update `handleCreate()` to read from `pendingQueue.value.docs`, `pendingQueue.value.images`, `pendingQueue.value.links` instead of `pendingDocs.value`, `pendingImages.value`, `pendingLinks.value`
- [ ] ZZ-B-12: Remove old `pendingDocs`, `pendingImages`, `pendingLinks` refs and all associated `addPending*` functions

*Phase ZZ-B complete when: All three pages render the attachment section exclusively via `<CiAttachmentHub>`; no triplication of attachment logic remains; functional regression test confirms upload, delete, filter, checklist, gallery, Supporting Documents, ECO Forms, and audit log all work correctly from each page.*

---

### Phase ZW–ZZ Verification Checklist

| ID | Test | Status |
|----|------|--------|
| ZW-V1 | `construction_document_types` has 52 rows; new group codes exist | ⬜ |
| ZW-V2 | `GET /document-types` returns all 52 types including F_ECO_001..006 and SD_ECO_001..018 | ⬜ |
| ZX-V1 | `GET /document-types/grouped` returns 10 groups (GROUP_1..6 + ECO_FORMS + SD_ORDERS + SD_REPORTS + SD_CERTS) | ⬜ |
| ZX-V2 | `GET /document-types/template-status` returns flat map with `templateUrl` per typeCode | ⬜ |
| ZY-V1 | `useAttachmentFilter` — typing in search bar narrows Key Docs, Gallery, Other Attachments simultaneously | ⬜ |
| ZY-V2 | Applying date filter narrows results; reset clears all filters | ⬜ |
| ZY-V3 | `CiRepositoryCard` shows correct docCount, completedCount/totalTypes bar, latest upload | ⬜ |
| ZY-V4 | Clicking "Open Repository" on any card opens modal with correct document list | ⬜ |
| ZY-V5 | Section 1 (Key Docs) — preview shows ≤5 items; overflow chip opens fullscreen modal | ⬜ |
| ZY-V6 | Section 2 (Gallery) — Profile/General tabs work; upload form hidden by default | ⬜ |
| ZY-V7 | Section 5 (Checklist) — existing checklist functionality unchanged (remarks, submit, history) | ⬜ |
| ZY-V8 | Section 6 (Other Attachments) — existing links/MOV visible; upload hidden by default | ⬜ |
| ZY-V9 | Section 7 (Audit Log) — CiAuditLogPanel renders at bottom | ⬜ |
| ZZ-A-V1 | Section 3 (ECO Forms) — all 6 F-ECO types shown; types with templateUrl show "Download Blank Form" chip | ⬜ |
| ZZ-A-V2 | Section 4 (Supporting Docs) — 3 repository cards visible; Orders card counts only SD_ECO_001..007 documents | ⬜ |
| ZZ-A-V3 | Opening Orders modal shows 7 type rows; each row with template chip if templateUrl is set | ⬜ |
| ZZ-A-V4 | Uploading a file from the modal creates a Document row with correct typeCode | ⬜ |
| ZZ-B-V1 | `detail-[id].vue` Attachments tab renders via CiAttachmentHub; no broken refs or console errors | ⬜ |
| ZZ-B-V2 | `edit-[id].vue` Attachments tab renders via CiAttachmentHub; upload/delete/filter all work | ⬜ |
| ZZ-B-V3 | `new.vue` Attachments tab renders via CiAttachmentHub (staging); files staged; after save, files uploaded correctly | ⬜ |
| ZZ-B-V4 | No triplication: attachment logic exists only in CiAttachmentHub and its sub-components | ⬜ |
| ZZ-B-V5 | RBAC correct: Viewer sees read-only hub; Contributor can upload but not delete; Admin can upload and delete | ⬜ |

---

*Phase ZW–ZZ plan complete (§2.248). Awaiting Phase 3 authorization (RUN_ACE).*
