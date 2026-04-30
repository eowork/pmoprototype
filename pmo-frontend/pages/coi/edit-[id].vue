<script setup lang="ts">
import type { BackendProjectDetail } from '~/utils/adapters'

definePageMeta({
  middleware: ['auth', 'permission'],
})

const route = useRoute()
const router = useRouter()
const api = useApi()
const toast = useToast()

const loading = ref(true)
const submitting = ref(false)

// ACE-R15 Tier 3: Direct ID extraction (no computed, no watchEffect)
const projectId = route.params.id as string

// Validate ID immediately - redirect if missing
if (!projectId) {
  console.error('[COI Edit] No project ID in route, redirecting to list')
  router.push('/coi')
}

// Form data
const form = ref({
  project_code: '',
  title: '',
  description: '',
  ideal_infrastructure_image: '',
  objectives: '',
  key_features: '',
  campus: '',
  status: '',
  funding_source_id: '',
  contractor_id: '',
  contract_amount: null as number | null,
  contract_number: '',
  start_date: '',
  target_completion_date: '',
  actual_completion_date: '',
  project_duration: '',
  original_contract_duration: '',
  project_engineer: '',
  project_manager: '',
  building_type: '',
  floor_area: null as number | null,
  number_of_floors: null as number | null,
  latitude: null as number | null,
  longitude: null as number | null,
  beneficiaries: '',
  physical_progress: null as number | null,
  financial_progress: null as number | null,
  target_physical_progress: 100 as number,
  target_financial_progress: 100 as number,
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
// Phase AF: Staff users for delegation
const staffUsers = ref<{ id: string; first_name: string; last_name: string }[]>([])

// Validation rules
const rules = {
  required: (v: string) => !!v || 'This field is required',
  positiveNumber: (v: number | null) => v === null || v >= 0 || 'Must be a positive number',
  percentage: (v: number | null) => v === null || (v >= 0 && v <= 100) || 'Must be between 0 and 100',
  projectCode: (v: string) => !v || /^CP-\d{4}-\d{3}$/.test(v) || 'Format: CP-YYYY-NNN (e.g., CP-2026-001)',
}

// Fetch project and lookup data using direct ID
// STEP 4 Fix: Load lookups FIRST, then project data (ensures v-select items exist before v-model is set)
async function fetchData() {
  if (!projectId) {
    toast.error('Invalid project ID')
    loading.value = false
    return
  }

  loading.value = true

  try {
    console.log('[COI Edit] Fetching lookup data first...')

    // STEP 1: Load funding/contractor lookups and project data in parallel
    const [fundingRes, contractorRes, projectRes] = await Promise.all([
      api.get<{ data: { id: string; name: string }[] }>('/api/funding-sources'),
      api.get<{ data: { id: string; name: string }[] }>('/api/contractors'),
      api.get<BackendProjectDetail>(`/api/construction-projects/${projectId}`),
    ])

    fundingSources.value = fundingRes.data || []
    contractors.value = contractorRes.data || []

    const p = projectRes

    form.value = {
      project_code: p.project_code || '',
      title: p.title || '',
      description: p.description || '',
      ideal_infrastructure_image: p.ideal_infrastructure_image || '',
      objectives: Array.isArray(p.objectives) ? p.objectives.join('\n') : '',
      key_features: Array.isArray(p.key_features) ? p.key_features.join('\n') : '',
      campus: p.campus || '',
      status: p.status || '',
      funding_source_id: p.funding_source_id || '',
      contractor_id: p.contractor_id || '',
      contract_amount: p.contract_amount || null,
      contract_number: p.contract_number || '',
      start_date: p.start_date ? p.start_date.split('T')[0] : '',
      target_completion_date: p.target_completion_date ? p.target_completion_date.split('T')[0] : '',
      actual_completion_date: p.actual_completion_date ? p.actual_completion_date.split('T')[0] : '',
      project_duration: p.project_duration || '',
      original_contract_duration: p.original_contract_duration || '',
      project_engineer: p.project_engineer || '',
      project_manager: p.project_manager || '',
      building_type: p.building_type || '',
      floor_area: p.floor_area || null,
      number_of_floors: p.number_of_floors || null,
      latitude: p.latitude ?? null,
      longitude: p.longitude ?? null,
      beneficiaries: p.beneficiaries || '',
      physical_progress: p.physical_progress ?? null,
      financial_progress: p.financial_progress ?? null,
      target_physical_progress: p.target_physical_progress ?? 100,
      target_financial_progress: p.target_financial_progress ?? 100,
      // Phase AW: Multi-select assignment - extract IDs from assigned_users array
      assigned_user_ids: ((p as any).assigned_users || []).map((u: { id: string }) => u.id),
    }

    // STEP 2: Load eligible users (Phase AV: global, no campus filter)
    const usersRes = await api.get<{ id: string; first_name: string; last_name: string }[]>(
      '/api/users/eligible-for-assignment'
    )
    staffUsers.value = Array.isArray(usersRes) ? usersRes : []

    console.log('[COI Edit] Form populated with funding_source_id:', form.value.funding_source_id)
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to load project data')
    console.error('[COI Edit] Failed to fetch:', err)
  } finally {
    loading.value = false
  }
}

// Submit form
async function handleSubmit() {
  submitting.value = true

  try {
    const objectivesArr = form.value.objectives
      ? form.value.objectives.split('\n').map(s => s.trim()).filter(Boolean)
      : undefined
    const keyFeaturesArr = form.value.key_features
      ? form.value.key_features.split('\n').map(s => s.trim()).filter(Boolean)
      : undefined

    const payload = {
      project_code: form.value.project_code,
      title: form.value.title,
      description: form.value.description || undefined,
      ideal_infrastructure_image: form.value.ideal_infrastructure_image || undefined,
      objectives: objectivesArr,
      key_features: keyFeaturesArr,
      campus: form.value.campus,
      status: form.value.status,
      funding_source_id: form.value.funding_source_id,
      contractor_id: form.value.contractor_id || undefined,
      contract_amount: form.value.contract_amount || undefined,
      contract_number: form.value.contract_number || undefined,
      start_date: form.value.start_date || undefined,
      target_completion_date: form.value.target_completion_date || undefined,
      actual_completion_date: form.value.actual_completion_date || undefined,
      project_duration: form.value.project_duration || undefined,
      original_contract_duration: form.value.original_contract_duration || undefined,
      project_engineer: form.value.project_engineer || undefined,
      project_manager: form.value.project_manager || undefined,
      building_type: form.value.building_type || undefined,
      floor_area: form.value.floor_area || undefined,
      number_of_floors: form.value.number_of_floors || undefined,
      latitude: form.value.latitude ?? undefined,
      longitude: form.value.longitude ?? undefined,
      beneficiaries: form.value.beneficiaries || undefined,
      physical_progress: form.value.physical_progress ?? undefined,
      financial_progress: form.value.financial_progress ?? undefined,
      target_physical_progress: form.value.target_physical_progress ?? undefined,
      target_financial_progress: form.value.target_financial_progress ?? undefined,
      // Phase AW: Multi-select assignment
      assigned_user_ids: form.value.assigned_user_ids.length > 0 ? form.value.assigned_user_ids : undefined,
    }

    console.log('[COI Edit] Submitting update for:', projectId)
    await api.patch(`/api/construction-projects/${projectId}`, payload)
    toast.success('Project updated successfully')
    router.push(`/coi/detail-${projectId}`)
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to update project')
    console.error('[COI Edit] Failed to update:', err)
  } finally {
    submitting.value = false
  }
}

// Navigation - Use router.back() to return to exact previous context
function goBack() {
  router.back()
}

// ACE-R15 Tier 3: Simple onMounted (no watchEffect complexity)
onMounted(() => {
  console.log('[COI Edit] Mounted with ID:', projectId)
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
          Edit Project
        </h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          {{ form.project_code }} - {{ form.title }}
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
                <v-col cols="12">
                  <v-text-field
                    v-model="form.ideal_infrastructure_image"
                    label="Ideal/Proposed Infrastructure Image URL"
                    placeholder="https://example.com/image.jpg"
                    hint="Link to rendering or proposed design image"
                    persistent-hint
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="form.objectives"
                    label="Project Objectives"
                    placeholder="One objective per line"
                    hint="Enter each objective on a new line"
                    persistent-hint
                    rows="3"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="form.key_features"
                    label="Key Features"
                    placeholder="One feature per line"
                    hint="Enter each feature on a new line"
                    persistent-hint
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
                    v-model="form.actual_completion_date"
                    label="Actual Completion Date"
                    type="date"
                    hint="When project was actually completed"
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
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.original_contract_duration"
                    label="Original Contract Duration"
                    placeholder="e.g., 365 days"
                    hint="Original contractual duration"
                    persistent-hint
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Progress -->
          <v-card class="mb-4">
            <v-card-title>Progress</v-card-title>
            <v-divider />
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="form.physical_progress"
                    label="Actual Physical Progress"
                    type="number"
                    min="0"
                    max="100"
                    suffix="%"
                    :rules="[rules.percentage]"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="form.target_physical_progress"
                    label="Target Physical Progress"
                    type="number"
                    min="0"
                    max="100"
                    suffix="%"
                    :rules="[rules.percentage]"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="form.financial_progress"
                    label="Actual Financial Progress"
                    type="number"
                    min="0"
                    max="100"
                    suffix="%"
                    :rules="[rules.percentage]"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="form.target_financial_progress"
                    label="Target Financial Progress"
                    type="number"
                    min="0"
                    max="100"
                    suffix="%"
                    :rules="[rules.percentage]"
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
          <!-- Assigned Staff/Personnel -->
          <v-card class="mb-4">
            <v-card-title>Assigned Staff/Personnel</v-card-title>
            <v-divider />
            <v-card-text>
              <v-autocomplete
                v-model="form.assigned_user_ids"
                label="Assigned Staff/Personnel"
                :items="staffUsers"
                :item-title="(u: any) => `${u.last_name}, ${u.first_name}`"
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
                class="mb-3"
              />
              <v-text-field
                v-model.number="form.latitude"
                label="Latitude"
                type="number"
                step="any"
                placeholder="e.g., 9.0820"
                hint="Decimal degrees (optional)"
                persistent-hint
                variant="outlined"
                density="comfortable"
                class="mb-3"
              />
              <v-text-field
                v-model.number="form.longitude"
                label="Longitude"
                type="number"
                step="any"
                placeholder="e.g., 125.5735"
                hint="Decimal degrees (optional)"
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
