<script setup lang="ts">
import BaseToast from './BaseToast.vue'
import type { Toast as ToastType } from '@/composables/useToast'

interface ToastContainerProps {
  toasts: ToastType[]
  onDismiss: (id: string) => void
}

defineProps<ToastContainerProps>()
</script>

<template>
  <TransitionGroup name="toast" tag="div" class="flex flex-col items-center gap-4 w-full">
    <BaseToast
      v-for="toast in toasts"
      :key="toast.id"
      :message="toast.message"
      :type="toast.type"
      :duration="toast.duration"
      :dismissable="toast.dismissable"
      :on-dismiss="() => onDismiss(toast.id)"
    />
  </TransitionGroup>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
