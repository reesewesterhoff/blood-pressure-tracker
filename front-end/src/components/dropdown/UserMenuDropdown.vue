<script setup lang="ts">
import type { User } from '@/types/User'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseDropdown from '../dropdown/BaseDropdown.vue'

interface Props {
  user: User
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const router = useRouter()
const authStore = useAuthStore()

async function handleLogout() {
  await authStore.logout()
  emit('close')
  router.push({ name: 'login' })
}
</script>

<template>
  <BaseDropdown :is-open="isOpen" @close="emit('close')" aria-labelledby="user-menu-button">
    <div class="py-1" role="none">
      <div
        class="px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-700"
      >
        <p class="font-medium">{{ user.firstName }} {{ user.lastName || '' }}</p>
        <p v-if="user.email" class="text-xs text-neutral-500 dark:text-neutral-400 truncate">
          {{ user.email }}
        </p>
      </div>
      <button
        @click.stop="handleLogout"
        class="w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        role="menuitem"
      >
        Logout
      </button>
    </div>
  </BaseDropdown>
</template>
