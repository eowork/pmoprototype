/**
 * Permission Middleware
 *
 * Checks if user has permission to access specific routes.
 * Works in conjunction with auth middleware - auth checks authentication,
 * this checks authorization (role-based access).
 *
 * SECURITY: Backend must still enforce permissions. This is UX enhancement only.
 */
export default defineNuxtRouteMiddleware((to) => {
  const { canManageUsers, isSuperAdmin, canAdd, canEdit } = usePermissions()

  // User management routes: SuperAdmin or Admin with canManageUsers permission
  if (to.path.startsWith('/users')) {
    if (!canManageUsers.value && !isSuperAdmin.value) {
      console.warn('[Permission] Access denied to /users - insufficient permissions')
      return navigateTo('/dashboard')
    }
  }

  // Admin-only routes
  if (to.path.startsWith('/admin')) {
    if (!isSuperAdmin.value && !canManageUsers.value) {
      console.warn('[Permission] Access denied to /admin - insufficient permissions')
      return navigateTo('/dashboard')
    }
  }

  // Project module edit routes - check canEdit permission
  const editRoutePatterns = [
    { pattern: /^\/coi\/edit-/, module: 'coi' },
    { pattern: /^\/repairs\/edit-/, module: 'repairs' },
    { pattern: /^\/university-operations\/edit-/, module: 'university_operations' },
    { pattern: /^\/contractors\/edit-/, module: 'contractors' },
    { pattern: /^\/funding-sources\/edit-/, module: 'funding_sources' },
  ]

  for (const { pattern, module } of editRoutePatterns) {
    if (pattern.test(to.path)) {
      if (!canEdit(module)) {
        console.warn(`[Permission] Access denied to ${to.path} - cannot edit ${module}`)
        return navigateTo('/dashboard')
      }
      break
    }
  }

  // Project module create routes - check canAdd permission
  const createRoutePatterns = [
    { path: '/coi/new', module: 'coi' },
    { path: '/repairs/new', module: 'repairs' },
    { path: '/university-operations/new', module: 'university_operations' },
    { path: '/contractors/new', module: 'contractors' },
    { path: '/funding-sources/new', module: 'funding_sources' },
  ]

  for (const { path, module } of createRoutePatterns) {
    if (to.path === path) {
      if (!canAdd(module)) {
        console.warn(`[Permission] Access denied to ${path} - cannot add ${module}`)
        return navigateTo('/dashboard')
      }
      break
    }
  }
})
