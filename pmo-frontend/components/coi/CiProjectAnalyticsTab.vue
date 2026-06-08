<script setup lang="ts">
/**
 * KD-F: Analytics tab for COI detail page.
 * KE-E: Added empty-state banner, FY utilization gauges, milestone slippage histogram,
 *        and document compliance donut.
 */
import VueApexCharts from 'vue3-apexcharts'
import type { UIProjectDetail } from '~/utils/adapters'
import { useCoiProgressReports } from '~/composables/useCoiProgressReports'

interface Props {
  projectId: string
  project: UIProjectDetail
}
const props = defineProps<Props>()

const api = useApi()
// ME: POW removed — analytics no longer references POW items

// AAA-J: self-contained progress-report fetch for the physical progress trend chart
const projectIdRef = computed(() => props.projectId)
const { items: progressReports } = useCoiProgressReports(projectIdRef)

function fmtCurrency(v: number | null): string {
  if (v == null) return '—'
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(v)
}

// KPI summary
const avgPhysicalProgress = computed(() => Number(props.project.physicalProgress || 0))

// AAA-C: Project Health summary computeds
const daysRemaining = computed<number | null>(() => {
  const end = (props.project as any).revisedCompletionDate || props.project.targetCompletionDate
  if (!end) return null
  return Math.ceil((new Date(end as string).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
})
const isDelayed = computed(() => daysRemaining.value != null && daysRemaining.value < 0)
const scheduleVarianceDays = computed<number | null>(() => {
  const original = (props.project as any).originalCompletionDate
  const revised = (props.project as any).revisedCompletionDate
  if (!original || !revised) return null
  return Math.ceil((new Date(revised as string).getTime() - new Date(original as string).getTime()) / (1000 * 60 * 60 * 24))
})
const healthStatusColor = computed(() => {
  const s = props.project.publicationStatus
  return s === 'PUBLISHED' ? 'success' : s === 'PENDING_REVIEW' ? 'warning' : s === 'REJECTED' ? 'error' : 'grey'
})
const healthStatusLabel = computed(() => {
  const s = props.project.publicationStatus
  return s === 'PUBLISHED' ? 'Published' : s === 'PENDING_REVIEW' ? 'Pending Review' : s === 'REJECTED' ? 'Rejected' : 'Draft'
})

// DDD-D: Stakeholder analytics — cost / snapshot computeds
const revisedCost = computed(() => {
  const fins = (props.project.financials || []) as any[]
  const total = fins.reduce((s, f) => s + Number(f.appropriation ?? 0), 0)
  return total || Number(props.project.totalContractAmount || 0)
})
const originalCost = computed(() => Number(props.project.totalContractAmount || 0))
const costToDate = computed(() => Number(props.project.costIncurredToDate || 0))
const costThisPeriod = computed(() => Number(props.project.costIncurredThisPeriod || 0))
const remainingBalance = computed(() => revisedCost.value - costToDate.value)
const budgetUtilPct = computed(() => revisedCost.value > 0 ? (costToDate.value / revisedCost.value) * 100 : 0)
const projectStage = computed(() => {
  const p = Number(props.project.physicalProgress || 0)
  if (p === 0) return 'Not Started'
  if (p < 25) return 'Early Stage'
  if (p < 75) return 'In Progress'
  if (p < 100) return 'Near Completion'
  return 'Completed'
})
function fmtDate(iso?: string | null): string {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) }
  catch { return iso }
}

// GGG-C: Executive analytics — time performance + gauge configs
const totalContractDays = computed<number | null>(() => {
  const start = (props.project as any).startDate || (props.project as any).originalStartDate
  const end = (props.project as any).revisedCompletionDate || props.project.targetCompletionDate
  if (!start || !end) return null
  const d = Math.ceil((new Date(end as string).getTime() - new Date(start as string).getTime()) / (1000 * 60 * 60 * 24))
  return d > 0 ? d : null
})
const daysElapsed = computed<number | null>(() => {
  const start = (props.project as any).startDate || (props.project as any).originalStartDate
  if (!start) return null
  const d = Math.ceil((Date.now() - new Date(start as string).getTime()) / (1000 * 60 * 60 * 24))
  return d > 0 ? d : 0
})
const timeElapsedPct = computed(() => {
  if (!totalContractDays.value || daysElapsed.value == null) return 0
  return Math.min(100, (daysElapsed.value / totalContractDays.value) * 100)
})

