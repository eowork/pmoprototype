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

// Phase IL-R: Operations assignment panel
const operations = ref<any[]>([])
const operationsLoading = ref(false)
const assignDialog = ref(false)
const assignDialogOp = ref<any>(null)
const dialogAssignees = ref<any[]>([])
const dialogAssigneesLoading = ref(false)
const assignAddUserId = ref<string | null>(null)
const assignActionLoading = ref(false)
const eligibleUsers = ref<any[]>([])
const eligibleUsersLoading = ref(false)

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

// Physical analytics state
const pillarSummary = ref<any>(null)
const quarterlyTrend = ref<any>(null)
const yearlyComparison = ref<any>(null)

// Phase EZ-D: Financial analytics state
const financialPillarSummary = ref<any>(null)
const financialQuarterlyTrend = ref<any>(null)
const financialYearlyComparison = ref<any>(null)
const financialExpenseBreakdown = ref<any>(null)
const financialCampusBreakdown = ref<any>(null)
// Phase GS-5: Per-pillar expense class breakdown state (Directive 315)
const financialPillarExpenseBreakdown = ref<any>(null)

// Phase EE-D: Global pillar filter — controls all analytics charts simultaneously
const selectedGlobalPillar = ref<string>('ALL')
const globalPillarOptions = computed(() => [
  { title: 'All Pillars', value: 'ALL' },
  ...PILLARS.map(p => ({ title: p.name, value: p.id })),
])

// Phase FP-1: Reporting type selector — 3-way: Physical / Financial / Cross Analytics
const selectedReportingType = ref<string>('PHYSICAL')
const reportingTypeOptions = [
  { title: 'Physical Accomplishments', value: 'PHYSICAL' },
  { title: 'Financial Accomplishments', value: 'FINANCIAL' },
  { title: 'Cross Analytics', value: 'CROSS' },
]

// Phase FP-2: Physical view sub-tabs (Dashboard vs Report View)
const physicalViewMode = ref<string>('DASHBOARD')

// Phase FP-3: APRR-style report view state (Phase FR-1: full-year report, no quarter filter)
const aprrData = ref<Record<string, any[]>>({})
const aprrTaxonomy = ref<Record<string, any[]>>({})
// Phase FV-2: Initialize as true — prevents empty-content flash before first fetch
const aprrLoading = ref(true)
// Phase FV-1: Per-pillar error tracking — surfaces fetch failures to the user
const aprrErrors = ref<Record<string, string>>({})
// Phase FX-2: Quarter display filter — strict per-quarter view only (Directive 209)
const aprrDisplayQuarter = ref<string>('Q1')
// Phase GB-2: Collapsible pillar sections — first pillar expanded by default (Directive 225)
const aprrExpandedPillar = ref<string[]>([PILLARS[0]?.id])

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

// Phase FN-1: Fetch cross-module summaries (always, regardless of reporting type toggle)
async function fetchCrossModuleSummary() {
  try {
    const [physRes, finRes] = await Promise.all([
      api.get<any>(`/api/university-operations/analytics/pillar-summary?fiscal_year=${selectedFiscalYear.value}`),
      api.get<any>(`/api/university-operations/analytics/financial-pillar-summary?fiscal_year=${selectedFiscalYear.value}`),
    ])
    pillarSummary.value = physRes
    financialPillarSummary.value = finRes
  } catch (err: any) {
    console.error('[UniOps Cross-Module] Failed to fetch summaries:', err)
  }
}

// Phase FO-3: Fetch cross-module YoY data (both physical + financial yearly comparisons)
async function fetchCrossModuleYoY() {
  try {
    const yearsParam = fiscalYearOptions.value.join(',')
    const [physYoY, finYoY] = await Promise.all([
      api.get<any>(`/api/university-operations/analytics/yearly-comparison?years=${yearsParam}`),
      api.get<any>(`/api/university-operations/analytics/financial-yearly-comparison?years=${yearsParam}`),
    ])
    yearlyComparison.value = physYoY
    financialYearlyComparison.value = finYoY
  } catch (err: any) {
    console.error('[UniOps Cross-Module YoY] Failed to fetch:', err)
  }
}

// Phase FY-3: Fetch APRR indicator-level data for all 4 pillars — quarter-scoped (Directive 214)
// Phase FR-2: Per-pillar error isolation — one pillar failure doesn't kill the rest
// Phase FV-1: Per-pillar error tracking + diagnostic logging
async function fetchAPRRData() {
  aprrLoading.value = true
  aprrData.value = {}  // Phase FY-3: Clear stale quarter data before new fetch (Directive 215)
  const results: Record<string, any[]> = {}
  const taxonomy: Record<string, any[]> = {}
  const errors: Record<string, string> = {}
  // Phase FW-3: Cache taxonomy — immutable seed data, no need to re-fetch (Directive 205)
  await Promise.all(PILLARS.map(async (p) => {
    try {
      const cachedTax = aprrTaxonomy.value[p.id]
      const [taxRes, dataRes] = await Promise.all([
        cachedTax?.length ? Promise.resolve(cachedTax) : api.get<any[]>(`/api/university-operations/taxonomy/${p.id}`),
        api.get<any[]>(`/api/university-operations/indicators?pillar_type=${p.id}&fiscal_year=${selectedFiscalYear.value}&quarter=${aprrDisplayQuarter.value}`),
      ])
      taxonomy[p.id] = cachedTax?.length ? cachedTax : (Array.isArray(taxRes) ? taxRes : (taxRes as any)?.data || [])
      results[p.id] = Array.isArray(dataRes) ? dataRes : (dataRes as any)?.data || []
    } catch (err: any) {
      console.error(`[APRR] Failed to fetch ${p.id}:`, err)
      taxonomy[p.id] = aprrTaxonomy.value[p.id] || []  // preserve cached taxonomy on error
      results[p.id] = []
      errors[p.id] = err?.message || 'Failed to load data'
    }
  }))
  // Phase FV-1: Diagnostic — per-pillar data counts (visible in console for operator diagnosis)
  PILLARS.forEach(p => {
    console.debug(`[APRR] ${p.id}: taxonomy=${taxonomy[p.id].length}, data=${results[p.id].length}${errors[p.id] ? ', ERROR: ' + errors[p.id] : ''}`)
  })
  // Always assign — partial data is better than no data
  aprrTaxonomy.value = taxonomy
  aprrData.value = results
  aprrErrors.value = errors
  aprrLoading.value = false
}

// Phase FR-1: Map taxonomy + data into APRR row format
// Merges per-quarter records into unified rows (handles both legacy single-record and per-quarter models)
function getAPRRIndicators(pillarId: string, type: 'OUTCOME' | 'OUTPUT') {
  const tax = (aprrTaxonomy.value[pillarId] || []).filter((t: any) => t.indicator_type === type)
  const data = aprrData.value[pillarId] || []

  // Phase FW-4: Quarter-aware merge — prefer authoritative record for quarterly fields (Directive 206)
  const quarterFieldMap: Record<string, string> = {
    target_q1: 'Q1', accomplishment_q1: 'Q1', score_q1: 'Q1',
    target_q2: 'Q2', accomplishment_q2: 'Q2', score_q2: 'Q2',
    target_q3: 'Q3', accomplishment_q3: 'Q3', score_q3: 'Q3',
    target_q4: 'Q4', accomplishment_q4: 'Q4', score_q4: 'Q4',
  }
  const pickVal = (records: any[], field: string) => {
    const preferredQ = quarterFieldMap[field]
    if (preferredQ) {
      const authoritative = records.find(r => r.reported_quarter === preferredQ && r[field] != null)
      if (authoritative) return authoritative[field]
    }
    // Fallback: first non-null (legacy records without reported_quarter, or non-quarterly fields)
    for (const r of records) {
      if (r[field] != null) return r[field]
    }
    return null
  }

  // Helper: safe number conversion
  const toNum = (v: any): number | null => {
    if (v == null) return null
    const n = Number(v)
    return isNaN(n) ? null : n
  }

  return tax.map((t: any) => {
    // Phase FR-1: Get ALL records for this indicator (may be 1 legacy or multiple per-quarter)
    const records = data.filter((d: any) => d.pillar_indicator_id === t.id)
    const unitType = t.unit_type || 'COUNT'

    // Merge quarterly fields from potentially multiple records
    const tq1 = toNum(pickVal(records, 'target_q1'))
    const tq2 = toNum(pickVal(records, 'target_q2'))
    const tq3 = toNum(pickVal(records, 'target_q3'))
    const tq4 = toNum(pickVal(records, 'target_q4'))
    const aq1 = toNum(pickVal(records, 'accomplishment_q1'))
    const aq2 = toNum(pickVal(records, 'accomplishment_q2'))
    const aq3 = toNum(pickVal(records, 'accomplishment_q3'))
    const aq4 = toNum(pickVal(records, 'accomplishment_q4'))

    // Phase GA-1: Use backend-computed metrics from authoritative record (Directives 218/219)
    // Backend computeIndicatorMetrics() returns total_target, total_accomplishment,
    // accomplishment_rate (respects override_rate), variance — authoritative, single-record computation.
    // Frontend must NOT re-derive these from pickVal'd quarterly columns.
    const authRecord = records.length > 0 ? records[0] : null
    const totalTarget = authRecord ? toNum(authRecord.total_target) : null
    const totalActual = authRecord ? toNum(authRecord.total_accomplishment) : null
    const variance = authRecord ? toNum(authRecord.variance) : null
    const rate = authRecord ? toNum(authRecord.accomplishment_rate) : null

    return {
      name: t.indicator_name,
      code: t.indicator_code || '',
      unit_type: unitType,
      target_q1: tq1, target_q2: tq2, target_q3: tq3, target_q4: tq4,
      actual_q1: aq1, actual_q2: aq2, actual_q3: aq3, actual_q4: aq4,
      total_target: totalTarget,
      total_actual: totalActual,
      variance,
      rate: rate !== null ? parseFloat(rate.toFixed(2)) : null,
    }
  })
}

