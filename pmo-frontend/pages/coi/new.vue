<script setup lang="ts">
import { type CsuPersonnelRow, type ContractorPersonnelRow, type OthersPersonnelRow, type StagedQueue } from '~/utils/coiFormState'
import CiPersonnelAccessCard from '~/components/coi/CiPersonnelAccessCard.vue'
import CiAttachmentHub from '~/components/coi/CiAttachmentHub.vue'
definePageMeta({
  middleware: ['auth', 'permission'],
})

// TC: Defense-in-depth behind TB middleware â€” contractors must never access project creation
const { isContractor } = usePermissions()
if (isContractor.value) {
  await navigateTo('/dashboard')
}

const router = useRouter()
const api = useApi()
const toast = useToast()

const loading = ref(false)
const submitting = ref(false)

// Phase AO: Staff users for assignment dropdown
const staffUsers = ref<{ id: string; first_name: string; last_name: string }[]>([])

// MG (2026-05-21): Form state restructured to match BasicInfoFormState interface.
// Status default updated to PROPOSAL (PLANNING removed in MF normalization).
const form = ref({
  // Identity
  project_code: '',
  title: '',
  description: '',
  campus: '',
  status: 'PROPOSAL',
  // Location (MG)
  spatial_coverage: '',
  municipality: '',
  province: '',
  // Implementation Agencies (MG)
  implementing_agency: '',
  co_implementing_agency: '',
  attached_agency: '',
  // Funding hybrid (MG)
  funding_source_id: '',
  funding_source_type: '',
  additional_funding_sources: [] as { type: string; name: string; notes?: string }[],
  cost_amount: null as number | null,
  // Contractor as free-text (MG)
  contractor: '',
  // Objectives (dynamic, MG)
  objectives_list: [] as string[],
  // Beneficiaries (MG â€” aggregate count removed per ECO directive 2026-05-21)
  beneficiary_list: [] as string[],
  // Strategic Alignment (MG)
  rdp_alignment: [] as string[],
  socioeconomic_agenda: [] as string[],
  csu_likha_goals: [] as string[],
  strategic_alignment: '',
  // NC: Migrated from textareas to bullet lists
  output_indicators_list: [] as string[],
  outcome_indicators_list: [] as string[],
  // Legacy back-compat
  output_indicators: '',
  outcome_indicators: '',
  // Other attributes
  project_engineer: '',
  building_type: '',
  floor_area: null as number | null,
  // Schedule â€” Primary Dates (Schedule tab)
  start_date: '',
  target_completion_date: '',
  actual_completion_date: '',
  project_duration: '',
  project_duration_days: null as number | null,
  // Schedule â€” Revision Orders (MH)
  original_start_date: '',
  revised_start_date: '',
  original_completion_date: '',
  revised_completion_date: '',
  revised_project_duration: '',
  original_contract_duration: '',
  // Progress targets
  target_physical_progress: 100 as number,
  target_financial_progress: 100 as number,
  // MI: Progress & Financial Status
  physical_progress: null as number | null,
  financial_progress: null as number | null,
  as_of_date: '',
  cost_incurred_to_date: null as number | null,
  date_completed: '',
  // MI: Chronological remarks log entries (local-staged; mapped to backend remarks_log JSONB)
  // OK-B: type widened to match CiRemarksLog RemarkEntry interface
  remarks_log_entries: [] as Array<{ id?: string; text: string; author?: string; createdAt: string; updatedAt?: string; updatedBy?: string }>,
  // Personnel (still on Personnel tab)
  project_manager: '',
  assigned_user_ids: [] as string[],
  // Legacy fields kept (no longer rendered, kept for back-compat hydration)
  summary: '',
  objectives: '',
  key_features: '',
  scope: '',
  facilities: '',
  number_of_floors: null as number | null,
  latitude: null as number | null,
  longitude: null as number | null,
  contractor_id: '',
  contract_number: '',
  contract_amount: null as number | null,
  beneficiaries: null as number | null,
  project_status_category: '',
})

// KE-AA: JSONB row arrays for Profile sections (now in Basic Info)
const statusUpdateRows  = ref<Array<{ date: string; text: string }>>([])
const readinessDocRows  = ref<Array<{ type: string; status: string; remarks: string }>>([])
const signatoryRows     = ref<Array<{ name: string; position: string; date: string }>>([])
// LX-A: Others tab â€” mirrors edit-[id].vue administrative records
const incidentLogRows   = ref<Array<{ date: string; severity: string; description: string; status: string }>>([])
const riskRegisterRows  = ref<Array<{ risk: string; likelihood: string; impact: string; mitigation: string; status: string }>>([])
const escalationRows    = ref<Array<{ escalatedTo: string; date: string; issue: string; resolution: string }>>([])
// MJ: Non-system personnel group rows (JSONB)
const csuPersonnelRows        = ref<CsuPersonnelRow[]>([])
const contractorPersonnelRows = ref<ContractorPersonnelRow[]>([])
const othersPersonnelRows     = ref<OthersPersonnelRow[]>([])

// Lookup data
const fundingSources = ref<{ id: string; name: string }[]>([])
const contractors = ref<{ id: string; name: string }[]>([])

// MG: Relaxed project code validation â€” free-form per ECO directive.
const rules = {
  required: (v: string) => !!v || 'This field is required',
  positiveNumber: (v: number | null) => v === null || v >= 0 || 'Must be a positive number',
}

