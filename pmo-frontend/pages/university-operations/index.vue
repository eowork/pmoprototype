<script setup lang="ts">
/**
 * Phase DA-B + DE-C: University Operations Landing Page with Analytics Dashboard
 *
 * This is the main entry point for University Operations.
 * It displays two category cards:
 * - Physical Accomplishments (BAR No. 1)
 * - Financial Accomplishments (BAR No. 2) - DEFERRED
 *
 * Phase DE-C: Analytics Dashboard with ApexCharts visualizations
 * - Pillar accomplishment summary (radial bar)
 * - Quarterly trend (line chart)
 * - Yearly comparison (bar chart)
 */

import VueApexCharts from 'vue3-apexcharts'

definePageMeta({
  middleware: ['auth', 'permission'],
})

const router = useRouter()
const route = useRoute()
const api = useApi()
const toast = useToast()
const { canAdd, isAdmin, isSuperAdmin } = usePermissions()

// Phase DW-B: Centralized fiscal year store
import { useFiscalYearStore } from '~/stores/fiscalYear'
import { storeToRefs } from 'pinia'

const fiscalYearStore = useFiscalYearStore()
const { selectedFiscalYear, fiscalYearOptions } = storeToRefs(fiscalYearStore)

// Phase DW-B: Fiscal year creation permission
const canCreateFiscalYear = computed(() => {
  return isSuperAdmin.value || (isAdmin.value && canAdd('operations'))
})

// Fixed Pillar Definitions (BAR1 Standard)
const PILLARS = [
  { id: 'HIGHER_EDUCATION', name: 'Higher Education', fullName: 'Higher Education Program', icon: 'mdi-school', color: '#1976D2' },
  { id: 'ADVANCED_EDUCATION', name: 'Advanced Ed', fullName: 'Advanced Education Program', icon: 'mdi-book-education', color: '#7B1FA2' },
  { id: 'RESEARCH', name: 'Research', fullName: 'Research Program', icon: 'mdi-flask', color: '#00897B' },
  { id: 'TECHNICAL_ADVISORY', name: 'Extension', fullName: 'Technical Advisory Extension', icon: 'mdi-handshake', color: '#F57C00' },
] as const

// State
const analyticsLoading = ref(true)

// Analytics state
const pillarSummary = ref<any>(null)
const quarterlyTrend = ref<any>(null)
const yearlyComparison = ref<any>(null)

// Phase EE-D: Global pillar filter — controls all analytics charts simultaneously
const selectedGlobalPillar = ref<string>('ALL')
const globalPillarOptions = computed(() => [
  { title: 'All Pillars', value: 'ALL' },
  ...PILLARS.map(p => ({ title: p.name, value: p.id })),
])

// Phase EE-E: Reporting type selector (Physical / Financial)
const selectedReportingType = ref<string>('PHYSICAL')
const reportingTypeOptions = [
  { title: 'Physical Accomplishments (BAR No. 1)', value: 'PHYSICAL' },
  { title: 'Financial Accomplishments (BAR No. 2)', value: 'FINANCIAL' },
]

// Phase DW-B: Fiscal year creation dialog
const fiscalYearDialog = ref(false)
const newFiscalYear = ref<number>(new Date().getFullYear() + 1)
const creatingFiscalYear = ref(false)

// Phase DW-B: Open fiscal year creation dialog
function openFiscalYearDialog() {
  newFiscalYear.value = new Date().getFullYear() + 1
  fiscalYearDialog.value = true
}

// Phase DW-B: Create new fiscal year
async function createFiscalYear() {
  if (!newFiscalYear.value || newFiscalYear.value < 2020 || newFiscalYear.value > 2099) {
    toast.error('Please enter a valid fiscal year (2020-2099)')
    return
  }

  try {
    creatingFiscalYear.value = true
    await fiscalYearStore.createFiscalYear(newFiscalYear.value)
    toast.success(`Fiscal year ${newFiscalYear.value} created successfully`)
    fiscalYearDialog.value = false
    newFiscalYear.value = new Date().getFullYear() + 1
  } catch (error: any) {
    if (error.statusCode === 409) {
      toast.error(`Fiscal year ${newFiscalYear.value} already exists`)
    } else {
      toast.error(error.message || 'Failed to create fiscal year')
    }
  } finally {
    creatingFiscalYear.value = false
  }

  // Phase DW-B: Removed local fetchFiscalYears - now handled by store
}

