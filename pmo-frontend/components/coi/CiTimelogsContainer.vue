<script setup lang="ts">
/**
 * Phase FFF-B: Timelogs container — weekly/monthly periodic work logs.
 * Backed by construction_timeline_entries (GET/POST/PATCH/DELETE :id/timeline-entries).
 * Rendered below Progress Reports in the Progress tab. Advanced multi-select
 * filters: Year, Quarter(s), Month(s), custom date range, search + sort.
 */
interface TimelogEntry {
  id: string
  entryType: string
  entryDate: string
  periodLabel?: string | null
  title?: string | null
  description?: string | null
  weather?: string | null
  manpowerCount?: number | null
  equipmentUsed?: string | null
  workAccomplished?: string | null
  issuesEncountered?: string | null
  photosCount?: number | null
  createdByName?: string | null
  // BBB-C: WAR/MPR financial billing fields
  billingAmountThisPeriod?: number | null
  financialAccomplishmentPercent?: number | null
  // ZZZ-G: structured Project Concerns list
  concernsList?: Array<{
    title?: string; description?: string; category?: string
    severity?: string; status?: string; responsibleParty?: string
    resolutionTargetDate?: string; actualResolutionDate?: string
    mitigationAction?: string; createdBy?: string; createdAt?: string
  }>
}

const props = withDefaults(defineProps<{
  projectId: string
  readOnly?: boolean
  canDelete?: boolean
}>(), { readOnly: false, canDelete: undefined })

const effectiveCanDelete = computed(() => !props.readOnly && props.canDelete !== false)

const api = useApi()
const toast = useToast()

// ── State ───────────────────────────────────────────────────
const entries = ref<TimelogEntry[]>([])
const loading = ref(false)

async function fetchEntries() {
  if (!props.projectId) return
  loading.value = true
  try {
    const res = await api.get<TimelogEntry[] | { data: TimelogEntry[] }>(
      `/api/construction-projects/${props.projectId}/timeline-entries`,
    )
    const list = Array.isArray(res) ? res : (res?.data || [])
    entries.value = list.map((e: any) => ({
      // ZZZ-G: preserve all raw fields (warNumber/accomplishments/workItems/concernsList/…)
      // so the edit modal can hydrate WAR/MPR/concerns; normalized fields below override.
      ...e,
      id: e.id,
      entryType: e.entryType || e.entry_type || 'WEEKLY',
      entryDate: typeof e.entryDate === 'string'
        ? e.entryDate.slice(0, 10)
        : (e.entry_date ? String(e.entry_date).slice(0, 10) : ''),
      periodLabel: e.periodLabel ?? e.period_label ?? null,
      title: e.title ?? null,
      description: e.description ?? null,
      weather: e.weather ?? null,
      manpowerCount: e.manpowerCount ?? e.manpower_count ?? null,
      equipmentUsed: e.equipmentUsed ?? e.equipment_used ?? null,
      workAccomplished: e.workAccomplished ?? e.work_accomplished ?? null,
      issuesEncountered: e.issuesEncountered ?? e.issues_encountered ?? null,
      photosCount: e.photosCount ?? e.photos_count ?? 0,
      createdByName: e.createdByName ?? e.created_by_name ?? null,
      concernsList: e.concernsList ?? e.concerns_list ?? [],
      billingAmountThisPeriod: e.billingAmountThisPeriod ?? e.billing_amount_this_period ?? null,
      financialAccomplishmentPercent: e.financialAccomplishmentPercent ?? e.financial_accomplishment_percent ?? null,
    }))
  } catch (err) {
    console.error('[CiTimelogsContainer] fetch failed:', err)
  } finally {
    loading.value = false
  }
}

// ── Filters ─────────────────────────────────────────────────
const search = ref('')
const typeFilter = ref<'ALL' | 'WEEKLY' | 'MONTHLY'>('ALL')
const filterYear = ref<number | null>(null)
const quartersSelected = ref<number[]>([])
const monthsSelected = ref<number[]>([])
const dateFrom = ref('')
const dateTo = ref('')
const sortDir = ref<'asc' | 'desc'>('desc')

const dateFromMenu = ref(false)
const dateToMenu = ref(false)

const quarterOptions = [
  { title: 'Q1 (Jan–Mar)', value: 1 },
  { title: 'Q2 (Apr–Jun)', value: 2 },
  { title: 'Q3 (Jul–Sep)', value: 3 },
  { title: 'Q4 (Oct–Dec)', value: 4 },
]
const monthOptions = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
].map((m, i) => ({ title: m, value: i + 1 }))

// ── View mode ─────────────────────────────────────────────────────────────────
const viewMode = ref<'card' | 'list' | 'table'>('card')

const tableHeaders = [
  { title: 'Type', key: 'entryType', width: 90 },
  { title: 'Date', key: 'entryDate', width: 110 },
  { title: 'Period', key: 'periodLabel', width: 130 },
  { title: 'Title', key: 'title' },
  { title: 'Work Accomplished', key: 'workAccomplished' },
  { title: 'Manpower', key: 'manpowerCount', width: 100, align: 'center' as const },
  { title: 'Photos', key: 'photosCount', width: 80, align: 'center' as const },
  { title: '', key: 'actions', width: 60, sortable: false, align: 'end' as const },
]

const availableYears = computed(() => {
  const ys = new Set<number>()
  for (const e of entries.value) {
    if (e.entryDate) ys.add(Number(e.entryDate.slice(0, 4)))
  }
  const cur = new Date().getFullYear()
  ys.add(cur)
  ys.add(cur - 1)
  ys.add(cur - 2)
  ys.add(cur + 1)
  return Array.from(ys).filter(y => !Number.isNaN(y)).sort((a, b) => b - a)
})

const activeFilterCount = computed(() => {
  let n = 0
  if (search.value) n++
  if (typeFilter.value !== 'ALL') n++
  if (filterYear.value) n++
  if (quartersSelected.value.length) n++
  if (monthsSelected.value.length) n++
  if (dateFrom.value) n++
  if (dateTo.value) n++
  return n
})

function resetFilters() {
  search.value = ''
  typeFilter.value = 'ALL'
  filterYear.value = null
  quartersSelected.value = []
  monthsSelected.value = []
  dateFrom.value = ''
  dateTo.value = ''
}

const hasDateFilter = computed(() =>
  !!(filterYear.value || quartersSelected.value.length || monthsSelected.value.length || dateFrom.value || dateTo.value),
)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const out = entries.value.filter((e) => {
    if (typeFilter.value !== 'ALL' && e.entryType !== typeFilter.value) return false

    if (q) {
      const hay = [e.title, e.workAccomplished, e.issuesEncountered, e.periodLabel, e.description]
        .filter(Boolean).join(' ').toLowerCase()
      if (!hay.includes(q)) return false
    }

    const d = e.entryDate
    if (hasDateFilter.value && !d) return false
    if (d) {
      const y = Number(d.slice(0, 4))
      const m = Number(d.slice(5, 7))
      const quarter = Math.floor((m - 1) / 3) + 1
      if (filterYear.value && y !== filterYear.value) return false
      if (quartersSelected.value.length && !quartersSelected.value.includes(quarter)) return false
      if (monthsSelected.value.length && !monthsSelected.value.includes(m)) return false
      if (dateFrom.value && d < dateFrom.value) return false
      if (dateTo.value && d > dateTo.value) return false
    }
    return true
  })
  return out.sort((a, b) => {
    const cmp = (a.entryDate || '').localeCompare(b.entryDate || '')
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

const summary = computed(() => ({
  total: filtered.value.length,
  weekly: filtered.value.filter(e => e.entryType === 'WEEKLY').length,
  monthly: filtered.value.filter(e => e.entryType === 'MONTHLY').length,
  photos: filtered.value.reduce((s, e) => s + (e.photosCount || 0), 0),
}))

// ── Pagination ──────────────────────────────────────────────
const page = ref(1)
const perPage = 6
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))
const pagedEntries = computed(() => filtered.value.slice((page.value - 1) * perPage, page.value * perPage))
watch([filtered], () => { if (page.value > totalPages.value) page.value = 1 })

