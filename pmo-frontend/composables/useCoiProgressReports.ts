/**
 * Phase NG-A (2026-05-21): Composable for COI Progress Reports CRUD.
 */
export interface ProgressReport {
  id: string
  projectId: string
  reportType: string
  reportDate: string
  reportNumber?: string | null
  percentageCompletion: string
  plannedAccomplishment?: string | null
  slippage?: string | null
  costIncurredToDate?: string | null
  costIncurredThisPeriod?: string | null
  calendarDaysElapsed?: number | null
  percentTimeElapsed?: string | null
  remarks?: string | null
  issuesEncountered?: string | null
  mitigationActions?: string | null
  narrativeList: Array<{ text: string; createdAt: string; author?: string }>
  remarksList: Array<{ text: string; createdAt: string; author?: string }>
  issuesEncounteredList: Array<{ text: string; createdAt: string; author?: string }>
  mitigationActionsList: Array<{ text: string; createdAt: string; author?: string }>
  movDocumentId?: string | null
  movLink?: string | null
}

export function useCoiProgressReports(projectId: Ref<string>) {
  const api = useApi()
  const items = ref<ProgressReport[]>([])
  const loading = ref(false)

  async function fetch() {
    if (!projectId.value) return
    loading.value = true
    try {
      const res = await api.get<any[]>(`/api/construction-projects/${projectId.value}/progress-reports`)
      items.value = (Array.isArray(res) ? res : []).map(normalize)
    } catch (err) {
      console.error('[useCoiProgressReports] fetch failed:', err)
      items.value = []
    } finally {
      loading.value = false
    }
  }

  async function create(payload: Record<string, any>): Promise<ProgressReport | null> {
    const res = await api.post<any>(`/api/construction-projects/${projectId.value}/progress-reports`, payload)
    await fetch()
    return res ? normalize(res) : null
  }

  async function update(reportId: string, payload: Record<string, any>): Promise<ProgressReport | null> {
    const res = await api.patch<any>(`/api/construction-projects/${projectId.value}/progress-reports/${reportId}`, payload)
    await fetch()
    return res ? normalize(res) : null
  }

  async function remove(reportId: string): Promise<void> {
    await api.del(`/api/construction-projects/${projectId.value}/progress-reports/${reportId}`)
    await fetch()
  }

  function normalize(r: any): ProgressReport {
    return {
      id: r.id,
      projectId: r.projectId ?? r.project_id,
      reportType: r.reportType ?? r.report_type,
      reportDate: (r.reportDate ?? r.report_date ?? '').slice(0, 10),
      reportNumber: r.reportNumber ?? r.report_number ?? null,
      percentageCompletion: r.percentageCompletion ?? r.percentage_completion ?? '0.00',
      plannedAccomplishment: r.plannedAccomplishment ?? r.planned_accomplishment ?? null,
      slippage: r.slippage ?? null,
      costIncurredToDate: r.costIncurredToDate ?? r.cost_incurred_to_date ?? null,
      costIncurredThisPeriod: r.costIncurredThisPeriod ?? r.cost_incurred_this_period ?? null,
      calendarDaysElapsed: r.calendarDaysElapsed ?? r.calendar_days_elapsed ?? null,
      percentTimeElapsed: r.percentTimeElapsed ?? r.percent_time_elapsed ?? null,
      remarks: r.remarks ?? null,
      issuesEncountered: r.issuesEncountered ?? r.issues_encountered ?? null,
      mitigationActions: r.mitigationActions ?? r.mitigation_actions ?? null,
      narrativeList: r.narrativeList ?? r.narrative_list ?? [],
      remarksList: r.remarksList ?? r.remarks_list ?? [],
      issuesEncounteredList: r.issuesEncounteredList ?? r.issues_encountered_list ?? [],
      mitigationActionsList: r.mitigationActionsList ?? r.mitigation_actions_list ?? [],
      movDocumentId: r.movDocumentId ?? r.mov_document_id ?? null,
      movLink: r.movLink ?? r.mov_link ?? null,
    }
  }

  watch(projectId, fetch, { immediate: true })

  return { items, loading, fetch, create, update, remove }
}
