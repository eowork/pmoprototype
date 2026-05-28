<script setup lang="ts">
// KB-E: CPES Document Compliance Checklist
// KV-B: adds documents prop + linked-file download chip + document picker in edit dialog
// KV-C: accordion shows submission count + file count + missing count + latest date
// KV-D3: per-group remarks field (admin-editable, emits remarksUpdate event)

interface DocumentItem {
  id: string
  fileName: string
  filePath: string
  documentType?: string
  mimeType?: string
}

interface Props {
  projectId: string
  canEdit: boolean
  documents?: DocumentItem[]
  groupRemarks?: Record<string, GroupRemarkEntry[]>
  canEditRemarks?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  documents: () => [],
  groupRemarks: () => ({}),
  canEditRemarks: false,
})

const emit = defineEmits<{
  remarksUpdate: [groupCode: string, remarks: GroupRemarkEntry[]]
  navigate: [payload: { groupCode?: string; typeCode?: string }]
}>()

const api = useApi()
const toast = useToast()

interface DocumentType {
  id: string
  groupCode: string
  groupLabel: string
  typeCode: string
  typeLabel: string
  isRequired: boolean
  sortOrder: number
  templateUrl?: string | null
}

interface ChecklistItem {
  id: string
  projectId: string
  documentTypeId: string
  submissionStatus: 'NOT_SUBMITTED' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
  submittedBy?: string | null
  submittedAt?: string | null
  reviewedBy?: string | null
  reviewedAt?: string | null
  reviewNotes?: string | null
  currentVersion: number
  expiryDate?: string | null
  linkedDocumentId?: string | null
  remarks?: string | null
  documentType?: DocumentType
}

interface GroupRemarkEntry {
  text: string
  author?: string | null
  timestamp: string
}

const items = ref<ChecklistItem[]>([])
const loading = ref(false)
const updating = ref<Record<string, boolean>>({})
const groupRemarkDrafts = ref<Record<string, string>>({})
const localGroupRemarks = ref<Record<string, GroupRemarkEntry[]>>({})

const dialog = ref(false)
const editing = ref<ChecklistItem | null>(null)
const submitting = ref(false)
const form = ref({
  submission_status: 'NOT_SUBMITTED' as ChecklistItem['submissionStatus'],
  review_notes: '',
  expiry_date: '',
  linked_document_id: '',
})

// HHH-H: List-based per-item remarks
const authStore = useAuthStore()
const draftRemark = ref<Record<string, string>>({})
const savingRemark = reactive<Record<string, boolean>>({})

interface RemarkEntry { text: string; author?: string | null; timestamp: string }

function parseItemRemarks(item: ChecklistItem): RemarkEntry[] {
  if (!item.remarks) return []
  try {
    const parsed = JSON.parse(item.remarks)
    if (Array.isArray(parsed)) return parsed as RemarkEntry[]
    return [{ text: String(item.remarks), timestamp: '' }]
  } catch {
    return [{ text: String(item.remarks), timestamp: '' }]
  }
}

function formatRemarkDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function addItemRemark(item: ChecklistItem) {
  const text = (draftRemark.value[item.id] ?? '').trim()
  if (!text || !props.canEditRemarks) return
  savingRemark[item.id] = true
  try {
    const existing = parseItemRemarks(item)
    const next: RemarkEntry[] = [...existing, {
      text,
      author: authStore.userFullName || null,
      timestamp: new Date().toISOString(),
    }]
    const serialized = JSON.stringify(next)
    await api.patch(
      `/api/construction-projects/${props.projectId}/document-checklist/${item.id}`,
      { remarks: serialized },
    )
    item.remarks = serialized
    draftRemark.value[item.id] = ''
  } catch (err: unknown) {
    toast.error((err as { message?: string })?.message || 'Failed to save remark')
  } finally {
    savingRemark[item.id] = false
  }
}

// ZU-4: Submission history drawer
const historyDrawer = ref(false)
const historyItem = ref<ChecklistItem | null>(null)
const historyEntries = ref<any[]>([])
const loadingHistory = ref(false)

