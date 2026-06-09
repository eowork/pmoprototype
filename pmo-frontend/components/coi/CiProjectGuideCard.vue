<script setup lang="ts">
/**
 * KD-B: Reusable dismissible guide card for COI pages.
 * Persists dismiss state in localStorage under key `coi.guide.dismissed.<pageKey>`.
 */
interface Props {
  pageKey: string
  title: string
  content: string[]
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'mdi-information-outline',
})

const STORAGE_PREFIX = 'coi.guide.dismissed.'
const visible = ref(true)

function readDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_PREFIX + props.pageKey) === '1'
  } catch {
    return false
  }
}

function dismiss() {
  try {
    localStorage.setItem(STORAGE_PREFIX + props.pageKey, '1')
  } catch {}
  visible.value = false
}

onMounted(() => {
  visible.value = !readDismissed()
})
</script>

<template>
  <v-expand-transition>
    <v-alert
      v-if="visible"
      :icon="icon"
      type="info"
      variant="tonal"
      density="comfortable"
      closable
      class="mb-3"
      @click:close="dismiss"
    >
      <div class="font-weight-medium mb-1">{{ title }}</div>
      <ul class="pl-4 ma-0">
        <li v-for="(line, i) in content" :key="i" class="text-body-2">{{ line }}</li>
      </ul>
      <div class="mt-2">
        <v-btn size="x-small" variant="text" color="info" @click="dismiss">
          Got it, hide this
        </v-btn>
      </div>
    </v-alert>
  </v-expand-transition>
</template>
