<script setup lang="ts">
import { adaptUsersList, type UIUserList, type BackendUserList } from '~/utils/adapters'

definePageMeta({
  middleware: ['auth', 'permission'],
})

const router = useRouter()
const api = useApi()
const toast = useToast()
const { canAdd, canEdit, canDelete } = usePermissions()

const users = ref<UIUserList[]>([])
const search = ref('')
const loading = ref(true)
const deleting = ref(false)
const deleteDialog = ref(false)
const userToDelete = ref<UIUserList | null>(null)

// Phase HV: Bulk selection (Directives 223–225)
const selectedUsers = ref<string[]>([])
const bulkProcessing = ref(false)
const bulkMenuOpen = ref(false)

// Password reset requests (Phase HQ)
const pendingResetRequests = ref<any[]>([])
const resetRequestsLoading = ref(false)
const showResetPanel = ref(true)

// Filter state
const statusFilter = ref<boolean | null>(null)
const roleFilter = ref<string>('')
const campusFilter = ref<string>('')

const campusFilterOptions = [
  { title: 'All Campuses', value: '' },
  { title: 'Butuan Campus', value: 'Butuan Campus' },
  { title: 'Cabadbaran', value: 'Cabadbaran' },
  { title: 'No Campus Assigned', value: '__none__' },
]

// Rank labels mapping
const RANK_LABELS: Record<number, { label: string; color: string }> = {
  10: { label: 'SuperAdmin', color: 'deep-purple' },
  15: { label: 'Vice President', color: 'purple' },
  20: { label: 'Division Chief', color: 'indigo' },
  30: { label: 'Director', color: 'blue' },
  40: { label: 'Dean', color: 'cyan' },
  50: { label: 'Chairperson', color: 'teal' },
  60: { label: 'Admin Personnel', color: 'green' },
  70: { label: 'Faculty', color: 'light-green' },
  80: { label: 'Clerk/Staff', color: 'amber' },
  90: { label: 'Student', color: 'orange' },
  100: { label: 'Viewer', color: 'grey' },
}

function getRankLabel(rankLevel: number): string {
  return RANK_LABELS[rankLevel]?.label || 'Unknown'
}

function getRankColor(rankLevel: number): string {
  return RANK_LABELS[rankLevel]?.color || 'grey'
}

// Table headers
const headers = [
  { title: 'Name', key: 'fullName', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Rank', key: 'rankLevel', sortable: true },
  { title: 'Roles', key: 'roles', sortable: false },
  { title: 'Status', key: 'isActive', sortable: true },
  { title: 'Last Login', key: 'lastLoginAt', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const },
]

// Navigation
function viewUser(user: UIUserList) {
  router.push(`/users/detail-${user.id}`)
}

function editUser(user: UIUserList) {
  router.push(`/users/edit-${user.id}`)
}

function manageAccess(user: UIUserList) {
  router.push(`/users/access-${user.id}`)
}

function createUser() {
  router.push('/users/new')
}

// Delete confirmation
function confirmDelete(user: UIUserList) {
  userToDelete.value = user
  deleteDialog.value = true
}

async function deleteUser() {
  if (!userToDelete.value) return
  deleting.value = true
  try {
    await api.del(`/api/users/${userToDelete.value.id}`)
    const deletedName = userToDelete.value.fullName
    users.value = users.value.filter(u => u.id !== userToDelete.value!.id)
    toast.success(`User "${deletedName}" deleted successfully`)
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || 'Failed to delete user')
    console.error('Failed to delete user:', err)
  } finally {
    deleting.value = false
    deleteDialog.value = false
    userToDelete.value = null
  }
}

// Status color mapping
function getStatusColor(isActive: boolean): string {
  return isActive ? 'success' : 'error'
}

function getStatusText(isActive: boolean): string {
  return isActive ? 'Active' : 'Inactive'
}

