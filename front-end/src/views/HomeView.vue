<script setup lang="ts">
import { ref } from 'vue'
import BloodPressureForm from '@/components/forms/BloodPressureForm.vue'
import type { BloodPressureReading } from '@/types/BloodPressure'
import { readingsApi, ApiError } from '@/services/api'
import { useToast } from '@/composables/useToast'

const isLoading = ref(false)
const { showSuccess, showError } = useToast()

async function handleSubmit(reading: BloodPressureReading) {
  isLoading.value = true

  try {
    await readingsApi.createBloodPressureReading(reading)
    showSuccess('Blood pressure reading saved successfully!')
  } catch (error) {
    if (error instanceof ApiError) {
      // Handle API-specific errors
      if (error.status === 401) {
        showError('Please log in to save readings.')
      } else if (error.status === 400) {
        showError(error.message || 'Invalid reading values. Please check your input.')
      } else if (error.status === 0) {
        showError('Unable to connect to the server. Please check your connection.')
      } else {
        showError(error.message || 'Failed to save reading. Please try again.')
      }
    } else {
      // Handle unexpected errors
      showError('An unexpected error occurred. Please try again.')
      console.error('Unexpected error:', error)
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="container mx-auto p-4 h-full flex flex-col">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto flex-1 w-full">
      <!-- Left Column: Blood Pressure Form -->
      <div class="flex justify-center">
        <BloodPressureForm @submit="handleSubmit" :disabled="isLoading" />
      </div>

      <!-- Right Column: History Section -->
      <div class="flex justify-center">
        <div
          class="w-full max-w-xl p-10 rounded-xl bg-white dark:bg-neutral-800 shadow-lg flex flex-col gap-6 h-full"
        >
          <h2 class="text-2xl text-center text-neutral-900 dark:text-neutral-100">
            Blood Pressure History
          </h2>
          <div class="flex-1 space-y-4 overflow-y-auto min-h-0">
            <!-- Mock reading items -->
            <div
              v-for="i in 5"
              :key="i"
              class="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600"
            >
              <div class="flex justify-between items-center">
                <div>
                  <div class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {{ 120 + i * 2 }}/{{ 80 + i }}
                  </div>
                  <div class="text-sm text-neutral-500 dark:text-neutral-400">
                    {{ new Date(Date.now() - i * 86400000).toLocaleDateString() }}
                  </div>
                </div>
                <div
                  class="px-3 py-1 rounded-full text-xs font-medium"
                  :class="
                    i % 3 === 0
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : i % 3 === 1
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  "
                >
                  {{ i % 3 === 0 ? 'Normal' : i % 3 === 1 ? 'Elevated' : 'High' }}
                </div>
              </div>
            </div>
          </div>
          <div class="text-center text-sm text-neutral-500 dark:text-neutral-400 shrink-0">
            Mock data - History feature coming soon
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
