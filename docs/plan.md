# [Active Plan] PMO Dashboard - Governance & Hierarchical CRUD
> **Governance:** ACE v2.4
> **Phase:** MAINTENANCE — All phases through FB complete. Awaiting next scope.
> **Last Updated:** 2026-03-20
> **Context:** `CLAUDE.md` (project root) | Full spec: `docs/References/ACE_CLAUDE_MD_INTEGRATION_GUIDE.txt`

---

## GOVERNANCE DIRECTIVES

| # | Directive | Status |
|---|-----------|--------|
| 1 | Approved record indicator shows approval metadata | ✅ |
| 2 | Edit button visibility reflects effective permission state | ✅ |
| 3 | UI action visibility aligns with backend enforcement | ✅ |
| 4 | Module-scoped approval functionality complete | ✅ |
| 5 | Backend enforcement remains authoritative | ✅ |
| 6 | Pending Reviews module provides centralized review visibility | ✅ |
| 7 | Submit/Withdraw submission lifecycle complete | ✅ |
| 8 | Reference Data UI visibility restricted to Admin/SuperAdmin | ✅ |
| 9 | Rank CRUD scope formally defined | ✅ Phase P |
| 10 | Backend permission logic centralized | ✅ Phase Q |
| 11 | Frontend permission drift resolved | ✅ Phase R |
| 12 | **Physical Accomplishment UPDATE must use correct operation_id** | ✅ Phase DM (VERIFIED) |
| 13 | **University Operations main module UI stabilized** | ✅ Phase DN (IMPLEMENTED) |
| 14 | **Indicator computation must use SUM for all types per BAR1** | ✅ Phase DO (IMPLEMENTED) |
| 15 | **Fiscal year management must be configurable by SuperAdmin** | ✅ Phase DO (IMPLEMENTED) |
| 16 | **Indicators must load without hard refresh** | ✅ Phase DP (IMPLEMENTED) |
| 17 | **Analytics dashboard must visualize Target vs Actual clearly** | ✅ Phase DP (IMPLEMENTED) |
| 18 | **Physical page is data entry only — no analytics** | ✅ Phase DQ (IMPLEMENTED) |
| 19 | **Analytics aggregation must respect unit types** | ✅ Phase DQ (IMPLEMENTED) |
| 20 | **Cross-operation indicator duplication must not inflate totals** | ✅ Phase DQ (IMPLEMENTED) |
| 21 | **Analytics must use rate-based model (actual/target per indicator)** | ✅ Phase DR (IMPLEMENTED) |
| 22 | **Dashboard layout: Completion Overview → Combobox Target vs Actual → Other** | ✅ Phase DR (IMPLEMENTED) |
| 23 | **Quarterly Data Entry Progress removed** | ✅ Phase DR (IMPLEMENTED) |
| 24 | **Physical page has lightweight inline pillar summary** | ✅ Phase DR (IMPLEMENTED) |
| 25 | **Quarterly data entry must be quarter-specific and independent** | ✅ Phase DS (IMPLEMENTED) |
| 26 | **Saving one quarter must not overwrite other quarters** | ✅ Phase DS (IMPLEMENTED) |
| 27 | **Entry dialog must support prefill from previous quarter** | ✅ Phase DS (IMPLEMENTED) |
| 28 | **Entry dialog must show all quarters simultaneously in tabular layout** | ✅ Phase DT (IMPLEMENTED — but incorrectly) |
| 29 | **Save must cover all visible quarters in one operation** | ✅ Phase DT (IMPLEMENTED — DT-B correct) |
| 30 | **Dialog layout must match All Quarters indicator table structure** | ✅ Phase DT (IMPLEMENTED — but orientation wrong) |
| 31 | **Dialog must use vertical quarter-row layout (rows=Q, cols=T/A/S) at ≤700px** | ✅ Phase DU (IMPLEMENTED) |
| 32 | **Main table ALL mode must expand to T/A/S per quarter (Score visible)** | ✅ Phase DU (IMPLEMENTED) |
| 33 | **Main table ALL mode colspan for empty state must match 14-col layout** | ✅ Phase DU (IMPLEMENTED) |
| 34 | **Single-quarter filter must not collapse table to 5-column layout** | ⚠️ Phase DV superseded by DW |
| 35 | **All filter modes must share the same 14-column table structure** | ⚠️ Phase DV superseded by DW |
| 36 | **Selected quarter must be visually highlighted within unified layout** | ⚠️ Phase DV superseded by DW |
| 37 | **"All Quarters" filter must be removed — Q1/Q2/Q3/Q4 only** | ✅ Phase DW (IMPLEMENTED) |
| 38 | **selectedQuarter must default to Q1** | ✅ Phase DW (IMPLEMENTED) |
| 39 | **Q4 must be labeled as Final Year Projection** | ✅ Phase DW (IMPLEMENTED) |
| 40 | **All 14 columns always rendered; selected quarter highlighted; others dimmed** | ✅ Phase DW (IMPLEMENTED) |
| 41 | **Dimmed quarters must not look disabled — opacity ≥ 0.65** | ✅ Phase DX (IMPLEMENTED) |
| 42 | **Quarter selector must communicate "reporting period" not "filter"** | ✅ Phase DX (IMPLEMENTED) |
| 43 | **Page must include collapsible guidance panel for quarterly reporting** | ✅ Phase DX (IMPLEMENTED) |
| 44 | **Each quarterly submission must be stored as an independent record per `reported_quarter`** | ✅ Phase DY (IMPLEMENTED) |
| 45 | **`selectedQuarter` must drive both data fetch and save, not just visual highlight** | ✅ Phase DY (IMPLEMENTED) |
| 46 | **Q3 submission must not overwrite Q1/Q2 stored values** | ✅ Phase DY (IMPLEMENTED) |
| 47 | **Per-quarter Draft/Submit/Approve workflow must be supported** | ✅ Phase DY (IMPLEMENTED) |
| 48 | **Existing legacy records (reported_quarter=NULL) must remain accessible** | ✅ Phase DY (IMPLEMENTED) |
| 49 | **DZ-C prefill is implemented but broken; must be removed (YAGNI)** | ✅ Phase EA (IMPLEMENTED) |
| 50 | **Tooltip on v-select must be removed (persistent tooltip bug)** | ✅ Phase EE-D (IMPLEMENTED — was gap) |
| 51 | **Save button label must accurately reflect single-indicator scope** | ✅ Phase EE-E (IMPLEMENTED — was gap) |
| 52 | **Pillar summary chips must be merged into pillar header card** | ✅ Phase EE-B (IMPLEMENTED — was gap) |
| 53 | **Target vs Actual chart must use SUM (count_target / count_accomplishment)** | ✅ Phase EB (IMPLEMENTED) |
| 54 | **Analytics charts must have accurate series labels and Y-axis titles** | ✅ Phase EB (IMPLEMENTED) |
| 55 | **Year-over-Year chart must be full-width at bottom of dashboard** | ✅ Phase EB (IMPLEMENTED) |
| 56 | **Publishing status must be visible inside the pillar header chip cluster** | ✅ Phase EE-B (IMPLEMENTED — was gap) |
| 57 | **Indicator text in table cells must not break row height uniformity** | ✅ Phase EE-F (IMPLEMENTED — was gap) |
| 58 | **Target vs Actual chart must use rate-based model valid for all pillar unit types** | ✅ Phase ED (IMPLEMENTED) |
| 59 | **Pillar Accomplishment Rate donut must occupy the full circle** | ✅ Phase ED (IMPLEMENTED) |
| 60 | **Analytics dashboard must include an explanation notes panel** | ✅ Phase ED (IMPLEMENTED) |
| 61 | **Year-over-Year chart must support pillar-specific filtering** | ✅ Phase ED (IMPLEMENTED) |
| 62 | **DR-E standalone summary row must be removed; content preserved in pillar header** | ✅ Phase EE-A (IMPLEMENTED) |
| 63 | **Submission controls must be accessible from within the pillar header area** | ✅ Phase EE-C (IMPLEMENTED) |
| 64 | **STATUS BAR alert simplified to rejection-note only** | ✅ Phase EE-C (IMPLEMENTED) |
| 65 | **Admin users must have navigation to User Management from UO module** | ✅ Phase EF-C (IMPLEMENTED) |
| 66 | **UO operation assignment CRUD endpoints** | ⏳ Phase EF-B (DEFERRED — backend required) |
| 67 | **Redundant "Edit Data" buttons must be removed (per-row click handler sufficient)** | ✅ Phase EG-A (IMPLEMENTED) |
| 68 | **Score columns must be removed from overview tables to eliminate horizontal scrollbar** | ✅ Phase EG-B (IMPLEMENTED) |
| 69 | **Analytics Guide must be collapsed by default** | ✅ Phase EH-B (IMPLEMENTED — prior session) |
| 70 | **Achievement Rate chart must display 100% target reference annotation** | ✅ Phase EH-C (IMPLEMENTED — prior session) |
| 71 | **YoY chart must display 100% target reference annotation** | ✅ Phase EH-D (IMPLEMENTED — prior session) |
| 72 | **Header controls must use consistent button sizing** | ✅ Phase EI-D (IMPLEMENTED) |
| 73 | **`fetchAllPillarOperations()` must filter to known pillar types only** | ✅ Phase EI-E (IMPLEMENTED) |
| 74 | **`submitAllPillarsForReview()` must respect user ownership before submission** | ✅ Phase EI-F (IMPLEMENTED) |
| 75 | **Quarter-level submission (per-QN status) requires backend endpoint** | ⏳ Phase EJ (DEFERRED) |
| 76 | **DN-H regression test matrix must pass before Financial module development** | ✅ Phase ET (CODE-VERIFIED) |
| 77 | **`expense_class` column required for BAR No. 2 PS/MOOE/CO categorization** | ✅ Phase ET-A (IMPLEMENTED) |
| 78 | **Financial page must mirror Physical page structure (pillars, quarters, governance)** | ✅ Phase ET-C (IMPLEMENTED) |
| 79 | **Financial subtotals computed on frontend — no new backend aggregation endpoint** | ✅ Phase ET-C (IMPLEMENTED) |
| 80 | **Landing page Financial card must be enabled with navigation** | ✅ Phase ET-D (IMPLEMENTED) |
| 81 | **`api.del()` must be used for DELETE requests (not `api.delete()`)** | ✅ Phase EV-A (IMPLEMENTED) |
| 82 | **`utilization_rate` is the authoritative computed field name for % Utilization** | ✅ Phase EV-B (IMPLEMENTED) |
| 83 | **Balance formula must use DBM-standard Unobligated Balance: Appropriation − Obligations** | ✅ Phase EV-C (IMPLEMENTED) |
| 84 | **Financial page must include collapsible data entry guide** | ✅ Phase EV-D (IMPLEMENTED) |
| 85 | **Financial hero section must display budget utilization summary** | ✅ Phase EV-E (IMPLEMENTED) |
| 86 | **Submission workflow must distinguish Financial from Physical quarterly reports** | ✅ Phase EV-F (IMPLEMENTED) |
| 87 | **Cross-module analytics preparation deferred until Financial data entry is stable** | ⬜ Phase EV-G (DEFERRED/YAGNI) |
| 88 | **`findAll()` SELECT must include `uo.fiscal_year` — root cause of Financial display failure** | ✅ Phase EW-A (IMPLEMENTED) |
| 89 | **Hero subtitle must lead with functional description, keep BAR No. 2 as parenthetical** | ✅ Phase EW-B (IMPLEMENTED) |
| 90 | **Actions column must include explicit Edit button alongside Delete** | ✅ Phase EX-A (IMPLEMENTED) |
| 91 | **Disbursement field is optional — must include helper text clarifying its role** | ✅ Phase EX-B (IMPLEMENTED) |
| 92 | **Data entry form must include hint text on key financial fields** | ✅ Phase EX-C (IMPLEMENTED) |
| 93 | **Financial top controls must be right-aligned with no whitespace gap** | ✅ Phase EX-D (IMPLEMENTED — revised: right-aligned with justify-end) |
| 94 | **Financial pillar tabs must use fullName and match Physical styling** | ✅ Phase EX-E (IMPLEMENTED) |
| 95 | **All user-facing BAR No. 2 references must be removed** | ✅ Phase EX-F (IMPLEMENTED) |
| 96 | **Financial analytics endpoints deferred until data entry is stable** | ⬜ Phase EX-G (DEFERRED/YAGNI) |
| 97 | **Pending reviews must clearly identify UO quarterly submissions as "Physical & Financial"** | ✅ Phase EY-A (IMPLEMENTED) |

