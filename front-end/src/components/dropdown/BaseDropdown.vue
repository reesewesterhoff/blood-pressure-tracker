<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  /** Whether the dropdown is open */
  isOpen: boolean
  /** Horizontal alignment: 'left' or 'right' */
  align?: 'left' | 'right'
  /** Vertical offset from trigger (Tailwind margin-top class) */
  offset?: 'mt-1' | 'mt-2' | 'mt-3' | 'mt-4' | 'mt-5' | 'mt-6'
  /** Width of the dropdown */
  width?: 'w-32' | 'w-40' | 'w-48' | 'w-56' | 'w-64' | 'w-72' | 'w-80'
  /** Additional CSS classes */
  customClass?: string
}

interface Emits {
  (e: 'close'): void
}

withDefaults(defineProps<Props>(), {
  align: 'right',
  offset: 'mt-3',
  width: 'w-48',
})

const emit = defineEmits<Emits>()

const dropdownRef = ref<HTMLElement | null>(null)

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <transition
    enter-active-class="transition ease-out duration-100"
    enter-from-class="transform opacity-0 scale-95"
    enter-to-class="transform opacity-100 scale-100"
    leave-active-class="transition ease-in duration-75"
    leave-from-class="transform opacity-100 scale-100"
    leave-to-class="transform opacity-0 scale-95"
  >
    <div
      v-if="isOpen"
      ref="dropdownRef"
      :class="[
        'absolute top-full',
        align === 'right' ? 'right-0' : 'left-0',
        offset,
        width,
        'rounded-md shadow-lg bg-white dark:bg-neutral-800 ring-1 ring-black ring-opacity-5 dark:ring-neutral-700 focus:outline-none z-50',
        customClass,
      ]"
      role="menu"
      aria-orientation="vertical"
      v-bind="$attrs"
    >
      <slot />
    </div>
  </transition>
</template>
