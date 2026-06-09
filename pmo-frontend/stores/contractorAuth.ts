import { defineStore } from 'pinia'

interface ContractorUser {
  id: string
  email: string
  fullName: string
  companyName?: string
  phone?: string
  position?: string
}

interface ContractorLoginResponse {
  access_token: string
  contractor: ContractorUser
}

export interface InviteValidation {
  inviteId: string
  projectId: string
  projectTitle: string
  projectCampus: string
  projectStatus: string
  targetEmail: string | null
  expiresAt: string
  createdByName: string
  status: string
}

export const useContractorAuthStore = defineStore('contractorAuth', () => {
  const api = useApi()
  const router = useRouter()

  const token = ref<string | null>(null)
  const contractor = ref<ContractorUser | null>(null)

  if (import.meta.client) {
    token.value = localStorage.getItem('contractor_access_token')
    const stored = localStorage.getItem('contractor_user')
    if (stored) {
      try { contractor.value = JSON.parse(stored) } catch { /* ignore */ }
    }
  }

  const isAuthenticated = computed(() => !!token.value)

  async function login(email: string, password: string): Promise<void> {
    const res = await api.post<ContractorLoginResponse>('/api/contractor/auth/login', { email, password })
    _setSession(res)
  }

  async function register(payload: {
    email: string; password: string; fullName: string
    companyName?: string; phone?: string; position?: string; inviteToken?: string
  }): Promise<void> {
    // PJ-E: backend now creates user in unified users table and returns institutional JWT.
    // Do NOT store a contractor session — user authenticates through /login after onboarding.
    await api.post('/api/contractor/auth/register', payload)
  }

  async function validateInvite(token: string): Promise<InviteValidation> {
    return api.get<InviteValidation>(`/api/contractor/auth/invite/${token}`)
  }

  function logout(): void {
    token.value = null
    contractor.value = null
    if (import.meta.client) {
      localStorage.removeItem('contractor_access_token')
      localStorage.removeItem('contractor_user')
    }
    router.push('/login')
  }

  function _setSession(res: ContractorLoginResponse): void {
    token.value = res.access_token
    contractor.value = res.contractor
    if (import.meta.client) {
      localStorage.setItem('contractor_access_token', res.access_token)
      localStorage.setItem('contractor_user', JSON.stringify(res.contractor))
    }
  }

  return { token, contractor, isAuthenticated, login, register, logout, validateInvite }
})
