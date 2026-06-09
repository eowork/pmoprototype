<script setup lang="ts">
const authStore = useAuthStore()

definePageMeta({
  layout: 'blank',
})

const checked = ref(false)

if (import.meta.client) {
  if (authStore.isAuthenticated) {
    navigateTo('/dashboard', { replace: true })
  } else {
    checked.value = true
  }
}
</script>

<template>
  <div v-if="checked && !authStore.isAuthenticated">
    <PublicHero />
    <PublicCategoryShowcase />
    <PublicStatsOverview />
  </div>
</template>
