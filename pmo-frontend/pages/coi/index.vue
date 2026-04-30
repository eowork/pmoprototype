<script setup lang="ts">
import { adaptProjects, type UIProject, type BackendProject, type PublicationStatus } from '~/utils/adapters'
import VueApexCharts from 'vue3-apexcharts'

definePageMeta({
  middleware: ['auth', 'permission'],
})

const router = useRouter()
const api = useApi()
const toast = useToast()
const authStore = useAuthStore()
const { canAdd, canEdit, canDelete, isAdmin, isStaff, isSuperAdmin } = usePermissions()

const projects = ref<UIProject[]>([])
const search = ref('')
const loading = ref(true)
const deleting = ref(false)
const deleteDialog = ref(false)
const projectToDelete = ref<UIProject | null>(null)

// Reject dialog state
const rejectDialog = ref(false)
const rejectNotes = ref('')
const projectToReject = ref<UIProject | null>(null)
const rejecting = ref(false)

// Action state
const actionLoading = ref<string | null>(null)

// Table headers - publication status visible to all users
const headers = computed(() => {
  return [
    { title: 'Project Name', key: 'projectName', sortable: true },
    { title: 'Campus', key: 'campus', sortable: true },
    { title: 'Status', key: 'status', sortable: true },
    { title: 'Publication', key: 'publicationStatus', sortable: true },
    { title: 'Contract Amount', key: 'totalContractAmount', sortable: true, align: 'end' as const },
    { title: 'Progress', key: 'physicalAccomplishment', sortable: true, align: 'center' as const },
    { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const },
  ]
})

// Publication status color mapping
function getPublicationStatusColor(status: PublicationStatus): string {
  const colors: Record<PublicationStatus, string> = {
    DRAFT: 'grey',
    PENDING_REVIEW: 'orange',
    PUBLISHED: 'success',
    REJECTED: 'error',
  }
  return colors[status] || 'grey'
}

// Publication status label mapping
function getPublicationStatusLabel(status: PublicationStatus): string {
  const labels: Record<PublicationStatus, string> = {
    DRAFT: 'Draft',
    PENDING_REVIEW: 'Pending',
    PUBLISHED: 'Published',
    REJECTED: 'Rejected',
  }
  return labels[status] || status
}

// Navigation
function viewProject(project: UIProject) {
  router.push(`/coi/detail-${project.id}`)
}

function editProject(project: UIProject) {
  router.push(`/coi/edit-${project.id}`)
}

function createProject() {
  router.push('/coi/new')
}

// Delete confirmation
function confirmDelete(project: UIProject) {
  projectToDelete.value = project
  deleteDialog.value = true
}

// --- Meatball Menu Action Visibility ---

// Check if current user is record owner, delegate, or assigned (Phase BJ)
function isOwnerOrAssigned(project: UIProject): boolean {
  const userId = authStore.user?.id
  if (!userId) return false
  return (
    project.createdBy === userId
    || project.delegatedTo === userId
    || project.assignedUsers?.some(u => u.id === userId) || false
  )
}

// Edit: Owner/assigned can edit own record, Admin can edit any. Editing PENDING_REVIEW auto-reverts to DRAFT.
function canEditItem(project: UIProject): boolean {
  if (isAdmin.value) return true
  return isOwnerOrAssigned(project)
}

// Submit/Resubmit for Review: Owner/assigned + DRAFT or REJECTED status
function canSubmitForReview(project: UIProject): boolean {
  if (!isStaff.value && !isOwnerOrAssigned(project)) return false
  if (!isOwnerOrAssigned(project)) return false
  return project.publicationStatus === 'DRAFT' || project.publicationStatus === 'REJECTED'
}

// Withdraw: Original submitter + PENDING_REVIEW status only
function canWithdraw(project: UIProject): boolean {
  if (project.publicationStatus !== 'PENDING_REVIEW') return false
  // Check if user is the original submitter
  return project.approvalMetadata?.submittedBy === authStore.user?.id
}

// Approve: Admin + PENDING_REVIEW status + NOT self-submitted
// Self-approval prevention: UI hides button if user is the submitter (backend also enforces)
function canApproveItem(project: UIProject): boolean {
  if (!isAdmin.value) return false
  if (project.publicationStatus !== 'PENDING_REVIEW') return false
  // Prevent self-approval - hide button for own submissions (SuperAdmin excluded from this check)
  const currentUserId = authStore.user?.id
  if (!isSuperAdmin.value && project.approvalMetadata?.submittedBy === currentUserId) {
    return false
  }
  return true
}

