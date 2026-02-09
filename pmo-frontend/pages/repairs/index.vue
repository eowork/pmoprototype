<script setup lang="ts">
import { adaptRepairProjects, type UIRepairProject, type BackendRepairProject } from '~/utils/adapters'

definePageMeta({
  middleware: 'auth',
})

const router = useRouter()
const api = useApi()
const toast = useToast()

const repairs = ref<UIRepairProject[]>([])
const search = ref('')
const loading = ref(true)
const deleting = ref(false)
const deleteDialog = ref(false)
const repairToDelete = ref<UIRepairProject | null>(null)

// Table headers
const headers = [
  { title: 'Title', key: 'title', sortable: true },
  { title: 'Location', key: 'location', sortable: true },
  { title: 'Campus', key: 'campus', sortable: true },
  { title: 'Urgency', key: 'urgencyLevel', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const },
]

// Navigation
function viewRepair(repair: UIRepairProject) {
  router.push(`/repairs/detail-${repair.id}`)
}

function editRepair(repair: UIRepairProject) {
  router.push(`/repairs/edit-${repair.id}`)
}

function createRepair() {
  router.push('/repairs/new')
}

// Delete confirmation
function confirmDelete(repair: UIRepairProject) {
  repairToDelete.value = repair
  deleteDialog.value = true
}

async function deleteRepair() {
  if (!repairToDelete.value) return
  deleting.value = true
  try {
    await api.del(`/api/repair-projects/${repairToDelete.value.id}`)
    const deletedTitle = repairToDelete.value.title
    repairs.value = repairs.value.filter(r => r.id !== repairToDelete.value!.id)
    toast.success(`Repair "${deletedTitle}" deleted successfully`)
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || 'Failed to delete repair')
    console.error('Failed to delete repair:', err)
  } finally {
    deleting.value = false
    deleteDialog.value = false
    repairToDelete.value = null
  }
}

// Status color mapping
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    REPORTED: 'info',
    INSPECTED: 'purple',
    APPROVED: 'primary',
    IN_PROGRESS: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'error',
  }
  return colors[status] || 'grey'
}

// Urgency color mapping
function getUrgencyColor(level: string): string {
  const colors: Record<string, string> = {
    LOW: 'success',
    MEDIUM: 'info',
    HIGH: 'warning',
    CRITICAL: 'error',
  }
  return colors[level] || 'grey'
}

// Filtered repairs
const filteredRepairs = computed(() => {
  if (!search.value) return repairs.value
  const term = search.value.toLowerCase()
  return repairs.value.filter(
    (r) =>
      r.title.toLowerCase().includes(term) ||
      r.location.toLowerCase().includes(term) ||
      r.campus.toLowerCase().includes(term) ||
      r.status.toLowerCase().includes(term) ||
      r.urgencyLevel.toLowerCase().includes(term)
  )
})

async function fetchRepairs() {
  loading.value = true
  try {
    const response = await api.get<{ data: BackendRepairProject[] }>('/api/repair-projects')
    repairs.value = adaptRepairProjects(response.data || [])
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || 'Failed to load repairs')
    console.error('Failed to fetch repairs:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchRepairs)
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          Repair Projects
        </h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          Track and manage facility repair requests
        </p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="createRepair">
        New Repair
      </v-btn>
    </div>

    <!-- Data Table Card -->
    <v-card>
      <!-- Toolbar -->
      <v-card-title class="d-flex align-center pa-4">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search repairs"
          single-line
          hide-details
          density="compact"
          variant="outlined"
          class="mr-4"
          style="max-width: 300px"
        />
        <v-spacer />
        <v-chip color="primary" variant="tonal">
          {{ filteredRepairs.length }} repairs
        </v-chip>
      </v-card-title>

      <v-divider />

      <!-- Table -->
      <v-data-table
        :key="repairs.length"
        :headers="headers"
        :items="filteredRepairs"
        :loading="loading"
        :search="search"
        item-value="id"
        hover
        class="elevation-0"
      >
        <!-- Title -->
        <template #item.title="{ item }">
          <span class="font-weight-medium">{{ item.title }}</span>
        </template>

        <!-- Urgency -->
        <template #item.urgencyLevel="{ item }">
          <v-chip
            :color="getUrgencyColor(item.urgencyLevel)"
            size="small"
            variant="tonal"
          >
            {{ item.urgencyLevel }}
          </v-chip>
        </template>

        <!-- Status Chip -->
        <template #item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
            variant="tonal"
          >
            {{ item.status.replace('_', ' ') }}
          </v-chip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <div class="d-flex justify-center ga-1">
            <v-btn icon="mdi-eye" size="small" variant="text" color="info" @click="viewRepair(item)" />
            <v-btn icon="mdi-pencil" size="small" variant="text" color="warning" @click="editRepair(item)" />
            <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="confirmDelete(item)" />
          </div>
        </template>

        <!-- Loading State -->
        <template #loading>
          <v-skeleton-loader type="table-row@5" />
        </template>

        <!-- Empty State -->
        <template #no-data>
          <div class="text-center pa-6">
            <v-icon icon="mdi-tools" size="64" color="grey-lighten-1" class="mb-4" />
            <p class="text-h6 text-grey-darken-1">No repairs found</p>
            <p class="text-body-2 text-grey">Repair requests will appear here once added</p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="text-h6">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete <strong>{{ repairToDelete?.title }}</strong>?
          This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false" :disabled="deleting">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="deleteRepair" :loading="deleting">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
