/**
 * PHASE BBBD (Track 10b) — shared user formatting helpers (single source; replaces per-page copies).
 */

/** Date + time, e.g. "Jun 15, 2026, 02:30 PM". Empty → "Never". */
export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return 'Never'
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Date only, e.g. "Jun 15, 2026". Empty or invalid → "—". */
export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  // PHASE BBCH (Track 7, R-378): NaN guard folded in from the now-removed date-utils.formatDate,
  // so this single authoritative formatter tolerates malformed date strings.
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/** "First Last", falling back to the email when names are absent. */
export function fullName(first?: string | null, last?: string | null, email?: string | null): string {
  return [first, last].filter(Boolean).join(' ') || email || '—'
}

/** Up to two uppercase initials, falling back to the first email character. */
export function initials(first?: string | null, last?: string | null, email?: string | null): string {
  const f = first?.charAt(0) || ''
  const l = last?.charAt(0) || ''
  return (f + l).toUpperCase() || (email?.charAt(0).toUpperCase() ?? '?')
}
