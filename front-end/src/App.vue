<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from './components/header/AppHeader.vue'
import AppFooter from './components/footer/AppFooter.vue'
</script>

<template>
  <div
    class="min-h-screen flex flex-col bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
  >
    <AppHeader />
    <main class="flex-1 px-4 sm:px-6 lg:px-8 py-8">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>
