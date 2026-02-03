<script setup lang="ts">
import type { BackendUniversityOperation } from '~/utils/adapters'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const api = useApi()
const toast = useToast()

const loading = ref(true)
const submitting = ref(false)

// ACE-R15 Tier 3: Direct ID extraction (no computed, no watchEffect)
const operationId = route.params.id as string

// Validate ID immediately - redirect if missing
if (!operationId) {
  console.error('[University Ops Edit] No operation ID in route, redirecting to list')
  router.push('/university-operations')
}

// Form data
const form = ref({
  title: '',
  description: '',
  code: '',
  operation_type: '',
  campus: '',
  status: '',
  start_date: '',
  end_date: '',
  budget: null as number | null,
})

// Dropdown options
const operationTypeOptions = [
  { title: 'Higher Education', value: 'HIGHER_EDUCATION' },
  { title: 'Advanced Education', value: 'ADVANCED_EDUCATION' },
  { title: 'Research', value: 'RESEARCH' },
  { title: 'Technical Advisory', value: 'TECHNICAL_ADVISORY' },
]

const campusOptions = [
  { title: 'Main Campus', value: 'MAIN' },
  { title: 'Cabadbaran Campus', value: 'CABADBARAN' },
  { title: 'Both Campuses', value: 'BOTH' },
]

const statusOptions = [
  { title: 'Planning', value: 'PLANNING' },
  { title: 'Ongoing', value: 'ONGOING' },
  { title: 'Completed', value: 'COMPLETED' },
  { title: 'On Hold', value: 'ON_HOLD' },
  { title: 'Cancelled', value: 'CANCELLED' },
]

// Validation rules
const rules = {
  required: (v: string) => !!v || 'This field is required',
  positiveNumber: (v: number | null) => v === null || v >= 0 || 'Must be a positive number',
}

// Fetch operation data using direct ID
async function fetchData() {
  if (!operationId) {
    toast.error('Invalid operation ID')
    loading.value = false
    return
  }

  loading.value = true

  try {
    console.log('[UniOps Edit] Fetching operation data:', operationId)
    const op = await api.get<BackendUniversityOperation>(`/api/university-operations/${operationId}`)

    form.value = {
      title: op.title || '',
      description: op.description || '',
      code: op.operation_code || '',
      operation_type: op.operation_type || '',
      campus: op.campus || '',
      status: op.status || '',
      start_date: op.start_date ? op.start_date.split('T')[0] : '',
      end_date: op.end_date ? op.end_date.split('T')[0] : '',
      budget: op.budget_allocated || null,
    }
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to load operation data')
    console.error('[UniOps Edit] Failed to fetch:', err)
  } finally {
    loading.value = false
  }
}

// Submit form
async function handleSubmit() {
  submitting.value = true

  try {
    const payload = {
      title: form.value.title,
      description: form.value.description || undefined,
      code: form.value.code || undefined,
      operation_type: form.value.operation_type,
      campus: form.value.campus,
      status: form.value.status,
      start_date: form.value.start_date || undefined,
      end_date: form.value.end_date || undefined,
      budget: form.value.budget || undefined,
    }

    console.log('[UniOps Edit] Submitting update for:', operationId)
    await api.patch(`/api/university-operations/${operationId}`, payload)
    toast.success('Operation updated successfully')
    router.push(`/university-operations-detail-${operationId}`)
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to update operation')
    console.error('[UniOps Edit] Failed to update:', err)
  } finally {
    submitting.value = false
  }
}

// Navigation
function goBack() {
  router.push(`/university-operations-detail-${operationId}`)
}

// ACE-R15 Tier 3: Simple onMounted (no watchEffect complexity)
onMounted(() => {
  console.log('[University Ops Edit] Mounted with ID:', operationId)
  fetchData()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center ga-3 mb-4">
      <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" />
      <div>
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          Edit Operation
        </h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          {{ form.title }}
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
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.code"
                    label="Operation Code"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="form.operation_type"
                    label="Operation Type"
                    :items="operationTypeOptions"
                    :rules="[rules.required]"
                    required
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="form.title"
                    label="Title"
                    :rules="[rules.required]"
                    required
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="form.description"
                    label="Description"
                    rows="3"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="form.campus"
                    label="Campus"
                    :items="campusOptions"
                    :rules="[rules.required]"
                    required
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="form.status"
                    label="Status"
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

          <!-- Schedule & Budget -->
          <v-card class="mb-4">
            <v-card-title>Schedule & Budget</v-card-title>
            <v-divider />
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.start_date"
                    label="Start Date"
                    type="date"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.end_date"
                    label="End Date"
                    type="date"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="form.budget"
                    label="Budget (PHP)"
                    type="number"
                    :rules="[rules.positiveNumber]"
                    prefix="₱"
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