// ── Add / edit dialog ───────────────────────────────────────
const dialogOpen = ref(false)
const editing = ref<TimelogEntry | null>(null)
const submitting = ref(false)
const entryDateMenu = ref(false)

// ZZZ-E/F: dismissible guidance banner, persisted per project
const bannerKey = computed(() => `coi-timelog-banner-${props.projectId}`)
const bannerDismissed = ref(false)
onMounted(() => { if (import.meta.client) bannerDismissed.value = localStorage.getItem(bannerKey.value) === '1' })
function dismissBanner() {
  bannerDismissed.value = true
  if (import.meta.client) localStorage.setItem(bannerKey.value, '1')
}

const WAR_SIGNATORY_ROLES = ['Prepared By', 'Reviewed By', 'Noted By']
const MPR_SIGNATORY_ROLES = ['Prepared By', 'Checked & Reviewed By', 'Noted By', 'Recommending Approval', 'Approved By']
function blankSignatories(roles: string[]) {
  return roles.map(role => ({ userId: '', userName: '', position: '', role, date: '' }))
}

const blank = () => ({
  entry_type: 'WEEKLY',
  entry_date: '',
  period_label: '',
  title: '',
  work_accomplished: '',
  issues_encountered: '',
  description: '',          // EEE-F: next-period plan / corrective actions (DTO-supported)
  weather: '',
  manpower_count: null as number | null,
  equipment_used: '',
  // GGG-F: WAR fields
  war_number: '',
  reporting_period_start: '',
  reporting_period_end: '',
  personnel_equipment_constraints: '',
  mitigation_measures: '',
  look_ahead_activities: '',
  accomplishments: [] as Array<{ description: string; category: string; date: string; percentage: number | null; remarks: string }>,
  // GGG-F: MPR fields
  mpr_number: '',
  reporting_period_month: '',
  percent_time_elapsed: null as number | null,
  accomplishment_summary_percent: null as number | null,
  original_contract_amount: null as number | null,
  revised_contract_amount: null as number | null,
  work_items: [] as Array<Record<string, any>>,
  // Shared signatories (role set depends on entry_type)
  signatories: blankSignatories(WAR_SIGNATORY_ROLES) as Array<{ userId: string; userName: string; position: string; role: string; date: string }>,
  // BBB-C: WAR/MPR financial billing
  billing_amount_this_period: null as number | null,
  financial_accomplishment_percent: null as number | null,
  // CCC-C: MOV attachment — transient fields (not persisted on timelog, filed to document repository)
  mov_file: null as File | null,
  mov_link: '',
  mov_link_title: '',
  // ZZZ-G: structured Project Concerns list
  concerns_list: [] as Array<{ title: string; description: string; category: string; severity: string; status: string; responsibleParty: string; resolutionTargetDate: string; actualResolutionDate: string; mitigationAction: string; createdBy?: string; createdAt?: string }>,
})
const form = ref(blank())

function addAccomplishment() { form.value.accomplishments.push({ description: '', category: '', date: '', percentage: null, remarks: '' }) }
function removeAccomplishment(i: number) { form.value.accomplishments.splice(i, 1) }
function addWorkItem() { form.value.work_items.push({ itemNumber: '', description: '', unit: '', quantity: null, unitCost: null, weightNumber: null, actualPercentToDate: null, costToDate: null }) }
function removeWorkItem(i: number) { form.value.work_items.splice(i, 1) }

// ZZZ-G: Project Concerns helpers + option lists
const authStore = useAuthStore()
const CONCERN_CATEGORIES = ['SAFETY', 'SCHEDULE', 'FINANCIAL', 'ENVIRONMENTAL', 'QUALITY', 'OTHER']
const CONCERN_SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
const CONCERN_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED']
function concernSeverityColor(s: string): string {
  return s === 'CRITICAL' ? 'error' : s === 'HIGH' ? 'deep-orange' : s === 'MEDIUM' ? 'warning' : 'grey'
}
function concernStatusColor(s: string): string {
  return s === 'RESOLVED' ? 'success' : s === 'IN_PROGRESS' ? 'info' : 'grey'
}
function addConcern() {
  form.value.concerns_list.push({
    title: '', description: '', category: 'OTHER', severity: 'MEDIUM', status: 'OPEN',
    responsibleParty: '', resolutionTargetDate: '', actualResolutionDate: '', mitigationAction: '',
    createdBy: authStore.user?.id || '', createdAt: new Date().toISOString(),
  })
}
function removeConcern(i: number) { form.value.concerns_list.splice(i, 1) }

// GGG-F: user search for signatories
const userSearchResults = ref<Array<{ id: string; fullName: string; position?: string }>>([])
const userSearchLoading = ref(false)
let userSearchDebounce: ReturnType<typeof setTimeout> | null = null
function searchUsers(q: string) {
  if (userSearchDebounce) clearTimeout(userSearchDebounce)
  if (!q || q.length < 2) { userSearchResults.value = []; return }
  userSearchDebounce = setTimeout(async () => {
    userSearchLoading.value = true
    try {
      const res = await api.get<any>(`/api/users?search=${encodeURIComponent(q)}&limit=10`)
      const rows = res?.data ?? res ?? []
      userSearchResults.value = (Array.isArray(rows) ? rows : []).map((u: any) => ({
        id: u.id,
        fullName: u.displayName || u.fullName || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email,
        position: u.position || u.role,
      }))
    } catch { userSearchResults.value = [] }
    finally { userSearchLoading.value = false }
  }, 300)
}
function onSignatorySelect(sig: { userId: string; userName: string; position: string }, userId: string) {
  const u = userSearchResults.value.find(x => x.id === userId)
  if (u) { sig.userName = u.fullName; sig.position = u.position || sig.position }
}
// Reset signatory role set when entry type changes (only when creating)
watch(() => form.value.entry_type, (t) => {
  if (editing.value) return
  const desired = t === 'MONTHLY' ? MPR_SIGNATORY_ROLES : WAR_SIGNATORY_ROLES
  // preserve already-selected users by role where possible
  const existing = new Map(form.value.signatories.map(s => [s.role, s]))
  form.value.signatories = desired.map(role => existing.get(role) || { userId: '', userName: '', position: '', role, date: '' })
})

