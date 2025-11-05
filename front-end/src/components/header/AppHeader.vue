<script setup lang="ts">
import { RouterLink } from 'vue-router'
import ThemeToggle from '../theme-toggle/ThemeToggle.vue'
import LogoImage from '../logo-image/LogoImage.vue'
import NavBar from '../nav-bar/NavBar.vue'
</script>

<template>
  <header
    class="w-full bg-neutral-200 dark:bg-neutral-950 shadow-md sticky top-0 z-50 border-b border-neutral-300 dark:border-neutral-800"
  >
    <div class="w-full px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center gap-8">
          <RouterLink to="/" class="flex items-center gap-4">
            <LogoImage />
            <h3
              class="text-neutral-900 dark:text-neutral-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              BP Tracker
            </h3>
          </RouterLink>
          <NavBar />
        </div>
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>
