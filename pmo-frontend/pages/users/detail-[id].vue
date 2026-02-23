<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'permission'],
})

const route = useRoute()
const router = useRouter()
const api = useApi()
const toast = useToast()

interface UserRole {
  id: string
  name: string
  is_superadmin: boolean
  assigned_at: string
}

interface UserPermission {
  id: string
  name: string
  resource: string
  action: string
}

interface UserDetail {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  avatar_url?: string
  is_active: boolean
  last_login_at?: string
  failed_login_attempts: number
  account_locked_until?: string
  metadata?: any
  created_at: string
  updated_at: string
  roles: UserRole[]
  permissions: UserPermission[]
}

const user = ref<UserDetail | null>(null)
const loading = ref(true)
const unlocking = ref(false)
const resetPasswordDialog = ref(false)
const newPassword = ref('')
const resettingPassword = ref(false)

const userId = route.params.id as string

if (!userId) {
  console.error('[User Detail] No user ID in route, redirecting to list')
  router.push('/users')
}

// Computed properties
const fullName = computed(() => {
  if (!user.value) return ''
  return `${user.value.first_name} ${user.value.last_name}`
})

const isAccountLocked = computed(() => {
  if (!user.value?.account_locked_until) return false
  return new Date(user.value.account_locked_until) > new Date()
})

const isSuperAdmin = computed(() => {
  return user.value?.roles?.some(r => r.is_superadmin) || false
})

// Format date
function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Never'
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Format date simple
function formatDateSimple(dateStr?: string): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Fetch user details
async function fetchUser() {
  if (!userId) {
    toast.error('Invalid user ID')
    loading.value = false
    return
  }

  try {
    loading.value = true
    console.log('[User Detail] Fetching user:', userId)
    const response = await api.get<UserDetail>(`/api/users/${userId}`)
    user.value = response
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to load user details')
    console.error('[User Detail] Failed to fetch user:', err)
  } finally {
    loading.value = false
  }
}

// Navigation
function goBack() {
  router.push('/users')
}

function editUser() {
  router.push(`/users/edit-${userId}`)
}

// Unlock account
async function unlockAccount() {
  if (!userId) return

  unlocking.value = true
  try {
    await api.post(`/api/users/${userId}/unlock`, {})
    toast.success('Account unlocked successfully')
    await fetchUser() // Refresh data
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to unlock account')
    console.error('[User Detail] Failed to unlock account:', err)
  } finally {
    unlocking.value = false
  }
}

// Reset password
async function resetPassword() {
  if (!newPassword.value) {
    toast.error('Please enter a new password')
    return
  }

  if (newPassword.value.length < 8) {
    toast.error('Password must be at least 8 characters')
    return
  }

  resettingPassword.value = true
  try {
    await api.post(`/api/users/${userId}/reset-password`, { password: newPassword.value })
    toast.success('Password reset successfully')
    resetPasswordDialog.value = false
    newPassword.value = ''
    await fetchUser() // Refresh data
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to reset password')
    console.error('[User Detail] Failed to reset password:', err)
  } finally {
    resettingPassword.value = false
  }
}

