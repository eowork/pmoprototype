<script setup lang="ts">
// ZY-2: Summary card for a repository section (Key Docs / Orders / Reports /
// Certifications / Other Forms). Shows document count, type-completion bar, latest
// upload, and action buttons. Detail lives in CiRepositoryModal (opened via @open).
// III-E: Extended with optional templateUrl, statusBreakdown, and uploaderName props.

interface StatusBreakdown {
  submitted: number
  approved: number
  rejected: number
  underReview: number
}

interface Props {
  title: string
  icon: string
  color: string
  docCount: number
  completedCount: number
  totalTypes: number
  latestUpload?: string | null
  canUpload?: boolean
  loading?: boolean
  templateUrl?: string | null
  statusBreakdown?: StatusBreakdown | null
  uploaderName?: string | null
  canDownloadTemplate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  latestUpload: null,
  canUpload: false,
  loading: false,
  templateUrl: null,
  statusBreakdown: null,
  uploaderName: null,
  canDownloadTemplate: false,
})

const emit = defineEmits<{ open: []; upload: [] }>()

const completionPct = computed(() =>
  props.totalTypes > 0 ? Math.round((props.completedCount / props.totalTypes) * 100) : 0,
)

const latestLabel = computed(() => {
  if (!props.latestUpload) return 'No uploads yet'
  const d = new Date(props.latestUpload)
  if (Number.isNaN(d.getTime())) return 'No uploads yet'
  const date = d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
  return props.uploaderName ? `${props.uploaderName} — ${date}` : `Latest: ${date}`
})
</script>

<template>
  <v-card variant="outlined" class="d-flex flex-column" style="height: 100%">
    <v-card-title class="d-flex align-center ga-2 text-body-1">
      <v-icon :icon="icon" :color="color" size="small" />
      <span class="font-weight-medium">{{ title }}</span>
      <v-spacer />
      <v-chip size="x-small" variant="tonal" :color="color">{{ docCount }}</v-chip>
    </v-card-title>
    <v-divider />
    <v-card-text class="flex-grow-1">
      <!-- Type coverage bar -->
      <div class="d-flex justify-space-between text-caption text-medium-emphasis mb-1">
        <span>Type coverage</span>
        <span>{{ completedCount }}/{{ totalTypes }}</span>
      </div>
      <v-progress-linear
        :model-value="completionPct"
        :color="color"
        height="6"
        rounded
        class="mb-2"
      />

      <!-- Status breakdown chips (III-E) -->
      <div v-if="statusBreakdown" class="d-flex flex-wrap ga-1 mb-2">
        <v-chip v-if="statusBreakdown.approved" size="x-small" color="success" variant="tonal" prepend-icon="mdi-check-circle">{{ statusBreakdown.approved }} Approved</v-chip>
        <v-chip v-if="statusBreakdown.underReview" size="x-small" color="warning" variant="tonal" prepend-icon="mdi-clock-outline">{{ statusBreakdown.underReview }} Under Review</v-chip>
        <v-chip v-if="statusBreakdown.submitted" size="x-small" color="info" variant="tonal" prepend-icon="mdi-send">{{ statusBreakdown.submitted }} Submitted</v-chip>
        <v-chip v-if="statusBreakdown.rejected" size="x-small" color="error" variant="tonal" prepend-icon="mdi-close-circle">{{ statusBreakdown.rejected }} Rejected</v-chip>
      </div>

      <!-- Template download (III-E) -->
      <div v-if="templateUrl" class="mb-2">
        <v-btn
          :href="templateUrl"
          target="_blank"
          rel="noopener"
          variant="text"
          size="x-small"
          color="indigo"
          prepend-icon="mdi-download"
        >
          Download Template
        </v-btn>
      </div>

      <!-- Latest upload line -->
      <div class="text-caption text-grey">
        <v-icon size="x-small" icon="mdi-clock-outline" /> {{ latestLabel }}
      </div>
    </v-card-text>
    <v-divider />
    <v-card-actions>
      <v-btn variant="text" size="small" :color="color" prepend-icon="mdi-folder-open-outline" @click="emit('open')">
        Open Repository
      </v-btn>
      <v-spacer />
      <v-btn
        v-if="canUpload"
        variant="tonal"
        size="small"
        :color="color"
        prepend-icon="mdi-upload"
        :loading="loading"
        @click="emit('upload')"
      >
        Upload
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
