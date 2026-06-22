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

  // PHASE BBBC (Track 4): force a password change before any other page when flagged
  // (admin reset to the default key, or a new admin-created account).
  if (authStore.user?.mustChangePassword && to.path !== '/profile' && to.path !== '/login') {
    return navigateTo({ path: '/profile', query: { mustChange: '1' } })
  }

  // PHASE BBBD (Track 5): first-login onboarding — incomplete profiles complete the wizard first.
  // (/profile is allowed so the password-change gate above can resolve.)
  if (
    authStore.user &&
    authStore.user.profileCompleted === false &&
    to.path !== '/onboarding' &&
    to.path !== '/login' &&
    to.path !== '/profile'
  ) {
    return navigateTo('/onboarding')
  }

  // PHASE BBBD (Track 2): throttled live permission refresh so approved access / SuperAdmin
  // changes propagate without re-login. Non-blocking, client-only, self-throttled (≤1/60s).
  if (import.meta.client) {
    void authStore.refreshPermissions()
  }
})