// MH: Date helpers + per-field menu state for Vuetify date pickers
function toIsoDate(d: Date | string | null | undefined): string {
  if (!d) return ''
  if (typeof d === 'string') return d.slice(0, 10)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function isoToDate(iso: string): Date | null {
  return iso ? new Date(iso + 'T00:00:00') : null
}
const startDateMenu              = ref(false)
const targetCompletionMenu       = ref(false)
const actualCompletionMenu       = ref(false)
const origStartDateMenu          = ref(false)
const revStartDateMenu           = ref(false)
const origCompletionDateMenu     = ref(false)
const revCompletionDateMenu      = ref(false)
// MI: progress tab date menus
const progAsOfDateMenu           = ref(false)
const progDateCompletedMenu      = ref(false)

// LX-A: Others tab helpers â€” mirrors edit-[id].vue
function addStatusUpdate()            { statusUpdateRows.value.push({ date: '', text: '' }) }
function removeStatusUpdate(i: number){ statusUpdateRows.value.splice(i, 1) }
function addReadinessDoc()            { readinessDocRows.value.push({ type: '', status: '', remarks: '' }) }
function removeReadinessDoc(i: number){ readinessDocRows.value.splice(i, 1) }
function addSignatory()               { signatoryRows.value.push({ name: '', position: '', date: '' }) }
function removeSignatory(i: number)   { signatoryRows.value.splice(i, 1) }
function addIncident()                { incidentLogRows.value.push({ date: '', severity: 'MEDIUM', description: '', status: 'OPEN' }) }
function removeIncident(i: number)    { incidentLogRows.value.splice(i, 1) }
function addRisk()                    { riskRegisterRows.value.push({ risk: '', likelihood: 'MEDIUM', impact: 'MEDIUM', mitigation: '', status: 'OPEN' }) }
function removeRisk(i: number)        { riskRegisterRows.value.splice(i, 1) }
function addEscalation()              { escalationRows.value.push({ escalatedTo: '', date: '', issue: '', resolution: '' }) }
function removeEscalation(i: number)  { escalationRows.value.splice(i, 1) }

// MH-MOV: Revision Order Means of Verification staging (new project workflow).
// File uploads queued into pendingDocs (documentType='revision_order_mov');
// links queued into pendingLinks (documentType='revision_order_mov').
interface StagedRevisionMov { link?: string; file?: File }
const revisionMovLink = ref('')
const revisionMovFile = ref<File | null>(null)
const stagedRevisionMov = ref<StagedRevisionMov[]>([])
function stageRevisionMov() {
  const link = revisionMovLink.value.trim()
  const file = revisionMovFile.value
  if (!link && !file) return
  stagedRevisionMov.value.push({ link: link || undefined, file: file || undefined })
  if (file) {
    pendingDocs.value.push({
      file,
      documentType: 'revision_order_mov',
      description: 'Revision Order MOV',
    })
  }
  if (link) {
    pendingLinks.value.push({
      url: link,
      title: 'Revision Order MOV',
      description: 'Documentary means of verification for revision orders',
    })
  }
  revisionMovLink.value = ''
  revisionMovFile.value = null
}

// Fetch lookup data
async function fetchLookups() {
  loading.value = true
  try {
    const [fundingRes, contractorRes] = await Promise.all([
      api.get<{ data: { id: string; name: string }[] }>('/api/funding-sources'),
      api.get<{ data: { id: string; name: string }[] }>('/api/contractors'),
    ])
    fundingSources.value = fundingRes.data || []
    contractors.value = contractorRes.data || []
  } catch (err) {
    console.error('Failed to fetch lookup data:', err)
  } finally {
    loading.value = false
  }
}

// Tab navigation state â€” LX-A: added `others` tab to sync with edit-[id].vue
const activeTab = ref('basic')
// MI: Added `progress` tab between schedule and personnel; LX-A: added `others`
const tabOrder = ['basic', 'schedule', 'progress', 'personnel', 'documents', 'others'] as const

// JO-D: Pending uploads (staged in browser memory until project is created)
interface PendingDoc { file: File; documentType: string; description: string }
interface PendingImage { file: File; caption: string; category: string }
interface PendingLink { url: string; title: string; description: string }
const pendingDocs = ref<PendingDoc[]>([])
const pendingImages = ref<PendingImage[]>([])
const pendingLinks = ref<PendingLink[]>([])

// ZZ-B: Bridge the staging queue between CiAttachmentHub and the existing
// pending* refs. The refs are shared with the revision-order MOV staging flow,
// so they stay; the hub reads/writes them through this proxy.
const pendingQueue = computed<StagedQueue>(() => ({
  docs: pendingDocs.value,
  images: pendingImages.value,
  links: pendingLinks.value,
}))
function onQueueUpdate(q: StagedQueue) {
  pendingDocs.value = q.docs
  pendingImages.value = q.images
  pendingLinks.value = q.links
}

// Input bindings for the documents tab
const newDocFile = ref<File | null>(null)
const newDocType = ref('attachment')
const newDocDescription = ref('')
const newImageFile = ref<File | null>(null)
const newImageCategory = ref('IN_PROGRESS')
const newImageCaption = ref('')
const newLinkUrl = ref('')
const newLinkTitle = ref('')
const newLinkDescription = ref('')

const EXTERNAL_URL_REGEX = /^https?:\/\/.+/i

function addPendingDoc() {
  if (!newDocFile.value) return
  if (newDocFile.value.size > 20 * 1024 * 1024) {
    toast.error('File exceeds 20 MB. Use an external link instead.')
    return
  }
  pendingDocs.value.push({
    file: newDocFile.value,
    documentType: newDocType.value,
    description: newDocDescription.value,
  })
  newDocFile.value = null
  newDocType.value = 'attachment'
  newDocDescription.value = ''
}

function addPendingImage() {
  if (!newImageFile.value) return
  if (newImageFile.value.size > 10 * 1024 * 1024) {
    toast.error('Image exceeds 10 MB.')
    return
  }
  pendingImages.value.push({
    file: newImageFile.value,
    caption: newImageCaption.value,
    category: newImageCategory.value,
  })
  newImageFile.value = null
  newImageCaption.value = ''
  newImageCategory.value = 'IN_PROGRESS'
}

function addPendingLink() {
  if (!newLinkUrl.value) return
  if (!EXTERNAL_URL_REGEX.test(newLinkUrl.value)) {
    toast.error('Must be a valid URL starting with http:// or https://')
    return
  }
  pendingLinks.value.push({
    url: newLinkUrl.value,
    title: newLinkTitle.value,
    description: newLinkDescription.value,
  })
  newLinkUrl.value = ''
  newLinkTitle.value = ''
  newLinkDescription.value = ''
}

// JO-B: Engagement-based completion (checkmark = user filled at least one field in tab)
// KG-A: 4-tab structure; funding_source_id now required in basic
const tabCompletion = computed(() => ({
  basic: !!(form.value.project_code && form.value.title && form.value.campus && form.value.status && form.value.funding_source_id),
  schedule: !!(
    form.value.start_date ||
    form.value.target_completion_date ||
    form.value.actual_completion_date ||
    form.value.project_duration_days ||
    form.value.original_contract_duration
  ),
  progress: !!(
    (form.value.physical_progress != null && form.value.physical_progress !== 0) ||
    form.value.as_of_date ||
    (form.value.cost_incurred_to_date != null) ||
    form.value.date_completed ||
    (form.value.remarks_log_entries && form.value.remarks_log_entries.length > 0)
  ),
  personnel: !!(
    form.value.project_engineer ||
    form.value.project_manager ||
    (form.value.assigned_user_ids && form.value.assigned_user_ids.length > 0)
  ),
  documents:
    pendingDocs.value.length + pendingImages.value.length + pendingLinks.value.length > 0,
  // LX-A: others tab completion
  others: statusUpdateRows.value.length > 0 || readinessDocRows.value.length > 0 || signatoryRows.value.length > 0 || incidentLogRows.value.length > 0 || riskRegisterRows.value.length > 0 || escalationRows.value.length > 0,
}))

// JO-B: Required-field validity for navigation gating (separate from engagement)
// KG-A: funding_source_id moves into basic required
const tabRequired = computed(() => ({
  basic: !!(form.value.project_code && form.value.title && form.value.campus && form.value.status && form.value.funding_source_id),
  schedule: true,
  progress: true,
  personnel: true,
  documents: true,
  others: true,
}))

// JN-B: Step progress indicators
const currentStepIndex = computed(() =>
  tabOrder.indexOf(activeTab.value as typeof tabOrder[number])
)
const completionPercentage = computed(() => {
  const completed = Object.values(tabCompletion.value).filter(Boolean).length
  return Math.round((completed / tabOrder.length) * 100)
})

// JO-C: Guarded navigation
function nextTab() {
  const cur = activeTab.value as typeof tabOrder[number]
  if (!tabRequired.value[cur]) {
    toast.error(`Please complete required fields in "${cur}" before continuing`)
    return
  }
  const idx = tabOrder.indexOf(cur)
  if (idx < tabOrder.length - 1) activeTab.value = tabOrder[idx + 1]
}

function prevTab() {
  const idx = tabOrder.indexOf(activeTab.value as typeof tabOrder[number])
  if (idx > 0) activeTab.value = tabOrder[idx - 1]
}

// Map raw API errors to user-friendly messages
function mapApiError(err: unknown): string {
  const msg: string = (err as { message?: string })?.message ?? ''
  if (/duplicate key|already exists|already in use|project_code/i.test(msg)) {
    return 'This project code is already in use. Please choose a different code.'
  }
  if (/validation failed|bad request/i.test(msg)) {
    return 'Some fields have invalid values. Please check the form and try again.'
  }
  if (/unauthorized|forbidden/i.test(msg)) {
    return 'You do not have permission to perform this action.'
  }
  if (/network|failed to fetch|econnrefused/i.test(msg)) {
    return 'Cannot reach the server. Please check your connection and try again.'
  }
  return 'Something went wrong. Please try again or contact support.'
}

// Submit form
async function handleSubmit() {
  // JO-C: Full-form gate â€” jump to first invalid required tab
  const incomplete = (Object.keys(tabRequired.value) as Array<keyof typeof tabRequired.value>)
    .filter(k => !tabRequired.value[k])
  if (incomplete.length > 0) {
    activeTab.value = incomplete[0]
    toast.error(`Required fields incomplete in: ${incomplete.join(', ')}`)
    return
  }

  submitting.value = true

  try {
    // Do NOT send project_id - backend will create base projects record and generate ID
    // MG: Objectives is now a dynamic bullet list (objectives_list); fall back
    // to legacy textarea split for back-compat.
    const objectivesArr = (form.value.objectives_list || []).map(s => s.trim()).filter(Boolean)
    const beneficiaryArr = (form.value.beneficiary_list || []).map(s => s.trim()).filter(Boolean)

    const payload = {
      // Identity
      project_code: form.value.project_code,
      title: form.value.title,
      description: form.value.description || undefined,
      campus: form.value.campus,
      status: form.value.status,
      // Objectives (dynamic)
      objectives: objectivesArr.length > 0 ? objectivesArr : undefined,
      // Location (MG)
      spatial_coverage: form.value.spatial_coverage || undefined,
      municipality: form.value.municipality || undefined,
      province: form.value.province || undefined,
      // Implementation Agencies (MG)
      implementing_agency: form.value.implementing_agency || undefined,
      co_implementing_agency: form.value.co_implementing_agency || undefined,
      attached_agency: form.value.attached_agency || undefined,
      // Funding hybrid (MG) â€” cost_amount is the canonical field; backend remaps to contract_amount
      funding_source_id: form.value.funding_source_id || undefined,
      funding_source_type: form.value.funding_source_type || undefined,
      additional_funding_sources: form.value.additional_funding_sources?.length
        ? form.value.additional_funding_sources
        : undefined,
      cost_amount: form.value.cost_amount ?? undefined,
      // Contractor (text â€” MG)
      contractor: form.value.contractor || undefined,
      // Beneficiaries (MG â€” aggregate count removed)
      beneficiary_list: beneficiaryArr.length > 0 ? beneficiaryArr : undefined,
      // Strategic Alignment (MG)
      rdp_alignment: form.value.rdp_alignment?.length ? form.value.rdp_alignment : undefined,
      socioeconomic_agenda: form.value.socioeconomic_agenda?.length ? form.value.socioeconomic_agenda : undefined,
      csu_likha_goals: form.value.csu_likha_goals?.length ? form.value.csu_likha_goals : undefined,
      strategic_alignment: form.value.strategic_alignment || undefined,
      // NC: Indicators now sourced from bullet-list arrays
      output_indicators: form.value.output_indicators_list?.length
        ? form.value.output_indicators_list.map(s => s.trim()).filter(Boolean)
        : (form.value.output_indicators ? form.value.output_indicators.split('\n').map(s => s.trim()).filter(Boolean) : undefined),
      outcome_indicators: form.value.outcome_indicators_list?.length
        ? form.value.outcome_indicators_list.map(s => s.trim()).filter(Boolean)
        : (form.value.outcome_indicators ? form.value.outcome_indicators.split('\n').map(s => s.trim()).filter(Boolean) : undefined),
      // Other attributes
      project_engineer: form.value.project_engineer || undefined,
      building_type: form.value.building_type || undefined,
      floor_area: form.value.floor_area || undefined,
      // Schedule â€” Primary Dates
      start_date: form.value.start_date || undefined,
      target_completion_date: form.value.target_completion_date || undefined,
      actual_completion_date: form.value.actual_completion_date || undefined,
      // MH: prefer days-integer; coerce to existing `project_duration` text column
      project_duration: form.value.project_duration_days != null
        ? `${form.value.project_duration_days} days`
        : (form.value.project_duration || undefined),
      // Schedule â€” Revision Orders (MH)
      original_start_date: form.value.original_start_date || undefined,
      revised_start_date: form.value.revised_start_date || undefined,
      original_completion_date: form.value.original_completion_date || undefined,
      revised_completion_date: form.value.revised_completion_date || undefined,
      revised_project_duration: form.value.revised_project_duration || undefined,
      original_contract_duration: form.value.original_contract_duration || undefined,
      target_physical_progress: form.value.target_physical_progress ?? undefined,
      target_financial_progress: form.value.target_financial_progress ?? undefined,
      // MI: Progress & Financial Status
      physical_progress: form.value.physical_progress ?? undefined,
      financial_progress: form.value.financial_progress ?? undefined,
      as_of_date: form.value.as_of_date || undefined,
      cost_incurred_to_date: form.value.cost_incurred_to_date ?? undefined,
      // MI: Remarks log â€” strip UI-only author resolution; server sets it from JWT
      remarks_log: form.value.remarks_log_entries?.length
        ? form.value.remarks_log_entries.map(r => ({ text: r.text, created_at: r.createdAt }))
        : undefined,
      // Personnel
      project_manager: form.value.project_manager || undefined,
      assigned_user_ids: form.value.assigned_user_ids.length > 0 ? form.value.assigned_user_ids : undefined,
      // Administrative records
      status_updates: statusUpdateRows.value.length > 0 ? statusUpdateRows.value : undefined,
      readiness_docs: readinessDocRows.value.length > 0 ? readinessDocRows.value : undefined,
      signatories: signatoryRows.value.length > 0 ? signatoryRows.value : undefined,
      // LX-A: others tab fields
      incident_log: incidentLogRows.value.length > 0 ? incidentLogRows.value : undefined,
      risk_register: riskRegisterRows.value.length > 0 ? riskRegisterRows.value : undefined,
      escalation_records: escalationRows.value.length > 0 ? escalationRows.value : undefined,
      personnel_groups: {
        csu: csuPersonnelRows.value,
        contractor: contractorPersonnelRows.value,
        others: othersPersonnelRows.value,
      },
    }

    console.log('[COI Create] Submitting:', payload)
    const created = await api.post<{ id?: string }>('/api/construction-projects', payload)
    if (!created?.id) {
      toast.success('Project created successfully')
      router.push('/coi')
      return
    }

    // JO-D Stage 2: best-effort upload of staged files
    const totalAttachments =
      pendingDocs.value.length + pendingImages.value.length + pendingLinks.value.length
    if (totalAttachments === 0) {
      toast.success('Project created successfully')
      router.push(`/coi/detail-${created.id}`)
      return
    }

    const failures: string[] = []
    let successCount = 0
    for (const d of pendingDocs.value) {
      try {
        const fd = new FormData()
        fd.append('file', d.file)
        fd.append('documentType', d.documentType)
        if (d.description) fd.append('description', d.description)
        await api.upload(`/api/construction-projects/${created.id}/documents`, fd)
        successCount++
      } catch (e: unknown) {
        failures.push(`${d.file.name}: ${(e as { message?: string })?.message || 'failed'}`)
      }
    }
    for (const im of pendingImages.value) {
      try {
        const fd = new FormData()
        fd.append('file', im.file)
        if (im.caption) fd.append('caption', im.caption)
        fd.append('category', im.category)
        await api.upload(`/api/construction-projects/${created.id}/gallery`, fd)
        successCount++
      } catch (e: unknown) {
        failures.push(`${im.file.name}: ${(e as { message?: string })?.message || 'failed'}`)
      }
    }
    for (const lk of pendingLinks.value) {
      try {
        await api.post(`/api/construction-projects/${created.id}/documents`, {
          documentType: 'link',
          externalLink: lk.url,
          title: lk.title || undefined,
          description: lk.description || undefined,
        })
        successCount++
      } catch (e: unknown) {
        failures.push(`${lk.url}: ${(e as { message?: string })?.message || 'failed'}`)
      }
    }

    if (failures.length === 0) {
      toast.success(`Project created with ${successCount} attachment(s)`)
    } else {
      toast.error(
        `Project created. ${failures.length} of ${totalAttachments} uploads failed (retry from detail page).`
      )
      console.warn('[COI Create] Upload failures:', failures)
    }
    router.push(`/coi/detail-${created.id}`)
  } catch (err: unknown) {
    toast.error(mapApiError(err))
    console.error('[COI Create] Failed:', err)
  } finally {
    submitting.value = false
  }
}

// Navigation
function goBack() {
  router.push('/coi')
}

// Phase AV: Fetch eligible staff once on mount (global, no campus filter)
async function fetchEligibleStaff() {
  try {
    const res = await api.get<{ id: string; first_name: string; last_name: string }[]>(
      '/api/users/eligible-for-assignment'
    )
    staffUsers.value = Array.isArray(res) ? res : []
  } catch (err) {
    console.error('[COI Create] Failed to fetch eligible staff:', err)
    staffUsers.value = []
  }
}

onMounted(() => {
  fetchLookups()
  fetchEligibleStaff()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center ga-3 mb-4">
      <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" />
      <div>
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          New Construction Project
        </h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          Create a new construction project
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <v-card v-if="loading" class="pa-6">
      <v-skeleton-loader type="article" />
    </v-card>

    <!-- Form (JJ-D: Tabbed Layout) -->
    <v-form v-else @submit.prevent="handleSubmit">
      <!-- JN-B: Step progress indicator -->
      <v-card class="mb-2 pa-3">
        <div class="d-flex align-center justify-space-between mb-2">
          <span class="text-body-2 font-weight-medium">
            Step {{ currentStepIndex + 1 }} of {{ tabOrder.length }}
          </span>
          <v-chip
            size="small"
            :color="completionPercentage === 100 ? 'success' : 'primary'"
            variant="tonal"
          >
            {{ completionPercentage }}% complete
          </v-chip>
        </div>
        <v-progress-linear
          :model-value="completionPercentage"
          :color="completionPercentage === 100 ? 'success' : 'primary'"
          height="6"
          rounded
        />
      </v-card>

      <!-- KD-B: Guide card -->
      <CiProjectGuideCard
        page-key="create"
        title="Creating a New Project"
        :content="[
          '6 tabs to complete',
          'Basic Info is required to save',
          'Milestones and Timelogs are available after saving',
          'You can return and edit other tabs later',
        ]"
      />

      <!-- Tab Navigation Header -->
      <v-card class="mb-4">
        <v-tabs v-model="activeTab" color="primary" grow>
          <v-tab value="basic">
            <v-icon start>mdi-information-outline</v-icon>
            Project Profile
            <v-icon v-if="tabCompletion.basic" end color="success" size="small">mdi-check-circle</v-icon>
          </v-tab>
          <v-tab value="schedule">
            <v-icon start>mdi-calendar-range</v-icon>
            Dates &amp; Duration
            <v-icon v-if="tabCompletion.schedule" end color="success" size="small">mdi-check-circle</v-icon>
          </v-tab>
          <v-tab value="progress">
            <v-icon start>mdi-chart-line</v-icon>
            Progress Report
            <v-icon v-if="tabCompletion.progress" end color="success" size="small">mdi-check-circle</v-icon>
          </v-tab>
          <v-tab value="personnel">
            <v-icon start>mdi-account-group</v-icon>
            Personnel
            <v-icon v-if="tabCompletion.personnel" end color="success" size="small">mdi-check-circle</v-icon>
          </v-tab>
          <v-tab value="documents">
            <v-icon start>mdi-paperclip</v-icon>
            Attachments
            <v-icon v-if="tabCompletion.documents" end color="success" size="small">mdi-check-circle</v-icon>
          </v-tab>
          <!-- LX-A: Others tab â€” mirrors edit-[id].vue (timeline intentionally absent until after save) -->
          <v-tab value="others">
            <v-icon start>mdi-dots-horizontal-circle-outline</v-icon>
            Others
            <v-icon v-if="tabCompletion.others" end color="success" size="small">mdi-check-circle</v-icon>
          </v-tab>
        </v-tabs>
      </v-card>

      <v-window v-model="activeTab">
        <!-- ============= TAB 1: BASIC INFO (KE-AA: uses shared CiBasicInfoForm) ============= -->
        <v-window-item value="basic">
          <CiBasicInfoForm
            v-model="form"
            :funding-sources="fundingSources"
            :contractors="contractors"
            :rules="rules"
          />
        </v-window-item>

        <!-- ============= TAB 2: DATES AND DURATION (MH) ============= -->
        <v-window-item value="schedule">
          <!-- Row 1: Primary Project Dates -->
          <v-card class="mb-3" elevation="2" rounded="lg">
            <v-card-title class="d-flex align-center ga-2 py-2 px-4 bg-grey-lighten-4">
              <v-icon size="small" icon="mdi-calendar-clock" color="primary" />
              <span class="text-subtitle-1 font-weight-medium">Primary Project Dates</span>
            </v-card-title>
            <v-card-subtitle class="pt-2 pb-1 text-body-2 text-grey-darken-1" style="white-space: normal;">
              Initial planned project schedule. Target dates reflect the original schedule; Project Duration (Days) is the planned contract period.
            </v-card-subtitle>
            <v-divider />
            <v-card-text class="py-3">
              <v-row dense>
                <v-col cols="12" sm="6" md="3">
                  <v-menu v-model="startDateMenu" :close-on-content-click="false">
                    <template #activator="{ props: mp }">
                      <v-text-field
                        v-bind="mp"
                        :model-value="form.start_date"
                        label="Target Start Date"
                        prepend-inner-icon="mdi-calendar"
                        readonly clearable
                        density="compact" variant="outlined" hide-details="auto"
                        @click:clear="form.start_date = ''"
                      />
                    </template>
                    <v-date-picker
                      :model-value="isoToDate(form.start_date)"
                      min="1900-01-01" max="2100-12-31" hide-actions
                      @update:model-value="(v: any) => { form.start_date = toIsoDate(v); startDateMenu = false }"
                    />
                  </v-menu>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-menu v-model="targetCompletionMenu" :close-on-content-click="false">
                    <template #activator="{ props: mp }">
                      <v-text-field
                        v-bind="mp"
                        :model-value="form.target_completion_date"
                        label="Target Completion Date"
                        prepend-inner-icon="mdi-calendar-check"
                        readonly clearable
                        density="compact" variant="outlined" hide-details="auto"
                        @click:clear="form.target_completion_date = ''"
                      />
                    </template>
                    <v-date-picker
                      :model-value="isoToDate(form.target_completion_date)"
                      min="1900-01-01" max="2100-12-31" hide-actions
                      @update:model-value="(v: any) => { form.target_completion_date = toIsoDate(v); targetCompletionMenu = false }"
                    />
                  </v-menu>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-text-field
                    v-model.number="form.project_duration_days"
                    label="Project Duration (Days)"
                    type="number" min="0"
                    placeholder="e.g., 365"
                    prepend-inner-icon="mdi-timer-sand"
                    density="compact" variant="outlined" hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-menu v-model="actualCompletionMenu" :close-on-content-click="false">
                    <template #activator="{ props: mp }">
                      <v-text-field
                        v-bind="mp"
                        :model-value="form.actual_completion_date"
                        label="Actual Completion Date"
                        prepend-inner-icon="mdi-flag-checkered"
                        readonly clearable
                        density="compact" variant="outlined" hide-details="auto"
                        @click:clear="form.actual_completion_date = ''"
                      />
                    </template>
                    <v-date-picker
                      :model-value="isoToDate(form.actual_completion_date)"
                      min="1900-01-01" max="2100-12-31" hide-actions
                      @update:model-value="(v: any) => { form.actual_completion_date = toIsoDate(v); actualCompletionMenu = false }"
                    />
                  </v-menu>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Row 2: Revision Orders (audit-tracked) -->
          <v-card class="mb-3" elevation="2" rounded="lg">
            <v-card-title class="d-flex align-center ga-2 py-2 px-4 bg-grey-lighten-4">
              <v-icon size="small" icon="mdi-file-document-edit-outline" color="warning" />
              <span class="text-subtitle-1 font-weight-medium">Revision Orders</span>
              <v-chip size="x-small" variant="tonal" color="warning" class="ml-1">VOR / CTE history</v-chip>
            </v-card-title>
            <v-card-subtitle class=”pt-2 pb-1 text-body-2 text-grey-darken-1” style=”white-space: normal;”>
              Track Variation Orders (VOR) and Contract Time Extensions (CTE). Original vs Revised dates preserve audit history.
              <strong>Documentary MOV is required</strong> — attach the signed VO / TE Order file or paste a Drive/SharePoint link.
            </v-card-subtitle>
            <v-divider />
            <v-card-text class="py-3">
              <v-row dense>
                <v-col cols="12" sm="6" md="3">
                  <v-menu v-model="origStartDateMenu" :close-on-content-click="false">
                    <template #activator="{ props: mp }">
                      <v-text-field
                        v-bind="mp"
                        :model-value="form.original_start_date"
                        label="Original Start Date"
                        prepend-inner-icon="mdi-calendar"
                        readonly clearable
                        density="compact" variant="outlined" hide-details="auto"
                        @click:clear="form.original_start_date = ''"
                      />
                    </template>
                    <v-date-picker
                      :model-value="isoToDate(form.original_start_date || '')"
                      min="1900-01-01" max="2100-12-31" hide-actions
                      @update:model-value="(v: any) => { form.original_start_date = toIsoDate(v); origStartDateMenu = false }"
                    />
                  </v-menu>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-menu v-model="revStartDateMenu" :close-on-content-click="false">
                    <template #activator="{ props: mp }">
                      <v-text-field
                        v-bind="mp"
                        :model-value="form.revised_start_date"
                        label="Revised Start Date"
                        prepend-inner-icon="mdi-calendar-refresh"
                        readonly clearable
                        density="compact" variant="outlined" hide-details="auto"
                        @click:clear="form.revised_start_date = ''"
                      />
                    </template>
                    <v-date-picker
                      :model-value="isoToDate(form.revised_start_date || '')"
                      min="1900-01-01" max="2100-12-31" hide-actions
                      @update:model-value="(v: any) => { form.revised_start_date = toIsoDate(v); revStartDateMenu = false }"
                    />
                  </v-menu>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-menu v-model="origCompletionDateMenu" :close-on-content-click="false">
                    <template #activator="{ props: mp }">
                      <v-text-field
                        v-bind="mp"
                        :model-value="form.original_completion_date"
                        label="Original Completion Date"
                        prepend-inner-icon="mdi-calendar-check"
                        readonly clearable
                        density="compact" variant="outlined" hide-details="auto"
                        @click:clear="form.original_completion_date = ''"
                      />
                    </template>
                    <v-date-picker
                      :model-value="isoToDate(form.original_completion_date || '')"
                      min="1900-01-01" max="2100-12-31" hide-actions
                      @update:model-value="(v: any) => { form.original_completion_date = toIsoDate(v); origCompletionDateMenu = false }"
                    />
                  </v-menu>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-menu v-model="revCompletionDateMenu" :close-on-content-click="false">
                    <template #activator="{ props: mp }">
                      <v-text-field
                        v-bind="mp"
                        :model-value="form.revised_completion_date"
                        label="Revised Completion Date"
                        prepend-inner-icon="mdi-calendar-refresh"
                        readonly clearable
                        density="compact" variant="outlined" hide-details="auto"
                        @click:clear="form.revised_completion_date = ''"
                      />
                    </template>
                    <v-date-picker
                      :model-value="isoToDate(form.revised_completion_date || '')"
                      min="1900-01-01" max="2100-12-31" hide-actions
                      @update:model-value="(v: any) => { form.revised_completion_date = toIsoDate(v); revCompletionDateMenu = false }"
                    />
                  </v-menu>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.original_contract_duration"
                    label="Original Contract Duration"
                    placeholder="e.g., 365 calendar days"
                    prepend-inner-icon="mdi-timer-outline"
                    density="compact" variant="outlined" hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.revised_project_duration"
                    label="Revised Project Duration"
                    placeholder="e.g., 425 calendar days"
                    prepend-inner-icon="mdi-timer-sync-outline"
                    density="compact" variant="outlined" hide-details="auto"
                  />
                </v-col>
              </v-row>

              <v-divider class="my-3" />

              <!-- MH: Means of Verification (MOV) for the revision -->
              <p class="text-caption text-grey font-weight-medium text-uppercase mb-2">
                <v-icon size="x-small" color="warning">mdi-paperclip-check</v-icon>
                Means of Verification (MOV) â€” required for any revision
              </p>
              <v-row dense align="end">
                <v-col cols="12" md="5">
                  <v-text-field
                    v-model="revisionMovLink"
                    label="MOV Link (Drive / SharePoint / URL)"
                    placeholder="https://drive.google.com/..."
                    prepend-inner-icon="mdi-link-variant"
                    clearable
                    density="compact" variant="outlined" hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="5">
                  <v-file-input
                    v-model="revisionMovFile"
                    label="Upload MOV File (PDF/DOCX/Image, â‰¤ 20 MB)"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    prepend-icon="mdi-paperclip"
                    show-size
                    clearable
                    density="compact" variant="outlined" hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="2">
                  <v-btn
                    color="warning"
                    variant="tonal"
                    block
                    prepend-icon="mdi-content-save-edit"
                    :disabled="!revisionMovLink && !revisionMovFile"
                    @click="stageRevisionMov"
                  >
                    Stage MOV
                  </v-btn>
                </v-col>
                <v-col v-if="stagedRevisionMov.length" cols="12">
                  <div class="d-flex flex-wrap ga-1 mt-2">
                    <v-chip
                      v-for="(mov, i) in stagedRevisionMov"
                      :key="i"
                      size="small"
                      closable
                      color="warning"
                      variant="tonal"
                      @click:close="stagedRevisionMov.splice(i, 1)"
                    >
                      <v-icon start size="x-small">{{ mov.file ? 'mdi-file' : 'mdi-link' }}</v-icon>
                      {{ mov.file?.name || mov.link }}
                    </v-chip>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Row 3: Progress Targets (compact) -->
          <v-card elevation="2" rounded="lg">
            <v-card-title class="d-flex align-center ga-2 py-2 px-4 bg-grey-lighten-4">
              <v-icon size="small" icon="mdi-target" color="success" />
              <span class="text-subtitle-1 font-weight-medium">Progress Targets</span>
            </v-card-title>
            <v-card-subtitle class="pt-2 pb-1 text-caption text-grey-darken-1">
              Default 100% â€” represents full physical/financial completion. Adjust only if the project targets partial completion (e.g., Phase 1 of multi-phase work).
            </v-card-subtitle>
            <v-divider />
            <v-card-text class="py-3">
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.target_physical_progress"
                    label="Target Physical Progress (%)"
                    type="number" min="0" max="100" suffix="%"
                    density="compact" variant="outlined" hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.target_financial_progress"
                    label="Target Financial Progress (%)"
                    type="number" min="0" max="100" suffix="%"
                    density="compact" variant="outlined" hide-details="auto"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- ============= TAB: PROGRESS & FINANCIAL (MI) ============= -->
        <v-window-item value="progress">
          <!-- HHH-I: Improved progress tab notice -->
          <v-alert type="info" variant="tonal" class="mb-4" icon="mdi-information-outline">
            <div class=”text-subtitle-2 font-weight-medium mb-1”>Initial snapshot only</div>
            <div class=”text-body-2”>Enter the project's current physical and financial status. After saving, the full workspace becomes available:</div>
            <ul class=”text-body-2 mt-1 pl-4”>
              <li>Progress Reports (WAR/MPR history, slippage, cost tracking)</li>
              <li>Milestone Management (phase tracking with target dates)</li>
              <li>Timelogs (weekly/monthly site work logs)</li>
              <li>Revision Orders (schedule amendments)</li>
            </ul>
          </v-alert>

          <!-- A: Physical Status -->
          <v-card class="mb-3" elevation="2" rounded="lg">
            <v-card-title class="d-flex align-center ga-2 py-2 px-4 bg-grey-lighten-4">
              <v-icon size="small" icon="mdi-progress-wrench" color="primary" />
              <span class="text-subtitle-1 font-weight-medium">Physical Status</span>
            </v-card-title>
            <v-card-subtitle class="pt-2 pb-1 text-caption text-grey-darken-1">
              Current physical accomplishment percentage as of a specific date. Source: latest Weekly Accomplishment Report (WAR) or Monthly Progress Report (MPR).
            </v-card-subtitle>
            <v-divider />
            <v-card-text class="py-3">
              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="form.physical_progress"
                    label="Percentage Completion (%)"
                    type="number" min="0" max="100" suffix="%"
                    prepend-inner-icon="mdi-progress-check"
                    density="compact" variant="outlined" hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-menu v-model="progAsOfDateMenu" :close-on-content-click="false">
                    <template #activator="{ props: mp }">
                      <v-text-field
                        v-bind="mp"
                        :model-value="form.as_of_date"
                        label="As of Date"
                        prepend-inner-icon="mdi-calendar"
                        readonly clearable
                        density="compact" variant="outlined" hide-details="auto"
                        @click:clear="form.as_of_date = ''"
                      />
                    </template>
                    <v-date-picker
                      :model-value="isoToDate(form.as_of_date)"
                      min="1900-01-01" max="2100-12-31" hide-actions
                      @update:model-value="(v: any) => { form.as_of_date = toIsoDate(v); progAsOfDateMenu = false }"
                    />
                  </v-menu>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- B: Financial Status -->
          <v-card class="mb-3" elevation="2" rounded="lg">
            <v-card-title class="d-flex align-center ga-2 py-2 px-4 bg-grey-lighten-4">
              <v-icon size="small" icon="mdi-cash-check" color="success" />
              <span class="text-subtitle-1 font-weight-medium">Financial Status</span>
            </v-card-title>
            <v-card-subtitle class="pt-2 pb-1 text-caption text-grey-darken-1">
              Cumulative cost incurred to date and project completion date. Used in COA / GPPA reporting and utilization rate calculations.
            </v-card-subtitle>
            <v-divider />
            <v-card-text class="py-3">
              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="form.cost_incurred_to_date"
                    label="Cost Incurred to Date (PHP)"
                    type="number" min="0" prefix="â‚±"
                    prepend-inner-icon="mdi-cash"
                    density="compact" variant="outlined" hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-menu v-model="progDateCompletedMenu" :close-on-content-click="false">
                    <template #activator="{ props: mp }">
                      <v-text-field
                        v-bind="mp"
                        :model-value="form.date_completed"
                        label="Date Completed"
                        prepend-inner-icon="mdi-flag-checkered"
                        readonly clearable
                        density="compact" variant="outlined" hide-details="auto"
                        @click:clear="form.date_completed = ''"
                      />
                    </template>
                    <v-date-picker
                      :model-value="isoToDate(form.date_completed)"
                      min="1900-01-01" max="2100-12-31" hide-actions
                      @update:model-value="(v: any) => { form.date_completed = toIsoDate(v); progDateCompletedMenu = false }"
                    />
                  </v-menu>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- C: Remarks Log â€” OK-B: replaced inline pattern with reusable CiRemarksLog component -->
          <CiRemarksLog
            v-model="form.remarks_log_entries"
            :read-only="false"
            :current-user-name="''"
          />
        </v-window-item>

        <!-- ============= TAB 5: PERSONNEL & ASSIGNMENT ============= -->
        <v-window-item value="personnel">
          <!-- PA (2026-05-22): Unified Personnel & Access Control -->
          <!-- project-id is empty on new.vue â€” component shows placeholder -->
          <CiPersonnelAccessCard project-id="" />
        </v-window-item>

        <!-- ============= TAB 6: DOCUMENTS (JO-D) ============= -->
        <v-window-item value="documents">
          <!-- ZZ-B: Attachment staging delegated to CiAttachmentHub (staging mode) -->
          <CiAttachmentHub
            mode="staging"
            :can-upload="true"
            :can-delete="true"
            :model-value="pendingQueue"
            @update:model-value="onQueueUpdate"
          />
          <!-- Submit / Cancel actions moved to Others (last tab) -->
        </v-window-item>

        <!-- ============= TAB 6: OTHERS (LX-A) â€” mirrors edit-[id].vue ============= -->
        <v-window-item value="others">
          <!-- LX-A: Timeline absent notice -->
          <v-alert type="info" variant="tonal" density="compact" class="mb-4">
            <strong>Milestones &amp; Timelogs</strong> will be available after the project is saved. You can manage them from the project's edit page.
          </v-alert>

          <v-row>
            <!-- LEFT: Monitoring sections -->
            <v-col cols="12" md="7">
              <!-- Incidents / Special Concerns -->
              <v-card class="mb-4">
                <v-card-title class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center ga-2">
                    <v-icon icon="mdi-alert-circle-outline" size="small" color="error" />
                    Incidents / Special Concerns
                    <v-chip v-if="incidentLogRows.length" size="x-small" color="error" variant="tonal" class="ml-1">{{ incidentLogRows.length }}</v-chip>
                  </div>
                  <v-btn size="x-small" color="error" prepend-icon="mdi-plus" variant="tonal" @click="addIncident">Add</v-btn>
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <div v-if="incidentLogRows.length === 0" class="text-center text-grey text-caption pa-3">No incidents recorded. Add to document special concerns or urgent issues.</div>
                  <div v-for="(row, i) in incidentLogRows" :key="i" class="mb-3 pa-3 rounded bg-grey-lighten-5">
                    <v-row dense align="center" class="mb-1">
                      <v-col cols="12" sm="3">
                        <v-text-field v-model="row.date" label="Date" type="date" variant="outlined" density="compact" hide-details />
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-select v-model="row.severity" label="Severity" :items="['LOW','MEDIUM','HIGH','CRITICAL']" variant="outlined" density="compact" hide-details />
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-select v-model="row.status" label="Status" :items="['OPEN','RESOLVED','ESCALATED']" variant="outlined" density="compact" hide-details />
                      </v-col>
                      <v-col cols="12" sm="1" class="d-flex justify-center">
                        <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="removeIncident(i)" />
                      </v-col>
                    </v-row>
                    <v-textarea v-model="row.description" label="Description / Action Taken" rows="2" variant="outlined" density="compact" hide-details />
                  </div>
                </v-card-text>
              </v-card>

              <!-- Risk Register -->
              <v-card class="mb-4">
                <v-card-title class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center ga-2">
                    <v-icon icon="mdi-shield-alert-outline" size="small" color="warning" />
                    Risk Register
                    <v-chip v-if="riskRegisterRows.length" size="x-small" color="warning" variant="tonal" class="ml-1">{{ riskRegisterRows.length }}</v-chip>
                  </div>
                  <v-btn size="x-small" color="warning" prepend-icon="mdi-plus" variant="tonal" @click="addRisk">Add</v-btn>
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <div v-if="riskRegisterRows.length === 0" class="text-center text-grey text-caption pa-3">No risks logged. Add project risks with likelihood and mitigation plan.</div>
                  <div v-for="(row, i) in riskRegisterRows" :key="i" class="mb-3 pa-3 rounded bg-grey-lighten-5">
                    <v-row dense align="center" class="mb-1">
                      <v-col cols="12" sm="3">
                        <v-select v-model="row.likelihood" label="Likelihood" :items="['LOW','MEDIUM','HIGH']" variant="outlined" density="compact" hide-details />
                      </v-col>
                      <v-col cols="12" sm="3">
                        <v-select v-model="row.impact" label="Impact" :items="['LOW','MEDIUM','HIGH']" variant="outlined" density="compact" hide-details />
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-select v-model="row.status" label="Status" :items="['OPEN','MITIGATED','CLOSED']" variant="outlined" density="compact" hide-details />
                      </v-col>
                      <v-col cols="12" sm="2" class="d-flex justify-center">
                        <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="removeRisk(i)" />
                      </v-col>
                    </v-row>
                    <v-text-field v-model="row.risk" label="Risk Description" placeholder="Describe the risk..." variant="outlined" density="compact" class="mb-1" hide-details />
                    <v-text-field v-model="row.mitigation" label="Mitigation Plan" placeholder="How will this be addressed?" variant="outlined" density="compact" hide-details />
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- RIGHT: Escalations + Administrative Records -->
            <v-col cols="12" md="5">
              <!-- Escalation Records -->
              <v-card class="mb-4">
                <v-card-title class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center ga-2">
                    <v-icon icon="mdi-arrow-up-circle-outline" size="small" color="info" />
                    Escalation Records
                    <v-chip v-if="escalationRows.length" size="x-small" color="info" variant="tonal" class="ml-1">{{ escalationRows.length }}</v-chip>
                  </div>
                  <v-btn size="x-small" color="info" prepend-icon="mdi-plus" variant="tonal" @click="addEscalation">Add</v-btn>
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <div v-if="escalationRows.length === 0" class="text-center text-grey text-caption pa-3">No escalation records.</div>
                  <div v-for="(row, i) in escalationRows" :key="i" class="mb-3 pa-3 rounded bg-grey-lighten-5">
                    <v-row dense class="mb-1">
                      <v-col cols="12" sm="8">
                        <v-text-field v-model="row.escalatedTo" label="Escalated To" placeholder="Name / Office" variant="outlined" density="compact" hide-details />
                      </v-col>
                      <v-col cols="12" sm="3">
                        <v-text-field v-model="row.date" label="Date" type="date" variant="outlined" density="compact" hide-details />
                      </v-col>
                      <v-col cols="12" sm="1" class="d-flex justify-center">
                        <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="removeEscalation(i)" />
                      </v-col>
                    </v-row>
                    <v-text-field v-model="row.issue" label="Issue / Concern" variant="outlined" density="compact" class="mb-1" hide-details />
                    <v-text-field v-model="row.resolution" label="Resolution / Action" variant="outlined" density="compact" hide-details />
                  </div>
                </v-card-text>
              </v-card>

              <!-- Administrative Records (collapsed) -->
              <v-expansion-panels variant="accordion" class="mb-4">
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <div class="d-flex align-center ga-2">
                      <v-icon icon="mdi-folder-text-outline" size="small" />
                      Administrative Records
                      <v-chip v-if="statusUpdateRows.length + readinessDocRows.length + signatoryRows.length" size="x-small" variant="tonal" class="ml-1">
                        {{ statusUpdateRows.length + readinessDocRows.length + signatoryRows.length }}
                      </v-chip>
                    </div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <!-- Status Updates -->
                    <div class="d-flex align-center justify-space-between mb-2">
                      <span class="text-caption text-grey font-weight-medium text-uppercase">Status Updates</span>
                      <v-btn size="x-small" color="primary" prepend-icon="mdi-plus" variant="tonal" @click="addStatusUpdate">Add</v-btn>
                    </div>
                    <div v-if="statusUpdateRows.length === 0" class="text-caption text-grey pa-2">None recorded.</div>
                    <v-row v-for="(row, i) in statusUpdateRows" :key="'su' + i" dense align="center">
                      <v-col cols="12" sm="3"><v-text-field v-model="row.date" label="Date" type="date" variant="outlined" density="compact" /></v-col>
                      <v-col cols="12" sm="8"><v-text-field v-model="row.text" label="Update" variant="outlined" density="compact" /></v-col>
                      <v-col cols="12" sm="1" class="d-flex justify-center"><v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="removeStatusUpdate(i)" /></v-col>
                    </v-row>

                    <v-divider class="my-3" />

                    <!-- Readiness Documents -->
                    <div class="d-flex align-center justify-space-between mb-2">
                      <span class="text-caption text-grey font-weight-medium text-uppercase">Readiness Documents</span>
                      <v-btn size="x-small" color="primary" prepend-icon="mdi-plus" variant="tonal" @click="addReadinessDoc">Add</v-btn>
                    </div>
                    <div v-if="readinessDocRows.length === 0" class="text-caption text-grey pa-2">None listed.</div>
                    <v-row v-for="(row, i) in readinessDocRows" :key="'rd' + i" dense align="center">
                      <v-col cols="12" sm="4"><v-text-field v-model="row.type" label="Type" variant="outlined" density="compact" /></v-col>
                      <v-col cols="12" sm="3"><v-select v-model="row.status" label="Status" :items="['SUBMITTED','PENDING','APPROVED','MISSING']" variant="outlined" density="compact" /></v-col>
                      <v-col cols="12" sm="4"><v-text-field v-model="row.remarks" label="Remarks" variant="outlined" density="compact" /></v-col>
                      <v-col cols="12" sm="1" class="d-flex justify-center"><v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="removeReadinessDoc(i)" /></v-col>
                    </v-row>

                    <v-divider class="my-3" />

                    <!-- Signatories -->
                    <div class="d-flex align-center justify-space-between mb-2">
                      <span class="text-caption text-grey font-weight-medium text-uppercase">Signatories</span>
                      <v-btn size="x-small" color="primary" prepend-icon="mdi-plus" variant="tonal" @click="addSignatory">Add</v-btn>
                    </div>
                    <div v-if="signatoryRows.length === 0" class="text-caption text-grey pa-2">None listed.</div>
                    <v-row v-for="(row, i) in signatoryRows" :key="'si' + i" dense align="center">
                      <v-col cols="12" sm="4"><v-text-field v-model="row.name" label="Name" variant="outlined" density="compact" /></v-col>
                      <v-col cols="12" sm="4"><v-text-field v-model="row.position" label="Position" variant="outlined" density="compact" /></v-col>
                      <v-col cols="12" sm="3"><v-text-field v-model="row.date" label="Date" type="date" variant="outlined" density="compact" /></v-col>
                      <v-col cols="12" sm="1" class="d-flex justify-center"><v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="removeSignatory(i)" /></v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </v-row>

        </v-window-item>
      </v-window>

      <!-- PV-C: Unified action footer â€” [Previous]  [Cancel] [Create Project / Next] -->
      <div class="d-flex align-center justify-space-between mt-4 pt-3" style="border-top: 1px solid rgba(0,0,0,0.08)">
        <v-btn
          v-if="activeTab !== 'basic'"
          variant="text"
          :disabled="submitting"
          @click="prevTab"
        >
          <v-icon start>mdi-arrow-left</v-icon>
          Previous
        </v-btn>
        <v-spacer />
        <div class="d-flex ga-2">
          <v-btn variant="outlined" :disabled="submitting" @click="goBack">Cancel</v-btn>
          <v-btn
            v-if="activeTab === 'others'"
            type="submit"
            color="primary"
            :loading="submitting"
            :disabled="submitting"
            prepend-icon="mdi-plus-circle"
          >
            Create Project
          </v-btn>
          <v-btn
            v-if="activeTab !== 'others'"
            color="primary"
            variant="tonal"
            :disabled="submitting"
            @click="nextTab"
          >
            Next
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </div>
      </div>
    </v-form>
  </div>
</template>
