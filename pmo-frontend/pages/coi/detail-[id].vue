<script setup lang="ts">
import { adaptProjectDetail, adaptGalleryItem, type UIProjectDetail, type BackendProjectDetail, type BackendGalleryItem, type UIGalleryItem, type PublicationStatus } from '~/utils/adapters'
import { PERSONNEL_GROUPS, KEY_DOC_TYPECODES } from '~/utils/coiFormState'
import { labelForSdg } from '~/utils/coiHierarchies'
import { useCoiProgressReports, type ProgressReport } from '~/composables/useCoiProgressReports'
import CiDocumentChecklist from '~/components/coi/CiDocumentChecklist.vue'
import CiPersonnelAccessCard from '~/components/coi/CiPersonnelAccessCard.vue'
import CiAuditLogPanel from '~/components/coi/CiAuditLogPanel.vue'
import CiAttachmentHub from '~/components/coi/CiAttachmentHub.vue'

definePageMeta({
  middleware: ['auth', 'permission'],
})

const route = useRoute()
const router = useRouter()
const api = useApi()
const toast = useToast()
const { isAdmin, isStaff, canEdit } = usePermissions()
const authStore = useAuthStore()

const project = ref<UIProjectDetail | null>(null)
// KC-E: per-record access logic delegated to composable (canEditCurrentProject, isOwnerOrAssigned)
const { canEditCurrentProject, isOwnerOrAssigned, canEditAnyTab, effectivePermissions, myAssignment, isContractor: isContractorUser, accessResolved, canViewTab } = useCoiAccess(project)
const loading = ref(true)

// JR-B: Tab navigation (read-only, freely navigable per JR-D1)
const activeTab = ref('overview')

// SB-B: tab visibility for assigned users with explicit permissions
const DETAIL_TAB_PERM_MAP: Record<string, string> = {
  overview:   'tabProjectProfile',
  progress:   'tabProgressReport',
  documents:  'tabAttachments',
  team:       'tabPersonnel',
  others:     'tabOthers',
}

// WC-B: tab visibility delegated to the centralized engine (useCoiAccess.canViewTab).
// Fail-closed: nothing renders until accessResolved (filter-before-render).
const isTabVisible = computed(() => {
  return (tabValue: string): boolean => {
    if (!accessResolved.value) return false
    if (tabValue === 'analytics') return true
    const permKey = DETAIL_TAB_PERM_MAP[tabValue]
    return permKey ? canViewTab(permKey) : true
  }
})

// SC-B: redirect activeTab when it becomes hidden after permissions load
const DETAIL_TAB_ORDER = ['overview', 'progress', 'analytics', 'documents', 'team', 'others'] as const

watch(
  () => DETAIL_TAB_ORDER.filter(t => isTabVisible.value(t)),
  (visibleTabs) => {
    if (visibleTabs.length > 0 && !visibleTabs.includes(activeTab.value as any)) {
      activeTab.value = visibleTabs[0]
    }
  },
  { immediate: false },
)

// OU-C: unified overview panels (0 = Project Profile, 2 = Progress & Reports open by default)
// FFF-A: default-open all overview panels (8-panel grid)
const overviewPanels = ref([0, 1, 2, 3, 4, 5, 6, 7])

// KU-A: Per-project audit trail
const auditLogs = ref<any[]>([])
const auditTotal = ref(0)
const auditLoading = ref(false)
const auditLoaded = ref(false)

async function loadAuditTrail() {
  if (!projectId) return
  auditLoading.value = true
  try {
    const res = await api.get<{ data: any[]; total: number }>(
      `/api/activity-logs/CONSTRUCTION_PROJECT/${projectId}?pageSize=25`,
    )
    auditLogs.value = res.data || []
    auditTotal.value = res.total || 0
    auditLoaded.value = true
  } catch (err) {
    console.error('[Audit Trail] Failed to load:', err)
  } finally {
    auditLoading.value = false
  }
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'success',
  UPDATE: 'primary',
  DELETE: 'error',
  SUBMIT: 'info',
  PUBLISH: 'primary',
  REJECT: 'warning',
  WITHDRAW: 'grey',
  UPLOAD: 'teal',
  REMOVE_ATTACHMENT: 'error',
}

function auditActionColor(action: string): string {
  return ACTION_COLORS[action] || 'grey'
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ACE-R15 Tier 3: Direct ID extraction (no computed, no watchEffect)
// Dynamic route [id] means ID is static after mount - no reactivity needed
const projectId = route.params.id as string

// QQQ-G: Latest progress report for overview monitoring dashboard
const projectIdRef = computed(() => projectId)
const { items: progressReportItems, loading: prLoading } = useCoiProgressReports(projectIdRef)
const latestReport = computed<ProgressReport | null>(() => progressReportItems.value[0] ?? null)

// Validate ID immediately - redirect if missing
if (!projectId) {
  console.error('[COI Detail] No project ID in route, redirecting to list')
  router.push('/coi')
}

// MG / MF: Status color mapping covers canonical and legacy values.
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PROPOSAL: 'info',
    PLANNING: 'info',     // legacy
    ONGOING: 'primary',
    COMPLETE: 'success',
    COMPLETED: 'success', // legacy
    ON_HOLD: 'warning',
    CANCELLED: 'error',
  }
  return colors[status] || 'grey'
}

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format date
function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Fetch project using direct ID (not computed)
async function fetchProject() {
  if (!projectId) {
    toast.error('Invalid project ID')
    loading.value = false
    return
  }

  try {
    loading.value = true
    console.log('[COI Detail] Fetching project:', projectId)
    const response = await api.get<BackendProjectDetail>(`/api/construction-projects/${projectId}`)
    project.value = adaptProjectDetail(response)
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    toast.error(apiError.message || 'Failed to load project details')
    console.error('[COI Detail] Failed to fetch project:', err)
  } finally {
    loading.value = false
  }
}

// Navigation
function goBack() {
  router.push('/coi')
}

function editProject() {
  router.push(`/coi/edit-${projectId}`)
}

// JV-B + JU-E: Contextual Viewâ†’Edit tab mapping (post-restructure tabs)
const TAB_MAP: Record<string, string> = {
  overview: 'basic',
  gallery: 'documents',     // gallery uploads live in edit "Documents" tab attachments area
  documents: 'documents',
  team: 'personnel',
  analytics: 'basic',
}

function editSection(detailTab: string) {
  const editTab = TAB_MAP[detailTab] || 'basic'
  router.push(`/coi/edit-${projectId}?tab=${editTab}`)
}

// Draft Workflow State
const workflowDialog = ref(false)
const workflowAction = ref<'submit' | 'publish' | 'reject' | 'withdraw'>('submit')
const rejectionNotes = ref('')
const workflowProcessing = ref(false)

// Check if current user is the owner, delegate, or assigned (Phase BK)
// Show Submit/Resubmit for Review: Staff or assigned user who owns/is assigned to a DRAFT or REJECTED record
const canSubmitForReview = computed(() => {
  if (!project.value) return false
  if (!isStaff.value && !isOwnerOrAssigned.value) return false
  if (!isOwnerOrAssigned.value) return false
  return (
    project.value.publicationStatus === 'DRAFT'
    || project.value.publicationStatus === 'REJECTED'
  )
})

// Show Withdraw button: Original submitter viewing PENDING_REVIEW
const canWithdraw = computed(() => {
  if (!project.value) return false
  if (project.value.publicationStatus !== 'PENDING_REVIEW') return false
  return project.value.approvalMetadata?.submittedBy === authStore.user?.id
})

// Show Publish/Reject buttons: Admin viewing PENDING_REVIEW
const canPublishOrReject = computed(() => {
  if (!project.value) return false
  return isAdmin.value && project.value.publicationStatus === 'PENDING_REVIEW'
})

// Show Edit button: Must be owner/assigned or Admin
// Editing PENDING_REVIEW reverts to DRAFT automatically (Phase W)
// Publication status helpers
function getPublicationStatusColor(status: PublicationStatus): string {
  const colors: Record<PublicationStatus, string> = {
    DRAFT: 'grey',
    PENDING_REVIEW: 'orange',
    PUBLISHED: 'success',
    REJECTED: 'error',
  }
  return colors[status] || 'grey'
}

function getPublicationStatusLabel(status: PublicationStatus): string {
  const labels: Record<PublicationStatus, string> = {
    DRAFT: 'Draft',
    PENDING_REVIEW: 'Pending Review',
    PUBLISHED: 'Published',
    REJECTED: 'Rejected',
  }
  return labels[status] || status
}

// Workflow actions
function openSubmitDialog() {
  workflowAction.value = 'submit'
  workflowDialog.value = true
}

function openPublishDialog() {
  workflowAction.value = 'publish'
  workflowDialog.value = true
}

function openRejectDialog() {
  workflowAction.value = 'reject'
  rejectionNotes.value = ''
  workflowDialog.value = true
}

function openWithdrawDialog() {
  workflowAction.value = 'withdraw'
  workflowDialog.value = true
}

async function executeWorkflowAction() {
  workflowProcessing.value = true
  try {
    if (workflowAction.value === 'submit') {
      await api.post(`/api/construction-projects/${projectId}/submit-for-review`, {})
      toast.success('Submitted for review successfully')
    } else if (workflowAction.value === 'publish') {
      await api.post(`/api/construction-projects/${projectId}/publish`, {})
      toast.success('Project published successfully')
    } else if (workflowAction.value === 'reject') {
      await api.post(`/api/construction-projects/${projectId}/reject`, { notes: rejectionNotes.value })
      toast.success('Project rejected')
    } else if (workflowAction.value === 'withdraw') {
      await api.post(`/api/construction-projects/${projectId}/withdraw`, {})
      toast.success('Submission withdrawn successfully')
    }
    // Refresh project data
    await fetchProject()
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast.error(error.message || `Failed to ${workflowAction.value}`)
    console.error(`Workflow action failed:`, err)
  } finally {
    workflowProcessing.value = false
    workflowDialog.value = false
    rejectionNotes.value = ''
  }
}

// Gallery state (Phase JB â€” view only after KE-F)
const gallery = ref<UIGalleryItem[]>([])
const loadingGallery = ref(false)

// KF-AB: PROFILE images displayed in Overview tab
const profileImages = computed(() => gallery.value.filter(g => g.category === 'PROFILE'))
// FFF-A: carousel source — prefer full gallery, fall back to curated profile images
const carouselImages = computed(() => (gallery.value.length ? gallery.value : profileImages.value))

// KJ-A: Recent non-PROFILE gallery images for overview preview strip (max 6)
const recentGalleryImages = computed(() =>
  gallery.value.filter(g => g.category !== 'PROFILE').slice(0, 6)
)

// ZQ: General gallery (non-PROFILE) for the merged Attachments tab
const generalGalleryImages = computed(() => gallery.value.filter(g => g.category !== 'PROFILE'))

// ZQ: Global attachment filter
const attachmentFilter = ref('')
function attachmentMatches(text: string | undefined): boolean {
  if (!attachmentFilter.value) return true
  return (text ?? '').toLowerCase().includes(attachmentFilter.value.toLowerCase())
}

async function fetchGallery() {
  if (!projectId) return
  loadingGallery.value = true
  try {
    const res = await api.get<{ data: BackendGalleryItem[] }>(`/api/construction-projects/${projectId}/gallery`)
    gallery.value = (res.data || []).map(adaptGalleryItem)
  } catch (err) {
    console.error('[COI Detail] Failed to fetch gallery:', err)
  } finally {
    loadingGallery.value = false
  }
}

function formatRate(value: number): string {
  return `${(value || 0).toFixed(2)}%`
}

// ===========================================================
// Phase JN-D: Documents (files + external links)
// ===========================================================
interface DocumentItem {
  id: string
  documentType: string
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  description?: string
  category?: string
  createdAt: string
  // KO-G: additional metadata surfaced for document detail modal
  version?: number
  lifecycleStatus?: string
  uploadedBy?: string
}

