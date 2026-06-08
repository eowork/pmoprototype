<script setup lang="ts">
import { useFiscalYearStore } from '~/stores/fiscalYear'
import { storeToRefs } from 'pinia'

definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()
const router = useRouter()
const api = useApi()
const { isContractor } = usePermissions()

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

// Simple stats for module cards (Repair, UO, GAD)
const stats = ref({
  repairProjects: 0,
  universityOperations: 0,
  gadReports: 0,
})

const loading = ref(true)

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

watch(selectedFiscalYear, () => loadUoSummary(), { immediate: true })

onMounted(async () => {
  try {
    if (isContractor.value) {
      // QC: Contractors only fetch COI analytics — no access to other modules
      await loadCoiAnalytics()
    } else {
      // Phase HV: /api/gad-reports does not exist (Directive 218)
      const [repairs, uniOps] = await Promise.allSettled([
        api.get<{ data: unknown[] }>('/api/repair-projects'),
        api.get<{ data: unknown[] }>('/api/university-operations'),
      ])
      stats.value = {
        repairProjects: repairs.status === 'fulfilled' ? repairs.value.data?.length || 0 : 0,
        universityOperations: uniOps.status === 'fulfilled' ? uniOps.value.data?.length || 0 : 0,
        gadReports: 0,
      }
      await loadCoiAnalytics()
    }
  } catch {
    // Silently handle errors
  } finally {
    loading.value = false
  }

  // Ensure fiscal year options loaded for UO summary
  if (!isContractor.value) await fiscalYearStore.fetchFiscalYears()
})

