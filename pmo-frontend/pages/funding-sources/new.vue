<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const router = useRouter()
const api = useApi()
const toast = useToast()

const submitting = ref(false)

// Form data
const form = ref({
  name: '',
  description: '',
})

// Validation rules
const rules = {
  required: (v: string) => !!v || 'This field is required',
}

// Submit form
async function handleSubmit() {
  submitting.value = true

  try {
    const payload = {
      name: form.value.name,
      description: form.value.description || undefined,
    }

    console.log('[Funding Source Create] Submitting:', payload)
    await api.post('/api/funding-sources', payload)
    toast.success('Funding source created successfully')
    router.push('/funding-sources')
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to create funding source')
    console.error('[Funding Source Create] Failed:', err)
  } finally {
    submitting.value = false
  }
}

// Navigation
function goBack() {
  router.push('/funding-sources')
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center ga-3 mb-4">
      <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" />
      <div>
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          New Funding Source
        </h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          Add a new funding source to the system
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
                Create Funding Source
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

          <!-- Help Card -->
          <v-card class="mt-4">
            <v-card-title>
              <v-icon icon="mdi-information" class="mr-2" />
              Info
            </v-card-title>
            <v-divider />
            <v-card-text>
              <p class="text-body-2 text-grey-darken-1">
                Funding sources are used to track where project funds originate from.
                Common examples include:
              </p>
              <ul class="text-body-2 text-grey-darken-1 mt-2">
                <li>General Appropriations Act (GAA)</li>
                <li>Special Purpose Fund</li>
                <li>Income Generated Fund</li>
                <li>External Grants</li>
              </ul>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>
