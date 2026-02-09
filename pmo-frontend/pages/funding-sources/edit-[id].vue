<script setup lang="ts">
import type { BackendFundingSource } from '~/utils/adapters'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const api = useApi()
const toast = useToast()

const loading = ref(true)
const submitting = ref(false)

// Direct ID extraction
const sourceId = route.params.id as string

// Validate ID immediately - redirect if missing
if (!sourceId) {
  console.error('[Funding Source Edit] No ID in route, redirecting to list')
  router.push('/funding-sources')
}

// Form data
const form = ref({
  name: '',
  description: '',
})

// Validation rules
const rules = {
  required: (v: string) => !!v || 'This field is required',
}

// Fetch funding source data
async function fetchData() {
  if (!sourceId) {
    toast.error('Invalid funding source ID')
    loading.value = false
    return
  }

  loading.value = true

  try {
    console.log('[Funding Source Edit] Fetching:', sourceId)
    const response = await api.get<BackendFundingSource>(`/api/funding-sources/${sourceId}`)
    const s = response

    form.value = {
      name: s.name || '',
      description: s.description || '',
    }

    console.log('[Funding Source Edit] Form populated')
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to load funding source data')
    console.error('[Funding Source Edit] Failed to fetch:', err)
  } finally {
    loading.value = false
  }
}

// Submit form
async function handleSubmit() {
  submitting.value = true

  try {
    const payload = {
      name: form.value.name,
      description: form.value.description || undefined,
    }

    console.log('[Funding Source Edit] Submitting:', payload)
    await api.patch(`/api/funding-sources/${sourceId}`, payload)
    toast.success('Funding source updated successfully')
    router.push('/funding-sources')
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to update funding source')
    console.error('[Funding Source Edit] Failed:', err)
  } finally {
    submitting.value = false
  }
}

// Navigation
function goBack() {
  router.push('/funding-sources')
}

onMounted(fetchData)
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center ga-3 mb-4">
      <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" />
      <div>
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          Edit Funding Source
        </h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          Update funding source information
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
            <v-card-title>Funding Source Information</v-card-title>
            <v-divider />
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="form.name"
                    label="Name *"
                    placeholder="e.g., General Appropriations Act (GAA)"
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
                    placeholder="Describe the funding source and its purpose..."
                    rows="4"
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