// Phase FP-3: Format APRR cell value — dash for null, appropriate formatting per unit type
function formatAPRRVal(val: any, unitType: string): string {
  if (val == null || val === '') return '—'
  const num = Number(val)
  if (isNaN(num)) return '—'
  if (unitType === 'PERCENTAGE') return num.toFixed(2) + '%'
  if (unitType === 'RATIO' || unitType === 'SCORE') return num.toFixed(2)
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

// Phase FZ-1: Read pre-computed totals from getAPRRIndicators() — consistent with table columns (Directives 216/217).
// Raw per-quarter columns must NOT be used here; ind.total_target/total_actual/variance/rate
// are correctly computed via SUM (FY-1b) for the quarter-scoped fetch (FY-3).
function getAPRRDisplayMetrics(ind: any): { target: number | null; actual: number | null; variance: number | null; rate: number | null } {
  return {
    target: ind.total_target ?? null,
    actual: ind.total_actual ?? null,
    variance: ind.variance ?? null,
    rate: ind.rate ?? null,
  }
}

// Phase FT-1: Pre-processed APRR render data — single cached computed for the entire Report View
// Absorbs: aprrRateBarColor, getAPRRDisplayMetrics, getAPRRPillarSummary, formatAPRRVal
// Eliminates: all template function calls, all TypeScript `!` in template
const aprrRenderData = computed(() => {
  // Phase GA-2: 5-tier semantic performance colors (Directive 220)
  const rateColor = (rate: number | null): string => {
    if (rate == null) return 'grey'
    if (rate > 100) return 'info'       // Blue — exceeded target
    if (rate === 100) return 'success'  // Green — target achieved
    if (rate >= 80) return 'amber'      // Amber — near target
    if (rate >= 50) return 'orange'     // Orange — needs improvement
    return 'error'                      // Red — critical underperformance
  }

  return PILLARS.map(pillar => {
    const outcomes = getAPRRIndicators(pillar.id, 'OUTCOME')
    const outputs = getAPRRIndicators(pillar.id, 'OUTPUT')

    const processIndicator = (ind: any) => {
      const metrics = getAPRRDisplayMetrics(ind)
      const hasVariance = metrics.variance !== null
      return {
        code: ind.code,
        name: ind.name,
        unitType: ind.unit_type,
        targetText: formatAPRRVal(metrics.target, ind.unit_type),
        actualText: formatAPRRVal(metrics.actual, ind.unit_type),
        varianceText: formatAPRRVal(metrics.variance, ind.unit_type),
        rate: metrics.rate,
        rateText: metrics.rate !== null ? metrics.rate.toFixed(1) + '%' : '—',
        rateColor: rateColor(metrics.rate),
        varianceColor: hasVariance ? (metrics.variance >= 0 ? 'success' : 'error') : 'grey',
        varianceSign: hasVariance && metrics.variance >= 0 ? '+' : '',
        hasVariance,
      }
    }

    const outcomeItems = outcomes.map(processIndicator)
    const outputItems = outputs.map(processIndicator)

    const sections = [
      { type: 'OUTCOME', label: 'Outcome Indicators', icon: 'mdi-target', color: 'text-blue-darken-2', indicators: outcomeItems },
      { type: 'OUTPUT', label: 'Output Indicators', icon: 'mdi-clipboard-check-outline', color: 'text-orange-darken-2', indicators: outputItems },
    ].filter(s => s.indicators.length > 0)

    const allItems = [...outcomeItems, ...outputItems]
    const withRate = allItems.filter(ind => ind.rate !== null)
    const avgRate = withRate.length > 0
      ? parseFloat((withRate.reduce((s, ind) => s + (ind.rate ?? 0), 0) / withRate.length).toFixed(1))
      : null

    return {
      pillar,
      sections,
      summary: {
        totalIndicators: allItems.length,
        withData: withRate.length,
        avgRate,
        avgRateText: avgRate !== null ? avgRate + '%' : '—',
        avgRateColor: rateColor(avgRate),
      },
      hasData: sections.length > 0,
      error: aprrErrors.value[pillar.id] || null,
    }
  })
})

// Phase DE-C: Fetch physical analytics data (trend + YoY — summaries already fetched by cross-module)
// Phase FW-2: Only fetch Physical-specific endpoint — pillarSummary + yearlyComparison
// already fetched by fetchCrossModuleSummary/fetchCrossModuleYoY (Directive 204)
async function fetchAnalytics() {
  analyticsLoading.value = true
  try {
    const pillarParam = selectedGlobalPillar.value !== 'ALL' ? `&pillar_type=${selectedGlobalPillar.value}` : ''
    const trendRes = await api.get<any>(
      `/api/university-operations/analytics/quarterly-trend?fiscal_year=${selectedFiscalYear.value}${pillarParam}`
    )
    quarterlyTrend.value = trendRes
  } catch (err: any) {
    console.error('[UniOps Analytics] Failed to fetch trend:', err)
    toast.warning('Analytics data unavailable')
    quarterlyTrend.value = null
  } finally {
    analyticsLoading.value = false
  }
}

// Phase FW-2: Only fetch Financial-specific endpoints — financialPillarSummary + financialYearlyComparison
// already fetched by fetchCrossModuleSummary/fetchCrossModuleYoY (Directive 207)
async function fetchFinancialAnalytics() {
  analyticsLoading.value = true
  try {
    const pillarParam = selectedGlobalPillar.value !== 'ALL' ? `&pillar_type=${selectedGlobalPillar.value}` : ''
    // Phase GS-5: Added pillar expense breakdown fetch (Directive 315)
    const [trendRes, breakdownRes, campusRes, pillarExpenseRes] = await Promise.all([
      api.get<any>(`/api/university-operations/analytics/financial-quarterly-trend?fiscal_year=${selectedFiscalYear.value}${pillarParam}`),
      api.get<any>(`/api/university-operations/analytics/financial-expense-breakdown?fiscal_year=${selectedFiscalYear.value}`),
      api.get<any>(`/api/university-operations/analytics/financial-campus-breakdown?fiscal_year=${selectedFiscalYear.value}`),
      api.get<any>(`/api/university-operations/analytics/financial-pillar-expense-breakdown?fiscal_year=${selectedFiscalYear.value}`),
    ])
    financialQuarterlyTrend.value = trendRes
    financialExpenseBreakdown.value = breakdownRes
    financialCampusBreakdown.value = campusRes
    financialPillarExpenseBreakdown.value = pillarExpenseRes
  } catch (err: any) {
    console.error('[UniOps Financial Analytics] Failed to fetch:', err)
    toast.warning('Financial analytics data unavailable')
    financialQuarterlyTrend.value = null
    financialExpenseBreakdown.value = null
    financialCampusBreakdown.value = null
    financialPillarExpenseBreakdown.value = null
  } finally {
    analyticsLoading.value = false
  }
}

// Phase EZ-D: Financial chart configurations

const financialPillarChartOptions = computed(() => ({
  chart: {
    type: 'radialBar' as const,
    height: 280,
    toolbar: { show: false },
    events: {
      dataPointSelection: (_event: any, _chartContext: any, config: any) => {
        const pillarIndex = config.dataPointIndex
        if (pillarIndex >= 0 && pillarIndex < PILLARS.length) {
          navigateToFinancial(PILLARS[pillarIndex].id)
        }
      },
    },
  },
  plotOptions: {
    radialBar: {
      dataLabels: {
        name: { fontSize: '12px' },
        value: { fontSize: '14px', formatter: (val: number) => `${val.toFixed(1)}%` },
        total: {
          show: true,
          label: 'Avg Utilization',
          formatter: () => {
            const pillars = financialPillarSummary.value?.pillars || []
            if (!pillars.length) return '0%'
            const avg = pillars.reduce((s: number, p: any) => s + Number(p.avg_utilization_rate || 0), 0) / pillars.length
            return `${avg.toFixed(1)}%`
          },
        },
      },
    },
  },
  labels: PILLARS.map(p => p.name),
  colors: PILLARS.map(p => p.color),
  // Phase GJ-1: Custom tooltip for radialBar (standard tooltip.y not supported)
  tooltip: {
    enabled: true,
    custom: function({ series, seriesIndex, w }: { series: number[]; seriesIndex: number; w: any }) {
      const label = w.globals.labels[seriesIndex] || ''
      const value = series[seriesIndex]
      return '<div style="padding: 6px 10px; font-size: 13px;">' +
        '<strong>' + label + '</strong>: ' + (typeof value === 'number' ? value.toFixed(1) : value) + '%' +
        '</div>'
    },
  },
}))

const financialPillarChartSeries = computed(() => {
  if (!financialPillarSummary.value?.pillars) return [0, 0, 0, 0]
  return PILLARS.map(p => {
    const pd = financialPillarSummary.value.pillars.find((fp: any) => fp.pillar_type === p.id)
    return pd ? Number(pd.avg_utilization_rate) : 0
  })
})

// Phase FO-2: Donut chart with direct data labels (segment name + percentage)
const expenseBreakdownOptions = computed(() => ({
  chart: { type: 'donut' as const, height: 280, toolbar: { show: false } },
  labels: (financialExpenseBreakdown.value?.breakdown || []).map((r: any) => r.expense_class),
  colors: ['#1976D2', '#F57C00', '#00897B', '#9E9E9E'],
  legend: { position: 'bottom' as const },
  dataLabels: {
    enabled: true,
    formatter: (val: number, opts: any) => {
      const label = opts.w.globals.labels[opts.seriesIndex] || ''
      return `${label}: ${val.toFixed(1)}%`
    },
    dropShadow: { enabled: false },
    style: { fontSize: '11px', fontWeight: 600 },
  },
  // Phase GJ-4: Currency-formatted tooltip for obligation values
  tooltip: {
    y: {
      formatter: (val: number) => '₱' + val.toLocaleString(undefined, { maximumFractionDigits: 0 }),
    },
  },
}))

const expenseBreakdownSeries = computed(() => {
  return (financialExpenseBreakdown.value?.breakdown || []).map((r: any) => Number(r.total_obligations))
})

// Phase GS-1: financialTrendOptions and financialTrendSeries REMOVED (Directive 311)
// Financial Quarterly Trend chart deleted — single-FY quarterly breakdown adds no analytical value

// Phase GS-5: Per-pillar expense class breakdown table rows (Directive 315)
const pillarExpenseRows = computed(() => {
  const raw = financialPillarExpenseBreakdown.value?.rows || []
  return PILLARS.map(pillar => {
    const pillarRows = raw.filter((r: any) => r.pillar_type === pillar.id)
    const ps = pillarRows.find((r: any) => r.expense_class === 'PS')
    const mooe = pillarRows.find((r: any) => r.expense_class === 'MOOE')
    const co = pillarRows.find((r: any) => r.expense_class === 'CO')
    const totalObl = pillarRows.reduce((sum: number, r: any) => sum + (r.total_obligations || 0), 0)
    const totalApp = pillarRows.reduce((sum: number, r: any) => sum + (r.total_appropriation || 0), 0)
    return {
      pillar: pillar.name,
      color: pillar.color,
      ps_obligations: ps?.total_obligations || 0,
      mooe_obligations: mooe?.total_obligations || 0,
      co_obligations: co?.total_obligations || 0,
      total_obligations: totalObl,
      total_appropriation: totalApp,
      utilization_rate: totalApp > 0 ? Number(((totalObl / totalApp) * 100).toFixed(2)) : 0,
    }
  }).filter(row => row.total_obligations > 0 || row.total_appropriation > 0)
})

const financialYearlyOptions = computed(() => {
  const years = financialYearlyComparison.value?.years || []
  const isSinglePillar = selectedGlobalPillar.value !== 'ALL'

  return {
    chart: { type: 'bar' as const, height: 400, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: '60%', dataLabels: { position: 'top' } } },
    xaxis: {
      categories: isSinglePillar
        ? years.map((y: number) => `FY ${y}`)
        : PILLARS.map(p => p.name),
    },
    yaxis: {
      title: { text: 'Utilization Rate (%)' },
      min: 0,
      max: 120,
      forceNiceScale: false,
    },
    // Phase FN-4: Target reference line
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
          style: { color: '#E53935', background: '#FFFFFF', fontSize: '12px', padding: { left: 4, right: 4, top: 2, bottom: 2 } },
        },
      }],
    },
    colors: isSinglePillar
      ? [PILLARS.find(p => p.id === selectedGlobalPillar.value)?.color || '#1976D2']
      : years.map((_: any, i: number) => ['#1976D2', '#F57C00', '#4CAF50', '#9C27B0'][i % 4]),
    // Phase GJ-5: Fixed precision (was integer-truncated) + added tooltip
    dataLabels: { enabled: true, formatter: (val: number) => val.toFixed(1) + '%', offsetY: -20 },
    tooltip: {
      y: {
        formatter: (val: number) => val.toFixed(1) + '%',
      },
    },
  }
})

// Phase FN-3: Financial YoY series — responds to selectedGlobalPillar
const financialYearlySeries = computed(() => {
  const data = financialYearlyComparison.value?.data || []
  const years = financialYearlyComparison.value?.years || []

  // Single pillar selected: x-axis = fiscal years, single series = pillar's rate per year
  if (selectedGlobalPillar.value !== 'ALL') {
    const pillar = PILLARS.find(p => p.id === selectedGlobalPillar.value)
    if (!pillar) return [{ name: 'Utilization Rate (%)', data: [] }]
    return [{
      name: pillar.name,
      data: years.map((year: number) => {
        const match = data.find((d: any) => d.fiscal_year === year && d.pillar_type === pillar.id)
        return match ? Number(match.utilization_rate) : 0
      }),
    }]
  }

  // ALL: x-axis = pillars, series = years (current behavior)
  return years.map((year: number) => ({
    name: `FY ${year}`,
    data: PILLARS.map(p => {
      const match = data.find((d: any) => d.fiscal_year === year && d.pillar_type === p.id)
      return match ? Number(match.utilization_rate) : 0
    }),
  }))
})

