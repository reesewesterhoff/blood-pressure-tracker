<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, Loader2 } from 'lucide-vue-next'
import BaseInput from '@/components/input/BaseInput.vue'
import ToastContainer from '@/components/toast/ToastContainer.vue'
import GoogleIcon from '@/components/icons/GoogleIcon.vue'
import { authApi, ApiError } from '@/services/api'
import { useToast } from '@/composables/useToast'
import { getGoogleAuthUrl } from '@/config/api'

const router = useRouter()
const { toasts, showSuccess, showError, removeToast } = useToast()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)

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
  <div class="min-h-full flex justify-center p-4">
    <div class="w-full max-w-md flex flex-col gap-4">
      <div
        class="p-8 rounded-xl bg-white dark:bg-neutral-800 shadow-lg border border-neutral-200 dark:border-neutral-700 flex flex-col gap-4"
      >
        <!-- Header -->
        <div class="text-center">
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Welcome Back
          </h1>
          <p class="text-neutral-500 dark:text-neutral-400">
            Sign in to track your blood pressure readings
          </p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
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
            />
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
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                :disabled="isLoading"
                class="absolute right-3 top-6 text-neutral-500 dark:text-neutral-400 p-1 transition-colors"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
              >
                <EyeOff v-if="showPassword" />
                <Eye v-else />
              </button>
            </div>
          </div>

          <!-- Remember Me Checkbox -->
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="rememberMe"
              type="checkbox"
              :disabled="isLoading"
              class="h-4 w-4 rounded accent-primary-600 dark:accent-primary-500 cursor-pointer"
            />
            <label
              for="remember-me"
              class="pl-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer"
            >
              Remember me
            </label>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-2.5 rounded-md bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600"
          >
            <span v-if="isLoading" class="flex items-center justify-center gap-2">
              <Loader2 class="animate-spin" />
              Signing in...
            </span>
            <span v-else>Sign In</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-neutral-300 dark:border-neutral-600"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
              Or
            </span>
          </div>
        </div>

        <!-- Google Sign In Button -->
        <a
          :href="getGoogleAuthUrl()"
          class="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50"
        >
          <GoogleIcon :size="20" />
          <span>Sign in with Google</span>
        </a>

        <!-- Forgot Password and Sign Up Links -->
        <div class="flex items-center justify-between text-sm">
          <router-link
            to="/forgot-password"
            class="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
          >
            Forgot password?
          </router-link>
          <router-link
            to="/register"
            class="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
          >
            Sign up
          </router-link>
        </div>
      </div>

      <!-- Toast Container -->
      <ToastContainer :toasts="toasts" :on-dismiss="removeToast" />
    </div>
  </div>
</template>
