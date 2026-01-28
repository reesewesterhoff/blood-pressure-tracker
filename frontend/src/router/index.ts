import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '../stores/auth'

export const routes = [
  {
    path: '/',
    name: 'home',
    displayName: 'Home',
    component: HomeView,
    meta: { requiresAuth: true },
  },
  {
    path: '/history',
    name: 'history',
    displayName: 'History',
    component: () => import('../views/HistoryView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'login',
    displayName: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'register',
    displayName: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { requiresGuest: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

/**
 * Navigation guard to check authentication before accessing protected routes
 */
router.beforeEach(
  async (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    const authStore = useAuthStore()

    // Ensure authentication status is checked
    // checkAuth() handles concurrent calls internally, so it's safe to call multiple times
    if (!authStore.isLoggedIn) {
      await authStore.checkAuth()
    }

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
    const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)

    // If route requires authentication and user is not authenticated
    if (requiresAuth && !authStore.isLoggedIn) {
      // Redirect to login, preserving the intended destination
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }

    // If route requires guest (login/register) and user is already authenticated
    if (requiresGuest && authStore.isLoggedIn) {
      // Redirect to home
      next({ name: 'home' })
      return
    }

    // Allow navigation
    next()
  },
)

export default router
