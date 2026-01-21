# Phase 3.0: Frontend Integration (Startup Kick-Off MVP)
**Status:** ✅ COMPLETE (including Phase 3.0.X UI enhancements)
**Updated:** 2026-01-21
**Authority:** `docs/research_summary.md` Section 17, 18, 19 (Authentication + Auth Scope Analysis)

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Backend** | ✅ Production-ready (17 modules, 129+ endpoints, tests passing) |
| **Frontend** | ✅ Nuxt 3 + Vuetify 3 complete with proxy + CSU UI + institutional branding |
| **Auth** | ✅ Email+password login (production-ready) |
| **UI Enhancements** | ✅ Admin building background + CSU seal integrated |
| **Next Action** | Phase 3.1: Uni Ops, Repairs, GAD full CRUD |
| **Scope** | 4 startup-critical modules (Construction, Uni Ops, Repairs, GAD) |
| **Blocking Issues** | NONE (startup conflicts resolved with explicit port) |

---

## Prerequisites

**⚠️ CRITICAL: Startup Order Requirement**

To avoid port conflicts and routing failures, the development environment MUST follow this startup sequence:

### Required Startup Sequence

```bash
# Step 1: Start Backend FIRST (claims port 3000)
cd pmo-backend
npm run start:dev
# Wait for: "PMO Backend running on http://localhost:3000"

# Step 2: Start Frontend AFTER (auto-increments to port 3001+)
cd pmo-frontend
npm run dev
# Nuxt will auto-detect port 3000 is taken and use 3001+
```

**Why This Matters:**
- Backend MUST own port 3000 (hardcoded in `nuxt.config.ts` proxy target)
- Frontend proxy forwards `/api/*` requests to `http://localhost:3000`
- If frontend starts first: it takes port 3000 → proxy forwards to itself → 404 HTML errors → login fails

**Alternative (Explicit Port):**
```bash
# Option: Force frontend to specific port
cd pmo-frontend
npm run dev -- --port 3001
```

**Verification:**
```bash
# Check backend is on port 3000
curl http://localhost:3000/health
# Should return: {"status":"ok",...}

# Check frontend proxy works
# Open browser to http://localhost:3001 (or whichever port Nuxt shows)
# Login should return JSON, not HTML
```

**Reference:** See `docs/research_summary.md` Section 19.1 for root cause analysis.

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
| 3.0.0-3.0.V | Frontend Integration (Phase 3.0) | 2026-01-21 | ✅ DONE |

### Phase 3.0 Implementation Summary

| Step | Description | Status |
|------|-------------|--------|
| 3.0.0 | Project Scaffolding | ✅ DONE |
| 3.0.1 | API Client + Data Adapters | ✅ DONE |
| 3.0.2 | Auth Store (Pinia) | ✅ DONE |
| 3.0.3 | Router + Permission Guards | ✅ DONE |
| 3.0.4 | Login Page + CSU Branding | ✅ DONE |
| 3.0.5 | Dashboard Layout | ✅ DONE |
| 3.0.6 | Projects List Page | ✅ DONE |
| 3.0.P.0 | Explicit Frontend Port (3001) | ✅ **DONE** (package.json updated) |
| 3.0.P.1-4 | Dev Proxy Configuration | ✅ DONE |
| 3.0.U.1 | Login UI Initial Implementation | ✅ DONE |
| **3.0.X.2** | **Admin Building Background** | ✅ **DONE** (asset copied, CSS updated) |
| **3.0.X.3** | **CSU Official Seal Integration** | ✅ **DONE** (seal added to form header) |
| **3.0.X.4** | **Formality Text Updates** | ✅ **DONE** (institutional tone applied) |
| 3.0.V | Build + Integration Verification | ✅ DONE (build passed) |
| **ACE-AUTH.R** | **Auth Schema Evolution Research** | ✅ **DONE** (2026-01-21) |

### Deferred Items

