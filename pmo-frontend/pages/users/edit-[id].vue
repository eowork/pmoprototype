<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'permission'],
})

const route = useRoute()
const router = useRouter()
const api = useApi()
const toast = useToast()

interface Role {
  id: string
  name: string
  description?: string
}

interface UserRole {
  id: string
  name: string
  is_superadmin: boolean
}

interface UserDetail {
  id: string
  email: string
  username?: string  // Phase CB: Username edit
  first_name: string
  last_name: string
  phone?: string
  avatar_url?: string
  is_active: boolean
  rank_level?: number
  campus?: string  // Phase AG: Campus for office-scoped visibility
  roles: UserRole[]
}

const userId = route.params.id as string

if (!userId) {
  console.error('[User Edit] No user ID in route, redirecting to list')
  router.push('/users')
}

const form = ref({
  email: '',
  username: '',  // Phase CB: Username edit
  first_name: '',
  last_name: '',
  phone: '',
  is_active: true,
  rank_level: 100,
  // Phase AG: Campus assignment for office-scoped visibility
  campus: '' as string,
})

// Phase CB/CC: Get current user for self-edit check
const authStore = useAuthStore()
const { isAdmin, isSuperAdmin } = usePermissions()

// Phase CB/CC: Computed - can edit credentials (username, email)
// Self-edit blocked, only Admin/SuperAdmin can edit others
const canEditCredentials = computed(() => {
  // If editing self, cannot edit username/email
  if (authStore.user?.id === userId) return false
  // Must be Admin or SuperAdmin
  return isAdmin.value || isSuperAdmin.value
})

// Phase AG: Campus options for office-scoped visibility
const campusOptions = [
  { title: 'None (No campus filter)', value: '' },
  { title: 'Butuan Campus', value: 'Butuan Campus' },
  { title: 'Cabadbaran', value: 'Cabadbaran' },
]

const user = ref<UserDetail | null>(null)
const roles = ref<Role[]>([])
const selectedRoles = ref<string[]>([])
const loading = ref(true)
const submitting = ref(false)

// Rank levels for university hierarchy
const rankOptions = [
  { value: 10, title: 'SuperAdmin (Rank 10)' },
  { value: 15, title: 'Vice President (Rank 15)' },
  { value: 20, title: 'Division Chief (Rank 20)' },
  { value: 30, title: 'Director (Rank 30)' },
  { value: 40, title: 'Dean (Rank 40)' },
  { value: 50, title: 'Chairperson (Rank 50)' },
  { value: 60, title: 'Admin Personnel (Rank 60)' },
  { value: 70, title: 'Faculty (Rank 70)' },
  { value: 80, title: 'Clerk/Staff (Rank 80)' },
  { value: 90, title: 'Student (Rank 90)' },
  { value: 100, title: 'Viewer (Rank 100)' },
]

// Fetch user details
async function fetchUser() {
  if (!userId) return

  try {
    loading.value = true
    const response = await api.get<UserDetail>(`/api/users/${userId}`)
    user.value = response

    // Populate form
    form.value = {
      email: response.email,
      username: response.username || '',  // Phase CB: Username edit
      first_name: response.first_name,
      last_name: response.last_name,
      phone: response.phone || '',
      is_active: response.is_active,
      rank_level: response.rank_level || 100,
      // Phase AG: Campus for office-scoped visibility
      campus: response.campus || '',
    }

    // Set selected roles
    selectedRoles.value = response.roles.map(r => r.id)
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to load user')
    console.error('[User Edit] Failed to fetch user:', err)
  } finally {
    loading.value = false
  }
}

// Fetch available roles
async function fetchRoles() {
  try {
    const response = await api.get<Role[]>('/api/users/roles')
    roles.value = response
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to load roles')
    console.error('[User Edit] Failed to fetch roles:', err)
  }
}

// Submit form
async function handleSubmit() {
  if (!form.value.email || !form.value.first_name || !form.value.last_name) {
    toast.error('Please fill in all required fields')
    return
  }

  submitting.value = true
  try {
    const payload: Record<string, any> = {
      first_name: form.value.first_name,
      last_name: form.value.last_name,
      phone: form.value.phone || undefined,
      is_active: form.value.is_active,
      rank_level: form.value.rank_level,
      // Phase AG: Campus for office-scoped visibility
      campus: form.value.campus || undefined,
    }

    // Phase CB/CC: Include username and email only if editing another user (canEditCredentials)
    if (canEditCredentials.value) {
      if (form.value.username) {
        payload.username = form.value.username
      }
      if (form.value.email) {
        payload.email = form.value.email
      }
    }

    console.log('[User Edit] Updating user:', userId, payload)
    await api.patch(`/api/users/${userId}`, payload)

    // Update roles
    const currentRoleIds = user.value?.roles.map(r => r.id) || []
    const rolesToAdd = selectedRoles.value.filter(id => !currentRoleIds.includes(id))
    const rolesToRemove = currentRoleIds.filter(id => !selectedRoles.value.includes(id))

    // Add new roles
    for (const roleId of rolesToAdd) {
      try {
        await api.post(`/api/users/${userId}/roles`, { role_id: roleId })
      } catch (err) {
        console.error('[User Edit] Failed to assign role:', err)
      }
    }

    // Remove roles
    for (const roleId of rolesToRemove) {
      try {
        await api.del(`/api/users/${userId}/roles/${roleId}`)
      } catch (err) {
        console.error('[User Edit] Failed to remove role:', err)
      }
    }

    toast.success('User updated successfully')
    router.push(`/users/detail-${userId}`)
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to update user')
    console.error('[User Edit] Failed to update user:', err)
  } finally {
    submitting.value = false
  }
}

