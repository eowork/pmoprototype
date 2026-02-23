<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'permission'],
})

const router = useRouter()
const api = useApi()
const toast = useToast()

const submitting = ref(false)

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
  status: 'ACTIVE',
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

    console.log('[Contractor Create] Submitting:', payload)
    await api.post('/api/contractors', payload)
    toast.success('Contractor created successfully')
    router.push('/contractors')
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to create contractor')
    console.error('[Contractor Create] Failed:', err)
  } finally {
    submitting.value = false
  }
}

// Navigation
function goBack() {
  router.push('/contractors')
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center ga-3 mb-4">
      <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" />
      <div>
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          New Contractor
        </h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          Add a new contractor to the system
        </p>
      </div>
    </div>

    <!-- Form -->
    <v-form @submit.prevent="handleSubmit">
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
                Create Contractor
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
