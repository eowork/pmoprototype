<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const route = useRoute()
const authStore = useAuthStore()
const api = useApi()

const token = computed(() => route.query.token as string | undefined)
const loading = ref(false)
const error = ref('')
const accepted = ref(false)

async function accept() {
  if (!token.value) { error.value = 'No invite token found in URL.'; return }
  if (!authStore.user?.id) {
    navigateTo(`/contractor/onboarding?token=${token.value}`)
    return
  }
  loading.value = true
  error.value = ''
  try {
    await api.post(`/api/contractor/auth/accept-invite/${token.value}`, {
      contractor_user_id: authStore.user!.id,
    })
    accepted.value = true
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Failed to accept invite.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!token.value) return
  if (!authStore.isAuthenticated) {
    navigateTo(`/contractor/onboarding?token=${token.value}`, { replace: true })
    return
  }
  accept()
})
</script>

<template>
  <v-card elevation="2" rounded="lg">
    <v-card-title class="d-flex align-center ga-2 pa-4 pb-2">
      <v-icon icon="mdi-email-check-outline" color="success" />
      Project Invite
    </v-card-title>
    <v-divider />

    <v-card-text class="pa-4 text-center">
      <template v-if="!token">
        <v-alert type="error" variant="tonal">No invite token found in this URL.</v-alert>
      </template>

      <template v-else-if="accepted">
        <v-icon icon="mdi-check-circle-outline" color="success" size="64" class="mb-3" />
        <div class="text-h6 mb-2">Invite Accepted</div>
        <div class="text-body-2 text-grey mb-4">You have been added to the project.</div>
        <v-btn color="success" to="/dashboard" prepend-icon="mdi-view-dashboard">
          Go to Dashboard
        </v-btn>
      </template>

      <template v-else-if="!authStore.isAuthenticated">
        <v-icon icon="mdi-account-key-outline" color="warning" size="48" class="mb-3" />
        <div class="text-body-1 mb-2">You need an account to accept this invite.</div>
        <div class="text-body-2 text-grey mb-4">Register or sign in to continue.</div>
        <div class="d-flex ga-2 justify-center">
          <v-btn color="warning" :to="`/contractor/onboarding?token=${token}`" prepend-icon="mdi-account-plus">
            Register
          </v-btn>
          <v-btn variant="outlined" :to="`/login?redirect=/contractor/accept-invite%3Ftoken%3D${token}`">
            Sign In
          </v-btn>
        </div>
      </template>

      <template v-else>
        <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4">{{ error }}</v-alert>
        <v-icon icon="mdi-email-check-outline" color="warning" size="48" class="mb-3" />
        <div class="text-body-1 mb-4">Accept this project invite?</div>
        <v-btn color="warning" :loading="loading" prepend-icon="mdi-check" @click="accept">
          Accept Invite
        </v-btn>
      </template>
    </v-card-text>
  </v-card>
</template>
