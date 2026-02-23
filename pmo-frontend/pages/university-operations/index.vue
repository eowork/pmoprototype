<script setup lang="ts">
import { adaptUniversityOperations, type UIUniversityOperation, type BackendUniversityOperation, type PublicationStatus } from '~/utils/adapters'

definePageMeta({
  middleware: ['auth', 'permission'],
})

const router = useRouter()
const api = useApi()
const toast = useToast()
const authStore = useAuthStore()
const { canAdd, canEdit, canDelete, isAdmin, isStaff } = usePermissions()

const operations = ref<UIUniversityOperation[]>([])
const search = ref('')
const loading = ref(true)
const deleting = ref(false)
const deleteDialog = ref(false)
const operationToDelete = ref<UIUniversityOperation | null>(null)

// Reject dialog state
const rejectDialog = ref(false)
const rejectNotes = ref('')
const operationToReject = ref<UIUniversityOperation | null>(null)
const rejecting = ref(false)

// Action state
const actionLoading = ref<string | null>(null)

// Table headers - publication status visible to all users
const headers = computed(() => {
  return [
    { title: 'Title', key: 'title', sortable: true },
    { title: 'Type', key: 'operationType', sortable: true },
    { title: 'Campus', key: 'campus', sortable: true },
    { title: 'Status', key: 'status', sortable: true },
    { title: 'Publication', key: 'publicationStatus', sortable: true },
    { title: 'Budget', key: 'budgetAllocated', sortable: true, align: 'end' as const },
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
function viewOperation(op: UIUniversityOperation) {
  router.push(`/university-operations/detail-${op.id}`)
}

function editOperation(op: UIUniversityOperation) {
  router.push(`/university-operations/edit-${op.id}`)
}

function createOperation() {
  router.push('/university-operations/new')
}

// Delete confirmation
function confirmDelete(op: UIUniversityOperation) {
  operationToDelete.value = op
  deleteDialog.value = true
}

// --- Meatball Menu Action Visibility ---

// Check if current user is record owner, delegate, or assigned (Phase BM)
function isOwnerOrAssigned(op: UIUniversityOperation): boolean {
  const userId = authStore.user?.id
  if (!userId) return false
  return (
    op.createdBy === userId
    || op.delegatedTo === userId
    || op.assignedUsers?.some(u => u.id === userId) || false
  )
}

// Edit: Owner/assigned can edit own record, Admin can edit any. Editing PENDING_REVIEW auto-reverts to DRAFT.
function canEditItem(op: UIUniversityOperation): boolean {
  if (isAdmin.value) return true
  return isOwnerOrAssigned(op)
}

// Submit/Resubmit for Review: Owner/assigned + DRAFT or REJECTED status
function canSubmitForReview(op: UIUniversityOperation): boolean {
  if (!isStaff.value && !isOwnerOrAssigned(op)) return false
  if (!isOwnerOrAssigned(op)) return false
  return op.publicationStatus === 'DRAFT' || op.publicationStatus === 'REJECTED'
}

// Withdraw: Original submitter + PENDING_REVIEW status only
function canWithdraw(op: UIUniversityOperation): boolean {
  if (op.publicationStatus !== 'PENDING_REVIEW') return false
  return op.approvalMetadata?.submittedBy === authStore.user?.id
}

// Approve: Admin + PENDING_REVIEW status + NOT self-submitted
// Self-approval prevention: UI hides button if user is the submitter (backend also enforces)
function canApproveItem(op: UIUniversityOperation): boolean {
  if (!isAdmin.value) return false
  if (op.publicationStatus !== 'PENDING_REVIEW') return false
  // Prevent self-approval - hide button for own submissions (SuperAdmin excluded from this check)
  const currentUserId = authStore.user?.id
  if (!isSuperAdmin.value && op.approvalMetadata?.submittedBy === currentUserId) {
    return false
  }
  return true
}

// Reject: Admin + PENDING_REVIEW status only
function canRejectItem(op: UIUniversityOperation): boolean {
  return isAdmin.value && op.publicationStatus === 'PENDING_REVIEW'
}

// --- Meatball Menu Actions ---

async function submitForReview(op: UIUniversityOperation) {
  actionLoading.value = op.id
  try {
    await api.post(`/api/university-operations/${op.id}/submit-for-review`, {})
    toast.success(`"${op.title}" submitted for review`)
    await fetchOperations()
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || 'Failed to submit for review')
  } finally {
    actionLoading.value = null
  }
}

async function withdrawSubmission(op: UIUniversityOperation) {
  actionLoading.value = op.id
  try {
    await api.post(`/api/university-operations/${op.id}/withdraw`, {})
    toast.success(`"${op.title}" withdrawn successfully`)
    await fetchOperations()
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || 'Failed to withdraw submission')
  } finally {
    actionLoading.value = null
  }
}

async function approveItem(op: UIUniversityOperation) {
  actionLoading.value = op.id
  try {
    await api.post(`/api/university-operations/${op.id}/publish`, {})
    toast.success(`"${op.title}" published successfully`)
    await fetchOperations()
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || 'Failed to publish')
  } finally {
    actionLoading.value = null
  }
}