// Phase FN-1: Cross-module computed metrics
const crossModuleOverallPhysical = computed(() => {
  const pillars = pillarSummary.value?.pillars || []
  if (pillars.length === 0) return 0
  const sum = pillars.reduce((acc: number, p: any) => acc + (Number(p.accomplishment_rate_pct) || 0), 0)
  return Number((sum / pillars.length).toFixed(1))
})

const crossModuleOverallUtilization = computed(() => {
  const pillars = financialPillarSummary.value?.pillars || []
  if (pillars.length === 0) return 0
  const sum = pillars.reduce((acc: number, p: any) => acc + (Number(p.avg_utilization_rate) || 0), 0)
  return Number((sum / pillars.length).toFixed(1))
})

// Phase GX-2: Performance Gap = Physical Accomplishment Rate − Budget Utilization Rate
// Positive → physical ahead of spending (efficient); Negative → spending ahead of physical (concern)
const crossModulePerformanceGap = computed(() => {
  return Number((crossModuleOverallPhysical.value - crossModuleOverallUtilization.value).toFixed(1))
})

const crossModuleDataCoverage = computed(() => {
  const physPillars = pillarSummary.value?.pillars || []
  const indicatorsWithData = physPillars.reduce((acc: number, p: any) => acc + (Number(p.indicators_with_data) || 0), 0)
  const totalIndicators = physPillars.reduce((acc: number, p: any) => acc + (Number(p.total_taxonomy_indicators) || 0), 0)
  const finPillars = financialPillarSummary.value?.pillars || []
  const totalFinRecords = finPillars.reduce((acc: number, p: any) => acc + (Number(p.record_count) || 0), 0)
  return { indicatorsWithData, totalIndicators, totalFinRecords }
})

// Phase GT-4: Efficiency Classification per pillar (Directive 323)
const pillarEfficiencyClassification = computed(() => {
  const physPillars = pillarSummary.value?.pillars || []
  const finPillars = financialPillarSummary.value?.pillars || []
  return PILLARS.map(p => {
    const physRate = Number(physPillars.find((ps: any) => ps.pillar_type === p.id)?.accomplishment_rate_pct) || 0
    const finRate = Number(finPillars.find((fs: any) => fs.pillar_type === p.id)?.avg_utilization_rate) || 0
    const isHighPhys = physRate >= 100
    const isHighFin = finRate >= 100
    let label: string, color: string, icon: string
    if (isHighPhys && isHighFin) { label = 'Balanced'; color = 'success'; icon = 'mdi-check-circle' }
    else if (isHighPhys && !isHighFin) { label = 'Efficient'; color = 'info'; icon = 'mdi-arrow-up-circle' }
    else if (!isHighPhys && isHighFin) { label = 'Review Needed'; color = 'error'; icon = 'mdi-alert-circle' }
    else { label = 'Under-performing'; color = 'warning'; icon = 'mdi-minus-circle' }
    return { pillar: p, physRate, finRate, label, color, icon }
  })
})

// Phase FN-1: Cross-comparison chart — Physical vs Financial per pillar
const crossComparisonOptions = computed(() => ({
  chart: { type: 'bar' as const, height: 300, toolbar: { show: false } },
  plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 } },
  colors: ['#1976D2', '#F57C00'],
  xaxis: { categories: PILLARS.map(p => p.name) },
  yaxis: {
    title: { text: 'Rate (%)' },
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
        style: { color: '#E53935', background: '#FFFFFF', fontSize: '12px', padding: { left: 4, right: 4, top: 2, bottom: 2 } },
      },
    }],
  },
  legend: { position: 'top' as const, horizontalAlign: 'center' as const },
  dataLabels: { enabled: true, formatter: (val: number) => val.toFixed(1) + '%', offsetY: -20, style: { fontSize: '11px', colors: ['#333'] } },
  tooltip: { y: { formatter: (val: number) => val.toFixed(1) + '%' } },
}))

const crossComparisonSeries = computed(() => {
  const physPillars = pillarSummary.value?.pillars || []
  const finPillars = financialPillarSummary.value?.pillars || []
  return [
    {
      name: 'Physical Accomplishment (%)',
      data: PILLARS.map(p => {
        const pd = physPillars.find((ps: any) => ps.pillar_type === p.id)
        return Number(pd?.accomplishment_rate_pct) || 0
      }),
    },
    {
      name: 'Financial Utilization (%)',
      data: PILLARS.map(p => {
        const fd = finPillars.find((fs: any) => fs.pillar_type === p.id)
        return Number(fd?.avg_utilization_rate) || 0
      }),
    },
  ]
})

// Phase FO-3: Cross-module Year-over-Year chart config
const crossModuleYoYOptions = computed(() => {
  const physYears = yearlyComparison.value?.years || []
  const finYears = financialYearlyComparison.value?.years || []
  // Merge and deduplicate fiscal years from both datasets
  const allFYs = [...new Set([
    ...physYears.map((y: any) => y.fiscal_year),
    ...finYears,
  ])].sort((a: number, b: number) => a - b)

  return {
    chart: { type: 'bar' as const, height: 300, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 } },
    // Phase GT-2: 2-color Physical vs Financial in ALL mode (Directive 322)
    colors: ['#1976D2', '#F57C00'],
    xaxis: { categories: allFYs.map((fy: number) => `FY ${fy}`) },
    yaxis: {
      title: { text: 'Rate (%)' },
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
          style: { color: '#E53935', background: '#FFFFFF', fontSize: '12px', padding: { left: 4, right: 4, top: 2, bottom: 2 } },
        },
      }],
    },
    legend: { position: 'top' as const, horizontalAlign: 'center' as const },
    dataLabels: { enabled: true, formatter: (val: number) => val.toFixed(1) + '%', offsetY: -20, style: { fontSize: '11px', colors: ['#333'] } },
    tooltip: { y: { formatter: (val: number) => val.toFixed(1) + '%' } },
    // Phase GT-2: Title for ALL vs single-pillar mode
    title: selectedGlobalPillar.value !== 'ALL'
      ? { text: `YoY Cross-Module — ${PILLARS.find(p => p.id === selectedGlobalPillar.value)?.name || ''}`, align: 'left' as const, style: { fontSize: '13px' } }
      : { text: 'Institution-Level Physical vs Financial Trend', align: 'left' as const, style: { fontSize: '13px' } },
  }
})

const crossModuleYoYSeries = computed(() => {
  const physYears = yearlyComparison.value?.years || []
  const finData = financialYearlyComparison.value?.data || []
  const finYears = financialYearlyComparison.value?.years || []
  // Merge and deduplicate fiscal years
  const allFYs = [...new Set([
    ...physYears.map((y: any) => y.fiscal_year),
    ...finYears,
  ])].sort((a: number, b: number) => a - b)

  // Phase GP-10: When a specific pillar is selected, show that pillar's rates only
  if (selectedGlobalPillar.value !== 'ALL') {
    const pillarId = selectedGlobalPillar.value
    return [
      {
        name: 'Physical Accomplishment (%)',
        data: allFYs.map((fy: number) => {
          const yearData = physYears.find((y: any) => y.fiscal_year === fy)
          const pd = yearData?.pillars?.find((p: any) => p.pillar_type === pillarId)
          return Number((pd?.accomplishment_rate ?? 0).toFixed(1))
        }),
      },
      {
        name: 'Financial Utilization (%)',
        data: allFYs.map((fy: number) => {
          const match = finData.find((d: any) => d.fiscal_year === fy && d.pillar_type === pillarId)
          return match ? Number(Number(match.utilization_rate).toFixed(1)) : 0
        }),
      },
    ]
  }

  // Phase GT-2: ALL mode — institution-level avg Physical vs avg Financial (Directive 322)
  return [
    {
      name: 'Avg Physical Accomplishment (%)',
      data: allFYs.map((fy: number) => {
        const yearData = physYears.find((y: any) => y.fiscal_year === fy)
        if (!yearData?.pillars?.length) return 0
        const rates = yearData.pillars
          .map((p: any) => p.accomplishment_rate)
          .filter((r: number | null) => r != null) as number[]
        return rates.length > 0 ? Number((rates.reduce((s: number, r: number) => s + r, 0) / rates.length).toFixed(1)) : 0
      }),
    },
    {
      name: 'Avg Financial Utilization (%)',
      data: allFYs.map((fy: number) => {
        const finEntries = finData.filter((d: any) => d.fiscal_year === fy)
        if (!finEntries.length) return 0
        const rates = finEntries.map((d: any) => Number(d.utilization_rate))
        return Number((rates.reduce((s: number, r: number) => s + r, 0) / rates.length).toFixed(1))
      }),
    },
  ]
})

// Phase GT-3: Horizontal ranked bar chart — replaces radialBar (Directive 321)
const pillarChartOptions = computed(() => {
  const sorted = pillarSummary.value?.pillars
    ? [...pillarSummary.value.pillars].sort((a: any, b: any) => (b.accomplishment_rate_pct || 0) - (a.accomplishment_rate_pct || 0))
    : []
  const sortedPillarNames = sorted.map((p: any) => PILLARS.find(pl => pl.id === p.pillar_type)?.name || p.pillar_type)
  const sortedColors = sorted.map((p: any) => PILLARS.find(pl => pl.id === p.pillar_type)?.color || '#1976D2')

  return {
    chart: {
      type: 'bar' as const,
      height: 280,
      toolbar: { show: false },
      events: {
        dataPointSelection: (_event: any, _chartContext: any, config: any) => {
          const pillarsSorted = pillarSummary.value?.pillars
            ? [...pillarSummary.value.pillars].sort((a: any, b: any) => (b.accomplishment_rate_pct || 0) - (a.accomplishment_rate_pct || 0))
            : []
          const pt = pillarsSorted[config.dataPointIndex]?.pillar_type
          if (pt) navigateToPhysical(pt)
        },
      },
    },
    plotOptions: { bar: { horizontal: true, barHeight: '60%', borderRadius: 4, distributed: true } },
    colors: sortedColors,
    xaxis: {
      min: 0,
      max: 120,
      title: { text: 'Achievement Rate (%)' },
      labels: { formatter: (val: number) => val.toFixed(0) + '%' },
    },
    yaxis: { categories: sortedPillarNames },
    annotations: {
      xaxis: [{
        x: 100,
        borderColor: '#E53935',
        strokeDashArray: 4,
        label: { text: 'Target', position: 'bottom', offsetY: 5, style: { color: '#E53935', background: '#fff', fontSize: '11px' } },
      }],
    },
    legend: { show: false },
    dataLabels: { enabled: true, formatter: (val: number) => val.toFixed(1) + '%', style: { fontSize: '12px' } },
    tooltip: { y: { formatter: (val: number) => val.toFixed(1) + '%' } },
  }
})

