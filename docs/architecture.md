# PMO Dashboard — Technical Architecture Reference
> Technical blueprint only. No tasks, no research, no history.

---

## System Overview

```
pmo-backend/          NestJS + PostgreSQL + MikroORM
pmo-frontend/         Nuxt 3 + Vue 3 + Vuetify 3 + Pinia + ApexCharts
database/migrations/  PostgreSQL migration files (raw SQL)
```

**Platform:** Windows 11 | **Shell:** Bash/PowerShell | **Node:** ≥18

---

## Frontend Architecture

### Routing
- Nuxt 3 file-based routing
- Auth middleware: `auth`, `permission` on protected pages
- Public pages: no middleware, `@Public()` decorator on backend

### Key Conventions
- `<script setup lang="ts">` — Composition API only
- `withDefaults(defineProps<Props>(), {...})` — typed props
- `defineEmits<{...}>()` — typed emits
- `useApi()` composable — all HTTP via `api.get/post/patch/del/upload/download`
- `api.del()` NOT `api.delete()` — team convention
- `useToast()` — success/error notifications
- `useAuthStore()` — current user/role

### State Management
- Pinia stores for auth, global state
- Component-local `ref/reactive/computed` for per-component state
- NO Vuex

### Type System
- `~/utils/adapters.ts` — **sole source of frontend type definitions**
- `BackendXxx` interfaces = raw API response shape
- `UIXxx` interfaces = adapted for frontend consumption
- `adaptXxx()` functions = transform Backend → UI

### Styling
- Vuetify 3 components only
- No raw CSS classes (use Vuetify utility classes)
- `elevation="2" rounded="lg"` — standard card style
- Color system: primary, info, success, warning, error, teal, blue-grey, secondary

---

## Backend Architecture

### Framework
- NestJS with TypeScript
- `ValidationPipe` global: `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
- `GlobalExceptionFilter` for unified error responses

### Data Access (Hybrid Pattern)
```
CRUD Operations    → MikroORM ORM (em.find, em.persist, em.flush)
Analytics/Complex  → Raw SQL (em.getConnection().execute())
Auth/Health        → Legacy DatabaseService (DO NOT introduce new usage)
```

**Array binding in raw SQL:** `WHERE id IN (${ids.map(()=>'?').join(',')})` with flat params.
NEVER `WHERE id = ANY(?)` — Knex positional binding flattens arrays causing syntax error.

### Entity Conventions
- `@Entity({ tableName: 'snake_case' })`
- `@PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })`
- `@Filter({ name: 'notDeleted', cond: { deletedAt: null }, default: true })` on soft-deletable entities
- `deleted_at` timestamp = soft delete; never hard-delete users or projects

### Service Conventions
- `findOne()` before update/delete (throws NotFoundException if missing)
- `fireLog(user, ActivityAction.X, entityId, metadata)` after every CUD operation
- `fireLog` is fire-and-forget: `void this.activityLog.logAction(...).catch(() => {})`
- `ActivityLogService.logAction()` MUST use `em.fork()` — prevents tx race with caller queries

### Activity Logging
```typescript
enum ActivityAction {
  CREATE, UPDATE, DELETE, SUBMIT, PUBLISH, REJECT, WITHDRAW,
  UPLOAD, REMOVE_ATTACHMENT, DOWNLOAD, BATCH_UPLOAD,
  REMARKS_UPDATE, TEMPLATE_UPLOAD
}
```
Logs stored in `activity_logs` table: `user_id, user_email, user_name, action, entity_type, entity_id, metadata, created_at`

---

## Database Architecture

### Core Tables
```
projects                    ← UO + legacy shared projects
construction_projects       ← COI projects (primary entity)
construction_milestones     ← Per-project milestones
construction_progress_reports ← WAR/MPR records
construction_gallery        ← Project images
construction_documents      ← All attachments (files + links)
construction_document_types ← Seeded taxonomy (READONLY)
construction_document_folders ← Folder hierarchy (CONTAINER/FORM/TEMPLATE/SUBMISSIONS)
construction_document_checklist ← CPES compliance tracking
record_assignments          ← User-to-project assignments
activity_logs               ← Audit trail
users                       ← System users
fiscal_years                ← UO fiscal year config
```

### Migration Conventions
- Raw SQL files: `database/migrations/NNN_description.sql`
- MikroORM TS migrations: `pmo-backend/src/database/mikro-migrations/MigrationYYYYMMDDHHmmss_Description.ts`
- Always `IF NOT EXISTS` / `IF EXISTS` — idempotent
- Never drop columns with data — use soft deprecation

### Soft Delete Pattern
All entities: `deleted_at TIMESTAMPTZ NULL` + `deleted_by UUID NULL`
Filter applied by default: `deleted_at IS NULL`

### Key JSONB Columns (construction_projects)
```
rdp_alignment           string[]  — RDP chapter keys
socioeconomic_agenda    string[]  — SEA item keys
csu_likha_goals         string[]  — LIKHA_x keys
sdg_goals               string[]  — SDG_n keys
beneficiary_list        string[]
additional_funding_sources {type, name, notes}[]
remarks_log             {text, author, created_at}[]
personnel_groups        {csu: [], contractor: [], others: []}
custom_key_sections     {id, label, typeCode}[]
custom_supporting_sections {id, label, typeCode}[]
status_updates          {date, text}[]
readiness_documents     {type, status, remarks}[]
signatories             {name, position, date}[]
incident_log            {date, severity, description, status}[]
risk_register           {risk, likelihood, impact, mitigation, status}[]
escalation_records      {escalatedTo, date, issue, resolution}[]
```

---

## RBAC Model

### Roles
```
SuperAdmin  → Full system access
Admin       → Module management, user administration
Staff       → Data entry within assigned module scope
Viewer      → Read-only access
Auditor     → Activity log access, no data modification
Contractor  → Restricted repository access (assigned projects only)
```

### Enforcement
- Server-side: `@Roles('Admin', 'Staff')` + `RolesGuard`
- Frontend: `usePermissions()` composable + `canUpload`/`canDelete` props
- Public routes: `@Public()` decorator (no JWT guard)
- Contractor isolation: `record_assignments` table

---

## Attachment Architecture

### CiAttachmentHub — Hub Component
Single attachment renderer for all COI project pages.

**Modes:** `staging` (new.vue) | `edit` (edit-[id].vue) | `view` (detail-[id].vue)

**Sections (tabs):**
```
checklist    → CiDocumentChecklist (CPES compliance tracker, eager mount)
key          → CiRepositoryCard grid (Project Profile, Feasibility, HGDG, etc.)
gallery      → Thumbnail strip + CiGalleryModal
supporting   → CiRepositoryCard grid (SD_ORDERS/SD_REPORTS/SD_CERTS/ECO_FORMS by seeded typeCode)
cpes         → CiRepositoryCard grid (CPES_DOCS seeded types)
other        → Single "Miscellaneous" CiRepositoryCard (__MISC__ sentinel)
audit        → CiAuditLogPanel
```

**Critical constraints:**
- Shared `CiRepositoryModal` instance: `uploadType` resets to `typeCodes[0]` on every open
- External links: `onRepoLink()` POSTs with `externalLink` (no mimeType in body)
- `__MISC__` sentinel typeCode → `activeRepoDocs` returns `otherDocs` (non-managed docs)
- `checklistRef` is never null because checklist window-item uses `eager`

### Repository Modal — Shared Instance
`CiRepositoryModal.vue` receives `:documents="activeRepoDocs"` filtered by typeCode.

**Sections:** Files list | External Links list (separate sections, DDD/ZZZ)
**Actions:** Download (authenticated blob), Copy URL (clipboard), Delete (with permission)

### Document Entity
```
documents table:
  id, documentable_type='CONSTRUCTION_PROJECT', documentable_id,
  document_type (typeCode), file_name, file_path, file_size, mime_type,
  description, version (auto-increment per folder), uploaded_by,
  folder_id (nullable), lifecycle_status='ACTIVE', deleted_at