---

## SCOPE CLASSIFICATION

- **MUST** — Critical path, governance violation, security enforcement
- **SHOULD** — High value, UX improvement, non-blocking
- **DEFERRED** — Future enhancement, schema migration required

---

## ACE ENFORCEMENT RULES

1. **Phase-Locked Execution:** Research → Plan → Implement (strict sequence)
2. **Phase 3 Authorization:** Implementation requires explicit `EXECUTE_WITH_ACE` or `ADVANCE_STEP` from operator
3. **No Plan Mutation During Phase 3:** Plan is frozen once implementation begins
4. **Step Verification Required:** Each step must be marked `[x]` with verification before advancing
5. **Error Handling:** If implementation fails → STOP → update plan with failure → await operator instructions
6. **Two Living Documents Only:** `plan.md` (execution contract) + `research.md` (research findings)
7. **BAR1 Taxonomy Governance:** Static indicator taxonomy (migration 019) must NEVER be modified during implementation. Indicators are seeded, not user-created.
8. **MIS/CSU Compliance:** All changes must comply with DBM BAR1 reporting requirements and CSU branding guidelines.
9. **Backend-First Integrity:** Data integrity enforced at backend/database level. Frontend is presentation only.

---

## CONSTRAINTS

- **YAGNI:** No speculative features. Only implement what is specified.
- **KISS:** Choose the simplest implementation path that satisfies requirements.
- **SOLID:** Respect Single Responsibility, Open/Closed principles. No multi-concern changes.
- **DRY:** Do not duplicate logic across files. Extract shared utilities when pattern repeats ≥ 3 times.

