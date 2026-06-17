/**
 * PHASE BBBD (Track 10a/10b) — User-management vocabulary, single source of truth.
 *
 * ── CANONICAL TAXONOMY (10a) ─────────────────────────────────────────────────
 * The system has THREE distinct, intentionally-separate concepts. Do not conflate them:
 *
 *   • RANK  (rank_level 10–100) — APPROVAL AUTHORITY / org hierarchy ONLY.
 *           Lower number = higher authority. Governs who may modify whom
 *           (canModifyUser) and approval chains. NOT a CRUD tier.
 *
 *   • ROLE  (SuperAdmin / Admin / Staff / Viewer / Auditor / Contractor) —
 *           coarse IDENTITY tier. SuperAdmin authority is the `user_roles.is_superadmin`
 *           FLAG (not rank 10, not the role name — see R-321).
 *
 *   • LEVEL (Viewer / Contributor / Approver / Manager — utils/accessControl.ts) —
 *           per-MODULE capability granted via access requests / overrides. Governs
 *           CRUD WITHIN a module. "Viewer (role)" ≠ "Viewer (level)" — keep labels distinct.
 *
 * Campus lives in utils/campus.ts. Access levels live in utils/accessControl.ts.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── RANK (approval authority / hierarchy) ──────────────────────────────────────
export const RANK_LABELS: Record<number, { label: string; color: string }> = {
  10: { label: 'SuperAdmin', color: 'deep-purple' },
  15: { label: 'Vice President', color: 'purple' },
  20: { label: 'Division Chief', color: 'indigo' },
  30: { label: 'Director', color: 'blue' },
  40: { label: 'Dean', color: 'cyan' },
  50: { label: 'Chairperson', color: 'teal' },
  60: { label: 'Admin Personnel', color: 'green' },
  70: { label: 'Faculty', color: 'light-green' },
  80: { label: 'Clerk/Staff', color: 'amber' },
  90: { label: 'Student', color: 'orange' },
  100: { label: 'Viewer', color: 'grey' },
}

export function rankLabel(rankLevel: number | null | undefined): string {
  if (rankLevel == null) return 'Unknown'
  return RANK_LABELS[rankLevel]?.label || 'Unknown'
}

export function rankColor(rankLevel: number | null | undefined): string {
  if (rankLevel == null) return 'grey'
  return RANK_LABELS[rankLevel]?.color || 'grey'
}

// Dropdown options for new/edit user forms (derived from RANK_LABELS — single source).
export const RANK_OPTIONS: { value: number; title: string }[] = Object.entries(RANK_LABELS)
  .map(([value, meta]) => ({ value: Number(value), title: `${meta.label} (Rank ${value})` }))
  .sort((a, b) => a.value - b.value)

// ── ROLE (coarse identity tier) ────────────────────────────────────────────────
const ROLE_COLORS: Record<string, string> = {
  SuperAdmin: 'error',
  Admin: 'warning',
  Staff: 'primary',
  Contractor: 'orange',
  Viewer: 'grey',
  Auditor: 'blue-grey',
}

export function roleColor(name: string): string {
  return ROLE_COLORS[name] || 'grey'
}

// ── USER TYPE (institutional classification) ───────────────────────────────────
export const USER_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'CSU_PERSONNEL', label: 'CSU Personnel' },
  { value: 'CONTRACTOR', label: 'Contractor' },
  { value: 'CONSULTANT', label: 'Consultant' },
  { value: 'EXTERNAL_PARTNER', label: 'External Partner' },
  { value: 'SUPPLIER', label: 'Supplier' },
]

const USER_TYPE_COLORS: Record<string, string> = {
  CSU_PERSONNEL: 'primary',
  CONTRACTOR: 'warning',
  CONSULTANT: 'deep-purple',
  EXTERNAL_PARTNER: 'teal',
  SUPPLIER: 'cyan',
}

export function userTypeLabel(type: string): string {
  return USER_TYPE_OPTIONS.find(o => o.value === type)?.label || type || 'CSU Personnel'
}

export function userTypeColor(type: string): string {
  return USER_TYPE_COLORS[type] || 'grey'
}

// ── STATUS ─────────────────────────────────────────────────────────────────────
export function statusColor(isActive: boolean): string {
  return isActive ? 'success' : 'error'
}

export function statusText(isActive: boolean): string {
  return isActive ? 'Active' : 'Inactive'
}
