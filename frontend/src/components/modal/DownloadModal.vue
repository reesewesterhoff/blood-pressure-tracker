<script setup lang="ts">
import { EllipsisVertical, MonitorDown, X } from 'lucide-vue-next'

interface Props {
  open: boolean
}

interface Emits {
  (e: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function close() {
  emit('close')
}

function onBackdropClick(event: MouseEvent) {
  if ((event.target as HTMLElement).dataset.backdrop === 'true') {
    close()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        data-backdrop="true"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-modal-title"
        @click="onBackdropClick"
      >
        <div
          v-if="open"
          class="flex max-h-[calc(100vh-2rem)] max-w-lg flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl"
          @click.stop
        >
          <header
            class="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 p-5"
          >
            <h2
              id="download-modal-title"
              class="text-xl font-semibold text-neutral-900 dark:text-neutral-100"
            >
              Download the app
            </h2>
            <button
              type="button"
              class="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
              aria-label="Close"
              @click="close"
            >
              <X class="size-5" />
            </button>
          </header>

          <div class="overflow-y-auto p-5 flex flex-col gap-6">
            <div class="flex flex-col gap-3">
              <h4 class="uppercase text-neutral-500 dark:text-neutral-400">On mobile (phone)</h4>
              <div
                class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-4 flex flex-col gap-2"
              >
                <p class="font-medium text-neutral-900 dark:text-neutral-100">Android (Chrome)</p>
                <ol class="text-sm text-neutral-600 dark:text-neutral-300 list-decimal list-inside">
                  <li>
                    Tap the
                    <EllipsisVertical class="size-4 inline" aria-hidden="true" />
                    in the top-right corner
                  </li>
                  <li>
                    Scroll down and tap <strong>Add to Home screen</strong> or
                    <strong>Install app</strong>
                  </li>
                  <li>Confirm by tapping <strong>Install</strong></li>
                </ol>
              </div>
              <div
                class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-4 flex flex-col gap-2"
              >
                <p class="font-medium text-neutral-900 dark:text-neutral-100">iPhone (Safari)</p>
                <ol class="text-sm text-neutral-600 dark:text-neutral-300 list-decimal list-inside">
                  <li>Tap the Share button at the bottom of the screen</li>
                  <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
                  <li>Tap <strong>Add</strong> in the top-right corner</li>
                </ol>
              </div>
            </div>

            <div class="flex flex-col gap-3">
              <h4 class="uppercase text-neutral-500 dark:text-neutral-400">
                On computer or tablet
              </h4>
              <div
                class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-4 flex flex-col gap-2"
              >
                <p class="font-medium text-neutral-900 dark:text-neutral-100">
                  Chrome, Edge, or other Chromium browsers
                </p>
                <ol class="text-sm text-neutral-600 dark:text-neutral-300 list-decimal list-inside">
                  <li>
                    Find the install icon in the address bar (<MonitorDown
                      class="size-4 inline"
                      aria-hidden="true"
                    />
                    or similar icon)
                  </li>
                  <li>Click it, then click <strong>Install</strong></li>
                  <li>
                    <strong>Or</strong> click the
                    <EllipsisVertical class="size-4 inline" aria-hidden="true" />
                    in the top-right corner → <strong>Cast, save, and share</strong> →
                    <strong>Install Blood Pressure Tracker...</strong>
                  </li>
                </ol>
              </div>
              <div
                class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-4 flex flex-col gap-2"
              >
                <p class="font-medium text-neutral-900 dark:text-neutral-100">Safari (Mac)</p>
                <ol class="text-sm text-neutral-600 dark:text-neutral-300 list-decimal list-inside">
                  <li>Go to <strong>File</strong> → <strong>Add to Dock</strong></li>
                  <li>The app will appear in your Dock for quick access</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