// Reject: Admin + PENDING_REVIEW status only
function canRejectItem(project: UIProject): boolean {
  return isAdmin.value && project.publicationStatus === 'PENDING_REVIEW'
}

// --- Meatball Menu Actions ---

async function submitForReview(project: UIProject) {
  actionLoading.value = project.id
  try {
    await api.post(`/api/construction-projects/${project.id}/submit-for-review`, {})
    toast.success(`"${project.projectName}" submitted for review`)
    await fetchProjects()
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || 'Failed to submit for review')
  } finally {
    actionLoading.value = null
  }
}

async function withdrawSubmission(project: UIProject) {
  actionLoading.value = project.id
  try {
    await api.post(`/api/construction-projects/${project.id}/withdraw`, {})
    toast.success(`"${project.projectName}" withdrawn successfully`)
    await fetchProjects()
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || 'Failed to withdraw submission')
  } finally {
    actionLoading.value = null
  }
}

async function approveItem(project: UIProject) {
  actionLoading.value = project.id
  try {
    await api.post(`/api/construction-projects/${project.id}/publish`, {})
    toast.success(`"${project.projectName}" published successfully`)
    await fetchProjects()
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || 'Failed to publish')
  } finally {
    actionLoading.value = null
  }
}

function openRejectDialog(project: UIProject) {
  projectToReject.value = project
  rejectNotes.value = ''
  rejectDialog.value = true
}

async function rejectItem() {
  if (!projectToReject.value) return
  rejecting.value = true
  try {
    await api.post(`/api/construction-projects/${projectToReject.value.id}/reject`, {
      notes: rejectNotes.value || 'Rejected by administrator',
    })
    toast.success(`"${projectToReject.value.projectName}" rejected`)
    rejectDialog.value = false
    await fetchProjects()
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || 'Failed to reject')
  } finally {
    rejecting.value = false
    projectToReject.value = null
    rejectNotes.value = ''
  }
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

// Phase JB: KPI stats + filter bar
const filterStatus = ref('')
const filterCampus = ref('')

const statusFilterOptions = [
  { title: 'All', value: '' },
  { title: 'Planning', value: 'PLANNING' },
  { title: 'Ongoing', value: 'ONGOING' },
  { title: 'Completed', value: 'COMPLETED' },
  { title: 'On Hold', value: 'ON_HOLD' },
  { title: 'Cancelled', value: 'CANCELLED' },
]
const campusFilterOptions = [
  { title: 'All Campuses', value: '' },
  { title: 'Main Campus', value: 'MAIN' },
  { title: 'Cabadbaran', value: 'CABADBARAN' },
]

const stats = ref({
  total: 0,
  ongoing: 0,
  completed: 0,
  pendingReview: 0,
  totalContractValue: 0,
  avgProgress: 0,
})

function computeStats(projectList: UIProject[]) {
  stats.value.total = projectList.length
  stats.value.ongoing = projectList.filter(p => p.status === 'ONGOING' || p.status?.toLowerCase() === 'ongoing').length
  stats.value.completed = projectList.filter(p => p.status === 'COMPLETED' || p.status?.toLowerCase() === 'completed').length
  stats.value.pendingReview = projectList.filter(p => p.publicationStatus === 'PENDING_REVIEW').length
  stats.value.totalContractValue = projectList.reduce((sum, p) => sum + (p.totalContractAmount || 0), 0)
  stats.value.avgProgress = projectList.length > 0
    ? projectList.reduce((sum, p) => sum + (p.physicalAccomplishment || 0), 0) / projectList.length
    : 0
}

// Filtered projects (search + status + campus)
const filteredProjects = computed(() => {
  let result = projects.value
  if (filterStatus.value) {
    result = result.filter(p => p.status?.toUpperCase() === filterStatus.value)
  }
  if (filterCampus.value) {
    result = result.filter(p => p.campus?.toUpperCase() === filterCampus.value)
  }
  if (search.value) {
    const term = search.value.toLowerCase()
    result = result.filter(
      (p) =>
        p.projectName.toLowerCase().includes(term) ||
        p.campus.toLowerCase().includes(term) ||
        p.status.toLowerCase().includes(term)
    )
  }
  return result
})

