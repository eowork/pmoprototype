<script setup lang="ts">
import { adaptRepairDetail, type UIRepairDetail, type BackendRepairProjectDetail } from '~/utils/adapters'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const api = useApi()
const toast = useToast()

const repair = ref<UIRepairDetail | null>(null)
const loading = ref(true)

// ACE-R15 Tier 3: Direct ID extraction (no computed, no watchEffect)
const repairId = route.params.id as string

// Validate ID immediately - redirect if missing
if (!repairId) {
  console.error('[Repairs Detail] No repair ID in route, redirecting to list')
  router.push('/repairs')
}

// Status color mapping
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    REPORTED: 'info',
    INSPECTED: 'purple',
    APPROVED: 'primary',
    IN_PROGRESS: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'error',
  }
  return colors[status] || 'grey'
}

// Urgency color mapping
function getUrgencyColor(level: string): string {
  const colors: Record<string, string> = {
    LOW: 'success',
    MEDIUM: 'info',
    HIGH: 'warning',
    CRITICAL: 'error',
  }
  return colors[level] || 'grey'
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

// Fetch repair using direct ID
async function fetchRepair() {
  if (!repairId) {
    toast.error('Invalid repair ID')
    loading.value = false
    return
  }

  try {
    loading.value = true
    console.log('[Repairs Detail] Fetching repair:', repairId)
    const response = await api.get<BackendRepairProjectDetail>(`/api/repair-projects/${repairId}`)
    repair.value = adaptRepairDetail(response)
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to load repair details')
    console.error('[Repairs Detail] Failed to fetch repair:', err)
  } finally {
    loading.value = false
  }
}

// Navigation
function goBack() {
  router.push('/repairs')
}

function editRepair() {
  router.push(`/repairs/edit-${repairId}`)
}

// ACE-R15 Tier 3: Simple onMounted (no watchEffect complexity)
onMounted(() => {
  console.log('[Repairs Detail] Mounted with ID:', repairId)
  fetchRepair()
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
            {{ repair?.title || 'Repair Details' }}
          </h1>
          <p class="text-subtitle-1 text-grey-darken-1">
            {{ repair?.repairCode || '' }}
          </p>
        </div>
      </div>
      <v-btn color="primary" prepend-icon="mdi-pencil" @click="editRepair" :disabled="loading">
        Edit Repair
      </v-btn>
    </div>

    <!-- Loading State -->
    <v-card v-if="loading" class="pa-6">
      <v-skeleton-loader type="article" />
    </v-card>

    <!-- Error State -->
    <v-alert v-else-if="error" type="error" class="mb-4">
      {{ error }}
      <template #append>
        <v-btn variant="text" @click="fetchRepair">Retry</v-btn>
      </template>
    </v-alert>

    <!-- Repair Details -->
    <template v-else-if="repair">
      <!-- Status Card -->
      <v-card class="mb-4">
        <v-card-text>
          <div class="d-flex flex-wrap ga-6 align-center">
            <div>
              <p class="text-caption text-grey mb-1">Status</p>
              <v-chip :color="getStatusColor(repair.status)" size="large">
                {{ repair.status.replace('_', ' ') }}
              </v-chip>
            </div>
            <div>
              <p class="text-caption text-grey mb-1">Urgency</p>
              <v-chip :color="getUrgencyColor(repair.urgency_level)" size="large">
                {{ repair.urgency_level }}
              </v-chip>
            </div>
            <div>
              <p class="text-caption text-grey mb-1">Campus</p>
              <v-chip variant="outlined">{{ repair.campus }}</v-chip>
            </div>
            <v-spacer />
            <div class="text-right">
              <p class="text-caption text-grey mb-1">Estimated Budget</p>
              <p class="text-h5 font-weight-bold text-primary">
                {{ formatCurrency(repair.budget || 0) }}
              </p>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Main Details -->
      <v-row>
        <v-col cols="12" md="8">
          <!-- Repair Information -->
          <v-card class="mb-4">
            <v-card-title>Repair Information</v-card-title>
            <v-divider />
            <v-card-text>
              <v-row>
                <v-col cols="12" v-if="repair.description">
                  <p class="text-caption text-grey">Description</p>
                  <p>{{ repair.description }}</p>
                </v-col>
                <v-col cols="12" sm="6">
                  <p class="text-caption text-grey">Building</p>
                  <p class="font-weight-medium">{{ repair.building_name || '-' }}</p>
                </v-col>
                <v-col cols="12" sm="6">
                  <p class="text-caption text-grey">Floor / Room</p>
                  <p class="font-weight-medium">{{ repair.floor_number || '-' }} / {{ repair.room_number || '-' }}</p>
                </v-col>
                <v-col cols="12" sm="6">
                  <p class="text-caption text-grey">Specific Location</p>
                  <p class="font-weight-medium">{{ repair.specific_location || '-' }}</p>
                </v-col>
                <v-col cols="12" sm="6">
                  <p class="text-caption text-grey">Reported By</p>
                  <p class="font-weight-medium">{{ repair.reported_by || '-' }}</p>
                </v-col>
                <v-col cols="12" sm="6">
                  <p class="text-caption text-grey">Inspection Date</p>
                  <p class="font-weight-medium">{{ formatDate(repair.inspection_date) }}</p>
                </v-col>
                <v-col cols="12" sm="6">
                  <p class="text-caption text-grey">Assigned Technician</p>
                  <p class="font-weight-medium">{{ repair.assigned_technician || '-' }}</p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Timeline -->
          <v-card class="mb-4">
            <v-card-title>Progress Timeline</v-card-title>
            <v-divider />
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6">
                  <p class="text-caption text-grey">Start Date</p>
                  <p class="font-weight-medium">{{ formatDate(repair.start_date) }}</p>
                </v-col>
                <v-col cols="12" sm="6">
                  <p class="text-caption text-grey">End Date</p>
                  <p class="font-weight-medium">{{ formatDate(repair.end_date) }}</p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <!-- Cost Details -->
          <v-card class="mb-4">
            <v-card-title>Cost Details</v-card-title>
            <v-divider />
            <v-list>
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-calculator" />
                </template>
                <v-list-item-title>Estimated Budget</v-list-item-title>
                <v-list-item-subtitle>{{ formatCurrency(repair.budget || 0) }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-receipt" />
                </template>
                <v-list-item-title>Actual Cost</v-list-item-title>
                <v-list-item-subtitle>{{ formatCurrency(repair.actual_cost || 0) }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>

          <!-- Quick Info -->
          <v-card>
            <v-card-title>Quick Info</v-card-title>
            <v-divider />
            <v-list>
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-identifier" />
                </template>
                <v-list-item-title>Repair Code</v-list-item-title>
                <v-list-item-subtitle>{{ repair.project_code }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-map-marker" />
                </template>
                <v-list-item-title>Campus</v-list-item-title>
                <v-list-item-subtitle>{{ repair.campus }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="repair.is_emergency">
                <template #prepend>
                  <v-icon icon="mdi-alert" color="error" />
                </template>
                <v-list-item-title class="text-error">Emergency</v-list-item-title>
                <v-list-item-subtitle>Requires immediate attention</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </div>
</template>
