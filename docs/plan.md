# PMO Dashboard — Active Implementation Plan
> **Governance:** ACE v2.4 | **Branch:** `pmo-coi`
> **Last Updated:** 2026-06-02
> **Rule:** Only active, approved, pending work. Completed items → `history.md`.

---

## IMMEDIATE ACTIONS (No Phase Authorization Needed)

### GIT-1: Commit DDD Changes
```bash
git add docs/ pmo-backend/src/ pmo-frontend/
git commit -m "feat: COI Phase DDD + docs refactor"
git push origin pmo-coi
```
**Acceptance:** `git log --oneline -1` shows new commit pushed to pmo-coi.

### OPS-1: Run Pending Migrations
```bash
cd pmo-backend && npx mikro-orm migration:up
```
**Migrations pending:**
- `Migration20260602000000_AddSdgGoalsToConstructionProjects`
- `Migration20260603000000_AddCustomSupportingSections`

**Acceptance:** No migration errors; columns `sdg_goals` and `custom_supporting_sections` exist in `construction_projects`.

### OPS-2: Backend Restart
```bash
cd pmo-backend && npm run start:dev
```
**Acceptance:** `GET /templates/SD_ECO_001.docx` → 200 (not 404).

---

## SMOKE TEST PROTOCOL (After OPS-1 and OPS-2)

| # | Test | Expected |
|---|---|---|
| 1 | Open project with documents → Key Documents tab | Files visible; no 500 in network tab |
| 2 | Upload file to Key Documents repo A | File appears in A immediately |
| 3 | Open repo B (different typeCode), upload | File appears in B (not A) |
| 4 | Refresh page | Both files still in their repos |
| 5 | Submit external link to any repo | Link appears in "External Links" section |
| 6 | Open Supporting Documents tab | CPES/SD cards render (no accordion) |
| 7 | Upload to CPES repo | Compliance Checklist updates (no tab switch needed) |
| 8 | Open analytics tab | 4 KPI sections visible before charts |
| 9 | Open Team tab | Personnel cards visible |
| 10 | PATCH project → view network tab | No 500 errors |

---

## PENDING OPERATOR VERIFICATIONS

### VER-1: Gallery Carousel Behavior
- [ ] Gallery images with non-PROFILE category do NOT appear in carousel
- [ ] PROFILE-tagged images DO appear in carousel
- [ ] Carousel height is consistent at 280px regardless of image dimensions
- [ ] Full-view modal shows ← → navigation between images

### VER-2: SDG Goals
- [ ] SDG selector visible in CiBasicInfoForm (teal card)
- [ ] SDG goals save/load correctly (POST/GET project)
- [ ] SDG chips show full labels in detail page

### VER-3: Supporting Documents
- [ ] Per-template CiRepositoryCard visible (15+ cards across 4 groups)
- [ ] "Add Folder" creates a custom supporting folder card
- [ ] Custom folder card opens CiRepositoryModal

---

## NEXT PHASE CANDIDATES (Require Phase 1+2+Authorization)

These are research/planning items — none are authorized for implementation yet.

### CANDIDATE-1: Gallery Enhancement
- Add timeline/chronological view in CiGalleryModal
- Monthly count analytics
- Category filter chips already done (XXX-E)

### CANDIDATE-2: Timelogs WAR/MPR Enhancement
- Map fields from reference docs: `SD-ECO-ECO-009_Weekly Accomplishment Report.docx`, `SD-ECO-ECO-010_Monthly Progress Report.docx`
- Physical progress, financial progress, narratives, issues, corrective actions fields
- Currently: WEEKLY/MONTHLY types exist; form fields partially mapped

### CANDIDATE-3: Personnel Attachment Permission Sync
- Contractor role: access only to explicitly assigned repositories
- Hub `canUpload`/`canDelete` props derive from role; need per-user RBAC override
- Complex — requires hub RBAC overhaul

### CANDIDATE-4: Progress Report Tab UI Consistency
- Standardize headers, filter placement, view-toggle across 4 sections
- Template-level only — no CRUD logic changes

### CANDIDATE-5: Rate Limiting
- Add NestJS rate limiter middleware
- Required before full production deployment

### CANDIDATE-6: Server-side File MIME Validation
- Backend magic-byte checking for uploaded files
- Currently frontend-only MIME validation

---

## DEFERRED / YAGNI

| Item | Reason |
|---|---|
| Cross-module global analytics | Until data entry stable |
| Financial analytics endpoints | Until data stable |
| OAuth token rotation review | Low risk in current env |
| Subfolder CRUD inside repository modal | Out of scope for card architecture |
| Gallery "before/after" comparison | Future enhancement |
