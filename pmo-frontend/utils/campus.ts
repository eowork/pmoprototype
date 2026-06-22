/**
 * PHASE BBBC (Task H): campus labels (mirrors the backend Campus enum MAIN/CABADBARAN/BOTH).
 */
export const CAMPUS_OPTIONS: { value: string; title: string }[] = [
  { value: 'MAIN', title: 'Butuan Campus (Main)' },
  { value: 'CABADBARAN', title: 'Cabadbaran Campus' },
  { value: 'BOTH', title: 'Both Campuses' },
]

const _campusLabel = new Map(CAMPUS_OPTIONS.map(o => [o.value, o.title]))

export function labelForCampus(value: string | null | undefined): string {
  if (!value) return '—'
  return _campusLabel.get(value) || value
}
