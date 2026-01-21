import { defineStore } from 'pinia'
import { adaptUser, type UIUser, type BackendUser } from '~/utils/adapters'

interface LoginResponse {
  access_token: string
  user: BackendUser
}

export const useAuthStore = defineStore('auth', () => {
  const api = useApi()

  // State
  const user = ref<UIUser | null>(null)
  const token = ref<string | null>(null)

  // Initialize token from localStorage (client-side only)
  if (import.meta.client) {
    token.value = localStorage.getItem('access_token')
  }

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const userFullName = computed(() => user.value?.fullName || '')
  const userEmail = computed(() => user.value?.email || '')

  // Actions
  async function login(email: string, password: string): Promise<void> {
    const response = await api.post<LoginResponse>('/api/auth/login', {
      email,
      password,
    })

    token.value = response.access_token
    if (import.meta.client) {
      localStorage.setItem('access_token', response.access_token)
    }
    user.value = adaptUser(response.user)
  }

  async function logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout', {})
    } catch {
      // Ignore logout API errors - clear state anyway
    } finally {
      token.value = null
      user.value = null
      if (import.meta.client) {
        localStorage.removeItem('access_token')
      }
    }
  }

  async function fetchCurrentUser(): Promise<void> {
    if (!token.value) return

    try {
      const backendUser = await api.get<BackendUser>('/api/auth/me')
      user.value = adaptUser(backendUser)
    } catch {
      // Token invalid - clear state
      token.value = null
      user.value = null
      if (import.meta.client) {
        localStorage.removeItem('access_token')
      }
    }
  }

  function hasPermission(permission: string): boolean {
    if (!user.value) return false
    if (user.value.isSuperAdmin) return true
    return user.value.permissions.includes(permission)
  }

  function hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((p) => hasPermission(p))
  }

  // Initialize: fetch user if token exists
  async function initialize(): Promise<void> {
    if (token.value) {
      await fetchCurrentUser()
    }
  }

  return {
    // State
    user,
    token,
    // Getters
    isAuthenticated,
    userFullName,
    userEmail,
    // Actions
    login,
    logout,
    fetchCurrentUser,
    hasPermission,
    hasAnyPermission,
    initialize,
    // Loading state from API
    loading: api.loading,
    error: api.error,
  }
})
