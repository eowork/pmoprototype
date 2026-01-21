<script setup lang="ts">
const router = useRouter()
const authStore = useAuthStore()
const drawer = ref(true)

const navigationItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/dashboard' },
  { title: 'Construction Projects', icon: 'mdi-office-building', to: '/projects' },
  { title: 'Repair Projects', icon: 'mdi-tools', to: '/repairs' },
  { title: 'University Operations', icon: 'mdi-school', to: '/university-operations' },
  { title: 'GAD Parity', icon: 'mdi-gender-male-female', to: '/gad' },
]

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
        PMO Dashboard
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
          <v-list-item prepend-icon="mdi-account" :title="authStore.userEmail" />
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
      <!-- Logo -->
      <div class="pa-4 text-center">
        <v-img
          src="/csu-logo.svg"
          alt="CSU Logo"
          height="60"
          class="mx-auto mb-2"
        />
        <p class="text-caption text-grey-darken-1">
          Caraga State University
        </p>
      </div>

      <v-divider />

      <!-- Navigation Items -->
      <v-list nav density="comfortable">
        <v-list-item
          v-for="item in navigationItems"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          color="primary"
          rounded="lg"
          class="mb-1"
        />
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container fluid class="pa-4">
        <slot />
      </v-container>
    </v-main>
  </div>
</template>
