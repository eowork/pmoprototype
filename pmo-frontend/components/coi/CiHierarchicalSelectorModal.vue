<script setup lang="ts">
/**
 * Phase NB-B (2026-05-21): Reusable hierarchical multi-select modal.
 *
 * Used by Project Profile selectors for:
 *   - RDP 2023–2028 (Parts → Chapters → Sub-chapters)
 *   - 0+8 Socio-Economic Agenda (Items → Sub-items)
 *   - CSU LIKHA Goals (flat)
 *
 * Behavior:
 *   - Transactional editor: edits a local draft; only emits update:modelValue on Apply.
 *   - Search filters tree by label match; parent groups preserved when child matches.
 *   - Per-leaf v-checkbox. Parent shows indeterminate state with partial children.
 *   - Clicking parent checkbox selects/deselects all VISIBLE (filtered) descendant leaves.
 *
 * Independent sub-item selection (ECO directive): selecting a leaf does NOT
 * auto-select siblings or parent; the parent is purely a UI group/aggregate.
 */
import type { HierarchyOption } from '~/utils/coiHierarchies'
import { leafKeysOf } from '~/utils/coiHierarchies'

const open = defineModel<boolean>('open', { default: false })
const modelValue = defineModel<string[]>({ default: () => [] })

const props = withDefaults(defineProps<{
  title: string
  options: HierarchyOption[]
  searchPlaceholder?: string
  icon?: string
  color?: string
}>(), {
  searchPlaceholder: 'Search…',
  icon: 'mdi-format-list-bulleted-type',
  color: 'primary',
})

// ── Draft selection (committed on Apply) ───────────────────────────────────
const draft = ref<Set<string>>(new Set())
const search = ref('')

watch(open, (isOpen) => {
  if (isOpen) {
    draft.value = new Set(modelValue.value ?? [])
    search.value = ''
  }
})

// ── Filtering: keep parents whose label OR any descendant label matches ────
const searchLower = computed(() => search.value.trim().toLowerCase())

function matches(o: HierarchyOption): boolean {
  if (!searchLower.value) return true
  if (o.label.toLowerCase().includes(searchLower.value)) return true
  if (o.children?.some(matches)) return true
  return false
}

function filterTree(opts: HierarchyOption[]): HierarchyOption[] {
  return opts
    .filter(matches)
    .map(o => o.children?.length
      ? { ...o, children: filterTree(o.children) }
      : o)
}

const filteredOptions = computed(() => filterTree(props.options))

// ── Leaf-only key set per parent (for indeterminate / select-all helpers) ──
function descendantLeafKeys(o: HierarchyOption): string[] {
  if (!o.children?.length) return [o.key]
  return o.children.flatMap(descendantLeafKeys)
}

function parentState(o: HierarchyOption): 'none' | 'some' | 'all' {
  const leaves = descendantLeafKeys(o)
  const selected = leaves.filter(k => draft.value.has(k))
  if (selected.length === 0) return 'none'
  if (selected.length === leaves.length) return 'all'
  return 'some'
}

function toggleLeaf(key: string) {
  if (draft.value.has(key)) draft.value.delete(key)
  else draft.value.add(key)
  // trigger reactivity on Set
  draft.value = new Set(draft.value)
}

function toggleParent(o: HierarchyOption) {
  const leaves = descendantLeafKeys(o)
  const state = parentState(o)
  if (state === 'all') {
    leaves.forEach(k => draft.value.delete(k))
  } else {
    leaves.forEach(k => draft.value.add(k))
  }
  draft.value = new Set(draft.value)
}

function clearAll() { draft.value = new Set() }

function selectAllVisible() {
  const visibleLeaves = filteredOptions.value.flatMap(descendantLeafKeys)
  visibleLeaves.forEach(k => draft.value.add(k))
  draft.value = new Set(draft.value)
}

function apply() {
  // Filter to only keys that actually exist in this hierarchy (defensive cleanup)
  const validKeys = new Set(leafKeysOf(props.options).concat(
    // also preserve parent-level keys if operator used them (flat hierarchies like LIKHA)
    props.options.filter(o => !o.children?.length).map(o => o.key),
  ))
  const cleaned = [...draft.value].filter(k => validKeys.has(k))
  modelValue.value = cleaned
  open.value = false
}

function cancel() { open.value = false }

const selectedCount = computed(() => draft.value.size)
</script>

