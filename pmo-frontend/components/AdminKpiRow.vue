<script setup lang="ts">
interface Props {
  selectedFiscalYear: number | null
}
const props = defineProps<Props>()

const api = useApi()

const coiTotal = ref<number | null>(null)
const coiDelayed = ref<number | null>(null)
const coiPendingReviews = ref<number | null>(null)
const quarterlyCompliance = ref<number | null>(null)

const loadingCoi = ref(true)
const loadingCompliance = ref(true)

async function loadCoiSummary() {
  loadingCoi.value = true
  try {
    const res = await api.get<any>('/api/construction-projects/analytics/summary')
    coiTotal.value = res.total ?? 0
    coiDelayed.value = res.delayed_count ?? 0
    const pubStatus = (res.by_publication_status || []) as Array<{ publication_status: string; count: number }>
    const pending = pubStatus.find(p => p.publication_status === 'PENDING_REVIEW')
    coiPendingReviews.value = pending ? Number(pending.count) : 0
  } catch {
    coiTotal.value = 0
    coiDelayed.value = 0
    coiPendingReviews.value = 0
  } finally {
    loadingCoi.value = false
  }
}

async function loadCompliance() {
  if (!props.selectedFiscalYear) {
    quarterlyCompliance.value = null
    loadingCompliance.value = false
    return
  }
  loadingCompliance.value = true
  try {
    const res = await api.get<{ pillars?: Array<{ accomplishment_rate_pct?: number | null }> }>(
      `/api/university-operations/analytics/pillar-summary?fiscal_year=${props.selectedFiscalYear}`,
    )
    const rates = (res.pillars || [])
      .map(p => p.accomplishment_rate_pct)
      .filter((v): v is number => typeof v === 'number')
    quarterlyCompliance.value = rates.length
      ? rates.reduce((a, b) => a + b, 0) / rates.length
      : null
  } catch {
    quarterlyCompliance.value = null
  } finally {
    loadingCompliance.value = false
  }
}

onMounted(() => {
  loadCoiSummary()
  loadCompliance()
})

watch(() => props.selectedFiscalYear, () => loadCompliance())

const tiles = computed(() => [
  {
    key: 'total',
    label: 'Infrastructure Projects',
    icon: 'mdi-office-building',
    value: coiTotal.value,
    loading: loadingCoi.value,
    color: 'primary',
    suffix: '',
  },
  {
    key: 'delayed',
    label: 'Delayed Projects',
    icon: 'mdi-alert-decagram',
    value: coiDelayed.value,
    loading: loadingCoi.value,
    color: 'error',
    suffix: '',
  },
  {
    key: 'pending',
    label: 'Pending Reviews',
    icon: 'mdi-clipboard-clock-outline',
    value: coiPendingReviews.value,
    loading: loadingCoi.value,
    color: 'warning',
    suffix: '',
  },
  {
    key: 'compliance',
    label: 'UO Compliance Rate',
    icon: 'mdi-check-decagram-outline',
    value: quarterlyCompliance.value != null ? quarterlyCompliance.value.toFixed(1) : 'N/A',
    loading: loadingCompliance.value,
    color: 'success',
    suffix: quarterlyCompliance.value != null ? '%' : '',
  },
])
</script>

<template>
  <v-row dense class="mb-4">
    <v-col
      v-for="tile in tiles"
      :key="tile.key"
      cols="12"
      sm="6"
      lg="3"
    >
      <v-card :color="tile.color" variant="tonal" class="pa-4">
        <div class="d-flex align-center">
          <v-avatar :color="tile.color" size="44" variant="tonal" class="mr-3">
            <v-icon :icon="tile.icon" />
          </v-avatar>
          <div>
            <p class="text-caption font-weight-medium mb-1">{{ tile.label }}</p>
            <p class="text-h5 font-weight-bold">
              <v-progress-circular
                v-if="tile.loading"
                :size="20"
                :width="2"
                indeterminate
              />
              <span v-else>{{ tile.value }}{{ tile.suffix }}</span>
            </p>
          </div>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>
