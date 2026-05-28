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

const blank = () => ({
  entry_type: 'WEEKLY',
  entry_date: '',
  period_label: '',
  title: '',
  work_accomplished: '',
  issues_encountered: '',
  weather: '',
  manpower_count: null as number | null,
  equipment_used: '',
})
const form = ref(blank())

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
  form.value = {
    entry_type: e.entryType || 'WEEKLY',
    entry_date: e.entryDate || '',
    period_label: e.periodLabel || '',
    title: e.title || '',
    work_accomplished: e.workAccomplished || '',
    issues_encountered: e.issuesEncountered || '',
    weather: e.weather || '',
    manpower_count: e.manpowerCount ?? null,
    equipment_used: e.equipmentUsed || '',
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
    const payload: Record<string, any> = Object.fromEntries(
      Object.entries(form.value).filter(([, v]) => v !== '' && v !== null),
    )
    if (editing.value) {
      await api.patch(`/api/construction-projects/${props.projectId}/timeline-entries/${editing.value.id}`, payload)
      toast.success('Timelog updated')
    } else {
      await api.post(`/api/construction-projects/${props.projectId}/timeline-entries`, payload)
      toast.success('Timelog created')
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
                  <div class="text-subtitle-1 font-weight-medium mb-1">{{ e.title || 'Untitled log' }}</div>
                  <div v-if="e.workAccomplished" class="mb-2">
                    <div class="d-flex align-center ga-1 mb-1">
                      <v-icon size="16" color="success">mdi-progress-check</v-icon>
                      <span class="text-body-2 font-weight-medium text-grey-darken-2">Work Accomplished</span>
                    </div>
                    <div class="text-body-1 text-pre-line pl-2">{{ e.workAccomplished }}</div>
                  </div>
                  <div v-if="e.issuesEncountered" class="mb-2">
                    <div class="d-flex align-center ga-1 mb-1">
                      <v-icon size="16" color="warning">mdi-alert-circle-outline</v-icon>
                      <span class="text-body-2 font-weight-medium text-grey-darken-2">Issues / Risks</span>
                    </div>
                    <div class="text-body-1 text-pre-line pl-2">{{ e.issuesEncountered }}</div>
                  </div>
                  <div class="d-flex flex-wrap ga-2 mt-2">
                    <v-chip v-if="e.manpowerCount != null" size="small" variant="outlined" prepend-icon="mdi-account-hard-hat">{{ e.manpowerCount }} personnel</v-chip>
                    <v-chip v-if="e.weather" size="small" variant="outlined" prepend-icon="mdi-weather-partly-cloudy">{{ e.weather }}</v-chip>
                    <v-chip v-if="e.equipmentUsed" size="small" variant="outlined" prepend-icon="mdi-excavator">{{ e.equipmentUsed }}</v-chip>
                    <v-chip v-if="e.photosCount" size="small" variant="outlined" prepend-icon="mdi-camera">{{ e.photosCount }} photos</v-chip>
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
    <v-dialog v-model="dialogOpen" max-width="720" scrollable persistent>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center ga-2 bg-grey-lighten-4 py-3">
          <v-icon icon="mdi-calendar-text-outline" color="deep-purple" />
          <span class="text-h6 font-weight-medium">{{ editing ? 'Edit Timelog' : 'Add Timelog' }}</span>
          <v-spacer />
          <v-btn icon="mdi-close" size="small" variant="text" @click="dialogOpen = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-row dense>
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
            <v-col cols="12">
              <v-textarea v-model="form.work_accomplished" label="Work Accomplished" rows="3" auto-grow density="compact" variant="outlined" hide-details="auto" />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="form.issues_encountered" label="Issues / Risks Encountered" rows="2" auto-grow density="compact" variant="outlined" hide-details="auto" />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field v-model.number="form.manpower_count" label="Personnel" type="number" min="0" density="compact" variant="outlined" hide-details="auto" />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field v-model="form.weather" label="Weather" density="compact" variant="outlined" hide-details="auto" />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field v-model="form.equipment_used" label="Equipment Used" density="compact" variant="outlined" hide-details="auto" />
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
