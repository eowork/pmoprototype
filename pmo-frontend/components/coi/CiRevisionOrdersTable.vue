<script setup lang="ts">
/**
 * Phase NF-B (2026-05-21): Revision Orders paginated table with inline
 * add/edit dialog. Replaces the single-record revision-order fields previously
 * on the project entity.
 * Phase OH (2026-05-21): Added List view mode alongside Table view.
 */
import { useCoiRevisionOrders, type RevisionOrder } from '~/composables/useCoiRevisionOrders'

const props = withDefaults(defineProps<{
  projectId: string
  readOnly?: boolean
  canDelete?: boolean  // PS-B: project-level delete permission gate
  canCreate?: boolean  // PS-B: project-level create permission gate
}>(), { readOnly: false, canDelete: undefined, canCreate: undefined })

// Effective guards: respect readOnly first, then permission props (undefined = no restriction)
const effectiveCanDelete = computed(() => !props.readOnly && props.canDelete !== false)
const effectiveCanCreate = computed(() => !props.readOnly && props.canCreate !== false)

const projectIdRef = computed(() => props.projectId)
const { items, loading, create, update, remove } = useCoiRevisionOrders(projectIdRef)
const toast = useToast ? useToast() : { success: console.log, error: console.error }

// ── View mode ────────────────────────────────────────────────────────────────
const viewMode = ref<'list' | 'table'>('list')

// ── Dialog state ────────────────────────────────────────────────────────────
const dialogOpen = ref(false)
const editing = ref<RevisionOrder | null>(null)
const submitting = ref(false)

const blank = () => ({
  revision_type: 'VOR',
  revision_date: '',
  new_start_date: '',
  new_completion_date: '',
  new_duration: '',
  cost_adjustment: null as number | null,
  justification: '',
  approval_status: 'DRAFT',
  mov_link: '',
})
const form = ref(blank())

const revDateMenu = ref(false)
const newStartMenu = ref(false)
const newCompleteMenu = ref(false)

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
function openEdit(r: RevisionOrder) {
  editing.value = r
  form.value = {
    revision_type: r.revisionType,
    revision_date: r.revisionDate,
    new_start_date: r.newStartDate?.slice(0, 10) || '',
    new_completion_date: r.newCompletionDate?.slice(0, 10) || '',
    new_duration: r.newDuration || '',
    cost_adjustment: r.costAdjustment != null ? Number(r.costAdjustment) : null,
    justification: r.justification || '',
    approval_status: r.approvalStatus || 'DRAFT',
    mov_link: r.movLink || '',
  }
  dialogOpen.value = true
}

async function save() {
  if (!form.value.revision_type || !form.value.revision_date) {
    toast.error('Variation Type and Variation Date are required')
    return
  }
  submitting.value = true
  try {
    const payload = {
      revision_type: form.value.revision_type,
      revision_date: form.value.revision_date,
      new_start_date: form.value.new_start_date || undefined,
      new_completion_date: form.value.new_completion_date || undefined,
      new_duration: form.value.new_duration || undefined,
      cost_adjustment: form.value.cost_adjustment ?? undefined,
      justification: form.value.justification || undefined,
      approval_status: form.value.approval_status || undefined,
      mov_link: form.value.mov_link || undefined,
    }
    if (editing.value) {
      await update(editing.value.id, payload)
      toast.success('Variation order updated')
    } else {
      await create(payload)
      toast.success('Variation order created')
    }
    dialogOpen.value = false
  } catch (err: any) {
    toast.error(err?.message || 'Failed to save variation order')
  } finally {
    submitting.value = false
  }
}

async function confirmRemove(r: RevisionOrder) {
  if (!confirm(`Delete Variation #${r.revisionNumber} (${r.revisionType})?`)) return
  try {
    await remove(r.id)
    toast.success('Variation order deleted')
  } catch (err: any) {
    toast.error(err?.message || 'Failed to delete')
  }
}

// ── Table view pagination ────────────────────────────────────────────────────
const page = ref(1)
const perPage = 8
const totalPages = computed(() => Math.max(1, Math.ceil(items.value.length / perPage)))
const pagedItems = computed(() => items.value.slice((page.value - 1) * perPage, page.value * perPage))

// ── List view pagination ─────────────────────────────────────────────────────
const listPage = ref(1)
const listPerPage = 5
const listTotalPages = computed(() => Math.max(1, Math.ceil(items.value.length / listPerPage)))
const pagedListItems = computed(() =>
  items.value.slice((listPage.value - 1) * listPerPage, listPage.value * listPerPage)
)

// Reset list page when items change
watch(items, () => { listPage.value = 1; page.value = 1 })