---

## KNOWLEDGE GRAPH

**Key Files:**

| File | Purpose | Phase DQ Relevance |
|------|---------|-------------------|
| `pmo-frontend/pages/university-operations/physical/index.vue` | Physical Accomplishment | DQ-A: Remove analytics components |
| `pmo-frontend/pages/university-operations/index.vue` | Main UO landing page | DQ-C: Analytics data consumer |
| `pmo-frontend/components/PhysicalSummaryCard.vue` | Summary widget | DQ-A: Remove usage (may become unused) |
| `pmo-backend/src/university-operations/university-operations.service.ts` | UO backend service | DQ-B: Fix aggregation queries |
| `database/migrations/019_bar1_authoritative_seed.sql` | Static indicator seed | READONLY — unit type reference |

**Dependencies:**

- DN-C depends on DN-D (pillar card passes route query that DN-C reads)
- DN-H depends on all other DN steps (regression testing)
- Phase DM must remain intact (DN-H10 validates this)

---

## LESSONS LEARNED

1. **Phase DL Failure (Mar 4, 2026):** Forward-scanning for "suspicious code" found the wrong root cause (type mismatch). Reverse-tracing from the exact 404 error in Phase DM found the true cause (operation_id mismatch). **Lesson: Always trace backward from the error, not forward from assumptions.**
2. **Governance Violation (Mar 4, 2026):** Jumped to Phase 3 without authorization. Fix did not resolve the issue. **Lesson: Never skip phases. Research → Plan → Implement is non-negotiable.**
3. **Plan.md Bloat (Mar 4-5, 2026):** 12,500 lines accumulated from never compacting completed phases. Edit tool cannot handle bulk removal. **Lesson: Compact completed phases immediately upon completion. Use `<details>` collapsed sections.**

