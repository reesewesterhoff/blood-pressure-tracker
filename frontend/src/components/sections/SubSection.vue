<script setup lang="ts">
interface Props {
  title: string
  description: string
}

defineProps<Props>()
</script>

<template>
  <div
    class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4"
  >
    <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
      {{ title }}
    </h3>
    <p class="text-sm text-neutral-600 dark:text-neutral-300">
      {{ description }}
    </p>
  </div>
</template>