// Navigation - Use router.back() to return to exact previous context
function goBack() {
  router.back()
}

onMounted(async () => {
  console.log('[User Edit] Mounted with ID:', userId)
  await Promise.all([fetchUser(), fetchRoles()])
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
            Edit Profile
          </h1>
          <p class="text-subtitle-1 text-grey-darken-1">
            Update user information
          </p>
        </div>
      </div>
      <v-btn variant="outlined" color="primary" prepend-icon="mdi-shield-account" @click="router.push(`/users/access-${userId}`)">
        Manage Access
      </v-btn>
    </div>

    <!-- Loading State -->
    <v-card v-if="loading" class="pa-6">
      <v-skeleton-loader type="article, actions" />
    </v-card>

    <!-- Form Card -->
    <v-card v-else>
      <v-card-text class="pa-6">
        <v-form @submit.prevent="handleSubmit">
          <v-row>
            <!-- Phase CB: Username (editable for Admin/SuperAdmin editing others) -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.username"
                label="Username"
                variant="outlined"
                density="compact"
                :readonly="!canEditCredentials"
                :disabled="!canEditCredentials"
                :hint="canEditCredentials ? 'Lowercase letters, numbers, dots, underscores, dashes only' : 'Admin privileges required to change username'"
                persistent-hint
                :rules="canEditCredentials ? [
                  (v: string) => !v || v.length >= 3 || 'Min 3 characters',
                  (v: string) => !v || v.length <= 100 || 'Max 100 characters',
                  (v: string) => !v || /^[a-z0-9._-]*$/.test(v) || 'Only lowercase letters, numbers, dots, underscores, dashes'
                ] : []"
              />
            </v-col>

            <!-- Phase CC: Email (editable for Admin/SuperAdmin editing others) -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.email"
                label="Email *"
                type="email"
                variant="outlined"
                density="compact"
                :readonly="!canEditCredentials"
                :disabled="!canEditCredentials"
                :hint="canEditCredentials ? 'Must be a valid email address' : 'Admin privileges required to change email'"
                persistent-hint
                required
              />
            </v-col>

            <!-- Active Status -->
            <v-col cols="12" md="6">
              <v-switch
                v-model="form.is_active"
                label="Active Account"
                color="success"
                density="compact"
                hide-details
              />
            </v-col>

            <!-- First Name -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.first_name"
                label="First Name *"
                variant="outlined"
                density="compact"
                required
              />
            </v-col>

            <!-- Last Name -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.last_name"
                label="Last Name *"
                variant="outlined"
                density="compact"
                required
              />
            </v-col>

            <!-- Phone -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.phone"
                label="Phone"
                variant="outlined"
                density="compact"
              />
            </v-col>

            <!-- Rank Level -->
            <v-col cols="12" md="6">
              <v-select
                v-model="form.rank_level"
                :items="rankOptions"
                label="Rank Level *"
                variant="outlined"
                density="compact"
                required
                hint="User's position in the university hierarchy"
                persistent-hint
              />
            </v-col>

            <!-- Phase AG: Campus Assignment -->
            <v-col cols="12" md="6">
              <v-select
                v-model="form.campus"
                :items="campusOptions"
                label="Campus Assignment"
                variant="outlined"
                density="compact"
                hint="Determines which records the user can see (Staff only)"
                persistent-hint
              />
            </v-col>

            <!-- Roles -->
            <v-col cols="12">
              <v-divider class="mb-4" />
              <h3 class="text-h6 mb-3">Assigned Roles</h3>
              <v-chip-group
                v-model="selectedRoles"
                column
                multiple
              >
                <v-chip
                  v-for="role in roles"
                  :key="role.id"
                  :value="role.id"
                  filter
                  variant="outlined"
                >
                  {{ role.name }}
                  <v-tooltip v-if="role.description" activator="parent" location="bottom">
                    {{ role.description }}
                  </v-tooltip>
                </v-chip>
              </v-chip-group>
              <p v-if="roles.length === 0" class="text-grey">No roles available</p>
            </v-col>

            <!-- Password Note -->
            <v-col cols="12">
              <v-alert
                type="info"
                variant="tonal"
                density="compact"
                icon="mdi-information"
              >
                To reset the password, use the "Reset Password" button on the user detail page.
              </v-alert>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider />

      <!-- Actions -->
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="goBack" :disabled="submitting">
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="handleSubmit"
          :loading="submitting"
        >
          Update User
        </v-btn>
      </v-card-actions>
    </v-card>

  </div>
</template>
