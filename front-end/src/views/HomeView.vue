<script setup lang="ts">
import { ref } from 'vue'
import BloodPressureForm from '@/components/forms/BloodPressureForm.vue'
import ToastContainer from '@/components/toast/ToastContainer.vue'
import type { BloodPressureReading } from '@/types/BloodPressure'
import { readingsApi, ApiError } from '@/services/api'
import { useToast } from '@/composables/useToast'

const isLoading = ref(false)
const { toasts, showSuccess, showError, removeToast } = useToast()

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
  <div class="flex flex-col items-center justify-center p-4 gap-4">
    <BloodPressureForm @submit="handleSubmit" :disabled="isLoading" />
    <ToastContainer :toasts="toasts" :on-dismiss="removeToast" />
  </div>
</template>
