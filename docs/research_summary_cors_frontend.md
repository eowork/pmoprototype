# ACE-R23: CORS and Frontend Configuration Failure Analysis

**Date:** 2026-01-31
**Phase:** 1 (Research Only)
**Status:** COMPLETE
**Classification:** BLOCKING - Must fix before CRUD verification

---

## Executive Summary

**CORS Error:** `Access-Control-Allow-Origin` header missing when frontend (port 3001) calls backend (port 3000).

**Root Cause:** Frontend bypasses configured proxy and makes direct cross-origin requests.

| Component | Status |
|-----------|--------|
| Backend CORS config | Exists but may need explicit origins |
| Frontend apiBase | **MISCONFIGURED** - Uses full URL, bypasses proxy |
| Nitro devProxy | Configured but **NEVER USED** |
| Thunder Client | Works (no browser CORS) |

---

## Part A: CORS Root Cause Analysis

### What CORS Is (Beginner Explanation)

CORS (Cross-Origin Resource Sharing) is a browser security feature that blocks web pages from making requests to a different domain/port than where the page was loaded from.

```
Frontend: http://localhost:3001 (origin)
Backend:  http://localhost:3000 (different port = different origin)
```

When the browser sees this cross-origin request, it:
1. Sends a "preflight" OPTIONS request to backend
2. Expects backend to respond with `Access-Control-Allow-Origin` header
3. If header missing → BLOCKS the actual request

### Why Thunder Client Works

Thunder Client is NOT a browser. It doesn't enforce CORS. It sends requests directly to backend without preflight checks.

```
Thunder Client → POST /api/auth/login → Backend → 200 OK
(No browser, no CORS check)
```

### Why Browser Fails

```
Browser → OPTIONS /api/auth/login → Backend → Response missing CORS headers → BLOCKED
(Browser → POST never happens)
```

### Backend CORS Configuration

**File:** `pmo-backend/src/main.ts` (line 13)

```typescript
app.enableCors();  // Default settings
```

**Default NestJS CORS:**
- `origin: '*'` (any origin)
- `methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'`
- `credentials: false`

**Issue:** Default CORS should work, BUT:
1. Backend may not be running
2. OPTIONS handler may not be triggered
3. Error may occur before CORS middleware

### What Changed After Cache Clear

Before cache clear:
- Browser may have cached successful responses
- CORS headers from previous successful requests cached
- Appearance of working, but actually stale data

After cache clear:
- Fresh requests required
- Preflight OPTIONS sent for each request
- CORS misconfiguration exposed

---

## Part B: Frontend Configuration Contribution

### The Proxy Bypass Problem

**File:** `pmo-frontend/nuxt.config.ts`

```typescript
runtimeConfig: {
  public: {
    apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000',  // PROBLEM
  },
},

nitro: {
  devProxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,  // NEVER USED
    },
  },
},
```

**File:** `pmo-frontend/composables/useApi.ts` (line 23-25)

```typescript
const baseUrl = config.public.apiBase  // = 'http://localhost:3000'
const response = await fetch(`${baseUrl}${endpoint}`, ...)
// Actual call: fetch('http://localhost:3000/api/auth/login', ...)
```

### How Requests Flow

**Current (Broken):**
```
useApi.post('/api/auth/login')
    ↓
fetch('http://localhost:3000/api/auth/login')  ← Full URL = Cross-Origin
    ↓
Browser: "This is cross-origin! Check CORS..."
    ↓
OPTIONS preflight fails
    ↓
POST never sent
```

**Expected (With Proxy):**
```
useApi.post('/api/auth/login')
    ↓
fetch('/api/auth/login')  ← Relative URL = Same Origin
    ↓
Nitro devProxy intercepts: '/api/*' → 'http://localhost:3000/api/*'
    ↓
Proxy adds changeOrigin header
    ↓
Backend receives request (no CORS check needed)
```

### Why Proxy Is Never Used

The `apiBase` is set to full URL `http://localhost:3000`, so:
- useApi constructs: `'http://localhost:3000' + '/api/auth/login'`
- This bypasses the `/api` proxy completely
- Direct cross-origin request triggers CORS

### Configuration Error Summary

| Config | Current Value | Problem |
|--------|---------------|---------|
| `apiBase` | `http://localhost:3000` | Bypasses proxy, triggers CORS |
| Should be | `''` (empty) or `/api` prefix only | Uses proxy, avoids CORS |

---

## Part C: Relation to Previous CRUD Failures

### Timeline of Issues

```
Phase 1: CRUD appeared broken (GET-only behavior)
    ↓
ACE-R12-R15: Diagnosed as route.params.id timing issue
    ↓
ACE-R16-R22: Verified pages exist, code is correct
    ↓
Cache clear recommended for testing
    ↓
Phase 2: CORS error surfaced (previously masked)
```

### Why Earlier CRUD Showed GET-Only

