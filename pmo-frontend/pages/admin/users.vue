<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

const api = useApi()
const router = useRouter()
const toast = useToast()
const { isAdmin, isSuperAdmin } = usePermissions()

interface UserRow {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string | null
  avatar_url?: string | null
  is_active: boolean
  last_login_at?: string | null
  rank_level?: number | null
  campus?: string | null
  status?: string | null
  created_at: string
  metadata?: Record<string, any> | null
  project_assignment_count?: number
  roles: Array<{ id: string; name: string; is_superadmin: boolean }>
}

interface PaginatedResponse {
  data: UserRow[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

const users = ref<UserRow[]>([])
const loading = ref(false)
const total = ref(0)
const totalPages = ref(1)

const filters = reactive({
  search: '',
  user_type: '',
  role: '',
  campus: '',
  is_active: '',
  page: 1,
  limit: 20,
})

const USER_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'CSU_PERSONNEL', label: 'CSU Personnel' },
  { value: 'CONTRACTOR', label: 'Contractor' },
  { value: 'CONSULTANT', label: 'Consultant' },
  { value: 'EXTERNAL_PARTNER', label: 'External Partner' },
  { value: 'SUPPLIER', label: 'Supplier' },
]

const ROLE_OPTIONS = ['', 'SuperAdmin', 'Admin', 'Staff', 'Contractor', 'Viewer']
const CAMPUS_OPTIONS = ['', 'Butuan Campus', 'Cabadbaran']

let searchTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  if (!isAdmin.value) {
    toast.error('Access denied. Admin role required.')
    router.push('/dashboard')
    return
  }
  loadUsers()
})

async function loadUsers() {
  loading.value = true
  try {
    const params: Record<string, any> = {
      page: filters.page,
      limit: filters.limit,
    }
    if (filters.search) params.search = filters.search
    if (filters.user_type) params.user_type = filters.user_type
    if (filters.role) params.role = filters.role
    if (filters.campus) params.campus = filters.campus
    if (filters.is_active !== '') params.is_active = filters.is_active === 'true'

    const query = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString()
    const res = await api.get<PaginatedResponse>(`/api/users?${query}`)
    users.value = res.data ?? []
    total.value = res.meta?.total ?? 0
    totalPages.value = res.meta?.totalPages ?? 1
  } catch (err: any) {
    toast.error(err?.message || 'Failed to load users')
  } finally {
    loading.value = false
  }
}

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { filters.page = 1; loadUsers() }, 350)
}

function onFilterChange() {
  filters.page = 1
  loadUsers()
}

function onPageChange(page: number) {
  filters.page = page
  loadUsers()
}

function getUserType(row: UserRow): string {
  return row.metadata?.userType || 'CSU_PERSONNEL'
}

function userTypeBadgeColor(type: string): string {
  const m: Record<string, string> = {
    CSU_PERSONNEL: 'primary',
    CONTRACTOR: 'warning',
    CONSULTANT: 'deep-purple',
    EXTERNAL_PARTNER: 'teal',
    SUPPLIER: 'cyan',
  }
  return m[type] || 'grey'
}

function userTypeBadgeLabel(type: string): string {
  const m: Record<string, string> = {
    CSU_PERSONNEL: 'CSU Personnel',
    CONTRACTOR: 'Contractor',
    CONSULTANT: 'Consultant',
    EXTERNAL_PARTNER: 'External Partner',
    SUPPLIER: 'Supplier',
  }
  return m[type] || type
}

function roleColor(name: string): string {
  const m: Record<string, string> = { SuperAdmin: 'error', Admin: 'warning', Staff: 'primary', Contractor: 'orange', Viewer: 'grey' }
  return m[name] || 'grey'
}

function formatDate(d?: string | null): string {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) }
  catch { return '—' }
}

function fullName(row: UserRow): string {
  return [row.first_name, row.last_name].filter(Boolean).join(' ') || row.email
}

function initials(row: UserRow): string {
  const f = row.first_name?.charAt(0) || ''
  const l = row.last_name?.charAt(0) || ''
  return (f + l).toUpperCase() || row.email.charAt(0).toUpperCase()
}

async function toggleActive(row: UserRow) {
  try {
    await api.patch(`/api/users/${row.id}`, { is_active: !row.is_active })
    row.is_active = !row.is_active
    toast.success(`User ${row.is_active ? 'activated' : 'deactivated'}`)
  } catch (err: any) {
    toast.error(err?.message || 'Failed to update user')
  }
}
</script>

