export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  // Initialize auth store only on page refresh (token exists but user not loaded)
  // Skip if user already loaded (e.g., after login which populates user directly)
  if (authStore.token && !authStore.user) {
    await authStore.initialize()
  }

  // Redirect unauthenticated users to login
  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }
})