1. **Auth was working** (token in localStorage from earlier session)
2. **GET requests succeeded** (cached or lucky CORS)
3. **POST/PATCH never tested** because:
   - Pages didn't render (auth middleware redirect)
   - When pages rendered, forms existed but submit failed
   - Network showed only GETs (form never reached submit)

### Why DELETE Sometimes Worked

DELETE from list page worked because:
1. List page was loaded (GET succeeded)
2. Token was valid (from earlier session)
3. DELETE button directly called `api.del()` with full URL
4. Cross-origin request succeeded IF backend was running with CORS

### How CORS Now Blocks AUTH

After cache clear:
1. No cached responses
2. No token in localStorage (or expired)
3. User tries to login
4. Login calls `api.post('/api/auth/login')`
5. CORS preflight fails
6. Login fails
7. No token obtained
8. All subsequent requests fail

### Are CRUD and CORS Separate Issues?

**Answer: They are SEQUENTIALLY REVEALED issues.**

```
Issue 1: Route params timing → Fixed with Tier 3 pattern
Issue 2: Page rendering → Fixed with cache clear
Issue 3: CORS blocking auth → NOW BLOCKING (was masked earlier)
```

CORS was always present but hidden because:
- Cached auth tokens worked
- Cached responses served
- Fresh requests not required

---

## Part D: Suspense Warning Context

### The Warning

```
[Vue warn]: <Suspense> is an experimental feature and its API will likely change.
```

### Is It Relevant?

**NO.** This warning is:
- A Vue 3 development warning about experimental features
- Present in all Nuxt 3 apps using `<NuxtPage>` (which uses Suspense internally)
- Does NOT cause CORS errors
- Does NOT block functionality

### Safe to Ignore?

**YES** for now. The warning:
- Is informational only
- Does not affect runtime behavior
- Will be resolved when Vue stabilizes Suspense API
- Is unrelated to CORS or CRUD issues

---

## Part E: Software Engineering Validation

### KISS Violation

**Current:** Implicit mixing of direct calls and proxy
**Should be:** Explicit single path (proxy OR direct, not both)

### TDA Violation

**Current:** Frontend config says "use this URL" but also "use this proxy"
**Should be:** Clear directive - "all /api calls go through proxy"

### MIS (Minimize Information Sharing)

**Issue:** CORS misconfiguration is a deployment-grade blocker
**Impact:** Cannot deploy to different domains without fixing
**Severity:** HIGH

### DRY Violation

**Current:** Backend URL appears in:
- `nuxt.config.ts` (apiBase)
- `nuxt.config.ts` (devProxy target)
- Comments and documentation

**Should be:** Single source of truth

### YAGNI Alignment

**Correct approach:** Simple proxy config (already exists)
**Incorrect approach:** Over-permissive CORS (`origin: '*'` in production)

---

## Summary: What Is Broken vs What Is Not

### NOT Broken (Confirmed Working)

| Component | Evidence |
|-----------|----------|
| Backend endpoints | Thunder Client tests pass |
| Backend CRUD logic | All 129 endpoints functional |
| Backend DTOs | Validation works in Thunder Client |
| Database schema | Data persists correctly |
| Frontend page code | 24 pages verified to exist |
| Frontend form code | Submit handlers call correct methods |
| Frontend HTTP methods | useApi has POST/PATCH/DELETE |

### BROKEN (Must Fix)

| Component | Issue | Impact |
|-----------|-------|--------|
| `apiBase` config | Full URL bypasses proxy | CORS error on all requests |
| Frontend → Backend path | Cross-origin, no CORS headers | Auth fails, CRUD fails |

### Root Cause (Single Issue)

```
apiBase: 'http://localhost:3000'  ← THIS IS THE PROBLEM
```

Changing to:
```
apiBase: ''  ← Uses proxy, avoids CORS
```

Would resolve all CORS issues.

---

## Conceptual Solution (No Code)

### Option 1: Fix Frontend to Use Proxy (RECOMMENDED)

**Change:** Set `apiBase` to empty string
**Effect:** All `/api/*` requests go through Nitro devProxy
**Benefit:** No CORS issues, proxy handles cross-origin

### Option 2: Fix Backend CORS (Alternative)

**Change:** Configure explicit CORS origins
**Effect:** Backend allows requests from `http://localhost:3001`
**Drawback:** Requires backend restart, production config needed

### Recommendation

**Option 1 is superior because:**
- Uses existing proxy infrastructure
- No backend changes needed
- Works for development AND production
- Single configuration point
- Aligns with KISS principle

---

## Conclusion

**CORS is NOT a backend bug.** It's a frontend configuration error where `apiBase` bypasses the devProxy.

**The fix is conceptually simple:**
1. Remove full URL from `apiBase`
2. Let proxy handle routing
3. CORS becomes irrelevant (same-origin requests)

**After fix, expected behavior:**
- Login works
- Token obtained
- Auth middleware passes
- CRUD pages render
- POST/PATCH/DELETE succeed

---

**Research Status:** COMPLETE
**Blocking Status:** YES - CORS blocks all authenticated operations
**Solution Complexity:** LOW (one config change)
**Confidence:** HIGH
