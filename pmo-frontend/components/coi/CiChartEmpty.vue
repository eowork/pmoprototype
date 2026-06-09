<script setup lang="ts">
// OOO-J: consistent "no data" placeholder so charts never render as broken/blank.
withDefaults(defineProps<{
  icon?: string
  title?: string
  description?: string
}>(), {
  icon: 'mdi-chart-bar',
  title: 'No data available',
  description: 'Data will appear once projects are recorded.',
})
</script>

<template>
  <div class="d-flex flex-column align-center justify-center text-center py-8">
    <v-icon :icon="icon" size="48" color="grey-lighten-2" />
    <p class="text-body-2 text-grey-darken-1 mt-2 mb-0">{{ title }}</p>
    <p class="text-caption text-grey mb-0">{{ description }}</p>
  </div>
</template>
