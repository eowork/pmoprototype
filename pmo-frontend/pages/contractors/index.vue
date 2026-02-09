<script setup lang="ts">
import { adaptContractors, type UIContractor, type BackendContractor } from '~/utils/adapters'

definePageMeta({
  middleware: 'auth',
})

const router = useRouter()
const api = useApi()
const toast = useToast()

const contractors = ref<UIContractor[]>([])
const search = ref('')
const loading = ref(true)
const deleting = ref(false)
const deleteDialog = ref(false)
const contractorToDelete = ref<UIContractor | null>(null)

// Table headers
const headers = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Contact Person', key: 'contactPerson', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Phone', key: 'phone', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const },
]

// Navigation
function editContractor(contractor: UIContractor) {
  router.push(`/contractors/edit-${contractor.id}`)
}

function createContractor() {
  router.push('/contractors/new')
}

// Delete confirmation
function confirmDelete(contractor: UIContractor) {
  contractorToDelete.value = contractor
  deleteDialog.value = true
}

async function deleteContractor() {
  if (!contractorToDelete.value) return
  deleting.value = true
  try {
    await api.del(`/api/contractors/${contractorToDelete.value.id}`)
    const deletedName = contractorToDelete.value.name
    contractors.value = contractors.value.filter(c => c.id !== contractorToDelete.value!.id)
    toast.success(`Contractor "${deletedName}" deleted successfully`)
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || 'Failed to delete contractor')
    console.error('Failed to delete contractor:', err)
  } finally {
    deleting.value = false
    deleteDialog.value = false
    contractorToDelete.value = null
  }
}

// Status color mapping
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'success',
    suspended: 'warning',
    blacklisted: 'error',
  }
  return colors[status?.toLowerCase()] || 'grey'
}

// Filtered contractors
const filteredContractors = computed(() => {
  if (!search.value) return contractors.value
  const term = search.value.toLowerCase()
  return contractors.value.filter(
    (c) =>
      c.name.toLowerCase().includes(term) ||
      c.contactPerson.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.status.toLowerCase().includes(term)
  )
})

async function fetchContractors() {
  loading.value = true
  try {
    const response = await api.get<{ data: BackendContractor[] }>('/api/contractors')
    contractors.value = adaptContractors(response.data || [])
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || 'Failed to load contractors')
    console.error('Failed to fetch contractors:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchContractors)
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          Contractors
        </h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          Manage contractor records
        </p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="createContractor">
        New Contractor
      </v-btn>
    </div>

    <!-- Data Table Card -->
    <v-card>
      <!-- Toolbar -->
      <v-card-title class="d-flex align-center pa-4">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search contractors"
          single-line
          hide-details
          density="compact"
          variant="outlined"
          class="mr-4"
          style="max-width: 300px"
        />
        <v-spacer />
        <v-chip color="primary" variant="tonal">
          {{ filteredContractors.length }} contractors
        </v-chip>
      </v-card-title>

      <v-divider />

      <!-- Table -->
      <v-data-table
        :key="contractors.length"
        :headers="headers"
        :items="filteredContractors"
        :loading="loading"
        :search="search"
        item-value="id"
        hover
        class="elevation-0"
      >
        <!-- Name -->
        <template #item.name="{ item }">
          <span class="font-weight-medium">{{ item.name }}</span>
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

        <!-- Actions -->
        <template #item.actions="{ item }">
          <div class="d-flex justify-center ga-1">
            <v-btn icon="mdi-pencil" size="small" variant="text" color="warning" @click="editContractor(item)" />
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
            <v-icon icon="mdi-account-hard-hat" size="64" color="grey-lighten-1" class="mb-4" />
            <p class="text-h6 text-grey-darken-1">No contractors found</p>
            <p class="text-body-2 text-grey">Contractors will appear here once added</p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="text-h6">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete <strong>{{ contractorToDelete?.name }}</strong>?
          This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false" :disabled="deleting">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="deleteContractor" :loading="deleting">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
