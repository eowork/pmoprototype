import { defineStore } from 'pinia'

/**
 * VF-A: Project-level permission store (COI module).
 *
 * Loaded once at session start (auth init) so contractor tab/action permissions
 * are stateless at render time — parity with institutional role gates. Maps
 * projectId → permission object (deny-by-default when no explicit grant).
 */
export const useProjectPermissionsStore = defineStore('projectPermissions', () => {
  const api = useApi()

  const permissions = ref<Record<string, Record<string, any>>>({})
  const loaded = ref(false)

  async function fetch(): Promise<void> {
    try {
      const result = await api.get<Record<string, Record<string, any>>>(
        '/api/construction-projects/my-permissions',
      )
      permissions.value = result ?? {}
    } catch {
      permissions.value = {}
    } finally {
      loaded.value = true
    }
  }

  function get(projectId: string): Record<string, any> | null {
    return permissions.value[projectId] ?? null
  }

  function clear(): void {
    permissions.value = {}
    loaded.value = false
  }

  return { permissions, loaded, fetch, get, clear }
})
