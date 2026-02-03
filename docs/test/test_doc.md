# Step 2.9 Technical Usage Guide
**Purpose:** System Validation & Stabilization
**Audience:** Beginner developers
**Last Updated:** 2026-01-20

---

## What is Step 2.9?

Step 2.9 verifies that your backend works correctly before moving to the next phase. It does not add new features. It confirms that existing features function as expected.

Think of it as a health checkup for your code.

---

## What Step 2.9 Validates

| Area | What is Checked |
|------|-----------------|
| System Startup | Backend starts without errors |
| Database Connection | Can connect and query the database |
| Authentication | Login works, tokens are valid |
| Authorization | Role-based access is enforced correctly |
| API Endpoints | Requests return expected responses |
| Input Validation | Invalid data is rejected properly |
| Error Handling | Errors return consistent, safe responses |

---

## How to Execute Step 2.9

### Step 1: Verify the Backend Starts

Open a terminal in the `pmo-backend` directory and run:

```
npm run start:dev
```

**What to look for:**
- Message saying "Application running" or similar
- No red error messages
- No crash or stack trace

**If it fails:** Check your .env file and database connection.

---

### Step 2: Check the Health Endpoint

While the backend is running, open a browser or use curl:

```
GET http://localhost:3000/health
```

**Expected response:**
- Status: "ok"
- Database: "connected"
- No error messages

**If it fails:** Database is not running or connection string is wrong.

---

### Step 3: Run Unit Tests

In a new terminal (keep the backend running or stop it), run:

```
npm run test
```

**What to look for:**
- All tests show green "PASS"
- Summary shows "X passed, 0 failed"
- Exit code 0

**If some tests fail:** Read the failure message. It tells you which test failed and why.

---

### Step 4: Run E2E Tests

```
npm run test:e2e
```

**What to look for:**
- Tests pass or skip gracefully
- No crashes or unhandled errors
- Summary shows pass count

**Note:** E2E tests may skip if no test user exists in the database. This is expected behavior, not a failure.

---

### Step 5: Verify API Documentation

Start the backend and visit:

```
http://localhost:3000/api/docs
```

**What to look for:**
- Swagger UI loads
- All 17 modules are listed
- Endpoints are documented

**If it fails:** Swagger is not configured correctly in main.ts.

---

### Step 6: Test Authentication Manually

Using Swagger UI or a tool like Postman:

1. Send POST to `/auth/login` with valid credentials
2. Copy the `access_token` from the response
3. Use the token to access a protected endpoint (e.g., GET `/contractors`)

**Expected behavior:**
- Login returns a token
- Protected endpoints work with the token
- Protected endpoints return 401 without a token

---

## Interpreting Results

### Everything Passes

Your backend is stable. You can proceed to the next phase with confidence.

### Some Tests Fail

| Failure Type | Likely Cause | Where to Look |
|--------------|--------------|---------------|
| "Cannot connect to database" | Database not running | Start PostgreSQL, check .env |
| "Validation failed" | DTO rules too strict | Check DTO decorators |
| "401 Unauthorized" | Token missing or expired | Check auth flow |
| "403 Forbidden" | Role not assigned | Check user_roles table |
| "404 Not Found" | Endpoint not registered | Check controller routes |
| "Column does not exist" | DTO/Schema mismatch | Compare DTO to schema |

### System Crashes

If the backend crashes during testing:

1. Read the stack trace (the error message)
2. Find the file and line number mentioned
3. That is where the problem is

Common causes:
- Missing environment variables
- Undefined values being accessed
- Database constraint violations

---

## What NOT to Fix in Step 2.9

Step 2.9 is for **verification**, not feature development.

Do NOT:
- Add new API endpoints
- Change the database schema
- Build UI components
- Add new validation rules
- Implement new features

If you find a bug, note it down. Fix only what is needed to make existing features work correctly.

---

## Quick Reference Commands

| Command | Purpose |
|---------|---------|
| `npm run start:dev` | Start backend in development mode |
| `npm run build` | Compile TypeScript (verify no errors) |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:cov` | Run tests with coverage report |

---

## Checklist Before Moving Forward

Before proceeding to the next phase, confirm:

- [ ] Backend starts without errors
- [ ] Health endpoint returns "ok"
- [ ] Unit tests pass
- [ ] E2E tests pass (or skip gracefully)
- [ ] Swagger UI loads and shows all endpoints
- [ ] Authentication flow works manually
- [ ] Build command succeeds

If all items are checked, Step 2.9 is complete.

---

## Summary

Step 2.9 answers one question: "Does this backend actually work?"

Run the tests. Check the results. Fix only what is broken. Move on when everything passes.
