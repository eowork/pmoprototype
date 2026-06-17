<script setup lang="ts">
import { useFiscalYearStore } from '~/stores/fiscalYear'
import { storeToRefs } from 'pinia'
import VueApexCharts from 'vue3-apexcharts'

definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()
const router = useRouter()
const api = useApi()
const { isContractor, isAdmin } = usePermissions()

// PHASE BBBA (BBBA-1d): when the default-DENY module guard redirects a user here, surface the
// pending-approval notice, then clear the query so it doesn't re-fire on refresh.
const route = useRoute()
const toast = useToast()
onMounted(() => {
  if (route.query.notice === 'access-pending') {
    toast.warning('Access pending administrator approval.')
    router.replace({ query: {} })
  }
})

const fiscalYearStore = useFiscalYearStore()
const { selectedFiscalYear, fiscalYearOptions } = storeToRefs(fiscalYearStore)

// HHH-C: Dismissible context banner
const bannerDismissed = ref(false)
onMounted(() => {
  if (import.meta.client) {
    bannerDismissed.value = localStorage.getItem('dashboard_banner_dismissed') === 'true'
  }
})
function dismissBanner() {
  bannerDismissed.value = true
  if (import.meta.client) localStorage.setItem('dashboard_banner_dismissed', 'true')
}

// UO summary analytics state (Phase HP)
const uoPhysicalSummary = ref<any>(null)
const uoFinancialSummary = ref<any>(null)
const uoAnalyticsLoading = ref(false)

// HHH-B: COI analytics for Infrastructure mini-summary card
const coiSummary = ref<any>(null)
const coiFinancial = ref<any>(null)
const coiAnalyticsLoading = ref(false)

const PILLAR_LABELS: Record<string, { short: string; icon: string; color: string }> = {
  HIGHER_EDUCATION:   { short: 'Higher Ed',   icon: 'mdi-school',          color: 'blue' },
  ADVANCED_EDUCATION: { short: 'Advanced Ed',  icon: 'mdi-book-education',  color: 'purple' },
  RESEARCH:           { short: 'Research',     icon: 'mdi-flask',           color: 'teal' },
  TECHNICAL_ADVISORY: { short: 'Extension',    icon: 'mdi-handshake',       color: 'orange' },
}

// KKK-C: Compact dual-stat pillar data — zips physical + financial pillar summaries by type
const compactPillarData = computed(() => {
  const physical = (uoPhysicalSummary.value?.pillars || []) as Array<{ pillar_type: string; accomplishment_rate_pct: number | null }>
  const financial = (uoFinancialSummary.value?.pillars || []) as Array<{ pillar_type: string; avg_utilization_rate: number }>
  const types = [...new Set([...physical.map(p => p.pillar_type), ...financial.map(p => p.pillar_type)])]
  return types.map(type => {
    const phys = physical.find(p => p.pillar_type === type)
    const fin = financial.find(p => p.pillar_type === type)
    return {
      name: PILLAR_LABELS[type]?.short || type,
      icon: PILLAR_LABELS[type]?.icon || 'mdi-circle',
      color: PILLAR_LABELS[type]?.color || 'grey',
      physicalPct: phys?.accomplishment_rate_pct != null ? Number(phys.accomplishment_rate_pct).toFixed(1) : 'N/A',
      financialPct: fin?.avg_utilization_rate != null ? Number(fin.avg_utilization_rate).toFixed(1) : 'N/A',
    }
  })
})

async function loadUoSummary() {
  if (!selectedFiscalYear.value) return
  uoAnalyticsLoading.value = true
  try {
    const [physical, financial] = await Promise.allSettled([
      api.get<any>(`/api/university-operations/analytics/pillar-summary?fiscal_year=${selectedFiscalYear.value}`),
      api.get<any>(`/api/university-operations/analytics/financial-pillar-summary?fiscal_year=${selectedFiscalYear.value}`),
    ])
    uoPhysicalSummary.value = physical.status === 'fulfilled' ? physical.value : null
    uoFinancialSummary.value = financial.status === 'fulfilled' ? financial.value : null
  } catch {
    // Silently handle - UO summary is additive, not critical
  } finally {
    uoAnalyticsLoading.value = false
  }
}

