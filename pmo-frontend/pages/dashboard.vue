<script setup lang="ts">
import { useFiscalYearStore } from '~/stores/fiscalYear'
import { storeToRefs } from 'pinia'

definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()
const api = useApi()

const fiscalYearStore = useFiscalYearStore()
const { selectedFiscalYear, fiscalYearOptions } = storeToRefs(fiscalYearStore)

// Simple stats (client-side calculation per plan - analytics endpoint deferred)
const stats = ref({
  constructionProjects: 0,
  repairProjects: 0,
  universityOperations: 0,
  gadReports: 0,
})

const loading = ref(true)

// UO summary analytics state (Phase HP)
const uoPhysicalSummary = ref<any>(null)
const uoFinancialSummary = ref<any>(null)
const uoAnalyticsLoading = ref(false)

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

watch(selectedFiscalYear, () => loadUoSummary(), { immediate: true })

onMounted(async () => {
  try {
    // Fetch counts from available endpoints
    // Phase HV: Removed /api/gad-reports — endpoint does not exist (Directive 218)
    const [construction, repairs, uniOps] = await Promise.allSettled([
      api.get<{ data: unknown[] }>('/api/construction-projects'),
      api.get<{ data: unknown[] }>('/api/repair-projects'),
      api.get<{ data: unknown[] }>('/api/university-operations'),
    ])

    stats.value = {
      constructionProjects: construction.status === 'fulfilled' ? construction.value.data?.length || 0 : 0,
      repairProjects: repairs.status === 'fulfilled' ? repairs.value.data?.length || 0 : 0,
      universityOperations: uniOps.status === 'fulfilled' ? uniOps.value.data?.length || 0 : 0,
      gadReports: 0, // Phase HV: Placeholder until GAD aggregate endpoint exists (Directive 218)
    }
  } catch {
    // Silently handle errors - stats will show 0
  } finally {
    loading.value = false
  }

  // Ensure fiscal year options loaded for UO summary
  await fiscalYearStore.fetchFiscalYears()
})

const statCards = [
  { title: 'Infrastructure Projects', icon: 'mdi-office-building', color: 'primary', key: 'constructionProjects', to: '/coi' },
  { title: 'Repair Projects', icon: 'mdi-tools', color: 'warning', key: 'repairProjects', to: '/repairs' },
  { title: 'University Operations', icon: 'mdi-school', color: 'info', key: 'universityOperations', to: '/university-operations' },
  { title: 'GAD Reports', icon: 'mdi-gender-male-female', color: 'secondary', key: 'gadReports', to: '/gad' },
]
</script>

<template>
  <div>
    <!-- Welcome Header -->
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold text-grey-darken-3 mb-1">
        Welcome, {{ authStore.userFullName }}
      </h1>
      <p class="text-subtitle-1 text-grey-darken-1">
        CSU CORE System Dashboard
      </p>
    </div>

    <!-- Stats Cards -->
    <v-row>
      <v-col
        v-for="card in statCards"
        :key="card.key"
        cols="12"
        sm="6"
        lg="3"
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

    <!-- Quick Actions -->
    <v-card class="mt-6 pa-4">
      <h2 class="text-h6 font-weight-bold mb-4">Quick Actions</h2>
      <v-row>
        <v-col cols="12" md="6">
          <v-btn
            to="/coi"
            color="primary"
            variant="outlined"
            block
            size="large"
            prepend-icon="mdi-plus"
          >
            View Infrastructure Projects
          </v-btn>
        </v-col>
        <v-col cols="12" md="6">
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
        <v-col cols="12" md="6">
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
        <v-col cols="12" md="6">
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

    <!-- UO Summary Section (Phase HP-5) -->
    <v-card class="mt-6 pa-4" v-if="uoPhysicalSummary || uoFinancialSummary || uoAnalyticsLoading">
      <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
        <h2 class="text-h6 font-weight-bold">University Operations Summary</h2>
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
  </div>
</template>
