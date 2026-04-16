<script setup lang="ts">
import { useDisplay } from 'vuetify'

const router = useRouter()
const authStore = useAuthStore()
const { canAccessAdmin, canManageUsers, canAccessModule, currentRole, isSuperAdmin } = usePermissions()

// Responsive drawer - closed on mobile, open on desktop
const { mdAndUp } = useDisplay()
const drawer = ref(mdAndUp.value)

// Dropdown expand states - persist in localStorage
const referenceDataOpen = ref(false)
const administrationOpen = ref(false)

// Initialize states from localStorage
onMounted(() => {
  if (import.meta.client) {
    // Drawer state: use saved preference if exists, otherwise use screen size default
    const savedDrawer = localStorage.getItem('sidebar_drawer')
    if (savedDrawer !== null) {
      drawer.value = savedDrawer === 'true'
    }
    // Dropdown states
    referenceDataOpen.value = localStorage.getItem('sidebar_referenceData') === 'true'
    administrationOpen.value = localStorage.getItem('sidebar_administration') === 'true'
  }
})

// Watch and persist drawer state
watch(drawer, (val) => {
  if (import.meta.client) {
    localStorage.setItem('sidebar_drawer', String(val))
  }
})

// Watch and persist expand states
watch(referenceDataOpen, (val) => {
  if (import.meta.client) {
    localStorage.setItem('sidebar_referenceData', String(val))
  }
})

watch(administrationOpen, (val) => {
  if (import.meta.client) {
    localStorage.setItem('sidebar_administration', String(val))
  }
})