async function fetchProjects() {
  loading.value = true
  try {
    const response = await api.get<{ data: BackendProject[] }>('/api/construction-projects')
    projects.value = adaptProjects(response.data || [])
    computeStats(projects.value)
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || 'Failed to load projects')
    console.error('Failed to fetch projects:', err)
  } finally {
    loading.value = false
  }
}

// --- Phase JF: Analytics ---
const activeTab = ref('projects')
const analyticsLoading = ref(false)
const analyticsSummary = ref<any>(null)
const financialSummary = ref<any>(null)
const analyticsError = ref<string | null>(null)

async function fetchAnalytics() {
  analyticsLoading.value = true
  analyticsError.value = null
  try {
    const [summary, financial] = await Promise.all([
      api.get<any>('/api/construction-projects/analytics/summary'),
      api.get<any>('/api/construction-projects/analytics/financial-summary'),
    ])
    analyticsSummary.value = summary
    financialSummary.value = financial
  } catch (err: any) {
    console.error('[COI Analytics] Failed to fetch:', err)
    analyticsError.value = err?.message || 'Failed to load analytics data'
  } finally {
    analyticsLoading.value = false
  }
}

watch(activeTab, (tab) => {
  if (tab === 'analytics' && !analyticsSummary.value) fetchAnalytics()
})

