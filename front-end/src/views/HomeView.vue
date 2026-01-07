<script setup lang="ts">
import { ref } from 'vue'
import BloodPressureForm from '@/components/forms/BloodPressureForm.vue'
import BloodPressureHistory from '@/components/history/BloodPressureHistory.vue'
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
  <div class="container mx-auto p-4 h-full flex flex-col flex-1 min-h-0">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto flex-1 w-full">
      <!-- Left Column: Blood Pressure Form -->
      <div class="flex justify-center">
        <BloodPressureForm @submit="handleSubmit" :disabled="isLoading" />
      </div>

      <!-- Right Column: History Section -->
      <BloodPressureHistory />
    </div>
  </div>
</template>
