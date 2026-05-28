<script setup lang="ts">
/**
 * KD-B: Scroll-to-top FAB. Visible when window scrollY > 300.
 */
const visible = ref(false)

function onScroll() {
  visible.value = (typeof window !== 'undefined' && window.scrollY > 300)
}

function scrollToTop() {
  if (typeof window === 'undefined') return
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  if (typeof window === 'undefined') return
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <v-btn
    v-if="visible"
    icon="mdi-chevron-up"
    color="primary"
    variant="elevated"
    size="default"
    class="coi-scroll-fab"
    aria-label="Scroll to top"
    @click="scrollToTop"
  />
</template>

<style scoped>
.coi-scroll-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1100;
}
</style>
