<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})
</script>

<template>
  <div>
    <h1 class="text-h4 font-weight-bold text-grey-darken-3 mb-2">
      University Operations
    </h1>
    <p class="text-subtitle-1 text-grey-darken-1 mb-6">
      Coming in Phase 3.1
    </p>
    <v-card class="pa-6 text-center">
      <v-icon icon="mdi-school" size="64" color="info" class="mb-4" />
      <p class="text-body-1">University operations management will be available in Phase 3.1</p>
    </v-card>
  </div>
</template>
