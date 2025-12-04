/**
 * Authentication Store
 *
 * Manages user authentication state and session validation.
 * Uses cookie-based authentication with the backend.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, ApiError } from '@/services/api'
import type { User } from '@/types/User'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isCheckingAuth = ref(false)
  const isAuthenticated = ref(false)
  let authCheckPromise: Promise<boolean> | null = null

  // Getters
  const currentUser = computed(() => user.value)
  const isLoggedIn = computed(() => isAuthenticated.value && user.value !== null)

  /**
   * Check if the user has a valid session by calling the backend
   */
  async function checkAuth(): Promise<boolean> {
    // If already checking, return the existing promise
    if (authCheckPromise) {
      return authCheckPromise
    }

    isCheckingAuth.value = true

    // Create and store the promise
    authCheckPromise = (async () => {
      try {
        const response = await authApi.getCurrentUser()

        if (response.success && response.data) {
          user.value = response.data
          isAuthenticated.value = true
          return true
        } else {
          // No valid session
          user.value = null
          isAuthenticated.value = false
          return false
        }
      } catch (error) {
        // If it's a 401, user is not authenticated
        if (error instanceof ApiError && error.status === 401) {
          user.value = null
          isAuthenticated.value = false
          return false
        }

        // For other errors (network, etc.), we'll assume not authenticated
        // but log the error for debugging
        console.error('Auth check failed:', error)
        user.value = null
        isAuthenticated.value = false
        return false
      } finally {
        isCheckingAuth.value = false
        authCheckPromise = null
      }
    })()

    return authCheckPromise
  }

  /**
   * Set the authenticated user (used after login/register)
   */
  function setUser(userData: User) {
    user.value = userData
    isAuthenticated.value = true
  }

  /**
   * Clear authentication state (used after logout)
   */
  function clearAuth() {
    user.value = null
    isAuthenticated.value = false
  }

  /**
   * Logout the current user
   */
  async function logout(): Promise<void> {
    try {
      await authApi.logout()
    } catch (error) {
      // Even if logout fails on backend, clear local state
      console.error('Logout error:', error)
    } finally {
      clearAuth()
    }
  }

  return {
    // State
    user,
    isCheckingAuth,
    isAuthenticated,
    // Getters
    currentUser,
    isLoggedIn,
    // Actions
    checkAuth,
    setUser,
    clearAuth,
    logout,
  }
})
