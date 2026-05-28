<script setup lang="ts">
/**
 * Phase NG (2026-05-21): Progress Report multi-view container.
 * Toggles between 'list' | 'card' | 'table' views over the same
 * chronological list of progress reports. Add/edit via inline dialog.
 * Phase OI (2026-05-21): Added project date header props, list view,
 * proper pagination in card (5/page) and table (10/page) views.
 * Phase OW (2026-05-22): Comparison view removed; toggle standardized.
 */
import { useCoiProgressReports, type ProgressReport } from '~/composables/useCoiProgressReports'
import CiBulletListInput from '~/components/coi/CiBulletListInput.vue'

const props = withDefaults(defineProps<{
  projectId: string
  readOnly?: boolean
  canDelete?: boolean  // PS-B: project-level delete permission gate
  projectDuration?: string
  projectStartDate?: string
  projectTargetCompletionDate?: string
}>(), { readOnly: false, canDelete: undefined })

const effectiveCanDelete = computed(() => !props.readOnly && props.canDelete !== false)

const projectIdRef = computed(() => props.projectId)
const { items, loading, create, update, remove } = useCoiProgressReports(projectIdRef)
const toast = useToast ? useToast() : { success: console.log, error: console.error }

// ── View mode ───────────────────────────────────────────────────────────────
const viewMode = ref<'list' | 'card' | 'table'>('list')

// ── Dialog state ────────────────────────────────────────────────────────────
const dialogOpen = ref(false)
const editing = ref<ProgressReport | null>(null)
const submitting = ref(false)

const blank = () => ({
  report_type: 'MONTHLY',
  report_date: '',
  report_number: '',
  percentage_completion: null as number | null,
  planned_accomplishment: null as number | null,
  slippage: null as number | null,
  cost_incurred_to_date: null as number | null,
  cost_incurred_this_period: null as number | null,
  calendar_days_elapsed: null as number | null,
  percent_time_elapsed: null as number | null,
  mov_link: '',
  narrative_items: [] as string[],
  remarks_items: [] as string[],
  issues_items: [] as string[],
  mitigation_items: [] as string[],
})
const form = ref(blank())

const reportDateMenu = ref(false)

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

function openEdit(r: ProgressReport) {
  editing.value = r
  form.value = {
    report_type: r.reportType,
    report_date: r.reportDate,
    report_number: r.reportNumber || '',
    percentage_completion: r.percentageCompletion != null ? Number(r.percentageCompletion) : null,
    planned_accomplishment: r.plannedAccomplishment != null ? Number(r.plannedAccomplishment) : null,
    slippage: r.slippage != null ? Number(r.slippage) : null,
    cost_incurred_to_date: r.costIncurredToDate != null ? Number(r.costIncurredToDate) : null,
    cost_incurred_this_period: r.costIncurredThisPeriod != null ? Number(r.costIncurredThisPeriod) : null,
    calendar_days_elapsed: r.calendarDaysElapsed ?? null,
    percent_time_elapsed: r.percentTimeElapsed != null ? Number(r.percentTimeElapsed) : null,
    mov_link: r.movLink || '',
    narrative_items: (r.narrativeList || []).map(x => x.text),
    remarks_items: (r.remarksList || []).map(x => x.text),
    issues_items: (r.issuesEncounteredList || []).map(x => x.text),
    mitigation_items: (r.mitigationActionsList || []).map(x => x.text),
  }
  dialogOpen.value = true
}

