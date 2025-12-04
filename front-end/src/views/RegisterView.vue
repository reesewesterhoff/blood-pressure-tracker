<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, Loader2 } from 'lucide-vue-next'
import BaseInput from '@/components/input/BaseInput.vue'
import GoogleIcon from '@/components/icons/GoogleIcon.vue'
import { authApi, ApiError } from '@/services/api'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { getGoogleAuthUrl } from '@/config/api'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const firstName = ref('')
const lastName = ref('')
const isLoading = ref(false)
const showPassword = ref(false)

async function handleSubmit() {
  if (isLoading.value) return

  // Basic validation
  if (!email.value || !password.value || !firstName.value) {
    toast.showError('Please enter email, password, and first name.')
    return
  }

  isLoading.value = true

  try {
    const response = await authApi.register(
      email.value,
      password.value,
      firstName.value,
      lastName.value || undefined,
    )

    console.log('helloooooooooooo', response)

    if (response.success && response.data) {
      // Update auth store with user data
      authStore.setUser(response.data)
      toast.showSuccess('Account created successfully!')
      // Redirect to home page after successful registration
      router.push('/')
    } else {
      toast.showError('Registration failed. Please try again.')
    }
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 400) {
        // Handle validation errors from backend
        let errorMessage = error.message || 'Registration failed. Please check your input.'
        if (error.response?.errors && Array.isArray(error.response.errors)) {
          errorMessage = error.response.errors.join(', ')
        }
        toast.showError(errorMessage)
      } else if (error.status === 0) {
        toast.showError('Unable to connect to the server. Please check your connection.')
      } else {
        toast.showError(error.message || 'Registration failed. Please try again.')
      }
    } else {
      toast.showError('An unexpected error occurred. Please try again.')
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
    <div
      class="w-full max-w-md p-8 rounded-xl bg-white dark:bg-neutral-800 shadow-lg border border-neutral-200 dark:border-neutral-700 flex flex-col gap-5"
    >
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Sign Up</h1>
        <p class="text-neutral-500 dark:text-neutral-400">
          Sign up to start tracking your blood pressure
        </p>
      </div>

      <!-- Registration Form -->
      <form @submit.prevent="handleSubmit" class="flex flex-col gap-5">
        <!-- First Name Input -->
        <div>
          <BaseInput
            v-model="firstName"
            label="First Name"
            type="text"
            placeholder="Enter first name (display name)"
            autocomplete="given-name"
            required
            :disabled="isLoading"
          />
        </div>

        <!-- Last Name Input -->
        <div>
          <BaseInput
            v-model="lastName"
            label="Last Name (Optional)"
            type="text"
            placeholder="Enter last name"
            autocomplete="family-name"
            :disabled="isLoading"
          />
        </div>

        <!-- Email Input -->
        <div>
          <BaseInput
            v-model="email"
            label="Email"
            type="email"
            placeholder="Enter email"
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
              placeholder="Enter password"
              autocomplete="new-password"
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

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-2 rounded-md bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600"
        >
          <span v-if="isLoading" class="flex items-center justify-center gap-2">
            <Loader2 class="animate-spin" />
            Creating account...
          </span>
          <span v-else>Sign Up</span>
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
        class="w-full flex items-center justify-center gap-3 py-2 px-4 rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50"
      >
        <GoogleIcon :size="20" />
        <span>Sign up with Google</span>
      </a>

      <!-- Sign In Link -->
      <div class="flex items-center justify-center text-sm">
        <span class="text-neutral-500 dark:text-neutral-400">Already have an account?</span>
        <router-link
          to="/login"
          class="pl-1 text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
        >
          Sign in
        </router-link>
      </div>
    </div>
  </div>
</template>
