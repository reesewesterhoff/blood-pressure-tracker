<script setup lang="ts">
import { computed } from 'vue'
import LoadingSpinner from '@/components/spinner/LoadingSpinner.vue'
import BloodPressureHistoryItem from './BloodPressureHistoryItem.vue'
import type { BloodPressureReading } from '@/types/BloodPressure'

interface Props {
  readings: BloodPressureReading[]
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

const hasReadings = computed(() => props.readings.length > 0)
</script>

<template>
  <div class="flex justify-center h-full">
    <div
      class="w-full max-w-xl p-10 rounded-xl bg-white dark:bg-neutral-800 shadow-lg flex flex-col gap-6 h-full"
    >
      <h2 class="text-2xl text-center text-neutral-900 dark:text-neutral-100">
        Blood Pressure History
      </h2>
      <div class="flex-1 space-y-2.5 overflow-y-auto min-h-0">
        <!-- Loading state -->
        <div v-if="isLoading" class="flex justify-center items-center py-6">
          <LoadingSpinner size="lg" />
        </div>

        <!-- Reading items -->
        <BloodPressureHistoryItem
          v-else-if="hasReadings"
          v-for="reading in readings"
          :key="reading._id"
          :reading="reading"
        />

        <!-- Empty state -->
        <div
          v-else
          class="flex justify-center items-center py-8 text-neutral-500 dark:text-neutral-400"
        >
          No readings yet. Add your first reading to get started!
        </div>
      </div>
    </div>
  </div>
</template>
