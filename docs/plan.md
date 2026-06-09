# PMO Dashboard — Active Implementation Plan
> **Governance:** ACE v2.4 | **Branch:** `pmo-coi`
> **Last Updated:** 2026-06-09
> **Rule:** Only active, approved, pending work. Completed items → `history.md`.

---

## PHASE QQQ — ✅ COMPLETE (Phase 3 implemented 2026-06-09)
> **Status:** Phase 3 complete — vue-tsc 0 new errors. Committed + pushed to `pmo-coi`.
> **Research:** R-136–R-142 (research.md)
> **Priority order:** D (COI detail) → B (COI index) → A (Dashboard) → C (Analytics tab)
> **Constraints:** Frontend only. No backend changes. No DTO modifications. `detail-[id].vue` stays READ-ONLY.
> **Delivered:** QQQ-D1 removed Implementation label; QQQ-B1 restored PPP-B fixes; QQQ-B2 On Hold KPI; QQQ-B3 dynamic table height; QQQ-A1 dashboard tonal tiles + skeleton; QQQ-C1/C2 publication donut + card elevation.
> The detailed steps below are retained as the implementation record; they are complete and frozen.

---

### QQQ-D1: Remove "Implementation" Section Label — COI Detail Page

**File:** `pmo-frontend/pages/coi/detail-[id].vue` (line 1031)
**Research:** R-142

**Remove:**
```html
<div class="text-overline text-medium-emphasis mb-1">Implementation</div>
```

This is inside `<template v-if="project.implementingAgency || project.contractor">`. The "Agency" and "Contractor" field labels below are self-explanatory. The overline label is vague and redundant.

**Acceptance:** No "Implementation" text-overline visible in project overview sidebar.

---

### QQQ-B1: Re-apply View Switcher + PPP-B Fixes to coi/index.vue

**File:** `pmo-frontend/pages/coi/index.vue`
**Research:** R-137

A `git stash pop` during Phase PPP overwrote on-disk changes. The committed fix (`6a817f8`) exists in git but the disk file has reverted. All PPP-B changes must be re-applied:

**1. Action strip (line ~845):** Restore the `d-flex` div with Portfolio Analytics + Public View buttons (the PPP-B2 removal of duplicate New Project was correct and should remain; the containing div should survive):
```html
<div class="d-flex flex-wrap align-center ga-2 mb-3">
  <v-spacer />
  <v-btn color="info" variant="tonal" prepend-icon="mdi-chart-bar" size="small" @click="activeTab = 'analytics'">Portfolio Analytics</v-btn>
  <v-btn color="grey-darken-1" variant="tonal" prepend-icon="mdi-earth" size="small" :to="'/coi/public'">Public View</v-btn>
</div>
```

**2. Executive Overview section label (before `template v-if="analyticsReady"`):**
```html
<div v-if="analyticsReady" class="d-flex align-center ga-2 mb-2 mt-1">
  <v-icon size="16" color="grey-darken-2">mdi-view-dashboard-outline</v-icon>
  <span class="text-caption font-weight-bold text-grey-darken-2 text-uppercase coi-section-label">Executive Overview</span>
  <v-divider class="flex-grow-1 ml-1" />
</div>
```

**3. Filters section label (before filter banner / filter card):**
```html
<div class="d-flex align-center ga-2 mb-2 mt-5">
  <v-icon size="16" color="grey-darken-2">mdi-filter-variant</v-icon>
  <span class="text-caption font-weight-bold text-grey-darken-2 text-uppercase coi-section-label">Filters</span>
  <v-divider class="flex-grow-1 ml-1" />
</div>
```

**4. View switcher — replace icon-only toggle with labeled buttons:**
```html
<div class="d-flex align-center ga-2 mb-2 flex-wrap">
  <v-icon size="16" color="grey-darken-2">mdi-format-list-bulleted</v-icon>
  <span class="text-caption font-weight-bold text-grey-darken-2 text-uppercase coi-section-label">Project List</span>
  <v-divider class="flex-grow-1 ml-1 mr-2" style="min-width:20px" />
  <v-btn-toggle v-model="viewMode" variant="outlined" divided mandatory color="primary" class="flex-shrink-0">
    <v-btn value="list" size="small" prepend-icon="mdi-format-list-bulleted" class="px-3">List</v-btn>
    <v-btn value="card" size="small" prepend-icon="mdi-view-grid-outline" class="px-3">Card</v-btn>
    <v-btn value="table" size="small" prepend-icon="mdi-table" class="px-3">Table</v-btn>
  </v-btn-toggle>
</div>
```
(Remove `density="compact"` from toggle; remove `:icon="true"` from buttons)

**5. Table card:** `<v-card v-else class="pa-0" elevation="1" rounded="lg">` and `height="600"` on the data-table.

**6. Recent Activities section label (before `v-expansion-panels v-if="canViewActivity"`):**
```html
<div v-if="canViewActivity" class="d-flex align-center ga-2 mb-2 mt-4">
  <v-icon size="16" color="grey-darken-2">mdi-history</v-icon>
  <span class="text-caption font-weight-bold text-grey-darken-2 text-uppercase coi-section-label">Recent Activities</span>
  <v-divider class="flex-grow-1 ml-1" />
</div>
```
Also change `class="mt-4"` → `class="mt-2"` on the expansion panels.

**7. `CiChartEmpty` fallbacks:** Restore the component (not plain text divs) on all analytics charts where `v-else` blocks exist.

**Acceptance:** All PPP-B items verified: section labels present, view switcher with text labels, no overflow, table card elevated, Recent Activities label visible.

---

### QQQ-B2: Replace "Completing in 30 Days" KPI with "On Hold" Executive Card

**File:** `pmo-frontend/pages/coi/index.vue` (line ~943–963)
**Research:** R-138

**Remove:**
```html
<v-col cols="12" md="4">
  <v-card elevation="1" rounded="lg" class="h-100 pa-3">
    <div ... >Completing in 30 Days</div>
    <div v-if="!upcomingCompletions.length" ...>No projects completing in the next 30 days.</div>
    <v-list v-else ...>{{ p.projectName }} / Due {{ ... }}</v-list>
  </v-card>
</v-col>
```

**Replace with:**
```html
<v-col cols="12" md="4">
  <v-card elevation="1" rounded="lg" class="h-100 pa-3">
    <div class="text-caption text-grey-darken-1 font-weight-medium text-uppercase mb-2">
      <v-icon icon="mdi-pause-circle-outline" size="small" color="warning" class="mr-1" />On Hold
    </div>
    <div v-if="!onHoldProjects.length" class="text-caption text-grey py-2">No projects currently on hold.</div>
    <v-list v-else density="compact" class="pa-0">
      <v-list-item
        v-for="p in onHoldProjects"
        :key="p.id"
        class="px-0 cursor-pointer"
        @click="router.push(`/coi/detail-${p.id}`)"
      >
        <v-list-item-title class="text-caption font-weight-medium text-truncate">{{ p.projectName }}</v-list-item-title>
        <v-list-item-subtitle class="text-caption text-grey">
          {{ p.campus }} · {{ (Number(p.physicalAccomplishment) || 0).toFixed(0) }}% complete
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </v-card>
</v-col>
```

**Add computed (near `upcomingCompletions`):**
```typescript
const onHoldProjects = computed(() =>
  projects.value
    .filter(p => (p.status || '').toUpperCase() === 'ON_HOLD')
    .slice(0, 5)
)
```

The `upcomingCompletions` computed can be removed entirely (or left as-is if referenced elsewhere — verify first).

**Acceptance:** Executive overview shows "On Hold" card. Always shows meaningful data (0 = good, >N = needs attention). "Completing in 30 Days" gone.

---

### QQQ-B3: Dynamic Table Height — Resize Based on Row Count

**File:** `pmo-frontend/pages/coi/index.vue` (line ~1275)
**Research:** R-139

**Add computed:**
```typescript
const tableHeight = computed(() => {
  const ROW_PX  = 52
  const HEAD_PX = 56
  const MIN_ROWS = 5
  const MAX_PX   = 580
  const rowCount = Math.max(filteredProjects.value.length, MIN_ROWS)
  return Math.min(rowCount * ROW_PX + HEAD_PX, MAX_PX)
})
```

**Replace** `height="560"` → `:height="tableHeight"` on `v-data-table`.

This ensures at least 5 rows of visible space while dynamically shrinking when fewer results exist (minimum 316px, maximum 580px).

**Also:** ensure `height="600"` change from PPP-B3 is replaced with this dynamic approach (`:height="tableHeight"` supersedes the static value).

**Acceptance:** Table with 3 filtered rows shows ~212px of content instead of ~560px dead space. Table with 25 rows shows full 580px with scrolling.

---

### QQQ-A1: Enhance Infrastructure Portfolio Card — Dashboard

**File:** `pmo-frontend/pages/dashboard.vue` (lines 232–289)
**Research:** R-136

**Step 1 — Replace loading spinner with skeleton:**
```html
<!-- Before -->
<div v-if="coiAnalyticsLoading" class="d-flex justify-center pa-4">
  <v-progress-circular indeterminate color="primary" size="32" />
</div>

<!-- After -->
<v-row v-if="coiAnalyticsLoading" dense class="mb-2">
  <v-col v-for="n in 4" :key="n" cols="6" sm="3"><v-skeleton-loader type="card" height="60" /></v-col>
</v-row>
```

**Step 2 — Replace plain text stats with mini tonal cards:**
```html
<!-- Replace the current v-row dense class="mb-3" content -->
<v-row dense class="mb-3">
  <v-col cols="6" sm="3">
    <v-card variant="tonal" color="blue" class="pa-2 text-center rounded-lg">
      <div class="text-caption text-grey-darken-1">Total</div>
      <div class="text-h6 font-weight-bold">{{ coiSummary.total ?? 0 }}</div>
    </v-card>
  </v-col>
  <v-col cols="6" sm="3">
    <v-card variant="tonal" color="info" class="pa-2 text-center rounded-lg">
      <div class="text-caption text-grey-darken-1">Ongoing</div>
      <div class="text-h6 font-weight-bold">{{ (coiSummary.by_status || []).find((s: any) => s.status === 'ONGOING')?.count ?? 0 }}</div>
    </v-card>
  </v-col>
  <v-col cols="6" sm="3">
    <v-card variant="tonal" color="success" class="pa-2 text-center rounded-lg">
      <div class="text-caption text-grey-darken-1">Completed</div>
      <div class="text-h6 font-weight-bold">{{ (coiSummary.by_status || []).find((s: any) => s.status === 'COMPLETE' || s.status === 'COMPLETED')?.count ?? 0 }}</div>
    </v-card>
  </v-col>
  <v-col cols="6" sm="3">
    <v-card variant="tonal" color="warning" class="pa-2 text-center rounded-lg">
      <div class="text-caption text-grey-darken-1">On Hold</div>
      <div class="text-h6 font-weight-bold">{{ (coiSummary.by_status || []).find((s: any) => s.status === 'ON_HOLD')?.count ?? 0 }}</div>
    </v-card>
  </v-col>
</v-row>
```

**Step 3 — Add Avg Progress text below the cost utilization bar** (already exists as "X% of appropriation utilized"; no change needed). Keep cost utilization bar.

**Acceptance:** Dashboard Infrastructure Portfolio card shows 4 tonal stat mini-cards (Total, Ongoing, Completed, On Hold). Loading shows skeleton instead of spinner.

---

### QQQ-C1/C2: Analytics Tab — Publication Status Donut + Card Elevation

**File:** `pmo-frontend/pages/coi/index.vue` (analytics tab, lines ~1570–1730)
**Research:** R-140, R-141

**Step 1 — Add computed for Publication Status donut:**
```typescript
const publicationStatusChart = computed(() => {
  const data = (analyticsSummary.value?.by_publication_status || []) as Array<{ publication_status: string; count: number }>
  const labelMap: Record<string, string> = {
    DRAFT: 'Draft',
    PENDING_REVIEW: 'Pending Review',
    PUBLISHED: 'Published',
    REJECTED: 'Rejected',
  }
  const colorMap: Record<string, string> = {
    DRAFT: '#9e9e9e',
    PENDING_REVIEW: '#f59e0b',
    PUBLISHED: '#059669',
    REJECTED: '#ef4444',
  }
  return {
    series: data.map(d => d.count),
    options: {
      chart: { type: 'donut' as const, toolbar: { show: false } },
      labels: data.map(d => labelMap[d.publication_status] || d.publication_status),
      colors: data.map(d => colorMap[d.publication_status] || '#9e9e9e'),
      legend: { position: 'bottom' as const },
      dataLabels: { enabled: true },
    },
  }
})
```

**Step 2 — Replace the chip display card with the donut chart:**
```html
<!-- Replace the Publication Status Breakdown card content -->
<v-col cols="12" md="6">
  <v-card class="pa-4" elevation="1" rounded="lg">
    <v-card-title class="text-body-1 font-weight-bold mb-1">Publication Status</v-card-title>
    <v-card-subtitle class="text-caption pb-2">Review readiness across the portfolio</v-card-subtitle>
    <VueApexCharts
      v-if="publicationStatusChart.series.some(v => v > 0)"
      type="donut"
      height="220"
      :options="publicationStatusChart.options"
      :series="publicationStatusChart.series"
    />
    <CiChartEmpty v-else icon="mdi-chart-donut" title="No publication data" description="Status breakdown appears once projects are reviewed." />
  </v-card>
</v-col>
```

**Step 3 — Add `elevation="1" rounded="lg"` to all analytics chart cards** (8 cards currently using only `class="pa-4"`):
- Status Distribution card (line ~1572)
- Projects by Campus card (line ~1585)
- Physical Progress Distribution card (line ~1607)
- Avg Physical Progress by Campus card (line ~1629)
- Budget Concentration by Campus card (line ~1643)
- Contract Value by Status card (line ~1661)
- Projects by Contractor card (line ~1701)
- Funding Source Distribution card (line ~1715)

Pattern: `<v-card class="pa-4">` → `<v-card class="pa-4" elevation="1" rounded="lg">`

**Acceptance:** Publication Status shows donut chart at 220px height, matching Contract Value neighbor. All 8 analytics cards have consistent elevation="1" rounded="lg". Grid is visually symmetric.

---

## Commit Strategy (Phase QQQ)

```
fix(coi): remove vague Implementation section label from project overview
fix(coi): re-apply view switcher labels, section labels, and table card styling
feat(coi): replace Completing in 30 Days KPI with On Hold executive metric
feat(coi): dynamic table height based on filtered row count
feat(dashboard): upgrade Infrastructure Portfolio card with tonal stat tiles
feat(analytics): replace Publication Status chips with donut chart; normalize card elevation
```

Push to `pmo-coi` after all steps verified.

---

## Verification Checklist (Phase QQQ)

| Check | How to verify |
|---|---|
| QQQ-D1: Implementation label removed | COI detail page → Overview sidebar → no "Implementation" overline text |
| QQQ-B1: View switcher | COI → "List" / "Card" / "Table" labels visible, no overflow |
| QQQ-B1: Section labels | Executive Overview, Filters, Project List, Recent Activities all labeled |
| QQQ-B1: Table card styled | Table card has elevation and rounded corners |
| QQQ-B2: On Hold KPI | Executive Overview shows On Hold card with clickable project list |
| QQQ-B3: Dynamic height | Apply status filter → table shrinks to match row count (no blank space) |
| QQQ-A1: Dashboard stat tiles | Dashboard Infrastructure Portfolio shows 4 tonal cards |
| QQQ-A1: Skeleton loader | Slow network → skeleton cards shown instead of spinner |
| QQQ-C1/C2: Donut chart | Analytics tab → Publication Status shows donut chart |
| QQQ-C2: Card elevation | All 8 analytics chart cards have consistent elevation + rounded style |

---

## PHASE PPP — ✅ COMPLETE (Phase 3 implemented 2026-06-09; see history.md)
> **Status:** Phase 3 complete — vue-tsc 0 new errors. Committed + pushed to `pmo-coi`.
> **Research:** R-126–R-135 (research.md)
> **Delivered:** PPP-A1 Pillar→Program, PPP-A2 quarterly trend fix, PPP-A3 section labels + skeletons, PPP-B1 view switcher, PPP-B2 remove duplicate button, PPP-B3 table card, PPP-B4 filter spacing, PPP-B5 Executive Overview + Recent Activities labels.

---

## PHASE PPP — ⏳ PENDING AUTHORIZATION
> **Status:** Phase 2 complete — awaiting operator `RUN_ACE` for Phase 3.
> **Research:** R-126–R-135 (research.md)
> **Priority order:** A (UO) → B (COI) → C (Design system)
> **Constraints:** No backend changes. Frontend only. No DTO modifications. `PILLARS` const + `pillar_type` API params stay as-is. Only display text changes for A1.

---

### PPP-A1: "Pillar" → "Program" Terminology — University Operations

**Files:**
- `pmo-frontend/pages/university-operations/index.vue`
- `pmo-frontend/pages/university-operations/financial/index.vue`

**Research:** R-126, R-133

**Scope:** Display text only. Backend API params, variable names, DB columns are IMMUTABLE.

**Changes in `university-operations/index.vue`:**

1. `globalPillarOptions` computed (line ~80): `{ title: 'All Pillars', value: 'ALL' }` → `{ title: 'All Programs', value: 'ALL' }`

2. Template section headers + chart card titles (use `replace_all: true` per string):
   - `"Pillar Completion Overview"` → `"Program Completion Overview"` (appears as section div + guide text)
   - `"Pillar Performance Ranking"` → `"Program Performance Ranking"` (chart card title)
   - `"Achievement Rate by Pillar"` → `"Achievement Rate by Program"` (chart card title)
   - `"Accomplishment Rate by Pillar"` → `"Accomplishment Rate by Program"` (YoY chart title)
   - `"Utilization Rate by Pillar"` → `"Utilization Rate by Program"` (Financial YoY chart title)
   - `"Budget Obligations by Campus and Pillar"` → `"Budget Obligations by Campus and Program"`
   - `"Expense Class Breakdown by Pillar"` → `"Expense Class Breakdown by Program"`
   - `<th>Pillar</th>` → `<th>Program</th>` (expense table header)

3. Expansion panel guide text (each unique occurrence):
   - `"Pillar Filter"` → `"Program Filter"`
   - `"four pillars"` → `"four programs"` (description text)
   - `"all pillars at once"` → `"all programs at once"`
   - `"select a specific pillar"` → `"select a specific program"`
   - `"pillars — both in terms of"` → `"programs — both in terms of"`
   - `"one per pillar"` (Financial description) → `"one per program"`
   - `"per pillar"` (YoY Comparison guide) → `"per program"`

**Changes in `university-operations/financial/index.vue`:**

1. Line ~1163: `"Select the correct Pillar tab"` → `"Select the correct Program tab"` (in `<strong>` tag inside instructional guide)

**Acceptance:** `grep -r "Pillar" pmo-frontend/pages/university-operations/` returns only code-level identifiers (variables, comments), zero user-facing label strings.

---

### PPP-A2: Quarterly Trend Chart — Fix Unrealistic Values

**File:** `pmo-frontend/pages/university-operations/index.vue`
**Research:** R-127

**Root cause:** `quarterlyTrendSeries` uses `q.target_rate` (raw indicator count) and `q.actual_rate` (raw ratio sum) — both are unitless integers/decimals that naturally exceed 100. The backend already computes `q.accomplishment_rate_pct` which IS a proper 0–120% figure.

**Step 1 — Update `quarterlyTrendSeries` (lines ~902–914):**

Replace:
```typescript
return [
  { name: 'Indicators with Target', data: quarters.map((q: any) => q.target_rate || 0) },
  { name: 'Achievement Score', data: quarters.map((q: any) => q.actual_rate || 0) },
]
```

With:
```typescript
return [{
  name: 'Quarterly Accomplishment Rate (%)',
  data: quarters.map((q: any) => q.accomplishment_rate_pct != null
    ? parseFloat(q.accomplishment_rate_pct.toFixed(1))
    : 0),
}]
```

**Step 2 — Update `quarterlyTrendOptions` chart config (lines ~862–899):**

```typescript
const quarterlyTrendOptions = computed(() => ({
  chart: {
    type: 'line' as const,
    height: 280,
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  stroke: { curve: 'smooth' as const, width: 3 },
  colors: ['#1976D2'],
  xaxis: { categories: ['Q1', 'Q2', 'Q3', 'Q4'] },
  yaxis: {
    title: { text: 'Accomplishment Rate (%)' },
    min: 0,
    max: 120,
    forceNiceScale: false,
    labels: { formatter: (val: number) => val.toFixed(0) + '%' },
  },
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
        style: { color: '#E53935', background: '#FFFFFF', fontSize: '12px',
          padding: { left: 4, right: 4, top: 2, bottom: 2 } },
      },
    }],
  },
  legend: { show: false },
  markers: { size: 5 },
  dataLabels: { enabled: true, formatter: (val: number) => val.toFixed(1) + '%', offsetY: -20,
    style: { fontSize: '11px', colors: ['#333'] } },
  tooltip: { y: { formatter: (val: number) => val.toFixed(1) + '%' } },
}))
```

**Also update the guide text** in the expansion panel: replace the "Quarterly Trend" guide description from mentioning "Indicators with Target / Achievement Score" to "shows quarterly accomplishment rate (actual/target × 100%)".

**Acceptance:** Y-axis shows 0–120%. Values stay within realistic range. 100% reference line visible. No series exceeds 120% unless truly exceptional.

---

### PPP-A3: Section Labels — University Operations Analytics Dashboard

**File:** `pmo-frontend/pages/university-operations/index.vue`
**Research:** R-132, R-134

**Goal:** Apply `coi-section-label` pattern (icon + uppercase text + `v-divider flex-grow-1`) to major sections within the analytics card, consistent with COI dashboard.

**Pattern to use:**
```html
<div class="d-flex align-center ga-2 mb-3 mt-2">
  <v-icon size="16" color="grey-darken-2">mdi-ICON</v-icon>
  <span class="text-caption text-grey-darken-2 font-weight-bold text-uppercase">SECTION TITLE</span>
  <v-divider class="flex-grow-1 ml-2" />
</div>
```

**Add section labels at:**
1. Before "Pillar Completion Overview" section in **Physical** view (before the `v-row class="mb-4" v-if="pillarSummary?.pillars"` at line ~1886) — icon: `mdi-clipboard-list-outline`, title: `PROGRAM COMPLETION`
2. Before the Target vs Actual + Ranked + Trend rows in Physical view — icon: `mdi-chart-bar`, title: `PHYSICAL PERFORMANCE`
3. Before "Budget Utilization Overview" in **Financial** view — icon: `mdi-cash-multiple`, title: `BUDGET UTILIZATION`
4. Before the Utilization Radial + Expense Class rows in Financial view — icon: `mdi-chart-donut`, title: `FINANCIAL ANALYTICS`
5. Before the Cross comparison chart in **Cross** view — icon: `mdi-compare`, title: `CROSS-MODULE PERFORMANCE`

**Also:** Replace `v-progress-circular` loading spinner (line ~1515-1518) with `v-skeleton-loader` rows matching OOO-H pattern:
```html
<v-card-text v-if="analyticsLoading" class="pa-3">
  <v-row dense class="mb-3">
    <v-col v-for="n in 4" :key="n" cols="6" sm="3"><v-skeleton-loader type="card" height="80" /></v-col>
  </v-row>
  <v-row dense>
    <v-col cols="12" md="6"><v-skeleton-loader type="card" height="280" /></v-col>
    <v-col cols="12" md="6"><v-skeleton-loader type="card" height="280" /></v-col>
  </v-row>
</v-card-text>
```

**Acceptance:** Each major tab has clear section boundaries. Loading state shows skeleton cards instead of spinner.

---

### PPP-B1: View Switcher — Fix Cramped Layout / Overflow

**File:** `pmo-frontend/pages/coi/index.vue` (lines 1145–1167)
**Research:** R-128

**Problem:** `v-btn-toggle` with `density="compact"` + `size="small"` + `:icon="true"` produces 28px-tall icon-only buttons. Combined with `d-flex` container without `flex-wrap`, overflows on narrow viewports.

**Fix — update lines 1145–1167:**

```html
<!-- Section label row with view switcher -->
<div class="d-flex align-center ga-2 mb-2 flex-wrap">
  <v-icon size="16" color="grey-darken-2">mdi-format-list-bulleted</v-icon>
  <span class="text-caption font-weight-bold text-grey-darken-2 text-uppercase coi-section-label">Project List</span>
  <v-divider class="flex-grow-1 ml-1 mr-2" style="min-width:20px" />
  <v-btn-toggle
    v-model="viewMode"
    variant="outlined"
    divided
    mandatory
    color="primary"
    class="flex-shrink-0"
  >
    <v-btn value="list" size="small" prepend-icon="mdi-format-list-bulleted" class="px-3">List</v-btn>
    <v-btn value="card" size="small" prepend-icon="mdi-view-grid-outline" class="px-3">Card</v-btn>
    <v-btn value="table" size="small" prepend-icon="mdi-table" class="px-3">Table</v-btn>
  </v-btn-toggle>
</div>
<div class="text-caption text-grey-darken-1 mb-2">
  {{ filteredProjects.length }} project{{ filteredProjects.length !== 1 ? 's' : '' }} — use filters to narrow results.
</div>
```

Key changes:
- Remove `density="compact"` from `v-btn-toggle`
- Remove `:icon="true"` from each `v-btn`
- Add text labels ("List", "Card", "Table") for discoverability
- Add `class="flex-shrink-0"` on toggle to prevent compression
- Add `flex-wrap` to parent row so toggle wraps on xs screens
- Add `style="min-width:20px"` on divider to prevent total collapse

**Acceptance:** No horizontal scrollbar. Buttons comfortably clickable (≥32px tall). Toggle wraps gracefully on mobile.

---

### PPP-B2: Remove Duplicate "New Project" Button

**File:** `pmo-frontend/pages/coi/index.vue` (line 846)
**Research:** R-129

**Remove this block** (inside `<v-window-item value="projects">` action strip):
```html
<v-btn v-if="canAdd('coi')" color="primary" prepend-icon="mdi-plus" size="small" @click="createProject">New Project</v-btn>
```

**Retain:**
- Line 827 (page header button — canonical primary action)
- Line 1299–1303 (empty-state button inside `no-data` slot — contextual guidance)

The action strip still retains "Portfolio Analytics" and "Public View" navigation buttons.

**Acceptance:** Only one "New Project" button visible per page state (header button). Empty state still shows the create button.

---

### PPP-B3: Table Container — Fix Whitespace and Styling

**File:** `pmo-frontend/pages/coi/index.vue` (line 1267)
**Research:** R-130

**Current:**
```html
<v-card v-else>
  <div style="overflow-x:auto">
  <v-data-table ... class="elevation-0" height="560">
```

**Fix:** Add `class="pa-0"` + `elevation="1"` + `rounded="lg"` to outer `v-card`, and increase table height to `600` for more usable space:
```html
<v-card v-else class="pa-0" elevation="1" rounded="lg">
  <div style="overflow-x:auto">
  <v-data-table ... class="elevation-0" height="600">
```

**Reasoning:** `elevation-0` inner table + un-styled outer card creates double visual layer with default elevation + no explicit padding set. Setting `pa-0` removes inner padding artifact; `elevation="1" rounded="lg"` aligns with the design system pattern used across all other section cards. Height 560→600 gives ~3 more rows visible before scroll.

**Acceptance:** Table card matches elevation style of filter bar and executive overview cards. No extra padding around table edges. Sticky header still works.

---

### PPP-B4: Section Spacing — Breathing Room Before Filter Bar

**File:** `pmo-frontend/pages/coi/index.vue`
**Research:** R-135

**Current:** Executive overview section (`template v-if="analyticsReady"`) ends with `mb-3`, filter bar card starts immediately with `mb-3`. No visual hierarchy between "read" and "filter/act" zones.

**Fix:** Change the filter bar card from `class="mb-3 pa-3"` to `class="mb-3 mt-5 pa-3"` (adds ~24px top margin), creating visible breathing room.

Additionally, add a section label before the filter bar to make its purpose explicit:
```html
<!-- Section label: Filters -->
<div class="d-flex align-center ga-2 mb-2 mt-5">
  <v-icon size="16" color="grey-darken-2">mdi-filter-variant</v-icon>
  <span class="text-caption font-weight-bold text-grey-darken-2 text-uppercase coi-section-label">Filters</span>
  <v-divider class="flex-grow-1 ml-1" />
</div>
```

Remove the `mt-5` from the filter card itself (the label div provides spacing).

**Acceptance:** Clear visual separation between executive overview and filter bar.

---

### PPP-B5: COI Missing Section Labels

**File:** `pmo-frontend/pages/coi/index.vue`
**Research:** R-131

**Add section label: "Executive Overview"** — before the `template v-if="analyticsReady"` block (line ~899):

```html
<!-- Executive Overview section label -->
<div class="d-flex align-center ga-2 mb-2 mt-1">
  <v-icon size="16" color="grey-darken-2">mdi-view-dashboard-outline</v-icon>
  <span class="text-caption font-weight-bold text-grey-darken-2 text-uppercase coi-section-label">Executive Overview</span>
  <v-divider class="flex-grow-1 ml-1" />
</div>
```

**Add section label: "Recent Activities"** — before `<v-expansion-panels v-if="canViewActivity"` (line ~1490):

```html
<!-- Recent Activities section label -->
<div v-if="canViewActivity" class="d-flex align-center ga-2 mb-2 mt-4">
  <v-icon size="16" color="grey-darken-2">mdi-history</v-icon>
  <span class="text-caption font-weight-bold text-grey-darken-2 text-uppercase coi-section-label">Recent Activities</span>
  <v-divider class="flex-grow-1 ml-1" />
</div>
```

**Acceptance:** All major dashboard zones — Portfolio Summary, Executive Overview, Filters, Project List, Recent Activities — have matching section labels with icon+divider style.

---

## Verification Checklist (Phase PPP)

| Check | How to verify |
|---|---|
| PPP-A1: No visible "Pillar" text | Navigate UO analytics → all section headers + dropdown + table show "Program" |
| PPP-A1: API params unchanged | Network tab → `?pillar_type=HIGHER_EDUCATION` still used |
| PPP-A2: Quarterly trend ≤ 120% | UO Physical Dashboard → Quarterly Trend chart Y-axis 0–120, values realistic |
| PPP-A2: 100% reference line | Red dashed annotation at 100% visible in trend chart |
| PPP-A3: Section labels in UO | UO analytics → clear section dividers between major blocks |
| PPP-A3: Skeleton loaders | Throttle network → skeleton cards instead of spinner in analytics |
| PPP-B1: View switcher | COI Projects tab → view toggle readable, no overflow, wraps on mobile |
| PPP-B2: Single New Project | COI header shows one button; action strip shows none; empty state shows one |
| PPP-B3: Table card | Table has `elevation="1" rounded="lg"`, no double-padding artifact |
| PPP-B4: Filter spacing | Clear gap between Executive Overview and Filters section |
| PPP-B5: Section labels | COI Projects tab: Portfolio Summary + Executive Overview + Filters + Project List + Recent Activities all labeled |

---

## Commit Strategy (Phase PPP)

```
feat(uo): replace "Pillar" with "Program" in all University Operations UI labels
fix(uo): correct quarterly trend chart to show accomplishment rate percentage
feat(uo): add section labels and skeleton loaders to analytics dashboard
fix(coi): resolve view switcher overflow and improve button sizing
fix(coi): remove duplicate new project button from action strip
refactor(coi): align table card styling with design system
feat(coi): add executive overview and recent activities section labels
```

Push to `pmo-coi` after type-check passes.

---

## PHASE ZZZ — ✅ COMPLETE (Phase 3 implemented 2026-06-04; see history.md)
> **Status:** ✅ Phase 3 complete — vue-tsc + tsc 0 new errors. Not yet committed.
> **Research:** R-023 through R-037 (research.md)
> **Delivered:** ZZZ-A/B (analytics fixes + 6-stat + Financial Summary), ZZZ-C (Team Institutional/External split), ZZZ-D + Ext (Notes Banking always-visible grid + Lessons Learned + Site Observations), ZZZ-E/F (WAR/MPR 8/9 sections + dismissible banner), ZZZ-G (Project Concerns full-stack + migration), ZZZ-H (CiBasicInfoForm HCI), ZZZ-I (Progress tab UX).
> **Pre-use requirement:** run OPS-1 (now 7 migrations incl. `concerns_list`) + OPS-2 backend restart, then operator smoke test (verification checklist below).

> The detailed step-by-step sub-sections below are retained as the implementation record for operator verification; they are complete and frozen.

---

### ZZZ-A: Analytics Critical Data Fixes
**File:** `pmo-frontend/components/coi/CiProjectAnalyticsTab.vue`
**Research:** R-023, R-024, R-025

1. Fix `originalCost` (line ~55): `(props.project as any).contractAmount` → `props.project.totalContractAmount`
2. Fix `revisedCost` fallback (line ~53): same `contractAmount` → `totalContractAmount`
3. Fix `financialGauge` series (line ~110): change from `project.financialProgress` to `Number((financialUtilization.value ?? props.project.financialProgress ?? 0).toFixed(1))`
4. Add `costIncurredThisPeriod` to `UIProjectDetail` in `adapters.ts`: interface field + `adaptProjectDetail()` mapper

**Acceptance:**
- [ ] Original Contract Amount card shows project's contract amount (not 0)
- [ ] Financial Utilization gauge shows obligation/appropriation ratio (not financialProgress)
- [ ] Cost This Period card shows progress report value (not 0 when data exists)

---

### ZZZ-B: Performance Indicators Refactor + Financial Summary Section
**File:** `pmo-frontend/components/coi/CiProjectAnalyticsTab.vue`

1. Replace Row 3 col-3 card ("Time Elapsed vs Remaining" progress bar) with a 6-stat information card:
   - Physical Progress %
   - Financial Utilization %
   - Date Elapsed (days)
   - Days Remaining (or Days Overdue if past deadline)
   - Current Reporting Period (latest FY from `project.financials` or "—")
   - Project Stage (existing `projectStage` computed)
2. Add Section 4 — Financial Summary (new row below performance gauges):
   - Original Cost (`totalContractAmount`)
   - Revised Cost (`revisedCost`)
   - Fund Source (`project.fundSource`)
   - Cost This Period (`costIncurredThisPeriod`)
   - Cost To Date (`costIncurredToDate`)
   - Financial Utilization % (`financialUtilization ?? project.financialProgress`)
   - Section banner: "Financial Summary" with icon `mdi-cash-multiple`

**Acceptance:**
- [ ] Performance Indicators row shows 6 data points instead of single progress bar
- [ ] Financial Summary section visible below gauges
- [ ] No card shows 0 when valid project data exists

---

### ZZZ-C: Team Tab — Remove JSONB Legacy; Split by Institutional / External
**File:** `pmo-frontend/pages/coi/detail-[id].vue` (Team Tab section, ~line 1959–2093)
**Research:** R-031, R-032

> **Plan correction (2026-06-04):** Prior ZZZ-C plan was to restyle CSU/Contractor/Others cards. Research found these cards render orphaned JSONB data (`personnel_groups` column) with no edit UI. The correct fix removes these containers and replaces them with an institutional/external split derived from `record_assignments` (the data managed by `CiPersonnelAccessCard`).

