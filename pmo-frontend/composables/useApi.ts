export interface ApiError {
  message: string
  statusCode: number
}

export function useApi() {
  const config = useRuntimeConfig()
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  async function request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    loading.value = true
    error.value = null

    try {
      const token = import.meta.client ? localStorage.getItem('access_token') : null

      // In dev mode, use relative URLs (proxy handles routing to backend)
      // In production, use full URL from config
      const baseUrl = config.public.apiBase

      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      })

      // Check content type to detect proxy/routing failures
      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        throw {
          message: 'Backend unreachable. Start backend first: cd pmo-backend && npm run start:dev',
          statusCode: 503,
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw {
          message: errorData.message || `HTTP error ${response.status}`,
          statusCode: response.status,
        }
      }

      return await response.json()
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError
      throw apiError
    } finally {
      loading.value = false
    }
  }

  async function get<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: 'GET' })
  }

  async function post<T>(endpoint: string, data: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async function put<T>(endpoint: string, data: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async function patch<T>(endpoint: string, data: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async function del<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: 'DELETE' })
  }

  return {
    loading,
    error,
    request,
    get,
    post,
    put,
    patch,
    del,
  }
}