const headers = [
  { title: 'VO #', key: 'revisionNumber', width: 70 },
  { title: 'Type', key: 'revisionType', width: 80 },
  { title: 'Date', key: 'revisionDate', width: 110 },
  { title: 'New Start', key: 'newStartDate', width: 110 },
  { title: 'New Completion', key: 'newCompletionDate', width: 130 },
  { title: 'Duration', key: 'newDuration', width: 110 },
  { title: 'Cost Adj.', key: 'costAdjustment', width: 110, align: 'end' as const },
  { title: 'Status', key: 'approvalStatus', width: 110 },
  { title: 'MOV', key: 'movLink', width: 60, align: 'center' as const },
  { title: '', key: 'actions', width: 90, align: 'end' as const, sortable: false },
]

function statusColor(s: string | null | undefined): string {
  if (s === 'APPROVED') return 'success'
  if (s === 'REJECTED') return 'error'
  return 'warning'
}

function typeColor(t: string | null | undefined): string {
  if (t === 'VOR') return 'blue'
  if (t === 'CTE') return 'orange'
  if (t === 'WSO') return 'green'
  if (t === 'WRO') return 'purple'
  return 'grey'
}

// ── List card expand state ───────────────────────────────────────────────────
const expandedCards = ref<Set<string>>(new Set())
function toggleExpand(id: string) {
  if (expandedCards.value.has(id)) expandedCards.value.delete(id)
  else expandedCards.value.add(id)
  expandedCards.value = new Set(expandedCards.value)
}
</script>

