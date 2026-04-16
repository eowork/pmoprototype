<script setup lang="ts">
// Phase HT: Google OAuth callback page (Directive 207 — no guest middleware)
definePageMeta({
  layout: 'blank',
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const error = ref('')
const loading = ref(true)

onMounted(async () => {
  const token = route.query.token as string | undefined

  if (!token) {
    error.value = 'Authentication failed: no token received. Please try again.'
    loading.value = false
    return
  }

  try {
    await authStore.loginWithToken(decodeURIComponent(token))
    router.push('/dashboard')
  } catch {
    error.value = 'Authentication failed. Your account may not have access. Contact your administrator.'
    loading.value = false
  }
})
</script>

<template>
  <div class="d-flex align-center justify-center" style="min-height: 100vh;">
    <v-card v-if="loading" class="pa-8 text-center" max-width="400">
      <v-progress-circular indeterminate color="primary" size="48" class="mb-4" />
      <p class="text-body-1">Completing sign-in...</p>
    </v-card>
    <v-card v-else class="pa-8 text-center" max-width="400">
      <v-icon icon="mdi-alert-circle-outline" color="error" size="48" class="mb-4" />
      <p class="text-body-1 text-error">{{ error }}</p>
      <v-btn color="primary" variant="text" class="mt-4" to="/login">Return to Login</v-btn>
    </v-card>
  </div>
</template>