**Step 1 — Remove JSONB legacy containers:**
- Delete the "CSU Personnel" `v-card` (lines ~2009–2029)
- Delete the "Contractor Personnel" `v-card` (lines ~2040–2060)
- Delete the "Other Personnel" `v-card` (lines ~2062–2079)

**Step 2 — Add computed splits in script:**
```ts
const EXTERNAL_CAT_SET = new Set([
  'CONTRACTOR','CONSTRUCTOR','SUPPLIER',
  'CONSULTANT','EXTERNAL_AUDITOR','EXTERNAL_PARTNER'
])
const institutionalPage = ref(1)
const externalPage      = ref(1)
const PAGE_SIZE         = 12

const filteredInstitutional = computed(() => {
  const q = teamSearch.value.toLowerCase()
  return (project.value?.assignedUsers ?? []).filter((u: any) =>
    !EXTERNAL_CAT_SET.has(u.personnelCategory ?? u.personnel_category ?? '') &&
    (!q || (u.name || '').toLowerCase().includes(q) || (u.department || '').toLowerCase().includes(q))
  )
})
const filteredExternal = computed(() => {
  const q = teamSearch.value.toLowerCase()
  return (project.value?.assignedUsers ?? []).filter((u: any) =>
    EXTERNAL_CAT_SET.has(u.personnelCategory ?? u.personnel_category ?? '') &&
    (!q || (u.name || '').toLowerCase().includes(q) || (u.department || '').toLowerCase().includes(q))
  )
})
const paginatedInstitutional = computed(() =>
  filteredInstitutional.value.slice(0, institutionalPage.value * PAGE_SIZE)
)
const paginatedExternal = computed(() =>
  filteredExternal.value.slice(0, externalPage.value * PAGE_SIZE)
)
```
- Remove dead `filteredAssignedUsers` computed and `groupedPersonnel` computed (lines ~574–394)

**Step 3 — Rewrite Team Tab template:**
```
v-alert (info, read-only notice)
v-row
  v-col md="6":
    header "Institutional Personnel" (primary icon)
    v-card outlined:
      v-card-title "CSU/Implementing Staff" + count chip
      v-card-text:
        empty state OR v-row of v-card variant="tonal" color="primary" per user
          avatar: initials from name
          name + department/role + personnelCategory chip
        "Show more" btn if filteredInstitutional.length > paginatedInstitutional.length
  v-col md="6" border-md-s:
    header "External Personnel" (warning icon)
    v-card outlined:
      v-card-title "Contractor / Consultant Staff" + count chip
      v-card-text:
        empty state OR v-row of v-card variant="tonal" color="warning" per user
          avatar: initials
          name + projectRole + personnelCategory chip
        "Show more" btn if filteredExternal.length > paginatedExternal.length
global empty (no institutional AND no external)
```

**Step 4 — Add `getInitials` helper if not already present:**
```ts
function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}
```

**Acceptance:**
- [ ] CSU Personnel, Contractor Personnel, Other Personnel JSONB cards removed
- [ ] Institutional / External split reflects `record_assignments` data only (Personnel Tab source of truth)
- [ ] Cards use `v-card variant="tonal"` with initials avatar
- [ ] Pagination: "Show more" loads 12 more per column
- [ ] Search bar filters both columns simultaneously
- [ ] Read-only info alert visible: "Personnel managed via Edit Project → Personnel tab"
- [ ] No TypeScript errors introduced

---

### ZZZ-D: Others Tab — Notes Banking Always Visible + Grid Layout
**File:** `pmo-frontend/pages/coi/detail-[id].vue` (Others Tab section, ~line 2095–2290)
**Research:** R-027, R-033

> **Plan correction (2026-06-04):** R-033 found the edit page uses a single "Data Banking" card; detail page uses separate conditional expansion panels per field. All Notes Banking panels are hidden when empty. No CTA exists to guide users to edit. Revised plan below.

**Step 1 — Remove top-level gate:**
- Delete `<div v-if="!hasOthersData"` empty state block (lines ~2097–2100) 
- Remove `v-else` from the `v-expansion-panels` tag

**Step 2 — Always-visible Notes Banking section (above expansion panels):**
```html
<v-card variant="outlined" class="mb-4" rounded="lg">
  <v-card-title class="d-flex align-center ga-2 py-2 px-4 bg-grey-lighten-4">
    <v-icon icon="mdi-database-outline" size="small" color="primary" />
    <span>Project Notes & Data Banking</span>
  </v-card-title>
  <v-divider />
  <v-card-text>

    <!-- Empty state (when projectNotesBanking is null or all fields empty) -->
    <template v-if="!hasNotesBanking">
      <div class="text-center text-grey py-4">
        <v-icon size="36" color="grey-lighten-2">mdi-note-off-outline</v-icon>
        <p class="text-body-2 mt-2">No supplementary notes recorded.</p>
        <v-btn size="small" variant="tonal" color="primary" class="mt-2"
          :to="`/coi/edit-${projectId}?tab=others`">
          Add Notes in Edit Project
        </v-btn>
      </div>
    </template>

    <!-- Populated state: 2-column grid -->
    <template v-else>
      <v-row>
        <!-- Column 1 -->
        <v-col cols="12" md="6">
          <!-- Additional Notes -->
          <div v-if="notesBanking?.additionalNotes" class="mb-4">
            <div class="text-caption font-weight-medium text-uppercase text-grey mb-1">Additional Notes</div>
            <p class="text-body-2 text-pre-line">{{ notesBanking.additionalNotes }}</p>
          </div>
          <!-- Special Instructions -->
          <div v-if="notesBanking?.specialInstructions" class="mb-4">
            <div class="text-caption font-weight-medium text-uppercase text-grey mb-1">Special Instructions</div>
            <p class="text-body-2 text-pre-line">{{ notesBanking.specialInstructions }}</p>
          </div>
          <!-- Custom Metadata -->
          <div v-if="notesBanking?.customMetadata && Object.keys(notesBanking.customMetadata).length">
            <div class="text-caption font-weight-medium text-uppercase text-grey mb-1">Custom Metadata</div>
            <v-table density="compact">
              <tbody>
                <tr v-for="(val, key) in notesBanking.customMetadata" :key="key">
                  <td class="text-caption font-weight-medium" style="width:40%">{{ key }}</td>
                  <td class="text-body-2">{{ val }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-col>

        <!-- Column 2 -->
        <v-col cols="12" md="6" class="border-md-s pl-md-4">
          <!-- Project References -->
          <div v-if="notesBanking?.projectReferences?.length" class="mb-4">
            <div class="text-caption font-weight-medium text-uppercase text-grey mb-1">Project References</div>
            <v-list density="compact">
              <v-list-item v-for="(ref, i) in notesBanking.projectReferences" :key="i">
                <v-list-item-title>
                  <a v-if="ref.url" :href="ref.url" target="_blank" rel="noopener noreferrer" class="text-primary">{{ ref.label }}</a>
                  <span v-else>{{ ref.label }}</span>
                </v-list-item-title>
                <v-list-item-subtitle v-if="ref.notes" class="text-caption">{{ ref.notes }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </div>
          <!-- Historical References -->
          <div v-if="notesBanking?.historicalReferences?.length">
            <div class="text-caption font-weight-medium text-uppercase text-grey mb-1">Historical References</div>
            <v-timeline density="compact" align="start" side="end">
              <v-timeline-item v-for="(h, i) in notesBanking.historicalReferences" :key="i" dot-color="blue-grey" size="small">
                <div class="text-body-2">{{ h.description }}</div>
                <div class="text-caption text-grey">{{ h.date ? formatDate(h.date) : '' }}</div>
              </v-timeline-item>
            </v-timeline>
          </div>
        </v-col>
      </v-row>
    </template>
  </v-card-text>
</v-card>
```

**Step 3 — Wrap legacy expansion panels in conditional block:**
```html
<v-expansion-panels v-if="hasLegacyOthersData" variant="accordion" multiple>
  <!-- statusUpdates, readinessDocuments, signatories, incidentLog, riskRegister, escalationRecords -->
  <!-- (keep existing panels, remove old Data Banking expansion panels) -->
</v-expansion-panels>
```

**Step 4 — Update computeds in script:**
```ts
// Replace hasOthersData; add hasLegacyOthersData
const hasLegacyOthersData = computed(() =>
  (project.value?.statusUpdates?.length ?? 0) +
  (project.value?.readinessDocuments?.length ?? 0) +
  (project.value?.signatories?.length ?? 0) +
  (project.value?.incidentLog?.length ?? 0) +
  (project.value?.riskRegister?.length ?? 0) +
  (project.value?.escalationRecords?.length ?? 0) > 0
)
```

**Step 5 — Remove old Data Banking expansion panels from within the expansion panels block** (the 5 `v-expansion-panel` blocks for additionalNotes, specialInstructions, projectReferences, historicalReferences, customMetadata, lines ~2214–2282).

**Acceptance:**
- [ ] Notes Banking card always visible in Others tab (even when `projectNotesBanking` is null)
- [ ] Empty state shows "No supplementary notes recorded." with "Add Notes in Edit Project" button
- [ ] "Add Notes" button navigates to `/coi/edit-{id}?tab=others` (Nuxt `to` prop)
- [ ] Populated state renders 2-column grid layout (notes+instructions left; references+history right)
- [ ] Legacy expansion panels (incidents, risks, escalations, etc.) only appear when data exists
- [ ] Old standalone Data Banking expansion panels removed (no duplication)
- [ ] `hasOthersData` renamed/replaced with `hasLegacyOthersData`

---

### ZZZ-E: WAR Form — Section Structure + Guidance Banner Upgrade
**File:** `pmo-frontend/components/coi/CiTimelogsContainer.vue` (WAR section, ~line 740–765)
**Research:** R-028

Replace current flat section labels with proper `v-card` section containers using `v-card-title` headers. Add 8 structured sections:

| # | Section | Content |
|---|---|---|
| 1 | Project Information | WAR Number, Date, Period, Title (already exists — promote to section) |
| 2 | Weekly Accomplishments | Accomplishments list (existing) |
| 3 | Physical Accomplishment | Header + informational note: "Physical % is recorded in the Progress Reports tab" + latest physicalProgress display |
| 4 | Financial Accomplishment | Header + informational note: "Financial % is recorded in the Progress Reports tab" |
| 5 | Work Activities | Work Accomplished textarea (existing) + Personnel/Weather/Equipment (field ops group, existing) |
| 6 | Project Concerns | List-based entry (ZZZ-G, pending migration) — for now, keep textareas with note |
| 7 | Recommendations / Actions Taken | `look_ahead_activities` (existing) renamed; add Mitigation Measures textarea |
| 8 | Attachments / Evidence | Informational note: "Upload supporting documents via the Attachments tab → Compliance Repository" |

Upgrade guidance banner: change from `v-alert variant="tonal"` to full `v-alert` with:
- Color: `primary` (blue) for WAR
- Title: "Weekly Accomplishment Report (WAR — SD-ECO-ECO-009)"
- Body: "Use this form to record weekly accomplishments, physical completion percentages, project concerns, delays, and actions taken during the reporting period."
- Dismissible via `v-model` (persists in localStorage per project)

**Acceptance:**
- [ ] 8 section headers visible in WAR form
- [ ] Guidance banner is clearly readable (larger than current compact text)
- [ ] No regression on existing field saving

---

### ZZZ-F: MPR Form — Section Structure + Guidance Banner Upgrade
**File:** `pmo-frontend/components/coi/CiTimelogsContainer.vue` (MPR section, ~line 767–797)
**Research:** R-028

Add 9 structured sections:

| # | Section | Content |
|---|---|---|
| 1 | Project Overview | MPR Number, Reporting Month, Project Title/ID |
| 2 | Monthly Accomplishments | `work_accomplished` textarea (existing, rename label to "Monthly Accomplishments") |
| 3 | Physical Accomplishment Summary | `accomplishment_summary_percent` + note linking to Progress Reports |
| 4 | Financial Accomplishment Summary | `original_contract_amount`, `revised_contract_amount`, `percent_time_elapsed` |
| 5 | Work Status | Work Items table (existing) |
| 6 | Project Concerns | List-based entry (ZZZ-G) — interim textareas with note |
| 7 | Corrective Actions | `mitigation_measures` (existing) |
| 8 | Forecast / Next Month Activities | `description` textarea renamed to "Program for Next Month / Forecast" |
| 9 | Attachments / Supporting Documents | Same informational note as WAR-8 |

Guidance banner upgrade: color `success` (green), title "Monthly Progress Report (MPR — SD-ECO-ECO-010)".

**Acceptance:**
- [ ] 9 section headers visible in MPR form
- [ ] Guidance banner upgraded and readable
- [ ] No regression on existing field saving

---

### ZZZ-G: Project Concerns — List-Based System (New Migration + Full-Stack)
**Research:** R-029, R-034

> **Plan revision (2026-06-04):** Expanded `ConcernItemDto` to include `category`, `actualResolutionDate`, `mitigationAction`, `createdBy`, `createdAt` per R-034. Per-item `updatedBy`/`updatedAt` deferred (requires array-diff logic disproportionate to JSONB storage). Decision D-ZZZ-G-1 documents this. Concerns are shared across WAR/MPR/timelogs via single `concerns_list` column on `construction_timeline_entries` — one model, zero duplication.

**Step 1 — Migration:**
Create `pmo-backend/src/database/mikro-migrations/Migration20260604000000_AddConcernsListToTimelineEntries.ts`
```sql
ALTER TABLE construction_timeline_entries
  ADD COLUMN IF NOT EXISTS concerns_list JSONB DEFAULT '[]';
COMMENT ON COLUMN construction_timeline_entries.concerns_list IS
  'ZZZ-G: [{title,description,category,severity,status,responsibleParty,resolutionTargetDate,actualResolutionDate,mitigationAction,createdBy,createdAt}]';
```

**Step 2 — Entity:**
Add to `ConstructionTimelineEntry`:
```typescript
@Property({ columnType: 'jsonb', nullable: true })
concernsList?: any[];
```

**Step 3 — DTO:**
```typescript
class ConcernItemDto {
  @IsString() @IsOptional() title?: string
  @IsString() @IsOptional() description?: string
  @IsString() @IsOptional() category?: string       // SAFETY | SCHEDULE | FINANCIAL | ENVIRONMENTAL | QUALITY | OTHER
  @IsString() @IsOptional() severity?: string        // CRITICAL | HIGH | MEDIUM | LOW
  @IsString() @IsOptional() status?: string          // OPEN | IN_PROGRESS | RESOLVED
  @IsString() @IsOptional() responsibleParty?: string
  @IsString() @IsOptional() resolutionTargetDate?: string
  @IsString() @IsOptional() actualResolutionDate?: string   // new
  @IsString() @IsOptional() mitigationAction?: string       // new (replaces concerns→mitigation_measures for structured list)
  @IsString() @IsOptional() createdBy?: string              // new: user ID stamped on frontend add
  @IsString() @IsOptional() createdAt?: string              // new: ISO date stamped on frontend add
}
```
Add to `CreateTimelineEntryDto`: `@ValidateNested({ each: true }) @Type(() => ConcernItemDto) @IsArray() @IsOptional() concerns_list?: ConcernItemDto[]`

**Step 4 — Service:**
In `createTimelineEntry()` and `updateTimelineEntry()`:
```typescript
if (dto.concerns_list !== undefined)
  entry.concernsList = dto.concerns_list
```

**Step 5 — Frontend interface + mapping:**
In `CiTimelogsContainer.vue`, add to `TimelogEntry` interface:
```typescript
concernsList?: Array<{
  title?: string; description?: string; category?: string
  severity?: string; status?: string; responsibleParty?: string
  resolutionTargetDate?: string; actualResolutionDate?: string
  mitigationAction?: string; createdBy?: string; createdAt?: string
}>
```
Add to `blank()` form: `concerns_list: [] as any[]`
Add to `openEdit()` hydration: `form.concerns_list = entry.concernsList ?? []`
Add to `save()` payload: `concerns_list: form.concerns_list`

**Step 6 — Frontend form UI (WAR + MPR shared section):**
Add "Project Concerns" section in both WAR and MPR form sections:
- `v-btn` "Add Concern" → appends a blank concern to `form.concerns_list`; stamps `createdBy` from `authStore.userId` + `createdAt` from `new Date().toISOString()`
- Per concern row (inline card):
  - Row 1: `v-text-field` title + `v-select` category (SAFETY/SCHEDULE/FINANCIAL/ENVIRONMENTAL/QUALITY/OTHER)
  - Row 2: `v-textarea` description (rows=2)
  - Row 3: `v-select` severity (color-coded chips) + `v-select` status + `v-text-field` responsibleParty
  - Row 4: Date fields (resolutionTargetDate + actualResolutionDate) + `v-text-field` mitigationAction
  - Delete button per row (`mdi-delete`, `color="error"`)
- Section header: "Project Concerns" with `mdi-alert-circle-outline` icon + count chip
- Keep legacy `personnel_equipment_constraints` + `mitigation_measures` textareas (not removed, YAGNI rule)

**Step 7 — Frontend card/list view:**
Add concern count badge on timelog cards in card/list view:
```html
<v-chip v-if="(entry.concernsList?.length ?? 0) > 0" size="x-small" color="error" variant="tonal">
  {{ entry.concernsList.length }} concern{{ entry.concernsList.length > 1 ? 's' : '' }}
</v-chip>
```

**Acceptance:**
- [ ] Migration file created with correct SQL
- [ ] Entity has `concernsList` JSONB property
- [ ] `ConcernItemDto` has all 11 fields with validators
- [ ] `CreateTimelineEntryDto` / `PatchTimelineEntryDto` includes `concerns_list`
- [ ] Service persists `concerns_list` in create and update
- [ ] `TimelogEntry` interface includes `concernsList`
- [ ] Frontend `blank()` initializes `concerns_list: []`
- [ ] WAR form has "Project Concerns" section with add/remove
- [ ] MPR form has "Project Concerns" section with add/remove
- [ ] `createdBy` + `createdAt` stamped from authStore on "Add Concern" click
- [ ] Category dropdown: SAFETY / SCHEDULE / FINANCIAL / ENVIRONMENTAL / QUALITY / OTHER
- [ ] Concern count badge visible on timelog list/card views
- [ ] Legacy `personnel_equipment_constraints` + `mitigation_measures` textareas preserved
- [ ] No vue-tsc errors introduced
- [ ] Requires migration run before concerns save/load works

---

### ZZZ-D Extension: Others Tab — Lessons Learned + Site Observation Log
**File:** `pmo-frontend/pages/coi/detail-[id].vue` + `edit-[id].vue`
**Research:** R-035

> **Plan addition (2026-06-04):** R-035 found the revised ZZZ-D narrows Others Tab to Notes Banking only, which is too limited for construction project workflows. Two additional lightweight functional sections are added: Lessons Learned and Site Observation Log. Both stored inside the existing `project_notes_banking` JSONB object (sub-keys) — zero new migration required.

**Step 1 — Extend `project_notes_banking` schema (no migration):**
The DTO already accepts `project_notes_banking?: Record<string, any>`. Add two sub-keys to the frontend model:
```typescript
// In UIProjectDetail (adapters.ts), extend projectNotesBanking type:
projectNotesBanking: {
  additionalNotes?: string
  projectReferences?: Array<{ label: string; url?: string; notes?: string }>
  specialInstructions?: string
  historicalReferences?: Array<{ date: string; description: string }>
  customMetadata?: Record<string, string>
  lessonsLearned?: Array<{    // NEW
    phase: string; observation: string; recommendation: string
    addedBy?: string; addedAt?: string
  }>
  siteObservations?: Array<{  // NEW
    date: string; observer: string; observation: string
    location?: string; actionRequired: boolean
  }>
} | null
```

**Step 2 — Edit page (`edit-[id].vue`) — add refs and forms:**
```ts
// Script additions (alongside notesAdditional, notesSpecial, etc.)
const lessonsLearned = ref<Array<{phase:string;observation:string;recommendation:string;addedBy?:string;addedAt?:string}>>([])
const siteObservations = ref<Array<{date:string;observer:string;observation:string;location?:string;actionRequired:boolean}>>([])
```
Hydrate from `(nb as any).lessonsLearned || []` and `(nb as any).siteObservations || []`.

Include in save payload:
```ts
project_notes_banking: {
  ...existing fields,
  lessonsLearned: lessonsLearned.value,
  siteObservations: siteObservations.value,
}
```

**Step 3 — Edit page template (Others Tab, right column, below Data Banking card):**
- **Lessons Learned card**: Add row button; per entry: `v-select` phase (PLANNING/MOBILIZATION/CIVIL_WORKS/FINISHING/CLOSEOUT/OTHER), `v-textarea` observation, `v-textarea` recommendation; delete button
- **Site Observations card**: Add row button; per entry: date picker, observer text-field, observation textarea, location text-field, `v-switch` "Action Required"; delete button

**Step 4 — Detail page template (Others Tab, inside Notes Banking section OR separate sections below):**
- Lessons Learned: conditionally visible section below Notes Banking card when `notesBanking?.lessonsLearned?.length`; render as timeline list
- Site Observations: conditionally visible section; render as compact v-table (date, observer, observation, action badge)

**Acceptance:**
- [ ] `lessonsLearned` and `siteObservations` arrays hydrate from backend
- [ ] Edit page has Lessons Learned card with add/remove and phase dropdown
- [ ] Edit page has Site Observations card with add/remove and action-required toggle
- [ ] Detail page shows Lessons Learned when data exists
- [ ] Detail page shows Site Observations when data exists
- [ ] Data is included in save payload under `project_notes_banking.lessonsLearned` and `.siteObservations`
- [ ] No migration required (uses existing JSONB column)
- [ ] No vue-tsc errors introduced

---

### ZZZ-H: CiBasicInfoForm — HCI Improvements
**File:** `pmo-frontend/components/coi/CiBasicInfoForm.vue`
**Research:** R-036

> **No data model changes. All existing field bindings, validators, and component logic are preserved. Layout and typography changes only.**

**Step 1 — Row A: Promote Project Title to primary position:**
Split the identity card into two sub-rows:
- Sub-row 1: `title` (full 12 cols) — larger visual weight, clear label "Project Title *"
- Sub-row 2: `project_code (4) | campus (4) | status (4)` — secondary identifying fields
- `description` textarea remains full-width below (unchanged)

**Step 2 — Section overline headers: upgrade to subtitle-2:**
Change all 4 section divider headers from:
```html
<div class="d-flex align-center ga-2 mb-1 mt-2">
  <v-icon size="16" color="grey-darken-1">mdi-xxx</v-icon>
  <span class="text-overline text-grey-darken-1">Section Name</span>
</div>
```
To:
```html
<div class="d-flex align-center ga-2 mb-2 mt-3">
  <v-icon size="18" color="grey-darken-2">mdi-xxx</v-icon>
  <span class="text-subtitle-2 font-weight-semibold text-grey-darken-2">Section Name</span>
</div>
```
Apply to: "Location & Implementation", "Funding & Project Details", "Objectives & Beneficiaries", "Strategic Alignment"

**Step 3 — Wrap 4 Strategic Alignment selector cards in expansion panel:**
Keep `Strategic Alignment Narrative` card as-is (full-width, always visible).
Wrap the `Row E2 (SDG + RDP)` and `Row E3 (SEA + LIKHA)` grids inside:
```html
<v-expansion-panels variant="accordion" class="mb-1">
  <v-expansion-panel>
    <v-expansion-panel-title>
      <v-icon start size="small" color="purple">mdi-strategy</v-icon>
      Strategic Framework Alignment
      <v-chip v-if="totalAlignmentCount > 0" size="x-small" variant="tonal" color="purple" class="ml-2">
        {{ totalAlignmentCount }} selected
      </v-chip>
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <!-- Row E2: SDG + RDP -->
      <!-- Row E3: SEA + LIKHA -->
    </v-expansion-panel-text>
  </v-expansion-panel>
</v-expansion-panels>
```
`totalAlignmentCount` = sum of lengths of sdg_goals, rdp_alignment, socioeconomic_agenda, csu_likha_goals.

**Step 4 — Collapsible "Add Additional Funding Source" in Row C:**
Move the "Add Custom / Additional Funding Source" mini-form into a collapsible section:
```html
<v-btn size="x-small" variant="text" color="primary" prepend-icon="mdi-plus"
  @click="showAddFundingSource = !showAddFundingSource">
  Add another funding source
</v-btn>
<v-expand-transition>
  <div v-if="showAddFundingSource">
    <!-- existing 3-field add form -->
  </div>
</v-expand-transition>
```
Add `showAddFundingSource = ref(false)` to the script.

**Acceptance:**
- [ ] Row A: title on full-width top sub-row; code/campus/status on second sub-row within same card
- [ ] All 4 section overline dividers upgraded to `text-subtitle-2 font-weight-semibold`
- [ ] SDG/RDP/SEA/LIKHA selector cards wrapped in collapsible expansion panel
- [ ] "Add funding source" sub-form collapsible by default
- [ ] All existing field bindings unchanged (no data model impact)
- [ ] SDG/RDP/SEA/LIKHA selectors remain functional when expansion panel is opened
- [ ] readOnly prop still prevents editing when passed
- [ ] No vue-tsc errors introduced

---

### ZZZ-I: Progress & Milestones Tab — UX Improvements
**File:** `pmo-frontend/pages/coi/detail-[id].vue` (progress v-window-item, ~lines 1861–1929)
**Research:** R-037

> **No CRUD logic changes. Display and guidance only.**

**Step 1 — Add Milestone Summary row below analytics strip:**
```html
<!-- Below the analytics strip v-card -->
<div v-if="(project?.milestones?.length ?? 0) > 0" class="d-flex flex-wrap ga-2 mb-4">
  <span class="text-caption text-grey-darken-1 d-flex align-center mr-2">
    <v-icon size="14" class="mr-1">mdi-flag-checkered</v-icon>Milestones:
  </span>
  <v-chip size="x-small" color="success" variant="tonal">
    {{ milestoneSummary.completed }} Completed
  </v-chip>
  <v-chip size="x-small" color="primary" variant="tonal">
    {{ (project.milestones.filter((m: any) => m.status === 'IN_PROGRESS')).length }} In Progress
  </v-chip>
  <v-chip size="x-small" color="error" variant="tonal">
    {{ (project.milestones.filter((m: any) => m.status === 'DELAYED')).length }} Delayed
  </v-chip>
  <v-chip size="x-small" color="grey" variant="tonal">
    {{ (project.milestones.filter((m: any) => m.status === 'PENDING' || !m.status)).length }} Pending
  </v-chip>
  <v-btn size="x-small" variant="text" color="primary" @click="activeTab = 'overview'">
    View details in Overview →
  </v-btn>
</div>
```

**Step 2 — Add section descriptions under each section header:**
```html
<!-- Below "Progress Reports" header: -->
<p class="text-body-2 text-grey-darken-1 mb-3">
  Formal periodic progress captures. Records physical completion %, financial status, and period narrative aligned to WAR/MPR cycles.
</p>

<!-- Below "Timelogs" header: -->
<p class="text-body-2 text-grey-darken-1 mb-3">
  Weekly (WAR) and Monthly (MPR) operational work logs. Records manpower, accomplishments, concerns, and site activities per reporting period.
</p>

<!-- Below "Variation Orders" header: -->
<p class="text-body-2 text-grey-darken-1 mb-3">
  Contract amendments, time extensions, and scope changes (VOR / CTE). Each entry records the type, date, and justification.
</p>
```

**Step 3 — Empty state guidance (when all three sections have no data):**
Add a computed `hasNoProgressData`:
```ts
const hasNoProgressData = computed(() =>
  !progressReportItems.value.length && /* check timelogs somehow */ false
)
```
Note: timelog count is not available at this level; use `project.value?.milestones?.length === 0` as a proxy, or skip — the CiProgressReportTab already renders its own empty state. Limit to Progress Reports check.

If `progressReportItems.value.length === 0` AND tab is active: add a `v-alert` at the bottom:
```html
<v-alert v-if="progressReportItems.length === 0" type="info" variant="tonal" density="compact" class="mt-4">
  No progress reports recorded yet. Navigate to <strong>Edit Project → Progress tab</strong> to add WAR/MPR timelogs and record progress.
</v-alert>
```

**Step 4 — Make Timelogs section collapsible (supplementary detail):**
Wrap the `CiTimelogsContainer` section in a `v-expansion-panels`:
```html
<v-divider class="my-4" />
<v-expansion-panels variant="accordion">
  <v-expansion-panel>
    <v-expansion-panel-title>
      <v-icon start size="small" color="teal">mdi-clipboard-text-clock-outline</v-icon>
      <span class="font-weight-semibold">Timelogs</span>
      <span class="text-caption text-grey ml-2">— WAR/MPR operational work logs</span>
    </v-expansion-panel-title>
    <v-expansion-panel-text class="pa-0">
      <CiTimelogsContainer :project-id="projectId" :read-only="true" :can-delete="false" />
    </v-expansion-panel-text>
  </v-expansion-panel>
</v-expansion-panels>
```

**Acceptance:**
- [ ] Milestone summary chips visible below analytics strip when milestones exist
- [ ] "View details in Overview →" link switches activeTab to 'overview'
- [ ] Section descriptions visible under Progress Reports, Timelogs, Variation Orders headers
- [ ] Empty state alert shows when no progress reports exist
- [ ] Timelogs section collapsed by default (click to expand)
- [ ] No functionality removed (all three components still render)
- [ ] No vue-tsc errors introduced

---

### ZZZ Verification Checklist
- [ ] ZZZ-A: Original Contract Amount no longer 0 when project has contract amount
- [ ] ZZZ-A: Financial Utilization gauge reflects obligation/appropriation ratio
- [ ] ZZZ-B: Performance Indicators shows 6 data points
- [ ] ZZZ-B: Financial Summary section present in analytics
- [ ] ZZZ-C: CSU/Contractor/Other JSONB cards removed from Team Tab
- [ ] ZZZ-C: Institutional Personnel column shows system users with non-external categories
- [ ] ZZZ-C: External Personnel column shows system users with CONTRACTOR/CONSULTANT/etc. categories
- [ ] ZZZ-C: Pagination "Show more" loads 12 additional users per column
- [ ] ZZZ-D: Notes Banking card always visible in Others tab (even when empty)
- [ ] ZZZ-D: Empty Notes Banking shows "Add Notes in Edit Project" CTA navigating to edit?tab=others
- [ ] ZZZ-D: Populated Notes Banking shows 2-column grid layout
- [ ] ZZZ-D Extension: Edit page Others tab has Lessons Learned card with phase dropdown
- [ ] ZZZ-D Extension: Edit page Others tab has Site Observations card with action-required toggle
- [ ] ZZZ-D Extension: Detail page shows Lessons Learned and Site Observations when data exists
- [ ] ZZZ-E: WAR form has 8 visible section headers
- [ ] ZZZ-F: MPR form has 9 visible section headers
- [ ] ZZZ-G: Concerns list saves/loads (post-migration)
- [ ] ZZZ-G: Concern model has 11 fields including category, mitigationAction, createdBy/At
- [ ] ZZZ-G: WAR + MPR both have Project Concerns section
- [ ] ZZZ-G: Concern count badge visible in timelog card/list views
- [ ] ZZZ-H: CiBasicInfoForm Row A — title promoted to full-width sub-row above code/campus/status
- [ ] ZZZ-H: Section overline headers upgraded to text-subtitle-2 font-weight-semibold
- [ ] ZZZ-H: SDG/RDP/SEA/LIKHA wrapped in collapsible expansion panel (collapsed default)
- [ ] ZZZ-H: "Add funding source" sub-form collapsible; all existing bindings unchanged
- [ ] ZZZ-I: Milestone summary chips visible below analytics strip in Progress tab
- [ ] ZZZ-I: "View details in Overview →" link works
- [ ] ZZZ-I: Section descriptions visible under Progress Reports, Timelogs, Variation Orders
- [ ] ZZZ-I: Timelogs section collapsed by default
- [ ] ZZZ-I: Empty progress alert shown when no progress reports exist
- [ ] No vue-tsc errors introduced

---

---

## PHASE AAA — ✅ COMPLETE (Phase 3 implemented 2026-06-04; see history.md)
> **Status:** ✅ Phase 3 complete — vue-tsc 0 new errors. No backend changes. Not yet committed.
> **Research:** R-038 through R-050 (research.md)
> **Affected files:** `adapters.ts`, `detail-[id].vue`, `new.vue`, `edit-[id].vue`, `CiProjectAnalyticsTab.vue`, `CiBasicInfoForm.vue`, `CiScrollToTopFab.vue`, `CiTimelogsContainer.vue`
> **Delivered:** AAA-A (cost source fix) · AAA-B (audit tab) · AAA-C (expand/collapse) · AAA-D (FAB) · AAA-E (new.vue sync) · AAA-F (WAR physical input) · AAA-G (maxlength) · AAA-H (FY totals + compliance separator) · AAA-I (banners) · AAA-J (progress trend chart) · AAA-K (milestone donut) · AAA-L (Others IA restructure).
> The detailed sub-sections below are retained as the implementation record; they are complete and frozen.

---

### AAA-A: Fix `costIncurredThisPeriod` Data Source (CRITICAL BUG)
**File:** `pmo-frontend/utils/adapters.ts`, `pmo-frontend/components/coi/CiProjectAnalyticsTab.vue`
**Research:** R-038

The root cause is that `cost_incurred_this_period` is a column on `construction_progress_reports`, not on `construction_projects`. The ZZZ-A fix mapped the wrong source.

**Step 1 — Fix adapter (`adaptProjectDetail`):**
```typescript
// backend.progress_reports is sorted DESC → index 0 = latest
const latestReport = Array.isArray(backend.progress_reports) && backend.progress_reports.length > 0
  ? backend.progress_reports[0]
  : null
// ...existing mapping...
costIncurredThisPeriod: latestReport?.cost_incurred_this_period
  ? Number(latestReport.cost_incurred_this_period)
  : null,
```
Also expose: `latestProgressReportId: latestReport?.id ?? null`, `latestProgressReportDate: latestReport?.report_date ?? null` (to UIProjectDetail interface for analytics UI source reference).

**Step 2 — Update `UIProjectDetail` interface:**
Add two fields:
```typescript
latestProgressReportId: string | null
latestProgressReportDate: string | null
```
Add to `BackendProjectDetail`:
```typescript
progress_reports?: Array<{
  id: string; cost_incurred_this_period?: string | null
  cost_incurred_to_date?: string | null; report_date?: string
  report_number?: string | null
}>
```

**Step 3 — Update analytics cards (CiProjectAnalyticsTab.vue):**
Add source metadata below each "Cost This Period" card:
```html
<div class="text-caption text-grey">Cost This Period</div>
<div class="text-body-2 font-weight-bold">{{ fmtCurrency(costThisPeriod) }}</div>
<div v-if="costThisPeriod > 0" class="text-caption text-grey" style="font-size:10px">
  {{ props.project.latestProgressReportDate ? `from ${fmtDate(props.project.latestProgressReportDate)}` : '' }}
</div>
<div v-else class="text-caption text-grey-lighten-1" style="font-size:10px">No progress report filed</div>
```
Apply same pattern to "Cost To Date" card.