function openRejectDialog(op: UIUniversityOperation) {
  operationToReject.value = op
  rejectNotes.value = ''
  rejectDialog.value = true
}

async function rejectItem() {
  if (!operationToReject.value) return
  rejecting.value = true
  try {
    await api.post(`/api/university-operations/${operationToReject.value.id}/reject`, {
      notes: rejectNotes.value || 'Rejected by administrator',
    })
    toast.success(`"${operationToReject.value.title}" rejected`)
    rejectDialog.value = false
    await fetchOperations()
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || 'Failed to reject')
  } finally {
    rejecting.value = false
    operationToReject.value = null
    rejectNotes.value = ''
  }
}

async function deleteOperation() {
  if (!operationToDelete.value) return
  deleting.value = true
  try {
    await api.del(`/api/university-operations/${operationToDelete.value.id}`)
    const deletedTitle = operationToDelete.value.title
    operations.value = operations.value.filter(o => o.id !== operationToDelete.value!.id)
    toast.success(`Operation "${deletedTitle}" deleted successfully`)
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || 'Failed to delete operation')
    console.error('Failed to delete operation:', err)
  } finally {
    deleting.value = false
    deleteDialog.value = false
    operationToDelete.value = null
  }
}

// Status color mapping
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PLANNING: 'info',
    ONGOING: 'primary',
    COMPLETED: 'success',
    ON_HOLD: 'warning',
    CANCELLED: 'error',
  }
  return colors[status] || 'grey'
}

// Format operation type for display
function formatOperationType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
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

// Filtered operations
const filteredOperations = computed(() => {
  if (!search.value) return operations.value
  const term = search.value.toLowerCase()
  return operations.value.filter(
    (o) =>
      o.title.toLowerCase().includes(term) ||
      o.operationType.toLowerCase().includes(term) ||
      o.campus.toLowerCase().includes(term) ||
      o.status.toLowerCase().includes(term)
  )
})

async function fetchOperations() {
  loading.value = true
  try {
    const response = await api.get<{ data: BackendUniversityOperation[] }>('/api/university-operations')
    operations.value = adaptUniversityOperations(response.data || [])
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || 'Failed to load operations')
    console.error('Failed to fetch operations:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchOperations)
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          University Operations
        </h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          Manage university programs and operations
        </p>
      </div>
      <v-btn v-if="canAdd('university-operations')" color="primary" prepend-icon="mdi-plus" @click="createOperation">
        New Operation
      </v-btn>
    </div>

    <!-- Data Table Card -->
    <v-card>
      <!-- Toolbar -->
      <v-card-title class="d-flex align-center pa-4">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search operations"
          single-line
          hide-details
          density="compact"
          variant="outlined"
          class="mr-4"
          style="max-width: 300px"
        />
        <v-spacer />
        <v-chip color="primary" variant="tonal">
          {{ filteredOperations.length }} operations
        </v-chip>
      </v-card-title>

      <v-divider />

      <!-- Table -->
      <v-data-table
        :key="operations.length"
        :headers="headers"
        :items="filteredOperations"
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

        <!-- Operation Type -->
        <template #item.operationType="{ item }">
          <v-chip size="small" variant="outlined">
            {{ formatOperationType(item.operationType) }}
          </v-chip>
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

        <!-- Budget -->
        <template #item.budgetAllocated="{ item }">
          {{ formatCurrency(item.budgetAllocated) }}
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
              <v-list-item @click="viewOperation(item)" prepend-icon="mdi-eye">
                <v-list-item-title>View</v-list-item-title>
              </v-list-item>

              <!-- Edit (conditional) -->
              <v-list-item
                v-if="canEditItem(item)"
                @click="editOperation(item)"
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
              <v-divider v-if="canDelete('university-operations')" class="my-1" />

              <!-- Delete (Admin only) -->
              <v-list-item
                v-if="canDelete('university-operations')"
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
            <p class="text-h6 text-grey-darken-1">No operations found</p>
            <p class="text-body-2 text-grey">Operations will appear here once added</p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="text-h6">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete <strong>{{ operationToDelete?.title }}</strong>?
          This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false" :disabled="deleting">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="deleteOperation" :loading="deleting">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Reject Dialog -->
    <v-dialog v-model="rejectDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="text-h6">Reject Submission</v-card-title>
        <v-card-text>
          <p class="mb-4">
            Reject <strong>{{ operationToReject?.title }}</strong>?
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
