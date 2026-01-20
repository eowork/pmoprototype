# Phase 3.0: Frontend Integration (Startup Kick-Off MVP)
**Status:** READY TO IMPLEMENT
**Updated:** 2026-01-20
**Authority:** `docs/research_summary.md` Section 16 (Gap Re-Classification)

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Backend** | ✅ Production-ready (17 modules, 129+ endpoints, tests passing) |
| **Next Action** | Frontend scaffolding → Auth → Core CRUD |
| **Scope** | 4 startup-critical modules (Construction, Uni Ops, Repairs, GAD) |
| **Blocking Issues** | NONE — All resolved per Section 16.4 |

---

## Status Logs

### Completed Phases

| Phase | Description | Date | Status |
|-------|-------------|------|--------|
| 2.5.0-2.5.8 | Shared Infrastructure + Domain APIs | 2026-01-14 | ✅ DONE |
| 2.6.R | File Uploads, Documents, Media | 2026-01-15 | ✅ DONE |
| 2.7.0-2.7.6 | Reference Data APIs (7 modules) | 2026-01-19 | ✅ DONE |
| 2.8.0-2.8.6 | OpenAPI, Exception Filter, Logging | 2026-01-19 | ✅ DONE |
| 2.9.0-2.9.D | Testing Infrastructure | 2026-01-20 | ✅ DONE |
| 3.0.R | Phase 3.0 Research | 2026-01-20 | ✅ DONE |
| AUDIT-2 | Gap Re-Classification | 2026-01-20 | ✅ DONE |

### Current Phase

| Step | Description | Status |
|------|-------------|--------|
| 3.0.0 | Project Scaffolding | ⏳ PENDING |
| 3.0.1 | API Client + Data Adapters | ⏳ PENDING |
| 3.0.2 | Auth Store (Pinia) | ⏳ PENDING |
| 3.0.3 | Router + Permission Guards | ⏳ PENDING |
| 3.0.4 | Login Page + CSU Branding | ⏳ PENDING |
| 3.0.5 | Dashboard Layout | ⏳ PENDING |
| 3.0.6 | Projects List Page | ⏳ PENDING |
| 3.0.V | Build Verification | ⏳ PENDING |

### Deferred Items

| Item | Reason | Target Phase |
|------|--------|--------------|
| Dashboard Analytics endpoint | Client-side calculation viable | 3.1 |
| Facilities Assessment | Not startup-critical | 3.2+ |
| Forms/Policies modules | Content management | 3.2+ |
| Announcements | Public-facing only | 3.2+ |
| Public view filters | Admin MVP first | 3.1 |

---

## Scope Control (LOCKED)

### IN SCOPE (Phase 3.0)

| # | Feature | Backend | UI Priority |
|---|---------|---------|-------------|
| 1 | Construction Projects | ✅ Ready | **Phase 3.0** |
| 2 | University Operations | ✅ Ready | Phase 3.1 (nav only) |
| 3 | Repair Projects | ✅ Ready | Phase 3.1 (nav only) |
| 4 | GAD Parity Reports | ✅ Ready | Phase 3.1 (nav only) |

### DEFERRED (Accepted per Section 16.2)

| Gap | Classification | Target |
|-----|----------------|--------|
| Dashboard Analytics endpoint | DEFER | Phase 3.1 (client-side calc) |
| Facilities Assessment | DEFER | Phase 3.2+ (needs backend) |
| Forms/Policies modules | DEFER | Phase 3.2+ |
| Announcements module | DEFER | Phase 3.2+ |
| Public view filters | DEFER | Phase 3.1 |

### SHOULD FIX (During Phase 3.0)

| Issue | Resolution |
|-------|------------|
| Data adapters (`title` → `projectName`) | Step 3.0.1 |
| CSU Branding | Step 3.0.4 |
| Permission→Page mapping | Step 3.0.3 |

---

## Technology Stack

```
Frontend:  Vue 3 + Vuetify 3 + TypeScript + Vite
State:     Pinia (auth store only)
HTTP:      Native fetch (wrapped)
Branding:  CSU (#009900, #f9dc07, #ff9900) + Poppins
```

---

## Implementation Steps

### Step 3.0.0: Project Scaffolding

```bash
npm create vuetify@latest pmo-frontend
# Select: TypeScript, Vite, Pinia, Vue Router
cd pmo-frontend && npm install
```

