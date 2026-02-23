<script setup lang="ts">
import { adaptProjects, type UIProject, type BackendProject, type PublicationStatus } from '~/utils/adapters'

definePageMeta({
  middleware: ['auth', 'permission'],
})

const router = useRouter()
const api = useApi()
const toast = useToast()
const authStore = useAuthStore()
const { canAdd, canEdit, canDelete, isAdmin, isStaff } = usePermissions()

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
      <v-btn v-if="canAdd('coi')" color="primary" prepend-icon="mdi-plus" @click="createProject">
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