async function openHistory(item: ChecklistItem) {
  historyItem.value = item
  historyDrawer.value = true
  loadingHistory.value = true
  historyEntries.value = []
  try {
    const res = await api.get<any>(
      `/api/construction-projects/${props.projectId}/document-checklist/${item.id}/submissions`,
    )
    historyEntries.value = Array.isArray(res) ? res : (res?.data ?? [])
  } catch (err: unknown) {
    toast.error('Failed to load submission history')
  } finally {
    loadingHistory.value = false
  }
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return date.toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const statusOptions = [
  { title: 'Not Submitted', value: 'NOT_SUBMITTED', color: 'grey' },
  { title: 'Submitted', value: 'SUBMITTED', color: 'info' },
  { title: 'Under Review', value: 'UNDER_REVIEW', color: 'warning' },
  { title: 'Approved', value: 'APPROVED', color: 'success' },
  { title: 'Rejected', value: 'REJECTED', color: 'error' },
]

function statusColor(s: string): string {
  return statusOptions.find(o => o.value === s)?.color || 'grey'
}

function statusLabel(s: string): string {
  return statusOptions.find(o => o.value === s)?.title || s
}

// KV-B: resolve linked document from parent's documents prop
function linkedDoc(item: ChecklistItem): DocumentItem | null {
  if (!item.linkedDocumentId || !props.documents.length) return null
  return props.documents.find(d => d.id === item.linkedDocumentId) ?? null
}

// KV-C: group items with per-group metadata
const groupedItems = computed(() => {
  const groups: Record<string, { groupCode: string; groupLabel: string; items: ChecklistItem[] }> = {}
  for (const item of items.value) {
    const code = item.documentType?.groupCode || 'OTHER'
    const label = code === 'ECO_FORMS' ? 'Other Forms' : (item.documentType?.groupLabel || 'Other')
    if (!groups[code]) groups[code] = { groupCode: code, groupLabel: label, items: [] }
    groups[code].items.push(item)
  }
  return Object.values(groups).sort((a, b) => a.groupCode.localeCompare(b.groupCode)).map(g => ({
    ...g,
    submittedCount: g.items.filter(i => i.submissionStatus !== 'NOT_SUBMITTED').length,
    linkedFileCount: g.items.filter(i => !!i.linkedDocumentId).length,
    missingCount: g.items.filter(i => i.submissionStatus === 'NOT_SUBMITTED').length,
    latestSubmittedAt: g.items
      .filter(i => i.submittedAt)
      .map(i => i.submittedAt!)
      .sort()
      .at(-1) ?? null,
  }))
})

const summary = computed(() => {
  const total = items.value.length
  const submitted = items.value.filter(i => i.submissionStatus !== 'NOT_SUBMITTED').length
  const approved = items.value.filter(i => i.submissionStatus === 'APPROVED').length
  const required = items.value.filter(i => i.documentType?.isRequired).length
  const requiredApproved = items.value.filter(
    i => i.documentType?.isRequired && i.submissionStatus === 'APPROVED',
  ).length
  return { total, submitted, approved, required, requiredApproved }
})

async function fetchChecklist() {
  if (!props.projectId) return
  loading.value = true
  try {
    const res = await api.get<any>(
      `/api/construction-projects/${props.projectId}/document-checklist`,
    )
    const list: any[] = Array.isArray(res) ? res : (res?.data || [])
    items.value = list as ChecklistItem[]
  } catch (err: unknown) {
    console.error('[CiDocumentChecklist] fetch failed:', err)
  } finally {
    loading.value = false
  }
}

function openEdit(item: ChecklistItem) {
  editing.value = item
  form.value = {
    submission_status: item.submissionStatus,
    review_notes: item.reviewNotes || '',
    expiry_date: item.expiryDate ? String(item.expiryDate).slice(0, 10) : '',
    linked_document_id: item.linkedDocumentId || '',
  }
  dialog.value = true
}

async function save() {
  if (!editing.value) return
  submitting.value = true
  try {
    const payload: Record<string, unknown> = {
      submission_status: form.value.submission_status,
      review_notes: form.value.review_notes || undefined,
      expiry_date: form.value.expiry_date || undefined,
      linked_document_id: form.value.linked_document_id || undefined,
    }
    await api.patch(
      `/api/construction-projects/${props.projectId}/document-checklist/${editing.value.id}`,
      payload,
    )
    toast.success('Checklist item updated')
    dialog.value = false
    await fetchChecklist()
  } catch (err: unknown) {
    toast.error((err as { message?: string })?.message || 'Update failed')
  } finally {
    submitting.value = false
  }
}

async function quickStatus(item: ChecklistItem, newStatus: ChecklistItem['submissionStatus']) {
  if (!props.canEdit) return
  updating.value[item.id] = true
  try {
    await api.patch(
      `/api/construction-projects/${props.projectId}/document-checklist/${item.id}`,
      { submission_status: newStatus },
    )
    await fetchChecklist()
  } catch (err: unknown) {
    toast.error((err as { message?: string })?.message || 'Update failed')
  } finally {
    updating.value[item.id] = false
  }
}

// KV-D3: emit group remarks on blur so parent can persist via PATCH
function onRemarksBlur(groupCode: string, event: Event) {
  const value = (event.target as HTMLTextAreaElement).value.trim()
  groupRemarkDrafts.value[groupCode] = value
}

function onRemarkDraftInput(groupCode: string, value: string) {
  groupRemarkDrafts.value[groupCode] = value
}

function addGroupRemark(groupCode: string) {
  if (!props.canEditRemarks) return
  const text = (groupRemarkDrafts.value[groupCode] ?? '').trim()
  if (!text) return
  const next = [...(localGroupRemarks.value[groupCode] ?? []), { text, timestamp: new Date().toISOString() }]
  localGroupRemarks.value = { ...localGroupRemarks.value, [groupCode]: next }
  groupRemarkDrafts.value[groupCode] = ''
  emit('remarksUpdate', groupCode, next)
}

function normalizeGroupRemarks(input: unknown): GroupRemarkEntry[] {
  if (!Array.isArray(input)) return []
  return input
    .map((entry: any) => ({
      text: String(entry?.text ?? '').trim(),
      author: entry?.author ? String(entry.author) : null,
      timestamp: String(entry?.timestamp ?? ''),
    }))
    .filter((entry) => entry.text.length > 0)
    .sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)))
}

