<script setup lang="ts">
/**
 * OE (2026-05-21): Reusable chronological Remarks Log component.
 * Replaces the inline remarks section in edit-[id].vue Progress tab.
 * Each remark renders as a distinct timestamped card with author chip.
 * Supports per-entry inline edit + delete + pagination (10 per page).
 * readOnly mode: hides Add/Edit/Delete controls; used by detail page.
 */

export interface RemarkEntry {
  id?: string
  text: string
  author?: string
  createdAt: string
  updatedAt?: string
  updatedBy?: string
}

const modelValue = defineModel<RemarkEntry[]>({ default: () => [] })

const props = withDefaults(defineProps<{
  readOnly?: boolean
  currentUserName?: string
}>(), {
  readOnly: false,
  currentUserName: '',
})

// ── Add new remark ─────────────────────────────────────────────────────────
const newText = ref('')

function addRemark() {
  const text = newText.value.trim()
  if (!text) return
  const entry: RemarkEntry = {
    id: crypto.randomUUID(),
    text,
    createdAt: new Date().toISOString(),
    author: props.currentUserName || undefined,
  }
  modelValue.value = [...(modelValue.value ?? []), entry]
  newText.value = ''
}

// ── Per-entry inline edit ──────────────────────────────────────────────────
const editingId = ref<string | null>(null)
const editText = ref('')

function startEdit(entry: RemarkEntry) {
  editingId.value = entry.id ?? null
  editText.value = entry.text
}

function saveEdit(entry: RemarkEntry) {
  const text = editText.value.trim()
  if (!text) return
  modelValue.value = (modelValue.value ?? []).map(r =>
    r.id === entry.id
      ? { ...r, text, updatedAt: new Date().toISOString(), updatedBy: props.currentUserName || undefined }
      : r
  )
  editingId.value = null
  editText.value = ''
}

function cancelEdit() {
  editingId.value = null
  editText.value = ''
}

// ── Delete ─────────────────────────────────────────────────────────────────
function removeRemark(entry: RemarkEntry) {
  modelValue.value = (modelValue.value ?? []).filter(r => r.id !== entry.id)
}

// ── Pagination ─────────────────────────────────────────────────────────────
const PAGE_SIZE = 10
const page = ref(1)

// Newest first
const sorted = computed(() => [...(modelValue.value ?? [])].reverse())
const totalPages = computed(() => Math.ceil(sorted.value.length / PAGE_SIZE))
const paged = computed(() =>
  sorted.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE)
)

// Reset to page 1 when entries change length
watch(() => (modelValue.value ?? []).length, () => { page.value = 1 })

// ── Helpers ────────────────────────────────────────────────────────────────
function formatTs(iso: string) {
  return new Date(iso).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })
}
</script>

<template>
  <!-- Add new remark (hidden in readOnly) -->
  <div v-if="!readOnly" class="mb-3">
    <v-row dense align="end">
      <v-col cols="12" md="10">
        <v-textarea
          v-model="newText"
          label="Add New Remark"
          placeholder="e.g., Material delivery delayed by typhoon. Contractor notified."
          prepend-inner-icon="mdi-comment-plus-outline"
          rows="2"
          auto-grow
          density="compact"
          variant="outlined"
          hide-details
          @keydown.ctrl.enter.prevent="addRemark"
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-btn
          color="info"
          variant="tonal"
          block
          prepend-icon="mdi-plus"
          :disabled="!newText.trim()"
          @click="addRemark"
        >
          Add
        </v-btn>
      </v-col>
    </v-row>
    <p class="text-caption text-grey mt-1">
      <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to submit quickly.
    </p>
  </div>

  <v-divider v-if="!readOnly" class="mb-3" />

  <!-- Empty state -->
  <div
    v-if="!sorted.length"
    class="text-caption text-grey text-center py-4 bg-grey-lighten-5 rounded"
  >
    No remarks recorded yet.
    <span v-if="!readOnly">Add chronological notes above — they are saved with the project.</span>
  </div>

  <!-- Remark cards (newest first) -->
  <div v-else class="d-flex flex-column ga-2">
    <v-card
      v-for="entry in paged"
      :key="entry.id ?? entry.createdAt"
      variant="outlined"
      rounded="lg"
      class="pa-0"
    >
      <v-card-text class="pa-3">
        <!-- View mode -->
        <template v-if="editingId !== entry.id">
          <div class="text-body-2 mb-2" style="white-space: pre-wrap">{{ entry.text }}</div>
          <div class="d-flex align-center flex-wrap ga-2">
            <v-chip v-if="entry.author" size="x-small" color="info" variant="tonal" prepend-icon="mdi-account">
              {{ entry.author }}
            </v-chip>
            <span class="text-caption text-grey">{{ formatTs(entry.createdAt) }}</span>
            <span v-if="entry.updatedAt" class="text-caption text-grey-lighten-1">
              · edited {{ formatTs(entry.updatedAt) }}
              <template v-if="entry.updatedBy">by {{ entry.updatedBy }}</template>
            </span>
            <v-spacer />
            <template v-if="!readOnly">
              <v-btn
                size="x-small"
                variant="text"
                color="primary"
                icon="mdi-pencil"
                @click="startEdit(entry)"
              />
              <v-btn
                size="x-small"
                variant="text"
                color="error"
                icon="mdi-close"
                @click="removeRemark(entry)"
              />
            </template>
          </div>
        </template>

        <!-- Inline edit mode -->
        <template v-else>
          <v-textarea
            v-model="editText"
            rows="2"
            auto-grow
            density="compact"
            variant="outlined"
            hide-details
            autofocus
            class="mb-2"
          />
          <div class="d-flex ga-2">
            <v-btn size="small" color="primary" variant="tonal" prepend-icon="mdi-content-save" @click="saveEdit(entry)">
              Save
            </v-btn>
            <v-btn size="small" color="grey" variant="text" @click="cancelEdit">
              Cancel
            </v-btn>
          </div>
        </template>
      </v-card-text>
    </v-card>
  </div>

  <!-- Pagination -->
  <v-pagination
    v-if="totalPages > 1"
    v-model="page"
    :length="totalPages"
    density="compact"
    rounded
    class="mt-3"
  />
</template>
