<template>
  <v-card class="mb-4" variant="outlined">
    <v-card-title class="d-flex align-center py-3">
      <v-icon :color="pillarConfig.color" class="mr-2">{{ pillarConfig.icon }}</v-icon>
      {{ pillarName }} Summary - FY {{ fiscalYear }}
    </v-card-title>

    <v-divider />

    <v-card-text>
      <v-row>
        <v-col cols="6" sm="3">
          <div class="text-subtitle-2 text-grey-darken-1">Total Target</div>
          <div class="text-h5 font-weight-bold">{{ formatNumber(totalTarget) }}</div>
        </v-col>

        <v-col cols="6" sm="3">
          <div class="text-subtitle-2 text-grey-darken-1">Total Actual</div>
          <div class="text-h5 font-weight-bold" :class="actualColor">
            {{ formatNumber(totalAccomplishment) }}
          </div>
        </v-col>

        <v-col cols="6" sm="3">
          <div class="text-subtitle-2 text-grey-darken-1">Achievement Rate</div>
          <div class="text-h5 font-weight-bold" :class="rateColor">
            {{ accomplishmentRate.toFixed(1) }}%
          </div>
        </v-col>

        <v-col cols="6" sm="3">
          <div class="text-subtitle-2 text-grey-darken-1">Variance</div>
          <div class="text-h5 font-weight-bold" :class="varianceColor">
            {{ formatVariance(variance) }}
          </div>
        </v-col>
      </v-row>

      <!-- Progress bar -->
      <v-progress-linear
        :model-value="Math.min(accomplishmentRate, 100)"
        :color="rateColorName"
        height="8"
        class="mt-4"
        rounded
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
/**
 * Phase DW-F: Physical Summary Card Component
 *
 * Displays aggregate statistics for the current pillar:
 * - Total Target
 * - Total Actual (Accomplishment)
 * - Achievement Rate (percentage)
 * - Variance (Actual - Target)
 *
 * Color-coded to indicate performance levels.
 */

import { computed } from 'vue'

interface Props {
  pillarName: string
  pillarConfig: { color: string; icon: string }
  fiscalYear: number
  totalTarget: number
  totalAccomplishment: number
}

const props = defineProps<Props>()

const accomplishmentRate = computed(() => {
  if (props.totalTarget === 0) return 0
  return (props.totalAccomplishment / props.totalTarget) * 100
})

const variance = computed(() => {
  return props.totalAccomplishment - props.totalTarget
})

const actualColor = computed(() => {
  if (accomplishmentRate.value >= 100) return 'text-success'
  if (accomplishmentRate.value >= 80) return 'text-primary'
  if (accomplishmentRate.value >= 50) return 'text-warning'
  return 'text-error'
})

const rateColor = computed(() => {
  if (accomplishmentRate.value >= 90) return 'text-success'
  if (accomplishmentRate.value >= 70) return 'text-primary'
  if (accomplishmentRate.value >= 50) return 'text-warning'
  return 'text-error'
})

const rateColorName = computed(() => {
  if (accomplishmentRate.value >= 90) return 'success'
  if (accomplishmentRate.value >= 70) return 'primary'
  if (accomplishmentRate.value >= 50) return 'warning'
  return 'error'
})

const varianceColor = computed(() => {
  if (variance.value >= 0) return 'text-success'
  return 'text-error'
})

function formatNumber(num: number): string {
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatVariance(num: number): string {
  const sign = num >= 0 ? '+' : ''
  return `${sign}${formatNumber(num)}`
}
</script>
