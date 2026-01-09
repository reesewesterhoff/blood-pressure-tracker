<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from './components/header/AppHeader.vue'
import AppFooter from './components/footer/AppFooter.vue'
import ToastContainer from './components/toast/ToastContainer.vue'
import { useToast } from './composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<template>
  <div
    class="min-h-screen md:h-screen flex flex-col md:overflow-hidden bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
  >
    <AppHeader />
    <main class="flex-1 px-4 sm:px-6 lg:px-8 py-8 flex flex-col min-h-0">
      <RouterView class="flex-1 min-h-0 flex flex-col items-center w-full" />
    </main>
    <AppFooter />
    <!-- Global Toast Container -->
    <div class="fixed bottom-15 right-5 z-50 pointer-events-none max-w-md w-full px-4 sm:px-0">
      <div class="pointer-events-auto">
        <ToastContainer :toasts="toasts" :on-dismiss="removeToast" />
      </div>
    </div>
  </div>
</template>
