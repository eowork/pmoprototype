<script setup lang="ts">
import { useDisplay } from 'vuetify'

const router = useRouter()
const authStore = useAuthStore()
const { canAccessAdmin, canManageUsers, canAccessModule, currentRole, isSuperAdmin, isContractor } = usePermissions()

// Responsive drawer - closed on mobile, open on desktop
const { mdAndUp } = useDisplay()
const drawer = ref(mdAndUp.value)

// Dropdown expand states - persist in localStorage
const referenceDataOpen = ref(false)

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

// Main operational modules - filtered by user permissions
const mainModules = computed(() => {
  // MMM-C: workflow-ordered — Dashboard → UO → Infrastructure → Repair → GAD
  const allModules = [
    { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/dashboard', key: 'dashboard' },
    { title: 'University Operations', icon: 'mdi-school', to: '/university-operations', key: 'university_operations' },
    { title: 'Infrastructure Projects', icon: 'mdi-office-building', to: '/coi', key: 'coi' },
    { title: 'Repair Projects', icon: 'mdi-tools', to: '/repairs', key: 'repairs' },
    { title: 'GAD Parity', icon: 'mdi-gender-male-female', to: '/gad', key: 'gad' },
  ]

  return allModules.filter(m => {
    // Dashboard always visible
    if (m.key === 'dashboard') return true
    // QA-B: GAD uses canAccessModule (contractors excluded via CONTRACTOR_ALLOWED_MODULES)
    if (m.key === 'gad') return canAccessModule('gad')
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

// NNN-E: Administration split into two role-scoped groups.
// Group 1 — Operations & Monitoring (Admin + SuperAdmin): daily operational workflows.
const operationsItems = computed(() => {
  const items: Array<{ title: string; icon: string; to: string }> = []
  if (canAccessAdmin.value) {
    items.push({ title: 'Pending Reviews', icon: 'mdi-clipboard-check-outline', to: '/admin/pending-reviews' })
    items.push({ title: 'COI Activity Logs', icon: 'mdi-history', to: '/coi/activity-logs' })
  }
  return items
})

// Group 2 — System Administration (gated by canManageUsers, SuperAdmin in practice): system setup.
const systemAdminItems = computed(() => {
  const items: Array<{ title: string; icon: string; to: string }> = []
  if (canManageUsers.value) {
    items.push({ title: 'User Management', icon: 'mdi-account-group', to: '/users' })
  }
  return items
})

const hasOperationsAccess = computed(() => operationsItems.value.length > 0)
const hasSystemAdminAccess = computed(() => systemAdminItems.value.length > 0)

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
            <!-- NNN-F: avatar image when present, else initials fallback -->
            <v-avatar color="secondary" size="32" class="mr-2">
              <v-img
                v-if="authStore.userAvatarUrl"
                :src="authStore.userAvatarUrl"
                alt="Profile"
                cover
              />
              <span v-else class="text-caption font-weight-bold text-primary">
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
          <!-- MMM-E: account navigation (hidden for contractors) -->
          <template v-if="!isContractor">
            <v-list-item
              prepend-icon="mdi-account-circle"
              title="My Profile"
              to="/profile"
            />
            <v-list-item
              prepend-icon="mdi-cog-outline"
              title="Account Settings"
              to="/profile?tab=settings"
            />
            <v-list-item
              prepend-icon="mdi-lock-reset"
              title="Change Password"
              to="/profile?tab=security"
            />
            <v-divider />
          </template>
          <v-list-item
            prepend-icon="mdi-logout"
            title="Logout"
            base-color="error"
            @click="handleLogout"
          />
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" elevation="1">
      <!-- Logo Header - Horizontal Layout
           NNN-A: logo restored to 44×44 (branding proportions preserved per Section C1);
           horizontal gap kept at me-1 (~50% reduction from original me-2). -->
      <div class="d-flex align-center px-2 py-2">
        <v-img
          src="/csu-logo.svg"
          alt="CSU Logo"
          width="44"
          height="44"
          class="flex-shrink-0 me-1"
        />
        <span class="font-weight-bold text-darken-2 sidebar-header-text">
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
          class="mb-1 ga-1"
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

      <!-- NNN-E: Operations & Monitoring (Admin + SuperAdmin) -->
      <template v-if="hasOperationsAccess">
        <v-divider class="my-2" />
        <v-list nav density="comfortable">
          <v-list-subheader>OPERATIONS &amp; MONITORING</v-list-subheader>
          <v-list-item
            v-for="item in operationsItems"
            :key="item.to"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
            color="primary"
            rounded="lg"
            class="mb-1"
          />
        </v-list>
      </template>

      <!-- NNN-E: System Administration (SuperAdmin / user-management access) -->
      <template v-if="hasSystemAdminAccess">
        <v-divider class="my-2" />
        <v-list nav density="comfortable">
          <v-list-subheader>SYSTEM ADMINISTRATION</v-list-subheader>
          <v-list-item
            v-for="item in systemAdminItems"
            :key="item.to"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
            color="primary"
            rounded="lg"
            class="mb-1"
          />
        </v-list>
      </template>
    </v-navigation-drawer>

    <!-- Main Content — NNN-B: subtle grey background so white cards visibly float -->
    <v-main class="bg-grey-lighten-5">
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
