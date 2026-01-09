<script setup lang="ts">
import { ref } from 'vue'
import BaseInput from '@/components/input/BaseInput.vue'
import AverageBloodPressure from '@/components/stats/AverageBloodPressure.vue'
import type { BloodPressureReading } from '@/types/BloodPressure'

interface Props {
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  submit: [reading: BloodPressureReading]
}>()

const systolic = ref('')
const diastolic = ref('')
const averageStatsRef = ref<InstanceType<typeof AverageBloodPressure> | null>(null)

function handleSubmit() {
  if (props.disabled) {
    return
  }

  const systolicValue = Number.parseInt(systolic.value, 10)
  const diastolicValue = Number.parseInt(diastolic.value, 10)

  if (Number.isNaN(systolicValue) || Number.isNaN(diastolicValue)) {
    return
  }

  emit('submit', {
    systolic: systolicValue,
    diastolic: diastolicValue,
  })

  systolic.value = ''
  diastolic.value = ''
}

function refreshStats() {
  averageStatsRef.value?.refresh()
}

// Expose refreshStats so parent can refresh stats after successful submission
defineExpose({
  refreshStats,
})
</script>

<template>
  <div class="flex justify-center">
    <form
      class="w-full max-w-xl p-10 rounded-xl bg-white dark:bg-neutral-800 shadow-lg flex flex-col gap-6 md:h-full"
      @submit.prevent="handleSubmit"
    >
      <h2 class="text-2xl text-center text-neutral-900 dark:text-neutral-100">
        Log Blood Pressure
      </h2>
      <div class="space-y-3">
        <BaseInput
          v-model="systolic"
          label="Systolic (mmHg)"
          placeholder="e.g. 120"
          type="number"
          required
          autocomplete="off"
          aria-describedby="systolic-help"
        />
        <p id="systolic-help" class="text-xs text-neutral-500 dark:text-neutral-400">
          Systolic is the top number in your reading.
        </p>
      </div>
      <div class="space-y-3">
        <BaseInput
          v-model="diastolic"
          label="Diastolic (mmHg)"
          placeholder="e.g. 80"
          type="number"
          required
          autocomplete="off"
          aria-describedby="diastolic-help"
        />
        <p id="diastolic-help" class="text-xs text-neutral-500 dark:text-neutral-400">
          Diastolic is the bottom number in your reading.
        </p>
      </div>
      <button
        type="submit"
        :disabled="disabled"
        class="w-full py-2.5 rounded-md bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600"
      >
        {{ disabled ? 'Submitting...' : 'Submit Reading' }}
      </button>

      <AverageBloodPressure ref="averageStatsRef" />
    </form>
  </div>
</template>
