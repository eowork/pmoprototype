# Phase Analytics Correction Implementation Plan

**Date:** 2026-03-09
**Phase:** Plan (ACE Framework v2.4)
**Status:** PLAN READY FOR APPROVAL
**Research Reference:** `docs/research_phase_analytics_correction.md`
**Artifact Governance:** Compliant with MIS standards and BAR1 requirements

---

## Executive Summary

This plan addresses CRITICAL analytics architecture violations and data integrity issues:

1. **Remove misplaced analytics from Physical Accomplishment page** (Phase DP components)
2. **Implement unit-type safe aggregation** in backend and frontend
3. **Retain functional components** (PhysicalSummaryCard, Quarterly Progress widget)
4. **Enforce architectural separation** between analytics dashboard and operational interface

**NO UI REGRESSIONS ALLOWED** - All changes must preserve correct functionality while removing incorrect components.

---

## Implementation Tasks

### Task A: Remove Analytics from Physical Page (CRITICAL)

**Root Cause**: Phase DP user modifications added analytics components to operational interface.

**File**: `pmo-frontend/pages/university-operations/physical/index.vue`

#### Step 1: Remove Stat Cards Computed Property

**Lines to DELETE: 172-206**
```typescript
// DELETE THIS ENTIRE BLOCK
// Phase DW-F: Compute pillar summary totals for summary widget
// Phase DP-D: Extended with variance and achievement rate for stat cards
const pillarSummary = computed(() => {
  const targets = pillarIndicators.value
    .map(i =>
      (parseFloat(i.target_q1) || 0) +
      (parseFloat(i.target_q2) || 0) +
      (parseFloat(i.target_q3) || 0) +
      (parseFloat(i.target_q4) || 0)
    )
    .reduce((sum, val) => sum + val, 0)

  const accomplishments = pillarIndicators.value
    .map(i =>
      (parseFloat(i.accomplishment_q1) || 0) +
      (parseFloat(i.accomplishment_q2) || 0) +
      (parseFloat(i.accomplishment_q3) || 0) +
      (parseFloat(i.accomplishment_q4) || 0)
    )
    .reduce((sum, val) => sum + val, 0)

  const variance = accomplishments - targets
  const rate = targets > 0 ? (accomplishments / targets) * 100 : null

  return {
    totalTarget: targets,
    totalAccomplishment: accomplishments,
    variance,
    rate,
  }
})
```

**IMPORTANT**: This computed property uses unit-type blind aggregation (sums percentages with counts).

#### Step 2: Remove Quarterly Chart Computed Properties

**Lines to DELETE: 208-243**
```typescript
// DELETE THIS ENTIRE BLOCK
// Phase DP-C: Quarterly chart data for Target vs Actual visualization
const quarterlyChartData = computed(() => {
  const targetData: number[] = []
  const actualData: number[] = []

  for (let qIdx = 1; qIdx <= 4; qIdx++) {
    const targetKey = `target_q${qIdx}`
    const actualKey = `accomplishment_q${qIdx}`

    const qTarget = pillarIndicators.value.reduce((sum, i) =>
      sum + (parseFloat(i[targetKey]) || 0), 0)
    const qActual = pillarIndicators.value.reduce((sum, i) =>
      sum + (parseFloat(i[actualKey]) || 0), 0)

    targetData.push(parseFloat(qTarget.toFixed(2)))
    actualData.push(parseFloat(qActual.toFixed(2)))
  }

  return [
    { name: 'Target', data: targetData },
    { name: 'Accomplishment', data: actualData },
  ]
})

const quarterlyChartOptions = computed(() => ({
  chart: { type: 'bar' as const, toolbar: { show: false }, fontFamily: 'inherit' },
  plotOptions: {
    bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 },
  },
  xaxis: { categories: ['Q1', 'Q2', 'Q3', 'Q4'] },
  yaxis: { title: { text: 'Values' }, labels: { formatter: (v: number) => v.toFixed(1) } },
  dataLabels: { enabled: true, offsetY: -20, style: { fontSize: '11px', colors: ['#333'] } },
  legend: { position: 'top' as const },
  colors: ['#1976D2', '#4CAF50'],
  tooltip: { y: { formatter: (v: number) => v.toFixed(2) } },
}))
```

