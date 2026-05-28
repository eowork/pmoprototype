<script setup lang="ts">
// BBB-B: Compliance Repository — per-item workspace for CPES documentary
// requirements. Reuses the existing document-checklist + submissions endpoints
// (no new backend) and filters client-side to the CPES_DOCS group.

interface DocumentItem {
  id: string
  fileName: string
  filePath: string
  documentType?: string
  mimeType?: string
}

interface Props {
  projectId: string
  canEdit?: boolean
  canEditRemarks?: boolean
  documents?: DocumentItem[]
}

const props = withDefaults(defineProps<Props>(), {
  canEdit: false,
  canEditRemarks: false,
  documents: () => [],
})

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

const items = ref<ChecklistItem[]>([])
const loading = ref(false)

// CCC-C: Annex-8 Cover Sheet hidden from the workspace (taxonomy row retained in DB).
const EXCLUDED_CPES_CODES = ['CPES_COVER_SHEET']
const cpesItems = computed(() =>
  items.value.filter(
    (i) =>
      i.documentType?.groupCode === 'CPES_DOCS' &&
      !EXCLUDED_CPES_CODES.includes(i.documentType?.typeCode ?? ''),
  ),
)
const approvedCount = computed(() => cpesItems.value.filter((i) => i.submissionStatus === 'APPROVED').length)
const submittedCount = computed(() => cpesItems.value.filter((i) => i.submissionStatus !== 'NOT_SUBMITTED').length)

const statusOptions = [
  { title: 'Not Submitted', value: 'NOT_SUBMITTED', color: 'grey' },
  { title: 'Submitted', value: 'SUBMITTED', color: 'info' },
  { title: 'Under Review', value: 'UNDER_REVIEW', color: 'warning' },
  { title: 'Approved', value: 'APPROVED', color: 'success' },
  { title: 'Rejected', value: 'REJECTED', color: 'error' },
]
function statusColor(s: string): string {
  return statusOptions.find((o) => o.value === s)?.color || 'grey'
}
function statusLabel(s: string): string {
  return statusOptions.find((o) => o.value === s)?.title || s
}
function statusIcon(s: string): string {
  return s === 'NOT_SUBMITTED' ? 'mdi-circle-outline' : (s === 'REJECTED' ? 'mdi-alert-circle' : 'mdi-check-circle')
}

function formatDate(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function linkedDoc(item: ChecklistItem): DocumentItem | null {
  if (!item.linkedDocumentId || !props.documents.length) return null
  return props.documents.find((d) => d.id === item.linkedDocumentId) ?? null
}

// CCC-A: authenticated download with original filename.
async function downloadDoc(d: DocumentItem) {
  if (d.mimeType === 'application/x-google-drive-link' || !props.projectId) {
    window.open(d.filePath, '_blank', 'noopener')
    return
  }
  try {
    await api.download(`/api/construction-projects/${props.projectId}/documents/${d.id}/download`, d.fileName)
  } catch {
    window.open(d.filePath, '_blank', 'noopener')
  }
}
async function downloadHistory(entry: { document_id?: string; file_path?: string; original_name?: string }) {
  if (!props.projectId || !entry.document_id) {
    if (entry.file_path) window.open(entry.file_path, '_blank', 'noopener')
    return
  }
  try {
    await api.download(`/api/construction-projects/${props.projectId}/documents/${entry.document_id}/download`, entry.original_name ?? 'download')
  } catch {
    if (entry.file_path) window.open(entry.file_path, '_blank', 'noopener')
  }
}

async function fetchChecklist() {
  if (!props.projectId) return
  loading.value = true
  try {
    const res = await api.get<any>(`/api/construction-projects/${props.projectId}/document-checklist`)
    const list: any[] = Array.isArray(res) ? res : (res?.data || [])
    items.value = list as ChecklistItem[]
  } catch (err: unknown) {
    console.error('[CiComplianceRepository] fetch failed:', err)
  } finally {
    loading.value = false
  }
}

// ── Upload / submission ──────────────────────────────────────
const uploadDialog = ref(false)
const uploadTarget = ref<ChecklistItem | null>(null)
const uploadFile = ref<File | null>(null)
const uploadNotes = ref('')
const submittingUpload = ref(false)

function openUpload(item: ChecklistItem) {
  uploadTarget.value = item
  uploadFile.value = null
  uploadNotes.value = ''
  uploadDialog.value = true
}
async function saveUpload() {
  if (!uploadTarget.value || !uploadFile.value) return
  submittingUpload.value = true
  try {
    const fd = new FormData()
    fd.append('file', uploadFile.value)
    if (uploadNotes.value) fd.append('notes', uploadNotes.value)
    await api.upload(
      `/api/construction-projects/${props.projectId}/document-checklist/${uploadTarget.value.id}/submissions`,
      fd,
    )
    toast.success('Submission recorded')
    uploadDialog.value = false
    await fetchChecklist()
  } catch (err: unknown) {
    toast.error((err as { message?: string })?.message || 'Submission failed')
  } finally {
    submittingUpload.value = false
  }
}

// ── Remarks (auto-save on blur) ──────────────────────────────
async function patchRemarks(item: ChecklistItem, value: string) {
  if (!props.canEditRemarks) return
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

// ── Submission history drawer ────────────────────────────────
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
  } catch {
    toast.error('Failed to load submission history')
  } finally {
    loadingHistory.value = false
  }
}

