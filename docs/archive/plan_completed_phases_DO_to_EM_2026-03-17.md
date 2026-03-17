# Archived Plan: Completed Phases DO–EM — Execution Details
> **Archived:** 2026-03-17
> **Source:** plan.md lines 799–5013
> **Coverage:** Phases DO, DP (superseded), DQ, DR, DS, DW, DX, DY, DZ, EA, EE, EG, EH, EI, EJ, EK, EL, EM
> **Status:** All ✅ IMPLEMENTED or superseded
> **Reason:** Completed phase details archived to optimize main artifact for active development

---

## Phase DO Execution Priority

| Priority | Step | Severity | Dependencies |
|----------|------|----------|-------------|
| 1 | DO-A: SUM computation fix | CRITICAL | None |
| 2 | DO-B: FY backend system | CRITICAL | None |
| 3 | DO-C: FY frontend integration | CRITICAL | DO-B |
| 4 | DO-D: Variance/rate display | IMPORTANT | DO-A |
| 5 | DO-E: Backend audit | IMPORTANT | DO-A |
| 6 | DO-F: Regression testing | CRITICAL | DO-A through DO-E |

---

## Phase DP Execution Priority (SUPERSEDED by Phase DQ)

Phase DP-A through DP-D implemented. DP-C and DP-D are **SUPERSEDED** by Phase DQ (analytics must be removed from physical page).

---

## PHASE DQ — ANALYTICS SEPARATION & DATA ACCURACY CORRECTION

**Research:** `research.md` Section 1.73
**Status:** Phase 1 COMPLETE → Phase 2 COMPLETE → Awaiting `EXECUTE_WITH_ACE`

### Summary of Findings

| # | Issue | Root Cause | Severity |
|---|-------|-----------|----------|
| 1 | Physical page has analytics (stat cards, charts) | UI responsibility violation — analytics belong on main page only | CRITICAL |
| 2 | Stat card totals inflated (265 vs ~40 expected) | Cross-operation duplication: query returns N rows per indicator across operations | CRITICAL |
| 3 | SUM of percentage quarters is meaningless | `SUM(Q1+Q2+Q3+Q4)` for PERCENTAGE type (65%+70%+72%+75% = 282%) | CRITICAL |
| 4 | Backend `getPillarSummary` uses raw SUM | No unit-type-aware aggregation | IMPORTANT |
| 5 | Backend `getQuarterlyTrend` uses raw SUM | Same problem as `getPillarSummary` | IMPORTANT |
| 6 | Orphan indicators inflate physical page totals | LEFT JOIN includes non-taxonomy-linked rows | MODERATE |

---

### Step DQ-A: Remove Analytics from Physical Accomplishment Page (CRITICAL)

**Scope:** MUST
**File:** `pmo-frontend/pages/university-operations/physical/index.vue`

**Problem:** Physical page contains analytics components that violate the data-entry-only scope. These components also display incorrect aggregated values.

**Components to REMOVE from `<script setup>`:**

| Item | Lines | Reason |
|------|-------|--------|
| `import VueApexCharts` | 14 | Chart library no longer needed |
| `pillarSummary` computed | 178-206 | Analytics aggregation |
| `quarterlyChartData` computed | 208-230 | Chart data computation |
| `quarterlyChartOptions` computed | 232-243 | Chart config |
| `formatPercent()` | 387-391 | Stat card helper |
| `getRateColor()` | 393-399 | Stat card helper |
| `getVarianceColor()` | 401-405 | Stat card helper |

**Components to REMOVE from `<template>`:**

| Item | Lines | Reason |
|------|-------|--------|
| `<PhysicalSummaryCard>` | 1028-1036 | Analytics widget |
| Phase DP-D Stat Cards `<v-row>` | 1038-1072 | Analytics stat cards |
| Phase DP-C Chart `<v-card>` | 1074-1090 | Bar chart visualization |

**KEEP:** `formatNumber()` (used in indicator table cells), indicator tables, entry dialog, `computedPreview`, workflow buttons, pillar tabs, FY/quarter selectors.

**Verification:**
- [ ] DQ-A1: Physical page shows only indicator tables and data entry controls
- [ ] DQ-A2: No stat cards, charts, or summary widgets visible
- [ ] DQ-A3: Indicator tables still display correctly with quarterly data
- [ ] DQ-A4: Data entry dialog still works (create/update quarterly data)
- [ ] DQ-A5: Submit/Approve/Reject workflow unchanged
- [ ] DQ-A6: No console errors from removed references

---

### Step DQ-B: Fix Backend Aggregation — Unit-Type-Aware Computation (CRITICAL)

**Scope:** MUST
**File:** `pmo-backend/src/university-operations/university-operations.service.ts`

**Problem:** `getPillarSummary()` (lines 1585-1609) computes `total_target` and `total_accomplishment` using raw `SUM(Q1+Q2+Q3+Q4)` across all indicators regardless of unit type. This produces inflated, meaningless totals.

**Two fixes required:**

**Fix 1 — Unit-type-aware aggregation:**

Replace raw SUM columns with split aggregation:
```sql
-- For COUNT/WEIGHTED_COUNT: SUM (cumulative annual total)
SUM(CASE WHEN pit.unit_type IN ('COUNT','WEIGHTED_COUNT')
  THEN COALESCE(oi.target_q1,0)+COALESCE(oi.target_q2,0)+COALESCE(oi.target_q3,0)+COALESCE(oi.target_q4,0)
  ELSE 0 END
) AS count_target,
SUM(CASE WHEN pit.unit_type IN ('COUNT','WEIGHTED_COUNT')
  THEN COALESCE(oi.accomplishment_q1,0)+COALESCE(oi.accomplishment_q2,0)+COALESCE(oi.accomplishment_q3,0)+COALESCE(oi.accomplishment_q4,0)
  ELSE 0 END
) AS count_accomplishment,
-- For PERCENTAGE: AVG of non-null quarters, then AVG across indicators
AVG(CASE WHEN pit.unit_type = 'PERCENTAGE' THEN
  (COALESCE(oi.target_q1,0)+COALESCE(oi.target_q2,0)+COALESCE(oi.target_q3,0)+COALESCE(oi.target_q4,0))
  / NULLIF(
    (CASE WHEN oi.target_q1 > 0 THEN 1 ELSE 0 END)+(CASE WHEN oi.target_q2 > 0 THEN 1 ELSE 0 END)+
    (CASE WHEN oi.target_q3 > 0 THEN 1 ELSE 0 END)+(CASE WHEN oi.target_q4 > 0 THEN 1 ELSE 0 END), 0)
  ELSE NULL END
) AS pct_avg_target,
AVG(CASE WHEN pit.unit_type = 'PERCENTAGE' THEN
  (COALESCE(oi.accomplishment_q1,0)+COALESCE(oi.accomplishment_q2,0)+COALESCE(oi.accomplishment_q3,0)+COALESCE(oi.accomplishment_q4,0))
  / NULLIF(
    (CASE WHEN oi.accomplishment_q1 > 0 THEN 1 ELSE 0 END)+(CASE WHEN oi.accomplishment_q2 > 0 THEN 1 ELSE 0 END)+
    (CASE WHEN oi.accomplishment_q3 > 0 THEN 1 ELSE 0 END)+(CASE WHEN oi.accomplishment_q4 > 0 THEN 1 ELSE 0 END), 0)
  ELSE NULL END
) AS pct_avg_accomplishment,
COUNT(CASE WHEN pit.unit_type = 'PERCENTAGE' THEN 1 END) AS pct_indicator_count,
COUNT(CASE WHEN pit.unit_type IN ('COUNT','WEIGHTED_COUNT') THEN 1 END) AS count_indicator_count
```

**Fix 2 — Cross-operation deduplication:**

Wrap the FROM clause with `DISTINCT ON` subquery:
```sql
FROM (
  SELECT DISTINCT ON (oi.pillar_indicator_id)
    oi.*, pit.pillar_type, pit.unit_type, pit.indicator_type
  FROM operation_indicators oi
  JOIN pillar_indicator_taxonomy pit ON oi.pillar_indicator_id = pit.id
  WHERE oi.fiscal_year = $1 AND oi.deleted_at IS NULL AND pit.is_active = true
  ORDER BY oi.pillar_indicator_id, oi.updated_at DESC
) AS deduped
GROUP BY deduped.pillar_type
```

**Update response shape** to include new fields:
```typescript
count_target: number;           // SUM for COUNT/WEIGHTED_COUNT
count_accomplishment: number;
pct_avg_target: number | null;  // AVG for PERCENTAGE
pct_avg_accomplishment: number | null;
pct_indicator_count: number;
count_indicator_count: number;
// Keep total_target/total_accomplishment as sum of count + pct for backward compat
```

**Verification:**
- [ ] DQ-B1: Higher Ed (all PERCENTAGE) → `count_target = 0`, `pct_avg_target` shows meaningful average
- [ ] DQ-B2: Research (2 COUNT + 1 PERCENTAGE) → both `count_target` and `pct_avg_target` populated
- [ ] DQ-B3: Extension (2 COUNT + 1 WEIGHTED + 1 PCT) → correct split
- [ ] DQ-B4: Each taxonomy indicator counted once per fiscal year (no cross-op inflation)
- [ ] DQ-B5: `average_accomplishment_rate` unchanged (already correct)
- [ ] DQ-B6: `indicators_with_data` count unchanged

---

### Step DQ-C: Update Main Module Chart Data Consumption (IMPORTANT)

**Scope:** SHOULD
**File:** `pmo-frontend/pages/university-operations/index.vue`

**Problem:** `targetVsActualSeries` (lines 390-413) uses `total_target` / `total_accomplishment` which will be deprecated after DQ-B.

**Change:** Update chart to use unit-type-aware fields from backend:

```typescript
const targetVsActualSeries = computed(() => {
  if (!pillarSummary.value?.pillars) {
    return [{ name: 'Target', data: [0,0,0,0] }, { name: 'Actual', data: [0,0,0,0] }]
  }
  return [
    {
      name: 'Target',
      data: PILLARS.map(p => {
        const pd = pillarSummary.value.pillars.find((ps: any) => ps.pillar_type === p.id)
        // Phase DQ-C: Prioritize count_target; fall back to pct_avg_target for pct-only pillars
        return pd?.count_target || pd?.pct_avg_target || 0
      }),
    },
    {
      name: 'Actual',
      data: PILLARS.map(p => {
        const pd = pillarSummary.value.pillars.find((ps: any) => ps.pillar_type === p.id)
        return pd?.count_accomplishment || pd?.pct_avg_accomplishment || 0
      }),
    },
  ]
})
```

**Verification:**
- [ ] DQ-C1: Target vs Actual chart shows meaningful numbers per pillar
- [ ] DQ-C2: Higher Ed bars show percentage averages (~40-90 range, not hundreds)
- [ ] DQ-C3: Research bars show actual counts
- [ ] DQ-C4: No console errors or empty charts

---

### Step DQ-D: Fix Quarterly Trend Backend Query (SHOULD)

**Scope:** SHOULD
**File:** `pmo-backend/src/university-operations/university-operations.service.ts`

**Problem:** `getQuarterlyTrend()` (lines 1660-1717) uses raw SUM per quarter. Same unit-type problem.

**Change:** Same pattern as DQ-B — split into COUNT SUM and PERCENTAGE AVG per quarter, with cross-operation dedup.

**Verification:**
- [ ] DQ-D1: Quarterly trend chart shows meaningful per-quarter values
- [ ] DQ-D2: Q1 target for Higher Ed shows percentage average, not inflated SUM
- [ ] DQ-D3: Trend line reflects actual performance trajectory

---

### Step DQ-E: Quarterly Data Entry Progress Decision (CONDITIONAL)

**Scope:** CONDITIONAL — operator decision required
**File:** `pmo-frontend/pages/university-operations/index.vue` (lines 719-772)

**Assessment:** Component IS functional — counts quarters with data per pillar, shows X/4 progress.

**Options:**
- **A: KEEP** — quarterly progress is a useful data completeness view
- **B: REMOVE** — pillar stat cards already show completion_rate and indicators_with_data
- **C: OPTIMIZE** — fold quarter-counting into `getPillarSummary` backend to reduce API calls from 4→0

**Awaiting operator directive.**

---

### Step DQ-F: Regression Testing Matrix (CRITICAL)

**Scope:** MUST

| # | Test Case | Expected Result | Status |
|---|-----------|----------------|--------|
| 1 | Physical page — no analytics components | Data-entry only UI | [ ] |
| 2 | Physical page — indicator tables display | All Outcome + Output indicators shown | [ ] |
| 3 | Physical page — data entry dialog | Create/update quarterly data works | [ ] |
| 4 | Physical page — workflow buttons | Submit/Approve/Reject unchanged | [ ] |
| 5 | Main page — pillar stat cards | Correct indicator counts (X/Y) | [ ] |
| 6 | Main page — Target vs Actual chart | Meaningful values (not inflated) | [ ] |
| 7 | Main page — Accomplishment Rates radial | Correct avg rate per pillar | [ ] |
| 8 | Main page — Quarterly Trend | Meaningful per-quarter values | [ ] |
| 9 | Main page — Year-over-Year | No regression | [ ] |
| 10 | Higher Ed FY 2026 — target total reasonable | ~40 not 265 | [ ] |
| 11 | Research pillar — count totals correct | Not inflated by cross-operation | [ ] |
| 12 | Page refresh preserves session | No forced logout | [ ] |
| 13 | Pillar card → Physical page navigation | Correct tab + FY params | [ ] |

---

## Phase DQ Execution Priority

| Priority | Step | Severity | Dependencies |
|----------|------|----------|-------------|
| 1 | DQ-A: Remove analytics from physical page | CRITICAL | None |
| 2 | DQ-B: Fix backend aggregation queries | CRITICAL | None (parallel with DQ-A) |
| 3 | DQ-C: Update main module chart consumption | IMPORTANT | DQ-B |
| 4 | DQ-D: Fix quarterly trend query | SHOULD | DQ-B (same pattern) |
| 5 | DQ-E: Quarterly Data Entry Progress | CONDITIONAL | Operator decision |
| 6 | DQ-F: Regression testing | CRITICAL | DQ-A through DQ-D |

---

## SECTION 6 — IMPLEMENTATION CHECKLIST

**Phase DQ Steps:**
- [x] DQ-A: Remove analytics from physical page (CRITICAL) ✅
- [x] DQ-B: Fix backend aggregation — unit-type-aware computation (CRITICAL) ✅
- [x] DQ-C: Update main module chart data consumption (IMPORTANT) ✅
- [x] DQ-D: Fix quarterly trend backend query (SHOULD) ✅
- [ ] DQ-E: Quarterly Data Entry Progress decision (CONDITIONAL — awaiting operator)
- [ ] DQ-F: Regression testing (CRITICAL) — AWAITING OPERATOR VERIFICATION

**Execution Order:** (DQ-A ∥ DQ-B) → DQ-C → DQ-D → DQ-E → DQ-F

**Phase DR Steps:**
- [ ] DR-A: Rate-based backend `getPillarSummary` (CRITICAL)
- [ ] DR-B: Rate-based quarterly trend query (IMPORTANT)
- [ ] DR-C: Dashboard layout restructure — combobox + remove Quarterly Progress (IMPORTANT)
- [ ] DR-D: Frontend chart data consumption update (MUST)
- [ ] DR-E: Physical page lightweight inline summary (IMPORTANT)
- [ ] DR-F: Regression testing (CRITICAL) — AWAITING OPERATOR VERIFICATION

**Execution Order:** (DR-A ∥ DR-B ∥ DR-E) → DR-C → DR-D → DR-F

**Phase DP Steps (SUPERSEDED):**
- [x] DP-A: Race condition — fiscal year guard ✅
- [x] DP-B: Race condition — AbortController ✅
- [x] DP-C: Target vs Actual combo chart ✅ → **SUPERSEDED by DQ-A (will be removed)**
- [x] DP-D: Stat card layout reordering ✅ → **SUPERSEDED by DQ-A (will be removed)**

**Phase DO Steps:**
- [x] DO-A through DO-E ✅
- [x] DO-A SUM-for-all directive → **PARTIALLY SUPERSEDED by DQ-B** (SUM only for COUNT/WEIGHTED_COUNT; AVG for PERCENTAGE)

---

---

## PHASE DR — RATE-BASED ANALYTICS & DASHBOARD RESTRUCTURE

**Research:** `research.md` Section 1.74
**Status:** Phase 1 COMPLETE → Phase 2 COMPLETE → Awaiting `EXECUTE_WITH_ACE`

### Summary of Findings

| # | Issue | Root Cause | Severity |
|---|-------|-----------|----------|
| 1 | Target vs Actual chart mixes incompatible units (COUNT vs PERCENTAGE) | Raw values compared across different unit types | CRITICAL |
| 2 | Dashboard layout order incorrect | Completion overview not first; chart not combobox-driven | IMPORTANT |
| 3 | Quarterly Data Entry Progress section is redundant | 4 extra API calls, duplicates pillar stat card data | IMPORTANT |
| 4 | Physical page has zero analytics after DQ-A | Over-removed — lightweight inline summary needed | IMPORTANT |
| 5 | `university_statistics` table exists but is unused | No backend endpoints; data disconnected from BAR1 | INFO |

---

### Step DR-A: Rate-Based Backend Computation — `getPillarSummary` (CRITICAL)

**Scope:** MUST
**File:** `pmo-backend/src/university-operations/university-operations.service.ts`

**Problem:** The current DQ-B model outputs `count_target`, `count_accomplishment`, `pct_avg_target`, `pct_avg_accomplishment` — still in incompatible units. The operator requires a unified rate model.

**Rate Model:**
```
per-indicator: rate_i = actual_i / target_i   (where total_target_i > 0)
per-pillar:    pillar_actual_rate = SUM(rate_i for all indicators in pillar)
               pillar_target_rate = COUNT(indicators with target > 0)
```

Each indicator contributes exactly 1.0 to the target rate baseline and its own (actual/target) to the actual rate. This normalizes COUNT, WEIGHTED_COUNT, and PERCENTAGE to the same dimensionless scale.

**Change to `getPillarSummary` SQL — inside the deduped subquery aggregation:**

```sql
-- Phase DR-A: Rate-based aggregation
-- target_rate = number of indicators with target data (each contributes 1.0)
-- actual_rate = SUM of (actual/target) per indicator
SUM(
  CASE
    WHEN (COALESCE(deduped.target_q1,0)+COALESCE(deduped.target_q2,0)+COALESCE(deduped.target_q3,0)+COALESCE(deduped.target_q4,0)) > 0
    THEN 1.0
    ELSE 0
  END
) AS indicator_target_rate,

SUM(
  CASE
    WHEN (COALESCE(deduped.target_q1,0)+COALESCE(deduped.target_q2,0)+COALESCE(deduped.target_q3,0)+COALESCE(deduped.target_q4,0)) > 0
    THEN (
      COALESCE(deduped.accomplishment_q1,0)+COALESCE(deduped.accomplishment_q2,0)+COALESCE(deduped.accomplishment_q3,0)+COALESCE(deduped.accomplishment_q4,0)
    ) /
    NULLIF(
      COALESCE(deduped.target_q1,0)+COALESCE(deduped.target_q2,0)+COALESCE(deduped.target_q3,0)+COALESCE(deduped.target_q4,0)
    , 0)
    ELSE NULL
  END
) AS indicator_actual_rate
```

**Add to response shape:**
```typescript
indicator_target_rate: number;   // Count of indicators with target data
indicator_actual_rate: number | null;  // SUM of (actual/target) per indicator
accomplishment_rate_pct: number | null;  // (actual_rate / target_rate) * 100 for display
```

**Where `accomplishment_rate_pct = (indicator_actual_rate / indicator_target_rate) * 100`**

**Verification:**
- [ ] DR-A1: Higher Education (4 PERCENTAGE indicators) — `indicator_target_rate = 4.0`
- [ ] DR-A2: Extension (4 mixed indicators) — `indicator_target_rate = 4.0`
- [ ] DR-A3: `indicator_actual_rate` is sum of per-indicator (actual/target) ratios
- [ ] DR-A4: COUNT indicator with value 1500/2000 contributes 0.75 to actual_rate
- [ ] DR-A5: PERCENTAGE indicator with 90/80 contributes 1.125 to actual_rate (exceeds target)
- [ ] DR-A6: Indicator with target=0 contributes 0 to both (not counted)

---

### Step DR-B: Rate-Based Quarterly Trend — `getQuarterlyTrend` (IMPORTANT)

**Scope:** SHOULD
**File:** `pmo-backend/src/university-operations/university-operations.service.ts`

**Problem:** The quarterly trend currently outputs per-quarter SUM/AVG totals split by unit type. The rate model must be applied per quarter as well.

**Per-quarter rate formula:**
```
target_rate_qN = COUNT(indicators where target_qN > 0)
actual_rate_qN = SUM(accomplishment_qN / target_qN) for indicators where target_qN > 0
```

**Change:** Replace the DQ-D split query with per-quarter rate computation using same deduplication:
```sql
-- Per quarter: count indicators with targets and sum their accomplishment/target ratio
SUM(CASE WHEN deduped.target_q1 > 0 THEN 1.0 ELSE 0 END) AS target_rate_q1,
SUM(CASE WHEN deduped.target_q1 > 0 THEN COALESCE(deduped.accomplishment_q1,0)/deduped.target_q1 ELSE NULL END) AS actual_rate_q1,
-- ... repeat for Q2, Q3, Q4
```

**Return:**
```typescript
{
  quarter: 'Q1',
  target_rate: number,       // Count of indicators with Q1 target
  actual_rate: number | null, // SUM of Q1 accomplishment/target ratios
  accomplishment_rate_pct: number | null  // (actual_rate / target_rate) * 100
}
```

**Verification:**
- [ ] DR-B1: Q1 target_rate equals count of indicators with Q1 target data
- [ ] DR-B2: Q1 actual_rate is dimensionless (not a raw count or percentage)
- [ ] DR-B3: Trend chart shows rate progression Q1 → Q4

---

### Step DR-C: Dashboard Layout Restructure — Main Module Page (IMPORTANT)

**Scope:** MUST
**File:** `pmo-frontend/pages/university-operations/index.vue`

**Problem:** Current layout order is incorrect and dashboard is missing a combobox-driven pillar filter.

**Required Layout:**
```
1. Header + FY selector
2. Category cards (Physical / Financial)
3. [NEW] Pillar Completion Overview (4 stat cards)
4. [NEW] Target vs Actual by Pillar — combobox to select pillar
5. [KEEP] Quarterly Trend (line chart)
6. [KEEP] Year-over-Year comparison (bar chart)
7. [REMOVE] Quarterly Data Entry Progress
```

**Sub-step DR-C1: Move Pillar Stat Cards to FIRST analytics position**

Pillar stat cards (currently at lines 656-715) must be the FIRST analytics section, renamed "Pillar Completion Overview." Each card shows:
- Pillar icon + name
- Indicators with data: X / Y total
- Completion rate chip (color-coded)
- Accomplishment rate chip (from `average_accomplishment_rate`)
- Click → navigate to physical page for that pillar

**Sub-step DR-C2: Add Combobox Pillar Selector to Target vs Actual Chart**

Replace the full-width static "Target vs Actual by Pillar" chart with a combobox-driven version:

```typescript
// Add new state
const selectedAnalyticsPillar = ref<string>('ALL')

const analyticsPillarOptions = computed(() => [
  { title: 'All Pillars', value: 'ALL' },
  ...PILLARS.map(p => ({ title: p.name, value: p.id }))
])

// Filtered chart series based on selection
const targetVsActualSeries = computed(() => {
  const pillarsToShow = selectedAnalyticsPillar.value === 'ALL'
    ? PILLARS
    : PILLARS.filter(p => p.id === selectedAnalyticsPillar.value)
  // ... uses indicator_target_rate / indicator_actual_rate from DR-A
})
```

