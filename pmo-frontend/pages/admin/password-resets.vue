<script setup lang="ts">
// PHASE BBBB (BBBB-5c): password-reset requests relocated here (Access Review), out of User
// Management. Accepting resets the user's password to the default key and closes the request.
// PHASE BBBD (Track 10f): gating via the 'permission' route middleware; no ad-hoc page guard.
definePageMeta({ middleware: ['auth', 'permission'] })

const api = useApi()
const toast = useToast()

interface ResetRequest {
  id: string
  identifier: string
  status: string
  notes?: string | null
  requested_at: string
  completed_at?: string | null
  completed_by?: string | null
}

const rows = ref<ResetRequest[]>([])
const loading = ref(false)
const acting = ref<string | null>(null)

// PHASE BBBG (Track 3): status filter so completed resets remain auditable (history).
const statusFilter = ref('PENDING')
const STATUS_OPTIONS = [
  { title: 'Pending', value: 'PENDING' },
  { title: 'Completed', value: 'COMPLETED' },
  { title: 'Denied', value: 'DENIED' },
  { title: 'All', value: 'ALL' },
]
function statusColor(s: string): string {
  if (s === 'COMPLETED') return 'success'
  if (s === 'PENDING') return 'warning'
  if (s === 'DENIED') return 'error'
  return 'grey'
}

async function load() {
  loading.value = true
  try {
    const params = new URLSearchParams({ status: statusFilter.value })
    rows.value = await api.get<ResetRequest[]>(
      `/api/users/password-reset-requests?${params.toString()}`,
    )
  } catch (e: any) {
    toast.error(e?.data?.message || e?.message || 'Failed to load reset requests.')
  } finally {
    loading.value = false
  }
}

watch(statusFilter, load)

async function accept(r: ResetRequest) {
  acting.value = r.id
  try {
    const res = await api.patch<{ message: string; default_password: string | null; reset: boolean }>(
      `/api/users/password-reset-requests/${r.id}/complete`,
      {},
    )
    if (res.reset && res.default_password) {
      toast.success(`Password reset to "${res.default_password}". Share it with the user.`)
    } else {
      toast.warning(res.message || 'Request closed; no password changed.')
    }
    rows.value = rows.value.filter(x => x.id !== r.id)
  } catch (e: any) {
    toast.error(e?.data?.message || e?.message || 'Failed to complete reset request.')
  } finally {
    acting.value = null
  }
}

// PHASE BBCH (Track 5): deny a pending reset request without changing any password.
async function deny(r: ResetRequest) {
  acting.value = r.id
  try {
    await api.patch(`/api/users/password-reset-requests/${r.id}/deny`, {})
    toast.success('Reset request denied.')
    rows.value = rows.value.filter(x => x.id !== r.id)
  } catch (e: any) {
    toast.error(e?.data?.message || e?.message || 'Failed to deny reset request.')
  } finally {
    acting.value = null
  }
}

onMounted(load)
</script>

<template>
  <v-container fluid class="pa-4">
    <div class="d-flex align-center ga-2 mb-4">
      <v-icon color="primary">mdi-lock-reset</v-icon>
      <h1 class="text-h6 font-weight-bold mb-0">Password Resets</h1>
      <v-spacer />
      <v-select v-model="statusFilter" :items="STATUS_OPTIONS" item-title="title" item-value="value"
                label="Status" density="compact" variant="outlined" hide-details
                style="max-width: 180px" />
      <v-btn variant="text" prepend-icon="mdi-refresh" :loading="loading" @click="load">Refresh</v-btn>
    </div>

    <v-alert type="info" variant="tonal" density="compact" class="mb-4">
      Accepting a request resets the user's password to the default key <strong>112233</strong> and
      closes the request. Relay the key to the user and ask them to change it after signing in.
    </v-alert>

    <v-card elevation="1" rounded="lg">
      <v-table>
        <thead>
          <tr>
            <th>Account (email / username)</th>
            <th>Status</th>
            <th>Notes</th>
            <th>Requested</th>
            <th class="text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!loading && rows.length === 0">
            <td colspan="5" class="text-center text-medium-emphasis py-6">No reset requests match this filter.</td>
          </tr>
          <tr v-for="r in rows" :key="r.id">
            <td class="font-weight-medium">{{ r.identifier }}</td>
            <td>
              <v-chip size="small" variant="tonal" :color="statusColor(r.status)">{{ r.status }}</v-chip>
            </td>
            <td class="text-caption" style="max-width: 280px">{{ r.notes || '—' }}</td>
            <td class="text-caption text-medium-emphasis">{{ new Date(r.requested_at).toLocaleDateString() }}</td>
            <td class="text-right">
              <template v-if="r.status === 'PENDING'">
                <v-btn
                  size="small"
                  color="primary"
                  variant="flat"
                  class="mr-2"
                  :loading="acting === r.id"
                  @click="accept(r)"
                >
                  Accept &amp; reset
                </v-btn>
                <v-btn
                  size="small"
                  color="error"
                  variant="outlined"
                  :disabled="acting === r.id"
                  @click="deny(r)"
                >
                  Deny
                </v-btn>
              </template>
              <span v-else class="text-caption text-medium-emphasis">
                {{ r.completed_at ? new Date(r.completed_at).toLocaleDateString() : '—' }}
              </span>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>
