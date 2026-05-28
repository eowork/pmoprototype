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

// Vuetify data-table row click handler — `row` is `{ item: T, ... }`.
function onRowClick(_event: Event, row: { item: UIProject }) {
  viewProject(row.item)
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

// Phase JB + III-B/C: KPI stats + filter bar + view modes + date/sort
const filterStatus   = ref('')
const filterCampus   = ref('')
const filterDateFrom = ref('')
const filterDateTo   = ref('')
const sortKey        = ref<'projectName'|'startDate'|'endDate'|'physicalAccomplishment'|'totalContractAmount'>('projectName')
const sortDir        = ref<'asc'|'desc'>('asc')
const viewMode       = ref<'table'|'list'|'card'>('table')

const sortOptions = [
  { title: 'Project Name', value: 'projectName' },
  { title: 'Start Date',   value: 'startDate' },
  { title: 'End Date',     value: 'endDate' },
  { title: 'Progress %',   value: 'physicalAccomplishment' },
  { title: 'Budget',       value: 'totalContractAmount' },
]

function clearFilters() {
  filterStatus.value   = ''
  filterCampus.value   = ''
  filterDateFrom.value = ''
  filterDateTo.value   = ''
  search.value         = ''
}

const hasActiveFilters = computed(() =>
  !!(filterStatus.value || filterCampus.value || filterDateFrom.value || filterDateTo.value || search.value)
)

// MG / MF: Updated status taxonomy.
const statusFilterOptions = [
  { title: 'All',       value: ''          },
  { title: 'Proposal',  value: 'PROPOSAL'  },
  { title: 'Ongoing',   value: 'ONGOING'   },
  { title: 'Complete',  value: 'COMPLETE'  },
  { title: 'On Hold',   value: 'ON_HOLD'   },
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
  // MG / MF: Count COMPLETE (new) + COMPLETED (legacy, not yet migrated edge cases).
  stats.value.completed = projectList.filter(p => {
    const s = (p.status || '').toUpperCase()
    return s === 'COMPLETE' || s === 'COMPLETED'
  }).length
  stats.value.pendingReview = projectList.filter(p => p.publicationStatus === 'PENDING_REVIEW').length
  stats.value.totalContractValue = projectList.reduce((sum, p) => sum + (p.totalContractAmount || 0), 0)
  stats.value.avgProgress = projectList.length > 0
    ? projectList.reduce((sum, p) => sum + (Number(p.physicalAccomplishment) || 0), 0) / projectList.length
    : 0
}

// DDD-C: dashboard enrichment — derived client-side from loaded projects (no new endpoints).
const DELAY_THRESHOLD = 50 // % physical progress; ONGOING projects below this are flagged behind-schedule
const delayedCount = computed(() =>
  projects.value.filter(
    (p) => (p.status?.toUpperCase() === 'ONGOING') && (Number(p.physicalAccomplishment) || 0) < DELAY_THRESHOLD,
  ).length,
)
// Role-gated recent activity (DDD-D5: admin endpoint — hidden for Staff/Viewer).
const canViewActivity = computed(() => isAdmin.value || isSuperAdmin.value)
const recentActivity = ref<Array<{ id: string; userName: string; action: string; entityType: string; createdAt: string }>>([])
const ACTIVITY_LABELS: Record<string, string> = {
  CREATE: 'created', UPDATE: 'updated', DELETE: 'deleted', SUBMIT: 'submitted', PUBLISH: 'published',
  REJECT: 'rejected', WITHDRAW: 'withdrew', UPLOAD: 'uploaded', REMOVE_ATTACHMENT: 'removed an attachment',
  DOWNLOAD: 'downloaded', BATCH_UPLOAD: 'batch-uploaded', REMARKS_UPDATE: 'updated remarks', TEMPLATE_UPLOAD: 'uploaded a template',
}
function activityLabel(a: string): string { return ACTIVITY_LABELS[a] ?? a.toLowerCase() }
function formatActivityDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
async function fetchRecentActivity() {
  if (!canViewActivity.value) return
  try {
    const res = await api.get<any>('/api/activity-logs?entityType=CONSTRUCTION_PROJECT&pageSize=8')
    recentActivity.value = Array.isArray(res) ? res : (res?.data ?? [])
  } catch {
    recentActivity.value = []
  }
}

// Filtered + sorted projects (search + status + campus + date + sort)
const filteredProjects = computed(() => {
  let result = projects.value
  if (filterStatus.value) result = result.filter(p => p.status?.toUpperCase() === filterStatus.value)
  if (filterCampus.value) result = result.filter(p => p.campus?.toUpperCase() === filterCampus.value)
  if (search.value) {
    const term = search.value.toLowerCase()
    result = result.filter(p =>
      p.projectName.toLowerCase().includes(term) ||
      p.campus.toLowerCase().includes(term) ||
      p.status.toLowerCase().includes(term) ||
      p.id.toLowerCase().includes(term)
    )
  }
  if (filterDateFrom.value) result = result.filter(p => (p.startDate || '') >= filterDateFrom.value)
  if (filterDateTo.value)   result = result.filter(p => (p.startDate || '') <= filterDateTo.value)
  // Sort for list/card modes (table view uses its own column sorting)
  if (viewMode.value !== 'table') {
    result = [...result].sort((a, b) => {
      const va = (a as any)[sortKey.value] ?? ''
      const vb = (b as any)[sortKey.value] ?? ''
      const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb))
      return sortDir.value === 'asc' ? cmp : -cmp
    })
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
  if (tab === 'analytics' && !analyticsSummary.value && !analyticsLoading.value) fetchAnalytics()
})

