<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  size: 'md',
})

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-4',
}
</script>

<template>
  <div class="flex justify-center items-center">
    <div
      class="border-neutral-300 dark:border-neutral-600 border-t-neutral-900 dark:border-t-neutral-100 rounded-full animate-spin"
      :class="sizeClasses[size]"
    />
  </div>
</template>