#### Step 3: Remove Stat Cards from Template

**Lines to DELETE: 1038-1072**
```vue
<!-- DELETE THIS ENTIRE BLOCK -->
<!-- Phase DP-D: Summary Stat Cards -->
<v-row v-if="pillarIndicators.length > 0" class="mb-4">
  <v-col cols="12" sm="6" md="3">
    <v-card variant="tonal" color="blue">
      <v-card-text class="text-center pa-3">
        <div class="text-h6 font-weight-bold">{{ formatNumber(pillarSummary.totalTarget) }}</div>
        <div class="text-caption text-grey-darken-1">Total Target</div>
      </v-card-text>
    </v-card>
  </v-col>
  <!-- ... 3 more stat cards ... -->
</v-row>
```

#### Step 4: Remove Quarterly Chart from Template

**Lines to DELETE: 1074-1091**
```vue
<!-- DELETE THIS ENTIRE BLOCK -->
<!-- Phase DP-C: Target vs Actual Quarterly Chart -->
<v-card v-if="pillarIndicators.length > 0" class="mb-4" variant="tonal">
  <v-card-title class="text-subtitle-1 d-flex align-center">
    <v-icon start size="small" color="primary">mdi-chart-bar</v-icon>
    Target vs Actual (Quarterly)
  </v-card-title>
  <v-card-text>
    <ClientOnly>
      <VueApexCharts
        type="bar"
        height="280"
        :options="quarterlyChartOptions"
        :series="quarterlyChartData"
      />
    </ClientOnly>
  </v-card-text>
</v-card>
```

#### Step 5: Remove ApexCharts Import (if unused elsewhere)

**Line 14: Remove if no other charts exist in physical page**
```typescript
// DELETE IF NO OTHER CHARTS
import VueApexCharts from 'vue3-apexcharts'
```

**Verification**: Check if `VueApexCharts` is used elsewhere in physical page before removing.

#### Step 6: Retain PhysicalSummaryCard Component

**Lines 962-968: KEEP THIS** (acceptable pillar-specific widget)
```vue
<!-- Phase DW-F: Pillar Summary Widget -->
<!-- RETAIN THIS - Pillar-specific summary is acceptable -->
<PhysicalSummaryCard
  v-if="pillarIndicators.length > 0"
  :pillar-name="currentPillar.fullName"
  :pillar-config="{ color: currentPillar.color, icon: currentPillar.icon }"
  :fiscal-year="selectedFiscalYear"
  :total-target="pillarSummary.totalTarget"
  :total-accomplishment="pillarSummary.totalAccomplishment"
/>
```

**PROBLEM**: This component references `pillarSummary` which we're deleting.

**Solution**: Create minimal computed for PhysicalSummaryCard only:
```typescript
// Phase Analytics Correction: Minimal pillar summary for detail card only
// This is acceptable for operational context (single pillar view)
const pillarDetailSummary = computed(() => {
  const targets = pillarIndicators.value
    .map(i =>
      (parseFloat(i.target_q1) || 0) +
      (parseFloat(i.target_q2) || 0) +
      (parseFloat(i.target_q3) || 0) +
      (parseFloat(i.target_q4) || 0)
    )
    .reduce((sum, val) => sum + val, 0)

  const accomplishments = pillarIndicators.value
    .map(i =>
      (parseFloat(i.accomplishment_q1) || 0) +
      (parseFloat(i.accomplishment_q2) || 0) +
      (parseFloat(i.accomplishment_q3) || 0) +
      (parseFloat(i.accomplishment_q4) || 0)
    )
    .reduce((sum, val) => sum + val, 0)

  return {
    totalTarget: targets,
    totalAccomplishment: accomplishments,
  }
})
```

**Rationale**: PhysicalSummaryCard shows pillar-level operational summary, NOT cross-pillar analytics. Unit-type mixing is still incorrect but acceptable in operational context (will be fixed in Phase 2).

**Update Template**:
```vue
<PhysicalSummaryCard
  v-if="pillarIndicators.length > 0"
  :pillar-name="currentPillar.fullName"
  :pillar-config="{ color: currentPillar.color, icon: currentPillar.icon }"
  :fiscal-year="selectedFiscalYear"
  :total-target="pillarDetailSummary.totalTarget"
  :total-accomplishment="pillarDetailSummary.totalAccomplishment"
/>
```

