<script setup lang="ts">
/**
 * HHH-F: Recursive nested folder/container system.
 * Backed by /api/construction-projects/:id/document-folders (CRUD).
 * Renders a folder tree filtered by groupCode. Supports CONTAINER, FORM,
 * TEMPLATE, SUBMISSIONS node types. Flat rendering with depth-based indent.
 * FORM creation auto-creates TEMPLATE + SUBMISSIONS children.
 */
import type { FolderNode } from '~/utils/adapters'

interface FolderDoc {
  id: string
  documentType: string
  fileName: string
  filePath: string
  folderId?: string | null
  uploadedByName?: string | null
  createdAt?: string
  updatedAt?: string
  version?: number
  mimeType?: string
  fileSize?: number
}

const props = withDefaults(defineProps<{
  projectId: string
  groupCode: string
  docTypeCodes?: string[]
  documents?: FolderDoc[]
  canEdit?: boolean
  canDelete?: boolean
  seededTemplateUrl?: string | null
  // LLL-F: official seeded templates for this group (typeCode → label + url).
  // Surfaced as a reference panel; folder TEMPLATE nodes carry no type code,
  // so per-group listing is the reliable way to expose seeded templates.
  seededTemplates?: Array<{ code: string; label: string; url: string }>
}>(), {
  docTypeCodes: () => [],
  documents: () => [],
  canEdit: false,
  canDelete: false,
  seededTemplateUrl: null,
  seededTemplates: () => [],
})

const emit = defineEmits<{ uploaded: []; deleted: [] }>()

const api = useApi()
const toast = useToast()

// ── State ───────────────────────────────────────────────────────────────────
const folders = ref<FolderNode[]>([])
const loading = ref(false)
const expanded = ref(new Set<string>())
const uploading = reactive<Record<string, boolean>>({})
const deletingDoc = reactive<Record<string, boolean>>({})
// OOO-B: per-SUBMISSIONS-node search text (filters the data-table client-side)
const subSearch = reactive<Record<string, string>>({})

// ── Fetch ────────────────────────────────────────────────────────────────────
async function fetchFolders() {
  if (!props.projectId) return
  loading.value = true
  try {
    // PPP-A: API returns { data: FolderNode[] } — unwrap before filtering
    const res = await api.get<{ data: FolderNode[] }>(`/api/construction-projects/${props.projectId}/document-folders`)
    const roots = res.data ?? []
    folders.value = roots.filter(n => n.groupCode === props.groupCode)
  } catch (e) {
    console.error('[CiFolderRepository] fetch failed', e)
  } finally {
    loading.value = false
  }
}

// ── Flat tree rendering ──────────────────────────────────────────────────────
interface FlatNode { node: FolderNode; depth: number }

function flattenVisible(nodes: FolderNode[], depth: number): FlatNode[] {
  const out: FlatNode[] = []
  for (const n of nodes) {
    out.push({ node: n, depth })
    if (expanded.value.has(n.id) && n.children?.length)
      out.push(...flattenVisible(n.children, depth + 1))
  }
  return out
}

const flatTree = computed(() => flattenVisible(folders.value, 0))

function toggle(id: string) {
  const s = new Set(expanded.value)
  s.has(id) ? s.delete(id) : s.add(id)
  expanded.value = s
}

// ── Documents per folder ─────────────────────────────────────────────────────
function docsFor(folderId: string): FolderDoc[] {
  return props.documents.filter(d => d.folderId === folderId)
}
// OOO-B: highest version number in a folder (marks the current/latest submission)
function maxVersionFor(folderId: string): number {
  return docsFor(folderId).reduce((m, d) => Math.max(m, d.version ?? 1), 0)
}

// LLL-G: Submission table headers (File Name / Uploaded By / Date / Version / Actions)
const submissionHeaders = [
  { title: 'File Name', key: 'fileName', sortable: true },
  { title: 'Uploaded By', key: 'uploadedByName', sortable: false },
  { title: 'Date Uploaded', key: 'createdAt', sortable: true },
  { title: 'Last Modified', key: 'updatedAt', sortable: true },
  { title: 'Version', key: 'version', sortable: false, align: 'center' as const },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const },
]

