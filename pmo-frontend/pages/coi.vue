<script setup lang="ts">
import { adaptProjects, type UIProject, type BackendProject } from '~/utils/adapters'

definePageMeta({
  middleware: 'auth',
})

const router = useRouter()
const api = useApi()
const toast = useToast()

const projects = ref<UIProject[]>([])
const search = ref('')
const loading = ref(true)
const deleting = ref(false)
const deleteDialog = ref(false)
const projectToDelete = ref<UIProject | null>(null)

// Table headers
const headers = [
  { title: 'Project Name', key: 'projectName', sortable: true },
  { title: 'Campus', key: 'campus', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Contract Amount', key: 'totalContractAmount', sortable: true, align: 'end' as const },
  { title: 'Progress', key: 'physicalAccomplishment', sortable: true, align: 'center' as const },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const },
]

// Navigation
function viewProject(project: UIProject) {
  router.push(`/coi-detail-${project.id}`)
}

function editProject(project: UIProject) {
  router.push(`/coi-edit-${project.id}`)
}

function createProject() {
  router.push('/coi-new')
}

// Delete confirmation
function confirmDelete(project: UIProject) {
  projectToDelete.value = project
  deleteDialog.value = true
}

async function deleteProject() {
  if (!projectToDelete.value) return
  deleting.value = true
  try {
    await api.del(`/api/construction-projects/${projectToDelete.value.id}`)
    const deletedName = projectToDelete.value.projectName
    projects.value = projects.value.filter(p => p.id !== projectToDelete.value!.id)
    toast.success(`Project "${deletedName}" deleted successfully`)
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || 'Failed to delete project')
    console.error('Failed to delete project:', err)
  } finally {
    deleting.value = false
    deleteDialog.value = false
    projectToDelete.value = null
  }
}

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

async function fetchProjects() {
  loading.value = true
  try {
    const response = await api.get<{ data: BackendProject[] }>('/api/construction-projects')
    projects.value = adaptProjects(response.data || [])
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || 'Failed to load projects')
    console.error('Failed to fetch projects:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchProjects)
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
      <v-btn color="primary" prepend-icon="mdi-plus" @click="createProject">
        New Project
      </v-btn>
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
        :key="projects.length"
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

        <!-- Actions -->
        <template #item.actions="{ item }">
          <div class="d-flex justify-center ga-1">
            <v-btn icon="mdi-eye" size="small" variant="text" color="info" @click="viewProject(item)" />
            <v-btn icon="mdi-pencil" size="small" variant="text" color="warning" @click="editProject(item)" />
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
            <v-icon icon="mdi-folder-open-outline" size="64" color="grey-lighten-1" class="mb-4" />
            <p class="text-h6 text-grey-darken-1">No projects found</p>
            <p class="text-body-2 text-grey">Projects will appear here once added</p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="text-h6">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete <strong>{{ projectToDelete?.projectName }}</strong>?
          This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false" :disabled="deleting">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="deleteProject" :loading="deleting">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