**Verification**:
- [ ] All Phase DP analytics components removed from physical page
- [ ] Physical page compiles without TypeScript errors
- [ ] PhysicalSummaryCard still renders correctly
- [ ] No references to deleted `pillarSummary` computed
- [ ] Outcome/Output indicator tables still functional

---

### Task B: Implement Unit-Type Safe Aggregation (CRITICAL)

**Root Cause**: Backend SUMs all indicators regardless of unit_type, producing invalid totals.

**File**: `pmo-backend/src/university-operations/university-operations.service.ts`

#### Step 1: Update getPillarSummary() Query

**Current Code** (Lines 1585-1609):
```sql
SELECT
  pit.pillar_type,
  COUNT(DISTINCT oi.pillar_indicator_id) AS indicators_with_data,
  SUM(
    COALESCE(oi.target_q1, 0) + COALESCE(oi.target_q2, 0) +
    COALESCE(oi.target_q3, 0) + COALESCE(oi.target_q4, 0)
  ) AS total_target,
  -- ... (current query sums ALL unit types)
```

**Corrected Code**:
```sql
SELECT
  pit.pillar_type,
  COUNT(DISTINCT oi.pillar_indicator_id) AS indicators_with_data,

  -- Phase Analytics Correction: COUNT-only aggregation
  SUM(
    CASE WHEN pit.unit_type = 'COUNT'
    THEN COALESCE(oi.target_q1, 0) + COALESCE(oi.target_q2, 0) +
         COALESCE(oi.target_q3, 0) + COALESCE(oi.target_q4, 0)
    ELSE 0
    END
  ) AS total_target_count,

  SUM(
    CASE WHEN pit.unit_type = 'COUNT'
    THEN COALESCE(oi.accomplishment_q1, 0) + COALESCE(oi.accomplishment_q2, 0) +
         COALESCE(oi.accomplishment_q3, 0) + COALESCE(oi.accomplishment_q4, 0)
    ELSE 0
    END
  ) AS total_accomplishment_count,

  -- Phase Analytics Correction: WEIGHTED_COUNT aggregation (optional)
  SUM(
    CASE WHEN pit.unit_type = 'WEIGHTED_COUNT'
    THEN COALESCE(oi.target_q1, 0) + COALESCE(oi.target_q2, 0) +
         COALESCE(oi.target_q3, 0) + COALESCE(oi.target_q4, 0)
    ELSE 0
    END
  ) AS total_target_weighted,

  SUM(
    CASE WHEN pit.unit_type = 'WEIGHTED_COUNT'
    THEN COALESCE(oi.accomplishment_q1, 0) + COALESCE(oi.accomplishment_q2, 0) +
         COALESCE(oi.accomplishment_q3, 0) + COALESCE(oi.accomplishment_q4, 0)
    ELSE 0
    END
  ) AS total_accomplishment_weighted,

  -- Phase Analytics Correction: PERCENTAGE indicators (weighted average)
  -- Exclude from totals, calculate separately
  AVG(
    CASE WHEN pit.unit_type = 'PERCENTAGE'
    THEN (COALESCE(oi.accomplishment_q1, 0) + COALESCE(oi.accomplishment_q2, 0) +
          COALESCE(oi.accomplishment_q3, 0) + COALESCE(oi.accomplishment_q4, 0)) / 4.0
    ELSE NULL
    END
  ) AS avg_percentage_accomplishment,

  AVG(
    CASE
      WHEN COALESCE(oi.target_q1, 0) + COALESCE(oi.target_q2, 0) +
           COALESCE(oi.target_q3, 0) + COALESCE(oi.target_q4, 0) > 0
      THEN (
        (COALESCE(oi.accomplishment_q1, 0) + COALESCE(oi.accomplishment_q2, 0) +
         COALESCE(oi.accomplishment_q3, 0) + COALESCE(oi.accomplishment_q4, 0)) /
        NULLIF(COALESCE(oi.target_q1, 0) + COALESCE(oi.target_q2, 0) +
               COALESCE(oi.target_q3, 0) + COALESCE(oi.target_q4, 0), 0)
      ) * 100
      ELSE NULL
    END
  ) AS avg_accomplishment_rate
FROM operation_indicators oi
JOIN pillar_indicator_taxonomy pit ON oi.pillar_indicator_id = pit.id
WHERE oi.fiscal_year = $1 AND oi.deleted_at IS NULL AND pit.is_active = true
GROUP BY pit.pillar_type
```