// Phase GT-3: Single-series sorted data for ranked bar
const pillarChartSeries = computed(() => {
  if (!pillarSummary.value?.pillars) return [{ name: 'Achievement Rate (%)', data: [] }]
  const sorted = [...pillarSummary.value.pillars].sort((a: any, b: any) => (b.accomplishment_rate_pct || 0) - (a.accomplishment_rate_pct || 0))
  return [{ name: 'Achievement Rate (%)', data: sorted.map((p: any) => Number((p.accomplishment_rate_pct || 0).toFixed(1))) }]
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
    // Phase GJ-2: Clarified axis label — data is counts/sums, not percentages
    title: { text: 'Achievement Score' },
    min: 0,
    labels: {
      formatter: (val: number) => val.toFixed(1),
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
      // Phase GJ-2: Reduced from 4 to 2 decimal places
      formatter: (val: number) => val.toFixed(2),
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
    forceNiceScale: false,
    labels: {
      formatter: (val: number) => val.toFixed(0) + '%',
    },
  },
  // Phase FM-5: Target reference line with proper label offset
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
        style: { color: '#E53935', background: '#FFFFFF', fontSize: '12px', padding: { left: 4, right: 4, top: 2, bottom: 2 } },
      },
    }],
  },
  legend: {
    position: 'top' as const,
    horizontalAlign: 'center' as const,
  },
  // Phase GJ-3: Enabled dataLabels for visual clarity on grouped bars
  dataLabels: {
    enabled: true,
    formatter: (val: number) => val.toFixed(1) + '%',
    offsetY: -20,
    style: { fontSize: '11px', colors: ['#333'] },
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

// Phase GP-4: Target vs Actual — grouped bar (Target=100%, Actual=accomplishment_rate_pct)
const targetVsActualOptions = computed(() => {
  const pillars = targetVsActualPillars.value
  const actualColor = pillars.length === 1
    ? (PILLARS.find(p => p.id === pillars[0].id)?.color || '#1976D2')
    : '#1976D2'
  return {
    chart: {
      type: 'bar' as const,
      height: 280,
      toolbar: { show: false },
      events: {
        dataPointSelection: (_event: any, _chartContext: any, config: any) => {
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
        columnWidth: '45%',
        borderRadius: 4,
        dataLabels: { position: 'top' },
      },
    },
    colors: ['#9E9E9E', actualColor],
    xaxis: { categories: pillars.map(p => p.name) },
    yaxis: {
      title: { text: 'Achievement Rate (%)' },
      min: 0,
      max: 120,
      forceNiceScale: false,
      labels: { formatter: (val: number) => val.toFixed(0) + '%' },
    },
    legend: { position: 'top' as const, horizontalAlign: 'center' as const },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val.toFixed(1) + '%',
      offsetY: -20,
      style: { fontSize: '11px', colors: ['#333'] },
    },
    tooltip: { y: { formatter: (val: number) => val.toFixed(1) + '%' } },
  }
})

// Phase GP-4: Target vs Actual — two series: Target (100%) and Actual rate
const targetVsActualSeries = computed(() => {
  const pillars = targetVsActualPillars.value
  const empty = [
    { name: 'Target (100%)', data: pillars.map(() => 100) },
    { name: 'Actual Rate (%)', data: pillars.map(() => 0) },
  ]
  if (!pillarSummary.value?.pillars) return empty
  return [
    { name: 'Target (100%)', data: pillars.map(() => 100) },
    {
      name: 'Actual Rate (%)',
      data: pillars.map(p => {
        const pd = pillarSummary.value.pillars.find((ps: any) => ps.pillar_type === p.id)
        return pd?.accomplishment_rate_pct || 0
      }),
    },
  ]
})

// Phase GP-5: YoY Target vs Actual — PERCENTAGE indicators only, single pillar required
const yoyTargetVsActualSeries = computed(() => {
  if (selectedGlobalPillar.value === 'ALL') return []
  const years = yearlyComparison.value?.years || []
  const pillarId = selectedGlobalPillar.value
  return [
    {
      name: 'Avg Target (%)',
      data: years.map((y: any) => {
        const pd = y.pillars?.find((p: any) => p.pillar_type === pillarId)
        return pd?.pct_avg_target ?? 0
      }),
    },
    {
      name: 'Avg Actual (%)',
      data: years.map((y: any) => {
        const pd = y.pillars?.find((p: any) => p.pillar_type === pillarId)
        return pd?.pct_avg_accomplishment ?? 0
      }),
    },
  ]
})

const yoyTargetVsActualOptions = computed(() => {
  const years = yearlyComparison.value?.years || []
  const pillarName = PILLARS.find(p => p.id === selectedGlobalPillar.value)?.name || ''
  return {
    chart: { type: 'bar' as const, height: 300, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: '45%', borderRadius: 4 } },
    colors: ['#1976D2', '#4CAF50'],
    xaxis: { categories: years.map((y: any) => `FY ${y.fiscal_year}`) },
    yaxis: {
      title: { text: 'Value (%)' },
      labels: { formatter: (val: number) => val.toFixed(1) + '%' },
    },
    legend: { position: 'top' as const, horizontalAlign: 'center' as const },
    dataLabels: { enabled: true, formatter: (val: number) => val.toFixed(1) + '%', offsetY: -20, style: { fontSize: '10px', colors: ['#333'] } },
    tooltip: { y: { formatter: (val: number) => val.toFixed(1) + '%' } },
    title: { text: `YoY: Avg Target vs Avg Actual — ${pillarName}`, align: 'left' as const, style: { fontSize: '13px' } },
  }
})

// Phase GV-1: financialAmountBarPillars, financialAmountBarSeries, financialAmountBarOptions REMOVED
// Raw PHP-value budget absorption chart caused misleading scale distortion (HE 500×+ larger than others).
// Absolute amounts are fully covered by per-pillar expense table (GS-5) and YoY amount chart (GP-8).
// Directive 327/328.

// Phase GP-8: Financial YoY amount trend (Appropriation vs Obligations per year)
const financialYoyAmountSeries = computed(() => {
  const data = financialYearlyComparison.value?.data || []
  const years = financialYearlyComparison.value?.years || []
  const toM = (v: any) => Math.round(Number(v || 0) / 1000000 * 10) / 10

  if (selectedGlobalPillar.value !== 'ALL') {
    const pillarId = selectedGlobalPillar.value
    return [
      { name: 'Appropriation (₱M)', data: years.map((year: number) => { const m = data.find((d: any) => d.fiscal_year === year && d.pillar_type === pillarId); return toM(m?.total_appropriation) }) },
      { name: 'Obligations (₱M)', data: years.map((year: number) => { const m = data.find((d: any) => d.fiscal_year === year && d.pillar_type === pillarId); return toM(m?.total_obligations) }) },
    ]
  }
  return [
    { name: 'Appropriation (₱M)', data: years.map((year: number) => toM(data.filter((d: any) => d.fiscal_year === year).reduce((s: number, d: any) => s + Number(d.total_appropriation || 0), 0))) },
    { name: 'Obligations (₱M)', data: years.map((year: number) => toM(data.filter((d: any) => d.fiscal_year === year).reduce((s: number, d: any) => s + Number(d.total_obligations || 0), 0))) },
  ]
})

const financialYoyAmountOptions = computed(() => {
  const years = financialYearlyComparison.value?.years || []
  return {
    chart: { type: 'bar' as const, height: 300, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 } },
    colors: ['#1976D2', '#F57C00'],
    xaxis: { categories: years.map((y: number) => `FY ${y}`) },
    yaxis: { title: { text: 'Amount (₱ Millions)' }, labels: { formatter: (val: number) => '₱' + val.toFixed(1) + 'M' } },
    legend: { position: 'top' as const, horizontalAlign: 'center' as const },
    dataLabels: { enabled: true, formatter: (val: number) => '₱' + val.toFixed(1) + 'M', offsetY: -20, style: { fontSize: '10px', colors: ['#333'] } },
    tooltip: { y: { formatter: (val: number) => '₱' + val.toFixed(2) + 'M' } },
  }
})

// Phase GP-9: Campus breakdown (MAIN vs CABADBARAN obligations per pillar)
// Phase GV-1: Inlined pillar filter — financialAmountBarPillars removed (Directive 327)
const campusBreakdownSeries = computed(() => {
  const breakdown = financialCampusBreakdown.value?.breakdown || []
  if (!breakdown.length) return []
  const filteredPillars = selectedGlobalPillar.value === 'ALL'
    ? PILLARS
    : PILLARS.filter(p => p.id === selectedGlobalPillar.value)
  const campuses = [...new Set(breakdown.map((b: any) => b.campus as string))]
  return campuses.map((campus: string) => ({
    name: campus,
    data: filteredPillars.map(p => {
      const match = breakdown.find((b: any) => b.pillar_type === p.id && b.campus === campus)
      return match ? Math.round(Number(match.total_obligations) / 1000000 * 10) / 10 : 0
    }),
  }))
})

const campusBreakdownOptions = computed(() => {
  const filteredPillars = selectedGlobalPillar.value === 'ALL'
    ? PILLARS
    : PILLARS.filter(p => p.id === selectedGlobalPillar.value)
  return {
    chart: { type: 'bar' as const, height: 300, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 } },
    colors: ['#1976D2', '#AB47BC'],
    xaxis: { categories: filteredPillars.map(p => p.name) },
    yaxis: { title: { text: 'Obligations (₱ Millions)' }, labels: { formatter: (val: number) => '₱' + val.toFixed(1) + 'M' } },
    legend: { position: 'top' as const, horizontalAlign: 'center' as const },
    dataLabels: { enabled: true, formatter: (val: number) => '₱' + val.toFixed(1) + 'M', offsetY: -20, style: { fontSize: '10px', colors: ['#333'] } },
    tooltip: { y: { formatter: (val: number) => '₱' + val.toFixed(2) + 'M' } },
  }
})

// Phase FQ-1: Watch for fiscal year changes — refetch cross-module + active reporting type + APRR if active
watch(selectedFiscalYear, () => {
  fetchCrossModuleSummary()
  fetchCrossModuleYoY()
  if (selectedReportingType.value === 'PHYSICAL') {
    fetchAnalytics()
    if (physicalViewMode.value === 'REPORT') fetchAPRRData()
  } else if (selectedReportingType.value === 'FINANCIAL') {
    fetchFinancialAnalytics()
  }
  if (isAdmin.value || isSuperAdmin.value) fetchOperations()
}, { immediate: false })

// Phase FP-1: Watch for reporting type changes — fetch appropriate analytics
watch(selectedReportingType, (newType) => {
  if (newType === 'PHYSICAL') fetchAnalytics()
  else if (newType === 'FINANCIAL') fetchFinancialAnalytics()
  // CROSS: data already pre-fetched by fetchCrossModuleSummary + fetchCrossModuleYoY
})

// Phase FP-3: Lazy-load APRR data when Report View tab is activated
watch(physicalViewMode, (newMode) => {
  if (newMode === 'REPORT') fetchAPRRData()
})

// Phase FY-3: Re-fetch when quarter changes — data is now quarter-scoped (Directive 214/215)
watch(aprrDisplayQuarter, () => {
  if (physicalViewMode.value === 'REPORT') fetchAPRRData()
})

// Phase EE-D: Watch for global pillar filter — re-fetch trend for active reporting type
watch(selectedGlobalPillar, async (newPillar) => {
  try {
    const pillarParam = newPillar !== 'ALL' ? `&pillar_type=${newPillar}` : ''
    if (selectedReportingType.value === 'PHYSICAL') {
      const trendRes = await api.get<any>(
        `/api/university-operations/analytics/quarterly-trend?fiscal_year=${selectedFiscalYear.value}${pillarParam}`
      )
      quarterlyTrend.value = trendRes
    } else {
      const trendRes = await api.get<any>(
        `/api/university-operations/analytics/financial-quarterly-trend?fiscal_year=${selectedFiscalYear.value}${pillarParam}`
      )
      financialQuarterlyTrend.value = trendRes
    }
  } catch (err: any) {
    console.error('[UniOps Analytics] Failed to fetch trend:', err)
  }
})

// Navigation
// Phase GA-3: Pass quarter for deep-link context (Directive 222)
function navigateToPhysical(pillarId?: string) {
  router.push({
    path: '/university-operations/physical',
    query: {
      year: selectedFiscalYear.value.toString(),
      ...(pillarId && { pillar: pillarId }),
      quarter: aprrDisplayQuarter.value,
    }
  })
}

function navigateToFinancial(pillarId?: string) {
  router.push({
    path: '/university-operations/financial',
    query: {
      year: selectedFiscalYear.value.toString(),
      ...(pillarId && { pillar: pillarId })
    }
  })
}

