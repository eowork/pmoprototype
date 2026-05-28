<template>
  <v-card class="h-100" style="min-height: 480px">
    <v-card-title class="d-flex align-center ga-1 pb-1">
      <v-icon size="small" color="primary">mdi-calendar-today</v-icon>
      <!-- LT-C: Title reflects state — selected date or "Latest Records" -->
      <span class="text-body-1 font-weight-medium">
        {{ selectedDate ? formatDisplayDate(selectedDate) : 'Latest Records' }}
      </span>
      <v-spacer />
      <v-btn
        v-if="selectedDate"
        icon="mdi-close"
        size="x-small"
        variant="text"
        title="Clear selection"
        @click="emit('close')"
      />
    </v-card-title>
    <v-divider />

    <!-- LT-B: Default state — show most recent records when no date selected -->
    <template v-if="!selectedDate">
      <!-- Milestones section -->
      <div class="d-flex align-center justify-space-between px-3 pt-3 pb-1">
        <div class="d-flex align-center ga-1">
          <v-icon size="x-small" color="primary">mdi-flag-checkered</v-icon>
          <span class="text-caption font-weight-bold text-uppercase text-grey-darken-1">Upcoming Milestones</span>
          <v-chip size="x-small" variant="tonal" color="primary" class="ml-1">{{ defaultMilestones.length }}</v-chip>
        </div>
      </div>
      <div style="max-height: 210px; overflow-y: auto" class="px-2 pb-2">
        <v-alert v-if="defaultMilestones.length === 0" type="info" variant="tonal" density="compact" class="ma-1">
          No milestone records available
        </v-alert>
        <v-list v-else density="compact" lines="two" class="pa-0">
          <v-list-item
            v-for="m in defaultMilestones"
            :key="m.id"
            class="mb-1 rounded"
            style="cursor: pointer"
            @click="emit('openMilestone', m)"
          >
            <template #prepend>
              <v-avatar color="primary" size="28" variant="tonal">
                <v-icon size="x-small">mdi-flag</v-icon>
              </v-avatar>
            </template>
            <v-list-item-title class="text-body-2 font-weight-medium">{{ m.title }}</v-list-item-title>
            <v-list-item-subtitle>
              <v-chip :color="getMilestoneStatusColor(m.status)" size="x-small" variant="tonal" class="mr-1">{{ m.status }}</v-chip>
              <span class="text-caption text-grey">{{ m.targetDate ? m.targetDate.toString().slice(0, 10) : '' }}</span>
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </div>

      <v-divider class="my-1" />

      <!-- Work Logs section -->
      <div class="d-flex align-center justify-space-between px-3 pt-2 pb-1">
        <div class="d-flex align-center ga-1">
          <v-icon size="x-small" color="info">mdi-calendar-text</v-icon>
          <span class="text-caption font-weight-bold text-uppercase text-grey-darken-1">Recent Work Logs</span>
          <v-chip size="x-small" variant="tonal" color="info" class="ml-1">{{ defaultWorkLogs.length }}</v-chip>
        </div>
      </div>
      <div style="max-height: 210px; overflow-y: auto" class="px-2 pb-2">
        <v-alert v-if="defaultWorkLogs.length === 0" type="info" variant="tonal" density="compact" class="ma-1">
          No work log records available
        </v-alert>
        <v-list v-else density="compact" lines="two" class="pa-0">
          <v-list-item
            v-for="e in defaultWorkLogs"
            :key="e.id"
            class="mb-1 rounded"
            style="cursor: pointer"
            @click="emit('openWorkLog', e)"
          >
            <template #prepend>
              <v-avatar color="info" size="28" variant="tonal">
                <v-icon size="x-small">mdi-calendar-text</v-icon>
              </v-avatar>
            </template>
            <v-list-item-title class="text-body-2 font-weight-medium">{{ e.title || 'Work Period' }}</v-list-item-title>
            <v-list-item-subtitle>
              <v-chip :color="getWorkLogColor(e.entryType)" size="x-small" variant="tonal" class="mr-1">{{ e.entryType }}</v-chip>
              <span class="text-caption text-grey">{{ e.entryDate }}</span>
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </div>
      <v-card-text class="text-center text-caption text-grey pt-0 pb-2">
        <v-icon size="x-small">mdi-calendar-cursor</v-icon> Click a calendar date to filter records
      </v-card-text>
    </template>

    <!-- Date-selected state -->
    <template v-else>
      <!-- Milestones section -->
      <div class="d-flex align-center justify-space-between px-3 pt-3 pb-1">
        <div class="d-flex align-center ga-1">
          <v-icon size="x-small" color="primary">mdi-flag-checkered</v-icon>
          <span class="text-caption font-weight-bold text-uppercase text-grey-darken-1">Milestones</span>
          <v-chip size="x-small" variant="tonal" color="primary" class="ml-1">{{ milestones.length }}</v-chip>
        </div>
        <v-btn
          v-if="milestones.length > 0"
          icon="mdi-fullscreen"
          size="x-small"
          variant="text"
          color="primary"
          title="View all milestones"
          @click="emit('fullscreenMilestones')"
        />
      </div>
      <div style="max-height: 220px; overflow-y: auto" class="px-2 pb-2">
        <v-alert v-if="milestones.length === 0" type="info" variant="tonal" density="compact" class="ma-1">
          No milestones for this date
        </v-alert>
        <v-list v-else density="compact" lines="two" class="pa-0">
          <v-list-item
            v-for="m in milestones"
            :key="m.id"
            class="mb-1 rounded"
            style="cursor: pointer"
            @click="emit('openMilestone', m)"
          >
            <template #prepend>
              <v-avatar color="primary" size="28" variant="tonal">
                <v-icon size="x-small">mdi-flag</v-icon>
              </v-avatar>
            </template>
            <v-list-item-title class="text-body-2 font-weight-medium">{{ m.title }}</v-list-item-title>
            <v-list-item-subtitle>
              <v-chip :color="getMilestoneStatusColor(m.status)" size="x-small" variant="tonal" class="mr-1">{{ m.status }}</v-chip>
              <span v-if="typeof m.progress === 'number'" class="text-caption text-grey">{{ m.progress }}%</span>
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </div>

      <v-divider class="my-1" />

      <!-- Work Logs section -->
      <div class="d-flex align-center justify-space-between px-3 pt-2 pb-1">
        <div class="d-flex align-center ga-1">
          <v-icon size="x-small" color="info">mdi-calendar-text</v-icon>
          <span class="text-caption font-weight-bold text-uppercase text-grey-darken-1">Work Log</span>
          <v-chip size="x-small" variant="tonal" color="info" class="ml-1">{{ workLogs.length }}</v-chip>
        </div>
        <v-btn
          v-if="workLogs.length > 0"
          icon="mdi-fullscreen"
          size="x-small"
          variant="text"
          color="info"
          title="View all work log entries"
          @click="emit('fullscreenWorkLogs')"
        />
      </div>
      <div style="max-height: 220px; overflow-y: auto" class="px-2 pb-2">
        <v-alert v-if="workLogs.length === 0" type="info" variant="tonal" density="compact" class="ma-1">
          No work log entries for this date
        </v-alert>
        <v-list v-else density="compact" lines="two" class="pa-0">
          <v-list-item
            v-for="e in workLogs"
            :key="e.id"
            class="mb-1 rounded"
            style="cursor: pointer"
            @click="emit('openWorkLog', e)"
          >
            <template #prepend>
              <v-avatar color="info" size="28" variant="tonal">
                <v-icon size="x-small">mdi-calendar-text</v-icon>
              </v-avatar>
            </template>
            <v-list-item-title class="text-body-2 font-weight-medium">{{ e.title || 'Work Period' }}</v-list-item-title>
            <v-list-item-subtitle>
              <v-chip :color="getWorkLogColor(e.entryType)" size="x-small" variant="tonal" class="mr-1">{{ e.entryType }}</v-chip>
              <span v-if="e.periodLabel" class="text-caption text-grey">{{ e.periodLabel }}</span>
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </div>
    </template>
  </v-card>
</template>

<script setup lang="ts">
// LT-A: added defaultMilestones and defaultWorkLogs props
defineProps<{
  milestones: any[]
  workLogs: any[]
  selectedDate: string
  defaultMilestones?: any[]
  defaultWorkLogs?: any[]
}>()

const emit = defineEmits<{
  openMilestone: [m: any]
  openWorkLog: [e: any]
  fullscreenMilestones: []
  fullscreenWorkLogs: []
  close: []
}>()

function formatDisplayDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-PH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
}

function getMilestoneStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'grey', IN_PROGRESS: 'primary', COMPLETED: 'success', DELAYED: 'error', CANCELLED: 'warning',
  }
  return map[status] ?? 'grey'
}

function getWorkLogColor(entryType: string): string {
  const map: Record<string, string> = {
    DAILY: 'info', WEEKLY: 'primary', MONTHLY: 'success', QUARTERLY: 'warning',
  }
  return map[entryType] ?? 'grey'
}
</script>
