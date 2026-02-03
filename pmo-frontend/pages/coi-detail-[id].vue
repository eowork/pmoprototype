<script setup lang="ts">
import { adaptProjectDetail, type UIProjectDetail, type BackendProjectDetail } from '~/utils/adapters'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const api = useApi()
const toast = useToast()

const project = ref<UIProjectDetail | null>(null)
const loading = ref(true)

// ACE-R15 Tier 3: Direct ID extraction (no computed, no watchEffect)
// Dynamic route [id] means ID is static after mount - no reactivity needed
const projectId = route.params.id as string

// Validate ID immediately - redirect if missing
if (!projectId) {
  console.error('[COI Detail] No project ID in route, redirecting to list')
  router.push('/coi')
}

// Status color mapping
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PLANNING: 'info',
    ONGOING: 'primary',
    COMPLETED: 'success',
    ON_HOLD: 'warning',
    CANCELLED: 'error',
  }
  return colors[status] || 'grey'
}

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format date
function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Fetch project using direct ID (not computed)
async function fetchProject() {
  if (!projectId) {
    toast.error('Invalid project ID')
    loading.value = false
    return
  }

  try {
    loading.value = true
    console.log('[COI Detail] Fetching project:', projectId)
    const response = await api.get<BackendProjectDetail>(`/api/construction-projects/${projectId}`)
    project.value = adaptProjectDetail(response)
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to load project details')
    console.error('[COI Detail] Failed to fetch project:', err)
  } finally {
    loading.value = false
  }
}

// Navigation
function goBack() {
  router.push('/coi')
}

function editProject() {
  router.push(`/coi-edit-${projectId}`)
}