// JJJ-A: UO Q1-Q4 accomplishment trend
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

// MMM-B: trend panel expand state — gates chart mount so ApexCharts sizes correctly
const trendsExpanded = ref<number[]>([])

// JJJ-B: UO Q1-Q4 financial utilization trend
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

const uoTrendChart = computed(() => {
  const quarters = (uoTrend.value?.quarters || []) as Array<{ quarter: string; accomplishment_rate_pct: number | null }>
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

const uoFinancialTrendChart = computed(() => {
  const quarters = (uoFinancialTrend.value?.quarters || []) as Array<{ quarter: string; utilization_rate: number }>
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

// HHH-B: Load COI analytics summary + financial summary
async function loadCoiAnalytics() {
  coiAnalyticsLoading.value = true
  try {
    const [summary, financial] = await Promise.allSettled([
      api.get<any>('/api/construction-projects/analytics/summary'),
      api.get<any>('/api/construction-projects/analytics/financial-summary'),
    ])
    coiSummary.value = summary.status === 'fulfilled' ? summary.value : null
    coiFinancial.value = financial.status === 'fulfilled' ? financial.value : null
  } catch {
    // Non-critical
  } finally {
    coiAnalyticsLoading.value = false
  }
}

// Derived COI metrics for mini-summary card
const coiCostUtilPct = computed(() => {
  const a = coiFinancial.value?.total_appropriation || 0
  const o = coiFinancial.value?.total_obligation || 0
  return a ? Math.min((o / a) * 100, 100) : 0
})

// JJJ-C: Reload all UO datasets on fiscal year change
watch(selectedFiscalYear, async () => {
  await Promise.allSettled([
    loadUoSummary(),
    loadUoTrend(),
    loadUoFinancialTrend(),
  ])
}, { immediate: true })

onMounted(async () => {
  await loadCoiAnalytics()
  if (!isContractor.value) await fiscalYearStore.fetchFiscalYears()
})

function formatCurrencyShort(amount: number): string {
  if (amount >= 1_000_000_000) return `₱${(amount / 1_000_000_000).toFixed(1)}B`
  if (amount >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(1)}M`
  return `₱${amount.toLocaleString()}`
}
</script>

<template>
  <div>
    <!-- Welcome Header -->
    <div class="mb-4">
      <h1 class="text-h5 font-weight-bold text-grey-darken-3 mb-1">
        Welcome, {{ authStore.userFullName }}
      </h1>
      <p class="text-subtitle-1 text-grey-darken-1">
        CSU CORE System Dashboard
      </p>
    </div>

    <!-- HHH-C: Dismissible context banner -->
    <v-alert
      v-if="!bannerDismissed && !isContractor"
      type="info"
      variant="tonal"
      density="compact"
      closable
      class="mb-4"
      @click:close="dismissBanner"
    >
      <strong>Executive Dashboard</strong> — Executive view — key metrics and portfolio summary for decision support. Use module tabs for detailed reporting.
    </v-alert>

    <!-- PHASE BBBD (Track 5/Task F): Request Access relocated to the User Menu (/access-request).
         Dashboard is analytics-first. -->

    <!-- KPI Row (AdminKpiRow — Infrastructure total, Delayed, Pending Reviews, UO Compliance) -->
    <AdminKpiRow v-if="!isContractor" :selected-fiscal-year="selectedFiscalYear" />

    <!-- NNN-C: Section label -->
    <div class="d-flex align-center ga-2 mb-3 mt-2">
      <v-icon size="16" color="grey-darken-2">mdi-office-building</v-icon>
      <span class="text-caption text-grey-darken-2 font-weight-bold text-uppercase section-label">Infrastructure Portfolio</span>
      <v-divider class="flex-grow-1 ml-2" />
    </div>

    <!-- HHH-B: Infrastructure Portfolio Mini-Summary -->
    <v-card
      class="mb-6 pa-4"
      rounded="lg"
      elevation="1"
      style="cursor:pointer"
      @click="router.push('/coi')"
    >
      <div class="d-flex align-center justify-space-between mb-3 flex-wrap ga-2">
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-office-building" color="primary" />
          <h2 class="text-h6 font-weight-bold">Infrastructure Portfolio</h2>
        </div>
        <v-btn size="small" color="primary" variant="tonal" prepend-icon="mdi-arrow-right" @click.stop="router.push('/coi')">
          View All Projects
        </v-btn>
      </div>

      <v-row v-if="coiAnalyticsLoading" dense class="mb-2">
        <v-col v-for="n in 4" :key="n" cols="6" sm="3"><v-skeleton-loader type="card" height="60" /></v-col>
      </v-row>

      <template v-else-if="coiSummary">
        <!-- QQQ-A1: tonal stat mini-tiles (denser, color-coded; matches UO pillar cards) -->
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

        <div v-if="coiFinancial">
          <div class="d-flex justify-space-between text-caption text-grey-darken-1 mb-1">
            <span>Cost Utilization</span>
            <span>{{ formatCurrencyShort(coiFinancial.total_obligation || 0) }} / {{ formatCurrencyShort(coiFinancial.total_appropriation || 0) }}</span>
          </div>
          <v-progress-linear :model-value="coiCostUtilPct" height="8" rounded color="primary" />
          <div class="text-caption text-grey mt-1">{{ coiCostUtilPct.toFixed(1) }}% of appropriation utilized</div>
        </div>
      </template>

      <div v-else class="text-caption text-grey py-2">Infrastructure data unavailable.</div>
    </v-card>

    <!-- NNN-C: Section label -->
    <div v-if="!isContractor" class="d-flex align-center ga-2 mb-3 mt-2">
      <v-icon size="16" color="grey-darken-2">mdi-school</v-icon>
      <span class="text-caption text-grey-darken-2 font-weight-bold text-uppercase section-label">University Operations</span>
      <v-divider class="flex-grow-1 ml-2" />
    </div>

    <!-- UO Summary Section (always shown for non-contractors) -->
    <v-card class="mb-6 pa-4" rounded="lg" elevation="1" v-if="!isContractor">
      <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
        <div>
          <h2 class="text-h6 font-weight-bold">University Operations Summary</h2>
          <p class="text-caption text-grey-darken-1">Physical and financial performance by pillar</p>
        </div>
        <div class="d-flex align-center ga-2">
          <v-select
            v-model="selectedFiscalYear"
            :items="fiscalYearOptions"
            label="Fiscal Year"
            variant="outlined"
            density="compact"
            hide-details
            style="min-width: 140px"
          />
          <v-btn
            size="small"
            variant="outlined"
            color="info"
            to="/university-operations"
            prepend-icon="mdi-chart-bar"
          >
            Full Analytics
          </v-btn>
        </div>
      </div>

      <div v-if="uoAnalyticsLoading" class="d-flex justify-center pa-4">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <template v-else>
        <!-- KKK-C: Compact dual-stat pillar cards (physical % + financial % per pillar) -->
        <v-row v-if="compactPillarData.length" dense>
          <v-col
            v-for="pillar in compactPillarData"
            :key="pillar.name"
            cols="12"
            sm="6"
            lg="3"
          >
            <v-card variant="tonal" :color="pillar.color" rounded="lg" class="pa-3">
              <div class="d-flex align-center mb-2">
                <v-icon :icon="pillar.icon" size="18" class="mr-2" />
                <span class="text-caption font-weight-bold text-uppercase">{{ pillar.name }}</span>
              </div>
              <div class="d-flex justify-space-between align-center">
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
        </v-row>

        <v-alert
          v-else
          type="info"
          variant="tonal"
          density="compact"
          class="mt-2"
        >
          No University Operations data available for the selected fiscal year.
        </v-alert>

        <!-- KKK-C / MMM-B: Trend charts in collapsible panel (default collapsed).
             Charts are mounted only when the panel is open (v-if on trendsExpanded)
             so ApexCharts measures correct dimensions — collapsed panels render
             zero-height charts otherwise. -->
        <v-expansion-panels
          v-if="uoTrend?.quarters?.length || uoFinancialTrend?.quarters?.length"
          v-model="trendsExpanded"
          multiple
          class="mt-3"
          variant="accordion"
        >
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon size="16" class="mr-2">mdi-chart-areaspline</v-icon>
              <span class="text-subtitle-2 font-weight-bold">Quarterly Trend Charts</span>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div v-if="trendsExpanded.includes(0)">
                <!-- JJJ-A: Q1-Q4 Accomplishment Trend -->
                <template v-if="uoTrend?.quarters?.length">
                  <div class="text-caption text-grey-darken-1 text-uppercase font-weight-bold mb-1">Q1–Q4 Accomplishment Trend</div>
                  <p class="text-caption text-grey mb-2">University-wide indicator accomplishment rate per quarter</p>
                  <VueApexCharts type="area" height="180"
                    :options="uoTrendChart.options" :series="uoTrendChart.series" />
                </template>

                <!-- JJJ-B: Q1-Q4 Financial Utilization Trend -->
                <template v-if="uoFinancialTrend?.quarters?.length">
                  <v-divider class="my-3" />
                  <div class="text-caption text-grey-darken-1 text-uppercase font-weight-bold mb-1">Q1–Q4 Financial Utilization</div>
                  <p class="text-caption text-grey mb-2">Fund utilization rate per quarter — how efficiently appropriations are being obligated</p>
                  <VueApexCharts type="area" height="160"
                    :options="uoFinancialTrendChart.options" :series="uoFinancialTrendChart.series" />
                </template>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </template>
    </v-card>

    <!-- NNN-C: Section label -->
    <div class="d-flex align-center ga-2 mb-3 mt-2">
      <v-icon size="16" color="grey-darken-2">mdi-lightning-bolt</v-icon>
      <span class="text-caption text-grey-darken-2 font-weight-bold text-uppercase section-label">Operational Insights</span>
      <v-divider class="flex-grow-1 ml-2" />
    </div>

    <!-- KKK-D/E: Quick Actions — compact navigation list (replaces large block buttons + Other Modules cards) -->
    <v-card class="mb-6 pa-4" rounded="lg" elevation="1">
      <h2 class="text-h6 font-weight-bold mb-1">Quick Actions</h2>
      <p class="text-caption text-grey-darken-1 mb-2">Navigate to CSU CORE modules and workflows</p>
      <v-list density="compact" nav>
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
          v-if="!isContractor"
          prepend-icon="mdi-chart-timeline-variant"
          title="Physical Accomplishments"
          subtitle="BAR No. 1 performance tracking"
          to="/university-operations/physical"
          rounded="lg"
        >
          <template #append><v-icon size="16">mdi-chevron-right</v-icon></template>
        </v-list-item>
        <v-list-item
          v-if="!isContractor"
          prepend-icon="mdi-currency-php"
          title="Financial Accomplishments"
          subtitle="BAR No. 2 financial utilization"
          to="/university-operations/financial"
          rounded="lg"
        >
          <template #append><v-icon size="16">mdi-chevron-right</v-icon></template>
        </v-list-item>
        <v-list-item
          v-if="!isContractor"
          prepend-icon="mdi-tools"
          title="Repair Projects"
          subtitle="Maintenance and repair tracking"
          to="/repairs"
          rounded="lg"
        >
          <template #append><v-icon size="16">mdi-chevron-right</v-icon></template>
        </v-list-item>
        <v-list-item
          v-if="!isContractor"
          prepend-icon="mdi-school"
          title="University Operations"
          subtitle="Quarterly reporting and analytics"
          to="/university-operations"
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
    </v-card>
  </div>
</template>

<style scoped>
/* NNN-C: section divider labels */
.section-label {
  letter-spacing: 0.06em;
}
</style>