| Item | Reason | Target Phase |
|------|--------|--------------|
| Dashboard Analytics endpoint | Client-side calculation viable | 3.1 |
| Facilities Assessment | Not startup-critical | 3.2+ |
| Forms/Policies modules | Content management | 3.2+ |
| Announcements | Public-facing only | 3.2+ |
| Public view filters | Admin MVP first | 3.1 |
| **Username login** | Email login sufficient; requires schema migration (no `username` column exists) | **3.2** |
| **Google OAuth** | UX enhancement; requires OAuth setup + backend implementation | **3.3** |

---

## Phase 3.2: Auth Scope Expansion (Username + Password)

**Status:** 📋 PLANNED (Research Complete)  
**Research Authority:** `docs/research_auth_expansion.md`  
**ACE Framework:** Phase 1 RESEARCH ✅ COMPLETE | Phase 2 PLAN UPDATE ✅ COMPLETE  
**Blocking:** None (startup sequence established, email login production-ready)

### Executive Summary

| Metric | Value |
|--------|-------|
| **Current Auth** | Email + password only |
| **Schema Gap** | NO `username` column in users table |
| **Blocking Issues** | 6 (schema, DTO, service, validation, index, seed data) |
| **Estimated Effort** | 2-3 hours (schema migration + backend updates + testing) |
| **Risk Level** | LOW (backward compatible, username optional) |

### Problem Statement

**Current Limitation:**
- New hires without active CSU email cannot access system
- Username + password authentication requested for institutional accounts

**Research Findings (docs/research_auth_expansion.md):**
- Schema `users` table lacks `username` column
- Backend `LoginDto` hardcoded to `@IsEmail()` validation
- `AuthService.validateUser()` uses email-only lookup
- Seed data has no username assignments

### Implementation Tasks

#### Part A: Database Schema Migration

- [ ] **Task 3.2.A.1:** Create incremental migration SQL (`pmo_schema_pg_insert_v2.sql`)
- [ ] **Task 3.2.A.2:** Create canonical schema v2 (`pmo_schema_pg_v2.sql` - documentation)
- [ ] **Task 3.2.A.3:** Execute migration on development database
- [ ] **Task 3.2.A.4:** Update seed data with test usernames

#### Part B: Backend DTO Updates

- [ ] **Task 3.2.B.1:** Update `LoginDto` (email → identifier)
- [ ] **Task 3.2.B.2:** Update `CreateUserDto` (add username field)

#### Part C: Backend Service Updates

- [ ] **Task 3.2.C.1:** Update `AuthService.validateUser()` (conditional lookup)
- [ ] **Task 3.2.C.2:** Update `UsersService` (handle username field)

#### Part D: Testing

- [ ] **Task 3.2.D.1:** Unit Tests (4 new tests)
- [ ] **Task 3.2.D.2:** E2E Tests (4 new tests)
- [ ] **Task 3.2.D.3:** Manual Verification (Postman)

#### Part E: Documentation

- [ ] **Task 3.2.E.1:** Swagger documentation auto-updated
- [ ] **Task 3.2.E.2:** Mark Phase 3.2 as COMPLETE

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| SQL injection via dynamic field | ✅ Use allowlist pattern (specified in research) |
| Backward compatibility breaks | ✅ Username optional, email login unchanged |

### Definition of Done

- [ ] Schema migration executed
- [ ] Both email and username login work
- [ ] Unit and E2E tests passing
- [ ] No backward compatibility breaks
- [ ] Build succeeds

**Detailed specifications:** See `docs/research_auth_expansion.md`

---

## Scope Control (LOCKED)

### IN SCOPE (Phase 3.0)

| # | Feature | Backend | UI Priority |
|---|---------|---------|-------------|
| 1 | Construction Projects | ✅ Ready | **Phase 3.0** |
| 2 | University Operations | ✅ Ready | Phase 3.1 (nav only) |
| 3 | Repair Projects | ✅ Ready | Phase 3.1 (nav only) |
| 4 | GAD Parity Reports | ✅ Ready | Phase 3.1 (nav only) |

### DEFERRED (Accepted per Section 16.2, 19.3)

| Gap | Classification | Target |
|-----|----------------|--------|
| Dashboard Analytics endpoint | DEFER | Phase 3.1 (client-side calc) |
| Facilities Assessment | DEFER | Phase 3.2+ (needs backend) |
| Forms/Policies modules | DEFER | Phase 3.2+ |
| Announcements module | DEFER | Phase 3.2+ |
| Public view filters | DEFER | Phase 3.1 |
| **Username login** | **DEFER** | **Phase 3.2 (schema migration required)** |
| **Google OAuth login** | **DEFER** | **Phase 3.3 (OAuth setup + implementation)** |

