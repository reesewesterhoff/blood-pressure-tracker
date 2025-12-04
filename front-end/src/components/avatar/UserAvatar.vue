<script setup lang="ts">
import type { User } from '@/types/User'
import { computed } from 'vue'

interface Props {
  user: User
}

const props = defineProps<Props>()

const initials = computed(() => {
  const first = props.user.firstName?.[0]?.toUpperCase() || ''
  const last = props.user.lastName?.[0]?.toUpperCase() || ''
  return first + last || 'U'
})

const hasImage = computed(() => !!props.user.image)
</script>

<template>
  <button
    type="button"
    class="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden bg-primary-600 dark:bg-primary-500 text-white hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
    :aria-label="`User menu for ${user.firstName}`"
  >
    <img
      v-if="hasImage"
      :src="user.image"
      :alt="`${user.firstName} ${user.lastName || ''}`.trim()"
      class="w-full h-full object-cover"
    />
    <span v-else class="text-sm font-medium">{{ initials }}</span>
  </button>
</template>
