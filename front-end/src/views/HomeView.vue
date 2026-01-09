<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BloodPressureForm from '@/components/forms/BloodPressureForm.vue'
import BloodPressureHistory from '@/components/history/BloodPressureHistory.vue'
import type { BloodPressureReading } from '@/types/BloodPressure'
import { readingsApi, ApiError } from '@/services/api'
import { useToast } from '@/composables/useToast'

const isLoading = ref(false)
const isLoadingHistory = ref(false)
const readings = ref<BloodPressureReading[]>([])
const formRef = ref<InstanceType<typeof BloodPressureForm> | null>(null)
const { showSuccess, showError } = useToast()

async function loadReadings() {
  isLoadingHistory.value = true
  try {
    const response = await readingsApi.getBloodPressureReadings()
    if (response.data) {
      readings.value = response.data
    }
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        // User not authenticated - this is expected if not logged in
        readings.value = []
      } else {
        showError('Failed to load blood pressure history.')
      }
    } else {
      showError('An unexpected error occurred while loading history.')
      console.error('Unexpected error:', error)
    }
  } finally {
    isLoadingHistory.value = false
  }
}

onMounted(() => {
  loadReadings()
})

async function handleSubmit(reading: BloodPressureReading) {
  isLoading.value = true

  try {
    await readingsApi.createBloodPressureReading(reading)
    showSuccess('Blood pressure reading saved successfully!')
    // Reload readings to show the new one
    await loadReadings()
    // Refresh average stats
    formRef.value?.refreshStats()
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
  <div class="container p-4 md:h-full flex flex-col min-h-0 mx-auto md:pb-4">
    <div
      class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto md:flex-1 w-full md:min-h-0"
    >
      <!-- Left Column: Blood Pressure Form -->
      <BloodPressureForm ref="formRef" @submit="handleSubmit" :disabled="isLoading" />

      <!-- Right Column: History Section -->
      <BloodPressureHistory :readings="readings" :is-loading="isLoadingHistory" />
    </div>
  </div>
</template>