function gaugeOptions(label: string, color: string) {
  return {
    chart: { type: 'radialBar' as const, sparkline: { enabled: true } },
    plotOptions: {
      radialBar: {
        hollow: { size: '58%' },
        dataLabels: {
          name: { show: true, offsetY: 22, fontSize: '12px', color: '#888' },
          value: { offsetY: -12, fontSize: '22px', fontWeight: 700, formatter: (v: number) => `${v.toFixed(0)}%` },
        },
      },
    },
    colors: [color],
    labels: [label],
    stroke: { lineCap: 'round' as const },
  }
}
const physicalGauge = computed(() => ({ series: [Number(avgPhysicalProgress.value.toFixed(1))], options: gaugeOptions('Physical', '#1976D2') }))
// ZZZ-A: Financial Utilization gauge uses computed obligation/appropriation ratio; falls back to financialProgress
const financialGauge = computed(() => ({ series: [Number((financialUtilization.value ?? Number(props.project.financialProgress) ?? 0).toFixed(1))], options: gaugeOptions('Financial', '#43A047') }))

// BBB-A: milestoneCompletionRate removed (milestone CRUD removed from edit page per ADR-011)

const financialUtilization = computed(() => {
  const fins = (props.project.financials || []) as any[]
  if (!fins.length) return null
  const totalApp = fins.reduce((s, f) => s + Number(f.appropriation ?? 0), 0)
  const totalObl = fins.reduce((s, f) => s + Number(f.obligation ?? f.obligations ?? 0), 0)
  return totalApp > 0 ? (totalObl / totalApp) * 100 : 0
})

// ZZZ-B: Financial Utilization % with fallback to financialProgress (for Performance Indicators + Financial Summary)
const financialUtilPct = computed(() => financialUtilization.value ?? Number(props.project.financialProgress) ?? 0)

// ZZZ-B: Current reporting period — latest fiscal year present in financials
const latestReportingPeriod = computed<string>(() => {
  const fins = (props.project.financials || []) as any[]
  if (!fins.length) return '—'
  const years = fins
    .map((f) => Number(f.fiscalYear ?? f.fiscal_year ?? 0))
    .filter((y) => y > 0)
  return years.length ? `FY ${Math.max(...years)}` : '—'
})

// ───────────────────────────────────────────────
// KE-E-4: Document checklist fetch
// ───────────────────────────────────────────────
const checklist = ref<any[]>([])
const checklistLoading = ref(false)

async function fetchChecklist() {
  if (!props.projectId) return
  checklistLoading.value = true
  try {
    const res = await api.get<any>(`/api/construction-projects/${props.projectId}/document-checklist`)
    checklist.value = Array.isArray(res) ? res : (res as any)?.data || []
  } catch {
    checklist.value = []
  } finally {
    checklistLoading.value = false
  }
}

onMounted(() => { fetchChecklist() })
// FFF-D: Re-fetch checklist when analytics tab is re-activated (e.g. after uploading docs)
onActivated(() => { fetchChecklist() })

const hasChecklistData = computed(() => checklist.value.length > 0)

// ───────────────────────────────────────────────
// KE-E-1: Empty-state detection
// ───────────────────────────────────────────────
const hasPowData = computed(() => false) // ME: POW removed
// BBB-A: hasFinancialData driven by progress_reports (financials array permanently empty per NI-2026-05-21)
const hasFinancialData = computed(() => ((props.project as any).progress_reports || []).length > 0)
// BBB-A: hasMilestoneData removed — milestone charts removed per R-052

const allEmpty = computed(() =>
  !hasFinancialData.value && !hasChecklistData.value,
)

// BBB-A: fyUtilizationGauges removed — project.financials[] permanently empty (ConstructionProjectFinancial archived NI-2026-05-21)
// BBB-A: milestoneSlippageChart removed — milestone CRUD removed from edit page per ADR-011