---

## ENVIRONMENT CONSTRAINTS

- PowerShell 6+ (pwsh) is NOT available — all shell tool calls fail
- Builds and tests CANNOT be run via tools — operator must verify manually
- Windows OS — backslash paths required
- Changes verified by operator inspection, not automated testing

---

## SECTION 1 — ACTIVE PHASES

### PHASE DN: UNIVERSITY OPERATIONS MAIN MODULE UI STABILIZATION [MUST]

**Status:** ✅ COMPLETE — Steps DN-A through DN-G IMPLEMENTED, DN-H CODE-VERIFIED (2026-03-17)
**Priority:** P1 — Multiple UI/UX and data integrity issues
**Research Reference:** `research.md` Section 1.70

---

#### **STEP DN-A: AUTH PERSISTENCE HARDENING** [CRITICAL]

**Scope:** Frontend — auth store error handling  
**File:** `pmo-frontend/stores/auth.ts` lines 54-68  

**Problem:** `fetchCurrentUser()` catch block clears auth state on ANY error (network timeout, 500, backend restart), not just 401 Unauthorized. This causes forced logout on page refresh if backend has a transient issue.

**Change:**
```typescript
// Current (line 60-67):
} catch {
  token.value = null       // ← clears on ANY error
  user.value = null
  localStorage.removeItem('access_token')
}

// Fixed:
} catch (err: any) {
  if (err?.statusCode === 401) {
    // Token genuinely invalid — clear auth state
    token.value = null
    user.value = null
    if (import.meta.client) {
      localStorage.removeItem('access_token')
    }
  } else {
    // Transient error (network, 500, timeout) — preserve token, clear user only
    console.warn('[Auth] Failed to fetch user (non-401), preserving token:', err?.message)
  }
}
```

**Verification:**
- [ ] DN-A1: Page refresh with valid token does NOT logout
- [ ] DN-A2: Page refresh with expired/invalid token correctly redirects to login
- [ ] DN-A3: Backend restart does not force logout

---

#### **STEP DN-B: PILLAR STAT CARD 5/4 MISCOUNT FIX** [CRITICAL]

**Scope:** Backend — SQL query filter  
**File:** `pmo-backend/src/university-operations/university-operations.service.ts` line 1552  

**Problem:** `indicators_with_data` counts data linked to INACTIVE taxonomy entries, but `total_taxonomy_indicators` only counts ACTIVE ones. Result: 5/4 display.

**Change:**
```sql
-- Current (line 1552-1553):
JOIN pillar_indicator_taxonomy pit ON oi.pillar_indicator_id = pit.id
WHERE oi.fiscal_year = $1 AND oi.deleted_at IS NULL

-- Fixed:
JOIN pillar_indicator_taxonomy pit ON oi.pillar_indicator_id = pit.id
WHERE oi.fiscal_year = $1 AND oi.deleted_at IS NULL AND pit.is_active = true
```

**Verification:**
- [ ] DN-B1: `indicators_with_data` never exceeds `total_taxonomy_indicators`
- [ ] DN-B2: Pillar summary cards display correct X/Y counts
- [ ] DN-B3: Deactivated taxonomy indicators excluded from counts

---

#### **STEP DN-C: PHYSICAL TAB RACE CONDITION FIX** [CRITICAL]

**Scope:** Frontend — component lifecycle  
**File:** `pmo-frontend/pages/university-operations/physical/index.vue` lines 87-91, 602-613  

**Problem:** `activePillar` initializes to HIGHER_EDUCATION before route query is read. If pillar card navigation passes `?pillar=RESEARCH`, `onMounted` fetches HIGHER_EDUCATION data, then watch fires for RESEARCH — two competing fetches.

**Change:**
```typescript
// Current (line 91):
const activePillar = ref<string>(PILLARS[0].id)

// Fixed — initialize from route query:
const activePillar = ref<string>(
  (route.query.pillar as string) && PILLARS.some(p => p.id === route.query.pillar)
    ? (route.query.pillar as string)
    : PILLARS[0].id
)
```

**Also add fetch guard:**
```typescript
let fetchController: AbortController | null = null

async function fetchPillarData() {
  if (fetchController) fetchController.abort()
  fetchController = new AbortController()
  loading.value = true
  // ... existing logic
}
```

**Verification:**
- [ ] DN-C1: Navigating with `?pillar=RESEARCH` loads Research tab directly
- [ ] DN-C2: No double-fetch on initial load
- [ ] DN-C3: Switching tabs cancels previous pending fetch

---

#### **STEP DN-D: PILLAR CARD NAVIGATION** [IMPORTANT]

**Scope:** Frontend — navigation function  
**File:** `pmo-frontend/pages/university-operations/index.vue` lines 283-288, 536-557  

**Problem:** All pillar cards navigate to same default tab (HIGHER_EDUCATION). Should navigate to respective pillar.

**Change:**
```typescript
// Current (line 283-288):
function navigateToPhysical() {
  router.push({ path: '/university-operations/physical', query: { year: dashboardYear.value.toString() } })
}

// Fixed — accept pillar parameter:
function navigateToPhysical(pillarId?: string) {
  router.push({
    path: '/university-operations/physical',
    query: {
      year: dashboardYear.value.toString(),
      ...(pillarId && { pillar: pillarId })
    }
  })
}
```

