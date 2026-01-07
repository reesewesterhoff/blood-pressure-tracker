<script setup lang="ts">
import { computed } from 'vue'
import LoadingSpinner from '@/components/spinner/LoadingSpinner.vue'
import type { BloodPressureReading } from '@/types/BloodPressure'

interface Props {
  readings: BloodPressureReading[]
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

function getBloodPressureStatus(
  systolic: number,
  diastolic: number,
): {
  label: string
  class: string
} {
  // Normal: <=120/<=80
  // Elevated: 120-129/<80
  // Stage 1 HTN: 130-139/80-89
  // Stage 2 HTN: >=140/>=90
  if (systolic <= 120 && diastolic <= 80) {
    return {
      label: 'Normal',
      class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    }
  } else if (systolic >= 120 && systolic <= 129 && diastolic <= 80) {
    return {
      label: 'Elevated',
      class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    }
  } else {
    return {
      label: 'High',
      class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }
  }
}

function formatDate(date: string | Date | undefined): string {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString()
}

const hasReadings = computed(() => props.readings.length > 0)
</script>

<template>
  <div class="flex justify-center h-full">
    <div
      class="w-full max-w-xl p-10 rounded-xl bg-white dark:bg-neutral-800 shadow-lg flex flex-col gap-6 h-full"
    >
      <h1 class="text-2xl text-center text-neutral-900 dark:text-neutral-100">
        Blood Pressure History
      </h1>
      <div class="flex-1 space-y-2.5 overflow-y-auto min-h-0">
        <!-- Loading state -->
        <div v-if="isLoading" class="flex justify-center items-center py-6">
          <LoadingSpinner size="lg" />
        </div>

        <!-- Reading items -->
        <div
          v-else-if="hasReadings"
          v-for="reading in readings"
          :key="reading._id"
          class="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 shrink-0"
        >
          <div class="grid grid-cols-3 gap-2 items-center">
            <div class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {{ reading.systolic }}/{{ reading.diastolic }}
            </div>
            <div class="text-sm text-neutral-500 dark:text-neutral-300 text-center">
              {{ formatDate(reading.recordedAt) }}
            </div>
            <div class="flex justify-end">
              <div
                class="px-3 py-1 rounded-full text-xs font-medium w-20 text-center"
                :class="getBloodPressureStatus(reading.systolic, reading.diastolic).class"
              >
                {{ getBloodPressureStatus(reading.systolic, reading.diastolic).label }}
              </div>
            </div>
          </div>
        </div>

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