// Phase DE-C: Fetch analytics data
async function fetchAnalytics() {
  analyticsLoading.value = true
  try {
    const [summaryRes, trendRes, comparisonRes] = await Promise.all([
      api.get<any>(`/api/university-operations/analytics/pillar-summary?fiscal_year=${selectedFiscalYear.value}`),
      api.get<any>(`/api/university-operations/analytics/quarterly-trend?fiscal_year=${selectedFiscalYear.value}${selectedGlobalPillar.value !== 'ALL' ? '&pillar_type=' + selectedGlobalPillar.value : ''}`),
      api.get<any>(`/api/university-operations/analytics/yearly-comparison?years=${fiscalYearOptions.value.slice(0, 3).join(',')}`),
    ])
    pillarSummary.value = summaryRes
    quarterlyTrend.value = trendRes
    yearlyComparison.value = comparisonRes
  } catch (err: any) {
    console.error('[UniOps Analytics] Failed to fetch:', err)
    toast.warning('Analytics data unavailable')
    pillarSummary.value = null
    quarterlyTrend.value = null
    yearlyComparison.value = null
  } finally {
    analyticsLoading.value = false
  }
}

// Phase DE-C + DN-E: Chart configurations with interactive click handlers
const pillarChartOptions = computed(() => ({
  chart: {
    type: 'radialBar' as const,
    height: 280,
    toolbar: { show: false },
    // Phase DN-E: Add click event for pillar drill-down navigation
    events: {
      dataPointSelection: (_event: any, _chartContext: any, config: any) => {
        const pillarIndex = config.dataPointIndex
        if (pillarIndex >= 0 && pillarIndex < PILLARS.length) {
          navigateToPhysical(PILLARS[pillarIndex].id)
        }
      },
      legendClick: (_chartContext: any, seriesIndex: number) => {
        if (seriesIndex >= 0 && seriesIndex < PILLARS.length) {
          navigateToPhysical(PILLARS[seriesIndex].id)
        }
      },
    },
  },
  plotOptions: {
    radialBar: {
      offsetY: 0,
      startAngle: -90,
      endAngle: 270,
      hollow: {
        margin: 5,
        size: '35%',
        background: 'transparent',
      },
      dataLabels: {
        name: {
          show: true,
          fontSize: '14px',
        },
        value: {
          show: true,
          fontSize: '16px',
          formatter: (val: number) => `${val.toFixed(0)}%`,
        },
      },
    },
  },
  colors: PILLARS.map(p => p.color),
  labels: PILLARS.map(p => p.name),
  legend: {
    show: true,
    position: 'bottom' as const,
    horizontalAlign: 'center' as const,
  },
  responsive: [{
    breakpoint: 480,
    options: {
      chart: { height: 260 },
      legend: { show: false },
    },
  }],
}))

// Phase DR-D: Use rate-based accomplishment_rate_pct for radial bar
const pillarChartSeries = computed(() => {
  if (!pillarSummary.value?.pillars) return [0, 0, 0, 0]
  return PILLARS.map(p => {
    const pillarData = pillarSummary.value.pillars.find((ps: any) => ps.pillar_type === p.id)
    return pillarData?.accomplishment_rate_pct || 0
  })
})