```
Links stored with `mime_type='application/x-external-link'` or `'application/x-google-drive-link'`

### Document Folder Hierarchy
```
CONTAINER  ← Top-level group (SD_ORDERS, SD_REPORTS, etc.)
  FORM       ← Named form/template
    TEMPLATE   ← Downloadable official template
    SUBMISSIONS ← Upload target; version auto-increments
```

---

## Gallery Architecture

```
construction_gallery:
  id, project_id, image_url, caption, category, is_featured,
  image_taken_date, uploaded_at, created_by
```

**Categories:** `PROFILE` (carousel), `IN_PROGRESS`, `COMPLETED`, `INSPECTION`, etc.

**Carousel rule:** `profileImages.first || gallery.all` — PROFILE category shown first.

**Static serving:** `pmo-backend/public/templates/` served at `/templates/` via `useStaticAssets`.

---

## Naming Conventions

### Backend
- Controllers: `construction-projects.controller.ts`
- Services: `construction-projects.service.ts`
- Entities: `ConstructionProject` entity class, `construction_projects` table
- DTOs: `snake_case` fields (match database column names)
- Route params: `:id` (UUID)

### Frontend
- Components: `CiXxx.vue` (COI prefix)
- Composables: `useXxx.ts`
- Pages: `detail-[id].vue`, `new.vue`, `edit-[id].vue`
- Utils: `adapters.ts`, `coiHierarchies.ts`, `coiFormState.ts`

### CSS / Styling
- Vuetify utility classes preferred
- Scoped `<style scoped>` for component-specific overrides
- `.overview-grid { align-items: flex-start }` — prevents sibling panel stretching

---

## Key URLs

| Route | Purpose |
|---|---|
| `GET /api/construction-projects` | List COI projects |
| `GET /api/construction-projects/:id` | Project detail (includes milestones, progress_reports) |
| `POST /api/construction-projects/:id/documents` | Upload file OR register external link |
| `GET /api/construction-projects/:id/documents` | List all documents (`IN(?,…)` not `ANY(?)`) |
| `GET /api/construction-projects/:id/document-folders` | Folder tree `{data: FolderNode[]}` |
| `GET /api/public/construction-projects` | Public listing (no auth) |
| `GET /templates/SD_ECO_001.docx` | Served by useStaticAssets — requires backend restart |