onMounted(() => {
  console.log('[User Detail] Mounted with ID:', userId)
  fetchUser()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div class="d-flex align-center ga-3">
        <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" />
        <div>
          <h1 class="text-h4 font-weight-bold text-grey-darken-3">
            {{ fullName || 'User Details' }}
          </h1>
          <p class="text-subtitle-1 text-grey-darken-1">
            View user information and permissions
          </p>
        </div>
      </div>
      <div class="d-flex ga-2">
        <v-btn
          v-if="isAccountLocked"
          color="warning"
          prepend-icon="mdi-lock-open"
          @click="unlockAccount"
          :loading="unlocking"
        >
          Unlock Account
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-key"
          @click="resetPasswordDialog = true"
        >
          Reset Password
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-pencil"
          @click="editUser"
        >
          Edit User
        </v-btn>
      </div>
    </div>

    <!-- Loading State -->
    <v-card v-if="loading" class="pa-6">
      <v-skeleton-loader type="article, actions" />
    </v-card>

    <!-- User Details -->
    <div v-else-if="user" class="d-flex flex-column ga-4">
      <!-- Basic Information -->
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>Basic Information</span>
          <v-chip
            :color="user.is_active ? 'success' : 'error'"
            variant="tonal"
          >
            {{ user.is_active ? 'Active' : 'Inactive' }}
          </v-chip>
        </v-card-title>
        <v-divider />
        <v-card-text>
          <div class="d-flex align-center mb-6">
            <v-avatar size="80" color="primary" class="mr-4">
              <v-img v-if="user.avatar_url" :src="user.avatar_url" />
              <span v-else class="text-h4 text-white">
                {{ user.first_name[0] }}{{ user.last_name[0] }}
              </span>
            </v-avatar>
            <div>
              <h2 class="text-h5 font-weight-bold">{{ fullName }}</h2>
              <p class="text-body-1 text-grey-darken-1">{{ user.email }}</p>
              <v-chip v-if="isSuperAdmin" size="small" color="purple" variant="tonal" class="mt-1">
                SuperAdmin
              </v-chip>
            </div>
          </div>

          <v-row>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-grey-darken-1">Email</div>
                <div class="text-body-1">{{ user.email }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-grey-darken-1">Phone</div>
                <div class="text-body-1">{{ user.phone || '-' }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-grey-darken-1">First Name</div>
                <div class="text-body-1">{{ user.first_name }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-grey-darken-1">Last Name</div>
                <div class="text-body-1">{{ user.last_name }}</div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Roles & Permissions -->
      <v-card>
        <v-card-title>Roles & Permissions</v-card-title>
        <v-divider />
        <v-card-text>
          <div class="mb-4">
            <div class="text-caption text-grey-darken-1 mb-2">Assigned Roles</div>
            <div v-if="user.roles && user.roles.length > 0" class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="role in user.roles"
                :key="role.id"
                color="blue"
                variant="tonal"
              >
                {{ role.name }}
                <v-tooltip activator="parent" location="bottom">
                  Assigned: {{ formatDateSimple(role.assigned_at) }}
                </v-tooltip>
              </v-chip>
            </div>
            <div v-else class="text-grey">No roles assigned</div>
          </div>

          <div>
            <div class="text-caption text-grey-darken-1 mb-2">Permissions (via Roles)</div>
            <v-chip-group v-if="user.permissions && user.permissions.length > 0" column>
              <v-chip
                v-for="permission in user.permissions"
                :key="permission.id"
                size="small"
                variant="outlined"
              >
                {{ permission.resource }}: {{ permission.action }}
              </v-chip>
            </v-chip-group>
            <div v-else class="text-grey">No permissions</div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Account Status -->
      <v-card>
        <v-card-title>Account Status</v-card-title>
        <v-divider />
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-grey-darken-1">Last Login</div>
                <div class="text-body-1">{{ formatDate(user.last_login_at) }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-grey-darken-1">Failed Login Attempts</div>
                <div class="text-body-1">
                  <v-chip
                    :color="user.failed_login_attempts >= 5 ? 'error' : 'success'"
                    size="small"
                    variant="tonal"
                  >
                    {{ user.failed_login_attempts }}
                  </v-chip>
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-grey-darken-1">Account Locked Until</div>
                <div class="text-body-1">
                  <v-chip
                    v-if="isAccountLocked"
                    color="error"
                    size="small"
                    variant="tonal"
                  >
                    {{ formatDate(user.account_locked_until) }}
                  </v-chip>
                  <span v-else class="text-grey">Not locked</span>
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-grey-darken-1">Account Status</div>
                <div class="text-body-1">
                  <v-chip
                    :color="user.is_active ? 'success' : 'error'"
                    size="small"
                    variant="tonal"
                  >
                    {{ user.is_active ? 'Active' : 'Inactive' }}
                  </v-chip>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Audit Information -->
      <v-card>
        <v-card-title>Audit Information</v-card-title>
        <v-divider />
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-grey-darken-1">Created At</div>
                <div class="text-body-1">{{ formatDate(user.created_at) }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-grey-darken-1">Last Updated</div>
                <div class="text-body-1">{{ formatDate(user.updated_at) }}</div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>

    <!-- Reset Password Dialog -->
    <v-dialog v-model="resetPasswordDialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="text-h6">Reset Password</v-card-title>
        <v-card-text>
          <p class="mb-4">Enter a new password for <strong>{{ fullName }}</strong></p>
          <v-text-field
            v-model="newPassword"
            label="New Password"
            type="password"
            variant="outlined"
            density="compact"
            hint="Minimum 8 characters"
            persistent-hint
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="resetPasswordDialog = false; newPassword = ''"
            :disabled="resettingPassword"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="resetPassword"
            :loading="resettingPassword"
          >
            Reset Password
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
