<template>
  <v-tooltip :text="tooltipText" location="top">
    <template #activator="{ props: tp }">
      <v-btn
        v-bind="tp"
        :icon="iconOnly"
        :size="size"
        :color="isValid ? color : 'grey-darken-1'"
        variant="text"
        @click="handleClick"
      >
        <v-icon :size="iconOnly ? undefined : 'x-small'">{{ isFile ? 'mdi-paperclip' : 'mdi-link-variant' }}</v-icon>
        <template v-if="!iconOnly">{{ label }}</template>
      </v-btn>
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
import { useMovSafe } from '~/composables/useMovSafe'

const props = withDefaults(defineProps<{
  url?: string | null
  isFile?: boolean
  iconOnly?: boolean
  size?: string
  color?: string
  label?: string
}>(), {
  isFile: false,
  iconOnly: true,
  size: 'x-small',
  color: 'primary',
  label: 'MOV',
})

const { resolveMovState, openMovSafely, openFileSafely } = useMovSafe()

const isValid = computed(() => resolveMovState(props.url) === 'valid')

const tooltipText = computed(() => {
  if (!props.url || !props.url.trim()) return 'No MOV provided'
  if (resolveMovState(props.url) === 'invalid') return 'Invalid MOV link'
  const trimmed = props.url.trim()
  return trimmed.length > 60 ? trimmed.slice(0, 57) + '…' : trimmed
})

function handleClick() {
  if (props.isFile) {
    openFileSafely(props.url)
  } else {
    openMovSafely(props.url)
  }
}
</script>
