<script setup lang="ts">
import { adaptProjects, type UIProject, type BackendProject } from '~/utils/adapters'

definePageMeta({
  middleware: 'auth',
})

const api = useApi()

const projects = ref<UIProject[]>([])
const search = ref('')
const loading = ref(true)

// Table headers
const headers = [
  { title: 'Project Name', key: 'projectName', sortable: true },
  { title: 'Campus', key: 'campus', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Contract Amount', key: 'totalContractAmount', sortable: true, align: 'end' as const },
  { title: 'Progress', key: 'physicalAccomplishment', sortable: true, align: 'center' as const },
]

// Status color mapping
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ongoing: 'info',
    completed: 'success',
    pending: 'warning',
    cancelled: 'error',
    delayed: 'orange',
  }
  return colors[status?.toLowerCase()] || 'grey'
}

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Filtered projects
const filteredProjects = computed(() => {
  if (!search.value) return projects.value
  const term = search.value.toLowerCase()
  return projects.value.filter(
    (p) =>
      p.projectName.toLowerCase().includes(term) ||
      p.campus.toLowerCase().includes(term) ||
      p.status.toLowerCase().includes(term)
  )
})

onMounted(async () => {
  try {
    const response = await api.get<{ data: BackendProject[] }>('/api/construction-projects')
    projects.value = adaptProjects(response.data || [])
  } catch (error) {
    console.error('Failed to fetch projects:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          Construction Projects
        </h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          Manage and monitor construction projects
        </p>
      </div>
    </div>

    <!-- Data Table Card -->
    <v-card>
      <!-- Toolbar -->
      <v-card-title class="d-flex align-center pa-4">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search projects"
          single-line
          hide-details
          density="compact"
          variant="outlined"
          class="mr-4"
          style="max-width: 300px"
        />
        <v-spacer />
        <v-chip color="primary" variant="tonal">
          {{ filteredProjects.length }} projects
        </v-chip>
      </v-card-title>

      <v-divider />

      <!-- Table -->
      <v-data-table
        :headers="headers"
        :items="filteredProjects"
        :loading="loading"
        :search="search"
        item-value="id"
        hover
        class="elevation-0"
      >
        <!-- Project Name -->
        <template #item.projectName="{ item }">
          <span class="font-weight-medium">{{ item.projectName }}</span>
        </template>

        <!-- Status Chip -->
        <template #item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
            variant="tonal"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <!-- Contract Amount -->
        <template #item.totalContractAmount="{ item }">
          {{ formatCurrency(item.totalContractAmount) }}
        </template>

        <!-- Progress -->
        <template #item.physicalAccomplishment="{ item }">
          <div class="d-flex align-center" style="min-width: 120px">
            <v-progress-linear
              :model-value="item.physicalAccomplishment"
              :color="item.physicalAccomplishment >= 100 ? 'success' : 'primary'"
              height="8"
              rounded
              class="mr-2"
            />
            <span class="text-caption">{{ item.physicalAccomplishment }}%</span>
          </div>
        </template>

        <!-- Loading State -->
        <template #loading>
          <v-skeleton-loader type="table-row@5" />
        </template>

        <!-- Empty State -->
        <template #no-data>
          <div class="text-center pa-6">
            <v-icon icon="mdi-folder-open-outline" size="64" color="grey-lighten-1" class="mb-4" />
            <p class="text-h6 text-grey-darken-1">No projects found</p>
            <p class="text-body-2 text-grey">Projects will appear here once added</p>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>
