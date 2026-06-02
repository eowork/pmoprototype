<script setup lang="ts">
/**
 * KD-F: Analytics tab for COI detail page.
 * KE-E: Added empty-state banner, FY utilization gauges, milestone slippage histogram,
 *        and document compliance donut.
 */
import VueApexCharts from 'vue3-apexcharts'
import type { UIProjectDetail } from '~/utils/adapters'

interface Props {
  projectId: string
  project: UIProjectDetail
}
const props = defineProps<Props>()

const api = useApi()
// ME: POW removed — analytics no longer references POW items

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

const milestoneCompletionRate = computed(() => {
  const ms = props.project.milestones || []
  if (!ms.length) return 0
  const completed = ms.filter((m: any) => (m.status || '').toUpperCase() === 'COMPLETED').length
  return (completed / ms.length) * 100
})

const financialUtilization = computed(() => {
  const fins = (props.project.financials || []) as any[]
  if (!fins.length) return null
  const totalApp = fins.reduce((s, f) => s + Number(f.appropriation ?? 0), 0)
  const totalObl = fins.reduce((s, f) => s + Number(f.obligation ?? f.obligations ?? 0), 0)
  return totalApp > 0 ? (totalObl / totalApp) * 100 : 0
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

const hasChecklistData = computed(() => checklist.value.length > 0)

// ───────────────────────────────────────────────
// KE-E-1: Empty-state detection
// ───────────────────────────────────────────────
const hasPowData = computed(() => false) // ME: POW removed
// NI (2026-05-21): Repointed from project.financials → project.progress_reports
const hasFinancialData = computed(() => ((props.project as any).progress_reports || (props.project as any).financials || []).length > 0)
const hasMilestoneData = computed(() => (props.project.milestones || []).length > 0)

const allEmpty = computed(() =>
  !hasFinancialData.value && !hasMilestoneData.value && !hasChecklistData.value,
)

// ───────────────────────────────────────────────
// KE-E-2: Per-FY utilization gauges
// ───────────────────────────────────────────────
const fyUtilizationGauges = computed(() => {
  const fins = (props.project.financials || []) as any[]
  const sorted = [...fins].sort((a, b) => (a.fiscalYear ?? a.fiscal_year ?? 0) - (b.fiscalYear ?? b.fiscal_year ?? 0))
  return sorted.map(f => {
    const app = Number(f.appropriation ?? 0)
    const obl = Number(f.obligation ?? f.obligations ?? 0)
    const rate = app > 0 ? Math.min(100, (obl / app) * 100) : 0
    const fy = f.fiscalYear ?? f.fiscal_year ?? '—'
    const color = rate >= 80 ? '#43A047' : rate >= 50 ? '#FB8C00' : '#E53935'
    return {
      fy,
      series: [+rate.toFixed(1)],
      options: {
        chart: { type: 'radialBar', sparkline: { enabled: true } },
        plotOptions: {
          radialBar: {
            hollow: { size: '50%' },
            dataLabels: {
              name: { show: true, offsetY: -6, fontSize: '11px' },
              value: { fontSize: '14px', fontWeight: 'bold', formatter: (v: number) => `${v}%` },
            },
          },
        },
        colors: [color],
        labels: [`FY ${fy}`],
      },
    }
  })
})

// ───────────────────────────────────────────────
// KE-E-3: Milestone slippage histogram
// ───────────────────────────────────────────────
const SLIPPAGE_BINS = ['On time', '1-7 days late', '8-30 days late', '30+ days late'] as const

const milestoneSlippageChart = computed(() => {
  const ms = (props.project.milestones || []) as any[]
  const counts = { 'On time': 0, '1-7 days late': 0, '8-30 days late': 0, '30+ days late': 0 }
  let hasData = false
  for (const m of ms) {
    const target = m.targetDate || m.target_completion_date
    const actual = m.actualDate || m.actual_completion_date
    if (!target || !actual) continue
    hasData = true
    const diff = Math.floor(
      (new Date(actual).getTime() - new Date(target).getTime()) / 86_400_000,
    )
    if (diff <= 0) counts['On time']++
    else if (diff <= 7) counts['1-7 days late']++
    else if (diff <= 30) counts['8-30 days late']++
    else counts['30+ days late']++
  }
  return {
    hasData,
    series: [{ name: 'Milestones', data: SLIPPAGE_BINS.map(b => counts[b]) }],
    options: {
      chart: { type: 'bar' as const },
      plotOptions: { bar: { distributed: true, borderRadius: 4 } },
      xaxis: { categories: [...SLIPPAGE_BINS] },
      yaxis: { title: { text: 'Count' }, labels: { formatter: (v: number) => String(v) } },
      colors: ['#43A047', '#FB8C00', '#E53935', '#B71C1C'],
      dataLabels: { enabled: true },
      legend: { show: false },
    },
  }
})

// ───────────────────────────────────────────────
// KE-E-4: Document compliance donut
// ───────────────────────────────────────────────
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
    const s = item.submissionStatus || item.submission_status || 'NOT_SUBMITTED'
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

// ME: POW status/category charts removed

// Financial stacked bar (per FY)
const financialChart = computed(() => {
  const fins = (props.project.financials || []) as any[]
  const sorted = [...fins].sort((a, b) => (a.fiscalYear || a.fiscal_year) - (b.fiscalYear || b.fiscal_year))
  const years = sorted.map(f => String(f.fiscalYear ?? f.fiscal_year))
  return {
    series: [
      { name: 'Appropriation', data: sorted.map(f => Number(f.appropriation ?? 0)) },
      { name: 'Obligations',   data: sorted.map(f => Number(f.obligation ?? f.obligations ?? 0)) },
      { name: 'Disbursement',  data: sorted.map(f => Number(f.disbursement ?? 0)) },
    ],
    options: {
      chart: { type: 'bar' as const, stacked: false },
      xaxis: { categories: years, title: { text: 'Fiscal Year' } },
      yaxis: { labels: { formatter: (v: number) => fmtCurrency(v) } },
      colors: ['#1976D2', '#FB8C00', '#43A047'],
      dataLabels: { enabled: false },
      tooltip: { y: { formatter: (v: number) => fmtCurrency(v) } },
    },
  }
})

// KK-B: Financial series guard — suppress when ALL FY values across all series are zero
const hasNonZeroFinancials = computed(() =>
  financialChart.value.series.some(s => (s.data ?? []).some((v: number) => v > 0)),
)

// Milestone progress bar
const milestoneChart = computed(() => {
  const ms = (props.project.milestones || []) as any[]
  return {
    series: [{ name: 'Progress %', data: ms.map(m => Number(m.progress || 0)) }],
    options: {
      chart: { type: 'bar' as const },
      plotOptions: { bar: { horizontal: true } },
      // KG-B: ApexCharts horizontal bar uses xaxis.categories for category labels
      xaxis: {
        categories: ms.map(m => m.title || m.name || '—'),
        max: 100,
        title: { text: 'Progress %' },
      },
      yaxis: {},
      colors: ['#43A047'],
      dataLabels: { enabled: true, formatter: (v: number) => `${v}%` },
    },
  }
})

// KK-B: Milestone series guard
const hasNonZeroMilestones = computed(() =>
  (milestoneChart.value.series[0]?.data ?? []).some((v: number) => v > 0),
)

</script>

<template>
  <div>
    <!-- KJ-B: Clean empty-state when no data exists -->
    <template v-if="allEmpty">
      <v-card variant="outlined" class="text-center pa-10 rounded-lg">
        <v-icon icon="mdi-chart-bar" size="64" color="grey-lighten-2" class="d-block mx-auto mb-4" />
        <div class="text-h6 font-weight-medium text-grey mb-2">No Analytics Data Yet</div>
        <div class="text-body-2 text-grey mb-4">
          Analytics will appear once this project has financial entries, milestones, or compliance data.
        </div>
        <v-btn variant="tonal" color="primary" size="small" prepend-icon="mdi-pencil" @click="$emit('go-to-edit')">
          Add Data via Edit Project
        </v-btn>
      </v-card>
    </template>

    <template v-if="!allEmpty">
    <!-- AAA-C: Project Health Summary row -->
    <v-card variant="tonal" color="primary" class="mb-4 pa-3" rounded="lg">
      <div class="text-overline text-medium-emphasis mb-2">Project Health</div>
      <v-row dense>
        <v-col cols="6" sm="3">
          <div class="text-caption text-grey">Physical Progress</div>
          <div class="text-h5 font-weight-bold">{{ avgPhysicalProgress.toFixed(1) }}%</div>
        </v-col>
        <v-col cols="6" sm="3">
          <div class="text-caption text-grey">Status</div>
          <v-chip size="small" :color="healthStatusColor" variant="tonal" class="mt-1">{{ healthStatusLabel }}</v-chip>
        </v-col>
        <v-col v-if="daysRemaining != null" cols="6" sm="3">
          <div class="text-caption text-grey">{{ isDelayed ? 'Days Overdue' : 'Days Remaining' }}</div>
          <div class="text-h5 font-weight-bold" :class="isDelayed ? 'text-error' : ''">
            {{ Math.abs(daysRemaining) }}
          </div>
        </v-col>
        <v-col v-if="scheduleVarianceDays != null" cols="6" sm="3">
          <div class="text-caption text-grey">Schedule Extension</div>
          <div class="text-body-1 font-weight-bold" :class="scheduleVarianceDays > 0 ? 'text-warning' : 'text-success'">
            {{ scheduleVarianceDays > 0 ? `+${scheduleVarianceDays}d` : scheduleVarianceDays === 0 ? 'On schedule' : `${scheduleVarianceDays}d` }}
          </div>
        </v-col>
      </v-row>
    </v-card>

    <!-- KPI summary -->
    <v-row dense class="mb-2">
      <v-col cols="6" md="3">
        <v-card variant="tonal" color="primary" class="pa-3">
          <div class="text-caption">Avg Physical Progress</div>
          <div class="text-h6 font-weight-bold">{{ avgPhysicalProgress.toFixed(1) }}%</div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card variant="tonal" color="success" class="pa-3">
          <div class="text-caption">Financial Utilization</div>
          <div class="text-h6 font-weight-bold">
            {{ financialUtilization == null ? '—' : `${financialUtilization.toFixed(1)}%` }}
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card variant="tonal" color="warning" class="pa-3">
          <div class="text-caption">Milestone Completion</div>
          <div class="text-h6 font-weight-bold">{{ milestoneCompletionRate.toFixed(0) }}%</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- KE-E-2: Per-FY utilization gauges -->
    <v-card v-if="hasFinancialData" class="pa-3 mb-3">
      <div class="text-subtitle-2 mb-2">Utilization Rate by Fiscal Year</div>
      <v-row dense justify="center">
        <v-col
          v-for="gauge in fyUtilizationGauges"
          :key="gauge.fy"
          cols="6"
          sm="4"
          md="3"
          lg="2"
        >
          <VueApexCharts
            type="radialBar"
            :series="gauge.series"
            :options="gauge.options"
            height="160"
          />
        </v-col>
      </v-row>
    </v-card>

    <v-row dense>
      <!-- ME: POW Status and POW Category charts removed -->
      <v-col cols="12" md="6">
        <v-card class="pa-3 mb-3">
          <div class="text-subtitle-2 mb-2">Financial Summary by Fiscal Year</div>
          <div v-if="!hasFinancialData" class="text-center py-6 text-grey">No financial data</div>
          <div v-else-if="!hasNonZeroFinancials" class="text-center py-6 text-grey">All financial values are zero</div>
          <VueApexCharts
            v-else
            type="bar"
            :series="financialChart.series"
            :options="financialChart.options"
            height="320"
          />
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-3 mb-3">
          <div class="text-subtitle-2 mb-2">Milestone Progress</div>
          <div v-if="!hasMilestoneData" class="text-center py-6 text-grey">No milestone data</div>
          <div v-else-if="!hasNonZeroMilestones" class="text-center py-6 text-grey">No milestone progress recorded yet</div>
          <VueApexCharts
            v-else
            type="bar"
            :series="milestoneChart.series"
            :options="milestoneChart.options"
            height="320"
          />
        </v-card>
      </v-col>

      <!-- KE-E-3: Milestone slippage histogram -->
      <v-col cols="12" md="6">
        <v-card class="pa-3 mb-3">
          <div class="text-subtitle-2 mb-2">Milestone Slippage Distribution</div>
          <div v-if="!milestoneSlippageChart.hasData" class="text-center py-6 text-grey">
            No milestones with completion dates
          </div>
          <VueApexCharts
            v-else
            type="bar"
            :series="milestoneSlippageChart.series"
            :options="milestoneSlippageChart.options"
            height="320"
          />
        </v-card>
      </v-col>

      <!-- KE-E-4: Document compliance donut -->
      <v-col cols="12" md="6">
        <v-card class="pa-3 mb-3">
          <div class="text-subtitle-2 mb-2">Document Compliance Status</div>
          <div v-if="checklistLoading" class="text-center py-6 text-grey">
            <v-progress-circular indeterminate size="24" />
          </div>
          <div v-else-if="!hasChecklistData" class="text-center py-6 text-grey">
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
              height="320"
            />
          </template>
        </v-card>
      </v-col>
    </v-row>
    </template>
  </div>
</template>
