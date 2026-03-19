# Phase Analytics Correction Research

**Date:** 2026-03-09
**Phase:** Research (ACE Framework v2.4)
**Status:** RESEARCH COMPLETE - AWAITING PLAN APPROVAL
**Scope:** Analytics Architecture Correction + Unit-Type Safe Aggregation

---

## Executive Summary

### Critical Issues Identified

1. **Architecture Violation (CRITICAL)**: Analytics components incorrectly placed in Physical Accomplishment page instead of main University Operations module
2. **Unit-Type Blind Aggregation (CRITICAL)**: Backend and frontend sum indicators across incompatible unit types (COUNT + PERCENTAGE + WEIGHTED_COUNT), producing inflated/meaningless totals
3. **Duplicate Analytics Logic**: Physical page contains redundant analytics computation that conflicts with main module analytics
4. **Quarterly Progress Widget**: Functional but uses flawed aggregation logic

### Impact

- **Data Integrity**: Displayed totals are mathematically invalid (mixing percentages with counts)
- **User Confusion**: Analytics in operational page conflicts with dashboard analytics
- **Maintenance Burden**: Duplicate logic in two locations creates synchronization risk
- **BAR1 Compliance**: Unit-type mixing violates DBM reporting standards

---

## Research Findings

### 1. Analytics Architecture Audit

#### Current State

**Main University Operations Module** (`pages/university-operations/index.vue`)
- **Correct Location**: Contains analytics dashboard with:
  - Target vs Actual by Pillar chart (lines 571-585) ✓
  - Pillar Accomplishment Rates radial chart (lines 589-607) ✓
  - Quarterly Trend line chart (lines 609-627) ✓
  - Year-over-Year bar chart (lines 629-652) ✓
  - Pillar summary cards with completion rate (lines 655-716) ✓
  - Quarterly Data Entry Progress widget (lines 719-763)
- **Data Source**: Backend API `/api/university-operations/analytics/pillar-summary` (line 148)
- **Computation**: Proper use of backend aggregations

**Physical Accomplishment Page** (`pages/university-operations/physical/index.vue`)
- **Architectural Violation**: Contains analytics components added in Phase DP:
  - `pillarSummary` computed property (lines 172-206) ❌
  - Summary stat cards (lines 1038-1072) ❌
  - Target vs Actual quarterly chart (lines 1074-1091) ❌
  - `quarterlyChartData` computed (lines 208-230) ❌
- **Purpose Conflict**: Should be pure data entry interface
- **Computation**: Local frontend aggregation (incorrect unit-type handling)

#### Architecture Violation Details

**Phase DP Additions** (user-initiated modifications):
```typescript
// Lines 177-206: Phase DP-D stat computation
const pillarSummary = computed(() => {
  const targets = pillarIndicators.value
    .map(i =>
      (parseFloat(i.target_q1) || 0) +
      (parseFloat(i.target_q2) || 0) +
      (parseFloat(i.target_q3) || 0) +
      (parseFloat(i.target_q4) || 0)
    )
    .reduce((sum, val) => sum + val, 0)  // ← CRITICAL: Sums across ALL unit types
  // ...
})
```

**Template Integration**:
- Lines 1038-1072: Four stat cards displaying totals
- Lines 1074-1091: ApexCharts bar chart
- Lines 962-968: PhysicalSummaryCard component (Phase DW-F, correct placement)

#### Correct Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Main University Operations Module                       │
│ /university-operations/index.vue                        │
├─────────────────────────────────────────────────────────┤
│ Purpose: High-level analytics dashboard                 │
│                                                          │
│ ✓ Target vs Actual by Pillar (4 pillars)               │
│ ✓ Pillar Accomplishment Rates                          │
│ ✓ Quarterly Trend (system-wide)                        │
│ ✓ Year-over-Year Comparison                            │
│ ✓ Pillar Summary Cards                                 │
│ ✓ Quarterly Data Entry Progress                        │
└─────────────────────────────────────────────────────────┘
                        │
                        │ Navigate to Physical
                        ▼