// ── Node icons / colors ──────────────────────────────────────────────────────
function nodeIcon(t: string) {
  if (t === 'TEMPLATE') return 'mdi-file-download-outline'
  if (t === 'SUBMISSIONS') return 'mdi-tray-arrow-up'
  if (t === 'FORM') return 'mdi-file-document-outline'
  return 'mdi-folder-outline'
}
function nodeColor(t: string) {
  if (t === 'TEMPLATE') return 'indigo'
  if (t === 'SUBMISSIONS') return 'success'
  if (t === 'FORM') return 'blue-grey'
  return 'warning'
}

// ── Create folder dialog ─────────────────────────────────────────────────────
const createDialog = ref(false)
const createParentId = ref<string | null>(null)
const createNodeType = ref<'CONTAINER' | 'FORM'>('CONTAINER')
const createName = ref('')
const creating = ref(false)

function openCreateFolder(parentId: string | null, nodeType: 'CONTAINER' | 'FORM' = 'CONTAINER') {
  createParentId.value = parentId
  createNodeType.value = nodeType
  createName.value = ''
  createDialog.value = true
}

async function submitCreate() {
  if (!createName.value.trim()) { toast.error('Name is required'); return }
  creating.value = true
  try {
    const dto: Record<string, any> = {
      folder_name: createName.value.trim(),
      group_code: props.groupCode || undefined,
      node_type: createNodeType.value,
    }
    if (createParentId.value) dto.parent_id = createParentId.value

    const created = await api.post<{ id: string }>(`/api/construction-projects/${props.projectId}/document-folders`, dto)

    if (createNodeType.value === 'FORM' && created?.id) {
      await api.post(`/api/construction-projects/${props.projectId}/document-folders`, {
        folder_name: 'Template',
        parent_id: created.id,
        node_type: 'TEMPLATE',
        sort_order: 0,
      })
      await api.post(`/api/construction-projects/${props.projectId}/document-folders`, {
        folder_name: 'Submissions',
        parent_id: created.id,
        node_type: 'SUBMISSIONS',
        sort_order: 1,
      })
      const s = new Set(expanded.value)
      s.add(created.id)
      if (createParentId.value) s.add(createParentId.value)
      expanded.value = s
    }

    toast.success(`"${createName.value.trim()}" created`)
    createDialog.value = false
    await fetchFolders()
  } catch (e: any) {
    toast.error(e?.message || 'Failed to create folder')
  } finally {
    creating.value = false
  }
}

// ── Rename dialog ────────────────────────────────────────────────────────────
const renameDialog = ref(false)
const renameTarget = ref<FolderNode | null>(null)
const renameName = ref('')
const renaming = ref(false)

function openRename(node: FolderNode) {
  renameTarget.value = node
  renameName.value = node.folderName
  renameDialog.value = true
}

async function submitRename() {
  if (!renameTarget.value || !renameName.value.trim()) return
  renaming.value = true
  try {
    await api.patch(`/api/construction-projects/${props.projectId}/document-folders/${renameTarget.value.id}`, {
      folder_name: renameName.value.trim(),
    })
    toast.success('Renamed')
    renameDialog.value = false
    await fetchFolders()
  } catch (e: any) {
    toast.error(e?.message || 'Failed to rename')
  } finally {
    renaming.value = false
  }
}

// ── Delete folder ────────────────────────────────────────────────────────────
async function deleteFolder(node: FolderNode) {
  if (!confirm(`Delete "${node.folderName}"? This cannot be undone.`)) return
  try {
    await api.del(`/api/construction-projects/${props.projectId}/document-folders/${node.id}`)
    toast.success('Folder deleted')
    await fetchFolders()
  } catch (e: any) {
    toast.error(e?.message || 'Failed to delete')
  }
}