#### Step 2: Update TypeScript Return Type

**Current Type** (Lines 1540-1555):
```typescript
async getPillarSummary(fiscalYear: number): Promise<{
  pillars: {
    pillar_type: string;
    pillar_label: string;
    organizational_outcome: string;
    total_taxonomy_indicators: number;
    indicators_with_data: number;
    completion_rate: number;
    total_target: number;  // ← INVALID (mixes unit types)
    total_accomplishment: number;  // ← INVALID
    average_accomplishment_rate: number | null;
    outcome_indicators: number;
    output_indicators: number;
  }[];
  fiscal_year: number;
}> {
```

**Corrected Type**:
```typescript
async getPillarSummary(fiscalYear: number): Promise<{
  pillars: {
    pillar_type: string;
    pillar_label: string;
    organizational_outcome: string;
    total_taxonomy_indicators: number;
    indicators_with_data: number;
    completion_rate: number;

    // Phase Analytics Correction: Unit-type specific fields
    total_target_count: number;
    total_accomplishment_count: number;
    total_target_weighted: number;
    total_accomplishment_weighted: number;
    avg_percentage_accomplishment: number | null;

    average_accomplishment_rate: number | null;
    outcome_indicators: number;
    output_indicators: number;
  }[];
  fiscal_year: number;
}> {
```

#### Step 3: Update Data Mapping

**Current Mapping** (Lines 1623-1645):
```typescript
const pillars = taxonomyRes.rows.map((t) => {
  const data = dataMap.get(t.pillar_type);
  const totalTaxonomy = parseInt(t.total, 10);
  const withData = data ? parseInt(data.indicators_with_data, 10) : 0;

  const completionRate = totalTaxonomy > 0
    ? parseFloat(((withData / totalTaxonomy) * 100).toFixed(2))
    : 0;

  return {
    pillar_type: t.pillar_type,
    pillar_label: pillarLabels[t.pillar_type] || t.pillar_type,
    organizational_outcome: pillarOO[t.pillar_type] || '',
    total_taxonomy_indicators: totalTaxonomy,
    indicators_with_data: withData,
    completion_rate: completionRate,
    total_target: data?.total_target ? parseFloat(data.total_target) : 0,  // ← REMOVE
    total_accomplishment: data?.total_accomplishment ? parseFloat(data.total_accomplishment) : 0,  // ← REMOVE
    average_accomplishment_rate: data?.avg_accomplishment_rate
      ? parseFloat(parseFloat(data.avg_accomplishment_rate).toFixed(2))
      : null,
    outcome_indicators: parseInt(t.outcome_count, 10),
    output_indicators: parseInt(t.output_count, 10),
  };
});
```

**Corrected Mapping**:
```typescript
const pillars = taxonomyRes.rows.map((t) => {
  const data = dataMap.get(t.pillar_type);
  const totalTaxonomy = parseInt(t.total, 10);
  const withData = data ? parseInt(data.indicators_with_data, 10) : 0;

  const completionRate = totalTaxonomy > 0
    ? parseFloat(((withData / totalTaxonomy) * 100).toFixed(2))
    : 0;

  return {
    pillar_type: t.pillar_type,
    pillar_label: pillarLabels[t.pillar_type] || t.pillar_type,
    organizational_outcome: pillarOO[t.pillar_type] || '',
    total_taxonomy_indicators: totalTaxonomy,
    indicators_with_data: withData,
    completion_rate: completionRate,

    // Phase Analytics Correction: Unit-type specific totals
    total_target_count: data?.total_target_count ? parseFloat(data.total_target_count) : 0,
    total_accomplishment_count: data?.total_accomplishment_count ? parseFloat(data.total_accomplishment_count) : 0,
    total_target_weighted: data?.total_target_weighted ? parseFloat(data.total_target_weighted) : 0,
    total_accomplishment_weighted: data?.total_accomplishment_weighted ? parseFloat(data.total_accomplishment_weighted) : 0,
    avg_percentage_accomplishment: data?.avg_percentage_accomplishment
      ? parseFloat(parseFloat(data.avg_percentage_accomplishment).toFixed(2))
      : null,

    average_accomplishment_rate: data?.avg_accomplishment_rate
      ? parseFloat(parseFloat(data.avg_accomplishment_rate).toFixed(2))
      : null,
    outcome_indicators: parseInt(t.outcome_count, 10),
    output_indicators: parseInt(t.output_count, 10),
  };
});
```