**Acceptance:**
- [ ] "Cost This Period" card shows non-zero value when a progress report with `cost_incurred_this_period` exists
- [ ] "No progress report filed" note shows when null
- [ ] Source date shown below the amount when populated
- [ ] No TypeScript errors

---

### AAA-B: Wire Audit Log Tab (Already Built)
**File:** `pmo-frontend/pages/coi/detail-[id].vue`
**Research:** R-039

`CiAuditLogPanel` component exists, is imported, and the audit trail already loads. Only the tab wiring is missing.

**Step 1 — Add audit tab to DETAIL_TAB_ORDER:**
```typescript
const DETAIL_TAB_ORDER = ['overview', 'progress', 'analytics', 'documents', 'team', 'others', 'audit'] as const
```
No DETAIL_TAB_PERM_MAP entry needed — audit tab gated by `isAdmin` in the template.

**Step 2 — Add `v-tab`:**
```html
<!-- Audit Log tab — admin only -->
<v-tab v-if="isAdmin" value="audit">
  <v-icon start icon="mdi-history" />Audit Log
</v-tab>
```

**Step 3 — Add `v-window-item`:**
```html
<!-- AUDIT LOG TAB (admin only) -->
<v-window-item v-if="isAdmin" value="audit">
  <v-alert type="info" variant="tonal" density="compact" class="mb-4">
    <strong>Project Audit Trail</strong> — All create, update, delete, upload, and access events for this project. Visible to Administrators only.
  </v-alert>
  <CiAuditLogPanel :project-id="projectId" :initial-limit="200" />
</v-window-item>
```

**Step 4 — Remove legacy `loadAuditTrail()` and audit refs** (lines ~67–87 in script) — `CiAuditLogPanel` fetches its own data. Also remove `auditActionColor()` function if unused.

**Acceptance:**
- [ ] Audit Log tab visible when logged in as Admin/SuperAdmin
- [ ] Audit Log tab NOT visible for Staff, Contractor, or non-admin users
- [ ] `CiAuditLogPanel` renders with correct project activity data
- [ ] Legacy `loadAuditTrail` function and auditLogs refs removed
- [ ] No TypeScript errors

---

### AAA-C: Overview Expand / Collapse All Toggle
**File:** `pmo-frontend/pages/coi/detail-[id].vue`
**Research:** R-040

**Step 1 — Add computed + toggle function:**
```typescript
const OVERVIEW_PANEL_COUNT = 8
const allPanelsExpanded = computed(() => overviewPanels.value.length === OVERVIEW_PANEL_COUNT)
function toggleAllPanels() {
  overviewPanels.value = allPanelsExpanded.value ? [] : Array.from({ length: OVERVIEW_PANEL_COUNT }, (_, i) => i)
}
```

**Step 2 — Add toggle button to KI-A strip** (inside the existing `d-flex flex-wrap` container, aligned right):
```html
<v-spacer />
<v-btn
  icon
  size="small"
  variant="text"
  :aria-label="allPanelsExpanded ? 'Collapse all panels' : 'Expand all panels'"
  @click="toggleAllPanels"
>
  <v-icon>{{ allPanelsExpanded ? 'mdi-collapse-all' : 'mdi-expand-all' }}</v-icon>
</v-btn>
```

**Acceptance:**
- [ ] Single click expands all 8 overview panels
- [ ] Single click collapses all panels
- [ ] Button icon reflects current state (expand-all / collapse-all)
- [ ] `aria-label` updates with state
- [ ] No disruption to existing panel state management

---

### AAA-D: Fix CiScrollToTopFab Overlap
**File:** `pmo-frontend/components/coi/CiScrollToTopFab.vue`
**Research:** R-041

Simple position fix — move FAB upward to clear the standard action footer height.

**Change:**
```css
.coi-scroll-fab {
  position: fixed;
  bottom: 80px;  /* was 24px — 80px clears the ~48px action footer + margin */
  right: 24px;
  z-index: 1100;
}
```

**Acceptance:**
- [ ] FAB no longer overlaps "Save Changes" / "Next" buttons on edit/new pages
- [ ] FAB still visible on detail page (no action footer there)
- [ ] No functional regression

---

### AAA-E: Sync new.vue Others Tab with edit-[id].vue
**File:** `pmo-frontend/pages/coi/new.vue`
**Research:** R-042

new.vue Others tab is missing: Data Banking, Lessons Learned, Site Observations. Also missing: `CiScrollToTopFab`. 

**Step 1 — Add missing script refs and helpers to new.vue** (mirror edit-[id].vue pattern):
```typescript
// Data Banking
const notesAdditional   = ref('')
const notesSpecial      = ref('')
const notesReferences   = ref<Array<{ label: string; url: string; notes: string }>>([])
const notesHistorical   = ref<Array<{ date: string; description: string }>>([])
const notesMetadataRows = ref<Array<{ key: string; value: string }>>([])
function addNoteReference() { notesReferences.value.push({ label: '', url: '', notes: '' }) }
function removeNoteReference(i: number) { notesReferences.value.splice(i, 1) }
function addNoteHistorical() { notesHistorical.value.push({ date: '', description: '' }) }
function removeNoteHistorical(i: number) { notesHistorical.value.splice(i, 1) }
function addNoteMetadata() { notesMetadataRows.value.push({ key: '', value: '' }) }
function removeNoteMetadata(i: number) { notesMetadataRows.value.splice(i, 1) }

// ZZZ-D Ext: Lessons Learned + Site Observations
const authStore = useAuthStore()
const currentUserName = computed(() => authStore.userFullName || authStore.userEmail || '')
const LESSON_PHASES = ['PLANNING', 'MOBILIZATION', 'CIVIL_WORKS', 'FINISHING', 'CLOSEOUT', 'OTHER']
const lessonsLearned = ref<Array<{ phase: string; observation: string; recommendation: string; addedBy?: string; addedAt?: string }>>([])
const siteObservations = ref<Array<{ date: string; observer: string; observation: string; location?: string; actionRequired: boolean }>>([])
function addLesson() { lessonsLearned.value.push({ phase: 'OTHER', observation: '', recommendation: '', addedBy: currentUserName.value, addedAt: new Date().toISOString() }) }
function removeLesson(i: number) { lessonsLearned.value.splice(i, 1) }
function addSiteObservation() { siteObservations.value.push({ date: '', observer: currentUserName.value, observation: '', location: '', actionRequired: false }) }
function removeSiteObservation(i: number) { siteObservations.value.splice(i, 1) }
```

**Step 2 — Add `project_notes_banking` to the create payload** (in `handleSubmit`):
```typescript
project_notes_banking: (notesAdditional.value || notesSpecial.value || notesReferences.value.length || notesHistorical.value.length || notesMetadataRows.value.length || lessonsLearned.value.length || siteObservations.value.length)
  ? {
      additionalNotes: notesAdditional.value || undefined,
      specialInstructions: notesSpecial.value || undefined,
      projectReferences: notesReferences.value.filter(r => r.label.trim()),
      historicalReferences: notesHistorical.value.filter(r => r.description.trim()),
      customMetadata: Object.fromEntries(notesMetadataRows.value.filter(r => r.key.trim()).map(r => [r.key.trim(), r.value])),
      lessonsLearned: lessonsLearned.value.filter(l => l.observation.trim()),
      siteObservations: siteObservations.value.filter(o => o.observation.trim()),
    }
  : undefined,
```

**Step 3 — Add the 3 new cards to the Others v-window-item** (copy the exact same card markup from edit-[id].vue Others tab: Data Banking card, Lessons Learned card, Site Observations card). Place after Escalation Records, before the submit section.

**Step 4 — Add `CiScrollToTopFab`** at end of template:
```html
<CiScrollToTopFab />
```
Import: `import CiScrollToTopFab from '~/components/coi/CiScrollToTopFab.vue'`

**Acceptance:**
- [ ] new.vue Others tab has Data Banking card (additionalNotes, specialInstructions, projectReferences, historicalReferences, customMetadata)
- [ ] new.vue Others tab has Lessons Learned card with phase dropdown
- [ ] new.vue Others tab has Site Observations card with action-required toggle
- [ ] `project_notes_banking` included in create payload when any field has data
- [ ] CiScrollToTopFab present in new.vue
- [ ] No TypeScript errors

---

### AAA-F: WAR Physical Accomplishment Input
**File:** `pmo-frontend/components/coi/CiTimelogsContainer.vue`
**Research:** R-043

WAR form Section 3 currently shows info-only banner. Add `accomplishment_summary_percent` input (reuses existing entity column / DTO field — no backend changes).

**Change — WAR Section 3 Physical Accomplishment:**
Replace the info-only `v-alert` with:
```html
<!-- Section 3: Physical Accomplishment (WAR) -->
<v-col cols="12" sm="4">
  <v-text-field
    v-model.number="form.accomplishment_summary_percent"
    label="Physical Accomplishment This Week (%)"
    type="number" min="0" max="100" step="0.1"
    density="compact" variant="outlined" hide-details="auto"
  />
</v-col>
<v-col cols="12">
  <v-alert type="info" variant="tonal" density="compact" class="text-caption">
    Cumulative physical completion percentage is the official record in the <strong>Progress Reports</strong> tab. This field captures this week's reported accomplishment for WAR documentation purposes.
  </v-alert>
</v-col>
```

**Acceptance:**
- [ ] WAR form Section 3 has `accomplishment_summary_percent` input field
- [ ] Field saves and loads correctly (uses existing DTO/entity/service binding)
- [ ] MPR Section 3 unchanged (already had the field)
- [ ] Info note preserved (contextual, not a blocker)
- [ ] No migration required

---

### AAA-G: Strategic Alignment Narrative — Remove maxlength Constraint
**File:** `pmo-frontend/components/coi/CiBasicInfoForm.vue`
**Research:** R-044

**Change:**
```html
<!-- Remove: counter maxlength="2000" -->
<!-- Add: no maxlength, no counter -->
<v-textarea
  v-model="form.strategic_alignment"
  label="Strategic Alignment Narrative (optional)"
  placeholder="Describe how this project aligns with institutional strategic priorities..."
  rows="3"
  auto-grow
  density="compact"
  variant="outlined"
  hide-details="auto"
  :readonly="readOnly"
/>
```

**Acceptance:**
- [ ] Strategic alignment textarea accepts text beyond 2000 characters
- [ ] `counter` chip removed from textarea
- [ ] Backend DTO has no `MaxLength` validator (already validated: no change needed)
- [ ] `auto-grow` still works

---

### AAA-H: Analytics Tab — Financial Summary Enhancement + Compliance Section Header
**File:** `pmo-frontend/components/coi/CiProjectAnalyticsTab.vue`
**Research:** R-045, R-046

**Step 1 — Add summary KPI row above the FY bar chart:**
```typescript
// Computed totals from project.financials
const fyTotals = computed(() => {
  const fins = (props.project.financials || []) as any[]
  return {
    appropriation: fins.reduce((s, f) => s + Number(f.appropriation ?? 0), 0),
    obligation: fins.reduce((s, f) => s + Number(f.obligation ?? f.obligations ?? 0), 0),
    disbursement: fins.reduce((s, f) => s + Number(f.disbursement ?? 0), 0),
    obligationRate: 0, // computed below
  }
})
const fyObligationRate = computed(() =>
  fyTotals.value.appropriation > 0
    ? (fyTotals.value.obligation / fyTotals.value.appropriation * 100).toFixed(1)
    : '—'
)
```

Template addition (before the FY bar chart card):
```html
<v-row dense class="mb-2" v-if="hasFinancialData">
  <v-col cols="4"><v-card variant="outlined" class="pa-2 text-center" rounded="lg">
    <div class="text-caption text-grey">Total Appropriated</div>
    <div class="text-subtitle-2 font-weight-bold">{{ fmtCurrency(fyTotals.appropriation) }}</div>
  </v-card></v-col>
  <v-col cols="4"><v-card variant="outlined" class="pa-2 text-center" rounded="lg">
    <div class="text-caption text-grey">Total Obligated</div>
    <div class="text-subtitle-2 font-weight-bold">{{ fmtCurrency(fyTotals.obligation) }}</div>
  </v-card></v-col>
  <v-col cols="4"><v-card variant="tonal" color="primary" class="pa-2 text-center" rounded="lg">
    <div class="text-caption text-grey">Obligation Rate</div>
    <div class="text-subtitle-2 font-weight-bold">{{ fyObligationRate }}%</div>
  </v-card></v-col>
</v-row>
```

**Step 2 — Add "Governance & Compliance" section header** above the Document Compliance donut:
```html
<v-col cols="12">
  <v-alert variant="tonal" color="blue-grey" density="compact" class="mb-3" icon="mdi-shield-check-outline">
    <span class="text-subtitle-2 font-weight-semibold">Governance &amp; Compliance</span>
    <div class="text-caption">Document submission and compliance checklist status for this project.</div>
  </v-alert>
</v-col>
```
Place this `v-col` before the existing Document Compliance `v-col` in the bottom `v-row`.

**Acceptance:**
- [ ] 3-card FY totals row (Appropriated / Obligated / Obligation Rate) visible above bar chart when financials exist
- [ ] "Governance & Compliance" section banner visible above document compliance donut
- [ ] No regression to existing chart data
- [ ] No TypeScript errors

---

### AAA-I: Guidance Banners — Add Missing Tabs (new.vue + edit-[id].vue)
**Files:** `pmo-frontend/pages/coi/edit-[id].vue`, `pmo-frontend/pages/coi/new.vue`
**Research:** R-048

Add concise `v-alert variant="tonal" density="compact"` banners to tabs that currently have none. All banners: 2-3 lines max, professional tone.

**Missing banners to add:**

**edit-[id].vue — Basic Info tab (top of v-window-item value="basic"):**
```html
<v-alert type="info" variant="tonal" density="compact" class="mb-3">
  Complete the project identity, location, funding, objectives, and strategic alignment. Title, Project Code, Campus, Status, and Funding Source are required to save.
</v-alert>
```

**edit-[id].vue — Schedule tab (top of v-window-item value="schedule"):**
```html
<v-alert type="info" variant="tonal" density="compact" class="mb-3">
  Record contract dates, original and revised durations, and project completion dates. These dates drive the analytics timeline and WAR/MPR period calculations.
</v-alert>
```

**edit-[id].vue — Documents tab (top of v-window-item value="documents"):**
```html
<v-alert type="info" variant="tonal" density="compact" class="mb-3">
  Upload and manage project documents, compliance files, and gallery images. Use the repository cards to file documents by category.
</v-alert>
```

**new.vue — same 3 banners** (Basic Info, Schedule, Documents tabs). Note: Progress, Personnel, Others banners already exist in new.vue or will be added by this step.

**Acceptance:**
- [ ] Basic Info tab has guidance banner in both new.vue and edit-[id].vue
- [ ] Schedule tab has guidance banner in both pages
- [ ] Documents tab has guidance banner in both pages
- [ ] All banners use consistent style: `type="info" variant="tonal" density="compact"`

---

### AAA-J: Physical Progress Trend Chart (New Visualization)
**File:** `pmo-frontend/components/coi/CiProjectAnalyticsTab.vue`
**Research:** R-049

Adds the most valuable missing visualization: physical progress over time, with planned accomplishment overlay.

**Step 1 — Add composable call inside component:**
```typescript
import { useCoiProgressReports } from '~/composables/useCoiProgressReports'

const projectIdRef = computed(() => props.projectId)
const { items: progressReports } = useCoiProgressReports(projectIdRef)
```

**Step 2 — Add trend chart computed:**
```typescript
const physicalTrendChart = computed(() => {
  const sorted = [...progressReports.value]
    .sort((a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime())
  const categories = sorted.map(r => r.reportDate.slice(0, 7)) // YYYY-MM
  const actual = sorted.map(r => Number(r.percentageCompletion || 0))
  const planned = sorted.map(r => r.plannedAccomplishment != null ? Number(r.plannedAccomplishment) : null)
  const hasPlanned = planned.some(v => v != null)
  const series: any[] = [
    { name: 'Actual Physical %', type: 'area', data: actual },
  ]
  if (hasPlanned) series.push({ name: 'Planned %', type: 'line', data: planned })
  return {
    hasData: sorted.length >= 2,
    series,
    options: {
      chart: { type: 'line' as const, toolbar: { show: false } },
      stroke: { curve: 'smooth' as const, width: [2, 2], dashArray: [0, 5] },
      fill: { type: ['gradient', 'none'], gradient: { shadeIntensity: 0.3, opacityFrom: 0.4, opacityTo: 0.05 } },
      colors: ['#1976D2', '#9E9E9E'],
      xaxis: { categories, labels: { rotate: -30, style: { fontSize: '10px' } }, title: { text: 'Report Period' } },
      yaxis: { min: 0, max: 100, labels: { formatter: (v: number) => `${v}%` }, title: { text: 'Physical %' } },
      tooltip: { y: { formatter: (v: number) => `${v}%` } },
      legend: { show: hasPlanned },
      markers: { size: 4 },
    },
  }
})
```

**Step 3 — Insert chart in template** (after the existing "Cost Utilization bar + supporting charts" row, before the FY bar chart card):
```html
<!-- Physical Progress Trend -->
<v-col v-if="physicalTrendChart.hasData" cols="12">
  <v-card class="pa-3 mb-3" variant="outlined" rounded="lg">
    <div class="d-flex align-center ga-2 mb-2">
      <v-icon color="primary" size="small">mdi-trending-up</v-icon>
      <span class="text-subtitle-2 font-weight-semibold">Physical Progress Trend</span>
      <span class="text-caption text-grey ml-1">— actual vs planned per reporting period</span>
    </div>
    <VueApexCharts
      type="line"
      :series="physicalTrendChart.series"
      :options="physicalTrendChart.options"
      height="220"
    />
  </v-card>
</v-col>
```

**Acceptance:**
- [ ] Physical progress trend chart renders when ≥ 2 progress reports exist
- [ ] Actual % shown as area (filled) in primary blue
- [ ] Planned % shown as dashed grey line when plannedAccomplishment data exists
- [ ] X-axis shows report period (YYYY-MM format)
- [ ] Y-axis from 0 to 100%
- [ ] Chart hidden when < 2 progress reports (no misleading single-point charts)
- [ ] No TypeScript errors

---

### AAA-K: Milestone Completion Donut (New Visualization)
**File:** `pmo-frontend/components/coi/CiProjectAnalyticsTab.vue`
**Research:** R-049

Adds a 4-slice milestone health donut alongside the existing milestone progress bar chart.

**Step 1 — Add computed:**
```typescript
const milestoneDonutChart = computed(() => {
  const ms = (props.project.milestones || []) as any[]
  const counts = { COMPLETED: 0, IN_PROGRESS: 0, DELAYED: 0, PENDING: 0 }
  for (const m of ms) {
    const s = ((m.status || '') as string).toUpperCase()
    if (s in counts) counts[s as keyof typeof counts]++
    else counts.PENDING++
  }
  const labels = ['Completed', 'In Progress', 'Delayed', 'Pending']
  const series = [counts.COMPLETED, counts.IN_PROGRESS, counts.DELAYED, counts.PENDING]
  return {
    hasData: ms.length > 0 && series.some(v => v > 0),
    series,
    options: {
      chart: { type: 'donut' as const },
      labels,
      colors: ['#43A047', '#1976D2', '#E53935', '#9E9E9E'],
      legend: { position: 'bottom' as const },
      dataLabels: { enabled: true, formatter: (v: number, opts: any) => `${opts.w.globals.series[opts.seriesIndex]}` },
      plotOptions: { pie: { donut: { labels: { show: true, total: { show: true, label: 'Milestones', fontSize: '12px' } } } } },
    },
  }
})
```

**Step 2 — Replace or supplement the existing milestone section** — add the donut alongside the horizontal bar:
```html
<v-row dense v-if="hasMilestoneData" class="mb-3">
  <v-col cols="12" md="4">
    <!-- Milestone Health Donut -->
    <v-card class="pa-3 h-100" variant="outlined" rounded="lg">
      <div class="text-subtitle-2 font-weight-semibold mb-2">Milestone Health</div>
      <VueApexCharts v-if="milestoneDonutChart.hasData"
        type="donut"
        :series="milestoneDonutChart.series"
        :options="milestoneDonutChart.options"
        height="220"
      />
    </v-card>
  </v-col>
  <v-col cols="12" md="8">
    <!-- Existing: Milestone Progress Bar -->
    <v-card class="pa-3 h-100" variant="outlined" rounded="lg">
      <div class="text-subtitle-2 font-weight-semibold mb-2">Milestone Progress by Item</div>
      <div v-if="!hasNonZeroMilestones" class="text-center py-6 text-grey text-body-2">No milestone progress recorded</div>
      <VueApexCharts v-else type="bar" :series="milestoneChart.series" :options="milestoneChart.options" height="220" />
    </v-card>
  </v-col>
</v-row>
```

**Acceptance:**
- [ ] Milestone health donut visible when milestones exist (4 slices: Completed/In Progress/Delayed/Pending)
- [ ] Color coding: green (completed), blue (in progress), red (delayed), grey (pending)
- [ ] Existing milestone progress bar preserved (not removed)
- [ ] Both charts in same row (40/60 split) when milestones exist
- [ ] Donut shows total milestone count in center

---

### AAA-L: Others Tab — Information Architecture Restructure
**Files:** `pmo-frontend/pages/coi/detail-[id].vue`
**Research:** R-050

Restructures the Others tab display into 4 named sections without changing data models, storage, or backend.

**Finding:** All containers keep their data. The change is grouping, headers, and layout only.

**Section A — Already implemented (ZZZ-D):** Notes Banking always-visible 2-col card. No changes needed.

**Section B — Institutional Knowledge (group + layout change):**
Currently: Lessons Learned card (full-width, conditional) → Site Observation Log card (full-width, conditional).
Change to: Side-by-side 2-column layout with always-visible empty states:
```html
<!-- SECTION B: Institutional Knowledge -->
<div class="d-flex align-center ga-2 mb-3 mt-2">
  <v-icon size="18" color="amber-darken-2">mdi-lightbulb-on-outline</v-icon>
  <span class="text-subtitle-2 font-weight-semibold text-grey-darken-2">Institutional Knowledge</span>
</div>
<v-row>
  <!-- Lessons Learned -->
  <v-col cols="12" md="6">
    <v-card variant="outlined" class="mb-4 h-100" rounded="lg">
      <v-card-title class="d-flex align-center ga-2 py-2 px-4 bg-grey-lighten-4 text-subtitle-1">
        <v-icon icon="mdi-lightbulb-on-outline" size="small" color="amber-darken-2" />
        <span class="font-weight-medium">Lessons Learned</span>
        <v-chip v-if="notesBanking?.lessonsLearned?.length" size="x-small" variant="tonal" color="amber-darken-2">
          {{ notesBanking.lessonsLearned.length }}
        </v-chip>
      </v-card-title>
      <v-divider />
      <v-card-text>
        <!-- Empty state -->
        <div v-if="!notesBanking?.lessonsLearned?.length" class="text-center text-grey py-4">
          <v-icon size="32" color="grey-lighten-2">mdi-lightbulb-off-outline</v-icon>
          <p class="text-body-2 mt-2">No lessons recorded.</p>
          <v-btn size="small" variant="text" color="primary" :to="`/coi/edit-${projectId}?tab=others`">
            Add via Edit Project →
          </v-btn>
        </div>
        <!-- Populated: timeline list (same as current) -->
        <v-timeline v-else density="compact" align="start" side="end">
          <v-timeline-item v-for="(l, i) in notesBanking.lessonsLearned" :key="i" dot-color="amber-darken-2" size="small">
            <div class="d-flex align-center ga-2 mb-1">
              <v-chip size="x-small" variant="tonal" color="amber-darken-2">{{ personnelCatLabel(l.phase) }}</v-chip>
            </div>
            <div class="text-body-2"><strong>Observation:</strong> {{ l.observation }}</div>
            <div v-if="l.recommendation" class="text-body-2"><strong>Recommendation:</strong> {{ l.recommendation }}</div>
          </v-timeline-item>
        </v-timeline>
      </v-card-text>
    </v-card>
  </v-col>
  <!-- Site Observations -->
  <v-col cols="12" md="6">
    <v-card variant="outlined" class="mb-4 h-100" rounded="lg">
      <v-card-title class="d-flex align-center ga-2 py-2 px-4 bg-grey-lighten-4 text-subtitle-1">
        <v-icon icon="mdi-eye-outline" size="small" color="teal" />
        <span class="font-weight-medium">Site Observations</span>
        <v-chip v-if="notesBanking?.siteObservations?.length" size="x-small" variant="tonal" color="teal">
          {{ notesBanking.siteObservations.length }}
        </v-chip>
      </v-card-title>
      <v-divider />
      <v-card-text>
        <!-- Empty state -->
        <div v-if="!notesBanking?.siteObservations?.length" class="text-center text-grey py-4">
          <v-icon size="32" color="grey-lighten-2">mdi-eye-off-outline</v-icon>
          <p class="text-body-2 mt-2">No site observations recorded.</p>
          <v-btn size="small" variant="text" color="primary" :to="`/coi/edit-${projectId}?tab=others`">
            Add via Edit Project →
          </v-btn>
        </div>
        <!-- Populated: table (same as current) -->
        <v-table v-else density="compact">
          <thead><tr><th>Date</th><th>Observer</th><th>Observation</th><th>Action</th></tr></thead>
          <tbody>
            <tr v-for="(o, i) in notesBanking.siteObservations" :key="i">
              <td class="text-caption">{{ o.date ? formatDate(o.date) : '—' }}</td>
              <td class="text-caption">{{ o.observer || '—' }}</td>
              <td class="text-body-2">{{ o.observation }}</td>
              <td><v-chip v-if="o.actionRequired" size="x-small" color="error" variant="tonal">Action Required</v-chip><span v-else class="text-caption text-grey">—</span></td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </v-col>
</v-row>
```

**Section C — Risk & Incident Management (new section header + grouped expansion panels):**
```html
<!-- SECTION C: Risk & Incident Management (only when data exists) -->
<template v-if="project?.incidentLog?.length || project?.riskRegister?.length || project?.escalationRecords?.length">
  <div class="d-flex align-center ga-2 mb-3 mt-2">
    <v-icon size="18" color="error">mdi-shield-alert-outline</v-icon>
    <span class="text-subtitle-2 font-weight-semibold text-grey-darken-2">Risk &amp; Incident Management</span>
  </div>
  <v-expansion-panels variant="accordion" multiple class="mb-4">
    <!-- Incident Log -->
    <v-expansion-panel v-if="project?.incidentLog?.length"> ... (existing markup) </v-expansion-panel>
    <!-- Risk Register -->
    <v-expansion-panel v-if="project?.riskRegister?.length"> ... (existing markup) </v-expansion-panel>
    <!-- Escalation Records -->
    <v-expansion-panel v-if="project?.escalationRecords?.length"> ... (existing markup) </v-expansion-panel>
  </v-expansion-panels>
</template>
```

**Section D — Administrative Records (new section header + grouped expansion panels):**
```html
<!-- SECTION D: Administrative Records (only when data exists) -->
<template v-if="project?.statusUpdates?.length || project?.readinessDocuments?.length || project?.signatories?.length">
  <div class="d-flex align-center ga-2 mb-3 mt-2">
    <v-icon size="18" color="info">mdi-folder-text-outline</v-icon>
    <span class="text-subtitle-2 font-weight-semibold text-grey-darken-2">Administrative Records</span>
  </div>
  <v-expansion-panels variant="accordion" multiple class="mb-4">
    <!-- Status Updates -->
    <v-expansion-panel v-if="project?.statusUpdates?.length"> ... (existing markup) </v-expansion-panel>
    <!-- Readiness Documents -->
    <v-expansion-panel v-if="project?.readinessDocuments?.length"> ... (existing markup) </v-expansion-panel>
    <!-- Signatories -->
    <v-expansion-panel v-if="project?.signatories?.length"> ... (existing markup) </v-expansion-panel>
  </v-expansion-panels>
</template>
```

**Remove:** The single `<v-expansion-panels v-if="hasLegacyOthersData">` wrapper — replaced by the two new sectioned wrappers (Section C and D each have their own conditional).

**Acceptance:**
- [ ] Section B (Institutional Knowledge) shows Lessons Learned + Site Observations side-by-side
- [ ] Section B always visible even when both are empty — each shows its own CTA
- [ ] Section C header "Risk & Incident Management" visible only when Incident/Risk/Escalation data exists
- [ ] Section D header "Administrative Records" visible only when Status/Readiness/Signatories data exists
- [ ] Original data content of all panels unchanged (no data lost)
- [ ] Detail page remains read-only
- [ ] `hasLegacyOthersData` computed may remain but is no longer the single outer gate
- [ ] No TypeScript errors

---

### AAA Verification Checklist
- [ ] AAA-A: Cost This Period shows non-zero value from latest progress report
- [ ] AAA-A: Source date note visible below cost cards in analytics
- [ ] AAA-B: Audit Log tab visible for Admin/SuperAdmin; hidden for others
- [ ] AAA-B: CiAuditLogPanel renders project audit entries
- [ ] AAA-C: Expand/Collapse All toggle button in Overview tab
- [ ] AAA-D: FAB no longer overlaps Save Changes / Next buttons
- [ ] AAA-E: new.vue Others tab has Data Banking + Lessons Learned + Site Observations
- [ ] AAA-E: new.vue CiScrollToTopFab present
- [ ] AAA-F: WAR form Section 3 has physical accomplishment input field
- [ ] AAA-G: Strategic alignment textarea has no maxlength restriction
- [ ] AAA-H: FY financial totals row (Appropriated / Obligated / Rate) above FY bar chart
- [ ] AAA-H: "Governance & Compliance" banner above document compliance donut
- [ ] AAA-I: Guidance banners on Basic Info, Schedule, Documents tabs in both pages
- [ ] AAA-J: Physical progress trend line/area chart visible when ≥ 2 progress reports
- [ ] AAA-J: Planned % overlay shown as dashed line when plannedAccomplishment data exists
- [ ] AAA-J: Chart hidden when < 2 reports (no single-point charts)
- [ ] AAA-K: Milestone health donut (Completed/In Progress/Delayed/Pending) visible when milestones exist
- [ ] AAA-K: Existing milestone progress bar preserved alongside donut
- [ ] AAA-L: Others tab Section B (Institutional Knowledge) shows Lessons Learned + Site Observations side-by-side
- [ ] AAA-L: Section B always visible with CTA when empty
- [ ] AAA-L: Section C "Risk & Incident Management" header groups Incident/Risk/Escalation panels
- [ ] AAA-L: Section D "Administrative Records" header groups Status/Readiness/Signatories panels
- [ ] AAA-L: Sections C and D only visible when their data exists
- [ ] No vue-tsc errors introduced across all modified files

---

## PHASE BBB — ✅ COMPLETE (Phase 3 implemented 2026-06-04; see history.md)
> **Status:** ✅ Phase 3 complete — vue-tsc + tsc 0 new errors. Not yet committed.
> **Research:** R-051 through R-055 (research.md)
> **Delivered:** BBB-A (empty FY/milestone charts removed; Cost Progression chart added) · BBB-B (Incident Log + Site Observations removed from all 3 pages; Others IA restructured) · BBB-C (WAR/MAR billing fields + new migration) · BBB-D (new.vue Progress tab compact snapshot) · BBB-E (progress report card 4 sections + date label + cost fields side-by-side)
> **Pre-use:** run `npx mikro-orm migration:up` (1 new migration: `Migration20260604100000_AddFinancialFieldsToTimelineEntries`) + backend restart

---

### BBB-A: Analytics — Remove Empty FY Chart + Milestone Charts; Add Cost Progression
**File:** `pmo-frontend/components/coi/CiProjectAnalyticsTab.vue`
**Research:** R-051, R-052

**Root cause:** `project.financials[]` is always `[]` — `ConstructionProjectFinancial` entity was archived NI-2026-05-21. FY bar chart, `fyTotals` KPI row, and `fyObligationRate` are permanently empty.

**Step 1 — Remove dead computeds:**
- Delete `fyTotals` computed
- Delete `fyObligationRate` computed
- Delete `fyUtilizationGauges` computed
- Delete `milestoneChart` computed
- Delete `milestoneSlippageChart` computed
- Delete `milestoneDonutChart` computed (AAA-K)
- Delete `milestoneCompletionRate` computed (if unused elsewhere)
- Delete `hasNonZeroMilestones` computed

**Step 2 — Remove dead template blocks:**
- Delete the `<v-row v-if="hasFinancialData" dense class="mb-1">` FY totals row (3 cards)
- Delete the FY bar chart `v-card` ("FY Appropriation & Obligation Trend")
- Delete the `<v-row v-if="hasMilestoneData" dense>` milestone donut + bar row
- Delete the `milestoneSlippageChart` section if present in template

**Step 3 — Add Cost Progression line chart (replaces FY chart):**
Using `progressReports` (already fetched via `useCoiProgressReports` composable from AAA-J):
```typescript
const costProgressionChart = computed(() => {
  const sorted = [...progressReports.value]
    .filter(r => r.costIncurredToDate != null)
    .sort((a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime())
  const categories = sorted.map(r => r.reportDate.slice(0, 7))
  const data = sorted.map(r => Number(r.costIncurredToDate || 0))
  return {
    hasData: sorted.length >= 2 && data.some(v => v > 0),
    series: [{ name: 'Cost Incurred to Date (₱)', data }],
    options: {
      chart: { type: 'area' as const, toolbar: { show: false } },
      stroke: { curve: 'smooth' as const, width: 2 },
      fill: { type: 'gradient', gradient: { shadeIntensity: 0.3, opacityFrom: 0.4, opacityTo: 0.05 } },
      colors: ['#43A047'],
      xaxis: { categories, labels: { rotate: -30, style: { fontSize: '10px' } }, title: { text: 'Report Period' } },
      yaxis: { labels: { formatter: (v: number) => fmtCurrency(v) }, title: { text: 'Cost (₱)' } },
      tooltip: { y: { formatter: (v: number) => fmtCurrency(v) } },
    },
  }
})
```
Template (replaces FY chart card):
```html
<v-col v-if="costProgressionChart.hasData" cols="12" md="6">
  <v-card class="pa-3 mb-3" variant="outlined" rounded="lg">
    <div class="d-flex align-center ga-2 mb-2">
      <v-icon color="success" size="small">mdi-cash-clock</v-icon>
      <span class="text-subtitle-2 font-weight-semibold">Cost Incurred Progression</span>
      <span class="text-caption text-grey ml-1">— cumulative per report period</span>
    </div>
    <VueApexCharts type="area" :series="costProgressionChart.series" :options="costProgressionChart.options" height="220" />
  </v-card>
</v-col>
```