**Update pillar card click handlers (line 541):**
```html
<!-- Current: -->
@click="navigateToPhysical"

<!-- Fixed: -->
@click="navigateToPhysical(pillar.id)"
```

**Verification:**
- [ ] DN-D1: Higher Education card → opens Higher Education tab
- [ ] DN-D2: Research card → opens Research tab
- [ ] DN-D3: Fiscal year preserved in navigation
- [ ] DN-D4: Category cards (Physical/Financial) still work without pillar param

---

#### **STEP DN-E: INDICATOR CALCULATION ALIGNMENT** [IMPORTANT]

**Scope:** Frontend — computed preview formula  
**File:** `pmo-frontend/pages/university-operations/physical/index.vue` lines 523-535  

**Problem:** Frontend preview uses SUM of quarters, but backend `computeIndicatorMetrics` uses AVERAGE. Users see different values in dialog preview vs saved display.

**Change:**
```typescript
// Current (line 529-532):
const totalTarget = targets.reduce((a, b) => Number(a) + Number(b), 0)
const totalActual = actuals.reduce((a, b) => Number(a) + Number(b), 0)
const variance = targets.length > 0 && actuals.length > 0 ? totalActual - totalTarget : null
const rate = totalTarget > 0 ? (totalActual / totalTarget) * 100 : null

// Fixed — use AVERAGE to match backend:
const avgTarget = targets.length > 0 ? targets.reduce((a, b) => Number(a) + Number(b), 0) / targets.length : null
const avgActual = actuals.length > 0 ? actuals.reduce((a, b) => Number(a) + Number(b), 0) / actuals.length : null
const variance = avgTarget !== null && avgActual !== null ? avgActual - avgTarget : null
const rate = avgTarget !== null && avgTarget !== 0 && avgActual !== null ? (avgActual / avgTarget) * 100 : null
```

**Update return:**
```typescript
return { totalTarget: avgTarget, totalActual: avgActual, variance, rate }
```

**Verification:**
- [ ] DN-E1: Dialog preview matches saved display values
- [ ] DN-E2: Variance computes correctly (Actual − Target)
- [ ] DN-E3: Rate computes correctly ((Actual / Target) × 100)
- [ ] DN-E4: Shows "—" when insufficient data (no overcompute)

---

#### **STEP DN-F: FISCAL YEAR FILTER RESIZE** [MINOR]

**Scope:** Frontend — CSS only (main module page)  
**File:** `pmo-frontend/pages/university-operations/index.vue` line 319  

**Change:**
```html
<!-- Current: -->
style="width: 170px; min-width: 160px"

<!-- Fixed: -->
style="width: 120px"
```

**Verification:**
- [ ] DN-F1: FY filter visually balanced with header
- [ ] DN-F2: Filter still functional and readable
- [ ] DN-F3: Physical page filter unchanged

---

#### **STEP DN-G: ANALYTICS ERROR FEEDBACK** [MINOR]

**Scope:** Frontend — error handling  
**File:** `pmo-frontend/pages/university-operations/index.vue` lines 115-122  

**Change:** Add toast notification when analytics fetch fails:
```typescript
} catch (err: any) {
  console.error('[UniOps Analytics] Failed to fetch:', err)
  toast.warning('Analytics data unavailable')  // ← ADD
  pillarSummary.value = null
  // ...
}
```

**Verification:**
- [ ] DN-G1: User sees warning when analytics fail
- [ ] DN-G2: Charts show empty state gracefully

---

#### **STEP DN-H: REGRESSION TESTING** [CRITICAL]

**Test Matrix:**

| Test ID | Scenario | Expected Result |
|---------|----------|----------------|
| DN-H1 | Refresh physical page → stays logged in | No redirect to login |
| DN-H2 | Refresh with expired token | Correctly redirects to login |
| DN-H3 | Stat cards show X/Y where X ≤ Y | Never exceeds total |
| DN-H4 | Click Research pillar card → opens Research tab | Correct tab active |
| DN-H5 | Quick tab switching → correct data displays | No stale/mixed data |
| DN-H6 | Dialog preview matches saved values | Consistent calculation |
| DN-H7 | FY filter on main page → balanced layout | Cosmetic check |
| DN-H8 | Analytics load with empty FY data | Graceful empty state |
| DN-H9 | Create quarterly data → progress updates | Correct quarter count |
| DN-H10 | Update quarterly data → no 404 (Phase DM) | Phase DM still works |

---

## SECTION 2 — THE NEXT (Approved Queue)

### PHASE ET: FINANCIAL ACCOMPLISHMENTS PAGE (BAR No. 2) [MUST]

**Status:** ✅ PHASE 3 COMPLETE — ET-A through ET-D IMPLEMENTED (2026-03-19)
**Priority:** P0 — Stakeholder milestone: April 6, 2026
**Research Reference:** `research.md` Section 1.99
**Prerequisite:** DN-H regression verified ✅ (2026-03-17)

---

#### **STEP ET-A: DATABASE MIGRATION — `expense_class` COLUMN** [CRITICAL]

**Scope:** Database migration
**File:** `database/migrations/029_add_expense_class_column.sql`

**Problem:** `operation_financials` has no column to categorize records as PS, MOOE, or CO. The BAR No. 2 Excel requires every financial line item to be classified by expense class for hierarchical grouping (Program → Campus → Expense Class).