**Verification**:
- [ ] Backend compiles without TypeScript errors
- [ ] getPillarSummary() query includes unit-type filtering
- [ ] Return type matches new field structure
- [ ] Data mapping correctly extracts unit-specific fields

---

### Task C: Update Frontend Analytics Display (HIGH)

**File**: `pmo-frontend/pages/university-operations/index.vue`

#### Step 1: Update Target vs Actual Chart Series

**Current Code** (Lines 407-430):
```typescript
const targetVsActualSeries = computed(() => {
  if (!pillarSummary.value?.pillars) {
    return [
      { name: 'Target', data: [0, 0, 0, 0] },
      { name: 'Actual', data: [0, 0, 0, 0] },
    ]
  }
  return [
    {
      name: 'Target',
      data: PILLARS.map(p => {
        const pillarData = pillarSummary.value.pillars.find((ps: any) => ps.pillar_type === p.id)
        return pillarData?.total_target || 0  // ← Uses invalid field
      }),
    },
    {
      name: 'Actual',
      data: PILLARS.map(p => {
        const pillarData = pillarSummary.value.pillars.find((ps: any) => ps.pillar_type === p.id)
        return pillarData?.total_accomplishment || 0  // ← Uses invalid field
      }),
    },
  ]
})
```

**Corrected Code**:
```typescript
// Phase Analytics Correction: Use COUNT-only totals (unit-type safe)
const targetVsActualSeries = computed(() => {
  if (!pillarSummary.value?.pillars) {
    return [
      { name: 'Target (Count)', data: [0, 0, 0, 0] },
      { name: 'Actual (Count)', data: [0, 0, 0, 0] },
    ]
  }
  return [
    {
      name: 'Target (Count)',
      data: PILLARS.map(p => {
        const pillarData = pillarSummary.value.pillars.find((ps: any) => ps.pillar_type === p.id)
        return pillarData?.total_target_count || 0
      }),
    },
    {
      name: 'Actual (Count)',
      data: PILLARS.map(p => {
        const pillarData = pillarSummary.value.pillars.find((ps: any) => ps.pillar_type === p.id)
        return pillarData?.total_accomplishment_count || 0
      }),
    },
  ]
})
```

#### Step 2: Add Unit-Type Legend to Chart

**Update Chart Title** (Line 574):
```vue
<!-- BEFORE -->
<v-card-title class="text-subtitle-1 d-flex align-center">
  <v-icon start size="small" color="primary">mdi-chart-bar-stacked</v-icon>
  Target vs Actual by Pillar - FY {{ selectedFiscalYear }}
</v-card-title>

<!-- AFTER -->
<v-card-title class="text-subtitle-1 d-flex align-center justify-space-between">
  <div class="d-flex align-center">
    <v-icon start size="small" color="primary">mdi-chart-bar-stacked</v-icon>
    Target vs Actual by Pillar - FY {{ selectedFiscalYear }}
  </div>
  <v-chip size="small" color="primary" variant="outlined">
    <v-icon start size="x-small">mdi-counter</v-icon>
    COUNT Indicators Only
  </v-chip>
</v-card-title>
```

#### Step 3: Update Pillar Summary Cards (Optional Enhancement)

**Current Display** (Lines 675-689): Shows generic "Indicators" and "Outcomes/Outputs".