// EEE-A: Tier 1 analytics derived from the (now mount-fetched) analytics endpoints.
const analyticsReady = computed(() => !!analyticsSummary.value && !!financialSummary.value)

const campusBars = computed(() => {
  const data = (analyticsSummary.value?.by_campus || []) as Array<{ campus: string; count: number }>
  const max = Math.max(...data.map(d => d.count), 1)
  return [...data].sort((a, b) => b.count - a.count).map(d => ({ ...d, pct: (d.count / max) * 100 }))
})

const budgetGauge = computed(() => {
  const a = financialSummary.value?.total_appropriation || 0
  const o = financialSummary.value?.total_obligation || 0
  const d = financialSummary.value?.total_disbursement || 0
  return {
    appropriation: a,
    obligationPct: a ? Math.min((o / a) * 100, 100) : 0,
    disbursementPct: a ? Math.min((d / a) * 100, 100) : 0,
  }
})

const ATTN_LIMIT = 5
const attentionItems = computed(() =>
  projects.value.filter((p) => {
    const s = p.status?.toUpperCase()
    const ps = p.publicationStatus
    return (s === 'ONGOING' && (Number(p.physicalAccomplishment) || 0) < DELAY_THRESHOLD)
      || ps === 'PENDING_REVIEW' || ps === 'REJECTED'
  }).slice(0, ATTN_LIMIT),
)

const statusPips = computed(() =>
  (analyticsSummary.value?.by_status || []).map((s: any) => ({
    status: s.status as string,
    count: s.count as number,
    color: (s.status === 'COMPLETED' || s.status === 'COMPLETE') ? 'success'
      : s.status === 'ONGOING' ? 'info'
      : s.status === 'CANCELLED' ? 'error' : 'grey',
  })),
)

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

