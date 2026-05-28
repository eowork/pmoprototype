<script setup lang="ts">
// AAA-I-2: Audit log rendered as a filterable, paginated data table.
interface Props {
  projectId: string
  initialLimit?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialLimit: 200,
})

const api = useApi()

interface AuditEntry {
  id: string
  userEmail: string
  userName: string
  action: string
  entityType: string
  entityId: string
  metadata?: Record<string, unknown>
  createdAt: string
}

const entries = ref<AuditEntry[]>([])
const total = ref(0)
const loading = ref(false)
const filterAction = ref<string | null>(null)

const ACTION_LABELS: Record<string, string> = {
  UPLOAD: 'Uploaded',
  REMOVE_ATTACHMENT: 'Deleted',
  UPDATE: 'Updated',
  CREATE: 'Created',
  DELETE: 'Deleted',
  SUBMIT: 'Submitted',
  PUBLISH: 'Published',
  REJECT: 'Rejected',
  WITHDRAW: 'Withdrew',
  DOWNLOAD: 'Downloaded',
  BATCH_UPLOAD: 'Batch uploaded',
  REMARKS_UPDATE: 'Updated remarks',
  TEMPLATE_UPLOAD: 'Uploaded template',
}

const ACTION_COLORS: Record<string, string> = {
  UPLOAD: 'success',
  BATCH_UPLOAD: 'success',
  TEMPLATE_UPLOAD: 'indigo',
  REMOVE_ATTACHMENT: 'error',
  DELETE: 'error',
  UPDATE: 'primary',
  REMARKS_UPDATE: 'deep-purple',
  CREATE: 'teal',
  SUBMIT: 'blue',
  PUBLISH: 'green',
  REJECT: 'red',
  WITHDRAW: 'orange',
  DOWNLOAD: 'grey',
}
function actionColor(action: string): string {
  return ACTION_COLORS[action] ?? 'grey'
}

const auditHeaders = [
  { title: 'User', key: 'userName', width: 180 },
  { title: 'Action', key: 'action', width: 130 },
  { title: 'File', key: 'metadata', width: 220 },
  { title: 'Section', key: 'metadata.section', width: 140 },
  { title: 'Date', key: 'createdAt', width: 170 },
]

const actionFilterItems = computed(() => {
  const present = Array.from(new Set(entries.value.map((e) => e.action)))
  return present.map((a) => ({ title: ACTION_LABELS[a] ?? a, value: a }))
})

const filteredEntries = computed(() =>
  filterAction.value ? entries.value.filter((e) => e.action === filterAction.value) : entries.value,
)

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

async function fetchLogs() {
  if (!props.projectId) return
  loading.value = true
  try {
    const res = await api.get<{ data: AuditEntry[]; total: number }>(
      `/api/activity-logs/CONSTRUCTION_PROJECT/${props.projectId}?pageSize=${props.initialLimit}`,
    )
    entries.value = Array.isArray(res) ? res : (res?.data ?? [])
    total.value = (res as any)?.total ?? entries.value.length
  } catch (err) {
    console.error('[CiAuditLogPanel] fetch failed:', err)
  } finally {
    loading.value = false
  }
}

watch(() => props.projectId, (id) => { if (id) fetchLogs() })
onMounted(() => { if (props.projectId) fetchLogs() })
defineExpose({ fetchLogs })
</script>

<template>
  <v-card variant="outlined">
    <v-card-title class="d-flex align-center ga-2 text-body-1">
      <v-icon icon="mdi-history" size="small" color="grey" />
      <span>Attachment Audit Log</span>
      <v-chip v-if="total" size="x-small" variant="tonal" color="grey" class="ml-1">{{ total }} events</v-chip>
      <v-spacer />
      <v-select
        v-model="filterAction"
        :items="actionFilterItems"
        label="Action"
        variant="outlined" density="compact" hide-details clearable
        style="max-width:200px"
      />
    </v-card-title>
    <v-divider />
    <v-card-text class="pa-0">
      <v-data-table
        :headers="auditHeaders"
        :items="filteredEntries"
        :loading="loading"
        density="compact"
        class="elevation-0"
        :items-per-page="10"
      >
        <template #item.action="{ item }">
          <v-chip :color="actionColor(item.action)" size="x-small" variant="tonal">
            {{ ACTION_LABELS[item.action] ?? item.action }}
          </v-chip>
        </template>
        <template #item.metadata="{ item }">
          <span v-if="item.metadata?.fileName" class="text-caption">{{ item.metadata.fileName }}</span>
          <span v-else class="text-caption text-grey">—</span>
        </template>
        <template #[`item.metadata.section`]="{ item }">
          <v-chip v-if="item.metadata?.section" size="x-small" variant="tonal" color="grey">
            {{ String(item.metadata.section).replace(/_/g, ' ') }}
          </v-chip>
          <span v-else class="text-caption text-grey">—</span>
        </template>
        <template #item.createdAt="{ item }">
          <span class="text-caption">{{ formatDate(item.createdAt) }}</span>
        </template>
        <template #no-data>
          <div class="text-caption text-grey py-4 text-center">No audit events recorded yet.</div>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>