**Enhanced Display** (Optional for Phase 2):
```vue
<div class="d-flex justify-space-between text-caption mb-1">
  <span class="text-grey">COUNT Indicators:</span>
  <span class="font-weight-medium">
    {{ pillarSummary.pillars.find((p: any) => p.pillar_type === pillar.id)?.total_accomplishment_count || 0 }}
  </span>
</div>
<div class="d-flex justify-space-between text-caption mb-1">
  <span class="text-grey">Weighted Indicators:</span>
  <span class="font-weight-medium">
    {{ pillarSummary.pillars.find((p: any) => p.pillar_type === pillar.id)?.total_accomplishment_weighted || 0 }}pts
  </span>
</div>
<div class="d-flex justify-space-between text-caption mb-1">
  <span class="text-grey">Avg Percentage:</span>
  <span class="font-weight-medium">
    {{ (pillarSummary.pillars.find((p: any) => p.pillar_type === pillar.id)?.avg_percentage_accomplishment || 0).toFixed(1) }}%
  </span>
</div>
```

**Recommendation**: Implement in Phase 2 after validating COUNT-only approach.

**Verification**:
- [ ] Target vs Actual chart displays COUNT-only data
- [ ] Chart legend indicates unit-type restriction
- [ ] Pillar summary cards display valid totals
- [ ] No TypeScript errors

---

### Task D: Regression Testing (IMPORTANT)

#### Test Matrix

| Test Case | Expected Behavior | Verification Method |
|-----------|-------------------|---------------------|
| **Physical Page Rendering** | Page loads without analytics components | Visual inspection |
| **PhysicalSummaryCard Display** | Component still renders with pillar totals | Visual inspection |
| **Outcome/Output Tables** | Indicator tables display correctly | Visual inspection |
| **Quarterly Data Entry** | Dialog opens and saves data successfully | Functional test |
| **Main Module Analytics** | Target vs Actual chart displays COUNT-only totals | Visual inspection + data validation |
| **Pillar Summary Cards** | Cards display valid totals (no unit-type mixing) | Data validation |
| **Quarterly Progress Widget** | Widget displays quarters with data (functional) | Functional test |
| **Backend API Response** | getPillarSummary returns unit-specific fields | API inspection |
| **Unit-Type Separation** | COUNT indicators excluded from PERCENTAGE/WEIGHTED aggregations | SQL query validation |

#### Validation Scenarios

**Scenario 1: Higher Education Pillar, FY 2026**
- Setup: 2 COUNT indicators (values ~40), 1 PERCENTAGE indicator (values ~85%)
- Expected: Target vs Actual chart shows ~40 (COUNT-only)
- Current (broken): Chart shows ~125 (mixed unit types)

**Scenario 2: Research Pillar, All Pillars View**
- Setup: Navigate to main module
- Expected: All 4 pillars show COUNT-only totals
- Verify: No percentages added to counts

**Scenario 3: Physical Page Data Entry**
- Setup: Navigate to physical/index.vue
- Expected: NO stat cards, NO quarterly chart, PhysicalSummaryCard present
- Verify: Page renders without analytics dashboard components

---

## Implementation Order

| Order | Task | Severity | Estimated Scope | Dependencies |
|-------|------|----------|-----------------|--------------|
| 1 | Task A: Remove Analytics from Physical Page | CRITICAL | 30-45 minutes | None |
| 2 | Task B: Implement Unit-Type Safe Aggregation | CRITICAL | 1-2 hours | None |
| 3 | Task C: Update Frontend Analytics Display | HIGH | 30-45 minutes | Task B |
| 4 | Task D: Regression Testing | IMPORTANT | 1 hour | Tasks A, B, C |

**Total Estimated Time:** 3-4.5 hours

---

## Files to Modify

| File | Change Type | Lines | Tasks |
|------|-------------|-------|-------|
| `pmo-frontend/pages/university-operations/physical/index.vue` | DELETE + ADD | 172-243, 1038-1091, +new computed | A |
| `pmo-backend/src/university-operations/university-operations.service.ts` | MODIFY | 1585-1645 | B |
| `pmo-frontend/pages/university-operations/index.vue` | MODIFY | 407-430, 574 | C |

---

## Risk Mitigation

| Risk | Severity | Impact | Mitigation |
|------|----------|--------|------------|
| PhysicalSummaryCard breaks | MEDIUM | Component no longer displays | Create `pillarDetailSummary` computed |
| Backend query performance | LOW | Additional CASE statements | Minimal impact (JOIN already exists) |
| User confusion about COUNT-only | MEDIUM | Users question missing percentage indicators | Add unit-type legend to charts |
| Regression in data entry | CRITICAL | Users cannot save quarterly data | Comprehensive functional testing |
| TypeScript compilation errors | MEDIUM | Frontend fails to build | Validate all type changes before commit |

