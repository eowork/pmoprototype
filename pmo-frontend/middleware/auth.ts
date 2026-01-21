export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  // Initialize auth store on first navigation
  if (!authStore.user && authStore.token) {
    await authStore.initialize()
  }

  const isAuthenticated = authStore.isAuthenticated

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }
})
