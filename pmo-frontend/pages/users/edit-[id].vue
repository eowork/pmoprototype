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

// Tab state
const activeTab = ref('basic')

// Permission overrides
interface PermissionOverride {
  id: string
  user_id: string
  module_key: string
  can_access: boolean
}

const permissionOverrides = ref<PermissionOverride[]>([])
const permissionsLoading = ref(false)

// Module assignments
interface ModuleAssignment {
  id: string
  user_id: string
  module: string
  assigned_by: string | null
  assigned_at: string
}

const moduleAssignments = ref<ModuleAssignment[]>([])
const modulesLoading = ref(false)
const selectedModules = ref<string[]>([])

// Available module types for assignment
const moduleTypes = [
  { value: 'CONSTRUCTION', label: 'Construction (COI)', description: 'Access to Construction/Infrastructure Projects' },
  { value: 'REPAIR', label: 'Repair Projects', description: 'Access to Repair and Maintenance Projects' },
  { value: 'OPERATIONS', label: 'University Operations', description: 'Access to University Operations/DBM metrics' },
  { value: 'ALL', label: 'All Modules', description: 'Full access to all project modules' },
]

// Confirmation dialog for destructive actions
const revokeConfirmDialog = ref(false)

// Module definitions with display names
const modules = [
  { key: 'coi', name: 'Construction Projects (COI)', description: 'Manage construction project records' },
  { key: 'repairs', name: 'Repair Projects', description: 'Manage repair and maintenance project records' },
  { key: 'contractors', name: 'Contractors', description: 'Manage contractor reference data' },
  { key: 'funding_sources', name: 'Funding Sources', description: 'Manage funding source reference data' },
  { key: 'university_operations', name: 'University Operations', description: 'Manage university operations and DBM metrics' },
  { key: 'users', name: 'User Management', description: 'Manage user accounts and permissions (Admin only)' },
]

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

// Fetch permission overrides
async function fetchPermissions() {
  if (!userId) return

  try {
    permissionsLoading.value = true
    const response = await api.get<PermissionOverride[]>(`/api/users/${userId}/permissions`)
    permissionOverrides.value = response
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    console.error('[User Edit] Failed to fetch permissions:', err)
    // Don't show error toast - permissions may not exist yet
  } finally {
    permissionsLoading.value = false
  }
}

// Fetch module assignments
async function fetchModuleAssignments() {
  if (!userId) return

  try {
    modulesLoading.value = true
    const response = await api.get<ModuleAssignment[]>(`/api/users/${userId}/modules`)
    moduleAssignments.value = response
    // Set selected modules based on assignments
    selectedModules.value = response.map(a => a.module)
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    console.error('[User Edit] Failed to fetch module assignments:', err)
    // Don't show error toast - assignments may not exist yet
  } finally {
    modulesLoading.value = false
  }
}

// Handle module assignment change
async function handleModuleChange(module: string, checked: boolean) {
  try {
    if (checked) {
      // Assign module
      await api.post(`/api/users/${userId}/modules`, { module })
      toast.success(`${module} module assigned`)
    } else {
      // Remove module assignment
      await api.del(`/api/users/${userId}/modules/${module}`)
      toast.success(`${module} module removed`)
    }
    // Refresh assignments
    await fetchModuleAssignments()
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to update module assignment')
    console.error('[User Edit] Failed to update module assignment:', err)
    // Refresh to get current state
    await fetchModuleAssignments()
  }
}

// Check if module is assigned
function isModuleAssigned(module: string): boolean {
  // If ALL is assigned, all individual modules are effectively assigned
  if (selectedModules.value.includes('ALL') && module !== 'ALL') {
    return true
  }
  return selectedModules.value.includes(module)
}

// Check if individual module checkbox should be disabled (when ALL is selected)
function isModuleDisabled(module: string): boolean {
  return module !== 'ALL' && selectedModules.value.includes('ALL')
}

// Check if module has override
function hasOverride(moduleKey: string): boolean {
  return permissionOverrides.value.some(p => p.module_key === moduleKey)
}

// Get override access value
function getOverrideAccess(moduleKey: string): boolean | null {
  const override = permissionOverrides.value.find(p => p.module_key === moduleKey)
  return override ? override.can_access : null
}

// Check if module is checked (granted or role default)
function isModuleChecked(moduleKey: string): boolean {
  const access = getOverrideAccess(moduleKey)
  // If override exists, use override value
  if (access !== null) return access
  // Otherwise, assume role default grants access (can be refined later)
  return true
}

// Handle checkbox change for a module
async function handlePermissionChange(moduleKey: string, checked: boolean) {
  try {
    if (checked) {
      // Grant access (or remove revoke override)
      const currentOverride = getOverrideAccess(moduleKey)
      if (currentOverride === false) {
        // Remove the revoke override
        await api.del(`/api/users/${userId}/permissions/${moduleKey}`)
        toast.success('Override removed')
      } else if (currentOverride === null) {
        // Create grant override
        await api.post(`/api/users/${userId}/permissions`, {
          module_key: moduleKey,
          can_access: true,
        })
        toast.success('Access granted')
      }
    } else {
      // Revoke access
      await api.post(`/api/users/${userId}/permissions`, {
        module_key: moduleKey,
        can_access: false,
      })
      toast.success('Access revoked')
    }

    // Refresh permissions
    await fetchPermissions()
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to update permission')
    console.error('[User Edit] Failed to update permission:', err)
  }
}