---

## Success Criteria

### A. Analytics Relocation (CRITICAL)

**Verification**:
- ✓ Physical page contains NO stat cards (4 cards removed)
- ✓ Physical page contains NO quarterly chart (bar chart removed)
- ✓ Physical page contains NO `pillarSummary` computed (deleted)
- ✓ Physical page contains NO `quarterlyChartData` computed (deleted)
- ✓ PhysicalSummaryCard component still renders (retained with new computed)
- ✓ Main module analytics dashboard functional (unchanged location)

**Test**: Navigate to `/university-operations/physical` → Verify NO analytics dashboard components present

---

### B. Unit-Type Safe Aggregation (CRITICAL)

**Verification**:
- ✓ Backend query filters by `pit.unit_type = 'COUNT'` for totals
- ✓ Backend returns `total_target_count` and `total_accomplishment_count` fields
- ✓ Frontend charts display COUNT-only data
- ✓ Chart legend indicates unit-type restriction ("COUNT Indicators Only")

**Test**: Query `/api/university-operations/analytics/pillar-summary?fiscal_year=2026` → Verify `total_target_count` field present

---

### C. Data Integrity (CRITICAL)

**Verification**:
- ✓ Higher Education pillar shows ~40 target (not ~265)
- ✓ No percentage values (85%, 90%) added to count totals
- ✓ Variance calculations mathematically valid
- ✓ Achievement rates correctly computed

**Test**: Compare UI totals to database query totals → Values must match

---

### D. BAR1 Compliance (HIGH)

**Verification**:
- ✓ Unit-type separation maintained per DBM standards
- ✓ Aggregation logic documented in code comments
- ✓ COUNT indicators aggregated separately from PERCENTAGE indicators

---

### E. Functional Regression (HIGH)

**Verification**:
- ✓ Outcome/Output indicator tables render
- ✓ Quarterly data entry dialog functional
- ✓ Pillar tabs switch correctly
- ✓ Fiscal year selector updates data
- ✓ PhysicalSummaryCard displays pillar totals
- ✓ Quarterly Data Entry Progress widget functional

**Test**: Full workflow test (select pillar → enter data → save → verify)

---

## Post-Implementation Checklist

### Code Quality
- [ ] No TypeScript errors in VSCode
- [ ] No console errors in browser
- [ ] No Vue warnings in devtools
- [ ] All removed code confirmed unused (no orphaned references)
- [ ] Unit-type filtering documented in code comments

### Functionality
- [ ] Physical page loads without analytics components
- [ ] Main module analytics display COUNT-only totals
- [ ] Backend API returns unit-specific fields
- [ ] PhysicalSummaryCard still renders correctly
- [ ] Quarterly Data Entry Progress widget functional

### Data Integrity
- [ ] Target vs Actual totals match database COUNT-only queries
- [ ] No unit-type mixing in displayed values
- [ ] Variance calculations mathematically valid
- [ ] Achievement rates correctly computed

### User Experience
- [ ] Loading states visible during async operations
- [ ] Success/error toast messages for all actions
- [ ] Unit-type legend visible on charts
- [ ] No duplicate analytics in physical page
- [ ] Clear separation between dashboard and operational interfaces

### Security
- [ ] No authorization bypass possible
- [ ] Backend @Roles enforced
- [ ] No unauthorized API access possible

---

## Future Enhancements (Phase 2)

1. **Multi-Unit Dashboard**: Separate sections for COUNT, PERCENTAGE, and WEIGHTED indicators
2. **Weighted Average for Percentages**: Display average percentage indicators alongside counts
3. **Unit-Type Filtering UI**: Allow users to toggle unit types in charts
4. **Export Functionality**: Export unit-specific reports to PDF/Excel
5. **PhysicalSummaryCard Unit-Type Fix**: Apply COUNT-only filtering to pillar detail card

---

**END OF PHASE 2 PLAN**

**Awaiting User Approval for Phase 3 Implementation**