// ACE-R15 Tier 3: Simple onMounted (no watchEffect complexity)
onMounted(() => {
  console.log('[COI Detail] Mounted with ID:', projectId)
  fetchProject()
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
            {{ project?.projectName || 'Project Details' }}
          </h1>
          <p class="text-subtitle-1 text-grey-darken-1">
            {{ project?.projectCode || '' }}
          </p>
        </div>
      </div>
      <v-btn color="primary" prepend-icon="mdi-pencil" @click="editProject" :disabled="loading">
        Edit Project
      </v-btn>
    </div>

    <!-- Loading State -->
    <v-card v-if="loading" class="pa-6">
      <v-skeleton-loader type="article, table" />
    </v-card>

    <!-- Project Details -->
    <template v-else-if="project">
      <!-- Status and Progress Card -->
      <v-card class="mb-4">
        <v-card-text>
          <div class="d-flex flex-wrap ga-6 align-center">
            <div>
              <p class="text-caption text-grey mb-1">Status</p>
              <v-chip :color="getStatusColor(project.status)" size="large">
                {{ project.status }}
              </v-chip>
            </div>
            <div>
              <p class="text-caption text-grey mb-1">Campus</p>
              <v-chip variant="outlined">{{ project.campus }}</v-chip>
            </div>
            <div>
              <p class="text-caption text-grey mb-1">Progress</p>
              <div class="d-flex align-center" style="min-width: 200px">
                <v-progress-linear
                  :model-value="project.physicalAccomplishment"
                  :color="project.physicalAccomplishment >= 100 ? 'success' : 'primary'"
                  height="12"
                  rounded
                  class="mr-3"
                />
                <span class="font-weight-bold">{{ project.physicalAccomplishment }}%</span>
              </div>
            </div>
            <v-spacer />
            <div class="text-right">
              <p class="text-caption text-grey mb-1">Contract Amount</p>
              <p class="text-h5 font-weight-bold text-primary">
                {{ formatCurrency(project.totalContractAmount) }}
              </p>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Main Details -->
      <v-row>
        <v-col cols="12" md="8">
          <!-- Project Information -->
          <v-card class="mb-4">
            <v-card-title>Project Information</v-card-title>
            <v-divider />
            <v-card-text>
              <v-row>
                <v-col cols="12" v-if="project.description">
                  <p class="text-caption text-grey">Description</p>
                  <p>{{ project.description }}</p>
                </v-col>
                <v-col cols="12" sm="6">
                  <p class="text-caption text-grey">Start Date</p>
                  <p class="font-weight-medium">{{ formatDate(project.startDate) }}</p>
                </v-col>
                <v-col cols="12" sm="6">
                  <p class="text-caption text-grey">Target Completion</p>
                  <p class="font-weight-medium">{{ formatDate(project.targetCompletionDate) }}</p>
                </v-col>
                <v-col cols="12" sm="6">
                  <p class="text-caption text-grey">Duration</p>
                  <p class="font-weight-medium">{{ project.projectDuration || '-' }}</p>
                </v-col>
                <v-col cols="12" sm="6">
                  <p class="text-caption text-grey">Contract Number</p>
                  <p class="font-weight-medium">{{ project.contractNumber || '-' }}</p>
                </v-col>
                <v-col cols="12" sm="6">
                  <p class="text-caption text-grey">Project Engineer</p>
                  <p class="font-weight-medium">{{ project.projectEngineer || '-' }}</p>
                </v-col>
                <v-col cols="12" sm="6">
                  <p class="text-caption text-grey">Project Manager</p>
                  <p class="font-weight-medium">{{ project.projectManager || '-' }}</p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Milestones -->
          <v-card class="mb-4">
            <v-card-title>Milestones</v-card-title>
            <v-divider />
            <v-data-table
              :items="project.milestones"
              :headers="[
                { title: 'Milestone', key: 'name' },
                { title: 'Target Date', key: 'targetDate' },
                { title: 'Actual Date', key: 'actualDate' },
                { title: 'Weight', key: 'weight', align: 'center' },
                { title: 'Progress', key: 'progress', align: 'center' },
                { title: 'Status', key: 'status' },
              ]"
              density="comfortable"
              class="elevation-0"
            >
              <template #item.targetDate="{ item }">
                {{ formatDate(item.targetDate) }}
              </template>
              <template #item.actualDate="{ item }">
                {{ formatDate(item.actualDate) }}
              </template>
              <template #item.weight="{ item }">
                {{ item.weight }}%
              </template>
              <template #item.progress="{ item }">
                <v-progress-circular
                  :model-value="item.progress"
                  :color="item.progress >= 100 ? 'success' : 'primary'"
                  size="40"
                >
                  {{ item.progress }}
                </v-progress-circular>
              </template>
              <template #item.status="{ item }">
                <v-chip :color="getStatusColor(item.status)" size="small">
                  {{ item.status }}
                </v-chip>
              </template>
              <template #no-data>
                <div class="text-center pa-4 text-grey">No milestones recorded</div>
              </template>
            </v-data-table>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <!-- Building Details -->
          <v-card class="mb-4">
            <v-card-title>Building Details</v-card-title>
            <v-divider />
            <v-list>
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-office-building" />
                </template>
                <v-list-item-title>Building Type</v-list-item-title>
                <v-list-item-subtitle>{{ project.buildingType || '-' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-floor-plan" />
                </template>
                <v-list-item-title>Floor Area</v-list-item-title>
                <v-list-item-subtitle>{{ project.floorArea ? `${project.floorArea} sqm` : '-' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-stairs" />
                </template>
                <v-list-item-title>Number of Floors</v-list-item-title>
                <v-list-item-subtitle>{{ project.numberOfFloors || '-' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-tag" />
                </template>
                <v-list-item-title>Subcategory</v-list-item-title>
                <v-list-item-subtitle>{{ project.subcategory || '-' }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>

          <!-- Contractor & Fund Source -->
          <v-card class="mb-4">
            <v-card-title>Contractor & Funding</v-card-title>
            <v-divider />
            <v-list>
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-account-hard-hat" />
                </template>
                <v-list-item-title>Contractor</v-list-item-title>
                <v-list-item-subtitle>{{ project.contractor || '-' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-bank" />
                </template>
                <v-list-item-title>Fund Source</v-list-item-title>
                <v-list-item-subtitle>{{ project.fundSource || '-' }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>

          <!-- Financials -->
          <v-card>
            <v-card-title>Financial Records</v-card-title>
            <v-divider />
            <v-list v-if="project.financials.length > 0">
              <v-list-item v-for="fin in project.financials" :key="fin.id">
                <v-list-item-title>{{ fin.description }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ fin.type }} - {{ formatDate(fin.dateRecorded) }}
                </v-list-item-subtitle>
                <template #append>
                  <span class="font-weight-bold">{{ formatCurrency(fin.amount) }}</span>
                </template>
              </v-list-item>
            </v-list>
            <v-card-text v-else class="text-center text-grey">
              No financial records
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </div>
</template>
