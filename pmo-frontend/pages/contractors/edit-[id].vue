<script setup lang="ts">
import type { BackendContractor } from '~/utils/adapters'

definePageMeta({
  middleware: ['auth', 'permission'],
})

const route = useRoute()
const router = useRouter()
const api = useApi()
const toast = useToast()

const loading = ref(true)
const submitting = ref(false)

// Direct ID extraction
const contractorId = route.params.id as string

// Validate ID immediately - redirect if missing
if (!contractorId) {
  console.error('[Contractor Edit] No contractor ID in route, redirecting to list')
  router.push('/contractors')
}

// Form data
const form = ref({
  name: '',
  contact_person: '',
  email: '',
  phone: '',
  address: '',
  tin_number: '',
  registration_number: '',
  validity_date: '',
  status: '',
})

// Status options
const statusOptions = [
  { title: 'Active', value: 'ACTIVE' },
  { title: 'Suspended', value: 'SUSPENDED' },
  { title: 'Blacklisted', value: 'BLACKLISTED' },
]

// Validation rules
const rules = {
  required: (v: string) => !!v || 'This field is required',
  email: (v: string) => !v || /.+@.+\..+/.test(v) || 'Invalid email format',
}

// Fetch contractor data
async function fetchData() {
  if (!contractorId) {
    toast.error('Invalid contractor ID')
    loading.value = false
    return
  }

  loading.value = true

  try {
    console.log('[Contractor Edit] Fetching contractor:', contractorId)
    const response = await api.get<BackendContractor>(`/api/contractors/${contractorId}`)
    const c = response

    form.value = {
      name: c.name || '',
      contact_person: c.contact_person || '',
      email: c.email || '',
      phone: c.phone || '',
      address: c.address || '',
      tin_number: c.tin_number || '',
      registration_number: c.registration_number || '',
      validity_date: c.validity_date ? c.validity_date.split('T')[0] : '',
      status: c.status || 'ACTIVE',
    }

    console.log('[Contractor Edit] Form populated')
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to load contractor data')
    console.error('[Contractor Edit] Failed to fetch:', err)
  } finally {
    loading.value = false
  }
}

// Submit form
async function handleSubmit() {
  submitting.value = true

  try {
    const payload = {
      name: form.value.name,
      contact_person: form.value.contact_person || undefined,
      email: form.value.email || undefined,
      phone: form.value.phone || undefined,
      address: form.value.address || undefined,
      tin_number: form.value.tin_number || undefined,
      registration_number: form.value.registration_number || undefined,
      validity_date: form.value.validity_date || undefined,
      status: form.value.status,
    }

    console.log('[Contractor Edit] Submitting:', payload)
    await api.patch(`/api/contractors/${contractorId}`, payload)
    toast.success('Contractor updated successfully')
    router.push('/contractors')
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to update contractor')
    console.error('[Contractor Edit] Failed:', err)
  } finally {
    submitting.value = false
  }
}

// Navigation - Use router.back() to return to exact previous context
function goBack() {
  router.back()
}

onMounted(fetchData)
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center ga-3 mb-4">
      <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" />
      <div>
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          Edit Contractor
        </h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          Update contractor information
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <v-card v-if="loading" class="pa-6">
      <v-skeleton-loader type="article" />
    </v-card>

    <!-- Form -->
    <v-form v-else @submit.prevent="handleSubmit">
      <v-row>
        <!-- Main Form -->
        <v-col cols="12" md="8">
          <!-- Basic Information -->
          <v-card class="mb-4">
            <v-card-title>Basic Information</v-card-title>
            <v-divider />
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="form.name"
                    label="Contractor Name *"
                    placeholder="ABC Construction Company"
                    :rules="[rules.required]"
                    required
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.contact_person"
                    label="Contact Person"
                    placeholder="Juan Dela Cruz"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="form.status"
                    label="Status *"
                    :items="statusOptions"
                    :rules="[rules.required]"
                    required
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Contact Information -->
          <v-card class="mb-4">
            <v-card-title>Contact Information</v-card-title>
            <v-divider />
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.email"
                    label="Email"
                    placeholder="contractor@example.com"
                    type="email"
                    :rules="[rules.email]"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.phone"
                    label="Phone"
                    placeholder="+63 912 345 6789"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="form.address"
                    label="Address"
                    placeholder="123 Main Street, City, Province"
                    rows="2"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Registration Details -->
          <v-card class="mb-4">
            <v-card-title>Registration Details</v-card-title>
            <v-divider />
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.tin_number"
                    label="TIN Number"
                    placeholder="123-456-789-000"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.registration_number"
                    label="Registration Number"
                    placeholder="REG-2026-001"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.validity_date"
                    label="Registration Validity Date"
                    type="date"
                    hint="When the contractor's registration expires"
                    persistent-hint
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Sidebar -->
        <v-col cols="12" md="4">
          <!-- Actions -->
          <v-card>
            <v-card-title>Actions</v-card-title>
            <v-divider />
            <v-card-text>
              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="submitting"
                :disabled="submitting"
              >
                Save Changes
              </v-btn>
              <v-btn
                variant="outlined"
                size="large"
                block
                class="mt-3"
                @click="goBack"
                :disabled="submitting"
              >
                Cancel
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>
