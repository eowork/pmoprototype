<script setup lang="ts">
// Root app component - Nuxt 3
</script>

<template>
  <v-app>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastContainer />
  </v-app>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

:root {
  font-family: 'Poppins', sans-serif;
}

body {
  margin: 0;
  font-family: 'Poppins', sans-serif;
}

/* Toast notification positioning - ensure visibility at top */
.Toastify__toast-container {
  position: fixed !important;
  top: 20px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  z-index: 9999 !important;
  width: auto !important;
  min-width: 320px !important;
  max-width: 500px !important;
}

.Toastify__toast {
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

/* Phase HS-1: Global table header branding — CSU Emerald */
.v-data-table thead th {
  background-color: #003300 !important;
  color: white !important;
}
.v-data-table thead th .v-icon,
.v-data-table thead th .v-data-table__th-sort-icon {
  color: white !important;
}
</style>