async function save() {
  if (!form.value.report_type || !form.value.report_date) {
    toast.error('Report Type and Report Date are required')
    return
  }
  submitting.value = true
  try {
    const toListPayload = (items: string[]) =>
      items.filter(t => t.trim()).map(text => ({ text }))
    const { narrative_items, remarks_items, issues_items, mitigation_items, ...rest } = form.value
    const payload: Record<string, any> = Object.fromEntries(
      Object.entries(rest).filter(([_, v]) => v !== '' && v !== null),
    )
    payload.narrative_list = toListPayload(narrative_items)
    payload.remarks_list = toListPayload(remarks_items)
    payload.issues_encountered_list = toListPayload(issues_items)
    payload.mitigation_actions_list = toListPayload(mitigation_items)
    if (editing.value) {
      await update(editing.value.id, payload)
      toast.success('Progress report updated')
    } else {
      await create(payload)
      toast.success('Progress report created')
    }
    dialogOpen.value = false
  } catch (err: any) {
    toast.error(err?.message || 'Failed to save progress report')
  } finally {
    submitting.value = false
  }
}

async function confirmRemove(r: ProgressReport) {
  if (!confirm(`Delete ${r.reportType} report dated ${r.reportDate}?`)) return
  try {
    await remove(r.id)
    toast.success('Progress report deleted')
  } catch (err: any) {
    toast.error(err?.message || 'Failed to delete')
  }
}

// ── List view expand state ───────────────────────────────────────────────────
const expandedCards = ref<Set<string>>(new Set())
function toggleExpand(id: string) {
  if (expandedCards.value.has(id)) expandedCards.value.delete(id)
  else expandedCards.value.add(id)
  expandedCards.value = new Set(expandedCards.value)
}

// ── List view pagination ─────────────────────────────────────────────────────
const listPage = ref(1)
const listPerPage = 5
const listTotalPages = computed(() => Math.max(1, Math.ceil(items.value.length / listPerPage)))
const pagedListItems = computed(() =>
  items.value.slice((listPage.value - 1) * listPerPage, listPage.value * listPerPage)
)

// ── Card view pagination ─────────────────────────────────────────────────────
const cardPage = ref(1)
const cardPerPage = 5
const cardTotalPages = computed(() => Math.max(1, Math.ceil(items.value.length / cardPerPage)))
const pagedCardItems = computed(() =>
  items.value.slice((cardPage.value - 1) * cardPerPage, cardPage.value * cardPerPage)
)

watch(items, () => { listPage.value = 1; cardPage.value = 1 })

function fmtPct(v: string | number | null | undefined) {
  if (v == null) return '—'
  return `${Number(v).toFixed(2)}%`
}
function fmtPHP(v: string | number | null | undefined) {
  if (v == null) return '—'
  return `₱${Number(v).toLocaleString('en-PH', { maximumFractionDigits: 2 })}`
}

const headers = [
  { title: 'Report #', key: 'reportNumber', width: 110 },
  { title: 'Type', key: 'reportType', width: 90 },
  { title: 'Date', key: 'reportDate', width: 110 },
  { title: '% Completion', key: 'percentageCompletion', width: 120, align: 'end' as const },
  { title: 'Planned %', key: 'plannedAccomplishment', width: 100, align: 'end' as const },
  { title: 'Slippage', key: 'slippage', width: 90, align: 'end' as const },
  { title: 'Cost to Date', key: 'costIncurredToDate', width: 140, align: 'end' as const },
  { title: 'MOV', key: 'movLink', width: 60, align: 'center' as const },
  { title: '', key: 'actions', width: 90, align: 'end' as const, sortable: false },
]
</script>