**Step 4 — Update `allEmpty` guard:**
Remove `hasMilestoneData` from `allEmpty` condition (milestone removal means empty milestone array shouldn't prevent showing other analytics).

**Acceptance:**
- [ ] No empty FY chart rendered (permanently removed)
- [ ] No empty milestone charts rendered
- [ ] Cost Progression area chart shows when ≥ 2 progress reports with cost data exist
- [ ] Physical Progress Trend (AAA-J) unaffected
- [ ] No TypeScript errors

---

### BBB-B: Others Tab — Remove Site Observations + Incident Log; Restructure IA
**Files:** `pmo-frontend/pages/coi/detail-[id].vue`, `pmo-frontend/pages/coi/edit-[id].vue`, `pmo-frontend/pages/coi/new.vue`
**Research:** R-055

Supersedes the AAA-L Section B partial implementation. Removes Site Observations and Incident Log from all three pages.

**Step 1 — adapters.ts:** Remove `siteObservations` from `projectNotesBanking` type in `UIProjectDetail`. Keep `incidentLog` on the project type (DB column preserved) but stop rendering it.

**Step 2 — detail-[id].vue Others tab restructure:**
- **Section A** (Project Notes): Unchanged (Notes Banking 2-col card) ✅
- **Section B** (Institutional Knowledge): Remove side-by-side layout. Replace with **single full-width Lessons Learned card** (always visible with CTA if empty). Remove Site Observations card entirely.
- **Section C** (Risk & Escalation Management): Group `Risk Register` + `Escalation Records` under the section header. **Remove Incident Log** from this group.
- **Section D** (Administrative Records): Unchanged (Status Updates + Readiness Documents + Signatories).

**Step 3 — edit-[id].vue Others tab:**
- Remove the "Site Observations" card (vCards + refs + helpers)
- Remove the "Incidents / Special Concerns" card from the LEFT column
- Restructure left column: Risk Register only (was Risk Register + Incidents)
- Remove `siteObservations`, `addSiteObservation`, `removeSiteObservation` refs/helpers
- Remove `incidentLogRows`, `addIncident`, `removeIncident` refs/helpers
- Remove from save payload: `incident_log`
- Hydration: stop populating `incidentLogRows` from backend

**Step 4 — new.vue Others tab:**
- Same removals: Site Observations card, Incidents/Special Concerns card
- Remove `incidentLogRows`, `siteObservations` refs (added in AAA-E)
- Remove from create payload: `incident_log`

**Step 5 — `hasNotesBanking` computed** in detail-[id].vue: Remove `n.siteObservations?.length` from the check.

**Acceptance:**
- [ ] Site Observation Log removed from detail, edit, and new pages
- [ ] Incident Log removed from detail, edit, and new pages
- [ ] Risk Register and Escalation Records remain under "Risk & Escalation Management" section header
- [ ] Lessons Learned card always visible (full-width) with CTA when empty
- [ ] Data Banking (Notes Banking) section A unchanged
- [ ] Administrative Records (D) unchanged
- [ ] `project_notes_banking.siteObservations` data preserved in DB (no migration needed)
- [ ] `incident_log` data preserved in DB (no migration needed)
- [ ] No TypeScript errors

---

### BBB-C: WAR/MAR — Financial Billing Fields (New Migration)
**Files:** `construction-timeline-entry.entity.ts`, `create-timeline-entry.dto.ts`, `construction-projects.service.ts`, `CiTimelogsContainer.vue`, new migration
**Research:** R-053

Adds financial billing capture to WAR and MPR forms as operational (non-governance) records.

**Step 1 — Migration:**
```typescript
// Migration20260604100000_AddFinancialFieldsToTimelineEntries.ts
ALTER TABLE construction_timeline_entries
  ADD COLUMN IF NOT EXISTS billing_amount_this_period DECIMAL(15,2),
  ADD COLUMN IF NOT EXISTS financial_accomplishment_percent DECIMAL(5,2);
COMMENT ON COLUMN construction_timeline_entries.billing_amount_this_period
  IS 'BBB-C: Billing billed to owner this period (WAR/MPR operational record; not the governance record)';
COMMENT ON COLUMN construction_timeline_entries.financial_accomplishment_percent
  IS 'BBB-C: Financial accomplishment % this period (WAR/MPR; Progress Reports is official)';
```

**Step 2 — Entity:**
```typescript
@Property({ nullable: true, columnType: 'decimal(15,2)' })
billingAmountThisPeriod?: number;

@Property({ nullable: true, columnType: 'decimal(5,2)' })
financialAccomplishmentPercent?: number;
```

**Step 3 — DTO:**
```typescript
@IsOptional() @IsNumber() billing_amount_this_period?: number;
@IsOptional() @IsNumber() financial_accomplishment_percent?: number;
```

**Step 4 — Service:** Persist both fields in `createTimelineEntry()` and `updateTimelineEntry()`.

**Step 5 — Frontend (`CiTimelogsContainer.vue`):**
- Add to `blank()`: `billing_amount_this_period: null, financial_accomplishment_percent: null`
- Add to `TimelogEntry` interface: `billingAmountThisPeriod?: number | null; financialAccomplishmentPercent?: number | null`
- Add to `openEdit()` hydration
- Add to `save()` payload

**Step 6 — WAR/MAR Form template — Section 4 Financial Accomplishment:**
Replace info-only `v-alert` in the WAR financial section with:
```html
<!-- WAR: Financial Accomplishment -->
<v-col cols="12" sm="4">
  <v-text-field
    v-model.number="form.financial_accomplishment_percent"
    label="Financial Accomplishment This Week (%)"
    type="number" min="0" max="100" step="0.1"
    density="compact" variant="outlined" hide-details="auto"
  />
</v-col>
<v-col cols="12" sm="4">
  <v-text-field
    v-model.number="form.billing_amount_this_period"
    label="Billing This Period (₱)"
    type="number" min="0" prefix="₱"
    density="compact" variant="outlined" hide-details="auto"
  />
</v-col>
<v-col cols="12">
  <v-alert type="info" variant="tonal" density="compact" class="text-caption">
    Official financial accomplishment is the record in <strong>Progress Reports</strong>. These fields capture the site-level operational billing reference for WAR/MPR documentation.
  </v-alert>
</v-col>
```
Same fields for MPR section 4.

**Acceptance:**
- [ ] Migration creates both columns
- [ ] Entity has `billingAmountThisPeriod` and `financialAccomplishmentPercent`
- [ ] DTO accepts both fields
- [ ] Service persists both fields on create and update
- [ ] WAR form Section 4 has financial accomplishment % + billing amount inputs
- [ ] MPR form Section 4 same fields (alongside existing MPR financial fields)
- [ ] Fields save and load correctly (requires migration run first)
- [ ] No TypeScript errors

---

### BBB-D: new.vue Progress Tab — Align with Edit Page Structure
**Files:** `pmo-frontend/pages/coi/new.vue`
**Research:** R-054

The new.vue Progress tab uses a simplified "initial snapshot" form while edit-[id].vue uses `CiProgressReportTab` + `CiTimelogsContainer`. Replace the simplified form with the same tab structure shown in the edit page but with empty-state guidance.

**Step 1 — Replace the simplified progress tab content:**
Remove:
- Physical Status card (physical_progress + as_of_date inputs)
- Financial Status card (cost_incurred_to_date + financial_progress + date_completed inputs)
- The HHH-I info alert

Replace with:
```html
<v-window-item value="progress">
  <v-alert type="info" variant="tonal" density="compact" class="mb-4" icon="mdi-information-outline">
    Progress reports, timelogs, and variation orders become available after saving the project.
    Use the fields below to record the initial project snapshot — these can be updated in the edit page.
  </v-alert>

  <!-- Retained: initial snapshot fields (physical_progress, financial_progress, cost_incurred_to_date, as_of_date) -->
  <!-- Reorganized as a compact "Project Snapshot" card -->
  <v-card class="mb-4" elevation="1" rounded="lg">
    <v-card-title class="d-flex align-center ga-2 py-2 px-4 bg-grey-lighten-4">
      <v-icon size="small" icon="mdi-chart-timeline-variant" color="primary" />
      <span class="text-subtitle-1 font-weight-medium">Initial Project Snapshot</span>
    </v-card-title>
    <v-card-subtitle class="pt-2 pb-1 text-body-2 text-grey-darken-1" style="white-space: normal;">
      Set the current project status at creation time. Full progress reporting (WAR/MPR, timelogs, variation orders) is available after saving.
    </v-card-subtitle>
    <v-divider />
    <v-card-text class="py-3">
      <v-row dense>
        <v-col cols="6" sm="3">
          <v-text-field v-model.number="form.physical_progress" label="Physical %" type="number" min="0" max="100" suffix="%" density="compact" variant="outlined" hide-details="auto" />
        </v-col>
        <v-col cols="6" sm="3">
          <v-text-field v-model.number="form.financial_progress" label="Financial %" type="number" min="0" max="100" suffix="%" density="compact" variant="outlined" hide-details="auto" />
        </v-col>
        <v-col cols="6" sm="3">
          <v-text-field v-model.number="form.cost_incurred_to_date" label="Cost to Date (₱)" type="number" min="0" prefix="₱" density="compact" variant="outlined" hide-details="auto" />
        </v-col>
        <v-col cols="6" sm="3">
          <v-text-field v-model="form.as_of_date" label="As of Date" type="date" density="compact" variant="outlined" hide-details="auto" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <!-- Preview of post-save capabilities (read-only; no project ID yet) -->
  <div class="d-flex flex-column ga-3">
    <v-card variant="outlined" class="pa-4 text-center" rounded="lg">
      <v-icon size="36" color="grey-lighten-2">mdi-chart-line</v-icon>
      <p class="text-body-2 text-grey mt-2 mb-0">Progress Reports (WAR/MPR) — available after saving</p>
    </v-card>
    <v-card variant="outlined" class="pa-4 text-center" rounded="lg">
      <v-icon size="36" color="grey-lighten-2">mdi-clipboard-text-clock-outline</v-icon>
      <p class="text-body-2 text-grey mt-2 mb-0">Timelogs — available after saving</p>
    </v-card>
  </div>
</v-window-item>
```

**Step 2 — Remove stale refs** that were only used by the old progress tab cards (check for `progAsOfDateMenu`, `progDateCompletedMenu` date picker menus — these become unused if the date pickers are replaced by text inputs).

**Acceptance:**
- [ ] new.vue Progress tab shows compact "Initial Snapshot" card + post-save placeholder cards
- [ ] Physical %, Financial %, Cost to Date, As of Date fields all still included in create payload
- [ ] No `CiProgressReportTab` or `CiTimelogsContainer` mounted in new.vue (no project ID)
- [ ] Removes the `HHH-I` verbose alert replaced by more concise version
- [ ] No TypeScript errors

---

### BBB-E: Progress Report Card Layout — Sectioned View
**File:** `pmo-frontend/components/coi/CiProgressReportTab.vue`
**Research:** R-054 (progress report card UX)

Refactor the expanded card view to group all fields into 4 clear sections. Three specific layout corrections are required:

1. **Date label:** The LEFT identity column currently shows `r.reportDate` without a "Report Date:" label when a report number is present. Add an explicit `text-caption` label above the date.
2. **Cost fields side-by-side:** Currently `costIncurredToDate` is in the always-visible 2×2 grid while `costIncurredThisPeriod` is hidden in the expandable area. Move both into **Section 2** of the expanded view, rendered side-by-side in the same row.
3. **No field omissions:** All current fields must be accounted for in the new layout.

**Full field inventory (must all appear in the refactored layout):**

| Field | Location in New Layout |
|---|---|
| `reportType` | LEFT identity: chip label |
| `reportNumber` | LEFT identity: primary identifier |
| `reportDate` | LEFT identity: below number with **"Report Date"** label |
| `movLink` | RIGHT column: MOV button (unchanged) |
| `percentageCompletion` | Section 1: large stat |
| `plannedAccomplishment` | Section 1: stat |
| `slippage` | Section 1: stat (color-coded: error if negative) |
| `calendarDaysElapsed` | Section 1: stat |
| `percentTimeElapsed` | Section 1: stat |
| `costIncurredToDate` | Section 2: **side-by-side with costIncurredThisPeriod** |
| `costIncurredThisPeriod` | Section 2: **side-by-side with costIncurredToDate** |
| `remarksList` / `remarks` | Section 3: bullet list |
| `issuesEncounteredList` / `issuesEncountered` | Section 3: bullet list |
| `narrativeList` | Section 3: bullet list |
| `mitigationActionsList` / `mitigationActions` | Section 4: bullet list |

**Layout changes:**

*LEFT column identity block:*
```html
<v-chip size="small" variant="tonal" color="info">{{ r.reportType }}</v-chip>
<div class="text-subtitle-1 font-weight-medium mt-1">{{ r.reportNumber || '—' }}</div>
<div class="text-caption text-grey-darken-1 mt-1">Report Date</div>
<div class="text-body-2 font-weight-medium">{{ r.reportDate }}</div>
```

*CENTER always-visible grid:* Keep `percentageCompletion`, `plannedAccomplishment`, `slippage` in 2×2 (or 3-column) grid. **Move `costIncurredToDate` out of this always-visible grid** — it belongs with its pair in Section 2.

*Expanded sections (shown when card is expanded):*
```
── Section 1: Progress Summary ─────────────────────────
  % Completion | Planned % | Slippage | Calendar Days | % Time Elapsed

── Section 2: Financial Summary ────────────────────────
  [Cost This Period ₱XXX] [Cost To Date ₱XXX]   ← side-by-side

── Section 3: Narrative & Issues ───────────────────────
  Remarks (bullet list)
  Issues / Risks Encountered (bullet list)
  General Narrative Notes (bullet list)

── Section 4: Mitigation Actions ───────────────────────
  Mitigation Actions (bullet list)
```

Section headers use `text-caption font-weight-medium text-uppercase text-grey` + `v-divider` before each.

**Acceptance:**
- [ ] LEFT identity shows Report Date with explicit "Report Date" label
- [ ] Cost This Period and Cost To Date rendered in the same row (side-by-side) in Section 2
- [ ] Section 1 contains all 5 progress stats: % Completion, Planned %, Slippage, Calendar Days, % Time Elapsed
- [ ] Section 2 contains both cost fields — no cost field is hidden or conditional
- [ ] Section 3 contains Remarks, Issues/Risks, and Narrative lists (existing bullet pattern preserved)
- [ ] Section 4 contains Mitigation Actions list
- [ ] MOV link button remains in RIGHT column (unchanged)
- [ ] No existing data field removed or omitted from the refactored layout
- [ ] No TypeScript errors

---

### BBB Verification Checklist
- [ ] BBB-A: No empty FY bar chart in analytics tab
- [ ] BBB-A: Milestone charts removed from analytics
- [ ] BBB-A: Cost Progression area chart shows when cost report data exists
- [ ] BBB-B: Site Observation Log removed from detail, edit, new pages
- [ ] BBB-B: Incident Log removed from detail, edit, new pages
- [ ] BBB-B: Risk & Escalation Management section groups Risk + Escalation only
- [ ] BBB-B: Lessons Learned always-visible (full-width, CTA when empty)
- [ ] BBB-C: WAR/MPR financial billing fields save/load (post-migration)
- [ ] BBB-D: new.vue Progress tab shows compact snapshot + placeholder cards
- [ ] BBB-E: Progress report card LEFT column shows "Report Date" label above date value
- [ ] BBB-E: Cost This Period and Cost To Date are side-by-side in Section 2
- [ ] BBB-E: All 4 sections visible in expanded card (Progress Summary / Financial Summary / Narrative & Issues / Mitigation)
- [ ] BBB-E: No existing data field omitted from the refactored layout
- [ ] No vue-tsc errors introduced

---

## IMMEDIATE ACTIONS (Operator, No Dev Authorization Needed)

### GIT-1: Commit ZZZ + AAA
```bash
git add docs/ pmo-backend/src/ pmo-frontend/
git commit -m "feat: COI Phases ZZZ + AAA — analytics, team, others, WAR/MPR, form parity"
git push origin pmo-coi
```

### OPS: Verified Complete (per operator baseline)
All 6 migrations run ✅. Backend operational ✅. Smoke tests passed ✅.

---

---

## PHASE CCC — ✅ COMPLETE (Phase 3 implemented 2026-06-04; see history.md)
> **Status:** ✅ Phase 3 complete — vue-tsc 0 new errors. No migrations. Not yet committed.
> **Delivered:** CCC-A (camelCase adapter fix) · CCC-B (Others 4-section UX) · CCC-C (Timelog MOV integration)
> **Research:** R-056, R-057, R-058 (research.md)
> **Affected files:** `adapters.ts`, `edit-[id].vue`, `new.vue`, `CiTimelogsContainer.vue`, `construction-projects.service.ts` (1-line fix)

---

### CCC-A: Fix `costIncurredThisPeriod` — Definitive Adapter Fix
**File:** `pmo-frontend/utils/adapters.ts`
**Research:** R-056

**Root cause:** `findOne` returns `progress_reports` as MikroORM entity objects (camelCase) but adapter reads snake_case field names. `backend.progress_reports[0].cost_incurred_this_period` is always `undefined`; actual value is at `.costIncurredThisPeriod`. Same for `report_date` vs `reportDate`.

**Step 1 — Fix `costIncurredThisPeriod` mapper:**
```typescript
costIncurredThisPeriod: (() => {
  const r0 = Array.isArray(backend.progress_reports) && backend.progress_reports.length > 0
    ? (backend.progress_reports[0] as any)
    : null
  // MikroORM returns camelCase at runtime; interface declares snake_case as fallback
  const val = r0?.costIncurredThisPeriod ?? r0?.cost_incurred_this_period
  return val != null ? Number(val) : null
})(),
```

**Step 2 — Fix `latestProgressReportDate` mapper:**
```typescript
latestProgressReportDate: (() => {
  const r0 = Array.isArray(backend.progress_reports) && backend.progress_reports.length > 0
    ? (backend.progress_reports[0] as any)
    : null
  if (!r0) return null
  // MikroORM returns reportDate as a JS Date object; raw SQL fallback returns string
  const d = r0.reportDate ?? r0.report_date
  return d ? (d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10)) : null
})(),
```

**Step 3 — Fix `latestProgressReportId` mapper (same issue):**
```typescript
latestProgressReportId: (() => {
  const r0 = Array.isArray(backend.progress_reports) && backend.progress_reports.length > 0
    ? (backend.progress_reports[0] as any)
    : null
  return r0?.id ?? null
})(),
```

**Acceptance:**
- [ ] "Cost This Period" card in Analytics shows ₱100,000 matching the latest Progress Report
- [ ] "No progress report filed" note disappears when a progress report with `cost_incurred_this_period` exists
- [ ] Source date shown below the amount
- [ ] No TypeScript errors

---

### CCC-B: Others Tab — 4-Section UX Restructure (Edit + New Pages)
**Files:** `pmo-frontend/pages/coi/edit-[id].vue`, `pmo-frontend/pages/coi/new.vue`
**Research:** R-057

**No data model changes. All existing refs, helpers, and save payload are preserved. Template restructure only.**

Replace the current asymmetric 2-column layout with 4 clearly-labelled full-width sections:

**Section A: Project Governance** (Risk Register + Escalation Records side-by-side or stacked)
**Section B: Administrative Management** (Status Updates + Readiness Documents + Signatories — expanded by default, not collapsed)
**Section C: Project Knowledge Bank** (Data Banking card — additionalNotes, specialInstructions, projectReferences, historicalReferences, customMetadata)
**Section D: Lessons Learned** (Lessons Learned card)

**Template structure:**
```html
<v-window-item value="others">
  <v-alert type="info" variant="tonal" density="compact" class="mb-4">
    Record governance data, administrative records, institutional knowledge, and project notes.
    All data is preserved across sessions.
  </v-alert>

  <!-- SECTION A: Project Governance -->
  <div class="d-flex align-center ga-2 mb-3">
    <v-icon size="18" color="error">mdi-shield-alert-outline</v-icon>
    <span class="text-subtitle-2 font-weight-semibold text-grey-darken-2">Project Governance</span>
    <span class="text-caption text-grey ml-1">— risk tracking and escalation management</span>
  </div>
  <v-row dense class="mb-4">
    <v-col cols="12" md="6">
      <!-- Risk Register card (existing content) -->
    </v-col>
    <v-col cols="12" md="6">
      <!-- Escalation Records card (existing content) -->
    </v-col>
  </v-row>

  <!-- SECTION B: Administrative Management -->
  <div class="d-flex align-center ga-2 mb-3">
    <v-icon size="18" color="info">mdi-folder-text-outline</v-icon>
    <span class="text-subtitle-2 font-weight-semibold text-grey-darken-2">Administrative Management</span>
    <span class="text-caption text-grey ml-1">— status updates, readiness, and signatories</span>
  </div>
  <v-row dense class="mb-4">
    <v-col cols="12" md="4">
      <!-- Status Updates card (existing content) -->
    </v-col>
    <v-col cols="12" md="4">
      <!-- Readiness Documents card (existing content) -->
    </v-col>
    <v-col cols="12" md="4">
      <!-- Signatories card (existing content) -->
    </v-col>
  </v-row>

  <!-- SECTION C: Project Knowledge Bank -->
  <div class="d-flex align-center ga-2 mb-3">
    <v-icon size="18" color="primary">mdi-database-outline</v-icon>
    <span class="text-subtitle-2 font-weight-semibold text-grey-darken-2">Project Knowledge Bank</span>
    <span class="text-caption text-grey ml-1">— notes, references, metadata</span>
  </div>
  <!-- Data Banking card (existing, full-width) -->

  <!-- SECTION D: Lessons Learned -->
  <div class="d-flex align-center ga-2 mb-3 mt-4">
    <v-icon size="18" color="amber-darken-2">mdi-lightbulb-on-outline</v-icon>
    <span class="text-subtitle-2 font-weight-semibold text-grey-darken-2">Lessons Learned</span>
    <span class="text-caption text-grey ml-1">— observations and recommendations for future projects</span>
  </div>
  <!-- Lessons Learned card (existing content) -->
</v-window-item>
```

**Key changes vs current layout:**
- Remove the asymmetric `v-row` (7/5 col split)
- Section A: Risk + Escalation in equal 6/6 columns (not Risk alone in left col)
- Section B: Status Updates + Readiness Docs + Signatories as 3 equal cards in one row (instead of collapsed expansion panel)
- Section C: Data Banking card promoted to standalone section with section header
- Section D: Lessons Learned promoted with section header (not appended after Data Banking)
- Each section has a subtitle-2 header + description text
- Same implementation in both edit-[id].vue and new.vue

**Acceptance:**
- [ ] 4 clearly labelled sections with subtitle-2 headers
- [ ] Section A: Risk Register and Escalation Records side-by-side (equal width)
- [ ] Section B: Status Updates, Readiness Docs, Signatories in equal 3-column grid
- [ ] Section C: Data Banking card full-width with section header
- [ ] Section D: Lessons Learned card full-width with section header
- [ ] Same layout in edit-[id].vue and new.vue
- [ ] All existing CRUD functionality preserved (add/remove rows unchanged)
- [ ] No TypeScript errors

---

### CCC-C: Timelog MOV Integration
**Files:** `pmo-frontend/components/coi/CiTimelogsContainer.vue`, `pmo-backend/src/construction-projects/construction-projects.service.ts`
**Research:** R-058

Allows WAR/MPR timelogs to auto-file MOV documents into the correct Supporting Documents repository (`SD_ECO_009` for WAR, `SD_ECO_010` for MPR). No new migrations or endpoints.

**Step 1 — Backend fix (1 line):** The documents service hardcodes `documentType = 'link'` for external links. Fix to use the provided `documentType` or fall back to `'link'`:

Find the external link creation in `construction-projects.service.ts` — look for where the document record is created for external links and change `documentType: 'link'` to use `dto.documentType || 'link'`. This allows the frontend to file links under `SD_ECO_009`/`SD_ECO_010`.

**Step 2 — `blank()` form additions in `CiTimelogsContainer.vue`:**
```typescript
mov_file: null as File | null,
mov_link: '',
mov_link_title: '',
```

**Step 3 — WAR/MPR form template — Section 8/9 "Attachments / Evidence":** Replace the read-only info alert with a live upload+link form:
```html
<!-- Section 8 (WAR) / Section 9 (MPR): MOV Attachments -->
<v-col cols="12">
  <div class="d-flex align-center ga-2 mb-1 mt-2">
    <v-icon size="18" color="grey-darken-1">mdi-paperclip</v-icon>
    <span class="text-subtitle-2 font-weight-semibold">Supporting Evidence (MOV)</span>
  </div>
  <p class="text-body-2 text-grey-darken-1 mb-2">
    Attach or link the {{ form.entry_type === 'MONTHLY' ? 'Monthly Progress Report' : 'Weekly Accomplishment Report' }}
    document. Will be filed in <strong>Supporting Documents → Reports & Monitoring →
    {{ form.entry_type === 'MONTHLY' ? 'Monthly Progress Report' : 'Weekly Accomplishment Report' }}</strong>.
  </p>
  <!-- File upload -->
  <v-file-input
    v-model="movFileRef"
    label="Upload MOV Document"
    prepend-icon="mdi-file-upload-outline"
    density="compact" variant="outlined" hide-details="auto"
    accept=".pdf,.doc,.docx,.jpg,.png"
    class="mb-2"
    @update:model-value="(f: File | File[] | null) => form.mov_file = Array.isArray(f) ? f[0] : f"
  />
  <!-- OR external link -->
  <v-row dense align="center">
    <v-col cols="12" sm="8">
      <v-text-field
        v-model="form.mov_link"
        label="Or paste a document link (Google Drive, SharePoint…)"
        prepend-icon="mdi-link-variant"
        density="compact" variant="outlined" hide-details="auto"
        placeholder="https://..."
      />
    </v-col>
    <v-col cols="12" sm="4">
      <v-text-field
        v-model="form.mov_link_title"
        label="Link title"
        density="compact" variant="outlined" hide-details="auto"
      />
    </v-col>
  </v-row>
  <div v-if="form.mov_file || form.mov_link" class="text-caption text-success mt-1 d-flex align-center ga-1">
    <v-icon size="14">mdi-check-circle-outline</v-icon>
    MOV will be filed automatically on submit
  </div>
</v-col>
```

**Step 4 — `save()` function: file MOV after timelog save succeeds:**
```typescript
// After successful timelog create/update:
const typeCode = form.value.entry_type === 'MONTHLY' ? 'SD_ECO_010' : 'SD_ECO_009'
const sourceRef = form.value.entry_type === 'MONTHLY'
  ? `MPR — ${form.value.mpr_number || form.value.title}`
  : `WAR — ${form.value.war_number || form.value.title}`
const sourceDesc = `Submitted from ${form.value.entry_type === 'MONTHLY' ? 'MPR' : 'WAR'} timelog: ${sourceRef}`

if (form.value.mov_file) {
  const fd = new FormData()
  fd.append('file', form.value.mov_file)
  fd.append('documentType', typeCode)
  fd.append('description', sourceDesc)
  await api.upload(`/api/construction-projects/${props.projectId}/documents`, fd)
}
if (form.value.mov_link) {
  await api.post(`/api/construction-projects/${props.projectId}/documents`, {
    documentType: typeCode,
    externalLink: form.value.mov_link,
    title: form.value.mov_link_title || sourceRef,
    description: sourceDesc,
  })
}
// Reset MOV fields after save
form.value.mov_file = null
form.value.mov_link = ''
form.value.mov_link_title = ''
```

**Step 5 — Backend 1-line fix:** In the documents endpoint handler, find where external links are saved with `documentType = 'link'` hardcoded and change to use the request body's `documentType` value.

**Note:** `mov_file` and `mov_link` are NOT stored on the timelog entry — they are transient form fields used only to trigger the document upload. They don't need to be sent in the timelog payload.

**Acceptance:**
- [ ] WAR form Section 8 has file upload + link fields for MOV
- [ ] MPR form Section 9 has file upload + link fields for MOV
- [ ] On save, MOV file is uploaded to SD_ECO_009 (WAR) or SD_ECO_010 (MPR) repository
- [ ] On save, MOV link is filed in the correct repository
- [ ] Document description includes source reference ("Submitted from WAR timelog — WAR-2026-003")
- [ ] Files appear in Supporting Documents → Reports & Monitoring immediately after timelog save
- [ ] Backend respects `documentType` from link request body (not hardcoded 'link')
- [ ] No new migrations or endpoints required
- [ ] If no MOV attached, timelog saves normally (MOV is optional)

---

### CCC Verification Checklist
- [ ] CCC-A: "Cost This Period" shows ₱100,000 matching the actual Progress Report value
- [ ] CCC-A: Source date appears below the cost amount
- [ ] CCC-A: latestProgressReportDate now resolves from MikroORM `reportDate` (Date object)
- [ ] CCC-B: Others tab has 4 labelled sections in both edit and new pages
- [ ] CCC-B: Section A — Risk Register + Escalation Records equal 6/6 columns
- [ ] CCC-B: Section B — Status Updates + Readiness + Signatories as 3-column grid
- [ ] CCC-B: Section C — Data Banking with section header
- [ ] CCC-B: Section D — Lessons Learned with section header
- [ ] CCC-C: WAR/MPR forms have MOV file upload + link fields
- [ ] CCC-C: Filing MOV from timelog places document in correct repository
- [ ] CCC-C: Document description references source timelog
- [ ] CCC-C: Backend uses provided documentType for external links (not hardcoded 'link')
- [ ] No vue-tsc errors introduced

---

---

## PHASE DDD — ✅ COMPLETE (Phase 3 implemented 2026-06-04; see history.md)
> **Status:** ✅ Phase 3 complete — vue-tsc 0 new errors. No migrations. Not yet committed.
> **Research:** R-059 through R-062 (research.md)
> **Affected files:** `CiProjectAnalyticsTab.vue`, `detail-[id].vue`, `edit-[id].vue`, `new.vue`, `CiTimelogsContainer.vue`
> **No migrations needed. No backend changes needed.**

---

### DDD-A: Analytics Tab — Visualization Hierarchy + Section Banners
**File:** `pmo-frontend/components/coi/CiProjectAnalyticsTab.vue`
**Research:** R-060

**Step 1 — Compact Cost Utilization:**
Replace the `md="6"` half-width Cost Utilization card (progress bar) with a compact single-row KPI card inside the `Financial Summary` row or as a standalone compact 3-col card:
```html
<!-- Compact Cost Utilization — single ratio, doesn't need half the screen -->
<v-col cols="12" md="4">
  <v-card variant="tonal" color="success" class="pa-3 h-100" rounded="lg">
    <div class="text-caption text-grey">Cost Utilization</div>
    <div class="text-h5 font-weight-bold">{{ budgetUtilPct.toFixed(1) }}%</div>
    <v-progress-linear :model-value="budgetUtilPct" :color="budgetUtilPct > 100 ? 'error' : 'success'" height="6" rounded class="mt-1" />
    <div class="text-caption text-grey mt-1">{{ fmtCurrency(costToDate) }} of {{ fmtCurrency(revisedCost) }}</div>
    <div class="text-caption text-grey-lighten-1 mt-1">Source: Progress Reports + Project Profile</div>
  </v-card>
</v-col>
```

**Step 2 — Expand Cost Incurred Progression to full-width:**
Move `Cost Incurred Progression` to a full-width row (`cols="12"`) with a proper section banner:
```html
<v-col cols="12">
  <v-alert variant="tonal" color="success" density="compact" class="mb-2" icon="mdi-cash-clock">
    <div class="text-subtitle-2 font-weight-semibold">Cost Incurred Progression</div>
    <div class="text-caption">Cumulative cost incurred per reporting period. Displays financial burn rate over the project timeline.</div>
    <v-chip size="x-small" variant="text" class="mt-1" prepend-icon="mdi-database-outline">Source: Progress Reports</v-chip>
  </v-alert>
  <v-card class="pa-3" variant="outlined" rounded="lg">
    ...chart (height="240")...
  </v-card>
</v-col>
```

**Step 3 — Add section banners to Physical Progress Trend and Performance Indicators:**
Physical Progress Trend already has a `div` header — upgrade to `v-alert`:
```html
<v-alert variant="tonal" color="primary" density="compact" class="mb-2" icon="mdi-trending-up">
  <div class="text-subtitle-2 font-weight-semibold">Physical Progress Trend</div>
  <div class="text-caption">Actual vs planned physical accomplishment per reporting period. Shows trajectory and slippage.</div>
  <v-chip size="x-small" variant="text" class="mt-1" prepend-icon="mdi-database-outline">Source: Progress Reports</v-chip>
</v-alert>
```

**Step 4 — Add data source chips to Financial Summary KPI row:**
Under the 6-card row (`Financial Summary`), add a `text-caption text-grey` source line:
```html
<v-col cols="12">
  <div class="text-caption text-grey-darken-1 d-flex align-center ga-1 mt-1 mb-2">
    <v-icon size="12">mdi-database-outline</v-icon>
    Sources: Project Profile (contract amounts) · Progress Reports (cost incurred) · Funding Source
  </div>
</v-col>
```

**Acceptance:**
- [ ] Cost Utilization rendered as compact KPI card (not half-screen progress bar)
- [ ] Cost Incurred Progression full-width with `v-alert` section banner
- [ ] Physical Progress Trend has `v-alert` section banner with data source chip
- [ ] Financial Summary KPI row has data source attribution line
- [ ] All section banners include: title, description, data source reference
- [ ] No TypeScript errors

---

### DDD-B: Others Tab — detail-[id].vue Alignment with Edit/New 4-Section IA
**File:** `pmo-frontend/pages/coi/detail-[id].vue`
**Research:** R-061

Restructure the detail page Others tab to match the CCC-B 4-section order from edit/new pages.

**Required section order (matching edit-[id].vue):**
1. Section A: Project Governance (Risk Register + Escalation Records — expansion panels)
2. Section B: Administrative Management (Status Updates + Readiness Docs + Signatories — expansion panels)
3. Section C: Project Knowledge Bank (Notes Banking 2-col read-only)
4. Section D: Lessons Learned (full-width read-only card)

**Current order in detail-[id].vue (to be changed):**
- Notes Banking (Section A currently) → move to Section C
- Lessons Learned (Section B currently) → move to Section D
- Risk & Escalation (Section C currently) → move to Section A
- Administrative Records (Section D currently) → move to Section B

**Implementation:**
Move the Notes Banking card and Lessons Learned card to AFTER the governance and admin expansion panels. Add guidance banners to each section:

```html
<!-- SECTION A: Project Governance -->
<div class="d-flex align-center ga-2 mb-1 mt-2">
  <v-icon size="18" color="error">mdi-shield-alert-outline</v-icon>
  <span class="text-subtitle-2 font-weight-semibold text-grey-darken-2">Project Governance</span>
</div>
<p class="text-body-2 text-grey-darken-1 mb-3">Track project risks, escalations, and governance-related concerns.</p>
<v-expansion-panels variant="accordion" multiple class="mb-4">
  <!-- Risk Register -->
  <!-- Escalation Records -->
</v-expansion-panels>

<!-- SECTION B: Administrative Management -->
<div class="d-flex align-center ga-2 mb-1 mt-2">
  <v-icon size="18" color="info">mdi-folder-text-outline</v-icon>
  <span class="text-subtitle-2 font-weight-semibold text-grey-darken-2">Administrative Management</span>
</div>
<p class="text-body-2 text-grey-darken-1 mb-3">Manage project administrative and readiness documentation.</p>
<v-expansion-panels variant="accordion" multiple class="mb-4">
  <!-- Status Updates -->
  <!-- Readiness Documents -->
  <!-- Signatories -->
</v-expansion-panels>

<!-- SECTION C: Project Knowledge Bank -->
<div class="d-flex align-center ga-2 mb-1 mt-2">
  <v-icon size="18" color="primary">mdi-database-outline</v-icon>
  <span class="text-subtitle-2 font-weight-semibold text-grey-darken-2">Project Knowledge Bank</span>
</div>
<p class="text-body-2 text-grey-darken-1 mb-3">Capture institutional knowledge, references, and project context.</p>
<!-- Notes Banking card (unchanged) -->

<!-- SECTION D: Lessons Learned -->
<div class="d-flex align-center ga-2 mb-1 mt-4">
  <v-icon size="18" color="amber-darken-2">mdi-lightbulb-on-outline</v-icon>
  <span class="text-subtitle-2 font-weight-semibold text-grey-darken-2">Lessons Learned</span>
</div>
<p class="text-body-2 text-grey-darken-1 mb-3">Document experiences and recommendations for future projects.</p>
<!-- Lessons Learned card (unchanged) -->
```

**Also add guidance banners to edit-[id].vue and new.vue section headers** (both currently have section headers but no descriptive text). Add a `text-body-2 text-grey-darken-1 mb-3` description paragraph under each section header `div`.

**Acceptance:**
- [ ] detail-[id].vue Others tab: Section A = Project Governance (Risk + Escalation)
- [ ] detail-[id].vue: Section B = Administrative Management (Status/Readiness/Signatories)
- [ ] detail-[id].vue: Section C = Project Knowledge Bank (Notes Banking)
- [ ] detail-[id].vue: Section D = Lessons Learned
- [ ] Guidance description text added under all section headers in detail/edit/new
- [ ] Section order identical across detail, edit, new pages
- [ ] No TypeScript errors

---

### DDD-C: Timelog MOV Section — Layout Refinement
**File:** `pmo-frontend/components/coi/CiTimelogsContainer.vue`
**Research:** R-062

Refactor the MOV section from the ad-hoc layout to the planned Row 1 / Row 2 / Row 3 structure.

**Step 1 — Replace plain `div` header with `v-alert` banner:**
```html
<v-col cols="12">
  <v-alert type="info" variant="tonal" density="compact" class="mb-3" icon="mdi-paperclip">
    <div class="text-subtitle-2 font-weight-semibold">Supporting Evidence &amp; Means of Verification (MOV)</div>
    <div class="text-caption mt-1">
      Upload supporting evidence, photos, reports, links, and documentation related to this accomplishment report.
      Files will be automatically filed to
      <strong>Supporting Documents → Reports &amp; Monitoring → {{ form.entry_type === 'MONTHLY' ? 'Monthly Progress Report' : 'Weekly Accomplishment Report' }}</strong>.
    </div>
  </v-alert>
</v-col>
```

**Step 2 — Row 1: Upload + Link side-by-side:**
```html
<!-- Row 1: Upload + Link -->
<v-col cols="12" sm="6">
  <v-file-input
    :model-value="form.mov_file ? [form.mov_file] : []"
    label="Upload MOV Document"
    prepend-icon="mdi-file-upload-outline"
    density="compact" variant="outlined" hide-details="auto"
    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
    @update:model-value="(f: File | File[] | null | undefined) => form.mov_file = (Array.isArray(f) ? f[0] : f) ?? null"
  />
</v-col>
<v-col cols="12" sm="6">
  <v-text-field
    v-model="form.mov_link"
    label="Or paste a document link (Google Drive, SharePoint…)"
    prepend-inner-icon="mdi-link-variant"
    density="compact" variant="outlined" hide-details="auto"
    placeholder="https://..."
    clearable
  />
</v-col>
<v-col v-if="form.mov_link" cols="12" sm="6" class="sm:ml-auto">
  <v-text-field
    v-model="form.mov_link_title"
    label="Link title"
    density="compact" variant="outlined" hide-details="auto"
  />
</v-col>
```

**Step 3 — Row 2: Status feedback:**
```html
<v-col v-if="form.mov_file || form.mov_link" cols="12">
  <v-alert type="success" variant="tonal" density="compact" icon="mdi-check-circle-outline" class="text-caption">
    <span v-if="form.mov_file">File <strong>{{ form.mov_file.name }}</strong> ready to upload.</span>
    <span v-if="form.mov_link">Link ready to file.</span>
    Will be automatically filed to the repository on submit.
  </v-alert>
</v-col>
```

**Step 4 — Row 3: Repository Reference Summary:**
```html
<v-col cols="12">
  <v-card variant="tonal" color="blue-grey" class="pa-3" rounded="lg">
    <div class="d-flex align-center ga-2">
      <v-icon size="16" color="blue-grey">mdi-folder-open-outline</v-icon>
      <span class="text-caption font-weight-medium">Repository destination:</span>
      <v-chip size="x-small" variant="outlined">
        Supporting Documents → Reports &amp; Monitoring → {{ form.entry_type === 'MONTHLY' ? 'Monthly Progress Report (SD_ECO_010)' : 'Weekly Accomplishment Report (SD_ECO_009)' }}
      </v-chip>
    </div>
  </v-card>
</v-col>
```

**Acceptance:**
- [ ] MOV section has `v-alert` section banner with purpose description
- [ ] Upload and link fields rendered side-by-side in Row 1 (sm=6 each)
- [ ] Row 2 shows selected file name / link confirmation
- [ ] Row 3 shows repository destination chip
- [ ] WAR and MPR show correct repository names
- [ ] Layout consistent across WAR and MPR forms
- [ ] No TypeScript errors

---

### DDD Verification Checklist
- [ ] DDD-A: Cost Utilization rendered as compact KPI (not half-screen bar)
- [ ] DDD-A: Cost Incurred Progression is full-width with banner
- [ ] DDD-A: Physical Progress Trend has `v-alert` banner with data source
- [ ] DDD-A: Financial Summary row has data source attribution
- [ ] DDD-B: detail-[id].vue Others tab: Section A = Project Governance
- [ ] DDD-B: Section order identical across detail/edit/new pages
- [ ] DDD-B: Guidance description text added under section headers in all 3 pages
- [ ] DDD-C: MOV section has `v-alert` banner
- [ ] DDD-C: Upload + link side-by-side in Row 1
- [ ] DDD-C: Row 2 shows file/link confirmation
- [ ] DDD-C: Row 3 shows repository destination
- [ ] No vue-tsc errors

---

---

## PHASE EEE — ✅ COMPLETE (Phase 3 implemented 2026-06-04; see history.md)
> **Status:** ✅ Phase 3 complete — vue-tsc + tsc 0 new errors. 1 backend fix. No migrations. Not yet committed.
> **Research:** R-063 through R-066 (research.md)
> **Affected files:** `CiProjectAnalyticsTab.vue`, `construction-projects.service.ts`, `edit-[id].vue`, `new.vue`
> **Backend change:** 1 line (KY-B1 filter); no migrations

---

### EEE-A: Document Compliance Scorecard Visualization
**File:** `pmo-frontend/components/coi/CiProjectAnalyticsTab.vue`
**Research:** R-064

Replace the single status donut with a group-level compliance scorecard. No backend change — groups data from the existing checklist response on the frontend.

**Step 1 — Add `complianceScorecard` computed:**
```typescript
const complianceScorecard = computed(() => {
  if (!checklist.value.length) return []
  const groups = new Map<string, { label: string; total: number; approved: number; hasAny: boolean }>()
  for (const item of checklist.value) {
    const code = (item as any).documentType?.groupCode || 'OTHER'
    const label = (item as any).documentType?.groupLabel || code
    const entry = groups.get(code) || { label, total: 0, approved: 0, hasAny: false }
    entry.total++
    entry.hasAny = true
    if ((item.submissionStatus || (item as any).submission_status) === 'APPROVED') entry.approved++
    groups.set(code, entry)
  }
  return Array.from(groups.values()).map(g => ({
    ...g,
    pct: g.total > 0 ? Math.round((g.approved / g.total) * 100) : 0,
    color: g.approved === g.total ? 'success' : g.approved === 0 ? 'error' : 'warning',
  }))
})
const overallCompliancePct = computed(() => {
  if (!checklist.value.length) return 0
  const approved = checklist.value.filter(i => (i.submissionStatus || (i as any).submission_status) === 'APPROVED').length
  return Math.round((approved / checklist.value.length) * 100)
})
```

**Step 2 — Replace compliance donut in template with scorecard:**
```html
<!-- EEE-A: Compliance Scorecard (replaces single donut) -->
<v-col cols="12" md="6">
  <v-card class="pa-3 mb-3" variant="outlined" rounded="lg">
    <!-- Summary row -->
    <div class="d-flex align-center justify-space-between mb-3">
      <span class="text-subtitle-2 font-weight-semibold">Document Compliance</span>
      <v-chip :color="overallCompliancePct === 100 ? 'success' : overallCompliancePct > 50 ? 'warning' : 'error'" size="small" variant="tonal">
        {{ overallCompliancePct }}% Overall
      </v-chip>
    </div>
    <!-- Loading / empty -->
    <div v-if="checklistLoading" class="text-center py-4"><v-progress-circular indeterminate size="20" /></div>
    <div v-else-if="!hasChecklistData" class="text-center py-4 text-grey text-body-2">No checklist data</div>
    <!-- Group-level scorecard -->
    <template v-else>
      <div v-for="g in complianceScorecard" :key="g.label" class="mb-3">
        <div class="d-flex justify-space-between align-center mb-1">
          <span class="text-body-2 text-grey-darken-2">{{ g.label }}</span>
          <v-chip size="x-small" :color="g.color" variant="tonal">{{ g.approved }}/{{ g.total }}</v-chip>
        </div>
        <v-progress-linear :model-value="g.pct" :color="g.color" height="8" rounded />
      </div>
    </template>
  </v-card>
</v-col>
```

**Commit message:** `feat(coi): replace compliance donut with group-level compliance scorecard`

**Acceptance:**
- [ ] Each document group shows name, approved/total count, and progress bar
- [ ] Color-coded: green=100%, warning=partial, error=0%
- [ ] Overall compliance % chip at top
- [ ] Loading + no-data states preserved
- [ ] No TypeScript errors

---

### EEE-B: Fix Risk Register Clear Bug (Backend KY-B1)
**File:** `pmo-backend/src/construction-projects/construction-projects.service.ts`
**Research:** R-065

The KY-B1 filter at line 913-918 prevents empty arrays from clearing Others-tab JSONB fields. Remove the exclusion for the explicit Others-tab fields so they can be cleared to `[]`.

**Current code (line 913-918):**
```typescript
const fields = Object.keys(dto).filter(
  (k) =>
    dto[k] !== undefined &&
    !(Array.isArray(dto[k]) && (dto[k] as any[]).length === 0) &&
    k !== 'assigned_user_ids' &&
    k !== 'assignments',
)
```

**Fix:** Allow empty arrays specifically for the Others-tab JSONB clearable fields:
```typescript
// Fields that can legitimately be set to [] to clear all entries
const clearableArrayFields = new Set([
  'status_updates', 'readiness_documents', 'signatories',
  'risk_register', 'escalation_records',
])

const fields = Object.keys(dto).filter(
  (k) =>
    dto[k] !== undefined &&
    (clearableArrayFields.has(k) || !(Array.isArray(dto[k]) && (dto[k] as any[]).length === 0)) &&
    k !== 'assigned_user_ids' &&
    k !== 'assignments',
)
```

This allows `risk_register: []` to clear all risk entries while preserving the KY-B1 protection for other fields that can suffer from `[[]]` double-wrapping.

**Commit message:** `fix(coi): allow Others tab arrays to be cleared via empty array patch`

**Acceptance:**
- [ ] Saving with `risk_register: []` clears existing risk register entries from DB
- [ ] Same applies to `escalation_records`, `status_updates`, `readiness_documents`, `signatories`
- [ ] Backend typecheck (`tsc --noEmit`) passes
- [ ] KY-B1 double-wrapping protection preserved for other JSONB fields

---

### EEE-C: Readiness Documents — Field Layout Fix
**Files:** `pmo-frontend/pages/coi/edit-[id].vue`, `pmo-frontend/pages/coi/new.vue`
**Research:** R-066

The current Readiness Documents layout per entry is:
- Row 1: Type (full width)
- Row 2: Status (col-9) | delete (col-3)
- Row 3: Remarks (full width)

The status dropdown at `col-9` is oversized. Fix to balanced layout:

```html
<!-- EEE-C: Fixed Readiness Documents row layout -->
<div v-for="(row, i) in readinessDocRows" :key="'rd'+i" class="mb-2 pa-2 rounded bg-grey-lighten-5">
  <v-row dense align="center">
    <v-col cols="12" sm="5"><v-text-field v-model="row.type" label="Document Type" variant="outlined" density="compact" hide-details /></v-col>
    <v-col cols="8" sm="4"><v-select v-model="row.status" label="Status" :items="['SUBMITTED','PENDING','APPROVED','MISSING']" variant="outlined" density="compact" hide-details /></v-col>
    <v-col cols="4" sm="3" class="d-flex justify-end"><v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="removeReadinessDoc(i)" /></v-col>
  </v-row>
  <v-text-field v-model="row.remarks" label="Remarks (optional)" variant="outlined" density="compact" class="mt-1" hide-details />
</div>
```

Apply to BOTH `edit-[id].vue` Section B (Administrative Management) AND `new.vue` Section B.

**Commit message:** `fix(coi): correct readiness documents field sizing and alignment`

**Acceptance:**
- [ ] Type field and Status field are balanced (not 100% / 90% width)
- [ ] Delete button visually grouped with Status field
- [ ] Same layout in edit and new pages
- [ ] No TypeScript errors

---

### EEE-D: Git Governance — Commit Message Standard
**Files:** None (process documentation)
**Research:** N/A

Going forward, all commits must use descriptive semantic messages per Conventional Commits spec:

| Format | Use for |
|---|---|
| `feat(coi): <description>` | New features |
| `fix(coi): <description>` | Bug fixes |
| `refactor(coi): <description>` | Code restructure without behavior change |
| `style(coi): <description>` | UI/CSS only changes |
| `chore: <description>` | Build, deps, docs |

**Avoid:** Phase-code-only names like "feat: COI Phase AAA" — these are meaningless in git history.
**Use instead:** `feat(coi): add physical progress trend chart and compact cost utilization KPI`

This is a process rule, not a code change. No implementation needed. Record in `docs/state.md` as a standing constraint.

**Acceptance:**
- [ ] All future commits use descriptive messages
- [ ] Phase codes may appear in parentheses as additional context but not as the primary description
- [ ] Recorded in state.md architecture constraints

---

### EEE Verification Checklist
- [ ] EEE-A: Compliance scorecard shows group-level bars (not a single status donut)
- [ ] EEE-A: Overall compliance % chip visible
- [ ] EEE-A: Color coding: green=100%, warning=partial, error=0%
- [ ] EEE-B: Saving with all risk register rows deleted actually clears the DB
- [ ] EEE-B: Same for escalation_records, status_updates, readiness_documents, signatories
- [ ] EEE-C: Readiness docs Type/Status/Delete fields balanced in same row
- [ ] EEE-C: Same layout in both edit and new pages
- [ ] EEE-D: Future commits use descriptive semantic messages
- [ ] No vue-tsc or tsc errors

---

---

## PHASE FFF — ADMINISTRATIVE MANAGEMENT PERSISTENCE + COMPLIANCE RESTORE + DETAIL PAGE GAPS
> **Status:** ⬜ PENDING Phase 3 Authorization
> **Research:** R-067, R-068, R-069 (research.md)
> **Affected files:** `new.vue`, `construction-projects.service.ts`, `detail-[id].vue`, `CiProjectAnalyticsTab.vue`
> **Backend:** 1 INSERT SQL update (add Others-tab JSONB columns). No new migrations.

---

### FFF-A: Fix `readiness_docs` Typo in new.vue
**File:** `pmo-frontend/pages/coi/new.vue` line 503
**Research:** R-067 Root Cause 1

Single-character fix — rename field to match backend DTO:
```typescript
// Change:
readiness_docs: readinessDocRows.value.length > 0 ? readinessDocRows.value : undefined,
// To:
readiness_documents: readinessDocRows.value.length > 0 ? readinessDocRows.value : undefined,
```

**Commit:** `fix(coi): correct readiness_documents field name in new project payload`

**Acceptance:**
- [ ] Creating a project with readiness document rows no longer returns 400
- [ ] Readiness documents saved on project creation

---

### FFF-B: Add Others-Tab Fields to CREATE SQL
**File:** `pmo-backend/src/construction-projects/construction-projects.service.ts`
**Research:** R-067 Root Cause 2

Add the five JSONB columns to the INSERT statement so data submitted during project creation is persisted immediately.

**Step 1 — Add column names to the INSERT list** (after `remarks_log, personnel_groups`):
```sql
status_updates, readiness_documents, signatories, risk_register, escalation_records
```

**Step 2 — Add five corresponding `?` placeholders** (after the existing last `?` for `personnel_groups`):
```
?, ?, ?, ?, ?
```

**Step 3 — Add five corresponding values** (after `dto.personnel_groups ? JSON.stringify(dto.personnel_groups) : null`):
```typescript
dto.status_updates ? JSON.stringify(dto.status_updates) : '[]',
dto.readiness_documents ? JSON.stringify(dto.readiness_documents) : '[]',
dto.signatories ? JSON.stringify(dto.signatories) : '[]',
dto.risk_register ? JSON.stringify(dto.risk_register) : '[]',
dto.escalation_records ? JSON.stringify(dto.escalation_records) : '[]',
```

**Commit:** `fix(coi): persist Others tab JSONB fields on project creation`

**Acceptance:**
- [ ] `status_updates`, `readiness_documents`, `signatories`, `risk_register`, `escalation_records` persisted at project creation
- [ ] `tsc --noEmit` passes
- [ ] No schema migration needed (columns already exist)

---

### FFF-C: Add Administrative Management to detail-[id].vue Others Tab
**File:** `pmo-frontend/pages/coi/detail-[id].vue`
**Research:** R-069

Insert Section B (Administrative Management — read-only expansion panels) between the `<v-window-item value="others">` open tag and Section C (Project Knowledge Bank). This mirrors the data already stored but not displayed.

Insert immediately after `<v-window-item value="others">` (before the blank lines at lines 2033-2034):

```html
<!-- FFF-C: Section B — Administrative Management (read-only) -->
<div class="d-flex align-center ga-2 mb-1">
  <v-icon size="18" color="info">mdi-folder-text-outline</v-icon>
  <span class="text-subtitle-2 font-weight-semibold text-grey-darken-2">Administrative Management</span>
</div>
<p class="text-body-2 text-grey-darken-1 mb-3">Administrative and readiness documentation for this project.</p>
<template v-if="project?.statusUpdates?.length || project?.readinessDocuments?.length || project?.signatories?.length">
  <v-expansion-panels variant="accordion" multiple class="mb-4">
    <v-expansion-panel v-if="project?.statusUpdates?.length">
      <v-expansion-panel-title>
        <v-icon start size="small" icon="mdi-update" />
        Status Updates
        <v-chip size="x-small" variant="tonal" color="info" class="ml-2">{{ project.statusUpdates.length }}</v-chip>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-timeline density="compact" align="start">
          <v-timeline-item v-for="(r, i) in project.statusUpdates" :key="i" dot-color="info" size="small">
            <div class="text-caption text-grey">{{ (r as any).date ? formatDate((r as any).date) : '—' }}</div>
            <div class="text-body-2">{{ (r as any).text }}</div>
          </v-timeline-item>
        </v-timeline>
      </v-expansion-panel-text>
    </v-expansion-panel>
    <v-expansion-panel v-if="project?.readinessDocuments?.length">
      <v-expansion-panel-title>
        <v-icon start size="small" icon="mdi-file-check-outline" />
        Readiness Documents
        <v-chip size="x-small" variant="tonal" color="success" class="ml-2">{{ project.readinessDocuments.length }}</v-chip>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-table density="compact">
          <thead><tr><th>Type</th><th>Status</th><th>Remarks</th></tr></thead>
          <tbody>
            <tr v-for="(r, i) in project.readinessDocuments" :key="i">
              <td>{{ (r as any).type }}</td>
              <td><v-chip size="x-small" variant="tonal">{{ (r as any).status }}</v-chip></td>
              <td class="text-caption">{{ (r as any).remarks || '—' }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-expansion-panel-text>
    </v-expansion-panel>
    <v-expansion-panel v-if="project?.signatories?.length">
      <v-expansion-panel-title>
        <v-icon start size="small" icon="mdi-pen" />
        Signatories
        <v-chip size="x-small" variant="tonal" color="purple" class="ml-2">{{ project.signatories.length }}</v-chip>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-list density="compact">
          <v-list-item v-for="(r, i) in project.signatories" :key="i">
            <v-list-item-title>{{ (r as any).name }}</v-list-item-title>
            <v-list-item-subtitle class="text-caption">{{ (r as any).position }}<span v-if="(r as any).date"> · {{ formatDate((r as any).date) }}</span></v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>
<div v-else class="text-center text-grey text-caption pa-3 mb-4">No administrative records.</div>
```

**Commit:** `fix(coi): restore Administrative Management section in project details Others tab`

**Acceptance:**
- [ ] Status Updates visible in detail page Others tab when data exists
- [ ] Readiness Documents visible with type/status/remarks columns
- [ ] Signatories visible with name/position/date
- [ ] "No administrative records." shown when all three are empty
- [ ] Section order: Admin Mgmt → Knowledge Bank → Lessons Learned
- [ ] No TypeScript errors

---

### FFF-D: Restore Compliance Donut + Fix Auto-Refresh
**File:** `pmo-frontend/components/coi/CiProjectAnalyticsTab.vue`
**Research:** R-068

**Step 1 — Restore the compliance donut chart computed (removed in EEE-A):**
```typescript
// FFF-D: Compliance donut — status breakdown (NOT_SUBMITTED / SUBMITTED / APPROVED / REJECTED)
const STATUS_ORDER = ['NOT_SUBMITTED', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] as const
const STATUS_COLORS: Record<string, string> = {
  NOT_SUBMITTED: '#9E9E9E', SUBMITTED: '#1976D2', UNDER_REVIEW: '#FB8C00',
  APPROVED: '#43A047', REJECTED: '#E53935',
}
const complianceDonutChart = computed(() => {
  const counts: Record<string, number> = {}
  for (const item of checklist.value) {
    const s = (item as any).submissionStatus || (item as any).submission_status || 'NOT_SUBMITTED'
    counts[s] = (counts[s] || 0) + 1
  }
  const present = STATUS_ORDER.filter(s => counts[s])
  return {
    approvedCount: counts['APPROVED'] || 0,
    total: checklist.value.length,
    series: present.map(s => counts[s]),
    options: {
      chart: { type: 'donut' as const },
      labels: present.map(s => s.replace(/_/g, ' ')),
      colors: present.map(s => STATUS_COLORS[s] || '#9E9E9E'),
      legend: { position: 'bottom' as const },
      dataLabels: { enabled: true },
    },
  }
})
```

**Step 2 — Layout: Scorecard (Left, `md="6"`) + Donut (Right, `md="6"`):**
Replace the current single `md="6"` scorecard with a two-column layout:
```html
<!-- Scorecard (existing EEE-A, now left) -->
<v-col cols="12" md="6">
  <!-- ...existing scorecard markup... -->
</v-col>
<!-- FFF-D: Restored donut (right) -->
<v-col cols="12" md="6">
  <v-card class="pa-3 mb-3" variant="outlined" rounded="lg">
    <div class="text-subtitle-2 font-weight-semibold mb-2">Submission Status Breakdown</div>
    <div v-if="checklistLoading".../>
    <div v-else-if="!hasChecklistData".../>
    <template v-else>
      <div class="text-caption text-medium-emphasis mb-2 text-center">
        {{ complianceDonutChart.approvedCount }} of {{ complianceDonutChart.total }} documents approved
      </div>
      <VueApexCharts type="donut"
        :series="complianceDonutChart.series"
        :options="complianceDonutChart.options"
        height="260"
      />
    </template>
  </v-card>
</v-col>
```

**Step 3 — Auto-refresh on tab activation:**
The analytics tab is `eager`-mounted. Add a `watch` on `activeTab` (passed as a prop or injected) is not straightforward. The simpler fix is to expose a `refresh()` method and call it on tab switch. However, since `CiProjectAnalyticsTab` doesn't currently receive the active tab, the minimal fix is:
- On `onMounted`: call `fetchChecklist()` ✅ (already done)
- On `onActivated` lifecycle hook: call `fetchChecklist()` again (handles `keep-alive` or `eager` tab re-activation)

```typescript
// FFF-D: Re-fetch checklist when component is re-activated (tab switch)
onActivated(() => { fetchChecklist() })
```

**Commit:** `fix(coi): restore compliance donut and add tab-activation refresh`

**Acceptance:**
- [ ] Left column: Group-level scorecard (EEE-A preserved)
- [ ] Right column: Status donut (NOT_SUBMITTED / SUBMITTED / APPROVED / REJECTED)
- [ ] Approved count shown in donut header
- [ ] `onActivated` triggers checklist re-fetch
- [ ] No TypeScript errors

---

### FFF Verification Checklist
- [ ] FFF-A: Creating project with readiness docs no longer causes 400 error
- [ ] FFF-B: `status_updates`, `readiness_documents`, `signatories`, `risk_register`, `escalation_records` persisted at creation
- [ ] FFF-C: Detail page Others tab shows Administrative Management expansion panels
- [ ] FFF-D: Compliance scorecard (left) + donut (right) both visible
- [ ] FFF-D: `onActivated` refreshes checklist on tab return
- [ ] `tsc --noEmit` (backend) passes
- [ ] `nuxt typecheck` (frontend) passes

---

---

## GIT-PRE-GGG: Commit All Uncommitted Work Before Dashboard Phases
> **Status:** ✅ COMPLETE — committed `fd5877c`, pushed to `pmo-coi`
> **Research:** R-076

Stages and commits all work completed through Phase EEE that was never pushed to `pmo-coi`.

**Step 1 — Stage all modified tracked files + relevant untracked migration/guide files:**
```bash
git add docs/ \
  pmo-backend/src/construction-projects/ \
  pmo-backend/src/database/mikro-migrations/ \
  pmo-frontend/components/coi/ \
  pmo-frontend/layouts/default.vue \
  pmo-frontend/pages/coi/detail-\[id\].vue \
  pmo-frontend/pages/coi/edit-\[id\].vue \
  pmo-frontend/pages/coi/new.vue \
  pmo-frontend/pages/login.vue \
  pmo-frontend/utils/adapters.ts
```

**Step 2 — Commit with descriptive message:**
```bash
git commit -m "feat(coi): WAR/MPR sections, Others IA, analytics charts, compliance scorecard, form parity, new page sync"
```

**Step 3 — Push to remote:**
```bash
git push origin pmo-coi
```

**Acceptance:**
- [ ] `git status` shows clean working tree (no modified tracked files)
- [ ] `git log --oneline -1` shows descriptive commit message (no "Phase AAA" or similar)
- [ ] `git push` succeeds on `pmo-coi` branch
- [ ] GitHub remote reflects latest commit

---

## PHASE GGG — COI Infrastructure Portfolio Dashboard Modernization
> **Status:** ✅ COMPLETE — Phase 3 implemented 2026-06-08. vue-tsc 0 new errors.
> **Research:** R-067, R-068, R-069, R-071, R-073, R-074, R-075, R-076 (research.md)
> **File:** `pmo-frontend/pages/coi/index.vue`
> **Scope:** Refactor COI index into a true Infrastructure Portfolio Dashboard — add Quick Actions, expand KPI row, enhance Analytics tab, add Executive Monitoring panel, wire interactive chart drill-down. NO new backend endpoints. Zero API-breaking changes. All existing list/filter/CRUD functionality preserved.
> **Commit style:** `feat(coi): <description>` per EEE-D standard

---

### GGG-A: Portfolio Summary — Expand KPI Row to 8 Cards
**File:** `pmo-frontend/pages/coi/index.vue`
**Research:** R-067, R-069

Add two missing KPI cards to the existing 6-card row. Current: `Completed | Ongoing | Delayed | Pending Review | Total Budget | Avg Progress`. Target: add `On Hold` (status=ON_HOLD) and `Cost Utilized` (from financialSummary).

**Step 1 — Expand `stats` ref:**
```typescript
const stats = ref({
  total: 0,
  ongoing: 0,
  completed: 0,
  pendingReview: 0,
  totalContractValue: 0,
  avgProgress: 0,
  onHold: 0,         // GGG-A: new
  costUtilized: 0,   // GGG-A: new (= total_obligation from financial summary)
})
```

**Step 2 — Compute `onHold` in `computeStats()`:**
```typescript
stats.value.onHold = projectList.filter(p => (p.status || '').toUpperCase() === 'ON_HOLD').length
```

**Step 3 — Sync `onHold` + `costUtilized` in `syncStatsFromAnalytics()`:**
```typescript
const byStatus = (a.by_status || []) as Array<{ status: string; count: number }>
stats.value.onHold = findCount('ON_HOLD')
stats.value.costUtilized = financialSummary.value?.total_obligation ?? 0
```

**Step 4 — Add 2 new KPI cards to template (after Avg Progress card):**
```html
<v-col cols="6" sm="4" md="2">
  <v-card color="blue-grey" variant="tonal" class="pa-3 d-flex align-center ga-3">
    <v-icon icon="mdi-pause-circle-outline" size="32" />
    <div>
      <p class="text-body-2 font-weight-medium">On Hold</p>
      <p class="text-h4 font-weight-bold">{{ stats.onHold }}</p>
    </div>
  </v-card>
</v-col>
<v-col cols="6" sm="4" md="2">
  <v-card color="green-darken-1" variant="tonal" class="pa-3 d-flex align-center ga-3">
    <v-icon icon="mdi-cash-check" size="32" />
    <div>
      <p class="text-body-2 font-weight-medium">Cost Utilized</p>
      <p class="text-h6 font-weight-bold">{{ formatCurrencyShort(stats.costUtilized) }}</p>
    </div>
  </v-card>
</v-col>
```

**Step 5 — Update grid breakpoint on the existing 6-card `v-row`:**
The row currently uses `cols="6" sm="4" md="2"` (6 × md=2 = 12). With 8 cards, the row needs `md="3"` for 4-per-row on desktop.

Change all 8 cards to: `cols="6" sm="4" md="3"` → 4 cards per row on md, 2 per row on sm.

**Step 6 — `statusFilterOptions` already has ON_HOLD; ensure `clearFilters()` doesn't need changes** — already resets `filterStatus` to `''` → no change needed.

**Acceptance:**
- [ ] 8 KPI cards visible: Completed / Ongoing / Delayed / On Hold / Pending Review / Total Budget / Avg Progress / Cost Utilized
- [ ] On Hold count reflects projects with `status === 'ON_HOLD'`
- [ ] Cost Utilized shows `financialSummary.total_obligation` in short currency format
- [ ] Cost Utilized shows 0 before analytics loads (not undefined/NaN)
- [ ] All 8 cards in consistent 4-per-row layout on md+
- [ ] No TypeScript errors

---

### GGG-B: Quick Actions Strip
**File:** `pmo-frontend/pages/coi/index.vue`
**Research:** R-067 (Section 4 — completely absent)

Add a Quick Actions strip above the KPI row. Visible on Projects tab. Actions are RBAC-gated.

**Step 1 — Add Quick Actions strip to template, before the KPI `v-row`:**
```html
<!-- GGG-B: Quick Actions Strip -->
<v-row dense class="mb-3" align="center">
  <v-col cols="12">
    <div class="d-flex flex-wrap ga-2 align-center">
      <span class="text-caption text-grey-darken-1 font-weight-medium text-uppercase mr-1">Quick Actions:</span>
      <v-btn
        v-if="canAdd('coi')"
        color="primary"
        size="small"
        prepend-icon="mdi-plus"
        variant="tonal"
        @click="createProject"
      >
        New Project
      </v-btn>
      <v-btn
        v-if="isAdmin || isSuperAdmin"
        color="warning"
        size="small"
        prepend-icon="mdi-clipboard-clock"
        variant="tonal"
        @click="filterStatus = 'PENDING_REVIEW'; activeTab = 'projects'"
      >
        Review Projects
        <v-badge
          v-if="stats.pendingReview > 0"
          :content="stats.pendingReview"
          color="warning"
          inline
          class="ml-1"
        />
      </v-btn>
      <v-btn
        color="info"
        size="small"
        prepend-icon="mdi-chart-bar"
        variant="tonal"
        @click="activeTab = 'analytics'"
      >
        Portfolio Analytics
      </v-btn>
      <v-btn
        color="teal"
        size="small"
        prepend-icon="mdi-eye"
        variant="tonal"
        :to="'/coi/public'"
        target="_blank"
      >
        Public View
      </v-btn>
    </div>
  </v-col>
</v-row>
```

**Note:** Quick Actions row placed ABOVE the KPI `v-row` but INSIDE the `v-window-item value="projects"` block.

**Acceptance:**
- [ ] Quick Actions strip visible on Projects tab
- [ ] "New Project" button only visible when `canAdd('coi')` is true
- [ ] "Review Projects" button only visible for Admin/SuperAdmin
- [ ] "Review Projects" shows pending count badge when > 0
- [ ] "Review Projects" sets `filterStatus = 'PENDING_REVIEW'` so table/list filters immediately
- [ ] "Portfolio Analytics" switches to analytics tab
- [ ] "Public View" opens COI public page in new tab
- [ ] No TypeScript errors

---

### GGG-C: Executive Monitoring — Upcoming Completions + Budget Variance
**File:** `pmo-frontend/pages/coi/index.vue`
**Research:** R-069, R-071

Extend the existing analytics hero block with two new Executive Monitoring panels computed client-side from `projects.value`.

**Step 1 — Add two computed properties:**
```typescript
// GGG-C: Projects completing within 30 days
const UPCOMING_DAYS = 30
const upcomingCompletions = computed(() => {
  const now = new Date()
  const cutoff = new Date(now.getTime() + UPCOMING_DAYS * 24 * 60 * 60 * 1000)
  return projects.value
    .filter(p => {
      if ((p.status || '').toUpperCase() !== 'ONGOING') return false
      const dateStr = p.revisedCompletionDate || p.endDate
      if (!dateStr) return false
      const d = new Date(dateStr)
      return !Number.isNaN(d.getTime()) && d >= now && d <= cutoff
    })
    .sort((a, b) => {
      const da = new Date(a.revisedCompletionDate || a.endDate || '')
      const db = new Date(b.revisedCompletionDate || b.endDate || '')
      return da.getTime() - db.getTime()
    })
    .slice(0, 5)
})

// GGG-C: Projects with very low progress (< 25%) that are ONGOING — potential slow-movers
const slowMovingProjects = computed(() =>
  projects.value
    .filter(p =>
      (p.status || '').toUpperCase() === 'ONGOING' &&
      (Number(p.physicalAccomplishment) || 0) < 25
    )
    .sort((a, b) => (Number(a.physicalAccomplishment) || 0) - (Number(b.physicalAccomplishment) || 0))
    .slice(0, 5)
)
```

**Step 2 — Add `formatDate()` helper** (if not already present):
```typescript
function formatDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}
```

**Step 3 — Extend the existing 3-column analytics hero row** (Budget Utilization / Campus Bars / Needs Attention) with a 4th row of 2 new panels below it:

```html
<!-- GGG-C: Executive Monitoring row (below existing 3-col hero row) -->
<v-row v-if="!loading && analyticsReady" dense class="mb-3">
  <!-- Upcoming Completions -->
  <v-col cols="12" md="6">
    <v-card variant="outlined" class="h-100 pa-3">
      <div class="d-flex align-center ga-2 mb-2">
        <v-icon icon="mdi-calendar-check-outline" size="small" color="success" />
        <span class="text-caption text-grey-darken-1 font-weight-medium text-uppercase">
          Upcoming Completions <span class="text-caption text-grey">(next {{ UPCOMING_DAYS }} days)</span>
        </span>
      </div>
      <div v-if="!upcomingCompletions.length" class="text-caption text-grey py-2">
        No ongoing projects completing within {{ UPCOMING_DAYS }} days.
      </div>
      <v-list v-else density="compact" class="pa-0">
        <v-list-item
          v-for="p in upcomingCompletions"
          :key="p.id"
          class="px-0 cursor-pointer"
          @click="router.push(`/coi/detail-${p.id}`)"
        >
          <v-list-item-title class="text-caption font-weight-medium text-truncate">{{ p.projectName }}</v-list-item-title>
          <v-list-item-subtitle class="d-flex ga-1 flex-wrap mt-0">
            <v-chip size="x-small" color="success" variant="tonal">
              {{ formatDate(p.revisedCompletionDate || p.endDate || '') }}
            </v-chip>
            <v-chip size="x-small" color="primary" variant="tonal">{{ (Number(p.physicalAccomplishment) || 0).toFixed(1) }}%</v-chip>
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card>
  </v-col>

  <!-- Slow-Moving Projects -->
  <v-col cols="12" md="6">
    <v-card variant="outlined" class="h-100 pa-3">
      <div class="d-flex align-center ga-2 mb-2">
        <v-icon icon="mdi-alert-circle-outline" size="small" color="warning" />
        <span class="text-caption text-grey-darken-1 font-weight-medium text-uppercase">
          Slow-Moving Projects <span class="text-caption text-grey">(&lt;25% ongoing)</span>
        </span>
      </div>
      <div v-if="!slowMovingProjects.length" class="text-caption text-grey py-2">No slow-moving projects detected.</div>
      <v-list v-else density="compact" class="pa-0">
        <v-list-item
          v-for="p in slowMovingProjects"
          :key="p.id"
          class="px-0 cursor-pointer"
          @click="router.push(`/coi/detail-${p.id}`)"
        >
          <v-list-item-title class="text-caption font-weight-medium text-truncate">{{ p.projectName }}</v-list-item-title>
          <v-list-item-subtitle class="d-flex ga-1 flex-wrap mt-0">
            <v-chip size="x-small" color="orange" variant="tonal">{{ (Number(p.physicalAccomplishment) || 0).toFixed(1) }}% progress</v-chip>
            <v-chip size="x-small" color="grey" variant="tonal">{{ p.campus }}</v-chip>
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card>
  </v-col>
</v-row>
```

**Acceptance:**
- [ ] Upcoming Completions panel shows ONGOING projects with `revisedCompletionDate || endDate` within 30 days
- [ ] Upcoming list sorted by date ascending (soonest first)
- [ ] Each item shows project name, target date chip, progress % chip
- [ ] Slow-Moving panel shows ONGOING projects with `physicalAccomplishment < 25%`
- [ ] Slow-Moving list sorted by progress ascending (lowest first)
- [ ] Each item shows name, progress % chip, campus chip
- [ ] Both panels show "No projects..." empty state when empty
- [ ] Clicking any item navigates to `detail-[id]`
- [ ] Row only renders when `!loading && analyticsReady`
- [ ] No TypeScript errors

---

### GGG-D: Analytics Tab — Label Corrections + New Charts
**File:** `pmo-frontend/pages/coi/index.vue`
**Research:** R-068, R-074

Correct misleading labels on the existing Budget Utilization section and add two new chart computeds to the Analytics tab.

**Step 1 — Label corrections (Projects tab hero strip):**
In the Budget Utilization `v-card` (inside `<template v-if="analyticsReady">`):
```html
<!-- BEFORE: -->
<div class="text-caption text-grey-darken-1 font-weight-medium text-uppercase mb-2">Budget Utilization</div>
<!-- ...bars: "Appropriation", "Obligation", "Disbursement" -->

<!-- AFTER: -->
<div class="text-caption text-grey-darken-1 font-weight-medium text-uppercase mb-2">Cost Utilization</div>
<!-- Bar 1: "Total Portfolio Budget" (appropriation bar, always 100%) -->
<!-- Bar 2: "Cost Incurred" (was "Obligation") -->
<!-- Bar 3: REMOVE disbursement bar (identical value to obligation — remove duplicat) -->
```

Revised template for the utilization card:
```html
<v-card variant="outlined" class="h-100 pa-3">
  <div class="text-caption text-grey-darken-1 font-weight-medium text-uppercase mb-2">Cost Utilization</div>
  <div class="mb-2">
    <div class="d-flex justify-space-between text-caption mb-1">
      <span>Portfolio Budget</span><span>{{ formatCurrencyShort(budgetGauge.appropriation) }}</span>
    </div>
    <v-progress-linear :model-value="100" height="8" rounded color="teal" />
  </div>
  <div>
    <div class="d-flex justify-space-between text-caption mb-1">
      <span>Cost Incurred</span><span>{{ budgetGauge.obligationPct.toFixed(1) }}%</span>
    </div>
    <v-progress-linear :model-value="budgetGauge.obligationPct" height="8" rounded color="success" />
  </div>
  <div class="text-caption text-grey mt-2">
    Source: cumulative cost from latest progress reports per project.
  </div>
</v-card>
```

**Step 2 — Label corrections (Analytics tab hero cards):**
```html
<!-- BEFORE -->
<p class="text-caption">Total Obligation</p>
<p class="text-caption">Total Disbursement</p>

<!-- AFTER: collapse to 3 cards (remove duplicate disbursement card) -->
<!-- Card 1: Total Portfolio Budget (was Appropriation) -->
<!-- Card 2: Total Cost Incurred (was Obligation; remove Disbursement — identical) -->
<!-- Card 3: Utilization Rate (unchanged) -->
<!-- Add Card 4: Projects w/ Reports -->
```

Revised 4-card hero row for Analytics tab:
```html
<v-col cols="6" md="3">
  <v-card color="primary" variant="tonal" class="pa-4">
    <p class="text-caption">Portfolio Budget</p>
    <p class="text-h5 font-weight-bold">{{ formatCurrencyShort(financialSummary?.total_appropriation || 0) }}</p>
    <p class="text-caption text-grey">Total contract amount</p>
  </v-card>
</v-col>
<v-col cols="6" md="3">
  <v-card color="success" variant="tonal" class="pa-4">
    <p class="text-caption">Cost Incurred</p>
    <p class="text-h5 font-weight-bold">{{ formatCurrencyShort(financialSummary?.total_obligation || 0) }}</p>
    <p class="text-caption text-grey">From progress reports</p>
  </v-card>
</v-col>
<v-col cols="6" md="3">
  <v-card color="orange" variant="tonal" class="pa-4">
    <p class="text-caption">Utilization Rate</p>
    <p class="text-h5 font-weight-bold">{{ (financialSummary?.utilization_rate || 0).toFixed(1) }}%</p>
    <p class="text-caption text-grey">Cost vs. budget</p>
  </v-card>
</v-col>
<v-col cols="6" md="3">
  <v-card color="info" variant="tonal" class="pa-4">
    <p class="text-caption">Projects with Reports</p>
    <p class="text-h5 font-weight-bold">{{ financialSummary?.projects_with_financials || 0 }}</p>
    <p class="text-caption text-grey">Have progress data</p>
  </v-card>
</v-col>
```

**Step 3 — Add Physical Progress Distribution chart computed:**
```typescript
const progressDistChart = computed(() => {
  const buckets = [
    { label: '0–25%',   min: 0,  max: 25  },
    { label: '25–50%',  min: 25, max: 50  },
    { label: '50–75%',  min: 50, max: 75  },
    { label: '75–100%', min: 75, max: 100 },
  ]
  const counts = buckets.map(b =>
    projects.value.filter(p => {
      const v = Number(p.physicalAccomplishment) || 0
      return v >= b.min && (b.max === 100 ? v <= b.max : v < b.max)
    }).length
  )
  return {
    hasData: counts.some(v => v > 0),
    series: [{ name: 'Projects', data: counts }],
    options: {
      chart: { type: 'bar' as const, toolbar: { show: false } },
      plotOptions: { bar: { borderRadius: 4, columnWidth: '50%', distributed: true } },
      colors: ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e'],
      xaxis: { categories: buckets.map(b => b.label) },
      yaxis: { title: { text: 'Projects' }, labels: { formatter: (v: number) => String(Math.round(v)) } },
      dataLabels: { enabled: true },
      legend: { show: false },
    },
  }
})
```

**Step 4 — Add Funding Source Distribution computed:**
```typescript
const fundingSourceChart = computed(() => {
  const counts: Record<string, number> = {}
  for (const p of projects.value) {
    const src = p.fundSource || 'Unknown'
    counts[src] = (counts[src] || 0) + 1
  }
  const labels = Object.keys(counts)
  const series = Object.values(counts)
  return {
    hasData: labels.length > 0,
    series,
    options: {
      chart: { type: 'donut' as const },
      labels,
      legend: { position: 'bottom' as const },
      dataLabels: { enabled: true, formatter: (_v: number, opts: any) => opts.w.globals.series[opts.seriesIndex] },
      tooltip: { y: { formatter: (v: number, opts: any) => `${opts.w.globals.labels[opts.seriesIndex]}: ${v}` } },
    },
  }
})
```

**Step 5 — Add both charts to Analytics tab template** (after the existing Status Donut + Campus Bar row):
```html
<!-- GGG-D: Physical Progress Distribution + Funding Source Distribution -->
<v-row class="mt-4">
  <v-col cols="12" md="6">
    <v-card class="pa-4">
      <v-card-title class="text-body-1 font-weight-bold mb-1">Physical Progress Distribution</v-card-title>
      <v-card-subtitle class="text-caption text-grey mb-3">Number of projects in each completion range</v-card-subtitle>
      <VueApexCharts
        v-if="progressDistChart.hasData"
        type="bar"
        height="240"
        :options="progressDistChart.options"
        :series="progressDistChart.series"
      />
      <div v-else class="text-center py-8 text-grey">No project data available</div>
    </v-card>
  </v-col>
  <v-col cols="12" md="6">
    <v-card class="pa-4">
      <v-card-title class="text-body-1 font-weight-bold mb-1">Funding Source Distribution</v-card-title>
      <v-card-subtitle class="text-caption text-grey mb-3">Projects grouped by funding source</v-card-subtitle>
      <VueApexCharts
        v-if="fundingSourceChart.hasData"
        type="donut"
        height="240"
        :options="fundingSourceChart.options"
        :series="fundingSourceChart.series"
      />
      <div v-else class="text-center py-8 text-grey">No funding source data available</div>
    </v-card>
  </v-col>
</v-row>
```

**Note:** `progressDistChart` and `fundingSourceChart` compute from `projects.value` — they require `fetchProjects()` to have run. Since `onMounted` already calls `fetchProjects()`, these charts are always populated when analytics tab loads.

**Acceptance:**
- [ ] "Budget Utilization" label changed to "Cost Utilization" in hero strip
- [ ] Hero strip shows 2 bars: "Portfolio Budget" (100%) and "Cost Incurred" (utilization %)
- [ ] Disbursement bar removed (was duplicate of obligation)
- [ ] Analytics tab financial hero shows 4 cards: Portfolio Budget / Cost Incurred / Utilization Rate / Projects with Reports
- [ ] "Total Obligation" and "Total Disbursement" labels removed/replaced
- [ ] Physical Progress Distribution bar chart renders with 4 buckets and color coding
- [ ] Funding Source Distribution donut renders grouped by fund_source field
- [ ] Both new charts show "No data" empty state when projects list is empty
- [ ] No TypeScript errors

---

---

### GGG-E: Interactive Chart Drill-down — Click-to-Filter Navigation
**File:** `pmo-frontend/pages/coi/index.vue`
**Research:** R-075

Clicking any campus or status element on the dashboard navigates to the Projects tab with the matching filter already applied. No backend changes. Uses existing `filterCampus`, `filterStatus`, and `activeTab` refs.

**Step 1 — Add two drill functions (in script setup):**
```typescript
// GGG-E: Drill-down helpers — set filter + navigate to Projects tab
function drillToCampus(campus: string) {
  if (!campus) return
  filterCampus.value = campus.toUpperCase()
  activeTab.value = 'projects'
}
function drillToStatus(status: string) {
  if (!status) return
  filterStatus.value = status.toUpperCase()
  activeTab.value = 'projects'
}
```

**Step 2 — Wire hero strip campus bars (Projects tab):**
The campus bars in the hero strip (`v-for="campus in campusBars"`) are plain `div` + `v-progress-linear` elements. Add click handler + cursor style:
```html
<!-- BEFORE -->
<div v-for="campus in campusBars" :key="campus.campus" class="mb-2">

<!-- AFTER -->
<div v-for="campus in campusBars" :key="campus.campus" class="mb-2 cursor-pointer"
     :title="`Click to filter by ${campus.campus || 'Unknown'}`"
     @click="drillToCampus(campus.campus)">
```

**Step 3 — Wire status pips in hero strip:**
The `statusPips` chips (`v-for="pip in statusPips"`) at the bottom of the hero strip are already clickable (they show count). Add drill-down:
```html
<v-chip v-for="pip in statusPips" :key="pip.status"
  :color="pip.color" size="x-small" variant="tonal"
  class="cursor-pointer"
  :title="`Click to filter ${pip.status} projects`"
  @click="drillToStatus(pip.status)">
  {{ pip.status }}: {{ pip.count }}
</v-chip>
```

**Step 4 — Wire Analytics tab campus bar chart (ApexCharts):**
In `campusChartOptions` computed, add `chart.events.dataPointSelection`:
```typescript
const campusChartOptions = computed(() => ({
  chart: {
    type: 'bar' as const,
    toolbar: { show: false },
    events: {
      dataPointSelection: (_e: any, _ctx: any, config: any) => {
        const campus = (analyticsSummary.value?.by_campus || [])[config.dataPointIndex]?.campus
        if (campus) drillToCampus(campus)
      },
    },
  },
  xaxis: { categories: (analyticsSummary.value?.by_campus || []).map((c: any) => c.campus || 'Unknown') },
  plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
  colors: ['#059669'],
  dataLabels: { enabled: false },
  tooltip: { y: { title: { formatter: () => 'Projects' } } },
}))
```

**Step 5 — Wire Analytics tab status donut chart (ApexCharts):**
In `statusChartOptions` computed, add `chart.events.dataPointSelection`:
```typescript
const statusChartOptions = computed(() => ({
  chart: {
    type: 'donut' as const,
    toolbar: { show: false },
    events: {
      dataPointSelection: (_e: any, _ctx: any, config: any) => {
        const status = (analyticsSummary.value?.by_status || [])[config.dataPointIndex]?.status
        if (status) drillToStatus(status)
      },
    },
  },
  labels: (analyticsSummary.value?.by_status || []).map((s: any) => s.status),
  legend: { position: 'bottom' as const },
  colors: ['#059669', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280'],
}))
```

**Step 6 — Wire GGG-D new charts (Physical Progress Distribution + Funding Source Distribution):**

Physical Progress Distribution — clicking a bucket filters by progress range (approximate — use status filter as available; if no direct filter exists, skip and add tooltip only):
> This chart uses `physicalAccomplishment` ranges, not a filter field. Skip drill-down for this chart. Add `title` tooltip on bars: "N projects with X%–Y% progress" via `dataLabels.formatter`.

Funding Source Distribution — clicking a donut slice filters by fund source. `filterCampus` cannot filter by fund source. **Skip drill-down** (no `filterFundSource` exists). Add `tooltip` only so the label shows count on hover.

**Step 7 — Add visual affordance label** below the hero campus bars and status pips:
```html
<div class="text-caption text-grey mt-2" style="font-size: 10px">
  <v-icon size="10" class="mr-1">mdi-cursor-default-click-outline</v-icon>
  Click a campus or status to filter projects
</div>
```

Place this inside the hero strip card, below the campus bars `v-card` and the status pips row.

**Acceptance:**
- [ ] Clicking a campus bar in hero strip sets `filterCampus` + switches to Projects tab
- [ ] Clicking a status pip chip sets `filterStatus` + switches to Projects tab
- [ ] Clicking a campus bar in Analytics tab chart sets `filterCampus` + switches to Projects tab
- [ ] Clicking a status slice in Analytics tab donut sets `filterStatus` + switches to Projects tab
- [ ] Filter is applied immediately — project list shows filtered results without manual action
- [ ] Visual affordance: "Click to filter projects" caption visible in hero strip
- [ ] Campus bar div has `cursor-pointer` class and `:title` tooltip
- [ ] ApexCharts drill-down does NOT add `filterFundSource` (no such filter field exists) — funding source donut is hover-only
- [ ] Physical Progress Distribution chart is hover-only (no filter field for progress ranges)
- [ ] Existing `clearFilters()` still works (resets both `filterCampus` and `filterStatus`)
- [ ] No TypeScript errors

---

### GGG Verification Checklist
- [ ] GGG-A: 8 KPI stat cards visible (Completed, Ongoing, Delayed, On Hold, Pending Review, Total Budget, Avg Progress, Cost Utilized)
- [ ] GGG-A: On Hold count reflects `status === 'ON_HOLD'` projects
- [ ] GGG-A: Cost Utilized shows financial summary `total_obligation` in short currency format
- [ ] GGG-A: All 8 cards in 4-per-row layout on md+ screens
- [ ] GGG-B: Quick Actions strip visible on Projects tab above KPI row
- [ ] GGG-B: "New Project" button visible only when `canAdd('coi')`
- [ ] GGG-B: "Review Projects" visible for Admin/SuperAdmin with pending count badge
- [ ] GGG-B: "Review Projects" sets `filterStatus = 'PENDING_REVIEW'` when clicked
- [ ] GGG-B: "Portfolio Analytics" switches to analytics tab
- [ ] GGG-C: Upcoming Completions panel shows ONGOING projects completing within 30 days
- [ ] GGG-C: Upcoming Completions sorted soonest first; clicking navigates to detail
- [ ] GGG-C: Slow-Moving Projects panel shows ONGOING with < 25% progress
- [ ] GGG-C: Both panels show empty state when no qualifying projects
- [ ] GGG-D: "Budget Utilization" header changed to "Cost Utilization"
- [ ] GGG-D: Hero strip uses 2 bars ("Portfolio Budget" + "Cost Incurred"); disbursement bar removed
- [ ] GGG-D: Analytics tab financial hero has 4 cards with corrected labels
- [ ] GGG-D: Physical Progress Distribution chart (4 buckets, color-coded bars) visible in Analytics tab
- [ ] GGG-D: Funding Source Distribution donut visible in Analytics tab
- [ ] GGG-E: Clicking campus bar in hero strip filters project list by that campus
- [ ] GGG-E: Clicking status pip chip in hero strip filters project list by that status
- [ ] GGG-E: Clicking campus bar in Analytics tab chart filters + navigates to Projects tab
- [ ] GGG-E: Clicking status slice in Analytics tab donut filters + navigates to Projects tab
- [ ] GGG-E: Visual affordance caption "Click a campus or status to filter projects" visible
- [ ] GGG-E: Funding Source donut and Progress Distribution bar are hover/tooltip-only (no drill-down)
- [ ] All existing list/filter/CRUD functionality unchanged
- [ ] No vue-tsc errors

---

## PHASE HHH — CSU CORE Executive Dashboard Modernization
> **Status:** ✅ COMPLETE — Phase 3 implemented 2026-06-08. vue-tsc 0 new errors.
> **Research:** R-070, R-072, R-073 (research.md)
> **File:** `pmo-frontend/pages/dashboard.vue`, `pmo-frontend/components/AdminKpiRow.vue`
> **Scope:** Refactor CSU CORE dashboard from navigation hub into an Executive Command Center. Replace redundant full-list fetches with analytics endpoint. Add cross-module analytics, executive monitoring, and guidance banners. Contractor-specific view preserved.
> **Commit style:** `feat(core): <description>` per EEE-D standard

---

### HHH-A: University Snapshot — Replace Redundant Fetches with Analytics Endpoint
**Files:** `pmo-frontend/pages/dashboard.vue`, `pmo-frontend/components/AdminKpiRow.vue`
**Research:** R-070, R-072

**Problem:** Both `dashboard.vue` and `AdminKpiRow.vue` call full `/api/construction-projects` list just to get counts. This triggers 2–3 full-list fetches per dashboard load. The `analytics/summary` endpoint provides the same data in a single lightweight call.

**Step 1 — Refactor `AdminKpiRow.vue` to use analytics endpoint:**
Remove `loadProjects()` and `loadPending()` functions. Replace with a single `loadCoiSummary()`:
```typescript
const coiTotal = ref<number | null>(null)
const coiDelayed = ref<number | null>(null)
const coiPendingReview = ref<number | null>(null)
const loadingCoi = ref(true)

async function loadCoiSummary() {
  loadingCoi.value = true
  try {
    const [summary, pubStatus] = await Promise.all([
      api.get<any>('/api/construction-projects/analytics/summary'),
      api.get<any>('/api/construction-projects/analytics/summary'),
    ])
    coiTotal.value = summary.total ?? 0
    coiDelayed.value = summary.delayed_count ?? 0
    // pendingReview from by_publication_status array
    const pub = (summary.by_publication_status || []) as Array<{ publication_status: string; count: number }>
    coiPendingReview.value = pub.find(p => p.publication_status === 'PENDING_REVIEW')?.count ?? 0
  } catch {
    coiTotal.value = 0
    coiDelayed.value = 0
    coiPendingReview.value = 0
  } finally {
    loadingCoi.value = false
  }
}
```

**Step 2 — Refactor tiles computed to use new refs:**
```typescript
const tiles = computed(() => [
  {
    key: 'total',
    label: 'Infrastructure Projects',
    icon: 'mdi-office-building',
    value: coiTotal.value,
    loading: loadingCoi.value,
    suffix: '',
    color: 'primary',
  },
  {
    key: 'delayed',
    label: 'Delayed Projects',
    icon: 'mdi-alert-decagram',
    value: coiDelayed.value,
    loading: loadingCoi.value,
    suffix: '',
    color: 'error',
  },
  {
    key: 'pending',
    label: 'Pending Reviews',
    icon: 'mdi-clipboard-clock-outline',
    value: coiPendingReview.value,
    loading: loadingCoi.value,
    suffix: '',
    color: 'warning',
  },
  {
    key: 'compliance',
    label: 'UO Compliance Rate',
    icon: 'mdi-check-decagram-outline',
    value: quarterlyCompliance.value != null ? quarterlyCompliance.value.toFixed(1) : 'N/A',
    loading: loadingCompliance.value,
    suffix: quarterlyCompliance.value != null ? '%' : '',
    color: 'success',
  },
])
```

**Step 3 — Add `color` prop rendering to tile template:**
```html
<v-card class="pa-4" variant="tonal" :color="tile.color">
```

**Step 4 — Remove `loadProjects()`, `loadPending()`, `totalProjects`, `pendingReviews` refs:**
Clean up dead refs and functions.

**Step 5 — Refactor `dashboard.vue` to remove full-list fetches for COI:**
In `onMounted`, the current code calls `/api/construction-projects` for count. Replace with the analytics summary (same endpoint, already used by AdminKpiRow). Since AdminKpiRow now fetches analytics, `dashboard.vue` should NOT duplicate this call.

Remove `construction` from the `Promise.allSettled` and set `constructionProjects` from a shared source or skip (AdminKpiRow renders the count):
```typescript
// Only fetch what dashboard.vue itself renders (repairs + UO)
const [repairs, uniOps] = await Promise.allSettled([
  api.get<{ data: unknown[] }>('/api/repair-projects'),
  api.get<{ data: unknown[] }>('/api/university-operations'),
])
stats.value = {
  constructionProjects: 0,  // not shown in statCards after HHH-B removes duplicate
  repairProjects: repairs.status === 'fulfilled' ? repairs.value.data?.length || 0 : 0,
  universityOperations: uniOps.status === 'fulfilled' ? uniOps.value.data?.length || 0 : 0,
  gadReports: 0,
}
```

**Acceptance:**
- [ ] AdminKpiRow uses `analytics/summary` instead of full list fetch
- [ ] AdminKpiRow tiles show: Infrastructure Projects (total) / Delayed Projects / Pending Reviews / UO Compliance Rate
- [ ] Tile colors: primary / error / warning / success respectively
- [ ] `dashboard.vue` no longer fetches `/api/construction-projects` for count (AdminKpiRow owns it)
- [ ] Repairs and UO counts still fetch as before
- [ ] No TypeScript errors in either file

---

### HHH-B: Infrastructure Mini-Summary Block + Section Restructure
**File:** `pmo-frontend/pages/dashboard.vue`
**Research:** R-070, R-072

Add a COI mini-analytics block between AdminKpiRow and the UO summary. Also restructure the page to prioritize analytics over navigation links.

**Step 1 — Add `coiFinancial` ref and `loadCoiFinancial()` function:**
```typescript
const coiFinancial = ref<any>(null)
const coiFinancialLoading = ref(false)

async function loadCoiFinancial() {
  coiFinancialLoading.value = true
  try {
    coiFinancial.value = await api.get<any>('/api/construction-projects/analytics/financial-summary')
  } catch {
    coiFinancial.value = null
  } finally {
    coiFinancialLoading.value = false
  }
}
```

Call in `onMounted` (non-contractor only): `if (!isContractor.value) loadCoiFinancial()`

**Step 2 — Add `coiSummary` ref and `loadCoiSummary()` in dashboard.vue:**
```typescript
const coiSummary = ref<any>(null)

async function loadCoiSummary() {
  try {
    coiSummary.value = await api.get<any>('/api/construction-projects/analytics/summary')
  } catch {
    coiSummary.value = null
  }
}
```
Call in `onMounted` (non-contractor only).

**Step 3 — Add Infrastructure Mini-Summary section to template (between AdminKpiRow and module stat cards):**
```html
<!-- HHH-B: Infrastructure Portfolio Mini-Summary -->
<v-card v-if="!isContractor && coiSummary" class="mt-4 pa-4" variant="outlined">
  <div class="d-flex align-center justify-space-between mb-3 flex-wrap ga-2">
    <div class="d-flex align-center ga-2">
      <v-icon icon="mdi-office-building" color="primary" />
      <h2 class="text-h6 font-weight-bold">Infrastructure Portfolio</h2>
    </div>
    <v-btn size="small" variant="outlined" color="primary" to="/coi" prepend-icon="mdi-arrow-right">
      View All
    </v-btn>
  </div>
  <v-row dense>
    <v-col cols="6" sm="3">
      <v-card variant="tonal" color="primary" class="pa-3 text-center">
        <p class="text-caption text-grey-darken-1">Total Projects</p>
        <p class="text-h5 font-weight-bold">{{ coiSummary.total }}</p>
      </v-card>
    </v-col>
    <v-col cols="6" sm="3">
      <v-card variant="tonal" color="success" class="pa-3 text-center">
        <p class="text-caption text-grey-darken-1">Avg Progress</p>
        <p class="text-h5 font-weight-bold">{{ (coiSummary.avg_progress || 0).toFixed(1) }}%</p>
      </v-card>
    </v-col>
    <v-col cols="6" sm="3">
      <v-card variant="tonal" color="teal" class="pa-3 text-center">
        <p class="text-caption text-grey-darken-1">Portfolio Budget</p>
        <p class="text-subtitle-1 font-weight-bold">{{ formatCurrencyShort(coiFinancial?.total_appropriation || 0) }}</p>
      </v-card>
    </v-col>
    <v-col cols="6" sm="3">
      <v-card variant="tonal" :color="(coiSummary.delayed_count || 0) > 0 ? 'error' : 'grey'" class="pa-3 text-center">
        <p class="text-caption text-grey-darken-1">Delayed</p>
        <p class="text-h5 font-weight-bold">{{ coiSummary.delayed_count || 0 }}</p>
      </v-card>
    </v-col>
  </v-row>
  <!-- Cost utilization bar -->
  <div v-if="coiFinancial && coiFinancial.total_appropriation > 0" class="mt-3">
    <div class="d-flex justify-space-between text-caption mb-1">
      <span class="text-grey-darken-1">Cost Utilization</span>
      <span class="font-weight-medium">{{ (coiFinancial.utilization_rate || 0).toFixed(1) }}%</span>
    </div>
    <v-progress-linear :model-value="coiFinancial.utilization_rate || 0" height="8" rounded color="success" />
    <div class="text-caption text-grey mt-1">
      {{ formatCurrencyShort(coiFinancial.total_obligation || 0) }} cost incurred of {{ formatCurrencyShort(coiFinancial.total_appropriation || 0) }} total budget
    </div>
  </div>
</v-card>
```

**Step 4 — Add `formatCurrencyShort()` to `dashboard.vue`:**
```typescript
function formatCurrencyShort(amount: number): string {
  if (amount >= 1_000_000_000) return `₱${(amount / 1_000_000_000).toFixed(1)}B`
  if (amount >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(1)}M`
  return `₱${amount.toLocaleString()}`
}
```

**Step 5 — Remove the duplicate Infrastructure Projects stat card from module stat cards:**
The `statCards` array currently has `Infrastructure Projects` pointing to `/coi`. Since `AdminKpiRow` now shows the COI total prominently, remove the Infrastructure card from `statCards` to avoid duplication:
```typescript
const statCards = computed(() => {
  const all = [
    // Remove Infrastructure Projects — now shown in AdminKpiRow + mini-summary
    { title: 'Repair Projects', icon: 'mdi-tools', color: 'warning', key: 'repairProjects', to: '/repairs' },
    { title: 'University Operations', icon: 'mdi-school', color: 'info', key: 'universityOperations', to: '/university-operations' },
    { title: 'GAD Reports', icon: 'mdi-gender-male-female', color: 'secondary', key: 'gadReports', to: '/gad' },
  ]
  return isContractor.value ? [] : all  // contractors see only COI-specific AdminKpiRow tiles
})
```

**Note on navigation:** The Infrastructure mini-summary cards (Total Projects, Avg Progress, Portfolio Budget, Delayed) should navigate to `/coi` when clicked. This is a one-way navigation — the COI index page manages its own filter state on load. Add `to="/coi"` on the entire mini-summary card, or wrap individual metric cards with `@click="router.push('/coi')"`. The "Delayed" card specifically should navigate to `/coi` (not pre-filter, since COI index loads fresh and delayed items appear in the "Needs Attention" section automatically).

```html
<!-- Each metric card navigable to /coi -->
<v-card variant="tonal" color="primary" class="pa-3 text-center cursor-pointer" @click="router.push('/coi')">
```

**Note:** Contractor view: `AdminKpiRow` is hidden for contractors. The existing contractor stat cards showed only Infrastructure. After HHH-B, contractors see only a simplified view — verify contractor experience is maintained.

**Acceptance:**
- [ ] Infrastructure Portfolio mini-summary card visible for non-contractors above module stat cards
- [ ] Mini-summary shows 4 metrics: Total Projects, Avg Progress, Portfolio Budget, Delayed
- [ ] Cost utilization progress bar shows with label + amount breakdown
- [ ] Delayed count card turns error color when > 0, grey when 0
- [ ] Infrastructure Projects removed from module stat cards (no duplication with AdminKpiRow + mini-summary)
- [ ] Repair Projects and UO stat cards still visible for non-contractors
- [ ] Contractor view unchanged (AdminKpiRow hidden, mini-summary hidden)
- [ ] `formatCurrencyShort` available in dashboard.vue
- [ ] No TypeScript errors

---

### HHH-C: Guidance Banners + Page Restructure
**File:** `pmo-frontend/pages/dashboard.vue`
**Research:** R-072

Add contextual guidance to help users understand what each section represents, and restructure the page section order for executive priority.

**Step 1 — Add welcome/context banner at top:**
```html
<!-- HHH-C: Context banner -->
<v-alert
  v-if="!isContractor"
  type="info"
  variant="tonal"
  density="compact"
  icon="mdi-view-dashboard"
  class="mb-4"
  closable