watch(() => props.projectId, () => { if (props.projectId) fetchChecklist() })
onMounted(() => { if (props.projectId) fetchChecklist() })
defineExpose({ refresh: fetchChecklist })
</script>

<template>
  <div>
    <!-- Summary bar -->
    <v-card variant="tonal" color="deep-purple" class="mb-4">
      <v-card-text class="d-flex align-center ga-3 flex-wrap py-2">
        <v-icon icon="mdi-certificate-outline" />
        <span class="text-body-2 font-weight-medium">Compliance Repository — CPES Documentary Requirements</span>
        <v-spacer />
        <v-chip size="small" variant="elevated" color="success">{{ approvedCount }} approved</v-chip>
        <v-chip size="small" variant="tonal">{{ submittedCount }} / {{ cpesItems.length }} submitted</v-chip>
        <v-progress-linear
          :model-value="cpesItems.length ? (submittedCount / cpesItems.length) * 100 : 0"
          color="white" height="6" rounded style="max-width:140px"
        />
      </v-card-text>
    </v-card>

    <div v-if="loading" class="text-center pa-4 text-grey">
      <v-progress-circular indeterminate size="24" />
      <div class="mt-2 text-caption">Loading compliance items…</div>
    </div>

    <div v-else-if="!cpesItems.length" class="text-center pa-6 text-grey">
      <v-icon size="48" color="grey-lighten-1">mdi-certificate-outline</v-icon>
      <div class="mt-2">No CPES documentary requirements found. Run the latest migration to seed the taxonomy.</div>
    </div>

    <!-- Per-item workspace (CCC-C: two-column responsive grid) -->
    <v-row v-else dense>
      <v-col v-for="item in cpesItems" :key="item.id" cols="12" md="6">
        <v-card variant="outlined" class="h-100">
          <v-card-text class="py-2">
        <div class="d-flex align-center ga-2 flex-wrap">
          <v-icon :icon="statusIcon(item.submissionStatus)" :color="statusColor(item.submissionStatus)" size="small" />
          <span class="text-body-2">{{ item.documentType?.typeLabel || 'Unknown type' }}</span>
          <v-icon v-if="item.documentType?.isRequired" icon="mdi-asterisk" size="x-small" color="error" />
          <v-chip :color="statusColor(item.submissionStatus)" size="x-small" variant="tonal">
            {{ statusLabel(item.submissionStatus) }}
          </v-chip>
          <v-spacer />
          <!-- Blank-form template -->
          <v-btn
            v-if="item.documentType?.templateUrl"
            size="x-small" variant="tonal" color="indigo" prepend-icon="mdi-download"
            :href="item.documentType.templateUrl" target="_blank" rel="noopener"
          >
            Download Template
          </v-btn>
          <!-- Linked uploaded file -->
          <v-chip
            v-if="linkedDoc(item)"
            size="x-small" variant="tonal" color="primary" prepend-icon="mdi-file-check"
            class="cursor-pointer"
            @click="downloadDoc(linkedDoc(item)!)"
          >
            {{ linkedDoc(item)!.fileName }}
          </v-chip>
          <!-- Upload / resubmit -->
          <v-btn
            v-if="canEdit"
            size="x-small" variant="tonal"
            :color="item.linkedDocumentId ? 'warning' : 'primary'"
            :prepend-icon="item.linkedDocumentId ? 'mdi-refresh' : 'mdi-upload'"
            @click="openUpload(item)"
          >
            {{ item.linkedDocumentId ? 'Resubmit' : 'Submit' }}
          </v-btn>
          <!-- History -->
          <v-btn size="x-small" variant="text" icon="mdi-history" color="grey" @click="openHistory(item)" />
        </div>

        <!-- Remarks -->
        <div v-if="canEditRemarks" class="mt-2">
          <v-textarea
            :model-value="item.remarks ?? ''"
            placeholder="Evaluator remarks…"
            rows="1" auto-grow variant="outlined" density="compact" hide-details
            @blur="patchRemarks(item, ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
            <p v-else-if="item.remarks" class="text-caption text-grey mt-1">
              <v-icon size="x-small" class="mr-1">mdi-comment-text-outline</v-icon>{{ item.remarks }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Submit / Resubmit dialog -->
    <v-dialog v-model="uploadDialog" max-width="460" persistent>
      <v-card>
        <v-card-title class="text-body-1">
          {{ uploadTarget?.linkedDocumentId ? `Resubmit (v${(uploadTarget?.currentVersion ?? 0) + 1})` : 'Submit Document' }}
        </v-card-title>
        <v-card-subtitle class="pb-0">{{ uploadTarget?.documentType?.typeLabel }}</v-card-subtitle>
        <v-divider class="mt-2" />
        <v-card-text class="pt-4">
          <v-file-input
            v-model="uploadFile"
            label="Document File *"
            prepend-icon="mdi-paperclip"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            show-size variant="outlined" density="comfortable" hide-details class="mb-3"
          />
          <v-textarea
            v-model="uploadNotes"
            label="Submission Notes (optional)"
            rows="2" variant="outlined" density="comfortable" hide-details
          />
          <v-alert
            v-if="uploadTarget?.linkedDocumentId"
            type="info" density="compact" variant="tonal" class="mt-3"
          >
            A new version will be created. Previous submissions are preserved in history.
          </v-alert>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="submittingUpload" @click="uploadDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="submittingUpload" :disabled="!uploadFile" @click="saveUpload">
            {{ uploadTarget?.linkedDocumentId ? 'Resubmit' : 'Submit' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Submission history drawer -->
    <v-navigation-drawer v-model="historyDrawer" location="right" temporary width="380">
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
          <v-timeline-item v-for="entry in historyEntries" :key="entry.id" dot-color="primary" size="small">
            <div class="d-flex flex-column ga-1">
              <div class="d-flex align-center ga-2">
                <v-chip size="x-small" color="primary" variant="tonal">v{{ entry.version }}</v-chip>
                <span class="text-caption text-grey">{{ formatDate(entry.submitted_at) }}</span>
              </div>
              <div class="text-body-2">{{ entry.submitter_name || 'Unknown' }}</div>
              <v-chip
                size="x-small" color="grey" variant="tonal" prepend-icon="mdi-download"
                class="cursor-pointer"
                @click="downloadHistory(entry)"
              >
                {{ entry.original_name }}
              </v-chip>
              <p v-if="entry.submission_notes" class="text-caption text-grey mt-1">{{ entry.submission_notes }}</p>
            </div>
          </v-timeline-item>
        </v-timeline>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<style scoped>
.cursor-pointer { cursor: pointer; }
</style>