<template>
  <v-dialog v-model="open" max-width="780" scrollable>
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center ga-2 bg-grey-lighten-4 py-3">
        <v-icon :icon="icon" :color="color" />
        <span class="text-h6 font-weight-medium">{{ title }}</span>
        <v-chip size="small" :color="color" variant="tonal" class="ml-1">
          {{ selectedCount }} selected
        </v-chip>
        <v-spacer />
        <v-btn icon="mdi-close" size="small" variant="text" @click="cancel" />
      </v-card-title>
      <v-divider />

      <div class="px-4 pt-3">
        <v-text-field
          v-model="search"
          :placeholder="searchPlaceholder"
          prepend-inner-icon="mdi-magnify"
          clearable
          density="compact"
          variant="outlined"
          hide-details
        />
      </div>

      <v-card-text style="max-height: 60vh; overflow-y: auto">
        <div v-if="filteredOptions.length === 0" class="text-center text-grey py-6">
          <v-icon size="32" color="grey-lighten-1">mdi-magnify-close</v-icon>
          <div class="text-body-2 mt-2">No options match "{{ search }}"</div>
        </div>

        <template v-else>
          <template v-for="opt in filteredOptions" :key="opt.key">
            <!-- Parent with children -->
            <template v-if="opt.children?.length">
              <div class="d-flex align-center ga-1 mt-2 mb-1">
                <v-checkbox
                  :model-value="parentState(opt) === 'all'"
                  :indeterminate="parentState(opt) === 'some'"
                  density="compact"
                  hide-details
                  :color="color"
                  @click.stop="toggleParent(opt)"
                />
                <span class="text-subtitle-2 font-weight-bold">{{ opt.label }}</span>
              </div>
              <div class="ml-6">
                <template v-for="c1 in opt.children" :key="c1.key">
                  <!-- Sub-parent with grandchildren -->
                  <template v-if="c1.children?.length">
                    <div class="d-flex align-center ga-1 mt-1 mb-1">
                      <v-checkbox
                        :model-value="parentState(c1) === 'all'"
                        :indeterminate="parentState(c1) === 'some'"
                        density="compact"
                        hide-details
                        :color="color"
                        @click.stop="toggleParent(c1)"
                      />
                      <span class="text-body-2 font-weight-medium">{{ c1.label }}</span>
                    </div>
                    <div class="ml-6">
                      <div
                        v-for="leaf in c1.children"
                        :key="leaf.key"
                        class="d-flex align-center ga-1"
                      >
                        <v-checkbox
                          :model-value="draft.has(leaf.key)"
                          density="compact"
                          hide-details
                          :color="color"
                          @click.stop="toggleLeaf(leaf.key)"
                        />
                        <span class="text-body-2">{{ leaf.label }}</span>
                      </div>
                    </div>
                  </template>
                  <!-- Direct leaf under parent -->
                  <div v-else class="d-flex align-center ga-1">
                    <v-checkbox
                      :model-value="draft.has(c1.key)"
                      density="compact"
                      hide-details
                      :color="color"
                      @click.stop="toggleLeaf(c1.key)"
                    />
                    <span class="text-body-2">{{ c1.label }}</span>
                  </div>
                </template>
              </div>
              <v-divider class="my-1" />
            </template>

            <!-- Flat leaf (no children, top-level — e.g., LIKHA) -->
            <div v-else class="d-flex align-center ga-1">
              <v-checkbox
                :model-value="draft.has(opt.key)"
                density="compact"
                hide-details
                :color="color"
                @click.stop="toggleLeaf(opt.key)"
              />
              <span class="text-body-2">{{ opt.label }}</span>
            </div>
          </template>
        </template>
      </v-card-text>

      <v-divider />
      <v-card-actions class="px-4 py-3">
        <v-btn
          variant="text"
          size="small"
          prepend-icon="mdi-close-circle-outline"
          @click="clearAll"
        >
          Clear All
        </v-btn>
        <v-btn
          variant="text"
          size="small"
          prepend-icon="mdi-checkbox-multiple-marked-outline"
          :disabled="!filteredOptions.length"
          @click="selectAllVisible"
        >
          Select All Visible
        </v-btn>
        <v-spacer />
        <v-btn variant="text" @click="cancel">Cancel</v-btn>
        <v-btn :color="color" variant="elevated" prepend-icon="mdi-check" @click="apply">
          Apply
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