>
  <strong>CSU CORE Executive Dashboard</strong> — This dashboard provides a real-time overview of all active modules: Infrastructure Projects, University Operations, and Repairs. Use the module links below to access detailed records.
</v-alert>
```

**Step 2 — Restructure page section order (non-contractor):**
Current: Welcome → AdminKpiRow → module stat cards → Quick Actions → UO Summary
Target: Welcome → Context Banner → AdminKpiRow → Infrastructure Mini-Summary → UO Summary → Quick Actions → module stat cards

The Quick Actions should follow the analytics content (users review dashboards then take action).

Reorder the template blocks accordingly.

**Step 3 — Add descriptive label to UO Summary section:**
Add a subtitle below the "University Operations Summary" heading:
```html
<p class="text-body-2 text-grey-darken-1 mb-3">
  Physical and financial accomplishment rates per pillar for the selected fiscal year. Data sourced from BAR No. 1 and BAR No. 2 reports.
</p>
```

**Step 4 — Make UO Summary always visible (even when no data):**
Currently wrapped in `v-if="!isContractor && (uoPhysicalSummary || uoFinancialSummary || uoAnalyticsLoading)"` — disappears when no data. Remove the outer `v-if` so the section always shows (the inner `v-alert` handles the empty state).

Change outer condition: `v-if="!isContractor"` only.

**Acceptance:**
- [ ] Context banner visible at top for non-contractors (dismissible/closable)
- [ ] Page order: Welcome → Banner → AdminKpiRow → Infrastructure Mini-Summary → UO Summary → Quick Actions → Module Stat Cards
- [ ] UO Summary section has descriptive subtitle explaining data source
- [ ] UO Summary always visible for non-contractors (shows "No data" alert when empty instead of hiding)
- [ ] Quick Actions section remains functional (all 4 buttons working)
- [ ] Contractor view unaffected
- [ ] No TypeScript errors

---

### HHH Verification Checklist
- [ ] HHH-A: AdminKpiRow uses `analytics/summary` (no full list fetch)
- [ ] HHH-A: AdminKpiRow tiles: Infrastructure Projects total / Delayed / Pending Reviews / UO Compliance Rate
- [ ] HHH-A: Tile colors: primary / error / warning / success
- [ ] HHH-A: `dashboard.vue` no longer calls `/api/construction-projects` for count
- [ ] HHH-B: Infrastructure Portfolio mini-summary card visible between AdminKpiRow and module cards
- [ ] HHH-B: 4-metric mini-summary: Total Projects / Avg Progress / Portfolio Budget / Delayed
- [ ] HHH-B: Cost utilization bar shows % and amount label
- [ ] HHH-B: Delayed card turns error color when delayed_count > 0
- [ ] HHH-B: Each infrastructure metric card navigates to `/coi` on click
- [ ] HHH-B: Infrastructure Projects stat card removed from module card row
- [ ] HHH-C: Context banner visible at top (dismissible)
- [ ] HHH-C: Section order: Banner → AdminKpiRow → Infrastructure → UO → Quick Actions → Modules
- [ ] HHH-C: UO Summary has descriptive subtitle
- [ ] HHH-C: UO Summary always visible for non-contractors
- [ ] All existing functionality preserved (UO pillar cards, fiscal year selector, Quick Actions)
- [ ] Contractor experience unaffected
- [ ] No vue-tsc errors

---

## NEXT PHASE CANDIDATES (Require Phase 1+2+Authorization)

| Candidate | Description |
|---|---|
| Gallery Enhancement | Timeline/chronological view in CiGalleryModal; monthly count analytics |
| Personnel RBAC per-repo | Contractor access only to explicitly assigned repositories — major RBAC overhaul |
| Rate Limiting | NestJS rate limiter middleware — required before full production |
| Server-side MIME Validation | Backend magic-byte checking for uploaded files |
| Progress Report Tab UI Consistency | Standardize headers/filter/view-toggle (BBB-E covers progress report cards) |
| Gallery before/after comparison | Future enhancement |

## DEFERRED / YAGNI

| Item | Reason |
|---|---|
| Contractor Performance analytics | Promoted to Phase III-E (client-side feasible; backend extension planned in III-A) |
| Completion Trends time-series at COI index | Requires new analytics endpoint (time-series aggregation) — still deferred |
| Cross-module global financial analytics | Until data entry stable across all modules |
| Financial analytics endpoints (COI FY breakdown) | `ConstructionProjectFinancial` entity archived; no FY data exists |
| OAuth token rotation review | Low risk in current env |
| Subfolder CRUD inside repository modal | Out of scope for card architecture |

---

## PHASE III — COI Dashboard Analytics Tier 2
> **Status:** ✅ Phase 3 complete — vue-tsc + tsc 0 new errors. Committed `0643c6c`.
> **Research:** R-077, R-079, R-082, R-083, R-084, R-085, R-086, R-087
> **Files:** `pmo-backend/src/construction-projects/construction-projects.service.ts`, `pmo-frontend/pages/coi/index.vue`
> **Scope:** Add per-campus progress analytics, contract distribution charts, contractor distribution, backend aggregation extensions. All additions use the existing `analytics/summary` endpoint or minimally extend it. Zero new controller routes. Zero migrations.
> **Commit style:** `feat(coi): <description>` per EEE-D standard

---

### III-A: Backend Extension — Add `by_funding_source` and `by_contractor` to Analytics Summary

**File:** `pmo-backend/src/construction-projects/construction-projects.service.ts`
**Research:** R-087

Extend `getAnalyticsSummary()` to include two additional GROUP BY queries in the existing `Promise.all`.

**Step 1 — Add to the `Promise.all` array in `getAnalyticsSummary()`:**
```ts
conn.execute(
  `SELECT funding_source_name, COUNT(*) as count, COALESCE(SUM(contract_amount),0) as total_contract
   FROM construction_projects
   WHERE deleted_at IS NULL AND funding_source_name IS NOT NULL
   GROUP BY funding_source_name ORDER BY count DESC`
),
conn.execute(
  `SELECT contractor_name, COUNT(*) as count, COALESCE(SUM(contract_amount),0) as total_contract
   FROM construction_projects
   WHERE deleted_at IS NULL AND contractor_name IS NOT NULL
   GROUP BY contractor_name ORDER BY count DESC LIMIT 10`
),
```

**Step 2 — Add to return object:**
```ts
by_funding_source: fundingSourceRows.map(r => ({
  funding_source_name: r.funding_source_name,
  count: parseInt(r.count, 10),
  total_contract: parseFloat(r.total_contract),
})),
by_contractor: contractorRows.map(r => ({
  contractor_name: r.contractor_name,
  count: parseInt(r.count, 10),
  total_contract: parseFloat(r.total_contract),
})),
```

**Acceptance:**
- [ ] `GET /api/construction-projects/analytics/summary` response includes `by_funding_source[]` and `by_contractor[]`
- [ ] `tsc --noEmit` passes (return type is `Promise<any>` — no DTO change)

---

### III-B: Campus Intelligence Panel — Dual-Bar (Count + Avg Progress)

**File:** `pmo-frontend/pages/coi/index.vue`
**Research:** R-079

The existing "Projects by Campus" hero panel shows only count. `by_campus[].avg_progress` is already returned but unused. Add a secondary progress bar per campus row.

**Step 1 — Update `campusBars` computed to include `avg_progress`:**
```ts
const campusBars = computed(() => {
  const data = (analyticsSummary.value?.by_campus || []) as Array<{
    campus: string; count: number; avg_progress: number
  }>
  const max = Math.max(...data.map(d => d.count), 1)
  return [...data].sort((a, b) => b.count - a.count).map(d => ({
    ...d,
    pct: (d.count / max) * 100,
    avg_progress: parseFloat(String(d.avg_progress)) || 0,
  }))
})
```

**Step 2 — Update campus bar rows template to show dual-bar:**
```html
<div
  v-for="campus in campusBars"
  :key="campus.campus"
  class="mb-3"
  style="cursor:pointer"
  @click="drillToCampus(campus.campus)"
