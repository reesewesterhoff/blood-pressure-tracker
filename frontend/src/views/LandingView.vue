<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Download } from 'lucide-vue-next'
import SubSection from '@/components/sections/SubSection.vue'
import DownloadModal from '@/components/modal/DownloadModal.vue'

const showDownloadModal = ref(false)

const siteUrl = import.meta.env.VITE_APP_URL || window.location.origin

const highlights = [
  {
    title: 'Track readings in seconds',
    description: 'Log blood pressure quickly from any device.',
  },
  {
    title: 'See trends at a glance',
    description: 'Review history and spot patterns.',
  },
  {
    title: 'Private by design',
    description: 'Your data is secure behind authenticated access.',
  },
]

const structuredData = computed(() =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Blood Pressure Tracker',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    description:
      'Track, review, and understand your blood pressure readings with clear trends and history.',
    url: siteUrl,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }),
)
</script>

<template>
  <section class="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
    <component :is="'script'" type="application/ld+json">
      {{ structuredData }}
    </component>

    <div class="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-center">
      <div class="flex flex-col gap-5 text-center lg:text-left">
        <div class="flex flex-col gap-3">
          <h1 class="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-neutral-100">
            Stay on top of your blood pressure with clear, organized tracking.
          </h1>
          <p class="text-lg text-neutral-600 dark:text-neutral-300">
            Log readings, review trends, and keep a secure history.
          </p>
        </div>
        <div class="flex flex-wrap gap-3 justify-center lg:justify-start">
          <RouterLink
            to="/register"
            class="px-5 py-3 rounded-md bg-primary-600 hover:bg-primary-500 text-white font-semibold transition-colors"
          >
            Get started free
          </RouterLink>
          <RouterLink
            to="/login"
            class="px-5 py-3 rounded-md border border-primary-300 dark:border-primary-600 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/40 hover:border-primary-400 dark:hover:border-primary-500 transition-colors font-semibold"
          >
            Sign in
          </RouterLink>
          <button
            type="button"
            class="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-primary-300 dark:border-primary-600 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/40 hover:border-primary-400 dark:hover:border-primary-500 transition-colors font-semibold"
            @click="showDownloadModal = true"
          >
            <Download class="size-4" />
            Download the app
          </button>
        </div>
        <div class="flex flex-col gap-2 text-sm text-neutral-500 dark:text-neutral-400">
          <span class="text-md font-semibold tracking-wide">100% free!</span>
          <span class="text-md font-semibold tracking-wide">Available on desktop and mobile.</span>
        </div>
      </div>

      <div
        class="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-6 flex flex-col gap-5"
      >
        <div class="flex flex-col gap-2">
          <h2 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Why use BP Tracker?
          </h2>
          <p class="text-neutral-600 dark:text-neutral-300">
            Designed for daily tracking without clutter. Capture the data that matters and review it
            easily.
          </p>
        </div>
        <div class="flex flex-col gap-3">
          <SubSection
            v-for="highlight in highlights"
            :key="highlight.title"
            :title="highlight.title"
            :description="highlight.description"
          />
        </div>
      </div>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <SubSection
        title="Create an account"
        description="Sign up in seconds and keep your readings private to your account."
      />
      <SubSection
        title="Review your history"
        description="Spot trends and share your progress with your healthcare provider."
      />
    </div>

    <div
      class="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-primary-600 text-white p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
    >
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-semibold">Ready to start tracking?</h2>
        <p class="text-primary-100">
          Create your account and keep all of your blood pressure readings in one place.
        </p>
      </div>
      <RouterLink
        to="/register"
        class="px-6 py-3 rounded-md bg-white text-primary-700 font-semibold hover:bg-primary-50 transition-colors text-center"
      >
        Create your account
      </RouterLink>
    </div>

    <DownloadModal :open="showDownloadModal" @close="showDownloadModal = false" />
  </section>
</template>
