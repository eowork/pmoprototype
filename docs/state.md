# PMO Dashboard — Project State
> **Last Updated:** 2026-06-02 | **Branch:** `pmo-coi` | **Governance:** ACE v2.4

---

## Current Phase

**Phase DDD** — ✅ Complete (not yet committed to git)

**Next:** Pending operator direction. No authorized phase after DDD.

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

1. **Git backup** — commit DDD changes to `pmo-coi`
2. **Run pending DB migrations** — sdg_goals + custom_supporting_sections
3. **Backend restart** — activates `/templates/SD_ECO_*.docx` static serving
4. **Operator smoke test** — upload to 2+ repos, verify persistence after refresh
5. **Documentation refactor** — this current task

---

## Current Blockers

| Blocker | Resolution |
|---|---|
| DDD uncommitted | `git add ... && git commit && git push origin pmo-coi` |
| 3 pending migrations | `npx mikro-orm migration:up` in pmo-backend |
| `/templates/*.docx` 404 | Backend hard restart (`Ctrl+C` → `npm run start:dev`) |
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
