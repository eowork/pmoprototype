<script setup lang="ts">
import { CAMPUS_OPTIONS } from '~/utils/campus'
import { RANK_OPTIONS as rankOptions } from '~/utils/userVocab'
import { formatDateTime } from '~/utils/userFormat'
import type { Role, BackendUserDetail } from '~/utils/adapters'

definePageMeta({
  middleware: ['auth', 'permission'],
})

const route = useRoute()
const router = useRouter()
const api = useApi()
const toast = useToast()

const userId = route.params.id as string

if (!userId) {
  console.error('[User Edit] No user ID in route, redirecting to list')
  router.push('/users')
}

const form = ref({
  email: '',
  username: '',  // Phase CB: Username edit
  first_name: '',
  middle_name: '',
  last_name: '',
  suffix: '',
  phone: '',
  office: '',
  position: '',
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
  ...CAMPUS_OPTIONS,
]

const user = ref<BackendUserDetail | null>(null)
const roles = ref<Role[]>([])
const selectedRoles = ref<string[]>([])
const loading = ref(true)
const submitting = ref(false)

// Rank options imported from utils/userVocab (single source).

// Fetch user details
async function fetchUser() {
  if (!userId) return

  try {
    loading.value = true
    const response = await api.get<BackendUserDetail>(`/api/users/${userId}`)
    user.value = response

    // Populate form
    form.value = {
      email: response.email,
      username: response.username || '',  // Phase CB: Username edit
      first_name: response.first_name,
      middle_name: response.middle_name || '',
      last_name: response.last_name,
      suffix: response.metadata?.suffix || '',
      phone: response.phone || '',
      office: response.metadata?.office || '',
      position: response.metadata?.position || '',
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
      middle_name: form.value.middle_name || undefined,
      last_name: form.value.last_name,
      suffix: form.value.suffix || undefined,
      phone: form.value.phone || undefined,
      office: form.value.office || undefined,
      position: form.value.position || undefined,
      is_active: form.value.is_active,
      rank_level: form.value.rank_level,
      // Phase AG: Campus for office-scoped visibility
      campus: form.value.campus || undefined,
    }

    // Phase CC: email editable for Admin/SuperAdmin editing others.
    // PHASE BBBD (Track 3b): username is immutable — never sent on update.
    if (canEditCredentials.value && form.value.email) {
      payload.email = form.value.email
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
          <h1 class="text-h5 font-weight-bold text-grey-darken-3">
            Edit Profile
          </h1>
          <p class="text-subtitle-2 text-grey-darken-1">
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
    <v-card v-else rounded="lg" elevation="1">
      <v-card-text class="pa-6">
        <v-form @submit.prevent="handleSubmit">
          <!-- PHASE BBBG (Track 5): grouped sections (Personal / Account / Access / Security). -->

          <!-- ── Personal Information ─────────────────────────────────────── -->
          <div class="d-flex align-center ga-2 mb-3">
            <v-icon size="18" color="grey-darken-2">mdi-account-outline</v-icon>
            <span class="text-caption text-grey-darken-2 font-weight-bold text-uppercase">Personal Information</span>
            <v-divider class="flex-grow-1 ml-2" />
          </div>
          <v-row dense class="mb-2">
            <v-col cols="12" sm="6" md="4">
              <v-text-field v-model="form.first_name" label="First Name *" variant="outlined"
                            density="compact" required />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-text-field v-model="form.middle_name" label="Middle Name" variant="outlined"
                            density="compact" />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-text-field v-model="form.last_name" label="Last Name *" variant="outlined"
                            density="compact" required />
            </v-col>
            <v-col cols="12" sm="6" md="2">
              <v-text-field v-model="form.suffix" label="Suffix" placeholder="Jr., III"
                            variant="outlined" density="compact" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.phone" label="Phone" variant="outlined" density="compact" />
            </v-col>
          </v-row>

          <!-- ── Account Information ──────────────────────────────────────── -->
          <div class="d-flex align-center ga-2 mb-3 mt-5">
            <v-icon size="18" color="grey-darken-2">mdi-card-account-details-outline</v-icon>
            <span class="text-caption text-grey-darken-2 font-weight-bold text-uppercase">Account Information</span>
            <v-divider class="flex-grow-1 ml-2" />
          </div>
          <v-row dense class="mb-2">
            <!-- PHASE BBBD (Track 3b / Task C): Username is IMMUTABLE after creation. -->
            <v-col cols="12" md="6">
              <v-text-field v-model="form.username" label="Username" variant="outlined" density="compact"
                            readonly hint="Set at account creation — cannot be changed" persistent-hint
                            prepend-inner-icon="mdi-lock-outline" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.email" label="Email *" type="email" variant="outlined" density="compact"
                            :readonly="!canEditCredentials" :disabled="!canEditCredentials"
                            :hint="canEditCredentials ? 'Must be a valid email address' : 'Admin privileges required to change email'"
                            persistent-hint required />
            </v-col>
            <v-col cols="12" md="4">
              <v-select v-model="form.campus" :items="campusOptions" label="Campus Assignment" variant="outlined"
                        density="compact" hint="Determines which records the user can see" persistent-hint />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="form.office" label="Office / Unit" variant="outlined" density="compact" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="form.position" label="Position / Designation" variant="outlined" density="compact" />
            </v-col>
          </v-row>

          <!-- ── Access Information ───────────────────────────────────────── -->
          <div class="d-flex align-center ga-2 mb-3 mt-5">
            <v-icon size="18" color="grey-darken-2">mdi-shield-account-outline</v-icon>
            <span class="text-caption text-grey-darken-2 font-weight-bold text-uppercase">Access Information</span>
            <v-divider class="flex-grow-1 ml-2" />
          </div>
          <v-row dense class="mb-2">
            <v-col cols="12" md="6">
              <v-select v-model="form.rank_level" :items="rankOptions" label="Rank Level *" variant="outlined"
                        density="compact" required hint="Approval authority / org hierarchy — not module CRUD"
                        persistent-hint />
            </v-col>
            <v-col cols="12" md="6" class="d-flex align-center">
              <v-btn variant="tonal" color="primary" prepend-icon="mdi-shield-key-outline" block
                     @click="router.push(`/users/access-${userId}`)">
                Manage Module Access
              </v-btn>
            </v-col>
            <v-col cols="12">
              <div class="text-caption text-grey-darken-1 mb-1 mt-2">System Roles (identity tier)</div>
              <v-chip-group v-model="selectedRoles" column multiple>
                <v-chip v-for="role in roles" :key="role.id" :value="role.id" filter variant="outlined">
                  {{ role.name }}
                  <v-tooltip v-if="role.description" activator="parent" location="bottom">{{ role.description }}</v-tooltip>
                </v-chip>
              </v-chip-group>
              <p v-if="roles.length === 0" class="text-grey">No roles available</p>
            </v-col>
          </v-row>

          <!-- ── Security Information ─────────────────────────────────────── -->
          <div class="d-flex align-center ga-2 mb-3 mt-5">
            <v-icon size="18" color="grey-darken-2">mdi-lock-check-outline</v-icon>
            <span class="text-caption text-grey-darken-2 font-weight-bold text-uppercase">Security Information</span>
            <v-divider class="flex-grow-1 ml-2" />
          </div>
          <v-row dense>
            <v-col cols="12" md="4">
              <v-switch v-model="form.is_active" label="Active Account" color="success" density="compact" hide-details />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field :model-value="formatDateTime(user?.last_login_at)" label="Last Login"
                            variant="outlined" density="compact" readonly prepend-inner-icon="mdi-clock-outline" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field :model-value="formatDateTime(user?.last_password_change_at)" label="Password Last Changed"
                            variant="outlined" density="compact" readonly prepend-inner-icon="mdi-key-outline" />
            </v-col>
            <v-col cols="12">
              <v-alert type="info" variant="tonal" density="compact" icon="mdi-information" class="mt-2">
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