>
  <div class="d-flex justify-space-between text-caption mb-1">
    <span class="text-primary font-weight-medium">{{ campus.campus || 'Unknown' }}</span>
    <span>{{ campus.count }} project{{ campus.count !== 1 ? 's' : '' }}</span>
  </div>
  <v-progress-linear :model-value="campus.pct" height="6" rounded color="primary" class="mb-1" />
  <div class="d-flex justify-space-between text-caption mb-1" style="opacity:0.75">
    <span>Avg Progress</span><span>{{ campus.avg_progress.toFixed(1) }}%</span>
  </div>
  <v-progress-linear :model-value="campus.avg_progress" height="4" rounded color="deep-purple" />
</div>
```

**Acceptance:**
- [ ] Each campus shows 2 bars: project count (primary) + avg progress (deep-purple)
- [ ] Avg progress uses `by_campus[].avg_progress` from backend
- [ ] Click-to-filter still works

---

### III-C: Analytics Tab — Per-Campus Avg Progress Chart

**File:** `pmo-frontend/pages/coi/index.vue`
**Research:** R-079, R-086

Add a horizontal bar chart showing average physical progress per campus in the Analytics tab.

**Step 1 — Add `campusProgressChart` computed:**
```ts
const campusProgressChart = computed(() => {
  const data = (analyticsSummary.value?.by_campus || []) as Array<{
    campus: string; avg_progress: number
  }>
  const sorted = [...data].sort((a, b) =>
    (parseFloat(String(b.avg_progress)) || 0) - (parseFloat(String(a.avg_progress)) || 0)
  )
  return {
    series: [{ name: 'Avg Progress %', data: sorted.map(d => +((parseFloat(String(d.avg_progress)) || 0).toFixed(1))) }],
    options: {
      chart: { type: 'bar' as const, toolbar: { show: false } },
      plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
      xaxis: { max: 100, labels: { formatter: (v: string) => `${v}%` } },
      yaxis: { categories: sorted.map(d => d.campus || 'Unknown') },
      colors: ['#7c3aed'],
      dataLabels: { enabled: true, formatter: (v: any) => `${Number(v).toFixed(1)}%` },
    },
  }
})
```

**Step 2 — Add chart in Analytics tab after the existing Charts Row:**
```html
<!-- III-C + III-D: Campus Progress + Budget Distribution row -->
<v-row class="mt-4">
  <v-col cols="12" md="6">
    <v-card class="pa-4">
      <v-card-title class="text-body-1 font-weight-bold mb-1">Avg Physical Progress by Campus</v-card-title>
      <v-card-subtitle class="text-caption pb-2">Which campuses are most advanced in construction delivery?</v-card-subtitle>
      <VueApexCharts v-if="campusProgressChart.series[0].data.length > 0" type="bar" height="220"
        :options="campusProgressChart.options" :series="campusProgressChart.series" />
      <div v-else class="text-center py-4 text-grey">No campus data</div>
    </v-card>
  </v-col>
  <v-col cols="12" md="6">
    <!-- III-D Budget by Campus donut goes here -->
  </v-col>
