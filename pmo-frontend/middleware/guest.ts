export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  // Redirect authenticated users to dashboard
  if (authStore.isAuthenticated) {
    return navigateTo('/dashboard')
  }
})