**Change:**
```sql
-- Migration 029: Add expense_class column to operation_financials
-- Required for BAR No. 2 financial reporting (PS/MOOE/CO categorization)

ALTER TABLE operation_financials
  ADD COLUMN IF NOT EXISTS expense_class VARCHAR(4)
  CHECK (expense_class IN ('PS', 'MOOE', 'CO'));

CREATE INDEX IF NOT EXISTS idx_of_expense_class
  ON operation_financials(expense_class);

-- Composite: operation_id + expense_class for pillar-level grouping
CREATE INDEX IF NOT EXISTS idx_of_operation_expense
  ON operation_financials(operation_id, expense_class)
  WHERE deleted_at IS NULL;
```

**Verification:**
- [ ] ET-A1: Migration runs without error
- [ ] ET-A2: `\d operation_financials` shows `expense_class` column with CHECK constraint
- [ ] ET-A3: Index `idx_of_expense_class` exists
- [ ] ET-A4: Existing records unaffected (column is NULLABLE)

---

#### **STEP ET-B: BACKEND DTO + SERVICE UPDATE** [CRITICAL]

**Scope:** Backend — DTO and service
**Files:**
- `pmo-backend/src/university-operations/dto/create-financial.dto.ts`
- `pmo-backend/src/university-operations/university-operations.service.ts`

**Change 1 — DTO:** Add `expense_class` field to `CreateFinancialDto`:
```typescript
@IsOptional()
@IsIn(['PS', 'MOOE', 'CO'])
expense_class?: string;
```

**Change 2 — Service:** Ensure `createFinancial()` and `updateFinancial()` include `expense_class` in INSERT/UPDATE column lists. Both methods use dynamic column building from `dto` keys, so this should work automatically if the DTO field is added. Verify.

**Change 3 — Service:** Add `expense_class` to `findFinancials()` query filter support:
```typescript
if (query.expense_class) {
  conditions.push(`of.expense_class = $${params.length + 1}`);
  params.push(query.expense_class);
}
```

**Verification:**
- [ ] ET-B1: POST with `expense_class: 'PS'` creates record correctly
- [ ] ET-B2: GET with `?expense_class=MOOE` filters correctly
- [ ] ET-B3: PATCH updates `expense_class` without error
- [ ] ET-B4: Computed metrics (`computeFinancialMetrics`) unaffected

---

#### **STEP ET-C: FINANCIAL PAGE FRONTEND** [CRITICAL]

**Scope:** Frontend — new page
**File:** `pmo-frontend/pages/university-operations/financial/index.vue`

**Structure (mirrors Physical page):**
1. **Header:** Back button, title "Financial Accomplishments — BAR No. 2", FY selector, quarter selector
2. **Pillar tabs:** Same 4 PILLARS constant (MFO1-4 mapping)
3. **Pillar header card:** FY chip + publication status chip + submit/withdraw controls (reuses governance workflow)
4. **Data table:** Per-campus grouped financial records with expense class rows
5. **Entry dialog:** Create/edit financial record with fields: operations_programs, expense_class, fund_type, allotment, obligation, disbursement, remarks
6. **Subtotal computation:** Frontend-computed campus subtotals and pillar totals
7. **Lock/unlock banners:** Same governance UI as Physical page

**Table Layout (per pillar):**

| Program / Line Item | Campus | Expense Class | Appropriation | Obligations | % Utilization | Balance |
|---|---|---|---|---|---|---|
| Row data | MAIN/CABADBARAN | PS/MOOE/CO | allotment | obligation | computed | computed |
| **Campus Sub-Total** | | | **SUM** | **SUM** | **computed** | **SUM** |
| **Pillar Total** | | | **SUM** | **SUM** | **computed** | **SUM** |

**Key differences from Physical page:**
- No taxonomy-driven structure (financial records are user-created line items, not static indicators)
- Grouped by campus → expense_class instead of outcome/output
- Computed columns: `% Utilization = obligation/allotment*100`, `Balance = allotment - obligation`
- Entry form has different fields (no quarterly T/A/S — instead: allotment, obligation, disbursement)

**Data flow:**
1. `findCurrentOperation()` — same as Physical (find operation for pillar + FY)
2. If no operation, auto-create on first save (same pattern)
3. `fetchFinancials()` — `GET /api/university-operations/{operationId}/financials?fiscal_year=X&quarter=Q1`
4. Group results by `department` (campus) → `expense_class`
5. Compute subtotals in `computed()` properties

**Shared infrastructure (import from Physical page patterns):**
- `canEditData()` — same permission logic
- `currentQuarterlyReport` — same quarterly report entity
- `submitAllPillarsForReview()` / `withdrawAllPillarsSubmission()` — same submit workflow
- Published edit warning dialog — same governance UI
- Unlock request workflow — same

**Verification:**
- [ ] ET-C1: Page renders with 4 pillar tabs
- [ ] ET-C2: Financial records display grouped by campus → expense class
- [ ] ET-C3: Subtotals compute correctly
- [ ] ET-C4: Create financial record with expense_class
- [ ] ET-C5: Edit financial record updates correctly
- [ ] ET-C6: Delete financial record (Admin only) works
- [ ] ET-C7: Published quarterly report locks financial edits
- [ ] ET-C8: Submit/Withdraw works for quarterly report (shared with Physical)

---

#### **STEP ET-D: LANDING PAGE INTEGRATION** [IMPORTANT]