<template>
  <v-card elevation="2" rounded="lg">
    <v-card-title class="d-flex align-center justify-space-between py-2 px-4 bg-grey-lighten-4">
      <div class="d-flex align-center ga-2">
        <v-icon size="small" icon="mdi-chart-timeline-variant" color="info" />
        <span class="text-subtitle-1 font-weight-medium">Progress Reports</span>
        <v-chip size="x-small" variant="tonal" color="info">{{ items.length }}</v-chip>
      </div>
      <div class="d-flex align-center ga-2">
        <!-- OW (2026-05-22): Timeline-standard toggle — density=compact, divided, text labels; comparison removed -->
        <v-btn-toggle
          v-model="viewMode"
          density="compact"
          variant="outlined"
          divided
          :mandatory="true"
          color="info"
        >
          <v-btn value="list" size="small" prepend-icon="mdi-format-list-bulleted">List</v-btn>
          <v-btn value="card" size="small" prepend-icon="mdi-view-grid-outline">Card</v-btn>
          <v-btn value="table" size="small" prepend-icon="mdi-table">Table</v-btn>
        </v-btn-toggle>
        <v-btn
          v-if="!readOnly"
          size="small"
          color="info"
          variant="tonal"
          prepend-icon="mdi-plus"
          @click="openCreate"
        >
          Add Report
        </v-btn>
      </div>
    </v-card-title>
    <v-card-subtitle class="pt-2 pb-1 text-body-2 text-grey-darken-1" style="white-space: normal;">
      Chronological MPR/WAR-aligned reports. Switch view modes to analyze trends. Each entry mirrors latest values into the project header.
    </v-card-subtitle>

    <!-- OI-A: Project Date synchronized header -->
    <div
      v-if="projectStartDate || projectTargetCompletionDate || projectDuration"
      class="px-4 py-2 bg-blue-lighten-5 border-b"
    >
      <div class="d-flex flex-wrap ga-3 align-center">
        <div class="d-flex align-center ga-1">
          <v-icon size="14" color="blue-darken-2">mdi-calendar-start</v-icon>
          <span class="text-caption text-grey-darken-1">Start:</span>
          <span class="text-caption font-weight-medium">{{ projectStartDate || '—' }}</span>
        </div>
        <div class="d-flex align-center ga-1">
          <v-icon size="14" color="blue-darken-2">mdi-calendar-check</v-icon>
          <span class="text-caption text-grey-darken-1">Target Completion:</span>
          <span class="text-caption font-weight-medium">{{ projectTargetCompletionDate || '—' }}</span>
        </div>
        <div class="d-flex align-center ga-1">
          <v-icon size="14" color="blue-darken-2">mdi-timer-outline</v-icon>
          <span class="text-caption text-grey-darken-1">Duration:</span>
          <span class="text-caption font-weight-medium">{{ projectDuration || '—' }}</span>
        </div>
      </div>
    </div>

    <v-divider />

    <!-- ══════ Loading ══════ -->
    <div v-if="loading" class="d-flex justify-center align-center py-8">
      <v-progress-circular indeterminate color="info" size="28" />
    </div>

    <template v-else>
      <!-- ══════ Empty state ══════ -->
      <div v-if="items.length === 0" class="text-center text-grey py-8">
        <v-icon size="40" color="grey-lighten-1">mdi-chart-line</v-icon>
        <div class="text-body-2 mt-2">No progress reports yet.</div>
        <v-btn v-if="!readOnly" size="small" color="info" variant="tonal" class="mt-3" prepend-icon="mdi-plus" @click="openCreate">
          Add First Report
        </v-btn>
      </div>

      <!-- ══════ LIST VIEW ══════ -->
      <template v-else-if="viewMode === 'list'">
        <div class="pa-3 d-flex flex-column ga-3">
          <!-- OR-B (2026-05-22): 3-col sm layout — left identity, center stat grid + expand, right actions -->
          <v-card
            v-for="r in pagedListItems"
            :key="r.id"
            elevation="1"
            border
            rounded="lg"
            class="overflow-hidden"
            style="border-left: 3px solid rgba(var(--v-theme-info), 0.7)"
          >
            <v-row no-gutters align="stretch">
              <!-- LEFT: Identity -->
              <v-col cols="12" sm="3" class="pa-3 d-flex flex-column ga-1 bg-grey-lighten-5" style="border-right: 1px solid rgba(0,0,0,0.08)">
                <v-chip size="small" variant="tonal" color="info" class="align-self-start">{{ r.reportType }}</v-chip>
                <div class="text-subtitle-1 font-weight-medium mt-1">{{ r.reportNumber || r.reportDate }}</div>
                <div v-if="r.reportNumber" class="text-body-2 text-grey-darken-1">{{ r.reportDate }}</div>
              </v-col>
              <!-- CENTER: 2×2 CSS grid + expand -->
              <v-col cols="12" sm="7" class="pa-3" style="border-right: 1px solid rgba(0,0,0,0.08)">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px;">
                  <div>
                    <div class="text-body-2 text-grey-darken-1">% Completion</div>
                    <div class="text-h6 font-weight-bold text-info">{{ fmtPct(r.percentageCompletion) }}</div>
                  </div>
                  <div>
                    <div class="text-body-2 text-grey-darken-1">Planned %</div>
                    <div class="text-subtitle-1 font-weight-medium">{{ fmtPct(r.plannedAccomplishment) }}</div>
                  </div>
                  <div>
                    <div class="text-body-2 text-grey-darken-1">Slippage</div>
                    <div class="text-subtitle-1 font-weight-medium" :class="r.slippage != null && Number(r.slippage) < 0 ? 'text-error' : ''">
                      {{ fmtPct(r.slippage) }}
                    </div>
                  </div>
                  <div>
                    <div class="text-body-2 text-grey-darken-1">Cost to Date</div>
                    <div class="text-subtitle-1 font-weight-medium">{{ fmtPHP(r.costIncurredToDate) }}</div>
                  </div>
                </div>
                <!-- Expandable detail inside center col -->
                <v-expand-transition>
                  <div v-if="expandedCards.has(r.id)" class="mt-3">
                    <v-divider class="mb-2" />
                    <div class="d-flex flex-wrap ga-3 text-body-2 mb-2">
                      <div v-if="r.costIncurredThisPeriod != null">
                        <div class="text-caption text-grey-darken-1">Cost This Period</div>
                        <div>{{ fmtPHP(r.costIncurredThisPeriod) }}</div>
                      </div>
                      <div v-if="r.calendarDaysElapsed != null">
                        <div class="text-caption text-grey-darken-1">Calendar Days</div>
                        <div>{{ r.calendarDaysElapsed }}</div>
                      </div>
                      <div v-if="r.percentTimeElapsed != null">
                        <div class="text-caption text-grey-darken-1">% Time Elapsed</div>
                        <div>{{ fmtPct(r.percentTimeElapsed) }}</div>
                      </div>
                    </div>
                    <!-- OW (2026-05-22): full descriptive labels + icons, consistent with dialog -->
                    <div v-if="r.remarks || (r.remarksList && r.remarksList.length)" class="mb-2">
                      <div class="d-flex align-center ga-1 mb-1">
                        <v-icon size="12" color="info">mdi-comment-text-outline</v-icon>
                        <span class="text-caption font-weight-medium text-grey-darken-2">Remarks</span>
                      </div>
                      <div v-if="r.remarksList && r.remarksList.length">
                        <div v-for="(item, i) in r.remarksList" :key="i" class="text-body-2 pl-2">• {{ item.text }}</div>
                      </div>
                      <div v-else class="text-body-2 pl-2">{{ r.remarks }}</div>
                    </div>
                    <div v-if="r.issuesEncountered || (r.issuesEncounteredList && r.issuesEncounteredList.length)" class="mb-2">
                      <div class="d-flex align-center ga-1 mb-1">
                        <v-icon size="12" color="warning">mdi-alert-circle-outline</v-icon>
                        <span class="text-caption font-weight-medium text-grey-darken-2">Issues / Risks Encountered</span>
                      </div>
                      <div v-if="r.issuesEncounteredList && r.issuesEncounteredList.length">
                        <div v-for="(item, i) in r.issuesEncounteredList" :key="i" class="text-body-2 pl-2">• {{ item.text }}</div>
                      </div>
                      <div v-else class="text-body-2 pl-2">{{ r.issuesEncountered }}</div>
                    </div>
                    <div v-if="r.mitigationActions || (r.mitigationActionsList && r.mitigationActionsList.length)" class="mb-2">
                      <div class="d-flex align-center ga-1 mb-1">
                        <v-icon size="12" color="success">mdi-shield-check-outline</v-icon>
                        <span class="text-caption font-weight-medium text-grey-darken-2">Mitigation Actions</span>
                      </div>
                      <div v-if="r.mitigationActionsList && r.mitigationActionsList.length">
                        <div v-for="(item, i) in r.mitigationActionsList" :key="i" class="text-body-2 pl-2">• {{ item.text }}</div>
                      </div>
                      <div v-else class="text-body-2 pl-2">{{ r.mitigationActions }}</div>
                    </div>
                    <div v-if="r.narrativeList && r.narrativeList.length" class="mb-2">
                      <div class="d-flex align-center ga-1 mb-1">
                        <v-icon size="12" color="primary">mdi-text-long</v-icon>
                        <span class="text-caption font-weight-medium text-grey-darken-2">General Narrative Notes</span>
                      </div>
                      <div v-for="(item, i) in r.narrativeList" :key="i" class="text-body-2 pl-2">• {{ item.text }}</div>
                    </div>
                  </div>
                </v-expand-transition>
              </v-col>
              <!-- RIGHT: Actions -->
              <v-col cols="12" sm="2" class="d-flex flex-row flex-wrap align-center justify-center ga-1 pa-2 bg-grey-lighten-5">
                <CiMovLinkBtn :url="r.movLink" />
                <v-btn
                  icon size="x-small" variant="text"
                  :color="expandedCards.has(r.id) ? 'info' : 'grey'"
                  :title="expandedCards.has(r.id) ? 'Collapse' : 'Expand'"
                  @click="toggleExpand(r.id)"
                >
                  <v-icon size="16">{{ expandedCards.has(r.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                </v-btn>
                <v-btn v-if="!readOnly" icon="mdi-pencil" size="x-small" variant="text" color="primary" @click="openEdit(r)" />
                <v-btn v-if="effectiveCanDelete" icon="mdi-delete" size="x-small" variant="text" color="error" @click="confirmRemove(r)" />
              </v-col>
            </v-row>
          </v-card>
          <div v-if="items.length > listPerPage" class="d-flex justify-center py-2">
            <v-pagination v-model="listPage" :length="listTotalPages" :total-visible="5" density="compact" />
          </div>
        </div>
      </template>

      <!-- ══════ CARD VIEW ══════ -->
      <template v-else-if="viewMode === 'card'">
        <v-card-text class="py-3">
          <v-row dense>
            <v-col v-for="r in pagedCardItems" :key="r.id" cols="12" sm="6" md="4">
              <v-card variant="outlined" rounded="lg" class="h-100" style="border-left: 3px solid rgba(var(--v-theme-info), 0.7)">
                <v-card-title class="d-flex align-center ga-1 py-2 px-3">
                  <v-chip size="x-small" variant="tonal" color="info">{{ r.reportType }}</v-chip>
                  <span class="text-body-2 font-weight-medium">{{ r.reportNumber || r.reportDate }}</span>
                  <v-spacer />
                  <v-btn v-if="!readOnly" icon="mdi-pencil" size="x-small" variant="text" @click="openEdit(r)" />
                  <v-btn v-if="effectiveCanDelete" icon="mdi-delete" size="x-small" variant="text" color="error" @click="confirmRemove(r)" />
                </v-card-title>
                <v-divider />
                <v-card-text class="py-2">
                  <div class="d-flex justify-space-between text-body-2 mb-1">
                    <span class="text-grey">% Completion:</span>
                    <span class="font-weight-bold">{{ fmtPct(r.percentageCompletion) }}</span>
                  </div>
                  <div class="d-flex justify-space-between text-body-2 mb-1">
                    <span class="text-grey">Cost to Date:</span>
                    <span>{{ fmtPHP(r.costIncurredToDate) }}</span>
                  </div>
                  <div class="d-flex justify-space-between text-body-2 mb-1">
                    <span class="text-grey">Slippage:</span>
                    <span :class="Number(r.slippage || 0) < 0 ? 'text-error' : ''">{{ fmtPct(r.slippage) }}</span>
                  </div>
                  <div class="text-caption text-grey">{{ r.reportDate }}</div>
                  <CiMovLinkBtn :url="r.movLink" :icon-only="false" label="MOV" size="small" />
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <div v-if="items.length > cardPerPage" class="d-flex justify-center py-2">
          <v-pagination v-model="cardPage" :length="cardTotalPages" :total-visible="5" density="compact" />
        </div>
      </template>

      <!-- ══════ TABLE VIEW ══════ -->
      <template v-else-if="viewMode === 'table'">
        <v-data-table
          :items="items"
          :headers="headers"
          :loading="loading"
          density="comfortable"
          class="elevation-0"
          :items-per-page="10"
        >
          <template #item.percentageCompletion="{ item }">{{ fmtPct(item.percentageCompletion) }}</template>
          <template #item.plannedAccomplishment="{ item }">{{ fmtPct(item.plannedAccomplishment) }}</template>
          <template #item.slippage="{ item }">
            <span :class="Number(item.slippage || 0) < 0 ? 'text-error' : ''">{{ fmtPct(item.slippage) }}</span>
          </template>
          <template #item.costIncurredToDate="{ item }">{{ fmtPHP(item.costIncurredToDate) }}</template>
          <template #item.movLink="{ item }">
            <CiMovLinkBtn :url="item.movLink" />
          </template>
          <template #item.actions="{ item }">
            <v-btn v-if="!readOnly" icon="mdi-pencil" size="x-small" variant="text" color="primary" @click="openEdit(item)" />
            <v-btn v-if="effectiveCanDelete" icon="mdi-delete" size="x-small" variant="text" color="error" @click="confirmRemove(item)" />
          </template>
        </v-data-table>
      </template>

    </template>

    <!-- ══════ Add/Edit Dialog ══════ -->
    <v-dialog v-model="dialogOpen" max-width="860" scrollable persistent>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center ga-2 bg-grey-lighten-4 py-3">
          <v-icon icon="mdi-chart-timeline-variant" color="info" />
          <span class="text-h6 font-weight-medium">
            {{ editing ? 'Edit Progress Report' : 'Add Progress Report' }}
          </span>
          <v-spacer />
          <v-btn icon="mdi-close" size="small" variant="text" @click="dialogOpen = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-row dense>
            <v-col cols="12" sm="3">
              <v-select
                v-model="form.report_type"
                label="Report Type *"
                :items="[
                  { title: 'Monthly (MPR)', value: 'MONTHLY' },
                  { title: 'Weekly (WAR)', value: 'WEEKLY' },
                  { title: 'Quarterly', value: 'QUARTERLY' },
                  { title: 'Ad-hoc', value: 'AD_HOC' },
                ]"
                density="compact" variant="outlined" hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="3">
              <v-menu v-model="reportDateMenu" :close-on-content-click="false">
                <template #activator="{ props: mp }">
                  <v-text-field
                    v-bind="mp" :model-value="form.report_date" label="Report Date *"
                    prepend-inner-icon="mdi-calendar" readonly clearable
                    density="compact" variant="outlined" hide-details="auto"
                    @click:clear="form.report_date = ''"
                  />
                </template>
                <v-date-picker
                  :model-value="isoToDate(form.report_date)"
                  min="1900-01-01" max="2100-12-31" hide-actions
                  @update:model-value="(v: any) => { form.report_date = toIsoDate(v); reportDateMenu = false }"
                />
              </v-menu>
            </v-col>
            <v-col cols="12" sm="3">
              <v-text-field
                v-model="form.report_number"
                label="Report Number"
                placeholder="e.g., MPR-2026-04"
                density="compact" variant="outlined" hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="3">
              <v-text-field
                v-model="form.mov_link"
                label="MOV Link"
                prepend-inner-icon="mdi-link-variant"
                density="compact" variant="outlined" hide-details="auto"
              />
            </v-col>

            <v-col cols="12"><v-divider class="my-1" /></v-col>
            <v-col cols="12"><p class="text-caption text-grey font-weight-medium text-uppercase">Physical Status</p></v-col>

            <v-col cols="12" sm="4">
              <v-text-field
                v-model.number="form.percentage_completion"
                label="Percentage Completion (%)"
                type="number" min="0" max="100" suffix="%"
                density="compact" variant="outlined" hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model.number="form.planned_accomplishment"
                label="Planned Accomplishment (%)"
                type="number" min="0" max="100" suffix="%"
                density="compact" variant="outlined" hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model.number="form.slippage"
                label="Slippage (%)"
                type="number" suffix="%"
                hint="Negative = behind schedule"
                density="compact" variant="outlined" hide-details="auto"
              />
            </v-col>

            <v-col cols="12"><v-divider class="my-1" /></v-col>
            <v-col cols="12"><p class="text-caption text-grey font-weight-medium text-uppercase">Financial Status</p></v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.cost_incurred_this_period"
                label="Cost Incurred This Period (PHP)"
                type="number" min="0" prefix="₱"
                density="compact" variant="outlined" hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.cost_incurred_to_date"
                label="Cost Incurred to Date (PHP)"
                type="number" min="0" prefix="₱"
                density="compact" variant="outlined" hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.calendar_days_elapsed"
                label="Calendar Days Elapsed"
                type="number" min="0"
                density="compact" variant="outlined" hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.percent_time_elapsed"
                label="% Time Elapsed"
                type="number" min="0" max="100" suffix="%"
                density="compact" variant="outlined" hide-details="auto"
              />
            </v-col>

            <v-col cols="12">
              <v-divider class="my-2" />
              <div class="d-flex align-center ga-2 mb-3">
                <v-icon size="small" color="info">mdi-text-box-multiple-outline</v-icon>
                <span class="text-body-2 font-weight-bold text-grey-darken-2 text-uppercase tracking-wide">Narrative Details</span>
              </div>
            </v-col>

            <!-- Remarks -->
            <v-col cols="12">
              <v-sheet rounded="lg" border class="pa-3">
                <div class="d-flex align-center ga-2 mb-2">
                  <v-icon size="small" color="info">mdi-comment-text-outline</v-icon>
                  <span class="text-body-2 font-weight-semibold">Remarks</span>
                </div>
                <CiBulletListInput v-model="form.remarks_items" color="info" />
              </v-sheet>
            </v-col>

            <!-- Issues / Risks Encountered -->
            <v-col cols="12">
              <v-sheet rounded="lg" border class="pa-3">
                <div class="d-flex align-center ga-2 mb-2">
                  <v-icon size="small" color="warning">mdi-alert-circle-outline</v-icon>
                  <span class="text-body-2 font-weight-semibold">Issues / Risks Encountered</span>
                </div>
                <CiBulletListInput v-model="form.issues_items" color="warning" />
              </v-sheet>
            </v-col>

            <!-- Mitigation Actions -->
            <v-col cols="12">
              <v-sheet rounded="lg" border class="pa-3">
                <div class="d-flex align-center ga-2 mb-2">
                  <v-icon size="small" color="success">mdi-shield-check-outline</v-icon>
                  <span class="text-body-2 font-weight-semibold">Mitigation Actions</span>
                </div>
                <CiBulletListInput v-model="form.mitigation_items" color="success" />
              </v-sheet>
            </v-col>

            <!-- General Narrative Notes -->
            <v-col cols="12">
              <v-sheet rounded="lg" border class="pa-3">
                <div class="d-flex align-center ga-2 mb-2">
                  <v-icon size="small" color="primary">mdi-text-long</v-icon>
                  <span class="text-body-2 font-weight-semibold">General Narrative Notes</span>
                </div>
                <CiBulletListInput v-model="form.narrative_items" color="primary" />
              </v-sheet>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn variant="text" :disabled="submitting" @click="dialogOpen = false">Cancel</v-btn>
          <v-btn color="info" variant="elevated" :loading="submitting" @click="save">
            {{ editing ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>