┌─────────────────────────────────────────────────────────┐
│ Physical Accomplishment Page                            │
│ /university-operations/physical/index.vue               │
├─────────────────────────────────────────────────────────┤
│ Purpose: Operational data entry and indicator view      │
│                                                          │
│ ✓ Pillar tabs (4 pillars)                              │
│ ✓ Outcome indicators table                             │
│ ✓ Output indicators table                              │
│ ✓ Quarterly data entry dialog                          │
│ ✓ PhysicalSummaryCard (pillar-specific, acceptable)    │
│                                                          │
│ ✗ NO stat cards dashboard                              │
│ ✗ NO Target vs Actual charts                           │
│ ✗ NO analytics visualizations                          │
└─────────────────────────────────────────────────────────┘
```

---

### 2. Unit-Type Blind Aggregation Analysis

#### Root Cause: Invalid Summation Across Incompatible Units

**Backend Query** (`university-operations.service.ts` lines 1589-1594):
```sql
SUM(
  COALESCE(oi.target_q1, 0) + COALESCE(oi.target_q2, 0) +
  COALESCE(oi.target_q3, 0) + COALESCE(oi.target_q4, 0)
) AS total_target
```

**Problem**: This query sums ALL indicators for a pillar without filtering by `unit_type`.

**Example Scenario** (Higher Education Pillar):
```
Indicator 1: Type=COUNT, Q1=10, Q2=15, Q3=12, Q4=13  → Total=50
Indicator 2: Type=PERCENTAGE, Q1=85%, Q2=90%, Q3=88%, Q4=92%  → Total=355%
Indicator 3: Type=COUNT, Q1=5, Q2=7, Q3=6, Q4=8  → Total=26
Indicator 4: Type=WEIGHTED_COUNT, Q1=10pts, Q2=12pts, Q3=11pts, Q4=13pts  → Total=46pts

Backend SUM: 50 + 355 + 26 + 46 = 477  ← MEANINGLESS
```

**Observed Behavior**: User reports ~40 actual values but UI shows 265 target / 465 actual, confirming unit-type mixing.

#### Unit Types in System

From taxonomy queries (lines 697, 719, 755):
- **COUNT**: Absolute counts (e.g., number of graduates)
- **PERCENTAGE**: Ratio values 0-100 (e.g., pass rate)
- **WEIGHTED_COUNT**: Scored values with "pts" suffix (e.g., performance points)

**Mathematical Invalidity**:
- Adding 10 graduates + 85% pass rate = **nonsensical**
- Percentages cannot be summed (must be weighted by denominator)
- Weighted counts use different scales than raw counts

#### Frontend Duplication

**Physical Page** (lines 179-195):
```typescript
const targets = pillarIndicators.value
  .map(i =>
    (parseFloat(i.target_q1) || 0) +
    (parseFloat(i.target_q2) || 0) +
    // ... sum all quarters
  )
  .reduce((sum, val) => sum + val, 0)  // ← Same error as backend
