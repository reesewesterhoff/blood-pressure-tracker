<script setup lang="ts">
interface Props {
  systolic: number
  diastolic: number
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'sm',
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

const status = getBloodPressureStatus(props.systolic, props.diastolic)

const sizeClasses = {
  sm: 'px-3 py-1 text-xs font-medium w-20',
  md: 'px-4 py-2 text-sm font-medium',
}
</script>

<template>
  <div class="rounded-full text-center" :class="[status.class, sizeClasses[size]]">
    {{ status.label }}
  </div>
</template>