// Bulk grant all modules - uses single API call to avoid ThrottlerException
async function grantAllModules() {
  try {
    const updates = modules.map(m => ({
      module_key: m.key,
      can_access: true,
    }))
    await api.post(`/api/users/${userId}/permissions/bulk`, { updates })
    toast.success('All modules granted')
    await fetchPermissions()
  } catch (err: unknown) {
    const apiError = err as { message?: string; status?: number }
    if (apiError.status === 429) {
      toast.error('Too many requests. Please wait and try again.')
    } else {
      toast.error(apiError.message || 'Failed to grant all modules')
    }
  }
}

// Show confirmation dialog for bulk revoke
function confirmRevokeAll() {
  revokeConfirmDialog.value = true
}

// Bulk revoke all modules - uses single API call to avoid ThrottlerException
async function revokeAllModules() {
  revokeConfirmDialog.value = false
  try {
    const updates = modules.map(m => ({
      module_key: m.key,
      can_access: false,
    }))
    await api.post(`/api/users/${userId}/permissions/bulk`, { updates })
    toast.success('All modules revoked')
    await fetchPermissions()
  } catch (err: unknown) {
    const apiError = err as { message?: string; status?: number }
    if (apiError.status === 429) {
      toast.error('Too many requests. Please wait and try again.')
    } else {
      toast.error(apiError.message || 'Failed to revoke all modules')
    }
  }
}

// Reset all overrides - uses single API call to avoid ThrottlerException
async function resetAllOverrides() {
  try {
    // Only reset modules that have overrides
    const modulesWithOverrides = modules.filter(m => hasOverride(m.key))
    if (modulesWithOverrides.length === 0) {
      toast.info('No overrides to reset')
      return
    }
    const updates = modulesWithOverrides.map(m => ({
      module_key: m.key,
      can_access: null, // null signals deletion
    }))
    await api.post(`/api/users/${userId}/permissions/bulk`, { updates })
    toast.success('All overrides reset to role defaults')
    await fetchPermissions()
  } catch (err: unknown) {
    const apiError = err as { message?: string; status?: number }
    if (apiError.status === 429) {
      toast.error('Too many requests. Please wait and try again.')
    } else {
      toast.error(apiError.message || 'Failed to reset overrides')
    }
  }
}

// Get permission state label
function getPermissionLabel(moduleKey: string): string {
  const access = getOverrideAccess(moduleKey)
  if (access === null) return 'Role Default'
  return access ? 'Granted' : 'Revoked'
}

// Get permission state color
function getPermissionColor(moduleKey: string): string {
  const access = getOverrideAccess(moduleKey)
  if (access === null) return 'grey'
  return access ? 'success' : 'error'
}

// Navigation - Use router.back() to return to exact previous context
function goBack() {
  router.back()
}

