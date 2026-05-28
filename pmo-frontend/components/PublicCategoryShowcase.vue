<script setup lang="ts">
const router = useRouter()

const categories = [
  {
    key: 'coi',
    icon: 'mdi-office-building',
    title: 'Construction of Infrastructure',
    description: 'Published construction projects across all CSU campuses — funded, ongoing, and completed.',
    cta: 'View Projects',
    to: '/coi/public',
    enabled: true,
  },
  {
    key: 'uo',
    icon: 'mdi-school',
    title: 'University Operations',
    description: 'Quarterly accomplishments across the four operational pillars of the University.',
    cta: 'Coming Soon',
    to: '',
    enabled: false,
  },
  {
    key: 'gad',
    icon: 'mdi-gender-male-female',
    title: 'GAD Parity',
    description: 'Gender and Development reporting on parity across programs, units, and constituencies.',
    cta: 'Coming Soon',
    to: '',
    enabled: false,
  },
]

function navigate(to: string, enabled: boolean) {
  if (!enabled || !to) return
  router.push(to)
}
</script>

<template>
  <v-container class="py-12">
    <div class="text-center mb-8">
      <h2 class="text-h4 font-weight-bold text-figma-primary mb-2">Browse by Category</h2>
      <p class="text-subtitle-1 text-figma-muted">
        Explore the public information published by the PMO across reporting modules.
      </p>
    </div>
    <v-row dense>
      <v-col
        v-for="category in categories"
        :key="category.key"
        cols="12"
        md="4"
      >
        <v-card
          :hover="category.enabled"
          :disabled="!category.enabled"
          class="h-100 d-flex flex-column"
          variant="outlined"
          @click="navigate(category.to, category.enabled)"
        >
          <v-card-item>
            <template #prepend>
              <v-avatar color="figma-accent" size="48" variant="tonal">
                <v-icon :icon="category.icon" />
              </v-avatar>
            </template>
            <v-card-title class="text-figma-primary">{{ category.title }}</v-card-title>
          </v-card-item>
          <v-card-text class="flex-grow-1 text-figma-muted">
            {{ category.description }}
          </v-card-text>
          <v-card-actions>
            <v-btn
              :color="category.enabled ? 'figma-primary' : undefined"
              :variant="category.enabled ? 'text' : 'plain'"
              :append-icon="category.enabled ? 'mdi-arrow-right' : undefined"
            >
              {{ category.cta }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
