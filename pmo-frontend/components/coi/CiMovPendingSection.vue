<template>
  <div>
    <!-- Header row: label + count badge + Add button -->
    <div class="d-flex align-center justify-space-between mb-2">
      <div class="d-flex align-center ga-1">
        <v-icon size="small" color="teal">mdi-clock-outline</v-icon>
        <span class="text-body-2 font-weight-medium">Queued MOV Evidence</span>
        <v-chip size="x-small" :color="modelValue.length ? 'teal' : 'grey'" variant="tonal" class="ml-1">
          {{ modelValue.length }} item{{ modelValue.length !== 1 ? 's' : '' }} queued
        </v-chip>
      </div>
      <v-btn size="small" variant="tonal" color="teal" prepend-icon="mdi-plus" @click="addRow">
        Add Evidence
      </v-btn>
    </div>

    <v-alert v-if="modelValue.length === 0" type="info" variant="tonal" density="compact">
      No evidence queued. Evidence will be saved with the entry.
    </v-alert>

    <!-- LM-B: Expanded multi-row form per queued entry -->
    <v-card
      v-for="(row, idx) in modelValue"
      :key="idx"
      variant="outlined"
      class="mb-2 pa-3"
    >
      <!-- Row 1: Type + Title + Delete -->
      <div class="d-flex align-center ga-2 mb-2">
        <v-select
          :model-value="row.type"
          :items="typeOptions"
          label="Type"
          density="compact"
          variant="outlined"
          hide-details
          style="max-width: 140px; flex-shrink: 0"
          @update:model-value="(v: string) => updateRow(idx, 'type', v)"
        />
        <v-text-field
          :model-value="row.title"
          label="Title *"
          density="compact"
          variant="outlined"
          hide-details
          style="flex: 1"
          @update:model-value="(v: string) => updateRow(idx, 'title', v)"
        />
        <v-btn icon="mdi-close" size="small" variant="text" color="error" @click="removeRow(idx)" />
      </div>

      <!-- Row 2: URL + Entry Date -->
      <div class="d-flex align-center ga-2 mb-2">
        <v-text-field
          :model-value="row.link"
          label="URL (optional)"
          density="compact"
          variant="outlined"
          hide-details
          style="flex: 1.5"
          @update:model-value="(v: string) => updateRow(idx, 'link', v)"
        />
        <v-menu v-model="entryDateMenus[idx]" :close-on-content-click="false">
          <template #activator="{ props: menuProps }">
            <v-text-field
              v-bind="menuProps"
              :model-value="row.entryDate"
              label="Evidence Date"
              prepend-inner-icon="mdi-calendar"
              readonly
              clearable
              density="compact"
              variant="outlined"
              hide-details
              style="max-width: 180px; flex-shrink: 0"
              @click:clear="updateRow(idx, 'entryDate', '')"
            />
          </template>
          <v-date-picker
            :model-value="isoToDate(row.entryDate)"
            min="1900-01-01"
            max="2100-12-31"
            hide-actions
            @update:model-value="(v: any) => { updateRow(idx, 'entryDate', toIsoDate(v)); closeEntryDateMenu(idx) }"
          />
        </v-menu>
      </div>

      <!-- Row 3: Category + Description -->
      <div class="d-flex align-center ga-2 mb-2">
        <v-select
          :model-value="row.category"
          :items="categoryOptions"
          label="Category (optional)"
          density="compact"
          variant="outlined"
          clearable
          hide-details
          style="max-width: 220px; flex-shrink: 0"
          @update:model-value="(v: string) => updateRow(idx, 'category', v ?? '')"
        />
        <v-text-field
          :model-value="row.description"
          label="Description (optional)"
          density="compact"
          variant="outlined"
          hide-details
          style="flex: 1"
          @update:model-value="(v: string) => updateRow(idx, 'description', v)"
        />
      </div>

      <!-- Row 4: Remarks -->
      <v-text-field
        :model-value="row.remarks"
        label="Remarks (optional)"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        @update:model-value="(v: string) => updateRow(idx, 'remarks', v)"
      />

      <!-- LM-B: File attachment (≤15 MB; replaces URL if selected) -->
      <v-file-input
        :model-value="row.file ? [row.file] : []"
        label="Attach file (optional, max 15 MB)"
        prepend-icon="mdi-paperclip"
        density="compact"
        variant="outlined"
        hide-details
        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
        :rules="[v => !v?.length || v[0].size <= 15 * 1024 * 1024 || 'File must be ≤ 15 MB']"
        @update:model-value="(files: File[]) => updateFile(idx, files[0] ?? undefined)"
      />
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// LM-A/LM-B: Expanded PendingMovEntry interface — field-complete with CiMovEvidenceSection + file upload
export interface PendingMovEntry {
  title: string
  link: string
  type: 'URL' | 'DRIVE'
  entryDate: string
  category: string
  description: string
  remarks: string
  file?: File  // LM-B: optional file attachment (≤15 MB)
}

const props = defineProps<{
  modelValue: PendingMovEntry[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: PendingMovEntry[]]
}>()

// Per-row entry date menu state (grows with array)
const entryDateMenus = ref<boolean[]>([])
function closeEntryDateMenu(idx: number) {
  entryDateMenus.value[idx] = false
}

const typeOptions = [
  { title: 'URL', value: 'URL' },
  { title: 'Google Drive', value: 'DRIVE' },
]

const categoryOptions = [
  { title: 'Photo Documentation', value: 'photo_documentation' },
  { title: 'Inspection Report', value: 'inspection_report' },
  { title: 'Completion Certificate', value: 'completion_certificate' },
  { title: 'Site Visit', value: 'site_visit' },
  { title: 'Progress Report', value: 'progress_report' },
  { title: 'Test Result', value: 'test_result' },
  { title: 'Meeting Minutes', value: 'meeting_minutes' },
  { title: 'Official Document', value: 'official_document' },
  { title: 'Other', value: 'other' },
]

// LM-C: Updated default row with all fields
function addRow() {
  entryDateMenus.value.push(false)
  emit('update:modelValue', [
    ...props.modelValue,
    { title: '', link: '', type: 'URL', entryDate: '', category: '', description: '', remarks: '', file: undefined },
  ])
}

function removeRow(idx: number) {
  const next = [...props.modelValue]
  next.splice(idx, 1)
  entryDateMenus.value.splice(idx, 1)
  emit('update:modelValue', next)
}

// LM-D: keyof PendingMovEntry covers all fields automatically
function updateRow(idx: number, field: keyof PendingMovEntry, value: string) {
  const next = props.modelValue.map((r, i) =>
    i === idx ? { ...r, [field]: value } : r,
  )
  emit('update:modelValue', next)
}

// LM-B: File update handler
function updateFile(idx: number, file: File | undefined) {
  const next = props.modelValue.map((r, i) =>
    i === idx ? { ...r, file } : r,
  )
  emit('update:modelValue', next)
}

function toIsoDate(d: Date | string | null | undefined): string {
  if (!d) return ''
  if (typeof d === 'string') return d.slice(0, 10)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isoToDate(iso: string): Date | null {
  return iso ? new Date(iso + 'T00:00:00') : null
}
</script>
