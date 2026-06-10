<script setup lang="ts">
/**
 * Phase NB-C (2026-05-21): Reusable dynamic bullet-list input.
 *
 * Used in CiBasicInfoForm for:
 *   - Project Objectives
 *   - Beneficiary Groups
 *   - Output Indicators
 *   - Outcome Indicators
 *
 * Behavior per ECO directive:
 *   - If modelValue is empty, renders ONE blank entry visibly
 *     (never collapsed / never hidden).
 *   - Add/remove rows dynamically.
 *   - On emit, empty strings are filtered out so persistence layer never
 *     receives [''] — the UI's default blank entry is purely presentational.
 *   - readOnly mode renders a static bulleted UL.
 */

const modelValue = defineModel<string[]>({ default: () => [] })

const props = withDefaults(defineProps<{
  label?: string
  icon?: string
  color?: string
  addLabel?: string
  placeholder?: (index: number) => string
  maxHeight?: string
  readOnly?: boolean
  emptyStateText?: string
}>(), {
  label: '',
  icon: 'mdi-circle-medium',
  color: 'primary',
  addLabel: 'Add',
  placeholder: (i: number) => `Entry ${i + 1}`,
  maxHeight: '280px',
  readOnly: false,
  emptyStateText: 'No entries — add at least one item.',
})

// ── Internal rows: always at least one row visible (ECO directive) ─────────
// Edits the local rows[] then emits the cleaned version (no empty strings).
const rows = ref<string[]>(
  Array.isArray(modelValue.value) && modelValue.value.length > 0
    ? [...modelValue.value]
    : [''],
)

// Sync incoming modelValue → rows when parent updates externally
watch(modelValue, (next) => {
  const incoming = Array.isArray(next) ? next : []
  // Only re-sync if the cleaned local state differs from the incoming value
  const cleanedLocal = rows.value.map(s => s.trim()).filter(Boolean)
  const cleanedNext  = incoming.map(s => s.trim()).filter(Boolean)
  if (JSON.stringify(cleanedLocal) !== JSON.stringify(cleanedNext)) {
    rows.value = cleanedNext.length > 0 ? [...cleanedNext] : ['']
  }
}, { deep: true })

function emitClean() {
  const cleaned = rows.value.map(s => s.trim()).filter(Boolean)
  modelValue.value = cleaned
}

function addRow() {
  rows.value.push('')
}

function removeRow(i: number) {
  rows.value.splice(i, 1)
  if (rows.value.length === 0) rows.value = [''] // always keep one visible
  emitClean()
}

function onInput() {
  emitClean()
}

const cleanedCount = computed(() => rows.value.filter(s => s.trim()).length)
</script>

<template>
  <!-- ══════ READ-ONLY MODE ══════ -->
  <div v-if="readOnly">
    <p v-if="label" class="text-body-2 font-weight-medium text-grey-darken-2 mb-2">{{ label }}</p>
    <div v-if="cleanedCount === 0" class="text-caption text-grey text-center py-3">
      {{ emptyStateText }}
    </div>
    <ul v-else class="pl-5 mb-0">
      <li
        v-for="(entry, i) in rows.filter(s => s.trim())"
        :key="i"
        class="text-body-2 mb-1"
      >
        {{ entry }}
      </li>
    </ul>
  </div>

  <!-- ══════ EDITABLE MODE ══════ -->
  <div v-else>
    <p v-if="label" class="text-body-2 font-weight-medium text-grey-darken-2 mb-2">{{ label }}</p>
    <div
      class="px-1"
      :style="{ maxHeight: maxHeight, overflowY: 'auto' }"
    >
      <div
        v-for="(_, i) in rows"
        :key="i"
        class="d-flex align-center ga-1 mb-1"
      >
        <v-icon size="medium" :color="color">{{ icon }}</v-icon>
        <v-text-field
          v-model="rows[i]"
          :placeholder="placeholder(i)"
          density="compact"
          variant="outlined"
          hide-details
          @blur="onInput"
          @keydown.enter.prevent="addRow"
        />
        <v-btn
          icon="mdi-close"
          size="small"
          variant="text"
          color="error"
          @click="removeRow(i)"
        />
      </div>
    </div>

    <v-btn
      prepend-icon="mdi-plus"
      variant="tonal"
      :color="color"
      size="small"
      class="mt-2"
      @click="addRow"
    >
      {{ addLabel }}
    </v-btn>
  </div>
</template>
