import { ref } from 'vue'
import type { ToastType } from '@/components/toast/BaseToast.vue'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
  dismissable?: boolean
}

const toasts = ref<Toast[]>([])

/**
 * Composable for managing toast notifications
 */
export function useToast() {
  /**
   * Show a toast notification
   */
  function showToast(
    message: string,
    type: ToastType = 'info',
    options?: {
      duration?: number
      dismissable?: boolean
    },
  ) {
    const toast: Toast = {
      id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      message,
      type,
      duration: options?.duration ?? 5000,
      dismissable: options?.dismissable ?? true,
    }

    toasts.value.push(toast)

    return toast.id
  }

  /**
   * Show a success toast
   */
  function showSuccess(message: string, options?: { duration?: number; dismissable?: boolean }) {
    return showToast(message, 'success', options)
  }

  /**
   * Show an error toast
   */
  function showError(message: string, options?: { duration?: number; dismissable?: boolean }) {
    return showToast(message, 'error', options)
  }

  /**
   * Show an info toast
   */
  function showInfo(message: string, options?: { duration?: number; dismissable?: boolean }) {
    return showToast(message, 'info', options)
  }

  /**
   * Show a warning toast
   */
  function showWarning(message: string, options?: { duration?: number; dismissable?: boolean }) {
    return showToast(message, 'warning', options)
  }

  /**
   * Remove a toast by ID
   */
  function removeToast(id: string) {
    const index = toasts.value.findIndex((toast) => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  /**
   * Clear all toasts
   */
  function clearToasts() {
    toasts.value = []
  }

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeToast,
    clearToasts,
  }
}
