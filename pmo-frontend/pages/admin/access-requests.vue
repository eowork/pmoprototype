<script setup lang="ts">
// PHASE BBBA (BBBA-3e) + BBBF (Track 4): admin Access Requests queue with bulk actions, search & filters.
import {
  ACCESS_LEVEL_OPTIONS,
  labelForAccessModule,
  type AccessRequest,
} from '~/utils/accessControl'

definePageMeta({ middleware: ['auth', 'permission'] })

const api = useApi()
const toast = useToast()

const rows = ref<AccessRequest[]>([])
const loading = ref(false)
const selected = ref<string[]>([])

// Filters
const statusFilter = ref('PENDING')
const search = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const STATUS_OPTIONS = [
  { title: 'Pending', value: 'PENDING' },
  { title: 'Approved', value: 'APPROVED' },
  { title: 'Denied', value: 'DENIED' },
  { title: 'Revoked', value: 'REVOKED' },
  { title: 'Cancelled', value: 'CANCELLED' },
  { title: 'Expired', value: 'EXPIRED' },
  { title: 'Archived', value: 'ARCHIVED' },
  { title: 'All', value: 'ALL' },
]

// Per-row decision dialog
const dialog = ref(false)
const mode = ref<'APPROVE' | 'DENY'>('APPROVE')
const active = ref<AccessRequest | null>(null)
const grantedLevel = ref('')
const note = ref('')
const saving = ref(false)
const levelOptions = ACCESS_LEVEL_OPTIONS

const headers = [
  { title: 'User', key: 'user', sortable: false },
  { title: 'Module', key: 'requested_module' },
  { title: 'Requested', key: 'requested_level' },
  { title: 'Status', key: 'status' },
  { title: 'Requested', key: 'requested_at' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const },
]

function fullName(r: AccessRequest): string {
  if (!r.user) return '—'
  return `${r.user.first_name || ''} ${r.user.last_name || ''}`.trim() || r.user.email || '—'
}
function statusColor(s: string): string {
  const map: Record<string, string> = {
    APPROVED: 'success',
    DENIED: 'error',
    REVOKED: 'deep-orange',
    CANCELLED: 'blue-grey',
    EXPIRED: 'grey-darken-1',
    ARCHIVED: 'grey',
    PENDING: 'warning',
  }
  return map[s] || 'warning'
}

async function load() {
  loading.value = true
  selected.value = []
  try {
    const params = new URLSearchParams()
    params.set('status', statusFilter.value)
    if (search.value) params.set('q', search.value)
    if (dateFrom.value) params.set('from', dateFrom.value)
    if (dateTo.value) params.set('to', dateTo.value)
    rows.value = await api.get<AccessRequest[]>(`/api/access-requests?${params.toString()}`)
  } catch (e: any) {
    toast.error(e?.data?.message || 'Failed to load access requests.')
  } finally {
    loading.value = false
  }
}

// Per-row
function openApprove(r: AccessRequest) {
  active.value = r; mode.value = 'APPROVE'; grantedLevel.value = r.requested_level; note.value = ''; dialog.value = true
}
function openDeny(r: AccessRequest) {
  active.value = r; mode.value = 'DENY'; note.value = ''; dialog.value = true
}
async function confirm() {
  if (!active.value) return
  saving.value = true
  try {
    const payload: Record<string, unknown> = { decision: mode.value, decision_note: note.value || undefined }
    if (mode.value === 'APPROVE') payload.granted_level = grantedLevel.value
    await api.patch(`/api/access-requests/${active.value.id}/decide`, payload)
    toast.success(mode.value === 'APPROVE' ? 'Access granted.' : 'Request denied.')
    dialog.value = false
    await load()
  } catch (e: any) {
    toast.error(e?.data?.message || 'Could not record the decision.')
  } finally {
    saving.value = false
  }
}

// PHASE BBBG (Track 2): lifecycle actions — revoke (confirm; removes access), reopen, expire.
const revokeDialog = ref(false)
const revokeTarget = ref<AccessRequest | null>(null)
const revokeNote = ref('')
const lifecycleBusy = ref(false)

