<template>
  <v-app>
    <v-app-bar flat border="b" height="56">
      <v-app-bar-title>
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-hammer-wrench" color="warning" size="small" />
          <span class="text-subtitle-1 font-weight-medium">CSU Infrastructure Portal</span>
          <v-chip size="x-small" color="warning" variant="tonal">Contractor</v-chip>
        </div>
      </v-app-bar-title>
      <template #append>
        <v-btn
          v-if="contractorAuth.isAuthenticated"
          variant="text"
          size="small"
          prepend-icon="mdi-logout"
          @click="contractorAuth.logout"
        >
          Sign Out
        </v-btn>
      </template>
    </v-app-bar>

    <v-main>
      <v-container max-width="520" class="py-8">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
const contractorAuth = useContractorAuthStore()
</script>
