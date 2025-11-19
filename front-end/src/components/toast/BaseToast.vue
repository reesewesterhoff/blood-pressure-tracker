<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { CircleCheck, CircleX, TriangleAlert, Info, X } from 'lucide-vue-next'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  /** The message to display in the toast */
  message: string
  /** The type of toast, determines color scheme */
  type?: ToastType
  /** Duration in milliseconds before auto-dismissing. Set to 0 or negative to disable auto-dismiss */
  duration?: number
  /** Whether the toast can be manually dismissed */
  dismissable?: boolean
  /** Callback function called when the toast is dismissed */
  onDismiss?: () => void
}

const props = withDefaults(defineProps<ToastProps>(), {
  type: 'info',
  duration: 5000,
  dismissable: true,
  onDismiss: undefined,
})

const TOAST_STYLES = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-800 dark:text-green-200',
    icon: 'text-green-600 dark:text-green-400',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-200',
    icon: 'text-red-600 dark:text-red-400',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-800 dark:text-yellow-200',
    icon: 'text-yellow-600 dark:text-yellow-400',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-200',
    icon: 'text-blue-600 dark:text-blue-400',
  },
} as const

const typeStyles = computed(() => TOAST_STYLES[props.type])
const timeoutId = ref<ReturnType<typeof setTimeout> | null>(null)

function dismiss() {
  if (timeoutId.value) {
    clearTimeout(timeoutId.value)
    timeoutId.value = null
  }
  props.onDismiss?.()
}

onMounted(() => {
  if (props.duration > 0) {
    timeoutId.value = setTimeout(() => {
      dismiss()
    }, props.duration)
  }
})

onUnmounted(() => {
  if (timeoutId.value) {
    clearTimeout(timeoutId.value)
  }
})
</script>

<template>
  <div
    :class="[
      'w-full max-w-xl p-4 rounded-lg border',
      typeStyles.bg,
      typeStyles.border,
      'flex items-start gap-3',
    ]"
    role="alert"
    :aria-live="type === 'error' ? 'assertive' : 'polite'"
  >
    <!-- Icon -->
    <div :class="['shrink-0', typeStyles.icon]">
      <CircleCheck v-if="type === 'success'" />
      <CircleX v-else-if="type === 'error'" />
      <TriangleAlert v-else-if="type === 'warning'" />
      <Info v-else />
    </div>

    <!-- Message -->
    <p :class="['flex-1 text-sm font-medium', typeStyles.text]">
      {{ message }}
    </p>

    <!-- Dismiss Button -->
    <button
      v-if="dismissable"
      type="button"
      @click="dismiss"
      :class="[
        'shrink-0 p-1 rounded-md',
        'text-neutral-400 dark:text-neutral-500',
        'hover:text-neutral-600 dark:hover:text-neutral-300',
        'hover:bg-neutral-100 dark:hover:bg-neutral-700',
        'focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50',
        'transition-colors duration-200',
      ]"
      aria-label="Dismiss notification"
    >
      <X class="w-4 h-4" />
    </button>
  </div>
</template>
