<script setup lang="ts">
// PHASE BBBA (BBBA-1f): READ-ONLY identity duplicate-candidate review. Merging is a deferred
// manual action (R-294) — this page only surfaces likely same-person accounts for inspection.
// PHASE BBBD (Track 10f): gating via the 'permission' route middleware; no ad-hoc page guard.
definePageMeta({ middleware: ['auth', 'permission'] })

const api = useApi()
const toast = useToast()

interface Candidate {
  reason: string
  user_a: Record<string, any>
  user_b: Record<string, any>
}

const rows = ref<Candidate[]>([])
const loading = ref(false)

const reasonLabel: Record<string, string> = {
  SHARED_EMAIL: 'Same email',
  USERNAME_EQUALS_EMAIL: 'Username matches the other account’s email',
  SHARED_EMAIL_LOCALPART: 'Email name part matches the other username',
}

function fullName(u: Record<string, any>): string {
  return `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || u.username || '—'
}

async function load() {
  loading.value = true
  try {
    rows.value = await api.get<Candidate[]>('/api/users/duplicate-candidates')
  } catch (e: any) {
    toast.error(e?.data?.message || 'Failed to load duplicate candidates.')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <v-container fluid class="pa-4">
    <div class="d-flex align-center ga-2 mb-4">
      <v-icon color="primary">mdi-account-multiple-check-outline</v-icon>
      <h1 class="text-h6 font-weight-bold mb-0">Identity Review</h1>
      <v-spacer />
      <v-btn variant="text" prepend-icon="mdi-refresh" :loading="loading" @click="load">Refresh</v-btn>
    </div>

    <v-alert type="info" variant="tonal" density="compact" class="mb-4">
      Read-only report of accounts that may belong to the same person (e.g. a legacy username account
      and a CSU-email account). Merging is a manual, reviewed action and is intentionally
      <strong>not</strong> performed here. Login already accepts either email or username.
    </v-alert>

    <v-card elevation="1" rounded="lg">
      <v-table>
        <thead>
          <tr>
            <th>Reason</th>
            <th>Account A</th>
            <th>Account B</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!loading && rows.length === 0">
            <td colspan="3" class="text-center text-medium-emphasis py-6">
              No duplicate candidates found.
            </td>
          </tr>
          <tr v-for="(r, i) in rows" :key="i">
            <td>
              <v-chip size="small" variant="tonal" color="warning">
                {{ reasonLabel[r.reason] || r.reason }}
              </v-chip>
            </td>
            <td>
              <div class="font-weight-medium">{{ fullName(r.user_a) }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ r.user_a.email }} · @{{ r.user_a.username }}
                <span v-if="!r.user_a.is_active"> · inactive</span>
              </div>
            </td>
            <td>
              <div class="font-weight-medium">{{ fullName(r.user_b) }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ r.user_b.email }} · @{{ r.user_b.username }}
                <span v-if="!r.user_b.is_active"> · inactive</span>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>
