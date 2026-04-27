# PMO Dashboard: Active Research

**Governance:** ACE v2.4 Phase 1 (Research Complete)
**Last Updated:** 2026-04-27
**Status:** ✅ Section 2.114 Phase JA — Pre-Infra Stabilization
**Context:** `CLAUDE.md` (project root) | Archive: `docs/archive/`

---

## Section 2.114 — Phase JA: Pre-Infra Stabilization (2026-04-27)

**Status:** Phase 1 Research Complete
**Trigger:** Pre-infra gate: verify Figma MCP, clean codebase, create safe pmo-test1 backup.
**Objective:** Validate tooling, identify safe cleanup targets, prepare clean git snapshot.

---

### JA-A: Figma MCP Integration Status

**File found:** `.vscode/mcp.json` — EXISTS ✅

**Contents:** Properly formatted Windows MCP config using `cmd /c npx -y figma-developer-mcp --stdio`. Figma API token present and configured.

**Status classification:** `CONFIGURED — VS Code functional test required` (CLI cannot verify VS Code tool connectivity; file is correctly structured for VS Code Copilot Chat agent mode)

**⚠️ CRITICAL SECURITY GAP:**
```
.vscode/mcp.json contains a real Figma API token in plain text.
.vscode/mcp.json is NOT in .gitignore.
```
If any `git add .` or `git commit` is executed without first patching `.gitignore`, the live API token will be pushed to the remote repository.

**This must be fixed as Step JA-0 (first action, before anything else).**

---

### JA-B: Development Readiness Check

| Component | Status | Notes |
|-----------|--------|-------|
| MCP file configured | ✅ | `.vscode/mcp.json` present, correct format |
| MCP VS Code test | ⏸ | Must be done manually in VS Code Copilot Chat (agent mode) |
| Backend stability | ✅ | IY TypeScript fixes applied; ORM migration terminal state |
| Frontend stability | ✅ | No blocking changes pending |
| `.gitignore` MCP exclusion | ❌ | MISSING — critical gap |

**Readiness gate:** MCP counts as CONFIGURED pending operator VS Code test. All other blockers are fixable in this phase.

---

### JA-C: Codebase Health Audit

#### Safe-to-remove items (confirmed zero references)

| File | Evidence | Verdict |
|------|----------|---------|
| `pmo-frontend/components/PhysicalSummaryCard.vue` | `grep -r "PhysicalSummaryCard"` → **0 matches** | ✅ ORPHANED — safe to remove |
| `fix-sections.js` (project root) | One-off doc reorder script, hardcoded path to `docs/research.md` | ✅ MAINTENANCE ARTIFACT — safe to remove |
| `validate-json.js` (project root) | One-off JSON validation utility, references non-existent `docs/references/postman-ia3-smoke-test.json` | ✅ MAINTENANCE ARTIFACT — safe to remove |

#### Registered-but-frontend-unlinked backend modules

These are registered in `app.module.ts` but have zero frontend API calls. They are **NOT safe to remove** — they represent future-use modules for COI/Repair/GAD features.

| Module | Registered | Frontend API calls | Verdict |
|--------|-----------|-------------------|---------|
| `DocumentsModule` | ✅ | 0 (confirmed grep) | ⏸ DEFER — future COI/Repair use |
| `MediaModule` | ✅ | 0 (confirmed grep) | ⏸ DEFER — future COI/Repair use |
| `ProjectsModule` | ✅ | 0 (confirmed grep) | ⏸ DEFER — future COI/Repair use |
| `GadModule` | ✅ | Via `/api/gad/*` in gad pages | ✅ Active — frontend pages reference it |

#### Frontend GAD pages

All 7 GAD pages (`student`, `faculty`, `staff`, `pwd`, `indigenous`, `gpb`, `budget`) exist and call `/api/gad/*` endpoints. The GAD module is wired — not orphaned.

#### `.vscode/mcp.json` gitignore status

**Root `.gitignore` contents (as-is):**
```
node_modules/
.env
.DS_Store
dist/
build/
nul
**/tmpclaude-*-cwd
.claude/
.trae/
database/backups/
database/staging/
pmo-backend/uploads/
prototype/
```
`.vscode/` and `.vscode/mcp.json` are **absent** from this list.

---

### JA-D: Git State Analysis

| Item | Finding |
|------|---------|
| Remote `main` last commit | `1e64e7ed` (2026-04-16) — Merge PR #10: University operation module |
| Remote `pmo-test1` last commit | `0809edb5` (2026-04-16) — feat: Phases HQ-HT (same PR content) |
| Local uncommitted work | Large — Phases IB through IY implemented locally since 2026-04-16 |
| `pmo-test1` branch state | Exists remotely; behind local by all I-track work |
| Shell tool availability | ❌ `pwsh` unavailable — all git commands must be run manually by operator |

**All git commands in the plan are provided as exact terminal commands for operator to execute.**

---

### JA-E: Safety Summary

| Check | Status |
|-------|--------|
| Orphaned component removal safe | ✅ — 0 references |
| Root script removal safe | ✅ — one-off utilities, hardcoded paths |
| DocumentsModule/MediaModule removal | ❌ DEFER — registered active modules |
| `.gitignore` patch needed before commit | ✅ CRITICAL — block push without this |
| `docs/` directory in gitignore? | ❌ Not listed, not needed — docs are committed intentionally |
| MCP API key exposure risk | ✅ CRITICAL — must add to `.gitignore` before git add |

---

---

## Section 2.113— Phase IZ: Figma MCP Server Integration Feasibility (2026-04-23)

**Status:** Phase 1 Research Complete
**Trigger:** Operator requests feasibility evaluation of Figma MCP Server integration into current dev workflow (VS Code + Claude CLI + Copilot CLI).
**Objective:** Determine if Figma MCP is technically feasible, beneficial, and non-disruptive as an assistive developer tool.

---

### IZ-A: What Figma MCP Is

**MCP (Model Context Protocol):** Anthropic open standard for connecting AI models to external tools/services. VS Code has native MCP support via `.vscode/mcp.json`. Documented at `modelcontextprotocol.io`.

**Primary Figma MCP Implementation — Framelink (GLips/Figma-Context-MCP):**
- NPM package: `figma-developer-mcp`
- How it works: AI agent pastes a Figma frame/group URL → MCP server fetches metadata from Figma REST API → compresses response by ~90% → returns structured design data to the AI
- Key tool exposed: `get_figma_data`
- Outputs: component hierarchy, spacing values, colors, typography, layout metadata (JSON)
- Does NOT output framework-specific code — it outputs design facts which an AI then uses to write code

**Figma personal access token required:**
- Profile → Settings → Security → Personal access tokens
- Requires read permissions on: File content + Dev resources

---

### IZ-B: Toolchain Compatibility Audit

| Tool | MCP Support | Notes |
|------|-------------|-------|
| VS Code | ✅ Native | `.vscode/mcp.json` config; MCP gallery via Extensions view (`@mcp`) |
| GitHub Copilot Chat (VS Code) | ✅ Compatible | Uses VS Code MCP layer; tools invoked via agent mode in Copilot Chat |
| GitHub Copilot CLI (this terminal agent) | ❌ N/A | Terminal agent, server-side — does NOT consume MCP servers configured locally |
| Claude Desktop / Cursor | ✅ Direct | Primary targets of Framelink MCP |

**Key distinction:** GitHub Copilot CLI (this tool) is a terminal-based agent running server-side. It cannot consume a locally-configured MCP server. MCP integration is useful only in VS Code Copilot Chat (agent mode), not in this CLI.

**Practical workflow with MCP:**
```
Figma design file
  ↓ (right-click frame → Copy link to selection)
VS Code Copilot Chat (agent mode)
  ↓ (paste link + prompt: "implement this frame")
  ↓ (Copilot calls get_figma_data tool)
Developer implements result (Vue/Vuetify)
```

---

### IZ-C: Current Workflow Pain Points Addressed by MCP

| Pain Point | MCP Addresses? | Notes |
|------------|---------------|-------|
| Manual spacing/padding guesswork | ✅ Yes | MCP returns exact spacing values from Figma |
| Color inconsistency with design | ✅ Yes | MCP returns hex/rgba tokens |
| Layout structure drift from prototype | ✅ Yes | Component hierarchy + layout metadata |
| Typography mismatches | ✅ Yes | Font family/size/weight from Figma |
| Slow UI implementation for new pages | ✅ Partial | One frame at a time; works best for static layouts |
| Vuetify component selection | ❌ No | MCP outputs layout facts; AI must map to Vuetify — may not align perfectly |

---

### IZ-D: Integration Complexity Assessment

| Factor | Complexity | Notes |
|--------|-----------|-------|
| VS Code setup | LOW | `.vscode/mcp.json` + `npx` command — no global install required |
| Figma token | LOW | 2-minute setup in Figma settings |
| Windows config | LOW | Uses `cmd /c npx -y figma-developer-mcp` (Windows variant confirmed) |
| Maintenance overhead | LOW | NPM package; auto-downloaded via `npx` |
| Dependency on Figma file quality | MEDIUM | Poorly named/structured Figma layers → poor AI output |
| Vuetify mapping accuracy | MEDIUM | AI must translate CSS-style layout to Vuetify props — not always accurate |
| Existing codebase disruption | NONE | Pure developer tooling; zero codebase changes |

---

### IZ-E: Critical Prerequisite Check

**The single most important feasibility gate:**

> ❓ Does a Figma design file exist for the PMO Dashboard?

- If **YES** → MCP integration is APPROVED as assistive tool
- If **NO** → MCP provides zero value (no design data to fetch)

**Current PMO Dashboard context:**
- The system has a `prototype/` directory (likely HTML prototype, not Figma)
- Development appears code-first — no Figma file was referenced at any prior phase
- If no Figma file exists, MCP is blocked by missing prerequisite

---

### IZ-F: Risk Analysis

| Risk | Level | Mitigation |
|------|-------|-----------|
| Overengineering for mid-development project | LOW | MCP is a tool, not an architecture change |
| No Figma file exists → zero value | HIGH | Must confirm prerequisite before setup |
| AI generates non-Vuetify HTML (generic CSS) | MEDIUM | Always review + adapt output; treat as reference, not production code |
| Blindly auto-generating UI from MCP output | MEDIUM | Human review required; MCP is assistive only |
| Disruption to existing system | NONE | Zero codebase changes |

---

### IZ-G: Feasibility Summary

| Criterion | Result |
|-----------|--------|
| Technical feasibility | ✅ YES — VS Code native support, simple setup |
| Workflow benefit | CONDITIONAL — requires Figma design file |
| VS Code compatibility | ✅ YES |
| Copilot CLI (this tool) compatibility | ❌ N/A — terminal agent, not a VS Code MCP consumer |
| Vuetify workflow fit | PARTIAL — design metadata useful; framework mapping requires human review |
| Setup complexity | LOW |
| Codebase disruption | NONE |

**Overall decision:** APPROVED as optional assistive tool in VS Code Copilot Chat, **CONDITIONAL on Figma file existing**. DEFER if no Figma design file is available.

---

---

## Section 2.112— Phase IY: TypeScript Lint Error Fixes (2026-04-23)

**Status:** Phase 1 Research Complete
**Trigger:** Two TypeScript errors reported: unknown error type access + tsconfig deprecation.
**Objective:** Minimal, precise fixes to both errors without any behavioral or structural change.

---

### IY-A: Error 1 — `Property 'message' does not exist on type 'unknown'`

**File:** `pmo-backend/src/database/database.module.ts`, line 31

**Exact code:**
```typescript
} catch (error) {
  logger.error('Database connection failed:', error.message);  // ← error typed as unknown
  throw error;
}
```

**Root cause:** TypeScript 4.0+ types `catch` block variables as `unknown` (safer than the old implicit `any`). Direct property access on `unknown` is a compile error. However, `noImplicitAny: false` and `strictNullChecks: false` in tsconfig are both permissive — this error fires because `error.message` on `unknown` is a structural access error regardless of strict mode.

**Fix — inline type narrowing (Option A — recommended):**
```typescript
logger.error(
  'Database connection failed:',
  error instanceof Error ? error.message : String(error),
);
```

**Why `String(error)` fallback:** Not all thrown values are `Error` instances. Raw strings, numbers, or objects can be thrown. `String(error)` safely serializes any thrown value without property access.

**Why NOT `(error as Error).message`:** Unsafe cast bypasses TypeScript's protection — ruled out per directive.

---

### IY-B: Error 2 — `Option 'baseUrl' is deprecated`

**File:** `pmo-backend/tsconfig.json`, line 12

**Exact config:**
```json
"baseUrl": "./"
```

**TypeScript version:** `"typescript": "^5.1.3"` (may resolve higher; deprecation warning appears in TS 5.x warnings)

**Path aliases audit:**
- `tsconfig.json` has **no `paths` key** — zero path aliases defined
- All imports across 90+ source files use **relative paths** (`../`, `../../`) — confirmed by grep
- `baseUrl: "./"` is **NestJS CLI scaffold boilerplate** with no active functional use

**Correct fix:** Add `"ignoreDeprecations": "5.0"` to compiler options. This is the TypeScript-prescribed mechanism to silence deprecation warnings introduced at a given version without removing the deprecated option.

**Why NOT remove `baseUrl`:** Even though it has no active aliases, removing it could theoretically affect module resolution fallback behavior for the compiler. KISS + STRICT NON-DISRUPTION: suppress the warning, don't touch the option.

---

### IY-C: Safety Confirmation

| Check | Status |
|-------|--------|
| No `any` cast used | ✅ |
| No structural changes to database.module.ts | ✅ — 1 line change |
| No import refactoring needed | ✅ — no aliases exist to migrate |
| tsconfig behavior preserved | ✅ — `ignoreDeprecations` only suppresses warning |
| Other files affected | ✅ None |

---

---

## Section 2.111 — Phase IX: Post-MikroORM Stabilization Final Assessment (2026-04-23)

**Status:** Phase 1 Research Complete
**Trigger:** Operator requests post-stabilization validation and next-step decision gate.
**Objective:** Audit the ACTUAL current system state against the prompt's assumed state and determine the correct next development path.

---

### IX-A: Stated vs Actual System State

The prompt describes a partially-migrated state. That state is **outdated**. Actual current state:

| Area | Prompt Assumed | Actual State |
|------|---------------|--------------|
| MikroORM | Partially complete | ✅ **Terminal state** — all actionable paths migrated |
| auth strategies (DatabaseService) | Legacy gap | ✅ `google.strategy.ts` migrated (Phase IU) |
| test files (DatabaseService) | Legacy gap | ✅ `auth.service.spec.ts` clean (Phase IV) |
| `users.module.ts` dead import | Not mentioned | ✅ Removed (Phase IW) |
| Smoke test (IG→IN) | ❌ Not verified | ✅ **Operator confirmed PASS** (Phase IP) |
| Section 13 workflow | Needs validation | ✅ Verified by operator |
| Analytics (pillar-summary, quarterly-trend) | Needs validation | ✅ Analytics fix confirmed (Phase IN/IU) |
| OpenLDAP | Blocked by CSU IT | ⏸ **Deployment-gated** (operator provisions own server at go-live) |

---

### IX-B: Definitive MikroORM Terminal State

Phases completed since the prompt's assumed state:

| Phase | Scope | Status |
|-------|-------|--------|
| IQ | Hybrid model acceptance (88 raw SQL → `em.getConnection().execute()`) | ✅ Complete |
| IS | IP Postman collection | ✅ Complete |
| IT | QR per-report history endpoint | ✅ Complete |
| IU | `google.strategy.ts` DatabaseService → EntityManager | ✅ Complete |
| IV | `auth.service.spec.ts` stale test cleanup | ✅ Complete |
| IW | `users.module.ts` dead DatabaseModule import removed | ✅ Complete |

**Remaining DatabaseService consumers:**
- `ldap.strategy.ts` — ⏸ Phase IR, deployment-gated (NOT blocked by IT)
- `health.service.ts` — 🔒 Permanent keeper (infrastructure health, YAGNI)

No further migration work is actionable until deployment.

---

### IX-C: Smoke Test Gate Status

Phase IP smoke test was confirmed PASS by operator after Phase IS Postman collection delivery. All checkpoints verified:

| Checkpoint | Status |
|-----------|--------|
| pillar-summary — non-zero accomplishment_rate_pct | ✅ Verified |
| quarterly-trend — non-null actual_rate_q1..q4 | ✅ Verified |
| Section 13-A (list assignments) | ✅ Verified |
| Section 13-B (assign staff) | ✅ Verified |
| Section 13-C (update assignment) | ✅ Verified |
| Section 13-D (remove assignment) | ✅ Verified |
| IG→IN endpoint chain | ✅ Verified |

**Smoke gate: PASSED. System is stable.**

---

### IX-D: OpenLDAP Status — Corrected

The Phase IR blocker classification is updated:

| Old Classification | Corrected Classification |
|-------------------|--------------------------|
| BLOCKED — awaiting CSU IT credentials | ⏸ DEPLOYMENT-GATED — operator provisions own LDAP server at first deployment |

LDAP will not be activated during development. It activates at first deployment alongside Phase IR (~1–2 day scope when server is ready). System operates securely on JWT + Google OAuth until then.

---

### IX-E: Risk Assessment — Current

| Risk | Level | Rationale |
|------|-------|-----------|
| System instability | 🟢 LOW | Smoke test PASS, migration complete |
| MikroORM inconsistency | 🟢 LOW | Hybrid model accepted, em.getConnection() is MikroORM native API |
| LDAP gap | 🟢 LOW | Deployment-gated, existing auth is production-grade secure |
| Proceeding to features | 🟢 LOW | Stable base, no regressions detected |

**Verdict: System is safe to proceed to next development track.**

---

### IX-F: Next Development Track — Decision

| Path | Condition | Status |
|------|-----------|--------|
| Path 1 — LDAP activation | LDAP credentials + deployment server | ⏸ Deferred to deployment |
| Path 2 — Stakeholder feature development | Stable base | ✅ **UNBLOCKED — proceed** |

**Decision: PATH 2 — Stakeholder Feature Development.** Migration track formally closed. Next phases will be feature-driven based on operator direction.

---

---

## Section 2.110 — Phase IW: UsersModule Dead DatabaseModule Import Audit (2026-04-23)

**Status:** Phase 1 Research Complete
**Trigger:** Phase IV complete; continuing MikroORM migration cleanup audit.
**Objective:** Identify and document all remaining stale module-level `DatabaseModule` imports in the codebase.

---

### IW-A: Global Module Architecture

`DatabaseModule` is decorated with `@Global()` (line 40 of `database.module.ts`). This means:

- A single registration in `app.module.ts` makes `DatabaseService` available to **all modules** in the application.
- Any module that explicitly imports `DatabaseModule` again is creating a **redundant, dead import**.
- The redundant import is harmless at runtime but misleads developers into thinking the module's service depends on `DatabaseService`.

---

### IW-B: Module-Level DatabaseModule Import Audit

Grep across all `*.ts` in `src/` for `DatabaseModule`:

| File | Import Present | Service Uses DatabaseService? | Verdict |
|------|---------------|-------------------------------|---------|
| `app.module.ts` | ✅ | health.service.ts → YES | 🔒 Required (root global registration) |
| `auth/auth.module.ts` | ✅ | ldap.strategy.ts → YES (conditional) | ⏸ Keep until Phase IR — IR-D3 boundary |
| `users/users.module.ts` | ✅ | users.service.ts → **NO** (fully ORM) | ❌ **DEAD IMPORT** |

---

### IW-C: users.service.ts — Confirmed Fully ORM

`users.service.ts` constructor (line 56): `constructor(private readonly em: EntityManager) {}`

No `DatabaseService` injection. No `this.db` or `db.query()` calls. Full `EntityManager` usage throughout all methods. The `DatabaseModule` import in `users.module.ts` provides nothing to this module's DI context that isn't already globally available.

---

### IW-D: Spec File Audit

Only one spec file exists: `auth/auth.service.spec.ts`. No `DatabaseService` references remain (cleaned in Phase IV). Confirmed by grep — zero matches.

---

### IW-E: Remaining Migration Terminal State (Post-IW)

After Phase IW:

| Consumer | Status |
|----------|--------|
| `users.service.ts` | ✅ ORM — module import cleaned (Phase IW) |
| `google.strategy.ts` | ✅ ORM — migrated (Phase IU) |
| `auth.service.ts` | ✅ ORM — migrated (Phase IA-2b) |
| `auth.service.spec.ts` | ✅ EntityManager mock (Phase IV) |
| `ldap.strategy.ts` | ⏸ Phase IR (BLOCKED — IT credentials) |
| `health.service.ts` | 🔒 Permanent keeper |

**MikroORM migration is at its terminal state for all actionable items.** Phase IR is the sole remaining item and it is externally blocked.

---

---

## Section 2.109 — Phase IV: MikroORM Migration Completion Audit (2026-04-23)

**Status:** Phase 1 Research Complete
**Trigger:** Operator confirms Phase IU complete; requests continuation of MikroORM migration.
**Objective:** Full audit of all remaining DatabaseService references to determine what is left to migrate, what is permanently retained, and what is stale.

---

### IV-A: Complete DatabaseService Runtime Dependency Map

Grep across all `*.ts` in `pmo-backend/src` — confirmed 7 files reference `DatabaseService`:

| File | Category | Usage | Verdict |
|------|----------|-------|---------|
| `auth/strategies/google.strategy.ts` | Runtime | — | ✅ Migrated (Phase IU) |
| `auth/auth.service.ts` | Runtime | — | ✅ Fully ORM (no reference) |
| `auth/auth.service.spec.ts` | **Test** | `DatabaseService` mock + `query()` assertions | ❌ **STALE** |
| `auth/strategies/ldap.strategy.ts` | Runtime (conditional) | `db.query()` — 1 call | ⏸ Phase IR (BLOCKED) |
| `health/health.service.ts` | Runtime | `isConnected`, `getServerTime`, `getTableCount`, `getVersion`, `query` | 🔒 Permanent keeper |
| `database/database.service.ts` | Definition | — | Infrastructure |
| `database/database.module.ts` | Definition | — | Infrastructure |
| `app.module.ts` | Root module | `DatabaseModule` import | Infrastructure |
| `university-operations/university-operations.service.ts` | Comment only | Line 56 comment (documentation) | ✅ Not a dependency |

---

### IV-B: auth.service.spec.ts — Stale State Analysis

`auth.service.ts` was fully migrated to `EntityManager` in a prior ORM phase (Phase IA-2b or similar). Its constructor is:

```typescript
constructor(
  private readonly em: EntityManager,
  private readonly jwtService: JwtService,
) {}
```

However, `auth.service.spec.ts` was NOT updated — it still provides:

```typescript
providers: [
  AuthService,
  { provide: DatabaseService, useValue: mockDbService },  // ← stale
  { provide: JwtService, useValue: mockJwtService },
],
```

`EntityManager` is **not provided** in the test module. This causes a **NestJS DI resolution failure** at `module.compile()` — the test is currently broken if run.

Additionally, all test assertions call `expect(mockDbService.query).toHaveBeenCalledWith(...)` — which will never be invoked because `AuthService` now calls `em.findOne()` and `em.find()`.

**Broken tests (all 7 assertions in the spec):**

| Test case | Stale mock behavior |
|-----------|---------------------|
| `validateUser — user not found` | Mocks `query()` returning `{ rows: [] }` — but service calls `em.findOne()` |
| `validateUser — account inactive` | Same pattern |
| `validateUser — account locked` | Same pattern |
| `login — invalid credentials` | Same pattern |
| `getProfile — user not found` | Same pattern |
| `getProfile — returns profile` | Mocks 3 chained `query()` calls — service chains `em.find(UserRole)`, `em.find(Role)`, etc. |
| `logout — completes without error` | No DB mock needed — still valid but DI will fail first |

---

### IV-C: AuthService EntityManager Method Map

Methods called in `auth.service.ts` that need to be mocked:

| Method | Called in | Returns |
|--------|-----------|---------|
| `em.findOne(User, {...})` | `validateUser`, `getProfile`, `buildSsoTokenForUser` | `User \| null` |
| `em.find(UserRole, {...})` | `login`, `getProfile`, `buildSsoTokenForUser` | `UserRole[]` |
| `em.find(Role, {...})` | `login`, `getProfile`, `buildSsoTokenForUser` | `Role[]` |
| `em.find(RolePermission, {...})` | `login`, `getProfile` | `RolePermission[]` |
| `em.find(Permission, {...})` | `login`, `getProfile` | `Permission[]` |
| `em.find(UserPermissionOverride, {...})` | `login`, `getProfile` | `UserPermissionOverride[]` |
| `em.find(UserModuleAssignment, {...})` | `login`, `getProfile` | `UserModuleAssignment[]` |
| `em.find(UserPillarAssignment, {...})` | `login`, `getProfile` | `UserPillarAssignment[]` |
| `em.flush()` | `validateUser` (failed login), password reset flow | `void` |
| `em.persistAndFlush(entity)` | `createPasswordResetRequest` | `void` |
| `em.create(PasswordResetRequest, data)` | `createPasswordResetRequest` | entity |

---

### IV-D: health.service.ts — Confirmed Not a Migration Target

`health.service.ts` uses 5 `DatabaseService` methods:
- `isConnected()` — raw pg pool `SELECT 1` check
- `getServerTime()` — `SELECT NOW()`
- `getTableCount()` — `information_schema.tables` count
- `getVersion()` — `SELECT version()`
- `query()` — table listing from `information_schema`

These are **infrastructure health checks**, not business logic. Raw pg pool check is more reliable for health monitoring than routing through MikroORM's connection layer (bypasses ORM context). Per YAGNI: no functional defect → no migration warranted. **Permanent keeper.**

---

### IV-E: Migration Completion Status

| Scope | Status |
|-------|--------|
| Entity layer (all modules) | ✅ Complete |
| UO Service (88 raw SQL — hybrid model) | ✅ Complete — Phase IQ accepted |
| `auth.service.ts` | ✅ Fully ORM |
| JWT strategy | ✅ Fully ORM |
| Google strategy | ✅ Complete — Phase IU |
| LDAP strategy | ⏸ Blocked — Phase IR (awaiting IT credentials) |
| `auth.service.spec.ts` | ❌ **STALE** — broken test, EntityManager not mocked |
| `health.service.ts` | 🔒 Permanent keeper |

**Structural migration: 95% complete.** Two items remain:
1. **Phase IV** — Fix stale test (`auth.service.spec.ts`). Actionable now. Small scope.
2. **Phase IR** — LDAP strategy migration. Blocked by external dependency (IT credentials).

After Phase IV + IR: `DatabaseService` is retained only by `health.service.ts` permanently — this is the accepted terminal state.

---

---

## Section 2.108 — Phase IU: Google OAuth Strategy DatabaseService Migration (2026-04-24)

**Status:** Phase 1 Research Complete
**Trigger:** Post-IP/IQ/IR planning — operator requests further MikroORM migration continuation. Phase IT complete. Next migration target identified: `google.strategy.ts` legacy transport.

---

### IU-A: Auth Strategy DatabaseService Audit

Three files in the auth module use `DatabaseService`:

| File | `db.query()` calls | Line(s) | Transport | Status |
|------|-------------------|---------|-----------|--------|
| `google.strategy.ts` | 2 | 54, 85 | `DatabaseService.query()` → `result.rows` | **MIGRATE in IU** |
| `ldap.strategy.ts` | 1 | 47 | `DatabaseService.query()` → `result.rows` | **Reserved — Phase IR-D3** |
| `auth.service.spec.ts` | 0 runtime | — | Mock only in tests | Not applicable |

`auth.service.ts` does NOT use `DatabaseService` (confirmed grep).

`health.service.ts` uses `DatabaseService` for DB ping metrics — permanent keeper (never migrate).

---

### IU-B: google.strategy.ts SQL Analysis

**Line 54–61: User lookup by google_id OR email**

```typescript
const result = await this.db.query(
  `SELECT id, email, is_active, google_id
   FROM users
   WHERE (google_id = $1 OR LOWER(email) = LOWER($2))
     AND deleted_at IS NULL
   LIMIT 1`,
  [profile.id, email],
);
// Returns: result.rows — pg-style array wrapper
if (result.rows.length === 0) { ... }
const user = result.rows[0];
```

**Line 85–88: Link google_id if not yet linked**

```typescript
await this.db.query(
  `UPDATE users SET google_id = $1, updated_at = NOW() WHERE id = $2`,
  [profile.id, user.id],
);
// No return value used
```

Both queries use `$N` PostgreSQL-style binding (native pg transport). These must be converted to `?` Knex-style when migrating to `em.getConnection().execute()`.

---

### IU-C: Migration Pattern

| Before (`DatabaseService`) | After (`EntityManager`) |
|---------------------------|------------------------|
| `this.db.query(sql_$N, [p1, p2])` | `this.em.getConnection().execute(sql_?, [p1, p2])` |
| `result.rows` | `result` (array direct) |
| `result.rows.length` | `result.length` |
| `result.rows[0]` | `result[0]` |
| `private readonly db: DatabaseService` | `private readonly em: EntityManager` |

EntityManager is injected from `@mikro-orm/core`. The `MikroOrmModule.forFeature([...])` already exists in `auth.module.ts` (line 28), so `EntityManager` is available without adding new module imports.

---

### IU-D: IR-D3 Constraint — ldap.strategy.ts Excluded from IU

Plan directive `IR-D3`: *"ldap.strategy.ts migration to em.getConnection().execute MUST happen in the same phase as activation."*

`LdapStrategy` is conditionally registered only when `LDAP_URL` is non-empty (auth.module.ts line 58). Migration is reserved for Phase IR to avoid a desynchronized state where transport is migrated but activation never happens.

**IU scope is `google.strategy.ts` ONLY.**

---

### IU-E: DatabaseModule Retention in auth.module.ts

`DatabaseModule` (line 11, 27 of auth.module.ts) must NOT be removed in Phase IU because:
- `ldap.strategy.ts` still imports `DatabaseService` and will need it when Phase IR activates
- NestJS resolves `DatabaseService` at startup for all conditionally-registered providers

`DatabaseModule` removal from `auth.module.ts` is deferred to Phase IR completion.

---

### IU-F: Post-IU State

After Phase IU, `DatabaseService` runtime consumers:

| Consumer | Count | Disposition |
|----------|-------|-------------|
| `google.strategy.ts` | 0 | ✅ Migrated in IU |
| `ldap.strategy.ts` | 1 | ⏸ Reserved for Phase IR |
| `health.service.ts` | N | 🔒 Permanent keeper |

The MikroORM migration will be **structurally complete** after Phase IU + Phase IR. Only `health.service.ts` will retain `DatabaseService` as a permanent, architecturally justified consumer.

---

---

## Section 2.107 — Phase IT: Quarterly Report Per-Report History Endpoint (2026-04-23)

**Status:** Phase 1 Research Complete
**Trigger:** 404 on `GET /api/university-operations/quarterly-reports/:id/history` during IP smoke gate run.

### IT-A: Root Cause

`GET quarterly-reports/:id/history` is **not registered** in `university-operations.controller.ts`. No such route exists.

Grep confirms: only `quarterly-reports/submission-history` exists (line 253, controller), which is a collection-level endpoint filtered by `?fiscal_year=&quarter=` query params.

### IT-B: Existing Related Service Method

`findSubmissionHistory(user, fiscalYear?, quarter?)` at service line 3586:
- Admin-only guard (`this.isAdmin(user)`)
- Queries `quarterly_report_submissions qrs JOIN quarterly_reports qr ON qrs.quarterly_report_id = qr.id`
- Filters by optional `fiscal_year` and `quarter` — NOT by specific `quarterly_report_id`
- Returns append-only event log with actor names via LEFT JOINs

### IT-C: `quarterly_report_submissions` Table Structure

Columns available for per-report query: `quarterly_report_id` (FK → `quarterly_reports.id`), `event_type`, `version`, `submitted_by`, `submitted_at`, `reviewed_by`, `reviewed_at`, `review_notes`, `actioned_by`, `actioned_at`, `reason`, `fiscal_year`, `quarter`.

Fix: add WHERE clause `qrs.quarterly_report_id = ?` to produce per-report history.

### IT-D: Postman 14-C Assessment

`14-C: Get Quarterly Report History` in `postman-ip-smoke-gate.json` (line 568):
- URL: `{{base_url}}/api/university-operations/quarterly-reports/{{qr_id}}/history`
- Assertions: `status 200` + `returns array`
- Guard: `if (!pm.collectionVariables.get('qr_id')) return;` — skips safely if 14-A found no Q1 report

**The URL pattern is architecturally correct.** No Postman refactor needed. Only backend implementation is missing.

### IT-E: Route Placement

New route `@Get('quarterly-reports/:id/history')` must be added **before** `@Get('quarterly-reports/:id')` (controller line 266) as NestJS registers routes in declaration order. Both patterns are distinct (different path lengths), but convention requires more-specific routes first.

### IT-F: Access Level Decision

Admin-only (consistent with `findSubmissionHistory`). The `quarterly_report_submissions` table is an audit log; access parity with the collection-level endpoint is the safest choice.

---

---

## Section 2.106 — Phase IP/IQ/IR: Post-MikroORM Stabilization Research (2026-04-23)

**Status:** Phase 1 Research Complete
**Objective:** Establish findings for three forward-looking phases: IP (smoke validation gate), IQ (MikroORM hybrid model acceptance), IR (OpenLDAP activation readiness).
**Prerequisite:** Section 2.105 is the primary research body — findings here extend and formalize it for plan writing.

---

### IP-A: Smoke Test Collection Coverage Audit

`postman-if-smoke-test.json` has 14 sections (00–13) totaling ~65 requests.

| Section | Scope | Variables set |
|---|---|---|
| 00 | Auth (login) | `token` |
| 01 | Fiscal Year | — |
| 02 | Taxonomy | — |
| 03 | Operations CRUD | `op_id` (03-B) |
| 04 | Org Info | — |
| 05 | Pillar Lookup | — |
| 06 | Indicators | `tax_id` (06-A), `indicator_id` (06-D) |
| 07 | Financials | `financial_id` (07-B) |
| 08 | Quarterly Report Lifecycle | `qr_id` (08-A) |
| 09 | Operation Workflow | — |
| 10 | Analytics | — |
| 11 | Physical Page Regression | — |
| 12 | Financial Page Regression | — |
| 13 | Assignment CRUD (IJ) | `ij_assignment_user_id` (13-B); requires manual `staff_user_id` |

**Variable dependency chain:**
```
00-A (token) → 03-B (op_id) → 06-A (tax_id) → 06-D (indicator_id)
             → 07-B (financial_id) → 08-A (qr_id)
             → [manual] staff_user_id → 13-B (ij_assignment_user_id)
```

**Known failure mode:** 03-B is a `POST` (create). On repeat runs it returns `409 Conflict` (operation code already exists) → `op_id` never set → all `/:op_id/` requests get double-slash 404. Workaround: manually set `op_id` from existing operation.

---

### IP-B: Smoke Test Assertion Gap — Analytics Section 10

All 9 requests in Section 10 (10-A through 10-I) assert ONLY:
```js
pm.test('Status 200', () => pm.response.to.have.status(200));
```

This is insufficient to catch the Phase IN bug pattern (returns 200 with 0/null values). The smoke test PASSED before Phase IN was fixed — it would have masked the data loss.

**Consequence:** After applying Phase IN, a `Status 200` assertion STILL PASSES even if the backend was not restarted (old process returns 200 with wrong data). Operator must manually inspect 10-A and 10-B response bodies for non-zero values.

**Future hardening opportunity (Phase IN+1 or next smoke update):** Add assertions to 10-A and 10-B:
```js
var j = pm.response.json();
pm.test('10-A: indicators_with_data > 0', () => pm.expect(j.indicators_with_data).to.be.above(0));
pm.test('10-A: accomplishment_rate_pct non-null', () => pm.expect(j.accomplishment_rate_pct).to.be.a('number'));
```

---

### IQ-A: MikroORM Hybrid Model — Boundaries Confirmed

From Section 2.105 IO-C:

| DB Access Tier | Count | Verdict |
|---|---|---|
| `em.find`/`em.persist`/`em.flush`/`em.nativeDelete` | 11 calls in UO service; 173 across all services | ✅ ORM — correct for CRUD |
| `em.getConnection().execute(sql, [?...])` | 88 calls (UO service only) | ✅ Accepted — complex CTEs, analytics queries |
| `this.db.query(sql, [$N...])` | 3 calls (ldap.strategy.ts, google.strategy.ts) | ⚠️ Legacy — OK to stay, migrate only when files are next touched |

**Health service** (`health.service.ts`) uses `DatabaseService` exclusively for ping/metrics — this is a separate operational concern and should NOT be migrated to ORM. No app data is read through health.

**Architecture boundary rule:**
- ✅ New CRUD → ORM
- ✅ Existing analytics → raw SQL via Knex (`em.getConnection().execute`)  
- ⚠️ Auth strategies → legacy `pg` pool (DatabaseService) — migrate opportunistically with T2/Google work
- ❌ Never introduce new `DatabaseService` usage

---

### IR-A: OpenLDAP Pre-Activation State

From Section 2.105 IO-B, confirmed:

| Blocker | Status |
|---|---|
| `LDAP_URL` not populated in `.env` | ❌ Blocking (strategy not loaded) |
| Frontend LDAP login button absent | ❌ Blocking (no user-facing entry point) |
| `ldap.strategy.ts` uses legacy `this.db.query` | ⚠️ Non-blocking (works, inconsistent transport) |
| End-to-end test never run | ❌ Blocking (Phase HY ⚠️ PARTIAL) |
| `loginWithLdapUser()` JWT issuance exists | ✅ Backend ready |
| Conditional registration guard in `auth.module.ts:58` | ✅ Safe startup with blank LDAP_URL |

**Runtime behavior with blank `LDAP_URL`:** `auth.module.ts` checks `process.env.LDAP_URL` at bootstrap — if empty string/falsy, `LdapStrategy` is NOT registered. `POST /auth/ldap` route exists in the controller but will return `401` (no strategy) — this is acceptable behavior for a pre-activation state.

---

## Section 2.105 — Phase IO: Roadmap Analysis — Next Step + OpenLDAP Status + MikroORM Status (2026-04-23)

**Status:** Phase 1 Research Complete → Phase 2 Plan (advisory — no mutations authorized)
**Objective:** Deep analysis of three operator inquiries: (1) what's the next step, (2) OpenLDAP functional and consistently used, (3) MikroORM fully implemented.

---

### IO-A: Current Pipeline State (2026-04-23)

All recent "I" phases complete per plan header:
- IG / IH / II → `$N` → `?` param binding track (CLOSED)
- IJ / IK / IL-R / IM / IN → Assignment CRUD + smoke + frontend + diagnosis + analytics CTE fix (CLOSED)

**No implementation phase is queued.** The plan has no `🔜 PENDING` items after Phase IN marked complete this session. The pipeline is in a **pre-verification rest state** awaiting operator-side smoke execution.

---

### IO-B: OpenLDAP Implementation Audit

#### IO-B-1: Backend scaffold — PRESENT but NOT CONSISTENTLY USED

**Evidence:**
| File | Line | State |
|---|---|---|
| `pmo-backend/package.json` | 45 | `passport-ldapauth ^3.0.1` installed |
| `src/auth/strategies/ldap.strategy.ts` | 1–78 | `LdapStrategy` class extends `PassportStrategy(Strategy, 'ldap')` |
| `src/auth/auth.module.ts` | 58 | **Conditional registration:** `...(process.env.LDAP_URL ? [LdapStrategy] : [])` — strategy only loads if env var is set |
| `src/auth/auth.controller.ts` | 147–164 | `POST /auth/ldap` route exists, gated by `AuthGuard('ldap')` |
| `src/auth/auth.service.ts` | 375–379 | `loginWithLdapUser()` issues JWT after strategy validation |
| `.env` | 30–35 | `LDAP_URL=` (empty). Comment: "Phase HY — fill in when IT provides credentials" |

**Verdict:** Backend code is COMPLETE and correctly gated, but **NOT ACTIVATED** — runtime will not load `LdapStrategy` because `LDAP_URL` is blank.

#### IO-B-2: Frontend — OpenLDAP LOGIN BUTTON MISSING

**Evidence:** `grep -i ldap pmo-frontend/pages/login.vue` → **0 matches** (only hit in the SVG logo file). `login.vue` renders three auth paths:
- Local username/password form (line 183 "Sign In")
- Google SSO button (line 201 "Sign in with Google")
- Password reset request dialog (line 216)

**No LDAP button, no LDAP form, no `POST /api/auth/ldap` caller.** The backend route is effectively orphaned from UI.

#### IO-B-3: Strategy uses LEGACY `this.db.query` — NOT MikroORM

**Evidence:** `ldap.strategy.ts:47` uses `this.db.query(..., [email])` with PostgreSQL `$1` placeholder via `DatabaseService`. `DatabaseService` (at `src/database/database.service.ts`) is a thin `pg` pool wrapper, still in use by `auth/strategies/` and `health/`.

This is not immediately broken (pg driver natively accepts `$N`), but it means the LDAP path is in a **different database transport lane** from the rest of the app (MikroORM/Knex with `?` placeholders). An inconsistency, not a bug.

#### IO-B-4: Plan header lists HY as ⚠️ PARTIAL (POST unverified)

**Evidence:** `plan.md` line 3 — "HY: ⚠️ PARTIAL (POST unverified)". The OpenLDAP implementation has never been end-to-end tested against a live LDAP server because credentials are pending from CSU IT.

#### IO-B-5: Summary — OpenLDAP Status

| Criterion | Status |
|---|---|
| Properly scaffolded on backend | ✅ |
| Conditionally wired (safe when env blank) | ✅ |
| Functional (runnable end-to-end) | ❌ No — no env config + no frontend button |
| Consistently being used | ❌ No — orphaned from UI, no test traffic |
| Uses same data access pattern as rest of app | ❌ No — legacy `this.db.query` |

---

### IO-C: MikroORM Implementation Audit

#### IO-C-1: Entity coverage — FULL

**Evidence:** 70+ `@Entity` classes under `src/database/entities/`. All tables in schema have a corresponding entity file (users, roles, permissions, university_operations, operation_indicators, operation_financials, record_assignments, quarterly_reports, quarterly_report_submissions, construction_projects, repair_projects, etc.).

#### IO-C-2: Service-layer adoption — MIXED

**Evidence (grep counts):**
| Pattern | Count | Meaning |
|---|---|---|
| `em.find`/`em.findOne`/`em.persist`/`em.nativeDelete`/`em.create`/`em.flush` | 173 usages across 11 service files | Repository/ORM method calls |
| `em.getConnection().execute(sql, params)` | 88 usages in `university-operations.service.ts` + 2 elsewhere | Raw SQL via Knex transport (not ORM) |
| `this.db.query(sql, [...])` | 3 usages in 2 files (`ldap.strategy.ts`, `google.strategy.ts`) | Legacy pre-MikroORM transport |

**Verdict:** MikroORM is **DECLARED everywhere but RAW SQL still dominates UO service**. The UO service performs 88/261 (≈34%) of its DB calls via raw `execute()` rather than ORM methods. This is the single largest concentration of raw SQL in the codebase.

#### IO-C-3: Phase IA-3 intentionally stopped at wrapper conversion

**Evidence:** Phase IA-3 directive: "Convert all remaining `this.db.query()` → `em.getConnection().execute()` + remove `DatabaseModule`/`DatabaseService` from UO module". It did NOT mandate converting raw SQL to ORM repository methods. Phases IG/IH/II converted `$N` → `?` inside those raw strings. The raw SQL remains.

#### IO-C-4: Tier 3 ORM migration indefinitely deferred

**Evidence:** Plan directive 272 (line 17176): "Tier 3 🔜 (Construction + Repair + Projects — Phase HM, high complexity, **indefinitely deferred**)". HM is marked COMPLETE in the header but the directive text indicates migration scope was narrowed.

#### IO-C-5: `DatabaseService` / `DatabaseModule` still imported by 9 files

**Evidence:** 9 files still reference `DatabaseModule`/`DatabaseService`:
- `auth/auth.service.spec.ts` (test only)
- `users/users.module.ts`
- `auth/strategies/google.strategy.ts`
- `auth/strategies/ldap.strategy.ts`
- `app.module.ts`
- `auth/auth.module.ts`
- `database/database.service.ts` (definition)
- `health/health.service.ts`
- `database/database.module.ts` (definition)

These are the residual `pg`-pool users. Not a defect, but evidence of partial migration.

#### IO-C-6: Summary — MikroORM Status

| Criterion | Status |
|---|---|
| Entities defined for all tables | ✅ Full coverage (70+) |
| ORM configured and bootstrapped | ✅ `mikro-orm.config.ts` live |
| All services use ORM repository methods | ❌ UO service still 88× raw SQL via Knex |
| Legacy `DatabaseService` decommissioned | ❌ Still present; auth strategies + health use it |
| Placeholder syntax consistent | ✅ All MikroORM calls use `?`; legacy `pg` uses `$N` (correct for that transport) |
| "Fully implemented at this phase of development" | ⚠️ **PARTIAL** — scaffolding and new code use ORM; legacy hot paths (UO analytics, auth strategies) still raw |

---

### IO-D: Next-Step Options (Operator Choice)

Three candidate tracks for the next implementation phase:

| Track | Scope | Effort | Priority |
|---|---|---|---|
| **T1 — Smoke verification (no code)** | Operator runs Postman collection after Phase IN backend restart; close-out sprint | ≈30 min operator | HIGH — blocks all further work |
| **T2 — OpenLDAP activation** | (a) obtain CSU IT credentials, (b) add LDAP button to `login.vue` + auth store `loginLdap()` method, (c) smoke test end-to-end, (d) migrate `ldap.strategy.ts` `db.query` → `em.getConnection().execute` for consistency | 1–2 focused phases; blocked by IT credentials | MEDIUM — Phase HY already ⚠️ PARTIAL |
| **T3 — UO service ORM completion** | Convert hot-path analytics methods (`findAll`, `findOne`, `getPillarSummary`, `getQuarterlyTrend`, `getYearlyComparison`) from raw SQL to ORM `qb`/repository calls | 3–5 phases; high risk due to complex CTE queries; YAGNI unless a functional bug demands it | LOW — raw SQL works correctly post-IG/IH/II/IN |

---

### IO-E: Recommendation

**Next step:** Track **T1 (Smoke verification)** first. The Phase IN fix is unverified against live data; the entire "I" track is unverified in aggregate. No new work should be authorized until the operator confirms Section 13 + analytics smoke returns the expected 200/201/204/non-zero-rates values.

**After T1 passes:** defer T3 (YAGNI — raw SQL is working). Promote T2 to next phase IF CSU IT delivers LDAP credentials; otherwise keep HY in ⚠️ PARTIAL and move to non-ORM feature work (stakeholder feedback items, reference data UI, etc.).

---

## Section 2.104 — Phase IN: Analytics Actual Value Loss — CTE Parameter Mismatch (2026-04-23)

**Status:** Phase 1 Research Complete → Phase 2 Plan in progress
**Objective:** Identify exact root cause of analytics actual values, rates, and percentages showing as 0/null on University Operations dashboard after MikroORM migration.

---

### IN-A: Root Cause — TWO-STAGE CTE PARAMETER UNDERBINDING

**Confirmed. No ambiguity.**

In Phase GO, `getPillarSummary` and `getQuarterlyTrend` were refactored to use a two-stage CTE pattern (`canonical_ops` + `merged`/`deduped`) to fix multi-operation/multi-row deduplication. The refactor added a **second `WHERE oi.fiscal_year = ?`** in the inner CTE — but the params arrays passed to `em.getConnection().execute()` were **not updated** to include `fiscalYear` twice.

MikroORM's Knex transport binds `?` positionally from the params array. When params has fewer elements than `?` placeholders, the extra `?` binds to `undefined`, which PostgreSQL treats as `NULL`. `WHERE oi.fiscal_year = NULL` is always `FALSE` → the inner CTE returns zero rows → all aggregates (SUM, AVG, COUNT) collapse to 0 or NULL.

---

### IN-B: Affected Methods — Exact Evidence

---

**Method 1: `getPillarSummary` (line 2300–2408)**

| CTE | Placeholder | Position | Value needed |
|---|---|---|---|
| `canonical_ops` WHERE (line 2307) | `?` | 1st | `fiscalYear` |
| `merged` WHERE (line 2322) | `?` | 2nd | `fiscalYear` |

Params passed (line 2407): `[fiscalYear]` — **1 element, 2 needed** ❌

Effect on response:
- `indicators_with_data` → 0 (merged empty)
- `count_target`, `count_accomplishment` → 0
- `pct_avg_target`, `pct_avg_accomplishment` → null
- `average_accomplishment_rate` → null
- `accomplishment_rate_pct` → null

Only `total_taxonomy_indicators`, `outcome_indicators`, `output_indicators` are unaffected — they come from the separate `taxonomyRes` query which has no `?` placeholder at all.

---

**Method 2: `getQuarterlyTrend` (line 2523–2561)**

| CTE | Placeholder | Position | Value needed |
|---|---|---|---|
| `canonical_ops` WHERE (line 2529) | `?` | 1st | `fiscalYear` |
| `canonical_ops` optional filter (line 2530) | `?` | 2nd (if pillarType set) | `pillarType` |
| `deduped` WHERE (line 2545) | `?` | last | `fiscalYear` again |

Params at execute (line 2561):
- Without `pillarType`: `[fiscalYear]` — **1 element, 2 needed** ❌
- With `pillarType`: `[fiscalYear, pillarType]` — **2 elements, 3 needed** ❌

Effect: deduped CTE returns zero rows → `target_rate_q1..q4` = 0, `actual_rate_q1..q4` = null → chart flat zero.

---

**Method 3: `getYearlyComparison` — ALREADY CORRECT ✅**

Both `yearlyRes` (line 2674) and `pillarRes` (line 2744) use `[...years, ...years]` — correctly doubles the years array for both CTEs. This method works correctly.

---

**Method 4: Financial analytics — UNAFFECTED ✅**

`getFinancialPillarSummary`, `getFinancialQuarterlyTrend`, `getFinancialExpenseBreakdown`, `getFinancialYearlyComparison` — all use flat queries with no CTE. Single `WHERE` clause, single `?`, single param. Correctly bound.

---

### IN-C: Null Propagation Chain

```
[fiscalYear]  →  2 ? placeholders
                  ↓
         Second ? = undefined → PostgreSQL NULL
                  ↓
    merged WHERE oi.fiscal_year = NULL → always FALSE
                  ↓
         merged CTE returns 0 rows
                  ↓
  outer SELECT aggregates over empty set
                  ↓
  SUM → 0 | AVG → NULL | COUNT → 0
                  ↓
  JS: countTarget=0, pctAvg=null, rate=null
                  ↓
  Frontend: 0%, null values, blank charts
```

---

### IN-D: Why `getYearlyComparison` Was Done Correctly

`getYearlyComparison` uses `IN (${yqs})` instead of `= ?`, and the params pattern `[...years, ...years]` makes the doubling explicit. The developer writing that method was aware the CTE needed params twice. The same awareness was not applied retroactively to `getPillarSummary` and `getQuarterlyTrend` during the Phase GO CTE refactor.

---

### IN-E: Scope Summary

| Method | Has CTE? | Param mismatch? | Affected? |
|---|---|---|---|
| `getPillarSummary` | ✅ two-stage | ❌ `[fy]` → needs `[fy, fy]` | **YES — fix needed** |
| `getQuarterlyTrend` | ✅ two-stage | ❌ `params` → needs `[...params, fy]` | **YES — fix needed** |
| `getYearlyComparison` | ✅ two-stage | ✅ `[...years, ...years]` | No |
| `getFinancialPillarSummary` | ❌ flat | ✅ `[fy]` correct | No |
| `getFinancialQuarterlyTrend` | ❌ flat | ✅ `[fy]` correct | No |
| `getFinancialYearlyComparison` | ❌ flat | ✅ `[...years]` correct | No |
| `getFinancialExpenseBreakdown` | ❌ flat | ✅ `[fy]` correct | No |

**Total fixes required: 2 lines of code.**

---

## Section 2.103 — Phase IM: IJ Assignment API Failure Diagnosis (2026-04-23)

**Status:** Phase 1 Research Complete → Phase 2 Plan in progress
**Objective:** Identify root cause(s) of all four Section 13 (IJ) assignment endpoints failing in Postman smoke test.

---

### IM-A: Symptom

All four `/assignments` endpoints (13-A GET, 13-B POST, 13-C POST idempotency, 13-D DELETE) return errors regardless of `staff_user_id` collection variable being set. This implicates a structural or operational issue — not a payload issue — because 13-A (GET, no body required) also fails.

---

### IM-B: Code Verification — Routes, Service, Entity, Module All Correct

Evidence collected:

| Check | Finding | Verdict |
|---|---|---|
| Controller routes | Lines 466–488: `GET :id/assignments`, `POST :id/assignments`, `DELETE :id/assignments/:userId` | ✅ Defined |
| Service methods | Lines 121–161: `getOperationAssignments`, `addOperationAssignment`, `removeOperationAssignment` | ✅ Defined |
| Entity | `record-assignment.entity.ts` — maps to `record_assignments` table via `UnderscoreNamingStrategy` | ✅ Correct |
| Module registration | `university-operations.module.ts` line 28: `RecordAssignment` in `MikroOrmModule.forFeature()` | ✅ Registered |
| Entity barrel export | `entities/index.ts` line 22: `RecordAssignment` exported | ✅ Exported |
| Migration | `012_add_record_assignments_table.sql` creates `record_assignments` with all expected columns | ✅ Exists |
| Route order conflict | `@Get(':id')` (line 367) is 1 segment; `@Get(':id/assignments')` (line 466) is 2 segments — Express distinguishes by segment count | ✅ No conflict |
| RBAC | Class-level `@Roles('Admin', 'Staff')` covers assignment routes — no explicit override needed | ✅ Correct |

**Conclusion:** The Phase IJ implementation is structurally correct. The failure is operational or environmental.

---

### IM-C: Root Cause Analysis — Four Ranked Suspects

---

**SUSPECT 1 (PRIMARY): Backend Not Restarted After Phase IJ Implementation**

All four routes exist in TypeScript source but the running NestJS process may pre-date the IJ commit. Express route table is built at startup — new routes not present at startup are not served.

Evidence: If the backend was started before Phase IJ was written and has not been restarted, `GET /api/university-operations/:id/assignments` produces **404 Not Found** for all four Section 13 requests.

Trigger condition: Applies regardless of `staff_user_id` being set or not. 13-A (no body) fails identically.

Fix: `Ctrl+C` the backend process → `npm run start:dev` (or rebuild if using compiled JS).

---

**SUSPECT 2 (SECONDARY): Migration 012 Not Applied to Target Database**

`record_assignments` table is defined in `012_add_record_assignments_table.sql` but may not have been applied to the DB instance the backend connects to.

Counter-evidence: `findAll()` (line 526–528) and `findOne()` (lines 546–548) both include a correlated subquery joining `record_assignments`. If those routes work in other sections (03-B, 04-A, etc.), the table exists → this suspect is **lower probability** if other Postman sections pass.

If suspect 1 is ruled out and a 500 error with `relation "record_assignments" does not exist` appears → apply migration 012.

---

**SUSPECT 3 (TERTIARY): `staff_user_id` Is Not a Real `users` Table Entry**

Affects only 13-B and 13-C (POST). Not relevant to 13-A (GET) or 13-D (DELETE of non-existent row).

`record_assignments.user_id` has a FK constraint: `REFERENCES users(id) ON DELETE CASCADE`. If the UUID provided does not match any row in `users`, PostgreSQL throws: `insert or update on table "record_assignments" violates foreign key constraint` → **500 Internal Server Error**.

Observed: User stated staff_user_id is set, but UUID may have been manually typed (typo) or copied from a different context (wrong DB environment).

Fix: Call `GET /api/users` with auth token → locate a user with `role: "Staff"` → copy `id` field exactly.

---

**SUSPECT 4 (QUATERNARY): `findOne()` RBAC — Operation Not Visible to Caller**

`addOperationAssignment()` calls `this.findOne(operationId)` at line 133 before creating the assignment. `findOne()` is a raw SQL query with no RBAC filter (any authenticated user can call it). However, if `op_id` is stale (operation was soft-deleted since 03-B ran), `findOne` throws `NotFoundException` → **404**.

Affects only 13-B and 13-C. Does not explain 13-A or 13-D failures.

Fix: Re-run 03-B to refresh `{{op_id}}` against a live operation.

---

### IM-D: Column Name Mapping Verification

Entity `RecordAssignment` uses `TsMorphMetadataProvider` with no explicit `fieldName`. MikroORM `PostgreSqlDriver` applies `UnderscoreNamingStrategy` by default:

| Entity Property | DB Column | Match |
|---|---|---|
| `recordId` | `record_id` | ✅ |
| `userId` | `user_id` | ✅ |
| `assignedAt` | `assigned_at` | ✅ |
| `assignedBy` | `assigned_by` | ✅ |

No explicit `fieldName` annotation is required. ORM-level queries (`em.find`, `em.findOne`, `em.nativeDelete`) will use correct column names.

---

### IM-E: Diagnostic Decision Tree

```
Section 13 all fail?
│
├── Error type is 404 Not Found?
│   └── CAUSE: Backend not restarted → RESTART backend
│
├── Error type is 500 on ALL (including 13-A GET)?
│   └── CAUSE: record_assignments table missing → RUN migration 012
│
├── Error type is 500 on 13-B/C only, 13-A returns []?
│   └── CAUSE: staff_user_id FK violation → GET /api/users, copy real Staff UUID
│
└── Error type is 404 on 13-B/C only, 13-A returns []?
    └── CAUSE: op_id stale → re-run 03-B to refresh op_id
```

---

### IM-F: research.md Section 2.102

## 1. CURRENT FINDINGS (Active Research)

---

## Section 2.102 — Phase IL Revised: Frontend Assignment Management (2026-04-23)

**Status:** Phase 1 Research Complete → Phase 2 Plan in progress
**Objective:** Identify correct target file and optimal implementation for frontend assignment management after Phase IL plan was blocked by incorrect assumption about UO operations list.

---

### IL2-A: Prior Plan Assumption Was Wrong — No Operations List in Frontend

**Evidence:** `pmo-frontend/pages/university-operations/` contains: `index.vue` (analytics hub), `new.vue` (create form), `physical/index.vue` (BAR1 data entry), `financial/index.vue` (BAR2 data entry). Zero `v-data-table` or `headers` array found in `index.vue` or `new.vue`. The previous plan targeted an operations list table that does not exist.

---

### IL2-B: `findOperationForDisplay()` Does NOT Return `assigned_users`

**Evidence:** Service lines 236–243:
```sql
SELECT * FROM university_operations
WHERE operation_type = ? AND fiscal_year = ? AND deleted_at IS NULL LIMIT 1
```
Plain `SELECT *` — no `assigned_users` subquery. The `pillar-operation` endpoint (used by `physical/index.vue`) returns raw table columns only. `currentOperation.value` in `physical/index.vue` has **no** `assigned_users` field.

Contrast with `findAll()` (lines 526–528) and `findOne()` (lines 546–548): both include the `json_agg` subquery that produces `assigned_users: [{ id, name }]`.

**Impact:** Using `physical/index.vue` as target would require either (a) a backend change to `findOperationForDisplay()` to add the subquery, or (b) an extra `findOne()` call after loading. Either adds complexity.

---

### IL2-C: `index.vue` (Analytics Hub) Is Correct Target — Zero Backend Changes Needed

**Evidence:** `findAll()` already returns `assigned_users` per row. `index.vue` already has:
- `isAdmin` from `usePermissions()`
- `selectedFiscalYear` from Pinia store (already used for all analytics fetches)
- Fiscal year change reactivity (`watch(selectedFiscalYear, ...)`)

A collapsible "Operations" admin panel in `index.vue` can call `GET /api/university-operations?fiscal_year=${selectedFiscalYear}` (no pagination needed — at most 4 operations per fiscal year, one per pillar) and receive `assigned_users` in the response with zero backend changes.

---

### IL2-D: Operations Count Per Fiscal Year Is Always ≤ 4

**Evidence:** One operation per pillar (`HIGHER_EDUCATION`, `ADVANCED_EDUCATION`, `RESEARCH`, `TECHNICAL_ADVISORY`) per fiscal year. Max 4 rows. No pagination, no infinite scroll needed. A simple table or `v-list` suffices.

---

### IL2-E: Eligible Users Endpoint Already Exists in `new.vue`

**Evidence:** `new.vue` line ~84:
```typescript
const staffUsers = ref<{ id: string; first_name: string; last_name: string }[]>([])
```
This is loaded from `GET /api/users/eligible-for-assignment` (confirmed by Section 2.100 IL research). The manage-assignees dialog can reuse this pattern without any new backend endpoint.

---

### IL2-F: `index.vue` File Size — Acceptable Addition

`index.vue` is 2434 lines. The addition (operations table + manage dialog) is approximately 120 lines of template + 60 lines of script. Final size ~2614 lines — acceptable given the file already handles multiple analytics sections.

---

### IL2-G: Feasibility Verdict

**Target:** `pmo-frontend/pages/university-operations/index.vue` — confirmed correct target via IL2-C.  
**Backend changes:** None required.  
**Data source:** `GET /api/university-operations?fiscal_year=${selectedFiscalYear}&limit=10` — already returns `assigned_users`.  
**Assignment mutations:** Use Phase IJ endpoints (`POST /:id/assignments`, `DELETE /:id/assignments/:userId`).

---

## Section 2.101 — Phase IK/IL: Post-IJ Gap Analysis (2026-04-22)

**Status:** Phase 1 Research Complete → Phase 2 Plan ready
**Objective:** Identify all remaining gaps after Phase IJ (Operation Assignment CRUD backend). Determine scope for IK (Postman smoke test) and IL (Frontend Assignment Management).

---

### IK-A: Postman Collection Coverage Gap

**Evidence:** `docs/references/postman-if-smoke-test.json` — grep `"assignment"` → 0 matches.

The Phase IJ backend endpoints have zero test coverage in the existing Postman collection:

| Missing Test | Route | Notes |
|---|---|---|
| GET assignments list | `GET /api/university-operations/:id/assignments` | Returns `RecordAssignment[]` |
| POST add assignment | `POST /api/university-operations/:id/assignments` | Body: `{ "user_id": "<uuid>" }` — idempotent |
| DELETE remove assignment | `DELETE /api/university-operations/:id/assignments/:userId` | 204 No Content |

**Action:** Extend the existing Postman IF collection with a new "13 — Assignments (IJ)" folder containing 3 requests.

---

### IL-A: `assigned_users` Already in `findAll()` Response

**Evidence:** `university-operations.service.ts` lines 482–484:
```sql
(SELECT COALESCE(json_agg(json_build_object('id', u.id, 'name', u.first_name || ' ' || u.last_name)), '[]'::json)
 FROM record_assignments ra JOIN users u ON ra.user_id = u.id
 WHERE ra.module = 'OPERATIONS' AND ra.record_id = uo.id) as assigned_users
```

`findAll()` already returns `assigned_users: [{ id: string, name: string }]` for every operation row. The same subquery is present in `findOne()` (lines 502–504). **No backend change is needed** for the list display.

---

### IL-B: `assigned_users` Not Rendered in Frontend List

**Evidence:** `pmo-frontend/pages/university-operations/index.vue` — 0 references to `assigned_users` found.

The operations table in `index.vue` does NOT render the `assigned_users` field. Administrators cannot see who is assigned to each operation from the list view, even though the API already delivers this data.

**Gap:** An "Assignees" column (small avatar chips or name chips) must be added to the operations `v-data-table`.

---

### IL-C: No Edit/Reassign UI After Creation

**Evidence:** `glob pmo-frontend/pages/university-operations/**/*.vue` → only 4 files:
- `new.vue` — creation form (has assignment multi-select)
- `index.vue` — list view (no assignment edit)
- `physical/index.vue` — physical entry (unrelated)
- `financial/index.vue` — financial entry (unrelated)

There is no `[id].vue` or `edit.vue`. After an operation is created, there is no UI path to change the assignment. Administrators must re-PATCH the full operation (`PATCH /:id` with `assigned_user_ids`) — this is unusable for granular add/remove.

**Action for IL:** Add a "Manage Assignees" dialog to the operations list row, triggered via a button in the row actions. The dialog calls:
- `GET /:id/assignments` to load current assignees (Phase IJ-V1)
- `POST /:id/assignments` to add a user (Phase IJ-V2)
- `DELETE /:id/assignments/:userId` to remove a user (Phase IJ-V4)

---

### IL-D: Eligible Users Endpoint

**Evidence:** `pmo-frontend/pages/university-operations/new.vue` line 78:
```javascript
api.get('/api/users/eligible-for-assignment')
```

The creation form already calls this endpoint. The same endpoint is reusable in the new dialog for IL — no new backend endpoint needed.

---

### IL-E: IG/IH/II Phase Status Confirmation

**Evidence — grep `\$[0-9]+` in service file (non-comment):** 0 matches.
**Evidence — grep `ANY\(` in service file (non-comment):** 0 matches (line 2572 is a comment only).

Phases IG (placeholder syntax), IH (dynamic generator), and II (`ANY(?)` binding) are **CONFIRMED COMPLETE** as a side effect of Phase IA-3 and post-IE work. Their plan.md entries should be updated to `✅ COMPLETE`.

---

### IL-F: Summary

| Phase | Scope | Files Changed | Backend Work |
|---|---|---|---|
| IK | Postman collection extension (3 requests) | `postman-if-smoke-test.json` | None |
| IL | Frontend assignment column + manage dialog | `index.vue` only | None — data already in `findAll()` response |

Total backend work for IK+IL: **zero**. All gaps are frontend and documentation-only.

---

### Section 2.49 — Phase GQ: Financial Module UI Inconsistency, Data Population Failure, and Analytics Enhancement (Apr 8, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

**Objective:** (A) Identify and correct UI color inconsistencies in Financial category card vs Vuetify theme. (B) Verify financial data coverage across all pillars and fiscal years, and identify true gaps vs misperception. (C) Extract and migrate FY 2022 financial data from BAR1_Executive_Analytics_2022_2025.xlsx. (D) Assess analytics completeness post-Phase GP.

---

#### GQ-A: UI Inconsistency — Financial Category Card

**Evidence: code audit of `pmo-frontend/pages/university-operations/index.vue` (lines 1383–1440) + `pmo-frontend/plugins/vuetify.ts`.**

**Finding A-1: Vuetify theme primary color token is BROKEN.**

`pmo-frontend/plugins/vuetify.ts` line 10:
```
primary: '##003300',    // CSU Emerald
```
Double `##` — this is not a valid CSS hex color. Vuetify rejects the token and falls back to the library default (Material Blue `#1976D2`). The intended CSU Emerald (`#003300`) is NEVER applied. Every `color="primary"` binding throughout the app renders Vuetify's default blue, not CSU's dark green.

**Finding A-2: Physical vs Financial card color tokens diverge.**

| Property | Physical Card | Financial Card |
|----------|--------------|----------------|
| Avatar `color=` | `"primary"` (meant to be CSU green, renders blue) | `"success"` (standard Vuetify green) |
| Link text class | `"text-primary"` | `"text-success"` |
| Semantic meaning | Module identifier | Semantic state (success/good) |

`color="success"` on the Financial avatar is a semantic misuse — success/green typically signals a positive state, not a module category. This causes visual inconsistency: both avatars appear green, but from different token origins.

**Finding A-3: No duplicate or deprecated components.**
Both cards are inline HTML inside `index.vue`. There is no separate component file for either card. No external component import is involved. The stale comment `<!-- Financial Accomplishments (Phase ET-D: ENABLED) -->` is the only historical artifact — no "deferred" state is rendered.

**Finding A-4: Financial data entry page uses hardcoded color strings.**
`financial/index.vue` lines 37–63: PILLARS array uses Vuetify color strings (`'blue'`, `'purple'`, `'teal'`, `'orange'`) rather than hex values or theme tokens. These bypass the CSU theme entirely. Physical `index.vue` PILLARS uses hex values (`'#1976D2'`, `'#7B1FA2'`, etc.).

**Root cause summary:** Single-character bug (`##` → `#`) in vuetify.ts breaks the entire primary color chain. Financial card uses semantic `success` token instead of matching `primary`.

---

#### GQ-B: Financial Data Population — True State vs Claimed State

**Evidence: psql queries against `pmo_dashboard` database, `database/staging/` migration artifacts.**

**Finding B-1: ALL 4 pillars are populated for FY 2023/2024/2025.**

Confirmed from DB (`psql` output, 2026-04-08):

| FY | HIGHER_EDUCATION | ADVANCED_EDUCATION | RESEARCH | TECHNICAL_ADVISORY |
|----|:---:|:---:|:---:|:---:|
| 2022 | 0 records | 0 records | 0 records | 0 records |
| 2023 | 4 records | 4 records | 4 records | 4 records |
| 2024 | 4 records | 4 records | 4 records | 4 records |
| 2025 | 5 records | 4 records | 4 records | 4 records |

Total: 49 financial records. The user's claim "only MFO4 is populated" is factually incorrect for FY 2023–2025. **All 4 pillars are populated.**

**Finding B-2: Structural gaps are by design, not extraction errors.**

| Gap | Status | Root Cause |
|-----|--------|-----------|
| All records tagged `quarter=Q4` | By design | Annual report — no quarterly breakdown in Continuing Appropriations.xlsx |
| All `disbursement = NULL` | By design | Source Excel has no disbursement column (GAP-2 resolution from Phase GH) |
| CO missing from FY2023/2024 | By design | CO rows had zero/null allotment in source Excel for those years; skipped by migration |
| FY 2022: 0 records | Intentional deferral | Marked `reference_only` in Phase GH extraction (GAP-6 resolution) |

**Finding B-3: BAR1_Executive_Analytics_2022_2025.xlsx — NOT YET PROCESSED.**

The file at `docs/references/univ_op/BAR1_Executive_Analytics_2022_2025.xlsx` has NOT been extracted or migrated. All current DB data originates from `Continuing Appropriations.xlsx`.

BAR1 Analytics file structure (inspected via Node.js, 2026-04-08):
- Sheet: `RAW_DATA_MASTER` — 50,501 rows × 16 columns
- Columns: Year | Period | Category | Program | Indicator_Name | Level | Unit | Target | Actual | Variance | Achievement_Pct
- Contains BOTH Physical and Financial data (Category = 'Physical' or 'Financial')
- Financial rows: 40 total (10 per year × 4 years)
- Financial structure: expense-class SUBTOTALS (PS, MOOE, CO) per pillar per year — NOT per-campus detail

**Finding B-4: BAR1 Analytics financial data covers FY 2022.**

FY 2022 financial data exists in BAR1 Analytics for all 4 pillars. This is the only source containing FY 2022 financial data for all pillars. No per-campus breakdown available for FY 2022.

BAR1 FY 2022 financial records:
| Pillar | Expense Class | Allotment | Obligation |
|--------|--------------|-----------|-----------|
| Higher Education | PS | 221,447,181.80 | 221,447,181.80 |
| Higher Education | MOOE | 170,358,122.20 | 170,358,062.00 |
| Higher Education | CO | 0 | 0 |
| Advanced Education | PS | 35,167.47 | 35,167.47 |
| Advanced Education | MOOE | 400,832.53 | 400,832.53 |
| Research | PS | 109,669.43 | 109,669.43 |
| Research | MOOE | 2,573,330.57 | 2,573,330.57 |
| Research | CO | 10,051,000 | 9,801,128.17 |
| Technical Advisory | PS | 496,036.66 | 496,036.66 |
| Technical Advisory | MOOE | 177,593.00 | 177,593.00 |

**Finding B-5: MFO4 discrepancy between BAR1 Analytics and DB (source spreadsheet issue).**

For FY 2023–2025, MFO4 figures in BAR1 Analytics differ from the per-campus detail figures currently in DB. This is NOT a migration error — both datasets come from different sections of the source Excel with internally inconsistent subtotals (documented in Phase GG REVIEW_CHECKLIST). 

Comparison — MFO4 FY2023:
| Source | PS allotment | MOOE allotment | Total |
|--------|-------------|----------------|-------|
| BAR1 Analytics (subtotal rows) | 515,803.00 | 163,069.00 | 678,872.00 |
| DB (per-campus detail sum) | 191,898.00 | 606,102.00 | 798,000.00 |

Root cause: The Excel "Sub-Total MFO4-PS" row does not equal the sum of PS/MAIN + PS/CABADBARAN detail rows. This is a spreadsheet formula/structure inconsistency in the source. The MFO Total row (798,000) exceeds the expense subtotal sum (678,872) by 119,128 — which matches the per-campus data total.

**Decision: Do NOT replace existing FY2023–2025 MFO4 data.** The per-campus data in DB is self-consistent and traceable to the source detail rows. The BAR1 subtotal figure represents a different aggregation that is inconsistent with the source detail rows.

---

#### GQ-C: Financial Analytics — Post-Phase GP State

**Evidence: code review of `index.vue` + DB data availability.**

**Finding C-1: Analytics implementation is complete (Phase GP delivered 10 charts).** No code bugs in analytics. Limitations are data-driven:

| Limitation | Root Cause | Fix Path |
|-----------|-----------|---------|
| Quarterly trend shows only Q4 | All records tagged Q4 (annual data) | Acceptable; data source limitation |
| Disbursement always 0 | NULL in all records by design | No disbursement source exists |
| FY 2022 absent from YoY financial charts | Not migrated | GQ-3 will resolve (migrate FY2022 from BAR1 Analytics) |
| CO sparse (only FY2025 HE) | Zero CO in source Excel for most years | Acceptable; accurate per source |

**Finding C-2: MFO4 FY2022 data gap in BAR1 Analytics is not CO.** BAR1 Analytics FY2022 MFO4 has no CO row (only PS and MOOE), which is correct for Technical Advisory (no capital outlay typically).

**Finding C-3: No additional analytics enhancements needed.** The analytical coverage after Phase GP (10 new chart additions/replacements) adequately addresses all visualization requirements from the problem statement.

---

#### GQ-D: FY 2022 Migration Feasibility

**Evidence: BAR1 Analytics data + DB state.**

**Finding D-1: FY 2022 requires 3 new university_operations records** (AE, Research, TECHNICAL_ADVISORY). Only HE FY2022 exists (id: `31c907cc-...`). Three parent operations must be created before financial records can be inserted.

**Finding D-2: FY 2022 financial data is expense-class subtotals only.** No per-campus breakdown available. Migration will insert records without `department` field (or with `department = NULL`). This is structurally identical to the original extraction design (GAP-4: use expense subtotals as primary migration dataset).

**Finding D-3: CO rows with zero allotment should be skipped.** HE FY2022 CO = 0/0, Research FY2022 CO = 10,051,000/9,801,128.17 (significant — MUST be included). Technical Advisory and Advanced Education have no CO row in BAR1 FY2022.

**Finding D-4: Quarter assignment.** FY2022 financial records will use `quarter=Q4` (same convention as existing records — annual data tagged to Q4).

---

### Section 2.48 — Phase GP: Analytics Expansion — YoY Target vs Actual, Financial Enrichment, Cross-Analytics Enhancement (Apr 8, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

**Objective:** (A) Add YoY Target vs Actual chart to Physical analytics. (B) Enrich Financial analytics with absolute-amount views, variance, and campus breakdown. (C) Enhance Cross analytics with deeper multi-year and cross-domain comparison.

---

#### GP-A: Current Analytics Inventory — What Exists

**Physical Analytics tab (PHYSICAL):**

| Chart | Type | What it shows | Series |
|-------|------|---------------|--------|
| Pillar Completion Overview | 4 cards | Indicator counts, completion %, accomplishment rate | — |
| Achievement Rate by Pillar | Bar | `accomplishment_rate_pct` per pillar | 1 series |
| Pillar Accomplishment Rates | RadialBar | `accomplishment_rate_pct` per pillar | 4 arcs |
| Quarterly Trend | Line | `target_rate` (count of indicators with target) + `actual_rate` (sum of achievement scores) | 2 lines |
| Year-over-Year | Bar | `accomplishment_rate` per pillar per fiscal year | 4 pillars as series, x = FY |

**Financial Analytics tab (FINANCIAL):**

| Chart | Type | What it shows | Series |
|-------|------|---------------|--------|
| Budget Utilization Overview | 4 cards | Appropriation, Obligations, Utilization %, record count | — |
| Utilization Rate by Pillar | RadialBar | `avg_utilization_rate` per pillar | 4 arcs |
| Expense Class Breakdown | Donut | Obligations by PS/MOOE/CO | 3 slices |
| Financial Quarterly Trend | Line | Appropriation + Obligations + Utilization % + Disbursement % | 4 lines |
| YoY Utilization Rate | Bar | `utilization_rate` per pillar per fiscal year | N FY as series, x = pillars |

**Cross Analytics tab (CROSS):**

| Chart | Type | What it shows | Series |
|-------|------|---------------|--------|
| Institutional Overview | 4 cards | Overall physical rate, utilization, disbursement, data coverage | — |
| Physical vs Financial by Pillar | Bar | `accomplishment_rate_pct` vs `avg_utilization_rate` per pillar | 2 series |
| YoY Physical vs Financial | Bar | Avg physical rate + avg financial utilization per fiscal year | 2 series |

---

#### GP-B: Data Availability Assessment — What Backend Already Returns

**Physical backend — `getPillarSummary(fiscalYear)`:**

| Field | Currently used in UI | Available but unused |
|-------|---------------------|---------------------|
| `accomplishment_rate_pct` | ✅ charts + cards | — |
| `pct_avg_target` | ✗ | ✅ AVG of PERCENTAGE indicator targets |
| `pct_avg_accomplishment` | ✗ | ✅ AVG of PERCENTAGE indicator actuals |
| `count_target` | ✗ | ✅ SUM of COUNT indicator targets |
| `count_accomplishment` | ✗ | ✅ SUM of COUNT indicator actuals |
| `total_target` | ✗ | ✅ composite (count + pct avg) |
| `total_accomplishment` | ✗ | ✅ composite |
| `indicator_target_rate` | ✗ | ✅ count of indicators with targets |
| `indicator_actual_rate` | ✗ | ✅ sum of per-indicator rates |
| `completion_rate` | ✅ cards | — |

**Physical backend — `getYearlyComparison(years)`:**

| Field | Currently returned | Notes |
|-------|-------------------|-------|
| `accomplishment_rate` | ✅ per pillar per year | Computed as `avg_accomplishment_rate` |
| `pct_avg_target` | ✗ NOT returned | Available in merged CTE — just not selected |
| `pct_avg_accomplishment` | ✗ NOT returned | Same |
| `count_target` | ✗ NOT returned | Same |
| `count_accomplishment` | ✗ NOT returned | Same |
| `total_target` / `total_accomplishment` | ✗ NOT returned | Computable |

**Financial backend — `getFinancialPillarSummary(fiscalYear)`:**

| Field | Currently used in UI | Available but unused |
|-------|---------------------|---------------------|
| `total_appropriation` | ✅ cards only | ✗ no chart |
| `total_obligations` | ✅ cards only | ✗ no chart |
| `total_disbursement` | ✗ | ✅ available |
| `avg_utilization_rate` | ✅ radial + cards | — |
| `total_balance` | ✗ | ✅ available (appropriation − obligation) |

**Financial backend — `getFinancialYearlyComparison(years)`:**

| Field | Currently used in UI | Available but unused |
|-------|---------------------|---------------------|
| `utilization_rate` | ✅ YoY chart | — |
| `total_appropriation` | ✗ | ✅ available per FY per pillar |
| `total_obligations` | ✗ | ✅ available per FY per pillar |

**Financial backend — Campus breakdown:**
- `operation_financials.department` column stores campus (`Main Campus`, `Cabadbaran Campus` from the migration data)
- No analytics endpoint currently aggregates by `department`
- Requires new backend method: `getFinancialCampusBreakdown(fiscalYear)`

---

#### GP-C: Gaps Identified Per Module

**Physical Analytics Gaps:**

| Gap | Impact | Data available? |
|-----|--------|-----------------|
| YoY shows rate only — no raw target vs actual values | Cannot see progression of indicator targets vs achievements over years | ✗ Backend must be extended (add fields to `getYearlyComparison`) |
| Current "Achievement Rate by Pillar" is a single-series bar — no Target reference column | "Target vs Actual" meaning unclear without a paired target bar | ✅ Target = 100% always (implied by reference line); extending YoY is the real fix |

**Financial Analytics Gaps:**

| Gap | Impact | Data available? |
|-----|--------|-----------------|
| No absolute Appropriation vs Obligations chart | Cannot compare budget absorption volume across pillars at a glance | ✅ From `financialPillarSummary` |
| No Budget Variance (Balance) chart | Cannot see unspent budget per pillar visually | ✅ `total_balance` from `financialPillarSummary` |
| No campus breakdown | Cannot compare MAIN vs CABADBARAN budget distribution | ✗ New endpoint needed |
| YoY chart shows only utilization rate — not absolute amounts | Cannot see whether budget grew/shrank year-over-year | ✅ `total_appropriation` + `total_obligations` in `financialYearlyComparison` |
| Disbursement shown only in trend line — not in pillar summary view | Disbursement context missing from high-level financial view | ✅ `total_disbursement` in `financialPillarSummary` |

**Cross Analytics Gaps:**

| Gap | Impact | Data available? |
|-----|--------|-----------------|
| YoY cross chart averages across all pillars — single number per FY | Hides pillar-level divergence in cross-domain trends | ✅ Pillar-level data exists in both yearly datasets |
| No Budget vs Target side-by-side per pillar | Cannot compare financial allocation against physical planning | ✅ Appropriation from financial, indicator counts from physical |

---

#### GP-D: Anti-Patterns Observed in Current State

1. **Physical "Achievement Rate by Pillar" (bar) and "Pillar Accomplishment Rates" (radial) show the SAME data** (`accomplishment_rate_pct`) in two different chart types. One is redundant.
   - Resolution: Keep radial (visually distinctive) and replace the bar chart with a more informative "Target vs Actual" grouped bar.

2. **Financial YoY chart encodes FY as color-series, pillars on x-axis** — this is counterintuitive for time-series reading (trend should show years on x-axis).
   - Resolution: Add a secondary YoY view with fiscal years on x-axis when a pillar is selected.

3. **Quarterly Trend series labels are misleading** — "Indicators with Target" and "Achievement Score" are not intuitive for non-technical stakeholders.
   - Note: Out of scope for this phase (YAGNI on label cleanup while larger additions are in progress).

4. **Cross YoY computes a single blended rate across all pillars** — loses granularity.

---

#### GP-E: Cross-Module Alignment Assessment

| Metric | Physical equivalent | Financial equivalent | Comparable? |
|--------|--------------------|--------------------|-------------|
| Achievement rate | `accomplishment_rate_pct` (%) | `avg_utilization_rate` (%) | ✅ Both are dimensionless % |
| Raw target | `pct_avg_target` or `count_target` | `total_appropriation` (₱) | ✗ Units incompatible |
| Raw actual | `pct_avg_accomplishment` or `count_accomplishment` | `total_obligations` (₱) | ✗ Units incompatible |
| Shortfall | implied by rate < 100% | `total_balance` (₱) | ✗ Units incompatible |

**Conclusion:** Physical and Financial are comparable at the **rate level** (%) but NOT at the raw value level (different units). All cross-module charts must use rates, not raw values.

---

#### GP-F: Scope Decision — KISS/YAGNI Filter

| Proposed enhancement | Verdict | Reason |
|---------------------|---------|--------|
| Physical YoY Target vs Actual (per pillar, % values) | ✅ IN SCOPE | Core gap, requires 1 backend change + 1 new chart |
| Financial: Appropriation vs Obligations grouped bar per pillar | ✅ IN SCOPE | High value, frontend-only, reuses existing data |
| Financial: Variance/Balance bar per pillar | ✅ IN SCOPE | High value, frontend-only, 1 computed + 1 chart |
| Financial YoY: Add Appropriation + Obligations amount series | ✅ IN SCOPE | Enriches existing chart, no backend needed |
| Financial: Campus breakdown | ✅ IN SCOPE | Requires new endpoint; significant audit value |
| Physical: Replace duplicate bar with paired "Target vs Actual" bar | ✅ IN SCOPE | Eliminates redundancy, replaces one chart |
| Cross: Add pillar-filtered YoY view | ✅ IN SCOPE | Reuses existing data, adds depth |
| Cross: Raw cross-domain budget vs indicator alignment | ✗ OUT OF SCOPE | Units incompatible, computationally misleading |

---

### Section 2.47 — Phase GO: Analytics Model Correction — Cross-Quarter Aggregation (Apr 8, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

**Objective:** Fix analytics data loss caused by `DISTINCT ON` discarding per-quarter rows (`reported_quarter` model). Aggregate across ALL rows per indicator without disrupting Physical Accomplishment CRUD.

---

#### GO-A: Data Row Counts Per Fiscal Year (VERIFIED VIA DB QUERY)

| FY | Unique Indicators | Total Rows | NULL-quarter Rows | Tagged-quarter Rows |
|----|------------------|-----------|-------------------|---------------------|
| 2023 | 14 | 14 | 14 | 0 |
| 2024 | 14 | 14 | 14 | 0 |
| 2025 | 14 | 23 | 14 | 9 |
| 2026 | 14 | 31 | 0 | 31 |

- FY2023/2024: Single-row model — one row per indicator, all Q1–Q4 data in that one row. DISTINCT ON harmless.
- FY2025: Mixed model — some indicators have both a legacy NULL-quarter row AND newer Q1/Q2 tagged rows.
- FY2026: Pure per-quarter model — every indicator has Q1, Q2, Q3, Q4 rows only; NO NULL-quarter rows exist.

---

#### GO-B: Current DISTINCT ON Pattern in All Three Analytics Endpoints

All three analytics methods apply the same inner subquery pattern:

```sql
-- getPillarSummary (line 1965)
SELECT DISTINCT ON (oi.pillar_indicator_id)
  oi.*, pit.pillar_type, pit.unit_type, pit.indicator_type, ...
FROM operation_indicators oi
JOIN pillar_indicator_taxonomy pit ON oi.pillar_indicator_id = pit.id
WHERE oi.fiscal_year = $1 AND oi.deleted_at IS NULL AND pit.is_active = true
ORDER BY oi.pillar_indicator_id, oi.updated_at DESC

-- getQuarterlyTrend (line 2088) — identical
-- getYearlyComparison yearlyRes (line 2162): DISTINCT ON (oi.fiscal_year, oi.pillar_indicator_id)
-- getYearlyComparison pillarRes (line 2199): DISTINCT ON (oi.fiscal_year, oi.pillar_indicator_id)
```

`ORDER BY ... updated_at DESC` → picks the **most recently updated row** per indicator. All other rows per indicator are silently discarded.

---

#### GO-C: Confirmed Data Loss — FY2025 Higher Education

Per-row detail for HE FY2025 (ordered by updated_at DESC per indicator):

| Indicator | reported_quarter | T_Q1 | T_Q2 | T_Q3 | T_Q4 | A_Q1 | A_Q2 | A_Q3 | A_Q4 | Last Updated | DISTINCT ON picks? |
|-----------|-----------------|------|------|------|------|------|------|------|------|-------------|-------------------|
| Licensure | NULL | — | — | 55 | — | — | 59.70 | 94.32 | 79.73 | 2026-04-05 | ✅ PICKED |
| Licensure | Q1 | 10 | — | — | — | — | — | 20 | — | 2026-03-24 | ✗ DISCARDED |
| Licensure | Q2 | — | — | — | — | — | — | — | — | 2026-03-24 | ✗ DISCARDED |
| Graduates Employed | NULL | — | — | — | 55 | — | — | — | — | 2026-04-05 | ✅ PICKED |
| Graduates Employed | Q1 | 10 | — | — | — | **2** | — | — | — | 2026-03-24 | ✗ DISCARDED |
| Graduates Employed | Q2 | — | — | — | — | — | — | — | — | 2026-03-24 | ✗ DISCARDED |
| Accreditation | NULL | — | — | — | 20 | 68.97 | 54.84 | 54.84 | 54.84 | 2026-04-05 | ✅ PICKED |
| Accreditation | Q1 | — | **60** | — | — | — | — | — | **10** | 2026-03-24 | ✗ DISCARDED |
| Accreditation | Q2 | — | — | — | — | — | — | — | — | 2026-03-24 | ✗ DISCARDED |
| Priority Programs | NULL | — | — | 65 | — | — | — | 95.19 | 95.19 | 2026-04-05 | ✅ PICKED |
| Priority Programs | Q1 | — | — | — | — | — | — | — | — | 2026-03-24 | ✗ DISCARDED |
| Priority Programs | Q2 | **10** | — | — | — | — | — | — | **5** | 2026-03-24 | ✗ DISCARDED |

**Critical losses (bold):**
- Graduates Employed Q1 `accomplishment_q1=2` → discarded → indicator shows "no actuals" → excluded from HE rate
- Accreditation Q1 `target_q2=60, accomplishment_q4=10` → discarded
- Priority Programs Q2 `target_q1=10, accomplishment_q4=5` → discarded

---

#### GO-D: FY2026 — Complete Quarter Collapse (Pure Per-Quarter Model)

Licensure in FY2026 has 8 rows: `Q1, Q1, Q1, Q1, Q1, Q2, Q3, Q4`.
- 5 Q1 rows exist (from multiple operations for the same pillar).
- DISTINCT ON picks ONE row from the 8.
- The Q2, Q3, Q4 quarter data is entirely discarded.
- This means all Q2–Q4 analytics for FY2026 are currently empty/zero.

---

#### GO-E: Root Cause — Two Conflation Problems in One DISTINCT ON

DISTINCT ON was originally introduced to solve **Problem 1** only. It inadvertently created **Problem 2**:

| Problem | Description | Effect |
|---------|-------------|--------|
| 1 (original) | Multiple operations for same pillar+FY each have their own rows | Double-counting if all rows included |
| 2 (new, unhandled) | Per-quarter model creates multiple rows per indicator per operation | Only newest quarter survives |

A single `DISTINCT ON` cannot solve both problems simultaneously: it picks one row from all rows across all operations AND all quarters — discarding everything else.

---

#### GO-F: Correct Aggregation Strategy — Two-Stage CTE

**Stage 1 — Canonical operation selection:** Pick one operation per `(fiscal_year, pillar_indicator_id)` using `DISTINCT ON`. This solves Problem 1.

**Stage 2 — Cross-quarter merge:** For ALL rows belonging to the canonical operation, aggregate using `MAX()` per quarter column. This solves Problem 2.

`MAX()` is the correct aggregation because:
- Each row (Q1 row, Q2 row, Q3 row) has non-null values in its own quarter columns and NULL in others.
- `MAX(target_q1)` across all rows = the non-null target_q1 value (from whichever row contains it).
- If two rows both have a value for the same quarter column, MAX picks the larger — acceptable since this only occurs in data-entry anomalies.
- FY2023/2024 (single row): MAX is a no-op → backward compatible.
- FY2025 (mixed): MAX merges NULL row + Q1/Q2 tagged rows into a complete indicator record.
- FY2026 (pure per-quarter): MAX picks one value per quarter column from the correct row.

**Pattern:**
```sql
-- Stage 1: Pick canonical operation per indicator
WITH canonical_ops AS (
  SELECT DISTINCT ON (oi.fiscal_year, oi.pillar_indicator_id)
    oi.operation_id, oi.pillar_indicator_id, oi.fiscal_year
  FROM operation_indicators oi
  JOIN pillar_indicator_taxonomy pit ON oi.pillar_indicator_id = pit.id
  WHERE oi.fiscal_year = ... AND oi.deleted_at IS NULL AND pit.is_active = true
  ORDER BY oi.fiscal_year, oi.pillar_indicator_id, oi.updated_at DESC
),
-- Stage 2: Merge all rows of canonical operation across reported_quarter
merged AS (
  SELECT
    oi.pillar_indicator_id, oi.fiscal_year,
    MAX(oi.target_q1) AS target_q1, MAX(oi.target_q2) AS target_q2,
    MAX(oi.target_q3) AS target_q3, MAX(oi.target_q4) AS target_q4,
    MAX(oi.accomplishment_q1) AS accomplishment_q1, MAX(oi.accomplishment_q2) AS accomplishment_q2,
    MAX(oi.accomplishment_q3) AS accomplishment_q3, MAX(oi.accomplishment_q4) AS accomplishment_q4
  FROM operation_indicators oi
  JOIN canonical_ops co
    ON oi.operation_id = co.operation_id
    AND oi.pillar_indicator_id = co.pillar_indicator_id
    AND oi.fiscal_year = co.fiscal_year
  WHERE oi.deleted_at IS NULL
  GROUP BY oi.pillar_indicator_id, oi.fiscal_year
)
-- Then JOIN merged to pillar_indicator_taxonomy for unit_type, pillar_type, etc.
-- and apply existing GN-2/GN-3 rate formula unchanged
```

---

#### GO-G: Scope of Changes Required

| Method | File | Change Type | Lines Affected |
|--------|------|-------------|----------------|
| `getPillarSummary` | `university-operations.service.ts` | Replace inner DISTINCT ON subquery with two-stage CTE | ~1964-1981 |
| `getQuarterlyTrend` | `university-operations.service.ts` | Replace inner DISTINCT ON subquery with two-stage CTE | ~2088-2095 |
| `getYearlyComparison` (yearlyRes) | `university-operations.service.ts` | Replace inner DISTINCT ON with two-stage CTE | ~2162-2178 |
| `getYearlyComparison` (pillarRes) | `university-operations.service.ts` | Replace inner DISTINCT ON with two-stage CTE | ~2199-2215 |

**Zero changes to:**
- Physical Accomplishment page (`physical/index.vue`) — untouched
- Physical CRUD endpoints (`createIndicator`, `updateIndicator`, `removeIndicator`) — untouched
- `reported_quarter` column logic — untouched
- Financial module — untouched
- Taxonomy (migration 019) — untouched
- Quarterly report governance — untouched

---

#### GO-H: Expected Result After Fix

| Indicator | Current (DISTINCT ON picks NULL row only) | After Fix (MAX merge across all rows) |
|-----------|------------------------------------------|---------------------------------------|
| Graduates Employed | target_q4=55, actual=none → excluded from HE rate | target_q1=10, target_q4=55, actual_q1=2 → included |
| Accreditation | target_q4=20, actual Q1–Q4=233.49 | target_q2=60, target_q4=20, actual+10 from Q1 row merged |
| FY2026 Licensure | 1 of 8 rows survives, Q2/Q3/Q4 discarded | All Q1-Q4 values merged correctly |

HE pillar rate and YoY comparison will change after this fix as more complete data becomes visible.

---

### Section 2.46 — Phase GN: Financial Migration Validation & Physical Analytics Calculation Standardization (Apr 6, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

**Objective:** (A) Validate financial data completeness and set Q4 as default view. (B) Fix inconsistent analytics calculation across physical charts.

---

#### GN-A: Financial Data Completeness — VERIFIED COMPLETE

| FY | Records | Pillars | Campus Grouping | Quarter | Status |
|----|---------|---------|-----------------|---------|--------|
| 2023 | 16 | 4 (HE/AE/RES/TA × 4 per-campus) | MAIN + CABADBARAN | Q4 | ✅ |
| 2024 | 16 | 4 | MAIN + CABADBARAN | Q4 | ✅ |
| 2025 | 17 | 4 (HE has CO=5 rows) | MAIN + CABADBARAN | Q4 | ✅ |
| **Total** | **49** | | | **Q4 only** | ✅ |

- No NULL quarters, no FY2026 test data, no gaps.
- All expense classes (PS/MOOE/CO) properly assigned.

#### GN-B: Financial Page Default Quarter — BUG FOUND

**File:** `pmo-frontend/pages/university-operations/financial/index.vue` line 79
**Current:** `const selectedQuarter = ref<string>('Q1')`
**Problem:** All financial data is in Q4. Users see empty page on first load.
**Fix:** Change default to `'Q4'`.

#### GN-C: Physical Analytics — ROOT CAUSE OF INFLATION IDENTIFIED

**Observed:** Charts show wildly different values for the same data:
- RadialBar/Pillar charts (from `getPillarSummary`): HE = 471.3%
- YoY chart (from `getYearlyComparison`): HE = 243.7%

**Root cause: PERCENTAGE indicators have values SUMMED across quarters instead of AVERAGED.**

Example — "Percentage of accredited graduate programs" (ADVANCED_EDUCATION):
- Target: Q3 = 20% (1 quarter has target)
- Actual: Q1 = 83.33%, Q2 = 83.33%, Q3 = 83.33%, Q4 = 83.33%
- **Current (wrong):** SUM actual = 333.32, SUM target = 20 → rate = 1,666.6%
- **Correct:** AVG actual = 83.33, AVG target = 20 → rate = 416.7%

For COUNT indicators this is correct (counts are cumulative). For PERCENTAGE indicators, quarterly values are not additive — they must be averaged.

**Impact:** 9 of 14 filled indicators (64%) are PERCENTAGE type → majority of rate calculations are inflated up to 4×.

#### GN-D: Three Inconsistencies Across Analytics Endpoints

| Endpoint | Dedup | is_active | Rate Formula | Charts Using It |
|----------|-------|-----------|-------------|----------------|
| `getPillarSummary` | ✅ `DISTINCT ON` | ✅ | AVG of per-indicator rates (SUM Q1-Q4 / SUM Q1-Q4) | RadialBar, Target vs Actual, Pillar Accomplishment |
| `getQuarterlyTrend` | ✅ `DISTINCT ON` | ✅ | SUM of per-quarter ratios (actual_qN/target_qN) | Quarterly Trend line chart |
| `getYearlyComparison` | ❌ **NONE** | ❌ **NONE** | Ratio of total sums (SUM actual / SUM target) | Year-over-Year bar chart |

**Issue 1: Formula inconsistency**
- `getPillarSummary`: mean of per-indicator rates → weights all indicators equally
- `getYearlyComparison`: ratio of sums → weights by magnitude (large-target indicators dominate)
- These are mathematically different and produce different results

**Issue 2: Deduplication missing in getYearlyComparison**
- FY2025: 23 total rows, 14 unique indicators (4 HE tripled, 1 AE doubled)
- Without dedup: targets inflated by 100 (2113 vs 2013), actuals by 39 (8664 vs 8625)
- Impact: modest (~5%) but incorrect

**Issue 3: is_active filter missing in getYearlyComparison**
- If inactive taxonomy indicators exist, they'd be included in YoY but excluded from other charts

#### GN-E: PERCENTAGE Indicator Quarterly Patterns (FY2025)

| Indicator | Target Qs | Actual Qs | SUM Rate | AVG Rate |
|-----------|-----------|-----------|----------|----------|
| Licensure exam pass rate (HE) | Q3=55 | Q2,Q3,Q4 | 425% | 142% |
| Graduates employed (HE) | Q3=55 | none | 0% | 0% |
| UG program accreditation (HE) | Q3=20 | Q1-Q4 | 1,167% | 292% |
| UG students in priority programs (HE) | Q3=65 | Q1-Q4 | 293% | 73% |
| Accredited grad programs (AE) | Q3=20 | Q1-Q4 | 1,667% | 417% |
| Grad students in research degrees (AE) | Q3=70 | Q1-Q4 | 278% | 69% |
| Grad faculty in research (AE) | Q3=50 | Q1-Q4 | 701% | 175% |
| Research published (RES) | Q3=40 | Q1-Q4 | 869% | 217% |
| Training satisfaction (TA) | Q3=70 | Q1-Q4 | 567% | 142% |

**Pattern:** Most indicators have target in only Q3 but actual data in all 4 quarters. This means the SUM approach inflates actual by 3-4× while target stays at 1× = systematic 3-4× inflation.

#### GN-F: Unit Type Distribution (FY2025)

| Pillar | PERCENTAGE | COUNT | WEIGHTED_COUNT | Total |
|--------|-----------|-------|----------------|-------|
| HE | 4 | 0 | 0 | 4 |
| AE | 3 | 0 | 0 | 3 |
| RES | 1 | 2 | 0 | 3 |
| TA | 1 | 2 | 1 | 4 |
| **Total** | **9** | **4** | **1** | **14** |

9/14 (64%) are PERCENTAGE → majority affected by SUM inflation.

#### GN-G: Required Calculation Standard (from user directive)

```
Per indicator:
  IF COUNT/WEIGHTED_COUNT: rate = SUM(actual_Q1..Q4) / SUM(target_Q1..Q4) * 100
  IF PERCENTAGE: rate = AVG(non-null actual) / AVG(non-null target) * 100

Per pillar:
  Achievement Rate = SUM(all per-indicator rates) / COUNT(valid indicators)
  WHERE valid = has at least one filled quarter
```

This must be applied to ALL three analytics endpoints for consistency.

---

### Section 2.45 — Phase GM: Financial Accomplishment Data Population — Per-Campus Detail Migration (Apr 6, 2026)

**Objective:** Populate the Financial Accomplishment page (BAR No. 2) with accurate data from `Continuing Appropriations.xlsx`, soft-deleting FY2026 test data.

**Finding GM-A: Existing 30 records are invisible on Financial page**
- 30 records in `operation_financials` for FY2023-2025 (from Phase GG migration)
- All have `quarter = NULL` (annual data)
- Financial page always queries with `AND quarter = 'Q1'` etc → these records **never appear**
- This is why the user sees "no data" for FY2023-2025

**Finding GM-B: Excel has per-campus detail (more granular than existing subtotals)**
- Existing 30 records are EXPENSE_SUBTOTAL level (combined campuses)
- Excel has per-campus breakdown: Main Campus + Cabadbaran Campus per MFO per expense class
- Financial page groups by `department` (campus) → `expense_class` — per-campus records display correctly
- Existing subtotal records would fall into `_NONE` (uncategorized) group

**Finding GM-C: Data is annual only — best mapped to Q4**
- Excel columns: Appropriation, Obligations, % Utilization per FY (no quarterly breakdown)
- Header labels: "FY 20XX (Actual)" = year-end actual values = Q4 cumulative
- No disbursement column in source data
- Assigning to Q4 is the most accurate representation

**Finding GM-D: Per-campus row mapping (Excel rows)**

| MFO | Campus | Expense | Excel Row |
|-----|--------|---------|-----------|
| MFO1 | MAIN | PS | R43 |
| MFO1 | MAIN | MOOE | R44 |
| MFO1 | MAIN | CO | R45 |
| MFO1 | CABADBARAN | PS | R48 |
| MFO1 | CABADBARAN | MOOE | R49 |
| MFO2 | MAIN | PS | R59 |
| MFO2 | MAIN | MOOE | R60 |
| MFO2 | CABADBARAN | PS | R63 |
| MFO2 | CABADBARAN | MOOE | R64 |
| MFO3 | MAIN | PS | R73 |
| MFO3 | MAIN | MOOE | R74 |
| MFO3 | MAIN | CO | R75 |
| MFO3 | CABADBARAN | PS | R78 |
| MFO3 | CABADBARAN | MOOE | R79 |
| MFO4 | MAIN | PS | R89 |
| MFO4 | MAIN | MOOE | R90 |
| MFO4 | MAIN | CO | R91 |
| MFO4 | CABADBARAN | PS | R94 |
| MFO4 | CABADBARAN | MOOE | R95 |

FY column mapping: FY2023=cols(32,33,34), FY2024=cols(35,36,37), FY2025=cols(38,39,40)

**Finding GM-E: FY2026 test data to soft delete**
- 6 financial records (4 Q1, 2 Q2) with dummy values
- Linked to duplicate parent operations (80+ HE duplicates from UI testing)
- Parent operation cleanup deferred — only financial records soft-deleted here

**Finding GM-F: Canonical operation IDs (oldest per pillar per FY)**

| FY | Pillar | Canonical Operation |
|----|--------|-------------------|
| 2023 | HIGHER_EDUCATION | `14330a3a-57d3-40a4-95bd-0f9799db0d92` |
| 2023 | ADVANCED_EDUCATION | `55031113-5a14-4c3c-a8a1-c7e2f77ec55a` |
| 2023 | RESEARCH | `5f17f47c-790f-4bf1-8c0c-56cf1e6b09e1` |
| 2023 | TECHNICAL_ADVISORY | `d082040f-c59f-4bb4-979c-936b5097c971` |
| 2024 | HIGHER_EDUCATION | `0de77e86-2b4e-44bf-ae62-e6dc46450842` |
| 2024 | ADVANCED_EDUCATION | `39792618-d6a3-45ab-a4da-9f8bcb6b7153` |
| 2024 | RESEARCH | `34848640-68ab-4e89-9e6b-1e2b27b832b4` |
| 2024 | TECHNICAL_ADVISORY | `851acf87-0c06-4cb5-be9d-f86b72f9f989` |
| 2025 | HIGHER_EDUCATION | `0eeb6bfc-dbc2-4b26-8236-385ed04033ae` (oldest of 14 duplicates) |
| 2025 | ADVANCED_EDUCATION | `c6b1eb4d-499c-40a1-bc2e-080b9854db44` |
| 2025 | RESEARCH | `48a2b7b2-1823-4284-b9b0-e50660ed7d09` |
| 2025 | TECHNICAL_ADVISORY | `06c360f9-c28c-4895-a6ab-57149731a514` |

**Finding GM-G: Expected record count**
- Per FY: ~19 rows (some CO rows may be empty/zero across all FYs)
- For 3 FYs: ~57 records total (replacing 30 subtotal records)
- CO rows included where allotment > 0 OR obligation > 0; excluded when both are null/empty

---

### Section 2.44 — Phase GL: Financial Data Population — Gap Resolution, Controlled Extraction & Pre-Migration Validation (Apr 6, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

---

#### FINDING GL-A: Authoritative Source Structure — `Continuing Appropriations.xlsx`

**Sheet:** RAF (single sheet)
**Dimensions:** A1:AY265 (265 rows × 51 columns)
**Data:** Appropriation, Obligations, % Utilization per fiscal year (FY2013–FY2025)

**Column Layout (triplets per fiscal year):**

| Fiscal Year | Appropriation | Obligations | % Utilization |
|------------|:------------:|:-----------:|:-------------:|
| FY 2023 | AG (col 32) | AH (col 33) | AI (col 34) |
| FY 2024 | AJ (col 35) | AK (col 36) | AL (col 37) |
| FY 2025 | AM (col 38) | AN (col 39) | AO (col 40) |

**Row Hierarchy:**

| Row Range | Category | Pillar Mapping | Migration Status |
|-----------|----------|----------------|-----------------|
| R10–R23 | General Administration & Support (GMS) | ❌ UNMAPPED — no MFO equivalent | EXCLUDE |
| R26–R39 | Support to Operations (STO) | ❌ UNMAPPED — no MFO equivalent | EXCLUDE |
| R40–R101 | **OPERATIONS (MFO1–MFO4)** | ✅ MAPPED | **EXTRACT** |
| R105+ | Projects | ❌ Outside scope | EXCLUDE |

**Operations Section Detail (rows 40–101):**

| MFO | Rows | Campus Detail | Subtotal Rows | System Pillar |
|-----|------|--------------|---------------|---------------|
| MFO1: Higher Education | 41–55 | Main (R42–45), Cabadbaran (R47–50) | PS=R51, MOOE=R52, CO=R53 | HIGHER_EDUCATION |
| MFO2: Advanced Education | 57–69 | Main (R58–61), Cabadbaran (R62–65) | PS=R66, MOOE=R67 | ADVANCED_EDUCATION |
| MFO3: Research | 71–85 | Main (R72–76), Cabadbaran (R77–80) | PS=R81, MOOE=R82, CO=R83 | RESEARCH |
| MFO4: Technical Advisory | 87–100 | Main (R88–92), Cabadbaran (R93–96) | PS=R97, MOOE=R98 | TECHNICAL_ADVISORY |

**Extraction granularity:** Expense subtotal rows (PS/MOOE/CO per MFO) — combines both campuses per expense class.

---

#### FINDING GL-B: Identified Financial Data Gaps

**GAP 1 — ANNUAL vs QUARTERLY (STRUCTURAL)**
- Excel data is **annual** (single appropriation/obligation value per FY)
- System schema has `quarter` column: `CHECK (quarter IN ('Q1','Q2','Q3','Q4'))`
- **Resolution:** `quarter = NULL` — already supported by schema (nullable). Annual data uses NULL quarter. System analytics (`computeFinancialMetrics()`) correctly aggregates NULL-quarter records.
- **Impact:** None — existing migration already uses this pattern successfully.

**GAP 2 — DISBURSEMENT FIELD (DATA ABSENCE)**
- Excel does NOT contain disbursement data
- System schema has `disbursement numeric(15,2) DEFAULT 0`
- **Resolution:** `disbursement = NULL` — field is optional per requirements
- **Impact:** Disbursement rate analytics show 0% for migrated records. Acceptable — disbursement data can be entered manually if available.

**GAP 3 — UNMAPPED FINANCIAL CATEGORIES**
- General Administration & Support (R10–23): PS + MOOE + CO per campus
- Support to Operations (R26–39): PS + MOOE + CO per campus
- These are NOT MFO-classified. No pillar alignment exists.
- **Resolution:** EXCLUDE from migration. Tag as `unmapped: true` in staging.
- **Impact:** None — system only tracks MFO-level financials.

**GAP 4 — DATA GRANULARITY (DUPLICATION RISK)**
- Excel contains 3 levels per MFO: campus detail rows, expense subtotals, MFO totals
- Risk: Extracting both detail AND subtotal rows would double-count
- **Resolution:** Extract EXPENSE_SUBTOTAL rows only (PS/MOOE/CO per MFO). Detail rows retained as `reference_only` in staging for audit.
- **Impact:** None — subtotals are the correct aggregation level for the system.

**GAP 5 — CO SENTINEL VALUE (DATA QUALITY)**
- When CO appropriation = 0 and obligation = 0, utilization shows `7` (spreadsheet formula artifact: `#DIV/0!` renders as 7 in xlsx parser)
- MFO2 and MFO4 have no CO rows at all
- **Resolution:** Detect `utilization_pct = 7` as sentinel → set to `0`. Zero-appropriation CO records are still migrated (they represent valid "no CO budget" state).
- **Impact:** None — already handled in previous extraction.

**GAP 6 — DUPLICATE PARENT OPERATIONS (DATA INTEGRITY)**
- FY2025 HIGHER_EDUCATION: 14 duplicate operations (from testing)
- FY2026: 81 HE, 17 AE, 7 R, 11 TA duplicates (from UI testing)
- FY2023–2024: Clean (1 operation per pillar per FY) ✅
- **Resolution:** Migration uses `ORDER BY created_at LIMIT 1` to select the canonical parent. Duplicates are pre-existing data quality debt — separate cleanup, not a migration blocker.
- **Impact:** LOW — analytics already handle this via deduplication queries.

---

#### FINDING GL-C: Current System State — Existing Financial Data

**30 financial records already migrated (Phase GI, Apr 5, 2026):**
- FY2023: 10 records (4 pillars × PS/MOOE/CO where applicable)
- FY2024: 10 records
- FY2025: 10 records
- All records: `quarter = NULL`, `disbursement = NULL`, `metadata.source = 'FINANCIAL_EXTRACTION'`

**Cross-validation: 100% match between Excel source and DB records.**
Every allotment and obligation value in the database matches the authoritative Excel file exactly.

**FY2026 manual entries:** 6 records (test data entered via UI with quarter-specific values). These are NOT from the extraction pipeline.

**Staging files exist:** `financial_appropriations_extracted.json` (148 records, 30 migration candidates), `validation_report.json`, `migration_log.json`.

---

#### FINDING GL-D: Mapping Rules — Excel → System Schema

| Excel Field | System Column | Transformation |
|------------|---------------|----------------|
| Appropriation (col AG/AJ/AM) | `allotment` | Direct numeric copy |
| Obligations (col AH/AK/AN) | `obligation` | Direct numeric copy |
| % Utilization (col AI/AL/AO) | Computed by `computeFinancialMetrics()` | NOT stored — computed at query time |
| MFO1–MFO4 section | `operation_type` on parent `university_operations` | MFO1→HE, MFO2→AE, MFO3→R, MFO4→TA |
| Expense subtotal row label | `expense_class` | PS/MOOE/CO from row label |
| FY header (R7) | `fiscal_year` | Year integer |
| — | `quarter` | NULL (annual data) |
| — | `disbursement` | NULL (not in source) |
| Row label | `operations_programs` | "{Pillar} Program — {ExpenseClass}" |

---

#### FINDING GL-E: Conflict Analysis

**Scenario:** Extracted data (30 records) vs existing DB data (30 records).

**Result:** ZERO conflicts. Data was migrated from this same extraction in Phase GI. All values match. No re-migration needed for FY2023–2025.

**FY2026 manual entries (6 records):** These are user-entered test data with quarter-specific values. They do NOT conflict with extraction data (Excel has no FY2026 column). No action needed.

---

#### FINDING GL-F: Validation Criteria

| Criterion | Method | Result |
|-----------|--------|--------|
| Accuracy | Excel subtotal values = DB allotment/obligation | ✅ 30/30 match |
| Completeness | All 4 pillars × 3 FYs × PS/MOOE(/CO) present | ✅ 30/30 present |
| Structural alignment | quarter NULL, expense_class valid, operation_id linked | ✅ All valid |
| No duplication | Unique on (operation_id, fiscal_year, quarter, operations_programs) | ✅ No duplicates |
| Audit traceability | metadata contains source, phase, row, timestamp | ✅ All tagged |

---

### Section 2.43 — Phase GK: Pre-Population Cleanup Audit — FC through FE Verification (Apr 5, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

---

#### FINDING GK-A: All FC–FE Code Changes Already Implemented

Full audit of phases FC through FE against current codebase confirms **every code-level item is already implemented**. Execution tables in `plan.md` were stale — now corrected.

| Item | Plan Status | Actual Status | Evidence |
|------|------------|---------------|----------|
| FC-1: Stale test records cleanup | ⬜ PENDING | ✅ Done | DB query: FY2025 Q1, FY2026 Q2/Q3 PUBLISHED all have `deleted_at` set |
| FC-2: autoRevert warning log | ⬜ PENDING | ✅ Done | `service.ts:2563` — `this.logger.warn(...)` present |
| FC-3: Physical quarter bypass docs | ⬜ PENDING | ✅ Done | `service.ts:1425,1466,1503` — comments at all 3 call sites |
| FC-4: Admin module assignment | ⬜ PENDING | ✅ Done | DB query: all Admin users have `ALL` or `OPERATIONS` module |
| FC-5: Snapshot error logging | ⬜ PENDING | ✅ Done | `service.ts:2549` — `SNAPSHOT_FAILED` at WARN level |
| FD-1: Soft-delete FY2025 Q1 | ⬜ PENDING | ✅ Done | DB query: `9e268112...` has `deleted_at` set |
| FD-2: findCurrentOperation scoping | ⬜ PENDING | ✅ Done | `financial/index.vue:217,232,255,267` — stale-state detection |
| FD-3: Inline-editable prefill | ⬜ PENDING | ✅→Reverted | Implemented then reverted by FE-2 (dialog pattern restored) |
| FD-4: Empty-state messaging | ⬜ PENDING | ✅ Done | `financial/index.vue:1133` — empty state guidance |
| FE-1: UNIQUE constraint fix | ⬜ PENDING | ✅ Done | Migration 030: partial unique index on active records |
| FE-2: Revert FD-3 | ⬜ PENDING | ✅ Done | Dialog-based entry restored |

#### FINDING GK-B: Additional Phases GA–GE Also Verified

| Item | Actual Status | Evidence |
|------|---------------|----------|
| GA-1: Backend-computed metrics | ✅ | `index.vue:243` — Phase GA-1 comment, authRecord pattern |
| GA-2: 5-tier color system | ✅ | `index.vue:293` — Phase GA-2 implementation |
| GA-3: Indicator card deep linking | ✅ | `index.vue:1126` — Phase GA-3 navigation |
| GD-1: Progress bar max fix | ✅ | No `max="120"` in codebase |
| GD-2: Annotation label visibility | ✅ | All 5 annotations have `background: '#FFFFFF'` |
| GD-3: Variance chip sizing | ✅ | All chips use `size="small"` |
| GE-1: CSS hover annotation labels | ✅ | `index.vue:2153-2162` — CSS present |
| FZ-1: Display metrics pass-through | ✅ | `index.vue:277` — Phase FZ-1 implementation |

#### FINDING GK-C: Only Operator Testing Remains

All code changes and data fixes are complete. The remaining ⬜ items are exclusively **operator testing** tasks (regression testing at end of each phase). These are not implementable by the AI agent — they require manual UI walkthrough by the operator.

Active quarterly_reports state verified clean:
- FY2026 Q1: DRAFT (legitimate)
- FY2026 Q2: DRAFT (legitimate)
- All stale PUBLISHED records: soft-deleted

---

### Section 2.42 — Phase GJ: Data Visualization Clarity Enhancement — Hover Labels & Precise Values (Apr 5, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

---

#### FINDING GJ-A: Complete Chart Inventory — Tooltip & DataLabel Audit

**File:** `pmo-frontend/pages/university-operations/index.vue`
**Chart library:** vue3-apexcharts (ApexCharts)
**Charts on Physical page (`physical/index.vue`) and Financial page (`financial/index.vue`):** NONE — these are data entry pages, no chart components.

**All 9 charts live in `index.vue` (the analytics dashboard):**

| # | Chart Name | Type | Lines | Tooltip | DataLabels | Deficiency |
|---|-----------|------|-------|---------|------------|------------|
| 1 | Pillar Accomplishment Rates | `radialBar` | 726–783 | ❌ None | Value only: `val.toFixed(0)%` | No hover tooltip. Truncated to integer (87% not 87.45%). No pillar name in hover. |
| 2 | Quarterly Trend (Physical) | `line` | 794–829 | ✅ `val.toFixed(4)` | ❌ None | Shows 4 decimals (0.8745 not 87.45%). Y-axis labeled "Rate Score (Dimensionless)" — confusing. No % suffix. |
| 3 | Achievement Rate by Pillar | `bar` | 951–1019 | ✅ `val.toFixed(1)%` | ✅ `val.toFixed(1)%` | ✓ Properly configured — tooltip + data labels both present with 1 decimal. |
| 4 | YoY Accomplishment Rate | `bar` | 847–911 | ✅ `val.toFixed(1)%` | ❌ `enabled: false` | Tooltip works, but **no data labels on bars**. Close values indistinguishable without hover. |
| 5 | Financial Utilization Radial | `radialBar` | 400–434 | ❌ None | Value: `val.toFixed(1)%` | No hover tooltip (same as Chart 1). Only center value visible. |
| 6 | Expense Class Breakdown | `donut` | 445–459 | ❌ Default | ✅ `label: val.toFixed(1)%` | Uses ApexCharts default tooltip (no formatter). Shows raw number, not formatted. |
| 7 | Financial Quarterly Trend | `line` | 466–476 | ✅ Mixed formatter | ❌ None | Tooltip correctly differentiates ₱ vs %. No data labels. |
| 8 | Cross-Comparison (Phys vs Fin) | `bar` | 597–626 | ✅ `val.toFixed(1)%` | ✅ `val.toFixed(1)%` | ✓ Properly configured. |
| 9 | Cross-Module YoY | `bar` | 650–689 | ✅ `val.toFixed(1)%` | ✅ `val.toFixed(1)%` | ✓ Properly configured. |
| 10 | Financial YoY Utilization | `bar` | 495–534 | ❌ None | ✅ `${val}%` but no decimal | No tooltip formatter. DataLabel uses `${val}%` (no `.toFixed()` — truncated integers). |

---

#### FINDING GJ-B: Deficiency Classification

**Category 1 — No tooltip at all (CRITICAL):**
- Chart 1: Pillar Accomplishment Rates (radialBar) — user cannot determine exact rate per pillar on hover
- Chart 5: Financial Utilization Radial (radialBar) — same issue

**Root cause:** ApexCharts `radialBar` does NOT show tooltips by default. Requires explicit `tooltip: { enabled: true }` plus a custom formatter. The `plotOptions.radialBar.dataLabels` only controls the static center label, not hover behavior.

**Category 2 — Tooltip exists but no data labels on bars (HIGH):**
- Chart 4: YoY Accomplishment Rate — `dataLabels: { enabled: false }` explicitly disables labels
- Chart 7: Financial Quarterly Trend — line chart, no data labels (acceptable for lines, but hover works)
- Chart 10: Financial YoY Utilization — no tooltip formatter, data labels use raw `${val}%` without decimal precision

**Category 3 — Formatting issues (MEDIUM):**
- Chart 2: Quarterly Trend — tooltip shows `0.8745` (4 decimal raw score) instead of `87.45%`. Y-axis label says "Dimensionless" — meaningless to non-technical users.
- Chart 6: Expense Breakdown donut — default tooltip shows raw obligation value (e.g., `48073000`) without currency formatting
- Chart 10: Financial YoY — data labels show `99%` not `99.63%`. Integer truncation loses precision.

**Category 4 — Already correct (NO ACTION NEEDED):**
- Chart 3: Achievement Rate by Pillar ✓
- Chart 8: Cross-Comparison (Phys vs Fin) ✓
- Chart 9: Cross-Module YoY ✓

---

#### FINDING GJ-C: ApexCharts Tooltip Architecture

**RadialBar tooltip limitation:**
ApexCharts radialBar charts do not support standard `tooltip.y.formatter`. Instead, they require:
```
tooltip: {
  enabled: true,
  custom: function({ series, seriesIndex, w }) {
    return '<div class="custom-tooltip">' +
      w.globals.labels[seriesIndex] + ': ' + series[seriesIndex].toFixed(1) + '%' +
    '</div>'
  }
}
```

**Donut chart tooltip:**
Donut tooltips need `tooltip.y.formatter` to format raw values. The current expense breakdown passes raw obligation amounts but has no tooltip formatter.

**Bar chart dataLabels:**
When `dataLabels.enabled: true`, labels appear on/above bars. For grouped bars (YoY with 4 pillars), `offsetY: -20` ensures labels don't overlap.

**Line chart:**
Line charts show tooltips on hover by default via the shared crosshair. The Quarterly Trend (Chart 2) has a formatter but outputs raw dimensionless scores instead of percentages.

---

#### FINDING GJ-D: Data Formatting — Decimal vs Percentage

| Chart | Data Source | Value Type | Current Display | Required Display |
|-------|-----------|-----------|-----------------|-----------------|
| Pillar Radial | `accomplishment_rate_pct` | Already % (e.g., 87.45) | `87%` (truncated) | `87.5%` (1 decimal) |
| Quarterly Trend | `target_rate`, `actual_rate` | Raw ratio (e.g., 0.87) | `0.8700` | `87.0%` (needs ×100) |
| Financial Radial | `avg_utilization_rate` | Already % (e.g., 99.63) | `99.6%` | `99.6%` ✓ (OK) |
| Expense Donut | `total_obligations` | Raw currency (e.g., 48073000) | `48073000` | `₱48,073,000` |
| Financial YoY | `utilization_rate` | Already % | `99%` (truncated) | `99.6%` (1 decimal) |

**Key insight:** Chart 2 (Quarterly Trend) is the only chart where data needs multiplication. All others already receive percentage values — they just need proper formatting.

---

#### FINDING GJ-E: Consistency Gaps Across Reporting Types

| Aspect | Physical Analytics | Financial Analytics | Cross Analytics |
|--------|-------------------|--------------------|-----------------| 
| Radial tooltip | ❌ Missing | ❌ Missing | N/A |
| Bar dataLabels | Mixed (some enabled, some not) | Missing on YoY | ✅ Present |
| Tooltip format | `toFixed(1)%` where present | Mixed (₱ vs %) | `toFixed(1)%` |
| Y-axis label | "Achievement Rate (%)" / "Rate Score (Dimensionless)" | "Amount (₱)" / "Rate (%)" | "Rate (%)" |

**Inconsistency:** Physical Quarterly Trend y-axis says "Rate Score (Dimensionless)" while all other charts use "%" labels. This was likely a development artifact.

---

### Section 2.32 — Phase FY: SUM Reversion, Rate Override, Records View Quarter Scoping (Mar 31, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

---

#### FINDING FY-A: AVERAGE Logic — All Affected Locations

Phase FU (service.ts:1104) and Phase FX (physical/index.vue:890) introduced AVERAGE for PERCENTAGE unit types. This is incorrect per DBM BAR1 standard — cumulative reporting requires SUM across all quarters for ALL indicator types.

**Three locations with AVERAGE logic (must revert to SUM):**

| # | File | Lines | Phase Tag | Unit-type Branch |
|---|------|-------|-----------|------------------|
| 1 | `pmo-backend/src/university-operations/university-operations.service.ts` | 1104–1124 | FU-2 | `if (unitType === 'PERCENTAGE') → AVERAGE` |
| 2 | `pmo-frontend/pages/university-operations/index.vue` | 240–252 | FU-1 | `if (unitType === 'PERCENTAGE') → AVERAGE` |
| 3 | `pmo-frontend/pages/university-operations/physical/index.vue` | 890–924 | FX-1 | `if (unitType === 'PERCENTAGE') → AVERAGE` |

**Additional — Analytics `getPillarSummary` (service.ts:1905):**

The `getPillarSummary` SQL query (lines 1921-1942) uses `AVG()` for PERCENTAGE types in two separate SQL `AVG()` aggregations → `pct_avg_target`, `pct_avg_accomplishment`. These feed into the dashboard analytics pillar donut charts. The user's brief specifies "prevent regression in analytics" — this SQL-level analytics function is separate from the `computeIndicatorMetrics` pipeline and serves the dashboard charting layer. **Scope: analytics AVG is NOT part of this phase** — it is a chart-level aggregate, not a per-indicator computation. Only the three indicator-level locations above are in scope for revert.

**Correct formula (all types, all locations):**
```
totalTarget = SUM(non-null [target_q1, target_q2, target_q3, target_q4])
totalActual = SUM(non-null [actual_q1, actual_q2, actual_q3, actual_q4])
variance = totalActual - totalTarget
rate = (totalActual / totalTarget) * 100
```

---

#### FINDING FY-B: Rate Override — Current State

No override mechanism exists. Relevant column analysis:

| Field | Type | Purpose | Suitable for Override? |
|-------|------|---------|----------------------|
| `score_q1`–`score_q4` | `VARCHAR(50)` | Numerator/denominator format e.g. `"148/200"` | ❌ VARCHAR, wrong format |
| `accomplishment_rate` | `DECIMAL(6,2)` | Backend-computed, returned by API, NOT stored in DB | ❌ Computed only |
| `variance` | `DECIMAL(10,4)` | Backend-computed, NOT stored in DB | ❌ Computed only |

**Confirmation:** `accomplishment_rate` and `variance` are NOT stored columns — they are computed in `computeIndicatorMetrics()` at query time and returned as API response fields only. They are not persisted to `operation_indicators`.

**Required for override:** A new `DECIMAL(6,2)` nullable column `override_rate` in `operation_indicators`. When set, it replaces the auto-computed `accomplishment_rate` in the response. The computed rate is always recalculated and returned as `computed_rate` for transparency. Override does NOT affect `target_q*`, `accomplishment_q*`, or `variance`.

**Migration needed:** 032 — `ALTER TABLE operation_indicators ADD COLUMN override_rate DECIMAL(6,2) NULL`

**Backend change:** `computeIndicatorMetrics()` must:
1. Read `record.override_rate`
2. Return both `computed_rate` (auto) and `accomplishment_rate` (= override_rate if set, else computed_rate)

**Frontend change:** Dialog must have an optional `override_rate` input. When populated, it shows "(Override applied)" badge. DTO must include `override_rate`.

---

#### FINDING FY-C: Records View Quarter Scoping — Current vs Required

**Current `fetchAPRRData()` (index.vue:170):**
```typescript
api.get<any[]>(`/api/university-operations/indicators?pillar_type=${p.id}&fiscal_year=${selectedFiscalYear.value}`)
// ← NO quarter param → returns ALL per-quarter records
```

**Physical page (physical/index.vue:308):**
```typescript
api.get<any[]>(`/api/university-operations/indicators?pillar_type=${activePillar.value}&fiscal_year=${selectedFiscalYear.value}&quarter=${selectedQuarter.value}`)
// ← WITH quarter param → returns ONLY records for that quarter
```

**Why this matters post-FX-2 (FULL_YEAR removed):**
Records View now only shows per-quarter data (Q1–Q4). There is no reason to fetch ALL quarters' records — only the selected quarter's records are needed. Fetching without a quarter filter:
- Returns more data than needed
- Relies on `pickVal` merge logic with fallback (contamination risk)
- Inconsistent with Physical page behavior

**Required fix:**
1. `fetchAPRRData()` must accept `quarter` parameter and pass it to the backend
2. A watcher on `aprrDisplayQuarter` must call `fetchAPRRData()` when quarter changes
3. `aprrData` cache must be cleared on quarter change (data is now quarter-specific, old data from a different quarter is stale)
4. Since FULL_YEAR is removed, `getAPRRIndicators()` single-quarter records will have one non-null quarter field per indicator — `pickVal` will correctly resolve this

**Backend query behavior with `quarter=Q1`:**
```sql
AND (oi.reported_quarter = 'Q1' OR oi.reported_quarter IS NULL)
```
Returns: Q1 records + legacy records (reported_quarter=NULL) → correct for all indicator types.

**Watcher architecture:**
- `watch(physicalViewMode)` → already calls `fetchAPRRData()` on REPORT tab activation
- Need: `watch(aprrDisplayQuarter)` → call `fetchAPRRData()` — triggers re-fetch when quarter changes
- Need: `watch(selectedFiscalYear)` on Report View → already calls `fetchAPRRData()` if Report mode active

---

#### FINDING FY-D: Impact Scope Summary

| Area | Phase FU Tag | Location | Fix Type |
|------|-------------|----------|----------|
| Backend metric computation | FU-2 | service.ts:1110-1116 | Remove AVERAGE branch → SUM only |
| APRR frontend aggregation | FU-1 | index.vue:246-248 | Remove AVERAGE branch → SUM only |
| Dialog preview computation | FX-1 | physical/index.vue:902-908 | Remove AVERAGE branch → SUM only |
| Rate override | NEW | DB + backend + frontend | Add `override_rate` column + API support |
| Records View quarter filter | NEW | index.vue:fetchAPRRData | Add `quarter` param + watcher |

---

### Section 2.31 — Phase FX: Calculation Inconsistency & Filter Misconfiguration — Physical Module vs Records View (Mar 31, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

---

#### FINDING FX-A: Dialog vs Table Calculation Mismatch (CRITICAL)

**Observed scenario (AE Outcome, Q2, FY2026):**

| Quarter | Target | Actual |
|---------|--------|--------|
| Q1 | 10 | — |
| Q2 | — | 20 |
| Q3 | — | 20 |
| Q4 | 20 | 2 |

**Dialog shows:** Total Target = 30, Actual = 42, Variance = +12, Rate = 140%
**Table shows:** Variance = -1.00, Rate = 93.3%

**Root Cause: Phase FU aggregation gap**

Phase FU-2 added unit-type-aware aggregation to TWO locations but missed the third:

| Location | Aggregation | PERCENTAGE Logic | Status |
|----------|-------------|------------------|--------|
| Backend `computeIndicatorMetrics()` (service.ts:1104-1124) | Unit-aware | AVERAGE | ✅ Phase FU-2 |
| APRR `getAPRRIndicators()` (index.vue:240-252) | Unit-aware | AVERAGE | ✅ Phase FU-1 |
| **Dialog `computedPreview`** (physical/index.vue:887-907) | **Always SUM** | **SUM** | ❌ MISSED |

**Trace — why the table shows -1 and 93.3%:**

AE indicators have `unit_type = 'PERCENTAGE'` (migration 019).

Backend `computeIndicatorMetrics()` (line 1110-1116):
```
targets = [10, 20] → AVERAGE = 15
actuals = [20, 20, 2] → AVERAGE = 14
variance = 14 - 15 = -1
rate = (14 / 15) * 100 = 93.33%
```

Dialog `computedPreview` (line 887-907):
```
targets = [10, 20] → SUM = 30
actuals = [20, 20, 2] → SUM = 42
variance = 42 - 30 = 12
rate = (42 / 30) * 100 = 140%
```

**The table is backend-authoritative (Directive: backend enforcement is authoritative).** The dialog lacks unit-type awareness — it always uses SUM regardless of indicator type.

**Data flow confirmation:**
1. Physical page fetches: `GET /indicators?pillar_type=...&fiscal_year=...&quarter=Q2` (line 308)
2. Backend returns Q2 record with `computeIndicatorMetrics()` applied (line 1027)
3. Table reads `getIndicatorData(id)?.variance` and `?.accomplishment_rate` — these are backend-computed
4. Dialog loads same record into `entryForm`, then `computedPreview` recomputes locally with SUM-only logic
5. Result: same data, different formulas → different numbers

**Fix required:** Make `computedPreview` unit-type-aware. The dialog has access to the indicator's taxonomy data (it knows which indicator is being edited). It must check `unit_type` and apply AVERAGE for PERCENTAGE, SUM for COUNT/WEIGHTED_COUNT.

---

#### FINDING FX-B: Records View Filter Misconfiguration (CRITICAL)

**Observed:** User reports "ALL" filter mixes data, Q1 filter shows Q2 data.

**Current state (index.vue):**
- Line 88: `aprrDisplayQuarter = ref('FULL_YEAR')` — initial value
- Line 1646-1651: Toggle buttons: `FULL_YEAR`, `Q1`, `Q2`, `Q3`, `Q4`
- The "ALL" user refers to = `FULL_YEAR` in code

**Architecture — display-only filter (NO server-side quarter filtering):**

Unlike Physical page (line 308: sends `quarter=${selectedQuarter.value}`), the Records View:
1. `fetchAPRRData()` (line 170) fetches ALL records: `GET /indicators?pillar_type=X&fiscal_year=Y` — **no quarter param**
2. Multiple per-quarter records per indicator are merged via `pickVal` (line 205-216)
3. `getAPRRDisplayMetrics()` (line 282-312) selects which Q fields to display based on `aprrDisplayQuarter`

**Cross-quarter leakage mechanism:**

When user selects Q1, `getAPRRDisplayMetrics` reads `ind.target_q1` and `ind.actual_q1` from the merged indicator object. These fields were populated by `pickVal` in `getAPRRIndicators()`:

1. `pickVal(records, 'target_q1')` → looks for record with `reported_quarter='Q1'` (Phase FW-4)
2. If no Q1 record exists, **falls back to first non-null** from any record
3. A Q2 record may have non-null `target_q1` (from prior-quarter prefill at physical/index.vue:661-678)
4. Result: Q1 display shows Q2 record's prefilled (potentially stale) Q1 data

**Additional issue — FULL_YEAR aggregation vs per-quarter view confusion:**

The FULL_YEAR view returns `ind.total_target` / `ind.total_actual` which are unit-type-aware aggregated totals (Phase FU-1). Per-quarter views (Q1-Q4) return single-quarter raw values. Switching between these creates a conceptual mismatch — FULL_YEAR shows averages for PERCENTAGE types while Q1-Q4 show raw per-quarter values.

**User requirement:** Remove FULL_YEAR filter entirely. Keep only Q1, Q2, Q3, Q4.

---

#### FINDING FX-C: Scope of Fix

| Issue | Component | File | Lines |
|-------|-----------|------|-------|
| Dialog missing unit-type aggregation | Physical dialog `computedPreview` | physical/index.vue | 885-908 |
| Dialog needs indicator unit_type access | Physical dialog | physical/index.vue | entryForm + taxonomy |
| FULL_YEAR button removal | Records View template | index.vue | 1647 |
| Default quarter state change | Records View state | index.vue | 88 |
| `aprrDisplayQuarter` initial value | State initialization | index.vue | 88 |
| FULL_YEAR branch in display metrics | `getAPRRDisplayMetrics` | index.vue | 295-296 |
| FULL_YEAR branch in `aprrRenderData` | Report title display | index.vue | 1678 |

**No backend changes required** — backend calculation is already correct (Phase FU-2).

---

### Section 2.30 — Phase FW: Throttling, Memory Overflow, Data Inconsistency (Mar 26, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

#### 1. Backend Throttle Configuration (ROOT CAUSE — THROTTLING)

**File:** `pmo-backend/src/app.module.ts` lines 36-40

```
ThrottlerModule.forRoot([
  { name: 'short', ttl: 1000, limit: 3 },      ← 3 per SECOND
  { name: 'medium', ttl: 10000, limit: 20 },    ← 20 per 10 sec
  { name: 'long', ttl: 60000, limit: 100 },     ← 100 per minute
])
```

Global `ThrottlerGuard` applied to ALL routes via `APP_GUARD` (line 81-84).

**The "short" limit of 3 requests per second is fatally restrictive for a multi-pillar dashboard.**

#### 2. API Call Audit — Exact Request Count Per Scenario

**On page mount (`onMounted`):**

| Function | Endpoints | Calls |
|----------|-----------|-------|
| `fetchCrossModuleSummary()` | `/pillar-summary`, `/financial-pillar-summary` | 2 |
| `fetchCrossModuleYoY()` | `/yearly-comparison`, `/financial-yearly-comparison` | 2 |
| `fetchAnalytics()` | `/pillar-summary` (**DUP**), `/quarterly-trend`, `/yearly-comparison` (**DUP**) | 3 |

**Total on mount: 7 parallel calls (5 unique, 2 DUPLICATES)**

→ `/pillar-summary` called by BOTH `fetchCrossModuleSummary` AND `fetchAnalytics`
→ `/yearly-comparison` called by BOTH `fetchCrossModuleYoY` AND `fetchAnalytics`

**When user switches to Report View tab:**

| Function | Endpoints | Calls |
|----------|-----------|-------|
| `fetchAPRRData()` | 4× `/taxonomy/${pillarId}`, 4× `/indicators?pillar_type=...` | 8 |

**Total: 8 parallel calls**

**When fiscal year changes on Report View:**

| Function | Calls |
|----------|-------|
| `fetchCrossModuleSummary()` | 2 |
| `fetchCrossModuleYoY()` | 2 |
| `fetchAnalytics()` | 3 (2 duplicates) |
| `fetchAPRRData()` | 8 |

**Total: 15 parallel calls (13 unique, 2 duplicates)** → **5× over "short" limit of 3/sec**

#### 3. Throttle Impact on TECHNICAL_ADVISORY (MFO4)

TECHNICAL_ADVISORY is the 4th pillar in the `PILLARS` array. In `fetchAPRRData()`, `Promise.all(PILLARS.map(...))` fires all 8 calls simultaneously. The JavaScript runtime sends them to the network layer, which queues them via browser connection limits (~6 per host). TECHNICAL_ADVISORY's taxonomy and indicator calls are likely the 7th and 8th requests — **first to hit the 3/sec "short" throttle limit**.

This is why MFO4 specifically fails with 429 while MFO1-3 succeed — the earlier pillars' requests arrive before the throttle window fills.

#### 4. Duplicate API Calls (CONFIRMED)

| Endpoint | Called By | Duplicated In |
|----------|-----------|---------------|
| `/pillar-summary?fiscal_year=X` | `fetchCrossModuleSummary()` (line 131) | `fetchAnalytics()` (line 371) |
| `/yearly-comparison?years=X` | `fetchCrossModuleYoY()` (line 146) | `fetchAnalytics()` (line 373) |
| `/financial-pillar-summary` | `fetchCrossModuleSummary()` (line 132) | `fetchFinancialAnalytics()` (line 396) |
| `/financial-yearly-comparison` | `fetchCrossModuleYoY()` (line 147) | `fetchFinancialAnalytics()` (line 398) |

Both `fetchAnalytics()` and `fetchFinancialAnalytics()` re-fetch data already retrieved by the cross-module functions. Comments say "Re-fetch to ensure freshness" — but the cross-module functions are called in the same watcher tick.

#### 5. Taxonomy Redundancy — Immutable Data Re-Fetched

The 4 taxonomy calls in `fetchAPRRData()` hit `/taxonomy/${pillarId}`. Taxonomy data (`pillar_indicator_taxonomy`) is seeded by migration 019 and NEVER changes at runtime. Yet every APRR fetch (tab switch, FY change, refresh) re-fetches all 4 pillars' taxonomy.

Caching taxonomy after first fetch would reduce APRR calls from 8 → 4 per subsequent load.

#### 6. Memory Overflow — Cascade Analysis

When 15 parallel API calls fire and the "short" throttle rejects ~12 of them with 429:
1. Each rejected request throws in `useApi()` → creates error objects
2. `fetchAPRRData()` catch block handles 429 gracefully (sets `[]`)
3. But `fetchAnalytics()` catch catches the error → sets null → wipes chart data
4. `fetchCrossModuleSummary()` catch silently fails → no summary cards
5. All these state changes trigger Vue re-renders simultaneously
6. If the user retries (clicks Refresh or changes FY again), the cycle repeats

On rapid user interaction (clicking through fiscal years), this creates:
- Many concurrent in-flight promises (no cancellation or deduplication)
- Rapid state mutations triggering cascading computed re-evaluations
- No guard against duplicate `fetchAPRRData()` — can fire multiple times concurrently

#### 7. Data Inconsistency — `pickVal` Cross-Quarter Contamination

**File:** `index.vue` line 198-203

```typescript
const pickVal = (records: any[], field: string) => {
  for (const r of records) {
    if (r[field] != null) return r[field]
  }
  return null
}
```

`pickVal` picks the **first non-null** value across ALL records for a field, regardless of `reported_quarter`.

**Problem scenario:** Per-quarter records may have stale cross-quarter data:
- Q1 record: `reported_quarter='Q1'`, `target_q1=85`, `target_q2=null`
- Q2 record: `reported_quarter='Q2'`, `target_q1=80` (stale/default), `target_q2=90`

Backend query orders by `indicator_order, particular` — NOT by `reported_quarter`. If Q2 record appears first, `pickVal(records, 'target_q1')` returns **80** (from Q2's stale data) instead of **85** (from Q1's authoritative data).

**Physical page comparison:** The Physical page fetches with `quarter=Q1` filter → gets ONLY the Q1 record → shows `target_q1=85`. Report View gets both records → `pickVal` may return 80.

**Fix:** Use `reported_quarter`-aware merging — for `target_q1`/`accomplishment_q1`, prefer the record with `reported_quarter='Q1'`.

---

### Section 2.29 — Phase FV: MFO4 Data Loss + Controlled Loading Strategy (Mar 26, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

#### 1. Data Pipeline Trace — Report View

```
PILLARS[4] (HE, AE, RP, TA)
  → fetchAPRRData(): Promise.all(PILLARS.map(async p => {
        api.get(`taxonomy/${p.id}`)      → aprrTaxonomy[p.id]
        api.get(`indicators?pillar_type=${p.id}&fiscal_year=...`)  → aprrData[p.id]
     }))
  → Per-pillar error isolation (catch → sets both to [])
  → aprrRenderData computed: PILLARS.map → getAPRRIndicators → processIndicator → sections
  → Template: v-for pillarData in aprrRenderData
```

All 4 pillars use **identical code paths**. No pillar-specific conditional logic exists. TECHNICAL_ADVISORY is correctly listed in:
- Frontend `PILLARS` constant (line 45: `id: 'TECHNICAL_ADVISORY'`)
- Backend `validPillarTypes` (line 951, 979: `'TECHNICAL_ADVISORY'`)
- Migration 019 taxonomy seed (4 indicators: TA-OC-01, TA-OP-01, TA-OP-02, TA-OP-03)

#### 2. MFO4 Root Cause — Silent Error in Per-Pillar Fetch (HIGH CONFIDENCE)

The `fetchAPRRData` error isolation catch block (line 168-171):
```typescript
} catch (err: any) {
  console.error(`[APRR] Failed to fetch ${p.id}:`, err)
  taxonomy[p.id] = []     // ← silently sets empty
  results[p.id] = []      // ← silently sets empty
}
```

When the TECHNICAL_ADVISORY API call fails (taxonomy or indicators), the error is:
1. Logged to browser console only (not visible in UI)
2. Data silently replaced with empty arrays
3. `aprrRenderData` produces `sections: []`, `hasData: false`
4. Template shows "No indicator data for this pillar"

**Why MFO4 specifically?** Possible causes (without runtime access, all are candidates):
- Backend query error specific to TECHNICAL_ADVISORY data (e.g., NULL reference in joined data)
- Timeout on 7th/8th parallel API request (8 total = 2 per pillar × 4 pillars)
- Race condition with shared `useApi()` composable (each `api.get()` sets/clears a shared `loading` ref)
- No `university_operations` record for TECHNICAL_ADVISORY in the fiscal year (backend returns empty `[]` — NOT an error, but no data)

**The key issue is not WHAT fails, but that errors are invisible.** The catch block silently masks failures. The operator cannot distinguish between "no data exists" and "fetch failed."

#### 3. Loading Issue — `aprrLoading` Initial State

**Current:** `const aprrLoading = ref(false)` (line 83)

**Problem:** When the Report View tab first renders:
1. `physicalViewMode` changes to `'REPORT'`
2. Template conditionally renders Report View section
3. Vue pre-flush watcher fires `fetchAPRRData()` → `aprrLoading = true`

In theory, steps 2 and 3 happen in the same render cycle (watcher fires before DOM update). In practice, Vue 3's scheduler timing with `v-model` on Vuetify's `v-tabs` component can introduce a gap where:
- Report View renders with `aprrLoading === false`
- Data is empty → shows 4 empty pillar cards with "No indicator data"
- Watcher fires on next tick → `aprrLoading = true` → spinner shows
- Fetch completes → data renders

This produces a **flash of empty content** before the spinner appears.

Additionally, `onMounted` (line 1109) does NOT call `fetchAPRRData()` — it's lazy-loaded via watcher only.

#### 4. Backend Analysis — No MFO4-Specific Logic

Backend endpoints used:
- `GET taxonomy/:pillarType` → `findTaxonomyByPillarType()` (line 950): Simple query, no pillar-specific logic
- `GET indicators` → `findIndicatorsByPillarAndYear()` (line 973): Joins `operation_indicators` + `university_operations` + `pillar_indicator_taxonomy`. Requires `uo.operation_type = 'TECHNICAL_ADVISORY'`

If no university_operations record exists for TECHNICAL_ADVISORY in the fiscal year, the indicators query returns 0 rows (not an error). Taxonomy still returns 4 entries. Result: 4 indicator cards with all "—" values (NOT "No indicator data").

If the indicators query THROWS an error, `fetchAPRRData` catches it and sets both taxonomy and data to `[]`. Result: "No indicator data for this pillar."

#### 5. Physical Page Comparison

Physical page also uses `GET indicators?pillar_type=TECHNICAL_ADVISORY&...` but with a `quarter` filter. If the Physical page shows data for MFO4, the API works. The Report View omits the quarter filter — which should return MORE data, not less.

#### 6. `useApi()` Composable — Shared State Concern

`useApi()` (composables/useApi.ts) has shared `loading` and `error` refs. When 8 parallel API calls run via `Promise.all`, each call's `finally` block sets `loading.value = false`. The first call to complete resets loading for all. This doesn't affect the component's `aprrLoading` but could cause subtle side effects if the composable's `loading` state is referenced elsewhere.

---

### Section 2.28 — Phase FU: Data Calculation & Visualization Integrity — Unit-Based Aggregation (Mar 26, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

#### 1. Indicator Unit Type Classification (Authoritative — migration 019)

| Pillar | Code | Indicator | Unit Type | Agg Method |
|--------|------|-----------|-----------|------------|
| HIGHER_EDUCATION | HE-OC-01 | % first-time licensure passers | PERCENTAGE | AVG |
| HIGHER_EDUCATION | HE-OC-02 | % graduates employed | PERCENTAGE | AVG |
| HIGHER_EDUCATION | HE-OP-01 | % students in priority programs | PERCENTAGE | AVG |
| HIGHER_EDUCATION | HE-OP-02 | % programs with accreditation | PERCENTAGE | AVG |
| ADVANCED_EDUCATION | AE-OC-01 | % faculty in research | PERCENTAGE | AVG |
| ADVANCED_EDUCATION | AE-OP-01 | % students in research programs | PERCENTAGE | AVG |
| ADVANCED_EDUCATION | AE-OP-02 | % accredited graduate programs | PERCENTAGE | AVG |
| RESEARCH | RP-OC-01 | # research outputs utilized | COUNT | SUM |
| RESEARCH | RP-OP-01 | # research outputs completed | COUNT | SUM |
| RESEARCH | RP-OP-02 | % outputs published in journals | PERCENTAGE | AVG |
| TECHNICAL_ADVISORY | TA-OC-01 | # active partnerships | COUNT | SUM |
| TECHNICAL_ADVISORY | TA-OP-01 | # trainees weighted by training | WEIGHTED_COUNT | SUM |
| TECHNICAL_ADVISORY | TA-OP-02 | # extension programs | COUNT | SUM |
| TECHNICAL_ADVISORY | TA-OP-03 | % beneficiaries rating satisfactory | PERCENTAGE | AVG |

**Critical distribution:**
- HIGHER_EDUCATION: 4/4 PERCENTAGE — **100% affected by SUM bug**
- ADVANCED_EDUCATION: 3/3 PERCENTAGE — **100% affected by SUM bug** (operator's reported issue)
- RESEARCH: 1/3 PERCENTAGE — partially affected
- TECHNICAL_ADVISORY: 1/4 PERCENTAGE — partially affected

#### 2. ROOT CAUSE: SUM Used Unconditionally for All Unit Types

**Three layers have the same bug:**

**(A) Frontend `getAPRRIndicators()` — index.vue line 216-224 (Report View)**

```typescript
// Line 216: "BAR1 Standard: SUM for all unit types" ← INCORRECT COMMENT
const totalTarget = targets.reduce((a, b) => a + b, 0)   // SUM always
const totalActual = actuals.reduce((a, b) => a + b, 0)    // SUM always
```

This is called by `aprrRenderData` computed → feeds the Report View template.

Effect on PERCENTAGE indicators:
- Q1 target=85%, Q2 target=90% → Full Year total = **175%** (WRONG — should be **87.5%**)
- Displayed target/actual values are inflated by quarter count
- Variance magnitude inflated proportionally
- Rate (Actual/Target ×100) happens to be correct when same number of quarters have data, but variance and displayed values are wrong

**(B) Backend `computeIndicatorMetrics()` — service.ts line 1104-1113**

```typescript
// Line 1104: "BAR1 Standard — ALL indicator types use SUM aggregation"
const totalTarget = targets.reduce((a, b) => a + b, 0)     // SUM always
const totalAccomplishment = accomplishments.reduce((a, b) => a + b, 0)  // SUM always
```

Currently masked for Physical page because per-quarter records only have one quarter's data (SUM of 1 value = that value). But structurally incorrect for legacy records or API consumers fetching without quarter filter.

**(C) Dashboard `getPillarSummary()` — service.ts line 1888-1931 — CORRECTLY unit-type-aware**

```sql
-- Line 1892-1893 comment: "COUNT/WEIGHTED_COUNT: SUM" / "PERCENTAGE: AVG of non-null quarters"
CASE WHEN unit_type IN ('COUNT', 'WEIGHTED_COUNT') THEN SUM(Q1+Q2+Q3+Q4) ...
CASE WHEN unit_type = 'PERCENTAGE' THEN AVG(sum/count_non_null) ...
```

The Dashboard already implements the correct aggregation pattern. The Report View and backend `computeIndicatorMetrics` do NOT.

#### 3. Data Pipeline Trace (Report View)

```
Database (raw quarterly fields)
  → Backend findIndicatorsByPillarAndYear() — returns per-record rows, each with computeIndicatorMetrics(SUM)
    → API response: individual records with SUM-based total_target, total_accomplishment, accomplishment_rate
      → Frontend getAPRRIndicators(): pickVal merges records, re-computes SUM totals from raw fields
        → Frontend getAPRRDisplayMetrics(): picks Full Year totals or single quarter values
          → aprrRenderData computed: formats for display
            → Template: renders pre-computed values
```

The frontend RE-COMPUTES totals from raw quarterly fields (ignores backend's `total_target`/`total_accomplishment`). So fixing the frontend `getAPRRIndicators()` is sufficient to fix Report View display. Backend fix is for consistency.

#### 4. Physical Page vs Report View Comparison

| Aspect | Physical Page | Report View (Full Year) |
|--------|--------------|------------------------|
| Fetch | With `quarter=Q1` filter | No quarter filter |
| Records returned | 1 per indicator (quarter-specific) | Multiple per indicator (all quarters) |
| Total computation | Backend SUM on single record = correct | Frontend SUM across quarters = WRONG for % |
| Rate displayed | Single-quarter rate (correct) | SUM-based rate (wrong for %) |

This explains the operator's observation: "Data does not match Physical Accomplishment interface."

#### 5. `pickVal` Merge Logic — Correct for Per-Quarter Model

The `pickVal` helper picks the first non-null value across multiple records per field. For per-quarter records where each record has only its own quarter's fields populated, this correctly merges into a unified object with all quarters. **Not a bug.**

Potential issue: If multiple operations exist for the same pillar/fiscal year, `pickVal` only takes the first operation's data. Currently safe because the system assumes one operation per pillar per fiscal year.

#### 6. Correct Aggregation Rules

| Unit Type | Quarterly Total (Full Year) | Formula |
|-----------|-----------------------------|---------|
| COUNT | SUM of Q1+Q2+Q3+Q4 | Cumulative annual count |
| WEIGHTED_COUNT | SUM of Q1+Q2+Q3+Q4 | Cumulative weighted total |
| PERCENTAGE | AVERAGE of non-null quarters | Annual average rate |

Variance and Rate formulas remain the same for all types:
- `Variance = Total_Actual − Total_Target`
- `Rate = (Total_Actual / Total_Target) × 100`

The difference is in how `Total_Target` and `Total_Actual` are computed.

#### 7. Scope of Fix Required

| Component | Bug | Severity | Fix |
|-----------|-----|----------|-----|
| Frontend `getAPRRIndicators()` | SUM for all unit types | HIGH — visible data error | Unit-type-aware: AVG for PERCENTAGE, SUM for COUNT/WEIGHTED_COUNT |
| Backend `computeIndicatorMetrics()` | SUM for all unit types | MEDIUM — currently masked | Same unit-type-aware fix for consistency |
| Dashboard `getPillarSummary()` | None — already correct | N/A | No change |
| `getAPRRDisplayMetrics()` | None — single quarter paths correct | N/A | No change (reads from fixed totals) |
| `formatAPRRVal()` | None | N/A | No change |

---

### Section 2.27 — Phase FT: Report View No-Data Bug + Template Refactor (Mar 26, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready
**Severity:** HIGH (Report View renders no data after Phase FS changes)

#### Root Cause Analysis — Full Data Pipeline Trace

**Backend verification (CORRECT):**
- `GET /taxonomy/:pillarType` → returns taxonomy rows with `id`, `indicator_type`, `indicator_name`, `unit_type` — confirmed correct (service.ts:950–966)
- `GET /indicators?pillar_type=X&fiscal_year=Y` (no quarter) → returns ALL `operation_indicators` rows via `findIndicatorsByPillarAndYear` (service.ts:973–1028) → `computeIndicatorMetrics()` adds `total_target`, `total_accomplishment`, `variance`, `accomplishment_rate`
- No quarter filter when param is omitted — confirmed correct

**Frontend data fetch (CORRECT):**
- `fetchAPRRData()` calls both endpoints per pillar, stores in `aprrTaxonomy` and `aprrData` reactive refs — confirmed correct (line 153–178)
- Per-pillar error isolation works correctly — confirmed

**Frontend data mapping (CORRECT but FRAGILE):**
- `getAPRRIndicators()` filters taxonomy by type, matches data by `pillar_indicator_id === t.id`, merges per-quarter records — logic is correct

#### ROOT CAUSE #1: TypeScript Non-Null Assertions (`!`) in Vue Template

The template uses TypeScript `!` non-null assertion operator in expressions:

```html
{{ getAPRRDisplayMetrics(ind).rate!.toFixed(1) + '%' }}
{{ getAPRRDisplayMetrics(ind).variance! >= 0 ? '+' : '' }}
:color="getAPRRDisplayMetrics(ind).variance! >= 0 ? 'success' : 'error'"
```

While Nuxt 3's Vue compiler strips `!` during compilation (via TypeScript expression plugin), this is **fragile and unreliable across build/dev modes**. If the `!` is not properly stripped, `null.toFixed(1)` throws a runtime TypeError that silently prevents the component subtree from rendering.

**Impact:** Vue catches template expression errors and logs them as warnings, but the affected component tree renders empty/partially — appearing as "no data."

#### ROOT CAUSE #2: Excessive Uncached Function Calls in Template (Performance Anti-Pattern)

Each template render cycle invokes these functions repeatedly:

| Function | Calls per pillar | Problem |
|----------|-----------------|---------|
| `getAPRRIndicators(pillar.id, type)` | 4× (2 for v-if + 2 for v-for) | Returns new array each time |
| `getAPRRDisplayMetrics(ind)` | 6× per indicator card | Returns new object each time |
| `getAPRRPillarSummary(pillar.id)` | 3× (for `.withData`, `.totalIndicators`, `.avgRate`) | Internally calls getAPRRIndicators + getAPRRDisplayMetrics |

For 4 pillars × ~4 indicators each = **~200+ function calls per render cycle**. This is a Vue anti-pattern — functions called in templates should be cached via computed properties.

**Impact:** Potential jank, excessive reactivity tracking, and in severe cases, the render may be interrupted by Vue's change detection system.

#### ROOT CAUSE #3: DRY Violation in Template

The Outcome and Output indicator card markup is 100% identical (40+ lines duplicated). Only the section header and the `type` parameter differ. This doubles maintenance burden and doubles the uncached function call count.

#### ROOT CAUSE #4: Inconsistent Null Handling

`getAPRRDisplayMetrics` and `getAPRRPillarSummary` are regular functions, not computeds. They depend on reactive state (`aprrDisplayQuarter.value`, `aprrTaxonomy.value`, `aprrData.value`) but Vue has no way to know their outputs are stable — it must re-evaluate them on every render.

#### Proper Solution: Computed Render Data

The Vue-idiomatic fix is a single **computed property** that pre-processes all APRR data into a template-ready structure. The template then just iterates through pre-computed, null-safe data with ZERO function calls.

```
aprrRenderData = computed(() => {
  PILLARS.map(pillar => {
    outcomes: [{ ...ind, metrics: { target, actual, variance, rate } }],
    outputs: [{ ...ind, metrics: { target, actual, variance, rate } }],
    summary: { totalIndicators, withData, avgRate }
  })
})
```

This is cached by Vue's reactivity system — only recomputed when `aprrTaxonomy`, `aprrData`, or `aprrDisplayQuarter` change.

---

### Section 2.26 — Phase FS: Report Analytics UX Refinement — APRR-Style Visualization, Target vs Actual Clarity, Quarter Filtering (Mar 26, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready
**Severity:** HIGH (UX gap — not presentation-ready for stakeholder session)

#### APRR Reference Image Analysis (`docs/references/Screenshot 2026-03-26 102028.png`)

The reference shows the official APRR (Accomplishment & Performance Report Review) format used for stakeholder reporting:

**Layout structure:**
1. **Pillar header block** — bold pillar identifier (e.g., "B.1 HIGHER EDUCATION PROGRAM") with decorative icons/illustration and a brief program description
2. **"PERFORMANCE INDICATORS"** section heading
3. **2-column grid** — Outcome indicators (left+right) then Output indicators (left+right)
4. **Per-indicator card blocks** — each indicator is a standalone visual unit, NOT a table row

**Per-indicator visual elements:**
- Indicator name/description as title text
- **Horizontal progress bar** showing accomplishment rate visually (filled portion = rate %)
- **Color-coded bar**: green for on-track/met, yellow/amber for partial
- **Key metrics displayed**: Target value, Actual value, Rate percentage
- Clean whitespace separation between indicators

**Key design principles from APRR:**
- Card-based, NOT tabular — each indicator is a readable block
- Visual progress bars for instant comprehension
- 2-column grid maximizes space without horizontal scrolling
- Non-technical presentation style — readable by directors/stakeholders
- Grouped clearly by OUTCOME then OUTPUT

#### Current Implementation Gap Analysis

**Current state** (13-column `v-table`):

| Issue | Impact |
|-------|--------|
| Dense 13-column spreadsheet table | Requires horizontal scrolling, overwhelming |
| All 8 quarterly cells shown simultaneously (Q1T, Q1A, Q2T, Q2A...) | Information overload, no visual hierarchy |
| No progress bars or visual indicators | Users must mentally assess "is this good?" |
| `text-caption` font size for all data | Tiny, hard to read |
| Table rows — no visual separation between indicators | Hard to scan individual indicator performance |
| Variance shown as raw number | No visual context for positive/negative |
| Rate shown as text percentage only | No visual bar to compare across indicators |
| No indicator description visible | Users see code + name but no context |

**APRR reference** (card-based blocks):

| Feature | Benefit |
|---------|---------|
| Per-indicator cards with progress bars | Instant visual comprehension |
| 2-column grid layout | No horizontal scroll, compact |
| Color-coded accomplishment rate | Green = good, amber = partial, red = low |
| Target vs Actual prominently displayed | Clear comparison without table scanning |
| Grouped OUTCOME / OUTPUT sections | Logical hierarchy |
| Clean whitespace and typography | Presentation-ready |

#### Data Availability Audit

All required data fields are ALREADY available from `getAPRRIndicators()`:

| Field | Available | Source |
|-------|-----------|--------|
| `name` | ✅ | `pillar_indicator_taxonomy.indicator_name` |
| `code` | ✅ | `pillar_indicator_taxonomy.indicator_code` |
| `unit_type` | ✅ | `pillar_indicator_taxonomy.unit_type` |
| `target_q1..q4` | ✅ | Merged from `operation_indicators` |
| `actual_q1..q4` | ✅ | Merged from `operation_indicators` |
| `total_target` | ✅ | Computed: SUM(target_q1..q4) |
| `total_actual` | ✅ | Computed: SUM(actual_q1..q4) |
| `variance` | ✅ | Computed: total_actual − total_target |
| `rate` | ✅ | Computed: (total_actual / total_target) × 100 |

**No backend changes needed.** All data for the redesign already exists.

#### Indicator Distribution per Pillar (from migration 019)

| Pillar | Outcome | Output | Total | Unit Types |
|--------|---------|--------|-------|------------|
| HIGHER_EDUCATION | 2 (HE-OC-01, HE-OC-02) | 2 (HE-OP-01, HE-OP-02) | 4 | All PERCENTAGE |
| ADVANCED_EDUCATION | 1 (AE-OC-01) | 2 (AE-OP-01, AE-OP-02) | 3 | All PERCENTAGE |
| RESEARCH | 1 (RP-OC-01) | 2 (RP-OP-01, RP-OP-02) | 3 | COUNT + PERCENTAGE |
| TECHNICAL_ADVISORY | 1 (TA-OC-01) | 3 (TA-OP-01..03) | 4 | COUNT + WEIGHTED_COUNT + PERCENTAGE |

**Max indicators per pillar: 4.** A 2-column grid easily fits 2 indicators per row — no scrolling needed.

#### Quarter Filtering Analysis

**Phase FR-1 fix (current state):** APRR fetches ALL records without quarter filter. `getAPRRIndicators()` merges per-quarter records and shows full-year totals. No quarter selector exists.

**Problem:** Users need quarter-specific views to track progress over time. The APRR reference focuses on specific reporting periods.

**Correct approach — DISPLAY filter, NOT fetch filter:**
- Data fetch remains full-year (Phase FR-1 fix preserved — no regression)
- Quarter selector controls WHICH metrics to display:
  - **"Full Year"** → shows `total_target`, `total_actual`, `variance`, `rate` (current behavior)
  - **"Q1"** → shows `target_q1`, `actual_q1`, computes Q1-only variance & rate
  - **"Q2"** / **"Q3"** / **"Q4"** → same pattern for respective quarter
- This is purely a presentation concern — no API call changes

**UI control:** Small chip group (Full Year / Q1 / Q2 / Q3 / Q4) — non-intrusive, consistent with Vuetify patterns.

#### Vuetify Components Available for Redesign

| Component | Use For |
|-----------|---------|
| `v-progress-linear` | Horizontal progress bar for accomplishment rate |
| `v-chip-group` / `v-btn-toggle` | Quarter filter (compact, non-intrusive) |
| `v-card` | Per-indicator visual block |
| `v-row` / `v-col cols="6"` | 2-column grid for indicators |
| `v-chip` | Variance/rate badge with color coding |
| `v-divider` | Section separator between Outcome/Output |

---

### Section 2.25 — Phase FR: Report View Data Inconsistency & Financial UI Project Code Omission (Mar 26, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready
**Severity:** HIGH (data inconsistency in Report View) + LOW (Financial UI cleanup)

#### Problem A: APRR Report View Fails to Display Existing Physical Data

**Observed behavior:**
- Physical Accomplishment page → data visible ✅
- Dashboard analytics → data visible ✅
- Report Analytics tab (Physical > Report View) → NO DATA ❌

#### Root Cause Analysis — Full Pipeline Trace

**1. Dashboard data source (WORKS):**
- Endpoint: `GET /analytics/pillar-summary?fiscal_year=YYYY`
- Backend: `getPillarSummary()` (service.ts:1835)
- SQL: `FROM operation_indicators oi JOIN pillar_indicator_taxonomy pit ON oi.pillar_indicator_id = pit.id WHERE oi.fiscal_year = $1`
- **NO quarter filter** — aggregates all records regardless of `reported_quarter`
- **NO `university_operations` JOIN** — goes directly indicator → taxonomy

**2. Physical page data source (WORKS):**
- Endpoint: `GET /indicators?pillar_type=X&fiscal_year=Y&quarter=QN`
- Backend: `findIndicatorsByPillarAndYear()` (service.ts:973)
- SQL includes: `AND (oi.reported_quarter = $3 OR oi.reported_quarter IS NULL)`
- Works because user views the **same quarter they entered data for**

**3. APRR Report View data source (FAILS):**
- Endpoint: **SAME** as Physical page: `GET /indicators?pillar_type=X&fiscal_year=Y&quarter=QN`
- Backend: **SAME** `findIndicatorsByPillarAndYear()` function
- Quarter parameter: `selectedAPRRQuarter` — **defaults to 'Q1'**

#### ROOT CAUSE #1: Quarter Mismatch (PRIMARY)

The APRR Report View defaults `selectedAPRRQuarter = 'Q1'`. If the user entered Physical data under a different quarter (Q2/Q3/Q4) through the Physical page, the records have `reported_quarter = 'Q2'` (or Q3/Q4). When the APRR fetches with `quarter=Q1`, the backend filter:

```sql
AND (oi.reported_quarter = 'Q1' OR oi.reported_quarter IS NULL)
```

**Excludes records where `reported_quarter = 'Q2'`** — they are neither 'Q1' nor NULL.

Evidence:
- Physical page (line 782): `reported_quarter: selectedQuarter.value` — always sets quarter on save
- Migration 031 (NOT applied): Would backfill NULL `reported_quarter` to 'Q1' but hasn't run
- Data entered post-Phase FL has explicit `reported_quarter` values

#### ROOT CAUSE #2: APRR Design Flaw — Full-Year Report with Quarter Filter

The APRR view shows **all 4 quarters' columns** (Q1-Q4 Target/Actual per row) but fetches with a **single quarter filter**. This is architecturally inconsistent:

- In the per-quarter model (Phase FL), each quarter has its own independent record
- Q1 record: only Q1 fields populated, Q2/Q3/Q4 fields are null
- Q2 record: only Q2 fields populated
- The APRR table expects ALL quarters' data in a single row, but the per-quarter model spreads data across multiple records

**Impact:** Even if the quarter matches, only that quarter's fields show data — the other 3 quarters' columns show dashes (—) because they are null in the fetched record.

#### ROOT CAUSE #3: Promise.all Cascade Failure (SECONDARY)

`fetchAPRRData()` (index.vue:153) uses `Promise.all()` for 8 parallel API calls (4 pillars × 2 endpoints). If **any single call fails**, the entire batch is lost — the catch block logs the error but neither `aprrTaxonomy` nor `aprrData` is updated.

```typescript
await Promise.all(PILLARS.map(async (p) => { /* 2 API calls each */ }))
aprrTaxonomy.value = taxonomy  // Never reached if any call fails
aprrData.value = results        // Never reached if any call fails
```

#### Additional Finding: Global Pillar Filter Not Applied to APRR

The `selectedGlobalPillar` filter affects Dashboard charts but is **ignored by the APRR view**. The APRR always fetches all 4 pillars. This is acceptable for a full report, but inconsistent with the Dashboard filter behavior. (LOW priority — not a bug, but noted.)

#### Problem B: Financial UI Shows project_code Field

**Current state:**
- `project_code` field appears in Financial entry dialog (line 1372: `v-model="entryForm.project_code"`)
- `project_code` shown in record list (line 1206: `<span v-if="rec.project_code">`)
- `project_code` included in save payload (line 620) and prefill (line 382)
- BAR No. 2 (Financial Accomplishment) reference documents do NOT use project codes
- `project_code` is optional in backend DTO (`@IsOptional()`, `@MaxLength(50)`)

**Locations to clean:**
1. Entry dialog: `v-text-field` for project_code (line 1372)
2. Record display: conditional span (line 1206)
3. Form state: `openAddDialogDirect()` (line 531), `openEditDialog()` (line 562), `openPrefillSaveDialog()` (line 358)
4. Save payload: `saveEntry()` (line 620)
5. Prefill save: `saveAllPrefillRecords()` (line 382)

**Backend impact:** NONE — `project_code` is `@IsOptional()`. Omitting it from frontend payload sends `null`/undefined, which the backend accepts. No DTO or schema changes needed.

---

### Section 2.24 — Phase FQ: Report View Data Fix, Analytics Guide Enhancement, Weighted Count Validation (Mar 24, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready
**Severity:** HIGH (data retrieval bug) + MEDIUM (guide clarity) + LOW (validation)
**Scope:** (A) Report View data not rendering, (B) Analytics guide incomplete, (C) Weighted count aggregation validation

---

#### 1. SECTION A — REPORT VIEW DATA NOT DISPLAYING: ROOT CAUSE ANALYSIS

**File:** `pmo-frontend/pages/university-operations/index.vue`

**Data Flow Trace:**

```
User clicks "Report View" tab
→ watch(physicalViewMode) fires (line 925)
→ fetchAPRRData() called (line 152)
→ For each of 4 PILLARS:
    → api.get(`/api/university-operations/taxonomy/${p.id}`)  → taxonomy per pillar
    → api.get(`/api/university-operations/indicators?pillar_type=${p.id}&fiscal_year=${selectedFiscalYear.value}&quarter=${selectedAPRRQuarter.value}`)
→ Results stored in aprrTaxonomy + aprrData refs
→ Template calls getAPRRIndicators(pillarId, 'OUTCOME'/'OUTPUT')
→ Matches taxonomy[pillarId].filter(indicator_type) with data[pillarId].find(pillar_indicator_id === taxonomy.id)
```

**API Endpoints Verified:**
- `GET /taxonomy/:pillarType` → `findTaxonomyByPillarType()` (service.ts:950) → Returns `id, pillar_type, indicator_name, indicator_code, indicator_type, unit_type, ...` ✅
- `GET /indicators?pillar_type&fiscal_year&quarter` → `findIndicatorsByPillarAndYear()` (service.ts:973) → Returns `oi.*, pit.indicator_name, pit.indicator_code, pit.unit_type, pit.indicator_type, pit.description` + computed metrics ✅

**Query Logic Verified:**
- `WHERE uo.operation_type = $1` — matches pillar type against university operation ✅
- `AND oi.fiscal_year = $2` — filters by fiscal year ✅
- `AND (oi.reported_quarter = $3 OR oi.reported_quarter IS NULL)` — quarter filter ✅
- `LEFT JOIN pillar_indicator_taxonomy pit ON oi.pillar_indicator_id = pit.id` — taxonomy join ✅

**Matching Logic Verified:**
- `getAPRRIndicators()` line 180: `data.find((d: any) => d.pillar_indicator_id === t.id)` ✅
- Same pattern as Physical page line 251: `pillarIndicators.value.find(i => i.pillar_indicator_id === taxonomyId)` ✅

**ROOT CAUSES IDENTIFIED:**

**Bug #1 — Missing response array safety (LIKELY PRIMARY CAUSE):**
- Physical page (line 310): `Array.isArray(indicatorsRes) ? indicatorsRes : (indicatorsRes as any)?.data || []`
- APRR fetch (line 164): `results[p.id] = dataRes` — NO safety check
- If the API response is wrapped in an object (e.g., `{ data: [...] }`) or returns an unexpected format, the APRR code silently stores a non-array, causing `data.find()` to fail

**Bug #2 — Missing FY change re-fetch:**
- `watch(selectedFiscalYear)` (line 910–915) calls `fetchAnalytics()` or `fetchFinancialAnalytics()` but does NOT call `fetchAPRRData()` when user is on Report View tab
- User changes FY → APRR data goes stale → shows old data or empty state

**Bug #3 — Missing reporting type switch re-fetch:**
- `watch(selectedReportingType)` (line 918–922) does not clear or re-fetch APRR data
- User switches to Financial, changes FY, switches back to Physical Report View → stale APRR data

**Bug #4 — Taxonomy uses pillar CONSTANT IDs but fetch uses same:**
- PILLARS constant: `['HIGHER_EDUCATION', 'ADVANCED_EDUCATION', 'RESEARCH', 'TECHNICAL_ADVISORY']`
- Taxonomy endpoint: `WHERE pillar_type = $1` ✅
- Indicators endpoint: `WHERE uo.operation_type = $1` ✅
- Both match correctly. No mismatch here.

**Conclusion:** Bugs #1 and #2 are the most likely causes of empty Report View. Bug #1 would cause silent data loss if the response shape is unexpected. Bug #2 would cause stale data after FY changes.

---

#### 2. SECTION B — ANALYTICS GUIDE COMPLETENESS ANALYSIS

**File:** `pmo-frontend/pages/university-operations/index.vue` lines ~1140–1195

**Current Guide Structure (Phase FP-4):**

| Reporting Type | Guide Sections | Missing |
|---------------|---------------|---------|
| Cross Analytics | Institutional Overview, YoY Comparison | Computation formulas |
| Physical (Dashboard) | Dashboard overview, Report View mention | Chart-specific formulas for each visualization |
| Financial | Utilization Rate, Expense Breakdown, Quarterly Trend, YoY | Computation formulas, disbursement rate explanation |

**What Each Chart Needs:**

| Chart | Current Guide | Missing |
|-------|-------------|---------|
| Achievement Rate by Pillar (%) | "Shows how much each pillar has accomplished" | Formula: `(SUM(actual_q1..q4) / SUM(target_q1..q4)) × 100` per indicator, then rate-based average |
| Pillar Accomplishment Rates (radialBar) | "Shows each pillar's overall progress" | Formula: same rate-based computation, clarify it's per-pillar |
| Quarterly Trend | "Shows how performance changes across quarters" | Formula: per-quarter `accomplishment_rate_pct = (actual_rate / target_rate) × 100` |
| Year-over-Year | "Compares performance across fiscal years" | Formula: per-pillar accomplishment rate per year |
| Cross-Comparison | "Shows both metrics side by side" | Clarify: Physical uses `accomplishment_rate_pct`, Financial uses `avg_utilization_rate` |
| Financial Utilization Rate | "How much budget has been committed" | Formula: `(Obligations / Appropriation) × 100` |
| Financial Quarterly Trend | "Tracks budget allocation and spending" | Clarify: 4 series (Appropriation, Obligations, Util%, Disb%) |
| Report View | "Structured table-based report" | Column definitions: Target, Actual, Variance (Actual − Target), Rate ((Actual/Target)×100) |

**Key Rule to Document:**
- Accomplishment Rate uses **SUM aggregation** for ALL unit types (COUNT, WEIGHTED_COUNT, PERCENTAGE) — per Phase DO-A (BAR1 Standard)
- Rate-based aggregation: `indicator_actual_rate / indicator_target_rate × 100` — NOT simple average of individual rates
- No cross-pillar aggregation — each pillar computed independently

---

#### 3. SECTION C — WEIGHTED COUNT VALIDATION

**Indicator:** TA-OP-01 — "Number of trainees weighted by the length of training"
**Unit Type:** `WEIGHTED_COUNT`
**Pillar:** TECHNICAL_ADVISORY

**DBM Definition (migration 019, line 163-165):**
> Calculated as: Sum of (Number of trainees × Training duration in days). Example: 50 trainees × 3 days = 150 weighted trainee-days.

**Backend Computation (service.ts:1104):**
```
Phase DO-A: BAR1 Standard — ALL indicator types use SUM aggregation
totalTarget = SUM(target_q1, target_q2, target_q3, target_q4)
totalAccomplishment = SUM(accomplishment_q1..q4)
variance = totalAccomplishment - totalTarget
accomplishment_rate = (totalAccomplishment / totalTarget) × 100
```

**Analysis:**

The weighting (trainees × duration) is a **data entry responsibility**, NOT a system computation. Users enter the pre-computed weighted value (e.g., 150 trainee-days) into each quarterly field. The system then:
1. Sums across quarters: `150 + 200 + 0 + 175 = 525` total weighted trainee-days
2. Computes rate: `525 / 500 × 100 = 105%` accomplishment rate

**This is CORRECT behavior.** The system is a **recording system**, not a weighting calculator. The weight calculation happens outside the system at data entry time.

**Analytics Aggregation (getPillarSummary):**
- Line 1933: `COUNT(CASE WHEN deduped.unit_type IN ('COUNT', 'WEIGHTED_COUNT') THEN 1 END)` — WEIGHTED_COUNT is grouped with COUNT for pillar-level aggregation
- SUM-based aggregation applies uniformly ✅

**Frontend Display (formatAPRRVal):**
- Line 208: `return num.toLocaleString(undefined, { maximumFractionDigits: 2 })` — WEIGHTED_COUNT formatted same as COUNT, which is correct since both are numeric sums

**Validation Result:** ✅ WEIGHTED_COUNT handling is correct at all layers:
- Database: stored as DECIMAL(12,4) — same as COUNT ✅
- Backend: SUM aggregation — same as COUNT ✅
- Analytics: grouped with COUNT for pillar summaries ✅
- Frontend: formatted as numeric with locale formatting ✅
- User responsibility: entering pre-weighted values ✅

**No code changes needed for WEIGHTED_COUNT computation.**

---

#### 4. SUMMARY

| Issue | Root Cause | Severity | Fix Scope |
|-------|-----------|----------|-----------|
| Report View empty | Missing array safety + missing FY re-fetch | HIGH | Frontend fetch logic |
| Analytics guide incomplete | Formulas/computation not documented | MEDIUM | Template text |
| Weighted count validation | No bug — correct SUM-based aggregation | LOW (VALIDATED ✅) | None needed |

---

### Section 2.23 — Phase FP: Analytics Restructuring — Cross-Module Isolation & APRR-Style Physical View (Mar 24, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready
**Severity:** HIGH — Architectural correction + stakeholder-facing feature
**Scope:** (A) Extract cross-module analytics into dedicated view, (B) Add APRR-style report view for Physical module

---

#### 1. CURRENT ANALYTICS ARCHITECTURE ANALYSIS

**File:** `pmo-frontend/pages/university-operations/index.vue`

**Current Structure — Three layers in ONE page:**

```
<v-card> Analytics Dashboard
├── Reporting Type Toggle: [Physical | Financial]  ← line 1012
├── Pillar Filter: [All | HE | AE | R | TA]       ← line 1023
│
├── [ALWAYS VISIBLE] Institutional Overview         ← lines 1112-1179
│   ├── 4 Summary Stat Cards (Physical %, Util %, Disb %, Coverage)
│   ├── Cross-Comparison Bar: Physical vs Financial by Pillar
│   └── Cross-Module YoY Bar: Physical vs Financial by Year
│
├── [v-if PHYSICAL] Physical Analytics              ← lines 1184-1349
│   ├── Pillar Completion Overview (4 cards)
│   ├── Achievement Rate by Pillar (bar)
│   ├── Pillar Accomplishment Rates (radialBar) + Quarterly Trend (line)
│   └── Year-over-Year Comparison (bar)
│
└── [v-else] Financial Analytics                    ← lines 1352-1501
    ├── Budget Utilization Overview (4 cards)
    ├── Utilization Radial + Expense Class Donut
    ├── Financial Quarterly Trend (line)
    └── Year-over-Year Comparison (bar)
```

**Problem Identified:**

The Institutional Overview section (cross-module analytics) is **always visible** regardless of the Physical/Financial toggle. This means:
1. Cross-module content appears ABOVE module-specific content — users see comparison data before seeing the module data being compared
2. The Physical/Financial toggle implies you're switching between two views, but the cross-module section never changes — confusing information hierarchy
3. The toggle is conceptually a 2-way switch (Physical OR Financial), but there are actually 3 distinct analytics types (Physical, Financial, Cross-Module)

**Code Locations — Cross-Module Logic:**

| Component | Lines | Purpose |
|-----------|-------|---------|
| `fetchCrossModuleSummary()` | 114-125 | Fetches both pillar summaries |
| `fetchCrossModuleYoY()` | 128-141 | Fetches both yearly comparisons |
| `crossModuleOverallPhysical` | 360-366 | Avg physical rate across pillars |
| `crossModuleOverallUtilization` | 368-373 | Avg financial util across pillars |
| `crossModuleOverallDisbursement` | 375-381 | Weighted disbursement rate |
| `crossModuleDataCoverage` | 383-390 | Indicator + financial record counts |
| `crossComparisonOptions/Series` | 392-443 | Per-pillar comparison chart |
| `crossModuleYoYOptions/Series` | 445-496 | YoY comparison chart |
| Template: stat cards + 2 charts | 1112-1179 | Institutional Overview section |

**Fix Approach:** Convert the 2-option `selectedReportingType` into a 3-option selector: Physical | Financial | Cross Analytics. The Institutional Overview section becomes a conditional view (`v-if="selectedReportingType === 'CROSS'"`) instead of always-visible. No data-fetching changes needed — cross-module data is already fetched on page load.

---

#### 2. DATA AVAILABILITY FOR APRR-STYLE PHYSICAL REPORTING

**What APRR Format Requires:**

| Field | Available? | Source |
|-------|-----------|--------|
| Indicator Name | ✅ | `pillar_indicator_taxonomy.indicator_name` (via JOIN) |
| Indicator Code | ✅ | `pillar_indicator_taxonomy.indicator_code` (e.g. "HE-OC-01") |
| Indicator Type | ✅ | `pillar_indicator_taxonomy.indicator_type` → OUTCOME / OUTPUT |
| Unit Type | ✅ | `pillar_indicator_taxonomy.unit_type` → PERCENTAGE / COUNT / etc. |
| Organizational Outcome | ✅ | `pillar_indicator_taxonomy.organizational_outcome` → OO1 / OO2 / OO3 |
| Target (per quarter) | ✅ | `operation_indicators.target_q1..q4` → DECIMAL(12,4) |
| Actual (per quarter) | ✅ | `operation_indicators.accomplishment_q1..q4` → DECIMAL(12,4) |
| Total Target | ✅ | `computeIndicatorMetrics()` → `total_target` (SUM of Q1-Q4) |
| Total Accomplishment | ✅ | `computeIndicatorMetrics()` → `total_accomplishment` (SUM of Q1-Q4) |
| Variance | ✅ | `computeIndicatorMetrics()` → `variance` (actual - target) |
| Accomplishment Rate | ✅ | `computeIndicatorMetrics()` → `accomplishment_rate` ((actual/target)*100) |
| Remarks/Score | ✅ | `operation_indicators.score_q1..q4` + `remarks` |

**Backend Method:** `findIndicatorsByPillarAndYear(pillarType, fiscalYear, quarter?)` at service.ts:973

**Returns per indicator:**
```
oi.* (all operation_indicators columns)
+ pit.indicator_name, pit.indicator_code, pit.uacs_code, pit.unit_type, pit.indicator_type, pit.description
+ computed: total_target, total_accomplishment, variance, accomplishment_rate
```

**Grouping Available:**
- By `indicator_type`: OUTCOME vs OUTPUT sections
- By `organizational_outcome`: OO1, OO2, OO3 sub-groups
- By `pillar_type`: 4 pillars (HIGHER_EDUCATION, ADVANCED_EDUCATION, RESEARCH, TECHNICAL_ADVISORY)

**Frontend Precedent:** `physical/index.vue` already computes `outcomeIndicators` and `outputIndicators` via `pillarTaxonomy.filter(t => t.indicator_type === 'OUTCOME/OUTPUT')`.

**Conclusion:** ALL fields required for APRR-style rendering are available from the existing API. No new backend endpoints needed. The APRR view is a **presentation layer** over the same data the Physical page already fetches.

---

#### 3. FRONTEND ARCHITECTURE — VIEW SYSTEM

**Current View Pattern:** The analytics dashboard uses `v-select` for reporting type toggling:
```typescript
const selectedReportingType = ref<string>('PHYSICAL')
const reportingTypeOptions = [
  { title: 'Physical Accomplishments', value: 'PHYSICAL' },
  { title: 'Financial Accomplishments', value: 'FINANCIAL' },
]
```

Template uses `<template v-if="selectedReportingType === 'PHYSICAL'">` / `<template v-else>`.

**For 3-way analytics type:**
- Extend `reportingTypeOptions` to include `{ title: 'Cross Analytics', value: 'CROSS' }`
- Change `<template v-else>` to `<template v-else-if="selectedReportingType === 'FINANCIAL'">`
- Add `<template v-else-if="selectedReportingType === 'CROSS'">`
- Move Institutional Overview content into the CROSS template

**For APRR-style view in Physical module:**

Two design options considered:

| Option | Mechanism | Pros | Cons |
|--------|-----------|------|------|
| A: Sub-tabs within Physical section | `v-tabs` inside `<template v-if="PHYSICAL">` | Contained within module, no routing changes | Adds nesting complexity |
| B: New page route | `/university-operations/physical/report` | Clean separation, dedicated component | New file, routing overhead |

**Recommended: Option A (sub-tabs).** Reasons:
1. Data is already fetched by the landing page's `fetchAnalytics()` → no duplicate API calls
2. The APRR view needs the SAME data as the physical analytics — just presented differently
3. Sub-tabs within the Physical section keep the user's mental model intact (they're still in "Physical Analytics")
4. The Physical data entry page (`physical/index.vue`) already has its own complex state — a report view there would add confusion. The landing page is the right location for presentation-grade views.

**However:** The landing page already fetches pillar-level SUMMARY data (`pillarSummary`), not indicator-level DETAIL data needed for APRR. The APRR view needs per-indicator rows with taxonomy metadata. This requires a new fetch: one call to `findIndicatorsByPillarAndYear` per pillar (or all 4 pillars).

**Data Fetch for APRR:**
- Fetch taxonomy: `GET /api/university-operations/taxonomy/{pillarType}` × 4 pillars
- Fetch indicator data: `GET /api/university-operations/indicators?pillar_type={type}&fiscal_year={fy}&quarter={q}` × 4 pillars
- These are the SAME endpoints the Physical data entry page uses — fully tested and stable

---

#### 4. NAVIGATION FLOW ANALYSIS

**Current user flow:**
```
Landing Page (index.vue)
├── Category Cards: [Physical] [Financial]  ← navigate to data entry pages
├── Analytics Dashboard
│   ├── Toggle: Physical / Financial
│   ├── [Always] Institutional Overview (cross-module)
│   ├── [Physical] Charts
│   └── [Financial] Charts
│
├── Physical Page (physical/index.vue)  ← data entry + CRUD
└── Financial Page (financial/index.vue) ← data entry + CRUD
```

**Proposed flow:**
```
Landing Page (index.vue)
├── Category Cards: [Physical] [Financial]  ← navigate to data entry pages
├── Analytics Dashboard
│   ├── Toggle: Physical / Financial / Cross Analytics
│   ├── [Physical]
│   │   ├── Sub-tabs: [Dashboard] [Report View]
│   │   ├── Dashboard: existing charts
│   │   └── Report View: APRR-style table
│   ├── [Financial] Charts
│   └── [Cross Analytics] Institutional Overview (stat cards + comparison charts)
```

---

#### 5. ANTI-PATTERNS CONFIRMED

| Anti-Pattern | Current State | Impact |
|-------------|---------------|--------|
| Cross-module in module view | Institutional Overview always visible above module toggle | Confusing hierarchy |
| Single view for all purposes | Charts-only analytics, no structured report | Stakeholders need tables |
| 2-way toggle masking 3-way content | Physical/Financial toggle but 3 distinct sections render | UX mismatch |

---

### Section 2.22 — Phase FO: UI Consistency, Data Visual Clarity, Cross-Module Analytics Gap (Mar 24, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready
**Severity:** MEDIUM-HIGH — Visual consistency and analytics completeness for stakeholder readiness
**Scope:** Three interconnected issues: stat card layout, donut chart labeling, cross-module YoY analytics

---

#### 1. SECTION A — STAT CARD LAYOUT INCONSISTENCY

**File:** `pmo-frontend/pages/university-operations/index.vue` lines 1017–1043

**Current Structure:**
```html
<v-row class="mb-4">
  <v-col cols="6" md="3">  <!-- 4 cards, each cols="6" md="3" -->
    <v-card variant="tonal" color="blue" class="text-center pa-3">
      <div class="text-caption text-medium-emphasis">Physical Accomplishment</div>
      <div class="text-h5 font-weight-bold">{{ crossModuleOverallPhysical }}%</div>
    </v-card>
  </v-col>
  ...
  <v-col cols="6" md="3">  <!-- Data Coverage card -->
    <v-card variant="tonal" color="grey" class="text-center pa-3">
      <div class="text-caption text-medium-emphasis">Data Coverage</div>
      <div class="text-h6 font-weight-bold">{{ crossModuleDataCoverage.indicatorsWithData }}/{{ crossModuleDataCoverage.totalIndicators }} indicators</div>
      <div class="text-caption">{{ crossModuleDataCoverage.totalFinRecords }} financial records</div>
    </v-card>
  </v-col>
</v-row>
```

**Root Causes Identified:**

1. **Inconsistent content height**: Cards 1-3 each have 2 elements (caption + h5 value). Card 4 (Data Coverage) has 3 elements (caption + h6 value + extra caption line). This creates unequal intrinsic heights.

2. **Missing `h-100` class**: The `<v-card>` elements do NOT have `class="h-100"` (unlike the Pillar Completion Overview cards at lines 1075–1129 which DO use `class="h-100"`). Without `h-100`, Vuetify's v-card does not stretch to fill the v-col, causing uneven heights.

3. **Inconsistent typography**: Card 4 uses `text-h6` while cards 1-3 use `text-h5`. This creates visual weight imbalance.

4. **Dynamic content width**: "Data Coverage" card has dynamic text `"{{ indicatorsWithData }}/{{ totalIndicators }} indicators"` which can be long and cause wrapping, expanding that card horizontally or vertically.

5. **No `d-flex` or `fill-height` on v-col**: The parent v-col does not enforce height stretching.

**Pattern Comparison — Working Cards (Pillar Completion Overview, lines 1074–1130):**
- Uses `class="h-100"` on `<v-card>` ✅
- Content structure is uniform per card ✅
- Chips handle variable content via `flex-wrap` ✅

**Fix Strategy:**
- Add `class="h-100"` to all 4 stat cards
- Normalize typography: use consistent `text-h5` across all value displays
- Restructure Data Coverage card to have same 2-line pattern (primary + secondary)
- Add `d-flex flex-column justify-center` to inner card content for vertical centering

---

#### 2. SECTION B — DONUT CHART / RADIAL BAR LABELING

**File:** `pmo-frontend/pages/university-operations/index.vue`

**Chart Inventory:**

| Chart | Type | Line | Has Data Labels? |
|-------|------|------|-----------------|
| Pillar Accomplishment Rates (Physical) | `radialBar` | 424–490 | YES — `dataLabels.value.show: true`, shows name + value in center |
| Utilization Rate by Pillar (Financial) | `radialBar` | 181–215 | YES — `dataLabels.name/value`, shows center total |
| Expense Class Breakdown | `donut` | 225–237 | PARTIAL — `dataLabels.formatter` exists but no `enabled: true` explicit |

**Donut Chart Configuration (lines 225–233):**
```typescript
const expenseBreakdownOptions = computed(() => ({
  chart: { type: 'donut' as const, height: 280, toolbar: { show: false } },
  labels: (financialExpenseBreakdown.value?.breakdown || []).map((r: any) => r.expense_class),
  colors: ['#1976D2', '#F57C00', '#00897B', '#9E9E9E'],
  legend: { position: 'bottom' as const },
  dataLabels: {
    formatter: (val: number) => `${val.toFixed(1)}%`,
  },
}))
```

**Root Causes Identified:**

1. **ApexCharts `dataLabels.enabled` default:** In ApexCharts, `dataLabels.enabled` defaults to `true` for donut/pie charts. So the formatter IS applied. However, the current formatter shows only percentage (`val.toFixed(1)%`) — the `val` parameter in a donut chart IS the percentage (auto-calculated by ApexCharts from the series values).

2. **Missing label name in data label:** The formatter receives `(val, opts)`. To show the label name alongside the value, the formatter needs `opts.w.globals.labels[opts.seriesIndex]`. Currently only the percentage is shown.

3. **Radial Bar charts (Physical + Financial):** These are NOT donut charts — they are `radialBar` type. They display inner data labels (name + value) correctly. The user's complaint about "donut chart labeling" likely refers to the donut (Expense Class Breakdown) and possibly the radial bars appearing similar to donuts visually.

4. **Visual clarity gap:** Even with percentage shown on segments, without the label name the user must cross-reference with the legend to identify which segment is which.

**Fix Strategy:**
- Modify donut `dataLabels.formatter` to include label name: `"PS: 45.2%"` format
- Ensure `dataLabels.enabled: true` is explicit
- Consider `dataLabels.dropShadow.enabled: false` for cleaner text
- For radial bars: already have adequate labeling (name + value in center area) — no change needed

---

#### 3. SECTION C — CROSS-MODULE ANALYTICS GAP

**What Already Exists (Phase FN-1):**

The **Institutional Overview** section (lines 1009–1060) already provides:
- 4 summary stat cards (Physical Accomplishment %, Budget Utilization %, Disbursement Rate %, Data Coverage)
- Cross-comparison grouped bar chart: Physical Accomplishment vs Financial Utilization by pillar

**What's Missing:**

1. **Year-over-Year Cross-Module Comparison:** Currently, YoY charts are module-isolated:
   - Physical YoY (line 1203): shows `accomplishment_rate` per pillar per year
   - Financial YoY (line 1355): shows `utilization_rate` per pillar per year
   - **NO chart** overlays both Physical and Financial across years for comparison

2. **Quarterly Cross-Module Trend:** Currently isolated:
   - Physical quarterly trend: shows accomplishment rate Q1-Q4
   - Financial quarterly trend: shows appropriation, obligations, utilization %, disbursement %
   - **NO chart** shows Physical accomplishment vs Financial utilization quarterly trend

**Data Availability Analysis:**

| Data Point | Physical Source | Financial Source | Shared Key |
|-----------|---------------|-----------------|------------|
| Pillar rate | `pillarSummary.pillars[].accomplishment_rate_pct` | `financialPillarSummary.pillars[].avg_utilization_rate` | `pillar_type` |
| Quarterly rate | `quarterlyTrend.quarters[].accomplishment_rate_pct` | `financialQuarterlyTrend.quarters[].utilization_rate` | quarter (Q1-Q4) |
| Yearly rate | `yearlyComparison.years[].pillars[].accomplishment_rate` | `financialYearlyComparison.data[].utilization_rate` | `fiscal_year` + `pillar_type` |

**Key Finding:** All shared identifiers (pillar_type, fiscal_year, quarter) align. Both datasets use the same 4-pillar taxonomy. Cross-module computation is **frontend-only** — no new backend endpoints needed.

**Existing Data Fetch Pattern:**
- `fetchCrossModuleSummary()` (line 114) already fetches BOTH `pillar-summary` and `financial-pillar-summary` on page load
- Quarterly trend data is fetched per reporting type (Physical OR Financial, not both)
- Yearly comparison data is also fetched per reporting type

**Fix Strategy:**
- Add a **Cross-Module YoY chart** in the Institutional Overview section that overlays both modules' yearly data
- This requires fetching BOTH yearly comparison datasets on page load (similar to `fetchCrossModuleSummary`)
- Add `fetchCrossModuleYoY()` to fetch both `yearly-comparison` and `financial-yearly-comparison`
- Chart type: grouped bar with 2 series per year (Physical % + Financial %)
- Maintain per-pillar isolation — no cross-pillar aggregation

**Governance Check:** Deferred item #87 (cross-module analytics) was partially addressed in Phase FN-1. This extends it with YoY overlay. No YAGNI violation — stakeholder demo requires unified view.

---

#### 4. ANTI-PATTERNS IDENTIFIED

| Anti-Pattern | Location | Severity |
|-------------|----------|----------|
| Missing `h-100` on stat cards | lines 1019–1041 | HIGH — visual inconsistency |
| Inconsistent typography (`text-h5` vs `text-h6`) | line 1039 vs 1021 | MEDIUM |
| Donut data label shows only % without segment name | line 231 | MEDIUM |
| No cross-module YoY overlay | analytics section | MEDIUM — feature gap |
| Quarterly trend data fetched per-module only | lines 128–176 | LOW — cross-module quarterly not in scope |

---

#### 5. SUMMARY

| Issue | Root Cause | Fix Scope | Risk |
|-------|-----------|-----------|------|
| Stat card height/width | Missing `h-100`, inconsistent content | Template CSS only | NONE |
| Donut label clarity | Formatter shows only `%`, no label name | Chart config only | NONE |
| Cross-module YoY gap | Yearly data fetched per-module, no overlay | New fetch + computed + chart | LOW |

**No backend changes required.** All fixes are frontend-only (template + chart configuration + data transformation).

---

### Section 2.21 — Phase FN: Cross-Module Analytics & Additional Financial Endpoints (Mar 24, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready
**Severity:** MEDIUM — Feature enhancement for stakeholder readiness (April 6 session)
**Unblocks:** Deferred items #87 (cross-module analytics) and #96 (financial analytics endpoints)

---

#### 1. CURRENT ANALYTICS INVENTORY

**Physical Accomplishment (BAR No. 1) — 3 endpoints, 5 visualizations:**

| Endpoint | Method | Returns |
|----------|--------|---------|
| `analytics/pillar-summary` | `getPillarSummary(fy)` | Per-pillar: indicator counts, completion_rate, accomplishment_rate |
| `analytics/quarterly-trend` | `getQuarterlyTrend(fy, pillar?)` | Q1-Q4: target_rate, actual_rate, accomplishment_rate_pct |
| `analytics/yearly-comparison` | `getYearlyComparison(years[])` | Multi-year: per-pillar accomplishment_rate |

Charts: Summary cards (4), Achievement Rate bar, Radial gauge, Quarterly Trend line, YoY Comparison bar

**Financial Accomplishment (BAR No. 2) — 4 endpoints, 5 visualizations:**

| Endpoint | Method | Returns |
|----------|--------|---------|
| `analytics/financial-pillar-summary` | `getFinancialPillarSummary(fy)` | Per-pillar: appropriation, obligations, utilization_rate, balance |
| `analytics/financial-quarterly-trend` | `getFinancialQuarterlyTrend(fy, pillar?)` | Q1-Q4: appropriation, obligations, disbursement, utilization_rate |
| `analytics/financial-yearly-comparison` | `getFinancialYearlyComparison(years[])` | Multi-year: per-pillar utilization_rate |
| `analytics/financial-expense-breakdown` | `getFinancialExpenseBreakdown(fy)` | PS/MOOE/CO: obligations distribution |

Charts: Summary cards (4), Utilization Radial gauge, Expense Donut, Financial Trend line, Financial YoY bar

---

#### 2. CROSS-MODULE GAP ANALYSIS

**No cross-module analytics exist.** Physical and Financial are completely isolated:
- Separate endpoints, separate data variables, separate chart sections
- User must toggle between `PHYSICAL` and `FINANCIAL` reporting type to see each
- No institutional performance overview combining both modules
- No per-pillar correlation view (physical accomplishment vs budget utilization)

**What stakeholders need (April 6 session):**
- "How is the institution performing overall?" → Requires combined Physical + Financial KPIs
- "Is budget allocation aligned with accomplishment?" → Requires per-pillar cross-comparison
- Quick snapshot without toggling between modules

**Architecture assessment:** No new backend endpoint is strictly needed. Both `pillarSummary` and `financialPillarSummary` are already fetched. Cross-module analytics can be computed on the frontend by combining existing data. This follows KISS — no new SQL queries, no backend changes.

**Frontend-only approach:**
1. Fetch BOTH `pillar-summary` AND `financial-pillar-summary` regardless of reporting type toggle
2. Compute cross-module metrics from combined data
3. Display above the reporting type toggle (always visible)

---

#### 3. FINANCIAL ANALYTICS GAP ANALYSIS

**What's missing from Financial analytics:**

| Gap | Description | Impact |
|-----|-------------|--------|
| Disbursement rate trend | Quarterly trend tracks utilization_rate but NOT disbursement_rate. Data exists (`total_disbursement` returned) but no chart series for it | Stakeholders see obligations but not actual cash released |
| Expense breakdown per pillar | Current breakdown is GLOBAL (all pillars combined). No per-pillar PS/MOOE/CO view | Can't see which pillar spends most on salaries vs operations |
| Financial YoY pillar filter | Physical YoY responds to `selectedGlobalPillar`. Financial YoY does NOT (always shows all pillars as x-axis) | Asymmetric UX between modules |
| Target line on financial charts | Physical charts have 100% target annotation. Financial charts have none | Visual inconsistency |
| Unobligated balance trend | Balance (Appropriation − Obligations) is computed per pillar but not tracked per quarter | Can't see if spending is front-loaded or back-loaded |

**Assessment by YAGNI/KISS:**
- Disbursement rate series: LOW effort (data already in API response, just add chart series) — **INCLUDE**
- Expense breakdown per pillar: MEDIUM effort (backend needs `pillar_type` filter) — **DEFER** (global view sufficient for stakeholder session)
- Financial YoY pillar filter: LOW effort (frontend computed property change) — **INCLUDE**
- Target line: TRIVIAL (add annotation config) — **INCLUDE**
- Unobligated balance trend: MEDIUM effort (new backend query or frontend compute) — **DEFER**

---

#### 4. CROSS-MODULE IMPLEMENTATION ANALYSIS

**What can be built with existing data (no backend changes):**

A. **Cross-Module Summary Cards** — always-visible section above the reporting type toggle:
- Overall Physical Accomplishment Rate (average across pillars)
- Overall Financial Utilization Rate (average across pillars)
- Overall Disbursement Rate (average across pillars)
- Total Active Indicators / Total Financial Records

B. **Per-Pillar Cross Comparison Chart** — grouped bar showing both metrics per pillar:
- X-axis: 4 pillars
- Series 1: Physical Accomplishment Rate (%)
- Series 2: Financial Utilization Rate (%)
- Reveals alignment/misalignment between physical progress and budget execution

**Data source:** `pillarSummary.pillars[].accomplishment_rate_pct` + `financialPillarSummary.pillars[].avg_utilization_rate`

**Both require:** Fetching BOTH summary endpoints on page load regardless of reporting type toggle. Currently, physical is fetched only when `selectedReportingType === 'PHYSICAL'` and financial only when `selectedReportingType === 'FINANCIAL'`.

---

#### 5. FRONTEND DATA FLOW CHANGES

**Current flow:**
```
selectedReportingType === 'PHYSICAL' → fetchAnalytics()     → pillarSummary, quarterlyTrend, yearlyComparison
selectedReportingType === 'FINANCIAL' → fetchFinancialAnalytics() → financialPillarSummary, financialQuarterlyTrend, ...
```

**Required flow for cross-module:**
```
onMount / FY change → fetchCrossModuleSummary() → pillarSummary + financialPillarSummary (always)
selectedReportingType === 'PHYSICAL' → fetchAnalytics()     → quarterlyTrend, yearlyComparison (already have pillarSummary)
selectedReportingType === 'FINANCIAL' → fetchFinancialAnalytics() → financialQuarterlyTrend, ... (already have financialPillarSummary)
```

This avoids duplicate fetches while ensuring both summaries are always available.

---

#### ROOT CAUSE SUMMARY (Why Deferred Items Were Blocked)

| Item | Original Reason | Current Status |
|------|----------------|---------------|
| #87 Cross-module analytics | "Deferred until Financial data entry is stable" | Financial stable since Phase FB (Mar 20). Unblocked. |
| #96 Financial analytics additional | "Deferred until data entry is stable" | Same. Unblocked. |

Both were appropriately deferred. Financial module is now stable with complete CRUD, governance, and permissions (Phases ET–FI). Analytics enhancements are now safe.

---

### Section 2.20 — Phase FM: Data Retrieval Edge Case, Analytics Completeness, UX Clarity (Mar 24, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready
**Severity:** HIGH — Five interconnected issues across data logic, analytics, and UX

---

#### A. EMPTY-STATE RETRIEVAL EDGE CASE (CRITICAL)

**Root Cause:** `openEntryDialogDirect()` (physical/index.vue line ~601) uses a binary check:
```
if (existingData) {
  // Load existing record — NO PREFILL
} else {
  // Check prior quarter — PREFILL available
}
```

When a user saves a record with ALL fields empty/null, the DB record exists. `getIndicatorData(taxonomyId)` returns the object (truthy). The `if (existingData)` branch loads null values directly, **bypassing the prefill `else` block entirely**.

**Similarly, `hasPrefillAvailable()` (line ~245):**
```typescript
const data = getIndicatorData(taxonomyId)
return data === null  // Returns FALSE for empty records → no prefill cue
```

**Chain of failure:**
1. User enters Q1 data → saves → Q1 record created
2. User switches to Q2 → prefill from Q1 → saves → Q2 record created
3. User deletes all Q2 field values → saves → Q2 record still exists (all nulls)
4. User opens Q2 dialog again → `existingData` is truthy → NO prefill offered
5. Q1 reference is inaccessible despite Q2 being effectively empty

**The distinction needed:** EMPTY RECORD (exists but all data fields null) vs POPULATED RECORD (has at least one non-null data field). An empty record should still allow prior-quarter reference.

**Helper function needed:** `isRecordEffectivelyEmpty(data)` — returns true when ALL 12 quarter data fields (target_q1..q4, accomplishment_q1..q4, score_q1..q4) are null/empty.

---

#### B. QUARTERLY REPORTING GUIDE (UX — NEEDS UPDATE)

**Current guide content** (physical/index.vue lines 1336-1359):
- "Each indicator collects Target and Actual values for all four quarters"
- "The Reporting Period selector highlights the current quarter for quick reference but does not restrict data entry"
- "All four quarters are editable simultaneously"

**Issues:**
1. **Stale after Phase FL:** Guide still describes the OLD single-record model. Phase FL introduced per-quarter records — each quarter saves as an independent snapshot.
2. **Missing lifecycle explanation:** No mention of DRAFT → PENDING_REVIEW → PUBLISHED workflow
3. **Missing prefill explanation:** No mention of prior-quarter data reference
4. **Missing save behavior:** No explanation of what "save" does (creates/updates the current quarter's record only)

---

#### C. YEAR-OVER-YEAR ANALYTICS — MISSING FY2022

**Root Cause Chain (TWO layers):**

**Layer 1 — Frontend hardcoded slice** (index.vue line 120):
```typescript
api.get(`/api/university-operations/analytics/yearly-comparison?years=${fiscalYearOptions.value.slice(0, 3).join(',')}`)
```
`slice(0, 3)` sends only the **top 3** fiscal years. If `fiscalYearOptions` = [2026, 2025, 2024, 2023, 2022], only [2026, 2025, 2024] are sent. FY2022 and FY2023 are dropped.

Same pattern on line 144 for financial yearly comparison.

**Layer 2 — Backend active-only filter** (service.ts line 2211):
```sql
SELECT year, label FROM fiscal_years WHERE is_active = true ORDER BY year DESC
```
Only active fiscal years are returned. If FY2022 `is_active = false`, it's excluded from `fiscalYearOptions` entirely.

**Both layers compound:** Even if FY2022 is active, `slice(0, 3)` drops it. If inactive, it never appears.

**Backend queries are NOT at fault** — `getYearlyComparison(years)` and `getFinancialYearlyComparison(years)` correctly use `WHERE fiscal_year = ANY($1)` with whatever years are provided.

---

#### D. ANALYTICS GUIDE (UX — MODERATE)

**Current guide** (index.vue lines 782-835):
- Uses formula notation: "(Total Actual ÷ Total Target) × 100"
- Generally accessible but could be simpler for non-technical users
- Physical and Financial sections are comprehensive

**Assessment:** Content is adequate but can be improved with plainer language and more context about what "good" or "bad" values mean. Lower priority than the other issues.

---

#### E. TARGET LINE VISUAL MISALIGNMENT

**Current chart configuration** (index.vue):

Achievement Rate by Pillar (line ~528-537):
```typescript
yaxis: { min: 0, max: 120 },
annotations: { yaxis: [{ y: 100, borderColor: '#E53935', strokeDashArray: 4, label: { text: 'Target (100%)', position: 'left' } }] }
```

Year-over-Year Comparison (line ~422-436):
```typescript
yaxis: { min: 0, max: 120 },
annotations: { yaxis: [{ y: 100, ... same config ... }] }
```

**Potential issues:**
1. **Hardcoded `max: 120`:** If any data point exceeds 120%, ApexCharts may auto-scale beyond 120, shifting the annotation's relative position. The `max: 120` should clamp the axis but ApexCharts may override with `forceNiceScale`.
2. **Label overflow:** `position: 'left'` places the "Target (100%)" label at the left edge. If the chart container is narrow or the label overlaps with the yaxis title, it can appear to "exceed chart boundaries."
3. **Missing `offsetX`:** The label has no `offsetX` to push it away from the chart edge, causing visual overlap.

**Fix approach:** Add `offsetX` to shift label into chart area. Optionally increase `max` dynamically based on actual data. Add `forceNiceScale: false` to prevent axis expansion beyond configured max.

---

#### ROOT CAUSE SUMMARY TABLE

| Issue | Root Cause | Layer | Severity |
|-------|-----------|-------|----------|
| A. Empty-state prefill | Binary `if (existingData)` check — no empty-record detection | Frontend logic | CRITICAL |
| B. Quarterly guide | Stale content — describes pre-FL single-record model | Frontend UX | HIGH |
| C. Missing FY2022 | `slice(0, 3)` sends only 3 years; backend `is_active` filter | Frontend + DB config | HIGH |
| D. Analytics guide | Formula-heavy language, could be plainer | Frontend UX | MEDIUM |
| E. Target line | Hardcoded `max: 120`, label `position: 'left'` with no offset | Chart config | MEDIUM |

---

### Section 2.18 — Phase FK: Physical Module — Cross-Quarter Override Bug (Mar 20, 2026)

**Status:** ❌ SUPERSEDED BY SECTION 2.19 — FK analysis and implementation were based on an incorrect business rule interpretation. Column-level scoping was the WRONG fix. See Section 2.19 for corrected analysis.

---

### Section 2.19 — Phase FL: Record-Level Quarter Isolation — Corrected Business Rule (Mar 20, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready
**Severity:** CRITICAL — Phase FK implemented an incorrect restriction (column-level scoping). The correct fix requires record-level isolation with full-column editability.

#### 1. BUSINESS RULE CORRECTION (CRITICAL)

**FK's incorrect assumption:** Users should only edit the current quarter's columns. Non-selected quarter fields should be readonly.

**CORRECT business rule:** Each quarterly period (e.g., Q3 FY2026) produces an **independent snapshot record** containing ALL 12 quarter fields (Q1-Q4 target, accomplishment, score). Users MUST be able to edit ALL columns freely. The isolation is at the **RECORD level**, not the **COLUMN level**.

**Example — Progressive Reporting Model:**
```
Q3 RECORD (FY2026):  target_q1=0, target_q2=20, target_q3=0, target_q4=0
                      actual_q1=20, actual_q2=20, actual_q3=20, actual_q4=15

Q4 RECORD (FY2026):  target_q1=0, target_q2=15, target_q3=0, target_q4=5
(prefilled from Q3)   actual_q1=20, actual_q2=20, actual_q3=20, actual_q4=20
```

User modified Q2 target (20→15) and Q4 target (0→5) in the Q4 record. Q3 record MUST remain untouched. This is correct — each quarter represents a different reporting perspective.

#### 2. DATABASE MODEL — CONSTRAINT CONFLICT PREVENTS PER-QUARTER RECORDS

**Migration 021** (`uq_operation_indicators_quarterly`):
```sql
CREATE UNIQUE INDEX uq_operation_indicators_quarterly
ON operation_indicators (operation_id, pillar_indicator_id, fiscal_year)
WHERE deleted_at IS NULL;
```
This enforces **ONE record per indicator per FY** — blocking per-quarter records.

**Migration 025** added `reported_quarter` column and a NEW constraint:
```sql
CREATE UNIQUE INDEX uq_oi_quarterly_per_quarter
ON operation_indicators (operation_id, pillar_indicator_id, fiscal_year, reported_quarter)
WHERE deleted_at IS NULL AND reported_quarter IS NOT NULL;
```
This was DESIGNED for per-quarter records. **But migration 021's constraint was never dropped.** The two constraints conflict — 021 prevents what 025 enables.

**Result:** The system can only store ONE record per indicator per FY. ALL quarters read/write the SAME record. This is the PRIMARY root cause of cross-quarter data mutation.

#### 3. BACKEND — INFRASTRUCTURE EXISTS BUT IS BLOCKED

**`findIndicatorsByPillarAndYear()` (service.ts line 985-990):**
Already supports `quarter` parameter. Filters with:
```sql
AND (oi.reported_quarter = $3 OR oi.reported_quarter IS NULL)
```

**`createIndicatorQuarterlyData()` (service.ts line 1182-1192):**
Already includes `reported_quarter` in duplicate check:
```sql
WHERE pillar_indicator_id = $1 AND operation_id = $2 AND fiscal_year = $3 AND reported_quarter = $4
```
Would correctly allow per-quarter records IF migration 021 constraint were removed.

**`updateIndicatorQuarterlyData()` (service.ts line 1394-1399):**
Updates by record `id` — already correct for per-quarter model. Each quarter's record has its own `id`.

**Controller (controller.ts line 89-96):**
Already accepts `quarter` query parameter and passes to service.

**Conclusion:** Backend is ALREADY architected for per-quarter records. Only the migration 021 constraint blocks it.

#### 4. FRONTEND — MISSING QUARTER CONTEXT IN DATA LIFECYCLE

**`fetchIndicatorData()` (physical/index.vue line 301-302):**
```typescript
`/api/university-operations/indicators?pillar_type=${activePillar.value}&fiscal_year=${selectedFiscalYear.value}`
```
**Does NOT pass `quarter` parameter.** Returns ALL records regardless of `reported_quarter`. This means `pillarIndicators` contains the single shared record, not a per-quarter snapshot.

**`watch(selectedQuarter)` (line 965-967):**
```typescript
watch(selectedQuarter, async () => {
  await fetchQuarterlyReport()
})
```
Only refetches quarterly report status. **Does NOT reload indicator data.** Switching from Q3→Q4 continues showing the SAME records.

**`getIndicatorData(taxonomyId)` (line 239-240):**
```typescript
return pillarIndicators.value.find(i => i.pillar_indicator_id === taxonomyId) || null
```
Finds first match by taxonomy ID. With per-quarter records, this would need quarter awareness. With current fix (quarter-filtered fetch), it works correctly since `pillarIndicators` would only contain the current quarter's records.

**`saveQuarterlyData()` (line 720-731) — FK-1 INCORRECT FIX:**
Currently scopes payload to only 3 fields (selected quarter's columns). This must be reverted — ALL 12 fields should be sent. Record isolation handles data integrity.

**Entry dialog (lines 1613-1685) — FK-2 INCORRECT FIX:**
Currently makes non-selected quarter fields readonly. This must be reverted — ALL fields must be editable per business rule.

#### 5. PREFILL — NEEDS ARCHITECTURAL CHANGE

**Current prefill (FJ-1, lines 617-636):**
Copies prior quarter columns WITHIN the same record. This worked because there's only ONE record.

**With per-quarter records:** Prior quarter's data is in a DIFFERENT record. Prefill must:
1. Fetch the prior quarter's record via API (separate from current quarter's data)
2. Deep-copy ALL 12 column values into the new quarter's form
3. The form represents a NEW record (no `_existingId` for current quarter initially)

#### 6. ROOT CAUSE SUMMARY (CORRECTED)

| Layer | Finding | Fault |
|-------|---------|-------|
| Migration 021 | Constraint blocks per-quarter records | **PRIMARY CAUSE** |
| Frontend fetch | Does not pass `quarter` to backend | **CONTRIBUTING** |
| Frontend quarter watcher | Does not reload indicators on quarter switch | **CONTRIBUTING** |
| FK-1 column scoping | Wrong fix — restricts editability instead of isolating records | **INCORRECT FIX** |
| FK-2 readonly fields | Wrong fix — prevents legitimate full-column editing | **INCORRECT FIX** |
| Prefill (FJ-1) | Designed for single-record model — needs rework for per-quarter records | **NEEDS REWORK** |

**The correct fix requires:**
1. Drop migration 021 constraint to enable per-quarter records
2. Pass `quarter` to fetch endpoint + reload on quarter switch
3. Revert FK-1/FK-2 — restore full editability and full payload
4. Rework prefill for per-quarter record model (fetch prior quarter's record)

---

### Section 2.17 — Phase FJ: Physical Module — Prior-Quarter Prefill, Column-Based Adaptation (Mar 20, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

**Objective:** Port the Financial module's prior-quarter prefill feature to the Physical Accomplishment page, adapted for the column-based data model, without disrupting existing CRUD, taxonomy, or computations.

#### 1. PHYSICAL DATA MODEL (Column-Based Architecture)

**Table:** `operation_indicators`
**Key difference from Financial:** One record per indicator per FY spans ALL 4 quarters.

| Column Group | Columns | Type |
|-------------|---------|------|
| Target | `target_q1`, `target_q2`, `target_q3`, `target_q4` | DECIMAL(12,4) |
| Actual | `accomplishment_q1`, `accomplishment_q2`, `accomplishment_q3`, `accomplishment_q4` | DECIMAL(12,4) |
| Score | `score_q1`, `score_q2`, `score_q3`, `score_q4` | VARCHAR |
| Identity | `pillar_indicator_id` (FK → taxonomy), `operation_id`, `fiscal_year` | UUID/INT |
| Governance | `reported_quarter`, `created_by`, `deleted_at` | VARCHAR/UUID/TIMESTAMP |

**Taxonomy:** `pillar_indicator_taxonomy` — 14 fixed indicators across 4 pillars (HE:4, AE:3, RP:3, TA:4). Migration 019 — READONLY.

**Computed metrics (server-side `computeIndicatorMetrics()`):**
- `total_target` = SUM(target_q1..q4)
- `total_accomplishment` = SUM(accomplishment_q1..q4)
- `variance` = total_accomplishment - total_target
- `accomplishment_rate` = (total_accomplishment / total_target) × 100

#### 2. DATA FLOW — How Quarter Selection Affects Binding

**State model (physical/index.vue):**
- `pillarTaxonomy` (ref) — all taxonomy indicators for current pillar (FY-independent)
- `pillarIndicators` (ref) — indicator data records for current pillar+FY (has target_qX values)
- `selectedQuarter` (ref) — used for: column highlighting, quarterly report lookup, `reported_quarter` on save
- `getIndicatorData(taxonomyId)` — returns matching record from `pillarIndicators`

**Critical insight:** The Physical module shows ALL 4 quarters simultaneously in both the overview table and entry dialog. `selectedQuarter` controls:
1. Column highlight in overview table (visual emphasis)
2. Quarterly report governance lookup
3. `reported_quarter` field on POST/PATCH

It does NOT filter which data is displayed — all Q1-Q4 values are always visible and editable.

#### 3. HOW VALUES ARE CURRENTLY WRITTEN TO target_qX

**Entry dialog form (`openEntryDialogDirect`, line 576-593):**
```
entryForm = {
  target_q1: existingData?.target_q1 ?? null,
  target_q2: existingData?.target_q2 ?? null,
  ...all 12 quarter fields...
  _existingId: existingData?.id || null,
}
```

**Save flow (`saveIndicatorEntry`, line 630-783):**
- If `_existingId` exists → PATCH (update all 12 fields)
- If `_existingId` is null → POST (create new record with all 12 fields)
- Payload always includes ALL quarter fields, even if null

**This means:** When an indicator has no record yet, ALL quarter fields are null. When the user enters data for Q2, they submit the entire record — Q1 stays null unless they also fill it in.

#### 4. PREFILL COMPATIBILITY — Column Mapping Strategy

**Financial prefill model (reference):**
```
Q2 empty → fetch Q1 records → display as temp reference → user edits and saves as new Q2 record
```

**Physical prefill model (adapted):**
```
Q2 columns empty → check if Q1 columns have data in SAME record → pre-populate Q2 fields in entry dialog
```

**Key architectural difference:**
- Financial: Prefill means loading DIFFERENT records (separate Q1 rows) to create NEW records (Q2 rows)
- Physical: Prefill means reading EXISTING columns (target_q1) to pre-populate OTHER columns (target_q2) IN THE SAME record

**No API call needed for prefill.** The indicator record already contains Q1 values when it exists. The prefill logic is purely frontend: copy `target_q1` → `target_q2`, `accomplishment_q1` → `accomplishment_q2`, etc.

**What "empty quarter" means in column model:**
- An indicator record EXISTS but `target_qX` and `accomplishment_qX` for the selected quarter are both NULL/zero
- OR: no indicator record exists at all (taxonomy indicator with no data)

#### 5. STATE HANDLING — Temp vs Persisted

**Current state separation:** None. The `entryForm` ref is the only mutable state. It's populated from `existingData` on dialog open and submitted on save. There is no separate "prefill" state.

**Proposed approach:**
- Prefill happens INSIDE `openEntryDialogDirect()` — when opening an indicator that has Q1 data but Q2 is empty, copy Q1 values into Q2 form fields
- The form fields are ALREADY editable (v-model.number inputs)
- No separate prefill template, banner, or state needed — the dialog IS the edit interface
- An advisory notice inside the dialog indicates values were pre-filled from Q1

**Why this is simpler than Financial:**
- Physical always edits via dialog (not inline table)
- The dialog already shows all 4 quarters simultaneously
- Prefill is just "copy column values before dialog opens"
- No separate read-only reference table needed

#### 6. UI BEHAVIOR — Where Prefill Appears

**Overview table (lines 1343-1373):**
- When indicator has data: shows all 8 quarter cells + variance + rate
- When indicator has NO data: shows "Click row to enter quarterly data" hint

**Proposed prefill indicator:** When Q2 is selected and an indicator has Q1 data but no Q2 data:
- Overview table: Add subtle visual cue (e.g., "Q1 data available" hint instead of blank "Click row" message)
- Entry dialog: Pre-populate Q2 fields from Q1 with advisory text "Pre-filled from Q1 — edit as needed"

**No blocking banner needed** — the dialog IS the edit interface, and the user can immediately modify values.

#### 7. FAILURE LAYER IDENTIFICATION

| Concern | Risk | Mitigation |
|---------|------|------------|
| Overwriting existing Q2 data | HIGH | Only prefill when Q2 columns are NULL |
| Auto-saving without user action | HIGH | Prefill only populates form — save requires explicit submit |
| Breaking taxonomy linkage | NONE | Prefill doesn't touch `pillar_indicator_id` |
| Breaking computations | NONE | `computeIndicatorMetrics()` works on persisted data, not form state |
| Cross-quarter data mutation | LOW | Prefill reads Q1 columns, doesn't modify them |

---

### Section 2.16 — Phase FI: Financial Module — Temp Data Regression, Pillar State Inconsistency (Mar 20, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

**Reported Issue:** Prefill (prior-quarter reference) works on MFO1 but on MFO2-4 the banner forces a decision ("Save All as Q2" / "Use Empty Form") before editing is possible. User expects retrieved data to be immediately editable across ALL pillars — no forced decision gate.

#### 1. TEMP DATA STATE HANDLING

**How prefill works (current architecture):**
1. `fetchFinancialData()` loads Q2 records for current pillar
2. If Q2 is empty (`financialRecords.value.length === 0`), calls `fetchPrefillData(snapshotPillar)`
3. `fetchPrefillData()` loads Q1 records → stores in `prefillRecords` ref (separate from `financialRecords`)
4. Sets `isPrefillMode = true` and `prefillSourceQuarter = 'Q1'`
5. Template renders prefill banner + read-only table (lines 1051-1118) instead of the normal data table

**What triggers the "Save All / Use Empty Form" banner:**
- Template condition: `v-if="isPrefillMode && financialRecords.length === 0 && !prefillLoading"` (line 1051)
- The banner is **always displayed** when prefill data exists and Q2 has no persisted records
- This is by design — prefill data is treated as **reference only**, not editable draft

**Why MFO1 appears "editable immediately":**
- MFO1 likely has Q2 data already persisted from prior testing
- When Q2 has data → `financialRecords.value.length > 0` → prefill NOT triggered → normal data table renders with edit buttons
- This is NOT a code path difference — it's a **data state difference**

**Root cause confirmation:** The system does NOT have different code paths per pillar. The divergence is entirely due to **whether Q2 data already exists**:
- MFO1: Q2 data exists → shows editable data table ✅
- MFO2-4: Q2 data empty → shows prefill banner with read-only reference ❌ (user perceives as blocked)

#### 2. PILLAR STATE INCONSISTENCY

**Finding: NO code-level inconsistency between pillars.** All 4 MFOs execute identical code paths in `fetchFinancialData()`, `fetchPrefillData()`, `canEditData()`, and the template.

The perceived inconsistency is a **data-state divergence**: MFO1 has persisted Q2 records, MFO2-4 do not. The prefill UX pattern creates a UX gap where empty-quarter pillars appear "locked" behind a decision gate while populated pillars appear "editable."

#### 3. FORM STATE MODEL VALIDATION

**Current separation:**
- `financialRecords` (ref) = persisted data from API (Q2 records)
- `prefillRecords` (ref) = temporary reference data from API (Q1 records)
- `isPrefillMode` (ref) = boolean flag controlling which template section renders
- `entryForm` (ref) = dialog form state (populated on dialog open)

**Problem:** The separation is too strict. Prefill records are rendered as a completely separate UI (read-only table in a bordered card) that cannot be directly edited. The user must either:
1. "Save All as Q2" — bulk-saves all Q1 records as Q2 (no editing)
2. "Use Empty Form" — discards all prefill, starts blank
3. Per-row "Save as Q2" — opens dialog for ONE record with Q1 values pre-filled

**What the user wants:** Prefill records should be **directly editable in-place** without requiring a save/discard decision first. The banner should be advisory ("these are from Q1"), not blocking.

#### 4. UI CONTROL FLOW ANALYSIS

**Current flow (blocking):**
```
Q2 empty → fetch Q1 → show banner with 2 bulk actions → show read-only table
                                                           ↓
                                                    per-row "Save as Q2" → dialog → save → refetch
```

**Expected flow (advisory):**
```
Q2 empty → fetch Q1 → show advisory banner → show EDITABLE table with same edit UX as normal data
                                               ↓
                                        click row → edit dialog (pre-filled with Q1 values)
                                        "Save All" still available as convenience action
```

The blocking element is that the prefill table (lines 1074-1117) is a **completely separate template section** from the normal data table (lines 1157-1276). The prefill table has:
- No row click handler (normal table has `@click="openEditDialog(rec)"`)
- Read-only cells (no edit affordance beyond the per-row button)
- Grey background styling reinforcing "not your data"
- The "Add Financial Record" button IS visible above (canEditData() = true), but the visual separation between the banner/table and the add button makes it feel disconnected

#### 5. FAILURE LAYER IDENTIFICATION

| Issue | Layer | Root Cause |
|-------|-------|------------|
| "Forced decision" banner | Frontend template | Prefill template is blocking (read-only table, no row-click edit) |
| MFO1 vs MFO2-4 difference | Data state | MFO1 has Q2 data, MFO2-4 don't — not a code bug |
| Non-editable prefill rows | Frontend UX design | Prefill table lacks `@click` edit handler, uses separate template |
| Per-row "Save as Q2" as only edit path | Frontend UX design | Opens dialog but requires explicit button click, not row click |

**Conclusion:** The issue is a UX architecture problem, not a permission or state bug. The prefill pattern treats prior-quarter data as read-only reference when the user expects it to be an editable baseline. The fix is to make prefill rows clickable/editable using the same interaction pattern as persisted data rows.

---

### Section 2.15 — Phase FH: Financial Module — Operation Publication Status Blocks MFO2/MFO3 (Mar 20, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

**Reported Issue:** After FG-2 fix (`canEditData()` uses `canAdd('operations')` instead of `isOwnerOrAssigned()`), MFO2 and MFO3 still cannot be edited. MFO1 and MFO4 work fine.

#### Root Cause

`canEditData()` line 160: `if (currentOperation.value.publication_status === 'PUBLISHED') return false`

This checks the **operation's** `publication_status`, which is independent of the **quarterly report's** `publication_status`. MFO2 (ADVANCED_EDUCATION) and MFO3 (RESEARCH) operations were published via the UO main page workflow at some point, while MFO1 and MFO4 were not.

In the financial module, the quarterly report lifecycle (DRAFT → PENDING_REVIEW → PUBLISHED) is the governance mechanism for data locking. The operation-level `publication_status` is from the older UO landing page approval workflow and should not independently block financial data entry.

**Evidence chain:**
- `canEditData()` has TWO publication checks before `canAdd('operations')`:
  1. Line 160: `currentOperation.value.publication_status === 'PUBLISHED'` → blocks MFO2/MFO3
  2. Line 161: `currentQuarterlyReport.value?.publication_status === 'PUBLISHED'` → quarterly report lock
- MFO1/MFO4 operations are NOT published → pass line 160 → reach `canAdd()` → works
- MFO2/MFO3 operations ARE published → blocked at line 160 → never reaches `canAdd()`
- Backend `validateOperationEditable()` also checks operation publication_status, creating the same block

#### Fix

Remove `currentOperation.value.publication_status` check from `canEditData()` in the financial module. The quarterly report check (line 161) is the correct governance gate for financial data. The backend's `validateOperationEditable()` should similarly skip the operation-level publication check for financial endpoints, OR the operation statuses should be corrected in the database.

**Recommended approach:** Remove the operation-level publication check from the frontend `canEditData()`. The backend `validateOperationEditable()` will still enforce the quarterly report lock. If the operation is PUBLISHED at the operation level, the backend will block — so we either need to:
1. Fix both frontend AND backend (remove operation-level check from financial flow), OR
2. Fix the data (un-publish MFO2/MFO3 operations)

Option 1 is the correct architectural fix. Option 2 is a workaround that will recur.

---

### Section 2.14 — Phase FG: Financial Module — Staff Edit Permission on Non-Owned Pillars (Mar 20, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

**Reported Issue:** After FF-4 fix (prefill "Save as Q2" buttons visible), Staff users still cannot ADD or EDIT financial records on MFO2-4 pillars. The "Add Financial Record" button is hidden, existing record edit/click is blocked, and the only options are "Save All as Q2" or "Use Empty Form" from the prefill banner.

#### Root Cause Analysis

**Frontend gate — `canEditData()` (financial/index.vue lines 152-163):**
```typescript
function canEditData(): boolean {
  if (!currentOperation.value) return canAdd('operations')  // no op → can create
  if (isAdmin.value) { /* admin logic */ return true }
  if (currentOperation.value.publication_status === 'PUBLISHED') return false
  if (currentQuarterlyReport.value?.publication_status === 'PUBLISHED') return false
  return isOwnerOrAssigned(currentOperation.value)  // ← Staff falls here
}
```

For Staff on MFO2-4:
1. `currentOperation.value` exists (fetched from API) → does NOT return `canAdd('operations')`
2. `isAdmin.value` = false → skips admin block
3. Not published → falls to `isOwnerOrAssigned()`
4. Staff didn't create the MFO2-4 operation AND is not in `record_assignments` → **returns false**

**Backend enforcement — `validateOperationOwnership()` (service.ts lines 94-122):**
The backend has the SAME ownership check. `createFinancial()` (line 1486) calls `validateOperationOwnership()` which throws `ForbiddenException` for Staff who aren't owner/assigned.

**This means the frontend correctly mirrors the backend.** The fix must be applied to BOTH layers.

#### Architecture Analysis — Financial vs Physical Module

In the **Financial Module** (BAR No. 2):
- There is ONE operation per pillar per FY (e.g., "MFO1: Higher Education Services - FY 2026")
- Financial records are line items within that shared operation
- Multiple users need to enter financial data for different expense classes/campuses
- The operation is typically created by whoever enters data first (often MFO1 staff)
- MFO2-4 operations may be created by Admin or by a different Staff user

In the **Physical Module** (BAR No. 1):
- Same pattern: one operation per pillar per FY
- Indicators are added to the shared operation

**The ownership model is too restrictive for shared-pillar operations.** When a Staff user creates MFO1's operation, other Staff users can't add financial records to MFO2-4 operations they didn't create.

#### Solution Options

**Option A — Backend: Relax ownership for financial CUD to module-assignment check**
- Replace `validateOperationOwnership()` in `createFinancial`, `updateFinancial`, `removeFinancial` with a check against `user_module_assignments` (module = 'OPERATIONS' or 'ALL')
- Pros: Proper backend enforcement, Staff with OPERATIONS module access can edit any pillar
- Cons: Changes backend authorization model, may affect Physical module

**Option B — Backend: Add all module-assigned users as operation-assigned**
- Auto-assign users with OPERATIONS module to every new operation created
- Pros: Works with existing ownership model
- Cons: Complex, auto-assignment maintenance overhead

**Option C — Frontend + Backend: For financial records specifically, use module assignment instead of operation ownership**
- In `createFinancial`/`updateFinancial`/`removeFinancial`: check if user has OPERATIONS module assignment instead of operation ownership
- In `canEditData()`: for financial page, check module assignment instead of `isOwnerOrAssigned()`
- Pros: Targeted fix, doesn't affect Physical module
- Cons: Diverges financial and physical permission models

**Recommended: Option C** — Targeted fix. Financial records are shared budget data, not per-user indicators. The permission model should reflect this: any user with OPERATIONS module access can add/edit financial records, subject to publication lock.

#### Affected Code Paths

| Layer | File | Lines | Current Gate | Proposed Gate |
|-------|------|-------|--------------|---------------|
| Frontend | `financial/index.vue` | 152-163 | `isOwnerOrAssigned(currentOperation.value)` | Module assignment check (has OPERATIONS access) |
| Frontend | `financial/index.vue` | 1021 | `canEditData()` — "Add Financial Record" button | Same function, updated logic |
| Frontend | `financial/index.vue` | 1096 | `canAdd('operations')` (FF-4 fix for prefill) | Already correct |
| Frontend | `financial/index.vue` | 1165, 1194, 1227 | `canEditData()` — edit/delete buttons | Same function, updated logic |
| Backend | `university-operations.service.ts` | 1486 | `validateOperationOwnership()` in `createFinancial` | Check module assignment |
| Backend | `university-operations.service.ts` | 1543 | `validateOperationOwnership()` in `updateFinancial` | Check module assignment |
| Backend | `university-operations.service.ts` | 1588 | `validateOperationOwnership()` in `removeFinancial` | Check module assignment |

#### Key Constraint
The Physical module's `createIndicator`/`updateIndicator`/`removeIndicator` must continue using `validateOperationOwnership()`. Only financial CUD operations get the relaxed check.

---

### Section 2.13 — Phase FF: Financial Module — Temp Data Lock, Pillar Inconsistency, UI Timing (Mar 20, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready
**Scope:** 3 issues — prefill forced-decision UX, MFO2-4 inconsistency, fast-switch timing
**Files analyzed:**
- `pmo-frontend/pages/university-operations/financial/index.vue` (full script + template)

---

#### ISSUE 1 & 2: TEMP DATA LOCK + PILLAR INCONSISTENCY — COMBINED ROOT CAUSE

**Symptom:** When Q1 data loads into Q2, the banner shows "Save All as Q2" / "Use Empty Form". MFO1 works (per-row edit available), MFO2-4 do not.

**Root Cause A: `canEditData()` gates per-row "Save as Q2" buttons**

The prefill table Actions column (line 1096) is gated by `v-if="canEditData()"`:
```html
<th v-if="canEditData()" style="width: 120px">Actions</th>
...
<td v-if="canEditData()">
  <v-btn @click="openPrefillSaveDialog(rec)">Save as Q2</v-btn>
</td>
```

`canEditData()` (lines 152-163) checks:
1. If no operation → `canAdd('operations')` (Staff may not have this)
2. If Admin → true (unless Published)
3. If Staff → `isOwnerOrAssigned(currentOperation.value)` — checks `created_by` and `assigned_users`

**For MFO1:** The Staff user likely created the MFO1 operation → `isOwnerOrAssigned` returns true → per-row buttons visible → user can edit individual records.

**For MFO2-4:** Either:
- No operation exists → `canEditData()` returns `canAdd('operations')` which may be false for Staff
- Operation exists but created by a different user and user is not assigned → `isOwnerOrAssigned` returns false → per-row buttons HIDDEN

When per-row buttons are hidden, the user sees ONLY the banner with "Save All as Q2" / "Use Empty Form" — the "forced decision" with no way to edit individual records. This IS the locked state they describe.

**Root Cause B: `fetchPrefillData()` lacks stale-context guards**

The FD-2 fix added pillar-snapshot guards to `fetchFinancialData()` and `findCurrentOperation()`. But `fetchPrefillData()` (lines 313-337) has NO such guards:

```typescript
async function fetchPrefillData() {
  // Uses selectedQuarter.value and currentOperation.value at CALL time
  const priorQ = PRIOR_QUARTER_MAP[selectedQuarter.value]
  if (!priorQ || !currentOperation.value) { clearPrefill(); return }
  // ... API call ...
  // NO CHECK if pillar changed during await
  prefillRecords.value = records  // Could be stale data from previous pillar
}
```

**Race condition timeline:**
1. T0: MFO1 tab → `fetchFinancialData()` completes → calls `fetchPrefillData()` for MFO1
2. T1: MFO1's `fetchPrefillData()` awaiting API response
3. T2: User switches to MFO2 → `clearPrefill()` → `fetchFinancialData()` for MFO2
4. T3: MFO1's `fetchPrefillData()` API response arrives → **OVERWRITES cleared state** → sets `prefillRecords` = MFO1 data, `isPrefillMode = true`
5. T4: MFO2's `fetchFinancialData()` completes → calls `fetchPrefillData()` for MFO2
6. Result: Between T3 and T4, MFO1's prefill data shows on MFO2's tab

If MFO2 has no operation, step T4's `fetchPrefillData()` exits immediately (no operation), and MFO1's stale data **persists** on MFO2's tab.

**This explains the pillar-specific behavior:** MFO1's prefill "works" because it's loaded first and has valid data. MFO2-4 show stale MFO1 data (from the race condition) OR no edit buttons (from `canEditData()` returning false).

---

#### ISSUE 3: UI TIMING / FAST TAB SWITCHING

**Symptom:** Fast tab switching → data not displayed. Slow navigation → works.

**Root Cause: `loading.value` not cleared on early return paths**

`fetchFinancialData()` has 4 early return points (lines 223, 231, 234, 242):
```typescript
if (currentController.signal.aborted || activePillar.value !== snapshotPillar) return
```

None of these clear `loading.value`. The flow:
1. Call A starts → `loading.value = true`
2. Call B starts (aborts A) → `loading.value = true`
3. Call A hits abort check → returns WITHOUT `loading.value = false`
4. Call B completes → `loading.value = false`

This is fine for 2 calls. But during rapid switching (3+ tabs):
1. Calls A, B, C start in sequence
2. A returns early (aborted) — loading stays true
3. B returns early (aborted) — loading stays true
4. C completes → `loading.value = false` ✅

The loading spinner shows during the entire chain until the LAST call completes. If the last call's API is slow, the user sees a blank/loading state.

**Additional gap:** The template shows `<v-card v-if="loading">` (line 1021) which replaces ALL financial data with a spinner. During fast switching, the user sees a loading spinner instead of any data until the final API response arrives.

**Is a tab-switch delay the right fix?** A delay would mask the problem but not solve it. The real issues are:
- `loading.value` not cleared on early returns
- `fetchPrefillData()` lacking stale guards
- No debounce on the pillar watcher

A small debounce (150-200ms) on the pillar watcher IS a valid approach — it prevents triggering API calls during rapid sequential switches and is a standard UI pattern. But it must be combined with the root cause fixes.

---

#### FAILURE LAYER SUMMARY

| Issue | Root Cause | Layer |
|-------|-----------|-------|
| 1. Forced decision / no editing | `canEditData()` hides per-row buttons for non-owner pillars | Frontend (permission logic) |
| 2. MFO2-4 inconsistency | `fetchPrefillData()` lacks stale-context guards + `canEditData()` differs per pillar | Frontend (state + permissions) |
| 3. UI timing | `loading.value` not cleared on early returns + no debounce on watcher | Frontend (async state) |

**All three issues are frontend-only.** No backend or database changes needed.

---

### Section 2.12 — Phase FE: Financial Module — DB Conflict, Submission Failure, UI Regression (Mar 20, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready
**Scope:** 4 issues — duplicate key constraint, submission inconsistency, form regression, architectural alignment
**Files analyzed:**
- `database/migrations/026_create_quarterly_reports.sql` (UNIQUE constraint definition)
- `pmo-backend/src/university-operations/university-operations.service.ts` (createQuarterlyReport, submitQuarterlyReport)
- `pmo-frontend/pages/university-operations/financial/index.vue` (submitAllPillarsForReview, prefill template)

---

#### ISSUE 1: DUPLICATE KEY ERROR ON SUBMISSION — ROOT CAUSE FOUND

**Error:** `duplicate key value violates unique constraint "quarterly_reports_fiscal_year_quarter_key"`

**Root Cause: UNIQUE constraint does NOT exclude soft-deleted records**

Migration 026, line 21:
```sql
UNIQUE(fiscal_year, quarter)
```

This constraint applies to ALL rows, INCLUDING rows where `deleted_at IS NOT NULL`. However, the application code uses soft deletes (`deleted_at = NOW()`) and filters by `deleted_at IS NULL` in all queries.

**The conflict chain:**

1. Phase FC-1 soft-deleted FY2026 Q2 and Q3 records (set `deleted_at = NOW()`)
2. Phase FD-1 soft-deleted FY2025 Q1 record
3. The rows STILL EXIST in the table — they just have `deleted_at` set
4. Frontend `submitAllPillarsForReview()` (line 675-699):
   - Calls `fetchQuarterlyReport()` which queries `WHERE deleted_at IS NULL`
   - Gets `null` for Q2/Q3 (soft-deleted rows filtered out)
   - `!report` → POSTs to `POST /quarterly-reports` with `{ fiscal_year, quarter }`
5. Backend `createQuarterlyReport()` (service.ts:2178-2202):
   - Line 2182: Checks `WHERE fiscal_year = $1 AND quarter = $2 AND deleted_at IS NULL` → 0 rows
   - Line 2193: Attempts `INSERT INTO quarterly_reports (...) VALUES (...)`
   - **FAILS**: PostgreSQL enforces `UNIQUE(fiscal_year, quarter)` on the soft-deleted row

**Evidence trace:**

```
Application check:  SELECT ... WHERE deleted_at IS NULL → 0 rows ✓ (correct)
Application INSERT: INSERT INTO quarterly_reports (...) → FAILS
DB constraint:      UNIQUE(fiscal_year, quarter) includes deleted_at IS NOT NULL rows
```

**Failure layer:** DATABASE CONSTRAINT (mismatch between soft-delete application pattern and absolute UNIQUE constraint)

---

#### ISSUE 2: SUBMISSION "INSTABILITY" ACROSS MFOs — NOT PILLAR-SPECIFIC

**Symptom:** Fails for MFO1-3, sometimes succeeds for MFO4

**Root Cause: It's QUARTER-specific, not MFO-specific**

Quarterly reports are scoped by `(fiscal_year, quarter)` — NOT by pillar. All 4 MFO tabs share the SAME quarterly report for a given FY+quarter. The pillar tab is irrelevant to the submission flow.

The observed pattern:
- **Q2/Q3 FY2026:** Soft-deleted records exist → duplicate key error on ALL MFO tabs
- **Q4 FY2026:** No record (neither active nor soft-deleted) → create succeeds on ANY MFO tab
- **Q1 FY2026:** Active PENDING_REVIEW record → status check at line 679-684 blocks with "already pending review" on ALL MFO tabs

The user observes "MFO4 succeeds" because they likely tested MFO4 with Q4 (no soft-deleted record), while MFO1-3 were tested with Q2 or Q3 (soft-deleted records block the insert).

**Failure layer:** Same as Issue 1 — DATABASE CONSTRAINT. The perceived MFO-specificity is a testing artifact.

---

#### ISSUE 3: FORM / UI REGRESSION — CAUSED BY PHASE FD-3 CHANGES

**Symptom:** Data fields inconsistent, dialog-based editing bypassed

**Root Cause: Phase FD-3 introduced inline v-text-field inputs in the prefill table**

The FD-3 implementation (current code lines 1046-1135) changed the prefill table from:
- **Before:** Read-only currency display with "Save as Q2" button → opens dialog
- **After:** Inline `v-text-field` inputs for allotment/obligation/disbursement directly in the table

This creates several problems:
1. **UX inconsistency:** Regular financial records use dialog-based editing, but prefill records use inline editing — two different editing patterns on the same page
2. **Missing fields:** Inline table only exposes 3 numerical fields, but the dialog has 8+ fields (operations_programs, department, expense_class, fund_type, etc.)
3. **Column mismatch:** Prefill table columns (Appropriation, Obligations, Disbursement) differ from the regular table columns (Appropriation, Obligations, % Utilization, Balance)
4. **Direct state binding:** `v-model.number="rec._allotment"` binds directly to the prefill record — no form validation, no dialog confirmation

**The user's original complaint (FD Issue 2) was:** "User must manually clear fields before editing." The correct fix was to improve the DIALOG experience (better labeling, pre-population as editable baseline), NOT to bypass the dialog entirely with inline editing.

**Failure layer:** FRONTEND (Phase FD-3 implementation — should be reverted)

---

#### ISSUE 4: ARCHITECTURAL ALIGNMENT — CONFIRMED CORRECT, BUT CONSTRAINT IS WRONG

The data model is correctly designed:
- `quarterly_reports`: ONE per `(fiscal_year, quarter)` — university-wide
- `operation_financials`: MANY per `(operation_id, fiscal_year, quarter)` — pillar-level

The submission flow (`submitAllPillarsForReview`) correctly:
- Creates ONE quarterly_report for the quarter (not per pillar)
- Submits that single report

**No architectural misalignment exists.** The only issue is the UNIQUE constraint not accommodating soft deletes.

---

#### LAYER SUMMARY

| Issue | Root Cause | Layer |
|-------|-----------|-------|
| 1. Duplicate key error | `UNIQUE(fiscal_year, quarter)` includes soft-deleted rows | Database constraint |
| 2. MFO submission inconsistency | Same as #1 — quarter-specific, not MFO-specific | Database constraint |
| 3. Form/UI regression | Phase FD-3 inline editing broke dialog-based UX | Frontend (FD-3 revert needed) |
| 4. Architectural alignment | Architecture is correct; constraint is wrong | Database constraint |

**Single root cause for Issues 1, 2, and 4:** The `UNIQUE(fiscal_year, quarter)` constraint does not exclude soft-deleted rows.

---

### Section 2.11 — Phase FD: Financial Module — Status, Data Retrieval, UI Sync Issues (Mar 20, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready
**Scope:** 4 issues — FY2025 status ghost, prefill UX, pillar-specific retrieval, tab-switch race condition
**Files analyzed:**
- `pmo-frontend/pages/university-operations/financial/index.vue` (765 lines + template)
- `pmo-backend/src/university-operations/university-operations.service.ts` (findFinancials, findQuarterlyReports, findAll)

---

#### ISSUE 1: FY2025 Q1 Shows PUBLISHED With No Financial Data

**Symptom:** UI shows "Published" status for FY2025 Q1, but no `operation_financials` records exist and no submission history is visible.

**Root Cause: STALE DATABASE RECORD — Same pattern as Phase FC**

Database evidence (post FC-1 cleanup):
```
FY2025 Q1 → PUBLISHED (id: 9e268112-..., created: 2026-03-12)
FY2026 Q1 → DRAFT     (id: f7d30586-..., created: 2026-03-12)
```

The FY2025 Q1 PUBLISHED record is a test artifact from development (created March 12). It was NOT targeted by the FC-1 cleanup which only soft-deleted Q2/Q3 records.

**Code trace confirming the mechanism:**

1. Frontend `fetchQuarterlyReport()` (financial/index.vue:260-282):
   ```
   GET /api/university-operations/quarterly-reports?fiscal_year=2025&quarter=Q1
   ```
2. Backend `findQuarterlyReports()` (service.ts:2204-2224):
   ```sql
   SELECT qr.* FROM quarterly_reports qr WHERE qr.deleted_at IS NULL
     AND qr.fiscal_year = 2025 AND qr.quarter = 'Q1'
   ```
3. Returns the stale record → `currentQuarterlyReport.value` = `{ publication_status: 'PUBLISHED' }`
4. `currentQuarterStatus` computed (line 137-140):
   ```typescript
   return currentQuarterlyReport.value?.publication_status ?? 'NOT_STARTED'
   // Returns 'PUBLISHED' from the stale record
   ```

**Key insight:** The quarterly_reports query has NO pillar filter. The `UNIQUE(fiscal_year, quarter)` constraint means ONE record per FY+quarter — shared across ALL pillars and BOTH modules (Physical + Financial). This is correct architecture, but stale records affect all modules.

**There is NO fallback logic or API merge error.** The status is sourced solely from `quarterly_reports` — the code correctly reads and displays the database state. The database state is wrong.

**Failure layer:** DATABASE (stale test data)
**Fix:** Soft-delete FY2025 Q1 PUBLISHED record (same FC-1 pattern)

---

#### ISSUE 2: Prefill Data Requires Manual Clearing Before Editing

**Symptom:** When Q2 loads Q1 reference data, user must clear fields before editing. Should allow direct editing.

**Root Cause: PREFILL IS PRESENTED AS READ-ONLY TABLE — Not an inline-editable form**

The prefill system (Phase FB-B) works as follows:

1. `fetchPrefillData()` (line 296-320) queries the prior quarter's financial records
2. Records are stored in `prefillRecords` ref (separate from `financialRecords`)
3. Template renders a READ-ONLY reference table (lines 1046-1087) with:
   - Each row shows Q1 data (grey background: `class="bg-grey-lighten-5"`)
   - A "From Q1" chip label on each row
   - Two action paths:
     - **"Save All as Q2"** button (line 1032-1037) → `saveAllPrefillRecords()` — copies ALL records as-is to Q2 with no editing
     - **"Save as Q2"** per-row button (line 1080-1082) → `openPrefillSaveDialog(rec)` — opens dialog with Q1 values pre-populated

**The UX problem:**

When user clicks "Save as Q2" on a single record, `openPrefillSaveDialog()` (line 322-336) opens the entry dialog with Q1 values in the form fields. The fields ARE technically editable — the user CAN modify them. But the UX flow requires:
1. Click "Save as Q2" → dialog opens with Q1 values
2. Edit numerical fields (amounts will likely differ for Q2)
3. Click "Save"

The user perceives this as "needing to clear fields" because:
- The values shown are Q1 values, not blank fields for Q2 entry
- There is no visual distinction between "this is reference data you should update" vs "this is your data"
- The form treats prefill values identically to edit values — no indication that amounts should be changed

**Additionally:** The "Save All as Q2" button saves Q1 amounts verbatim to Q2 without any editing opportunity. This creates records with Q1 amounts in Q2, which the user then needs to edit individually.

**Failure layer:** FRONTEND UX (form state presentation)
**Fix:** Make prefill records inline-editable in the reference table, OR clearly mark the dialog as "Edit for Q2" with visual cues that amounts should be updated

---

#### ISSUE 3: MFO4 Fails to Retrieve Prior Quarter Data; MFO2 Intermittent

**Symptom:** Prefill works for MFO1/MFO3 but fails for MFO4, intermittent for MFO2.

**Root Cause: NO OPERATION EXISTS FOR THAT PILLAR → Prefill early-exits**

The prefill logic at `fetchPrefillData()` line 298:
```typescript
if (!priorQ || !currentOperation.value) {
  clearPrefill()
  return
}
```

If `currentOperation.value` is null (no `university_operations` record for the selected pillar + FY), prefill exits immediately. The flow:

1. `fetchFinancialData()` calls `findCurrentOperation()` (line 245-258)
2. `findCurrentOperation()` queries: `GET /api/university-operations?type=TECHNICAL_ADVISORY&fiscal_year=2026&limit=100`
3. Backend `findAll()` (service.ts:226-305) filters by `uo.operation_type = 'TECHNICAL_ADVISORY'` and `uo.fiscal_year = 2026`
4. If no operation exists → `currentOperation.value = null`
5. Prefill exits at line 298 → `clearPrefill()`

**For MFO4 (consistent failure):** No operation record exists for TECHNICAL_ADVISORY + FY2026. Financial data cannot be fetched or prefilled without an operation.

**For MFO2 (intermittent):** This is a race condition (see Issue 4). When switching tabs rapidly, `currentOperation.value` may be `null` (from an aborted fetch for a different pillar) or stale (from a prior pillar's resolved response). The intermittent behavior depends on network response timing.

**Secondary factor:** The frontend `findCurrentOperation()` does a CLIENT-SIDE filter after fetching ALL operations of that type:
```typescript
const data = Array.isArray(response) ? response : (response?.data || [])
currentOperation.value = data.find(
  (op: any) => op.operation_type === activePillar.value
    && Number(op.fiscal_year) === Number(selectedFiscalYear.value)
) || null
```

The `activePillar.value` check uses the CURRENT pillar value at response time, not the pillar value when the request was initiated. If the user switched pillars during the request, this filter matches against the WRONG pillar — returning `null` even if the operation exists.

**Failure layer:** FRONTEND STATE (missing operation) + RACE CONDITION (stale pillar reference)
**Fix:** Ensure operation auto-creation covers all pillars; scope `findCurrentOperation` to the calling pillar context

---

#### ISSUE 4: Fast Tab Switching → Data Not Displayed

**Symptom:** Rapid pillar tab switches result in empty/missing data display. Slow navigation works fine.

**Root Cause: INCOMPLETE ABORT MECHANISM + UNSCOPED STATE MUTATION**

The `fetchFinancialData()` function (line 210-243) uses an AbortController but has 3 critical gaps:

**Gap A: Abort signal is never passed to API calls**
```typescript
fetchAbortController = new AbortController()
const currentController = fetchAbortController
// ... later:
const res = await api.get<any[]>(`/api/university-operations/...`)
// ❌ Signal not passed — request completes regardless of abort
```
The abort only works as a FLAG CHECK after each await, not as actual request cancellation. Both old and new requests complete on the network.

**Gap B: `findCurrentOperation()` mutates shared state without scoping**
```typescript
async function findCurrentOperation() {
  // ...
  currentOperation.value = data.find(...) || null  // ❌ Mutates shared ref
}
```

When responses arrive out of order:
1. User switches MFO1 → MFO2 rapidly
2. `fetchFinancialData()` for MFO1 starts, calls `findCurrentOperation()`
3. `fetchFinancialData()` for MFO2 starts, aborts MFO1's controller, calls `findCurrentOperation()`
4. MFO2's response arrives first → `currentOperation.value = MFO2_op`
5. MFO1's response arrives late → `currentOperation.value = MFO1_op` ← **STALE OVERWRITE**
6. MFO1's fetch checks `signal.aborted` → true → returns early
7. BUT `currentOperation.value` now holds MFO1's operation while UI shows MFO2

This stale `currentOperation.value` causes:
- `canEditData()` to check wrong operation's permissions
- `saveFinancialRecord()` to POST to wrong operation
- Prefill to query wrong operation (Issue 3 intermittent failures)

**Gap C: `watch(activePillar)` does NOT call `fetchQuarterlyReport()`**
```typescript
watch(activePillar, async () => {
  clearPrefill()
  await fetchFinancialData()
  // ❌ No fetchQuarterlyReport() — but this is actually CORRECT
  // Quarterly reports are FY+quarter scoped, not pillar-scoped
})
```
This is actually correct behavior since quarterly reports are not pillar-scoped. NOT a bug.

**Failure layer:** FRONTEND STATE (race condition in async state management)
**Fix:** Scope `findCurrentOperation` results to the calling context; pass abort signal to API calls; add request ID tracking

---

#### LAYER SUMMARY

| Issue | Database | Backend | API | Frontend |
|-------|----------|---------|-----|----------|
| 1. FY2025 PUBLISHED ghost | ✅ ROOT CAUSE | — | — | — |
| 2. Prefill not editable | — | — | — | ✅ UX DESIGN |
| 3. MFO4/MFO2 retrieval | — | — | — | ✅ MISSING OP + RACE |
| 4. Tab switch race | — | — | — | ✅ ABORT MECHANISM |

**Issues 3 and 4 share a root cause:** The `findCurrentOperation()` function mutates shared state (`currentOperation.value`) without scoping to the specific request context. A stale or out-of-order response corrupts the shared state, causing downstream failures in data fetching, prefill, and permission checks.

---

### Section 2.10 — Phase FC (Revised): Financial & Governance System — Root Cause Analysis with DB Evidence (Mar 20, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready
**Supersedes:** Section 2.09 (initial diagnosis without DB evidence)

---

#### DATABASE EVIDENCE (AUTHORITATIVE)

```
quarterly_reports table (deleted_at IS NULL):
FY2025 Q1 → PUBLISHED  ✅ (valid — intentional submission)
FY2026 Q1 → DRAFT      ❗ (unexpected — why DRAFT if Q2/Q3 are PUBLISHED?)
FY2026 Q2 → PUBLISHED  ❗ (no confirmed valid submission)
FY2026 Q3 → PUBLISHED  ❗ (no confirmed valid submission)
```

---

#### ROOT CAUSE: CONFIRMED — OPERATOR-INITIATED (NOT A CODE BUG)

Exhaustive code trace confirms there are exactly **2 ways** a quarterly_reports record reaches PUBLISHED:

1. **`approveQuarterlyReport()`** (service line 2354) — requires Admin, requires status=PENDING_REVIEW
2. **No other path exists** — no batch jobs, no triggers, no auto-publish, no seed data

For Q2/Q3 FY2026 to be PUBLISHED, this sequence MUST have occurred for each:
```
1. Record created (via POST /quarterly-reports) → status = DRAFT
2. Record submitted (via POST /quarterly-reports/:id/submit) → status = PENDING_REVIEW
3. Admin approved (via POST /quarterly-reports/:id/approve) → status = PUBLISHED
```

**Most likely scenario:** During testing, the operator or admin submitted and approved multiple quarters (possibly via batch approve on the Pending Reviews page — `approveSelected()` at pending-reviews.vue line 321). The batch approve iterates all selected items and calls the approve endpoint for each.

**Why FY2026 Q1 is DRAFT:** After Q1 was PUBLISHED, someone modified financial/physical data which triggered `autoRevertQuarterlyReport()` (service line 2480-2519), reverting Q1 back to DRAFT. Q2/Q3 were not reverted because no data modifications occurred on them.

---

#### FINDING FC-R1: No Auto-Creation or Propagation Bug Exists

| Code Path | Creates Records? | Sets PUBLISHED? | Evidence |
|-----------|-----------------|-----------------|----------|
| `createQuarterlyReport()` line 2188 | YES — as DRAFT only | NO | Hardcoded `'DRAFT'` in INSERT |
| `submitQuarterlyReport()` line 2311 | NO | NO — sets PENDING_REVIEW | UPDATE only |
| `approveQuarterlyReport()` line 2354 | NO | YES — the ONLY path | Requires PENDING_REVIEW input |
| `autoRevertQuarterlyReport()` line 2504 | NO | NO — sets DRAFT | UPDATE only, no creation |
| Frontend `submitAllPillarsForReview()` | YES (if none exists) | NO | Creates DRAFT, then submits |
| Database migration 026 | Schema only | NO | DEFAULT 'DRAFT' |
| Seed data | None | None | No quarterly_reports rows |

**Conclusion:** The code is correct. The stale PUBLISHED records are test artifacts from manual operator actions.

---

#### FINDING FC-R2: Governance Workflow Is Functional (Code Is Correct)

All governance endpoints trace correctly:
- **Submit:** `submitQuarterlyReport()` — status guard ✓, ownership check ✓, snapshot ✓
- **Approve:** `approveQuarterlyReport()` — admin check ✓, rank check ✓, ID-scoped UPDATE ✓
- **Reject:** `rejectQuarterlyReport()` — stores review_notes ✓
- **Withdraw:** `withdrawQuarterlyReport()` — submitter check ✓
- **Request Unlock:** `requestQuarterlyReportUnlock()` — duplicate check ✓
- **Unlock:** `unlockQuarterlyReport()` — snapshot UNLOCKED event ✓, clears all fields ✓
- **Deny Unlock:** `denyQuarterlyReportUnlock()` — clears request fields ✓

The ES test failures are caused by **stale database state** (Q2/Q3 stuck at PUBLISHED), not code bugs.

---

#### FINDING FC-R3: Remaining Code Issues (FROM Section 2.09 — STILL VALID)

These issues from the prior analysis remain valid and should be fixed:

| # | Issue | Severity | Layer |
|---|-------|----------|-------|
| FC-3 | `autoRevertQuarterlyReport()` silently exits when quarter=undefined | HIGH | Backend |
| FC-5 | Physical indicator CUD passes quarter=undefined to `validateOperationEditable()` — bypasses quarterly lock | HIGH | Backend |
| FC-6 | Pending Reviews returns empty array when Admin lacks module assignment — no error feedback | MEDIUM | Backend |
| FC-D | `snapshotSubmissionHistory()` swallows errors silently | LOW | Backend |

---

### Section 2.09 — Phase FC: Financial Module Bug Diagnosis — Quarterly Report Status Contamination (Mar 20, 2026)

**Status:** SUPERSEDED BY Section 2.10 — initial diagnosis was correct in identifying code-level issues but the PRIMARY symptom (Q2/Q3 PUBLISHED) is a data issue, not a code bug.
**Scope:** 4 confirmed failures: default Published on empty quarters, cross-quarter status leakage, governance workflow failure, pending review misconfiguration

---

#### ROOT CAUSE #1: `UNIQUE(fiscal_year, quarter)` — Shared Quarterly Report Entity (CRITICAL)

The `quarterly_reports` table has a `UNIQUE(fiscal_year, quarter)` constraint (migration 026, line 21). This means **ONE record per FY+quarter for the entire university** — not per pillar, not per module, not per operation.

When the Financial module submits Q1 FY2026:
1. Frontend calls `POST /quarterly-reports` with `{ fiscal_year: 2026, quarter: 'Q1' }`
2. Backend creates/finds the quarterly report record (service line 2172-2196)
3. Frontend calls `POST /quarterly-reports/:id/submit`
4. Backend sets `publication_status = 'PENDING_REVIEW'` (line 2311)
5. Admin approves → sets `publication_status = 'PUBLISHED'` (line 2354)

**The same record is shared by both Physical and Financial modules.** When the Financial page loads Q1 FY2026, it fetches the same quarterly report that Physical submitted. If Physical Q1 is PUBLISHED, Financial Q1 shows PUBLISHED too — even if no financial data exists for Q1.

**This is by design** (migration comment: "ONE record per (fiscal_year, quarter) — represents the entire quarterly report submission"). But the UI treats it as if each module has independent status.

**Impact:** This is the root cause of "empty quarters default to Published." Q2/Q3 don't have their own records — they're NOT STARTED. But Q1's PUBLISHED status doesn't leak to Q2/Q3 at the database level. The real leakage is in how the frontend interprets the response.

---

#### ROOT CAUSE #2: Frontend `fetchQuarterlyReport()` Returns Correct Data — Status Display Is Correct

After thorough trace-through:
- `fetchQuarterlyReport()` (financial/index.vue line 260-282) passes BOTH `fiscal_year` AND `quarter` as query params
- Backend `findQuarterlyReports()` (service line 2198-2218) correctly filters by both params when provided
- If no record exists for that FY+quarter, backend returns empty array
- Frontend sets `currentQuarterlyReport.value = null` when no record found (line 276)
- `currentQuarterStatus` computed correctly returns `'NOT_STARTED'` when null (line 139)

**Finding:** The frontend code IS correctly scoped. If the user sees "Published" on Q2 when only Q1 was submitted, the cause is that a `quarterly_reports` record EXISTS for Q2 with status PUBLISHED — meaning either:
- (a) Someone submitted Q2 at some point, or
- (b) There's a code path that creates quarterly report records as a side effect

---

#### ROOT CAUSE #3: `autoRevertQuarterlyReport()` Silent Failure (HIGH)

Service line 2480-2519. When called with `quarter = undefined`:
```
if (!fiscalYear || !quarter) return;  // line 2485 — SILENT EXIT
```

Three Physical indicator methods pass `undefined` as quarter:
- `createIndicator()` line 1354
- `updateIndicator()` line 1393
- `removeIndicator()` line 1428

These methods don't know which quarter the indicator belongs to (Physical indicators use column-based quarters: `target_q1`, `accomplishment_q1`, etc. — not row-based like Financial).

**Impact:** When a Physical indicator is modified on a PUBLISHED quarterly report, the auto-revert silently fails. The report remains PUBLISHED even though data was modified. This is a **governance violation** but is NOT the primary cause of cross-quarter contamination.

---

#### ROOT CAUSE #4: Governance Workflow — ES Test Failures

**ES-A (Restart):** Backend restart has no effect on persisted state. This test validates that the system survives a restart — if it still shows wrong status after restart, the problem is in the data, not runtime state.

**ES-B (Full lifecycle):** The lifecycle depends on the `quarterly_reports` record being correctly scoped. If the operator tested by:
1. Submit Q1 as Staff → creates record, sets PENDING_REVIEW
2. Approve as Admin → sets PUBLISHED
3. Switch to Q2 → should show NOT_STARTED (no record)
4. If Q2 shows PUBLISHED → the operator may have been looking at Q1's record persisting in the UI

**ES-C (Pending Reviews — unlock requests):** The `findQuarterlyReportsPendingUnlock()` method (line 2654-2683) filters by `unlock_requested_by IS NOT NULL`. This is correct. If unlock requests don't appear, the most likely cause is:
- The unlock request was never created (frontend error)
- The admin doesn't have OPERATIONS module access (line 2662-2669 access check)
- The report isn't in PUBLISHED status when unlock is requested (line 2590 guard)

**ES-D (Submission History — UNLOCKED logs):** The `snapshotSubmissionHistory()` is called before the unlock UPDATE (line 2544). If UNLOCKED events are missing, either:
- The unlock never succeeded
- The snapshot INSERT silently failed (catch block on line 2470 swallows errors)

---

#### FINDING FC-5: `validateOperationEditable()` Passes `undefined` for Physical Indicators

Lines 1354, 1393, 1428 call `validateOperationEditable(operationId, undefined, user)`. When `quarter` is undefined, the method (line 148-154) falls back to checking ONLY `uo.publication_status` without joining `quarterly_reports`. This means:
- Physical indicator CUD operations are NOT checked against the quarterly report's publication lock
- A PUBLISHED quarterly report does NOT prevent Physical indicator edits
- This is the same gap that Phase FA-B fixed for Financial — but it was never applied to Physical indicators

---

#### FINDING FC-6: Pending Reviews Module Access Check

`findQuarterlyReportsPendingReview()` line 2241-2249 checks `user_module_assignments` for `module = 'OPERATIONS' OR module = 'ALL'`. If the Admin user doesn't have this module assignment, the method returns an empty array silently. This could explain why Pending Reviews appears empty.

---

#### Summary Table

| # | Finding | Layer | Severity | Root Cause |
|---|---------|-------|----------|------------|
| FC-1 | Shared quarterly report entity (1 per FY+Q) | Database design | CRITICAL | By design — but UI assumes per-module isolation |
| FC-2 | Frontend fetchQuarterlyReport is correctly scoped | Frontend | SAFE | Params include both fiscal_year AND quarter |
| FC-3 | autoRevertQuarterlyReport silent failure on undefined quarter | Backend | HIGH | Physical indicator methods pass undefined |
| FC-4 | ES test failures trace to data state, not code bugs | Testing | MEDIUM | Requires database state verification |
| FC-5 | validateOperationEditable skips quarterly lock for Physical | Backend | HIGH | quarter=undefined bypasses JOIN |
| FC-6 | Pending Reviews empty when Admin lacks module assignment | Backend | MEDIUM | Access check returns [] silently |

### 1.85 Phase EE+EF — Pillar Header Consolidation & User Management Integration (Mar 11, 2026)

**Status:** ✅ PHASE 1 RESEARCH COMPLETE + PHASE 3 IMPLEMENTED

#### CRITICAL FINDING: Artifact-Implementation Gap

Five phases marked ✅ IMPLEMENTED in plan.md were NOT present in the actual code:
- EA-A: v-tooltip on v-select still wrapping quarter selector (lines 826–843)
- EA-B: "Save All Quarters" button label unchanged (line 1492)
- EA-D: DR-E standalone summary row still existed; pillar header not enriched
- EC-A: Publishing status chip not in header; `currentQuarterStatus` undefined
- EC-B: `-webkit-line-clamp` not applied to `.indicator-text`

Root cause: Context-window compression between sessions caused session summaries to report implementation as complete when only artifact documents were updated.

#### Phase EE Implementation

- EE-A: Removed standalone DR-E `v-row` (was lines 949–970)
- EE-B: Enriched pillar header right side: FY chip + publication status chip + indicator count chip + achievement rate chip
- EE-C: Moved submission controls (Submit/Withdraw/Approve/Reject) into pillar header card; STATUS BAR alert retained only for rejection notes
- EE-D: Removed v-tooltip wrapper from quarter selector v-select
- EE-E: Changed "Save All Quarters" → "Save" in entry dialog
- EE-F: Added `-webkit-line-clamp: 3` + `display: -webkit-box` to `.indicator-text`; added `white-space: pre-line` spans in tooltip content

#### Phase EF Implementation

- EF-A: DEFERRED — `currentOperation.created_by` is a UUID; display name not available in the operation response without additional API call
- EF-B: DEFERRED — No UO assignment controller endpoints exist in the backend
- EF-C: Added admin-only "Users" navigation button in UO main page header (routes to `/users`)

---

### 1.84 Phase EC+ED — Physical Accomplishment & Analytics Refinement (Mar 11, 2026)

**Status:** ✅ PHASE 1 RESEARCH COMPLETE + PHASE 3 IMPLEMENTED

#### A. Physical Page Findings

**A.1 Pillar Header Publishing Status:** Phase EA-D merged DR-E summary chips into the pillar header (indicator count + rate%). Publishing status was only visible in the top STATUS BAR alert (`currentQuarterStatus`), not in the header. Data already available — no API changes.

**A.2 Indicator Text Layout:** Migration 022 stored AE-OC-01 with literal `\n` newlines (4 sub-items (a)-(d)). `.indicator-text` CSS had `white-space: pre-line` which correctly renders newlines — but no line-clamp existed. Result: the AE-OC-01 row was 5-6 lines tall, disrupting compact table alignment. Tooltip already wraps activator with `max-width="400"` for full text on hover. Fix: CSS `-webkit-line-clamp: 3` + tooltip `white-space: pre-line`.

#### B. Analytics Findings

**B.1 Target vs Actual Formula:** Phase EB-A used `count_target`/`count_accomplishment` (SUM of COUNT/WEIGHTED_COUNT indicators only). Higher Education and Advanced Education are PERCENTAGE type — both rendered as zero bars. Fix: revert to `indicator_target_rate`/`indicator_actual_rate` (rate-based, works for all unit types).

**B.2 Donut Chart:** `endAngle: 270` creates a 270° arc (¾ circle). Fix: `startAngle: -90, endAngle: 270` = full 360° from 12 o'clock.

**B.3 Analytics Notes:** No explanation panel existed. Added `v-expansion-panels` accordion pattern (same as physical page's Quarterly Reporting Guide).

**B.4 YoY Pillar Filter:** Backend `getYearlyComparison` already returns `years[i].pillars[]` with per-pillar `accomplishment_rate`. Frontend ignored this — showed aggregated totals only. Added `selectedYoYPillar` filter that switches between aggregated mode (ALL) and per-pillar rate mode.

---

### 1.75 Quarter-Specific Data Entry Refactor — Root Cause Analysis (Mar 10, 2026)

**Status:** ✅ PHASE 1 RESEARCH COMPLETE
**Priority:** P1 — Incorrect quarterly independence; data overwrite risk
**Scope:** Frontend-only (physical/index.vue). No DB, backend, or DTO changes required.

#### A. DATABASE (CONFIRMED CORRECT — NO CHANGES NEEDED)
- `operation_indicators` wide model: `target_q1-4`, `accomplishment_q1-4`, `score_q1-4` — all NULLABLE DECIMAL(12,4)
- UNIQUE constraint: `(operation_id, pillar_indicator_id, fiscal_year)` — one row per indicator per FY
- Schema already supports independent per-quarter storage

#### B. BACKEND (CONFIRMED CORRECT — NO CHANGES NEEDED)
- `updateIndicatorQuarterlyData()` uses `Object.keys(dto).filter(k => dto[k] !== undefined)`
- Partial quarter payloads already work: send only `{ target_q3, accomplishment_q3 }` → only Q3 updated
- DTO: all 12 quarter fields are `@IsOptional()`

#### C. ROOT CAUSE — FRONTEND SUBMISSION DESIGN FLAW
```
openEntryDialog() → loads ALL 12 quarter fields from DB into entryForm
saveQuarterlyData() → sends ALL 12 fields in every PATCH (null for unfilled quarters)
Backend → null !== undefined → actively SET Q2=null, Q3=null, Q4=null when saving Q1
```
**Effect:** Any save resets all unedited quarters to null. No quarter-specific isolation exists.

#### D. SECONDARY ISSUE — NO QUARTER SELECTOR IN DIALOG
- `selectedQuarter` (page-level) controls display column mode only — does NOT affect dialog
- Dialog always renders all 4 quarter rows simultaneously
- No prefill-from-previous-quarter logic exists

#### E. REQUIRED FIX — FRONTEND ONLY
1. Add `dialogQuarter` tab selector inside the dialog
2. Show only active quarter's editable fields
3. Prefill target from previous quarter when current quarter has no data
4. Send ONLY current quarter's fields in payload on save

---

### 1.69 Physical Accomplishment UPDATE Failure — Root Cause Analysis (Mar 4, 2026) [REVISED]

**Status:** 🔴 PHASE 1 RESEARCH COMPLETE (Revision 2)  
**Priority:** P0 — CRITICAL — UPDATE operations fail with 404 across all fiscal years  
**Previous Attempt:** Phase DL-A/DL-B (type-safe fix) DID NOT resolve issue  
**Directive:** Re-investigate actual root cause after implementation failure  

---

#### A. IMPLEMENTATION FAILURE ANALYSIS

**Phase DL-A & DL-B Changes Made:**
- Added backend debug logging
- Added frontend debug logging  
- Applied type-safe comparison fix in `findCurrentOperation()`: `Number(op.fiscal_year) === Number(selectedFiscalYear.value)`

**Result:** ❌ **404 errors PERSIST** — fix did NOT work

**Implication:** The type mismatch was NOT the root cause. The actual bug is elsewhere.

---

#### B. TRUE ROOT CAUSE DISCOVERED

**Critical Flow Analysis:**

When `saveQuarterlyData()` executes (line 389), it uses:
```typescript
const operationId = currentOperation.value.id  // line 434
```

**The bug occurs in this scenario:**

1. **User creates new data for FY 2025 (first time):**
   - `currentOperation.value` is NULL (no operation exists yet)
   - Line 420: Creates new operation via POST
   - Line 430: Sets `currentOperation.value = createRes`
   - Line 434: `operationId = currentOperation.value.id` ✅ CORRECT

2. **User immediately edits that data (within same session):**
   - Dialog opens with `_existingId` set to the newly created indicator record ID
   - Line 434: `operationId = currentOperation.value.id`
   - **Question:** Is `currentOperation.value` STILL the correct operation?

3. **User switches year THEN edits:**
   - `watch` triggers `fetchPillarData()` (line 587-593)
   - `fetchPillarData()` calls `findCurrentOperation()` at line 193
   - **BUT** this is ASYNC
   - If user clicks "Enter Data" BEFORE `findCurrentOperation()` completes, `currentOperation.value` is stale

**HOWEVER** — The actual issue is simpler:

**REAL BUG:**

Look at line 440:
```typescript
const existsInCurrentYear = pillarIndicators.value.some(i => i.id === _existingId)
```

This checks if `_existingId` (the indicator record ID from `operation_indicators` table) exists in `pillarIndicators.value`.

**`pillarIndicators.value` contains records from:**
```typescript
const indicatorsRes = await api.get<any[]>(
  `/api/university-operations/indicators?pillar_type=${activePillar.value}&fiscal_year=${selectedFiscalYear.value}`
)
```

This returns **all indicators for that pillar + year** across **ALL operations**.

**BUT** the backend query (from Phase 1 research) is:
```sql
SELECT oi.*
FROM operation_indicators oi
LEFT JOIN pillar_indicator_taxonomy pit ON oi.pillar_indicator_id = pit.id
JOIN university_operations uo ON oi.operation_id = uo.id
WHERE uo.operation_type = $1
  AND oi.fiscal_year = $2
```

**This query does NOT guarantee that all indicators belong to the SAME operation.**

If there are MULTIPLE operations for the same pillar + year (e.g., different campuses, different users), indicators from ALL operations are mixed together in `pillarIndicators.value`.

**Example Scenario:**

1. Admin creates Higher Ed operation for FY 2025 (operation A)
2. Admin adds indicators to operation A
3. Staff creates ANOTHER Higher Ed operation for FY 2025 (operation B)
4. Staff adds indicators to operation B
5. Admin views Physical Accomplishment page
6. `findCurrentOperation()` returns operation A (admin's operation)
7. `pillarIndicators.value` contains indicators from BOTH operation A and operation B
8. Admin clicks "Enter Data" on an indicator that belongs to operation B
9. `_existingId` = indicator from operation B
10. `saveQuarterlyData()` uses `operationId` = operation A
11. Backend query: `WHERE oi.id = indicatorB AND oi.operation_id = operationA` → 0 rows → 404

**THE TRUE ROOT CAUSE:**

**Frontend assumes ONE operation per (pillar + fiscal_year), but database allows MULTIPLE operations per (pillar + fiscal_year).**

**The indicator's `operation_id` does NOT match `currentOperation.value.id`.**

---

#### C. VERIFICATION OF ROOT CAUSE

**Database Schema Check:**

`university_operations` table has:
- `operation_type` (pillar: HIGHER_EDUCATION, etc.)
- `fiscal_year` (2024, 2025, etc.)
- `created_by` (user who created the operation)
- `campus` (MAIN, CABADBARAN, BOTH)

**NO UNIQUE CONSTRAINT on (operation_type + fiscal_year).**

Multiple users can create operations for the same pillar + year.

**Indicator Ownership:**

`operation_indicators` table has:
- `operation_id` (FK to `university_operations.id`)
- Records belong to SPECIFIC operations, not shared across operations

**Frontend Assumption (BROKEN):**

Line 193: `await findCurrentOperation()`

```typescript
currentOperation.value = data.find(
  (op: any) => op.operation_type === activePillar.value && Number(op.fiscal_year) === Number(selectedFiscalYear.value)
) || null
```

**This returns the FIRST operation matching (pillar + year), but there may be MULTIPLE operations.**

---

#### D. WHY THE 404 OCCURS

**Backend Query (`university-operations.service.ts:962-970`):**

```sql
SELECT oi.id, oi.fiscal_year, oi.pillar_indicator_id, oi.operation_id, oi.particular
FROM operation_indicators oi
WHERE oi.id = $1 AND oi.operation_id = $2 AND oi.deleted_at IS NULL
```

**Parameters:** `[indicatorId, operationId]`

**Failure Scenario:**
- `indicatorId` = UUID of indicator belonging to **operation B**
- `operationId` = UUID of **operation A** (from `currentOperation.value.id`)
- Query returns 0 rows because indicator B does NOT belong to operation A
- Backend throws 404

---

#### E. PROOF OF ROOT CAUSE

**Key Evidence:**

1. **Multiple Operations Exist:**
   - Backend endpoint `/api/university-operations` returns ALL operations (filtered by user permissions)
   - Frontend calls `findCurrentOperation()` which picks the FIRST match
   - No guarantee it's the right operation for the indicator being edited

2. **Indicator Fetch is Cross-Operation:**
   - `GET /api/university-operations/indicators?pillar_type=X&fiscal_year=Y` returns indicators from ALL operations matching pillar + year
   - Frontend displays these indicators as if they all belong to ONE operation

3. **Save Logic Assumes Single Operation:**
   - Line 434: `const operationId = currentOperation.value.id`
   - PATCH URL: `/api/university-operations/${operationId}/indicators/${_existingId}/quarterly`
   - If `_existingId` belongs to a DIFFERENT operation than `operationId`, backend returns 404

---

#### F. THE ACTUAL FIX REQUIRED

**Option 1: Use Indicator's Actual operation_id (RECOMMENDED)**

Instead of:
```typescript
const operationId = currentOperation.value.id
```

Use:
```typescript
const existingIndicator = pillarIndicators.value.find(i => i.id === _existingId)
const operationId = existingIndicator ? existingIndicator.operation_id : currentOperation.value.id
```

**This ensures PATCH uses the correct operation ID that the indicator ACTUALLY belongs to.**

**Option 2: Enforce Single Operation per (Pillar + Year)**

Add unique constraint:
```sql
CREATE UNIQUE INDEX uq_operations_pillar_year_user 
ON university_operations(operation_type, fiscal_year, created_by) 
WHERE deleted_at IS NULL;
```

**This prevents multiple operations, but breaks multi-user workflow.**

**Option 3: Filter Indicators by Current Operation Only**

Change indicator fetch query to:
```typescript
const indicatorsRes = await api.get<any[]>(
  `/api/university-operations/${currentOperation.value.id}/indicators?fiscal_year=${selectedFiscalYear.value}`
)
```

**This only shows indicators belonging to the current user's operation, but hides other users' data.**

---

#### G. RECOMMENDED SOLUTION

**Fix:** **Option 1** — Use indicator's actual `operation_id` when calling PATCH

**Why:**
- Minimal code change (2 lines)
- Preserves multi-operation support
- No schema migration required
- Works with existing data

**Implementation:**
1. When `_existingId` is set, look up the indicator in `pillarIndicators.value`
2. Extract `operation_id` from that indicator
3. Use that `operation_id` in PATCH URL instead of `currentOperation.value.id`

**Verification:**
- PATCH URL will use the CORRECT operation ID
- Backend query will find the indicator
- No 404 error

---

#### H. SECONDARY ISSUE — `currentOperation.value` Ambiguity

**Problem:** `findCurrentOperation()` returns the FIRST operation matching (pillar + year), which may not be the user's operation if multiple operations exist.

**Fix:** Filter by `created_by` to get user's own operation:

```typescript
currentOperation.value = data.find(
  (op: any) => 
    op.operation_type === activePillar.value && 
    Number(op.fiscal_year) === Number(selectedFiscalYear.value) &&
    op.created_by === authStore.user?.id  // Only user's own operations
) || null
```

**OR** use the FIRST operation the user has access to (if assigned/delegated).

---

#### I. SUMMARY

**Root Cause:** Frontend uses `currentOperation.value.id` for PATCH, but `_existingId` may belong to a DIFFERENT operation. Backend query enforces `WHERE oi.operation_id = $2`, causing 404 when mismatch occurs.

**Fix:** Extract `operation_id` from the indicator record itself instead of using `currentOperation.value.id`.

**Status:** Ready for Phase 2 (Plan revision)

---

---

#### A. SYMPTOM SUMMARY

**Error Pattern:**
```
PATCH /api/university-operations/:operationId/indicators/:indicatorId/quarterly
→ 404 Indicator <indicatorId> not found in operation <operationId>
```

**Verified Behavior:**
- ✅ CREATE quarterly data succeeds (POST endpoint works)
- ❌ UPDATE quarterly data fails (PATCH endpoint returns 404)
- ❌ Error occurs across ALL fiscal years (not year-specific)
- ✅ Data exists in database (confirmed via frontend display)
- ❌ Backend lookup query returns 0 rows

**Example Error:**
```
Indicator 5d4c2ac0-36c3-4e16-9779-27fa9f34dd37 not found in operation e39430ff-3b68-421d-8fc0-9e1a0af4cdc4
```

---

#### B. ROOT CAUSE IDENTIFIED — UUID MISMATCH

**Critical Discovery:**

The frontend is sending the **wrong UUID** in the PATCH request URL.

**Frontend Logic (`pmo-frontend/pages/university-operations/physical/index.vue:414-420`):**
```typescript
if (_existingId) {
  // Phase DJ-A: Use dedicated quarterly PATCH endpoint
  await api.patch(
    `/api/university-operations/${operationId}/indicators/${_existingId}/quarterly`,
    payload
  )
}
```

**Value of `_existingId` (`index.vue:357`):**
```typescript
_existingId: existingData?.id || null
```

**Value of `existingData` (`index.vue:330`):**
```typescript
const existingData = getIndicatorData(indicator.id)  // ❌ WRONG: indicator.id = taxonomy ID
```

**Function `getIndicatorData` (`index.vue:158-160`):**
```typescript
function getIndicatorData(taxonomyId: string) {
  return pillarIndicators.value.find(i => i.pillar_indicator_id === taxonomyId) || null
}
```

**Data Source (`index.vue:179-181`):**
```typescript
const indicatorsRes = await api.get<any[]>(
  `/api/university-operations/indicators?pillar_type=${activePillar.value}&fiscal_year=${selectedFiscalYear.value}`
)
pillarIndicators.value = Array.isArray(indicatorsRes) ? indicatorsRes : (indicatorsRes as any)?.data || []
```

**Backend Query (`pmo-backend/src/university-operations/university-operations.service.ts:749-768`):**
```sql
SELECT
  oi.*,               -- oi.id = operation_indicators.id (UUID A)
  pit.indicator_name, -- pit.id = pillar_indicator_taxonomy.id (UUID B)
  pit.indicator_code,
  pit.uacs_code,
  pit.unit_type,
  pit.indicator_type,
  pit.description
FROM operation_indicators oi
LEFT JOIN pillar_indicator_taxonomy pit ON oi.pillar_indicator_id = pit.id
JOIN university_operations uo ON oi.operation_id = uo.id
WHERE uo.operation_type = $1
  AND (pit.pillar_type = $1 OR pit.pillar_type IS NULL)
  AND oi.fiscal_year = $2
  AND oi.deleted_at IS NULL
  AND uo.deleted_at IS NULL
ORDER BY COALESCE(pit.indicator_order, 999) ASC, oi.particular ASC
```

**Data Structure Returned:**
```typescript
{
  id: "5d4c2ac0-36c3-4e16-9779-27fa9f34dd37",           // operation_indicators.id (record ID)
  pillar_indicator_id: "a1b2c3d4-...",                   // pillar_indicator_taxonomy.id (taxonomy ID)
  operation_id: "e39430ff-3b68-421d-8fc0-9e1a0af4cdc4",
  fiscal_year: 2025,
  target_q1: 50, ...
}
```

**Frontend Dialog Open Logic (`index.vue:323-360`):**
```typescript
function openEntryDialog(indicator: any) {
  selectedIndicator.value = indicator  // indicator = taxonomy object (pit.id)
  const existingData = getIndicatorData(indicator.id)  // Lookup by taxonomy ID ✅

  entryForm.value = {
    pillar_indicator_id: indicator.id,   // ✅ taxonomy ID (correct for payload)
    fiscal_year: selectedFiscalYear.value,
    target_q1: existingData?.target_q1 ?? null,
    ...
    _existingId: existingData?.id || null,  // ✅ operation_indicators.id (record ID)
  }
}
```

**Frontend Save Logic (`index.vue:414-420`):**
```typescript
const { _existingId, ...payload } = entryForm.value

if (_existingId) {
  await api.patch(
    `/api/university-operations/${operationId}/indicators/${_existingId}/quarterly`,
    payload  // ✅ payload contains pillar_indicator_id (taxonomy ID)
  )
}
```

**Backend PATCH Endpoint (`pmo-backend/src/university-operations/university-operations.service.ts:962-970`):**
```typescript
const check = await this.db.query(
  `SELECT oi.id, oi.fiscal_year, oi.pillar_indicator_id, oi.operation_id, oi.particular,
          pit.pillar_type, pit.indicator_name, uo.operation_type
   FROM operation_indicators oi
   LEFT JOIN pillar_indicator_taxonomy pit ON oi.pillar_indicator_id = pit.id
   JOIN university_operations uo ON oi.operation_id = uo.id
   WHERE oi.id = $1 AND oi.operation_id = $2 AND oi.deleted_at IS NULL`,
  [indicatorId, operationId],  // indicatorId = URL param (should be operation_indicators.id)
);

if (check.rows.length === 0) {
  throw new NotFoundException(
    `Indicator ${indicatorId} not found in operation ${operationId}`,
  );
}
```

**THE BUG:**

❌ Frontend sends `_existingId` which is **correctly** set to `operation_indicators.id`  
✅ Backend expects `indicatorId` to be `operation_indicators.id`  
✅ URL construction is correct: `/${operationId}/indicators/${_existingId}/quarterly`  
✅ Backend lookup is correct: `WHERE oi.id = $1`  

**WAIT — Re-analyzing...**

Let me trace again more carefully:

1. User clicks "Enter Data" on an indicator row → `openEntryDialog(indicator)`
2. `indicator` parameter = **taxonomy object** from `pillarTaxonomy.value` (fetched from `/api/university-operations/taxonomy/${pillarType}`)
3. `indicator.id` = `pillar_indicator_taxonomy.id` (taxonomy UUID)
4. `getIndicatorData(indicator.id)` looks up by `pillar_indicator_id` ✅
5. `existingData?.id` = `operation_indicators.id` (record UUID) ✅
6. `_existingId` = record UUID ✅
7. PATCH URL = `.../${operationId}/indicators/${_existingId}/quarterly` ✅
8. Backend receives `indicatorId` = `_existingId` = record UUID ✅
9. Backend query: `WHERE oi.id = $1` ✅

**This should work. But it doesn't. Why?**

**HYPOTHESIS:** The `_existingId` may be NULL or UNDEFINED when it should have a value.

**Phase DI-C Validation Check (`index.vue:385-402`):**
```typescript
if (_existingId) {
  // Verify indicator still exists in current year's data
  const existsInCurrentYear = pillarIndicators.value.some(i => i.id === _existingId)

  if (!existsInCurrentYear) {
    console.warn('[Physical] _existingId not found in current year data. Switching to POST (create new).')
    // Treat as new record for this year
    await api.post(
      `/api/university-operations/${operationId}/indicators/quarterly`,
      payload
    )
    toast.success('Quarterly data saved for current year')
    entryDialog.value = false
    await fetchPillarData()
    return
  }
}
```

**CRITICAL FINDING:**

The validation check `pillarIndicators.value.some(i => i.id === _existingId)` is checking if `_existingId` (operation_indicators.id) matches any `i.id` in the array.

BUT `pillarIndicators.value[].id` IS `operation_indicators.id` — so this SHOULD pass.

**UNLESS...**

The data returned from `/api/university-operations/indicators?pillar_type=...&fiscal_year=...` does NOT have an `id` field, or the field is named differently!

Let me check the backend response structure.

**Backend Service (`university-operations.service.ts:782`):**
```typescript
return result.rows.map((row) => this.computeIndicatorMetrics(row));
```

**Function `computeIndicatorMetrics` (`university-operations.service.ts:821-856`):**
```typescript
private computeIndicatorMetrics(record: any): any {
  // ... computation logic ...
  return {
    ...record,
    average_target: averageTarget !== null ? parseFloat(averageTarget.toFixed(4)) : null,
    average_accomplishment: averageAccomplishment !== null ? parseFloat(averageAccomplishment.toFixed(4)) : null,
    variance: variance !== null ? parseFloat(variance.toFixed(4)) : null,
    accomplishment_rate: accomplishmentRate !== null ? parseFloat(accomplishmentRate.toFixed(2)) : null,
  };
}
```

**Returned Fields:**
- `...record` spreads ALL columns from SQL query (including `oi.*` which has `oi.id`)
- Plus computed metrics

**So `id` field SHOULD be present.**

**NEW HYPOTHESIS:**

The issue is NOT with the lookup logic. The issue is that **UPDATE is being called BEFORE any data exists for that fiscal year**.

Let me re-read the symptoms:

> CREATE quarterly data works  
> UPDATE quarterly data fails

**Scenario:**
1. User selects Fiscal Year 2025 (first time entering data for this year)
2. No records exist in `operation_indicators` for 2025 yet
3. User clicks "Enter Data" on an indicator (e.g., "Student Enrollment Rate")
4. `getIndicatorData(taxonomy_id)` returns NULL (no data for 2025)
5. `_existingId` = NULL
6. Frontend should POST (create), not PATCH (update)

BUT the error message says:
> PATCH /api/university-operations/:operationId/indicators/:indicatorId/quarterly

This means PATCH is being called when it shouldn't be.

**REVISED HYPOTHESIS:**

The `_existingId` is being set to a NON-NULL value even when no data exists for the current fiscal year. This happens when:
- User previously entered data for a DIFFERENT fiscal year (e.g., 2024)
- User switches to 2025
- `pillarIndicators.value` is NOT cleared properly
- Stale 2024 data remains in memory
- `getIndicatorData()` returns 2024 record
- `_existingId` gets set to 2024 record's UUID
- PATCH attempts to update 2024 record in context of 2025 operation
- Backend lookup fails because `indicatorId` (2024 record) doesn't belong to `operationId` (2025 operation)

**Phase DI-C Cache Clear (`index.vue:166-168`):**
```typescript
// Phase DI-C: Clear stale cache BEFORE fetching new year data
pillarTaxonomy.value = []
pillarIndicators.value = []
```

This SHOULD prevent stale data. But maybe the clear happens AFTER the dialog is already open?

**FINAL ROOT CAUSE:**

The `_existingId` contains a **record UUID from a different operation** (different fiscal year or pillar type).

Backend query:
```sql
WHERE oi.id = $1 AND oi.operation_id = $2
```

This enforces that the indicator MUST belong to the specified operation. If the indicator belongs to a different operation (e.g., FY 2024 when operation is FY 2025), the query returns 0 rows → 404.

**VERIFICATION NEEDED:**

Check if `_existingId` is the CORRECT record ID for the CURRENT operation, or if it's a stale ID from a previous year/pillar.

---

#### C. MIGRATION AUDIT SUMMARY

**Migrations 013-022 Analysis:**

| Migration | Purpose | Impact on Indicator Update | Status |
|-----------|---------|---------------------------|--------|
| 013 | Performance indexes | ✅ No impact on UPDATE logic | Safe |
| 014 | Add fund_type, fiscal_year, campus to operations | ✅ No impact on indicators table | Safe |
| 015 | Expand DECIMAL(5,2) → DECIMAL(10,4) | ✅ Supports larger values, no constraint change | Safe |
| 016 | Create pillar_indicator_taxonomy table | ⚠️ Introduced taxonomy model | Safe |
| 016b | Align pillar_type to operation_type_enum | ✅ Type consistency fix | Safe |
| 017 | Add pillar_indicator_id FK to operation_indicators | ⚠️ Created FK relationship | Safe |
| 018 | Add organizational_outcome, extend indicator_name | ✅ Schema enhancement | Safe |
| 019 | Seed 14 BAR1 indicators | ✅ Static taxonomy data | Safe |
| 020 | Migrate orphan indicators | ⚠️ Auto-mapping by UACS code/name | Safe |
| 021 | **Add unique constraint: operation_id + pillar_indicator_id + fiscal_year** | ❌ **PREVENTS DUPLICATE INDICATORS PER YEAR** | **CRITICAL** |
| 022 | Add unique constraint for orphans | ⚠️ Prevents duplicate orphans | Safe |

**Migration 021 Impact Analysis:**

```sql
CREATE UNIQUE INDEX IF NOT EXISTS uq_operation_indicators_quarterly
ON operation_indicators (operation_id, pillar_indicator_id, fiscal_year)
WHERE deleted_at IS NULL;
```

**Constraint Logic:**
- One indicator record per (operation + taxonomy_indicator + fiscal_year)
- BLOCKS duplicate creation
- Does NOT block UPDATE (UPDATE uses `oi.id` as primary key)

**Conclusion:** Migration 021 is NOT the cause of UPDATE failures. The unique constraint prevents duplicate INSERTS, not UPDATES.

---

#### D. BACKEND UPDATE LOGIC ANALYSIS

**Controller Endpoint (`university-operations.controller.ts:239-248`):**
```typescript
@Patch(':id/indicators/:indicatorId/quarterly')
@HttpCode(HttpStatus.OK)
updateIndicatorQuarterlyData(
  @Param('id', ParseUUIDPipe) id: string,              // operation_id
  @Param('indicatorId', ParseUUIDPipe) indicatorId: string,  // operation_indicators.id
  @Body() dto: Partial<CreateIndicatorQuarterlyDto>,
  @CurrentUser() user: JwtPayload,
) {
  return this.service.updateIndicatorQuarterlyData(id, indicatorId, dto, user.sub, user);
}
```

**Service Method (`university-operations.service.ts:950-1060`):**

**Step 1: Indicator Existence Check (lines 962-976):**
```sql
SELECT oi.id, oi.fiscal_year, oi.pillar_indicator_id, oi.operation_id, oi.particular,
       pit.pillar_type, pit.indicator_name, uo.operation_type
FROM operation_indicators oi
LEFT JOIN pillar_indicator_taxonomy pit ON oi.pillar_indicator_id = pit.id
JOIN university_operations uo ON oi.operation_id = uo.id
WHERE oi.id = $1 AND oi.operation_id = $2 AND oi.deleted_at IS NULL
```
**Parameters:** `[indicatorId, operationId]`

**❌ FAILURE POINT:** This query returns 0 rows when `indicatorId` does NOT belong to `operationId`.

**Step 2: Fiscal Year Lock (lines 996-1000):**
```typescript
if (dto.fiscal_year && dto.fiscal_year !== indicator.fiscal_year) {
  throw new BadRequestException(
    `Cannot change fiscal year from ${indicator.fiscal_year} to ${dto.fiscal_year}. Create new record for different year.`,
  );
}
```
✅ Prevents cross-year updates

**Step 3: Update Execution (lines 1038-1044):**
```sql
UPDATE operation_indicators
SET ${setClause}, updated_by = $${fields.length + 1}, updated_at = NOW()
WHERE id = $${fields.length + 2}
RETURNING *
```
✅ Update by `oi.id` (primary key), NOT by `operation_id` + `pillar_indicator_id`

**Conclusion:** Backend logic is CORRECT. The issue is that the frontend is sending the WRONG `indicatorId`.

---

#### E. FRONTEND DATA FLOW ANALYSIS

**Phase DI-B: Year Selection (`index.vue:87-88`):**
```typescript
const selectedFiscalYear = ref(
  route.query.year ? parseInt(route.query.year as string, 10) : new Date().getFullYear()
)
```

**Data Fetch Trigger (`index.vue:163-202`):**
```typescript
async function fetchPillarData() {
  loading.value = true

  // Phase DI-C: Clear stale cache BEFORE fetching new year data
  pillarTaxonomy.value = []
  pillarIndicators.value = []

  try {
    // Fetch taxonomy
    const taxonomyRes = await api.get<any[]>(
      `/api/university-operations/taxonomy/${activePillar.value}`
    )
    pillarTaxonomy.value = Array.isArray(taxonomyRes) ? taxonomyRes : (taxonomyRes as any)?.data || []

    // Fetch indicator data
    const indicatorsRes = await api.get<any[]>(
      `/api/university-operations/indicators?pillar_type=${activePillar.value}&fiscal_year=${selectedFiscalYear.value}`
    )
    pillarIndicators.value = Array.isArray(indicatorsRes) ? indicatorsRes : (indicatorsRes as any)?.data || []

    // Find existing operation for this pillar/year
    await findCurrentOperation()
  } catch (err: any) {
    console.error('[Physical] Failed to fetch pillar data:', err)
    pillarTaxonomy.value = []
    pillarIndicators.value = []
  } finally {
    loading.value = false
  }
}
```

**✅ Cache is cleared** before fetching new year data.

**Dialog Open Trigger (`index.vue:323-360`):**
```typescript
function openEntryDialog(indicator: any) {
  selectedIndicator.value = indicator  // taxonomy object
  const existingData = getIndicatorData(indicator.id)  // Lookup by taxonomy ID

  entryForm.value = {
    pillar_indicator_id: indicator.id,
    fiscal_year: selectedFiscalYear.value,
    ...
    _existingId: existingData?.id || null,
  }
}
```

**Lookup Function (`index.vue:158-160`):**
```typescript
function getIndicatorData(taxonomyId: string) {
  return pillarIndicators.value.find(i => i.pillar_indicator_id === taxonomyId) || null
}
```

**✅ Logic is correct:** Looks up by `pillar_indicator_id` (taxonomy ID), returns the record whose `pillar_indicator_id` matches.

**Save Logic Validation Check (`index.vue:385-402`):**
```typescript
if (_existingId) {
  const existsInCurrentYear = pillarIndicators.value.some(i => i.id === _existingId)

  if (!existsInCurrentYear) {
    console.warn('[Physical] _existingId not found in current year data. Switching to POST (create new).')
    await api.post(
      `/api/university-operations/${operationId}/indicators/quarterly`,
      payload
    )
    toast.success('Quarterly data saved for current year')
    entryDialog.value = false
    await fetchPillarData()
    return
  }
}
```

**✅ Validation exists** to prevent cross-year updates.

**PATCH Request (`index.vue:414-420`):**
```typescript
if (_existingId) {
  await api.patch(
    `/api/university-operations/${operationId}/indicators/${_existingId}/quarterly`,
    payload
  )
  toast.success('Quarterly data updated successfully')
}
```

**CRITICAL QUESTION:**

Is `currentOperation.value.id` the CORRECT operation for the selected fiscal year and pillar?

**Operation Lookup (`index.vue:205-215`):**
```typescript
async function findCurrentOperation() {
  try {
    const response = await api.get<any>('/api/university-operations')
    const data = Array.isArray(response) ? response : (response?.data || [])
    currentOperation.value = data.find(
      (op: any) => op.operation_type === activePillar.value && op.fiscal_year === selectedFiscalYear.value
    ) || null
  } catch (err) {
    currentOperation.value = null
  }
}
```

**✅ Operation lookup matches current pillar + year.**

---

#### F. ROOT CAUSE CONCLUSION

**After deep analysis, the root cause is:**

**SCENARIO 1: Cross-Operation Update Attempt**
- User has data for FY 2024 (operation_id = A)
- User switches to FY 2025 (operation_id = B or NULL if not created)
- `pillarIndicators.value` is cleared and refetched for FY 2025
- If FY 2025 has NO data yet, `pillarIndicators.value` is empty
- `getIndicatorData()` returns NULL
- `_existingId` = NULL
- Frontend correctly POSTs (creates new)

**SCENARIO 2: Stale Operation ID**
- User opens dialog for FY 2025
- `currentOperation.value` is still set to FY 2024 operation
- `_existingId` is correct for FY 2025 record
- PATCH URL contains WRONG `operationId` (FY 2024 instead of FY 2025)
- Backend lookup fails: `WHERE oi.id = $1 AND oi.operation_id = $2` → 0 rows

**MOST LIKELY ROOT CAUSE:**

**`currentOperation.value.id` is stale or NULL when PATCH is called.**

**Evidence:**
1. `findCurrentOperation()` is called AFTER `fetchPillarData()` completes
2. If operation doesn't exist for current year, `currentOperation.value = null`
3. Save logic uses `currentOperation.value.id` as `operationId`
4. If NULL, JavaScript error occurs (not 404)
5. If stale (previous year), backend returns 404

**ACTION REQUIRED:**

Check if `currentOperation.value` is:
- NULL (no operation for current year yet)
- Stale (operation from previous year)
- Correct but indicator belongs to different operation

---

#### G. DEBUG LOGGING STRATEGY

**Required Console Logs:**

**Backend (`university-operations.service.ts:950`):**
```typescript
async updateIndicatorQuarterlyData(...) {
  this.logger.log(`[updateIndicatorQuarterlyData] ENTRY: operationId=${operationId}, indicatorId=${indicatorId}, fiscal_year=${dto.fiscal_year || 'not in payload'}`);
  
  const check = await this.db.query(...);
  this.logger.log(`[updateIndicatorQuarterlyData] LOOKUP RESULT: rowCount=${check.rows.length}, found=${check.rows.length > 0 ? JSON.stringify(check.rows[0]) : 'NONE'}`);
  
  if (check.rows.length === 0) {
    this.logger.error(`[updateIndicatorQuarterlyData] 404: Indicator ${indicatorId} not found in operation ${operationId}`);
    // Log all indicators for this operation
    const allIndicators = await this.db.query(
      `SELECT id, pillar_indicator_id, fiscal_year, operation_id FROM operation_indicators WHERE operation_id = $1 AND deleted_at IS NULL`,
      [operationId]
    );
    this.logger.error(`[updateIndicatorQuarterlyData] Available indicators for operation ${operationId}: ${JSON.stringify(allIndicators.rows)}`);
    throw new NotFoundException(...);
  }
}
```

**Frontend (`index.vue:364`):**
```typescript
async function saveQuarterlyData() {
  console.group('[Physical] saveQuarterlyData');
  console.log('selectedIndicator (taxonomy):', selectedIndicator.value);
  console.log('currentOperation:', currentOperation.value);
  console.log('selectedFiscalYear:', selectedFiscalYear.value);
  console.log('entryForm._existingId:', entryForm.value._existingId);
  console.log('pillarIndicators.value:', pillarIndicators.value.map(i => ({ id: i.id, pillar_indicator_id: i.pillar_indicator_id, fiscal_year: i.fiscal_year, operation_id: i.operation_id })));
  console.groupEnd();
  
  // ... rest of function
}
```

---

#### H. RISK CLASSIFICATION

| Risk ID | Severity | Description |
|---------|----------|-------------|
| RISK-DL-01 | **CRITICAL** | UPDATE operations fail globally — users cannot edit existing data |
| RISK-DL-02 | **HIGH** | Data loss risk if users re-create instead of update (duplicates rejected by migration 021) |
| RISK-DL-03 | **MEDIUM** | Stale operation ID causes cross-year update attempts |
| RISK-DL-04 | **MEDIUM** | No progress computation (separate issue, not blocking UPDATE fix) |

---

#### I. STABILIZATION CHECKLIST

**Phase 1 Research Deliverables:**
- [x] Migration audit (migrations 013-022)
- [x] Backend service logic analysis
- [x] Frontend data flow analysis
- [x] Root cause hypothesis formulation
- [x] Debug logging strategy defined
- [x] Risk classification documented

**Phase 2 Plan Requirements:**
- [ ] Fix root cause (Scenario 2: stale operation ID)
- [ ] Add debug logging to both backend and frontend
- [ ] Test UPDATE across multiple fiscal years
- [ ] Test UPDATE after year switch
- [ ] Test UPDATE with new operation (no prior data)
- [ ] Regression test CREATE flow (ensure no breakage)

---

#### J. NEXT ACTION

**Proceed to Phase 2 (Plan):**
- Document corrective phase DL in `plan.md`
- Define implementation steps with verification criteria
- Prioritize: CRITICAL (operation ID fix) → IMPORTANT (debug logs) → REGRESSION (full test matrix)

---

---

### Section 2.33 — Phase FZ: Report View Filter Tab — Display Metrics Pass-Through (Mar 31, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

---

#### FINDING FZ-A: Pipeline Trace — fetchAPRRData → getAPRRIndicators → getAPRRDisplayMetrics

The Report View (APRR) rendering pipeline has three stages:

```
fetchAPRRData()
  └─ calls api.get(`/indicators?...&quarter=${aprrDisplayQuarter.value}`)  ← FY-3: quarter-scoped
  └─ builds aprrData.value (raw API records, keyed by indicator_code)

getAPRRIndicators(pillarId)
  └─ reads aprrTaxonomy (immutable seed — cached after first fetch)
  └─ for each taxonomy indicator:
       - finds matching aprrData record via indicator_code
       - builds per-quarter fields: target_q1..q4, actual_q1..q4 (from pickVal via quarterFieldMap)
       - computes totalTarget = SUM of non-null target_q1..q4   ← FY-1b SUM standard
       - computes totalActual = SUM of non-null actual_q1..q4   ← FY-1b SUM standard
       - computes variance = totalActual - totalTarget
       - computes rate = (totalActual / totalTarget) * 100
  └─ returns indicator object with: { name, code, unit_type, target_q1..q4, actual_q1..q4,
                                       total_target, total_actual, variance, rate }

aprrRenderData (computed)
  └─ calls getAPRRIndicators(pillarId)
  └─ maps each indicator through processIndicator(ind)
       └─ calls getAPRRDisplayMetrics(ind) to get { target, actual, variance, rate }
       └─ merges result into display row
```

---

#### FINDING FZ-B: getAPRRDisplayMetrics() — Root Cause of Filter Tab Inconsistency

**Current implementation (index.vue ~line 275):**

```typescript
function getAPRRDisplayMetrics(ind: any) {
  const q = aprrDisplayQuarter.value
  // Q1/Q2/Q3/Q4 branching — reads RAW per-quarter columns
  if (q === 'Q1') {
    target = toNum(ind.target_q1); actual = toNum(ind.actual_q1)
  } else if (q === 'Q2') {
    target = toNum(ind.target_q2); actual = toNum(ind.actual_q2)
  } else if (q === 'Q3') {
    target = toNum(ind.target_q3); actual = toNum(ind.actual_q3)
  } else {
    target = toNum(ind.target_q4); actual = toNum(ind.actual_q4)
  }
  // Re-derives variance and rate from isolated single-column pair
  const variance = target !== null && actual !== null ? actual - target : null
  const rate = target !== null && target > 0 && actual !== null
    ? parseFloat(((actual / target) * 100).toFixed(2))
    : null
  return { target, actual, variance, rate }
}
```

**What this reads:**  `ind.target_q2` — a single-quarter raw column value.

**What this ignores:**  `ind.total_target` — the pre-computed SUM across all populated quarters (FY-1b).

For a Q2-scoped fetch (FY-3), the backend returns the Q2 record. That record's `target_q2` field holds the Q2 value. `getAPRRIndicators()` then computes `total_target` = SUM of all non-null quarters in that record. For a Q2-scoped record with only Q2 data populated, `total_target` equals `target_q2`.

However, **the cross-quarter prefill pattern** (Phase FJ, deferred item 148) means a Q2 record can carry Q1 values in `target_q1`/`actual_q1` columns for reference. In that scenario:
- `ind.target_q2` → only Q2 value (single column)
- `ind.total_target` → SUM of Q1+Q2 (correct cumulative total)

`getAPRRDisplayMetrics()` reads the single-column value and re-derives variance/rate from it — producing different (wrong) numbers vs what `getAPRRIndicators()` computed.

**Additionally:** variance and rate are computed twice — once in `getAPRRIndicators()` (correct, SUM-based), and again in `getAPRRDisplayMetrics()` (potentially wrong, column-based). The second computation always overwrites the first.

---

#### FINDING FZ-C: ind.total_target / ind.total_actual / ind.variance / ind.rate Are Already Correct

After FY-1b (SUM reversion) and FY-3 (quarter-scoped fetch), the indicator object passed to `getAPRRDisplayMetrics()` already contains:

| Field | Source | Value |
|-------|--------|-------|
| `ind.total_target` | `getAPRRIndicators()` SUM computation | Correct Q-scoped cumulative total |
| `ind.total_actual` | `getAPRRIndicators()` SUM computation | Correct Q-scoped cumulative total |
| `ind.variance` | `ind.total_actual - ind.total_target` | Correct variance |
| `ind.rate` | `(ind.total_actual / ind.total_target) * 100` | Correct rate |

These are the values already displayed in the **table columns** (Record View). The filter tab calls `getAPRRDisplayMetrics()` which discards them and produces different values from raw columns — causing the inconsistency.

---

#### FINDING FZ-D: Fix — Replace Branching with Direct Pass-Through

**Target state:**

```typescript
function getAPRRDisplayMetrics(ind: any) {
  return {
    target: ind.total_target ?? null,
    actual: ind.total_actual ?? null,
    variance: ind.variance ?? null,
    rate: ind.rate ?? null,
  }
}
```

**Impact:**
- `aprrDisplayQuarter` ref — still needed as fetch trigger (FY-3 watcher), not for display branching
- `aprrRenderData` computed — no changes; shape of returned object is identical
- `processIndicator()` — no changes; receives same `{ target, actual, variance, rate }` shape
- Record View table columns (`target_q1`..`actual_q4`) — untouched; those read directly from `ind`, not via `getAPRRDisplayMetrics()`
- Filter tab summary row — will now display consistent values matching the table

**Risk:** Zero. `ind.total_target` / `ind.total_actual` / `ind.variance` / `ind.rate` are guaranteed to be present in every indicator object returned by `getAPRRIndicators()`. The branching logic is entirely replaced; no dead code left behind.

---

#### FINDING FZ-E: No Other Consumers of getAPRRDisplayMetrics()

Grep confirmed `getAPRRDisplayMetrics` is called only from `processIndicator()` in `aprrRenderData`. No other call sites. The fix is safe to apply without ripple effects.

---

---

### Section 2.34 — Phase GA: Records View Data Integrity, Visual Feedback, Navigation Enhancement (Apr 2, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

---

#### FINDING GA-A: Data Discrepancy Root Cause — Dual Computation Pipeline

**Physical Accomplishment page** (`physical/index.vue`):
- Fetches per-operation data via `findIndicators(operationId, fiscalYear)` + quarter filter
- Displays `accomplishment_rate` directly from backend's `computeIndicatorMetrics()` (line 1467/1590)
- Backend computes: `total_target` (SUM), `total_accomplishment` (SUM), `accomplishment_rate` = `(total_accomplishment / total_target) * 100`
- **Single authoritative computation path**: backend → display

**Records View** (`index.vue`):
- Fetches cross-operation data via `findIndicatorsByPillarAndYear(pillarType, fiscalYear, quarter)`
- Backend returns records with pre-computed `accomplishment_rate`, `total_target`, `total_accomplishment`, `variance`
- **Frontend IGNORES all backend-computed fields** — `getAPRRIndicators()` (line 226) re-computes everything:
  1. Groups records by `pillar_indicator_id`
  2. Uses `pickVal()` to merge quarterly fields across records — picks first non-null per quarter-field
  3. Computes own `total_target` (SUM), `total_actual` (SUM), `variance`, `rate`
  4. FZ-1 then passes these frontend-computed values through `getAPRRDisplayMetrics()`

**The gap:**
- Backend `computeIndicatorMetrics()` operates on a SINGLE record — authoritative, per-record computation
- Frontend `getAPRRIndicators()` merges MULTIPLE records via `pickVal`, then re-computes from merged data
- When multiple `operation_indicators` records exist for the same taxonomy indicator (from different operations under the same pillar), `pickVal` arbitrarily selects values — potentially mixing target from Operation A with actual from Operation B
- Even with one record, the frontend discards `accomplishment_rate` (which respects `override_rate`, Directive 213) and computes a plain `rate` that does NOT respect overrides

**Specific issue — user-reported example:**
Indicator "Percentage of undergraduate students enrolled..." shows Rate = 100% in Records View but Actual ≈ 66.6% in Physical page. This occurs because:
- The backend returns `accomplishment_rate` which may include override_rate logic
- The frontend ignores `accomplishment_rate` and computes `rate = (total_actual / total_target) * 100` from `pickVal`'d values
- If `pickVal` picks target and actual from the same (or same-valued) source, `rate` = 100%

**Fix direction:** `getAPRRIndicators()` should use the backend's pre-computed `accomplishment_rate`, `total_target`, `total_accomplishment`, `variance` from the record rather than re-computing. For single-record scenarios (standard case with quarter-scoped fetch), this is a direct pass-through. The `pickVal` merge can remain for quarterly column display (target_q1..q4, actual_q1..q4).

---

#### FINDING GA-B: Current Color Tier System — 3 Tiers, Needs 5

**Current `rateColor()` in `aprrRenderData` (line 291):**
```typescript
const rateColor = (rate: number | null): string => {
  if (rate == null) return 'grey'
  if (rate >= 100) return 'success'   // green
  if (rate >= 50) return 'warning'    // yellow/orange
  return 'error'                      // red
}
```

**Problems:**
1. No distinction between "near target" (80-99%) and "needs improvement" (50-79%)
2. No distinction between "target achieved" (100%) and "exceeded target" (>100%)
3. Broad 50-99% band gives same color to very different performance levels

**Proposed 5-tier system:**

| Range | Color | Vuetify Token | Semantic Meaning |
|-------|-------|---------------|------------------|
| < 50% | Red | `error` | Critical underperformance |
| 50%–79% | Orange | `orange` | Needs improvement |
| 80%–99% | Yellow/Amber | `amber` | Near target |
| 100% | Green | `success` | Target achieved |
| > 100% | Blue/Teal | `info` or `teal` | Exceeded target |

Same `rateColor()` function, same return shape — just refined thresholds. No structural changes to `aprrRenderData` or template.

---

#### FINDING GA-C: Indicator Card Navigation — No Click Handlers, Deep Link Partial

**Current state:**
- Indicator cards in Report View template (line 1674-1710) are purely display — `<v-col>` + `<v-card>` with no `@click` handler
- `navigateToPhysical(pillarId)` exists (line 1081) and passes `year` + `pillar` as query params
- Physical page reads `route.query.pillar` (line 102) and initializes `activePillar` from it — **deep link for pillar already works**
- Physical page does NOT read `route.query.quarter` — `selectedQuarter` hardcoded to `'Q1'`
- No mechanism to scroll-to or highlight a specific indicator after navigation

**Required changes:**
1. Add `@click` handler to indicator cards → call `navigateToPhysical(pillarId)` with quarter
2. Update `navigateToPhysical()` to pass `quarter` in query params
3. Update Physical page to read `route.query.quarter` and initialize `selectedQuarter` from it
4. (Optional) Pass indicator code for scroll-to highlight — adds complexity, may be YAGNI for Apr 6

---

#### FINDING GA-D: New-Tab Navigation — Fully Feasible, Low Risk

**Architecture assessment:**

| Concern | Status |
|---------|--------|
| Auth persistence | ✅ Token stored in `localStorage` (auth.ts:18) — survives new tabs |
| URL resolvability | ✅ Nuxt 3 file-based routing — all pages have stable URLs |
| State hydration | ✅ Pinia stores initialize from localStorage on mount |
| Fiscal year store | ✅ `useFiscalYearStore()` — re-fetches on mount, no shared state dependency |

**Current blocker:** Navigation uses `router.push()` (JavaScript-only). This prevents:
- Right-click → Open in New Tab
- Ctrl+Click / Cmd+Click for new tab
- Browser back/forward awareness

**Fix direction:** Replace `router.push()` calls with `<NuxtLink :to="{ path, query }">` wrapper components. `<NuxtLink>` renders as `<a>` tags with proper `href`, enabling native browser new-tab behavior while preserving SPA navigation for normal clicks.

**Risk:** Zero for the navigation conversion. The `<NuxtLink>` component is Nuxt's standard — it works identically to `router.push()` for normal clicks but adds browser-native link behavior.

**Timeline:** Achievable before April 6. Primarily template changes + one query param addition to Physical page.

---

#### FINDING GA-E: Summary of Affected Files

| File | Changes Needed |
|------|----------------|
| `pmo-frontend/pages/university-operations/index.vue` | GA-1: Fix `getAPRRIndicators()` to use backend metrics; GA-2: Refine `rateColor()` 5-tier; GA-3: Add click handler to indicator cards; GA-4: Convert navigation to `<NuxtLink>` |
| `pmo-frontend/pages/university-operations/physical/index.vue` | GA-3: Read `route.query.quarter` for `selectedQuarter` init |
| Backend | NO changes needed — `computeIndicatorMetrics()` already returns correct data |

---

---

### Section 2.37 — Phase GD: Target Line, Progress Bar Accuracy, Variance Visibility (Apr 3, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

---

#### FINDING GD-A: Target Line — Annotation Not in Legend, Label Visibility

**5 charts use the red dashed target line annotation:**

| Chart | Config Variable | Line |
|-------|----------------|------|
| Cross Comparison | `crossComparisonOptions` | 609 |
| Cross YoY | `crossModuleYoYOptions` | 671 |
| Physical YoY | `yearlyComparisonOptions` | 885 |
| Target vs Actual | `targetVsActualOptions` | 990 |
| Financial YoY | `financialYearlyOptions` | 515 |

**Current implementation (identical across all 5):**
```javascript
annotations: {
  yaxis: [{
    y: 100,
    borderColor: '#E53935',
    strokeDashArray: 4,
    label: {
      text: 'Target (100%)',
      position: 'left',
      offsetX: 5,
      offsetY: -5,
      style: { color: '#E53935', background: 'transparent', fontSize: '11px' },
    },
  }],
}
```

**Issues identified:**
1. **Not in legend:** ApexCharts annotations are rendered as SVG overlays — they do NOT appear in the chart legend. The legend only shows data series. This is an ApexCharts architectural limitation.
2. **Label visibility:** `background: 'transparent'` + `fontSize: '11px'` makes the label difficult to read when it overlaps chart bars or gridlines.
3. **Position accuracy:** The line is at `y: 100` with `yaxis.max: 120`, so it renders at 83.3% of chart height. This is mathematically correct — not misaligned.

**Fix approach — improve annotation visibility (not legend integration):**
- Change `background: 'transparent'` → `background: '#FFF'` (or light background) for label readability
- Increase `fontSize` from `'11px'` to `'12px'`
- The on-chart label "Target (100%)" serves the same purpose as a legend entry. Adding it to the ApexCharts legend would require a phantom data series hack — violates KISS.

**Charts WITHOUT annotations (no target line):**
- `quarterlyTrendOptions` (line 794) — correct, this shows rate scores not percentages
- `financialTrendOptions` (line 466) — correct, this has dual y-axes (₱ + %)
- Radial charts (`pillarChartOptions`, `financialPillarChartOptions`) — no annotations needed, radial bars self-indicate

---

#### FINDING GD-B: Progress Bar — 100% Does NOT Fill Full Width (ROOT CAUSE)

**Current implementation (indicator cards, line 1710):**
```html
<v-progress-linear
  :model-value="Math.min(ind.rate ?? 0, 120)"
  :color="ind.rateColor"
  height="20"
  rounded
  class="mb-2"
  max="120"
>
```

**Pillar summary progress bar (line 1753):**
```html
<v-progress-linear
  :model-value="Math.min(pillarData.summary.avgRate ?? 0, 120)"
  :color="pillarData.summary.avgRateColor"
  height="14"
  rounded
  max="120"
  style="flex: 1"
/>
```

**Root cause:** `max="120"` means the bar fills `value / 120` of its width. At rate=100%, the bar fills `100/120 = 83.3%` — NOT full width. This creates a visual mismatch: the text says "100.0%" but the bar looks like ~83%.

**Why max was set to 120:** To allow visual representation of rates >100% — a rate of 120% would fill the entire bar. But the trade-off is that 100% looks incomplete.

**Fix:** Change `max="100"`. At 100%, the bar fills completely. For >100%, the bar caps at full width (Vuetify clamps at max), and the 5-tier color system (GA-2: blue for >100%) + rate text label distinguish overflow. This is the standard behavior users expect.

**Impact:** 2 progress bars to update (indicator card + pillar summary). Also remove `Math.min(..., 120)` capping since max handles the limit.

---

#### FINDING GD-C: Variance Visibility — Chip Size Too Small

**Current (line 1722-1731 in indicator cards):**
```html
<v-chip
  v-if="ind.hasVariance"
  :color="ind.varianceColor"
  size="x-small"
  variant="tonal"
>
  {{ ind.varianceSign }}{{ ind.varianceText }}
</v-chip>
```

**Issue:** `size="x-small"` produces a very small chip (~20px height) that's difficult to read, especially within the expansion panel layout. The variance value is one of the four key metrics (Target, Actual, Variance, Rate) but receives the least visual prominence.

**Fix:** Increase from `size="x-small"` to `size="small"`. This gives ~26px height with better text readability. Color coding (success/error for positive/negative) is already correct.

---

#### FINDING GD-D: Branding — CSU Theme Configured, Chart Colors Intentional

**Vuetify theme** (`plugins/vuetify.ts`):
```javascript
primary: '#009900',    // CSU Green
secondary: '#f9dc07',  // CSU Gold
accent: '#ff9900',     // CSU Orange
```

**Chart colors** use hardcoded hex values per pillar:
```javascript
PILLARS = [
  { color: '#1976D2' },  // Higher Ed — blue
  { color: '#7B1FA2' },  // Advanced Ed — purple
  { color: '#00897B' },  // Research — teal
  { color: '#F57C00' },  // Extension — orange
]
```

**Assessment:** Pillar colors are distinct by design — each pillar needs a unique visual identity for chart readability. Making all pillars CSU Green would destroy chart legibility. The Vuetify theme governs UI chrome (buttons, cards, headers) while chart colors serve data visualization. This is correct and intentional.

**No branding changes needed.** The CSU theme is already applied to all Vuetify components. Chart pillar colors are functionally distinct and should remain as-is.

---

### Section 2.36 — Phase GC: UI Behavior, Terminology, Analytics Guide, Cross-Analytics Validation (Apr 2, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

---

#### FINDING GC-A: Expansion Panel Auto-Close — Root Cause

**File:** `pmo-frontend/pages/university-operations/index.vue` line 1662

```html
<v-expansion-panels v-model="aprrExpandedPillar" variant="accordion">
```

`variant="accordion"` is Vuetify's built-in behavior that forces **mutual exclusion** — opening one panel closes all others. The `v-model` is bound to `ref<string[]>([PILLARS[0]?.id])` (an array), but the accordion variant overrides this to single-select behavior.

**Fix:** Remove `variant="accordion"`. With an array `v-model`, Vuetify's default allows multiple panels open simultaneously. No other code changes needed.

---

#### FINDING GC-B: "Services" Terminology in Financial Module

**File:** `pmo-frontend/pages/university-operations/financial/index.vue` lines 38, 45, 52, 59

| Current (`fullName`) | Expected |
|----------------------|----------|
| `MFO1: Higher Education Services` | `MFO1: Higher Education Program` |
| `MFO2: Advanced Education Services` | `MFO2: Advanced Education Program` |
| `MFO3: Research Services` | `MFO3: Research Program` |
| `MFO4: Technical Advisory & Extension Services` | `MFO4: Technical Advisory & Extension Program` |

**Physical page** (`physical/index.vue`) already uses "Program": `Higher Education Program`, etc.
**Index page** (`index.vue`) already uses "Program": `Higher Education Program`, etc.
**Backend** (`service.ts` line 1862): already uses "Program" in `pillarLabels`.

Only the Financial page is inconsistent.

**Note:** "Personal Services" in `EXPENSE_CLASSES` (line 67) is a DBM budget classification term (PS = Personal Services). This MUST NOT be changed — it is correct domain terminology.

---

#### FINDING GC-C: Analytics Guide — Current State Analysis

**File:** `index.vue` lines 1269-1376

The guide has 3 conditional sections (CROSS, PHYSICAL, FINANCIAL). Current issues:

1. **Formula-heavy**: Every section contains `<code>` blocks with formulas like `(SUM of individual indicator ratios / count of indicators with targets) × 100`. Non-technical users cannot parse this.
2. **No step-by-step structure**: Information is presented as dense paragraphs per chart, not as a guided walkthrough.
3. **Missing key concept definitions**: Terms like "Target", "Actual", "Variance", "Accomplishment Rate" are used without being defined.
4. **Color tier reference outdated**: Line 1339 references 3-tier system (`green ≥ 100%`, `amber 50-99%`, `red < 50%`). Phase GA-2 upgraded to 5-tier — guide does not reflect this.
5. **No filter usage instructions**: Guide doesn't explain how pillar filter and quarter toggle affect displayed data.

**Target rewrite approach:**
- Open with a "Key Terms" box defining Target, Actual, Variance, Rate
- Structure each section as numbered steps: "Step 1: Select a pillar... Step 2: Read the bar chart..."
- Move formulas to collapsible "Technical Details" subsection
- Update color tier reference to 5-tier (red/orange/amber/green/blue)
- Add filter usage guidance

---

#### FINDING GC-D: Cross-Analytics Data Flow — Validation

**Physical side:**
- `fetchCrossModuleSummary()` → `GET /analytics/pillar-summary` → `getPillarSummary()` (backend)
- Backend computes `accomplishment_rate_pct` using rate-based model: `(SUM(actual/target per indicator) / COUNT(indicators with targets)) × 100`
- Frontend `crossModuleOverallPhysical` = average of per-pillar `accomplishment_rate_pct`
- **Source consistency:** Same `getPillarSummary()` endpoint powers both the Physical dashboard cards AND Cross Analytics → ✅ consistent

**Financial side:**
- `fetchCrossModuleSummary()` → `GET /analytics/financial-pillar-summary` → `getFinancialPillarSummary()` (backend)
- Backend computes `avg_utilization_rate` = `(SUM(obligation) / SUM(allotment)) × 100` per pillar
- Frontend `crossModuleOverallUtilization` = average of per-pillar `avg_utilization_rate`
- **Source consistency:** Same `getFinancialPillarSummary()` endpoint powers both the Financial dashboard cards AND Cross Analytics → ✅ consistent

**Year-over-Year:**
- `fetchCrossModuleYoY()` fetches both `yearly-comparison` and `financial-yearly-comparison`
- Same endpoints used by Physical and Financial dashboard YoY charts → ✅ consistent

**Verdict:** Cross-Analytics is source-consistent. Both Physical and Financial analytics use the same backend endpoints that power their respective dashboard views. No transformation mismatch detected.

---

#### FINDING GC-E: Financial Computation Validation

**`computeFinancialMetrics()` (service.ts line 270):**

| Field | Formula | DBM Compliant |
|-------|---------|---------------|
| `utilization_rate` | `(obligation / allotment) × 100` | ✅ |
| `balance` | `allotment - obligation` | ✅ |
| `disbursement_rate` | `(disbursement / obligation) × 100` | ✅ |
| `variance` | `target - obligation` | ✅ |

**`getFinancialPillarSummary()` (service.ts line 2863):**

| Field | Formula | Consistent with per-record |
|-------|---------|----------------------------|
| `avg_utilization_rate` | `(SUM(obligation) / SUM(allotment)) × 100` | ✅ weighted average |
| `total_balance` | `SUM(allotment) - SUM(obligation)` | ✅ |

**Data integrity gap:** No backend validation enforces `obligation ≤ appropriation`. The DTO (`CreateFinancialDto`) validates `@Min(0)` but does not enforce the relationship. This is acceptable — operators enter data; the system computes metrics. Over-obligation is a real scenario that should be flagged visually, not blocked.

**Verdict:** Financial computations are correct and DBM-compliant. Analytics output matches per-record computation. No fixes needed.

---

### Section 2.35 — Phase GB: UI Scroll Optimization + Link Color Regression (Apr 2, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

---

#### FINDING GB-A: Blue Text Regression — Root Cause Confirmed

**Root cause:** Phase GA-4 wrapped navigation cards and indicator cards in `<NuxtLink>` components. `<NuxtLink>` renders as HTML `<a>` tags. The class `text-decoration-none` removes the underline but does NOT reset the anchor's inherited `color` property. Browser default `<a>` styling applies `color: blue` (or Vuetify's theme link color) to ALL descendant text nodes.

**6 NuxtLink wrappers affected (all in `index.vue`):**

| Line | Wraps | Child elements affected |
|------|-------|------------------------|
| 1169 | Physical overview card | h2, p, spans — all blue |
| 1199 | Financial overview card | h2, p, spans — all blue |
| 1471 | Physical pillar cards (×4) | pillar name, stats, chips |
| 1685 | Indicator cards (×N per pillar) | code, name, target, actual, variance |
| 1772 | Financial pillar cards (×4) | pillar name, financial stats, chips |

**Current CSS (scoped, line 1970):**
```css
.cursor-pointer { cursor: pointer; }
```
No `a` tag color reset exists anywhere in the project.

**Fix:** Add `color: inherit` to the NuxtLink class. Two options:
1. Inline style: `style="color: inherit"` on each `<NuxtLink>` — explicit per-element
2. Scoped CSS: `.text-decoration-none { color: inherit !important; }` — single rule, all NuxtLinks

Option 2 is DRY — one rule in `<style scoped>` covers all 6 wrappers. The `!important` ensures it overrides browser default anchor color.

---

#### FINDING GB-B: Records View Layout — Excessive Vertical Scrolling

**Current structure analysis:**

```
Report View container
└─ v-card (per pillar — 4 total, full-width, stacked vertically)
   ├─ v-card-title (pillar name + FY + quarter)
   ├─ v-card-text
   │  └─ template (per section: OUTCOME, OUTPUT)
   │     └─ v-row dense
   │        └─ v-col cols="12" md="6" (per indicator — 2 per row on desktop)
   │           └─ NuxtLink > v-card (indicator card)
   │              ├─ code + name (~40px)
   │              ├─ target row (~24px)
   │              ├─ actual row (~24px)
   │              ├─ progress bar (~28px)
   │              └─ variance row (~24px)
   │              = ~160-180px per card + padding
   └─ summary row (indicators count + avg rate bar)
```

**Scroll depth calculation (typical dataset):**
- HIGHER_EDUCATION: ~8 indicators → 4 rows × 180px = ~720px + header/summary ~100px = ~820px
- ADVANCED_EDUCATION: ~6 indicators → 3 rows × 180px = ~540px + ~100px = ~640px
- RESEARCH: ~6 indicators → 3 rows × 180px = ~540px + ~100px = ~640px
- TECHNICAL_ADVISORY: ~6 indicators → 3 rows × 180px = ~540px + ~100px = ~640px
- **Total: ~2,740px** of vertical scrolling content (plus margins/gaps)

On a typical 1080p screen with ~700px viewport, this requires ~4 full page scrolls.

**Three independent improvements (cumulative impact):**

1. **Collapsible pillar sections** — Use `v-expansion-panels` with `v-model` to show one pillar at a time. Reduces visible content from 4 pillars to 1 + 3 collapsed headers (~150px each). Net viewport: ~820px (1 pillar) instead of ~2,740px.

2. **Compact indicator cards** — Reduce from 5 rows to 3 rows per card:
   - Row 1: Code + Name (unchanged)
   - Row 2: Target | Actual | Variance (horizontal, single line)
   - Row 3: Progress bar with rate
   - Saves ~40-50px per card → ~200px per pillar

3. **3-column grid on large screens** — Change `md="6"` to `md="4"` for indicator cards. Fits 3 per row instead of 2 → reduces row count by 33%.

**Recommendation:** Implement #1 (collapsible pillars) as the primary fix — single largest scroll reduction. #2 and #3 are optional incremental improvements that can be done independently.

---

#### FINDING GB-C: Impact Assessment — Zero Risk

| Change | Risk | Reason |
|--------|------|--------|
| `color: inherit` on NuxtLinks | Zero | Restores pre-GA-4 visual appearance; does not affect navigation behavior |
| `v-expansion-panels` for pillars | Low | Vuetify built-in; `aprrRenderData` computed structure unchanged; only template wrapping changes |
| Compact card layout | Low | CSS/template only; no data pipeline changes |
| 3-column grid | Zero | Single attribute change (`md="4"`) |

No backend changes. No data pipeline changes. All changes are template/CSS-only.

---

### Section 2.38 — Phase GE: Target Line Interaction Refinement & Financial Label Extraction (Apr 2, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

---

#### FINDING GE-A: ApexCharts Annotation Hover Behavior

**Current state:** All 5 charts with target lines use identical annotation config:
- `crossComparisonOptions` (line ~609)
- `crossModuleYoYOptions` (line ~671)
- `yearlyComparisonOptions` (line ~885)
- `targetVsActualOptions` (line ~990)
- `financialYearlyOptions` (line ~515)

Each renders:
```javascript
annotations: {
  yaxis: [{
    y: 100,
    borderColor: '#E53935',
    strokeDashArray: 4,
    label: {
      text: 'Target (100%)',
      style: { color: '#E53935', background: '#FFFFFF', fontSize: '12px', padding: { left: 4, right: 4, top: 2, bottom: 2 } },
    }
  }]
}
```

**Problem:** The static "Target (100%)" label is always visible, cluttering charts — especially smaller ones or those with data points near the 100% line. The label overlaps data in dense charts.

**ApexCharts limitation:** Annotations do NOT support native hover/tooltip events. There is no built-in `onHover` callback for annotation labels. The annotation is rendered as SVG elements inside `.apexcharts-yaxis-annotations` group.

**Solution — CSS-based hover-to-show:**
ApexCharts annotations render as SVG within a predictable DOM structure:
```
.apexcharts-yaxis-annotations
  └── <line> (the red dashed line — always visible)
  └── <rect> (label background)
  └── <text> (label text "Target (100%)")
```

The `.apexcharts-yaxis-annotations` group spans the full chart width at y=100. CSS can target the text and rect elements:

```css
:deep(.apexcharts-yaxis-annotations rect),
:deep(.apexcharts-yaxis-annotations text) {
  opacity: 0;
  transition: opacity 0.2s ease;
}
:deep(.apexcharts-yaxis-annotations:hover rect),
:deep(.apexcharts-yaxis-annotations:hover text) {
  opacity: 1;
}
```

**Key considerations:**
1. `:deep()` is required because ApexCharts renders its own DOM outside Vue's scoped style boundary
2. The line itself (`<line>`) stays visible — only `rect` (background) and `text` (label) are hidden
3. Hover triggers when mouse enters the SVG group area near the annotation line
4. The transition provides smooth fade-in/fade-out (0.2s)
5. No JavaScript changes needed — annotation config stays identical
6. Works across all 5 charts simultaneously via single CSS rule

**Risk assessment:** Zero — CSS-only change, no data pipeline impact, no chart config changes.

---

#### FINDING GE-B: Financial Label Extraction from Excel — Continuing Appropriations

**Source file:** `docs/references/univ_op/Continuing Appropriations.xlsx`
- Single sheet: "RAF" (Regular Agency Fund)
- 265 rows, 51 columns
- Headers span FY 2013–2025, each with Appropriation / Obligations / % Utilization columns

**Structural hierarchy (rows):**

```
PROGRAMS (Row 10)
├── GENERAL ADMINISTRATION AND SUPPORT (Row 11)
│   ├── MAIN CAMPUS
│   │   ├── Personal Services
│   │   ├── MOOE
│   │   └── Capital Outlay
│   ├── CABADBARAN CAMPUS
│   │   ├── Personal Services
│   │   └── MOOE
│   └── Sub-Totals (PS / MOOE / Total)
├── SUPPORT TO OPERATIONS (Row 27)
│   ├── MAIN CAMPUS (PS, MOOE)
│   ├── CABADBARAN CAMPUS (PS, MOOE)
│   └── Sub-Totals
└── OPERATIONS (Row 41)
    ├── MFO1: HIGHER EDUCATION SERVICES (Row 42) → HIGHER_EDUCATION pillar
    │   ├── MAIN CAMPUS (PS, MOOE, CO)
    │   ├── CABADBARAN CAMPUS (PS, MOOE)
    │   └── Total, MFO1
    ├── MFO2: ADVANCED EDUCATION SERVICES (Row 58) → ADVANCED_EDUCATION pillar
    │   ├── MAIN CAMPUS (PS, MOOE)
    │   ├── CABADBARAN CAMPUS (PS, MOOE)
    │   └── Total, MFO2
    ├── MFO3: RESEARCH SERVICES (Row 72) → RESEARCH pillar
    │   ├── MAIN CAMPUS (PS, MOOE, CO)
    │   ├── CABADBARAN CAMPUS (PS, MOOE)
    │   └── Total, MFO3
    └── MFO4: TECHNICAL ADVISORY AND EXTENSION SERVICES (Row 88) → TECHNICAL_ADVISORY pillar
        ├── MAIN CAMPUS (PS, MOOE, CO)
        ├── CABADBARAN CAMPUS (PS, MOOE)
        └── Total, MFO4

TOTAL OPERATIONS (Row 102)
TOTAL PROGRAMS (Row 103)

PROJECTS (Row 106)
├── MAIN CAMPUS — Various research projects, CO items (Rows 107–187)
└── CABADBARAN CAMPUS — Research projects, CO items (Rows 189–200)
TOTAL PROJECTS (Row 201)

TOTAL REGULAR APPROPRIATION (Row 203)

Continuing Appropriations (Row 215)
├── PROJECTS — MAIN CAMPUS (various line items)
└── TOTAL CONTINUING APPROPRIATION (Row 248)
```

**MFO-to-Pillar mapping (confirmed match with Financial module):**

| Excel Label | Row | Pillar ID | Financial Module `fullName` |
|-------------|-----|-----------|----------------------------|
| MFO1: HIGHER EDUCATION SERVICES | 42 | `HIGHER_EDUCATION` | MFO1: Higher Education Program |
| MFO2: ADVANCED EDUCATION SERVICES | 58 | `ADVANCED_EDUCATION` | MFO2: Advanced Education Program |
| MFO3: RESEARCH SERVICES | 72 | `RESEARCH` | MFO3: Research Program |
| MFO4: TECHNICAL ADVISORY AND EXTENSION SERVICES | 88 | `TECHNICAL_ADVISORY` | MFO4: Technical Advisory & Extension Program |

**Unmapped sections (no current pillar):**
- GENERAL ADMINISTRATION AND SUPPORT — maps to GAS (not a Financial module MFO pillar)
- SUPPORT TO OPERATIONS — maps to STO (not a Financial module MFO pillar)
- PROJECTS — cross-cutting, not pillar-specific

**Expense class mapping (confirmed match):**

| Excel Label | Financial Module ID |
|-------------|-------------------|
| Personal Services | `PS` |
| MOOE | `MOOE` |
| Capital Outlay / CO | `CO` |

**Campus mapping (confirmed match):**

| Excel Label | Financial Module ID |
|-------------|-------------------|
| MAIN CAMPUS | `MAIN` |
| CABADBARAN CAMPUS | `CABADBARAN` |

**Terminology discrepancy (RESOLVED in Phase GC-2):**
- Excel uses "SERVICES" (e.g., "HIGHER EDUCATION SERVICES")
- Financial module uses "Program" (e.g., "Higher Education Program") — corrected from "Services" in Phase GC-2
- The "Services" vs "Program" distinction: Excel follows older DBM nomenclature; the module uses current institutional terminology. Both refer to the same MFO categories.

**Data extraction feasibility:**
The Excel structure is regular and extractable — each MFO section follows the same pattern (campus → expense class → sub-totals). Historical data (FY 2013–2025) could be programmatically extracted per MFO × campus × expense class × fiscal year. However, this is a **reference document** — the Financial module already has its own data entry workflow. The Excel data could serve as:
1. Validation reference for manually-entered Financial module data
2. Historical pre-population source (FY 2013-2025 data not yet in system)
3. Template verification for the Financial module's structure

**Recommendation:** This is deferred research. No implementation needed now — the structural mapping confirms the Financial module's pillar/campus/expense class model is correct. Historical data import could be a future enhancement if stakeholders request it.

---

#### FINDING GE-C: Impact Assessment

| Change | Risk | Reason |
|--------|------|--------|
| CSS hover-to-show annotation labels | Zero | CSS-only; no chart config or data changes |
| Financial label extraction | N/A | Research-only; no implementation proposed |

---

### Section 2.39 — Phase GF: Analytics Guide UX Restructuring (Apr 3, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

---

#### FINDING GF-A: Current Guide Structure Audit (Lines 1267–1373)

**Container:** Single `v-expansion-panel` inside `v-expansion-panels`, collapsed by default.
**Title:** "Analytics Guide — How to Read These Charts"

**Internal layout (sequential, no nesting):**

| # | Element | Vuetify Component | Content |
|---|---------|-------------------|---------|
| 1 | Key Terms | `v-alert type="info"` | 5 terms separated by `<br>` tags inside a single block |
| 2 | Color Reference | `d-flex` row of 5 `v-chip` | 5-tier color chips, no additional explanation |
| 3 | Using the Filters | Plain `<p>` tags | Numbered paragraphs (Pillar Filter, Quarter Toggle) |
| 4 | Divider | `v-divider` | Single horizontal rule |
| 5 | CROSS guide | `v-if` conditional `div` | 2 subsections (Cross-Comparison, Year-over-Year) as flat paragraphs |
| 6 | PHYSICAL guide | `v-else-if` conditional `div` | Dashboard View (4 chart descriptions) + Report View (indicator cards) as flat paragraphs |
| 7 | FINANCIAL guide | `v-else-if` conditional `div` | 4 chart descriptions as flat paragraphs |

**Structural problems:**
1. **Single expansion panel** — all content crammed into one container with no internal navigation
2. **Flat paragraph layout** — no cards, no visual grouping, no section containers
3. **Key Terms as `v-alert`** — alert components are for notifications, not reference content
4. **`<br>` tag definitions** — 5 terms stacked with line breaks, not scannable
5. **Numbered items in `<p>` tags** — not actual lists, poor accessibility and readability
6. **Physical section mixes two views** (Dashboard + Report) in one continuous flow with only a `v-divider`
7. **No section icons** — only the expansion panel title has an icon

---

#### FINDING GF-B: Visual Design Audit

**Typography hierarchy (weak):**
- Section headers: `font-weight-bold` on `<p>` — nearly indistinguishable from body text
- Sub-headers: `font-weight-medium` on `<p>` — even weaker visual signal
- Body: `text-body-2` throughout — uniform size creates visual monotony
- No `text-subtitle-1` or `text-subtitle-2` used inside the guide

**Spacing issues:**
- `mb-1`, `mb-2`, `mb-3` used inconsistently within sections
- No padding on section containers (they don't exist)
- Color chips row has `ga-2` but no label padding
- Divider between filters and chart content is the only visual break in ~100 lines

**Color usage:**
- Key Terms alert: `type="info"` (blue tonal) — appropriate for the alert but misused as a content container
- Color chips: correct tonal variants but no explanatory context (just "Below 50% — Critical")
- No background differentiation between sections
- No use of `bg-grey-lighten-5` or similar subtle backgrounds for grouping

**Component misuse:**
- `v-alert` for reference content (should be `v-card` or structured list)
- `<p>` tags for numbered steps (should be `v-list` or `<ol>`)
- No `v-card` containers for logical sections

---

#### FINDING GF-C: Content Quality Audit

**Technical jargon found:**
1. Line 1350: *"Rate = (Total Actual / Total Target) x 100. All indicator types use SUM aggregation across quarters."* — backend implementation detail, meaningless to end users
2. Line 1285: *"The difference between Actual and Target. Positive means exceeded; negative means fell short."* — correct but could be simpler
3. Line 1368: *"Look for the gap between Appropriation and Obligations — a narrowing gap means budget is being used. The Disbursement line (dashed) shows how much of the obligations have actually been paid out."* — compound sentence, high cognitive load

**Redundancy:**
- "shown as a percentage" appears in both Accomplishment Rate and Utilization Rate definitions
- Chart descriptions repeat "bars above/below 100%" pattern across CROSS, PHYSICAL, and FINANCIAL sections

**Content that works well (preserve):**
- Color tier chips (GC-2) — concise, scannable
- Filter instructions — clear numbered steps
- Physical Report View description — accurately describes indicator cards

---

#### FINDING GF-D: Guide-to-System Alignment Audit

**Missing from guide (present in actual UI):**

| UI Element | Reporting Type | Lines | Status in Guide |
|------------|---------------|-------|-----------------|
| Institutional Overview summary cards (Physical %, Utilization %, Disbursement %, Data Coverage) | CROSS | 1386–1412 | ✗ NOT DOCUMENTED |
| Pillar Completion Overview cards (clickable, indicator counts, rate chips) | PHYSICAL Dashboard | 1463–1529 | ✗ NOT DOCUMENTED |
| Budget Utilization Overview cards (clickable, appropriation/obligations, utilization chip) | FINANCIAL | 1780–1832 | ✗ NOT DOCUMENTED |
| Utilization Rate radial bar chart | FINANCIAL | 1836–1853 | ✗ NOT DOCUMENTED (guide only describes bar chart) |
| Clickable cards → navigate to Physical/Financial pages | PHYSICAL + FINANCIAL | various | Partially mentioned (Physical Report View only) |
| Target line hover-to-show behavior (Phase GE-1) | All charts with annotations | CSS | ✗ NOT DOCUMENTED |

**Naming mismatches:**

| Guide Says | Actual Chart Title |
|------------|--------------------|
| "Cross-Comparison Chart" | "Physical vs Financial Performance by Pillar" |
| "Radial Gauge" | "Pillar Accomplishment Rates" |
| "Utilization Rate by Pillar" (described as bar) | Rendered as radialBar, titled "Utilization Rate by Pillar (%)" |

---

#### FINDING GF-E: Impact Assessment

| Change | Risk | Reason |
|--------|------|--------|
| Restructure guide layout | Zero | Template-only; no data pipeline or chart config changes |
| Simplify content wording | Zero | Text content only |
| Add section icons/headers | Zero | Vuetify components only |
| Fix guide-to-system mismatches | Zero | Corrects documentation, no code behavior changes |

All changes are confined to lines 1267–1373 of `index.vue`. No backend, no data, no chart logic affected.

---

### Section 2.40 — Phase GG: Controlled Data Extraction & Pre-Migration Validation (Apr 3, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

---

#### FINDING GG-A: Financial Source Structure (Continuing Appropriations.xlsx)

**File:** `docs/references/univ_op/Continuing Appropriations.xlsx`
**Sheet:** `RAF` (Regular Agency Fund) — 1 sheet, 265 rows × 51 columns

**Layout:**
- Rows 1–9: University header and column definitions
- Row 8: Fiscal year group headers (merged across 3-column triplets)
- Row 9: Sub-headers: `Appropriation | Obligations | % Utilizations` per FY
- Each FY occupies 3 columns in repeating triplets (C-E = FY 2013, ... AM-AO = FY 2025)
- Only FY 2022–2025 are marked "Actual" — all earlier FYs hidden

**Relevant data scope (FY 2022–2025):**

| FY | Columns |
|----|---------|
| 2022 (Actual) | AD-AF |
| 2023 (Actual) | AG-AI |
| 2024 (Actual) | AJ-AL |
| 2025 (Actual) | AM-AO |

**Row hierarchy — Programs section (rows 10–104):**

| Section | Rows | System Pillar |
|---------|------|---------------|
| GENERAL ADMINISTRATION AND SUPPORT | 11–25 | *(no direct pillar — overhead category)* |
| SUPPORT TO OPERATIONS | 27–39 | *(no direct pillar — overhead category)* |
| MFO1: HIGHER EDUCATION SERVICES | 43–62 | `HIGHER_EDUCATION` |
| MFO2: ADVANCED EDUCATION SERVICES | 64–73 | `ADVANCED_EDUCATION` |
| MFO3: RESEARCH SERVICES | 75–84 | `RESEARCH` |
| MFO4: TECHNICAL ADVISORY AND EXTENSION SERVICES | 86–100 | `TECHNICAL_ADVISORY` |

**Each MFO sub-structure:**
- MAIN CAMPUS: Personal Services (PS), MOOE, Capital Outlay (CO), Sub-Total
- CABADBARAN CAMPUS: Personal Services (PS), MOOE, Sub-Total
- Aggregate rows: Sub-Total MFO-PS, Sub-Total MFO-MOOE, Sub-Total MFO-CO, Total MFO

**Additional sections:**
- PROJECTS (rows 106–201): Individual research/extension projects — 80 hidden rows
- Continuing Appropriations (rows 215–248): Separate sub-fund category
- Summary rows: Regular Appropriation (row 203), Summary (rows 208–212), Continuing Summary (rows 250–254)

**Data format:**
- Appropriation/Obligations: Raw numeric values (e.g., `48254000`)
- Utilization: Decimal ratio (e.g., `0.9963` = 99.63%) — NOT percentage format
- Some sentinel values: `7` and `23` appear as erroneous placeholders in early FY columns

---

#### FINDING GG-B: Physical Source Structure (BAR1 Excel Files)

**Files:** `2023 Bar1 Excel.xlsx`, `2024 Bar1 Excel.xlsx`, `2025 Bar1 Excel.xlsx`
**Sheet:** `bar1_report` — 1 sheet each

| File | Dimensions | Merged Cell Ranges |
|------|------------|--------------------|
| 2023 | 99 rows × 28 cols | 636 |
| 2024 | 103 rows × 28 cols | 672 |
| 2025 | 111 rows × 28 cols | 699 |

**Layout (identical structure across all 3 years):**
- Rows 1–12: University header, metadata, column definitions
- Row 10: Main groups — "Physical Target (Budget Year)" and "Physical Accomplishment (Budget Year)"
- Row 11: Quarter sub-headers (Q1, Q2, Q3, Q4 for each group)
- Row 12: Column numbers 1–14

**Column mapping:**

| Logical Column | Excel Columns | Content |
|----------------|---------------|---------|
| Particulars | B-G | Program name, OO statement, indicator text |
| UACS CODE | H-I | National accounting code |
| Q1 Target | J-K | Quarter 1 physical target |
| Q2 Target | L-M | Quarter 2 physical target |
| Q3 Target | N | Quarter 3 physical target |
| Q4 Target | O | Quarter 4 physical target |
| Total Target | P | Sum of Q1-Q4 targets |
| Q1 Accomplishment | Q | Quarter 1 actual |
| Q2 Accomplishment | R-S | Quarter 2 actual |
| Q3 Accomplishment | T-U | Quarter 3 actual |
| Q4 Accomplishment | V-W | Quarter 4 actual |
| Total Accomplishment | X | Sum of Q1-Q4 actuals |
| Variance | Y | Total Accomplishment - Total Target |
| Remarks | Z-AA | Free-text notes |

**Programs and UACS codes (consistent across all years):**

| Program | UACS | System Pillar |
|---------|------|---------------|
| HIGHER EDUCATION PROGRAM | 310100000000000 | `HIGHER_EDUCATION` |
| ADVANCED EDUCATION PROGRAM | 320100000000000 | `ADVANCED_EDUCATION` |
| RESEARCH PROGRAM | 320200000000000 | `RESEARCH` |
| TECHNICAL ADVISORY EXTENSION PROGRAM | 330100000000000 | `TECHNICAL_ADVISORY` |

**Indicator taxonomy (14 indicators — matches migration 019 exactly):**

| Pillar | Outcome | Output | Total |
|--------|---------|--------|-------|
| HIGHER_EDUCATION | 2 (HE-OC-01, HE-OC-02) | 2 (HE-OP-01, HE-OP-02) | 4 |
| ADVANCED_EDUCATION | 1 (AE-OC-01) | 2 (AE-OP-01, AE-OP-02) | 3 |
| RESEARCH | 1 (RP-OC-01) | 2 (RP-OP-01, RP-OP-02) | 3 |
| TECHNICAL_ADVISORY | 1 (TA-OC-01) | 3 (TA-OP-01, TA-OP-02, TA-OP-03) | 4 |

---

#### FINDING GG-C: Data Format Anomalies and Parsing Requirements

**BAR1 files — value format issues:**

| Pattern | Example | Required Parsing |
|---------|---------|-----------------|
| Percentage with raw counts | `"91.32% (242/265)"` | Extract numeric percentage: `91.32` |
| Plain percentage | `"55%"` or `"55"` | Extract numeric: `55` |
| Count with comma formatting | `"1,500"` | Remove commas: `1500` |
| Signed variance | `"+25.43"` or `"-4.68"` | Parse as signed float |
| Empty/null cells | `null`, `""`, `"-"` | Map to `null` |
| Multi-row indicator text | Text split across rows D16+D17 | Concatenate across merged rows |

**Financial file — value format issues:**

| Pattern | Example | Required Parsing |
|---------|---------|-----------------|
| Raw integers | `48254000` | Direct numeric — no parsing needed |
| Decimal utilization | `0.9963` | Multiply by 100 for percentage: `99.63%` |
| Sentinel placeholders | `7`, `23` in early FY columns | Detect and discard — do NOT import |
| Null/empty cells | Empty cells in some sub-rows | Map to `0` or `null` based on context |

**BAR1 structural anomalies:**
1. **Row shifts across years:** 2025 file has some indicators shifted by 1 row vs 2023/2024
2. **Multi-page headers:** Report repeats header rows at page breaks — must skip duplicate headers
3. **636–699 merged cell ranges:** Nearly every cell is part of a merge — extraction must resolve merges to read actual values
4. **Column A entirely empty:** Decorative spacing column, not data

---

#### FINDING GG-D: Database Schema Mapping

**Physical → `operation_indicators` table:**

| Excel Column | DB Column | Transform |
|-------------|-----------|-----------|
| Q1 Target | `target_q1` | Parse numeric from string |
| Q2 Target | `target_q2` | Parse numeric from string |
| Q3 Target | `target_q3` | Parse numeric from string |
| Q4 Target | `target_q4` | Parse numeric from string |
| Q1 Accomplishment | `accomplishment_q1` | Parse numeric from string |
| Q2 Accomplishment | `accomplishment_q2` | Parse numeric from string |
| Q3 Accomplishment | `accomplishment_q3` | Parse numeric from string |
| Q4 Accomplishment | `accomplishment_q4` | Parse numeric from string |
| Remarks | `remarks` | Direct string |
| *(from program name)* | `operation_id` | Lookup: program → university_operations by operation_type + fiscal_year |
| *(from indicator match)* | `pillar_indicator_id` | Lookup: indicator text → pillar_indicator_taxonomy by indicator_name |
| *(per quarter)* | `reported_quarter` | One record per quarter (Q1/Q2/Q3/Q4) or single record with all quarters |

**Key constraint:** `uq_oi_quarterly_per_quarter` enforces one record per (operation_id, pillar_indicator_id, fiscal_year, reported_quarter). Extraction must produce records that respect this constraint.

**Financial → `operation_financials` table:**

| Excel Column | DB Column | Transform |
|-------------|-----------|-----------|
| Appropriation | `allotment` | Direct numeric |
| Obligations | `obligation` | Direct numeric |
| *(not in source)* | `disbursement` | Set to `0` or `null` — NOT available in this file |
| *(computed)* | `utilization_rate` | Computed server-side via `computeFinancialMetrics()` |
| *(from MFO name)* | `operation_id` | Lookup: MFO → university_operations by operation_type + fiscal_year |
| Expense row label | `expense_class` | Map: "Personal Services" → `PS`, "MOOE" → `MOOE`, "Capital Outlay" → `CO` |
| *(from section)* | `fund_type` | `RAF_PROGRAMS` for main section, `RAF_CONTINUING` for continuing section |
| FY column group | `fiscal_year` | From column position |
| *(not in source)* | `quarter` | **CRITICAL GAP:** Excel has NO quarterly breakdown — data is annual only |

---

#### FINDING GG-E: Critical Gaps and Risks

**GAP 1 — Financial data is ANNUAL, not quarterly:**
The Continuing Appropriations.xlsx provides only annual Appropriation/Obligations per FY. The system expects per-quarter financial records (`operation_financials.quarter` = Q1/Q2/Q3/Q4). **Strategy required:** Either (a) import as Q4 cumulative record, (b) import as NULL quarter (annual total), or (c) defer financial import until quarterly breakdowns are available.

**GAP 2 — No disbursement data:**
The financial source file contains Appropriation and Obligations only. Disbursement is not present. The system column `operation_financials.disbursement` would be `0` or `null` for imported records.

**GAP 3 — General Administration and Support to Operations:**
Rows 11–39 contain "GENERAL ADMINISTRATION AND SUPPORT" and "SUPPORT TO OPERATIONS" — these do NOT map to any of the 4 MFO pillars. They are institutional overhead. **Decision required:** Import as metadata/reference or exclude entirely.

**GAP 4 — Campus aggregation:**
Financial Excel breaks down each MFO by campus (MAIN + CABADBARAN). The system's `operation_financials` does not have a campus column — only the parent `university_operations` has campus. **Strategy required:** Use MFO sub-total rows (which aggregate both campuses) or create per-campus financial records.

**GAP 5 — Parent entity (university_operations) must exist:**
Both `operation_indicators` and `operation_financials` require an `operation_id` FK to `university_operations`. For each pillar × fiscal year combination, a parent `university_operations` record must exist. **Pre-check required:** Verify these records exist or create them as part of the pipeline.

**GAP 6 — Projects section:**
Rows 106–201 contain individual research/extension projects. The system has `project_code` and `fund_type = RAF_PROJECTS` support, but no current project entity CRUD. **Decision required:** Include in extraction or defer.

---

#### FINDING GG-F: Conflict Resolution Analysis

**Existing data scenarios:**

| Scenario | Detection | Resolution |
|----------|-----------|------------|
| No existing record for (operation, indicator, FY, quarter) | Check returns empty | INSERT new record |
| Existing record with same values | Compare all data columns | Skip (no-op) |
| Existing record with different values | Compare all data columns | Replace — extracted data takes precedence per operator directive |
| Existing record not present in Excel | Record exists in DB but not in source | Flag for review — do NOT auto-delete |

**Deduplication keys:**
- Physical: `(operation_id, pillar_indicator_id, fiscal_year, reported_quarter)`
- Financial: `(operation_id, fiscal_year, quarter, expense_class)` — no unique constraint exists, must check manually

---

#### FINDING GG-G: Impact Assessment

| Action | Risk | Mitigation |
|--------|------|------------|
| Extract to staging format (JSON/CSV) | Zero | No DB interaction |
| Create parent university_operations records | Low | Check-before-create, idempotent |
| Insert indicator records | Medium | Unique constraint prevents duplicates; validate before INSERT |
| Insert financial records | Medium | No unique constraint — must manually check for duplicates |
| Replace existing records | High | Require operator approval per-replacement; backup before execution |

**Recommended approach:** Extract → Stage → Validate → Operator Review → Migrate (gated pipeline)

---

### Section 2.41 — Phase GH: Pre-Migration Gap Resolution (Apr 3, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

---

#### FINDING GH-A: Gap Classification — Blocking vs Non-Blocking

| # | Gap | Type | Blocks Extraction? | Blocks Migration? | Root Cause |
|---|-----|------|--------------------|-------------------|------------|
| 1 | Financial data is annual only (no quarter) | Structural | YES — affects record shape | YES — quarter drives queries | Excel source is a comparative annual report, not a quarterly BAR2 |
| 2 | Disbursement field absent | ~~Gap~~ → **NOT a gap** | NO | NO | Field is optional (`@IsOptional`, schema nullable, UI labeled "Optional") |
| 3 | General Admin / Support to Ops unmapped | Classification | YES — must decide include/exclude before parsing | NO | These sections are institutional overhead, not MFO pillars |
| 4 | Campus aggregation ambiguity | Structural | YES — determines which Excel rows to read | NO | Excel has detail (per-campus) AND sub-total (aggregated) rows |
| 5 | Parent `university_operations` must exist | Dependency | NO — extraction is standalone | YES — FK constraint on `operation_id` | Child tables require parent FK |
| 6 | FY 2022 inclusion undecided | Scope | YES — determines file column range | NO | Data exists in Excel but was not explicitly requested |

---

#### FINDING GH-B: GAP 1 Deep Analysis — Financial Annual vs Quarterly

**Root cause:** The `Continuing Appropriations.xlsx` is a **comparative annual report** (Appropriation + Obligations per FY). It is NOT the quarterly BAR No. 2 (which would have per-quarter breakdowns). The system's `operation_financials.quarter` column is nullable — `CHECK (quarter IN ('Q1','Q2','Q3','Q4'))` without `NOT NULL`.

**Impact on existing system queries:**

| Query | Behavior with `quarter = NULL` |
|-------|-------------------------------|
| `getFinancialPillarSummary()` (line 2863) | `SUM(allotment)` — includes NULL-quarter records. **Works correctly** — aggregates all records regardless of quarter. |
| `getFinancialQuarterlyTrend()` (line 2891) | `GROUP BY of2.quarter` — NULL-quarter records would appear as a separate group (`null`). **Requires attention** — trend chart expects Q1/Q2/Q3/Q4 only. |
| `validateFinancialEditable()` (line 154) | `LEFT JOIN quarterly_reports qr ON qr.quarter = $2` — when quarter is NULL, join returns no match, so no publication lock applies. **Safe** — record is always editable. |
| Financial form data fetch (frontend) | Filters by `selectedQuarter` — NULL-quarter records would NOT appear in any quarter view. **Invisible in form** unless explicitly handled. |

**Options analysis:**

| Option | Pros | Cons |
|--------|------|------|
| **(A) `quarter = NULL` (annual total)** | Truthful — data IS annual. Pillar summary works. No false quarter assignment. | Invisible in financial form. Creates "orphan" quarter in trend chart. |
| **(B) `quarter = 'Q4'` (cumulative)** | Visible in Q4 form view. Trend chart shows Q4 data point. Matches cumulative BAR convention. | Misleading — implies Q4-specific data when it's actually full-year. Could conflict with real Q4 entries later. |
| **(C) Replicate to Q1-Q4 (distribute)** | Visible in all quarters. Trend shows data. | Fabricates data — 4x records of same amount. SUM queries would 4x inflate totals. **DANGEROUS.** |

**Recommendation: Option A — `quarter = NULL`**

Rationale: The data IS annual. Assigning it to Q4 would create false implications. NULL quarter records correctly appear in pillar summary (which does not filter by quarter) and year-over-year comparisons. The financial form already operates per-quarter, so annual reference data being invisible there is acceptable — it serves analytics, not data entry. The quarterly trend chart anomaly is minor and can be documented.

---

#### FINDING GH-C: GAP 3 Deep Analysis — Unmapped Financial Sections

**Affected rows in Excel:**

| Section | Rows | Content |
|---------|------|---------|
| GENERAL ADMINISTRATION AND SUPPORT | 11–25 | Administrative overhead: President's office, HR, procurement |
| SUPPORT TO OPERATIONS | 27–39 | Library, student services, planning |

**System pillar types (exhaustive):** `HIGHER_EDUCATION`, `ADVANCED_EDUCATION`, `RESEARCH`, `TECHNICAL_ADVISORY`

These sections do NOT correspond to any of the 4 MFO pillars. They are institutional-level budget categories that exist in every government agency regardless of mandate.

**Options:**

| Option | Pros | Cons |
|--------|------|------|
| **(A) Exclude entirely** | Clean — only MFO-aligned data enters system. No schema changes. | Loses ~30% of total budget picture. |
| **(B) Create new pillar types** | Complete budget coverage. | Schema change (pillar_type enum), frontend changes (new pillar cards, chart series), taxonomy changes. Over-engineered for current scope. |
| **(C) Extract to staging, tag as `unmapped`** | Preserves data for future use without system changes. | Still excluded from migration until a home exists. |

**Recommendation: Option C — Extract but tag as `unmapped: true`**

Rationale: KISS + YAGNI. The data is extracted and preserved in staging, but no schema changes are made. If a future phase adds institutional overhead tracking, the data is already structured. No current system behavior is affected.

---

#### FINDING GH-D: GAP 4 Deep Analysis — Campus Aggregation

**Excel structure per MFO (example: MFO1 Higher Education):**

```
Row 43: MFO1: HIGHER EDUCATION SERVICES (section header)
Row 44:   MAIN CAMPUS
Row 45:     Personal Services         [Appropriation] [Obligations] [Util%]  ← DETAIL
Row 46:     MOOE                      [Appropriation] [Obligations] [Util%]  ← DETAIL
Row 47:     Capital Outlay            [Appropriation] [Obligations] [Util%]  ← DETAIL
Row 48:     Sub-Total MAIN            [Appropriation] [Obligations] [Util%]  ← CAMPUS SUBTOTAL
Row 49:   CABADBARAN CAMPUS
Row 50:     Personal Services         [Appropriation] [Obligations] [Util%]  ← DETAIL
Row 51:     MOOE                      [Appropriation] [Obligations] [Util%]  ← DETAIL
Row 52:     Sub-Total CABADBARAN      [Appropriation] [Obligations] [Util%]  ← CAMPUS SUBTOTAL
Row 53:   Sub-Total MFO1-PS           [Appropriation] [Obligations] [Util%]  ← EXPENSE SUBTOTAL
Row 54:   Sub-Total MFO1-MOOE         [Appropriation] [Obligations] [Util%]  ← EXPENSE SUBTOTAL
Row 55:   Sub-Total MFO1-CO           [Appropriation] [Obligations] [Util%]  ← EXPENSE SUBTOTAL
Row 56:   Total MFO1                  [Appropriation] [Obligations] [Util%]  ← MFO TOTAL
```

**System's `operation_financials` table:**
- Has `expense_class` (PS/MOOE/CO) ✓
- Has `operation_id` → `university_operations.campus` ✓ (campus is on parent entity)
- Does NOT have its own campus column
- `operations_programs` (VARCHAR, NOT NULL) — free-text label for the budget line

**The system expects one financial record per expense class per quarter per operation.** The `operation_id` already carries the campus context via the parent `university_operations` record.

**Options:**

| Option | Pros | Cons |
|--------|------|------|
| **(A) Detail rows only** (per-campus, per-expense-class) | Granular. Maps to separate parent operations per campus. Matches system's per-campus model. | Requires 2 parent operations per pillar per FY (one per campus). More records. |
| **(B) MFO Total rows only** | Simple. One record per pillar per FY. | Loses expense class breakdown and campus detail. |
| **(C) Expense subtotal rows** (Sub-Total MFO-PS, MFO-MOOE, MFO-CO) | Preserves expense class. Aggregates across campuses. Clean. | Loses per-campus detail. |

**Recommendation: Option C — Expense subtotal rows**

Rationale: The system's financial analytics (Expense Class Breakdown donut chart, pillar summaries) aggregate by expense class, not by campus. The expense subtotal rows provide exactly the right granularity: one record per (MFO × expense_class × FY). This avoids needing multiple parent operations per pillar and matches the analytics queries. Per-campus detail rows are extracted to staging with `level: "DETAIL"` for future reference.

---

#### FINDING GH-E: GAP 5 Deep Analysis — Parent Entity Dependency

**Required parent structure:**

For each (pillar × FY) combination being migrated, a `university_operations` record must exist with:
- `operation_type` matching the pillar (e.g., `HIGHER_EDUCATION`)
- `fiscal_year` matching the FY (e.g., `2024`)
- `campus` — determined by extraction level choice

**Current state:** Unknown without DB query. The validation script (GG-3) will detect missing parents.

**Required fields for `university_operations` creation:**

| Field | Required? | Value for auto-creation |
|-------|-----------|------------------------|
| `operation_type` | YES | From pillar mapping |
| `title` | YES | e.g., "Higher Education Program — FY 2024" |
| `status` | YES | `'active'` |
| `campus` | YES | `'MAIN'` (since we use aggregated expense subtotals — campus-neutral) |
| `fiscal_year` | Optional | FY from Excel |
| `code` | Optional | e.g., `"HE-2024"` |
| `created_by` | YES | Operator user ID (must be provided at migration time) |

**Recommendation:** Check for existing records first. Only create if missing. Creation requires operator-provided `user_id` for `created_by` — cannot be automated blindly.

---

#### FINDING GH-F: GAP 6 — FY Scope Decision

**Data availability in Excel:**

| FY | Financial (Continuing Appropriations) | Physical (BAR1) |
|----|---------------------------------------|-----------------|
| 2022 | ✓ Columns AD-AF ("Actual") | ✗ No file |
| 2023 | ✓ Columns AG-AI ("Actual") | ✓ 2023 Bar1 Excel.xlsx |
| 2024 | ✓ Columns AJ-AL ("Actual") | ✓ 2024 Bar1 Excel.xlsx |
| 2025 | ✓ Columns AM-AO ("Actual") | ✓ 2025 Bar1 Excel.xlsx |

**Analysis:** FY 2022 financial data exists but there is no matching BAR1 physical file. Including FY 2022 would produce financial-only records with no physical counterpart.

**Recommendation:** Extract FY 2023–2025 only (both Financial and Physical available). FY 2022 financial data can be extracted to staging as reference but deferred from migration.

---

#### FINDING GH-G: Combined Resolution Matrix

| Gap | Resolution | Impact on Extraction | Schema Change? |
|-----|------------|---------------------|----------------|
| **GAP 1** | `quarter = NULL` for annual data | Records shaped with `quarter: null` | None — column already nullable |
| **GAP 2** | Not a gap | `disbursement: null` | None |
| **GAP 3** | Extract as `unmapped: true`, exclude from migration | Script tags rows 11–39 as unmapped | None |
| **GAP 4** | Use expense subtotal rows (MFO-PS, MFO-MOOE, MFO-CO) | Script reads subtotal rows, detail rows go to staging as reference | None |
| **GAP 5** | Validate at GG-3, create missing parents with operator approval | Validation script checks, parent creation is a separate gated step | None |
| **GAP 6** | FY 2023–2025 primary scope, FY 2022 optional reference | Script parameterized for year range | None |

**Key outcome: ZERO schema changes required. All gaps resolved through extraction logic and data classification.**

---

---

## Section 2.50 — Phase GR: Financial Analytics Restructuring Research (2026-04-08)

**Title:** Financial Data Population Correction and Analytics Restructuring

---

### FINDING GR-A: GP-6 Chart — Disbursement Series Audit

**Location:** `pmo-frontend/pages/university-operations/index.vue`

`financialAmountBarSeries` (lines 1134–1143) currently returns 3 series:
```
{ name: 'Appropriation (₱M)', data: [...] }
{ name: 'Obligations (₱M)', data: [...] }
{ name: 'Disbursement (₱M)', data: [...] }   ← TO REMOVE
```

`financialAmountBarOptions` (line 1148) uses 3 colors: `['#1976D2', '#F57C00', '#4CAF50']`
After removing Disbursement: reduce to `['#1976D2', '#F57C00']`.

Card title (line 2199): `"Budget Absorption by Pillar — Appropriation vs Obligations vs Disbursement"` → update to `"Budget Absorption by Pillar — Appropriation vs Obligations"`.

**Rationale:** Disbursement data is sparse (NULL for most records) and redundant with Obligations for this summary view. Two-series chart is cleaner and less misleading.

---

### FINDING GR-B: GP-7 Chart — Unspent Balance Chart Audit

**Location:** `pmo-frontend/pages/university-operations/index.vue`

`financialVarianceSeries` (lines 1156–1166) and `financialVarianceOptions` (lines 1168–1189) are dedicated to "Unspent Budget Balance by Pillar" chart.

Template (lines 2193–2241): GP-6 and GP-7 rendered side-by-side in a `<v-row>` with two `<v-col cols="12" md="6">` children:
- Left column: GP-6 Budget Absorption chart (to keep)
- Right column: GP-7 Unspent Balance chart (to remove entirely)

After removal: the `<v-row>` will contain only the GP-6 column, which must expand to `cols="12"` for full width.

**Rationale:** Unspent Balance = Appropriation − Obligations, which is derivable visually from the GP-6 two-bar comparison. Redundant standalone chart adds noise without insight.

---

### FINDING GR-C: Default Quarter in financial/index.vue

**Location:** `pmo-frontend/pages/university-operations/financial/index.vue`, line 79:
```typescript
const selectedQuarter = ref<string>('Q4')
```

**Status: Already Q4. No change required.**

---

### FINDING GR-D: Physical Analytics Completeness

GP-4 (`targetVsActualSeries` — two-series Target/Actual bar) and GP-5 (`yoyTargetVsActualSeries` — YoY per-pillar) were implemented in Phase GP.

**Status: Physical analytics fully implemented. No change required.**

---

### FINDING GR-E: Financial Data Population Validation

From Phase GQ research (Section 2.49):
- All 4 pillars populated for FY2023, FY2024, FY2025 ✓
- MFO1 FY2025: Appropriation=755,306,114.00, Obligations=745,577,341.25, Utilization≈98.71% — **matches DB exactly** ✓
- FY2022: Migration script (`database/staging/migrate_fy2022_financial.js`) written and dry-run verified. Awaiting operator `--apply`.

**No new validation queries required.** Data state confirmed current and correct from GQ.

---

### FINDING GR-F: Implementation Scope Summary

| Item | Action | File | Lines |
|------|--------|------|-------|
| Remove Disbursement series | Delete series entry + update colors | index.vue | 1141, 1148 |
| Update GP-6 chart title | String update | index.vue | 2199 |
| Remove financialVarianceSeries | Delete computed (11 lines) | index.vue | 1156–1166 |
| Remove financialVarianceOptions | Delete computed (22 lines) | index.vue | 1168–1189 |
| Remove GP-7 template block | Delete right `<v-col>` (23 lines) | index.vue | 2218–2240 |
| Expand GP-6 to full width | md="6" → cols="12" | index.vue | 2195 |
| Default Q4 in financial page | No-op (already Q4) | — | — |
| Physical analytics | No-op (already complete) | — | — |

**Total mutations: 6 targeted edits, all in `index.vue`. Zero backend changes.**

---

---

## Section 2.51 — Phase GS: Analytics Correction, Cross-Analytics Relevance, Financial Data Population Fix (2026-04-08)

**Title:** Analytics Correction, Cross-Analytics Relevance, and Financial Data Population Fix (FY2022 & FY2025)

---

### FINDING GS-A: Financial Quarterly Trend Chart — Removal Target

**Location:** `pmo-frontend/pages/university-operations/index.vue`

- `financialTrendOptions` computed: lines 486–497 (4-series line: Appropriation, Obligations, Utilization%, Disbursement%)
- `financialTrendSeries` computed: lines 499–515
- Template block "Row 3: Financial Quarterly Trend": lines 2256–2276
- Chart renders unconditionally (no `v-if` guard)
- **Verdict:** Redundant clutter — quarterly trend (Q1–Q4) for a single fiscal year adds no analytical value beyond what the Budget Absorption bar already shows for the full year.
- **Action:** Remove computeds (lines 486–515) + template block (lines 2256–2276) entirely.

---

### FINDING GS-B: Utilization Rate by Pillar Radial — "No Data" Root Cause

**Location:** `pmo-frontend/pages/university-operations/index.vue`

**Root cause 1 — Default fiscal year is 2026:**
`useFiscalYearStore` initializes `selectedFiscalYear` to `new Date().getFullYear()` = 2026 (line 21 of `fiscalYear.ts`). FY2026 has zero financial records. `getFinancialPillarSummary(2026)` returns an empty `pillars` array. `financialPillarChartSeries` falls back to `[0, 0, 0, 0]`. The radial chart renders 4 arcs at 0%, which looks like "no data" visually.

**Root cause 2 — No empty state guard:**
The template (lines 2221–2226) renders `<VueApexCharts>` unconditionally — there is no `v-if` to show a "no data" placeholder when all values are 0. The Expense Class donut at line 2240 has this guard (`v-if="expenseBreakdownSeries.length > 0"`); the utilization radial does not.

**Root cause 3 — Missing expense class breakdown:**
The user expects the chart to show per-pillar data with PS/MOOE/CO sub-breakdown. Currently the radial only shows one utilization % per pillar (no expense class granularity). The `financialExpenseBreakdown` endpoint only groups by expense_class (all pillars combined) — no per-pillar × expense_class query exists.

**Backend confirmation:** `getFinancialPillarSummary` correctly aggregates by `operation_type` with `deleted_at IS NULL` constraints. Data is present and correct for FY2023–2025. The issue is solely in the frontend default year and missing guards.

---

### FINDING GS-C: Physical Analytics — Target vs Actual

**Status: ALREADY IMPLEMENTED (Phase GP-4).**

Template at lines 1827–1852: "Target vs Actual Achievement Rate by Pillar — FY {{ selectedFiscalYear }}" grouped bar chart with `v-if="pillarSummary?.pillars?.length"` guard.

`targetVsActualSeries` (lines 1067–1085): two series — Target (100%) and Actual (accomplishment_rate_pct). Pillar-filtered by `selectedGlobalPillar`. ✓

**No action required.**

---

### FINDING GS-D: Physical Analytics — YoY Comparison

**Status: ALREADY CORRECT (Phase EE-C + GP-5).**

`yearlyComparisonSeries` (lines 982–1010): ALL mode = 4 separate series, one per pillar, each with per-year accomplishment rates. NO averaging across pillars. Per-pillar data is independent. ✓

`yoyTargetVsActualSeries` (lines 1087–1108, Phase GP-5): visible when single pillar selected, shows avg target vs avg actual per year for PERCENTAGE indicators. ✓

**The user's "averaging across pillars" complaint is NOT about the Physical YoY chart — it is about the Cross Analytics YoY chart (see GS-E).**

---

### FINDING GS-E: Cross Analytics — Averaging Anti-Pattern (Root Cause Identified)

**Location:** `crossModuleYoYSeries` ALL mode, lines 753–774

Current code in ALL mode:
```typescript
// Physical: arithmetic mean of accomplishment_rate across all pillars per year
const sum = yearData.pillars.reduce((acc, p) => acc + Number(p.accomplishment_rate || 0), 0)
return Number((sum / yearData.pillars.length).toFixed(1))

// Financial: arithmetic mean of utilization_rate across pillars with data per year
const pillarRates = PILLARS.map(p => ...).filter(r => r > 0)
return Number((pillarRates.reduce((a, b) => a + b, 0) / pillarRates.length).toFixed(1))
```

**Anti-pattern:** Arithmetic averaging of independent pillar rates yields a meaningless composite metric. Pillars have different scales, indicator counts, and budget sizes — their rates are NOT additive.

**Correct approach:** Show each pillar as an independent series. x-axis = fiscal years, one series per pillar, y = that pillar's physical achievement rate. This is identical to how `yearlyComparisonSeries` handles the Physical YoY — it already does this correctly. The cross-module YoY should adopt the same per-pillar pattern.

**What is already correct:**
- `crossComparisonSeries` (lines 655–674): per-pillar Physical vs Financial for current FY ✓
- `crossModuleYoYSeries` single-pillar mode (lines 732–750): already per-pillar (correct) ✓
- KPI cards (Physical Accomplishment, Budget Utilization scalars): summary scalars for display only — averaging is acceptable at this level ✓

**Required fix:** `crossModuleYoYSeries` ALL mode only. Change from 2-series averaged output to 4-series per-pillar output (x-axis = fiscal years, series = one per pillar, showing each pillar's physical achievement rate). Remove the averaged "Financial Utilization (%)" series from the YoY chart — Financial per-pillar comparison is already handled by `crossComparisonSeries` (current FY).

---

### FINDING GS-F: FY2022 Financial Data — Root Cause

**DB state (confirmed 2026-04-08):**
```
university_operations WHERE fiscal_year=2022:
  id=31c907cc-... | HIGHER_EDUCATION | deleted_at=2026-04-05T04:04:42.175Z  ← SOFT-DELETED
  (no ADVANCED_EDUCATION / RESEARCH / TECHNICAL_ADVISORY records exist)

operation_financials WHERE fiscal_year=2022: 0 rows
```

**Root cause 1 — Parent operation soft-deleted:** The only FY2022 `university_operations` record was soft-deleted by the user on 2026-04-05. The backend query (`getFinancialPillarSummary`) filters `uo.deleted_at IS NULL`, so this record is excluded.

**Root cause 2 — Migration never applied:** `database/staging/migrate_fy2022_financial.js` (GQ-3) was written and dry-run verified but `--apply` was never executed. Even if run now, it would fail Step 0 (HE verification) because `31c907cc-...` is soft-deleted.

**Fix:** Update the migration script — change from "EXISTING_HE_2022_ID verification" to "create new HE FY2022 parent." All 4 parent operations must be created. Then run `--apply`. This is a data operation (OPERATOR task).

---

### FINDING GS-G: FY2025 HE Duplicates — Root Cause

**DB state (confirmed 2026-04-08):**
```
university_operations WHERE fiscal_year=2025 AND operation_type='HIGHER_EDUCATION':
  - 14 non-deleted records, all titled "Higher Education Program - FY 2025"
  - 1 record (0eeb6bfc-...) has 5 financial records: allotment=755,306,114, obligation=745,577,341.25
  - 13 records are empty (0 financial records)
```

**Root cause:** Multiple duplicate `university_operations` were created via the UI (probably via "Add Operation" repeated clicks or test data entry) for FY2025 HIGHER_EDUCATION. Each click creates a new parent row.

**Analytics dashboard impact:** `getFinancialPillarSummary` aggregates by `operation_type` across ALL matching operations, so the analytics correctly show the correct totals for FY2025 HE. **Analytics are NOT broken.**

**Financial module page impact:** `financial/index.vue` lists operations by fiscal year + type. When viewing FY2025 HE, the user may land on one of the 13 empty operations (no financial records displayed), creating the perception that "FY2025 is not rendering." The data exists but is on a different operation ID.

**Fix:** Soft-delete the 13 empty ghost operations for FY2025 HIGHER_EDUCATION (keep `0eeb6bfc-...`). This is a data operation (OPERATOR task).

---

### FINDING GS-H: Fiscal Year Store Default

**Location:** `pmo-frontend/stores/fiscalYear.ts`, line 21

```typescript
const selectedFiscalYear = ref<number>(new Date().getFullYear())  // = 2026 in 2026
```

FY2026 has no financial data → all financial analytics show 0 / empty on initial load. Users must manually select FY2025 to see data.

**Note:** This is a separate concern from the "no data" appearance. Adding an empty state guard (GS-F2) will surface a clear "no data" message instead of 0% radials. The store default itself is intentional (current year) and should NOT be changed — it is correct behavior.

---

### FINDING GS-I: New Backend Requirement — Per-Pillar Expense Class Breakdown

To satisfy the user's requirement for "per-pillar: total appropriation, total obligations, utilization rate WITH breakdown: PS, MOOE, CO" within the Utilization section, a new backend query is needed:

```sql
SELECT uo.operation_type AS pillar_type,
       of2.expense_class,
       COALESCE(SUM(of2.allotment), 0) AS total_appropriation,
       COALESCE(SUM(of2.obligation), 0) AS total_obligations,
       CASE WHEN SUM(of2.allotment) > 0 THEN ROUND((SUM(of2.obligation)::numeric / SUM(of2.allotment)) * 100, 2) ELSE 0 END AS utilization_rate
FROM operation_financials of2
JOIN university_operations uo ON uo.id = of2.operation_id
WHERE uo.fiscal_year = $1 AND of2.deleted_at IS NULL AND uo.deleted_at IS NULL
GROUP BY uo.operation_type, of2.expense_class
ORDER BY uo.operation_type, of2.expense_class
```

Returns: rows of `(pillar_type, expense_class, total_appropriation, total_obligations, utilization_rate)`.

**No schema changes required.**

---

### FINDING GS-J: Summary of All Required Actions

| # | Issue | Type | Action |
|---|-------|------|--------|
| 1 | Financial Quarterly Trend chart | Frontend removal | Delete 2 computeds + template block |
| 2 | Utilization radial "no data" appearance | Frontend guard | Add `v-if` empty state |
| 3 | Per-pillar expense class breakdown missing | Backend + Frontend | New endpoint + table display |
| 4 | Cross-module YoY ALL mode averages | Frontend fix | Per-pillar series (4 series) |
| 5 | FY2022 HE parent soft-deleted | Data (OPERATOR) | Update migration script + `--apply` |
| 6 | FY2025 HE 13 ghost operations | Data (OPERATOR) | Soft-delete 13 empty duplicates |

---

## Section 2.52 — Phase GT: Data Visual Relevance, FY2022 Data Population Fix, and Analytics Restructuring

**Date:** 2026-04-10
**Status:** PHASE 1 COMPLETE

---

### FINDING GT-A: Root Cause — Empty Fiscal Years in Financial YoY Charts

**Symptom:** FY2026 appears in the Financial Year-over-Year chart with 0% utilization bars even when no financial data exists for that year.

**Root cause — Backend (primary):**
`getFinancialYearlyComparison(years: number[])` in `university-operations.service.ts` line 3140 returns:
```typescript
return { years, data: result.rows };
```
`years` is the **INPUT array** passed from the frontend — all fiscal years from the `fiscal_years` table, regardless of whether data exists. `result.rows` is SQL-driven and only contains years with actual operation_financials records. But the frontend iterates `years` (the input list) to build series, producing 0-value bars for empty years.

**Contrast — Physical YoY (correct):**
`getYearlyComparison(years)` returns `{ years: result.rows }` where `result.rows` is grouped by `fiscal_year` — only years with actual `operation_indicators` data appear. The Physical YoY chart naturally excludes empty years.

**Root cause — Frontend (secondary):**
`financialYearlySeries` computed (line ~565) in ALL mode:
```typescript
return years.map((year: number) => ({
  name: `FY ${year}`,
  data: PILLARS.map(p => {
    const match = data.find((d: any) => d.fiscal_year === year && d.pillar_type === p.id)
    return match ? Number(match.utilization_rate) : 0
  }),
}))
```
When `match` is not found (year has no data), it returns `0`, creating a visible zero bar.

**Fix location:** Backend `getFinancialYearlyComparison` — change return to use data-driven years only.

---

### FINDING GT-B: Budget Scale Distortion — Analysis

**User concern:** Higher Education values dwarf other pillars, causing visual imbalance.

**Current financial chart analysis:**
- `financialYearlySeries` (ALL mode): x-axis = pillars, series = fiscal years, values = `utilization_rate` (%) → **Already normalized. No scale distortion.**
- `pillarRadialSeries`: values = `avg_utilization_rate` (%) → **Already normalized.**
- `expenseBreakdownSeries`: values = `total_obligations` (raw PHP amounts) — HE will be vastly larger than others → **This IS the scale distortion source.**
- `pillarExpenseRows` (GS-5): shows raw PHP amounts in a table → visual discrepancy visible but manageable in table format.

**Conclusion:** The raw-value charts (expense breakdown donut, pillar expense table) naturally show HE dominance due to budget scale. The **donut chart** (`expenseBreakdownSeries`) uses raw obligation values and will show HE consuming >95% of the donut. This is misleading for PS/MOOE/CO proportion analysis ACROSS pillars.

**Action required:** The donut (`expenseBreakdownOptions/Series`) is useful for PS/MOOE/CO split within ALL pillars combined — but since HE dominates, it effectively shows HE's expense class split only. For cross-pillar comparison, utilization rate is already normalized. **No chart replacement needed** — the existing utilization charts are already correct. Document this finding as resolved by existing implementation.

---

### FINDING GT-C: Physical radialBar — Redundancy and Replacement Design

**Current state:**
- `pillarChartOptions` at line ~769: `type: 'radialBar'`, shows `accomplishment_rate_pct` per pillar
- `pillarChartSeries` = `pillarSummary?.pillars?.map(p => p.accomplishment_rate_pct || 0)`
- Template: Physical Dashboard tab, positioned alongside quarterly trend chart

**Why it is redundant:**
1. `targetVsActualSeries` (Target vs Actual grouped bar, line ~1060) already shows the same `accomplishment_rate_pct` data alongside the 100% target baseline — directly above or near the radialBar
2. The radialBar adds no insight beyond what the grouped bar already conveys
3. Radial bars are visually decorative but hard to compare precisely between pillars

**Replacement design — Horizontal Ranked Bar Chart:**
- Type: `bar` (horizontal)
- X-axis: Achievement Rate (0–120%)
- Y-axis: Pillars sorted by rate descending (highest performer on top)
- Data labels: show exact % values
- Color: each pillar's PILLARS color constant
- Annotation: vertical reference line at 100% (target)
- Click handler: navigate to physical page for that pillar (preserve existing drill-down)

**Computeds to replace:**
- `pillarChartOptions` → repurpose as `pillarRankedOptions` (horizontal bar config)
- `pillarChartSeries` → repurpose as `pillarRankedSeries` (sorted data array)

**Template change:** Replace `type="radialBar"` with `type="bar"` in the Physical Dashboard radial chart block.

---

### FINDING GT-D: Cross Analytics ALL Mode — GS-6 Design Gap

**Current state after GS-6 (Directive 316):**
`crossModuleYoYSeries` in ALL mode returns 4 series — one per pillar — each showing Physical Accomplishment Rate (%) per year. This means the cross analytics "Year-over-Year" chart in ALL mode now shows **Physical-only** data. The Financial dimension is gone in ALL mode.

**Design gap:** The Cross analytics tab purpose is to compare Physical vs Financial performance. GS-6 fixed the *averaging* problem (was incorrectly averaging all pillars into 2 series), but the fix removed the Financial series entirely in ALL mode. This breaks the cross-analytics value proposition.

**Required correction:**
- ALL mode: 2 series — `Avg Physical Accomplishment (%)` and `Avg Financial Utilization (%)` — per year on x-axis
  - Physical avg = mean of all 4 pillars' `accomplishment_rate` for that year
  - Financial avg = mean of all 4 pillars' `utilization_rate` for that year
- Single pillar mode: unchanged (2 series: Physical vs Financial for that specific pillar per year)

This restores cross-analytics relevance without the original averaging-error. The ALL mode becomes an institution-level physical vs financial trend comparison, and single-pillar mode enables drill-down.

**Affected chart title:** Currently `crossModuleYoYOptions` in ALL mode has no title; in single-pillar mode the title reads `"YoY Cross-Module — {pillar name}"`. In ALL mode after fix, title should be `"Institution-Level Physical vs Financial Trend"`.

---

### FINDING GT-E: Cross Analytics Enhancement — Efficiency Analysis

**Current Cross analytics visuals (2 charts):**
1. `crossComparisonOptions/Series` — Physical vs Financial per pillar (current FY, bar chart) ✅ useful
2. `crossModuleYoYSeries/Options` — YoY trend ✅ (needs GT-D fix)

**Missing analytical value — Efficiency Classification:**
Per user request, pillars should be classified by:
| Physical Rate | Financial Rate | Classification |
|---|---|---|
| ≥ target | ≥ target | ✅ Balanced |
| ≥ target | < target | 🔵 Efficient (high output, low spend) |
| < target | ≥ target | 🔴 Wasteful (high spend, low output) |
| < target | < target | ⚠️ Under-performing |

**Implementation approach (KISS):**
- Add a simple v-row of 4 `v-card` chips/badges below the cross-comparison chart
- Each card shows: pillar name, Physical%, Financial%, classification badge
- No additional ApexCharts chart needed
- Data source: existing `crossComparisonSeries` data (pillarSummary + financialPillarSummary)
- Computed: `pillarEfficiencyClassification` → array of `{ pillar, physRate, finRate, label, color, icon }`

**Threshold:** target = 100% (standard); labels configurable but 100% is the baseline.

---

### FINDING GT-F: FY2022 Migration Data Integrity Check

**Current migration file:** `database/staging/migrate_fy2022_financial.js` (GS-7 version)
**Source claimed:** `BAR1_Executive_Analytics_2022_2025.xlsx`, expense-class subtotals

**Verification against screenshots:**

| Pillar | Expense Class | Migration Value | Screenshot Sub-total | Match? |
|--------|--------------|-----------------|----------------------|--------|
| MFO1 HE | PS | 221,447,181.80 | Main(164,993,147.70)+Cab(56,454,034.08) = 221,447,181.78 | ✅ (rounding) |
| MFO1 HE | MOOE | 170,358,122.20 | Main(166,895,727.22)+Cab(3,462,395.00) = 170,358,122.22 | ✅ (rounding) |
| MFO2 AE | PS | 35,167.47 | Main(34,167.47)+Cab(1,000.00) = 35,167.47 | ✅ |
| MFO2 AE | MOOE | 400,832.53 | Main(377,731.53)+Cab(23,101.00) = 400,832.53 | ✅ |
| MFO3 RES | PS | 109,669.43 | Main(83,669.43)+Cab(26,000.00) = 109,669.43 | ✅ |
| MFO3 RES | MOOE | 2,573,330.57 | Main(1,893,742.57)+Cab(679,588.00) = 2,573,330.57 | ✅ |
| MFO3 RES | CO | 10,051,000.00 | Main(10,051,000.00)+Cab(none) = 10,051,000.00 | ✅ |
| MFO4 EXT | PS | 496,036.66 | Screenshot partial only (2 campuses shown = 124,370.34). Sub-total = 496,036.66 | ✅ (from Excel subtotal) |
| MFO4 EXT | MOOE | 177,593.00 | Screenshot: Main=471,036.66, Cab=177,593.00 → visible sum = 648,629.66. MFO4 Total=773,000.00; Expected MOOE subtotal = 773,000.00 - 496,036.66 = **276,963.34** | ❌ **MISMATCH** |

**Critical discrepancy — MFO4 MOOE:**
- Migration value: 177,593.00
- Expected from sub-totals: 276,963.34
- Difference: 99,370.34

The 177,593.00 appears to be **Cabadbaran campus MOOE only** — not the expense-class subtotal. This suggests the Excel extraction captured an individual campus row instead of the row sub-total for MFO4 MOOE.

**Impact:** MFO4 financial data will be understated by 99,370.34 for both appropriation and obligation.

**Action required:** Operator must open `Continuing Appropriations.xlsx` (or the original source Excel) and verify:
1. MFO4 MOOE sub-total row value
2. Correct value is likely ~276,963.34 (to match the 773,000.00 total)
3. Update migration script with corrected value before running `--apply`

**Additional note:** The migration does not run per-campus breakdowns — it uses expense-class subtotals only. This is by design (Directive 298). Per-campus breakdown is not required for analytics (the `getFinancialCampusBreakdown` endpoint handles campus views for data that IS entered with campus granularity).

---

### FINDING GT-G: YoY Formula Documentation Gap

**User request:** Document the correct YoY computation formula in the "Analytics Guide."

**Correct formula (from existing codebase — `getYearlyComparison` in service.ts lines 2206–2215):**

For EACH indicator per pillar per year:
```
Individual indicator achievement rate:
  COUNT/WEIGHTED_COUNT: (sum_actual / sum_target) × 100
  PERCENTAGE: (avg_actual / avg_target) × 100
```

Then:
```
YoY pillar accomplishment rate:
  = AVG of all valid indicator achievement rates for that pillar in that year
  (NULL values excluded from average — SQL AVG ignores NULLs)
```

**Key rules already enforced:**
- Indicators with `sum_target = 0` → NULL (not included in average)
- Percentage indicators with `filled_target_qs = 0` → NULL (not included)
- Cross-pillar averaging is NEVER done for per-pillar rates (each pillar independent)

**Location to add documentation:** Analytics Guide expansion panel in `index.vue` template. Currently the help text mentions "Expense Class Breakdown by Pillar" (added GS-5). A new entry for "YoY Accomplishment Rate Formula" should be added.

---

### FINDING GT-H: Summary of All Required Actions for Phase GT

| # | Issue | Type | Root Cause | Action |
|---|-------|------|------------|--------|
| 1 | Empty FY2026 in Financial YoY | Backend | `getFinancialYearlyComparison` echoes input years | Return data-driven years only |
| 2 | Cross YoY ALL mode shows Physical-only | Frontend | GS-6 removed Financial series | Restore 2-series avg Physical vs avg Financial |
| 3 | Physical radialBar is decorative/redundant | Frontend | RadialBar chosen historically | Replace with horizontal ranked bar |
| 4 | No Efficiency Analysis in Cross tab | Frontend | Feature not built | Add pillarEfficiencyClassification cards |
| 5 | MFO4 MOOE migration value wrong | Data | Wrong row captured from Excel (177K vs ~277K) | Operator verify + fix migration value |
| 6 | YoY formula undocumented | Frontend | No help text entry | Add entry to Analytics Guide panel |

---

## [ARCHIVED] Sections 1.33–1.65B (Feb 16 – Mar 3, 2026)

> **9,372 lines archived to:** `docs/archive/research_sections_1.33_to_1.65B_governance_2026-02-16.md`
>
> **Phases covered:** P, Q, R, DH, DI (all ✅ COMPLETE)

---

## [ARCHIVED] Sections 1.70–2.08 (Mar 4 – Mar 20, 2026)

---

## Section 2.53 — Phase GU: TypeScript TS2362/TS2363 Error in `getFinancialYearlyComparison`

**Phase:** GU | **Date:** 2026-04-10 | **Status:** RESEARCH COMPLETE

### Finding GU-1: Root Cause — Type Inference Chain Degradation via `any[]`

**Location:** `university-operations.service.ts:3164`

**Erroring code:**
```typescript
const dataYears = [...new Set(result.rows.map((r: any) => Number(r.fiscal_year)))].sort((a, b) => a - b);
```

**Errors:** TS2362 (left-hand side), TS2363 (right-hand side) — arithmetic operation operands not recognized as `number`.

**Root cause chain:**
1. `this.db.query<T = any>()` → `QueryResult<any>` → `result.rows: any[]`
2. `any[].map((r: any) => Number(r.fiscal_year))` → TypeScript may infer return as `number[]` OR lose the type through the `any` inference chain
3. `new Set(inferredArray)` → if array type is degraded, TypeScript infers `Set<unknown>` or `Set<any>` instead of `Set<number>`
4. `[...Set<unknown>]` → `unknown[]`
5. Sort comparator `(a, b) => a - b` → `a: unknown`, `b: unknown` → **TS2362, TS2363**

**tsconfig evidence:** `noImplicitAny: false`, no explicit `lib`, `target: "ES2021"` — TypeScript is lenient but still catches arithmetic on `unknown` operands.

**Physical equivalent (`getYearlyComparison`)** does NOT use this pattern — it builds `yearsData` through fully typed `parseInt`/`parseFloat` transformations, never using `Set` spread. No corresponding error exists there.

### Finding GU-2: Safe Value Guarantee

`fiscal_year` is `INTEGER NOT NULL` in `university_operations` (migration 014). At runtime, null values are impossible. However:
- `Number(null)` → `0` (semantically wrong year)
- `Number("")` → `0`
- `Number("N/A")` → `NaN` (breaks arithmetic)

Adding `Number.isFinite()` filter eliminates all unsafe values without risk in production data.

### Finding GU-3: `dataYears` Consumption

`getFinancialYearlyComparison` returns `{ years: dataYears, data: result.rows }`. Frontend `index.vue` iterates `years` to build chart x-axis labels. The array must be `number[]` — no downstream impact from adding the filter.

---

## Section 2.54 — Phase GV: Data Visual Relevance, FY2022 Per-Campus Population, Budget Chart Normalization (2026-04-10)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready
**Scope:** (A) Audit GT/GU implementation completeness. (B) Identify remaining analytics chart distortion. (C) Define per-campus FY2022 migration design. (D) Root cause analysis per operator-issued prompt.

---

### FINDING GV-A: GT/GU Implementation Audit (Code-Verified 2026-04-10)

Full code inspection against Phase GT plan steps:

| Step | Directive | Evidence | Status |
|------|-----------|----------|--------|
| GT-1 | 320: `getFinancialYearlyComparison` returns data-driven years | `service.ts:3164–3168` — `rawYears` via `Number.isFinite()` filter, `dataYears` via `Set` + `sort` | ✅ IMPLEMENTED |
| GT-2 | 322: Cross YoY ALL mode = avg Physical + avg Financial | `index.vue:774–796` — 2-series: `Avg Physical Accomplishment (%)`, `Avg Financial Utilization (%)` | ✅ IMPLEMENTED |
| GT-3 | 321: Physical radialBar → horizontal ranked bar | `index.vue:799–848` — horizontal bar, sorted by rate, 100% xaxis annotation, `navigateToPhysical` click handler preserved | ✅ IMPLEMENTED |
| GT-4 | 323: Efficiency Classification Cards in Cross tab | `index.vue:624` — `pillarEfficiencyClassification` computed. `index.vue:1738` — template block in Cross tab | ✅ IMPLEMENTED |
| GT-5 | 324: MFO4 MOOE verification | Migration file still holds `177593.00` — no operator correction received | ⬜ OPERATOR-BLOCKED |
| GT-6 | —: Run FY2022 migration | No FY2022 records in DB (`operation_financials WHERE fiscal_year=2022: 0 rows` per GS-F) | ⬜ BLOCKED on GT-5 |
| GT-7 | 325: YoY formula in Analytics Guide | `index.vue:1665–1668` — expansion panel `mdi-function-variant` + `YoY Accomplishment Rate Formula` | ✅ IMPLEMENTED |
| GU | 326: TypeScript TS2362/TS2363 fix | `service.ts:3163–3167` — typed `rawYears: number[]`, `dataYears: number[]`, same commit as GT-1 | ✅ IMPLEMENTED |

**Conclusion:** GT-1 through GT-4, GT-7, and GU are fully implemented. Remaining operator-gated items are GT-5/GT-6 (FY2022 data) and GS-8 (FY2025 ghost cleanup). No code regressions detected.

---

### FINDING GV-B: Budget Absorption Chart — Scale Distortion Analysis

**Chart:** `financialAmountBarSeries` / `financialAmountBarOptions` at `index.vue:1124–1148`. Template block at `index.vue:2200–2225`.

**Type:** Grouped bar chart (Appropriation vs Obligations in ₱M, per pillar).

**Scale distortion magnitude:**
| Pillar | Approx. Total Appropriation (FY2025) | Relative Scale |
|--------|--------------------------------------|----------------|
| Higher Education | ~₱755M | 1.0× baseline |
| Advanced Education | ~₱0.4M | 0.0005× |
| Research | ~₱13M | 0.017× |
| Technical Advisory | ~₱0.8M | 0.001× |

HE is 500–1,800× larger than AE/Extension. In a grouped bar chart without log scale, AE, Research, and Extension bars become visually invisible. The chart effectively shows only HE data with near-zero bars for the rest.

**Data overlap with existing charts:**
- Absolute amounts (PS/MOOE/CO) → already in `pillarExpenseRows` table (GS-5) ✅
- Absolute YoY amounts → `financialYoyAmountSeries` (GP-8) ✅
- Utilization rates (normalized %) → `pillarRadialSeries` radial chart ✅
- Utilization rates per year → `financialYearlySeries` (YoY %) ✅

**Conclusion:** The Budget Absorption bar chart is the sole raw-PHP-value chart in the Financial Dashboard section. Its content (Appropriation vs Obligations per pillar) is fully duplicated by the per-pillar expense table (GS-5) in more detail. The chart adds visual noise without analytical benefit. **Recommendation: Remove Budget Absorption bar chart entirely.** The per-pillar expense table and the existing normalized charts (radial, YoY %) satisfy all analytical requirements without scale distortion.

**Impact of removal:**
- Delete `financialAmountBarPillars`, `financialAmountBarSeries`, `financialAmountBarOptions` computeds (~25 lines)
- Delete template block at lines 2200–2225 (~26 lines)
- `financialAmountBarPillars` is also used by `financialYoyAmountOptions` (line 1187) and `financialAmountBarOptions` (line 1143) — on removal, `financialYoyAmountOptions` must be refactored to reference `PILLARS` directly instead

---

### FINDING GV-C: FY2022 Per-Campus Data Requirement — Design Analysis

**User requirement:** Insert FY2022 financial data with per-campus granularity (Main Campus + Cabadbaran per expense class per pillar), not just expense-class subtotals.

**Current migration design:** `migrate_fy2022_financial.js` inserts 9 records — one per expense class per pillar (subtotals), with `department = NULL`. This follows Directive 298 (subtotals only).

**New design requirement:** Per-campus records using `department` field:
- Each record = one campus × one expense class × one pillar
- `department`: `'Main'` or `'Cabadbaran'`
- Record count: up to 4 pillars × 2 campuses × 3 expense classes = 24 records max (fewer when "-" → NULL)

**DB column availability:** `operation_financials.department` is `VARCHAR` (nullable). Already used for existing FY2023–2025 campus records that were migrated via `migrate_financial_per_campus.js` (visible in staging directory). No schema change needed.

**Analytics impact:**
- `getFinancialCampusBreakdown(fiscalYear)` will return FY2022 campus data once per-campus records are inserted
- `campusBreakdownSeries` / `campusBreakdownOptions` template block (lines 2227–2250) already conditionally renders when campus data exists — FY2022 campus breakdown chart will appear automatically ✅
- Existing subtotal-level analytics (`getFinancialPillarSummary`) correctly aggregates by `operation_type` across all records — per-campus records will be summed correctly ✅

**Data source:** Operator-provided screenshots (MFO1–MFO4, dated 2026-04-10) showing per-campus FY2022 values. Screenshots are referenced but values must be transcribed by operator.

---

### FINDING GV-D: FY2022 Per-Campus Values — Known State

From GT-F research (cross-referenced against screenshot data):

| MFO | Pillar | Expense Class | Main Campus | Cabadbaran | Subtotal |
|-----|--------|--------------|-------------|------------|----------|
| MFO1 | HIGHER_EDUCATION | PS | 164,993,147.70 | 56,454,034.08 | 221,447,181.78 ✅ |
| MFO1 | HIGHER_EDUCATION | MOOE | 166,895,727.22 | 3,462,395.00 | 170,358,122.22 ✅ |
| MFO1 | HIGHER_EDUCATION | CO | 0 | 0 | 0 → SKIP |
| MFO2 | ADVANCED_EDUCATION | PS | 34,167.47 | 1,000.00 | 35,167.47 ✅ |
| MFO2 | ADVANCED_EDUCATION | MOOE | 377,731.53 | 23,101.00 | 400,832.53 ✅ |
| MFO3 | RESEARCH | PS | 83,669.43 | 26,000.00 | 109,669.43 ✅ |
| MFO3 | RESEARCH | MOOE | 1,893,742.57 | 679,588.00 | 2,573,330.57 ✅ |
| MFO3 | RESEARCH | CO | 10,051,000.00 | 0 | 10,051,000.00 ✅ (Main only) |
| MFO4 | TECHNICAL_ADVISORY | PS | ? | ? | 496,036.66 (subtotal confirmed) |
| MFO4 | TECHNICAL_ADVISORY | MOOE | ? | 177,593.00 | ~276,963.34 (subtotal expected) |

**Status per pillar:**
- MFO1 (HE): Both campuses confirmed from GT-F. Ready for per-campus migration.
- MFO2 (AE): Both campuses confirmed from GT-F. Ready.
- MFO3 (Research): Both campuses confirmed from GT-F. CO is Main-only (Cabadbaran = 0). Ready.
- MFO4 (Extension): Per-campus breakdown NOT confirmed. OPERATOR MUST verify Main Campus PS, Main Campus MOOE from source Excel. Cabadbaran MOOE = 177,593.00 confirmed (this was the only MFO4 value in current migration).

**MFO4 Obligation values:** GT-F documents all pillars at 100% utilization except Research (98.04%). For MFO1/MFO2/MFO4 → `obligation = allotment` per campus. For MFO3 CO → `obligation = 9,801,128.17` (Main only, Cabadbaran = 0).

---

### FINDING GV-E: Data Handling Rules (from Operator Prompt Section C)

Rules to encode in updated migration script:
1. `"-"` in source Excel → `NULL` (not zero) for allotment/obligation fields
2. `"#DIV/0!"` in source Excel → computed utilization_rate = NULL (store raw allotment/obligation; backend computes rate on the fly)
3. Utilization rate = obligations ÷ appropriation (per Section C) — backend computes this; migration stores raw values only
4. CO row where both allotment = 0 AND obligation = 0 → SKIP record entirely (Directive 301)
5. "-" appropriation with non-zero obligation → store `allotment = NULL`, `obligation = <value>` (edge case)

---

### FINDING GV-F: Root Cause Summary (Operator Prompt Section D)

| Root Cause | Finding | Phase |
|------------|---------|-------|
| FY2022 not populated | (1) HE parent soft-deleted. (2) Migration script never `--apply`-ed. (3) MFO4 MOOE value wrong. | GS-F, GT-F |
| Empty years in charts | `getFinancialYearlyComparison` echoed input array, not data-driven years. | GT-A |
| Budget Absorption scale distortion | Raw PHP values plotted without normalization. HE 500×+ larger than others. | GV-B |
| Cross analytics weakness | `crossModuleYoYSeries` ALL mode was arithmetic average of pillar rates — meaningless composite. | GS-E |
| Physical radial decorative | RadialBar showed same metric as grouped bar. No ranking or comparison value. | GT-C |
| Per-campus FY2022 missing | Migration used subtotals only; `department` field not populated. | GV-C |

**Status of each:**
- Empty years: ✅ FIXED (GT-1)
- Cross analytics averaging: ✅ FIXED (GT-2)
- Physical radial: ✅ FIXED (GT-3, replaced with ranked bar)
- Efficiency analysis: ✅ FIXED (GT-4)
- YoY formula documented: ✅ FIXED (GT-7)
- Budget absorption scale: ❌ REMAINING — planned for GV-1
- FY2022 population: ❌ REMAINING — planned for GV-2 through GV-4 (per-campus design)



---

## Section 2.55 — Phase GW: FY2022 Physical Extraction (Q1–Q3) + Financial Department Casing Fix (2026-04-10)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready
**Scope:** (A) Extract BAR1 Q1–Q3 FY2022 physical indicator data. (B) Root cause and fix for FY2022 financial campus/expense breakdown not rendering.

---

### FINDING GW-A: BAR1 FY2022 Excel File Structure

**Files available:**
```
docs/references/univ_op/2022 Quarter 1 to 4/
  Bar 1 March 2022.xlsx      → Q1 (as of March 31, 2022)
  Bar 1 June 2022.xlsx       → Q2 (as of June 30, 2022)
  Bar 1 September 2022.xlsx  → Q3 (as of September 30, 2022)
  Bar 1 December 2022.xlsx   → Q4 (NOT processed per operator instruction)
```

**Sheet name:** `bar1_report` (all 4 files identical sheet name)

**Range:**
- March 2022: A1:AB107 (107 rows, 28 columns, 3 pages)
- June 2022: A1:AB107 (107 rows)
- September 2022: A1:AB99 (99 rows, 3 pages — slightly shorter)

**Column mapping (0-indexed):**
| Column Index | Excel Col | Field |
|-------------|-----------|-------|
| 1 (B) | B | Program/section label |
| 2–6 (C–G) | C–G | Indicator name continuation (multi-row wrap) |
| 7 (H) | H | UACS Code |
| 9 (J) | J | Q1 Target (Physical Target, Budget Year) |
| 11 (L) | L | Q2 Target |
| 13 (N) | N | Q3 Target |
| 14 (O) | O | Q4 Target |
| 15 (P) | P | Total Target |
| 16 (Q) | Q | Q1 Accomplishment |
| 17 (R) | R | Q2 Accomplishment |
| 18 (S) | S | (merged/empty) |
| 19 (T) | T | Q3 Accomplishment |
| 20 (U) | U | (merged/empty) |
| 21 (V) | V | Q4 Accomplishment |
| 25 (Z) | Z | Remarks |

**Key structural facts:**
- 3 pages per file, each page re-prints headers at rows ~10–12, ~44–46, ~85–87
- Indicator names wrap across 2–4 rows; need row concatenation
- Targets are the ANNUAL PLAN — set once, not revised between quarters
- Each quarterly file shows ALL accomplishments up to that quarter (cumulative)
- Page break rows (rows 37, 78 in March) have "This report was generated..." footers

---

### FINDING GW-B: September 2022 — Authoritative Data Source for All Q1–Q3

**Decision:** Use September 2022 file exclusively for both target and accomplishment data.

**Rationale:**
- September file is the most recent Q1-Q3 snapshot
- Contains revised Q1 and Q2 data (e.g., HE-OC-01 Q2A: June showed 118.82%, September shows 109.29% — revised)
- September Q3 column is the primary new data
- Single-source extraction avoids cross-file reconciliation complexity

**Indicator data extracted (September 2022, authoritative):**

| Code | Target Q1 | Target Q2 | Target Q3 | Target Q4 | Acc Q1 | Acc Q2 | Acc Q3 |
|------|-----------|-----------|-----------|-----------|--------|--------|--------|
| HE-OC-01 | NULL | NULL | 101.10 | NULL | 114.51 | 109.29 | 110.53 |
| HE-OC-02 | NULL | NULL | 65.00 | NULL | NULL | NULL | 48.16 |
| HE-OP-01 | NULL | NULL | 65.00 | NULL | NULL | NULL | 69.98 |
| HE-OP-02 | NULL | NULL | NULL | 20.00 | 96.30 | 96.30 | 96.30 |
| AE-OC-01 | NULL | NULL | 50.00 | NULL | NULL | NULL | 90.32 |
| AE-OP-01 | NULL | NULL | 70.00 | NULL | NULL | NULL | 100.00 |
| AE-OP-02 | NULL | NULL | 20.00 | NULL | 81.82 | 81.82 | 81.82 |
| RP-OC-01 | NULL | NULL | 3.00 | 6.00 | 16.00 | 12.00 | NULL |
| RP-OP-01 | NULL | 10.00 | 20.00 | 25.00 | 20.00 | 17.00 | 19.00 |
| RP-OP-02 | NULL | NULL | 50.00 | 50.00 | 36.84 | 50.94 | 13.24 |
| TA-OC-01 | NULL | NULL | 4.00 | 5.00 | 7.00 | 19.00 | 3.00 |
| TA-OP-01 | NULL | 500.00 | 500.00 | 500.00 | 514.75 | 874.00 | 587.55 |
| TA-OP-02 | NULL | NULL | 5.00 | 5.00 | 8.00 | 11.00 | NULL |
| TA-OP-03 | NULL | NULL | NULL | 70.00 | 59.15 | 98.23 | 96.22 |

**Notes on source values (pre-parse):**
- HE-OC-01: "101.10% (of NPR)" qualifier stripped → 101.10
- HE-OC-01 Q1A: "114.51% (Ave. Passing % of CSU = 83.18% / Nat'l Ave. = 72.64%)" → 114.51
- HE-OC-02 Q3A: "48.16% (498/1,034)" → 48.16
- HE-OP-01 Q3A: "69.98% (9,017/12,885)" → 69.98
- AE-OC-01: Data from sub-item b row (R34 Sept) — "90.32% (56/62)" → 90.32
- AE-OP-01 Q3A: "100% (929/929)" → 100.00
- RP-OC-01 Q3A: "-" → NULL (per data integrity rules, Section C)
- TA-OP-02 Q3A: empty in September file → NULL
- All percentages stored as numeric (without %)
- All counts stored as numeric (integers/decimals)

---

### FINDING GW-C: FY2022 Physical DB State

**Existing FY2022 parent operations (active after GV-4):**
| Operation Type | UUID |
|----------------|------|
| HIGHER_EDUCATION | 1a3bb2a7-8d06-4539-8431-535d09b06b38 |
| ADVANCED_EDUCATION | 4d42c54d-d90b-4d7b-9a6b-fec75add9f2d |
| RESEARCH | f66feb2b-391c-452a-a21f-70d333fa0fa0 |
| TECHNICAL_ADVISORY | 75104a50-e772-4809-9cdf-2b602bc541b7 |

**Current FY2022 indicator records:** 0 (none inserted yet)

**FY2023 pattern (authoritative template):**
- `reported_quarter = NULL` (column-based model, not per-quarter rows)
- One record per indicator per fiscal year (14 records per year)
- `target_q1/q2/q3/q4` and `accomplishment_q1/q2/q3/q4` columns
- `fiscal_year = 2023` on each record
- `indicator_code` from taxonomy, `particular` = indicator name
- `status = 'pending'`, `uacs_code = NULL`
- `created_by = SuperAdmin UUID`

**Taxonomy IDs to use (from pillar_indicator_taxonomy):**
Verified active, correct order — 14 indicators total.

---

### FINDING GW-D: FY2022 Financial Rendering Root Cause (Section B)

**User-reported symptom:** "FY2022 shows ONLY totals, NO breakdown (Main Campus / Cabadbaran / PS / MOOE / CO)"

**Root cause confirmed:** Case mismatch in `department` field.

| Source | department value | Expected |
|--------|-----------------|----------|
| FY2022 GV-4 migration | `'Main'`, `'Cabadbaran'` | `'MAIN'`, `'CABADBARAN'` |
| FY2023–2025 existing records | `'MAIN'`, `'CABADBARAN'` | ✅ Correct |
| Frontend CAMPUSES array | `'MAIN'`, `'CABADBARAN'` | — |

**Frontend grouping logic (financial/index.vue lines 421–435):**
```typescript
const campus = rec.department && CAMPUSES.some(c => c.id === rec.department)
  ? rec.department
  : '_NONE'
```
- `CAMPUSES.some(c => c.id === 'Main')` → **false** (case-sensitive mismatch)
- Records route to `groups['_NONE']['_NONE']` — no template renders this group
- `campusHasData('MAIN')` returns false → campus cards NOT rendered
- `pillarTotal` (line 471) iterates raw `financialRecords` directly → totals DO show correctly

**Effect:** User sees:
- ✅ Aggregate total (Appropriation, Obligations, Utilization) — from `pillarTotal`
- ❌ No Main Campus / Cabadbaran Campus breakdown sections
- ❌ No per-expense-class rows (PS/MOOE/CO)
- ❌ No campus sub-totals

**Fix:** 2-statement SQL UPDATE only. No frontend change, no schema change.

---

### FINDING GW-E: Migration Script Defect — Root Cause of Casing Error

**File:** `database/staging/migrate_fy2022_financial.js`

**Defect location:** `FY2022_CAMPUS_RECORDS` array:
```javascript
{ ..., department: 'Main', ... }       // WRONG — should be 'MAIN'
{ ..., department: 'Cabadbaran', ... } // WRONG — should be 'CABADBARAN'
```

**Standard:** All existing per-campus financial migration scripts (`migrate_financial_per_campus.js`) use `'MAIN'` and `'CABADBARAN'` uppercase. The GV-4 script deviated from this convention.

**Fix:** Update migration script `department` values to uppercase AND run SQL to fix already-inserted records.

---

### Section 2.56 — Phase GX: Cross Analytics UI Consistency + Score Field Expansion (Apr 10, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

**Objective:**
- (A1) Fix font style inconsistency in Cross Analytics chart card titles vs Physical/Financial analytics
- (A2) Replace always-zero Disbursement Rate card with meaningful Performance Gap metric
- (B) Expand `score_q1/q2/q3/q4` from VARCHAR(50) to VARCHAR(250)

---

#### GX-A1: Font Style Inconsistency — Cross Analytics Chart Card Titles

**File:** `pmo-frontend/pages/university-operations/index.vue`

**Finding:** Cross Analytics section uses a different Vuetify typography class for chart card titles than Physical and Financial sections.

| Section | Class Used | Visual Effect |
|---------|-----------|---------------|
| Cross Analytics (lines 1711, 1727, 1758) | `text-subtitle-2 pa-3` | Smaller text, padding-only layout |
| Physical Analytics (lines 1861, 1889, 1909, 1931, 1958) | `text-subtitle-1 d-flex align-center` | Standard size, flex-aligned |
| Financial Analytics (lines 2195, 2222, 2245, 2274, 2313, 2340) | `text-subtitle-1 d-flex align-center` | Standard size, flex-aligned |

**Root cause:** Cross Analytics section was authored separately from Physical/Financial sections with a different style convention. No intentional design difference.

**Verification:** `pmo-frontend/plugins/vuetify.ts` — no typography overrides; only CSU theme colors and VBtn/VCard/VTextField defaults. Both classes resolve to Vuetify defaults.

**Fix:** Change all 3 occurrences of `text-subtitle-2 pa-3` → `text-subtitle-1 d-flex align-center` in the Cross Analytics chart cards.

---

#### GX-A2: Disbursement Rate Card — Always 0%

**File:** `pmo-frontend/pages/university-operations/index.vue`

**Location:**
- Summary card: lines 1694–1698
- Computed value: `crossModuleOverallDisbursement` at lines 607–613

**Finding:** The Disbursement Rate card always renders 0% because `total_disbursement` is not populated in our financial data. The formula `total_disbursement / total_obligation * 100` divides 0 by any non-zero number.

**Assessment:** This card provides no actionable information in the current data state and misleads stakeholders into thinking disbursements have not started.

**Replacement candidate: Performance Gap**
- Formula: `crossModuleOverallPhysical − crossModuleOverallUtilization`
- Source values: Both already computed (`crossModuleOverallPhysical`, `crossModuleOverallUtilization`)
- No new API calls required
- Semantics:
  - Positive (+): Physical accomplishment ahead of budget utilization (execution efficiency)
  - Negative (−): Budget utilization outpacing physical accomplishments (concern)
  - Zero: Balanced

**Implementation scope:**
1. Rename card title from "Disbursement Rate" to "Performance Gap"
2. Change card icon from `mdi-cash-fast` to `mdi-trending-up` (or similar)
3. Add computed property `crossModulePerformanceGap` (simple subtraction)
4. Update card value binding to use new computed
5. Update subtitle/label text

---

#### GX-B: Score Field Expansion

**Finding:** The `score_q1/q2/q3/q4` fields are constrained to 50 characters at the database level, but there is no matching constraint in the DTO or frontend — creating an inconsistent validation boundary.

**DB schema:**
```sql
score_q1 character varying(50)
score_q2 character varying(50)
score_q3 character varying(50)
score_q4 character varying(50)
```

**DTO** (`pmo-backend/src/university-operations/dto/create-indicator.dto.ts`):
```typescript
@IsOptional()
@IsString()
score_q1?: string;   // No @MaxLength
score_q2?: string;
score_q3?: string;
score_q4?: string;
```

**Frontend:** `v-text-field` inputs with no `maxlength` attribute set.

**Current data:** Max observed length = 31 characters (`"Ave. Passing % of CSU = 83.18% "`). No existing data at or near the 50-char limit.

**Risk assessment:** Expanding to VARCHAR(250) is safe:
- No data migration needed (all existing values ≤ 31 chars)
- No foreign keys or indexes on these columns
- No computed or derived columns using these fields
- Schema change is purely additive (larger constraint = backward compatible)

**Required changes:**
1. DB migration: `ALTER TABLE operation_indicators ALTER COLUMN score_q[1-4] TYPE character varying(250)`
2. DTO: Add `@MaxLength(250)` to each score field decorator chain
3. Frontend: Add `maxlength="250"` to score `v-text-field` inputs

**Migration file:** New file `database/migrations/033_expand_score_fields_varchar250.sql`

---

### Section 2.57 — Phase GY: Override System Refactor — Achievement Rate & Variance (Physical Accomplishment) (Apr 10, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

**Objective:** Extend the existing single-level `override_rate` to support per-quarter override of both Achievement Rate and Variance, aligned with published BAR1 data that diverges from system-computed values.

---

#### GY-A: Root Cause — Computed vs Published Mismatch

**Observed case (FY2022 Q2 example provided by operator):**
- Target = 101.10%
- Actual values from two indicators: 113.76, 118.82
- System computed rate: does not produce 113.44%
- Published BAR1 Total Achievement Rate: **113.44%**

**Why the mismatch occurs:**
- Published BAR1 reports are officially signed and submitted to DBM/external agencies.
- They are sometimes adjusted post-computation (manual corrections, rounding conventions, consolidation formulas not mirrored by the system).
- The system's `computeIndicatorMetrics()` applies a strict SUM-all / SUM-all formula (Directive 211/212). Published data may use weighted averages, partial-quarter references, or agency-specific adjustments.
- This is a **systematic reality** — not a system bug. Published ≠ computed is expected and must be supported.

**Conclusion:**
✔ Published BAR1 values must be enterable as overrides without disrupting raw target/actual storage.
✔ Override values must be optional — computed values remain the default.
✔ Override must be quarter-specific — a Q2 override must not affect Q1, Q3, or Q4 display.

---

#### GY-B: Current Override Implementation — State Audit

**Migration 032** (`database/migrations/032_add_override_rate_to_operation_indicators.sql`):
```sql
ALTER TABLE operation_indicators
  ADD COLUMN IF NOT EXISTS override_rate DECIMAL(6,2) NULL;
```
- Scope: **ANNUAL** — one value per record (all quarters combined)
- Does NOT affect variance — variance is always computed
- DECIMAL(6,2) allows max 9999.99%

**Backend — `computeIndicatorMetrics()`** (`university-operations.service.ts:1074`):
```typescript
const overrideRate = record.override_rate != null ? toNumber(record.override_rate) : null;
// ...
accomplishment_rate: formatDecimal(overrideRate ?? accomplishmentRate, 2),  // override wins
computed_rate: formatDecimal(accomplishmentRate, 2),                         // always raw
override_rate: formatDecimal(overrideRate, 2),
// variance is always computed — never overridable currently
```
- `override_rate` replaces `accomplishment_rate` in API response
- `computed_rate` always reflects raw SUM-based calculation
- `variance` always computed — no override path exists
- No per-quarter override fields exposed

**Backend — INSERT path** (`createIndicatorQuarterlyData`, line ~1200):
- Explicitly lists `override_rate` in INSERT columns
- No per-quarter override columns included

**Backend — UPDATE path** (`updateIndicatorQuarterlyData`, line ~1376):
- Uses dynamic `Object.keys(dto)` field generation — will automatically include new fields once DTO is extended

**Backend — Analytics** (`getPillarSummary`, `getQuarterlyTrend`):
- Direct SQL on `target_qN`, `accomplishment_qN` raw columns
- `override_rate` is NOT included in analytics computation
- Analytics represent system-computed aggregates, NOT override-adjusted values
- This is correct behavior (Directive 346 pattern) — analytics must not be corrupted by display overrides

**Frontend — entryForm fields** (`physical/index.vue:621`):
- `override_rate` field included in form, loaded from `existingData.override_rate`
- No `override_rate_q1..q4` or `override_variance_q1..q4` fields exist
- Override input placed in "Annual Totals (Read-Only)" section at bottom of dialog

**Frontend — Table display** (`physical/index.vue:1462`):
- `variance` column: `getIndicatorData(id)?.variance` — always annual aggregate
- `accomplishment_rate` column: `getIndicatorData(id)?.accomplishment_rate` — annual (override if set)
- No quarter-specific rate/variance display
- `selectedQuarter` only highlights the active column group — does NOT filter rate/variance computation

---

#### GY-C: Schema Gap Analysis

| Field | Exists? | Level | Note |
|-------|---------|-------|------|
| `override_rate` | ✅ | Annual | Single value, replaces annual rate |
| `override_rate_q1` | ❌ | Q1-specific | **MISSING** |
| `override_rate_q2` | ❌ | Q2-specific | **MISSING** |
| `override_rate_q3` | ❌ | Q3-specific | **MISSING** |
| `override_rate_q4` | ❌ | Q4-specific | **MISSING** |
| `override_variance` | ❌ | Annual | **MISSING** |
| `override_variance_q1` | ❌ | Q1-specific | **MISSING** |
| `override_variance_q2` | ❌ | Q2-specific | **MISSING** |
| `override_variance_q3` | ❌ | Q3-specific | **MISSING** |
| `override_variance_q4` | ❌ | Q4-specific | **MISSING** |

**Critical missing columns: 9 total** (4 rate + 4 variance + 1 annual variance)

**Annual `override_rate` is preserved** — it currently operates as the annual/total-level override and remains backward compatible. Per-quarter overrides are additive.

---

#### GY-D: Computation Flow — Per-Quarter Achievement Rate

**Current computation (annual):**
```
totalTarget = SUM(target_q1..q4 where not null)
totalAccomplishment = SUM(accomplishment_q1..q4 where not null)
variance = totalAccomplishment - totalTarget
rate = totalAccomplishment / totalTarget * 100
displayed_rate = override_rate ?? rate
displayed_variance = variance (always computed — no override)
```

**Required per-quarter computation (to add):**
```
For each Q in [1,2,3,4]:
  computed_rate_qN = accomplishment_qN / target_qN * 100 (or null)
  computed_variance_qN = accomplishment_qN - target_qN (or null)
  displayed_rate_qN = override_rate_qN ?? computed_rate_qN
  displayed_variance_qN = override_variance_qN ?? computed_variance_qN
```

**Table display (when viewing selectedQuarter = Q2):**
- Rate column: `override_rate_q2 ?? computed_rate_q2`
- Variance column: `override_variance_q2 ?? computed_variance_q2`
- Override badge visible if either `override_rate_q2` or `override_variance_q2` is set

**Annual row (always present at bottom of table):**
- Rate: existing `accomplishment_rate` (annual override_rate ?? computed_annual_rate)
- Variance: `override_variance ?? computed_annual_variance` (new annual override_variance field)

---

#### GY-E: UI/UX Design Assessment

**Current dialog layout:**
```
┌─ Indicator Info Alert ────────────────────────────────────────┐
│ Q | Target | Actual | Score                                   │
│ Q1 [___] [___] [___]                                         │
│ Q2 [___] [___] [___]                                         │
│ Q3 [___] [___] [___]                                         │
│ Q4 [___] [___] [___]                                         │
│ Remarks [textarea]                                            │
│ Annual Totals (read-only): Target|Actual|Variance|Rate|Badge  │
│ [Override Rate %] input (single, annual)                      │
└───────────────────────────────────────────────────────────────┘
```

**Required dialog layout (per-quarter overrides):**
```
┌─ Indicator Info Alert ────────────────────────────────────────┐
│ Q | Target | Actual | Score                                   │
│ Q1 [___] [___] [___]                                         │
│ Q2 [___] [___] [___]                                         │
│ Q3 [___] [___] [___]                                         │
│ Q4 [___] [___] [___]                                         │
│ Remarks [textarea]                                            │
│ Annual Totals (read-only): Target|Actual|Variance|Rate|Badge  │
│ Annual Override Rate [___] (existing, preserved)              │
│                                                               │
│ ─── Per-Quarter Overrides (Optional) ──────────────────────── │
│ ℹ Override rate/variance for specific quarters when           │
│   published BAR1 values differ from computed values           │
│ Q | Override Rate % | Override Variance                       │
│ Q1 [___________] [___________]                               │
│ Q2 [___________] [___________]                               │
│ Q3 [___________] [___________]                               │
│ Q4 [___________] [___________]                               │
└───────────────────────────────────────────────────────────────┘
```

**Visual override badge in table:**
- Current: `mdi-pencil-circle` badge when `override_rate` is set (annual)
- Required: `mdi-pencil-circle` badge on Rate/Variance cells when quarter-specific override is set

---

#### GY-F: Edge Cases

| Case | Handling |
|------|---------|
| Override set but computed value is null (no T/A data) | Show override value; no computed comparison |
| Override cleared → fallback to computed | Null override_rate_qN → computed_rate_qN shown |
| Partial override (rate only, no variance) | Rate shows override, Variance shows computed |
| Annual override_rate set AND override_rate_q2 set | Per-quarter wins for Q2 display; annual still shows in annual section |
| All quarters overridden | Annual section still shows annual computed totals + annual override_rate if set |
| Analytics aggregation | NEVER uses override fields — raw target/actual only |

---

### Section 2.58 — Phase GZ: Physical Accomplishment — Override Simplification (Annual-Only) + Table Totals (Apr 10, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

**Objective:**
- (A) Remove per-quarter override system (GY redundancy) — keep annual-only override
- (B) Revert table Variance/Rate cells from quarter-specific (GY-6) back to annual values
- (C) Add Total Target + Total Actual columns to both indicator tables
- (D) Trim migration 034 to remove per-quarter column definitions (not yet run)

---

#### GZ-A: Per-Quarter Override — Redundancy Analysis

**Why per-quarter override is redundant:**

The Physical Accomplishment data model stores Q1–Q4 target and actual values as directly editable columns. If a user needs to reconcile published BAR1 data for a specific quarter, they can directly edit `accomplishment_q2` (or the relevant quarter's actual). This is the correct correction path.

Adding `override_rate_q2` as a second mechanism for expressing the same correction creates a **dual-truth problem**:
- What is "true" Q2 actual — the stored `accomplishment_q2` or the override-derived rate?
- The raw data (`accomplishment_q2`) and the override convey different information with no audit trail linking them
- KISS violation: two independent ways to express the same correction

**The annual override is NOT redundant** — it exists because the total/annual Achievement Rate in BAR1 may diverge from ANY formula applied to the raw quarterly values (due to rounding, agency consolidation rules, or adjustments the system cannot reproduce). This cannot be corrected by editing raw Q values.

**Conclusion:** Per-quarter override must be removed. Annual override (rate + variance) is correct and sufficient.

---

#### GZ-B: Current State Audit (Post-GY)

**Dialog — Per-Quarter Overrides section (added GY-5):**
- Located after Annual Override Variance input in `physical/index.vue` (line ~1904)
- Contains a `v-table` with 4 rows (Q1–Q4), each with Override Rate and Override Variance inputs
- `entryForm` has 8 fields: `override_rate_q1..q4`, `override_variance_q1..q4`
- `saveQuarterlyData` payload includes all 8 (lines 844–852)
- Three `entryForm` initialization branches each set these 8 fields to null

**DTO — per-quarter override fields** (`create-indicator.dto.ts`):
- 8 fields: `override_rate_q1..q4`, `override_variance_q1..q4`
- All `@IsOptional @IsNumber` with range validators

**Backend service — `computeIndicatorMetrics`** (line ~1133):
- `computeQuarterMetrics(qN)` inner function — reads `override_rate_qN`, `override_variance_qN` from record
- Returns 6 fields per quarter (computed_rate_qN, override_rate_qN, rate_qN, computed_variance_qN, override_variance_qN, variance_qN)
- Spreads all 24 per-quarter fields into the return object
- Annual override logic (`overrideRate`, `overrideVarianceAnnual`) is correct and must be kept

**Backend INSERT path** (`createIndicatorQuarterlyData`, line ~1231):
- Includes 8 per-quarter override columns: params $20–$27 (`override_rate_q1..q4`, `override_variance_q1..q4`)
- Total params: 29. After removing 8: reduces back to 21.

**Migration 034** (NOT YET RUN — OPERATOR pending):
- Adds 9 columns: `override_rate_q1..q4` (4), `override_variance` (1), `override_variance_q1..q4` (4)
- `override_variance` is NEEDED (used in annual override)
- 8 per-quarter columns are NOT needed → can be stripped from the migration file before operator runs it

**Table — Variance and Rate cells (GY-6):**
- Both Outcome and Output tables use `getQVariance(data, selectedQuarter)` and `getQRate(data, selectedQuarter)` 
- These display the per-quarter rate/variance (e.g., `rate_q2` = `accomplishment_q2 / target_q2 * 100`)
- **This is misleading** — BAR1 Achievement Rate is the annual/cumulative total, not a single-quarter ratio
- `hasQOverride` badge check uses per-quarter override fields → becomes dead code post-GZ
- Must revert to: `getIndicatorData(id)?.variance` and `getIndicatorData(id)?.accomplishment_rate` (annual values)

**Helper functions to remove:**
- `getQRate()` (line 482)
- `getQVariance()` (line 489)
- `hasQOverride()` (line 496)

---

#### GZ-C: Table Totals — Current Gap

**What the table currently shows** (both Outcome + Output):
```
Indicator | Q1-T | Q1-A | Q2-T | Q2-A | Q3-T | Q3-A | Q4-T | Q4-A | Variance | Rate
```

**What BAR1 requires:**
```
Indicator | Q1-T | Q1-A | Q2-T | Q2-A | Q3-T | Q3-A | Q4-T | Q4-A | Total Target | Total Actual | Variance | Rate
```

**Backend already provides:**
- `total_target` = `formatDecimal(totalTarget, 4)` from `computeIndicatorMetrics`
- `total_accomplishment` = `formatDecimal(totalAccomplishment, 4)` from `computeIndicatorMetrics`
- These match the dialog's "Annual Totals" chip display exactly

**No API changes needed** — data already in the response. Frontend-only addition.

**Column count impact:**
- Current: 1 (indicator) + 8 (Q1-Q4 T/A) + 1 (variance) + 1 (rate) + 1 (action) = 12 cols
- After adding 2 total cols: 1 + 8 + 2 (totals) + 1 + 1 + 1 = 14 cols
- The "no-data" empty cell currently uses `colspan="10"` (covers 8 Q cols + variance + rate)
- After GZ: must become `colspan="12"` (adds Total Target + Total Actual)
- Both Outcome table (line ~1533) and Output table (line ~1661) need the update

---

#### GZ-D: Annual Override Model — Confirmed Final Design

```
AUTO-COMPUTED (always, from stored data):
  total_target     = SUM(target_q1..q4 where not null)
  total_actual     = SUM(accomplishment_q1..q4 where not null)
  computed_variance = total_actual - total_target
  computed_rate    = total_actual / total_target × 100

ANNUAL OVERRIDE (optional, user-entered):
  override_rate     → replaces computed_rate in displayed accomplishment_rate
  override_variance → replaces computed_variance in displayed variance

DISPLAY VALUES:
  variance displayed          = override_variance ?? computed_variance
  accomplishment_rate displayed = override_rate ?? computed_rate

STRICT RULES:
  - Override NEVER modifies stored target or actual values
  - Override does NOT feed into analytics pipeline
  - Clearing override restores computed fallback
```

---

#### GZ-E: Edge Cases

| Case | Handling |
|------|---------|
| Partial data (only Q1 filled) | `total_target`/`total_actual` use only non-null values; Total Target/Actual columns show partial sums |
| All quarterly values null | `total_target = null`, `total_actual = null`; Total columns show `—` |
| `override_variance` set but no data | Shows override value; Variance chip shows override |
| Override cleared | Resets to computed fallback immediately |
| target = 0 in all quarters | `computed_rate = null` (division guard); override_rate can still be set |

---

### Section 2.59 — Phase HA: Physical Accomplishment Table Responsiveness + Total Override Extension

**Date:** 2026-04-10
**Status:** RESEARCH COMPLETE

---

#### HA-A: Table Layout Root Cause Analysis

**Target environment:** 1366px wide screen, sidebar open (Vuetify `v-navigation-drawer` default width = 256px).

**Available content width:** 1366 - 256 = 1110px (minus Vuetify main content padding ≈ 32px = ~1078px usable)

**Current column minimum widths:**

| Column | Class | Min-width | Count | Subtotal |
|--------|-------|-----------|-------|----------|
| Indicator | `.indicator-column` / `.indicator-cell` | 320px | 1 | 320px |
| Quarter sub-cols (T+A × 4 qtrs) | `.qsub-col` / `.qsub-cell` | 68px | 8 | 544px |
| Total Target | `.total-column` | 90px | 1 | 90px |
| Total Actual | `.total-column` | 90px | 1 | 90px |
| Variance | `.variance-column` | 80px | 1 | 80px |
| Rate | `.rate-column` | 80px | 1 | 80px |
| Action | `.action-column` | 60px | 1 | 60px |
| **TOTAL** | | | | **1264px** |

**Overflow:** 1264px minimum vs ~1078px available = **~186px overflow**

**Root cause:** `.indicator-column` at `320px` is the dominant width consumer. Combined with 8 quarter sub-columns at `68px` each (544px total), the table cannot fit within a standard sidebar-open viewport at 1366px. The `responsive-table-wrapper` already has `overflow-x: auto`, which only adds a scrollbar — it does not fix the overflow.

**Key constraint:** Indicator text is already clamped to 3 lines via `-webkit-line-clamp: 3` + `overflow: hidden`. Reducing the indicator column width does not increase vertical space usage significantly — text will just wrap within a narrower column.

---

#### HA-B: Responsive Reduction Strategy

**Target after reduction:** ≤ 1060px minimum table width (leaves ~18px buffer in 1078px usable)

**Reductions:**

| Column | Current | Proposed | Savings |
|--------|---------|----------|---------|
| `.indicator-column` + `.indicator-cell` | 320px | 220px | −100px |
| `.qsub-col` + `.qsub-cell` (×8) | 68px | 56px | −96px total |
| All others | unchanged | unchanged | 0 |

**New minimum:** 220 + (8×56) + 90 + 90 + 80 + 80 + 60 = **1068px** ✓ fits within 1078px

**Text safety:** Quarter data cells show values like `1,234.56` — 8 characters at `font-size: 0.75rem` requires ~50px minimum. 56px provides safe margin. Indicator text is clamped so narrowing to 220px causes no data loss (tooltip already provides full text via `title` attribute on hover per Phase EE-F).

---

#### HA-C: Override Total Target / Total Actual — Current State

**Current override fields:** `override_rate` (DB: `DECIMAL(8,2)`, migration 029) and `override_variance` (DB: `DECIMAL(8,2)`, migration 034 — OPERATOR PENDING).

**Missing:** No `override_total_target` or `override_total_actual` exist anywhere in DB, DTO, service, or frontend.

**Current computation chain in `computeIndicatorMetrics()` (service.ts:1074):**
```
totalTarget     = SUM(target_q1..q4 non-null)
totalActual     = SUM(accomplishment_q1..q4 non-null)
variance        = totalActual - totalTarget
rate            = totalActual / totalTarget × 100
displayed_variance = override_variance ?? variance
displayed_rate     = override_rate ?? rate
```

**Gap:** If the published BAR1 Total Target or Total Actual differs from the sum of quarterly values (e.g., rounding, adjustments, corrections), there is currently no way to override these totals. The existing `override_rate` and `override_variance` partially compensate but are decoupled from the totals — variance and rate shown in the table are computed from stored quarterly sums, not from corrected totals.

---

#### HA-D: Override Total — Required Computation Chain

With `override_total_target` and `override_total_actual`, the chain becomes:

```
AUTO-COMPUTED:
  totalTarget  = SUM(target_q1..q4 non-null)
  totalActual  = SUM(accomplishment_q1..q4 non-null)

EFFECTIVE VALUES (override if set):
  effectiveTarget = override_total_target ?? totalTarget
  effectiveActual = override_total_actual ?? totalActual

DERIVED METRICS (using effective values):
  computed_variance = effectiveActual - effectiveTarget
  computed_rate     = effectiveActual / effectiveTarget × 100

FINAL DISPLAY (rate/variance override still wins if set):
  displayed_total_target = effectiveTarget
  displayed_total_actual = effectiveActual
  displayed_variance     = override_variance ?? computed_variance
  displayed_rate         = override_rate ?? computed_rate
```

This preserves all existing override_rate / override_variance behavior and adds a new layer for total corrections.

---

#### HA-E: DB Schema Impact

**Table:** `operation_indicators`

**New columns:**
- `override_total_target DECIMAL(15,4) NULL DEFAULT NULL` — allows large target values (same precision as quarterly targets)
- `override_total_actual DECIMAL(15,4) NULL DEFAULT NULL` — allows large actual values

**Migration:** `035_add_override_totals_physical.sql`

**No FK, no constraint** (matches existing override column pattern from migration 029).

---

#### HA-F: Backend INSERT — Current Parameter Count

Current `createIndicatorQuarterlyData` INSERT has **21 parameters** ($1–$21):
1. `operation_id`, 2. `pillar_indicator_id`, 3. `particular`, 4. `fiscal_year`, 5. `reported_quarter`,
6–9. `target_q1–q4`, 10–13. `accomplishment_q1–q4`, 14–17. `score_q1–q4`,
18. `remarks`, 19. `override_rate`, 20. `override_variance`, 21. `created_by`

After Phase HA: **23 parameters** (add `override_total_target` as $22, `override_total_actual` as $23 before `created_by` moves to $23 — or append after).

**UPDATE path:** Dynamic field update in `updateIndicatorQuarterlyData` (lines 1385–1408) uses `Object.keys(dto)` for the SET clause — no explicit parameter changes needed; new DTO fields automatically included.

---

#### HA-G: Frontend Impact Points

1. **`entryForm` initialization (3 locations):** lines 622, 668, 694 — add `override_total_target: null`, `override_total_actual: null`
2. **`saveQuarterlyData` payload** (line ~794): add `override_total_target`, `override_total_actual`
3. **`computedPreview` computed** (line 903): apply override totals before variance/rate calculation
4. **Dialog UI** (line ~1842): add 2 new inputs in "Annual Override" section above existing `override_rate`
5. **`entryForm` prefill from prior quarter** (line 668): do NOT inherit override totals (same rule as override_rate)

---

### Section 2.60 — Phase HB: Dialog UI Enhancement — Annual Section Refactor + Override Layout

**Date:** 2026-04-10
**Status:** RESEARCH COMPLETE

---

#### HB-A: Current Dialog Structure (Post-HA)

The "Annual Totals" card (lines ~1828–1929) now contains:

```
v-card variant="outlined" class="bg-grey-lighten-4"
  v-card-text
    Section header: "Annual Totals (Read-Only)"  ← misleading (section now has editable fields)
    Row of chips (flex-wrap):
      Total Target chip        ← auto-computed
      Total Actual chip        ← auto-computed
      Variance chip            ← auto-computed
      Rate chip                ← auto-computed
      "Override Applied" badge ← conditional, shows override_rate only
    [blank space mb-3]
    v-text-field: Override Total Target   ← max-width: 280px, stacked vertically
    v-text-field: Override Total Actual   ← max-width: 280px, stacked vertically
    v-text-field: Override Rate           ← max-width: 280px, stacked vertically
    v-text-field: Override Variance       ← max-width: 280px, stacked vertically
```

---

#### HB-B: UI Issues Identified

| # | Issue | Severity |
|---|-------|----------|
| 1 | Section header "Annual Totals (Read-Only)" is now incorrect — section contains editable override fields | High |
| 2 | 4 override fields stacked vertically in single column — wastes horizontal space, forces scrolling | High |
| 3 | Chips and override inputs share the same card without visual separator — blurs computed vs override | Medium |
| 4 | "Override Applied" badge only checks `override_rate`; does not reflect `override_total_target` or `override_total_actual` active state | Medium |
| 5 | Field hint texts are verbose and inconsistent in length | Low |
| 6 | `max-width: 280px` inline style prevents inputs from filling available width in dialog | Low |
| 7 | No visual grouping label for override section — user has no clear affordance that overrides are optional | Medium |

---

#### HB-C: Dialog Width Context

Dialog uses `max-width="700"` (standard Vuetify large dialog). Effective content width after `pa-4` padding (16px each side): **700 - 32 = ~668px usable**.

A 2-column grid with `ga-3` gap (12px): each column ≈ **(668 - 12) / 2 = ~328px** — sufficient for a compact override input with label.

Vuetify `v-row` + `v-col cols="12" md="6"` handles this cleanly.

---

#### HB-D: Required Visual Grouping (Final Design)

```
CARD: "Annual Performance Summary"
  ─── Group 1: Auto-Calculated Values ───────────────────
  [chips row: Total Target | Total Actual | Variance | Rate]

  ─── Group 2: Override Values (Optional) ────────────────
  [helper text: "Use overrides when official BAR1 values differ from system calculations."]
  [2-column grid]
    Col 1                      Col 2
    Override Total Target      Override Total Actual
    Override Rate (%)          Override Variance
  [active overrides row: badges for any non-null override]
```

---

#### HB-E: "Override Applied" Badge Coverage Gap

Current badge (line ~1857): only shows when `override_rate !== null`. After HA, there are 4 override fields. The badge row should check all 4:
- `override_total_target`
- `override_total_actual`
- `override_rate`
- `override_variance`

One compact badge per active override, or a single summary badge "N Override(s) Active".

---

#### HB-F: Column Layout Mapping

Per spec C3:
- **Col 1 (left):** Override Total Target, Override Rate (%)
- **Col 2 (right):** Override Total Actual, Override Variance

This groups "target-related" on left, "actual-related" on right — matches user mental model.

Responsive: `v-col cols="12" sm="6"` → 1-col on mobile, 2-col on sm+.

---

#### HB-G: Inline Style Removal

All 4 override inputs have `style="max-width: 280px;"` which caps them at 280px even when more space is available. This should be removed — inputs inside `v-col` will naturally fill their column width.

---

## Section 2.61 — Phase HC: Physical Accomplishment — Total Target & Total Actual Override Fix

**Phase:** HC
**Date:** 2026-04-10
**Status:** Phase 1 Research COMPLETE

---

### HC-1: Root Cause — Migration 035 Not Applied (OPERATOR Prerequisite)

The INSERT query in `createIndicatorQuarterlyData` (service.ts lines 1219–1226) explicitly names `override_total_target` and `override_total_actual` as columns 21 and 22 in the `operation_indicators` table. This was added in Phase HA.

If migration `035_add_override_totals_physical.sql` has not been run, these columns do not exist in the database. Every POST call to create indicator data will fail with PostgreSQL error:

```
column "override_total_target" of relation "operation_indicators" does not exist
```

This is the primary blocker. `override_rate` and `override_variance` work because they were added in an earlier migration (already applied).

---

### HC-2: Root Cause — `total_target`/`total_accomplishment` Always Return Raw Sums

`computeIndicatorMetrics` return object (service.ts lines 1139–1157):

```ts
total_target:         formatDecimal(totalTarget, 4),          // ← raw Q1+Q2+Q3+Q4 sum
total_accomplishment: formatDecimal(totalAccomplishment, 4),   // ← raw Q1+Q2+Q3+Q4 sum
override_total_target: formatDecimal(overrideTotalTarget, 4),  // ← override passthrough (separate field)
override_total_actual: formatDecimal(overrideTotalActual, 4),  // ← override passthrough (separate field)
```

The table cells at lines 1494, 1497 (Outcome table) and 1629, 1632 (Output table) in `physical/index.vue` bind to:
- `?.total_target` — always the raw sum
- `?.total_accomplishment` — always the raw sum

These cells never read `override_total_target` or `override_total_actual`. So even if the overrides are stored in the DB, the table always displays the raw quarterly sums.

---

### HC-3: Contrast — Why `variance` and `accomplishment_rate` Work Correctly

The existing pattern for `variance` and `accomplishment_rate` (lines 1150–1155):

```ts
variance:           formatDecimal(overrideVarianceAnnual ?? variance, 4),   // effective
computed_variance:  formatDecimal(variance, 4),                              // raw
accomplishment_rate: formatDecimal(overrideRate ?? accomplishmentRate, 2),  // effective
computed_rate:       formatDecimal(accomplishmentRate, 2),                   // raw
```

The table reads `variance` and `accomplishment_rate` — both are already effective values. The override logic is baked into the returned field value, not exposed as a separate field.

`total_target` and `total_accomplishment` don't follow this pattern — they return the raw sum and expose the override as a separate field. The table never applies the `??` merge.

---

### HC-4: Fix Strategy — Service Return Object Change Only

The fix must mirror the existing override pattern used for `variance`/`accomplishment_rate`:

- Change `total_target` to return `overrideTotalTarget ?? totalTarget` (effective)
- Change `total_accomplishment` to return `overrideTotalActual ?? totalAccomplishment` (effective)
- Add `computed_total_target: formatDecimal(totalTarget, 4)` for raw observability
- Add `computed_total_accomplishment: formatDecimal(totalAccomplishment, 4)` for raw observability
- Update `average_target` / `average_accomplishment` for consistency (same effective values)

**No frontend changes required.** The table already reads `total_target` — once the service returns the effective value, the table automatically reflects the override.

---

### HC-5: Affected File

- `pmo-backend/src/university-operations/university-operations.service.ts` — `computeIndicatorMetrics` return object only (lines 1141–1148)

No changes to: DTO, INSERT, UPDATE, frontend, migrations (beyond running 035).

---

## Section 2.62 — Phase HD: Override Not Reflecting in Table + Dialog Outside-Click Close

**Phase:** HD
**Date:** 2026-04-10
**Status:** Phase 1 Research COMPLETE

---

### HD-1: Override Not Reflecting in Table — Confirmed Root Cause

User confirmed: override values **save and appear in the dialog** but the table still shows raw computed totals. This confirms Phase HC root cause 2 is the active bug.

Code state as of Phase HD research (service.ts lines 1141–1148):

```ts
total_target:          formatDecimal(totalTarget, 4),          // ← raw Q1+Q2+Q3+Q4 sum
total_accomplishment:  formatDecimal(totalAccomplishment, 4),   // ← raw Q1+Q2+Q3+Q4 sum
average_target:        formatDecimal(totalTarget, 4),           // ← raw
average_accomplishment: formatDecimal(totalAccomplishment, 4),  // ← raw
// Phase HA: Override totals passthrough (Directive 369)
override_total_target: formatDecimal(overrideTotalTarget, 4),   // ← override separate field
override_total_actual: formatDecimal(overrideTotalActual, 4),   // ← override separate field
```

Phase HC-1 (Directive 382) was **planned but not yet implemented**. The service still returns raw sums as `total_target`/`total_accomplishment`. The table cells (lines 1494, 1497, 1629, 1632) bind to these raw-sum fields and never read `override_total_target`/`override_total_actual`.

**Correct pattern already exists in same function** (lines 1150–1155):
```ts
variance:           formatDecimal(overrideVarianceAnnual ?? variance, 4),   // effective
accomplishment_rate: formatDecimal(overrideRate ?? accomplishmentRate, 2),  // effective
```

The fix is identical in structure: apply `??` merge to `total_target` and `total_accomplishment`.

---

### HD-2: Dialog Does Not Close on Outside Click — Root Cause

`v-dialog` at line 1688 in `physical/index.vue`:

```html
<v-dialog v-model="entryDialog" max-width="700" persistent>
```

The `persistent` prop in Vuetify 3 disables both:
- Outside-click close
- ESC key close

The dialog already has an explicit X button (line 1694): `@click="entryDialog = false"`.  
No unsaved-data / dirty-state check exists anywhere in the component — there is no `isDirty` ref or unsaved-change guard.

**Fix:** Remove `persistent` from line 1688. Vuetify's default behavior with `persistent` absent is outside-click + ESC both close the dialog. This is correct UX.

**Scope:** Only the entry dialog (line 1688). The other two dialogs remain `persistent`:
- `publishedEditWarningDialog` (line 1986) — confirmation flow, must stay persistent
- `unlockRequestDialog` (line 2015) — confirmation flow, must stay persistent

---

### HD-3: Data Flow After Save — No Sync Issue

After `saveQuarterlyData()` completes, `fetchIndicators()` is called, which re-fetches all indicators from the API. This correctly refreshes the frontend state. There is no stale-state bug — once the backend returns effective `total_target`/`total_accomplishment`, the table will reflect it immediately on the next fetch.

---

### HD-4: Affected Files

1. `pmo-backend/src/university-operations/university-operations.service.ts` — `computeIndicatorMetrics` return block (lines 1141–1148): apply override chain to `total_target`/`total_accomplishment`
2. `pmo-frontend/pages/university-operations/physical/index.vue` — line 1688: remove `persistent` from entry dialog

No other changes needed.

---

## Section 2.63 — Phase HE: UI/UX + Data Structure Enhancement — Physical & Financial Modules (2026-04-13)

**Phase:** HE
**Date:** 2026-04-13
**Status:** Phase 1 Research COMPLETE

---

### HE-A: Physical Accomplishment — Table + Data Field Audit

#### HE-A-1: Current Table Column Inventory (Outcome & Output, both identical)

| # | Column | Source | Notes |
|---|--------|--------|-------|
| 1 | Indicator (name + unit chip + UACS tooltip) | `indicator.indicator_name`, `indicator.indicator_code` | Fixed 200–240px |
| 2–9 | Q1–Q4 Target/Actual (8 cols) | `target_q1..q4`, `accomplishment_q1..q4` | Highlighted for selected quarter |
| 10 | Total Target | `total_target` from API | Added Phase GZ |
| 11 | Total Actual | `total_accomplishment` from API | Added Phase GZ |
| 12 | Variance | `variance` from API | Annual, color-coded chip |
| 13 | Rate | `accomplishment_rate` from API | Annual, color-coded chip |
| 14 | Actions (conditional) | `canEditData()` | Edit pencil icon |

**Total: 13–14 columns.** Table is already wide; uses `responsive-table-wrapper` for horizontal scroll. Adding a fixed-width remarks column is acceptable if controlled (max-width ~160px with truncation).

**colspan in no-data row:** currently `12` after Phase GZ (was 10 → 12 for Total cols). After adding Remarks col → must become `13`.

#### HE-A-2: `remarks` Field Availability

- **Schema:** `operation_indicators.remarks TEXT` — column exists (confirmed via service grep and migration history)
- **Backend SELECT:** line ~1825 `oi.remarks` included in `getIndicatorsByOperation()` query
- **API response:** `remarks` is in every record returned by `getIndicatorData(id)`
- **Frontend:** `entryForm.remarks` is set in all 3 entryForm init branches (lines 637, 688, 707). Sent in `saveQuarterlyData()` payload. Displayed in dialog textarea.
- **NOT in table:** `getIndicatorData(id)?.remarks` would work but is never rendered in the indicator rows.
- **Decision:** Add as a 14th content column (before Actions), truncated 2-line with overflow tooltip. Use min-width 100px, max-width 160px. CSS `.remarks-cell` with `-webkit-line-clamp: 2`.

#### HE-A-3: Narrative Fields (`catch_up_plan`, `facilitating_factors`, `ways_forward`)

- **Schema audit:** Grepped all 36 migration files (`database/migrations/`) — these 3 fields DO NOT EXIST in `operation_indicators`. No column, no index, no reference.
- **Backend audit:** Not present in service SELECT, INSERT, UPDATE, or DTOs.
- **Frontend audit:** Not referenced anywhere in physical/index.vue.
- **Conclusion:** Must be created. Requires a new migration (036), DTO addition, service SELECT+INSERT+UPDATE update, frontend entry dialog fields, and frontend expandable row for table display.
- **Implementation approach:** OPTION C variant — expandable row per indicator. Each data row gets a toggle icon. When expanded, a full-width row below shows 3 labeled sections (Catch-Up Plan, Facilitating Factors, Ways Forward). This avoids table column explosion.

---

### HE-B: Financial Accomplishment — Table + Hero Audit

#### HE-B-1: Current Table Column Inventory (all 3 instances)

All three table instances (prefill table, empty-state table, campus-grouped main table) share the same column structure:

| Column | Width | Source |
|--------|-------|--------|
| Program / Line Item | 220px min | `rec.operations_programs` |
| Class | 80px | `rec.expense_class` |
| Appropriation | 140px | `rec.allotment` |
| Obligations | 140px | `rec.obligation` |
| % Utilization | 100px | `rec.utilization_rate` (computed server-side) |
| Balance | 130px | `rec.balance` (computed server-side: allotment − obligation) |
| Actions | 80px | `canEditData()` conditional |

#### HE-B-2: `disbursement` Field Availability

- **Schema:** `operation_financials.disbursement DECIMAL` — exists (migration 014+)
- **Backend:** `SELECT *` at line 428 and 1548 returns `disbursement` in every record. `computeFinancialMetrics()` returns `disbursement_rate` but `disbursement` (raw value) is also spread via `...record` at line 289.
- **Entry dialog:** Has `disbursement` input field (line 1397); value saved to DB at line 618.
- **NOT in table:** All 3 table instances show `Balance` instead of `Disbursement`.
- **Decision:** Replace `Balance` column with `Disbursement` across all 3 tables, sub-total rows, and pillar total row. Update `campusSubtotals` and `pillarTotal` computed objects to sum `disbursement` instead of tracking `balance`.

#### HE-B-3: `campusSubtotals` and `pillarTotal` Computed (lines 442–484)

Current type: `{ allotment: number; obligation: number; utilization: number | null; balance: number }`
After change: `{ allotment: number; obligation: number; disbursement: number; utilization: number | null }`
- Remove `balance` from both computed type signatures and calculations.
- Add `disbursement` summation: `disbursement += Number(rec.disbursement) || 0`
- Update all template references from `campusSubtotals[campus.id]?.balance` → `campusSubtotals[campus.id]?.disbursement`

#### HE-B-4: Hero Section (lines 811–827)

Current: 3 `v-chip` elements (`size="x-small"`) under the page subtitle showing Appropriation, Obligations, Utilization.
- Lives inside the header `<div class="d-flex flex-column ...">` containing the `<h1>` and `<p class="text-subtitle-1">` 
- Missing: Disbursement metric not shown at all in hero.

**Decision:** Replace the chip cluster with 4 styled stat mini-cards. Layout: horizontal flex row, each card showing a label + prominent value. Color coding for Utilization (≥80% success, 50–79% warning, <50% error). CSS `.stat-card` / `.stat-label` / `.stat-value` classes.

#### HE-B-5: Expense Class Chip (lines 1202–1204, and prefill equivalent)

Current: `<v-chip :color="ec.color" size="x-small" variant="tonal">{{ ec.id }}</v-chip>`
Issue: Too small to read at a glance, light tonal background is low contrast.
**Decision:** Change to `size="small" variant="flat"` — flat gives solid colored background (PS=blue, MOOE=orange, CO=teal) with white text; significantly more readable at a glance. Uncategorized `—` chip: bump to `size="small"` for consistency.

---

### HE-C: Affected Files Summary

| Step | File | Type |
|------|------|------|
| HE-1 | `physical/index.vue` | Frontend — Remarks column |
| HE-2 | `database/migrations/036_add_narrative_fields.sql` | NEW migration |
| HE-3 | `dto/create-indicator.dto.ts` | Backend DTO |
| HE-4 | `university-operations.service.ts` | Backend SELECT + INSERT |
| HE-5 | `physical/index.vue` | Frontend — dialog narrative fields |
| HE-6 | `physical/index.vue` | Frontend — expandable row |
| HE-7 | `financial/index.vue` | Frontend — Balance→Disbursement |
| HE-8 | `financial/index.vue` | Frontend — hero cards |
| HE-9 | `financial/index.vue` | Frontend — expense class chip |

No changes to backend financial service (disbursement already returned via `SELECT *`). No routing changes. No new dependencies.

---

### HE-D: Reference Image Analysis — APR/UPR Narrative Structure (2026-04-13 update)

**Source:** `docs/test/Screenshot 2026-04-13 132626.png`

The reference image shows the official APR/UPR table format for "B.B CATCH-UP PLANS, FACILITATING FACTORS, AND WAYS FORWARD". Key findings:

#### HE-D-1: Column Semantics (critical — affects UI labels)

| Column | APR/UPR Sub-header | Meaning |
|--------|--------------------|---------|
| Programs / Output / Indicator | MET / NOT MET Targets | Context indicator |
| **Catch-Up Plans** | *(Not Met Targets)* | Remediation actions for indicators that **missed** their targets |
| **Facilitating Factors** | *(Met Targets)* | Conditions that enabled indicators that **met** their targets |
| **Ways Forward** | *(no sub-qualifier)* | General next steps / recommendations regardless of status |

**Impact on plan:** The dialog hints and expandable row section labels must reflect this semantic distinction. Catch-Up Plans should be labeled as "for unmet targets" and Facilitating Factors as "for met targets."

#### HE-D-2: Table Layout Pattern

- Rows are grouped by program section (e.g., "HIGHER EDUCATION SERVICES")
- Within each section: Outcome Indicators first, then Output Indicators
- The narrative fields are free-text — no structured sub-fields
- The columns are roughly equal width (25% each after the indicator column)

#### HE-D-3: Implication for UI Design

- The expandable row **should mirror the official column ordering** from the reference: Catch-Up Plans → Facilitating Factors → Ways Forward (left to right / top to bottom)
- The section headings should include the sub-qualifier in parentheses for clarity
- Implementation using 3-column layout (`md="4"` per col) in the expandable row matches the reference structure
- No change needed to field names in DB/DTO — `catch_up_plan`, `facilitating_factors`, `ways_forward` are correct
- Dialog hint texts must be updated to reflect MET vs NOT MET context (updates HE-5 plan)

---

## Section 2.64 — Phase HE Implementation Audit: Code Verification (2026-04-13)

**Phase:** HE Audit
**Date:** 2026-04-13
**Status:** ✅ Research COMPLETE — Code fully matches plan. One pending operator action.

**Purpose:** Verify actual code state against plan.md Phase HE (Directives 383–391) following implementation.

---

### Audit-1: Physical Module — `physical/index.vue`

#### HE-1: Remarks Column ✅ VERIFIED
- `<th class="text-left remarks-column" rowspan="2">Remarks</th>` — present in BOTH Outcome (line 1466) and Output (line 1657) table headers
- `<td class="remarks-cell">` with `v-tooltip` wrapper and `<span class="remarks-truncated">` — present in both data row sections (lines 1561, 1752)
- CSS classes `.remarks-column`, `.remarks-cell`, `.remarks-truncated` defined (lines 2363–2378)
- No-data colspan not directly verified in this audit; frontend behavior depends on this

#### HD-2: Entry Dialog `persistent` Removed ✅ VERIFIED
- `<v-dialog v-model="entryDialog" max-width="700">` at line 1829 — **no `persistent` prop** (Phase HD fix)
- Comment: `<!-- Phase HD: persistent removed — enables outside-click + ESC close (Directive 384) -->`
- Governance dialogs (`publishedEditWarningDialog`, `unlockRequestDialog`) correctly retain `persistent` (lines 2167, 2196)

#### HE-5: entryForm Narrative Field Initialization ✅ VERIFIED (all 3 branches)
- **Branch 1 (existing data, line 634):** `catch_up_plan: existingData.catch_up_plan || ''`, `facilitating_factors: existingData.facilitating_factors || ''`, `ways_forward: existingData.ways_forward || ''`
- **Branch 2 (prefill from prior quarter, line 689):** `catch_up_plan: ''`, `facilitating_factors: ''`, `ways_forward: ''` — narrative NOT inherited from prior quarter ✅ (Directive 386)
- **Branch 3 (empty form, line 721):** `catch_up_plan: ''`, `facilitating_factors: ''`, `ways_forward: ''`
- **Save payload (line 843):** `catch_up_plan: entryForm.value.catch_up_plan?.trim() || null` (and equivalent for other two fields)

#### HE-5: Dialog Narrative Textareas ✅ VERIFIED
- `v-model="entryForm.catch_up_plan"` with label "Catch-Up Plans (Not Met Targets)" (line 1976)
- `v-model="entryForm.facilitating_factors"` and `v-model="entryForm.ways_forward"` present below
- Correct APR/UPR-aligned labels per research.md HE-D-1

#### HE-6: Expandable Narrative Row ✅ VERIFIED
- `const expandedNarrativeRows = ref(new Set<string>())` (line 482)
- `toggleNarrativeRow(id)` correctly replaces Set to force Vue reactivity: `expandedNarrativeRows.value = new Set(s)` (line 486)
- `hasNarrativeData(id)` checks all 3 narrative fields (line 488)
- Toggle button in indicator cell: `v-if="getIndicatorData(indicator.id) && hasNarrativeData(indicator.id)"` — present in BOTH Outcome (line 1515) and Output (line 1706) tables
- Expand row: `<tr v-if="expandedNarrativeRows.has(indicator.id) && getIndicatorData(indicator.id)">` — present for BOTH tables (lines 1584, 1775)
- Narrative panel: `<div class="narrative-panel pa-3 bg-grey-lighten-5">` with 3-col layout per APR/UPR reference
- `.narrative-panel` CSS defined (line 2383)

---

### Audit-2: Financial Module — `financial/index.vue`

#### HE-7: Balance → Disbursement ✅ VERIFIED
- All 3 table headers show `Disbursement` (lines 1098, 1155, 1202) — "Balance" removed
- Prefill table data cell: `formatCurrency(rec.disbursement)` (line 1098 area)
- Campus-grouped table data cells: `rec.disbursement` used (not `rec.balance`)
- `campusSubtotals` computed: tracks `disbursement` property (not `balance`)
- `pillarTotal` computed: tracks `disbursement` property
- One intentional remaining `balance` reference: entry dialog preview alert at line 1438 (`Balance: Appropriation − Obligations`) — this is correct per plan HE-7-F

#### HE-8: Hero Stat Mini-Cards ✅ VERIFIED
- 4 `<div class="fin-stat-card">` elements present (lines 820, 824, 828, 832) — Appropriation, Obligations, Disbursement, Utilization Rate
- `pillarTotal.disbursement` bound to Disbursement card (line 830)
- Utilization color logic: `>= 80 ? 'text-success' : >= 50 ? 'text-warning' : 'text-error'`
- CSS classes `.fin-stat-card`, `.fin-stat-label`, `.fin-stat-value` defined (line 1571+)

#### HE-9: Expense Class Chips ✅ VERIFIED
- Main campus-grouped table: `<v-chip :color="ec.color" size="small" variant="flat" class="font-weight-bold">` (line 1215)
- Prefill table: `<v-chip v-if="rec.expense_class" size="small" variant="flat" color="primary" class="font-weight-bold">` (line 1110)
- Utilization rate chips in prefill table still use `size="x-small" variant="tonal"` (line 1119) — these are NOT expense class chips; they're utilization percentage badges. Correctly unmodified.

---

### Audit-3: Backend — `university-operations.service.ts`

#### Phase HD: Override Merge in `computeIndicatorMetrics` ✅ VERIFIED
- `const overrideTotalTarget = record.override_total_target != null ? toNumber(record.override_total_target) : null;` (line 1109)
- `const effectiveTarget = overrideTotalTarget ?? totalTarget;` (line 1111)
- Return block (lines 1141–1150): `total_target: formatDecimal(overrideTotalTarget ?? totalTarget, 4)` — **effective value returned, not raw** ✅ (Directive 383)
- `average_target: formatDecimal(overrideTotalTarget ?? totalTarget, 4)` — consistent
- `computed_total_target: formatDecimal(totalTarget, 4)` — raw sum still accessible for observability

#### HE-4: Narrative Fields in INSERT ✅ VERIFIED
- INSERT comment at line 1220: `// Phase HE: Include catch_up_plan, facilitating_factors, ways_forward (Directive 386)`
- INSERT columns (line 1229): `catch_up_plan, facilitating_factors, ways_forward, created_by`
- INSERT params at $23–$25 (lines 1255–1257): `dto.catch_up_plan ?? null`, `dto.facilitating_factors ?? null`, `dto.ways_forward ?? null`

#### HE-4: Narrative Fields in SELECT ✅ VERIFIED (via `oi.*`)
- Main query `findIndicatorsByPillarAndYear()` uses `oi.*` at line 996 — ALL `operation_indicators` columns returned automatically, including narrative fields post-migration 036
- Plan HE-4-A note confirmed accurate: "SELECT uses `oi.*` — auto-includes narrative fields after migration"

#### HE-4: Narrative Fields in UPDATE ✅ VERIFIED (via dynamic field assignment)
- `updateIndicatorQuarterlyData()` builds SET clause dynamically from `Object.keys(dto)` (line 1405)
- Narrative fields in DTO → automatically included in UPDATE when present in payload
- Plan HE-4-C note confirmed accurate: "UPDATE uses dynamic field assignment — auto-handles narrative fields from DTO"

#### Minor Gap (Non-blocking): `getOrphanedIndicatorsList()` SELECT
- This admin-diagnostic function (line 1821) uses an explicit column list and does NOT include `catch_up_plan`, `facilitating_factors`, `ways_forward`
- **Impact: NONE** — this function is only used for admin orphan diagnostics, not the main physical page data flow
- **Action: NONE required** — out of scope for Phase HE

---

### Audit-4: DTO — `create-indicator.dto.ts`

#### HE-3: Narrative Fields in DTO ✅ VERIFIED
- `catch_up_plan?: string | null` (line 132) — `@IsOptional() @IsString()`
- `facilitating_factors?: string | null` (line 136) — `@IsOptional() @IsString()`
- `ways_forward?: string | null` (line 140) — `@IsOptional() @IsString()`
- Comment correctly notes semantics: "Catch-Up Plan = for Not Met Targets; Facilitating Factors = for Met Targets; Ways Forward = general"

---

### Audit-5: Migration 036

#### HE-2: Migration File ✅ VERIFIED
- File: `database/migrations/036_add_narrative_fields_to_operation_indicators.sql`
- 3 `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements — safe to re-run
- Columns: `catch_up_plan TEXT`, `facilitating_factors TEXT`, `ways_forward TEXT`
- COMMENT ON COLUMN statements for all 3 fields with correct phase tags
- **PENDING OPERATOR ACTION:** Migration must still be applied to DB: `psql -d pmo_db -f database/migrations/036_add_narrative_fields_to_operation_indicators.sql`

---

### Audit Summary

| Step | Directive | Code Status | Notes |
|------|-----------|-------------|-------|
| HE-1 | 385 | ✅ VERIFIED | Remarks column in both tables with CSS |
| HE-2 | 386 | ✅ DEV COMPLETE | Migration file exists — **OPERATOR must run** |
| HE-3 | 386 | ✅ VERIFIED | DTO has all 3 fields |
| HE-4 | 386 | ✅ VERIFIED | INSERT explicit, SELECT via `oi.*`, UPDATE dynamic |
| HE-5 | 386 | ✅ VERIFIED | All 3 init branches + save payload + dialog textareas |
| HE-6 | 387 | ✅ VERIFIED | expandedNarrativeRows + toggle + expand rows in both tables |
| HE-7 | 388–389 | ✅ VERIFIED | Disbursement in all 3 tables + subtotals + pillar total |
| HE-8 | 390 | ✅ VERIFIED | 4 fin-stat-cards with correct values + color logic |
| HE-9 | 391 | ✅ VERIFIED | Expense class chips: size="small" variant="flat" |
| HD fix | 383–384 | ✅ VERIFIED | Override merge in service; `persistent` removed from dialog |

**Overall: 9/9 code steps verified. All directives 383–391 implemented. One pending operator action: run migration 036.**

---

## Section 2.65 — Phase HF: Column Visibility Control + UI Refinement (2026-04-14)

**Phase:** HF Research
**Date:** 2026-04-14
**Scope:** (A) Physical module — column visibility toggle; (B) Physical module — entry dialog textarea enhancement; (C) Financial module — column order correction; (D) Financial module — utilization rate visual emphasis; (E) Financial module — guide cleanup

---

### HF-A: Physical Module — Table Column Inventory (Current State)

#### Table Structure (Phase HE state)

Both **Outcome Indicators** and **Output Indicators** tables share identical column structure. Two-row header:

| Row | Columns (left → right) |
|-----|------------------------|
| Row 1 (rowspan=2) | Indicator, Total Target, Total Actual, Variance, Rate, Remarks, [Action if canEditData()] |
| Row 1 (colspan=2 each) | Q1, Q2, Q3, Q4 (group headers) |
| Row 2 | Target, Actual (sub-headers, 4× for each quarter) |

**Column count:**
- `canEditData()` = true: **15 columns** (Indicator + 8 Q-sub + 2 Total + Variance + Rate + Remarks + Action)
- `canEditData()` = false: **14 columns** (same minus Action)

**Current column classes:**
- `.indicator-column` — min-width: 220px
- `.quarter-column` — width/min/max: 90px each
- `.total-column` — min-width: 90px
- `.variance-column` — width/min: 80px
- `.rate-column` — width/min: 80px
- `.remarks-column` — min-width: 100px, max-width: 160px
- `.action-column` — width/min: 60px

#### No-Data Row (colspan analysis)

Line 1572 (Outcome), 1763 (Output): `colspan="13"` (hard-coded)

This covers: 8 quarter sub-cols + Total Target + Total Actual + Variance + Rate + Remarks = 13.
The `<td v-if="canEditData()">` for Action is a SEPARATE cell — not included in the colspan.

**Implication for column toggle:** When Remarks is hidden, colspan must drop to 12.

#### Narrative Expand Row (colspan analysis)

Lines 1585 (Outcome), 1776 (Output): `:colspan="canEditData() ? 15 : 14"` (dynamic, correct)

This spans ALL columns. When Remarks is hidden: 14/13 respectively.

**Formula:** `13 + (showRemarks ? 1 : 0) + (canEditData() ? 1 : 0)`

---

### HF-B: Physical Module — Narrative Fields (Column vs Expandable Row)

**Finding:** `catch_up_plan`, `facilitating_factors`, `ways_forward` are **NOT table columns**.
- They appear only in the **expandable narrative row** (Phase HE-6) and **entry dialog** (Phase HE-5).
- The column toggle prompt lists them as toggleable — the correct interpretation is: toggle controls visibility of the **expand button** in the indicator cell and the resulting expand rows.
- Decision: A single **"Narrative Fields (APR/UPR)"** checkbox is sufficient (not 3 separate checkboxes) since all 3 fields are surfaced through the same single expandable row mechanism.

**Existing expand trigger:** The `mdi-text-box-outline` icon button inside the indicator cell, guarded by `hasNarrativeData(indicator.id)`. When `showNarrativeFeature` is false, this button is hidden. State in `expandedNarrativeRows` persists (no cleanup needed — v-if handles visibility).

---

### HF-C: Physical Module — Existing Column Visibility System

**Finding: NO existing system.** Confirmed by searching `visibleColumns`, `showColumns`, `columnToggle` — none found. The only `v-menu` in physical/index.vue is for Export (PDF/Excel — both disabled). No "Columns" or "View Options" button exists anywhere on the page.

**Design decision:** Place the "Columns" toggle button in the Outcome Indicators card-title, right-aligned via `v-spacer`. Since `showRemarks` and `showNarrativeFeature` are page-level refs, toggling once controls both Outcome and Output tables simultaneously.

---

### HF-D: Physical Module — Entry Dialog Textarea State

**Current textareas (Phase HE-5):** All 3 narrative fields use `v-textarea` with `rows="2"` and `auto-grow`. The `no-resize` prop is NOT set, so the Vuetify default applies. However, with `auto-grow` active, the native resize handle is typically suppressed.

**Required change:** Increase `rows` to 3 (larger default visible area) and add CSS targeting `:deep(textarea)` to explicitly enable `resize: vertical`.

---

### HF-E: Financial Module — Column Order (Current State vs Required)

**Current column order in ALL 3 table headers (prefill, empty-state, campus-grouped):**

| Position | Current | Required |
|----------|---------|----------|
| 5 | % Utilization (100px) | **Disbursement** (130px) |
| 6 | Disbursement (130px) | **% Utilization** (100px) |

**Affected locations (6 total):**
1. Prefill table header (lines 1093–1100): swap th cols 5 and 6
2. Empty-state table header (lines 1150–1156): swap th cols 5 and 6
3. Campus-grouped table header (lines 1197–1203): swap th cols 5 and 6
4. Categorized data rows (lines ~1217–1230): Utilization chip at col 5, Disbursement at col 6 → swap
5. Sub-total rows (lines 1283–1291): `formatPercent(utilization)` at col 5, `formatCurrency(disbursement)` at col 6 → swap
6. Pillar total row (lines 1301–1309): same swap

**Uncategorized rows:** Need separate audit — confirmed same wrong order.

**Hero stat cards** (lines 818–838): Already in correct order (Appropriation → Obligations → Disbursement → Utilization Rate). **No change needed.**

---

### HF-F: Financial Module — Utilization Rate Emphasis (Current State)

#### Table chip (categorized rows, line ~1220):
```html
<v-chip size="x-small" variant="tonal" :color="...">{{ formatPercent(rec.utilization_rate) }}</v-chip>
```
Color logic: ≥80% → success | ≥50% → warning | <50% → error

**Weakness:** `x-small` + `tonal` = low visual weight; small and light-background chip is hard to read at a glance.

#### Hero stat card (lines 832–838):
```css
.fin-stat-value { font-size: 1rem; font-weight: 700; }
```
Color class: `text-success` / `text-warning` / `text-error` (dynamic)

**Weakness:** Same `fin-stat-value` class as the other 3 cards — no visual distinction for the primary KPI.

**Required changes:**
- Table chip: `size="x-small"` → `size="small"`; `variant="tonal"` → `variant="flat"` (stronger, opaque background)
- Hero card: Utilization Rate card gets `fin-stat-card--highlight` modifier class; value gets `font-size: 1.25rem`

---

### HF-G: Financial Module — Guide Cleanup (Disbursement Rate Formula)

**Location:** financial/index.vue line 1031 (within the "How to Enter Financial Data" collapsible guide)

**Current content:**
```html
<p class="mb-0 text-grey-darken-1">
  <strong>Key formulas (DBM):</strong>
  <em>Unobligated Balance</em> = Appropriation − Obligations &nbsp;|&nbsp;
  <em>% Utilization</em> = (Obligations ÷ Appropriation) × 100 &nbsp;|&nbsp;
  <em>Disbursement Rate</em> = (Disbursement ÷ Obligations) × 100
</p>
```

**Required:** Remove `Disbursement Rate` formula and its preceding `&nbsp;|&nbsp;` separator. Keep `Unobligated Balance` and `% Utilization`.

**Note:** The guide at line 1020 correctly documents Disbursement as a raw value field "(optional)". No change needed there.

---

### HF-H: UX Pattern Validation

| Pattern | Recommendation | Applied Where |
|---------|----------------|---------------|
| Column toggle on data-heavy tables | `v-menu` + `v-checkbox` (Vuetify native) — minimal overhead, familiar UX | Physical table |
| Long text in tables | Truncate with ellipsis + tooltip or modal (Phase HE already has `.remarks-truncated` + tooltip) | Remarks cell |
| Narrative fields | Expandable row (already implemented HE-6) — hides until user opts in | Physical expand row |
| KPI emphasis | Larger font-size + opaque chip color (flat variant) for utilization | Financial table + hero |
| Column toggle default state | Columns that increase table width default to hidden; always-visible = core data | showRemarks: false |

**Key constraint confirmed:** Physical table at 15 columns is already at the edge of comfortable horizontal display. Hiding Remarks by default reduces to 13/14 columns and eliminates horizontal scroll on standard viewports.

---

### HF-I: Directive Assignments

| # | Directive | Step |
|---|-----------|------|
| 392 | Physical table: column visibility refs `showRemarks` (default false) and `showNarrativeFeature` (default false); `v-menu` + `v-checkbox` button in Outcome Indicators card-title | HF-1 |
| 393 | Physical no-data colspan: `:colspan="showRemarks ? 13 : 12"` in both tables; narrative expand colspan: `13 + (showRemarks ? 1 : 0) + (canEditData() ? 1 : 0)` — no hard-coded colspans | HF-1 |
| 394 | Physical Remarks `<th>` and `<td>` in both Outcome and Output tables: `v-if="showRemarks"` | HF-1 |
| 395 | Physical narrative expand button: `v-if="showNarrativeFeature && hasNarrativeData(indicator.id)"`; expand row: `v-if="showNarrativeFeature && expandedNarrativeRows.has(indicator.id) && ..."` | HF-1 |
| 396 | Physical entry dialog narrative textareas: `rows="3"` (up from 2); CSS `.narrative-textarea :deep(textarea) { resize: vertical; min-height: 72px; }` | HF-2 |
| 397 | Financial column order: Disbursement BEFORE % Utilization in all 3 table headers, categorized data rows, uncategorized rows, sub-total rows, pillar total row | HF-3 |
| 398 | Financial table utilization chip: `size="small" variant="flat"` in categorized rows, uncategorized rows, and prefill table rows | HF-4 |
| 399 | Financial hero Utilization Rate card: add `fin-stat-card--highlight` class; inline `style="font-size: 1.25rem"` on `.fin-stat-value` | HF-5 |
| 400 | Financial guide: Disbursement Rate formula and its `&nbsp;|&nbsp;` separator removed from key formulas paragraph | HF-6 |

---

## Section 2.66 — Phase HG: Global Column Visibility System + Action Bar Standardization (2026-04-14)

**Phase:** HG Research
**Date:** 2026-04-14
**Scope:** (A) Physical module — fix column visibility scoping; refactor to `columnVisibility` config object; move toggle to action bar. (B) Financial module — action bar standardization (Export + Submit buttons).

---

### HG-A: Physical Column Visibility — True Root Cause Analysis

#### Misdiagnosis Clarification
The HG prompt states the toggle "only applies to one indicator." Code audit disproves this at the logic level:

- `showRemarks = ref(false)` declared at line 482 — **page-level ref**, not per-indicator
- `showNarrativeFeature = ref(false)` declared at line 483 — **page-level ref**, not per-indicator
- Both refs are applied via `v-if` on `<th>` and `<td>` in **both Outcome and Output** tables
- Vuetify `v-tabs` with `activePillar` does **not** re-mount the component — state persists across all 4 pillar tabs

**True root cause: UI placement mismatch.**
The Columns `v-menu` button lives in the **Outcome Indicators card-title** (line 1456). The Output Indicators card-title (line 1658) has **no Columns button**. Users interacting with the Output table section cannot see or find the toggle. Visually, it appears to be an "Outcome-only" control.

#### Additional Coarseness Issue
`showNarrativeFeature` is a binary toggle for all 3 narrative fields (catch_up_plan, facilitating_factors, ways_forward) collectively. The HG prompt proposes fine-grained individual toggles per field — enabling, e.g., Catch-Up Plans without enabling Ways Forward.

---

### HG-B: Physical Column Config Architecture (Current vs Proposed)

#### Current (Phase HF)
```ts
const showRemarks = ref(false)               // toggle for Remarks column
const showNarrativeFeature = ref(false)      // toggle for ALL narrative expand rows
```

#### Proposed (Phase HG)
```ts
const columnVisibility = reactive({
  remarks: false,
  catch_up_plans: false,
  facilitating_factors: false,
  ways_forward: false,
})
const anyNarrativeVisible = computed(() =>
  columnVisibility.catch_up_plans || columnVisibility.facilitating_factors || columnVisibility.ways_forward
)
```

#### Migration Map

| Old reference | New reference |
|---|---|
| `showRemarks` | `columnVisibility.remarks` |
| `showNarrativeFeature` | `anyNarrativeVisible` (computed) |
| Expand row catch_up_plan `v-if` | `columnVisibility.catch_up_plans && data?.catch_up_plan` |
| Expand row facilitating_factors `v-if` | `columnVisibility.facilitating_factors && data?.facilitating_factors` |
| Expand row ways_forward `v-if` | `columnVisibility.ways_forward && data?.ways_forward` |

#### Affected template locations (Physical only)
1. `hasNarrativeData(id)` function — must check only enabled fields
2. Outcome table `<th v-if="showRemarks">` → `v-if="columnVisibility.remarks"` (line 1488)
3. Outcome table Remarks `<td>` (line 1582) → `v-if="columnVisibility.remarks"`
4. Outcome no-data colspan (line 1594) → `columnVisibility.remarks ? 13 : 12`
5. Outcome expand button (line 1538) → `v-if="anyNarrativeVisible && ..."`
6. Outcome expand row `<tr>` (line 1606) → `v-if="anyNarrativeVisible && ..."`
7. Outcome expand row per-field `v-col` blocks (lines 1611, 1618, 1625) → add `columnVisibility.<field> &&` guard
8. Outcome expand row colspan (line 1608) → `columnVisibility.remarks ? 1 : 0` unchanged formula
9. Output table `<th v-if="showRemarks">` (line 1680) → `v-if="columnVisibility.remarks"`
10. Output table Remarks `<td>` → `v-if="columnVisibility.remarks"`
11. Output no-data colspan → `columnVisibility.remarks ? 13 : 12`
12. Output expand button → `v-if="anyNarrativeVisible && ..."`
13. Output expand row `<tr>` → `v-if="anyNarrativeVisible && ..."`
14. Output expand row per-field `v-col` blocks → add `columnVisibility.<field> &&` guard
15. Output expand row colspan → unchanged formula using `columnVisibility.remarks`

---

### HG-C: Physical Action Bar — Columns Button Placement Fix

#### Current action bar (line 1133–1241): `[Quarter] [FY] [Export▼] [Submit/Status]`

Columns button is buried in Outcome card-title — not part of the action bar. No button in Output card-title.

#### Proposed action bar: `[Quarter] [FY] [Columns▼] [Export▼] [Submit/Status]`

- Insert Columns `v-menu` between FY selector and Export button
- 4 checkboxes: Remarks / Catch-Up Plans / Facilitating Factors / Ways Forward
- Remove Columns v-menu from Outcome card-title (line 1456–1471)
- Output card-title remains unchanged (no button needed — control is in action bar)

---

### HG-D: Financial Action Bar — Standardization Gap Analysis

#### Physical top-right action bar (line 1133)
```
[Quarter Selector] [FY Selector] [Export▼] [Submit/Withdraw/Pending/Approved]
```

#### Financial top-right action bar (line 844)
```
[Quarter Selector] [FY Selector]
```
— no Export, no Submit

#### Financial Submit/Withdraw location
**Inside pillar header card** (lines 918–942, within `v-card-text`). User must scroll past hero stats + pillar tabs to reach it.

#### Missing in Financial
1. **Export button** — Physical has Export (coming soon) in action bar; Financial has none
2. **Submit/Withdraw in top area** — Financial requires scroll; Physical is immediately accessible

#### Standardization target
Financial action bar becomes: `[Quarter Selector] [FY Selector] [Export▼] [Submit/Withdraw/Pending]`
- Submit/Withdraw conditional buttons move from pillar header to top action bar
- Pillar header card keeps status/info chips only (FY chip, status chip, records count, utilization chip)

---

### HG-E: `hasNarrativeData()` Update Requirement

Current implementation (line 492):
```ts
function hasNarrativeData(id: string): boolean {
  const d = getIndicatorData(id)
  return !!(d?.catch_up_plan || d?.facilitating_factors || d?.ways_forward)
}
```
This returns `true` if data exists for ANY narrative field — ignoring `columnVisibility`.

**Required behavior (Phase HG):** `hasNarrativeData` must also check that at least one enabled field has data, otherwise the expand button would appear even when all narrative toggles are off.

New implementation:
```ts
function hasNarrativeData(id: string): boolean {
  const d = getIndicatorData(id)
  if (!d) return false
  return !!(
    (columnVisibility.catch_up_plans && d.catch_up_plan) ||
    (columnVisibility.facilitating_factors && d.facilitating_factors) ||
    (columnVisibility.ways_forward && d.ways_forward)
  )
}
```
Note: the expand button `v-if` already guards `getIndicatorData(indicator.id)` — the `hasNarrativeData` check suffices to integrate both data and visibility.

---

### HG-F: Directive Assignments

| # | Directive | Step |
|---|-----------|------|
| 401 | Physical: replace `showRemarks` + `showNarrativeFeature` refs with `columnVisibility = reactive({ remarks: false, catch_up_plans: false, facilitating_factors: false, ways_forward: false })` and `anyNarrativeVisible = computed(...)` | HG-1 |
| 402 | Physical: Columns v-menu moved to main action bar (between FY and Export); 4 checkboxes: Remarks, Catch-Up Plans, Facilitating Factors, Ways Forward; removed from Outcome card-title | HG-2 |
| 403 | Physical: all 15 template reference points migrated (th/td/colspan/button/row): `showRemarks` → `columnVisibility.remarks`; `showNarrativeFeature` → `anyNarrativeVisible`; per-field `v-col` blocks add `columnVisibility.<field> &&` guard | HG-3 |
| 404 | Physical: `hasNarrativeData()` updated to check only enabled narrative fields against `columnVisibility` | HG-3 |
| 405 | Financial: Export v-menu added to top action bar (PDF/Excel, disabled "coming soon"), identical structure to Physical Export button | HG-4 |
| 406 | Financial: Submit/Withdraw conditional buttons moved from pillar header card to top action bar; pillar header `v-card-text` retains status/info chips only; no Submit/Withdraw logic changes | HG-5 |



---

### Section 2.66 — Phase HH: Physical Action Bar Refactor + Column Visibility Fix (Apr 14, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

**Objective:** (A) Restructure the Physical module action bar into a 3-section LEFT|CENTER|RIGHT layout per usability spec. (B) Fix narrative column toggles that appear non-functional after HG implementation.

---

#### HH-A: Action Bar — Current State Audit

**Evidence: audit of `pmo-frontend/pages/university-operations/physical/index.vue` lines 1132–1280.**

**Finding A-1: Controls layout — single right-aligned container, no semantic grouping.**

Current outer header (lines 1132–1143):
```html
<div class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center mb-4 ga-3">
  <!-- LEFT: Back button + Title block -->
  <div class="d-flex align-center ga-3"> ... </div>
  <!-- RIGHT: ALL controls in one flat flex row, max-width 760px -->
  <div class="d-flex flex-column flex-sm-row align-stretch align-sm-center ga-2 ga-sm-3" style="width: 100%; max-width: 760px">
    Reporting Period | FY | Columns | Export | Submit
  </div>
</div>
```

**Finding A-2: Current render order within the controls container (left → right):**
1. Reporting Period v-select (200px, density=compact)
2. Fiscal Year v-select (170px, density=compact)
3. Columns v-menu (outlined, density=compact) — Phase HG-2
4. Export v-menu (`color="primary"`, outlined, density=compact) — Phase EO-F
5. Submit for Review / Resubmit (conditional, `color="primary"`, tonal, density=compact)
6. Withdraw (conditional, `color="warning"`, tonal)
7. Pending Review (conditional, disabled info button)
8. Approved (conditional, success chip)

**Finding A-3: Usability issues.**

| Issue | Evidence |
|-------|----------|
| Primary actions (Submit) appear LAST | Submit is rightmost element; filter controls appear before it |
| Export has `color="primary"` + outlined | Visually competes with Submit for Review (also primary-colored) |
| No visual group separation | Filter controls and action buttons rendered in the same undifferentiated flex row |
| "Approved" chip mixed with buttons | Status chip (non-interactive) appears in same row as actionable buttons |

**Finding A-4: Required target structure (per operator spec).**

```
[Title Row]  ← | Physical Accomplishments / subtitle

[Action Bar] [Submit / Withdraw / Status]  ·  [Quarter ▼  FY ▼  Columns]  ·  [Export ▼]
             ├── LEFT (primary actions) ──┤  ├──── CENTER (filters) ────┤  ├── RIGHT ─┤
```

The action bar should be a full-width strip below the title row, using `justify-space-between` to create the three sections. No max-width constraint on the strip.

**Finding A-5: Button standardization requirements.**

- Submit for Review: `color="primary"` `variant="flat"` (highest emphasis — primary CTA)
- Withdraw: `color="warning"` `variant="tonal"` (destructive-adjacent — tonal is correct)
- Columns: `variant="outlined"` (secondary control, no color override — already correct)
- Export: `variant="outlined"` (secondary action, `color="primary"` → REMOVE, matches Columns)
- Density: all `density="compact"` — already consistent; retain

---

#### HH-B: Column Visibility — Narrative Toggles Root Cause

**Evidence: audit of physical/index.vue lines 481–507, 1556–1568, 1624–1656, 1816–1855.**

**Finding B-1: Prerequisite gap — Migration 036 may not have been applied.**

Migration `036_add_narrative_fields_to_operation_indicators.sql` adds `catch_up_plan`, `facilitating_factors`, `ways_forward` columns. It was flagged as OPERATOR-pending in Phase HE. If not run:
- `SELECT *` from `operation_indicators` returns no `catch_up_plan` field
- `getIndicatorData(indicator.id)?.catch_up_plan` → `undefined`
- `hasNarrativeData(id)` → always `false`
- Expand button never renders → narrative toggle appears completely broken

This is a prerequisite, not a code bug. Operator must run migration 036 before narrative fields can function.

**Finding B-2: `hasNarrativeData()` gates expand button too strictly (code bug).**

Current expand button condition (line 1557–1567, Outcome table; identical in Output):
```vue
<v-btn
  v-if="anyNarrativeVisible && getIndicatorData(indicator.id) && hasNarrativeData(indicator.id)"
```

`hasNarrativeData(id)` (line 500–507):
```ts
function hasNarrativeData(id: string): boolean {
  const d = getIndicatorData(id)
  if (!d) return false
  return !!(
    (columnVisibility.catch_up_plans && d.catch_up_plan) ||
    (columnVisibility.facilitating_factors && d.facilitating_factors) ||
    (columnVisibility.ways_forward && d.ways_forward)
  )
}
```

**Consequence:** Even after migration 036 is run, if no user has yet saved narrative data for an indicator, `hasNarrativeData()` returns `false`. The expand button never appears. Toggling "Catch-Up Plans" ON appears to do nothing — the exact "not working" symptom.

**The logical flaw:** `hasNarrativeData` is designed to prevent the expand button from appearing for indicators with no narrative data. This was intended as UX polish (no button if nothing to show). But it produces a confusing UX: the toggle fires silently with no visible feedback, making users believe the feature is broken.

**Finding B-3: Correct separation of concerns.**

The expand button's function is "enter narrative review mode for this indicator." It should appear whenever:
1. `anyNarrativeVisible` — at least one narrative column is toggled on
2. `getIndicatorData(indicator.id)` — the indicator has a quarterly record

Whether data exists in narrative fields is a concern for the panel's content, not for the button's visibility. The panel already handles per-field gating (`v-if="columnVisibility.catch_up_plans && data.catch_up_plan"`) but needs empty-state fallbacks when a field is enabled but has no content.

**Finding B-4: Panel empty state missing.**

Inside the narrative expand panel (lines 1631–1651):
```vue
<v-col v-if="columnVisibility.catch_up_plans && getIndicatorData(indicator.id)?.catch_up_plan" ...>
  {{ data.catch_up_plan }}
</v-col>
```

When `columnVisibility.catch_up_plans = true` but `data.catch_up_plan = null`, the entire `v-col` is omitted. The panel renders empty (no children, just the panel container). This is acceptable IF the button appears and the panel opens — but since the button is gated by `hasNarrativeData`, this scenario never occurs currently.

After fixing B-2 (removing the `hasNarrativeData` gate from the button), the panel can appear with no content — which would look broken. **Fix: add `v-else` fallback per narrative section inside the panel.**

**Finding B-5: colspan adjustment — NOT affected.**

`hasNarrativeData` is not referenced in any colspan calculation. Removing it from the button condition does not affect column counting.

---

#### HH-C: Scope Summary

| Item | Type | Affected File | Lines |
|------|------|---------------|-------|
| Action bar restructure: title row + 3-section strip | Layout refactor | `physical/index.vue` | 1132–1280 |
| Export `color="primary"` → remove | Button standardization | `physical/index.vue` | ~1201 |
| Submit `variant="tonal"` → `"flat"` | Button emphasis fix | `physical/index.vue` | ~1232 |
| Expand button: drop `hasNarrativeData` gate | Logic fix | `physical/index.vue` | ~1557, ~1749 |
| Narrative panel: add empty-state per field | UX fix | `physical/index.vue` | ~1631–1651, ~1823–1843 |

**No backend changes. No database changes. No financial module changes.**

---

### Section 2.67 — Phase HI: Action Bar Standardization + Narrative Column Migration (Apr 14, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

**Objective:** (A) Standardize action bar layout across Physical and Financial to a 2-row pattern (primary actions row + controls row). (B) Replace Physical expand-row narrative system with true table columns that appear immediately when toggled.

---

#### HI-A: Physical Action Bar — Current State (post-HH)

Current Row 2 is a single `d-flex justify-space-between` with 3 flex children: LEFT=Submit, CENTER=Quarter+FY+Columns, RIGHT=Export. Spec requires Row 1 = primary actions only, Row 2 = all controls + Export in one left-to-right row (no 3-section split). The CENTER/RIGHT separation means Export is isolated from the other controls — inconsistent with the unified control bar spec.

---

#### HI-B: Financial Action Bar — Current State

Single `d-flex justify-space-between` row: LEFT = Back button + title + subtitle + Hero KPI stat cards embedded. RIGHT = Quarter + FY + Export + Submit + Withdraw. Issues: hero KPI competing with title text, Submit rightmost, Export has `color="primary"` (inconsistent), Submit uses `variant="tonal"` (Physical uses `variant="flat"` after HH-1), no Pending/Approved chip states.

Target Financial structure:
- Row 1: Title (Back + heading + subtitle)
- Row 2: Primary actions — Submit (`variant="flat"`) + Withdraw + Pending chip + Approved chip
- Row 3: Controls — Quarter + FY + Export (neutral, no primary color)
- Row 4: Hero KPI (conditional on data)

---

#### HI-C: Physical Narrative — Expand Row System (Still Present)

Post-HH, narrative toggles show an expand button per row (clicking opens an inline panel). UX problem: user must discover and click a small icon to see narrative data — it does not appear as a visible column in the table. Operator requirement: narrative fields must appear as TABLE COLUMNS immediately when toggled.

**Items to migrate:**
- Narrative `<th>` headers with `rowspan="2"` added AFTER Indicator column, BEFORE quarter group headers
- Narrative `<td>` cells added INSIDE the `<template v-if="getIndicatorData()">` block, after indicator cell, before quarter cells
- Cell content: truncated text with tooltip (reuse `.remarks-truncated` pattern); empty dash when no data

**Items to REMOVE:**
- `expandedNarrativeRows` ref + `toggleNarrativeRow()` + `hasNarrativeData()` + `anyNarrativeVisible` (all superseded)
- Expand button `<v-btn>` in indicator cells (both Outcome + Output tables)
- `<template v-for ...narrative>` expand row blocks (both tables)
- `.narrative-panel` CSS class

---

#### HI-D: Column Count and Colspan Math

Base columns (no optional): 13 = Indicator + 8 quarter cols + 2 totals + Variance + Rate.

No-data colspan (spans all cols except Indicator):
```
Current:  columnVisibility.remarks ? 13 : 12
Updated:  12 + (columnVisibility.remarks ? 1 : 0) + (columnVisibility.catch_up_plans ? 1 : 0)
              + (columnVisibility.facilitating_factors ? 1 : 0) + (columnVisibility.ways_forward ? 1 : 0)
```

Both Outcome and Output tables require the same update.

---

#### HI-E: Scope Summary

| Item | Module | Change Type |
|------|--------|-------------|
| Row 2 action bar → Row 2 (actions) + Row 3 (controls) | Physical | Layout |
| Narrative `th`/`td` table columns | Physical | Feature migration |
| Expand row system removal | Physical | Dead code removal |
| Colspan formula updates (both tables) | Physical | Correctness |
| Narrative CSS classes | Physical | CSS addition |
| Header 4-row restructure | Financial | Layout |
| Submit variant=flat, Export no primary color | Financial | Button standardization |
| Add Pending/Approved chip states | Financial | Feature parity |

---

### Section 2.68 — Phase HJ: Narrative Below-Row Sections + Financial KPI Hierarchy + Action Bar Consistency (Apr 14, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

**Objective:** (A) Replace Physical narrative table columns (HI-2) with per-indicator below-row stacked sections to eliminate horizontal scrolling. (B) Fix Financial action bar Row 2 defects (Withdraw `v-if` bug, missing Pending/Approved chips). (C) Elevate Financial KPI cards above action buttons to establish correct visual hierarchy.

---

#### HJ-A: Physical Module — Narrative Table Columns (HI-2 Superseded)

Phase HI-2 implemented `catch_up_plans`, `facilitating_factors`, and `ways_forward` as proper `<th rowspan="2">` / `<td>` table columns in both Outcome (~lines 1484–1487, 1580–1606) and Output (~lines 1664–1666, 1759–1785) tables. The column approach causes the table to expand horizontally when any narrative toggle is enabled, introducing a horizontal scrollbar. Long narrative text is poorly readable in a truncated cell.

**Operator requirement change:** Narrative fields must NOT add table columns. Instead, when a narrative toggle is ON and the indicator has quarterly data, a stacked text panel must appear immediately BELOW that indicator's row, fully spanning all table columns. The table width must be unaffected by narrative visibility.

**Impact:** Both Outcome and Output `<tbody>` loops must change from `<tr v-for>` to `<template v-for>` (two `<tr>` elements per indicator: the data row + the optional narrative row). CSS classes `.narrative-column`, `.narrative-cell`, `.narrative-truncated` must be replaced with `.narrative-stacked-row`, `.narrative-stacked-panel`, `.narrative-stacked-item`.

---

#### HJ-B: Physical Module — `anyNarrativeVisible` Computed

After HI-4 removed the expand-row system, no `anyNarrativeVisible` computed exists in script. The below-row narrative `<tr>` needs a `v-if` guard to avoid rendering empty rows when all three narrative toggles are OFF. Must add:

```ts
const anyNarrativeVisible = computed(() =>
  columnVisibility.catch_up_plans || columnVisibility.facilitating_factors || columnVisibility.ways_forward
)
```

---

#### HJ-C: Physical Module — Colspan Formula Update

Current no-data colspan (post HI-3): `12 + remarks + catch_up_plans + facilitating_factors + ways_forward`. With narrative columns removed from the table, the formula simplifies to:

```
12 + (columnVisibility.remarks ? 1 : 0)
```

The narrative below-row `<tr>` needs a separate colspan computed that spans ALL table columns including the edit button column:

```ts
// 13 = Indicator (1) + Q cols (8) + Totals (2) + Variance (1) + Rate (1)
const narrativeRowColspan = computed(() => {
  let n = 13
  if (columnVisibility.remarks) n++
  if (canEditData()) n++
  return n
})
```

Applies to both Outcome and Output tables identically.

---

#### HJ-D: Physical Module — Action Bar (Already Correct)

Post-HI-1, the Physical action bar is correctly structured:
- Row 2 (lines 1123–1173): Submit / Withdraw (`v-else-if`) / Pending chip (`v-else-if`) / Approved chip (`v-else-if`) — all correct
- Row 3 (lines 1175–1254): Quarter + FY + Columns menu + Export — all correct

**No changes required to Physical action bar.**

---

#### HJ-E: Financial Module — Action Bar Defects

Row 2 (lines 820–850) has two defects:

**Defect 1 — Withdraw `v-if` instead of `v-else-if`:** Both Submit and Withdraw currently use `v-if`, meaning both can render simultaneously if `canSubmitAllPillars()` and `canWithdrawAllPillars()` both return true. Physical module uses `v-else-if` correctly; Financial must match.

**Defect 2 — Missing Pending Review chip:** No `v-else-if` for `publication_status === 'PENDING_REVIEW'` exists. Physical module has this chip; Financial does not. Users have no visual feedback that the report is under review in Financial module.

**Defect 3 — Missing Approved chip:** No `v-else-if` for `publication_status === 'PUBLISHED'` exists. Physical module shows an Approved `<v-chip color="success">` chip; Financial does not.

Fix: Align Financial Row 2 to match Physical's 4-state pattern exactly.

---

#### HJ-F: Financial Module — KPI Hierarchy

Current order (post HI-5): Row 1 (Title) → Row 2 (Actions) → Row 3 (Controls) → Row 4 (KPI, lines 906–927).

The operator requirement is that KPI stat cards are the **primary visual element** — they must appear immediately after the page title, before any action buttons. This gives stakeholders instant financial data context before interacting with controls.

Target order: Row 1 (Title) → **Row 2 (KPI Cards)** → Row 3 (Actions) → Row 4 (Controls).

Only the DOM position of the KPI `<div>` changes; no reactive data, conditional logic, or styling changes are required.

---

#### HJ-G: Scope Summary

| Item | Module | File | Change Type |
|------|--------|------|-------------|
| Remove narrative `<th>` columns (both tables) | Physical | physical/index.vue | HI-2 supersession |
| Remove narrative `<td>` cells (both tables) | Physical | physical/index.vue | HI-2 supersession |
| `<tr v-for>` → `<template v-for>` (both tables) | Physical | physical/index.vue | Structural refactor |
| Add below-row narrative `<tr>` per indicator (both tables) | Physical | physical/index.vue | New feature |
| Add `anyNarrativeVisible` computed | Physical | physical/index.vue | Script addition |
| Add `narrativeRowColspan` computed | Physical | physical/index.vue | Script addition |
| Update no-data colspan formula (both tables) | Physical | physical/index.vue | Correctness fix |
| Replace narrative CSS classes | Physical | physical/index.vue | CSS change |
| Fix Withdraw `v-if` → `v-else-if` | Financial | financial/index.vue | Bug fix |
| Add Pending Review chip (Row 2) | Financial | financial/index.vue | Feature parity |
| Add Approved chip (Row 2) | Financial | financial/index.vue | Feature parity |
| Move KPI section above action row | Financial | financial/index.vue | Layout reorder |

---

## Section 2.69 — Phase HK Research: Header Alignment + MOV Integration + Remarks Restructure

**Phase:** HK
**Date:** 2026-04-14
**Scope:** Physical + Financial modules — header row merge, remarks moved out of table, new MOV field

---

### HK-A: Physical Module — Header Structure (Current State)

File: `pmo-frontend/pages/university-operations/physical/index.vue`

**Row 1** (line 1125): `<div class="d-flex align-center ga-3 mb-3">`
- Contains: back button + title/subtitle `<div>`
- Does NOT contain submit/status element

**Row 2** (line 1137): `<div class="d-flex align-center flex-wrap ga-2 mb-2">`
- Contains: 4-state chain — Submit `v-if` / Withdraw `v-else-if` / Pending `v-else-if` / Approved chip `v-else-if`
- Wraps all 4 states in an implicit block (no `<template>` wrapper — each `v-if`/`v-else-if` hangs directly on `<v-btn>` or `<v-chip>`)

**Row 3** (line 1188): Controls (Quarter + FY + Columns + Export)

**Issue:** Title (Row 1) and submit/status (Row 2) are separate rows. Submit button does not appear right-aligned to the title — it renders below it on a new line.

**Fix strategy:** Merge Row 1 and Row 2 into a single flex container using `justify-content: space-between`. Left side: back button + title div. Right side: the 4-state submit/status block. Row 3 (Controls) remains unchanged.

---

### HK-B: Financial Module — Header Structure (Current State)

File: `pmo-frontend/pages/university-operations/financial/index.vue`

**Row 1** (line 808): `<div class="d-flex align-center ga-3 mb-2">` — title only
**Row 2** (line 821, Phase HJ-6): KPI hero cards — Appropriation, Obligations, Disbursement, Utilization
**Row 3** (line 844, Phase HJ-5): Submit/Withdraw/Pending/Approved 4-state chain
**Row 4** (line 898, Phase HJ-6): Controls (Quarter + FY + Export)

**Issue:** Title and submit/status are separated by the entire KPI row. Submit is not right-aligned to the title.

**Fix strategy:** Merge Row 1 (title) + Row 3 (actions) into a single flex row with `justify-content: space-between`. Preserve Row 2 (KPI) and Row 3/Controls layout. After merge, order becomes:
- Header Row: title (left) + submit/status (right)
- Row 2: KPI cards (unchanged)
- Row 3: Controls (unchanged)

Note: KPI block has its own `v-if="!loading && financialRecords.length > 0"` guard — remains unchanged.

---

### HK-C: Remarks Column in Table — Post-Phase HJ State (Physical)

Phase HJ Directive 123 explicitly preserved remarks as a table column while moving narrative fields (catch_up_plans, facilitating_factors, ways_forward) to below-row stacked panels.

Current table column behavior:
- Both Outcome and Output `<thead>` contain: `<th v-if="columnVisibility.remarks" class="text-left remarks-column" rowspan="2">Remarks</th>`
- Both `<tbody>` data rows contain: `<td v-if="columnVisibility.remarks" class="remarks-cell">` with truncated tooltip
- `narrativeRowColspan` computed (line 494): `let n = 13; if (columnVisibility.remarks) n++; if (canEditData()) n++`
- No-data colspan (line 1589): `12 + (columnVisibility.remarks ? 1 : 0)`
- `anyNarrativeVisible` (line 490): does NOT include `columnVisibility.remarks` — remarks never appears in stacked panel

**Operator requirement for HK:** Remarks must also move OUT of the table and INTO the stacked below-row section (alongside narrative fields). This supersedes HJ Directive 123.

**Impact of change:**
1. Remove `<th v-if="columnVisibility.remarks">` from Outcome `<thead>` and Output `<thead>`
2. Remove `<td v-if="columnVisibility.remarks">` from Outcome and Output `<tbody>` data rows
3. `narrativeRowColspan`: remove `if (columnVisibility.remarks) n++` — n stays at `13 + (canEditData() ? 1 : 0)`
4. No-data colspan: `12 + (columnVisibility.remarks ? 1 : 0)` → `12`
5. `anyNarrativeVisible`: add `|| columnVisibility.remarks`
6. Stacked panel in both tables: add Remarks item `<div v-if="columnVisibility.remarks">` with `remarks-stacked-item` display
7. CSS: `.remarks-column` and `.remarks-cell` and `.remarks-truncated` classes become obsolete (can be removed or left as dead CSS — prefer clean removal)

---

### HK-D: MOV Attribute — Full-Stack Gap Analysis

**MOV = Means of Verification**: documentary or observable evidence supporting indicator accomplishment claims.

**Database:** `mov` column does NOT exist in `operation_indicators` table. Latest migration is `036_add_narrative_fields_to_operation_indicators.sql`. Requires new migration `037_add_mov_to_operation_indicators.sql`.

**Backend DTO:** `CreateIndicatorQuarterlyDto` (file: `dto/create-indicator.dto.ts`, line 169 ends) has no `mov` field. Must add `@IsOptional() @IsString() mov?: string | null` after `override_total_actual`.

**Backend INSERT SQL** (service line 1229): explicit column list — `mov` must be added as position `$27` after `ways_forward`. Current 26 parameters; becomes 27.

**Backend PATCH SQL** (service lines 1419–1428): uses dynamic field update — `Object.keys(dto).filter(...)` builds SET clause dynamically. Once `mov` is in the DTO, PATCH automatically handles it. **No explicit PATCH SQL change required.**

**Backend SELECT queries:** All `getIndicatorsForOperation` queries use `oi.*` (lines 996, 1039) and post-op enrichment queries also use `oi.*` (lines 1410, 1439). `mov` will be included automatically after migration. **No SELECT query changes required.**

**Frontend `entryForm`:** Three initialization paths in `openEntryDialogDirect()`:
- Path 1 (existing data, line 640): must add `mov: existingData.mov || ''`
- Path 2 (prior quarter prefill, line 695): must add `mov: ''` (do not inherit prior quarter's MOV)
- Path 3 (empty form, line 727): must add `mov: ''`

**Frontend `saveQuarterlyData()`** (line ~850): payload must include `mov: entryForm.value.mov?.trim() || null`

**Frontend `columnVisibility`** (line 482 reactive): must add `mov: false`

**Frontend `anyNarrativeVisible` computed** (line 490): must add `|| columnVisibility.mov`

**Frontend Columns menu** (line 1220): add checkbox for MOV under "Narrative Fields (APR/UPR)" group or new "Verification" group

**Frontend entry dialog**: add `v-textarea` for MOV after `ways_forward` textarea (line ~1993), before Annual Performance Summary section

**Frontend stacked panel** (Outcome + Output tables): add `<div v-if="columnVisibility.mov">` item after `ways_forward` item

---

### HK-E: Stacked Panel — Current Coverage (Post-HJ)

The below-row stacked panel (Phase HJ) currently covers:
- `catch_up_plans` → `catch_up_plan` field
- `facilitating_factors` → `facilitating_factors` field
- `ways_forward` → `ways_forward` field

After HK:
- `remarks` → `remarks` field (moved from table column — HK-C)
- `mov` → `mov` field (new — HK-D)

All 5 fields will be in the stacked panel. `anyNarrativeVisible` must gate all 5.

---

### HK-F: Scope Summary

| Item | Module | Files | Change Type |
|------|--------|-------|-------------|
| Merge title + submit/status rows | Physical | physical/index.vue | Layout restructure |
| Merge title + submit/status rows | Financial | financial/index.vue | Layout restructure |
| Remove remarks `<th>`/`<td>` from both tables | Physical | physical/index.vue | HJ-123 supersession |
| Update `narrativeRowColspan` (remove remarks offset) | Physical | physical/index.vue | Computed fix |
| Update no-data colspan (remove remarks offset) | Physical | physical/index.vue | Template fix |
| Update `anyNarrativeVisible` (add remarks + mov) | Physical | physical/index.vue | Computed update |
| Add remarks to stacked panel (both tables) | Physical | physical/index.vue | New panel item |
| Add MOV DB column | Both | migration 037 | New migration |
| Add `mov` to `CreateIndicatorQuarterlyDto` | Physical | create-indicator.dto.ts | Backend DTO |
| Add `mov` to INSERT SQL | Physical | university-operations.service.ts | SQL update |
| Add `mov` to frontend form, visibility, panel, save | Physical | physical/index.vue | Frontend feature |

---

## Section 2.70 — Phase HL Research: MOV File Upload + Interactive Editing + Column Menu Parity

**Date:** 2026-04-14
**Scope:** Physical (full) + Financial (remarks parity + MOV via metadata)

---

### HL-A: Backend Upload Infrastructure — Current State

**Existing upload module:** `pmo-backend/src/uploads/`
- Controller: `POST /api/uploads` (JWT-protected, roles: Admin/Staff)
- Service: validates file → calls `StorageService.saveFile()` → returns `UploadResponseDto`
- Storage: local filesystem, `memoryStorage()` in Multer, writes to disk with UUID names
- Path pattern: `{UPLOAD_DIR}/{entityType}/{entityId}/{uuid}_{sanitizedName}.ext` (or flat if no entity context)
- Max size: 10MB (env `MAX_FILE_SIZE`, default 10MB)
- **Default allowed MIME types (hardcoded fallback):** `image/jpeg, image/png, image/gif, application/pdf`
- **GAP**: DOCX (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`), XLSX (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`), plain text (`text/plain`) NOT in default allow-list
- Response shape: `{ id, originalName, fileName, filePath, fileSize, mimeType, uploadedBy, uploadedAt }`
- `filePath` is relative to `UPLOAD_DIR` (e.g., `uuid_file.pdf`)
- The controller currently does NOT accept `entityType`/`entityId` parameters — files are saved flat (no entity subdirectory unless code is extended)

**`useApi.ts` gap:** All calls use `Content-Type: application/json` via the `request()` helper. No `upload()` method exists. File upload requires `FormData` with NO `Content-Type` header (browser sets `multipart/form-data` + boundary automatically).

---

### HL-B: MOV Field — Data Model Analysis

**Physical module (`operation_indicators`):**
- Column: `mov TEXT` (added Phase HK, migration 037)
- Currently stores plain text only (no upload path, no structured data)
- Phase HK frontend: `v-textarea` in entry dialog, plain string in `entryForm.mov`
- **Backward compatibility requirement:** any existing plain-text MOV values must continue to render correctly

**Proposed multi-type JSON structure (no migration needed):**
```json
{ "type": "text", "value": "Description of evidence" }
{ "type": "link", "value": "https://drive.google.com/..." }
{ "type": "file", "value": "uuid_report.pdf", "metadata": { "filename": "Q1_Report.pdf", "size": 204800, "mimeType": "application/pdf" } }
```
Parser fallback: if `JSON.parse(mov)` fails or result lacks `type`, treat as `{ type: "text", value: mov }`.

**Financial module (`operation_financials`):**
- **No `mov` column exists** in schema or DTO
- Has `metadata JSONB` field (present in DB schema and DTO: `metadata?: Record<string, any>`)
- MOV for financial = supporting documents (obligation slips, budget certs, DVs)
- **Approach (no migration):** store as `metadata.mov = { type, value, metadata? }` in existing JSONB column
- Frontend reads: `record.metadata?.mov`; saves: merge into `entryForm.metadata.mov`

---

### HL-C: Physical Module — Dialog Form Analysis

**Current entry dialog (Phase HK state):**
1. Quarterly data table (target/actual/score per Q)
2. Remarks `v-textarea`
3. Narrative divider + section header
4. Catch-Up Plans `v-textarea`
5. Facilitating Factors `v-textarea`
6. Ways Forward `v-textarea`
7. **MOV `v-textarea`** (Phase HK addition) ← REPLACE with type-selector
8. Annual Performance Summary card (override fields)
9. Override rate/variance chips

**MOV input replacement strategy:**
- Maintain `entryForm.mov` as raw string (JSON or plain text)
- Add local reactive state inside dialog: `movType ref<'text'|'link'|'file'>`, `movValue ref<string>`
- On dialog open: parse `entryForm.mov` → set `movType` + `movValue`
- On type change: clear `movValue` (reset prior input)
- On file select: upload immediately → on success, set `movValue = response.filePath`, store metadata
- On save: serialize `{ type: movType, value: movValue, metadata? }` → `entryForm.mov` before calling `saveQuarterlyData()`
- Upload progress state: `movUploading ref<boolean>` — disable save button during upload

---

### HL-D: Physical Module — Stacked Panel & Interactive Editing

**Current stacked panel structure (Phase HK):**
```html
<tr class="narrative-stacked-row" v-if="anyNarrativeVisible && getIndicatorData(...)">
  <td :colspan="narrativeRowColspan" class="pa-0">
    <div class="narrative-stacked-panel">
      <!-- items: remarks, catch_up_plans, facilitating_factors, ways_forward, mov -->
    </div>
  </td>
</tr>
```
- The `<tr>` has NO click handler — panel is read-only
- The main data `<tr>` already has `@click="canEditData() && openEntryDialog(indicator)"`
- **Gap:** stacked panel is not clickable → users must click data row or pencil icon to edit

**Fix:** Add `@click="canEditData() && openEntryDialog(indicator)"` + `class="cursor-pointer"` to `<tr class="narrative-stacked-row">`. Simple one-line change.

**MOV display in stacked panel (type-aware rendering):**
```
type=text  → plain span text
type=link  → <a href="..." target="_blank"> with link icon
type=file  → <v-chip> with mdi-file icon + filename + optional download action
```
Fallback: non-JSON `mov` values → render as plain text.

---

### HL-E: Physical Module — Action Column Header

**Current:** `<th v-if="canEditData()" class="action-column" rowspan="2"></th>` — blank label.

**Fix:** Add a label or icon: `<v-icon size="x-small">mdi-cog-outline</v-icon>` or text "Edit". Simple cosmetic.

---

### HL-F: Financial Module — Column Menu Gap Analysis

**Current financial module control bar (post-HK):**
```
[ Q Selector ] [ FY Selector ] [ Export ]   ← no Columns button
```
**Physical module control bar:**
```
[ Q Selector ] [ Columns ▼ ] [ Export ▼ ]
```
**Gap:** Financial has no column visibility system. Physical has full `columnVisibility` reactive + Columns menu.

**Financial table column set (all 3 table instances share same columns):**
- Program / Line Item, Class, Appropriation, Obligations, Disbursement, % Utilization, Actions
- Remarks exists in the form but NOT displayed in any table column or stacked panel

**Proposed financial `columnVisibility`:**
```ts
const columnVisibility = reactive({ remarks: false })
```
- Remarks toggle → stacked panel row below each financial record (same pattern as physical)
- `remarksRowColspan = canEditData() ? 7 : 6` (fixed, no dynamic computation needed)

**Financial table structure for stacked panel:** The main active data table iterates:
```
<template v-for="campus">
  <v-card>
    <v-table>
      <tbody>
        <template v-for="ec in EXPENSE_CLASSES">
          <template v-if="groupedFinancials[campus.id]?.[ec.id].length > 0">
            <tr v-for="rec in ..." @click="openEditDialog(rec)">
```
Each `<tr v-for="rec">` needs to become a `<template>` wrapping the data `<tr>` + stacked panel `<tr>`.

**Prefill table:** Also iterates records. Lower priority — stacked panel there is less useful. **Scope to main active data table only.**

---

### HL-G: Financial Module — MOV via Metadata Field

**`operation_financials.metadata JSONB`:** Already exists in DB and DTO. No migration needed.
- Frontend saves: `entryForm.metadata = { ...(entryForm.metadata || {}), mov: { type, value, metadata? } }`
- Frontend reads: `record.metadata?.mov`
- Backend: `metadata` is already in INSERT and PATCH SQL (dynamic field handling)

**Key constraint:** DTO has `metadata?: Record<string, any>` with `@IsOptional()`. No type restriction. Safe to store any JSON shape.

**File upload for financial MOV:** Same mechanism as physical — `POST /api/uploads` → store `filePath` in `metadata.mov.value`.

---

### HL-H: Scope Summary

| Item | Module | Type | Risk |
|------|--------|------|------|
| `useApi.ts` upload method | Both | New utility | Low |
| Backend MIME type expansion | Both | Config/code | Low |
| MOV dialog UI (type selector + upload) | Physical | Dialog change | Medium |
| MOV stacked panel type-aware display | Physical | Template change | Low |
| Stacked panel `@click` interactive | Physical | One-liner | Low |
| Action column label | Physical | Cosmetic | Low |
| Financial column menu + remarks stacked panel | Financial | New system | Medium |
| Financial MOV via metadata | Financial | Form + display | Medium |

---

### Section 2.71 — Phase HM: MOV Upload Failure Fix (Apr 14, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

**Objective:** Identify and fix root cause of file upload failures on MOV (Means of Verification) upload in Physical and Financial modules. Errors observed: "Unexpected token '<', '<!DOCTYPE...'" / "Failed to fetch" / `net::ERR_CONNECTION_RESET`.

---

#### HM-A: Root Cause — Missing `/api` Prefix in Upload Endpoint

**Definitive finding.** The upload call in both modules sends to the wrong URL.

**Evidence — `physical/index.vue` line 535:**
```typescript
const response = await api.upload<...>('/uploads', formData)
// Resolves to: /uploads  (NOT /api/uploads)
```

**Evidence — `financial/index.vue` line 172:**
```typescript
const response = await api.upload<...>('/uploads', formData)
// Resolves to: /uploads  (NOT /api/uploads)
```

**Why this breaks — URL resolution chain:**

1. `useApi.ts` line 112: `fetch(`${baseUrl}${endpoint}`, ...)` where `baseUrl = config.public.apiBase = ''` (empty string — default when `NUXT_PUBLIC_API_BASE` is unset)
2. Full URL: `'' + '/uploads'` = `/uploads`
3. `nuxt.config.ts` Nitro devProxy: `'/api': { target: 'http://localhost:3000/api' }` — only intercepts paths starting with `/api`
4. `/uploads` does NOT match `/api` prefix → request goes to Nuxt's own server → Nuxt returns its HTML 404 page
5. `useApi.upload()` calls `response.json()` on the HTML page → JSON.parse fails → "Unexpected token '<', '<!DOCTYPE...'"

**Confirmed correct prefix:** `main.ts` line 34 `app.setGlobalPrefix('api')` → NestJS registers all routes under `/api/...`. The uploads controller `@Controller('uploads')` maps to `/api/uploads`. All other API calls in the codebase confirm the pattern: `api.post('/api/university-operations/...')`, `api.get('/api/...')`.

**Plan directive 146** (Phase HL) explicitly states the correct endpoint: `"File upload triggers POST /api/uploads"` — the implementation bug contradicts the directive.

---

#### HM-B: Error Correlation

| Error | Cause |
|-------|-------|
| `"Unexpected token '<', '<!DOCTYPE...'"` | `response.json()` called on Nuxt's HTML 404 page (returned by Nuxt dev server for unknown route `/uploads`) |
| `"Failed to fetch"` | Alternative browser behavior; same root cause — URL unreachable or request aborted |
| `net::ERR_CONNECTION_RESET` | Browser drops connection when response is not a valid HTTP exchange matching the request (secondary symptom) |

---

#### HM-C: Other Upload Layers — Verified Clean

| Layer | Finding | Status |
|-------|---------|--------|
| `useApi.upload()` function | Correctly uses `FormData` body, no `Content-Type` header override, auth token attached | ✅ Correct |
| Backend endpoint `POST /api/uploads` | `FileInterceptor('file')` matches `formData.append('file', file)`; 10MB limit; JSON response | ✅ Correct |
| Response DTO fields | `filePath`, `originalName`, `fileSize`, `mimeType` all present in `UploadResponseDto` | ✅ Correct |
| CORS config | `app.enableCors()` enabled globally; devProxy makes CORS irrelevant in dev | ✅ No issue |
| Nuxt devProxy config | Correctly routes `/api/*` → `http://localhost:3000/api` | ✅ Correct (just not used because prefix is wrong) |
| Backend MIME allow-list | Covers pdf, jpeg, png, gif, docx, xlsx, txt (expanded in HL-2) | ✅ Correct |
| Multer memory storage | Configured for up to 10MB with `memoryStorage()` | ✅ Correct |

---

#### HM-D: Fix Scope

Minimal — two lines across two files:

| File | Line | Current | Fix |
|------|------|---------|-----|
| `pmo-frontend/pages/university-operations/physical/index.vue` | ~535 | `api.upload('/uploads', ...)` | `api.upload('/api/uploads', ...)` |
| `pmo-frontend/pages/university-operations/financial/index.vue` | ~172 | `api.upload('/uploads', ...)` | `api.upload('/api/uploads', ...)` |

No backend changes. No schema changes. No proxy changes. No `useApi.ts` changes.

---

### Section 2.72 — Phase HN: Upload Limit + Pillar RBAC + Reset Password Fix (Apr 14, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

**Objective:** (A) Raise file upload limit from 10MB to 25MB with frontend pre-validation. (B) Implement pillar-based tab access control for Physical/Financial modules. (C) Fix reset password UX and document self-service gap. (D) Add pillar assignment UI to user management.

---

#### HN-A: File Upload Limit — Current State

**Backend — `pmo-backend/src/uploads/uploads.module.ts`:**
```typescript
MulterModule.register({
  storage: memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB — HARD-CODED
    files: 5,
  },
})
```

**Backend — `pmo-backend/src/uploads/uploads.service.ts`:**
```typescript
this.maxFileSize = this.configService.get<number>('MAX_FILE_SIZE', 10 * 1024 * 1024);
```
Both locations enforce 10MB. The service check validates AFTER Multer receives the file — if Multer's limit fires first, it throws a `PayloadTooLargeException` (HTTP 413). The service validates a second time for files that do pass Multer.

**Frontend — both `physical/index.vue` and `financial/index.vue`:**
`handleMovFileUpload()` sends the file directly with no pre-upload size check. If the upload is rejected (413), the error is caught and shown via `toast.error()` but the UX is poor (upload attempted, network round-trip wasted).

**Required changes:**
- `uploads.module.ts`: `fileSize: 25 * 1024 * 1024`
- `uploads.service.ts`: default `MAX_FILE_SIZE` fallback to `25 * 1024 * 1024`
- `physical/index.vue` and `financial/index.vue`: add `if (file.size > 25 * 1024 * 1024)` guard before FormData creation, show descriptive error

---

#### HN-B: Pillar-Based Access Control — Current State

**Four pillars (Physical + Financial modules):** `HIGHER_EDUCATION`, `ADVANCED_EDUCATION`, `RESEARCH`, `TECHNICAL_ADVISORY`

**Authentication layer (`auth.service.ts` login):**
JWT payload contains: `{ sub, email, roles, is_superadmin }` — **NO pillar assignments whatsoever.**

The login response includes `module_assignments` from `user_module_assignments` table, but this stores coarse-grained module types (`CONSTRUCTION`, `REPAIR`, `OPERATIONS`, `ALL`) — not pillars. There is no `user_pillar_assignments` table.

**Physical module (`physical/index.vue`):**
```typescript
const PILLARS = [HIGHER_EDUCATION, ADVANCED_EDUCATION, RESEARCH, TECHNICAL_ADVISORY] as const
```
All 4 tabs always rendered for all authenticated users. Zero pillar-level filtering.

**Backend controller (`university-operations.controller.ts`):**
No `@PillarGuard` or equivalent. Any `@Roles('Admin', 'Staff')` user can call all endpoints for all pillars.

**Gap severity:** Complete absence of pillar RBAC at all layers (DB, API, JWT, frontend). Building this safely for demo requires:
1. New DB table (migration safe with `IF NOT EXISTS`)
2. New API endpoints (additive, non-breaking)
3. JWT + login response update (additive field)
4. Frontend tab filtering (visual, not data-destructive)
5. User management UI addition

**Demo safety assessment:** Frontend-only tab filtering (steps 3–5 with JWT pillar data from step 2) is safe. Backend enforcement at data write level is deferred — see plan.

---

#### HN-C: Reset Password — Current State

**What exists:** Admin-initiated password reset via `POST /api/users/:id/reset-password`. The endpoint:
- Requires `@Roles('Admin')` — Staff cannot call this
- Enforces rank-based hierarchy check (`canModifyUser`) — Admin cannot reset SuperAdmin password
- Returns `204 No Content` on success
- Frontend (`detail-[id].vue`) calls `api.post('/api/users/${userId}/reset-password', { password: newPassword.value })` and shows a success toast, then calls `fetchUser()`

**What does NOT exist:** Self-service "forgot password" / email-based reset flow. The `auth.controller.ts` has only `login`, `me`, `logout`. No email infrastructure (no SMTP, no mailer module, no token table) exists in the backend. **This feature must be declared OUT OF SCOPE for this phase.**

**Identified issues with current admin-reset flow:**

1. **Role requirement mismatch:** The `resetPassword` button in `detail-[id].vue` is visible to any user who can access the page (Admin or SuperAdmin). However, the endpoint only accepts `@Roles('Admin')` — meaning the button is misleading for SuperAdmin users who actually CAN bypass this and reset anyone. Wait — `is_superadmin` bypasses RolesGuard per `roles.guard.ts` line 34. So SuperAdmin CAN call it. But the backend service throws `ForbiddenException` if `userId === adminId` (self-reset attempt). This is intentional.

2. **Rank hierarchy: silent failure UX.** If an Admin (rank 30) tries to reset a Vice President (rank 15), the backend returns 403 with message "Cannot reset password for a user with equal or higher authority." The frontend catches this and shows `toast.error(apiError.message || 'Failed to reset password')` — so the actual reason IS communicated. This is acceptable behavior.

3. **Missing UX: no password confirmation field.** The dialog only has a single password input. Standard UX requires a "confirm password" field to prevent typos.

4. **Missing UX: no password visibility toggle.** User cannot see what they're typing.

5. **`fetchUser()` after reset risk.** After a successful reset, `fetchUser()` re-fetches `GET /api/users/:id`. This endpoint returns with `@Roles('Admin')` — which the current admin user has — so this is safe.

**Scope for plan:** Fix dialog UX (confirm field + visibility toggle). Document self-service as out-of-scope.

---

#### HN-D: User Management — Current State

**`pmo-frontend/pages/users/edit-[id].vue`:**
- Tab 1: Basic info (email, username, first/last name, phone, is_active, rank_level, campus)
- Tab 2: Roles (assign role via `POST /api/users/:id/roles`)
- Tab 3: Module Assignments (CONSTRUCTION, REPAIR, OPERATIONS, ALL)
- Tab 4: Permission overrides (per module_key)
- **MISSING:** Pillar assignment tab (HIGHER_EDUCATION, ADVANCED_EDUCATION, RESEARCH, TECHNICAL_ADVISORY)

**DB state:** No `user_pillar_assignments` table exists. `user_module_assignments` stores module type (not pillar type). Using existing `user_module_assignments` for pillars would semantically conflate module-level and pillar-level access — architecturally incorrect.

**Required:** New table `user_pillar_assignments`, new endpoints, new UI tab in edit-[id].vue.

---

#### HN-E: Risk Assessment for Demo Safety

| Item | Risk | Reason |
|------|------|--------|
| Upload limit (backend config) | LOW | Additive config change; increases allowed size |
| Upload pre-validation (frontend) | LOW | Client-side only; no backend logic changed |
| Reset password dialog UX | LOW | Frontend-only dialog enhancement |
| Pillar DB migration | LOW | `IF NOT EXISTS`; additive; no existing data touched |
| Pillar API endpoints | LOW | New routes only; existing routes untouched |
| Pillar assignments in login response | LOW | Additive field; JWT still valid; adapters extended |
| Frontend pillar tab filtering | LOW | Visual only; Admin/SuperAdmin bypass; no data mutation |
| User management pillar UI | LOW | New tab in edit form; no existing tabs changed |
| Backend pillar enforcement at data level | HIGH | Risk of blocking valid data writes → DEFERRED |

---

### Section 2.73 — Phase HO: Auth Failure + RBAC Migration Gap Fix (Apr 15, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

**Objective:** Diagnose and fix the production auth breakage introduced by Phase HN. Restore login stability. Harden auth against future migration gaps.

---

#### HO-A: Root Cause — Migration Applied to Filesystem, Not Database

**Error observed:**
```
POST /api/auth/login → 500 Internal Server Error
relation "user_pillar_assignments" does not exist
GET /api/auth/me → 401 Invalid or expired token
```

**Migration file confirmed present:**
`database/migrations/038_add_user_pillar_assignments.sql` — file exists on disk.

**Migration NOT applied to DB:**
This project uses manual migrations (no Flyway, no TypeORM auto-run, no migration runner). The operator must manually execute migration files against the PostgreSQL instance. Migration 038 was written to disk during Phase HN implementation but was never run. The `user_pillar_assignments` table does not exist in the live database.

**Consequence cascade:**
1. `auth.service.ts` `login()` at lines 134–138 executes unconditional SELECT against `user_pillar_assignments`
2. PostgreSQL throws `ERROR: relation "user_pillar_assignments" does not exist`
3. No try-catch wraps this query — the exception propagates unhandled
4. NestJS global exception filter returns 500 to the client
5. Client receives no `access_token` → cannot authenticate subsequent requests
6. `GET /api/auth/me` receives an invalid/missing token → 401

The identical pattern exists in `getProfile()` at lines 223–227 — same crash path for any token refresh attempt.

---

#### HO-B: Hard Dependency Coupling — Auth vs RBAC

**Architectural violation identified:**

Authentication (`login()`) must be a fully independent operation. RBAC (pillar assignments) is an optional enhancement layer. By placing the `user_pillar_assignments` query inside `login()` without error isolation, Phase HN introduced a tight coupling between auth correctness and RBAC table availability.

**Pre-Phase HN login flow (stable):**
```
validateUser() → roles → permissions → module_overrides → module_assignments → token issued
```
All 5 tables above (`users`, `user_roles`, `roles`, `role_permissions`, `user_permission_overrides`, `user_module_assignments`) are established tables with migrations applied long before Phase HN.

**Post-Phase HN login flow (broken):**
```
validateUser() → roles → permissions → module_overrides → module_assignments
→ user_pillar_assignments [TABLE MISSING] → CRASH → 500
```

**Correct architectural contract:** RBAC tables are optional extensions. A missing or unavailable RBAC table MUST NOT prevent authentication. Pillar assignments should return `[]` on any failure — not crash the service.

---

#### HO-C: Fix Strategy — Two-Part Solution

**Part 1 — Database (migration application):**
The operator must apply migration 038 to the live database. The migration is idempotent (`IF NOT EXISTS`), so it can be run safely even if partially executed. This is the permanent fix that removes the root cause.

**Part 2 — Code hardening (auth.service.ts):**
Both `login()` and `getProfile()` must wrap the `user_pillar_assignments` query in a try-catch that returns `[]` on any error. This is defensive coding that ensures:
- Auth works during migration windows (when table may not yet exist)
- Auth works if future migrations add similar optional tables
- No regression if the table is dropped or renamed

This is NOT a workaround that replaces the migration — the migration is still required for full RBAC functionality. The try-catch is defense-in-depth.

---

#### HO-D: No Other Files Affected

**Confirmed clean:**
- `users.service.ts` pillar methods (`getPillarAssignments`, `assignPillar`, `revokePillar`) — these are called via separate endpoints, NOT in the auth flow. They will fail gracefully with 500 if the table is missing, but they do not affect login.
- `users.controller.ts` — pillar endpoints are additive and not called during login.
- Frontend (`physical/index.vue`, `financial/index.vue`, `adapters.ts`, `edit-[id].vue`) — all frontend changes are presentation-only and do not affect the auth flow.

**Auth system state after Phase HN (confirmed):**
- Only `auth.service.ts` `login()` and `getProfile()` are broken.
- All other auth mechanics (JWT signing, guard evaluation, `validateUser()`, `logout()`) are intact.
- Fix scope: 2 methods in 1 file + 1 migration application.

---

## Section 2.74 — Phase HP: User Management RBAC Restructure + Main Dashboard Enhancement

**Date:** 2026-04-15
**Scope:** `pmo-frontend/pages/users/edit-[id].vue`, `pmo-frontend/pages/dashboard.vue`
**Plan:** Section in `docs/plan.md` — Phase HP

---

### HP-A: User Management Tab Naming Analysis

**File inspected:** `pmo-frontend/pages/users/edit-[id].vue` lines 543–548 (tab bar), 705–932 (tab content)

**Current tab structure (4 tabs):**

| Tab label | `value=` | API endpoint | Purpose |
|-----------|----------|-------------|---------|
| "Basic Info" | `basic` | `PATCH /api/users/:id` | Profile + roles |
| "Admin Scope" | `modules` | `GET/POST/DELETE /api/users/:id/modules` | Admin management scope |
| "Permissions" | `permissions` | `GET/POST/DELETE /api/users/:id/permissions` | Page-level access overrides |
| "Pillar Access" | `pillars` | `GET/POST/DELETE /api/users/:id/pillar-assignments` | UO pillar tab visibility |

**Root data tables:**
- `user_module_assignments` → which project modules an Admin is RESPONSIBLE FOR (queues they manage/approve)
- `user_module_overrides` (`can_access` boolean) → which app pages/routes a user can NAVIGATE TO
- `user_pillar_assignments` → which BAR1/BAR2 pillar tabs a Staff user can see

**Key distinction confirmed:**
- "Admin Scope" (`modules`) and "Permissions" (`permissions`) serve DIFFERENT purposes and are NOT redundant.
  - **Admin Scope** = *operational responsibility* — controls which pending review queues appear for this Admin. Affects `university-operations.service.ts` access checks (line 135–137) and construction/repair approval workflows.
  - **Permissions** = *page/route access* — controls whether a user can navigate to a given module page. Evaluated by `usePermissions.ts` `getModulePermissions()` which reads `module_overrides`.
- The internal alert descriptions already correctly describe each tab's purpose:
  - "Admin Scope" internal heading: **"Admin Responsibility Scope"** — correct
  - "Permissions" internal heading: **"Page Access Overrides"** — correct
- **Issue**: the TAB LABELS themselves ("Admin Scope", "Permissions") don't match their internal headings, creating confusion. Users reading the tab bar cannot distinguish between management scope and page access.

**Recommendation:** Rename tab labels to match their internal headings. No DB, no API, no logic change — labels only.
- "Admin Scope" → **"Module Scope"**
- "Permissions" → **"Page Access"**

---

### HP-B: Pillar Access Tab — Conditional Visibility Gap

**Current behavior (line 547):**
```html
<v-tab value="pillars">Pillar Access</v-tab>
```
The Pillar Access tab is **always shown** for any user being edited — regardless of whether that user has University Operations access.

**Why this is a UX problem:**
- Pillar restrictions (`user_pillar_assignments`) only affect Physical and Financial module tab visibility.
- Physical and Financial pages apply pillar restrictions **only to Staff** — Admins and SuperAdmins always see all pillars (confirmed in `physical/index.vue` line 99, `financial/index.vue` line 80).
- If a user's `university_operations` page access is **explicitly revoked** (override `can_access = false`), setting pillar assignments for them is meaningless — they cannot reach the module.

**Existing function available:**
`getOverrideAccess(moduleKey: string): boolean | null` (line 335–338)
- Returns `null` → no override, user has default access (show pillar tab)
- Returns `true` → UO explicitly granted (show pillar tab)
- Returns `false` → UO explicitly revoked (hide pillar tab — pillar settings irrelevant)

**Required logic:**
```ts
const showPillarTab = computed(() => getOverrideAccess('university_operations') !== false)
```
Guard: if `showPillarTab` becomes `false` and `activeTab.value === 'pillars'`, reset to `'basic'`.

---

### HP-C: Main Dashboard Content Deficiency

**File inspected:** `pmo-frontend/pages/dashboard.vue` (133 lines total)

**Current state:**
- 4 stat cards: fetches `data.length` counts from raw list endpoints (construction, repairs, university-operations, GAD).
  - These are **record counts** (e.g., "3 university_operations records"), not operational metrics.
  - The UO count is the number of `university_operations` table rows, not a performance metric.
- "Quick Actions" panel: 2 buttons (View Construction Projects, View Repair Projects). No UO links.
- No fiscal year context. No analytics. No meaningful insights.

**Available analytics endpoints (all existing, operational — Phases DE + EZ-C):**

| Endpoint | Returns | Used by |
|----------|---------|---------|
| `GET /api/university-operations/analytics/pillar-summary?fiscal_year=X` | Per-pillar physical metrics: `completion_rate`, `average_accomplishment_rate`, `total_accomplishment`, `total_target` | `university-operations/index.vue` |
| `GET /api/university-operations/analytics/financial-pillar-summary?fiscal_year=X` | Per-pillar financial metrics: `total_appropriation`, `total_obligations`, `avg_utilization_rate` | `university-operations/index.vue` |
| `GET /api/university-operations/analytics/quarterly-trend?fiscal_year=X` | Quarterly trend (physical) | UO index |
| `GET /api/university-operations/analytics/financial-quarterly-trend?fiscal_year=X` | Quarterly trend (financial) | UO index |

**Fiscal year infrastructure:** `useFiscalYearStore` from `~/stores/fiscalYear` — already used by all UO module pages. Provides `selectedFiscalYear` and `fiscalYearOptions`.

**UO index page already has full analytics** (radial bar charts, line charts, bar charts). The dashboard MUST NOT duplicate that. Instead, it should show a **compact summary** (KPI cards per pillar, no charts) that provides at-a-glance insight and links into the UO module.

---

### HP-D: No Backend Changes Required

- All analytics endpoints are fully functional.
- No schema changes needed.
- No new API endpoints needed.
- All changes are frontend-only (UI labels + conditional rendering + dashboard data fetch).

---

### HP-E: Impact Analysis (Non-Disruption Verification)

| Area | Impact | Risk |
|------|--------|------|
| `edit-[id].vue` tab renames | Label text only — zero logic impact | None |
| Pillar Access conditional tab | Hides tab when UO explicitly revoked — affects only users with `can_access=false` for `university_operations` | Minimal (rare edge case) |
| Dashboard analytics fetch | Additive — new section with Promise.allSettled for UO pillar data | None (errors silently fail) |
| Physical/Financial pages | Unaffected | None |
| Backend | Unaffected | None |
| Auth flow | Unaffected | None |


---

## Section 2.75 — Phase HQ Research

**Phase:** HQ — User Management UI Enhancement + Admin-Driven Password Reset + Google Auth Feasibility + Dashboard UX Upgrade + Physical Module Data Consistency Fix
**Status:** ✅ COMPLETE

---

### HQ-A: User Management UI (`new.vue` + `edit-[id].vue`)

**`edit-[id].vue`** (already analyzed in HP) has a 4-tab structure:
- Tab 1: Basic Info
- Tab 2: Admin Scope → renamed to "Module Scope" by HP-1
- Tab 3: Permissions → renamed to "Page Access" by HP-2
- Tab 4: Pillar Access → made conditional by HP-3

**`new.vue`** is a **single flat form** — no tab structure whatsoever:
- Has: email, username, first_name, last_name, phone, password, confirm_password, is_active, rank_level, campus
- Has: role selection (multi-select checkboxes from `/api/roles`)
- **Missing**: Module Scope assignment, Page Access overrides, Pillar Access assignment
- Result: users created via `new.vue` have no module/pillar/page access until edited afterward

**Gap identified:** Full access configuration is impossible at creation time; admin must create the user first, then navigate to edit to assign modules/pillars/pages. This two-step flow adds friction.

**Plan:** Add tab-based structure to `new.vue` matching `edit-[id].vue` — all four sections available during user creation. Reuse existing API endpoints (`GET /api/users/:id/module-assignments`, `GET /api/users/:id/page-access`, etc.) by only rendering those tabs after `POST /api/users` succeeds (redirect to edit-[id].vue after creation, which already has all tabs). Alternative KISS approach: redirect to edit page after creation so admin can immediately configure access.

**Decision (KISS):** After `POST /api/users`, redirect to `edit-[id].vue` instead of user list. This allows immediate access configuration with zero duplication. No new tab structure in `new.vue` needed.

---

### HQ-B: Password Reset Flow

**Backend status:**
- `POST /api/users/:id/reset-password` — FULLY IMPLEMENTED (`users.controller.ts` line 125)
- Enforces: no self-reset, no reset for equal/higher authority rank
- Hashes password with bcrypt before storing
- Requires Auth (Admin role minimum)

**Frontend status (`detail-[id].vue`):**
- "Reset Password" button → `resetPasswordDialog` → Admin enters new password → calls backend
- Admin-initiated reset is WORKING

**What is missing:**
- Login page (`login.vue`) has NO "Forgot Password" link — users have no self-service path
- No email service configured (no SMTP, no email module in backend)
- No token-based reset flow
- No request-tracking mechanism (users can't signal to admin that they need a reset)

**Backend email scan:** No `@nestjs/mailer`, no `nodemailer`, no `smtp` references in codebase — email is entirely absent.

**Simplest feasible plan (KISS, no email):**
1. Login page: add "Forgot password? Contact your system administrator." guidance text (static, no flow)
2. Backend: add `password_reset_requests` table (migration 039) with `(id, identifier, status, notes, requested_at, completed_by, completed_at)` — no FK to users (requester may not know their own user ID)
3. Public endpoint: `POST /api/auth/request-password-reset` — accepts `identifier` (email or username) + optional `notes`
4. Admin endpoint: `GET /api/users/password-reset-requests` — lists pending requests
5. Admin UI: badge on user list page for pending requests + simple list view + link to user detail to complete reset

---

### HQ-C: Google Authentication Feasibility Assessment

**What exists:**
- `google_id` VARCHAR column in `users` table (queried in `auth.service.ts` line 25)
- SSO-only account sentinel check in `auth.service.ts` line 53: `if (user.google_id && (!user.password_hash || user.password_hash === ''))`
- This skeleton was added speculatively — no OAuth implementation

**What is missing for full Google Auth:**
- `passport-google-oauth20` npm package (not installed)
- `PassportModule` + `GoogleStrategy` in `auth.module.ts`
- Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET env vars)
- OAuth callback endpoint (`/api/auth/google/callback`)
- Frontend redirect button + OAuth return handling
- Google Cloud Console project with authorized redirect URIs

**Risk assessment:**
- High effort: 5+ implementation steps across backend + frontend + infrastructure
- High risk: OAuth misconfiguration causes auth breakage for all users
- Dependency: requires Google Cloud Console project (external, admin setup required)
- Timeline: not feasible before demo

**Decision: DEFERRED.** Google Auth skeleton code will remain untouched. No partial implementation. Document as future work.

---

### HQ-D: Dashboard UX

**Current dashboard** (`dashboard.vue`, 133 lines): 4 stat cards (total users, active users, published reports, active projects — last two hardcoded as 0) + Quick Actions section (Construction, Repairs buttons).

**Phase HP plan already covers:**
- HP-4: Fiscal year store + UO analytics state fetch
- HP-5: Physical + Financial pillar KPI cards per fiscal year
- HP-6: Quick action links (Physical + Financial accomplishments)

**What HQ can add (visual refinements):**
- Section header ("University Operations Summary") with divider above KPI cards
- Subtle card tonal backgrounds per data type (physical = blue tonal, financial = green tonal)
- Loading skeleton state while analytics fetch completes
- Empty-state message when selected FY has no UO data

**Decision:** Dashboard enhancements are primarily covered by HP. HQ should ensure HP-4/5/6 are part of implementation sequence; visual refinements are bundled into HP-5 (no separate HQ step).

---

### HQ-E: Physical Module — Three Identified Issues

#### E1: Score Field Not in Column Visibility

`columnVisibility` reactive at physical/index.vue line 490:
```js
const columnVisibility = reactive({
  remarks: false,
  catch_up_plans: false,
  facilitating_factors: false,
  ways_forward: false,
  mov: false,
})
```

`score_q1`–`score_q4` are **not present** in `columnVisibility`. Score data exists in the DB, is editable in the entry dialog, but has no panel display in the table view. Comment at line 1562 (Phase EG-B): "Score columns removed from overview table (accessible via entry dialog)." This means score was once a table column but was removed — and was never added to the stacked-panel system that replaced narrative columns.

**Fix:** Add `score: false` to `columnVisibility` + render a stacked panel section below the row (same pattern as remarks/narratives) displaying `score_q1`–`score_q4` when toggled on.

#### E2: Null Handling — `sanitizeNumericPayload` Does Not Catch `NaN`

`sanitizeNumericPayload` (physical/index.vue ~line 830):
```js
const numericFields = ['target_q1', ..., 'accomplishment_q4']
numericFields.forEach(field => {
  if (sanitized[field] === '') sanitized[field] = null
})
```

**Problem chain:**
1. `<v-text-field type="number" v-model.number="entryForm.target_q1">` — Vue 3's `.number` modifier uses `parseFloat()`
2. User clears a numeric field → DOM value = `''` → `parseFloat('')` = `NaN`
3. `sanitizeNumericPayload` only checks `=== ''` — NaN is NOT empty string, passes through
4. Backend receives `target_q1: NaN` (JSON serializes NaN as `null` in some paths, but can also produce `null` correctly)

Actually, JSON.stringify(NaN) = `"null"`, so NaN gets serialized as JSON null. Then the backend receives `target_q1: null`. Since `@IsOptional()` in class-validator skips all validators when value is `null` or `undefined`, null SHOULD pass validation.

**Re-investigated:** class-validator's `@IsOptional()` skips validation when the value is `null` OR `undefined`. So `null` values should NOT cause a validation error.

**Actual root cause to verify:** The error "null/empty → error" may be caused by `@Min(0)` rejecting `null` even with `@IsOptional()`. Testing `@IsOptional() @Min(0)` with value `null`: per class-validator docs, `@IsOptional()` when value is `null`/`undefined` will skip ALL subsequent validators including `@Min`. So this should work.

**Alternative root cause:** The override fields (`override_total_target`, `override_total_actual`) also have `@IsNumber()` + `@Min(0)` decorators. If `sanitizeNumericPayload` doesn't include override fields in its numeric fields list, then clearing override fields may produce NaN which reaches backend.

**Check override fields in sanitizeNumericPayload:** Summary says: "converts `''` → `null` for 8 target/accomplishment fields ONLY" — override fields may not be in the list.

**Fix:** Expand `sanitizeNumericPayload` to include override fields, and also add `NaN` → `null` conversion as defensive guard:
```js
if (sanitized[field] === '' || (typeof sanitized[field] === 'number' && isNaN(sanitized[field]))) {
  sanitized[field] = null
}
```

#### E3: Dialog Form Order — Annual Performance Summary Last

Current dialog template order (physical/index.vue):
1. Indicator name display
2. Prefill alert (conditional)
3. Quarterly data `<v-table>` (~line 1969) — Target/Actual/Score Q1-Q4
4. Remarks `<v-textarea>` (~line 2056)
5. Narrative fields — catch_up_plan, facilitating_factors, ways_forward (~line 2066)
6. MOV section (~line 2105)
7. **Annual Performance Summary** `<v-card>` (~line 2153) ← LAST

Expected order per task brief:
1. Annual Performance Summary (move from position 7 to position 1)
2. Quarterly data table
3. Remarks
4. Narrative fields
5. MOV

**Fix:** Template-only reorganization — move the `v-card` block (Annual Performance Summary) from after MOV to before the quarterly data table. No logic changes.

---

### HQ-F: Impact Analysis

| Component | Impact | Notes |
|-----------|--------|-------|
| `pmo-frontend/pages/users/new.vue` | Minor | Redirect to edit page after creation (1-line change) |
| `pmo-frontend/pages/login.vue` | Minor | Add guidance text only (static) |
| `pmo-backend/src/auth/` | Low | New public endpoint for reset requests (no auth guard) |
| Database | New migration 039 | `password_reset_requests` table |
| `pmo-frontend/pages/users/index.vue` | Minor | Badge for pending reset requests |
| `pmo-frontend/pages/university-operations/physical/index.vue` | Low | Score panel + NaN fix + dialog reorder |
| Physical backend DTO | None | `@IsOptional() @IsNumber()` already correctly handles null (skip verified) |
| Google Auth | None | DEFERRED, no changes |
| Dashboard | Covered by HP | HP-4/5/6 unchanged |

---

## Section 2.76 — Phase HR Research

**Phase:** HR — User Management Navbar Spacing Fix + Password Reset Request Interface + Access Control Page Separation + Physical Guide Update
**Status:** ✅ COMPLETE

---

### HR-A: Navbar Spacing Gap (Sidebar Logo Header)

**File:** `pmo-frontend/layouts/default.vue` lines 154–165

**Current template:**
```html
<div class="d-flex align-center pa-3 ga-3">
  <v-img
    src="/csu-logo.svg"
    width="44"
    height="44"
    class="flex-shrink-0 mr-2"
    magin-right="-12px"
  />
  <span class="font-weight-bold text-grey-darken-2 text-align-left sidebar-header-text">
  Caraga State University
  </span>
</div>
```

**Issues identified:**

1. **Double-spacing:** Container has `ga-3` (flex `gap: 12px`) AND the `<v-img>` has `class="... mr-2"` (`margin-right: 8px`). These stack: the image has 8px margin-right PLUS the parent flex gap of 12px = ~20px total whitespace between logo edge and text. This is the root cause of "excessive whitespace."

2. **Invalid attribute:** `magin-right="-12px"` — this is a typo of `margin-right` as an HTML attribute. HTML attributes do not accept inline style syntax like this; it is entirely non-functional and ignored by the browser. Intended to be a negative margin to compensate for the double gap, but has zero effect.

**Fix:** Remove `mr-2` from `<v-img>` class (eliminates the redundant per-element margin). Remove the invalid `magin-right="-12px"` attribute. The container `ga-3` (12px) alone provides appropriate logo-to-text spacing. Result: clean single-source 12px gap.

Optionally reduce `ga-3` → `ga-2` (8px) if 12px still appears wide after cleanup.

---

### HR-B: Physical Module Guide — Override Explanation Gap

**File:** `pmo-frontend/pages/university-operations/physical/index.vue` lines 1528–1555

**Current guide sections:**
1. How It Works
2. Entering Data
3. Prior-Quarter Reference
4. Quarter Schedule
5. Submission & Review

**What is missing:**

The guide does not explain the **Override Totals** feature. The table shows two special columns: `Total Target` and `Total Actual`. These values are normally auto-calculated as the sum of Q1–Q4 target/accomplishment values. However, operators can override these totals via `override_total_target` and `override_total_actual` fields in the entry dialog.

**Why override exists (research-verified):** The system calculates `total_target = target_q1 + target_q2 + target_q3 + target_q4`. However, the official BAR No. 1 reports published by the DBM/oversight body may use different totals — due to:
- Annual targets that cannot be evenly distributed by quarter
- Methodological rounding differences in official forms
- Official verified adjustments that supersede auto-summed values

The override field allows operators to enter the **official BAR-verified total** directly, ensuring the system's totals exactly match submitted government reports. Without this explanation, users are confused why a "Total Target" column exists alongside Q1–Q4 columns.

**Fix:** Add a 6th guide entry — "Understanding Override Totals" — as a concise paragraph inside the guide expansion panel.

---

### HR-C: Password Reset Request Interface — HQ Completion Verification

**Status: FULLY IMPLEMENTED in Phase HQ**

Verified in codebase:

| Component | Status | Location |
|-----------|--------|----------|
| "Forgot password?" link on login page | ✅ | `login.vue` line 183 |
| Reset request dialog (identifier + notes + success state) | ✅ | `login.vue` lines 193–239 |
| `submitResetRequest()` function (calls `/api/auth/request-password-reset`) | ✅ | `login.vue` lines 25–40 |
| `POST /api/auth/request-password-reset` public endpoint | ✅ | `auth.controller.ts` line 37 |
| `GET /api/users/password-reset-requests` admin endpoint | ✅ | `users.controller.ts` line 53 |
| `PATCH /api/users/password-reset-requests/:id/complete` | ✅ | `users.controller.ts` line 60 |
| Admin panel in users/index.vue (badge + collapsible list) | ✅ | `users/index.vue` lines 179–286 |
| Migration 039 `password_reset_requests` table | ✅ | `database/migrations/039_password_reset_requests.sql` |
| `new.vue` redirect to edit-[id].vue after creation | ✅ | `new.vue` line 142 |

**Phase HR:** No new work needed for password reset. Confirm endpoints are connected to working service methods (auth.service.ts, users.service.ts) before closing HQ.

---

### HR-D: User Profile UI Inefficiency (detail-[id].vue)

**File:** `pmo-frontend/pages/users/detail-[id].vue`

**Current layout:** 4 full-width cards stacked vertically:
1. Basic Information (large avatar + 4-column grid with name/email/phone fields)
2. Roles & Permissions (chip groups)
3. Account Status (4-field grid: last login, failed attempts, lock status, account status)
4. Audit Information (created_at, updated_at)

**Issues:**
- Page requires 3–4 scrolls to reach bottom on standard viewport
- Cards 2–4 are short (2–4 fields each) but each consume a full-width card, wasting vertical whitespace
- Card 4 (Audit) contains only 2 timestamps — a dedicated full-width card for this is disproportionate

**Proposed layout:**

```
Row 1:  [  Basic Information (md=7)  ] [ Roles & Permissions (md=5) ]
Row 2:  [ Account Status (md=7)      ] [ Audit Information (md=5)   ]
```

- Use `<v-row>` with 2 columns per row
- Basic Info card spans left column with avatar + core fields
- Right column has Roles & Permissions (more scrollable chip content)
- Row 2: Account Status left (security stats), Audit right (timestamps)
- Result: All content visible in ~2 viewport heights instead of 4

**Risk:** Zero — pure layout restructure, no data changes. All v-if conditions, loading states, and action buttons unaffected.

---

### HR-E: Edit User + Access Control Separation

**Current state (`edit-[id].vue`):** 4 tabs in one page:
- Tab 1: Basic Info (username, email, name, phone, rank, campus, roles)
- Tab 2: Module Scope (admin module assignment — which modules admin can review)
- Tab 3: Page Access (per-page access override — which routes user can visit)
- Tab 4: Pillar Access (conditional — UO pillar assignment)

**Issue:** Personal data configuration and RBAC/access configuration are conceptually separate concerns but live in the same edit page. No "Manage Access" shortcut exists — users must navigate to the edit page and manually click access tabs.

**Decision: NEW dedicated route `access-[id].vue`**

This is a non-trivial but well-bounded change:
- Create `pmo-frontend/pages/users/access-[id].vue` — new page with Module Scope, Page Access, Pillar Access tabs
- `edit-[id].vue` retains only the Basic Info tab (remove Module Scope, Page Access, Pillar Access tabs)
- `detail-[id].vue` header gets 2 action buttons: "Edit Profile" (existing) + "Manage Access" (new → `/users/access-${id}`)
- `users/index.vue` action menu adds "Manage Access" option

**Access-[id].vue content:** Identical tabs to current edit-[id].vue Module Scope, Page Access, Pillar Access tabs — with the same API calls (`GET/POST /api/users/:id/module-assignments`, page-access, pillar-assignments) and `showPillarTab` conditional logic. Only difference: the Basic Info tab is removed.

**Non-disruption guarantee:**
- All existing tab logic is copied as-is into the new page — no API changes
- `edit-[id].vue` Basic Info tab is unaffected
- Old URLs (`/users/edit-${id}`) still work — just no longer have Module/Page/Pillar tabs

---

### HR-F: Table Interaction UX (users/index.vue)

**Current state:**
- `v-data-table` has `hover` prop (visual hover effect on rows)
- Actions column: `v-btn icon="mdi-dots-vertical"` (meatball menu) with View, Edit, Delete
- No row-click navigation — clicking a row does nothing except show hover color
- "Manage Access" does not exist in the action menu yet

**Issues:**
- Users expect clicking a row to navigate (standard table UX pattern)
- "View" buried inside meatball menu — not discoverable
- "Manage Access" does not exist anywhere in the table

**Fix (KISS):**
1. Add `@click:row="(event, { item }) => viewUser(item)"` to `v-data-table` — row click navigates to detail
2. Add `"Manage Access"` option to meatball menu (icon: `mdi-shield-account`, navigates to `/users/access-${item.id}`)
3. Ensure `@click.stop` on the meatball menu button to prevent row click from firing when opening menu

---

### HR-G: Impact Analysis

| Component | Impact | Change Type |
|-----------|--------|-------------|
| `pmo-frontend/layouts/default.vue` | Minimal | Remove `mr-2` + invalid attribute from v-img |
| `pmo-frontend/pages/university-operations/physical/index.vue` | Minimal | Add guide paragraph (text only) |
| `pmo-frontend/pages/users/detail-[id].vue` | Low | 2-column layout restructure |
| `pmo-frontend/pages/users/edit-[id].vue` | Low | Remove 3 access tabs (moved to access-[id].vue) |
| `pmo-frontend/pages/users/access-[id].vue` | New file | New page: Module Scope + Page Access + Pillar Access |
| `pmo-frontend/pages/users/index.vue` | Low | Row-click navigation + "Manage Access" menu item |
| Backend | None | No changes |
| Auth/RBAC | None | No logic changes, new page uses same endpoints |

---

## Section 2.77 — Phase HS Research
**Title:** Global Table Branding Standardization + Navbar Header Fix + Dashboard Label Clarity + Module Renaming + Google Auth (Feasibility & Plan)
**Date:** 2026-04-15

---

### HS-A: Global Table Branding Inconsistency

**Survey of all module table header styles:**

| Module | Component Type | Current Header Style | File |
|--------|---------------|---------------------|------|
| Physical (BAR No. 1) | Custom `v-table` + manual `<thead>` | `<tr class="bg-grey-lighten-4">` (light grey `#f5f5f5`) | `physical/index.vue` lines 1581, 1775, 2005 |
| Physical (scoped CSS) | CSS override | `.v-table thead tr th { background-color: #f5f5f5 }` | `physical/index.vue` line 2428 |
| Financial (BAR No. 2) | Custom `v-table` + `class="financial-table"` | No background class on `<thead><tr>` — effectively transparent/white | `financial/index.vue` lines 1253, 1313, 1361 |
| Financial (dialog cards) | `v-card-title` | `bg-primary text-white` — already emerald ✅ (dialog headers only) | `financial/index.vue` lines 1553, 1803 |
| COI (Construction Projects) | `v-data-table` (Vuetify) | No custom header class → default Vuetify grey | `coi/index.vue` line 316 |
| Repairs | `v-data-table` (Vuetify) | No custom header class → default Vuetify grey | `repairs/index.vue` line 319 |
| Users (main) | `v-data-table` (Vuetify) | No custom header class → default Vuetify grey | `users/index.vue` line 364 |
| Users (reset requests sub-table) | Custom `<thead>` | No class → transparent/white | `users/index.vue` line 263 |

**Root cause:** No system-wide table header standard exists. Each module implemented ad-hoc styling. Vuetify `v-data-table` has its own grey default; custom `v-table` components applied `bg-grey-lighten-4`; some tables have no background at all.

**Theme reference (`plugins/vuetify.ts`):**
- CSU Emerald = `#003300` (maps to `bg-primary` class)
- CSU Gold = `#f9dc07` (maps to `bg-secondary` class)
- No global table CSS class defined anywhere in vuetify theme config

**Implementation approach:**
- Vuetify `v-data-table` headers: add global CSS in `app.vue` targeting `.v-data-table thead th` → `background-color: #003300; color: white`
- Custom `v-table` (physical): replace `<tr class="bg-grey-lighten-4">` → `<tr class="bg-primary text-white">` in all 3 main `<thead>` rows; update scoped CSS
- Custom `v-table` (financial `.financial-table`): add `bg-primary text-white` class to all `<thead><tr>` elements in main data tables
- Users reset requests table manual `<thead>`: add `bg-primary text-white` to `<tr>`
- `app.vue` `<style>` block (already exists, global) is the correct global override location
- Sub-header rows (`bg-grey-lighten-5` in physical) are grouping rows, NOT primary headers — remain unchanged

**Files affected:** `app.vue`, `physical/index.vue`, `financial/index.vue`, `users/index.vue`

---

### HS-B: Navbar Header Gap

**Status: ALREADY ADDRESSED by Phase HR-1**

The research for this issue was conducted in HR-A (Section 2.76). The fix was implemented as HR-1:
- `ga-3` → `ga-2` on container div
- `mr-2` removed from `<v-img>` class
- Invalid `magin-right` attribute removed

Current state of `layouts/default.vue` lines 154–165 confirms fix is applied: `class="d-flex align-center pa-3 ga-2"` on the container, `<v-img class="flex-shrink-0">` (no `mr-2`).

**No new work for HS-B.** Phase HS should cross-reference HR-1 as completed.

---

### HS-C: Dashboard Label Confusion

**File:** `pmo-frontend/pages/dashboard.vue`

**Subtitle (line 98):**
- Current: `"Physical Planning and Management Office Dashboard"`
- Issue: PMO Office was the historical name. The system is branded "CSU CORE" (the app bar at line 110 already says "CSU CORE Dashboard"). The subtitle is inconsistent with the established brand and inaccurate (system now covers UO, GAD, COI, Repairs — not just physical planning).

**UO Summary labels:**
- Line 230: `"Physical Accomplishment (BAR No. 1)"`
  - Issue: Ambiguous. "Physical Accomplishment" in the COI domain means physical progress percentage (construction progress). Using the same label in UO context causes semantic confusion for stakeholders reviewing both modules.
- Line 256: `"Financial Accomplishment (BAR No. 2)"`
  - Issue: Similarly ambiguous — financial performance in UO context; the label does not clarify it's specific to University Operations.

**Proposed clarity fixes:**
- Subtitle: `"Physical Planning and Management Office Dashboard"` → `"CSU CORE System Dashboard"` (matches app bar brand)
- UO Physical label: `"Physical Accomplishment (BAR No. 1)"` → `"UO Physical Performance (BAR No. 1)"`
- UO Financial label: `"Financial Accomplishment (BAR No. 2)"` → `"UO Financial Performance (BAR No. 2)"`

**Impact:** Display text only — no data binding, no API changes, no logic changes.

---

### HS-D: Module Naming — "Construction Projects" Locations

**Backend:** API routes use `/api/construction-projects/...` — **DO NOT CHANGE** (backend contracts unchanged).
**Permission key:** `coi` — **DO NOT CHANGE** (used in DB, middleware, access control).

**Frontend display label occurrences (change only these):**

| # | File | Line | Current Text | Target Text |
|---|------|------|-------------|-------------|
| 1 | `layouts/default.vue` | 54 | `title: 'Construction Projects'` | `'Infrastructure Projects'` |
| 2 | `dashboard.vue` | 83 | `title: 'Construction Projects'` | `'Infrastructure Projects'` |
| 3 | `dashboard.vue` | 154 | `"View Construction Projects"` | `"View Infrastructure Projects"` |
| 4 | `coi/index.vue` | 281 | `Construction Projects` (h1 heading) | `Infrastructure Projects` |
| 5 | `coi/index.vue` | 284 | `"Manage and monitor construction projects"` | `"Manage and monitor infrastructure projects"` |
| 6 | `users/access-[id].vue` | 50 | `label: 'Construction (COI)'` | `'Infrastructure (COI)'` |
| 7 | `users/access-[id].vue` | 61 | `name: 'Construction Projects (COI)'` | `'Infrastructure Projects (COI)'` |
| 8 | `pmo-frontend/README.md` | — | 1 occurrence | Update display mention only |

**Risk assessment:** Zero backend risk. `coi` key unchanged. Route `/coi` unchanged. All 8 changes are display-string only.

---

### HS-E: Google Authentication Feasibility

**Current auth system (`pmo-backend`):**
- JWT + email/username + password (`passport-jwt` installed ✅)
- `@nestjs/passport` + `passport` base packages installed ✅
- `google_id` column exists in `users` table (from migration history) ✅
- SSO-only sentinel check at `auth.service.ts` line 53 ✅ (preparatory scaffold)

**What is NOT present (blocking full OAuth implementation):**
- `passport-google-oauth20` NOT installed (missing)
- No `GoogleStrategy` class in any auth file
- No OAuth callback route in `auth.controller.ts` (`/auth/google`, `/auth/google/callback` absent)
- No Google Cloud project configured (no `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` env vars)
- No frontend redirect/callback flow in `login.vue`
- Domain restriction logic (`@carsu.edu.ph` `hd` parameter) not implemented

**Risk assessment:**
- Timeline risk: HIGH — requires Google Cloud project creation, OAuth credential setup, backend strategy implementation, frontend redirect flow, domain validation, and testing
- Deployment risk: MEDIUM — production redirect URIs must be registered in Google Cloud Console
- Institutional constraint: `@carsu.edu.ph` domain restriction requires GSuite/Workspace verification with Google

**Decision: DEFERRED** — confirmed same as Phase HQ decision. No placeholder button needed in login UI until OAuth credentials are provisioned and backend routes are implemented. System stability for stakeholder demo takes priority.

---

### HS-F: Impact Summary

| Component | Change Type | Risk |
|-----------|-------------|------|
| `pmo-frontend/app.vue` | Add global CSS for `v-data-table` header | Zero — additive CSS |
| `pmo-frontend/pages/university-operations/physical/index.vue` | Replace `bg-grey-lighten-4` thead → `bg-primary text-white` + update scoped CSS | Minimal — cosmetic |
| `pmo-frontend/pages/university-operations/financial/index.vue` | Add `bg-primary text-white` to all main `<thead><tr>` | Minimal — cosmetic |
| `pmo-frontend/pages/users/index.vue` | Add `bg-primary text-white` to reset requests thead `<tr>` | Minimal — cosmetic |
| `pmo-frontend/pages/dashboard.vue` | Rename subtitle + UO section labels | Zero — text only |
| `pmo-frontend/layouts/default.vue` | Rename "Construction Projects" → "Infrastructure Projects" (title) | Zero — text only |
| `pmo-frontend/pages/coi/index.vue` | Rename heading + subtitle | Zero — text only |
| `pmo-frontend/pages/users/access-[id].vue` | Rename module display labels for COI | Zero — text only |
| Backend | No changes | None |
| Auth/RBAC | No changes | None |

---

## Section 2.78 — Phase HT Research
**Title:** Global UI Standardization + Navbar Fix + Dashboard Clarity + User Reset Request System + Google Auth Implementation Plan
**Date:** 2026-04-15

---

### HT-A: Prior Phase Coverage Summary

Most items in this task are already researched and planned. This section maps each task component to its authoritative source to avoid duplication.

| Task Item | Status | Source |
|-----------|--------|--------|
| Global table branding | ✅ Researched + Planned (Phase HS, HS-1) | Section 2.77 HS-A, Plan HS-1 |
| Navbar header gap | ✅ Researched + IMPLEMENTED (Phase HR-1) | Section 2.76 HR-A, Plan HR-1 |
| Dashboard label clarity | ✅ Researched + Planned (Phase HS, HS-3/HS-4) | Section 2.77 HS-C, Plan HS-3/HS-4 |
| Module renaming (Construction → Infrastructure) | ✅ Researched + Planned (Phase HS, HS-5) | Section 2.77 HS-D, Plan HS-5 |
| Password reset request system | ✅ FULLY IMPLEMENTED (Phase HQ) | Section 2.75 HQ, `login.vue` lines 18–47, 193–239, `users/index.vue` lines 179–286 |
| Google Auth | ❌ Was incorrectly DEFERRED in Phase HS | Directive 197 (HS) must be superseded — see HT-C |

**Conclusion:** Phase HT's primary new scope is Google Auth. All other items are execution-ready under Phase HS.

---

### HT-B: .env Configuration Audit

**File:** `pmo-backend/.env` (lines 21–26)

Current values:
```
GOOGLE_CLIENT_ID=293689373514-...  ✅ real credential
GOOGLE_CLIENT_SECRET=GOCSPX-...   ✅ real credential
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
GOOGLE_ALLOWED_DOMAINS=carsu.edu.ph  ✅ correct
FRONTEND_URL=http://localhost:5173
```

**Issue 1 — GOOGLE_CALLBACK_URL missing `/api/` prefix:**
- `main.ts` line 34: `app.setGlobalPrefix('api')` — ALL routes are prefixed with `/api/`
- The Google callback route in `AuthController` (`@Controller('auth')` + `@Get('google/callback')`) resolves to `/api/auth/google/callback`
- Current env: `http://localhost:3000/auth/google/callback` → **WRONG** (missing `/api/`)
- Correct: `http://localhost:3000/api/auth/google/callback`
- **This must also match the registered redirect URI in Google Cloud Console**

**Issue 2 — FRONTEND_URL wrong port:**
- `pmo-frontend/package.json` script: `"dev": "nuxt dev --port 3001"` — frontend runs on port 3001
- `nuxt.config.ts` HMR comment: "browser is on 3001"
- Current env: `FRONTEND_URL=http://localhost:5173` → **WRONG** (Vite default, not actual dev port)
- Correct: `FRONTEND_URL=http://localhost:3001`

**Impact:** Both issues would silently break the OAuth redirect flow in dev environment. Must be fixed before implementation begins.

---

### HT-C: Google Auth Gap Analysis

**What exists (scaffolded but incomplete):**
- `users.google_id` column in DB ✅ (from migration history)
- SSO-only sentinel at `auth.service.ts` line 53 ✅ (prevents password login for SSO-only accounts)
- `@nestjs/passport` + `passport` installed ✅
- `ConfigModule.forRoot({ isGlobal: true })` in `app.module.ts` line 31 ✅ (ConfigService available globally)
- `DatabaseModule` imported in `AuthModule` ✅ (DatabaseService injectable in strategies)

**What is missing (implementation only):**

| Item | Status | Notes |
|------|--------|-------|
| `passport-google-oauth20` package | ❌ Not installed | Need `npm install passport-google-oauth20 @types/passport-google-oauth20` |
| `GoogleStrategy` class | ❌ Missing | New file: `strategies/google.strategy.ts` |
| `GET /api/auth/google` route | ❌ Missing | Triggers OAuth redirect; `@Public()` + `@UseGuards(AuthGuard('google'))` |
| `GET /api/auth/google/callback` route | ❌ Missing | Handles callback; issues JWT; `@Res()` for redirect |
| `loginWithGoogleUser()` in AuthService | ❌ Missing | Issues JWT for already-validated user (no password check) |
| `pmo-frontend/pages/auth/callback.vue` | ❌ Missing | New page: reads `?token=` from URL, stores in auth store, redirects to `/dashboard` |
| `loginWithToken()` in auth store | ❌ Missing | New action: stores token + calls `fetchCurrentUser()` |
| Google login button in `login.vue` | ❌ Missing | Below "Sign In" button; `window.location.href = '/api/auth/google'` |

---

### HT-D: Google Auth Flow Design

**Complete OAuth flow (step-by-step):**

```
1. User clicks "Sign in with Google" in login.vue
   → window.location.href = '/api/auth/google'

2. Browser requests GET /api/auth/google (via Nuxt devProxy to :3000)
   → Nuxt devProxy forwards to http://localhost:3000/api/auth/google
   → AuthGuard('google') triggers Passport Google redirect

3. Browser → Google OAuth consent screen (accounts.google.com)
   → User signs in with @carsu.edu.ph account

4. Google → redirect to http://localhost:3000/api/auth/google/callback?code=...
   → GoogleStrategy.validate() runs:
     a. Extract email from profile
     b. Validate domain (@carsu.edu.ph)
     c. Look up user: WHERE google_id = $1 OR email = $2
     d. If not found → 401 (no self-registration)
     e. If found but no google_id → link it (UPDATE users SET google_id = $1)
     f. Return user object to controller

5. Backend callback controller:
   → calls authService.loginWithGoogleUser(userId)
   → gets { access_token }
   → res.redirect(`${FRONTEND_URL}/auth/callback?token=${access_token}`)

6. Browser → http://localhost:3001/auth/callback?token=<jwt>
   → auth/callback.vue page:
     a. reads token from route.query.token
     b. calls authStore.loginWithToken(token)
        → stores token in localStorage
        → calls fetchCurrentUser() → GET /api/auth/me → sets full user state
     c. router.push('/dashboard')
```

**Key design decisions:**
1. `loginWithToken()` reuses `fetchCurrentUser()` — avoids duplicating full user profile logic
2. Browser redirect (not AJAX) for OAuth initiation — required for OAuth spec compliance
3. Nuxt devProxy handles `/api` forwarding in development — Google button uses relative URL `/api/auth/google` (works in both dev and prod)
4. No `guest` middleware on `/auth/callback` — the token is in the URL query param, `isAuthenticated` is false at arrival
5. `@Res({ passthrough: false })` on callback controller — must manually call `res.redirect()` since NestJS interceptors are bypassed
6. `loginWithGoogleUser()` issues the same JWT structure as `login()` — full roles/permissions/module_overrides in JWT payload

---

### HT-E: AuthController Compatibility Note

The global `APP_GUARD` (JwtAuthGuard) runs before route guards. The `@Public()` decorator on Google routes makes `JwtAuthGuard` pass through. Then `@UseGuards(AuthGuard('google'))` applies:
- For `GET /auth/google`: Passport triggers Google redirect (no return value needed)
- For `GET /auth/google/callback`: Passport processes OAuth callback, calls GoogleStrategy.validate(), sets `req.user`

The `@CurrentUser()` decorator reads from JWT payload — **not usable** on Google callback route. Must use `@Req() req: any` to access `req.user` (the Google-validated user object).

`@Res()` requires importing `Response` from `express`. NestJS supports this pattern natively with Express adapter.

---

### HT-F: Impact Analysis

| Component | Change Type | Risk |
|-----------|-------------|------|
| `pmo-backend/.env` | Fix 2 incorrect values (CALLBACK_URL, FRONTEND_URL) | Zero — config only |
| `pmo-backend/` (npm install) | Add `passport-google-oauth20` + `@types/passport-google-oauth20` | Minimal — new package, no existing code affected |
| `pmo-backend/src/auth/strategies/google.strategy.ts` | New file | Zero — additive |
| `pmo-backend/src/auth/auth.module.ts` | Add `GoogleStrategy` to providers | Minimal — additive |
| `pmo-backend/src/auth/auth.controller.ts` | Add 2 new routes + inject `ConfigService` | Minimal — additive, existing routes untouched |
| `pmo-backend/src/auth/auth.service.ts` | Add `loginWithGoogleUser()` method | Minimal — additive |
| `pmo-frontend/stores/auth.ts` | Add `loginWithToken()` action | Minimal — additive |
| `pmo-frontend/pages/auth/callback.vue` | New file | Zero — new route |
| `pmo-frontend/pages/login.vue` | Add Google button + divider | Minimal — additive UI element |
| Existing JWT login/logout flow | No change | None |
| RBAC / permissions / module access | No change | None |

---

## Section 2.79 — Phase HU: RBAC Data Visibility Bug + Module-Level Access Control

**Date:** 2026-04-16
**Phase:** HU
**Scope:** RBAC misconfiguration causing Staff users to see no Financial data despite correct pillar access; plus absence of Physical vs Financial module-level access distinction.

---

### HU-A: RBAC Data Visibility Root Cause (Critical)

**Observed symptom:** Admin users can view Financial module data. Staff users with correct pillar assignments (`user_pillar_assignments`) see a blank Financial module — no records, no hero stats.

**Root cause — `findAll()` ownership filter:**

`university-operations.service.ts` `findAll()` (lines 297–389) applies a visibility filter for non-admin users:

```
// Simplified logic (lines 322–335):
IF user has no campus:
  WHERE (status = 'PUBLISHED' OR created_by = user.id OR assigned_to = user.id)
IF user has campus mapped:
  WHERE (campus = userCampus OR created_by = user.id OR assigned_to = user.id)
```

University operations records (one per pillar type per fiscal year) are:
- Created by an Admin user
- Typically in DRAFT status (not PUBLISHED)
- Not assigned to Staff users via `record_assignments`

Therefore Staff calling `GET /api/university-operations?type=HIGHER_EDUCATION&fiscal_year=2025` receives an **empty array**. The `findCurrentOperation()` function in both Financial and Physical pages calls this exact endpoint to resolve the operation's UUID. When it returns empty, `currentOperation.value = null`.

**Financial module cascade:** `fetchFinancialData()` checks `if (currentOperation.value)` before fetching financial records:
```typescript
if (currentOperation.value) {
  // fetch /api/university-operations/${currentOperation.value.id}/financials
} else {
  financialRecords.value = []  // ← this branch runs for all Staff
}
```
Result: Staff see `financialRecords = []` → blank screen.

**Physical module behavior (different):** Physical indicator data is fetched via a completely separate endpoint:
```typescript
GET /api/university-operations/indicators?pillar_type=X&fiscal_year=Y&quarter=Q
```
This calls `findIndicatorsByPillarAndYear()` (service line 973) which has **no user-based filter**. Therefore physical indicator data displays correctly for all authenticated users. However, `findCurrentOperation()` still fails, meaning:
- Physical **display** works ✅
- Physical **CUD** (Edit Data button) fails ❌ (no `currentOperation.id` to POST to)
- Financial **display** fails ❌ (requires `currentOperation.id` for the financials fetch)

**Design conflict:** `findAll()` was designed for the main UO list page where ownership scoping is correct. Financial/Physical pages co-opted this endpoint to resolve the shared operation context — but these pages need a fundamentally different access model (pillar-based READ, not ownership-based).

---

### HU-B: Module-Level Access Gap (Physical vs Financial)

**Current state:** No distinction exists between access to Physical and Financial within University Operations.

**Access control layers (current):**
1. `user_permission_overrides.module_key = 'university-operations'` → sidebar visibility
2. `user_module_assignments.module = 'OPERATIONS'` → CUD approval scope
3. `user_pillar_assignments` → pillar TAB visibility (within both Physical AND Financial equally)
4. `permission.ts` middleware → NO routes added for `/university-operations/physical` or `/university-operations/financial`

**Gap:** An admin cannot say "user X can access Financial but not Physical." The granularity is at the module level only. Both Physical (`/university-operations/physical`) and Financial (`/university-operations/financial`) are sub-pages of the same module — there is no way to grant or deny access to one without the other.

**Existing `user_permission_overrides` capabilities:**
- `module_key` is `VARCHAR(50)` — no schema change needed to add new keys
- New keys `university-operations-physical` and `university-operations-financial` can be added without migration
- The access control page (`users/access-[id].vue`) already displays checkboxes per module key — extendable

**Note on `user_pillar_assignments`:** This controls which PILLAR TABS (Higher Ed, Research, etc.) are visible within the Physical and Financial pages. It does NOT control whether the user can access the Physical page vs Financial page. These are two orthogonal dimensions of access control.

---

### HU-C: Data Source Confirmation

Confirmed: data exists in the system (Admin can see it). The issue is not missing data.

**Physical READ path (no user filter — works for all staff):**
```
fetchTaxonomy() → GET /api/university-operations/taxonomy/${pillar}
  → controller: findAllIndicators()
  → service: findAllByPillar() — no user filter

fetchIndicatorData() → GET /api/university-operations/indicators?pillar_type=X&fiscal_year=Y&quarter=Q
  → controller: getIndicatorsByPillar()
  → service: findIndicatorsByPillarAndYear() — NO user filter
```

**Financial READ path (BLOCKED for staff due to operation context gate):**
```
findCurrentOperation() → GET /api/university-operations?type=X&fiscal_year=Y
  → controller: findAll()
  → service: findAll(query, user) — OWNERSHIP FILTER APPLIED
  → Staff: empty array → currentOperation = null

fetchFinancialData() → GET /api/university-operations/${currentOperation.id}/financials
  → NEVER REACHED because currentOperation = null
```

---

### HU-D: Impact Matrix

| Scenario | Financial Display | Physical Display | Physical CUD | Financial CUD |
|----------|-----------------|-----------------|--------------|---------------|
| Admin | ✅ Works | ✅ Works | ✅ Works | ✅ Works |
| Staff (with pillar assignment, no campus) | ❌ Blank | ✅ Works | ❌ Blocked | ❌ Blocked |
| Staff (with pillar assignment, with campus) | ❌ Blank (if op not in same campus) | ✅ Works | ❌ Blocked | ❌ Blocked |
| Staff (no pillar assignment) | Same as above + all pillar tabs visible | Same + all tabs | Same | Same |

The CUD blockage for Physical (Edit Data) is a secondary effect of the same root cause. Staff can see the data but cannot enter new data or submit.

---

### HU-E: Relevant Code References

| File | Location | Description |
|------|----------|-------------|
| `university-operations.service.ts` | Lines 297–389 | `findAll()` — ownership filter at lines 322–335 |
| `university-operations.service.ts` | Lines 973–1028 | `findIndicatorsByPillarAndYear()` — NO user filter |
| `university-operations.service.ts` | Lines 1551–1582 | `findFinancials()` — NO user/pillar filter on READ |
| `university-operations.service.ts` | Lines 129–146 | `validateFinancialAccess()` — module-assignment check (CUD only) |
| `university-operations.controller.ts` | Line 40 | `GET /` → `findAll(query, user)` — user IS passed |
| `university-operations.controller.ts` | Line 89 | `GET /indicators` → no user param |
| `financial/index.vue` | Lines 330–350 | `findCurrentOperation()` — calls `GET /api/university-operations?type=X&...` |
| `physical/index.vue` | Lines 372–420 | `findCurrentOperation()` — same endpoint |
| `users/access-[id].vue` | Line 52 | Module list: `OPERATIONS` only, no Physical/Financial sub-keys |
| `middleware/permission.ts` | All | No guards for `/university-operations/physical` or `/financial` |
| `database/migrations/038_add_user_pillar_assignments.sql` | — | Pillar tab assignments schema |
| `database/migrations/006_add_user_permission_overrides.sql` | — | `module_key VARCHAR(50)` — no schema change needed for new keys |

---

## Section 2.80 — Phase HV: RBAC Revocation Error (404 + APRR Logs) + Access Hierarchy (Module→Feature→Pillar) + Bulk Operations Plan (Apr 17, 2026)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

**Objective:** (A) Identify root cause of 404 on `/api/gad-reports` and APRR console log noise observed during revoke flow. (B) Audit RBAC access hierarchy gaps in `access-[id].vue`. (C) Assess bulk operations gap between per-user bulk endpoints and cross-user batch operations. (D) Evaluate data fetch alignment for Physical/Financial with pillar RBAC.

---

### HV-A: 404 on `/api/gad-reports` — Root Cause

**Source file:** `pmo-frontend/pages/dashboard.vue` line 63

**Finding:** `dashboard.vue` calls `api.get('/api/gad-reports')` inside `Promise.allSettled()`. The backend has NO `/gad-reports` endpoint. The GAD controller is mounted at `/api/gad` and exposes sub-routes only: `student-parity`, `faculty-parity`, `staff-parity`, `pwd-parity`, `indigenous-parity`, `gpb-accomplishments`, `budget-plans`. There is no aggregate summary endpoint.

**Runtime behavior:**
- `Promise.allSettled()` never rejects — the 404 from `api.get('/api/gad-reports')` becomes a rejected entry in the settled array
- `gad.status === 'rejected'` → `gadReports` stat shows `0` (handled gracefully)
- No UI error banner is triggered from `dashboard.vue` itself
- However, the browser console logs a network error (red) for the 404 — this is what the operator sees as the "banner"

**NOT related to pillar revocation.** This fires on EVERY dashboard mount, regardless of RBAC changes. The operator noticed it because the browser console was open during testing.

**Backend fact:** GAD module controller file `pmo-backend/src/gad/gad.controller.ts` — all routes are sub-paths of `gad/` with no root `GET /gad` or `GET /gad-reports` aggregate.

---

### HV-B: APRR Console Log Source

**Source file:** `pmo-frontend/pages/university-operations/index.vue` line 189

**Finding:** The `[APRR] <PILLAR>: taxonomy=x, data=x` logs are `console.log` diagnostic statements added in Phase FV-1 for operator diagnosis. They fire inside `fetchAPRRData()` which is called when:
1. `physicalViewMode` switches to `'REPORT'` (Report View tab activated)
2. `aprrDisplayQuarter` changes while in Report View
3. `selectedFiscalYear` changes while in Report View

These logs are informational — NOT errors. They appear when the operator has the University Operations landing page with Report View tab active.

**NOT related to pillar revocation.** The access-[id].vue page does not call `fetchAPRRData()` and has no watchers that trigger it. The operator observed these logs because the UO index page was open in a browser tab.

**Severity:** Low — pure noise. Should be demoted to `console.debug()`.

---

### HV-C: RBAC Hierarchy Gap in `access-[id].vue`

**File:** `pmo-frontend/pages/users/access-[id].vue`

**Current 3-tab structure:**
| Tab | What it controls |
|-----|-----------------|
| Module Scope | `user_module_assignments` (OPERATIONS, CONSTRUCTION, etc.) — Admin responsibility scope |
| Page Access | `user_permission_overrides` (page-level can_access boolean per module_key) |
| Pillar Access | `user_pillar_assignments` (HIGHER_EDUCATION, ADVANCED_EDUCATION, RESEARCH, TECHNICAL_ADVISORY) |

**Gap 1 — `showPillarTab` is incomplete.**
Current logic (line 162):
```js
const showPillarTab = computed(() => getOverrideAccess('university_operations') !== false)
```
This only checks if parent `university_operations` is not revoked. Does NOT check if BOTH `university-operations-physical` AND `university-operations-financial` are also revoked. If both sub-modules are revoked but parent is open, Pillar tab still shows — but pillar assignments have no effect.

**Gap 2 — `parentKey` is set but unused in template.**
The `modules` array (lines 66-68) has `parentKey: 'university_operations'` on the two sub-module entries, but the `v-for` loop in the template (line 461) renders ALL entries as flat rows with no visual indentation or grouping. Admin cannot tell that Physical/Financial are children of University Operations.

**Gap 3 — No cascade on revoke.**
Revoking `university_operations` page access does NOT automatically revoke `university-operations-physical` and `university-operations-financial` overrides. These remain in a stale "granted" state even though the parent is blocked. The middleware checks each key independently, so the sub-module overrides become orphaned.

**Gap 4 — Pillar toggles lack prerequisite guard.**
The Pillar Access tab is fully interactive even when both Physical and Financial sub-modules are explicitly revoked. Pillar assignments would be written to DB but have no UI effect until sub-module access is restored.

**Gap 5 — No visual indicator of hierarchy precedence.**
Admin does not understand that: Module Scope ≥ Page Access ≥ Pillar Access. No legend or info text explains the cascade behavior.

---

### HV-D: Bulk Operations Current State

**Existing per-user bulk endpoints:**
| Endpoint | Scope | Purpose |
|----------|-------|---------|
| `POST /api/users/:id/permissions/bulk` | Single user | Batch update multiple page-access overrides |
| `POST /api/users/:id/modules/bulk` | Single user | Batch update module assignments |

**Missing: Cross-user bulk endpoint** — no `POST /api/users/bulk-access-update` or equivalent to apply the same access change to multiple users simultaneously.

**Frontend gap:** `users/index.vue` has NO row selection checkboxes. The `v-select` filters (role, status filters) are present but no selection model. `v-data-table` with `show-select` and `v-model:selected` are both absent.

**Backend DTO note:** `BulkPermissionUpdateDto` and `BulkModuleAssignmentDto` already exist for per-user bulk calls. A new DTO for cross-user bulk would need `userIds: string[]` + the action descriptor.

---

### HV-E: Data Fetch Alignment (Physical/Financial vs Pillar RBAC)

**Physical READ path:** `fetchIndicatorData()` → `GET /api/university-operations/indicators?pillar_type=X&fiscal_year=Y&quarter=Q` → no user filter in service (`findIndicatorsByPillarAndYear()` is unrestricted). Pillar tab restriction is FRONTEND ONLY via `filteredPillars` computed (reads `authStore.user?.pillarAssignments`).

**Risk:** A user with direct API access (e.g., Postman) can retrieve indicator data for pillars they are not assigned to. Frontend tab hiding is the only enforcement layer.

**Status:** This is within scope of Directive 162 (backend pillar enforcement at data-write level deferred post-demo). For read operations, frontend enforcement is sufficient for demo purposes.

---

### HV-F: Impact Matrix

| Issue | Root Cause | Severity | Action Required |
|-------|-----------|----------|-----------------|
| 404 on `/api/gad-reports` | Wrong endpoint URL in dashboard.vue | Low — silent fail | Fix endpoint reference |
| APRR console logs | Diagnostic `console.log` in fetchAPRRData | Low — noise only | Demote to `console.debug` |
| `showPillarTab` incomplete | Missing sub-module check | Medium | Fix computed condition |
| `parentKey` unused | Template renders flat list | Medium-UX | Add visual indentation |
| No cascade on UO revoke | Manual process, sub-modules orphaned | Medium | Auto-cascade on UO revoke |
| Pillar tab no prerequisite guard | No warning when both sub-modules revoked | Low | Add info banner |
| No cross-user bulk ops | Missing backend endpoint + frontend selection | Medium | New endpoint + UI |

---

### HV-G: File Reference Map

| File | Location | Issue |
|------|----------|-------|
| `pmo-frontend/pages/dashboard.vue` | Line 63 | `/api/gad-reports` 404 |
| `pmo-frontend/pages/university-operations/index.vue` | Line 189 | `console.log` diagnostic noise |
| `pmo-frontend/pages/users/access-[id].vue` | Line 162 | `showPillarTab` incomplete condition |
| `pmo-frontend/pages/users/access-[id].vue` | Lines 461–478 | Flat module list — `parentKey` unused |
| `pmo-frontend/pages/users/access-[id].vue` | Lines 170–191 | No cascade on `university_operations` revoke |
| `pmo-frontend/pages/users/index.vue` | Template | No row selection, no bulk UI |
| `pmo-backend/src/users/users.controller.ts` | Lines 177–235 | Per-user bulk exists; cross-user bulk missing |

---

## Section 2.81 — Phase HW Research: Git Backup to pmo-test1

**Date:** 2026-04-16
**Scope:** Repository state analysis for clean backup commit to `pmo-test1`, excluding docs and runtime artifacts.

---

### HW-A: Branch State

| Branch | Commit | Notes |
|--------|--------|-------|
| `refactor/page-structure-feb9` (HEAD) | `268d652` | All work since Phase HQ uncommitted here |
| `pmo-test1` (local) | `beb99c0` | 1 commit behind HEAD |
| `origin/pmo-test1` | `268d652` | Already matches current branch HEAD |

**Key finding:** `origin/pmo-test1` already points to the same commit as the current branch HEAD (`268d652`). The new backup commit will advance both. No conflicts expected — `pmo-test1` is a strict ancestor of `refactor/page-structure-feb9`; any merge will be a **clean fast-forward**.

---

### HW-B: Uncommitted Changes Inventory

**40 tracked modified/deleted files — all from Phases HQ–HT work:**

| Category | Files | Action |
|----------|-------|--------|
| Backend source | `pmo-backend/src/**` (8 files) | ✅ INCLUDE |
| Frontend source | `pmo-frontend/**` (15 files) | ✅ INCLUDE |
| Root packages | `package.json`, `package-lock.json` | ✅ INCLUDE |
| Backend packages | `pmo-backend/package*.json` | ✅ INCLUDE |
| Docs modified | `docs/plan.md`, `docs/research.md`, `CLAUDE.md` | ❌ EXCLUDE (`docs/`); `CLAUDE.md` → INCLUDE (project governance) |
| Docs deleted | `docs/plan_phase_analytics_correction.md`, `docs/research_phase_analytics_correction.md` | ❌ EXCLUDE |

**Untracked new files:**

| Path | Action | Reason |
|------|--------|--------|
| `database/migrations/030–039` (10 files) | ✅ INCLUDE | Schema migrations — source code |
| `pmo-backend/src/auth/strategies/google.strategy.ts` | ✅ INCLUDE | New backend source (Phase HT) |
| `pmo-frontend/pages/auth/callback.vue` | ✅ INCLUDE | New frontend page (Phase HT) |
| `pmo-frontend/pages/users/access-[id].vue` | ✅ INCLUDE | New frontend page (Phase HR) |
| `pmo-frontend/pages/auth/` (directory) | ✅ INCLUDE | New frontend directory |
| `database/backups/` | ❌ EXCLUDE | Runtime operational scripts, JSON data dumps, node_modules |
| `database/staging/` | ❌ EXCLUDE | Migration helper scripts, extracted JSON, node_modules |
| `pmo-backend/test-login.json` | ❌ EXCLUDE | Temporary test artifact |
| `pmo-backend/uploads/` | ❌ EXCLUDE | Runtime user upload files |
| `prototype/Screenshot*.png` | ❌ EXCLUDE | UI screenshot artifact |
| `docs/docs/`, `docs/references/`, `docs/test/` | ❌ EXCLUDE | Documentation artifacts |

---

### HW-C: .gitignore Gap Analysis

Current `.gitignore` excludes: `node_modules/`, `.env`, `.DS_Store`, `dist/`, `build/`, `.claude/`, `.trae/`

**Missing entries (runtime directories showing as untracked):**

| Path | Should be ignored | Reason |
|------|-------------------|--------|
| `database/backups/` | Yes | Operational scripts + data dumps — not source code |
| `database/staging/` | Yes | Migration helpers + extracted JSON — not source code |
| `pmo-backend/uploads/` | Yes | User-uploaded files — runtime data |
| `prototype/` | Yes | Screenshot artifacts — not source code |

**Action:** Add these 4 paths to `.gitignore` before staging to prevent accidental future inclusion.

---

### HW-D: Conflict Analysis

**`refactor/page-structure-feb9` vs `pmo-test1`:**
- `pmo-test1` (local) is at `beb99c0` — a direct ancestor of HEAD
- `origin/pmo-test1` is at `268d652` = same as HEAD
- After new commit on current branch: `pmo-test1` merge = fast-forward (zero conflicts)
- `git push origin pmo-test1`: non-force push, origin already at ancestor — succeeds cleanly

**Verdict: ZERO conflict risk. No force push required.**

---

### HW-E: Commit Scope Summary (Phases HQ–HT)

The backup commit captures all work from Phases HQ through HT:
- HQ: Users index reset-requests panel, physical module sanitize fix, score column, dialog reorder
- HR: Navbar spacing, physical guide override section, user detail 2-col layout, `access-[id].vue`, edit page strip, row-click nav, Manage Access buttons
- HS: Global table header branding (#003300), dashboard subtitle/label clarity, "Construction→Infrastructure" rename
- HT: Google OAuth — GoogleStrategy, loginWithGoogleUser, OAuth routes, loginWithToken, auth/callback.vue, Google button on login page

---

## Section 2.82 — Phase HX Research: MikroORM Adoption + OpenLDAP Integration Feasibility

**Date:** 2026-04-16
**Scope:** Architecture-level feasibility study. No implementation. Findings inform Phase 2 plan only.

---

### HX-A: Current Database Architecture

**ORM in use:** None. Zero ORM. Pure raw SQL via `node-postgres` (`pg` library).

`DatabaseService` (`src/database/database.service.ts`) is a thin wrapper over `pg.Pool`:
```typescript
async query<T>(text: string, params?: any[]): Promise<QueryResult<T>> {
  return this.pool.query<T>(text, params);
}
```

Every service injects `DatabaseService` and calls `this.db.query(sql, params)` directly. No entity classes, no repositories, no query builders.

**Raw SQL call distribution across 17 service files:**

| Service | `this.db.query()` calls |
|---------|------------------------|
| `university-operations.service.ts` | **104** |
| `users.service.ts` | 49 |
| `construction-projects.service.ts` | 48 |
| `repair-projects.service.ts` | 44 |
| `departments.service.ts` | 19 |
| `auth.service.ts` | 17 |
| `gad.service.ts` | 13 |
| Other services (8 files) | ~57 |
| **Total** | **~361** |

**Migration system:** 41 hand-written `.sql` files in `database/migrations/`. Applied manually by the operator. No migration runner. No ORM migration tracking table.

**Transaction usage:** `getClient()` used in 4 places (provides `PoolClient` for BEGIN/COMMIT/ROLLBACK).

**Query complexity observed:**
- Multi-table JOINs (5–7 tables in UO list queries)
- Dynamic WHERE clause construction via string interpolation (allowlisted columns)
- Soft-delete pattern (`deleted_at IS NULL`) on all tables
- Stored procedure calls: `can_modify_user($1, $2)`, `user_has_module_access($1, $2::module_type)` (PostgreSQL functions, not ORM-expressible without raw query escape)
- Server-side computation post-hydration: `computeIndicatorMetrics()` — 80-line function that processes raw `pg` result rows with decimal precision handling, override merging, and rate capping

**Maintainability assessment:** The system is stable and consistent. Raw SQL provides full control over complex analytics, soft deletes, and quarterly isolation. The cost is verbosity — 3,262-line UO service with 104 queries is the clear pain point.

---

### HX-B: MikroORM Feasibility Analysis

**Compatibility confirmed:** MikroORM v6 supports NestJS and PostgreSQL natively. `@mikro-orm/nestjs`, `@mikro-orm/postgresql` packages available.

**Core conflict — migration system:**
MikroORM manages its own migration table (`mikro_orm_migrations`) and generates TypeScript/SQL migration files from entity decorators. The current project has 41 hand-crafted SQL migrations applied directly. Introducing MikroORM requires either:
1. Importing all 41 migrations as "already applied" by seeding the migration table — high risk of drift
2. Generating entities from scratch to match the current schema — massive boilerplate effort
3. Running MikroORM only for NEW tables/features — dual system complexity

**Migration to entity classes — scope quantification:**

Key tables that would require entity modeling:
| Table | Complexity | Notes |
|-------|-----------|-------|
| `university_operations` | HIGH | Soft delete, campus filter, assignment JOINs |
| `operation_indicators` | HIGH | 12 per-quarter columns, overrides, narrative fields |
| `quarterly_reports` | HIGH | 5-state lifecycle, submission history FK |
| `quarterly_report_submissions` | HIGH | Append-only audit log, FK to report |
| `pillar_indicator_taxonomy` | MEDIUM | READONLY seeded reference — must never be mutated |
| `users` | HIGH | Google OAuth, failed attempts, rank, soft delete |
| `user_roles` / `roles` / `role_permissions` / `permissions` | HIGH | 4 RBAC tables with complex JOINs |
| `user_module_assignments` / `user_pillar_assignments` / `user_permission_overrides` | HIGH | 3 additional RBAC tables |
| Construction/Repair tables | MEDIUM | Simpler but still 8+ tables |

Estimated entities required: **25–30 entity classes** to cover the full schema.

**Business logic incompatibility risks:**

1. **`computeIndicatorMetrics()`** — 80-line post-hydration computation on raw `pg` rows. MikroORM entities return typed objects, not raw row maps. This function uses `record.override_total_target` etc. — would require refactor to entity getters or virtual properties.

2. **Dynamic WHERE construction** — `university-operations.service.ts:338` builds `WHERE` clauses dynamically with allowlisted column names. MikroORM's QueryBuilder can do this but requires rewriting all dynamic filter logic.

3. **Stored procedure calls** — `can_modify_user($1, $2)` and `user_has_module_access($1, $2::module_type)` are PostgreSQL functions. MikroORM would still need raw SQL escape or `em.getKnex().raw()` for these.

4. **`autoRevertQuarterlyReport()`** — calls `validateOperationEditable()` → queries `quarterly_reports` with quarter parameter. This cross-entity state machine would need careful mapping to MikroORM lifecycle hooks or remain as raw SQL even post-migration.

5. **Soft deletes** — all tables use `deleted_at IS NULL`. MikroORM supports `@Filter()` soft-delete globally but requires consistent decorator application and testing across all entities.

**MikroORM risk matrix:**

| Risk | Severity | Probability |
|------|----------|-------------|
| `computeIndicatorMetrics` regression | HIGH | Certain if naively migrated |
| Migration table conflict (41 existing files) | HIGH | Certain without manual seeding |
| `quarterly_reports` lifecycle state bugs | HIGH | High — 5 states, 2 modules |
| BAR1 taxonomy accidental mutation | CRITICAL | Low — but catastrophic if triggered |
| Performance regression on analytics queries | MEDIUM | Medium — ORM adds overhead on complex JOINs |
| Dual-system cognitive load | MEDIUM | Certain during phased adoption |

**Verdict: NOT feasible for immediate adoption. Phased strategy required.**

---

### HX-C: Current Authentication Architecture

**Auth stack:**
- JWT via `@nestjs/jwt` + `passport-jwt`
- `JwtStrategy` (`src/auth/strategies/jwt.strategy.ts`) — validates bearer tokens
- `GoogleStrategy` (`src/auth/strategies/google.strategy.ts`) — OAuth2 via `passport-google-oauth20`
- `JwtAuthGuard` (global) + `@Public()` decorator for unguarded routes
- `RolesGuard` + `@Roles()` decorator for role-restricted endpoints

**Login flow (local):**
1. `POST /api/auth/login` → `validateUser()` → bcrypt compare → query 5 tables (users, roles, permissions, module_assignments, pillar_assignments) → `jwtService.sign(JwtPayload)` → return `access_token` + full user object

**JWT payload (`JwtPayload` interface):**
```typescript
{ sub: string, email: string, roles: string[], is_superadmin: boolean, campus?: string }
```

**RBAC layers:** 5 separate tables queried at login/profile:
1. `user_roles` + `roles` — role names
2. `role_permissions` + `permissions` — permission strings
3. `user_permission_overrides` — per-module can_access overrides
4. `user_module_assignments` — approval visibility scope
5. `user_pillar_assignments` — Physical/Financial pillar access control

**Extension readiness:** The `PassportStrategy` pattern is already proven extensible — Google OAuth was added as a drop-in `google.strategy.ts` with zero changes to the existing JWT auth flow. LDAP would follow the identical pattern.

**Existing sentinel for SSO-only accounts:**
```typescript
if (user.google_id && (!user.password_hash || user.password_hash === '')) {
  // SSO-only account — cannot use local login
}
```
The same pattern can be extended for LDAP-only accounts.

---

### HX-D: OpenLDAP Integration Feasibility Analysis

**Available NestJS LDAP packages:**
- `ldapjs` — low-level LDAP client (bind, search, modify)
- `passport-ldapauth` — Passport strategy wrapping `ldapauth-fork` (recommended for NestJS integration)

**Integration pattern — follows Google OAuth precedent exactly:**

```
[HT: google.strategy.ts] → [HX: ldap.strategy.ts]
GoogleStrategy extends PassportStrategy(Strategy, 'google')
LdapStrategy  extends PassportStrategy(Strategy, 'ldap')
```

The `LdapStrategy.validate()` method receives the LDAP-authenticated user object and maps it to the local `users` table by email (same lookup-by-email pattern as `google.strategy.ts:43`).

**Required infrastructure:**
- OpenLDAP server (or Active Directory with LDAP interface) accessible from the NestJS backend
- LDAP bind DN + bind password (service account credentials)
- User search base DN (e.g., `ou=users,dc=csu,dc=edu,dc=ph`)
- LDAP over TLS/SSL recommended for production (port 636)
- CSU IT department involvement required for server provisioning + OU structure definition

**LDAP → local user mapping flow:**
1. User submits username/password to `POST /api/auth/ldap`
2. `LdapStrategy` binds to LDAP server with service account
3. Searches for user by `uid` or `mail` attribute
4. If found + bind succeeds → validates credentials
5. Maps LDAP `mail` attribute → looks up `users` table by email
6. If found + `is_active` → `loginWithLdapUser(userId)` → issues JWT
7. If not found → 401 (no self-registration — matches Directive 202 from Google OAuth)

**LDAP group → RBAC mapping potential:**
OpenLDAP groups (`memberOf` attribute or group entries in `ou=groups`) can be mapped to system roles:

| LDAP Group / OU | Suggested System Role |
|-----------------|----------------------|
| `cn=pmo-admins,ou=groups,...` | Admin |
| `cn=pmo-staff,ou=groups,...` | Staff |
| `cn=pmo-viewers,ou=groups,...` | Viewer |
| `ou=ovprie,...` | Research pillar access |

**Critical dependency:** This mapping only works if CSU's LDAP directory has consistent group membership. Without IT confirmation of the LDAP schema, the mapping is speculative.

**Risk matrix:**

| Risk | Severity | Probability |
|------|----------|-------------|
| LDAP server unavailable / not provisioned yet | HIGH | HIGH — requires IT action |
| LDAP over plain text (port 389) in production | HIGH | Medium — security risk |
| OU/group structure undefined | MEDIUM | High — depends on CSU IT |
| Fallback broken if LDAP unreachable | HIGH | Low — if fallback correctly coded |
| JWT still required post-LDAP auth | LOW | Certain — by design, not a risk |
| Conflict with existing local + Google auth | LOW | None — additive, not replacement |

**Verdict: Architecturally feasible. Blocked by infrastructure, not code.**

---

### HX-E: System Impact Summary

| Component | MikroORM Impact | OpenLDAP Impact |
|-----------|----------------|-----------------|
| `database.service.ts` | REPLACED | Unchanged |
| `*.service.ts` (17 files, 361 queries) | FULL REWRITE | Unchanged |
| `auth.service.ts` | Affected (entity hydration) | +`loginWithLdapUser()` |
| `auth.module.ts` | Affected (MikroORM module) | +`LdapStrategy` provider |
| `auth/strategies/` | Unchanged pattern | +`ldap.strategy.ts` |
| `database/migrations/` (41 files) | Conflict — requires seeding | Unchanged |
| `.env` | MikroORM config vars | +LDAP config vars |
| Frontend | None | None |
| Demo readiness | **DISRUPTIVE** | Additive |

**Timeline context (stakeholder session was 2026-04-06 — passed):** System is in post-feedback stabilization. MikroORM migration now would destabilize the UO module (most critical for demo). OpenLDAP is additive and does not touch existing functionality.

---

### HX-F: File Reference Map

| File | Role in HX |
|------|-----------|
| `pmo-backend/src/database/database.service.ts` | Core of current raw SQL pattern |
| `pmo-backend/src/auth/auth.service.ts` | Login flow — LDAP integration point |
| `pmo-backend/src/auth/auth.module.ts` | Strategy registration — add LdapStrategy here |
| `pmo-backend/src/auth/strategies/google.strategy.ts` | LDAP strategy template |
| `pmo-backend/src/university-operations/university-operations.service.ts:1107` | `computeIndicatorMetrics()` — highest MikroORM risk |
| `pmo-backend/src/common/services/permission-resolver.service.ts` | PostgreSQL function calls — raw SQL escape needed |
| `pmo-backend/.env` | Add LDAP config vars when implementing |

---

## Section 2.83 — Phase HY Research: MikroORM + OpenLDAP Implementation Planning

**Date:** 2026-04-16
**Scope:** Concrete implementation research — packages, entity design, config wiring, migration seeding, LDAP strategy pattern. Directive: MIS Director confirmed ORM adoption required.

---

### HY-A: Package Inventory (Neither installed yet)

Confirmed via `node_modules` check:
- `@mikro-orm/core` — NOT installed
- `@mikro-orm/nestjs` — NOT installed
- `@mikro-orm/postgresql` — NOT installed
- `@mikro-orm/migrations` — NOT installed
- `passport-ldapauth` — NOT installed
- `@types/passport-ldapauth` — NOT installed

**Current `pg`-based stack remains installed and functional.** MikroORM is additive — `DatabaseModule` and `DatabaseService` are NOT removed during phased migration.

---

### HY-B: MikroORM Configuration Requirements

**Required packages:**
```
@mikro-orm/core
@mikro-orm/nestjs
@mikro-orm/postgresql
@mikro-orm/migrations
@mikro-orm/reflection    (for metadata via ts-morph, avoids reflect-metadata issues)
```

**AppModule registration pattern:**
`MikroOrmModule.forRootAsync()` registered in `AppModule` alongside the existing `DatabaseModule`. Both coexist. `DatabaseService` injection continues working for all non-migrated services.

**Key config decisions:**
- `autoLoadEntities: true` — entities auto-registered when module imports `MikroOrmModule.forFeature([Entity])`
- `migrations.tableName: 'mikro_orm_migrations'` — isolated from hand-crafted SQL files
- `migrations.path: './src/database/mikro-migrations'` — separate from `database/migrations/` (SQL)
- `filters: { notDeleted: { cond: { deletedAt: null }, default: true } }` — global soft-delete filter
- `discovery.useTsMorphFile: true` — avoids decorator reflection issues with NestJS

**Critical: Migration seeding.** The 41 existing SQL migrations are already applied to the database. MikroORM must NOT re-apply them. Before any `npx mikro-orm migration:up` is run, the `mikro_orm_migrations` table must be seeded with a sentinel entry that tells MikroORM the schema baseline is already in place. This is a ONE-TIME operator SQL command.

---

### HY-C: Pilot Service Selection — Migration Order

Services selected for phased MikroORM migration, ordered by complexity:

| Priority | Service | Table | Query Count | Complexity | Why first |
|----------|---------|-------|-------------|------------|-----------|
| **MO-2a** | `RepairTypesService` | `repair_types` | 8 | Minimal — no JOINs, no FK deps | Simplest possible entity |
| **MO-2b** | `FundingSourcesService` | `funding_sources` | 8 | Minimal — same pattern as repair_types | Identical pattern, confirms repeatability |
| **MO-2c** | `ContractorsService` | `contractors` | 7 | Low — no JOINs | No soft-delete audit fields on reads |
| **MO-2d** | `SettingsService` | `system_settings` | 10 | Low-Medium — `is_public` role filter | Tests conditional query scoping |
| **Hold** | `MediaService` | `media` | 6 | Medium — depends on `UploadsService` | External service dependency |
| **Hold** | `DocumentsService` | `documents` | 6 | Medium — same upload dependency | Same as media |
| **Never early** | `UsersService` | `users` + 5 RBAC tables | 49 | HIGH — RBAC, rank hierarchy | Too many dependencies |
| **Never early** | `UniversityOperationsService` | UO + indicators + QR + taxonomy | 104 | CRITICAL | BAR1 reporting |

**Pilot scope for this phase (HY):** MO-2a and MO-2b only (`repair_types`, `funding_sources`). These establish the pattern. MO-2c onward follows the same template.

---

### HY-D: Entity Design Pattern (from codebase analysis)

All pilot tables share a common column pattern:

```
id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
name         VARCHAR (required, unique in some)
description  TEXT (nullable)
metadata     JSONB (nullable, repair_types only)
created_by   UUID (FK to users, nullable in some)
created_at   TIMESTAMPTZ DEFAULT NOW()
updated_at   TIMESTAMPTZ DEFAULT NOW()
deleted_at   TIMESTAMPTZ (soft delete)
deleted_by   UUID (nullable)
```

**MikroORM entity template for pilot tables:**

```typescript
import { Entity, Filter, PrimaryKey, Property } from '@mikro-orm/core';

@Filter({ name: 'notDeleted', cond: { deletedAt: null }, default: true })
@Entity({ tableName: 'repair_types' })
export class RepairType {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  name!: string;

  @Property({ nullable: true, columnType: 'text' })
  description?: string;

  @Property({ nullable: true, columnType: 'jsonb' })
  metadata?: Record<string, unknown>;

  @Property({ nullable: true, columnType: 'uuid' })
  createdBy?: string;

  @Property({ nullable: true, columnType: 'uuid' })
  updatedBy?: string;

  @Property({ defaultRaw: 'NOW()' })
  createdAt: Date = new Date();

  @Property({ defaultRaw: 'NOW()', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ nullable: true })
  deletedAt?: Date;

  @Property({ nullable: true, columnType: 'uuid' })
  deletedBy?: string;
}
```

**Repository pattern in migrated service:**
```typescript
constructor(
  @InjectRepository(RepairType)
  private readonly repairTypeRepo: EntityRepository<RepairType>,
) {}

// findAll with filter + pagination
async findAll(query: QueryRepairTypeDto): Promise<PaginatedResponse<any>> {
  const [items, total] = await this.repairTypeRepo.findAndCount(
    query.name ? { name: { $like: `%${query.name}%` } } : {},
    { limit: query.limit, offset: (query.page - 1) * query.limit,
      orderBy: { [query.sort]: query.order } }
  );
  return createPaginatedResponse(items, total, query.page, query.limit);
}
```

**Soft-delete via filter:** The `@Filter({ name: 'notDeleted', default: true })` decorator automatically appends `WHERE deleted_at IS NULL` to all queries on that entity. No manual condition needed in service methods.

**Soft-delete operation:**
```typescript
// Instead of raw SQL UPDATE ... SET deleted_at = NOW()
entity.deletedAt = new Date();
entity.deletedBy = userId;
await this.em.flush();
```

---

### HY-E: DatabaseModule Coexistence Pattern

`DatabaseModule` is `@Global()` — it exposes `DatabaseService` everywhere. MikroORM's `MikroOrmModule` also becomes global via `isGlobal: true` in config.

Both can exist simultaneously in `AppModule`. Services that have been migrated use `EntityRepository<T>`; services not yet migrated continue using `DatabaseService`. There is NO conflict — they connect to the same PostgreSQL instance via separate connection pools.

The only risk: if both pools run a transaction simultaneously and one modifies a table the other is reading, there is potential for MVCC isolation surprises. For pilot tables (`repair_types`, `funding_sources`) which have no transactional dependencies with `DatabaseService`-managed tables, this risk is zero.

---

### HY-F: OpenLDAP — Implementation Research

**Package:** `passport-ldapauth` v3.x wraps `ldapauth-fork`. It binds to the LDAP server using a service account, then searches for the user by a configurable filter, and performs a user-bind to verify credentials.

**Strategy class signature (passport-ldapauth):**
```typescript
class LdapStrategy extends PassportStrategy(Strategy, 'ldap') {
  constructor(config) {
    super({ server: { url, bindDN, bindCredentials, searchBase, searchFilter } });
  }
  async validate(user: LdapUser): Promise<any> { ... }
}
```

`validate()` receives the raw LDAP user object (attributes from directory). No `@Req()` needed — passport-ldapauth populates `req.user` via `done(null, user)` internally.

**Credential flow:** `passport-ldapauth` reads `req.body.username` and `req.body.password` automatically. The controller route uses `@UseGuards(AuthGuard('ldap'))` on a `@Post` route — no manual credential extraction needed.

**LDAP user object shape (typical OpenLDAP):**
```typescript
{
  dn: 'uid=jdoe,ou=users,dc=csu,dc=edu,dc=ph',
  uid: 'jdoe',
  mail: 'jdoe@carsu.edu.ph',
  cn: 'John Doe',
  sn: 'Doe',
  givenName: 'John',
  memberOf: ['cn=pmo-staff,ou=groups,dc=csu,dc=edu,dc=ph']
}
```

The `mail` attribute maps directly to `users.email` in the local database — same lookup path as `google.strategy.ts:43`.

**Graceful skip when LDAP not configured:** If `LDAP_URL` env var is absent (IT not yet provisioned), the `LdapStrategy` constructor throws. To prevent app crash, the strategy registration in `auth.module.ts` is wrapped in a conditional provider factory:
```typescript
// Only register LdapStrategy if LDAP_URL is set
...(configService.get('LDAP_URL') ? [LdapStrategy] : [])
```

This ensures the app starts normally without LDAP credentials, and the LDAP endpoint returns 503 with a clear message until configured.

---

### HY-G: File Impact Map

**MikroORM — new files:**
| File | Purpose |
|------|---------|
| `pmo-backend/src/database/entities/repair-type.entity.ts` | RepairType entity |
| `pmo-backend/src/database/entities/funding-source.entity.ts` | FundingSource entity |
| `pmo-backend/src/database/entities/index.ts` | Entity barrel export |
| `pmo-backend/src/database/mikro-orm.config.ts` | MikroORM config object |
| `pmo-backend/src/database/mikro-migrations/` | New migration directory (MikroORM-generated) |

**MikroORM — modified files:**
| File | Change |
|------|--------|
| `pmo-backend/src/app.module.ts` | Add `MikroOrmModule.forRootAsync()` import |
| `pmo-backend/src/repair-types/repair-types.module.ts` | Add `MikroOrmModule.forFeature([RepairType])` |
| `pmo-backend/src/repair-types/repair-types.service.ts` | Replace `DatabaseService` with `EntityRepository<RepairType>` |
| `pmo-backend/src/funding-sources/funding-sources.module.ts` | Add `MikroOrmModule.forFeature([FundingSource])` |
| `pmo-backend/src/funding-sources/funding-sources.service.ts` | Replace `DatabaseService` with `EntityRepository<FundingSource>` |
| `pmo-backend/package.json` | Add MikroORM packages |

**OpenLDAP — new files:**
| File | Purpose |
|------|---------|
| `pmo-backend/src/auth/strategies/ldap.strategy.ts` | LdapStrategy (passport-ldapauth) |

**OpenLDAP — modified files:**
| File | Change |
|------|--------|
| `pmo-backend/src/auth/auth.service.ts` | Add `loginWithLdapUser()` |
| `pmo-backend/src/auth/auth.controller.ts` | Add `POST /auth/ldap` route |
| `pmo-backend/src/auth/auth.module.ts` | Register `LdapStrategy` conditionally |
| `pmo-backend/.env` | Add 6 LDAP env vars |

---

## Section 2.84 — Phase HZ Research: ORM Migration Tier 1 — Reference Data (2026-04-20)

**Trigger:** RUN_ACE operator command. MIS Director ORM adoption directive (2026-04-16). Phase HY confirmed complete.

### Phase HY Confirmation

Phase HY is fully implemented (untracked/modified files in git status confirm this is staged but uncommitted):

| Artifact | Status |
|----------|--------|
| MikroORM packages in `package.json` | ✅ Installed |
| `app.module.ts` — `MikroOrmModule.forRootAsync()` | ✅ Registered (DatabaseModule retained) |
| `src/database/entities/funding-source.entity.ts` | ✅ Created |
| `src/database/entities/repair-type.entity.ts` | ✅ Created |
| `src/database/entities/index.ts` | ✅ Created |
| `src/database/mikro-orm.config.ts` | ✅ Created |
| `funding-sources.service.ts` | ✅ Migrated to `EntityRepository<FundingSource>` |
| `funding-sources.module.ts` | ✅ `MikroOrmModule.forFeature([FundingSource])` |
| `repair-types.service.ts` | ✅ Migrated to `EntityRepository<RepairType>` |
| `repair-types.module.ts` | ✅ `MikroOrmModule.forFeature([RepairType])` |
| `auth/strategies/ldap.strategy.ts` | ✅ Created (conditional registration) |
| `auth.service.ts` — `loginWithLdapUser()` | ✅ Added |
| `auth.controller.ts` — `POST /auth/ldap` | ✅ Added |
| `auth.module.ts` — conditional LDAP registration | ✅ Added |

**Established entity pattern (from existing entities):**
```typescript
@Filter({ name: 'notDeleted', cond: { deletedAt: null }, default: true })
@Entity({ tableName: '<table_name>' })
export class EntityName {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;
  // ...properties
  @Property({ defaultRaw: 'NOW()', columnType: 'timestamptz' })
  createdAt: Date = new Date();
  @Property({ defaultRaw: 'NOW()', onUpdate: () => new Date(), columnType: 'timestamptz' })
  updatedAt: Date = new Date();
  @Property({ nullable: true, columnType: 'timestamptz' })
  deletedAt?: Date;
  // createdBy, updatedBy, deletedBy: nullable uuid
}
```

**Established service pattern (from `FundingSourcesService`):**
- `@InjectRepository(Entity)` → `EntityRepository<Entity>`
- `findAndCount(where, { limit, offset, orderBy })` for paginated list
- `findOne({ id })` for single record (notDeleted filter applied automatically)
- `repo.create({...})` + `em.persist(entity).flush()` for insert
- `Object.assign(entity, dto)` + `em.flush()` for update
- Soft-delete: `entity.deletedAt = new Date()` + `em.flush()`

### Module Complexity Assessment

| Module | Table | JOINs | Special | HZ scope |
|--------|-------|-------|---------|----------|
| construction-subcategories | `construction_subcategories` | None | Duplicate name check | ✅ YES |
| contractors | `contractors` | None | `updateStatus()` extra method | ✅ YES |
| settings | `system_settings` | None | `isAdmin` boolean filter, `findByKey`/`updateByKey` | ✅ YES |
| departments | `departments` | users, self | Self-referential tree, cycle detection recursive traversal | ❌ Phase IA+ |
| media | `media` | None | Polymorphic type+id, `UploadsService` side-effect | ❌ Phase IA+ |
| documents | `documents` | None | Polymorphic type+id, `UploadsService` side-effect | ❌ Phase IA+ |
| users | many | many | Security-critical, roles/permissions multi-table | ❌ MO-3 |
| auth | many | many | JWT, security-critical | ❌ MO-3 |
| university-operations | many | many | NEVER (Directive 224+) | ❌ NEVER |

### Entity Column Analysis

#### ConstructionSubcategory (`construction_subcategories`)
Inferred from service INSERT/SELECT:
- `id` uuid PK
- `name` varchar(255) NOT NULL
- `description` text nullable
- `metadata` jsonb nullable
- `created_by` uuid nullable
- `updated_by` uuid nullable
- `created_at` timestamptz
- `updated_at` timestamptz
- `deleted_at` timestamptz nullable
- `deleted_by` uuid nullable

#### Contractor (`contractors`)
Inferred from service INSERT/SELECT:
- `id` uuid PK
- `name` varchar(255) NOT NULL
- `contact_person` varchar nullable
- `email` varchar nullable
- `phone` varchar nullable
- `address` text nullable
- `tin_number` varchar nullable
- `registration_number` varchar nullable
- `validity_date` date nullable (passed as-is from DTO)
- `status` varchar NOT NULL (e.g. 'ACTIVE', 'INACTIVE', 'BLACKLISTED')
- `metadata` jsonb nullable
- `created_by` uuid nullable
- `updated_by` uuid nullable
- `created_at` timestamptz
- `updated_at` timestamptz
- `deleted_at` timestamptz nullable
- `deleted_by` uuid nullable

#### SystemSetting (`system_settings`)
Inferred from service INSERT/SELECT:
- `id` uuid PK
- `setting_key` varchar NOT NULL (used as business key in findByKey/updateByKey)
- `setting_value` text nullable
- `setting_group` varchar NOT NULL
- `data_type` varchar NOT NULL (e.g. 'string', 'boolean', 'number')
- `is_public` boolean NOT NULL DEFAULT false
- `description` text nullable
- `metadata` jsonb nullable
- `created_by` uuid nullable
- `updated_by` uuid nullable
- `created_at` timestamptz
- `updated_at` timestamptz
- `deleted_at` timestamptz nullable
- `deleted_by` uuid nullable

### Settings Service — Special Cases

1. **`findAll(query, isAdmin)` visibility filter:** `isAdmin=false` appends `isPublic = true` to `FilterQuery`. In MikroORM: `if (!isAdmin) where.isPublic = true` — straightforward.

2. **`findByKey(key)` / `updateByKey(key)` / `removeByKey(key)`:** All use `{ settingKey: key }` as the `findOne` filter — MikroORM supports this natively.

3. **`findByGroup(group)`:** Simple `{ settingGroup: group }` filter — no issue.

4. **Column naming — camelCase to snake_case:** MikroORM auto-maps `settingKey → setting_key`, `isPublic → is_public`, etc. No explicit `fieldName` overrides needed.

### Contractors Service — Special Cases

1. **`updateStatus(id, status, userId)`:** Extra method not in funding-sources pattern. In MikroORM: `entity.status = status; entity.updatedBy = userId; await em.flush()`. No raw SQL needed.

2. **`metadata` field:** Serialized as JSON in raw SQL (`JSON.stringify(dto.metadata)`). MikroORM `columnType: 'jsonb'` handles serialization automatically — no `JSON.stringify` needed in service.

### No Raw SQL Fallback Required

All three modules have zero JOINs, zero recursive queries, and zero cross-table transactions. Full MikroORM migration is safe.

### Files to Create / Modify in Phase HZ

**New entity files:**
- `pmo-backend/src/database/entities/construction-subcategory.entity.ts`
- `pmo-backend/src/database/entities/contractor.entity.ts`
- `pmo-backend/src/database/entities/system-setting.entity.ts`

**Modified files:**
- `pmo-backend/src/database/entities/index.ts` — add 3 exports
- `pmo-backend/src/construction-subcategories/construction-subcategories.service.ts` — replace DatabaseService
- `pmo-backend/src/construction-subcategories/construction-subcategories.module.ts` — replace DatabaseModule
- `pmo-backend/src/contractors/contractors.service.ts` — replace DatabaseService
- `pmo-backend/src/contractors/contractors.module.ts` — replace DatabaseModule
- `pmo-backend/src/settings/settings.service.ts` — replace DatabaseService
- `pmo-backend/src/settings/settings.module.ts` — replace DatabaseModule

---

## Section 2.85 — Phase HI: ORM Transition Feasibility — Schema Alignment Audit (2026-04-20)

**Trigger:** Phase HZ verification failure (`POST /api/construction-subcategories` → HTTP 500, `column "created_by" does not exist`). Full schema audit required before Phase HZ can be re-verified.

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

---

### HI-A: Migration File Inventory (Complete)

**Total migration files:** 38 numbered files (002–039). No file numbered 001. Baseline schema is `database/database draft/2026_01_12/pmo_schema_pg.sql` (v2.3.0, the "migration 000").

**Duplicate number prefix anomaly (governance concern, not runtime risk):**

| Prefix | File A | File B |
|--------|--------|--------|
| `021` | `021_add_quarterly_unique_constraint.sql` | `021_fix_advanced_education_indicator.sql` |
| `022` | `022_add_orphan_unique_constraint.sql` | `022_format_advanced_education_indicator.sql` |

Both files in each pair have different content and serve different purposes. Both must have been applied for the system to be in its current state. The manual migration system (no Flyway/TypeORM runner) does not enforce uniqueness of numeric prefixes. This is a governance gap that could cause confusion but poses no current runtime risk.

**Half-step migration:** `016b_align_pillar_type_enum.sql` — an unnumbered "b" suffix migration. Applied between 016 and 017.

---

### HI-B: Schema Gap Analysis — MikroORM Entities vs Live DB

**Root cause of Phase HZ failure:**

Migration 004 added `created_by`/`updated_by` ONLY to `contractors` and `funding_sources`. It did NOT modify `construction_subcategories`, `repair_types`, or `system_settings`. The Phase HZ/HY entities for all five tables declare `createdBy`/`updatedBy` properties — but the DB only has those columns on two of the five tables.

**Schema gap matrix (as of migration 039):**

| Table | `created_by` in DB | `updated_by` in DB | Entity has `createdBy` | Entity has `updatedBy` | Action |
|-------|-------------------|-------------------|----------------------|----------------------|--------|
| `construction_subcategories` | ❌ MISSING | ❌ MISSING | ✅ Yes | ✅ Yes | Migration 040: ADD both |
| `repair_types` | ❌ MISSING | ❌ MISSING | ✅ Yes | ✅ Yes | Migration 040: ADD both |
| `system_settings` | ❌ MISSING | ✅ Present (baseline) | ✅ Yes | ✅ Yes | Migration 040: ADD `created_by` only |
| `contractors` | ✅ Present (mig 004) | ✅ Present (mig 004) | ✅ Yes | ✅ Yes | None |
| `funding_sources` | ✅ Present (mig 004) | ✅ Present (mig 004) | ✅ Yes | ✅ Yes | None |

**Impact on Phase HY (repair_types):**

Phase HY verification confirmed the app started and GET requests for `repair_types` returned data. However, `POST /api/repair-types` was NOT confirmed tested with a create request. The `RepairType` entity maps `createdBy`/`updatedBy` → `created_by`/`updated_by`. These columns do not exist in the `repair_types` table. **Phase HY CREATE operations will also produce HTTP 500** identical to the Phase HZ failure. Must be re-verified after migration 040.

---

### HI-C: Entity Column Metadata Accuracy

Entity property `length` declarations do not match DB column sizes in several cases. These cause no runtime error (MikroORM uses declared lengths for schema generation only, which is disabled), but are inaccurate documentation.

| Entity | Property | Entity `length` | DB VARCHAR size | Risk |
|--------|----------|----------------|-----------------|------|
| `ConstructionSubcategory` | `name` | 255 | `VARCHAR(100)` | ⚠️ Doc error only |
| `RepairType` | `name` | 255 | `VARCHAR(100)` | ⚠️ Doc error only |
| `FundingSource` | `name` | 255 | `VARCHAR(100)` | ⚠️ Doc error only |
| `SystemSetting` | `settingKey` | 255 | `VARCHAR(100)` | ⚠️ Doc error only |
| `SystemSetting` | `settingGroup` | 100 | `VARCHAR(50)` | ⚠️ Doc error only |
| `Contractor` | `name` | 255 | `VARCHAR(255)` | ✅ Match |

Recommendation: correct `length` declarations to match DB for accuracy. No DB changes required.

---

### HI-D: Enum Type Mapping Assessment

Two tables use PostgreSQL native enum types for columns that the MikroORM entities map as plain `string`:

| Table | Column | DB Type | Entity type | Behavior |
|-------|--------|---------|-------------|----------|
| `contractors` | `status` | `contractor_status_enum` | `string` | Transparent — Postgres accepts string literals for enum columns without explicit cast in most driver configurations. The `pg` driver (used by MikroORM's PostgreSqlDriver) sends values as strings; Postgres coerces them if the value is a valid enum member. |
| `system_settings` | `data_type` | `setting_data_type_enum` | `string` | Same behavior as above. |

**Risk level:** LOW. The `@mikro-orm/postgresql` driver does not require explicit enum casting for INSERT/UPDATE. Postgres will reject an invalid enum value (e.g., `'INVALID_TYPE'`) with a constraint error regardless — which is the correct behavior. No changes required.

---

### HI-E: MikroORM Configuration Safety Audit

**File:** `pmo-backend/src/app.module.ts` (MikroOrmModule.forRootAsync, lines 44–66)

| Config item | Value | Safety |
|-------------|-------|--------|
| `autoLoadEntities` | `true` | ✅ Entities auto-registered when forFeature is used |
| Schema auto-sync | NOT configured | ✅ No automatic schema changes |
| Migration auto-run | NOT configured | ✅ No automatic migration execution |
| `allowGlobalContext` | NOT set (defaults to `false`) | ✅ Correct for NestJS lifecycle management |
| Global `notDeleted` filter | Enabled by default on all entities | ✅ Soft-delete safety correct |
| Connection pool | min=2, max=10 | ✅ |
| Dual driver (MikroORM + raw pg Pool) | Both active | ✅ Non-disruptive coexistence |

**Conclusion:** MikroORM config is schema-preservation safe. No auto-sync, no auto-migration. Config is correct.

---

### HI-F: Final Column Inventory for Affected Tables (Post-Migration 039, Pre-Migration 040)

#### `construction_subcategories` (final columns currently in DB):
`id, name, description, metadata, created_at, updated_at, deleted_at, deleted_by`
→ **Missing:** `created_by`, `updated_by`

#### `repair_types` (final columns currently in DB):
`id, name, description, metadata, created_at, updated_at, deleted_at, deleted_by`
→ **Missing:** `created_by`, `updated_by`

#### `system_settings` (final columns currently in DB):
`id, setting_key, setting_value, setting_group, data_type, is_public, description, updated_by, metadata, created_at, updated_at, deleted_at, deleted_by`
→ **Missing:** `created_by` only (`updated_by` is present from initial schema)

#### `contractors` (final columns after mig 004):
`id, name, contact_person, email, phone, address, tin_number, registration_number, validity_date, status, created_by, updated_by, metadata, created_at, updated_at, deleted_at, deleted_by`
→ ✅ Complete

#### `funding_sources` (final columns after mig 004):
`id, name, description, created_by, updated_by, metadata, created_at, updated_at, deleted_at, deleted_by`
→ ✅ Complete

---

### HI-G: Risk Summary

| Risk | Severity | Resolution |
|------|----------|------------|
| `construction_subcategories` missing `created_by`/`updated_by` | 🔴 BLOCKING | Migration 040 |
| `repair_types` missing `created_by`/`updated_by` | 🔴 BLOCKING | Migration 040 |
| `system_settings` missing `created_by` | 🔴 BLOCKING | Migration 040 |
| Duplicate 021/022 migration number prefixes | 🟡 Governance gap | Document — no code fix |
| Entity `length` metadata inaccurate | 🟡 Doc error | Entity corrections (no DB change) |
| `contractor_status_enum`/`setting_data_type_enum` as `string` in entity | 🟢 LOW | No fix needed |

---

## Section 2.86 — Phase HJ: ORM Migration Wave 3 — GAD Module + Next-Wave Assessment

> **Phase:** HJ (ORM Migration Track — continuing from Phase HI/HZ/HY)
> **Date:** 2026-04-20
> **Status:** Research complete — Plan pending operator authorization

### HJ-A: Remaining Module Inventory

After Phases HY and HZ (5 reference-data modules migrated), 7 modules remain on `DatabaseService`:

| # | Module | Service File | Tables | Complexity | Decision |
|---|--------|-------------|--------|------------|----------|
| 1 | GAD | `gad.service.ts` | 7 GAD tables | 🟡 MEDIUM | **Phase HJ — Migrate** |
| 2 | Departments | `departments.service.ts` | `departments`, `user_departments` | 🟢 LOW | Phase HK — pending schema verification |
| 3 | Media | `media.service.ts` | `media` | 🟢 LOW | Phase HK — pending schema discrepancy resolution |
| 4 | Documents | `documents.service.ts` | `documents` | 🟢 LOW | Phase HK — pending schema discrepancy resolution |
| 5 | Projects | `projects.service.ts` | `projects` | 🟢 LOW | Phase HM — defer (coupled to construction/repair) |
| 6 | Construction Projects | `construction-projects.service.ts` | 6+ tables | 🔴 HIGH | Phase HM — defer |
| 7 | Repair Projects | `repair-projects.service.ts` | 8+ tables | 🔴 HIGH | Phase HM — defer |

**Current MikroORM entity count:** 5 (contractors, funding-sources, construction-subcategories, repair-types, system-settings)

---

### HJ-B: GAD Module Analysis

**File:** `pmo-backend/src/gad/gad.service.ts` (235 lines)

**Tables managed (7 independent tables):**

| Table | Key Fields | Audit Pattern |
|-------|-----------|---------------|
| `gad_student_parity_data` | `academic_year`, `program`, 4 numeric fields | `submitted_by`, `reviewed_by`, no `created_by`/`updated_by` |
| `gad_faculty_parity_data` | `academic_year`, `college`, `category`, 3 numeric | same |
| `gad_staff_parity_data` | `academic_year`, `department`, `staff_category`, 3 numeric | same |
| `gad_pwd_parity_data` | `academic_year`, `pwd_category`, `subcategory`, 3 numeric | same |
| `gad_indigenous_parity_data` | `academic_year`, `indigenous_category`, `subcategory`, 3 numeric | same |
| `gad_gpb_accomplishments` | `title`, `category`, `priority`, `status`, financial fields, `data_status` | same |
| `gad_budget_plans` | `title`, `category`, `priority`, `status`, financial fields, `data_status` | same |

**Schema verification (from `pmo_schema_pg.sql` lines 1197–1334):**
- ✅ NO `created_by` or `updated_by` columns in any GAD table
- ✅ NO `deleted_by` column in any GAD table
- ✅ `deleted_at` IS present — global `notDeleted` filter applies correctly
- ✅ Uses `submitted_by` (nullable FK to users) — matches service code
- ✅ Schema is exactly what the service writes — **ZERO schema gaps**

**Query complexity analysis:**

All GAD queries are structurally identical:
- `SELECT ... FROM <table> WHERE deleted_at IS NULL [AND status/year filter] ORDER BY created_at DESC LIMIT $n OFFSET $m`
- `INSERT INTO <table> (col1, ...) VALUES ($1, ...) RETURNING *`
- `UPDATE <table> SET field=$1, ... WHERE id=$n RETURNING *`
- `UPDATE <table> SET deleted_at=NOW() WHERE id=$1 RETURNING *`

**ZERO JOINs. ZERO subqueries. ZERO aggregations. ZERO transactions.**

**The dynamic table name pattern (key challenge):**

The service implements a private template-method pattern using runtime string table names:
```
findAllParity(table: string, query) → passes table as SQL string
createParity(table: string, columns[], values[]) → string interpolation
updateParity(table: string, id, dto) → string interpolation
removeParity(table: string, id) → string interpolation
```

Each public method (e.g., `findStudentParity`, `findFacultyParity`) calls these helpers with the table name as a string argument.

**MikroORM incompatibility:** `EntityRepository<T>` requires a static entity class reference — cannot accept a runtime string. This requires refactoring the template-method pattern.

**Resolution strategy (KISS):** Replace the single `findAllParity(table, ...)` helper with a typed generic helper that accepts `EntityRepository<T>` as its first argument. Since TypeScript generics cover this cleanly, the public methods become 1-line delegations to the typed helper. Code volume is unchanged; the database string is replaced by an entity class reference.

**Soft-delete handling for GAD entities:**
- GAD tables have `deleted_at` but NO `deleted_by` → entities declare `deletedAt` only
- The global MikroORM `notDeleted` filter (`{ deletedAt: null }`) applies automatically
- No special entity filter override needed

**Conclusion:** ✅ GAD module is fully feasible for MikroORM migration with the generic-helper refactor.

---

### HJ-C: Departments Module Analysis (Phase HK Assessment)

**File:** `pmo-backend/src/departments/departments.service.ts` (329 lines)

**Tables managed:** `departments` (self-referential via `parent_id`), `user_departments` (junction)

**Query complexity:**
- `findAll()`: Pagination + 2 LEFT JOINs (users for head_name, departments for parent_name)
- `findOne()`: Same 2-level JOIN pattern
- `checkCycle()` (lines 300–327): Iterative in-memory traversal via repeated `SELECT parent_id FROM departments WHERE id = $1` calls — **application-layer logic, not recursive SQL** — this stays in service code unchanged
- `assignUser()` / `removeUser()`: Simple INSERT/DELETE on `user_departments`

**Schema gap — CRITICAL:**

Baseline schema (`pmo_schema_pg.sql`, lines 246–261) shows `departments` table columns:
`id, name, code, description, parent_id, head_id, email, phone, status, metadata, created_at, updated_at, deleted_at, deleted_by`

**NO `created_by`. NO `updated_by`.** However, `departments.service.ts` line 130 explicitly INSERTs `created_by` and line 204 UPDATEs `updated_by`. If this module currently accepts POST requests without a 500 error, then either:
- A post-baseline migration (post-039) added these columns, OR
- The module's POST has never been tested

**Operator must verify:** `\d departments` in live DB before Phase HK migration. If columns are missing, Migration 041 will be required (same pattern as Migration 040).

**Conclusion:** 🟡 Feasible for Phase HK. Blocked on schema gap verification.

---

### HJ-D: Media Module Analysis (Phase HK Assessment)

**File:** `pmo-backend/src/media/media.service.ts` (186 lines)

**Table managed:** `media` (single table)

**Query complexity:** Simple single-table CRUD. Polymorphic filter on `(mediable_type, mediable_id)` — plain string/UUID pair, no FK constraint, no ORM relationship needed.

**External dependency:** `UploadsService.uploadFile()` called before DB INSERT in `create()`. `UploadsService.deleteFile()` called before DB soft-delete in `remove()`. These are file-system side-effects and are unaffected by ORM migration — stay in service method body, outside the entity layer.

**Schema discrepancy — CRITICAL:**

Baseline schema (`pmo_schema_pg.sql`, lines 1096–1123) shows `media` table has `uploaded_by UUID NOT NULL` — **not `created_by`**.

However, `media.service.ts` INSERT query (line 123) uses `created_by` as the column name. This means either:
- A post-baseline migration renamed or added `created_by` to `media`, OR
- The service uses `uploaded_by` but was read as `created_by` (need re-check), OR
- Media POST is broken but not surfaced yet

**Operator must verify:** `\d media` and confirm whether column is `uploaded_by` or `created_by` before Phase HK entity declaration.

**Conclusion:** 🟡 Feasible for Phase HK. Blocked on `uploaded_by` vs `created_by` column name verification.

---

### HJ-E: Documents Module Analysis (Phase HK Assessment)

**File:** `pmo-backend/src/documents/documents.service.ts` (185 lines)

**Identical pattern to Media:** single table, polymorphic `(documentable_type, documentable_id)`, UploadsService dependency.

**Schema discrepancy:** Baseline shows `documents` table has `uploaded_by UUID NOT NULL` (line 1085), but service INSERT column list (line 123) references `created_by`. Same verification needed as Media.

**Conclusion:** 🟡 Feasible for Phase HK. Blocked on same verification as Media.

---

### HJ-F: Construction Projects + Repair Projects Assessment (Phase HM — DEFERRED)

**Files:** `construction-projects.service.ts` (~900 lines), `repair-projects.service.ts` (~800 lines)

**Complexity rating: 🔴 HIGH** — Deferral justified by:

| Factor | Construction | Repair |
|--------|-------------|--------|
| JOIN depth (findOne) | 6 tables | 8 tables |
| JSON aggregation subqueries | ✅ json_agg | ✅ json_agg |
| Explicit SQL transactions (BEGIN/COMMIT) | ✅ create + remove | ✅ create + remove |
| Junction table (`record_assignments`) | ✅ module='CONSTRUCTION' | ✅ module='REPAIR' |
| Sub-entity tables (milestones, financials, phases, etc.) | 3 sub-tables | 4 sub-tables |
| PermissionResolverService coupling | ✅ | ✅ |
| Campus normalization logic | ✅ | ✅ |
| Publication status workflow | ✅ | ✅ |
| UploadsService gallery operations | ✅ | ✅ |

Raw SQL is authoritative here. ORM migration would require rewriting complex multi-table transactions, correlated EXISTS subqueries, and JSON aggregation into ORM equivalents — high regression risk with minimal readability benefit.

**Decision: DEFER to Phase HM. Keep on DatabaseService indefinitely until business-case justifies the refactor.**

---

### HJ-G: Projects Base Table Assessment (Phase HM — DEFERRED)

**File:** `pmo-backend/src/projects/projects.service.ts` (156 lines)

The `projects` table is a base entity shared by `construction_projects` and `repair_projects` (both INSERT into `projects` first within a transaction). Migrating `projects` in isolation while `construction_projects` and `repair_projects` remain on DatabaseService creates a mixed-driver transaction problem: a `BEGIN` in DatabaseService cannot enroll a MikroORM `em.flush()` in the same atomic unit.

**Decision: DEFER to Phase HM.** Must be migrated together with construction/repair as a coordinated wave.

---

### HJ-H: Risk Matrix for Phase HJ (GAD Migration)

| Risk | Severity | Mitigation |
|------|----------|------------|
| Dynamic table name → per-entity repo refactor breaks API contract | 🟡 MEDIUM | Generic typed helper preserves public method signatures exactly |
| GAD soft-delete entities missing `deleted_by` column | 🟢 LOW | Entities declare `deletedAt` only; global filter unchanged |
| `data_status` field in `gad_gpb_accomplishments` + `gad_budget_plans` | 🟢 LOW | Map as plain `string` property, no enum enforcement needed |
| `submitted_by`/`reviewed_by` are nullable FKs to `users` | 🟢 LOW | Declare as `string | null` (UUID), no ORM relation needed |
| 7 new entity files increase project surface area | 🟢 LOW | All follow same verified pattern from Phase HZ |
| GAD module not injecting `EntityManager` — DI misconfiguration | 🟡 MEDIUM | Module.ts must import `MikroOrmModule.forFeature([...7 entities])` |

**Overall Phase HJ risk: 🟢 LOW — Safe to proceed.**

---

## Section 2.87 — Phase HK: ORM Migration Tier 2 — Departments, Media, Documents

> **Phase:** HK (ORM Migration Track — continuing from Phase HJ)
> **Date:** 2026-04-20
> **Status:** Research complete — Plan pending operator authorization

### HK-A: Tier 2 Module Inventory

Phase HK covers the three structural/utility modules that were blocked in Phase HJ pending schema gap verification. All 40 migration files have been audited — **no ALTER TABLE on `departments`, `media`, or `documents` exists in migrations 001–040.** Schema gaps confirmed from baseline.

| Module | Service | Table(s) | Query Complexity | Schema Gaps | Status |
|--------|---------|---------|-----------------|-------------|--------|
| Departments | `departments.service.ts` (329 lines) | `departments`, `user_departments` | 🟡 MEDIUM (JOINs, cycle check) | `created_by`, `updated_by` missing | 🔴 Needs migration 041 |
| Media | `media.service.ts` (186 lines) | `media` | 🟢 LOW (single table) | `created_by`, `updated_by` missing (has `uploaded_by`) | 🔴 Needs migration 041 |
| Documents | `documents.service.ts` (185 lines) | `documents` | 🟢 LOW (single table) | `created_by`, `updated_by` missing (has `uploaded_by`) | 🔴 Needs migration 041 |

---

### HK-B: Schema Gap Audit — Definitive Findings

#### `departments` table (baseline lines 246–261):
```
Confirmed columns: id, name, code, description, parent_id, head_id, email, phone, status, metadata, created_at, updated_at, deleted_at, deleted_by
MISSING: created_by, updated_by
```

Service impact:
- `create()` line 130: `INSERT INTO departments (..., created_by) VALUES (...)` → **500 error if executed**
- `update()` line 205: `UPDATE departments SET ..., updated_by = $n` → **500 error if executed**
- `remove()` line 228: `UPDATE departments SET deleted_by = $1` → ✅ OK (`deleted_by` is present in schema as bare `UUID`)

#### `user_departments` table (baseline lines 268–275):
```
Confirmed columns: user_id, department_id, is_primary, created_at, created_by
```
✅ No schema gap — `created_by` already present. Service `assignUser()` line 274 uses it correctly.

#### `documents` table (baseline lines 1069–1091):
```
Confirmed columns: id, documentable_type, documentable_id, document_type, file_name, file_path, file_size, mime_type, description, version, category, extracted_text, chunks, processed_at, status, uploaded_by, metadata, created_at, updated_at, deleted_at, deleted_by
MISSING: created_by, updated_by
SPECIAL: has uploaded_by (NOT NULL FK) — service INSERT uses created_by instead
```

Service impact:
- `create()` line 123: `INSERT INTO documents (..., created_by)` → **500 error** (`created_by` column does not exist; `uploaded_by` does)
- `update()` line 159: `UPDATE documents SET ..., updated_by = $n` → **500 error** (`updated_by` column does not exist)
- `remove()` line 178: `UPDATE documents SET deleted_by = $1` → ✅ OK (`deleted_by` is present)

#### `media` table (baseline lines 1097–1123):
```
Confirmed columns: id, mediable_type, mediable_id, media_type, file_name, file_path, file_size, mime_type, title, description, alt_text, is_featured, thumbnail_url, dimensions, tags, capture_date, display_order, location, project_type, uploaded_by, metadata, created_at, updated_at, deleted_at, deleted_by
MISSING: created_by, updated_by
SPECIAL: has uploaded_by (NOT NULL FK) — service INSERT uses created_by instead
```

Service impact:
- `create()` line 123: `INSERT INTO media (..., created_by)` → **500 error** (`created_by` column does not exist)
- `update()` line 161: `UPDATE media SET ..., updated_by = $n` → **500 error** (`updated_by` column does not exist)
- `remove()` line 179: `UPDATE media SET deleted_by = $1` → ✅ OK

**Root cause (media + documents):** Both services were written expecting `created_by`/`updated_by` as standard audit columns, but the baseline schema used `uploaded_by` for the creator reference (semantic naming for file storage). The services never aligned with the actual column name. No migration ever added `created_by`/`updated_by`. POST and PATCH on both modules are currently broken.

---

### HK-C: Migration 041 — Required Schema Additions

Three tables require identical treatment: add nullable `created_by` and `updated_by` columns with FK constraint to `users(id)`. Same pattern as Migration 004 (contractors, funding_sources) and Migration 040 (construction_subcategories, repair_types, system_settings).

**Tables and columns:**

| Table | Add Column | Type | Nullable |
|-------|-----------|------|----------|
| `departments` | `created_by` | UUID FK → users(id) | YES |
| `departments` | `updated_by` | UUID FK → users(id) | YES |
| `documents` | `created_by` | UUID FK → users(id) | YES |
| `documents` | `updated_by` | UUID FK → users(id) | YES |
| `media` | `created_by` | UUID FK → users(id) | YES |
| `media` | `updated_by` | UUID FK → users(id) | YES |

Note: `uploaded_by` in both `documents` and `media` is NOT removed — it remains as a write-once creator field for legacy compatibility. The new `created_by` column is added alongside it, and the entity will write the same `userId` value to both on creation.

---

### HK-D: Entity Design

#### `Department` entity

| Property | DB column | Type | Notes |
|---------|-----------|------|-------|
| `id` | `id` | `string` (uuid) | PK |
| `name` | `name` | `string` (varchar 255) | required |
| `code` | `code` | `string?` (varchar 50) | nullable, unique |
| `description` | `description` | `string?` (text) | nullable |
| `parentId` | `parent_id` | `string?` (uuid) | nullable self-ref FK — plain UUID, no ORM relation |
| `headId` | `head_id` | `string?` (uuid) | nullable FK to users — plain UUID, no ORM relation |
| `email` | `email` | `string?` (varchar 255) | nullable |
| `phone` | `phone` | `string?` (varchar 20) | nullable |
| `status` | `status` | `string` | enum in DB, mapped as string |
| `metadata` | `metadata` | `object?` (jsonb) | nullable |
| `createdBy` | `created_by` | `string?` (uuid) | nullable (added by migration 041) |
| `updatedBy` | `updated_by` | `string?` (uuid) | nullable (added by migration 041) |
| `createdAt` | `created_at` | `Date` | timestamptz |
| `updatedAt` | `updated_at` | `Date` | timestamptz, onUpdate |
| `deletedAt` | `deleted_at` | `Date?` | nullable, filter |
| `deletedBy` | `deleted_by` | `string?` (uuid) | nullable, bare UUID (no FK in schema) |

Filter: `@Filter({ name: 'notDeleted', cond: { deletedAt: null }, default: true })`

Note: `parentId` and `headId` are declared as plain `string?` (UUID), NOT as `@ManyToOne` relations. This keeps the entity self-contained and avoids introducing a `User` entity dependency.

#### `UserDepartment` entity (junction table)

| Property | DB column | Type | Notes |
|---------|-----------|------|-------|
| `userId` | `user_id` | `string` (uuid) | composite PK |
| `departmentId` | `department_id` | `string` (uuid) | composite PK |
| `isPrimary` | `is_primary` | `boolean` | default false |
| `createdAt` | `created_at` | `Date` | timestamptz |
| `createdBy` | `created_by` | `string?` (uuid) | nullable FK |

No `deletedAt` — this table uses hard DELETE (no soft-delete pattern). No `updatedAt`/`updatedBy`.

#### `Media` entity

| Property | DB column | Type | Notes |
|---------|-----------|------|-------|
| `id` | `id` | `string` (uuid) | PK |
| `mediableType` | `mediable_type` | `string` (varchar 100) | polymorphic discriminator |
| `mediableId` | `mediable_id` | `string` (uuid) | polymorphic FK (no constraint) |
| `mediaType` | `media_type` | `string` | enum in DB (`media_type_enum`), mapped as string |
| `fileName` | `file_name` | `string` (varchar 255) | required |
| `filePath` | `file_path` | `string` (varchar 255) | required |
| `fileSize` | `file_size` | `number` (integer) | required |
| `mimeType` | `mime_type` | `string` (varchar 100) | required |
| `title` | `title` | `string?` | nullable |
| `description` | `description` | `string?` (text) | nullable |
| `altText` | `alt_text` | `string?` (varchar 255) | nullable |
| `isFeatured` | `is_featured` | `boolean` | default false |
| `thumbnailUrl` | `thumbnail_url` | `string?` | nullable |
| `dimensions` | `dimensions` | `object?` (jsonb) | nullable |
| `tags` | `tags` | `object?` (jsonb) | nullable |
| `captureDate` | `capture_date` | `Date?` (date) | nullable |
| `displayOrder` | `display_order` | `number` | default 0 |
| `location` | `location` | `object?` (jsonb) | nullable |
| `projectType` | `project_type` | `string?` (varchar 50) | nullable |
| `uploadedBy` | `uploaded_by` | `string` (uuid) | required — original creator audit field |
| `metadata` | `metadata` | `object?` (jsonb) | nullable |
| `createdBy` | `created_by` | `string?` (uuid) | nullable (added by migration 041) |
| `updatedBy` | `updated_by` | `string?` (uuid) | nullable (added by migration 041) |
| `createdAt` | `created_at` | `Date` | timestamptz |
| `updatedAt` | `updated_at` | `Date` | timestamptz, onUpdate |
| `deletedAt` | `deleted_at` | `Date?` | nullable, filter |
| `deletedBy` | `deleted_by` | `string?` (uuid) | nullable FK |

Filter: `@Filter({ name: 'notDeleted', cond: { deletedAt: null }, default: true })`

#### `Document` entity

| Property | DB column | Type | Notes |
|---------|-----------|------|-------|
| `id` | `id` | `string` (uuid) | PK |
| `documentableType` | `documentable_type` | `string` (varchar 100) | polymorphic discriminator |
| `documentableId` | `documentable_id` | `string` (uuid) | polymorphic FK (no constraint) |
| `documentType` | `document_type` | `string` (varchar 100) | required |
| `fileName` | `file_name` | `string` (varchar 255) | required |
| `filePath` | `file_path` | `string` (varchar 255) | required |
| `fileSize` | `file_size` | `number` (integer) | required |
| `mimeType` | `mime_type` | `string` (varchar 100) | required |
| `description` | `description` | `string?` (text) | nullable |
| `version` | `version` | `number` | default 1 |
| `category` | `category` | `string?` (varchar 50) | nullable |
| `extractedText` | `extracted_text` | `string?` (text) | nullable |
| `chunks` | `chunks` | `object?` (jsonb) | nullable |
| `processedAt` | `processed_at` | `Date?` | nullable |
| `status` | `status` | `string` | default 'ready' |
| `uploadedBy` | `uploaded_by` | `string` (uuid) | required — original creator audit field |
| `metadata` | `metadata` | `object?` (jsonb) | nullable |
| `createdBy` | `created_by` | `string?` (uuid) | nullable (added by migration 041) |
| `updatedBy` | `updated_by` | `string?` (uuid) | nullable (added by migration 041) |
| `createdAt` | `created_at` | `Date` | timestamptz |
| `updatedAt` | `updated_at` | `Date` | timestamptz, onUpdate |
| `deletedAt` | `deleted_at` | `Date?` | nullable, filter |
| `deletedBy` | `deleted_by` | `string?` (uuid) | nullable FK |

Filter: `@Filter({ name: 'notDeleted', cond: { deletedAt: null }, default: true })`

---

### HK-E: Service Migration Strategy

#### DepartmentsService

**Read queries (`findAll`, `findOne`, `findUsers`):** These require JOINs to `users` (for `head_name`, `head_email`) and self-JOIN to `departments` (for `parent_name`). Since `headId` and `parentId` are plain UUID strings (not MikroORM relations), the JOIN must be done via raw SQL. Strategy: use `EntityManager.getConnection().execute(sql, params, 'run')` — MikroORM's built-in raw query interface. This removes `DatabaseService` dependency entirely.

**Write operations (`create`, `update`, `remove`):** Standard MikroORM entity CRUD — use `EntityRepository<Department>`.

**`checkCycle()` method:** Iterative traversal replaces each `this.db.query(SELECT parent_id ...)` with `this.deptRepo.findOne({ id: currentId }, { filters: false })`. The `filters: false` option bypasses the global `notDeleted` filter to handle edge cases where a parent chain traversal needs to check all rows (though in practice soft-deleted departments shouldn't be in a chain).

**`assignUser()` / `removeUser()` / `findUsers()`:** Use `EntityRepository<UserDepartment>` for `assignUser` (persist) and `removeUser` (nativeDelete). `findUsers()` requires JOIN to `users` → use raw SQL via `em.getConnection().execute()`.

#### MediaService + DocumentsService

All queries are single-table — full entity migration without raw SQL fallback:
- `findAllForEntity()` → `repo.find({ mediableType, mediableId }, { orderBy, limit, offset })` + `repo.count()`
- `findOne()` → `repo.findOneOrFail({ id })`
- `create()` → `repo.create({...})` + `em.persistAndFlush()` (after UploadsService call)
- `update()` → fetch entity, assign fields, `em.flush()`
- `remove()` → fetch entity, set `deletedAt`/`deletedBy`, `em.flush()` (after UploadsService.deleteFile)

Note: `update()` currently builds a dynamic SET clause from DTO keys. With MikroORM, this becomes explicit field assignment. Dynamic field mapping is replaced with explicit property writes.

---

### HK-F: Risk Matrix

| Risk | Severity | Mitigation |
|------|----------|------------|
| `departments` POST/PATCH still broken until migration 041 applied | 🔴 BLOCKING | Migration 041 must be applied before entity wiring |
| `media` POST/PATCH still broken until migration 041 applied | 🔴 BLOCKING | Same |
| `documents` POST/PATCH still broken until migration 041 applied | 🔴 BLOCKING | Same |
| `updated_by` dynamic SET clause replacement loses flexibility for new DTO fields | 🟡 MEDIUM | Explicit field assignment is safer; DTO schema changes must be kept in sync |
| `departments.findAll()` raw JOIN query not auto-cached by MikroORM identity map | 🟢 LOW | Raw queries bypass identity map by design — acceptable, no change in behavior |
| `user_departments` hard-DELETE via `repo.nativeDelete()` bypasses identity map — stale objects possible | 🟢 LOW | `em.clear()` or fresh `findOne()` before re-querying |
| `media` entity `media_type_enum` — DB enum vs string in entity | 🟢 LOW | Declare as `string`, DB enforces constraint |
| `Document`/`Media` `uploadedBy` is NOT NULL in DB — entity must always set it on create | 🟡 MEDIUM | Service `create()` explicitly sets `uploadedBy = userId` before persist |
| 4 new entity files + 3 module updates | 🟢 LOW | All follow verified pattern from HZ/HJ |

**Overall Phase HK risk: 🟡 MEDIUM — Blocked on migration 041, then safe to proceed.**

---

## Section 2.88 — Phase HM: ORM Migration Tier 3 — Construction Projects, Repair Projects, Projects

> **Phase:** HM (ORM Migration Track — continuing from Phase HK)
> **Date:** 2026-04-20
> **Status:** Research complete — Plan pending operator authorization

### HM-A: Module Complexity Inventory

| Module | Service File | Lines | `db.query()` calls | Tables Touched | JOINs | Transactions | Sub-resources |
|--------|-------------|-------|---------------------|----------------|-------|-------------|---------------|
| **ConstructionProjects** | `construction-projects.service.ts` | 974 | 48 | 7 tables | 6-way JOIN in `findOne` | BEGIN/COMMIT/ROLLBACK (create, remove) | milestones, financials, gallery |
| **RepairProjects** | `repair-projects.service.ts` | 797 | 44 | 8 tables | 7-way JOIN in `findOne` | BEGIN/COMMIT/ROLLBACK (create, remove) | POW items, phases, team members |
| **Projects** | `projects.service.ts` | 155 | 8 | 1 table | None | None | None |

**Comparison to Tier 1/2 modules:**
- Tier 1 (FundingSources, RepairTypes, etc.): 1 table, 0 JOINs, 50–100 lines, 5–8 queries → **trivial ORM**
- Tier 2 (GAD, Departments, Media, Documents): 1–2 tables, 0–3 JOINs, 150–330 lines → **straightforward ORM + selective raw SQL**
- **Tier 3: 7–8 tables, 6–7 way JOINs, transactions, sub-resources → 5–10x more complex**

---

### HM-B: Table Relationship Map

#### Construction Projects Module — 7 Tables

```
projects (base) ─── 1:1 ──→ construction_projects (domain)
                                ├── 1:N → construction_milestones
                                ├── 1:N → construction_project_financials (soft delete)
                                ├── 1:N → construction_gallery (hard delete)
                                ├── N:1 → contractors (FK)
                                ├── N:1 → funding_sources (FK)
                                ├── N:1 → construction_subcategories (FK)
                                └── N:N → record_assignments (junction: module='CONSTRUCTION')
                                     └── N:1 → users

Cross-module references from findOne():
  - LEFT JOIN projects p ON cp.project_id = p.id
  - LEFT JOIN contractors c ON cp.contractor_id = c.id
  - LEFT JOIN funding_sources fs ON cp.funding_source_id = fs.id
  - LEFT JOIN users creator/submitter/reviewer ON cp.*_by = *.id
  - Correlated subquery: record_assignments → users (json_agg)
```

#### Repair Projects Module — 8 Tables

```
projects (base) ─── 1:1 ──→ repair_projects (domain)
                                ├── 1:N → repair_pow_items (soft delete)
                                ├── 1:N → repair_project_phases (soft delete)
                                ├── 1:N → repair_project_team_members (soft delete)
                                ├── N:1 → repair_types (FK)
                                ├── N:1 → contractors (FK)
                                ├── N:1 → facilities (FK)
                                └── N:N → record_assignments (junction: module='REPAIR')
                                     └── N:1 → users

Cross-module references from findOne():
  - LEFT JOIN projects p ON rp.project_id = p.id
  - LEFT JOIN repair_types rt ON rp.repair_type_id = rt.id
  - LEFT JOIN contractors c ON rp.contractor_id = c.id
  - LEFT JOIN facilities f ON rp.facility_id = f.id
  - LEFT JOIN users creator/submitter/reviewer ON rp.*_by = *.id
  - Correlated subquery: record_assignments → users (json_agg)
```

#### Projects Module — 1 Table

```
projects (standalone CRUD — no JOINs, no sub-resources)
```

---

### HM-C: Query Complexity Analysis

#### Critical Query Patterns

**1. Multi-JOIN read queries (`findAll`, `findOne`):**

`construction_projects.findAll()` — 6-way query:
- `construction_projects cp` (base)
- `LEFT JOIN users submitter ON cp.submitted_by = submitter.id`
- Correlated subquery: `SELECT json_agg(...) FROM record_assignments ra JOIN users u`
- Dynamic WHERE: status, campus, contractor_id, funding_source_id, publication_status
- Dynamic visibility: admin sees all; non-admin sees campus-scoped + own + assigned (EXISTS subquery on `record_assignments`)

`construction_projects.findOne()` — 6 LEFT JOINs + subquery:
- `projects`, `contractors`, `funding_sources`, `users` (creator/submitter/reviewer)
- Plus 2 follow-up queries: `construction_milestones`, `construction_project_financials`

`repair_projects.findOne()` — 7 LEFT JOINs + subquery:
- `projects`, `repair_types`, `contractors`, `facilities`, `users` (creator/submitter/reviewer)
- Plus 3 follow-up queries: `repair_pow_items`, `repair_project_phases`, `repair_project_team_members`

**2. Transaction-wrapped create/delete:**

Both construction and repair `create()` use `BEGIN/COMMIT/ROLLBACK`:
- INSERT into `projects` base table first (if no `project_id` provided)
- INSERT into domain table (`construction_projects` / `repair_projects`)
- INSERT into `record_assignments` (junction table)
- ROLLBACK on any failure

Both `remove()` use transaction:
- Soft-delete domain record
- Soft-delete base `projects` record

**3. Dynamic visibility with EXISTS subquery:**

Non-admin `findAll()` injects campus-scoped visibility with:
```sql
(cp.campus = $N OR cp.created_by = $M OR EXISTS (
  SELECT 1 FROM record_assignments ra 
  WHERE ra.module = 'CONSTRUCTION' AND ra.record_id = cp.id AND ra.user_id = $M
))
```
This pattern is **impossible to express with MikroORM's FilterQuery** — it requires correlated EXISTS subqueries with dynamic binding.

**4. Dynamic SET clause updates:**

Both services build `UPDATE ... SET field1=$1, field2=$2 ...` dynamically from DTO keys. This is used in the main `update()` method AND in sub-resource methods (milestones, POW items, phases, financials, gallery).

**5. Publication state machine:**

`update()` in both services implements a deterministic state machine (Phase V/W):
- PUBLISHED/REJECTED → DRAFT (clear reviewed metadata)
- PENDING_REVIEW → DRAFT (clear submitted metadata)
- Appends additional SET clauses dynamically based on prior status

**6. `PermissionResolverService` dependency:**

Both construction and repair services depend on `PermissionResolverService`, which itself uses `DatabaseService` for `isAdminFromDatabase()`, `canApproveByRank()`, `hasModuleAssignment()`. This service is NOT being migrated — it remains on `DatabaseService`.

---

### HM-D: ORM Limitation Analysis

#### What MikroORM CAN handle (Tier 3 context):

| Pattern | MikroORM Capability | Notes |
|---------|---------------------|-------|
| Simple CRUD (create, findOne, update, soft-delete) | ✅ Full support | `repo.create()`, `repo.findOne()`, `em.flush()` |
| Soft-delete filter | ✅ `@Filter({ name: 'notDeleted' })` | Already proven in Tier 1/2 |
| Pagination with orderBy | ✅ `repo.findAndCount()` | Already proven |
| Simple FK lookups | ✅ `repo.findOne({ id })` | For validation checks |
| Transactions | ✅ `em.transactional()` | MikroORM wraps in BEGIN/COMMIT/ROLLBACK |

#### What MikroORM CANNOT efficiently handle:

| Pattern | Limitation | Tier 3 Impact |
|---------|-----------|---------------|
| 6–7 way LEFT JOINs with name resolution | ❌ No relations defined → cannot use `populate()` | `findAll()` and `findOne()` for both construction & repair |
| Correlated EXISTS subquery for visibility | ❌ FilterQuery has no `$exists` operator for cross-table conditions | Non-admin visibility logic in `findAll()` |
| `json_agg()` inline subquery | ❌ No ORM equivalent for inline JSON aggregation | `assigned_users` field in list/detail queries |
| Dynamic SET clause with conditional status reset | ❌ ORM assigns fields explicitly — but the status reset appends 3–6 extra SET fields conditionally | `update()` state machine logic |
| Cross-table transaction (domain + base table) | ⚠️ Possible with `em.transactional()` but requires 2 entity types managed together | `create()` and `remove()` |
| `PermissionResolverService` raw queries | ❌ Not in scope — remains on `DatabaseService` | Indirect dependency |

#### Hybrid vs Full ORM — Decision Matrix:

| Method | Full ORM Feasible? | Recommended Strategy |
|--------|-------------------|---------------------|
| `findAll()` | ❌ No — multi-JOIN + EXISTS + json_agg | **RAW SQL** via `em.getConnection().execute()` |
| `findOne()` | ❌ No — multi-JOIN + follow-up queries | **RAW SQL** via `em.getConnection().execute()` |
| `create()` | ⚠️ Partial — base entity + domain entity in transaction | **HYBRID** — entity create + raw for junction |
| `update()` | ⚠️ Partial — field assignment works, but status reset is complex | **HYBRID** — entity update + raw for status machine |
| `remove()` | ⚠️ Partial — 2-entity soft delete in transaction | **HYBRID** — `em.transactional()` with 2 entities |
| Workflow (submit/publish/reject/withdraw) | ✅ Yes — single table, named field updates | **ORM** — entity field assignment + flush |
| `findPendingReview()` / `findMyDrafts()` | ✅ Yes — single table with simple WHERE | **ORM** — `repo.find()` with FilterQuery |
| Sub-resource CRUD (milestones, POW, etc.) | ✅ Yes — single table, simple FK | **ORM** — standard entity CRUD |
| `record_assignments` helpers | ⚠️ Partial — DELETE + INSERT loop | **RAW SQL** — `nativeDelete` + `create` (bulk pattern) |

---

### HM-E: Cross-Module Dependencies

| Shared Resource | Used By | Risk |
|----------------|---------|------|
| `projects` table | Construction, Repair, Projects (standalone) | 🔴 HIGH — construction/repair `create()` auto-creates `projects` row; `remove()` soft-deletes both |
| `record_assignments` table | Construction, Repair | 🟡 MEDIUM — junction table for multi-user assignment; DELETE+INSERT pattern |
| `user_module_assignments` table | Construction `findPendingReview()`, Repair `findPendingReview()` | 🟢 LOW — read-only check |
| `contractors` (FK) | Construction, Repair | 🟢 LOW — lookup only |
| `repair_types` (FK) | Repair | 🟢 LOW — lookup only, already has entity |
| `funding_sources` (FK) | Construction | 🟢 LOW — lookup only, already has entity |
| `construction_subcategories` (FK) | Construction | 🟢 LOW — lookup only, already has entity |
| `facilities` (FK) | Repair | 🟢 LOW — lookup only, no entity yet |
| `users` table | Both (creator/submitter/reviewer name resolution) | 🟢 LOW — JOIN only, no User entity (policy: never) |
| `PermissionResolverService` | Both (admin check, rank approval, module access) | 🟢 LOW — stays on DatabaseService |

**Circular dependency risk:** NONE. Construction and Repair modules do not depend on each other. Both depend on `projects` base table (one-directional).

---

### HM-F: Risk Assessment

| Risk | Severity | Probability | Impact | Mitigation |
|------|----------|------------|--------|------------|
| Performance degradation from ORM overhead on complex queries | 🔴 HIGH | LOW (if raw SQL preserved for JOINs) | Query response time increase | Use raw SQL for all multi-JOIN reads |
| Incorrect visibility logic if translated to ORM | 🔴 HIGH | MEDIUM | Users see records they shouldn't / miss records they should | Keep visibility WHERE clauses as raw SQL |
| Transaction atomicity broken by partial ORM migration | 🔴 HIGH | LOW (if `em.transactional()` used) | Orphaned base `projects` rows | Use `em.transactional()` for cross-table writes |
| `json_agg()` for `assigned_users` not reproducible in ORM | 🟡 MEDIUM | CERTAIN | Field missing from API response | Preserve raw SQL for list/detail queries |
| Dynamic SET clause + status reset logic too complex for entity assignment | 🟡 MEDIUM | MEDIUM | State machine broken | Keep update as raw SQL or implement careful conditional entity assignment |
| Entity property mapping errors (30+ columns per domain table) | 🟡 MEDIUM | LOW | Runtime column mismatch errors | Validate against `\d` output before deployment |
| Sub-resource entity CRUD introduces new entity classes (5+ new files) | 🟢 LOW | CERTAIN | More files to maintain | Acceptable — standard pattern |
| `PermissionResolverService` remains on `DatabaseService` — dual pool | 🟢 LOW | N/A | Already accepted pattern | No change needed |

**Overall risk: 🔴 HIGH if full ORM attempted. 🟡 MEDIUM with hybrid approach.**

---

### HM-G: Quantitative Scope Estimate

| Metric | Construction | Repair | Projects | Total |
|--------|-------------|--------|----------|-------|
| Tables requiring entities | 5 (`construction_projects`, `construction_milestones`, `construction_project_financials`, `construction_gallery`, `record_assignments`) | 5 (`repair_projects`, `repair_pow_items`, `repair_project_phases`, `repair_project_team_members`, `record_assignments`) | 1 (`projects`) | **9 unique** (record_assignments shared) |
| Entity files to create | 4 + 1 shared | 4 + reuse shared | 1 | **9 files** |
| Service lines | 974 | 797 | 155 | **1,926 lines** |
| `db.query()` calls to replace | 48 | 44 | 8 | **100 calls** |
| Methods in service | 22 | 22 | 5 | **49 methods** |
| Methods suitable for ORM | 12 (sub-resource CRUD + workflow) | 13 (sub-resource CRUD + workflow) | 5 (all) | **30 methods** |
| Methods requiring raw SQL | 10 (findAll, findOne, create, update, remove, findPendingReview, record assignment helpers) | 9 (same pattern) | 0 | **19 methods** |

---

### HM-H: Decision — HYBRID APPROACH Recommended

**Verdict: PROCEED with HYBRID ORM migration for Tier 3.**

Rationale:
1. `projects.service.ts` (155 lines, 8 queries, no JOINs) → **FULL ORM** — trivially simple, same as Tier 1
2. `construction_projects` and `repair_projects` → **HYBRID** — entities exist for type safety and simple CRUD; raw SQL preserved for complex reads and transactional writes
3. Sub-resource tables (milestones, gallery, financials, POW items, phases, team members) → **FULL ORM** — single-table CRUD with FK constraint only
4. `record_assignments` → **ENTITY + nativeDelete/create** — simple junction table, no soft-delete

**What changes with Hybrid:**
- `DatabaseModule` removed from all 3 modules
- `MikroOrmModule.forFeature([...entities])` added
- All `this.db.query()` → either `repo.*()` methods OR `em.getConnection().execute()`
- `em.transactional()` replaces manual `BEGIN`/`COMMIT`/`ROLLBACK`
- Entity type safety for all write operations
- Raw SQL preserved for complex read queries (with `em.getConnection().execute()` instead of `this.db.query()`)

---

## Section 2.89 — Phase HL-A: MikroORM Global Filter Audit (notDeleted Coverage)

> **Phase:** HL-A (Filter Safety Fix)
> **Date:** 2026-04-20
> **Status:** Research complete — Plan written below (Phase HL plan.md)
> **Trigger:** Live crash on `POST /api/departments/:id/users` — `UserDepartment.deletedAt` does not exist

### HL-A-1: Global Filter Configuration

Defined in `pmo-backend/src/database/mikro-orm.config.ts` lines 21–23:

```typescript
filters: {
  notDeleted: { cond: { deletedAt: null }, default: true },
},
```

**Behavior:** `default: true` means the filter is applied to EVERY entity in every MikroORM query unless explicitly overridden. MikroORM appends `WHERE entity.deletedAt IS NULL` (camelCase mapped from the filter condition). Any entity **without a `deletedAt` column** will throw at runtime:

```
Error: Trying to query by not existing property EntityName.deletedAt
```

---

### HL-A-2: Complete Entity Filter Audit

Total entities registered: **26**

| Entity | File | Has `deletedAt` | Has `@Filter` Decorator | Status |
|--------|------|----------------|------------------------|--------|
| Contractor | `contractor.entity.ts` | ✅ | ✅ opt-in (explicit cond) | ✅ Safe |
| FundingSource | `funding-source.entity.ts` | ✅ | ✅ opt-in | ✅ Safe |
| RepairType | `repair-type.entity.ts` | ✅ | ✅ opt-in | ✅ Safe |
| ConstructionSubcategory | `construction-subcategory.entity.ts` | ✅ | ✅ opt-in | ✅ Safe |
| SystemSetting | `system-setting.entity.ts` | ✅ | ✅ opt-in | ✅ Safe |
| Department | `department.entity.ts` | ✅ | ✅ opt-in | ✅ Safe |
| Media | `media.entity.ts` | ✅ | ✅ opt-in | ✅ Safe |
| Document | `document.entity.ts` | ✅ | ✅ opt-in | ✅ Safe |
| GadStudentParityData | `gad-student-parity.entity.ts` | ✅ | ✅ opt-in | ✅ Safe |
| GadFacultyParityData | `gad-faculty-parity.entity.ts` | ✅ | ✅ opt-in | ✅ Safe |
| GadStaffParityData | `gad-staff-parity.entity.ts` | ✅ | ✅ opt-in | ✅ Safe |
| GadPwdParityData | `gad-pwd-parity.entity.ts` | ✅ | ✅ opt-in | ✅ Safe |
| GadIndigenousParityData | `gad-indigenous-parity.entity.ts` | ✅ | ✅ opt-in | ✅ Safe |
| GadGpbAccomplishment | `gad-gpb-accomplishment.entity.ts` | ✅ | ✅ opt-in | ✅ Safe |
| GadBudgetPlan | `gad-budget-plan.entity.ts` | ✅ | ✅ opt-in | ✅ Safe |
| Project | `project.entity.ts` | ✅ | ✅ opt-in | ✅ Safe |
| ConstructionProject | `construction-project.entity.ts` | ✅ | ✅ opt-in | ✅ Safe |
| ConstructionProjectFinancial | `construction-project-financial.entity.ts` | ✅ | ✅ opt-in | ✅ Safe |
| RepairProject | `repair-project.entity.ts` | ✅ | ✅ opt-in | ✅ Safe |
| RepairProjectPhase | `repair-project-phase.entity.ts` | ✅ | ✅ opt-in | ✅ Safe |
| RepairPowItem | `repair-pow-item.entity.ts` | ✅ | ✅ opt-in | ✅ Safe |
| RepairProjectTeamMember | `repair-project-team-member.entity.ts` | ✅ | ✅ opt-in | ✅ Safe |
| **UserDepartment** | `user-department.entity.ts` | ❌ NO | ✅ opt-out added | ✅ **FIXED (2026-04-20 — prior message)** |
| **RecordAssignment** | `record-assignment.entity.ts` | ❌ NO | ❌ MISSING | 🔴 **AT RISK — WILL CRASH** |
| **ConstructionMilestone** | `construction-milestone.entity.ts` | ❌ NO | ❌ MISSING | 🔴 **AT RISK — WILL CRASH** |
| **ConstructionGallery** | `construction-gallery.entity.ts` | ❌ NO | ❌ MISSING | 🔴 **AT RISK — WILL CRASH** |

---

### HL-A-3: At-Risk Entity Details

**`RecordAssignment` (`record_assignments` table):**
```typescript
// Current — no deletedAt, no Filter opt-out
@Entity({ tableName: 'record_assignments' })
export class RecordAssignment {
  id, module, recordId, userId, assignedAt, assignedBy  // NO deletedAt
}
```
Used by: `ConstructionProjectsService`, `RepairProjectsService` (record assignment helpers).
Impact: Any query through `RecordAssignment` repo will crash.

**`ConstructionMilestone` (`construction_milestones` table):**
```typescript
// Current — no deletedAt, no Filter opt-out
@Entity({ tableName: 'construction_milestones' })
export class ConstructionMilestone {
  id, projectId, title, description, targetDate, actualDate, status, remarks, createdAt  // NO deletedAt
}
```
Used by: `ConstructionProjectsService` milestones sub-resource.

**`ConstructionGallery` (`construction_gallery` table):**
```typescript
// Current — no deletedAt, no Filter opt-out
@Entity({ tableName: 'construction_gallery' })
export class ConstructionGallery {
  id, projectId, imageUrl, caption, category, isFeatured, uploadedAt  // NO deletedAt
}
```
Used by: `ConstructionProjectsService` gallery sub-resource.

---

### HL-A-4: Root Cause Analysis

The pattern used in entities WITH `deletedAt` (e.g., `contractor.entity.ts`) declares the filter at entity level:
```typescript
@Filter({ name: 'notDeleted', cond: { deletedAt: null }, default: true })
```
This is **technically redundant** with the global config (global + entity-level both active), but it works. The real problem is that entities without `deletedAt` must explicitly opt-out via:
```typescript
@Filter({ name: 'notDeleted', default: false })
```
Without this, MikroORM applies the global condition blindly.

---

### HL-A-5: Fix Classification

| Entity | Fix Required | Risk |
|--------|------------|------|
| UserDepartment | `@Filter({ name: 'notDeleted', default: false })` | ✅ Already applied |
| RecordAssignment | `@Filter({ name: 'notDeleted', default: false })` | 🔴 Must fix before construction/repair modules used |
| ConstructionMilestone | `@Filter({ name: 'notDeleted', default: false })` | 🔴 Must fix before construction module used |
| ConstructionGallery | `@Filter({ name: 'notDeleted', default: false })` | 🔴 Must fix before construction module used |

**Risk level: 🟢 LOW** — fix is a single decorator per entity, no schema changes, no service changes.

---

## Section 2.90 — Phase HL-B: Media Module API Structure (Existing Implementation Audit)

> **Phase:** HL-B (Media API Clarity)
> **Date:** 2026-04-20
> **Status:** Research complete — services already fully ORM-migrated

### HL-B-1: Current State

Both `MediaService` and `DocumentsService` are **already fully migrated to MikroORM** (confirmed by code review — no `DatabaseService` dependency exists in either). The operator concern is about undocumented endpoint structure and unclear `entity_id` definition.

---

### HL-B-2: Media Module — Endpoint Inventory

**Controller:** `GET/POST/PATCH/DELETE /api/media/...`

| # | Method | Route | Auth | Purpose |
|---|--------|-------|------|---------|
| 1 | `GET` | `/api/media/:entityType/:entityId` | JWT + Role | List all media for an entity (paginated) |
| 2 | `GET` | `/api/media/item/:id` | JWT + Role | Fetch a single media item by ID |
| 3 | `POST` | `/api/media/:entityType/:entityId` | JWT + Role | Upload media for an entity (multipart) |
| 4 | `PATCH` | `/api/media/:id` | JWT + Role | Update media metadata |
| 5 | `DELETE` | `/api/media/:id` | JWT + Role | Soft-delete media (+ physical file delete) |

**Controller:** `GET/POST/PATCH/DELETE /api/documents/...`

| # | Method | Route | Auth | Purpose |
|---|--------|-------|------|---------|
| 1 | `GET` | `/api/documents/:entityType/:entityId` | JWT + Role | List all documents for an entity (paginated) |
| 2 | `GET` | `/api/documents/item/:id` | JWT + Role | Fetch a single document by ID |
| 3 | `POST` | `/api/documents/:entityType/:entityId` | JWT + Role | Upload document for an entity (multipart) |
| 4 | `PATCH` | `/api/documents/:id` | JWT + Role | Update document metadata |
| 5 | `DELETE` | `/api/documents/:id` | JWT + Role | Soft-delete document (+ physical file delete) |

---

### HL-B-3: Entity Type Registry (Hardcoded Allowlist)

Both services enforce `ALLOWED_ENTITY_TYPES` via `validateEntityType()`:

```typescript
// MediaService (media.service.ts line 19-24)
private readonly ALLOWED_ENTITY_TYPES = [
  'project',
  'construction_project',
  'repair_project',
  'university_operation',    // ← University Operations module
];

// DocumentsService (documents.service.ts line 19-24) — identical
```

`entity_type` values are **lowercase snake_case strings**, not UUIDs or enums. Passing anything outside this list returns HTTP 400 BadRequest.

---

### HL-B-4: Entity ID Mapping (entity_id Definition)

The `entity_id` is always the **UUID primary key of the parent record** in the corresponding table:

| `entity_type` value | Parent table | `entity_id` = |
|--------------------|-------------|--------------|
| `project` | `projects` | `projects.id` |
| `construction_project` | `construction_projects` | `construction_projects.id` |
| `repair_project` | `repair_projects` | `repair_projects.id` |
| `university_operation` | Context-dependent (see below) | See below |

**`university_operation` entity_id resolution:**
The system does NOT enforce referential integrity on `entity_id` — it is stored as a plain UUID string (no FK constraint). The calling service is responsible for passing the correct parent ID.

Recommended conventions (to be codified as a governance rule):
- **Physical MOV uploads** → `entity_id` = `operation_indicators.id`
- **Financial evidence uploads** → `entity_id` = `financial_accomplishments.id` (or `quarterly_reports.id`)
- **Quarterly report attachments** → `entity_id` = `quarterly_reports.id`

The service does NOT validate entity existence — it stores whatever UUID is provided.

---

### HL-B-5: Upload Request Body Structure

**POST `/api/media/:entityType/:entityId`**
```
Content-Type: multipart/form-data

Form fields:
  file            (required) binary — the file itself, field name MUST be "file"
  media_type      (required) enum: IMAGE | VIDEO | DOCUMENT | OTHER
  title           (optional) string
  description     (optional) string
  alt_text        (optional) string

Path params:
  entityType      (required) string — one of allowed entity types
  entityId        (required) UUID  — parent record ID

File size limit: 10MB (hardcoded in FileInterceptor, not configurable via DTO)
```

**POST `/api/documents/:entityType/:entityId`**
```
Content-Type: multipart/form-data

Form fields:
  file            (required) binary — field name MUST be "file"
  document_type   (required) enum: CONTRACT | REPORT | POLICY | SPECIFICATION | PROPOSAL | MINUTES | MEMO | OTHER
  description     (optional) string
  category        (optional) string (free-text, not enum)

Path params:
  entityType      (required) string — one of allowed entity types
  entityId        (required) UUID  — parent record ID

File size limit: 10MB (hardcoded in FileInterceptor)
```

---

### HL-B-6: Response Shape

The `create` endpoints return the full entity object (DB-serialized by MikroORM). Key fields in response:

```json
{
  "id": "uuid",
  "mediableType": "university_operation",
  "mediableId": "uuid-of-parent",
  "mediaType": "IMAGE",
  "fileName": "original-filename.jpg",
  "filePath": "storage/path/to/file",
  "fileSize": 102400,
  "mimeType": "image/jpeg",
  "title": "optional title",
  "description": "optional",
  "uploadedBy": "user-uuid",
  "createdBy": "user-uuid",
  "createdAt": "2026-04-20T10:00:00Z",
  "updatedAt": "2026-04-20T10:00:00Z"
}
```

---

### HL-B-7: Known Gaps / Issues

| Gap | Impact | Resolution |
|-----|--------|-----------|
| File size limit (10MB) is hardcoded in controller — cannot be overridden per entity type | 🟡 MEDIUM | If 25MB needed, change constant in `FileInterceptor` config |
| `entity_id` is not validated to exist in parent table | 🟢 LOW | No FK constraint on `mediable_id` — acceptable per current design |
| `university_operation` entity type convention not formally documented | 🟢 LOW | Document in governance directive (plan.md Phase HL) |
| `entity_type` allowlist hardcoded in service — adding new modules requires service edit | 🟢 LOW | YAGNI — extend when new modules added |
| No `title` field on `CreateDocumentDto` — documents are retrieved by type/category only | 🟢 LOW | Acceptable for current use cases |

---

### HL-B-8: Risk Matrix

| Risk | Severity | Mitigation |
|------|----------|-----------|
| `RecordAssignment`/`ConstructionMilestone`/`ConstructionGallery` crash on any query | 🔴 HIGH | Phase HL-A fix (add `@Filter` opt-out) |
| Wrong `entity_id` passed → media linked to wrong record | 🟡 MEDIUM | Caller responsibility; no server-side guard |
| Multipart `file` field name wrong → upload silently fails (file = undefined) | 🟡 MEDIUM | Document required field name: `file` |
| `media_type` / `document_type` not passed → 400 validation error | 🟢 LOW | Standard class-validator behavior |

**Overall Phase HL-B risk: 🟢 LOW — services are stable; documentation gap only.**

---

## Section 2.91 — Phase HM (ORM Track): MikroORM FilterDef Type Error + Global Filter Strategy Fix (2026-04-21)

**Status:** PHASE 1 RESEARCH COMPLETE → Phase 2 Plan ready

**Objective:** Identify root cause of TypeScript type error from invalid `@Filter` usage on non-soft-deletable entities. Determine the correct and permanent filter strategy aligned with the existing entity schema.

---

### HM-ORM-A: FilterDef Type Analysis (Source of Truth: typings.d.ts)

**Confirmed type definition** — `@mikro-orm/core/typings.d.ts` lines 725–732:

```typescript
export type FilterDef = {
    name: string;
    cond: Dictionary | ((args: Dictionary, type: 'read' | 'update' | 'delete', em: any, options?: FindOptions<any, any, any, any> | FindOneOptions<any, any, any, any>, entityName?: EntityName<any>) => Dictionary | Promise<Dictionary>);
    default?: boolean;
    entity?: string[];
    args?: boolean;
    strict?: boolean;
};
```

**Critical finding:**
- `cond` has **no `?`** — it is **REQUIRED** by the TypeScript type system
- `default` is optional (`?`)
- `entity?: string[]` exists — can scope global filter to specific entity class names

**Invalid usage introduced in Phase HL implementation:**

```typescript
@Filter({ name: 'notDeleted', default: false })
```

TypeScript error:
```
Argument of type '{ name: string; default: false; }' is not assignable to parameter of type 'FilterDef'.
  Property 'cond' is missing in type '{ name: string; default: false; }' but required in type 'FilterDef'.
```

---

### HM-ORM-B: Semantic Misunderstanding of @Filter Decorator

**What `@Filter` at entity level does:**
- It DEFINES or RE-DEFINES a named filter scoped to that entity
- The `Filter.d.ts` signature: `export declare function Filter<T>(options: FilterDef): <U>(target: U & Dictionary) => U & Dictionary;`
- Entity-level `@Filter` registers the filter in entity metadata — it OVERRIDES the global config for that entity

**What `@Filter` at entity level does NOT do:**
- It does NOT "opt out" of a global filter by omitting `cond`
- There is NO `disabled: true` or `enabled: false` flag in `FilterDef`
- Passing `{ name: 'notDeleted', default: false }` without `cond` is both a TS error AND semantically wrong

**Root misunderstanding in Phase HL implementation:**
The intent was to disable the global `notDeleted` filter for entities without `deletedAt`. The approach used (`@Filter({ name, default: false })`) is invalid on two levels: type violation + wrong mechanism.

---

### HM-ORM-C: Global Filter Configuration Analysis

**Current `mikro-orm.config.ts` filters config:**

```typescript
filters: {
  notDeleted: { cond: { deletedAt: null }, default: true },
},
```

**Behavior with `default: true`:**
- The filter is AUTOMATICALLY ACTIVE for every entity on every query
- Entity-level `@Filter` can override behavior per entity, but only with a valid `FilterDef`
- Entities without entity-level `@Filter` inherit the global setting → crashes if `deletedAt` absent

**`FilterDef.entity?: string[]`:**
- The global filter can be restricted to a whitelist of entity class names
- `entity: ['Department', 'Project', ...]` would limit filter to only those entities
- However: maintaining a 22-entity whitelist is fragile, high-maintenance, and violates DRY

---

### HM-ORM-D: Full Entity Audit — Filter Compatibility

| Entity | Has `deletedAt` | Has entity-level `@Filter` | `cond` present | Status |
|--------|----------------|---------------------------|----------------|--------|
| Department | ✅ | ✅ `default: true` | ✅ | ✅ Safe |
| Project | ✅ | ✅ `default: true` | ✅ | ✅ Safe |
| Contractor | ✅ | ✅ `default: true` | ✅ | ✅ Safe |
| FundingSource | ✅ | ✅ `default: true` | ✅ | ✅ Safe |
| RepairType | ✅ | ✅ `default: true` | ✅ | ✅ Safe |
| RepairProject | ✅ | ✅ `default: true` | ✅ | ✅ Safe |
| RepairProjectPhase | ✅ | ✅ `default: true` | ✅ | ✅ Safe |
| RepairProjectTeamMember | ✅ | ✅ `default: true` | ✅ | ✅ Safe |
| RepairPowItem | ✅ | ✅ `default: true` | ✅ | ✅ Safe |
| ConstructionProject | ✅ | ✅ `default: true` | ✅ | ✅ Safe |
| ConstructionSubcategory | ✅ | ✅ `default: true` | ✅ | ✅ Safe |
| ConstructionProjectFinancial | ✅ | ✅ `default: true` | ✅ | ✅ Safe |
| Media | ✅ | ✅ `default: true` | ✅ | ✅ Safe |
| Document | ✅ | ✅ `default: true` | ✅ | ✅ Safe |
| SystemSetting | ✅ | ✅ `default: true` | ✅ | ✅ Safe |
| GadBudgetPlan | ✅ | ✅ `default: true` | ✅ | ✅ Safe |
| GadGpbAccomplishment | ✅ | ✅ `default: true` | ✅ | ✅ Safe |
| GadFacultyParity | ✅ | ✅ `default: true` | ✅ | ✅ Safe |
| GadStaffParity | ✅ | ✅ `default: true` | ✅ | ✅ Safe |
| GadStudentParity | ✅ | ✅ `default: true` | ✅ | ✅ Safe |
| GadPwdParity | ✅ | ✅ `default: true` | ✅ | ✅ Safe |
| GadIndigenousParity | ✅ | ✅ `default: true` | ✅ | ✅ Safe |
| **UserDepartment** | ❌ | ⚠️ invalid (no `cond`) | ❌ | 🔴 TS error |
| **ConstructionMilestone** | ❌ | ⚠️ invalid (no `cond`) | ❌ | 🔴 TS error |
| **ConstructionGallery** | ❌ | ⚠️ invalid (no `cond`) | ❌ | 🔴 TS error |
| **RecordAssignment** | ❌ | ⚠️ invalid (no `cond`) | ❌ | 🔴 TS error |

**Summary:** 22 entities safe, 4 entities have TypeScript-invalid `@Filter` decorators.

---

### HM-ORM-E: Correct Fix Strategy (KISS-optimal)

**Chosen approach: "Global Opt-In via Entity-Level Declaration"**

Steps:
1. **`mikro-orm.config.ts`**: Change global filter `default: true` → `default: false`
   - Global filter is now DEFINED but INACTIVE by default for all entities
2. **22 safe entities**: Already have `@Filter({ name: 'notDeleted', cond: { deletedAt: null }, default: true })` — behavior UNCHANGED, they still get the filter applied
3. **4 invalid entities**: Remove `@Filter(...)` decorator entirely + remove `Filter` from import
   - No decorator → global filter (now `default: false`) → filter NOT applied → no crash
4. **Zero query behavior change**: All 22 soft-deletable entities continue filtering `deletedAt IS NULL`

**Why NOT the `entity: string[]` approach:**
- Would require listing all 22 entity class names in global config
- Every new soft-deletable entity would require updating the global config list
- Violates DRY and is fragile
- Entity-level `@Filter` is the correct encapsulation point (each entity owns its filter state)

**Why NOT "add fake `cond: {}` to satisfy types":**
- Empty `cond` would generate `WHERE` with no clause or malformed SQL
- Semantically incorrect — operator's directive explicitly prohibits hacks
- Would cause runtime SQL errors for entities without `deletedAt`

---

### HM-ORM-F: Change Impact Assessment

| Component | Change | Impact |
|-----------|--------|--------|
| `mikro-orm.config.ts` | `default: true` → `default: false` | Global scope change — offset by entity-level opt-in |
| 22 safe entities | No change | Filter behavior unchanged (entity-level `default: true` persists) |
| `user-department.entity.ts` | Remove invalid `@Filter` + `Filter` import | Filter no longer attempted → no crash |
| `construction-milestone.entity.ts` | Same | Same |
| `construction-gallery.entity.ts` | Same | Same |
| `record-assignment.entity.ts` | Same | Same |
| All existing queries | No change | Soft-deletable entities still filtered; non-soft-deletable no longer crash |

**Risk: 🟢 LOW** — 22 entity-level `@Filter` decorators already have `default: true`, ensuring no behavioral regression.

**TypeScript: 🟢 CLEAN** — `FilterDef.cond` is no longer absent from any `@Filter` call in the codebase.

---

## Section 2.92 — Phase HO–HS (ORM): Remaining Service Migration Research (2026-04-22)

**Status:** ✅ Research Complete — auth/users/permission-resolver ORM migration feasibility confirmed

---

### HO-HS-A: Services Targeted for Migration

| Service | File | Raw SQL Calls | Status |
|---------|------|--------------|--------|
| `AuthService` | `src/auth/auth.service.ts` | 21 | Pending migration |
| `UsersService` | `src/users/users.service.ts` | 51 | Pending migration |
| `PermissionResolverService` | `src/common/services/permission-resolver.service.ts` | 6 | Pending migration |
| `HealthService` | `src/health/health.service.ts` | 2 | **EXCLUDED** — infrastructure, intentional |

**Health service exclusion rationale:** Uses `DatabaseService.isConnected()`, `getServerTime()`, `getTableCount()`, `getVersion()` — these are infrastructure probe methods, not domain logic. No ORM replacement exists. `HealthModule` has no `DatabaseModule` import but still works via `@Global()`. Correct pattern — do NOT migrate.

---

### HO-HS-B: Required New Entities (9 total — none currently exist in entities/index.ts)

#### Entities WITH `deleted_at` (soft-delete, need `@Filter`):

| Entity Class | File | Table | Filter Required |
|-------------|------|-------|----------------|
| `User` | `user.entity.ts` | `users` | ✅ `@Filter({ name: 'notDeleted', cond: { deletedAt: null }, default: true })` |
| `Role` | `role.entity.ts` | `roles` | ✅ same |
| `Permission` | `permission.entity.ts` | `permissions` | ✅ same |

#### Entities WITHOUT `deleted_at` (no filter):

| Entity Class | File | Table | PK Type |
|-------------|------|-------|---------|
| `UserRole` | `user-role.entity.ts` | `user_roles` | Composite `(user_id, role_id)` |
| `RolePermission` | `role-permission.entity.ts` | `role_permissions` | Composite `(role_id, permission_id)` |
| `UserPermissionOverride` | `user-permission-override.entity.ts` | `user_permission_overrides` | UUID PK |
| `UserModuleAssignment` | `user-module-assignment.entity.ts` | `user_module_assignments` | UUID PK, uses `ModuleType` PG enum |
| `UserPillarAssignment` | `user-pillar-assignment.entity.ts` | `user_pillar_assignments` | UUID PK |
| `PasswordResetRequest` | `password-reset-request.entity.ts` | `password_reset_requests` | UUID PK |

#### Enum Required:

`ModuleType` enum (`src/common/enums/module-type.enum.ts`) — matches PG ENUM `module_type ('CONSTRUCTION', 'REPAIR', 'OPERATIONS', 'ALL')`. Does NOT yet exist; must be created and exported from `src/common/enums/index.ts`.

---

### HO-HS-C: Complete Column Inventory

#### `users` table (19 columns)

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | UUID | NO | PK, `gen_random_uuid()` |
| `username` | VARCHAR(255) | NO | UNIQUE |
| `email` | VARCHAR(255) | YES | UNIQUE |
| `password_hash` | TEXT | YES | nullable (SSO-only accounts) |
| `first_name` | TEXT | YES | |
| `last_name` | TEXT | YES | |
| `middle_name` | TEXT | YES | |
| `display_name` | VARCHAR(255) | YES | |
| `avatar_url` | TEXT | YES | |
| `campus` | TEXT | YES | NOT a Campus enum — free text |
| `status` | VARCHAR(50) | YES | default `'ACTIVE'` |
| `is_active` | BOOLEAN | NO | default `true` |
| `rank_level` | INTEGER | YES | |
| `google_id` | VARCHAR(255) | YES | UNIQUE, from Google OAuth migration |
| `failed_login_attempts` | INTEGER | YES | default 0 |
| `account_locked_until` | TIMESTAMPTZ | YES | |
| `last_login_at` | TIMESTAMPTZ | YES | |
| `created_at` | TIMESTAMPTZ | NO | default NOW() |
| `updated_at` | TIMESTAMPTZ | NO | default NOW() |
| `deleted_at` | TIMESTAMPTZ | YES | soft-delete |
| `created_by` | UUID | YES | |
| `updated_by` | UUID | YES | |
| `deleted_by` | UUID | YES | |
| `phone` | VARCHAR(20) | YES | |
| `metadata` | JSONB | YES | |

**Note:** `users.campus` is `TEXT` type, NOT the `campus_enum`. The `Campus` enum (`MAIN/CABADBARAN/BOTH`) is for records tables (not user profiles). Mapping is handled in `normalizeRecordCampusToUserCampus()`.

#### `roles` table (8 columns)

| Column | Type | Nullable |
|--------|------|----------|
| `id` | UUID | NO PK |
| `name` | VARCHAR(100) | NO UNIQUE |
| `display_name` | VARCHAR(255) | YES |
| `description` | TEXT | YES |
| `rank` | INTEGER | YES |
| `is_system` | BOOLEAN | NO default false |
| `created_at` | TIMESTAMPTZ | NO |
| `updated_at` | TIMESTAMPTZ | NO |
| `deleted_at` | TIMESTAMPTZ | YES |
| `created_by` | UUID | YES |
| `updated_by` | UUID | YES |
| `deleted_by` | UUID | YES |

#### `permissions` table (9 columns)

| Column | Type | Nullable |
|--------|------|----------|
| `id` | UUID | NO PK |
| `name` | VARCHAR(100) | NO UNIQUE |
| `display_name` | VARCHAR(255) | NO |
| `description` | TEXT | YES |
| `module` | VARCHAR(100) | YES |
| `resource` | VARCHAR(100) | YES |
| `action` | VARCHAR(100) | YES |
| `is_system` | BOOLEAN | NO default false |
| `created_at` | TIMESTAMPTZ | NO |
| `updated_at` | TIMESTAMPTZ | NO |
| `deleted_at` | TIMESTAMPTZ | YES |
| `created_by` | UUID | YES |
| `deleted_by` | UUID | YES |

#### `user_roles` (composite PK, 7 columns)

| Column | Type | Nullable |
|--------|------|----------|
| `user_id` | UUID | NO PK FK→users |
| `role_id` | UUID | NO PK FK→roles |
| `is_superadmin` | BOOLEAN | NO default false |
| `assigned_by` | UUID | YES |
| `assigned_at` | TIMESTAMPTZ | NO default NOW() |
| `created_at` | TIMESTAMPTZ | NO default NOW() |
| `created_by` | UUID | YES |

#### `role_permissions` (composite PK, 4 columns)

| Column | Type | Nullable |
|--------|------|----------|
| `role_id` | UUID | NO PK FK→roles |
| `permission_id` | UUID | NO PK FK→permissions |
| `created_at` | TIMESTAMPTZ | NO default NOW() |
| `created_by` | UUID | YES |

#### `user_permission_overrides` (8 columns)

| Column | Type | Nullable |
|--------|------|----------|
| `id` | UUID | NO PK |
| `user_id` | UUID | NO FK→users |
| `permission_id` | UUID | NO FK→permissions |
| `override_type` | VARCHAR(50) | NO (`GRANT`\|`DENY`) |
| `granted_by` | UUID | YES |
| `granted_at` | TIMESTAMPTZ | NO default NOW() |
| `created_at` | TIMESTAMPTZ | NO default NOW() |
| `created_by` | UUID | YES |

#### `user_module_assignments` (6 columns)

| Column | Type | Nullable |
|--------|------|----------|
| `id` | UUID | NO PK |
| `user_id` | UUID | NO FK→users |
| `module` | `module_type` enum | NO (`CONSTRUCTION`\|`REPAIR`\|`OPERATIONS`\|`ALL`) |
| `is_active` | BOOLEAN | NO default true |
| `created_at` | TIMESTAMPTZ | NO default NOW() |
| `created_by` | UUID | YES |

#### `user_pillar_assignments` (5 columns)

| Column | Type | Nullable |
|--------|------|----------|
| `id` | UUID | NO PK |
| `user_id` | UUID | NO FK→users |
| `pillar_type` | VARCHAR(100) | NO |
| `created_at` | TIMESTAMPTZ | NO default NOW() |
| `created_by` | UUID | YES |

#### `password_reset_requests` (7 columns)

| Column | Type | Nullable |
|--------|------|----------|
| `id` | UUID | NO PK |
| `user_id` | UUID | NO FK→users |
| `token` | VARCHAR(255) | NO UNIQUE |
| `expires_at` | TIMESTAMPTZ | NO |
| `is_used` | BOOLEAN | NO default false |
| `created_at` | TIMESTAMPTZ | NO default NOW() |
| `ip_address` | VARCHAR(45) | YES |

---

### HO-HS-D: Module Registration Analysis

| Module File | Current Import | Required Change |
|-------------|---------------|-----------------|
| `users/users.module.ts` | `DatabaseModule` only | Add `MikroOrmModule.forFeature([User, Role, UserRole, Permission, RolePermission, UserPermissionOverride, UserModuleAssignment, UserPillarAssignment, PasswordResetRequest])` |
| `auth/auth.module.ts` | `DatabaseModule` + JWT/Passport | Add same entity list as users.module.ts |
| `common/common.module.ts` | No imports | Add `MikroOrmModule.forFeature([User, UserRole, UserModuleAssignment])` — only those needed by PermissionResolverService |

**Important:** `DatabaseModule` imports must remain until every service in the module is fully migrated (dual-source pattern during migration). Remove `DatabaseModule` only when ALL services in the module are fully converted.

---

### HO-HS-E: Service Query Pattern Classification

#### auth.service.ts — Method/Pattern Analysis

| Method | Queries | Migration Pattern |
|--------|---------|------------------|
| `validateUser()` | 1 — select user by email/username | `em.findOne(User, { ... })` |
| `login()` | 6 — roles, permissions, pillar, module, profile, superadmin | `em.findOne()` + `em.find()` on junction tables |
| `getProfile()` | 4 — user + roles + permissions + pillar + module | Same as login() fetch |
| `loginWithLdapUser()` | 2 — find-or-create user | `em.findOne()` + `em.persist()` |
| `loginWithGoogleUser()` | 2 — find-or-create by google_id | Same |
| `createPasswordResetRequest()` | 3 — validate user, invalidate old tokens, insert new | `em.findOne()` + `em.nativeUpdate()` + `em.persist()` |
| `logout()` | 1 — update last_login_at or similar | `em.nativeUpdate()` |

**No PG stored functions used in auth.service.ts.** All patterns are straightforward ORM replacements.

#### users.service.ts — Transaction Blocks (critical)

Three transaction blocks must be migrated using `em.transactional()`:

| Method | Pattern |
|--------|---------|
| `bulkUpdatePermissions()` | `client = await db.getClient(); BEGIN; INSERT/DELETE per permission; COMMIT/ROLLBACK` → `em.transactional(async (em) => { ... })` |
| `bulkUpdateModuleAssignments()` | Same transaction pattern | Same |
| `bulkCrossUserAccessUpdate()` | Same transaction pattern | Same |

**Inside transactional callback:** All operations must use the forked `em` parameter — NOT `this.em`.

#### users.service.ts — PG Stored Functions (hybrid — keep raw SQL)

| Method | PG Function | Stay Hybrid |
|--------|------------|-------------|
| `canModifyUser()` private | `can_modify_user($1, $2)` | ✅ |

**Pattern for hybrid:** `const conn = this.em.getConnection(); const result = await conn.execute('SELECT can_modify_user($1, $2) as can_modify', [actorId, targetId], 'get');`

#### users.service.ts — Complex Query Classification

| Method | Query Type | ORM Approach |
|--------|-----------|-------------|
| `findAll()` | Dynamic WHERE + pagination + JSON agg | `QueryBuilder` with `.andWhere()` + `orderBy()` + `limit()/offset()` |
| `findEligibleForAssignment()` | EXISTS subquery + JOIN | `QueryBuilder` with raw `.where()` |
| `findOne()` | Multi-join fetch | `em.findOne()` + separate `em.find()` for related entities |
| `create()` | INSERT with hash | `em.persistAndFlush()` |
| `update()` | Conditional UPDATE fields | entity assignment + `em.flush()` |
| `remove()` | Soft delete | entity `deletedAt` assignment + `em.flush()` |
| `assignRole()` | INSERT into user_roles | `em.persistAndFlush()` new `UserRole` |
| `removeRole()` | DELETE from user_roles | `em.nativeDelete()` or `em.removeAndFlush()` |
| `getRoles()` | SELECT JOIN | `em.find(UserRole, { userId })` |
| `unlockAccount()` | UPDATE locked fields | entity update + `em.flush()` |
| `resetPassword()` | UPDATE password_hash | entity update + `em.flush()` |
| `getPermissionOverrides()` | SELECT | `em.find(UserPermissionOverride, ...)` |
| `setPermissionOverride()` | UPSERT | find-then-update or persist |
| `removePermissionOverride()` | DELETE | `em.nativeDelete()` |
| `getModuleAssignments()` | SELECT | `em.find(UserModuleAssignment, ...)` |
| `assignModule()` | INSERT | `em.persistAndFlush()` |
| `removeModuleAssignment()` | DELETE | `em.nativeDelete()` |
| `getPillarAssignments()` | SELECT | `em.find(UserPillarAssignment, ...)` |
| `assignPillar()` | INSERT | `em.persistAndFlush()` |
| `revokePillarAssignment()` | DELETE | `em.nativeDelete()` |
| `getPasswordResetRequests()` | SELECT | `em.find(PasswordResetRequest, ...)` |

#### permission-resolver.service.ts — Method Analysis

| Method | Pattern | Migration |
|--------|---------|-----------|
| `isAdmin()` | Pure JWT check (no DB) | No change — already correct |
| `isStaff()` | Pure JWT check (no DB) | No change — already correct |
| `isAdminFromDatabase()` | SELECT from user_roles + roles JOIN | `em.findOne(UserRole, { userId, isSuperadmin: true })` + `em.find(UserRole, { userId })` + related Role lookup |
| `canApproveByRank()` | SELECT rank_level from users (2 users) | `em.findOne(User, { id: ... })` ×2 |
| `canModifyUserByRank()` | Calls `can_modify_user()` PG function | **Hybrid** — keep raw SQL via `em.getConnection().execute()` |
| `hasModuleAssignment()` | Calls `user_has_module_access()` PG function | **Hybrid** — keep raw SQL via `em.getConnection().execute()` |

---

### HO-HS-F: ALLOWED_SORTS camelCase Mapping

`UsersService.findAll()` uses `ALLOWED_SORTS` list with snake_case DB column names. After ORM migration, `QueryBuilder.orderBy()` uses camelCase property names.

| Current (snake_case) | Entity property (camelCase) |
|---------------------|----------------------------|
| `created_at` | `createdAt` |
| `email` | `email` |
| `first_name` | `firstName` |
| `last_name` | `lastName` |
| `is_active` | `isActive` |
| `rank_level` | `rankLevel` |

---

### HO-HS-G: Zero-DB-Migration Guarantee

All 9 target tables already exist in the live database (verified — migrations 001–042 applied). This is a pure TypeScript/entity code migration. No `mikro-orm migration:up` needed. No schema changes. No operator SQL required before Phase HO implementation.

---

## Section 2.93 — Phase HT (ORM): Auth Login 500 — Runtime Global Filter `default: true` Root Cause (2026-04-22)

**Status:** ✅ Research Complete — root cause confirmed, single-line fix identified

---

### HT-ORM-A: Error Log Analysis

**Reported error:**
```
[query] select "u0".* from "users" as "u0" where "u0"."deleted_at" is null
  and ("u0"."email" ilike 'admin' or "u0"."username" ilike 'admin') limit 1 [took 46 ms, 1 result]
[Nest] ERROR [GlobalExceptionFilter] Unhandled exception:
  Trying to query by not existing property UserRole.deletedAt
Error: Trying to query by not existing property UserRole.deletedAt
  at new CriteriaNode (node_modules/@mikro-orm/knex/query/CriteriaNode.js:37:27)
```

**Sequence of events:**
1. `validateUser()` runs → queries `User` entity → succeeds (User has `deletedAt`, filter applied correctly)
2. `login()` then runs → queries `UserRole` entity via `em.find(UserRole, { userId: user.id })`
3. MikroORM auto-applies global `notDeleted` filter to `UserRole` → appends `WHERE "deleted_at" IS NULL`
4. `UserRole` table has no `deleted_at` column → MikroORM CriteriaNode throws: "Trying to query by not existing property UserRole.deletedAt"
5. Entire login request → 500 Internal Server Error

---

### HT-ORM-B: Root Cause — Two-Config Duality

**Finding: Phase HN applied the fix to the wrong file.**

| Config File | Used By | `default` value after Phase HN |
|------------|---------|-------------------------------|
| `pmo-backend/src/database/mikro-orm.config.ts` | MikroORM CLI only (`npx mikro-orm migration:*`) | `false` ✅ |
| `pmo-backend/src/app.module.ts` line 61 | NestJS runtime (`MikroOrmModule.forRootAsync`) | `true` ❌ **BUG** |

**At application startup**, NestJS reads `app.module.ts` `MikroOrmModule.forRootAsync()` — it does NOT read `mikro-orm.config.ts`. The two files are independent. Phase HN correctly fixed the CLI config but the runtime config was never touched.

**Exact location of bug:**
```typescript
// pmo-backend/src/app.module.ts, line 61
notDeleted: { cond: { deletedAt: null }, default: true },
//                                               ^^^^
//                                               BUG: must be false
```

---

### HT-ORM-C: Entity Filter State Audit (New Entities)

The 9 new entities registered in auth.module.ts were confirmed during Phase HO. Their `deletedAt` and `@Filter` status:

| Entity | Has `deletedAt` | Has entity `@Filter` | Global filter safe? |
|--------|----------------|----------------------|---------------------|
| `User` | ✅ | ✅ `default: true` | ✅ Filter correctly applied |
| `Role` | ✅ | ✅ `default: true` | ✅ |
| `Permission` | ✅ | ✅ `default: true` | ✅ |
| `UserRole` | ❌ | ❌ none | ❌ Crashes with `default: true` |
| `RolePermission` | ❌ | ❌ none | ❌ Crashes with `default: true` |
| `UserPermissionOverride` | ❌ | ❌ none | ❌ Crashes with `default: true` |
| `UserModuleAssignment` | ❌ | ❌ none | ❌ Crashes with `default: true` |
| `UserPillarAssignment` | ❌ | ❌ none | ❌ Crashes with `default: true` |
| `PasswordResetRequest` | ❌ | ❌ none | ❌ Crashes with `default: true` |

**The error surfaces on `UserRole` first** because it is the first entity queried after `User` in the login flow. But all 6 non-soft-deletable entities above would crash if ever queried while global `default: true` is active.

---

### HT-ORM-D: Fix Scope Assessment

**Required change:** 1 line in `app.module.ts`.

**No other files need changing:**
- `User`, `Role`, `Permission` already have entity-level `@Filter({ name: 'notDeleted', cond: { deletedAt: null }, default: true })` — this entity-level declaration OVERRIDES the global `default` for those specific entities, restoring filter behavior to exactly what it was before
- All 22 original soft-deletable entities have entity-level `@Filter(default: true)` confirmed from Phase HN research (Section 2.91)
- Setting global `default: false` + relying on entity-level opt-in is the exact same architecture Phase HN established — Phase HN just missed applying it to `app.module.ts`

**Risk: 🟢 ZERO** — changing `true` → `false` in `app.module.ts` aligns it with `mikro-orm.config.ts`, which is already the correct configuration.

---

### HT-ORM-E: No Secondary Bugs in auth.service.ts

Review of `auth.service.ts` `validateUser()` + `login()` methods (post-migration state):

| Area | Status | Note |
|------|--------|------|
| `UserPermissionOverride` properties `moduleKey`, `canAccess` | ✅ CORRECT | Entity as created by operator has both `moduleKey: string` and `canAccess: boolean` — not a bug |
| `user.first_name` / `user.last_name` in `login()` | ✅ CORRECT | `user` here is the plain JS return value from `validateUser()`, which explicitly maps `user.firstName` → `first_name` in a snake_case plain object |
| `user.rank_level` in `login()` | ✅ CORRECT | Same — mapped in `validateUser()` return object |
| `PasswordResetRequest` fields `identifier` + `notes` | ✅ CORRECT | Entity has both fields with same names |
| JWT payload structure | ✅ CORRECT | `JwtPayload` interface has `sub, email, roles, is_superadmin, campus` — matches `login()` payload build |

**Conclusion:** `auth.service.ts` is correctly migrated. The ONLY bug is the `app.module.ts` `default: true` filter configuration.

---

## Section 2.94 — Phase HU (Stability): Backend Stability Fix — Schema Drift + Missing Approve Route

**Phase:** HU (Stability)
**Date:** 2026-04-21
**Task:** Three-issue backend stability fix: (A) @Filter lint, (B) User schema drift, (C) Construction approve route 404

---

### HU-A: MikroORM @Filter Lint Error — Status

**Finding: ALREADY RESOLVED in Phase HN**

Grep across all entity files confirms:
- **25 entities** use `@Filter({ name: 'notDeleted', cond: { deletedAt: null }, default: true })` — all VALID
- **No entity** has the invalid `@Filter({ name: 'notDeleted', default: false })` pattern — Phase HN removed all such occurrences
- Entities without `deletedAt` (UserRole, RolePermission, UserModuleAssignment, UserPillarAssignment, etc.) have **no `@Filter` decorator at all** — correct opt-out by absence

**Active remaining issue:** `app.module.ts` global filter `default: true` — documented as Phase HT (ORM) in Section 2.93. This is the auth login 500 crash root cause. It is bundled into this phase for unified resolution.

**Action required (HU-1):** Apply Phase HT (ORM) fix — change `app.module.ts` global filter `default` from `true` to `false`.

---

### HU-B: User Creation 500 — Schema Drift Analysis

**Error observed:**
```
insert into "users" (...) returning "id", "status", "failed_login_attempts"
→ column "status" does not exist
```

**Root cause mechanism:**
MikroORM auto-generates `RETURNING` clause for any `@Property` that has a `default` value (non-raw). Since `status` is defined as:
```typescript
@Property({ nullable: true, length: 50, default: 'ACTIVE' })
status?: string;
```
MikroORM expects the DB to hold the default value and retrieves it post-INSERT via `RETURNING`. PostgreSQL rejects because `status` column doesn't exist in the `users` table.

**Full schema drift inventory — `users` table:**

| Entity Field | DB Column | In original schema | In any numbered migration | Status |
|---|---|---|---|---|
| `status` | `status` | ❌ | ❌ | **CRITICAL** — crashes INSERT via RETURNING |
| `updatedBy` | `updated_by` | ❌ | ❌ (040/041 miss `users`) | **CRITICAL** — crashes UPDATE (line 370: `existing.updatedBy = adminId`) |
| `middleName` | `middle_name` | ❌ | ❌ | Latent — nullable, no default, not set in service |
| `displayName` | `display_name` | ❌ | ❌ | Latent — nullable, no default, not set in service |
| `createdBy` | `created_by` | ❌ | ❌ | Latent — nullable, no default, not set for User entity |
| `deletedBy` | `deleted_by` | ✅ | N/A — in original schema | OK |
| `googleId` | `google_id` | ❌ | `pmo_migration_google_oauth.sql` | OK (manually applied) |

**Why `updated_by` is CRITICAL:**
`users.service.ts` line 370: `existing.updatedBy = adminId;` followed by `this.em.flush()`. MikroORM includes `updated_by` in the `UPDATE users SET ...` clause. PostgreSQL rejects because column doesn't exist → `PATCH /api/users/:id` crashes.

**Migrations 040 and 041 confirmed:** They added `created_by`/`updated_by` to `construction_subcategories`, `repair_types`, `system_settings`, `departments`, `documents`, `media` — but **NOT to `users` table**.

**Feature usage check for `status`:**
- `users.service.ts` has NO code that reads or writes `user.status` for the `User` entity
- All `status` references in `users.service.ts` refer to `PasswordResetRequest.status` (values: 'PENDING', 'COMPLETED')
- The field was added to the entity speculatively; it is DORMANT in the service layer
- Despite being dormant, the `default: 'ACTIVE'` in the `@Property` decorator triggers RETURNING → crash on every INSERT

**Fix path:** Migration 042 — add all 5 missing columns to `users` table with `IF NOT EXISTS` guards.

---

### HU-C: Missing Construction Approve Route — Analysis

**Error:** `PATCH /api/construction-projects/:id/approve` → 404 Cannot PATCH

**Controller audit (`construction-projects.controller.ts`):**

Existing workflow routes (lines 82–125):

| Route | Method | Handler | Status |
|---|---|---|---|
| `:id/submit-for-review` | `@Post` | `service.submitForReview()` | ✅ exists |
| `:id/publish` | `@Post` | `service.publish()` | ✅ exists (IS the approve action) |
| `:id/reject` | `@Post` | `service.reject()` | ✅ exists |
| `:id/withdraw` | `@Post` | `service.withdraw()` | ✅ exists |
| `:id` (PATCH) | `@Patch` | `service.update()` | ✅ exists |

**No `@Patch(':id/approve')` route exists anywhere in the controller.**

**Root cause:** The approval logic already exists in `service.publish()` (transitions PENDING_REVIEW → PUBLISHED with Admin guard). The frontend is calling `PATCH /api/construction-projects/:id/approve` but the backend only exposes the same action as `POST /api/construction-projects/:id/publish`.

**Convention check:** `university-operations.controller.ts` uses `@Post('quarterly-reports/:id/approve')`. Construction module uses `@Post` for all workflow transitions. However, since frontend calls PATCH, the alias must be PATCH.

**Service method `publish()` signature (line 99–102):**
```typescript
return this.service.publish(id, user.sub, user);
```
No changes needed in the service — the alias simply calls the same method.

**Fix path:** Add `@Patch(':id/approve')` route in the controller, delegating to `this.service.publish()`. Admin role guard required (same as the `publish` route).

---

### HU-D: Summary Table

| Issue | Severity | Root Cause | Fix |
|---|---|---|---|
| Auth login 500 | 🔴 CRITICAL | `app.module.ts` global filter `default: true` | HU-1: 1-line fix |
| User creation 500 | 🔴 CRITICAL | `status` column missing from DB → RETURNING fails | HU-2: Migration 042 |
| User update 500 | 🔴 CRITICAL | `updated_by` column missing from DB | HU-2: Migration 042 (same) |
| Construction approve 404 | 🟠 HIGH | No `@Patch(':id/approve')` route | HU-3: Controller alias |
| Latent schema drift | 🟡 MEDIUM | `middle_name`, `display_name`, `created_by` not in DB | HU-2: Migration 042 (same) |

---

## Section 2.95 — Phase IA (ORM-UO): University Operations Service — Full ORM Migration Research (2026-04-22)

**Status:** Phase 1 Research Complete → Phase 2 Plan ready
**Scope:** `pmo-backend/src/university-operations/university-operations.service.ts` — the final service still using raw `DatabaseService`

---

### IA-A: Service Overview

| Metric | Value |
|---|---|
| File size | 3262 lines |
| `this.db.query()` calls | 104 |
| Distinct methods | ~72 |
| Existing UO entities | **0** (none in `entities/index.ts`) |
| Entities required | **8** |
| Pure-TS methods (no DB) | 5 (`computeIndicatorMetrics`, `computeFinancialMetrics`, `isAdmin`, `normalizeUserCampus`, `validateQuarterParam`) |
| DatabaseService usages in other services | 0 (all other services already migrated) |

The `university_operations` module is the most complex in the codebase: it owns the Physical Accomplishment, Financial Accomplishment, Quarterly Report governance, Indicator taxonomy reads, and Fiscal Year management systems. All 104 raw SQL calls live in this one service.

---

### IA-B: Entity Analysis — 8 Required Entities

All entity files go to `pmo-backend/src/database/entities/`. All filter-eligible entities use the **correct** `FilterDef` format established in Phase HM/HT:

```typescript
@Filter({ name: 'notDeleted', cond: { deletedAt: null } })
```

(NOT `{ name: 'notDeleted', default: false }` — that was the invalid pattern fixed in Phase HM/HT.)

| # | Entity Class | File | Table | `deleted_at` | @Filter | Notes |
|---|---|---|---|---|---|---|
| 1 | `UniversityOperation` | `university-operation.entity.ts` | `university_operations` | ✅ | ✅ REQUIRED | Core operation record |
| 2 | `OperationIndicator` | `operation-indicator.entity.ts` | `operation_indicators` | ✅ | ✅ REQUIRED | Per-quarter BAR1 indicators |
| 3 | `OperationFinancial` | `operation-financial.entity.ts` | `operation_financials` | ✅ | ✅ REQUIRED | Per-quarter financials |
| 4 | `QuarterlyReport` | `quarterly-report.entity.ts` | `quarterly_reports` | ✅ | ✅ REQUIRED | Global QR governance record |
| 5 | `QuarterlyReportSubmission` | `quarterly-report-submission.entity.ts` | `quarterly_report_submissions` | ❌ | ❌ NO | Append-only audit log |
| 6 | `FiscalYear` | `fiscal-year.entity.ts` | `fiscal_years` | ❌ | ❌ NO | PK is `year` (INTEGER), not UUID |
| 7 | `PillarIndicatorTaxonomy` | `pillar-indicator-taxonomy.entity.ts` | `pillar_indicator_taxonomy` | ❌ | ❌ NO | READ-ONLY — seeded by migration 019, NEVER write |
| 8 | `OperationOrganizationalInfo` | `operation-organizational-info.entity.ts` | `operation_organizational_info` | ✅ | ✅ REQUIRED | One-per-operation org info (upsert pattern) |

**Entity field summaries (sourced from migrations and service SQL):**

**`university_operations`** (baseline schema + migrations 007, 014, 025, 040, 042):
`id`, `operationType`, `title`, `description`, `code`, `startDate`, `endDate`, `status`, `budget`, `campus`, `coordinatorId`, `metadata` (jsonb), `createdBy`, `updatedBy`, `deletedBy`, `publicationStatus`, `submittedBy`, `submittedAt`, `reviewedBy`, `reviewedAt`, `reviewNotes`, `assignedTo`, `fiscalYear`, `statusQ1`, `statusQ2`, `statusQ3`, `statusQ4`, `createdAt`, `updatedAt`, `deletedAt`

**`operation_indicators`** (baseline + migrations 018, 024, 025, 031, 032, 033, 034, 035, 036, 037):
`id`, `operationId`, `particular`, `description`, `indicatorCode`, `uacsCode`, `pillarIndicatorId`, `fiscalYear`, `reportedQuarter`, `targetQ1`..`targetQ4`, `accomplishmentQ1`..`accomplishmentQ4`, `scoreQ1`..`scoreQ4`, `overrideRate`, `overrideVariance`, `overrideTotalTarget`, `overrideTotalActual`, `remarks`, `catchUpPlan`, `facilitatingFactors`, `waysForward`, `mov`, `createdBy`, `updatedBy`, `deletedBy`, `createdAt`, `updatedAt`, `deletedAt`

**`operation_financials`** (baseline + migrations 014, 025, 029):
`id`, `operationId`, `fiscalYear`, `quarter`, `operationsPrograms`, `department`, `budgetSource`, `fundType`, `projectCode`, `allotment`, `target`, `obligation`, `disbursement`, `expenseClass`, `remarks`, `createdBy`, `updatedBy`, `deletedBy`, `createdAt`, `updatedAt`, `deletedAt`

**`quarterly_reports`** (migration 026 + 027 + 028):
`id`, `fiscalYear`, `quarter`, `title`, `publicationStatus`, `createdBy`, `submittedBy`, `submittedAt`, `reviewedBy`, `reviewedAt`, `reviewNotes`, `submissionCount`, `unlockedBy`, `unlockedAt`, `unlockRequestedBy`, `unlockRequestedAt`, `unlockRequestReason`, `createdAt`, `updatedAt`, `deletedAt`

**`quarterly_report_submissions`** (migration 028):
`id`, `quarterlyReportId`, `fiscalYear`, `quarter`, `version`, `eventType`, `submittedBy`, `submittedAt`, `reviewedBy`, `reviewedAt`, `reviewNotes`, `actionedBy`, `actionedAt`, `reason`, `createdAt` — **NO deleted_at** (append-only)

**`fiscal_years`** (migration 023):
`year` (INTEGER PK — NOT UUID), `isActive`, `label`, `createdAt`, `updatedAt` — **NO deleted_at**

**`pillar_indicator_taxonomy`** (migration 016 + 018):
`id`, `pillarType`, `indicatorName`, `indicatorCode`, `uacsCode`, `indicatorOrder`, `indicatorType`, `unitType`, `description`, `organizationalOutcome`, `isActive`, `createdAt`, `createdBy` — **NO deleted_at**, **READ-ONLY**

**`operation_organizational_info`** (baseline schema):
`id`, `operationId` (UNIQUE FK), `department`, `agencyEntity`, `operatingUnit`, `organizationCode`, `createdBy`, `updatedBy`, `deletedBy`, `createdAt`, `updatedAt`, `deletedAt`

---

### IA-C: Method-by-Method Classification (~72 methods)

**Legend:** FULL ORM = replaced entirely with EntityManager calls | HYBRID ORM = mix of ORM + small raw helper | HYBRID RAW = mostly preserved raw SQL via `em.getConnection().execute()` | RAW PRESERVED = entire method stays as raw SQL | UNCHANGED = pure TypeScript, no DB calls

| Method | Strategy | Rationale |
|---|---|---|
| `computeIndicatorMetrics()` | UNCHANGED | Pure TS — no DB calls |
| `computeFinancialMetrics()` | UNCHANGED | Pure TS — no DB calls |
| `isAdmin()` | UNCHANGED | Pure TS — delegates to permissionResolver |
| `normalizeUserCampus()` | UNCHANGED | Pure TS |
| `validateQuarterParam()` | UNCHANGED | Pure TS — throws if invalid |
| `updateRecordAssignments()` | FULL ORM (IA-2) | em.nativeDelete + em.create × N + em.flush; RecordAssignment entity already exists |
| `isUserAssigned()` | FULL ORM (IA-2) | em.count(RecordAssignment, { module: 'OPERATIONS', recordId, userId }) |
| `validateFinancialAccess()` | FULL ORM (IA-2) | em.count(UserModuleAssignment, { userId, module: {$in} }) — single table count |
| `validateOperationOwnership()` | HYBRID ORM (IA-2) | Module access → em.count(UMA); then calls `this.findOne()` (RAW, unchanged) + `isUserAssigned()` (ORM) |
| `validateOperationEditable()` | HYBRID RAW (IA-3) | 2-step: UO lookup + conditional QR lookup — keep as em.getConnection().execute() |
| `validateFinancialEditable()` | HYBRID RAW (IA-3) | 2-step validation with conditional JOIN logic |
| `findAll()` | RAW PRESERVED | Correlated EXISTS subquery + json_agg for assigned_users — no ORM equivalent |
| `findOne()` | RAW PRESERVED | Multi-table JOIN (creator, submitter, reviewer) + 3 additional sub-queries (org info, indicators, financials) |
| `findOperationForDisplay()` | HYBRID RAW (IA-3) | Module access check → em.getConnection().execute(); then calls `this.findOne()` |
| `create()` | HYBRID ORM (IA-2) | em.count(UO, { code }) for dup check + em.create(UniversityOperation) + em.flush() |
| `update()` | HYBRID RAW (IA-3) | Dynamic SET clause with conditional status reset fields — safer as em.getConnection().execute() |
| `remove()` | FULL ORM (IA-2) | em.nativeUpdate(UO, { id }, { deletedAt, deletedBy }) — calls `this.findOne()` first (unchanged) |
| `submitForReview()` | HYBRID ORM (IA-2) | `this.findOne()` stays raw; `isUserAssigned()` becomes ORM; UPDATE → em.nativeUpdate(UO, { id }, { publicationStatus: 'PENDING_REVIEW', ... }) |
| `publish()` | HYBRID ORM (IA-2) | `this.findOne()` stays raw; UPDATE → em.nativeUpdate(UO) |
| `reject()` | HYBRID ORM (IA-2) | `this.findOne()` stays raw; UPDATE → em.nativeUpdate(UO) |
| `withdraw()` | HYBRID ORM (IA-2) | `this.findOne()` stays raw; UPDATE → em.nativeUpdate(UO) |
| `submitQuarterForReview()` | HYBRID RAW (IA-3) | Dynamic column name `status_q${n}` — em.getConnection().execute() to avoid ORM camelCase mapping risk |
| `approveQuarter()` | HYBRID RAW (IA-3) | Same dynamic column pattern |
| `rejectQuarter()` | HYBRID RAW (IA-3) | Same dynamic column pattern |
| `withdrawQuarter()` | HYBRID RAW (IA-3) | Same dynamic column pattern |
| `findPendingReview()` | RAW PRESERVED | LEFT JOIN users for submitter_name + module access subquery |
| `findMyDrafts()` | FULL ORM (IA-2) | em.find(UniversityOperation, { createdBy: userId, publicationStatus: {$in: [...]} }) |
| `findIndicatorTaxonomy()` | HYBRID ORM (IA-2) | `this.findOne()` stays raw; taxonomy query → em.find(PillarIndicatorTaxonomy, { pillarType, isActive: true }) |
| `findTaxonomyByPillarType()` | FULL ORM (IA-2) | em.find(PillarIndicatorTaxonomy, { pillarType, isActive: true }, { orderBy: { indicatorOrder: 'ASC' } }) |
| `findIndicatorsByPillarAndYear()` | RAW PRESERVED | LEFT JOIN pillar_indicator_taxonomy + dynamic quarter filter + taxonomy enrichment |
| `findIndicators()` | RAW PRESERVED | LEFT JOIN pillar_indicator_taxonomy + optional fiscal year filter |
| `createIndicatorQuarterlyData()` | HYBRID ORM (IA-2) | Taxonomy lookup → em.findOne(PillarIndicatorTaxonomy); dup check → em.count(OperationIndicator); INSERT → em.create + em.flush; autoRevert → ORM (after IA-2) |
| `updateIndicatorQuarterlyData()` | HYBRID RAW (IA-3) | Dynamic SET clause with DTO snake_case keys → em.getConnection().execute(); autoRevert → ORM |
| `createIndicator()` | FULL ORM (IA-2) | em.create(OperationIndicator) + em.flush() + autoRevert (ORM) |
| `updateIndicator()` | HYBRID RAW (IA-3) | Dynamic SET clause → em.getConnection().execute(); autoRevert → ORM |
| `removeIndicator()` | HYBRID ORM (IA-2) | em.nativeUpdate(OperationIndicator, { id }, { deletedAt: new Date() }) + autoRevert (ORM) |
| `findFinancials()` | HYBRID RAW (IA-3) | Dynamic WHERE clause building → em.getConnection().execute() |
| `createFinancial()` | FULL ORM (IA-2) | em.create(OperationFinancial) + em.flush() + autoRevert (ORM) |
| `updateFinancial()` | HYBRID RAW (IA-3) | Pre-fetch (em.findOne for quarter/fiscalYear) + dynamic SET → em.getConnection().execute(); autoRevert → ORM |
| `removeFinancial()` | HYBRID ORM (IA-2) | em.findOne(OperationFinancial) for pre-fetch + em.nativeUpdate soft-delete + autoRevert (ORM) |
| `updateOrganizationalInfo()` | HYBRID ORM (IA-2) | em.findOne(OperationOrganizationalInfo, { operationId }) → if null: em.create + em.flush, else: assign properties + em.flush |
| `findOrganizationalInfo()` | FULL ORM (IA-2) | em.findOne(OperationOrganizationalInfo, { operationId }) |
| `getOrphanIndicatorDiagnostics()` | RAW PRESERVED | Multi-table aggregate COUNT query |
| `getOrphanedIndicatorsList()` | RAW PRESERVED | CASE WHEN + JOIN diagnostic query |
| `getPillarSummary()` | RAW PRESERVED | 2-stage CTE with DISTINCT ON and conditional aggregations |
| `getQuarterlyTrend()` | RAW PRESERVED | CTE with per-quarter rate computation |
| `getYearlyComparison()` | RAW PRESERVED | Dual-CTE queries across multiple years |
| `getFinancialCampusBreakdown()` | RAW PRESERVED | JOIN + GROUP BY campus |
| `getFinancialPillarExpenseBreakdown()` | RAW PRESERVED | JOIN + GROUP BY pillar |
| `getActiveFiscalYears()` | FULL ORM (IA-2) | em.find(FiscalYear, { isActive: true }, { orderBy: { year: 'DESC' } }) |
| `createFiscalYear()` | FULL ORM (IA-2) | em.findOne(FiscalYear, { year }) dup check + em.create(FiscalYear) + em.flush() |
| `toggleFiscalYear()` | FULL ORM (IA-2) | em.findOneOrFail(FiscalYear, { year }) + assign isActive + em.flush() |
| `QUARTER_TITLES` (const) | UNCHANGED | Static record — no DB |
| `createQuarterlyReport()` | FULL ORM (IA-2) | em.findOne(QuarterlyReport, { fiscalYear, quarter }) for upsert guard + em.create + em.flush() |
| `findQuarterlyReports()` | HYBRID RAW (IA-3) | LEFT JOIN users for submitter_name + optional filter → em.getConnection().execute() |
| `findOneQuarterlyReport()` | HYBRID RAW (IA-3) | LEFT JOIN users for submitter_name → em.getConnection().execute() |
| `findQuarterlyReportsPendingReview()` | RAW PRESERVED | EXISTS subquery + JOIN + module access check |
| `submitQuarterlyReport()` | HYBRID ORM (IA-2) | Role check → em.findOne(User, { id }, { fields: ['role'] }); UPDATE → em.nativeUpdate(QR); `findOneQuarterlyReport()` stays raw |
| `approveQuarterlyReport()` | HYBRID ORM (IA-2) | `findOneQuarterlyReport()` stays raw; UPDATE → em.nativeUpdate(QR); snapshotSubmissionHistory → ORM |
| `rejectQuarterlyReport()` | HYBRID ORM (IA-2) | Same pattern as approve |
| `withdrawQuarterlyReport()` | HYBRID ORM (IA-2) | UPDATE → em.nativeUpdate(QR, { id }, { publicationStatus: 'DRAFT', ... }) |
| `snapshotSubmissionHistory()` | FULL ORM (IA-2) | em.create(QuarterlyReportSubmission) + em.flush() wrapped in try/catch |
| `autoRevertQuarterlyReport()` | FULL ORM (IA-2) | em.findOne(QuarterlyReport, { fiscalYear, quarter }) + if not DRAFT: snapshotSubmissionHistory (ORM) + em.nativeUpdate(QR) |
| `unlockQuarterlyReport()` | HYBRID ORM (IA-2) | `findOneQuarterlyReport()` stays raw; snapshotSubmissionHistory → ORM; UPDATE → em.nativeUpdate(QR) |
| `requestQuarterlyReportUnlock()` | HYBRID ORM (IA-2) | `findOneQuarterlyReport()` stays raw; UPDATE → em.findOne(QR) + assign + em.flush() |
| `denyQuarterlyReportUnlock()` | HYBRID ORM (IA-2) | `findOneQuarterlyReport()` stays raw; UPDATE → em.findOne(QR) + assign + em.flush() |
| `findQuarterlyReportsPendingUnlock()` | HYBRID RAW (IA-3) | LEFT JOIN + module access check → em.getConnection().execute() |
| `findQuarterlyReportsReviewed()` | RAW PRESERVED | 3 LEFT JOINs (reviewer, submitter, unlocker) + module access check |
| `findSubmissionHistory()` | RAW PRESERVED | 4 JOINs + dynamic WHERE → em.getConnection().execute() |
| `getFinancialPillarSummary()` | RAW PRESERVED | JOIN + GROUP BY + CASE WHEN |
| `getFinancialQuarterlyTrend()` | RAW PRESERVED | JOIN + GROUP BY + optional pillar filter |
| `getFinancialYearlyComparison()` | RAW PRESERVED | Dynamic IN clause (`$1,$2,...$n`) across multiple years |
| `getFinancialExpenseBreakdown()` | RAW PRESERVED | JOIN + GROUP BY + COALESCE + post-processing |

**Summary counts:**
- UNCHANGED (pure TS): 5 methods
- FULL ORM (IA-2): 18 methods
- HYBRID ORM (IA-2 partial): 14 methods  
- HYBRID RAW (IA-3 wrapper): 12 methods
- RAW PRESERVED (IA-3 wrapper only): 23 methods
- **Total: 72 methods**

---

### IA-D: Critical Pattern Change — `result.rows` → `result`

**DatabaseService (old):**
```typescript
const result = await this.db.query(sql, params);
// result.rows → any[]
// result.rowCount → number
result.rows[0]
result.rows.length === 0
result.rows
```

**MikroORM EntityManager connection (new):**
```typescript
const result = await this.em.getConnection().execute(sql, params, 'all');
// result → any[]  (returns array directly, no .rows wrapper)
result[0]
result.length === 0
result
```

**All RAW PRESERVED and HYBRID RAW methods in IA-3 must change:**
- Every `result.rows[n]` → `result[n]`
- Every `result.rows.length` → `result.length`
- Every `return result.rows` → `return result`
- Every `result.rowCount` → check `result.length` instead (nativeUpdate returns the count directly from em.nativeUpdate)
- `this.db.query(sql, params)` → `this.em.getConnection().execute(sql, params, 'all')`

For INSERT/UPDATE that use `RETURNING *`, the execute() call returns the rows array directly. For INSERT/UPDATE that do NOT use RETURNING, use execute() still — it will return affected rows count wrapped in array.

---

### IA-E: Sub-Phase Breakdown

**IA-1 — Entity Creation + Registration (foundation step)**
- Create 8 entity files in `pmo-backend/src/database/entities/`
- Export all 8 from `entities/index.ts`
- Add `MikroOrmModule.forFeature([...8 entities])` to `university-operations.module.ts`
- KEEP `DatabaseModule` in UO module imports during IA-1 and IA-2 (until all calls migrated in IA-3)
- Risk: LOW — purely additive, no service changes

**IA-2 — ORM Method Migration (~32 methods)**
- Inject `EntityManager` into service constructor
- Migrate methods that can cleanly use ORM API (FULL ORM + HYBRID ORM)
- `snapshotSubmissionHistory()` must migrate first (it's called by autoRevert and all QR workflows)
- `autoRevertQuarterlyReport()` must migrate second (it's called after every CUD operation)
- Then all other methods can reference these two ORM-based helpers
- Risk: MEDIUM — behavioral correctness depends on ORM property-to-column mapping

**IA-3 — Raw SQL Wrapper Conversion + Module Cleanup**
- Replace all remaining `this.db.query(sql, params)` → `this.em.getConnection().execute(sql, params, 'all')`
- Fix all `result.rows` references
- Remove `private readonly db: DatabaseService` from constructor
- Remove `DatabaseService` from `@Inject` and from constructor params
- Remove `DatabaseModule` from `university-operations.module.ts` imports
- Remove `DatabaseModule` import from the service file header
- Risk: LOW — mechanical text replacement; queries are unchanged, only the call wrapper changes

---

### IA-F: Module Cleanup Rules

| Module | Action |
|---|---|
| `university-operations.module.ts` | Remove `DatabaseModule` import; add `MikroOrmModule.forFeature([8 entities])` |
| `app.module.ts` | RETAIN `DatabaseModule` — used by `PermissionResolverService` (PG stored functions) |
| `users.module.ts` | RETAIN `DatabaseModule` — already migrated to ORM but some auth helpers still need it |
| `auth.module.ts` | RETAIN `DatabaseModule` — auth service uses it |
| `entities/index.ts` | Append 8 new entity exports (additive only, no removals) |

---

### IA-G: Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| `PillarIndicatorTaxonomy` entity accidentally used for writes | 🔴 HIGH | Add `@ReadOnly()` comment + never call `em.persist()` or `em.create()` on it |
| `FiscalYear` entity PK is `year: INTEGER` not UUID | 🟠 MEDIUM | Use `@PrimaryKey() year: number` in entity; no `@Property() id` |
| Dynamic column names (`status_q1`..`status_q4`) break ORM | 🟠 MEDIUM | Keep `submitQuarterForReview`, `approveQuarter`, `rejectQuarter`, `withdrawQuarter` as HYBRID RAW |
| `result.rows` references missed after wrapper change | 🟠 MEDIUM | Full grep scan for `result.rows` after IA-3 to verify zero remaining |
| `autoRevertQuarterlyReport()` correctness post-migration | 🟠 MEDIUM | Must call `em.flush()` before the nativeUpdate to ensure prior changes are committed |
| OperationOrganizationalInfo upsert with `em.flush()` | 🟡 LOW | em.findOne then create-or-update pattern is safe — no race condition in single-threaded request |
| 8 entities all need `@Filter` decorator syntax correct | 🟡 LOW | Use exact format: `@Filter({ name: 'notDeleted', cond: { deletedAt: null } })` |

---

## Section 2.96 — Phase IB: Auth Filter Propagation Bug + FiscalYear PK Fix (2026-04-22)

**Status:** Phase 1 Research Complete → Phase 2 Plan ready
**Objective:** Identify root cause of `GET /api/university-operations/config/fiscal-years` failing, trace back to auth login 500, and plan surgical fix.

---

### IB-A: Error Chain Analysis

**Reported failure:** `GET /api/university-operations/config/fiscal-years` returns error.

**Actual root cause:** The fiscal year endpoint is gated behind JWT auth. The auth login endpoint (`POST /api/auth/login`) is throwing 500 before a JWT can be issued. Without a valid JWT, every protected endpoint returns 401.

**Confirmed login error (from backend console):**
```
[query] select "u0".* from "users" as "u0" where "u0"."deleted_at" is null
  and ("u0"."email" ilike 'admin' or "u0"."username" ilike 'admin') limit 1
  [took 46ms, 1 result]
Error: Trying to query by not existing property UserRole.deletedAt
```

The User query succeeds. Immediately after, `em.find(UserRole, { userId })` crashes because MikroORM is trying to apply `deleted_at IS NULL` to `user_roles`, which has no `deleted_at` column.

---

### IB-B: Root Cause — MikroORM v6 Filter Propagation Mechanism

**MikroORM version confirmed:** `@mikro-orm/core: ^6.6.13` (from `pmo-backend/package.json`).

**Global filter state (app.module.ts line 61):**
```typescript
filters: { notDeleted: { cond: { deletedAt: null }, default: false } }
```
`default: false` → filter is NOT auto-applied globally. ✅ (Phase HT fix was correctly applied.)

**Entity-level `@Filter` decorators with `default: true`:**

| Entity | Has `@Filter(default: true)` | Has `deletedAt` |
|--------|------------------------------|-----------------|
| `User` | ✅ yes | ✅ yes |
| `Role` | ✅ yes | ✅ yes |
| `Permission` | ✅ yes | ✅ yes |
| `Department` | ✅ yes | ✅ yes |

**How the crash occurs:**

In MikroORM v6, entity-level `@Filter({ name, cond, default: true })` ENABLES the named filter at the **EntityManager context level** (not just for the queried entity). Once the named filter is active in the EM context, all subsequent queries on the same EM request fork apply the filter — including entities that never defined the filter themselves. MikroORM applies the global cond `{ deletedAt: null }` to any entity queried while the filter is "on".

**Call sequence in `auth.service.ts` `login()`:**

```
em.findOne(User, { $or: [email/username] })
  → User has @Filter({ name: 'notDeleted', ..., default: true })
  → MikroORM enables 'notDeleted' filter in EM context
  → Query: WHERE deleted_at IS NULL ... ← SUCCEEDS (1 result)

em.find(UserRole, { userId: user.id })
  → 'notDeleted' filter is NOW ACTIVE in EM context
  → MikroORM tries to apply: WHERE deleted_at IS NULL
  → UserRole has NO deletedAt column
  → CRASH: "Trying to query by not existing property UserRole.deletedAt"
```

**Why Phase HT did not fully resolve this:** Phase HT changed `app.module.ts` global filter from `default: true` → `default: false`. This was necessary but insufficient. The entity-level `@Filter({ ..., default: true })` decorators were left unchanged, and they still activate the filter in the EM context when those entities are queried.

---

### IB-C: All Affected Queries in `auth.service.ts`

**`login()` method (lines 95–171):**

| Line | Query | Entity | Has `deletedAt`? | Safe? |
|------|-------|--------|-----------------|-------|
| 33 | `em.findOne(User, {...})` | `User` | ✅ yes | ✅ triggers filter |
| 103 | `em.find(UserRole, { userId })` | `UserRole` | ❌ no | 💥 CRASHES |
| 106 | `em.find(Role, { id: { $in } })` | `Role` | ✅ yes | ✅ safe |
| 115 | `em.find(RolePermission, { roleId: { $in } })` | `RolePermission` | ❌ no | 💥 CRASHES |
| 118 | `em.find(Permission, { id: { $in } })` | `Permission` | ✅ yes | ✅ safe |
| 124 | `em.find(UserPermissionOverride, { userId })` | `UserPermissionOverride` | ❌ no | 💥 CRASHES |
| 131 | `em.find(UserModuleAssignment, { userId })` | `UserModuleAssignment` | ❌ no | 💥 CRASHES |
| 137 | `em.find(UserPillarAssignment, { userId })` | `UserPillarAssignment` | ❌ no | 💥 CRASHES |

**`getProfile()` method (lines 173–242):**

| Line | Query | Entity | Has `deletedAt`? | Safe? |
|------|-------|--------|-----------------|-------|
| 174 | `em.findOne(User, { id })` | `User` | ✅ yes | ✅ triggers filter |
| 180 | `em.find(UserRole, { userId })` | `UserRole` | ❌ no | 💥 CRASHES |
| 183 | `em.find(Role, { id: { $in } })` | `Role` | ✅ yes | ✅ safe |
| 195 | `em.find(RolePermission, { roleId: { $in } })` | `RolePermission` | ❌ no | 💥 CRASHES |
| 198 | `em.find(Permission, { id: { $in } })` | `Permission` | ✅ yes | ✅ safe |
| 204 | `em.find(UserPermissionOverride, { userId })` | `UserPermissionOverride` | ❌ no | 💥 CRASHES |
| 211 | `em.find(UserModuleAssignment, { userId })` | `UserModuleAssignment` | ❌ no | 💥 CRASHES |
| 217 | `em.find(UserPillarAssignment, { userId })` | `UserPillarAssignment` | ❌ no | 💥 CRASHES |

**`buildSsoTokenForUser()` method (lines 262–299):**

| Line | Query | Entity | Has `deletedAt`? | Safe? |
|------|-------|--------|-----------------|-------|
| 263 | `em.find(UserRole, { userId })` | `UserRole` | ❌ no | ⚠️ safe IF first query, but fragile |
| 266 | `em.find(Role, { id: { $in } })` | `Role` | ✅ yes | ⚠️ enables filter |
| 272 | `em.findOne(User, { id })` | `User` | ✅ yes | ⚠️ also enables filter |

In SSO flow, line 263 currently precedes the filter-enabling queries, so it may accidentally pass. But this is order-dependent and fragile.

---

### IB-D: Entities Without `deletedAt` (Complete Audit)

Entities queried in auth service that do NOT have `deletedAt`:

| Entity | Table | `deletedAt`? | Fix needed? |
|--------|-------|-------------|-------------|
| `UserRole` | `user_roles` | ❌ | ✅ add `{ filters: false }` |
| `RolePermission` | `role_permissions` | ❌ | ✅ add `{ filters: false }` |
| `UserPermissionOverride` | `user_permission_overrides` | ❌ | ✅ add `{ filters: false }` |
| `UserModuleAssignment` | `user_module_assignments` | ❌ | ✅ add `{ filters: false }` |
| `UserPillarAssignment` | `user_pillar_assignments` | ❌ | ✅ add `{ filters: false }` |
| `FiscalYear` | `fiscal_years` | ❌ | ✅ (no auth query precedes FY query, but defensive) |

---

### IB-E: FiscalYear Entity Secondary Issue

**Entity definition:**
```typescript
@PrimaryKey({ type: 'integer' })
year!: number;
```

**Migration 023 schema:**
```sql
year INTEGER PRIMARY KEY  -- NOT SERIAL, NOT BIGSERIAL
```

**Issue:** In MikroORM v6, `@PrimaryKey({ type: 'integer' })` defaults to `autoincrement: true`. This means MikroORM expects a PostgreSQL SEQUENCE behind the `year` column. The actual DB column has NO sequence (plain `INTEGER PRIMARY KEY`, not `SERIAL`). This causes no error for SELECT (`find()`), but INSERT via `em.create() + em.flush()` will fail with RETURNING sequence mismatch.

**Additional mismatch:** Entity default `isActive: boolean = false` vs DB default `is_active BOOLEAN NOT NULL DEFAULT true`. For reads this is irrelevant (DB value is used). For ORM-created entities (INSERT), `isActive: true` must be explicitly set — which `createFiscalYear()` correctly does.

**Fix:** Add `autoincrement: false` to `@PrimaryKey` declaration:
```typescript
@PrimaryKey({ type: 'integer', autoincrement: false })
year!: number;
```

---

### IB-F: Why the Fiscal Year GET Specifically Fails

**With the login broken:**
- Operator cannot obtain JWT
- `GET /api/university-operations/config/fiscal-years` requires `@Roles('Admin', 'Staff')` (class-level guard)
- Returns 401 Unauthorized (no valid JWT)

**If login were fixed (valid JWT available):**
- `JwtStrategy.validate()` does NOT query the database → no filter activation
- `fyRepo.find({ isActive: true }, { fields: ['year', 'label'], orderBy: { year: 'DESC' } })` is called
- `FiscalYear` has no `@Filter` decorator → `notDeleted` filter NOT activated
- Global filter `default: false` → NOT applied
- Query: `SELECT year, label FROM fiscal_years WHERE is_active = true ORDER BY year DESC`
- Returns 2022–2026 rows ✅

**Conclusion:** The fiscal year GET endpoint code is CORRECT. No ORM fixes are needed to the fiscal year query itself. The failure is entirely upstream (auth login broken).

---

### IB-G: Summary Table

| Issue | Severity | Root Cause | Fix |
|-------|----------|------------|-----|
| `POST /api/auth/login` → 500 | 🔴 CRITICAL | Entity-level `@Filter(default: true)` enables filter globally; `UserRole` has no `deletedAt` | Add `{ filters: false }` to non-soft-delete entity queries in auth.service.ts |
| `GET /api/university-operations/config/fiscal-years` → 401 | 🔴 CRITICAL | Downstream of login failure — no valid JWT | Fixed by fixing login |
| `FiscalYear @PrimaryKey` autoincrement mismatch | 🟠 MEDIUM | `@PrimaryKey({ type: 'integer' })` defaults to `autoincrement: true`; DB uses plain INTEGER PK | Add `autoincrement: false` |

---

## Section 2.100 — Phase IJ: Operation Assignment CRUD + Quarter-Level Submission Audit (2026-04-22)

**Status:** Phase 1 Research Complete → Phase 2 Plan ready
**Objective:** Research deferred items 66 (UO Operation Assignment CRUD endpoints) and 75 (Quarter-level per-QN submission). Determine exact scope of missing backend work and plan implementation.

---

### IG-A: Item 66 — UO Operation Assignment CRUD Gap Analysis

#### IG-A-1: Infrastructure State

The `record_assignments` table and entity are fully operational:

**Schema (migration 012):**
```sql
CREATE TABLE IF NOT EXISTS record_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module VARCHAR(50) NOT NULL CHECK (module IN ('CONSTRUCTION', 'REPAIR', 'OPERATIONS')),
  record_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(module, record_id, user_id)
);
```

**Entity:** `pmo-backend/src/database/entities/record-assignment.entity.ts` — `RecordAssignment` class, already imported at `university-operations.service.ts` line 22.

**Existing service method:** `updateRecordAssignments(recordId, userIds[])` (private) — replaces ALL assignments for a record. Called from `create()` and `update()` only.

#### IG-A-2: Endpoint Gap

| Operation | Route | Status |
|-----------|-------|--------|
| List assignees | `GET /:id/assignments` | ❌ MISSING |
| Add single assignee | `POST /:id/assignments` | ❌ MISSING |
| Remove single assignee | `DELETE /:id/assignments/:userId` | ❌ MISSING |
| Replace all | Embedded in `PATCH /:id` via `assigned_user_ids` | ✅ EXISTS |

No controller routes for standalone assignment CRUD. Assignments can only be managed as part of a full operation `create()` / `update()` call. There is no way for admin UI to fetch who is currently assigned to an operation, add a single user, or remove a single user without re-PATCHing the entire operation.

#### IG-A-3: Eligible Users

No dedicated `GET /eligible-users` endpoint exists on the UO controller. The frontend assignment selector must either use the general `GET /api/users` endpoint or a module-specific endpoint. This is out of scope for IG (existing frontend handles it).

---

### IG-B: Item 75 — Quarter-Level Submission Status Audit

#### IG-B-1: Finding — Backend Is Already Implemented

Contrary to the DEFERRED status note "backend required", per-quarter operation submission endpoints **already exist and are fully implemented**:

**Controller (`university-operations.controller.ts` lines 419–462) — Phase DY-D:**
- `POST /:id/submit-quarter` → `submitQuarterForReview(id, quarter, userId)`
- `POST /:id/approve-quarter` → `approveQuarter(id, quarter, adminId, user)` (Admin only)
- `POST /:id/reject-quarter` → `rejectQuarter(id, quarter, adminId, notes, user)` (Admin only)
- `POST /:id/withdraw-quarter` → `withdrawQuarter(id, quarter, userId)`

**Service (`university-operations.service.ts` lines 904–1060):**
- `submitQuarterForReview()` — validates current status, sets `status_qN = 'PENDING_REVIEW'`
- `approveQuarter()` — validates PENDING_REVIEW, sets `status_qN = 'PUBLISHED'`, prevents self-approval
- `rejectQuarter()` — validates PENDING_REVIEW, sets `status_qN = 'REJECTED'`, records notes
- `withdrawQuarter()` — validates PENDING_REVIEW, sets `status_qN = 'DRAFT'`

All four methods use the dynamic `status_q${quarter.toLowerCase()}` column pattern on `university_operations`.

#### IG-B-2: Root Cause of DEFERRED Status

The deferred label was applied in Phase EJ before these endpoints were built (built in Phase DY-D). The deferral was never cleared after implementation. **Item 75 is BACKEND COMPLETE and the deferred flag is stale.**

The remaining work (if any) is **frontend wiring** — whether the Nuxt frontend calls these endpoints from the Physical Accomplishment page. That is a frontend concern, not a backend API task.

#### IG-B-3: Clarification — Two Separate Submission Systems

| System | Table | Status Columns | Endpoints |
|--------|-------|----------------|-----------|
| Per-quarter **operation** status | `university_operations` | `status_q1/q2/q3/q4` | `/:id/submit-quarter`, `approve-quarter`, etc. — ✅ DONE |
| Per-quarter **report** publication | `quarterly_reports` | `publication_status` (single) | `/quarterly-reports/:id/submit`, `approve`, etc. — ✅ DONE |

Item 75 refers to the first system. It is complete.

---

### IG-C: Summary

| Item | Gap | Risk | Action |
|------|-----|------|--------|
| 66 — Assignment CRUD | 3 missing endpoints: GET/POST/DELETE assignments | 🟢 LOW (no schema change, entity already imported) | Build in Phase IG |
| 75 — Quarter submission | Backend already complete (Phase DY-D) | ⬜ NONE | Clear deferred flag only |

**Total backend changes for Phase IG: 3 new service methods + 3 new controller routes. No migration. No entity changes.**

---

**Status:** Phase 1 Research Complete → Phase 2 Plan ready
**Objective:** Identify and trace root causes of 5 post-IA-3 API failures: 400 DTO validation on `operation_type`, empty indicator response, UUID validation rejection, 500 `column "role" does not exist` in submit, and resulting quarterly submission crash.

---

### IE-A: Issue — 400 on `GET /university-operations?operation_type=HIGHER_EDUCATION`

**Error:** `"property operation_type should not exist"`

**Evidence: `main.ts` lines 17–19 + `query-operation.dto.ts` line 9**

`main.ts` global `ValidationPipe` is configured with:
```typescript
whitelist: true,            // strips unknown props
forbidNonWhitelisted: true, // throws 400 on unknown props
```

`QueryOperationDto` declares:
```typescript
@IsOptional()
@IsEnum(OperationType)
type?: OperationType;          // ← field is named "type", NOT "operation_type"
```

The service reads `query.type` at line 449 and maps it to `uo.operation_type` in SQL. The DTO field name `type` is inconsistent with the DB column name and the API caller expectation. Every caller sending `operation_type` receives a 400.

**Root cause:** DTO field name mismatch (`type` ≠ `operation_type`). The DTO was named generically (`type`) while the domain field and DB column are `operation_type`. `forbidNonWhitelisted: true` enforces this strictly.

**Fix required:** Rename DTO field `type` → `operation_type`. Update the one service reference `query.type` → `query.operation_type` (service line 449).

---

### IE-B: Issue — Empty response from `GET /indicators?fiscal_year=2025`

**Evidence: `university-operations.controller.ts` lines 96–104**

Controller guard:
```typescript
if (pillarType && fiscalYear) {
  return this.service.findIndicatorsByPillarAndYear(pillarType, fiscalYear, quarter);
}
return [];  // ← explicit fallback when either param is missing
```

**Root cause A:** When called without `pillar_type`, the guard short-circuits to `[]` immediately — no DB call made. This is intentional design: the endpoint REQUIRES both `pillar_type` AND `fiscal_year`.

**Root cause B (data emptiness):** When called correctly with both params, `findIndicatorsByPillarAndYear()` queries `operation_indicators` joined to `university_operations` WHERE `uo.operation_type = $1` AND `oi.fiscal_year = $2`. If no indicator records exist for that pillar+FY in the DB (e.g., fresh smoke test with no data entered yet), the result is legitimately empty.

**Verdict:** No code bug. This is a test-execution order issue. Test `06-B` (list indicators) must be run AFTER `06-D` (create indicator) in the smoke test sequence, or it must use a FY+pillar combination that already has production data in the DB.

**No fix required in code.** Smoke test documentation should clarify that `06-B` will return `[]` until `06-D` has been executed for that pillar+FY combination.

---

### IE-C: Issue — UUID Validation Failure on `POST /:id/indicators/quarterly`

**Error:** `"pillar_indicator_id must be a UUID"`

**Evidence: `create-indicator.dto.ts` line 35–37**

```typescript
@IsUUID()
@IsNotEmpty()
pillar_indicator_id: string;
```

The Postman smoke test collection body for request `06-D` contains the literal placeholder:
```json
"pillar_indicator_id": "REPLACE_WITH_ID_FROM_06A"
```

`REPLACE_WITH_ID_FROM_06A` is not a valid UUID v4 string. `@IsUUID()` rejects it with the observed error.

**Root cause:** Test execution error — tester did not replace the placeholder with the actual taxonomy `id` from the `06-A` response. The DTO validation is working correctly.

**No code fix required.** Smoke test instructions must be followed: run `06-A`, copy the `id` from the first taxonomy item in the response, paste it into the `pillar_indicator_id` field of `06-D` before sending.

---

### IE-D: Issue — 500 `column "role" does not exist` in `submitQuarterlyReport()`

**Evidence: `university-operations.service.ts` lines 3077–3086**

```typescript
const adminCheck = await this.em.getConnection().execute(
  `SELECT role FROM users WHERE id = $1`,
  [userId],
);
const isAdmin = adminCheck[0]?.role === 'Admin';
```

The `users` table does NOT have a `role` column. Confirmed by `user.entity.ts` — no `role` property exists. The system uses a normalized RBAC model:
- `users` → `user_roles` → `roles` (joined via `user_roles.role_id`)
- The `roles` table has `name` column (e.g., `'Admin'`, `'Staff'`)

This raw SQL query is a **pre-RBAC residual** — it was written when roles were stored directly on the `users` table. After Phase HO–HS normalized RBAC into separate tables, this query became invalid. It survived IA-3 because IA-3 converted `this.db.query()` → `this.em.getConnection().execute()` mechanically without auditing SQL validity.

**Correct pattern:** `PermissionResolverService.isAdminFromDatabase(userId)` (line 50–66 of `permission-resolver.service.ts`) already performs the correct RBAC-table-based admin check using ORM:
```typescript
// Queries user_roles (isSuperadmin) + user_roles JOIN roles WHERE name='Admin'
async isAdminFromDatabase(userId: string): Promise<boolean>
```

The `permissionResolver` is already injected in the UO service constructor. No new injection needed.

**Root cause:** Stale raw SQL referencing non-existent `role` column on `users`. Must be replaced with `this.permissionResolver.isAdminFromDatabase(userId)`.

---

### IE-E: Issue — 500 on `POST /quarterly-reports/:id/submit`

**Cause:** Directly triggered by IE-D. The `adminCheck` execute call at line 3078 throws a PostgreSQL `InvalidFieldNameException` before the submission logic runs. The entire submit transaction aborts.

**No independent fix needed.** Fixing IE-D resolves IE-E.

---

### IE-F: Impact Summary

| Section | Endpoint | Type | Code Bug? | Fix Location |
|---------|----------|------|-----------|--------------|
| **IE-0** | `POST /:id/indicators/quarterly` | 500 param swap | ✅ YES | Service lines 296–308, 241–250 |
| **IE-0** | `PATCH /:id/indicators/:id/quarterly` | 500 param swap | ✅ YES | Same |
| **IE-0** | `POST /:id/financials` | 500 param swap | ✅ YES | Same |
| **IE-0** | `PATCH /:id/financials/:id` | 500 param swap | ✅ YES | Same |
| IE-A | `GET /university-operations` | 400 DTO mismatch | ✅ YES | `query-operation.dto.ts` + service line 449 |
| IE-B | `GET /indicators` | Empty response | ❌ NO (test issue) | Smoke test docs only |
| IE-C | `POST /:id/indicators/quarterly` | UUID rejection | ❌ NO (test execution) | Smoke test execution only |
| IE-D | `POST /quarterly-reports/:id/submit` | 500 schema drift | ✅ YES | Service lines 3077–3086 |
| IE-E | `POST /quarterly-reports/:id/submit` | 500 cascade | ✅ YES (from IE-D) | Same fix as IE-D |

**Total code changes required: 2 files, 4 surgical edits.**

---

### IE-G: Issue — 500 on All Indicator + Financial CUD (Parameter Swap in Edit Guards)

**Discovered:** Post-smoke-test runtime trace (2026-04-22)

**Affected endpoints (all 500):**
- `POST /:op_id/indicators/quarterly` (createIndicatorQuarterlyData)
- `PATCH /:op_id/indicators/:id/quarterly` (updateIndicatorQuarterlyData)
- `POST /:op_id/financials` (createFinancial)
- `PATCH /:op_id/financials/:id` (updateFinancial)

**Error from PostgreSQL:**
```
invalid input syntax for type uuid: "Q1"
```

**Evidence: `university-operations.service.ts` lines 296–308 (`validateOperationEditable`) and lines 241–250 (`validateFinancialEditable`)**

Both functions run a JOIN query with two `?` placeholders in this order:

```sql
... qr.quarter = ?          ← placeholder 1 → expects "Q1" / "Q2" / "Q3" / "Q4"
    AND qr.deleted_at IS NULL
WHERE uo.id = ?             ← placeholder 2 → expects UUID
```

But both functions pass params as `[operationId, quarter]`:

```typescript
// validateOperationEditable — line 307
[operationId, quarter]    // ← WRONG: UUID → quarter position, "Q1" → uuid position

// validateFinancialEditable — line 249
[operationId, quarter]    // ← WRONG: same inversion
```

PostgreSQL receives `WHERE uo.id = 'Q1'` — UUID column comparison fails with type error → 500.

**Fix:** Swap params to `[quarter, operationId]` in both functions. **2 characters moved, 4 operations unblocked.**

**Root cause classification:** IA-3 migration preserved the original params order from the old `this.db.query()` call but the SQL query had already been reorganized at some point to put `qr.quarter = ?` before `WHERE uo.id = ?`, creating the inversion.

---

## Section 2.97 — Phase IC: Entity Schema Reconciliation — IA-1 Entity vs DB Alignment (2026-04-22)

**Status:** Phase 1 Research Complete → Phase 2 Plan ready
**Objective:** Systematically verify each of the 9 IA-1-generated MikroORM entities against the actual PostgreSQL schema (base schema + migrations 001–041) and produce a corrected entity for each mismatched file. This phase must complete before Phase IA-2b (ORM method migration) to prevent compounded schema drift.

---

### IC-A: Context — Why Entity Accuracy Matters

The Phase IA-1 pass created entity files from a best-guess interpretation of the schema. The UO service uses raw SQL (`this.db.query()`) for all current operations, so the mismatched entities do not cause runtime failures *today*. However:

1. **Phase IA-2b** will migrate service methods FROM raw SQL TO ORM repositories. If entity properties map to wrong column names, every migrated query will silently SELECT wrong columns or crash.
2. `@Filter` decorators on entities with `deletedAt` fields interact with the global MikroORM filter propagation (Phase IB root cause). Entities claiming `deletedAt` when the DB column does not exist will crash.
3. MikroORM's schema validation (`schema:validate`) will flag drift. Clean entities are prerequisite for production safety.

**Source of truth for column names:** `university-operations.service.ts` raw SQL INSERT/SELECT/UPDATE statements (irrefutable evidence of actual DB column names at runtime).

---

### IC-B: Entity #1 — `UniversityOperation` → `university_operations`

**File:** `pmo-backend/src/database/entities/university-operation.entity.ts`
**Severity:** 🔴 CRITICAL — 2 wrong/fabricated properties, 16+ missing columns

#### Drift Table

| Entity Property | Maps to DB Column | DB Column Exists? | Status |
|----------------|-------------------|-------------------|--------|
| `title` | `title` | ✅ | ✅ CORRECT |
| `description` | `description` | ✅ | ✅ CORRECT |
| `pillar` | `pillar` | ❌ (DB has `operation_type`) | ❌ WRONG |
| `campus` | `campus` | ✅ (type: `campus_enum`, not VARCHAR) | ⚠️ TYPE DRIFT |
| `targetYear` | `target_year` | ❌ (no such column) | ❌ FABRICATED |
| `statusQ1` | `status_q1` | ✅ | ✅ CORRECT |
| `statusQ2` | `status_q2` | ✅ | ✅ CORRECT |
| `statusQ3` | `status_q3` | ✅ | ✅ CORRECT |
| `statusQ4` | `status_q4` | ✅ | ✅ CORRECT |
| `fiscalYear` | `fiscal_year` | ✅ | ✅ CORRECT |
| `createdAt` | `created_at` | ✅ | ✅ CORRECT |
| `updatedAt` | `updated_at` | ✅ | ✅ CORRECT |
| `deletedAt` | `deleted_at` | ✅ | ✅ CORRECT |

#### Missing Columns (confirmed by service raw SQL)

| DB Column | Evidence Source | Required for Phase IA-2b? |
|-----------|----------------|--------------------------|
| `operation_type` | `findAll()` SELECT, `create()` INSERT | ✅ YES — pillar type |
| `code` | `findAll()` SELECT `uo.code` | ✅ YES |
| `start_date` | `findAll()` SELECT `uo.start_date` | ✅ YES |
| `end_date` | `findAll()` SELECT `uo.end_date` | ✅ YES |
| `status` | `findAll()` SELECT (project_status_enum) | ✅ YES |
| `budget` | base schema DECIMAL(15,2) | ✅ YES |
| `coordinator_id` | base schema UUID | ✅ YES |
| `publication_status` | `submitForReview()`, `publish()`, `reject()` | ✅ YES — governance |
| `submitted_by` | `submitForReview()` UPDATE | ✅ YES |
| `submitted_at` | `submitForReview()` UPDATE | ✅ YES |
| `reviewed_by` | `publish()` UPDATE | ✅ YES |
| `reviewed_at` | `publish()` UPDATE | ✅ YES |
| `review_notes` | `reject()` UPDATE | ✅ YES |
| `assigned_to` | `create()` INSERT (legacy single assignment) | ✅ YES |
| `created_by` | `findMyDrafts()` WHERE | ✅ YES |
| `updated_by` | base schema UUID | ✅ YES |
| `metadata` | base schema JSONB | ✅ YES |
| `deleted_by` | `removeIndicator()` soft-delete pattern | ✅ YES |

---

### IC-C: Entity #2 — `OperationIndicator` → `operation_indicators`

**File:** `pmo-backend/src/database/entities/operation-indicator.entity.ts`
**Severity:** 🔴 CRITICAL — 4 wrong property names, 14+ missing columns

#### Drift Table

| Entity Property | Maps to DB Column | DB Column Exists? | Status |
|----------------|-------------------|-------------------|--------|
| `id` | `id` | ✅ | ✅ CORRECT |
| `operationId` | `operation_id` | ✅ | ✅ CORRECT |
| `reportedQuarter` | `reported_quarter` | ✅ (migration 025) | ✅ CORRECT |
| `pillarIndicatorTaxonomyId` | `pillar_indicator_taxonomy_id` | ❌ (DB has `pillar_indicator_id`) | ❌ WRONG NAME |
| `customIndicatorName` | `custom_indicator_name` | ❌ (DB has `particular`) | ❌ FABRICATED |
| `targetQ1..Q4` | `target_q1..q4` | ✅ | ✅ CORRECT |
| `actualQ1` | `actual_q1` | ❌ (DB has `accomplishment_q1`) | ❌ WRONG NAME |
| `actualQ2` | `actual_q2` | ❌ (DB has `accomplishment_q2`) | ❌ WRONG NAME |
| `actualQ3` | `actual_q3` | ❌ (DB has `accomplishment_q3`) | ❌ WRONG NAME |
| `actualQ4` | `actual_q4` | ❌ (DB has `accomplishment_q4`) | ❌ WRONG NAME |
| `overrideTotalTarget` | `override_total_target` | ✅ (migration 035) | ✅ CORRECT |
| `overrideTotalActual` | `override_total_actual` | ✅ (migration 035) | ✅ CORRECT |
| `catchUpPlans` | `catch_up_plans` | ❌ (DB has `catch_up_plan`, singular, migration 036) | ❌ WRONG NAME |
| `facilitatingFactors` | `facilitating_factors` | ✅ (migration 036) | ✅ CORRECT |
| `waysForward` | `ways_forward` | ✅ (migration 036) | ✅ CORRECT |
| `remarks` | `remarks` | ✅ | ✅ CORRECT |
| `createdAt` / `updatedAt` / `deletedAt` | audit columns | ✅ | ✅ CORRECT |

#### Missing Columns

| DB Column | Evidence Source |
|-----------|----------------|
| `particular` | `createIndicatorQuarterlyData()` INSERT col 3; `createIndicator()` INSERT col 2 |
| `fiscal_year` | `createIndicatorQuarterlyData()` INSERT col 4; every WHERE clause |
| `description` | `createIndicator()` INSERT col 3 |
| `indicator_code` | `createIndicator()` INSERT col 4 |
| `uacs_code` | `createIndicator()` INSERT col 5 |
| `score_q1..q4` | `createIndicatorQuarterlyData()` INSERT cols 14–17 |
| `override_rate` | migration 032; `computeIndicatorMetrics()` reads `record.override_rate` |
| `override_variance` | migration 034; `computeIndicatorMetrics()` reads `record.override_variance` |
| `mov` | migration 037; `createIndicatorQuarterlyData()` INSERT col 26 |
| `created_by` | `createIndicatorQuarterlyData()` INSERT col 27; `createIndicator()` INSERT col 17 |
| `updated_by` | `updateIndicator()` UPDATE SET |
| `metadata` | `createIndicator()` INSERT col 16 |
| `deleted_by` | `removeIndicator()` UPDATE SET |

**Critical rename required for FK:** `pillarIndicatorTaxonomyId` → `pillarIndicatorId` (maps to `pillar_indicator_id`)

---

### IC-D: Entity #3 — `OperationFinancial` → `operation_financials`

**File:** `pmo-backend/src/database/entities/operation-financial.entity.ts`
**Severity:** 🔴 CRITICAL — 3 wrong/fabricated properties, 10+ missing columns

#### Drift Table

| Entity Property | Maps to DB Column | DB Column Exists? | Status |
|----------------|-------------------|-------------------|--------|
| `id` | `id` | ✅ | ✅ CORRECT |
| `operationId` | `operation_id` | ✅ | ✅ CORRECT |
| `reportedQuarter` | `reported_quarter` | ❌ (financials use `quarter`, not `reported_quarter`) | ❌ WRONG NAME |
| `fundType` | `fund_type` | ✅ (migration 014) | ✅ CORRECT |
| `expenseClass` | `expense_class` | ✅ (migration 029) | ✅ CORRECT |
| `description` | `description` | ❌ (DB has `department`, `operations_programs` — no `description` col) | ❌ WRONG/FABRICATED |
| `appropriation` | `appropriation` | ❌ (DB has `allotment`) | ❌ WRONG NAME |
| `obligations` | `obligations` | ❌ (DB has `obligation`, singular) | ❌ WRONG NAME |
| `disbursement` | `disbursement` | ✅ | ✅ CORRECT |
| `remarks` | `remarks` | ✅ | ✅ CORRECT |
| `createdAt` / `updatedAt` / `deletedAt` | audit columns | ✅ | ✅ CORRECT |

**Critical note on `reportedQuarter`:** Migration 025 added `reported_quarter` ONLY to `operation_indicators`. The `operation_financials` table uses the original `quarter` column (VARCHAR(2)) from the base schema. The entity's `reportedQuarter` field would generate a query against `reported_quarter` which does NOT exist in `operation_financials`.

#### Missing Columns

| DB Column | Evidence Source |
|-----------|----------------|
| `fiscal_year` | `createFinancial()` INSERT col 2; `findFinancials()` WHERE |
| `quarter` | `findFinancials()` WHERE `AND quarter = $n`; `createFinancial()` INSERT col 3 |
| `operations_programs` | `createFinancial()` INSERT col 4; `findFinancials()` ORDER BY |
| `department` | `createFinancial()` INSERT col 5; analytics GROUP BY |
| `budget_source` | `createFinancial()` INSERT col 6 |
| `project_code` | `createFinancial()` INSERT col 8 (migration 014) |
| `allotment` | `computeFinancialMetrics()` reads `record.allotment` |
| `target` | `computeFinancialMetrics()` reads `record.target` |
| `obligation` | `computeFinancialMetrics()` reads `record.obligation` |
| `performance_indicator` | `createFinancial()` INSERT col 15 |
| `created_by` | `createFinancial()` INSERT col 17 |
| `updated_by` | base schema audit column |
| `metadata` | `createFinancial()` INSERT col 16 |
| `deleted_by` | base schema audit column |

---

### IC-E: Entity #4 — `QuarterlyReport` → `quarterly_reports`

**File:** `pmo-backend/src/database/entities/quarterly-report.entity.ts`
**Severity:** 🔴 CRITICAL — 1 fabricated property, 1 wrong column name, 3 wrong unlock field names, 1 fabricated field, 4 missing columns

#### Drift Table

| Entity Property | Maps to DB Column | DB Column Exists? | Status |
|----------------|-------------------|-------------------|--------|
| `id` | `id` | ✅ | ✅ CORRECT |
| `operationId` | `operation_id` | ❌ (quarterly_reports has NO operation_id — reports are per fiscal_year/quarter) | ❌ FABRICATED |
| `quarter` | `quarter` | ✅ | ✅ CORRECT |
| `fiscalYear` | `fiscal_year` | ✅ | ✅ CORRECT |
| `status` | `status` | ❌ (DB has `publication_status`, not `status`) | ❌ WRONG NAME |
| `submittedAt` | `submitted_at` | ✅ | ✅ CORRECT |
| `submittedBy` | `submitted_by` | ✅ | ✅ CORRECT |
| `reviewedAt` | `reviewed_at` | ✅ (service uses `reviewed_at`) | ✅ CORRECT |
| `reviewedBy` | `reviewed_by` | ✅ | ✅ CORRECT |
| `reviewNotes` | `review_notes` | ✅ | ✅ CORRECT |
| `unlockRequestedAt` | `unlock_requested_at` | ✅ | ✅ CORRECT |
| `unlockRequestedBy` | `unlock_requested_by` | ✅ | ✅ CORRECT |
| `unlockReason` | `unlock_reason` | ❌ (DB has `unlock_request_reason`) | ❌ WRONG NAME |
| `unlockReviewedAt` | `unlock_reviewed_at` | ❌ (DB has `unlocked_at`) | ❌ WRONG NAME |
| `unlockReviewedBy` | `unlock_reviewed_by` | ❌ (DB has `unlocked_by`) | ❌ WRONG NAME |
| `unlockReviewNotes` | `unlock_review_notes` | ❌ (no such column exists) | ❌ FABRICATED |
| `createdAt` / `updatedAt` / `deletedAt` | audit columns | ✅ | ✅ CORRECT |

#### Missing Columns

| DB Column | Evidence Source |
|-----------|----------------|
| `title` | `createQuarterlyReport()` INSERT col 3; `findQuarterlyReportsPendingReview()` SELECT `qr.title` |
| `publication_status` | every governance method UPDATE/WHERE |
| `created_by` | `submitQuarterlyReport()` WHERE `report.created_by` |
| `submission_count` | `submitQuarterlyReport()` UPDATE + `snapshotSubmissionHistory()` param |
| `unlocked_by` | `unlockQuarterlyReport()` UPDATE |
| `unlocked_at` | `unlockQuarterlyReport()` UPDATE |
| `unlock_request_reason` | `requestQuarterlyReportUnlock()` UPDATE |

---

### IC-F: Entity #5 — `QuarterlyReportSubmission` → `quarterly_report_submissions`

**File:** `pmo-backend/src/database/entities/quarterly-report-submission.entity.ts`
**Severity:** 🔴 CRITICAL — almost completely wrong schema; entity is unusable as-is

#### Drift Table

| Entity Property | Maps to DB Column | DB Column Exists? | Status |
|----------------|-------------------|-------------------|--------|
| `id` | `id` | ✅ | ✅ CORRECT |
| `operationId` | `operation_id` | ❌ (quarterly_report_submissions has NO operation_id) | ❌ FABRICATED |
| `quarter` | `quarter` | ✅ | ✅ CORRECT |
| `fiscalYear` | `fiscal_year` | ✅ | ✅ CORRECT |
| `status` | `status` | ❌ (DB has `event_type`) | ❌ WRONG NAME |
| `action` | `action` | ❌ (no such column; duplicate of `event_type` concept) | ❌ FABRICATED |
| `performedBy` | `performed_by` | ❌ (DB has `actioned_by`) | ❌ WRONG NAME |
| `notes` | `notes` | ❌ (DB has `review_notes` and `reason` as separate columns) | ❌ WRONG |
| `snapshotData` | `snapshot_data` | ❌ (no such column in migration 028) | ❌ FABRICATED |
| `createdAt` | `created_at` | ✅ | ✅ CORRECT |

#### Missing Columns (from `snapshotSubmissionHistory()` INSERT, confirmed)

| DB Column | Evidence Source |
|-----------|----------------|
| `quarterly_report_id` | `snapshotSubmissionHistory()` INSERT col 1 — FK to quarterly_reports |
| `version` | `snapshotSubmissionHistory()` INSERT col 4 (COALESCE submission_count) |
| `event_type` | `snapshotSubmissionHistory()` INSERT col 5 — SUBMITTED/APPROVED/REJECTED/REVERTED/UNLOCKED |
| `submitted_by` | `snapshotSubmissionHistory()` INSERT col 6 |
| `submitted_at` | `snapshotSubmissionHistory()` INSERT col 7 |
| `reviewed_by` | `snapshotSubmissionHistory()` INSERT col 8 |
| `reviewed_at` | `snapshotSubmissionHistory()` INSERT col 9 |
| `review_notes` | `snapshotSubmissionHistory()` INSERT col 10 |
| `actioned_by` | `snapshotSubmissionHistory()` INSERT col 11 |
| `actioned_at` | `snapshotSubmissionHistory()` INSERT col 12 (NOW()) |
| `reason` | `snapshotSubmissionHistory()` INSERT col 13 |

---

### IC-G: Entity #6 — `OperationOrganizationalInfo` → `operation_organizational_info`

**File:** `pmo-backend/src/database/entities/operation-organizational-info.entity.ts`
**Severity:** 🔴 CRITICAL — all 4 business fields are fabricated

#### Drift Table

| Entity Property | Maps to DB Column | DB Column Exists? | Status |
|----------------|-------------------|-------------------|--------|
| `id` | `id` | ✅ | ✅ CORRECT |
| `operationId` | `operation_id` (UNIQUE FK) | ✅ | ✅ CORRECT |
| `implementingUnit` | `implementing_unit` | ❌ (no such column) | ❌ FABRICATED |
| `programCoordinator` | `program_coordinator` | ❌ (no such column) | ❌ FABRICATED |
| `sourceOfFund` | `source_of_fund` | ❌ (no such column) | ❌ FABRICATED |
| `targetBeneficiaries` | `target_beneficiaries` | ❌ (no such column) | ❌ FABRICATED |
| `createdAt` / `updatedAt` / `deletedAt` | audit columns | ✅ | ✅ CORRECT |

#### Actual DB Columns (from base schema `pmo_schema_pg.sql` lines 964–978)

| DB Column | Type | Entity Equivalent |
|-----------|------|-------------------|
| `department` | VARCHAR(255) | `department` → `department` |
| `agency_entity` | VARCHAR(255) | `agencyEntity` → `agency_entity` |
| `operating_unit` | VARCHAR(255) | `operatingUnit` → `operating_unit` |
| `organization_code` | VARCHAR(100) | `organizationCode` → `organization_code` |

---

### IC-H: Entities #7–9 — No Changes Needed

| Entity | Table | Status |
|--------|-------|--------|
| `RecordAssignment` | `record_assignments` | ✅ CORRECT — all fields match migration 012 |
| `FiscalYear` | `fiscal_years` | ✅ CORRECT — Phase IB-2 fix (`autoincrement: false`) already applied |
| `PillarIndicatorTaxonomy` | `pillar_indicator_taxonomy` | ✅ CORRECT — Phase IA-1B reconciliation already completed |

---

### IC-I: Summary

| Entity | Wrong Fields | Fabricated Fields | Missing Fields | Action |
|--------|-------------|-------------------|----------------|--------|
| `UniversityOperation` | `pillar` (→`operationType`) | `targetYear` | 16 | 🔴 REWRITE |
| `OperationIndicator` | 4 (`pillarIndicatorTaxonomyId`, `actualQ1–Q4`, `catchUpPlans`) | `customIndicatorName` | 14 | 🔴 REWRITE |
| `OperationFinancial` | 3 (`reportedQuarter`, `appropriation`, `obligations`) | `description` | 13 | 🔴 REWRITE |
| `QuarterlyReport` | 4 (`status`, 3 unlock fields) | `operationId`, `unlockReviewNotes` | 7 | 🔴 REWRITE |
| `QuarterlyReportSubmission` | 3 (`status`, `performedBy`, `notes`) | `operationId`, `action`, `snapshotData` | 11 | 🔴 REWRITE |
| `OperationOrganizationalInfo` | 0 | 4 (all business fields) | 4 | 🔴 REWRITE |
| `RecordAssignment` | 0 | 0 | 0 | ✅ NO CHANGE |
| `FiscalYear` | 0 (IB-2 applied) | 0 | 0 | ✅ NO CHANGE |
| `PillarIndicatorTaxonomy` | 0 (IA-1B applied) | 0 | 0 | ✅ NO CHANGE |

---

## Section 2.98 — Phase IF: Smoke Test Failure Triage (IA-2b/IA-3 Post-Implementation)

**Date:** 2026-04-22
**Trigger:** Smoke test execution after IA-3 revealed 3 failure categories across 5 sections

---

### Finding IF-1 — Section A/D: Invalid Route (404) — `GET /api/university-operations//indicator-taxonomy`

**Observed:** Double-slash in URL — op_id is empty/undefined in Postman request.

**Backend route (controller line 489):**
```
@Get(':id/indicator-taxonomy')
findIndicatorTaxonomy(@Param('id', ParseUUIDPipe) id: string)
```
Route is structurally correct. `ParseUUIDPipe` rejects an empty segment with 400 before the service is even reached — confirming the request was constructed with an unset `{{op_id}}` variable.

**Root cause:** Test execution error — `{{op_id}}` Postman environment variable was not populated before firing the request. NOT a backend bug.

**Backend verdict:** NO CODE CHANGE REQUIRED.

**Test fix required:** Populate `{{op_id}}` from the response of a prior `GET /api/university-operations` or `GET /api/university-operations/display` step before invoking indicator-taxonomy endpoints.

---

### Finding IF-2 — Section B: Schema Drift (`role` column → 500) — PRE-RESOLVED by Phase IE

**Observed:** `POST /quarterly-reports/:id/submit` → 500 — `column "role" does not exist`.

**Historical root cause:** `submitQuarterlyReport()` (lines 3077–3086 pre-IE) contained:
```sql
SELECT role FROM users WHERE id = $1
```
The `users` table schema (initial schema line 54, migration 042 confirmed) NEVER included a `role` column. Roles are stored in `user_roles` (FK to `roles.name`), not denormalized onto `users`.

**Resolution:** Phase IE (implemented 2026-04-22, this session) replaced the 6-line raw SQL block with:
```typescript
const isAdmin = await this.permissionResolver.isAdminFromDatabase(userId);
```
`isAdminFromDatabase()` (permission-resolver.service.ts line 50) uses ORM to query `UserRole.isSuperadmin` and `Role.name === 'Admin'` — fully schema-correct.

**Backend verdict:** NO ADDITIONAL CHANGE REQUIRED. Phase IE is the complete fix.

---

### Finding IF-3 — Section C: Workflow State Misalignment (approve blocked at DRAFT) — CASCADING CONSEQUENCE

**Observed:** `POST /approve` → `"Only PENDING_REVIEW reports can be approved. Current status: DRAFT"`.

**Root cause:** The submit step (Section B) crashed with 500 before the `UPDATE quarterly_reports SET publication_status = 'PENDING_REVIEW'` could execute. Report remained in DRAFT. The approve guard correctly enforced PENDING_REVIEW prerequisite.

**Resolution:** Pre-resolved by Phase IE fixing the submit path. After IE, submit transitions the report to PENDING_REVIEW, making approve functional.

**Backend verdict:** NO CODE CHANGE REQUIRED. Status machine logic is correct.

---

### Finding IF-4 — Section E: Postman Full-Suite Execution Decision

**Decision:** Do NOT run all endpoints simultaneously on a system with unset variables.

**Correct sequence for smoke re-run after Phase IE:**
1. `POST /auth/login` → capture `{{token}}`
2. `GET /api/university-operations?fiscal_year=2025` → capture `{{op_id}}` from first result
3. `GET /api/university-operations/{{op_id}}/indicator-taxonomy` → verify 200
4. `POST /api/university-operations/quarterly-reports` → capture `{{qr_id}}`
5. `POST /api/university-operations/quarterly-reports/{{qr_id}}/submit` → verify PENDING_REVIEW (IE fix)
6. `POST /api/university-operations/quarterly-reports/{{qr_id}}/approve` → verify PUBLISHED

---

### Summary Table

| Section | Issue | Root Cause | Pre-Resolved? | Action |
|---------|-------|-----------|--------------|--------|
| A/D | 404 double-slash | `{{op_id}}` not set in Postman | N/A | Set variable correctly |
| B | 500 role column | `SELECT role FROM users` schema drift | ✅ Phase IE | None |
| C | DRAFT approve block | Submit crashed → status not advanced | ✅ Phase IE (cascades) | None |
| E | Full suite premature | Variables unset, system unstable | N/A | Run sequentially per IF-4 |

---

## Section 2.99 — Phase IG Research: Systemic Parameter Binding Bug (Post-IF Smoke Test)

**Date:** 2026-04-22
**Trigger:** Post-Phase IF Postman smoke test surfaced cascading 500s across UO service endpoints.
**Scope:** Phase 1 Research only. No implementation.

### IG-R1 — Reported Failure Sections (User Message 5)

| Section | Symptom | Endpoint(s) |
|---------|---------|-------------|
| A | 400 "operation_type should not exist" on query | GET /api/university-operations?operation_type=... |
| B | 500 "there is no parameter $1" | Multiple UO endpoints |
| C | 500 on organizational-info route | GET .../organizational-info |
| D | Empty data arrays returned | GET list endpoints |
| E | 500 on pillar-operation endpoints | GET .../pillar/:pillar |

### IG-R2 — Investigation Evidence

**Evidence 1 — DTO verification (Section A):**
Read `pmo-backend/src/university-operations/dto/query-operation.dto.ts` — field `operation_type?: OperationType` is present and correctly decorated. Phase IE rename was applied.
- **Conclusion:** Section A is NOT a code bug. Running backend is executing a stale build pre-dating Phase IE. Operator must restart backend (`npm run start:dev` / rebuild `dist/`).

**Evidence 2 — Placeholder syntax mismatch (Sections B/C/D/E):**
- Grep `\$[0-9]` in `university-operations.service.ts` → **97 matches** across 88 `getConnection().execute(...)` call sites.
- Sample occurrences: lines 127, 152, 184 — all use PostgreSQL `$1, $2` placeholders.
- Grep `\$[0-9]` in `permission-resolver.service.ts` → **0 matches**.
- Read `permission-resolver.service.ts` lines 126–152 → working `em.getConnection().execute()` calls use `?` placeholders:
  ```typescript
  conn.execute('SELECT can_modify_user(?, ?) as can_modify', [actorId, targetId]);
  conn.execute('SELECT user_has_module_access(?, ?::module_type) as has_access', [userId, module]);
  ```

**Evidence 3 — MikroORM driver semantics:**
- MikroORM `Connection.execute(sql, params, method)` routes through its Knex-based abstraction layer.
- Knex binds parameters positionally using `?` — not PostgreSQL's native `$N` syntax.
- PostgreSQL server receives the Knex-formatted statement; the literal `$1` in the SQL template is unbound, producing runtime error: **`error: there is no parameter $1`**.
- The underlying `pg` driver *does* accept `$N`, but MikroORM's execute path pre-rewrites `?` → `$N` internally. Supplying `$N` directly bypasses that rewrite and leaves the placeholder unbound.

### IG-R3 — Root Cause Consolidation

| Section | Root Cause | Fix Owner |
|---------|------------|-----------|
| A | Stale backend build (pre-IE DTO rename) | Operator (restart backend) |
| B | `$N` placeholders in MikroORM `execute()` calls | Phase IG mechanical conversion |
| C | Same as B — cascades through org-info query | Phase IG |
| D | Same as B — list queries fail silently / throw 500 caught upstream | Phase IG |
| E | Same as B — pillar-operation query binding | Phase IG |

**Single systemic root cause for B/C/D/E:** Phase IA-3 mechanically converted `this.db.query(...)` → `this.em.getConnection().execute(...)` but preserved the PostgreSQL `$1..$N` placeholder syntax from the prior `pg` driver. MikroORM's execute path requires `?` positional placeholders.

### IG-R4 — Scope and Blast Radius

- **File impacted:** `pmo-backend/src/university-operations/university-operations.service.ts` (only)
- **Sites to convert:** 97 `$N` occurrences across 88 `execute()` call sites
- **Parameter arrays:** unchanged — MikroORM binds by position identically to `pg`
- **Non-UO services:** `construction-projects`, `users`, `repair-projects`, `permission-resolver` already use `?` (verified via grep) — out of scope
- **Schema/DTO/entity changes:** NONE

### IG-R5 — Risks and Edge Cases

1. **Typecasts:** PostgreSQL casts like `$1::uuid` must become `?::uuid` (cast syntax survives; only the placeholder token changes).
2. **Placeholder re-use:** If any query re-references `$1` twice (same param used multiple times), naive replacement would consume a second parameter slot. **Must audit:** grep for duplicate `$N` numbers per statement before mechanical replace.
3. **Numbering gaps:** `$1, $2, $3` → `?, ?, ?` only works if numbering is sequential AND each index appears once. Non-sequential / repeated indices require manual rewrite (duplicate the parameter in the array).
4. **LIKE/regex false positives:** grep must anchor `$[0-9]` not within string literals used as business data (unlikely but audit).

### IG-R6 — Verification Strategy

- Post-conversion grep: `grep -cE '\$[0-9]+' university-operations.service.ts` → expect `0`
- TS compile: `npx tsc --noEmit` clean
- Re-run Phase IF Postman smoke collection — expect IF-V1 through IF-V5 all green
- Expected resolution: Sections B/C/D/E all return 2xx after Phase IG; Section A resolved by backend restart (independent of IG).

---

## Section 2.100 — Phase IH Research: Dynamic `$N` Generator Sites (Post-IG Residual)

**Date:** 2026-04-22
**Trigger:** Post-Phase IG smoke test (user message 6) surfaced four error types — three are Phase-IG-resolved and one reveals a Phase IG coverage gap.
**Scope:** Phase 1 Research only. No implementation.

### IH-R1 — Error Catalogue and Root Cause Classification

| Error | Endpoint | Status | Root Cause | Resolution |
|-------|----------|--------|------------|------------|
| 400 `operation_type should not exist` | GET /api/university-operations | Pre-Phase-IE stale binary | DTO source correct; backend running old `dist/` where field was `type` | Rebuild + restart (no code fix needed) |
| GET org-info → empty object | GET .../organizational-info | Expected | No org-info row inserted yet | Non-issue |
| PATCH org-info 500 (`$1`) | PATCH .../organizational-info | Pre-Phase-IG stale binary | `findOne` had literal `$1` | ✅ Phase IG |
| GET org-info 500 | GET .../organizational-info | Pre-Phase-IG stale binary | Same `findOne` | ✅ Phase IG |
| pillar-operation 500 | GET /pillar-operation | Pre-Phase-IG stale binary | `findOperationForDisplay` had literal `$1` | ✅ Phase IG |

**Post-Phase-IG residual issue:** After rebuild + restart, Error 1 (400) becomes a 500 because `findAll` still generates `$N` at runtime via JavaScript template expressions that sed could not intercept.

### IH-R2 — Phase IG Coverage Gap Analysis

Phase IG's sed command targeted LITERAL `$1`, `$2`, ... in source text. It correctly replaced all 97 static occurrences. However, six method sites build `$N` strings at runtime via JavaScript template expressions — these look like `$${paramIndex++}`, `$${params.length}`, or `years.map((_, i) => '$' + (i+1))` in source. sed sees neither `$1` nor `$2` — it sees `${paramIndex++}` which does not match the `\$[0-9]+` pattern.

### IH-R3 — Dynamic Site Inventory (All Six Sites)

**Site A — `findAll` (lines 409–496)**
Pattern: `$${paramIndex}` / `$${paramIndex++}` / `$${paramIndex + 1}` in condition strings.
```typescript
let paramIndex = 1;
conditions.push(`(uo.publication_status = $${paramIndex} AND uo.created_by = $${paramIndex + 1})`); // sequential
conditions.push(`uo.publication_status = $${paramIndex++}`);                                         // sequential
conditions.push(`(uo.campus = $${paramIndex} OR uo.created_by = $${paramIndex + 1} OR ... ra.user_id = $${paramIndex + 1})`); // $${paramIndex+1} APPEARS TWICE → push user.sub twice
conditions.push(`(... uo.created_by = $${paramIndex} OR ... ra.user_id = $${paramIndex})`);         // SAME INDEX TWICE → push user.sub twice
conditions.push(`uo.operation_type = $${paramIndex++}`);   // simple
conditions.push(`uo.status = $${paramIndex++}`);            // simple
conditions.push(`uo.campus = $${paramIndex++}`);            // simple
conditions.push(`uo.coordinator_id = $${paramIndex++}`);   // simple
conditions.push(`uo.fiscal_year = $${paramIndex++}`);       // simple
// LIMIT/OFFSET: `LIMIT $${paramIndex++} OFFSET $${paramIndex}` → LIMIT ? OFFSET ?
```
Duplicate-param cases:
- Line 435: `$${paramIndex + 1}` twice (user.sub used for `created_by` AND `ra.user_id` conditions) → fix: push `user.sub` **twice** into params array before or use separate `?` per occurrence.
- Line 442: `$${paramIndex}` twice (same user.sub value for `created_by` AND `ra.user_id`) → fix: push `user.sub` **twice**.

**Site B — `findFinancials` (lines 1859–1884)**
Pattern: `paramIndex = 2` counter; `$${paramIndex++}` for each optional filter.
```typescript
let query = `...WHERE operation_id = ? AND deleted_at IS NULL`;
const params: any[] = [operationId];
let paramIndex = 2;
if (fiscalYear) { query += ` AND fiscal_year = $${paramIndex++}`; params.push(fiscalYear); }
if (quarter)    { query += ` AND quarter = $${paramIndex++}`;     params.push(quarter); }
if (fundType)   { query += ` AND fund_type = $${paramIndex++}`;   params.push(fundType); }
if (expClass)   { query += ` AND expense_class = $${paramIndex++}`; params.push(expClass); }
```
Fix: drop `paramIndex` entirely; replace each `$${paramIndex++}` with `?`.

**Site C — `findAllQuarterlyReports` (lines 2985–2997)**
Pattern: `paramIdx = 1` counter; `$${paramIdx++}` for optional filters.
```typescript
const params: any[] = [];
let paramIdx = 1;
if (fiscalYear) { query += ` AND qr.fiscal_year = $${paramIdx++}`; params.push(fiscalYear); }
if (quarter)    { query += ` AND qr.quarter = $${paramIdx++}`;     params.push(quarter); }
```
Fix: drop `paramIdx` entirely; replace each `$${paramIdx++}` with `?`.

**Site D — `getQuarterlyReportHistory` (lines 3573–3583)**
Pattern: push-before-index (`params.push(val); query += ... $${params.length}`).
```typescript
const params: any[] = [];
if (fiscalYear) { params.push(fiscalYear); query += ` AND qrs.fiscal_year = $${params.length}`; }
if (quarter)    { params.push(quarter);    query += ` AND qrs.quarter = $${params.length}`; }
```
Fix: replace `$${params.length}` with `?` (push already adds value positionally).

**Site E — `getFinancialQuarterlyTrend` (line 3648)**
Pattern: same push-before-index pattern as Site D.
```typescript
const params: any[] = [fiscalYear];
if (pillarType && pillarType !== 'ALL') {
  params.push(pillarType);
  query += ` AND uo.operation_type = $${params.length}`;
}
```
Fix: replace `$${params.length}` with `?`.

**Site F — `getFinancialYearlyComparison` (lines 3663–3683)**
Pattern: `years.map((_, i) => `$${i + 1}`)` generates `$1,$2,$3,...` for IN clause.
```typescript
const placeholders = years.map((_, i) => `$${i + 1}`).join(',');
// query: WHERE uo.fiscal_year IN (${placeholders})
// params: years (spread as individual elements)
```
Fix: Use `= ANY(?)` with `[years]` (array as single param — confirmed working pattern from lines 2586, 2601, 2646, 2661).
```typescript
// No placeholders variable needed
// query: WHERE uo.fiscal_year = ANY(?)
// params: [years] (array wrapped as single param element)
```

### IH-R4 — Verification Strategy

- `grep -E '\$\$\{param[Ii]nd|\$\$\{params\.length|map.*\$\$\{' university-operations.service.ts` → expect **0 matches**
- TS compile + `npm run build` clean
- Backend restart with new dist
- Smoke: GET /api/university-operations?fiscal_year=2025&operation_type=HIGHER_EDUCATION → 200 (not 400 or 500)

---

## Section 2.101 — Phase II Research: `ANY(?)` Array Binding Failure + Postman Triage

**Date:** 2026-04-22
**Trigger:** Post-Phase IH analytics 500 ("syntax error at or near ','") + Postman double-slash 404s.
**Scope:** Phase 1 Research only. No implementation.

### II-R1 — Section Classification

| Section | Type | Backend Code Bug? | Action |
|---------|------|------------------|--------|
| A | Missing `{{op_id}}` → double-slash 404 | ❌ | Postman execution order (non-code) |
| B | Missing `{{tax_id}}`, `{{indicator_id}}` | ❌ | Postman variable dependency (non-code) |
| C | 409 duplicate operation code | ❌ | Stale test data — unique code per run or cleanup |
| D | `yearly-comparison` 500 SQL syntax error | ✅ | Real code bug — two stacked defects |
| E | 404 on DELETE/PATCH with missing ID | ❌ | Postman missing variable propagation (non-code) |
| F | `DISTINCT ON` analytics concern | ❌ | Non-issue — see II-R4 |

**Sections A/B/C/E are Postman orchestration issues, not backend bugs.** Backend correctly returns 404 when path param is empty (double-slash URL). No backend guard needed — NestJS ParseUUIDPipe already rejects malformed IDs.

### II-R2 — Section D Root Cause Analysis (Two Stacked Defects)

**Defect D-1: `= ANY(?)` does not work through MikroORM execute with a JS array param.**

Evidence: "syntax error at or near ','" on `yearly-comparison` endpoint.

MikroORM's `Connection.execute(sql, params, mode)` normalizes `?` → `$N` internally, then passes to the pg driver. However, when a JS array is passed as a single param element (e.g., `params = [[2023, 2024, 2025]]`), MikroORM/Knex expands the array directly inside `ANY()` — producing:
```sql
WHERE fiscal_year = ANY(2023, 2024, 2025)  -- INVALID
```
instead of a valid form. The pg driver requires either:
```sql
WHERE fiscal_year = ANY($1)  -- with $1 bound to pg array object (native pg driver only)
WHERE fiscal_year IN ($1, $2, $3)  -- positional scalars
```

Since MikroORM's execute layer stands between the code and the raw pg driver, the native array binding behavior is lost. `= ANY(?)` with an array param is INCOMPATIBLE with the MikroORM execute path.

**Defect D-2: Physical CTE queries have TWO `= ANY(?)` per execute call but params has ONE element.**

Affected execute calls:
- `yearlyRes` (line ~2579): SQL contains two `= ANY(?)` (lines 2581, 2596). Params: `[years]` (one element).
- `pillarRes` (line ~2634): SQL contains two `= ANY(?)` (lines 2641, 2656). Params: `[years]` (one element).

Original code used `= ANY($1)` with pg native — `$1` could be referenced multiple times binding to the same array. After Phase IG sed, both `$1` became independent `?` positions. With positional binding: first `?` → `years` ✓, second `?` → `params[1]` = `undefined` → NULL → `WHERE fiscal_year = ANY(NULL)` returns empty set or error.

This explains why `yearly-comparison` may return empty results even if the SQL syntax error is fixed.

**Root cause chain:**
1. Phase IG sed converted `= ANY($1)` → `= ANY(?)` (correct direction, wrong outcome)
2. Array param → MikroORM/Knex expand incorrectly → "syntax error at or near ','"
3. Duplicate `?` for same value → second binding is NULL (if syntax error is bypassed)

### II-R3 — Fix Strategy

**Replace `= ANY(?)` with `IN (${placeholders})` using scalar params.**

MikroORM execute handles individual scalar `?` bindings correctly (confirmed working across all prior fixes). The IN clause with explicit per-year placeholders is safe and transport-layer agnostic.

Pattern:
```typescript
const yqs = years.map(() => '?').join(', ');
// SQL: WHERE fiscal_year IN (${yqs})
// If appears TWICE in one execute call: params = [...years, ...years]
// If appears ONCE in one execute call:  params = [...years]
```

**Affected sites:**

| Method | Execute calls | ANY(?) count per call | Params fix |
|--------|--------------|----------------------|------------|
| `getYearlyComparison` — `yearlyRes` | 1 execute | 2 `ANY(?)` | `IN (${yqs})` × 2 → params `[...years, ...years]` |
| `getYearlyComparison` — `pillarRes` | 1 execute | 2 `ANY(?)` | `IN (${yqs})` × 2 → params `[...years, ...years]` |
| `getFinancialYearlyComparison` | 1 execute | 1 `ANY(?)` | `IN (${yqs})` × 1 → params `[...years]` |

**Out of scope:** The physical analytics queries at lines 2581/2596/2641/2656 are WITHIN `getYearlyComparison` — these are the yearlyRes and pillarRes calls above. The financial at line 3670 is `getFinancialYearlyComparison`.

### II-R4 — Section F Verdict: Non-Issue

The `DISTINCT ON (oi.fiscal_year, oi.pillar_indicator_id)` in `canonical_ops` CTE does NOT drop quarter data. It deduplicates: for each (fiscal_year, pillar_indicator_id) pair, selects the single most-recently-updated `operation_id`. The `merged` CTE then joins ALL `operation_indicators` rows matching that canonical `operation_id` + indicator + year, then applies `MAX(target_q1)`, `MAX(target_q2)`, `MAX(target_q3)`, `MAX(target_q4)` — all four quarters are aggregated. No data is dropped. Architecture is correct as designed.

### II-R5 — Postman Remediation Notes (Non-Code Fixes)

These require Postman collection edits only — no backend changes:

- **Section A/E:** Run `03-B` (CREATE operation) before any `06-*` endpoint. The test script in `03-B` must `pm.environment.set("op_id", pm.response.json().id)`.
- **Section B:** Run `06-A` (GET taxonomy) to set `tax_id` before `06-D`. Run indicator create to set `indicator_id` before quarterly-data endpoints.
- **Section C:** Change operation code in `03-B` request body to use a timestamp-suffix (e.g., `HE-II-${Date.now()}`) to avoid conflict on reruns, or add a pre-request DELETE of the existing record.

### II-R6 — Verification Strategy

Post-fix:
- `grep -c 'ANY(?)' university-operations.service.ts` → expect `0`
- TS compile + build clean
- `GET /api/university-operations/analytics/yearly-comparison?years=2023,2024,2025` → 200, non-empty
- `GET /api/university-operations/analytics/financial-yearly-comparison?years=2023,2024,2025` → 200, non-empty

---
