<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, Loader2 } from 'lucide-vue-next'
import BaseInput from '@/components/input/BaseInput.vue'
import ToastContainer from '@/components/toast/ToastContainer.vue'
import { authApi, ApiError } from '@/services/api'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { toasts, showSuccess, showError, removeToast } = useToast()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const showPassword = ref(false)

async function handleSubmit() {
  if (isLoading.value) return

  // Basic validation
  if (!email.value || !password.value) {
    showError('Please enter both email and password.')
    return
  }

  isLoading.value = true

  try {
    await authApi.login(email.value, password.value)
    showSuccess('Logged in successfully!')
    // Redirect to home page after successful login
    setTimeout(() => {
      router.push('/')
    }, 500)
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        showError('Invalid email or password. Please try again.')
      } else if (error.status === 0) {
        showError('Unable to connect to the server. Please check your connection.')
      } else {
        showError(error.message || 'Login failed. Please try again.')
      }
    } else {
      showError('An unexpected error occurred. Please try again.')
      console.error('Unexpected error:', error)
    }
  } finally {
    isLoading.value = false
  }
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div
        class="p-8 sm:p-10 rounded-xl bg-white dark:bg-neutral-800 shadow-lg border border-neutral-200 dark:border-neutral-700"
      >
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Welcome Back
          </h1>
          <p class="text-neutral-600 dark:text-neutral-400">
            Sign in to track your blood pressure readings
          </p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Email Input -->
          <div>
            <BaseInput
              v-model="email"
              label="Email"
              type="email"
              placeholder="Enter your email"
              autocomplete="email"
              required
              :disabled="isLoading"
              aria-describedby="email-help"
            />
            <p id="email-help" class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              We'll never share your email with anyone else.
            </p>
          </div>

          <!-- Password Input -->
          <div>
            <div class="relative">
              <BaseInput
                v-model="password"
                label="Password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                autocomplete="current-password"
                required
                :disabled="isLoading"
                aria-describedby="password-help"
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                :disabled="isLoading"
                class="absolute right-3 top-9 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 rounded p-1 transition-colors"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
              >
                <EyeOff v-if="showPassword" />
                <Eye v-else />
              </button>
            </div>
            <p id="password-help" class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Must be at least 8 characters long.
            </p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3 rounded-md bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600 shadow-sm hover:shadow-md"
          >
            <span v-if="isLoading" class="flex items-center justify-center gap-2">
              <Loader2 class="animate-spin" />
              Signing in...
            </span>
            <span v-else>Sign In</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-neutral-300 dark:border-neutral-600"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
              New to Blood Pressure Tracker?
            </span>
          </div>
        </div>

        <!-- Register Link -->
        <div class="text-center">
          <p class="text-sm text-neutral-600 dark:text-neutral-400">
            Don't have an account?
            <router-link
              to="/register"
              class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 rounded"
            >
              Sign up here
            </router-link>
          </p>
        </div>
      </div>

      <!-- Toast Container -->
      <ToastContainer :toasts="toasts" :on-dismiss="removeToast" />
    </div>
  </div>
</template>
