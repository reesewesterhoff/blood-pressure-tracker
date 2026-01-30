<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LoadingSpinner from '@/components/spinner/LoadingSpinner.vue'
import BloodPressureStatusChip from '@/components/chips/BloodPressureStatusChip.vue'
import type { BloodPressureStats } from '@/types/BloodPressure'
import { readingsApi, ApiError } from '@/services/api'

const isLoading = ref(false)
const stats = ref<BloodPressureStats | null>(null)
const error = ref<string | null>(null)

async function loadAverage() {
  isLoading.value = true
  error.value = null
  try {
    const response = await readingsApi.getAverageBloodPressure()
    if (response.data) {
      stats.value = response.data
    }
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 401) {
        // User not authenticated - this is expected if not logged in
        stats.value = null
      } else {
        error.value = 'Failed to load average blood pressure.'
      }
    } else {
      error.value = 'An unexpected error occurred while loading statistics.'
      console.error('Unexpected error:', err)
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadAverage()
})

// Expose loadAverage so parent can refresh
defineExpose({
  refresh: loadAverage,
})
</script>

<template>
  <div
    class="w-full p-6 mt-4 rounded-xl bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 shadow-lg flex flex-col gap-4"
  >
    <h3 class="text-2xl text-center text-neutral-900 dark:text-neutral-100">
      Average Blood Pressure
    </h3>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center py-8">
      <LoadingSpinner size="lg" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-sm text-red-600 dark:text-red-400 py-4 text-center">
      {{ error }}
    </div>

    <!-- Stats display -->
    <div v-else-if="stats && stats.count > 0" class="space-y-4">
      <div class="flex items-center gap-4">
        <div class="flex-1">
          <div class="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Average</div>
          <div class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {{ stats.averageSystolic }}/{{ stats.averageDiastolic }}
          </div>
        </div>
        <div>
          <BloodPressureStatusChip
            :systolic="stats.averageSystolic"
            :diastolic="stats.averageDiastolic"
            size="md"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-200 dark:border-neutral-700">
        <div>
          <div class="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Systolic Range</div>
          <div class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {{ stats.minSystolic }} - {{ stats.maxSystolic }}
          </div>
        </div>
        <div class="text-right">
          <div class="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Diastolic Range</div>
          <div class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {{ stats.minDiastolic }} - {{ stats.maxDiastolic }}
          </div>
        </div>
      </div>

      <div class="text-xs text-neutral-500 dark:text-neutral-400 text-center pt-2">
        Based on {{ stats.count }} reading{{ stats.count !== 1 ? 's' : '' }}
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-sm text-neutral-500 dark:text-neutral-400 py-4 text-center">
      No readings yet. Add your first reading to see statistics.
    </div>
  </div>
</template>
