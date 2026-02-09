<script setup lang="ts">
import { adaptUniversityOperations, type UIUniversityOperation, type BackendUniversityOperation } from '~/utils/adapters'

definePageMeta({
  middleware: 'auth',
})

const router = useRouter()
const api = useApi()
const toast = useToast()

const operations = ref<UIUniversityOperation[]>([])
const search = ref('')
const loading = ref(true)
const deleting = ref(false)
const deleteDialog = ref(false)
const operationToDelete = ref<UIUniversityOperation | null>(null)

// Table headers
const headers = [
  { title: 'Title', key: 'title', sortable: true },
  { title: 'Type', key: 'operationType', sortable: true },
  { title: 'Campus', key: 'campus', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Budget', key: 'budgetAllocated', sortable: true, align: 'end' as const },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const },
]

// Navigation
function viewOperation(op: UIUniversityOperation) {
  router.push(`/university-operations/detail-${op.id}`)
}

function editOperation(op: UIUniversityOperation) {
  router.push(`/university-operations/edit-${op.id}`)
}

function createOperation() {
  router.push('/university-operations/new')
}

// Delete confirmation
function confirmDelete(op: UIUniversityOperation) {
  operationToDelete.value = op
  deleteDialog.value = true
}

async function deleteOperation() {
  if (!operationToDelete.value) return
  deleting.value = true
  try {
    await api.del(`/api/university-operations/${operationToDelete.value.id}`)
    const deletedTitle = operationToDelete.value.title
    operations.value = operations.value.filter(o => o.id !== operationToDelete.value!.id)
    toast.success(`Operation "${deletedTitle}" deleted successfully`)
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || 'Failed to delete operation')
    console.error('Failed to delete operation:', err)
  } finally {
    deleting.value = false
    deleteDialog.value = false
    operationToDelete.value = null
  }
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

// Filtered operations
const filteredOperations = computed(() => {
  if (!search.value) return operations.value
  const term = search.value.toLowerCase()
  return operations.value.filter(
    (o) =>
      o.title.toLowerCase().includes(term) ||
      o.operationType.toLowerCase().includes(term) ||
      o.campus.toLowerCase().includes(term) ||
      o.status.toLowerCase().includes(term)
  )
})

async function fetchOperations() {
  loading.value = true
  try {
    const response = await api.get<{ data: BackendUniversityOperation[] }>('/api/university-operations')
    operations.value = adaptUniversityOperations(response.data || [])
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || 'Failed to load operations')
    console.error('Failed to fetch operations:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchOperations)
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          University Operations
        </h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          Manage university programs and operations
        </p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="createOperation">
        New Operation
      </v-btn>
    </div>

    <!-- Data Table Card -->
    <v-card>
      <!-- Toolbar -->
      <v-card-title class="d-flex align-center pa-4">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search operations"
          single-line
          hide-details
          density="compact"
          variant="outlined"
          class="mr-4"
          style="max-width: 300px"
        />
        <v-spacer />
        <v-chip color="primary" variant="tonal">
          {{ filteredOperations.length }} operations
        </v-chip>
      </v-card-title>

      <v-divider />

      <!-- Table -->
      <v-data-table
        :key="operations.length"
        :headers="headers"
        :items="filteredOperations"
        :loading="loading"
        :search="search"
        item-value="id"
        hover
        class="elevation-0"
      >
        <!-- Title -->
        <template #item.title="{ item }">
          <span class="font-weight-medium">{{ item.title }}</span>
        </template>

        <!-- Operation Type -->
        <template #item.operationType="{ item }">
          <v-chip size="small" variant="outlined">
            {{ formatOperationType(item.operationType) }}
          </v-chip>
        </template>

        <!-- Status Chip -->
        <template #item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
            variant="tonal"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <!-- Budget -->
        <template #item.budgetAllocated="{ item }">
          {{ formatCurrency(item.budgetAllocated) }}
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <div class="d-flex justify-center ga-1">
            <v-btn icon="mdi-eye" size="small" variant="text" color="info" @click="viewOperation(item)" />
            <v-btn icon="mdi-pencil" size="small" variant="text" color="warning" @click="editOperation(item)" />
            <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="confirmDelete(item)" />
          </div>
        </template>

        <!-- Loading State -->
        <template #loading>
          <v-skeleton-loader type="table-row@5" />
        </template>

        <!-- Empty State -->
        <template #no-data>
          <div class="text-center pa-6">
            <v-icon icon="mdi-folder-open-outline" size="64" color="grey-lighten-1" class="mb-4" />
            <p class="text-h6 text-grey-darken-1">No operations found</p>
            <p class="text-body-2 text-grey">Operations will appear here once added</p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="text-h6">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete <strong>{{ operationToDelete?.title }}</strong>?
          This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false" :disabled="deleting">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="deleteOperation" :loading="deleting">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
