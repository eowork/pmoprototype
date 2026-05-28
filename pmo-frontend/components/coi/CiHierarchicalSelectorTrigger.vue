<script setup lang="ts">
/**
 * Phase NB-D (2026-05-21): Selector trigger surface that pairs with
 * CiHierarchicalSelectorModal. Renders the selected chips inline, with an
 * "Edit Selections" button that opens the modal.
 *
 * Used in CiBasicInfoForm for RDP, 0+8 Agenda, and LIKHA Goals — the SAME
 * component, only `title` + `options` + `color` differ per usage.
 */
import type { HierarchyOption } from '~/utils/coiHierarchies'
// NC fix (2026-05-21): explicit import — Nuxt path-prefixing would otherwise
// resolve <CiHierarchicalSelectorModal> to <CoiCiHierarchicalSelectorModal>.
import CiHierarchicalSelectorModal from '~/components/coi/CiHierarchicalSelectorModal.vue'

const modelValue = defineModel<string[]>({ default: () => [] })

const props = withDefaults(defineProps<{
  label: string
  title: string                   // modal title
  options: HierarchyOption[]
  description?: string            // small hint shown above chips
  icon?: string
  color?: string
  searchPlaceholder?: string
  readOnly?: boolean
  maxVisibleChips?: number        // OC-B: chip collapse threshold (default 5)
}>(), {
  description: '',
  icon: 'mdi-format-list-bulleted-type',
  color: 'primary',
  searchPlaceholder: 'Search…',
  readOnly: false,
  maxVisibleChips: 5,
})

const modalOpen = ref(false)
// OC-B: show-more state
const showAllChips = ref(false)

// ── Label resolution (walks tree to find label for a stored key) ───────────
function findLabel(key: string): string {
  function walk(opts: HierarchyOption[]): string | null {
    for (const o of opts) {
      if (o.key === key) return o.label
      if (o.children?.length) {
        const r = walk(o.children)
        if (r) return r
      }
    }
    return null
  }
  return walk(props.options) ?? key
}

function removeChip(key: string) {
  modelValue.value = (modelValue.value || []).filter(k => k !== key)
}

const selected = computed(() => modelValue.value ?? [])
// OC-B: visible subset when collapsed
const visibleChips = computed(() =>
  showAllChips.value ? selected.value : selected.value.slice(0, props.maxVisibleChips)
)
const hiddenCount = computed(() =>
  Math.max(0, selected.value.length - props.maxVisibleChips)
)
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-1 margin-2">
      <div class="d-flex align-center ga-1">
        <span class="text-body-2 font-weight-medium">{{ label }}</span>
        <v-chip
          v-if="selected.length"
          size="x-small"
          :color="color"
          variant="tonal"
        >
          {{ selected.length }}
        </v-chip>
      </div>
      <v-btn
        v-if="!readOnly"
        size="x-small"
        :color="color"
        variant="tonal"
        prepend-icon="mdi-pencil"
        @click="modalOpen = true"
      >
        Edit Selections
      </v-btn>
    </div>

    <p v-if="description" class="text-caption text-grey mb-1">
      {{ description }}
    </p>

    <div
      v-if="selected.length === 0"
      class="text-caption text-grey font-italic pa-2 bg-grey-lighten-5 rounded"
    >
      No selections yet. <span v-if="!readOnly">Click "Edit Selections" to choose.</span>
    </div>

    <div v-else class="d-flex flex-wrap ga-1 pa-2 bg-grey-lighten-5 rounded">
      <!-- OG-A: max-width + word-break prevents long RDP names from overflowing chip boundary -->
      <v-chip
        v-for="key in visibleChips"
        :key="key"
        size="small"
        :color="color"
        variant="tonal"
        :closable="!readOnly"
        style="white-space: normal; word-break: break-word; max-width: 260px; height: auto; min-height: 24px;"
        @click:close="removeChip(key)"
      >
        {{ findLabel(key) }}
      </v-chip>
      <!-- OC-B: show-more ghost chip -->
      <v-chip
        v-if="!showAllChips && hiddenCount > 0"
        size="small"
        color="grey"
        variant="outlined"
        class="cursor-pointer"
        @click="showAllChips = true"
      >
        +{{ hiddenCount }} more
      </v-chip>
      <!-- OC-B: show-fewer link -->
      <span
        v-if="showAllChips && selected.length > maxVisibleChips"
        class="text-caption text-primary cursor-pointer align-self-center ml-1"
        @click="showAllChips = false"
      >Show fewer</span>
    </div>

    <CiHierarchicalSelectorModal
      v-if="!readOnly"
      v-model:open="modalOpen"
      v-model="modelValue"
      :title="title"
      :options="options"
      :search-placeholder="searchPlaceholder"
      :icon="icon"
      :color="color"
    />
  </div>
</template>
