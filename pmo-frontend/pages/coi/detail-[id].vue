<script setup lang="ts">
import { adaptProjectDetail, type UIProjectDetail, type BackendProjectDetail, type PublicationStatus } from '~/utils/adapters'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const api = useApi()
const toast = useToast()
const { isAdmin, isStaff, canEdit } = usePermissions()
const authStore = useAuthStore()

const project = ref<UIProjectDetail | null>(null)
const loading = ref(true)

// ACE-R15 Tier 3: Direct ID extraction (no computed, no watchEffect)
// Dynamic route [id] means ID is static after mount - no reactivity needed
const projectId = route.params.id as string

// Validate ID immediately - redirect if missing
if (!projectId) {
  console.error('[COI Detail] No project ID in route, redirecting to list')
  router.push('/coi')
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

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format date
function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Fetch project using direct ID (not computed)
async function fetchProject() {
  if (!projectId) {
    toast.error('Invalid project ID')
    loading.value = false
    return
  }

  try {
    loading.value = true
    console.log('[COI Detail] Fetching project:', projectId)
    const response = await api.get<BackendProjectDetail>(`/api/construction-projects/${projectId}`)
    project.value = adaptProjectDetail(response)
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to load project details')
    console.error('[COI Detail] Failed to fetch project:', err)
  } finally {
    loading.value = false
  }
}

// Navigation
function goBack() {
  router.push('/coi')
}

function editProject() {
  router.push(`/coi/edit-${projectId}`)
}

// Draft Workflow State
const workflowDialog = ref(false)
const workflowAction = ref<'submit' | 'publish' | 'reject' | 'withdraw'>('submit')
const rejectionNotes = ref('')
const workflowProcessing = ref(false)

// Check if current user is the owner, delegate, or assigned (Phase BK)
const isOwnerOrAssigned = computed(() => {
  if (!project.value) return false
  const userId = authStore.user?.id
  if (!userId) return false
  return (
    project.value.createdBy === userId
    || project.value.delegatedTo === userId
    || project.value.assignedUsers?.some(u => u.id === userId) || false
  )
})

// Show Submit/Resubmit for Review: Staff or assigned user who owns/is assigned to a DRAFT or REJECTED record
const canSubmitForReview = computed(() => {
  if (!project.value) return false
  if (!isStaff.value && !isOwnerOrAssigned.value) return false
  if (!isOwnerOrAssigned.value) return false
  return (
    project.value.publicationStatus === 'DRAFT'
    || project.value.publicationStatus === 'REJECTED'
  )
})

// Show Withdraw button: Original submitter viewing PENDING_REVIEW
const canWithdraw = computed(() => {
  if (!project.value) return false
  if (project.value.publicationStatus !== 'PENDING_REVIEW') return false
  return project.value.approvalMetadata?.submittedBy === authStore.user?.id
})

// Show Publish/Reject buttons: Admin viewing PENDING_REVIEW
const canPublishOrReject = computed(() => {
  if (!project.value) return false
  return isAdmin.value && project.value.publicationStatus === 'PENDING_REVIEW'
})

// Show Edit button: Must be owner/assigned or Admin
// Editing PENDING_REVIEW reverts to DRAFT automatically (Phase W)
const canEditCurrentProject = computed(() => {
  if (!project.value) return false
  if (isAdmin.value) return true
  return isOwnerOrAssigned.value
})

// Publication status helpers
function getPublicationStatusColor(status: PublicationStatus): string {
  const colors: Record<PublicationStatus, string> = {
    DRAFT: 'grey',
    PENDING_REVIEW: 'orange',
    PUBLISHED: 'success',
    REJECTED: 'error',
  }
  return colors[status] || 'grey'
}

function getPublicationStatusLabel(status: PublicationStatus): string {
  const labels: Record<PublicationStatus, string> = {
    DRAFT: 'Draft',
    PENDING_REVIEW: 'Pending Review',
    PUBLISHED: 'Published',
    REJECTED: 'Rejected',
  }
  return labels[status] || status
}

// Workflow actions
function openSubmitDialog() {
  workflowAction.value = 'submit'
  workflowDialog.value = true
}

function openPublishDialog() {
  workflowAction.value = 'publish'
  workflowDialog.value = true
}

function openRejectDialog() {
  workflowAction.value = 'reject'
  rejectionNotes.value = ''
  workflowDialog.value = true
}

function openWithdrawDialog() {
  workflowAction.value = 'withdraw'
  workflowDialog.value = true
}

async function executeWorkflowAction() {
  workflowProcessing.value = true
  try {
    if (workflowAction.value === 'submit') {
      await api.post(`/api/construction-projects/${projectId}/submit-for-review`, {})
      toast.success('Submitted for review successfully')
    } else if (workflowAction.value === 'publish') {
      await api.post(`/api/construction-projects/${projectId}/publish`, {})
      toast.success('Project published successfully')
    } else if (workflowAction.value === 'reject') {
      await api.post(`/api/construction-projects/${projectId}/reject`, { notes: rejectionNotes.value })
      toast.success('Project rejected')
    } else if (workflowAction.value === 'withdraw') {
      await api.post(`/api/construction-projects/${projectId}/withdraw`, {})
      toast.success('Submission withdrawn successfully')
    }
    // Refresh project data
    await fetchProject()
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || `Failed to ${workflowAction.value}`)
    console.error(`Workflow action failed:`, err)
  } finally {
    workflowProcessing.value = false
    workflowDialog.value = false
    rejectionNotes.value = ''
  }
}