function toIsoDate(d: Date | string | null | undefined): string {
  if (!d) return ''
  if (typeof d === 'string') return d.slice(0, 10)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function isoToDate(iso: string): Date | null {
  return iso ? new Date(iso + 'T00:00:00') : null
}

function openCreate() {
  editing.value = null
  form.value = blank()
  dialogOpen.value = true
}
function openEdit(e: TimelogEntry) {
  editing.value = e
  const ea = e as any
  const isMonthly = (e.entryType || 'WEEKLY') === 'MONTHLY'
  const roleSet = isMonthly ? MPR_SIGNATORY_ROLES : WAR_SIGNATORY_ROLES
  const existingSigs: any[] = Array.isArray(ea.signatories) ? ea.signatories : []
  const sigByRole = new Map(existingSigs.map((s: any) => [s.role, s]))
  form.value = {
    entry_type: e.entryType || 'WEEKLY',
    entry_date: e.entryDate || '',
    period_label: e.periodLabel || '',
    title: e.title || '',
    work_accomplished: e.workAccomplished || '',
    issues_encountered: e.issuesEncountered || '',
    description: ea.description || '',
    weather: e.weather || '',
    manpower_count: e.manpowerCount ?? null,
    equipment_used: e.equipmentUsed || '',
    war_number: ea.warNumber || '',
    reporting_period_start: ea.reportingPeriodStart ? toIsoDate(ea.reportingPeriodStart) : '',
    reporting_period_end: ea.reportingPeriodEnd ? toIsoDate(ea.reportingPeriodEnd) : '',
    personnel_equipment_constraints: ea.personnelEquipmentConstraints || '',
    mitigation_measures: ea.mitigationMeasures || '',
    look_ahead_activities: ea.lookAheadActivities || '',
    accomplishments: Array.isArray(ea.accomplishments) ? ea.accomplishments.map((a: any) => ({ description: a.description || '', category: a.category || '', date: a.date || '', percentage: a.percentage ?? null, remarks: a.remarks || '' })) : [],
    mpr_number: ea.mprNumber || '',
    reporting_period_month: ea.reportingPeriodMonth ? toIsoDate(ea.reportingPeriodMonth) : '',
    percent_time_elapsed: ea.percentTimeElapsed ?? null,
    accomplishment_summary_percent: ea.accomplishmentSummaryPercent ?? null,
    original_contract_amount: ea.originalContractAmount ?? null,
    revised_contract_amount: ea.revisedContractAmount ?? null,
    work_items: Array.isArray(ea.workItems) ? ea.workItems : [],
    signatories: roleSet.map(role => {
      const s: any = sigByRole.get(role)
      return s ? { userId: s.userId || '', userName: s.userName || '', position: s.position || '', role, date: s.date || '' } : { userId: '', userName: '', position: '', role, date: '' }
    }),
    // BBB-C: hydrate financial billing
    billing_amount_this_period: ea.billingAmountThisPeriod ?? null,
    financial_accomplishment_percent: ea.financialAccomplishmentPercent ?? null,
    // ZZZ-G: hydrate concerns
    concerns_list: Array.isArray(ea.concernsList) ? ea.concernsList.map((c: any) => ({
      title: c.title || '', description: c.description || '', category: c.category || 'OTHER',
      severity: c.severity || 'MEDIUM', status: c.status || 'OPEN', responsibleParty: c.responsibleParty || '',
      resolutionTargetDate: c.resolutionTargetDate || '', actualResolutionDate: c.actualResolutionDate || '',
      mitigationAction: c.mitigationAction || '', createdBy: c.createdBy || '', createdAt: c.createdAt || '',
    })) : [],
    // CCC-C: MOV fields reset on edit open (transient)
    mov_file: null,
    mov_link: '',
    mov_link_title: '',
  }
  dialogOpen.value = true
}

async function save() {
  if (!form.value.title || !form.value.entry_date) {
    toast.error('Title and Date are required')
    return
  }
  submitting.value = true
  try {
    // CCC-C: Strip MOV transient fields — they are NOT sent to the timelog endpoint
    const { mov_file, mov_link, mov_link_title, ...formRest } = form.value
    const payload: Record<string, any> = Object.fromEntries(
      Object.entries(formRest).filter(([, v]) => v !== '' && v !== null),
    )
    // GGG-F: drop empty nested rows; keep only signatories with a selected user
    if (Array.isArray(payload.accomplishments))
      payload.accomplishments = payload.accomplishments.filter((a: any) => a.description?.trim())
    if (Array.isArray(payload.work_items))
      payload.work_items = payload.work_items.filter((w: any) => w.description?.trim())
    if (Array.isArray(payload.signatories))
      payload.signatories = payload.signatories.filter((s: any) => s.userId || s.userName)
    // ZZZ-G: keep only concerns with a title or description
    if (Array.isArray(payload.concerns_list))
      payload.concerns_list = payload.concerns_list.filter((c: any) => c.title?.trim() || c.description?.trim())
    if (editing.value) {
      await api.patch(`/api/construction-projects/${props.projectId}/timeline-entries/${editing.value.id}`, payload)
      toast.success('Timelog updated')
    } else {
      await api.post(`/api/construction-projects/${props.projectId}/timeline-entries`, payload)
      toast.success('Timelog created')
    }

    // CCC-C: File MOV into the correct Supporting Documents repository after timelog save
    const typeCode = form.value.entry_type === 'MONTHLY' ? 'SD_ECO_010' : 'SD_ECO_009'
    const sourceRef = form.value.entry_type === 'MONTHLY'
      ? `MPR — ${form.value.mpr_number || form.value.title}`
      : `WAR — ${form.value.war_number || form.value.title}`
    const sourceDesc = `Submitted from ${form.value.entry_type === 'MONTHLY' ? 'MPR' : 'WAR'} timelog: ${sourceRef}`

    if (mov_file) {
      const fd = new FormData()
      fd.append('file', mov_file)
      fd.append('documentType', typeCode)
      fd.append('description', sourceDesc)
      try {
        await api.upload(`/api/construction-projects/${props.projectId}/documents`, fd)
        toast.success('MOV document filed to repository')
      } catch {
        toast.error('Timelog saved but MOV upload failed — try uploading via Attachments tab')
      }
    }
    if (mov_link && mov_link.startsWith('http')) {
      try {
        await api.post(`/api/construction-projects/${props.projectId}/documents`, {
          documentType: typeCode,
          externalLink: mov_link,
          title: mov_link_title || sourceRef,
          description: sourceDesc,
        })
        toast.success('MOV link filed to repository')
      } catch {
        toast.error('Timelog saved but MOV link failed — try adding via Attachments tab')
      }
    }

    dialogOpen.value = false
    await fetchEntries()
  } catch (err: any) {
    toast.error(err?.message || 'Failed to save timelog')
  } finally {
    submitting.value = false
  }
}

async function confirmRemove(e: TimelogEntry) {
  if (!confirm(`Delete ${e.entryType} timelog "${e.title || e.entryDate}"?`)) return
  try {
    await api.del(`/api/construction-projects/${props.projectId}/timeline-entries/${e.id}`)
    toast.success('Timelog deleted')
    await fetchEntries()
  } catch (err: any) {
    toast.error(err?.message || 'Failed to delete')
  }
}

function typeColor(t: string) {
  return t === 'MONTHLY' ? 'success' : t === 'WEEKLY' ? 'primary' : 'grey'
}
function formatDate(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00:00')
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(fetchEntries)
watch(() => props.projectId, fetchEntries)
</script>

<template>
  <v-card elevation="2" rounded="lg">
    <v-card-title class="d-flex align-center flex-wrap ga-2 py-2 px-4 bg-grey-lighten-4">
      <div class="d-flex align-center ga-2">
        <v-icon size="small" icon="mdi-calendar-text-outline" color="deep-purple" />
        <span class="text-subtitle-1 font-weight-medium">Timelogs</span>
        <v-chip size="small" variant="tonal" color="deep-purple">{{ summary.total }}</v-chip>
      </div>
      <v-spacer />
      <v-btn-toggle
        v-model="viewMode"
        density="compact"
        variant="outlined"
        divided
        mandatory
        color="deep-purple"
        class="mr-2"
      >
        <v-btn value="list" size="small" :icon="true" title="List view"><v-icon size="18">mdi-format-list-bulleted</v-icon></v-btn>
        <v-btn value="card" size="small" :icon="true" title="Card view"><v-icon size="18">mdi-view-grid-outline</v-icon></v-btn>
        <v-btn value="table" size="small" :icon="true" title="Table view"><v-icon size="18">mdi-table</v-icon></v-btn>
      </v-btn-toggle>
      <v-btn
        v-if="!readOnly"
        size="small"
        color="deep-purple"
        variant="tonal"
        prepend-icon="mdi-plus"
        @click="openCreate"
      >
        Add Timelog
      </v-btn>
    </v-card-title>
    <v-card-subtitle class="pt-2 pb-1 text-body-2 text-grey-darken-1" style="white-space: normal;">
      Weekly &amp; monthly periodic work logs (WAR/MPR-aligned). Filter by year, quarter, month, or a custom range.
    </v-card-subtitle>
    <v-divider />

    <!-- Filter bar -->
    <div class="px-4 py-3">
      <v-row dense align="center">
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search accomplishments, issues, title…"
            density="compact" variant="outlined" hide-details single-line clearable
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-btn-toggle v-model="typeFilter" density="compact" variant="outlined" divided mandatory color="deep-purple">
            <v-btn value="ALL" size="small">All</v-btn>
            <v-btn value="WEEKLY" size="small">Weekly</v-btn>
            <v-btn value="MONTHLY" size="small">Monthly</v-btn>
          </v-btn-toggle>
        </v-col>
        <v-col cols="6" sm="4" md="2">
          <v-select
            v-model="filterYear" :items="availableYears" label="Year"
            density="compact" variant="outlined" hide-details clearable
          />
        </v-col>
        <v-col cols="6" sm="4" md="3" class="d-flex justify-end align-center ga-1">
          <v-btn
            :icon="sortDir === 'asc' ? 'mdi-sort-calendar-ascending' : 'mdi-sort-calendar-descending'"
            size="small" variant="text" :title="sortDir === 'asc' ? 'Oldest first' : 'Newest first'"
            @click="sortDir = sortDir === 'asc' ? 'desc' : 'asc'"
          />
          <v-btn v-if="activeFilterCount" variant="text" size="small" prepend-icon="mdi-filter-off" @click="resetFilters">
            Clear ({{ activeFilterCount }})
          </v-btn>
        </v-col>
      </v-row>
      <v-row dense align="center" class="mt-1">
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="quartersSelected" :items="quarterOptions" item-title="title" item-value="value"
            label="Quarter(s)" multiple chips closable-chips
            density="compact" variant="outlined" hide-details clearable
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="monthsSelected" :items="monthOptions" item-title="title" item-value="value"
            label="Month(s)" multiple chips closable-chips
            density="compact" variant="outlined" hide-details clearable
          />
        </v-col>
        <v-col cols="6" sm="6" md="3">
          <v-menu v-model="dateFromMenu" :close-on-content-click="false">
            <template #activator="{ props: mp }">
              <v-text-field
                v-bind="mp" :model-value="dateFrom" label="From" prepend-inner-icon="mdi-calendar"
                readonly clearable density="compact" variant="outlined" hide-details
                @click:clear="dateFrom = ''"
              />
            </template>
            <v-date-picker
              :model-value="isoToDate(dateFrom)" hide-actions min="1900-01-01" max="2100-12-31"
              @update:model-value="(v: any) => { dateFrom = toIsoDate(v); dateFromMenu = false }"
            />
          </v-menu>
        </v-col>
        <v-col cols="6" sm="6" md="3">
          <v-menu v-model="dateToMenu" :close-on-content-click="false">
            <template #activator="{ props: mp }">
              <v-text-field
                v-bind="mp" :model-value="dateTo" label="To" prepend-inner-icon="mdi-calendar"
                readonly clearable density="compact" variant="outlined" hide-details
                @click:clear="dateTo = ''"
              />
            </template>
            <v-date-picker
              :model-value="isoToDate(dateTo)" hide-actions min="1900-01-01" max="2100-12-31"
              @update:model-value="(v: any) => { dateTo = toIsoDate(v); dateToMenu = false }"
            />
          </v-menu>
        </v-col>
      </v-row>
      <div class="d-flex flex-wrap ga-3 mt-2 text-body-2 text-grey-darken-1">
        <span><v-icon size="14" color="primary">mdi-circle</v-icon> {{ summary.weekly }} weekly</span>
        <span><v-icon size="14" color="success">mdi-circle</v-icon> {{ summary.monthly }} monthly</span>
        <span v-if="summary.photos"><v-icon size="14">mdi-camera</v-icon> {{ summary.photos }} photos</span>
      </div>
    </div>
    <v-divider />

    <!-- Loading -->
    <div v-if="loading" class="d-flex justify-center align-center py-8">
      <v-progress-circular indeterminate color="deep-purple" size="28" />
    </div>

    <template v-else>
      <!-- Empty state -->
      <div v-if="filtered.length === 0" class="text-center text-grey py-8">
        <v-icon size="40" color="grey-lighten-1">mdi-calendar-blank-outline</v-icon>
        <div class="text-body-1 mt-2">{{ entries.length ? 'No timelogs match the current filters.' : 'No timelogs yet.' }}</div>
        <v-btn v-if="!readOnly && !entries.length" size="small" color="deep-purple" variant="tonal" class="mt-3" prepend-icon="mdi-plus" @click="openCreate">
          Add First Timelog
        </v-btn>
      </div>

      <template v-else>

        <!-- ── CARD VIEW ── -->
        <div v-if="viewMode === 'card'" class="pa-3">
          <v-row dense>
            <v-col v-for="e in pagedEntries" :key="e.id" cols="12" md="6" lg="6">
              <v-card elevation="1" border rounded="lg" class="h-100" :style="`border-left: 4px solid rgba(var(--v-theme-${typeColor(e.entryType)}), 0.8)`">
                <v-card-text class="py-3">
                  <div class="d-flex align-center flex-wrap ga-2 mb-1">
                    <v-chip size="small" variant="tonal" :color="typeColor(e.entryType)">{{ e.entryType }}</v-chip>
                    <span class="text-body-2 text-grey-darken-1"><v-icon size="14">mdi-calendar</v-icon> {{ formatDate(e.entryDate) }}</span>
                    <span v-if="e.periodLabel" class="text-body-2 text-grey-darken-1">· {{ e.periodLabel }}</span>
                    <v-spacer />
                    <v-menu v-if="!readOnly || effectiveCanDelete" location="bottom end">
                      <template #activator="{ props: mp }">
                        <v-btn v-bind="mp" icon="mdi-dots-vertical" size="x-small" variant="text" color="grey-darken-1" />
                      </template>
                      <v-list density="compact" min-width="140">
                        <v-list-item v-if="!readOnly" prepend-icon="mdi-pencil" title="Edit" @click="openEdit(e)" />
                        <v-list-item v-if="effectiveCanDelete" prepend-icon="mdi-delete" title="Delete" base-color="error" @click="confirmRemove(e)" />
                      </v-list>
                    </v-menu>
                  </div>
                  <div class="text-subtitle-2 font-weight-medium mb-1">{{ e.title || 'Untitled log' }}</div>
                  <div v-if="e.workAccomplished" class="mb-2">
                    <div class="d-flex align-center ga-1 mb-1">
                      <v-icon size="16" color="success">mdi-progress-check</v-icon>
                      <span class="text-body-2 font-weight-medium text-grey-darken-2">Work Accomplished</span>
                    </div>
                    <div class="text-body-2 text-pre-line pl-2">{{ e.workAccomplished }}</div>
                  </div>
                  <div v-if="e.issuesEncountered" class="mb-2">
                    <div class="d-flex align-center ga-1 mb-1">
                      <v-icon size="16" color="warning">mdi-alert-circle-outline</v-icon>
                      <span class="text-body-2 font-weight-medium text-grey-darken-2">Issues / Risks</span>
                    </div>
                    <div class="text-body-2 text-pre-line pl-2">{{ e.issuesEncountered }}</div>
                  </div>
                  <div class="d-flex flex-wrap ga-2 mt-2">
                    <v-chip v-if="e.manpowerCount != null" size="small" variant="outlined" prepend-icon="mdi-account-hard-hat">{{ e.manpowerCount }} personnel</v-chip>
                    <v-chip v-if="e.weather" size="small" variant="outlined" prepend-icon="mdi-weather-partly-cloudy">{{ e.weather }}</v-chip>
                    <v-chip v-if="e.equipmentUsed" size="small" variant="outlined" prepend-icon="mdi-excavator">{{ e.equipmentUsed }}</v-chip>
                    <v-chip v-if="e.photosCount" size="small" variant="outlined" prepend-icon="mdi-camera">{{ e.photosCount }} photos</v-chip>
                    <v-chip v-if="(e.concernsList?.length ?? 0) > 0" size="small" color="error" variant="tonal" prepend-icon="mdi-alert-circle-outline">{{ e.concernsList!.length }} concern{{ e.concernsList!.length > 1 ? 's' : '' }}</v-chip>
                    <v-chip v-if="e.createdByName" size="small" variant="text" prepend-icon="mdi-account-outline">{{ e.createdByName }}</v-chip>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <div v-if="totalPages > 1" class="d-flex justify-center py-2">
            <v-pagination v-model="page" :length="totalPages" :total-visible="5" density="compact" />
          </div>
        </div>

        <!-- ── LIST VIEW ── -->
        <div v-else-if="viewMode === 'list'" class="pa-3 d-flex flex-column ga-2">
          <v-card
            v-for="e in pagedEntries"
            :key="e.id"
            elevation="1" border rounded="lg" class="overflow-hidden"
            :style="`border-left: 4px solid rgba(var(--v-theme-${typeColor(e.entryType)}), 0.8)`"
          >
            <v-row no-gutters align="center" class="pa-3">
              <v-col cols="12" sm="2" class="d-flex flex-column ga-1 pr-3" style="border-right: 1px solid rgba(0,0,0,0.06)">
                <v-chip size="small" variant="tonal" :color="typeColor(e.entryType)" class="align-self-start">{{ e.entryType }}</v-chip>
                <div class="text-body-2 text-grey-darken-1 mt-1"><v-icon size="14">mdi-calendar</v-icon> {{ formatDate(e.entryDate) }}</div>
                <div v-if="e.periodLabel" class="text-body-2 text-grey">{{ e.periodLabel }}</div>
              </v-col>
              <v-col cols="12" sm="8" class="px-3">
                <div class="text-subtitle-2 font-weight-medium mb-1">{{ e.title || 'Untitled log' }}</div>
                <div v-if="e.workAccomplished" class="text-body-2 text-grey-darken-1 mb-1" style="overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                  <strong>Work:</strong> {{ e.workAccomplished }}
                </div>
                <div v-if="e.issuesEncountered" class="text-body-2 text-grey-darken-1 mb-1" style="overflow: hidden; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical;">
                  <strong>Issues:</strong> {{ e.issuesEncountered }}
                </div>
                <div class="d-flex flex-wrap ga-1 mt-1">
                  <v-chip v-if="e.manpowerCount != null" size="x-small" variant="outlined" prepend-icon="mdi-account-hard-hat">{{ e.manpowerCount }}</v-chip>
                  <v-chip v-if="e.weather" size="x-small" variant="outlined" prepend-icon="mdi-weather-partly-cloudy">{{ e.weather }}</v-chip>
                  <v-chip v-if="e.photosCount" size="x-small" variant="outlined" prepend-icon="mdi-camera">{{ e.photosCount }} photos</v-chip>
                  <v-chip v-if="(e.concernsList?.length ?? 0) > 0" size="x-small" color="error" variant="tonal" prepend-icon="mdi-alert-circle-outline">{{ e.concernsList!.length }}</v-chip>
                </div>
              </v-col>
              <v-col cols="12" sm="2" class="d-flex justify-end">
                <v-menu v-if="!readOnly || effectiveCanDelete" location="bottom end">
                  <template #activator="{ props: mp }">
                    <v-btn v-bind="mp" icon="mdi-dots-vertical" size="small" variant="text" color="grey-darken-1" />
                  </template>
                  <v-list density="compact" min-width="140">
                    <v-list-item v-if="!readOnly" prepend-icon="mdi-pencil" title="Edit" @click="openEdit(e)" />
                    <v-list-item v-if="effectiveCanDelete" prepend-icon="mdi-delete" title="Delete" base-color="error" @click="confirmRemove(e)" />
                  </v-list>
                </v-menu>
              </v-col>
            </v-row>
          </v-card>
          <div v-if="totalPages > 1" class="d-flex justify-center py-2">
            <v-pagination v-model="page" :length="totalPages" :total-visible="5" density="compact" />
          </div>
        </div>

        <!-- ── TABLE VIEW ── -->
        <v-data-table
          v-else-if="viewMode === 'table'"
          :items="filtered"
          :headers="tableHeaders"
          density="comfortable"
          :items-per-page="10"
          class="elevation-0"
        >
          <template #item.entryType="{ item }">
            <v-chip size="small" :color="typeColor(item.entryType)" variant="tonal">{{ item.entryType }}</v-chip>
          </template>
          <template #item.entryDate="{ item }">{{ formatDate(item.entryDate) }}</template>
          <template #item.periodLabel="{ item }">{{ item.periodLabel || '—' }}</template>
          <template #item.workAccomplished="{ item }">
            <span style="overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; max-width: 300px; display: block;">{{ item.workAccomplished || '—' }}</span>
          </template>
          <template #item.manpowerCount="{ item }">{{ item.manpowerCount != null ? item.manpowerCount : '—' }}</template>
          <template #item.photosCount="{ item }">{{ item.photosCount || '—' }}</template>
          <template #item.actions="{ item }">
            <v-menu v-if="!readOnly || effectiveCanDelete" location="bottom end">
              <template #activator="{ props: mp }">
                <v-btn v-bind="mp" icon="mdi-dots-vertical" size="x-small" variant="text" color="grey-darken-1" />
              </template>
              <v-list density="compact" min-width="140">
                <v-list-item v-if="!readOnly" prepend-icon="mdi-pencil" title="Edit" @click="openEdit(item)" />
                <v-list-item v-if="effectiveCanDelete" prepend-icon="mdi-delete" title="Delete" base-color="error" @click="confirmRemove(item)" />
              </v-list>
            </v-menu>
          </template>
        </v-data-table>

      </template>
    </template>

    <!-- Add / edit dialog -->
    <v-dialog v-model="dialogOpen" max-width="960" scrollable persistent>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center ga-2 bg-grey-lighten-4 py-3">
          <v-icon icon="mdi-calendar-text-outline" color="deep-purple" />
          <span class="text-h6 font-weight-medium">{{ editing ? 'Edit Timelog' : 'Add Timelog' }}</span>
          <v-spacer />
          <v-btn icon="mdi-close" size="small" variant="text" @click="dialogOpen = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <!-- ZZZ-E/F: Upgraded, dismissible WAR/MPR guidance banner (persists per project) -->
          <v-alert
            v-if="!bannerDismissed"
            :color="form.entry_type === 'MONTHLY' ? 'success' : 'primary'"
            variant="tonal" class="mb-4" :icon="form.entry_type === 'MONTHLY' ? 'mdi-calendar-month' : 'mdi-calendar-week'"
            closable
            @click:close="dismissBanner"
          >
            <div class="text-subtitle-2 font-weight-bold">
              {{ form.entry_type === 'MONTHLY'
                ? 'Monthly Progress Report (MPR — SD-ECO-ECO-010)'
                : 'Weekly Accomplishment Report (WAR — SD-ECO-ECO-009)' }}
            </div>
            <div class="text-body-2 mt-1">
              {{ form.entry_type === 'MONTHLY'
                ? 'Record the month\'s accomplishments, time performance, work status, project concerns, and program for next month. Physical & financial completion percentages are maintained in the Progress Reports tab.'
                : 'Record this week\'s accomplishments, physical completion, project concerns, delays, and actions taken during the reporting period. Physical & financial percentages are maintained in the Progress Reports tab.' }}
            </div>
          </v-alert>

          <v-row dense>
            <!-- ───────── SECTION 1: Project Information / Overview ───────── -->
            <v-col cols="12">
              <div class="d-flex align-center ga-2 mb-1">
                <v-icon size="18" :color="form.entry_type === 'MONTHLY' ? 'success' : 'primary'">mdi-information-outline</v-icon>
                <span class="text-subtitle-2 font-weight-semibold">{{ form.entry_type === 'MONTHLY' ? 'Project Overview' : 'Project Information' }}</span>
              </div>
            </v-col>
            <v-col cols="12" sm="4">
              <v-select
                v-model="form.entry_type" label="Type *"
                :items="[{ title: 'Weekly (WAR)', value: 'WEEKLY' }, { title: 'Monthly (MPR)', value: 'MONTHLY' }]"
                density="compact" variant="outlined" hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-menu v-model="entryDateMenu" :close-on-content-click="false">
                <template #activator="{ props: mp }">
                  <v-text-field
                    v-bind="mp" :model-value="form.entry_date" label="Date *"
                    prepend-inner-icon="mdi-calendar" readonly clearable
                    density="compact" variant="outlined" hide-details="auto"
                    @click:clear="form.entry_date = ''"
                  />
                </template>
                <v-date-picker
                  :model-value="isoToDate(form.entry_date)" hide-actions min="1900-01-01" max="2100-12-31"
                  @update:model-value="(v: any) => { form.entry_date = toIsoDate(v); entryDateMenu = false }"
                />
              </v-menu>
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field v-model="form.period_label" label="Period Label" placeholder="e.g. Week 17 / April 2026" density="compact" variant="outlined" hide-details="auto" />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="form.title" label="Title *" density="compact" variant="outlined" hide-details="auto" />
            </v-col>
            <!-- Report number + period -->
            <template v-if="form.entry_type === 'WEEKLY'">
              <v-col cols="12" sm="4"><v-text-field v-model="form.war_number" label="WAR Number" density="compact" variant="outlined" hide-details="auto" /></v-col>
              <v-col cols="12" sm="4"><v-text-field v-model="form.reporting_period_start" label="Period Start" type="date" density="compact" variant="outlined" hide-details="auto" /></v-col>
              <v-col cols="12" sm="4"><v-text-field v-model="form.reporting_period_end" label="Period End" type="date" density="compact" variant="outlined" hide-details="auto" /></v-col>
            </template>
            <template v-else>
              <v-col cols="12" sm="6"><v-text-field v-model="form.mpr_number" label="MPR Number" density="compact" variant="outlined" hide-details="auto" /></v-col>
              <v-col cols="12" sm="6"><v-text-field v-model="form.reporting_period_month" label="Reporting Month" type="date" density="compact" variant="outlined" hide-details="auto" /></v-col>
            </template>

            <!-- ───────── SECTION 2: Weekly / Monthly Accomplishments ───────── -->
            <v-col cols="12">
              <div class="d-flex align-center ga-2 mb-1 mt-2">
                <v-icon size="18" color="indigo">mdi-clipboard-check-outline</v-icon>
                <span class="text-subtitle-2 font-weight-semibold">{{ form.entry_type === 'MONTHLY' ? 'Monthly Accomplishments' : 'Weekly Accomplishments' }}</span>
              </div>
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="form.work_accomplished" :label="form.entry_type === 'MONTHLY' ? 'Accomplishments This Month' : 'Accomplishments This Week'" rows="3" auto-grow density="compact" variant="outlined" hide-details="auto" />
            </v-col>
            <!-- WAR itemized accomplishments list -->
            <template v-if="form.entry_type === 'WEEKLY'">
              <v-col cols="12" class="d-flex align-center justify-space-between">
                <span class="text-caption text-grey font-weight-medium text-uppercase">Itemized Accomplishments</span>
                <v-btn size="x-small" color="primary" variant="tonal" prepend-icon="mdi-plus" @click="addAccomplishment">Add</v-btn>
              </v-col>
              <v-col v-for="(a, i) in form.accomplishments" :key="'acc'+i" cols="12">
                <v-row dense class="align-center">
                  <v-col cols="12" sm="4"><v-text-field v-model="a.description" label="Description" density="compact" variant="outlined" hide-details /></v-col>
                  <v-col cols="6" sm="2"><v-text-field v-model="a.category" label="Category" density="compact" variant="outlined" hide-details /></v-col>
                  <v-col cols="6" sm="2"><v-text-field v-model="a.date" label="Date" type="date" density="compact" variant="outlined" hide-details /></v-col>
                  <v-col cols="5" sm="2"><v-text-field v-model.number="a.percentage" label="%" type="number" density="compact" variant="outlined" hide-details /></v-col>
                  <v-col cols="5" sm="1"><v-text-field v-model="a.remarks" label="Remarks" density="compact" variant="outlined" hide-details /></v-col>
                  <v-col cols="2" sm="1" class="d-flex justify-center"><v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="removeAccomplishment(i)" /></v-col>
                </v-row>
              </v-col>
            </template>

            <!-- ───────── SECTION 3: Physical Accomplishment ───────── -->
            <v-col cols="12">
              <div class="d-flex align-center ga-2 mb-1 mt-2">
                <v-icon size="18" color="primary">mdi-progress-check</v-icon>
                <span class="text-subtitle-2 font-weight-semibold">{{ form.entry_type === 'MONTHLY' ? 'Physical Accomplishment Summary' : 'Physical Accomplishment' }}</span>
              </div>
            </v-col>
            <!-- AAA-F: physical accomplishment input available for both WAR and MPR -->
            <v-col cols="12" sm="4">
              <v-text-field
                v-model.number="form.accomplishment_summary_percent"
                :label="form.entry_type === 'MONTHLY' ? '% Accomplished' : 'Physical Accomplishment This Week (%)'"
                type="number" min="0" max="100" step="0.1"
                density="compact" variant="outlined" hide-details="auto"
              />
            </v-col>
            <v-col cols="12">
              <v-alert type="info" variant="tonal" density="compact" class="text-caption">
                Cumulative physical completion percentage is the official record in the <strong>Progress Reports</strong> tab. This field captures the reported accomplishment for this period's documentation.
              </v-alert>
            </v-col>

            <!-- ───────── SECTION 4: Financial Accomplishment ───────── -->
            <v-col cols="12">
              <div class="d-flex align-center ga-2 mb-1 mt-2">
                <v-icon size="18" color="success">mdi-cash-multiple</v-icon>
                <span class="text-subtitle-2 font-weight-semibold">{{ form.entry_type === 'MONTHLY' ? 'Financial Accomplishment Summary' : 'Financial Accomplishment' }}</span>
              </div>
            </v-col>
            <!-- BBB-C: Financial billing fields shared by WAR and MPR (operational records) -->
            <v-col cols="6" sm="4">
              <v-text-field
                v-model.number="form.financial_accomplishment_percent"
                :label="form.entry_type === 'MONTHLY' ? 'Financial Accomplishment (%)' : 'Financial Accomplishment This Week (%)'"
                type="number" min="0" max="100" step="0.1"
                density="compact" variant="outlined" hide-details="auto"
              />
            </v-col>
            <v-col cols="6" sm="4">
              <v-text-field
                v-model.number="form.billing_amount_this_period"
                :label="form.entry_type === 'MONTHLY' ? 'Billing This Month (₱)' : 'Billing This Period (₱)'"
                type="number" min="0" prefix="₱"
                density="compact" variant="outlined" hide-details="auto"
              />
            </v-col>
            <template v-if="form.entry_type === 'MONTHLY'">
              <v-col cols="6" sm="4"><v-text-field v-model.number="form.percent_time_elapsed" label="% Time Elapsed" type="number" density="compact" variant="outlined" hide-details="auto" /></v-col>
              <v-col cols="6" sm="4"><v-text-field v-model.number="form.original_contract_amount" label="Original Contract (₱)" type="number" prefix="₱" density="compact" variant="outlined" hide-details="auto" /></v-col>
              <v-col cols="6" sm="4"><v-text-field v-model.number="form.revised_contract_amount" label="Revised Contract (₱)" type="number" prefix="₱" density="compact" variant="outlined" hide-details="auto" /></v-col>
            </template>
            <v-col cols="12">
              <v-alert type="info" variant="tonal" density="compact" class="text-caption">
                Official financial accomplishment is recorded in <strong>Progress Reports</strong>. These fields capture the site-level operational reference for WAR/MPR documentation.
              </v-alert>
            </v-col>

            <!-- ───────── SECTION 5: Work Activities / Work Status ───────── -->
            <v-col cols="12">
              <div class="d-flex align-center ga-2 mb-1 mt-2">
                <v-icon size="18" color="teal">mdi-hammer-wrench</v-icon>
                <span class="text-subtitle-2 font-weight-semibold">{{ form.entry_type === 'MONTHLY' ? 'Work Status' : 'Work Activities' }}</span>
              </div>
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="form.issues_encountered" label="Issues / Risks Encountered" rows="2" auto-grow density="compact" variant="outlined" hide-details="auto" />
            </v-col>
            <template v-if="form.entry_type === 'WEEKLY'">
              <v-col cols="12"><span class="text-caption text-grey font-weight-medium text-uppercase">Field Operations</span></v-col>
              <v-col cols="12" sm="4"><v-text-field v-model.number="form.manpower_count" label="Personnel On-Site" type="number" min="0" density="compact" variant="outlined" hide-details="auto" /></v-col>
              <v-col cols="12" sm="4"><v-text-field v-model="form.weather" label="Weather" density="compact" variant="outlined" hide-details="auto" /></v-col>
              <v-col cols="12" sm="4"><v-text-field v-model="form.equipment_used" label="Equipment On-Site" density="compact" variant="outlined" hide-details="auto" /></v-col>
            </template>
            <template v-else>
              <v-col cols="12" class="d-flex align-center justify-space-between">
                <span class="text-caption text-grey font-weight-medium text-uppercase">Work Accomplishment Items</span>
                <v-btn size="x-small" color="success" variant="tonal" prepend-icon="mdi-plus" @click="addWorkItem">Add</v-btn>
              </v-col>
              <v-col v-for="(w, i) in form.work_items" :key="'wi'+i" cols="12">
                <v-row dense class="align-center">
                  <v-col cols="6" sm="3"><v-text-field v-model="w.description" label="Description" density="compact" variant="outlined" hide-details /></v-col>
                  <v-col cols="6" sm="2"><v-text-field v-model="w.unit" label="Unit" density="compact" variant="outlined" hide-details /></v-col>
                  <v-col cols="6" sm="2"><v-text-field v-model.number="w.quantity" label="Qty" type="number" density="compact" variant="outlined" hide-details /></v-col>
                  <v-col cols="6" sm="2"><v-text-field v-model.number="w.weightNumber" label="Weight" type="number" density="compact" variant="outlined" hide-details /></v-col>
                  <v-col cols="10" sm="2"><v-text-field v-model.number="w.actualPercentToDate" label="% To Date" type="number" density="compact" variant="outlined" hide-details /></v-col>
                  <v-col cols="2" sm="1" class="d-flex justify-center"><v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="removeWorkItem(i)" /></v-col>
                </v-row>
              </v-col>
            </template>

            <!-- ───────── SECTION 6: Project Concerns (ZZZ-G structured list) ───────── -->
            <v-col cols="12">
              <div class="d-flex align-center justify-space-between mb-1 mt-2">
                <div class="d-flex align-center ga-2">
                  <v-icon size="18" color="error">mdi-alert-circle-outline</v-icon>
                  <span class="text-subtitle-2 font-weight-semibold">Project Concerns</span>
                  <v-chip v-if="form.concerns_list.length" size="x-small" color="error" variant="tonal">{{ form.concerns_list.length }}</v-chip>
                </div>
                <v-btn size="x-small" color="error" variant="tonal" prepend-icon="mdi-plus" @click="addConcern">Add Concern</v-btn>
              </div>
            </v-col>
            <v-col v-for="(c, i) in form.concerns_list" :key="'concern'+i" cols="12">
              <v-card variant="tonal" :color="concernSeverityColor(c.severity)" class="pa-3 mb-1" rounded="lg">
                <v-row dense align="center">
                  <v-col cols="12" sm="7"><v-text-field v-model="c.title" label="Title" density="compact" variant="outlined" hide-details bg-color="surface" /></v-col>
                  <v-col cols="9" sm="4"><v-select v-model="c.category" :items="CONCERN_CATEGORIES" label="Category" density="compact" variant="outlined" hide-details bg-color="surface" /></v-col>
                  <v-col cols="3" sm="1" class="d-flex justify-center"><v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="removeConcern(i)" /></v-col>
                  <v-col cols="12"><v-textarea v-model="c.description" label="Description" rows="2" auto-grow density="compact" variant="outlined" hide-details bg-color="surface" /></v-col>
                  <v-col cols="6" sm="3"><v-select v-model="c.severity" :items="CONCERN_SEVERITIES" label="Severity" density="compact" variant="outlined" hide-details bg-color="surface" /></v-col>
                  <v-col cols="6" sm="3"><v-select v-model="c.status" :items="CONCERN_STATUSES" label="Status" density="compact" variant="outlined" hide-details bg-color="surface" /></v-col>
                  <v-col cols="12" sm="6"><v-text-field v-model="c.responsibleParty" label="Responsible Party" density="compact" variant="outlined" hide-details bg-color="surface" /></v-col>
                  <v-col cols="6" sm="3"><v-text-field v-model="c.resolutionTargetDate" label="Target Resolution" type="date" density="compact" variant="outlined" hide-details bg-color="surface" /></v-col>
                  <v-col cols="6" sm="3"><v-text-field v-model="c.actualResolutionDate" label="Actual Resolution" type="date" density="compact" variant="outlined" hide-details bg-color="surface" /></v-col>
                  <v-col cols="12"><v-text-field v-model="c.mitigationAction" label="Mitigation Action" density="compact" variant="outlined" hide-details bg-color="surface" /></v-col>
                </v-row>
              </v-card>
            </v-col>
            <!-- Legacy concern textareas (preserved per ZZZ-G) -->
            <v-col cols="12"><v-textarea v-model="form.personnel_equipment_constraints" label="Personnel / Equipment Constraints (legacy)" rows="2" auto-grow density="compact" variant="outlined" hide-details="auto" /></v-col>

            <!-- ───────── SECTION 7: Recommendations / Corrective Actions ───────── -->
            <v-col cols="12">
              <div class="d-flex align-center ga-2 mb-1 mt-2">
                <v-icon size="18" color="deep-orange">mdi-clipboard-arrow-right-outline</v-icon>
                <span class="text-subtitle-2 font-weight-semibold">{{ form.entry_type === 'MONTHLY' ? 'Corrective Actions' : 'Recommendations / Actions Taken' }}</span>
              </div>
            </v-col>
            <v-col cols="12"><v-textarea v-model="form.mitigation_measures" :label="form.entry_type === 'MONTHLY' ? 'Corrective Actions' : 'Mitigation / Contingency Measures'" rows="2" auto-grow density="compact" variant="outlined" hide-details="auto" /></v-col>
            <v-col v-if="form.entry_type === 'WEEKLY'" cols="12"><v-textarea v-model="form.look_ahead_activities" label="Look-Ahead Activities (Next Week)" rows="2" auto-grow density="compact" variant="outlined" hide-details="auto" /></v-col>

            <!-- ───────── SECTION 8: Forecast / Next Period ───────── -->
            <v-col cols="12">
              <div class="d-flex align-center ga-2 mb-1 mt-2">
                <v-icon size="18" color="blue-grey">mdi-calendar-arrow-right</v-icon>
                <span class="text-subtitle-2 font-weight-semibold">{{ form.entry_type === 'MONTHLY' ? 'Program for Next Month / Forecast' : 'Plan for Next Week' }}</span>
              </div>
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="form.description" :label="form.entry_type === 'MONTHLY' ? 'Program for Next Month / Forecast' : 'Plan for Next Week'" rows="2" auto-grow density="compact" variant="outlined" hide-details="auto" />
            </v-col>

            <!-- ───────── Signatories / Approval Workflow (user search) ───────── -->
            <v-col cols="12">
              <div class="d-flex align-center ga-2 mb-1 mt-2">
                <v-icon size="18" color="purple">mdi-draw-pen</v-icon>
                <span class="text-subtitle-2 font-weight-semibold">{{ form.entry_type === 'MONTHLY' ? 'Approval Workflow' : 'Signatories' }}</span>
              </div>
            </v-col>
            <v-col v-for="(sig, i) in form.signatories" :key="'sig'+i" cols="12">
              <v-row dense class="align-center">
                <v-col cols="12" sm="3"><v-chip size="small" variant="tonal" color="blue-grey">{{ sig.role }}</v-chip></v-col>
                <v-col cols="12" sm="5">
                  <v-autocomplete
                    v-model="sig.userId"
                    :items="userSearchResults"
                    :loading="userSearchLoading"
                    item-title="fullName" item-value="id"
                    label="Search system user…" density="compact" variant="outlined" hide-details
                    clearable no-filter
                    @update:search="searchUsers"
                    @update:model-value="(v: any) => onSignatorySelect(sig, v)"
                  >
                    <template #selection>{{ sig.userName || 'Search…' }}</template>
                  </v-autocomplete>
                </v-col>
                <v-col cols="6" sm="2"><v-text-field v-model="sig.position" label="Position" density="compact" variant="outlined" hide-details /></v-col>
                <v-col cols="6" sm="2"><v-text-field v-model="sig.date" label="Date" type="date" density="compact" variant="outlined" hide-details /></v-col>
              </v-row>
            </v-col>

            <!-- ───────── SECTION 8/9: Supporting Evidence & MOV (DDD-C) ───────── -->
            <!-- Row 0: Section banner -->
            <v-col cols="12">
              <v-alert type="info" variant="tonal" density="compact" class="mb-2" icon="mdi-paperclip">
                <div class="text-subtitle-2 font-weight-semibold">Supporting Evidence &amp; Means of Verification (MOV)</div>
                <div class="text-caption mt-1">
                  Upload supporting evidence, photos, reports, links, and documentation related to this accomplishment report.
                  Files will be automatically filed to
                  <strong>Supporting Documents → Reports &amp; Monitoring →
                  {{ form.entry_type === 'MONTHLY' ? 'Monthly Progress Report' : 'Weekly Accomplishment Report' }}</strong>.
                </div>
              </v-alert>
            </v-col>
            <!-- Row 1: Upload + Link side-by-side -->
            <v-col cols="12" sm="6">
              <v-file-input
                :model-value="form.mov_file ? [form.mov_file] : []"
                label="Upload MOV Document"
                prepend-icon="mdi-file-upload-outline"
                density="compact" variant="outlined" hide-details="auto"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                @update:model-value="(f: File | File[] | null | undefined) => form.mov_file = (Array.isArray(f) ? f[0] : f) ?? null"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.mov_link"
                label="Or paste a document link"
                prepend-inner-icon="mdi-link-variant"
                density="compact" variant="outlined" hide-details="auto"
                placeholder="https://..."
                clearable
              />
            </v-col>
            <v-col v-if="form.mov_link" cols="12" sm="6" class="offset-sm-6">
              <v-text-field
                v-model="form.mov_link_title"
                label="Link title (optional)"
                density="compact" variant="outlined" hide-details="auto"
              />
            </v-col>
            <!-- Row 2: Status feedback -->
            <v-col v-if="form.mov_file || form.mov_link" cols="12">
              <v-alert type="success" variant="tonal" density="compact" icon="mdi-check-circle-outline" class="text-caption">
                <span v-if="form.mov_file">File <strong>{{ form.mov_file.name }}</strong> ready to upload.</span>
                <span v-if="form.mov_file && form.mov_link"> · </span>
                <span v-if="form.mov_link">Link ready to file.</span>
                Will be automatically filed to the repository on submit.
              </v-alert>
            </v-col>
            <!-- Row 3: Repository destination -->
            <v-col cols="12">
              <v-card variant="tonal" color="blue-grey" class="pa-2" rounded="lg">
                <div class="d-flex align-center ga-2 flex-wrap">
                  <v-icon size="14" color="blue-grey">mdi-folder-open-outline</v-icon>
                  <span class="text-caption font-weight-medium">Repository destination:</span>
                  <v-chip size="x-small" variant="outlined">
                    Supporting Documents → Reports &amp; Monitoring →
                    {{ form.entry_type === 'MONTHLY' ? 'Monthly Progress Report (SD_ECO_010)' : 'Weekly Accomplishment Report (SD_ECO_009)' }}
                  </v-chip>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn variant="text" :disabled="submitting" @click="dialogOpen = false">Cancel</v-btn>
          <v-btn color="deep-purple" variant="elevated" :loading="submitting" @click="save">
            {{ editing ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>