const documents = ref<DocumentItem[]>([])
const loadingDocuments = ref(false)

// KD-D: Personnel category groups for Team tab.
const groupedPersonnel = computed(() => {
  const users = (project.value?.assignedUsers || []) as Array<any>
  return PERSONNEL_GROUPS.map(g => ({
    ...g,
    users: users.filter((u) => {
      const cat = u.personnelCategory ?? u.personnel_category ?? null
      if (g.code === '__UNCATEGORIZED__') return !cat
      return cat === g.code
    }),
  }))
})

// KC-D: Document preview type registry â€” used by Overview "Key Documents" panel
// to surface compliance status for the four most-audited document categories.
const DOCUMENT_PREVIEW_TYPES = [
  { key: 'project_profile',        label: 'Project Profile',           match: ['profile', 'project profile'] },
  { key: 'feasibility_study',      label: 'Feasibility Study',         match: ['feasibility'] },
  { key: 'program_of_works',       label: 'Program of Works (POW)',    match: ['pow', 'program of works', 'bill of quantities', 'boq'] },
  { key: 'certificate_completion', label: 'Certificate of Completion', match: ['certificate', 'completion'] },
]

function findDocumentPreview(docs: DocumentItem[], typeKey: string): DocumentItem | null {
  const type = DOCUMENT_PREVIEW_TYPES.find(t => t.key === typeKey)
  if (!type) return null
  return docs.find(doc => {
    const haystack = `${doc.documentType || ''} ${doc.fileName || ''}`.toLowerCase()
    return type.match.some(m => haystack.includes(m))
  }) || null
}

// File upload dialog state â€” removed in KE-F (Detail page is view-only; upload via Edit Project Details)

async function fetchDocuments() {
  if (!projectId) return
  loadingDocuments.value = true
  try {
    const res = await api.get<{ data: DocumentItem[] }>(
      `/api/construction-projects/${projectId}/documents`
    )
    documents.value = res.data || []
  } catch (err) {
    console.error('[COI Detail] Failed to fetch documents:', err)
  } finally {
    loadingDocuments.value = false
  }
}

async function uploadDocFile() {
  // Removed in KE-F â€” upload only via Edit Project Details.
}

async function submitDriveLink() {
  // Removed in KE-F â€” upload and link creation only via Edit Project Details.
}

function isDriveLink(doc: DocumentItem): boolean {
  return doc.mimeType === 'application/x-google-drive-link'
}

// JR-B: Split documents into files vs links for FILES/LINKS sections
const documentFiles = computed(() => documents.value.filter(d => !isDriveLink(d)))
const documentLinks = computed(() => documents.value.filter(d => isDriveLink(d)))

// KM-D: Group files by documentType for accordion display
const documentsByType = computed(() => {
  const grouped = new Map<string, typeof documentFiles.value>()
  for (const doc of documentFiles.value) {
    const type = doc.documentType || 'Other'
    if (!grouped.has(type)) grouped.set(type, [])
    grouped.get(type)!.push(doc)
  }
  return grouped
})

// KR-B: Key executive documents â€” curated subset of documentFiles by typeCode (KV-E1: shared const from coiFormState)
const keyDocuments = computed(() =>
  documentFiles.value.filter(d => (KEY_DOC_TYPECODES as readonly string[]).includes(d.documentType || ''))
)

// JW-B: Render facilities (newline-separated text) as bullet list per client prototype contract
const facilitiesList = computed(() => {
  const raw = project.value?.facilities
  if (!raw || typeof raw !== 'string') return []
  return raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
})

// JT-F-2: Financial summary roll-up (sum across fiscal years).
const financialSummary = computed(() => {
  const records = project.value?.financials ?? []
  const totals = records.reduce(
    (acc, r) => {
      acc.appropriation += Number(r.appropriation || 0)
      acc.obligation += Number(r.obligation || 0)
      acc.disbursement += Number(r.disbursement || 0)
      return acc
    },
    { appropriation: 0, obligation: 0, disbursement: 0 },
  )
  const utilization = totals.appropriation > 0 ? (totals.obligation / totals.appropriation) * 100 : 0
  return { ...totals, utilization }
})

// KE-A.2: Initials avatar helper for personnel group cards.
function initials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function formatFileSize(bytes: number): string {
  if (!bytes) return 'â€”'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

// KN-A: Per-milestone detail modal
const selectedMilestone = ref<any>(null)
const milestoneDetailDialogOpen = ref(false)
function openMilestoneDetail(m: any) {
  selectedMilestone.value = m
  milestoneDetailDialogOpen.value = true
}

// PPP-E: Milestone client-side search/filter/sort
const milestoneSearch = ref('')
const milestoneStatusFilter = ref<string | null>(null)
const milestoneSortKey = ref<'targetDate' | 'progress' | 'name'>('targetDate')

const filteredMilestones = computed(() => {
  let ms = [...(project.value?.milestones ?? [])]
  if (milestoneSearch.value) {
    const q = milestoneSearch.value.toLowerCase()
    ms = ms.filter(m => (m.name || '').toLowerCase().includes(q))
  }
  if (milestoneStatusFilter.value) {
    ms = ms.filter(m => (m.status || '').toUpperCase() === milestoneStatusFilter.value)
  }
  ms.sort((a, b) => {
    if (milestoneSortKey.value === 'progress') return (b.progress ?? 0) - (a.progress ?? 0)
    if (milestoneSortKey.value === 'name') return (a.name || '').localeCompare(b.name || '')
    const da = a.targetDate ? new Date(a.targetDate).getTime() : Infinity
    const db = b.targetDate ? new Date(b.targetDate).getTime() : Infinity
    return da - db
  })
  return ms
})

function getMilestoneStatusColor(status: string): string {
  const map: Record<string, string> = {
    COMPLETED: 'success',
    IN_PROGRESS: 'primary',
    DELAYED: 'error',
    PENDING: 'grey',
    CANCELLED: 'warning',
  }
  return map[status] || 'grey'
}

// TTT-B: executive milestone summary for the overview + progress analytics header
const milestoneSummary = computed(() => {
  const ms = project.value?.milestones ?? []
  const norm = (s?: string) => (s || '').toUpperCase()
  const completed = ms.filter((m: any) => norm(m.status) === 'COMPLETED').length
  const delayed = ms.filter((m: any) => norm(m.status) === 'DELAYED').length
  const ongoing = ms.filter((m: any) => norm(m.status) === 'IN_PROGRESS').length
  const now = Date.now()
  const upcoming = ms
    .filter((m: any) => m.targetDate && new Date(m.targetDate).getTime() >= now && norm(m.status) !== 'COMPLETED')
    .sort((a: any, b: any) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())[0] ?? null
  return { total: ms.length, completed, ongoing, delayed, upcoming }
})

// TTT-B: most-recently-updated milestone (Recent Activity row)
const latestMilestoneUpdate = computed(() => {
  const ms = [...(project.value?.milestones ?? [])]
  return ms
    .filter((m: any) => m.updatedAt || m.targetDate)
    .sort((a: any, b: any) => {
      const da = new Date(a.updatedAt || a.targetDate).getTime()
      const db = new Date(b.updatedAt || b.targetDate).getTime()
      return db - da
    })[0] ?? null
})

// LA-G: Progress summary metrics for milestone and report cards
const progressSummary = computed(() => {
  const totalMs = project.value?.milestones?.length ?? 0
  const completedMs = (project.value?.milestones || []).filter((m: any) => m.status === 'COMPLETED').length
  const msRate = totalMs > 0 ? Math.round((completedMs / totalMs) * 100) : 0
  const physical = project.value?.physicalProgress ?? 0
  const targetPhysical = project.value?.targetPhysicalProgress ?? 100
  const financial = project.value?.financialProgress ?? 0
  const targetFinancial = project.value?.targetFinancialProgress ?? 100
  const target = project.value?.targetCompletionDate
  const daysRemaining = target
    ? Math.ceil((new Date(target).getTime() - Date.now()) / 86400000)
    : null
  return { physical, targetPhysical, financial, targetFinancial, msRate, totalMs, completedMs, daysRemaining }
})

// EEE-C: dashboard summary financials — sum per-FY financials, fallback to contract amount.
const dashFinancials = computed(() => {
  const financials: any[] = project.value?.financials || []
  const appropr = financials.reduce((s: number, f: any) => s + (Number(f.appropriation) || 0), 0)
    || (Number(project.value?.totalContractAmount) || 0)
  const oblig = financials.reduce((s: number, f: any) => s + (Number(f.obligation) || 0), 0)
  const disb = financials.reduce((s: number, f: any) => s + (Number(f.disbursement) || 0), 0)
  return {
    appropriation: appropr,
    obligationPct: appropr ? Math.min((oblig / appropr) * 100, 100) : 0,
    disbursementPct: appropr ? Math.min((disb / appropr) * 100, 100) : 0,
  }
})

// KN-D: Per-document detail modal
const selectedDoc = ref<DocumentItem | null>(null)
const docDetailDialogOpen = ref(false)
function openDocDetail(doc: DocumentItem) {
  selectedDoc.value = doc
  docDetailDialogOpen.value = true
}

// KN-F: Documents overflow window state + computed
const docsWindowOpen = ref(false)
const docsWindowSearch = ref('')
const docsWindowCategoryFilter = ref('ALL')
const docsWindowSort = ref<'newest' | 'oldest'>('newest')
const filteredAllDocs = computed(() => {
  let result = documentFiles.value
  if (docsWindowSearch.value) {
    const q = docsWindowSearch.value.toLowerCase()
    result = result.filter(d =>
      (d.fileName ?? '').toLowerCase().includes(q) ||
      (d.description ?? '').toLowerCase().includes(q)
    )
  }
  if (docsWindowCategoryFilter.value !== 'ALL') {
    result = result.filter(d => (d.documentType || 'Other') === docsWindowCategoryFilter.value)
  }
  return docsWindowSort.value === 'newest'
    ? [...result].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    : [...result].sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''))
})
const docsWindowCategories = computed(() => {
  const set = new Set<string>()
  documentFiles.value.forEach(d => set.add(d.documentType || 'Other'))
  return ['ALL', ...Array.from(set).sort()]
})

// KW-B2 / LA-E: Profile image fullscreen preview (with metadata)
const profilePreviewImg        = ref('')
const profilePreviewTitle      = ref('')
const profilePreviewDate       = ref('')   // LD-B: image taken date (preferred)
const profilePreviewUploadDate = ref('')   // LD-B: server upload date (secondary)
const profilePreviewOpen       = ref(false)

// KV-D3: persist group remarks via PATCH /api/construction-projects/:id/document-remarks
async function handleRemarksUpdate(groupCode: string, remarks: string) {
  try {
    await api.patch(`/api/construction-projects/${projectId}/document-remarks`, { groupCode, remarks })
    if (project.value) {
      project.value.documentChecklistRemarks = { ...project.value.documentChecklistRemarks, [groupCode]: remarks }
    }
  } catch (err) {
    console.error('[COI Detail] Failed to save remarks:', err)
  }
}

// ZV: Admin document type template management
interface DocTypeRow {
  id: string
  groupCode: string
  groupLabel: string
  typeCode: string
  typeLabel: string
  isRequired: boolean
  sortOrder: number
  templateUrl?: string | null
}

const docTypes = ref<DocTypeRow[]>([])
const docTypesLoaded = ref(false)
const templateUploadingFor = ref<string | null>(null)
const templateInputRefs = reactive<Record<string, HTMLInputElement | null>>({})

function triggerTemplateUpload(typeId: string) {
  templateInputRefs[typeId]?.click()
}

function onTemplateFileChange(t: DocTypeRow, event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) uploadTemplate(t, file)
  ;(event.target as HTMLInputElement).value = ''
}

