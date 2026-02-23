<script setup lang="ts">
/**
 * Pending Reviews Dashboard - Admin-only page
 *
 * Displays all records pending review across modules.
 * Filtered by admin's module assignments.
 * SuperAdmin sees all pending items.
 */

definePageMeta({
  middleware: ['auth'],
})

const api = useApi()
const router = useRouter()
const toast = useToast()
const { isAdmin, isSuperAdmin, canApprove } = usePermissions()

// Redirect non-admin users
onMounted(() => {
  if (!isAdmin.value) {
    toast.error('Access denied. Admin role required.')
    router.push('/dashboard')
  }
})

interface PendingItem {
  id: string
  title: string
  project_code?: string
  campus?: string
  publication_status: string
  submitted_by: string
  submitted_at: string
  created_at: string
  submitter_name: string
  module: 'coi' | 'repairs' | 'university_operations'
}

const loading = ref(true)
const pendingItems = ref<PendingItem[]>([])
const activeTab = ref('all')

// Action states
const actionLoading = ref<string | null>(null)
const rejectDialog = ref(false)
const itemToReject = ref<PendingItem | null>(null)
const rejectNotes = ref('')
const rejecting = ref(false)

// Module labels
const moduleLabels: Record<string, string> = {
  coi: 'Construction (COI)',
  repairs: 'Repair Projects',
  university_operations: 'University Operations',
}

// Module colors
const moduleColors: Record<string, string> = {
  coi: 'blue',
  repairs: 'orange',
  university_operations: 'purple',
}

// API endpoints by module
const moduleEndpoints: Record<string, string> = {
  coi: '/api/construction-projects',
  repairs: '/api/repair-projects',
  university_operations: '/api/university-operations',
}

// Fetch pending reviews from all modules
async function fetchPendingItems() {
  loading.value = true
  pendingItems.value = []

  try {
    // Fetch from all three endpoints in parallel
    const [coiPending, repairsPending, opsPending] = await Promise.all([
      api.get<any[]>('/api/construction-projects/pending-review').catch(() => []),
      api.get<any[]>('/api/repair-projects/pending-review').catch(() => []),
      api.get<any[]>('/api/university-operations/pending-review').catch(() => []),
    ])

    // Combine and normalize
    const combined: PendingItem[] = [
      ...coiPending.map(d => ({
        ...d,
        module: 'coi' as const,
        title: d.title || d.project_code || 'Untitled',
      })),
      ...repairsPending.map(d => ({
        ...d,
        module: 'repairs' as const,
        title: d.title || 'Untitled',
      })),
      ...opsPending.map(d => ({
        ...d,
        module: 'university_operations' as const,
        title: d.title || 'Untitled',
      })),
    ]

    // Sort by submitted_at ascending (oldest first - FIFO review)
    pendingItems.value = combined.sort((a, b) =>
      new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
    )
  } catch (err) {
    console.error('[PendingReviews] Failed to fetch:', err)
    toast.error('Failed to load pending reviews')
  } finally {
    loading.value = false
  }
}

// Filtered items based on active tab
const filteredItems = computed(() => {
  if (activeTab.value === 'all') return pendingItems.value
  return pendingItems.value.filter(item => item.module === activeTab.value)
})

// Tab counts
const tabCounts = computed(() => ({
  all: pendingItems.value.length,
  coi: pendingItems.value.filter(i => i.module === 'coi').length,
  repairs: pendingItems.value.filter(i => i.module === 'repairs').length,
  university_operations: pendingItems.value.filter(i => i.module === 'university_operations').length,
}))

// Format date
function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Navigate to view item
function viewItem(item: PendingItem) {
  const routes: Record<string, string> = {
    coi: `/coi/detail-${item.id}`,
    repairs: `/repairs/detail-${item.id}`,
    university_operations: `/university-operations/detail-${item.id}`,
  }
  router.push(routes[item.module])
}

// Approve item
async function approveItem(item: PendingItem) {
  // Check module-level approval authority
  if (!canApprove(item.module)) {
    toast.error('You are not authorized to approve items in this module')
    return
  }

  actionLoading.value = item.id
  try {
    const endpoint = `${moduleEndpoints[item.module]}/${item.id}/publish`
    await api.post(endpoint, {})
    toast.success(`"${item.title}" published successfully`)
    await fetchPendingItems()
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || 'Failed to approve')
  } finally {
    actionLoading.value = null
  }
}

// Open reject dialog
function openRejectDialog(item: PendingItem) {
  // Check module-level approval authority
  if (!canApprove(item.module)) {
    toast.error('You are not authorized to reject items in this module')
    return
  }

  itemToReject.value = item
  rejectNotes.value = ''
  rejectDialog.value = true
}

// Reject item
async function rejectItem() {
  if (!itemToReject.value) return
  rejecting.value = true
  try {
    const endpoint = `${moduleEndpoints[itemToReject.value.module]}/${itemToReject.value.id}/reject`
    await api.post(endpoint, {
      notes: rejectNotes.value || 'Rejected by administrator',
    })
    toast.success(`"${itemToReject.value.title}" rejected`)
    rejectDialog.value = false
    await fetchPendingItems()
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || 'Failed to reject')
  } finally {
    rejecting.value = false
    itemToReject.value = null
    rejectNotes.value = ''
  }
}

onMounted(() => {
  if (isAdmin.value) {
    fetchPendingItems()
  }
})
</script>

