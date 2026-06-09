<script setup lang="ts">
/**
 * KD-E: Project Diary panel — reverse-chronological diary entries with CRUD.
 */
interface Props {
  projectId: string
  canEdit: boolean
}

const props = defineProps<Props>()

interface DiaryEntry {
  id: string
  project_id: string
  entry_date: string
  title?: string | null
  content: string
  author_id?: string | null
  author_name?: string | null
  created_at: string
  updated_at: string
}

const api = useApi()
const toast = useToast()

const entries = ref<DiaryEntry[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const dialog = ref(false)
const editingId = ref<string | null>(null)
const submitting = ref(false)

const form = ref({
  entry_date: new Date().toISOString().slice(0, 10),
  title: '',
  content: '',
})

const deleteDialog = ref(false)
const deleteTarget = ref<DiaryEntry | null>(null)
const deleting = ref(false)

async function fetchEntries() {
  if (!props.projectId) return
  loading.value = true
  error.value = null
  try {
    const res = await api.get<DiaryEntry[] | { data: DiaryEntry[] }>(
      `/api/construction-projects/${props.projectId}/diary-entries`,
    )
    entries.value = Array.isArray(res) ? res : (res?.data || [])
  } catch (err: any) {
    console.error('[CiProjectDiary] fetch failed:', err)
    error.value = 'Project diary could not be loaded. The diary feature may require a database migration.'
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = {
    entry_date: new Date().toISOString().slice(0, 10),
    title: '',
    content: '',
  }
}

function openCreate() {
  resetForm()
  editingId.value = null
  dialog.value = true
}

function openEdit(e: DiaryEntry) {
  form.value = {
    entry_date: String(e.entry_date).slice(0, 10),
    title: e.title || '',
    content: e.content || '',
  }
  editingId.value = e.id
  dialog.value = true
}

async function save() {
  if (!form.value.entry_date) { toast.error('Entry date is required'); return }
  if (!form.value.content.trim()) { toast.error('Content is required'); return }
  submitting.value = true
  try {
    const payload = {
      entry_date: form.value.entry_date,
      title: form.value.title || undefined,
      content: form.value.content.trim(),
    }
    if (editingId.value) {
      await api.patch(`/api/construction-projects/${props.projectId}/diary-entries/${editingId.value}`, payload)
      toast.success('Diary entry updated')
    } else {
      await api.post(`/api/construction-projects/${props.projectId}/diary-entries`, payload)
      toast.success('Diary entry added')
    }
    dialog.value = false
    await fetchEntries()
  } catch (err: any) {
    toast.error(err?.message || 'Failed to save diary entry')
  } finally {
    submitting.value = false
  }
}

function confirmDelete(e: DiaryEntry) {
  deleteTarget.value = e
  deleteDialog.value = true
}

async function executeDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await api.del(`/api/construction-projects/${props.projectId}/diary-entries/${deleteTarget.value.id}`)
    entries.value = entries.value.filter(e => e.id !== deleteTarget.value!.id)
    toast.success('Diary entry deleted')
    deleteDialog.value = false
    deleteTarget.value = null
  } catch (err: any) {
    toast.error(err?.message || 'Failed to delete diary entry')
  } finally {
    deleting.value = false
  }
}

function fmtDate(v: string): string {
  if (!v) return '—'
  const d = new Date(v)
  return Number.isNaN(d.getTime())
    ? String(v).slice(0, 10)
    : d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}

watch(() => props.projectId, () => {
  if (props.projectId) fetchEntries()
})

onMounted(() => {
  if (props.projectId) fetchEntries()
})
</script>

<template>
  <v-card class="mb-4">
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="d-flex align-center ga-2">
        <v-icon icon="mdi-notebook-outline" />
        <span>Project Diary</span>
      </div>
      <v-btn
        v-if="canEdit"
        size="small"
        color="primary"
        prepend-icon="mdi-plus"
        @click="openCreate"
      >Add Entry</v-btn>
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-alert
        v-if="error"
        type="warning"
        variant="tonal"
        density="comfortable"
        class="mb-3"
        :text="error"
      />
      <div v-else-if="loading" class="text-center py-4 text-grey">
        <v-progress-circular indeterminate size="24" />
      </div>
      <div v-else-if="entries.length === 0" class="text-center py-6 text-grey">
        <v-icon size="48" color="grey-lighten-1">mdi-notebook-outline</v-icon>
        <div class="mt-2">
          No diary entries yet.
          <span v-if="canEdit"> Click <strong>Add Entry</strong> to log a daily note.</span>
        </div>
      </div>
      <v-list v-else density="comfortable" class="pa-0">
        <template v-for="(entry, i) in entries" :key="entry.id">
          <v-list-item class="px-2">
            <template #prepend>
              <div class="text-center mr-2" style="min-width: 56px">
                <div class="text-caption text-grey">{{ fmtDate(entry.entry_date) }}</div>
              </div>
            </template>
            <v-list-item-title class="font-weight-medium">
              {{ entry.title || 'Diary Entry' }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-body-2 mt-1" style="white-space: pre-wrap">
              {{ entry.content }}
            </v-list-item-subtitle>
            <div class="text-caption text-grey mt-1">
              <v-icon size="x-small">mdi-account</v-icon>
              {{ entry.author_name || '—' }}
            </div>
            <template v-if="canEdit" #append>
              <v-btn icon size="small" variant="text" @click="openEdit(entry)">
                <v-icon size="small">mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon size="small" variant="text" color="error" @click="confirmDelete(entry)">
                <v-icon size="small">mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-list-item>
          <v-divider v-if="i < entries.length - 1" />
        </template>
      </v-list>
    </v-card-text>

    <!-- Create/Edit dialog -->
    <v-dialog v-model="dialog" max-width="560" persistent>
      <v-card>
        <v-card-title>{{ editingId ? 'Edit Diary Entry' : 'Add Diary Entry' }}</v-card-title>
        <v-divider />
        <v-card-text>
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.entry_date"
                label="Entry Date *"
                type="date"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.title"
                label="Title"
                placeholder="Short summary (optional)"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="form.content"
                label="Content *"
                rows="5"
                placeholder="Site observations, issues, decisions, next-day plan…"
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
          <v-btn color="primary" :loading="submitting" @click="save">
            {{ editingId ? 'Save' : 'Add' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete confirm -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card>
        <v-card-title>Delete diary entry?</v-card-title>
        <v-card-text>
          <p class="mb-2">This will permanently delete the entry from {{ fmtDate(deleteTarget?.entry_date || '') }}.</p>
          <p class="text-caption text-grey">This action cannot be undone.</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" :loading="deleting" @click="executeDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>
