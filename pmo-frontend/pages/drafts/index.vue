<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

const api = useApi()
const router = useRouter()

interface DraftItem {
  id: string
  title: string
  project_code?: string
  publication_status: string
  submitted_at?: string
  created_at: string
  module: 'coi' | 'repairs' | 'university_operations'
}

const loading = ref(true)
const drafts = ref<DraftItem[]>([])

// Status colors
const statusColors: Record<string, string> = {
  DRAFT: 'grey',
  PENDING_REVIEW: 'warning',
  REJECTED: 'error',
  PUBLISHED: 'success',
}

// Module labels
const moduleLabels: Record<string, string> = {
  coi: 'Infrastructure (COI)',
  repairs: 'Repair Projects',
  university_operations: 'University Operations',
}

// Module colors
const moduleColors: Record<string, string> = {
  coi: 'blue',
  repairs: 'orange',
  university_operations: 'purple',
}

// Fetch drafts from all modules
async function fetchDrafts() {
  loading.value = true
  drafts.value = []

  try {
    // Fetch from all three endpoints in parallel
    const [coiDrafts, repairDrafts, opsDrafts] = await Promise.all([
      api.get<any[]>('/api/construction-projects/my-drafts').catch(() => []),
      api.get<any[]>('/api/repair-projects/my-drafts').catch(() => []),
      api.get<any[]>('/api/university-operations/my-drafts').catch(() => []),
    ])

    // Combine and normalize
    const combined: DraftItem[] = [
      ...coiDrafts.map(d => ({ ...d, module: 'coi' as const })),
      ...repairDrafts.map(d => ({ ...d, module: 'repairs' as const })),
      ...opsDrafts.map(d => ({ ...d, module: 'university_operations' as const })),
    ]

    // Sort by created_at descending (newest first)
    drafts.value = combined.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  } catch (err) {
    console.error('[Drafts] Failed to fetch drafts:', err)
  } finally {
    loading.value = false
  }
}

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

// Navigate to edit draft
function editDraft(draft: DraftItem) {
  const routes: Record<string, string> = {
    coi: `/coi/edit-${draft.id}`,
    repairs: `/repairs/edit-${draft.id}`,
    university_operations: `/university-operations/edit-${draft.id}`,
  }
  router.push(routes[draft.module])
}

// Navigate to view draft
function viewDraft(draft: DraftItem) {
  const routes: Record<string, string> = {
    coi: `/coi/detail-${draft.id}`,
    repairs: `/repairs/detail-${draft.id}`,
    university_operations: `/university-operations/detail-${draft.id}`,
  }
  router.push(routes[draft.module])
}

onMounted(() => {
  fetchDrafts()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          My Drafts
        </h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          Your unpublished submissions and pending reviews
        </p>
      </div>
      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-refresh"
        @click="fetchDrafts"
        :loading="loading"
      >
        Refresh
      </v-btn>
    </div>

    <!-- Loading State -->
    <v-card v-if="loading" class="pa-6">
      <v-skeleton-loader type="table" />
    </v-card>

    <!-- Empty State -->
    <v-card v-else-if="drafts.length === 0" class="pa-6">
      <v-empty-state
        icon="mdi-file-document-edit-outline"
        headline="No Drafts"
        text="You don't have any draft submissions. Create a new project to get started."
      />
    </v-card>

    <!-- Drafts Table -->
    <v-card v-else>
      <v-data-table
        :headers="[
          { title: 'Title', key: 'title', sortable: true },
          { title: 'Module', key: 'module', sortable: true },
          { title: 'Status', key: 'publication_status', sortable: true },
          { title: 'Created', key: 'created_at', sortable: true },
          { title: 'Submitted', key: 'submitted_at', sortable: true },
          { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
        ]"
        :items="drafts"
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

        <!-- Status Badge -->
        <template #item.publication_status="{ item }">
          <v-chip
            :color="statusColors[item.publication_status]"
            size="small"
            variant="tonal"
          >
            {{ item.publication_status.replace('_', ' ') }}
          </v-chip>
        </template>

        <!-- Created Date -->
        <template #item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <!-- Submitted Date -->
        <template #item.submitted_at="{ item }">
          {{ formatDate(item.submitted_at) }}
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <div class="d-flex ga-1 justify-end">
            <v-btn
              icon="mdi-eye"
              size="small"
              variant="text"
              color="grey"
              @click="viewDraft(item)"
            >
              <v-icon>mdi-eye</v-icon>
              <v-tooltip activator="parent" location="top">View</v-tooltip>
            </v-btn>
            <v-btn
              v-if="item.publication_status !== 'PENDING_REVIEW'"
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="primary"
              @click="editDraft(item)"
            >
              <v-icon>mdi-pencil</v-icon>
              <v-tooltip activator="parent" location="top">Edit</v-tooltip>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Status Legend -->
    <v-card class="mt-4 pa-4">
      <div class="text-subtitle-2 mb-2">Status Legend</div>
      <div class="d-flex flex-wrap ga-3">
        <div class="d-flex align-center ga-2">
          <v-chip color="grey" size="small" variant="tonal">DRAFT</v-chip>
          <span class="text-caption">Not yet submitted</span>
        </div>
        <div class="d-flex align-center ga-2">
          <v-chip color="warning" size="small" variant="tonal">PENDING REVIEW</v-chip>
          <span class="text-caption">Awaiting approval</span>
        </div>
        <div class="d-flex align-center ga-2">
          <v-chip color="error" size="small" variant="tonal">REJECTED</v-chip>
          <span class="text-caption">Needs revision</span>
        </div>
        <div class="d-flex align-center ga-2">
          <v-chip color="success" size="small" variant="tonal">PUBLISHED</v-chip>
          <span class="text-caption">Live and visible</span>
        </div>
      </div>
    </v-card>
  </div>
</template>