```

**Issue**: Frontend replicates backend's unit-type blindness.

---

### 3. Correct Aggregation Model

#### BAR1 Compliance Requirements

Per DBM BAR1 reporting standards:
1. **COUNT indicators**: Can be summed
2. **PERCENTAGE indicators**: Must be weighted by denominator or excluded from totals
3. **WEIGHTED_COUNT indicators**: Can be summed if using consistent scoring rubric

#### Proposed Aggregation Rules

**Option A: COUNT-Only Aggregation** (Recommended)
```sql
-- Backend: Filter by unit_type
SUM(
  CASE WHEN pit.unit_type = 'COUNT'
  THEN COALESCE(oi.target_q1, 0) + COALESCE(oi.target_q2, 0) +
       COALESCE(oi.target_q3, 0) + COALESCE(oi.target_q4, 0)
  ELSE 0
  END
) AS total_target_count
```

**Benefits**:
- Mathematically valid
- Preserves data integrity
- Simple implementation

**Tradeoffs**:
- Excludes percentage indicators from totals
- May underrepresent performance if many percentage indicators

**Option B: Weighted Average for Percentages**
```sql
-- Separate aggregations per unit type
SUM(...) AS total_count,
AVG(CASE WHEN pit.unit_type = 'PERCENTAGE' THEN ... END) AS avg_percentage,
SUM(CASE WHEN pit.unit_type = 'WEIGHTED_COUNT' THEN ... END) AS total_weighted
```

**Benefits**:
- Retains all indicator types
- Statistically sound

**Tradeoffs**:
- More complex UI (3 separate totals)
- User training required

**Recommendation**: Option A (COUNT-Only) for Phase 1, Option B for future enhancement.

---

### 4. Analytics Dashboard Layout Review

#### Current Main Module Layout

**Row 1**: Target vs Actual by Pillar (full-width chart)
**Row 2**: Three charts (Pillar Rates, Quarterly Trend, Year Comparison)
**Row 3**: Pillar summary cards (4 cards)
**Row 4**: Quarterly Data Entry Progress (4 cards)

#### Recommended Layout

**Row 1**: Pillar Summary Cards (4 cards) - Most important KPIs
**Row 2**: Target vs Actual by Pillar (full-width chart)
**Row 3**: Pillar Rates, Quarterly Trend, Year Comparison (3 charts)
**Row 4**: [Keep Quarterly Progress if functional, remove if broken]

**Rationale**: Executive-level KPIs (stat cards) should appear first per dashboard design best practices.

---

### 5. Quarterly Data Entry Progress Widget Assessment

#### Current Implementation

**Function** (`index.vue` lines 97-141):
```typescript
async function fetchPillarProgress() {
  const promises = PILLARS.map(async (pillar) => {
    const res = await api.get<any>(
      `/api/university-operations/indicators?pillar_type=${pillar.id}&fiscal_year=${selectedFiscalYear.value}`
    )
    const indicators = Array.isArray(res) ? res : res?.data || []

    let quartersComplete = 0
    for (const q of ['q1', 'q2', 'q3', 'q4']) {
      const hasData = indicators.some((ind: any) =>
        ind[`target_${q}`] !== null || ind[`accomplishment_${q}`] !== null
      )
      if (hasData) quartersComplete++
    }
    return { pillar: pillar.id, quartersComplete }
  })
  // ...
}
```

**Assessment**:
- ✓ Logic is sound (counts quarters with any data)
- ✓ Does NOT aggregate values (just checks presence)
- ✓ No unit-type dependency
- ✓ Functional per code review

**Conclusion**: Widget is **FUNCTIONAL** and should be **RETAINED**.

---

### 6. Risk Assessment

| Risk | Severity | Impact | Mitigation |
|------|----------|--------|------------|
| Data integrity loss | CRITICAL | Users cannot trust displayed totals | Implement unit-type filtering immediately |
| User confusion | HIGH | Analytics in two places conflicts | Remove analytics from physical page |
| BAR1 non-compliance | HIGH | Incorrect totals violate DBM standards | Apply COUNT-only aggregation |
| Regression during refactor | MEDIUM | Breaking existing functionality | Comprehensive testing matrix |
| Backend query performance | LOW | Unit-type filtering adds JOIN | Query already includes pit JOIN |
| Frontend computation cost | LOW | Removing local computed improves performance | Net performance gain |

---

## Root Cause Summary

1. **Phase DP User Modifications**: User added analytics to physical page without realizing architecture violation
2. **No Unit-Type Validation**: Neither backend nor frontend validates unit compatibility before aggregation
3. **Duplicate Logic**: Physical page replicates main module analytics with same flawed logic
4. **Missing Architectural Guidance**: No clear separation of concerns between analytics dashboard vs operational interface

---

## Verification Data

### Backend Query Analysis

**File**: `pmo-backend/src/university-operations/university-operations.service.ts`

**Lines 1585-1609**: `getPillarSummary()` SUM query
- No `WHERE pit.unit_type = 'COUNT'` filter
- No unit-type grouping
- Returns single total per pillar (invalid)

**Lines 697, 719, 755**: Taxonomy queries fetch `unit_type` but do NOT use for aggregation

### Frontend Code Analysis

**File**: `pmo-frontend/pages/university-operations/physical/index.vue`

**Lines 172-206**: Local `pillarSummary` computed
- Sums all `pillarIndicators.value` without unit-type check
- Duplicates backend logic (should defer to backend)

**Lines 1038-1091**: Stat cards and chart templates
- Directly display `pillarSummary.totalTarget` and `.totalAccomplishment`
- No unit-type awareness in display logic

**Lines 208-243**: `quarterlyChartData` computed
- Also sums across all indicators per quarter
- Same unit-type blindness

### Main Module Validation

**File**: `pmo-frontend/pages/university-operations/index.vue`

**Lines 147-164**: `fetchAnalytics()` uses backend API
- Correct approach (defers to backend)
- But backend data is also flawed (unit-type mixing)

**Lines 571-716**: Analytics dashboard components
- Properly placed in main module ✓
- But displays flawed backend totals ✗

---

## Test Case: Unit-Type Mixing Scenario

**Setup**:
- Higher Education Pillar, FY 2026
- 3 Outcome Indicators:
  1. Indicator A: COUNT, Q1=10, Q2=10, Q3=10, Q4=10 (Total=40)
  2. Indicator B: PERCENTAGE, Q1=85, Q2=90, Q3=88, Q4=92 (Total=355)
  3. Indicator C: COUNT, Q1=5, Q2=7, Q3=6, Q4=8 (Total=26)

**Expected Behavior** (COUNT-only):
- Total Target = 40 + 26 = **66**

**Current Behavior** (unit-type blind):
- Total Target = 40 + 355 + 26 = **421**

**Observed UI**: "265 target / 465 actual"
**Analysis**: Values suggest multiple percentage indicators mixed with counts

---

## Regulatory Compliance

### DBM BAR1 Reporting Standards

From `docs/References/bar1_excel_structural_blueprint.md`:

> Indicators must maintain unit-type consistency within aggregations. Percentage indicators represent ratios and cannot be arithmetically summed with count indicators.

**Current Implementation**: **NON-COMPLIANT**

---

## Recommended Approach

### Phase 1: Critical Fixes (Immediate)

1. **Remove analytics from physical page** (CRITICAL)
   - Delete stat cards template (lines 1038-1072)
   - Delete quarterly chart template (lines 1074-1091)
   - Delete `pillarSummary` computed (lines 172-206)
   - Delete `quarterlyChartData` computed (lines 208-243)
   - Retain `PhysicalSummaryCard` component (acceptable pillar-specific widget)

2. **Implement COUNT-only aggregation** (CRITICAL)
   - Update backend query to filter `pit.unit_type = 'COUNT'`
   - Add separate fields for percentage indicators (weighted average)
   - Update frontend to display unit-specific totals

3. **Retain functional widgets** (LOW PRIORITY)
   - Keep Quarterly Data Entry Progress widget (verified functional)

### Phase 2: Analytics Enhancement (Future)

1. Implement multi-unit dashboard with separate sections per unit type
2. Add weighted average computation for percentage indicators
3. Add unit-type legend/indicators on charts

---

## Files Requiring Modification

| File | Change Type | Priority |
|------|-------------|----------|
| `pmo-backend/src/university-operations/university-operations.service.ts` | Modify: Add unit-type filtering to getPillarSummary() | CRITICAL |
| `pmo-frontend/pages/university-operations/physical/index.vue` | Remove: Delete analytics components (stat cards, chart) | CRITICAL |
| `pmo-frontend/pages/university-operations/index.vue` | Modify: Update to display unit-specific totals | HIGH |
| `pmo-frontend/components/PhysicalSummaryCard.vue` | Retain: Acceptable pillar-specific component | LOW |

---

## Success Criteria

1. **Architecture**:
   - ✓ All analytics components exist ONLY in main university operations module
   - ✓ Physical page contains NO stat cards or aggregate charts
   - ✓ PhysicalSummaryCard retained as acceptable pillar-level summary

2. **Data Integrity**:
   - ✓ Totals computed using COUNT-only indicators
   - ✓ Percentage indicators displayed separately or as weighted average
   - ✓ UI displays mathematically valid totals

3. **BAR1 Compliance**:
   - ✓ Unit-type separation maintained per DBM standards
   - ✓ Aggregation logic documented

4. **User Experience**:
   - ✓ Clear separation between dashboard (analytics) and operational (data entry) interfaces
   - ✓ Quarterly Data Entry Progress widget functional

---

**END OF RESEARCH PHASE**

**Next Step**: Generate Phase 2 Implementation Plan