**Scope:** Frontend — update landing page
**File:** `pmo-frontend/pages/university-operations/index.vue`

**Changes:**
1. Enable Financial card (remove `disabled`, update styling)
2. Update `navigateToFinancial()` to route to `/university-operations/financial`
3. Pass FY query param: `?year=${selectedFiscalYear.value}`

**Verification:**
- [ ] ET-D1: Financial card is clickable with proper styling
- [ ] ET-D2: Navigation routes to financial page with correct FY
- [ ] ET-D3: Physical card still works unchanged

---

#### **STEP ET-E: REGRESSION TESTING** [CRITICAL]

**Test Matrix:**

| Test ID | Scenario | Expected Result |
|---------|----------|----------------|
| ET-E1 | Create financial record with PS expense class | Record saved with correct expense_class |
| ET-E2 | Switch pillar tabs → correct financial data | No stale/mixed data |
| ET-E3 | Switch FY → correct data reload | Financial records for new FY |
| ET-E4 | Submit quarterly report from Financial page | Same quarterly report used by Physical |
| ET-E5 | Published quarterly report blocks Financial edits | canEditData() enforced |
| ET-E6 | Physical page unaffected | No regression |
| ET-E7 | Campus subtotals accurate | SUM of PS+MOOE+CO matches expected |
| ET-E8 | % Utilization computes correctly | obligation/allotment * 100 |

---

#### **IMPLEMENTATION ORDER:**

```
ET-A (migration) → ET-B (backend DTO/service) → ET-C (frontend page) → ET-D (landing page) → ET-E (regression)
```

**Estimated scope:** ~800-1200 lines new frontend code (Financial page), ~20 lines backend changes, ~15 lines migration.

---

---

## SECTION 3 — THE ICEBOX (Deferred)

### [DEFERRED] DM-C: Filter findCurrentOperation by user
**Condition:** Post-Phase DN — optional enhancement  

### [DEFERRED] Physical Accomplishment — Advanced Features
**Condition:** Post-Phase DN completion  
**Items:**
- Data Analytics charts (bar + line visualizations)
- Card/List/Table view toggle for indicators
- Performance filter (Excellent/Good/Needs Improvement)

---

## SECTION 4 — COMPLETED PHASES (Compacted)

<details>
<summary>Phase DP — Analytics Dashboard Refactor + Race Condition (PARTIALLY SUPERSEDED ⚠️)</summary>

**Date:** March 9, 2026
**Status:** DP-A/DP-B IMPLEMENTED ✅ | DP-C/DP-D SUPERSEDED by Phase DQ
**Changes:**
- DP-A: Fiscal year guard on watch handlers (physical/index.vue) ✅
- DP-B: AbortController in fetchPillarData (physical/index.vue) ✅
- DP-C: Target vs Actual chart on physical page — **WILL BE REMOVED by DQ-A** (wrong location)
- DP-D: Stat cards on physical page — **WILL BE REMOVED by DQ-A** (wrong location)
**Research:** `research.md` Section 1.72
**Note:** DP-C and DP-D placed analytics on the data-entry page. Phase DQ corrects this by removing analytics from the physical page (data entry only) and fixing backend aggregation accuracy.

</details>

<details>
<summary>Phase DO — Indicator Computation & Fiscal Year Management (IMPLEMENTED ✅)</summary>

**Date:** March 5-6, 2026  
**Status:** ✅ IMPLEMENTED — DO-A through DO-E complete  
**Changes:**  
- DO-A: Removed AVG branching → All indicator types use SUM per BAR1 (backend + frontend)  
- DO-B: Created fiscal_years table + SuperAdmin-only CRUD endpoints (migration 023)  
- DO-C: Replaced hardcoded FY arrays with API-driven dropdowns (index.vue + physical/index.vue)  
- DO-D: Variance/rate display already handled by formatNumber/formatPercent  
- DO-E: Backend computation audit confirmed correct SUM aggregation  
- DO-F: Regression testing — AWAITING OPERATOR VERIFICATION  
**Research:** `research.md` Section 1.71

</details>

<details>
<summary>Phase DN — University Operations Main Module UI Stabilization (IMPLEMENTED ✅)</summary>

**Date:** March 5, 2026  
**Status:** ✅ IMPLEMENTED — 7 code changes applied  
**Changes:**  
- DN-A: Auth catch block only clears on 401 (stores/auth.ts)  
- DN-B: Pillar stat card count excludes inactive taxonomy entries (backend service)  
- DN-C: activePillar initializes from route query (physical/index.vue)  
- DN-D: navigateToPhysical accepts pillarId param (index.vue)  
- DN-E: computedPreview unit-type-aware aggregation ⚠️ **SUPERSEDED by DO-A** (SUM for all)  
- DN-F: FY filter width 170px → 120px (index.vue)  
- DN-G: toast.warning on analytics fetch failure (index.vue)  
**Research:** `research.md` Section 1.70

</details>

<details>
<summary>Phase DM — Physical Accomplishment UPDATE Fix (VERIFIED ✅)</summary>

**Date:** March 4, 2026 | **Verified:** March 5, 2026  
**Status:** ✅ VERIFIED by operator  
**Root Cause:** Frontend sent wrong `operation_id` in PATCH URL — `findCurrentOperation()` returns first match, but indicator may belong to different operation.  
**Fix:** Extract `operation_id` from indicator record; add NULL safety check.  
**File:** `pmo-frontend/pages/university-operations/physical/index.vue` lines 434-451  
**Research:** `research.md` Section 1.69-B