// Module cards — Infrastructure removed (now shown via dedicated mini-summary card)
const statCards = computed(() => {
  if (isContractor.value) return []
  return [
    { title: 'Repair Projects', icon: 'mdi-tools', color: 'warning', key: 'repairProjects', to: '/repairs' },
    { title: 'University Operations', icon: 'mdi-school', color: 'info', key: 'universityOperations', to: '/university-operations' },
    { title: 'GAD Reports', icon: 'mdi-gender-male-female', color: 'secondary', key: 'gadReports', to: '/gad' },
  ]
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
      <h1 class="text-h4 font-weight-bold text-grey-darken-3 mb-1">
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
      <strong>Executive Dashboard</strong> — Real-time overview of all CSU CORE modules.
      Click any card or chart to navigate deeper.
    </v-alert>

    <!-- KPI Row (AdminKpiRow — Infrastructure total, Delayed, Pending Reviews, UO Compliance) -->
    <AdminKpiRow v-if="!isContractor" :selected-fiscal-year="selectedFiscalYear" />

    <!-- HHH-B: Infrastructure Portfolio Mini-Summary -->
    <v-card
      class="mb-6 pa-4"
      variant="outlined"
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

      <div v-if="coiAnalyticsLoading" class="d-flex justify-center pa-4">
        <v-progress-circular indeterminate color="primary" size="32" />
      </div>

      <template v-else-if="coiSummary">
        <v-row dense class="mb-3">
          <v-col cols="6" sm="3">
            <div class="text-caption text-grey-darken-1 font-weight-medium">Total Projects</div>
            <div class="text-h5 font-weight-bold text-primary">{{ coiSummary.total ?? 0 }}</div>
          </v-col>
          <v-col cols="6" sm="3">
            <div class="text-caption text-grey-darken-1 font-weight-medium">Ongoing</div>
            <div class="text-h5 font-weight-bold text-info">
              {{ (coiSummary.by_status || []).find((s: any) => s.status === 'ONGOING')?.count ?? 0 }}
            </div>
          </v-col>
          <v-col cols="6" sm="3">
            <div class="text-caption text-grey-darken-1 font-weight-medium">Delayed</div>
            <div class="text-h5 font-weight-bold text-error">{{ coiSummary.delayed_count ?? 0 }}</div>
          </v-col>
          <v-col cols="6" sm="3">
            <div class="text-caption text-grey-darken-1 font-weight-medium">Avg Progress</div>
            <div class="text-h5 font-weight-bold text-deep-purple">{{ (coiSummary.avg_progress || 0).toFixed(1) }}%</div>
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

    <!-- UO Summary Section (always shown for non-contractors) -->
    <v-card class="mb-6 pa-4" v-if="!isContractor">
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
        <!-- Physical Accomplishment Pillar Cards -->
        <div v-if="uoPhysicalSummary?.pillars?.length" class="mb-4">
          <p class="text-caption text-grey-darken-1 text-uppercase font-weight-bold mb-2">
            UO Physical Performance (BAR No. 1)
          </p>
          <v-row dense>
            <v-col
              v-for="pillar in uoPhysicalSummary.pillars"
              :key="pillar.pillar_type"
              cols="12"
              sm="6"
              lg="3"
            >
              <v-card variant="tonal" :color="PILLAR_LABELS[pillar.pillar_type]?.color || 'grey'" class="pa-3">
                <div class="d-flex align-center mb-1">
                  <v-icon :icon="PILLAR_LABELS[pillar.pillar_type]?.icon || 'mdi-circle'" size="small" class="mr-2" />
                  <span class="text-caption font-weight-medium">{{ PILLAR_LABELS[pillar.pillar_type]?.short || pillar.pillar_type }}</span>
                </div>
                <div class="text-h6 font-weight-bold">
                  {{ pillar.accomplishment_rate_pct != null ? pillar.accomplishment_rate_pct.toFixed(1) + '%' : 'N/A' }}
                </div>
                <div class="text-caption text-grey-darken-1">Achievement Rate</div>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Financial Accomplishment Pillar Cards -->
        <div v-if="uoFinancialSummary?.pillars?.length">
          <p class="text-caption text-grey-darken-1 text-uppercase font-weight-bold mb-2">
            UO Financial Performance (BAR No. 2)
          </p>
          <v-row dense>
            <v-col
              v-for="pillar in uoFinancialSummary.pillars"
              :key="pillar.pillar_type"
              cols="12"
              sm="6"
              lg="3"
            >
              <v-card variant="tonal" :color="PILLAR_LABELS[pillar.pillar_type]?.color || 'grey'" class="pa-3">
                <div class="d-flex align-center mb-1">
                  <v-icon :icon="PILLAR_LABELS[pillar.pillar_type]?.icon || 'mdi-circle'" size="small" class="mr-2" />
                  <span class="text-caption font-weight-medium">{{ PILLAR_LABELS[pillar.pillar_type]?.short || pillar.pillar_type }}</span>
                </div>
                <div class="text-h6 font-weight-bold">
                  {{ Number(pillar.avg_utilization_rate).toFixed(1) }}%
                </div>
                <div class="text-caption text-grey-darken-1">Utilization Rate</div>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <v-alert
          v-if="!uoPhysicalSummary?.pillars?.length && !uoFinancialSummary?.pillars?.length"
          type="info"
          variant="tonal"
          density="compact"
          class="mt-2"
        >
          No University Operations data available for the selected fiscal year.
        </v-alert>
      </template>
    </v-card>

    <!-- Quick Actions -->
    <v-card class="mb-6 pa-4">
      <h2 class="text-h6 font-weight-bold mb-4">Quick Actions</h2>
      <v-row>
        <v-col cols="12" md="6">
          <v-btn
            to="/coi"
            color="primary"
            variant="outlined"
            block
            size="large"
            prepend-icon="mdi-office-building"
          >
            View Infrastructure Projects
          </v-btn>
        </v-col>
        <v-col v-if="!isContractor" cols="12" md="6">
          <v-btn
            to="/repairs"
            color="warning"
            variant="outlined"
            block
            size="large"
            prepend-icon="mdi-tools"
          >
            View Repair Projects
          </v-btn>
        </v-col>
        <v-col v-if="!isContractor" cols="12" md="6">
          <v-btn
            to="/university-operations/physical"
            color="info"
            variant="outlined"
            block
            size="large"
            prepend-icon="mdi-chart-timeline-variant"
          >
            Physical Accomplishments
          </v-btn>
        </v-col>
        <v-col v-if="!isContractor" cols="12" md="6">
          <v-btn
            to="/university-operations/financial"
            color="success"
            variant="outlined"
            block
            size="large"
            prepend-icon="mdi-currency-php"
          >
            Financial Accomplishments
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Other Module Cards (Repair, UO, GAD) — Infrastructure shown above via mini-summary -->
    <v-row v-if="statCards.length">
      <v-col
        v-for="card in statCards"
        :key="card.key"
        cols="12"
        sm="6"
        lg="4"
      >
        <v-card
          :to="card.to"
          class="pa-4"
          :color="card.color"
          variant="tonal"
          hover
        >
          <div class="d-flex align-center">
            <v-avatar :color="card.color" size="48" class="mr-4">
              <v-icon :icon="card.icon" color="white" />
            </v-avatar>
            <div>
              <p class="text-caption text-grey-darken-1 mb-1">
                {{ card.title }}
              </p>
              <p class="text-h5 font-weight-bold">
                <v-progress-circular
                  v-if="loading"
                  :size="20"
                  :width="2"
                  indeterminate
                />
                <span v-else>{{ stats[card.key as keyof typeof stats] }}</span>
              </p>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
