<script setup lang="ts">
import { ref } from 'vue'
import BaseInput from '@/components/input/BaseInput.vue'
import type { BloodPressureReading } from '@/types/BloodPressure'

const emit = defineEmits<{
  submit: [reading: BloodPressureReading]
}>()

const systolic = ref('')
const diastolic = ref('')

function handleSubmit() {
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
</script>

<template>
  <form
    class="w-full max-w-xl p-10 rounded-xl bg-white dark:bg-neutral-800 shadow-lg flex flex-col gap-6"
    @submit.prevent="handleSubmit"
  >
    <h1 class="text-2xl text-center text-neutral-900 dark:text-neutral-100">Log Blood Pressure</h1>
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
      class="w-full py-2.5 rounded-md bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 dark:focus:ring-offset-neutral-800"
    >
      Submit Reading
    </button>
  </form>
</template>