async function fetchDocTypes() {
  if (docTypesLoaded.value) return
  try {
    const res = await api.get<any>('/api/construction-projects/document-types')
    const list: any[] = Array.isArray(res) ? res : (res?.data ?? [])
    docTypes.value = list as DocTypeRow[]
    docTypesLoaded.value = true
  } catch (err) {
    console.error('[detail] fetchDocTypes failed:', err)
  }
}

const docTypesByGroup = computed(() => {
  const groups: Record<string, { label: string; items: DocTypeRow[] }> = {}
  for (const t of docTypes.value) {
    if (!groups[t.groupCode]) groups[t.groupCode] = { label: t.groupLabel, items: [] }
    groups[t.groupCode].items.push(t)
  }
  return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]))
})

async function uploadTemplate(docType: DocTypeRow, file: File) {
  templateUploadingFor.value = docType.id
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await api.upload<any>(
      `/api/construction-projects/document-types/${docType.id}/template`,
      fd,
    )
    const updated = docTypes.value.find(t => t.id === docType.id)
    if (updated && res?.templateUrl) updated.templateUrl = res.templateUrl
    toast.success(`Template uploaded for "${docType.typeLabel}"`)
  } catch (err: unknown) {
    toast.error((err as { message?: string })?.message || 'Upload failed')
  } finally {
    templateUploadingFor.value = null
  }
}

watch(activeTab, (tab) => {
  if (tab === 'others' && isAdmin.value) fetchDocTypes()
})