### SHOULD FIX (During Phase 3.0)

| Issue | Resolution |
|-------|------------|
| Data adapters (`title` → `projectName`) | Step 3.0.1 |
| CSU Branding | Step 3.0.4 |
| Permission→Page mapping | Step 3.0.3 |

---

## Technology Stack (MIS Compliant)

```
Frontend:  Nuxt 3 + Vuetify 3 + TypeScript
State:     Pinia via @pinia/nuxt (auth store only)
HTTP:      Native fetch (wrapped in useApi composable)
Branding:  CSU (#009900, #f9dc07, #ff9900) + Poppins
Routing:   Nuxt file-based routing + middleware guards
```

**MIS Policy Note:** Per Web Development Policy (Board-level governance),
Vue 3 + Nuxt.js is mandatory for all university web applications.

---

## Authentication Configuration

**Current Implementation (Phase 3.0):**

| Capability | Status | Implementation |
|------------|--------|----------------|
| Email + Password Login | ✅ **PRODUCTION-READY** | `login.dto.ts` (email field), `auth.service.ts` (email lookup) |
| JWT Token Auth | ✅ Implemented | `@nestjs/jwt`, stored in localStorage (frontend) |
| Role-Based Access Control (RBAC) | ✅ Implemented | Backend enforces permissions via guards |
| Failed Login Tracking | ✅ Implemented | Account lockout after 5 failed attempts |
| Audit Logging | ✅ Implemented | Server-side logs (no PII) |

**Schema Constraints (Phase 3.0):**

⚠️ **IMPORTANT:** Current `users` table schema (per `pmo_schema_pg.sql`) does NOT include:
- `username` column (only `email` exists)
- Flexible identifier field

**Schema (Current):**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  google_id VARCHAR(255) UNIQUE,  -- Added via pmo_migration_google_oauth.sql
  -- NO username column
  ...
);
```

**Deferred Auth Capabilities:**

| Capability | Blocker | Required Changes | Target Phase |
|------------|---------|------------------|--------------|
| **Username Login** | No `username` column in schema | Schema migration + DTO update + service logic | **Phase 3.2** |
| **Google OAuth** | No OAuth strategy implemented | Backend OAuth setup + frontend UI | **Phase 3.3** |

**Phase 3.2 Requirements (Username Login):**
1. Schema migration: `ALTER TABLE users ADD COLUMN username VARCHAR(100) UNIQUE;`
2. Data migration: Assign usernames to existing users
3. DTO update: Accept `identifier` (email OR username)
4. Service update: Conditional lookup logic (`email` vs `username`)
5. Seed data update: Add usernames to test users

**Phase 3.3 Requirements (Google OAuth):**
1. Install dependencies: `@nestjs/passport`, `passport-google-oauth20`
2. Create OAuth strategy: `auth/strategies/google.strategy.ts`
3. Add OAuth endpoints: `/api/auth/google`, `/api/auth/google/callback`
4. Frontend UI: Google Sign-In button
5. OAuth app credentials: Configure in Google Cloud Console

**Reference:** See `docs/research_summary.md` Section 19.3 for full auth scope analysis.

---

## Implementation Steps

### Step 3.0.0: Project Scaffolding (Nuxt 3)

```bash
# Manual scaffolding for Nuxt 3 + Vuetify 3
mkdir pmo-frontend && cd pmo-frontend
# Create package.json with nuxt, vuetify, @pinia/nuxt dependencies
npm install
```

**Exit Criteria:** `npm run dev` shows Nuxt application

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

### Step 3.0.P: Dev Proxy Configuration (BLOCKING FIX)

**Problem:** Authentication fails with `Unexpected token '<'` because:
- Both Nuxt and NestJS default to port 3000
- Without proxy, API requests may hit Nuxt instead of backend
- Nuxt returns 404 HTML page instead of JSON

**Root Cause:** See `research_summary.md` Section 17.2, 19.1

---

#### Sub-Step 3.0.P.0: Verify Startup Sequence ⚠️ NEW

**Objective:** Ensure backend claims port 3000 BEFORE frontend starts

**Action:**
Before starting frontend, verify backend is running:
```bash
# Terminal 1: Backend MUST start first
cd pmo-backend && npm run start:dev
# Wait for: "PMO Backend running on http://localhost:3000"