<template>
  <div v-if="isAdmin">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          Pending Reviews
        </h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          Submissions awaiting your approval
        </p>
      </div>
      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-refresh"
        @click="fetchPendingItems"
        :loading="loading"
      >
        Refresh
      </v-btn>
    </div>

    <!-- Module Tabs -->
    <v-card class="mb-4">
      <v-tabs v-model="activeTab" color="primary" grow>
        <v-tab value="all">
          All
          <v-badge
            v-if="tabCounts.all > 0"
            :content="tabCounts.all"
            color="primary"
            inline
            class="ml-2"
          />
        </v-tab>
        <v-tab value="coi">
          Construction
          <v-badge
            v-if="tabCounts.coi > 0"
            :content="tabCounts.coi"
            color="blue"
            inline
            class="ml-2"
          />
        </v-tab>
        <v-tab value="repairs">
          Repairs
          <v-badge
            v-if="tabCounts.repairs > 0"
            :content="tabCounts.repairs"
            color="orange"
            inline
            class="ml-2"
          />
        </v-tab>
        <v-tab value="university_operations">
          University Ops
          <v-badge
            v-if="tabCounts.university_operations > 0"
            :content="tabCounts.university_operations"
            color="purple"
            inline
            class="ml-2"
          />
        </v-tab>
      </v-tabs>
    </v-card>

    <!-- Loading State -->
    <v-card v-if="loading" class="pa-6">
      <v-skeleton-loader type="table" />
    </v-card>

    <!-- Empty State -->
    <v-card v-else-if="filteredItems.length === 0" class="pa-6">
      <v-empty-state
        icon="mdi-clipboard-check-outline"
        headline="No Pending Reviews"
        :text="activeTab === 'all'
          ? 'There are no submissions waiting for your review.'
          : `No pending reviews in ${moduleLabels[activeTab] || activeTab}.`"
      />
    </v-card>

    <!-- Pending Reviews Table -->
    <v-card v-else>
      <v-data-table
        :headers="[
          { title: 'Title', key: 'title', sortable: true },
          { title: 'Module', key: 'module', sortable: true },
          { title: 'Submitted By', key: 'submitter_name', sortable: true },
          { title: 'Submitted', key: 'submitted_at', sortable: true },
          { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
        ]"
        :items="filteredItems"
        :items-per-page="20"
        density="comfortable"
        hover
      >
        <!-- Title -->
        <template #item.title="{ item }">
          <div>
            <span class="font-weight-medium">{{ item.title }}</span>
            <div v-if="item.project_code" class="text-caption text-grey">
              {{ item.project_code }}
            </div>
            <div v-if="item.campus" class="text-caption text-grey">
              {{ item.campus }}
            </div>
          </div>
        </template>

        <!-- Module Badge -->
        <template #item.module="{ item }">
          <v-chip
            :color="moduleColors[item.module]"
            size="small"
            variant="tonal"
          >
            {{ moduleLabels[item.module] }}
          </v-chip>
        </template>

        <!-- Submitter -->
        <template #item.submitter_name="{ item }">
          {{ item.submitter_name || 'Unknown' }}
        </template>

        <!-- Submitted Date -->
        <template #item.submitted_at="{ item }">
          {{ formatDate(item.submitted_at) }}
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
              <!-- View -->
              <v-list-item
                @click="viewItem(item)"
                prepend-icon="mdi-eye"
              >
                <v-list-item-title>View Details</v-list-item-title>
              </v-list-item>

              <v-divider class="my-1" />

              <!-- Approve -->
              <v-list-item
                @click="approveItem(item)"
                prepend-icon="mdi-check-circle"
                class="text-success"
              >
                <v-list-item-title>Approve</v-list-item-title>
              </v-list-item>

              <!-- Reject -->
              <v-list-item
                @click="openRejectDialog(item)"
                prepend-icon="mdi-close-circle"
                class="text-error"
              >
                <v-list-item-title>Reject</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>

    <!-- Reject Dialog -->
    <v-dialog v-model="rejectDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h6">
          Reject Submission
        </v-card-title>
        <v-card-text>
          <p class="mb-4">
            Are you sure you want to reject
            <strong>"{{ itemToReject?.title }}"</strong>?
          </p>
          <v-textarea
            v-model="rejectNotes"
            label="Rejection Notes"
            placeholder="Provide feedback for the submitter..."
            rows="3"
            variant="outlined"
            hide-details
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="rejectDialog = false"
            :disabled="rejecting"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            @click="rejectItem"
            :loading="rejecting"
          >
            Reject
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Info Card -->
    <v-card class="mt-4 pa-4">
      <div class="text-subtitle-2 mb-2">Review Guidelines</div>
      <ul class="text-body-2 text-grey-darken-1 pl-4">
        <li>Review submissions in order received (oldest first)</li>
        <li>Approve items that meet all requirements</li>
        <li>Reject items with clear feedback for revision</li>
        <li v-if="!isSuperAdmin">You can only approve items in your assigned modules</li>
      </ul>
    </v-card>
  </div>

  <!-- Access Denied (fallback, should redirect) -->
  <div v-else class="pa-6 text-center">
    <v-icon size="64" color="error">mdi-shield-off</v-icon>
    <h2 class="mt-4">Access Denied</h2>
    <p class="text-grey">Admin role required to view this page.</p>
    <v-btn color="primary" to="/dashboard" class="mt-4">
      Return to Dashboard
    </v-btn>
  </div>
</template>
