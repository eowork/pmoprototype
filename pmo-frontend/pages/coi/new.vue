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
  project_code: '',
  title: '',
  description: '',
  campus: '',
  status: 'PLANNING',
  funding_source_id: '',
  contractor_id: '',
  contract_amount: null as number | null,
  contract_number: '',
  start_date: '',
  target_completion_date: '',
  project_duration: '',
  project_engineer: '',
  project_manager: '',
  building_type: '',
  floor_area: null as number | null,
  number_of_floors: null as number | null,
  beneficiaries: '',
  // Phase AW: Multi-select assignment
  assigned_user_ids: [] as string[],
})

// Dropdown options
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

// Lookup data
const fundingSources = ref<{ id: string; name: string }[]>([])
const contractors = ref<{ id: string; name: string }[]>([])

// Validation rules
const rules = {
  required: (v: string) => !!v || 'This field is required',
  positiveNumber: (v: number | null) => v === null || v >= 0 || 'Must be a positive number',
  projectCode: (v: string) => !v || /^CP-\d{4}-\d{3}$/.test(v) || 'Format: CP-YYYY-NNN (e.g., CP-2026-001)',
}

// Fetch lookup data
async function fetchLookups() {
  loading.value = true
  try {
    const [fundingRes, contractorRes] = await Promise.all([
      api.get<{ data: { id: string; name: string }[] }>('/api/funding-sources'),
      api.get<{ data: { id: string; name: string }[] }>('/api/contractors'),
    ])
    fundingSources.value = fundingRes.data || []
    contractors.value = contractorRes.data || []
  } catch (err) {
    console.error('Failed to fetch lookup data:', err)
  } finally {
    loading.value = false
  }
}

// Submit form
async function handleSubmit() {
  submitting.value = true

  try {
    // Do NOT send project_id - backend will create base projects record and generate ID
    const payload = {
      project_code: form.value.project_code,
      title: form.value.title,
      description: form.value.description || undefined,
      campus: form.value.campus,
      status: form.value.status,
      funding_source_id: form.value.funding_source_id,
      contractor_id: form.value.contractor_id || undefined,
      contract_amount: form.value.contract_amount || undefined,
      contract_number: form.value.contract_number || undefined,
      start_date: form.value.start_date || undefined,
      target_completion_date: form.value.target_completion_date || undefined,
      project_duration: form.value.project_duration || undefined,
      project_engineer: form.value.project_engineer || undefined,
      project_manager: form.value.project_manager || undefined,
      building_type: form.value.building_type || undefined,
      floor_area: form.value.floor_area || undefined,
      number_of_floors: form.value.number_of_floors || undefined,
      beneficiaries: form.value.beneficiaries || undefined,
      // Phase AW: Multi-select assignment
      assigned_user_ids: form.value.assigned_user_ids.length > 0 ? form.value.assigned_user_ids : undefined,
    }

    console.log('[COI Create] Submitting:', payload)
    await api.post('/api/construction-projects', payload)
    toast.success('Project created successfully')
    router.push('/coi')
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to create project')
    console.error('[COI Create] Failed:', err)
  } finally {
    submitting.value = false
  }
}

// Navigation
function goBack() {
  router.push('/coi')
}

// Phase AV: Fetch eligible staff once on mount (global, no campus filter)
async function fetchEligibleStaff() {
  try {
    const res = await api.get<{ id: string; first_name: string; last_name: string }[]>(
      '/api/users/eligible-for-assignment'
    )
    staffUsers.value = Array.isArray(res) ? res : []
  } catch (err) {
    console.error('[COI Create] Failed to fetch eligible staff:', err)
    staffUsers.value = []
  }
}

onMounted(() => {
  fetchLookups()
  fetchEligibleStaff()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center ga-3 mb-4">
      <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" />
      <div>
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          New Construction Project
        </h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          Create a new construction project
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
                    v-model="form.project_code"
                    label="Project Code *"
                    placeholder="CP-2026-001"
                    hint="Format: CP-YYYY-NNN"
                    persistent-hint
                    :rules="[rules.required, rules.projectCode]"
                    required
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
                <v-col cols="12">
                  <v-text-field
                    v-model="form.title"
                    label="Project Title *"
                    placeholder="New Building Construction"
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
                    placeholder="Describe the project scope and objectives..."
                    rows="3"
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
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.beneficiaries"
                    label="Beneficiaries"
                    placeholder="e.g., Students, Faculty, Community"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Contract Details -->
          <v-card class="mb-4">
            <v-card-title>Contract Details</v-card-title>
            <v-divider />
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="form.funding_source_id"
                    label="Funding Source *"
                    :items="fundingSources"
                    item-title="name"
                    item-value="id"
                    :rules="[rules.required]"
                    required
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="form.contractor_id"
                    label="Contractor"
                    :items="contractors"
                    item-title="name"
                    item-value="id"
                    clearable
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.contract_number"
                    label="Contract Number"
                    placeholder="e.g., CON-2026-001"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="form.contract_amount"
                    label="Contract Amount (PHP)"
                    type="number"
                    placeholder="1000000.00"
                    :rules="[rules.positiveNumber]"
                    prefix="₱"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Schedule -->
          <v-card class="mb-4">
            <v-card-title>Schedule</v-card-title>
            <v-divider />
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.start_date"
                    label="Start Date"
                    type="date"
                    hint="Expected project start"
                    persistent-hint
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.target_completion_date"
                    label="Target Completion Date"
                    type="date"
                    hint="Estimated completion date"
                    persistent-hint
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.project_duration"
                    label="Project Duration"
                    placeholder="e.g., 12 months"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Personnel -->
          <v-card class="mb-4">
            <v-card-title>Personnel</v-card-title>
            <v-divider />
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.project_engineer"
                    label="Project Engineer"
                    placeholder="Engr. Juan Dela Cruz"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.project_manager"
                    label="Project Manager"
                    placeholder="Engr. Maria Santos"
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
          <!-- Building Details -->
          <v-card class="mb-4">
            <v-card-title>Building Details</v-card-title>
            <v-divider />
            <v-card-text>
              <v-text-field
                v-model="form.building_type"
                label="Building Type"
                placeholder="e.g., Academic, Administrative"
                variant="outlined"
                density="comfortable"
                class="mb-3"
              />
              <v-text-field
                v-model.number="form.floor_area"
                label="Floor Area (sqm)"
                type="number"
                placeholder="500"
                :rules="[rules.positiveNumber]"
                variant="outlined"
                density="comfortable"
                class="mb-3"
              />
              <v-text-field
                v-model.number="form.number_of_floors"
                label="Number of Floors"
                type="number"
                placeholder="3"
                :rules="[rules.positiveNumber]"
                variant="outlined"
                density="comfortable"
              />
            </v-card-text>
          </v-card>

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
                Create Project
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