// Phase IL-R: Operations assignment management functions
async function fetchOperations() {
  if (!selectedFiscalYear.value) return
  operationsLoading.value = true
  try {
    const res = await api.get<any>(`/api/university-operations?fiscal_year=${selectedFiscalYear.value}&limit=10`)
    operations.value = Array.isArray(res) ? res : (res?.data || [])
  } catch {
    operations.value = []
  } finally {
    operationsLoading.value = false
  }
}

async function openAssignDialog(op: any) {
  assignDialogOp.value = op
  assignDialog.value = true
  dialogAssigneesLoading.value = true
  eligibleUsersLoading.value = true
  try {
    const [assignees, users] = await Promise.all([
      api.get<any[]>(`/api/university-operations/${op.id}/assignments`),
      api.get<any[]>('/api/users/eligible-for-assignment'),
    ])
    dialogAssignees.value = Array.isArray(assignees) ? assignees : []
    eligibleUsers.value = Array.isArray(users) ? users : []
  } catch {
    toast.error('Failed to load assignment data')
  } finally {
    dialogAssigneesLoading.value = false
    eligibleUsersLoading.value = false
  }
}

async function addAssignee() {
  if (!assignAddUserId.value || !assignDialogOp.value) return
  assignActionLoading.value = true
  try {
    await api.post(`/api/university-operations/${assignDialogOp.value.id}/assignments`, {
      user_id: assignAddUserId.value,
    })
    dialogAssignees.value = await api.get<any[]>(
      `/api/university-operations/${assignDialogOp.value.id}/assignments`
    )
    assignAddUserId.value = null
    toast.success('Assignee added')
  } catch (err: any) {
    toast.error(err?.message || 'Failed to add assignee')
  } finally {
    assignActionLoading.value = false
  }
}

function getAssigneeName(userId: string): string {
  const user = eligibleUsers.value.find(u => u.id === userId)
  return user ? `${user.first_name} ${user.last_name}` : userId
}

async function removeAssignee(userId: string) {
  if (!assignDialogOp.value) return
  assignActionLoading.value = true
  try {
    await api.del(
      `/api/university-operations/${assignDialogOp.value.id}/assignments/${userId}`
    )
    dialogAssignees.value = dialogAssignees.value.filter(a => a.userId !== userId)
    toast.success('Assignee removed')
  } catch (err: any) {
    toast.error(err?.message || 'Failed to remove assignee')
  } finally {
    assignActionLoading.value = false
  }
}

watch(assignDialog, (open) => {
  if (!open && assignDialogOp.value) {
    fetchOperations()
    assignDialogOp.value = null
    dialogAssignees.value = []
    assignAddUserId.value = null
  }
})

