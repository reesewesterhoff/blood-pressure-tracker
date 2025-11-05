<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { routes } from '../../router'
</script>

<template>
  <nav class="flex space-x-4">
    <RouterLink
      v-for="route in routes"
      :key="route.name"
      :to="route.path"
      active-class="bg-primary-200/70 text-primary-900 dark:bg-primary-900/80 dark:text-primary-50"
      :class="[
        'px-3 py-2 rounded-md text-sm font-medium transition-colors',
        'text-neutral-700 dark:text-neutral-100 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800',
      ]"
    >
      {{ route.displayName }}
    </RouterLink>
  </nav>
</template>