</v-row>
```

**Acceptance:**
- [ ] Horizontal bar chart appears in Analytics tab
- [ ] Bars reflect backend DB aggregate avg_progress per campus
- [ ] Subtitle explains decision-support purpose

---

### III-D: Analytics Tab — Budget by Campus Donut + Contract by Status Donut

**File:** `pmo-frontend/pages/coi/index.vue`
**Research:** R-079, R-085

Add two contract-value distribution charts using untapped backend fields.

**Step 1 — Add `budgetByCampusChart` computed:**
```ts
const budgetByCampusChart = computed(() => {
  const data = (analyticsSummary.value?.by_campus || []) as Array<{
    campus: string; total_contract: number
  }>
  const labels = data.map(d => d.campus || 'Unknown')
  const series = data.map(d => parseFloat(String(d.total_contract || 0)))
  const fmt = (v: number) => {
    if (v >= 1_000_000_000) return `₱${(v / 1_000_000_000).toFixed(1)}B`
    if (v >= 1_000_000) return `₱${(v / 1_000_000).toFixed(1)}M`
    return `₱${v.toLocaleString()}`
  }
  return {
    series,
    options: {
      chart: { type: 'donut' as const, toolbar: { show: false } },
      labels,
      legend: { position: 'bottom' as const },
      tooltip: { y: { formatter: fmt } },
    },
  }
})
```

**Step 2 — Add `contractByStatusChart` computed:**
```ts
const contractByStatusChart = computed(() => {
  const data = (analyticsSummary.value?.by_status || []) as Array<{
    status: string; total_contract: number
  }>
  const STATUS_COLORS: Record<string, string> = {
    ONGOING: '#3b82f6', COMPLETE: '#059669', COMPLETED: '#059669',
    ON_HOLD: '#f59e0b', CANCELLED: '#ef4444', PROPOSAL: '#6b7280',
  }
  const fmt = (v: number) => {
    if (v >= 1_000_000_000) return `₱${(v / 1_000_000_000).toFixed(1)}B`
    if (v >= 1_000_000) return `₱${(v / 1_000_000).toFixed(1)}M`
    return `₱${v.toLocaleString()}`
  }
  return {
    series: data.map(d => parseFloat(String(d.total_contract || 0))),
    options: {
      chart: { type: 'donut' as const, toolbar: { show: false } },
      labels: data.map(d => d.status),
      colors: data.map(d => STATUS_COLORS[d.status] || '#9ca3af'),
      legend: { position: 'bottom' as const },
      tooltip: { y: { formatter: fmt } },
    },
  }
})
```

**Step 3 — Add both donuts in a "Financial Distribution" row:**
```html
<!-- III-D: Financial Distribution row -->
<v-row class="mt-4">
  <v-col cols="12" md="6">
    <v-card class="pa-4">
      <v-card-title class="text-body-1 font-weight-bold mb-1">Budget Concentration by Campus</v-card-title>
      <v-card-subtitle class="text-caption pb-2">Where is infrastructure investment concentrated?</v-card-subtitle>
      <VueApexCharts v-if="budgetByCampusChart.series.some(v => v > 0)" type="donut" height="240"
        :options="budgetByCampusChart.options" :series="budgetByCampusChart.series" />
      <div v-else class="text-center py-4 text-grey">No financial data</div>
    </v-card>
  </v-col>
  <v-col cols="12" md="6">
    <v-card class="pa-4">
      <v-card-title class="text-body-1 font-weight-bold mb-1">Contract Value by Status</v-card-title>
      <v-card-subtitle class="text-caption pb-2">How much budget is allocated per project status?</v-card-subtitle>
      <VueApexCharts v-if="contractByStatusChart.series.some(v => v > 0)" type="donut" height="240"
        :options="contractByStatusChart.options" :series="contractByStatusChart.series" />
      <div v-else class="text-center py-4 text-grey">No data</div>
    </v-card>
  </v-col>
</v-row>
```

**Acceptance:**
- [ ] Budget by Campus donut shows contract value share per campus
- [ ] Contract by Status donut shows budget concentration by status
- [ ] Tooltips format to ₱M / ₱B

---

### III-E: Analytics Tab — Contractor Chart + Backend Funding Source Upgrade

**File:** `pmo-frontend/pages/coi/index.vue`
**Research:** R-085, R-087

After III-A adds `by_contractor` and `by_funding_source`:

**Step 1 — Update `fundingSourceChart` to prefer backend data with client-side fallback:**
```ts
const fundingSourceChart = computed(() => {
  const backendData = (analyticsSummary.value?.by_funding_source || []) as Array<{
    funding_source_name: string; count: number
  }>
  if (backendData.length) {
    return {
      series: backendData.map(d => d.count),
      options: {
        chart: { type: 'donut' as const, toolbar: { show: false } },
        labels: backendData.map(d => d.funding_source_name || 'Unknown'),
        legend: { position: 'bottom' as const },
      },
    }
  }
  // Fallback: client-side grouping (unchanged from GGG)
  const map: Record<string, number> = {}
  projects.value.forEach(p => { const fs = p.fundSource || 'Unknown'; map[fs] = (map[fs] || 0) + 1 })
  return {
    series: Object.values(map),
    options: {
      chart: { type: 'donut' as const, toolbar: { show: false } },
      labels: Object.keys(map),
      legend: { position: 'bottom' as const },
    },
  }
})
```

**Step 2 — Add `contractorChart` computed:**
```ts
const contractorChart = computed(() => {
  const backendData = (analyticsSummary.value?.by_contractor || []) as Array<{
    contractor_name: string; count: number
  }>
  const data = backendData.length
    ? backendData
    : (() => {
        const map: Record<string, number> = {}
        projects.value.forEach(p => { if (p.contractor) { map[p.contractor] = (map[p.contractor] || 0) + 1 } })
        return Object.entries(map).sort(([,a],[,b]) => b - a).slice(0, 10)
          .map(([contractor_name, count]) => ({ contractor_name, count }))
      })()
  const truncate = (s: string) => s.length > 28 ? s.slice(0, 26) + '…' : s
  return {
    series: [{ name: 'Projects', data: data.map(d => d.count) }],
    options: {
      chart: { type: 'bar' as const, toolbar: { show: false } },
      plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
      yaxis: { categories: data.map(d => truncate(d.contractor_name || '')) },
      colors: ['#0ea5e9'],
      dataLabels: { enabled: false },
    },
  }
})
```

**Step 3 — Replace current Funding Source panel placement, add Contractor chart:**

In the Analytics tab (after Physical Progress Distribution), replace the current Funding Source row with:
```html
<!-- III-E: Contractor + Funding Source row -->
<v-row class="mt-4">
  <v-col cols="12" md="7">
    <v-card class="pa-4">
      <v-card-title class="text-body-1 font-weight-bold mb-1">Projects by Contractor</v-card-title>
      <v-card-subtitle class="text-caption pb-2">Which contractors have the most active projects?</v-card-subtitle>
      <VueApexCharts v-if="contractorChart.series[0]?.data?.length > 0" type="bar" height="260"
        :options="contractorChart.options" :series="contractorChart.series" />
      <div v-else class="text-center py-4 text-grey">No contractor data</div>
    </v-card>
  </v-col>
  <v-col cols="12" md="5">
    <v-card class="pa-4">
      <v-card-title class="text-body-1 font-weight-bold mb-1">Funding Source Distribution</v-card-title>
      <v-card-subtitle class="text-caption pb-2">How projects are distributed by funding source</v-card-subtitle>
      <VueApexCharts v-if="fundingSourceChart.series.length > 0" type="donut" height="260"
        :options="fundingSourceChart.options" :series="fundingSourceChart.series" />
      <div v-else class="text-center py-4 text-grey">No funding source data</div>
    </v-card>
  </v-col>
</v-row>
```

**Acceptance:**
- [ ] Funding Source donut uses `by_funding_source` (falls back to client-side if absent)
- [ ] Contractor horizontal bar shows top-10 contractors by project count
- [ ] Both charts have subtitle guidance

---

### III-F: Analytics Tab — Section Guidance Banners

**File:** `pmo-frontend/pages/coi/index.vue`
**Research:** R-082, R-086

Add one `v-alert` guidance banner at the top of the Analytics tab and contextual subtitles before each chart group.

**Top-of-tab banner:**
```html
<v-alert type="info" variant="tonal" density="compact" class="mb-4" icon="mdi-information-outline">
  <strong>Portfolio Analytics</strong> — Comprehensive analytics across {{ stats.total }} infrastructure projects.
  Charts use authoritative DB aggregates from the analytics endpoints.
</v-alert>
```

**Section dividers with labels (before each chart group):**
- Before Financial Hero: `<!-- Financial KPIs -->`  + `<v-divider class="mb-3" />`
- Before Status/Campus charts: small section label "Status & Campus Distribution"
- Before Progress Distribution: small section label "Physical Accomplishment Analytics"
- Before Campus Progress/Budget: small section label "Campus Intelligence"
- Before Contractor/Funding: small section label "Partnership & Funding Analytics"

**Pattern for section label:**
```html
<div class="text-caption text-grey-darken-1 font-weight-bold text-uppercase mt-4 mb-2">
  <v-icon size="14" class="mr-1">mdi-chart-pie</v-icon> Physical Accomplishment Analytics
</div>
```

**Acceptance:**
- [ ] Top-of-tab banner visible when Analytics tab is open
- [ ] Each chart group is preceded by a section label
- [ ] No banners use error/warning type for informational content

---

### III Verification Checklist

- [ ] III-A: `analytics/summary` response includes `by_funding_source[]` and `by_contractor[]`
- [ ] III-A: `tsc --noEmit` passes on backend
- [ ] III-B: Campus panel shows dual bars (count bar + avg progress bar) per campus
- [ ] III-B: Avg progress bar uses backend `by_campus[].avg_progress`
- [ ] III-C: "Avg Physical Progress by Campus" horizontal bar chart in Analytics tab
- [ ] III-C: Chart has subtitle explaining purpose
- [ ] III-D: "Budget Concentration by Campus" donut visible
- [ ] III-D: "Contract Value by Status" donut visible
- [ ] III-D: Currency tooltips format to ₱M / ₱B
- [ ] III-E: Funding Source donut uses `by_funding_source` backend field
- [ ] III-E: "Projects by Contractor" horizontal bar chart visible
- [ ] III-F: Top-of-tab `v-alert` guidance banner visible
- [ ] III-F: Section labels visible before each chart group
- [ ] vue-tsc 0 new errors

---

## PHASE JJJ — CSU CORE Executive Dashboard Analytics
> **Status:** ✅ Phase 3 complete — vue-tsc 0 new errors. Committed `0643c6c`.
> **Research:** R-078, R-080, R-082, R-083, R-084, R-086
> **Files:** `pmo-frontend/pages/dashboard.vue`
> **Scope:** Add UO quarterly trend charts, section guidance banners, and fiscal-year-reactive reloads. All data from existing UO analytics endpoints — no new backend work. No migrations.
> **Commit style:** `feat(core): <description>` per EEE-D standard

---

### JJJ-A: UO Accomplishment Trend Chart (Q1–Q4 Area)

**File:** `pmo-frontend/pages/dashboard.vue`
**Research:** R-080

Add Q1–Q4 accomplishment trend area chart in the UO Summary section using the existing `/analytics/quarterly-trend` endpoint. Highest executive value addition — shows trajectory, not just snapshot.

**Step 1 — Import VueApexCharts:**
```ts
import VueApexCharts from 'vue3-apexcharts'
```

**Step 2 — Add refs and load function:**
```ts
const uoTrend = ref<any>(null)
const uoTrendLoading = ref(false)

async function loadUoTrend() {
  if (!selectedFiscalYear.value) return
  uoTrendLoading.value = true
  try {
    uoTrend.value = await api.get<any>(
      `/api/university-operations/analytics/quarterly-trend?fiscal_year=${selectedFiscalYear.value}`
    )
  } catch {
    uoTrend.value = null
  } finally {
    uoTrendLoading.value = false
  }
}
```

**Step 3 — Add `uoTrendChart` computed:**
```ts
const uoTrendChart = computed(() => {
  const quarters = (uoTrend.value?.quarters || []) as Array<{
    quarter: string; accomplishment_rate_pct: number | null
  }>
  return {
    series: [{ name: 'Accomplishment Rate', data: quarters.map(q => +(q.accomplishment_rate_pct ?? 0).toFixed(1)) }],
    options: {
      chart: { type: 'area' as const, toolbar: { show: false } },
      xaxis: { categories: quarters.map(q => q.quarter) },
      yaxis: { max: 100, labels: { formatter: (v: number) => `${v.toFixed(0)}%` } },
      colors: ['#059669'],
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] } },
      stroke: { curve: 'smooth' as const, width: 2 },
      markers: { size: 5 },
      dataLabels: { enabled: true, formatter: (v: any) => `${Number(v).toFixed(1)}%` },
      tooltip: { y: { formatter: (v: number) => `${v.toFixed(1)}%` } },
    },
  }
})
```

**Step 4 — Add chart in UO Summary card, below pillar cards:**
```html
<!-- JJJ-A: Q1-Q4 Accomplishment Trend -->
<template v-if="uoTrend?.quarters?.length">
  <v-divider class="my-3" />
  <div class="text-caption text-grey-darken-1 text-uppercase font-weight-bold mb-1">Q1–Q4 Accomplishment Trend</div>
  <p class="text-caption text-grey mb-2">University-wide indicator accomplishment rate per quarter</p>
  <VueApexCharts type="area" height="180"
    :options="uoTrendChart.options" :series="uoTrendChart.series" />
</template>
```

**Acceptance:**
- [ ] Q1–Q4 area chart visible in UO Summary section
- [ ] Chart shows `accomplishment_rate_pct` per quarter
- [ ] Graceful empty state when trend data unavailable

---

### JJJ-B: UO Financial Utilization Trend Chart (Q1–Q4 Area)

**File:** `pmo-frontend/pages/dashboard.vue`
**Research:** R-080

Add Q1–Q4 financial utilization trend using `/analytics/financial-quarterly-trend`.

**Step 1 — Add ref and load function:**
```ts
const uoFinancialTrend = ref<any>(null)

async function loadUoFinancialTrend() {
  if (!selectedFiscalYear.value) return
  try {
    uoFinancialTrend.value = await api.get<any>(
      `/api/university-operations/analytics/financial-quarterly-trend?fiscal_year=${selectedFiscalYear.value}`
    )
  } catch {
    uoFinancialTrend.value = null
  }
}
```

**Step 2 — Add `uoFinancialTrendChart` computed:**
```ts
const uoFinancialTrendChart = computed(() => {
  const quarters = (uoFinancialTrend.value?.quarters || []) as Array<{
    quarter: string; utilization_rate: number
  }>
  return {
    series: [{ name: 'Utilization Rate', data: quarters.map(q => +Number(q.utilization_rate).toFixed(1)) }],
    options: {
      chart: { type: 'area' as const, toolbar: { show: false } },
      xaxis: { categories: quarters.map(q => q.quarter) },
      yaxis: { max: 100, labels: { formatter: (v: number) => `${v.toFixed(0)}%` } },
      colors: ['#7c3aed'],
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] } },
      stroke: { curve: 'smooth' as const, width: 2 },
      markers: { size: 5 },
      dataLabels: { enabled: true, formatter: (v: any) => `${Number(v).toFixed(1)}%` },
    },
  }
})
```

**Step 3 — Add chart below JJJ-A in UO Summary card:**
```html
<!-- JJJ-B: Q1-Q4 Financial Utilization Trend -->
<template v-if="uoFinancialTrend?.quarters?.length">
  <v-divider class="my-3" />
  <div class="text-caption text-grey-darken-1 text-uppercase font-weight-bold mb-1">Q1–Q4 Financial Utilization</div>
  <p class="text-caption text-grey mb-2">Fund utilization rate per quarter — how efficiently appropriations are being obligated</p>
  <VueApexCharts type="area" height="160"
    :options="uoFinancialTrendChart.options" :series="uoFinancialTrendChart.series" />
</template>
```

**Acceptance:**
- [ ] Q1–Q4 financial utilization area chart visible in UO Summary
- [ ] Shows `utilization_rate` per quarter

---

### JJJ-C: Fiscal Year Watcher — Reload All Charts

**File:** `pmo-frontend/pages/dashboard.vue`
**Research:** R-080

Extend the existing fiscal year watcher to reload trend charts alongside pillar summary.

**Update `watch(selectedFiscalYear, ...)`:**
```ts
watch(selectedFiscalYear, async () => {
  await Promise.allSettled([
    loadUoSummary(),
    loadUoTrend(),
    loadUoFinancialTrend(),
  ])
}, { immediate: true })
```

Also call both in `onMounted` for non-contractor users.

**Acceptance:**
- [ ] Fiscal year change triggers reload of pillar cards + both trend charts
- [ ] No stale data shown after switching fiscal years

---

### JJJ-D: Dashboard Section Guidance — Subtitles and Captions

**File:** `pmo-frontend/pages/dashboard.vue`
**Research:** R-082, R-086

Add descriptive subtitles and captions to every major dashboard section.

**UO Summary card — verify subtitle from HHH:**
- "Physical and financial performance by pillar" (added in HHH) — verify present

**Quick Actions card — add subtitle:**
```html
<p class="text-caption text-grey-darken-1 mb-3">Frequently used workflows across CSU CORE modules</p>
```

**Other Modules row — add section heading:**
```html
<div class="mb-2 mt-4" v-if="statCards.length">
  <h2 class="text-subtitle-1 font-weight-bold">Other Modules</h2>
  <p class="text-caption text-grey-darken-1">Navigate to other university management modules</p>
</div>
```

**Infrastructure Portfolio card — verify click-affordance caption is present from HHH.**

**Acceptance:**
- [ ] UO Summary has descriptive subtitle
- [ ] Quick Actions has descriptive subtitle
- [ ] Module cards section has section heading
- [ ] Infrastructure card click affordance is present

---

### JJJ Verification Checklist

- [ ] JJJ-A: `VueApexCharts` imported in dashboard.vue
- [ ] JJJ-A: Q1–Q4 UO Accomplishment Trend area chart visible in UO Summary
- [ ] JJJ-A: Chart shows `accomplishment_rate_pct` per quarter
- [ ] JJJ-A: Graceful hide when trend data unavailable
- [ ] JJJ-B: Q1–Q4 Financial Utilization area chart visible in UO Summary
- [ ] JJJ-B: Chart shows `utilization_rate` per quarter
- [ ] JJJ-C: Fiscal year change triggers reload of all 3 UO datasets
- [ ] JJJ-D: Quick Actions has subtitle caption
- [ ] JJJ-D: Module cards section has heading
- [ ] vue-tsc 0 new errors

---

## Phase KKK — CSU CORE Dashboard Executive Refactor

**Status:** ✅ Phase 3 complete (KKK-A→G). vue-tsc 0 new errors. Frontend-only, no migrations.
**Research:** R-088, R-091, R-092, R-095, R-099, R-100, R-101, R-103
**Files:** `pmo-frontend/pages/dashboard.vue`, `pmo-frontend/components/AdminKpiRow.vue`

### KKK-A: AdminKpiRow — Remove Negative Metric + Compact Typography

**Goal:** Replace "Delayed Projects" (negative metric) with "Published Projects" (positive). Downsize KPI tile typography.

**Changes to `pmo-frontend/components/AdminKpiRow.vue`:**
- Tile 2: change label from "Delayed Projects" to "Published Projects"; change icon from `mdi-alert-circle` to `mdi-check-decagram`; change color from `error` to `success`; derive value from `analyticsSummary.by_publication_status` where status = PUBLISHED
- All 4 tiles: change value class from `text-h5 font-weight-bold` to `text-subtitle-1 font-weight-bold`
- All 4 tiles: change avatar `size="44"` to `size="36"`
- Tile 1 (Infrastructure): value = `analyticsSummary.total` (unchanged)
- Tile 3 (Pending Reviews): unchanged
- Tile 4 (UO Compliance): unchanged

**Acceptance:**
- [ ] Tile 2 shows "Published Projects" count with success color
- [ ] All tile values use `text-subtitle-1 font-weight-bold`
- [ ] Avatar size is 36 on all tiles
- [ ] No negative metrics visible in KpiRow

---

### KKK-B: Infrastructure Mini-Summary — Remove Delayed + Compact Typography

**Goal:** Replace "Delayed" stat with "Completed". Downsize stat typography. Add positive framing.

**Changes to `pmo-frontend/pages/dashboard.vue` — Infrastructure card stat row:**
- Stat 3: change label from "Delayed" to "Completed"; derive value from `analyticsSummary.by_status` where status = COMPLETE (or COMPLETED)
- All 4 stat values: change `text-h5 font-weight-bold` to `text-h6 font-weight-bold`
- Stat 3 icon/color: change from error/delayed to `mdi-check-circle` / success color

**Acceptance:**
- [ ] Stat 3 shows "Completed" count with success/neutral color
- [ ] All 4 stats use `text-h6 font-weight-bold`
- [ ] No "Delayed" label visible in Infrastructure card

---

### KKK-C: UO Summary — Compact Pillar Display + Collapsible Trend Charts

**Goal:** Replace 8 separate pillar cards with 4 compact dual-stat cards. Move trend charts to collapsible panel (default collapsed).

**Changes to `pmo-frontend/pages/dashboard.vue` — UO Summary section:**

Replace the current physical/financial 8-card loop with a single `v-row` of 4 cards:
```html
<v-col v-for="pillar in compactPillarData" :key="pillar.name" cols="12" sm="6" lg="3">
  <v-card variant="tonal" rounded="lg" class="pa-3">
    <div class="d-flex align-center mb-2">
      <v-icon :icon="pillar.icon" size="18" :color="pillar.color" class="mr-2" />
      <span class="text-caption font-weight-bold text-uppercase">{{ pillar.name }}</span>
    </div>
    <div class="d-flex justify-space-between">
      <div>
        <div class="text-caption text-grey-darken-1">Physical</div>
        <div class="text-subtitle-2 font-weight-bold">{{ pillar.physicalPct }}%</div>
      </div>
      <v-divider vertical class="mx-2" />
      <div>
        <div class="text-caption text-grey-darken-1">Financial</div>
        <div class="text-subtitle-2 font-weight-bold">{{ pillar.financialPct }}%</div>
      </div>
    </div>
  </v-card>
</v-col>
```

Add `compactPillarData` computed that zips physical + financial pillar summaries by name.

Move trend charts into `v-expansion-panels` at the bottom of the UO Summary card:
```html
<v-expansion-panels class="mt-3" variant="accordion">
  <v-expansion-panel title="Quarterly Trend Charts">
    <!-- existing uoTrendChart + uoFinancialTrendChart content -->
  </v-expansion-panel>
</v-expansion-panels>
```
Default: collapsed (no `v-model` binding = all panels collapsed).

**Acceptance:**
- [ ] 4 compact dual-stat pillar cards replace 8 separate cards
- [ ] Each card shows physical % and financial % for the pillar
- [ ] Trend charts inside collapsible panel, default collapsed
- [ ] UO Summary card height significantly reduced vs current state
- [ ] Fiscal year change still reloads all UO data

---

### KKK-D: Quick Actions — Compact v-list Navigation

**Goal:** Replace 4 large block buttons with a compact `v-list` navigation list.

**Changes to `pmo-frontend/pages/dashboard.vue` — Quick Actions card:**

Replace current `v-btn size="large" block` grid with:
```html
<v-list density="compact" nav rounded="lg">
  <v-list-item
    prepend-icon="mdi-office-building"
    title="Infrastructure Projects"
    subtitle="View and manage COI portfolio"
    to="/coi"
    rounded="lg"
  >
    <template #append><v-icon size="16">mdi-chevron-right</v-icon></template>
  </v-list-item>
  <v-list-item
    prepend-icon="mdi-chart-timeline-variant"
    title="Physical Accomplishments"
    subtitle="BAR No. 1 performance tracking"
    to="/university-operations/physical"
    rounded="lg"
  >
    <template #append><v-icon size="16">mdi-chevron-right</v-icon></template>
  </v-list-item>
  <v-list-item
    prepend-icon="mdi-currency-usd"
    title="Financial Accomplishments"
    subtitle="BAR No. 2 financial utilization"
    to="/university-operations/financial"
    rounded="lg"
  >
    <template #append><v-icon size="16">mdi-chevron-right</v-icon></template>
  </v-list-item>
  <v-list-item
    v-if="isAdmin"
    prepend-icon="mdi-account-group"
    title="User Management"
    subtitle="Manage system accounts and roles"
    to="/users"
    rounded="lg"
  >
    <template #append><v-icon size="16">mdi-chevron-right</v-icon></template>
  </v-list-item>
