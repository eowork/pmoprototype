<script setup lang="ts">
const router = useRouter()

function exploreProjects() {
  router.push('/coi/public')
}

function goToLogin() {
  router.push('/login')
}
</script>

<template>
  <v-container class="py-16">
    <v-row align="center">
      <v-col cols="12" md="8">
        <p class="text-overline text-figma-accent font-weight-medium mb-2">
          Caraga State University — PMO Dashboard
        </p>
        <h1 class="text-h2 font-weight-bold text-figma-primary mb-4">
          Transparent Infrastructure for a Stronger University
        </h1>
        <p class="text-h6 font-weight-regular text-figma-muted mb-6" style="max-width: 640px;">
          Track construction, repairs, and university operations across CSU campuses.
          Public information, updated quarterly by the Project Management Office.
        </p>
        <div class="d-flex flex-wrap ga-3">
          <v-btn
            color="figma-primary"
            size="large"
            prepend-icon="mdi-office-building-outline"
            @click="exploreProjects"
          >
            Explore Projects
          </v-btn>
          <v-btn
            variant="outlined"
            color="figma-primary"
            size="large"
            prepend-icon="mdi-login"
            @click="goToLogin"
          >
            Staff Sign In
          </v-btn>
        </div>
      </v-col>
      <v-col cols="12" md="4" class="d-none d-md-flex justify-center">
        <v-icon icon="mdi-domain" size="220" color="figma-accent" />
      </v-col>
    </v-row>
  </v-container>
</template>
