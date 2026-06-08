# PMO Dashboard — Project State
> **Last Updated:** 2026-06-08
> **Branch:** `pmo-coi`
> **Governance:** ACE v2.4
> **Note:** This file is a secondary reference. Authoritative current state is in `docs/state.md`.

---

## Current Status

| Dimension | Status |
|---|---|
| **Active Module** | COI Dashboard + CSU CORE Dashboard |
| **Current Phase** | Phase KKK + LLL — Phase 1 (Research R-088–R-103) + Phase 2 (Plan) complete. PENDING Phase 3 authorization. |
| **Last Commit** | `0643c6c` — Phase III (COI analytics tier 2) + Phase JJJ (CORE trend charts) |
| **Next Commit Pending** | Phase KKK (CORE executive refactor) + Phase LLL (COI executive refactor) — pending RUN_ACE |
| **Deployment Readiness** | Controlled Pilot — operator smoke test required after backend restart |
| **Backend Status** | Running — restart required to activate `/templates/SD_ECO_*.docx` static serving |
| **TypeScript Status** | ✅ 0 new errors — vue-tsc + tsc both clean after GGG/HHH |
| **Migrations Pending** | 7 migrations (sdg_goals, custom_supporting_sections, war/mpr fields, notes_banking, concerns_list, billing fields) |
| **Test Coverage** | Manual (operator smoke test protocol — no automated tests) |

---

## Active Modules

### Construction of Infrastructure (COI) — PRIMARY
- **Branch:** `pmo-coi`
- **Files:** `pages/coi/detail-[id].vue`, `new.vue`, `edit-[id].vue`, `CiAttachmentHub.vue`, `CiRepositoryModal.vue`
- **Components:** 29 CiXxx components
- **Completion:** ~88%

### University Operations — STABLE
- Physical Accomplishment: 96% ✅
- Financial Accomplishment: 94% ✅
- Quarterly Report lifecycle: 92% ✅

---

## Active Blockers

| Blocker | Impact | Resolution |
|---|---|---|
| Backend restart required | `/templates/SD_ECO_*.docx` returns 404 until restart | Operator restarts `npm run start:dev` |
| 3 pending DB migrations | sdg_goals, custom_supporting_sections columns | Run `npx mikro-orm migration:up` |
| Pre-existing ApexOptions TS2322 | Non-blocking — existing chart config type mismatch | Deferred — out of scope |

---

## Completion Percentages

| Area | % |
|---|---|
| COI Module | ~88% |
| University Operations | ~92% |
| Shared Services / Auth | 90% |
| Attachment Repository | 85% |
| **Overall Project** | **~88%** |

---

## Security Status

- JWT + RBAC guards: ✅ Operational
- Role-based route protection: ✅
- Activity logging (UPLOAD/DOWNLOAD/REMOVE/FOLDER): ✅
- File upload validation: ⚠️ Frontend-side only — server-side MIME hardening pending
- Rate limiting: ⚠️ Not implemented
- Section-level permission overrides: ⚠️ Design only

---

## Key Constraints

1. `detail-[id].vue` must stay **READ-ONLY** — no CRUD affordances regardless of role
2. Backend route `/api/construction-projects` is IMMUTABLE
3. `pmo-frontend/utils/adapters.ts` is the ONLY place frontend type interfaces are defined
4. `api.del()` not `api.delete()` for all DELETE calls
5. `ActivityAction.UPDATE` is fired for checklist changes (includes changedFields diff)
6. `em.fork()` required in `ActivityLogService.logAction` (fire-and-forget EM isolation)
7. Milestone tab CRUD removed from edit page — backend endpoints and read-only display preserved
8. Gallery carousel shows PROFILE-category images first

---

## Deployment Checklist (Per Sprint)

- [ ] Run pending migrations
- [ ] Hard-restart backend (`Ctrl+C` → `npm run start:dev`)
- [ ] Smoke test: upload to 2+ different repos (Key + Supporting) — verify each persists
- [ ] Smoke test: `/templates/SD_ECO_001.docx` returns 200
- [ ] Smoke test: PATCH /api/construction-projects/:id — no 500 (em.fork fix active)