// ACE-R15 Tier 3: Simple onMounted (no watchEffect complexity)
onMounted(() => {
  console.log('[COI Detail] Mounted with ID:', projectId)
  fetchProject()
  fetchGallery()
  fetchDocuments()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div class="d-flex align-center ga-3">
        <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" />
        <div>
          <h1 class="text-h4 font-weight-bold text-grey-darken-3">
            {{ project?.projectName || 'Project Details' }}
          </h1>
          <p class="text-subtitle-1 text-grey-darken-1">
            {{ project?.projectCode || '' }}
          </p>
        </div>
      </div>
      <div class="d-flex ga-2">
        <!-- Draft Workflow Buttons -->
        <v-btn
          v-if="canSubmitForReview"
          color="orange"
          prepend-icon="mdi-send"
          :disabled="loading"
          @click="openSubmitDialog"
        >
          Submit for Review
        </v-btn>
        <v-btn
          v-if="canWithdraw"
          color="orange"
          variant="outlined"
          prepend-icon="mdi-undo"
          :disabled="loading"
          @click="openWithdrawDialog"
        >
          Withdraw
        </v-btn>
        <v-btn
          v-if="canPublishOrReject"
          color="success"
          prepend-icon="mdi-check-circle"
          :disabled="loading"
          @click="openPublishDialog"
        >
          Publish
        </v-btn>
        <v-btn
          v-if="canPublishOrReject"
          color="error"
          variant="outlined"
          prepend-icon="mdi-close-circle"
          :disabled="loading"
          @click="openRejectDialog"
        >
          Reject
        </v-btn>
        <v-btn v-if="canEditAnyTab" color="primary" prepend-icon="mdi-pencil" :disabled="loading" @click="editProject">
          Edit Project Details
        </v-btn>
      </div>
    </div>

    <!-- Loading State -->
    <v-card v-if="loading" class="pa-6">
      <v-skeleton-loader type="article, table" />
    </v-card>

    <!-- Project Details (Tabbed) -->
    <template v-else-if="project">
      <!-- KD-B: Guide card -->
      <CiProjectGuideCard
        page-key="detail"
        title="Project Details Navigation"
        :content="[
          'Use tabs to navigate sections',
          'Overview: executive summary and KPIs',
          'Analytics: charts and progress visualizations',
          'Team: personnel and governance roles',
        ]"
      />
      <!-- OU-B: Enterprise summary card -->
      <v-card v-if="project" elevation="1" rounded="lg" class="mb-4">
        <v-card-text class="pa-4">
          <v-row dense align="center">
            <v-col cols="12" sm="6" md="4">
              <div class="text-caption text-grey-darken-1 font-weight-medium text-uppercase">Project Status</div>
              <v-chip :color="getStatusColor(project.status)" variant="tonal" size="small" class="mt-1">{{ project.status }}</v-chip>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <div class="text-caption text-grey-darken-1 font-weight-medium text-uppercase">Contract Amount</div>
              <div class="text-body-1 font-weight-bold">{{ formatCurrency(project.totalContractAmount) }}</div>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <div class="text-caption text-grey-darken-1 font-weight-medium text-uppercase">Physical Progress</div>
              <div class="d-flex align-center ga-2 mt-1">
                <v-progress-linear :model-value="progressSummary.physical" height="8" rounded color="info" bg-color="grey-lighten-3" style="max-width: 120px" />
                <span class="text-body-2 font-weight-medium">{{ progressSummary.physical?.toFixed(1) ?? 'â€”' }}%</span>
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <div class="text-caption text-grey-darken-1 font-weight-medium text-uppercase">Financial Utilization</div>
              <div class="d-flex align-center ga-2 mt-1">
                <v-progress-linear :model-value="progressSummary.financial" height="8" rounded color="success" bg-color="grey-lighten-3" style="max-width: 120px" />
                <span class="text-body-2 font-weight-medium">{{ progressSummary.financial?.toFixed(1) ?? 'â€”' }}%</span>
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <div class="text-caption text-grey-darken-1 font-weight-medium text-uppercase">Target Completion</div>
              <div class="text-body-2">{{ formatDate(project.targetCompletionDate) || 'â€”' }}</div>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <div class="text-caption text-grey-darken-1 font-weight-medium text-uppercase">Days Remaining</div>
              <div class="text-body-2" :class="progressSummary.daysRemaining != null && progressSummary.daysRemaining < 0 ? 'text-error font-weight-bold' : ''">
                {{ progressSummary.daysRemaining != null ? `${progressSummary.daysRemaining} days` : 'â€”' }}
              </div>
            </v-col>
          </v-row>

          <!-- DDD-D: Quick-access strip — at-a-glance counts + tab deep-links -->
          <v-divider class="my-3" />
          <div class="d-flex flex-wrap align-center ga-2">
            <span class="text-caption text-grey-darken-1 font-weight-medium text-uppercase mr-1">Quick Access</span>
            <v-chip
              v-if="isTabVisible('documents')"
              size="small" variant="tonal" color="primary" prepend-icon="mdi-paperclip"
              @click="activeTab = 'documents'"
            >
              Documents ({{ documents.length }})
            </v-chip>
            <v-chip
              v-if="isTabVisible('progress')"
              size="small" variant="tonal" color="info" prepend-icon="mdi-flag-checkered"
              @click="activeTab = 'progress'"
            >
              Milestones ({{ project?.milestones?.filter((m: any) => m.status?.toUpperCase() === 'COMPLETED').length ?? 0 }}/{{ project?.milestones?.length ?? 0 }})
            </v-chip>
            <v-chip
              v-if="isTabVisible('team')"
              size="small" variant="tonal" color="teal" prepend-icon="mdi-account-group-outline"
              @click="activeTab = 'team'"
            >
              Team
            </v-chip>
            <v-chip
              size="small" variant="tonal" color="blue-grey" prepend-icon="mdi-image-multiple"
              @click="activeTab = isTabVisible('documents') ? 'documents' : activeTab"
            >
              Gallery ({{ gallery.length }})
            </v-chip>
          </div>
        </v-card-text>
      </v-card>

      <!-- EEE-C: Dashboard summary panel (additive; accordion + tabs untouched) -->
      <v-expansion-panels v-if="project" class="mb-4" variant="accordion">
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center ga-2">
              <v-icon icon="mdi-view-dashboard-outline" size="small" />
              <span class="text-body-2 font-weight-medium">Dashboard Summary</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-row dense>
              <!-- Financial bar -->
              <v-col cols="12" md="5">
                <div class="text-caption text-grey-darken-1 font-weight-medium mb-2">Financials</div>
                <div v-if="dashFinancials.appropriation">
                  <div class="d-flex justify-space-between text-caption mb-1">
                    <span>Contract / Appropriation</span><span>{{ formatCurrency(dashFinancials.appropriation) }}</span>
                  </div>
                  <v-progress-linear :model-value="100" height="6" rounded color="teal" class="mb-2" />
                  <div class="d-flex justify-space-between text-caption mb-1">
                    <span>Obligation</span><span>{{ dashFinancials.obligationPct.toFixed(1) }}%</span>
                  </div>
                  <v-progress-linear :model-value="dashFinancials.obligationPct" height="6" rounded color="info" class="mb-2" />
                  <div class="d-flex justify-space-between text-caption mb-1">
                    <span>Disbursement</span><span>{{ dashFinancials.disbursementPct.toFixed(1) }}%</span>
                  </div>
                  <v-progress-linear :model-value="dashFinancials.disbursementPct" height="6" rounded color="success" />
                </div>
                <div v-else class="text-caption text-grey">No financial data.</div>
              </v-col>

              <!-- Milestone progress -->
              <v-col cols="12" md="3">
                <div class="text-caption text-grey-darken-1 font-weight-medium mb-2">Milestones</div>
                <div class="d-flex align-center ga-2 mb-1">
                  <v-chip size="small" color="success" variant="tonal">{{ progressSummary.completedMs }} completed</v-chip>
                  <span class="text-caption text-grey">/ {{ progressSummary.totalMs }} total</span>
                </div>
                <v-progress-linear :model-value="progressSummary.msRate" height="6" rounded color="success" />
              </v-col>

              <!-- Gallery thumbnails -->
              <v-col cols="12" md="4">
                <div class="text-caption text-grey-darken-1 font-weight-medium mb-2">Gallery ({{ gallery.length }})</div>
                <div class="d-flex flex-wrap ga-1">
                  <v-img
                    v-for="img in gallery.slice(0, 4)" :key="img.id"
                    :src="img.imageUrl" width="56" height="56"
                    cover class="rounded cursor-pointer"
                    @click="activeTab = isTabVisible('documents') ? 'documents' : activeTab"
                  />
                  <div v-if="!gallery.length" class="text-caption text-grey">No images uploaded.</div>
                </div>
              </v-col>
            </v-row>

            <!-- Quick actions -->
            <v-divider class="my-3" />
            <div class="d-flex flex-wrap ga-2">
              <v-btn v-if="isTabVisible('documents')" size="small" variant="tonal" color="primary" prepend-icon="mdi-paperclip" @click="activeTab = 'documents'">Documents</v-btn>
              <v-btn v-if="isTabVisible('progress')" size="small" variant="tonal" color="info" prepend-icon="mdi-flag-checkered" @click="activeTab = 'progress'">Milestones</v-btn>
              <v-btn v-if="isTabVisible('team')" size="small" variant="tonal" color="teal" prepend-icon="mdi-account-group-outline" @click="activeTab = 'team'">Team</v-btn>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- JR-B: Tab navigation -->
      <!-- WC-C: filter-before-render â€” tab bar deferred until RBAC is resolved -->
      <v-skeleton-loader v-if="!accessResolved" type="chip@4" class="mb-4" />
      <v-tabs v-else v-model="activeTab" color="primary" class="mb-4">
        <v-tab v-if="isTabVisible('overview')" value="overview">
          <v-icon start icon="mdi-information-outline" />Overview
        </v-tab>
        <!-- OJ-A: Progress Reports tab -->
        <v-tab v-if="isTabVisible('progress')" value="progress">
          <v-icon start icon="mdi-chart-line" />Progress &amp; Milestones
        </v-tab>
        <!-- ME: POW tab removed -->
        <!-- KD-F: Analytics tab (always visible â€” read-only) -->
        <v-tab v-if="isTabVisible('analytics')" value="analytics">
          <v-icon start icon="mdi-chart-box-outline" />Analytics
        </v-tab>
        <v-tab v-if="isTabVisible('documents')" value="documents">
          <v-icon start icon="mdi-paperclip" />Attachments
        </v-tab>
        <v-tab v-if="isTabVisible('team')" value="team">
          <v-icon start icon="mdi-account-group" />Team
        </v-tab>
        <v-tab v-if="isTabVisible('others')" value="others">
          <v-icon start icon="mdi-dots-horizontal-circle-outline" />Others
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <!-- ============= OVERVIEW TAB ============= -->
        <v-window-item value="overview">
          <!-- OU-D: CiProjectHeroCard removed; replaced by enterprise summary card above tabs -->

          <!-- FFF-A: Row 1 — carousel gallery (left) + always-expanded Project Profile (right) -->
          <v-row class="mb-4" align="stretch">
            <v-col cols="12" md="7">
              <v-card variant="outlined" class="h-100 overflow-hidden d-flex flex-column" style="min-height: 300px">
                <v-carousel
                  v-if="carouselImages.length"
                  height="100%"
                  hide-delimiter-background
                  show-arrows="hover"
                  :continuous="false"
                  class="flex-grow-1"
                >
                  <v-carousel-item
                    v-for="img in carouselImages"
                    :key="img.id"
                  >
                    <v-img
                      :src="img.imageUrl"
                      height="100%"
                      cover
                      position="center"
                      class="cursor-zoom-in bg-grey-lighten-3"
                      @click="profilePreviewImg = img.imageUrl; profilePreviewTitle = img.caption; profilePreviewDate = img.imageTakenDate || img.uploadedAt; profilePreviewUploadDate = img.uploadedAt; profilePreviewOpen = true"
                    >
                      <div v-if="img.caption" class="carousel-caption text-body-2 px-3 py-2">{{ img.caption }}</div>
                    </v-img>
                  </v-carousel-item>
                </v-carousel>
                <div v-else class="d-flex flex-column align-center justify-center text-grey flex-grow-1" style="min-height: 300px">
                  <v-icon size="48" color="grey-lighten-1">mdi-image-multiple-outline</v-icon>
                  <span class="text-body-2 mt-2">No project images yet</span>
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" md="5">
              <v-card variant="outlined" class="h-100 d-flex flex-column">
                <v-card-title class="d-flex align-center ga-2 py-3 bg-grey-lighten-4">
                  <v-icon icon="mdi-information-outline" color="primary" size="small" />
                  <span class="text-subtitle-1 font-weight-bold">Project Profile</span>
                </v-card-title>
                <v-divider />
                <v-card-text class="flex-grow-1">
                  <!-- Status -->
                  <div class="d-flex flex-wrap ga-2 mb-4">
                    <v-chip :color="getPublicationStatusColor(project.publicationStatus)" size="small" variant="tonal" prepend-icon="mdi-file-document-outline">
                      {{ getPublicationStatusLabel(project.publicationStatus) }}
                    </v-chip>
                    <v-chip v-if="project.projectStatusCategory" size="small" color="secondary" variant="tonal" prepend-icon="mdi-tag-outline">
                      {{ project.projectStatusCategory }}
                    </v-chip>
                  </div>

                  <!-- Timeline overview -->
                  <div class="text-overline text-weight-bold mb-1">Timeline</div>
                  <div class="d-flex flex-column ga-1 mb-3">
                    <div class="d-flex justify-space-between text-body-2"><span class="text-grey-darken-1">Start</span><span class="font-weight-medium">{{ project.startDate ? formatDate(project.startDate) : '—' }}</span></div>
                    <div class="d-flex justify-space-between text-body-2"><span class="text-grey-darken-1">Target Completion</span><span class="font-weight-medium">{{ project.targetCompletionDate ? formatDate(project.targetCompletionDate) : '—' }}</span></div>
                    <div class="d-flex justify-space-between text-body-2"><span class="text-grey-darken-1">Duration</span><span class="font-weight-medium">{{ project.projectDuration || '—' }}</span></div>
                  </div>

                  <!-- PPP-D: Original & Revised Dates — always visible, not hidden in panels -->
                  <template v-if="project.originalStartDate || project.originalCompletionDate || project.revisedStartDate || project.revisedCompletionDate">
                    <v-divider class="mb-2" />
                    <div class="text-overline text-weight-bold mb-1">Contract / Revision Schedule</div>
                    <div class="d-flex flex-column ga-1 mb-3">
                      <div v-if="project.originalStartDate" class="d-flex justify-space-between text-body-2">
                        <span class="text-grey-darken-1">Original Start</span>
                        <span>{{ formatDate(project.originalStartDate) }}</span>
                      </div>
                      <div v-if="project.originalCompletionDate" class="d-flex justify-space-between text-body-2">
                        <span class="text-grey-darken-1">Original Completion</span>
                        <span>{{ formatDate(project.originalCompletionDate) }}</span>
                      </div>
                      <div v-if="project.revisedStartDate" class="d-flex justify-space-between align-center text-body-2">
                        <span class="text-grey-darken-1 d-flex align-center ga-1">
                          Revised Start
                          <v-chip size="x-small" color="warning" variant="tonal">Latest</v-chip>
                        </span>
                        <span class="font-weight-medium" style="color: rgb(var(--v-theme-warning))">{{ formatDate(project.revisedStartDate) }}</span>
                      </div>
                      <div v-if="project.revisedCompletionDate" class="d-flex justify-space-between align-center text-body-2">
                        <span class="text-grey-darken-1 d-flex align-center ga-1">
                          Revised Completion
                          <v-chip size="x-small" color="warning" variant="tonal">Latest</v-chip>
                        </span>
                        <span class="font-weight-medium" style="color: rgb(var(--v-theme-warning))">{{ formatDate(project.revisedCompletionDate) }}</span>
                      </div>
                    </div>
                  </template>

                  <!-- Budget summary -->
                  <div class="text-overline text-medium-emphasis mb-1">Budget</div>
                  <div class="d-flex justify-space-between text-body-2 mb-2"><span class="text-grey-darken-1">Contract / Appropriation</span><span class="font-weight-bold">{{ formatCurrency(dashFinancials.appropriation) }}</span></div>
                  <div class="mb-2">
                    <div class="d-flex justify-space-between text-caption mb-1"><span>Obligation</span><span>{{ dashFinancials.obligationPct }}%</span></div>
                    <v-progress-linear :model-value="dashFinancials.obligationPct" color="info" height="6" rounded />
                  </div>
                  <div class="mb-4">
                    <div class="d-flex justify-space-between text-caption mb-1"><span>Disbursement</span><span>{{ dashFinancials.disbursementPct }}%</span></div>
                    <v-progress-linear :model-value="dashFinancials.disbursementPct" color="success" height="6" rounded />
                  </div>

                  <!-- Implementing agencies -->
                  <template v-if="project.implementingAgency || project.contractor">
                    <div class="text-overline text-medium-emphasis mb-1">Implementation</div>
                    <div v-if="project.implementingAgency" class="d-flex justify-space-between text-body-2"><span class="text-grey-darken-1">Agency</span><span class="font-weight-medium text-right">{{ project.implementingAgency }}</span></div>
                    <div v-if="project.contractor" class="d-flex justify-space-between text-body-2"><span class="text-grey-darken-1">Contractor</span><span class="font-weight-medium text-right">{{ project.contractor }}</span></div>
                  </template>
                </v-card-text>

                <!-- Quick statistics -->
                <v-divider />
                <div class="d-flex text-center">
                  <div class="flex-grow-1 py-2">
                    <div class="text-h6 font-weight-bold text-primary">{{ progressSummary.physical }}%</div>
                    <div class="text-caption text-grey-darken-1">Physical</div>
                  </div>
                  <v-divider vertical />
                  <div class="flex-grow-1 py-2">
                    <div class="text-h6 font-weight-bold text-info">{{ progressSummary.msRate }}%</div>
                    <div class="text-caption text-grey-darken-1">Milestones</div>
                  </div>
                  <v-divider vertical />
                  <div class="flex-grow-1 py-2">
                    <div class="text-h6 font-weight-bold">{{ progressSummary.completedMs }}/{{ progressSummary.totalMs }}</div>
                    <div class="text-caption text-grey-darken-1">Done</div>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- KI-A: Compact publication status strip (replaces redundant status header card) -->
          <div v-if="project && (isAdmin || project.publicationStatus !== 'PUBLISHED')" class="d-flex flex-wrap align-center ga-2 mb-3 mt-2 px-1">
            <v-chip
              :color="getPublicationStatusColor(project.publicationStatus)"
              size="small"
              variant="tonal"
              prepend-icon="mdi-file-document-outline"
            >{{ getPublicationStatusLabel(project.publicationStatus) }}</v-chip>
            <template v-if="project.publicationStatus === 'PUBLISHED' && project.approvalMetadata?.reviewedByName">
              <v-chip size="small" variant="tonal" color="success" prepend-icon="mdi-check-circle">
                Approved by {{ project.approvalMetadata.reviewedByName }}<span class="ml-1 text-grey text-caption">Â· {{ formatDate(project.approvalMetadata.reviewedAt || '') }}</span>
              </v-chip>
            </template>
            <template v-else-if="project.publicationStatus === 'REJECTED' && project.approvalMetadata?.reviewedByName">
              <v-chip size="small" variant="tonal" color="error" prepend-icon="mdi-close-circle">
                Rejected by {{ project.approvalMetadata.reviewedByName }}<span class="ml-1 text-grey text-caption">Â· {{ formatDate(project.approvalMetadata.reviewedAt || '') }}</span>
              </v-chip>
              <v-chip v-if="project.approvalMetadata.reviewNotes" size="small" variant="outlined" color="error" prepend-icon="mdi-note-text-outline">
                {{ project.approvalMetadata.reviewNotes }}
              </v-chip>
            </template>
            <template v-else-if="project.publicationStatus === 'PENDING_REVIEW' && project.approvalMetadata?.submittedByName">
              <v-chip size="small" variant="tonal" color="orange" prepend-icon="mdi-clock-outline">
                Submitted by {{ project.approvalMetadata.submittedByName }}<span class="ml-1 text-grey text-caption">Â· {{ formatDate(project.approvalMetadata.submittedAt || '') }}</span>
              </v-chip>
            </template>
            <v-chip v-if="project.projectStatusCategory" size="small" color="secondary" variant="tonal" prepend-icon="mdi-tag-outline" class="ml-auto">
              {{ project.projectStatusCategory }}
            </v-chip>
            <span v-if="project.implementingAgency" class="text-caption text-grey-darken-1 d-flex align-center ga-1">
              <v-icon size="x-small" color="grey">mdi-office-building-outline</v-icon>
              {{ project.implementingAgency }}
            </span>
          </div>

          <!-- OU-D / FFF-A: Unified overview panels — collapsible 2-column grid -->
          <v-expansion-panels v-model="overviewPanels" multiple class="overview-grid">

            <!-- Panel 0: Project Profile -->
            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon start size="small" icon="mdi-information-outline" />
                Project Profile
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row>
                  <v-col v-if="project.summary" cols="12">
                    <p class="text-caption text-grey">Summary</p>
                    <p class="text-pre-line">{{ project.summary }}</p>
                  </v-col>
                  <v-col v-if="project.description" cols="12">
                    <p class="text-caption text-grey">Description</p>
                    <p class="text-pre-line">{{ project.description }}</p>
                  </v-col>
                  <v-col v-if="project.scope" cols="12">
                    <p class="text-caption text-grey">Scope of Work</p>
                    <p class="text-pre-line">{{ project.scope }}</p>
                  </v-col>
                  <v-col v-if="project.objectives && (Array.isArray(project.objectives) ? project.objectives.length : true)" cols="12">
                    <p class="text-caption text-grey">Project Objectives</p>
                    <ul class="pl-4">
                      <template v-if="Array.isArray(project.objectives)">
                        <li v-for="(obj, i) in project.objectives" :key="i">{{ obj }}</li>
                      </template>
                      <template v-else>
                        <li>{{ project.objectives }}</li>
                      </template>
                    </ul>
                  </v-col>
                  <v-col v-if="project.keyFeatures && (Array.isArray(project.keyFeatures) ? project.keyFeatures.length : true)" cols="12">
                    <p class="text-caption text-grey mb-2">Key Features</p>
                    <div class="d-flex flex-wrap ga-2">
                      <template v-if="Array.isArray(project.keyFeatures)">
                        <v-chip v-for="(feat, i) in project.keyFeatures" :key="i" color="primary" variant="tonal" size="small" prepend-icon="mdi-star-outline">
                          {{ feat }}
                        </v-chip>
                      </template>
                      <span v-else>{{ project.keyFeatures }}</span>
                    </div>
                  </v-col>
                  <v-col v-if="facilitiesList && facilitiesList.length" cols="12">
                    <p class="text-caption text-grey">Facilities</p>
                    <ul class="pl-4">
                      <li v-for="(fac, i) in facilitiesList" :key="i">{{ fac }}</li>
                    </ul>
                  </v-col>
                  <v-col v-if="project.beneficiaries || project.beneficiaryList?.length" cols="12">
                    <p class="text-caption text-grey">Beneficiaries</p>
                    <template v-if="project.beneficiaryList?.length">
                      <ul class="pl-4">
                        <li v-for="(b, i) in project.beneficiaryList" :key="i">{{ b }}</li>
                      </ul>
                    </template>
                    <p v-else-if="project.beneficiaries">{{ Number(project.beneficiaries).toLocaleString() }} direct beneficiaries</p>
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>

            <!-- Panel 1: Dates & Duration -->
            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon start size="small" icon="mdi-calendar-range" />
                Dates &amp; Duration
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-list density="compact">
                      <v-list-item v-if="project.campus">
                        <v-list-item-title>Campus</v-list-item-title>
                        <v-list-item-subtitle>{{ project.campus }}</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item v-if="project.buildingType">
                        <v-list-item-title>Building Type</v-list-item-title>
                        <v-list-item-subtitle>{{ project.buildingType }}</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item v-if="project.floorArea">
                        <v-list-item-title>Floor Area</v-list-item-title>
                        <v-list-item-subtitle>{{ Number(project.floorArea).toLocaleString() }} sqm</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item v-if="project.numberOfFloors">
                        <v-list-item-title>Number of Floors</v-list-item-title>
                        <v-list-item-subtitle>{{ project.numberOfFloors }}</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item v-if="project.latitude != null && project.longitude != null">
                        <v-list-item-title>Coordinates</v-list-item-title>
                        <v-list-item-subtitle>{{ project.latitude }}, {{ project.longitude }}</v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-list density="compact">
                      <v-list-item v-if="project.contractor">
                        <v-list-item-title>Contractor</v-list-item-title>
                        <v-list-item-subtitle>{{ project.contractor }}</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item v-if="project.contractNumber">
                        <v-list-item-title>Contract Number</v-list-item-title>
                        <v-list-item-subtitle>{{ project.contractNumber }}</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item v-if="project.startDate">
                        <v-list-item-title>Start Date</v-list-item-title>
                        <v-list-item-subtitle>{{ formatDate(project.startDate) }}</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item v-if="project.targetCompletionDate">
                        <v-list-item-title>Target Completion</v-list-item-title>
                        <v-list-item-subtitle>{{ formatDate(project.targetCompletionDate) }}</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item v-if="project.actualCompletionDate">
                        <v-list-item-title>Actual Completion</v-list-item-title>
                        <v-list-item-subtitle>{{ formatDate(project.actualCompletionDate) }}</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item v-if="project.projectDuration">
                        <v-list-item-title>Duration</v-list-item-title>
                        <v-list-item-subtitle>{{ project.projectDuration }}</v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-col>

                  <!-- MG: Location -->
                  <v-col v-if="project.spatialCoverage || project.municipality || project.province" cols="12">
                    <p class="text-caption text-grey font-weight-medium text-uppercase mb-1">Location</p>
                    <div class="d-flex flex-wrap ga-2">
                      <v-chip v-if="project.spatialCoverage" size="small" variant="tonal" color="blue-grey" prepend-icon="mdi-map">{{ project.spatialCoverage }}</v-chip>
                      <v-chip v-if="project.municipality" size="small" variant="tonal" color="blue-grey" prepend-icon="mdi-city">{{ project.municipality }}</v-chip>
                      <v-chip v-if="project.province" size="small" variant="tonal" color="blue-grey" prepend-icon="mdi-map-marker">{{ project.province }}</v-chip>
                    </div>
                  </v-col>

                  <!-- MH: Revision Orders -->
                  <v-col v-if="project.originalStartDate || project.revisedStartDate || project.originalCompletionDate || project.revisedCompletionDate || project.revisedProjectDuration" cols="12">
                    <p class="text-caption text-grey font-weight-medium text-uppercase mb-2">
                      <v-icon size="x-small" color="warning" class="mr-1">mdi-file-document-edit-outline</v-icon>
                      Revision Orders (VOR / CTE)
                    </p>
                    <v-row dense>
                      <v-col v-if="project.originalStartDate" cols="12" sm="6" md="4">
                        <v-list-item density="compact">
                          <v-list-item-title class="text-caption text-grey">Original Start Date</v-list-item-title>
                          <v-list-item-subtitle class="text-body-2">{{ formatDate(project.originalStartDate) }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-col>
                      <v-col v-if="project.revisedStartDate" cols="12" sm="6" md="4">
                        <v-list-item density="compact">
                          <v-list-item-title class="text-caption text-grey">Revised Start Date</v-list-item-title>
                          <v-list-item-subtitle class="text-body-2">{{ formatDate(project.revisedStartDate) }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-col>
                      <v-col v-if="project.originalCompletionDate" cols="12" sm="6" md="4">
                        <v-list-item density="compact">
                          <v-list-item-title class="text-caption text-grey">Original Completion</v-list-item-title>
                          <v-list-item-subtitle class="text-body-2">{{ formatDate(project.originalCompletionDate) }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-col>
                      <v-col v-if="project.revisedCompletionDate" cols="12" sm="6" md="4">
                        <v-list-item density="compact">
                          <v-list-item-title class="text-caption text-grey">Revised Completion</v-list-item-title>
                          <v-list-item-subtitle class="text-body-2">{{ formatDate(project.revisedCompletionDate) }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-col>
                      <v-col v-if="project.revisedProjectDuration" cols="12" sm="6" md="4">
                        <v-list-item density="compact">
                          <v-list-item-title class="text-caption text-grey">Revised Duration</v-list-item-title>
                          <v-list-item-subtitle class="text-body-2">{{ project.revisedProjectDuration }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>

            <!-- Panel 2: Progress & Reports -->
            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon start size="small" icon="mdi-chart-line" />
                Progress &amp; Reports
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <!-- TTT-B: PROGRESS REPORT SUMMARY -->
                <div class="text-overline text-medium-emphasis mb-2">Progress Report Summary</div>
                <v-row dense class="mb-3">
                  <v-col cols="6" sm="3">
                    <v-card variant="tonal" color="primary" class="pa-3" rounded="lg">
                      <div class="text-caption text-grey">Physical</div>
                      <div class="text-h6 font-weight-bold">{{ progressSummary.physical != null ? progressSummary.physical.toFixed(1) : (project?.physicalProgress ?? 0) }}%</div>
                    </v-card>
                  </v-col>
                  <v-col cols="6" sm="3">
                    <v-card variant="tonal" color="info" class="pa-3" rounded="lg">
                      <div class="text-caption text-grey">Financial</div>
                      <div class="text-h6 font-weight-bold">{{ project?.financialProgress ?? 0 }}%</div>
                    </v-card>
                  </v-col>
                  <v-col cols="6" sm="3">
                    <v-card variant="tonal" color="blue-grey" class="pa-3" rounded="lg">
                      <div class="text-caption text-grey">Latest Report</div>
                      <div class="text-body-1 font-weight-bold">
                        {{ latestReport ? (latestReport.reportType === 'WEEKLY' ? 'WAR' : latestReport.reportType === 'MONTHLY' ? 'MPR' : latestReport.reportType) : '—' }}
                      </div>
                      <div class="text-caption text-grey">{{ latestReport?.reportDate ? formatDate(latestReport.reportDate) : 'No reports' }}</div>
                    </v-card>
                  </v-col>
                  <v-col cols="6" sm="3">
                    <v-card variant="tonal" color="secondary" class="pa-3" rounded="lg">
                      <div class="text-caption text-grey">Status</div>
                      <div class="text-body-2 font-weight-bold">{{ getPublicationStatusLabel(project.publicationStatus) }}</div>
                      <div v-if="project.projectStatusCategory" class="text-caption text-grey">{{ project.projectStatusCategory }}</div>
                    </v-card>
                  </v-col>
                  <v-col v-if="latestReport && latestReport.percentageCompletion != null" cols="6" sm="3">
                    <div class="text-caption text-grey">Report Completion</div>
                    <div class="text-body-2 font-weight-medium text-primary">{{ Number(latestReport.percentageCompletion).toFixed(1) }}%</div>
                  </v-col>
                  <v-col v-if="latestReport && latestReport.slippage != null" cols="6" sm="3">
                    <div class="text-caption text-grey">Slippage</div>
                    <div class="text-body-2 font-weight-medium" :class="Number(latestReport.slippage) < 0 ? 'text-error' : 'text-success'">{{ Number(latestReport.slippage).toFixed(1) }}%</div>
                  </v-col>
                  <v-col v-if="project.costIncurredToDate" cols="6" sm="3">
                    <div class="text-caption text-grey">Cost Incurred</div>
                    <div class="text-body-2 font-weight-medium">{{ formatCurrency(project.costIncurredToDate) }}</div>
                  </v-col>
                  <v-col v-if="project.asOfDate" cols="6" sm="3">
                    <div class="text-caption text-grey">As Of</div>
                    <div class="text-body-2 font-weight-medium">{{ formatDate(project.asOfDate) }}</div>
                  </v-col>
                </v-row>
                <v-progress-linear v-if="prLoading" indeterminate height="2" color="blue-grey" class="mb-3" />

                <!-- TTT-B: MILESTONE SUMMARY -->
                <v-divider class="my-3" />
                <div class="text-overline text-medium-emphasis mb-2">Milestone Summary</div>
                <div class="d-flex flex-wrap ga-2 mb-2">
                  <v-chip size="small" variant="tonal" color="grey-darken-1" prepend-icon="mdi-flag-outline">Total {{ milestoneSummary.total }}</v-chip>
                  <v-chip size="small" variant="tonal" color="success" prepend-icon="mdi-check-circle">Completed {{ milestoneSummary.completed }}</v-chip>
                  <v-chip size="small" variant="tonal" color="primary" prepend-icon="mdi-progress-clock">Ongoing {{ milestoneSummary.ongoing }}</v-chip>
                  <v-chip size="small" variant="tonal" color="error" prepend-icon="mdi-alert-circle-outline">Delayed {{ milestoneSummary.delayed }}</v-chip>
                </div>
                <div v-if="milestoneSummary.upcoming" class="text-body-2 mb-2">
                  <v-icon size="16" color="info" class="mr-1">mdi-calendar-arrow-right</v-icon>
                  <span class="text-grey-darken-1">Next upcoming:</span>
                  <span class="font-weight-medium ml-1">{{ milestoneSummary.upcoming.name || 'Untitled' }}</span>
                  <span class="text-caption text-grey ml-1">({{ formatDate(milestoneSummary.upcoming.targetDate) }})</span>
                </div>

                <!-- TTT-B: RECENT ACTIVITY -->
                <v-divider class="my-3" />
                <div class="text-overline text-medium-emphasis mb-2">Recent Activity</div>
                <div class="d-flex flex-column ga-1 mb-2">
                  <div class="d-flex align-center ga-2 text-body-2">
                    <v-icon size="16" color="blue-grey">mdi-clipboard-text-clock-outline</v-icon>
                    <span class="text-grey-darken-1">Latest submitted report:</span>
                    <span class="font-weight-medium">{{ latestReport?.reportDate ? formatDate(latestReport.reportDate) : '—' }}</span>
                  </div>
                  <div v-if="latestMilestoneUpdate" class="d-flex align-center ga-2 text-body-2">
                    <v-icon size="16" color="secondary">mdi-flag-checkered</v-icon>
                    <span class="text-grey-darken-1">Latest milestone:</span>
                    <span class="font-weight-medium">{{ latestMilestoneUpdate.name || 'Untitled' }}</span>
                    <v-chip size="x-small" :color="getMilestoneStatusColor(latestMilestoneUpdate.status)" variant="tonal">{{ latestMilestoneUpdate.status }}</v-chip>
                  </div>
                </div>

                <!-- Progress remarks preview (kept) -->
                <div v-if="project.remarksLog?.length" class="mt-2 mb-2">
                  <div class="text-caption text-grey font-weight-medium text-uppercase mb-1">Progress Remarks</div>
                  <div v-for="(remark, i) in project.remarksLog.slice(0, 2)" :key="i" class="mb-1 pa-2 rounded bg-grey-lighten-5">
                    <div class="text-body-2">{{ remark.text }}</div>
                    <div class="text-caption text-grey-darken-1">
                      <span v-if="remark.author">{{ remark.author }} · </span>
                      {{ remark.createdAt ? formatDate(remark.createdAt) : '' }}
                    </div>
                  </div>
                </div>

                <div class="d-flex justify-end">
                  <v-btn size="small" color="info" variant="tonal" prepend-icon="mdi-chart-line" @click="activeTab = 'progress'">
                    View Progress Reports
                  </v-btn>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>

            <!-- Panel 3: Strategic Alignment -->
            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon start size="small" icon="mdi-strategy" />
                Strategic Alignment
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row>
                  <v-col v-if="project.strategicAlignment" cols="12">
                    <p class="text-caption text-grey">Strategic Alignment</p>
                    <p class="text-pre-line">{{ project.strategicAlignment }}</p>
                  </v-col>
                  <v-col v-if="project.implementingAgency" cols="12" sm="6">
                    <p class="text-caption text-grey">Implementing Agency</p>
                    <p class="font-weight-medium">{{ project.implementingAgency }}</p>
                  </v-col>
                  <v-col v-if="project.coImplementingAgency" cols="12" sm="6">
                    <p class="text-caption text-grey">Co-Implementing Agency</p>
                    <p class="font-weight-medium">{{ project.coImplementingAgency }}</p>
                  </v-col>
                  <v-col v-if="project.attachedAgency" cols="12" sm="6">
                    <p class="text-caption text-grey">Attached Agency</p>
                    <p class="font-weight-medium">{{ project.attachedAgency }}</p>
                  </v-col>
                  <v-col v-if="project.additionalFundingSources?.length" cols="12">
                    <p class="text-caption text-grey mb-2">Additional Funding Sources</p>
                    <div class="d-flex flex-wrap ga-2">
                      <v-chip v-for="(src, i) in project.additionalFundingSources" :key="i" size="small" variant="tonal" color="success">
                        {{ src.name }}{{ src.type ? ` (${src.type})` : '' }}
                      </v-chip>
                    </div>
                  </v-col>
                  <v-col v-if="project.projectStatusCategory" cols="12" sm="6">
                    <p class="text-caption text-grey">Status Category</p>
                    <v-chip size="small" color="secondary" variant="tonal">{{ project.projectStatusCategory }}</v-chip>
                  </v-col>
                  <v-col v-if="project.rdpAlignment?.length" cols="12">
                    <p class="text-caption text-grey mb-2">RDP Alignment</p>
                    <div class="d-flex flex-wrap ga-2">
                      <v-chip v-for="(item, i) in project.rdpAlignment" :key="i" color="primary" variant="tonal" size="small">{{ item }}</v-chip>
                    </div>
                  </v-col>
                  <v-col v-if="project.socioeconomicAgenda?.length" cols="12">
                    <p class="text-caption text-grey mb-2">Socio-Economic Agenda</p>
                    <div class="d-flex flex-wrap ga-2">
                      <v-chip v-for="(item, i) in project.socioeconomicAgenda" :key="i" color="success" variant="tonal" size="small">{{ item }}</v-chip>
                    </div>
                  </v-col>
                  <v-col v-if="project.csuLikhaGoals?.length" cols="12">
                    <p class="text-caption text-grey mb-2">CSU Likha Goals</p>
                    <div class="d-flex flex-wrap ga-2">
                      <v-chip v-for="(item, i) in project.csuLikhaGoals" :key="i" color="info" variant="tonal" size="small">{{ item }}</v-chip>
                    </div>
                  </v-col>
                  <!-- QQQ-F: UN Sustainable Development Goals -->
                  <v-col v-if="(project as any).sdgGoals?.length" cols="12">
                    <p class="text-caption text-grey mb-2">UN Sustainable Development Goals</p>
                    <div class="d-flex flex-wrap ga-2">
                      <v-chip
                        v-for="(item, i) in (project as any).sdgGoals"
                        :key="i"
                        color="teal"
                        variant="tonal"
                        size="small"
                        prepend-icon="mdi-earth"
                      >
                        {{ labelForSdg(item) }}
                      </v-chip>
                    </div>
                  </v-col>
                  <v-col v-if="!project.strategicAlignment && !project.implementingAgency && !project.coImplementingAgency && !project.attachedAgency && !project.additionalFundingSources?.length && !project.projectStatusCategory && !project.rdpAlignment?.length && !project.socioeconomicAgenda?.length && !project.csuLikhaGoals?.length && !(project as any).sdgGoals?.length" cols="12" class="text-center text-grey py-2">
                    No strategic context recorded.
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>

            <!-- Panel 4: Project Indicators -->
            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon start size="small" icon="mdi-chart-bar" />
                Project Indicators
                <v-chip v-if="(project.outputIndicators?.length || 0) + (project.outcomeIndicators?.length || 0) > 0" size="x-small" variant="tonal" color="primary" class="ml-2">
                  {{ (project.outputIndicators?.length || 0) + (project.outcomeIndicators?.length || 0) }}
                </v-chip>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <template v-if="project.outputIndicators?.length || project.outcomeIndicators?.length">
                  <div v-if="project.outputIndicators?.length" class="mb-3">
                    <p class="text-caption text-grey mb-2">Output Indicators</p>
                    <div class="d-flex flex-wrap ga-2">
                      <v-chip v-for="(ind, i) in project.outputIndicators" :key="i" color="primary" variant="tonal" size="small" prepend-icon="mdi-arrow-right-circle-outline">
                        {{ ind }}
                      </v-chip>
                    </div>
                  </div>
                  <div v-if="project.outcomeIndicators?.length">
                    <p class="text-caption text-grey mb-2">Outcome Indicators</p>
                    <div class="d-flex flex-wrap ga-2">
                      <v-chip v-for="(ind, i) in project.outcomeIndicators" :key="i" color="success" variant="tonal" size="small" prepend-icon="mdi-check-circle-outline">
                        {{ ind }}
                      </v-chip>
                    </div>
                  </div>
                </template>
                <p v-else class="text-grey text-center py-2">No indicators recorded.</p>
              </v-expansion-panel-text>
            </v-expansion-panel>

            <!-- Panel 5: Key Documents -->
            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon start size="small" icon="mdi-file-document-multiple" />
                Key Documents
                <v-chip v-if="documents.length" size="x-small" variant="tonal" color="primary" class="ml-2">
                  {{ documents.length }}
                </v-chip>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row dense>
                  <v-col v-for="docType in DOCUMENT_PREVIEW_TYPES" :key="docType.key" cols="12" sm="6">
                    <v-card variant="outlined" class="pa-3 h-100">
                      <div class="d-flex justify-space-between align-center mb-1">
                        <span class="text-subtitle-2">{{ docType.label }}</span>
                        <v-chip v-if="findDocumentPreview(documents, docType.key)" color="success" size="x-small" variant="tonal">Uploaded</v-chip>
                        <v-chip v-else color="warning" size="x-small" variant="tonal">Not Uploaded</v-chip>
                      </div>
                      <template v-if="findDocumentPreview(documents, docType.key)">
                        <div class="text-caption text-grey">
                          {{ findDocumentPreview(documents, docType.key)?.fileName || 'â€”' }}
                          <span v-if="findDocumentPreview(documents, docType.key)?.createdAt">
                            Â· {{ formatDate(findDocumentPreview(documents, docType.key)!.createdAt || '') }}
                          </span>
                        </div>
                        <v-btn
                          v-if="findDocumentPreview(documents, docType.key)?.filePath"
                          variant="text" size="x-small" color="primary" class="mt-1 pa-0"
                          :href="findDocumentPreview(documents, docType.key)?.filePath || undefined"
                          target="_blank" rel="noopener noreferrer"
                        >
                          View Document
                        </v-btn>
                      </template>
                      <div v-else class="text-caption text-grey">No matching document on file.</div>
                    </v-card>
                  </v-col>
                </v-row>
                <div class="text-caption text-grey mt-3">
                  For full document management, see the
                  <a class="cursor-pointer text-primary" @click.prevent="activeTab = 'documents'">Documents tab</a>.
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>

            <!-- Panel 6: Financial Summary -->
            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon start size="small" icon="mdi-cash-multiple" />
                Financial Summary
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <template v-if="project.financials && project.financials.length > 0">
                  <v-row dense class="mb-3">
                    <v-col cols="6" sm="3">
                      <p class="text-caption text-grey mb-1">Total Appropriation</p>
                      <p class="text-subtitle-2 font-weight-bold">{{ formatCurrency(financialSummary.appropriation) }}</p>
                    </v-col>
                    <v-col cols="6" sm="3">
                      <p class="text-caption text-grey mb-1">Total Obligation</p>
                      <p class="text-subtitle-2 font-weight-bold">{{ formatCurrency(financialSummary.obligation) }}</p>
                    </v-col>
                    <v-col cols="6" sm="3">
                      <p class="text-caption text-grey mb-1">Total Disbursement</p>
                      <p class="text-subtitle-2 font-weight-bold">{{ formatCurrency(financialSummary.disbursement) }}</p>
                    </v-col>
                    <v-col cols="6" sm="3">
                      <p class="text-caption text-grey mb-1">Utilization Rate</p>
                      <p class="text-subtitle-2 font-weight-bold">{{ formatRate(financialSummary.utilization) }}</p>
                    </v-col>
                  </v-row>
                  <v-data-table
                    :items="project.financials"
                    :headers="[
                      { title: 'Fiscal Year', key: 'fiscalYear', align: 'center' },
                      { title: 'Appropriation', key: 'appropriation', align: 'end' },
                      { title: 'Obligation', key: 'obligation', align: 'end' },
                      { title: 'Disbursement', key: 'disbursement', align: 'end' },
                      { title: 'Util. Rate', key: 'utilizationRate', align: 'end' },
                      { title: 'Disb. Rate', key: 'disbursementRate', align: 'end' },
                    ]"
                    density="comfortable"
                    class="elevation-0"
                  >
                    <template #item.appropriation="{ item }">{{ formatCurrency(item.appropriation) }}</template>
                    <template #item.obligation="{ item }">{{ formatCurrency(item.obligation) }}</template>
                    <template #item.disbursement="{ item }">{{ formatCurrency(item.disbursement) }}</template>
                    <template #item.utilizationRate="{ item }">{{ formatRate(item.utilizationRate) }}</template>
                    <template #item.disbursementRate="{ item }">{{ formatRate(item.disbursementRate) }}</template>
                  </v-data-table>
                </template>
                <p v-else class="text-grey text-center py-2">No financial records</p>
              </v-expansion-panel-text>
            </v-expansion-panel>

            <!-- Panel 7: Approval History + Signatories -->
            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon start size="small" icon="mdi-history" />
                Approval History &amp; Signatories
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="12" sm="6">
                    <p class="text-caption text-grey-darken-1 font-weight-medium text-uppercase mb-2">Approval History</p>
                    <v-timeline side="end" density="compact" truncate-line="both">
                      <v-timeline-item dot-color="blue-grey" icon="mdi-file-plus-outline" size="small">
                        <div class="text-body-2 font-weight-medium">Record Created</div>
                        <div class="text-caption text-grey">{{ project.approvalMetadata?.createdByName || 'Unknown' }}</div>
                        <div class="text-caption text-grey">{{ formatDate(project.approvalMetadata?.createdAt || project.createdAt || '') }}</div>
                      </v-timeline-item>
                      <v-timeline-item v-if="project.approvalMetadata?.submittedByName" dot-color="orange" icon="mdi-send-outline" size="small">
                        <div class="text-body-2 font-weight-medium">Submitted for Review</div>
                        <div class="text-caption text-grey">{{ project.approvalMetadata.submittedByName }}</div>
                        <div class="text-caption text-grey">{{ formatDate(project.approvalMetadata.submittedAt || '') }}</div>
                      </v-timeline-item>
                      <v-timeline-item
                        v-if="project.approvalMetadata?.reviewedByName"
                        :dot-color="project.publicationStatus === 'PUBLISHED' ? 'success' : 'error'"
                        :icon="project.publicationStatus === 'PUBLISHED' ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
                        size="small"
                      >
                        <div class="text-body-2 font-weight-medium">{{ project.publicationStatus === 'PUBLISHED' ? 'Approved' : 'Rejected' }}</div>
                        <div class="text-caption text-grey">{{ project.approvalMetadata.reviewedByName }}</div>
                        <div class="text-caption text-grey">{{ formatDate(project.approvalMetadata.reviewedAt || '') }}</div>
                        <div v-if="project.approvalMetadata.reviewNotes" class="text-caption text-error mt-1">
                          <strong>Notes:</strong> {{ project.approvalMetadata.reviewNotes }}
                        </div>
                      </v-timeline-item>
                    </v-timeline>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <p class="text-caption text-grey-darken-1 font-weight-medium text-uppercase mb-2">Signatories</p>
                    <template v-if="project.signatories?.length">
                      <v-list density="compact">
                        <v-list-item
                          v-for="(sig, i) in project.signatories"
                          :key="i"
                          :subtitle="sig.position || ''"
                        >
                          <template #prepend>
                            <v-avatar size="32" color="primary" variant="tonal" class="mr-2">
                              <span class="text-caption font-weight-bold">{{ initials(sig.name || '') }}</span>
                            </v-avatar>
                          </template>
                          <v-list-item-title>{{ sig.name }}</v-list-item-title>
                          <template #append>
                            <span v-if="sig.date" class="text-caption text-grey">{{ formatDate(sig.date) }}</span>
                          </template>
                        </v-list-item>
                      </v-list>
                    </template>
                    <p v-else class="text-grey text-center py-2">No signatories listed.</p>
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>

          </v-expansion-panels>
        </v-window-item>

        <!-- ============= PROGRESS & MILESTONES TAB (TTT-C: analytics header + priority order) ============= -->
        <v-window-item value="progress">
          <!-- TTT-C: Analytics header strip -->
          <v-card variant="tonal" color="primary" class="mb-4 pa-3" rounded="lg">
            <div class="d-flex flex-wrap ga-6 align-center">
              <div>
                <div class="text-caption text-grey">Physical</div>
                <div class="text-h6 font-weight-bold">{{ progressSummary.physical != null ? progressSummary.physical.toFixed(1) : (project?.physicalProgress ?? 0) }}%</div>
              </div>
              <v-divider vertical />
              <div>
                <div class="text-caption text-grey">Financial</div>
                <div class="text-h6 font-weight-bold">{{ project?.financialProgress ?? 0 }}%</div>
              </div>
              <v-divider vertical />
              <div>
                <div class="text-caption text-grey">Milestones</div>
                <div class="text-h6 font-weight-bold">{{ milestoneSummary.completed }}/{{ milestoneSummary.total }}</div>
              </div>
              <v-divider vertical />
              <div>
                <div class="text-caption text-grey">Latest Report</div>
                <div class="text-body-1 font-weight-medium">{{ latestReport?.reportDate ? formatDate(latestReport.reportDate) : '—' }}</div>
              </div>
            </div>
          </v-card>

          <!-- Priority #1: Progress Reports -->
          <div class="text-subtitle-1 font-weight-medium mb-3 d-flex align-center ga-2">
            <v-icon color="info" size="small">mdi-chart-line</v-icon>
            Progress Reports
          </div>
          <CiProgressReportTab
            v-if="projectId"
            :project-id="projectId"
            :read-only="true"
            :project-start-date="project?.startDate"
            :project-target-completion-date="project?.targetCompletionDate"
            :project-duration="project?.projectDuration"
            class="mb-4"
          />

          <v-divider class="my-4" />

          <!-- Priority #2: Project Milestones -->
          <v-card variant="outlined" class="mb-4" rounded="lg">
            <v-card-title class="d-flex align-center ga-2 py-2 px-4 bg-grey-lighten-4 text-subtitle-1">
              <v-icon icon="mdi-flag-checkered" size="small" color="info" />
              <span class="font-weight-medium">Project Milestones</span>
              <v-chip size="small" variant="tonal" color="info">
                {{ filteredMilestones.length }}/{{ project?.milestones?.length ?? 0 }}
              </v-chip>
              <v-spacer />
              <a v-if="canEditCurrentProject" class="text-body-2 text-primary text-decoration-none cursor-pointer" @click="editSection('progress')">Manage in Edit ↗</a>
            </v-card-title>
            <v-divider />
            <v-card-text v-if="project?.milestones?.length">
              <!-- PPP-E: Search / filter / sort controls -->
              <div class="d-flex flex-wrap align-center ga-2 mb-3">
                <v-text-field
                  v-model="milestoneSearch"
                  placeholder="Search milestones…"
                  density="compact" variant="outlined" hide-details single-line clearable
                  prepend-inner-icon="mdi-magnify"
                  style="max-width: 200px"
                />
                <v-select
                  v-model="milestoneStatusFilter"
                  :items="[
                    { title: 'All Statuses', value: null },
                    { title: 'Pending', value: 'PENDING' },
                    { title: 'In Progress', value: 'IN_PROGRESS' },
                    { title: 'Completed', value: 'COMPLETED' },
                    { title: 'Delayed', value: 'DELAYED' },
                    { title: 'Cancelled', value: 'CANCELLED' },
                  ]"
                  density="compact" variant="outlined" hide-details clearable
                  label="Status"
                  style="max-width: 155px"
                />
                <v-btn-toggle v-model="milestoneSortKey" mandatory density="compact" variant="outlined">
                  <v-btn value="targetDate" size="small" title="Sort by target date">
                    <v-icon size="16">mdi-calendar-sort-ascending</v-icon>
                  </v-btn>
                  <v-btn value="progress" size="small" title="Sort by progress">
                    <v-icon size="16">mdi-percent</v-icon>
                  </v-btn>
                  <v-btn value="name" size="small" title="Sort by name">
                    <v-icon size="16">mdi-sort-alphabetical-ascending</v-icon>
                  </v-btn>
                </v-btn-toggle>
              </div>

              <v-row dense>
                <v-col
                  v-for="milestone in filteredMilestones"
                  :key="milestone.id"
                  cols="12"
                  md="6"
                  lg="6"
                >
                  <v-card variant="outlined" rounded="lg" class="h-100">
                    <v-card-text class="py-3">
                      <div class="d-flex align-center ga-2 mb-2">
                        <v-chip size="x-small" :color="getMilestoneStatusColor(milestone.status)" variant="tonal">
                          {{ milestone.status }}
                        </v-chip>
                        <v-spacer />
                        <span class="text-caption text-grey">
                          {{ milestone.targetDate ? formatDate(milestone.targetDate) : 'No target date' }}
                        </span>
                      </div>
                      <div class="text-subtitle-2 font-weight-medium mb-2">
                        {{ milestone.name || 'Untitled milestone' }}
                      </div>
                      <div class="d-flex align-center ga-2 mb-2">
                        <v-progress-linear
                          :model-value="milestone.progress ?? 0"
                          :color="(milestone.progress ?? 0) >= 100 ? 'success' : 'primary'"
                          height="6"
                          rounded
                        />
                        <span class="text-body-2">{{ milestone.progress ?? 0 }}%</span>
                      </div>
                      <v-btn size="small" variant="text" color="primary" prepend-icon="mdi-eye-outline" @click="openMilestoneDetail(milestone)">
                        View Details
                      </v-btn>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Empty state when filters produce no results -->
              <div v-if="filteredMilestones.length === 0" class="text-center text-grey py-4">
                <v-icon icon="mdi-flag-outline" size="32" color="grey-lighten-2" class="d-block mx-auto mb-2" />
                No milestones match the current filters.
                <v-btn size="small" variant="text" color="primary" class="ml-1" @click="milestoneSearch = ''; milestoneStatusFilter = null">Clear filters</v-btn>
              </div>
            </v-card-text>
            <v-card-text v-else class="text-center text-grey py-6">
              <v-icon icon="mdi-flag-outline" size="40" color="grey-lighten-2" class="d-block mx-auto mb-2" />
              No milestones recorded.
            </v-card-text>
          </v-card>

          <!-- Priority #3: Timelogs -->
          <v-divider class="my-4" />
          <div class="text-subtitle-1 font-weight-medium mb-3 d-flex align-center ga-2">
            <v-icon color="teal" size="small">mdi-clipboard-text-clock-outline</v-icon>
            Timelogs
          </div>
          <!-- FFF-B: Timelogs container (weekly/monthly work logs) -->
          <CiTimelogsContainer
            v-if="projectId"
            :project-id="projectId"
            :read-only="true"
            :can-delete="false"
          />

          <!-- Priority #4: Revision Orders (historical / schedule amendments) -->
          <v-divider class="my-4" />
          <div class="text-subtitle-1 font-weight-medium mb-3 d-flex align-center ga-2">
            <v-icon color="warning" size="small">mdi-file-document-edit-outline</v-icon>
            Revision Orders
            <span class="text-caption text-grey font-weight-regular">— schedule amendments (VOR / CTE)</span>
          </div>
          <CiRevisionOrdersTable
            v-if="projectId"
            :project-id="projectId"
            :read-only="true"
          />
        </v-window-item>


        <!-- ME: POW window item removed -->

        <!-- ============= ANALYTICS TAB (KD-F, KM-B: ClientOnly+eager) ============= -->
        <v-window-item value="analytics" eager>
          <ClientOnly>
            <CiProjectAnalyticsTab
              v-if="project"
              :project-id="projectId"
              :project="project"
              @go-to-edit="editSection('basic')"
            />
            <template #fallback>
              <v-row dense>
                <v-col v-for="n in 4" :key="n" cols="6" md="3">
                  <v-skeleton-loader type="card" height="92" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-skeleton-loader type="card" height="360" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-skeleton-loader type="card" height="360" />
                </v-col>
              </v-row>
            </template>
          </ClientOnly>
        </v-window-item>

        <!-- ============= ATTACHMENTS TAB (ZQ: enterprise 4-section layout; gallery merged in) ============= -->
        <v-window-item value="documents">
          <!-- ZZ-B: Attachment tab fully delegated to CiAttachmentHub (view mode) -->
          <CiAttachmentHub
            :project-id="projectId"
            mode="view"
            :can-upload="false"
            :can-delete="false"
            :can-edit-remarks="false"
            :custom-key-sections="project?.customKeySections ?? []"
            :custom-supporting-sections="project?.customSupportingSections ?? []"
          />
        </v-window-item>
      </v-window>
    </template>

    <!-- ===================== Dialogs (outside tabs) ===================== -->

    <!-- LA-E: Profile image fullscreen preview with metadata -->
    <v-dialog v-model="profilePreviewOpen" max-width="960">
      <v-card>
        <v-img :src="profilePreviewImg" contain max-height="75vh" />
        <v-card-text v-if="profilePreviewTitle || profilePreviewDate || profilePreviewUploadDate" class="py-2 d-flex align-center ga-3 flex-wrap">
          <div v-if="profilePreviewTitle" class="text-body-1 font-weight-medium">{{ profilePreviewTitle }}</div>
          <!-- LD-B: Taken date chip (primary) -->
          <v-chip v-if="profilePreviewDate" size="small" variant="tonal" color="blue-grey">
            <v-icon start size="12">mdi-camera</v-icon>
            Taken: {{ formatDate(profilePreviewDate) }}
          </v-chip>
          <!-- LD-B: Upload date chip (secondary, only when different from taken date) -->
          <v-chip v-if="profilePreviewUploadDate && profilePreviewUploadDate !== profilePreviewDate" size="small" variant="tonal" color="grey">
            <v-icon start size="12">mdi-calendar-upload</v-icon>
            Uploaded: {{ formatDate(profilePreviewUploadDate) }}
          </v-chip>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="tonal" @click="profilePreviewOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- KN-A: Milestone Detail Modal -->
    <v-dialog v-model="milestoneDetailDialogOpen" max-width="600" scrollable>
      <v-card v-if="selectedMilestone">
        <v-card-title class="d-flex align-center ga-2 pa-4">
          <v-icon icon="mdi-flag" color="primary" />
          {{ selectedMilestone.title }}
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="milestoneDetailDialogOpen = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <div class="d-flex align-center ga-2 flex-wrap mb-3">
            <v-chip
              size="small"
              variant="tonal"
              :color="selectedMilestone.status === 'COMPLETED' ? 'success' : selectedMilestone.status === 'DELAYED' ? 'error' : 'primary'"
            >
              {{ selectedMilestone.status }}
            </v-chip>
            <v-chip v-if="selectedMilestone.category" size="small" variant="tonal" color="info">
              {{ selectedMilestone.category }}
            </v-chip>
          </div>
          <div class="mb-3">
            <div class="text-caption text-grey">Progress</div>
            <v-progress-linear
              :model-value="selectedMilestone.progress"
              :color="selectedMilestone.progress >= 100 ? 'success' : 'primary'"
              height="10"
              rounded
            />
            <div class="text-caption font-weight-medium mt-1">{{ selectedMilestone.progress }}%</div>
          </div>
          <v-row dense class="mb-3">
            <v-col cols="12" sm="4">
              <div class="text-caption text-grey">Start Date</div>
              <div class="text-body-2">{{ selectedMilestone.startDate ? formatDate(selectedMilestone.startDate) : 'â€”' }}</div>
            </v-col>
            <v-col cols="12" sm="4">
              <div class="text-caption text-grey">Target Date</div>
              <div class="text-body-2">{{ selectedMilestone.targetDate ? formatDate(selectedMilestone.targetDate) : 'â€”' }}</div>
            </v-col>
            <v-col cols="12" sm="4">
              <div class="text-caption text-grey">Actual Date</div>
              <div class="text-body-2">{{ selectedMilestone.actualDate ? formatDate(selectedMilestone.actualDate) : 'â€”' }}</div>
            </v-col>
          </v-row>
          <div v-if="selectedMilestone.description" class="mb-3">
            <div class="text-caption text-grey">Description</div>
            <div class="text-body-2">{{ selectedMilestone.description }}</div>
          </div>
          <div v-if="selectedMilestone.remarks" class="mb-3">
            <div class="text-caption text-grey">Remarks</div>
            <div class="text-body-2">{{ selectedMilestone.remarks }}</div>
          </div>
          <!-- KO-D: MOV evidence section -->
          <v-divider class="my-4" />
          <CiMovEvidenceSection
            v-if="selectedMilestone"
            :project-id="projectId"
            related-entity-type="MILESTONE"
            :related-entity-id="selectedMilestone.id"
            :can-edit="false"
            :open-key="`milestone-${selectedMilestone.id}-${milestoneDetailDialogOpen}`"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="tonal" @click="milestoneDetailDialogOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- KN-D: Document Detail Modal -->
    <v-dialog v-model="docDetailDialogOpen" max-width="640" scrollable>
      <v-card v-if="selectedDoc">
        <!-- LB-B: stable title â€” fileName moved to body to prevent overflow -->
        <v-card-title class="d-flex align-center ga-2 pa-4">
          <v-icon icon="mdi-file-document" color="primary" />
          Document
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="docDetailDialogOpen = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pt-3 pb-0 px-4">
          <div class="text-h6 font-weight-medium" style="word-break:break-word;line-height:1.3">
            {{ selectedDoc.fileName }}
          </div>
        </v-card-text>
        <v-card-text class="pa-4">
          <div class="d-flex align-center ga-2 flex-wrap mb-3">
            <v-chip v-if="selectedDoc.documentType" size="small" variant="tonal" color="primary">
              {{ selectedDoc.documentType }}
            </v-chip>
            <v-chip v-if="selectedDoc.category" size="small" variant="tonal" color="info">
              {{ selectedDoc.category }}
            </v-chip>
            <!-- LD-D: version chip â€” prominent (flat success) to signal latest version -->
            <v-chip v-if="selectedDoc.version != null" size="small" variant="flat" color="success">
              v{{ selectedDoc.version }} (Latest)
            </v-chip>
            <v-chip v-if="selectedDoc.lifecycleStatus" size="small" variant="tonal" color="warning">
              {{ selectedDoc.lifecycleStatus }}
            </v-chip>
          </div>
          <!-- LD-D: inline image preview for image/* mime types -->
          <v-img
            v-if="selectedDoc.filePath && selectedDoc.mimeType?.startsWith('image/')"
            :src="selectedDoc.filePath"
            max-height="280"
            contain
            class="rounded mb-3 bg-grey-lighten-4"
          />
          <div class="mb-2 text-body-2">
            <span class="text-caption text-grey">Uploaded:</span>
            {{ selectedDoc.createdAt ? formatDate(selectedDoc.createdAt) : 'â€”' }}
          </div>
          <div v-if="selectedDoc.fileSize != null" class="mb-2 text-body-2">
            <span class="text-caption text-grey">Size:</span>
            {{ formatFileSize(selectedDoc.fileSize) }}
          </div>
          <div v-if="selectedDoc.description" class="mt-3">
            <div class="text-caption text-grey">Description</div>
            <div class="text-body-2">{{ selectedDoc.description }}</div>
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="tonal" @click="docDetailDialogOpen = false">Close</v-btn>
          <v-btn
            v-if="selectedDoc.filePath"
            color="primary"
            variant="flat"
            prepend-icon="mdi-download"
            :href="selectedDoc.filePath"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- KN-F: Documents Overflow Window (>10 files) -->
    <v-dialog v-model="docsWindowOpen" max-width="1100" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center ga-2 pa-4">
          <v-icon icon="mdi-file-multiple" color="primary" />
          All Attachments
          <v-chip size="x-small" variant="tonal" color="primary" class="ml-1">
            {{ filteredAllDocs.length }}
          </v-chip>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="docsWindowOpen = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-row dense class="mb-3">
            <v-col cols="12" md="5">
              <v-text-field
                v-model="docsWindowSearch"
                placeholder="Search filesâ€¦"
                prepend-inner-icon="mdi-magnify"
                density="compact"
                variant="outlined"
                hide-details
                clearable
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="docsWindowCategoryFilter"
                :items="docsWindowCategories"
                density="compact"
                variant="outlined"
                hide-details
                label="Category"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="docsWindowSort"
                :items="[{ title: 'Newest first', value: 'newest' }, { title: 'Oldest first', value: 'oldest' }]"
                density="compact"
                variant="outlined"
                hide-details
                label="Sort"
              />
            </v-col>
          </v-row>
          <v-list density="comfortable" class="pa-0">
            <v-list-item
              v-for="doc in filteredAllDocs"
              :key="doc.id"
              style="cursor: pointer"
              @click="openDocDetail(doc); docsWindowOpen = false"
            >
              <template #prepend>
                <v-icon color="primary">mdi-file-document</v-icon>
              </template>
              <v-list-item-title>{{ doc.fileName }}</v-list-item-title>
              <v-list-item-subtitle>
                <span v-if="doc.documentType">{{ doc.documentType }} Â· </span>
                <span v-if="doc.createdAt">{{ formatDate(doc.createdAt) }}</span>
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="filteredAllDocs.length === 0" class="text-center text-grey py-6">
              No files match your filters.
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Workflow Action Dialog -->
    <v-dialog v-model="workflowDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="text-h6">
          <template v-if="workflowAction === 'submit'">Submit for Review</template>
          <template v-else-if="workflowAction === 'publish'">Publish Project</template>
          <template v-else-if="workflowAction === 'withdraw'">Withdraw Submission</template>
          <template v-else>Reject Project</template>
        </v-card-title>
        <v-card-text>
          <template v-if="workflowAction === 'submit'">
            <p>
              Submit <strong>{{ project?.projectName }}</strong> for admin review?
            </p>
            <p class="text-caption text-grey mt-2">
              An administrator will review and approve or reject this project.
            </p>
          </template>
          <template v-else-if="workflowAction === 'publish'">
            <p>
              Publish <strong>{{ project?.projectName }}</strong>?
            </p>
            <p class="text-caption text-grey mt-2">
              This will make the project visible to all users.
            </p>
          </template>
          <template v-else-if="workflowAction === 'withdraw'">
            <p>
              Withdraw the review submission for <strong>{{ project?.projectName }}</strong>?
            </p>
            <p class="text-caption text-grey mt-2">
              The project will return to DRAFT status.
            </p>
          </template>
          <template v-else>
            <p class="mb-4">
              Reject <strong>{{ project?.projectName }}</strong>?
            </p>
            <v-textarea
              v-model="rejectionNotes"
              label="Rejection Notes (optional)"
              placeholder="Explain why this project was rejected..."
              rows="3"
              variant="outlined"
              hide-details
            />
          </template>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="workflowProcessing" @click="workflowDialog = false">Cancel</v-btn>
          <v-btn
            :color="workflowAction === 'reject' ? 'error' : workflowAction === 'publish' ? 'success' : 'orange'"
            variant="flat"
            :loading="workflowProcessing"
            @click="executeWorkflowAction"
          >
            <template v-if="workflowAction === 'submit'">Submit</template>
            <template v-else-if="workflowAction === 'publish'">Publish</template>
            <template v-else-if="workflowAction === 'withdraw'">Withdraw</template>
            <template v-else>Reject</template>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- KD-B: Scroll-to-top FAB -->
    <CiScrollToTopFab />
  </div>
</template>

<style scoped>
/* FFF-A */
.cursor-zoom-in { cursor: zoom-in; }
.carousel-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.65));
  color: #fff;
}
@media (min-width: 960px) {
  .overview-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  .overview-grid > .v-expansion-panel {
    flex: 1 1 calc(50% - 12px);
    max-width: calc(50% - 12px);
  }
}
</style>
