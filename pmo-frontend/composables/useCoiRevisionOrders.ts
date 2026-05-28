/**
 * Phase NF-A (2026-05-21): Composable for COI Revision Orders CRUD.
 */
export interface RevisionOrder {
  id: string
  projectId: string
  revisionNumber: number
  revisionType: string
  revisionDate: string
  newStartDate?: string | null
  newCompletionDate?: string | null
  newDuration?: string | null
  costAdjustment?: string | null
  justification?: string | null
  approvalStatus?: string | null
  movDocumentId?: string | null
  movLink?: string | null
}

export function useCoiRevisionOrders(projectId: Ref<string>) {
  const api = useApi()
  const items = ref<RevisionOrder[]>([])
  const loading = ref(false)

  async function fetch() {
    if (!projectId.value) return
    loading.value = true
    try {
      const res = await api.get<any[]>(`/api/construction-projects/${projectId.value}/revision-orders`)
      items.value = (Array.isArray(res) ? res : []).map(normalize)
    } catch (err) {
      console.error('[useCoiRevisionOrders] fetch failed:', err)
      items.value = []
    } finally {
      loading.value = false
    }
  }

  async function create(payload: Record<string, any>): Promise<RevisionOrder | null> {
    const res = await api.post<any>(`/api/construction-projects/${projectId.value}/revision-orders`, payload)
    await fetch()
    return res ? normalize(res) : null
  }

  async function update(roId: string, payload: Record<string, any>): Promise<RevisionOrder | null> {
    const res = await api.patch<any>(`/api/construction-projects/${projectId.value}/revision-orders/${roId}`, payload)
    await fetch()
    return res ? normalize(res) : null
  }

  async function remove(roId: string): Promise<void> {
    await api.del(`/api/construction-projects/${projectId.value}/revision-orders/${roId}`)
    await fetch()
  }

  function normalize(r: any): RevisionOrder {
    return {
      id: r.id,
      projectId: r.projectId ?? r.project_id,
      revisionNumber: r.revisionNumber ?? r.revision_number,
      revisionType: r.revisionType ?? r.revision_type,
      revisionDate: (r.revisionDate ?? r.revision_date ?? '').slice(0, 10),
      newStartDate: r.newStartDate ?? r.new_start_date ?? null,
      newCompletionDate: r.newCompletionDate ?? r.new_completion_date ?? null,
      newDuration: r.newDuration ?? r.new_duration ?? null,
      costAdjustment: r.costAdjustment ?? r.cost_adjustment ?? null,
      justification: r.justification ?? null,
      approvalStatus: r.approvalStatus ?? r.approval_status ?? null,
      movDocumentId: r.movDocumentId ?? r.mov_document_id ?? null,
      movLink: r.movLink ?? r.mov_link ?? null,
    }
  }

  watch(projectId, fetch, { immediate: true })

  return { items, loading, fetch, create, update, remove }
}