function remarksForGroup(groupCode: string): GroupRemarkEntry[] {
  return normalizeGroupRemarks(localGroupRemarks.value[groupCode] ?? [])
}

// ZO: Per-item inline remarks — auto-save on blur
async function onItemRemarksBlur(item: ChecklistItem, event: Event) {
  if (!props.canEditRemarks) return
  const value = (event.target as HTMLTextAreaElement).value
  if (value === (item.remarks ?? '')) return
  try {
    await api.patch(
      `/api/construction-projects/${props.projectId}/document-checklist/${item.id}`,
      { remarks: value },
    )
    item.remarks = value
  } catch (err: unknown) {
    toast.error((err as { message?: string })?.message || 'Failed to save remarks')
  }
}

watch(
  () => props.groupRemarks,
  (value) => {
    const next: Record<string, GroupRemarkEntry[]> = {}
    Object.entries(value ?? {}).forEach(([groupCode, entries]) => {
      next[groupCode] = normalizeGroupRemarks(entries)
    })
    localGroupRemarks.value = next
  },
  { immediate: true, deep: true },
)

watch(() => props.projectId, () => { if (props.projectId) fetchChecklist() })
onMounted(() => { if (props.projectId) fetchChecklist() })

defineExpose({ refresh: fetchChecklist })
</script>