// Main operational modules - filtered by user permissions
const mainModules = computed(() => {
  const allModules = [
    { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/dashboard', key: 'dashboard' },
    { title: 'Infrastructure Projects', icon: 'mdi-office-building', to: '/coi', key: 'coi' },
    { title: 'Repair Projects', icon: 'mdi-tools', to: '/repairs', key: 'repairs' },
    { title: 'University Operations', icon: 'mdi-school', to: '/university-operations', key: 'university_operations' },
    { title: 'GAD Parity', icon: 'mdi-gender-male-female', to: '/gad', key: 'gad' },
  ]

  return allModules.filter(m => {
    // Dashboard always visible
    if (m.key === 'dashboard') return true
    // GAD not yet in permission system, always show
    if (m.key === 'gad') return true
    // Check module access
    return canAccessModule(m.key)
  })
})

// Reference data management - filtered by user permissions
const referenceData = computed(() => {
  const allReferenceData = [
    { title: 'Contractors', icon: 'mdi-account-hard-hat', to: '/contractors', key: 'contractors' },
    { title: 'Funding Sources', icon: 'mdi-cash-multiple', to: '/funding-sources', key: 'funding_sources' },
  ]

  return allReferenceData.filter(m => canAccessModule(m.key))
})

// Check if any reference data modules are accessible
const hasReferenceDataAccess = computed(() => referenceData.value.length > 0)

// Administration - only visible to users with admin access
const administration = computed(() => {
  const items: Array<{ title: string; icon: string; to: string }> = []
  // Pending Reviews - Admin can review submissions
  if (canAccessAdmin.value) {
    items.push({ title: 'Pending Reviews', icon: 'mdi-clipboard-check-outline', to: '/admin/pending-reviews' })
  }
  // User Management
  if (canManageUsers.value) {
    items.push({ title: 'User Management', icon: 'mdi-account-group', to: '/users' })
  }
  return items
})

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div>
    <!-- App Bar -->
    <v-app-bar color="primary" elevation="2">
      <v-app-bar-nav-icon @click="drawer = !drawer" />

      <v-toolbar-title class="font-weight-bold">
        CSU CORE Dashboard
      </v-toolbar-title>

      <v-spacer />

      <!-- User Menu -->
      <v-menu>
        <template #activator="{ props }">
          <v-btn v-bind="props" variant="text">
            <v-avatar color="secondary" size="32" class="mr-2">
              <span class="text-caption font-weight-bold text-primary">
                {{ authStore.userFullName?.charAt(0) || 'U' }}
              </span>
            </v-avatar>
            <span class="d-none d-sm-inline">{{ authStore.userFullName }}</span>
            <v-icon end>mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list density="compact">
          <v-list-item prepend-icon="mdi-account" :title="authStore.userEmail">
            <template #subtitle>
              <v-chip
                size="x-small"
                :color="isSuperAdmin ? 'purple' : 'primary'"
                variant="tonal"
                class="mt-1"
              >
                {{ currentRole }}
              </v-chip>
            </template>
          </v-list-item>
          <v-divider />
          <v-list-item
            prepend-icon="mdi-logout"
            title="Logout"
            @click="handleLogout"
          />
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" elevation="1">
      <!-- Logo Header - Horizontal Layout -->
      <div class="d-flex align-center pa-3 ga-2">
        <v-img
          src="/csu-logo.svg"
          alt="CSU Logo"
          width="44"
          height="44"
          class="flex-shrink-0"
        />
        <span class="font-weight-bold text-grey-darken-2 text-align-left sidebar-header-text">
        Caraga State University
        </span>
      </div>

      <v-divider />

      <!-- Main Modules -->
      <v-list nav density="comfortable">
        <v-list-subheader>MODULES</v-list-subheader>
        <v-list-item
          v-for="item in mainModules"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          color="primary"
          rounded="lg"
          class="mb-1"
        />
      </v-list>

      <!-- Reference Data (Collapsible Dropdown) - Only show if user has access -->
      <template v-if="hasReferenceDataAccess">
        <v-divider class="my-2" />
        <v-list nav density="comfortable">
          <v-list-group v-model="referenceDataOpen" value="referenceData">
            <template #activator="{ props }">
              <v-list-item
                v-bind="props"
                prepend-icon="mdi-database"
                title="References"
                color="primary"
              />
            </template>
            <v-list-item
              v-for="item in referenceData"
              :key="item.to"
              :to="item.to"
              :prepend-icon="item.icon"
              :title="item.title"
              color="primary"
              rounded="lg"
              class="mb-1"
            />
          </v-list-group>
        </v-list>
      </template>

      <!-- Administration (SuperAdmin only, Collapsible Dropdown) -->
      <template v-if="canAccessAdmin">
        <v-divider class="my-2" />
        <v-list nav density="comfortable">
          <v-list-group v-model="administrationOpen" value="administration">
            <template #activator="{ props }">
              <v-list-item
                v-bind="props"
                prepend-icon="mdi-shield-account"
                title="Administration"
                color="primary"
              />
            </template>
            <v-list-item
              v-for="item in administration"
              :key="item.to"
              :to="item.to"
              :prepend-icon="item.icon"
              :title="item.title"
              color="primary"
              rounded="lg"
              class="mb-1"
            />
          </v-list-group>
        </v-list>
      </template>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container fluid class="pa-4">
        <slot />
      </v-container>
    </v-main>
  </div>
</template>

<style>
/* GLOBAL TYPOGRAPHY REDUCTION - Reduce font size by 1.5px */
/* Per research.md Section 1.3: Root font-size adjustment */
html {
  font-size: 14.5px !important;
}
</style>

<style scoped>
/* SIDEBAR HEADER - Ensure text doesn't wrap */
.sidebar-header-text {
  font-size: 0.85rem;
  line-height: 1.2;
}

/* SIDEBAR DROPDOWN NORMALIZATION - No indentation for child items */
/* Override Vuetify's default indent size to 0 for flush alignment */
:deep(.v-list-group__items) {
  --indent-padding: 0px !important;
}

/* SIDEBAR ICON GRID ALIGNMENT - Match parent and child icon positions */
/* Per research.md Section 1.2: All icons share same X-axis */
:deep(.v-list-group__items .v-list-item) {
  padding-inline-start: 16px !important;
  margin-inline-start: 0 !important;
}

/* Ensure icon containers have consistent width */
:deep(.v-navigation-drawer .v-list-item__prepend) {
  width: 24px;
  min-width: 24px;
}

/* SIDEBAR LAYOUT STABILITY - Prioritize stable layout over wrapping */
/* Per research.md Section 1.3: Use nowrap to prevent layout cascade */
:deep(.v-navigation-drawer .v-list-item-title) {
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  line-height: 1.3;
}
</style>
