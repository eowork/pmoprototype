<script setup lang="ts">
interface PublicProject {
  id: string
  status?: string | null
}

const api = useApi()

const total = ref(0)
const ongoing = ref(0)
const completed = ref(0)
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await api.get<{ data: PublicProject[] }>(
      '/api/public/construction-projects?publication_status=PUBLISHED',
    )
    const list = response.data || []
    total.value = list.length
    ongoing.value = list.filter(p => (p.status || '').toUpperCase() === 'ONGOING').length
    completed.value = list.filter(p => (p.status || '').toUpperCase() === 'COMPLETED').length
  } catch {
    // Public stats are non-critical; leave at zero on failure
  } finally {
    loading.value = false
  }
})

const tiles = computed(() => [
  { label: 'Total Published Projects', value: total.value, icon: 'mdi-clipboard-list-outline' },
  { label: 'Ongoing', value: ongoing.value, icon: 'mdi-progress-clock' },
  { label: 'Completed', value: completed.value, icon: 'mdi-check-circle-outline' },
])
</script>

<template>
  <div class="py-12" style="background-color: rgb(var(--v-theme-figma-surface));">
    <v-container>
      <div class="text-center mb-8">
        <h2 class="text-h4 font-weight-bold text-figma-primary mb-2">Public Snapshot</h2>
        <p class="text-subtitle-1 text-figma-muted">
          Live counts from PMO-published infrastructure data.
        </p>
      </div>
      <v-row dense>
        <v-col
          v-for="tile in tiles"
          :key="tile.label"
          cols="12"
          md="4"
        >
          <v-card class="pa-6 text-center" variant="elevated">
            <v-icon :icon="tile.icon" size="40" color="figma-accent" class="mb-3" />
            <div class="text-h3 font-weight-bold text-figma-primary">
              <v-progress-circular
                v-if="loading"
                :size="32"
                :width="3"
                indeterminate
                color="figma-primary"
              />
              <span v-else>{{ tile.value }}</span>
            </div>
            <div class="text-subtitle-2 text-figma-muted mt-1">{{ tile.label }}</div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
