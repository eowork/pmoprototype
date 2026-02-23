<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'permission'],
})

const router = useRouter()
const api = useApi()
const toast = useToast()

const loading = ref(false)
const submitting = ref(false)

// Phase AO: Staff users for assignment dropdown
const staffUsers = ref<{ id: string; first_name: string; last_name: string }[]>([])

// Form data
const form = ref({
  title: '',
  description: '',
  code: '',
  operation_type: '',
  campus: '',
  status: 'PLANNING',
  start_date: '',
  end_date: '',
  budget: null as number | null,
  // Phase AW: Multi-select assignment
  assigned_user_ids: [] as string[],
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

// Phase AV: Fetch eligible staff once on mount (global, no campus filter)
async function fetchEligibleStaff() {
  try {
    const res = await api.get<{ id: string; first_name: string; last_name: string }[]>(
      '/api/users/eligible-for-assignment'
    )
    staffUsers.value = Array.isArray(res) ? res : []
  } catch (err) {
    console.error('[UniOps Create] Failed to fetch eligible staff:', err)
    staffUsers.value = []
  }
}

onMounted(fetchEligibleStaff)

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
      // Phase AW: Multi-select assignment
      assigned_user_ids: form.value.assigned_user_ids.length > 0 ? form.value.assigned_user_ids : undefined,
    }

    console.log('[UniOps Create] Submitting:', payload)
    await api.post('/api/university-operations', payload)
    toast.success('Operation created successfully')
    router.push('/university-operations')
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to create operation')
    console.error('[UniOps Create] Failed:', err)
  } finally {
    submitting.value = false
  }
}

// Navigation - Use router.back() for context-aware return
function goBack() {
  router.back()
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center ga-3 mb-4">
      <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" />
      <div>
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          New University Operation
        </h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          Create a new university operation or program
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
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.code"
                    label="Operation Code"
                    placeholder="UO-2026-001"
                    hint="Unique operation identifier"
                    persistent-hint
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="form.operation_type"
                    label="Operation Type *"
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
                    label="Title *"
                    placeholder="e.g., Graduate School Enrollment Drive"
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
                    placeholder="Describe the operation objectives and scope..."
                    rows="3"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="form.campus"
                    label="Campus *"
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
                    hint="Operation start date"
                    persistent-hint
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.end_date"
                    label="End Date"
                    type="date"
                    hint="Estimated end date"
                    persistent-hint
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="form.budget"
                    label="Budget (PHP)"
                    type="number"
                    placeholder="500000.00"
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
          <!-- Phase AW: Multi-select Assignment Card -->
          <v-card class="mb-4">
            <v-card-title>Assigned Staff</v-card-title>
            <v-divider />
            <v-card-text>
              <v-autocomplete
                v-model="form.assigned_user_ids"
                label="Assign To"
                :items="staffUsers"
                :item-title="(item: any) => `${item.last_name}, ${item.first_name}`"
                item-value="id"
                multiple
                chips
                closable-chips
                clearable
                hint="Search and assign one or more staff members"
                persistent-hint
                variant="outlined"
                density="comfortable"
              />
            </v-card-text>
          </v-card>

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
                Create Operation
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