const quarterlyTrendOptions = computed(() => ({
  chart: {
    type: 'line' as const,
    height: 280,
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  stroke: {
    curve: 'smooth' as const,
    width: 3,
  },
  colors: ['#1976D2', '#4CAF50'],
  xaxis: {
    categories: ['Q1', 'Q2', 'Q3', 'Q4'],
  },
  yaxis: {
    title: { text: 'Rate Score (Dimensionless)' },
    min: 0,
    labels: {
      formatter: (val: number) => val.toFixed(2),
    },
  },
  legend: {
    position: 'top' as const,
    horizontalAlign: 'center' as const,
  },
  markers: {
    size: 5,
  },
  tooltip: {
    shared: true,
    y: {
      formatter: (val: number) => val.toFixed(4),
    },
  },
}))

// Phase EB-B: Quarterly trend series with descriptive labels
const quarterlyTrendSeries = computed(() => {
  if (!quarterlyTrend.value?.quarters) {
    return [
      { name: 'Indicators with Target', data: [0, 0, 0, 0] },
      { name: 'Achievement Score', data: [0, 0, 0, 0] },
    ]
  }
  const quarters = quarterlyTrend.value.quarters
  return [
    { name: 'Indicators with Target', data: quarters.map((q: any) => q.target_rate || 0) },
    { name: 'Achievement Score', data: quarters.map((q: any) => q.actual_rate || 0) },
  ]
})

// Phase EE-C: YoY chart — all 4 pillars as separate series
const yearlyComparisonOptions = computed(() => ({
  chart: {
    type: 'bar' as const,
    height: 400,
    toolbar: { show: false },
    events: {
      dataPointSelection: (_event: any, _chartContext: any, config: any) => {
        const yearIndex = config.dataPointIndex
        if (yearlyComparison.value?.years && yearIndex >= 0 && yearIndex < yearlyComparison.value.years.length) {
          const selectedYear = yearlyComparison.value.years[yearIndex]?.fiscal_year
          if (selectedYear && selectedYear !== selectedFiscalYear.value) {
            selectedFiscalYear.value = selectedYear
          }
        }
      },
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '60%',
      borderRadius: 4,
    },
  },
  colors: PILLARS.map(p => p.color),
  xaxis: {
    categories: yearlyComparison.value?.years?.map((y: any) => `FY ${y.fiscal_year}`) || [],
  },
  yaxis: {
    title: { text: 'Accomplishment Rate (%)' },
    min: 0,
    max: 120,
    labels: {
      formatter: (val: number) => val.toFixed(0) + '%',
    },
  },
  // Phase EH-D: 100% target reference line
  annotations: {
    yaxis: [{
      y: 100,
      borderColor: '#E53935',
      strokeDashArray: 4,
      label: {
        text: 'Target (100%)',
        position: 'left',
        style: { color: '#E53935', background: 'transparent', fontSize: '11px' },
      },
    }],
  },
  legend: {
    position: 'top' as const,
    horizontalAlign: 'center' as const,
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    y: {
      formatter: (val: number) => val.toFixed(1) + '%',
    },
  },
}))

// Phase EE-C: Year-over-Year series — all 4 pillars as separate series
const yearlyComparisonSeries = computed(() => {
  if (!yearlyComparison.value?.years || yearlyComparison.value.years.length === 0) {
    return PILLARS.map(p => ({ name: p.name, data: [] }))
  }
  const years = yearlyComparison.value.years

  // When specific pillar selected via global filter, show only that pillar
  if (selectedGlobalPillar.value !== 'ALL') {
    const pillar = PILLARS.find(p => p.id === selectedGlobalPillar.value)
    if (!pillar) return [{ name: 'Accomplishment Rate (%)', data: [] }]
    return [{
      name: pillar.name,
      data: years.map((y: any) => {
        const pd = y.pillars?.find((p: any) => p.pillar_type === pillar.id)
        return pd?.accomplishment_rate ?? 0
      }),
    }]
  }

  // ALL: show all 4 pillars as separate series
  return PILLARS.map(pillar => ({
    name: pillar.name,
    data: years.map((y: any) => {
      const pd = y.pillars?.find((p: any) => p.pillar_type === pillar.id)
      return pd?.accomplishment_rate ?? 0
    }),
  }))
})

// Phase EE-D: Target vs Actual pillar filtering via global filter
const targetVsActualPillars = computed(() => {
  return selectedGlobalPillar.value === 'ALL'
    ? PILLARS
    : PILLARS.filter(p => p.id === selectedGlobalPillar.value)
})

// Phase EE-B: Target vs Actual — Achievement Rate (%) visualization
const targetVsActualOptions = computed(() => ({
  chart: {
    type: 'bar' as const,
    height: 280,
    toolbar: { show: false },
    events: {
      dataPointSelection: (_event: any, _chartContext: any, config: any) => {
        const pillars = targetVsActualPillars.value
        const pillarIndex = config.dataPointIndex
        if (pillarIndex >= 0 && pillarIndex < pillars.length) {
          navigateToPhysical(pillars[pillarIndex].id)
        }
      },
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 4,
      dataLabels: {
        position: 'top',
      },
    },
  },
  colors: targetVsActualPillars.value.map(p => p.color),
  xaxis: {
    categories: targetVsActualPillars.value.map(p => p.name),
  },
  yaxis: {
    title: { text: 'Achievement Rate (%)' },
    min: 0,
    max: 120,
    labels: {
      formatter: (val: number) => val.toFixed(0) + '%',
    },
  },
  // Phase EH-C: 100% target reference line
  annotations: {
    yaxis: [{
      y: 100,
      borderColor: '#E53935',
      strokeDashArray: 4,
      label: {
        text: 'Target (100%)',
        position: 'left',
        style: { color: '#E53935', background: 'transparent', fontSize: '11px' },
      },
    }],
  },
  legend: {
    position: 'top' as const,
    horizontalAlign: 'center' as const,
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => val.toFixed(1) + '%',
    offsetY: -20,
    style: { fontSize: '12px', colors: ['#333'] },
  },
  tooltip: {
    y: {
      formatter: (val: number) => val.toFixed(1) + '%',
    },
  },
}))

// Phase EE-B: Achievement Rate (%) per pillar — uses accomplishment_rate_pct from pillarSummary
const targetVsActualSeries = computed(() => {
  const pillars = targetVsActualPillars.value
  if (!pillarSummary.value?.pillars) {
    return [{ name: 'Achievement Rate (%)', data: pillars.map(() => 0) }]
  }
  return [{
    name: 'Achievement Rate (%)',
    data: pillars.map(p => {
      const pd = pillarSummary.value.pillars.find((ps: any) => ps.pillar_type === p.id)
      return pd?.accomplishment_rate_pct || 0
    }),
  }]
})

// Phase DW-B: Watch for fiscal year changes from store
watch(selectedFiscalYear, () => {
  fetchAnalytics()
}, { immediate: false })

// Phase EE-D: Watch for global pillar filter — re-fetch quarterly trend with pillar_type
watch(selectedGlobalPillar, async (newPillar) => {
  try {
    const pillarParam = newPillar !== 'ALL' ? `&pillar_type=${newPillar}` : ''
    const trendRes = await api.get<any>(
      `/api/university-operations/analytics/quarterly-trend?fiscal_year=${selectedFiscalYear.value}${pillarParam}`
    )
    quarterlyTrend.value = trendRes
  } catch (err: any) {
    console.error('[UniOps Analytics] Failed to fetch quarterly trend:', err)
  }
})

// Navigation
function navigateToPhysical(pillarId?: string) {
  router.push({
    path: '/university-operations/physical',
    query: {
      year: selectedFiscalYear.value.toString(),
      ...(pillarId && { pillar: pillarId })
    }
  })
}

function navigateToFinancial() {
  toast.info('Financial Accomplishments coming soon')
}

// Phase DW-B: Initialize from store on mount
onMounted(async () => {
  await fiscalYearStore.fetchFiscalYears()
  fetchAnalytics()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          University Operations
        </h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          Manage BAR reporting and accomplishment tracking
        </p>
      </div>
      <!-- Phase DW-B: Fiscal year controls (selector + Add button) -->
      <div class="d-flex align-center ga-2">
        <v-select
          :model-value="selectedFiscalYear"
          @update:model-value="fiscalYearStore.setFiscalYear"
          :items="fiscalYearOptions"
          label="Fiscal Year"
          density="compact"
          variant="outlined"
          hide-details
          style="width: 130px"
          prepend-inner-icon="mdi-calendar"
        />
        <v-btn
          v-if="canCreateFiscalYear"
          color="success"
          variant="outlined"
          prepend-icon="mdi-calendar-plus"
          @click="openFiscalYearDialog"
        >
          <span class="d-none d-sm-inline">Add Year</span>
          <v-icon class="d-sm-none">mdi-calendar-plus</v-icon>
        </v-btn>
        <!-- Phase EF-C: Admin navigation to User Management -->
        <v-btn
          v-if="isAdmin || isSuperAdmin"
          color="grey-darken-1"
          variant="outlined"
          prepend-icon="mdi-account-cog"
          @click="$router.push('/users')"
        >
          <span class="d-none d-sm-inline">Users</span>
          <v-icon class="d-sm-none">mdi-account-cog</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Category Cards -->
    <v-row class="mb-6">
      <!-- Physical Accomplishments -->
      <v-col cols="12" md="6">
        <v-card
          class="pa-6 h-100 cursor-pointer"
          variant="outlined"
          hover
          @click="navigateToPhysical"
        >
          <div class="d-flex align-center mb-4">
            <v-avatar color="primary" size="56" class="mr-4">
              <v-icon size="28" color="white">mdi-chart-bar</v-icon>
            </v-avatar>
            <div>
              <h2 class="text-h5 font-weight-bold">Physical Accomplishments</h2>
              <p class="text-body-2 text-grey">BAR No. 1</p>
            </div>
          </div>
          <p class="text-body-1 mb-4">
            Quarterly Physical Report of Operations. Track outcome and output indicators
            across the four pillars: Higher Education, Advanced Education, Research, and
            Technical Advisory Extension.
          </p>
          <div class="d-flex align-center text-primary">
            <span class="font-weight-medium">Enter Physical Accomplishments</span>
            <v-icon end>mdi-arrow-right</v-icon>
          </div>
        </v-card>
      </v-col>

      <!-- Financial Accomplishments (DEFERRED) -->
      <v-col cols="12" md="6">
        <v-card
          class="pa-6 h-100"
          variant="outlined"
          disabled
        >
          <div class="d-flex align-center mb-4">
            <v-avatar color="grey" size="56" class="mr-4">
              <v-icon size="28" color="white">mdi-currency-php</v-icon>
            </v-avatar>
            <div>
              <h2 class="text-h5 font-weight-bold text-grey">Financial Accomplishments</h2>
              <p class="text-body-2 text-grey">BAR No. 2</p>
            </div>
          </div>
          <p class="text-body-1 mb-4 text-grey">
            Budget utilization and financial performance tracking. Monitor allotments,
            obligations, and disbursements across fund types.
          </p>
          <div class="d-flex align-center text-grey">
            <v-chip color="grey" variant="tonal" size="small">
              <v-icon start size="small">mdi-clock-outline</v-icon>
              Coming Soon - Phase 2
            </v-chip>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Phase DE-C: Analytics Dashboard -->
    <v-card class="mb-6">
      <v-card-title class="d-flex align-center flex-wrap ga-2">
        <v-icon start color="primary">mdi-chart-areaspline</v-icon>
        Analytics Dashboard - FY {{ selectedFiscalYear }}
        <v-spacer />
        <!-- Phase EE-E: Reporting type selector -->
        <v-select
          v-model="selectedReportingType"
          :items="reportingTypeOptions"
          density="compact"
          variant="outlined"
          hide-details
          style="max-width: 300px"
        />
        <!-- Phase EE-D: Global pillar filter -->
        <v-select
          v-model="selectedGlobalPillar"
          :items="globalPillarOptions"
          density="compact"
          variant="outlined"
          hide-details
          style="max-width: 200px"
        />
      </v-card-title>

      <v-divider />

      <!-- Analytics Loading State -->
      <v-card-text v-if="analyticsLoading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="48" />
        <div class="mt-4 text-grey">Loading analytics...</div>
      </v-card-text>

      <!-- Analytics Charts -->
      <v-card-text v-else>
        <!-- Phase EE-A: Analytics Guide — visible by default, ABOVE charts -->
        <!-- Phase EH-B: Analytics Guide collapsed by default (users expand on demand) -->
        <v-expansion-panels variant="accordion" class="mb-4">
          <v-expansion-panel>
            <v-expansion-panel-title class="text-body-2">
              <v-icon start size="small" color="info">mdi-information-outline</v-icon>
              Analytics Guide — How to Read These Charts
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="text-body-2">
                <p class="font-weight-bold mb-1">Achievement Rate by Pillar (%)</p>
                <p class="mb-3">
                  Displays the <em>Achievement Rate</em> for each pillar, computed as (Total Actual &divide; Total Target) &times; 100. A value above 100% indicates the pillar exceeded its targets. Values are computed dynamically for display — original stored data is never modified.
                </p>

                <p class="font-weight-bold mb-1">Pillar Accomplishment Rates</p>
                <p class="mb-3">
                  Shows the percentage accomplishment rate for each pillar as a radial gauge. A value of 100% means all indicators with targets have fully met their targets on average.
                </p>

                <p class="font-weight-bold mb-1">Quarterly Trend</p>
                <p class="mb-3">
                  Plots the Target Rate and Achievement Score per quarter (Q1–Q4). Use the global pillar filter to see trends for a specific pillar. This reveals whether performance is improving, stable, or declining throughout the fiscal year.
                </p>

                <p class="font-weight-bold mb-1">Year-over-Year Comparison</p>
                <p class="mb-0">
                  Displays all four pillars as separate series across fiscal years, showing each pillar's accomplishment rate (%). This allows direct comparison of pillar performance trends over time. Use the global pillar filter to focus on a specific pillar.
                </p>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- Phase EE-E: Physical accomplishments analytics (active) -->
        <template v-if="selectedReportingType === 'PHYSICAL'">
        <!-- Phase DR-C1: Pillar Completion Overview (FIRST analytics section) -->
        <v-row class="mb-4" v-if="pillarSummary?.pillars">
          <v-col cols="12">
            <div class="text-subtitle-1 font-weight-medium mb-3 d-flex align-center">
              <v-icon start size="small" color="primary">mdi-view-dashboard</v-icon>
              Pillar Completion Overview
            </div>
          </v-col>
          <v-col v-for="pillar in PILLARS" :key="pillar.id" cols="6" md="3">
            <v-card
              variant="outlined"
              class="h-100 cursor-pointer"
              hover
              @click="navigateToPhysical(pillar.id)"
            >
              <v-card-text class="pa-3">
                <div class="d-flex align-center mb-2">
                  <v-avatar :color="pillar.color" size="32" class="mr-2">
                    <v-icon size="18" color="white">{{ pillar.icon }}</v-icon>
                  </v-avatar>
                  <span class="text-subtitle-2 font-weight-medium">{{ pillar.name }}</span>
                </div>
                <div
                  v-if="pillarSummary?.pillars?.find((p: any) => p.pillar_type === pillar.id)"
                  class="d-flex flex-column"
                >
                  <div class="d-flex justify-space-between text-caption mb-1">
                    <span class="text-grey">Indicators:</span>
                    <span class="font-weight-medium">
                      {{ pillarSummary.pillars.find((p: any) => p.pillar_type === pillar.id)?.indicators_with_data || 0 }}
                      / {{ pillarSummary.pillars.find((p: any) => p.pillar_type === pillar.id)?.total_taxonomy_indicators || 0 }}
                    </span>
                  </div>
                  <div class="d-flex justify-space-between text-caption mb-1">
                    <span class="text-grey">Outcomes:</span>
                    <span>{{ pillarSummary.pillars.find((p: any) => p.pillar_type === pillar.id)?.outcome_indicators || 0 }}</span>
                  </div>
                  <div class="d-flex justify-space-between text-caption">
                    <span class="text-grey">Outputs:</span>
                    <span>{{ pillarSummary.pillars.find((p: any) => p.pillar_type === pillar.id)?.output_indicators || 0 }}</span>
                  </div>
                  <div class="d-flex ga-1 mt-2 flex-wrap">
                    <v-chip
                      :color="(pillarSummary.pillars.find((p: any) => p.pillar_type === pillar.id)?.completion_rate || 0) >= 80 ? 'success' : (pillarSummary.pillars.find((p: any) => p.pillar_type === pillar.id)?.completion_rate || 0) >= 50 ? 'warning' : 'error'"
                      size="small"
                      variant="tonal"
                    >
                      <v-icon start size="x-small">mdi-check-circle</v-icon>
                      {{ (pillarSummary.pillars.find((p: any) => p.pillar_type === pillar.id)?.completion_rate || 0).toFixed(0) }}% Data
                    </v-chip>
                    <v-chip
                      :color="(pillarSummary.pillars.find((p: any) => p.pillar_type === pillar.id)?.accomplishment_rate_pct || 0) >= 80 ? 'success' : 'warning'"
                      size="small"
                      variant="tonal"
                    >
                      {{ (pillarSummary.pillars.find((p: any) => p.pillar_type === pillar.id)?.accomplishment_rate_pct || 0).toFixed(1) }}% Rate
                    </v-chip>
                  </div>
                </div>
                <div v-else class="text-center text-grey text-caption py-2">
                  No data
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Phase EE-B: Achievement Rate by Pillar (%) — global filter controlled -->
        <v-row class="mb-4">
          <v-col cols="12">
            <v-card variant="tonal" class="h-100">
              <v-card-title class="text-subtitle-1 d-flex align-center">
                <v-icon start size="small" color="primary">mdi-chart-bar-stacked</v-icon>
                Achievement Rate by Pillar (%) - FY {{ selectedFiscalYear }}
              </v-card-title>
              <v-card-text>
                <ClientOnly>
                  <VueApexCharts
                    v-if="pillarSummary?.pillars?.length"
                    type="bar"
                    height="280"
                    :options="targetVsActualOptions"
                    :series="targetVsActualSeries"
                  />
                  <div v-else class="text-center py-8 text-grey">
                    <v-icon size="48">mdi-chart-bar</v-icon>
                    <div class="mt-2">No pillar data available</div>
                  </div>
                </ClientOnly>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Phase EB-D: Row 2 — Radial + Trend in equal halves -->
        <v-row class="mb-4">
          <!-- Pillar Accomplishment Rates -->
          <v-col cols="12" md="6">
            <v-card variant="tonal" class="h-100">
              <v-card-title class="text-subtitle-1 d-flex align-center">
                <v-icon start size="small" color="primary">mdi-chart-donut</v-icon>
                Pillar Accomplishment Rates
              </v-card-title>
              <v-card-text>
                <ClientOnly>
                  <VueApexCharts
                    type="radialBar"
                    height="280"
                    :options="pillarChartOptions"
                    :series="pillarChartSeries"
                  />
                </ClientOnly>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Quarterly Trend -->
          <v-col cols="12" md="6">
            <v-card variant="tonal" class="h-100">
              <v-card-title class="text-subtitle-1 d-flex align-center">
                <v-icon start size="small" color="success">mdi-trending-up</v-icon>
                Quarterly Trend
              </v-card-title>
              <v-card-text>
                <ClientOnly>
                  <VueApexCharts
                    type="line"
                    height="280"
                    :options="quarterlyTrendOptions"
                    :series="quarterlyTrendSeries"
                  />
                </ClientOnly>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Phase EE-C: Row 3 — Year-over-Year full width, all pillars as separate series -->
        <v-row>
          <v-col cols="12">
            <v-card variant="tonal" class="h-100">
              <v-card-title class="text-subtitle-1 d-flex align-center">
                <v-icon start size="small" color="orange">mdi-chart-bar</v-icon>
                Year-over-Year Comparison — Accomplishment Rate by Pillar (%)
              </v-card-title>
              <v-card-text>
                <ClientOnly>
                  <VueApexCharts
                    v-if="yearlyComparison?.years?.length"
                    type="bar"
                    height="400"
                    :options="yearlyComparisonOptions"
                    :series="yearlyComparisonSeries"
                  />
                  <div v-else class="text-center py-8 text-grey">
                    <v-icon size="48">mdi-chart-bar</v-icon>
                    <div class="mt-2">No historical data available</div>
                  </div>
                </ClientOnly>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        </template>

        <!-- Phase EE-E: Financial accomplishments placeholder -->
        <template v-else>
          <v-card variant="tonal" class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-chart-timeline-variant</v-icon>
            <h3 class="text-h6 mb-2">Financial Accomplishments Analytics</h3>
            <p class="text-body-2 text-grey mb-4">
              BAR No. 2 financial analytics are under development. This module will provide budget utilization tracking, obligation monitoring, and disbursement analysis.
            </p>
            <v-chip color="info" variant="tonal">
              <v-icon start size="small">mdi-clock-outline</v-icon>
              Coming Soon
            </v-chip>
          </v-card>
        </template>

      </v-card-text>
    </v-card>

    <!-- Phase DW-B: Fiscal Year Creation Dialog -->
    <v-dialog v-model="fiscalYearDialog" max-width="450" persistent>
      <v-card>
        <v-card-title class="text-h6 bg-success text-white">
          <v-icon class="mr-2">mdi-calendar-plus</v-icon>
          Add Fiscal Year
        </v-card-title>

        <v-card-text class="pt-4">
          <p class="text-body-2 mb-4">
            Create a new fiscal year configuration for University Operations reporting.
          </p>

          <v-text-field
            v-model.number="newFiscalYear"
            type="number"
            label="Fiscal Year"
            placeholder="2027"
            variant="outlined"
            density="comfortable"
            :min="2020"
            :max="2099"
            prepend-inner-icon="mdi-calendar"
            hint="Enter a year between 2020 and 2099"
            persistent-hint
            autofocus
            @keydown.enter="createFiscalYear"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="fiscalYearDialog = false"
            :disabled="creatingFiscalYear"
          >
            Cancel
          </v-btn>
          <v-btn
            color="success"
            variant="flat"
            prepend-icon="mdi-check"
            :loading="creatingFiscalYear"
            @click="createFiscalYear"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