// Format date
function formatDate(dateStr: string): string {
  if (!dateStr) return 'Never'
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Filtered users
const filteredUsers = computed(() => {
  let result = users.value

  // Search filter
  if (search.value) {
    const term = search.value.toLowerCase()
    result = result.filter(
      (u) =>
        u.fullName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.roles.some(role => role.toLowerCase().includes(term))
    )
  }

  // Status filter
  if (statusFilter.value !== null) {
    result = result.filter(u => u.isActive === statusFilter.value)
  }

  // Role filter
  if (roleFilter.value) {
    result = result.filter(u => u.roles.includes(roleFilter.value))
  }

  // Campus filter
  if (campusFilter.value === '__none__') {
    result = result.filter(u => !u.campus)
  } else if (campusFilter.value) {
    result = result.filter(u => u.campus === campusFilter.value)
  }

  return result
})

async function fetchUsers() {
  loading.value = true
  try {
    const response = await api.get<{ data: BackendUserList[] }>('/api/users')
    users.value = adaptUsersList(response.data || [])
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || 'Failed to load users')
    console.error('Failed to fetch users:', err)
  } finally {
    loading.value = false
  }
}

// Password reset requests
async function fetchResetRequests() {
  resetRequestsLoading.value = true
  try {
    const response = await api.get<any[]>('/api/users/password-reset-requests')
    pendingResetRequests.value = response || []
  } catch {
    // Silently fail — table may not exist yet
    pendingResetRequests.value = []
  } finally {
    resetRequestsLoading.value = false
  }
}

async function markResetComplete(requestId: string) {
  try {
    await api.patch(`/api/users/password-reset-requests/${requestId}/complete`)
    pendingResetRequests.value = pendingResetRequests.value.filter(r => r.id !== requestId)
    toast.success('Password reset request marked as completed')
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || 'Failed to complete reset request')
  }
}

// Phase HV: Bulk access update (Directive 225)
async function bulkAccessUpdate(type: 'permission' | 'module' | 'pillar', action: 'grant' | 'revoke', key: string) {
  if (selectedUsers.value.length === 0) return
  bulkProcessing.value = true
  try {
    const result = await api.post<{ applied: number; skipped: number; errors: string[] }>(
      '/api/users/bulk-access-update',
      { userIds: selectedUsers.value, type, action, key },
    )
    const msg = `Bulk ${action}: ${result.applied} updated, ${result.skipped} skipped`
    if (result.skipped > 0) {
      toast.warning(msg)
    } else {
      toast.success(msg)
    }
    selectedUsers.value = []
    bulkMenuOpen.value = false
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || 'Bulk update failed')
  } finally {
    bulkProcessing.value = false
  }
}

