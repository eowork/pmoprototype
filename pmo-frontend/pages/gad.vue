<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const router = useRouter()

// Navigation cards for GAD modules
const gadModules = [
  {
    title: 'Student Parity',
    subtitle: 'Track student gender distribution by program',
    icon: 'mdi-school',
    color: 'primary',
    route: '/gad/student',
  },
  {
    title: 'Faculty Parity',
    subtitle: 'Monitor faculty gender balance by college',
    icon: 'mdi-human-male-board',
    color: 'secondary',
    route: '/gad/faculty',
  },
  {
    title: 'Staff Parity',
    subtitle: 'Track staff gender distribution by department',
    icon: 'mdi-account-group',
    color: 'info',
    route: '/gad/staff',
  },
  {
    title: 'PWD Parity',
    subtitle: 'Track persons with disability beneficiaries',
    icon: 'mdi-wheelchair-accessibility',
    color: 'warning',
    route: '/gad/pwd',
  },
  {
    title: 'Indigenous Parity',
    subtitle: 'Monitor indigenous peoples participation',
    icon: 'mdi-account-heart',
    color: 'success',
    route: '/gad/indigenous',
  },
  {
    title: 'GPB Accomplishments',
    subtitle: 'Gender and Development Plan accomplishments',
    icon: 'mdi-chart-bar',
    color: 'purple',
    route: '/gad/gpb',
  },
  {
    title: 'Budget Plans',
    subtitle: 'GAD budget allocation and utilization',
    icon: 'mdi-cash-multiple',
    color: 'teal',
    route: '/gad/budget',
  },
]

function navigateTo(route: string) {
  router.push(route)
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold text-grey-darken-3">
        GAD Parity Reports
      </h1>
      <p class="text-subtitle-1 text-grey-darken-1">
        Gender and Development compliance tracking and reporting
      </p>
    </div>

    <!-- Module Cards -->
    <v-row>
      <v-col
        v-for="module in gadModules"
        :key="module.route"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card
          class="h-100"
          hover
          @click="navigateTo(module.route)"
        >
          <v-card-text class="d-flex flex-column align-center text-center pa-6">
            <v-avatar :color="module.color" size="64" class="mb-4">
              <v-icon :icon="module.icon" size="32" color="white" />
            </v-avatar>
            <h3 class="text-h6 font-weight-bold mb-2">{{ module.title }}</h3>
            <p class="text-body-2 text-grey">{{ module.subtitle }}</p>
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-btn
              :color="module.color"
              variant="tonal"
              block
              append-icon="mdi-arrow-right"
            >
              View Reports
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