// Phase FN-1: Initialize from store on mount — fetch cross-module + active reporting type
onMounted(async () => {
  await fiscalYearStore.fetchFiscalYears()
  fetchCrossModuleSummary()
  fetchCrossModuleYoY()
  fetchAnalytics()
  if (isAdmin.value || isSuperAdmin.value) fetchOperations()
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
      <!-- Phase GA-4: NuxtLink for browser-native new-tab support (Directive 223) -->
      <!-- Physical Accomplishments -->
      <v-col cols="12" md="6">
        <NuxtLink :to="{ path: '/university-operations/physical', query: { year: selectedFiscalYear.toString(), quarter: aprrDisplayQuarter } }" class="text-decoration-none">
        <v-card
          class="pa-6 h-100 cursor-pointer"
          variant="outlined"
          hover
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
        </NuxtLink>
      </v-col>

      <!-- Financial Accomplishments -->
      <v-col cols="12" md="6">
        <NuxtLink :to="{ path: '/university-operations/financial', query: { year: selectedFiscalYear.toString() } }" class="text-decoration-none">
        <v-card
          class="pa-6 h-100 cursor-pointer"
          variant="outlined"
          hover
        >
          <div class="d-flex align-center mb-4">
            <v-avatar color="primary" size="56" class="mr-4">
              <v-icon size="28" color="white">mdi-currency-php</v-icon>
            </v-avatar>
            <div>
              <h2 class="text-h5 font-weight-bold">Financial Accomplishments</h2>
              <p class="text-body-2 text-grey">Budget Utilization and Financial Performance</p>
            </div>
          </div>
          <p class="text-body-1 mb-4">
            Budget utilization and financial performance tracking. Monitor appropriations,
            obligations, and disbursements across fund types and expense classes.
          </p>
          <div class="d-flex align-center text-primary">
            <span class="font-weight-medium">Enter Financial Accomplishments</span>
            <v-icon end>mdi-arrow-right</v-icon>
          </div>
        </v-card>
        </NuxtLink>
      </v-col>
    </v-row>

    <!-- Phase DE-C: Analytics Dashboard -->
    <v-card class="mb-6">
      <v-card-title class="d-flex align-center flex-wrap ga-2">
        <v-icon start color="primary">mdi-chart-areaspline</v-icon>
        Analytics Dashboard - FY {{ selectedFiscalYear }}
        <v-spacer />
        <!-- Phase EZ-F: Reporting type selector with icon -->
        <v-select
          v-model="selectedReportingType"
          :items="reportingTypeOptions"
          density="compact"
          variant="outlined"
          hide-details
          prepend-inner-icon="mdi-file-chart-outline"
          style="max-width: 300px"
        />
        <!-- Phase EZ-F: Global pillar filter with icon -->
        <v-select
          v-model="selectedGlobalPillar"
          :items="globalPillarOptions"
          density="compact"
          variant="outlined"
          hide-details
          prepend-inner-icon="mdi-filter"
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
        <!-- Phase GF-1: Analytics Guide UX Restructuring — structured sections, plain language, guide-to-system alignment (Directives 235-239) -->
        <v-expansion-panels class="mb-4">
          <v-expansion-panel>
            <v-expansion-panel-title class="text-body-2">
              <v-icon start size="small" color="info">mdi-chart-box-outline</v-icon>
              How to Read This Dashboard
            </v-expansion-panel-title>
            <v-expansion-panel-text>

              <!-- SECTION 1: Overview -->
              <div class="mb-4">
                <div class="d-flex align-center mb-2">
                  <v-icon start size="small" color="primary">mdi-information-outline</v-icon>
                  <span class="text-subtitle-2 font-weight-bold">Overview</span>
                </div>
                <div class="bg-grey-lighten-5 rounded pa-3 text-body-2">
                  This dashboard shows how the university is performing across its four pillars — both in terms of physical accomplishments (targets vs actuals) and financial utilization (budget spent vs approved). Use the tabs above to switch between Cross-Analytics, Physical, and Financial views.
                </div>
              </div>

              <!-- SECTION 2: Key Metrics Explained -->
              <div class="mb-4">
                <div class="d-flex align-center mb-2">
                  <v-icon start size="small" color="deep-purple">mdi-book-open-variant</v-icon>
                  <span class="text-subtitle-2 font-weight-bold">Key Metrics Explained</span>
                </div>
                <div class="bg-grey-lighten-5 rounded pa-3">
                  <v-list density="compact" class="bg-transparent pa-0">
                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon size="small" color="blue" class="mr-3">mdi-bullseye-arrow</v-icon>
                      </template>
                      <v-list-item-title class="text-body-2 font-weight-bold">Target</v-list-item-title>
                      <v-list-item-subtitle class="text-body-2" style="white-space: normal;">The planned or expected value for an indicator or budget line.</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon size="small" color="green" class="mr-3">mdi-check-circle-outline</v-icon>
                      </template>
                      <v-list-item-title class="text-body-2 font-weight-bold">Actual</v-list-item-title>
                      <v-list-item-subtitle class="text-body-2" style="white-space: normal;">The achieved or measured value.</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon size="small" color="orange" class="mr-3">mdi-swap-vertical</v-icon>
                      </template>
                      <v-list-item-title class="text-body-2 font-weight-bold">Variance</v-list-item-title>
                      <v-list-item-subtitle class="text-body-2" style="white-space: normal;">How far the actual result is from the target. Positive means exceeded; negative means fell short.</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon size="small" color="teal" class="mr-3">mdi-percent-outline</v-icon>
                      </template>
                      <v-list-item-title class="text-body-2 font-weight-bold">Accomplishment Rate</v-list-item-title>
                      <v-list-item-subtitle class="text-body-2" style="white-space: normal;">How much of the target was achieved, expressed as a percentage.</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon size="small" color="success" class="mr-3">mdi-cash-check</v-icon>
                      </template>
                      <v-list-item-title class="text-body-2 font-weight-bold">Utilization Rate</v-list-item-title>
                      <v-list-item-subtitle class="text-body-2" style="white-space: normal;">How much of the approved budget has been committed as obligations.</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>

                  <!-- Color reference — 5-tier -->
                  <div class="mt-3 mb-1">
                    <div class="text-caption font-weight-bold text-medium-emphasis mb-2">Performance Color Scale</div>
                    <div class="d-flex flex-wrap ga-2">
                      <v-chip color="error" size="small" variant="tonal">Below 50% — Critical</v-chip>
                      <v-chip color="orange" size="small" variant="tonal">50-79% — Needs Improvement</v-chip>
                      <v-chip color="amber" size="small" variant="tonal">80-99% — Near Target</v-chip>
                      <v-chip color="success" size="small" variant="tonal">100% — Target Achieved</v-chip>
                      <v-chip color="info" size="small" variant="tonal">Above 100% — Exceeded</v-chip>
                    </div>
                  </div>
                </div>
              </div>

              <!-- SECTION 3: How to Use Filters -->
              <div class="mb-4">
                <div class="d-flex align-center mb-2">
                  <v-icon start size="small" color="amber-darken-2">mdi-filter-outline</v-icon>
                  <span class="text-subtitle-2 font-weight-bold">How to Use Filters</span>
                </div>
                <div class="bg-grey-lighten-5 rounded pa-3">
                  <v-list density="compact" class="bg-transparent pa-0">
                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon size="small" color="amber-darken-2" class="mr-3">mdi-menu-down</v-icon>
                      </template>
                      <v-list-item-title class="text-body-2 font-weight-bold">Pillar Filter</v-list-item-title>
                      <v-list-item-subtitle class="text-body-2" style="white-space: normal;">Use the dropdown at the top to view all pillars at once, or select a specific pillar to focus on its data.</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon size="small" color="amber-darken-2" class="mr-3">mdi-calendar-range</v-icon>
                      </template>
                      <v-list-item-title class="text-body-2 font-weight-bold">Quarter Toggle</v-list-item-title>
                      <v-list-item-subtitle class="text-body-2" style="white-space: normal;">In Report View, switch between Q1, Q2, Q3, and Q4 to see data for that specific reporting period. The data refreshes automatically.</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </div>
              </div>

              <!-- SECTION 4: How to Interpret Charts (conditional per reporting type) -->
              <div>
                <div class="d-flex align-center mb-2">
                  <v-icon start size="small" color="info">mdi-chart-line</v-icon>
                  <span class="text-subtitle-2 font-weight-bold">How to Interpret Charts</span>
                </div>

                <!-- CROSS ANALYTICS -->
                <div class="bg-grey-lighten-5 rounded pa-3 text-body-2" v-if="selectedReportingType === 'CROSS'">
                  <div class="font-weight-bold mb-2">
                    <v-icon size="x-small" color="deep-purple" class="mr-1">mdi-view-dashboard</v-icon>
                    Institutional Overview
                  </div>
                  <p class="mb-3">The four summary cards at the top show the overall Physical Accomplishment rate, Budget Utilization rate, Disbursement Rate, and Data Coverage for the selected fiscal year.</p>

                  <v-divider class="mb-3" />

                  <div class="font-weight-bold mb-2">
                    <v-icon size="x-small" color="deep-purple" class="mr-1">mdi-compare</v-icon>
                    Physical vs Financial Performance by Pillar
                  </div>
                  <p class="mb-1">This bar chart places Physical and Financial performance side by side for each pillar.</p>
                  <p class="mb-1">Each pillar has two bars — blue for Physical accomplishment rate, orange for Financial utilization rate.</p>
                  <p class="mb-3">The red dashed line marks the 100% target. Bars above it mean the target was exceeded. Compare both bars per pillar to see if Physical and Financial performance are aligned.</p>

                  <v-divider class="mb-3" />

                  <div class="font-weight-bold mb-2">
                    <v-icon size="x-small" color="deep-purple" class="mr-1">mdi-chart-timeline-variant</v-icon>
                    Year-over-Year — Physical vs Financial Performance
                  </div>
                  <p class="mb-0">Shows how overall Physical and Financial performance changed across fiscal years. Look for upward trends (improving) or widening gaps between the two bars (divergence).</p>
                </div>

                <!-- PHYSICAL ANALYTICS -->
                <div class="bg-grey-lighten-5 rounded pa-3 text-body-2" v-else-if="selectedReportingType === 'PHYSICAL'">
                  <div class="font-weight-bold mb-2">
                    <v-icon size="x-small" color="primary" class="mr-1">mdi-view-dashboard</v-icon>
                    Dashboard View
                  </div>

                  <div class="ml-3 mb-3">
                    <p class="font-weight-medium mb-1">Pillar Completion Overview</p>
                    <p class="mb-3">Four clickable cards — one per pillar — showing indicator counts, data completion rate, and accomplishment rate. Click any card to go directly to the Physical Accomplishment page for that pillar.</p>

                    <p class="font-weight-medium mb-1">Achievement Rate by Pillar (%)</p>
                    <p class="mb-3">A bar chart showing each pillar's overall accomplishment rate. A bar at 100% means all indicator targets for that pillar were met.</p>

                    <p class="font-weight-medium mb-1">Pillar Performance Ranking (horizontal bar)</p>
                    <p class="mb-3">A horizontal bar chart showing pillars ranked by accomplishment rate, highest to lowest. The red dashed line marks the 100% target. Click a bar to drill into that pillar's data.</p>

                    <p class="font-weight-medium mb-1">Quarterly Trend</p>
                    <p class="mb-3">Shows how accomplishment rates changed from Q1 through Q4. A rising line means improving performance; a declining line signals areas that may need attention.</p>

                    <p class="font-weight-medium mb-1">Year-over-Year Comparison</p>
                    <p class="mb-0">Compares each pillar's accomplishment rate across multiple fiscal years to identify long-term trends.</p>
                  </div>

                  <v-divider class="mb-3" />

                  <div class="font-weight-bold mb-2">
                    <v-icon size="x-small" color="primary" class="mr-1">mdi-table</v-icon>
                    Report View
                  </div>
                  <div class="ml-3">
                    <p class="mb-1">Shows all indicators per pillar, grouped into Outcome and Output sections.</p>
                    <p class="mb-1">Each indicator card displays its Target, Actual, Variance, and Rate as a color-coded progress bar.</p>
                    <p class="mb-0">Click any indicator card to navigate to the Physical Accomplishment page for detailed data entry.</p>
                  </div>
                </div>

                <!-- FINANCIAL ANALYTICS -->
                <div class="bg-grey-lighten-5 rounded pa-3 text-body-2" v-else-if="selectedReportingType === 'FINANCIAL'">
                  <div class="font-weight-bold mb-2">
                    <v-icon size="x-small" color="success" class="mr-1">mdi-view-dashboard</v-icon>
                    Budget Utilization Overview
                  </div>
                  <p class="mb-3">Four clickable cards — one per pillar — showing the Appropriation amount, Obligations amount, and Utilization rate. Click any card to go directly to the Financial Accomplishment page for that pillar.</p>

                  <v-divider class="mb-3" />

                  <div class="font-weight-bold mb-2">
                    <v-icon size="x-small" color="success" class="mr-1">mdi-chart-donut</v-icon>
                    Utilization Rate by Pillar (%)
                  </div>
                  <p class="mb-3">A radial chart showing what percentage of each pillar's approved budget has been committed. A fuller circle means higher utilization.</p>

                  <v-divider class="mb-3" />

                  <div class="font-weight-bold mb-2">
                    <v-icon size="x-small" color="success" class="mr-1">mdi-chart-pie</v-icon>
                    Expense Class Breakdown (Obligations)
                  </div>
                  <p class="mb-1">A donut chart showing how spending is distributed across three categories:</p>
                  <ul class="ml-4 mb-3">
                    <li><strong>Personal Services (PS)</strong> — Salaries and personnel costs</li>
                    <li><strong>MOOE</strong> — Maintenance and other operating expenses</li>
                    <li><strong>Capital Outlay (CO)</strong> — Equipment, infrastructure, and capital investments</li>
                  </ul>

                  <v-divider class="mb-3" />

                  <div class="font-weight-bold mb-2">
                    <v-icon size="x-small" color="success" class="mr-1">mdi-table</v-icon>
                    Expense Class Breakdown by Pillar
                  </div>
                  <p class="mb-3">A table showing PS, MOOE, and CO obligation amounts per pillar with utilization rates.</p>

                  <v-divider class="mb-3" />

                  <div class="font-weight-bold mb-2">
                    <v-icon size="x-small" color="success" class="mr-1">mdi-chart-timeline-variant</v-icon>
                    Year-over-Year Comparison
                  </div>
                  <p class="mb-0">Compares utilization rates across fiscal years per pillar. Higher bars mean better budget absorption. Use the pillar filter to focus on a single pillar's trend.</p>
                </div>
              </div>

              <v-divider class="mb-3" />

              <!-- Phase GT-7: YoY Formula Documentation (Directive 325) -->
              <div class="font-weight-bold mb-2">
                <v-icon size="x-small" color="deep-purple" class="mr-1">mdi-function-variant</v-icon>
                YoY Accomplishment Rate Formula
              </div>
              <div class="pl-4 mb-0">
                <p class="mb-1"><strong>Per indicator:</strong></p>
                <ul class="mb-2 text-body-2">
                  <li>COUNT/WEIGHTED_COUNT: <code>(sum_actual ÷ sum_target) × 100</code></li>
                  <li>PERCENTAGE: <code>(avg_actual ÷ avg_target) × 100</code></li>
                </ul>
                <p class="mb-1"><strong>Per pillar per year:</strong><br>
                Average of all valid indicator achievement rates (NULL indicators excluded).</p>
                <p class="text-grey text-caption mb-0"><em>Pillars are computed independently — cross-pillar averaging is never applied to per-pillar rates.</em></p>
              </div>

            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- Phase FP-1: Cross Analytics view (dedicated reporting type) -->
        <template v-if="selectedReportingType === 'CROSS'">
        <div class="mb-6" v-if="pillarSummary?.pillars || financialPillarSummary?.pillars">
          <div class="text-subtitle-1 font-weight-medium mb-3 d-flex align-center">
            <v-icon start size="small" color="deep-purple">mdi-chart-box-outline</v-icon>
            Institutional Overview — FY {{ selectedFiscalYear }}
          </div>

          <!-- Phase FO-1: Summary Cards — uniform height/width with h-100 + consistent typography -->
          <v-row class="mb-4">
            <v-col cols="6" md="3" class="d-flex">
              <v-card variant="tonal" color="blue" class="text-center pa-3 h-100 d-flex flex-column justify-center" style="width: 100%">
                <div class="text-caption text-medium-emphasis">Physical Accomplishment</div>
                <div class="text-h5 font-weight-bold">{{ crossModuleOverallPhysical }}%</div>
              </v-card>
            </v-col>
            <v-col cols="6" md="3" class="d-flex">
              <v-card variant="tonal" color="orange" class="text-center pa-3 h-100 d-flex flex-column justify-center" style="width: 100%">
                <div class="text-caption text-medium-emphasis">Budget Utilization</div>
                <div class="text-h5 font-weight-bold">{{ crossModuleOverallUtilization }}%</div>
              </v-card>
            </v-col>
            <v-col cols="6" md="3" class="d-flex">
              <v-card variant="tonal" color="teal" class="text-center pa-3 h-100 d-flex flex-column justify-center" style="width: 100%">
                <div class="text-caption text-medium-emphasis">Performance Gap</div>
                <div class="text-h5 font-weight-bold">{{ crossModulePerformanceGap > 0 ? '+' : '' }}{{ crossModulePerformanceGap }}%</div>
                <div class="text-caption text-medium-emphasis">Physical − Utilization</div>
              </v-card>
            </v-col>
            <v-col cols="6" md="3" class="d-flex">
              <v-card variant="tonal" color="grey" class="text-center pa-3 h-100 d-flex flex-column justify-center" style="width: 100%">
                <div class="text-caption text-medium-emphasis">Data Coverage</div>
                <div class="text-h5 font-weight-bold">{{ crossModuleDataCoverage.indicatorsWithData }}/{{ crossModuleDataCoverage.totalIndicators }}</div>
                <div class="text-caption text-medium-emphasis">indicators · {{ crossModuleDataCoverage.totalFinRecords }} financial records</div>
              </v-card>
            </v-col>
          </v-row>

          <!-- Per-Pillar Cross Comparison Chart -->
          <v-card variant="outlined" class="mb-2">
            <v-card-title class="text-subtitle-1 d-flex align-center">
              <v-icon start size="small" color="deep-purple">mdi-compare</v-icon>
              Physical vs Financial Performance by Pillar
            </v-card-title>
            <v-card-text class="pa-2">
              <VueApexCharts
                type="bar"
                :height="300"
                :options="crossComparisonOptions"
                :series="crossComparisonSeries"
              />
            </v-card-text>
          </v-card>

          <!-- Phase GT-4: Efficiency Classification Cards (Directive 323) -->
          <v-card variant="outlined" class="mb-2 mt-3" v-if="pillarSummary?.pillars?.length && financialPillarSummary?.pillars?.length">
            <v-card-title class="text-subtitle-1 d-flex align-center">
              <v-icon start size="small" color="deep-purple">mdi-clipboard-check-outline</v-icon>
              Efficiency Classification — FY {{ selectedFiscalYear }}
            </v-card-title>
            <v-card-text class="pa-2">
              <v-row dense>
                <v-col v-for="item in pillarEfficiencyClassification" :key="item.pillar.id" cols="12" sm="6" md="3">
                  <v-card variant="tonal" class="h-100">
                    <v-card-text class="pa-3">
                      <div class="d-flex align-center mb-2">
                        <v-avatar :color="item.pillar.color" size="28" class="mr-2">
                          <v-icon size="16" color="white">{{ item.pillar.icon }}</v-icon>
                        </v-avatar>
                        <span class="text-subtitle-2 font-weight-medium">{{ item.pillar.name }}</span>
                      </div>
                      <div class="d-flex flex-column ga-1 mb-2">
                        <span class="text-caption">Physical: <strong>{{ item.physRate.toFixed(1) }}%</strong></span>
                        <span class="text-caption">Financial: <strong>{{ item.finRate.toFixed(1) }}%</strong></span>
                      </div>
                      <v-chip :color="item.color" size="small" :prepend-icon="item.icon" variant="flat">
                        {{ item.label }}
                      </v-chip>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Phase FO-3: Cross-Module Year-over-Year Comparison -->
          <v-card variant="outlined" class="mb-2 mt-3" v-if="yearlyComparison?.years?.length || financialYearlyComparison?.years?.length">
            <v-card-title class="text-subtitle-1 d-flex align-center">
              <v-icon start size="small" color="deep-purple">mdi-chart-timeline-variant</v-icon>
              Year-over-Year — Physical vs Financial Performance
            </v-card-title>
            <v-card-text class="pa-2">
              <VueApexCharts
                type="bar"
                :height="300"
                :options="crossModuleYoYOptions"
                :series="crossModuleYoYSeries"
              />
            </v-card-text>
          </v-card>
        </div>
        <div v-else class="text-center py-8 text-grey">
          <v-icon size="48">mdi-chart-box-outline</v-icon>
          <div class="mt-2">No cross-module data available for FY {{ selectedFiscalYear }}</div>
        </div>
        </template>

        <!-- Phase EE-E: Physical accomplishments analytics -->
        <template v-else-if="selectedReportingType === 'PHYSICAL'">

        <!-- Phase FP-2: Dashboard / Report View sub-tabs -->
        <v-tabs v-model="physicalViewMode" density="compact" class="mb-4" color="primary">
          <v-tab value="DASHBOARD"><v-icon start size="small">mdi-chart-areaspline</v-icon> Dashboard</v-tab>
          <v-tab value="REPORT"><v-icon start size="small">mdi-file-table-outline</v-icon> Report View</v-tab>
        </v-tabs>

        <!-- Dashboard View: existing charts -->
        <div v-if="physicalViewMode === 'DASHBOARD'">
        <!-- Phase DR-C1: Pillar Completion Overview (FIRST analytics section) -->
        <v-row class="mb-4" v-if="pillarSummary?.pillars">
          <v-col cols="12">
            <div class="text-subtitle-1 font-weight-medium mb-3 d-flex align-center">
              <v-icon start size="small" color="primary">mdi-view-dashboard</v-icon>
              Pillar Completion Overview
            </div>
          </v-col>
          <v-col v-for="pillar in PILLARS" :key="pillar.id" cols="6" md="3">
            <NuxtLink :to="{ path: '/university-operations/physical', query: { year: selectedFiscalYear.toString(), pillar: pillar.id, quarter: aprrDisplayQuarter } }" class="text-decoration-none">
            <v-card
              variant="outlined"
              class="h-100 cursor-pointer"
              hover
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
            </NuxtLink>
          </v-col>
        </v-row>

        <!-- Phase EE-B: Achievement Rate by Pillar (%) — global filter controlled -->
        <v-row class="mb-4">
          <v-col cols="12">
            <v-card variant="tonal" class="h-100">
              <v-card-title class="text-subtitle-1 d-flex align-center">
                <v-icon start size="small" color="primary">mdi-chart-bar-stacked</v-icon>
                Target vs Actual Achievement Rate by Pillar — FY {{ selectedFiscalYear }}
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

        <!-- Phase GT-3: Row 2 — Ranked Bar + Trend in equal halves -->
        <v-row class="mb-4">
          <!-- Pillar Performance Ranking -->
          <v-col cols="12" md="6">
            <v-card variant="tonal" class="h-100">
              <v-card-title class="text-subtitle-1 d-flex align-center">
                <v-icon start size="small" color="primary">mdi-sort-descending</v-icon>
                Pillar Performance Ranking
              </v-card-title>
              <v-card-text>
                <ClientOnly>
                  <VueApexCharts
                    type="bar"
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
        <v-row class="mb-4">
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

        <!-- Phase GP-5: YoY Target vs Actual (PERCENTAGE indicators) — visible only when single pillar selected -->
        <v-row v-if="selectedGlobalPillar !== 'ALL' && yearlyComparison?.years?.length">
          <v-col cols="12">
            <v-card variant="tonal" class="h-100">
              <v-card-title class="text-subtitle-1 d-flex align-center">
                <v-icon start size="small" color="teal">mdi-target</v-icon>
                Year-over-Year: Average Target vs Average Actual (%)
              </v-card-title>
              <v-card-text>
                <ClientOnly>
                  <VueApexCharts
                    v-if="yoyTargetVsActualSeries.length && yoyTargetVsActualSeries[0].data.some((v: number) => v > 0)"
                    type="bar"
                    height="300"
                    :options="yoyTargetVsActualOptions"
                    :series="yoyTargetVsActualSeries"
                  />
                  <div v-else class="text-center py-8 text-grey">
                    <v-icon size="48">mdi-chart-bar</v-icon>
                    <div class="mt-2">No PERCENTAGE indicator data for this pillar across years</div>
                  </div>
                </ClientOnly>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        </div>

        <!-- Phase FS-1: Report View (APRR-style) — card-based indicator blocks with progress bars -->
        <div v-else-if="physicalViewMode === 'REPORT'">
          <!-- Phase FS-2: Quarter display filter + Refresh -->
          <div class="d-flex align-center ga-3 mb-4 flex-wrap">
            <!-- Phase FX-2: Strict per-quarter only — FULL_YEAR removed (Directive 209) -->
            <v-btn-toggle v-model="aprrDisplayQuarter" mandatory density="compact" color="primary" variant="outlined">
              <v-btn value="Q1" size="small">Q1</v-btn>
              <v-btn value="Q2" size="small">Q2</v-btn>
              <v-btn value="Q3" size="small">Q3</v-btn>
              <v-btn value="Q4" size="small">Q4</v-btn>
            </v-btn-toggle>
            <v-btn
              variant="tonal"
              color="primary"
              size="small"
              :loading="aprrLoading"
              @click="fetchAPRRData()"
            >
              <v-icon start size="small">mdi-refresh</v-icon>
              Refresh
            </v-btn>
          </div>

          <!-- Loading state -->
          <div v-if="aprrLoading" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" size="48" />
            <div class="mt-4 text-grey">Loading report data...</div>
          </div>

          <!-- Phase GB-2: Collapsible pillar sections — expansion panels (Directive 225) -->
          <template v-else>
            <!-- Phase GC-1: No accordion variant — allows multiple pillars open simultaneously (Directive 226) -->
            <v-expansion-panels v-model="aprrExpandedPillar" multiple>
              <v-expansion-panel v-for="pillarData in aprrRenderData" :key="pillarData.pillar.id" :value="pillarData.pillar.id">
                <v-expansion-panel-title class="py-2">
                  <div class="d-flex align-center justify-space-between w-100 pr-2">
                    <div class="d-flex align-center">
                      <v-avatar :color="pillarData.pillar.color" size="28" class="mr-2">
                        <v-icon size="16" color="white">{{ pillarData.pillar.icon }}</v-icon>
                      </v-avatar>
                      <span class="text-subtitle-2 font-weight-medium">{{ pillarData.pillar.fullName }} — FY {{ selectedFiscalYear }} {{ aprrDisplayQuarter }}</span>
                    </div>
                    <div class="d-flex align-center ga-3">
                      <span class="text-caption text-medium-emphasis">{{ pillarData.summary.withData }}/{{ pillarData.summary.totalIndicators }} indicators</span>
                      <v-chip :color="pillarData.summary.avgRateColor" size="small" variant="tonal">
                        {{ pillarData.summary.avgRateText }}
                      </v-chip>
                    </div>
                  </div>
                </v-expansion-panel-title>

                <v-expansion-panel-text>
                  <!-- Phase FV-1: Error state — fetch failed for this pillar -->
                  <v-alert v-if="pillarData.error" type="warning" variant="tonal" density="compact" class="mb-3">
                    <div class="text-body-2">Failed to load {{ pillarData.pillar.name }} data</div>
                    <div class="text-caption text-medium-emphasis">{{ pillarData.error }}</div>
                  </v-alert>

                  <!-- Phase FT-2: Single v-for over sections (Outcome + Output) -->
                  <template v-for="(section, sIdx) in pillarData.sections" :key="section.type">
                    <v-divider v-if="sIdx > 0" class="my-4" />
                    <div class="text-subtitle-2 font-weight-medium mb-3" :class="section.color">
                      <v-icon start size="small">{{ section.icon }}</v-icon>
                      {{ section.label }}
                    </div>
                    <v-row dense>
                      <v-col v-for="ind in section.indicators" :key="ind.code" cols="12" md="6">
                        <!-- Phase GA-3/GA-4: Clickable indicator cards with NuxtLink (Directives 221/223) -->
                        <NuxtLink :to="{ path: '/university-operations/physical', query: { year: selectedFiscalYear.toString(), pillar: pillarData.pillar.id, quarter: aprrDisplayQuarter } }" class="text-decoration-none">
                        <v-card variant="outlined" class="pa-3 h-100" style="cursor: pointer">
                          <div class="text-caption font-weight-bold text-grey-darken-2 mb-1">{{ ind.code }}</div>
                          <div class="text-body-2 mb-3" style="line-height: 1.3">{{ ind.name }}</div>
                          <div class="d-flex justify-space-between align-center mb-1">
                            <span class="text-caption text-medium-emphasis">Target</span>
                            <span class="text-body-2 font-weight-medium">{{ ind.targetText }}</span>
                          </div>
                          <div class="d-flex justify-space-between align-center mb-2">
                            <span class="text-caption text-medium-emphasis">Actual</span>
                            <span class="text-body-2 font-weight-bold">{{ ind.actualText }}</span>
                          </div>
                          <!-- Phase GD-1: max=100 so 100% fills full width (Directive 229) -->
                          <v-progress-linear
                            :model-value="ind.rate ?? 0"
                            :color="ind.rateColor"
                            height="20"
                            rounded
                            class="mb-2"
                            max="100"
                          >
                            <template #default>
                              <span class="text-caption font-weight-bold">{{ ind.rateText }}</span>
                            </template>
                          </v-progress-linear>
                          <div class="d-flex justify-space-between align-center">
                            <span class="text-caption text-medium-emphasis">Variance</span>
                            <!-- Phase GD-3: size small for readability (Directive 231) -->
                            <v-chip
                              v-if="ind.hasVariance"
                              :color="ind.varianceColor"
                              size="small"
                              variant="tonal"
                            >
                              {{ ind.varianceSign }}{{ ind.varianceText }}
                            </v-chip>
                            <span v-else class="text-caption text-grey">—</span>
                          </div>
                        </v-card>
                        </NuxtLink>
                      </v-col>
                    </v-row>
                  </template>

                  <!-- No data state -->
                  <div v-if="!pillarData.hasData" class="text-center text-grey py-4">
                    No indicator data for this pillar
                  </div>

                  <!-- Pillar summary row -->
                  <v-divider class="mt-4" />
                  <div class="d-flex align-center justify-space-between pa-3 bg-grey-lighten-5 rounded-b">
                    <div class="text-caption text-medium-emphasis">
                      <v-icon size="small" class="mr-1">mdi-chart-box-outline</v-icon>
                      {{ pillarData.summary.withData }} of {{ pillarData.summary.totalIndicators }} indicators with data
                    </div>
                    <div class="d-flex align-center ga-2" style="min-width: 200px">
                      <!-- Phase GD-1: max=100 so 100% fills full width (Directive 229) -->
                      <v-progress-linear
                        :model-value="pillarData.summary.avgRate ?? 0"
                        :color="pillarData.summary.avgRateColor"
                        height="14"
                        rounded
                        max="100"
                        style="flex: 1"
                      />
                      <span class="text-body-2 font-weight-bold" style="min-width: 50px; text-align: right">
                        {{ pillarData.summary.avgRateText }}
                      </span>
                    </div>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </template>
        </div>

        </template>

        <!-- Phase EZ-D: Financial accomplishments analytics -->
        <template v-else-if="selectedReportingType === 'FINANCIAL'">

        <!-- Row 1: Financial Pillar Overview Cards -->
        <v-row class="mb-4" v-if="financialPillarSummary?.pillars?.length">
          <v-col cols="12">
            <div class="text-subtitle-1 font-weight-medium mb-3 d-flex align-center">
              <v-icon start size="small" color="primary">mdi-view-dashboard</v-icon>
              Budget Utilization Overview
            </div>
          </v-col>
          <v-col v-for="pillar in PILLARS" :key="pillar.id" cols="6" md="3">
            <NuxtLink :to="{ path: '/university-operations/financial', query: { year: selectedFiscalYear.toString(), pillar: pillar.id } }" class="text-decoration-none">
            <v-card
              variant="outlined"
              class="h-100 cursor-pointer"
              hover
            >
              <v-card-text class="pa-3">
                <div class="d-flex align-center mb-2">
                  <v-avatar :color="pillar.color" size="32" class="mr-2">
                    <v-icon size="18" color="white">{{ pillar.icon }}</v-icon>
                  </v-avatar>
                  <span class="text-subtitle-2 font-weight-medium">{{ pillar.name }}</span>
                </div>
                <div
                  v-if="financialPillarSummary?.pillars?.find((p: any) => p.pillar_type === pillar.id)"
                  class="d-flex flex-column"
                >
                  <div class="d-flex justify-space-between text-caption mb-1">
                    <span class="text-grey">Appropriation:</span>
                    <span class="font-weight-medium">₱{{ Number(financialPillarSummary.pillars.find((p: any) => p.pillar_type === pillar.id)?.total_appropriation || 0).toLocaleString() }}</span>
                  </div>
                  <div class="d-flex justify-space-between text-caption mb-1">
                    <span class="text-grey">Obligations:</span>
                    <span class="font-weight-medium">₱{{ Number(financialPillarSummary.pillars.find((p: any) => p.pillar_type === pillar.id)?.total_obligations || 0).toLocaleString() }}</span>
                  </div>
                  <div class="d-flex ga-1 mt-2 flex-wrap">
                    <v-chip
                      :color="Number(financialPillarSummary.pillars.find((p: any) => p.pillar_type === pillar.id)?.avg_utilization_rate || 0) >= 80 ? 'success' : Number(financialPillarSummary.pillars.find((p: any) => p.pillar_type === pillar.id)?.avg_utilization_rate || 0) >= 50 ? 'warning' : 'error'"
                      size="small"
                      variant="tonal"
                    >
                      {{ Number(financialPillarSummary.pillars.find((p: any) => p.pillar_type === pillar.id)?.avg_utilization_rate || 0).toFixed(1) }}% Utilization
                    </v-chip>
                    <v-chip size="small" variant="tonal" color="info">
                      {{ financialPillarSummary.pillars.find((p: any) => p.pillar_type === pillar.id)?.record_count || 0 }} records
                    </v-chip>
                  </div>
                </div>
                <div v-else class="text-caption text-grey">No financial data</div>
              </v-card-text>
            </v-card>
            </NuxtLink>
          </v-col>
        </v-row>

        <!-- Phase GV-1: Budget Absorption bar chart REMOVED — Directive 328
             Raw PHP values caused scale distortion (HE 500×+ larger than AE/Extension).
             Absolute amounts are covered by per-pillar expense table (GS-5) and YoY amount chart (GP-8). -->

        <!-- Phase GP-9: Campus Breakdown (Obligations by Campus per Pillar) -->
        <v-row class="mb-4" v-if="financialCampusBreakdown?.breakdown?.length">
          <v-col cols="12">
            <v-card variant="tonal" class="h-100">
              <v-card-title class="text-subtitle-1 d-flex align-center">
                <v-icon start size="small" color="purple">mdi-office-building</v-icon>
                Budget Obligations by Campus and Pillar
              </v-card-title>
              <v-card-text>
                <ClientOnly>
                  <VueApexCharts
                    v-if="campusBreakdownSeries.length"
                    type="bar"
                    height="300"
                    :options="campusBreakdownOptions"
                    :series="campusBreakdownSeries"
                  />
                  <div v-else class="text-center py-8 text-grey">
                    <v-icon size="48">mdi-office-building</v-icon>
                    <div class="mt-2">No campus-tagged financial records for this fiscal year</div>
                  </div>
                </ClientOnly>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Row 2: Utilization Radial + Expense Class Donut -->
        <v-row class="mb-4">
          <v-col cols="12" md="6">
            <v-card variant="tonal" class="h-100">
              <v-card-title class="text-subtitle-1 d-flex align-center">
                <v-icon start size="small" color="primary">mdi-chart-donut</v-icon>
                Utilization Rate by Pillar (%)
              </v-card-title>
              <v-card-text>
                <ClientOnly>
                  <VueApexCharts
                    v-if="financialPillarSummary?.pillars?.length"
                    type="radialBar"
                    height="280"
                    :options="financialPillarChartOptions"
                    :series="financialPillarChartSeries"
                  />
                  <div v-else class="text-center py-8 text-grey">
                    <v-icon size="48">mdi-chart-donut</v-icon>
                    <div class="mt-2">No financial data for selected fiscal year</div>
                  </div>
                </ClientOnly>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card variant="tonal" class="h-100">
              <v-card-title class="text-subtitle-1 d-flex align-center">
                <v-icon start size="small" color="orange">mdi-chart-pie</v-icon>
                Expense Class Breakdown (Obligations)
              </v-card-title>
              <v-card-text>
                <ClientOnly>
                  <VueApexCharts
                    v-if="expenseBreakdownSeries.length > 0"
                    type="donut"
                    height="280"
                    :options="expenseBreakdownOptions"
                    :series="expenseBreakdownSeries"
                  />
                  <div v-else class="text-center py-8 text-grey">
                    <v-icon size="48">mdi-chart-pie</v-icon>
                    <div class="mt-2">No expense class data available</div>
                  </div>
                </ClientOnly>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Phase GS-1: Financial Quarterly Trend chart REMOVED (Directive 311) -->

        <!-- Phase GS-5: Per-Pillar Expense Class Breakdown Table (Directive 315) -->
        <v-row v-if="pillarExpenseRows.length > 0" class="mb-4">
          <v-col cols="12">
            <v-card variant="tonal">
              <v-card-title class="text-subtitle-1 d-flex align-center">
                <v-icon start size="small" color="primary">mdi-table</v-icon>
                Expense Class Breakdown by Pillar (Obligations ₱)
              </v-card-title>
              <v-card-text class="pa-0">
                <v-table density="comfortable">
                  <thead>
                    <tr>
                      <th>Pillar</th>
                      <th class="text-right">PS</th>
                      <th class="text-right">MOOE</th>
                      <th class="text-right">CO</th>
                      <th class="text-right">Total Obligations</th>
                      <th class="text-right">Utilization %</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in pillarExpenseRows" :key="row.pillar">
                      <td>
                        <v-icon size="12" :color="row.color" class="mr-1">mdi-circle</v-icon>
                        {{ row.pillar }}
                      </td>
                      <td class="text-right">{{ row.ps_obligations ? `₱${row.ps_obligations.toLocaleString()}` : '—' }}</td>
                      <td class="text-right">{{ row.mooe_obligations ? `₱${row.mooe_obligations.toLocaleString()}` : '—' }}</td>
                      <td class="text-right">{{ row.co_obligations ? `₱${row.co_obligations.toLocaleString()}` : '—' }}</td>
                      <td class="text-right font-weight-bold">₱{{ row.total_obligations.toLocaleString() }}</td>
                      <td class="text-right">{{ row.utilization_rate }}%</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Row 4: Year-over-Year Financial Comparison — Utilization Rate -->
        <v-row class="mb-4">
          <v-col cols="12">
            <v-card variant="tonal" class="h-100">
              <v-card-title class="text-subtitle-1 d-flex align-center">
                <v-icon start size="small" color="orange">mdi-chart-bar</v-icon>
                Year-over-Year Comparison — Utilization Rate by Pillar (%)
              </v-card-title>
              <v-card-text>
                <ClientOnly>
                  <VueApexCharts
                    v-if="financialYearlyComparison?.years?.length"
                    type="bar"
                    height="400"
                    :options="financialYearlyOptions"
                    :series="financialYearlySeries"
                  />
                  <div v-else class="text-center py-8 text-grey">
                    <v-icon size="48">mdi-chart-bar</v-icon>
                    <div class="mt-2">No historical financial data available</div>
                  </div>
                </ClientOnly>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Phase GP-8: YoY Appropriation vs Obligations Amount Trend -->
        <v-row v-if="financialYearlyComparison?.years?.length">
          <v-col cols="12">
            <v-card variant="tonal" class="h-100">
              <v-card-title class="text-subtitle-1 d-flex align-center">
                <v-icon start size="small" color="primary">mdi-trending-up</v-icon>
                Year-over-Year: Appropriation vs Obligations (₱ Millions)
              </v-card-title>
              <v-card-text>
                <ClientOnly>
                  <VueApexCharts
                    type="bar"
                    height="300"
                    :options="financialYoyAmountOptions"
                    :series="financialYoyAmountSeries"
                  />
                </ClientOnly>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

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

    <!-- Phase IL-R: Operations Assignment Management (Admin only) -->
    <div v-if="isAdmin || isSuperAdmin" class="mt-6">
      <v-expansion-panels variant="accordion">
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon class="mr-2">mdi-account-group</v-icon>
            Operations Assignment Management
            <v-chip size="x-small" class="ml-2" color="primary" variant="flat">Admin</v-chip>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-progress-linear v-if="operationsLoading" indeterminate class="mb-3" />
            <v-table v-else density="compact">
              <thead>
                <tr>
                  <th>Operation</th>
                  <th>Type</th>
                  <th>Campus</th>
                  <th>Assignees</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="op in operations" :key="op.id">
                  <td class="text-body-2">{{ op.title }}</td>
                  <td class="text-caption text-grey">{{ op.operation_type }}</td>
                  <td class="text-caption text-grey">{{ op.campus }}</td>
                  <td>
                    <template v-if="op.assigned_users?.length">
                      <v-chip
                        v-for="u in op.assigned_users.slice(0, 2)"
                        :key="u.id"
                        size="x-small"
                        class="mr-1"
                      >{{ u.name }}</v-chip>
                      <v-chip v-if="op.assigned_users.length > 2" size="x-small" color="grey" variant="flat">
                        +{{ op.assigned_users.length - 2 }}
                      </v-chip>
                    </template>
                    <span v-else class="text-grey text-caption">—</span>
                  </td>
                  <td>
                    <v-tooltip text="Manage Assignees" location="top">
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          icon="mdi-account-multiple-plus"
                          size="small"
                          variant="text"
                          @click="openAssignDialog(op)"
                        />
                      </template>
                    </v-tooltip>
                  </td>
                </tr>
                <tr v-if="!operationsLoading && !operations.length">
                  <td colspan="5" class="text-center text-grey text-caption py-4">
                    No operations found for FY {{ selectedFiscalYear }}
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <!-- Phase IL-R: Manage Assignees Dialog -->
    <v-dialog v-model="assignDialog" max-width="520">
      <v-card>
        <v-card-title class="text-h6">
          Manage Assignees
          <span class="text-caption text-grey ml-2">{{ assignDialogOp?.title }}</span>
        </v-card-title>
        <v-card-text>
          <div class="mb-4">
            <div class="text-subtitle-2 mb-2">Current Assignees</div>
            <v-progress-circular v-if="dialogAssigneesLoading" indeterminate size="20" />
            <template v-else>
              <v-chip
                v-for="a in dialogAssignees"
                :key="a.userId"
                closable
                class="mr-1 mb-1"
                :disabled="assignActionLoading"
                @click:close="removeAssignee(a.userId)"
              >{{ getAssigneeName(a.userId) }}</v-chip>
              <span v-if="!dialogAssignees.length" class="text-grey text-caption">No assignees yet</span>
            </template>
          </div>
          <v-autocomplete
            v-model="assignAddUserId"
            label="Add Assignee"
            :items="eligibleUsers"
            :item-title="(u: any) => `${u.first_name} ${u.last_name}`"
            item-value="id"
            :loading="eligibleUsersLoading"
            clearable
            density="compact"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="assignDialog = false">Close</v-btn>
          <v-btn
            color="primary"
            :loading="assignActionLoading"
            :disabled="!assignAddUserId"
            @click="addAssignee"
          >Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
/* Phase GB-1: Reset NuxtLink anchor color — prevent blue text bleed into child elements (Directive 224) */
.text-decoration-none {
  color: inherit !important;
}
/* Phase GE-1: Annotation labels hidden until hover (Directive 232/233) */
:deep(.apexcharts-yaxis-annotations rect),
:deep(.apexcharts-yaxis-annotations text) {
  opacity: 0;
  transition: opacity 0.2s ease;
}
:deep(.apexcharts-yaxis-annotations:hover rect),
:deep(.apexcharts-yaxis-annotations:hover text) {
  opacity: 1;
}
</style>