<template>
  <v-container fluid class="pa-4">
    <!-- Header -->
    <div class="d-flex align-center ga-3 mb-4">
      <v-icon color="primary" size="24">mdi-account-group-outline</v-icon>
      <div>
        <div class="text-h6 font-weight-bold">User Management</div>
        <div class="text-caption text-grey-darken-1">All institutional users, contractors, and external collaborators</div>
      </div>
      <v-spacer />
      <v-chip size="small" variant="tonal" color="primary">{{ total }} users</v-chip>
    </div>

    <!-- Filter bar -->
    <v-card variant="outlined" rounded="lg" class="mb-4 pa-3">
      <v-row dense>
        <v-col cols="12" sm="4" md="3">
          <v-text-field
            v-model="filters.search"
            placeholder="Search name or email…"
            density="compact"
            variant="outlined"
            hide-details
            prepend-inner-icon="mdi-magnify"
            clearable
            @update:model-value="onSearchInput"
          />
        </v-col>
        <v-col cols="6" sm="3" md="2">
          <v-select
            v-model="filters.user_type"
            :items="USER_TYPE_OPTIONS"
            item-title="label"
            item-value="value"
            label="User Type"
            density="compact"
            variant="outlined"
            hide-details
            @update:model-value="onFilterChange"
          />
        </v-col>
        <v-col cols="6" sm="3" md="2">
          <v-select
            v-model="filters.role"
            :items="ROLE_OPTIONS"
            label="Role"
            density="compact"
            variant="outlined"
            hide-details
            @update:model-value="onFilterChange"
          />
        </v-col>
        <v-col cols="6" sm="3" md="2">
          <v-select
            v-model="filters.campus"
            :items="CAMPUS_OPTIONS"
            label="Campus"
            density="compact"
            variant="outlined"
            hide-details
            @update:model-value="onFilterChange"
          />
        </v-col>
        <v-col cols="6" sm="3" md="2">
          <v-select
            v-model="filters.is_active"
            :items="[{ value: '', title: 'All Status' }, { value: 'true', title: 'Active' }, { value: 'false', title: 'Inactive' }]"
            item-title="title"
            item-value="value"
            label="Status"
            density="compact"
            variant="outlined"
            hide-details
            @update:model-value="onFilterChange"
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- Table -->
    <v-card variant="outlined" rounded="lg">
      <div v-if="loading" class="d-flex justify-center py-8">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <div v-else-if="users.length === 0" class="pa-8 text-center">
        <v-icon size="48" color="grey-lighten-1">mdi-account-search-outline</v-icon>
        <div class="text-body-2 text-grey mt-3">No users found matching the current filters.</div>
      </div>

      <v-table v-else density="compact">
        <thead>
          <tr>
            <th class="text-left" style="width:220px">User</th>
            <th class="text-left" style="width:140px">Type</th>
            <th class="text-left" style="width:180px">Roles</th>
            <th class="text-left" style="width:130px">Campus</th>
            <th class="text-left" style="width:80px">Status</th>
            <th class="text-left" style="width:80px">Projects</th>
            <th class="text-left" style="width:110px">Joined</th>
            <th class="text-left" style="width:90px">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in users" :key="row.id">
            <!-- User -->
            <td>
              <div class="d-flex align-center ga-2 py-1">
                <v-avatar size="30" :color="userTypeBadgeColor(getUserType(row))" variant="tonal">
                  <span class="text-caption font-weight-bold" style="font-size:0.65rem">{{ initials(row) }}</span>
                </v-avatar>
                <div class="min-width-0">
                  <div class="text-body-2 font-weight-medium text-truncate" style="max-width:160px">{{ fullName(row) }}</div>
                  <div class="text-caption text-grey-darken-1 text-truncate" style="max-width:160px">{{ row.email }}</div>
                </div>
              </div>
            </td>
            <!-- Type -->
            <td>
              <v-chip
                size="x-small"
                :color="userTypeBadgeColor(getUserType(row))"
                variant="tonal"
              >
                {{ userTypeBadgeLabel(getUserType(row)) }}
              </v-chip>
            </td>
            <!-- Roles -->
            <td>
              <div class="d-flex flex-wrap ga-1">
                <v-chip
                  v-for="r in row.roles"
                  :key="r.id"
                  size="x-small"
                  :color="roleColor(r.name)"
                  variant="tonal"
                >
                  {{ r.name }}
                  <v-icon v-if="r.is_superadmin" size="10" class="ml-1">mdi-star</v-icon>
                </v-chip>
                <span v-if="row.roles.length === 0" class="text-caption text-grey">No role</span>
              </div>
            </td>
            <!-- Campus -->
            <td class="text-caption text-grey-darken-1">{{ row.campus || '—' }}</td>
            <!-- Status -->
            <td>
              <v-chip
                size="x-small"
                :color="row.is_active ? 'success' : 'grey'"
                variant="tonal"
              >
                {{ row.is_active ? 'Active' : 'Inactive' }}
              </v-chip>
              <v-chip
                v-if="row.status === 'PENDING'"
                size="x-small"
                color="warning"
                variant="tonal"
                class="ml-1"
              >
                Pending
              </v-chip>
            </td>
            <!-- Projects (contractors) -->
            <td class="text-caption text-center">
              <v-chip
                v-if="(row.project_assignment_count ?? 0) > 0"
                size="x-small"
                color="warning"
                variant="tonal"
              >
                {{ row.project_assignment_count }}
              </v-chip>
              <span v-else class="text-grey">—</span>
            </td>
            <!-- Joined -->
            <td class="text-caption text-grey-darken-1">{{ formatDate(row.created_at) }}</td>
            <!-- Actions -->
            <td>
              <div class="d-flex ga-1">
                <v-btn
                  v-if="isSuperAdmin || isAdmin"
                  size="x-small"
                  variant="text"
                  :color="row.is_active ? 'error' : 'success'"
                  :icon="row.is_active ? 'mdi-account-off-outline' : 'mdi-account-check-outline'"
                  :title="row.is_active ? 'Deactivate' : 'Activate'"
                  @click="toggleActive(row)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="d-flex justify-center py-3">
        <v-pagination
          :model-value="filters.page"
          :length="totalPages"
          density="compact"
          size="small"
          @update:model-value="onPageChange"
        />
      </div>
    </v-card>
  </v-container>
</template>