// ACE-R15 Tier 3: Simple onMounted (no watchEffect complexity)
onMounted(() => {
  console.log('[COI Detail] Mounted with ID:', projectId)
  fetchProject()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div class="d-flex align-center ga-3">
        <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" />
        <div>
          <h1 class="text-h4 font-weight-bold text-grey-darken-3">
            {{ project?.projectName || 'Project Details' }}
          </h1>
          <p class="text-subtitle-1 text-grey-darken-1">
            {{ project?.projectCode || '' }}
          </p>
        </div>
      </div>
      <div class="d-flex ga-2">
        <!-- Draft Workflow Buttons -->
        <v-btn
          v-if="canSubmitForReview"
          color="orange"
          prepend-icon="mdi-send"
          @click="openSubmitDialog"
          :disabled="loading"
        >
          Submit for Review
        </v-btn>
        <v-btn
          v-if="canWithdraw"
          color="orange"
          variant="outlined"
          prepend-icon="mdi-undo"
          @click="openWithdrawDialog"
          :disabled="loading"
        >
          Withdraw
        </v-btn>
        <v-btn
          v-if="canPublishOrReject"
          color="success"
          prepend-icon="mdi-check-circle"
          @click="openPublishDialog"
          :disabled="loading"
        >
          Publish
        </v-btn>
        <v-btn
          v-if="canPublishOrReject"
          color="error"
          variant="outlined"
          prepend-icon="mdi-close-circle"
          @click="openRejectDialog"
          :disabled="loading"
        >
          Reject
        </v-btn>
        <v-btn v-if="canEditCurrentProject" color="primary" prepend-icon="mdi-pencil" @click="editProject" :disabled="loading">
          Edit Project
        </v-btn>
      </div>
    </div>

    <!-- Loading State -->
    <v-card v-if="loading" class="pa-6">
      <v-skeleton-loader type="article, table" />
    </v-card>

    <!-- Project Details -->
    <template v-else-if="project">
      <!-- Status and Progress Card -->
      <v-card class="mb-4">
        <v-card-text>
          <div class="d-flex flex-wrap ga-6 align-center">
            <div>
              <p class="text-caption text-grey mb-1">Status</p>
              <v-chip :color="getStatusColor(project.status)" size="large">
                {{ project.status }}
              </v-chip>
            </div>
            <div v-if="isAdmin || project.publicationStatus !== 'PUBLISHED'">
              <p class="text-caption text-grey mb-1">Publication</p>
              <v-chip :color="getPublicationStatusColor(project.publicationStatus)" size="large">
                {{ getPublicationStatusLabel(project.publicationStatus) }}
              </v-chip>
              <!-- Approval Metadata -->
              <div v-if="project.publicationStatus === 'PUBLISHED' && project.approvalMetadata?.reviewedByName" class="mt-2">
                <v-chip size="small" variant="tonal" color="success" prepend-icon="mdi-check-circle">
                  Approved by {{ project.approvalMetadata.reviewedByName }}
                </v-chip>
                <p class="text-caption text-grey mt-1">
                  {{ formatDate(project.approvalMetadata.reviewedAt || '') }}
                </p>
              </div>
              <div v-else-if="project.publicationStatus === 'REJECTED' && project.approvalMetadata?.reviewedByName" class="mt-2">
                <v-chip size="small" variant="tonal" color="error" prepend-icon="mdi-close-circle">
                  Rejected by {{ project.approvalMetadata.reviewedByName }}
                </v-chip>
                <p class="text-caption text-grey mt-1">
                  {{ formatDate(project.approvalMetadata.reviewedAt || '') }}
                </p>
                <p v-if="project.approvalMetadata.reviewNotes" class="text-body-2 text-grey-darken-1 mt-1">
                  <strong>Notes:</strong> {{ project.approvalMetadata.reviewNotes }}
                </p>
              </div>
              <div v-else-if="project.publicationStatus === 'PENDING_REVIEW' && project.approvalMetadata?.submittedByName" class="mt-2">
                <v-chip size="small" variant="tonal" color="orange" prepend-icon="mdi-clock-outline">
                  Submitted by {{ project.approvalMetadata.submittedByName }}
                </v-chip>
                <p class="text-caption text-grey mt-1">
                  {{ formatDate(project.approvalMetadata.submittedAt || '') }}
                </p>
              </div>
            </div>
            <div>
              <p class="text-caption text-grey mb-1">Campus</p>
              <v-chip variant="outlined">{{ project.campus }}</v-chip>
            </div>
            <div>
              <p class="text-caption text-grey mb-1">Progress</p>
              <div class="d-flex align-center" style="min-width: 200px">
                <v-progress-linear
                  :model-value="project.physicalAccomplishment"
                  :color="project.physicalAccomplishment >= 100 ? 'success' : 'primary'"
                  height="12"
                  rounded
                  class="mr-3"
                />
                <span class="font-weight-bold">{{ project.physicalAccomplishment }}%</span>
              </div>
            </div>
            <v-spacer />
            <div class="text-right">
              <p class="text-caption text-grey mb-1">Contract Amount</p>
              <p class="text-h5 font-weight-bold text-primary">
                {{ formatCurrency(project.totalContractAmount) }}
              </p>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Main Details -->
      <v-row>
        <v-col cols="12" md="8">
          <!-- Project Information -->
          <v-card class="mb-4">
            <v-card-title>Project Information</v-card-title>
            <v-divider />
            <v-card-text>
              <v-row>
                <v-col cols="12" v-if="project.description">
                  <p class="text-caption text-grey">Description</p>
                  <p>{{ project.description }}</p>
                </v-col>
                <v-col cols="12" sm="6">
                  <p class="text-caption text-grey">Start Date</p>
                  <p class="font-weight-medium">{{ formatDate(project.startDate) }}</p>
                </v-col>
                <v-col cols="12" sm="6">
                  <p class="text-caption text-grey">Target Completion</p>
                  <p class="font-weight-medium">{{ formatDate(project.targetCompletionDate) }}</p>
                </v-col>
                <v-col cols="12" sm="6">
                  <p class="text-caption text-grey">Duration</p>
                  <p class="font-weight-medium">{{ project.projectDuration || '-' }}</p>
                </v-col>
                <v-col cols="12" sm="6">
                  <p class="text-caption text-grey">Contract Number</p>
                  <p class="font-weight-medium">{{ project.contractNumber || '-' }}</p>
                </v-col>
                <v-col cols="12" sm="6">
                  <p class="text-caption text-grey">Project Engineer</p>
                  <p class="font-weight-medium">{{ project.projectEngineer || '-' }}</p>
                </v-col>
                <v-col cols="12" sm="6">
                  <p class="text-caption text-grey">Project Manager</p>
                  <p class="font-weight-medium">{{ project.projectManager || '-' }}</p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Milestones -->
          <v-card class="mb-4">
            <v-card-title>Milestones</v-card-title>
            <v-divider />
            <v-data-table
              :items="project.milestones"
              :headers="[
                { title: 'Milestone', key: 'name' },
                { title: 'Target Date', key: 'targetDate' },
                { title: 'Actual Date', key: 'actualDate' },
                { title: 'Weight', key: 'weight', align: 'center' },
                { title: 'Progress', key: 'progress', align: 'center' },
                { title: 'Status', key: 'status' },
              ]"
              density="comfortable"
              class="elevation-0"
            >
              <template #item.targetDate="{ item }">
                {{ formatDate(item.targetDate) }}
              </template>
              <template #item.actualDate="{ item }">
                {{ formatDate(item.actualDate) }}
              </template>
              <template #item.weight="{ item }">
                {{ item.weight }}%
              </template>
              <template #item.progress="{ item }">
                <v-progress-circular
                  :model-value="item.progress"
                  :color="item.progress >= 100 ? 'success' : 'primary'"
                  size="40"
                >
                  {{ item.progress }}
                </v-progress-circular>
              </template>
              <template #item.status="{ item }">
                <v-chip :color="getStatusColor(item.status)" size="small">
                  {{ item.status }}
                </v-chip>
              </template>
              <template #no-data>
                <div class="text-center pa-4 text-grey">No milestones recorded</div>
              </template>
            </v-data-table>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <!-- Building Details -->
          <v-card class="mb-4">
            <v-card-title>Building Details</v-card-title>
            <v-divider />
            <v-list>
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-office-building" />
                </template>
                <v-list-item-title>Building Type</v-list-item-title>
                <v-list-item-subtitle>{{ project.buildingType || '-' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-floor-plan" />
                </template>
                <v-list-item-title>Floor Area</v-list-item-title>
                <v-list-item-subtitle>{{ project.floorArea ? `${project.floorArea} sqm` : '-' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-stairs" />
                </template>
                <v-list-item-title>Number of Floors</v-list-item-title>
                <v-list-item-subtitle>{{ project.numberOfFloors || '-' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-tag" />
                </template>
                <v-list-item-title>Subcategory</v-list-item-title>
                <v-list-item-subtitle>{{ project.subcategory || '-' }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>

          <!-- Contractor & Fund Source -->
          <v-card class="mb-4">
            <v-card-title>Contractor & Funding</v-card-title>
            <v-divider />
            <v-list>
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-account-hard-hat" />
                </template>
                <v-list-item-title>Contractor</v-list-item-title>
                <v-list-item-subtitle>{{ project.contractor || '-' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-bank" />
                </template>
                <v-list-item-title>Fund Source</v-list-item-title>
                <v-list-item-subtitle>{{ project.fundSource || '-' }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>

          <!-- Assigned Staff/Personnel -->
          <v-card v-if="project.delegatedToName" class="mb-4">
            <v-card-title>Assigned Staff/Personnel</v-card-title>
            <v-divider />
            <v-list>
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-account-check" />
                </template>
                <v-list-item-title>Assigned To</v-list-item-title>
                <v-list-item-subtitle>{{ project.delegatedToName }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>

          <!-- Financials -->
          <v-card class="mb-4">
            <v-card-title>Financial Records</v-card-title>
            <v-divider />
            <v-list v-if="project.financials.length > 0">
              <v-list-item v-for="fin in project.financials" :key="fin.id">
                <v-list-item-title>{{ fin.description }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ fin.type }} - {{ formatDate(fin.dateRecorded) }}
                </v-list-item-subtitle>
                <template #append>
                  <span class="font-weight-bold">{{ formatCurrency(fin.amount) }}</span>
                </template>
              </v-list-item>
            </v-list>
            <v-card-text v-else class="text-center text-grey">
              No financial records
            </v-card-text>
          </v-card>

          <!-- Approval History Timeline -->
          <v-card>
            <v-card-title class="d-flex align-center ga-2">
              <v-icon icon="mdi-history" size="small" />
              Approval History
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-2">
              <v-timeline side="end" density="compact" truncate-line="both">
                <!-- Stage 1: Created -->
                <v-timeline-item
                  dot-color="blue-grey"
                  icon="mdi-file-plus-outline"
                  size="small"
                >
                  <div class="text-body-2 font-weight-medium">Record Created</div>
                  <div class="text-caption text-grey">
                    {{ project.approvalMetadata?.createdByName || 'Unknown' }}
                  </div>
                  <div class="text-caption text-grey">
                    {{ formatDate(project.approvalMetadata?.createdAt || project.createdAt || '') }}
                  </div>
                </v-timeline-item>

                <!-- Stage 2: Submitted (only if submitted) -->
                <v-timeline-item
                  v-if="project.approvalMetadata?.submittedByName"
                  dot-color="orange"
                  icon="mdi-send-outline"
                  size="small"
                >
                  <div class="text-body-2 font-weight-medium">Submitted for Review</div>
                  <div class="text-caption text-grey">
                    {{ project.approvalMetadata.submittedByName }}
                  </div>
                  <div class="text-caption text-grey">
                    {{ formatDate(project.approvalMetadata.submittedAt || '') }}
                  </div>
                </v-timeline-item>

                <!-- Stage 3: Review Decision (only if reviewed) -->
                <v-timeline-item
                  v-if="project.approvalMetadata?.reviewedByName"
                  :dot-color="project.publicationStatus === 'PUBLISHED' ? 'success' : 'error'"
                  :icon="project.publicationStatus === 'PUBLISHED' ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
                  size="small"
                >
                  <div class="text-body-2 font-weight-medium">
                    {{ project.publicationStatus === 'PUBLISHED' ? 'Approved' : 'Rejected' }}
                  </div>
                  <div class="text-caption text-grey">
                    {{ project.approvalMetadata.reviewedByName }}
                  </div>
                  <div class="text-caption text-grey">
                    {{ formatDate(project.approvalMetadata.reviewedAt || '') }}
                  </div>
                  <div v-if="project.approvalMetadata.reviewNotes" class="text-caption text-error mt-1">
                    <strong>Notes:</strong> {{ project.approvalMetadata.reviewNotes }}
                  </div>
                </v-timeline-item>
              </v-timeline>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Workflow Action Dialog -->
    <v-dialog v-model="workflowDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="text-h6">
          <template v-if="workflowAction === 'submit'">Submit for Review</template>
          <template v-else-if="workflowAction === 'publish'">Publish Project</template>
          <template v-else>Reject Project</template>
        </v-card-title>
        <v-card-text>
          <template v-if="workflowAction === 'submit'">
            <p>
              Submit <strong>{{ project?.projectName }}</strong> for admin review?
            </p>
            <p class="text-caption text-grey mt-2">
              An administrator will review and approve or reject this project.
            </p>
          </template>
          <template v-else-if="workflowAction === 'publish'">
            <p>
              Publish <strong>{{ project?.projectName }}</strong>?
            </p>
            <p class="text-caption text-grey mt-2">
              This will make the project visible to all users.
            </p>
          </template>
          <template v-else>
            <p class="mb-4">
              Reject <strong>{{ project?.projectName }}</strong>?
            </p>
            <v-textarea
              v-model="rejectionNotes"
              label="Rejection Notes (optional)"
              placeholder="Explain why this project was rejected..."
              rows="3"
              variant="outlined"
              hide-details
            />
          </template>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="workflowDialog = false" :disabled="workflowProcessing">Cancel</v-btn>
          <v-btn
            :color="workflowAction === 'reject' ? 'error' : workflowAction === 'publish' ? 'success' : 'orange'"
            variant="flat"
            @click="executeWorkflowAction"
            :loading="workflowProcessing"
          >
            <template v-if="workflowAction === 'submit'">Submit</template>
            <template v-else-if="workflowAction === 'publish'">Publish</template>
            <template v-else>Reject</template>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