// ───────────────────────────────────────────────
// EEE-A: Compliance Scorecard (group-level bars, replaces status donut)
// ───────────────────────────────────────────────
const complianceScorecard = computed(() => {
  if (!checklist.value.length) return []
  const groups = new Map<string, { label: string; total: number; approved: number }>()
  for (const item of checklist.value) {
    const code: string = (item as any).documentType?.groupCode || 'OTHER'
    const label: string = (item as any).documentType?.groupLabel || code.replace(/_/g, ' ')
    const entry = groups.get(code) || { label, total: 0, approved: 0 }
    entry.total++
    const status: string = (item as any).submissionStatus || (item as any).submission_status || 'NOT_SUBMITTED'
    if (status === 'APPROVED') entry.approved++
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
  const approved = checklist.value.filter(
    (i: any) => (i.submissionStatus || i.submission_status) === 'APPROVED',
  ).length
  return Math.round((approved / checklist.value.length) * 100)
})

// FFF-D: Compliance donut — restored alongside scorecard (status breakdown)
const STATUS_ORDER = ['NOT_SUBMITTED', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] as const
const STATUS_COLORS: Record<string, string> = {
  NOT_SUBMITTED: '#9E9E9E',
  SUBMITTED: '#1976D2',
  UNDER_REVIEW: '#FB8C00',
  APPROVED: '#43A047',
  REJECTED: '#E53935',
}
const complianceDonutChart = computed(() => {
  const counts: Record<string, number> = {}
  for (const item of checklist.value) {
    const s: string = (item as any).submissionStatus || (item as any).submission_status || 'NOT_SUBMITTED'
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

// BBB-A: financialChart (FY bar), hasNonZeroFinancials, milestoneChart, hasNonZeroMilestones removed
// BBB-A: fyTotals, fyObligationRate removed — project.financials[] permanently empty (R-051)

// BBB-A: Cost Incurred Progression chart — replaces FY bar chart; uses actual progress report data
const costProgressionChart = computed(() => {
  const sorted = [...progressReports.value]
    .filter(r => r.costIncurredToDate != null && Number(r.costIncurredToDate) > 0)
    .sort((a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime())
  const categories = sorted.map(r => r.reportDate.slice(0, 7))
  const data = sorted.map(r => Number(r.costIncurredToDate || 0))
  return {
    hasData: sorted.length >= 2,
    series: [{ name: 'Cost Incurred to Date (₱)', data }],
    options: {
      chart: { type: 'area' as const, toolbar: { show: false } },
      stroke: { curve: 'smooth' as const, width: 2 },
      fill: { type: 'gradient', gradient: { shadeIntensity: 0.3, opacityFrom: 0.4, opacityTo: 0.05 } },
      colors: ['#43A047'],
      xaxis: { categories, labels: { rotate: -30, style: { fontSize: '10px' } }, title: { text: 'Report Period' } },
      yaxis: { labels: { formatter: (v: number) => fmtCurrency(v) }, title: { text: 'Cost (₱)' } },
      tooltip: { y: { formatter: (v: number) => fmtCurrency(v) } },
      markers: { size: 4 },
    },
  }
})

// ───────────────────────────────────────────────
// AAA-J: Physical progress trend (actual vs planned per reporting period)
// ───────────────────────────────────────────────
const physicalTrendChart = computed(() => {
  const sorted = [...progressReports.value]
    .filter(r => r.reportDate)
    .sort((a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime())
  const categories = sorted.map(r => r.reportDate.slice(0, 7)) // YYYY-MM
  const actual = sorted.map(r => Number(r.percentageCompletion || 0))
  const planned = sorted.map(r => (r.plannedAccomplishment != null ? Number(r.plannedAccomplishment) : null))
  const hasPlanned = planned.some(v => v != null)
  const series: { name: string; type: string; data: (number | null)[] }[] = [
    { name: 'Actual Physical %', type: 'area', data: actual },
  ]
  if (hasPlanned) series.push({ name: 'Planned %', type: 'line', data: planned })
  return {
    hasData: sorted.length >= 2,
    series,
    options: {
      chart: { type: 'line' as const, toolbar: { show: false } },
      stroke: { curve: 'smooth' as const, width: hasPlanned ? [2, 2] : [2], dashArray: hasPlanned ? [0, 5] : [0] },
      fill: { type: hasPlanned ? ['gradient', 'solid'] : ['gradient'], gradient: { shadeIntensity: 0.3, opacityFrom: 0.4, opacityTo: 0.05 } },
      colors: ['#1976D2', '#9E9E9E'],
      xaxis: { categories, labels: { rotate: -30, style: { fontSize: '10px' } }, title: { text: 'Report Period' } },
      yaxis: { min: 0, max: 100, labels: { formatter: (v: number) => `${v}%` }, title: { text: 'Physical %' } },
      tooltip: { y: { formatter: (v: number) => `${v}%` } },
      legend: { show: hasPlanned },
      markers: { size: 4 },
    },
  }
})

// BBB-A: milestoneDonutChart removed — milestone CRUD removed from edit page per ADR-011 (R-052)

</script>

<template>
  <div>
    <!-- KJ-B: Clean empty-state when no data exists -->
    <template v-if="allEmpty">
      <v-card variant="outlined" class="text-center pa-10 rounded-lg">
        <v-icon icon="mdi-chart-bar" size="64" color="grey-lighten-2" class="d-block mx-auto mb-4" />
        <div class="text-h6 font-weight-medium text-grey mb-2">No Analytics Data Yet</div>
        <div class="text-body-2 text-grey mb-4">
          Analytics will appear once this project has progress reports or compliance data.
        </div>
        <v-btn variant="tonal" color="primary" size="small" prepend-icon="mdi-pencil" @click="$emit('go-to-edit')">
          Add Data via Edit Project
        </v-btn>
      </v-card>
    </template>

    <template v-if="!allEmpty">
    <!-- GGG-C: Executive Analytics Dashboard -->

    <!-- ROW 1: PROJECT SNAPSHOT -->
    <v-alert variant="tonal" color="blue-grey" density="compact" class="mb-3" icon="mdi-information-outline">
      <span class="text-subtitle-2 font-weight-semibold">Project Snapshot</span>
      <div class="text-caption">High-level project performance, schedule standing, and financial position at a glance.</div>
    </v-alert>
    <v-row dense class="mb-5">
      <v-col cols="6" sm="4" md="2">
        <v-card variant="tonal" :color="healthStatusColor" class="pa-3 h-100" rounded="lg">
          <div class="text-caption text-grey">Project Status</div>
          <div class="text-subtitle-2 font-weight-bold mt-1">{{ healthStatusLabel }}</div>
          <div class="text-caption text-grey">{{ projectStage }}</div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card variant="tonal" color="primary" class="pa-3 h-100" rounded="lg">
          <div class="text-caption text-grey">Physical Progress</div>
          <div class="text-h6 font-weight-bold">{{ avgPhysicalProgress.toFixed(1) }}%</div>
          <v-progress-linear :model-value="avgPhysicalProgress" height="4" rounded class="mt-1" />
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card variant="tonal" color="success" class="pa-3 h-100" rounded="lg">
          <div class="text-caption text-grey">Financial Utilization</div>
          <div class="text-h6 font-weight-bold">{{ budgetUtilPct.toFixed(1) }}%</div>
          <v-progress-linear :model-value="budgetUtilPct" height="4" color="success" rounded class="mt-1" />
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card variant="outlined" class="pa-3 h-100" rounded="lg">
          <div class="text-caption text-grey">Original Cost</div>
          <div class="text-subtitle-2 font-weight-bold">{{ fmtCurrency(originalCost) }}</div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card variant="tonal" color="info" class="pa-3 h-100" rounded="lg">
          <div class="text-caption text-grey">Cost Incurred</div>
          <div class="text-subtitle-2 font-weight-bold">{{ fmtCurrency(costToDate) }}</div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card variant="tonal" :color="isDelayed ? 'error' : 'success'" class="pa-3 h-100" rounded="lg">
          <div class="text-caption text-grey">{{ isDelayed ? 'Days Overdue' : 'Days Remaining' }}</div>
          <div class="text-h6 font-weight-bold">{{ daysRemaining != null ? Math.abs(daysRemaining) : '—' }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- ROW 2: PROJECT DATES + PROJECT COST -->
    <v-row class="mb-2">
      <v-col cols="12" md="6">
        <v-alert variant="tonal" color="blue-grey" density="compact" class="mb-3" icon="mdi-calendar-range">
          <span class="text-subtitle-2 font-weight-semibold">Project Dates</span>
          <div class="text-caption">Key schedule dates and any approved contract time extensions.</div>
        </v-alert>
        <v-row dense>
          <v-col v-for="(item, i) in [
            { label: 'Original Start Date', value: (props.project as any).originalStartDate || (props.project as any).startDate },
            { label: 'Original End Date', value: (props.project as any).originalCompletionDate || props.project.targetCompletionDate },
            { label: 'Revised Start Date', value: (props.project as any).revisedStartDate },
            { label: 'Revised End Date', value: (props.project as any).revisedCompletionDate },
          ]" :key="i" cols="6">
            <v-card variant="outlined" class="pa-3 h-100" rounded="lg">
              <div class="text-caption text-grey">{{ item.label }}</div>
              <div class="text-body-2 font-weight-medium">{{ item.value ? fmtDate(item.value) : '—' }}</div>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" md="6">
        <v-alert variant="tonal" color="blue-grey" density="compact" class="mb-3" icon="mdi-cash-multiple">
          <span class="text-subtitle-2 font-weight-semibold">Project Cost</span>
          <div class="text-caption">Contract commitments and current expenditure status.</div>
        </v-alert>
        <v-row dense>
          <v-col cols="6">
            <v-card variant="outlined" class="pa-3 h-100" rounded="lg">
              <div class="text-caption text-grey">Original Contract Amount</div>
              <div class="text-body-2 font-weight-bold">{{ fmtCurrency(originalCost) }}</div>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card variant="outlined" class="pa-3 h-100" rounded="lg">
              <div class="text-caption text-grey">Revised Contract Amount</div>
              <div class="text-body-2 font-weight-bold">{{ fmtCurrency(revisedCost) }}</div>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card variant="tonal" color="blue-grey" class="pa-3 h-100" rounded="lg">
              <div class="text-caption text-grey">Cost This Period</div>
              <div class="text-body-2 font-weight-bold">{{ fmtCurrency(costThisPeriod) }}</div>
              <div v-if="costThisPeriod > 0 && props.project.latestProgressReportDate" class="text-grey" style="font-size:10px">from {{ fmtDate(props.project.latestProgressReportDate) }}</div>
              <div v-else-if="costThisPeriod <= 0" class="text-grey-lighten-1" style="font-size:10px">No progress report filed</div>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card variant="tonal" color="info" class="pa-3 h-100" rounded="lg">
              <div class="text-caption text-grey">Cost To Date</div>
              <div class="text-body-2 font-weight-bold">{{ fmtCurrency(costToDate) }}</div>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- ROW 3: EXECUTIVE VISUALIZATIONS -->
    <v-alert variant="tonal" color="blue-grey" density="compact" class="mb-3" icon="mdi-chart-arc">
      <span class="text-subtitle-2 font-weight-semibold">Performance Indicators</span>
      <div class="text-caption">Visual gauges for rapid assessment of physical, financial, and schedule performance.</div>
    </v-alert>
    <v-row dense class="mb-4">
      <v-col cols="12" sm="4">
        <v-card variant="outlined" class="pa-3 h-100 text-center" rounded="lg">
          <div class="text-caption text-grey mb-1">Physical Progress</div>
          <VueApexCharts type="radialBar" :series="physicalGauge.series" :options="physicalGauge.options" height="180" />
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card variant="outlined" class="pa-3 h-100 text-center" rounded="lg">
          <div class="text-caption text-grey mb-1">Financial Utilization</div>
          <VueApexCharts type="radialBar" :series="financialGauge.series" :options="financialGauge.options" height="180" />
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <!-- ZZZ-B: 6-stat performance information card (replaces single time-elapsed bar) -->
        <v-card variant="outlined" class="pa-3 h-100" rounded="lg">
          <div class="text-caption text-grey mb-2 text-center">Key Performance Stats</div>
          <v-row dense>
            <v-col cols="6">
              <div class="text-caption text-grey">Physical Progress</div>
              <div class="text-body-2 font-weight-bold">{{ avgPhysicalProgress.toFixed(1) }}%</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-grey">Financial Utilization</div>
              <div class="text-body-2 font-weight-bold">{{ financialUtilPct.toFixed(1) }}%</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-grey">Days Elapsed</div>
              <div class="text-body-2 font-weight-bold">{{ daysElapsed != null ? daysElapsed : '—' }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-grey">{{ isDelayed ? 'Days Overdue' : 'Days Remaining' }}</div>
              <div class="text-body-2 font-weight-bold" :class="isDelayed ? 'text-error' : ''">{{ daysRemaining != null ? Math.abs(daysRemaining) : '—' }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-grey">Reporting Period</div>
              <div class="text-body-2 font-weight-bold">{{ latestReportingPeriod }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-grey">Project Stage</div>
              <div class="text-body-2 font-weight-bold">{{ projectStage }}</div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- DDD-A: Financial Summary banner with data source attribution -->
    <v-alert variant="tonal" color="blue-grey" density="compact" class="mb-3" icon="mdi-cash-multiple">
      <span class="text-subtitle-2 font-weight-semibold">Financial Summary</span>
      <div class="text-caption">Contract cost positions, fund source, and current expenditure utilization.</div>
      <div class="text-caption text-grey-darken-1 mt-1 d-flex align-center ga-1">
        <v-icon size="11">mdi-database-outline</v-icon>
        Sources: Project Profile (contract amounts) · Progress Reports (cost incurred) · Funding Source record
      </div>
    </v-alert>
    <v-row dense class="mb-4">
      <v-col cols="6" sm="4" md="2">
        <v-card variant="outlined" class="pa-3 h-100" rounded="lg">
          <div class="text-caption text-grey">Original Cost</div>
          <div class="text-body-2 font-weight-bold">{{ fmtCurrency(originalCost) }}</div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card variant="outlined" class="pa-3 h-100" rounded="lg">
          <div class="text-caption text-grey">Revised Cost</div>
          <div class="text-body-2 font-weight-bold">{{ fmtCurrency(revisedCost) }}</div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card variant="outlined" class="pa-3 h-100" rounded="lg">
          <div class="text-caption text-grey">Fund Source</div>
          <div class="text-body-2 font-weight-medium">{{ props.project.fundSource || '—' }}</div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card variant="tonal" color="blue-grey" class="pa-3 h-100" rounded="lg">
          <div class="text-caption text-grey">Cost This Period</div>
          <div class="text-body-2 font-weight-bold">{{ fmtCurrency(costThisPeriod) }}</div>
          <div v-if="costThisPeriod > 0 && props.project.latestProgressReportDate" class="text-grey" style="font-size:10px">from {{ fmtDate(props.project.latestProgressReportDate) }}</div>
          <div v-else-if="costThisPeriod <= 0" class="text-grey-lighten-1" style="font-size:10px">No progress report filed</div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card variant="tonal" color="info" class="pa-3 h-100" rounded="lg">
          <div class="text-caption text-grey">Cost To Date</div>
          <div class="text-body-2 font-weight-bold">{{ fmtCurrency(costToDate) }}</div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card variant="tonal" color="success" class="pa-3 h-100" rounded="lg">
          <div class="text-caption text-grey">Financial Utilization</div>
          <div class="text-body-2 font-weight-bold">{{ financialUtilPct.toFixed(1) }}%</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- DDD-A: Physical Progress Trend — upgraded to v-alert banner with data source -->
    <v-row v-if="physicalTrendChart.hasData" dense class="mb-1">
      <v-col cols="12">
        <v-alert variant="tonal" color="primary" density="compact" class="mb-2" icon="mdi-trending-up">
          <span class="text-subtitle-2 font-weight-semibold">Physical Progress Trend</span>
          <div class="text-caption mt-1">Actual vs planned physical accomplishment per reporting period. Displays project trajectory and slippage.</div>
          <div class="text-caption text-grey-darken-1 mt-1 d-flex align-center ga-1">
            <v-icon size="11">mdi-database-outline</v-icon>
            Source: Progress Reports (percentageCompletion, plannedAccomplishment)
          </div>
        </v-alert>
        <v-card class="pa-3" variant="outlined" rounded="lg">
          <VueApexCharts
            type="line"
            :series="physicalTrendChart.series"
            :options="physicalTrendChart.options"
            height="240"
          />
        </v-card>
      </v-col>
    </v-row>

    <!-- DDD-A: Cost Utilization compact KPI (not half-screen) + Cost Incurred Progression full-width -->
    <v-row dense>
      <!-- Compact Cost Utilization KPI card -->
      <v-col cols="12" md="4">
        <v-card class="pa-3 mb-3 h-100" variant="outlined" rounded="lg">
          <div class="text-caption text-grey mb-1">Cost Utilization</div>
          <div class="text-h5 font-weight-bold" :class="budgetUtilPct > 100 ? 'text-error' : 'text-success'">{{ budgetUtilPct.toFixed(1) }}%</div>
          <v-progress-linear :model-value="budgetUtilPct" :color="budgetUtilPct > 100 ? 'error' : 'success'" height="6" rounded class="mt-1 mb-1" />
          <div class="text-caption text-grey">{{ fmtCurrency(costToDate) }} spent</div>
          <div class="text-caption text-grey">{{ fmtCurrency(remainingBalance) }} remaining</div>
          <div class="text-caption text-grey-lighten-1 mt-1 d-flex align-center ga-1">
            <v-icon size="10">mdi-database-outline</v-icon>
            Progress Reports · Project Profile
          </div>
        </v-card>
      </v-col>
      <!-- DDD-A: Cost Incurred Progression — expanded to 8 cols with full banner -->
      <v-col cols="12" md="8">
        <v-alert variant="tonal" color="success" density="compact" class="mb-2" icon="mdi-cash-clock">
          <span class="text-subtitle-2 font-weight-semibold">Cost Incurred Progression</span>
          <div class="text-caption mt-1">Cumulative cost incurred per reporting period. Shows financial burn rate over the project timeline.</div>
          <div class="text-caption text-grey-darken-1 mt-1 d-flex align-center ga-1">
            <v-icon size="11">mdi-database-outline</v-icon>
            Source: Progress Reports
          </div>
        </v-alert>
        <v-card class="pa-2" variant="outlined" rounded="lg">
          <div v-if="!costProgressionChart.hasData" class="text-center py-6 text-grey text-body-2">
            No cost data recorded yet — file Progress Reports with cost amounts to see the progression.
          </div>
          <VueApexCharts
            v-else
            type="area"
            :series="costProgressionChart.series"
            :options="costProgressionChart.options"
            height="220"
          />
        </v-card>
      </v-col>

      <!-- AAA-H: Governance & Compliance section separator -->
      <v-col cols="12">
        <v-alert variant="tonal" color="blue-grey" density="compact" class="mb-1 mt-2" icon="mdi-shield-check-outline">
          <span class="text-subtitle-2 font-weight-semibold">Governance &amp; Compliance</span>
          <div class="text-caption">Document submission and compliance checklist status for this project.</div>
        </v-alert>
      </v-col>

      <!-- EEE-A: Compliance Scorecard (left) + FFF-D: Donut restored (right) -->
      <v-col cols="12" md="6">
        <v-card class="pa-3 mb-3 h-100" variant="outlined" rounded="lg">
          <div class="d-flex align-center justify-space-between mb-3">
            <span class="text-subtitle-2 font-weight-semibold">Compliance by Category</span>
            <v-chip
              v-if="!checklistLoading && hasChecklistData"
              :color="overallCompliancePct === 100 ? 'success' : overallCompliancePct > 50 ? 'warning' : 'error'"
              size="small" variant="tonal"
            >
              {{ overallCompliancePct }}% Overall
            </v-chip>
          </div>
          <div v-if="checklistLoading" class="text-center py-4">
            <v-progress-circular indeterminate size="20" />
          </div>
          <div v-else-if="!hasChecklistData" class="text-center py-4 text-grey text-body-2">
            No checklist data
          </div>
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

      <!-- FFF-D: Submission Status Breakdown (restored donut) -->
      <v-col cols="12" md="6">
        <v-card class="pa-3 mb-3 h-100" variant="outlined" rounded="lg">
          <div class="text-subtitle-2 font-weight-semibold mb-2">Submission Status Breakdown</div>
          <div v-if="checklistLoading" class="text-center py-6 text-grey">
            <v-progress-circular indeterminate size="24" />
          </div>
          <div v-else-if="!hasChecklistData" class="text-center py-6 text-grey text-body-2">
            No checklist data
          </div>
          <template v-else>
            <div class="text-caption text-medium-emphasis mb-2 text-center">
              {{ complianceDonutChart.approvedCount }} of {{ complianceDonutChart.total }} documents approved
            </div>
            <VueApexCharts
              type="donut"
              :series="complianceDonutChart.series"
              :options="complianceDonutChart.options"
              height="260"
            />
          </template>
        </v-card>
      </v-col>
    </v-row>
    </template>
  </div>
</template>
