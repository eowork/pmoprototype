// Shared status-color utility — single source of truth for all status→color mappings.
// Replaces duplicate definitions in coi/index.vue, coi/detail-[id].vue,
// repairs/detail-[id].vue, and university-operations physical/financial pages.

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    proposal: 'info',
    planning: 'info',
    ongoing: 'primary',
    complete: 'success',
    completed: 'success',
    on_hold: 'warning',
    cancelled: 'error',
    delayed: 'orange',
    pending: 'warning',
  }
  return map[status?.toLowerCase()] || 'grey'
}

export function getPublicationStatusColor(status: string): string {
  const map: Record<string, string> = {
    DRAFT: 'grey',
    PENDING_REVIEW: 'orange',
    PUBLISHED: 'success',
    REJECTED: 'error',
    FETCH_ERROR: 'warning',
  }
  return map[status] || 'grey'
}

// Hex palette for ApexCharts — matches Vuetify semantic tokens above.
export const STATUS_HEX: Record<string, string> = {
  ONGOING: '#3b82f6',
  COMPLETE: '#059669',
  COMPLETED: '#059669',
  ON_HOLD: '#f59e0b',
  CANCELLED: '#ef4444',
  PROPOSAL: '#6b7280',
  DELAYED: '#f97316',
}