</v-list>
```

Remove the old `size="large" block` button grid and associated 2-column layout wrapper.

**Acceptance:**
- [ ] Quick Actions shows compact v-list (not large buttons)
- [ ] Each item has icon, title, subtitle, and chevron
- [ ] Navigation works identically to before
- [ ] Admin-only "User Management" still gated by role
- [ ] Quick Actions card takes significantly less vertical space

---

### KKK-E: Other Modules — Remove Stat Cards, Navigation-Only

**Goal:** Remove `gadReports`, `repairProjects`, `universityOperations` stat card section entirely. Replace with compact navigation links appended to Quick Actions list.

**Changes to `pmo-frontend/pages/dashboard.vue`:**
- Remove `gadReports`, `repairProjects`, `universityOperations` from `stats` reactive object
- Remove API calls: `fetchRepairProjects()`, `fetchUniversityOperations()`, `fetchGadReports()` (or equivalent)
- Remove the "Other Modules" stat card row template block
- Append 2 navigation `v-list-item` entries to the Quick Actions list (Repair Projects + University Operations) — no count display, navigation-only

**Acceptance:**
- [ ] No "GAD Reports" card visible anywhere on dashboard
- [ ] No stat card row for "Other Modules"
- [ ] Repair Projects and UO accessible via Quick Actions list entries
- [ ] No full-list API calls for /api/repair-projects or /api/university-operations on dashboard load

---

### KKK-F: Welcome Heading — Typography Reduction

**Goal:** Downsize welcome heading from `text-h4` to `text-h5` per R-091 benchmark.

**Changes to `pmo-frontend/pages/dashboard.vue`:**
- Change welcome heading class from `text-h4` to `text-h5`
- No other changes to welcome section

**Acceptance:**
- [ ] Welcome heading renders as `text-h5`

---

### KKK-G: Context Banner — Text Update

**Goal:** Update context banner text to reflect executive dashboard framing.

**Changes to `pmo-frontend/pages/dashboard.vue` — dismissible banner:**
- Update banner subtitle from current description to: "Executive view — key metrics and portfolio summary for decision support. Use module tabs for detailed reporting."

**Acceptance:**
- [ ] Banner shows updated guidance text

---

### KKK Verification Checklist

- [ ] KKK-A: "Published Projects" tile visible with success color
- [ ] KKK-A: All KpiRow tile values use text-subtitle-1
- [ ] KKK-B: "Completed" stat replaces "Delayed" in Infrastructure card
- [ ] KKK-B: Infrastructure stat values use text-h6
- [ ] KKK-C: 4 compact dual-stat pillar cards visible
- [ ] KKK-C: Trend charts in collapsible panel, default collapsed
- [ ] KKK-D: Quick Actions shows v-list (no large buttons)
- [ ] KKK-E: No GAD Reports card, no stat-card Other Modules row
- [ ] KKK-F: Welcome heading is text-h5
- [ ] KKK-G: Banner updated text visible
- [ ] vue-tsc 0 new errors

---

## Phase LLL — COI Dashboard Executive Refactor

**Status:** ✅ Phase 3 complete (LLL-A→H). vue-tsc 0 new errors. Frontend-only, no migrations.
**Research:** R-089, R-090, R-093, R-094, R-095, R-096, R-097, R-098, R-102, R-103
**Files:** `pmo-frontend/pages/coi/index.vue`

### LLL-A: KPI Cards — Compact 5-Card Row (Remove Delayed)

**Goal:** Reduce 8 KPI cards to 5 compact cards. Remove "Delayed" card. Downsize typography.

**Current 8 cards:** Total, Published, Delayed, Under Construction, Planning, Completed, On Hold, Suspended

**Proposed 5 cards:** Total Projects, Published, Under Construction, Completed, Pending Review

**Changes to `pmo-frontend/pages/coi/index.vue` — KPI row section:**
- Remove "Delayed" card (card 3)
- Remove "On Hold" card (card 7)
- Add "Pending Review" card: value from `analyticsSummary?.by_publication_status` where status = PENDING_REVIEW
- Change all KPI card value class from `text-h4 font-weight-bold` to `text-h6 font-weight-bold`
- Change all KPI card `v-icon size="32"` to `size="20"`
- Change all KPI card label class from `text-body-2` to `text-caption text-grey-darken-1`
- Update `cols="12" sm="6" md="3"` to `cols="12" sm="6" md="4" lg="auto"` for 5 cards to fill row evenly (or use md="2" for 6 per row on lg)

**Card definitions (5-card row):**

| # | Label | Value Source | Icon | Color |
|---|---|---|---|---|
| 1 | Total Projects | `analyticsSummary.total` | mdi-office-building | primary |
| 2 | Published | `analyticsSummary.by_publication_status[PUBLISHED]` | mdi-check-decagram | success |
| 3 | Under Construction | `analyticsSummary.by_status[UNDER_CONSTRUCTION]` | mdi-hard-hat | warning |
| 4 | Completed | `analyticsSummary.by_status[COMPLETED]` | mdi-check-circle | success |
| 5 | Pending Review | `analyticsSummary.by_publication_status[PENDING_REVIEW]` | mdi-clock-outline | info |

**Acceptance:**
- [ ] 5 KPI cards visible (not 8)
- [ ] "Delayed" card removed
- [ ] "On Hold" card removed
- [ ] All KPI values use text-h6 font-weight-bold
- [ ] All icons use size="20"
- [ ] Labels use text-caption

---

### LLL-B: Project Table — Add Default Columns (Fund Source, Project Code, End Date)

**Goal:** Add Fund Source, Project Code, and Original Completion Date to default visible columns.

**Changes to `pmo-frontend/pages/coi/index.vue` — `headers` computed / array:**

Update the headers array to include (in order):
1. Project Name (existing)
2. Project Code (NEW — `key: 'projectCode'`)
3. Campus (existing)
4. Status (existing)
5. Publication (existing)
6. Fund Source (NEW — `key: 'fundSource'`)
7. Orig. End (NEW — `key: 'originalCompletionDate'`, format: date string)
8. Contract Amount (existing)
9. Progress (existing)
10. Actions (existing)

Add `optional: true` flag metadata to enable Column Manager in LLL-C.

**Acceptance:**
- [ ] Project Code column visible in table by default
- [ ] Fund Source column visible in table by default
- [ ] Orig. End column visible in table by default
- [ ] Existing columns unchanged

---

### LLL-C: Column Manager — v-menu Checkbox Selector + localStorage

**Goal:** Add column visibility toggle for optional columns. Persist selections in localStorage.

**Changes to `pmo-frontend/pages/coi/index.vue`:**

Add `hiddenColumns = ref<Set<string>>(new Set())` initialized from localStorage `coi_hidden_columns`.

Update headers to use the ALL_COLUMNS + filter pattern:
```ts
const ALL_COLUMNS = [
  { title: 'Project Name', key: 'projectName', sortable: true },
  { title: 'Project Code', key: 'projectCode', optional: true },
  { title: 'Campus', key: 'campus' },
  { title: 'Status', key: 'status' },
  { title: 'Publication', key: 'publicationStatus' },
  { title: 'Fund Source', key: 'fundSource' },
  { title: 'Orig. End', key: 'originalCompletionDate', optional: true },
  { title: 'Contract Amount', key: 'totalContractAmount' },
  { title: 'Progress', key: 'physicalAccomplishment' },
  // additional optional columns
  { title: 'Original Start', key: 'originalStartDate', optional: true },
  { title: 'Revised End', key: 'revisedCompletionDate', optional: true },
  { title: 'Contractor', key: 'contractor', optional: true },
  { title: 'Created', key: 'createdAt', optional: true },
  { title: 'Actions', key: 'actions', sortable: false },
]
const hiddenColumns = ref<Set<string>>(
  new Set(JSON.parse(localStorage.getItem('coi_hidden_columns') || '[]'))
)
const headers = computed(() =>
  ALL_COLUMNS.filter(c => !(c as any).optional || !hiddenColumns.value.has(c.key))
)
watch(hiddenColumns, (v) => {
  localStorage.setItem('coi_hidden_columns', JSON.stringify([...v]))
}, { deep: true })
```

Add column manager `v-menu` trigger button in the filter bar area (before the filter chip row):
```html
<v-menu :close-on-content-click="false">
  <template #activator="{ props }">
    <v-btn v-bind="props" icon="mdi-table-column-plus-after" size="small" variant="tonal" density="compact" />
  </template>
  <v-list density="compact" min-width="200">
    <v-list-subheader>Toggle Columns</v-list-subheader>
    <v-list-item v-for="col in ALL_COLUMNS.filter(c => c.optional)" :key="col.key">
      <template #prepend>
        <v-checkbox
          :model-value="!hiddenColumns.has(col.key)"
          @update:model-value="v => v ? hiddenColumns.delete(col.key) : hiddenColumns.add(col.key)"
          density="compact" hide-details
        />
      </template>
      <v-list-item-title>{{ col.title }}</v-list-item-title>
    </v-list-item>
  </v-list>
</v-menu>
```

Wrap `v-data-table` in `<div style="overflow-x:auto">` to support horizontal scroll for many columns.

**Acceptance:**
- [ ] Column Manager button visible in filter bar
- [ ] Clicking button shows v-menu with optional column checkboxes
- [ ] Toggling checkbox shows/hides column in table
- [ ] Column visibility persists after page reload (localStorage)
- [ ] Table scrolls horizontally when many columns are visible

---

### LLL-D: Recent Activity — Admin-Only Collapsible (Default Collapsed)

**Goal:** Wrap Recent Activity in v-expansion-panels, default collapsed. Lazy-fetch on first expand.

**Changes to `pmo-frontend/pages/coi/index.vue`:**
- Add `activityExpanded = ref<number[]>([])` (empty = collapsed)
- Wrap existing Recent Activity content in:
```html
<template v-if="canViewActivity">
  <v-expansion-panels v-model="activityExpanded" variant="accordion" class="mb-4">
    <v-expansion-panel>
      <v-expansion-panel-title>
        <v-icon size="16" class="mr-2">mdi-history</v-icon>
        <span class="text-subtitle-2">System Activity</span>
        <v-chip v-if="activityLogs.length" size="x-small" class="ml-2">{{ activityLogs.length }}</v-chip>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <!-- existing activity logs content -->
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>
```
- Remove `fetchRecentActivity()` from `onMounted()`
- Add `watch(activityExpanded, (v) => { if (v.length && !activityLogs.value.length) fetchRecentActivity() })`

**Acceptance:**
- [ ] Recent Activity section hidden from Staff/Contractor
- [ ] Recent Activity section shows as collapsed panel for Admin by default
- [ ] Activity logs load only when panel is first expanded
- [ ] Activity count badge shows after loaded

---

### LLL-E: Filter Bar — Simplification to 3-Tier Architecture

**Goal:** Primary 3 filters always visible; advanced collapse shows 3 fields only; full search dialog for power users.

**Changes to `pmo-frontend/pages/coi/index.vue` — filter section:**

**Primary filters (unchanged, always visible):** Search text field, Status v-select, Campus v-select

**Advanced collapse panel (simplified to 3 fields):**
```html
<v-expansion-panels v-model="advancedOpen" variant="accordion">
  <v-expansion-panel>
    <v-expansion-panel-title class="text-caption">Advanced Filters</v-expansion-panel-title>
    <v-expansion-panel-text>
      <v-row dense>
        <v-col cols="12" sm="4">
          <v-select v-model="selectedYear" :items="fiscalYearOptions" label="Fiscal Year" density="compact" clearable />
        </v-col>
        <v-col cols="12" sm="4">
          <v-text-field v-model="dateFrom" type="date" label="Date From" density="compact" clearable />
        </v-col>
        <v-col cols="12" sm="4">
          <v-text-field v-model="dateTo" type="date" label="Date To" density="compact" clearable />
        </v-col>
      </v-row>
    </v-expansion-panel-text>
  </v-expansion-panel>
</v-expansion-panels>
```

**Full search dialog trigger:** Add `mdi-filter-cog` icon button next to the filter bar that opens a `v-dialog` containing all 9 original advanced filter fields (Project Code + all 4 date range pairs). This is for power users who need precise date filtering.

Remove the existing advanced filter panel with 9 fields; replace with the 3-field simplified version above. Move all 9 original fields into the dialog.

**Acceptance:**
- [ ] Primary 3 filters (Search, Status, Campus) always visible
- [ ] Advanced collapse shows exactly 3 fields (Year, Date From, Date To)
- [ ] "Advanced Search" icon button opens dialog with all 9 original filter fields
- [ ] All existing filter functionality preserved (no filtering capability lost)

---

### LLL-F: Section Banners

**Goal:** Add section banners above KPI row and above project table per brief.

**Changes to `pmo-frontend/pages/coi/index.vue`:**

Before KPI row:
```html
<div class="d-flex align-center mb-3">
  <div>
    <div class="text-subtitle-1 font-weight-bold">Portfolio Summary</div>
    <div class="text-caption text-grey-darken-1">Real-time overview of infrastructure project metrics across all campuses.</div>
  </div>
</div>
```

Before project table (after filter bar):
```html
<div class="d-flex align-center mb-2">
  <div>
    <div class="text-subtitle-2 font-weight-bold">Project List</div>
    <div class="text-caption text-grey-darken-1">{{ filteredProjects.length }} project{{ filteredProjects.length !== 1 ? 's' : '' }} — use filters to narrow results.</div>
  </div>
</div>
```

**Acceptance:**
- [ ] "Portfolio Summary" label + subtitle visible above KPI row
- [ ] "Project List" label + dynamic count visible above table
- [ ] No banner displayed on analytics tab (banners on overview tab only)

---

### LLL-G: Remove Negative Monitoring Panels from Landing

**Goal:** Remove "Needs Attention" and "Slow-Moving Projects" panels from the portfolio landing tab. Retain data only in the Analytics tab.

**Changes to `pmo-frontend/pages/coi/index.vue`:**
- Remove the Executive Monitoring row (`v-row` containing "Needs Attention" v-card + "Slow-Moving Projects" v-card)
- Remove refs: `needsAttention`, `slowMovingProjects` (or retain if used in Analytics tab)
- Remove computed derivations for these lists if they are ONLY used by the now-removed panels
- Verify Analytics tab still shows relevant status distribution data (it does — via status donut)

**Acceptance:**
- [ ] "Needs Attention" panel not visible on portfolio (Overview) tab
- [ ] "Slow-Moving Projects" panel not visible on portfolio (Overview) tab
- [ ] Analytics tab status distribution unchanged
- [ ] No JavaScript errors after removal

---

### LLL-H: Hero Analytics Strip — Remove (Duplicate Data)

**Goal:** Remove the hero analytics strip (EEE-A) which duplicates data already shown in KPI cards above and Analytics tab below.

**Changes to `pmo-frontend/pages/coi/index.vue`:**
- Remove the full hero analytics strip section (budget total, progress bar, status chips row)
- Confirm KPI cards already show total, published, under construction, completed, pending review

**Note:** If hero strip contains any data point NOT covered by the 5-card KPI row, retain that specific data point only (do not remove information that has no other representation).

**Acceptance:**
- [ ] Hero analytics strip not visible on portfolio tab
- [ ] KPI cards still show all key metrics
- [ ] Page loads without JavaScript errors

---

### LLL Verification Checklist

- [ ] LLL-A: 5 KPI cards visible (Total, Published, Under Construction, Completed, Pending Review)
- [ ] LLL-A: All KPI values text-h6, icons size=20
- [ ] LLL-B: Project Code, Fund Source, Orig. End visible in table by default
- [ ] LLL-C: Column Manager v-menu button visible in filter area
- [ ] LLL-C: Toggling columns persists via localStorage
- [ ] LLL-C: Table scrolls horizontally when needed
- [ ] LLL-D: Recent Activity collapsible, default collapsed, admin-only
- [ ] LLL-D: Activity logs load lazily on first expand
- [ ] LLL-E: Primary 3 filters always visible
- [ ] LLL-E: Advanced collapse shows 3 fields only
- [ ] LLL-E: Full search dialog opens with all original fields
- [ ] LLL-F: "Portfolio Summary" banner above KPI row
- [ ] LLL-F: "Project List" banner with dynamic count above table
- [ ] LLL-G: Needs Attention + Slow-Moving panels removed from Overview tab
- [ ] LLL-H: Hero analytics strip removed
- [ ] vue-tsc 0 new errors

---

## Phase MMM — Dashboard Platform Modernization

> **Status:** ✅ Phase 3 COMPLETE (2026-06-08) — vue-tsc + tsc 0 new errors. **Backend restart required** for MMM-A (analytics SQL fix + extended list query).
> **Research:** R-104–R-113 (research.md)
> **Scope:** Backend analytics API fix, UO trend charts, sidebar reorder + spacing, user menu, Activity Logs RBAC, COI filter banner, column manager extensions, tooltips
> **Files touched:** `construction-projects.service.ts`, `utils/adapters.ts`, `pages/dashboard.vue`, `pages/coi/index.vue`, `layouts/default.vue`, `middleware/permission.ts`
> **Migrations:** None
> **Reconciliation (D-MMM-1):** MMM-I required the COI list endpoint to actually return `project_duration`, `updated_at`, joined `funding_sources.name` + `contractors.name` — these were absent from the list SELECT (Fund Source/Contractor columns added in LLL were rendering empty). Extended the list query + adapter rather than ship empty columns. Route path unchanged (constraint preserved).

---

### MMM-A: Fix `getAnalyticsSummary()` — SQL Column Errors

**File:** `pmo-backend/src/construction-projects/construction-projects.service.ts`
**Research:** R-104, R-105

**Root cause:** Two raw SQL queries in `getAnalyticsSummary()` reference non-existent columns. Since `Promise.all([...6 queries...])` rejects on any failure, the entire endpoint returns HTTP 500 — causing AdminKpiRow, dashboard Infrastructure mini-summary, and COI analytics to show zeros/nulls.

**Fix 1 — `funding_source_name`:**
Replace the failing query:
```sql
SELECT funding_source_name, COUNT(*) as count, ...
FROM construction_projects
WHERE deleted_at IS NULL AND funding_source_name IS NOT NULL
GROUP BY funding_source_name ORDER BY count DESC
```
With a JOIN:
```sql
SELECT fs.name as funding_source_name, COUNT(*) as count,
       COALESCE(SUM(cp.contract_amount),0) as total_contract
FROM construction_projects cp
LEFT JOIN funding_sources fs ON cp.funding_source_id = fs.id
WHERE cp.deleted_at IS NULL AND fs.name IS NOT NULL
GROUP BY fs.name ORDER BY count DESC
```

**Fix 2 — `contractor_name`:**
Column in `construction_projects` is `contractor` (not `contractor_name`).
Replace: `SELECT contractor_name, ...` → `SELECT contractor as contractor_name, ...`
Replace filter: `AND contractor_name IS NOT NULL` → `AND contractor IS NOT NULL`
Replace group: `GROUP BY contractor_name` → `GROUP BY contractor`

**Expected outcome:** Endpoint returns 200 with `by_funding_source` and `by_contractor` arrays populated. AdminKpiRow shows real counts. Infrastructure Portfolio mini-summary shows real totals.

---

### MMM-B: UO Trend Charts — Resize Fix

**File:** `pmo-frontend/pages/dashboard.vue`
**Research:** R-106

**Issue:** ApexCharts inside `v-expansion-panels` (default collapsed) does not remeasure chart dimensions when the panel opens — renders with 0-height or clipped chart.

**Fix:** On the `v-expansion-panel-text` container wrapping the trend charts, use Vue's `v-if` tied to `trendsExpanded` state so the chart is only mounted when the panel is open (mount-on-expand, unmount-on-collapse). This forces a fresh render with correct dimensions.

**Implementation:**
```html
<v-expansion-panels v-model="trendsExpanded" ...>
  <v-expansion-panel>
    <v-expansion-panel-text>
      <div v-if="trendsExpanded.includes(0)">
        <!-- JJJ-A chart -->
        <!-- JJJ-B chart -->
      </div>
    </v-expansion-panel-text>
  </v-expansion-panel>
</v-expansion-panels>
```
Add `const trendsExpanded = ref<number[]>([])` replacing the existing `v-expansion-panels` that was already added in KKK-C.

---

### MMM-C: Sidebar Navigation Reorder

**File:** `pmo-frontend/layouts/default.vue`
**Research:** R-107 (Section F)

**Required order:** Dashboard → University Operations → Infrastructure Projects → Repair Projects → GAD Parity

**Change:** In `mainModules` computed `allModules` array, reorder to:
1. Dashboard
2. University Operations (moved from index 3 → index 1)
3. Infrastructure Projects (moved from index 1 → index 2)
4. Repair Projects (stays at index 3)
5. GAD Parity (stays at index 4)

No logic changes — pure array reorder.

---

### MMM-D: Sidebar Header Compact Spacing

**File:** `pmo-frontend/layouts/default.vue`
**Research:** R-107 (Section D1)

**Change:** `<div class="d-flex align-center px-2 py-2">` → `<div class="d-flex align-center px-2 py-1">`

Reduces vertical padding by 8px (~25% height reduction). Preserves logo size and responsive behavior.

---

### MMM-E: User Menu Enhancements

**File:** `pmo-frontend/layouts/default.vue`
**Research:** R-108 (Section D2)

Add 3 menu items to the user dropdown `v-list` between the divider and Logout:
1. **My Profile** — `prepend-icon="mdi-account-circle"` → navigates to `/profile`
2. **Account Settings** — `prepend-icon="mdi-cog-outline"` → navigates to `/profile?tab=settings`
3. **Change Password** — `prepend-icon="mdi-lock-reset"` → navigates to `/profile?tab=security`

Add a second `v-divider` before Logout. Items not shown to contractors (`v-if="!isContractor"`).

Profile page creation is deferred — the menu items will show but route to `/profile` which may not exist yet (404 is acceptable for now; creates the navigation affordance).

---

### MMM-F: Activity Logs RBAC — Frontend Page Guard

**File:** `pmo-frontend/middleware/permission.ts`
**Research:** R-109 (Section E)

**Gap:** `/coi/activity-logs` has no guard in permission.ts — any authenticated user can navigate directly via URL.

**Fix:** Add explicit route guard before the edit/create route checks:
```typescript
// Activity Logs — Admin/SuperAdmin only
if (to.path.startsWith('/coi/activity-logs')) {
  if (!isAdmin.value && !isSuperAdmin.value) {
    console.warn('[Permission] Access denied to /coi/activity-logs - insufficient permissions')
    return navigateTo('/dashboard')
  }
}
```

Backend is already protected (`@Roles('SuperAdmin', 'Admin', 'Auditor')`). This is a UX-layer guard consistent with the existing pattern.

---

### MMM-G: COI Quick Actions — Remove "Review Projects" Button

**File:** `pmo-frontend/pages/coi/index.vue`
**Research:** R-110 (Section B1)

**Change:** Remove the "Review Projects" `v-btn` (line 805-808) from the GGG-B quick actions strip. Retain: New Project, Portfolio Analytics, Public View. The pending review count is already surfaced in the LLL-A KPI card.

Restructure the strip to use `d-flex align-center justify-space-between` layout: actions (New Project) on the left, navigation actions (Portfolio Analytics, Public View) on the right.

---

### MMM-H: COI Filter Bar — Instructional Banner

**File:** `pmo-frontend/pages/coi/index.vue`
**Research:** R-111 (Section B2)

Add a dismissible instructional `v-alert` above the filter row (below the "Project List" section banner). Text: "Filter projects by status, campus, funding source, and timeline to refine portfolio analysis."

```html
<v-alert
  v-if="!filterBannerDismissed"
  type="info"
  variant="tonal"
  density="compact"
  closable
  class="mb-3"
  @click:close="dismissFilterBanner"
>
  Filter projects by status, campus, funding source, and timeline to refine portfolio analysis.
</v-alert>
```

Add `filterBannerDismissed = ref(false)` + `dismissFilterBanner()` + `onMounted` localStorage read for `coi_filter_banner_dismissed`.

---

### MMM-I: Column Manager Extensions + KPI Tooltips

**File:** `pmo-frontend/pages/coi/index.vue`
**Research:** R-112, R-113

**Column additions (append to `ALL_COLUMNS`):**
- `{ title: 'Revised Start', key: 'revisedStartDate', sortable: true, optional: true }`
- `{ title: 'Duration', key: 'projectDuration', sortable: false, optional: true }`
- `{ title: 'Updated', key: 'updatedAt', sortable: true, optional: true }`

Add to `DEFAULT_HIDDEN`: `'revisedStartDate'`, `'projectDuration'`, `'updatedAt'`

Add item slot templates for `revisedStartDate`, `projectDuration`, `updatedAt` with appropriate formatting.

**KPI card tooltips:** Wrap each of the 5 KPI cards in `v-tooltip` with `location="bottom"` providing contextual tooltip text per R-113.

---

### MMM Verification Checklist

- [ ] MMM-A: `GET /api/construction-projects/analytics/summary` returns 200 (no 500)
- [ ] MMM-A: AdminKpiRow shows real counts (not zeros)
- [ ] MMM-A: Infrastructure Portfolio mini-summary shows real values on dashboard
- [ ] MMM-B: UO trend charts render correctly when expansion panel is opened
- [ ] MMM-C: Sidebar order: Dashboard → University Operations → Infrastructure → Repair → GAD
- [ ] MMM-D: Sidebar header is visually more compact than before
- [ ] MMM-E: User menu shows My Profile, Account Settings, Change Password items
- [ ] MMM-F: Non-admin navigating to `/coi/activity-logs` is redirected to dashboard
- [ ] MMM-G: "Review Projects" button removed; 3-button strip remains
- [ ] MMM-H: Filter instructional banner visible, dismissible, persists dismiss state
- [ ] MMM-I: Revised Start, Duration, Updated toggleable via Column Manager
- [ ] MMM-I: KPI cards show tooltips on hover
- [ ] vue-tsc 0 new errors

---

## Phase NNN — Visual Intelligence Platform Modernization

> **Status:** ✅ Phase 3 COMPLETE (2026-06-08) — vue-tsc + tsc 0 new errors. **Backend restart required** (NNN-G/H auth endpoints).
> **Reconciliation (D-NNN-1):** Fixed MMM-B regression discovered during NNN-C — `v-expansion-panels` bound to a `number[]` model requires the `multiple` prop; without it Vuetify sets the model to a scalar and `trendsExpanded.includes(0)` never evaluates true, so the trend charts never mounted. Added `multiple`. (D-NNN-2): System Administration group gated by `canManageUsers` (not raw `isSuperAdmin`) to preserve existing User Management access semantics.
> **Research:** R-114–R-125 (research.md)
> **Scope:** VERIFY_STEP corrections, gray background, dashboard sections, sidebar restructure, avatar surfacing, change-password full-stack, profile page
> **Files touched:** `layouts/default.vue`, `pages/dashboard.vue`, `components/AdminKpiRow.vue`, `pages/coi/index.vue`, `middleware/permission.ts`, `utils/adapters.ts`, `stores/auth.ts`, `auth.controller.ts`, `auth.service.ts`, `pages/profile.vue` (new)
> **Migrations:** None (avatarUrl column already exists on users table)

---

### NNN-A: VERIFY_STEP — Restore Sidebar Logo (MMM-D Overcorrection)

**File:** `pmo-frontend/layouts/default.vue`
**Research:** R-114

**Section C1 constraint:** "DO NOT reduce drawer height. DO NOT compress branding vertically. ONLY reduce horizontal spacing between logo and title (~50%)."

**MMM-D change that violated the constraint:** Logo size 44→40. The `py-2` revert was handled by linter. The `me-2`→`me-1` change is correct (horizontal gap reduction).

**Fix:** Restore `width="44" height="44"` on the logo `v-img`. Keep `me-1`. Keep `py-2`. Result: header height unchanged, branding proportions unchanged, horizontal gap reduced from 8px to 4px (~50%).

---

### NNN-B: App Dashboard Background

**File:** `pmo-frontend/layouts/default.vue`
**Research:** R-116, R-123

**Change:** Add `class="bg-grey-lighten-5"` to `<v-main>`. Grey-lighten-5 (#FAFAFA) provides subtle visual separation between background and white elevated cards without harsh contrast.

This is a single-line change to the layout. All pages using the default layout benefit automatically.

---

### NNN-C: Dashboard Section Structure + Card Elevation

**File:** `pmo-frontend/pages/dashboard.vue`
**Research:** R-117, R-118

**Three changes:**

**C.1 — Section labels:** Add a labeled section divider before each major card block:
```html
<div class="d-flex align-center ga-2 mb-3 mt-2">
  <v-icon size="16" color="grey-darken-2">mdi-office-building</v-icon>
  <span class="text-caption text-grey-darken-2 font-weight-bold text-uppercase tracking-wide">Infrastructure Portfolio</span>
  <v-divider class="flex-grow-1 ml-2" />
</div>
```
Apply before: Infrastructure card, UO card, Quick Actions card.

**C.2 — Infrastructure card elevation:** Remove `variant="outlined"` → gains default `elevation="2"`. Add `rounded="lg"` for radius consistency with UO card.

**C.3 — UO card:** Add `rounded="lg"` + `elevation="1"` explicitly (currently implicit default). Add `border` prop for hover feedback.

---

### NNN-D: AdminKpiRow Tooltips

**File:** `pmo-frontend/components/AdminKpiRow.vue`
**Research:** R-122

Wrap each tile `v-card` in a `v-tooltip` (same pattern as MMM-I COI index):
- Infrastructure Projects: total portfolio count, all statuses
- Published Projects: approved + visible on public portal
- Pending Reviews: awaiting admin approval decision
- UO Compliance Rate: average accomplishment rate across all pillars, selected FY

Add `cursor: help` style to tile cards to indicate tooltip presence.

---

### NNN-E: Sidebar Section Restructure

**File:** `pmo-frontend/layouts/default.vue`
**Research:** R-120

Replace the single `Administration` dropdown with two distinct groups using `v-list-subheader` separators:

**Group 1 — Operations & Monitoring** (visible to Admin + SuperAdmin = `canAccessAdmin`):
- Pending Reviews (`mdi-clipboard-check-outline`)
- COI Activity Logs (`mdi-history`)

**Group 2 — System Administration** (visible to SuperAdmin only = `isSuperAdmin`):
- User Management (`mdi-account-group`)

Remove the single collapsible `v-list-group`. Replace with two separate `v-list` sections each headed by a `v-list-subheader`. This gives immediate visual clarity — Admins see their operational items; SuperAdmins see both groups.

---

### NNN-F: Avatar Surfacing in User Menu + Adapter

**Files:** `pmo-frontend/utils/adapters.ts`, `pmo-frontend/stores/auth.ts`, `pmo-frontend/layouts/default.vue`
**Research:** R-119, R-122

**Three-part change:**

**F.1 — `BackendUser` + `UIUser` types:** Add `avatar_url?: string` to `BackendUser`; add `avatarUrl: string` to `UIUser`.

**F.2 — `adaptUser()`:** Map `avatarUrl: backend.avatar_url || ''`.

**F.3 — `default.vue` user menu:** Replace the initials `v-avatar` with a conditional render:
```html
<v-avatar color="secondary" size="32" class="mr-2">
  <v-img v-if="authStore.user?.avatarUrl" :src="authStore.user.avatarUrl" alt="Profile" />
  <span v-else class="text-caption font-weight-bold text-primary">
    {{ authStore.userFullName?.charAt(0) || 'U' }}
  </span>
</v-avatar>
```

**F.4 — Add `userAvatarUrl` computed to auth store:**
```typescript
const userAvatarUrl = computed(() => user.value?.avatarUrl || '')
```
Expose in return object.

---

### NNN-G: Backend — Change Password Endpoint

**File:** `pmo-backend/src/auth/auth.service.ts`, `pmo-backend/src/auth/auth.controller.ts`
**Research:** R-124

**auth.service.ts — Add `changePassword(userId, dto)`:**
```typescript
async changePassword(userId: string, dto: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<{ message: string }> {
  if (dto.newPassword !== dto.confirmPassword)
    throw new BadRequestException('New passwords do not match');
  const user = await this.em.findOne(User, { id: userId });
  if (!user) throw new NotFoundException('User not found');
  if (user.googleId && !user.passwordHash)
    throw new BadRequestException('Account uses Google Sign-In — password change not available');
  const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash || '');
  if (!isValid) throw new BadRequestException('Current password is incorrect');
  if (dto.newPassword === dto.currentPassword)
    throw new BadRequestException('New password must differ from current password');
  user.passwordHash = await bcrypt.hash(dto.newPassword, 12);
  user.lastPasswordChangeAt = new Date();
  await this.em.flush();
  this.logger.log(`PASSWORD_CHANGE: user_id=${userId}`);
  return { message: 'Password changed successfully' };
}
```

**auth.controller.ts — Add `POST /auth/change-password`:**
```typescript
@UseGuards(JwtAuthGuard)
@Post('change-password')
@HttpCode(HttpStatus.OK)
@Throttle({ default: { limit: 3, ttl: 600000 } }) // 3 per 10 minutes
async changePassword(@CurrentUser() user: JwtPayload, @Body() body: { currentPassword: string; newPassword: string; confirmPassword: string }) {
  return this.authService.changePassword(user.sub, body);
}
```

---

### NNN-H: Backend — Profile Update Endpoint

**File:** `pmo-backend/src/auth/auth.service.ts`, `pmo-backend/src/auth/auth.controller.ts`
**Research:** R-125

**auth.service.ts — Add `updateProfile(userId, dto)`:**
```typescript
async updateProfile(userId: string, dto: { displayName?: string; phone?: string }): Promise<any> {
  const user = await this.em.findOne(User, { id: userId });
  if (!user) throw new NotFoundException('User not found');
  if (dto.displayName !== undefined) user.displayName = dto.displayName;
  if (dto.phone !== undefined) user.phone = dto.phone;
  await this.em.flush();
  return this.getProfile(userId);
}
```

**auth.controller.ts — Add `PATCH /auth/me`:**
```typescript
@UseGuards(JwtAuthGuard)
@Patch('me')
@HttpCode(HttpStatus.OK)
async updateProfile(@CurrentUser() user: JwtPayload, @Body() body: { displayName?: string; phone?: string }) {
  return this.authService.updateProfile(user.sub, body);
}
```

Also ensure `getProfile()` return includes `phone` and `display_name` fields, and that `BackendUser` type is updated to include them.

---

### NNN-I: Frontend — Profile Page (`/profile`)

**File:** `pmo-frontend/pages/profile.vue` (new file)
**Research:** R-125

**Page structure — 2-tab layout:**

**Tab 1: Account Overview**
- Avatar display (circular, large 80px): `v-img` if `avatarUrl` exists, else large initials
- Avatar upload placeholder button (shows "Upload coming soon" tooltip)
- User info display: Full Name, Email (readonly), Campus, Role chip
- Editable fields: Display Name, Phone (via inline edit + PATCH /auth/me)
- Last Login timestamp (from `lastLoginAt` if returned by /auth/me)
- "Save Changes" button

**Tab 2: Security**
- Change Password form:
  - Current Password (password input)
  - New Password (password input with strength indicator)
  - Confirm New Password
  - Submit button → `POST /auth/change-password`
- Last password changed: `lastPasswordChangeAt` display (from /auth/me response)
- SSO notice: if user has no passwordHash + has googleId → show info alert, disable form

**Page meta:** `middleware: ['auth']`

**`getProfile()` response additions needed:** add `phone`, `display_name`, `last_password_change_at`, `last_login_at`, `google_id` (boolean flag only, not the actual ID) to return object.

---

### NNN-J: COI Dashboard Section Spacing

**File:** `pmo-frontend/pages/coi/index.vue`
**Research:** R-121

**Three targeted changes:**

**J.1 — Filter bar card:** Change `variant="outlined"` → `elevation="1" rounded="lg"` (consistent with dashboard after NNN-B background change).

**J.2 — Executive overview cards (Cost Utilization, Campus bars, Upcoming Completions):** Change `variant="outlined"` → `elevation="1" rounded="lg"`.

**J.3 — Section labels enhancement:** Upgrade the "Portfolio Summary" and "Project List" section headers to use the labeled divider pattern from NNN-C:
```html
<div class="d-flex align-center ga-2 mb-3">
  <v-icon size="14" color="grey-darken-2">mdi-chart-box</v-icon>
  <span class="text-caption font-weight-bold text-grey-darken-2 text-uppercase">Portfolio Summary</span>
  <v-divider class="flex-grow-1 ml-1" />
</div>
```

---

### NNN Verification Checklist

- [ ] NNN-A: Sidebar logo restored to 44×44, header height unchanged
- [ ] NNN-B: Dashboard background is off-white (grey-lighten-5), cards visibly float above background
- [ ] NNN-C: Section labels visible before Infrastructure, UO, Quick Actions sections
- [ ] NNN-C: Infrastructure card has elevation, not outlined border
- [ ] NNN-D: AdminKpiRow tiles show tooltips on hover
- [ ] NNN-E: Sidebar shows "Operations & Monitoring" (Admin+SA) and "System Administration" (SA only) as separate flat groups
- [ ] NNN-F: User avatar renders from API when present; falls back to initials
- [ ] NNN-G: `POST /api/auth/change-password` returns 200 with valid credentials
- [ ] NNN-G: `POST /api/auth/change-password` returns 400 with wrong current password
- [ ] NNN-H: `PATCH /api/auth/me` updates displayName and phone
- [ ] NNN-I: `/profile` page loads (Overview + Security tabs)
- [ ] NNN-I: Change password form submits and shows success/error toast
- [ ] NNN-J: COI filter and executive cards have elevation on grey background
- [ ] NNN-J: COI section labels use enhanced divider style
- [ ] vue-tsc 0 new errors
- [ ] tsc (backend) 0 errors