function openRevoke(r: AccessRequest) {
  revokeTarget.value = r; revokeNote.value = ''; revokeDialog.value = true
}
async function doRevoke() {
  if (!revokeTarget.value) return
  lifecycleBusy.value = true
  try {
    await api.patch(`/api/access-requests/${revokeTarget.value.id}/revoke`, {
      decision_note: revokeNote.value || undefined,
    })
    toast.success('Access revoked.')
    revokeDialog.value = false
    await load()
  } catch (e: any) {
    toast.error(e?.data?.message || 'Could not revoke access.')
  } finally {
    lifecycleBusy.value = false
  }
}
async function reopen(r: AccessRequest) {
  lifecycleBusy.value = true
  try {
    await api.patch(`/api/access-requests/${r.id}/reopen`, {})
    toast.success('Request reopened (pending).')
    await load()
  } catch (e: any) {
    toast.error(e?.data?.message || 'Could not reopen the request.')
  } finally {
    lifecycleBusy.value = false
  }
}
async function expire(r: AccessRequest) {
  lifecycleBusy.value = true
  try {
    await api.patch(`/api/access-requests/${r.id}/expire`, {})
    toast.success('Request marked expired.')
    await load()
  } catch (e: any) {
    toast.error(e?.data?.message || 'Could not expire the request.')
  } finally {
    lifecycleBusy.value = false
  }
}