onMounted(async () => {
  console.log('[User Edit] Mounted with ID:', userId)
  await Promise.all([fetchUser(), fetchRoles(), fetchPermissions(), fetchModuleAssignments()])
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

    <!-- Form Card with Tabs -->
    <v-card v-else>
      <!-- Tabs -->
      <v-tabs v-model="activeTab" color="primary">
        <v-tab value="basic">Basic Info</v-tab>
        <v-tab value="modules">Admin Scope</v-tab>
        <v-tab value="permissions">Permissions</v-tab>
      </v-tabs>

      <v-divider />

      <!-- Tab Content -->
      <v-window v-model="activeTab">
        <!-- Basic Info Tab -->
        <v-window-item value="basic">
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
    </v-window-item>

    <!-- Admin Scope Tab -->
    <v-window-item value="modules">
      <v-card-text class="pa-6">
        <!-- Info Alert -->
        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          icon="mdi-view-module"
          class="mb-4"
        >
          <div class="text-subtitle-2 mb-1">Admin Responsibility Scope</div>
          <div class="text-caption">
            Assign which project modules this Admin user is responsible for managing.
            This controls which pending reviews they can see and approve. Only applicable to Admin role users.
            Selecting "All Modules" grants management responsibility for all project types.
          </div>
        </v-alert>

        <!-- Loading State -->
        <div v-if="modulesLoading" class="text-center pa-4">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <!-- Module Checkboxes -->
        <v-list v-else density="comfortable">
          <v-list-item
            v-for="moduleType in moduleTypes"
            :key="moduleType.value"
            :disabled="isModuleDisabled(moduleType.value)"
          >
            <template #prepend>
              <v-checkbox
                :model-value="isModuleAssigned(moduleType.value)"
                @update:model-value="(val: boolean | null) => handleModuleChange(moduleType.value, !!val)"
                hide-details
                density="compact"
                color="primary"
                :disabled="isModuleDisabled(moduleType.value)"
              />
            </template>
            <v-list-item-title class="font-weight-medium">
              {{ moduleType.label }}
              <v-chip
                v-if="moduleType.value === 'ALL'"
                size="x-small"
                color="purple"
                variant="tonal"
                class="ml-2"
              >
                Full Access
              </v-chip>
            </v-list-item-title>
            <v-list-item-subtitle>{{ moduleType.description }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>

        <!-- Current Assignments Info -->
        <v-divider class="my-4" />
        <div class="text-caption text-grey">
          <strong>Current Assignments:</strong>
          <span v-if="selectedModules.length === 0" class="ml-2">None assigned</span>
          <v-chip
            v-for="mod in selectedModules"
            :key="mod"
            size="small"
            color="primary"
            variant="tonal"
            class="ml-2"
          >
            {{ mod }}
          </v-chip>
        </div>

        <!-- Note about ALL -->
        <v-alert
          v-if="selectedModules.includes('ALL')"
          type="success"
          variant="tonal"
          density="compact"
          icon="mdi-check-circle"
          class="mt-4"
        >
          User has <strong>full access</strong> to all project modules.
        </v-alert>
      </v-card-text>
    </v-window-item>

    <!-- Permissions Tab -->
    <v-window-item value="permissions">
      <v-card-text class="pa-6">
        <!-- Info Alert -->
        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          icon="mdi-shield-account"
          class="mb-4"
        >
          <div class="text-subtitle-2 mb-1">Page Access Overrides</div>
          <div class="text-caption">
            Override default role permissions to grant or restrict access to specific modules.
            This controls what the user can see in navigation and which routes they can access.
            Checked = access granted, unchecked = access denied.
          </div>
        </v-alert>

        <!-- Bulk Actions -->
        <div class="d-flex justify-space-between align-center mb-4">
          <div class="text-subtitle-2 text-grey-darken-2">Module Permissions</div>
          <div class="d-flex ga-2">
            <v-btn
              size="small"
              variant="outlined"
              color="success"
              prepend-icon="mdi-check-all"
              @click="grantAllModules"
              :disabled="permissionsLoading"
            >
              Grant All
            </v-btn>
            <v-btn
              size="small"
              variant="outlined"
              color="error"
              prepend-icon="mdi-close-circle-outline"
              @click="confirmRevokeAll"
              :disabled="permissionsLoading"
            >
              Revoke All
            </v-btn>
            <v-btn
              size="small"
              variant="outlined"
              prepend-icon="mdi-refresh"
              @click="resetAllOverrides"
              :disabled="permissionsLoading"
            >
              Reset to Defaults
            </v-btn>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="permissionsLoading" class="text-center pa-4">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <!-- Permission Checkboxes -->
        <v-table v-else density="comfortable">
          <thead>
            <tr>
              <th class="text-left" style="width: 60px">Access</th>
              <th class="text-left">Module</th>
              <th class="text-left">Description</th>
              <th class="text-left" style="width: 120px">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="module in modules" :key="module.key">
              <td>
                <v-checkbox
                  :model-value="isModuleChecked(module.key)"
                  @update:model-value="(val: boolean | null) => handlePermissionChange(module.key, !!val)"
                  hide-details
                  density="compact"
                  color="primary"
                />
              </td>
              <td class="font-weight-medium">{{ module.name }}</td>
              <td class="text-grey-darken-1">{{ module.description }}</td>
              <td>
                <v-chip
                  :color="getPermissionColor(module.key)"
                  size="small"
                  variant="tonal"
                >
                  {{ getPermissionLabel(module.key) }}
                </v-chip>
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- Legend -->
        <v-divider class="my-4" />
        <div class="text-caption text-grey">
          <strong>Status Legend:</strong>
          <v-chip size="x-small" color="grey" variant="tonal" class="ml-2">Role Default</v-chip>
          <span class="ml-1">= Uses role permissions</span>
          <v-chip size="x-small" color="success" variant="tonal" class="ml-3">Granted</v-chip>
          <span class="ml-1">= Explicit access override</span>
          <v-chip size="x-small" color="error" variant="tonal" class="ml-3">Revoked</v-chip>
          <span class="ml-1">= Explicit deny override</span>
        </div>
      </v-card-text>
    </v-window-item>
  </v-window>

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

    <!-- Revoke All Confirmation Dialog -->
    <v-dialog v-model="revokeConfirmDialog" max-width="450" persistent>
      <v-card>
        <v-card-title class="text-h6 text-error">
          <v-icon start color="error">mdi-alert-circle</v-icon>
          Confirm Revoke All Permissions
        </v-card-title>
        <v-card-text>
          <p class="mb-2">
            Are you sure you want to <strong>revoke all module access</strong> for this user?
          </p>
          <p class="text-body-2 text-grey-darken-1">
            This will deny access to all modules. The user will only be able to view the Dashboard.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="revokeConfirmDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="revokeAllModules">
            Revoke All
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