# Verify backend owns port 3000
curl http://localhost:3000/health
# Expected: {"status":"ok",...}
```

**Only then** start frontend:
```bash
# Terminal 2: Frontend starts AFTER
cd pmo-frontend && npm run dev
# Nuxt auto-detects port 3000 taken → uses 3001+
```

**Why This Step Exists:**
- Research (Section 19.1) identified startup sequence violation as root cause
- If frontend starts first: takes port 3000 → proxy forwards to itself → login fails with HTML instead of JSON
- This step enforces correct operational order

**Exit Criteria:** Backend confirmed on port 3000 before frontend starts

---

#### Sub-Step 3.0.P.1: Configure Nitro Dev Proxy

**File:** `pmo-frontend/nuxt.config.ts`

**Add Configuration:**
```typescript
export default defineNuxtConfig({
  // ... existing config ...

  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },

  // ... rest of config ...
})
```

**Why This Works:**
- All `/api/*` requests from frontend are proxied to backend
- Frontend can run on any port (default 3000, or auto-incremented)
- No CORS issues in development
- Same pattern works in production with reverse proxy

**Exit Criteria:** `nuxt.config.ts` contains `nitro.devProxy` configuration

---

#### Sub-Step 3.0.P.2: Update useApi Composable for Proxy

**File:** `pmo-frontend/composables/useApi.ts`

**Change Required:**
```typescript
// BEFORE (direct cross-origin):
const response = await fetch(`${config.public.apiBase}${endpoint}`, ...)

// AFTER (proxy-aware):
const baseUrl = import.meta.dev ? '' : config.public.apiBase
const response = await fetch(`${baseUrl}${endpoint}`, ...)
```

**Explanation:**
- In development: Use relative URLs (`/api/auth/login`) — proxy handles routing
- In production: Use full URL from env (`http://api.example.com/api/auth/login`)

**Exit Criteria:** `useApi.ts` uses relative URLs in dev mode

---

#### Sub-Step 3.0.P.3: Verify Backend is Running First

**Startup Sequence (IMPORTANT):**
```bash
# Terminal 1: Start backend FIRST
cd pmo-backend && npm run start:dev
# Wait for: "PMO Backend running on http://localhost:3000"

# Terminal 2: Start frontend AFTER backend is ready
cd pmo-frontend && npm run dev
# Should see: "Nitro built" or similar
```

**Why Order Matters:**
- Backend must own port 3000 for proxy to work
- If Nuxt starts first, it takes port 3000 and proxy fails

**Exit Criteria:** Backend running on 3000 before frontend starts

---

#### Sub-Step 3.0.P.4: Test Login Flow

**Manual Test:**
1. Open browser to `http://localhost:3000` (or Nuxt's actual port)
2. Should see login page
3. Enter valid credentials
4. Click "Sign In"
5. Should redirect to `/dashboard` with user name displayed

**Expected Network Request:**
```
POST /api/auth/login → 200 OK
Response: { "access_token": "...", "user": {...} }
```

**If Still Failing:**
- Check browser DevTools → Network tab
- Verify request goes to backend (not Nuxt 404)
- Check backend console for incoming request

**Exit Criteria:** Login returns JSON, user reaches dashboard

---

### Step 3.0.U: Login UI Refinement (CSU Aesthetic Enhancement)

**Objective:** Enhance login page with CSU institutional assets for formal, professional appearance

**Current State (✅ COMPLETE):**
- Split-screen layout (branding left, form right)
- CSU colors (#009900, #f9dc07, #ff9900)
- Poppins font
- SVG logo
- Green gradient background

**Enhancement Opportunities (Optional - Phase 3.0.X):**
Per research (Section 19.4), further refinements can improve institutional formality.

---

#### Sub-Step 3.0.U.1: Initial UI Implementation ✅ COMPLETE

**Implemented:**
- Split-screen layout with branding panel
- CSU green gradient background
- Form card with Vuetify components
- Mobile-responsive design
- Error handling with user-friendly messages

**Exit Criteria:** Login page functional with CSU aesthetic

---

#### Sub-Step 3.0.U.2: Add CSU Admin Building Background (OPTIONAL)

**Status:** Deferred to Phase 3.0.X (non-blocking enhancement)

**Objective:** Replace gradient background with institutional photo

**Asset:** `shared/CSU Assets/3.png` (modern admin building)

**Implementation:**
```vue
<!-- File: pmo-frontend/pages/login.vue -->
<style scoped>
.branding-panel {
  background:
    linear-gradient(
      135deg,
      rgba(0, 153, 0, 0.85) 0%,
      rgba(0, 102, 0, 0.90) 100%
    ),
    url('/csu-admin-building.png');
  background-size: cover;
  background-position: center;
}
</style>
```

**Asset Preparation:**
```bash
cp "shared/CSU Assets/3.png" pmo-frontend/public/csu-admin-building.png
```

**Benefit:** Recognizable CSU landmark adds institutional context and formality

**Exit Criteria:** Admin building visible through green overlay, text remains readable

---

#### Sub-Step 3.0.U.3: Integrate CSU Official Seal (OPTIONAL)

**Status:** Deferred to Phase 3.0.X (non-blocking enhancement)

**Objective:** Add official seal to form header for formal trust badge

**Asset:** `shared/CSU Assets/CSU Official Seal_1216 x 2009.png`

**Implementation:**
```vue
<!-- File: pmo-frontend/pages/login.vue -->
<div class="form-wrapper">
  <v-img
    src="/csu-official-seal.png"
    width="70"
    class="mx-auto mb-4"
    alt="CSU Official Seal"
  />
  <h2 class="form-title">PMO Dashboard Login</h2>
  <p class="form-subtitle">Physical Planning & Management Office</p>
  <!-- ... rest of form ... -->
</div>
```

**Asset Preparation:**
```bash
cp "shared/CSU Assets/CSU Official Seal_1216 x 2009.png" pmo-frontend/public/csu-official-seal.png
```

**CSU Branding Compliance:**
- ✓ No alterations (full seal, unmodified)
- ✓ No transparency effects on seal itself
- ✓ Proper size (60-70px, visible but not overwhelming)

**Benefit:** Official seal signals institutional authority and trust

**Exit Criteria:** Seal displays without distortion, compliant with CSU branding guidelines

---

#### Sub-Step 3.0.U.4: Formality Text Updates (OPTIONAL)

**Status:** Deferred to Phase 3.0.X (non-blocking enhancement)

**Changes:**
- Card title: "Welcome Back" → "PMO Dashboard Login"
- Subtitle: "Sign in to continue to the dashboard" → "Physical Planning & Management Office"
- Footer: "Need help? Contact MIS Office" → "© 2026 Caraga State University • All Rights Reserved"

**Benefit:** More formal, institutional tone

**Exit Criteria:** Text updates maintain readability and professional appearance

---

### Step 3.0.V: Build + Integration Verification

```bash
npm run build
```

**Smoke Tests:**
1. ✅ Backend health check: `curl http://localhost:3000/health`
2. ✅ Login with valid credentials
3. ✅ Dashboard displays user info
4. ✅ Projects list shows data
5. ✅ Logout clears state
6. ✅ Protected routes redirect

**Exit Criteria:** Build succeeds, all smoke tests pass

---

## Definition of Done

| # | Criterion | Verification | Status |
|---|-----------|--------------|--------|
| 1 | Dev proxy configured | `nuxt.config.ts` has `nitro.devProxy` | ✅ |
| 2 | Login works | Manual test returns JSON | ✅ |
| 3 | Protected routes redirect | Access `/dashboard` without token | ✅ |
| 4 | Dashboard displays user info | Name from `/api/auth/me` | ✅ |
| 5 | CSU branding applied | Visual: green/gold/orange, Poppins | ✅ |
| 6 | Projects list displays data | ≥1 project visible | ✅ |
| 7 | Logout clears state | Token removed, redirect | ✅ |
| 8 | Build succeeds | `npm run build` exit 0 | ✅ |

---

## Engineering Compliance

| Principle | Implementation |
|-----------|----------------|
| **KISS** | Standard Vuetify, no custom CSS |
| **YAGNI** | 1 list page only, defer analytics |
| **SOLID** | Layers: API → Store → Router → Views |
| **DRY** | Single API client, shared data adapters |
| **TDA** | UI displays backend data, no client-side business logic |
| **MIS** | Nuxt.js per Web Dev Policy, server-side auth logging, no PII in localStorage |

---

## Development Commands

### Startup Sequence (IMPORTANT — Order Matters!)

**Step 1: Start Backend FIRST (Port 3000)**
```bash
cd pmo-backend && npm run start:dev
```
Wait for console output:
```
PMO Backend running on http://localhost:3000
Swagger docs: http://localhost:3000/api/docs
```

**Step 2: Start Frontend AFTER Backend (Auto Port)**
```bash
cd pmo-frontend && npm run dev
```
Note: If port 3000 is taken by backend, Nuxt auto-increments to 3001+

### Verification Commands

```bash
# Test backend is alive
curl http://localhost:3000/health

# Test Swagger docs accessible
curl -I http://localhost:3000/api/docs

# Test login endpoint directly
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'
```

### Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Unexpected token '<'` | Frontend hitting wrong port | Start backend FIRST |
| `ECONNREFUSED` | Backend not running | Start backend |
| `CORS error` | Proxy not configured | Add `nitro.devProxy` |
| `/api/docs` router error | Nuxt intercepting path | Use backend URL directly |

---

## Phase Roadmap

| Phase | Scope | Status |
|-------|-------|--------|
| 3.0 | Scaffolding + Auth + Projects List | ✅ **COMPLETE** |
| 3.0.P | Dev Proxy Configuration + Explicit Port | ✅ **COMPLETE** |
| 3.0.U | Login UI Redesign (CSU Aesthetic) | ✅ **COMPLETE** |
| **3.0.X** | **UI Enhancements (Admin Building + Seal)** | ✅ **COMPLETE** |
| 3.1 | Uni Ops, Repairs, GAD pages + Dashboard metrics | **NEXT** |
| **3.2** | **CRUD forms + Username login support** | **Planned (requires schema migration)** |
| **3.3** | **Google OAuth integration** | **Planned (requires OAuth setup)** |
| 3.4 | Facilities Assessment (needs backend) | Deferred |

---

## Files Created (Phase 3.0) — Nuxt 3 Structure

```
pmo-frontend/
├── package.json
├── nuxt.config.ts              # Nuxt + Vuetify configuration
├── tsconfig.json
├── app.vue                     # Root component
├── .env
├── .gitignore
├── public/
│   └── csu-logo.svg
├── plugins/
│   └── vuetify.ts              # CSU branding theme
├── composables/
│   └── useApi.ts               # HTTP client with JWT
├── utils/
│   └── adapters.ts             # Backend→UI data transformation
├── stores/
│   └── auth.ts                 # Pinia auth store
├── middleware/
│   ├── auth.ts                 # Protected route guard
│   └── guest.ts                # Redirect authenticated users
├── layouts/
│   ├── default.vue             # Dashboard layout (AppBar + Drawer)
│   └── blank.vue               # Login page layout
└── pages/
    ├── index.vue               # Redirect to /dashboard
    ├── login.vue               # Login page
    ├── dashboard.vue           # Dashboard page
    ├── projects.vue            # Construction projects list
    ├── repairs.vue             # Placeholder (Phase 3.1)
    ├── university-operations.vue  # Placeholder (Phase 3.1)
    └── gad.vue                 # Placeholder (Phase 3.1)
```

---

*ACE Framework — Phase 3.0.X Complete*
*Updated: 2026-01-21 — Phase 3 implementation: startup conflicts resolved, UI enhancements applied*
*Research Authority: `docs/research_summary.md` Section 19*
*Next Steps: Phase 3.1 (Uni Ops, Repairs, GAD full CRUD)*