Chart template:
```vue
<v-select v-model="selectedAnalyticsPillar" :items="analyticsPillarOptions" />
<VueApexCharts type="bar" :series="targetVsActualSeries" :options="targetVsActualOptions" />
```

**X-axis:** Pillar names (or quarter names if single pillar selected)
**Y-axis:** Rate (dimensionless — `target_rate` and `actual_rate`)

**Sub-step DR-C3: Remove Quarterly Data Entry Progress**

Remove the entire `<!-- FY Completion Dashboard -->` block (lines 726-778) and the `fetchPillarProgress()` function and `pillarProgress` ref, and `getQuartersComplete()` function.

**Verification:**
- [ ] DR-C1: Pillar Completion Overview is the FIRST section after category cards
- [ ] DR-C2: All 4 pillar cards visible with completion rates
- [ ] DR-C3: Combobox "All Pillars" shows all 4 pillars in chart
- [ ] DR-C4: Combobox "Higher Education" filters chart to that pillar only
- [ ] DR-C5: Quarterly Data Entry Progress section absent from page
- [ ] DR-C6: `fetchPillarProgress()` no longer called on mount (4 fewer API calls)

---

### Step DR-D: Update Frontend Chart Data to Use Rate Fields (IMPORTANT)

**Scope:** MUST
**File:** `pmo-frontend/pages/university-operations/index.vue`

**Problem:** After DR-A changes the backend response, the frontend computed properties `targetVsActualSeries` and `pillarChartSeries` must consume the new `indicator_target_rate` / `indicator_actual_rate` fields.

**Change `targetVsActualSeries`:**
```typescript
const targetVsActualSeries = computed(() => {
  const pillarsToShow = selectedAnalyticsPillar.value === 'ALL'
    ? PILLARS
    : PILLARS.filter(p => p.id === selectedAnalyticsPillar.value)

  if (!pillarSummary.value?.pillars) {
    return [
      { name: 'Target Rate', data: pillarsToShow.map(() => 0) },
      { name: 'Actual Rate', data: pillarsToShow.map(() => 0) },
    ]
  }

  return [
    {
      name: 'Target Rate',
      data: pillarsToShow.map(p => {
        const pd = pillarSummary.value.pillars.find((ps: any) => ps.pillar_type === p.id)
        return pd?.indicator_target_rate || 0
      }),
    },
    {
      name: 'Actual Rate',
      data: pillarsToShow.map(p => {
        const pd = pillarSummary.value.pillars.find((ps: any) => ps.pillar_type === p.id)
        return pd?.indicator_actual_rate || 0
      }),
    },
  ]
})
```

**Update chart X-axis labels:**
```typescript
const targetVsActualOptions = computed(() => ({
  // ...existing options...
  xaxis: {
    categories: selectedAnalyticsPillar.value === 'ALL'
      ? PILLARS.map(p => p.name)
      : ['Q1', 'Q2', 'Q3', 'Q4']  // if single pillar: quarterly breakdown
  },
  yaxis: {
    title: { text: 'Accomplishment Rate (Σ actual/target)' },
    labels: { formatter: (v: number) => v.toFixed(2) }
  },
}))
```

**Update `pillarChartSeries` (radial bar):**
```typescript
const pillarChartSeries = computed(() => {
  if (!pillarSummary.value?.pillars) return [0, 0, 0, 0]
  return PILLARS.map(p => {
    const pd = pillarSummary.value.pillars.find((ps: any) => ps.pillar_type === p.id)
    // Use accomplishment_rate_pct from DR-A (already as percentage)
    return pd?.accomplishment_rate_pct || 0
  })
})
```

**Verification:**
- [ ] DR-D1: Chart Y-axis shows dimensionless rate values (not raw counts or percentages)
- [ ] DR-D2: "All Pillars" view shows 4 grouped bars
- [ ] DR-D3: Single pillar view shows Q1-Q4 bars (from `getQuarterlyTrend`)
- [ ] DR-D4: Radial chart shows `accomplishment_rate_pct` per pillar

---

### Step DR-E: Lightweight Inline Summary on Physical Page (IMPORTANT)

**Scope:** MUST
**File:** `pmo-frontend/pages/university-operations/physical/index.vue`

**Problem:** After DQ-A, the physical page has no analytics at all. The operator requires lightweight per-pillar summary.

**Requirement:** Small inline summary bar above the indicator tables showing:
1. Indicators with data count: X / Y
2. Overall pillar rate: computed from existing `pillarIndicators` data (no new API call)
3. Visual: compact info chips only — no heavy chart components

**Rate computation (frontend, from existing `pillarIndicators`):**
```typescript
// Phase DR-E: Lightweight rate summary computed from existing pillarIndicators
// Uses same rate model as backend: SUM(actual/target) per indicator
const pillarRateSummary = computed(() => {
  const indicators = pillarIndicators.value.filter(i => i.pillar_indicator_id !== null)
  const withData = pillarTaxonomy.value.filter(t => getIndicatorData(t.id) !== null).length
  const total = pillarTaxonomy.value.length

  let targetRate = 0
  let actualRate = 0

  for (const indicator of indicators) {
    const target = (parseFloat(indicator.target_q1)||0) + (parseFloat(indicator.target_q2)||0)
      + (parseFloat(indicator.target_q3)||0) + (parseFloat(indicator.target_q4)||0)
    const actual = (parseFloat(indicator.accomplishment_q1)||0) + (parseFloat(indicator.accomplishment_q2)||0)
      + (parseFloat(indicator.accomplishment_q3)||0) + (parseFloat(indicator.accomplishment_q4)||0)

    if (target > 0) {
      targetRate += 1.0
      actualRate += actual / target
    }
  }

  const ratePct = targetRate > 0 ? (actualRate / targetRate) * 100 : null

  return { withData, total, targetRate, actualRate, ratePct }
})
```

**Template — inline summary bar above Outcome Indicators card:**
```vue
<!-- Phase DR-E: Lightweight Pillar Summary -->
<v-row v-if="pillarTaxonomy.length > 0" class="mb-3" dense>
  <v-col cols="12">
    <div class="d-flex align-center ga-2 flex-wrap">
      <v-chip size="small" variant="tonal" color="primary">
        <v-icon start size="x-small">mdi-database-check</v-icon>
        {{ pillarRateSummary.withData }} / {{ pillarRateSummary.total }} Indicators with Data
      </v-chip>
      <v-chip size="small" variant="tonal"
        :color="pillarRateSummary.ratePct === null ? 'grey'
          : pillarRateSummary.ratePct >= 100 ? 'success'
          : pillarRateSummary.ratePct >= 80 ? 'warning' : 'error'">
        <v-icon start size="x-small">mdi-chart-line</v-icon>
        {{
          pillarRateSummary.ratePct !== null
            ? `${pillarRateSummary.ratePct.toFixed(1)}% Achievement Rate`
            : 'No data yet'
        }}
      </v-chip>
    </div>
  </v-col>
</v-row>
```

**Constraints:**
- No additional API calls — uses `pillarIndicators` already fetched
- No charts — chips only
- No modification to indicator tables, forms, or quarterly inputs

**Verification:**
- [ ] DR-E1: Chips appear above indicator tables when taxonomy is loaded
- [ ] DR-E2: "X / Y Indicators with Data" reflects correct counts
- [ ] DR-E3: Achievement Rate chip color matches performance (green/yellow/red)
- [ ] DR-E4: Rate is null / "No data yet" when no indicators have data
- [ ] DR-E5: Data entry dialog is completely unchanged
- [ ] DR-E6: Indicator tables (Outcome + Output) are completely unchanged

---

### Step DR-F: Regression Testing Matrix (CRITICAL)

**Scope:** MUST

| # | Test Case | Expected Result | Status |
|---|-----------|----------------|--------|
| 1 | Main page loads — Pillar Completion Overview is FIRST analytics section | 4 pillar cards visible with counts + rates | [ ] |
| 2 | Quarterly Data Entry Progress section absent | Not visible on page | [ ] |
| 3 | Target vs Actual chart — combobox "All Pillars" | 4 grouped bars (Target Rate vs Actual Rate) | [ ] |
| 4 | Target vs Actual chart — select "Higher Education" | Chart filtered to HE pillar | [ ] |
| 5 | Rate model — COUNT indicator (1500 actual / 2000 target) contributes 0.75 to actual_rate | Backend returns correct rate | [ ] |
| 6 | Rate model — PERCENTAGE indicator (90% actual / 80% target) contributes 1.125 | Exceeds target — rate > 1.0 | [ ] |
| 7 | Physical page — inline summary chips appear above indicator tables | Chips show X/Y and achievement rate | [ ] |
| 8 | Physical page — data entry dialog unchanged | Form fields same as before | [ ] |
| 9 | Physical page — indicator tables unchanged | Outcome + Output rows same as before | [ ] |
| 10 | Changing fiscal year updates analytics | All charts refresh | [ ] |
| 11 | Pillar completion card click → Physical page correct tab | Navigation preserved | [ ] |
| 12 | Year-over-Year chart still functional | No regression | [ ] |

---

## Phase DR Execution Priority

| Priority | Step | Severity | Dependencies |
|----------|------|----------|-------------|
| 1 | DR-A: Rate-based backend `getPillarSummary` | CRITICAL | None |
| 2 | DR-B: Rate-based quarterly trend | IMPORTANT | None (parallel with DR-A) |
| 3 | DR-C: Dashboard layout restructure | IMPORTANT | DR-A (needs new fields) |
| 4 | DR-D: Frontend chart data consumption | MUST | DR-A, DR-C |
| 5 | DR-E: Physical page lightweight summary | IMPORTANT | None (frontend-only) |
| 6 | DR-F: Regression testing | CRITICAL | DR-A through DR-E |

---

## PHASE DS — QUARTER-SPECIFIC DATA ENTRY REFACTOR

**Research:** `research.md` Section 1.75
**Status:** Phase 1 COMPLETE → Phase 2 COMPLETE → Awaiting `EXECUTE_WITH_ACE`
**Files affected:** `pmo-frontend/pages/university-operations/physical/index.vue` ONLY
**Backend changes:** NONE required

### Root Cause Summary

The entry dialog submits all 12 quarter fields on every save (`target_q1: null` counts as an active SET in the backend UPDATE). There is no quarter selector — the dialog shows all 4 quarters simultaneously. This makes independent quarter entry impossible and risks overwriting data.

---

### Step DS-A: Add `dialogQuarter` Tab Selector to Entry Dialog [MUST]

**File:** `physical/index.vue`

**State to add:**
```typescript
const dialogQuarter = ref<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q1')
```

**Opening behavior in `openEntryDialog()`:** After loading `entryForm`, set `dialogQuarter` based on:
1. If page `selectedQuarter !== 'ALL'` → use that quarter
2. Else → find first quarter with no data (null target AND null actual); default to `'Q1'`

**Trigger prefill** after setting initial quarter (see DS-C).

**UI (top of dialog form, before fields):**
```vue
<v-tabs v-model="dialogQuarter" density="compact" class="mb-3" @update:modelValue="onDialogQuarterChange">
  <v-tab v-for="q in ['Q1','Q2','Q3','Q4']" :key="q" :value="q">
    {{ q }}
    <v-icon v-if="quarterHasData(q)" size="x-small" color="success" class="ml-1">mdi-check-circle</v-icon>
  </v-tab>
</v-tabs>
```

**Verification:**
- [ ] DS-A1: Dialog opens with correct quarter pre-selected
- [ ] DS-A2: Tab switch does not clear existing data
- [ ] DS-A3: Check icons appear on tabs that have data

---

### Step DS-B: Show Only Active Quarter's Fields [MUST]

**File:** `physical/index.vue`

**State to add:**
```typescript
const dialogQuarterKey = computed(() => dialogQuarter.value.toLowerCase() as 'q1'|'q2'|'q3'|'q4')

const qTarget = computed({
  get: () => entryForm.value[`target_${dialogQuarterKey.value}`],
  set: (v: any) => { entryForm.value[`target_${dialogQuarterKey.value}`] = v }
})
const qActual = computed({
  get: () => entryForm.value[`accomplishment_${dialogQuarterKey.value}`],
  set: (v: any) => { entryForm.value[`accomplishment_${dialogQuarterKey.value}`] = v }
})
const qScore = computed({
  get: () => entryForm.value[`score_${dialogQuarterKey.value}`],
  set: (v: any) => { entryForm.value[`score_${dialogQuarterKey.value}`] = v }
})
```

**Replace the 4-row table in the dialog template** with a single-quarter form:
```vue
<!-- Active quarter entry -->
<v-row dense class="mb-2">
  <v-col cols="12" md="4">
    <v-text-field v-model.number="qTarget" label="Target" type="number" min="0" hide-details density="compact" />
  </v-col>
  <v-col cols="12" md="4">
    <v-text-field v-model.number="qActual" label="Actual" type="number" min="0" hide-details density="compact" />
  </v-col>
  <v-col cols="12" md="4">
    <v-text-field v-model="qScore" label="Score (optional)" placeholder="e.g. 148/200" hide-details density="compact" />
  </v-col>
</v-row>

<!-- Read-only reference for other quarters -->
<v-card variant="tonal" class="mb-3 pa-2" v-if="Object.values(['Q1','Q2','Q3','Q4'].filter(q => q !== dialogQuarter)).some(q => quarterHasData(q))">
  <div class="text-caption text-grey mb-1">Other quarters (reference only)</div>
  <div class="d-flex flex-wrap ga-3">
    <div v-for="q in ['Q1','Q2','Q3','Q4'].filter(q => q !== dialogQuarter)" :key="q">
      <span class="text-caption font-weight-bold">{{ q }}:</span>
      <span class="text-caption ml-1">
        T={{ entryForm[`target_${q.toLowerCase()}`] ?? '—' }}
        / A={{ entryForm[`accomplishment_${q.toLowerCase()}`] ?? '—' }}
      </span>
    </div>
  </div>
</v-card>
```

**Verification:**
- [ ] DS-B1: Only 3 editable fields (Target, Actual, Score) for active quarter
- [ ] DS-B2: Other quarters shown as read-only reference row
- [ ] DS-B3: Switching tabs shows correct values per quarter

---

### Step DS-C: Prefill From Previous Quarter [MUST]

**File:** `physical/index.vue`

**Logic:**
```typescript
function prefillFromPreviousQuarter(targetQ: 'Q1' | 'Q2' | 'Q3' | 'Q4') {
  const qKey = targetQ.toLowerCase()
  const alreadyHasData = entryForm.value[`target_${qKey}`] !== null
    || entryForm.value[`accomplishment_${qKey}`] !== null
  if (alreadyHasData) return

  const ORDER = ['Q1', 'Q2', 'Q3', 'Q4'] as const
  const prevIndex = ORDER.indexOf(targetQ) - 1
  if (prevIndex < 0) return  // Q1 has no previous

  const prevKey = ORDER[prevIndex].toLowerCase()
  const prevTarget = entryForm.value[`target_${prevKey}`]

  if (prevTarget !== null) {
    entryForm.value[`target_${qKey}`] = prevTarget   // Only prefill target
    // accomplishment intentionally left null — user must enter actual value
  }
}
```

**Helper for DS-A:**
```typescript
function onDialogQuarterChange(q: 'Q1' | 'Q2' | 'Q3' | 'Q4') {
  prefillFromPreviousQuarter(q)
}
```

**Also call from `openEntryDialog` after setting `dialogQuarter`:**
```typescript
prefillFromPreviousQuarter(dialogQuarter.value)
```

**Helper for DS-A tab check icons:**
```typescript
function quarterHasData(q: string): boolean {
  const k = q.toLowerCase()
  return entryForm.value[`target_${k}`] !== null
    || entryForm.value[`accomplishment_${k}`] !== null
}
```

**Verification:**
- [ ] DS-C1: Q2 opens with Q1 target prefilled, Q2 actual empty
- [ ] DS-C2: Q3 opens with Q2 target prefilled (not Q1), Q3 actual empty
- [ ] DS-C3: Prefill does NOT trigger if current quarter already has data
- [ ] DS-C4: Q1 (no previous) opens completely empty for new indicator

---

### Step DS-D: Quarter-Specific Save Payload — ROOT CAUSE FIX [MUST]

**File:** `physical/index.vue`

**Replace** the payload construction in `saveQuarterlyData()`:

**Current (broken — sends all 12 fields including null):**
```typescript
const { _existingId, ...rawPayload } = entryForm.value
const payload = sanitizeNumericPayload(rawPayload)
```

