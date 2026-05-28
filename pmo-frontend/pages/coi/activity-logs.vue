<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'permission'],
})

const router = useRouter()
const api = useApi()

const logs = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 50
const loading = ref(false)
const filterProjectId = ref('')

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'success',
  UPDATE: 'primary',
  DELETE: 'error',
  SUBMIT: 'info',
  PUBLISH: 'primary',
  REJECT: 'warning',
  WITHDRAW: 'grey',
  UPLOAD: 'teal',
  REMOVE_ATTACHMENT: 'error',
}

function actionColor(action: string): string {
  return ACTION_COLORS[action] || 'grey'
}

function formatTimestamp(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function fetchLogs() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      entityType: 'CONSTRUCTION_PROJECT',
      page: String(page.value),
      pageSize: String(pageSize),
    })
    if (filterProjectId.value.trim()) {
      params.set('entityId', filterProjectId.value.trim())
    }
    const res = await api.get<{ data: any[]; total: number; page: number; pageSize: number }>(
      `/api/activity-logs?${params.toString()}`,
    )
    logs.value = res.data || []
    total.value = res.total || 0
  } catch (err: any) {
    console.error('[Activity Logs] Fetch failed:', err)
    if (err?.statusCode === 403 || err?.status === 403) {
      logs.value = []
      total.value = 0
    }
  } finally {
    loading.value = false
  }
}

const totalPages = computed(() => Math.ceil(total.value / pageSize))

function prevPage() {
  if (page.value > 1) {
    page.value--
    fetchLogs()
  }
}

function nextPage() {
  if (page.value < totalPages.value) {
    page.value++
    fetchLogs()
  }
}

function applyFilter() {
  page.value = 1
  fetchLogs()
}

function clearFilter() {
  filterProjectId.value = ''
  page.value = 1
  fetchLogs()
}

onMounted(fetchLogs)
</script>

<template>
  <div class="pa-4">
    <div class="d-flex align-center ga-3 mb-4">
      <v-btn icon="mdi-arrow-left" variant="text" @click="router.push('/coi')" />
      <div>
        <h1 class="text-h5 font-weight-bold">COI Activity Logs</h1>
        <p class="text-caption text-grey">Audit trail for all Infrastructure Project actions</p>
      </div>
    </div>

    <!-- Filter bar -->
    <v-row dense class="mb-3" align="center">
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="filterProjectId"
          label="Filter by Project ID (UUID)"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          @keyup.enter="applyFilter"
          @click:clear="clearFilter"
        />
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" variant="tonal" density="comfortable" @click="applyFilter">
          Apply
        </v-btn>
      </v-col>
      <v-col cols="auto" class="ml-auto">
        <span class="text-caption text-grey">{{ total.toLocaleString() }} total entries</span>
      </v-col>
    </v-row>

    <!-- Log table -->
    <v-card>
      <div v-if="loading" class="pa-6">
        <v-skeleton-loader type="table-row@10" />
      </div>
      <template v-else>
        <v-table density="comfortable">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity ID</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="logs.length === 0">
              <td colspan="5" class="text-center pa-8 text-grey">
                <v-icon icon="mdi-history" size="40" class="mb-2 d-block mx-auto" />
                No activity logs found
              </td>
            </tr>
            <tr v-for="log in logs" :key="log.id">
              <td class="text-caption text-no-wrap">{{ formatTimestamp(log.createdAt) }}</td>
              <td>
                <div class="text-body-2 font-weight-medium">{{ log.userName || log.userEmail }}</div>
                <div v-if="log.userEmail !== log.userName" class="text-caption text-grey">{{ log.userEmail }}</div>
              </td>
              <td>
                <v-chip :color="actionColor(log.action)" size="small" variant="tonal">
                  {{ log.action }}
                </v-chip>
              </td>
              <td class="text-caption text-mono" style="font-family: monospace; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                {{ log.entityId }}
              </td>
              <td>
                <span v-if="log.metadata && Object.keys(log.metadata).length" class="text-caption text-grey">
                  {{ Object.entries(log.metadata).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' · ') }}
                </span>
                <span v-else class="text-caption text-grey-lighten-1">—</span>
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- Pagination -->
        <v-divider />
        <div class="d-flex align-center justify-space-between pa-3">
          <span class="text-caption text-grey">Page {{ page }} of {{ totalPages || 1 }}</span>
          <div class="d-flex ga-2">
            <v-btn
              size="small"
              variant="tonal"
              :disabled="page <= 1"
              prepend-icon="mdi-chevron-left"
              @click="prevPage"
            >
              Prev
            </v-btn>
            <v-btn
              size="small"
              variant="tonal"
              :disabled="page >= totalPages"
              append-icon="mdi-chevron-right"
              @click="nextPage"
            >
              Next
            </v-btn>
          </div>
        </div>
      </template>
    </v-card>
  </div>
</template>