// ── Upload into SUBMISSIONS folder ───────────────────────────────────────────
async function uploadToFolder(folderId: string, file: File) {
  if (file.size > 20 * 1024 * 1024) { toast.error('File exceeds 20 MB'); return }
  uploading[folderId] = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('documentType', props.docTypeCodes[0] || 'OTHER')
    fd.append('folder_id', folderId)
    await api.upload(`/api/construction-projects/${props.projectId}/documents`, fd)
    toast.success('File uploaded')
    emit('uploaded')
  } catch (e: any) {
    toast.error(e?.message || 'Upload failed')
  } finally {
    uploading[folderId] = false
  }
}

async function deleteDoc(docId: string) {
  if (!confirm('Remove this file?')) return
  deletingDoc[docId] = true
  try {
    await api.del(`/api/construction-projects/${props.projectId}/documents/${docId}`)
    toast.success('File removed')
    emit('deleted')
  } catch (e: any) {
    toast.error(e?.message || 'Failed to remove')
  } finally {
    deletingDoc[docId] = false
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso?: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}
function formatBytes(b?: number | null) {
  if (!b) return ''
  if (b < 1024) return `${b} B`
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1048576).toFixed(1)} MB`
}
function hasChildren(node: FolderNode) {
  return node.children && node.children.length > 0
}
function isExpandable(node: FolderNode) {
  return node.nodeType !== 'TEMPLATE' && node.nodeType !== 'SUBMISSIONS' && (hasChildren(node) || node.nodeType === 'CONTAINER' || node.nodeType === 'FORM')
}

// Template nodes: first doc with matching folderId is the template file
function templateDoc(folderId: string): FolderDoc | undefined {
  return props.documents.find(d => d.folderId === folderId)
}

onMounted(fetchFolders)
watch(() => props.projectId, fetchFolders)
</script>

<template>
  <div>
    <!-- LLL-F: Official Templates reference panel (seeded blank forms) -->
    <v-card
      v-if="seededTemplates.length"
      variant="tonal"
      color="indigo-lighten-5"
      rounded="lg"
      class="mb-3 pa-2"
    >
      <div class="d-flex align-center ga-2 mb-1 px-1">
        <v-icon size="16" color="indigo">mdi-file-download-outline</v-icon>
        <span class="text-body-2 font-weight-medium text-indigo-darken-2">Official Templates</span>
        <v-chip size="x-small" variant="tonal" color="indigo">{{ seededTemplates.length }}</v-chip>
      </div>
      <div class="d-flex flex-wrap ga-1">
        <v-btn
          v-for="t in seededTemplates"
          :key="t.code"
          :href="t.url"
          target="_blank"
          rel="noopener"
          size="x-small"
          variant="text"
          color="indigo"
          prepend-icon="mdi-download"
          class="text-none"
        >
          {{ t.label }}
        </v-btn>
      </div>
    </v-card>

    <!-- Loading -->
    <div v-if="loading" class="d-flex justify-center py-6">
      <v-progress-circular indeterminate color="warning" size="24" />
    </div>

    <template v-else>
      <!-- Empty state -->
      <div v-if="!folders.length" class="text-center py-6 text-grey">
        <v-icon size="40" color="grey-lighten-2">mdi-folder-open-outline</v-icon>
        <div class="text-body-2 mt-2">No folders yet.</div>
        <v-btn
          v-if="canEdit"
          size="small"
          color="warning"
          variant="tonal"
          prepend-icon="mdi-folder-plus-outline"
          class="mt-3"
          @click="openCreateFolder(null, 'CONTAINER')"
        >
          Create Folder
        </v-btn>
      </div>

      <!-- Folder tree -->
      <div v-else>
        <div class="d-flex justify-end mb-2" v-if="canEdit">
          <v-btn size="small" variant="tonal" color="warning" prepend-icon="mdi-folder-plus-outline" @click="openCreateFolder(null, 'CONTAINER')">
            New Folder
          </v-btn>
        </div>

        <div class="d-flex flex-column ga-1">
          <div
            v-for="{ node, depth } in flatTree"
            :key="node.id"
            :style="{ paddingLeft: `${depth * 24}px` }"
          >
            <!-- Node row -->
            <v-card
              variant="outlined"
              rounded="lg"
              class="overflow-hidden"
              :class="node.nodeType === 'SUBMISSIONS' ? 'border-success' : node.nodeType === 'TEMPLATE' ? 'border-indigo' : ''"
              :style="node.nodeType !== 'CONTAINER' ? 'border-left: 3px solid' : ''"
            >
              <!-- Node header -->
              <div class="d-flex align-center ga-2 px-3 py-2 bg-grey-lighten-5">
                <!-- Expand toggle -->
                <v-btn
                  v-if="isExpandable(node)"
                  :icon="expanded.has(node.id) ? 'mdi-chevron-down' : 'mdi-chevron-right'"
                  size="x-small"
                  variant="text"
                  color="grey-darken-1"
                  @click="toggle(node.id)"
                />
                <v-icon v-else size="18" color="grey-lighten-1">mdi-circle-small</v-icon>

                <!-- Node icon -->
                <v-icon :icon="nodeIcon(node.nodeType)" :color="nodeColor(node.nodeType)" size="18" />

                <!-- Node name + type chip -->
                <span class="text-body-2 font-weight-medium flex-grow-1">{{ node.folderName }}</span>
                <v-chip
                  v-if="node.nodeType !== 'CONTAINER'"
                  size="x-small"
                  variant="tonal"
                  :color="nodeColor(node.nodeType)"
                >{{ node.nodeType }}</v-chip>

                <!-- Doc count badge for SUBMISSIONS -->
                <v-chip
                  v-if="node.nodeType === 'SUBMISSIONS' && docsFor(node.id).length"
                  size="x-small"
                  variant="tonal"
                  color="success"
                >{{ docsFor(node.id).length }}</v-chip>

                <!-- Action kebab -->
                <v-menu v-if="canEdit && node.nodeType !== 'TEMPLATE' && node.nodeType !== 'SUBMISSIONS'" location="bottom end">
                  <template #activator="{ props: mp }">
                    <v-btn v-bind="mp" icon="mdi-dots-vertical" size="x-small" variant="text" color="grey-darken-1" />
                  </template>
                  <v-list density="compact" min-width="170">
                    <v-list-item
                      v-if="node.nodeType === 'CONTAINER'"
                      prepend-icon="mdi-folder-plus-outline"
                      title="Add Sub-folder"
                      @click="openCreateFolder(node.id, 'CONTAINER')"
                    />
                    <v-list-item
                      v-if="node.nodeType === 'CONTAINER'"
                      prepend-icon="mdi-file-document-plus-outline"
                      title="Add Form"
                      @click="openCreateFolder(node.id, 'FORM')"
                    />
                    <v-list-item prepend-icon="mdi-pencil-outline" title="Rename" @click="openRename(node)" />
                    <v-divider v-if="canDelete" />
                    <v-list-item
                      v-if="canDelete"
                      prepend-icon="mdi-delete-outline"
                      title="Delete"
                      base-color="error"
                      @click="deleteFolder(node)"
                    />
                  </v-list>
                </v-menu>
              </div>

              <!-- TEMPLATE node: show template doc or empty state + seeded template URL -->
              <template v-if="node.nodeType === 'TEMPLATE' && expanded.has(node.id)">
                <v-divider />
                <div class="pa-3">
                  <!-- Uploaded template file -->
                  <div v-if="templateDoc(node.id)" class="d-flex align-center ga-2 mb-2">
                    <v-icon size="18" color="indigo">mdi-file-outline</v-icon>
                    <a :href="`/api/construction-projects/${projectId}/documents/${templateDoc(node.id)!.id}/download`" target="_blank" class="text-body-2 text-indigo text-decoration-none">
                      {{ templateDoc(node.id)!.fileName }}
                    </a>
                    <v-chip size="x-small" variant="tonal" color="indigo">Uploaded</v-chip>
                    <v-btn
                      v-if="canEdit"
                      size="x-small"
                      variant="text"
                      color="error"
                      icon="mdi-delete-outline"
                      :loading="deletingDoc[templateDoc(node.id)!.id]"
                      @click="deleteDoc(templateDoc(node.id)!.id)"
                    />
                  </div>

                  <!-- Seeded official template (shown when no uploaded template exists) -->
                  <div v-else-if="seededTemplateUrl" class="d-flex align-center ga-2 mb-2">
                    <v-icon size="18" color="indigo">mdi-file-download-outline</v-icon>
                    <a :href="seededTemplateUrl" target="_blank" rel="noopener" class="text-body-2 text-indigo text-decoration-none">
                      Download Official Template
                    </a>
                    <v-chip size="x-small" variant="tonal" color="indigo">Official</v-chip>
                  </div>

                  <div v-else class="text-body-2 text-grey mb-2">No template file yet.</div>

                  <div v-if="canEdit" class="mt-1">
                    <v-file-input
                      label="Upload / Replace Template"
                      prepend-icon=""
                      prepend-inner-icon="mdi-upload"
                      density="compact"
                      variant="outlined"
                      hide-details
                      accept=".pdf,.docx,.xlsx,.xls,.doc,.pptx,.jpg,.png"
                      :loading="uploading[node.id]"
                      @change="(e: Event) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) uploadToFolder(node.id, f) }"
                    />
                  </div>
                </div>
              </template>

              <!-- SUBMISSIONS node: upload zone + file list -->
              <template v-if="node.nodeType === 'SUBMISSIONS' && expanded.has(node.id)">
                <v-divider />
                <div class="pa-3">
                  <!-- OOO-B: search within submissions -->
                  <v-text-field
                    v-if="docsFor(node.id).length"
                    v-model="subSearch[node.id]"
                    placeholder="Search submissions…"
                    density="compact"
                    variant="outlined"
                    hide-details
                    single-line
                    clearable
                    prepend-inner-icon="mdi-magnify"
                    class="mb-2"
                    style="max-width: 280px"
                  />
                  <!-- LLL-G: Submission table (File Name / Uploaded By / Date / Last Modified / Version / Actions) -->
                  <v-data-table
                    v-if="docsFor(node.id).length"
                    :items="docsFor(node.id)"
                    :headers="submissionHeaders"
                    :search="subSearch[node.id] || ''"
                    density="compact"
                    hover
                    :items-per-page="5"
                    :items-per-page-options="[5, 10, 25]"
                    class="text-body-2 mb-3 bg-transparent"
                  >
                    <template #item.fileName="{ item }">
                      <div class="d-flex align-center ga-1" style="min-width:0">
                        <v-icon size="16" color="success">mdi-file-check-outline</v-icon>
                        <span class="text-truncate">{{ item.fileName }}</span>
                      </div>
                    </template>
                    <template #item.uploadedByName="{ item }">
                      <span class="text-medium-emphasis">{{ item.uploadedByName || '—' }}</span>
                    </template>
                    <template #item.createdAt="{ item }">
                      <span class="text-medium-emphasis">{{ formatDate(item.createdAt) }}</span>
                    </template>
                    <template #item.updatedAt="{ item }">
                      <span class="text-medium-emphasis">{{ formatDate(item.updatedAt || item.createdAt) }}</span>
                    </template>
                    <template #item.version="{ item }">
                      <div class="d-flex align-center justify-center ga-1">
                        <v-chip size="x-small" variant="tonal" color="info">v{{ item.version || 1 }}</v-chip>
                        <v-chip
                          v-if="maxVersionFor(node.id) > 1 && (item.version || 1) === maxVersionFor(node.id)"
                          size="x-small" variant="tonal" color="success"
                        >Latest</v-chip>
                      </div>
                    </template>
                    <template #item.actions="{ item }">
                      <v-btn
                        :href="`/api/construction-projects/${projectId}/documents/${item.id}/download`"
                        target="_blank"
                        icon="mdi-download"
                        size="x-small"
                        variant="text"
                        color="primary"
                        title="Download"
                      />
                      <v-btn
                        v-if="canDelete"
                        icon="mdi-delete-outline"
                        size="x-small"
                        variant="text"
                        color="error"
                        :loading="deletingDoc[item.id]"
                        title="Delete"
                        @click="deleteDoc(item.id)"
                      />
                    </template>
                  </v-data-table>
                  <div v-else class="text-body-2 text-grey mb-2">No submissions yet.</div>

                  <!-- Upload zone (OOO-B: uploads auto-version on the server) -->
                  <v-file-input
                    v-if="canEdit"
                    :label="docsFor(node.id).length ? 'Upload New Version' : 'Upload Accomplished Form'"
                    prepend-icon=""
                    prepend-inner-icon="mdi-tray-arrow-up"
                    density="compact"
                    variant="outlined"
                    hide-details
                    accept=".pdf,.docx,.xlsx,.xls,.doc,.pptx,.jpg,.png,.zip"
                    :loading="uploading[node.id]"
                    @change="(e: Event) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) uploadToFolder(node.id, f) }"
                  />
                </div>
              </template>

              <!-- FORM/CONTAINER expanded children are handled via flatTree with depth indentation -->
            </v-card>
          </div>
        </div>
      </div>
    </template>

    <!-- Create folder dialog -->
    <v-dialog v-model="createDialog" max-width="460" persistent>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center ga-2 bg-grey-lighten-4 py-3 px-4">
          <v-icon :icon="createNodeType === 'FORM' ? 'mdi-file-document-plus-outline' : 'mdi-folder-plus-outline'" color="warning" />
          <span class="text-subtitle-1 font-weight-medium">
            {{ createNodeType === 'FORM' ? 'Add Form' : 'New Folder' }}
          </span>
          <v-spacer />
          <v-btn icon="mdi-close" size="small" variant="text" @click="createDialog = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-text-field
            v-model="createName"
            :label="createNodeType === 'FORM' ? 'Form Name *' : 'Folder Name *'"
            density="compact"
            variant="outlined"
            autofocus
            hide-details="auto"
            :placeholder="createNodeType === 'FORM' ? 'e.g. Form 1, DPWH-Inspection-Form' : 'e.g. Q1 Documents'"
            @keydown.enter="submitCreate"
          />
          <v-alert v-if="createNodeType === 'FORM'" type="info" variant="tonal" density="compact" class="mt-3 text-body-2">
            A Form will automatically create <strong>Template</strong> and <strong>Submissions</strong> sub-folders.
          </v-alert>
        </v-card-text>
        <v-divider />
        <v-card-actions class="justify-end pa-3">
          <v-btn variant="text" @click="createDialog = false">Cancel</v-btn>
          <v-btn color="warning" variant="tonal" :loading="creating" :disabled="!createName.trim()" @click="submitCreate">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Rename dialog -->
    <v-dialog v-model="renameDialog" max-width="400" persistent>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center ga-2 bg-grey-lighten-4 py-3 px-4">
          <v-icon icon="mdi-pencil-outline" color="primary" />
          <span class="text-subtitle-1 font-weight-medium">Rename Folder</span>
          <v-spacer />
          <v-btn icon="mdi-close" size="small" variant="text" @click="renameDialog = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-text-field
            v-model="renameName"
            label="New Name *"
            density="compact"
            variant="outlined"
            autofocus
            hide-details="auto"
            @keydown.enter="submitRename"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions class="justify-end pa-3">
          <v-btn variant="text" @click="renameDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="tonal" :loading="renaming" :disabled="!renameName.trim()" @click="submitRename">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