onMounted(() => { fetchProjects(); fetchRecentActivity(); fetchAnalytics() })
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

    <!-- KPI Stats Panel (III-D: removed Total Projects, added Avg Progress; typography uplifted) -->
    <v-row class="mb-3" dense>
      <v-col cols="6" sm="4" md="2">
        <v-card color="success" variant="tonal" class="pa-3 d-flex align-center ga-3">
          <v-icon icon="mdi-check-circle" size="32" />
          <div>
            <p class="text-body-2 font-weight-medium">Completed</p>
            <p class="text-h4 font-weight-bold">{{ stats.completed }}</p>
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card color="info" variant="tonal" class="pa-3 d-flex align-center ga-3">
          <v-icon icon="mdi-progress-clock" size="32" />
          <div>
            <p class="text-body-2 font-weight-medium">Ongoing</p>
            <p class="text-h4 font-weight-bold">{{ stats.ongoing }}</p>
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card color="error" variant="tonal" class="pa-3 d-flex align-center ga-3">
          <v-icon icon="mdi-alert-decagram" size="32" />
          <div>
            <p class="text-body-2 font-weight-medium">Delayed</p>
            <p class="text-h4 font-weight-bold">{{ delayedCount }}</p>
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card color="warning" variant="tonal" class="pa-3 d-flex align-center ga-3">
          <v-icon icon="mdi-clipboard-clock" size="32" />
          <div>
            <p class="text-body-2 font-weight-medium">Pending Review</p>
            <p class="text-h4 font-weight-bold">{{ stats.pendingReview }}</p>
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card color="teal" variant="tonal" class="pa-3 d-flex align-center ga-3">
          <v-icon icon="mdi-cash-multiple" size="32" />
          <div>
            <p class="text-body-2 font-weight-medium">Total Budget</p>
            <p class="text-h6 font-weight-bold">{{ formatCurrencyShort(stats.totalContractValue) }}</p>
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card color="deep-purple" variant="tonal" class="pa-3 d-flex align-center ga-3">
          <v-icon icon="mdi-trending-up" size="32" />
          <div>
            <p class="text-body-2 font-weight-medium">Avg Progress</p>
            <p class="text-h5 font-weight-bold">{{ stats.avgProgress.toFixed(1) }}%</p>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- EEE-A: Tier 1 Analytics block (replaces DDD-C publication row; activity relocated below table) -->
    <template v-if="analyticsReady">
      <!-- Hero strip -->
      <v-card class="mb-3 pa-4" variant="outlined">
        <v-row align="center" dense>
          <v-col cols="12" md="4">
            <div class="text-caption text-grey-darken-1 font-weight-medium text-uppercase">Portfolio Budget</div>
            <div class="text-h4 font-weight-bold">{{ formatCurrencyShort(stats.totalContractValue) }}</div>
            <div class="text-caption text-grey">{{ stats.total }} projects · avg {{ stats.avgProgress.toFixed(1) }}% physical progress</div>
          </v-col>
          <v-col cols="12" md="5">
            <div class="text-caption text-grey mb-1">Overall Portfolio Progress</div>
            <v-progress-linear :model-value="stats.avgProgress" height="12" rounded color="primary" />
            <div class="d-flex flex-wrap ga-1 mt-2">
              <v-chip v-for="pip in statusPips" :key="pip.status" :color="pip.color" size="x-small" variant="tonal">
                {{ pip.status }}: {{ pip.count }}
              </v-chip>
            </div>
          </v-col>
          <v-col cols="12" md="3" class="d-flex justify-md-end">
            <v-chip v-if="attentionItems.length" color="error" variant="tonal" size="small" prepend-icon="mdi-alert">
              {{ attentionItems.length }} project{{ attentionItems.length > 1 ? 's' : '' }} need attention
            </v-chip>
            <v-chip v-else color="success" variant="tonal" size="small" prepend-icon="mdi-check-circle">
              All projects on track
            </v-chip>
          </v-col>
        </v-row>
      </v-card>

      <!-- Budget gauge + Campus bars + Needs-attention list -->
      <v-row dense class="mb-3">
        <v-col cols="12" md="4">
          <v-card variant="outlined" class="h-100 pa-3">
            <div class="text-caption text-grey-darken-1 font-weight-medium text-uppercase mb-2">Budget Utilization</div>
            <div class="mb-2">
              <div class="d-flex justify-space-between text-caption mb-1">
                <span>Appropriation</span><span>{{ formatCurrencyShort(budgetGauge.appropriation) }}</span>
              </div>
              <v-progress-linear :model-value="100" height="8" rounded color="teal" />
            </div>
            <div class="mb-2">
              <div class="d-flex justify-space-between text-caption mb-1">
                <span>Obligation</span><span>{{ budgetGauge.obligationPct.toFixed(1) }}%</span>
              </div>
              <v-progress-linear :model-value="budgetGauge.obligationPct" height="8" rounded color="info" />
            </div>
            <div>
              <div class="d-flex justify-space-between text-caption mb-1">
                <span>Disbursement</span><span>{{ budgetGauge.disbursementPct.toFixed(1) }}%</span>
              </div>
              <v-progress-linear :model-value="budgetGauge.disbursementPct" height="8" rounded color="success" />
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card variant="outlined" class="h-100 pa-3">
            <div class="text-caption text-grey-darken-1 font-weight-medium text-uppercase mb-2">Projects by Campus</div>
            <div v-for="campus in campusBars" :key="campus.campus" class="mb-2">
              <div class="d-flex justify-space-between text-caption mb-1">
                <span>{{ campus.campus || 'Unknown' }}</span><span>{{ campus.count }}</span>
              </div>
              <v-progress-linear :model-value="campus.pct" height="6" rounded color="primary" />
            </div>
            <div v-if="!campusBars.length" class="text-caption text-grey">No campus data.</div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card variant="outlined" class="h-100 pa-3">
            <div class="text-caption text-grey-darken-1 font-weight-medium text-uppercase mb-2">
              <v-icon icon="mdi-alert" size="small" color="error" class="mr-1" />Needs Attention
            </div>
            <div v-if="!attentionItems.length" class="text-caption text-grey py-2">No projects need attention.</div>
            <v-list v-else density="compact" class="pa-0">
              <v-list-item
                v-for="p in attentionItems" :key="p.id"
                class="px-0 cursor-pointer"
                @click="router.push(`/coi/detail-${p.id}`)"
              >
                <v-list-item-title class="text-caption font-weight-medium text-truncate">{{ p.projectName }}</v-list-item-title>
                <v-list-item-subtitle class="d-flex ga-1 flex-wrap mt-0">
                  <v-chip v-if="p.publicationStatus === 'REJECTED'" size="x-small" color="error" variant="tonal">Rejected</v-chip>
                  <v-chip v-else-if="p.publicationStatus === 'PENDING_REVIEW'" size="x-small" color="warning" variant="tonal">Pending</v-chip>
                  <v-chip v-else size="x-small" color="orange" variant="tonal">Delayed</v-chip>
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </template>
    <v-row v-else-if="analyticsLoading" dense class="mb-3">
      <v-col cols="12"><v-skeleton-loader type="card" /></v-col>
    </v-row>

    <!-- Filter Bar (III-B/C: extended with view modes, date filters, sort) -->
    <v-card variant="outlined" rounded="lg" class="mb-3 pa-3">
      <v-row dense align="center">
        <v-col cols="12" sm="4" md="3">
          <v-text-field
            v-model="search"
            placeholder="Search name, campus, status, ID…"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            clearable
            hide-details
            single-line
          />
        </v-col>
        <v-col cols="6" sm="2" md="2">
          <v-select
            v-model="filterStatus"
            :items="statusFilterOptions"
            label="Status"
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-col>
        <v-col cols="6" sm="2" md="2">
          <v-select
            v-model="filterCampus"
            :items="campusFilterOptions"
            label="Campus"
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-col>
        <v-col cols="6" sm="2" md="2">
          <v-text-field
            v-model="filterDateFrom"
            type="date"
            label="Start From"
            variant="outlined"
            density="compact"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="6" sm="2" md="2">
          <v-text-field
            v-model="filterDateTo"
            type="date"
            label="Start To"
            variant="outlined"
            density="compact"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="12" sm="12" md="1" class="d-flex justify-end align-center ga-2">
          <v-btn v-if="hasActiveFilters" variant="text" size="small" prepend-icon="mdi-filter-off" color="grey-darken-1" @click="clearFilters">
            Clear
          </v-btn>
        </v-col>
      </v-row>

      <!-- Sort + View mode row (for list/card) -->
      <v-row dense align="center" class="mt-2">
        <v-col cols="12" sm="4" md="3" class="d-flex align-center ga-2">
          <v-select
            v-model="sortKey"
            :items="sortOptions"
            label="Sort by"
            variant="outlined"
            density="compact"
            hide-details
            style="max-width: 200px"
          />
          <v-btn
            :icon="sortDir === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'"
            size="small"
            variant="text"
            color="grey-darken-1"
            :title="sortDir === 'asc' ? 'Ascending' : 'Descending'"
            @click="sortDir = sortDir === 'asc' ? 'desc' : 'asc'"
          />
        </v-col>
        <v-col cols="12" sm="8" md="9" class="d-flex justify-end align-center ga-2">
          <span class="text-body-2 text-grey-darken-1">{{ filteredProjects.length }} project{{ filteredProjects.length !== 1 ? 's' : '' }}</span>
          <v-btn-toggle
            v-model="viewMode"
            density="compact"
            variant="outlined"
            divided
            mandatory
            color="primary"
          >
            <v-btn value="list" size="small" :icon="true" title="List view"><v-icon size="18">mdi-format-list-bulleted</v-icon></v-btn>
            <v-btn value="card" size="small" :icon="true" title="Card view"><v-icon size="18">mdi-view-grid-outline</v-icon></v-btn>
            <v-btn value="table" size="small" :icon="true" title="Table view"><v-icon size="18">mdi-table</v-icon></v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>
    </v-card>

    <!-- ── LIST VIEW ── -->
    <div v-if="viewMode === 'list'" class="d-flex flex-column ga-2 mb-4">
      <div v-if="loading" class="d-flex justify-center py-8"><v-progress-circular indeterminate color="primary" /></div>
      <div v-else-if="!filteredProjects.length" class="text-center py-12 text-grey">
        <v-icon size="60" color="grey-lighten-2">mdi-folder-open-outline</v-icon>
        <div class="text-body-1 mt-2">No projects match your filters.</div>
      </div>
      <v-card
        v-else
        v-for="p in filteredProjects"
        :key="p.id"
        elevation="1"
        border
        rounded="lg"
        class="overflow-hidden cursor-pointer"
        :style="`border-left: 3px solid rgba(var(--v-theme-${getStatusColor(p.status)}), 0.7)`"
        @click="viewProject(p)"
      >
        <v-row no-gutters align="center" class="pa-3">
          <v-col cols="12" sm="2" class="d-flex flex-column ga-1 pr-3">
            <v-chip size="small" :color="getStatusColor(p.status)" variant="tonal" class="align-self-start">{{ p.status }}</v-chip>
            <v-chip size="x-small" :color="getPublicationStatusColor(p.publicationStatus)" variant="tonal" class="align-self-start">{{ getPublicationStatusLabel(p.publicationStatus) }}</v-chip>
            <div v-if="p.campus" class="text-caption text-grey">{{ p.campus }}</div>
          </v-col>
          <v-col cols="12" sm="6" class="pr-3">
            <div class="text-subtitle-2 font-weight-medium mb-1">{{ p.projectName }}</div>
            <div class="d-flex align-center ga-2 mb-1">
              <v-progress-linear :model-value="Number(p.physicalAccomplishment) || 0" :color="(Number(p.physicalAccomplishment) || 0) >= 100 ? 'success' : 'primary'" height="6" rounded style="max-width: 160px" />
              <span class="text-body-2 font-weight-medium">{{ (Number(p.physicalAccomplishment) || 0).toFixed(1) }}%</span>
            </div>
            <div class="text-body-2 text-grey-darken-1">{{ formatCurrencyShort(p.totalContractAmount) }}</div>
          </v-col>
          <v-col cols="12" sm="4" class="d-flex justify-end align-center">
            <v-menu location="start" @click.stop>
              <template #activator="{ props: mp }">
                <v-btn v-bind="mp" icon="mdi-dots-vertical" size="small" variant="text" color="grey-darken-1" @click.stop />
              </template>
              <v-list density="compact" min-width="180">
                <v-list-item prepend-icon="mdi-eye" title="View" @click.stop="viewProject(p)" />
                <v-list-item v-if="canEditItem(p)" prepend-icon="mdi-pencil" title="Edit" @click.stop="editProject(p)" />
                <v-list-item v-if="canSubmitForReview(p)" prepend-icon="mdi-send" title="Submit for Review" @click.stop="submitForReview(p)" />
                <v-list-item v-if="canWithdraw(p)" prepend-icon="mdi-undo" title="Withdraw" class="text-orange" @click.stop="withdrawSubmission(p)" />
                <v-list-item v-if="canApproveItem(p)" prepend-icon="mdi-check-circle" title="Approve" class="text-success" @click.stop="approveItem(p)" />
                <v-list-item v-if="canRejectItem(p)" prepend-icon="mdi-close-circle" title="Reject" class="text-warning" @click.stop="openRejectDialog(p)" />
                <v-divider v-if="canDelete('coi')" class="my-1" />
                <v-list-item v-if="canDelete('coi')" prepend-icon="mdi-delete" title="Delete" class="text-error" @click.stop="confirmDelete(p)" />
              </v-list>
            </v-menu>
          </v-col>
        </v-row>
      </v-card>
    </div>

    <!-- ── CARD VIEW ── -->
    <div v-else-if="viewMode === 'card'" class="mb-4">
      <div v-if="loading" class="d-flex justify-center py-8"><v-progress-circular indeterminate color="primary" /></div>
      <div v-else-if="!filteredProjects.length" class="text-center py-12 text-grey">
        <v-icon size="60" color="grey-lighten-2">mdi-folder-open-outline</v-icon>
        <div class="text-body-1 mt-2">No projects match your filters.</div>
      </div>
      <v-row v-else dense>
        <v-col v-for="p in filteredProjects" :key="p.id" cols="12" sm="6" lg="4">
          <v-card elevation="1" border rounded="lg" class="h-100" :style="`border-top: 3px solid rgba(var(--v-theme-${getStatusColor(p.status)}), 0.8)`">
            <v-card-title class="d-flex align-center ga-2 py-2 px-3 bg-grey-lighten-5">
              <v-chip size="x-small" :color="getStatusColor(p.status)" variant="tonal">{{ p.status }}</v-chip>
              <v-chip size="x-small" :color="getPublicationStatusColor(p.publicationStatus)" variant="tonal">{{ getPublicationStatusLabel(p.publicationStatus) }}</v-chip>
              <v-spacer />
              <v-menu location="bottom end" @click.stop>
                <template #activator="{ props: mp }">
                  <v-btn v-bind="mp" icon="mdi-dots-vertical" size="x-small" variant="text" color="grey-darken-1" @click.stop />
                </template>
                <v-list density="compact" min-width="170">
                  <v-list-item prepend-icon="mdi-eye" title="View" @click="viewProject(p)" />
                  <v-list-item v-if="canEditItem(p)" prepend-icon="mdi-pencil" title="Edit" @click="editProject(p)" />
                  <v-list-item v-if="canSubmitForReview(p)" prepend-icon="mdi-send" title="Submit for Review" @click="submitForReview(p)" />
                  <v-list-item v-if="canWithdraw(p)" prepend-icon="mdi-undo" title="Withdraw" class="text-orange" @click="withdrawSubmission(p)" />
                  <v-list-item v-if="canApproveItem(p)" prepend-icon="mdi-check-circle" title="Approve" class="text-success" @click="approveItem(p)" />
                  <v-list-item v-if="canRejectItem(p)" prepend-icon="mdi-close-circle" title="Reject" class="text-warning" @click="openRejectDialog(p)" />
                  <v-divider v-if="canDelete('coi')" class="my-1" />
                  <v-list-item v-if="canDelete('coi')" prepend-icon="mdi-delete" title="Delete" class="text-error" @click="confirmDelete(p)" />
                </v-list>
              </v-menu>
            </v-card-title>
            <v-card-text class="pt-3 pb-2 cursor-pointer" @click="viewProject(p)">
              <div class="text-subtitle-2 font-weight-medium mb-1 text-truncate" :title="p.projectName">{{ p.projectName }}</div>
              <div class="text-body-2 text-grey-darken-1 mb-2">{{ p.campus }}</div>
              <div class="text-body-2 font-weight-medium text-teal-darken-1 mb-3">{{ formatCurrencyShort(p.totalContractAmount) }}</div>
              <div class="d-flex align-center ga-2">
                <v-progress-linear :model-value="Number(p.physicalAccomplishment) || 0" :color="(Number(p.physicalAccomplishment) || 0) >= 100 ? 'success' : 'primary'" height="8" rounded />
                <span class="text-body-2 font-weight-medium" style="white-space:nowrap">{{ (Number(p.physicalAccomplishment) || 0).toFixed(1) }}%</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- ── TABLE VIEW (existing) ── -->
    <v-card v-else>
      <v-data-table
        :key="projects.length"
        :headers="headers"
        :items="filteredProjects"
        :loading="loading"
        :search="search"
        item-value="id"
        hover
        class="elevation-0"
        @click:row="onRowClick"
        :row-props="() => ({ style: { cursor: 'pointer' } })"
      >
        <!-- JM-C-3: Empty state -->
        <template #no-data>
          <div class="text-center py-12">
            <v-icon icon="mdi-folder-open-outline" size="80" color="grey-lighten-1" />
            <p class="text-h6 text-grey-darken-1 mt-4">No projects found</p>
            <p class="text-body-2 text-grey">
              Try adjusting your filters or create a new project
            </p>
            <v-btn
              v-if="canAdd('coi')"
              color="primary"
              class="mt-4"
              @click="createProject"
            >
              <v-icon start>mdi-plus</v-icon>
              New Project
            </v-btn>
          </div>
        </template>
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
          <div class="d-flex flex-column align-center" style="min-width: 120px">
            <v-progress-linear
              :model-value="Number(item.physicalAccomplishment) || 0"
              :color="(Number(item.physicalAccomplishment) || 0) >= 100 ? 'success' : 'primary'"
              height="8"
              rounded
              class="mb-1"
              style="width: 100%"
            />
            <span class="text-caption">{{ (Number(item.physicalAccomplishment) || 0).toFixed(1) }}%</span>
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

      </v-data-table>
    </v-card>

    <!-- EEE-B: Recent Activity relocated below the project table (admin-gated) -->
    <v-card v-if="canViewActivity" variant="outlined" class="mt-4">
      <v-card-title class="text-body-2 d-flex align-center ga-2 py-2">
        <v-icon icon="mdi-history" size="small" color="grey" />Recent Activity
      </v-card-title>
      <v-divider />
      <v-card-text class="py-1" style="max-height:220px;overflow-y:auto">
        <div v-if="!recentActivity.length" class="text-caption text-grey py-2">No recent activity.</div>
        <v-list v-else density="compact" class="pa-0">
          <v-list-item v-for="ev in recentActivity" :key="ev.id" class="px-0">
            <v-list-item-title class="text-caption">
              <span class="font-weight-medium">{{ ev.userName }}</span> {{ activityLabel(ev.action) }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption text-grey">{{ formatActivityDate(ev.createdAt) }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>
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

<style scoped>
.cursor-pointer { cursor: pointer; }
</style>