<template>
  <div>
    <!-- Compliance summary card -->
    <v-card class="mb-4">
      <v-card-title class="d-flex align-center ga-2">
        <v-icon icon="mdi-clipboard-check-outline" />
        <span>Document Compliance Checklist</span>
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-row>
          <v-col cols="6" sm="3">
            <p class="text-caption text-grey mb-1">Total Items</p>
            <p class="text-subtitle-2 font-weight-bold">{{ summary.total }}</p>
          </v-col>
          <v-col cols="6" sm="3">
            <p class="text-caption text-grey mb-1">Submitted</p>
            <p class="text-subtitle-2 font-weight-bold">
              {{ summary.submitted }} / {{ summary.total }}
            </p>
          </v-col>
          <v-col cols="6" sm="3">
            <p class="text-caption text-grey mb-1">Approved</p>
            <p class="text-subtitle-2 font-weight-bold text-success">
              {{ summary.approved }}
            </p>
          </v-col>
          <v-col cols="6" sm="3">
            <p class="text-caption text-grey mb-1">Required Compliance</p>
            <p class="text-subtitle-2 font-weight-bold">
              {{ summary.requiredApproved }} / {{ summary.required }}
            </p>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <div v-if="loading" class="text-center pa-4 text-grey">
      <v-progress-circular indeterminate size="24" />
      <div class="mt-2 text-caption">Loading checklist…</div>
    </div>

    <div v-else-if="items.length === 0" class="text-center pa-6 text-grey">
      <v-icon size="48" color="grey-lighten-1">mdi-clipboard-text-outline</v-icon>
      <div class="mt-2">No checklist initialized yet.</div>
    </div>

    <!-- BBB-D: Collapsible accordion — header shows group progress, items expand on click -->
    <v-expansion-panels v-else variant="accordion" multiple class="mb-4">
      <v-expansion-panel v-for="g in groupedItems" :key="g.groupCode">
        <v-expansion-panel-title>
          <div class="d-flex align-center ga-2 w-100">
            <v-icon icon="mdi-folder-outline" size="small" />
            <span class="text-subtitle-2 font-weight-medium text-truncate">{{ g.groupLabel }}</span>
            <v-spacer />
            <v-chip
              size="x-small"
              variant="tonal"
              :color="g.submittedCount === g.items.length ? 'success' : (g.missingCount > 0 ? 'warning' : 'info')"
              class="mr-2"
            >
              {{ g.submittedCount }}/{{ g.items.length }}
            </v-chip>
            <v-progress-linear
              :model-value="g.items.length ? (g.submittedCount / g.items.length) * 100 : 0"
              :color="g.submittedCount === g.items.length ? 'success' : 'primary'"
              height="4"
              rounded
              style="max-width:80px"
            />
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
            <v-list density="compact" class="pa-0">
              <v-list-item
                v-for="item in g.items"
                :key="item.id"
                lines="two"
                class="px-0 py-1"
              >
                <template #prepend>
                  <v-icon
                    :icon="item.submissionStatus === 'NOT_SUBMITTED' ? 'mdi-circle-outline' : 'mdi-check-circle'"
                    :color="statusColor(item.submissionStatus)"
                    size="small"
                    class="mr-1"
                  />
                </template>
                <v-list-item-title class="text-body-2 font-weight-medium">
                  {{ item.documentType?.typeLabel || 'Unknown type' }}
                  <v-icon
                    v-if="item.documentType?.isRequired"
                    icon="mdi-asterisk"
                    size="x-small"
                    color="error"
                    class="ml-1"
                  />
                </v-list-item-title>
                <v-list-item-subtitle>
                  <div class="d-flex align-center flex-wrap ga-1 mt-0">
                    <v-chip :color="statusColor(item.submissionStatus)" size="small" variant="tonal">
                      {{ statusLabel(item.submissionStatus) }}
                    </v-chip>
                    <v-chip
                      v-if="item.documentType?.templateUrl"
                      size="x-small"
                      color="info"
                      variant="tonal"
                      prepend-icon="mdi-file-download"
                      :href="item.documentType.templateUrl"
                      target="_blank"
                      rel="noopener"
                      tag="a"
                      class="text-decoration-none"
                    >
                      Download Template
                    </v-chip>
                    <v-chip
                      v-if="linkedDoc(item)"
                      size="x-small"
                      color="primary"
                      variant="tonal"
                      prepend-icon="mdi-download"
                      :href="linkedDoc(item)!.filePath"
                      target="_blank"
                      rel="noopener"
                      tag="a"
                      class="text-decoration-none"
                    >
                      {{ linkedDoc(item)!.fileName }}
                    </v-chip>
                  </div>
                  <!-- HHH-H: List-based item remarks (all roles see history; canEditRemarks can add) -->
                  <div class="mt-2">
                    <!-- Remark history list -->
                    <div v-if="parseItemRemarks(item).length" class="d-flex flex-column ga-1 mb-2">
                      <div
                        v-for="(remark, ri) in parseItemRemarks(item)"
                        :key="ri"
                        class="d-flex align-start ga-2 pa-2 bg-grey-lighten-5 rounded text-body-2"
                      >
                        <v-icon size="14" color="grey" class="mt-1 flex-shrink-0">mdi-comment-text-outline</v-icon>
                        <div class="flex-grow-1">
                          <div class="text-body-2">{{ remark.text }}</div>
                          <div class="text-caption text-grey mt-1">
                            <span v-if="remark.author">{{ remark.author }}</span>
                            <span v-if="remark.author && remark.timestamp"> · </span>
                            <span v-if="remark.timestamp">{{ formatRemarkDate(remark.timestamp) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- Add remark input (canEditRemarks) -->
                    <div v-if="canEditRemarks" class="d-flex align-center ga-1">
                      <v-text-field
                        v-model="draftRemark[item.id]"
                        placeholder="Add a remark…"
                        density="compact"
                        variant="outlined"
                        hide-details
                        single-line
                        style="flex: 1"
                        @keydown.enter="addItemRemark(item)"
                      />
                      <v-btn
                        size="small"
                        color="primary"
                        variant="tonal"
                        :loading="savingRemark[item.id]"
                        :disabled="!(draftRemark[item.id] ?? '').trim()"
                        icon="mdi-send"
                        @click="addItemRemark(item)"
                      />
                    </div>
                  </div>
                </v-list-item-subtitle>
                <template #append>
                  <div class="d-flex flex-column align-center ga-0">
                    <v-btn
                      icon="mdi-folder-arrow-right-outline" size="x-small" variant="text" color="primary"
                      @click="emit('navigate', { groupCode: item.documentType?.groupCode, typeCode: item.documentType?.typeCode })"
                    />
                    <v-btn icon="mdi-history" size="x-small" variant="text" color="grey" @click="openHistory(item)" />
                    <v-btn
                      v-if="canEdit"
                      icon="mdi-pencil"
                      size="x-small"
                      variant="text"
                      :loading="!!updating[item.id]"
                      @click="openEdit(item)"
                    />
                  </div>
                </template>
              </v-list-item>
            </v-list>

            <!-- KV-D3: Per-group remarks field (always at card bottom) -->
            <div v-if="canEditRemarks || remarksForGroup(g.groupCode).length" class="mt-2 pt-2 border-t">
              <p class="text-caption text-grey mb-1 font-weight-medium">
                <v-icon size="x-small" class="mr-1">mdi-comment-text-outline</v-icon>Evaluator Remarks
              </p>
              <v-list v-if="remarksForGroup(g.groupCode).length" density="compact" class="pa-0 mb-2">
                <v-list-item v-for="(remark, idx) in remarksForGroup(g.groupCode)" :key="`${g.groupCode}-${idx}-${remark.timestamp}`" class="px-0">
                  <v-list-item-title class="text-body-2">{{ remark.text }}</v-list-item-title>
                  <v-list-item-subtitle class="text-caption text-grey">
                    {{ remark.author || 'Unspecified user' }} • {{ formatDate(remark.timestamp) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
              <div v-if="canEditRemarks" class="d-flex ga-2 align-start">
                <v-textarea
                  :model-value="groupRemarkDrafts[g.groupCode] ?? ''"
                  placeholder="Add compliance remark…"
                  rows="2"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="flex-grow-1"
                  @update:model-value="onRemarkDraftInput(g.groupCode, String($event ?? ''))"
                />
                <v-btn color="primary" variant="tonal" size="small" class="mt-1" @click="addGroupRemark(g.groupCode)">
                  Add
                </v-btn>
              </div>
            </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- ZU-4: Submission history drawer -->
    <v-navigation-drawer
      v-model="historyDrawer"
      location="right"
      temporary
      width="380"
    >
      <div class="d-flex align-center pa-3 border-b">
        <v-icon class="mr-2">mdi-history</v-icon>
        <span class="font-weight-medium">Submission History</span>
        <v-spacer />
        <v-btn icon="mdi-close" size="small" variant="text" @click="historyDrawer = false" />
      </div>
      <div class="pa-3">
        <p class="text-caption text-grey mb-3">{{ historyItem?.documentType?.typeLabel }}</p>
        <div v-if="loadingHistory" class="text-center py-6">
          <v-progress-circular indeterminate size="24" />
        </div>
        <div v-else-if="!historyEntries.length" class="text-center py-6 text-grey">
          <v-icon size="40" color="grey-lighten-1">mdi-inbox-outline</v-icon>
          <p class="text-caption mt-2">No submissions recorded yet.</p>
        </div>
        <v-timeline v-else density="compact" align="start">
          <v-timeline-item
            v-for="entry in historyEntries"
            :key="entry.id"
            dot-color="primary"
            size="small"
          >
            <div class="d-flex flex-column ga-1">
              <div class="d-flex align-center ga-2">
                <v-chip size="x-small" color="primary" variant="tonal">v{{ entry.version }}</v-chip>
                <span class="text-caption text-grey">{{ formatDate(entry.submitted_at) }}</span>
              </div>
              <div class="text-body-2">{{ entry.submitter_name || 'Unknown' }}</div>
              <v-chip
                size="x-small"
                color="grey"
                variant="tonal"
                prepend-icon="mdi-download"
                :href="entry.file_path"
                target="_blank"
                rel="noopener"
                tag="a"
                class="text-decoration-none"
              >
                {{ entry.original_name }}
              </v-chip>
              <p v-if="entry.submission_notes" class="text-caption text-grey mt-1">
                {{ entry.submission_notes }}
              </p>
            </div>
          </v-timeline-item>
        </v-timeline>
      </div>
    </v-navigation-drawer>

    <!-- Edit dialog -->
    <v-dialog v-model="dialog" max-width="560" persistent>
      <v-card>
        <v-card-title>Update Checklist Item</v-card-title>
        <v-card-subtitle>{{ editing?.documentType?.typeLabel }}</v-card-subtitle>
        <v-divider />
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="12">
              <v-select
                v-model="form.submission_status"
                :items="statusOptions"
                item-title="title"
                item-value="value"
                label="Submission Status"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="form.review_notes"
                label="Review Notes"
                rows="2"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.expiry_date"
                label="Expiry Date"
                type="date"
                hint="For licenses or accreditations"
                persistent-hint
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <!-- KV-B4: document picker replaces UUID text field -->
              <v-select
                v-if="documents.length"
                v-model="form.linked_document_id"
                label="Link Uploaded Document"
                :items="documents"
                :item-title="(d: DocumentItem) => d.fileName"
                item-value="id"
                clearable
                variant="outlined"
                density="comfortable"
                hint="Select a file from the Attachments tab"
                persistent-hint
              />
              <v-text-field
                v-else
                v-model="form.linked_document_id"
                label="Linked Document ID (UUID)"
                hint="Paste UUID of the uploaded file in Documents tab"
                persistent-hint
                variant="outlined"
                density="comfortable"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="submitting" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="submitting" @click="save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
