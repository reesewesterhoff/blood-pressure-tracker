<script setup lang="ts">
import { useTheme } from '../../composables/useTheme'

const { isDark, toggle } = useTheme()
</script>

<template>
  <button
    @click="toggle"
    type="button"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <span v-if="isDark" class="text-lg">☀️</span>
    <span v-else class="text-lg">🌙</span>
  </button>
</template>
