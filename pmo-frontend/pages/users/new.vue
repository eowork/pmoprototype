<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const router = useRouter()
const api = useApi()
const toast = useToast()

interface Role {
  id: string
  name: string
  description?: string
}

const form = ref({
  email: '',
  username: '',
  first_name: '',
  last_name: '',
  phone: '',
  password: '',
  confirm_password: '',
  is_active: true,
})

const roles = ref<Role[]>([])
const selectedRoles = ref<string[]>([])
const loading = ref(false)
const submitting = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Validation rules
const rules = {
  required: (v: string) => !!v || 'This field is required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Invalid email format',
  minLength: (min: number) => (v: string) => v.length >= min || `Minimum ${min} characters`,
  username: (v: string) => /^[a-z0-9._-]+$/.test(v) || 'Only lowercase, numbers, dots, dashes allowed',
  passwordMatch: (v: string) => v === form.value.password || 'Passwords do not match',
}

// Generate username from name
function generateUsername() {
  if (form.value.first_name && form.value.last_name) {
    const username = `${form.value.first_name}.${form.value.last_name}`.toLowerCase()
      .replace(/\s+/g, '.')
      .replace(/[^a-z0-9._-]/g, '')
    form.value.username = username
  }
}

// Fetch available roles
async function fetchRoles() {
  loading.value = true
  try {
    const response = await api.get<Role[]>('/api/users/roles')
    roles.value = response
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to load roles')
    console.error('[User New] Failed to fetch roles:', err)
  } finally {
    loading.value = false
  }
}

// Submit form
async function handleSubmit() {
  // Validation
  if (!form.value.email || !form.value.username || !form.value.first_name ||
      !form.value.last_name || !form.value.password) {
    toast.error('Please fill in all required fields')
    return
  }

  if (form.value.password !== form.value.confirm_password) {
    toast.error('Passwords do not match')
    return
  }

  if (form.value.password.length < 8) {
    toast.error('Password must be at least 8 characters')
    return
  }

  submitting.value = true
  try {
    const payload = {
      email: form.value.email,
      first_name: form.value.first_name,
      last_name: form.value.last_name,
      phone: form.value.phone || undefined,
      password: form.value.password,
      is_active: form.value.is_active,
    }

    console.log('[User New] Creating user:', payload)
    const response = await api.post<{ id: string }>('/api/users', payload)

    // Assign roles if selected
    if (selectedRoles.value.length > 0) {
      for (const roleId of selectedRoles.value) {
        try {
          await api.post(`/api/users/${response.id}/roles`, { role_id: roleId })
        } catch (err) {
          console.error('[User New] Failed to assign role:', err)
        }
      }
    }

    toast.success('User created successfully')
    router.push(`/users/detail-${response.id}`)
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to create user')
    console.error('[User New] Failed to create user:', err)
  } finally {
    submitting.value = false
  }
}

// Navigation
function goBack() {
  router.push('/users')
}

onMounted(() => {
  fetchRoles()
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
            Create New User
          </h1>
          <p class="text-subtitle-1 text-grey-darken-1">
            Add a new user account
          </p>
        </div>
      </div>
    </div>

    <!-- Form Card -->
    <v-card>
      <v-card-text class="pa-6">
        <v-form @submit.prevent="handleSubmit">
          <v-row>
            <!-- Email -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.email"
                label="Email *"
                type="email"
                variant="outlined"
                density="compact"
                :rules="[rules.required, rules.email]"
                required
              />
            </v-col>

            <!-- Username -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.username"
                label="Username *"
                variant="outlined"
                density="compact"
                :rules="[rules.required, rules.username]"
                hint="Lowercase, numbers, dots, dashes only"
                persistent-hint
                required
              >
                <template #append-inner>
                  <v-btn
                    size="x-small"
                    variant="text"
                    @click="generateUsername"
                    title="Generate from name"
                  >
                    Auto
                  </v-btn>
                </template>
              </v-text-field>
            </v-col>

            <!-- First Name -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.first_name"
                label="First Name *"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                @blur="generateUsername"
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
                :rules="[rules.required]"
                @blur="generateUsername"
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

            <!-- Password -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.password"
                label="Password *"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                density="compact"
                :rules="[rules.required, rules.minLength(8)]"
                hint="Minimum 8 characters"
                persistent-hint
                required
              >
                <template #append-inner>
                  <v-btn
                    :icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    size="x-small"
                    variant="text"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </v-text-field>
            </v-col>

            <!-- Confirm Password -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.confirm_password"
                label="Confirm Password *"
                :type="showConfirmPassword ? 'text' : 'password'"
                variant="outlined"
                density="compact"
                :rules="[rules.required, rules.passwordMatch]"
                required
              >
                <template #append-inner>
                  <v-btn
                    :icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    size="x-small"
                    variant="text"
                    @click="showConfirmPassword = !showConfirmPassword"
                  />
                </template>
              </v-text-field>
            </v-col>

            <!-- Roles -->
            <v-col cols="12">
              <v-divider class="mb-4" />
              <h3 class="text-h6 mb-3">Assign Roles</h3>
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
              <p v-if="roles.length === 0 && !loading" class="text-grey">No roles available</p>
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
          Create User
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
