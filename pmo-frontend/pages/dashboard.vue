<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()
const api = useApi()

// Simple stats (client-side calculation per plan - analytics endpoint deferred)
const stats = ref({
  constructionProjects: 0,
  repairProjects: 0,
  universityOperations: 0,
  gadReports: 0,
})

const loading = ref(true)

onMounted(async () => {
  try {
    // Fetch counts from available endpoints
    const [construction, repairs, uniOps, gad] = await Promise.allSettled([
      api.get<{ data: unknown[] }>('/api/construction-projects'),
      api.get<{ data: unknown[] }>('/api/repair-projects'),
      api.get<{ data: unknown[] }>('/api/university-operations'),
      api.get<{ data: unknown[] }>('/api/gad-reports'),
    ])

    stats.value = {
      constructionProjects: construction.status === 'fulfilled' ? construction.value.data?.length || 0 : 0,
      repairProjects: repairs.status === 'fulfilled' ? repairs.value.data?.length || 0 : 0,
      universityOperations: uniOps.status === 'fulfilled' ? uniOps.value.data?.length || 0 : 0,
      gadReports: gad.status === 'fulfilled' ? gad.value.data?.length || 0 : 0,
    }
  } catch {
    // Silently handle errors - stats will show 0
  } finally {
    loading.value = false
  }
})

const statCards = [
  { title: 'Construction Projects', icon: 'mdi-office-building', color: 'primary', key: 'constructionProjects', to: '/projects' },
  { title: 'Repair Projects', icon: 'mdi-tools', color: 'warning', key: 'repairProjects', to: '/repairs' },
  { title: 'University Operations', icon: 'mdi-school', color: 'info', key: 'universityOperations', to: '/university-operations' },
  { title: 'GAD Reports', icon: 'mdi-gender-male-female', color: 'secondary', key: 'gadReports', to: '/gad' },
]
</script>

<template>
  <div>
    <!-- Welcome Header -->
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold text-grey-darken-3 mb-1">
        Welcome, {{ authStore.userFullName }}
      </h1>
      <p class="text-subtitle-1 text-grey-darken-1">
        Physical Planning and Management Office Dashboard
      </p>
    </div>

    <!-- Stats Cards -->
    <v-row>
      <v-col
        v-for="card in statCards"
        :key="card.key"
        cols="12"
        sm="6"
        lg="3"
      >
        <v-card
          :to="card.to"
          class="pa-4"
          :color="card.color"
          variant="tonal"
          hover
        >
          <div class="d-flex align-center">
            <v-avatar :color="card.color" size="48" class="mr-4">
              <v-icon :icon="card.icon" color="white" />
            </v-avatar>
            <div>
              <p class="text-caption text-grey-darken-1 mb-1">
                {{ card.title }}
              </p>
              <p class="text-h5 font-weight-bold">
                <v-progress-circular
                  v-if="loading"
                  :size="20"
                  :width="2"
                  indeterminate
                />
                <span v-else>{{ stats[card.key as keyof typeof stats] }}</span>
              </p>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Actions -->
    <v-card class="mt-6 pa-4">
      <h2 class="text-h6 font-weight-bold mb-4">Quick Actions</h2>
      <v-row>
        <v-col cols="12" md="6">
          <v-btn
            to="/projects"
            color="primary"
            variant="outlined"
            block
            size="large"
            prepend-icon="mdi-plus"
          >
            View Construction Projects
          </v-btn>
        </v-col>
        <v-col cols="12" md="6">
          <v-btn
            to="/repairs"
            color="warning"
            variant="outlined"
            block
            size="large"
            prepend-icon="mdi-tools"
          >
            View Repair Projects
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>
