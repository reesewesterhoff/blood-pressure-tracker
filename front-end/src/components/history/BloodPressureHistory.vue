<script setup lang="ts">
// History component for displaying blood pressure readings
</script>

<template>
  <div class="flex justify-center">
    <div
      class="w-full max-w-xl p-10 rounded-xl bg-white dark:bg-neutral-800 shadow-lg flex flex-col gap-6 h-full"
    >
      <h2 class="text-2xl text-center text-neutral-900 dark:text-neutral-100">
        Blood Pressure History
      </h2>
      <div class="flex-1 space-y-4 overflow-y-auto min-h-0">
        <!-- Mock reading items -->
        <div
          v-for="i in 5"
          :key="i"
          class="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600"
        >
          <div class="flex justify-between items-center">
            <div>
              <div class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {{ 120 + i * 2 }}/{{ 80 + i }}
              </div>
              <div class="text-sm text-neutral-500 dark:text-neutral-400">
                {{ new Date(Date.now() - i * 86400000).toLocaleDateString() }}
              </div>
            </div>
            <div
              class="px-3 py-1 rounded-full text-xs font-medium"
              :class="
                i % 3 === 0
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : i % 3 === 1
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              "
            >
              {{ i % 3 === 0 ? 'Normal' : i % 3 === 1 ? 'Elevated' : 'High' }}
            </div>
          </div>
        </div>
      </div>
      <div class="text-center text-sm text-neutral-500 dark:text-neutral-400 shrink-0">
        Mock data - History feature coming soon
      </div>
    </div>
  </div>
</template>