**Exit Criteria:** `npm run dev` shows Vuetify welcome page

---

### Step 3.0.1: API Client + Data Adapters

**Create:**
- `src/composables/useApi.ts` — HTTP client with JWT injection
- `src/utils/adapters.ts` — Backend→UI field transformation

**Key Pattern (SHOULD FIX resolution):**
```typescript
export function adaptProject(backend: any) {
  return {
    id: backend.id,
    projectName: backend.title,  // Field mapping
    campus: backend.campus,
    status: backend.status,
  };
}
```

**Exit Criteria:** API client calls `/api/auth/me` with token successfully

---

### Step 3.0.2: Auth Store (Pinia)

**Create:** `src/stores/auth.ts`

**Features:**
- `login(email, password)` → stores token + user
- `logout()` → clears state, calls backend
- `hasPermission(perm)` → role-based visibility
- `isAuthenticated` computed property

**Exit Criteria:** Login stores token, logout clears it

---

### Step 3.0.3: Router + Permission Guards

**Create:** `src/router/index.ts`

**Guard Logic:**
- Unauthenticated → `/login`
- Authenticated at `/login` → `/dashboard`

**Permission Mapping:**

| Permission | Route |
|------------|-------|
| `projects:read` | `/projects` |
| `users:manage` | `/admin/users` |
| SuperAdmin | All routes |

**Exit Criteria:** Protected routes redirect without token

---

### Step 3.0.4: Login Page + CSU Branding

**Create:**
- `src/views/LoginView.vue`
- `src/plugins/vuetify.ts` (CSU theme)

**CSU Theme:**
```typescript
primary: '#009900',    // CSU Green
secondary: '#f9dc07',  // CSU Gold
accent: '#ff9900',     // CSU Orange
```

**Exit Criteria:** Login page with CSU branding, authentication works

---

### Step 3.0.5: Dashboard Layout

**Create:**
- `src/layouts/DefaultLayout.vue` (AppBar + Drawer)
- `src/views/DashboardView.vue`

**Navigation:** Dashboard, Construction, Repairs, Uni Ops, GAD

**Exit Criteria:** Dashboard shows user name, logout works

---

### Step 3.0.6: Projects List Page

**Create:** `src/views/ProjectsView.vue`

**Features:**
- Fetch `/api/construction-projects`
- VDataTable with status chips
- Uses data adapter

**Exit Criteria:** Construction projects display from backend

---

### Step 3.0.V: Build Verification

```bash
npm run build
```

**Smoke Tests:**
1. Login with valid credentials ✓
2. Dashboard displays user info ✓
3. Projects list shows data ✓
4. Logout clears state ✓
5. Protected routes redirect ✓

**Exit Criteria:** Build succeeds, all smoke tests pass

---

## Definition of Done

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Login works | Manual test |
| 2 | Protected routes redirect | Access `/dashboard` without token |
| 3 | Dashboard displays user info | Name from `/api/auth/me` |
| 4 | CSU branding applied | Visual: green/gold/orange, Poppins |
| 5 | Projects list displays data | ≥1 project visible |
| 6 | Logout clears state | Token removed, redirect |
| 7 | Build succeeds | `npm run build` exit 0 |

---

## Engineering Compliance

| Principle | Implementation |
|-----------|----------------|
| **KISS** | Standard Vuetify, no custom CSS |
| **YAGNI** | 1 list page only, defer analytics |
| **SOLID** | Layers: API → Store → Router → Views |
| **DRY** | Single API client, shared data adapters |
| **TDA** | UI displays backend data, no client-side business logic |
| **MIS** | Server-side auth logging, no PII in localStorage |

---

## Development Commands

**Backend (Port 3000):**
```bash
cd pmo-backend && npm run start:dev
```

**Frontend (Port 5173):**
```bash
cd pmo-frontend && npm run dev
```

---

## Phase Roadmap

| Phase | Scope | Status |
|-------|-------|--------|
| 3.0 | Scaffolding + Auth + Projects List | **NEXT** |
| 3.1 | Uni Ops, Repairs, GAD pages + Dashboard metrics | Planned |
| 3.2 | CRUD forms (create/edit dialogs) | Planned |
| 3.3 | Facilities Assessment (needs backend) | Deferred |

---

*ACE Framework — Phase 3.0 Implementation Plan*
*Updated: 2026-01-20 (Gap Re-Classification Applied)*
