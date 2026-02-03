<script setup lang="ts">
const { toasts, remove } = useToast()

function getColor(type: string): string {
  const colors: Record<string, string> = {
    success: 'success',
    error: 'error',
    info: 'info',
    warning: 'warning',
  }
  return colors[type] || 'info'
}

function getIcon(type: string): string {
  const icons: Record<string, string> = {
    success: 'mdi-check-circle',
    error: 'mdi-alert-circle',
    info: 'mdi-information',
    warning: 'mdi-alert',
  }
  return icons[type] || 'mdi-information'
}
</script>

<template>
  <div class="toast-container">
    <v-slide-y-reverse-transition group>
      <v-alert
        v-for="toast in toasts"
        :key="toast.id"
        :type="toast.type"
        :color="getColor(toast.type)"
        :icon="getIcon(toast.type)"
        closable
        class="toast-alert mb-2"
        elevation="4"
        @click:close="remove(toast.id)"
      >
        {{ toast.message }}
      </v-alert>
    </v-slide-y-reverse-transition>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  max-width: 400px;
  width: 100%;
}

.toast-alert {
  min-width: 300px;
}
</style>