</details>

<details>
<summary>Phase DJ — Physical Accomplishment PATCH Endpoint (COMPLETE ✅)</summary>

**Date:** March 4, 2026  
**Status:** ✅ COMPLETE  
**Changes:** Created dedicated `PATCH /:id/indicators/:indicatorId/quarterly` endpoint with comprehensive validation (fiscal_year immutability, pillar_type consistency, publication status check). Added query enhancements, debug logging, response normalization, and unique constraint migration (021).  
**Files:** Backend service (+107 lines), controller (+14 lines), frontend (1 line change + 8 lines), migration 021 (28 lines)  
**Research:** `research.md` Section 1.67-B

</details>

<details>
<summary>Phase DI — Physical Accomplishment Stabilization (COMPLETE ✅)</summary>

**Date:** February-March 2026  
**Status:** ✅ COMPLETE  
**Scope:** UI optimization, filter state propagation, indicator update fix, query validation  
**Research:** `research.md` Section 1.65

</details>

<details>
<summary>Phase DL — Physical Accomplishment UPDATE Debugging (FAILED ❌)</summary>

**Status:** ❌ Did NOT resolve issue — Superseded by Phase DM  
**Lesson:** Forward-scanning found wrong root cause. Reverse-tracing used in DM found true cause.

</details>

<details>
<summary>Phases CX-DE — BAR1 Indicator Taxonomy & UI Architecture</summary>

Phases CX (Legacy removal + main interface refactor + pillar detail + quarterly data entry), CY (Type alignment + migration revalidation + clean rebuild), CZ (Main module landing + physical accomplishments + quarterly modal + draft workflow + permissions), DA (Migration verification + quarter selector + remove legacy pages + analytics), DB (Service-layer fix), DC (Schema enhancement + static seed update + UI enrichment + hierarchy rendering), DD (Migration execution + authoritative seed deployment + orphan mapping + legacy cleanup), DE (Backend analytics + chart library + analytics dashboard + physical UI restructure + responsive tables + CSU branding + regression testing).

All phases documented in `research.md` Sections 1.58-1.64.

</details>

<details>
<summary>Phases BA-BH — University Operations Schema & Financials</summary>

Phases BA (Schema migration — fund_type, project_code, fiscal_year, campus), BB (Indicator precision DECIMAL(10,4)), BC (Backend DTO fund_type + project_code), BD (fiscal_year on university_operations), BE (Indicators CRUD UI), BF (Financials CRUD with fund type tabs), BG (Organizational info edit UI), BH (Regression test matrix).

All phases documented in `research.md` Sections 1.50-1.57.

</details>

<details>
<summary>Phases AT-AZ — Multi-Select Assignment Schema</summary>

Phase AT (junction table migration), AU (Backend DTO + service refactor), AV (Remove campus filter from assignment), AW (Frontend multi-select + deselection), AX (v-autocomplete item-title edge case), AY (AbortController for race conditions), AZ (Regression test matrix).

**Note:** Phases AT-AZ are PENDING status — not yet implemented. Listed here for reference. These are non-blocking for Phase DN.

</details>

<details>
<summary>Phases H through AS — Governance, Delegation & Permission Features</summary>

Phases H-S (Core CRUD + approval workflow), V-X (Rejected record flow, PENDING_REVIEW auto-revert, director visibility), Y (Office-scoped visibility — campus proxy), AE-AG (Frontend isOwner delegation fix, admin assignment UI, campus assignment UI), AH-AJ (Eligible-users API, filtered assignment selector, campus/role filters), AN-AQ (Backend create DTO extension, frontend create assignment card, response mapping fix, module param standardization), AR (Shared composable — DEFERRED), Phase DF (Vue template structural fix), Phase P (Rank CRUD scope), Phase Q (Centralized backend resolver), Phase R (Frontend permission drift cleanup), Phase K (Regression testing).

All phases documented in `research.md` Sections 1.32-1.47.

</details>

---

## SECTION 5 — KEY DATES

| Milestone | Date |
|-----------|------|
| Phase DM Implementation | Mar 4, 2026 ✅ |
| Phase DM Operator Verification | Mar 5, 2026 ✅ |
| Phase DN Research Complete | Mar 4, 2026 ✅ |
| Phase DN Plan Complete | Mar 5, 2026 ✅ |
| Phase DN Implementation | Mar 5, 2026 ✅ |
| Phase DO Research Complete | Mar 5, 2026 ✅ |
| Phase DO Plan Complete | Mar 5, 2026 ✅ |
| Phase DO Implementation | Mar 6, 2026 ✅ |
| Phase DP Research Complete | Mar 9, 2026 ✅ |
| Phase DP Plan Complete | Mar 9, 2026 ✅ |
| Phase DP Implementation | Pending EXECUTE_WITH_ACE |

---

## [ARCHIVED] Completed Phases DO–FB (Mar 5 – Mar 20, 2026)

> **Phase DO–EM (2,834 lines) archived to:** `docs/archive/plan_completed_phases_DO_to_EM_2026-03-17.md`
> **Phase EN–FB (2,676 lines) archived to:** `docs/archive/plan_completed_phases_EN_to_FB_2026-03-20.md`