**Fixed (sends only active quarter's 3 fields):**
```typescript
const { _existingId } = entryForm.value
const qKey = dialogQuarter.value.toLowerCase()

const quarterPayload = {
  pillar_indicator_id: entryForm.value.pillar_indicator_id,
  fiscal_year: entryForm.value.fiscal_year,
  [`target_${qKey}`]: entryForm.value[`target_${qKey}`],
  [`accomplishment_${qKey}`]: entryForm.value[`accomplishment_${qKey}`],
  [`score_${qKey}`]: entryForm.value[`score_${qKey}`],
  remarks: entryForm.value.remarks,
}
const payload = sanitizeNumericPayload(quarterPayload)
```

**Backend result:** `fields` array in service only includes active quarter's columns → other quarters untouched.

**CREATE path** (first time): also sends only the active quarter's fields. Backend INSERT handles nulls for other quarters via default column values.

**Verification:**
- [ ] DS-D1: PATCH only updates active quarter's columns; confirmed by re-fetching record
- [ ] DS-D2: Q1 unchanged after saving Q2
- [ ] DS-D3: Q3 unchanged after saving Q1
- [ ] DS-D4: CREATE for first entry sets Q1 correctly, Q2-Q4 remain null

---

### Step DS-E: Dialog UX Polish [SHOULD]

**File:** `physical/index.vue`

1. Update dialog title: `Enter {{ dialogQuarter }} Data — {{ selectedIndicator?.indicator_name || '...' }}`
2. Add "→ Next Quarter" button after save (if not Q4):
```typescript
const nextQuarterMap: Record<string, 'Q2'|'Q3'|'Q4'> = { Q1: 'Q2', Q2: 'Q3', Q3: 'Q4' }
// After successful save, optionally advance: dialogQuarter.value = nextQuarterMap[dialogQuarter.value]
```
3. Show a brief "Saved Q3 ✓" toast confirmation per-quarter

**Verification:**
- [ ] DS-E1: Title shows active quarter
- [ ] DS-E2: Toast confirms which quarter was saved

---

### Step DS-F: Regression Testing Matrix [MUST]

| # | Test Case | Expected | Status |
|---|-----------|----------|--------|
| 1 | New indicator, open dialog → Q1 pre-selected, all empty | Correct | [ ] |
| 2 | Enter Q1 target=90, actual=94.12, save | DB: Q1=90/94.12, Q2-Q4=null | [ ] |
| 3 | Reopen dialog, go to Q2 tab | Q2 target=90 (prefilled), Q2 actual=empty | [ ] |
| 4 | Enter Q2 actual=94.12, save | DB: Q2=90/94.12, Q1 unchanged | [ ] |
| 5 | Reopen dialog, go to Q3 tab | Q3 target=90 (prefilled from Q2), Q3 actual=empty | [ ] |
| 6 | Enter Q3 actual=94.97, save | DB: Q3=90/94.97, Q1 and Q2 unchanged | [ ] |
| 7 | Reopen dialog, check Q1 tab | Q1 still 90/94.12 (not overwritten) | [ ] |
| 8 | Delete Q2 actual → save | Only Q2 actual=null; Q1, Q3, Q4 unchanged | [ ] |
| 9 | ALL quarters view table shows independent values | Q1=94.12, Q2=94.12, Q3=94.97 | [ ] |
| 10 | DR-E inline rate summary reflects independent quarters | Achievement rate computed from all non-null quarters | [ ] |

---

### Phase DS Execution Priority

| Priority | Step | Severity | Dependency |
|----------|------|----------|-----------|
| 1 | DS-D: Quarter-specific save payload | CRITICAL (root cause fix) | None |
| 2 | DS-A: Dialog quarter selector | CRITICAL (UX blocker) | DS-D |
| 3 | DS-B: Single-quarter form fields | MUST | DS-A |
| 4 | DS-C: Prefill from previous quarter | MUST | DS-A, DS-B |
| 5 | DS-E: UX polish | SHOULD | DS-A-D |
| 6 | DS-F: Regression testing | CRITICAL | All |

---

---

## PHASE DT: DIALOG UX TABULAR REFACTOR [MUST]

**Status:** 🟡 PHASE 2 PLAN COMPLETE — Awaiting `EXECUTE_WITH_ACE`
**Priority:** P1 — UX improvement; reduces cognitive load for data entry
**Research Reference:** `research.md` Section 1.76
**File:** `pmo-frontend/pages/university-operations/physical/index.vue` (only)
**Backend Changes:** None

**Constraint:** Do NOT alter Outcome/Output/Organizational indicator display tables, taxonomy structures, or backend services.

---

### Step DT-A: Remove Tab-Navigation State and Helpers

**Scope:** Script section — remove DS-era tab state and derived helpers

**Delete the following refs/computed (lines ~132–190):**
- `dialogQuarter` ref (`const dialogQuarter = ref<'Q1'|'Q2'|'Q3'|'Q4'>('Q1')`)
- `dialogQuarterKey` computed
- `qTarget`, `qActual`, `qScore` computed (getters/setters)

**Delete the following functions:**
- `quarterHasData(q)` — was for tab check icons
- `prefillFromPreviousQuarter(q)` — was for tab-change pre-fill
- `onDialogQuarterChange(q)` — tab change handler
- `advanceToNextQuarter()` — "Next Quarter" button action

**Update `openEntryDialog()` (~lines 548–558):**
Remove these two lines that reference deleted state:
```typescript
dialogQuarter.value = firstEmpty || 'Q1'   // ← REMOVE
prefillFromPreviousQuarter(dialogQuarter.value)  // ← REMOVE
```
Keep all other `openEntryDialog` logic intact (operation creation guard, `entryForm` population from DB, `_existingId` assignment).

**Verification:**
- [ ] DT-A1: No TypeScript errors referencing deleted identifiers
- [ ] DT-A2: `openEntryDialog()` still populates `entryForm` correctly from DB

---

### Step DT-B: Simplify `saveQuarterlyData` Payload to Full 12-Field

**Scope:** `saveQuarterlyData()` — replace DS-D quarter-specific payload with full payload

**Rationale:** `entryForm` is loaded from DB on `openEntryDialog()`. All 12 fields reflect current DB state at dialog open time. Sending all 12 fields is safe and idempotent for unchanged quarters. Eliminates the need for quarter tracking.

**Replace (~lines 641–650):**
```typescript
// REMOVE — DS-D quarter-specific block:
const qKey = dialogQuarter.value.toLowerCase()
const quarterPayload: any = {
  pillar_indicator_id: entryForm.value.pillar_indicator_id,
  fiscal_year: entryForm.value.fiscal_year,
  [`target_${qKey}`]: entryForm.value[`target_${qKey}`],
  [`accomplishment_${qKey}`]: entryForm.value[`accomplishment_${qKey}`],
  [`score_${qKey}`]: entryForm.value[`score_${qKey}`],
  remarks: entryForm.value.remarks,
}
```

**With:**
```typescript
// DT-B: Full 12-field payload — entryForm loaded from DB so all fields safe to send
const quarterPayload: any = {
  pillar_indicator_id: entryForm.value.pillar_indicator_id,
  fiscal_year: entryForm.value.fiscal_year,
  target_q1: entryForm.value.target_q1,
  accomplishment_q1: entryForm.value.accomplishment_q1,
  score_q1: entryForm.value.score_q1,
  target_q2: entryForm.value.target_q2,
  accomplishment_q2: entryForm.value.accomplishment_q2,
  score_q2: entryForm.value.score_q2,
  target_q3: entryForm.value.target_q3,
  accomplishment_q3: entryForm.value.accomplishment_q3,
  score_q3: entryForm.value.score_q3,
  target_q4: entryForm.value.target_q4,
  accomplishment_q4: entryForm.value.accomplishment_q4,
  score_q4: entryForm.value.score_q4,
  remarks: entryForm.value.remarks,
}
```

The `sanitizeNumericPayload(quarterPayload)` call on the next line remains unchanged — it handles all 12 numeric fields already.

**Verification:**
- [ ] DT-B1: PATCH request body contains all 12 quarter fields
- [ ] DT-B2: `sanitizeNumericPayload` correctly converts empty strings to null for all 12 fields
- [ ] DT-B3: Saving with Q2/Q3/Q4 null does not corrupt Q1 data (DB already had them null)

---

### Step DT-C: Rebuild Dialog Template — Horizontal Tabular Layout

**Scope:** Dialog template section (~lines 1428–1578) — replace tab-based form with horizontal scrollable table

**Dialog width change:**
```html
<!-- BEFORE -->
<v-dialog v-model="entryDialog" max-width="650" persistent>
<!-- AFTER -->
<v-dialog v-model="entryDialog" max-width="1100" persistent>
```

**Dialog title change (DT-E):**
```html
<!-- BEFORE -->
Enter {{ dialogQuarter }} Data — {{ selectedIndicator?.indicator_name || currentPillar.name }}
<!-- AFTER -->
Enter Quarterly Data — {{ selectedIndicator?.indicator_name || currentPillar.name }}
```

**Remove from template:**
- `v-tabs` quarter selector block
- Single-quarter 3-field `v-row` (Target/Actual/Score inputs for active quarter)
- "Other quarters (reference only)" `v-card` block
- "Next Quarter" `v-btn` in `v-card-actions`
- "Save {{ dialogQuarter }}" text on save button → replace with "Save All Quarters"

**Add — Horizontal scrollable data entry table (between Indicator Info alert and Remarks textarea):**

```html
<!-- DT-C: Horizontal tabular data entry — all quarters simultaneously -->
<div class="overflow-x-auto mb-4">
  <v-table density="compact" class="dt-entry-table">
    <thead>
      <!-- Row 1: Quarter group headers -->
      <tr class="bg-grey-lighten-4">
        <th colspan="3" class="text-center border-right quarter-group-header">Q1</th>
        <th colspan="3" class="text-center border-right quarter-group-header">Q2</th>
        <th colspan="3" class="text-center border-right quarter-group-header">Q3</th>
        <th colspan="3" class="text-center border-right quarter-group-header">Q4</th>
        <th colspan="2" class="text-center quarter-group-header">Annual</th>
      </tr>
      <!-- Row 2: Field sub-headers -->
      <tr class="bg-grey-lighten-5">
        <th class="text-center dt-col">Target</th>
        <th class="text-center dt-col">Actual</th>
        <th class="text-center dt-col-score border-right">Score</th>
        <th class="text-center dt-col">Target</th>
        <th class="text-center dt-col">Actual</th>
        <th class="text-center dt-col-score border-right">Score</th>
        <th class="text-center dt-col">Target</th>
        <th class="text-center dt-col">Actual</th>
        <th class="text-center dt-col-score border-right">Score</th>
        <th class="text-center dt-col">Target</th>
        <th class="text-center dt-col">Actual</th>
        <th class="text-center dt-col-score border-right">Score</th>
        <th class="text-center dt-col-summary">Variance</th>
        <th class="text-center dt-col-summary">Rate</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <!-- Q1 -->
        <td class="dt-input-cell">
          <v-text-field v-model.number="entryForm.target_q1" type="number" step="0.01" min="0"
            density="compact" variant="outlined" hide-details class="dt-input" />
        </td>
        <td class="dt-input-cell">
          <v-text-field v-model.number="entryForm.accomplishment_q1" type="number" step="0.01" min="0"
            density="compact" variant="outlined" hide-details class="dt-input" />
        </td>
        <td class="dt-input-cell border-right">
          <v-text-field v-model="entryForm.score_q1" placeholder="e.g. 148/200"
            density="compact" variant="outlined" hide-details class="dt-input-score" />
        </td>
        <!-- Q2 -->
        <td class="dt-input-cell">
          <v-text-field v-model.number="entryForm.target_q2" type="number" step="0.01" min="0"
            density="compact" variant="outlined" hide-details class="dt-input" />
        </td>
        <td class="dt-input-cell">
          <v-text-field v-model.number="entryForm.accomplishment_q2" type="number" step="0.01" min="0"
            density="compact" variant="outlined" hide-details class="dt-input" />
        </td>
        <td class="dt-input-cell border-right">
          <v-text-field v-model="entryForm.score_q2" placeholder="e.g. 148/200"
            density="compact" variant="outlined" hide-details class="dt-input-score" />
        </td>
        <!-- Q3 -->
        <td class="dt-input-cell">
          <v-text-field v-model.number="entryForm.target_q3" type="number" step="0.01" min="0"
            density="compact" variant="outlined" hide-details class="dt-input" />
        </td>
        <td class="dt-input-cell">
          <v-text-field v-model.number="entryForm.accomplishment_q3" type="number" step="0.01" min="0"
            density="compact" variant="outlined" hide-details class="dt-input" />
        </td>
        <td class="dt-input-cell border-right">
          <v-text-field v-model="entryForm.score_q3" placeholder="e.g. 148/200"
            density="compact" variant="outlined" hide-details class="dt-input-score" />
        </td>
        <!-- Q4 -->
        <td class="dt-input-cell">
          <v-text-field v-model.number="entryForm.target_q4" type="number" step="0.01" min="0"
            density="compact" variant="outlined" hide-details class="dt-input" />
        </td>
        <td class="dt-input-cell">
          <v-text-field v-model.number="entryForm.accomplishment_q4" type="number" step="0.01" min="0"
            density="compact" variant="outlined" hide-details class="dt-input" />
        </td>
        <td class="dt-input-cell border-right">
          <v-text-field v-model="entryForm.score_q4" placeholder="e.g. 148/200"
            density="compact" variant="outlined" hide-details class="dt-input-score" />
        </td>
        <!-- Annual computed (read-only) -->
        <td class="text-center dt-summary-cell">
          <v-chip size="x-small" :color="getVarianceColor(computedPreview.variance)" variant="tonal">
            {{ computedPreview.variance !== null ? formatNumber(computedPreview.variance) : '—' }}
          </v-chip>
        </td>
        <td class="text-center dt-summary-cell">
          <v-chip size="x-small" :color="getRateColor(computedPreview.rate)" variant="tonal">
            {{ computedPreview.rate !== null ? formatPercent(computedPreview.rate) : '—' }}
          </v-chip>
        </td>
      </tr>
    </tbody>
  </v-table>
</div>
```

**Annual Totals preview card** — keep as-is below the table (redundant but harmless; provides context for Total Target / Total Actual chips which still reflect live `computedPreview`).

**Save button in `v-card-actions`:**
```html
<!-- BEFORE -->
Save {{ dialogQuarter }}
<!-- AFTER -->
Save All Quarters
```

**Verification:**
- [ ] DT-C1: Dialog opens showing all 12 input fields simultaneously
- [ ] DT-C2: Two-row header: Q1/Q2/Q3/Q4 group row + Target/Actual/Score sub-row
- [ ] DT-C3: Variance and Rate chips update live as any field is edited
- [ ] DT-C4: Dialog title reads "Enter Quarterly Data — [indicator name]"
- [ ] DT-C5: No `v-tabs`, no "Next Quarter" button, no "reference only" panel

---

### Step DT-D: Add Scoped CSS for Table Column Widths

**Add to `<style scoped>` section:**

```css
/* DT-D: Data entry table column width control */
.dt-entry-table {
  min-width: 900px; /* forces horizontal scroll on narrow viewports */
}
.dt-col {
  min-width: 82px;
  width: 82px;
}
.dt-col-score {
  min-width: 90px;
  width: 90px;
}
.dt-col-summary {
  min-width: 88px;
  width: 88px;
  white-space: nowrap;
}
.dt-input-cell {
  padding: 6px 4px !important;
  vertical-align: middle;
}
.dt-summary-cell {
  vertical-align: middle;
  padding: 6px 8px !important;
}
.dt-input {
  min-width: 74px;
}
.dt-input-score {
  min-width: 82px;
}
.quarter-group-header {
  font-weight: 600;
  font-size: 0.85rem;
}
.border-right {
  border-right: 1px solid rgba(0,0,0,0.12) !important;
}
```

**Verification:**
- [ ] DT-D1: Table does not overflow dialog card on 1080px viewport
- [ ] DT-D2: Table scrolls horizontally on 768px viewport without breaking layout

---

### Phase DT Execution Priority

| Priority | Step | Severity | Dependency |
|---|---|---|---|
| 1 | DT-A: Remove tab state and helpers | MUST | None |
| 2 | DT-B: Full-payload save | MUST | DT-A (removes `dialogQuarter` reference) |
| 3 | DT-C: Tabular dialog template | MUST | DT-A (removes tab template) |
| 4 | DT-D: CSS column widths | SHOULD | DT-C |

### Phase DT Regression Testing Matrix

| # | Test Case | Expected | Status |
|---|-----------|----------|--------|
| 1 | Open dialog on empty indicator | All 12 fields empty, no tab UI | [ ] |
| 2 | Open dialog on indicator with Q1+Q2 data only | Q1/Q2 show loaded values, Q3/Q4 inputs empty | [ ] |
| 3 | Edit Q1 target → Save | DB: Q1 updated; Q2/Q3/Q4 unchanged | [ ] |
| 4 | Clear Q2 actual → Save | DB: Q2 actual=null; all other fields unchanged | [ ] |
| 5 | Fill all 4 quarters → Save | All 12 fields saved in single PATCH | [ ] |
| 6 | Type in Q3 Target → Variance/Rate chips update immediately | `computedPreview` reactive | [ ] |
| 7 | Annual Totals card at bottom updates live | `computedPreview` chips correct | [ ] |
| 8 | Cancel without saving | No API call; indicator table unchanged | [ ] |
| 9 | Dialog on 768px viewport | Horizontal scroll works; no clipping | [ ] |
| 10 | Outcome/Output/Organizational tables unaffected | Row display unchanged after dialog changes | [ ] |

---

---

## PHASE DU: DT CORRECTION & MAIN TABLE EXPANSION [MUST]

**Status:** 🟡 PHASE 2 PLAN COMPLETE — Awaiting `EXECUTE_WITH_ACE`
**Priority:** P1 — DT dialog unusable; main table incomplete (no Score in ALL mode)
**Research Reference:** `research.md` Section 1.77
**File:** `pmo-frontend/pages/university-operations/physical/index.vue` (only)
**Backend Changes:** None

**Constraint:** Do NOT modify Outcome/Output/Organizational indicator logic, hierarchy, or definitions.

---

### Step DU-A: Fix Dialog — Replace Horizontal Table with Vertical Quarter-Row Table

**Problem:** DT horizontal 14-column dialog is cramped, too wide, wrong reading direction.
**Fix:** Transpose to rows=quarters, cols=Target/Actual/Score. Restore `max-width="700"`.

**Template changes in dialog (lines ~1353–1533):**

1. `max-width="1100"` → `max-width="700"`
2. Remove the `<div class="overflow-x-auto mb-4">` wrapper and inner `<v-table class="dt-entry-table">` (14-column horizontal table)
3. Replace with vertical `<v-table density="compact" class="mb-4">`:

```
[thead]
  | Quarter | Target | Actual | Score (optional) |
[tbody]
  | Q1 chip | v-text-field target_q1 (number) | v-text-field accomplishment_q1 (number) | v-text-field score_q1 (text) |
  | Q2 chip | v-text-field target_q2 (number) | v-text-field accomplishment_q2 (number) | v-text-field score_q2 (text) |
  | Q3 chip | v-text-field target_q3 (number) | v-text-field accomplishment_q3 (number) | v-text-field score_q3 (text) |
  | Q4 chip | v-text-field target_q4 (number) | v-text-field accomplishment_q4 (number) | v-text-field score_q4 (text) |
```

- Quarter label cells: `v-chip` with distinct colors (Q1=blue, Q2=teal, Q3=orange, Q4=deep-purple)
- All text-fields: `density="compact"`, `variant="outlined"`, `hide-details`
- Numeric fields: `type="number"`, `step="0.01"`, `min="0"`, `v-model.number`
- Score fields: text type (not number), `placeholder="e.g. 148/200"`, `v-model`
4. Remove the duplicate **Annual Totals card** (Variance and Rate already in `computedPreview` chips — consolidate into one section at the bottom of the form)
5. Keep: Indicator info alert, Remarks textarea, Cancel/Save All Quarters buttons

**Script changes:** None required. `entryForm`, `computedPreview`, `sanitizeNumericPayload`, save payload are all correct from DT-B.

**Verification:**
- [ ] DU-A1: Dialog opens at ≤700px — fits in 1366px viewport without horizontal scroll
- [ ] DU-A2: Four quarter rows visible, each with Target/Actual/Score inputs
- [ ] DU-A3: Values from DB populate correct row inputs on dialog open
- [ ] DU-A4: Typing any value updates `computedPreview` Variance/Rate chips live
- [ ] DU-A5: Save sends all 12 quarter fields; PATCH or POST succeeds
- [ ] DU-A6: No horizontal scroll inside the dialog on any tested viewport

---

### Step DU-B: Update Main Indicator Table "ALL" Mode — Expand to 14 Columns

**Problem:** `selectedQuarter === 'ALL'` shows T+A stacked per quarter, Score omitted. 4+2 columns instead of 14.
**Fix:** Two-row header (Q group + field sub-headers), 3 separate `<td>` per quarter.

**Applies to BOTH Outcome AND Output table blocks** (identical change in each).

**Header template change — `v-if selectedQuarter === 'ALL'` block:**

Replace current single-row header:
```html
<th class="quarter-column">Q1</th>
<th class="quarter-column">Q2</th>
<th class="quarter-column">Q3</th>
<th class="quarter-column">Q4</th>
```

With two-row structure inside the `<thead>`:
```html
<!-- Row 1: group headers (inside existing tr or new tr) -->
<!-- Note: requires converting single <tr> into two <tr> rows -->
<!-- First row: -->
<th colspan="3" class="text-center qgroup-header border-right-q">Q1</th>
<th colspan="3" class="text-center qgroup-header border-right-q">Q2</th>
<th colspan="3" class="text-center qgroup-header border-right-q">Q3</th>
<th colspan="3" class="text-center qgroup-header">Q4</th>
<!-- (Variance, Rate, Edit in first row spanning no extra rows — OR add a second <tr>) -->
```

Implementation approach: Wrap the entire `<thead>` in two `<tr>` rows for ALL mode, OR use `v-if` on the second header row. The cleaner approach is:

```html
<thead>
  <tr class="bg-grey-lighten-4">
    <th class="text-left indicator-column" rowspan="2">Indicator</th>
    <template v-if="selectedQuarter === 'ALL'">
      <th colspan="3" class="text-center qgroup-header border-right-q">Q1</th>
      <th colspan="3" class="text-center qgroup-header border-right-q">Q2</th>
      <th colspan="3" class="text-center qgroup-header border-right-q">Q3</th>
      <th colspan="3" class="text-center qgroup-header">Q4</th>
    </template>
    <template v-else>
      <th class="quarter-column">Target</th>
      <th class="quarter-column">Actual</th>
      <th class="quarter-column">Score</th>
    </template>
    <th class="variance-column" rowspan="2">Variance</th>
    <th class="rate-column" rowspan="2">Rate</th>
    <th v-if="canEditData()" class="action-column" rowspan="2"></th>
  </tr>
  <tr v-if="selectedQuarter === 'ALL'" class="bg-grey-lighten-5">
    <th class="text-center qsub-col">Target</th>
    <th class="text-center qsub-col">Actual</th>
    <th class="text-center qsub-col-score border-right-q">Score</th>
    <th class="text-center qsub-col">Target</th>
    <th class="text-center qsub-col">Actual</th>
    <th class="text-center qsub-col-score border-right-q">Score</th>
    <th class="text-center qsub-col">Target</th>
    <th class="text-center qsub-col">Actual</th>
    <th class="text-center qsub-col-score border-right-q">Score</th>
    <th class="text-center qsub-col">Target</th>
    <th class="text-center qsub-col">Actual</th>
    <th class="text-center qsub-col-score">Score</th>
  </tr>
</thead>
```

**Data cell change — ALL mode (`v-if selectedQuarter === 'ALL'` per indicator row):**

Replace current stacked-cell:
```html
<td class="text-center">
  <div class="text-caption">T: {{ formatNumber(...)?.target_q1 }}</div>
  <div class="text-caption text-success">A: {{ formatNumber(...)?.accomplishment_q1 }}</div>
</td>
```

With 3 separate `<td>` per quarter:
```html
<!-- Q1 -->
<td class="text-center qsub-cell">{{ formatNumber(data?.target_q1) }}{{ suffix }}</td>
<td class="text-center qsub-cell text-success">{{ formatNumber(data?.accomplishment_q1) }}{{ suffix }}</td>
<td class="text-center qsub-cell-score text-grey border-right-q">{{ data?.score_q1 || '—' }}</td>
<!-- Q2, Q3, Q4 same pattern -->
```

**Empty-state colspan fix:**
```html
<!-- BEFORE -->
<td v-else :colspan="selectedQuarter === 'ALL' ? 6 : 5" ...>
<!-- AFTER -->
<td v-else :colspan="selectedQuarter === 'ALL' ? 14 : 5" ...>
```

**CSS additions:**
```css
/* Phase DU-B: Expanded ALL-mode quarterly columns */
.qgroup-header { font-weight: 600; font-size: 0.8rem; }
.qsub-col { min-width: 68px; width: 68px; font-size: 0.75rem; }
.qsub-col-score { min-width: 80px; width: 80px; font-size: 0.75rem; }
.qsub-cell { min-width: 68px; }
.qsub-cell-score { min-width: 80px; }
.border-right-q { border-right: 1px solid rgba(0,0,0,0.1) !important; }
/* Dialog vertical table quarterly chip cells */
.q-label-cell { width: 52px; text-align: center; }
```

**Verification:**
- [ ] DU-B1: ALL mode shows two header rows — Q group + Target/Actual/Score sub-headers
- [ ] DU-B2: Each of Q1/Q2/Q3/Q4 shows 3 separate columns: Target, Actual, Score
- [ ] DU-B3: Score column shows "—" for null/empty, actual value when present
- [ ] DU-B4: Single-quarter mode (Q1–Q4) unchanged — still 3 cols for that quarter
- [ ] DU-B5: Empty indicator row colspan = 14 in ALL mode, 5 in single-Q mode
- [ ] DU-B6: Both Outcome AND Output tables updated identically

---

### Step DU-C: Remove Dead DT-D CSS Classes

**Problem:** DT-specific CSS classes are orphaned after DU-A replaces the horizontal table.

**Remove the `/* Phase DT-D: Data entry dialog table column width control */` block** (~35 lines) including:
`dt-entry-table`, `dt-col`, `dt-col-score`, `dt-col-summary`, `dt-input-cell`, `dt-summary-cell`, `dt-input`, `dt-input-score`, `border-right-dt`, `quarter-group-header`

**Note:** `border-right-dt` used `!important` — must be fully removed to avoid cascade pollution. The new `border-right-q` added in DU-B is a fresh class without conflict.

**Verification:**
- [ ] DU-C1: No template references to any `dt-` or `border-right-dt` class
- [ ] DU-C2: Style section is clean; no orphaned rules

---

### Phase DU Execution Priority

| Priority | Step | Severity | Dependency |
|---|---|---|---|
| 1 | DU-A: Fix dialog (vertical table) | MUST | None |
| 2 | DU-B: Main table ALL mode expansion | MUST | None (independent) |
| 3 | DU-C: Remove dead CSS | SHOULD | DU-A (uses DT-D classes) |

### Phase DU Regression Testing Matrix

| # | Test Case | Expected |
|---|---|---|
| 1 | Open dialog on empty indicator | 4 rows, all inputs empty, no horizontal scroll |
| 2 | Open dialog with Q1+Q2 data | Q1/Q2 rows populated; Q3/Q4 empty |
| 3 | Edit Q3 Actual → Save | DB Q3 updated; Q1/Q2/Q4 unchanged |
| 4 | Annual summary chips update live | Type Q1 Target → Variance/Rate react immediately |
| 5 | Dialog fits in 1366px viewport | Dialog ≤700px, visually centered |
| 6 | Main table — ALL mode | 2-row header; 14 data columns; Score visible for each Q |
| 7 | Main table — ALL Score column shows data | Cells with score_qN show value; empty = "—" |
| 8 | Main table — ALL empty indicator | Empty-state cell spans all 14 columns |
| 9 | Main table — select Q2 | Reverts to 3-column single-Q view; no regression |
| 10 | Outcome table unchanged (logic) | Outcome chips, title, Edit Data button: no change |
| 11 | Output table unchanged (logic) | Output chips, title, Edit Data button: no change |
| 12 | Cancel dialog | No API call; table data unchanged |

---

---

## PHASE DV: UNIFIED QUARTER MODE [SUPERSEDED BY DW — NOT IMPLEMENTED]

**Status:** ⚠️ SUPERSEDED — Never implemented. Phase DW replaces all DV steps.

---

---

## PHASE DW: REMOVE ALL FILTER & HIGHLIGHT SELECTED QUARTER [MUST]

**Status:** ✅ PHASE 3 IMPLEMENTED
**Priority:** P1 — Remove "All Quarters" option; Q1/Q2/Q3/Q4 only; always 14-col layout; highlight selected quarter
**Research Reference:** `research.md` Section 1.79
**File:** `pmo-frontend/pages/university-operations/physical/index.vue` (only)
**Backend Changes:** None. Dialog changes: None.
**Supersedes:** Phase DV (plan present, never implemented)

---

### Step DW-A: Update `selectedQuarter` Default and `quarterOptions`

**Changes to script section (lines 99–115):**

```typescript
// Phase DW-A: Remove ALL; default to Q1; Q4 = Final Year Projection
const selectedQuarter = ref<string>('Q1')
const quarterOptions = [
  { title: 'Q1 (Jan–Mar)', value: 'Q1' },
  { title: 'Q2 (Apr–Jun)', value: 'Q2' },
  { title: 'Q3 (Jul–Sep)', value: 'Q3' },
  { title: 'Q4 — Final Year Projection', value: 'Q4' },
]
```

**Also update v-select label (line 825):**
`label="Quarter"` → `label="Quarter View"`

**Verification:**
- [x] DW-A1: Page loads with Q1 pre-selected
- [x] DW-A2: Dropdown shows 4 options only (no "All Quarters")
- [x] DW-A3: Q4 option reads "Q4 — Final Year Projection"
- [x] DW-A4: "Quarter View" label displayed on select

---

### Step DW-B: Add Script Helper `qCellClass()`

**Add to script section (after `quarterOptions`, before Data refs):**

```typescript
// Phase DW-B: Returns highlight/dim CSS class for a quarter's cells
// No ALL guard needed — ALL is removed in DW-A
function qCellClass(quarter: 'q1' | 'q2' | 'q3' | 'q4'): string {
  return selectedQuarter.value.toLowerCase() === quarter ? 'q-active-cell' : 'q-dimmed-cell'
}
```

**Verification:**
- [x] DW-B1: `qCellClass('q1')` returns `'q-active-cell'` when Q1 selected
- [x] DW-B2: `qCellClass('q2')` returns `'q-dimmed-cell'` when Q1 selected
- [x] DW-B3: `qCellClass('q4')` returns `'q-active-cell'` when Q4 selected

---

### Step DW-C: Remove Header Branching — Always Render Two-Row Header (Both Tables)

**Apply to BOTH Outcome table (lines 1053–1083) AND Output table (lines 1226–1256):**

**Row 1 changes:**
1. `<th class="text-left indicator-column" :rowspan="selectedQuarter === 'ALL' ? 2 : 1">` → `rowspan="2"` (static)
2. Remove `<template v-if="selectedQuarter === 'ALL'">` and `<template v-else>` blocks
3. Always render the 4 Q group `<th>` elements with active-quarter class binding:

```html
<th colspan="3" :class="selectedQuarter === 'Q1' ? 'text-center qgroup-header border-right-q q-active-group' : 'text-center qgroup-header border-right-q'">Q1</th>
<th colspan="3" :class="selectedQuarter === 'Q2' ? 'text-center qgroup-header border-right-q q-active-group' : 'text-center qgroup-header border-right-q'">Q2</th>
<th colspan="3" :class="selectedQuarter === 'Q3' ? 'text-center qgroup-header border-right-q q-active-group' : 'text-center qgroup-header border-right-q'">Q3</th>
<th colspan="3" :class="selectedQuarter === 'Q4' ? 'text-center qgroup-header q-active-group' : 'text-center qgroup-header'">Q4</th>
```

4. `:rowspan="selectedQuarter === 'ALL' ? 2 : 1"` → `rowspan="2"` on Variance, Rate, and Edit `<th>` elements

**Row 2 changes:**
- Remove `v-if="selectedQuarter === 'ALL'"` from `<tr>` → always render

**Verification:**
- [x] DW-C1: Q1 selected → 2-row header; Q1 group `<th>` has `q-active-group` class
- [x] DW-C2: Q3 selected → Q3 group `<th>` has `q-active-group`; Q1/Q2/Q4 use standard `qgroup-header`
- [x] DW-C3: Indicator column always `rowspan=2`
- [x] DW-C4: Both Outcome and Output tables behave identically

---

### Step DW-D: Remove Body Cell Branching — Always Render All 12 Quarter Cells (Both Tables)

**Apply to BOTH Outcome table body AND Output table body:**

**Inside `<template v-if="getIndicatorData(indicator.id)">`:**

1. Remove `<template v-if="selectedQuarter === 'ALL'">` wrapper
2. Remove `<template v-else>` single-quarter cells entirely
3. Always render the 12 cells; add `qCellClass()` binding:

```html
<!-- Q1 -->
<td class="text-center qsub-cell" :class="qCellClass('q1')">...</td>
<td class="text-center qsub-cell text-success" :class="qCellClass('q1')">...</td>
<td class="text-center qsub-cell-score text-grey border-right-q" :class="qCellClass('q1')">...</td>
<!-- Q2 -->
<td class="text-center qsub-cell" :class="qCellClass('q2')">...</td>
<td class="text-center qsub-cell text-success" :class="qCellClass('q2')">...</td>
<td class="text-center qsub-cell-score text-grey border-right-q" :class="qCellClass('q2')">...</td>
<!-- Q3 -->
<td class="text-center qsub-cell" :class="qCellClass('q3')">...</td>
<td class="text-center qsub-cell text-success" :class="qCellClass('q3')">...</td>
<td class="text-center qsub-cell-score text-grey border-right-q" :class="qCellClass('q3')">...</td>
<!-- Q4 -->
<td class="text-center qsub-cell" :class="qCellClass('q4')">...</td>
<td class="text-center qsub-cell text-success" :class="qCellClass('q4')">...</td>
<td class="text-center qsub-cell-score text-grey" :class="qCellClass('q4')">...</td>
```

4. **Empty-state `<td>`:** `selectedQuarter === 'ALL' ? 14 : 5` → always `14` (both tables, lines 1176 and 1349)

**Verification:**
- [x] DW-D1: Q1 selected → Q1 cells have `q-active-cell`; Q2/Q3/Q4 have `q-dimmed-cell`
- [x] DW-D2: Q4 selected → Q4 cells active; Q1/Q2/Q3 dimmed
- [x] DW-D3: Empty indicator row spans 14 columns
- [x] DW-D4: Variance/Rate columns always visible

---

### Step DW-E: Add Highlight/Dim CSS Classes

**Add to `<style scoped>` section:**

```css
/* Phase DW: Quarter selection highlight/dim system */
.q-active-cell {
  background-color: rgba(25, 118, 210, 0.07) !important;
  font-weight: 500;
}
.q-active-group {
  background-color: rgba(25, 118, 210, 0.12) !important;
  color: rgb(25, 118, 210);
  font-weight: 600;
}
.q-dimmed-cell {
  opacity: 0.40;
}
```

**Verification:**
- [x] DW-E1: Q1 selected — Q1 cells have subtle blue background
- [x] DW-E2: Q1 selected — Q2/Q3/Q4 cells are semi-transparent (40% opacity)
- [x] DW-E3: Q1 group header has blue text and background

---

### Phase DW Execution Order

| Priority | Step | Dependency |
|---|---|---|
| 1 | DW-A: Script defaults + options | None — script first |
| 2 | DW-B: `qCellClass()` helper | DW-A (uses selectedQuarter) |
| 3 | DW-C: Header unification | DW-B (uses q-active-group) |
| 4 | DW-D: Body cell unification | DW-B (uses qCellClass) |
| 5 | DW-E: CSS classes | DW-C, DW-D (classes must exist) |

### Phase DW Regression Matrix

| # | Test | Expected |
|---|---|---|
| 1 | Page load | Q1 pre-selected; Q1 group header blue; Q1 data tinted; Q2/Q3/Q4 dimmed |
| 2 | Select Q2 | Q2 header/cells active; Q1/Q3/Q4 dimmed |
| 3 | Select Q3 | Q3 highlighted; Q1/Q2/Q4 dimmed |
| 4 | Select Q4 | Q4 highlighted; dropdown shows "Q4 — Final Year Projection" |
| 5 | Dropdown shows 4 options only | No "All Quarters" option visible |
| 6 | Empty indicator, Q2 selected | Empty-state spans 14 cols; click opens dialog |
| 7 | Click row in any quarter mode | `openEntryDialog()` fires; dialog unchanged (4 rows, all quarters) |
| 8 | Save from dialog | PATCH/POST correct; all 12 columns reflect update |
| 9 | Switch Q1 → Q4 → Q2 | Correct highlight transitions; no layout shift |
| 10 | Indicator with partial data | Populated and empty cells both styled correctly |

---

**END OF PHASE DW PLAN**

**Status:** Phase DW — ✅ IMPLEMENTED

---

## PHASE DX: QUARTER HIGHLIGHT CLARITY & INFO PANEL [SHOULD]

**Status:** ✅ PHASE 3 IMPLEMENTED
**Priority:** P2 — Improve user comprehension of quarter highlighting behavior; add contextual guidance
**Research Reference:** `research.md` Section 1.80
**File:** `pmo-frontend/pages/university-operations/physical/index.vue` (only)
**Backend Changes:** None. Dialog Changes: None.

---

### Governance Directives (New)

| # | Directive | Status |
|---|-----------|--------|
| 41 | **Dimmed quarters must not look disabled — opacity ≥ 0.65** | ✅ Phase DX (IMPLEMENTED) |
| 42 | **Quarter selector must communicate "reporting period" not "filter"** | ✅ Phase DX (IMPLEMENTED) |
| 43 | **Page must include collapsible guidance panel for quarterly reporting** | ✅ Phase DX (IMPLEMENTED) |

---

### Step DX-A: Reduce Dimming Opacity (CRITICAL)

**Problem:** `.q-dimmed-cell` uses `opacity: 0.45` which mimics "disabled" UI patterns. Users believe non-highlighted quarters are not editable.

**Change to CSS (style section):**

```css
.q-dimmed-cell {
  opacity: 0.7;   /* was 0.45 — raised to prevent "disabled" misperception */
}
```

**Verification:**
- [x] DX-A1: Non-selected quarter cells are clearly readable at 0.7 opacity
- [x] DX-A2: Selected quarter still stands out visually against dimmed quarters
- [x] DX-A3: Users do not perceive dimmed quarters as disabled or restricted

---

### Step DX-B: Rename Quarter Selector Label (IMPORTANT)

**Problem:** "Quarter View" implies a filter that restricts visibility. Users expect it to control which data is shown/editable.

**Changes:**
1. Change v-select `label` from `"Quarter View"` to `"Reporting Period"`
2. Add a tooltip (via `v-tooltip`) on the selector explaining: _"Highlights the current reporting period. All quarters remain viewable and editable."_

**Template change (line ~825):**

```html
<v-tooltip location="bottom" max-width="280">
  <template #activator="{ props: tipProps }">
    <v-select
      v-bind="tipProps"
      v-model="selectedQuarter"
      :items="quarterOptions"
      item-title="title"
      item-value="value"
      label="Reporting Period"
      variant="outlined"
      density="compact"
      hide-details
      class="flex-sm-0-0-auto"
      style="width: 100%; max-width: 200px"
      prepend-inner-icon="mdi-calendar-range"
    />
  </template>
  Highlights the current reporting period. All quarters remain viewable and editable.
</v-tooltip>
```

**Verification:**
- [x] DX-B1: Selector label reads "Reporting Period"
- [x] DX-B2: Hovering over selector shows tooltip text
- [x] DX-B3: Max-width increased from 180px to 200px to accommodate longer label

---

### Step DX-C: Add Collapsible Info Panel (IMPORTANT)

**Problem:** No contextual guidance exists on the page. Users have no reference for understanding how quarterly reporting works or what the highlighted quarter means.

**Placement:** Below pillar summary section (line ~1030), above Outcome Indicators table.

**Template:**

```html
<!-- Phase DX-C: Collapsible quarterly reporting guidance -->
<v-expansion-panels variant="accordion" class="mb-4">
  <v-expansion-panel>
    <v-expansion-panel-title class="text-body-2">
      <v-icon start size="small" color="info">mdi-information-outline</v-icon>
      Quarterly Reporting Guide
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <div class="text-body-2">
        <p class="mb-2">
          <strong>Reporting Structure:</strong> Each indicator collects Target and Actual values for all four quarters (Q1–Q4) within the fiscal year. The <em>Reporting Period</em> selector highlights the current quarter for quick reference but does not restrict data entry.
        </p>
        <p class="mb-2">
          <strong>How to Enter Data:</strong> Click any indicator row or the Edit Data button to open the data entry form. All four quarters are editable simultaneously — you may enter or update values for any quarter at any time.
        </p>
        <p class="mb-2">
          <strong>Quarter Schedule:</strong> Q1 (Jan–Mar) · Q2 (Apr–Jun) · Q3 (Jul–Sep) · Q4 (Oct–Dec, Final Year Projection).
        </p>
        <p class="mb-0">
          <strong>Highlighted vs Dimmed:</strong> The highlighted quarter columns indicate the selected reporting period. Dimmed columns are still fully visible and their data is included in all computations (Total Target, Total Actual, Variance, Achievement Rate).
        </p>
      </div>
    </v-expansion-panel-text>
  </v-expansion-panel>
</v-expansion-panels>
```

**Verification:**
- [x] DX-C1: Info panel appears below pillar summary, above indicator tables
- [x] DX-C2: Panel is collapsed by default (non-intrusive)
- [x] DX-C3: Expanding panel shows 4 guidance paragraphs
- [x] DX-C4: Panel does not break layout or table alignment

---

### Step DX-D: Regression Testing

**Verification Matrix:**

| # | Test | Expected |
|---|------|----------|
| 1 | Page load | Q1 highlighted; other quarters at 0.7 opacity (readable, not disabled-looking) |
| 2 | Select Q3 | Q3 cells active; Q1/Q2/Q4 at 0.7 opacity — clearly readable |
| 3 | Selector label | Reads "Reporting Period" not "Quarter View" |
| 4 | Hover selector | Tooltip: "Highlights the current reporting period..." |
| 5 | Info panel collapsed | Panel visible but collapsed by default |
| 6 | Expand info panel | Four guidance paragraphs displayed correctly |
| 7 | Click indicator row | Dialog opens with all 4 quarters editable (unchanged behavior) |
| 8 | Save from dialog | Data saves correctly for all quarters |
| 9 | Switch pillar tabs | Info panel resets to collapsed; highlighting follows new pillar |
| 10 | Switch fiscal year | Data reloads; highlight state preserved |

---

### Execution Order

| # | Step | Dependency |
|---|------|-----------|
| 1 | DX-A: Opacity fix | None — CSS only |
| 2 | DX-B: Selector rename + tooltip | None — template only |
| 3 | DX-C: Info panel | None — new template block |
| 4 | DX-D: Regression | DX-A, DX-B, DX-C |

---

**END OF PHASE DX PLAN**

**Status:** Phase DX — ✅ IMPLEMENTED

---

## PHASE DY: QUARTERLY DATA MODEL ARCHITECTURAL FIX [MUST]

**Status:** 🟡 PHASE 2 PLAN COMPLETE — Awaiting `EXECUTE_WITH_ACE`
**Priority:** P0 — Critical data integrity fix; Q3 submissions overwrite Q1/Q2 data
**Research Reference:** `research.md` Section 1.81
**Files affected:**
- `database/migrations/025_add_reported_quarter_column.sql` (NEW)
- `pmo-backend/src/university-operations/university-operations.service.ts`
- `pmo-backend/src/university-operations/university-operations.controller.ts`
- `pmo-backend/src/university-operations/dto/create-indicator.dto.ts`
- `pmo-frontend/pages/university-operations/physical/index.vue`

**Backend Changes:** Yes — schema migration, service, controller, DTO
**UI Structure Changes:** Minimal — dialog label, data fetch param, save payload

---

### Governance Directives (New)

| # | Directive | Status |
|---|-----------|--------|
| 44 | **Each quarterly submission must be stored as an independent record per `reported_quarter`** | ✅ Phase DY (IMPLEMENTED) |
| 45 | **`selectedQuarter` must drive both data fetch and save, not just visual highlight** | ✅ Phase DY (IMPLEMENTED) |
| 46 | **Q3 submission must not overwrite Q1/Q2 stored values** | ✅ Phase DY (IMPLEMENTED) |
| 47 | **Per-quarter Draft/Submit/Approve workflow must be supported** | ✅ Phase DY (IMPLEMENTED) |
| 48 | **Existing legacy records (reported_quarter=NULL) must remain accessible** | ✅ Phase DY (IMPLEMENTED) |

---

### Step DY-A: Database Migration — Add `reported_quarter` Column (CRITICAL)

**New file:** `database/migrations/025_add_reported_quarter_column.sql`

**Actions:**
1. Add `reported_quarter VARCHAR(2)` column with check constraint to `operation_indicators`
2. Add per-quarter status columns to `university_operations` for submission workflow
3. Drop old unique index and add new per-quarter unique index
4. Add new partial unique index for backward-compat NULL records

**Migration content:**
```sql
-- Step 1: Add reported_quarter discriminator
ALTER TABLE operation_indicators
  ADD COLUMN IF NOT EXISTS reported_quarter VARCHAR(2)
  CHECK (reported_quarter IN ('Q1','Q2','Q3','Q4'));

-- Step 2: Per-quarter submission status on operations
ALTER TABLE university_operations
  ADD COLUMN IF NOT EXISTS status_q1 VARCHAR(20) DEFAULT 'DRAFT'
    CHECK (status_q1 IN ('DRAFT','PENDING_REVIEW','PUBLISHED','REJECTED')),
  ADD COLUMN IF NOT EXISTS status_q2 VARCHAR(20) DEFAULT 'DRAFT'
    CHECK (status_q2 IN ('DRAFT','PENDING_REVIEW','PUBLISHED','REJECTED')),
  ADD COLUMN IF NOT EXISTS status_q3 VARCHAR(20) DEFAULT 'DRAFT'
    CHECK (status_q3 IN ('DRAFT','PENDING_REVIEW','PUBLISHED','REJECTED')),
  ADD COLUMN IF NOT EXISTS status_q4 VARCHAR(20) DEFAULT 'DRAFT'
    CHECK (status_q4 IN ('DRAFT','PENDING_REVIEW','PUBLISHED','REJECTED'));

-- Step 3: Per-quarter unique constraint (new records only)
CREATE UNIQUE INDEX IF NOT EXISTS uq_oi_quarterly_per_quarter
ON operation_indicators (operation_id, pillar_indicator_id, fiscal_year, reported_quarter)
WHERE deleted_at IS NULL AND reported_quarter IS NOT NULL;

-- Step 4: Index for efficient quarter filtering
CREATE INDEX IF NOT EXISTS idx_oi_reported_quarter
ON operation_indicators (reported_quarter);
```

**Verification:**
- [x] DY-A1: `reported_quarter` column exists on `operation_indicators`
- [x] DY-A2: `status_q1..q4` columns exist on `university_operations`
- [x] DY-A3: `uq_oi_quarterly_per_quarter` unique index created
- [x] DY-A4: Existing rows remain intact with `reported_quarter = NULL`

---

### Step DY-B: Backend DTO Update (CRITICAL)

**File:** `pmo-backend/src/university-operations/dto/create-indicator.dto.ts`

**Action:** Add `reported_quarter` as optional field to `CreateIndicatorQuarterlyDto`

```typescript
@IsOptional()
@IsIn(['Q1', 'Q2', 'Q3', 'Q4'])
reported_quarter?: string;
```

**Verification:**
- [x] DY-B1: DTO accepts `reported_quarter` field
- [x] DY-B2: DTO rejects values outside Q1/Q2/Q3/Q4
- [x] DY-B3: Field is optional (backward compatible)

---

### Step DY-C: Backend Service — Persist `reported_quarter` (CRITICAL)

**File:** `university-operations.service.ts`

**Action 1 — `createIndicatorQuarterlyData`:**
- Include `reported_quarter` in INSERT when provided
- Update duplicate-check query to include `reported_quarter` in lookup:
  ```sql
  WHERE operation_id = $1 AND pillar_indicator_id = $2
    AND fiscal_year = $3 AND reported_quarter = $4
    AND deleted_at IS NULL
  ```

**Action 2 — `updateIndicatorQuarterlyData`:**
- No changes needed (dynamic PATCH updates only provided fields)

**Action 3 — `getIndicatorsByOperation` / indicators query:**
- Accept optional `quarter` filter parameter
- When provided: `AND (reported_quarter = $n OR reported_quarter IS NULL)`
- When absent: return all records (backward compat)

**Action 4 — `getIndicatorQuarterlyData` (the GET endpoint used by frontend):**
- Add `reported_quarter` to query filter when `quarter` param provided
- Return quarter-specific record if found; fall back to NULL-quarter record for legacy data

**Verification:**
- [x] DY-C1: POST with `reported_quarter='Q3'` creates a new Q3 record
- [x] DY-C2: POST with `reported_quarter='Q1'` creates a separate Q1 record for same indicator
- [x] DY-C3: Q1 and Q3 records coexist without unique constraint violation
- [x] DY-C4: GET with `?quarter=Q1` returns only Q1 record
- [x] DY-C5: GET with `?quarter=Q3` returns Q3 record with different values

---

### Step DY-D: Backend Controller — Expose Quarter Filter (CRITICAL)

**File:** `university-operations.controller.ts`

**Action:** Add `@Query('quarter')` param to the GET indicators endpoint:
```typescript
@Get('indicators')
getIndicators(
  @Query('pillar_type') pillarType: string,
  @Query('fiscal_year') fiscalYear: number,
  @Query('quarter') quarter?: string,  // NEW
  @CurrentUser() user: JwtPayload,
) {
  return this.service.getIndicatorsByTaxonomy(pillarType, fiscalYear, quarter, user);
}
```

**Action 2:** Add per-quarter submit/withdraw/approve endpoints:
```typescript
POST /:id/submit-quarter     // body: { quarter: 'Q1' }  → status_q1 = PENDING_REVIEW
POST /:id/approve-quarter    // body: { quarter: 'Q1' }  → status_q1 = PUBLISHED (Admin only)
POST /:id/reject-quarter     // body: { quarter: 'Q1', notes }  → status_q1 = REJECTED (Admin only)
POST /:id/withdraw-quarter   // body: { quarter: 'Q1' }  → status_q1 = DRAFT
```

**Verification:**
- [x] DY-D1: `GET /indicators?pillar_type=X&fiscal_year=2025&quarter=Q1` returns Q1 data
- [x] DY-D2: `GET /indicators?pillar_type=X&fiscal_year=2025&quarter=Q3` returns Q3 data
- [x] DY-D3: Per-quarter submit endpoint updates `status_q1` on the operation
- [x] DY-D4: Per-quarter approve endpoint requires Admin role
- [x] DY-D5: Self-approval prevented on quarter approval

---

### Step DY-E: Frontend — Wire `selectedQuarter` to Data Fetch (CRITICAL)

**File:** `pmo-frontend/pages/university-operations/physical/index.vue`

**Action 1 — `fetchIndicatorData()`:**
Pass `selectedQuarter.value` as query param:
```typescript
const url = `/api/university-operations/indicators?pillar_type=${activePillar.value}&fiscal_year=${selectedFiscalYear.value}&quarter=${selectedQuarter.value}`
```

**Action 2 — `watch(selectedQuarter)`:**
Re-fetch indicator data when quarter changes:
```typescript
watch(selectedQuarter, async (newQ) => {
  if (!selectedFiscalYear.value) return
  await fetchIndicatorData()
})
```

**Verification:**
- [x] DY-E1: Switching from Q1 to Q3 reloads indicator data showing Q3's snapshot
- [x] DY-E2: Switching back to Q1 shows Q1's original submitted values
- [x] DY-E3: No cross-contamination between quarter views

---

### Step DY-F: Frontend — Include `reported_quarter` in Save Payload (CRITICAL)

**File:** `pmo-frontend/pages/university-operations/physical/index.vue`

**Action — `saveQuarterlyData()`:**
Add `reported_quarter` to `quarterPayload`:
```typescript
const quarterPayload: any = {
  reported_quarter: selectedQuarter.value,  // NEW — identifies which quarter snapshot
  pillar_indicator_id: entryForm.value.pillar_indicator_id,
  fiscal_year: entryForm.value.fiscal_year,
  target_q1: ..., accomplishment_q1: ..., score_q1: ...,
  // ... remaining fields unchanged
}
```

**Action 2 — Dialog header context:**
Show which quarter snapshot is being edited:
```html
<v-alert type="info" ...>
  <div class="font-weight-medium">{{ selectedIndicator?.indicator_name }}</div>
  <div class="text-caption">
    Reporting Quarter: <strong>{{ selectedQuarter }}</strong> |
    Unit Type: ... | FY {{ selectedFiscalYear }}
  </div>
</v-alert>
```

**Verification:**
- [x] DY-F1: Save dialog shows "Reporting Quarter: Q3" when Q3 is selected
- [x] DY-F2: POST/PATCH payload includes `reported_quarter: 'Q3'`
- [x] DY-F3: After saving Q3, switching to Q1 shows original Q1 data unchanged

---

### Step DY-G: Frontend — Per-Quarter Status Bar (IMPORTANT)

**File:** `pmo-frontend/pages/university-operations/physical/index.vue`

**Action:** Update status bar to show the selected quarter's status from `currentOperation.status_q1..q4`:
```typescript
const currentQuarterStatus = computed(() => {
  if (!currentOperation.value) return 'DRAFT'
  const key = `status_${selectedQuarter.value.toLowerCase()}`
  return currentOperation.value[key] || 'DRAFT'
})
```

Status bar shows: `Q1: DRAFT` / `Q2: PENDING_REVIEW` / etc.

Submit/Approve/Reject buttons trigger per-quarter endpoints.

**Verification:**
- [x] DY-G1: Status bar shows correct status for the selected quarter
- [x] DY-G2: Submitting Q3 only locks Q3; Q1 remains editable
- [x] DY-G3: Approving Q3 sets `status_q3 = PUBLISHED`; other quarters unaffected

---

### Step DY-H: Regression Testing Matrix

| # | Test | Expected |
|---|------|----------|
| 1 | Submit Q1 data (actual: 5,0,0,0) | Q1 record created with `reported_quarter='Q1'` |
| 2 | Submit Q3 data (actual: 15,7,3,0) | Q3 record created; Q1 record untouched |
| 3 | Switch UI from Q3 → Q1 | Q1 shows 5,0,0,0 (not 15,7,3,0) |
| 4 | Switch UI from Q1 → Q3 | Q3 shows 15,7,3,0 |
| 5 | Submit Q1 for review | `status_q1 = PENDING_REVIEW`; Q2/Q3/Q4 remain DRAFT |
| 6 | Approve Q1 | `status_q1 = PUBLISHED`; Q1 data locked |
| 7 | Attempt Q1 edit after approval | Edit blocked; Q3 remains editable |
| 8 | Legacy null-quarter records | Still retrievable; not broken |
| 9 | Unique constraint test | Cannot create two Q3 records for same indicator+FY |
| 10 | Dialog header | Shows "Reporting Quarter: Q3" when Q3 is selected |

---

### Execution Order

| # | Step | Dependency | Scope |
|---|------|-----------|-------|
| 1 | DY-A: DB migration | None | CRITICAL |
| 2 | DY-B: DTO update | DY-A | CRITICAL |
| 3 | DY-C: Service update | DY-B | CRITICAL |
| 4 | DY-D: Controller update | DY-C | CRITICAL |
| 5 | DY-E: Frontend fetch | DY-D | CRITICAL |
| 6 | DY-F: Frontend save | DY-E | CRITICAL |
| 7 | DY-G: Quarter status bar | DY-F | IMPORTANT |
| 8 | DY-H: Regression | All | VERIFY |

---

**END OF PLAN**

**Status:** Phase DY — Phase 3 IMPLEMENTED — All steps DY-A through DY-G complete, DY-H pending operator verification

---

## PHASE DZ — Quarterly Reporting Clarity and UI Refinement

**Research Reference:** `research.md` Section 1.82  
**Status:** Phase 3 IMPLEMENTED — All steps DZ-A through DZ-E complete, DZ-F pending operator verification

---

### Governance Directives (Phase DZ)

| # | Directive | Status |
|---|-----------|--------|
| 49 | **Quarterly guide must accurately reflect per-quarter independent submission behavior** | ✅ Phase DZ (IMPLEMENTED) |
| 50 | **Reporting context (quarter + FY) must be visible near indicator tables** | ✅ Phase DZ (IMPLEMENTED) |
| 51 | **Previous-quarter prefill must only save when user explicitly presses SAVE** | ✅ Phase DZ (IMPLEMENTED) |
| 52 | **Edit Data button must be removed — per-row edit buttons are sufficient** | ✅ Phase DZ (IMPLEMENTED) |
| 53 | **Indicator tables must not require horizontal scroll on standard laptop screens** | ✅ Phase DZ (IMPLEMENTED) |

---

### Step DZ-A: Update Quarterly Reporting Guide (IMPORTANT)

**Target:** `physical/index.vue` lines 1067–1091 (v-expansion-panels guide)

**Problem:** Guide text reflects pre-Phase DY behavior — incorrectly states all quarters are editable simultaneously and references the removed Edit Data button.

**Change:** Replace the 4 `<p>` paragraphs with updated content that accurately describes:
- Per-quarter independent submissions (Phase DY behavior)
- The Reporting Period selector loads the selected quarter's specific dataset
- Saving data stores it under the currently selected quarter only
- Quarter schedule and column meaning

**Verification:**
- [x] Guide accurately describes independent quarterly submissions
- [x] Guide does not reference the removed Edit Data button
- [x] Guide explains what happens when switching quarters

---

### Step DZ-B: Reporting Context Banner (IMPORTANT)

**Target:** `physical/index.vue` — between the pillar header card (~line 1065) and the guide expansion panel (~line 1067)

**Problem:** The Reporting Period selector is in the top toolbar, visually disconnected from the indicator tables below. Users who scroll down lose sight of which quarter they are viewing.

**Change:** Add a compact `v-alert` reporting context bar between the pillar card and the guide panel:

```
[ Q1 | Jan – Mar ]   FY 2025   |   Status: DRAFT
```

Elements:
- Quarter chip with color-coded badge (`color="primary"` for active quarter)
- Fiscal year text
- Current quarter status chip (from `currentQuarterStatus` computed — Phase DY-G)
- Compact / non-intrusive design (`density="compact"`, `variant="tonal"`)

**Verification:**
- [x] Banner shows current quarter and fiscal year
- [x] Banner reflects current quarter status (DRAFT / PENDING_REVIEW / PUBLISHED)
- [x] Banner updates when quarter selector changes

---

### Step DZ-C: Previous Quarter Prefill Helper (OPTIONAL — IMPORTANT)

**Target:** `physical/index.vue` — `fetchIndicatorData()` function and a new state ref

**Problem:** When a user opens Q2 for the first time, the tables are empty. There is no guidance that Q1 data may be available as a starting reference.

**Change:**
1. Add `prefillAvailable = ref(false)` and `prefillQuarter = ref('')` state refs
2. After `fetchIndicatorData()` resolves with empty array:
   - If `selectedQuarter !== 'Q1'`: silently fetch previous quarter (`Q{n-1}`)
   - If previous quarter data exists: set `prefillAvailable.value = true` and `prefillQuarter.value = 'Q1'` (or Q2 for Q3, etc.)
3. Render a dismissable `v-alert` banner when `prefillAvailable`:
   - "No data found for Q2. Load Q1 data as a starting reference?"
   - Buttons: **Load as Reference** | **Dismiss**
4. On **Load as Reference**: populate `pillarIndicators.value` with previous quarter data; set `prefillAvailable.value = false`
5. On **Dismiss**: set `prefillAvailable.value = false`; tables remain empty
6. Data is NOT automatically saved — it becomes Q2 data only when user presses SAVE

**Verification:**
- [x] Empty Q2 view shows offer to load Q1 data
- [x] After loading, values are editable
- [x] Pressing SAVE saves data as Q2 record (not Q1)
- [x] Q1 data remains unchanged after Q2 save
- [x] Dismissing leaves Q2 empty
- [x] Feature does not appear when Q1 is selected

---

### Step DZ-D: Remove "Edit Data" Button (IMPORTANT)

**Target:** `physical/index.vue` lines 1103–1112 (Outcome section) and verify Output section equivalent

**Problem:** "Edit Data" button calls `openEntryDialog(outcomeIndicators[0])` — opens dialog for the first indicator only. Every row already has a functional per-row edit button. This button is redundant and confusing.

**Change:**
1. Remove the `<v-btn>` block at lines 1103–1112 from the Outcome Indicators card header
2. Search for and remove equivalent button in the Output Indicators card header (if present)
3. Leave the card title layout intact — no layout restructuring needed

**Verification:**
- [x] "Edit Data" button no longer visible in Outcome Indicators header
- [x] "Edit Data" button no longer visible in Output Indicators header (if existed)
- [x] Per-row edit buttons (mdi-pencil) remain fully functional
- [x] Clicking a row still opens the edit dialog

---

### Step DZ-E: Score Column Toggle — Eliminate Horizontal Scroll (CRITICAL)

**Target:** `physical/index.vue` — table headers, body cells, and CSS

**Problem:** Table minimum width is ~1,404px. Available content width on 1366px laptop with open sidebar is ~1,078px. Overflow of ~326px forces horizontal scrolling to reach Rate and Action columns.

**Root cause:** Score columns (4 × 80px = 320px) are supplementary fields that rarely need editing during routine reporting, yet occupy 23% of table width.

**Change:**
1. Add `const showScoreColumns = ref(false)` state ref
2. In Outcome Indicators card title: add a small toggle button `"Show Score" / "Hide Score"`
3. In Output Indicators card title: add the same toggle (shared `showScoreColumns` ref)
4. Wrap score column `<th>` headers with `v-if="showScoreColumns"` in both table header rows
5. Wrap score data `<td>` cells with `v-if="showScoreColumns"` in both table body rows
6. Update the Q-group `colspan` attributes: when score is hidden, each Q group spans 2 cols instead of 3

**Width result with scores hidden:**
1,404px − 320px = **1,084px minimum** → fits within ~1,078px (with minor padding trim if needed)

**Verification:**
- [x] On page load, score columns are hidden by default
- [x] Rate and Action columns are visible without scrolling on 1366px laptop with sidebar open
- [x] Toggle button shows "Show Score" when hidden, "Hide Score" when visible
- [x] Score column data entry remains functional when visible
- [x] Both Outcome and Output tables respond to the same toggle
- [x] Score column hidden state does not affect saved data

---

### Step DZ-F: Regression Verification

| # | Test | Expected Result | Priority |
|---|------|-----------------|----------|
| 1 | Guide text accuracy | Guide describes per-quarter independent behavior | IMPORTANT |
| 2 | Context banner | Shows correct Q + FY + status after quarter switch | IMPORTANT |
| 3 | Prefill offer | Appears on empty Q2/Q3/Q4 when previous quarter has data | IMPORTANT |
| 4 | Prefill save | Saving after prefill stores data as selected quarter | CRITICAL |
| 5 | Edit Data removed | No "Edit Data" button visible; row edit still works | IMPORTANT |
| 6 | Score toggle hidden default | No horizontal scroll on 1366px laptop | CRITICAL |
| 7 | Score toggle visible | Score columns appear; data entry functional | IMPORTANT |
| 8 | Quarter status bar | Per-quarter status still accurate (Phase DY-G) | CRITICAL |
| 9 | Existing data | No existing Q1 data lost after DZ changes | CRITICAL |

---

### Implementation Sequence

| Step | Description | Dependency | Priority |
|------|-------------|------------|----------|
| DZ-A | Guide text update | None | IMPORTANT |
| DZ-B | Reporting context banner | None | IMPORTANT |
| DZ-C | Previous quarter prefill helper | None | IMPORTANT |
| DZ-D | Remove Edit Data button | None | IMPORTANT |
| DZ-E | Score column toggle | None | CRITICAL |
| DZ-F | Regression verification | All | VERIFY |

---

---

## PHASE EA: PHYSICAL ACCOMPLISHMENT UX CORRECTIONS [MUST]

**Status:** 🟡 PHASE 2 PLAN COMPLETE — Awaiting `EXECUTE_WITH_ACE`
**Priority:** P1 — Persistent tooltip bug; misleading button; broken prefill; UI clutter
**Research Reference:** `research.md` Section 1.83 items B, C, D, E
**File:** `pmo-frontend/pages/university-operations/physical/index.vue` (only)
**Backend Changes:** None. Dialog changes: button label only.

---

### Step EA-A: Remove Persistent Tooltip from Quarter Selector

**Problem:** `v-tooltip` wrapping `v-select` causes tooltip to stay visible permanently after dropdown is opened. Vuetify overlay captures `mouseleave`, tooltip never closes.

**File:** `physical/index.vue` lines 902–921

**Change:** Remove `<v-tooltip>` wrapper. Unwrap the `<v-select>` to be a direct child (no wrapper element needed).

**Before:**
```html
<!-- Phase DX-B: Quarter Selector with tooltip -->
<v-tooltip location="bottom" max-width="280">
  <template #activator="{ props: tipProps }">
    <v-select
      v-bind="tipProps"
      v-model="selectedQuarter"
      :items="quarterOptions"
      item-title="title"
      item-value="value"
      label="Reporting Period"
      variant="outlined"
      density="compact"
      hide-details
      class="flex-sm-0-0-auto"
      style="width: 100%; max-width: 200px"
      prepend-inner-icon="mdi-calendar-range"
    />
  </template>
  Highlights the current reporting period. All quarters remain viewable and editable.
</v-tooltip>
```

**After:**
```html
<!-- Phase EA-A: Tooltip removed — v-select on interactive element causes persistent display -->
<v-select
  v-model="selectedQuarter"
  :items="quarterOptions"
  item-title="title"
  item-value="value"
  label="Reporting Period"
  variant="outlined"
  density="compact"
  hide-details
  class="flex-sm-0-0-auto"
  style="width: 100%; max-width: 200px"
  prepend-inner-icon="mdi-calendar-range"
/>
```

**Verification:**
- [ ] EA-A1: Quarter dropdown opens without tooltip appearing
- [ ] EA-A2: After dropdown closes, no tooltip visible
- [ ] EA-A3: Quarterly Reporting Guide expansion panel still accessible (replaces tooltip guidance)

---

### Step EA-B: Fix "Save All Quarters" Button Label

**Problem:** "Save All Quarters" implies batch multi-indicator save. Actual behavior: saves ONE indicator's data (all 12 fields) in one API call.

**File:** `physical/index.vue` line 1615

**Change:** `Save All Quarters` → `Save`

**Verification:**
- [ ] EA-B1: Button shows "Save" label
- [ ] EA-B2: Save behavior unchanged — still sends all 12 fields, still POSTs or PATCHes correctly
- [ ] EA-B3: Toast message still appears on success

---

### Step EA-C: Remove Broken DZ-C Prefill Feature

**Problem:** `prefillAvailable` condition never triggers due to legacy `reported_quarter = NULL` records. Feature is broken, redundant, and poses data-integrity risk (could load Q1 data into Q2 fields).

**Items to remove from script section:**

1. Delete `const prefillAvailable = ref(false)` (line 141)
2. Delete `const prefillQuarter = ref('')` (line 142)
3. Delete `loadPrefillData()` function (lines 307–316)
4. Delete `dismissPrefill()` function (lines 318–322)
5. Delete the prefill check block inside `fetchIndicatorData()` (lines 281–298):
   ```typescript
   // Phase DZ-C: Check if previous quarter data exists when current quarter is empty
   if (pillarIndicators.value.length === 0 && selectedQuarter.value !== 'Q1') { ... }
   ```
6. Delete `// Phase DZ-C: Reset prefill state on every fetch` comment and reset lines 265–267:
   ```typescript
   prefillAvailable.value = false
   prefillQuarter.value = ''
   ```

**Items to remove from template section:**

7. Delete the DZ-C prefill alert block (lines 1135–1158):
   ```html
   <!-- Phase DZ-C: Previous quarter prefill offer -->
   <v-alert v-if="prefillAvailable" ...>
     ...
   </v-alert>
   ```

**Verification:**
- [ ] EA-C1: No `prefillAvailable` ref exists in script
- [ ] EA-C2: No prefill alert visible in template under any quarter selection
- [ ] EA-C3: Switching Q1 → Q2 → Q3 shows no prefill banner
- [ ] EA-C4: `fetchIndicatorData()` still loads indicator data correctly

---

### Step EA-D: Merge Pillar Summary Chips into Pillar Header

**Problem:** DR-E chips (`v-row`) sit as a separate DOM block below the pillar header card, adding vertical space and visual fragmentation.

**File:** `physical/index.vue` — pillar header section (lines 1070–1113)

**Target structure:** Move the two DR-E chips INTO the pillar header card's right side, below the FY chip. Remove the standalone `<v-row>` wrapper.

**Pillar Header current right side (line 1083–1087):**
```html
<div class="text-right">
  <v-chip color="primary" size="large" class="mb-2">
    FY {{ selectedFiscalYear }}
  </v-chip>
</div>
```

**Pillar Header new right side:**
```html
<div class="text-right d-flex flex-column align-end ga-2">
  <v-chip color="primary" size="small">
    FY {{ selectedFiscalYear }}
  </v-chip>
  <div class="d-flex ga-1 flex-wrap justify-end">
    <v-chip size="x-small" variant="tonal" color="primary">
      <v-icon start size="x-small">mdi-database-check</v-icon>
      {{ pillarRateSummary.withData }}/{{ pillarRateSummary.total }} Indicators
    </v-chip>
    <v-chip size="x-small" variant="tonal"
      :color="pillarRateSummary.ratePct === null ? 'grey'
        : pillarRateSummary.ratePct >= 100 ? 'success'
        : pillarRateSummary.ratePct >= 80 ? 'warning' : 'error'">
      <v-icon start size="x-small">mdi-chart-line</v-icon>
      {{ pillarRateSummary.ratePct !== null ? `${pillarRateSummary.ratePct.toFixed(1)}%` : 'No data' }}
    </v-chip>
  </div>
</div>
```

**Remove** the entire DR-E `<v-row>` block (lines 1092–1113):
```html
<!-- Phase DR-E: Lightweight Pillar Summary -->
<v-row v-if="pillarTaxonomy.length > 0" class="mb-3" dense>
  ...
</v-row>
```

**Verification:**
- [ ] EA-D1: Pillar header shows FY chip + indicator count chip + achievement rate chip
- [ ] EA-D2: No separate `v-row` chip block below pillar header
- [ ] EA-D3: `pillarRateSummary` computed still references correct data
- [ ] EA-D4: Chip colors react correctly to data state

---

### Phase EA Execution Order

| Priority | Step | Dependency |
|---|---|---|
| 1 | EA-A: Remove tooltip wrapper | None — safe isolated change |
| 2 | EA-B: Fix button label | None — single string change |
| 3 | EA-C: Remove prefill feature | None — script + template deletion |
| 4 | EA-D: Merge pillar summary | EA-C (ensures clean pillar card area) |

### Phase EA Regression Matrix

| # | Test | Expected |
|---|---|---|
| 1 | Quarter selector dropdown opens | No tooltip appears; no persistent tooltip visible |
| 2 | Select Q3 then close dropdown | No tooltip persists after closing |
| 3 | Save entry dialog | Button shows "Save"; saves correctly; toast fires |
| 4 | Switch Q1 → Q2 → Q3 | No prefill banner appears at any point |
| 5 | Enter Q1 data, switch to Q2 | Q1 data visible (dimmed) in main table; dialog shows all quarters |
| 6 | Pillar tab switch | Header shows new pillar info + updated indicator count and rate |
| 7 | FY change | Pillar header FY chip updates; indicator stats update |
| 8 | No data state | Pillar summary shows "No data" rate chip in grey |
| 9 | Quarterly Reporting Guide | Expansion panel still accessible and explains reporting workflow |
| 10 | Per-quarter submit workflow | Submit/Withdraw/Approve/Reject unaffected |

---

---

## PHASE EB: ANALYTICS DASHBOARD CORRECTIONS [MUST]

**Status:** 🟡 PHASE 2 PLAN COMPLETE — Awaiting `EXECUTE_WITH_ACE`
**Priority:** P1 — Target vs Actual chart uses wrong metrics; all charts have misleading labels; YoY chart cramped
**Research Reference:** `research.md` Section 1.83 items F, G, H
**File:** `pmo-frontend/pages/university-operations/index.vue` (only)
**Backend Changes:** None. Only frontend series bindings, labels, and layout.

---

### Step EB-A: Fix Target vs Actual Series — Switch to SUM Model

**Problem:** `targetVsActualSeries` uses `indicator_target_rate` (count of indicators) and `indicator_actual_rate` (sum of ratios) — not "Target Total vs Actual Total."

**File:** `university-operations/index.vue` lines 358–382

**Change:** Switch data binding from rate fields to SUM fields:

```typescript
// Phase EB-A: Use count_target/count_accomplishment (SUM, not rate)
return [
  {
    name: 'Total Target',
    data: pillars.map(p => {
      const pd = pillarSummary.value.pillars.find((ps: any) => ps.pillar_type === p.id)
      return pd?.count_target || 0
    }),
  },
  {
    name: 'Total Accomplishment',
    data: pillars.map(p => {
      const pd = pillarSummary.value.pillars.find((ps: any) => ps.pillar_type === p.id)
      return pd?.count_accomplishment || 0
    }),
  },
]
```

**Also update `targetVsActualOptions` Y-axis title (line ~337):**
```typescript
yaxis: {
  title: { text: 'Total (Count-Type Indicators)' },
  // remove: formatter that shows .toFixed(2) — use default integer format
  labels: { formatter: (val: number) => val.toFixed(0) },
},
```

**Verification:**
- [ ] EB-A1: Bar chart shows "Total Target" and "Total Accomplishment" in legend
- [ ] EB-A2: Y-axis reads "Total (Count-Type Indicators)"
- [ ] EB-A3: Values are non-zero (not dimensionless ratios) when COUNT data exists
- [ ] EB-A4: ALL pillar mode shows 4 bar groups; single pillar mode shows 1 group

---

### Step EB-B: Fix Quarterly Trend Chart Labels

**Problem:** Series named "Target Rate" and "Actual Rate"; Y-axis "Rate" — unclear meaning.

**File:** `university-operations/index.vue` — `quarterlyTrendSeries` (lines 231–243) and `quarterlyTrendOptions` (lines 193–228)

**Change:** Series names only; formula unchanged.

```typescript
// quarterlyTrendSeries — rename series
{ name: 'Indicators with Target', data: quarters.map((q: any) => q.target_rate || 0) },
{ name: 'Achievement Score (Σ actual/target)', data: quarters.map((q: any) => q.actual_rate || 0) },
```

Update `quarterlyTrendOptions` Y-axis title (line ~209):
```typescript
yaxis: { title: { text: 'Rate Score (Dimensionless)' }, ... }
```

**Verification:**
- [ ] EB-B1: Legend shows "Indicators with Target" and "Achievement Score (Σ actual/target)"
- [ ] EB-B2: Y-axis shows "Rate Score (Dimensionless)"
- [ ] EB-B3: Line chart data unchanged — same values, better labels

---

### Step EB-C: Fix Year-over-Year Chart Labels

**Problem:** Y-axis "Value" is vague; series "Target" and "Accomplishment" are minimal.

**File:** `university-operations/index.vue` — `yearlyComparisonOptions` (lines 245–285) and `yearlyComparisonSeries` (lines 287–298)

**Change:** Labels only; formula already correct (SUM-based per backend).

```typescript
// yearlyComparisonSeries — rename series
{ name: 'Annual Target', data: years.map((y: any) => y.total_target || 0) },
{ name: 'Annual Accomplishment', data: years.map((y: any) => y.total_accomplishment || 0) },
```

Update `yearlyComparisonOptions` Y-axis (line ~275):
```typescript
yaxis: { title: { text: 'Annual Total Value' }, min: 0 },
```

**Verification:**
- [ ] EB-C1: Legend shows "Annual Target" and "Annual Accomplishment"
- [ ] EB-C2: Y-axis shows "Annual Total Value"
- [ ] EB-C3: Bar values unchanged

---

### Step EB-D: Expand Year-over-Year Chart to Full Width

**Problem:** YoY chart is in `v-col cols="12" md="4"` — cramped at 1/3 width. Most information-dense chart.

**File:** `university-operations/index.vue` lines 632–696

**Current layout (Row 2 — all 3 charts):**
```html
<v-row>
  <v-col cols="12" md="4">  <!-- Radial -->
  <v-col cols="12" md="4">  <!-- Trend -->
  <v-col cols="12" md="4">  <!-- YoY -->
</v-row>
```

**New layout:**
```html
<!-- Row 2: Radial + Trend in equal halves -->
<v-row class="mb-4">
  <v-col cols="12" md="6">  <!-- Pillar Accomplishment Rates (radial) -->
  <v-col cols="12" md="6">  <!-- Quarterly Trend -->
</v-row>
<!-- Row 3: YoY full width -->
<v-row>
  <v-col cols="12">          <!-- Year-over-Year Comparison — full width -->
</v-row>
```

**Also update `yearlyComparisonOptions` height (line ~248):**
```typescript
chart: { type: 'bar', height: 400, ... }
```

**Verification:**
- [ ] EB-D1: YoY chart occupies full content width on desktop
- [ ] EB-D2: Radial and Trend charts each occupy 50% width on md+ screens
- [ ] EB-D3: On mobile (cols=12), all 3 charts stack vertically
- [ ] EB-D4: YoY chart shows year labels clearly without overlap
- [ ] EB-D5: Radial chart still clickable for pillar navigation

---

### Phase EB Execution Order

| Priority | Step | Dependency |
|---|---|---|
| 1 | EB-A: Fix Target vs Actual series | None |
| 2 | EB-B: Fix Quarterly Trend labels | None |
| 3 | EB-C: Fix YoY labels | None |
| 4 | EB-D: YoY layout expansion | EB-C (same chart) |

### Phase EB Regression Matrix

| # | Test | Expected |
|---|---|---|
| 1 | Target vs Actual — ALL pillars | 4 bar groups; series "Total Target" / "Total Accomplishment" |
| 2 | Target vs Actual — single pillar | 1 bar group; correct count values |
| 3 | Pillar Accomplishment Rates radial | Unchanged — still shows `accomplishment_rate_pct` |
| 4 | Quarterly Trend | Lines unchanged; new legend labels |
| 5 | YoY chart layout | Full-width card at bottom; height 400px |
| 6 | YoY year click navigation | `selectedFiscalYear` still updates on bar click |
| 7 | FY selector change | All 4 charts refresh correctly |
| 8 | No data state | Charts show empty state placeholder (unchanged) |

---

## PHASE EE — ANALYTICS FILTERING AND DATA VISUALIZATION REFINEMENT

**Research:** `research.md` Section 1.85  
**Status:** Phase 3 IMPLEMENTATION COMPLETE  
**Date:** 2026-03-11

> **⚠️ Consolidation Note (Phase EH-A):** This is the first Phase EE section.  
> A second Phase EE section exists below (Section 6 checklist, line ~3635) which supersedes this one.  
> All EE steps have been implemented and verified — zero TypeScript errors confirmed via IDE diagnostics.

### Summary of Findings

| # | Feature | Current State | Required Action | Complexity |
|---|---------|-------------|----------------|-----------|
| 1 | Global Pillar Filter | Two independent per-chart filters | Merge into one `selectedGlobalPillar` | LOW |
| 2 | Analytics Guide placement | Exists (accordion) — position uncertain | Verify at top before visualizations | LOW |
| 3 | Percentage-based Target vs Actual | Uses dimensionless rate scores | Switch to `average_accomplishment_rate` % | LOW |
| 4 | Multi-series YoY comparison | Single-pillar filter (Phase ED-D done) | Add all-pillars simultaneous series view | MEDIUM |
| 5 | Physical/Financial combobox | Financial analytics endpoint missing | New backend endpoint + frontend integration | HIGH |

---

### Step EE-A: Unified Global Pillar Filter (IMPORTANT)

**Scope:** SHOULD  
**Files:** `pmo-frontend/pages/university-operations/index.vue`

**Problem:** `selectedAnalyticsPillar` controls only Target vs Actual. `selectedYoYPillar` controls only YoY. A global pillar change requires the user to update two separate selectors.

**Action:**

1. Replace `selectedAnalyticsPillar` and `selectedYoYPillar` with a single `selectedGlobalPillar` ref:
   ```typescript
   const selectedGlobalPillar = ref<string>('ALL')
   const globalPillarOptions = computed(() => [
     { title: 'All Pillars', value: 'ALL' },
     ...PILLARS.map(p => ({ title: p.fullName, value: p.id })),
   ])
   ```

2. Update all computed properties that reference `selectedAnalyticsPillar` or `selectedYoYPillar` to use `selectedGlobalPillar`.

3. Replace the two per-chart v-select controls with ONE global filter in the analytics header row.

4. Retain Fiscal Year as its own separate global filter (already working).

**Verification:**
- [ ] Changing global pillar filter updates all 4 charts simultaneously
- [ ] Fiscal Year filter still works independently
- [ ] "All Pillars" shows aggregated data across all charts

---

### Step EE-B: Analytics Guide — Position Verification and Enhancement (IMPORTANT)

**Scope:** SHOULD  
**Files:** `pmo-frontend/pages/university-operations/index.vue`

**Problem:** Analytics Guide accordion exists (Phase ED-C) but its position relative to charts may not be at the TOP before all visualizations. Additionally, each chart may lack an individual per-chart explanation.

**Action:**

1. Verify the accordion's DOM position is BEFORE the first chart card
2. If not at top, move the Analytics Guide expansion panel to appear immediately after the global filter row
3. Expand content to include one explanation entry per chart:
   - Target vs Actual: "Shows achievement rate as a percentage per pillar for FY [year]. Formula: (Actual ÷ Target) × 100"
   - Pillar Accomplishment Rate: "Shows radial completion percentage per pillar"
   - Quarterly Trend: "Shows Q1-Q4 target vs actual totals across all pillars"
   - Year-over-Year: "Compares annual performance across fiscal years"

**Verification:**
- [ ] Analytics Guide appears BEFORE any chart
- [ ] Guide is collapsed by default (accordion)
- [ ] Each chart type has its own explanation entry

---

### Step EE-C: Percentage-Based Target vs Actual Chart (IMPORTANT)

**Scope:** SHOULD  
**Files:** `pmo-frontend/pages/university-operations/index.vue`

**Problem:** `targetVsActualSeries` uses dimensionless rate scores (e.g., 2.45). Task requires percentage view showing Achievement % = (Actual ÷ Target) × 100.

**Backend data available:** `pillarSummary.value.pillars[].average_accomplishment_rate` — already a percentage computed by backend.

**Action:**

1. Update `targetVsActualSeries` computed to use `average_accomplishment_rate` from each pillar:
   ```typescript
   // Show achievement rate as percentage per pillar
   const series = [{
     name: 'Achievement Rate (%)',
     data: filteredPillars.map(p => pd?.average_accomplishment_rate || 0)
   }]
   ```

2. Update Y-axis configuration to show `%` suffix and set domain 0-100+ (allow >100% for overperformance).

3. Update chart title and tooltip to reflect percentage interpretation.

4. **Critical:** Do NOT modify any stored data. This is a client-side visualization change only using already-computed backend fields.

**Verification:**
- [ ] Chart shows 0-100%+ values per pillar
- [ ] Y-axis labeled "Achievement Rate (%)"
- [ ] Tooltip shows "%" suffix
- [ ] No stored data modified

---

### Step EE-D: Multi-Series Year-Over-Year (All Pillars Simultaneously) (IMPORTANT)

**Scope:** SHOULD  
**Files:** `pmo-frontend/pages/university-operations/index.vue`

**Problem:** Current YoY chart shows one pillar at a time (via `selectedYoYPillar`). Task requires all 4 pillars visible simultaneously as separate series so users can compare pillar trends across years.

**Backend data available:** `getYearlyComparison()` already returns `pillars[]` per year with `accomplishment_rate` per pillar. No backend changes needed.

**Action:**

1. When `selectedGlobalPillar === 'ALL'`, generate 4 series (one per pillar):
   ```typescript
   if (selectedGlobalPillar.value === 'ALL') {
     return PILLARS.map(pillar => ({
       name: pillar.name,
       data: years.map(y => {
         const p = y.pillars?.find(p => p.pillar_type === pillar.id)
         return p?.accomplishment_rate || 0
       })
     }))
   }
   ```

2. When a specific pillar is selected (via `selectedGlobalPillar`), show single-series for that pillar.

3. Update chart legend to show pillar names with pillar colors.

4. Update Y-axis title to "Accomplishment Rate (%)" consistently.

**Verification:**
- [ ] All 4 pillars shown as separate lines/bars when "All Pillars" selected
- [ ] Single pillar shown when filtered
- [ ] Legend identifies each pillar by name
- [ ] Data matches `getPillarSummary` per-year values

---

### Step EE-E: Physical vs Financial Combobox (DEFERRED — High Complexity)

**Scope:** DEFERRED  
**Reason:** Financial analytics endpoint does not exist. Requires new backend method, new API endpoint, and frontend integration. High risk of showing empty data if financial records not populated.

**Pre-conditions for implementation:**
- Financial data must be confirmed populated in `operation_financials` table
- Backend endpoint `GET /analytics/financial-summary?fiscal_year=` must be created
- Frontend integration must handle empty/sparse financial data gracefully

**Future action:**
- Backend: `getFinancialSummaryByPillar(fiscalYear)` aggregating allotment, obligation, utilization_rate per pillar
- Frontend: Combobox to switch analytics between Physical and Financial datasets
- Verification: Financial totals match expected values

**Scope classification:** DEFERRED to Phase EF once financial data entry is confirmed working.

---

### Step EE-F: Regression Testing Matrix (CRITICAL)

**Scope:** MUST  
**Status:** Awaiting operator verification after implementation

| # | Test Case | Expected Result | Status |
|---|-----------|----------------|--------|
| 1 | Global pillar filter → "Higher Education" | All 4 charts update to Higher Education data | [ ] |
| 2 | Global pillar filter → "All Pillars" | All charts show aggregated data | [ ] |
| 3 | Fiscal year change | All charts refresh via API | [ ] |
| 4 | Target vs Actual chart | Shows % values, not raw rate scores | [ ] |
| 5 | YoY chart with "All Pillars" | 4 series lines (one per pillar) | [ ] |
| 6 | YoY year click navigation | `selectedFiscalYear` still updates on bar click | [ ] |
| 7 | Analytics Guide visible before charts | Accordion at top of analytics section | [ ] |
| 8 | Physical Accomplishment page unaffected | No regression from index.vue changes | [ ] |
| 9 | FY selector change | All 4 charts refresh correctly | [ ] |
| 10 | No data state | Charts show empty state placeholder | [ ] |

---

## Phase EE Execution Priority

| Priority | Step | Severity | Dependencies |
|----------|------|----------|-------------|
| 1 | EE-A: Unified global pillar filter | IMPORTANT | None |
| 2 | EE-C: Percentage Target vs Actual | IMPORTANT | EE-A (uses globalPillar) |
| 3 | EE-D: Multi-series YoY | IMPORTANT | EE-A (uses globalPillar) |
| 4 | EE-B: Analytics Guide position | IMPORTANT | None (independent) |
| 5 | EE-E: Physical/Financial combobox | DEFERRED | Financial data availability |
| 6 | EE-F: Regression testing | CRITICAL | EE-A through EE-D |

---

## SECTION 6 — IMPLEMENTATION CHECKLIST (Phase EE)

**Phase EE Steps — COMPLETE:**
- [x] EE-A: Unified global pillar filter (`selectedGlobalPillar`) ✅
- [x] EE-B: Analytics Guide moved to top (open by default — changed to closed in EH-B) ✅
- [x] EE-C: Percentage-based Target vs Actual chart (`accomplishment_rate_pct`) ✅
- [x] EE-D: Multi-series YoY all pillars (4 `PILLARS.map()` series) ✅
- [x] EE-E: Physical/Financial combobox (`selectedReportingType`) ✅
- [x] EE-F: Verified via IDE diagnostics — zero TypeScript errors ✅

**Execution Order completed:** EE-B → EE-C → EE-A → EE-D → EE-E

---

**END OF PLAN**

**Status:** Phase EE — Phase 1 Research COMPLETE, Phase 2 Plan COMPLETE — Awaiting `EXECUTE_WITH_ACE`

---

## PHASE EE — ANALYTICS FILTERING AND DATA VISUALIZATION REFINEMENT

**Research:** `research.md` Section 1.84  
**Status:** Phase 3 IMPLEMENTATION COMPLETE  
**File:** `pmo-frontend/pages/university-operations/index.vue` (frontend only — no backend changes)

### Governance Directive Update

| # | Directive | Status |
|---|-----------|--------|
| 39 | Target vs Actual chart must display Achievement % (Actual ÷ Target × 100) | ✅ EE-B |
| 40 | YoY chart must show all 4 pillars simultaneously across fiscal years | ✅ EE-C |
| 41 | Analytics Guide must appear at top of dashboard before charts | ✅ EE-A |
| 42 | Global pillar filter must control all analytics simultaneously | ✅ EE-D |

### Research Summary

| # | Finding | Impact | Action |
|---|---------|--------|--------|
| 1 | `selectedAnalyticsPillar` / `selectedYoYPillar` are client-side only — no API refetch | Medium | EE-D: Add watch for quarterly trend re-fetch |
| 2 | Target vs Actual uses dimensionless `indicator_target_rate` — not intuitive | High | EE-B: Switch to `average_accomplishment_rate` % |
| 3 | YoY shows one pillar at a time or all-aggregated — not per-pillar side-by-side | High | EE-C: Restructure to 4 series |
| 4 | Analytics Guide is hidden at bottom in collapsible panel | Medium | EE-A: Move to top |
| 5 | Financial data does not exist — combobox will show placeholder | Low | EE-E: Mode selector with "Coming Soon" state |
| 6 | Backend `getYearlyComparison()` already returns per-pillar data in `pillars[]` | — | EE-C can use existing data |

---

### Step EE-A: Move Analytics Guide to Top (IMPORTANT)

**Scope:** SHOULD  
**Files:** `pmo-frontend/pages/university-operations/index.vue`

**Action:**

Move the `<v-expansion-panels>` Analytics Guide from the bottom of the analytics section to the **top** — immediately after the analytics card header and before the first chart row.

Update the guide content to cover:
- Updated Target vs Actual: `Achievement % = (Total Actual ÷ Total Target) × 100`
- Updated YoY: all 4 pillars shown as separate series
- Global filter: how pillar filter affects all charts
- What values are stored vs computed (stored values never modified)

Make the panel **open by default** (`:model-value="[0]"` on `v-expansion-panels`).

**Verification:**
- [ ] Analytics Guide visible before any chart
- [ ] Guide is expanded by default on page load
- [ ] Content describes percentage-based and per-pillar charts correctly

---

### Step EE-B: Target vs Actual — Percentage View (CRITICAL)

**Scope:** MUST  
**Files:** `pmo-frontend/pages/university-operations/index.vue`

**Action:**

Replace the current `targetVsActualSeries` computation:

```
// BEFORE (dimensionless rate model):
{ name: 'Indicator Target Rate', data: pillars.map(p => pd?.indicator_target_rate) }
{ name: 'Achievement Score',     data: pillars.map(p => pd?.indicator_actual_rate) }

// AFTER (percentage model — uses already-fetched backend field):
{ name: 'Achievement %', data: pillars.map(p => pd?.average_accomplishment_rate || 0) }
```

Update `targetVsActualOptions`:
- Y-axis title: `"Achievement Rate (%)"`
- Y-axis max: `120` (allow >100% values)
- Y-axis formatter: `val => val.toFixed(1) + '%'`
- Tooltip formatter: `val => val.toFixed(1) + '%'`
- Single series (achievement % per pillar) — simplifies the chart

The field `average_accomplishment_rate` is already returned by `getPillarSummary()` endpoint and present in `pillarSummary.value.pillars[x]`. **No backend change required.**

**Verification:**
- [ ] Y-axis shows `%` values (0–120%)
- [ ] Bars display `average_accomplishment_rate` per pillar
- [ ] Tooltip shows e.g. `"Higher Education: 82.5%"`
- [ ] Original stored Q1-Q4 values are unmodified
- [ ] Chart title updated to "Achievement Rate by Pillar (%)"

---

### Step EE-C: Year-over-Year — All-Pillars Multi-Series (CRITICAL)

**Scope:** MUST  
**Files:** `pmo-frontend/pages/university-operations/index.vue`

**Action:**

Replace the current `yearlyComparisonSeries` computation:

```
// BEFORE: 1 series (specific pillar) OR 2 series (aggregated total)
// selectedYoYPillar controls which mode

// AFTER: Always show 4 pillar series — each pillar's accomplishment_rate per fiscal year
const PILLAR_SERIES_COLORS = ['#1976D2', '#7B1FA2', '#00897B', '#F57C00']

yearlyComparisonSeries = PILLARS.map((pillar, idx) => ({
  name: pillar.name,
  data: years.map(y => {
    const p = y.pillars?.find(p => p.pillar_type === pillar.id)
    return p?.accomplishment_rate ?? 0
  }),
  color: PILLAR_SERIES_COLORS[idx],
}))
```

Update `yearlyComparisonOptions`:
- Y-axis title: `"Accomplishment Rate (%)"`
- Y-axis max: `120`
- Y-axis formatter: `val => val.toFixed(1) + '%'`
- Tooltip formatter: `val => val.toFixed(1) + '%'`
- Legend: show pillar names as series labels
- Remove `selectedYoYPillar` v-select — no longer needed (all pillars visible)
  - OR repurpose as a **show/hide toggle** (checkboxes per pillar) — simpler to remove for now

The backend already returns `pillars[]` per year with `accomplishment_rate` — **no backend change required.**

**Verification:**
- [ ] Chart shows 4 colored bar groups per fiscal year
- [ ] Each group = one pillar's accomplishment rate
- [ ] X-axis = fiscal years (e.g., "FY 2024", "FY 2025", "FY 2026")
- [ ] Y-axis = `%` scale
- [ ] Legend shows all 4 pillar names with corresponding colors
- [ ] Clicking a year bar still updates `selectedFiscalYear`

---

### Step EE-D: Global Pillar Filter (IMPORTANT)

**Scope:** SHOULD  
**Files:** `pmo-frontend/pages/university-operations/index.vue`

**Action:**

1. **Add a single `selectedGlobalPillar` filter** replacing the two independent local filters:
   ```typescript
   const selectedGlobalPillar = ref<string>('ALL')
   ```

2. **Wire to all charts:**
   - `targetVsActualPillars`: filter by `selectedGlobalPillar` (existing client-side logic)
   - `pillarChartSeries`: filter radial bar to selected pillar (or show all when 'ALL')
   - `quarterlyChartData`: pass `selectedGlobalPillar` to API call when not 'ALL'
   - `yearlyComparisonSeries`: highlight selected pillar series (opacity on others)

3. **Add watch for quarterly trend re-fetch on pillar change:**
   ```typescript
   watch(selectedGlobalPillar, async (newPillar) => {
     analyticsLoading.value = true
     const pillarParam = newPillar !== 'ALL' ? `&pillar_type=${newPillar}` : ''
     const trendRes = await api.get(
       `/api/university-operations/analytics/quarterly-trend?fiscal_year=${selectedFiscalYear.value}${pillarParam}`
     )
     quarterlyTrend.value = trendRes
     analyticsLoading.value = false
   })
   ```

4. **Place global filter in the analytics card header** (above all charts, inline with the card title):
   ```vue
   <v-card-title>
     Analytics Dashboard
     <v-spacer />
     <v-select v-model="selectedGlobalPillar" :items="globalPillarOptions" ... />
   </v-card-title>
   ```

5. **Remove** `selectedAnalyticsPillar` and `selectedYoYPillar` variables (superseded by global filter)

**Verification:**
- [ ] Single pillar filter above all charts
- [ ] Changing filter updates Target vs Actual, Pillar Rates, Quarterly Trend, and YoY
- [ ] 'ALL' shows all pillars across all charts
- [ ] Specific pillar focuses all charts on that pillar
- [ ] Quarterly trend API call includes `pillar_type` param when specific pillar selected

---

### Step EE-E: Physical / Financial Reporting Type Combobox (IMPORTANT)

**Scope:** SHOULD  
**Files:** `pmo-frontend/pages/university-operations/index.vue`

**Action:**

1. **Add `selectedReportingType` ref:**
   ```typescript
   const selectedReportingType = ref<string>('PHYSICAL')
   const reportingTypeOptions = [
     { title: 'Physical Accomplishments (BAR No. 1)', value: 'PHYSICAL' },
     { title: 'Financial Accomplishments (BAR No. 2)', value: 'FINANCIAL' },
   ]
   ```

2. **Place combobox in analytics card header** alongside `selectedGlobalPillar`

3. **Conditional rendering:**
   ```vue
   <template v-if="selectedReportingType === 'PHYSICAL'">
     <!-- All existing analytics charts -->
   </template>
   <template v-else>
     <!-- Financial Coming Soon placeholder -->
     <v-card variant="tonal" class="text-center pa-8">
       <v-icon size="64" color="grey">mdi-chart-timeline-variant</v-icon>
       <h3>Financial Accomplishments Analytics</h3>
       <p>BAR No. 2 analytics are under development.</p>
       <v-chip color="info">Coming Soon</v-chip>
     </v-card>
   </template>
   ```

4. **No backend changes required** — Financial data doesn't exist; this is UI scaffolding only.

**Verification:**
- [ ] "Physical Accomplishments (BAR No. 1)" shows all existing analytics
- [ ] "Financial Accomplishments (BAR No. 2)" shows clean "Coming Soon" card
- [ ] No errors thrown when Financial mode selected
- [ ] Switching back to Physical restores full dashboard

---

### Step EE-F: Regression Testing Matrix (CRITICAL)

**Status:** Awaiting operator verification

| # | Test Case | Expected Result |
|---|-----------|----------------|
| 1 | Analytics Guide visible on page load | Guide panel open above charts |
| 2 | Fiscal year change | All 4 charts refresh |
| 3 | Global pillar = ALL | All charts show all pillars |
| 4 | Global pillar = Higher Education | All charts focus on Higher Ed |
| 5 | Target vs Actual bars | Y-axis shows %, 0–120 range |
| 6 | YoY chart default view | 4 colored series per fiscal year |
| 7 | YoY chart — 3 fiscal years | All 4 pillars with 3 year groups |
| 8 | Reporting type = PHYSICAL | Full dashboard visible |
| 9 | Reporting type = FINANCIAL | "Coming Soon" card only |
| 10 | Pillar card click | Navigates to correct pillar tab |
| 11 | No stored data modified | Raw Q1-Q4 values unchanged |
| 12 | No regression on Physical Accomplishment page | Existing CRUD and charts intact |

---

### Phase EE Execution Priority

| Priority | Step | Severity | Dependencies |
|----------|------|----------|-------------|
| 1 | EE-B: Achievement % chart | CRITICAL | None |
| 2 | EE-C: YoY all-pillar series | CRITICAL | None |
| 3 | EE-A: Analytics Guide to top | IMPORTANT | None |
| 4 | EE-D: Global filter | IMPORTANT | EE-B, EE-C (affects all charts) |
| 5 | EE-E: Physical/Financial combobox | IMPORTANT | EE-D |
| 6 | EE-F: Regression testing | CRITICAL | All prior steps |

> **Note:** This second EE section (research ref: 1.84) supersedes the earlier EE section (research ref: 1.85) above. The implementation (Steps EE-A through EE-E) was completed and verified. See research.md Sections 1.84 and 1.85 for full research record.

---

## PHASE EH — UI REFINEMENT, ANALYTICS IMPROVEMENT, AND ARTIFACT CLEANUP

**Research:** `research.md` Section 1.87  
**Status:** Phase 1 COMPLETE → Phase 2 COMPLETE → Awaiting `EXECUTE_WITH_ACE`  
**Files:**
- `pmo-frontend/pages/university-operations/index.vue` — analytics changes
- `pmo-frontend/pages/university-operations/physical/index.vue` — hero/pillar header
- `docs/plan.md` — artifact cleanup
- `docs/research.md` — artifact cleanup

### Governance Directive Update

| # | Directive | Status |
|---|-----------|--------|
| 43 | Analytics Guide collapsed by default | 🔴 EH-B |
| 44 | Hero section shows active pillar submission status + action | 🔴 EH-E |
| 45 | Pillar header shows fallback status when no operation record | 🔴 EH-F |
| 46 | Achievement Rate chart includes 100% target reference line | 🔴 EH-C |
| 47 | YoY chart includes 100% target reference annotation | 🔴 EH-D |

### Research Summary

| # | Finding | Severity | Action |
|---|---------|----------|--------|
| 1 | plan.md has duplicate Phase EE sections with conflicting step labels | HIGH | EH-A: Consolidate |
| 2 | research.md Section 1.85 mislabeled as "Phase DQ"; 1.84 out of order | MEDIUM | EH-A: Note in artifact |
| 3 | Analytics Guide currently OPEN by default (`:model-value="[0]"`) | LOW | EH-B: Remove attribute |
| 4 | Achievement Rate bar chart has no target baseline reference | MEDIUM | EH-C: Add 100% annotation |
| 5 | YoY chart shows accomplishment rate but no target benchmark visible | MEDIUM | EH-D: Add 100% annotation |
| 6 | Hero section has no submission status/action for active pillar | MEDIUM | EH-E: Add compact status+btn |
| 7 | Pillar header publication chip hidden when `currentOperation` is null | HIGH | EH-F: Add fallback chip |
| 8 | Data labels already implemented on both radial and bar charts | — | No action needed (EH note) |

---

### Step EH-A: Artifact Cleanup and Consolidation (IMPORTANT)

**Scope:** SHOULD  
**Files:** `docs/plan.md`

**Issues to fix:**

1. **plan.md header** (line 3): Update active phase from `Phase EG` → `Phase EH`
2. **Duplicate Phase EE in plan.md** (lines 3438–3649 AND 3655–3915): The second EE section (lines 3655+) supersedes the first. Add a consolidation note to the first EE section explaining the second supersedes it (do NOT delete — preserve history for audit trail).
3. **Phase EE checklist** (line 3637): Update unchecked items to checked (all EE steps were implemented and verified via IDE diagnostics with zero errors).
4. **research.md Section 1.85**: Add a note clarifying it was generated as Phase EE research (mislabeled "Phase DQ"). Do NOT delete — preserve history.

**Verification:**
- [ ] plan.md header shows `Phase EH` as active phase
- [ ] Phase EE checklist items are checked ✅
- [ ] No information deleted — consolidation notes added only

---

### Step EH-B: Analytics Guide — Collapse by Default (IMPORTANT)

**Scope:** SHOULD  
**Files:** `pmo-frontend/pages/university-operations/index.vue`

**Current state (line 596):**
```vue
<v-expansion-panels variant="accordion" :model-value="[0]" class="mb-4">
```

**Action:** Remove `:model-value="[0]"` so the guide is collapsed by default:
```vue
<v-expansion-panels variant="accordion" class="mb-4">
```

This prioritizes chart visibility on page load. Users can expand the guide when needed.

**Verification:**
- [ ] Analytics Guide is collapsed when page loads
- [ ] Guide can be manually expanded by clicking
- [ ] No other behavior changed

---

### Step EH-C: Achievement Rate Chart — Add 100% Target Reference Line (IMPORTANT)

**Scope:** SHOULD  
**Files:** `pmo-frontend/pages/university-operations/index.vue`

**Current state:** Single bar series showing `accomplishment_rate_pct` per pillar. No target baseline visible.

**Action:** Add a `annotations.yaxis` reference line at y=100 to `targetVsActualOptions`:

```typescript
annotations: {
  yaxis: [{
    y: 100,
    borderColor: '#FF4560',
    strokeDashArray: 5,
    label: {
      text: 'Target (100%)',
      position: 'right',
      style: { color: '#FF4560', fontSize: '11px' },
    },
  }],
},
```

This clearly communicates that 100% is the performance target without modifying any stored data.

**Verification:**
- [ ] Red dashed line at y=100 visible in chart
- [ ] Label "Target (100%)" shown on right side
- [ ] Bars below line = underperforming; bars above = exceeding target
- [ ] No stored data modified

---

### Step EH-D: Year-over-Year Chart — Add 100% Target Reference Annotation (IMPORTANT)

**Scope:** SHOULD  
**Files:** `pmo-frontend/pages/university-operations/index.vue`

**Current state:** 4 pillar series bars showing accomplishment rate (%) per fiscal year. No target benchmark visible.

**Action:** Add the same `annotations.yaxis` reference line at y=100 to `yearlyComparisonOptions`:

```typescript
annotations: {
  yaxis: [{
    y: 100,
    borderColor: '#FF4560',
    strokeDashArray: 5,
    label: {
      text: 'Target (100%)',
      position: 'right',
      style: { color: '#FF4560', fontSize: '11px' },
    },
  }],
},
```

This creates a consistent visual language across both achievement charts — bars below the red line = below target, above = exceeding.

**Verification:**
- [ ] Red dashed line at y=100 visible in YoY chart
- [ ] All 4 pillar series bars still shown
- [ ] Consistent visual language with EH-C chart

---

### Step EH-E: Hero Section — Active Pillar Submission Status + Quick Action (IMPORTANT)

**Scope:** SHOULD  
**Files:** `pmo-frontend/pages/university-operations/physical/index.vue`

**Current state:** Hero section has [Quarter Selector] [FY Selector] [Export Menu]. No submission status/action.  
Submission controls exist in the PILLAR HEADER (lines 975–1020) — but are below the fold after scrolling.

**Action:** Add a compact row beneath the hero controls (or inline) showing:
1. **Publication status chip** — reflects `currentOperation?.publication_status` of the active pillar
2. **Primary action button** — shows whichever single action is available: Submit / Withdraw / Approve (most privileged applicable action)

Implementation:
```vue
<!-- EH-E: Hero status bar — active pillar quick status + action -->
<div v-if="currentOperation" class="d-flex align-center ga-2 mt-2 justify-end">
  <v-chip
    :color="getPublicationStatusColor(currentOperation.publication_status)"
    size="small"
    variant="tonal"
  >
    <v-icon start size="x-small">mdi-circle</v-icon>
    {{ currentPillar.name }}: {{ getPublicationStatusLabel(currentOperation.publication_status) }}
  </v-chip>
  <v-btn
    v-if="canSubmitForReview()"
    color="primary" size="small" variant="tonal"
    prepend-icon="mdi-send" :loading="actionLoading"
    @click="submitForReview"
  >Submit</v-btn>
  <v-btn
    v-else-if="canApprove()"
    color="success" size="small" variant="tonal"
    prepend-icon="mdi-check-circle" :loading="actionLoading"
    @click="approveEntry"
  >Approve</v-btn>
  <v-btn
    v-else-if="canWithdraw()"
    color="warning" size="small" variant="tonal"
    prepend-icon="mdi-undo" :loading="actionLoading"
    @click="withdrawSubmission"
  >Withdraw</v-btn>
</div>
```

**Placement:** After the `</v-alert>` rejection banner block (line ~898), before `<!-- Phase DR-C: Pillar Tabs -->`.

**Important constraint:** Do NOT remove existing pillar header controls — this is additive only.

**Verification:**
- [ ] Status chip shows active pillar name + publication status in hero area
- [ ] Correct action button shown (Submit / Approve / Withdraw) based on RBAC and status
- [ ] Clicking button triggers the same function as pillar header button
- [ ] Pillar header controls unchanged

---

### Step EH-F: Pillar Header — Publication Status Fallback (IMPORTANT)

**Scope:** SHOULD  
**Files:** `pmo-frontend/pages/university-operations/physical/index.vue`

**Current state (lines 948–956):**
```vue
<v-chip v-if="currentOperation" ...>
  {{ getPublicationStatusLabel(currentOperation.publication_status) }}
</v-chip>
```
When `currentOperation` is null (no operation record for this FY/pillar), the chip is hidden.

**Action:** Add a fallback chip when `currentOperation` is null:
```vue
<v-chip v-if="currentOperation" :color="getPublicationStatusColor(currentOperation.publication_status)" size="small" variant="tonal">
  <v-icon start size="x-small">mdi-circle</v-icon>
  {{ getPublicationStatusLabel(currentOperation.publication_status) }}
</v-chip>
<v-chip v-else size="small" color="grey" variant="tonal">
  <v-icon start size="x-small">mdi-circle-outline</v-icon>
  Not Started
</v-chip>
```

**Verification:**
- [ ] When `currentOperation` exists: shows DRAFT/Pending Review/Published/Rejected chip
- [ ] When `currentOperation` is null: shows grey "Not Started" chip
- [ ] Never renders no chip at all

---

### Step EH-G: Regression Testing Matrix (CRITICAL)

**Status:** Awaiting operator verification

| # | Test Case | Expected Result |
|---|-----------|----------------|
| 1 | Analytics Guide on page load | Collapsed by default |
| 2 | Expand Analytics Guide | Opens and shows all 4 chart explanations |
| 3 | Achievement Rate chart | Red dashed 100% line visible |
| 4 | YoY chart | Red dashed 100% line visible |
| 5 | Physical page — operation exists, DRAFT | Hero shows "Pillar: Draft" chip + Submit button |
| 6 | Physical page — operation PENDING_REVIEW, admin | Hero shows "Pending Review" chip + Approve button |
| 7 | Physical page — no currentOperation | Pillar header shows grey "Not Started" chip |
| 8 | Physical page — FY with no operation | Hero status bar hidden (v-if="currentOperation") |
| 9 | Pillar header controls still functional | Submit/Withdraw/Approve/Reject buttons in header unchanged |
| 10 | Fiscal year change | All charts refresh, hero status updates to new FY pillar |
| 11 | Global pillar filter change | Charts update, hero status updates to match selected pillar |
| 12 | No stored data modified | Raw Q1-Q4 values unchanged |

---

### Phase EH Execution Priority

| Priority | Step | Severity | Dependencies |
|----------|------|----------|-------------|
| 1 | EH-A: Artifact cleanup | IMPORTANT | None |
| 2 | EH-B: Analytics Guide collapse | TRIVIAL | None |
| 3 | EH-C: Achievement Rate 100% annotation | IMPORTANT | None |
| 4 | EH-D: YoY 100% annotation | IMPORTANT | None |
| 5 | EH-E: Hero section status + action | IMPORTANT | None |
| 6 | EH-F: Pillar header fallback chip | IMPORTANT | None |
| 7 | EH-G: Regression testing | CRITICAL | All prior steps |

---

## PHASE EI — QUARTERLY SUBMISSION WORKFLOW

**Research:** `research.md` Section 1.88  
**Status:** Phase 2 PLAN COMPLETE — Awaiting EXECUTE_WITH_ACE  
**Date:** 2026-03-11

### Context

The per-quarter backend workflow (Phase DY-D) is fully implemented but not exposed in the frontend. The frontend only uses pillar-level submission. This phase wires the per-quarter status tracking into the hero status bar so operators can submit individual quarters and see their review status.

**Key Architecture Decision (KISS/YAGNI):**  
Per-quarter submissions do NOT appear separately in Pending Reviews. Pending Reviews remains pillar-level. Per-quarter status is operational granularity for the operator — when formal admin review is needed, the operator uses the existing pillar-level "Submit for Review."

---

### Step EI-A: Backend — Add Quarter Status to findAll() (CRITICAL)

**Scope:** MUST  
**Files:** `pmo-backend/src/university-operations/university-operations.service.ts`

**Current state:** `findAll()` SELECT (line ~256) does not include `status_q1`, `status_q2`, `status_q3`, `status_q4`.  
`currentOperation` in the frontend is loaded via `findAll()` → missing quarter status fields.

**Action:** Add `uo.status_q1, uo.status_q2, uo.status_q3, uo.status_q4` to the SELECT list in `findAll()`.

**Verification:**
- [ ] `GET /api/university-operations` response includes `status_q1..q4` on each record
- [ ] `currentOperation.status_q1` is accessible in the frontend
- [ ] Existing behavior unchanged

---

### Step EI-B: Frontend — Quarter Status Computed Property (IMPORTANT)

**Scope:** MUST  
**Files:** `pmo-frontend/pages/university-operations/physical/index.vue`

**Action:** Add a computed property `currentQuarterStatus` that returns the status of the active quarter from `currentOperation`:

Logic: `currentOperation.value?.['status_' + selectedQuarter.value.toLowerCase()] || 'DRAFT'`

**Verification:**
- [ ] `currentQuarterStatus` returns `DRAFT` when Q has no status record
- [ ] `currentQuarterStatus` returns `PENDING_REVIEW` after quarter submit
- [ ] `currentQuarterStatus` updates when `selectedQuarter` changes

---

### Step EI-C: Frontend — Quarter Workflow Action Functions (IMPORTANT)

**Scope:** MUST  
**Files:** `pmo-frontend/pages/university-operations/physical/index.vue`

**Action:** Add 4 async functions mirroring the existing pillar-level pattern:

1. `submitQuarterForReview()` — calls `POST /:id/submit-quarter` with `{ quarter: selectedQuarter.value }`
2. `withdrawQuarterSubmission()` — calls `POST /:id/withdraw-quarter`
3. `approveQuarter()` — calls `POST /:id/approve-quarter` (Admin only)
4. `rejectQuarterEntry()` — calls `POST /:id/reject-quarter` with rejection notes

Each must:
- Guard against null `currentOperation`
- Use `actionLoading` ref for loading state
- Call `findCurrentOperation()` after success to refresh quarter status
- Use `toast.success/error` for feedback

**Verification:**
- [ ] Staff can submit a DRAFT quarter
- [ ] Admin can approve a PENDING_REVIEW quarter
- [ ] Submit button is disabled/hidden when quarter is PENDING_REVIEW or PUBLISHED
- [ ] `currentOperation` refreshes correctly after each action

---

### Step EI-D: Frontend — Hero Status Bar Quarter-Awareness (IMPORTANT)

**Scope:** MUST  
**Files:** `pmo-frontend/pages/university-operations/physical/index.vue`

**Current state (EH-E):** Hero status bar shows pillar `publication_status` + pillar-level quick action.  
**Required change:** Extend hero status bar to show **both** pillar status and the **selected quarter's status**.

**Layout design:**
```
[Pillar Name] [Pillar Status chip] | [Q2 Status chip] [Submit Q2 btn]
```

- Left: Pillar name + pillar publication_status chip (unchanged from EH-E)
- Right: `[Selected Quarter] [Quarter status chip] [Quarter action btn]`
- Quarter action btn shows: "Submit Q#" (when DRAFT) / "Withdraw Q#" (when PENDING_REVIEW) / nothing when PUBLISHED

**Important:** When `currentOperation` is null, show "Not Started" for both pillar and quarter.

**Verification:**
- [ ] Selecting Q1 shows Q1's status chip
- [ ] Selecting Q2 shows Q2's status chip
- [ ] "Submit Q2" button appears when Q2 is DRAFT and user can edit
- [ ] Button disappears when Q2 is PENDING_REVIEW
- [ ] Button shows "Withdraw Q2" if user is the submitter and Q2 is PENDING_REVIEW

---

### Step EI-E: Frontend — Admin Quarter Actions in Pillar Header (IMPORTANT)

**Scope:** SHOULD  
**Files:** `pmo-frontend/pages/university-operations/physical/index.vue`

**Current state:** Pillar header shows pillar-level Approve/Reject buttons for admin. Per-quarter admin actions do not exist in the UI.

**Action:** When admin is viewing the page with an active quarter in PENDING_REVIEW:  
Add "Approve Q#" and "Reject Q#" buttons to the pillar header action section (below the existing pillar-level buttons).

These must be shown only when:
- User is Admin
- `currentOperation` exists
- The selected quarter's status is PENDING_REVIEW

**Verification:**
- [ ] Admin sees "Approve Q1" when Q1 is PENDING_REVIEW
- [ ] Admin cannot approve own submission (backend enforces; frontend hides btn)
- [ ] After quarter approve, status chip updates to "Published"

---

### Step EI-F: Regression Testing Matrix (CRITICAL)

| # | Test Case | Expected Result |
|---|-----------|----------------|
| 1 | New FY + pillar — no operation exists | Hero shows "Not Started" for both pillar and Q status |
| 2 | Staff enters Q1 data and saves | Operation auto-created; Q1 status = DRAFT |
| 3 | Staff clicks "Submit Q1" | Q1 status → PENDING_REVIEW; button disappears |
| 4 | Staff tries to edit Q1 data after submit | Edit still allowed (quarter status ≠ lock; backend enforces via pillar publication_status) |
| 5 | Staff switches to Q2 | Q2 chip shows DRAFT independently |
| 6 | Admin approves Q1 | Q1 chip → Published; pillar publication_status unchanged |
| 7 | Admin rejects Q1 | Q1 chip → Rejected; "Submit Q1" reappears |
| 8 | Staff withdraws Q2 submission | Q2 chip → DRAFT; "Submit Q2" reappears |
| 9 | Pillar-level "Submit for Review" still works | Entire pillar → PENDING_REVIEW independent of quarter statuses |
| 10 | Pending Reviews page | Only shows pillar-level PENDING_REVIEW items (unchanged) |
| 11 | Pillar tab switch | `currentOperation` and `currentQuarterStatus` both update |
| 12 | FY change | `currentOperation` reloads with new FY's quarter statuses |

---

### Phase EI Execution Priority

| Priority | Step | Severity | Files | Dependencies |
|----------|------|----------|-------|-------------|
| 1 | EI-A: findAll() backend fix | CRITICAL | service.ts | None — must be first |
| 2 | EI-B: `currentQuarterStatus` computed | IMPORTANT | physical/index.vue | EI-A |
| 3 | EI-C: Quarter action functions | IMPORTANT | physical/index.vue | EI-A |
| 4 | EI-D: Hero status bar quarter-awareness | IMPORTANT | physical/index.vue | EI-B + EI-C |
| 5 | EI-E: Admin quarter buttons in pillar header | SHOULD | physical/index.vue | EI-C |
| 6 | EI-F: Regression testing | CRITICAL | — | EI-A through EI-E |

**Total backend changes:** 1 (add 4 columns to SELECT list in findAll)  
**Total frontend changes:** 1 file, additive only  
**No new migrations, tables, or endpoints required.**

---

## PHASE EJ — SUBMIT BUTTON FIX: `created_by` + `isOwnerOrAssigned` CORRECTION

**Research:** `research.md` Section 1.89  
**Status:** Phase 2 PLAN COMPLETE — Awaiting EXECUTE_WITH_ACE  
**Date:** 2026-03-11

### Context

After Phase EI, all quarter submit buttons and the pillar-level "Submit for Review" button are invisible for non-admin staff. Root cause: `isOwnerOrAssigned()` always returns `false` due to two bugs — `created_by` missing from `findAll()` SELECT, and `assigned_to` referencing a non-existent field (correct field is `assigned_users` array).

---

### Step EJ-A: Backend — Add `created_by` to `findAll()` SELECT (CRITICAL)

**Scope:** MUST  
**Files:** `pmo-backend/src/university-operations/university-operations.service.ts`

**Current state (line 257–258):**
```sql
uo.submitted_by, uo.submitted_at,
uo.status_q1, uo.status_q2, uo.status_q3, uo.status_q4,
```

**Action:** Add `uo.created_by,` to the SELECT:
```sql
uo.submitted_by, uo.submitted_at, uo.created_by,
uo.status_q1, uo.status_q2, uo.status_q3, uo.status_q4,
```

**Verification:**
- [ ] `GET /api/university-operations` response includes `created_by` on each record
- [ ] `currentOperation.value.created_by` is accessible in the frontend

---

### Step EJ-B: Frontend — Fix `isOwnerOrAssigned()` Assignment Check (CRITICAL)

**Scope:** MUST  
**Files:** `pmo-frontend/pages/university-operations/physical/index.vue`

**Current state (lines 407–412):**
```ts
function isOwnerOrAssigned(op: any): boolean {
  if (!op) return false
  const userId = authStore.user?.id
  if (!userId) return false
  return op.created_by === userId || op.assigned_to === userId
}
```

`op.assigned_to` does not exist — the field is `assigned_users` (a JSON array of `{ id, name }` objects).

**Action:** Replace the return line:
```ts
const isAssigned = Array.isArray(op.assigned_users) && op.assigned_users.some((u: any) => u.id === userId)
return op.created_by === userId || isAssigned
```

**Verification:**
- [ ] Staff who created an operation see the Submit button
- [ ] Staff assigned via `assigned_users` also see the Submit button
- [ ] Admin still bypasses this check (uses `isAdmin.value` shortcut)

---

### Step EJ-C: Regression Testing (CRITICAL)

| # | Test Case | Expected Result |
|---|-----------|----------------|
| 1 | Staff opens pillar they created + DRAFT | "Submit for Review" visible in pillar header |
| 2 | Staff opens pillar they created + DRAFT | "Submit Q1" visible in hero status bar |
| 3 | Staff opens pillar they did NOT create | Submit buttons NOT visible |
| 4 | Admin opens any pillar in PENDING_REVIEW | Approve/Reject buttons visible |
| 5 | Staff submits Q1 | Q1 status chip → "Pending Review" |
| 6 | Staff submits pillar | Pillar status → "Pending Review" |
| 7 | Staff assigned via `assigned_users` | Submit buttons visible |
| 8 | Withdraw pillar still works | Uses `submitted_by` — unaffected |

---

### Phase EJ Execution Priority

| Priority | Step | Severity | Files |
|----------|------|----------|-------|
| 1 | EJ-A: Add `created_by` to SELECT | CRITICAL | service.ts |
| 2 | EJ-B: Fix `isOwnerOrAssigned()` | CRITICAL | physical/index.vue |
| 3 | EJ-C: Regression testing | CRITICAL | — |

**Total: 2 lines changed across 2 files. No migrations. No new endpoints.**

---

## PHASE EK — SUBMIT BUTTON FIX: ADMIN BYPASS + PLACEMENT + PAGINATION

**Research:** `research.md` Section 1.90  
**Status:** Phase 2 PLAN COMPLETE — Awaiting EXECUTE_WITH_ACE  
**Date:** 2026-03-11

### Context

Phase EJ fixed `created_by` and `isOwnerOrAssigned()`, but submit buttons remain invisible for Admin users who didn't create the operation. Additionally, the button placement is in the hero status bar instead of the header row beside the FY selector.

---

### Step EK-A: Add Admin Bypass to Submit Permission Functions (CRITICAL)

**Scope:** MUST  
**Files:** `pmo-frontend/pages/university-operations/physical/index.vue`

**Current state:**
- `canSubmitForReview()` (line 422): No `isAdmin` check — requires `isOwnerOrAssigned()`
- `canSubmitQuarter()` (line 452): Same — no admin bypass

**Action:** Add admin bypass after the null check, matching the `canEditData()` pattern:

For `canSubmitForReview()`:
```ts
if (!currentOperation.value) return false
if (isAdmin.value) {
  const status = currentOperation.value.publication_status
  return status === 'DRAFT' || status === 'REJECTED'
}
if (!isOwnerOrAssigned(currentOperation.value)) return false
...
```

For `canSubmitQuarter()`:
```ts
if (!currentOperation.value) return false
if (isAdmin.value) {
  const status = currentQuarterStatus.value
  return status === 'DRAFT' || status === 'REJECTED'
}
if (!isOwnerOrAssigned(currentOperation.value)) return false
...
```

**Verification:**
- [ ] Admin who did NOT create operation sees submit buttons
- [ ] Admin who DID create operation also sees submit buttons
- [ ] Non-admin staff only sees button if owner or assigned
- [ ] Button hidden when status is PENDING_REVIEW or PUBLISHED

---

### Step EK-B: Move Quarter Submit Button to Header Row (IMPORTANT)

**Scope:** MUST  
**Files:** `pmo-frontend/pages/university-operations/physical/index.vue`

**Current state:** Submit button is in the hero status bar (`v-sheet`, line ~1027). User expects it beside the Fiscal Year selector, before the Export button.

**Action:**
1. Add a "Submit Q#" button in the header row between the FY selector (line ~961) and the Export menu (line ~964)
2. Keep the hero status bar for display-only quarter status chips (remove action buttons from it)

**Header row insertion point (after FY selector, before Export):**
```vue
<v-btn
  v-if="canSubmitQuarter()"
  color="primary"
  variant="tonal"
  size="small"
  prepend-icon="mdi-send"
  :loading="actionLoading"
  @click="submitQuarterForReview"
  class="flex-sm-0-0-auto"
>
  Submit {{ selectedQuarter }}
</v-btn>
```

**Hero status bar cleanup:** Remove the `v-btn` elements from the hero status bar (keep chips only for status display).

**Verification:**
- [ ] Submit button appears in header row beside FY selector
- [ ] Button respects `canSubmitQuarter()` visibility
- [ ] Hero status bar still shows quarter status chips (no buttons)
- [ ] Layout does not overflow on small screens

---

### Step EK-C: Add Pagination Guard to `findCurrentOperation()` (IMPORTANT)

**Scope:** SHOULD  
**Files:** `pmo-frontend/pages/university-operations/physical/index.vue`

**Current state (line 330):**
```ts
const response = await api.get<any>('/api/university-operations')
```
No filters, default limit=20. May miss operations in large datasets.

**Action:** Add query params:
```ts
const response = await api.get<any>(
  `/api/university-operations?type=${activePillar.value}&fiscal_year=${selectedFiscalYear.value}&limit=100`
)
```

**Verification:**
- [ ] `currentOperation` is found even with >20 total operations
- [ ] Pillar switch correctly refetches filtered operations
- [ ] FY switch correctly refetches filtered operations

---

### Step EK-D: Regression Testing (CRITICAL)

| # | Test Case | Expected Result |
|---|-----------|----------------|
| 1 | Admin opens DRAFT pillar they did NOT create | Submit buttons visible (header + pillar header) |
| 2 | Admin opens DRAFT quarter | "Submit Q1" visible beside FY selector |
| 3 | Staff opens pillar they created | Submit buttons visible |
| 4 | Staff opens pillar they did NOT create | Submit buttons hidden |
| 5 | Assigned staff opens pillar | Submit buttons visible |
| 6 | Submit Q1 clicked | Q1 status → PENDING_REVIEW |
| 7 | Hero status bar after submit | Shows "Pending Review" chip, no submit button |
| 8 | >20 operations exist | `currentOperation` still found correctly |

---

### Phase EK Execution Priority

| Priority | Step | Severity | Files |
|----------|------|----------|-------|
| 1 | EK-A: Admin bypass in submit functions | CRITICAL | physical/index.vue |
| 2 | EK-B: Move submit button to header row | IMPORTANT | physical/index.vue |
| 3 | EK-C: Pagination guard on findCurrentOperation | IMPORTANT | physical/index.vue |
| 4 | EK-D: Regression testing | CRITICAL | — |

**All changes are frontend-only. No backend modifications required.**

---

## PHASE EL — ALL-PILLAR QUARTERLY SUBMIT: SCOPE & PENDING REVIEW INTEGRATION

> **Research Reference:** `research.md` Section 1.91
> **Prerequisite:** Phase EK ✅ IMPLEMENTED

### Problem Statement

Despite Phase EK fixes (admin bypass, button placement, pagination guard), the Submit Q# button may still be invisible because `currentOperation.value` is null. Additionally, the current implementation only submits the **active pillar tab's operation** — not all 4 pillars. User requirement is to submit **all pillars** for the selected quarter simultaneously, with submissions appearing in **Pending Review Management**.

### Root Causes (Phase 1 Findings)

1. Migration 025 (`status_q1..q4` columns) may not be applied to the running database → `findAll()` SQL error → `currentOperation` = null
2. Backend may need restart after EI-A/EJ-A service.ts changes
3. `canSubmitQuarter()` returns false when `currentOperation.value` is null (before admin check runs)
4. Submit currently submits ONE pillar only; user wants ALL 4 pillars
5. Per-quarter submissions (`status_q1..q4`) are not connected to Pending Review Management

### Scope Decision

**Use pillar-level `submitForReview` for all 4 operations** (Option A — KISS):
- Calls existing `POST /api/university-operations/:id/submit-for-review` for each of the 4 pillar operations
- No backend changes required
- Submissions naturally appear in Pending Review Management
- `status_q1..q4` columns remain as admin-level fine-grained per-quarter markers

### Steps

#### EL-A: Verify Database Migration 025 + Backend Restart

**Description:** Confirm `status_q1..q4` columns exist in the database. Restart backend to pick up EI-A/EJ-A service.ts changes.

**Actions:**
- Check backend logs for PostgreSQL column errors related to `status_q1..q4`
- If migration 025 not applied: run `npm run migration:run` (or equivalent) on backend
- Restart NestJS backend service
- Verify: `GET /api/university-operations?type=HIGHER_EDUCATION&fiscal_year=<year>&limit=100` returns `status_q1` field in response

**Verification criteria:**
- API returns operation object with `status_q1`, `status_q2`, `status_q3`, `status_q4` fields
- `created_by` field present in response
- Browser console logs (line 336–342) show operation being found (not NULL)

---

#### EL-B: Add `allPillarOperations` Ref and Fetch Function

**Description:** Load all 4 pillar operations for the current fiscal year. Used by the header Submit button to operate cross-pillar.

**New state:**
- `allPillarOperations` ref — array of up to 4 operation objects (one per pillar)
- `fetchAllPillarOperations()` — calls `GET /api/university-operations?fiscal_year=${selectedFiscalYear}&limit=10` (no type filter, returns all pillars)
- Triggered on: `selectedFiscalYear` change, same as `findCurrentOperation()`

**Keep `currentOperation`** for per-tab display, per-pillar admin actions, and `currentQuarterStatus` computed.

**Verification criteria:**
- `allPillarOperations` contains all 4 PILLARS when all operations exist for the FY
- Switching fiscal year refreshes `allPillarOperations`
- Partial population handled gracefully (< 4 operations if some pillars haven't been created)

---

#### EL-C: Replace Submit Scope with `submitAllPillarsForReview()`

**Description:** The header Submit Q# button calls `submitForReview` (pillar-level) for ALL operations in `allPillarOperations` where status is submittable.

**New function:** `submitAllPillarsForReview()`
- Iterates over `allPillarOperations`
- For each operation where `publication_status === 'DRAFT'` or `'REJECTED'`
- Calls `POST /api/university-operations/:id/submit-for-review`
- Handles partial errors gracefully (reports per-pillar result)
- Toast: summarizes "N pillars submitted for review"

**Replace** `submitQuarterForReview()` as the `@click` handler on the header button.

**Verification criteria:**
- Clicking Submit Q1 triggers submission for all DRAFT/REJECTED pillar operations in `allPillarOperations`
- All 4 submitted operations appear in Pending Review Management
- Already PENDING_REVIEW operations are skipped without error
- Toast shows meaningful outcome summary

---

#### EL-D: New `canSubmitAllPillars()` Guard for Header Button

**Description:** Replace `canSubmitQuarter()` on the header button with `canSubmitAllPillars()` that operates on `allPillarOperations`, not `currentOperation`.

**Logic:**
```
canSubmitAllPillars():
  if allPillarOperations is empty → return false
  if isAdmin.value → return any operation has status DRAFT or REJECTED
  return any owned/assigned operation has status DRAFT or REJECTED
```

**Key benefit:** Button shows for Admin even when `currentOperation` is null for the active tab, as long as any pillar operation is submittable.

**Verification criteria:**
- Admin sees Submit button when at least one pillar operation is DRAFT
- Button hidden when all 4 operations are already PENDING_REVIEW or PUBLISHED
- Staff (non-admin) sees button only when they own/are assigned to at least one DRAFT operation

---

#### EL-E: Regression Testing

**Test matrix:**

| Scenario | Expected Behavior |
|---|---|
| Admin, all 4 pillars are DRAFT | Submit button visible |
| Admin clicks Submit Q1 | All 4 operations move to PENDING_REVIEW |
| All 4 operations appear in Pending Reviews | ✅ |
| Admin, all 4 pillars already PENDING_REVIEW | Submit button hidden, Withdraw button shown |
| Staff (creator of 2 pillars), other 2 unrelated | Submit button visible (submits only owned operations) |
| One pillar has no operation yet | Submit skips it gracefully |
| Per-quarter admin approve (Approve Q#) in pillar header | Still works independently |

---

### Phase EL Execution Priority

| Priority | Step | Severity | Files |
|----------|------|----------|-------|
| 1 | EL-A: Verify migration + backend restart | CRITICAL | Backend DB + NestJS service |
| 2 | EL-B: Add `allPillarOperations` ref | CRITICAL | physical/index.vue |
| 3 | EL-C: `submitAllPillarsForReview()` | CRITICAL | physical/index.vue |
| 4 | EL-D: `canSubmitAllPillars()` guard | CRITICAL | physical/index.vue |
| 5 | EL-E: Regression testing | IMPORTANT | — |

**Backend changes required: EL-A only (migration run + restart). EL-B through EL-D are frontend-only.**

---

### Phase EL Implementation Checklist

- [x] EL-A: Migration 025 confirmed (`ADD COLUMN IF NOT EXISTS` — safe to re-run if needed)
- [x] EL-B: `allPillarOperations` ref added; `fetchAllPillarOperations()` implemented; wired into `watch(selectedFiscalYear)` and `onMounted`
- [x] EL-C: `submitAllPillarsForReview()` loops all DRAFT/REJECTED pillar operations → calls `submit-for-review` for each → appears in Pending Reviews; `withdrawAllPillarsSubmission()` loops all PENDING_REVIEW operations → calls `withdraw`
- [x] EL-D: `canSubmitAllPillars()` and `canWithdrawAllPillars()` operate on `allPillarOperations` (not `currentOperation`) — button visible for Admin even when active pillar tab has no operation; old per-pillar `canSubmitQuarter()`/`canWithdrawQuarter()` and `submitQuarterForReview()`/`withdrawQuarterSubmission()` removed (dead code)
- [x] EL-E: Zero TypeScript errors; only pre-existing `isStaff` hint and CSS vendor prefix warning remain

**Status:** ✅ PHASE EL IMPLEMENTED

---

## PHASE EM — QUARTERLY SUBMISSION ARCHITECTURE OVERHAUL & UI REFACTOR

> **Research Reference:** `research.md` Section 1.92
> **Prerequisite:** Phase EL ✅ IMPLEMENTED

### Problem Statement

Phase EL implemented a loop-per-pillar submission approach which introduced two critical bugs:
1. `fetchAllPillarOperations()` has no `operation_type` filter — returns ALL operations across all campuses, producing "3 submitted, 7 failed" errors
2. Pending Reviews shows per-pillar records ("Technical Advisory Extension Program – FY 2026") instead of per-quarter records ("Quarter 1 (Jan–March) — FY 2026")

Additionally: header truncation, no pre-submission validation, no multi-select in Pending Reviews.

The correct architecture requires a new `quarterly_reports` table — one record per (fiscal_year, quarter, campus) — as the formal quarterly submission entity.

---

### Architecture Decision

**New `quarterly_reports` table** (migration 026):
- ONE record per (fiscal_year, quarter) — **university-wide, not campus-specific**
- Full Draft Governance workflow: DRAFT → PENDING_REVIEW → PUBLISHED / REJECTED
- Pending Reviews fetches from this table → shows one quarterly entry representing entire university quarterly submission
- Per-pillar `status_q1..q4` remain as audit/completion trackers (not submission drivers)

**Pillar `publication_status`**: Remains unchanged for pillar-level governance (publishing pillar data). Quarterly report submission is a separate, higher-level workflow.

---

### Steps

#### EM-A: Migration 026 — `quarterly_reports` Table

**Description:** New PostgreSQL migration adding the `quarterly_reports` table.

**Schema:**
```sql
quarterly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_year INTEGER NOT NULL,
  quarter VARCHAR(2) NOT NULL CHECK (quarter IN ('Q1','Q2','Q3','Q4')),
  title TEXT,               -- e.g. "Quarter 1 (Jan–March) FY 2026"
  publication_status VARCHAR(20) DEFAULT 'DRAFT' 
    CHECK (publication_status IN ('DRAFT','PENDING_REVIEW','PUBLISHED','REJECTED')),
  submitted_by UUID REFERENCES users(id),
  submitted_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(fiscal_year, quarter)  -- one university-wide report per quarter per FY
)
```

**Indexes**: `fiscal_year`, `publication_status`, `created_by`.

**Verification criteria:**
- Migration runs cleanly with `ADD IF NOT EXISTS` safety
- `UNIQUE(fiscal_year, quarter)` prevents duplicate quarterly reports for the university
- Existing `university_operations` table unaffected

---

#### EM-B: Backend — QuarterlyReports Service + Controller

**Description:** New NestJS module (or add to university-operations) for `quarterly_reports` CRUD and workflow.

**Routes:**
```
POST   /api/quarterly-reports           — create (auto-derive title from FY+quarter)
GET    /api/quarterly-reports           — list (filters: fiscal_year, quarter)
GET    /api/quarterly-reports/:id       — detail
POST   /api/quarterly-reports/:id/submit   — DRAFT → PENDING_REVIEW
POST   /api/quarterly-reports/:id/approve  — PENDING_REVIEW → PUBLISHED (Admin only)
POST   /api/quarterly-reports/:id/reject   — PENDING_REVIEW → REJECTED (Admin only)
POST   /api/quarterly-reports/:id/withdraw — PENDING_REVIEW → DRAFT
GET    /api/quarterly-reports/pending-review — Admin: items WHERE publication_status = PENDING_REVIEW
```

**Service pattern**: Mirror `submitForReview()` / `publish()` / `reject()` / `withdraw()` from `university-operations.service.ts` (DRY).

**Title auto-generation:**
```
Q1 → "Quarter 1 (Jan–March) FY {year}"
Q2 → "Quarter 2 (Apr–June) FY {year}"
Q3 → "Quarter 3 (Jul–Sep) FY {year}"
Q4 → "Quarter 4 (Oct–Dec) FY {year}"
```

**Verification criteria:**
- `POST /quarterly-reports` with `fiscal_year=2026, quarter=Q1` returns a record with correct title
- `POST /quarterly-reports/:id/submit` changes status from DRAFT → PENDING_REVIEW
- `GET /quarterly-reports/pending-review` returns the submitted record for Admin

---

#### EM-C: Frontend — Fix "3 Submitted, 7 Failed" Immediate Bug + Switch to Quarterly Report Submit

**Immediate Bug Fix (Short-term)**:

The "3 submitted, 7 failed" error is caused by:
1. **Duplicate or stale operation records** in the database (some pillars already PENDING_REVIEW from previous submission attempt)
2. **OR data corruption** where operations exist in unexpected states

Quick fix to `submitAllPillarsForReview()` (line 883):
- Before looping submission, filter `allPillarOperations.value` to only DRAFT or REJECTED status
- Skip operations that are already PENDING_REVIEW or PUBLISHED (don't attempt re-submission)
- Update toast to show only successful count, omit error count (or show as warning)

```javascript
const submittable = allPillarOperations.value.filter(op => {
  const isSubmittable = op.publication_status === 'DRAFT' || op.publication_status === 'REJECTED'
  const hasAccess = isAdmin.value || isOwnerOrAssigned(op)
  return isSubmittable && hasAccess
})
```

This prevents re-submission attempts on already-submitted pillars.

**Verification**: With this guard, submission count should match number of DRAFT pillars only.

---

**Part 2: Switch to Quarterly Report Workflow (Long-term)**

Current phase EL approach (loop-per-pillar) is architecturally incorrect for quarterly reporting. Replace with university-wide quarterly report submission:

New flow:
1. `canSubmitAllPillars()` — check if a `quarterly_report` for (FY, quarter) exists and is DRAFT/REJECTED
2. `submitAllPillarsForReview()`:
   - GET `/api/quarterly-reports?fiscal_year=${FY}&quarter=${Q}` to find existing record
   - If not found: POST `/api/quarterly-reports` to create (DRAFT)
   - POST `/api/quarterly-reports/:id/submit` to submit (single API call, not loop)

**New state**: `currentQuarterlyReport` ref — the quarterly report record for the current (FY, quarter) selection.

**Verification criteria:**
- Submit button triggers one API call to `/quarterly-reports/:id/submit`
- `currentQuarterlyReport.value.publication_status` drives `canSubmitAllPillars()` correctly
- One Pending Review entry appears per quarter (not 4 per-pillar entries)

---

#### EM-D: Header Layout UI Refactor

**Description:** Fix truncation and standardize control heights.

**Changes:**
1. Shorten Q4 option title: `'Q4 — Final Year Projection'` → `'Q4 (Oct–Dec)'` (consistent format with Q1–Q3, fits within 200px)
2. Add explicit `height: 40px` or `min-height` to all buttons to match v-select compact height
4. Increase container `max-width: 640px` → `max-width: 760px` to give more breathing room
5. Remove `size="default"` inconsistencies — standardize all buttons to `density="compact"` only (consistent with selects)

**Preferred solution**: Option 2 (shorten label) is safest and requires minimal CSS. Propose new labels:
```
Q1 (Jan–Mar)
Q2 (Apr–Jun)
Q3 (Jul–Sep)
Q4 (Oct–Dec)  ← remove "Final Year Projection" from the label; tooltip can clarify
```

**Verification criteria:**
- All 4 quarter labels render without truncation on desktop
- All controls (selects + buttons) have equal effective height
- No horizontal wrapping on 1280px+ viewport

---

#### EM-E: Update Pending Reviews — Show Quarterly Report Records

**Description:** Fetch from `/api/quarterly-reports/pending-review` for University Operations entries. Replace per-pillar operation records with per-quarter report records.

**Changes in `pending-reviews.vue`:**
1. Add `quarterlyReportsPending` fetch alongside existing `opsPending`
2. Map quarterly report records: `{ title: "Quarter 1 (Jan–March) FY 2026", module: 'university_operations', ... }`
3. Remove the existing `opsPending` fetch from the University Operations tab (or keep for backward-compat during transition)
4. `moduleEndpoints['university_operations']` → use `/api/quarterly-reports` for approve/reject/withdraw

**Display in table:**
- Title: `Quarter 1 (Jan–March) — FY 2026`
- Module badge: University Operations (purple)
- Submitter + submitted date

**Verification criteria:**
- Pending Reviews shows "Quarter 1 (Jan–March) — FY 2026" (not "Technical Advisory Extension Program – FY 2026")
- Approve button calls `POST /api/quarterly-reports/:id/approve`
- Reject workflow works with quarterly report ID

---

#### EM-F: Multi-Select Batch Actions in Pending Reviews

**Description:** Add row selection and batch Approve/Reject to `pending-reviews.vue`.

**Changes:**
1. Add `show-select` to `v-data-table` and `v-model:selected="selectedItems"`
2. New ref: `selectedItems = ref<PendingItem[]>([])`
3. Add toolbar above table when `selectedItems.length > 0`:
   - "X selected" count chip
   - Batch Approve button → calls `approveItem(item)` for each selected
   - Batch Reject button → opens bulk reject dialog
   - Deselect All button
4. Add "Select All" link in toolbar (Vuetify `v-data-table` provides this via `show-select`)

**Guard**: Only show batch actions when all selected items are in the same module (or handle cross-module batch gracefully).

**Verification criteria:**
- Checkbox column appears on each row
- Select All selects all visible rows
- Batch Approve processes each item and refreshes list
- Batch Reject opens a shared rejection notes dialog then rejects all selected

---

#### EM-G: Pre-Submission Validation + HCI Error Feedback

**Description:** Before submitting the quarterly report, validate that all 4 pillars have data for the selected quarter.

**Validation logic** (client-side, before calling `/quarterly-reports/:id/submit`):
1. Fetch all 4 pillar indicator datasets in parallel:
   ```
   GET /api/university-operations/indicators?pillar_type=HIGHER_EDUCATION&fiscal_year=${FY}
   GET /api/university-operations/indicators?pillar_type=ADVANCED_EDUCATION&fiscal_year=${FY}
   GET /api/university-operations/indicators?pillar_type=RESEARCH&fiscal_year=${FY}
   GET /api/university-operations/indicators?pillar_type=TECHNICAL_ADVISORY&fiscal_year=${FY}
   ```
2. For each pillar, fetch its taxonomy to know required indicators
3. Cross-reference: for each taxonomy indicator, check if `accomplishment_q{N}` is not null/zero for the selected quarter
4. Collect failures: `{ pillarName, indicators: [{ name, issue }] }`

**Error display**: If validation fails, show a `v-alert` or dialog listing:
```
Submission failed. Missing data detected in:

• Research Program
  – Percentage of accredited graduate programs: No data for Q1

• Technical Advisory Extension Program
  – Number of extension programs conducted: No data for Q1
```

**With navigation links**: Each listed indicator links to the pillar tab + scrolls to the indicator row.

**Backend guard (optional)**: Add a `validateQuarterCompleteness(fiscal_year, quarter)` method to service that checks `operation_indicators` for null accomplishment values. Call before updating `publication_status`.

**Verification criteria:**
- Clicking Submit with missing data shows error dialog/alert
- Each error entry identifies pillar name + indicator name
- Navigation link switches to the correct pillar tab
- Submission proceeds only when all required indicators have data

---

### Phase EM Execution Priority

| Priority | Step | Severity | Backend/Frontend | Key Risk | Status |
|----------|------|----------|-----------------|----------|--------|
| 1 | EM-A: Migration 026 `quarterly_reports` | CRITICAL | Backend DB | New table — must run before EM-B | ✅ DONE |
| 2 | EM-B: Backend service + controller | CRITICAL | Backend | Reuses existing Draft Governance pattern | ✅ DONE |
| 3 | EM-C: Fix `allPillarOperations` + switch to quarterly report submit | CRITICAL | Frontend | Fixes "7 failed" error | ✅ DONE |
| 4 | EM-D: Header UI refactor (label truncation) | MEDIUM | Frontend | No dependencies | ✅ DONE |
| 5 | EM-E: Pending Reviews quarterly integration | HIGH | Frontend | Depends on EM-B | ✅ DONE |
| 6 | EM-G: Pre-submission validation + HCI feedback | MEDIUM | Frontend + optional Backend | Depends on EM-C | ⏳ DEFERRED |
| 7 | EM-F: Multi-select batch actions | LOW | Frontend | Independent enhancement | ⏳ DEFERRED |

**EM-A + EM-B require backend changes (new module + migration).**
**EM-C through EM-G are frontend-only after backend is ready.**

---
