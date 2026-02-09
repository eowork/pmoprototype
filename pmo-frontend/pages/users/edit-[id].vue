<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
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
  first_name: string
  last_name: string
  phone?: string
  avatar_url?: string
  is_active: boolean
  roles: UserRole[]
}

const userId = route.params.id as string

if (!userId) {
  console.error('[User Edit] No user ID in route, redirecting to list')
  router.push('/users')
}

const form = ref({
  email: '',
  first_name: '',
  last_name: '',
  phone: '',
  is_active: true,
})

const user = ref<UserDetail | null>(null)
const roles = ref<Role[]>([])
const selectedRoles = ref<string[]>([])
const loading = ref(true)
const submitting = ref(false)

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
      first_name: response.first_name,
      last_name: response.last_name,
      phone: response.phone || '',
      is_active: response.is_active,
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
    const payload = {
      first_name: form.value.first_name,
      last_name: form.value.last_name,
      phone: form.value.phone || undefined,
      is_active: form.value.is_active,
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

// Navigation
function goBack() {
  router.push(`/users/detail-${userId}`)
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
            Edit User
          </h1>
          <p class="text-subtitle-1 text-grey-darken-1">
            Update user information
          </p>
        </div>
      </div>
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
            <!-- Email (read-only) -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.email"
                label="Email"
                type="email"
                variant="outlined"
                density="compact"
                readonly
                disabled
                hint="Email cannot be changed"
                persistent-hint
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

            <!-- Spacer -->
            <v-col cols="12" md="6" />

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