// Bulk
const acting = ref(false)
async function bulkDecide(decision: 'APPROVE' | 'DENY') {
  if (!selected.value.length) return
  acting.value = true
  try {
    const res = await api.patch<{ approved: number; denied: number; skipped: number }>(
      '/api/access-requests/bulk-decide', { ids: selected.value, decision })
    toast.success(`${decision === 'APPROVE' ? 'Approved' : 'Denied'}: ${res.approved + res.denied}, skipped: ${res.skipped}`)
    await load()
  } catch (e: any) {
    toast.error(e?.data?.message || 'Bulk action failed.')
  } finally {
    acting.value = false
  }
}
async function bulkArchive() {
  if (!selected.value.length) return
  acting.value = true
  try {
    const res = await api.patch<{ archived: number }>('/api/access-requests/bulk-archive', { ids: selected.value })
    toast.success(`Archived ${res.archived} request(s).`)
    await load()
  } catch (e: any) {
    toast.error(e?.data?.message || 'Archive failed.')
  } finally {
    acting.value = false
  }
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(search, () => { if (searchTimer) clearTimeout(searchTimer); searchTimer = setTimeout(load, 350) })
watch([statusFilter, dateFrom, dateTo], load)

onMounted(load)
</script>

<template>
  <v-container fluid class="pa-4">
    <div class="d-flex align-center ga-2 mb-4">
      <v-icon color="primary">mdi-account-key-outline</v-icon>
      <h1 class="text-h6 font-weight-bold mb-0">Access Requests</h1>
      <v-spacer />
      <v-btn variant="text" prepend-icon="mdi-refresh" :loading="loading" @click="load">Refresh</v-btn>
    </div>

    <!-- Sticky filter bar -->
    <v-card elevation="1" rounded="lg" class="mb-3 pa-3" style="position: sticky; top: 8px; z-index: 2">
      <v-row dense align="center">
        <v-col cols="12" sm="4" md="3">
          <v-text-field v-model="search" label="Search user / module / status" density="compact"
                        variant="outlined" hide-details prepend-inner-icon="mdi-magnify" clearable />
        </v-col>
        <v-col cols="6" sm="3" md="2">
          <v-select v-model="statusFilter" :items="STATUS_OPTIONS" item-title="title" item-value="value"
                    label="Status" density="compact" variant="outlined" hide-details />
        </v-col>
        <v-col cols="6" sm="3" md="2">
          <v-text-field v-model="dateFrom" type="date" label="From" density="compact" variant="outlined" hide-details />
        </v-col>
        <v-col cols="6" sm="3" md="2">
          <v-text-field v-model="dateTo" type="date" label="To" density="compact" variant="outlined" hide-details />
        </v-col>
      </v-row>
    </v-card>

    <!-- Bulk action toolbar -->
    <v-expand-transition>
      <v-card v-if="selected.length" elevation="1" rounded="lg" class="mb-3 pa-2 d-flex align-center ga-2"
              color="primary" variant="tonal">
        <span class="text-body-2 font-weight-medium ms-2">{{ selected.length }} selected</span>
        <v-spacer />
        <v-btn size="small" color="success" variant="flat" :loading="acting" @click="bulkDecide('APPROVE')">Approve</v-btn>
        <v-btn size="small" color="error" variant="flat" :loading="acting" @click="bulkDecide('DENY')">Deny</v-btn>
        <v-btn size="small" color="grey" variant="flat" :loading="acting" @click="bulkArchive">Archive</v-btn>
      </v-card>
    </v-expand-transition>

    <v-card elevation="1" rounded="lg">
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="rows"
        :loading="loading"
        item-value="id"
        show-select
        density="comfortable"
        no-data-text="No access requests match the current filters."
      >
        <template #item.user="{ item }">
          <div class="font-weight-medium">{{ fullName(item) }}</div>
          <div class="text-caption text-medium-emphasis">{{ item.user?.email }}</div>
        </template>
        <template #item.requested_module="{ item }">{{ labelForAccessModule(item.requested_module) }}</template>
        <template #item.requested_level="{ item }">
          <v-chip size="small" variant="tonal" color="primary">{{ item.requested_level }}</v-chip>
        </template>
        <template #item.status="{ item }">
          <v-chip size="small" variant="tonal" :color="statusColor(item.status)">{{ item.status }}</v-chip>
        </template>
        <template #item.requested_at="{ item }">
          <span class="text-caption text-medium-emphasis">{{ new Date(item.requested_at).toLocaleDateString() }}</span>
        </template>
        <template #item.actions="{ item }">
          <template v-if="item.status === 'PENDING'">
            <v-btn size="small" color="success" variant="text" @click="openApprove(item)">Approve</v-btn>
            <v-btn size="small" color="error" variant="text" @click="openDeny(item)">Deny</v-btn>
            <v-btn size="small" color="grey-darken-1" variant="text" :loading="lifecycleBusy"
                   @click="expire(item)">Expire</v-btn>
          </template>
          <template v-else-if="item.status === 'APPROVED'">
            <v-btn size="small" color="deep-orange" variant="text" :loading="lifecycleBusy"
                   @click="openRevoke(item)">Revoke</v-btn>
          </template>
          <template v-else-if="['DENIED', 'REVOKED', 'EXPIRED'].includes(item.status)">
            <v-btn size="small" color="primary" variant="text" :loading="lifecycleBusy"
                   @click="reopen(item)">Reopen</v-btn>
          </template>
          <span v-else class="text-caption text-medium-emphasis">—</span>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="480">
      <v-card>
        <v-card-title class="text-subtitle-1 font-weight-bold">
          {{ mode === 'APPROVE' ? 'Approve access' : 'Deny request' }}
        </v-card-title>
        <v-card-text>
          <p class="text-body-2 mb-3">
            {{ active ? labelForAccessModule(active.requested_module) : '' }} ·
            requested <strong>{{ active?.requested_level }}</strong>
          </p>
          <v-select v-if="mode === 'APPROVE'" v-model="grantedLevel" label="Granted level"
                    :items="levelOptions" item-title="title" item-value="value" variant="outlined"
                    density="compact" hint="You may grant a lower level than requested." persistent-hint />
          <v-textarea v-model="note" :label="mode === 'APPROVE' ? 'Note (optional)' : 'Reason (optional)'"
                      variant="outlined" density="compact" rows="2" class="mt-3" counter="1000" maxlength="1000" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn :color="mode === 'APPROVE' ? 'success' : 'error'" variant="flat" :loading="saving" @click="confirm">
            {{ mode === 'APPROVE' ? 'Approve' : 'Deny' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- PHASE BBBG (Track 2): revoke confirmation — revoking removes the user's live module access. -->
    <v-dialog v-model="revokeDialog" max-width="480">
      <v-card>
        <v-card-title class="text-subtitle-1 font-weight-bold">Revoke access</v-card-title>
        <v-card-text>
          <v-alert type="warning" variant="tonal" density="compact" class="mb-3">
            This removes <strong>{{ revokeTarget ? labelForAccessModule(revokeTarget.requested_module) : '' }}</strong>
            access for <strong>{{ revokeTarget ? fullName(revokeTarget) : '' }}</strong> immediately.
            The request is kept as REVOKED for audit.
          </v-alert>
          <v-textarea v-model="revokeNote" label="Reason (optional)" variant="outlined"
                      density="compact" rows="2" counter="1000" maxlength="1000" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="revokeDialog = false">Cancel</v-btn>
          <v-btn color="deep-orange" variant="flat" :loading="lifecycleBusy" @click="doRevoke">Revoke</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
