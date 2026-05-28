<template>
  <v-dialog v-model="open" max-width="1000" persistent scrollable>
    <v-card>
      <v-card-title class="d-flex align-center ga-2">
        <v-icon icon="mdi-flag-plus" color="primary" />
        Batch Add Milestones
        <v-chip size="x-small" variant="tonal" color="primary" class="ml-1">{{ rows.length }} / 50</v-chip>
      </v-card-title>
      <v-divider />
      <v-card-text style="max-height: 60vh; overflow-y: auto">
        <!-- LU-C: Updated alert text -->
        <v-alert type="info" variant="tonal" density="compact" class="mb-3">
          Add up to 50 milestones at once. Title is required per row. For file uploads, categories, and advanced MOV configuration, edit each record individually after saving.
        </v-alert>

        <div v-for="(row, idx) in rows" :key="idx" class="mb-2">
          <v-card variant="outlined" class="pa-2">
            <v-row dense align="center">
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="row.title"
                  :label="`Title * (row ${idx + 1})`"
                  density="compact"
                  variant="outlined"
                  hide-details
                  :error="submitted && !row.title.trim()"
                />
              </v-col>
              <v-col cols="6" sm="2">
                <v-menu v-model="dateMenus[idx]" :close-on-content-click="false">
                  <template #activator="{ props: mp }">
                    <v-text-field
                      v-bind="mp"
                      :model-value="row.target_date"
                      label="Target Date"
                      prepend-inner-icon="mdi-calendar"
                      readonly
                      clearable
                      density="compact"
                      variant="outlined"
                      hide-details
                      @click:clear="row.target_date = ''"
                    />
                  </template>
                  <v-date-picker
                    :model-value="isoToDate(row.target_date)"
                    min="1900-01-01"
                    max="2100-12-31"
                    hide-actions
                    @update:model-value="(v: any) => { row.target_date = toIsoDate(v); dateMenus[idx] = false }"
                  />
                </v-menu>
              </v-col>
              <v-col cols="6" sm="2">
                <v-select
                  v-model="row.status"
                  :items="statusOptions"
                  label="Status"
                  density="compact"
                  variant="outlined"
                  hide-details
                />
              </v-col>
              <v-col cols="12" sm="2">
                <v-text-field
                  v-model="row.category"
                  label="Category"
                  density="compact"
                  variant="outlined"
                  hide-details
                />
              </v-col>
              <!-- LU-B: MOV Link field -->
              <v-col cols="11" sm="2">
                <v-text-field
                  v-model="row.mov_link"
                  label="MOV Link"
                  prepend-inner-icon="mdi-link"
                  placeholder="https://..."
                  density="compact"
                  variant="outlined"
                  hide-details
                />
              </v-col>
              <v-col cols="1" class="d-flex justify-center">
                <v-btn icon="mdi-close" size="small" variant="text" color="error" @click="removeRow(idx)" />
              </v-col>
            </v-row>
          </v-card>
        </div>

        <v-btn
          v-if="rows.length < 50"
          variant="tonal"
          color="primary"
          prepend-icon="mdi-plus"
          size="small"
          class="mt-2"
          @click="addRow"
        >
          Add Row
        </v-btn>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" :disabled="submitting" @click="cancel">Cancel</v-btn>
        <v-btn color="primary" :loading="submitting" @click="submit">
          Save All ({{ rows.length }})
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ projectId: string }>()
const emit = defineEmits<{
  saved: []
  cancel: []
}>()

const open = defineModel<boolean>({ default: false })

// LU-A: Added mov_link field
interface BatchRow {
  title: string
  target_date: string
  status: string
  category: string
  mov_link: string
}

// LU-A: Default includes mov_link
const rows = ref<BatchRow[]>([{ title: '', target_date: '', status: 'PENDING', category: '', mov_link: '' }])
const dateMenus = ref<boolean[]>([false])
const submitting = ref(false)
const submitted = ref(false)

const statusOptions = [
  { title: 'Pending', value: 'PENDING' },
  { title: 'In Progress', value: 'IN_PROGRESS' },
  { title: 'Completed', value: 'COMPLETED' },
  { title: 'Delayed', value: 'DELAYED' },
  { title: 'Cancelled', value: 'CANCELLED' },
]

function addRow() {
  rows.value.push({ title: '', target_date: '', status: 'PENDING', category: '', mov_link: '' })
  dateMenus.value.push(false)
}

function removeRow(idx: number) {
  rows.value.splice(idx, 1)
  dateMenus.value.splice(idx, 1)
}

function toIsoDate(d: Date | null | undefined): string {
  if (!d) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isoToDate(iso: string): Date | null {
  return iso ? new Date(iso + 'T00:00:00') : null
}

const { $api } = useNuxtApp()
const api = $api as any
const toast = useToast ? useToast() : { success: console.log, error: console.error }

async function submit() {
  submitted.value = true
  const valid = rows.value.filter(r => r.title.trim())
  if (!valid.length) return

  submitting.value = true
  try {
    const created = await api.post<any[]>(`/api/construction-projects/${props.projectId}/milestones/batch`, {
      items: valid.map(r => ({
        title: r.title.trim(),
        status: r.status || 'PENDING',
        ...(r.target_date ? { target_date: r.target_date } : {}),
        ...(r.category.trim() ? { category: r.category.trim() } : {}),
      })),
    })

    // LU-D: Drain MOV for rows with mov_link; created array is in same order as valid
    const createdItems = Array.isArray(created) ? created : (created as any)?.items ?? []
    const withMov = valid.filter(r => r.mov_link.trim())
    for (let i = 0; i < withMov.length; i++) {
      const origIdx = valid.indexOf(withMov[i])
      const id = createdItems[origIdx]?.id
      if (!id) continue
      try {
        await api.post(`/api/construction-projects/${props.projectId}/mov-entries`, {
          related_entity_type: 'MILESTONE',
          related_entity_id: id,
          mov_title: withMov[i].title.trim(),
          mov_link: withMov[i].mov_link.trim(),
        })
      } catch { /* non-blocking */ }
    }

    toast.success(`${valid.length} milestone(s) added`)
    rows.value = [{ title: '', target_date: '', status: 'PENDING', category: '', mov_link: '' }]
    dateMenus.value = [false]
    submitted.value = false
    open.value = false
    emit('saved')
  } catch (err: any) {
    toast.error(err?.message || 'Failed to batch create milestones')
  } finally {
    submitting.value = false
  }
}

function cancel() {
  open.value = false
  emit('cancel')
}
</script>
