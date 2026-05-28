<script setup lang="ts">
interface Props {
  selectedFiscalYear: number | null
}
const props = defineProps<Props>()

const api = useApi()

const totalProjects = ref<number | null>(null)
const pendingReviews = ref<number | null>(null)
const activeContractors = ref<number | null>(null)
const quarterlyCompliance = ref<number | null>(null)

const loadingProjects = ref(true)
const loadingPending = ref(true)
const loadingContractors = ref(true)
const loadingCompliance = ref(true)

async function loadProjects() {
  loadingProjects.value = true
  try {
    const res = await api.get<{ data: unknown[] }>('/api/construction-projects')
    totalProjects.value = res.data?.length ?? 0
  } catch {
    totalProjects.value = 0
  } finally {
    loadingProjects.value = false
  }
}

async function loadPending() {
  loadingPending.value = true
  try {
    const res = await api.get<{ data: unknown[] }>(
      '/api/construction-projects?publication_status=PENDING_REVIEW',
    )
    pendingReviews.value = res.data?.length ?? 0
  } catch {
    pendingReviews.value = 0
  } finally {
    loadingPending.value = false
  }
}

async function loadContractors() {
  loadingContractors.value = true
  try {
    const res = await api.get<{ data: unknown[] }>('/api/contractors')
    activeContractors.value = res.data?.length ?? 0
  } catch {
    activeContractors.value = 0
  } finally {
    loadingContractors.value = false
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
  loadProjects()
  loadPending()
  loadContractors()
  loadCompliance()
})

watch(() => props.selectedFiscalYear, () => loadCompliance())

const tiles = computed(() => [
  {
    key: 'total',
    label: 'Total Projects',
    icon: 'mdi-clipboard-list-outline',
    value: totalProjects.value,
    loading: loadingProjects.value,
    suffix: '',
  },
  {
    key: 'pending',
    label: 'Pending Reviews',
    icon: 'mdi-clipboard-clock-outline',
    value: pendingReviews.value,
    loading: loadingPending.value,
    suffix: '',
  },
  {
    key: 'contractors',
    label: 'Active Contractors',
    icon: 'mdi-account-hard-hat',
    value: activeContractors.value,
    loading: loadingContractors.value,
    suffix: '',
  },
  {
    key: 'compliance',
    label: 'Quarterly Compliance',
    icon: 'mdi-check-decagram-outline',
    value: quarterlyCompliance.value != null ? quarterlyCompliance.value.toFixed(1) : 'N/A',
    loading: loadingCompliance.value,
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
      <v-card class="pa-4" variant="elevated">
        <div class="d-flex align-center">
          <v-avatar color="figma-accent" size="44" variant="tonal" class="mr-3">
            <v-icon :icon="tile.icon" />
          </v-avatar>
          <div>
            <p class="text-caption text-figma-muted mb-1">{{ tile.label }}</p>
            <p class="text-h5 font-weight-bold text-figma-primary">
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
