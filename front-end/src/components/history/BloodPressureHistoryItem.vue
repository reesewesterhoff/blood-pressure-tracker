<script setup lang="ts">
import BloodPressureStatusChip from '@/components/chips/BloodPressureStatusChip.vue'
import type { BloodPressureReading } from '@/types/BloodPressure'

interface Props {
  reading: BloodPressureReading
}

defineProps<Props>()

function formatDate(date: string | Date | undefined): string {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString()
}
</script>

<template>
  <div
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
        <BloodPressureStatusChip
          :systolic="reading.systolic"
          :diastolic="reading.diastolic"
          size="sm"
        />
      </div>
    </div>
  </div>
</template>