const statusChartOptions = computed(() => ({
  chart: { type: 'donut' as const, toolbar: { show: false } },
  labels: (analyticsSummary.value?.by_status || []).map((s: any) => s.status),
  legend: { position: 'bottom' as const },
  colors: ['#059669', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280'],
}))

const statusChartSeries = computed(() =>
  (analyticsSummary.value?.by_status || []).map((s: any) => s.count)
)

const campusChartOptions = computed(() => ({
  chart: { type: 'bar' as const, toolbar: { show: false } },
  xaxis: { categories: (analyticsSummary.value?.by_campus || []).map((c: any) => c.campus || 'Unknown') },
  plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
  colors: ['#059669'],
  dataLabels: { enabled: false },
}))

const campusChartSeries = computed(() => [{
  name: 'Projects',
  data: (analyticsSummary.value?.by_campus || []).map((c: any) => c.count),
}])

function formatCurrencyShort(amount: number): string {
  if (amount >= 1_000_000_000) return `₱${(amount / 1_000_000_000).toFixed(1)}B`
  if (amount >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(1)}M`
  return `₱${amount.toLocaleString()}`
}

onMounted(fetchProjects)
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          Infrastructure Projects
        </h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          Manage and monitor infrastructure projects
        </p>
      </div>
      <v-btn v-if="canAdd('coi')" color="primary" prepend-icon="mdi-plus" @click="createProject">
        New Project
      </v-btn>
    </div>

    <!-- Tab Navigation (Phase JF) -->
    <v-tabs v-model="activeTab" class="mb-4" color="primary">
      <v-tab value="projects" prepend-icon="mdi-format-list-bulleted">Projects</v-tab>
      <v-tab value="analytics" prepend-icon="mdi-chart-bar">Analytics</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">

    <!-- Projects Tab -->
    <v-window-item value="projects">

    <!-- KPI Stats Panel (Phase JB) -->
    <v-row class="mb-4" dense>
      <v-col cols="6" md="3">
        <v-card color="primary" variant="tonal" class="pa-4">
          <p class="text-caption">Total Projects</p>
          <p class="text-h4 font-weight-bold">{{ stats.total }}</p>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card color="success" variant="tonal" class="pa-4">
          <p class="text-caption">Completed</p>
          <p class="text-h4 font-weight-bold">{{ stats.completed }}</p>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card color="info" variant="tonal" class="pa-4">
          <p class="text-caption">Ongoing</p>
          <p class="text-h4 font-weight-bold">{{ stats.ongoing }}</p>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card color="orange" variant="tonal" class="pa-4">
          <p class="text-caption">Avg. Progress</p>
          <p class="text-h4 font-weight-bold">{{ stats.avgProgress.toFixed(1) }}%</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filter Bar (Phase JB) -->
    <v-row dense class="mb-3">
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="search"
          label="Search projects..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
          hide-details
        />
      </v-col>
      <v-col cols="6" sm="3">
        <v-select
          v-model="filterStatus"
          :items="statusFilterOptions"
          label="Status"
          variant="outlined"
          density="compact"
          hide-details
        />
      </v-col>
      <v-col cols="6" sm="3">
        <v-select
          v-model="filterCampus"
          :items="campusFilterOptions"
          label="Campus"
          variant="outlined"
          density="compact"
          hide-details
        />
      </v-col>
    </v-row>

    <!-- Data Table Card -->
    <v-card>
      <!-- Toolbar -->
      <v-card-title class="d-flex align-center pa-4">
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

        <!-- Publication Status -->
        <template #item.publicationStatus="{ item }">
          <v-chip
            :color="getPublicationStatusColor(item.publicationStatus)"
            size="small"
            variant="tonal"
          >
            {{ getPublicationStatusLabel(item.publicationStatus) }}
          </v-chip>
          <div
            v-if="item.publicationStatus === 'PENDING_REVIEW' && item.approvalMetadata?.submittedByName"
            class="text-caption text-medium-emphasis mt-1"
          >
            by {{ item.approvalMetadata.submittedByName }}
          </div>
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

        <!-- Actions (Meatball Menu) -->
        <template #item.actions="{ item }">
          <v-menu location="start">
            <template #activator="{ props }">
              <v-btn
                icon="mdi-dots-vertical"
                variant="text"
                size="small"
                v-bind="props"
                :loading="actionLoading === item.id"
              />
            </template>
            <v-list density="compact" min-width="180">
              <!-- View (always visible) -->
              <v-list-item @click="viewProject(item)" prepend-icon="mdi-eye">
                <v-list-item-title>View</v-list-item-title>
              </v-list-item>

              <!-- Edit (conditional) -->
              <v-list-item
                v-if="canEditItem(item)"
                @click="editProject(item)"
                prepend-icon="mdi-pencil"
              >
                <v-list-item-title>Edit</v-list-item-title>
              </v-list-item>

              <!-- Submit for Review (Staff owner + DRAFT) -->
              <v-list-item
                v-if="canSubmitForReview(item)"
                @click="submitForReview(item)"
                prepend-icon="mdi-send"
              >
                <v-list-item-title>Submit for Review</v-list-item-title>
              </v-list-item>

              <!-- Withdraw Submission (Original submitter + PENDING_REVIEW) -->
              <v-list-item
                v-if="canWithdraw(item)"
                @click="withdrawSubmission(item)"
                prepend-icon="mdi-undo"
                class="text-orange"
              >
                <v-list-item-title>Withdraw Submission</v-list-item-title>
              </v-list-item>

              <!-- Approve (Admin + PENDING_REVIEW) -->
              <v-list-item
                v-if="canApproveItem(item)"
                @click="approveItem(item)"
                prepend-icon="mdi-check-circle"
                class="text-success"
              >
                <v-list-item-title>Approve</v-list-item-title>
              </v-list-item>

              <!-- Reject (Admin + PENDING_REVIEW) -->
              <v-list-item
                v-if="canRejectItem(item)"
                @click="openRejectDialog(item)"
                prepend-icon="mdi-close-circle"
                class="text-warning"
              >
                <v-list-item-title>Reject</v-list-item-title>
              </v-list-item>

              <!-- Divider before Delete -->
              <v-divider v-if="canDelete('coi')" class="my-1" />

              <!-- Delete (Admin only) -->
              <v-list-item
                v-if="canDelete('coi')"
                @click="confirmDelete(item)"
                prepend-icon="mdi-delete"
                class="text-error"
              >
                <v-list-item-title>Delete</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
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

    </v-window-item>
    <!-- End Projects Tab -->

    <!-- Analytics Tab (Phase JF) -->
    <v-window-item value="analytics">
      <div v-if="analyticsLoading" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="48" />
        <p class="mt-4 text-grey">Loading analytics...</p>
      </div>
      <div v-else-if="analyticsError" class="text-center py-12">
        <v-icon icon="mdi-alert-circle-outline" size="64" color="error" class="mb-2" />
        <p class="text-h6 text-error">Failed to load analytics</p>
        <p class="text-body-2 text-grey mb-4">{{ analyticsError }}</p>
        <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh" @click="fetchAnalytics">Retry</v-btn>
      </div>
      <template v-else-if="analyticsSummary">
        <!-- Financial Hero Row -->
        <v-row class="mb-4" dense>
          <v-col cols="6" md="3">
            <v-card color="primary" variant="tonal" class="pa-4">
              <p class="text-caption">Total Appropriation</p>
              <p class="text-h5 font-weight-bold">{{ formatCurrencyShort(financialSummary?.total_appropriation || 0) }}</p>
            </v-card>
          </v-col>
          <v-col cols="6" md="3">
            <v-card color="info" variant="tonal" class="pa-4">
              <p class="text-caption">Total Obligation</p>
              <p class="text-h5 font-weight-bold">{{ formatCurrencyShort(financialSummary?.total_obligation || 0) }}</p>
            </v-card>
          </v-col>
          <v-col cols="6" md="3">
            <v-card color="success" variant="tonal" class="pa-4">
              <p class="text-caption">Total Disbursement</p>
              <p class="text-h5 font-weight-bold">{{ formatCurrencyShort(financialSummary?.total_disbursement || 0) }}</p>
            </v-card>
          </v-col>
          <v-col cols="6" md="3">
            <v-card color="orange" variant="tonal" class="pa-4">
              <p class="text-caption">Utilization Rate</p>
              <p class="text-h5 font-weight-bold">{{ (financialSummary?.utilization_rate || 0).toFixed(1) }}%</p>
            </v-card>
          </v-col>
        </v-row>

        <!-- Charts Row -->
        <v-row>
          <v-col cols="12" md="5">
            <v-card class="pa-4">
              <v-card-title class="text-body-1 font-weight-bold mb-2">Status Distribution</v-card-title>
              <VueApexCharts
                v-if="statusChartSeries.length > 0"
                type="donut"
                height="280"
                :options="statusChartOptions"
                :series="statusChartSeries"
              />
              <div v-else class="text-center py-8 text-grey">No project data</div>
            </v-card>
          </v-col>
          <v-col cols="12" md="7">
            <v-card class="pa-4">
              <v-card-title class="text-body-1 font-weight-bold mb-2">Projects by Campus</v-card-title>
              <VueApexCharts
                v-if="campusChartSeries[0]?.data?.length > 0"
                type="bar"
                height="280"
                :options="campusChartOptions"
                :series="campusChartSeries"
              />
              <div v-else class="text-center py-8 text-grey">No campus data</div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Publication Status Breakdown -->
        <v-row class="mt-4">
          <v-col cols="12">
            <v-card class="pa-4">
              <v-card-title class="text-body-1 font-weight-bold mb-3">Publication Status Breakdown</v-card-title>
              <div class="d-flex flex-wrap ga-3">
                <v-chip
                  v-for="item in analyticsSummary.by_publication_status"
                  :key="item.publication_status"
                  :color="item.publication_status === 'PUBLISHED' ? 'success' : item.publication_status === 'PENDING_REVIEW' ? 'orange' : item.publication_status === 'REJECTED' ? 'error' : 'grey'"
                  variant="tonal"
                  size="large"
                >
                  {{ item.publication_status }}: {{ item.count }}
                </v-chip>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </template>
      <div v-else class="text-center py-12 text-grey">
        <v-icon icon="mdi-chart-bar" size="64" class="mb-2" />
        <p class="text-h6">No analytics data yet</p>
        <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh" class="mt-3" @click="fetchAnalytics">Load Analytics</v-btn>
      </div>
    </v-window-item>
    <!-- End Analytics Tab -->

    </v-window>

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

    <!-- Reject Dialog -->
    <v-dialog v-model="rejectDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="text-h6">Reject Submission</v-card-title>
        <v-card-text>
          <p class="mb-4">
            Reject <strong>{{ projectToReject?.projectName }}</strong>?
            The owner will be notified and can edit and resubmit.
          </p>
          <v-textarea
            v-model="rejectNotes"
            label="Rejection Notes (optional)"
            placeholder="Provide feedback for the submitter..."
            rows="3"
            variant="outlined"
            hide-details
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="rejectDialog = false" :disabled="rejecting">Cancel</v-btn>
          <v-btn color="warning" variant="flat" @click="rejectItem" :loading="rejecting">Reject</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
