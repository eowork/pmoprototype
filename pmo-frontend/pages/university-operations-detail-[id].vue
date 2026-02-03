<script setup lang="ts">
import { adaptUniversityOperation, type UIUniversityOperation, type BackendUniversityOperation } from '~/utils/adapters'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const api = useApi()
const toast = useToast()

const operation = ref<UIUniversityOperation | null>(null)
const loading = ref(true)

// ACE-R15 Tier 3: Direct ID extraction (no computed, no watchEffect)
const operationId = route.params.id as string

// Validate ID immediately - redirect if missing
if (!operationId) {
  console.error('[University Ops Detail] No operation ID in route, redirecting to list')
  router.push('/university-operations')
}

// Indicators and Financials
const indicators = ref<any[]>([])
const financials = ref<any[]>([])

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

// Format operation type for display
function formatOperationType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
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

// Fetch operation with related data using direct ID
async function fetchOperation() {
  if (!operationId) {
    toast.error('Invalid operation ID')
    loading.value = false
    return
  }

  try {
    loading.value = true
    console.log('[UniOps Detail] Fetching operation:', operationId)

    const [opRes, indicatorsRes, financialsRes] = await Promise.all([
      api.get<BackendUniversityOperation>(`/api/university-operations/${operationId}`),
      api.get<{ data: any[] }>(`/api/university-operations/${operationId}/indicators`),
      api.get<{ data: any[] }>(`/api/university-operations/${operationId}/financials`),
    ])

    operation.value = adaptUniversityOperation(opRes)
    indicators.value = indicatorsRes.data || []
    financials.value = financialsRes.data || []
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to load operation details')
    console.error('[UniOps Detail] Failed to fetch:', err)
  } finally {
    loading.value = false
  }
}

// Navigation
function goBack() {
  router.push('/university-operations')
}

function editOperation() {
  router.push(`/university-operations-edit-${operationId}`)
}

// ACE-R15 Tier 3: Simple onMounted (no watchEffect complexity)
onMounted(() => {
  console.log('[University Ops Detail] Mounted with ID:', operationId)
  fetchOperation()
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
            {{ operation?.title || 'Operation Details' }}
          </h1>
          <p class="text-subtitle-1 text-grey-darken-1">
            {{ operation?.operationCode || '' }}
          </p>
        </div>
      </div>
      <v-btn color="primary" prepend-icon="mdi-pencil" @click="editOperation" :disabled="loading">
        Edit Operation
      </v-btn>
    </div>

    <!-- Loading State -->
    <v-card v-if="loading" class="pa-6">
      <v-skeleton-loader type="article, table" />
    </v-card>

    <!-- Operation Details -->
    <template v-else-if="operation">
      <!-- Status and Overview Card -->
      <v-card class="mb-4">
        <v-card-text>
          <div class="d-flex flex-wrap ga-6 align-center">
            <div>
              <p class="text-caption text-grey mb-1">Status</p>
              <v-chip :color="getStatusColor(operation.status)" size="large">
                {{ operation.status }}
              </v-chip>
            </div>
            <div>
              <p class="text-caption text-grey mb-1">Type</p>
              <v-chip variant="outlined">{{ formatOperationType(operation.operationType) }}</v-chip>
            </div>
            <div>
              <p class="text-caption text-grey mb-1">Campus</p>
              <v-chip variant="outlined">{{ operation.campus }}</v-chip>
            </div>
            <v-spacer />
            <div class="text-right">
              <p class="text-caption text-grey mb-1">Budget Allocated</p>
              <p class="text-h5 font-weight-bold text-primary">
                {{ formatCurrency(operation.budgetAllocated) }}
              </p>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Main Details -->
      <v-row>
        <v-col cols="12" md="8">
          <!-- Operation Information -->
          <v-card class="mb-4">
            <v-card-title>Operation Information</v-card-title>
            <v-divider />
            <v-card-text>
              <v-row>
                <v-col cols="12" v-if="operation.description">
                  <p class="text-caption text-grey">Description</p>
                  <p>{{ operation.description }}</p>
                </v-col>
                <v-col cols="12" sm="6">
                  <p class="text-caption text-grey">Academic Year</p>
                  <p class="font-weight-medium">{{ operation.academicYear || '-' }}</p>
                </v-col>
                <v-col cols="12" sm="6">
                  <p class="text-caption text-grey">Semester</p>
                  <p class="font-weight-medium">{{ operation.semester || '-' }}</p>
                </v-col>
                <v-col cols="12" sm="6">
                  <p class="text-caption text-grey">Start Date</p>
                  <p class="font-weight-medium">{{ formatDate(operation.startDate) }}</p>
                </v-col>
                <v-col cols="12" sm="6">
                  <p class="text-caption text-grey">End Date</p>
                  <p class="font-weight-medium">{{ formatDate(operation.endDate) }}</p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Indicators -->
          <v-card class="mb-4">
            <v-card-title>Performance Indicators</v-card-title>
            <v-divider />
            <v-data-table
              :items="indicators"
              :headers="[
                { title: 'Particular', key: 'particular' },
                { title: 'Fiscal Year', key: 'fiscal_year', align: 'center' },
                { title: 'Target', key: 'target_total', align: 'end' },
                { title: 'Accomplishment', key: 'accomplishment_total', align: 'end' },
              ]"
              density="comfortable"
              class="elevation-0"
            >
              <template #item.target_total="{ item }">
                {{ (item.target_q1 || 0) + (item.target_q2 || 0) + (item.target_q3 || 0) + (item.target_q4 || 0) }}
              </template>
              <template #item.accomplishment_total="{ item }">
                {{ (item.accomplishment_q1 || 0) + (item.accomplishment_q2 || 0) + (item.accomplishment_q3 || 0) + (item.accomplishment_q4 || 0) }}
              </template>
              <template #no-data>
                <div class="text-center pa-4 text-grey">No indicators recorded</div>
              </template>
            </v-data-table>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <!-- Budget Overview -->
          <v-card class="mb-4">
            <v-card-title>Budget Overview</v-card-title>
            <v-divider />
            <v-list>
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-cash-multiple" />
                </template>
                <v-list-item-title>Budget Allocated</v-list-item-title>
                <v-list-item-subtitle>{{ formatCurrency(operation.budgetAllocated) }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-cash-check" />
                </template>
                <v-list-item-title>Budget Utilized</v-list-item-title>
                <v-list-item-subtitle>{{ formatCurrency(operation.budgetUtilized) }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-target" />
                </template>
                <v-list-item-title>Target Value</v-list-item-title>
                <v-list-item-subtitle>{{ operation.targetValue || '-' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-check-circle" />
                </template>
                <v-list-item-title>Actual Value</v-list-item-title>
                <v-list-item-subtitle>{{ operation.actualValue || '-' }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>

          <!-- Financials -->
          <v-card>
            <v-card-title>Financial Records</v-card-title>
            <v-divider />
            <v-list v-if="financials.length > 0">
              <v-list-item v-for="fin in financials" :key="fin.id">
                <v-list-item-title>{{ fin.operations_programs }}</v-list-item-title>
                <v-list-item-subtitle>
                  FY {{ fin.fiscal_year }} {{ fin.quarter ? `- ${fin.quarter}` : '' }}
                </v-list-item-subtitle>
                <template #append>
                  <span class="font-weight-bold">{{ formatCurrency(fin.allotment || 0) }}</span>
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
