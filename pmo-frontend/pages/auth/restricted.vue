<script setup lang="ts">
// PHASE BBBD (Track 4, R-327): branded OAuth-restricted page. The backend OAuthFailureFilter
// redirects here when a non-@carsu.edu.ph account is rejected (instead of raw 401 JSON).
definePageMeta({
  layout: 'blank',
})

useHead({ style: [{ innerHTML: 'html, body { overflow-x: hidden; max-width: 100%; }' }] })
</script>

<template>
  <div class="restricted-wrap">
    <v-card class="restricted-card pa-8 text-center" elevation="3" rounded="lg" max-width="440">
      <v-img src="/csu-logo.svg" alt="Caraga State University" height="64" class="mx-auto mb-4" />

      <v-icon color="warning" size="48" class="mb-2">mdi-account-lock-outline</v-icon>
      <h1 class="text-h6 font-weight-bold mb-2">Access Restricted</h1>
      <p class="text-body-2 text-medium-emphasis mb-1">
        Only Caraga State University accounts
        (<strong>&#64;carsu.edu.ph</strong>) may sign in.
      </p>
      <p class="text-body-2 text-medium-emphasis mb-6">
        Please switch to your institutional account and try again.
      </p>

      <div class="d-flex flex-column ga-2">
        <v-btn color="primary" variant="flat" block to="/login">Sign In Again</v-btn>
        <v-btn variant="text" block to="/">Return Home</v-btn>
      </div>

      <p class="text-caption text-medium-emphasis mt-6">
        &copy; {{ new Date().getFullYear() }} Caraga State University &bull; All Rights Reserved
      </p>
    </v-card>
  </div>
</template>

<style scoped>
.restricted-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #e8f0fe 0%, #f5f7fa 100%);
}
.restricted-card {
  width: 100%;
}
</style>
