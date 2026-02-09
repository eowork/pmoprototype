<script setup lang="ts">
import { adaptUsersList, type UIUserList, type BackendUserList } from '~/utils/adapters'

definePageMeta({
  middleware: 'auth',
})

const router = useRouter()
const api = useApi()
const toast = useToast()

const users = ref<UIUserList[]>([])
const search = ref('')
const loading = ref(true)
const deleting = ref(false)
const deleteDialog = ref(false)
const userToDelete = ref<UIUserList | null>(null)

// Filter state
const statusFilter = ref<boolean | null>(null)
const roleFilter = ref<string>('')

// Table headers
const headers = [
  { title: 'Name', key: 'fullName', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Roles', key: 'roles', sortable: false },
  { title: 'Status', key: 'isActive', sortable: true },
  { title: 'Last Login', key: 'lastLoginAt', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const },
]

// Navigation
function viewUser(user: UIUserList) {
  router.push(`/users-detail-${user.id}`)
}

function editUser(user: UIUserList) {
  router.push(`/users-edit-${user.id}`)
}

function createUser() {
  router.push('/users-new')
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

onMounted(fetchUsers)
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
      <v-btn color="primary" prepend-icon="mdi-account-plus" @click="createUser">
        New User
      </v-btn>
    </div>

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

        <v-spacer />
        <v-chip color="primary" variant="tonal">
          {{ filteredUsers.length }} users
        </v-chip>
      </v-card-title>

      <v-divider />

      <!-- Table -->
      <v-data-table
        :key="users.length"
        :headers="headers"
        :items="filteredUsers"
        :loading="loading"
        :search="search"
        item-value="id"
        hover
        class="elevation-0"
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

        <!-- Actions -->
        <template #item.actions="{ item }">
          <div class="d-flex justify-center ga-1">
            <v-btn icon="mdi-eye" size="small" variant="text" color="primary" @click="viewUser(item)" />
            <v-btn icon="mdi-pencil" size="small" variant="text" color="warning" @click="editUser(item)" />
            <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="confirmDelete(item)" />
          </div>
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