onMounted(() => {
  fetchUsers()
  fetchResetRequests()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          User Management
        </h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          Manage user accounts and permissions
        </p>
      </div>
      <div class="d-flex align-center ga-3">
        <v-btn v-if="canAdd('users')" color="primary" prepend-icon="mdi-account-plus" @click="createUser">
          New User
        </v-btn>
        <v-badge
          v-if="pendingResetRequests.length > 0"
          :content="pendingResetRequests.length"
          color="warning"
          inline
        >
          <v-btn
            variant="tonal"
            color="warning"
            size="small"
            prepend-icon="mdi-lock-reset"
            @click="showResetPanel = !showResetPanel"
          >
            Reset Requests
          </v-btn>
        </v-badge>
      </div>
    </div>

    <!-- Pending Password Reset Requests (Phase HQ) -->
    <v-expand-transition>
      <v-alert
        v-if="pendingResetRequests.length > 0 && showResetPanel"
        type="warning"
        variant="tonal"
        class="mb-4"
        closable
        @click:close="showResetPanel = false"
      >
        <template #title>
          Pending Password Reset Requests ({{ pendingResetRequests.length }})
        </template>
        <v-table density="compact" class="mt-2 bg-transparent">
          <thead>
            <tr class="bg-primary text-white">
              <th>Identifier</th>
              <th>Notes</th>
              <th>Requested</th>
              <th class="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in pendingResetRequests" :key="req.id">
              <td class="font-weight-medium">{{ req.identifier }}</td>
              <td>{{ req.notes || '—' }}</td>
              <td>{{ formatDate(req.requested_at) }}</td>
              <td class="text-center">
                <v-btn
                  size="small"
                  color="success"
                  variant="tonal"
                  prepend-icon="mdi-check"
                  @click="markResetComplete(req.id)"
                >
                  Mark Complete
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-alert>
    </v-expand-transition>

    <!-- Data Table Card -->
    <v-card>
      <!-- Toolbar -->
      <v-card-title class="d-flex align-center pa-4">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search users"
          single-line
          hide-details
          density="compact"
          variant="outlined"
          class="mr-4"
          style="max-width: 300px"
        />

        <!-- Status Filter -->
        <v-select
          v-model="statusFilter"
          :items="[
            { title: 'All Status', value: null },
            { title: 'Active', value: true },
            { title: 'Inactive', value: false }
          ]"
          label="Status"
          density="compact"
          variant="outlined"
          hide-details
          class="mr-4"
          style="max-width: 150px"
        />

        <!-- Campus Filter -->
        <v-select
          v-model="campusFilter"
          :items="campusFilterOptions"
          label="Campus"
          density="compact"
          variant="outlined"
          hide-details
          class="mr-4"
          style="max-width: 180px"
        />

        <!-- Role Filter -->
        <v-select
          v-model="roleFilter"
          :items="[
            { title: 'All Roles', value: '' },
            { title: 'SuperAdmin', value: 'SuperAdmin' },
            { title: 'Admin', value: 'Admin' },
            { title: 'Staff', value: 'Staff' },
            { title: 'Viewer', value: 'Viewer' },
          ]"
          label="Role"
          density="compact"
          variant="outlined"
          hide-details
          class="mr-4"
          style="max-width: 150px"
        />

        <v-spacer />
        <v-chip color="primary" variant="tonal">
          {{ filteredUsers.length }} users
        </v-chip>
      </v-card-title>

      <v-divider />

      <!-- Phase HV: Bulk Actions Bar (Directives 223–224) -->
      <v-slide-y-transition>
        <v-toolbar v-if="selectedUsers.length > 0" density="compact" color="primary" class="px-4">
          <v-toolbar-title class="text-body-2">
            {{ selectedUsers.length }} user(s) selected
          </v-toolbar-title>
          <v-spacer />

          <v-menu v-model="bulkMenuOpen" :close-on-content-click="false" location="bottom end">
            <template #activator="{ props }">
              <v-btn variant="tonal" color="white" size="small" v-bind="props" :loading="bulkProcessing">
                Bulk Actions
                <v-icon end>mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list density="compact" min-width="260">
              <v-list-subheader>University Operations</v-list-subheader>
              <v-list-item @click="bulkAccessUpdate('module', 'grant', 'OPERATIONS')" prepend-icon="mdi-plus-circle-outline">
                <v-list-item-title>Grant UO Module</v-list-item-title>
              </v-list-item>
              <v-list-item @click="bulkAccessUpdate('module', 'revoke', 'OPERATIONS')" prepend-icon="mdi-minus-circle-outline">
                <v-list-item-title>Revoke UO Module</v-list-item-title>
              </v-list-item>

              <v-divider class="my-1" />
              <v-list-subheader>Sub-Module Access</v-list-subheader>
              <v-list-item @click="bulkAccessUpdate('permission', 'grant', 'university-operations-physical')" prepend-icon="mdi-plus">
                <v-list-item-title>Grant Physical</v-list-item-title>
              </v-list-item>
              <v-list-item @click="bulkAccessUpdate('permission', 'revoke', 'university-operations-physical')" prepend-icon="mdi-minus">
                <v-list-item-title>Revoke Physical</v-list-item-title>
              </v-list-item>
              <v-list-item @click="bulkAccessUpdate('permission', 'grant', 'university-operations-financial')" prepend-icon="mdi-plus">
                <v-list-item-title>Grant Financial</v-list-item-title>
              </v-list-item>
              <v-list-item @click="bulkAccessUpdate('permission', 'revoke', 'university-operations-financial')" prepend-icon="mdi-minus">
                <v-list-item-title>Revoke Financial</v-list-item-title>
              </v-list-item>

              <v-divider class="my-1" />
              <v-list-subheader>Pillar Access</v-list-subheader>
              <v-list-item
                v-for="p in ['GOVERNANCE', 'ADMINISTRATION', 'QASS', 'EXTERNAL_LINKAGES']"
                :key="p"
              >
                <v-list-item-title class="text-caption">{{ p.replace('_', ' ') }}</v-list-item-title>
                <template #append>
                  <v-btn size="x-small" variant="tonal" color="success" class="mr-1" @click="bulkAccessUpdate('pillar', 'grant', p)">
                    Grant
                  </v-btn>
                  <v-btn size="x-small" variant="tonal" color="error" @click="bulkAccessUpdate('pillar', 'revoke', p)">
                    Revoke
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-menu>

          <v-btn variant="text" color="white" size="small" class="ml-2" @click="selectedUsers = []">
            Clear
          </v-btn>
        </v-toolbar>
      </v-slide-y-transition>

      <!-- Table -->
      <v-data-table
        :key="users.length"
        :headers="headers"
        :items="filteredUsers"
        :loading="loading"
        :search="search"
        v-model="selectedUsers"
        item-value="id"
        show-select
        hover
        class="elevation-0 cursor-pointer-rows"
        @click:row="(_event: any, { item }: any) => viewUser(item)"
      >
        <!-- Name with Avatar -->
        <template #item.fullName="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" color="primary" class="mr-3">
              <v-img v-if="item.avatarUrl" :src="item.avatarUrl" />
              <span v-else class="text-white">{{ item.firstName[0] }}{{ item.lastName[0] }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.fullName }}</div>
              <v-chip v-if="item.isSuperAdmin" size="x-small" color="purple" variant="tonal" class="mt-1">
                SuperAdmin
              </v-chip>
            </div>
          </div>
        </template>

        <!-- Roles -->
        <template #item.roles="{ item }">
          <div class="d-flex flex-wrap ga-1">
            <v-chip
              v-for="role in item.roles"
              :key="role"
              size="small"
              variant="tonal"
              color="blue"
            >
              {{ role }}
            </v-chip>
            <span v-if="item.roles.length === 0" class="text-grey">No roles</span>
          </div>
        </template>

        <!-- Rank Badge -->
        <template #item.rankLevel="{ item }">
          <v-chip
            :color="getRankColor(item.rankLevel)"
            size="small"
            variant="tonal"
          >
            {{ getRankLabel(item.rankLevel) }}
          </v-chip>
        </template>

        <!-- Status Chip -->
        <template #item.isActive="{ item }">
          <v-chip
            :color="getStatusColor(item.isActive)"
            size="small"
            variant="tonal"
          >
            {{ getStatusText(item.isActive) }}
          </v-chip>
        </template>

        <!-- Last Login -->
        <template #item.lastLoginAt="{ item }">
          <span class="text-body-2">{{ formatDate(item.lastLoginAt) }}</span>
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
                @click.stop
              />
            </template>
            <v-list density="compact" min-width="180">
              <!-- View -->
              <v-list-item @click.stop="viewUser(item)" prepend-icon="mdi-eye">
                <v-list-item-title>View</v-list-item-title>
              </v-list-item>

              <!-- Edit -->
              <v-list-item
                v-if="canEdit('users')"
                @click.stop="editUser(item)"
                prepend-icon="mdi-pencil"
              >
                <v-list-item-title>Edit Profile</v-list-item-title>
              </v-list-item>

              <!-- Manage Access -->
              <v-list-item
                v-if="canEdit('users')"
                @click.stop="manageAccess(item)"
                prepend-icon="mdi-shield-account"
              >
                <v-list-item-title>Manage Access</v-list-item-title>
              </v-list-item>

              <!-- Divider before Delete -->
              <v-divider v-if="canDelete('users')" class="my-1" />

              <!-- Delete -->
              <v-list-item
                v-if="canDelete('users')"
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
            <v-icon icon="mdi-account-group" size="64" color="grey-lighten-1" class="mb-4" />
            <p class="text-h6 text-grey-darken-1">No users found</p>
            <p class="text-body-2 text-grey">Users will appear here once added</p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="text-h6">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete <strong>{{ userToDelete?.fullName }}</strong>?
          This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false" :disabled="deleting">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="deleteUser" :loading="deleting">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
:deep(.cursor-pointer-rows tbody tr) {
  cursor: pointer;
}
</style>