<template>
  <v-card elevation="2" rounded="lg">
    <v-card-title class="d-flex align-center justify-space-between py-2 px-4 bg-grey-lighten-4">
      <div class="d-flex align-center ga-2">
        <v-icon size="small" icon="mdi-file-document-edit-outline" color="warning" />
        <span class="text-subtitle-1 font-weight-medium">Variation Orders</span>
        <v-chip size="x-small" variant="tonal" color="warning">{{ items.length }}</v-chip>
      </div>
      <div class="d-flex align-center ga-2">
        <!-- OV (2026-05-22): Timeline-standard toggle — density=compact, divided, text labels -->
        <v-btn-toggle
          v-model="viewMode"
          density="compact"
          variant="outlined"
          divided
          :mandatory="true"
          color="warning"
        >
          <v-btn value="list" size="small" prepend-icon="mdi-format-list-bulleted">List</v-btn>
          <v-btn value="table" size="small" prepend-icon="mdi-table">Table</v-btn>
        </v-btn-toggle>
        <v-btn
          v-if="!readOnly"
          size="small"
          color="warning"
          variant="tonal"
          prepend-icon="mdi-plus"
          @click="openCreate"
        >
          Add Variation Order
        </v-btn>
      </div>
    </v-card-title>
    <v-card-subtitle class="pt-2 pb-1 text-body-2 text-grey-darken-1" style="white-space: normal;">
      Audit-tracked log of Variation Orders (VOR), Contract Time Extensions (CTE), and similar revisions. Each entry requires a Means of Verification (MOV).
    </v-card-subtitle>
    <v-divider />

    <!-- ══════ TABLE VIEW ══════ -->
    <template v-if="viewMode === 'table'">
      <v-data-table
        :items="pagedItems"
        :headers="headers"
        :loading="loading"
        density="comfortable"
        class="elevation-0"
        :items-per-page="perPage"
        hide-default-footer
      >
        <template #item.revisionDate="{ item }">{{ item.revisionDate || '—' }}</template>
        <template #item.newStartDate="{ item }">{{ (item.newStartDate || '').slice(0, 10) || '—' }}</template>
        <template #item.newCompletionDate="{ item }">{{ (item.newCompletionDate || '').slice(0, 10) || '—' }}</template>
        <template #item.newDuration="{ item }">{{ item.newDuration || '—' }}</template>
        <template #item.costAdjustment="{ item }">
          {{ item.costAdjustment ? `₱${Number(item.costAdjustment).toLocaleString('en-PH')}` : '—' }}
        </template>
        <template #item.approvalStatus="{ item }">
          <v-chip size="x-small" :color="statusColor(item.approvalStatus)" variant="tonal">
            {{ item.approvalStatus || 'DRAFT' }}
          </v-chip>
        </template>
        <template #item.movLink="{ item }">
          <CiMovLinkBtn :url="item.movLink" />
        </template>
        <template #item.actions="{ item }">
          <v-btn v-if="!readOnly" icon="mdi-pencil" size="x-small" variant="text" color="primary" @click="openEdit(item)" />
          <v-btn v-if="effectiveCanDelete" icon="mdi-delete" size="x-small" variant="text" color="error" @click="confirmRemove(item)" />
        </template>
        <template #no-data>
          <div class="text-center text-grey py-6">
            <v-icon size="32" color="grey-lighten-1">mdi-file-document-outline</v-icon>
            <div class="text-body-2 mt-2">No variation orders yet.</div>
          </div>
        </template>
      </v-data-table>
      <v-divider v-if="items.length > perPage" />
      <div v-if="items.length > perPage" class="d-flex justify-center py-2">
        <v-pagination v-model="page" :length="totalPages" :total-visible="5" density="compact" />
      </div>
    </template>

    <!-- ══════ LIST VIEW ══════ -->
    <template v-else-if="viewMode === 'list'">
      <div v-if="loading" class="d-flex justify-center align-center py-8">
        <v-progress-circular indeterminate color="warning" size="28" />
      </div>
      <div v-else-if="items.length === 0" class="text-center text-grey py-8">
        <v-icon size="40" color="grey-lighten-1">mdi-file-document-outline</v-icon>
        <div class="text-body-2 mt-2">No variation orders yet.</div>
      </div>
      <div v-else class="pa-3 d-flex flex-column ga-3">
        <!-- OR-A (2026-05-22): 3-column sm layout — left identity, center stat grid + expand, right actions -->
        <v-card
          v-for="r in pagedListItems"
          :key="r.id"
          elevation="1"
          border
          rounded="lg"
          class="overflow-hidden"
          style="border-left: 3px solid rgba(var(--v-theme-warning), 0.7)"
        >
          <v-row no-gutters align="stretch">
            <!-- LEFT: Identity -->
            <v-col cols="12" sm="3" class="pa-3 d-flex flex-column ga-1" style="border-right: 1px solid rgba(0,0,0,0.08)">
              <div class="text-body-2 text-grey-darken-1 font-weight-medium">VO #{{ r.revisionNumber }}</div>
              <v-chip size="small" :color="typeColor(r.revisionType)" variant="tonal" class="align-self-start">{{ r.revisionType }}</v-chip>
              <v-chip size="small" :color="statusColor(r.approvalStatus)" variant="tonal" class="align-self-start">{{ r.approvalStatus || 'DRAFT' }}</v-chip>
              <span class="text-body-2 text-grey mt-1">{{ r.revisionDate || '—' }}</span>
            </v-col>
            <!-- CENTER: Stat grid -->
            <v-col cols="12" sm="7" class="pa-3" style="border-right: 1px solid rgba(0,0,0,0.08)">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px;">
                <div>
                  <div class="text-body-2 text-grey-darken-1">New Start</div>
                  <div class="text-body-1 font-weight-medium">{{ (r.newStartDate || '').slice(0, 10) || '—' }}</div>
                </div>
                <div>
                  <div class="text-body-2 text-grey-darken-1">New Completion</div>
                  <div class="text-body-1 font-weight-medium">{{ (r.newCompletionDate || '').slice(0, 10) || '—' }}</div>
                </div>
                <div>
                  <div class="text-body-2 text-grey-darken-1">Duration</div>
                  <div class="text-body-1 font-weight-medium">{{ r.newDuration || '—' }}</div>
                </div>
                <div>
                  <div class="text-body-2 text-grey-darken-1">Cost Adjustment</div>
                  <div class="text-body-1 font-weight-medium">{{ r.costAdjustment != null ? `₱${Number(r.costAdjustment).toLocaleString('en-PH')}` : '—' }}</div>
                </div>
              </div>
              <!-- Expandable: justification -->
              <v-expand-transition>
                <div v-if="expandedCards.has(r.id)" class="mt-3">
                  <v-divider class="mb-2" />
                  <div class="text-body-2 font-weight-medium text-grey-darken-1 mb-1">Justification</div>
                  <div class="text-body-1">{{ r.justification || '(no justification provided)' }}</div>
                </div>
              </v-expand-transition>
            </v-col>
            <!-- RIGHT: Actions -->
            <v-col cols="12" sm="2" class="d-flex flex-row flex-wrap align-center justify-center ga-1 pa-2 bg-grey-lighten-5">
              <CiMovLinkBtn :url="r.movLink" />
              <v-btn
                icon
                size="x-small"
                variant="text"
                :color="expandedCards.has(r.id) ? 'warning' : 'grey'"
                :title="expandedCards.has(r.id) ? 'Collapse' : 'Expand'"
                @click="toggleExpand(r.id)"
              >
                <v-icon size="16">{{ expandedCards.has(r.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </v-btn>
              <v-menu v-if="!readOnly || effectiveCanDelete" location="bottom end">
                <template #activator="{ props: mp }">
                  <v-btn v-bind="mp" icon="mdi-dots-vertical" size="x-small" variant="text" color="grey-darken-1" />
                </template>
                <v-list density="compact" min-width="140">
                  <v-list-item v-if="!readOnly" prepend-icon="mdi-pencil" title="Edit" @click="openEdit(r)" />
                  <v-list-item v-if="effectiveCanDelete" prepend-icon="mdi-delete" title="Delete" base-color="error" @click="confirmRemove(r)" />
                </v-list>
              </v-menu>
            </v-col>
          </v-row>
        </v-card>
      </div>
      <!-- List pagination -->
      <div v-if="items.length > listPerPage" class="d-flex justify-center py-2">
        <v-pagination v-model="listPage" :length="listTotalPages" :total-visible="5" density="compact" />
      </div>
    </template>

    <!-- ══════ Add/Edit Dialog ══════ -->
    <v-dialog v-model="dialogOpen" max-width="780" scrollable persistent>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center ga-2 bg-grey-lighten-4 py-3">
          <v-icon icon="mdi-file-document-edit-outline" color="warning" />
          <span class="text-h6 font-weight-medium">
            {{ editing ? `Edit Variation #${editing.revisionNumber}` : 'Add Variation Order' }}
          </span>
          <v-spacer />
          <v-btn icon="mdi-close" size="small" variant="text" @click="dialogOpen = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-row dense>
            <v-col cols="12" sm="4">
              <v-select
                v-model="form.revision_type"
                label="Variation Type *"
                :items="[
                  { title: 'Variation Order (VOR)', value: 'VOR' },
                  { title: 'Contract Time Extension (CTE)', value: 'CTE' },
                  { title: 'Work Suspension Order (WSO)', value: 'WSO' },
                  { title: 'Work Resumption Order (WRO)', value: 'WRO' },
                  { title: 'Other', value: 'OTHER' },
                ]"
                density="compact" variant="outlined" hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-menu v-model="revDateMenu" :close-on-content-click="false">
                <template #activator="{ props: mp }">
                  <v-text-field
                    v-bind="mp" :model-value="form.revision_date" label="Variation Date *"
                    prepend-inner-icon="mdi-calendar" readonly clearable
                    density="compact" variant="outlined" hide-details="auto"
                    @click:clear="form.revision_date = ''"
                  />
                </template>
                <v-date-picker
                  :model-value="isoToDate(form.revision_date)"
                  min="1900-01-01" max="2100-12-31" hide-actions
                  @update:model-value="(v: any) => { form.revision_date = toIsoDate(v); revDateMenu = false }"
                />
              </v-menu>
            </v-col>
            <v-col cols="12" sm="4">
              <v-select
                v-model="form.approval_status"
                label="Approval Status"
                :items="[
                  { title: 'Draft', value: 'DRAFT' },
                  { title: 'Approved', value: 'APPROVED' },
                  { title: 'Rejected', value: 'REJECTED' },
                ]"
                density="compact" variant="outlined" hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-menu v-model="newStartMenu" :close-on-content-click="false">
                <template #activator="{ props: mp }">
                  <v-text-field
                    v-bind="mp" :model-value="form.new_start_date" label="New Start Date"
                    prepend-inner-icon="mdi-calendar" readonly clearable
                    density="compact" variant="outlined" hide-details="auto"
                    @click:clear="form.new_start_date = ''"
                  />
                </template>
                <v-date-picker
                  :model-value="isoToDate(form.new_start_date)"
                  min="1900-01-01" max="2100-12-31" hide-actions
                  @update:model-value="(v: any) => { form.new_start_date = toIsoDate(v); newStartMenu = false }"
                />
              </v-menu>
            </v-col>
            <v-col cols="12" sm="4">
              <v-menu v-model="newCompleteMenu" :close-on-content-click="false">
                <template #activator="{ props: mp }">
                  <v-text-field
                    v-bind="mp" :model-value="form.new_completion_date" label="New Completion Date"
                    prepend-inner-icon="mdi-calendar-check" readonly clearable
                    density="compact" variant="outlined" hide-details="auto"
                    @click:clear="form.new_completion_date = ''"
                  />
                </template>
                <v-date-picker
                  :model-value="isoToDate(form.new_completion_date)"
                  min="1900-01-01" max="2100-12-31" hide-actions
                  @update:model-value="(v: any) => { form.new_completion_date = toIsoDate(v); newCompleteMenu = false }"
                />
              </v-menu>
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.new_duration"
                label="New Duration"
                placeholder="e.g., 425 calendar days"
                density="compact" variant="outlined" hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.cost_adjustment"
                label="Cost Adjustment (PHP)"
                type="number" prefix="₱"
                density="compact" variant="outlined" hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.mov_link"
                label="MOV Link"
                prepend-inner-icon="mdi-link-variant"
                placeholder="https://drive.google.com/..."
                density="compact" variant="outlined" hide-details="auto"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="form.justification"
                label="Justification"
                rows="2" auto-grow
                density="compact" variant="outlined" hide-details="auto"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn variant="text" :disabled="submitting" @click="dialogOpen = false">Cancel</v-btn>
          <v-btn color="warning" variant="elevated" :loading="submitting" @click="save">
            {{ editing ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>
